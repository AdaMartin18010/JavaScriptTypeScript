---
title: 浏览器渲染管线优化实战指南
description: '基于 Svelte 5 编译器特性的浏览器渲染性能优化实战指南，涵盖 INP 优化、Chrome DevTools 诊断、CSS 优化策略与生产监控'
keywords: 'INP 优化, Chrome DevTools, Svelte 性能, 渲染优化, CRP, Core Web Vitals, 生产监控'
---

# 浏览器渲染管线优化实战指南

> **定位**: [22-browser-rendering-pipeline](22-browser-rendering-pipeline.md) 的实战 companion 文档 | **深度**: 生产级优化指南
> **最后更新**: 2026-05-06 | **浏览器对齐**: Chrome 130+ / Firefox 128+ / Safari 18+ | **Svelte 对齐**: 5.55.5

---

## 快速诊断清单

在深入优化前，先用以下清单定位问题：

```markdown
## Svelte 应用渲染性能诊断清单

### 1. 测量指标
- [ ] 使用 web-vitals 库测量 INP、LCP、CLS
- [ ] Chrome DevTools Performance 面板录制 10 秒交互
- [ ] Lighthouse CI 集成到构建流程

### 2. JavaScript 执行
- [ ] $effect 中是否有 >50ms 的长任务？
- [ ] 是否有大量 derived 同时失效？
- [ ] flushSync() 是否被频繁调用？

### 3. DOM 操作
- [ ] 列表渲染是否使用 {#each} 的 key？
- [ ] 是否有条件渲染导致的频繁挂载/卸载？
- [ ] 是否使用了 DocumentFragment 批量插入？

### 4. 样式计算
- [ ] 是否使用了 CSS containment？
- [ ] 选择器复杂度是否过高？
- [ ] 是否有大量动态 class 切换？

### 5. 布局
- [ ] 是否读取了 offsetWidth/Height 后写入？
- [ ] 是否有动画修改了 layout 属性？
- [ ] 是否使用了 transform 替代 top/left？
```

---

## 一、INP 优化实战

### 1.1 INP 测量与基线

INP（Interaction to Next Paint）是 Core Web Vitals 中衡量交互响应性的核心指标。它记录用户交互（点击、按键、触摸）到浏览器绘制下一帧视觉反馈之间的**最长延迟**。

```javascript
// src/lib/vitals.ts
import { onINP, onLCP, onCLS } from 'web-vitals';

export function initWebVitals() {
  onINP((metric) => {
    // 发送到分析平台
    sendToAnalytics('INP', metric);

    // 开发环境打印详情
    if (import.meta.env.DEV) {
      console.log(`INP: ${metric.value}ms`, metric.entries);
      // 分解延迟来源
      metric.entries.forEach(entry => {
        console.log('  事件处理:', entry.processingStart - entry.startTime, 'ms');
        console.log('  处理耗时:', entry.processingEnd - entry.processingStart, 'ms');
        console.log('  渲染等待:', entry.duration - (entry.processingEnd - entry.startTime), 'ms');
      });
    }
  }, { reportAllChanges: true });

  onLCP(sendToAnalytics);
  onCLS(sendToAnalytics);
}

function sendToAnalytics(name, metric) {
  fetch('/api/metrics', {
    method: 'POST',
    body: JSON.stringify({
      name,
      value: metric.value,
      id: metric.id,
      navigationType: metric.navigationType
    })
  }).catch(() => {});
}
```

**INP 阈值**（Google Core Web Vitals）：

| 评级 | 阈值 | 用户感知 |
|:---|:---:|:---|
| **Good** | ≤ 200ms | 即时响应，用户感觉流畅 |
| **Needs Improvement** | 200-500ms | 轻微延迟，可感知但不影响任务完成 |
| **Poor** | > 500ms | 明显卡顿，用户可能重复点击或放弃 |

**Svelte 5 的 INP 优势根源**：

根据 [22.md](22-browser-rendering-pipeline.md) 的逐帧分析，Svelte 5 的 `$.set()` + `$.set_text()` 路径比 React 的 `setState()` → re-render → diff → commit 路径在主线程上**少占用约 4-5ms**。在 60fps 帧预算（16.67ms）下：

