---
category: frameworks
dimension: 框架生态
sub-dimension: UI 组件系统
module: 51-ui-components
---

# 模块归属声明

本模块归属 **「框架（Frameworks）」** 维度，聚焦 UI 组件系统的设计模式、生命周期、通信机制与渲染策略。

## 包含内容

- 组件生命周期模型
- 组件组合与插槽模式
- 组件通信模式（Props、Events、Context、Provide/Inject）
- 组件级状态管理架构
- 组件渲染策略（CSR、SSR、 islands、Partial Hydration）
- AI 辅助组件系统设计（实验性）

## 子模块目录结构

| 子模块 | 说明 | 典型文件 |
|--------|------|----------|
| `component-lifecycle-models.ts` | 挂载 / 更新 / 卸载生命周期抽象 | `component-lifecycle-models.test.ts` |
| `component-composition-models.ts` | 插槽、Render Props、Children as Function | `component-composition-models.test.ts` |
| `component-communication-patterns.ts` | Props、Events、Context、Provide/Inject 通信 | `component-communication-patterns.test.ts` |
| `state-management-architectures.ts` | 组件级状态机与局部 Store | `state-management-architectures.test.ts` |
| `rendering-strategies.ts` | CSR / SSR / Islands / Partial Hydration | `rendering-strategies.test.ts` |
| `ai-component-system.ts` | AI 生成组件与提示词工程 | `ai-component-system.test.ts` |
| `index.ts` | 模块统一导出 | — |

## 代码示例

### 通用组件生命周期钩子

```typescript
// component-lifecycle-models.ts
export interface LifecycleHooks {
  onMount?(): void | (() => void);
  onUpdate?(prevProps: Record<string, unknown>): void;
  onUnmount?(): void;
}

export function createLifecycleManager(hooks: LifecycleHooks) {
  let mounted = false;

  return {
    mount() {
      const cleanup = hooks.onMount?.();
      mounted = true;
      return cleanup;
    },
    update(prev: Record<string, unknown>) {
      if (mounted) hooks.onUpdate?.(prev);
    },
    unmount() {
      hooks.onUnmount?.();
      mounted = false;
    },
  };
}
```

### 跨层级 Context 模式

```typescript
// component-communication-patterns.ts
import { createContext, useContext } from 'react';

interface ThemeContextValue {
  mode: 'light' | 'dark';
  toggle(): void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
```

### Islands 架构水合控制

```typescript
// rendering-strategies.ts
export function createIsland(
  selector: string,
  hydrate: (root: HTMLElement) => void
) {
  if (typeof window === 'undefined') return; // SSR 时跳过

  const roots = document.querySelectorAll<HTMLElement>(selector);
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        hydrate(entry.target as HTMLElement);
        observer.unobserve(entry.target);
      }
    });
  });

  roots.forEach((root) => observer.observe(root));
}
```

### Render Props 与插槽抽象

```typescript
// component-composition-models.ts
import React from 'react';

interface ToggleProps {
  children: (state: { on: boolean; toggle: () => void }) => React.ReactNode;
}

export function Toggle({ children }: ToggleProps) {
  const [on, setOn] = React.useState(false);
  const toggle = () => setOn((prev) => !prev);
  return <>{children({ on, toggle })}</>;
}

// 使用
// <Toggle>
//   {({ on, toggle }) => (
//     <button onClick={toggle}>{on ? 'ON' : 'OFF'}</button>
//   )}
// </Toggle>
```

### 通用插槽包装器（框架无关模式）

```typescript
// slot-wrapper.ts
interface SlotConfig<T = unknown> {
  default?: (props: T) => unknown;
  header?: (props: T) => unknown;
  footer?: (props: T) => unknown;
}

export function renderSlots<T>(
  slots: SlotConfig<T>,
  props: T
): { header?: unknown; body: unknown; footer?: unknown } {
  return {
    header: slots.header?.(props),
    body: slots.default?.(props) ?? null,
    footer: slots.footer?.(props),
  };
}

// Vue / Solid 风格：通过函数分发插槽内容
// React 风格：直接传入 children / render props
```

### 事件委托与组件通信总线

```typescript
// event-delegation.ts
export class ComponentBus {
  private handlers = new Map<string, Set<(payload: unknown) => void>>();

  on(event: string, handler: (payload: unknown) => void) {
    if (!this.handlers.has(event)) this.handlers.set(event, new Set());
    this.handlers.get(event)!.add(handler);
    return () => this.handlers.get(event)?.delete(handler);
  }

  emit(event: string, payload?: unknown) {
    this.handlers.get(event)?.forEach((h) => h(payload));
  }
}

// 用于兄弟组件通信或跨层级轻量事件
export const globalBus = new ComponentBus();
```

### 复合组件（Compound Component）模式

