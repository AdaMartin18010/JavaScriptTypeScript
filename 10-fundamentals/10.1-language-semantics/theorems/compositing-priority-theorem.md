# 定理 4：合成优先定理

> **定位**：`10-fundamentals/10.1-language-semantics/theorems/`
> **关联**：`30-knowledge-base/30.6-patterns/RENDERING_PERFORMANCE.md`

---

## 定理陈述

**合成优先定理**：`transform: translate()` 与 `top`/`left` 动画在视觉上等价，但前者跳过 Layout 与 Paint 阶段，由 Compositor Thread 独立处理，因此即使主线程被 JS 阻塞，动画仍保持流畅。

---

## 浏览器合成层（Compositor Layer）理论

现代浏览器采用多进程/多线程架构，渲染流程涉及三条关键线程：

| 线程 | 职责 | 对动画的影响 |
|------|------|-------------|
| **Main Thread** | JS 执行、Style 计算、Layout、Paint | 被 JS 阻塞时动画卡顿 |
| **Compositor Thread** | 图层合成、屏幕输出、滚动/变换处理 | 独立于主线程，GPU 加速 |
| **Raster Thread** | 位图光栅化（Paint 结果→GPU 纹理） | 可并行，但受 Paint 阶段产出制约 |

**图层提升（Layer Promotion）**：当元素满足特定条件（如 `will-change: transform`、`transform: translateZ(0)`、CSS 动画/过渡作用于合成属性）时，浏览器将其提升为独立的 **Compositor Layer**，存储为 GPU 纹理。此后对该属性的变更仅需重新合成，无需重走 Layout → Paint。

---

## 推理树

```
                    [公理1: 渲染管道五阶段公理]
                    JS → Style → Layout → Paint → Composite
                           │
                    [公理2: 帧预算公理]
                    60fps = 16.6ms/帧，实际可用 ≈ 10ms
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
    [引理: 属性变更触发阶段不同]      [引理: Compositor Thread 独立]
    不同 CSS 属性影响不同渲染阶段       合成线程独立于主线程运行
              │                         │
              └────────────┬────────────┘
                           ▼
              [三种渲染路径]
                           │
              变更什么属性？
              ┌────────────┼────────────┐
              ▼            ▼            ▼
         几何属性      视觉属性      合成属性
         width        color         transform
         height       background    opacity
         top          box-shadow
         left         visibility
              │            │            │
              ▼            ▼            ▼
         [完整管道]    [绘制+合成]    [仅合成]
         5阶段全走     跳过 Layout    跳过 Layout+Paint
         成本最高      成本中等       成本最低
              │            │            │
              │            │            ▼
              │            │       GPU 直接处理
              │            │       主线程阻塞无关
              │            │            │
              └────────────┴────────────┘
                           ▼
              [合成优先策略]
              所有位移动画使用 transform
              所有淡入淡出使用 opacity
              避免触发 Layout（Reflow）
```

---

## 性能数据对比

| 动画类型 | 触发阶段 | GPU参与 | 主线程依赖 | 帧率稳定性 |
|---------|---------|---------|-----------|-----------|
| `top: 0 → 100px` | JS→Style→Layout→Paint→Composite | 仅Composite | 高 | ❌ 易掉帧 |
| `transform: translateY(100px)` | JS→Style→Composite | 全程 | 无 | ✅ 稳定60fps |

---

## 代码示例：`will-change` 优化与图层管理

```html
<!-- 优化前：触发 Layout + Paint -->
<style>
  .slow-box {
    position: absolute;
    top: 0;
    left: 0;
    animation: moveSlow 2s infinite alternate;
  }
  @keyframes moveSlow {
    from { top: 0; left: 0; }
    to   { top: 200px; left: 200px; }
  }
</style>
<div class="slow-box">❌ 触发 Reflow + Repaint</div>

<!-- 优化后：仅触发 Composite，GPU 加速 -->
<style>
  .fast-box {
    will-change: transform; /* 提示浏览器提前提升为合成层 */
    transform: translateZ(0); /* 强制图层提升（兼容性回退） */
    animation: moveFast 2s infinite alternate;
  }
  @keyframes moveFast {
    from { transform: translate(0, 0); }
    to   { transform: translate(200px, 200px); }
  }

  /* 动画结束后释放图层，避免内存爆炸 */
  .fast-box.animation-ended {
    will-change: auto;
  }
</style>
<div class="fast-box">✅ Compositor Thread 独立处理</div>
```

