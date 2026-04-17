/**
 * @file 限流器
 * @category API Gateway → Rate Limiting
 * @difficulty medium
 * @tags rate-limiting, throttling, traffic-control
 *
 * @description
 * 多种限流算法实现：固定窗口、滑动窗口、令牌桶、漏桶算法
 */

// ============================================================================
// 类型定义
// ============================================================================

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  limit: number;
  retryAfter?: number;
}

export interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  keyPrefix?: string;
}

// ============================================================================
// 固定窗口限流
// ============================================================================

export class FixedWindowRateLimiter {
  private windows: Map<string, { count: number; resetTime: number }> = new Map();
  private cleanupInterval?: ReturnType<typeof setInterval>;

  constructor(private options: RateLimitOptions) {
    // 定期清理过期窗口
    this.cleanupInterval = setInterval(() => this.cleanUp(), options.windowMs);
  }

  /**
   * 停止定期清理
   */
  stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = undefined;
    }
  }

  /**
   * 检查是否允许请求
   */
  check(key: string): RateLimitResult {
    const now = Date.now();
    const windowKey = this.getWindowKey(key, now);
    const window = this.windows.get(windowKey);

    if (!window || now > window.resetTime) {
      // 新窗口
      const resetTime = this.getWindowResetTime(now);
      this.windows.set(windowKey, { count: 1, resetTime });
      
      return {
        allowed: true,
        remaining: this.options.maxRequests - 1,
        resetTime,
        limit: this.options.maxRequests
      };
    }

    if (window.count >= this.options.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: window.resetTime,
        limit: this.options.maxRequests,
        retryAfter: Math.ceil((window.resetTime - now) / 1000)
      };
    }

    window.count++;

    return {
      allowed: true,
      remaining: this.options.maxRequests - window.count,
      resetTime: window.resetTime,
      limit: this.options.maxRequests
    };
  }

  /**
   * 消耗一个配额
   */
  consume(key: string): RateLimitResult {
    return this.check(key);
  }

  private getWindowKey(key: string, now: number): string {
    const windowStart = Math.floor(now / this.options.windowMs);
    return `${this.options.keyPrefix || 'ratelimit'}:${key}:${windowStart}`;
  }

  private getWindowResetTime(now: number): number {
    return Math.ceil(now / this.options.windowMs) * this.options.windowMs;
  }

  private cleanUp(): void {
    const now = Date.now();
    for (const [key, window] of this.windows) {
      if (now > window.resetTime) {
        this.windows.delete(key);
      }
    }
  }
}

// ============================================================================
// 滑动窗口限流
// ============================================================================

export class SlidingWindowRateLimiter {
  private requests: Map<string, number[]> = new Map();

  constructor(private options: RateLimitOptions) {}

  /**
   * 检查是否允许请求
   */
  check(key: string): RateLimitResult {
    const now = Date.now();
    const windowStart = now - this.options.windowMs;

    // 获取并清理该 key 的请求记录
    let timestamps = this.requests.get(key) || [];
    timestamps = timestamps.filter(t => t > windowStart);

    if (timestamps.length >= this.options.maxRequests) {
      const oldestTimestamp = timestamps[0];
      const retryAfter = Math.ceil((oldestTimestamp + this.options.windowMs - now) / 1000);

      return {
        allowed: false,
        remaining: 0,
        resetTime: oldestTimestamp + this.options.windowMs,
        limit: this.options.maxRequests,
        retryAfter
      };
    }

    return {
      allowed: true,
      remaining: this.options.maxRequests - timestamps.length - 1,
      resetTime: now + this.options.windowMs,
      limit: this.options.maxRequests
    };
  }

  /**
   * 记录请求
   */
  record(key: string): RateLimitResult {
    const result = this.check(key);
    
    if (result.allowed) {
      let timestamps = this.requests.get(key) || [];
      const now = Date.now();
      const windowStart = now - this.options.windowMs;
      timestamps = timestamps.filter(t => t > windowStart);
      timestamps.push(now);
      this.requests.set(key, timestamps);
    }

    return result;
  }

