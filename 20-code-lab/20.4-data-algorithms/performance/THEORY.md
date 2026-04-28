# 性能优化 — 理论基础

## 1. 性能指标

| 指标 | 定义 | 优化目标 |
|------|------|---------|
| **FP** | First Paint | < 1.8s |
| **FCP** | First Contentful Paint | < 1.8s |
| **LCP** | Largest Contentful Paint | < 2.5s |
| **FID** | First Input Delay | < 100ms |
| **CLS** | Cumulative Layout Shift | < 0.1 |
| **TTFB** | Time to First Byte | < 600ms |
| **INP** | Interaction to Next Paint | < 200ms |

## 2. 渲染优化

### 2.1 关键渲染路径

```
HTML → DOM
CSS → CSSOM
DOM + CSSOM → Render Tree → Layout → Paint → Composite
```

优化策略：减少 DOM 深度、避免布局抖动（Layout Thrashing）、使用 CSS transform（GPU 加速）。

### 2.2 代码分割

- **路由级分割**: 按页面懒加载
- **组件级分割**: 按使用场景懒加载（如弹窗、图表）
- **Tree Shaking**: 消除未使用代码（依赖 ES Module 静态分析）

## 3. 网络优化

- **HTTP/2 多路复用**: 单一连接并行传输多个请求
- **HTTP/3 QUIC**: 基于 UDP，减少握手延迟，改善弱网环境
- **资源优先级**: `preload`、`prefetch`、`preconnect` 提示浏览器资源加载优先级
- **压缩**: Brotli > Gzip，文本资源压缩率提升 15-25%

## 4. 内存优化

- **对象池**: 复用对象减少 GC 压力
- **WeakMap/WeakSet**: 允许垃圾回收的引用
- **内存泄漏检测**: Chrome DevTools Heap Snapshot、Performance Monitor
- **常见泄漏**: 未移除的事件监听器、闭包引用全局变量、定时器未清理

## 5. 与相邻模块的关系

- **11-benchmarks**: 性能测试方法论
- **39-performance-monitoring**: 生产环境性能监控
- **54-intelligent-performance**: AI 辅助性能优化
