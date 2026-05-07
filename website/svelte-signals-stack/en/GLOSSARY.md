# Bilingual Glossary — 中英术语对照表

> **Purpose**: Standardized terminology for translation consistency and international communication
> **Scope**: Svelte 5 Signals Compiler Ecosystem
> **Last Updated**: 2026-05-07

---

## Core Concepts

| English | 中文 | Notes |
|:---|:---|:---|
| Signal | 信号 | The primitive reactive value unit |
| Source Signal | 状态源 / 源信号 | Writable state container |
| Computed Signal | 派生信号 | Read-only derived value |
| Effect | 副作用 / Effect | Side-effect observer |
| Runes | 符文 | Svelte 5's explicit reactivity syntax |
| Compiler-Based Signals | 编译器驱动信号 | Compile-time dependency analysis |
| Fine-Grained Reactivity | 细粒度响应式 | Signal-level updates |
| Virtual DOM (VDOM) | 虚拟 DOM | In-memory DOM representation |
| Hydration | 水合 / 激活 | SSR DOM reactivation in browser |
| Tree Shaking | 树摇优化 | Dead code elimination |

## Svelte-Specific

| English | 中文 | Notes |
|:---|:---|:---|
| `$state()` | `$state()` | Reactive state declaration |
| `$derived()` | `$derived()` | Derived computation |
| `$effect()` | `$effect()` | Side effect declaration |
| `$props()` | `$props()` | Component props |
| `$bindable()` | `$bindable()` | Two-way binding |
| `.svelte.ts` | `.svelte.ts` | Shared state module |
| Snippet | 片段 | Reusable template block |
| Action | 动作 | `use:` directive function |
| Transition | 过渡 | CSS/JS animation directive |
| Store | 存储 | Svelte 4 legacy state management |

## Compiler & Build

| English | 中文 | Notes |
|:---|:---|:---|
| Abstract Syntax Tree (AST) | 抽象语法树 | Parse phase output |
| Intermediate Representation (IR) | 中间表示 | Transform phase output |
| Tree | 树摇 | Dead code elimination |
| Source Map | 源映射 | Debug mapping |
| HMR | 热模块替换 | Hot Module Replacement |
| Monorepo | 单体仓库 | Single repo, multiple packages |
| Adapter | 适配器 | SvelteKit deployment target |
| Prerender | 预渲染 | Static generation at build time |

## Browser & Rendering

| English | 中文 | Notes |
|:---|:---|:---|
| Critical Rendering Path (CRP) | 关键渲染路径 | Browser pixel pipeline |
| Style Calculation | 样式计算 | CSS matching & cascade |
| Layout | 布局 / 重排 | Geometry computation |
| Paint | 绘制 | Rasterization |
| Composite | 合成 | GPU layer compositing |
| INP | 交互到下一次绘制 | Interaction to Next Paint |
| LCP | 最大内容绘制 | Largest Contentful Paint |
| CLS | 累积布局偏移 | Cumulative Layout Shift |
| VSync | 垂直同步 | Display refresh synchronization |

## Standardization

| English | 中文 | Notes |
|:---|:---|:---|
| TC39 | TC39 | ECMAScript standards committee |
| Stage 1 | 阶段 1 | Proposal introduced |
| Stage 2 | 阶段 2 | Draft specification |
| Stage 3 | 阶段 3 | Candidate |
| Stage 4 | 阶段 4 | Finished (in spec) |
| Polyfill | 补丁 / 垫片 | Backward compatibility shim |

## Formal Methods

| English | 中文 | Notes |
|:---|:---|:---|
| Theorem | 定理 | Provable statement |
| Proof | 证明 | Logical argument |
| Invariant | 不变量 | Property that always holds |
| Soundness | 健全性 / 可靠性 | Correctness guarantee |
| Topological Sort | 拓扑排序 | Dependency ordering |
| Big-O | 大 O | Asymptotic complexity |
| TLA+ | TLA+ | Temporal Logic of Actions |
| Model Checking | 模型检验 | Automated verification |

---

> **Usage**: When translating documents, use this glossary as the authoritative reference. For terms not listed here, prefer the English term with a Chinese explanation on first use.
