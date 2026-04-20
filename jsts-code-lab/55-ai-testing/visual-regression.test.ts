import { describe, it, expect } from 'vitest';
import {
  PixelComparator,
  PerceptualComparator,
  VisualAnomalyDetector,
  BaselineManager,
  VisualRegressionTester,
  createScreenshot
} from './visual-regression.js';

describe('createScreenshot', () => {
  it('creates a screenshot with correct dimensions', () => {
    const ss = createScreenshot('test', 10, 10, [255, 0, 0, 255]);
    expect(ss.width).toBe(10);
    expect(ss.height).toBe(10);
    expect(ss.pixels.length).toBe(400);
  });

  it('fills pixels with the given color', () => {
    const ss = createScreenshot('test', 2, 2, [10, 20, 30, 40]);
    expect(ss.pixels[0]).toBe(10);
    expect(ss.pixels[1]).toBe(20);
    expect(ss.pixels[2]).toBe(30);
    expect(ss.pixels[3]).toBe(40);
    expect(ss.pixels[4]).toBe(10);
  });
});

describe('PixelComparator', () => {
  it('reports no diff for identical screenshots', () => {
    const a = createScreenshot('a', 10, 10, [100, 100, 100, 255]);
    const b = createScreenshot('b', 10, 10, [100, 100, 100, 255]);
    const comp = new PixelComparator();
    const result = comp.compare(a, b);
    expect(result.diffCount).toBe(0);
    expect(result.passed).toBe(true);
  });

  it('detects pixel differences', () => {
    const a = createScreenshot('a', 10, 10, [0, 0, 0, 255]);
    const b = createScreenshot('b', 10, 10, [255, 255, 255, 255]);
    const comp = new PixelComparator();
    const result = comp.compare(a, b);
    expect(result.diffCount).toBe(100);
    expect(result.diffPercentage).toBe(1);
    expect(result.passed).toBe(false);
  });

  it('handles size mismatch', () => {
    const a = createScreenshot('a', 10, 10, [0, 0, 0, 255]);
    const b = createScreenshot('b', 20, 20, [0, 0, 0, 255]);
    const comp = new PixelComparator();
    const result = comp.compare(a, b);
    expect(result.passed).toBe(false);
    expect(result.diffPercentage).toBe(1);
  });
});

describe('PerceptualComparator', () => {
  it('passes for identical screenshots', () => {
    const a = createScreenshot('a', 16, 16, [128, 128, 128, 255]);
    const b = createScreenshot('b', 16, 16, [128, 128, 128, 255]);
    const comp = new PerceptualComparator();
    const result = comp.compare(a, b);
    expect(result.passed).toBe(true);
    expect(result.similarityScore).toBeGreaterThan(0.95);
  });

  it('detects perceptual differences', () => {
    const a = createScreenshot('a', 16, 16, [0, 0, 0, 255]);
    const b = createScreenshot('b', 16, 16, [255, 255, 255, 255]);
    const comp = new PerceptualComparator();
    const result = comp.compare(a, b);
    expect(result.passed).toBe(false);
    expect(result.similarityScore).toBeLessThan(0.95);
  });

  it('returns regions for differing screenshots', () => {
    const a = createScreenshot('a', 16, 16, [0, 0, 0, 255]);
    const b = createScreenshot('b', 16, 16, [255, 0, 0, 255]);
    const comp = new PerceptualComparator();
    const result = comp.compare(a, b);
    expect(result.regions.length).toBeGreaterThan(0);
  });
});

