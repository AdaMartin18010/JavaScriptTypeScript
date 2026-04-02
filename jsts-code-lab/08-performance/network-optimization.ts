/**
 * @file 网络性能优化
 * @category Performance → Network Optimization
 * @difficulty medium
 * @tags performance, network, caching, http, request-optimization
 * 
 * @description
 * 网络请求性能优化技术：
 * - 请求去重与合并
 * - 智能缓存策略
 * - 请求优先级管理
 * - 离线支持
 */

// ============================================================================
// 1. 请求去重 (Request Deduplication)
// ============================================================================

export interface PendingRequest<T> {
  promise: Promise<T>;
  timestamp: number;
}

export class RequestDeduplicator {
  private pendingRequests = new Map<string, PendingRequest<unknown>>();
  private ttl = 100; // 100ms 内相同的请求会被合并

  async execute<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    // 检查是否有进行中的相同请求
    const pending = this.pendingRequests.get(key);
    if (pending && Date.now() - pending.timestamp < this.ttl) {
      console.log(`[Deduplicator] 复用请求: ${key}`);
      return pending.promise as Promise<T>;
    }

    // 创建新请求
    console.log(`[Deduplicator] 发起请求: ${key}`);
    const promise = requestFn().finally(() => {
      // 延迟清理，允许短暂时间内复用
      setTimeout(() => {
        this.pendingRequests.delete(key);
      }, this.ttl);
    });

    this.pendingRequests.set(key, {
      promise,
      timestamp: Date.now()
    });

    return promise;
  }

  clear(): void {
    this.pendingRequests.clear();
  }
}

// ============================================================================
// 2. 请求合并 (Request Batching)
// ============================================================================

export interface BatchConfig {
  maxBatchSize: number;
  flushInterval: number;
}

export class RequestBatcher<T, R> {
  private queue: Array<{
    item: T;
    resolve: (result: R) => void;
    reject: (error: Error) => void;
  }> = [];
  private timer: ReturnType<typeof setTimeout> | null = null;
  private config: BatchConfig;
  private batchProcessor: (items: T[]) => Promise<R[]>;

  constructor(
    batchProcessor: (items: T[]) => Promise<R[]>,
    config: Partial<BatchConfig> = {}
  ) {
    this.batchProcessor = batchProcessor;
    this.config = {
      maxBatchSize: 10,
      flushInterval: 50,
      ...config
    };
  }

  add(item: T): Promise<R> {
    return new Promise((resolve, reject) => {
      this.queue.push({ item, resolve, reject });

      if (this.queue.length >= this.config.maxBatchSize) {
        this.flush();
      } else if (!this.timer) {
        this.timer = setTimeout(() => this.flush(), this.config.flushInterval);
      }
    });
  }

  private async flush(): Promise<void> {
    if (this.queue.length === 0) return;

    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    const batch = this.queue.splice(0, this.config.maxBatchSize);
    const items = batch.map(b => b.item);

    console.log(`[Batcher] 批量处理 ${items.length} 个请求`);

    try {
      const results = await this.batchProcessor(items);
      
      // 分发结果
      batch.forEach((request, index) => {
        request.resolve(results[index]);
      });
    } catch (error) {
      batch.forEach(request => {
        request.reject(error as Error);
      });
    }
  }

  async flushAll(): Promise<void> {
    while (this.queue.length > 0) {
      await this.flush();
    }
  }
}

// ============================================================================
// 3. 智能缓存管理
// ============================================================================

export interface CacheStrategy {
  shouldCache(request: RequestInfo): boolean;
  getTTL(request: RequestInfo): number;
}

export class SmartCache implements CacheStorage {
  private cache: Map<string, CacheEntry> = new Map();
  private strategy: CacheStrategy;

  constructor(strategy: CacheStrategy) {
    this.strategy = strategy;
  }

  async match(request: RequestInfo): Promise<Response | undefined> {
    const key = this.getKey(request);
    const entry = this.cache.get(key);

    if (!entry) return undefined;

    // 检查是否过期
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }

