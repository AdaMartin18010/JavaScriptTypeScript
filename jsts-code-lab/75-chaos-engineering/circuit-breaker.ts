/**
 * @file 高级熔断器实现
 * @category Chaos Engineering → Circuit Breaker
 * @difficulty hard
 * @tags chaos-engineering, circuit-breaker, fault-tolerance, resilience
 *
 * @description
 * 高级熔断器实现，支持多种熔断策略和自适应恢复机制。
 *
 * 熔断策略：
 * - Count-based: 基于失败计数
 * - Rate-based: 基于失败率
 * - Latency-based: 基于延迟百分位
 * - Concurrency-based: 基于并发数
 *
 * 恢复策略：
 * - Fixed backoff: 固定时间后尝试恢复
 * - Exponential backoff: 指数退避
 * - Adaptive: 根据失败模式自适应调整
 * - Half-open probing: 半开状态下探测请求
 *
 * 状态转换：
 *   CLOSED ──(失败阈值)──> OPEN ──(恢复超时)──> HALF_OPEN ──(探测成功)──> CLOSED
 *                                                        │
 *                                                        └──(探测失败)──> OPEN
 */

export enum CircuitBreakerState {
  CLOSED = 'closed',     // 正常状态，请求通过
  OPEN = 'open',         // 熔断状态，请求拒绝
  HALF_OPEN = 'half_open' // 半开状态，试探性允许请求
}

export enum CircuitBreakerStrategy {
  COUNT_BASED = 'count',
  RATE_BASED = 'rate',
  LATENCY_BASED = 'latency',
  CONCURRENCY_BASED = 'concurrency'
}

export interface CircuitBreakerConfig {
  // 基本配置
  failureThreshold: number;
  successThreshold: number;
  timeoutDuration: number;
  halfOpenMaxRequests: number;

  // 策略配置
  strategy: CircuitBreakerStrategy;
  
  // 计数策略配置
  slidingWindowSize?: number;
  
  // 延迟策略配置
  latencyThreshold?: number;
  latencyPercentile?: number; // 0-1
  
  // 并发策略配置
  maxConcurrency?: number;
  
  // 恢复配置
  recoveryStrategy: 'fixed' | 'exponential' | 'adaptive';
  baseBackoffMs: number;
  maxBackoffMs: number;
  backoffMultiplier: number;

  // 回调函数
  onStateChange?: (from: CircuitBreakerState, to: CircuitBreakerState) => void;
  onFailure?: (error: Error) => void;
  onSuccess?: () => void;
}

export interface CircuitBreakerMetrics {
  state: CircuitBreakerState;
  failureCount: number;
  successCount: number;
  consecutiveSuccesses: number;
  consecutiveFailures: number;
  lastFailureTime: number | null;
  lastSuccessTime: number | null;
  totalRequests: number;
  rejectedRequests: number;
  averageLatency: number;
  errorRate: number;
}

export interface ExecutionResult<T> {
  success: boolean;
  result?: T;
  error?: Error;
  fallbackUsed: boolean;
  latency: number;
}

// ==================== 滑动窗口计数器 ====================

class SlidingWindowCounter {
  private events: Array<{ timestamp: number; success: boolean; latency: number }> = [];

  constructor(private windowSize: number) {}

  record(success: boolean, latency: number): void {
    this.events.push({
      timestamp: Date.now(),
      success,
      latency
    });

    this.cleanup();
  }

  getStats(): { total: number; failures: number; successRate: number; avgLatency: number } {
    this.cleanup();

    if (this.events.length === 0) {
      return { total: 0, failures: 0, successRate: 1, avgLatency: 0 };
    }

    const failures = this.events.filter(e => !e.success).length;
    const totalLatency = this.events.reduce((sum, e) => sum + e.latency, 0);

    return {
      total: this.events.length,
      failures,
      successRate: (this.events.length - failures) / this.events.length,
      avgLatency: totalLatency / this.events.length
    };
  }