```typescript
// compound-component.ts — 内部状态共享，外部声明式组合

import React, { createContext, useContext, useState, useCallback } from 'react';

interface TabsContextValue {
  activeIndex: number;
  setActiveIndex: (i: number) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabs() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('Tabs subcomponents must be used within <Tabs>');
  return ctx;
}

export function Tabs({ children, defaultIndex = 0 }: { children: React.ReactNode; defaultIndex?: number }) {
  const [activeIndex, setActiveIndex] = useState(defaultIndex);
  return (
    <TabsContext.Provider value={{ activeIndex, setActiveIndex }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
}

export function TabList({ children }: { children: React.ReactNode }) {
  return <div className="tab-list" role="tablist">{children}</div>;
}

export function Tab({ index, children }: { index: number; children: React.ReactNode }) {
  const { activeIndex, setActiveIndex } = useTabs();
  return (
    <button
      role="tab"
      aria-selected={activeIndex === index}
      className={activeIndex === index ? 'tab active' : 'tab'}
      onClick={() => setActiveIndex(index)}
    >
      {children}
    </button>
  );
}

export function TabPanel({ index, children }: { index: number; children: React.ReactNode }) {
  const { activeIndex } = useTabs();
  if (activeIndex !== index) return null;
  return <div role="tabpanel">{children}</div>;
}

// 使用
// <Tabs defaultIndex={0}>
//   <TabList>
//     <Tab index={0}>First</Tab>
//     <Tab index={1}>Second</Tab>
//   </TabList>
//   <TabPanel index={0}>Content 1</TabPanel>
//   <TabPanel index={1}>Content 2</TabPanel>
// </Tabs>
```

### 受控与非受控组件桥接

```typescript
// controlled-bridge.ts — 同时支持受控和非受控模式

import { useState, useCallback } from 'react';

interface UseControllableStateOptions<T> {
  propValue?: T;
  defaultValue: T;
  onChange?: (value: T) => void;
}

export function useControllableState<T>(options: UseControllableStateOptions<T>) {
  const { propValue, defaultValue, onChange } = options;
  const isControlled = propValue !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);

  const value = isControlled ? propValue : internalValue;
  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      const resolved = typeof next === 'function' ? (next as (prev: T) => T)(value) : next;
      if (!isControlled) setInternalValue(resolved);
      onChange?.(resolved);
    },
    [isControlled, onChange, value]
  );

  return [value, setValue] as const;
}
```

## 相关索引

- [30-knowledge-base/30.2-categories/README.md](../../../30-knowledge-base/30.2-categories/README.md)
- [30-knowledge-base/30.2-categories/02-ui-component-libraries.md](../../../30-knowledge-base/30.2-categories/02-ui-component-libraries.md)

## 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| React Composition Patterns | 文档 | [react.dev/learn/thinking-in-react](https://react.dev/learn/thinking-in-react) |
| React — Lifting State Up | 文档 | [react.dev/learn/state-a-components-memory](https://react.dev/learn/state-a-components-memory) |
| Vue — Component Basics | 文档 | [vuejs.org/guide/essentials/component-basics](https://vuejs.org/guide/essentials/component-basics) |
| Vue — Provide / Inject | 文档 | [vuejs.org/guide/components/provide-inject](https://vuejs.org/guide/components/provide-inject.html) |
| Web Components — MDN | 文档 | [developer.mozilla.org/en-US/docs/Web/Web_Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components) |
| Islands Architecture | 博客 | [jasonformat.com/islands-architecture](https://jasonformat.com/islands-architecture) |
| Astro Islands | 文档 | [docs.astro.build/en/concepts/islands](https://docs.astro.build/en/concepts/islands) |
| WAI-ARIA Authoring Practices | 指南 | [www.w3.org/WAI/ARIA/apg](https://www.w3.org/WAI/ARIA/apg) |
| Radix UI — Primitives | 文档 | [www.radix-ui.com](https://www.radix-ui.com) |
| React Aria — Adobe Accessible Components | 文档 | [react-spectrum.adobe.com/react-aria](https://react-spectrum.adobe.com/react-aria) |
| Headless UI — Tailwind | 文档 | [headlessui.com](https://headlessui.com) |
| Web Components Spec — W3C | 规范 | [github.com/w3c/webcomponents](https://github.com/w3c/webcomponents) |
| Inclusive Components — Heydon Pickering | 指南 | [inclusive-components.design](https://inclusive-components.design) |
| Kent C. Dodds — Compound Components | 博客 | [kentcdodds.com/blog/compound-components-with-react-hooks](https://kentcdodds.com/blog/compound-components-with-react-hooks) |
| Patterns.dev — Modern Web App Design Patterns | 指南 | [www.patterns.dev](https://www.patterns.dev) |

---

*最后更新: 2026-04-29*
