import fs from 'fs';
import { unified } from 'unified';
import rehypeParse from 'rehype-parse';
import { visit } from 'unist-util-visit';
import { Element } from 'hast';

interface DialogueLine {
  text: string;
  original: string;
  used: boolean;
}

interface Dialogue {
  name: string;
  lines: DialogueLine[];
}

function parseDialogue(html: string): Dialogue[] {
  const dialogues: Dialogue[] = [];
  let currentDialogue: Dialogue | null = null;

  const tree = unified().use(rehypeParse, { fragment: true }).parse(html);

  // Helper to get text content from an element
  const getText = (element: Element): string => {
    let text = '';
    visit(element, 'text', (node) => {
      text += node.value;
    });
    return text.trim();
  };

  visit(tree, 'element', (node: Element) => {
    // Find dialogue section headers
    if (
      node.tagName === 'h4' &&
      node.properties &&
      typeof node.properties.id === 'string'
    ) {
      const name = getText(node).replace(/^\+\s*/, '');
      currentDialogue = {
        name,
        lines: [],
      };
      dialogues.push(currentDialogue);
    }

    // Process dialogue table rows
    if (
      node.tagName === 'tr' &&
      node.properties &&
      !node.properties.style?.toString().includes('height:20px')
    ) {
      if (!currentDialogue) return;

      const cells = node.children.filter(
        (child): child is Element =>
          'tagName' in child && child.tagName === 'td'
      );

      if (cells.length !== 2) return;

      const [englishCell, japaneseCell] = cells;
      const text = getText(englishCell);
      const original = getText(japaneseCell);

      // Skip empty rows or rows with just ellipsis
      if ((!text || text === '…') && (!original || original === '…')) return;

      // Check if the line is "unused" (has the golden color span)
      let hasGoldenSpan = false;

      visit(englishCell, 'element', (node: Element) => {
        if (node.tagName === 'span') {
          hasGoldenSpan =
            node.properties?.style?.toString().includes('color:#B39050') ??
            false;
        }
      });

      currentDialogue.lines.push({
        text,
        original,
        used: !hasGoldenSpan,
      });
    }
  });

  return dialogues;
}

// Example usage:
const html = fs.readFileSync(
  new URL('Bloodborne_Dialogue_ENJP.html', import.meta.url),
  'utf-8'
);
const result = parseDialogue(html);
// console.log(JSON.stringify(result, null, 2));
fs.writeFileSync(
  new URL('bloodborne-dialogue.json', import.meta.url),
  JSON.stringify(result, null, 2)
);