```
React 19 交互帧占用: ~10ms (60% 帧预算)
Svelte 5 交互帧占用:  ~2ms (12% 帧预算)
                    ───────────────────
Svelte 释放的主线程时间: ~8ms (48% 帧预算)

这 8ms 可用于:
- 处理下一用户输入
- GC 垃圾回收
- 其他后台任务
- 为低端设备提供缓冲余量
```

### 1.2 常见 INP 瓶颈与 Svelte 解决方案

| 瓶颈场景 | INP 影响 | Svelte 解决方案 | 预期改善 |
|:---|:---|:---|:---:|
| 表单输入卡顿 | 每次输入触发状态更新 + 校验 | 使用 `untrack()` 或延迟校验 | 50-80% |
| 大量列表过滤 | 每次过滤重新渲染整个列表 | 使用 `$derived` 缓存过滤结果 | 60-90% |
| 复杂图表交互 | 鼠标移动时频繁更新 DOM | 使用 `requestAnimationFrame` 节流 | 40-70% |
| 模态框打开 | 大量内容一次性挂载 | 使用 `{#key}` 延迟加载或虚拟列表 | 30-50% |
| 路由切换 | 旧组件卸载 + 新组件挂载 | 使用预渲染和过渡动画 | 20-40% |

### 1.3 实战案例 1：搜索框 INP 优化

**优化前**（INP ≈ 350ms）：

```svelte
<script>
  let query = $state('');
  let results = $state([]);

  // ❌ 每次输入都触发搜索 API 调用
  $effect(async () => {
    results = await searchAPI(query);
  });
</script>

<input bind:value={query} />
{#each results as item}
  <div>{item.name}</div>
{/each}
```

**优化后**（INP ≈ 80ms）：

```svelte
<script>
  import { untrack } from 'svelte';

  let query = $state('');
  let debouncedQuery = $state('');
  let results = $state([]);
  let loading = $state(false);

  // ✅ 使用 $derived 缓存过滤结果（纯计算）
  let filteredResults = $derived(
    results.filter(r =>
      r.name.toLowerCase().includes(debouncedQuery.toLowerCase())
    )
  );

  // ✅ Effect 只负责副作用（API 调用）
  $effect(() => {
    const q = debouncedQuery;
    if (!q) { results = []; return; }

    loading = true;
    searchAPI(q).then(data => {
      results = data;
      loading = false;
    });
  });

  // 防抖更新（150ms）
  let timeout;
  function onInput(e) {
    query = e.target.value;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      debouncedQuery = query;
    }, 150);
  }
</script>

<input
  value={query}
  oninput={onInput}
/>

{#if loading}
  <div>Searching...</div>
{:else}
  {#each filteredResults as item (item.id)}
    <div>{item.name}</div>
  {/each}
{/if}
```

**关键优化点**：

1. **防抖**: 150ms 内不触发搜索，减少 API 调用和 DOM 更新频率
2. **$derived 缓存**: 本地过滤结果通过 `$derived` 计算，不触发副作用，不占用微任务队列
3. **Effect 分离**: `query` 用于 UI 即时响应，`debouncedQuery` 用于实际搜索，避免每次按键都触发网络请求
4. **key 属性**: `{#each}` 使用 `(item.id)` 确保列表更新的最小 DOM 操作

### 1.4 实战案例 2：大数据表格滚动优化

当表格包含 1000+ 行数据时，即使 Svelte 的更新效率很高，浏览器布局阶段仍可能成为瓶颈。

```svelte
<script>
  let { data } = $props();
  let viewportHeight = $state(600);
  let rowHeight = $state(40);
  let scrollTop = $state(0);

  // ✅ 只渲染可视区域 + 上下缓冲
  let visibleRange = $derived(() => {
    const start = Math.floor(scrollTop / rowHeight);
    const count = Math.ceil(viewportHeight / rowHeight);
    const buffer = 5; // 上下各缓冲 5 行
    return {
      start: Math.max(0, start - buffer),
      end: Math.min(data.length, start + count + buffer)
    };
  });

  let visibleData = $derived(
    data.slice(visibleRange.start, visibleRange.end)
  );

  let totalHeight = $derived(data.length * rowHeight);
  let offsetY = $derived(visibleRange.start * rowHeight);
</script>

<!-- 容器固定高度，overflow-auto 触发滚动 -->
<div class="viewport" style:height="{viewportHeight}px" onscroll={(e) => scrollTop = e.target.scrollTop}>
  <!-- 占位撑开滚动条 -->
  <div style:height="{totalHeight}px; position: relative;">
    <!-- 可视内容绝对定位 -->
    <div style:transform="translateY({offsetY}px)">
      {#each visibleData as row (row.id)}
        <div class="row" style:height="{rowHeight}px">
          {#each row.cells as cell}
            <span>{cell}</span>
          {/each}
        </div>
      {/each}
    </div>
  </div>
</div>
```

