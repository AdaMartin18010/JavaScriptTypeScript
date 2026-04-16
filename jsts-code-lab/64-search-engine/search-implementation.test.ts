import { describe, it, expect } from 'vitest';
import { InvertedIndex, FacetedSearch, SearchSuggestions } from './search-implementation';

describe('InvertedIndex', () => {
  it('indexes and searches documents', () => {
    const idx = new InvertedIndex();
    idx.addDocument({ id: '1', title: 'TypeScript', content: 'TypeScript is great', category: 'dev', tags: ['ts'] });
    idx.addDocument({ id: '2', title: 'JavaScript', content: 'JavaScript is dynamic', category: 'dev', tags: ['js'] });
    const results = idx.search('javascript');
    expect(results.length).toBe(1);
    expect(results[0].document.id).toBe('2');
  });

  it('removes documents from index', () => {
    const idx = new InvertedIndex();
    idx.addDocument({ id: '1', title: 'A', content: 'B' });
    idx.removeDocument('1');
    expect(idx.search('a').length).toBe(0);
  });
});

describe('FacetedSearch', () => {
  it('filters and computes facets', () => {
    const idx = new InvertedIndex();
    idx.addDocument({ id: '1', title: 'TypeScript', content: 'typed language', category: 'lang', tags: ['typed'] });
    idx.addDocument({ id: '2', title: 'JavaScript', content: 'dynamic language', category: 'lang', tags: ['dynamic'] });
    const fs = new FacetedSearch(idx);
    const result = fs.searchWithFacets('typescript', { category: ['lang'] });
    expect(result.results.length).toBe(1);
    expect(result.facets.some(f => f.field === 'category')).toBe(true);
  });
});

describe('SearchSuggestions', () => {
  it('suggests completions by prefix', () => {
    const ss = new SearchSuggestions();
    ss.addTerm('typescript tutorial');
    ss.addTerm('typescript generic');
    ss.addTerm('javascript array');
    const suggestions = ss.suggest('type', 5);
    expect(suggestions.length).toBe(2);
    expect(suggestions).toContain('typescript tutorial');
  });
});
