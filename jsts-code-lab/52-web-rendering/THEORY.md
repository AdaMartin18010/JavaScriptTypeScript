# Web 渲染 — 理论基础

## 1. 浏览器渲染流水线

```
HTML → DOM
CSS → CSSOM
DOM + CSSOM → Render Tree → Layout → Paint → Composite
```

### 关键阶段

- **Layout（重排）**: 计算元素几何位置，开销最大
- **Paint（重绘）**: 绘制像素，较 Layout 轻量
- **Composite（合成）**: GPU 合成图层，开销最小

## 2. CSR vs SSR vs SSG vs ISR

| 模式 | 渲染位置 | 首次加载 | SEO | 交互性 |
|------|---------|---------|-----|--------|
| **CSR** | 浏览器 | 慢（需下载 JS）| 差 | 好 |
| **SSR** | 服务端 | 快 | 好 | 好 |
| **SSG** | 构建时 | 最快 | 好 | 好 |
| **ISR** | 构建+增量 | 快 | 好 | 好 |
| **RSC** | 服务端组件 | 快 | 好 | 好 |

## 3. 流式渲染

服务端逐步发送 HTML：

- **Suspense**: 占位符 + 异步数据填充
- **Selective Hydration**: 优先交互关键部分注水
- **Progressive Enhancement**: 核心内容立即可见，增强功能逐步加载

## 4. 渲染优化

- **避免 Layout Thrashing**: 批量读写 DOM 属性
- **使用 transform/opacity**: 触发 Composite 而非 Layout
- **CSS contain**: 隔离布局影响范围
- **content-visibility**: 延迟视口外元素渲染

## 5. 与相邻模块的关系

- **18-frontend-frameworks**: 框架的渲染策略
- **50-browser-runtime**: 浏览器运行时架构
- **37-pwa**: PWA 的渲染优化
