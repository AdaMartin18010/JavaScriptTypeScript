---
title: 04 用 Lit 构建设计系统
description: 掌握基于 Lit 构建企业级设计系统的完整流程：Design Tokens、主题系统、组件库架构、文档化和发布。
---

# 04 用 Lit 构建设计系统

> **前置知识**：Lit 基础与高级模式、CSS 变量、Web Components 标准
>
> **目标**：能够设计、构建和发布基于 Lit 的跨框架设计系统

---

## 1. 设计系统架构

### 1.1 分层架构

```
设计系统分层：
┌─────────────────────────────────────┐
│  应用层 (Applications)               │
│  使用设计系统的具体产品               │
├─────────────────────────────────────┤
│  组件层 (Components)                 │
│  Button, Input, Card, Modal...      │
├─────────────────────────────────────┤
│  模式层 (Patterns)                   │
│  表单模式、导航模式、数据展示模式      │
├─────────────────────────────────────┤
│  令牌层 (Design Tokens)              │
│  颜色、字体、间距、阴影、圆角...      │
├─────────────────────────────────────┤
│  基础层 (Foundation)                 │
│  CSS Reset、动画、工具类              │
└─────────────────────────────────────┘
```

### 1.2 Monorepo 结构

```
design-system/
├── packages/
│   ├── tokens/           # Design Tokens
│   ├── styles/           # 基础样式
│   ├── components/       # Lit 组件库
│   ├── react/            # React 包装器
│   ├── vue/              # Vue 包装器
│   └── angular/          # Angular 包装器
├── apps/
│   └── storybook/        # 文档和演示
└── tools/
    └── build/            # 构建工具
```

---

## 2. Design Tokens

### 2.1 Token 定义

```typescript
// packages/tokens/src/tokens.ts
export const tokens = {
  color: {
    primary: {
      50: '#e3f2fd',
      100: '#bbdefb',
      500: '#2196f3',
      600: '#1e88e5',
      700: '#1976d2',
      900: '#0d47a1',
    },
    neutral: {
      0: '#ffffff',
      50: '#f8f9fa',
      100: '#e9ecef',
      500: '#6c757d',
      900: '#212529',
    },
    semantic: {
      success: '#28a745',
      warning: '#ffc107',
      error: '#dc3545',
      info: '#17a2b8',
    },
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
  },
  typography: {
    fontFamily: {
      sans: '"Inter", system-ui, sans-serif',
      mono: '"Fira Code", monospace',
    },
    size: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
    },
    weight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
  borderRadius: {
    none: '0',
    sm: '2px',
    md: '4px',
    lg: '8px',
    xl: '16px',
    full: '9999px',
  },
  shadow: {
    sm: '0 1px 2px rgba(0,0,0,0.05)',
    md: '0 4px 6px rgba(0,0,0,0.1)',
    lg: '0 10px 15px rgba(0,0,0,0.1)',
    xl: '0 20px 25px rgba(0,0,0,0.15)',
  },
} as const;

export type Tokens = typeof tokens;
```

### 2.2 Token 转换为 CSS 变量

```typescript
// packages/tokens/src/build.ts
import { tokens } from './tokens.js';

function flattenTokens(obj: any, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}-${key}` : key;
    if (typeof value === 'object' && value !== null) {
      Object.assign(result, flattenTokens(value, newKey));
    } else {
      result[`--ds-${newKey}`] = String(value);
    }
  }

  return result;
}

export function generateCSSVariables(): string {
  const flat = flattenTokens(tokens);
  const lines = Object.entries(flat).map(([key, value]) => `  ${key}: ${value};`);
  return `:root {\n${lines.join('\n')}\n}`;
}

// 输出 CSS
// :root {
//   --ds-color-primary-50: #e3f2fd;
//   --ds-color-primary-500: #2196f3;
//   --ds-spacing-md: 16px;
//   ...
// }
```

### 2.3 主题变量

```css
/* packages/styles/src/themes.css */
:root {
  /* Light Theme (Default) */
  --ds-bg-primary: var(--ds-color-neutral-0);
  --ds-bg-secondary: var(--ds-color-neutral-50);
  --ds-text-primary: var(--ds-color-neutral-900);
  --ds-text-secondary: var(--ds-color-neutral-500);
  --ds-border-color: var(--ds-color-neutral-100);
}

