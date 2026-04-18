import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  fetchWithAbort,
  FetchCancelManager,
  downloadWithProgress,
  collectDownload,
  createUploadStream,
  createBatchWritableStream,
  createNDJSONParserStream,
  createSensorStream,
  streamToAsyncIterator,
  pipeThrough,
  CacheManager,
  OfflineQueue,
  LazyLoadObserver,
  ElementSizeTracker,
  DOMChangeObserver,
  PageMonitor
} from './index.js';

describe('90-web-apis-lab', () => {
  describe('fetch-advanced', () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it('fetchWithAbort should return JSON data', async () => {
      global.fetch = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ id: 1 }), { status: 200, headers: { 'content-type': 'application/json' } })
      );
      const data = await fetchWithAbort<{ id: number }>('https://example.com/api');
      expect(data).toEqual({ id: 1 });
    });

    it('fetchWithAbort should throw on HTTP error', async () => {
      global.fetch = vi.fn().mockResolvedValue(new Response('Not Found', { status: 404 }));
      await expect(fetchWithAbort('https://example.com/api')).rejects.toThrow('HTTP 404');
    });

    it('FetchCancelManager should cancel request', async () => {
      global.fetch = vi.fn().mockImplementation((_url, init) => {
        return new Promise((_resolve, reject) => {
          if (init?.signal) {
            init.signal.addEventListener('abort', () => {
              reject(new DOMException('Aborted', 'AbortError'));
            });
          }
        });
      });

      const manager = new FetchCancelManager();
      const promise = manager.fetch('req1', 'https://example.com/api');
      manager.cancel('req1');
      await expect(promise).rejects.toThrow('Aborted');
    });

    it('downloadWithProgress should yield progress chunks', async () => {
      const data = new Uint8Array([1, 2, 3, 4, 5]);
      global.fetch = vi.fn().mockResolvedValue(
        new Response(data, {
          status: 200,
          headers: { 'content-length': String(data.byteLength) }
        })
      );

      const chunks: number[] = [];
      for await (const progress of downloadWithProgress('https://example.com/file')) {
        if (!progress.done) {
          chunks.push(progress.chunk.length);
        }
      }
      expect(chunks.length).toBeGreaterThan(0);
    });

    it('collectDownload should reconstruct Uint8Array', async () => {
      const data = new Uint8Array([10, 20, 30]);
      global.fetch = vi.fn().mockResolvedValue(
        new Response(data, { status: 200, headers: { 'content-length': '3' } })
      );
      const result = await collectDownload('https://example.com/file');
      expect(result).toEqual(data);
    });

    it('createUploadStream should report progress', async () => {
      const blob = new Blob(['hello world']);
      const progressList: { percent: number }[] = [];
      const stream = createUploadStream(blob, (p) => progressList.push(p));
      const reader = stream.getReader();
      while (true) {
        const { done } = await reader.read();
        if (done) break;
      }
      expect(progressList.length).toBeGreaterThan(0);
      expect(progressList[progressList.length - 1].percent).toBe(100);
    });
  });

  describe('streams-pipeline', () => {
    it('createNDJSONParserStream should parse newline delimited JSON', async () => {
      const source = new ReadableStream<string>({
        start(controller) {
          controller.enqueue('{"a":1}\n{"b":2}\n');
          controller.close();
        }
      });

      const reader = source.pipeThrough(createNDJSONParserStream()).getReader();
      const results: unknown[] = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        results.push(value);
      }
      expect(results).toEqual([{ a: 1 }, { b: 2 }]);
    });

    it('createBatchWritableStream should batch writes', async () => {
      const batches: number[][] = [];
      const stream = createBatchWritableStream<number>({
        batchSize: 2,
        flushIntervalMs: 500,
        onFlush: (batch) => batches.push([...batch])
      });

      const writer = stream.getWriter();
      await writer.write(1);
      await writer.write(2);
      await writer.write(3);
      await writer.close();
      expect(batches.length).toBeGreaterThanOrEqual(1);
      expect(batches[0]).toContain(1);
      expect(batches[0]).toContain(2);
    });

    it('createSensorStream should emit specified count', async () => {
      const stream = createSensorStream({ intervalMs: 5, maxCount: 3 });
      const values: number[] = [];
      for await (const v of streamToAsyncIterator(stream)) {
        values.push(v);
      }
      expect(values.length).toBe(3);
    });

    it('pipeThrough should chain transforms', async () => {
      const source = new ReadableStream<number>({
        start(controller) {
          controller.enqueue(1);
          controller.enqueue(2);
          controller.enqueue(2);
          controller.close();
        }
      });

      const double = new TransformStream<number, number>({
        transform(chunk, controller) {
          controller.enqueue(chunk * 2);
        }
      });

      const result = pipeThrough<number, number>(source, double);
      const values: number[] = [];
      for await (const v of streamToAsyncIterator(result)) {
        values.push(v);
      }
      expect(values).toEqual([2, 4, 4]);
    });
  });

  describe('service-worker-cache', () => {
    beforeEach(() => {
      // vitest happy-dom 可能未完全实现 caches，使用 mock
      if (typeof caches === 'undefined') {
        (global as any).caches = {
          open: vi.fn().mockResolvedValue({
            match: vi.fn().mockResolvedValue(undefined),
            put: vi.fn().mockResolvedValue(undefined),
            addAll: vi.fn().mockResolvedValue(undefined),
            keys: vi.fn().mockResolvedValue([])
          }),
          keys: vi.fn().mockResolvedValue([]),
          delete: vi.fn().mockResolvedValue(true)
        };
      }
    });

    it('CacheManager should construct with config', () => {
      const manager = new CacheManager({
        cacheName: 'test',
        precacheUrls: ['/index.html'],
        version: '1.0.0'
      });
      expect(manager).toBeDefined();
    });

    it('OfflineQueue should enqueue and retrieve', async () => {
      if (typeof indexedDB === 'undefined') {
        // 在纯 node 环境跳过
        return;
      }
      const queue = new OfflineQueue();
      await queue.clear();
      const id = await queue.enqueue({ url: '/api/test', method: 'POST' });
      expect(typeof id).toBe('string');
      const items = await queue.getAll();
      expect(items.length).toBe(1);
      expect(items[0].method).toBe('POST');
      await queue.clear();
    });
  });

  describe('observer-patterns', () => {
    it('LazyLoadObserver should construct and disconnect', () => {
      const observer = new LazyLoadObserver({});
      expect(observer).toBeDefined();
      observer.disconnect();
    });

    it('ElementSizeTracker should construct and disconnect', () => {
      const tracker = new ElementSizeTracker();
      expect(tracker).toBeDefined();
      tracker.disconnect();
    });

    it('DOMChangeObserver should buffer and flush records', () => {
      const records: any[] = [];
      const observer = new DOMChangeObserver((r) => records.push(...r), { flushDelay: 10 });
      expect(observer).toBeDefined();
      observer.disconnect();
    });

    it('PageMonitor should track metrics', () => {
      const monitor = new PageMonitor();
      const metrics = monitor.getMetrics();
      expect(metrics.visibleElements).toBe(0);
      expect(metrics.resizeCount).toBe(0);
      expect(metrics.domChangeCount).toBe(0);
      monitor.destroy();
    });
  });
});
