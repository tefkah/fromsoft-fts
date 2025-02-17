import fs from 'fs';
import path from 'path';
import { EldenRingParsedData } from 'types.js';
import SOTEData from './data2.json';

const ShadowData = SOTEData as EldenRingParsedData;

const iconsDir = path.join(
  new URL('..', import.meta.url).pathname,
  'public/icons'
);

const shadowIcons = path.join(iconsDir, 'Shadow of the Erdtree DLC');

const folderNameToItemType = {
  'Bolstering Materials': 'upgrade material',
  Consumables: 'consumable',
  'Crafting Materials': 'crafting material',
  Incantations: 'incantation',
  'Key Items': 'key item',
  Sorceries: 'sorcery',
  Talisman: 'talisman',
  'Ranged Weapons-Catalysts': 'weapon',
  'Spirit Ashes': 'spirit ash',
  Talismans: 'talisman',
  Tools: 'consumable',
};

const goodsTypeToFolderName = {
  'upgrade material': 'Bolstering Materials',
  consumable: 'Tools',
  'crafting material': 'Crafting Materials',
  incantation: 'Incantations',
  'key item': 'Key Items',
  physick: 'Key Items',
  sorcery: 'Sorceries',
  talisman: 'Talismans',
  'spirit ash': 'Spirit Ashes',
  cookbook: 'Key Items',
  armor: 'Armor',
} as const;

const weaponTypeToFolderName = {
  ranged: 'Ranged Weapons-Catalysts',
  magic: 'Ranged Weapons-Catalysts',
  melee: 'Melee Armaments',
  shield: 'Shields',
  arrow: 'Arrows-Bolts',
} as const;

const normalTypeToFolderName = {
  goods: 'Key Items',
  armor: 'Armor',
  ash: 'Ashes of War',
  talisman: 'Talismans',
} as const;

type FolderName =
  | (typeof normalTypeToFolderName)[keyof typeof normalTypeToFolderName]
  | (typeof weaponTypeToFolderName)[keyof typeof weaponTypeToFolderName]
  | (typeof goodsTypeToFolderName)[keyof typeof goodsTypeToFolderName];

const folderItems = {
  Armor: [],
  'Arrows-Bolts': [],
  'Ashes of War': [],
  'Bolstering Materials': [],
  'Crafting Materials': [],
  Incantations: [],
  'Key Items': [],
  'Melee Armaments': [],
  'Ranged Weapons-Catalysts': [],
  Shields: [],
  'Spirit Ashes': [],
  Sorceries: [],
  Talismans: [],
  Tools: [],
} as Record<FolderName, EldenRingParsedData['itemLikes']>;

for (const item of ShadowData.itemLikes) {
  const folderName =
    item.type === 'weapon'
      ? weaponTypeToFolderName[item.subType.split(':')[0]]
      : item.type === 'goods'
        ? goodsTypeToFolderName[item.subType]
        : normalTypeToFolderName[item.type];

  if (!folderName) {
    // console.log(item);
    continue;
  }

  folderItems[folderName].push(item);

  //   const folder = path.join(shadowIcons, folderName);

  //   const exists = fs.existsSync(folder);

  //   if (!exists) {
  //     console.log(folder, item);
  //   }
}

for (const folder in folderItems) {
  if (folder !== 'Tools') {
    continue;
  }

  const folderPath = path.join(shadowIcons, folder);
  const read = fs.readdirSync(folderPath);
  for (let i = 0; i < folderItems[folder].length; i++) {
    const item = folderItems[folder][i];
    const icon = read[i];
    const iconName = icon.replace(/^.*(MENU_Knowledge_\d+\w?).*$/, '$1');
    console.log(icon, item.title, item.id, iconName);

    fs.renameSync(
      path.join(folderPath, icon),
      path.join(folderPath, `${iconName}_${item.title}.png`)
    );
  }
}
