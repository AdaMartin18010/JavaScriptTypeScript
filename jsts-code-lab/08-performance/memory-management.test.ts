import { describe, it, expect } from 'vitest';
import {
  MemoryLeakDetector,
  PrivateDataStore,
  AutoCleanupPool,
  ChunkedProcessor,
  AutoCleanupEventEmitter,
  MemoryEfficientCache,
  demo
} from './memory-management.js';

describe('memory-management', () => {
  describe('MemoryLeakDetector', () => {
    it('should take snapshots', () => {
      const detector = new MemoryLeakDetector();
      const snapshot = detector.takeSnapshot();
      expect(snapshot.heapUsed).toBeGreaterThan(0);
      expect(detector.getSnapshots().length).toBe(1);
    });

    it('should detect no leak with few snapshots', () => {
      const detector = new MemoryLeakDetector();
      detector.takeSnapshot();
      const result = detector.detectLeak();
      expect(result.hasLeak).toBe(false);
    });

    it('should generate report', () => {
      const detector = new MemoryLeakDetector();
      detector.takeSnapshot();
      expect(detector.getReport()).toContain('内存使用报告');
    });
  });

  describe('PrivateDataStore', () => {
    it('should store and retrieve with WeakMap', () => {
      const store = new PrivateDataStore<object, string>();
      const key = {};
      store.set(key, 'secret');
      expect(store.get(key)).toBe('secret');
      expect(store.has(key)).toBe(true);
      expect(store.delete(key)).toBe(true);
      expect(store.has(key)).toBe(false);
    });
  });

  describe('AutoCleanupPool', () => {
    it('should acquire and release objects', () => {
      let created = 0;
      const pool = new AutoCleanupPool(
        () => { created++; return { id: created }; },
        (obj: { id: number; val?: number }) => { obj.val = 0; },
        2,
        5
      );
      const a = pool.acquire();
      const b = pool.acquire();
      expect(created).toBe(2);
      pool.release(a);
      const c = pool.acquire();
      expect(created).toBe(2); // reused
      expect(pool.getStats().poolSize).toBe(2);
    });

    it('should create extra objects when pool exhausted', () => {
      const pool = new AutoCleanupPool(
        () => ({ id: 1 }),
        () => {},
        1,
        1
      );
      pool.acquire();
      pool.acquire(); // over maxSize
      expect(pool.getStats().poolSize).toBe(1);
    });
  });

  describe('ChunkedProcessor', () => {
    it('should process items in chunks', async () => {
      const processor = new ChunkedProcessor<number, number>(2, (chunk) => chunk.map(x => x * 2));
      const result = await processor.process([1, 2, 3, 4]);
      expect(result).toEqual([2, 4, 6, 8]);
    });
  });

  describe('AutoCleanupEventEmitter', () => {
    it('should subscribe and emit', () => {
      const emitter = new AutoCleanupEventEmitter();
      let called = 0;
      emitter.on('test', () => called++);
      emitter.emit('test');
      expect(called).toBe(1);
      expect(emitter.listenerCount('test')).toBe(1);
    });

    it('should return unsubscribe function', () => {
      const emitter = new AutoCleanupEventEmitter();
      let called = 0;
      const unsub = emitter.on('test', () => called++);
      unsub();
      emitter.emit('test');
      expect(called).toBe(0);
    });

    it('should remove all listeners', () => {
      const emitter = new AutoCleanupEventEmitter();
      emitter.on('a', () => {});
      emitter.removeAllListeners('a');
      expect(emitter.listenerCount('a')).toBe(0);
    });
  });

  describe('MemoryEfficientCache', () => {
    it('should set and get values', () => {
      const cache = new MemoryEfficientCache<string, number>(1024 * 1024, 60000);
      cache.set('a', 1);
      expect(cache.get('a')).toBe(1);
    });

    it('should expire entries after TTL', async () => {
      const cache = new MemoryEfficientCache<string, number>(1024 * 1024, 10);
      cache.set('a', 1, 10);
      expect(cache.get('a')).toBe(1);
      await new Promise(r => setTimeout(r, 20));
      expect(cache.get('a')).toBeUndefined();
    });

    it('should evict LRU when size exceeded', () => {
      const cache = new MemoryEfficientCache<string, string>(20, 60000);
      cache.set('a', 'aaaa'); // size ~12
      expect(cache.getStats().count).toBe(1);
      cache.set('b', 'bbbb'); // size ~12, total 24 > 20, evicts 'a'
      expect(cache.getStats().count).toBe(1);
      expect(cache.get('a')).toBeUndefined();
      expect(cache.get('b')).toBe('bbbb');
    });
  });

  describe('demo', () => {
    it('should run without errors', () => {
      expect(() => demo()).not.toThrow();
    });
  });
});
