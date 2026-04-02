/**
 * @file 内存管理与优化
 * @category Performance → Memory Management
 * @difficulty hard
 * @tags performance, memory, garbage-collection, memory-leaks
 * 
 * @description
 * JavaScript 内存管理最佳实践：
 * - 内存泄漏检测与预防
 * - WeakMap/WeakSet 使用
 * - 对象池模式
 * - 内存性能分析
 */

// ============================================================================
// 1. 内存泄漏检测器
// ============================================================================

export interface MemorySnapshot {
  timestamp: number;
  heapUsed: number;
  heapTotal: number;
  external: number;
}

export class MemoryLeakDetector {
  private snapshots: MemorySnapshot[] = [];
  private maxSnapshots = 10;

  takeSnapshot(): MemorySnapshot {
    const usage = process.memoryUsage();
    const snapshot: MemorySnapshot = {
      timestamp: Date.now(),
      heapUsed: usage.heapUsed,
      heapTotal: usage.heapTotal,
      external: usage.external
    };

    this.snapshots.push(snapshot);
    if (this.snapshots.length > this.maxSnapshots) {
      this.snapshots.shift();
    }

    return snapshot;
  }

  // 检测内存泄漏趋势
  detectLeak(): { hasLeak: boolean; growthRate: number } {
    if (this.snapshots.length < 2) {
      return { hasLeak: false, growthRate: 0 };
    }

    const first = this.snapshots[0];
    const last = this.snapshots[this.snapshots.length - 1];
    const timeDiff = (last.timestamp - first.timestamp) / 1000; // seconds
    
    if (timeDiff === 0) return { hasLeak: false, growthRate: 0 };

    const heapGrowth = last.heapUsed - first.heapUsed;
    const growthRate = heapGrowth / timeDiff; // bytes per second

    // 如果内存增长超过 1MB/分钟，可能存在泄漏
    const hasLeak = growthRate > (1024 * 1024 / 60);

    return { hasLeak, growthRate };
  }

  getSnapshots(): MemorySnapshot[] {
    return [...this.snapshots];
  }

