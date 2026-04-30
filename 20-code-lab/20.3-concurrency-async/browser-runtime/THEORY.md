# 浏览器运行时深度解析

> **定位**：`20-code-lab/20.3-concurrency-async/browser-runtime`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 1. 简介

本文档深入解析浏览器运行时的核心机制，包括渲染管线、事件循环、垃圾回收等关键技术原理。

**学习目标**:
- 理解浏览器渲染的完整流程
- 掌握事件循环的并发模型
- 了解内存管理和性能优化策略

---

## 2. 理论基础

### 2.1 渲染管线的计算机图形学基础

### 1.1 渲染流水线概览

浏览器渲染本质上是将 DOM/CSS 转换为像素的过程，涉及计算机图形学的核心概念：

```
DOM + CSSOM → Render Tree → Layout → Paint → Composite → Pixels
```

**每一阶段的形式化定义**：

#### Render Tree 构建

```
RenderObject = f(DOMNode, ComputedStyle)

其中：
- 可见性判定：display ≠ none ∧ visibility ≠ hidden
- 样式继承：Cascading 算法计算最终样式
- 盒模型：content + padding + border + margin
```

#### Layout（Reflow）

```
几何属性 = { width, height, x, y, position, ... }

布局算法的复杂度：
- 块级布局：O(n) - 线性遍历
- 表格布局：O(n²) - 单元格相互依赖
- Flexbox：O(n) - 两遍扫描
- Grid：O(n²) - 二维约束求解
```

**布局抖动（Layout Thrashing）原理**：

```javascript
// 强制同步布局的读写循环
for (let i = 0; i < elements.length; i++) {
    const height = elements[i].offsetHeight;  // 读 → 触发布局计算
    elements[i].style.height = height * 2 + 'px';  // 写 → 标记脏布局
}
// 复杂度：O(n²) - 每次读写都触发完整布局
```

**解决方案 - FastDOM**：

```javascript
// 读写分离
const heights = elements.map(e => e.offsetHeight);  // 批量读
heights.forEach((h, i) => {
    elements[i].style.height = h * 2 + 'px';  // 批量写
});
// 复杂度：O(n) - 只触发两次布局
```

### 1.2 渲染优化理论

#### 渲染层（Layer）管理

```
渲染层的创建条件：
1. 3D 变换：transform: translate3d()
2. 视频元素
3. Canvas
4. opacity/animation
5. will-change 提示

层合并的成本模型：
- 每层的内存成本 = width × height × 4 bytes (RGBA)
- 层切换的 GPU 成本
- 最优层数：根据 GPU 内存动态调整
```

#### 合成器线程（Compositor Thread）

```
主线程                    合成器线程
--------                  ------------
JS 执行                    接收绘制四元树
样式计算                   栅格化图块
布局                      生成 GPU 命令
绘制记录 → IPC →         提交到 GPU

并行化收益：
- 滚动平滑度提升
- 主线程阻塞不影响视觉更新
```

## 2. 事件循环的并发模型

### 2.1 并发与并行的区别

```
并发 (Concurrency):
- 逻辑上的同时处理
- 单核 CPU 通过时间片轮转实现
- 关注任务的组织方式

并行 (Parallelism):
- 物理上的同时执行
- 需要多核 CPU
- 关注任务的执行方式

JavaScript:
- 单线程并发（Event Loop）
- Web Workers 提供并行能力
```

### 2.2 事件循环的形式化模型

**形式化定义**：

```
EventLoop = (TaskQueues, MicrotaskQueue, EventSource)

TaskQueues = {
    'user-blocking': Queue<Task>,
    'user-visible': Queue<Task>,
    'background': Queue<Task>
}

执行周期：
1. 从最高优先级非空队列取一个任务执行
2. 执行完成后，清空 MicrotaskQueue
3. 执行渲染（如果需要）
4. 重复
```

**优先级调度理论**：

```
基于优先级的事件调度避免了：
- 饿死（Starvation）：高优先级任务不断抢占
- 优先级反转：低优先级任务持有高优先级任务需要的资源

浏览器解决方案：
- 时间片限制（Long Task 检测）
- 优先级老化（Priority Aging）
```

### 2.3 微任务（Microtask）的语义

```
微任务队列的设计哲学：
- Promise 的 then/catch/finally
- async/await 的底层实现
- MutationObserver

关键保证：
在当前任务完成后、下一个任务开始前，
微任务队列必须被清空。

这确保了：
- Promise 的链式调用的原子性
- 状态变更的同步观察
```

