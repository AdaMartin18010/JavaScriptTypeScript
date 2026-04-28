/**
 * @file 重试机制实现
 * @category Chaos Engineering → Retry Mechanisms
 * @difficulty hard
 * @tags chaos-engineering, retry, backoff, resilience, idempotency
 *
 * @description
 * 强大的重试机制实现，支持多种退避策略和断路器集成。
 *
 * 退避策略：
 * - Fixed: 固定间隔
 * - Linear: 线性增长
 * - Exponential: 指数退避
 * - Exponential with Jitter: 指数退避+随机抖动（避免惊群）
 * - Fibonacci: 斐波那契数列退避
 * - Decorrelated Jitter: AWS 推荐的退避算法
 *
 * 重试特性：
 * - 可重试错误判定
 * - 幂等性检查
 * - 超时控制
 * - 取消信号支持
 * - 上下文传递
 */

export interface RetryConfig {
  maxAttempts: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffStrategy: 'fixed' | 'linear' | 'exponential' | 'exponential-jitter' | 'fibonacci' | 'decorrelated-jitter';
  backoffMultiplier: number;
  retryableErrors?: (string | RegExp | ((error: Error) => boolean))[];
  nonRetryableErrors?: (string | RegExp | ((error: Error) => boolean))[];
  onRetry?: (attempt: number, error: Error, delayMs: number) => void;
  onSuccess?: (attempt: number, result: unknown) => void;
  onFailure?: (error: Error) => void;
}

export interface RetryContext {
  attempt: number;
  startTime: number;
  lastError?: Error;
  cumulativeDelay: number;
  cancelled: boolean;
}

export interface RetryResult<T> {
  success: boolean;
  result?: T;
  error?: Error;
  attempts: number;
  totalDelay: number;
  duration: number;
}

// ==================== 退避策略 ====================

export class BackoffStrategies {
  /**
   * 固定间隔
   */
  static fixed(attempt: number, baseDelay: number): number {
    return baseDelay;
  }

  /**
   * 线性增长
   */
  static linear(attempt: number, baseDelay: number): number {
    return baseDelay * attempt;
  }

  /**
   * 指数退避
   */
  static exponential(attempt: number, baseDelay: number, multiplier: number): number {
    return baseDelay * Math.pow(multiplier, attempt - 1);
  }

  /**
   * 指数退避 + 随机抖动
   */
  static exponentialJitter(attempt: number, baseDelay: number, multiplier: number): number {
    const base = this.exponential(attempt, baseDelay, multiplier);
    const jitter = Math.random() * base;
    return base + jitter;
  }

  /**
   * 斐波那契退避
   */
  static fibonacci(attempt: number, baseDelay: number): number {
    const fib = (n: number): number => {
      if (n <= 1) return 1;
      let a = 1, b = 1;
      for (let i = 2; i <= n; i++) {
        [a, b] = [b, a + b];
      }
      return b;
    };

    return baseDelay * fib(attempt);
  }

  /**
   * Decorrelated Jitter (AWS 推荐)
   * 公式: min(max_delay, random(initial_delay, delay * 3))
   */
  static decorrelatedJitter(
    attempt: number,
    initialDelay: number,
    previousDelay: number,
    maxDelay: number
  ): number {
    const min = initialDelay;
    const max = Math.min(maxDelay, previousDelay * 3);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}

// ==================== 重试执行器 ====================

export class RetryExecutor {
  private config: RetryConfig;
  private previousDelay: number;

  constructor(config: Partial<RetryConfig> = {}) {
    this.config = {
      maxAttempts: config.maxAttempts ?? 3,
      initialDelayMs: config.initialDelayMs ?? 1000,
      maxDelayMs: config.maxDelayMs ?? 30000,
      backoffStrategy: config.backoffStrategy ?? 'exponential-jitter',
      backoffMultiplier: config.backoffMultiplier ?? 2,
      retryableErrors: config.retryableErrors ?? [],
      nonRetryableErrors: config.nonRetryableErrors ?? [],
      onRetry: config.onRetry,
      onSuccess: config.onSuccess,
      onFailure: config.onFailure
    };
    this.previousDelay = this.config.initialDelayMs;
  }

