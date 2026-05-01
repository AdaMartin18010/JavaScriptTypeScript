# Compiler-Based Signals 架构原理

> 深度解析 Svelte 5、Vue Vapor Mode、React Compiler 等 Compiler-Based Signals 架构的设计哲学、实现机制与性能特征。

---

## 1. 前端框架渲染范式演进

### 1.1 三种渲染范式对比

| 范式 | 代表框架 | 原理 | 运行时开销 | Bundle大小 |
|------|----------|------|-----------|-----------|
| **Virtual DOM** | React, Vue(传统) | 构建虚拟树 → Diff → Patch DOM | 高 | 大 |
| **Fine-Grained Signals** | Solid, Preact Signals | 信号订阅 → 精确更新 DOM 节点 | 极低 | 小 |
| **Compiler-Based** | Svelte 5, Vue Vapor | 编译时分析依赖 → 生成直接 DOM 操作代码 | 零(编译后) | 最小 |

三种范式的本质差异在于**"何时做决策"**：

- **Virtual DOM**：运行时决策——每次状态变化后，重新构建虚拟树、Diff 对比、找出最小更新集。所有优化都发生在浏览器中。
- **Fine-Grained Signals**：运行时订阅——状态变化时，通过依赖图精确通知订阅者更新。无需 Diff，但仍需运行时维护依赖关系。
- **Compiler-Based**：编译时决策——构建阶段分析所有依赖关系，生成确定的更新代码。运行时只做执行，不做分析。

### 1.2 历史演进时间线

```
2013  React - Virtual DOM 诞生
2016  Svelte 1 - 编译器框架先驱
2019  Svelte 3 - 编译时响应式
2021  Solid 1 - Signals 范式成熟
2023  Vue Vapor Mode - 编译器模式实验
2024  Svelte 5 - Runes(Signals) + 编译器融合
2024  React Compiler - 编译时自动 memoization
2025  Angular Signals - Zone.js 废弃路线图
2026  Compiler-Based 成为主流方向
```

> **关键转折点**：2024 年被称为"Compiler 元年"。React Compiler、Svelte 5、Vue Vapor Mode 在同一年进入公众视野，标志着前端框架从"运行时智慧"向"编译时智慧"的战略转移。

---

## 2. Compiler-Based Signals 核心原理

### 2.1 编译时依赖分析

Svelte 编译器在构建阶段分析模板和脚本中的依赖关系，生成最优的更新代码。

```ts
// 源代码 (.svelte)
<script>
  let count = $state(0);
  let doubled = $derived(count * 2);
</script>
<button onclick={() => count++}>
  {count} x 2 = {doubled}
</button>
```

编译器输出（简化）：

```js
// 编译后的代码
import * as $ from 'svelte/internal';

export default function App($$anchor) {
  let count = $.state(0);
  let doubled = $.derived(() => $.get(count) * 2);

  var button = $.template('<button> </button>');
  var node = button();
  var text = $.child(node);

  $.effect(() => {
    $.set_text(text, `${$.get(count)} x 2 = ${$.get(doubled)}`);
  });

  $.event('click', node, () => {
    $.set(count, $.get(count) + 1);
  });

  $.append($$anchor, node);
}
```

**编译器做了什么？**

1. **模板解析**：将 HTML 模板解析为 AST（抽象语法树）
2. **脚本分析**：识别 `$state`、`$derived`、`$effect` 等 Runes
3. **依赖图构建**：建立状态变量 → DOM 节点 → 更新函数的映射
4. **代码生成**：输出纯 JavaScript，包含直接 DOM 操作和 Signals API 调用

### 2.2 Signals 在编译器中的实现

Svelte 5 的 Runes 内部基于 Signals，但由编译器自动管理：

| 原语 | 编译器生成 | 作用 |
|------|-----------|------|
| `$state` | `$.state(initial)` | 创建响应式状态源 |
| `$derived` | `$.derived(fn)` | 创建派生计算 |
| `$effect` | `$.effect(fn)` | 创建副作用，自动追踪依赖 |
| `$props` | 编译时解构 + 响应式包装 | 组件 props 响应式 |

**为什么叫 "Runes"？**

Runes（符文）是 Svelte 5 对响应式原语的命名。与 Solid 的手动 Signals 不同，Runes 由编译器自动注入依赖追踪和订阅逻辑，开发者只需声明意图：

```ts
// Svelte 5 - 声明式
let count = $state(0);
let doubled = $derived(count * 2);

// Solid - 命令式（手动调用 createSignal/createMemo）
const [count, setCount] = createSignal(0);
const doubled = createMemo(() => count() * 2);
```

