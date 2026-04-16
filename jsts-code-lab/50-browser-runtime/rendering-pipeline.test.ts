import { describe, it, expect } from 'vitest';
import { RenderingPipelineMonitor, LayoutThrashingDetector, FastDOM, VirtualScrollCalculator } from './rendering-pipeline';

describe('RenderingPipelineMonitor', () => {
  it('records and analyzes metrics', () => {
    const monitor = new RenderingPipelineMonitor();
    monitor.startRecording();
    monitor.recordMetric({ timestamp: 1, phase: 'layout', duration: 25 });
    monitor.recordMetric({ timestamp: 2, phase: 'js', duration: 15 });
    const issues = monitor.analyzeBottlenecks();
    expect(issues.some(i => i.includes('Layout'))).toBe(true);
    expect(issues.some(i => i.includes('JavaScript'))).toBe(true);
  });
});

describe('LayoutThrashingDetector', () => {
  it('detects write-read pattern', () => {
    const detector = new LayoutThrashingDetector();
    detector.checkOperation('write', 'width');
    detector.checkOperation('read', 'offsetHeight');
    detector.checkOperation('write', 'height');
    detector.checkOperation('read', 'offsetWidth');
    expect(detector.getThrashingCount()).toBe(2);
    detector.reset();
    expect(detector.getThrashingCount()).toBe(0);
  });
});

describe('FastDOM', () => {
  it('batches reads before writes', async () => {
    const fastdom = new FastDOM();
    const order: string[] = [];
    fastdom.mutate(() => order.push('write1'));
    fastdom.measure(() => order.push('read1'));
    fastdom.mutate(() => order.push('write2'));
    await new Promise(r => setTimeout(r, 20));
    expect(order.indexOf('read1')).toBeLessThan(order.indexOf('write1'));
    expect(order.indexOf('read1')).toBeLessThan(order.indexOf('write2'));
  });
});

describe('VirtualScrollCalculator', () => {
  it('calculates visible range with overscan', () => {
    const calc = new VirtualScrollCalculator({ itemHeight: 50, containerHeight: 200, totalItems: 1000, overscan: 2 });
    const range = calc.calculateRange(100);
    expect(range.visible).toBe(4);
    expect(range.start).toBe(0);
    expect(range.end).toBe(8);
  });

  it('computes total height and offset', () => {
    const calc = new VirtualScrollCalculator({ itemHeight: 30, containerHeight: 300, totalItems: 100 });
    expect(calc.getTotalHeight()).toBe(3000);
    expect(calc.getOffset(10)).toBe(300);
  });
});
