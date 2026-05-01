---
title: Web APIs 完全指南
description: "Awesome JS/TS Ecosystem 指南: Web APIs 完全指南"
---

# Web APIs 完全指南

> 系统梳理浏览器环境下 JavaScript/TypeScript 可用的 Web APIs，覆盖 DOM 操作、网络通信、存储、多线程、硬件访问与性能观测等核心能力。本文档面向需要在生产环境中正确、高效、安全地使用浏览器原生 API 的开发者。

---

## 目录

- [Web APIs 完全指南](#web-apis-完全指南)
  - [目录](#目录)
  - [1. DOM API](#1-dom-api)
    - [1.1 选择器 API](#11-选择器-api)
    - [1.2 DOM 遍历](#12-dom-遍历)
    - [1.3 DOM 操作](#13-dom-操作)
    - [1.4 事件系统与事件委托](#14-事件系统与事件委托)
    - [1.5 常见陷阱](#15-常见陷阱)
  - [2. Fetch API](#2-fetch-api)
    - [2.1 请求与响应基础](#21-请求与响应基础)
    - [2.2 AbortController 与请求取消](#22-abortcontroller-与请求取消)
    - [2.3 流式读取与进度追踪](#23-流式读取与进度追踪)
    - [2.4 常见陷阱](#24-常见陷阱)
  - [3. Streams API](#3-streams-api)
    - [3.1 ReadableStream](#31-readablestream)
    - [3.2 WritableStream](#32-writablestream)
    - [3.3 TransformStream](#33-transformstream)
    - [3.4 背压控制（Backpressure）](#34-背压控制backpressure)
    - [3.5 常见陷阱](#35-常见陷阱)
  - [4. Canvas API](#4-canvas-api)
    - [4.1 2D 上下文基础](#41-2d-上下文基础)
    - [4.2 路径与绘制](#42-路径与绘制)
    - [4.3 图像处理](#43-图像处理)
    - [4.4 性能优化](#44-性能优化)
    - [4.5 常见陷阱](#45-常见陷阱)
  - [5. WebGL](#5-webgl)
    - [5.1 基础概念](#51-基础概念)
    - [5.2 Three.js 简介](#52-threejs-简介)
    - [5.3 常见陷阱](#53-常见陷阱)
  - [6. Web Storage](#6-web-storage)
    - [6.1 localStorage 与 sessionStorage](#61-localstorage-与-sessionstorage)
    - [6.2 IndexedDB 概览](#62-indexeddb-概览)
    - [6.3 常见陷阱](#63-常见陷阱)
  - [7. Service Worker](#7-service-worker)
    - [7.1 生命周期](#71-生命周期)
    - [7.2 缓存策略](#72-缓存策略)
    - [7.3 Background Sync](#73-background-sync)
    - [7.4 常见陷阱](#74-常见陷阱)
  - [8. Web Workers](#8-web-workers)
    - [8.1 Dedicated Worker](#81-dedicated-worker)
    - [8.2 Shared Worker](#82-shared-worker)
    - [8.3 与 Node.js Worker Threads 对比](#83-与-nodejs-worker-threads-对比)
    - [8.4 常见陷阱](#84-常见陷阱)
  - [9. Notification API](#9-notification-api)
    - [9.1 权限请求与通知创建](#91-权限请求与通知创建)
    - [9.2 常见陷阱](#92-常见陷阱)
  - [10. Clipboard API](#10-clipboard-api)
    - [10.1 读写剪贴板](#101-读写剪贴板)
    - [10.2 常见陷阱](#102-常见陷阱)
  - [11. File API](#11-file-api)
    - [11.1 FileReader 与 Blob](#111-filereader-与-blob)
    - [11.2 File System Access API](#112-file-system-access-api)
    - [11.3 常见陷阱](#113-常见陷阱)
  - [12. Geolocation API](#12-geolocation-api)
    - [12.1 获取位置信息](#121-获取位置信息)
    - [12.2 常见陷阱](#122-常见陷阱)
  - [13. Observer APIs](#13-observer-apis)
    - [13.1 Intersection Observer](#131-intersection-observer)
    - [13.2 Resize Observer](#132-resize-observer)
    - [13.3 Mutation Observer](#133-mutation-observer)
    - [13.4 常见陷阱](#134-常见陷阱)
  - [附录：兼容性速查表](#附录兼容性速查表)
  - [参考资源](#参考资源)
  - [相关资源](#相关资源)

---

## 1. DOM API

### 1.1 选择器 API

DOM 选择器 API 是从文档树中定位元素的核心手段。现代浏览器提供了高性能、语义化的选择器接口。

```typescript
// ===== 核心选择器 =====

// querySelector: 返回匹配的第一个元素
const header = document.querySelector<HTMLElement>('#app-header');
const firstBtn = document.querySelector<HTMLButtonElement>('button.primary');

// querySelectorAll: 返回静态 NodeList（非实时）
const cards = document.querySelectorAll<HTMLDivElement>('.card');
// 转换为数组以便使用数组方法
const cardArray = Array.from(cards);

// getElementById: 最快的 ID 查找（无 Selector 解析开销）
const canvas = document.getElementById('main-canvas') as HTMLCanvasElement | null;

// getElementsByClassName / getElementsByTagName: 返回实时 HTMLCollection
const liveItems = document.getElementsByClassName('list-item');
// 注意：HTMLCollection 是实时的，DOM 变更会立即反映

// ===== 选择器性能优化 =====
interface SelectorBenchmark {
  selector: string;
  relativeSpeed: 'fastest' | 'fast' | 'moderate' | 'slow';
  reason: string;
}

const selectorGuide: SelectorBenchmark[] = [
  {
    selector: '#id',
    relativeSpeed: 'fastest',
    reason: '直接通过内部 ID 映射表查找',
  },
  {
    selector: '.class',
    relativeSpeed: 'fast',
    reason: '遍历 class 索引',
  },
  {
    selector: 'tag',
    relativeSpeed: 'fast',
    reason: '遍历 tag 索引',
  },
  {
    selector: '[attr]',
    relativeSpeed: 'moderate',
    reason: '无索引，需遍历 DOM',
  },
  {
    selector: '.a .b .c',
    relativeSpeed: 'slow',
    reason: '从右向左匹配，多重回溯',
  },
];

// ===== 在指定作用域内查询 =====
function findWithin(
  scope: HTMLElement,
  selector: string
): Element[] {
  // 限定搜索范围，减少遍历开销
  return Array.from(scope.querySelectorAll(selector));
}

// ===== 最近祖先匹配（:has 的现代替代）=====
function closestMatch(
  element: HTMLElement,
  selector: string
): HTMLElement | null {
  // Element.closest 从当前元素向上查找匹配选择器的最近祖先
  return element.closest(selector);
}
```

**兼容性提示**：`querySelector` / `querySelectorAll` 支持 IE8+（部分选择器），现代浏览器完整支持 CSS3 选择器。`Element.closest` 支持 IE11+（需 polyfill）。

---

### 1.2 DOM 遍历

```typescript
// ===== 父子兄弟关系遍历 =====
interface TraversalAPI {
  // 父节点
  parentNode: Node | null;
  parentElement: HTMLElement | null; // 仅 Element

  // 子节点（包含文本、注释节点）
  childNodes: NodeListOf<ChildNode>;
  firstChild: Node | null;
  lastChild: Node | null;

  // 子元素（仅 Element）
  children: HTMLCollectionOf<Element>;
  firstElementChild: Element | null;
  lastElementChild: Element | null;

  // 兄弟节点
  nextSibling: Node | null;
  previousSibling: Node | null;
  nextElementSibling: Element | null;
  previousElementSibling: Element | null;
}

// ===== TreeWalker：高性能定向遍历 =====
function* walkTextNodes(root: Node): Generator<Text> {
  const treeWalker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT,           // 只显示文本节点
    {                               // 可选的节点过滤函数
      acceptNode(node) {
        // 跳过空白文本节点
        if (!node.textContent?.trim()) {
          return NodeFilter.FILTER_SKIP;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    }
  );

  let currentNode: Node | null = treeWalker.nextNode();
  while (currentNode) {
    yield currentNode as Text;
    currentNode = treeWalker.nextNode();
  }
}

// ===== 安全地遍历并修改 DOM =====
function removeEmptyElements(container: HTMLElement): void {
  // 必须从后向前遍历，避免索引错位
  const elements = Array.from(container.children);
  for (let i = elements.length - 1; i >= 0; i--) {
    const el = elements[i];
    if (el.textContent?.trim() === '') {
      el.remove(); // 现代 API，比 parentNode.removeChild(el) 更简洁
    }
  }
}

// ===== NodeIterator 示例 =====
function countElementsByTag(root: Node, tagName: string): number {
  const iterator = document.createNodeIterator(
    root,
    NodeFilter.SHOW_ELEMENT,
    {
      acceptNode(node) {
        return (node as Element).tagName.toLowerCase() === tagName.toLowerCase()
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_REJECT;
      },
    }
  );

  let count = 0;
  let node: Node | null = iterator.nextNode();
  while (node) {
    count++;
    node = iterator.nextNode();
  }
  return count;
}
```

---

### 1.3 DOM 操作

```typescript
// ===== 创建与插入 =====
interface DOMOperation {
  create(tag: string, attrs?: Record<string, string>): HTMLElement;
  append(parent: HTMLElement, ...children: (Node | string)[]): void;
  replace(oldNode: Node, newNode: Node): void;
}

function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs?: Partial<HTMLElementTagNameMap[K]>,
  children?: (Node | string)[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);

  if (attrs) {
    Object.entries(attrs).forEach(([key, value]) => {
      if (key === 'className') {
        el.className = String(value);
      } else if (key === 'style' && typeof value === 'object') {
        Object.assign(el.style, value);
      } else if (key.startsWith('data-')) {
        el.setAttribute(key, String(value));
      } else if (key in el) {
        (el as Record<string, unknown>)[key] = value;
      } else {
        el.setAttribute(key, String(value));
      }
    });
  }

  children?.forEach((child) => {
    el.append(child); // 优于 appendChild，支持字符串直接插入
  });

  return el;
}

// 使用示例
const card = createElement('div', {
  className: 'card',
  id: 'user-card',
}, [
  createElement('h3', {}, ['User Name']),
  createElement('p', { className: 'bio' }, ['Description']),
]);

// ===== DocumentFragment：批量插入优化 =====
function renderListItems(
  container: HTMLElement,
  items: string[]
): void {
  const fragment = document.createDocumentFragment();

  items.forEach((text, index) => {
    const li = document.createElement('li');
    li.textContent = text;
    li.dataset.index = String(index);
    fragment.appendChild(li);
  });

  // 仅触发一次重排/重绘
  container.appendChild(fragment);
}

// ===== 批量 class 操作（classList）=====
function toggleClasses(
  element: HTMLElement,
  classes: Record<string, boolean>
): void {
  Object.entries(classes).forEach(([className, shouldAdd]) => {
    element.classList.toggle(className, shouldAdd);
  });
}

// ===== insertAdjacent* 系列：更精确的插入位置 =====
function insertAdjascentDemo(target: HTMLElement): void {
  // beforebegin: 元素自身之前
  target.insertAdjacentHTML('beforebegin', '<p>Before</p>');
  // afterbegin: 元素内部第一个子节点之前
  target.insertAdjacentHTML('afterbegin', '<span>First</span>');
  // beforeend: 元素内部最后一个子节点之后
  target.insertAdjacentHTML('beforeend', '<span>Last</span>');
  // afterend: 元素自身之后
  target.insertAdjacentHTML('afterend', '<p>After</p>');
}

// ===== 比较安全的 HTML 净化插入 =====
function setSafeHTML(
  element: HTMLElement,
  html: string,
  sanitizer?: { sanitizeFor(tag: string, html: string): DocumentFragment | null }
): void {
  // 如果浏览器支持 Sanitizer API（实验性）
  if (sanitizer) {
    const fragment = sanitizer.sanitizeFor('div', html);
    if (fragment) {
      element.replaceChildren(fragment);
      return;
    }
  }

  // 回退：使用 textContent（纯文本）或 trustedTypes
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  element.replaceChildren(...Array.from(doc.body.childNodes));
}
```

---

### 1.4 事件系统与事件委托

```typescript
// ===== 类型安全的事件监听封装 =====
type EventMap = HTMLElementEventMap & DocumentEventMap & WindowEventMap;

function addSafeEventListener<K extends keyof EventMap>(
  target: EventTarget,
  type: K,
  listener: (event: EventMap[K]) => void,
  options?: boolean | AddEventListenerOptions
): () => void {
  const wrapped = (e: Event) => listener(e as EventMap[K]);
  target.addEventListener(type, wrapped, options);

  // 返回取消订阅函数
  return () => target.removeEventListener(type, wrapped, options);
}

// 使用示例
const unsubscribe = addSafeEventListener(window, 'resize', (e) => {
  console.log('Window resized:', window.innerWidth);
});
// unsubscribe(); // 清理

// ===== 事件委托：高效处理大量子元素 =====
class EventDelegator {
  private listeners = new Map<
    string,
    Map<string, (event: Event) => void>
  >();

  constructor(private root: HTMLElement) {}

  on<K extends keyof HTMLElementEventMap>(
    eventType: K,
    selector: string,
    handler: (event: HTMLElementEventMap[K], target: HTMLElement) => void
  ): this {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Map());
    }

    const key = `${eventType}::${selector}`;
    const wrapped = (event: Event) => {
      const target = (event.target as HTMLElement).closest(selector);
      if (target && this.root.contains(target)) {
        handler(event as HTMLElementEventMap[K], target as HTMLElement);
      }
    };

    this.listeners.get(eventType)!.set(key, wrapped);
    this.root.addEventListener(eventType, wrapped);
    return this;
  }

  off(eventType: string, selector: string): void {
    const key = `${eventType}::${selector}`;
    const handler = this.listeners.get(eventType)?.get(key);
    if (handler) {
      this.root.removeEventListener(eventType, handler);
      this.listeners.get(eventType)?.delete(key);
    }
  }

  destroy(): void {
    this.listeners.forEach((handlers, eventType) => {
      handlers.forEach((handler) => {
        this.root.removeEventListener(eventType, handler);
      });
    });
    this.listeners.clear();
  }
}

// ===== Passive 事件监听器（滚动优化）=====
function addPassiveScrollListener(
  handler: (e: Event) => void
): () => void {
  // { passive: true } 告知浏览器不会调用 preventDefault()
  // 允许浏览器在 JS 执行前就开始滚动，提升 10-20% 滚动性能
  window.addEventListener('scroll', handler, { passive: true });
  return () => window.removeEventListener('scroll', handler);
}

// ===== 自定义事件 =====
interface CustomEventDetail {
  userId: string;
  timestamp: number;
}

dispatchUserLogin(userId: string): void {
  const event = new CustomEvent<CustomEventDetail>('user:login', {
    detail: { userId, timestamp: Date.now() },
    bubbles: true,
    cancelable: true,
  });
  document.dispatchEvent(event);
}

// 监听自定义事件
addSafeEventListener(document, 'user:login', (e) => {
  console.log('User logged in:', e.detail.userId);
});
```

---

### 1.5 常见陷阱

| 陷阱 | 说明 | 解决方案 |
|------|------|----------|
| **Nodelist 是类数组** | `querySelectorAll` 返回的 NodeList 无 `map`/`filter` | 使用 `Array.from()` 或展开运算符 `[...nodes]` |
| **HTMLCollection 实时更新** | `getElementsByTagName` 结果会随 DOM 变化 | 遍历时先转为静态数组，或改用 `querySelectorAll` |
| `innerHTML` XSS | 直接插入用户输入导致脚本注入 | 使用 `textContent`、Sanitizer API 或 DOMPurify |
| **事件委托 this 指向** | 委托中的 `this` 可能指向 window | 使用箭头函数，从 `event.currentTarget` 获取 |
| **内存泄漏** | 移除 DOM 前未解绑事件监听 | 使用 AbortController 或返回的 unsubscribe 函数 |
| **重排（Reflow）风暴** | 循环中反复读取/写入布局属性 | 使用 DocumentFragment、CSS transform、requestAnimationFrame |

---

## 2. Fetch API

### 2.1 请求与响应基础

```typescript
// ===== 请求配置类型 =====
interface RequestConfig extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

// ===== 类型安全的 Fetch 封装 =====
class TypedFetchClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseURL: string, headers: Record<string, string> = {}) {
    this.baseURL = baseURL.replace(/\/$/, '');
    this.defaultHeaders = {
      'Accept': 'application/json',
      ...headers,
    };
  }

  async request<T>(
    path: string,
    config: RequestConfig = {}
  ): Promise<{ data: T; response: Response }> {
    const { timeout = 30000, retries = 0, retryDelay = 1000, ...init } = config;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const url = `${this.baseURL}${path}`;
    const requestInit: RequestInit = {
      ...init,
      headers: {
        ...this.defaultHeaders,
        ...init.headers,
      },
      signal: controller.signal,
    };

    try {
      const response = await this.fetchWithRetry(url, requestInit, retries, retryDelay);
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new HttpError(response.status, response.statusText, response);
      }

      const data = await this.parseResponse<T>(response);
      return { data, response };
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private async fetchWithRetry(
    url: string,
    init: RequestInit,
    retries: number,
    delay: number
  ): Promise<Response> {
    try {
      return await fetch(url, init);
    } catch (error) {
      if (retries > 0) {
        await new Promise((r) => setTimeout(r, delay));
        return this.fetchWithRetry(url, init, retries - 1, delay * 2);
      }
      throw error;
    }
  }

  private async parseResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      return response.json() as Promise<T>;
    }
    if (contentType.startsWith('text/')) {
      return response.text() as unknown as Promise<T>;
    }
    if (contentType.includes('application/octet-stream')) {
      return response.blob() as unknown as Promise<T>;
    }
    return response as unknown as Promise<T>;
  }
}

class HttpError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public response: Response
  ) {
    super(`HTTP ${status}: ${statusText}`);
    this.name = 'HttpError';
  }
}

// ===== Request / Response 对象手动构造 =====
function demonstrateRequestResponse(): void {
  // 手动构造 Request
  const request = new Request('https://api.example.com/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Alice' }),
    credentials: 'include',
    cache: 'no-cache',
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
  });

  // 克隆 Request（因为 body 只能读取一次）
  const clonedRequest = request.clone();

  // 手动构造 Response（常用于 Service Worker / 测试）
  const mockResponse = new Response(
    JSON.stringify({ id: 1, name: 'Alice' }),
    {
      status: 201,
      statusText: 'Created',
      headers: {
        'Content-Type': 'application/json',
        'X-Custom-Header': 'value',
      },
    }
  );

  // Headers 对象操作
  const headers = new Headers(mockResponse.headers);
  headers.append('X-Request-ID', crypto.randomUUID());
  headers.set('Cache-Control', 'max-age=3600');
}
```

**兼容性提示**：Fetch API 支持 IE 之外的所有现代浏览器。IE 需要 `whatwg-fetch` polyfill。`Request.credentials` 的 `'include'` 在 CORS 场景下要求服务端配置 `Access-Control-Allow-Credentials: true`。

---

### 2.2 AbortController 与请求取消

```typescript
// ===== 请求取消管理器 =====
class RequestCancelManager {
  private controllers = new Map<string, AbortController>();

  create(key: string): AbortSignal {
    // 如果存在同 key 的请求，先取消它
    this.cancel(key);

    const controller = new AbortController();
    this.controllers.set(key, controller);

    // 请求完成后自动清理
    const cleanup = () => this.controllers.delete(key);
    controller.signal.addEventListener('abort', cleanup, { once: true });

    return controller.signal;
  }

  cancel(key: string): boolean {
    const controller = this.controllers.get(key);
    if (controller && !controller.signal.aborted) {
      controller.abort(`Request '${key}' was superseded by a newer request.`);
      this.controllers.delete(key);
      return true;
    }
    return false;
  }

  cancelAll(): void {
    this.controllers.forEach((controller) => {
      if (!controller.signal.aborted) {
        controller.abort('All requests cancelled by manager.');
      }
    });
    this.controllers.clear();
  }
}

// ===== 组件卸载时自动取消请求 =====
function useCancellableRequest() {
  const manager = new RequestCancelManager();

  // 模拟组件卸载
  window.addEventListener('beforeunload', () => manager.cancelAll());

  return manager;
}

// ===== 带超时自动取消的 Fetch =====
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = 10000
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort('Request timeout'), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error(`Request aborted: ${error.message}`);
    }
    throw error;
  }
}
```

---

### 2.3 流式读取与进度追踪

```typescript
// ===== NDJSON / SSE 流式解析器 =====
async function* readNDJSONStream<T>(
  response: Response
): AsyncGenerator<T, void, unknown> {
  if (!response.body) {
    throw new Error('Response body is null');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed) {
          try {
            yield JSON.parse(trimmed) as T;
          } catch {
            // 忽略非 JSON 行（如 SSE 的 `data: ` 前缀）
            const jsonPart = trimmed.replace(/^data:\s*/, '');
            if (jsonPart && jsonPart !== '[DONE]') {
              yield JSON.parse(jsonPart) as T;
            }
          }
        }
      }
    }

    if (buffer.trim()) {
      yield JSON.parse(buffer) as T;
    }
  } finally {
    reader.releaseLock();
  }
}

// ===== 下载进度追踪 =====
interface DownloadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

async function downloadWithProgress(
  url: string,
  onProgress: (progress: DownloadProgress) => void
): Promise<Blob> {
  const response = await fetch(url);
  if (!response.ok || !response.body) {
    throw new Error(`Download failed: ${response.status}`);
  }

  const contentLength = parseInt(
    response.headers.get('content-length') || '0',
    10
  );
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let loaded = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    chunks.push(value);
    loaded += value.length;

    onProgress({
      loaded,
      total: contentLength,
      percentage: contentLength ? Math.round((loaded / contentLength) * 100) : 0,
    });
  }

  // 合并 chunks
  const allChunks = new Uint8Array(loaded);
  let position = 0;
  for (const chunk of chunks) {
    allChunks.set(chunk, position);
    position += chunk.length;
  }

  return new Blob([allChunks]);
}
```

---

### 2.4 常见陷阱

| 陷阱 | 说明 | 解决方案 |
|------|------|----------|
| **Fetch 不抛 4xx/5xx** | `fetch()` 仅在网络失败时 reject，HTTP 错误返回 resolve | 手动检查 `response.ok` |
| **Body 只能读取一次** | `response.json()` 等消费方法会锁定 body | 使用 `response.clone()` 或提前保存 |
| **AbortController 超时竞态** | 网络慢时超时 abort 与正常完成竞态 | `finally` 中统一 `clearTimeout` |
| **CORS 预检失败** | 自定义 header 或 `Content-Type: application/json` 触发 OPTIONS | 服务端配置 `Access-Control-Allow-Headers` |
| **Cookie 未发送** | 默认 `credentials: 'same-origin'` | 跨域时显式设置 `credentials: 'include'` |
| **URL 编码遗漏** | `fetch('/api?q=foo bar')` 中的空格不合法 | 使用 `encodeURIComponent()` 或 `URLSearchParams` |

---

## 3. Streams API

Streams API 提供了以编程方式处理流数据的接口，允许 JavaScript 逐步接收、生成和转换数据，而非一次性加载到内存。

### 3.1 ReadableStream

```typescript
// ===== 自定义 ReadableStream =====
function createCounterStream(max: number, delayMs: number = 100): ReadableStream<number> {
  let count = 0;

  return new ReadableStream<number>({
    start(controller) {
      // 流启动时调用
      console.log('Stream started');
    },

    async pull(controller) {
      // 消费者读取时调用
      if (count < max) {
        await new Promise((r) => setTimeout(r, delayMs));
        controller.enqueue(count++);
      } else {
        controller.close(); // 结束流
      }
    },

    cancel(reason) {
      // 消费者取消订阅时调用
      console.log('Stream cancelled:', reason);
    },
  });
}

// ===== 消费 ReadableStream =====
async function consumeStream(): Promise<void> {
  const stream = createCounterStream(5);
  const reader = stream.getReader();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      console.log('Received:', value);
    }
  } finally {
    reader.releaseLock(); // 必须释放锁
  }
}

// ===== 使用 for await...of（通过适配器）=====
async function* streamToAsyncIterator<T>(
  stream: ReadableStream<T>
): AsyncGenerator<T> {
  const reader = stream.getReader();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) return;
      yield value;
    }
  } finally {
    reader.releaseLock();
  }
}

// ===== 从数组快速创建 ReadableStream =====
function createStreamFromArray<T>(items: T[]): ReadableStream<T> {
  return new ReadableStream({
    start(controller) {
      for (const item of items) {
        controller.enqueue(item);
      }
      controller.close();
    },
  });
}
```

---

### 3.2 WritableStream

```typescript
// ===== 自定义 WritableStream（日志收集器）=====
function createBatchLogger(batchSize: number = 10): WritableStream<string> {
  const buffer: string[] = [];

  return new WritableStream<string>({
    write(chunk) {
      buffer.push(chunk);
      if (buffer.length >= batchSize) {
        flushLogs(buffer.splice(0, batchSize));
      }
    },

    close() {
      if (buffer.length > 0) {
        flushLogs(buffer.splice(0));
      }
      console.log('Logger closed');
    },

    abort(reason) {
      console.error('Logger aborted:', reason);
      buffer.length = 0;
    },
  });
}

function flushLogs(batch: string[]): void {
  console.log('Flushing batch:', batch);
  // 实际场景：发送到日志服务器
}

// ===== 向 WritableStream 写入数据 =====
async function writeToStream(): Promise<void> {
  const stream = createBatchLogger(3);
  const writer = stream.getWriter();

  try {
    await writer.write('Log entry 1');
    await writer.write('Log entry 2');
    await writer.write('Log entry 3'); // 触发批量刷新
    await writer.write('Log entry 4');
  } finally {
    await writer.close();
  }
}
```

---

### 3.3 TransformStream

```typescript
// ===== JSON Lines TransformStream =====
function createJSONLParser<T>(): TransformStream<string, T> {
  let buffer = '';

  return new TransformStream<string, T>({
    transform(chunk, controller) {
      buffer += chunk;
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed) {
          try {
            controller.enqueue(JSON.parse(trimmed) as T);
          } catch (e) {
            controller.error(new Error(`Invalid JSON: ${trimmed}`));
          }
        }
      }
    },

    flush(controller) {
      if (buffer.trim()) {
        try {
          controller.enqueue(JSON.parse(buffer.trim()) as T);
        } catch (e) {
          controller.error(new Error(`Invalid JSON at end: ${buffer}`));
        }
      }
    },
  });
}

// ===== 文本转换流链 =====
function createUpperCaseTransform(): TransformStream<string, string> {
  return new TransformStream({
    transform(chunk, controller) {
      controller.enqueue(chunk.toUpperCase());
    },
  });
}

// ===== 流式管道组合 =====
async function streamPipelineDemo(): Promise<void> {
  const source = new Response('hello world stream').body!;

  // 将字节流 → 文本流 → 大写流 → 输出
  const textStream = source
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(createUpperCaseTransform());

  const reader = textStream.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    console.log(value); // 逐块输出大写文本
  }
}

// ===== 限速 TransformStream（Rate Limiter）=====
function createRateLimiter<T>(
  itemsPerSecond: number
): TransformStream<T, T> {
  const intervalMs = 1000 / itemsPerSecond;
  let lastEmitTime = 0;

  return new TransformStream({
    async transform(chunk, controller) {
      const now = Date.now();
      const elapsed = now - lastEmitTime;
      if (elapsed < intervalMs) {
        await new Promise((r) => setTimeout(r, intervalMs - elapsed));
      }
      lastEmitTime = Date.now();
      controller.enqueue(chunk);
    },
  });
}
```

---

### 3.4 背压控制（Backpressure）

```typescript
// ===== 背压感知生产者 =====
function createBackpressureStream<T>(
  producer: () => Promise<T | null>
): ReadableStream<T> {
  return new ReadableStream({
    async pull(controller) {
      try {
        const item = await producer();
        if (item === null) {
          controller.close();
        } else {
          // enqueue 在内部队列满时会返回 false，表示背压触发
          const canAccept = controller.enqueue(item);
          if (!canAccept) {
            console.log('Backpressure applied: consumer is slow');
          }
        }
      } catch (error) {
        controller.error(error);
      }
    },

    // 通过 highWaterMark 配置内部队列大小
  }, { highWaterMark: 4 });
}

// ===== 使用 CountQueuingStrategy 自定义队列策略 =====
function createBufferedStream(): ReadableStream<Uint8Array> {
  return new ReadableStream({
    start(controller) {
      // 模拟生产数据
      for (let i = 0; i < 100; i++) {
        const data = new TextEncoder().encode(`Chunk ${i}\n`);
        controller.enqueue(data);
      }
      controller.close();
    },
  }, {
    // 字节流策略：按字节而非按 chunk 计数
    highWaterMark: 1024, // 1024 bytes
    size(chunk) {
      return chunk.byteLength;
    },
  });
}
```

---

### 3.5 常见陷阱

| 陷阱 | 说明 | 解决方案 |
|------|------|----------|
| **未释放 reader 锁** | 获取 reader 后未 `releaseLock()`，导致流被锁定 | `finally` 中始终释放锁 |
| **错误未传播** | TransformStream 中抛错未调用 `controller.error()` | 在 `try/catch` 中调用 `controller.error(err)` |
| **背压被忽略** | `enqueue()` 返回 `false` 时未暂停生产 | 检查返回值，必要时暂停读取 |
| **流只能 tee 一次** | `ReadableStream.tee()` 后原流不可用 | 设计阶段规划好流分支策略 |
| **不支持同步枚举** | Stream 是异步的，不能用 `for...of` | 使用 `for await...of` 配合 async generator |

---

## 4. Canvas API

Canvas API 提供通过 JavaScript 和 HTML `<canvas>` 元素绘制图形的能力。2D 上下文是浏览器中位图渲染的主要手段。

### 4.1 2D 上下文基础

```typescript
// ===== 类型安全的 Canvas 初始化 =====
function getCanvas2DContext(
  canvas: HTMLCanvasElement,
  options?: CanvasRenderingContext2DSettings
): CanvasRenderingContext2D {
  const ctx = canvas.getContext('2d', options);
  if (!ctx) {
    throw new Error('Failed to get 2D context');
  }
  return ctx;
}

// ===== 高清屏（DPR）适配 =====
function setupHiDPICanvas(
  canvas: HTMLCanvasElement,
  cssWidth: number,
  cssHeight: number
): CanvasRenderingContext2D {
  const dpr = window.devicePixelRatio || 1;

  // 实际像素尺寸 = CSS 尺寸 × DPR
  canvas.width = cssWidth * dpr;
  canvas.height = cssHeight * dpr;

  // CSS 显示尺寸保持不变
  canvas.style.width = `${cssWidth}px`;
  canvas.style.height = `${cssHeight}px`;

  const ctx = getCanvas2DContext(canvas);
  // 所有绘制操作统一缩放，保证线条清晰
  ctx.scale(dpr, dpr);

  return ctx;
}

// ===== 状态栈管理 =====
function renderWithSavedState(
  ctx: CanvasRenderingContext2D,
  renderFn: (ctx: CanvasRenderingContext2D) => void
): void {
  ctx.save();      // 保存当前状态（变换矩阵、裁剪区域、样式等）
  renderFn(ctx);
  ctx.restore();   // 恢复之前保存的状态
}

// ===== 绘制基础示例 =====
function drawBasicShapes(ctx: CanvasRenderingContext2D): void {
  // 矩形
  ctx.fillStyle = '#3498db';
  ctx.fillRect(10, 10, 100, 80);

  ctx.strokeStyle = '#2c3e50';
  ctx.lineWidth = 2;
  ctx.strokeRect(10, 10, 100, 80);

  // 圆
  ctx.beginPath();
  ctx.arc(200, 50, 40, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(231, 76, 60, 0.7)';
  ctx.fill();
  ctx.stroke();

  // 文字
  ctx.font = '16px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fff';
  ctx.fillText('Canvas', 200, 50);
}
```

---

### 4.2 路径与绘制

```typescript
// ===== 复杂路径绘制 =====
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

// ===== 贝塞尔曲线 =====
function drawBezierCurve(
  ctx: CanvasRenderingContext2D,
  start: [number, number],
  cp1: [number, number],
  cp2: [number, number],
  end: [number, number]
): void {
  ctx.beginPath();
  ctx.moveTo(...start);
  ctx.bezierCurveTo(...cp1, ...cp2, ...end);
  ctx.strokeStyle = '#e74c3c';
  ctx.lineWidth = 3;
  ctx.stroke();

  // 绘制控制点（调试用）
  ctx.fillStyle = 'rgba(52, 152, 219, 0.3)';
  [cp1, cp2].forEach(([px, py]) => {
    ctx.beginPath();
    ctx.arc(px, py, 4, 0, Math.PI * 2);
    ctx.fill();
  });
}

// ===== 虚线与样式 =====
function drawStyledLines(ctx: CanvasRenderingContext2D): void {
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // 虚线
  ctx.setLineDash([10, 5, 2, 5]); // 10px 画, 5px 空, 2px 画, 5px 空
  ctx.strokeStyle = '#9b59b6';
  ctx.beginPath();
  ctx.moveTo(50, 200);
  ctx.lineTo(250, 200);
  ctx.stroke();
  ctx.setLineDash([]); // 恢复实线

  // 渐变
  const gradient = ctx.createLinearGradient(50, 250, 250, 250);
  gradient.addColorStop(0, '#3498db');
  gradient.addColorStop(0.5, '#2ecc71');
  gradient.addColorStop(1, '#f1c40f');

  ctx.fillStyle = gradient;
  ctx.fillRect(50, 230, 200, 40);

  // 阴影
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 5;
  ctx.shadowOffsetY = 5;
  ctx.fillStyle = '#e74c3c';
  ctx.fillRect(50, 300, 100, 60);
  ctx.shadowColor = 'transparent'; // 清除阴影
}
```

---

### 4.3 图像处理

```typescript
// ===== 图像加载与绘制 =====
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // 允许跨域像素读取
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// ===== 裁剪与合成 =====
async function drawClippedImage(
  ctx: CanvasRenderingContext2D,
  imageSrc: string,
  clipX: number,
  clipY: number,
  clipRadius: number
): Promise<void> {
  const img = await loadImage(imageSrc);

  ctx.save();
  ctx.beginPath();
  ctx.arc(clipX, clipY, clipRadius, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip(); // 之后的绘制只在路径内生效

  ctx.drawImage(img, clipX - clipRadius, clipY - clipRadius, clipRadius * 2, clipRadius * 2);
  ctx.restore();
}

// ===== 像素级图像处理 =====
interface PixelData {
  data: Uint8ClampedArray;
  width: number;
  height: number;
}

function getPixelData(ctx: CanvasRenderingContext2D): PixelData {
  return ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
}

function applyGrayscale(imageData: ImageData): ImageData {
  const { data } = imageData;
  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    data[i] = gray;     // R
    data[i + 1] = gray; // G
    data[i + 2] = gray; // B
    // data[i + 3] = alpha（保持不变）
  }
  return imageData;
}

function processImageOnCanvas(
  canvas: HTMLCanvasElement,
  processor: (data: ImageData) => ImageData
): void {
  const ctx = getCanvas2DContext(canvas);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const processed = processor(imageData);
  ctx.putImageData(processed, 0, 0);
}

// ===== 离屏 Canvas（OffscreenCanvas）=====
function createOffscreenProcessor(
  width: number,
  height: number
): {
  process(source: CanvasImageSource): ImageBitmap;
} {
  const offscreen = new OffscreenCanvas(width, height);
  const ctx = offscreen.getContext('2d')!;

  return {
    process(source: CanvasImageSource): ImageBitmap {
      ctx.drawImage(source, 0, 0, width, height);
      // 可在此添加滤镜处理
      return offscreen.transferToImageBitmap();
    },
  };
}
```

---

### 4.4 性能优化

```typescript
// ===== 1. 避免频繁状态切换 =====
function renderOptimized(ctx: CanvasRenderingContext2D, items: RenderItem[]): void {
  // 按填充样式分组，减少 canvas 状态切换次数
  const grouped = groupBy(items, (item) => item.fillStyle);

  grouped.forEach((group, fillStyle) => {
    ctx.fillStyle = fillStyle;
    group.forEach((item) => {
      ctx.fillRect(item.x, item.y, item.w, item.h);
    });
  });
}

interface RenderItem {
  x: number; y: number; w: number; h: number; fillStyle: string;
}

function groupBy<T, K>(arr: T[], keyFn: (item: T) => K): Map<K, T[]> {
  const map = new Map<K, T[]>();
  arr.forEach((item) => {
    const key = keyFn(item);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(item);
  });
  return map;
}

// ===== 2. 使用 requestAnimationFrame 节流绘制 =====
class CanvasRenderer {
  private rafId: number | null = null;
  private needsRedraw = false;

  constructor(private renderFn: () => void) {}

  scheduleRender(): void {
    if (this.rafId !== null) return;
    this.rafId = requestAnimationFrame(() => {
      this.rafId = null;
      this.renderFn();
    });
  }

  cancel(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }
}

// ===== 3. 脏矩形检测（只重绘变化区域）=====
interface DirtyRect {
  x: number; y: number; w: number; h: number;
}

function mergeDirtyRects(rects: DirtyRect[]): DirtyRect[] {
  if (rects.length === 0) return [];
  // 简化实现：合并所有为一个全量矩形
  const xs = rects.map((r) => r.x);
  const ys = rects.map((r) => r.y);
  const rights = rects.map((r) => r.x + r.w);
  const bottoms = rects.map((r) => r.y + r.h);

  return [{
    x: Math.min(...xs),
    y: Math.min(...ys),
    w: Math.max(...rights) - Math.min(...xs),
    h: Math.max(...bottoms) - Math.min(...ys),
  }];
}

// ===== 4. 使用 willReadFrequently（频繁读取像素时）=====
function createFrequentReadCanvas(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  return getCanvas2DContext(canvas, { willReadFrequently: true });
}
```

---

### 4.5 常见陷阱

| 陷阱 | 说明 | 解决方案 |
|------|------|----------|
| **DPR 未适配** | 高清屏下 Canvas 模糊 | 按 `devicePixelRatio` 缩放 canvas 尺寸 |
| **未重置变换矩阵** | `scale`/`rotate` 后影响后续绘制 | 使用 `ctx.save()` / `ctx.restore()` |
| **跨域图像污染** | 无 `crossOrigin` 时无法读取像素 | 设置 `img.crossOrigin = 'anonymous'` 且服务端支持 CORS |
| **频繁 `getImageData`** | 触发 GPU → CPU 同步，阻塞渲染 | 合并像素操作，使用 `willReadFrequently` |
| **文字模糊** | 未对齐物理像素边界 | 坐标使用 `Math.floor(x) + 0.5` 或整数坐标 |
| **内存泄漏** | 大尺寸离屏 Canvas 未释放引用 | 及时将引用置为 `null`，依赖 GC |

---

## 5. WebGL

### 5.1 基础概念

WebGL（Web Graphics Library）是浏览器中执行 3D 和 2D 图形渲染的底层 API，基于 OpenGL ES 2.0/3.0 标准。它直接操作 GPU，通过着色器（Shader）程序实现并行图形计算。

```typescript
// ===== WebGL 上下文初始化 =====
function initWebGL(canvas: HTMLCanvasElement): WebGL2RenderingContext {
  const gl = canvas.getContext('webgl2', {
    alpha: false,
    antialias: true,
    premultipliedAlpha: false,
    preserveDrawingBuffer: false,
  });
  if (!gl) {
    throw new Error('WebGL2 not supported');
  }
  return gl;
}

// ===== 着色器编译 =====
function compileShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string
): WebGLShader {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Shader compile error: ${log}`);
  }
  return shader;
}

// ===== 基础顶点与片元着色器 =====
const VERTEX_SHADER_SOURCE = `#version 300 es
in vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

const FRAGMENT_SHADER_SOURCE = `#version 300 es
precision highp float;
out vec4 outColor;
void main() {
  outColor = vec4(1.0, 0.0, 0.0, 1.0); // 红色
}`;

// ===== 完整初始化流程 =====
function createProgram(
  gl: WebGL2RenderingContext,
  vsSource: string,
  fsSource: string
): WebGLProgram {
  const vs = compileShader(gl, gl.VERTEX_SHADER, vsSource);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, fsSource);

  const program = gl.createProgram()!;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(`Link error: ${gl.getProgramInfoLog(program)}`);
  }

  gl.deleteShader(vs);
  gl.deleteShader(fs);
  return program;
}

// ===== 缓冲区创建 =====
function createBuffer(
  gl: WebGL2RenderingContext,
  data: Float32Array,
  usage: number = gl.STATIC_DRAW
): WebGLBuffer {
  const buffer = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, usage);
  return buffer;
}
```

**关键概念速查**：

| 概念 | 说明 |
|------|------|
| **Vertex Shader（顶点着色器）** | 处理每个顶点的位置，输出裁剪空间坐标 |
| **Fragment Shader（片元着色器）** | 决定每个像素的颜色，支持纹理采样 |
| **VBO（Vertex Buffer Object）** | 存储顶点数据的 GPU 缓冲区 |
| **VAO（Vertex Array Object）** | 存储顶点属性配置状态，简化多对象切换 |
| **FBO（Frame Buffer Object）** | 离屏渲染目标，用于后处理效果 |
| **Uniform** | 全局变量，从 JS 向着色器传递数据 |
| **Attribute** | 顶点级别的输入变量 |

---

### 5.2 Three.js 简介

Three.js 是最流行的 WebGL 封装库，提供了场景图、相机、光照、材质、加载器等高级抽象，使 3D 开发无需直接编写 GLSL 着色器。

```typescript
import * as THREE from 'three';

// ===== 最小可运行的 Three.js 场景 =====
function createMinimalScene(canvas: HTMLCanvasElement): {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
} {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1a2e);

  const camera = new THREE.PerspectiveCamera(
    75,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    1000
  );
  camera.position.z = 5;

  // 立方体
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshStandardMaterial({ color: 0xe74c3c });
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  // 光照
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 5, 5);
  scene.add(directionalLight);

  // 动画循环
  function animate() {
    requestAnimationFrame(animate);
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);
  }
  animate();

  return { renderer, scene, camera };
}
```

**Three.js 核心模块速查**：

| 模块 | 用途 | 示例类 |
|------|------|--------|
| `three` (core) | 场景、相机、渲染器 | `Scene`, `PerspectiveCamera`, `WebGLRenderer` |
| `three/addons/controls/` | 交互控制 | `OrbitControls`, `FlyControls` |
| `three/addons/loaders/` | 模型/纹理加载 | `GLTFLoader`, `TextureLoader` |
| `three/addons/postprocessing/` | 后处理效果 | `EffectComposer`, `BloomPass` |
| `three/addons/helpers/` | 调试辅助 | `AxesHelper`, `GridHelper` |

---

### 5.3 常见陷阱

| 陷阱 | 说明 | 解决方案 |
|------|------|----------|
| **未处理上下文丢失** | 浏览器回收 GPU 资源导致 WebGL 失效 | 监听 `webglcontextlost` / `webglcontextrestored` |
| **Uniform 未更新** | 每帧修改 uniform 但未调用 `gl.uniform*` | 确保在正确 program 激活后更新 |
| **混合模式错误** | `premultipliedAlpha` 与 blending 不匹配 | 统一颜色空间处理策略 |
| **Three.js 内存泄漏** | Geometry/Material/Texture 未 dispose | 组件卸载时调用 `.dispose()` |
| **高精度 float 纹理** | WebGL1 不支持某些浮点纹理扩展 | 使用 WebGL2 或检查扩展可用性 |

---

## 6. Web Storage

### 6.1 localStorage 与 sessionStorage

```typescript
// ===== 类型安全的 Storage 封装 =====
class TypedStorage<T extends Record<string, unknown>> {
  constructor(private storage: Storage) {}

  set<K extends keyof T>(key: K, value: T[K]): void {
    try {
      const serialized = JSON.stringify(value);
      this.storage.setItem(String(key), serialized);
    } catch (e) {
      // 配额超限或循环引用
      console.error('Storage set failed:', e);
    }
  }

  get<K extends keyof T>(key: K): T[K] | null {
    const item = this.storage.getItem(String(key));
    if (item === null) return null;
    try {
      return JSON.parse(item) as T[K];
    } catch {
      return item as unknown as T[K];
    }
  }

  remove<K extends keyof T>(key: K): void {
    this.storage.removeItem(String(key));
  }

  clear(): void {
    this.storage.clear();
  }

  keys(): (keyof T)[] {
    return Array.from({ length: this.storage.length }, (_, i) =>
      this.storage.key(i) as keyof T
    );
  }

  getSize(): number {
    let total = 0;
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i) || '';
      const value = this.storage.getItem(key) || '';
      total += key.length + value.length;
    }
    return total * 2; // UTF-16，每个字符 2 bytes
  }
}

// 使用示例
interface AppStorage {
  'user:profile': { id: string; name: string; preferences: object };
  'app:theme': 'light' | 'dark' | 'system';
  'cache:recent': string[];
}

const local = new TypedStorage<AppStorage>(localStorage);
const session = new TypedStorage<AppStorage>(sessionStorage);

local.set('app:theme', 'dark');
const theme = local.get('app:theme');

// ===== Storage 事件（跨标签页同步）=====
window.addEventListener('storage', (e: StorageEvent) => {
  // 注意：此事件仅在其它标签页修改时触发，当前页不会收到
  console.log('Key changed:', e.key);
  console.log('Old value:', e.oldValue);
  console.log('New value:', e.newValue);
  console.log('Storage area:', e.storageArea === localStorage ? 'local' : 'session');
});
```

**核心差异**：

| 特性 | `localStorage` | `sessionStorage` |
|------|----------------|------------------|
| 生命周期 | 持久化，除非手动清除 | 页面会话结束（标签页关闭） |
| 作用域 | 同源（协议+域名+端口） | 同源 + 同一标签页 |
| 容量 | 约 5-10 MB | 约 5-10 MB |
| 同步事件 | `storage` 事件跨标签页 | 无跨标签页事件 |

---

### 6.2 IndexedDB 概览

IndexedDB 是浏览器中的结构化 NoSQL 数据库，适合存储大量数据、二进制文件和需要索引查询的场景。

```typescript
// ===== 基于 Promise 的 IndexedDB 封装 =====
class IndexedDBClient {
  private db: IDBDatabase | null = null;

  constructor(
    private dbName: string,
    private version: number,
    private onUpgrade: (db: IDBDatabase, oldVersion: number) => void
  ) {}

  async open(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
      request.onupgradeneeded = (event) => {
        this.onUpgrade(request.result, event.oldVersion);
      };
    });
  }

  async transaction<T>(
    storeNames: string | string[],
    mode: IDBTransactionMode,
    operation: (transaction: IDBTransaction) => Promise<T>
  ): Promise<T> {
    const db = await this.open();
    const transaction = db.transaction(storeNames, mode);
    return operation(transaction);
  }

  async get<T>(storeName: string, key: IDBValidKey): Promise<T | undefined> {
    return this.transaction(storeName, 'readonly', (tx) =>
      promisifyRequest<T | undefined>(tx.objectStore(storeName).get(key))
    );
  }

  async put<T>(storeName: string, value: T, key?: IDBValidKey): Promise<IDBValidKey> {
    return this.transaction(storeName, 'readwrite', (tx) =>
      promisifyRequest<IDBValidKey>(tx.objectStore(storeName).put(value, key))
    );
  }

  async delete(storeName: string, key: IDBValidKey): Promise<void> {
    return this.transaction(storeName, 'readwrite', (tx) =>
      promisifyRequest<void>(tx.objectStore(storeName).delete(key))
    );
  }

  async getAll<T>(storeName: string, query?: IDBValidKey | IDBKeyRange): Promise<T[]> {
    return this.transaction(storeName, 'readonly', (tx) =>
      promisifyRequest<T[]>(tx.objectStore(storeName).getAll(query))
    );
  }

  close(): void {
    this.db?.close();
    this.db = null;
  }
}

function promisifyRequest<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// ===== 使用示例：文档数据库 =====
interface DocumentRecord {
  id: string;
  title: string;
  content: string;
  tags: string[];
  updatedAt: number;
}

const docDB = new IndexedDBClient('documents', 1, (db, oldVersion) => {
  if (oldVersion < 1) {
    const store = db.createObjectStore('docs', { keyPath: 'id' });
    store.createIndex('byTitle', 'title', { unique: false });
    store.createIndex('byTag', 'tags', { unique: false, multiEntry: true });
    store.createIndex('byDate', 'updatedAt', { unique: false });
  }
});

async function demoIndexedDB(): Promise<void> {
  await docDB.put('docs', {
    id: 'doc-1',
    title: 'Hello IndexedDB',
    content: '...',
    tags: ['database', 'browser'],
    updatedAt: Date.now(),
  });

  const doc = await docDB.get<DocumentRecord>('docs', 'doc-1');
  console.log(doc);
}
```

**Storage 选型决策**：

| 场景 | 推荐方案 |
|------|----------|
| 用户偏好设置 | `localStorage` |
| 临时表单数据 | `sessionStorage` |
| 大量结构化数据（> 5MB） | IndexedDB |
| 需要索引和查询 | IndexedDB |
| 二进制文件缓存 | IndexedDB + Blob |
| 关键会话令牌 | `sessionStorage` 或 Cookie（HttpOnly） |

---

### 6.3 常见陷阱

| 陷阱 | 说明 | 解决方案 |
|------|------|----------|
| **Storage 事件不触发于当前页** | 当前页修改 storage 不会触发自身事件 | 手动派发 `window.dispatchEvent(new StorageEvent(...))` |
| **localStorage 阻塞主线程** | 读写是同步的，大数据量导致卡顿 | 大数据用 IndexedDB，或分片序列化 |
| **超出配额** | 静默失败或抛 `QuotaExceededError` | `try/catch` 并监控使用量 |
| **存储敏感数据** | localStorage 可被 XSS 读取 | 敏感数据存 HttpOnly Cookie |
| **IndexedDB 版本升级复杂** | 不能降级，schema 变更需谨慎 | 设计版本升级函数链，测试覆盖 |

---

## 7. Service Worker

Service Worker 是浏览器在后台运行的脚本，充当 Web 应用、浏览器与网络之间的代理层。它是 PWA（渐进式 Web 应用）的核心技术。

### 7.1 生命周期

```typescript
// ===== Service Worker 注册（主线程）=====
async function registerServiceWorker(scriptUrl: string): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Worker not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register(scriptUrl, {
      scope: '/',
      updateViaCache: 'imports', // 对 importScripts 使用 HTTP 缓存
    });

    // 监听状态变化
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        console.log('Service Worker state:', newWorker.state);
        // states: installing -> installed -> activating -> activated -> redundant
      });
    });

    return registration;
  } catch (error) {
    console.error('SW registration failed:', error);
    return null;
  }
}

// ===== Service Worker 脚本（sw.ts）=====
/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

const CACHE_NAME = 'app-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/icon.png',
];

// ===== Install 阶段：预缓存核心资源 =====
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => {
      // 立即激活，无需等待旧 SW 控制的所有页面关闭
      return self.skipWaiting();
    })
  );
});

// ===== Activate 阶段：清理旧缓存 =====
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => {
      // 立即接管页面控制权
      return self.clients.claim();
    })
  );
});

// ===== Fetch 阶段：拦截网络请求 =====
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // 只处理 GET 请求
  if (request.method !== 'GET') return;

  // 导航请求（页面加载）使用 Network First
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }

  // 静态资源使用 Cache First
  if (STATIC_ASSETS.some((url) => request.url.includes(url))) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // API 请求使用 Stale While Revalidate
  if (request.url.includes('/api/')) {
    event.respondWith(staleWhileRevalidate(request));
  }
});

// ===== 缓存策略实现 =====

async function cacheFirst(request: Request): Promise<Response> {
  const cached = await caches.match(request);
  if (cached) return cached;

  const networkResponse = await fetch(request);
  if (networkResponse.ok) {
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, networkResponse.clone());
  }
  return networkResponse;
}

async function networkFirst(request: Request): Promise<Response> {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    throw new Error('Network and cache both failed');
  }
}

async function staleWhileRevalidate(request: Request): Promise<Response> {
  const cached = await caches.match(request);

  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      caches.open(CACHE_NAME).then((cache) => {
        cache.put(request, networkResponse.clone());
      });
    }
    return networkResponse;
  });

  // 立即返回缓存，同时在后台更新
  return cached || fetchPromise;
}
```

---

### 7.2 缓存策略

```typescript
// ===== 缓存策略决策矩阵 =====
type CacheStrategy =
  | 'cache-first'
  | 'network-first'
  | 'stale-while-revalidate'
  | 'network-only'
  | 'cache-only';

interface StrategyConfig {
  strategy: CacheStrategy;
  maxAge?: number;        // 缓存最大有效期（毫秒）
  maxEntries?: number;    // 最大缓存条目数
}

const STRATEGY_REGISTRY: Record<string, StrategyConfig> = {
  '/api/users': { strategy: 'stale-while-revalidate', maxAge: 60000 },
  '/api/dashboard': { strategy: 'network-first', maxAge: 30000 },
  '/static/': { strategy: 'cache-first' },
  '/api/realtime': { strategy: 'network-only' },
};

// ===== 带 TTL 的缓存条目 =====
interface CacheEntry {
  response: Response;
  timestamp: number;
}

async function getWithTTL(
  request: Request,
  maxAge: number
): Promise<Response | undefined> {
  const cached = await caches.match(request);
  if (!cached) return undefined;

  const timestamp = cached.headers.get('sw-cached-at');
  if (!timestamp) return cached;

  const age = Date.now() - parseInt(timestamp, 10);
  if (age > maxAge) {
    // 缓存过期，返回 undefined 让调用方走网络
    return undefined;
  }
  return cached;
}

async function putWithTTL(request: Request, response: Response): Promise<void> {
  const headers = new Headers(response.headers);
  headers.set('sw-cached-at', String(Date.now()));

  const newResponse = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });

  const cache = await caches.open(CACHE_NAME);
  await cache.put(request, newResponse);
}
```

---

### 7.3 Background Sync

```typescript
// ===== 主线程：注册后台同步 =====
async function registerBackgroundSync(tag: string): Promise<void> {
  const registration = await navigator.serviceWorker.ready;

  if ('sync' in registration) {
    await (registration as ServiceWorkerRegistration & {
      sync: { register(tag: string): Promise<void> };
    }).sync.register(tag);
  } else {
    // 降级：立即尝试发送
    console.warn('Background Sync not supported, falling back');
  }
}

// 使用示例：离线时保存操作，恢复网络后自动同步
async function submitForm(data: FormData): Promise<void> {
  try {
    await fetch('/api/submit', { method: 'POST', body: data });
  } catch {
    // 保存到 IndexedDB，注册后台同步
    await saveToOutbox(data);
    await registerBackgroundSync('sync-outbox');
  }
}

// ===== Service Worker 中处理 sync 事件 =====
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-outbox') {
    event.waitUntil(syncOutbox());
  }
});

async function syncOutbox(): Promise<void> {
  // 从 IndexedDB 读取待发送队列
  const outbox = await getOutboxItems();

  for (const item of outbox) {
    try {
      await fetch(item.url, {
        method: item.method,
        body: item.body,
        headers: item.headers,
      });
      await removeFromOutbox(item.id);
    } catch (error) {
      console.error('Sync failed for item:', item.id);
      // 保留在队列中，下次 sync 重试
    }
  }
}
```

---

### 7.4 常见陷阱

| 陷阱 | 说明 | 解决方案 |
|------|------|----------|
| **HTTPS 强制要求** | Service Worker 仅在安全上下文（HTTPS/localhost）可用 | 开发环境使用 localhost，生产必须 HTTPS |
| **作用域限制** | SW 只能拦截 `scope` 下的请求 | 注册时正确设置 scope，部署在站点根目录 |
| **缓存永不过期** | Cache API 无内置 TTL | 手动添加时间戳头，activate 阶段清理旧缓存 |
| **更新 stuck** | 旧 SW 一直控制页面，新版无法激活 | 调用 `skipWaiting()` + `clients.claim()` |
| **Opaque Response** | 跨域资源 `response.type === 'opaque'`，status 为 0 | 使用 CORS 模式请求，或接受无法读取 status |
| **fetch 事件未拦截** | 对 navigation 请求的 `event.respondWith` 必须在同步代码中调用 | 确保 `event.respondWith()` 在事件处理函数顶层调用 |

---

## 8. Web Workers

Web Workers 允许在后台线程中运行脚本，不阻塞主线程 UI 渲染和用户交互。

### 8.1 Dedicated Worker

```typescript
// ===== 主线程：创建 Dedicated Worker =====
class WorkerPool {
  private workers: Worker[] = [];
  private queue: Array<{
    id: string;
    payload: unknown;
    resolve: (value: unknown) => void;
    reject: (reason: unknown) => void;
  }> = [];
  private taskMap = new Map<string, typeof this.queue[0]>();

  constructor(workerScript: string | URL, poolSize: number = navigator.hardwareConcurrency || 4) {
    for (let i = 0; i < poolSize; i++) {
      const worker = new Worker(workerScript, { type: 'module' });
      worker.onmessage = (e) => this.handleMessage(e);
      worker.onerror = (e) => this.handleError(e);
      this.workers.push(worker);
    }
  }

  private handleMessage(event: MessageEvent<{ id: string; result?: unknown; error?: string }>): void {
    const { id, result, error } = event.data;
    const task = this.taskMap.get(id);
    if (!task) return;

    this.taskMap.delete(id);
    if (error) {
      task.reject(new Error(error));
    } else {
      task.resolve(result);
    }
    this.processQueue();
  }

  private handleError(event: ErrorEvent): void {
    console.error('Worker error:', event.message);
  }

  execute<T>(payload: unknown): Promise<T> {
    return new Promise((resolve, reject) => {
      const id = crypto.randomUUID();
      const task = { id, payload, resolve, reject };
      this.taskMap.set(id, task);
      this.queue.push(task);
      this.processQueue();
    });
  }

  private processQueue(): void {
    if (this.queue.length === 0) return;
    const availableWorker = this.workers.find((w) => !(w as unknown as { _busy: boolean })._busy);
    if (!availableWorker) return;

    const task = this.queue.shift()!;
    (availableWorker as unknown as { _busy: boolean })._busy = true;
    availableWorker.postMessage({ id: task.id, payload: task.payload });

    // 标记为非 busy（简化版，实际应基于消息响应）
    const originalOnMessage = availableWorker.onmessage;
    availableWorker.onmessage = (e) => {
      (availableWorker as unknown as { _busy: boolean })._busy = false;
      originalOnMessage?.call(availableWorker, e);
    };
  }

  terminate(): void {
    this.workers.forEach((w) => w.terminate());
    this.workers = [];
    this.queue = [];
    this.taskMap.clear();
  }
}

// ===== Worker 线程（worker.ts）=====
/// <reference lib="webworker" />

interface WorkerTask {
  id: string;
  payload: unknown;
}

self.addEventListener('message', (event: MessageEvent<WorkerTask>) => {
  const { id, payload } = event.data;

  try {
    const result = processTask(payload);
    self.postMessage({ id, result });
  } catch (error) {
    self.postMessage({
      id,
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

function processTask(payload: unknown): unknown {
  // 示例：大数据排序
  if (Array.isArray(payload) && payload.every((x) => typeof x === 'number')) {
    return (payload as number[]).sort((a, b) => a - b);
  }
  return payload;
}
```

---

### 8.2 Shared Worker

Shared Worker 可被多个浏览上下文（标签页、iframe）共享，适合跨标签页状态同步。

```typescript
// ===== 主线程：连接 Shared Worker =====
const sharedWorker = new SharedWorker('/shared-worker.js', { type: 'module' });

sharedWorker.port.start();

sharedWorker.port.postMessage({ type: 'connect', clientId: crypto.randomUUID() });

sharedWorker.port.onmessage = (event) => {
  console.log('Message from shared worker:', event.data);
};

// ===== Shared Worker 线程（shared-worker.ts）=====
/// <reference lib="webworker" />
declare const self: SharedWorkerGlobalScope;

const connections: MessagePort[] = [];

self.addEventListener('connect', (event) => {
  const port = event.ports[0];
  connections.push(port);

  port.addEventListener('message', (e) => {
    if (e.data.type === 'broadcast') {
      // 向所有连接的客户端广播
      connections.forEach((conn) => {
        if (conn !== port) {
          conn.postMessage({
            type: 'broadcast',
            from: e.data.clientId,
            data: e.data.payload,
          });
        }
      });
    }
  });

  port.start();
});
```

**兼容性提示**：Shared Worker 在 Safari（iOS 所有浏览器）中不支持。生产环境需设计降级方案。

---

### 8.3 与 Node.js Worker Threads 对比

| 特性 | Web Workers（浏览器） | Node.js Worker Threads |
|------|----------------------|------------------------|
| 全局对象 | `self` / `globalThis` | `self` / `globalThis` / `parentPort` |
| 模块系统 | ES Modules（`type: 'module'`） | CommonJS / ESM |
| 通信机制 | `postMessage` + Structured Clone | `postMessage` + Structured Clone / SharedArrayBuffer |
| DOM 访问 | ❌ 不可访问 | N/A（无 DOM） |
| `require`/`fs` | ❌ 不可用 | ✅ 完全可用 |
| 共享 Worker | ✅ SharedWorker | ❌ 不支持 |
| 创建方式 | `new Worker(url)` | `new Worker(filename)` / `new Worker(new URL(...))` |
| 终止方式 | `worker.terminate()` | `worker.terminate()` / `await worker.terminate()` |

---

### 8.4 常见陷阱

| 陷阱 | 说明 | 解决方案 |
|------|------|----------|
| **无法直接访问 DOM** | Worker 中 `document` / `window` 为 undefined | 将 DOM 操作逻辑保留在主线程 |
| **Structured Clone 限制** | 不能传递函数、DOM 节点、循环引用 | 序列化数据，使用 Transferable Objects（ArrayBuffer） |
| **相对路径解析** | Worker 脚本 URL 相对于当前页面 | 使用 `new URL('./worker.ts', import.meta.url)`（构建工具处理） |
| **iOS Safari 不支持 Shared Worker** | 所有 iOS 浏览器（WebKit 限制） | 使用 BroadcastChannel + Dedicated Worker 模拟 |
| **内存泄漏** | 未 terminate 的 Worker 持续占用内存 | 组件卸载或任务完成后调用 `terminate()` |
| **错误信息丢失** | Worker 中抛错主线程仅收到 `ErrorEvent` | 在 Worker 内 `try/catch`，通过 `postMessage` 发送结构化错误 |

---

## 9. Notification API

### 9.1 权限请求与通知创建

```typescript
// ===== Notification 管理器 =====
class NotificationManager {
  private permission: NotificationPermission = 'default';

  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      this.permission = 'granted';
      return 'granted';
    }

    this.permission = await Notification.requestPermission();
    return this.permission;
  }

  async show(options: {
    title: string;
    body?: string;
    icon?: string;
    badge?: string;
    tag?: string;
    requireInteraction?: boolean;
    actions?: NotificationAction[];
    data?: unknown;
  }): Promise<Notification | null> {
    if (this.permission !== 'granted') {
      const result = await this.requestPermission();
      if (result !== 'granted') return null;
    }

    const notification = new Notification(options.title, {
      body: options.body,
      icon: options.icon,
      badge: options.badge,
      tag: options.tag,
      requireInteraction: options.requireInteraction,
      actions: options.actions,
      data: options.data,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
      console.log('Notification clicked:', options.data);
    };

    return notification;
  }
}

// ===== Service Worker 推送通知 =====
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? { title: 'New Notification' };

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon-192.png',
      badge: '/badge-72.png',
      tag: data.tag || 'default',
      requireInteraction: data.requireInteraction ?? false,
      actions: data.actions || [],
      data: data.payload,
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientList) => {
      // 如果已有窗口打开，聚焦它
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return (client as WindowClient).focus();
        }
      }
      // 否则打开新窗口
      return self.clients.openWindow('/');
    })
  );
});
```

---

### 9.2 常见陷阱

| 陷阱 | 说明 | 解决方案 |
|------|------|----------|
| **HTTPS 要求** | Notification API 要求安全上下文 | localhost 可用于开发，生产必须 HTTPS |
| **iOS 限制** | iOS 16.4+ 才支持 Web Push，且必须添加到主屏幕 | 检测 `navigator.standalone`，引导用户安装 PWA |
| **权限被永久拒绝** | 用户点击 "Block" 后无法再次弹出请求 | 提供 UI 引导用户去浏览器设置中修改 |
| **通知被系统静默** | 操作系统级别免打扰或专注模式 | 无法绕过，设计降级体验 |

---

## 10. Clipboard API

### 10.1 读写剪贴板

```typescript
// ===== 类型安全的 Clipboard 封装 =====
class ClipboardManager {
  async writeText(text: string): Promise<void> {
    if (!navigator.clipboard) {
      // 降级：使用 document.execCommand
      this.fallbackWriteText(text);
      return;
    }
    await navigator.clipboard.writeText(text);
  }

  async readText(): Promise<string> {
    if (!navigator.clipboard) {
      throw new Error('Clipboard API not supported');
    }
    return navigator.clipboard.readText();
  }

  async writeHTML(html: string, plainText?: string): Promise<void> {
    if (!navigator.clipboard) {
      throw new Error('Clipboard API not supported');
    }

    const blobHTML = new Blob([html], { type: 'text/html' });
    const blobText = new Blob([plainText || html.replace(/<[^>]*>/g, '')], {
      type: 'text/plain',
    });

    const item = new ClipboardItem({
      'text/html': blobHTML,
      'text/plain': blobText,
    });

    await navigator.clipboard.write([item]);
  }

  async writeImage(blob: Blob): Promise<void> {
    if (!navigator.clipboard) {
      throw new Error('Clipboard API not supported');
    }
    const item = new ClipboardItem({ [blob.type]: blob });
    await navigator.clipboard.write([item]);
  }

  private fallbackWriteText(text: string): void {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }
}

// ===== 从 Canvas 复制图像到剪贴板 =====
async function copyCanvasToClipboard(canvas: HTMLCanvasElement): Promise<void> {
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/png')
  );
  if (!blob) throw new Error('Canvas to Blob failed');

  const manager = new ClipboardManager();
  await manager.writeImage(blob);
}
```

---

### 10.2 常见陷阱

| 陷阱 | 说明 | 解决方案 |
|------|------|----------|
| **需要用户手势** | `writeText` / `readText` 必须在用户触发的事件处理中调用 | 确保调用链源自 click/keypress 事件 |
| **权限提示** | `readText()` 和 `read()` 会触发权限弹窗 | 仅在明确用户意图时读取剪贴板 |
| **iOS Safari 限制** | 部分 Clipboard 功能受限 | 测试具体 iOS 版本，准备降级方案 |
| **Firefox 限制** | `readText()` 在 HTTP 中不可用，且对 `read()` 支持有限 | 使用 HTTPS，降级到 `execCommand` |

---

## 11. File API

### 11.1 FileReader 与 Blob

```typescript
// ===== 类型安全的文件读取 =====
type ReadAsType = 'text' | 'dataURL' | 'arrayBuffer' | 'binaryString';

function readFile(file: Blob, as: 'text'): Promise<string>;
function readFile(file: Blob, as: 'dataURL'): Promise<string>;
function readFile(file: Blob, as: 'arrayBuffer'): Promise<ArrayBuffer>;
function readFile(file: Blob, as: ReadAsType): Promise<string | ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result as string | ArrayBuffer);
    reader.onerror = () => reject(reader.error);

    switch (as) {
      case 'text':
        reader.readAsText(file);
        break;
      case 'dataURL':
        reader.readAsDataURL(file);
        break;
      case 'arrayBuffer':
        reader.readAsArrayBuffer(file);
        break;
      case 'binaryString':
        reader.readAsBinaryString(file);
        break;
    }
  });
}

// ===== Blob 操作工具 =====
class BlobUtil {
  static async slice(blob: Blob, start: number, end: number): Promise<Blob> {
    return blob.slice(start, end, blob.type);
  }

  static async merge(blobs: Blob[], type?: string): Promise<Blob> {
    return new Blob(blobs, { type: type || blobs[0]?.type });
  }

  static createFromText(text: string, type: string = 'text/plain'): Blob {
    return new Blob([text], { type });
  }

  static download(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

// ===== 大文件分片上传 =====
interface FileChunk {
  index: number;
  total: number;
  blob: Blob;
  hash: string;
}

async function* createFileChunks(
  file: File,
  chunkSize: number = 1024 * 1024 // 1MB
): AsyncGenerator<FileChunk> {
  const total = Math.ceil(file.size / chunkSize);

  for (let i = 0; i < total; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, file.size);
    const blob = file.slice(start, end);

    // 计算 chunk hash（简化示例，实际使用 crypto.subtle）
    const buffer = await blob.arrayBuffer();
    const hash = await crypto.subtle.digest('SHA-256', buffer);
    const hashHex = Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    yield { index: i, total, blob, hash: hashHex };
  }
}
```

---

### 11.2 File System Access API

File System Access API 允许 Web 应用直接与用户本地文件系统交互，打开、编辑和保存文件。

```typescript
// ===== 打开文件 =====
async function openImageFile(): Promise<{
  file: File;
  handle: FileSystemFileHandle;
} | null> {
  if (!('showOpenFilePicker' in window)) {
    console.warn('File System Access API not supported');
    return null;
  }

  const [handle] = await window.showOpenFilePicker({
    types: [
      {
        description: 'Images',
        accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
      },
    ],
    multiple: false,
  });

  const file = await handle.getFile();
  return { file, handle };
}

// ===== 保存文件（可覆盖原文件）=====
async function saveToFile(
  handle: FileSystemFileHandle | undefined,
  content: string | Blob,
  suggestedName?: string
): Promise<void> {
  let fileHandle = handle;

  if (!fileHandle) {
    if (!('showSaveFilePicker' in window)) {
      // 降级：直接下载
      BlobUtil.download(
        content instanceof Blob ? content : BlobUtil.createFromText(content),
        suggestedName || 'download.txt'
      );
      return;
    }

    fileHandle = await window.showSaveFilePicker({
      suggestedName,
      types: [{ accept: { 'text/plain': ['.txt'] } }],
    });
  }

  const writable = await fileHandle.createWritable();
  await writable.write(content);
  await writable.close();
}

// ===== 读取目录 =====
async function readDirectory(): Promise<FileSystemDirectoryHandle | null> {
  if (!('showDirectoryPicker' in window)) {
    console.warn('Directory picker not supported');
    return null;
  }

  const dirHandle = await window.showDirectoryPicker();

  for await (const [name, handle] of dirHandle.entries()) {
    console.log(name, handle.kind); // 'file' | 'directory'
  }

  return dirHandle;
}

// ===== 请求持久化权限 =====
async function verifyPermission(
  fileHandle: FileSystemFileHandle,
  mode: 'read' | 'readwrite' = 'readwrite'
): Promise<boolean> {
  const options: FileSystemHandlePermissionDescriptor = { mode };

  if ((await fileHandle.queryPermission(options)) === 'granted') {
    return true;
  }

  if ((await fileHandle.requestPermission(options)) === 'granted') {
    return true;
  }

  return false;
}
```

**兼容性提示**：File System Access API 目前为 Chrome/Edge 特性（2026 年 4 月），Firefox 和 Safari 支持有限。生产环境必须提供 `<input type="file">` 降级方案。

---

### 11.3 常见陷阱

| 陷阱 | 说明 | 解决方案 |
|------|------|----------|
| **FileReader 同步读取阻塞** | 大文件读取时内存占用高 | 使用 `Blob.slice()` 分片，流式处理 |
| **File System Access 仅部分浏览器** | Safari/Firefox 不支持 | 使用 `input[type=file]` 和 `download` 属性降级 |
| **对象 URL 未释放** | `URL.createObjectURL()` 创建的 URL 持续占用内存 | 使用 `URL.revokeObjectURL()` 释放 |
| **文件类型伪造** | 用户可修改文件扩展名，type 不可信 | 服务端或客户端通过文件头（magic number）校验 |
| **路径信息不可获取** | 出于隐私安全，`File` 对象不暴露完整路径 | 使用 File System Access API 的 handle 实现关联 |

---

## 12. Geolocation API

### 12.1 获取位置信息

```typescript
// ===== 类型安全的位置封装 =====
interface GeoPosition {
  latitude: number;
  longitude: number;
  accuracy: number;           // 精度（米）
  altitude: number | null;
  altitudeAccuracy: number | null;
  heading: number | null;     // 方向（度）
  speed: number | null;       // 速度（米/秒）
  timestamp: number;
}

class GeolocationManager {
  private watchId: number | null = null;

  async getCurrentPosition(options?: PositionOptions): Promise<GeoPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => resolve(this.normalizePosition(pos)),
        (err) => reject(new Error(`${err.code}: ${err.message}`)),
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 60000,
          ...options,
        }
      );
    });
  }

  watchPosition(
    callback: (position: GeoPosition) => void,
    errorCallback?: (error: GeolocationPositionError) => void,
    options?: PositionOptions
  ): void {
    if (!navigator.geolocation) {
      errorCallback?.({
        code: 2,
        message: 'Geolocation not supported',
      } as GeolocationPositionError);
      return;
    }

    this.watchId = navigator.geolocation.watchPosition(
      (pos) => callback(this.normalizePosition(pos)),
      errorCallback,
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0, ...options }
    );
  }

  clearWatch(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  private normalizePosition(pos: GeolocationPosition): GeoPosition {
    const { coords, timestamp } = pos;
    return {
      latitude: coords.latitude,
      longitude: coords.longitude,
      accuracy: coords.accuracy,
      altitude: coords.altitude,
      altitudeAccuracy: coords.altitudeAccuracy,
      heading: coords.heading,
      speed: coords.speed,
      timestamp,
    };
  }
}

// ===== 计算两点间距离（Haversine 公式）=====
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // 地球半径（米）
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
```

---

### 12.2 常见陷阱

| 陷阱 | 说明 | 解决方案 |
|------|------|----------|
| **HTTPS 强制要求** | 除 localhost 外，Geolocation 仅 HTTPS 可用 | 生产环境部署 HTTPS |
| **权限弹窗被阻止** | 用户永久拒绝后无法再次请求 | 检测权限状态，提供手动引导 UI |
| **高精度耗电** | `enableHighAccuracy: true` 显著增加电量消耗 | 按需开启，常规场景使用默认值 |
| **室内精度差** | GPS 在室内精度可能 > 100m | 结合 Wi-Fi / 基站定位，设置合理预期 |
| **watchPosition 未清理** | 持续回调导致内存泄漏和耗电 | 组件卸载或页面离开前调用 `clearWatch()` |

---

## 13. Observer APIs

Observer APIs 提供了一种高效监听 DOM、元素可见性和尺寸变化的方式，替代传统的轮询（polling）方案。

### 13.1 Intersection Observer

```typescript
// ===== 懒加载图片 =====
class LazyImageLoader {
  private observer: IntersectionObserver;
  private imageMap = new Map<Element, string>();

  constructor(options?: IntersectionObserverInit) {
    this.observer = new IntersectionObserver(
      (entries) => this.handleEntries(entries),
      {
        root: null,              // 视口
        rootMargin: '50px 0px',  // 提前 50px 触发
        threshold: 0.01,         // 可见 1% 即触发
        ...options,
      }
    );
  }

  observe(img: HTMLImageElement, src: string): void {
    img.dataset.src = src;
    this.imageMap.set(img, src);
    this.observer.observe(img);
  }

  private handleEntries(entries: IntersectionObserverEntry[]): void {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        const src = this.imageMap.get(img);
        if (src) {
          img.src = src;
          img.removeAttribute('data-src');
          this.imageMap.delete(img);
        }
        this.observer.unobserve(img);
      }
    });
  }

  disconnect(): void {
    this.observer.disconnect();
    this.imageMap.clear();
  }
}

// ===== 无限滚动检测 =====
function createInfiniteScrollObserver(
  sentinel: Element,
  onTrigger: () => void,
  options?: IntersectionObserverInit
): IntersectionObserver {
  return new IntersectionObserver((entries) => {
    const entry = entries[0];
    if (entry.isIntersecting) {
      onTrigger();
    }
  }, { rootMargin: '200px', ...options });
}

// ===== 广告可见性追踪（MRC 标准：50% 可见持续 1 秒）=====
class AdVisibilityTracker {
  private observer: IntersectionObserver;
  private visibleStartTime: number | null = null;
  private hasReported = false;

  constructor(
    private adElement: HTMLElement,
    private onViewable: () => void
  ) {
    this.observer = new IntersectionObserver(
      (entries) => this.handleVisibility(entries[0]),
      { threshold: [0, 0.5, 1] }
    );
    this.observer.observe(adElement);
  }

  private handleVisibility(entry: IntersectionObserverEntry): void {
    if (entry.intersectionRatio >= 0.5) {
      if (this.visibleStartTime === null) {
        this.visibleStartTime = Date.now();
        this.scheduleCheck();
      }
    } else {
      this.visibleStartTime = null;
    }
  }

  private scheduleCheck(): void {
    setTimeout(() => {
      if (this.hasReported) return;
      if (
        this.visibleStartTime !== null &&
        Date.now() - this.visibleStartTime >= 1000
      ) {
        this.hasReported = true;
        this.onViewable();
      }
    }, 1100);
  }

  destroy(): void {
    this.observer.disconnect();
  }
}
```

---

### 13.2 Resize Observer

```typescript
// ===== 元素尺寸响应式处理 =====
class ElementSizeWatcher {
  private observer: ResizeObserver;
  private callbacks = new Map<Element, (entry: ResizeObserverEntry) => void>();

  constructor() {
    this.observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const callback = this.callbacks.get(entry.target);
        callback?.(entry);
      }
    });
  }

  observe(
    element: Element,
    callback: (entry: ResizeObserverEntry) => void
  ): void {
    this.callbacks.set(element, callback);
    this.observer.observe(element, { box: 'border-box' });
  }

  unobserve(element: Element): void {
    this.callbacks.delete(element);
    this.observer.unobserve(element);
  }

  destroy(): void {
    this.observer.disconnect();
    this.callbacks.clear();
  }
}

// ===== Canvas 自适应容器尺寸 =====
function autoResizeCanvas(
  canvas: HTMLCanvasElement,
  container: HTMLElement,
  renderFn: () => void
): () => void {
  const watcher = new ElementSizeWatcher();

  watcher.observe(container, (entry) => {
    const { width, height } = entry.contentRect;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    ctx?.scale(dpr, dpr);
    renderFn();
  });

  return () => watcher.destroy();
}
```

---

### 13.3 Mutation Observer

```typescript
// ===== DOM 变更监听 =====
class DOMChangeWatcher {
  private observer: MutationObserver;

  constructor(
    target: Node,
    callback: (mutations: MutationRecord[]) => void,
    options?: MutationObserverInit
  ) {
    this.observer = new MutationObserver(callback);
    this.observer.observe(target, {
      childList: true,        // 监听子节点增删
      subtree: true,          // 监听整个子树
      attributes: true,       // 监听属性变化
      characterData: true,    // 监听文本内容变化
      attributeOldValue: true,
      characterDataOldValue: true,
      ...options,
    });
  }

  disconnect(): void {
    this.observer.disconnect();
  }

  takeRecords(): MutationRecord[] {
    return this.observer.takeRecords();
  }
}

// ===== 使用示例：监听动态内容加载 =====
function watchDynamicContent(container: HTMLElement): () => void {
  const watcher = new DOMChangeWatcher(
    container,
    (mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof HTMLElement && node.matches('img[data-src]')) {
              // 新图片加入，触发懒加载
              console.log('New lazy image added:', node);
            }
          });
        }
      });
    },
    { childList: true, subtree: true }
  );

  return () => watcher.disconnect();
}
```

---

### 13.4 常见陷阱

| 陷阱 | 说明 | 解决方案 |
|------|------|----------|
| **Intersection Observer 触发时机** | 元素尺寸为 0 或 `display: none` 时不触发 | 确保元素有布局尺寸 |
| **Resize Observer 无限循环** | 改变尺寸触发回调，回调中又改变尺寸 | 使用 `requestAnimationFrame` 节流，或比较新旧值 |
| **Mutation Observer 性能消耗** | `subtree: true` 在大 DOM 树上开销大 | 缩小观察范围，使用 `takeRecords()` 批量处理 |
| **回调异步执行** | Observer 回调在微任务队列中异步执行 | 不依赖同步执行顺序，或手动同步检查状态 |
| **旧浏览器兼容** | IE11 不支持任何 Observer API | 使用 polyfill 或降级到轮询方案 |

---

## 附录：兼容性速查表

| API | Chrome | Edge | Firefox | Safari | iOS Safari | 备注 |
|-----|--------|------|---------|--------|------------|------|
| Fetch API | 42+ | 14+ | 39+ | 10.1+ | 10.3+ | IE 需 polyfill |
| Streams API | 76+ | 79+ | 102+ | 全功能支持较晚 | 有限 | ReadableStream 支持较好 |
| AbortController | 66+ | 16+ | 57+ | 12.1+ | 12.2+ | — |
| Canvas 2D | 全版本 | 全版本 | 全版本 | 全版本 | 全版本 | `OffscreenCanvas` 支持较晚 |
| WebGL 2.0 | 56+ | 79+ | 51+ | 15+ | 15+ | WebGL1 广泛支持 |
| localStorage | 4+ | 全版本 | 3.5+ | 4+ | 全版本 | — |
| IndexedDB | 24+ | 全版本 | 16+ | 10+ | 8+ | — |
| Service Worker | 45+ | 17+ | 44+ | 11.3+ | 11.3+ | 需 HTTPS |
| Web Workers | 4+ | 全版本 | 3.5+ | 4+ | 全版本 | — |
| Shared Worker | 4+ | 全版本 | 29+ | 16+ | ❌ | iOS 不支持 |
| Notification | 22+ | 14+ | 22+ | 16.4+ | 16.4+ | 需用户授权 |
| Clipboard API | 66+ | 79+ | 63+ | 13.1+ | 13.4+ | 读操作权限严格 |
| File System Access | 86+ | 86+ | ❌ | ❌ | ❌ | 实验性 |
| Geolocation | 5+ | 全版本 | 3.5+ | 5+ | 全版本 | 需 HTTPS |
| Intersection Observer | 51+ | 15+ | 55+ | 12.1+ | 12.2+ | — |
| Resize Observer | 64+ | 79+ | 69+ | 13.1+ | 13.4+ | — |
| Mutation Observer | 26+ | 12+ | 14+ | 6+ | 6+ | — |

---

## 参考资源

- [MDN Web APIs 参考](https://developer.mozilla.org/zh-CN/docs/Web/API)
- [Can I Use - 浏览器兼容性查询](https://caniuse.com)
- [Web Streams Specification](https://streams.spec.whatwg.org)
- [Service Worker Specification](https://w3c.github.io/ServiceWorker)
- [WebGL Specification](https://www.khronos.org/registry/webgl/specs/latest/2.0)
- [File System Access API](https://wicg.github.io/file-system-access)

---

## 相关资源

- [浏览器兼容性矩阵](../comparison-matrices/browser-compatibility-compare.md) — 查看各 Web API 的浏览器支持情况
- [前端框架分类](../categories/frontend-frameworks) — 与 DOM 操作紧密相关的前端框架
- [事件循环详细流程](../diagrams/event-loop-detailed) — 理解异步 Web API 的底层机制

---

> 📅 本文档最后更新：2026年4月
>
> 💡 提示：浏览器 API 持续演进，建议结合 [Can I Use](https://caniuse.com) 与 [MDN](https://developer.mozilla.org) 获取最新兼容性信息。