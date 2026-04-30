# Web 平台 API

> **定位**：`20-code-lab/20.1-fundamentals-lab/web-apis-lab/web-platform-apis`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块解决 Web 平台原生 API 的高效使用问题。涵盖 DOM、Fetch、Storage、Service Worker 等核心接口。

### 1.2 形式化基础

Web Platform APIs 基于 WHATWG 与 W3C 规范定义，其接口签名与行为由 Web IDL 描述，浏览器通过 C++ 绑定暴露给 JavaScript 运行时。

### 1.3 关键概念

| 概念 | 定义 | 关联 |
|------|------|------|
| Fetch API | 现代化的 HTTP 请求接口 | fetch-examples.ts |
| IntersectionObserver | 元素可见性的异步监听 | observer-api.ts |
| Service Worker | 后台代理脚本，支持离线与推送 | service-worker.ts |

### 1.4 API 家族对比

| API 家族 | 核心接口 | 执行上下文 | 典型用例 | 规范来源 |
|----------|----------|------------|----------|----------|
| Network | `fetch`, `XMLHttpRequest`, `WebSocket` | Window / Worker | 数据获取、实时通信 | WHATWG / W3C |
| Storage | `localStorage`, `IndexedDB`, `CacheStorage` | Window / Worker | 离线缓存、结构化存储 | WHATWG / W3C |
| Rendering | `DOM`, `Canvas`, `WebGL`, `WebGPU` | Window | 2D/3D 图形渲染 | W3C / GPU for the Web |
| Media | `MediaRecorder`, `WebRTC`, `Web Audio` | Window | 音视频采集与处理 | W3C / IETF |
| Device | `Geolocation`, `Orientation`, `USB`, `Bluetooth` | Window (SecureContext) | 硬件能力访问 | W3C / WebBluetooth CG |
| Workers | `Worker`, `SharedWorker`, `ServiceWorker` | 独立线程 | 后台计算、离线代理 | WHATWG / W3C |

---

## 二、设计原理

### 2.1 为什么存在

浏览器不仅是渲染引擎，更是功能丰富的应用平台。Web Platform APIs 提供了访问设备能力、网络通信和本地存储的标准接口。

### 2.2 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 现代 API | 性能与功能先进 | 兼容性限制 | 渐进增强 |
| 传统兼容 | 全浏览器支持 | 功能受限 | 遗留环境 |

### 2.3 与相关技术的对比

| 技术 | 执行环境 | 能力范围 | 安全性 | 典型用例 |
|------|----------|----------|--------|----------|
| Web Platform APIs | 浏览器/Worker | 受沙箱限制 | 同源/CSP | 跨平台应用 |
| Native App APIs | 操作系统 | 完整硬件访问 | 应用权限 | 高性能游戏 |
| Node.js APIs | 服务端 | 文件系统/网络 | 进程权限 | 后端服务 |
| Polyfill | 浏览器 | 模拟缺失 API | 同宿主 | 兼容性垫片 |

---

## 三、实践映射

### 3.1 从理论到代码

以下示例演示组合使用 Fetch、AbortController 与 IntersectionObserver 实现可中断的图片懒加载：

```typescript
// web-platform-apis-demo.ts
const controller = new AbortController();
const { signal } = controller;

// 可中断的请求
async function fetchWithTimeout(url: string, timeout = 5000) {
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { signal });
    clearTimeout(id);
    return res.blob();
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

// 懒加载观察器
const imgObserver = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      const img = entry.target as HTMLImageElement;
      fetchWithTimeout(img.dataset.src!)
        .then((blob) => {
          img.src = URL.createObjectURL(blob);
          imgObserver.unobserve(img);
        })
        .catch(console.error);
    }
  }
}, { rootMargin: '50px' });

document.querySelectorAll('img[data-src]').forEach((img) => imgObserver.observe(img));
```

#### Fetch + Streams 渐进式处理

`ReadableStream` 允许在下载过程中逐块处理数据，显著降低大文件处理的内存峰值：

```typescript
// fetch-streams-demo.ts
async function processLargeJsonStream(url: string) {
  const response = await fetch(url);
  if (!response.body) throw new Error('No readable body');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    // 按行或按 NDJSON 分块处理，避免一次性加载整个 payload
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      if (line.trim()) console.log('Chunk:', JSON.parse(line));
    }
  }
}
```

### 3.2 BroadcastChannel 跨标签页通信

```typescript
// broadcast-channel-demo.ts
// 同源不同标签页/iframe 之间的高效通信
const channel = new BroadcastChannel('app_sync');

channel.onmessage = (event) => {
  console.log('Received from another tab:', event.data);
};

// 发布消息到所有订阅的同源上下文
channel.postMessage({ type: 'SESSION_UPDATE', payload: { userId: 'u-42' } });

// 清理
// channel.close();
```

### 3.3 ResizeObserver 与 PerformanceObserver

