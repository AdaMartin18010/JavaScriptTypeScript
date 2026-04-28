/**
 * @file 错误处理与边界
 * @category Application Development → Error Handling
 * @difficulty hard
 * @tags error-handling, exception, retry, circuit-breaker, logging
 * 
 * @description
 * 完整的错误处理策略：
 * - 错误分类与处理
 * - 重试机制
 * - 熔断器模式
 * - 错误边界
 * - 日志记录
 */

// ============================================================================
// 1. 错误分类
// ============================================================================

export enum ErrorCategory {
  NETWORK = 'NETWORK',           // 网络错误
  TIMEOUT = 'TIMEOUT',           // 超时错误
  VALIDATION = 'VALIDATION',     // 验证错误
  AUTHENTICATION = 'AUTH',       // 认证错误
  AUTHORIZATION = 'FORBIDDEN',   // 授权错误
  NOT_FOUND = 'NOT_FOUND',       // 资源不存在
  SERVER = 'SERVER',             // 服务器错误
  CLIENT = 'CLIENT',             // 客户端错误
  UNKNOWN = 'UNKNOWN'            // 未知错误
}

export interface AppError extends Error {
  category: ErrorCategory;
  code: string;
  statusCode?: number;
  data?: unknown;
  timestamp: Date;
  context?: Record<string, unknown>;
}

export function createError(
  message: string,
  category: ErrorCategory,
  code: string,
  options?: {
    statusCode?: number;
    data?: unknown;
    context?: Record<string, unknown>;
  }
): AppError {
  const error = new Error(message) as AppError;
  error.category = category;
  error.code = code;
  error.statusCode = options?.statusCode;
  error.data = options?.data;
  error.timestamp = new Date();
  error.context = options?.context;
  return error;
}

// ============================================================================
// 2. 重试机制
// ============================================================================

export interface RetryConfig {
  maxAttempts: number;
  delay: number;
  backoff: 'fixed' | 'linear' | 'exponential';
  retryableErrors?: ErrorCategory[];
  onRetry?: (attempt: number, error: Error) => void;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === config.maxAttempts) {
        throw lastError;
      }
      
      // 检查是否应该重试
      if (config.retryableErrors) {
        const appError = error as AppError;
        if (!config.retryableErrors.includes(appError.category)) {
          throw error;
        }
      }
      
      config.onRetry?.(attempt, lastError);
      
      // 计算延迟
      const delay = calculateDelay(attempt, config);
      await sleep(delay);
    }
  }
  
  throw lastError!;
}

function calculateDelay(attempt: number, config: RetryConfig): number {
  switch (config.backoff) {
    case 'fixed':
      return config.delay;
    case 'linear':
      return config.delay * attempt;
    case 'exponential':
      return config.delay * Math.pow(2, attempt - 1);
    default:
      return config.delay;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
// 3. 熔断器模式
// ============================================================================

export interface CircuitBreakerConfig {
  failureThreshold: number;      // 失败阈值
  resetTimeout: number;          // 重置超时 (ms)
  halfOpenMaxCalls?: number;     // 半开状态最大调用数
}

type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private failureCount = 0;
  private lastFailureTime?: number;
  private halfOpenCalls = 0;

  constructor(private config: CircuitBreakerConfig) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (this.shouldAttemptReset()) {
        this.state = 'HALF_OPEN';
        this.halfOpenCalls = 0;
      } else {
        throw createError(
          'Circuit breaker is OPEN',
          ErrorCategory.UNKNOWN,
          'CIRCUIT_OPEN'
        );
      }
    }

    if (this.state === 'HALF_OPEN') {
      if (this.halfOpenCalls >= (this.config.halfOpenMaxCalls || 1)) {
        throw createError(
          'Circuit breaker is HALF_OPEN and max calls reached',
          ErrorCategory.UNKNOWN,
          'CIRCUIT_HALF_OPEN_MAX'
        );
      }
      this.halfOpenCalls++;
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    if (this.state === 'HALF_OPEN') {
      this.state = 'CLOSED';
      this.failureCount = 0;
      this.halfOpenCalls = 0;
    }
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.state === 'HALF_OPEN' || this.failureCount >= this.config.failureThreshold) {
      this.state = 'OPEN';
    }
  }

  private shouldAttemptReset(): boolean {
    if (!this.lastFailureTime) return true;
    return Date.now() - this.lastFailureTime >= this.config.resetTimeout;
  }

  getState(): CircuitState {
    return this.state;
  }

  getMetrics(): {
    state: CircuitState;
    failureCount: number;
    lastFailureTime?: Date;
  } {
    return {
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime ? new Date(this.lastFailureTime) : undefined
    };
  }
}

// ============================================================================
// 4. 错误边界 (Error Boundary)
// ============================================================================

export type ErrorBoundaryFallback = (error: Error, reset: () => void) => void;

