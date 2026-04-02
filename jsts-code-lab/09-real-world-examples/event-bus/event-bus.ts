/**
 * @fileoverview 企业级事件总线系统
 * 
 * 本模块提供了一个完整的事件驱动架构解决方案，包括：
 * - 发布订阅模式的事件总线
 * - 中间件支持（日志、验证、转换等）
 * - 事件历史记录与回放
 * - 命令总线和查询总线（CQRS 模式）
 * 
 * @example
 * ```typescript
 * const eventBus = new EventBus();
 * 
 * // 订阅事件
 * eventBus.subscribe('user:created', (event) => {
 *   console.log('User created:', event.payload);
 * });
 * 
 * // 发布事件
 * eventBus.publish('user:created', { userId: '123', name: 'John' });
 * ```
 * 
 * @module event-bus
 * @version 1.0.0
 */

import * as crypto from 'crypto';

// ============================================================================
// 基础类型定义
// ============================================================================

/**
 * 事件类型
 */
export type EventType = string | symbol;

/**
 * 事件优先级
 */
export type EventPriority = 'low' | 'normal' | 'high' | 'critical';

/**
 * 基础事件接口
 */
export interface BaseEvent<TPayload = unknown> {
  id: string;
  type: EventType;
  payload: TPayload;
  timestamp: Date;
  source?: string;
  correlationId?: string;
  causationId?: string;
  priority: EventPriority;
  metadata: Record<string, unknown>;
}

/**
 * 事件处理器
 */
export type EventHandler<TPayload = unknown> = (
  event: BaseEvent<TPayload>
) => void | Promise<void>;

/**
 * 中间件上下文
 */
export interface MiddlewareContext<TPayload = unknown> {
  event: BaseEvent<TPayload>;
  next: () => Promise<void>;
  abort: (reason?: string) => void;
  isAborted: boolean;
  abortReason?: string;
}

/**
 * 中间件函数
 */
export type Middleware<TPayload = unknown> = (
  context: MiddlewareContext<TPayload>
) => void | Promise<void>;

/**
 * 订阅选项
 */
export interface SubscribeOptions {
  priority?: EventPriority;
  once?: boolean;
  filter?: (event: BaseEvent) => boolean;
}

/**
 * 订阅记录
 */
export interface Subscription {
  id: string;
  type: EventType;
  handler: EventHandler;
  options: SubscribeOptions;
  createdAt: Date;
}

/**
 * 事件存储记录
 */
export interface EventRecord {
  event: BaseEvent;
  handlers: string[];
  processedAt?: Date;
  error?: string;
}

/**
 * 事件总线配置
 */
export interface EventBusConfig {
  enableHistory?: boolean;
  maxHistorySize?: number;
  enableAsyncDispatch?: boolean;
  defaultPriority?: EventPriority;
  enableLogging?: boolean;
}

// ============================================================================
// 优先级映射
// ============================================================================

const PRIORITY_ORDER: Record<EventPriority, number> = {
  critical: 4,
  high: 3,
  normal: 2,
  low: 1,
};

// ============================================================================
// 事件总线类
// ============================================================================

/**
 * 事件总线 - 发布订阅模式实现
 */
export class EventBus {
  private subscribers: Map<EventType, Subscription[]> = new Map();
  private middlewares: Middleware[] = [];
  private history: EventRecord[] = [];
  private config: Required<EventBusConfig>;
  private replayMode = false;

  constructor(config: EventBusConfig = {}) {
    this.config = {
      enableHistory: true,
      maxHistorySize: 1000,
      enableAsyncDispatch: true,
      defaultPriority: 'normal',
      enableLogging: false,
      ...config,
    };
  }

  /**
   * 订阅事件
   */
  subscribe<TPayload = unknown>(
    type: EventType,
    handler: EventHandler<TPayload>,
    options: SubscribeOptions = {}
  ): () => void {
    const subscription: Subscription = {
      id: crypto.randomUUID(),
      type,
      handler: handler as EventHandler,
      options: {
        priority: this.config.defaultPriority,
        ...options,
      },
      createdAt: new Date(),
    };

    const subs = this.subscribers.get(type) ?? [];
    subs.push(subscription);
    
    // 按优先级排序
    subs.sort((a, b) => 
      PRIORITY_ORDER[b.options.priority!] - PRIORITY_ORDER[a.options.priority!]
    );
    
    this.subscribers.set(type, subs);

    this.log('subscribed', { type, subscriptionId: subscription.id });

    // 返回取消订阅函数
    return () => this.unsubscribe(type, subscription.id);
  }

