/**
 * @file 速率限制器（令牌桶算法）
 * @category Cybersecurity → Rate Limiting
 * @difficulty medium
 * @tags rate-limiter, token-bucket, sliding-window, throttling, ddos-protection
 *
 * @description
 * 实现多种速率限制算法，用于防止暴力破解、DDoS 攻击和 API 滥用：
 * - 令牌桶（Token Bucket）：平滑突发流量
 * - 漏桶（Leaky Bucket）：恒定速率输出
 * - 滑动窗口（Sliding Window）：精确计数
 * - 固定窗口（Fixed Window）：简单计数
 */

// ============================================================================
// 类型定义
// ============================================================================

/** 速率限制结果 */
export interface RateLimitResult {
  /** 是否允许通过 */
  allowed: boolean;
  /** 剩余请求数 */
  remaining: number;
  /** 重置时间戳（ms） */
  resetTime: number;
  /** 限流器总容量 */
  limit: number;
  /** 下次可用等待时间（ms），若 allowed 为 true 则为 0 */
  retryAfter: number;
}

/** 令牌桶配置 */
export interface TokenBucketOptions {
  /** 桶容量（最大令牌数） */
  capacity: number;
  /** 每秒填充速率 */
  refillRate: number;
  /** 初始令牌数（默认等于容量） */
  initialTokens?: number;
}

/** 滑动窗口配置 */
export interface SlidingWindowOptions {
  /** 窗口大小（毫秒） */
  windowSizeMs: number;
  /** 窗口内最大请求数 */
  maxRequests: number;
}

/** 固定窗口配置 */
export interface FixedWindowOptions {
  /** 窗口大小（毫秒） */
  windowSizeMs: number;
  /** 窗口内最大请求数 */
  maxRequests: number;
}

// ============================================================================
// 令牌桶算法
// ============================================================================

/**
 * 令牌桶限流器
 *
 * 令牌桶算法允许一定程度的突发流量，同时保持长期的平均速率。
 * 适用于 API 网关、用户登录频率限制等场景。
 */
export class TokenBucket {
  private tokens: number;
  private lastRefill: number;
  private readonly capacity: number;
  private readonly refillRate: number; // tokens per ms

  constructor(options: TokenBucketOptions) {
    if (options.capacity <= 0) {
      throw new Error('Capacity must be greater than 0');
    }
    if (options.refillRate <= 0) {
      throw new Error('Refill rate must be greater than 0');
    }

    this.capacity = options.capacity;
    this.refillRate = options.refillRate / 1000; // convert to per ms
    this.tokens = options.initialTokens ?? options.capacity;
    this.lastRefill = Date.now();
  }

  /**
   * 尝试消费指定数量的令牌
   * @param tokens - 需要消费的令牌数（默认 1）
   * @returns 速率限制结果
   */
  consume(tokens = 1): RateLimitResult {
    if (tokens <= 0) {
      throw new Error('Tokens to consume must be greater than 0');
    }

    this.refill();

    const now = Date.now();
    const allowed = this.tokens >= tokens;

    if (allowed) {
      this.tokens -= tokens;
    }

    const remaining = Math.floor(this.tokens);
    const retryAfter = allowed
      ? 0
      : Math.ceil((tokens - this.tokens) / (this.refillRate || 1));

    // 计算重置时间（桶满时）
    const tokensToFull = this.capacity - this.tokens;
    const resetTime = now + Math.ceil(tokensToFull / (this.refillRate || 1));

    return {
      allowed,
      remaining: Math.max(0, remaining),
      resetTime,
      limit: this.capacity,
      retryAfter: Math.max(0, retryAfter),
    };
  }

  /**
   * 查看当前状态（不消费令牌）
   */
  peek(): Pick<RateLimitResult, 'remaining' | 'limit' | 'resetTime'> {
    this.refill();
    const now = Date.now();
    const tokensToFull = this.capacity - this.tokens;
    const resetTime = now + Math.ceil(tokensToFull / (this.refillRate || 1));

    return {
      remaining: Math.floor(Math.max(0, this.tokens)),
      limit: this.capacity,
      resetTime,
    };
  }

