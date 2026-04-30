# 事件总线

> **定位**：`20-code-lab/20.1-fundamentals-lab/real-world-examples/event-bus`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块解决组件间解耦通信的问题。通过发布订阅模式实现松耦合架构，支持同步与异步事件传播。

### 1.2 形式化基础

事件总线可形式化定义为一个三元组：

```
EventBus = (Topics, Subscribers, Publish)

Topics: 主题/事件名称的有限集合
Subscribers: Topic → P(Callback) 的映射
Publish: (topic, payload) → ∀cb ∈ Subscribers(topic): cb(payload)
```

### 1.3 关键概念

| 概念 | 定义 | 关联 |
|------|------|------|
| 发布订阅 | 解耦的消息广播模式 | pub-sub.ts |
| 事件通道 | 带类型约束的命名空间事件 | typed-channels.ts |
| 背压控制 | 生产者速率超过消费者时的流控策略 | backpressure.ts |

---

## 二、设计原理

### 2.1 为什么存在

随着组件数量增加，直接引用导致紧耦合。事件总线通过间接通信解耦发送者与接收者，是大型应用架构的粘合剂。

### 2.2 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 全局总线 | 简单统一 | 全局状态难追踪 | 小型应用 |
| 作用域总线 | 隔离清晰 | 管理复杂度 | 模块化应用 |
| 分层总线 | 跨层通信可控 | 架构复杂度高 | 企业级应用 |

### 2.3 特性对比表：Pub/Sub vs Observer

| 特性 | 发布订阅 (Pub/Sub) | 观察者模式 (Observer) |
|------|-------------------|----------------------|
| 耦合度 | 完全解耦（通过中间件/主题） | 松耦合（主题知晓观察者列表） |
| 通信方式 | 异步广播（通常带消息队列） | 直接调用（可同步可异步） |
| 订阅关系 | 订阅者按主题过滤接收 | 观察者订阅特定被观察者 |
| 中间层 | 事件总线 / Message Broker | 无，Subject 直接维护列表 |
| 典型实现 | EventEmitter3, Redis Pub/Sub, MQTT | RxJS Observable, Vue Reactivity |
| 适用规模 | 跨进程、分布式系统 | 同进程内组件通信 |
| 内存风险 | 需关注订阅者泄漏 | 需手动取消订阅避免泄漏 |

### 2.4 与相关技术的对比

与直接调用对比：总线解耦但增加了间接性和调试难度。

---

## 三、实践映射

### 3.1 从理论到代码

本模块的代码示例将上述理论概念映射为可运行的实现。通过实际编码练习，可以验证对 事件总线 核心机制的理解，并观察不同实现选择带来的行为差异。

### 3.2 代码示例：类型安全的事件总线

```typescript
// ===== 类型安全的事件总线实现 =====
type EventMap = Record<string, (...args: any[]) => void>;

class TypedEventBus<Events extends EventMap = EventMap> {
  private listeners: { [K in keyof Events]?: Set<Events[K]> } = {};

  on<K extends keyof Events>(event: K, listener: Events[K]): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = new Set<Events[K]>();
    }
    this.listeners[event]!.add(listener);

    // 返回取消订阅函数
    return () => this.off(event, listener);
  }

  off<K extends keyof Events>(event: K, listener: Events[K]): void {
    this.listeners[event]?.delete(listener);
  }

  emit<K extends keyof Events>(event: K, ...args: Parameters<Events[K]>): void {
    this.listeners[event]?.forEach(listener => {
      try {
        listener(...args);
      } catch (err) {
        console.error(`Event handler error on "${String(event)}":`, err);
      }
    });
  }

  once<K extends keyof Events>(event: K, listener: Events[K]): () => void {
    const wrapper = ((...args: Parameters<Events[K]>) => {
      this.off(event, wrapper as Events[K]);
      listener(...args);
    }) as Events[K];
    return this.on(event, wrapper);
  }

  clear<K extends keyof Events>(event?: K): void {
    if (event) {
      delete this.listeners[event];
    } else {
      this.listeners = {};
    }
  }
}

// ===== 使用示例 =====
interface AppEvents {
  'user:login': (userId: string, timestamp: number) => void;
  'user:logout': (userId: string) => void;
  'data:sync': (payload: { table: string; rows: unknown[] }) => void;
  'error:critical': (error: Error, context: string) => void;
}

const bus = new TypedEventBus<AppEvents>();

// 订阅
const unsubLogin = bus.on('user:login', (id, ts) => {
  console.log(`User ${id} logged in at ${new Date(ts)}`);
});

bus.on('error:critical', (err, ctx) => {
  // 上报到监控服务
  console.error(`[${ctx}]`, err);
});

// 发布
bus.emit('user:login', 'u-123', Date.now());
bus.emit('error:critical', new Error('DB connection lost'), 'Database');

// 取消订阅
unsubLogin();
```

