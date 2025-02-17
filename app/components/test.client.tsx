/* eslint-disable @typescript-eslint/no-explicit-any */
import { searchAll } from 'app/components/queries.client.js';
import {
  db,
  overwriteDatabaseFile,
  getDatabaseInfo,
} from '../../db/sqlocal.client.js';

import { useEffect, useState, useCallback } from 'react';

export function useDbQuery<Query extends (qb: typeof db) => Promise<any>>(
  query: Query
) {
  const [data, setData] = useState<Awaited<ReturnType<Query>> | null>(null);
  useEffect(() => {
    let mounted = true;
    query(db).then((result) => {
      if (mounted) {
        setData(result);
      }
    });
    return () => {
      mounted = false;
    };
  }, [query]);
  return data;
}

export function useNewlyOverwrittenDb() {
  const [state, setState] = useState<{
    loading: boolean;
    error: Error | null;
  }>({ loading: true, error: null });

  useEffect(() => {
    let mounted = true;

    async function fetchDb() {
      try {
        // check if the database is already up to date
        const info = await getDatabaseInfo();
        console.log(info);
        let isUpToDate = false;
        try {
          const item = await db.query.items.findFirst();
          console.log(item);
          if (item) {
            isUpToDate = true;
          }
        } catch (err) {
          console.error(err);
        }

        if (isUpToDate) {
          setState({ loading: false, error: null });
          return;
        }

        const dat = await fetch('/sqlite.db');
        if (!dat.ok) throw new Error('Failed to fetch database');
        const blob = await dat.blob();
        if (mounted) {
          await overwriteDatabaseFile(blob);
          setState({ loading: false, error: null });
        }
      } catch (err) {
        if (mounted) {
          setState({
            loading: false,
            error: err instanceof Error ? err : new Error('Unknown error'),
          });
        }
      }
    }

    fetchDb();

    return () => {
      mounted = false;
    };
  }, []);

  if (state.error) {
    // Instead of throwing, we return the error state
    return { loading: false, error: state.error };
  }

  return { loading: state.loading, error: null };
}

export function Test() {
  //   const info = use(getDatabaseInfo());
  //   if (info) {
  //     console.log(info);
  //   }
  const { loading, error } = useNewlyOverwrittenDb();
  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return <Body />;
}

function Body() {
  const { loading, error } = useNewlyOverwrittenDb();
  const query = useCallback(
    () =>
      //   db.query.items.findMany(),
      searchAll('malenia'),
    []
  );
  const items = useDbQuery(query);

  if (loading) return <div>Loading database...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>{JSON.stringify(items)}</div>;
}