    console.log(`[SmartCache] 缓存命中: ${key}`);
    return entry.response.clone();
  }

  async put(request: RequestInfo, response: Response): Promise<void> {
    if (!this.strategy.shouldCache(request)) {
      return;
    }

    const key = this.getKey(request);
    const ttl = this.strategy.getTTL(request);

    this.cache.set(key, {
      response: response.clone(),
      expiresAt: Date.now() + ttl,
      accessCount: 0
    });

    console.log(`[SmartCache] 缓存存储: ${key} (TTL: ${ttl}ms)`);
  }

  async delete(request: RequestInfo): Promise<boolean> {
    const key = this.getKey(request);
    return this.cache.delete(key);
  }

  async add(request: RequestInfo): Promise<void> {
    const response = await fetch(request);
    await this.put(request, response);
  }

  async addAll(requests: RequestInfo[]): Promise<void> {
    await Promise.all(requests.map(r => this.add(r)));
  }

  async keys(): Promise<string[]> {
    return Array.from(this.cache.keys());
  }

  async matchAll(): Promise<Response[]> {
    return Array.from(this.cache.values()).map(e => e.response.clone());
  }

  private getKey(request: RequestInfo): string {
    if (typeof request === 'string') return request;
    return request.url;
  }

  // 清理过期缓存
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

interface CacheEntry {
  response: Response;
  expiresAt: number;
  accessCount: number;
}

// 预定义缓存策略
export const CacheStrategies = {
  // API 数据缓存 - 短时间
  apiData: {
    shouldCache: () => true,
    getTTL: () => 5 * 60 * 1000 // 5分钟
  },

  // 静态资源缓存 - 长时间
  staticAssets: {
    shouldCache: (req: RequestInfo) => {
      const url = typeof req === 'string' ? req : req.url;
      return /\.(js|css|png|jpg|woff2)$/.test(url);
    },
    getTTL: () => 24 * 60 * 60 * 1000 // 24小时
  },

  // 不缓存
  noCache: {
    shouldCache: () => false,
    getTTL: () => 0
  }
};

// ============================================================================
// 4. 请求优先级管理
// ============================================================================

export type RequestPriority = 'high' | 'normal' | 'low' | 'idle';

interface QueuedRequest {
  id: string;
  priority: RequestPriority;
  execute: () => Promise<unknown>;
  resolve: (value: unknown) => void;
  reject: (error: Error) => void;
}

export class PriorityRequestQueue {
  private queue: QueuedRequest[] = [];
  private running = 0;
  private maxConcurrent: number;

  constructor(maxConcurrent = 6) {
    this.maxConcurrent = maxConcurrent;
  }

  enqueue<T>(
    execute: () => Promise<T>,
    priority: RequestPriority = 'normal'
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const request: QueuedRequest = {
        id: Math.random().toString(36).substring(2, 9),
        priority,
        execute: execute as () => Promise<unknown>,
        resolve: resolve as (value: unknown) => void,
        reject
      };

      // 根据优先级插入队列
      const priorityValue = this.getPriorityValue(priority);
      const insertIndex = this.queue.findIndex(
        r => this.getPriorityValue(r.priority) < priorityValue
      );
      
      if (insertIndex === -1) {
        this.queue.push(request);
      } else {
        this.queue.splice(insertIndex, 0, request);
      }

      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.running >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    this.running++;
    const request = this.queue.shift()!;

    console.log(`[PriorityQueue] 执行请求 [${request.priority}]: ${request.id}`);

    try {
      const result = await request.execute();
      request.resolve(result);
    } catch (error) {
      request.reject(error as Error);
    } finally {
      this.running--;
      this.processQueue();
    }
  }

  private getPriorityValue(priority: RequestPriority): number {
    const values: Record<RequestPriority, number> = {
      high: 3,
      normal: 2,
      low: 1,
      idle: 0
    };
    return values[priority];
  }
}

// ============================================================================
// 5. 离线支持 (Service Worker 辅助)
// ============================================================================

