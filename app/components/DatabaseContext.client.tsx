import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  use,
} from 'react';
import {
  db,
  getDatabaseFile,
  getDatabaseInfo,
  overwriteDatabaseFile,
  sql,
} from '../../db/sqlocal.client.js';
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  type UseQueryOptions,
} from '@tanstack/react-query';
import { VERSION } from 'db/version.js';

// Initialize QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity, // SQLite data won't change unless we change it
      retry: false, // Don't retry failed queries automatically
    },
  },
});

const fetchDatabase = async () => {
  const response = await fetch('/sqlite.db');
  if (!response.ok) {
    throw new Error('Failed to fetch database');
  }

  if (response.body === null) {
    throw new Error('No database found');
  }

  await overwriteDatabaseFile(response.body, async () => {
    console.log('database overwritten');
  });
};

interface DatabaseContextType {
  db: typeof db;
  sql: typeof sql;
  initialized: boolean;
  error: Error | null;
}

export const DatabaseContext = createContext<DatabaseContextType | null>(null);

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function initializeDb() {
      try {
        try {
          if (initialized) {
            return;
          }

          const version = await sql`SELECT version FROM version LIMIT 1`;
          if (version[0].version === VERSION) {
            console.log('database is up to date');
            setInitialized(true);
            return; // no need to continue
          }

          await fetchDatabase();
          setInitialized(true);
        } catch (e) {
          console.error('Failed once', e);
          await fetchDatabase();
          setInitialized(true);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error('Failed to initialize database')
        );
      }
    }

    // Only run initialization on client
    if (typeof window !== 'undefined') {
      initializeDb();
    }
  }, []);

  if (error) {
    console.error(error);
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <DatabaseContext.Provider
        value={{
          db,
          sql,
          initialized: typeof window === 'undefined' ? false : initialized,
          error,
        }}
      >
        {children}
      </DatabaseContext.Provider>
    </QueryClientProvider>
  );
}

export function useDatabase() {
  const context = use(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
}

// Generic type for database queries
type DbQuery<TResult> = (opts: {
  db: typeof db;
  sql: typeof sql;
}) => Promise<TResult>;

export function useDbQuery<TResult>(
  key: unknown[],
  queryFn: DbQuery<TResult>,
  options?: Omit<UseQueryOptions<TResult, Error>, 'queryKey' | 'queryFn'>
) {
  const context = useDatabase();

  return useQuery({
    queryKey: key,
    queryFn: () => queryFn(context),
    enabled:
      typeof window !== 'undefined' &&
      context.initialized &&
      !!options?.enabled,
    ...options,
  });
}
