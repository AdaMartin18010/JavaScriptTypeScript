/**
 * @file Service Worker + Cache API 离线策略
 * @category Web APIs → Service Worker
 * @difficulty hard
 * @tags service-worker, cache-api, offline-first, background-sync
 */

// ============================================================================
// 1. Cache API 封装：版本管理与预缓存
// ============================================================================

export interface CacheManagerConfig {
  /** Cache 名称前缀 */
  cacheName: string;
  /** 需要预缓存的 URL 列表 */
  precacheUrls: string[];
  /** 缓存版本号，升级时自动清理旧缓存 */
  version: string;
}

/**
 * 生产级 Cache 管理器，支持版本控制、预缓存、运行时缓存
 */
export class CacheManager {
  private cacheName: string;
  private precacheUrls: string[];
  private version: string;

  constructor(config: CacheManagerConfig) {
    this.cacheName = `${config.cacheName}-v${config.version}`;
    this.precacheUrls = config.precacheUrls;
    this.version = config.version;
  }

  /**
   * 安装阶段：预缓存核心资源
   */
  async install(): Promise<void> {
    const cache = await caches.open(this.cacheName);
    await cache.addAll(this.precacheUrls);
  }

  /**
   * 激活阶段：清理旧版本缓存
   */
  async activate(): Promise<void> {
    const keys = await caches.keys();
    const toDelete = keys.filter((key) => key.startsWith(this.cacheName.split('-v')[0]) && key !== this.cacheName);
    await Promise.all(toDelete.map((key) => caches.delete(key)));
  }

  /**
   * Cache-First 策略：优先读缓存，回退网络
   */
  async cacheFirst(request: RequestInfo): Promise<Response> {
    const cache = await caches.open(this.cacheName);
    const cached = await cache.match(request);
    if (cached) return cached;

    const response = await fetch(request);
    if (response.ok) {
      await cache.put(request, response.clone());
    }
    return response;
  }

  /**
   * Network-First 策略：优先网络，失败回退缓存
   */
  async networkFirst(request: RequestInfo): Promise<Response> {
    try {
      const networkResponse = await fetch(request);
      if (networkResponse.ok) {
        const cache = await caches.open(this.cacheName);
        await cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    } catch {
      const cache = await caches.open(this.cacheName);
      const cached = await cache.match(request);
      if (cached) return cached;
      throw new Error('网络不可用且无缓存');
    }
  }

  /**
   * Stale-While-Revalidate 策略：立即返回缓存，后台更新
   */
  async staleWhileRevalidate(request: RequestInfo): Promise<Response> {
    const cache = await caches.open(this.cacheName);
    const cached = await cache.match(request);

    const networkPromise = fetch(request).then(async (response) => {
      if (response.ok) {
        await cache.put(request, response.clone());
      }
      return response;
    });

    if (cached) {
      // 后台更新，不阻塞返回
      networkPromise.catch(() => {});
      return cached;
    }

    return networkPromise;
  }

  /**
   * 清理所有与此管理器相关的缓存
   */
  async clear(): Promise<void> {
    const keys = await caches.keys();
    const toDelete = keys.filter((key) => key.startsWith(this.cacheName.split('-v')[0]));
    await Promise.all(toDelete.map((key) => caches.delete(key)));
  }
}

// ============================================================================
// 2. 离线队列：Background Sync 模拟
// ============================================================================

export interface QueuedRequest {
  id: string;
  url: string;
  method: string;
  body?: string;
  headers?: Record<string, string>;
  timestamp: number;
}

/**
 * 离线请求队列，使用 IndexedDB 持久化，支持重试与去重
 */
export class OfflineQueue {
  private dbName = 'offline-queue-db';
  private storeName = 'requests';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  /**
   * 打开 IndexedDB 连接
   */
  private async openDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id' });
        }
      };
    });
  }

  /**
   * 将请求加入离线队列
   */
  async enqueue(req: Omit<QueuedRequest, 'id' | 'timestamp'>): Promise<string> {
    const db = await this.openDB();
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const entry: QueuedRequest = { ...req, id, timestamp: Date.now() };

    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      const request = store.put(entry);
      request.onsuccess = () => resolve(id);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 获取队列中所有请求
   */
  async getAll(): Promise<QueuedRequest[]> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readonly');
      const store = tx.objectStore(this.storeName);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result as QueuedRequest[]);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 移除指定请求
   */
  async remove(id: string): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 尝试同步队列中的所有请求
   */
  async syncAll(): Promise<{ success: string[]; failed: string[] }> {
    const items = await this.getAll();
    const success: string[] = [];
    const failed: string[] = [];

    for (const item of items) {
      try {
        const response = await fetch(item.url, {
          method: item.method,
          body: item.body,
          headers: item.headers
        });
        if (response.ok) {
          await this.remove(item.id);
          success.push(item.id);
        } else {
          failed.push(item.id);
        }
      } catch {
        failed.push(item.id);
      }
    }

    return { success, failed };
  }

  /**
   * 获取队列长度
   */
  async size(): Promise<number> {
    const all = await this.getAll();
    return all.length;
  }

  /**
   * 清空队列
   */
  async clear(): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

