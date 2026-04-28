import { describe, it, expect } from 'vitest';
import { SemanticSearch } from './semantic-search.js';

describe('SemanticSearch', () => {
  it('should index and search documents', () => {
    const search = new SemanticSearch(10);
    search.index('d1', 'apple fruit');
    search.index('d2', 'banana fruit');
    search.index('d3', 'car vehicle');
    search.buildIndex();

    const results = search.search('fruit', 2);
    expect(results.length).toBe(2);
    expect(results[0].score).toBeGreaterThan(0);
  });

  it('should return empty for no documents', () => {
    const search = new SemanticSearch(10);
    search.buildIndex();
    expect(search.search('test').length).toBe(0);
  });
});
