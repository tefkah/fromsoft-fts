/* eslint-disable @typescript-eslint/no-unused-vars */
import eldenRingBase from '../assets/data.json' with { type: 'json' };
import eldenRingSOTE from '../assets/data2.json' with { type: 'json' };
import bloodborneItems from '../assets/bloodborne/items.json' with { type: 'json' };
import bloodborneDialogue from '../assets/bloodborne/bloodborne-dialogue.json' with { type: 'json' };

import {
  DialogueLike,
  EldenRingData,
  EldenRingParsedData,
  ItemLike,
} from 'types.js';
import { db as dab } from './index.js';
import {
  dialogueLines,
  dialogues,
  dialogueSections,
  expansions,
  games,
  items,
  version,
} from './schema.js';
import { VERSION } from './version.js';

const eldenRingData: EldenRingParsedData = eldenRingBase;
const eldenRingSOTEData: EldenRingParsedData = eldenRingSOTE;

const bloodborneItemsData: ItemLike[] = bloodborneItems;
const bloodborneDialogueData = bloodborneDialogue;

export async function seed(db: typeof dab) {
  // delete all rows
  await db.delete(items).execute();
  await db.delete(dialogues).execute();
  await db.delete(dialogueSections).execute();
  await db.delete(dialogueLines).execute();
  await db.delete(version).execute();

  await db.insert(version).values({ version: VERSION });

  const gameId = await db
    .insert(games)
    .values([
      { name: 'Elden Ring' },
      {
        name: 'Bloodborne',
      },
    ])
    .returning({ id: games.id });
  const expansionId = await db
    .insert(expansions)
    .values([
      { gameId: gameId[0].id, name: 'Shadow of the Erdtree' },
      {
        gameId: gameId[1].id,
        name: 'Old Hunters',
      },
    ])
    .returning({ id: expansions.id });

  const itemsData = [
    eldenRingData.itemLikes,
    eldenRingSOTEData.itemLikes,
    bloodborneItemsData,
  ].flatMap((items, idx) =>
    items.map((item) => {
      return {
        id: item.id,
        title: item.title,
        description: item.description,
        // image: item.image,
        gameId: idx < 2 ? gameId[0].id : gameId[1].id,
        expansionId: idx === 1 ? expansionId[0].id : null,
        type: item.type,
        subType: item.subType,
      };
    })
  );

  const dialoguesData = [
    eldenRingData.dialogue,
    eldenRingSOTEData.dialogue,
  ].flatMap((dialogue, idx) => {
    return dialogue.map((dialogue) => {
      return {
        npcId: dialogue.npcId,
        name: dialogue.name,
        sections: dialogue.sections,
        gameId: gameId[0].id,
        expansionId: idx === 0 ? null : expansionId[0].id,
      };
    });
  });

  await db.insert(items).values(
    itemsData.map((item) => ({
      itemId: item.id,
      title: item.title,
      description: item.description,
      // image: item.image,
      gameId: item.gameId,
      expansionId: item.expansionId,
      type: item.type,
      subType: item.subType,
    }))
  );

  const eldenRingDialogues = await db
    .insert(dialogues)
    .values(dialoguesData)
    .returning({ id: dialogues.id });

  const bloodborneDialogues = await db
    .insert(dialogues)
    .values(
      bloodborneDialogueData.map((dialogue, idx) => ({
        npcId: (idx + 10000).toString(),
        name: dialogue.name,
        gameId: gameId[1].id,
        expansionId: null,
      }))
    )
    .returning({ id: dialogues.id });

  const eldenRingSectionsData = dialoguesData.flatMap((dialogue, idx) =>
    dialogue.sections.map((section) => ({
      sectionId: section.sectionId,
      dialogueId: eldenRingDialogues[idx].id,
    }))
  );
  const eldenRingSections = await db
    .insert(dialogueSections)
    .values(eldenRingSectionsData)
    .returning({ id: dialogueSections.id });

  const bloodborneSectionsData = bloodborneDialogueData.flatMap(
    (dialogue, idx) => ({
      sectionId: (1_000_000 + idx).toString(),
      dialogueId: bloodborneDialogues[idx].id,
    })
  );

  const bloodborneSections = await db
    .insert(dialogueSections)
    .values(bloodborneSectionsData)
    .returning({ id: dialogueSections.id });

  let counter = 0;
  await db.insert(dialogueLines).values(
    dialoguesData.flatMap((dialogue) => {
      return dialogue.sections.flatMap((section) => {
        counter++;
        return section.lines.map((line) => ({
          lineId: line.id,
          text: line.text,
          sectionId: counter,
        }));
      });
    })
  );

  await db.insert(dialogueLines).values(
    bloodborneDialogueData.flatMap((dialogue, idx) => {
      return dialogue.lines.flatMap((line, lineIdx) => {
        return {
          lineId: (1_000_000 + idx).toString() + (lineIdx + 1).toString(),
          text: line.text,
          sectionId: bloodborneSections[idx].id,
          original: line.original,
          used: line.used,
        };
      });
    })
  );
}