```javascript
// JavaScript 控制动画的优化模式
// 反模式：在 rAF 中修改几何属性
function badAnimation(element) {
  let pos = 0;
  function frame() {
    pos += 2;
    element.style.left = pos + 'px';      // ❌ 触发 Layout
    element.style.top  = pos + 'px';      // ❌ 触发 Layout
    requestAnimationFrame(frame);
  }
  frame();
}

// 优化模式：使用 transform + rAF
function goodAnimation(element) {
  let pos = 0;
  function frame() {
    pos += 2;
    element.style.transform = `translate(${pos}px, ${pos}px)`; // ✅ 仅 Composite
    requestAnimationFrame(frame);
  }
  frame();
}

// 使用 Web Animations API 进一步优化（浏览器自动选择合成属性）
const anim = element.animate(
  [{ transform: 'translate(0,0)' }, { transform: 'translate(200px,200px)' }],
  { duration: 2000, iterations: Infinity, direction: 'alternate' }
);
```

**代码示例：使用 CSS `contain` 隔离布局影响**

```css
/* contain: layout 防止子元素变化影响外部布局 */
.optimized-list {
  contain: layout;
  will-change: transform;
}

/* content-visibility 跳过视口外元素的渲染 */
.card {
  content-visibility: auto;
  contain-intrinsic-size: 0 300px;
}
```

```javascript
// 测量 Layout Thrashing（强制同步布局）
function measureLayoutThrashing() {
  const el = document.getElementById('test');

  // ❌ 强制同步布局：读取后立即写入，再读取
  const h1 = el.offsetHeight; // 读取（触发 Layout）
  el.style.height = (h1 + 10) + 'px'; // 写入（使 Layout 失效）
  const h2 = el.offsetHeight; // 再次读取（被迫重新 Layout）

  // ✅ 批量读取，批量写入
  const height = el.offsetHeight;
  requestAnimationFrame(() => {
    el.style.height = (height + 10) + 'px';
  });
}

// 使用 PerformanceObserver 监控长任务
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.duration > 50) {
      console.warn('Long task detected:', entry.duration, 'ms');
    }
  }
});
observer.observe({ entryTypes: ['longtask'] });
```

---

## 场景树：交互场景渲染策略

```
交互场景
├── 高频动画（滚动/拖拽）
│   └── 策略：仅 transform/opacity
│   └── 原理：Compositor Thread 独立处理
│
├── 内容变更（文本/图片更新）
│   └── 策略：content-visibility: auto
│   └── 原理：延迟视口外元素 Layout/Paint
│
├── 复杂列表（虚拟滚动）
│   └── 策略：虚拟化 + requestIdleCallback
│   └── 原理：减少 DOM 节点数，利用空闲时间预渲染
│
└── 用户输入（表单/按钮）
    └── 策略：防抖/节流 + CSS 过渡
    └── 原理：控制 JS 执行频率，避免阻塞输入响应
```

---

## 权威参考链接

| 资源 | 说明 | 链接 |
|------|------|------|
| **Blink Rendering Pipeline** | Chromium 官方渲染管线文档 | [developers.google.com/web/fundamentals/performance/rendering](https://developers.google.com/web/fundamentals/performance/rendering) |
| **CSS Triggers** | 各 CSS 属性触发的渲染阶段速查表 | [csstriggers.com](https://csstriggers.com) |
| **Web.dev: Optimize Web Animations** | Google 性能优化指南 | [web.dev/animations-guide](https://web.dev/animations-guide) |
| **W3C CSS Will Change** | `will-change` 规范定义 | [drafts.csswg.org/css-will-change](https://drafts.csswg.org/css-will-change) |
| **Chromium: Compositor Thread Architecture** | 合成线程架构设计文档 | [chromium.googlesource.com/chromium/src/+/main/docs/compositor_thread.md](https://chromium.googlesource.com/chromium/src/+/main/docs/compositor_thread.md) |
| **MDN: Controlling composite animation** | Firefox/Gecko 合成动画说明 | [developer.mozilla.org/en-US/docs/Web/Performance/How_browsers_work](https://developer.mozilla.org/en-US/docs/Web/Performance/How_browsers_work) |
| **Web.dev: Avoid Large, Complex Layouts** | 布局优化最佳实践 | [web.dev/avoid-large-complex-layouts-and-layout-thrashing](https://web.dev/avoid-large-complex-layouts-and-layout-thrashing) |
| **W3C CSS Containment** | `contain` 属性规范 | [drafts.csswg.org/css-contain](https://drafts.csswg.org/css-contain) |
| **High Performance Animations** | Paul Irish 经典性能文章 | [web.dev/animations-guide](https://web.dev/animations-guide) |

---

*本定理为 TS/JS 软件堆栈全景分析论证的五大核心定理之四。*
