/**
 * @file TTL Cache
 * @category Caching → TTL Cache
 * @difficulty medium
 * @tags cache, ttl, expiration, time-based-eviction
 *
 * @description
 * 支持 TTL（Time To Live）的缓存实现，支持主动过期检查和惰性过期
 */

// ============================================================================
// 类型定义
// ============================================================================

export interface TTLOptions {
  defaultTTL: number; // milliseconds
  checkInterval?: number; // milliseconds
  maxSize?: number;
  onExpire?: (key: string, value: unknown) => void;
}

export interface TTLEntry<V> {
  value: V;
  expiresAt: number;
  createdAt: number;
}

// ============================================================================
// TTL 缓存
// ============================================================================

export class TTLCache<V = unknown> {
  private cache = new Map<string, TTLEntry<V>>();
  private options: Required<TTLOptions>;
  private cleanupTimer: ReturnType<typeof setInterval> | null = null;
  private accessCount = 0;
  private hitCount = 0;

  constructor(options: TTLOptions) {
    this.options = {
      checkInterval: 60000,
      maxSize: Number.MAX_SAFE_INTEGER,
      onExpire: () => {},
      ...options
    };

    if (this.options.checkInterval > 0) {
      this.startCleanup();
    }
  }

  /**
   * 获取值（惰性过期检查）
   */
  get(key: string): V | undefined {
    this.accessCount++;
    const entry = this.cache.get(key);

    if (!entry) return undefined;

    if (Date.now() > entry.expiresAt) {
      this.delete(key);
      return undefined;
    }

    this.hitCount++;
    return entry.value;
  }

  /**
   * 设置值
   */
  set(key: string, value: V, ttl?: number): void {
    const effectiveTTL = ttl ?? this.options.defaultTTL;
    const now = Date.now();

    // 如果超过最大大小，先淘汰最旧的
    if (this.cache.size >= this.options.maxSize && !this.cache.has(key)) {
      this.evictOldest();
    }

    this.cache.set(key, {
      value,
      expiresAt: now + effectiveTTL,
      createdAt: now
    });
  }

  /**
   * 检查键是否存在且未过期
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      this.delete(key);
      return false;
    }
    return true;
  }

  /**
   * 删除键
   */
  delete(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    this.cache.delete(key);
    this.options.onExpire(key, entry.value);
    return true;
  }

  /**
   * 延长 TTL
   */
  touch(key: string, ttl?: number): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    const effectiveTTL = ttl ?? this.options.defaultTTL;
    entry.expiresAt = Date.now() + effectiveTTL;
    return true;
  }

  /**
   * 获取剩余 TTL
   */
  getTTL(key: string): number {
    const entry = this.cache.get(key);
    if (!entry) return -1;

    const remaining = entry.expiresAt - Date.now();
    if (remaining <= 0) {
      this.delete(key);
      return -1;
    }

    return remaining;
  }

  /**
   * 获取所有有效键
   */
  keys(): string[] {
    this.cleanup();
    return Array.from(this.cache.keys());
  }

  /**
   * 获取缓存大小
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear();
    this.accessCount = 0;
    this.hitCount = 0;
  }

  /**
   * 获取统计信息
   */
  getStats(): { size: number; hits: number; misses: number; hitRate: number } {
    const misses = this.accessCount - this.hitCount;
    return {
      size: this.cache.size,
      hits: this.hitCount,
      misses,
      hitRate: this.accessCount > 0 ? this.hitCount / this.accessCount : 0
    };
  }

  /**
   * 启动定时清理
   */
  startCleanup(): void {
    if (this.cleanupTimer) return;

    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.options.checkInterval);
  }

  /**
   * 停止定时清理
   */
  stopCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  /**
   * 主动清理过期项
   */
  cleanup(): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        this.options.onExpire(key, entry.value);
        cleaned++;
      }
    }

    return cleaned;
  }

  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache) {
      if (entry.createdAt < oldestTime) {
        oldestTime = entry.createdAt;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.delete(oldestKey);
    }
  }
}

// ============================================================================
// 分层 TTL 缓存
// ============================================================================

export class TieredTTLCache<V = unknown> {
  private hot: TTLCache<V>;
  private warm: TTLCache<V>;

  constructor(options: { hotTTL: number; warmTTL: number; hotSize: number; warmSize: number }) {
    this.hot = new TTLCache<V>({
      defaultTTL: options.hotTTL,
      maxSize: options.hotSize
    });

    this.warm = new TTLCache<V>({
      defaultTTL: options.warmTTL,
      maxSize: options.warmSize
    });
  }

  /**
   * 获取值（热缓存 -> 温缓存）
   */
  get(key: string): V | undefined {
    const hotValue = this.hot.get(key);
    if (hotValue !== undefined) return hotValue;

    const warmValue = this.warm.get(key);
    if (warmValue !== undefined) {
      // 提升到热缓存
      this.hot.set(key, warmValue);
      return warmValue;
    }

    return undefined;
  }

  /**
   * 设置值（同时写入热缓存和温缓存）
   */
  set(key: string, value: V): void {
    this.hot.set(key, value);
    this.warm.set(key, value);
  }

  /**
   * 删除值
   */
  delete(key: string): void {
    this.hot.delete(key);
    this.warm.delete(key);
  }
}

// ============================================================================
// 使用示例
// ============================================================================

export function demo(): void {
  console.log('=== TTL Cache ===\n');

  const cache = new TTLCache<string>({
    defaultTTL: 5000,
    checkInterval: 0, // 禁用定时清理
    onExpire: (key) => console.log(`  Expired: ${key}`)
  });

  cache.set('a', 'apple', 1000);
  cache.set('b', 'banana');

  console.log('Initial values:');
  console.log('  a:', cache.get('a'));
  console.log('  b:', cache.get('b'));

  console.log('\nTTL for a:', cache.getTTL('a'), 'ms');

  // 模拟过期
  cache.set('c', 'cherry', -1);
  console.log('Expired c:', cache.get('c'));

  console.log('\nStats:', cache.getStats());
}