```typescript
// observers-combo.ts
// 监听元素尺寸变化（比 window.resize 更精确）
const ro = new ResizeObserver((entries) => {
  for (const entry of entries) {
    const { width, height } = entry.contentRect;
    console.log(`Element ${entry.target.tagName} resized to ${width}x${height}`);
  }
});
ro.observe(document.getElementById('responsive-canvas')!);

// 监听性能指标（如 LCP, FID, CLS）
const po = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log(`[Performance] ${entry.name}: ${(entry as any).startTime}`);
  }
});
po.observe({ type: 'web-vitals' } as any); // buffered flag available in modern browsers
```

### 3.4 Web Worker 中的结构化克隆与 Transferable

```typescript
// worker-demo.ts
// main.ts
const worker = new Worker(new URL('./heavy-calc.worker.ts', import.meta.url));

const bigBuffer = new Float64Array(1_000_000);
worker.postMessage({ data: bigBuffer }, [bigBuffer.buffer]);
// bigBuffer 在此处已被 transfer，主线程不可再访问

worker.onmessage = (e) => {
  console.log('Result from worker:', e.data.sum);
};

// heavy-calc.worker.ts
self.onmessage = (e) => {
  const arr = e.data.data as Float64Array;
  let sum = 0;
  for (let i = 0; i < arr.length; i++) sum += arr[i];
  self.postMessage({ sum });
};
```

### 3.5 Notification API 与 Push Manager 基础

```typescript
// notification-push-demo.ts
// 请求通知权限并显示本地通知
async function showLocalNotification(title: string, body: string) {
  const permission = await Notification.requestPermission();
  if (permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      tag: 'message-1', // 相同 tag 会替换旧通知
    });
  }
}

// Push 订阅（需配合 Service Worker）
async function subscribeToPush() {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  });
  await fetch('/api/push-subscription', {
    method: 'POST',
    body: JSON.stringify(subscription),
    headers: { 'Content-Type': 'application/json' },
  });
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from(rawData, (c) => c.charCodeAt(0));
}
```

### 3.6 Geolocation API 与坐标处理

```typescript
// geolocation-demo.ts
function getCurrentPosition(timeout = 5000): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout,
      maximumAge: 60000,
    });
  });
}

// 计算两点间距离（Haversine 公式）
function haversineDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371e3; // 地球半径（米）
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// 使用
const pos = await getCurrentPosition();
console.log(`Accuracy: ${pos.coords.accuracy}m`);
console.log(`Distance to target: ${haversineDistance(pos.coords.latitude, pos.coords.longitude, 39.9, 116.4).toFixed(0)}m`);
```

### 3.7 常见误区

| 误区 | 正确理解 |
|------|---------|
| 现代 API 已全平台支持 | 需检查 caniuse 和降级方案 |
| DOM 操作总是同步的 | 部分 API 如 IntersectionObserver 是异步回调 |
| Fetch 会默认携带 cookie | 需显式设置 `credentials: 'include'` |

### 3.8 扩展阅读

- [MDN Web APIs](https://developer.mozilla.org/en-US/docs/Web/API)
- [WHATWG Fetch Living Standard](https://fetch.spec.whatwg.org/)
- [WHATWG Streams Living Standard](https://streams.spec.whatwg.org/)
- [W3C Service Workers](https://www.w3.org/TR/service-workers/)
- [W3C WebGPU](https://www.w3.org/TR/webgpu/)
- [web.dev — Reliable and fast PWA](https://web.dev/reliable/)
- [web.dev — Streams API](https://web.dev/streams/)
- [Can I use — Browser support tables](https://caniuse.com/)
- [WebIDL Spec — W3C](https://webidl.spec.whatwg.org/)
- [MDN BroadcastChannel API](https://developer.mozilla.org/en-US/docs/Web/API/Broadcast_Channel_API) — 跨上下文广播通信
- [MDN ResizeObserver](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver) — 元素级尺寸监听
- [web.dev — Core Web Vitals](https://web.dev/articles/vitals) — 性能指标与测量
- [Web Workers Spec — WHATWG](https://html.spec.whatwg.org/multipage/workers.html) — 官方多线程规范
- [Credential Management API](https://developer.mozilla.org/en-US/docs/Web/API/Credential_Management_API) — 凭据管理
- [MDN — Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API) — 通知与推送
- [MDN — Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API) — Web Push 规范
- [MDN — Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API) — 地理位置
- [web.dev — Notification Patterns](https://web.dev/articles/notification-patterns) — 通知最佳实践
- [W3C — Web Notifications](https://notifications.spec.whatwg.org/) — 通知规范
- [W3C — Push API](https://w3c.github.io/push-api/) — Push API 规范
- [GoogleChromeLabs — Web Capabilities](https://github.com/GoogleChromeLabs/web-capabilities) — 现代 Web 能力进展

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