**性能特征**：

| 数据量 | 全量渲染 DOM 节点 | 虚拟列表 DOM 节点 | 布局时间 |
|:---:|:---:|:---:|:---:|
| 100 行 | 100 | 15-20 | ~0.5ms |
| 1,000 行 | 1,000 | 15-20 | ~0.5ms |
| 10,000 行 | 10,000 | 15-20 | ~0.5ms |

**为什么 Svelte + 虚拟列表是最佳组合**：

- Svelte 的反应式系统只更新变化的行数据，不重新渲染整个列表
- `transform: translateY()` 将元素精确定位，浏览器只需局部合成（Composite），无需重新计算布局
- `$derived` 保证 `visibleData` 仅在 `scrollTop` 跨越行边界时才重新计算

### 1.5 实战案例 3：高频输入节流（画布/拖拽场景）

```svelte
<script>
  let mouseX = $state(0);
  let mouseY = $state(0);
  let canvasX = $state(0);  // 用于渲染（60fps 节流）
  let canvasY = $state(0);

  // ✅ requestAnimationFrame 节流：将高频输入限制为 60fps
  let pendingRaf = false;
  $effect(() => {
    // 读取最新鼠标位置
    const x = mouseX;
    const y = mouseY;

    if (!pendingRaf) {
      pendingRaf = true;
      requestAnimationFrame(() => {
        canvasX = x;
        canvasY = y;
        pendingRaf = false;
      });
    }
  });

  // 鼠标移动事件（可能 1000+ 次/秒）
  function onMouseMove(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }
</script>

<canvas
  width={800}
  height={600}
  onmousemove={onMouseMove}
/>
```

**帧预算分析**：

```
未节流场景:
  鼠标事件: 1000 次/秒 → 每次触发 $effect → 每次触发 canvas 重绘
  结果: 大量 JS 执行堆积，浏览器无法及时提交帧
  INP: 可能 > 500ms（Poor）

节流后场景:
  鼠标事件: 1000 次/秒 → 只更新 $state（极快）
  rAF 回调: 60 次/秒 → 批量更新 canvas
  结果: JS 执行均匀分布，每帧预算内完成
  INP: < 50ms（Good）
```

---

## 二、Chrome DevTools 诊断实战

### 2.1 Performance 面板分析流程

```
1. 打开 Chrome DevTools → Performance 面板
2. 点击 Record (⏺️)
3. 执行目标交互（如点击按钮、输入文本）
4. 点击 Stop (⏹️)
5. 分析结果
```

### 2.2 识别 Svelte 相关的性能问题

**问题模式 A: 长 Task（>50ms）**

```
[Performance 面板显示]
Main Thread:
├── Task: 120ms ⚠️
│   ├── Function Call: flushSync
│   │   ├── Function Call: update_effect × 50
│   │   ├── Recalculate Style: 30ms
│   │   └── Layout: 40ms
│   └── ...
```

**诊断**: 单次 flush 更新了太多 effect，导致样式计算和布局耗时过长。

**解决**: 将大列表拆分为虚拟列表，或使用 `{#key}` 控制重新渲染范围。

**问题模式 B: Forced Reflow（强制同步布局）**

```
[Performance 面板显示]
Main Thread:
├── Task: 80ms ⚠️
│   ├── Function Call: getBoundingClientRect
│   │   └── ⚠️ Forced Reflow (布局 thrashing)
│   ├── Function Call: style.width = ...
│   │   └── ⚠️ Forced Reflow
│   └── ...
```

**诊断**: JavaScript 读取布局属性后立即修改样式，强制浏览器同步执行布局。

**解决**: 批量读取和写入，使用 `requestAnimationFrame` 或 `fastdom` 库。

