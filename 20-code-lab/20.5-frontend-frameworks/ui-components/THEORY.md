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

## 3. 设计系统

### 原子设计方法论

```
原子（按钮、输入框）→ 分子（搜索栏）→ 有机体（导航栏）→ 模板（页面布局）→ 页面（具体内容）
```

### 设计令牌（Design Tokens）

设计系统的最小单位，以 JSON/YAML 定义：

- 颜色、字体、间距、圆角、阴影
- 跨平台共享（Web、iOS、Android、Figma）

## 4. 组件测试策略

- **单元测试**: 交互和渲染（React Testing Library）
- **视觉测试**: 截图比对（Chromatic、Percy）
- **可访问性测试**: 自动化 a11y 检查（axe-core）

## 5. 与相邻模块的关系

- **57-design-system**: 设计系统的工程实现
- **35-accessibility-a11y**: 组件的可访问性
- **18-frontend-frameworks**: 框架的组件模型
