import { describe, it, expect } from 'vitest';
import { WordEmbedding } from './word-embedding.js';

describe('WordEmbedding', () => {
  it('should initialize and retrieve vectors', () => {
    const emb = new WordEmbedding(10);
    emb.initialize(['hello', 'world']);
    expect(emb.getVector('hello')?.length).toBe(10);
    expect(emb.getVector('unknown')).toBeUndefined();
  });

  it('should compute sentence embedding as average', () => {
    const emb = new WordEmbedding(10);
    emb.initialize(['a', 'b']);
    const vec = emb.getSentenceEmbedding(['a', 'b']);
    expect(vec.length).toBe(10);
  });

  it('should compute cosine similarity', () => {
    const emb = new WordEmbedding(2);
    emb.initialize(['a', 'b']);
    const va = emb.getVector('a')!;
    const vb = emb.getVector('b')!;
    const sim = emb.cosineSimilarity(va, vb);
    expect(sim).toBeGreaterThanOrEqual(-1);
    expect(sim).toBeLessThanOrEqual(1);
  });

  it('should return zero vector for unknown words', () => {
    const emb = new WordEmbedding(5);
    emb.initialize(['known']);
    const vec = emb.getSentenceEmbedding(['unknown']);
    expect(vec.every(v => v === 0)).toBe(true);
  });
});
