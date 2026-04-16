import { describe, it, expect } from 'vitest';
import { CLSMonitor, LCPMonitor, FIDMonitor, INPMonitor, PerformanceCollector, PerformanceBudgetChecker, PerformanceAnalyzer } from './core-web-vitals';

describe('CLSMonitor', () => {
  it('returns metric with good rating when zero', () => {
    const m = new CLSMonitor();
    const metric = m.getMetric();
    expect(metric.name).toBe('CLS');
    expect(metric.value).toBe(0);
    expect(metric.rating).toBe('good');
  });
});

describe('LCPMonitor', () => {
  it('returns metric with rating', () => {
    const m = new LCPMonitor();
    const metric = m.getMetric();
    expect(metric.name).toBe('LCP');
    expect(['good', 'needs-improvement', 'poor']).toContain(metric.rating);
  });
});

describe('FIDMonitor', () => {
  it('returns metric with rating', () => {
    const m = new FIDMonitor();
    const metric = m.getMetric();
    expect(metric.name).toBe('FID');
    expect(['good', 'needs-improvement', 'poor']).toContain(metric.rating);
  });
});

describe('INPMonitor', () => {
  it('returns metric with rating when empty', () => {
    const m = new INPMonitor();
    const metric = m.getMetric();
    expect(metric.name).toBe('INP');
    expect(metric.value).toBe(0);
    expect(metric.rating).toBe('good');
  });
});

describe('PerformanceCollector', () => {
  it('starts and stops collecting', () => {
    const pc = new PerformanceCollector();
    pc.start();
    expect(pc.getMetrics().size).toBeGreaterThanOrEqual(0);
    const report = pc.stop();
    expect(report.metrics.size).toBeGreaterThanOrEqual(0);
    expect(report.deviceInfo.cores).toBeGreaterThan(0);
  });
});

describe('PerformanceBudgetChecker', () => {
  it('checks budgets and reports status', () => {
    const checker = new PerformanceBudgetChecker();
    checker.addBudget({ metric: 'lcp', max: 2500, warning: 2000 });
    const metrics = new Map();
    metrics.set('lcp', { name: 'LCP', value: 3000, rating: 'poor', entries: [] });
    const results = checker.check(metrics);
    expect(results[0].status).toBe('fail');
    expect(results[0].overBudget).toBe(500);
  });
});

describe('PerformanceAnalyzer', () => {
  it('generates report', () => {
    const report = PerformanceAnalyzer.generateReport();
    expect(report.summary).toBeDefined();
    expect(Array.isArray(report.recommendations)).toBe(true);
  });
});