  // 获取内存报告
  getReport(): string {
    const { hasLeak, growthRate } = this.detectLeak();
    const latest = this.snapshots[this.snapshots.length - 1];

    return `
内存使用报告:
  堆内存使用: ${this.formatBytes(latest?.heapUsed || 0)}
  堆内存总计: ${this.formatBytes(latest?.heapTotal || 0)}
  外部内存: ${this.formatBytes(latest?.external || 0)}
  增长速率: ${this.formatBytes(growthRate)}/s
  泄漏检测: ${hasLeak ? '⚠️ 可能存在内存泄漏' : '✓ 正常'}
    `.trim();
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// ============================================================================
// 2. WeakMap/WeakSet 弱引用集合
// ============================================================================

// 使用 WeakMap 实现私有属性
export class PrivateDataStore<T extends object, V> {
  private weakMap = new WeakMap<T, V>();

  set(key: T, value: V): void {
    this.weakMap.set(key, value);
  }

  get(key: T): V | undefined {
    return this.weakMap.get(key);
  }

  has(key: T): boolean {
    return this.weakMap.has(key);
  }

  delete(key: T): boolean {
    return this.weakMap.delete(key);
  }
}

// DOM 元素元数据缓存
export class DOMMetadataCache {
  private metadata = new WeakMap<Element, ElementMetadata>();

  setMetadata(element: Element, data: ElementMetadata): void {
    this.metadata.set(element, data);
  }

  getMetadata(element: Element): ElementMetadata | undefined {
    return this.metadata.get(element);
  }

  // 元素被移除时，元数据自动被垃圾回收
}

export interface ElementMetadata {
  id: string;
  createdAt: number;
  lastAccessed: number;
  customData: Record<string, unknown>;
}

// 使用 WeakSet 跟踪活跃对象
export class ActiveObjectTracker<T extends object> {
  private activeObjects = new WeakSet<T>();

  markActive(obj: T): void {
    this.activeObjects.add(obj);
  }

  isActive(obj: T): boolean {
    return this.activeObjects.has(obj);
  }
}

// ============================================================================
// 3. 自动清理的对象池 (带最大容量)
// ============================================================================

export class AutoCleanupPool<T extends object> {
  private pool: T[] = [];
  private inUse = new WeakSet<T>();
  private factory: () => T;
  private reset: (obj: T) => void;
  private maxSize: number;

  constructor(
    factory: () => T,
    reset: (obj: T) => void,
    initialSize = 10,
    maxSize = 100
  ) {
    this.factory = factory;
    this.reset = reset;
    this.maxSize = maxSize;

    for (let i = 0; i < initialSize; i++) {
      this.pool.push(factory());
    }
  }

  acquire(): T {
    // 寻找未使用的对象
    for (const obj of this.pool) {
      if (!this.inUse.has(obj)) {
        this.inUse.add(obj);
        return obj;
      }
    }

    // 池已满，创建新对象但不加入池
    if (this.pool.length >= this.maxSize) {
      const obj = this.factory();
      this.inUse.add(obj);
      return obj;
    }

    // 创建新对象并加入池
    const obj = this.factory();
    this.pool.push(obj);
    this.inUse.add(obj);
    return obj;
  }

  release(obj: T): void {
    if (this.inUse.has(obj)) {
      this.inUse.delete(obj);
      this.reset(obj);
    }
  }

  getStats(): { poolSize: number; available: number } {
    let available = 0;
    for (const obj of this.pool) {
      if (!this.inUse.has(obj)) available++;
    }
    return { poolSize: this.pool.length, available };
  }
}

// ============================================================================
// 4. 大对象分块处理
// ============================================================================

export class ChunkedProcessor<T, R> {
  constructor(
    private chunkSize: number,
    private processor: (chunk: T[]) => R[]
  ) {}

  async process(items: T[]): Promise<R[]> {
    const results: R[] = [];

    for (let i = 0; i < items.length; i += this.chunkSize) {
      const chunk = items.slice(i, i + this.chunkSize);
      const chunkResults = this.processor(chunk);
      results.push(...chunkResults);

      // 让出主线程，允许垃圾回收
      if (i + this.chunkSize < items.length) {
        await this.yieldToMainThread();
      }
    }

    return results;
  }

  private yieldToMainThread(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 0));
  }
}

// ============================================================================
// 5. 事件监听器自动清理
// ============================================================================

export class AutoCleanupEventEmitter {
  private listeners: Map<string, Set<(...args: unknown[]) => void>> = new Map();
  private maxListeners = 10;

  on(event: string, listener: (...args: unknown[]) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    const eventListeners = this.listeners.get(event)!;
    
    if (eventListeners.size >= this.maxListeners) {
      console.warn(`警告: ${event} 监听器数量超过 ${this.maxListeners}`);
    }

    eventListeners.add(listener);

    // 返回取消订阅函数
    return () => {
      eventListeners.delete(listener);
      if (eventListeners.size === 0) {
        this.listeners.delete(event);
      }
    };
  }

  emit(event: string, ...args: unknown[]): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(listener => {
        try {
          listener(...args);
        } catch (error) {
          console.error(`事件监听器错误:`, error);
        }
      });
    }
  }

  removeAllListeners(event?: string): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  listenerCount(event: string): number {
    return this.listeners.get(event)?.size || 0;
  }
}

// ============================================================================
// 6. 内存友好型缓存 (LRU + TTL)
// ============================================================================

export interface CacheEntry<V> {
  value: V;
  expiresAt: number;
  size: number;
}

export class MemoryEfficientCache<K, V> {
  private cache = new Map<K, CacheEntry<V>>();
  private maxSize: number;
  private currentSize = 0;
  private defaultTTL: number;

  constructor(maxSizeBytes = 50 * 1024 * 1024, defaultTTL = 5 * 60 * 1000) {
    this.maxSize = maxSizeBytes;
    this.defaultTTL = defaultTTL;
    this.startCleanupTimer();
  }

