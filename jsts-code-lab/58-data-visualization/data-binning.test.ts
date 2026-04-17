import { describe, it, expect } from 'vitest';
import { BinningCalculator, HistogramGenerator, GridBinning } from './data-binning.js';

describe('BinningCalculator', () => {
  const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  it('calculates equal width thresholds', () => {
    const thresholds = BinningCalculator.equalWidthThresholds(data, 5);
    expect(thresholds).toHaveLength(4);
    expect(thresholds[0]).toBe(2.8);
    expect(thresholds[3]).toBeCloseTo(8.2, 1);
  });

  it('calculates quantile thresholds', () => {
    const thresholds = BinningCalculator.quantileThresholds(data, 5);
    expect(thresholds).toHaveLength(4);
  });

  it('calculates nice thresholds', () => {
    const thresholds = BinningCalculator.niceThresholds(data, 5);
    expect(thresholds.length).toBeGreaterThan(0);
    // Nice thresholds should be round numbers
    thresholds.forEach(t => {
      expect(Number.isInteger(t)).toBe(true);
    });
  });
});

describe('HistogramGenerator', () => {
  const data = [1, 2, 2, 3, 3, 3, 4, 5];

  it('generates bins with correct counts', () => {
    const bins = HistogramGenerator.equalWidth(data, 4);
    const totalCount = bins.reduce((sum, b) => sum + b.count, 0);
    expect(totalCount).toBe(data.length);
  });

  it('places values in correct bins', () => {
    const bins = HistogramGenerator.equalWidth([1, 2, 3, 4], 2);
    expect(bins).toHaveLength(2);
    expect(bins[0].count).toBe(2); // 1, 2
    expect(bins[1].count).toBe(2); // 3, 4
  });

  it('stores values in bins', () => {
    const bins = HistogramGenerator.equalWidth([1, 2, 3], 3);
    expect(bins[0].values).toContain(1);
    expect(bins[1].values).toContain(2);
    expect(bins[2].values).toContain(3);
  });

  it('includes max value in last bin', () => {
    const bins = HistogramGenerator.equalWidth([1, 2, 3, 4], 2);
    expect(bins[bins.length - 1].values).toContain(4);
  });

  it('generates nice bins', () => {
    const bins = HistogramGenerator.niceBins([1, 2, 3, 4, 5], 2);
    expect(bins.length).toBeGreaterThan(0);
  });
});

describe('GridBinning', () => {
  it('bins 2D points into grid cells', () => {
    const points = [
      { x: 0.5, y: 0.5 },
      { x: 0.6, y: 0.6 },
      { x: 2, y: 2 }
    ];
    const bins = GridBinning.bin(points, 1);
    expect(bins.length).toBeGreaterThan(0);

    const totalPoints = bins.reduce((sum, b) => sum + b.count, 0);
    expect(totalPoints).toBe(points.length);
  });

  it('groups nearby points in same cell', () => {
    const points = [
      { x: 0.5, y: 0.5 },
      { x: 0.6, y: 0.6 }
    ];
    const bins = GridBinning.bin(points, 1);
    expect(bins).toHaveLength(1);
    expect(bins[0].count).toBe(2);
  });

  it('finds densest bin', () => {
    const points = [
      { x: 0.1, y: 0.1 }, { x: 0.2, y: 0.2 },
      { x: 5, y: 5 }
    ];
    const bins = GridBinning.bin(points, 1);
    const densest = GridBinning.densest(bins);
    expect(densest).not.toBeNull();
    expect(densest!.count).toBe(2);
  });

  it('returns null for empty bins', () => {
    expect(GridBinning.densest([])).toBeNull();
  });
});
