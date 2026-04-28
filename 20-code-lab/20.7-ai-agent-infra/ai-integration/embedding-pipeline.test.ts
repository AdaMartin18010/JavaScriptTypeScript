import { describe, it, expect } from 'vitest';
import {
  FixedSizeChunking,
  SemanticChunking,
  RecursiveChunking,
  InMemoryVectorStore,
  HybridSearchEngine,
  EmbeddingPipeline
} from './embedding-pipeline.js';

describe('FixedSizeChunking', () => {
  it('splits text into fixed chunks', () => {
    const chunker = new FixedSizeChunking();
    const chunks = chunker.chunk('abcdefghijklmnopqrstuvwxyz', { chunkSize: 10, overlap: 2 });
    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks[0].content.length).toBeLessThanOrEqual(10);
  });
});

describe('SemanticChunking', () => {
  it('preserves paragraph boundaries', () => {
    const chunker = new SemanticChunking();
    const text = 'Paragraph one.\n\nParagraph two.\n\nParagraph three.';
    const chunks = chunker.chunk(text, { chunkSize: 100, overlap: 0 });
    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks[0].metadata.strategy).toBe('semantic');
  });
});

describe('RecursiveChunking', () => {
  it('recursively splits large text', () => {
    const chunker = new RecursiveChunking();
    const chunks = chunker.chunk('a b c d e f g h i j', { chunkSize: 5, overlap: 0 });
    expect(chunks.length).toBeGreaterThan(0);
  });
});

describe('InMemoryVectorStore', () => {
  it('adds and searches vectors', async () => {
    const store = new InMemoryVectorStore();
    await store.add({
      id: '1',
      vector: [1, 0, 0],
      text: 'first',
      metadata: {}
    });
    await store.add({
      id: '2',
      vector: [0, 1, 0],
      text: 'second',
      metadata: {}
    });

    const results = await store.search([1, 0, 0], 2);
    expect(results.length).toBe(2);
    expect(results[0].record.id).toBe('1');
    expect(results[0].score).toBeCloseTo(1, 5);
  });

  it('filters by metadata', async () => {
    const store = new InMemoryVectorStore();
    await store.add({ id: 'a', vector: [1, 0], text: 'a', metadata: { tag: 'x' } });
    await store.add({ id: 'b', vector: [1, 0], text: 'b', metadata: { tag: 'y' } });

    const results = await store.search([1, 0], 2, { tag: 'x' });
    expect(results.length).toBe(1);
    expect(results[0].record.id).toBe('a');
  });

  it('supports numeric metadata filters', async () => {
    const store = new InMemoryVectorStore();
    await store.add({ id: 'a', vector: [1, 0], text: 'a', metadata: { priority: 5 } });
    await store.add({ id: 'b', vector: [1, 0], text: 'b', metadata: { priority: 10 } });

    const results = await store.search([1, 0], 2, { priority: { $gt: 3, $lt: 8 } });
    expect(results.length).toBe(1);
    expect(results[0].record.id).toBe('a');
  });

  it('deletes records', async () => {
    const store = new InMemoryVectorStore();
    await store.add({ id: '1', vector: [1], text: 't', metadata: {} });
    await store.delete('1');
    expect(await store.count()).toBe(0);
  });
});

describe('HybridSearchEngine', () => {
  it('combines vector and keyword scores', async () => {
    const store = new InMemoryVectorStore();
    await store.add({ id: '1', vector: [1, 0, 0], text: 'hello world', metadata: {} });
    await store.add({ id: '2', vector: [0, 1, 0], text: 'foo bar', metadata: {} });

    const hybrid = new HybridSearchEngine(store);
    const results = await hybrid.search([1, 0, 0], 'hello', 2);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].keywordScore).toBeGreaterThan(0);
    expect(results[0].vectorScore).toBeGreaterThan(0);
  });
});

describe('EmbeddingPipeline', () => {
  it('ingests and queries documents', async () => {
    const pipeline = new EmbeddingPipeline({
      chunking: new FixedSizeChunking(),
      chunkOptions: { chunkSize: 20, overlap: 5 },
      vectorStore: new InMemoryVectorStore(),
      embedFn: (text: string) => [text.length / 100, 0, 0]
    });

    await pipeline.ingest('hello world this is a test', { source: 'test' });
    const results = await pipeline.query('hello', 3);
    expect(results.length).toBeGreaterThan(0);
  });
});