  private refill(): void {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    const tokensToAdd = elapsed * this.refillRate;

    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }
}

// ============================================================================
// 滑动窗口算法
// ============================================================================

/**
 * 滑动窗口限流器
 *
 * 精确统计在滑动时间窗口内的请求数，避免固定窗口的边界突发问题。
 * 适用于需要精确限流的场景，如支付接口、短信发送。
 */
export class SlidingWindowLimiter {
  private requests: number[] = [];
  private readonly windowSizeMs: number;
  private readonly maxRequests: number;

  constructor(options: SlidingWindowOptions) {
    if (options.windowSizeMs <= 0) {
      throw new Error('Window size must be greater than 0');
    }
    if (options.maxRequests <= 0) {
      throw new Error('Max requests must be greater than 0');
    }

    this.windowSizeMs = options.windowSizeMs;
    this.maxRequests = options.maxRequests;
  }

  /**
   * 尝试允许一个请求通过
   */
  allow(): RateLimitResult {
    const now = Date.now();
    this.cleanup(now);

    const allowed = this.requests.length < this.maxRequests;

    if (allowed) {
      this.requests.push(now);
    }

    const remaining = Math.max(0, this.maxRequests - this.requests.length);
    const resetTime = this.requests.length > 0 ? this.requests[0] + this.windowSizeMs : now;
    const retryAfter = allowed ? 0 : resetTime - now;

    return {
      allowed,
      remaining,
      resetTime,
      limit: this.maxRequests,
      retryAfter: Math.max(0, retryAfter),
    };
  }

  /**
   * 获取当前窗口内的请求统计
   */
  getStats(): { currentRequests: number; windowStart: number; windowEnd: number } {
    const now = Date.now();
    this.cleanup(now);

    return {
      currentRequests: this.requests.length,
      windowStart: this.requests.length > 0 ? this.requests[0] : now,
      windowEnd: now,
    };
  }

  private cleanup(now: number): void {
    const cutoff = now - this.windowSizeMs;
    const index = this.requests.findIndex(t => t > cutoff);
    if (index > 0) {
      this.requests = this.requests.slice(index);
    } else if (index === -1) {
      this.requests = [];
    }
  }
}

// ============================================================================
// 固定窗口算法
// ============================================================================

/**
 * 固定窗口限流器
 *
 * 将时间划分为固定长度的窗口，每个窗口内独立计数。
 * 实现简单，但窗口边界可能出现突发流量（2倍限流）。
 * 适用于对精确度要求不高的场景。
 */
export class FixedWindowLimiter {
  private counts = new Map<number, number>();
  private readonly windowSizeMs: number;
  private readonly maxRequests: number;

  constructor(options: FixedWindowOptions) {
    if (options.windowSizeMs <= 0) {
      throw new Error('Window size must be greater than 0');
    }
    if (options.maxRequests <= 0) {
      throw new Error('Max requests must be greater than 0');
    }

    this.windowSizeMs = options.windowSizeMs;
    this.maxRequests = options.maxRequests;
  }

  /**
   * 尝试允许一个请求通过
   */
  allow(): RateLimitResult {
    const now = Date.now();
    const windowIndex = Math.floor(now / this.windowSizeMs);
    this.cleanup(windowIndex);

    const currentCount = this.counts.get(windowIndex) || 0;
    const allowed = currentCount < this.maxRequests;

    if (allowed) {
      this.counts.set(windowIndex, currentCount + 1);
    }

    const remaining = Math.max(0, this.maxRequests - (this.counts.get(windowIndex) || 0));
    const resetTime = (windowIndex + 1) * this.windowSizeMs;
    const retryAfter = allowed ? 0 : resetTime - now;

    return {
      allowed,
      remaining,
      resetTime,
      limit: this.maxRequests,
      retryAfter: Math.max(0, retryAfter),
    };
  }

