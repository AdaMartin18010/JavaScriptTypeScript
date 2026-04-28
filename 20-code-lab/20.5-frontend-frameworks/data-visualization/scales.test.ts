import { describe, it, expect } from 'vitest';
import { LinearScale, OrdinalScale, BandScale, ThresholdScale, LogScale } from './scales.js';

describe('LinearScale', () => {
  it('maps domain to range', () => {
    const scale = new LinearScale([0, 100], [0, 500]);
    expect(scale.scale(0)).toBe(0);
    expect(scale.scale(100)).toBe(500);
    expect(scale.scale(50)).toBe(250);
  });

  it('supports inverted ranges', () => {
    const scale = new LinearScale([0, 100], [500, 0]);
    expect(scale.scale(0)).toBe(500);
    expect(scale.scale(100)).toBe(0);
  });

  it('inverts range to domain', () => {
    const scale = new LinearScale([0, 100], [0, 500]);
    expect(scale.invert(250)).toBe(50);
  });

  it('clamps values when enabled', () => {
    const scale = new LinearScale([0, 100], [0, 500], { clamp: true });
    expect(scale.scale(150)).toBe(500);
    expect(scale.scale(-50)).toBe(0);
  });

  it('generates ticks', () => {
    const scale = new LinearScale([0, 100], [0, 500]);
    const ticks = scale.ticks(4);
    expect(ticks).toHaveLength(5);
    expect(ticks[0]).toBe(0);
    expect(ticks[4]).toBe(100);
  });

  it('updates domain and range', () => {
    const scale = new LinearScale([0, 100], [0, 500]);
    scale.setDomain([0, 200]);
    expect(scale.scale(200)).toBe(500);
  });
});

describe('OrdinalScale', () => {
  it('maps domain values to range values', () => {
    const scale = new OrdinalScale(['A', 'B', 'C'], ['red', 'green', 'blue']);
    expect(scale.scale('A')).toBe('red');
    expect(scale.scale('B')).toBe('green');
  });

  it('cycles range when domain is larger', () => {
    const scale = new OrdinalScale(['A', 'B', 'C', 'D'], ['red', 'blue']);
    expect(scale.scale('C')).toBe('red');
    expect(scale.scale('D')).toBe('blue');
  });

  it('returns fallback for unknown values', () => {
    const scale = new OrdinalScale(['A'], ['red']);
    scale.setFallback('gray');
    expect(scale.scale('B')).toBe('gray');
  });

  it('returns domain and range', () => {
    const scale = new OrdinalScale(['A', 'B'], ['red', 'blue']);
    expect(scale.domain()).toEqual(['A', 'B']);
    expect(scale.range()).toEqual(['red', 'blue']);
  });
});

describe('BandScale', () => {
  it('scales domain values to band start positions', () => {
    const scale = new BandScale(['A', 'B', 'C'], [0, 300]);
    expect(scale.scale('A')).toBeGreaterThanOrEqual(0);
    expect(scale.scale('B')).toBeGreaterThan(scale.scale('A'));
  });

  it('calculates bandwidth', () => {
    const scale = new BandScale(['A', 'B'], [0, 200], { paddingInner: 0, paddingOuter: 0 });
    expect(scale.bandwidth()).toBeCloseTo(100, 0);
  });

  it('returns step greater than bandwidth with padding', () => {
    const scale = new BandScale(['A', 'B'], [0, 200], { paddingInner: 0.2 });
    expect(scale.step()).toBeGreaterThan(scale.bandwidth());
  });

  it('returns tick positions at band centers', () => {
    const scale = new BandScale(['A', 'B'], [0, 200]);
    const ticks = scale.ticks();
    expect(ticks).toHaveLength(2);
  });
});

describe('ThresholdScale', () => {
  it('maps values below threshold to first output', () => {
    const scale = new ThresholdScale([50, 100], ['low', 'medium', 'high']);
    expect(scale.scale(25)).toBe('low');
  });

  it('maps values between thresholds correctly', () => {
    const scale = new ThresholdScale([50, 100], ['low', 'medium', 'high']);
    expect(scale.scale(75)).toBe('medium');
  });

  it('maps values above highest threshold to last output', () => {
    const scale = new ThresholdScale([50, 100], ['low', 'medium', 'high']);
    expect(scale.scale(150)).toBe('high');
  });

  it('throws when thresholds and outputs mismatch', () => {
    expect(() => new ThresholdScale([50], ['low', 'medium', 'high'])).toThrow();
  });
});

describe('LogScale', () => {
  it('maps positive domain to range', () => {
    const scale = new LogScale([1, 1000], [0, 300]);
    expect(scale.scale(1)).toBe(0);
    expect(scale.scale(1000)).toBe(300);
  });

  it('returns rangeMin for non-positive values', () => {
    const scale = new LogScale([1, 100], [0, 100]);
    expect(scale.scale(0)).toBe(0);
    expect(scale.scale(-5)).toBe(0);
  });

  it('inverts range to domain', () => {
    const scale = new LogScale([1, 1000], [0, 300]);
    expect(scale.invert(150)).toBeCloseTo(Math.sqrt(1000), -1);
  });

  it('throws for non-positive domain', () => {
    expect(() => new LogScale([0, 100], [0, 300])).toThrow();
  });

  it('generates logarithmically spaced ticks', () => {
    const scale = new LogScale([1, 1000], [0, 300]);
    const ticks = scale.ticks(3);
    expect(ticks[0]).toBe(1);
    expect(ticks[ticks.length - 1]).toBeCloseTo(1000, 0);
  });
});