  /**
   * 订阅一次性事件
   */
  once<TPayload = unknown>(
    type: EventType,
    handler: EventHandler<TPayload>,
    options: Omit<SubscribeOptions, 'once'> = {}
  ): () => void {
    return this.subscribe(type, handler, { ...options, once: true });
  }

  /**
   * 取消订阅
   */
  unsubscribe(type: EventType, subscriptionId: string): boolean {
    const subs = this.subscribers.get(type);
    if (!subs) return false;

    const index = subs.findIndex((s) => s.id === subscriptionId);
    if (index === -1) return false;

    subs.splice(index, 1);
    this.log('unsubscribed', { type, subscriptionId });
    return true;
  }

  /**
   * 取消某个类型的所有订阅
   */
  unsubscribeAll(type: EventType): number {
    const subs = this.subscribers.get(type);
    if (!subs) return 0;

    const count = subs.length;
    this.subscribers.delete(type);
    this.log('unsubscribedAll', { type, count });
    return count;
  }

  /**
   * 发布事件
   */
  async publish<TPayload = unknown>(
    type: EventType,
    payload: TPayload,
    options: {
      priority?: EventPriority;
      source?: string;
      correlationId?: string;
      causationId?: string;
      metadata?: Record<string, unknown>;
    } = {}
  ): Promise<BaseEvent<TPayload>> {
    const event: BaseEvent<TPayload> = {
      id: crypto.randomUUID(),
      type,
      payload,
      timestamp: new Date(),
      source: options.source ?? 'event-bus',
      correlationId: options.correlationId ?? crypto.randomUUID(),
      causationId: options.causationId,
      priority: options.priority ?? this.config.defaultPriority,
      metadata: options.metadata ?? {},
    };

    this.log('publishing', { type, eventId: event.id });

    if (this.config.enableAsyncDispatch) {
      // 异步分发
      setImmediate(() => this.dispatchEvent(event));
    } else {
      // 同步分发
      await this.dispatchEvent(event);
    }

    return event;
  }

  /**
   * 分发事件
   */
  private async dispatchEvent<TPayload>(event: BaseEvent<TPayload>): Promise<void> {
    const subs = this.subscribers.get(event.type) ?? [];
    const matchingSubs = subs.filter(
      (sub) => !sub.options.filter || sub.options.filter(event as BaseEvent)
    );

    const handlerIds: string[] = [];

    // 执行中间件链
    const middlewareContext: MiddlewareContext<TPayload> = {
      event: event as BaseEvent<TPayload>,
      next: async () => {
        // 执行所有匹配的处理器
        for (const sub of matchingSubs) {
          try {
            await sub.handler(event as BaseEvent<TPayload>);
            handlerIds.push(sub.id);

            // 一次性订阅，执行后移除
            if (sub.options.once) {
              this.unsubscribe(event.type, sub.id);
            }
          } catch (error) {
            this.log('handlerError', {
              type: event.type,
              eventId: event.id,
              subscriptionId: sub.id,
              error: error instanceof Error ? error.message : String(error),
            });
          }
        }
      },
      abort: (reason) => {
        middlewareContext.isAborted = true;
        middlewareContext.abortReason = reason;
      },
      isAborted: false,
    };

    // 运行中间件链
    await this.runMiddlewares(middlewareContext);

    // 记录历史
    if (this.config.enableHistory && !this.replayMode) {
      this.addToHistory({
        event: event as BaseEvent,
        handlers: handlerIds,
        processedAt: new Date(),
      });
    }

    this.log('published', { type: event.type, eventId: event.id, handlerCount: handlerIds.length });
  }

  /**
   * 运行中间件链
   */
  private async runMiddlewares<TPayload>(
    context: MiddlewareContext<TPayload>
  ): Promise<void> {
    let index = 0;

    const runNext = async (): Promise<void> => {
      if (context.isAborted) return;

      const middleware = this.middlewares[index++];
      if (middleware) {
        await middleware(context as MiddlewareContext);
        await runNext();
      }
    };

    await runNext();

    if (!context.isAborted) {
      await context.next();
    }
  }

  /**
   * 使用中间件
   */
  use(middleware: Middleware): this {
    this.middlewares.push(middleware);
    return this;
  }

  /**
   * 移除中间件
   */
  removeMiddleware(middleware: Middleware): boolean {
    const index = this.middlewares.indexOf(middleware);
    if (index === -1) return false;
    this.middlewares.splice(index, 1);
    return true;
  }

