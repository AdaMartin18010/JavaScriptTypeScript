---
title: 浏览器 APIs 完全指南 2026
description: "2025-2026 浏览器 Web Platform APIs 完全指南，覆盖 ES2025/ES2026、View Transitions、Popover、WebGPU、Observables 等新特性"
---

# 浏览器 APIs 完全指南 2026

> 最后更新: 2026-05-01 | 对齐: Baseline 2025/2026, ECMAScript 2025/2026  
> 数据来源: [Can I Use](https://caniuse.com/)、[MDN Web Docs](https://developer.mozilla.org/)、[Chrome Status](https://chromestatus.com/)、[Web Platform Tests](https://wpt.fyi/)

---

## ECMAScript 2025/2026 语言特性

### ES2025 (已发布)

| 特性 | 代码示例 | 浏览器支持 |
|------|---------|-----------|
| `Object.groupBy` | `Object.groupBy(items, ({ type }) => type)` | Baseline 2025 |
| `Map.groupBy` | `Map.groupBy(items, ({ status }) => status)` | Baseline 2025 |
| `Promise.withResolvers` | `const { promise, resolve, reject } = Promise.withResolvers()` | Baseline 2025 |
| `Atomics.waitAsync` | `await Atomics.waitAsync(lock, 0, 1)` | Baseline 2025 |
| RegExp `v` flag | `/[\p{Emoji}]/v` | Baseline 2025 |

### ES2026 Stage 3 提案

| 特性 | 状态 | 预计发布 |
|------|------|---------|
| **Import Defer** | Stage 3 | ES2026 |
| **Temporal API** | Stage 3 | ES2026 |
| **Pattern Matching** | Stage 2.7 | ES2027? |
| **Records & Tuples** | Stage 2 | 待定 |
| **Decorator Metadata** | Stage 3 | ES2026 |

---

## 2026 新增 Web Platform APIs

### Popover API

Popover API 提供原生弹窗能力，无需 JavaScript 即可实现模态/非模态弹窗，支持顶层渲染（`top layer`）和自动焦点管理。

**HTML 声明式使用：**

```html
<button popovertarget="my-popover">打开设置</button>
<div id="my-popover" popover>
  <h3>设置面板</h3>
  <p>这是原生弹窗内容，自动处理焦点陷阱和 Escape 关闭。</p>
</div>
```

**JavaScript 程序化控制：**

```javascript
const popover = document.getElementById('my-popover');

// 显示弹窗（非模态）
ppopover.showPopover();

// 显示模态弹窗（带背景遮罩）
ppopover.showPopover({ source: triggerButton });

// 关闭弹窗
ppopover.hidePopover();

// 监听状态变化
ppopover.addEventListener('toggle', (e) => {
  console.log('Popover 状态:', e.newState); // "open" | "closed"
});
```

| 属性/方法 | 说明 | 浏览器支持 |
|-----------|------|-----------|
| `popover` 属性 | 声明弹窗元素 | Baseline 2024 [Can I Use](https://caniuse.com/mdn-html_global_attributes_popover) |
| `popovertarget` | 触发按钮属性 | Baseline 2024 |
| `showPopover()` | 程序打开 | Baseline 2024 |
| `::backdrop` | 模态遮罩样式 | Chrome 122+, Firefox 125+, Safari 17+ |

---

### Anchor Positioning

Anchor Positioning 允许元素基于另一个元素（锚点）进行绝对定位，彻底改变了下拉菜单、工具提示等组件的实现方式。

```css
.anchor {
  anchor-name: --menu-trigger;
}

.tooltip {
  position: absolute;
  position-anchor: --menu-trigger;
  position-area: top span-right;
  /* 自动翻转：空间不足时翻转到底部 */
  position-try-fallbacks: --bottom;
}

@position-try --bottom {
  position-area: bottom span-right;
}
```

```javascript
// JavaScript 动态获取锚点几何信息
const anchor = document.querySelector('.anchor');
const tooltip = document.querySelector('.tooltip');

// 使用 CSS Anchor Positioning API 动态关联
tooltip.style.positionAnchor = '--menu-trigger';

// 查询锚点矩形（用于复杂计算）
const anchorRect = document.getCSSValues(anchor, 'anchor').default;
```

| 特性 | 说明 | 浏览器支持 |
|------|------|-----------|
| `anchor-name` | 定义锚点 | Chrome 125+, Edge 125+ [Chrome Status](https://chromestatus.com/feature/5124922471874560) |
| `position-anchor` | 关联锚点 | Chrome 125+ |
| `position-area` | 定位区域语法 | Chrome 125+ |
| `position-try-fallbacks` | 自动翻转策略 | Chrome 125+ |
| Firefox/Safari | 实现中 | Firefox 蓝图阶段, Safari 暂无公开计划 [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/anchor-name) |

---

### View Transitions API

View Transitions API 让 DOM 状态变化产生平滑的过渡动画，支持同页面（SPA）和跨页面（MPA）场景。

**同页面视图过渡：**

```javascript
// 触发视图过渡
document.startViewTransition(() => {
  // 更新 DOM 的回调
  updateDOMContent();
});
```

**自定义过渡动画：**

```css
/* 为特定元素命名，参与独立过渡 */
.old-image {
  view-transition-name: hero-image;
}

.new-image {
  view-transition-name: hero-image;
}

/* 自定义关键帧 */
::view-transition-old(hero-image) {
  animation: fade-out 0.3s ease;
}

::view-transition-new(hero-image) {
  animation: fade-in 0.3s ease;
}

@keyframes fade-out {
  to { opacity: 0; transform: scale(0.95); }
}

@keyframes fade-in {
  from { opacity: 0; transform: scale(1.05); }
}
```

**跨页面视图过渡（MPA）：**

```html
<!-- 在目标页面启用 -->
<meta name="view-transition" content="same-origin">
```

```javascript
// 拦截导航，执行过渡
navigation.addEventListener('navigate', (e) => {
  if (e.destination.url.includes('/detail/')) {
    e.intercept({
      async handler() {
        const transition = document.startViewTransition(async () => {
          const response = await fetch(e.destination.url);
          const html = await response.text();
          document.body.innerHTML = new DOMParser()
            .parseFromString(html, 'text/html')
            .body.innerHTML;
        });
        await transition.finished;
      }
    });
  }
});
```

| API | 说明 | 浏览器支持 |
|-----|------|-----------|
| `document.startViewTransition()` | 同页面过渡 | Chrome 111+, Edge 111+, Safari 18+ [Can I Use](https://caniuse.com/view-transitions) |
| `::view-transition-*` | 过渡伪元素 | Chrome 111+, Safari 18+ |
| 跨页面过渡 | `<meta name="view-transition">` | Chrome 126+, Edge 126+ |
| `view-transition-class` | 元素分类过渡 | Chrome 125+ |
| Firefox | 同页面过渡开发中 | Firefox 136+ Nightly [MDN](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API) |

---

### Invoker Commands (Invokers)

Invoker Commands 允许通过 `command` 和 `commandfor` 属性将按钮与任意元素的行为解耦，无需编写 JavaScript 事件监听器。

```html
<!-- 按钮控制对话框 -->
<button commandfor="my-dialog" command="show-modal">打开对话框</button>
<dialog id="my-dialog">
  <p>对话框内容</p>
  <button commandfor="my-dialog" command="close">关闭</button>
</dialog>

<!-- 按钮控制 Popover -->
<button commandfor="my-popover" command="toggle-popover">切换弹窗</button>
<div id="my-popover" popover>弹窗内容</div>
```

**自定义命令：**

```javascript
const panel = document.getElementById('side-panel');

// 监听 invoker 命令
panel.addEventListener('command', (e) => {
  if (e.command === 'toggle-panel') {
    panel.classList.toggle('open');
  }
});
```

```html
<button commandfor="side-panel" command="toggle-panel">切换侧边栏</button>
<aside id="side-panel">侧边栏内容</aside>
```

| 属性 | 说明 | 浏览器支持 |
|------|------|-----------|
| `command` / `commandfor` | 声明式命令绑定 | Chrome 135+, Edge 135+ [Chrome Status](https://chromestatus.com/feature/5147117519360000) |
| 内置命令 (`show-modal`, `close`, `toggle-popover`) | 标准行为 | Chrome 135+ |
| `command` 事件 | 自定义命令监听 | Chrome 135+ |
| Firefox/Safari | 尚未实现 | 提案跟进中 [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#command) |

---

## 性能 APIs

### Performance Observer

Performance Observer 提供高性能、低开销的性能指标订阅机制，替代传统的 `performance.getEntriesByType` 轮询。

```javascript
// 观察 LCP (Largest Contentful Paint)
const lcpObserver = new PerformanceObserver((list) => {
  const entries = list.getEntries();
  const lastEntry = entries[entries.length - 1];
  console.log('LCP:', lastEntry.startTime, lastEntry.element);
});
lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

// 观察 CLS (Cumulative Layout Shift)
let clsValue = 0;
const clsObserver = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (!entry.hadRecentInput) {
      clsValue += entry.value;
    }
  }
  console.log('CLS:', clsValue);
});
clsObserver.observe({ type: 'layout-shift', buffered: true });

// 观察 INP (Interaction to Next Paint)
const inpObserver = new PerformanceObserver((list) => {
  const interactions = list.getEntries();
  const slowest = interactions.reduce((a, b) => 
    a.duration > b.duration ? a : b
  );
  console.log('INP:', slowest.duration, slowest.target);
});
inpObserver.observe({ type: 'event', buffered: true, durationThreshold: 40 });
```

| 指标 | 说明 | 浏览器支持 |
|------|------|-----------|
| `largest-contentful-paint` | 最大内容绘制 | Baseline 2023 [Can I Use](https://caniuse.com/mdn-api_performanceobserver) |
| `layout-shift` | 布局偏移 | Chrome 84+, Edge 84+, Firefox 103+, Safari 16.4+ |
| `event` (INP) | 交互延迟 | Chrome 96+, Edge 96+, Firefox 130+ |
| `long-animation-frame` | 长动画帧 | Chrome 123+ [Chrome Status](https://chromestatus.com/feature/5083883711217664) |
| `navigation` | 导航计时 | Baseline 2022 |

---

### Long Tasks API

Long Tasks API 检测阻塞主线程超过 50ms 的任务，帮助识别 JavaScript 执行瓶颈。

```javascript
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.warn('长任务检测:', {
      duration: entry.duration,
      startTime: entry.startTime,
      // 归因信息：哪些框架/脚本导致的
      attribution: entry.attribution.map(a => ({
        containerType: a.containerType, // "window" | "iframe" | "embed"
        containerSrc: a.containerSrc,
        containerName: a.containerName,
      }))
    });
  }
});

// buffered: true 捕获页面加载前的长任务
observer.observe({ entryTypes: ['longtask'], buffered: true });
```

**结合 Long Animation Frames (LoAF)：**

```javascript
// LoAF 是 Long Tasks 的进化版，提供更细粒度的动画帧阻塞信息
const loafObserver = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log('LoAF:', {
      duration: entry.duration,
      startTime: entry.startTime,
      renderStart: entry.renderStart,
      styleAndLayoutStart: entry.styleAndLayoutStart,
      // 阻塞的脚本信息
      scripts: entry.scripts.map(s => ({
        name: s.name,
        duration: s.duration,
        type: s.type, // "classic-script" | "module-script" | "event-listener"
        sourceLocation: s.sourceLocation,
      }))
    });
  }
});
loafObserver.observe({ type: 'long-animation-frame', buffered: true });
```

| API | 说明 | 浏览器支持 |
|-----|------|-----------|
| Long Tasks | 主线程 >50ms 任务 | Chrome 58+, Edge 79+, Firefox 待实现 [Can I Use](https://caniuse.com/mdn-api_performancelongtasktiming) |
| Long Animation Frames (LoAF) | 动画帧阻塞详情 | Chrome 123+, Edge 123+ [Chrome Status](https://chromestatus.com/feature/5083883711217664) |

---

### Resource Timing

Resource Timing API 提供网络请求级别的详细计时信息，用于诊断资源加载性能。

```javascript
const resourceObserver = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    // 过滤只关注 fetch/XHR
    if (entry.initiatorType !== 'fetch' && entry.initiatorType !== 'xmlhttprequest') {
      continue;
    }

    const timing = {
      name: entry.name,
      duration: entry.duration,
      // 各阶段耗时
      dns: entry.domainLookupEnd - entry.domainLookupStart,
      tcp: entry.connectEnd - entry.connectStart,
      tls: entry.secureConnectionStart > 0 
        ? entry.connectEnd - entry.secureConnectionStart 
        : 0,
      ttfb: entry.responseStart - entry.startTime,
      download: entry.responseEnd - entry.responseStart,
      // 缓存状态
      fromCache: entry.transferSize === 0 && entry.decodedBodySize > 0,
      compressed: entry.encodedBodySize < entry.decodedBodySize,
    };

    // 上报慢请求
    if (timing.duration > 1000) {
      reportSlowResource(timing);
    }
  }
});
resourceObserver.observe({ type: 'resource', buffered: true });
```

**Server Timing 集成：**

```javascript
// 读取服务端通过 Server-Timing 头传递的计时
for (const entry of performance.getEntriesByType('resource')) {
  const serverTiming = entry.serverTiming;
  for (const metric of serverTiming) {
    console.log(`Server ${metric.name}: ${metric.duration}ms - ${metric.description}`);
  }
}
```

| 字段 | 说明 | 浏览器支持 |
|------|------|-----------|
| `entryType: 'resource'` | 资源计时 | Baseline 2022 [Can I Use](https://caniuse.com/resource-timing) |
| `transferSize` / `encodedBodySize` | 传输/编码大小 | Baseline 2022 |
| `serverTiming` | Server-Timing 头解析 | Chrome 65+, Firefox 142+, Safari 16.4+ |
| `renderBlockingStatus` | 是否渲染阻塞 | Chrome 107+ |

---

### Navigation Timing

Navigation Timing 测量页面导航完整生命周期，从点击链接到页面完全加载。

```javascript
// 获取导航计时
const navEntry = performance.getEntriesByType('navigation')[0];

if (navEntry) {
  const metrics = {
    // 重定向耗时
    redirect: navEntry.redirectEnd - navEntry.redirectStart,
    // DNS 解析
    dns: navEntry.domainLookupEnd - navEntry.domainLookupStart,
    // TCP 握手
    tcp: navEntry.connectEnd - navEntry.connectStart,
    // TLS 握手
    ssl: navEntry.secureConnectionStart > 0
      ? navEntry.connectEnd - navEntry.secureConnectionStart
      : 0,
    // TTFB (Time to First Byte)
    ttfb: navEntry.responseStart - navEntry.startTime,
    // DOM 解析
    domParse: navEntry.domInteractive - navEntry.responseEnd,
    // DOM Ready
    domReady: navEntry.domContentLoadedEventEnd - navEntry.startTime,
    // 完全加载
    loadComplete: navEntry.loadEventEnd - navEntry.startTime,
    // 加载类型
    type: navEntry.type, // "navigate" | "reload" | "back_forward" | "prerender"
  };

  console.table(metrics);
}
```

**Navigation Timing Level 2：**

```javascript
// 使用 PerformanceObserver 监听导航
const navObserver = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    // 支持 deliveryType: "cache" | "navigational-prefetch" | ""
    console.log('Delivery type:', entry.deliveryType);
    // 支持 nextHopProtocol: "h2" | "h3" | "http/1.1"
    console.log('Protocol:', entry.nextHopProtocol);
  }
});
navObserver.observe({ type: 'navigation', buffered: true });
```

| 特性 | 说明 | 浏览器支持 |
|------|------|-----------|
| Navigation Timing L2 | 完整导航计时 | Baseline 2022 [Can I Use](https://caniuse.com/nav-timing) |
| `deliveryType` | 交付类型 (prefetch/cache) | Chrome 112+, Edge 112+ |
| `nextHopProtocol` | 实际使用的协议 | Baseline 2023 |
| `activationStart` | Prerender 激活时间 | Chrome 109+ [Chrome Status](https://chromestatus.com/feature/5190163467014144) |

---

## 存储 APIs

### IndexedDB

IndexedDB 是浏览器中的结构化 NoSQL 数据库，适合存储大量数据、离线应用和缓存。

```javascript
// 打开/创建数据库
const dbPromise = new Promise((resolve, reject) => {
  const request = indexedDB.open('AppStore', 2); // 版本 2

  request.onerror = () => reject(request.error);
  request.onsuccess = () => resolve(request.result);

  // 升级回调：创建对象存储和索引
  request.onupgradeneeded = (event) => {
    const db = event.target.result;
    
    // 创建对象存储，指定主键
    if (!db.objectStoreNames.contains('documents')) {
      const store = db.createObjectStore('documents', { keyPath: 'id', autoIncrement: true });
      // 创建索引
      store.createIndex('byTitle', 'title', { unique: false });
      store.createIndex('byDate', 'createdAt', { unique: false });
    }
  };
});

// CRUD 操作
async function addDocument(doc) {
  const db = await dbPromise;
  const tx = db.transaction('documents', 'readwrite');
  const store = tx.objectStore('documents');
  
  const request = store.add(doc);
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result); // 返回生成的 id
    request.onerror = () => reject(request.error);
  });
}

async function getDocumentsByTitle(title) {
  const db = await dbPromise;
  const tx = db.transaction('documents', 'readonly');
  const store = tx.objectStore('documents');
  const index = store.index('byTitle');
  
  const request = index.getAll(title);
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
  });
}

// 游标遍历
async function iterateAll() {
  const db = await dbPromise;
  const tx = db.transaction('documents', 'readonly');
  const store = tx.objectStore('documents');
  
  const request = store.openCursor();
  request.onsuccess = (event) => {
    const cursor = event.target.result;
    if (cursor) {
      console.log(cursor.value);
      cursor.continue();
    }
  };
}
```

**封装为 Promise（使用 idb 库或原生封装）：**

```javascript
// 原生 IndexedDB Promise 封装模式
function wrapRequest(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// 批量写入（使用事务优化）
async function bulkAdd(documents) {
  const db = await dbPromise;
  const tx = db.transaction('documents', 'readwrite');
  const store = tx.objectStore('documents');
  
  documents.forEach(doc => store.put(doc));
  
  // 等待事务完成
  await new Promise((resolve, reject) => {
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
}
```

| 特性 | 说明 | 浏览器支持 |
|------|------|-----------|
| IndexedDB v2 | 结构化存储 | Baseline 2018 [Can I Use](https://caniuse.com/indexeddb) |
| IndexedDB v3 | 索引 renaming, getAllKeys | Baseline 2022 |
| Blob 存储 | 直接存储二进制数据 | 广泛支持 |
| 存储限制 | 动态配额 (~50% 磁盘空间) | 各浏览器策略不同 |

---

### Cache API

Cache API 是 Service Worker 的配套 API，提供请求/响应对的持久化缓存，用于离线应用和性能优化。

```javascript
// 打开命名缓存
const CACHE_NAME = 'app-v1';

async function cacheResources() {
  const cache = await caches.open(CACHE_NAME);
  
  await cache.addAll([
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/icon.png'
  ]);
}

// 缓存优先的获取策略
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  
  if (cached) {
    // 后台更新（Stale-While-Revalidate 模式）
    fetch(request).then(response => {
      cache.put(request, response.clone());
    });
    return cached;
  }
  
  const response = await fetch(request);
  cache.put(request, response.clone());
  return response;
}

// 运行时缓存 API 响应
async function cacheApiResponse(request, response, maxAge = 3600) {
  const cache = await caches.open('api-cache');
  
  // 添加自定义过期头（Cache API 不原生支持过期）
  const headers = new Headers(response.headers);
  headers.set('x-cache-date', Date.now().toString());
  headers.set('x-cache-max-age', maxAge.toString());
  
  const cachedResponse = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
  
  await cache.put(request, cachedResponse);
}

// 清理过期缓存
async function cleanupCache() {
  const cacheWhitelist = ['app-v2', 'api-cache'];
  const cacheNames = await caches.keys();
  
  await Promise.all(
    cacheNames
      .filter(name => !cacheWhitelist.includes(name))
      .map(name => caches.delete(name))
  );
}
```

| 特性 | 说明 | 浏览器支持 |
|------|------|-----------|
| `caches.open()` | 打开命名缓存 | Baseline 2016 [Can I Use](https://caniuse.com/cachestorage) |
| `cache.match()` | 请求匹配 | Baseline 2016 |
| `cache.addAll()` | 批量缓存 | Baseline 2016 |
| 仅 HTTPS/localhost | 安全上下文要求 | 规范要求 |

---

### Origin Private File System (OPFS)

OPFS 提供高性能、类似原生文件系统的 API，数据对源私有，支持同步访问句柄（用于 Wasm/重度 IO）。

```javascript
// 获取 OPFS 根目录
const root = await navigator.storage.getDirectory();

// 创建/获取文件
const fileHandle = await root.getFileHandle('data.bin', { create: true });

// 写入文件（异步）
const writable = await fileHandle.createWritable();
await writable.write(new Uint8Array([1, 2, 3, 4]));
await writable.write('文本内容');
await writable.close();

// 读取文件
const file = await fileHandle.getFile();
const buffer = await file.arrayBuffer();
console.log('文件大小:', file.size, '修改时间:', file.lastModified);

// 创建目录
const dirHandle = await root.getDirectoryHandle('backups', { create: true });

// 遍历目录
for await (const [name, handle] of dirHandle.entries()) {
  console.log(name, handle.kind); // "file" | "directory"
}

// 删除文件/目录
await root.removeEntry('old-data.bin');
await root.removeEntry('backups', { recursive: true });
```

**同步访问句柄（Worker 中使用）：**

```javascript
// 必须在 Worker 中使用
self.onmessage = async (e) => {
  const root = await navigator.storage.getDirectory();
  const fileHandle = await root.getFileHandle('heavy-data.bin', { create: true });
  
  // 获取同步访问句柄
  const syncHandle = await fileHandle.createSyncAccessHandle();
  
  // 直接内存读写，无需 await
  const buffer = new Uint8Array(1024);
  const readBytes = syncHandle.read(buffer, { at: 0 });
  
  // 写入
  const writeBuffer = new TextEncoder().encode('同步写入');
  syncHandle.write(writeBuffer, { at: readBytes });
  
  syncHandle.flush();
  syncHandle.close();
  
  self.postMessage({ done: true });
};
```

| 特性 | 说明 | 浏览器支持 |
|------|------|-----------|
| `navigator.storage.getDirectory()` | 获取 OPFS 根 | Baseline 2023 [Can I Use](https://caniuse.com/mdn-api_storage_manager_getdirectory) |
| `createSyncAccessHandle()` | 同步文件访问 | Chrome 102+, Edge 102+, Firefox 111+, Safari 15.2+ |
| `FileSystemFileHandle` | 文件句柄 | Baseline 2023 |
| 存储配额 | 受 `navigator.storage.estimate()` 限制 | 动态配额 |

---

## 网络 APIs

### Fetch API 进阶

Fetch API 现代用法涵盖优先级控制、请求取消、进度追踪和条件请求。

```javascript
// 优先级控制 (fetch priority)
const highPriority = fetch('/critical-data.json', {
  priority: 'high' // "high" | "low" | "auto"
});

const lowPriority = fetch('/analytics.png', {
  priority: 'low'
});

// 条件请求 / 缓存控制
const conditionalFetch = fetch('/api/data', {
  headers: {
    'If-None-Match': cachedEtag,
    'Cache-Control': 'max-age=3600'
  }
});

// 自定义 referrer policy
const fetchWithPolicy = fetch('/api/action', {
  referrerPolicy: 'strict-origin-when-cross-origin'
});

//  integrity 校验（SRI）
const secureFetch = fetch('/lib.js', {
  integrity: 'sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC'
});

// keepalive 用于页面卸载时发送数据
navigator.sendBeacon = (url, data) => 
  fetch(url, { method: 'POST', body: data, keepalive: true });
```

**Fetch 上传进度：**

```javascript
async function uploadWithProgress(file, onProgress) {
  const response = await fetch('/upload', {
    method: 'POST',
    body: file,
    duplex: 'half', // 支持 request body 流
    headers: {
      'Content-Length': file.size.toString()
    }
  });
  
  // 下载进度通过 ReadableStream 获取
  const reader = response.body.getReader();
  const contentLength = +response.headers.get('Content-Length');
  let received = 0;
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    received += value.length;
    onProgress?.(received / contentLength);
  }
}
```

| 特性 | 说明 | 浏览器支持 |
|------|------|-----------|
| `priority` | 请求优先级 | Baseline 2024 [Can I Use](https://caniuse.com/mdn-api_request_priority) |
| `keepalive` | 页面卸载后继续 | Baseline 2023 |
| `integrity` | 子资源完整性 | Baseline 2017 |
| `duplex: 'half'` | 请求流式上传 | Chrome 105+, Firefox 125+ |

---

### AbortController

AbortController 提供标准化机制取消异步操作，支持 fetch、事件监听和任意 Promise。

```javascript
const controller = new AbortController();
const signal = controller.signal;

// 发起可取消的请求
fetch('/api/long-operation', { signal })
  .then(response => response.json())
  .catch(err => {
    if (err.name === 'AbortError') {
      console.log('请求已取消');
    }
  });

// 5 秒后自动取消
setTimeout(() => controller.abort('超时取消'), 5000);

// 手动取消
// controller.abort();
```

**复合取消信号：**

```javascript
// 多个 AbortSignal 组合（任意一个触发则取消）
const ctrl1 = new AbortController();
const ctrl2 = new AbortController();

const combined = AbortSignal.any([ctrl1.signal, ctrl2.signal]);

fetch('/api/data', { signal: combined });

// 任一控制器触发都会取消请求
ctrl1.abort(); // 或 ctrl2.abort()
```

**带超时封装的 fetch：**

```javascript
function fetchWithTimeout(url, options = {}, timeout = 10000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort('timeout'), timeout);
  
  return fetch(url, {
    ...options,
    signal: options.signal 
      ? AbortSignal.any([options.signal, controller.signal])
      : controller.signal
  }).finally(() => clearTimeout(id));
}
```

| 特性 | 说明 | 浏览器支持 |
|------|------|-----------|
| `AbortController` | 取消控制器 | Baseline 2020 [Can I Use](https://caniuse.com/abortcontroller) |
| `AbortSignal.any()` | 组合多个信号 | Chrome 116+, Edge 116+, Firefox 132+, Safari 17.4+ |
| `AbortSignal.timeout()` | 超时信号 | Baseline 2023 |
| `signal.reason` | 取消原因 | Baseline 2022 |

---

### Streams API

Streams API 提供低内存占用的流式数据处理，支持逐块读取/写入，避免将整个文件加载到内存。

```javascript
// 读取 Response 流
async function streamResponse(url) {
  const response = await fetch(url);
  const reader = response.body.getReader();
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    // value 是 Uint8Array 数据块
    console.log(`收到 ${value.byteLength} 字节`);
    processChunk(value);
  }
}

// TransformStream 数据转换
async function compressStream(url) {
  const response = await fetch(url);
  
  const compressed = response.body
    .pipeThrough(new CompressionStream('gzip'))
    .pipeThrough(new TextEncoderStream());
  
  return new Response(compressed);
}

// 自定义 TransformStream
const upperCaseTransform = new TransformStream({
  transform(chunk, controller) {
    controller.enqueue(chunk.toUpperCase());
  }
});

// WritableStream 自定义写入
const writable = new WritableStream({
  write(chunk) {
    console.log('写入:', chunk);
  },
  close() {
    console.log('流已关闭');
  },
  abort(reason) {
    console.error('流中止:', reason);
  }
});
```

**生成器创建 ReadableStream：**

```javascript
function createCounterStream(max) {
  return new ReadableStream({
    start(controller) {
      let count = 0;
      const interval = setInterval(() => {
        if (count >= max) {
          controller.close();
          clearInterval(interval);
          return;
        }
        controller.enqueue(++count);
      }, 1000);
    },
    cancel() {
      console.log('消费者取消了流');
    }
  });
}

const stream = createCounterStream(10);
const reader = stream.getReader();

// 消费流
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  console.log('计数:', value);
}
```

| 特性 | 说明 | 浏览器支持 |
|------|------|-----------|
| `ReadableStream` | 可读流 | Baseline 2022 [Can I Use](https://caniuse.com/streams) |
| `WritableStream` | 可写流 | Baseline 2022 |
| `TransformStream` | 转换流 | Baseline 2022 |
| `CompressionStream` | 压缩流 (gzip/deflate) | Baseline 2023 |
| `ReadableStream.from()` | 从异步迭代器创建 | Chrome 133+, Edge 133+, Firefox 135+ |

---

### Background Fetch

Background Fetch API 允许在后台下载/上传大文件，即使页面关闭或用户离开也能继续，并通过 Service Worker 通知进度。

```javascript
// 注册后台下载
async function backgroundDownload(url, filename) {
  const registration = await navigator.serviceWorker.ready;
  
  const fetchId = `download-${Date.now()}`;
  const bgFetch = await registration.backgroundFetch.fetch(
    fetchId,
    [url],
    {
      title: `下载 ${filename}`,
      downloadTotal: 100 * 1024 * 1024, // 预估 100MB，用于进度显示
      icons: [{ src: '/icon.png', sizes: '192x192' }]
    }
  );
  
  return bgFetch;
}
```

**Service Worker 中监听事件：**

```javascript
// service-worker.js
self.addEventListener('backgroundfetchsuccess', (event) => {
  const bgFetch = event.registration;
  
  event.waitUntil(
    (async () => {
      const records = await bgFetch.matchAll();
      const promises = records.map(async (record) => {
        const response = await record.responseReady;
        const cache = await caches.open('downloads');
        await cache.put(record.request, response);
      });
      await Promise.all(promises);
      
      // 显示完成通知
      await self.registration.showNotification('下载完成', {
        body: bgFetch.title
      });
    })()
  );
});

self.addEventListener('backgroundfetchfail', (event) => {
  console.error('后台下载失败:', event.registration.id);
});

self.addEventListener('backgroundfetchabort', (event) => {
  console.log('后台下载取消:', event.registration.id);
});
```

| 特性 | 说明 | 浏览器支持 |
|------|------|-----------|
| `registration.backgroundFetch` | 后台获取管理器 | Chrome 74+, Edge 79+ [Can I Use](https://caniuse.com/background-fetch) |
| `backgroundfetchsuccess` | 成功事件 | Chrome 74+ |
| `backgroundfetchfail` | 失败事件 | Chrome 74+ |
| `backgroundfetchabort` | 中止事件 | Chrome 74+ |
| Firefox/Safari | 未实现 | 无公开计划 [Chrome Status](https://chromestatus.com/feature/5712608502579200) |

---

## 多媒体 APIs

### Web Codecs

Web Codecs API 提供对视频帧和音频数据的原生编解码能力，替代 `<video>` 和 `<canvas>` 的低效方案，适用于视频编辑、流媒体处理等场景。

```javascript
// 视频解码
async function decodeVideoChunks(encodedChunks) {
  const decoder = new VideoDecoder({
    output(frame) {
      // frame 是 VideoFrame 对象
      console.log('解码帧:', frame.timestamp, frame.duration);
      
      // 绘制到 canvas
      canvasContext.drawImage(frame, 0, 0);
      frame.close(); // 必须手动释放
    },
    error(e) {
      console.error('解码错误:', e);
    }
  });
  
  // 配置解码器
  await decoder.configure({
    codec: 'vp8', // 或 "vp9", "avc1.42001E", "av01.0.04M.08"
    codedWidth: 1920,
    codedHeight: 1080
  });
  
  // 送入编码数据
  for (const chunk of encodedChunks) {
    decoder.decode(new EncodedVideoChunk({
      type: chunk.key ? 'key' : 'delta',
      timestamp: chunk.timestamp,
      data: chunk.data
    }));
  }
  
  await decoder.flush();
  decoder.close();
}

// 视频编码
async function encodeVideoStream(canvas, onChunk) {
  const encoder = new VideoEncoder({
    output(chunk, metadata) {
      onChunk(chunk, metadata);
    },
    error(e) {
      console.error('编码错误:', e);
    }
  });
  
  await encoder.configure({
    codec: 'vp09.00.10.08',
    width: canvas.width,
    height: canvas.height,
    bitrate: 5_000_000, // 5 Mbps
    framerate: 30
  });
  
  // 从 canvas 捕获帧并编码
  const stream = canvas.captureStream(30);
  const track = stream.getVideoTracks()[0];
  const processor = new MediaStreamTrackProcessor({ track });
  const reader = processor.readable.getReader();
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    encoder.encode(value);
    value.close();
  }
  
  await encoder.flush();
  encoder.close();
}
```

| 接口 | 说明 | 浏览器支持 |
|------|------|-----------|
| `VideoDecoder` | 视频解码 | Chrome 94+, Edge 94+, Firefox 133+ [Can I Use](https://caniuse.com/webcodecs) |
| `VideoEncoder` | 视频编码 | Chrome 94+, Edge 94+, Firefox 133+ |
| `AudioDecoder` / `AudioEncoder` | 音频编解码 | Chrome 94+, Firefox 133+ |
| `ImageDecoder` | 图像序列解码 (GIF/WebP) | Chrome 94+, Firefox 125+ |

---

### Media Capture & Screen Capture

Media Capture API 访问摄像头和麦克风，Screen Capture API 录制屏幕内容。

```javascript
// 获取摄像头和麦克风
async function getMedia() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        facingMode: 'user', // "environment" 后置摄像头
        frameRate: { ideal: 30 }
      },
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    });
    
    const video = document.getElementById('localVideo');
    video.srcObject = stream;
    
    return stream;
  } catch (err) {
    console.error('媒体获取失败:', err.name, err.message);
  }
}

// 屏幕录制
async function captureScreen() {
  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: {
      cursor: 'always',
      displaySurface: 'monitor' // "window" | "browser"
    },
    audio: true
  });
  
  // 监听用户停止共享
  stream.getVideoTracks()[0].onended = () => {
    console.log('屏幕共享已停止');
  };
  
  return stream;
}

// 录制媒体流到文件
async function recordStream(stream, durationMs = 5000) {
  const recorder = new MediaRecorder(stream, {
    mimeType: 'video/webm;codecs=vp9',
    videoBitsPerSecond: 5_000_000
  });
  
  const chunks = [];
  recorder.ondataavailable = (e) => chunks.push(e.data);
  
  recorder.start(1000); // 每秒触发一次 dataavailable
  
  await new Promise(resolve => setTimeout(resolve, durationMs));
  recorder.stop();
  
  await new Promise(resolve => recorder.onstop = resolve);
  
  const blob = new Blob(chunks, { type: 'video/webm' });
  return URL.createObjectURL(blob);
}
```

| API | 说明 | 浏览器支持 |
|-----|------|-----------|
| `getUserMedia()` | 摄像头/麦克风 | Baseline 2020 [Can I Use](https://caniuse.com/stream) |
| `getDisplayMedia()` | 屏幕捕获 | Baseline 2022 [Can I Use](https://caniuse.com/screen-sharing) |
| `MediaRecorder` | 媒体录制 | Baseline 2020 [Can I Use](https://caniuse.com/mediarecorder) |
| `getSupportedConstraints()` | 查询支持的约束 | 广泛支持 |

---

### Web Audio API 2.0

Web Audio API 提供浏览器中的低延迟音频处理、合成和分析能力，现代浏览器已支持 AudioWorklet 替代废弃的 ScriptProcessorNode。

```javascript
// 初始化音频上下文
const audioContext = new AudioContext({
  sampleRate: 48000,
  latencyHint: 'interactive' // "balanced" | "playback"
});

// 加载并播放音频
async function playSound(url) {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  
  const source = audioContext.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(audioContext.destination);
  source.start(0);
}

// 实时音频分析（可视化）
function createAnalyzer(stream) {
  const source = audioContext.createMediaStreamSource(stream);
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 2048;
  analyser.smoothingTimeConstant = 0.8;
  
  source.connect(analyser);
  // 注意：不要 connect 到 destination，避免回授
  
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  
  function draw() {
    requestAnimationFrame(draw);
    analyser.getByteFrequencyData(dataArray);
    
    // dataArray 包含 0-255 的频率数据
    visualize(dataArray);
  }
  draw();
  
  return analyser;
}

// AudioWorklet 自定义处理（低延迟）
// 需要单独的 worklet 文件：noise-processor.js
/*
// noise-processor.js
class NoiseProcessor extends AudioWorkletProcessor {
  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];
    
    for (let channel = 0; channel < output.length; channel++) {
      const inputChannel = input[channel];
      const outputChannel = output[channel];
      
      for (let i = 0; i < outputChannel.length; i++) {
        // 添加轻微噪声
        outputChannel[i] = inputChannel[i] + (Math.random() - 0.5) * 0.1;
      }
    }
    return true; // 保持活跃
  }
}
registerProcessor('noise-processor', NoiseProcessor);
*/

async function setupWorklet() {
  await audioContext.audioWorklet.addModule('noise-processor.js');
  const noiseNode = new AudioWorkletNode(audioContext, 'noise-processor');
  
  const source = audioContext.createOscillator();
  source.connect(noiseNode).connect(audioContext.destination);
  source.start();
}
```

| 特性 | 说明 | 浏览器支持 |
|------|------|-----------|
| `AudioContext` | 音频上下文 | Baseline 2014 [Can I Use](https://caniuse.com/audio-api) |
| `AudioWorklet` | 低延迟音频处理线程 | Baseline 2021 [Can I Use](https://caniuse.com/mdn-api_audioworklet) |
| `createAnalyser()` | 频率/时域分析 | Baseline 2014 |
| `decodeAudioData()` | 音频解码 | Baseline 2014 |
| `MediaStreamAudioSourceNode` | 流式音频输入 | Baseline 2018 |

---

## 安全 APIs

### Credential Management API

Credential Management API 提供统一的凭据存储接口，支持密码、联邦登录和 Passkeys。

```javascript
// 保存密码凭据
async function savePassword(username, password) {
  const cred = new PasswordCredential({
    id: username,
    password: password,
    name: username,
    iconURL: '/avatar.png'
  });
  
  await navigator.credentials.store(cred);
}

// 自动登录（获取存储的凭据）
async function autoLogin() {
  const cred = await navigator.credentials.get({
    password: true,
    federated: {
      providers: ['https://accounts.google.com']
    }
  });
  
  if (cred) {
    if (cred.type === 'password') {
      return fetch('/login', {
        method: 'POST',
        body: JSON.stringify({
          username: cred.id,
          password: cred.password
        })
      });
    }
  }
}

// 阻止自动登录（用户登出后）
async function disableAutoLogin() {
  await navigator.credentials.preventSilentAccess();
}
```

| 特性 | 说明 | 浏览器支持 |
|------|------|-----------|
| `PasswordCredential` | 密码凭据 | Chrome 51+, Edge 79+ [Can I Use](https://caniuse.com/credential-management) |
| `FederatedCredential` | 联邦登录凭据 | Chrome 51+, Edge 79+ |
| `navigator.credentials.store()` | 存储凭据 | Chrome 51+, Edge 79+ |
| `preventSilentAccess()` | 阻止静默访问 | Chrome 60+, Edge 79+ |
| Firefox/Safari | 未完全实现 | Firefox 有限支持, Safari 无 [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Credential_Management_API) |

---

### Web Authentication (WebAuthn / Passkeys)

WebAuthn 提供基于公钥加密的强身份认证，Passkeys 是其跨设备同步的演进版本，替代传统密码。

```javascript
// 注册 Passkey
async function registerPasskey(username) {
  const publicKey = {
    challenge: Uint8Array.from(window.atob(serverChallenge), c => c.charCodeAt(0)),
    rp: { name: 'My App', id: location.hostname },
    user: {
      id: Uint8Array.from(userId),
      name: username,
      displayName: username
    },
    pubKeyCredParams: [
      { type: 'public-key', alg: -7 },   // ES256
      { type: 'public-key', alg: -257 }  // RS256
    ],
    authenticatorSelection: {
      authenticatorAttachment: 'platform', // "platform" = 设备内置 (FaceID/TouchID)
      residentKey: 'required',
      userVerification: 'required'
    },
    attestation: 'none'
  };
  
  const credential = await navigator.credentials.create({ publicKey });
  
  // 将 credential 发送到服务端注册
  await sendToServer('/register-passkey', {
    id: credential.id,
    rawId: Array.from(new Uint8Array(credential.rawId)),
    response: {
      clientDataJSON: Array.from(new Uint8Array(credential.response.clientDataJSON)),
      attestationObject: Array.from(new Uint8Array(credential.response.attestationObject))
    }
  });
  
  return credential;
}

// 使用 Passkey 登录
async function loginWithPasskey() {
  const publicKey = {
    challenge: Uint8Array.from(window.atob(serverChallenge), c => c.charCodeAt(0)),
    rpId: location.hostname,
    allowCredentials: [], // 空数组允许用户选择任意 Passkey
    userVerification: 'required'
  };
  
  const assertion = await navigator.credentials.get({ publicKey });
  
  // 发送到服务端验证
  await sendToServer('/verify-passkey', {
    id: assertion.id,
    rawId: Array.from(new Uint8Array(assertion.rawId)),
    response: {
      authenticatorData: Array.from(new Uint8Array(assertion.response.authenticatorData)),
      clientDataJSON: Array.from(new Uint8Array(assertion.response.clientDataJSON)),
      signature: Array.from(new Uint8Array(assertion.response.signature)),
      userHandle: Array.from(new Uint8Array(assertion.response.userHandle))
    }
  });
}
```

| 特性 | 说明 | 浏览器支持 |
|------|------|-----------|
| `navigator.credentials.create({ publicKey })` | 注册 | Baseline 2024 [Can I Use](https://caniuse.com/webauthn) |
| `navigator.credentials.get({ publicKey })` | 认证 | Baseline 2024 |
| Passkeys (同步) | iCloud Keychain / Google Password Manager | Chrome 108+, Safari 16+, Edge 108+, Firefox 122+ |
| `conditional` mediation | 条件式 UI（自动填充） | Chrome 108+, Safari 16+, Edge 108+ |

---

### Permissions API

Permissions API 提供统一接口查询各类浏览器权限状态，避免重复请求已拒绝的权限。

```javascript
// 查询权限状态
async function checkPermissions() {
  const permissions = [
    'camera',
    'microphone',
    'notifications',
    'geolocation',
    'clipboard-read',
    'clipboard-write',
    'display-capture',
    'storage-access'
  ];
  
  for (const name of permissions) {
    try {
      const result = await navigator.permissions.query({ name });
      console.log(`${name}: ${result.state}`); // "granted" | "denied" | "prompt"
      
      // 监听权限变化
      result.addEventListener('change', () => {
        console.log(`${name} 权限变为:`, result.state);
      });
    } catch (e) {
      console.log(`${name}: 不支持查询`);
    }
  }
}

// 实用的权限请求封装
async function requestWithPermission(permissionName, requestFn) {
  const status = await navigator.permissions.query({ name: permissionName });
  
  if (status.state === 'denied') {
    throw new Error(`权限已被拒绝: ${permissionName}`);
  }
  
  return requestFn();
}

// 使用示例
const stream = await requestWithPermission(
  'camera',
  () => navigator.mediaDevices.getUserMedia({ video: true })
);
```

| 权限名 | 说明 | 浏览器支持 |
|--------|------|-----------|
| `camera` / `microphone` | 媒体设备 | Chrome 64+, Edge 79+, Firefox 77+, Safari 16+ |
| `notifications` | 通知 | Baseline 2022 [Can I Use](https://caniuse.com/permissions-api) |
| `geolocation` | 地理位置 | Chrome 43+, Edge 79+ (注意: Firefox/Safari 不支持查询) |
| `clipboard-read` / `clipboard-write` | 剪贴板 | Chrome 66+, Edge 79+ |
| `storage-access` | 存储访问 | Chrome 119+, Edge 119+, Firefox 65+, Safari 13+ |

---

## 设备 APIs

### Web Bluetooth

Web Bluetooth API 允许网页与附近的低功耗蓝牙设备通信，适用于 IoT 设备、可穿戴设备交互。

```javascript
async function connectBluetoothDevice() {
  // 请求配对设备
  const device = await navigator.bluetooth.requestDevice({
    // 过滤特定服务
    filters: [
      { services: ['battery_service'] },
      { namePrefix: 'Fitbit' }
    ],
    // 或接受任何设备（需用户确认）
    // acceptAllDevices: true,
    optionalServices: ['heart_rate', 'device_information']
  });
  
  console.log('设备:', device.name, device.id);
  
  // 监听断开连接
  device.addEventListener('gattserverdisconnected', () => {
    console.log('设备断开连接');
  });
  
  // 连接 GATT 服务器
  const server = await device.gatt.connect();
  
  // 获取服务和特征值
  const service = await server.getPrimaryService('battery_service');
  const characteristic = await service.getCharacteristic('battery_level');
  
  // 读取值
  const value = await characteristic.readValue();
  console.log('电量:', value.getUint8(0), '%');
  
  // 订阅通知
  await characteristic.startNotifications();
  characteristic.addEventListener('characteristicvaluechanged', (e) => {
    console.log('电量更新:', e.target.value.getUint8(0), '%');
  });
  
  return device;
}
```

| 特性 | 说明 | 浏览器支持 |
|------|------|-----------|
| `navigator.bluetooth` | Web Bluetooth | Chrome 56+, Edge 79+ [Can I Use](https://caniuse.com/web-bluetooth) |
| `requestDevice()` | 设备发现/配对 | Chrome 56+, Edge 79+ |
| GATT 连接/读写 | 通信协议 | Chrome 56+, Edge 79+ |
| Firefox/Safari | 未实现 | 无公开计划 [Chrome Status](https://chromestatus.com/feature/5264933985976320) |

---

### Web Serial

Web Serial API 提供对串口设备的访问，适用于与微控制器（Arduino、Raspberry Pi Pico 等）通信。

```javascript
async function connectSerialDevice() {
  // 请求用户选择串口
  const port = await navigator.serial.requestPort({
    filters: [
      { usbVendorId: 0x2341, usbProductId: 0x0043 }, // Arduino Uno
      { usbVendorId: 0x2E8A } // Raspberry Pi Pico
    ]
  });
  
  // 打开串口连接
  await port.open({ baudRate: 9600 });
  
  // 读取数据
  const reader = port.readable.getReader();
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      console.log('收到数据:', new TextDecoder().decode(value));
    }
  } finally {
    reader.releaseLock();
  }
  
  // 写入数据
  const writer = port.writable.getWriter();
  const data = new TextEncoder().encode('Hello Arduino\n');
  await writer.write(data);
  writer.releaseLock();
  
  // 关闭连接
  await port.close();
  return port;
}

// 监听已连接设备
navigator.serial.addEventListener('connect', (e) => {
  console.log('串口设备已连接:', e.target);
});

navigator.serial.addEventListener('disconnect', (e) => {
  console.log('串口设备已断开:', e.target);
});
```

| 特性 | 说明 | 浏览器支持 |
|------|------|-----------|
| `navigator.serial` | Web Serial | Chrome 89+, Edge 89+ [Can I Use](https://caniuse.com/web-serial) |
| `requestPort()` | 选择串口 | Chrome 89+, Edge 89+ |
| `port.open()` / `readable` / `writable` | 读写流 | Chrome 89+, Edge 89+ |
| Firefox/Safari | 未实现 | 无公开计划 [Chrome Status](https://chromestatus.com/feature/6577673212002304) |

---

### WebUSB

WebUSB API 允许网页直接与 USB 设备通信，绕过传统驱动程序需求。

```javascript
async function connectUsbDevice() {
  const device = await navigator.usb.requestDevice({
    filters: [
      { vendorId: 0x2341 }, // Arduino
      { vendorId: 0x2E8A }, // Raspberry Pi
      { classCode: 0x08 }   // Mass Storage
    ]
  });
  
  console.log('USB 设备:', device.productName, device.manufacturerName);
  
  await device.open();
  
  // 选择配置和接口（如需要）
  if (device.configuration === null) {
    await device.selectConfiguration(1);
  }
  await device.claimInterface(0);
  
  // 控制传输
  const result = await device.controlTransferIn({
    requestType: 'vendor',
    recipient: 'device',
    request: 0x01,
    value: 0x00,
    index: 0x00
  }, 64); // 期望接收 64 字节
  
  console.log('控制传输结果:', new Uint8Array(result.data.buffer));
  
  // 批量传输（输出）
  const data = new Uint8Array([0x00, 0x01, 0x02]);
  await device.transferOut(1, data);
  
  await device.close();
}

// 监听连接事件
navigator.usb.addEventListener('connect', (e) => {
  console.log('USB 设备已连接:', e.device);
});
```

| 特性 | 说明 | 浏览器支持 |
|------|------|-----------|
| `navigator.usb` | WebUSB | Chrome 61+, Edge 79+ [Can I Use](https://caniuse.com/webusb) |
| `requestDevice()` | 设备选择 | Chrome 61+, Edge 79+ |
| 控制/批量/中断传输 | 传输类型 | Chrome 61+, Edge 79+ |
| Firefox/Safari | 未实现 | Firefox 开发中, Safari 无计划 [Chrome Status](https://chromestatus.com/feature/5651917954875392) |

---

### Geolocation API

Geolocation API 获取设备地理位置，结合 Permissions API 实现更好的权限管理。

```javascript
// 获取当前位置（一次性）
function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,      // 精度（米）
          altitude: position.coords.altitude,      // 海拔
          heading: position.coords.heading,        // 方向
          speed: position.coords.speed,            // 速度（m/s）
          timestamp: position.timestamp
        });
      },
      (error) => {
        reject(new Error(`${error.message} (code: ${error.code})`));
      },
      {
        enableHighAccuracy: true, // 使用 GPS（更耗电）
        timeout: 10000,
        maximumAge: 60000         // 允许缓存 60 秒
      }
    );
  });
}

// 持续监听位置变化
function watchPosition(onUpdate, onError) {
  const id = navigator.geolocation.watchPosition(
    (position) => onUpdate(position.coords),
    (error) => onError?.(error),
    { enableHighAccuracy: true, maximumAge: 10000 }
  );
  
  // 返回清理函数
  return () => navigator.geolocation.clearWatch(id);
}

// 使用示例
const stopWatching = watchPosition(
  (coords) => console.log('位置更新:', coords.latitude, coords.longitude),
  (err) => console.error('定位失败:', err)
);

// 组件卸载时停止监听
// stopWatching();
```

| 特性 | 说明 | 浏览器支持 |
|------|------|-----------|
| `getCurrentPosition()` | 单次定位 | Baseline 2016 [Can I Use](https://caniuse.com/geolocation) |
| `watchPosition()` | 持续监听 | Baseline 2016 |
| `clearWatch()` | 停止监听 | Baseline 2016 |
| HTTPS 要求 | 安全上下文 | 所有现代浏览器 |

---

## PWA APIs

### Service Worker 进阶

Service Worker 是 PWA 的核心，提供离线缓存、后台同步和推送通知能力。

```javascript
// service-worker.js
const CACHE_VERSION = 'v2';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`;

// 安装：预缓存核心资源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => 
      cache.addAll([
        '/',
        '/index.html',
        '/styles.css',
        '/app.js',
        '/offline.html'
      ])
    )
  );
  self.skipWaiting();
});

// 激活：清理旧缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => 
      Promise.all(
        keys
          .filter(key => !key.includes(CACHE_VERSION))
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// 拦截请求（多种策略）
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // 策略 1: 缓存优先（静态资源）
  if (request.destination === 'image' || request.destination === 'style') {
    event.respondWith(cacheFirst(request));
    return;
  }
  
  // 策略 2: 网络优先（API 请求）
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request));
    return;
  }
  
  // 策略 3: 仅网络（非 GET 请求）
  if (request.method !== 'GET') {
    event.respondWith(fetch(request));
    return;
  }
  
  // 默认: 陈旧时重新验证
  event.respondWith(staleWhileRevalidate(request));
});

// 缓存优先
async function cacheFirst(request) {
  const cached = await caches.match(request);
  return cached || fetch(request);
}

// 网络优先
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(DYNAMIC_CACHE);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    // API 离线时返回离线页面
    if (request.headers.get('Accept').includes('text/html')) {
      return caches.match('/offline.html');
    }
    throw new Error('网络不可用且无缓存');
  }
}

// 陈旧时重新验证 (Stale-While-Revalidate)
async function staleWhileRevalidate(request) {
  const cached = await caches.match(request);
  
  const fetchPromise = fetch(request).then(response => {
    caches.open(DYNAMIC_CACHE).then(cache => 
      cache.put(request, response.clone())
    );
    return response;
  });
  
  return cached || fetchPromise;
}
```

**主线程注册与管理：**

```javascript
// main.js
async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.warn('浏览器不支持 Service Worker');
    return;
  }
  
  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'imports' // "all" | "imports" | "none"
    });
    
    // 监听更新
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // 新版本已安装，提示用户刷新
          showUpdateNotification(newWorker);
        }
      });
    });
    
    return registration;
  } catch (err) {
    console.error('Service Worker 注册失败:', err);
  }
}

// 跳过等待立即激活（用户点击更新后）
function skipWaiting(worker) {
  worker.postMessage({ type: 'SKIP_WAITING' });
}

// service-worker.js 中处理
self.addEventListener('message', (event) => {
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
```

| 特性 | 说明 | 浏览器支持 |
|------|------|-----------|
| `navigator.serviceWorker.register()` | 注册 | Baseline 2020 [Can I Use](https://caniuse.com/serviceworkers) |
| `fetch` 事件拦截 | 请求代理 | Baseline 2020 |
| `skipWaiting()` / `clients.claim()` | 生命周期控制 | Baseline 2020 |
| `updateViaCache` | 更新缓存策略 | Chrome 68+, Edge 79+, Firefox 112+, Safari 16.4+ |

---

### Background Sync

Background Sync 延迟发送数据直到网络恢复，确保用户操作（如发送消息）最终完成。

```javascript
// 注册后台同步
async function registerSync(tag) {
  const registration = await navigator.serviceWorker.ready;
  
  try {
    await registration.sync.register(tag);
    console.log(`后台同步 "${tag}" 已注册`);
  } catch (err) {
    // 浏览器可能不支持或用户禁用了后台同步
    console.error('注册失败:', err);
    // 降级：立即尝试发送
    return sendPendingData();
  }
}

// 用户发送消息时调用
async function sendMessage(message) {
  // 先存储到 IndexedDB
  await db.messages.add({ ...message, status: 'pending', createdAt: Date.now() });
  
  // 注册后台同步
  await registerSync('send-messages');
  
  // 如果在线，立即尝试发送
  if (navigator.onLine) {
    await flushPendingMessages();
  }
}
```

**Service Worker 中处理同步：**

```javascript
// service-worker.js
self.addEventListener('sync', (event) => {
  if (event.tag === 'send-messages') {
    event.waitUntil(flushPendingMessages());
  }
});

async function flushPendingMessages() {
  const db = await openDB('AppStore', 1);
  const messages = await db.getAllFromIndex('messages', 'byStatus', 'pending');
  
  for (const msg of messages) {
    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(msg)
      });
      
      // 标记为已发送
      await db.put('messages', { ...msg, status: 'sent' });
    } catch (err) {
      console.error('发送失败，将在下次同步时重试:', err);
      // 同步失败会再次触发 sync 事件
      throw err;
    }
  }
}
```

| 特性 | 说明 | 浏览器支持 |
|------|------|-----------|
| `sync.register()` | 注册后台同步 | Chrome 49+, Edge 79+ [Can I Use](https://caniuse.com/background-sync) |
| `sync` 事件 | 网络恢复时触发 | Chrome 49+, Edge 79+ |
| 一次性同步 | 保证至少执行一次 | Chrome 49+, Edge 79+ |
| Firefox/Safari | 未实现 | Firefox 开发中, Safari 无计划 [Chrome Status](https://chromestatus.com/feature/6170807885627392) |

---

### Periodic Background Sync

Periodic Background Sync 允许 PWA 定期在后台更新内容，即使页面未打开（需用户授权）。

```javascript
async function registerPeriodicSync(tag, minIntervalHours = 24) {
  const registration = await navigator.serviceWorker.ready;
  
  // 检查权限状态
  const status = await navigator.permissions.query({
    name: 'periodic-background-sync'
  });
  
  if (status.state !== 'granted') {
    console.warn('定期后台同步权限未授予');
    return;
  }
  
  try {
    await registration.periodicSync.register(tag, {
      minInterval: minIntervalHours * 60 * 60 * 1000 // 最小间隔（毫秒）
    });
    console.log(`定期同步 "${tag}" 已注册`);
  } catch (err) {
    console.error('注册失败:', err);
  }
}

// 检查已注册的定期同步
async function getRegisteredPeriodicSyncs() {
  const registration = await navigator.serviceWorker.ready;
  const tags = await registration.periodicSync.getTags();
  console.log('已注册的定期同步:', tags);
  return tags;
}
```

**Service Worker 中处理：**

```javascript
// service-worker.js
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'news-update') {
    event.waitUntil(updateNewsCache());
  } else if (event.tag === 'weather-update') {
    event.waitUntil(updateWeatherCache());
  }
});

async function updateNewsCache() {
  const cache = await caches.open('news-cache');
  const response = await fetch('/api/news');
  await cache.put('/api/news', response.clone());
  
  // 可选：显示通知
  await self.registration.showNotification('新闻已更新', {
    body: '您关注的内容有新文章',
    icon: '/icon.png'
  });
}
```

| 特性 | 说明 | 浏览器支持 |
|------|------|-----------|
| `periodicSync.register()` | 注册定期同步 | Chrome 80+, Edge 80+ [Can I Use](https://caniuse.com/periodic-background-sync) |
| `periodicsync` 事件 | 定期触发 | Chrome 80+, Edge 80+ |
| 权限控制 | 用户可随时撤销 | Chrome 80+, Edge 80+ |
| Firefox/Safari | 未实现 | 无公开计划 [Chrome Status](https://chromestatus.com/feature/5685312974057472) |

---

## CSS 2025/2026 新特性

| 特性 | 说明 | 支持 |
|------|------|------|
| **CSS Nesting** | 原生嵌套选择器 | Baseline 2023 |
| **`:has()`** | 父选择器 | Baseline 2023 |
| **Container Queries** | 基于容器尺寸查询 | Baseline 2023 |
| **`@layer`** | 级联层控制优先级 | Baseline 2022 |
| **CSS Subgrid** | 子网格布局 | Firefox, Safari 16+ |
| **`color-mix()`** | 颜色混合 | Baseline 2024 |
| **Scoped CSS** | `@scope` 规则 | Chrome 118+ |

---

## 2026 浏览器支持矩阵

以下矩阵汇总本文档涉及的 APIs 在四大浏览器引擎中的支持状态（截至 2026-05）。

| API / 特性 | Chrome / Edge | Firefox | Safari | 数据来源 |
|-----------|---------------|---------|--------|---------|
| **Popover API** | ✅ 114+ | ✅ 125+ | ✅ 17+ | [Can I Use](https://caniuse.com/mdn-html_global_attributes_popover) |
| **Anchor Positioning** | ✅ 125+ | ❌ 开发中 | ❌ 暂无计划 | [Chrome Status](https://chromestatus.com/feature/5124922471874560) |
| **View Transitions (SPA)** | ✅ 111+ | 🔄 Nightly | ✅ 18+ | [Can I Use](https://caniuse.com/view-transitions) |
| **View Transitions (MPA)** | ✅ 126+ | ❌ | ❌ | [Chrome Status](https://chromestatus.com/feature/5089552515604480) |
| **Invokers** | ✅ 135+ | ❌ 跟进中 | ❌ | [Chrome Status](https://chromestatus.com/feature/5147117519360000) |
| **Performance Observer (LCP/CLS/INP)** | ✅ 全部 | ✅ 全部 | ✅ 16.4+ | [Can I Use](https://caniuse.com/mdn-api_performanceobserver) |
| **Long Animation Frames** | ✅ 123+ | ❌ | ❌ | [Chrome Status](https://chromestatus.com/feature/5083883711217664) |
| **Resource Timing L3** | ✅ 全部 | ✅ 142+ | ✅ 16.4+ | [Can I Use](https://caniuse.com/resource-timing) |
| **IndexedDB v3** | ✅ 全部 | ✅ 全部 | ✅ 全部 | [Can I Use](https://caniuse.com/indexeddb) |
| **Cache API** | ✅ 全部 | ✅ 全部 | ✅ 全部 | [Can I Use](https://caniuse.com/cachestorage) |
| **OPFS** | ✅ 102+ | ✅ 111+ | ✅ 15.2+ | [Can I Use](https://caniuse.com/mdn-api_storage_manager_getdirectory) |
| **Fetch `priority`** | ✅ 全部 | ✅ 全部 | ✅ 全部 | [Can I Use](https://caniuse.com/mdn-api_request_priority) |
| **AbortController** | ✅ 全部 | ✅ 全部 | ✅ 全部 | [Can I Use](https://caniuse.com/abortcontroller) |
| **Streams API** | ✅ 全部 | ✅ 全部 | ✅ 全部 | [Can I Use](https://caniuse.com/streams) |
| **Background Fetch** | ✅ 74+ | ❌ | ❌ | [Can I Use](https://caniuse.com/background-fetch) |
| **Web Codecs** | ✅ 94+ | ✅ 133+ | ❌ | [Can I Use](https://caniuse.com/webcodecs) |
| **getDisplayMedia** | ✅ 全部 | ✅ 全部 | ✅ 全部 | [Can I Use](https://caniuse.com/screen-sharing) |
| **Web Audio / AudioWorklet** | ✅ 全部 | ✅ 全部 | ✅ 全部 | [Can I Use](https://caniuse.com/mdn-api_audioworklet) |
| **Credential Management** | ✅ 51+ | ⚠️ 有限 | ❌ | [Can I Use](https://caniuse.com/credential-management) |
| **WebAuthn / Passkeys** | ✅ 全部 | ✅ 122+ | ✅ 16+ | [Can I Use](https://caniuse.com/webauthn) |
| **Permissions API** | ✅ 43+ | ✅ 77+ | ✅ 16+ | [Can I Use](https://caniuse.com/permissions-api) |
| **Web Bluetooth** | ✅ 56+ | ❌ | ❌ | [Can I Use](https://caniuse.com/web-bluetooth) |
| **Web Serial** | ✅ 89+ | ❌ | ❌ | [Can I Use](https://caniuse.com/web-serial) |
| **WebUSB** | ✅ 61+ | 🔄 开发中 | ❌ | [Can I Use](https://caniuse.com/webusb) |
| **Geolocation** | ✅ 全部 | ✅ 全部 | ✅ 全部 | [Can I Use](https://caniuse.com/geolocation) |
| **Service Worker** | ✅ 全部 | ✅ 全部 | ✅ 全部 | [Can I Use](https://caniuse.com/serviceworkers) |
| **Background Sync** | ✅ 49+ | ❌ | ❌ | [Can I Use](https://caniuse.com/background-sync) |
| **Periodic Background Sync** | ✅ 80+ | ❌ | ❌ | [Can I Use](https://caniuse.com/periodic-background-sync) |

**图例：** ✅ 已支持 | 🔄 开发中 | ⚠️ 部分支持 | ❌ 未支持

---

## 兼容性处理策略

### Feature Detection (特性检测)

始终优先使用特性检测而非浏览器嗅探：

```javascript
// ✅ 推荐：特性检测
if ('geolocation' in navigator) {
  navigator.geolocation.getCurrentPosition(...);
} else {
  // 降级方案
}

// ✅ 推荐：异步检测 + 优雅降级
async function getStorage() {
  if ('storage' in navigator && navigator.storage.getDirectory) {
    return navigator.storage.getDirectory(); // OPFS
  }
  // 降级到 IndexedDB 文件存储
  return createIndexedDBStorage();
}

// ❌ 避免：UA 嗅探
if (/Chrome/.test(navigator.userAgent)) { ... }
```

### Progressive Enhancement (渐进增强)

```javascript
// 从核心功能开始，逐步添加增强
class ImageGallery {
  constructor(element) {
    this.element = element;
    this.images = element.querySelectorAll('img');
    
    // 基础功能：所有浏览器支持
    this.setupBasicGallery();
    
    // 增强 1: View Transitions
    if (document.startViewTransition) {
      this.setupViewTransitions();
    }
    
    // 增强 2: Popover 详情
    if (HTMLElement.prototype.showPopover) {
      this.setupPopoverDetails();
    }
    
    // 增强 3: Anchor Positioning
    if (CSS.supports('anchor-name', '--test')) {
      this.setupAnchorPositioning();
    }
  }
}
```

### Polyfill 策略

```javascript
// 1. 按需加载 Polyfill
async function loadPolyfills() {
  const polyfills = [];
  
  if (!('groupBy' in Object)) {
    polyfills.push(import('core-js/features/object/group-by'));
  }
  
  if (!globalThis.ResizeObserver) {
    polyfills.push(import('resize-observer-polyfill'));
  }
  
  await Promise.all(polyfills);
}

// 2. 轻量级 ponyfill（不污染原型）
function groupBy(items, callbackFn) {
  if ('groupBy' in Object) {
    return Object.groupBy(items, callbackFn);
  }
  // 手动实现
  return items.reduce((acc, item) => {
    const key = callbackFn(item);
    (acc[key] ??= []).push(item);
    return acc;
  }, {});
}

// 3. Baseline 检查工具
function supportsBaseline2024() {
  return [
    () => CSS.supports('selector(:has(*))'),
    () => 'structuredClone' in globalThis,
    () => 'groupBy' in Object,
    () => HTMLElement.prototype.showPopover,
  ].every(test => test());
}
```

### 数据来源与持续追踪

| 来源 | 用途 | URL |
|------|------|-----|
| Can I Use | 浏览器支持矩阵查询 | https://caniuse.com/ |
| MDN Baseline | 标准特性可用性定义 | https://developer.mozilla.org/en-US/docs/Glossary/Baseline |
| Chrome Status | Chromium 特性开发状态 | https://chromestatus.com/ |
| Web Platform Tests | 跨浏览器一致性测试 | https://wpt.fyi/ |
| Baseline Dashboard | WebDX 社区维护 | https://web-platform-dx.github.io/web-features/ |

---

## Web Platform 新 APIs（速览）

### 视图过渡与动画

```javascript
// View Transitions API (Baseline 2025)
document.startViewTransition(() => updateDOM());
```

| API | 说明 | 支持 |
|-----|------|------|
| **View Transitions** | 跨页面/同页面 DOM 变更的平滑动画 | Chrome 126+, Firefox 开发中 |
| **Scroll-driven Animations** | CSS 动画由滚动位置驱动 | Chrome 115+, Safari 18+ |
| **Popover API** | 原生弹窗/下拉/提示 | Baseline 2024 |
| **Anchor Positioning** | 元素相对于锚点定位 | Chrome 125+, Firefox 开发中 |

### 性能与加载

| API | 说明 | 支持 |
|-----|------|------|
| **Speculation Rules** | 预渲染/预取下一页 | Chrome 121+ |
| **Long Animation Frames** | 测量长动画帧耗时 | Chrome 123+ |
| **Early Hints (103)** | 服务器提前发送资源提示 | 服务器 + 浏览器协作 |
| **Critical-CH** | 客户端提示的优先级处理 | Chrome 108+ |

### 存储与文件

| API | 说明 | 支持 |
|-----|------|------|
| **Storage Buckets** | 隔离的存储分区 | Chrome 122+ |
| **OPFS (Origin Private FS)** | 高性能文件系统访问 | Baseline 2023 |
| **File System Access** | 原生文件选择器 | Chrome/Edge |

### 安全与隐私

| API | 说明 | 支持 |
|-----|------|------|
| **Trusted Types** | 防止 DOM XSS | Chrome 83+ |
| **Credential Management** | Passkeys / WebAuthn | Baseline 2024 |
| **Storage Access API** | 跨站 Cookie 访问请求 | Baseline 2024 |
| **CHIPS** | 分区第三方 Cookie | Chrome 114+ |

### PWA 与设备集成

| API | 说明 | 支持 |
|-----|------|------|
| **Badging API** | 应用图标角标 | Baseline 2024 |
| **Contact Picker** | 访问设备联系人 | Chrome 80+ |
| **File Handling** | PWA 作为文件默认打开方式 | Chrome 102+ |
| **Web Share API Level 2** | 分享文件 | Baseline 2023 |
| **Window Controls Overlay** | 自定义标题栏 | Chrome 105+ |

---

## 网络 APIs

| API | 说明 | 支持 |
|-----|------|------|
| **fetch priority** | `fetch(url, { priority: 'high' })` | Baseline 2024 |
| **fetch streaming** | 请求/响应流式处理 | Baseline 2022 |
| **WebTransport** | HTTP/3 双向流 | Chrome 97+ |
| **Compression Streams** | 原生 gzip/deflate | Baseline 2023 |

---

## WebAssembly 2025/2026

| 特性 | 说明 | 状态 |
|------|------|------|
| **WASM 2.0** | 多内存、SIMD、异常处理 | 广泛支持 |
| **Component Model** | 跨语言组件接口 | 预览阶段 |
| **WASI Preview 2** | 系统接口标准化 | 预览阶段 |
| **JS String Builtins** | 直接操作 JS 字符串 | 提案中 |

---

## Baseline 概念

**Baseline**: WebDX 社区组定义的标准，表示一个 Web 平台特性在所有主流浏览器（Chrome、Edge、Firefox、Safari）中可用。

- **Baseline 2024**: 2024 年及之前在所有浏览器中可用的特性
- **Baseline 2025**: 2025 年达成广泛支持的特性
- **Newly available**: 刚在所有浏览器中可用

---

## 参考资源

- [MDN Baseline](https://developer.mozilla.org/en-US/docs/Glossary/Baseline)
- [Web Platform Baseline](https://web-platform-dx.github.io/web-features/)
- [Can I Use](https://caniuse.com/)
- [ECMAScript Proposals](https://github.com/tc39/proposals)
- [Chrome Status](https://chromestatus.com/)
- [Web Platform Tests](https://wpt.fyi/)
