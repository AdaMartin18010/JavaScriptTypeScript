---
title: 10 迁移路径
description: 从 React/Vue 组件迁移到 Lit Web Components 的策略：渐进式迁移、封装模式、测试迁移和团队协作。
---

# 10 迁移路径

## 1. 迁移策略

### 1.1 渐进式迁移

```
Phase 1: 新组件用 Lit
├── 保持现有框架组件
├── 新通用组件使用 Lit
└── 通过包装器集成

Phase 2: 替换原子组件
├── Button、Input、Card
├── 无状态展示组件
└── 设计系统基础

Phase 3: 替换复合组件
├── 表单组件
├── 导航组件
└── 数据展示组件

Phase 4: 框架解耦
├── 移除 React/Vue 依赖
├── 统一为 Web Components
└── 优化构建流程
```

### 1.2 封装模式

```tsx
// React 包装器
import { createComponent } from '@lit/react';
import { DSButton } from '@mycompany/design-system';

export const Button = createComponent({
  tagName: 'ds-button',
  elementClass: DSButton,
  react: React,
});

// 使用（对业务团队透明）
<Button variant="primary">Click</Button>
```

---

## 2. 常见迁移模式

### 2.1 Props 映射

| React/Vue | Lit |
|-----------|-----|
| props | @property |
| emit/on | dispatchEvent |
| v-model / value | @property + event |
| slot | `<slot>` |
| ref | @query |

### 2.2 生命周期映射

| React | Vue | Lit |
|-------|-----|-----|
| useEffect | mounted | connectedCallback |
| useEffect cleanup | unmounted | disconnectedCallback |
| useMemo | computed | willUpdate |
| render() | template | render() |

---

## 3. 测试迁移

```typescript
// React 测试
render(<Button onClick={handleClick}>Click</Button>);
fireEvent.click(screen.getByText('Click'));

// Lit 测试
const el = await fixture(html`<ds-button>Click</ds-button>`);
el.shadowRoot?.querySelector('button')?.click();
```

---

## 延伸阅读

- [Migrating to Web Components](https://open-wc.org/guides/developing-components/migrating/)
