import { DatabaseProvider, useDbQuery } from './DatabaseContext.client.js';
import {} from './test.client.js';

export function Best() {
  return (
    <DatabaseProvider>
      <Bod />
    </DatabaseProvider>
  );
}

function Bod() {
  const items = useDbQuery('itemss', (db) =>
    db.query.items.findMany({
      limit: 10,
    })
  );
  return (
    <div>
      <pre>{JSON.stringify(items.data, null, 2)}</pre>
    </div>
  );
}
