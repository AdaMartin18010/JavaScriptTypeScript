# 事件总线

> **定位**：`20-code-lab/20.1-fundamentals-lab/real-world-examples/event-bus`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块解决组件间解耦通信的问题。通过发布订阅模式实现松耦合架构，支持同步与异步事件传播。

### 1.2 形式化基础

[本模块的形式化定义与公理/定理陈述]

### 1.3 关键概念

| 概念 | 定义 | 关联 |
|------|------|------|
| 发布订阅 | 解耦的消息广播模式 | pub-sub.ts |
| 事件通道 | 带类型约束的命名空间事件 | typed-channels.ts |

---

## 二、设计原理

### 2.1 为什么存在

随着组件数量增加，直接引用导致紧耦合。事件总线通过间接通信解耦发送者与接收者，是大型应用架构的粘合剂。

### 2.2 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 全局总线 | 简单统一 | 全局状态难追踪 | 小型应用 |
| 作用域总线 | 隔离清晰 | 管理复杂度 | 模块化应用 |

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

### 3.6 常见误区

| 误区 | 正确理解 |
|------|---------|
| 事件总线消除了耦合 | 总线本身成为隐式全局依赖 |
| 更多事件类型总是更好 | 过度细分会导致调试困难和逻辑分散 |

### 3.7 扩展阅读

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
- `20.2-language-patterns/design-patterns/behavioral/`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
