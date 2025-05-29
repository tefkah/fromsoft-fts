import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router';
import { useGameTheme } from './utils/theme.client.js';
import { DatabaseProvider } from './components/DatabaseContext.client.js';

import './tailwind.css';

import { Analytics } from '@vercel/analytics/remix';

export default function Root() {
  const theme = useGameTheme();

  return (
    <html lang="en" className={theme}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <DatabaseProvider>
          <Outlet />
        </DatabaseProvider>
        <ScrollRestoration />
        <Scripts />
        <Analytics />
      </body>
    </html>
  );
}
