# UI 组件 — 理论基础

## 1. 组件设计原则

### 单一职责

每个组件只做一件事。如果组件需要处理多种不相关的逻辑，考虑拆分。

### 受控 vs 非受控

- **受控组件**: 状态由父组件管理，通过 props 传入，通过回调传出变更
- **非受控组件**: 状态由组件内部管理（如原生 input），通过 ref 读取

### 复合组件模式

将相关组件组合在一起，共享内部状态：

```jsx
<Select>
  <Select.Trigger />
  <Select.Content>
    <Select.Item value="a">选项A</Select.Item>
  </Select.Content>
</Select>
```

## 2. 无头组件（Headless UI）

分离逻辑与样式：

- 库提供状态管理和键盘交互逻辑
- 开发者完全控制渲染和样式
- 代表：Radix UI、Headless UI、React Aria

## 3. UI 组件模式对比

| 模式 | 复用粒度 | 类型安全 | 学习曲线 | 适用场景 | 代表库 |
|------|---------|---------|---------|---------|--------|
| **Compound Components** | 高（结构复用） | 中 | 中 | 复杂交互组件（Select、Tabs） | Radix UI |
| **Render Props** | 高（逻辑复用） | 中 | 低 | 跨组件共享行为（MouseTracker） | React Router v4 |
| **Hooks** | 极高 | 高 | 低 | 状态逻辑复用、副作用封装 | React Use |
| **Slots** | 高 | 高 | 低 | 框架级内容分发（Vue/Svelte） | Vue 3 |
| **HOC** | 中 | 低 | 中 | 横切关注点（权限、日志） | Redux connect |
| **Control Props** | 高 | 高 | 中 | 完全受控的组件状态 | Downshift |

## 4. 代码示例：Compound Component 完整实现

```tsx
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  Children,
  isValidElement,
  cloneElement,
} from 'react';

// Context 定义
interface TabsContextValue {
  activeTab: string;
  setActiveTab: (id: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabs() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('Tabs subcomponents must be used inside <Tabs>');
  return ctx;
}

// Tabs 容器
interface TabsProps {
  defaultTab: string;
  children: React.ReactNode;
}

function Tabs({ defaultTab, children }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const value = useMemo(() => ({ activeTab, setActiveTab }), [activeTab]);
  return (
    <TabsContext.Provider value={value}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
}

// TabList
function TabList({ children }: { children: React.ReactNode }) {
  return <div className="tab-list" role="tablist">{children}</div>;
}

// TabTrigger
interface TabTriggerProps {
  value: string;
  children: React.ReactNode;
}

function TabTrigger({ value, children }: TabTriggerProps) {
  const { activeTab, setActiveTab } = useTabs();
  const isActive = activeTab === value;
  return (
    <button
      role="tab"
      aria-selected={isActive}
      className={`tab-trigger ${isActive ? 'active' : ''}`}
      onClick={() => setActiveTab(value)}
    >
      {children}
    </button>
  );
}

// TabContent
interface TabContentProps {
  value: string;
  children: React.ReactNode;
}

function TabContent({ value, children }: TabContentProps) {
  const { activeTab } = useTabs();
  if (activeTab !== value) return null;
  return (
    <div role="tabpanel" className="tab-content">
      {children}
    </div>
  );
}

// 组装导出
Tabs.List = TabList;
Tabs.Trigger = TabTrigger;
Tabs.Content = TabContent;

export { Tabs };

// 使用示例
/*
<Tabs defaultTab="account">
  <Tabs.List>
    <Tabs.Trigger value="account">账户</Tabs.Trigger>
    <Tabs.Trigger value="password">密码</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="account">账户设置内容...</Tabs.Content>
  <Tabs.Content value="password">密码修改内容...</Tabs.Content>
</Tabs>
*/
```

## 5. 代码示例：Render Props 模式

```tsx
interface MouseTrackerProps {
  render: (state: { x: number; y: number }) => React.ReactNode;
}

function MouseTracker({ render }: MouseTrackerProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  return (
    <div
      className="tracker-area"
      onMouseMove={(e) => setPosition({ x: e.clientX, y: e.clientY })}
    >
      {render(position)}
    </div>
  );
}

// 使用
<MouseTracker render={({ x, y }) => (
  <p>鼠标位置: {x}, {y}</p>
)} />
```

## 6. 代码示例：无头组件 + CVA 样式变体

```tsx
// headless-cva.tsx — 结合 Radix UI 与 class-variance-authority 的类型安全样式
import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cva, type VariantProps } from 'class-variance-authority';

const overlayVariants = cva(
  'fixed inset-0 z-50 bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out',
  {
    variants: {
      blur: {
        true: 'backdrop-blur-sm',
        false: '',
      },
    },
    defaultVariants: { blur: false },
  }
);

const contentVariants = cva(
  'fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-6 shadow-lg',
  {
    variants: {
      size: {
        sm: 'max-w-sm',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
      },
    },
    defaultVariants: { size: 'md' },
  }
);

interface DialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof contentVariants>,
    VariantProps<typeof overlayVariants> {}

const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  ({ className, size, blur, children, ...props }, ref) => (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className={overlayVariants({ blur })} />
      <DialogPrimitive.Content
        ref={ref}
        className={contentVariants({ size, className })}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
);
DialogContent.displayName = 'DialogContent';

export { DialogContent };
```

## 7. 代码示例：多态组件（Polymorphic Component）