  /**
   * 执行带重试的操作
   */
  async execute<T>(
    operation: (context: RetryContext) => Promise<T>,
    signal?: AbortSignal
  ): Promise<RetryResult<T>> {
    const startTime = Date.now();
    const context: RetryContext = {
      attempt: 0,
      startTime,
      cumulativeDelay: 0,
      cancelled: false
    };

    while (context.attempt < this.config.maxAttempts) {
      context.attempt++;

      // 检查取消信号
      if (signal?.aborted) {
        context.cancelled = true;
        return this.createResult<T>(context, startTime, undefined, new Error('Retry cancelled'));
      }

      try {
        const result = await operation(context);

        if (this.config.onSuccess) {
          this.config.onSuccess(context.attempt, result);
        }

        return this.createResult(context, startTime, result);
      } catch (error) {
        const err = error as Error;
        context.lastError = err;

        // 检查是否应该重试
        if (context.attempt >= this.config.maxAttempts || !this.isRetryable(err)) {
          if (this.config.onFailure) {
            this.config.onFailure(err);
          }
          return this.createResult<T>(context, startTime, undefined, err);
        }

        // 计算延迟
        const delayMs = this.calculateDelay(context.attempt);
        context.cumulativeDelay += delayMs;

        if (this.config.onRetry) {
          this.config.onRetry(context.attempt, err, delayMs);
        }

        // 等待
        await this.sleep(delayMs, signal);
      }
    }

    // 重试次数耗尽
    return this.createResult<T>(context, startTime, undefined, context.lastError);
  }

  /**
   * 判断错误是否可重试
   */
  private isRetryable(error: Error): boolean {
    // 检查非可重试错误
    for (const pattern of this.config.nonRetryableErrors ?? []) {
      if (this.matchesPattern(error, pattern)) {
        return false;
      }
    }

    // 如果没有指定可重试错误，则默认所有错误都可重试
    if (!this.config.retryableErrors || this.config.retryableErrors.length === 0) {
      return true;
    }

    // 检查可重试错误
    for (const pattern of this.config.retryableErrors) {
      if (this.matchesPattern(error, pattern)) {
        return true;
      }
    }

    return false;
  }

  private matchesPattern(error: Error, pattern: string | RegExp | ((error: Error) => boolean)): boolean {
    if (typeof pattern === 'string') {
      return error.message.includes(pattern) || error.name === pattern;
    }
    if (pattern instanceof RegExp) {
      return pattern.test(error.message) || pattern.test(error.name);
    }
    return pattern(error);
  }

  /**
   * 计算延迟时间
   */
  private calculateDelay(attempt: number): number {
    let delay: number;

    switch (this.config.backoffStrategy) {
      case 'fixed':
        delay = BackoffStrategies.fixed(attempt, this.config.initialDelayMs);
        break;
      case 'linear':
        delay = BackoffStrategies.linear(attempt, this.config.initialDelayMs);
        break;
      case 'exponential':
        delay = BackoffStrategies.exponential(attempt, this.config.initialDelayMs, this.config.backoffMultiplier);
        break;
      case 'exponential-jitter':
        delay = BackoffStrategies.exponentialJitter(attempt, this.config.initialDelayMs, this.config.backoffMultiplier);
        break;
      case 'fibonacci':
        delay = BackoffStrategies.fibonacci(attempt, this.config.initialDelayMs);
        break;
      case 'decorrelated-jitter':
        delay = BackoffStrategies.decorrelatedJitter(
          attempt,
          this.config.initialDelayMs,
          this.previousDelay,
          this.config.maxDelayMs
        );
        this.previousDelay = delay;
        break;
      default:
        delay = this.config.initialDelayMs;
    }

    // 限制最大延迟
    return Math.min(delay, this.config.maxDelayMs);
  }

  private sleep(ms: number, signal?: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        cleanup();
        resolve();
      }, ms);

      const onAbort = () => {
        cleanup();
        reject(new Error('Retry cancelled'));
      };

      const cleanup = () => {
        clearTimeout(timeout);
        signal?.removeEventListener('abort', onAbort);
      };

      signal?.addEventListener('abort', onAbort);
    });
  }

  private createResult<T>(
    context: RetryContext,
    startTime: number,
    result?: T,
    error?: Error
  ): RetryResult<T> {
    return {
      success: error === undefined,
      result,
      error,
      attempts: context.attempt,
      totalDelay: context.cumulativeDelay,
      duration: Date.now() - startTime
    };
  }
}

// ==================== 幂等性包装器 ====================

export interface IdempotencyConfig {
  keyGenerator: (...args: any[]) => string;
  ttlMs: number;
  store: IdempotencyStore;
}

export interface IdempotencyStore {
  get(key: string): { result: unknown; timestamp: number } | undefined;
  set(key: string, result: unknown): void;
  delete(key: string): void;
}

export class InMemoryIdempotencyStore implements IdempotencyStore {
  private store = new Map<string, { result: unknown; timestamp: number }>();

  get(key: string): { result: unknown; timestamp: number } | undefined {
    return this.store.get(key);
  }

  set(key: string, result: unknown): void {
    this.store.set(key, { result, timestamp: Date.now() });
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  cleanup(ttlMs: number): void {
    const cutoff = Date.now() - ttlMs;
    for (const [key, value] of this.store.entries()) {
      if (value.timestamp < cutoff) {
        this.store.delete(key);
      }
    }
  }
}

export function withIdempotency<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  config: IdempotencyConfig
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const key = config.keyGenerator(...args);
    const cached = config.store.get(key);

