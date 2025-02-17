import { GameSearch } from '../components/GameSearch.js';

export default function IndexPage() {
  return (
    <GameSearch
      game=""
      title="Game Database Search"
      subtitle="Search through items and dialogues from FromSoftware games"
      allowGameChange={true}
    />
  );
}
