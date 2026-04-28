/**
 * @file 故障注入实现
 * @category Chaos Engineering → Fault Injection
 * @difficulty hard
 * @tags chaos-engineering, fault-injection, resilience-testing, failure-simulation
 *
 * @description
 * 故障注入是混沌工程的核心技术，用于验证系统在各种故障条件下的行为。
 *
 * 故障类型：
 * - 延迟注入: 增加网络延迟、处理延迟
 * - 错误注入: 模拟各种错误响应、异常抛出
 * - 资源耗尽: CPU、内存、磁盘、文件描述符耗尽
 * - 网络故障: 丢包、乱序、分区、DNS故障
 * - 进程故障: 进程崩溃、暂停、重启
 * - 时钟偏移: 系统时间跳跃、NTP故障
 *
 * 注入策略：
 * - 随机注入: 按概率随机触发
 * - 条件注入: 满足特定条件时触发
 * - 时间窗口: 在指定时间段内生效
 * - 请求匹配: 匹配特定请求特征
 */

export enum FaultType {
  LATENCY = 'latency',
  ERROR = 'error',
  EXCEPTION = 'exception',
  CPU = 'cpu',
  MEMORY = 'memory',
  DISK = 'disk',
  NETWORK = 'network',
  DNS = 'dns',
  TIME = 'time',
  KILL = 'kill'
}

export interface FaultConfig {
  type: FaultType;
  probability: number; // 0-1
  duration?: number; // 毫秒
  target?: string | RegExp;
  headers?: Record<string, string>;
  matchers?: { field: string; value: string | RegExp }[];
}

export interface InjectionContext {
  requestId: string;
  timestamp: number;
  target: string;
  headers?: Record<string, string>;
  payload?: unknown;
}

export interface FaultResult {
  injected: boolean;
  type?: FaultType;
  config?: FaultConfig;
  error?: Error;
}

// ==================== 基础故障注入器 ====================

export abstract class FaultInjector {
  protected active = false;
  protected startTime?: number;

  constructor(protected config: FaultConfig) {}

  /**
   * 检查是否应该注入故障
   */
  shouldInject(context: InjectionContext): boolean {
    // 检查概率
    if (Math.random() > this.config.probability) {
      return false;
    }

    // 检查目标匹配
    if (this.config.target) {
      const targetMatch = this.config.target instanceof RegExp
        ? this.config.target.test(context.target)
        : context.target.includes(this.config.target);
      
      if (!targetMatch) return false;
    }

    // 检查头部匹配
    if (this.config.headers && context.headers) {
      for (const [key, value] of Object.entries(this.config.headers)) {
        if (context.headers[key] !== value) return false;
      }
    }

    // 检查通用匹配器
    if (this.config.matchers) {
      for (const matcher of this.config.matchers) {
        const fieldValue = this.getFieldValue(context, matcher.field);
        if (fieldValue === undefined) return false;

        const matches = matcher.value instanceof RegExp
          ? matcher.value.test(String(fieldValue))
          : String(fieldValue) === matcher.value;

        if (!matches) return false;
      }
    }

    return true;
  }

  abstract inject(context: InjectionContext): Promise<FaultResult>;
  abstract restore(): void;

  protected getFieldValue(context: InjectionContext, field: string): unknown {
    const parts = field.split('.');
    let value: unknown = context;

    for (const part of parts) {
      if (value && typeof value === 'object') {
        value = (value as Record<string, unknown>)[part];
      } else {
        return undefined;
      }
    }

    return value;
  }
}

// ==================== 延迟注入器 ====================

export interface LatencyConfig extends FaultConfig {
  type: FaultType.LATENCY;
  delay: number; // 基础延迟（毫秒）
  jitter?: number; // 抖动范围（毫秒）
  correlation?: number; // 延迟相关性 0-1
}

export class LatencyInjector extends FaultInjector {
  private previousDelay = 0;

  constructor(config: LatencyConfig) {
    super(config);
  }

  async inject(context: InjectionContext): Promise<FaultResult> {
    const config = this.config as LatencyConfig;
    
    // 计算延迟（包含抖动和相关性）
    const jitter = config.jitter ? (Math.random() * 2 - 1) * config.jitter : 0;
    const correlationDelay = config.correlation ? this.previousDelay * config.correlation : 0;
    const baseDelay = config.delay * (1 - (config.correlation || 0));
    
    const delay = baseDelay + correlationDelay + jitter;
    this.previousDelay = delay;

    await this.sleep(delay);

    return {
      injected: true,
      type: FaultType.LATENCY,
      config: this.config
    };
  }

