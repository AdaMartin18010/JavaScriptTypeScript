/**
 * @file 速率限制实现
 * @category API Security → Rate Limiting
 * @difficulty medium
 * @tags rate-limit, security, throttling, sliding-window, token-bucket
 * 
 * @description
 * 多种速率限制算法实现：
 * - 固定窗口
 * - 滑动窗口
 * - 令牌桶
 * - 漏桶
 */

// ============================================================================
// 1. 基础类型
// ============================================================================

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;  // Unix timestamp
  retryAfter?: number; // seconds
}

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;  // 毫秒
}

// ============================================================================
// 2. 固定窗口算法
// ============================================================================

interface FixedWindowState {
  count: number;
  resetTime: number;
}

export class FixedWindowRateLimiter {
  private windows: Map<string, FixedWindowState> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  check(key: string): RateLimitResult {
    const now = Date.now();
    const windowStart = Math.floor(now / this.config.windowMs) * this.config.windowMs;
    const windowEnd = windowStart + this.config.windowMs;

    let state = this.windows.get(key);

    // 新窗口
    if (!state || state.resetTime <= now) {
      state = { count: 0, resetTime: windowEnd };
      this.windows.set(key, state);
    }

    // 检查限制
    if (state.count >= this.config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: windowEnd,
        retryAfter: Math.ceil((windowEnd - now) / 1000)
      };
    }

    // 允许请求
    state.count++;

    return {
      allowed: true,
      remaining: this.config.maxRequests - state.count,
      resetTime: windowEnd
    };
  }

  reset(key: string): void {
    this.windows.delete(key);
  }
}

// ============================================================================
// 3. 滑动窗口算法
// ============================================================================

interface SlidingWindowEntry {
  timestamp: number;
  count: number;
}

export class SlidingWindowRateLimiter {
  private windows: Map<string, SlidingWindowEntry[]> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  check(key: string): RateLimitResult {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    // 获取或创建窗口
    let entries = this.windows.get(key) || [];

    // 清理过期条目
    entries = entries.filter(e => e.timestamp > windowStart);

    // 计算当前窗口内的请求总数
    const totalCount = entries.reduce((sum, e) => sum + e.count, 0);

    // 找到最早的有效条目
    const oldestEntry = entries[0];
    const resetTime = oldestEntry 
      ? oldestEntry.timestamp + this.config.windowMs 
      : now + this.config.windowMs;

    // 检查限制
    if (totalCount >= this.config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime,
        retryAfter: Math.ceil((resetTime - now) / 1000)
      };
    }

    // 添加新请求
    const lastEntry = entries[entries.length - 1];
    if (lastEntry && lastEntry.timestamp === now) {
      lastEntry.count++;
    } else {
      entries.push({ timestamp: now, count: 1 });
    }

    this.windows.set(key, entries);

    return {
      allowed: true,
      remaining: this.config.maxRequests - totalCount - 1,
      resetTime
    };
  }

  reset(key: string): void {
    this.windows.delete(key);
  }
}

// ============================================================================
// 4. 令牌桶算法
// ============================================================================

interface TokenBucketState {
  tokens: number;
  lastRefill: number;  // timestamp
}

export class TokenBucketRateLimiter {
  private buckets: Map<string, TokenBucketState> = new Map();
  private config: RateLimitConfig;
  private refillRate: number;  // tokens per ms

  constructor(config: RateLimitConfig) {
    this.config = config;
    this.refillRate = config.maxRequests / config.windowMs;
  }

  check(key: string, tokens = 1): RateLimitResult {
    const now = Date.now();
    
    // 获取或创建桶
    let bucket = this.buckets.get(key);
    if (!bucket) {
      bucket = {
        tokens: this.config.maxRequests,
        lastRefill: now
      };
    }

    // 计算需要补充的令牌
    const timePassed = now - bucket.lastRefill;
    const tokensToAdd = timePassed * this.refillRate;
    
    bucket.tokens = Math.min(
      this.config.maxRequests,
      bucket.tokens + tokensToAdd
    );
    bucket.lastRefill = now;

    // 检查是否有足够的令牌
    if (bucket.tokens < tokens) {
      const tokensNeeded = tokens - bucket.tokens;
      const waitTime = tokensNeeded / this.refillRate;
      
      this.buckets.set(key, bucket);
      
      return {
        allowed: false,
        remaining: Math.floor(bucket.tokens),
        resetTime: now + Math.ceil(waitTime),
        retryAfter: Math.ceil(waitTime / 1000)
      };
    }

    // 消耗令牌
    bucket.tokens -= tokens;
    this.buckets.set(key, bucket);

    return {
      allowed: true,
      remaining: Math.floor(bucket.tokens),
      resetTime: now + Math.ceil((this.config.maxRequests - bucket.tokens) / this.refillRate)
    };
  }

  reset(key: string): void {
    this.buckets.delete(key);
  }
}

// ============================================================================
// 5. 漏桶算法
// ============================================================================

interface LeakyBucketState {
  volume: number;      // 当前水量
  lastLeak: number;    // 上次漏水时间
}

export class LeakyBucketRateLimiter {
  private buckets: Map<string, LeakyBucketState> = new Map();
  private config: RateLimitConfig;
  private leakRate: number;  // 每秒漏出的请求数