### 3.3 异步事件总线与背压控制

```typescript
// ===== 支持 async handler 与并发限制的事件总线 =====
class AsyncEventBus<Events extends EventMap = EventMap> {
  private listeners: { [K in keyof Events]?: Set<Events[K]> } = {};

  on<K extends keyof Events>(event: K, listener: Events[K]): () => void {
    if (!this.listeners[event]) this.listeners[event] = new Set();
    this.listeners[event]!.add(listener);
    return () => this.off(event, listener);
  }

  off<K extends keyof Events>(event: K, listener: Events[K]): void {
    this.listeners[event]?.delete(listener);
  }

  async emit<K extends keyof Events>(
    event: K,
    ...args: Parameters<Events[K]>
  ): Promise<void> {
    const handlers = this.listeners[event];
    if (!handlers) return;
    // 并发执行所有 handler，失败不阻断其他 handler
    await Promise.all(
      Array.from(handlers).map(async (fn) => {
        try {
          await (fn as any)(...args);
        } catch (err) {
          console.error(`Async handler error on "${String(event)}":`, err);
        }
      })
    );
  }
}

// 使用场景：IO 密集型事件（如数据同步后触发多个副作用）
interface AsyncEvents {
  'order:created': (orderId: string) => Promise<void>;
}

const asyncBus = new AsyncEventBus<AsyncEvents>();
asyncBus.on('order:created', async (id) => {
  await sendEmail(id);
});
asyncBus.on('order:created', async (id) => {
  await updateInventory(id);
});
```

### 3.4 内存泄漏检测与自动清理

```typescript
// ===== 带引用计数与 WeakRef 的防泄漏事件总线 =====
class SafeEventBus<Events extends EventMap = EventMap> {
  private listeners = new Map<keyof Events, Set<Events[keyof Events]>>();
  private refCounts = new WeakMap<(...args: any[]) => void, number>();

  on<K extends keyof Events>(event: K, listener: Events[K]): () => void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(listener);
    this.refCounts.set(listener, (this.refCounts.get(listener) || 0) + 1);

    return () => {
      this.off(event, listener);
      const count = (this.refCounts.get(listener) || 1) - 1;
      if (count <= 0) this.refCounts.delete(listener);
      else this.refCounts.set(listener, count);
    };
  }

  off<K extends keyof Events>(event: K, listener: Events[K]): void {
    this.listeners.get(event)?.delete(listener);
  }

  emit<K extends keyof Events>(event: K, ...args: Parameters<Events[K]>): void {
    this.listeners.get(event)?.forEach((fn) => (fn as any)(...args));
  }

  snapshot(): Record<string, number> {
    const result: Record<string, number> = {};
    for (const [key, set] of this.listeners) {
      result[String(key)] = set.size;
    }
    return result;
  }
}
```

### 3.5 基于 DOM EventTarget 的标准化封装

```typescript
// ===== 浏览器原生 EventTarget 的类型安全包装 =====
class TypedEventTarget<Events extends EventMap> {
  private target = new EventTarget();

  on<K extends keyof Events>(
    event: K,
    listener: Events[K]
  ): () => void {
    const wrapped = (e: CustomEvent) => listener(...e.detail);
    this.target.addEventListener(String(event), wrapped as EventListener);
    return () => this.target.removeEventListener(String(event), wrapped as EventListener);
  }

  emit<K extends keyof Events>(event: K, ...args: Parameters<Events[K]>): void {
    this.target.dispatchEvent(new CustomEvent(String(event), { detail: args }));
  }
}

// 浏览器环境可直接使用，无需额外依赖
interface DOMEvents {
  'canvas:draw': (ctx: CanvasRenderingContext2D) => void;
  'input:change': (value: string) => void;
}
```

