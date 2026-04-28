import { describe, it, expect } from 'vitest';
import {
  SynonymDictionary,
  SpellCorrector,
  QueryNormalizer,
  QueryExpander
} from './query-expander.js';

describe('SynonymDictionary', () => {
  it('stores and retrieves synonyms', () => {
    const dict = new SynonymDictionary();
    dict.addSynonym('js', ['javascript']);
    expect(dict.getSynonyms('js')).toContain('javascript');
    expect(dict.getSynonyms('javascript')).toContain('js');
  });

  it('returns empty for unknown words', () => {
    const dict = new SynonymDictionary();
    expect(dict.getSynonyms('unknown')).toEqual([]);
  });
});

describe('SpellCorrector', () => {
  it('corrects misspelled words', () => {
    const corrector = new SpellCorrector();
    corrector.addWords(['javascript', 'typescript', 'python']);
    expect(corrector.correct('javascrpt')).toBe('javascript');
    expect(corrector.correct('typescrit')).toBe('typescript');
  });

  it('returns null for severely misspelled words', () => {
    const corrector = new SpellCorrector();
    corrector.addWords(['cat']);
    expect(corrector.correct('xyzabc123')).toBeNull();
  });

  it('returns original for correct words', () => {
    const corrector = new SpellCorrector();
    corrector.addWords(['hello']);
    expect(corrector.correct('hello')).toBe('hello');
  });
});

describe('QueryNormalizer', () => {
  it('normalizes case and removes punctuation', () => {
    const normalizer = new QueryNormalizer();
    expect(normalizer.normalize('Hello, World!')).toBe('hello world');
  });

  it('removes stop words', () => {
    const normalizer = new QueryNormalizer();
    const result = normalizer.normalize('the quick brown fox');
    expect(result).not.toContain('the');
    expect(result).toContain('quick');
  });

  it('stems words', () => {
    const normalizer = new QueryNormalizer();
    expect(normalizer.stem('running')).toBe('runn');
    expect(normalizer.stem('flies')).toBe('flie');
  });

  it('generates ngrams', () => {
    const normalizer = new QueryNormalizer();
    expect(normalizer.ngrams(['a', 'b', 'c'], 2)).toEqual(['a b', 'b c']);
  });
});

describe('QueryExpander', () => {
  it('expands with synonyms', () => {
    const expander = new QueryExpander();
    expander.addSynonyms('js', ['javascript']);
    const result = expander.expand('js tutorial');
    expect(result.expansions.some(e => e.includes('javascript'))).toBe(true);
  });

  it('suggests corrections', () => {
    const expander = new QueryExpander();
    expander.addDictionaryWords(['javascript']);
    const result = expander.expand('javascrpt');
    expect(result.corrections).toContain('javascript');
  });

  it('generates query variations', () => {
    const expander = new QueryExpander();
    expander.addSynonyms('foo', ['alpha']);
    const variations = expander.generateVariations('foo bar');
    expect(variations.length).toBeGreaterThan(0);
    expect(variations.some(v => v.includes('alpha'))).toBe(true);
  });
});
