# 前端框架

> **定位**：`20-code-lab/20.5-frontend-frameworks`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块解决现代前端框架的核心机制理解问题。涵盖响应式系统、虚拟 DOM、编译优化和组件化架构的设计原理。

### 1.2 形式化基础

- **组件**：UI = f(state)，将状态映射为视图的纯函数或类单元。
- **响应式系统**：状态变化自动驱动视图更新，实现方式包括虚拟 DOM diff、Signals 细粒度绑定、编译时 DOM 更新生成。
- **单向数据流**：数据自顶向下传递，事件自底向上冒泡，降低状态管理复杂度。

### 1.3 关键概念

| 概念 | 定义 | 关联 |
|------|------|------|
| 响应式系统 | 依赖追踪与自动更新 | reactivity.ts |
| 虚拟 DOM | 内存中的 UI 表示层，diff 后最小化 DOM 操作 | vdom.ts |
| 组件化 | 将 UI 拆分为独立、可复用的功能单元 | component.ts |
| 服务端组件 | 在服务端完成渲染，减少客户端 JS 体积 | server-components.ts |
| 水合（Hydration） | 将静态 HTML 与客户端状态树关联的过程 | hydration.ts |

---

## 二、设计原理

### 2.1 为什么存在

现代前端应用复杂度已接近传统桌面应用。框架通过响应式系统、组件化和虚拟 DOM 等机制，为复杂 UI 的开发提供了可扩展的架构。

### 2.2 主流框架对比

| 特性 | React | Vue | Svelte | Angular |
|------|-------|-----|--------|---------|
| 响应式模型 | Pull（虚拟 DOM + 调度）| Push/Pull 混合（Proxy ref）| 编译时 Push（无虚拟 DOM）| Push（Signals + 变更检测）|
| 组件语法 | JSX（JS 表达式）| SFC（template + script + style）| SFC（编译为指令）| Decorator + Template |
| 编译策略 | JSX 编译为 `React.createElement` | Template 编译为渲染函数 | 编译为原生 DOM 更新代码 | AOT 编译为高效 JS |
| 生态规模 | 最大（Next.js, Remix）| 大（Nuxt, Vuetify）| 中（SvelteKit）| 大（Nx, Angular Material）|
| 学习曲线 | 中等 | 平缓 | 平缓 | 陡峭 |
| 代表版本 | React 19 | Vue 3.4 | Svelte 5 | Angular 17+ |

### 2.3 与相关技术的对比

与原生 DOM 对比：框架提升开发效率与可维护性，原生无抽象开销。Web Components 提供标准组件化但缺乏框架级的响应式与生态工具链。

---

## 三、实践映射

### 3.1 从理论到代码

以下是 **同一计数器组件** 在 React、Vue、Svelte 中的实现对比：

```typescript
// component-model-comparison.ts
// 以下分别展示 React/Vue/Svelte 风格的组件模型（概念代码）

// ===== React 18+ =====
// import { useState } from 'react';
function CounterReact() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(c => c + 1)}>
      React Count: {count}
    </button>
  );
}

// ===== Vue 3 (Composition API) =====
// <script setup>
// import { ref } from 'vue';
const countVue = ref(0);
// 模板: <button @click="countVue++">Vue Count: {{ countVue }}</button>

// ===== Svelte 5 (Runes) =====
// <script>
//   let count = $state(0);
// </script>
// <button onclick={() => count++}>Svelte Count: {count}</button>

// ===== 框架无关：模拟组件模型的最小实现 =====
// 一个轻量 "类框架" 组件系统，展示状态 -> 视图映射

interface Component<Props = {}> {
  props: Props;
  state: Record<string, any>;
  render(): string;
  setState(partial: Record<string, any>): void;
}

function createComponent<Props>(
  props: Props,
  initialState: Record<string, any>,
  renderFn: (self: Component<Props>) => string
): Component<Props> {
  const self: Component<Props> = {
    props,
    state: { ...initialState },
    render() {
      return renderFn(self);
    },
    setState(partial) {
      Object.assign(self.state, partial);
      console.log('[Re-render]', self.render());
    },
  };
  return self;
}

// 可运行示例
const counter = createComponent(
  {},
  { count: 0 },
  (c) => `<button>Count: ${c.state.count}</button>`
);

console.log('Initial:', counter.render());
counter.setState({ count: 1 });
counter.setState({ count: 2 });
```

