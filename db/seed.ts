import eldenRingBase from '../assets/data.json' assert { type: 'json' };
import eldenRingSOTE from '../assets/data2.json' assert { type: 'json' };
import { EldenRingData, EldenRingParsedData } from 'types.js';
import { db as dab } from './index.js';
import {
  dialogueLines,
  dialogues,
  dialogueSections,
  expansions,
  games,
  items,
} from './schema.js';

const eldenRingData: EldenRingParsedData = eldenRingBase;
const eldenRingSOTEData: EldenRingParsedData = eldenRingSOTE;

export async function seed(db: typeof dab) {
  // delete all rows
  await db.delete(items).execute();
  await db.delete(dialogues).execute();
  await db.delete(dialogueSections).execute();
  await db.delete(dialogueLines).execute();

  const gameId = await db
    .insert(games)
    .values({ name: 'Elden Ring' })
    .returning({ id: games.id });
  const expansionId = await db
    .insert(expansions)
    .values({ gameId: gameId[0].id, name: 'Shadow of the Erdtree' })
    .returning({ id: expansions.id });

  const itemsData = [
    eldenRingData.itemLikes,
    eldenRingSOTEData.itemLikes,
  ].flatMap((items, idx) =>
    items.map((item) => {
      return {
        id: item.id,
        title: item.title,
        description: item.description,
        // image: item.image,
        gameId: gameId[0].id,
        expansionId: idx === 0 ? null : expansionId[0].id,
        type: item.type,
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
    }))
  );
  await db.insert(dialogues).values(
    dialoguesData.map((dialogue) => ({
      npcId: dialogue.npcId,
      name: dialogue.name,
      gameId: dialogue.gameId,
      expansionId: dialogue.expansionId,
    }))
  );

  await db.insert(dialogueSections).values(
    dialoguesData.flatMap((dialogue, idx) =>
      dialogue.sections.map((section) => ({
        sectionId: section.sectionId,
        dialogueId: idx,
      }))
    )
  );

  let counter = 0;
  await db.insert(dialogueLines).values(
    dialoguesData.flatMap((dialogue) => {
      return dialogue.sections.flatMap((section) => {
        counter++;
        return section.lines.map((line) => ({
          id: line.id,
          text: line.text,
          sectionId: counter.toString(),
        }));
      });
    })
  );
}
