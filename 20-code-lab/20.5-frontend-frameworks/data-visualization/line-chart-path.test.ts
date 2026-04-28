import { describe, it, expect } from 'vitest';
import { LineChartPathGenerator } from './line-chart-path.js';

describe('LineChartPathGenerator', () => {
  const points = [
    { x: 0, y: 100 },
    { x: 50, y: 60 },
    { x: 100, y: 80 }
  ];

  it('generates line path with M and L commands', () => {
    const path = LineChartPathGenerator.generateLinePath(points);
    expect(path).toContain('M 0 100');
    expect(path).toContain('L 50 60');
    expect(path).toContain('L 100 80');
  });

  it('returns empty string for empty points', () => {
    expect(LineChartPathGenerator.generateLinePath([])).toBe('');
  });

  it('generates smooth path with C commands', () => {
    const path = LineChartPathGenerator.generateSmoothPath(points);
    expect(path).toContain('M 0 100');
    expect(path).toContain('C');
  });

  it('returns M only for single point', () => {
    const path = LineChartPathGenerator.generateSmoothPath([{ x: 10, y: 20 }]);
    expect(path).toBe('M 10 20');
  });

  it('generates step path', () => {
    const path = LineChartPathGenerator.generateStepPath(points);
    expect(path).toContain('L 50 100');
    expect(path).toContain('L 50 60');
    expect(path).toContain('L 100 60');
    expect(path).toContain('L 100 80');
  });

  it('generates area path', () => {
    const path = LineChartPathGenerator.generateAreaPath(points, 150);
    expect(path).toContain('M 0 100');
    expect(path).toContain('L 100 150');
    expect(path).toContain('L 0 150');
    expect(path).toContain('Z');
  });

  it('maps data points to coordinates', () => {
    const gen = new LineChartPathGenerator({ width: 400, height: 300 });
    const mapped = gen.mapPoints([0, 50, 100], ['A', 'B', 'C'], 300, 200);
    expect(mapped).toHaveLength(3);
    expect(mapped[0].x).toBe(0);
    expect(mapped[2].x).toBe(300);
  });

  it('generates complete SVG', () => {
    const gen = new LineChartPathGenerator({ width: 400, height: 300 });
    const datasets = [
      {
        label: 'Sales',
        points: [{ value: 10 }, { value: 20 }, { value: 15 }],
        color: '#3b82f6'
      }
    ];
    const svg = gen.generateSVG(datasets, ['Jan', 'Feb', 'Mar']);
    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
    expect(svg).toContain('path');
  });

  it('includes area fill when enabled', () => {
    const gen = new LineChartPathGenerator({ width: 400, height: 300 });
    const datasets = [
      {
        label: 'Sales',
        points: [{ value: 10 }, { value: 20 }],
        fill: true,
        fillOpacity: 0.3
      }
    ];
    const svg = gen.generateSVG(datasets, ['A', 'B']);
    expect(svg).toContain('opacity="0.3"');
  });
});
