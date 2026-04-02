/**
 * @file 限流算法实现
 * @category Distributed Systems → Resilience
 * @difficulty hard
 * @tags distributed-systems, rate-limiting, token-bucket, sliding-window, throttling
 *
 * @description
 * 限流（Rate Limiting）是保护系统免受过载的核心机制。本文件实现了四种经典限流算法：
 *
 * 1. 令牌桶（Token Bucket）：
 *    - 以固定速率向桶中添加令牌，请求消耗令牌
 *    - 优点：允许一定程度的突发流量，实现平滑限流
 *
 * 2. 漏桶（Leaky Bucket）：
 *    - 请求像水一样流入桶，以固定速率漏出处理
 *    - 优点：流量绝对平滑，无突发
 *
 * 3. 固定窗口计数器（Fixed Window Counter）：
 *    - 每个时间窗口内允许固定数量的请求
 *    - 优点：实现简单；缺点：窗口边界可能出现 2 倍突发（临界突变问题）
 *
 * 4. 滑动窗口计数器（Sliding Window Counter）：
 *    - 基于 Redis Sorted Set 或本地时间戳队列实现
 *    - 优点：精确统计时间范围内的请求数，避免临界突变
 */

// ==================== Token Bucket ====================

export interface TokenBucketOptions {
  /** 桶容量 */
  capacity: number;
  /** 每秒填充速率 */
  refillRatePerSecond: number;
}

export class TokenBucket {
  private tokens: number;
  private lastRefillTime: number;

  constructor(private readonly options: TokenBucketOptions) {
    this.tokens = options.capacity;
    this.lastRefillTime = Date.now();
  }

  allowRequest(tokens = 1): boolean {
    this.refill();
    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      return true;
    }
    return false;
  }

  private refill(): void {
    const now = Date.now();
    const elapsedMs = now - this.lastRefillTime;
    const tokensToAdd = (elapsedMs / 1000) * this.options.refillRatePerSecond;

    this.tokens = Math.min(this.options.capacity, this.tokens + tokensToAdd);
    this.lastRefillTime = now;
  }
}

// ==================== Leaky Bucket ====================

export interface LeakyBucketOptions {
  /** 桶容量（最大排队请求数） */
  capacity: number;
  /** 每秒漏出（处理）速率 */
  leakRatePerSecond: number;
}

export class LeakyBucket {
  private volume = 0;
  private lastLeakTime = Date.now();
  private queue: Array<{ resolve: (value: boolean) => void }> = [];
  private leakIntervalId: ReturnType<typeof setInterval> | null = null;

  constructor(private readonly options: LeakyBucketOptions) {
    const intervalMs = 1000 / options.leakRatePerSecond;
    this.leakIntervalId = setInterval(() => this.leak(), intervalMs);
  }

  /** 尝试将请求放入漏桶，返回是否被接受（不代表立即处理） */
  tryEnqueue(): boolean {
    this.leak();
    if (this.volume < this.options.capacity) {
      this.volume++;
      return true;
    }
    return false;
  }

  /** 异步等待漏桶处理，若桶满则拒绝 */
  async request(timeoutMs = 5000): Promise<boolean> {
    this.leak();
    if (this.volume < this.options.capacity) {
      this.volume++;
      return true;
    }
    // 桶满，排队等待
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        const idx = this.queue.findIndex((item) => item.resolve === resolve);
        if (idx >= 0) this.queue.splice(idx, 1);
        resolve(false);
      }, timeoutMs);

      this.queue.push({
        resolve: (value) => {
          clearTimeout(timer);
          resolve(value);
        }
      });
    });
  }

  private leak(): void {
    const now = Date.now();
    const elapsedMs = now - this.lastLeakTime;
    const leaks = Math.floor((elapsedMs / 1000) * this.options.leakRatePerSecond);

    if (leaks > 0) {
      this.volume = Math.max(0, this.volume - leaks);
      this.lastLeakTime = now;

      // 唤醒等待中的请求
      let toWake = Math.min(leaks, this.queue.length);
      while (toWake > 0 && this.volume < this.options.capacity) {
        const item = this.queue.shift();
        if (item) {
          this.volume++;
          item.resolve(true);
        }
        toWake--;
      }
    }
  }

  destroy(): void {
    if (this.leakIntervalId) {
      clearInterval(this.leakIntervalId);
      this.leakIntervalId = null;
    }
  }
}

// ==================== Fixed Window Counter ====================

export interface FixedWindowOptions {
  /** 窗口大小（毫秒） */
  windowMs: number;
  /** 每个窗口最大请求数 */
  maxRequests: number;
}

