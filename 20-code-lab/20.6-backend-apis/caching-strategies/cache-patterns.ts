/**
 * @file 缓存策略实现
 * @category Caching → Patterns
 * @difficulty medium
 * @tags caching, cache-aside, read-through, write-through
 */

export interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  tags?: string[];
}

export class InMemoryCache {
  private store = new Map<string, CacheEntry<unknown>>();
  private stats = { hits: 0, misses: 0, evictions: 0 };
  
  constructor(private defaultTTL = 60000) {}
  
  get<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return undefined;
    }
    
    if (entry.expiresAt < Date.now()) {
      this.store.delete(key);
      this.stats.evictions++;
      this.stats.misses++;
      return undefined;
    }
    
    this.stats.hits++;
    return entry.value as T;
  }
  
  set<T>(key: string, value: T, ttl?: number, tags?: string[]): void {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + (ttl || this.defaultTTL),
      tags
    });
  }
  
  delete(key: string): boolean {
    return this.store.delete(key);
  }
  
  invalidateByTag(tag: string): void {
    for (const [key, entry] of this.store.entries()) {
      if (entry.tags?.includes(tag)) {
        this.store.delete(key);
        this.stats.evictions++;
      }
    }
  }
  
  clear(): void {
    this.store.clear();
  }
  
  getStats() {
    return { ...this.stats, size: this.store.size };
  }
}

// Cache Aside 模式
export class CacheAside<T> {
  constructor(
    private cache: InMemoryCache,
    private fetchFromSource: (key: string) => Promise<T>,
    private ttl = 60000
  ) {}
  
  async get(key: string): Promise<T> {
    // 1. 先查缓存
    const cached = this.cache.get<T>(key);
    if (cached !== undefined) {
      return cached;
    }
    
    // 2. 缓存未命中，查数据源
    const value = await this.fetchFromSource(key);
    
    // 3. 写入缓存
    this.cache.set(key, value, this.ttl);
    
    return value;
  }
  
  async set(key: string, value: T): Promise<void> {
    // 1. 先更新数据源
    // await this.writeToSource(key, value);
    
    // 2. 删除缓存（或更新缓存）
    this.cache.delete(key);
  }
  
  invalidate(key: string): void {
    this.cache.delete(key);
  }
}

// Read Through 模式
export class ReadThroughCache<T> {
  constructor(
    private cache: InMemoryCache,
    private loader: (key: string) => Promise<T>
  ) {}
  
  async get(key: string): Promise<T> {
    const cached = this.cache.get<T>(key);
    if (cached !== undefined) {
      return cached;
    }
    
    // 缓存自动加载
    const value = await this.loader(key);
    this.cache.set(key, value);
    return value;
  }
}

// Write Through 模式
export class WriteThroughCache<T> {
  constructor(
    private cache: InMemoryCache,
    private writer: (key: string, value: T) => Promise<void>
  ) {}
  
  async set(key: string, value: T): Promise<void> {
    // 同时更新缓存和数据源
    await this.writer(key, value);
    this.cache.set(key, value);
  }
}

// Multi-Level Cache (L1 - 内存, L2 - Redis模拟)
export class MultiLevelCache {
  private l1 = new InMemoryCache(5000); // 5秒TTL
  private l2 = new InMemoryCache(60000); // 60秒TTL
  
  async get<T>(key: string, loader: () => Promise<T>): Promise<T> {
    // L1 查找
    const l1Value = this.l1.get<T>(key);
    if (l1Value !== undefined) {
      return l1Value;
    }
    
    // L2 查找
    const l2Value = this.l2.get<T>(key);
    if (l2Value !== undefined) {
      // 回填L1
      this.l1.set(key, l2Value);
      return l2Value;
    }
    
    // 加载并回填
    const value = await loader();
    this.l1.set(key, value);
    this.l2.set(key, value);
    return value;
  }
}

export function demo(): void {
  console.log('=== 缓存策略 ===\n');
  
  const cache = new InMemoryCache(60000);
  
  // 设置带标签的缓存
  cache.set('user:1', { name: 'John' }, 60000, ['users']);
  cache.set('user:2', { name: 'Jane' }, 60000, ['users']);
  cache.set('post:1', { title: 'Hello' }, 60000, ['posts']);
  
  console.log('缓存统计:', cache.getStats());
  
  // 按标签失效
  cache.invalidateByTag('users');
  console.log('失效users后:', cache.getStats());
  
  // Cache Aside演示
  const cacheAside = new CacheAside(
    cache,
    async (key) => ({ id: key, data: 'from-db' }),
    30000
  );
  
  cacheAside.get('item:1').then(v => { console.log('Cache Aside结果:', v); });
  
  // Multi-Level演示
  const multiLevel = new MultiLevelCache();
  multiLevel.get('key', async () => 'computed-value').then(v => {
    console.log('Multi-Level结果:', v);
  });
}
