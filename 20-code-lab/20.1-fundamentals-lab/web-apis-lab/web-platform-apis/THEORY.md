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

### 3.2 常见误区

| 误区 | 正确理解 |
|------|---------|
| 现代 API 已全平台支持 | 需检查 caniuse 和降级方案 |
| DOM 操作总是同步的 | 部分 API 如 IntersectionObserver 是异步回调 |
| Fetch 会默认携带 cookie | 需显式设置 `credentials: 'include'` |

### 3.3 扩展阅读

- [MDN Web APIs](https://developer.mozilla.org/en-US/docs/Web/API)
- [WHATWG Fetch Living Standard](https://fetch.spec.whatwg.org/)
- [WHATWG Streams Living Standard](https://streams.spec.whatwg.org/)
- [W3C Service Workers](https://www.w3.org/TR/service-workers/)
- [W3C WebGPU](https://www.w3.org/TR/webgpu/)
- [web.dev — Reliable and fast PWA](https://web.dev/reliable/)
- [web.dev — Streams API](https://web.dev/streams/)
- [Can I use — Browser support tables](https://caniuse.com/)
- [WebIDL Spec — W3C](https://webidl.spec.whatwg.org/)

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
