/**
 * @file 熔断器模式实现
 * @category Distributed Systems → Resilience
 * @difficulty hard
 * @tags distributed-systems, circuit-breaker, fault-tolerance, resilience
 *
 * @description
 * 熔断器模式（Circuit Breaker）是分布式系统中防止级联故障的核心韧性模式。
 *
 * 核心概念：
 * - Closed 状态：正常处理请求，同时统计失败率
 * - Open 状态：失败率达到阈值，直接快速失败，给下游系统恢复时间
 * - Half-Open 状态：经过超时后允许少量探测请求，验证下游是否恢复
 *
 * 状态转换：
 *   Closed --(失败率↑)--> Open --(超时后)--> Half-Open --(成功)--> Closed
 *                                         |
 *                                         └--(失败)--> Open
 */

export type CircuitBreakerState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerOptions {
  /** 触发熔断的失败阈值（百分比 0-100） */
  failureThreshold: number;
  /** 触发熔断所需的最小请求数 */
  minimumRequests: number;
  /** Open 状态持续时间（毫秒） */
  openDurationMs: number;
  /** Half-Open 状态下允许的探测请求数 */
  halfOpenMaxCalls: number;
  /** 降级回调函数 */
  fallback?: <T>(error: Error) => T;
  /** 判断异常是否应计入失败的回调 */
  isFailure?: (error: unknown) => boolean;
  /** 成功回调 */
  onStateChange?: (from: CircuitBreakerState, to: CircuitBreakerState) => void;
}

export interface CircuitBreakerMetrics {
  state: CircuitBreakerState;
  failures: number;
  successes: number;
  rejects: number;
  consecutiveFailures: number;
  lastFailureTime: number | null;
}

export class CircuitBreaker {
  private state: CircuitBreakerState = 'CLOSED';
  private failures = 0;
  private successes = 0;
  private rejects = 0;
  private consecutiveFailures = 0;
  private lastFailureTime: number | null = null;
  private halfOpenCalls = 0;
  private nextAttemptTime = 0;

  private readonly options: Required<CircuitBreakerOptions>;

  constructor(options: Partial<CircuitBreakerOptions> = {}) {
    this.options = {
      failureThreshold: options.failureThreshold ?? 50,
      minimumRequests: options.minimumRequests ?? 5,
      openDurationMs: options.openDurationMs ?? 5000,
      halfOpenMaxCalls: options.halfOpenMaxCalls ?? 3,
      fallback: options.fallback ?? (() => { throw new Error('Circuit breaker is OPEN'); }),
      isFailure: options.isFailure ?? (() => true),
      onStateChange: options.onStateChange ?? (() => {})
    };
  }