  /**
   * 清除所有中间件
   */
  clearMiddlewares(): void {
    this.middlewares = [];
  }

  /**
   * 等待特定事件
   */
  waitFor<TPayload = unknown>(
    type: EventType,
    timeoutMs = 5000,
    filter?: (event: BaseEvent<TPayload>) => boolean
  ): Promise<BaseEvent<TPayload>> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        unsubscribe();
        reject(new Error(`Timeout waiting for event: ${String(type)}`));
      }, timeoutMs);

      const handler = (event: BaseEvent<TPayload>): void => {
        if (!filter || filter(event)) {
          clearTimeout(timeout);
          unsubscribe();
          resolve(event);
        }
      };

      const unsubscribe = this.subscribe(type, handler);
    });
  }

  /**
   * 获取所有订阅
   */
  getSubscriptions(): Map<EventType, Subscription[]> {
    return new Map(this.subscribers);
  }

  /**
   * 获取事件历史
   */
  getHistory(): EventRecord[] {
    return [...this.history];
  }

  /**
   * 清除历史
   */
  clearHistory(): void {
    this.history = [];
  }

  /**
   * 回放事件
   */
  async replay(
    filter?: (record: EventRecord) => boolean,
    transform?: (record: EventRecord) => BaseEvent | null
  ): Promise<number> {
    this.replayMode = true;
    let count = 0;

    try {
      for (const record of this.history) {
        if (filter && !filter(record)) continue;

        const event = transform ? transform(record) : record.event;
        if (!event) continue;

        await this.dispatchEvent(event);
        count++;
      }
    } finally {
      this.replayMode = false;
    }

    return count;
  }

  /**
   * 获取统计信息
   */
  getStats(): {
    subscriberCount: number;
    subscriptionCount: number;
    historySize: number;
    middlewareCount: number;
  } {
    return {
      subscriberCount: this.subscribers.size,
      subscriptionCount: Array.from(this.subscribers.values()).reduce(
        (sum, subs) => sum + subs.length,
        0
      ),
      historySize: this.history.length,
      middlewareCount: this.middlewares.length,
    };
  }

  private addToHistory(record: EventRecord): void {
    this.history.push(record);
    if (this.history.length > this.config.maxHistorySize) {
      this.history.shift();
    }
  }

  private log(action: string, data: Record<string, unknown>): void {
    if (this.config.enableLogging) {
      console.log(`[EventBus] ${action}:`, data);
    }
  }
}

// ============================================================================
// 命令总线（CQRS - Command）
// ============================================================================

/**
 * 命令接口
 */
export interface Command<TPayload = unknown> {
  id: string;
  type: string;
  payload: TPayload;
  timestamp: Date;
  metadata: Record<string, unknown>;
}

/**
 * 命令处理器
 */
export type CommandHandler<TPayload = unknown, TResult = unknown> = (
  command: Command<TPayload>
) => Promise<TResult>;

/**
 * 命令总线 - 处理写操作
 */
export class CommandBus {
  private handlers: Map<string, CommandHandler> = new Map();
  private middlewares: Array<(command: Command, next: () => Promise<unknown>) => Promise<unknown>> = [];
  private eventBus: EventBus;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
  }

  /**
   * 注册命令处理器
   */
  register<TPayload = unknown, TResult = unknown>(
    type: string,
    handler: CommandHandler<TPayload, TResult>
  ): () => void {
    this.handlers.set(type, handler as CommandHandler);
    
    return () => {
      this.handlers.delete(type);
    };
  }

  /**
   * 执行命令
   */
  async execute<TPayload = unknown, TResult = unknown>(
    type: string,
    payload: TPayload,
    metadata: Record<string, unknown> = {}
  ): Promise<TResult> {
    const command: Command<TPayload> = {
      id: crypto.randomUUID(),
      type,
      payload,
      timestamp: new Date(),
      metadata,
    };

    console.log(`[CommandBus] Executing: ${type}`);

    const handler = this.handlers.get(type);
    if (!handler) {
      throw new Error(`No handler registered for command: ${type}`);
    }

    let index = 0;
    const runMiddleware = async (): Promise<TResult> => {
      const middleware = this.middlewares[index++];
      if (middleware) {
        return middleware(command, runMiddleware) as Promise<TResult>;
      }
      return handler(command as Command) as Promise<TResult>;
    };

    return runMiddleware();
  }

  /**
   * 使用中间件
   */
  use(middleware: (command: Command, next: () => Promise<unknown>) => Promise<unknown>): this {
    this.middlewares.push(middleware);
    return this;
  }

  /**
   * 获取已注册的命令类型
   */
  getRegisteredCommands(): string[] {
    return Array.from(this.handlers.keys());
  }
}

