// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import { SVGChartRenderer, CanvasChartRenderer, ChartFactory } from './chart-architecture.js';

describe('ChartFactory', () => {
  it('creates SVG renderer', () => {
    const container = document.createElement('div');
    const renderer = ChartFactory.create('svg', container, 400, 300);
    expect(renderer).toBeInstanceOf(SVGChartRenderer);
  });

  it('creates Canvas renderer', () => {
    const container = document.createElement('div');
    const renderer = ChartFactory.create('canvas', container, 400, 300);
    expect(renderer).toBeInstanceOf(CanvasChartRenderer);
  });

  it('throws for unknown type', () => {
    expect(() => ChartFactory.create('unknown' as any, document.createElement('div'), 400, 300)).toThrow('Unknown chart type');
  });
});

describe('SVGChartRenderer', () => {
  it('appends svg bars on render', () => {
    const container = document.createElement('div');
    const renderer = new SVGChartRenderer(container, 200, 100);
    renderer.render({ labels: ['A'], datasets: [{ label: 'D1', data: [10], color: '#f00' }] });
    expect(container.querySelector('svg')).not.toBeNull();
    expect(container.querySelectorAll('rect').length).toBeGreaterThan(0);
    renderer.destroy();
  });
});

describe('CanvasChartRenderer', () => {
  it('draws bars on render', () => {
    const fillRect = vi.fn();
    const clearRect = vi.fn();
    const orig = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({ fillRect, clearRect, fillStyle: '' }) as any);
    const container = document.createElement('div');
    const renderer = new CanvasChartRenderer(container, 200, 100);
    renderer.render({ labels: ['A'], datasets: [{ label: 'D1', data: [10] }] });
    expect(fillRect).toHaveBeenCalled();
    renderer.destroy();
    HTMLCanvasElement.prototype.getContext = orig;
  });
});