```tsx
// polymorphic.ts — 支持 as 属性的类型安全多态组件
import React from 'react';

type AsProp<C extends React.ElementType> = {
  as?: C;
};

type PropsToOmit<C extends React.ElementType, P> = keyof (AsProp<C> & P);

type PolymorphicComponentProp<
  C extends React.ElementType,
  Props = {}
> = React.PropsWithChildren<Props & AsProp<C>> &
  Omit<React.ComponentPropsWithoutRef<C>, PropsToOmit<C, Props>>;

type BoxProps = { className?: string };

export const Box = <C extends React.ElementType = 'div'>({
  as,
  children,
  className,
  ...rest
}: PolymorphicComponentProp<C, BoxProps>) => {
  const Component = as || 'div';
  return (
    <Component className={className} {...rest}>
      {children}
    </Component>
  );
};

// 使用：Box 可渲染为 button、span、article 等，保持完整类型推断
<Box as="button" type="submit" className="btn">Submit</Box>
<Box as="a" href="/home" className="link">Home</Box>
```

## 8. 代码示例：Vue / Svelte Slot 模式

```vue
<!-- Vue 3: 具名插槽与作用域插槽 -->
<!-- Modal.vue -->
<template>
  <dialog ref="dialogRef">
    <header><slot name="header">默认标题</slot></header>
    <main><slot :open="isOpen" :close="close">默认内容</slot></main>
    <footer><slot name="footer" :close="close"></slot></footer>
  </dialog>
</template>

<!-- 使用 -->
<Modal>
  <template #header>自定义标题</template>
  <template #default="{ open, close }">
    <p>Modal 状态: {{ open }}</p>
    <button @click="close">关闭</button>
  </template>
</Modal>
```

```svelte
<!-- Svelte: 插槽与 let 指令 -->
<!-- DataTable.svelte -->
<table>
  <thead><slot name="header" /></thead>
  <tbody>
    {#each rows as row}
      <slot name="row" {row} />
    {/each}
  </tbody>
</table>

<!-- 使用 -->
<DataTable {rows}>
  <tr slot="header"><th>Name</th><th>Age</th></tr>
  <tr slot="row" let:row>
    <td>{row.name}</td><td>{row.age}</td>
  </tr>
</DataTable>
```

## 9. 设计系统

### 原子设计方法论

```
原子（按钮、输入框）→ 分子（搜索栏）→ 有机体（导航栏）→ 模板（页面布局）→ 页面（具体内容）
```

### 设计令牌（Design Tokens）

设计系统的最小单位，以 JSON/YAML 定义：

```json
// tokens.json — W3C Design Tokens Community Group 格式
{
  "color": {
    "primary": { "$value": "#0d6efd", "$type": "color" },
    "surface": { "$value": "#ffffff", "$type": "color" }
  },
  "spacing": {
    "xs": { "$value": "4px", "$type": "dimension" },
    "sm": { "$value": "8px", "$type": "dimension" },
    "md": { "$value": "16px", "$type": "dimension" }
  },
  "font": {
    "body": {
      "$value": { "family": "Inter", "size": "1rem", "weight": 400 },
      "$type": "font"
    }
  }
}
```

- 颜色、字体、间距、圆角、阴影
- 跨平台共享（Web、iOS、Android、Figma）

## 10. 组件测试策略

- **单元测试**: 交互和渲染（React Testing Library）
- **视觉测试**: 截图比对（Chromatic、Percy）
- **可访问性测试**: 自动化 a11y 检查（axe-core）

## 11. 与相邻模块的关系

- **57-design-system**: 设计系统的工程实现
- **35-accessibility-a11y**: 组件的可访问性
- **18-frontend-frameworks**: 框架的组件模型

## 12. 权威参考与外部链接

| 资源 | 描述 | 链接 |
|------|------|------|
| **Radix UI** | 现代 React 无头组件库 | [radix-ui.com](https://www.radix-ui.com/) |
| **Ariakit** | 可访问的 React UI 组件底层库 | [ariakit.org](https://ariakit.org/) |
| **React Aria** | Adobe 的可访问性 Hooks 集合 | [react-spectrum.adobe.com](https://react-spectrum.adobe.com/react-aria/) |
| **Headless UI** | Tailwind Labs 官方无头组件 | [headlessui.com](https://headlessui.com/) |
| **Downshift** | 组合式自动完成/选择组件 | [github.com/downshift-js/downshift](https://github.com/downshift-js/downshift) |
| **Compound Components Pattern** | Kent C. Dodds 经典文章 | [kentcdodds.com/blog/compound-components-with-react-hooks](https://kentcdodds.com/blog/compound-components-with-react-hooks) |
| **React Patterns** | React 设计模式大全 | [reactpatterns.com](https://reactpatterns.com/) |
| **WAI-ARIA Authoring Practices** | 官方可访问性组件模式 | [w3.org/WAI/ARIA/apg](https://www.w3.org/WAI/ARIA/apg/) |
| **shadcn/ui** | 可复制粘贴的组件集合 | [ui.shadcn.com](https://ui.shadcn.com/) |
| **CVA (class-variance-authority)** | 类型安全样式变体工具 | [cva.style](https://cva.style/) |
| **Tailwind CSS** | 实用优先 CSS 框架 | [tailwindcss.com](https://tailwindcss.com/) |
| **Panda CSS** | 类型安全 CSS-in-JS | [panda-css.com](https://panda-css.com/) |
| **Open Props** | CSS 自定义属性设计系统 | [open-props.style](https://open-props.style/) |
| **Design Tokens W3C Community Group** | 规范 | [github.com/design-tokens/community-group](https://github.com/design-tokens/community-group) |
| **Testing Library** | 测试最佳实践 | [testing-library.com](https://testing-library.com/) |
| **axe-core** | 可访问性自动化引擎 | [github.com/dequelabs/axe-core](https://github.com/dequelabs/axe-core) |
| **Polymorphic React Components** | 类型安全多态组件 | [github.com/kripod/react-polymorphic-box](https://github.com/kripod/react-polymorphic-box) |