### 2.4 requestAnimationFrame 与渲染时机

```javascript
// raf-demo.ts — 理解 requestAnimationFrame 在渲染管线中的位置
let frameCount = 0;

function animate() {
  // 此回调在样式计算和布局之前执行
  // 适合读取 layout 属性（此时值与上一帧一致，不会触发强制同步布局）
  const element = document.getElementById('box')!;
  
  // 1. 先读取（安全，不会触发 forced reflow）
  const currentLeft = parseInt(element.style.left || '0');
  
  // 2. 再写入（批量样式变更）
  element.style.left = `${currentLeft + 1}px`;
  element.style.transform = `translateX(${Math.sin(frameCount * 0.05) * 100}px)`;
  
  frameCount++;
  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
```

### 2.5 IntersectionObserver 与惰性加载

```typescript
// lazy-load.ts — 使用 IntersectionObserver 实现高性能图片懒加载
function lazyLoadImages() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = img.dataset.src!;
          img.classList.remove('lazy');
          observer.unobserve(img);
        }
      });
    },
    {
      rootMargin: '50px 0px', // 提前 50px 开始加载
      threshold: 0.01,
    }
  );

  document.querySelectorAll('img.lazy').forEach((img) => observer.observe(img));
}
```

### 2.6 requestIdleCallback 与后台任务调度

```typescript
// idle-callback.ts — 利用空闲时间执行非紧急任务
function scheduleIdleWork(tasks: (() => void)[]) {
  function workLoop(deadline: IdleDeadline) {
    while (tasks.length > 0 && deadline.timeRemaining() > 0) {
      const task = tasks.shift()!;
      task();
    }
    
    if (tasks.length > 0) {
      requestIdleCallback(workLoop, { timeout: 2000 });
    }
  }
  
  requestIdleCallback(workLoop, { timeout: 2000 });
}

// 使用：分片处理大量数据
const largeDataset = Array.from({ length: 10000 }, (_, i) => i);
const chunks = largeDataset.reduce<{ tasks: (() => void)[] }>(
  (acc, _, i) => {
    if (i % 100 === 0) acc.tasks.push(() => processChunk(largeDataset.slice(i, i + 100)));
    return acc;
  },
  { tasks: [] }
).tasks;

scheduleIdleWork(chunks);
```

## 3. 内存管理理论

### 3.1 垃圾回收算法

**分代假说（Generational Hypothesis）**：

```
弱分代假说：大多数对象朝生夕死
强分代假说：熬过多次收集的对象难以消亡

V8 的分代策略：
- 新生代（Young Generation）：存活时间短
  - 容量小，回收频繁
  - Scavenge 算法（复制算法）

- 老生代（Old Generation）：存活时间长
  - 容量大，回收不频繁
  - Mark-Sweep + Mark-Compact
```

**垃圾回收的三色标记法**：

```
白色：未被访问，可回收
灰色：已访问，但引用的对象未全部访问
黑色：已访问，引用的对象已全部访问

算法流程：
1. 根对象标记为灰色
2. 取出灰色对象，标记为黑色，引用对象标记为灰色
3. 重复直到没有灰色对象
4. 白色对象回收

增量标记：
将标记过程拆分为小步，与 JS 执行交替
避免长时间停顿（Stop-The-World）
```

### 3.2 内存泄漏模式

```javascript
// 1. 意外的全局变量
function leak() {
    globalVar = 'I am global';  // 没有声明
}

// 2. 闭包陷阱
function outer() {
    const hugeData = new Array(1000000);
    return function inner() {
        console.log('using hugeData');
    };
}
const fn = outer();  // hugeData 被闭包持有，无法释放

// 3. 事件监听器
class Component {
    constructor() {
        window.addEventListener('resize', this.handleResize);
    }
    // 忘记 removeEventListener 导致组件销毁后仍然被引用
}

// 4. 定时器/回调
const data = fetchData();
setInterval(() => {
    console.log(data);  // data 被闭包持有
}, 1000);
```

### 3.3 WeakRef 与 FinalizationRegistry 主动内存管理

```typescript
// weakref-cache.ts — 不阻止垃圾回收的缓存
class WeakRefCache<K, V extends object> {
  private cache = new Map<K, WeakRef<V>>();
  private registry = new FinalizationRegistry<K>((key) => {
    console.log(`[GC] Evicted: ${String(key)}`);
    this.cache.delete(key);
  });

  set(key: K, value: V): void {
    this.cache.set(key, new WeakRef(value));
    this.registry.register(value, key);
  }

  get(key: K): V | undefined {
    const ref = this.cache.get(key);
    return ref?.deref();
  }
}

// 使用：DOM 节点缓存
const nodeCache = new WeakRefCache<string, HTMLElement>();
nodeCache.set('header', document.getElementById('header')!);
// 当 DOM 被移除且没有其他强引用时，缓存自动失效
```