export class FixedWindowCounter {
  private currentWindowStart = Date.now();
  private count = 0;

  constructor(private readonly options: FixedWindowOptions) {}

  allowRequest(): boolean {
    const now = Date.now();
    if (now - this.currentWindowStart >= this.options.windowMs) {
      this.currentWindowStart = now;
      this.count = 0;
    }

    if (this.count < this.options.maxRequests) {
      this.count++;
      return true;
    }
    return false;
  }
}

// ==================== Sliding Window Counter ====================

export interface SlidingWindowOptions {
  /** 窗口大小（毫秒） */
  windowMs: number;
  /** 窗口最大请求数 */
  maxRequests: number;
}

export class SlidingWindowCounter {
  private timestamps: number[] = [];

  constructor(private readonly options: SlidingWindowOptions) {}

  allowRequest(): boolean {
    const now = Date.now();
    const windowStart = now - this.options.windowMs;

    // 清理过期时间戳
    // 使用二分查找找到第一个在窗口内的时间戳（O(log n)）
    const validStartIndex = this.findFirstValidIndex(windowStart);
    this.timestamps = this.timestamps.slice(validStartIndex);

    if (this.timestamps.length < this.options.maxRequests) {
      this.timestamps.push(now);
      return true;
    }
    return false;
  }

  private findFirstValidIndex(threshold: number): number {
    let left = 0;
    let right = this.timestamps.length;
    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      if (this.timestamps[mid] < threshold) {
        left = mid + 1;
      } else {
        right = mid;
      }
    }
    return left;
  }
}

// ==================== Demo ====================

export function demo(): void {
  console.log('=== 限流算法对比 ===\n');

  // 1. Token Bucket
  console.log('--- 令牌桶（Token Bucket）---');
  const tokenBucket = new TokenBucket({ capacity: 10, refillRatePerSecond: 2 });
  let allowed = 0;
  let rejected = 0;
  for (let i = 0; i < 15; i++) {
    if (tokenBucket.allowRequest()) allowed++;
    else rejected++;
  }
  console.log(`  初始突发 15 请求: 允许=${allowed}, 拒绝=${rejected}`);

  // 等待 1 秒后再请求
  setTimeout(() => {
    let laterAllowed = 0;
    for (let i = 0; i < 5; i++) {
      if (tokenBucket.allowRequest()) laterAllowed++;
    }
    console.log(`  等待 1 秒后 5 请求: 允许=${laterAllowed}\n`);

    runLeakyDemo();
  }, 1000);

  function runLeakyDemo(): void {
    // 2. Leaky Bucket
    console.log('--- 漏桶（Leaky Bucket）---');
    const leakyBucket = new LeakyBucket({ capacity: 5, leakRatePerSecond: 2 });
    let leakyAccepted = 0;
    for (let i = 0; i < 8; i++) {
      if (leakyBucket.tryEnqueue()) leakyAccepted++;
    }
    console.log(`  瞬间放入 8 请求: 接受=${leakyAccepted} (容量=5, 速率=2/s)`);
    leakyBucket.destroy();

    // 3. Fixed Window
    console.log('\n--- 固定窗口计数器（Fixed Window）---');
    const fixedWindow = new FixedWindowCounter({ windowMs: 1000, maxRequests: 5 });
    let fwAllowed = 0;
    let fwRejected = 0;
    for (let i = 0; i < 8; i++) {
      if (fixedWindow.allowRequest()) fwAllowed++;
      else fwRejected++;
    }
    console.log(`  同一窗口 8 请求: 允许=${fwAllowed}, 拒绝=${fwRejected}`);

    // 4. Sliding Window
    console.log('\n--- 滑动窗口计数器（Sliding Window）---');
    const slidingWindow = new SlidingWindowCounter({ windowMs: 1000, maxRequests: 5 });
    let swAllowed = 0;
    let swRejected = 0;
    for (let i = 0; i < 8; i++) {
      if (slidingWindow.allowRequest()) swAllowed++;
      else swRejected++;
    }
    console.log(`  同一窗口 8 请求: 允许=${swAllowed}, 拒绝=${swRejected}`);

    console.log('\n--- 算法特性总结 ---');
    console.log('  令牌桶：允许突发，平滑长期速率');
    console.log('  漏桶：绝对平滑，无突发，适合整形流量');
    console.log('  固定窗口：简单高效，但边界可能 2 倍突发');
    console.log('  滑动窗口：精确统计，避免临界突变，内存开销稍大');
  }
}
