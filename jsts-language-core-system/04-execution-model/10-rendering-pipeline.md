# 渲染管线与事件循环

> requestAnimationFrame、重排重绘与性能优化

---

## 内容大纲（TODO）

### 1. 浏览器渲染管线

- JavaScript → Style → Layout → Paint → Composite

### 2. requestAnimationFrame

- 与事件循环的关系
- 与屏幕刷新率同步
- 最适合做动画更新

### 3. 重排（Reflow）与重绘（Repaint）

- 触发条件
- 优化策略

### 4. 事件循环与渲染的交互

- 渲染时机在事件循环中的位置
- 长时间任务对渲染的影响

### 5. 性能模式

- 节流（Throttle）
- 防抖（Debounce）
- requestIdleCallback

### 6. 常见陷阱

- 强制同步布局（Forced Synchronous Layout）
- 在微任务中频繁修改样式