[data-theme="dark"] {
  --ds-bg-primary: var(--ds-color-neutral-900);
  --ds-bg-secondary: #1a1d20;
  --ds-text-primary: var(--ds-color-neutral-0);
  --ds-text-secondary: var(--ds-color-neutral-500);
  --ds-border-color: #343a40;
}
```

---

## 3. 组件库构建

### 3.1 Button 组件

```typescript
// packages/components/src/button/button.ts
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

@customElement('ds-button')
export class DSButton extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
    }

    button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--ds-spacing-sm);
      padding: var(--ds-spacing-sm) var(--ds-spacing-md);
      font-family: var(--ds-typography-fontFamily-sans);
      font-size: var(--ds-typography-size-base);
      font-weight: var(--ds-typography-weight-medium);
      border: 1px solid transparent;
      border-radius: var(--ds-borderRadius-md);
      cursor: pointer;
      transition: all 0.2s ease;
    }

    /* Variants */
    button.variant--primary {
      background: var(--ds-color-primary-500);
      color: white;
    }
    button.variant--primary:hover:not(:disabled) {
      background: var(--ds-color-primary-600);
    }

    button.variant--secondary {
      background: var(--ds-bg-secondary);
      color: var(--ds-text-primary);
      border-color: var(--ds-border-color);
    }
    button.variant--secondary:hover:not(:disabled) {
      background: var(--ds-bg-primary);
    }

    button.variant--ghost {
      background: transparent;
      color: var(--ds-text-primary);
    }
    button.variant--ghost:hover:not(:disabled) {
      background: var(--ds-bg-secondary);
    }

    /* Sizes */
    button.size--sm {
      padding: var(--ds-spacing-xs) var(--ds-spacing-sm);
      font-size: var(--ds-typography-size-sm);
    }
    button.size--lg {
      padding: var(--ds-spacing-md) var(--ds-spacing-lg);
      font-size: var(--ds-typography-size-lg);
    }

    /* States */
    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    button.loading {
      position: relative;
      color: transparent;
    }
    button.loading::after {
      content: '';
      position: absolute;
      width: 1em;
      height: 1em;
      border: 2px solid currentColor;
      border-right-color: transparent;
      border-radius: 50%;
      animation: spin 0.75s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;

  @property()
  variant: 'primary' | 'secondary' | 'ghost' = 'primary';

  @property()
  size: 'sm' | 'md' | 'lg' = 'md';

  @property({ type: Boolean })
  disabled = false;

  @property({ type: Boolean })
  loading = false;

  @property()
  type: 'button' | 'submit' | 'reset' = 'button';

  render() {
    const classes = classMap({
      [`variant--${this.variant}`]: true,
      [`size--${this.size}`]: true,
      'loading': this.loading,
    });

    return html`
      <button
        class="${classes}"
        ?disabled="${this.disabled || this.loading}"
        type="${this.type}"
        @click="${this._handleClick}"
      >
        <slot></slot>
      </button>
    `;
  }

  private _handleClick(e: Event) {
    if (this.loading || this.disabled) {
      e.preventDefault();
      return;
    }
    // 事件会自动冒泡
  }
}
```

```html
<!-- 使用 -->
<ds-button variant="primary" size="lg">主要按钮</ds-button>
<ds-button variant="secondary" disabled>禁用按钮</ds-button>
<ds-button variant="ghost" loading>加载中</ds-button>
```

### 3.2 Input 组件

```typescript
// packages/components/src/input/input.ts
import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { live } from 'lit/directives/live.js';

@customElement('ds-input')
export class DSInput extends LitElement {
  static styles = css`
    :host { display: block; }

    .input-wrapper {
      display: flex;
      flex-direction: column;
      gap: var(--ds-spacing-xs);
    }

    label {
      font-size: var(--ds-typography-size-sm);
      font-weight: var(--ds-typography-weight-medium);
      color: var(--ds-text-primary);
    }

    input {
      padding: var(--ds-spacing-sm) var(--ds-spacing-md);
      font-family: var(--ds-typography-fontFamily-sans);
      font-size: var(--ds-typography-size-base);
      border: 1px solid var(--ds-border-color);
      border-radius: var(--ds-borderRadius-md);
      background: var(--ds-bg-primary);
      color: var(--ds-text-primary);
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    input:focus {
      outline: none;
      border-color: var(--ds-color-primary-500);
      box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
    }

    input.error {
      border-color: var(--ds-color-semantic-error);
    }
    input.error:focus {
      box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
    }

    .hint {
      font-size: var(--ds-typography-size-xs);
      color: var(--ds-text-secondary);
    }

    .error-message {
      font-size: var(--ds-typography-size-xs);
      color: var(--ds-color-semantic-error);
    }
  `;

