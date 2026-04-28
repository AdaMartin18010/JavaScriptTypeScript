import { describe, it, expect } from 'vitest';
import { NaiveBayesClassifier } from './text-classifier.js';

describe('NaiveBayesClassifier', () => {
  it('should train and predict', () => {
    const classifier = new NaiveBayesClassifier();
    classifier.train([
      { text: 'good product', label: 'pos' },
      { text: 'bad product', label: 'neg' }
    ]);

    const p1 = classifier.predict('good');
    const p2 = classifier.predict('bad');

    expect(p1.label).toBe('pos');
    expect(p2.label).toBe('neg');
    expect(p1.confidence).toBeGreaterThan(0);
  });

  it('should evaluate accuracy', () => {
    const classifier = new NaiveBayesClassifier();
    classifier.train([
      { text: 'good product', label: 'pos' },
      { text: 'bad product', label: 'neg' }
    ]);
    const acc = classifier.evaluate([
      { text: 'good', label: 'pos' },
      { text: 'bad', label: 'neg' }
    ]);
    expect(acc).toBeGreaterThanOrEqual(0);
    expect(acc).toBeLessThanOrEqual(1);
  });
});
