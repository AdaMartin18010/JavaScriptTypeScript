import { describe, it, expect } from 'vitest';
import { BarChartSVGGenerator } from './bar-chart-svg.js';

describe('BarChartSVGGenerator', () => {
  const data = {
    labels: ['A', 'B'],
    datasets: [
      { label: 'X', data: [100, 200], color: '#3b82f6' },
      { label: 'Y', data: [50, 150], color: '#ef4444' }
    ]
  };

  it('calculates bars for vertical chart', () => {
    const gen = new BarChartSVGGenerator({ width: 400, height: 300 });
    const bars = gen.calculateBars(data);
    expect(bars.length).toBe(4);
    expect(bars[0].width).toBeGreaterThan(0);
    expect(bars[0].height).toBeGreaterThan(0);
  });

  it('calculates bars for horizontal chart', () => {
    const gen = new BarChartSVGGenerator({ width: 400, height: 300, horizontal: true });
    const bars = gen.calculateBars(data);
    expect(bars.length).toBe(4);
    expect(bars[0].width).toBeGreaterThan(0);
    expect(bars[0].height).toBeGreaterThan(0);
  });

  it('calculates bars for stacked chart', () => {
    const gen = new BarChartSVGGenerator({ width: 400, height: 300, stacked: true });
    const bars = gen.calculateBars(data);
    expect(bars.length).toBe(4);
    // 同一组内的柱子应有相同的 x 坐标（在垂直堆叠中）
    // bars[0] 和 bars[2] 都是 label A 的两个数据集
    const labelABars = bars.filter(b => b.dataIndex === 0);
    expect(labelABars[0].x).toBe(labelABars[1].x);
  });

  it('generates valid SVG string', () => {
    const gen = new BarChartSVGGenerator({ width: 400, height: 300 });
    const svg = gen.generateSVG(data);
    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
    expect(svg).toContain('<rect');
    expect(svg).toContain('fill="#3b82f6"');
  });

  it('includes grid lines when enabled', () => {
    const gen = new BarChartSVGGenerator({ width: 400, height: 300, showGrid: true });
    const svg = gen.generateSVG(data);
    expect(svg).toContain('<line');
  });

  it('includes labels when enabled', () => {
    const gen = new BarChartSVGGenerator({ width: 400, height: 300, showLabels: true });
    const svg = gen.generateSVG(data);
    expect(svg).toContain('A');
    expect(svg).toContain('B');
  });

  it('uses value formatter', () => {
    const gen = new BarChartSVGGenerator({
      width: 400,
      height: 300,
      showValues: true,
      valueFormatter: (v: number) => `$${v}`
    });
    const svg = gen.generateSVG(data);
    expect(svg).toContain('$100');
  });
});
