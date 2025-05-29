import { GameSearch } from '../components/GameSearch.js';

export const meta = () => {
  return [
    { title: 'Bloodborne/Elden Ring Search' },
    {
      name: 'description',
      content:
        'Search through items and dialogues from Bloodborne and Elden Ring',
    },
  ];
};

export default function IndexPage() {
  return (
    <GameSearch
      game=""
      title="Bloodborne/Elden Ring Search"
      subtitle="Make quick, full text searches through items and dialogues from Bloodborne and Elden Ring"
      allowGameChange={true}
    />
  );
}