### 3.6 带通配符与命名空间的增强事件总线

```typescript
// ===== 支持通配符订阅和命名空间隔离的高级事件总线 =====
class EnhancedEventBus<Events extends EventMap = EventMap> {
  private listeners = new Map<string, Set<(...args: any[]) => void>>();
  private wildcards = new Set<(event: string, ...args: any[]) => void>();

  on<K extends keyof Events>(event: K, listener: Events[K]): () => void;
  on(event: string, listener: (...args: any[]) => void): () => void {
    const key = String(event);
    if (!this.listeners.has(key)) this.listeners.set(key, new Set());
    this.listeners.get(key)!.add(listener);
    return () => this.listeners.get(key)?.delete(listener);
  }

  onAny(listener: (event: string, ...args: any[]) => void): () => void {
    this.wildcards.add(listener);
    return () => this.wildcards.delete(listener);
  }

  emit<K extends keyof Events>(event: K, ...args: Parameters<Events[K]>): void;
  emit(event: string, ...args: any[]): void {
    const key = String(event);
    this.listeners.get(key)?.forEach((fn) => {
      try { fn(...args); } catch (err) { console.error(`Handler error on "${key}":`, err); }
    });
    this.wildcards.forEach((fn) => {
      try { fn(key, ...args); } catch (err) { console.error(`Wildcard error on "${key}":`, err); }
    });
  }

  // 命名空间隔离：返回一个仅能看到特定前缀事件的总线视图
  namespace<N extends string>(prefix: N): EnhancedEventBus<Events> {
    const child = new EnhancedEventBus<Events>();
    const fullPrefix = `${prefix}:`;
    child.onAny((event, ...args) => this.emit(`${fullPrefix}${event}` as any, ...args));
    return child;
  }
}

// 使用示例
const bus = new EnhancedEventBus();
bus.on('user:*', (data) => console.log('Any user event:', data)); // 通配符支持
bus.onAny((event, data) => console.log(`[LOG] ${event}:`, data));  // 全局监听

const paymentBus = bus.namespace('payment');
paymentBus.emit('created', { id: 'p-1' }); // 实际发布 payment:created
```

### 3.7 Node.js 内置 EventEmitter 的类型安全扩展

```typescript
// ===== 基于 Node.js EventEmitter 的生产级封装 =====
import { EventEmitter } from 'node:events';

class TypedEmitter<Events extends EventMap> extends EventEmitter {
  on<K extends keyof Events>(event: K, listener: Events[K]): this {
    return super.on(String(event), listener as (...args: any[]) => void);
  }

  once<K extends keyof Events>(event: K, listener: Events[K]): this {
    return super.once(String(event), listener as (...args: any[]) => void);
  }

  emit<K extends keyof Events>(event: K, ...args: Parameters<Events[K]>): boolean {
    return super.emit(String(event), ...args);
  }

  off<K extends keyof Events>(event: K, listener: Events[K]): this {
    return super.off(String(event), listener as (...args: any[]) => void);
  }
}

interface ServerEvents {
  'connection': (clientId: string) => void;
  'message': (clientId: string, payload: Buffer) => void;
  'disconnect': (clientId: string, reason: string) => void;
}

const server = new TypedEmitter<ServerEvents>();
server.on('connection', (id) => console.log(`Client ${id} connected`));
server.emit('connection', 'c-42');
```

### 3.8 常见误区

| 误区 | 正确理解 |
|------|---------|
| 事件总线消除了耦合 | 总线本身成为隐式全局依赖 |
| 更多事件类型总是更好 | 过度细分会导致调试困难和逻辑分散 |
| 异步 emit 总是安全 | 未处理 rejection 会导致未捕获异常 |
| 不需要取消订阅 | 组件卸载后残留监听器是内存泄漏主因 |

### 3.9 扩展阅读

