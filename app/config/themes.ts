export const gameThemes = {
  'Elden Ring': {
    primary: '#c5a572',
    secondary: '#a89782',
    background: '#0f0f0f',
    surface: '#1a1a1a',
    surfaceAlt: '#2a2a2a',
    shadow: 'rgba(197,165,114,0.2)',
    shadowHover: 'rgba(197,165,114,0.3)',
  },
  Bloodborne: {
    primary: '#8b0000',
    secondary: '#4a4a4a',
    background: '#1a1a1a',
    surface: '#2a2a2a',
    surfaceAlt: '#3a3a3a',
    shadow: 'rgba(139,0,0,0.2)',
    shadowHover: 'rgba(139,0,0,0.3)',
  },
  default: {
    primary: '#6b7280',
    secondary: '#4b5563',
    background: '#111827',
    surface: '#1f2937',
    surfaceAlt: '#374151',
    shadow: 'rgba(107,114,128,0.2)',
    shadowHover: 'rgba(107,114,128,0.3)',
  },
} as const;

export type GameTheme = keyof typeof gameThemes;

export const filterConfig = {
  itemTypes: [
    { value: 'weapon', label: 'Weapons' },
    { value: 'armor', label: 'Armor' },
    { value: 'talisman', label: 'Talismans' },
    { value: 'ash', label: 'Ashes of War' },
    { value: 'goods', label: 'Items' },
  ],
  contentTypes: [
    { value: 'item', label: 'Items' },
    { value: 'dialogue', label: 'Dialogue' },
  ],
  games: [
    { value: 'Elden Ring', label: 'Elden Ring' },
    { value: 'Bloodborne', label: 'Bloodborne' },
  ],
} as const;
