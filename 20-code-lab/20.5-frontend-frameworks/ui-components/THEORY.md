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

## 6. 设计系统

### 原子设计方法论

```
原子（按钮、输入框）→ 分子（搜索栏）→ 有机体（导航栏）→ 模板（页面布局）→ 页面（具体内容）
```

### 设计令牌（Design Tokens）

设计系统的最小单位，以 JSON/YAML 定义：

- 颜色、字体、间距、圆角、阴影
- 跨平台共享（Web、iOS、Android、Figma）

## 7. 组件测试策略

- **单元测试**: 交互和渲染（React Testing Library）
- **视觉测试**: 截图比对（Chromatic、Percy）
- **可访问性测试**: 自动化 a11y 检查（axe-core）

## 8. 与相邻模块的关系

- **57-design-system**: 设计系统的工程实现
- **35-accessibility-a11y**: 组件的可访问性
- **18-frontend-frameworks**: 框架的组件模型

## 9. 权威参考与外部链接

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