- [Event Emitter 模式](https://nodejs.org/api/events.html)
- [Node.js Events API](https://nodejs.org/api/events.html#class-eventemitter)
- [EventEmitter3 (高性能实现)](https://github.com/primus/eventemitter3)
- [RxJS Observable](https://rxjs.dev/guide/observable)
- [MDN：CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent)
- [MDN：EventTarget](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget)
- [MDN：WeakRef](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakRef) — 弱引用与垃圾回收
- [Node.js EventEmitter Memory Leaks](https://nodejs.org/api/events.html#emittersetmaxlistenersn) — maxListeners 与泄漏检测
- [RxJS Subjects](https://rxjs.dev/guide/subject) — 响应式编程中的多播 Observable
- [Mitt — 200B 极简 Event Emitter](https://github.com/developit/mitt) — 微型事件总线库
- [Google Publisher Subscriber Pattern](https://developers.google.com/web/fundamentals/architecture/app-shell) — Google Web Fundamentals 事件模式
- [Event Sourcing Pattern — Microsoft](https://docs.microsoft.com/en-us/azure/architecture/patterns/event-sourcing) — 微软云架构事件溯源
- [ReactiveX Observable Contract](http://reactivex.io/documentation/contract.html) — 响应式流规范
- [Node.js EventEmitter Best Practices](https://nodejs.org/en/learn/asynchronous-work/the-nodejs-event-emitter) — Node.js 官方最佳实践
- `20.2-language-patterns/design-patterns/behavioral/`

### 3.10 带中间件拦截器的事件总线

```typescript
type Middleware<T> = (event: string, payload: T, next: () => void) => void;

class MiddlewareEventBus<Events extends EventMap = EventMap> {
  private listeners: { [K in keyof Events]?: Set<Events[K]> } = {};
  private middlewares: Middleware<unknown>[] = [];

  use(mw: Middleware<unknown>): void {
    this.middlewares.push(mw);
  }

  on<K extends keyof Events>(event: K, listener: Events[K]): () => void {
    if (!this.listeners[event]) this.listeners[event] = new Set<Events[K]>();
    this.listeners[event]!.add(listener);
    return () => this.off(event, listener);
  }

  off<K extends keyof Events>(event: K, listener: Events[K]): void {
    this.listeners[event]?.delete(listener);
  }

  emit<K extends keyof Events>(event: K, ...args: Parameters<Events[K]>): void {
    const run = (index: number) => {
      if (index >= this.middlewares.length) {
        this.listeners[event]?.forEach((fn) => {
          try { (fn as any)(...args); } catch (err) { console.error(err); }
        });
        return;
      }
      this.middlewares[index](event as string, args, () => run(index + 1));
    };
    run(0);
  }
}

// 使用：日志中间件
const bus = new MiddlewareEventBus<AppEvents>();
bus.use((event, payload, next) => {
  console.log(`[before] ${event}`, payload);
  next();
  console.log(`[after] ${event}`);
});
```

### 3.11 基于 RxJS Subject 的响应式事件总线

```typescript
import { Subject } from 'rxjs';

class RxEventBus<Events extends EventMap = EventMap> {
  private subjects = new Map<keyof Events, Subject<Parameters<Events[keyof Events]>>>();

  on<K extends keyof Events>(event: K): Subject<Parameters<Events[K]>> {
    if (!this.subjects.has(event)) this.subjects.set(event, new Subject<Parameters<Events[K]>>());
    return this.subjects.get(event) as Subject<Parameters<Events[K]>>;
  }

  emit<K extends keyof Events>(event: K, ...args: Parameters<Events[K]>): void {
    this.on(event).next(args);
  }
}

// 使用
const rxBus = new RxEventBus<AppEvents>();
rxBus.on('user:login').subscribe(([id, ts]) => {
  console.log(`Rx login: ${id} at ${ts}`);
});
rxBus.emit('user:login', 'u-456', Date.now());
```

### 新增权威参考链接

- [Enterprise Integration Patterns — Martin Fowler](https://martinfowler.com/books/eip.html) — 企业集成模式权威著作
- [Apache Kafka Documentation](https://kafka.apache.org/documentation/) — 分布式事件流平台
- [RabbitMQ Tutorials](https://www.rabbitmq.com/getstarted.html) — 消息队列入门
- [ZeroMQ Guide](https://zguide.zeromq.org/) — 高性能异步消息库
- [NATS.io Documentation](https://docs.nats.io/) — 云原生消息系统
- [AWS SNS](https://aws.amazon.com/sns/) — 托管发布/订阅消息服务
- [Azure Event Grid](https://azure.microsoft.com/en-us/services/event-grid/) — 事件路由服务
- [Google Cloud Pub/Sub](https://cloud.google.com/pubsub) — 全托管消息中间件

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
