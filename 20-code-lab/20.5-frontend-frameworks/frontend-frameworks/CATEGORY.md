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
- React Server Components（RSC）与 Streaming SSR
- Vue `<script setup>` 与组合式 API 深入模式
- Svelte 5 Runes 与编译时响应式
- SolidJS 细粒度更新与资源加载
- Angular Signals 与基于 Zone.js 的变更检测演进

## 子模块目录结构

| 子模块 | 说明 | 典型文件 |
|--------|------|----------|
| `signals-patterns/` | 跨框架 Signals 实现对比 | `core-signal.ts`, `solid-signals.ts`, `preact-signals.ts`, `vue-vapor-signals.ts`, `angular-signals.ts`, `svelte-runes.ts`, `alien-signals.ts` |
| `react-patterns.tsx` | React 高级模式（HOC / Render Props / Hooks） | — |
| `router-implementation.ts` | 前端路由哈希 / History API 实现 | `router-implementation.test.ts` |
| `state-management.ts` | 状态管理架构（原子化 / Store / Proxy） | `state-management.test.ts` |
| `rsc-patterns.ts` | React Server Component 数据获取与缓存 | — |
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

### useSyncExternalStore 封装外部状态

```typescript
// external-store.ts
import { useSyncExternalStore } from 'react';

class BrowserStore {
  private listeners = new Set<() => void>();
  private online = navigator.onLine;

  constructor() {
    window.addEventListener('online', () => this.set(true));
    window.addEventListener('offline', () => this.set(false));
  }

  private set(value: boolean) {
    this.online = value;
    this.listeners.forEach((l) => l());
  }

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getSnapshot = () => this.online;
}

const browserStore = new BrowserStore();

export function useOnlineStatus() {
  return useSyncExternalStore(
    browserStore.subscribe,
    browserStore.getSnapshot,
    () => true // SSR 快照
  );
}
```

### 基于 Proxy 的极简状态管理

```typescript
// proxy-state.ts
export function createStore<T extends object>(initial: T) {
  const listeners = new Set<(next: T, prev: T) => void>();
  let state = initial;

  const proxy = new Proxy(initial, {
    set(target, prop, value) {
      const prev = { ...state } as T;
      (target as any)[prop] = value;
      state = target;
      listeners.forEach((fn) => fn(state, prev));
      return true;
    },
  });

  return {
    state: proxy,
    subscribe(fn: (next: T, prev: T) => void) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
}

// 使用
const counter = createStore({ count: 0 });
counter.subscribe((next, prev) => {
  console.log(`Count: ${prev.count} → ${next.count}`);
});
counter.state.count++; // 自动触发订阅
```

### React Server Component 数据获取模式

```tsx
// rsc-patterns.ts — 服务端组件直接查询数据库（伪代码）
import { db } from './db';

export async function ProductList({ category }: { category: string }) {
  // 仅在服务端执行，不打包到客户端 bundle
  const products = await db.query('SELECT * FROM products WHERE category = ?', [category]);

  return (
    <ul>
      {products.map((p) => (
        <li key={p.id}>{p.name} — ¥{p.price}</li>
      ))}
    </ul>
  );
}
```

### Vue `<script setup>` 与依赖注入

```vue
<!-- VueCounter.vue -->
<script setup lang="ts">
import { ref, inject, provide } from 'vue';

const count = ref(0);
const increment = () => count.value++;

// 跨层级依赖注入
provide('theme', 'dark');
</script>

<template>
  <button @click="increment">Count: {{ count }}</button>
</template>
```

### Svelte 5 Runes 响应式

```svelte
<!-- Counter.svelte (Svelte 5) -->
<script>
  let count = $state(0);
  let doubled = $derived(count * 2);

  function increment() {
    count += 1;
  }
</script>

<button onclick={increment}>
  {count} x 2 = {doubled}
</button>
```

### SolidJS 资源加载与错误边界

```tsx
// solid-resource.tsx
import { createResource, Suspense, ErrorBoundary } from 'solid-js';

const fetchUser = async (id: string) => {
  const res = await fetch(`/api/users/${id}`);
  if (!res.ok) throw new Error('Failed to load user');
  return res.json();
};

export function UserProfile({ id }: { id: string }) {
  const [user] = createResource(id, fetchUser);

  return (
    <ErrorBoundary fallback={<p>Failed to load user.</p>}>
      <Suspense fallback={<p>Loading...</p>}>
        <div>
          <h1>{user()?.name}</h1>
          <p>{user()?.email}</p>
        </div>
      </Suspense>
    </ErrorBoundary>
  );
}
```

### Angular Signals 与变更检测

```typescript
// angular-signals.component.ts
import { Component, signal, computed, effect } from '@angular/core';

@Component({
  selector: 'app-counter',
  template: `<button (click)="increment()">{{ count() }}</button>`,
})
export class CounterComponent {
  count = signal(0);
  double = computed(() => this.count() * 2);

  constructor() {
    effect(() => {
      console.log('Count changed:', this.count());
    });
  }

  increment() {
    this.count.update((v) => v + 1);
  }
}
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
| React useSyncExternalStore API | 文档 | [react.dev/reference/react/useSyncExternalStore](https://react.dev/reference/react/useSyncExternalStore) |
| Preact Signals Documentation | 文档 | [preactjs.com/guide/v10/signals](https://preactjs.com/guide/v10/signals) |
| MDN — Proxy Object | 文档 | [developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) |
| Vercel — React Server Components | 文档 | [nextjs.org/docs/app/building-your-application/rendering/server-components](https://nextjs.org/docs/app/building-your-application/rendering/server-components) |
| Web Standards — DOM Spec (WHATWG) | 规范 | [dom.spec.whatwg.org](https://dom.spec.whatwg.org/) |
| React RFC — Server Components | 规范 | [github.com/reactjs/rfcs/blob/main/text/0188-server-components.md](https://github.com/reactjs/rfcs/blob/main/text/0188-server-components.md) |
| Vue RFC — `<script setup>` | 规范 | [github.com/vuejs/rfcs/blob/master/active-rfcs/0040-script-setup.md](https://github.com/vuejs/rfcs/blob/master/active-rfcs/0040-script-setup.md) |
| Svelte 5 Runes Preview | 博客 | [svelte.dev/blog/runes](https://svelte.dev/blog/runes) |
| Angular Signals Guide | 文档 | [angular.dev/guide/signals](https://angular.dev/guide/signals) |
| SolidJS Primitives Reference | 文档 | [docs.solidjs.com/reference/reactive-utilities/create-resource](https://docs.solidjs.com/reference/reactive-utilities/create-resource) |

---

*最后更新: 2026-04-30*
