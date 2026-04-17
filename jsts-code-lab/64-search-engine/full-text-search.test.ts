import { describe, it, expect } from 'vitest';
import { Tokenizer, InvertedIndex, QueryProcessor } from './full-text-search.js';

describe('Tokenizer', () => {
  it('tokenizes and filters stop words', () => {
    const t = new Tokenizer();
    const tokens = t.tokenize('The quick brown fox');
    expect(tokens).toContain('quick');
    expect(tokens).not.toContain('the');
  });

  it('stems common suffixes', () => {
    const t = new Tokenizer();
    expect(t.stem('running')).toBe('runn');
    expect(t.stem('flies')).toBe('flie');
  });
});

describe('InvertedIndex', () => {
  it('adds documents and searches terms', () => {
    const idx = new InvertedIndex();
    idx.addDocument({ id: '1', title: 'Hello', content: 'world' });
    expect(idx.searchTerm('hello').length).toBe(1);
    expect(idx.searchTerm('world').length).toBe(1);
    expect(idx.getStats().totalDocs).toBe(1);
  });

  it('removes documents', () => {
    const idx = new InvertedIndex();
    idx.addDocument({ id: '1', title: 'A', content: 'B' });
    idx.removeDocument('1');
    expect(idx.searchTerm('a').length).toBe(0);
  });
});

describe('QueryProcessor', () => {
  const docs = [
    { id: '1', title: 'TypeScript Guide', content: 'Learn TypeScript programming' },
    { id: '2', title: 'JavaScript Patterns', content: 'Advanced JavaScript techniques' },
    { id: '3', title: 'React and TypeScript', content: 'Build apps with React and TypeScript' }
  ];

  it('searches and ranks by relevance', () => {
    const idx = new InvertedIndex();
    docs.forEach(d => { idx.addDocument(d); });
    const qp = new QueryProcessor(idx);
    const results = qp.search('typescript');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].document.id).toBe('1');
  });

  it('performs boolean AND search', () => {
    const idx = new InvertedIndex();
    docs.forEach(d => { idx.addDocument(d); });
    const qp = new QueryProcessor(idx);
    const results = qp.booleanSearch({ operator: 'AND', terms: ['react', 'typescript'] });
    expect(results.length).toBe(1);
    expect(results[0].document.id).toBe('3');
  });

  it('performs phrase search', () => {
    const idx = new InvertedIndex();
    idx.addDocument({ id: '4', title: 'Phrase', content: 'hello world test' });
    const qp = new QueryProcessor(idx);
    const results = qp.phraseSearch('hello world');
    expect(results.length).toBe(1);
  });
});
