import { unified } from 'unified';
import rehypeParse from 'rehype-parse';
import { selectAll } from 'hast-util-select';
import { toString } from 'hast-util-to-string';
import { ItemLike, ItemRange } from '../../types.js';

export class ItemParser {
  private static isValidText(text: string): boolean {
    return (
      !text.includes('NOT NEEDED') &&
      !text.includes('%null%') &&
      !text.match(/^en\d+$/)
    );
  }

  private static parseFile(content: string) {
    const processor = unified().use(rehypeParse, { fragment: true });
    const tree = processor.parse(content);
    const texts = selectAll('text', tree);

    return texts
      .map((node) => ({
        id: node.properties?.id?.toString() || '',
        content: toString(node),
      }))
      .filter((item) => this.isValidText(item.content));
  }

  static parseItems(
    namesContent: string,
    descriptionsContent: string,
    itemRanges: ItemRange[]
  ): ItemLike[] {
    const names = this.parseFile(namesContent);
    const descriptions = this.parseFile(descriptionsContent);

    const items: ItemLike[] = [];

    for (const { id: nameId, content: title } of names) {
      const description = descriptions.find((d) => d.id === nameId)?.content;
      if (!description) continue;

      const numericId = parseInt(nameId);
      const range = itemRanges.find(
        (r) => numericId >= r.startId && numericId <= r.endId
      );

      if (range) {
        items.push({
          id: nameId,
          title,
          description,
          type: range.type,
          subType: range.subType,
        });
      }
    }

    return items;
  }
}

import * as fs from 'fs';

// Define your item ranges

// Read all files
const armorNamesContent = fs.readFileSync(
  new URL(
    './Bloodborne-UA/item-msgbnd-dcx/armor-names.fmg.xml',
    import.meta.url
  ),
  'utf-8'
);

const armorDescContent = fs.readFileSync(
  new URL(
    './Bloodborne-UA/item-msgbnd-dcx/armor-descriptions.fmg.xml',
    import.meta.url
  ),
  'utf-8'
);

const weaponNamesContent = fs.readFileSync(
  new URL(
    './Bloodborne-UA/item-msgbnd-dcx/weapon-names.fmg.xml',
    import.meta.url
  ),
  'utf-8'
);

const weaponDescContent = fs.readFileSync(
  new URL(
    './Bloodborne-UA/item-msgbnd-dcx/weapon-descriptions.fmg.xml',
    import.meta.url
  ),
  'utf-8'
);

const itemNamesContent = fs.readFileSync(
  new URL(
    './Bloodborne-UA/item-msgbnd-dcx/item-names.fmg.xml',
    import.meta.url
  ),
  'utf-8'
);

const itemDescContent = fs.readFileSync(
  new URL(
    './Bloodborne-UA/item-msgbnd-dcx/item-descriptions.fmg.xml',
    import.meta.url
  ),
  'utf-8'
);

const gemNamesContent = fs.readFileSync(
  new URL('./Bloodborne-UA/menu-msgbnd-dcx/gem-names.fmg.xml', import.meta.url),
  'utf-8'
);

const gemDescContent = fs.readFileSync(
  new URL(
    './Bloodborne-UA/menu-msgbnd-dcx/gem-descriptions.fmg.xml',
    import.meta.url
  ),
  'utf-8'
);

// Parse all items
const armor = ItemParser.parseItems(armorNamesContent, armorDescContent, [
  {
    startId: 10000,
    endId: 99999000,
    type: 'Armor',
    subType: 'Set',
  },
]);
const weapons = ItemParser.parseItems(weaponNamesContent, weaponDescContent, [
  {
    startId: 1000000,
    endId: 1999999,
    type: 'Weapon',
    subType: 'Melee',
  },
]);
const items = ItemParser.parseItems(itemNamesContent, itemDescContent, [
  {
    startId: 100,
    endId: 2999999,
    type: 'Item',
    subType: '',
  },
]);
const gems = ItemParser.parseItems(gemNamesContent, gemDescContent, [
  {
    startId: 3000000,
    endId: 3999999,
    type: 'Gem',
    subType: 'Blood',
  },
  {
    startId: 11000000,
    endId: 11999999,
    type: 'Rune',
    subType: 'Rune',
  },
]);

fs.writeFileSync(
  new URL('items.json', import.meta.url),
  JSON.stringify([...armor, ...weapons, ...items, ...gems], null, 2)
);
