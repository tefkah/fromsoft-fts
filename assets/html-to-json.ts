/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from 'fs';

import { unified } from 'unified';
import rehypeParse from 'rehype-parse';
import { visit } from 'unist-util-visit';
import type { Element } from 'hast';
import {
  Dialogue,
  DialogueSection,
  EldenRingData,
  EldenRingParsedData,
  JsonEldenRing,
} from 'types.js';
import { toString } from 'hast-util-to-string';

function extractIdFromTitle(title: string): string {
  // Extract number from brackets, e.g. "[1060]" -> "1060"
  const match = title.match(/\[(\d+)\]$/);
  return match ? match[1] : '';
}

function extractTitleWithoutId(title: string): string {
  // Remove the ID portion from title, e.g. "Starscourge Heirloom [1060]" -> "Starscourge Heirloom"
  return title.replace(/\s*\[\d+\]$/, '').trim();
}

type ElementPattern = {
  tag: 'h2' | 'h3' | 'h4' | 'p' | 'ul' | 'li';
  start?: true;
  matches?: (element: Element) => boolean;
  extract: Record<
    string,
    | RegExp
    | ((
        text: string
      ) =>
        | string
        | Record<string, unknown>
        | (string | Record<string, unknown>)[])
  >;
  children?: ElementPattern[];
  //     id?: RegExp | ((text: string) => string);
  //     title?: RegExp | ((text: string) => string);
  //     content?: RegExp | ((text: string) => string);
  //   };
};

// Helper type to extract the return type of a function or RegExp match
type ExtractorResult<T> = T extends RegExp
  ? string
  : T extends (text: string) => infer R
    ? R
    : never;

// type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
//   k: infer I
// ) => void
//   ? I
//   : never;

// type ParsedFromPattern<T extends ElementPattern[]> = UnionToIntersection<
//   T[number] extends { extract: infer P }
//     ? {
//         [K in keyof P]: P[K];
//       }
//     : never
// >;

type AllKeys<T extends ElementPattern[]> =
  T[number]['extract'] extends infer E extends Record<string, any>
    ? E extends E
      ? keyof E
      : never
    : never;

// Helper type to merge all extract fields from patterns
type ParsedFromPattern<T extends ElementPattern[]> =
  T[number] extends infer P extends ElementPattern
    ? P extends P
      ? {
          [K in keyof P['extract']]: ExtractorResult<P['extract'][K]>;
        } & (P['children'] extends infer C extends ElementPattern[]
          ? {
              children: ParsedFromPattern<C>[];
            }
          : {})
      : never
    : never;

type X = ParsedFromPattern<
  [
    {
      tag: 'h3';
      extract: {
        id: RegExp;
        title: (text: string) => string;
      };
      children: [
        {
          tag: 'p';
          extract: {
            content: (text: string) => string;
          };
        },
      ];
    },
    {
      tag: 'ul';
      extract: {
        ppn: RegExp;
        poop: (text: string) => string;
      };
      children: [
        {
          tag: 'p';
          extract: {
            ak: (text: string) => string;
          };
        },
      ];
    },
  ]
>;

function defineSection<
  Path extends keyof EldenRingParsedData,
  const TPattern extends ElementPattern[],
  TResult extends EldenRingParsedData[Path],
>(config: {
  type: string;
  matcher: RegExp;
  pattern: TPattern;
  resultPath: Path;
  transform: (parsed: ParsedFromPattern<TPattern>) => TResult[number];
}) {
  return config;
}

function defineItemLikeSection(
  type: string,
  matcher: RegExp,
  typeName: string
) {
  return defineSection({
    type,
    matcher,
    pattern: [
      {
        tag: 'h3',
        extract: {
          id: /\[(\d+)\]$/,
          title: (text: string) => text.replace(/\s*\[\d+\]$/, '').trim(),
        },
        children: [
          {
            tag: 'p',
            extract: {
              content: (text: string) => text,
            },
          },
        ],
      },
    ],
    resultPath: 'itemLikes',
    transform(parsed) {
      return {
        id: parsed.id,
        title: parsed.title,
        description: parsed.children?.map((child) => child.content).join('\n'),
        type: typeName,
      };
    },
  });
}