  getPercentileLatency(percentile: number): number {
    this.cleanup();

    if (this.events.length === 0) return 0;

    const latencies = this.events.map(e => e.latency).sort((a, b) => a - b);
    const index = Math.floor(latencies.length * percentile);
    return latencies[Math.min(index, latencies.length - 1)];
  }

  private cleanup(): void {
    const cutoff = Date.now() - this.windowSize;
    this.events = this.events.filter(e => e.timestamp > cutoff);
  }

  clear(): void {
    this.events = [];
  }
}

// ==================== 高级熔断器 ====================

export class AdvancedCircuitBreaker {
  private state: CircuitBreakerState = CircuitBreakerState.CLOSED;
  private failureCount = 0;
  private successCount = 0;
  private consecutiveSuccesses = 0;
  private consecutiveFailures = 0;
  private lastFailureTime: number | null = null;
  private lastSuccessTime: number | null = null;
  private totalRequests = 0;
  private rejectedRequests = 0;
  private currentBackoffMs: number;
  private nextAttemptTime = 0;
  private halfOpenRequests = 0;
  private slidingWindow: SlidingWindowCounter;

  constructor(private config: CircuitBreakerConfig) {
    this.currentBackoffMs = config.baseBackoffMs;
    this.slidingWindow = new SlidingWindowCounter(
      config.slidingWindowSize || 60000 // 默认1分钟窗口
    );
  }

  /**
   * 执行受保护的操作
   */
  async execute<T>(
    operation: () => Promise<T>,
    fallback?: () => T
  ): Promise<T> {
    const startTime = Date.now();
    this.totalRequests++;

    // 检查是否可以执行
    if (!this.canExecute()) {
      this.rejectedRequests++;
      
      if (fallback) {
        const fallbackResult = fallback();
        return fallbackResult;
      }

      throw new Error(`Circuit breaker is ${this.state}`);
    }

    try {
      // 在半开状态下跟踪请求数
      if (this.state === CircuitBreakerState.HALF_OPEN) {
        this.halfOpenRequests++;
      }

      const result = await operation();
      const latency = Date.now() - startTime;

      this.recordSuccess(latency);
      return result;
    } catch (error) {
      const latency = Date.now() - startTime;
      this.recordFailure(error as Error, latency);

      if (fallback) {
        return fallback();
      }

      throw error;
    }
  }

  /**
   * 检查当前是否允许执行
   */
  private canExecute(): boolean {
    switch (this.state) {
      case CircuitBreakerState.CLOSED:
        return true;

      case CircuitBreakerState.OPEN:
        if (Date.now() >= this.nextAttemptTime) {
          this.transitionTo(CircuitBreakerState.HALF_OPEN);
          return true;
        }
        return false;

      case CircuitBreakerState.HALF_OPEN:
        return this.halfOpenRequests < this.config.halfOpenMaxRequests;
    }
  }

  /**
   * 记录成功
   */
  private recordSuccess(latency: number): void {
    this.successCount++;
    this.consecutiveSuccesses++;
    this.consecutiveFailures = 0;
    this.lastSuccessTime = Date.now();

    this.slidingWindow.record(true, latency);

    // 配置的成功回调
    if (this.config.onSuccess) {
      this.config.onSuccess();
    }

    // 状态转换逻辑
    switch (this.state) {
      case CircuitBreakerState.HALF_OPEN:
        if (this.consecutiveSuccesses >= this.config.successThreshold) {
          this.transitionTo(CircuitBreakerState.CLOSED);
        }
        break;

      case CircuitBreakerState.CLOSED:
        // 重置失败计数（可选的衰减策略）
        if (this.consecutiveSuccesses >= 5) {
          this.failureCount = Math.max(0, this.failureCount - 1);
        }
        break;
    }
  }

  /**
   * 记录失败
   */
  private recordFailure(error: Error, latency: number): void {
    this.failureCount++;
    this.consecutiveFailures++;
    this.consecutiveSuccesses = 0;
    this.lastFailureTime = Date.now();

    this.slidingWindow.record(false, latency);

    // 配置的失败回调
    if (this.config.onFailure) {
      this.config.onFailure(error);
    }

    // 检查是否需要熔断
    if (this.shouldTrip()) {
      this.transitionTo(CircuitBreakerState.OPEN);
    }
  }

