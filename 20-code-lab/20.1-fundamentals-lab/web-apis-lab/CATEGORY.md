---
dimension: 前端基础
sub-dimension: Web API 实验室
created: 2026-04-28
---

# 模块归属声明

本模块归属 **「前端基础」** 维度，聚焦 Web API 实验室 核心概念与工程实践。

## 包含内容

- DOM API、Fetch、Web Storage、Canvas、WebGL、Service Worker 等浏览器 API 实践。

## 相关索引

- `30-knowledge-base/30.2-categories/README.md` — 分类总览
- `20-code-lab/` — 代码实验室实践

## 子模块一览

| 子模块 | 说明 | 关键文件 |
|--------|------|----------|
| fetch-advanced | Fetch API 高级用法（取消、流、进度） | `fetch-advanced.ts` |
| observer-patterns | IntersectionObserver / MutationObserver | `observer-patterns.ts` |
| service-worker-cache | Service Worker 缓存策略 | `service-worker-cache.ts` |
| streams-pipeline | Web Streams API 流水线 | `streams-pipeline.ts` |
| web-platform-apis | Web Platform API 集合 | `web-platform-apis/` |

## 代码示例：Service Worker 缓存策略

```typescript
// service-worker-cache.ts：Cache-First 与 Network-First 策略
const CACHE_NAME = 'app-v1';
const PRECACHE_ASSETS = ['/index.html', '/styles.css', '/app.js'];

// Install：预缓存核心资源
self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_ASSETS))
  );
  (self as unknown as ServiceWorkerGlobalScope).skipWaiting();
});

// Fetch：Cache-First 策略
self.addEventListener('fetch', (event: FetchEvent) => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      });
    })
  );
});

// Activate：清理旧缓存
self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
});
```

## 代码示例：Fetch 取消与进度追踪

```typescript
// fetch-advanced.ts — AbortController + ReadableStream 进度
async function fetchWithProgress(
  url: string,
  onProgress: (loaded: number, total: number) => void
) {
  const controller = new AbortController();
  const response = await fetch(url, { signal: controller.signal });

  const contentLength = +(response.headers.get('Content-Length') ?? 0);
  const reader = response.body!.getReader();
  let loaded = 0;

  const stream = new ReadableStream({
    start(controller) {
      function pump(): Promise<void> {
        return reader.read().then(({ done, value }) => {
          if (done) { controller.close(); return; }
          loaded += value.byteLength;
          onProgress(loaded, contentLength);
          controller.enqueue(value);
          return pump();
        });
      }
      return pump();
    }
  });

  return new Response(stream);
}

// 使用：5 秒后自动取消
const ctrl = new AbortController();
setTimeout(() => ctrl.abort(), 5000);
fetch('/api/heavy', { signal: ctrl.signal }).catch(err => {
  if (err.name === 'AbortError') console.log('Request cancelled');
});
```

## 代码示例：IntersectionObserver 懒加载

```typescript
// observer-patterns.ts — 高性能图片懒加载 + 无限滚动
function createLazyLoader(
  selector: string,
  onIntersect: (el: Element) => void
) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        onIntersect(entry.target);
        observer.unobserve(entry.target); // 加载后取消观察
      }
    });
  }, { rootMargin: '200px 0px' }); // 提前 200px 触发

  document.querySelectorAll(selector).forEach(el => observer.observe(el));
  return observer;
}

// 图片懒加载
const imgObserver = createLazyLoader('img[data-src]', (el) => {
  const img = el as HTMLImageElement;
  img.src = img.dataset.src!;
  img.removeAttribute('data-src');
});
```

## 代码示例：Web Streams 流水线

```typescript
// streams-pipeline.ts — TransformStream 实现行级过滤
const response = await fetch('/api/logs');
const lines = response.body!
  .pipeThrough(new TextDecoderStream())
  .pipeThrough(new TransformStream({
    transform(chunk: string, controller) {
      chunk.split('\n').forEach(line => {
        if (line.includes('ERROR')) controller.enqueue(line + '\n');
      });
    }
  }));

// 消费过滤后的流
for await (const line of readableStreamToAsyncIterable(lines)) {
  console.log(line);
}

function readableStreamToAsyncIterable<T>(stream: ReadableStream<T>): AsyncIterable<T> {
  const reader = stream.getReader();
  return {
    [Symbol.asyncIterator]() {
      return {
        async next() {
          const { done, value } = await reader.read();
          return done ? { done: true, value: undefined } : { done: false, value };
        }
      };
    }
  };
}
```

### Web Share API 与 Clipboard API 集成

```typescript
// share-and-clipboard.ts
// 原生系统分享
async function nativeShare(data: { title: string; text: string; url: string }) {
  if (navigator.share) {
    await navigator.share(data);
  } else {
    // 降级：复制到剪贴板
    await navigator.clipboard.writeText(`${data.title}\n${data.url}`);
    showToast('Link copied to clipboard');
  }
}

// Clipboard 富文本写入
async function copyRichText(html: string, plain: string) {
  const blobHtml = new Blob([html], { type: 'text/html' });
  const blobText = new Blob([plain], { type: 'text/plain' });
  const clipboardItem = new ClipboardItem({
    'text/html': blobHtml,
    'text/plain': blobText,
  });
  await navigator.clipboard.write([clipboardItem]);
}

// 读取剪贴板图片
async function pasteImage(): Promise<Blob | null> {
  const items = await navigator.clipboard.read();
  for (const item of items) {
    if (item.types.includes('image/png')) {
      return await item.getType('image/png');
    }
  }
  return null;
}
```

