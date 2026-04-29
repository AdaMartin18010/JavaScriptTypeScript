# Web APIs 实验室 — 理论基础

## 1. Web 平台 API 体系

现代浏览器提供超过 10,000 个 API，构成强大的客户端平台。核心 API 家族：

### 1.1 网络与通信

- **Fetch API**: 现代 HTTP 请求接口，支持流式、取消、进度追踪
- **WebSocket**: 全双工持久连接，适用于实时应用
- **Server-Sent Events (SSE)**: 服务端单向推送，基于 HTTP，自动重连
- **WebRTC**: P2P 音视频通信，无需服务器中转（仅信令需要）

### 1.2 存储

- **IndexedDB**: 结构化 NoSQL 数据库，支持事务和索引
- **Cache API**: Service Worker 控制的 HTTP 缓存
- **Storage API**: 持久化存储配额管理

### 1.3 性能

- **Performance API**: 高精度时间测量（navigation timing, resource timing）
- **Intersection Observer**: 高效元素可见性检测（懒加载）
- **Resize Observer**: 元素尺寸变化监听

## 2. Streams API

Streams 提供了一种处理大数据的内存高效方式：

```
ReadableStream → TransformStream → WritableStream
```

- **ReadableStream**: 数据源（文件、网络响应）
- **TransformStream**: 数据转换（压缩、加密、解析）
- **WritableStream**: 数据目的地（文件系统、网络）

## 3. 新兴 API

- **WebGPU**: 下一代图形与计算 API，替代 WebGL
- **File System Access API**: 直接读写本地文件（需用户授权）
- **Web Serial / USB / Bluetooth**: 硬件直接通信
- **SharedArrayBuffer + Atomics**: 多线程共享内存

## 4. Web API 兼容性矩阵

| API | Chrome | Firefox | Safari | Node.js | 稳定性 |
|-----|--------|---------|--------|---------|--------|
| Fetch API | 42+ | 39+ | 10.1+ | 18+ | 稳定 |
| WebSocket | 16+ | 11+ | 7+ | 原生 | 稳定 |
| Streams API | 76+ | 102+ | 有限 | 实验性 | 演进中 |
| WebGPU | 113+ |  behind flag | TP | 实验性 | 早期 |
| File System Access | 86+ | ❌ | ❌ | ❌ | 有限支持 |
| Web Serial | 89+ | ❌ | ❌ | ❌ | Chrome 独有 |

## 5. 代码示例：Fetch + Streams 流式处理

```javascript
// 流式读取大型 JSON 响应
const response = await fetch('/api/large-dataset');
const reader = response.body.getReader();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  // 分块处理数据，避免内存爆炸
  processChunk(value);
}

// AbortController 取消请求
const controller = new AbortController();
setTimeout(() => controller.abort(), 5000);
const res = await fetch('/api/slow', { signal: controller.signal });
```

## 6. 权威参考