  restore(): void {
    // 延迟注入不需要恢复
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ==================== 错误注入器 ====================

export interface ErrorConfig extends FaultConfig {
  type: FaultType.ERROR;
  statusCode: number;
  message?: string;
  body?: unknown;
}

export class ErrorInjector extends FaultInjector {
  constructor(config: ErrorConfig) {
    super(config);
  }

  async inject(context: InjectionContext): Promise<FaultResult> {
    const config = this.config as ErrorConfig;

    const error = new Error(config.message || `Injected ${config.statusCode} error`);
    (error as Error & { statusCode: number }).statusCode = config.statusCode;

    return {
      injected: true,
      type: FaultType.ERROR,
      config: this.config,
      error
    };
  }

  restore(): void {
    // 错误注入不需要恢复
  }
}

// ==================== 异常注入器 ====================

export interface ExceptionConfig extends FaultConfig {
  type: FaultType.EXCEPTION;
  exceptionType: 'timeout' | 'connection_refused' | 'dns_failure' | 'network_unreachable' | 'custom';
  message?: string;
}

export class ExceptionInjector extends FaultInjector {
  constructor(config: ExceptionConfig) {
    super(config);
  }

  async inject(context: InjectionContext): Promise<FaultResult> {
    const config = this.config as ExceptionConfig;
    let error: Error;

    switch (config.exceptionType) {
      case 'timeout':
        error = new Error(config.message || 'ETIMEDOUT: Connection timed out');
        (error as NodeJS.ErrnoException).code = 'ETIMEDOUT';
        break;
      case 'connection_refused':
        error = new Error(config.message || 'ECONNREFUSED: Connection refused');
        (error as NodeJS.ErrnoException).code = 'ECONNREFUSED';
        break;
      case 'dns_failure':
        error = new Error(config.message || 'ENOTFOUND: DNS lookup failed');
        (error as NodeJS.ErrnoException).code = 'ENOTFOUND';
        break;
      case 'network_unreachable':
        error = new Error(config.message || 'ENETUNREACH: Network is unreachable');
        (error as NodeJS.ErrnoException).code = 'ENETUNREACH';
        break;
      default:
        error = new Error(config.message || 'Injected exception');
    }

    return {
      injected: true,
      type: FaultType.EXCEPTION,
      config: this.config,
      error
    };
  }

  restore(): void {
    // 异常注入不需要恢复
  }
}

// ==================== CPU 压力注入器 ====================

export interface CPUConfig extends FaultConfig {
  type: FaultType.CPU;
  load: number; // 0-1
  cores?: number; // 使用的核心数
}

export class CPUInjector extends FaultInjector {
  private workers: { interval: ReturnType<typeof setInterval> }[] = [];

  constructor(config: CPUConfig) {
    super(config);
  }

  async inject(context: InjectionContext): Promise<FaultResult> {
    const config = this.config as CPUConfig;
    const load = Math.max(0, Math.min(1, config.load));

    // 创建 CPU 负载
    const workerCount = config.cores || 1;
    
    for (let i = 0; i < workerCount; i++) {
      const interval = setInterval(() => {
        const start = performance.now();
        const duration = 100 * load; // 每100ms周期中负载的时间
        
        while (performance.now() - start < duration) {
          // Busy loop
          Math.random() * Math.random();
        }
      }, 100);

      this.workers.push({ interval });
    }

    // 设置自动停止
    if (config.duration) {
      setTimeout(() => { this.restore(); }, config.duration);
    }

    return {
      injected: true,
      type: FaultType.CPU,
      config: this.config
    };
  }

  restore(): void {
    for (const worker of this.workers) {
      clearInterval(worker.interval);
    }
    this.workers = [];
  }
}

// ==================== 内存压力注入器 ====================

export interface MemoryConfig extends FaultConfig {
  type: FaultType.MEMORY;
  size: number; // 字节
  leak?: boolean; // 是否模拟内存泄漏（不释放）
}

export class MemoryInjector extends FaultInjector {
  private allocations: number[][] = [];

  constructor(config: MemoryConfig) {
    super(config);
  }

  async inject(context: InjectionContext): Promise<FaultResult> {
    const config = this.config as MemoryConfig;
    const arraySize = Math.floor(config.size / 8); // 每个数字约8字节

    const allocation = new Array(arraySize).fill(0).map(() => Math.random());
    this.allocations.push(allocation);

    // 如果配置为不泄漏，定时释放
    if (!config.leak && config.duration) {
      setTimeout(() => {
        const index = this.allocations.indexOf(allocation);
        if (index > -1) {
          this.allocations.splice(index, 1);
        }
      }, config.duration);
    }

    return {
      injected: true,
      type: FaultType.MEMORY,
      config: this.config
    };
  }

  restore(): void {
    this.allocations = [];
  }
}

// ==================== 故障注入管理器 ====================

export class FaultInjectionManager {
  private injectors: FaultInjector[] = [];
  private history: {
    timestamp: number;
    context: InjectionContext;
    result: FaultResult;
  }[] = [];

  register(injector: FaultInjector): void {
    this.injectors.push(injector);
  }

  unregister(injector: FaultInjector): void {
    const index = this.injectors.indexOf(injector);
    if (index > -1) {
      injector.restore();
      this.injectors.splice(index, 1);
    }
  }

  /**
   * 对请求注入故障
   */
  async inject(context: InjectionContext): Promise<FaultResult> {
    // 查找适用的注入器
    const applicableInjectors = this.injectors.filter(i => i.shouldInject(context));

    if (applicableInjectors.length === 0) {
      return { injected: false };
    }

    // 随机选择一个注入器
    const injector = applicableInjectors[Math.floor(Math.random() * applicableInjectors.length)];
    const result = await injector.inject(context);

    // 记录历史
    this.history.push({
      timestamp: Date.now(),
      context,
      result
    });

    return result;
  }

  /**
   * 包装函数以注入故障
   */
  wrap<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    contextProvider: (...args: Parameters<T>) => Partial<InjectionContext>
  ): (...args: Parameters<T>) => Promise<ReturnType<T>> {
    return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
      const partialContext = contextProvider(...args);
      const context: InjectionContext = {
        requestId: this.generateId(),
        timestamp: Date.now(),
        target: fn.name,
        ...partialContext
      };

      const result = await this.inject(context);

      if (result.injected && result.error) {
        throw result.error;
      }

      return fn(...args);
    };
  }

