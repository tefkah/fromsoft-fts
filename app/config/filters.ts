export const filterConfig = {
  itemTypes: [
    { value: 'weapon', label: 'Weapons' },
    { value: 'armor', label: 'Armor' },
    { value: 'talisman', label: 'Talismans' },
    { value: 'ash', label: 'Ashes of War' },
    { value: 'goods', label: 'Items' },
    { value: 'spell', label: 'Spells' },
    { value: 'key', label: 'Key Items' },
  ],
  weaponTypes: [
    { value: 'melee:straight_sword', label: 'Straight Swords' },
    { value: 'melee:greatsword', label: 'Greatswords' },
    { value: 'melee:katana', label: 'Katanas' },
    { value: 'ranged:bow', label: 'Bows' },
    { value: 'magic:staff', label: 'Staves' },
    { value: 'magic:seal', label: 'Sacred Seals' },
  ],
  contentTypes: [
    { value: 'item', label: 'Items' },
    { value: 'dialogue', label: 'Dialogue' },
  ],
  games: [
    { value: 'Elden Ring', label: 'Elden Ring' },
    { value: 'Bloodborne', label: 'Bloodborne' },
  ],
  sortBy: [
    { value: 'relevance', label: 'Most Relevant' },
    { value: 'name', label: 'Name' },
    { value: 'type', label: 'Type' },
  ],
} as const;

export type FilterValues = {
  query: string;
  game?: string;
  itemType?: string;
  weaponType?: string;
  contentType?: string;
  sortBy?: string;
  page?: string;
};
