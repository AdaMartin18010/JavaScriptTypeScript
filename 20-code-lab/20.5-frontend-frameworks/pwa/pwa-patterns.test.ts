import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ServiceWorkerManager, CacheManager, OfflineManager, PushNotificationManager, BackgroundSyncManager } from './pwa-patterns.js';

describe('ServiceWorkerManager', () => {
  it('throws when serviceWorker is not supported', async () => {
    const swm = new ServiceWorkerManager();
    await expect(swm.register('/sw.js')).rejects.toThrow('not supported');
  });

  it('getState returns false when not registered', () => {
    const swm = new ServiceWorkerManager();
    const state = swm.getState();
    expect(state.active).toBe(false);
    expect(state.installing).toBe(false);
  });
});

describe('CacheManager', () => {
  const mockCache = {
    match: vi.fn(),
    put: vi.fn(),
    keys: vi.fn().mockResolvedValue([]),
    delete: vi.fn()
  };
  const mockCaches = {
    open: vi.fn().mockResolvedValue(mockCache),
    keys: vi.fn().mockResolvedValue(['demo-cache'])
  };

  beforeEach(() => {
    vi.stubGlobal('caches', mockCaches);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('fetch with cache-first strategy', async () => {
    const cm = new CacheManager({ cacheName: 'demo-cache' });
    const response = new Response('cached', { status: 200 });
    mockCache.match.mockResolvedValue(response);
    const res = await cm.fetch('https://example.com', 'cache-first');
    expect(await res.text()).toBe('cached');
  });
});

describe('OfflineManager', () => {
  it('reports online status', () => {
    const om = new OfflineManager({ cacheName: 'offline' });
    expect(typeof om.isConnected()).toBe('boolean');
  });

  it('returns default offline page when not cached', async () => {
    vi.stubGlobal('caches', {
      open: vi.fn().mockResolvedValue({
        match: vi.fn().mockResolvedValue(undefined)
      })
    });
    const om = new OfflineManager({ cacheName: 'offline' });
    const res = await om.getOfflinePage();
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain('offline');
    vi.unstubAllGlobals();
  });
});

describe('PushNotificationManager', () => {
  it('throws when Notification is not supported', async () => {
    const pm = new PushNotificationManager();
    await expect(pm.requestPermission()).rejects.toThrow('not supported');
  });
});

describe('BackgroundSyncManager', () => {
  const createMockIDB = () => {
    const store: Record<string, any> = {};
    return {
      open: vi.fn().mockImplementation(() => {
        const db = {
          objectStoreNames: { contains: () => false },
          createObjectStore: vi.fn(),
          transaction: () => ({
            objectStore: () => ({
              add: vi.fn().mockImplementation((task: any) => {
                store[task.id] = task;
                const req = { onsuccess: null as any, onerror: null as any, result: task.id };
                setTimeout(() => req.onsuccess?.(), 0);
                return req;
              }),
              getAll: vi.fn().mockImplementation(() => {
                const req = { onsuccess: null as any, onerror: null as any, result: Object.values(store) };
                setTimeout(() => req.onsuccess?.(), 0);
                return req;
              }),
              delete: vi.fn().mockImplementation((id: string) => {
                delete store[id];
                const req = { onsuccess: null as any, onerror: null as any };
                setTimeout(() => req.onsuccess?.(), 0);
                return req;
              })
            })
          })
        };
        const req = { onsuccess: null as any, onerror: null as any, onupgradeneeded: null as any, result: db };
        setTimeout(() => req.onsuccess?.(), 0);
        return req;
      })
    };
  };

  it('adds and retrieves tasks', async () => {
    vi.stubGlobal('indexedDB', createMockIDB());
    const bsm = new BackgroundSyncManager();
    const id = await bsm.addTask('sync-form', { url: '/' });
    expect(id).toBeDefined();
    const tasks = await bsm.getPendingTasks();
    expect(tasks.length).toBe(1);
    vi.unstubAllGlobals();
  });
});