// ============================================================================
// 查询总线（CQRS - Query）
// ============================================================================

/**
 * 查询接口
 */
export interface Query<TPayload = unknown> {
  id: string;
  type: string;
  payload: TPayload;
  timestamp: Date;
  metadata: Record<string, unknown>;
}

/**
 * 查询处理器
 */
export type QueryHandler<TPayload = unknown, TResult = unknown> = (
  query: Query<TPayload>
) => Promise<TResult>;

/**
 * 查询总线 - 处理读操作
 */
export class QueryBus {
  private handlers: Map<string, QueryHandler> = new Map();
  private cache: Map<string, { result: unknown; expiresAt: Date }> = new Map();

  /**
   * 注册查询处理器
   */
  register<TPayload = unknown, TResult = unknown>(
    type: string,
    handler: QueryHandler<TPayload, TResult>
  ): () => void {
    this.handlers.set(type, handler as QueryHandler);
    
    return () => {
      this.handlers.delete(type);
    };
  }

  /**
   * 执行查询
   */
  async query<TPayload = unknown, TResult = unknown>(
    type: string,
    payload: TPayload,
    options: {
      cacheKey?: string;
      cacheTtlMs?: number;
      metadata?: Record<string, unknown>;
    } = {}
  ): Promise<TResult> {
    const cacheKey = options.cacheKey;
    
    // 检查缓存
    if (cacheKey) {
      const cached = this.cache.get(cacheKey);
      if (cached && cached.expiresAt > new Date()) {
        console.log(`[QueryBus] Cache hit: ${type}`);
        return cached.result as TResult;
      }
    }

    const q: Query<TPayload> = {
      id: crypto.randomUUID(),
      type,
      payload,
      timestamp: new Date(),
      metadata: options.metadata ?? {},
    };

    console.log(`[QueryBus] Querying: ${type}`);

    const handler = this.handlers.get(type);
    if (!handler) {
      throw new Error(`No handler registered for query: ${type}`);
    }

    const result = await handler(q);

    // 写入缓存
    if (cacheKey && options.cacheTtlMs) {
      this.cache.set(cacheKey, {
        result,
        expiresAt: new Date(Date.now() + options.cacheTtlMs),
      });
    }

    return result as TResult;
  }

