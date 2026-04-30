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

### 6.3 MessageChannel 主线程与 Worker 双向通信

```typescript
// message-channel-demo.ts
// MessageChannel 提供独立的两个端口，避免全局 message 事件冲突

const channel = new MessageChannel();
const worker = new Worker(new URL('./calc.worker.ts', import.meta.url));

// 将 port2 转让给 Worker，保留 port1 在本线程
worker.postMessage({ type: 'init-port', port: channel.port2 }, [channel.port2]);

// 通过 port1 发送任务并等待响应
function runTask(payload: { op: string; args: number[] }): Promise<number> {
  return new Promise((resolve) => {
    channel.port1.onmessage = (e) => resolve(e.data.result);
    channel.port1.postMessage(payload);
  });
}

runTask({ op: 'sum', args: [1, 2, 3, 4, 5] }).then(console.log); // 15
```

### 6.4 Background Sync 离线请求排队

```typescript
// background-sync-demo.ts
// Service Worker 中注册后台同步

// main.ts
async function queueSync(tag: string) {
  const registration = await navigator.serviceWorker.ready;
  if ('sync' in registration) {
    await (registration as any).sync.register(tag);
    console.log(`Background sync "${tag}" registered`);
  } else {
    // 降级：立即执行
    await fetchPendingRequests();
  }
}

// 用户提交表单时
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  await saveToIndexedDB(formData); // 先本地持久化
  await queueSync('submit-form');   // 请求后台同步
  showToast('Will sync when online');
});

// sw.ts
self.addEventListener('sync', (event: SyncEvent) => {
  if (event.tag === 'submit-form') {
    event.waitUntil(fetchPendingRequests());
  }
});

async function fetchPendingRequests() {
  const pending = await getPendingFromIndexedDB();
  for (const req of pending) {
    try {
      await fetch(req.url, { method: req.method, body: req.body });
      await removeFromIndexedDB(req.id);
    } catch {
      // 网络仍不可用，保留待下次同步
    }
  }
}
```

### 6.5 File System Access API 持久化文件句柄

```typescript
// file-system-access.ts
async function pickAndSaveFile() {
  // 1. 打开文件选择器
  const [fileHandle] = await (window as any).showOpenFilePicker({
    types: [{ description: 'Text Files', accept: { 'text/plain': ['.txt'] } }],
  });

  // 2. 读取文件
  const file = await fileHandle.getFile();
  const content = await file.text();
  console.log('Original content:', content);

  // 3. 写回修改后的内容
  const writable = await fileHandle.createWritable();
  await writable.write(content.toUpperCase());
  await writable.close();

  // 4. 请求持久化权限（下次可直接访问，无需重新选择）
  const persisted = await (navigator as any).storage?.getDirectory?.() ?? null;
  console.log('Persisted handle available:', persisted !== null);
}

// 存储文件句柄到 IndexedDB，实现"最近打开"列表
async function saveHandleToIndexedDB(handle: FileSystemFileHandle, key: string) {
  const db = await openDB('file-handles', 1);
  await db.put('handles', handle, key); // IndexedDB 支持存储 FileSystemHandle
}
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
- [Background Sync Spec](https://wicg.github.io/background-sync/spec/) — WICG Background Sync
- [File System Access API](https://wicg.github.io/file-system-access/) — WICG 文件系统访问规范
- [Storage Standard](https://storage.spec.whatwg.org/) — WHATWG Storage 规范
- [web.dev — Service Worker 生命周期](https://web.dev/articles/service-worker-lifecycle) — Google 官方指南
- [web.dev — Streams API](https://web.dev/articles/streams) — 流式处理最佳实践
- [GoogleChromeLabs — Service Worker Cookbook](https://serviceworke.rs/) — 可交互的 Service Worker 示例
- [Can I use — Web Platform Support](https://caniuse.com/) — 浏览器兼容性查询