  set(key: K, value: V, ttl?: number): void {
    const size = this.estimateSize(value);
    
    // 如果单个项超过最大容量，不缓存
    if (size > this.maxSize) {
      return;
    }

    // 清理空间
    while (this.currentSize + size > this.maxSize && this.cache.size > 0) {
      this.evictLRU();
    }

    const entry: CacheEntry<V> = {
      value,
      expiresAt: Date.now() + (ttl || this.defaultTTL),
      size
    };

    this.cache.set(key, entry);
    this.currentSize += size;
  }

  get(key: K): V | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    if (Date.now() > entry.expiresAt) {
      this.delete(key);
      return undefined;
    }

    // 更新访问顺序 (LRU)
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.value;
  }

  delete(key: K): boolean {
    const entry = this.cache.get(key);
    if (entry) {
      this.currentSize -= entry.size;
      return this.cache.delete(key);
    }
    return false;
  }

  private evictLRU(): void {
    const firstKey = this.cache.keys().next().value;
    if (firstKey !== undefined) {
      this.delete(firstKey);
    }
  }

  private estimateSize(value: unknown): number {
    // 简化的大小估算
    return JSON.stringify(value).length * 2; // UTF-16 编码
  }

  private startCleanupTimer(): void {
    setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.cache) {
        if (now > entry.expiresAt) {
          this.delete(key);
        }
      }
    }, 60000); // 每分钟清理一次
  }

  getStats(): { size: number; count: number; maxSize: number } {
    return {
      size: this.currentSize,
      count: this.cache.size,
      maxSize: this.maxSize
    };
  }
}

// ============================================================================
// 7. 使用示例
// ============================================================================

export function demo(): void {
  console.log('=== 内存管理与优化演示 ===\n');

  // 内存泄漏检测
  console.log('--- 内存泄漏检测 ---');
  const detector = new MemoryLeakDetector();
  
  // 模拟内存分配
  const arrays: number[][] = [];
  for (let i = 0; i < 10; i++) {
    arrays.push(new Array(1000000).fill(i));
    detector.takeSnapshot();
  }
  
  console.log(detector.getReport());

  // WeakMap 使用
  console.log('\n--- WeakMap 私有数据 ---');
  const privateData = new PrivateDataStore<object, { secret: string }>();
  
  class MyClass {
    private data = { secret: 'private value' };
    
    constructor() {
      privateData.set(this, this.data);
    }
    
    getSecret(): string | undefined {
      return privateData.get(this)?.secret;
    }
  }

  const instance = new MyClass();
  console.log(`私有数据: ${instance.getSecret()}`);

  // 对象池
  console.log('\n--- 自动清理对象池 ---');
  const bufferPool = new AutoCleanupPool(
    () => Buffer.alloc(1024),
    (buf) => buf.fill(0),
    5,
    10
  );

  const buffers: Buffer[] = [];
  for (let i = 0; i < 8; i++) {
    buffers.push(bufferPool.acquire());
  }
  console.log(`获取 8 个缓冲区后的池状态:`, bufferPool.getStats());

  // 释放部分缓冲区
  buffers.slice(0, 4).forEach(buf => bufferPool.release(buf));
  console.log(`释放 4 个缓冲区后的池状态:`, bufferPool.getStats());

  // 内存高效缓存
  console.log('\n--- 内存高效缓存 ---');
  const cache = new MemoryEfficientCache<string, unknown>(1024 * 1024); // 1MB
  
  cache.set('user:1', { id: 1, name: 'Alice', data: 'x'.repeat(1000) });
  cache.set('user:2', { id: 2, name: 'Bob', data: 'y'.repeat(1000) });
  
  console.log(`缓存统计:`, cache.getStats());
  console.log(`获取 user:1:`, cache.get('user:1') ? '命中' : '未命中');
}

// ============================================================================
// 导出
// ============================================================================

;

;