#### 服务端组件（RSC）概念示例

```typescript
// server-component.ts
// React Server Components 概念：在服务端运行，不打包到客户端
import { db } from './db';

interface UserProfileProps {
  userId: string;
}

// 此组件仅在服务端执行，可直接访问数据库
export default async function UserProfile({ userId }: UserProfileProps) {
  const user = await db.users.findById(userId);
  return (
    <section>
      <h1>{user.name}</h1>
      <p>Joined: {user.createdAt.toDateString()}</p>
    </section>
  );
}
```

#### 水合（Hydration）与流式 SSR

```typescript
// hydration-strategy.ts
// 框架内部的水合入口示意（概念代码）
function hydrateRoot(rootElement: HTMLElement, vnode: VNode) {
  // 1. 重建虚拟 DOM 树
  const vdom = buildVDOM(rootElement);
  // 2. 附加事件监听器
  attachEventListeners(rootElement, vnode);
  // 3. 注册响应式订阅，使后续更新走客户端路径
  enableClientReactivity(vnode);
  console.log('[Hydration] complete');
}
```

#### 编译优化：VNode 提升与静态节点标记

```typescript
// compiler-optimization.ts
// Vue / Svelte 编译器会执行的常见优化（概念代码）

interface VNode {
  type: string | Function;
  props: Record<string, any>;
  children: VNode[];
  patchFlag?: number; // Vue: 1=TEXT, 2=CLASS, 4=STYLE, 8=PROPS...
  dynamicProps?: string[];
}

// 编译器生成：标记动态部分，diff 时跳过静态子树
function createOptimizedVNode(): VNode {
  return {
    type: 'div',
    props: { id: 'app' },
    children: [
      { type: 'h1', props: {}, children: [], patchFlag: 0 }, // 静态节点
      { type: 'p', props: {}, children: [], patchFlag: 1 },  // 仅文本动态
    ],
    patchFlag: 0,
  };
}
```

### 3.2 常见误区

| 误区 | 正确理解 |
|------|---------|
| 虚拟 DOM 总是最快 | 极端简单场景下直接 DOM 操作可能更优；Svelte 编译时方案跳过虚拟 DOM |
| 框架选择决定性能上限 | 开发者对框架的理解和使用方式更重要 |
| React 是唯一工业标准 | Vue 与 Angular 在企业级市场同样占主导；Svelte 在嵌入式/低功耗场景增长 |
| 服务端组件等同于 SSR | RSC 是服务端运行组件的架构，SSR 是将结果序列化为 HTML；二者可叠加 |

### 3.3 扩展阅读

- [React — Official Docs](https://react.dev/)
- [React Server Components — RFC](https://github.com/reactjs/rfcs/blob/main/text/0188-server-components.md)
- [Vue — Guide](https://vuejs.org/guide/introduction.html)
- [Vue Vapor Mode — 无虚拟 DOM 实验分支](https://github.com/vuejs/core-vapor)
- [Svelte — Tutorial](https://svelte.dev/tutorial)
- [Svelte 5 Runes — Docs](https://svelte.dev/docs/runes)
- [Angular — Docs](https://angular.dev/)
- [Angular Signals](https://angular.dev/guide/signals)
- [Web Components — MDN](https://developer.mozilla.org/en-US/docs/Web/Web_Components)
- [State of JS 2024 — Front-end Frameworks](https://stateofjs.com/en-US/other-tools/front_end_frameworks)
- `20.5-frontend-frameworks/`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