    if (cached && Date.now() - cached.timestamp < config.ttlMs) {
      return cached.result as ReturnType<T>;
    }

    const result = await fn(...args);
    config.store.set(key, result);
    return result;
  };
}

// ==================== 批量重试 ====================

export class BatchRetryExecutor {
  constructor(private config: RetryConfig) {}

  async executeBatch<T>(
    operations: (() => Promise<T>)[],
    options: {
      concurrency?: number;
      continueOnError?: boolean;
    } = {}
  ): Promise<RetryResult<T>[]> {
    const { concurrency = 5, continueOnError = false } = options;
    const results: RetryResult<T>[] = [];
    const executor = new RetryExecutor(this.config);

    // 简单的并发控制
    const executing: Promise<void>[] = [];

    for (const operation of operations) {
      const promise = executor.execute(operation).then(result => {
        results.push(result);
        if (!result.success && !continueOnError) {
          throw result.error;
        }
      });

      executing.push(promise);

      if (executing.length >= concurrency) {
        await Promise.race(executing);
        executing.splice(0, executing.length - concurrency + 1);
      }
    }

    await Promise.all(executing);
    return results;
  }
}

// ==================== 演示 ====================

export function demo(): void {
  console.log('=== 重试机制 ===\n');

  // 不同退避策略对比
  console.log('--- 退避策略对比 ---');
  const strategies = [
    { name: 'Fixed', strategy: 'fixed' as const },
    { name: 'Linear', strategy: 'linear' as const },
    { name: 'Exponential', strategy: 'exponential' as const },
    { name: 'Exponential + Jitter', strategy: 'exponential-jitter' as const },
    { name: 'Fibonacci', strategy: 'fibonacci' as const },
    { name: 'Decorrelated Jitter', strategy: 'decorrelated-jitter' as const }
  ];

  const maxAttempts = 5;
  const initialDelay = 100;

  for (const { name, strategy } of strategies) {
    const executor = new RetryExecutor({
      maxAttempts,
      initialDelayMs: initialDelay,
      backoffStrategy: strategy,
      backoffMultiplier: 2,
      maxDelayMs: 5000
    });

    const delays: number[] = [];
    for (let i = 1; i <= maxAttempts; i++) {
      // 使用反射访问私有方法
      const delay = (executor as unknown as { calculateDelay: (a: number) => number }).calculateDelay(i);
      delays.push(Math.round(delay));
    }

    console.log(`${name}:`, delays.map(d => `${d}ms`).join(' -> '));
  }

  // 实际重试演示
  console.log('\n--- 实际重试演示 ---');
  
  let attemptCount = 0;
  
  async function flakyOperation(context: RetryContext): Promise<string> {
    attemptCount++;
    console.log(`  Attempt ${context.attempt}: Trying operation...`);
    
    // 前2次失败，第3次成功
    if (attemptCount < 3) {
      const error = new Error('Connection timeout');
      (error as NodeJS.ErrnoException).code = 'ETIMEDOUT';
      throw error;
    }
    
    return 'Success!';
  }

  const executor = new RetryExecutor({
    maxAttempts: 5,
    initialDelayMs: 500,
    backoffStrategy: 'exponential-jitter',
    backoffMultiplier: 2,
    retryableErrors: ['ETIMEDOUT', 'ECONNREFUSED', /timeout/i],
    onRetry: (attempt, error, delay) => {
      console.log(`  Retry ${attempt} after ${delay}ms: ${error.message}`);
    },
    onSuccess: (attempt) => {
      console.log(`  Success on attempt ${attempt}!`);
    }
  });

  executor.execute(flakyOperation).then(result => {
    console.log('\nResult:', {
      success: result.success,
      result: result.result,
      attempts: result.attempts,
      totalDelay: `${result.totalDelay}ms`,
      duration: `${result.duration}ms`
    });
  });

  // 幂等性演示
  console.log('\n--- 幂等性演示 ---');
  let callCount = 0;
  
  async function chargePayment(orderId: string, amount: number): Promise<{ id: string; status: string }> {
    callCount++;
    console.log(`  [Actual call #${callCount}] Charging ${amount} for order ${orderId}`);
    return { id: `pay-${Date.now()}`, status: 'completed' };
  }

  const idempotencyStore = new InMemoryIdempotencyStore();
  const idempotentCharge = withIdempotency(chargePayment, {
    keyGenerator: (orderId, amount) => `payment:${orderId}:${amount}`,
    ttlMs: 60000,
    store: idempotencyStore
  });

  // 多次调用相同参数
  idempotentCharge('order-123', 100).then(result => {
    console.log('First call result:', result);
  });

  idempotentCharge('order-123', 100).then(result => {
    console.log('Second call result (from cache):', result);
  });

  idempotentCharge('order-456', 200).then(result => {
    console.log('Third call result (different params):', result);
  });
}
