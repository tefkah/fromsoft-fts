import { useLocation } from 'react-router';

export type GameTheme = 'neutral' | 'elden-ring' | 'bloodborne';

export function getThemeFromUrl(pathname: string): GameTheme {
  if (pathname.startsWith('/eldenring')) {
    return 'elden-ring';
  }
  if (pathname.startsWith('/bloodborne')) {
    return 'bloodborne';
  }
  return 'neutral';
}

export function useGameTheme(): GameTheme {
  const location = useLocation();
  return getThemeFromUrl(location.pathname);
}