## 4. 性能指标的科学测量

### 4.1 Core Web Vitals 的统计学基础

**LCP (Largest Contentful Paint)**：

```
测量方法：
- 观察所有块级元素的绘制时间
- 取视口内最大元素的时间

百分位数统计：
- 报告 75th percentile
- 理由：对异常值不敏感，反映大多数用户体验

优化目标：
LCP < 2.5s (Good)
2.5s ≤ LCP < 4s (Needs Improvement)
LCP ≥ 4s (Poor)
```

**INP (Interaction to Next Paint)**：

```
交互延迟的完整链条：
用户输入 → 事件处理 → 样式计算 → 布局 → 绘制 → 合成

INP = max(交互延迟) for all interactions

优化策略：
1. 减少主线程阻塞（Long Tasks）
2. 使用 requestIdleCallback 处理非紧急任务
3. 虚拟滚动减少 DOM 节点数
```

### 4.2 性能预算（Performance Budget）

```
基于竞争分析的预算设定：

设竞争对手的加载时间为 T_competitor
我们的目标：T_target ≤ 0.8 × T_competitor

资源预算计算：
- JS 预算：总大小 / 压缩后大小 / 缓存命中率
- 图片预算：视口大小 × 设备像素比 × 格式效率
- 字体预算：字重数量 × 子集化程度
```

### 4.3 Long Tasks API 与主线程监控

```typescript
// long-tasks-monitor.ts — 检测并上报长任务
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.duration > 50) {
      // 超过 50ms 即视为长任务（RAIL 模型）
      console.warn('[Long Task]', entry.duration, 'ms', entry.attribution);
      
      // 上报到监控系统
      reportToAnalytics({
        type: 'long_task',
        duration: entry.duration,
        startTime: entry.startTime,
        containerSrc: (entry as any).attribution?.[0]?.containerSrc,
      });
    }
  }
});

observer.observe({ entryTypes: ['longtask'] });
```

## 5. 现代浏览器架构演进

### 5.1 多进程架构

```
Chrome 的多进程模型：

Browser Process (主进程)
    │
    ├── GPU Process (图形加速)
    │
    ├── Renderer Process x N (标签页)
    │       ├── Blink (渲染引擎)
    │       └── V8 (JS 引擎)
    │
    ├── Network Process (网络请求)
    │
    └── Plugin Process (插件隔离)

进程隔离的收益：
1. 稳定性：一个标签页崩溃不影响其他
2. 安全性：利用 OS 进程隔离机制
3. 性能：多核并行

成本：
- 内存开销：每个进程有基础开销
- 进程间通信：IPC 延迟
```

### 5.2 站点隔离（Site Isolation）

```
Spectre 漏洞后的安全架构：

原则：不同站点的页面运行在不同进程

例外处理：
- 同源的 iframe 可以共享进程
- 资源受限时，相同 eTLD+1 的站点可能共享

实现机制：
- 跨站点的数据访问需要 IPC
- 渲染进程无法直接访问其他站点的内存
```

## 6. 参考文献

### 6.1 规范文档

