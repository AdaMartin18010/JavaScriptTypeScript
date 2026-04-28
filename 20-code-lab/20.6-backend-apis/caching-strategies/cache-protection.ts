/**
 * @file 缓存防护
 * @category Caching → Protection
 * @difficulty hard
 * @tags cache, penetration, breakdown, avalanche, bloom-filter
 *
 * @description
 * 缓存穿透、缓存击穿、缓存雪崩防护策略实现
 */

// ============================================================================
// 类型定义
// ============================================================================

export interface ProtectionOptions {
  /** 空值缓存时间（毫秒） */
  nullTTL?: number;
  /** 互斥锁等待超时（毫秒） */
  lockTimeout?: number;
  /** 随机过期时间范围（毫秒） */
  jitterRange?: number;
  /** 熔断阈值 */
  circuitBreakerThreshold?: number;
  /** 布隆过滤器预期元素数量 */
  bloomExpectedItems?: number;
  /** 布隆过滤器误判率 */
  bloomFalsePositiveRate?: number;
}

export type DataLoader<K, V> = (key: K) => Promise<V | null>;

// ============================================================================
// 缓存穿透防护（空值缓存 + 布隆过滤器）
// ============================================================================

export class BloomFilter {
  private bitArray: boolean[];
  private hashCount: number;

  constructor(expectedItems: number, falsePositiveRate: number) {
    const size = Math.ceil(-(expectedItems * Math.log(falsePositiveRate)) / (Math.log(2) ** 2));
    this.bitArray = new Array(size).fill(false);
    this.hashCount = Math.ceil((size / expectedItems) * Math.log(2));
  }

  /**
   * 添加元素
   */
  add(item: string): void {
    for (let i = 0; i < this.hashCount; i++) {
      const index = this.hash(item, i) % this.bitArray.length;
      this.bitArray[index] = true;
    }
  }

  /**
   * 可能包含（可能存在误判）
   */
  mightContain(item: string): boolean {
    for (let i = 0; i < this.hashCount; i++) {
      const index = this.hash(item, i) % this.bitArray.length;
      if (!this.bitArray[index]) return false;
    }
    return true;
  }

  private hash(item: string, seed: number): number {
    let h = seed;
    for (let i = 0; i < item.length; i++) {
      h = (h * 31 + item.charCodeAt(i)) & 0x7fffffff;
    }
    return h;
  }
}

export class CachePenetrationGuard<K extends string, V> {
  private cache: Map<string, { value: V | null; expiresAt: number }>;
  private bloomFilter: BloomFilter;
  private nullTTL: number;

  constructor(options: ProtectionOptions = {}) {
    this.cache = new Map();
    this.nullTTL = options.nullTTL ?? 60000;
    this.bloomFilter = new BloomFilter(
      options.bloomExpectedItems ?? 100000,
      options.bloomFalsePositiveRate ?? 0.01
    );
  }

  /**
   * 预热布隆过滤器
   */
  preload(keys: K[]): void {
    for (const key of keys) {
      this.bloomFilter.add(key);
    }
  }

  /**
   * 获取数据（带穿透防护）
   */
  async get(key: K, loader: DataLoader<K, V>): Promise<V | null> {
    // 1. 先查缓存
    const cached = this.cache.get(key);
    if (cached && Date.now() < cached.expiresAt) {
      return cached.value;
    }

    // 2. 布隆过滤器快速判断
    if (!this.bloomFilter.mightContain(key)) {
      return null;
    }

    // 3. 加载数据
    const value = await loader(key);

    // 4. 缓存结果（包括 null）
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + (value !== null ? this.nullTTL * 10 : this.nullTTL)
    });

    return value;
  }

  /**
   * 手动设置值
   */
  set(key: K, value: V, ttl?: number): void {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + (ttl ?? this.nullTTL * 10)
    });
    this.bloomFilter.add(key);
  }
}

// ============================================================================
// 缓存击穿防护（互斥锁）
// ============================================================================

export class CacheBreakdownGuard<K, V> {
  private locks = new Map<string, Promise<V | null>>();
  private lockTimeout: number;

  constructor(options: ProtectionOptions = {}) {
    this.lockTimeout = options.lockTimeout ?? 5000;
  }