### Permissions API 与功能探测

```typescript
// permissions-api.ts
// 统一查询权限状态

async function queryPermission(name: PermissionName): Promise<PermissionState> {
  try {
    const result = await navigator.permissions.query({ name });
    return result.state; // 'granted' | 'denied' | 'prompt'
  } catch {
    return 'prompt'; // 该权限不支持 Permissions API
  }
}

// 使用示例
async function requestCameraWithFallback() {
  const state = await queryPermission('camera');
  if (state === 'denied') {
    showSettingsDialog(); // 引导用户去系统设置开启
    return;
  }
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  videoElement.srcObject = stream;
}
```

### Web Storage 事件跨标签页同步

```typescript
// storage-sync.ts
// localStorage 在同源标签页间广播变更
window.addEventListener('storage', (event: StorageEvent) => {
  if (event.key === 'app-theme') {
    applyTheme(event.newValue ?? 'light');
    console.log(`Theme synced from another tab: ${event.newValue}`);
  }
});

function setTheme(theme: 'light' | 'dark') {
  localStorage.setItem('app-theme', theme);
  applyTheme(theme); // 当前标签页立即生效
}

// 封装为响应式 Store
function createSharedStorage<T>(key: string, defaultValue: T) {
  let value = JSON.parse(localStorage.getItem(key) ?? 'null') ?? defaultValue;
  const listeners = new Set<(v: T) => void>();

  window.addEventListener('storage', (e) => {
    if (e.key === key && e.newValue) {
      value = JSON.parse(e.newValue);
      listeners.forEach((fn) => fn(value));
    }
  });

  return {
    get() { return value; },
    set(v: T) { value = v; localStorage.setItem(key, JSON.stringify(v)); listeners.forEach((fn) => fn(v)); },
    subscribe(fn: (v: T) => void) { listeners.add(fn); return () => listeners.delete(fn); },
  };
}
```

## 目录内容

- 📄 ARCHITECTURE.md
- 📄 README.md
- 📄 THEORY.md
- 📄 _MIGRATED_FROM.md
- 📄 fetch-advanced.ts
- 📄 index.ts
- 📄 observer-patterns.ts
- 📄 service-worker-cache.ts
- 📄 streams-pipeline.ts
- 📄 web-apis-lab.test.ts
- 📁 web-platform-apis

---

> 此分类文档由批量生成脚本自动创建，请根据实际模块内容补充和调整。

## 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| MDN Web APIs | 文档 | [developer.mozilla.org/en-US/docs/Web/API](https://developer.mozilla.org/en-US/docs/Web/API) |
| Web.dev | 指南 | [web.dev](https://web.dev) |
| Web Streams Spec | 规范 | [streams.spec.whatwg.org](https://streams.spec.whatwg.org/) |
| Service Worker Cookbook | 实践 | [serviceworke.rs](https://serviceworke.rs/) |
| Can I use | 兼容性 | [caniuse.com](https://caniuse.com/) |
| Fetch Standard (WHATWG) | 规范 | [fetch.spec.whatwg.org](https://fetch.spec.whatwg.org/) |
| Intersection Observer Spec | 规范 | [w3c.github.io/IntersectionObserver](https://w3c.github.io.io/IntersectionObserver/) |
| Web Workers Spec | 规范 | [html.spec.whatwg.org/multipage/workers.html](https://html.spec.whatwg.org/multipage/workers.html) |
| Google Web Fundamentals — Promises | 指南 | [developers.google.com/web/fundamentals/primers/promises](https://developers.google.com/web/fundamentals/primers/promises) |
| Web.dev — Reliable HTTP Request Cancellation | 实践 | [web.dev/articles/abortable-fetch](https://web.dev/articles/abortable-fetch) |
| MDN — Web Share API | 文档 | [developer.mozilla.org/en-US/docs/Web/API/Web_Share_API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API) |
| MDN — Clipboard API | 文档 | [developer.mozilla.org/en-US/docs/Web/API/Clipboard_API](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API) |
| MDN — Permissions API | 文档 | [developer.mozilla.org/en-US/docs/Web/API/Permissions_API](https://developer.mozilla.org/en-US/docs/Web/API/Permissions_API) |
| MDN — Web Storage API | 文档 | [developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API) |
| web.dev — Notification API | 指南 | [web.dev/articles/push-notifications-overview](https://web.dev/articles/push-notifications-overview) |
| W3C — Web Notifications | 规范 | [notifications.spec.whatwg.org/](https://notifications.spec.whatwg.org/) |
| GoogleChromeLabs — Progressively Enhance With JS APIs | 示例 | [github.com/GoogleChromeLabs](https://github.com/GoogleChromeLabs) |

---

*最后更新: 2026-04-30*