```svelte
<script>
  // ❌ 错误：读取后写入导致 forced reflow
  function badResize() {
    const width = element.offsetWidth;  // 读取（触发布局）
    element.style.height = width + 'px'; // 写入（再次触发布局）
  }

  // ✅ 正确：批量读取，批量写入
  import { tick } from 'svelte';
  async function goodResize() {
    const width = element.offsetWidth;  // 读取
    await tick();  // 等待当前 flush 完成
    element.style.height = width + 'px'; // 写入
  }
</script>
```

### 2.3 使用 `scheduler.yield()` 拆分长任务（Chrome 129+）与 LoAF 监控

> **LoAF** (Long Animation Frames API, Chrome 123+) 是诊断 INP 瓶颈的利器。它精确报告每一长帧中各阶段的耗时（脚本执行、样式计算、布局、绘制），帮助定位 `$effect` 中的性能热点。

**LoAF 监控代码**:

```ts
// +layout.svelte 或 app-level 初始化
if (typeof PerformanceObserver !== 'undefined') {
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.duration > 100) {
        console.warn('🐌 Long Animation Frame detected:', {
          duration: entry.duration,
          scriptDuration: entry.scriptDuration,
          styleDuration: entry.styleDuration,
          layoutDuration: entry.layoutDuration,
          // entry.firstUIEventTimestamp 可用于关联用户交互
        });
      }
    }
  });
  observer.observe({ entryTypes: ['long-animation-frame'] });
}
```

**结合 `scheduler.yield()` 拆分长任务**:

```svelte
<script>
  let items = $state([]);
  let processed = $state([]);

  // ✅ 使用 scheduler.yield() 拆分长计算
  async function processAll() {
    const batchSize = 100;
    const results = [];

    for (let i = 0; i < items.length; i += batchSize) {
      // 处理一批
      const batch = items.slice(i, i + batchSize);
      results.push(...batch.map(processItem));

      // 让出主线程，保持 INP 良好
      if (typeof scheduler !== 'undefined' && scheduler.yield) {
        await scheduler.yield();
      } else {
        await new Promise(r => requestAnimationFrame(r));
      }
    }

    processed = results;
  }
</script>
```

---

## 三、CSS 优化策略

### 3.1 CSS Containment 实战

CSS Containment 是限制样式/布局/绘制范围的最强工具，与 Svelte 的组件化模型天然契合。

```svelte
<!-- 限制样式计算范围 -->
<div class="widget" style:contain="layout paint">
  <h2>{title}</h2>
  <p>{content}</p>
</div>

<style>
  .widget {
    /* 浏览器优化：此元素外部的样式变化不影响内部 */
    /* 此元素内部的样式变化不影响外部 */
    contain: layout paint;
  }
</style>
```

**使用场景与收益**：

| 场景 | contain 值 | 收益 |
|:---|:---|:---|
| 独立卡片组件 | `layout paint` | 样式计算范围减少 80%+ |
| 频繁更新的数据面板 | `layout paint style` | 完全隔离样式变更影响 |
| 第三方嵌入内容 | `strict` | 最强隔离，防止外部样式泄漏 |
| 动画容器 | `layout` | 动画不触发父元素布局 |

**Svelte scoped CSS 的加成**：

Svelte 编译器将组件 CSS 自动限定为类选择器（如 `.svelte-abc123`），这意味着：

```
传统全局 CSS: div[data-active="true"] { ... }  →  O(n) 选择器匹配
Svelte scoped CSS: .svelte-abc123.active { ... } → O(1) 选择器匹配
```

在 Style Calculation 阶段，Svelte 应用的选择器匹配时间是**恒定时间**，与 DOM 树大小无关。

### 3.2 content-visibility 延迟渲染

```svelte
<!-- 屏幕外内容延迟渲染 -->
{#each longList as item, i}
  <div
    class="item"
    style:content-visibility={i > 20 ? 'auto' : 'visible'}
    style:contain-intrinsic-size="0 500px"
  >
    {item.content}
  </div>
{/each}
```

**效果**: 前 20 项立即渲染，其余项在进入视口前跳过布局和绘制。

| 指标 | 无 content-visibility | 有 content-visibility |
|:---|:---:|:---:|
| 初始 Layout 时间 | 45ms | 3ms |
| 初始 Paint 时间 | 30ms | 2ms |
| 内存占用 | 85MB | 25MB |
| 滚动后渲染 | 已预渲染 | 按需渲染 |

### 3.3 will-change 策略

