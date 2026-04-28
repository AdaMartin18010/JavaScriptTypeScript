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

## 4. 与相邻模块的关系

- **50-browser-runtime**: 浏览器运行时架构
- **30-real-time-communication**: 实时通信协议与实现
- **37-pwa**: PWA 相关 API（Service Worker、Manifest）
