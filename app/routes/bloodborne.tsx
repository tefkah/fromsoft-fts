import { GameSearch } from '../components/GameSearch.js';

// export const meta: MetaFunction = () => {
//   return [
//     { title: 'Game Database Search' },
//     { name: 'description', content: 'Search items and dialogues from games' },
//   ];
// };

// const itemLikeToFolderName = (item: {
//   itemType: ItemType;
//   itemSubType: string;
// }) => {
//   if (!item) {
//     return;
//   }

//   if (item.itemType === 'weapon') {
//     return weaponTypeToFolderName[item.itemSubType.split(':')[0]];
//   }

//   if (item.itemType === 'goods') {
//     return goodsTypeToFolderName[item.itemSubType];
//   }

//   return normalTypeToFolderName[item.itemType];
// };

export const meta = () => {
  return [
    { title: 'Bloodborne Search' },
    {
      name: 'description',
      content: 'Search through items and dialogues from Bloodborne',
    },
  ];
};

export default function BloodbornePage() {
  return (
    <GameSearch
      game="Bloodborne"
      title="Bloodborne Search"
      subtitle="Search through items and dialogues from Bloodborne"
    />
  );
}
