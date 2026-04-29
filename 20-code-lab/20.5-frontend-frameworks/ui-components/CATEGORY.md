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

## 相关索引

- [30-knowledge-base/30.2-categories/README.md](../../../30-knowledge-base/30.2-categories/README.md)
- [30-knowledge-base/30.2-categories/02-ui-component-libraries.md](../../../30-knowledge-base/30.2-categories/02-ui-component-libraries.md)

## 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| React Composition Patterns | 文档 | [react.dev/learn/thinking-in-react](https://react.dev/learn/thinking-in-react) |
| Vue — Component Basics | 文档 | [vuejs.org/guide/essentials/component-basics](https://vuejs.org/guide/essentials/component-basics) |
| Web Components — MDN | 文档 | [developer.mozilla.org/en-US/docs/Web/Web_Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components) |
| Islands Architecture | 博客 | [jasonformat.com/islands-architecture](https://jasonformat.com/islands-architecture) |
| Astro Islands | 文档 | [docs.astro.build/en/concepts/islands](https://docs.astro.build/en/concepts/islands) |
| WAI-ARIA Authoring Practices | 指南 | [www.w3.org/WAI/ARIA/apg](https://www.w3.org/WAI/ARIA/apg) |
| Radix UI — Primitives | 文档 | [www.radix-ui.com](https://www.radix-ui.com) |
| React Aria — Adobe Accessible Components | 文档 | [react-spectrum.adobe.com/react-aria](https://react-spectrum.adobe.com/react-aria) |
| Headless UI — Tailwind | 文档 | [headlessui.com](https://headlessui.com) |
| Web Components Spec — W3C | 规范 | [github.com/w3c/webcomponents](https://github.com/w3c/webcomponents) |
| Inclusive Components — Heydon Pickering | 指南 | [inclusive-components.design](https://inclusive-components.design) |

---

*最后更新: 2026-04-29*
