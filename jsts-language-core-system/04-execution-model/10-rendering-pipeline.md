# 渲染管线与事件循环

> requestAnimationFrame、重排重绘与性能优化
>
> 对齐版本：HTML Living Standard | CSSOM

---

## 1. 浏览器渲染管线

```
JavaScript → Style → Layout → Paint → Composite
```

| 阶段 | 说明 | 触发条件 |
|------|------|---------|
| JavaScript | 执行 JS 代码 | 主线程执行 |
| Style | 计算 CSS 样式 | 元素样式变更 |
| Layout | 计算元素几何位置（重排）| 几何属性变更 |
| Paint | 绘制像素（重绘）| 视觉属性变更 |
| Composite | 合成图层 | 使用 GPU 加速的变换 |

---

## 2. requestAnimationFrame

### 2.1 与事件循环的关系

`requestAnimationFrame`（rAF）在**渲染阶段之前**执行：

```javascript
function animate() {
  updatePosition();
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
```

### 2.2 与屏幕刷新率同步

rAF 回调在每次屏幕刷新前执行（通常 60Hz = 16.7ms）：

```javascript
let lastTime = 0;
function loop(timestamp) {
  const delta = timestamp - lastTime;
  lastTime = timestamp;

  update(delta);
  render();

  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
```

---

## 3. 重排（Reflow）与重绘（Repaint）

### 3.1 触发条件

**重排（几何属性变更）**：

```css
width, height, padding, margin, border, position, top, left, display, font-size
```

**重绘（视觉属性变更）**：

```css
color, background-color, visibility, box-shadow, border-radius
```

### 3.2 优化策略

```javascript
// ❌ 多次读写导致强制同步布局
for (let i = 0; i < 100; i++) {
  const height = element.clientHeight; // 读
  element.style.height = height + 1 + "px"; // 写 → 触发重排
}

// ✅ 批量操作
const heights = [];
for (let i = 0; i < 100; i++) {
  heights.push(elements[i].clientHeight);
}
for (let i = 0; i < 100; i++) {
  elements[i].style.height = heights[i] + 1 + "px";
}
```

---

## 4. 事件循环与渲染的交互

```
执行宏任务 → 清空微任务 → rAF → Style → Layout → Paint → Composite → 下一帧
```

---

## 5. 性能模式

### 5.1 节流（Throttle）

```javascript
function throttle(fn, delay) {
  let lastTime = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastTime >= delay) {
      lastTime = now;
      fn.apply(this, args);
    }
  };
}

window.addEventListener("scroll", throttle(handleScroll, 100));
```

### 5.2 防抖（Debounce）

```javascript
function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

window.addEventListener("resize", debounce(handleResize, 200));
```

### 5.3 requestIdleCallback

```javascript
requestIdleCallback((deadline) => {
  while (deadline.timeRemaining() > 0) {
    doLowPriorityWork();
  }
});
```

---

## 6. 常见陷阱

| 陷阱 | 说明 | 解决方案 |
|------|------|---------|
| 强制同步布局（FSL） | 先写后读样式导致立即重排 | 批量读写，使用 requestAnimationFrame |
| 在微任务中频繁修改样式 | 阻塞渲染 | 将样式修改放入 rAF |
| 无限制的 rAF 循环 | 后台标签页仍执行 | 使用 Page Visibility API 暂停 |

---

**参考规范**：HTML Living Standard §8.1.4.3 Update the rendering | CSSOM