### 2.3 与纯 Signals 框架（Solid）的区别

| 维度 | Svelte 5 (Compiler + Signals) | SolidJS (纯 Signals) |
|------|------------------------------|----------------------|
| **更新代码生成** | 编译器生成，零运行时分析 | 运行时追踪 + 编译辅助 |
| **模板语法** | HTML 超集，类原生 | JSX |
| **组件文件** | .svelte | .tsx / .jsx |
| **学习曲线** | 低（接近 HTML） | 中等（JSX + Signals 心智模型）|
| **生态成熟度** | 中等（增长中） | 较小 |
| **Bundle 大小** | ~2-3KB Hello World | ~7KB |
| **性能** | 顶级（JS Benchmark 250ms/10k行）| 顶级（220ms/10k行）|

**核心差异**：Svelte 的 Signals 是"编译器管理的 Signals"，Solid 的 Signals 是"开发者显式管理的 Signals"。两者在运行时都有依赖图，但 Svelte 的图在编译时构建，Solid 的图在首次运行时构建。

---

## 3. 跨框架 Compiler 策略对比

### 3.1 Svelte 5 Compiler

- **输入**：.svelte 文件（HTML + CSS + JS 超集）
- **输出**：优化的原生 JavaScript（无框架运行时）
- **特点**：模板编译为直接 DOM 操作，Runes 编译为 Signals API 调用
- **设计哲学**：" disappearing framework "——框架在构建后消失

```
.svelte 文件
    ├── <script> → JS AST 分析（Runes 识别）
    ├── <template> → DOM 操作代码生成
    ├── <style> →  scoped CSS（编译时 hash）
    └── 输出：纯 JavaScript 模块
```

### 3.2 Vue Vapor Mode

- **输入**：.vue SFC（`<script setup>`）
- **输出**：直接 DOM 操作代码（绕过 Virtual DOM）
- **状态**：2026 年预览阶段，预计 Q3-Q4 Beta
- **设计哲学**：保留 Vue 的开发体验，编译时优化底层渲染

```ts
// Vue Vapor Mode（概念预览）
<script setup vapor>
import { ref } from 'vue'
const count = ref(0)
</script>
<template>
  <button @click="count++">{{ count }}</button>
</template>
```

Vapor Mode 与 Svelte 的关键区别：Vue 保留响应式系统（`ref`/`reactive`），但编译器绕过 VNode 创建和 Diff，直接生成 DOM 操作。

### 3.3 React Compiler (React Forget)

- **输入**：JSX + Hooks
- **输出**：自动注入 useMemo/useCallback 等优化
- **特点**：不改变开发者 API，编译时自动 memoization
- **局限**：不消除 Virtual DOM，只是减少 re-render

```jsx
// 源代码
function App() {
  const [count, setCount] = useState(0);
  const doubled = count * 2; // 编译器自动 memo
  return <div>{doubled}</div>;
}

// 编译后（概念）
function App() {
  const [count, setCount] = useState(0);
  const doubled = useMemo(() => count * 2, [count]); // 自动注入
  return <div>{doubled}</div>;
}
```

> **重要区别**：React Compiler 是"优化编译器"，不是"消除运行时编译器"。Virtual DOM 仍然存在，只是减少了不必要的 re-render。

### 3.4 Angular 编译器 + Signals

- **输入**：Angular 模板 + TypeScript
- **输出**：优化的变更检测代码
- **特点**：Zone.js 废弃中，Signals 替代变更检测

```ts
// Angular 19+ Signals
@Component({
  template: `<button (click)="increment()">{{ count() }}</button>`
})
class App {
  count = signal(0);
  increment = () => this.count.update(c => c + 1);
}
```

Angular 的 Signals 编译策略：模板编译器识别 `signal()` 调用，生成直接的状态订阅代码，绕过 Zone.js 的全局变更检测。

---

## 4. 性能基准（2026）

### 4.1 JS Framework Benchmark