  /**
   * 获取数据（带击穿防护）
   */
  async get(key: K, cacheGetter: () => V | undefined | null, loader: () => Promise<V | null>): Promise<V | null> {
    const keyStr = String(key);

    // 1. 先查缓存
    const cached = cacheGetter();
    if (cached !== undefined && cached !== null) {
      return cached;
    }

    // 2. 检查是否有正在进行的加载
    const existingLock = this.locks.get(keyStr);
    if (existingLock) {
      return existingLock;
    }

    // 3. 创建互斥锁
    const loadPromise = this.loadWithTimeout(keyStr, loader);
    this.locks.set(keyStr, loadPromise);

    try {
      const value = await loadPromise;
      return value;
    } finally {
      this.locks.delete(keyStr);
    }
  }

  private async loadWithTimeout(key: string, loader: () => Promise<V | null>): Promise<V | null> {
    return Promise.race([
      loader(),
      new Promise<null>((_, reject) =>
        setTimeout(() => reject(new Error(`Lock timeout for key: ${key}`)), this.lockTimeout)
      )
    ]);
  }
}

// ============================================================================
// 缓存雪崩防护（随机过期时间）
// ============================================================================

export class CacheAvalancheGuard {
  private jitterRange: number;

  constructor(options: ProtectionOptions = {}) {
    this.jitterRange = options.jitterRange ?? 30000;
  }

  /**
   * 计算带随机抖动的过期时间
   */
  calculateTTL(baseTTL: number): number {
    const jitter = Math.floor(Math.random() * this.jitterRange);
    return baseTTL + jitter;
  }

  /**
   * 批量设置带抖动的 TTL
   */
  applyJitter<T extends { key: string; ttl: number }>(items: T[]): Array<T & { adjustedTTL: number }> {
    return items.map(item => ({
      ...item,
      adjustedTTL: this.calculateTTL(item.ttl)
    }));
  }

  /**
   * 预热缓存（分散加载）
   */
  async warmup<K, V>(
    keys: K[],
    loader: (key: K) => Promise<V>,
    setter: (key: K, value: V, ttl: number) => void,
    baseTTL: number
  ): Promise<void> {
    for (const key of keys) {
      try {
        const value = await loader(key);
        setter(key, value, this.calculateTTL(baseTTL));
      } catch {
        // 预热失败不阻塞
      }

      // 小延迟分散加载压力
      await this.delay(Math.random() * 50);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ============================================================================
// 综合缓存防护
// ============================================================================

export class CacheGuardian<K extends string, V> {
  private penetration: CachePenetrationGuard<K, V>;
  private breakdown: CacheBreakdownGuard<K, V>;
  private avalanche: CacheAvalancheGuard;

  constructor(options: ProtectionOptions = {}) {
    this.penetration = new CachePenetrationGuard<K, V>(options);
    this.breakdown = new CacheBreakdownGuard<K, V>(options);
    this.avalanche = new CacheAvalancheGuard(options);
  }

  /**
   * 获取数据（综合防护）
   */
  async get(
    key: K,
    cacheGetter: () => V | undefined | null,
    cacheSetter: (key: K, value: V, ttl: number) => void,
    loader: DataLoader<K, V>,
    baseTTL: number
  ): Promise<V | null> {
    // 1. 击穿防护（互斥锁）
    return this.breakdown.get(key, cacheGetter, async () => {
      // 2. 穿透防护（布隆过滤器 + 空值缓存）
      const value = await this.penetration.get(key, loader);

      if (value !== null) {
        // 3. 雪崩防护（随机 TTL）
        const ttl = this.avalanche.calculateTTL(baseTTL);
        cacheSetter(key, value, ttl);
      }

      return value;
    });
  }

  /**
   * 预热布隆过滤器
   */
  preload(keys: K[]): void {
    this.penetration.preload(keys);
  }
}

// ============================================================================
// 使用示例
// ============================================================================

export function demo(): void {
  console.log('=== 缓存防护 ===\n');

  // 布隆过滤器
  const bloom = new BloomFilter(1000, 0.01);
  bloom.add('user:1');
  bloom.add('user:2');

  console.log('Bloom Filter:');
  console.log('  user:1 might exist:', bloom.mightContain('user:1'));
  console.log('  user:999 might exist:', bloom.mightContain('user:999'));

  // 雪崩防护
  const avalanche = new CacheAvalancheGuard({ jitterRange: 5000 });
  const ttls = [1000, 1000, 1000, 1000].map(t => avalanche.calculateTTL(t));
  console.log('\nAvalanche jittered TTLs:', ttls);
}