  /**
   * 清除缓存
   */
  clearCache(pattern?: string): void {
    if (pattern) {
      const regex = new RegExp(pattern);
      for (const key of this.cache.keys()) {
        if (regex.test(key)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  /**
   * 获取已注册的查询类型
   */
  getRegisteredQueries(): string[] {
    return Array.from(this.handlers.keys());
  }
}

// ============================================================================
// 内置中间件
// ============================================================================

/**
 * 日志中间件
 */
export function createLoggingMiddleware<TPayload>(): Middleware<TPayload> {
  return async (context) => {
    const { event, next } = context;
    console.log(`[Middleware] Processing event: ${String(event.type)} (${event.id})`);
    const startTime = Date.now();
    
    await next();
    
    console.log(`[Middleware] Event processed: ${String(event.type)} (${Date.now() - startTime}ms)`);
  };
}

/**
 * 验证中间件
 */
export function createValidationMiddleware<TPayload>(
  validator: (payload: TPayload) => boolean | string
): Middleware<TPayload> {
  return async (context) => {
    const { event, next, abort } = context;
    const result = validator(event.payload as TPayload);
    
    if (result !== true) {
      abort(typeof result === 'string' ? result : 'Validation failed');
      console.log(`[Middleware] Validation failed: ${String(event.type)}`);
      return;
    }
    
    await next();
  };
}

/**
 * 性能监控中间件
 */
export function createPerformanceMiddleware<TPayload>(
  thresholdMs = 100
): Middleware<TPayload> {
  return async (context) => {
    const { event, next } = context;
    const startTime = Date.now();
    
    await next();
    
    const duration = Date.now() - startTime;
    if (duration > thresholdMs) {
      console.warn(`[Performance] Slow event handler: ${String(event.type)} (${duration}ms)`);
    }
  };
}

/**
 * 错误恢复中间件
 */
export function createErrorRecoveryMiddleware<TPayload>(
  maxRetries = 3
): Middleware<TPayload> {
  return async (context) => {
    const { next, abort } = context;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        await next();
        return;
      } catch (error) {
        console.error(`[Middleware] Retry ${i + 1}/${maxRetries} failed:`, error);
        if (i === maxRetries - 1) {
          abort('Max retries exceeded');
        }
      }
    }
  };
}

// ============================================================================
// Demo 函数
// ============================================================================

/**
 * 演示事件总线系统的使用
 */
export function demo(): void {
  console.log('='.repeat(60));
  console.log('📡 Event Bus Demo');
  console.log('='.repeat(60));

  // 创建事件总线
  const eventBus = new EventBus({
    enableHistory: true,
    maxHistorySize: 100,
    enableLogging: true,
    enableAsyncDispatch: false, // 同步模式便于演示
  });

  // 创建 CQRS 总线
  const commandBus = new CommandBus(eventBus);
  const queryBus = new QueryBus();

  // ==========================================================================
  // 1. 基本发布订阅
  // ==========================================================================
  console.log('\n📨 Basic Pub/Sub');
  console.log('-'.repeat(40));

  // 订阅事件
  const unsubscribe1 = eventBus.subscribe('user:created', (event) => {
    console.log(`  📧 Email sent to: ${(event.payload as { email: string }).email}`);
  });

  eventBus.subscribe('user:created', (event) => {
    console.log(`  📊 Analytics tracked: user signup`);
  });

  // 发布事件
  console.log('Publishing user:created...');
  eventBus.publish('user:created', { 
    userId: 'u001', 
    email: 'alice@example.com',
    name: 'Alice' 
  });

  // ==========================================================================
  // 2. 优先级处理
  // ==========================================================================
  console.log('\n⚡ Priority Handling');
  console.log('-'.repeat(40));

  const order: string[] = [];

  eventBus.subscribe('priority:test', () => { order.push('low'); }, { priority: 'low' });
  eventBus.subscribe('priority:test', () => { order.push('normal'); }, { priority: 'normal' });
  eventBus.subscribe('priority:test', () => { order.push('high'); }, { priority: 'high' });
  eventBus.subscribe('priority:test', () => { order.push('critical'); }, { priority: 'critical' });

  eventBus.publish('priority:test', {});
  console.log('  Processing order:', order.join(' -> '));

  // ==========================================================================
  // 3. 一次性订阅
  // ==========================================================================
  console.log('\n🔔 One-time Subscription');
  console.log('-'.repeat(40));

  let onceCount = 0;
  eventBus.once('notify:once', () => {
    onceCount++;
    console.log(`  Notification received (count: ${onceCount})`);
  });

  console.log('Publishing notify:once (1st time)...');
  eventBus.publish('notify:once', { message: 'Hello!' });
  
  console.log('Publishing notify:once (2nd time)...');
  eventBus.publish('notify:once', { message: 'Again!' });
  
  console.log(`  Total notifications: ${onceCount} (should be 1)`);

  // ==========================================================================
  // 4. 事件过滤
  // ==========================================================================
  console.log('\n🔍 Event Filtering');
  console.log('-'.repeat(40));

  eventBus.subscribe(
    'order:updated',
    (event) => {
      console.log(`  🔔 High value order: $${(event.payload as { amount: number }).amount}`);
    },
    {
      filter: (event) => (event.payload as { amount: number }).amount > 1000,
    }
  );

  console.log('Publishing order ($500)...');
  eventBus.publish('order:updated', { orderId: 'o001', amount: 500 });
  
  console.log('Publishing order ($5000)...');
  eventBus.publish('order:updated', { orderId: 'o002', amount: 5000 });

  // ==========================================================================
  // 5. 中间件
  // ==========================================================================
  console.log('\n🛡️ Middleware');
  console.log('-'.repeat(40));

  // 添加验证中间件
  eventBus.use(createValidationMiddleware((payload) => {
    if (typeof payload !== 'object' || payload === null) return 'Invalid payload';
    if (!('userId' in payload)) return 'userId is required';
    return true;
  }));

  // 添加性能监控中间件
  eventBus.use(createPerformanceMiddleware(50));

  eventBus.subscribe('validated:event', (event) => {
    console.log(`  ✅ Valid event processed:`, event.payload);
  });

  console.log('Publishing valid event...');
  eventBus.publish('validated:event', { userId: 'u123', action: 'login' });

  console.log('Publishing invalid event (should be rejected)...');
  // 清理中间件以便继续演示
  eventBus.clearMiddlewares();
  eventBus.publish('validated:event', { action: 'login' } as unknown as { userId: string });

  // ==========================================================================
  // 6. 等待特定事件
  // ==========================================================================
  console.log('\n⏳ Wait For Event');
  console.log('-'.repeat(40));

  // 异步等待事件
  const waitPromise = eventBus.waitFor('async:response', 1000, (event) => {
    return (event.payload as { requestId: string }).requestId === 'req-001';
  });

  // 模拟异步响应
  setTimeout(() => {
    eventBus.publish('async:response', { requestId: 'req-001', data: 'Response data' });
  }, 100);

  waitPromise.then((event) => {
    console.log(`  ✅ Received awaited event:`, event.payload);
  });

  // ==========================================================================
  // 7. 历史记录与回放
  // ==========================================================================
  console.log('\n📼 Event History & Replay');
  console.log('-'.repeat(40));

  // 发布一些事件
  eventBus.publish('data:created', { id: 1, name: 'Item 1' });
  eventBus.publish('data:created', { id: 2, name: 'Item 2' });
  eventBus.publish('data:updated', { id: 1, name: 'Item 1 Updated' });

  console.log('  Events in history:', eventBus.getHistory().length);

  // 订阅回放处理器
  const replayedEvents: string[] = [];
  eventBus.subscribe('data:created', (event) => {
    replayedEvents.push(`created-${(event.payload as { id: number }).id}`);
  });
  eventBus.subscribe('data:updated', (event) => {
    replayedEvents.push(`updated-${(event.payload as { id: number }).id}`);
  });

  // 回放事件
  console.log('Replaying only data:created events...');
  eventBus.replay(
    (record) => record.event.type === 'data:created'
  ).then((count) => {
    console.log(`  Replayed ${count} events:`, replayedEvents.join(', '));
  });

  // ==========================================================================
  // 8. 命令总线 (CQRS)
  // ==========================================================================
  console.log('\n⚙️ Command Bus (CQRS)');
  console.log('-'.repeat(40));

  // 模拟数据存储
  const users: Array<{ id: string; name: string; email: string }> = [];

  // 注册命令处理器
  commandBus.register('createUser', async (command) => {
    const { name, email } = command.payload as { name: string; email: string };
    const user = { id: crypto.randomUUID(), name, email };
    users.push(user);
    
    // 发布领域事件
    await eventBus.publish('user:created', user);
    
    return { success: true, userId: user.id };
  });

  commandBus.register('deleteUser', async (command) => {
    const { userId } = command.payload as { userId: string };
    const index = users.findIndex((u) => u.id === userId);
    if (index > -1) {
      users.splice(index, 1);
      await eventBus.publish('user:deleted', { userId });
      return { success: true };
    }
    return { success: false, error: 'User not found' };
  });

  // 执行命令
  commandBus.execute('createUser', { name: 'John Doe', email: 'john@example.com' })
    .then((result) => {
      console.log('  Create user result:', result);
    });

  // ==========================================================================
  // 9. 查询总线 (CQRS)
  // ==========================================================================
  console.log('\n🔎 Query Bus (CQRS)');
  console.log('-'.repeat(40));

  // 注册查询处理器
  queryBus.register('getUserById', async (query) => {
    const { userId } = query.payload as { userId: string };
    const user = users.find((u) => u.id === userId);
    return user ?? null;
  });

  queryBus.register('listUsers', async () => {
    return [...users];
  });

  // 执行查询
  setTimeout(() => {
    queryBus.query('listUsers', {}).then((result) => {
      console.log('  All users:', result);
    });

    // 带缓存的查询
    queryBus.query('listUsers', {}, { cacheKey: 'users:all', cacheTtlMs: 5000 })
      .then(() => queryBus.query('listUsers', {}, { cacheKey: 'users:all', cacheTtlMs: 5000 }))
      .then((result) => {
        console.log('  Cached query result:', result);
      });
  }, 100);

  // ==========================================================================
  // 10. 统计信息
  // ==========================================================================
  console.log('\n📊 Statistics');
  console.log('-'.repeat(40));

  setTimeout(() => {
    console.log('  EventBus stats:', eventBus.getStats());
    console.log('  Registered commands:', commandBus.getRegisteredCommands());
    console.log('  Registered queries:', queryBus.getRegisteredQueries());
  }, 200);

  console.log('\n' + '='.repeat(60));
  console.log('✨ Demo completed!');
  console.log('='.repeat(60));
}



// 如果是直接运行此文件，执行 demo
if (require.main === module) {
  demo();
}