来源：[krausest.github.io/js-framework-benchmark](https://krausest.github.io/js-framework-benchmark)，2026-04

| 测试项 | React 19 | Vue 3.5 | Svelte 5 | Solid 1.9 | Angular 19 |
|--------|----------|---------|----------|-----------|------------|
| 创建 1,000 行 | 180ms | 145ms | **95ms** | 88ms | 210ms |
| 创建 10,000 行 | 450ms | 400ms | **250ms** | 220ms | 580ms |
| 更新每 10 行 | 45ms | 38ms | **18ms** | 15ms | 52ms |
| 选中行切换 | 12ms | 10ms | **5ms** | 4ms | 15ms |
| 内存使用 | 4.2MB | 3.8MB | **2.1MB** | 2.4MB | 5.1MB |

> **解读**：Svelte 5 和 Solid 在性能上处于同一梯队，但 Svelte 5 的内存占用更低（编译时消除了框架运行时开销）。React 19 通过 Compiler 大幅优化，但 Virtual DOM 的固有开销仍然存在。

### 4.2 Bundle 大小对比

| 框架 | Hello World gzip | 10 路由 SPA gzip | 运行时 |
|------|-----------------|-----------------|--------|
| Svelte 5 | **~2KB** | **~25KB** | 编译后无运行时 |
| Solid 1.9 | ~7KB | ~35KB | ~7KB |
| Vue 3.5 | ~34KB | ~58KB | ~34KB |
| React 19 | ~42KB | ~95KB | ~42KB |
| Angular 19 | ~130KB | ~180KB | ~130KB |

来源：Bundlephobia, official docs, 2026-04

> **关键洞察**：Svelte 的 Bundle 大小优势随应用规模增长而**扩大**。传统框架的运行时开销是固定的，而 Svelte 只有使用的辅助函数才会进入 Bundle。

### 4.3 Lighthouse 评分

| 框架 | 性能 | 可访问性 | 最佳实践 | SEO | 总分 |
|------|:----:|:-------:|:-------:|:---:|------|
| Svelte 5 | 100 | 100 | 100 | 100 | **400** |
| Solid | 98 | 100 | 100 | 100 | 398 |
| Vue 3.5 | 94 | 100 | 100 | 100 | 394 |
| React 19 | 92 | 100 | 100 | 100 | 392 |

来源：Lighthouse CI 测试，标准 TodoMVC 应用，2026-04

> **满分原因**：Svelte 编译后的代码几乎无框架 overhead，首屏加载极快，Interaction to Next Paint (INP) 表现优异。

---

## 5. Compiler-Based Signals 的架构优势

### 5.1 零运行时框架代码

Svelte 编译后，框架本身不进入 bundle。只有组件使用的特定辅助函数被包含。

```
传统框架 bundle:
├── React 运行时 (~42KB)
├── React DOM (~30KB)
├── 你的组件代码
└── 总计: ~100KB+

Svelte 编译后 bundle:
├── svelte/internal 辅助函数 (~2KB)
├── 你的组件代码（已优化）
└── 总计: ~10-30KB
```

**辅助函数按需引入**：

```js
// 只使用 $.state 和 $.effect 的组件
import { state, effect } from 'svelte/internal'; // 仅引入这两个函数

// 使用 $.derived 的组件
import { state, derived, effect } from 'svelte/internal'; // 引入三个
```

### 5.2 确定性更新路径

编译时已知每个状态变量的更新路径，无需运行时 diff：

```
$state(count) → 编译器分析 → 确定影响 DOM 节点 A、B、C
              → 生成 update_A(), update_B(), update_C()
              → 运行时直接调用，无 diff
```

对比 Virtual DOM：

```
setState(count) → 重新渲染组件 → 创建新 VNode 树
                → Diff 对比旧树 → 找出变化
                → Patch DOM → 更新实际节点
```

### 5.3 Tree-Shaking 友好

未使用的组件、样式、辅助函数在编译阶段即被移除：

```svelte
<!-- 未使用的组件不会被包含 -->
<script>
  import Unused from './Unused.svelte'; // 编译时移除
  let count = $state(0);
</script>
```

```css
/* 未使用的样式规则被移除 */
<style>
  .used { color: red; }
  .unused { color: blue; } /* 编译时移除 */
</style>
```

---

## 6. 局限性分析

| 局限 | 说明 | 缓解方案 |
|------|------|----------|
| **编译时约束** | 动态模板（如 `<{tagName}>`）受限 | 使用 `{@html}` 或 `<svelte:element>` |
| **构建时间** | 大型项目编译耗时增加 | Vite 增量编译、SWC 辅助 |
| **调试复杂度** | 编译后代码与源码映射 | Source maps + Svelte DevTools |
| **生态规模** | 组件库和工具少于 React | shadcn-svelte、Skeleton 等快速增长 |

### 6.1 编译时约束详解

编译器需要在构建时确定所有依赖关系，因此以下模式受限：

```svelte
<!-- ❌ 编译器无法确定 tagName -->
<script>
  let tagName = 'div';
</script>
<{tagName}>内容</{tagName}>

<!-- ✅ 使用 svelte:element -->
<svelte:element this={tagName}>内容</svelte:element>

<!-- ✅ 使用 {@html}（注意 XSS 风险） -->
{@html `<${tagName}>内容</${tagName}>`}
```

### 6.2 构建时间优化

```js
// vite.config.js
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [
    svelte({
      // 启用编译缓存
      compilerOptions: {
        dev: !process.env.PROD
      },
      // 热更新配置
      hot: {
        preserveLocalState: true
      }
    })
  ],
  build: {
    // 多线程编译
    rollupOptions: {
      maxParallelFileOps: 10
    }
  }
});
```

---

## 7. 2026-2027 趋势

| 趋势 | 影响 | 时间线 |
|------|------|--------|
| **Svelte 6 规划** | 进一步优化编译器输出，可能引入并发渲染 | 2027 |
| **Vue Vapor Mode 稳定** | Vue 正式进入 Compiler-Based 阵营 | 2026 H2 |
| **React Compiler 成熟** | React 编译时优化成为默认 | 2026 |
| **Signals 标准化** | TC39 Signals 提案（Stage 1） | 2026-2027 |
| **Edge 编译优化** | 编译器针对 Edge Runtime 优化输出 | 2026 |

### 7.1 TC39 Signals 提案

```ts
// 未来可能的原生 Signals API（Stage 1 提案）
const counter = new Signal.State(0);
const doubled = new Signal.Computed(() => counter.get() * 2);

counter.set(1);
console.log(doubled.get()); // 2
```

如果 Signals 成为 JavaScript 原生特性，Compiler-Based 框架可以直接生成原生 Signals 代码，进一步减少运行时开销。

### 7.2 Edge Runtime 优化

```js
// 编译器针对 Edge Runtime 优化
export default {
  async fetch(request) {
    // 编译后的 Svelte SSR 代码
    const html = render(App, { props: { url: request.url } });
    return new Response(html, { headers: { 'Content-Type': 'text/html' } });
  }
};
```

Svelte 的编译后代码天然适合 Edge Runtime：无框架运行时、确定性执行路径、极小 Bundle。

---

## 8. 开发者迁移指南

### 8.1 从 React 迁移到 Svelte 5

| React 概念 | Svelte 5 等价物 | 注意事项 |
|-----------|----------------|----------|
| `useState` | `$state` | 无需解构，直接赋值 |
| `useMemo` | `$derived` | 自动依赖追踪 |
| `useEffect` | `$effect` | 无需依赖数组 |
| `useCallback` | 无需 | 函数天然稳定 |
| Context API | `$setContext` / `$getContext` | 编译时注入 |

```jsx
// React
const [count, setCount] = useState(0);
const doubled = useMemo(() => count * 2, [count]);
useEffect(() => { console.log(count); }, [count]);
```

```svelte
<!-- Svelte 5 -->
<script>
  let count = $state(0);
  let doubled = $derived(count * 2);
  $effect(() => { console.log(count); });
</script>
```

### 8.2 从 Vue 3 迁移

Vue 的 `ref`/`computed` 与 Svelte 的 Runes 概念相近，迁移成本较低：

```ts
// Vue 3
const count = ref(0);
const doubled = computed(() => count.value * 2);
```

```ts
// Svelte 5
let count = $state(0);
let doubled = $derived(count * 2);
```

### 8.3 关键心智模型转换

1. **没有虚拟 DOM**：不需要担心 "re-render"，状态变化直接更新 DOM。
2. **没有 Hooks 规则**：Runes 可以在任何位置使用，不受组件顶层限制（但推荐在 script 顶层声明）。
3. **双向绑定是原生能力**：`bind:value` 编译为直接的事件监听和属性更新。

---

## 参考资源

- [Svelte 编译器源码](https://github.com/sveltejs/svelte/tree/main/packages/svelte/src/compiler) 📚
- [JS Framework Benchmark](https://krausest.github.io/js-framework-benchmark/) 📊
- [Svelte 5 Runes 设计文档](https://svelte.dev/blog/runes) 📚
- [SolidJS 响应式原语](https://www.solidjs.com/tutorial/introduction_signals) 📚
- [Vue Vapor Mode RFC](https://github.com/vuejs/rfcs/discussions/609) 📚

> 最后更新: 2026-05-01 | 数据来源: JS Framework Benchmark 2026-04, GitHub Stars 2026-05, Lighthouse CI, State of JS 2024
