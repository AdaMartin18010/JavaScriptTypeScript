/**
 * @file Cache Aside 模式
 * @category Caching → Cache Aside
 * @difficulty medium
 * @tags cache-aside, lazy-loading, read-through
 *
 * @description
 * Cache Aside (Lazy Loading) 模式实现：应用负责管理缓存，
 * 只在需要时从数据库加载数据到缓存。
 */

// ============================================================================
// 类型定义
// ============================================================================

export interface CacheProvider<T> {
  get(key: string): Promise<T | undefined> | T | undefined;
  set(key: string, value: T, ttl?: number): Promise<void> | void;
  delete(key: string): Promise<void> | void;
  exists(key: string): Promise<boolean> | boolean;
}

export interface DataSource<T> {
  get(id: string): Promise<T | null> | T | null;
  set(id: string, value: T): Promise<void> | void;
  delete(id: string): Promise<void> | void;
}

export interface CacheAsideOptions {
  ttl?: number; // seconds
  cacheNull?: boolean; // 是否缓存空值
  nullTtl?: number; // 空值缓存时间
  versionKey?: boolean; // 是否使用版本控制
}

// ============================================================================
// Cache Aside 实现
// ============================================================================

export class CacheAside<T> {
  private stats = { hits: 0, misses: 0, writes: 0, deletes: 0 };

  constructor(
    private cache: CacheProvider<T>,
    private dataSource: DataSource<T>,
    private options: CacheAsideOptions = {}
  ) {
    this.options = {
      ttl: 3600,
      cacheNull: false,
      nullTtl: 60,
      versionKey: false,
      ...options
    };
  }

  /**
   * 读取数据（Cache Aside 核心逻辑）
   */
  async get(id: string): Promise<T | null> {
    const cacheKey = this.buildKey(id);

    // 1. 先查缓存
    const cached = await this.cache.get(cacheKey);
    
    if (cached !== undefined) {
      this.stats.hits++;
      return cached;
    }

    // 2. 缓存未命中，查数据源
    this.stats.misses++;
    const data = await this.dataSource.get(id);

    // 3. 回填缓存
    if (data !== null) {
      await this.cache.set(cacheKey, data, this.options.ttl);
    } else if (this.options.cacheNull) {
      // 缓存空值防止缓存穿透
      await this.cache.set(cacheKey, null as unknown as T, this.options.nullTtl);
    }

    return data;
  }

  /**
   * 写入数据
   */
  async set(id: string, value: T): Promise<void> {
    const cacheKey = this.buildKey(id);

    // 1. 先更新数据库
    await this.dataSource.set(id, value);

    // 2. 更新缓存（或删除缓存）
    await this.cache.set(cacheKey, value, this.options.ttl);
    
    this.stats.writes++;
  }

  /**
   * 删除数据
   */
  async delete(id: string): Promise<void> {
    const cacheKey = this.buildKey(id);

    // 1. 先删除数据库
    await this.dataSource.delete(id);

    // 2. 删除缓存
    await this.cache.delete(cacheKey);
    
    this.stats.deletes++;
  }

  /**
   * 刷新缓存
   */
  async refresh(id: string): Promise<T | null> {
    const cacheKey = this.buildKey(id);

    // 直接查数据源并更新缓存
    const data = await this.dataSource.get(id);
    
    if (data !== null) {
      await this.cache.set(cacheKey, data, this.options.ttl);
    } else {
      await this.cache.delete(cacheKey);
    }

    return data;
  }

  /**
   * 使缓存失效
   */
  async invalidate(id: string): Promise<void> {
    const cacheKey = this.buildKey(id);
    await this.cache.delete(cacheKey);
  }

  /**
   * 批量读取
   */
  async getMany(ids: string[]): Promise<Map<string, T | null>> {
    const results = new Map<string, T | null>();
    const cacheMisses: string[] = [];

    // 1. 批量查缓存
    for (const id of ids) {
      const cacheKey = this.buildKey(id);
      const cached = await this.cache.get(cacheKey);
      
      if (cached !== undefined) {
        this.stats.hits++;
        results.set(id, cached);
      } else {
        cacheMisses.push(id);
      }
    }

    // 2. 缓存未命中的查数据源
    if (cacheMisses.length > 0) {
      this.stats.misses += cacheMisses.length;
      
      for (const id of cacheMisses) {
        const data = await this.dataSource.get(id);
        results.set(id, data);

        // 回填缓存
        if (data !== null) {
          await this.cache.set(this.buildKey(id), data, this.options.ttl);
        }
      }
    }

    return results;
  }