  private cleanup(currentWindow: number): void {
    for (const key of this.counts.keys()) {
      if (key < currentWindow - 1) {
        this.counts.delete(key);
      }
    }
  }
}

// ============================================================================
// 多键限流器（按标识符限流）
// ============================================================================

/**
 * 多键速率限制器
 *
 * 为每个标识符（如用户ID、IP地址）维护独立的限流桶。
 * 适用于多租户 API 限流场景。
 */
export class MultiKeyRateLimiter<TKey extends string = string> {
  private buckets = new Map<TKey, TokenBucket>();
  private readonly defaultOptions: TokenBucketOptions;

  constructor(defaultOptions: TokenBucketOptions) {
    this.defaultOptions = { ...defaultOptions };
  }

  /**
   * 为指定键消费令牌
   * @param key - 标识符
   * @param tokens - 消费令牌数
   */
  consume(key: TKey, tokens = 1): RateLimitResult {
    let bucket = this.buckets.get(key);
    if (!bucket) {
      bucket = new TokenBucket({ ...this.defaultOptions });
      this.buckets.set(key, bucket);
    }
    return bucket.consume(tokens);
  }

  /**
   * 获取指定键的当前状态
   */
  peek(key: TKey): Pick<RateLimitResult, 'remaining' | 'limit' | 'resetTime'> | null {
    const bucket = this.buckets.get(key);
    if (!bucket) {
      return {
        remaining: this.defaultOptions.capacity,
        limit: this.defaultOptions.capacity,
        resetTime: Date.now(),
      };
    }
    return bucket.peek();
  }

  /**
   * 重置指定键的限流状态
   */
  reset(key: TKey): void {
    this.buckets.delete(key);
  }

  /**
   * 获取所有活跃键的数量
   */
  getActiveKeyCount(): number {
    return this.buckets.size;
  }
}

export function demo(): void {
  console.log('=== 速率限制器 ===\n');

  // 令牌桶演示
  console.log('--- 令牌桶 (容量10, 每秒填充2个) ---');
  const bucket = new TokenBucket({ capacity: 10, refillRate: 2 });
  for (let i = 1; i <= 5; i++) {
    const result = bucket.consume();
    console.log(`  请求 ${i}: ${result.allowed ? '允许' : '拒绝'}, 剩余: ${result.remaining}`);
  }

  // 滑动窗口演示
  console.log('\n--- 滑动窗口 (1秒窗口, 最多3个请求) ---');
  const sliding = new SlidingWindowLimiter({ windowSizeMs: 1000, maxRequests: 3 });
  for (let i = 1; i <= 5; i++) {
    const result = sliding.allow();
    console.log(`  请求 ${i}: ${result.allowed ? '允许' : '拒绝'}, 剩余: ${result.remaining}`);
  }

  // 固定窗口演示
  console.log('\n--- 固定窗口 (1秒窗口, 最多3个请求) ---');
  const fixed = new FixedWindowLimiter({ windowSizeMs: 1000, maxRequests: 3 });
  for (let i = 1; i <= 5; i++) {
    const result = fixed.allow();
    console.log(`  请求 ${i}: ${result.allowed ? '允许' : '拒绝'}, 剩余: ${result.remaining}`);
  }

  // 多键限流器
  console.log('\n--- 多键限流器 ---');
  const multi = new MultiKeyRateLimiter({ capacity: 5, refillRate: 1 });
  console.log('用户A 请求1:', multi.consume('user-a').allowed ? '允许' : '拒绝');
  console.log('用户A 请求2:', multi.consume('user-a').allowed ? '允许' : '拒绝');
  console.log('用户B 请求1:', multi.consume('user-b').allowed ? '允许' : '拒绝');
  console.log('活跃键数量:', multi.getActiveKeyCount());
}