function defineSimpleLikeSection(
  type: string,
  matcher: RegExp,
  typeName: string
) {
  return defineSection({
    type,
    matcher,
    resultPath: 'simpleLikes',
    pattern: [
      {
        tag: 'p',
        start: true,
        matches: (element) => /^\[\d+\]/.test(toString(element)),
        extract: {
          id: /^\[(\d+)\]/,
          title: /^\s*\[\d+\]\s*(.*)/,
        },
        children: [
          {
            tag: 'p',
            extract: {
              content: (text: string) => text,
            },
          },
        ],
      },
      // {
      //   tag: 'p',
      //   matches: (element) => !/^\[\d+\]/.test(toString(element)),
      //   extract: {
      //     content: (text: string) => text,
      //   },
      // },
    ],
    transform(parsed) {
      return {
        id: parsed.id,
        title: parsed.title,
        description: parsed.children?.map((child) => child.content).join('\n'),
        type: typeName,
      };
    },
  });
}

const sections = [
  defineSimpleLikeSection('Accessory Info', /AccessoryInfo/, 'accessory info'),
  defineItemLikeSection(
    'Accessory Name and Description',
    /AccessoryName/,
    'accessory'
  ),
  defineSimpleLikeSection('Action Button Text', /ActionButtonText/, 'action'),
  defineItemLikeSection('ArtsName', /ArtsName/, 'art'),
  defineSimpleLikeSection('Blood Messages', /BloodMessages/, 'blood'),
  defineSimpleLikeSection('Event Text for Map', /EventTextForMap/, 'event'),
  defineSimpleLikeSection('Event Text for Talk', /EventTextForTalk/, 'event'),
  defineSimpleLikeSection('GemEffect', /GemEffect/, 'gem'),
  defineSimpleLikeSection('GemInfo', /GemInfo/, 'gem'),
  defineItemLikeSection('Ash of War', /GemName/, 'ash'),
  defineSimpleLikeSection(
    'Consumable interaction dialogue',
    /GoodsDialogue/,
    'consumable'
  ),
  defineSimpleLikeSection('Consumable info', /GoodsInfo/, 'consumable'),
  defineItemLikeSection('Consumable name', /GoodsName/, 'consumable'),
  defineSimpleLikeSection('Menu Dialogues', /GR_Dialogues/, 'menu'),
  defineSimpleLikeSection('Menu buttons', /GR_KeyGuide/, 'menu'),
  defineSimpleLikeSection('GR_LineHelp', /GR_LineHelp/, 'menu'),
  defineSimpleLikeSection('GR_MenuText', /GR_MenuText/, 'menu'),
  defineSimpleLikeSection('GR_System_Message', /GR_System_Message/, 'menu'),
  defineSimpleLikeSection('Game Hints', /LoadingTitle/, 'menu'),
  defineSimpleLikeSection('GR_System_Message', /GR_System_Message/, 'menu'),
  defineSimpleLikeSection('MovieSubtitle', /MovieSubtitle/, 'menu'),
  defineSimpleLikeSection('NetworkMessage', /NetworkMessage/, 'menu'),
  defineSimpleLikeSection('MagicInfo', /MagicInfo/, 'magic'),
  defineSimpleLikeSection('NetworkMessage', /NetworkMessage/, 'menu'),
  defineSimpleLikeSection('MagicName', /MagicName/, 'magic'),
  defineSimpleLikeSection('NpcName', /NpcName/, 'npc'),
  defineSimpleLikeSection('PlaceName', /PlaceName/, 'place'),
  defineSimpleLikeSection('WeaponInfo', /WeaponInfo/, 'weapon'),
  defineItemLikeSection('WeaponName', /WeaponName/, 'weapon'),
  defineSimpleLikeSection('WeaponEffect', /WeaponEffect/, 'weapon'),
  defineSimpleLikeSection('NpcName', /NpcName/, 'npc'),
  defineSimpleLikeSection('PlaceName', /PlaceName/, 'place'),
  defineSimpleLikeSection('Armor Info', /ProtectorInfo/, 'armor'),
  defineItemLikeSection('Armor Name', /ProtectorName/, 'armor'),

  defineSection({
    type: 'Dialogue',
    matcher: /TalkMsg/,
    resultPath: 'dialogue',
    pattern: [
      {
        tag: 'h3',
        extract: {
          id: /(\d+)\]?$/,
          title: (text: string) => text.replace(/\s*\[?\d+\]?$/, '').trim(),
        },
        children: [
          {
            tag: 'h4',
            extract: {
              id: /Section (\d+)/,
            },
            children: [
              {
                tag: 'p',
                extract: {
                  lines: (text: string) =>
                    text
                      .split(/\n\[/)
                      .map((line, idx, lines) => {
                        if (lines.length > 1) {
                          console.log(idx, line);
                        }

                        const match = line.match(/\[?(\d+)\]\s*((?:\n|.)*)/);
                        return match
                          ? { id: match[1], text: match[2].trim() }
                          : null;
                      })
                      .filter((line) => line != null),
                },
              },
            ],
          },
        ],
      },
      // {
      //   tag: 'h4',
      //   extract: {
      //     id: /Section (\d+)/,
      //   },
      // },
      // {
      //   tag: 'p',
      //   extract: {
      //     content: (text: string) =>
      //       text
      //         .split('\n')
      //         .map((line) => {
      //           const match = line.match(/\[(\d+)\]\s*(.*)/);
      //           return match ? { id: match[1], text: match[2].trim() } : null;
      //         })
      //         .filter((line) => line != null),
      //   },
      // },
    ],
    transform: (parsed) => ({
      npcId: parsed.id,
      name: parsed.title,
      sections: parsed.children.map((child) => ({
        sectionId: child.id,
        lines: child.children.flatMap((child) => child.lines),
      })),
    }),
  }),
  defineItemLikeSection('Tutorial Message', /TutorialTitle/, 'tutorial'),
  defineSimpleLikeSection('Weapon Effect', /WeaponEffect/, 'weapon'),
  defineSimpleLikeSection('Weapon Info', /WeaponInfo/, 'weapon'),
  defineItemLikeSection('Weapon Name', /WeaponName/, 'weapon'),
]; //  satisfies ReturnType<typeof defineSection<any, any, any>>[];