  /**
   * 判断是否应该熔断
   */
  private shouldTrip(): boolean {
    const stats = this.slidingWindow.getStats();

    switch (this.config.strategy) {
      case CircuitBreakerStrategy.COUNT_BASED:
        return this.consecutiveFailures >= this.config.failureThreshold;

      case CircuitBreakerStrategy.RATE_BASED:
        if (stats.total < 10) return false; // 最小样本数
        return stats.successRate < (1 - this.config.failureThreshold / 100);

      case CircuitBreakerStrategy.LATENCY_BASED:
        const percentile = this.config.latencyPercentile || 0.95;
        const threshold = this.config.latencyThreshold || 1000;
        const latency = this.slidingWindow.getPercentileLatency(percentile);
        return latency > threshold;

      case CircuitBreakerStrategy.CONCURRENCY_BASED:
        return this.totalRequests > (this.config.maxConcurrency || 100);

      default:
        return this.consecutiveFailures >= this.config.failureThreshold;
    }
  }

  /**
   * 状态转换
   */
  private transitionTo(newState: CircuitBreakerState): void {
    if (this.state === newState) return;

    const oldState = this.state;
    this.state = newState;

    // 状态转换时的重置操作
    switch (newState) {
      case CircuitBreakerState.CLOSED:
        this.reset();
        this.currentBackoffMs = this.config.baseBackoffMs;
        break;

      case CircuitBreakerState.OPEN:
        this.calculateNextAttempt();
        this.halfOpenRequests = 0;
        break;

      case CircuitBreakerState.HALF_OPEN:
        this.halfOpenRequests = 0;
        this.consecutiveSuccesses = 0;
        break;
    }

    // 状态变化回调
    if (this.config.onStateChange) {
      this.config.onStateChange(oldState, newState);
    }
  }

  /**
   * 计算下次尝试时间
   */
  private calculateNextAttempt(): void {
    switch (this.config.recoveryStrategy) {
      case 'fixed':
        this.currentBackoffMs = this.config.baseBackoffMs;
        break;

      case 'exponential':
        this.currentBackoffMs = Math.min(
          this.currentBackoffMs * this.config.backoffMultiplier,
          this.config.maxBackoffMs
        );
        break;

      case 'adaptive':
        // 根据失败率调整退避时间
        const stats = this.slidingWindow.getStats();
        const failureRate = stats.successRate === 0 ? 1 : 1 - stats.successRate;
        this.currentBackoffMs = Math.min(
          this.config.baseBackoffMs * (1 + failureRate * 5),
          this.config.maxBackoffMs
        );
        break;
    }

    this.nextAttemptTime = Date.now() + this.currentBackoffMs;
  }

  /**
   * 重置状态
   */
  private reset(): void {
    this.failureCount = 0;
    this.successCount = 0;
    this.consecutiveSuccesses = 0;
    this.consecutiveFailures = 0;
    this.slidingWindow.clear();
  }

  /**
   * 获取当前指标
   */
  getMetrics(): CircuitBreakerMetrics {
    const stats = this.slidingWindow.getStats();

    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      consecutiveSuccesses: this.consecutiveSuccesses,
      consecutiveFailures: this.consecutiveFailures,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
      totalRequests: this.totalRequests,
      rejectedRequests: this.rejectedRequests,
      averageLatency: stats.avgLatency,
      errorRate: stats.successRate === 0 ? 0 : 1 - stats.successRate
    };
  }

  /**
   * 手动跳闸
   */
  trip(): void {
    this.transitionTo(CircuitBreakerState.OPEN);
  }

  /**
   * 手动重置
   */
  resetManually(): void {
    this.transitionTo(CircuitBreakerState.CLOSED);
  }

  /**
   * 获取当前状态
   */
  getState(): CircuitBreakerState {
    return this.state;
  }
}