  @property()
  label = '';

  @property()
  placeholder = '';

  @property()
  value = '';

  @property()
  type: 'text' | 'email' | 'password' | 'number' = 'text';

  @property()
  hint = '';

  @property()
  error = '';

  @property({ type: Boolean })
  required = false;

  @property({ type: Boolean })
  disabled = false;

  render() {
    return html`
      <div class="input-wrapper">
        ${this.label ? html`<label>${this.label}${this.required ? ' *' : ''}</label>` : ''}
        <input
          .value="${live(this.value)}"
          type="${this.type}"
          placeholder="${this.placeholder}"
          ?disabled="${this.disabled}"
          ?required="${this.required}"
          class="${this.error ? 'error' : ''}"
          @input="${this._handleInput}"
          @change="${this._handleChange}"
        />
        ${this.error ? html`<span class="error-message">${this.error}</span>` : ''}
        ${this.hint && !this.error ? html`<span class="hint">${this.hint}</span>` : ''}
      </div>
    `;
  }

  private _handleInput(e: InputEvent) {
    const target = e.target as HTMLInputElement;
    this.value = target.value;
    this.dispatchEvent(new CustomEvent('input', {
      detail: { value: this.value },
      bubbles: true,
      composed: true,
    }));
  }

  private _handleChange(e: Event) {
    this.dispatchEvent(new CustomEvent('change', {
      detail: { value: this.value },
      bubbles: true,
      composed: true,
    }));
  }
}
```

---

## 4. 文档化（Storybook）

### 4.1 Storybook 配置

```typescript
// apps/storybook/.storybook/main.ts
import type { StorybookConfig } from '@storybook/web-components-vite';

const config: StorybookConfig = {
  stories: ['../../packages/components/src/**/*.stories.ts'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
  ],
  framework: {
    name: '@storybook/web-components-vite',
    options: {},
  },
};

export default config;
```

### 4.2 组件 Story

```typescript
// packages/components/src/button/button.stories.ts
import type { Meta, StoryObj } from '@storybook/web-components';
import './button.js';

const meta: Meta = {
  title: 'Components/Button',
  component: 'ds-button',
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj;

export const Primary: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    children: '主要按钮',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: '次要按钮',
  },
};

export const Disabled: Story = {
  args: {
    variant: 'primary',
    disabled: true,
    children: '禁用按钮',
  },
};

export const Loading: Story = {
  args: {
    variant: 'primary',
    loading: true,
    children: '加载中',
  },
};
```

---

## 5. 发布与分发

### 5.1 package.json 配置

```json
{
  "name": "@mycompany/design-system",
  "version": "1.0.0",
  "type": "module",
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": "./dist/index.js",
    "./components": "./dist/components/index.js",
    "./tokens": "./dist/tokens/index.js",
    "./styles": "./dist/styles/index.css"
  },
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "tsc && rollup -c",
    "build:tokens": "node scripts/build-tokens.js",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  },
  "peerDependencies": {
    "lit": "^3.0.0"
  }
}
```

### 5.2 Rollup 构建配置

```javascript
// rollup.config.js
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import summary from 'rollup-plugin-summary';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.js',
      format: 'esm',
    },
  ],
  plugins: [
    resolve(),
    typescript(),
    summary(),
  ],
};
```

---

## 常见陷阱

| 陷阱 | 说明 | 修正 |
|------|------|------|
| **Token 命名不一致** | 不同团队使用不同命名规范 | 建立严格的 Token 命名规范 |
| **主题变量遗漏** | 新组件忘记使用主题变量 | 建立组件审查清单 |
| **构建产物过大** | 未按需加载，打包了全部组件 | 支持 Tree Shaking 和按需导入 |
| **版本兼容性** | 主版本升级破坏现有应用 | 遵循 SemVer，提供迁移指南 |

---

## 练习

1. 创建一个完整的 Design Token 系统：颜色、间距、字体、阴影，并生成 CSS 变量。
2. 实现设计系统的基础组件：Button、Input、Card、Modal，统一使用 Token。
3. 搭建 Storybook 文档站点：包含组件演示、使用说明、主题切换。

---

## 延伸阅读

- [Design Tokens W3C Community Group](https://www.w3.org/community/designtokens/)
- [Storybook for Web Components](https://storybook.js.org/docs/web-components/get-started/introduction)
- [Lit Design Systems](https://lit.dev/docs/tools/starter-kits/)