// const sectionss = [
//   defineSection({
//     type: 'Accessory Name and Description',
//     matcher: /AccessoryName/,
//       pattern: [
//         {
//           tag: 'h3',
//           extract: {
//             id: /\[(\d+)\]$/,
//             title: (text: string) => text.replace(/\s*\[\d+\]$/, '').trim(),
//           },
//         },
//         {
//           tag: 'p',
//           extract: {
//             content: (text: string) => text,
//           },
//         },
//       ],
//       resultPath: 'items',
//       // Now TypeScript knows that parsed has { id: string; title: string; content: string }
//       transform (parsed)  {
//         return {
//         id: parsed.id,
//         title: parsed.title,
//         description: parsed.content,
//       }},
//   }),
// ] as const;

// function parseSection(
//   elements: Element[],
//   config: (typeof sections)[number],
//   result: EldenRingParsedData
// ) {
//   let currentIndex = 0;
//   let accumulated: any = {};

//   while (currentIndex < elements.length) {
//     const element = elements[currentIndex];
//     const pattern = config.pattern[currentIndex % config.pattern.length];

//     if (
//       element.tagName !== pattern.tag ||
//       ('matches' in pattern && pattern.matches && !pattern.matches(element))
//     ) {
//       currentIndex++;
//       continue;
//     }

//     if (pattern.extract) {
//       const text = toString(element);
//       Object.entries(pattern.extract).forEach(([key, extractor]) => {
//         if (typeof extractor === 'function') {
//           accumulated[key] = extractor(text);
//         } else if (extractor instanceof RegExp) {
//           const match = text.match(extractor);
//           accumulated[key] = match ? match[1] : '';
//         }
//       });
//     }

//     if ((currentIndex + 1) % config.pattern.length === 0) {
//       const transformed = config.transform(accumulated);
//       // Use the resultPath to store the result in the correct place
//       (result[config.resultPath] as TResult[]).push(transformed);
//       accumulated = {};
//     }

//     currentIndex++;
//   }
// }

