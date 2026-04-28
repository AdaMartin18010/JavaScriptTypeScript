import { describe, it, expect } from 'vitest';
import { TFIDFVectorizer } from './tfidf-vectorizer.js';

describe('TFIDFVectorizer', () => {
  it('should fit and transform', () => {
    const v = new TFIDFVectorizer();
    const docs = [
      ['the', 'cat', 'sat'],
      ['the', 'dog', 'sat']
    ];
    const vectors = v.fitTransform(docs);
    expect(vectors.length).toBe(2);
    expect(v.getVocabulary().size).toBeGreaterThan(0);
  });

  it('should normalize vectors', () => {
    const v = new TFIDFVectorizer();
    const docs = [['hello', 'world']];
    v.fit(docs);
    const vec = v.transform(docs[0]);
    const norm = Math.sqrt(vec.reduce((s, x) => s + x * x, 0));
    expect(norm).toBeCloseTo(1, 6);
  });
});
