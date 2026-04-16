import { describe, it, expect } from 'vitest';
import { Trie, SearchHistoryManager, SuggestionEngine } from './search-suggestions';

describe('Trie', () => {
  it('autocompletes by prefix', () => {
    const trie = new Trie();
    trie.insert('javascript', 5);
    trie.insert('java', 3);
    const results = trie.autocomplete('jav', 5);
    expect(results.map(r => r.text)).toContain('javascript');
    expect(results.map(r => r.text)).toContain('java');
  });

  it('fuzzy search tolerates one typo', () => {
    const trie = new Trie();
    trie.insert('typescript');
    const results = trie.fuzzySearch('typescrit', 1);
    expect(results).toContain('typescript');
  });
});

describe('SearchHistoryManager', () => {
  it('records and suggests history', () => {
    const mgr = new SearchHistoryManager();
    mgr.record('react hooks');
    mgr.record('react hooks');
    mgr.record('react context');
    const suggestions = mgr.getSuggestions('react');
    expect(suggestions[0].text).toBe('react hooks');
    expect(suggestions[0].score).toBe(2);
  });

  it('returns popular searches', () => {
    const mgr = new SearchHistoryManager();
    mgr.record('vue');
    mgr.record('vue');
    mgr.record('angular');
    const popular = mgr.getPopular(1);
    expect(popular[0].text).toBe('vue');
  });
});

describe('SuggestionEngine', () => {
  it('combines dictionary and history suggestions', () => {
    const engine = new SuggestionEngine();
    engine.addDictionary(['javascript', 'java', 'typescript']);
    engine.recordSearch('java');
    const suggestions = engine.getSuggestions('jav', { limit: 5 });
    const texts = suggestions.map(s => s.text);
    expect(texts).toContain('java');
    expect(texts).toContain('javascript');
  });

  it('returns trending searches', () => {
    const engine = new SuggestionEngine();
    engine.recordSearch('rust');
    engine.recordSearch('rust');
    engine.recordSearch('go');
    const trending = engine.getTrending(2);
    expect(trending[0].text).toBe('rust');
  });
});
