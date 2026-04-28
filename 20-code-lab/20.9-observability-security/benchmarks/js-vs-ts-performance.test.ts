import { describe, it, expect } from 'vitest';
import { Benchmark, runBenchmarks, demo } from './js-vs-ts-performance.js';

describe('js-vs-ts-performance', () => {
  describe('Benchmark', () => {
    it('should run benchmark and collect results', async () => {
      const bm = new Benchmark();
      const result = await bm.run('test-op', () => {}, 100);
      expect(result.name).toBe('test-op');
      expect(result.iterations).toBe(100);
      expect(result.opsPerSecond).toBeGreaterThan(0);
      expect(result.avgTime).toBeGreaterThanOrEqual(0);
    });

    it('should generate report string', async () => {
      const bm = new Benchmark();
      await bm.run('op1', () => {}, 100);
      await bm.run('op2', () => {}, 100);
      const report = bm.report();
      expect(report).toContain('op1');
      expect(report).toContain('op2');
      expect(report).toContain('ops/sec');
    });
  });

  describe('runBenchmarks', () => {
    it('should run without errors', async () => {
      await expect(runBenchmarks()).resolves.not.toThrow();
    });
  });

  describe('demo', () => {
    it('should run without errors', () => {
      expect(() => { demo(); }).not.toThrow();
    });
  });
});
