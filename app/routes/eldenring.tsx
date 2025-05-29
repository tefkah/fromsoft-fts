import { GameSearch } from '../components/GameSearch.js';
export const meta = () => {
  return [
    { title: 'Elden Ring Search' },
    {
      name: 'description',
      content:
        'Search through items and dialogues from Elden Ring and the DLC Shadow of the Erdtree',
    },
  ];
};

export default function EldenRingPage() {
  return (
    <GameSearch
      game="Elden Ring"
      title="Elden Ring Search"
      subtitle="Search through items and dialogues from Elden Ring and the DLC Shadow of the Erdtree"
    />
  );
}
