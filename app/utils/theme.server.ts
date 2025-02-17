import { createCookieSessionStorage } from '@remix-run/node';
import { createThemeSessionResolver } from 'remix-themes';

export type GameTheme = 'neutral' | 'elden-ring' | 'bloodborne';

const isProduction = process.env.NODE_ENV === 'production';

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: 'theme',
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secrets: ['s3cr3t'], // Replace with your actual secret
    ...(isProduction
      ? { domain: 'your-production-domain.com', secure: true }
      : {}),
  },
});

export const themeSessionResolver = createThemeSessionResolver(sessionStorage);

export function getThemeFromUrl(pathname: string): GameTheme {
  if (pathname.startsWith('/eldenring')) {
    return 'elden-ring';
  }
  if (pathname.startsWith('/bloodborne')) {
    return 'bloodborne';
  }
  return 'neutral';
}
