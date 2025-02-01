import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import {
  db,
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

// Initialize QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity, // SQLite data won't change unless we change it
      retry: false, // Don't retry failed queries automatically
    },
  },
});

interface DatabaseContextType {
  db: typeof db;
  sql: typeof sql;
  initialized: boolean;
  error: Error | null;
}

const DatabaseContext = createContext<DatabaseContextType | null>(null);

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function initializeDb() {
      try {
        try {
          await getDatabaseInfo();
          setInitialized(true);
          return;
        } catch {
          const response = await fetch('/sqlite.db');
          if (!response.ok) {
            throw new Error('Failed to fetch database');
          }
          const blob = await response.blob();
          await overwriteDatabaseFile(blob);
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

    initializeDb();
  }, []);

  if (error) {
    return <div>Failed to initialize database: {error.message}</div>;
  }

  if (!initialized) {
    return <div>Initializing database...</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <DatabaseContext.Provider value={{ db, sql, initialized, error }}>
        {children}
      </DatabaseContext.Provider>
    </QueryClientProvider>
  );
}

export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
}

// Generic type for database queries
type DbQuery<TResult> = (opts: {
  db: typeof import('../../db/sqlocal.client.js').db;
  sql: typeof import('../../db/sqlocal.client.js').sql;
}) => Promise<TResult>;

// Hook for database queries using React Query
export function useDbQuery<TResult>(
  queryKey: string | readonly unknown[],
  queryFn: DbQuery<TResult>,
  options?: Omit<UseQueryOptions<TResult, Error>, 'queryKey' | 'queryFn'>
) {
  const { db, sql } = useDatabase();

  return useQuery({
    queryKey: Array.isArray(queryKey) ? queryKey : [queryKey],
    queryFn: () => queryFn({ db, sql }),
    ...options,
  });
}
