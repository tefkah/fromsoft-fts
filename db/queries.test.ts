import { describe, it, expect } from 'bun:test';

import { searchAll } from './queries.js';

describe('searchDialogue', () => {
  it('should return dialogue lines that match the search term', async () => {
    const result = await searchAll('claw', { limit: 100 });
    // console.log(result);
    expect(result).toBeDefined();
  });
});

describe('searchFiltered', () => {
  it('should return dialogue lines that match the search term', async () => {
    const result = await searchAll('claw', { limit: 100 });
    // console.log(result);
    expect(result).toBeDefined();
  });

  it('should be able to filter based on expansion', async () => {
    const result = await searchAll('claw', {
      limit: 100,
      expansion: 'Shadow of the Erdtree',
    });
    expect(result.results.length).toBeGreaterThan(0);
    console.log(result.results);

    result.results.forEach((r) => {
      expect(r).toMatchObject({
        expansion: 'Shadow of the Erdtree',
      });
    });
  });
});
