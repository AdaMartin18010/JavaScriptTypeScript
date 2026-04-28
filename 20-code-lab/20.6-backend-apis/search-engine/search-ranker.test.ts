import { describe, it, expect } from 'vitest';
import {
  BM25Scorer,
  CompositeRanker,
  DedupEngine,
  MMRReRanker,
  RankingPipeline
} from './search-ranker.js';

describe('BM25Scorer', () => {
  const docs = [
    { id: '1', title: 'A', content: 'a b c', length: 100 },
    { id: '2', title: 'B', content: 'd e f', length: 100 }
  ];

  it('scores documents with BM25', () => {
    const scorer = new BM25Scorer(docs);
    const score = scorer.score('1', 'test', 3, 1);
    expect(score).toBeGreaterThan(0);
  });

  it('returns 0 for unknown document', () => {
    const scorer = new BM25Scorer(docs);
    expect(scorer.score('999', 'test', 1, 1)).toBe(0);
  });
});

describe('CompositeRanker', () => {
  it('combines multiple signals', () => {
    const ranker = new CompositeRanker();
    ranker.addSignal({ name: 's1', weight: 1, scoreFn: () => 1 });
    ranker.addSignal({ name: 's2', weight: 2, scoreFn: () => 0.5 });
    const docs = [{ id: '1', title: 'A', content: 'a', length: 10 }];
    const results = ranker.rank(docs, 'q');
    expect(results[0].score).toBe(2);
    expect(results[0].rank).toBe(1);
  });
});

describe('DedupEngine', () => {
  it('removes near-duplicate results', () => {
    const engine = new DedupEngine({ threshold: 0.7, fields: ['title', 'content'] });
    const results = [
      { document: { id: '1', title: 'TypeScript Guide', content: 'learn ts', length: 10 }, score: 1, rank: 1 },
      { document: { id: '2', title: 'TypeScript Guide', content: 'learn ts now', length: 10 }, score: 0.9, rank: 2 },
      { document: { id: '3', title: 'JavaScript Guide', content: 'learn js', length: 10 }, score: 0.8, rank: 3 }
    ];
    const deduped = engine.deduplicate(results);
    expect(deduped.length).toBe(2);
  });
});

describe('MMRReRanker', () => {
  it('re-ranks for diversity', () => {
    const reranker = new MMRReRanker();
    const results = [
      { document: { id: '1', title: 'TypeScript', content: 'ts ts ts', length: 10 }, score: 1.0, rank: 1 },
      { document: { id: '2', title: 'TypeScript Advanced', content: 'ts advanced', length: 10 }, score: 0.9, rank: 2 },
      { document: { id: '3', title: 'JavaScript', content: 'js js js', length: 10 }, score: 0.8, rank: 3 },
      { document: { id: '4', title: 'Python', content: 'py py py', length: 10 }, score: 0.7, rank: 4 }
    ];
    const mmr = reranker.reRank(results, 0.5, 3);
    expect(mmr.length).toBe(3);
    expect(mmr[0].rank).toBe(1);
  });
});

describe('RankingPipeline', () => {
  it('processes documents through pipeline', () => {
    const pipeline = new RankingPipeline();
    pipeline.addScoringSignal({ name: 'match', weight: 1, scoreFn: (doc, query) => doc.title.includes(query) ? 1 : 0 });
    const docs = [
      { id: '1', title: 'Hello', content: 'world', length: 10 },
      { id: '2', title: 'Hello World', content: 'test', length: 10 }
    ];
    const results = pipeline.process(docs, 'Hello', { maxResults: 2 });
    expect(results.length).toBe(2);
    expect(results[0].rank).toBe(1);
  });

  it('uses MMR when configured', () => {
    const pipeline = new RankingPipeline();
    pipeline.addScoringSignal({ name: 'match', weight: 1, scoreFn: () => 1 });
    const docs = [
      { id: '1', title: 'A', content: 'a', length: 10 },
      { id: '2', title: 'B', content: 'b', length: 10 },
      { id: '3', title: 'C', content: 'c', length: 10 }
    ];
    const results = pipeline.process(docs, 'q', { useMMR: true, maxResults: 2 });
    expect(results.length).toBe(2);
  });
});
