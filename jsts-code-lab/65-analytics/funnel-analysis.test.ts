import { describe, it, expect } from 'vitest';
import { FunnelAnalyzer, ConversionPathAnalyzer } from './funnel-analysis';

describe('FunnelAnalyzer', () => {
  const events = [
    { name: 'view', userId: 'u1', timestamp: 1, properties: { product: 'a' } },
    { name: 'cart', userId: 'u1', timestamp: 2, properties: {} },
    { name: 'buy', userId: 'u1', timestamp: 3, properties: {} },
    { name: 'view', userId: 'u2', timestamp: 1, properties: { product: 'b' } },
    { name: 'cart', userId: 'u2', timestamp: 2, properties: {} }
  ];

  it('computes step conversion rates', () => {
    const analyzer = new FunnelAnalyzer();
    const result = analyzer.analyze(events, [
      { name: 'View', event: 'view' },
      { name: 'Cart', event: 'cart' },
      { name: 'Buy', event: 'buy' }
    ]);
    expect(result[0].uniqueUsers).toBe(2);
    expect(result[1].uniqueUsers).toBe(2);
    expect(result[2].uniqueUsers).toBe(1);
    expect(result[2].conversionRate).toBe(50);
  });

  it('filters by time window', () => {
    const analyzer = new FunnelAnalyzer();
    const result = analyzer.analyze(events, [
      { name: 'View', event: 'view' },
      { name: 'Cart', event: 'cart' }
    ], { windowMs: 0 });
    expect(result[1].uniqueUsers).toBe(0);
  });

  it('analyzes by dimension', () => {
    const analyzer = new FunnelAnalyzer();
    const byDim = analyzer.analyzeByDimension(events, [
      { name: 'View', event: 'view' },
      { name: 'Cart', event: 'cart' }
    ], 'product');
    expect(byDim.has('a')).toBe(true);
    expect(byDim.has('b')).toBe(true);
  });
});

describe('ConversionPathAnalyzer', () => {
  const events = [
    { name: 'view', userId: 'u1', timestamp: 1, properties: {} },
    { name: 'cart', userId: 'u1', timestamp: 2, properties: {} },
    { name: 'buy', userId: 'u1', timestamp: 3, properties: {} },
    { name: 'view', userId: 'u2', timestamp: 1, properties: {} },
    { name: 'cart', userId: 'u2', timestamp: 2, properties: {} },
    { name: 'buy', userId: 'u2', timestamp: 3, properties: {} }
  ];

  it('finds common conversion paths', () => {
    const analyzer = new ConversionPathAnalyzer();
    const paths = analyzer.findCommonPaths(events, 'view', 'buy');
    expect(paths.length).toBe(1);
    expect(paths[0].path).toEqual(['view', 'cart', 'buy']);
  });
});
