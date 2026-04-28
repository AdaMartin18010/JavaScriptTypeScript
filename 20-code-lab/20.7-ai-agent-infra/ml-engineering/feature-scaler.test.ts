import { describe, it, expect } from 'vitest';
import { StandardScaler, MinMaxScaler } from './feature-scaler.js';

describe('StandardScaler', () => {
  it('should standardize to mean ~0 and std ~1', () => {
    const scaler = new StandardScaler();
    const X = [
      [1, 10],
      [2, 20],
      [3, 30],
      [4, 40]
    ];
    scaler.fit(X);
    const transformed = scaler.transform(X);

    const col0 = transformed.map(r => r[0]);
    const mean0 = col0.reduce((a, b) => a + b, 0) / col0.length;
    const std0 = Math.sqrt(col0.reduce((s, v) => s + v * v, 0) / col0.length);

    expect(mean0).toBeCloseTo(0, 6);
    expect(std0).toBeCloseTo(1, 6);
  });

  it('should inverse transform correctly', () => {
    const scaler = new StandardScaler();
    const X = [[1], [2], [3]];
    scaler.fit(X);
    const t = scaler.transform(X);
    const inv = scaler.inverseTransform(t);
    expect(inv[0][0]).toBeCloseTo(1, 6);
    expect(inv[1][0]).toBeCloseTo(2, 6);
    expect(inv[2][0]).toBeCloseTo(3, 6);
  });

  it('should throw before fit', () => {
    const scaler = new StandardScaler();
    expect(() => scaler.transform([[1]])).toThrow();
  });
});

describe('MinMaxScaler', () => {
  it('should scale to [0, 1]', () => {
    const scaler = new MinMaxScaler();
    const X = [[1], [2], [3], [4]];
    scaler.fit(X);
    const t = scaler.transform(X);
    expect(t[0][0]).toBeCloseTo(0, 6);
    expect(t[3][0]).toBeCloseTo(1, 6);
  });

  it('should inverse transform correctly', () => {
    const scaler = new MinMaxScaler();
    const X = [[10], [20], [30]];
    scaler.fit(X);
    const t = scaler.transform(X);
    const inv = scaler.inverseTransform(t);
    expect(inv[0][0]).toBeCloseTo(10, 6);
    expect(inv[2][0]).toBeCloseTo(30, 6);
  });
});