  /**
   * 获取当前窗口内的请求数
   */
  getCurrentCount(key: string): number {
    const now = Date.now();
    const windowStart = now - this.options.windowMs;
    const timestamps = this.requests.get(key) || [];
    return timestamps.filter(t => t > windowStart).length;
  }
}

// ============================================================================
// 令牌桶限流
// ============================================================================

export class TokenBucketRateLimiter {
  private buckets: Map<string, { tokens: number; lastUpdate: number }> = new Map();

  constructor(
    private bucketSize: number,
    private refillRate: number, // tokens per second
    private keyPrefix?: string
  ) {}

  /**
   * 检查并消耗令牌
   */
  consume(key: string, tokens: number = 1): RateLimitResult {
    const now = Date.now();
    const bucketKey = `${this.keyPrefix || 'bucket'}:${key}`;
    
    let bucket = this.buckets.get(bucketKey);
    
    if (!bucket) {
      bucket = { tokens: this.bucketSize, lastUpdate: now };
    } else {
      // 补充令牌
      const elapsedMs = now - bucket.lastUpdate;
      const tokensToAdd = (elapsedMs / 1000) * this.refillRate;
      bucket.tokens = Math.min(this.bucketSize, bucket.tokens + tokensToAdd);
      bucket.lastUpdate = now;
    }

    if (bucket.tokens < tokens) {
      // 计算需要等待的时间
      const tokensNeeded = tokens - bucket.tokens;
      const waitMs = (tokensNeeded / this.refillRate) * 1000;

      this.buckets.set(bucketKey, bucket);

      return {
        allowed: false,
        remaining: Math.floor(bucket.tokens),
        resetTime: now + waitMs,
        limit: this.bucketSize,
        retryAfter: Math.ceil(waitMs / 1000)
      };
    }

    bucket.tokens -= tokens;
    this.buckets.set(bucketKey, bucket);

    return {
      allowed: true,
      remaining: Math.floor(bucket.tokens),
      resetTime: now + ((this.bucketSize - bucket.tokens) / this.refillRate) * 1000,
      limit: this.bucketSize
    };
  }

  /**
   * 尝试消耗令牌
   */
  tryConsume(key: string, tokens: number = 1): boolean {
    return this.consume(key, tokens).allowed;
  }

  /**
   * 查看当前令牌数（不消耗）
   */
  peek(key: string): number {
    const now = Date.now();
    const bucketKey = `${this.keyPrefix || 'bucket'}:${key}`;
    const bucket = this.buckets.get(bucketKey);

    if (!bucket) return this.bucketSize;

    const elapsedMs = now - bucket.lastUpdate;
    const tokensToAdd = (elapsedMs / 1000) * this.refillRate;
    return Math.min(this.bucketSize, bucket.tokens + tokensToAdd);
  }
}

// ============================================================================
// 漏桶限流
// ============================================================================

export class LeakyBucketRateLimiter {
  private buckets: Map<string, { volume: number; lastLeak: number }> = new Map();

  constructor(
    private bucketSize: number,
    private leakRate: number, // requests per second
    private keyPrefix?: string
  ) {}

  /**
   * 添加请求到桶中
   */
  add(key: string): RateLimitResult {
    const now = Date.now();
    const bucketKey = `${this.keyPrefix || 'leaky'}:${key}`;
    
    let bucket = this.buckets.get(bucketKey);
    
    if (!bucket) {
      bucket = { volume: 0, lastLeak: now };
    }

    // 计算漏出的量
    const elapsedMs = now - bucket.lastLeak;
    const leaked = (elapsedMs / 1000) * this.leakRate;
    bucket.volume = Math.max(0, bucket.volume - leaked);
    bucket.lastLeak = now;

    if (bucket.volume + 1 > this.bucketSize) {
      // 桶已满
      const waitMs = ((bucket.volume + 1 - this.bucketSize) / this.leakRate) * 1000;
      this.buckets.set(bucketKey, bucket);

      return {
        allowed: false,
        remaining: 0,
        resetTime: now + waitMs,
        limit: this.bucketSize,
        retryAfter: Math.ceil(waitMs / 1000)
      };
    }

    bucket.volume += 1;
    this.buckets.set(bucketKey, bucket);

    return {
      allowed: true,
      remaining: Math.floor(this.bucketSize - bucket.volume),
      resetTime: now + (bucket.volume / this.leakRate) * 1000,
      limit: this.bucketSize
    };
  }

