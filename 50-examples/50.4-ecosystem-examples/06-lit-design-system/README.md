# Lit Design System Starter

基于 Lit + Web Components 的跨框架设计系统启动模板。

## 目标

构建一套可在 React/Vue/Angular/HTMX 中复用的组件库。

## 技术栈

| 层级 | 技术 |
|------|------|
| 组件框架 | Lit 3.x |
| 构建 | Vite + TypeScript |
| 样式 | CSS Custom Properties (Design Tokens) |
| 文档 | Storybook |
| 测试 | Web Test Runner |
| 发布 | npm + Changesets |

## 快速开始

```bash
# 1. 克隆模板
git clone <repo-url> my-design-system
cd my-design-system

# 2. 安装依赖
npm install

# 3. 启动 Storybook
npm run storybook

# 4. 构建组件库
npm run build

# 5. 本地测试
npm run test
```

## 项目结构

```
my-design-system/
├── src/
│   ├── tokens/           # Design Tokens (CSS 变量)
│   │   ├── colors.css
│   │   ├── spacing.css
│   │   └── typography.css
│   ├── components/
│   │   ├── button/
│   │   │   ├── ds-button.ts
│   │   │   ├── ds-button.styles.ts
│   │   │   └── ds-button.test.ts
│   │   ├── input/
│   │   ├── card/
│   │   └── modal/
│   └── index.ts
├── .storybook/
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## 组件示例

```ts
// src/components/button/ds-button.ts
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('ds-button')
export class DSButton extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
    }
    button {
      background: var(--ds-color-primary);
      color: var(--ds-color-on-primary);
      padding: var(--ds-spacing-sm) var(--ds-spacing-md);
      border: none;
      border-radius: var(--ds-radius-md);
      font-family: var(--ds-font-family);
      cursor: pointer;
    }
    button:hover {
      background: var(--ds-color-primary-hover);
    }
    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `;

  @property({ type: String }) variant: 'primary' | 'secondary' = 'primary';
  @property({ type: Boolean }) disabled = false;

  render() {
    return html`
      <button ?disabled=${this.disabled} part="button">
        <slot></slot>
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-button': DSButton;
  }
}
```

## 跨框架使用

### React

```tsx
import 'my-design-system';

function App() {
  return <ds-button variant="primary">Click me</ds-button>;
}
```

### Vue

```vue
<template>
  <ds-button variant="secondary" @click="handleClick">
    Submit
  </ds-button>
</template>
```

### HTMX/纯 HTML

```html
<!DOCTYPE html>
<html>
<head>
  <script type="module" src="https://unpkg.com/my-design-system"></script>
</head>
<body>
  <ds-button variant="primary">Click me</ds-button>
</body>
</html>
```

## 验证清单

- [ ] 组件在 Storybook 中正常渲染
- [ ] 所有组件通过单元测试
- [ ] React/Vue/Angular 集成测试通过
- [ ] CSS 变量可被宿主应用覆盖
- [ ] Tree-shaking 正常工作（按需引入）

## 相关专题

- [Lit Web Components 深度专题](/lit-web-components/)
