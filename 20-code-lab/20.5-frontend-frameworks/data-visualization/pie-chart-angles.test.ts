import { describe, it, expect } from 'vitest';
import { PieChartAngleCalculator, PieChartSVGGenerator } from './pie-chart-angles.js';

describe('PieChartAngleCalculator', () => {
  const data = [
    { label: 'A', value: 30 },
    { label: 'B', value: 50 },
    { label: 'C', value: 20 }
  ];

  it('converts degrees to radians', () => {
    expect(PieChartAngleCalculator.toRadians(180)).toBeCloseTo(Math.PI, 5);
    expect(PieChartAngleCalculator.toRadians(90)).toBeCloseTo(Math.PI / 2, 5);
  });

  it('converts radians to degrees', () => {
    expect(PieChartAngleCalculator.toDegrees(Math.PI)).toBeCloseTo(180, 5);
    expect(PieChartAngleCalculator.toDegrees(Math.PI / 2)).toBeCloseTo(90, 5);
  });

  it('calculates slices with correct percentages', () => {
    const slices = PieChartAngleCalculator.calculateSlices(data, { radius: 100 });
    expect(slices).toHaveLength(3);
    expect(slices[0].percentage).toBe(0.3);
    expect(slices[1].percentage).toBe(0.5);
    expect(slices[2].percentage).toBe(0.2);
  });

  it('calculates slice angles summing to 360', () => {
    const slices = PieChartAngleCalculator.calculateSlices(data, { radius: 100 });
    const last = slices[slices.length - 1];
    expect(last.endAngle).toBeCloseTo(360, 5);
  });

  it('returns empty array for empty data', () => {
    const slices = PieChartAngleCalculator.calculateSlices([], { radius: 100 });
    expect(slices).toHaveLength(0);
  });

  it('returns empty array for zero total', () => {
    const slices = PieChartAngleCalculator.calculateSlices([{ label: 'A', value: 0 }], { radius: 100 });
    expect(slices).toHaveLength(0);
  });

  it('converts polar to cartesian', () => {
    const pos = PieChartAngleCalculator.polarToCartesian(100, 100, 50, 0);
    expect(pos.x).toBeCloseTo(150, 5);
    expect(pos.y).toBeCloseTo(100, 5);
  });

  it('generates solid pie slice path', () => {
    const path = PieChartAngleCalculator.generateSlicePath(100, 100, 80, 0, 0, 90);
    expect(path).toContain('M 100 100');
    expect(path).toContain('A 80 80');
    expect(path).toContain('Z');
  });

  it('generates donut slice path', () => {
    const path = PieChartAngleCalculator.generateSlicePath(100, 100, 80, 40, 0, 90);
    expect(path).not.toContain('M 100 100');
    expect(path).toContain('A 80 80');
    expect(path).toContain('A 40 40');
    expect(path).toContain('Z');
  });

  it('calculates label position', () => {
    const pos = PieChartAngleCalculator.calculateLabelPosition(100, 100, 80, 0);
    expect(pos.x).toBeDefined();
    expect(pos.y).toBeDefined();
    expect(pos.anchor).toBe('start');
  });

  it('uses pad angle', () => {
    const slices = PieChartAngleCalculator.calculateSlices(data, { radius: 100, padAngle: 10 });
    const last = slices[slices.length - 1];
    expect(last.endAngle).toBeLessThanOrEqual(360);
  });
});

describe('PieChartSVGGenerator', () => {
  it('generates SVG string', () => {
    const svg = PieChartSVGGenerator.generate([
      { label: 'A', value: 30 },
      { label: 'B', value: 70 }
    ]);
    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
    expect(svg).toContain('<path');
  });

  it('includes labels when enabled', () => {
    const svg = PieChartSVGGenerator.generate(
      [{ label: 'A', value: 50 }],
      { showLabels: true }
    );
    expect(svg).toContain('A');
  });
});
