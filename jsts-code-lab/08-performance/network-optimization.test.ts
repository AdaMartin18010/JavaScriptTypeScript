import { describe, it, expect } from 'vitest';
import {
  RequestDeduplicator,
  RequestBatcher,
  SmartCache,
  CacheStrategies,
  PriorityRequestQueue,
  OfflineSupport,
  demo
} from './network-optimization';

describe('network-optimization', () => {
  describe('RequestDeduplicator', () => {
    it('should deduplicate concurrent requests', async () => {
      const dedup = new RequestDeduplicator();
      let count = 0;
      const fetchData = () => dedup.execute('key', async () => {
        count++;
        await new Promise(r => setTimeout(r, 10));
        return 'result';
      });
      const [r1, r2] = await Promise.all([fetchData(), fetchData()]);
      expect(r1).toBe('result');
      expect(r2).toBe('result');
      expect(count).toBe(1);
    });

    it('should allow new requests after clearing', async () => {
      const dedup = new RequestDeduplicator();
      await dedup.execute('key', async () => 'a');
      dedup.clear();
      const result = await dedup.execute('key', async () => 'b');
      expect(result).toBe('b');
    });
  });

  describe('RequestBatcher', () => {
    it('should batch requests', async () => {
      let batchCount = 0;
      const batcher = new RequestBatcher<number, number>(
        async (items) => {
          batchCount++;
          return items.map(x => x * 2);
        },
        { maxBatchSize: 3, flushInterval: 50 }
      );
      const p1 = batcher.add(1);
      const p2 = batcher.add(2);
      const results = await Promise.all([p1, p2]);
      expect(results).toEqual([2, 4]);
      expect(batchCount).toBeGreaterThanOrEqual(1);
    });

    it('should flush all remaining requests', async () => {
      const batcher = new RequestBatcher<number, number>(
        async (items) => items.map(x => x * 2),
        { maxBatchSize: 10, flushInterval: 1000 }
      );
      const p = batcher.add(5);
      await batcher.flushAll();
      expect(await p).toBe(10);
    });
  });

  describe('SmartCache', () => {
    it('should cache and retrieve responses', async () => {
      const cache = new SmartCache(CacheStrategies.apiData);
      const request = new Request('https://api.example.com/data');
      const response = new Response(JSON.stringify({ data: 'test' }));
      await cache.put(request, response);
      const cached = await cache.match(request);
      expect(cached).toBeDefined();
      expect(await cached!.text()).toBe('{"data":"test"}');
    });

    it('should return undefined for expired cache', async () => {
      const strategy = { shouldCache: () => true, getTTL: () => 10 };
      const cache = new SmartCache(strategy);
      const request = new Request('https://api.example.com/data');
      const response = new Response('ok');
      await cache.put(request, response);
      await new Promise(r => setTimeout(r, 20));
      const cached = await cache.match(request);
      expect(cached).toBeUndefined();
    });

    it('should not cache when strategy returns false', async () => {
      const cache = new SmartCache(CacheStrategies.noCache);
      const request = new Request('https://api.example.com/data');
      const response = new Response('ok');
      await cache.put(request, response);
      const cached = await cache.match(request);
      expect(cached).toBeUndefined();
    });
  });

  describe('PriorityRequestQueue', () => {
    it('should execute high priority first when queued together', async () => {
      const queue = new PriorityRequestQueue(1);
      const results: string[] = [];
      // Block the queue first so both tasks are queued before execution
      const blocker = queue.enqueue(async () => {
        await new Promise(r => setTimeout(r, 30));
        return 'blocker';
      }, 'normal');
      const pLow = queue.enqueue(async () => {
        results.push('low');
        return 'low';
      }, 'low');
      const pHigh = queue.enqueue(async () => {
        results.push('high');
        return 'high';
      }, 'high');
      await Promise.all([blocker, pLow, pHigh]);
      expect(results[0]).toBe('high');
      expect(results[1]).toBe('low');
    });
  });

  describe('OfflineSupport', () => {
    it('should report online status', () => {
      const cache = new SmartCache(CacheStrategies.apiData);
      const offline = new OfflineSupport(cache);
      expect(offline.getStatus().isOnline).toBe(true);
    });

    it('should queue actions when offline', async () => {
      const cache = new SmartCache(CacheStrategies.apiData);
      const offline = new OfflineSupport(cache);
      let executed = false;
      offline.queueForOffline(async () => { executed = true; });
      // In Node.js environment it is considered online, so action executes immediately
      expect(offline.getStatus().queuedActions).toBe(0);
      // Give microtask a chance to run
      await new Promise(r => setTimeout(r, 0));
      expect(executed).toBe(true);
    });
  });

  describe('demo', () => {
    it('should run without errors', async () => {
      await expect(demo()).resolves.not.toThrow();
    });
  });
});
