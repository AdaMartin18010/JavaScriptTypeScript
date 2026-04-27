# Signals 模式 (Signals Patterns)

> 模块编号: 18-frontend-frameworks/signals-patterns
> 复杂度: ⭐⭐⭐⭐ (高级)
> 前置依赖: 00-language-core, 02-design-patterns, 18-frontend-frameworks/react-patterns

---

## 学习目标

完成本模块后，你将能够：

1. 理解 Signals 的核心机制（依赖追踪、惰性求值、细粒度订阅）
2. 在不同框架中使用 Signals（SolidJS、Preact、Angular、Svelte 5）
3. 在 React 项目中集成 Preact Signals 进行性能优化
4. 根据项目特征选择 Signals 或 Hooks
5. 设计 Signals + Observable 的混合架构

---

## 文件结构

| 文件 | 内容 |
|------|------|
| `core-signal.ts` | 从零实现的 Signal 系统（依赖追踪、Computation、batch、untracked） |
| `core-signal.test.ts` | Signal 系统的单元测试 |
| `solid-signals.ts` | SolidJS 风格 API（createSignal/createMemo/createEffect/createResource/createStore） |
| `preact-signals.ts` | Preact Signals（.value 访问、React 集成、GlobalStore） |
| `angular-signals.ts` | Angular Signals（signal/computed/effect、与 RxJS 互操作） |
| `svelte-runes.ts` | Svelte 5 Runes（$state/$derived/$effect、编译时优化、迁移策略） |
| `vue-vapor-signals.ts` | Vue 3.5+ Vapor Mode 风格（ref/reactive/computed/watch/watchEffect） |
| `alien-signals.ts` | 跨框架通用 Signal 原语（signal/computed/effect、SharedStore） |
| `signals-vs-hooks.ts` | Signals vs Hooks 系统性对比与选型指南 |
| `signals-vs-observable.ts` | Signals vs Observable（RxJS）的互补关系与互操作 |
| `index.ts` | 统一导出 |

---

## 核心概念

### 什么是 Signal？

Signal 是一个**响应式原语**，包装一个值并追踪所有读取它的计算（effect/computed）。当值改变时，仅通知这些依赖进行更新。

```typescript
const count = createSignal(0);
const doubled = createComputed(() => count.get() * 2);

createEffect(() => {
  console.log("Count:", count.get());
});

count.set(1); // Effect 自动执行，但组件函数不重渲染！
```

### 为什么 Signals 性能更好？

| 机制 | React Hooks | Signals |
|------|-------------|---------|
| 更新粒度 | 组件级别 | DOM 节点级别 |
| 虚拟 DOM | 需要 diff | 无需 diff |
| 组件重渲染 | 每次状态变化 | 从不重渲染 |
| 性能提升 | 1x（基准） | 6-10x |

---

## 框架对比速查

| 框架 | Signal API | 特点 |
|------|-----------|------|
| **SolidJS** | `createSignal()` / `createMemo()` / `createEffect()` | 细粒度标杆，无虚拟 DOM |
| **Preact** | `signal()` / `computed()` / `effect()` | React 兼容，直接更新 DOM |
| **Angular** | `signal()` / `computed()` / `effect()` | 与 RxJS 共存，企业级 |
| **Svelte 5** | `$state()` / `$derived()` / `$effect()` | 编译时优化，显式边界 |

---

## 学习路径

1. 阅读 `core-signal.ts` — 理解 Signal 内部机制
2. 阅读 `signals-vs-hooks.ts` — 理解范式差异
3. 阅读 `signals-vs-observable.ts` — 理解互补关系
4. 选择感兴趣的框架深入（SolidJS / Preact / Angular / Svelte）
5. 运行各文件的 `demonstrate*()` 函数观察行为

---

## 关联内容

- **理论文档**: `JSTS全景综述/Signals_范式深度分析.md`
- **前端框架分类**: `docs/categories/01-frontend-frameworks.md`
- **状态管理分类**: `docs/categories/05-state-management.md`
- **示例项目**: `examples/beginner-todo-master/` (可尝试用 Signals 重构)