```svelte
<script>
  let isAnimating = $state(false);
</script>

<div
  class="box"
  class:animating={isAnimating}
>
  Animated Content
</div>

<style>
  .box {
    transition: transform 0.3s;
  }

  /* ✅ 在动画开始前添加 will-change */
  .box.animating {
    will-change: transform;
  }

  /* ❌ 不要一直保留 will-change，会消耗 GPU 内存 */
</style>
```

---

## 四、生产监控与告警

### 4.1 自建性能监控仪表板

```typescript
// src/lib/performance-monitor.ts
interface PerformanceMetrics {
  inp: number;
  lcp: number;
  cls: number;
  fcp: number;
  ttfb: number;
  fps: number;
  memory: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    inp: 0, lcp: 0, cls: 0, fcp: 0, ttfb: 0, fps: 60, memory: 0
  };

  private thresholds = {
    inp: { good: 200, poor: 500 },
    lcp: { good: 2500, poor: 4000 },
    cls: { good: 0.1, poor: 0.25 },
    fps: { good: 55, poor: 30 }
  };

  recordINP(value: number) {
    this.metrics.inp = value;
    if (value > this.thresholds.inp.poor) {
      this.alert('INP_CRITICAL', value);
    } else if (value > this.thresholds.inp.good) {
      this.warn('INP_WARNING', value);
    }
  }

  recordFPS(value: number) {
    this.metrics.fps = value;
    if (value < this.thresholds.fps.poor) {
      this.alert('FPS_CRITICAL', value);
    }
  }

  private alert(type: string, value: number) {
    console.error(`[PERF ALERT] ${type}: ${value}`);
    // fetch('/api/alerts', { ... });
  }

  private warn(type: string, value: number) {
    console.warn(`[PERF WARN] ${type}: ${value}`);
  }

  getReport(): PerformanceMetrics {
    return { ...this.metrics };
  }
}

export const perfMonitor = new PerformanceMonitor();
```

### 4.2 Sentry 集成与性能追踪

```typescript
// hooks.client.ts
import * as Sentry from '@sentry/sveltekit';
import { onINP, onLCP, onCLS } from 'web-vitals';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.01,
  integrations: [
    Sentry.browserTracingIntegration()
  ]
});

// 将 INP 发送到 Sentry
onINP((metric) => {
  Sentry.captureMessage(`INP: ${metric.value}ms`, {
    level: metric.value > 500 ? 'error' : 'warning',
    extra: { metric }
  });
});

// FPS 监控
let frameCount = 0;
let lastTime = performance.now();

function measureFPS() {
  frameCount++;
  const now = performance.now();
  if (now - lastTime >= 1000) {
    const fps = Math.round((frameCount * 1000) / (now - lastTime));
    perfMonitor.recordFPS(fps);
    frameCount = 0;
    lastTime = now;
  }
  requestAnimationFrame(measureFPS);
}

if (typeof window !== 'undefined') {
  requestAnimationFrame(measureFPS);
}
```

### 4.3 内存泄漏检测

```typescript
// src/lib/memory-monitor.ts
export function startMemoryMonitor() {
  if (!performance.memory) return;

  setInterval(() => {
    const { usedJSHeapSize, totalJSHeapSize, jsHeapSizeLimit } = performance.memory;
    const usage = usedJSHeapSize / jsHeapSizeLimit;

    if (usage > 0.8) {
      console.warn('[MEMORY] Heap usage > 80%:', {
        used: (usedJSHeapSize / 1e6).toFixed(2) + 'MB',
        total: (totalJSHeapSize / 1e6).toFixed(2) + 'MB',
        limit: (jsHeapSizeLimit / 1e6).toFixed(2) + 'MB'
      });
    }
  }, 30000); // 每 30 秒检查一次
}
```

---

## 五、Svelte 编译器优化策略

### 5.1 编译输出分析

Svelte 5 编译器已经做了大量优化，但开发者可以通过代码模式影响编译质量：

| 代码模式 | 编译结果 | 优化建议 |
|:---|:---|:---|
| 简单模板 | `$.template()` + `$.set_text()` | 最佳，编译器最优输出 |
| 动态属性 | `$.attr()` + 条件判断 | 良好，避免不必要的属性更新 |
| 复杂表达式 | 内联计算 | 使用 `$derived` 缓存复杂计算 |
| `{@html}` | `$.create_html()` | 避免在用户输入中使用，XSS 风险 |
| `{#each}` 无 key | 位置 Diff | **必须**提供 key 属性 |

