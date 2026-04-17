import { describe, it, expect } from 'vitest';
import {
  memoize,
  debounce,
  throttle,
  calculateVisibleRange,
  LazyLoader,
  measurePerformance,
  measureAsyncPerformance,
  ObjectPool,
  demo
} from './optimization-patterns.js';

describe('optimization-patterns', () => {
  describe('memoize', () => {
    it('should cache function results', () => {
      let calls = 0;
      const add = memoize((a: number, b: number) => {
        calls++;
        return a + b;
      });
      expect(add(1, 2)).toBe(3);
      expect(add(1, 2)).toBe(3);
      expect(calls).toBe(1);
    });
  });

  describe('debounce', () => {
    it('should delay execution', async () => {
      let calls = 0;
      const fn = debounce(() => calls++, 50);
      fn();
      fn();
      fn();
      expect(calls).toBe(0);
      await new Promise(r => setTimeout(r, 60));
      expect(calls).toBe(1);
    });
  });

  describe('throttle', () => {
    it('should limit execution rate', async () => {
      let calls = 0;
      const fn = throttle(() => calls++, 50);
      fn();
      fn();
      fn();
      expect(calls).toBe(1);
      await new Promise(r => setTimeout(r, 60));
      fn();
      expect(calls).toBe(2);
    });
  });

  describe('calculateVisibleRange', () => {
    it('should calculate visible indices', () => {
      const state = calculateVisibleRange(0, {
        itemHeight: 50,
        containerHeight: 300,
        totalItems: 1000,
        overscan: 3
      });
      expect(state.startIndex).toBe(0);
      expect(state.offset).toBe(0);
      expect(state.endIndex).toBeGreaterThan(0);
    });

    it('should handle scrolled position', () => {
      const state = calculateVisibleRange(500, {
        itemHeight: 50,
        containerHeight: 300,
        totalItems: 1000,
        overscan: 3
      });
      expect(state.startIndex).toBeGreaterThan(0);
      expect(state.endIndex).toBeLessThan(1000);
    });
  });

  describe('LazyLoader', () => {
    it('should lazy load and cache', async () => {
      let loads = 0;
      const loader = new LazyLoader<string>(async (key) => {
        loads++;
        return `value-${key}`;
      });
      const [v1, v2] = await Promise.all([loader.get('a'), loader.get('a')]);
      expect(v1).toBe('value-a');
      expect(v2).toBe('value-a');
      expect(loads).toBe(1);
      await loader.get('b');
      expect(loads).toBe(2);
    });

    it('should clear cache', async () => {
      const loader = new LazyLoader<string>(async (key) => key);
      await loader.get('a');
      loader.clear();
      expect(loader.cache.size).toBe(0);
    });
  });

  describe('measurePerformance', () => {
    it('should measure sync function', () => {
      const result = measurePerformance(() => 42, 'test');
      expect(result).toBe(42);
    });

    it('should measure async function', async () => {
      const result = await measureAsyncPerformance(async () => 'ok', 'test');
      expect(result).toBe('ok');
    });
  });

  describe('ObjectPool', () => {
    it('should reuse released objects', () => {
      let created = 0;
      const pool = new ObjectPool(
        () => { created++; return { id: created }; },
        (obj: { id: number; val?: number }) => { obj.val = 0; },
        2
      );
      const a = pool.acquire();
      pool.release(a);
      const b = pool.acquire();
      expect(a).toBe(b);
      expect(created).toBe(2);
    });

    it('should create new objects when pool empty', () => {
      let created = 0;
      const pool = new ObjectPool(
        () => { created++; return { id: created }; },
        () => {},
        1
      );
      pool.acquire();
      pool.acquire();
      expect(created).toBe(2);
    });
  });

  describe('demo', () => {
    it('should run without errors', async () => {
      await expect(demo()).resolves.not.toThrow();
    });
  });
});