  /**
   * 执行受熔断器保护的操作
   * 当熔断器处于 OPEN 状态时，直接执行降级策略
   */
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() >= this.nextAttemptTime) {
        this.transitionTo('HALF_OPEN');
      } else {
        this.rejects++;
        return this.options.fallback(new Error(`Circuit breaker is OPEN, retry after ${this.nextAttemptTime}`)) as T;
      }
    }

    if (this.state === 'HALF_OPEN' && this.halfOpenCalls >= this.options.halfOpenMaxCalls) {
      this.rejects++;
      return this.options.fallback(new Error('Circuit breaker is HALF_OPEN, max probe calls reached')) as T;
    }

    if (this.state === 'HALF_OPEN') {
      this.halfOpenCalls++;
    }

    try {
      const result = await operation();
      this.recordSuccess();
      return result;
    } catch (error) {
      this.recordFailure(error);
      return this.options.fallback(error instanceof Error ? error : new Error(String(error))) as T;
    }
  }

  /** 记录一次成功调用 */
  private recordSuccess(): void {
    this.successes++;
    this.consecutiveFailures = 0;

    if (this.state === 'HALF_OPEN') {
      // 探测成功，关闭熔断器
      this.transitionTo('CLOSED');
    }
  }

  /** 记录一次失败调用 */
  private recordFailure(error: unknown): void {
    if (!this.options.isFailure(error)) {
      // 非业务失败不计入
      return;
    }

    this.failures++;
    this.consecutiveFailures++;
    this.lastFailureTime = Date.now();

    const total = this.failures + this.successes;
    if (
      this.state === 'CLOSED' &&
      total >= this.options.minimumRequests &&
      (this.failures / total) * 100 >= this.options.failureThreshold
    ) {
      this.transitionTo('OPEN');
    } else if (this.state === 'HALF_OPEN') {
      // 探测失败，重新打开
      this.transitionTo('OPEN');
    }
  }

  /** 状态转换 */
  private transitionTo(newState: CircuitBreakerState): void {
    if (this.state === newState) return;

    const oldState = this.state;
    this.state = newState;

    if (newState === 'OPEN') {
      this.nextAttemptTime = Date.now() + this.options.openDurationMs;
      this.halfOpenCalls = 0;
    } else if (newState === 'CLOSED') {
      this.failures = 0;
      this.successes = 0;
      this.consecutiveFailures = 0;
      this.halfOpenCalls = 0;
    } else if (newState === 'HALF_OPEN') {
      this.halfOpenCalls = 0;
    }

    this.options.onStateChange(oldState, newState);
  }

  /** 获取当前指标 */
  getMetrics(): CircuitBreakerMetrics {
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      rejects: this.rejects,
      consecutiveFailures: this.consecutiveFailures,
      lastFailureTime: this.lastFailureTime
    };
  }

  /** 手动重置熔断器 */
  reset(): void {
    this.transitionTo('CLOSED');
    this.rejects = 0;
    this.lastFailureTime = null;
  }
}

/**
 * 演示降级策略：返回缓存值
 */
function createCacheFallback<T>(cachedValue: T): (error: Error) => T {
  return (error) => {
    console.log(`  [Fallback] 服务不可用 (${error.message})，返回缓存值`);
    return cachedValue;
  };
}

export async function demo(): Promise<void> {
  console.log('=== 熔断器模式（Circuit Breaker）===\n');

  // 模拟一个不稳定的服务：前 6 次调用都失败，之后恢复
  let callCount = 0;
  const unstableService = async (): Promise<string> => {
    callCount++;
    if (callCount <= 6) {
      throw new Error(`Service unavailable (call #${callCount})`);
    }
    return `Success (call #${callCount})`;
  };

  const cb = new CircuitBreaker({
    failureThreshold: 50,
    minimumRequests: 3,
    openDurationMs: 2000,
    halfOpenMaxCalls: 2,
    fallback: createCacheFallback('CACHED_RESPONSE'),
    onStateChange: (from, to) => {
      console.log(`  [State] ${from} → ${to}`);
    }
  });

  console.log('--- 阶段 1：连续失败触发熔断 ---');
  for (let i = 0; i < 6; i++) {
    const result = await cb.execute(() => unstableService());
    console.log(`  Request ${i + 1}: ${result} | metrics=${JSON.stringify(cb.getMetrics())}`);
  }

  console.log('\n--- 阶段 2：熔断器 OPEN，快速失败 ---');
  for (let i = 0; i < 3; i++) {
    const result = await cb.execute(() => unstableService());
    console.log(`  Request ${i + 1}: ${result} | metrics=${JSON.stringify(cb.getMetrics())}`);
  }

  console.log('\n--- 阶段 3：等待超时后进入 HALF_OPEN ---');
  console.log('  等待 2.5 秒...');
  await new Promise((resolve) => setTimeout(resolve, 0));

  // 此时服务已经恢复（callCount > 6）
  for (let i = 0; i < 4; i++) {
    const result = await cb.execute(() => unstableService());
    console.log(`  Request ${i + 1}: ${result} | metrics=${JSON.stringify(cb.getMetrics())}`);
  }

  console.log('\n--- 阶段 4：手动重置 ---');
  cb.reset();
  console.log('  重置后:', JSON.stringify(cb.getMetrics()));
}