function parseSection(
  elements: Element[],
  config: (typeof sections)[number],
  result: EldenRingParsedData
) {
  let currentIndex = 0;

  function parsePattern(
    elements: Element[],
    pattern: ElementPattern,
    index: number,
    parentPattern?: ElementPattern
  ): { parsed: any; endIndex: number; foundParent: boolean } {
    const accumulated: any = {};
    const children: any[] = [];

    // Extract data from current element
    if (pattern.extract) {
      const text = toString(elements[index]);
      Object.entries(pattern.extract).forEach(([key, extractor]) => {
        if (typeof extractor === 'function') {
          accumulated[key] = extractor(text);
        } else if (extractor instanceof RegExp) {
          const match = text.match(extractor);
          accumulated[key] = match ? match[1] : '';
        }
      });
    }

    // Process children
    if (pattern.children) {
      let i = index + 1;
      while (i < elements.length) {
        const element = elements[i];

        // Check if we found a parent pattern at any level
        if (
          parentPattern &&
          element.tagName === parentPattern.tag &&
          (!parentPattern.matches || parentPattern.matches(element))
        ) {
          return {
            parsed: { ...accumulated, children },
            endIndex: i,
            foundParent: true,
          };
        }

        // Check if we found the same pattern again
        if (
          element.tagName === pattern.tag &&
          (!pattern.matches || pattern.matches(element))
        ) {
          return {
            parsed: { ...accumulated, children },
            endIndex: i,
            foundParent: false,
          };
        }

        // Try each child pattern
        let foundChild = false;
        for (const childPattern of pattern.children) {
          if (
            element.tagName === childPattern.tag &&
            (!childPattern.matches || childPattern.matches(element))
          ) {
            const {
              parsed: childParsed,
              endIndex,
              foundParent,
            } = parsePattern(
              elements,
              childPattern,
              i,
              pattern // Pass current pattern as parent for nested checks
            );
            children.push(childParsed);
            i = endIndex;
            foundChild = true;

            if (foundParent) {
              return {
                parsed: { ...accumulated, children },
                endIndex: i,
                foundParent: true,
              };
            }
            break;
          }
        }

        if (!foundChild) {
          i++;
        }
      }
    }

    return {
      parsed: { ...accumulated, children },
      endIndex: index + 1,
      foundParent: false,
    };
  }

  const results: any[] = [];
  const rootPattern = config.pattern[0];

  while (currentIndex < elements.length) {
    const element = elements[currentIndex];

    if (
      element.tagName === rootPattern.tag &&
      (!rootPattern.matches || rootPattern.matches(element))
    ) {
      const { parsed, endIndex } = parsePattern(
        elements,
        rootPattern,
        currentIndex
      );
      results.push(config.transform(parsed));
      currentIndex = endIndex;
    } else {
      currentIndex++;
    }
  }

  (result[config.resultPath] as any[]).push(...results);
}

function htmlToEldenRingData(html: string): EldenRingParsedData {
  const data: EldenRingParsedData = {
    itemLikes: [],
    simpleLikes: [],
    dialogue: [],
  };

  let currentSection:
    | ((typeof sections)[number] & { elements: Element[] })
    | null = null;

  const processor = unified()
    .use(rehypeParse, { fragment: false })
    .use(() => (tree) => {
      visit(tree, 'element', (node: Element) => {
        // Check for dialogue section marker
        if (node.tagName === 'h2') {
          if (currentSection) {
            parseSection(currentSection.elements, currentSection, data);
            currentSection = null;
          }

          const matchingSection = sections.find((section) =>
            section.matcher.test(toString(node))
          );

          if (!matchingSection) return;

          currentSection = {
            ...matchingSection,
            elements: [],
          };
          return;
        }

        if (currentSection) {
          currentSection.elements.push(node);
          return;
        }

        return;
      });
    });

  const parsed = processor.parse(html);
  processor.runSync(parsed);
  return data;
}

export async function generateJson() {
  const path = new URL('Elden Text.html', import.meta.url);
  const html = fs.readFileSync(path, 'utf8');

  const data = htmlToEldenRingData(html);
  fs.writeFileSync(
    new URL('data.json', import.meta.url),
    JSON.stringify(data, null, 2)
  );

  const path2 = new URL('Elden Text SOTE.html', import.meta.url);
  const html2 = fs.readFileSync(path2, 'utf8');
  const data2 = htmlToEldenRingData(html2);
  fs.writeFileSync(
    new URL('data2.json', import.meta.url),
    JSON.stringify(data2, null, 2)
  );
}

generateJson();