- [MDN Web APIs](https://developer.mozilla.org/en-US/docs/Web/API) — 最全面的 Web API 文档
- [Can I Use](https://caniuse.com/) — 浏览器兼容性查询
- [WHATWG Standards](https://spec.whatwg.org/) —  living standards 规范
- [W3C Web Platform](https://www.w3.org/standards/) — W3C 标准文档

## 7. 与相邻模块的关系

- **50-browser-runtime**: 浏览器运行时架构
- **30-real-time-communication**: 实时通信协议与实现
- **37-pwa**: PWA 相关 API（Service Worker、Manifest）


---

## 7. 进阶代码示例

### Web Worker + SharedArrayBuffer 并行计算

```javascript
// main.js
const worker = new Worker('worker.js');
const shared = new SharedArrayBuffer(4);
const view = new Int32Array(shared);
Atomics.store(view, 0, 42);
worker.postMessage(shared);

// worker.js
self.onmessage = (e) => {
  const view = new Int32Array(e.data);
  console.log('Worker received:', Atomics.load(view, 0));
};
```

### BroadcastChannel 跨标签页通信

```javascript
// broadcast-channel.ts
const channel = new BroadcastChannel('app_sync');

channel.onmessage = (event) => {
  console.log('Received from other tab:', event.data);
};

function syncState(state) {
  channel.postMessage(state);
}

// Usage
syncState({ theme: 'dark', userId: '123' });
```

### Beacon API 埋点上报

```javascript
// beacon-tracker.ts
function sendAnalytics(data) {
  const payload = JSON.stringify(data);
  return navigator.sendBeacon('/analytics', new Blob([payload], { type: 'application/json' }));
}

// 页面卸载前确保上报
window.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    sendAnalytics({ event: 'page_hide', timestamp: Date.now() });
  }
});
```

### Web Serial API 读取设备

```javascript
// web-serial.ts
async function readSerialDevice() {
  const port = await navigator.serial.requestPort();
  await port.open({ baudRate: 9600 });
  const reader = port.readable.getReader();
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    console.log('Serial data:', value);
  }
}
```

### IntersectionObserver 懒加载 + 无限滚动

```typescript
// intersection-lazy.ts — 高性能图片懒加载与无限滚动

function createLazyLoader(options?: IntersectionObserverInit) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        img.src = img.dataset.src!;
        img.classList.remove('lazy');
        observer.unobserve(img);
      }
    });
  }, options);

  return {
    observe: (element: Element) => observer.observe(element),
    disconnect: () => observer.disconnect(),
  };
}

// 无限滚动 Sentinel
function createInfiniteScroll(
  sentinel: Element,
  onTrigger: () => Promise<boolean> // 返回 false 表示无更多数据
) {
  let loading = false;
  const observer = new IntersectionObserver(async (entries) => {
    const entry = entries[0];
    if (entry.isIntersecting && !loading) {
      loading = true;
      const hasMore = await onTrigger();
      if (!hasMore) observer.disconnect();
      loading = false;
    }
  }, { rootMargin: '200px' });

  observer.observe(sentinel);
  return () => observer.disconnect();
}
```

### PerformanceObserver — 核心 Web 指标采集

```typescript
// performance-metrics.ts — 采集 LCP, FID, CLS

function observeWebVitals(onReport: (metric: { name: string; value: number; id: string }) => void) {
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === 'web-vitals') {
        onReport({ name: entry.name, value: entry.startTime, id: (entry as any).id });
      }
    }
  });

  // Largest Contentful Paint
  new PerformanceObserver((list) => {
    const last = list.getEntries().at(-1);
    if (last) onReport({ name: 'LCP', value: last.startTime, id: last.name });
  }).observe({ type: 'largest-contentful-paint', buffered: true });

  // First Input Delay (via Event Timing)
  new PerformanceObserver((list) => {
    const first = list.getEntries()[0];
    if (first && (first as any).processingStart) {
      const fid = (first as any).processingStart - first.startTime;
      onReport({ name: 'FID', value: fid, id: first.name });
    }
  }).observe({ type: 'first-input', buffered: true });

  // Cumulative Layout Shift
  let clsValue = 0;
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!(entry as any).hadRecentInput) {
        clsValue += (entry as any).value;
      }
    }
    onReport({ name: 'CLS', value: clsValue, id: 'cls-session' });
  }).observe({ type: 'layout-shift', buffered: true });
}

// 使用
observeWebVitals((metric) => {
  console.log(`[Web Vital] ${metric.name}: ${metric.value}`);
  // 上报到分析服务
});
```

### ResizeObserver — 响应式组件尺寸追踪

```typescript
// resize-tracker.ts
function trackElementSize(
  element: Element,
  callback: (size: { width: number; height: number }) => void
) {
  const ro = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const cr = entry.contentRect;
      callback({ width: cr.width, height: cr.height });
    }
  });
  ro.observe(element);
  return () => ro.disconnect();
}
```

## 8. 新增权威参考链接

- [WebGPU Specification (W3C)](https://www.w3.org/TR/webgpu/) — W3C WebGPU 标准
- [Web Serial API (WICG)](https://wicg.github.io/serial/) — WICG 串行 API 草案
- [Web Bluetooth API (WICG)](https://webbluetoothcg.github.io/web-bluetooth/) — WICG 蓝牙 API
- [MDN — Beacon API](https://developer.mozilla.org/en-US/docs/Web/API/Beacon_API) — 埋点 API 文档
- [MDN — BroadcastChannel](https://developer.mozilla.org/en-US/docs/Web/API/Broadcast_Channel_API) — 跨标签页通信
- [Chrome Platform Status](https://chromestatus.com/) — Chrome 新特性状态追踪
- [WHATWG Streams Standard](https://streams.spec.whatwg.org/) — Streams 规范
- [MDN — IntersectionObserver](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
- [MDN — PerformanceObserver](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceObserver)
- [MDN — ResizeObserver](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver)
- [web.dev — Optimize Web Vitals](https://web.dev/articles/vitals)
- [web.dev — Lazy Loading Images](https://web.dev/articles/lazy-loading-images)
- [W3C — Web Performance Working Group](https://www.w3.org/webperf/)