  /**
   * 获取统计
   */
  getStats(): { hits: number; misses: number; writes: number; deletes: number; hitRate: number } {
    const total = this.stats.hits + this.stats.misses;
    return {
      ...this.stats,
      hitRate: total > 0 ? this.stats.hits / total : 0
    };
  }

  private buildKey(id: string): string {
    return this.options.versionKey ? `v1:${id}` : id;
  }
}

// ============================================================================
// 内存缓存提供者（示例实现）
// ============================================================================

export class InMemoryCacheProvider<T> implements CacheProvider<T> {
  private cache = new Map<string, { value: T; expiresAt: number }>();

  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }
    
    return entry.value;
  }

  set(key: string, value: T, ttl?: number): void {
    const expiresAt = ttl ? Date.now() + ttl * 1000 : Number.MAX_SAFE_INTEGER;
    this.cache.set(key, { value, expiresAt });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  exists(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }

  clear(): void {
    this.cache.clear();
  }
}

// ============================================================================
// 模拟数据库（示例实现）
// ============================================================================

export class MockDataSource<T> implements DataSource<T> {
  private data = new Map<string, T>();
  private latency: number;

  constructor(latency = 50) {
    this.latency = latency;
  }

  async get(id: string): Promise<T | null> {
    await this.simulateLatency();
    return this.data.get(id) || null;
  }

  async set(id: string, value: T): Promise<void> {
    await this.simulateLatency();
    this.data.set(id, value);
  }

  async delete(id: string): Promise<void> {
    await this.simulateLatency();
    this.data.delete(id);
  }

  seed(id: string, value: T): void {
    this.data.set(id, value);
  }

  private simulateLatency(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, this.latency));
  }
}

// ============================================================================
// 使用示例
// ============================================================================

export async function demo(): Promise<void> {
  console.log('=== Cache Aside 模式演示 ===\n');

  interface User {
    id: string;
    name: string;
    email: string;
  }

  // 初始化组件
  const cache = new InMemoryCacheProvider<User>();
  const db = new MockDataSource<User>(50);
  const cacheAside = new CacheAside(cache, db, { ttl: 60 });

  // 准备数据
  db.seed('user-1', { id: 'user-1', name: 'Alice', email: 'alice@example.com' });
  db.seed('user-2', { id: 'user-2', name: 'Bob', email: 'bob@example.com' });

  // 1. 首次读取（缓存未命中）
  console.log('--- 首次读取（缓存未命中）---');
  const start1 = Date.now();
  const user1 = await cacheAside.get('user-1');
  console.log(`  Result: ${user1?.name}, Time: ${Date.now() - start1}ms`);
  console.log(`  Stats: ${JSON.stringify(cacheAside.getStats())}`);

  // 2. 再次读取（缓存命中）
  console.log('\n--- 再次读取（缓存命中）---');
  const start2 = Date.now();
  const user1Cached = await cacheAside.get('user-1');
  console.log(`  Result: ${user1Cached?.name}, Time: ${Date.now() - start2}ms`);
  console.log(`  Stats: ${JSON.stringify(cacheAside.getStats())}`);

  // 3. 更新数据
  console.log('\n--- 更新数据 ---');
  await cacheAside.set('user-1', { id: 'user-1', name: 'Alice Smith', email: 'alice@example.com' });
  const updated = await cacheAside.get('user-1');
  console.log(`  Updated: ${updated?.name}`);

  // 4. 批量读取
  console.log('\n--- 批量读取 ---');
  const start3 = Date.now();
  const users = await cacheAside.getMany(['user-1', 'user-2', 'user-3']);
  console.log(`  Results: ${Array.from(users.entries()).map(([k, v]) => `${k}=${v?.name || 'null'}`).join(', ')}`);
  console.log(`  Time: ${Date.now() - start3}ms`);

  // 5. 最终统计
  console.log('\n--- 最终统计 ---');
  console.log(`  ${JSON.stringify(cacheAside.getStats(), null, 2)}`);
}