export class ErrorBoundary {
  private hasError = false;
  private error: Error | null = null;
  private fallback: ErrorBoundaryFallback;

  constructor(fallback: ErrorBoundaryFallback) {
    this.fallback = fallback;
  }

  async try<T>(fn: () => Promise<T>): Promise<T | null> {
    if (this.hasError) {
      this.fallback(this.error!, () => { this.reset(); });
      return null;
    }

    try {
      return await fn();
    } catch (err) {
      this.hasError = true;
      this.error = err as Error;
      this.fallback(this.error, () => { this.reset(); });
      return null;
    }
  }

  reset(): void {
    this.hasError = false;
    this.error = null;
  }

  static async wrap<T>(
    fn: () => Promise<T>,
    fallback: ErrorBoundaryFallback
  ): Promise<T | null> {
    const boundary = new ErrorBoundary(fallback);
    return boundary.try(fn);
  }
}

// ============================================================================
// 5. 日志系统
// ============================================================================

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: Record<string, unknown>;
  error?: Error;
}

export class Logger {
  private level: LogLevel = LogLevel.INFO;
  private handlers: ((entry: LogEntry) => void)[] = [];

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  addHandler(handler: (entry: LogEntry) => void): void {
    this.handlers.push(handler);
  }

  private log(level: LogLevel, message: string, context?: Record<string, unknown>, error?: Error): void {
    if (level < this.level) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context,
      error
    };

    this.handlers.forEach(handler => { handler(entry); });
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  fatal(message: string, error?: Error, context?: Record<string, unknown>): void {
    this.log(LogLevel.FATAL, message, context, error);
  }
}

// 控制台处理器
export const consoleHandler = (entry: LogEntry): void => {
  const prefix = `[${entry.timestamp.toISOString()}] [${LogLevel[entry.level]}]`;
  
  switch (entry.level) {
    case LogLevel.DEBUG:
      console.debug(prefix, entry.message, entry.context || '');
      break;
    case LogLevel.INFO:
      console.info(prefix, entry.message, entry.context || '');
      break;
    case LogLevel.WARN:
      console.warn(prefix, entry.message, entry.context || '');
      break;
    case LogLevel.ERROR:
    case LogLevel.FATAL:
      console.error(prefix, entry.message, entry.error || '', entry.context || '');
      break;
  }
};

// ============================================================================
// 6. 使用示例
// ============================================================================

export async function demo(): Promise<void> {
  console.log('=== 错误处理与边界 ===\n');

  // 错误分类示例
  console.log('--- 错误分类 ---');
  const networkError = createError(
    'Network request failed',
    ErrorCategory.NETWORK,
    'NET_001',
    { statusCode: 503, context: { url: '/api/users' } }
  );
  console.log(`错误: ${networkError.message}`);
  console.log(`分类: ${networkError.category}`);
  console.log(`代码: ${networkError.code}`);

  // 重试机制示例
  console.log('\n--- 重试机制 ---');
  let attemptCount = 0;
  try {
    const result = await withRetry(
      async () => {
        attemptCount++;
        if (attemptCount < 3) {
          throw new Error('Temporary failure');
        }
        return 'Success!';
      },
      {
        maxAttempts: 3,
        delay: 100,
        backoff: 'exponential',
        onRetry: (attempt, error) => {
          console.log(`重试 ${attempt}: ${error.message}`);
        }
      }
    );
    console.log(`结果: ${result}`);
  } catch (error) {
    console.log(`最终失败: ${(error as Error).message}`);
  }

  // 熔断器示例
  console.log('\n--- 熔断器模式 ---');
  const breaker = new CircuitBreaker({
    failureThreshold: 3,
    resetTimeout: 5000
  });

  // 模拟连续失败
  for (let i = 0; i < 5; i++) {
    try {
      await breaker.execute(async () => {
        throw new Error('Service unavailable');
      });
    } catch (error) {
      console.log(`调用 ${i + 1}: ${(error as Error).message}`);
      console.log(`  状态: ${breaker.getState()}, 失败数: ${breaker.getMetrics().failureCount}`);
    }
  }

  // 日志系统示例
  console.log('\n--- 日志系统 ---');
  const logger = new Logger();
  logger.setLevel(LogLevel.DEBUG);
  logger.addHandler(consoleHandler);

  logger.debug('调试信息', { detail: 'some debug data' });
  logger.info('应用启动');
  logger.warn('配置缺失', { config: 'database' });
  logger.error('操作失败', new Error('Connection timeout'));

  console.log('\n错误处理要点:');
  console.log('1. 对错误进行分类，便于针对性处理');
  console.log('2. 使用重试机制处理临时性错误');
  console.log('3. 熔断器防止级联故障');
  console.log('4. 错误边界隔离故障影响范围');
  console.log('5. 完善的日志记录便于问题排查');
}

// ============================================================================
// 导出
// ============================================================================
