---
category: frameworks
dimension: 框架生态
sub-dimension: 前端框架
module: 18-frontend-frameworks
---

# 模块归属声明

本模块归属 **「框架（Frameworks）」** 维度，聚焦前端框架核心概念与工程实践。

## 包含内容

- React / Vue / Angular / Svelte / SolidJS 核心机制
- 状态管理模式（Store、Signals、原子化状态）
- 前端路由实现原理
- React 设计模式（HOC、Render Props、Hooks、Compound Components 等）
- 信号（Signals）响应式编程模型

## 子模块目录结构

| 子模块 | 说明 | 典型文件 |
|--------|------|----------|
| `signals-patterns/` | 跨框架 Signals 实现对比 | `core-signal.ts`, `solid-signals.ts`, `preact-signals.ts`, `vue-vapor-signals.ts`, `angular-signals.ts`, `svelte-runes.ts`, `alien-signals.ts` |
| `react-patterns.tsx` | React 高级模式（HOC / Render Props / Hooks） | — |
| `router-implementation.ts` | 前端路由哈希 / History API 实现 | `router-implementation.test.ts` |
| `state-management.ts` | 状态管理架构（原子化 / Store / Proxy） | `state-management.test.ts` |
| `index.ts` | 模块统一导出 | — |

## 代码示例

### 最小化 Signals 系统

```typescript
// core-signal.ts — 框架无关的细粒度响应式
export function createSignal<T>(value: T) {
  const subscribers = new Set<() => void>();

  const read = () => {
    if (activeEffect) subscribers.add(activeEffect);
    return value;
  };

  const write = (next: T) => {
    value = next;
    subscribers.forEach((fn) => fn());
  };

  return [read, write] as const;
}

let activeEffect: (() => void) | null = null;

export function createEffect(fn: () => void) {
  activeEffect = fn;
  fn();
  activeEffect = null;
}
```

### 前端路由极简实现

```typescript
export class MinimalRouter {
  private routes = new Map<string, () => void>();

  on(path: string, handler: () => void) {
    this.routes.set(path, handler);
  }

  navigate(path: string) {
    history.pushState({}, '', path);
    this.routes.get(path)?.();
  }

  listen() {
    window.addEventListener('popstate', () => {
      this.routes.get(location.pathname)?.();
    });
  }
}
```

### React Hooks 复合模式

```tsx
// react-patterns.tsx — Compound Components 示例
import { createContext, useContext, useState } from 'react';

const TabsContext = createContext<{
  active: string;
  setActive: (id: string) => void;
} | null>(null);

export function Tabs({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState('');
  return (
    <TabsContext.Provider value={{ active, setActive }}>
      {children}
    </TabsContext.Provider>
  );
}

Tabs.Tab = function Tab({ id, children }: { id: string; children: React.ReactNode }) {
  const ctx = useContext(TabsContext)!;
  return (
    <button onClick={() => ctx.setActive(id)} aria-selected={ctx.active === id}>
      {children}
    </button>
  );
};
```

## 相关索引

- [30-knowledge-base/30.2-categories/README.md](../../../30-knowledge-base/30.2-categories/README.md)
- [30-knowledge-base/30.2-categories/01-frontend-frameworks.md](../../../30-knowledge-base/30.2-categories/01-frontend-frameworks.md)

## 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| React Documentation | 文档 | [react.dev](https://react.dev) |
| Vue.js Guide | 文档 | [vuejs.org/guide](https://vuejs.org/guide) |
| Svelte / SvelteKit Docs | 文档 | [svelte.dev/docs](https://svelte.dev/docs) |
| SolidJS Docs | 文档 | [docs.solidjs.com](https://docs.solidjs.com) |
| Angular Docs | 文档 | [angular.dev](https://angular.dev) |
| TC39 Signals Proposal | 规范 | [github.com/tc39/proposal-signals](https://github.com/tc39/proposal-signals) |
| Ryan Carniato — The Future of Reactivity | 博客 | [dev.to/ryansolid](https://dev.to/ryansolid) |
| patterns.dev | 指南 | [patterns.dev](https://www.patterns.dev) |

---

*最后更新: 2026-04-29*