export class OfflineSupport {
  private cache: SmartCache;
  private offlineQueue: Array<() => Promise<void>> = [];
  private isOnline = navigator.onLine;

  constructor(cache: SmartCache) {
    this.cache = cache;
    this.setupListeners();
  }

  private setupListeners(): void {
    window.addEventListener('online', () => {
      console.log('[OfflineSupport] 网络已恢复');
      this.isOnline = true;
      this.processOfflineQueue();
    });

    window.addEventListener('offline', () => {
      console.log('[OfflineSupport] 网络已断开');
      this.isOnline = false;
    });
  }

  async fetchWithFallback(request: RequestInfo): Promise<Response> {
    if (this.isOnline) {
      try {
        const response = await fetch(request);
        await this.cache.put(request, response);
        return response;
      } catch (error) {
        console.log('[OfflineSupport] 网络请求失败，尝试缓存');
      }
    }

    // 离线或网络失败，使用缓存
    const cached = await this.cache.match(request);
    if (cached) {
      return cached;
    }

    throw new Error('离线且无缓存可用');
  }

  queueForOffline(action: () => Promise<void>): void {
    if (this.isOnline) {
      action();
    } else {
      console.log('[OfflineSupport] 操作已加入离线队列');
      this.offlineQueue.push(action);
    }
  }

  private async processOfflineQueue(): Promise<void> {
    console.log(`[OfflineSupport] 处理 ${this.offlineQueue.length} 个离线操作`);
    
    for (const action of this.offlineQueue) {
      try {
        await action();
      } catch (error) {
        console.error('[OfflineSupport] 离线操作失败:', error);
      }
    }
    
    this.offlineQueue = [];
  }

  getStatus(): { isOnline: boolean; queuedActions: number } {
    return {
      isOnline: this.isOnline,
      queuedActions: this.offlineQueue.length
    };
  }
}

// ============================================================================
// 6. 使用示例
// ============================================================================

export async function demo(): Promise<void> {
  console.log('=== 网络性能优化演示 ===\n');

  // 请求去重
  console.log('--- 请求去重 ---');
  const deduplicator = new RequestDeduplicator();
  
  const fetchUser = (id: string) => deduplicator.execute(
    `user:${id}`,
    () => Promise.resolve({ id, name: 'Alice' })
  );

  // 同时发起多个相同请求
  const [r1, r2, r3] = await Promise.all([
    fetchUser('123'),
    fetchUser('123'),
    fetchUser('123')
  ]);
  console.log(`去重后只发起 1 次请求，但返回 3 个结果`);

  // 请求合并
  console.log('\n--- 请求合并 ---');
  const batcher = new RequestBatcher<number, string>(
    async (ids) => ids.map(id => `User-${id}`),
    { maxBatchSize: 3, flushInterval: 100 }
  );

  const promises = [1, 2, 3, 4, 5].map(id => batcher.add(id));
  const batchResults = await Promise.all(promises);
  console.log(`批量处理结果: ${batchResults.join(', ')}`);

  // 智能缓存
  console.log('\n--- 智能缓存 ---');
  const cache = new SmartCache(CacheStrategies.apiData);
  
  const mockRequest = new Request('https://api.example.com/data');
  const mockResponse = new Response(JSON.stringify({ data: 'test' }));
  
  await cache.put(mockRequest, mockResponse);
  const cached = await cache.match(mockRequest);
  console.log(`缓存状态: ${cached ? '命中' : '未命中'}`);

  // 优先级队列
  console.log('\n--- 请求优先级 ---');
  const priorityQueue = new PriorityRequestQueue(2);
  
  priorityQueue.enqueue(() => new Promise(r => setTimeout(() => r('低优先级'), 100)), 'low');
  priorityQueue.enqueue(() => new Promise(r => setTimeout(() => r('高优先级'), 50)), 'high');
  priorityQueue.enqueue(() => new Promise(r => setTimeout(() => r('普通优先级'), 75)), 'normal');

  console.log('请求已按优先级排序: 高 > 普通 > 低');
}

// ============================================================================
// 导出
// ============================================================================

;

;
