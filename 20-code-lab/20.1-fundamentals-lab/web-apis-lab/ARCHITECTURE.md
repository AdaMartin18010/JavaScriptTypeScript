# Web APIs 实验室 — 架构设计

## 1. 架构概述

本模块实现了现代 Web 平台 API 的综合性示例应用，展示 Fetch、Streams、Web Workers、Service Worker 和 IndexedDB 等 API 的协同使用。架构采用分层设计，将网络层、并发层与存储层解耦，使每个平台 API 可在隔离环境中被独立验证，再通过统一的事件总线协同工作。

## 2. 架构图

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              应用层 (Application)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │   UI Layer   │  │  State Mgmt  │  │   Router     │  │   Hooks     │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬──────┘ │
└─────────┼─────────────────┼─────────────────┼─────────────────┼────────┘
          │                 │                 │                 │
┌─────────┼─────────────────┼─────────────────┼─────────────────┼────────┐
│         │         平台 API 抽象层 (Web Platform API Abstractions)       │
│  ┌──────┴───────┐  ┌──────┴───────┐  ┌──────┴───────┐  ┌──────┴─────┐ │
│  │ Fetch Client │  │ Worker Pool  │  │Cache Manager │  │IDB Wrapper │ │
│  │  + Streams   │  │ + Messaging  │  │+ Background  │  │+ FS Access │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬─────┘ │
└─────────┼─────────────────┼─────────────────┼─────────────────┼────────┘
          │                 │                 │                 │
┌─────────┼─────────────────┼─────────────────┼─────────────────┼────────┐
│         │              浏览器引擎层 (Browser Engine)                    │
│  ┌──────┴───────┐  ┌──────┴───────┐  ┌──────┴───────┐  ┌──────┴─────┐ │
│  │  HTTP Stack  │  │   V8 / JS    │  │ ServiceWorker│  │  IndexedDB │ │
│  │  + Network   │  │   Engine     │  │   Runtime    │  │  + Storage │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

## 3. 核心组件

### 3.1 网络层

| 组件 | 职责 | 关键 API | 设计模式 |
|------|------|----------|----------|
| HTTP Client | Fetch API 封装，支持拦截器、超时、重试 | `fetch`, `AbortController` | 拦截器链、策略模式 |
| Streaming Handler | ReadableStream 处理大数据 | `ReadableStream`, `TransformStream` | 管道模式 |
| Cache Manager | Cache API 策略管理 | `CacheStorage`, `caches` | 策略模式 |
| Background Sync | 离线请求排队和同步 | `BackgroundSyncManager` | 队列模式 |

### 3.2 并发层

| 组件 | 职责 | 关键 API | 设计模式 |
|------|------|----------|----------|
| Worker Pool | Web Worker 线程池管理 | `Worker`, `SharedWorker` | 对象池 |
| Message Broker | 主线程与 Worker 间的消息路由 | `postMessage`, `MessageChannel` | 发布-订阅 |
| SharedBuffer Manager | SharedArrayBuffer 同步协作 | `SharedArrayBuffer`, `Atomics` | 锁模式 |

### 3.3 存储层

| 组件 | 职责 | 关键 API | 设计模式 |
|------|------|----------|----------|
| IndexedDB Wrapper | Promise 封装、版本迁移、索引管理 | `indexedDB` | 仓储模式 |
| File System Handler | File System Access API 的文件读写 | `showOpenFilePicker`, `FileSystemFileHandle` | 适配器模式 |
| Storage Quota Monitor | 存储配额监控和清理策略 | `navigator.storage.estimate` | 观察者模式 |

## 4. 数据流

```
User Action → Service Worker (Cache/Background Sync) → Fetch/Worker → Process → Store (IndexedDB) → UI Update
```

## 5. 技术栈对比

| 能力维度 | 本实验室实现 | Axios | RxJS | Workbox |
|----------|-------------|-------|------|---------|
| HTTP 请求 | Fetch + 拦截器 | XMLHttpRequest | Observable 包装 | — |
| 缓存策略 | Cache API 手动管理 | 内置缓存 | — | 自动生成 SW |
| 流式处理 | ReadableStream 原生 | 不支持 | 基于 Observable | — |
| Worker 管理 | 线程池 + 消息路由 | — | — | — |
| 存储封装 | IDB + File System | — | — | — |
| 包体积 | 0 deps (~5KB) | ~13KB | ~25KB | ~30KB |
| 学习价值 | ★★★★★ | ★★★ | ★★★★ | ★★★★ |

## 6. 代码示例

### 6.1 带拦截器和策略的 HTTP Client

```typescript
// web-apis-lab/src/net/HttpClient.ts
interface RequestConfig {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: BodyInit;
  timeout?: number;
  retries?: number;
  cachePolicy?: 'cache-first' | 'network-first' | 'stale-while-revalidate';
}

interface Interceptor {
  request?(config: RequestConfig): Promise<RequestConfig>;
  response?<T>(response: T): Promise<T>;
  error?(err: Error): Promise<Error>;
}

class HttpClient {
  private interceptors: Interceptor[] = [];

  addInterceptor(i: Interceptor): void {
    this.interceptors.push(i);
  }

  async request<T>(config: RequestConfig): Promise<T> {
    // 执行请求拦截器
    for (const i of this.interceptors) {
      if (i.request) config = await i.request(config);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      config.timeout ?? 5000
    );

    const response = await fetch(config.url, {
      method: config.method ?? 'GET',
      headers: config.headers,
      body: config.body,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return response.json() as Promise<T>;
  }
}
```

### 6.2 Service Worker 缓存策略

```typescript
// web-apis-lab/src/sw/CacheStrategy.ts
const strategies = {
  'cache-first': async (req: Request) => {
    const cached = await caches.match(req);
    return cached ?? fetch(req).then(r => { caches.open('v1').then(c => c.put(req, r.clone())); return r; });
  },
  'stale-while-revalidate': async (req: Request) => {
    const cached = await caches.match(req);
    const network = fetch(req).then(r => { caches.open('v1').then(c => c.put(req, r.clone())); return r; });
    return cached ?? await network;
  },
};
```

## 7. 技术决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 缓存策略 | Stale-While-Revalidate | 平衡性能和新鲜度 |
| 并发模型 | Worker Pool | 避免主线程阻塞 |
| 存储方案 | IndexedDB + Cache API | 结构化 + HTTP 缓存 |

## 8. 质量属性

- **可靠性**: 离线功能和后台同步
- **性能**: Worker 并行处理和流式传输
- **可扩展性**: 模块化 API 封装

## 9. 参考链接

- [MDN Web APIs](https://developer.mozilla.org/en-US/docs/Web/API) — Mozilla 官方 Web API 文档
- [Fetch Standard](https://fetch.spec.whatwg.org/) — WHATWG Fetch 规范
- [Service Workers 规范](https://w3c.github.io/ServiceWorker/) — W3C Service Worker 草案
- [Streams Standard](https://streams.spec.whatwg.org/) — WHATWG Streams 规范
- [IndexedDB 规范](https://w3c.github.io/IndexedDB/) — W3C Indexed Database API
- [Web Workers 规范](https://html.spec.whatwg.org/multipage/workers.html) — HTML Living Standard
