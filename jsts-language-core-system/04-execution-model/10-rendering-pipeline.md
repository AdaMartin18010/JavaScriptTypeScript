# 渲染管线与事件循环

> 浏览器渲染时机与 JavaScript 执行的关系
>
> 对齐版本：ECMAScript 2025 (ES16) | HTML Living Standard

---

## 1. 渲染管线阶段

```
JavaScript → Style → Layout → Paint → Composite
```

| 阶段 | 说明 |
|------|------|
| JavaScript | 执行 JS，修改 DOM/CSSOM |
| Style | 计算样式（CSS 匹配） |
| Layout | 计算布局（Reflow） |
| Paint | 绘制像素（Repaint） |
| Composite | 合成图层 |

---

## 2. 渲染时机

浏览器在以下时机执行渲染：

1. 宏任务执行完毕后（如果需要渲染）
2. `requestAnimationFrame` 回调之前
3. 每帧最多渲染一次（通常 60fps = 16.67ms）

---

## 3. requestAnimationFrame

```javascript
function animate() {
  // 在下一帧渲染前执行
  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
```

---

## 4. 优化策略

### 4.1 避免强制同步布局

```javascript
// ❌ 强制同步布局（Forced Synchronous Layout）
const width = element.offsetWidth; // 读取布局属性
element.style.width = width + 10 + "px"; // 修改样式

// ✅ 批量读取和写入
const width = element.offsetWidth;
// ... 所有读取 ...
requestAnimationFrame(() => {
  element.style.width = width + 10 + "px";
  // ... 所有写入 ...
});
```

---

**参考规范**：HTML Living Standard §8.1.6.2 Processing model