describe('VisualAnomalyDetector', () => {
  it('detects anomalies in different screenshots', () => {
    const baseline = createScreenshot('bl', 32, 32, [0, 120, 255, 255]);
    const current = createScreenshot('cur', 32, 32, [255, 60, 60, 255]);
    const detector = new VisualAnomalyDetector();
    const anomalies = detector.detectAnomalies(baseline, current, [
      { x: 0, y: 0, width: 32, height: 32, severity: 'high', type: 'structural' }
    ]);
    expect(anomalies.length).toBeGreaterThan(0);
    expect(anomalies[0].confidence).toBeGreaterThan(0);
    expect(anomalies[0].description).toBeDefined();
  });

  it('sorts anomalies by confidence descending', () => {
    const baseline = createScreenshot('bl', 32, 32, [0, 0, 0, 255]);
    const current = createScreenshot('cur', 32, 32, [255, 255, 255, 255]);
    const detector = new VisualAnomalyDetector();
    const anomalies = detector.detectAnomalies(baseline, current, [
      { x: 0, y: 0, width: 10, height: 10, severity: 'low', type: 'pixel' },
      { x: 10, y: 10, width: 20, height: 20, severity: 'high', type: 'structural' }
    ]);
    for (let i = 1; i < anomalies.length; i++) {
      expect(anomalies[i - 1].confidence).toBeGreaterThanOrEqual(anomalies[i].confidence);
    }
  });
});

describe('BaselineManager', () => {
  it('approves and retrieves a baseline', () => {
    const mgr = new BaselineManager();
    const ss = createScreenshot('test', 10, 10, [0, 0, 0, 255]);
    const baseline = mgr.approve('login-page', ss, 'user-a');
    expect(baseline.name).toBe('login-page');
    expect(baseline.approvedBy).toBe('user-a');
    expect(baseline.version).toBe(1);

    const retrieved = mgr.getBaseline('login-page');
    expect(retrieved).toBeDefined();
    expect(retrieved!.id).toBe(baseline.id);
  });

  it('increments version on update', () => {
    const mgr = new BaselineManager();
    const ss1 = createScreenshot('s1', 10, 10, [0, 0, 0, 255]);
    const ss2 = createScreenshot('s2', 10, 10, [255, 255, 255, 255]);
    mgr.approve('page', ss1, 'a');
    mgr.approve('page', ss2, 'b');
    const latest = mgr.getBaseline('page');
    expect(latest!.version).toBe(2);
    expect(latest!.approvedBy).toBe('b');
  });

  it('lists all baselines', () => {
    const mgr = new BaselineManager();
    mgr.approve('a', createScreenshot('a', 1, 1, [0, 0, 0, 255]), 'u');
    mgr.approve('b', createScreenshot('b', 1, 1, [0, 0, 0, 255]), 'u');
    expect(mgr.listBaselines()).toHaveLength(2);
  });

  it('removes a baseline', () => {
    const mgr = new BaselineManager();
    mgr.approve('x', createScreenshot('x', 1, 1, [0, 0, 0, 255]), 'u');
    expect(mgr.hasBaseline('x')).toBe(true);
    mgr.removeBaseline('x');
    expect(mgr.hasBaseline('x')).toBe(false);
  });
});

describe('VisualRegressionTester', () => {
  it('auto-approves baseline on first test', () => {
    const tester = new VisualRegressionTester();
    const ss = createScreenshot('page', 10, 10, [0, 0, 255, 255]);
    const result = tester.test('page', ss);
    expect(result.passed).toBe(true);
    expect(tester.baselines.hasBaseline('page')).toBe(true);
  });

  it('detects regression against existing baseline', () => {
    const tester = new VisualRegressionTester();
    const baseline = createScreenshot('page', 10, 10, [0, 0, 255, 255]);
    tester.test('page', baseline); // auto-approve

    const current = createScreenshot('page', 10, 10, [255, 0, 0, 255]);
    const result = tester.test('page', current);
    expect(result.passed).toBe(false);
    expect(result.pixelDiff.diffPercentage).toBe(1);
    expect(result.anomalies.length).toBeGreaterThan(0);
  });

  it('passes when screenshot matches baseline', () => {
    const tester = new VisualRegressionTester();
    const ss = createScreenshot('page', 10, 10, [100, 100, 100, 255]);
    tester.test('page', ss);
    const result = tester.test('page', ss);
    expect(result.passed).toBe(true);
  });

  it('runs batch tests', () => {
    const tester = new VisualRegressionTester();
    const results = tester.testBatch([
      { name: 'a', screenshot: createScreenshot('a', 8, 8, [0, 0, 0, 255]) },
      { name: 'b', screenshot: createScreenshot('b', 8, 8, [0, 0, 0, 255]) }
    ]);
    expect(results).toHaveLength(2);
    expect(results.every(r => r.passed)).toBe(true);
  });
});