1. [HTML Standard - Event Loops](https://html.spec.whatwg.org/multipage/webappapis.html#event-loops). WHATWG.
2. [W3C Performance Timeline](https://www.w3.org/TR/performance-timeline/). W3C.
3. [W3C Long Tasks API](https://w3c.github.io/longtasks/). W3C.
4. [Web Vitals — Google](https://web.dev/vitals/). Google.

### 6.2 经典著作

1. Haverbeke, M. (2018). *Eloquent JavaScript* (3rd Edition). No Starch Press.
2. Stoyan, S. (2010). *JavaScript Patterns*. O'Reilly Media.

### 6.3 学术论文

1. Meyerovich, L. A., & Bodik, P. (2010). "Fast and Parallel Webpage Layout". *ACM SIGPLAN Notices*.
2. Hackett, B., & Guo, S. (2012). "Fast and Precise Hybrid Type Inference for JavaScript". *ACM SIGPLAN Notices*.

### 6.4 在线资源

- [Inside look at modern web browser](https://developers.google.com/web/updates/2018/09/inside-browser-part1) - Google Developers
- [The Anatomy of a Frame](https://aerotwist.com/blog/the-anatomy-of-a-frame/) - Paul Lewis
- [Web Performance Best Practices](https://developer.mozilla.org/en-US/docs/Web/Performance) - MDN Web Docs
- [High-Performance Browser Networking](https://hpbn.co/) - Ilya Grigorik
- [Google Chrome Developers — Rendering Performance](https://www.youtube.com/playlist?list=PLNYkxOF6rcICgS7eFJr9NZoIAjQovPz-y) - YouTube 系列
- [web.dev — Optimize JavaScript Execution](https://web.dev/optimize-javascript-execution/) - Google
- [web.dev — Avoid Large, Complex Layouts](https://web.dev/avoid-large-complex-layouts-and-layout-thrashing/) - Google
- [web.dev — Reduce the Scope of Style Calculations](https://web.dev/reduce-the-scope-and-complexity-of-style-calculations/) - Google
- [MDN — IntersectionObserver](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver) - MDN
- [MDN — requestIdleCallback](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback) - MDN
- [MDN — WeakRef](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakRef) - MDN
- [MDN — FinalizationRegistry](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/FinalizationRegistry) - MDN
- [V8 Blog — Trash talk](https://v8.dev/blog/trash-talk) - V8 垃圾回收详解
- [V8 Blog — Concurrent marking](https://v8.dev/blog/concurrent-marking) - V8 并发标记
- [web.dev — INP](https://web.dev/inp/) - Interaction to Next Paint 优化指南
- [Chromium Blog — Site Isolation](https://blog.chromium.org/2018/07/mitigating-spectre-with-site-isolation.html) - Chromium 站点隔离

---

## 模块代码文件索引

本模块包含以下可运行 TypeScript 代码文件，用于将上述理论概念转化为实践：

- `dom-virtualization-models.ts`
- `event-loop-architecture.ts`
- `index.ts`
- `memory-management-model.ts`
- `rendering-pipeline.ts`
- `v8-execution-model.ts`

> 💡 **学习建议**：阅读 THEORY.md 后，逐一运行上述代码文件，观察理论概念的实际行为。修改参数和边界条件，加深理解。

## 核心理论深化

### 关键设计模式

本模块涉及的核心设计模式包括（根据代码实现提炼）：

1. **批量读写分离**：避免 layout thrashing 的核心模式
2. **观察者模式**：MutationObserver、IntersectionObserver 等 API 的底层模式
3. **时间片调度**：requestIdleCallback 与任务分片的调度模式

### 与相邻模块的关系

| 相邻模块 | 关系说明 |
|---------|---------|
| `20.3-concurrency-async/web-workers` | Web Workers 提供并行能力，补充事件循环的并发模型 |
| `20.5-frontend-frameworks/` | 前端框架的虚拟 DOM diff 是对渲染管线的优化 |

---

### 2.7 scheduler.yield() 协作式调度

```typescript
// scheduler-yield.ts — 主动让出主线程，减少长任务
async function processLargeArray(items: number[]) {
  const results: number[] = [];
  for (let i = 0; i < items.length; i++) {
    results.push(heavyComputation(items[i]));
    // 每处理 50 项主动让出，避免阻塞事件循环
    if (i % 50 === 0 && 'scheduler' in globalThis) {
      await (globalThis as any).scheduler.yield();
    }
  }
  return results;
}
```

### 4.4 PerformanceObserver 测量 Core Web Vitals

```typescript
// web-vitals-observer.ts
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.entryType === 'largest-contentful-paint') {
      console.log('LCP:', entry.startTime);
    }
    if (entry.entryType === 'layout-shift') {
      console.log('CLS:', (entry as any).value);
    }
  }
});

observer.observe({ type: 'largest-contentful-paint', buffered: true });
observer.observe({ type: 'layout-shift', buffered: true });
```

### 新增参考文献

- [MDN — scheduler.yield()](https://developer.mozilla.org/en-US/docs/Web/API/Scheduler/yield) — 协作式任务调度 API
- [Chrome Developers — Core Web Vitals](https://web.dev/vitals/) — Google 官方 Web 性能指标
- [web.dev — Optimize INP](https://web.dev/optimize-inp/) — 交互延迟优化指南
- [W3C — Long Animation Frames API](https://w3c.github.io/long-animation-frames/) — 长动画帧规范
- [Google Chrome Labs — scheduler.yield Polyfill](https://github.com/GoogleChromeLabs/scheduler-yield-polyfill) — 调度器垫片

> 📅 理论深化更新：2026-04-30
