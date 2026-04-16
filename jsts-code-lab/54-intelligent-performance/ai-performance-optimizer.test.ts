import { describe, it, expect } from 'vitest';
import { PerformancePredictionEngine, IntelligentPreloader, DynamicOptimizationEngine } from './ai-performance-optimizer';

describe('PerformancePredictionEngine', () => {
  it('returns empty predictions with insufficient history', () => {
    const engine = new PerformancePredictionEngine();
    expect(engine.predictPerformance()).toEqual([]);
  });

  it('predicts risk level high when trend exceeds poor threshold', () => {
    const engine = new PerformancePredictionEngine();
    for (let i = 0; i < 20; i++) {
      engine.recordMetrics({
        fcp: 1000,
        lcp: 2000 + i * 200, // will exceed 4000
        fid: 50,
        cls: 0.05,
        ttfb: 200,
        loadTime: 3000
      });
    }
    const preds = engine.predictPerformance(1);
    const lcpPred = preds.find(p => p.metric === 'lcp');
    expect(lcpPred).toBeDefined();
    expect(lcpPred!.riskLevel).toBe('high');
  });
});

describe('IntelligentPreloader', () => {
  it('predicts next pages based on navigation history', () => {
    const preloader = new IntelligentPreloader();
    preloader.recordNavigation('/home', '/products', 3000);
    preloader.recordNavigation('/home', '/products', 4000);
    preloader.recordNavigation('/home', '/about', 2000);
    const next = preloader.predictNextPages('/home');
    expect(next[0].page).toBe('/products');
  });

  it('prefetches immediately on mousedown intent', () => {
    const preloader = new IntelligentPreloader();
    let called = false;
    (preloader as any).doPrefetch = (page: string) => { called = true; };
    preloader.onUserIntent('mousedown', '/target');
    expect(called).toBe(true);
  });
});

describe('DynamicOptimizationEngine', () => {
  it('applies aggressive lazy loading when LCP > 4000', async () => {
    const engine = new DynamicOptimizationEngine();
    let actionCalled = false;
    (engine as any).strategies[0].action = () => { actionCalled = true; };
    (engine as any).evaluateAndOptimize({ fcp: 1000, lcp: 4500, fid: 50, cls: 0.05, ttfb: 200, loadTime: 3000 });
    expect(actionCalled).toBe(true);
  });
});
