import { describe, it, expect } from 'vitest';
import { SentimentAnalyzer } from './sentiment-analyzer.js';

describe('SentimentAnalyzer', () => {
  it('should detect positive sentiment', () => {
    const a = new SentimentAnalyzer();
    const r = a.analyze('This is amazing and wonderful');
    expect(r.sentiment).toBe('positive');
    expect(r.score).toBeGreaterThan(0);
  });

  it('should detect negative sentiment', () => {
    const a = new SentimentAnalyzer();
    const r = a.analyze('This is terrible and awful');
    expect(r.sentiment).toBe('negative');
    expect(r.score).toBeLessThan(0);
  });

  it('should detect neutral sentiment', () => {
    const a = new SentimentAnalyzer();
    const r = a.analyze('The weather is cloudy today');
    expect(r.sentiment).toBe('neutral');
  });
});
