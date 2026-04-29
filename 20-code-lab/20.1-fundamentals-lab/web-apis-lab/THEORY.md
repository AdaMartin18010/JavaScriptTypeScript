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