// ==================== 熔断器组 ====================

export class CircuitBreakerGroup {
  private breakers: Map<string, AdvancedCircuitBreaker> = new Map();

  /**
   * 注册熔断器
   */
  register(name: string, config: CircuitBreakerConfig): AdvancedCircuitBreaker {
    const breaker = new AdvancedCircuitBreaker(config);
    this.breakers.set(name, breaker);
    return breaker;
  }

  /**
   * 获取熔断器
   */
  get(name: string): AdvancedCircuitBreaker | undefined {
    return this.breakers.get(name);
  }

  /**
   * 对指定服务执行操作
   */
  async execute<T>(
    serviceName: string,
    operation: () => Promise<T>,
    fallback?: () => T
  ): Promise<T> {
    const breaker = this.breakers.get(serviceName);
    
    if (!breaker) {
      // 没有熔断器时直接执行
      return operation();
    }

    return breaker.execute(operation, fallback);
  }

  /**
   * 获取所有熔断器指标
   */
  getAllMetrics(): Array<{ name: string; metrics: CircuitBreakerMetrics }> {
    return Array.from(this.breakers.entries()).map(([name, breaker]) => ({
      name,
      metrics: breaker.getMetrics()
    }));
  }

  /**
   * 重置所有熔断器
   */
  resetAll(): void {
    for (const breaker of this.breakers.values()) {
      breaker.resetManually();
    }
  }
}

// ==================== 演示 ====================

export function demo(): void {
  console.log('=== 高级熔断器 ===\n');

  // 创建熔断器组
  const group = new CircuitBreakerGroup();

  // 注册不同策略的熔断器
  const userServiceBreaker = group.register('user-service', {
    strategy: CircuitBreakerStrategy.RATE_BASED,
    failureThreshold: 50, // 50% 失败率触发熔断
    successThreshold: 3,
    timeoutDuration: 5000,
    halfOpenMaxRequests: 3,
    slidingWindowSize: 10000, // 10秒窗口
    recoveryStrategy: 'exponential',
    baseBackoffMs: 1000,
    maxBackoffMs: 30000,
    backoffMultiplier: 2,
    onStateChange: (from, to) => {
      console.log(`  [State Change] ${from} -> ${to}`);
    }
  });

  // 模拟服务调用
  let callCount = 0;
  
  async function simulateUserServiceCall(): Promise<string> {
    callCount++;
    
    // 模拟前5次调用失败，之后成功
    if (callCount <= 5) {
      throw new Error('Service temporarily unavailable');
    }
    
    return `User data #${callCount}`;
  }

  async function runSimulation() {
    console.log('--- 模拟服务调用 ---');
    
    for (let i = 0; i < 15; i++) {
      try {
        const result = await userServiceBreaker.execute(
          () => simulateUserServiceCall(),
          () => 'FALLBACK_USER_DATA'
        );
        console.log(`Call ${i + 1}: SUCCESS - ${result}`);
      } catch (error) {
        console.log(`Call ${i + 1}: FAILED - ${(error as Error).message}`);
      }

      // 打印状态
      const metrics = userServiceBreaker.getMetrics();
      console.log(`  State: ${metrics.state}, Failures: ${metrics.failureCount}, Error Rate: ${(metrics.errorRate * 100).toFixed(1)}%`);

      // 等待一小段时间
      await new Promise(r => setTimeout(r, 200));
    }

    console.log('\n--- 最终指标 ---');
    const finalMetrics = userServiceBreaker.getMetrics();
    console.log('State:', finalMetrics.state);
    console.log('Total Requests:', finalMetrics.totalRequests);
    console.log('Rejected Requests:', finalMetrics.rejectedRequests);
    console.log('Average Latency:', finalMetrics.averageLatency.toFixed(2), 'ms');
    console.log('Error Rate:', (finalMetrics.errorRate * 100).toFixed(1), '%');
  }

  runSimulation();
}