  constructor(config: RateLimitConfig) {
    this.config = config;
    this.leakRate = config.maxRequests / (config.windowMs / 1000);
  }

  check(key: string, cost = 1): RateLimitResult {
    const now = Date.now();
    
    // 获取或创建桶
    let bucket = this.buckets.get(key);
    if (!bucket) {
      bucket = {
        volume: 0,
        lastLeak: now
      };
    }

    // 计算漏出的水量
    const timePassed = (now - bucket.lastLeak) / 1000;  // 秒
    const leaked = timePassed * this.leakRate;
    
    bucket.volume = Math.max(0, bucket.volume - leaked);
    bucket.lastLeak = now;

    // 检查是否会溢出
    if (bucket.volume + cost > this.config.maxRequests) {
      const waitTime = (bucket.volume + cost - this.config.maxRequests) / this.leakRate;
      
      this.buckets.set(key, bucket);
      
      return {
        allowed: false,
        remaining: Math.max(0, Math.floor(this.config.maxRequests - bucket.volume)),
        resetTime: now + Math.ceil(waitTime * 1000),
        retryAfter: Math.ceil(waitTime)
      };
    }

    // 添加水量
    bucket.volume += cost;
    this.buckets.set(key, bucket);

    return {
      allowed: true,
      remaining: Math.max(0, Math.floor(this.config.maxRequests - bucket.volume)),
      resetTime: now + Math.ceil(bucket.volume / this.leakRate * 1000)
    };
  }

  reset(key: string): void {
    this.buckets.delete(key);
  }
}

// ============================================================================
// 6. 分层速率限制器
// ============================================================================

interface TieredLimit {
  name: string;
  keyExtractor: (request: unknown) => string;
  limiter: FixedWindowRateLimiter | SlidingWindowRateLimiter | TokenBucketRateLimiter;
}

export class TieredRateLimiter {
  private tiers: TieredLimit[] = [];

  addTier(name: string, keyExtractor: (request: unknown) => string, limiter: FixedWindowRateLimiter | SlidingWindowRateLimiter | TokenBucketRateLimiter): void {
    this.tiers.push({ name, keyExtractor, limiter });
  }

  check(request: unknown): { allowed: boolean; results: Array<{ tier: string; result: RateLimitResult }> } {
    const results: Array<{ tier: string; result: RateLimitResult }> = [];

    // 检查所有层级
    for (const tier of this.tiers) {
      const key = tier.keyExtractor(request);
      const result = tier.limiter.check(key);
      results.push({ tier: tier.name, result });

      if (!result.allowed) {
        return { allowed: false, results };
      }
    }

    return { allowed: true, results };
  }
}

// ============================================================================
// 7. 使用示例
// ============================================================================

export function demo(): void {
  console.log('=== 速率限制实现 ===\n');

  console.log('1. 固定窗口 (Fixed Window)');
  const fixedWindow = new FixedWindowRateLimiter({
    maxRequests: 5,
    windowMs: 60000  // 1分钟
  });

  for (let i = 0; i < 7; i++) {
    const result = fixedWindow.check('user-123');
    console.log(`  Request ${i + 1}: ${result.allowed ? 'ALLOWED' : 'DENIED'}, remaining: ${result.remaining}`);
  }

  console.log('\n2. 滑动窗口 (Sliding Window)');
  const slidingWindow = new SlidingWindowRateLimiter({
    maxRequests: 3,
    windowMs: 60000
  });

  for (let i = 0; i < 5; i++) {
    const result = slidingWindow.check('user-456');
    console.log(`  Request ${i + 1}: ${result.allowed ? 'ALLOWED' : 'DENIED'}, remaining: ${result.remaining}`);
  }

  console.log('\n3. 令牌桶 (Token Bucket)');
  const tokenBucket = new TokenBucketRateLimiter({
    maxRequests: 10,
    windowMs: 60000
  });

  // 快速消耗
  for (let i = 0; i < 12; i++) {
    const result = tokenBucket.check('user-789', 2);  // 每次消耗2个令牌
    console.log(`  Request ${i + 1}: ${result.allowed ? 'ALLOWED' : 'DENIED'}, remaining: ${result.remaining}`);
  }

  console.log('\n4. 漏桶 (Leaky Bucket)');
  const leakyBucket = new LeakyBucketRateLimiter({
    maxRequests: 5,
    windowMs: 10000  // 10秒
  });

  for (let i = 0; i < 8; i++) {
    const result = leakyBucket.check('user-abc');
    console.log(`  Request ${i + 1}: ${result.allowed ? 'ALLOWED' : 'DENIED'}, volume: ${5 - result.remaining}`);
  }

  console.log('\n速率限制算法对比:');
  console.log('- 固定窗口: 简单，但可能有突发流量');
  console.log('- 滑动窗口: 平滑，但内存占用大');
  console.log('- 令牌桶: 允许突发，平滑限流');
  console.log('- 漏桶: 严格匀速，适合下游保护');
}

// ============================================================================
// 导出 (类已在上面使用 export class 导出)
// ============================================================================

export type { FixedWindowState, SlidingWindowEntry, TokenBucketState, LeakyBucketState, TieredLimit };;