  /**
   * 获取当前桶的负载
   */
  getLoad(key: string): number {
    const bucketKey = `${this.keyPrefix || 'leaky'}:${key}`;
    const bucket = this.buckets.get(bucketKey);

    if (!bucket) return 0;

    const now = Date.now();
    const elapsedMs = now - bucket.lastLeak;
    const leaked = (elapsedMs / 1000) * this.leakRate;
    return Math.max(0, bucket.volume - leaked);
  }
}

// ============================================================================
// 分布式限流协调器（模拟 Redis 实现）
// ============================================================================

export interface DistributedStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlMs: number): Promise<void>;
  incr(key: string): Promise<number>;
  expire(key: string, ttlMs: number): Promise<void>;
}

export class DistributedRateLimiter {
  constructor(
    private store: DistributedStore,
    private options: RateLimitOptions
  ) {}

  /**
   * 分布式限流检查（Redis 滑动窗口）
   */
  async check(key: string): Promise<RateLimitResult> {
    const now = Date.now();
    const windowKey = `${this.options.keyPrefix || 'dist'}:${key}:${Math.floor(now / this.options.windowMs)}`;
    
    const count = await this.store.incr(windowKey);
    
    if (count === 1) {
      // 设置过期时间
      await this.store.expire(windowKey, this.options.windowMs);
    }

    const remaining = Math.max(0, this.options.maxRequests - count);
    const resetTime = Math.ceil(now / this.options.windowMs) * this.options.windowMs;

    return {
      allowed: count <= this.options.maxRequests,
      remaining,
      resetTime,
      limit: this.options.maxRequests,
      retryAfter: count > this.options.maxRequests 
        ? Math.ceil((resetTime - now) / 1000)
        : undefined
    };
  }
}

// ============================================================================
// 使用示例
// ============================================================================

export function demo(): void {
  console.log('=== 限流算法演示 ===\n');

  // 1. 固定窗口
  console.log('--- 固定窗口限流 (100 req/min) ---');
  const fixedWindow = new FixedWindowRateLimiter({
    windowMs: 60000,
    maxRequests: 100
  });

  for (let i = 0; i < 5; i++) {
    const result = fixedWindow.check('user-1');
    console.log(`  Request ${i + 1}: allowed=${result.allowed}, remaining=${result.remaining}`);
  }

  // 2. 滑动窗口
  console.log('\n--- 滑动窗口限流 (10 req/sec) ---');
  const slidingWindow = new SlidingWindowRateLimiter({
    windowMs: 1000,
    maxRequests: 10
  });

  // 快速发送请求
  for (let i = 0; i < 12; i++) {
    const result = slidingWindow.record('api-key-1');
    if (!result.allowed) {
      console.log(`  Request ${i + 1}: BLOCKED (rate limit exceeded)`);
    }
  }
  console.log(`  Current count: ${slidingWindow.getCurrentCount('api-key-1')}`);

  // 3. 令牌桶
  console.log('\n--- 令牌桶限流 (桶大小10, 每秒补充2个) ---');
  const tokenBucket = new TokenBucketRateLimiter(10, 2);

  // 连续消耗令牌
  let burstCount = 0;
  while (tokenBucket.tryConsume('client-1')) {
    burstCount++;
  }
  console.log(`  Burst allowed: ${burstCount} requests`);
  console.log(`  Remaining tokens: ${tokenBucket.peek('client-1')}`);

  // 4. 漏桶
  console.log('\n--- 漏桶限流 (桶大小5, 每秒漏2个) ---');
  const leakyBucket = new LeakyBucketRateLimiter(5, 2);

  for (let i = 0; i < 8; i++) {
    const result = leakyBucket.add('service-1');
    console.log(`  Request ${i + 1}: allowed=${result.allowed}, load=${leakyBucket.getLoad('service-1').toFixed(2)}`);
  }
}