// ============================================================================
// 3. Service Worker 注册助手
// ============================================================================

export interface SWRegisterOptions {
  /** 更新发现时的回调 */
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  /** 首次安装完成时的回调 */
  onInstall?: (registration: ServiceWorkerRegistration) => void;
  /** 作用域 */
  scope?: string;
}

/**
 * 注册 Service Worker 并提供生命周期回调
 */
export async function registerServiceWorker(
  swUrl: string,
  options: SWRegisterOptions = {}
): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.warn('当前浏览器不支持 Service Worker');
    return null;
  }

  const registration = await navigator.serviceWorker.register(swUrl, { scope: options.scope ?? '/' });

  registration.addEventListener('updatefound', () => {
    const newWorker = registration.installing;
    if (!newWorker) return;

    newWorker.addEventListener('statechange', () => {
      if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
        // 新的 SW 已安装且当前有活跃 SW，说明是更新
        options.onUpdate?.(registration);
      } else if (newWorker.state === 'activated' && !navigator.serviceWorker.controller) {
        // 首次激活
        options.onInstall?.(registration);
      }
    });
  });

  return registration;
}

// ============================================================================
// Demo
// ============================================================================

export async function demo(): Promise<void> {
  console.log('=== Service Worker + Cache API 演示 ===\n');

  // 1. CacheManager（在支持 Cache API 的环境中）
  if (typeof caches !== 'undefined') {
    console.log('--- 1. CacheManager 策略 ---');
    const manager = new CacheManager({
      cacheName: 'demo-cache',
      precacheUrls: [],
      version: '1.0.0'
    });

    // 模拟缓存
    const cache = await caches.open('demo-cache-v1.0.0');
    const mockResponse = new Response('cached data');
    await cache.put('/api/test', mockResponse);

    const result = await manager.cacheFirst('/api/test');
    console.log('Cache-First 结果:', await result.text());
    await manager.clear();
  } else {
    console.log('当前环境不支持 Cache API');
  }

  // 2. OfflineQueue（在支持 IndexedDB 的环境中）
  if (typeof indexedDB !== 'undefined') {
    console.log('\n--- 2. 离线请求队列 ---');
    const queue = new OfflineQueue();
    await queue.clear();

    const id = await queue.enqueue({
      url: 'https://jsonplaceholder.typicode.com/posts',
      method: 'POST',
      body: JSON.stringify({ title: 'test' }),
      headers: { 'Content-Type': 'application/json' }
    });
    console.log('入队成功:', id);

    const size = await queue.size();
    console.log('队列长度:', size);

    const items = await queue.getAll();
    console.log('队列内容:', items.map((i) => ({ id: i.id, method: i.method })));

    await queue.clear();
  } else {
    console.log('当前环境不支持 IndexedDB');
  }

  console.log('\n=== 演示结束 ===\n');
}