  /**
   * 清空所有注入器
   */
  clear(): void {
    for (const injector of this.injectors) {
      injector.restore();
    }
    this.injectors = [];
  }

  getHistory(): typeof this.history {
    return [...this.history];
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}

// ==================== 演示 ====================

export function demo(): void {
  console.log('=== 故障注入 ===\n');

  const manager = new FaultInjectionManager();

  // 注册延迟注入
  console.log('--- 延迟注入 ---');
  const latencyInjector = new LatencyInjector({
    type: FaultType.LATENCY,
    probability: 0.5,
    delay: 100,
    jitter: 50
  });
  manager.register(latencyInjector);

  // 模拟请求
  for (let i = 0; i < 5; i++) {
    const context: InjectionContext = {
      requestId: `req-${i}`,
      timestamp: Date.now(),
      target: '/api/users'
    };

    const start = Date.now();
    manager.inject(context).then(result => {
      const elapsed = Date.now() - start;
      console.log(`Request ${i}: injected=${result.injected}, elapsed=${elapsed}ms`);
    });
  }

  // 错误注入
  console.log('\n--- 错误注入 ---');
  const errorInjector = new ErrorInjector({
    type: FaultType.ERROR,
    probability: 1,
    statusCode: 503,
    message: 'Service temporarily unavailable'
  });
  manager.register(errorInjector);

  const errorContext: InjectionContext = {
    requestId: 'error-test',
    timestamp: Date.now(),
    target: '/api/payment'
  };

  manager.inject(errorContext).then(result => {
    console.log('Error injection result:', {
      injected: result.injected,
      type: result.type,
      error: result.error?.message
    });
  });

  // 异常注入
  console.log('\n--- 异常注入 ---');
  const exceptionInjector = new ExceptionInjector({
    type: FaultType.EXCEPTION,
    probability: 1,
    exceptionType: 'timeout',
    message: 'Database connection timeout'
  });
  manager.register(exceptionInjector);

  const exceptionContext: InjectionContext = {
    requestId: 'exception-test',
    timestamp: Date.now(),
    target: '/api/database'
  };

  manager.inject(exceptionContext).then(result => {
    console.log('Exception injection result:', {
      injected: result.injected,
      error: result.error?.message,
      code: (result.error as NodeJS.ErrnoException)?.code
    });
  });

  // CPU 压力测试
  console.log('\n--- CPU 压力注入 ---');
  console.log('Starting CPU stress for 2 seconds...');
  const cpuInjector = new CPUInjector({
    type: FaultType.CPU,
    probability: 1,
    load: 0.3, // 30% CPU 负载
    duration: 2000
  });
  manager.register(cpuInjector);

  cpuInjector.inject({
    requestId: 'cpu-test',
    timestamp: Date.now(),
    target: 'cpu-stress'
  }).then(() => {
    setTimeout(() => {
      manager.unregister(cpuInjector);
      console.log('CPU stress stopped');
    }, 2000);
  });

  // 包装函数示例
  console.log('\n--- 包装函数注入 ---');
  async function fetchUser(userId: string): Promise<{ id: string; name: string }> {
    return { id: userId, name: 'John Doe' };
  }

  const wrappedFetch = manager.wrap(
    fetchUser,
    (userId) => ({
      payload: { userId }
    })
  );

  // 清理
  setTimeout(() => {
    manager.clear();
    console.log('\nAll injectors cleared');
  }, 3000);
}
