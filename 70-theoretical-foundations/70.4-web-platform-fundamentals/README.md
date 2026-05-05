# 70.4 Web Platform Fundamentals

## 目录概览

本目录收录浏览器平台核心机制的 L0 级理论深度分析，覆盖网络协议、安全模型、存储架构、并发模型等浏览器作为运行时平台的全栈机制。

### 网络与协议栈

- **21** 同源策略与跨域安全模型 — SOP、CORS、CSP、COOP/COEP、Site Isolation
- **22** Web 缓存架构与策略 — HTTP Cache、Service Worker Cache、IndexedDB、OPFS
- **23** WebSocket 与实时通信协议 — WebSocket、SSE、WebRTC、WebTransport
- **24** HTTP 协议栈 — HTTP/1.1、HTTP/2、HTTP/3/QUIC、TLS、DNS

### 运行时与并发

- [x] **25** JavaScript 事件循环与并发模型 — Event Loop、Microtask、Macrotask、Scheduling APIs
- [x] **26** Web 安全威胁模型与防御 — XSS、CSRF、Clickjacking、DOM Clobbering、Supply Chain
- [x] **27** 浏览器存储与持久化 — Cookie、Web Storage、IndexedDB、Cache API、OPFS
- [x] **28** Web Workers 与并行计算 — Dedicated/Shared/Service Workers、Worklets、WASM Threads

### 性能与架构

- [x] **29** CSS 架构与渲染管线关系 — Cascade、@layer、Container Queries、Houdini
- [x] **30** 资源加载与性能优化 — Resource Hints、Core Web Vitals、Priority Hints
- [x] **31** 导航与页面生命周期 — 从 URL 到 OnLoad、BFCache、Prerender、Navigation API
- [x] **32** 模块化系统与 Web Components — ES Modules、Import Maps、Module Federation
- [x] **33** 权限模型与隐私架构 — Permissions API、Privacy Sandbox、Fenced Frames

## 写作规范

每篇文档遵循统一标准：

- YAML frontmatter（含 `english-abstract`）
- `last-updated: 2026-05-05`
- ≥6 个可运行的 TypeScript 代码示例
- `对称差分析` 章节
- `工程决策矩阵` 章节
- `反例与局限性` 章节
- 参考文献 ≥8 条