### 5.2 构建优化

```javascript
// vite.config.ts
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  build: {
    // 代码分割策略
    rollupOptions: {
      output: {
        manualChunks: {
          // 将大型库分离为独立 chunk
          'vendor': ['svelte', 'svelte/animate', 'svelte/transition'],
          'charts': ['chart.js'],
          'maps': ['leaflet']
        }
      }
    },
    // CSS 代码分割
    cssCodeSplit: true,
    // 预压缩
    reportCompressedSize: true
  },
  // 预加载关键资源
  ssr: {
    noExternal: ['svelte'] // SSR 时内联 Svelte 运行时
  }
});
```

---

## 六、快速参考卡片

### 6.1 帧预算速查

| 目标帧率 | 帧时间 | JS 预算 | 布局预算 | 合成预算 | Svelte 5 交互占用 |
|:---:|:---:|:---:|:---:|:---:|:---:|
| 60fps | 16.67ms | ~4ms | ~4ms | ~2ms | ~1-2ms |
| 90fps | 11.11ms | ~3ms | ~3ms | ~1.5ms | ~0.8-1.5ms |
| 120fps | 8.33ms | ~2ms | ~2ms | ~1ms | ~0.5-1ms |

### 6.2 Svelte 渲染优化速查

| 问题 | 快速解决 |
|:---|:---|
| 列表渲染慢 | 使用 `{#each items as item (item.id)}` + 虚拟列表 |
| 状态更新卡 | 使用 `$derived` 缓存，批量 `set()` |
| 动画掉帧 | 使用 CSS `transform` + `opacity`，避免 `layout` 属性 |
| 首屏慢 | 使用 SSR + 渐进式 Hydration |
| 内存泄漏 | 确保 `$effect` 返回清理函数，销毁时调用 |
| 输入延迟 | 使用防抖/节流，必要时 `untrack()` |
| 路由切换卡 | 预渲染 + 过渡动画 + 代码分割 |

### 6.3 性能问题诊断决策树

```
INP > 200ms?
├── 是 → JS 执行 > 100ms?
│   ├── 是 → $effect 中有长任务?
│   │   ├── 是 → 拆分为 $derived + 异步处理
│   │   └── 否 → 检查 flushSync() 调用次数
│   └── 否 → Style/Layout > 50ms?
│       ├── 是 → 使用 CSS containment
│       └── 否 → Paint > 30ms?
│           ├── 是 → 减少 DOM 节点数
│           └── 否 → Composite 层爆炸?
│               └── 是 → 减少 will-change 使用
└── 否 → INP Good，关注 LCP/CLS
```

---

---

### 🧩 反直觉案例: 滥用 `will-change` 导致 GPU 内存爆炸

**直觉预期**: "给所有动画元素加上 `will-change` 能最大化 GPU 加速，降低 INP"

**实际行为**: 过量合成层拖垮 GPU 内存，Composite 阶段耗时翻倍，低端设备直接掉帧

**代码演示**:

```svelte
{#each items as item}
  <!-- ❌ 每个条目都提升为独立合成层 -->
  <div style="will-change: transform, opacity">
    {item.name}
  </div>
{/each}
```

**为什么会这样？**
`will-change` 会强制浏览器为元素分配独立 GPU 纹理层。当层数超过 GPU 承载能力时，浏览器回退到主线程合成，反而增加帧时间。INP 优化应聚焦减少主线程阻塞，而非盲目提升合成层。

**教训**
> `will-change` 应在动画开始前动态添加、结束后立即移除，且页面同时存在的合成层数量应控制在 100 以内。

## 参考

- [22-browser-rendering-pipeline](22-browser-rendering-pipeline.md) — 本文档的理论基础与完整渲染管线映射
- [web.dev/optimize-inp](https://web.dev/articles/optimize-inp) — Google 官方 INP 优化指南
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance) — 性能分析工具文档
- [Svelte 性能优化官方指南](https://svelte.dev/docs/performance) — Svelte 官方最佳实践

> 最后更新: 2026-05-06 | 浏览器对齐: Chrome 130+ / Firefox 128+ / Safari 18+ | Svelte 对齐: 5.55.5
