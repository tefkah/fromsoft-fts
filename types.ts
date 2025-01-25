export type JsonEldenRing = {
  id: string;
  title: string;
  description: string;
  image?: string;
};

export type DialogueSection = {
  sectionId: string; // e.g. "00", "50"
  lines: Array<{
    id: string; // e.g. "1090700000"
    text: string; // e.g. "What have you done?"
  }>;
};

export type Dialogue = {
  npcId: string; // e.g. "10907" or "1120"
  name?: string; // e.g. "The Noble Goldmask"
  sections: DialogueSection[];
};

export type EldenRingData = {
  items: JsonEldenRing[];
  //   itemsInfo: ItemInfo[];
  dialogue: Dialogue[];
};

export type EldenRingParsedData = {
  itemLikes: ItemLike[];
  simpleLikes: SimpleLike[];
  dialogue: DialogueLike[];
};

type DialogueLike = {
  npcId: string;
  name?: string;
  sections: DialogueSection[];
};

type ItemLike = {
  id: string;
  title: string;
  description: string;
  type: string;
};

type SimpleLike = {
  id: string;
  description: string;
  type: string;
};
