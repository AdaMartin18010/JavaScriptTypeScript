import { describe, it, expect } from 'vitest';
import {
  ModuleLoader,
  RouteBasedCodeSplitter,
  ResourceHintsManager,
  BundleAnalyzer,
  CompressionOptimizer,
  createUtils,
  mathUtils,
  demo
} from './bundle-optimization';

describe('bundle-optimization', () => {
  describe('ModuleLoader', () => {
    it('should load and cache modules', async () => {
      const loader = new ModuleLoader();
      const mod = await loader.load('test', async () => ({ default: 42 }));
      expect(mod).toBe(42);
      const cached = await loader.load('test', async () => ({ default: 99 }));
      expect(cached).toBe(42);
    });

    it('should clear cache', async () => {
      const loader = new ModuleLoader();
      await loader.load('test', async () => ({ default: 1 }));
      loader.clearCache();
      const mod = await loader.load('test', async () => ({ default: 2 }));
      expect(mod).toBe(2);
    });
  });

  describe('RouteBasedCodeSplitter', () => {
    it('should load registered routes', async () => {
      const router = new RouteBasedCodeSplitter();
      router.registerRoute({
        path: '/home',
        component: async () => ({ default: { name: 'Home' } })
      });
      const mod = await router.loadRoute('/home');
      expect(mod).toEqual({ name: 'Home' });
    });

    it('should return null for unregistered routes', async () => {
      const router = new RouteBasedCodeSplitter();
      expect(await router.loadRoute('/missing')).toBeNull();
    });
  });

  describe('ResourceHintsManager', () => {
    it('should track added hints', () => {
      const manager = new ResourceHintsManager();
      manager.addHint({ rel: 'preload', href: '/font.woff2', as: 'font' });
      // duplicate should be ignored
      manager.addHint({ rel: 'preload', href: '/font.woff2', as: 'font' });
    });

    it('should preload critical resources', () => {
      const manager = new ResourceHintsManager();
      manager.preloadCriticalResources([{ href: '/style.css', as: 'style' }]);
    });
  });

  describe('BundleAnalyzer', () => {
    it('should calculate total size and percentages', () => {
      const analyzer = new BundleAnalyzer();
      analyzer.addModule('react', 1000);
      analyzer.addModule('lodash', 500);
      const analysis = analyzer.analyze();
      expect(analysis.totalSize).toBe(1500);
      expect(analysis.modules[0].percentage).toBeCloseTo(66.7, 0);
    });

    it('should detect duplicate base names', () => {
      const analyzer = new BundleAnalyzer();
      analyzer.addModule('node_modules/lodash/index.js', 500);
      analyzer.addModule('vendor/lodash/index.js', 500);
      const analysis = analyzer.analyze();
      expect(analysis.duplicates.length).toBe(1);
      expect(analysis.duplicates[0].module).toBe('index.js');
    });

    it('should generate report', () => {
      const analyzer = new BundleAnalyzer();
      analyzer.addModule('a', 1024);
      const report = analyzer.generateReport();
      expect(report).toContain('包分析报告');
      expect(report).toContain('a');
    });
  });

  describe('CompressionOptimizer', () => {
    it('should estimate gzip compression', () => {
      const optimizer = new CompressionOptimizer();
      const result = optimizer.estimateGzip(1000);
      expect(result.method).toBe('gzip');
      expect(result.compressedSize).toBeLessThan(result.originalSize);
    });

    it('should estimate brotli compression', () => {
      const optimizer = new CompressionOptimizer();
      const result = optimizer.estimateBrotli(1000);
      expect(result.method).toBe('brotli');
      expect(result.compressedSize).toBeLessThan(result.originalSize);
    });

    it('should recommend compression', () => {
      const optimizer = new CompressionOptimizer();
      const rec = optimizer.recommend(500000);
      expect(rec).toContain('Gzip');
      expect(rec).toContain('Brotli');
    });
  });

  describe('createUtils', () => {
    it('should return utility functions', () => {
      const utils = createUtils();
      expect(utils.formatDate(new Date('2024-01-01'))).toBe('2024-01-01T00:00:00.000Z');
      expect(typeof utils.debounce).toBe('function');
    });
  });

  describe('mathUtils', () => {
    it('should perform basic math', () => {
      expect(mathUtils.add(2, 3)).toBe(5);
      expect(mathUtils.subtract(5, 3)).toBe(2);
      expect(mathUtils.multiply(2, 3)).toBe(6);
      expect(mathUtils.divide(6, 3)).toBe(2);
      expect(typeof mathUtils.complexCalculation(10)).toBe('number');
    });
  });

  describe('demo', () => {
    it('should run without errors', async () => {
      await expect(demo()).resolves.not.toThrow();
    });
  });
});
