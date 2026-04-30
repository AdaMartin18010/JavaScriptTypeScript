# 设计系统 — 理论基础

> **定位**：`20-code-lab/20.5-frontend-frameworks/design-system`
> **关联**：`50-examples/50.2-intermediate/` | `30-knowledge-base/`

---

## 1. 设计系统定义

设计系统是**可复用组件和标准的集合**，用于管理设计的一致性：

- **设计原则**: 指导设计决策的价值观
- **模式库**: 可复用的 UI 组件
- **样式指南**: 颜色、字体、间距等视觉规范
- **内容指南**: 文案语气、术语使用

---

## 2. 设计令牌（Design Tokens）

设计系统的原子单位，是跨平台设计一致性的唯一事实来源：

```json
// tokens.json — W3C Design Tokens Community Group 格式
{
  "color": {
    "primary": { "$value": "#007bff", "$type": "color" },
    "danger": { "$value": "#dc3545", "$type": "color" },
    "surface": {
      "bg": { "$value": "{color.primary}", "$type": "color", "alpha": 0.08 }
    }
  },
  "spacing": {
    "small": { "$value": "4px", "$type": "dimension" },
    "medium": { "$value": "8px", "$type": "dimension" },
    "large": { "$value": "16px", "$type": "dimension" },
    "scale": {
      "$value": "1.5",
      "$type": "number",
      "$description": "间距倍数缩放因子"
    }
  },
  "fontSize": {
    "body": { "$value": "16px", "$type": "dimension" },
    "heading": { "$value": "24px", "$type": "dimension" }
  },
  "shadow": {
    "card": {
      "$value": {
        "x": "0px",
        "y": "4px",
        "blur": "12px",
        "spread": "0px",
        "color": "rgba(0,0,0,0.1)"
      },
      "$type": "shadow"
    }
  }
}
```

工具链转换示例（Style Dictionary → CSS 变量）：

```typescript
// build-tokens.ts
import StyleDictionary from 'style-dictionary';

StyleDictionary.registerTransform({
  name: 'size/px',
  type: 'value',
  matcher: token => token.$type === 'dimension',
  transformer: token => `${token.$value}`,
});

StyleDictionary.extend({
  source: ['tokens.json'],
  platforms: {
    css: {
      transformGroup: 'css',
      buildPath: 'dist/',
      files: [{
        destination: 'variables.css',
        format: 'css/variables',
        options: { outputReferences: true }
      }]
    },
    ts: {
      transformGroup: 'js',
      buildPath: 'dist/',
      files: [{
        destination: 'tokens.ts',
        format: 'javascript/es6'
      }]
    }
  }
}).buildAllPlatforms();
```

生成的 CSS 变量：

```css
/* dist/variables.css */
:root {
  --color-primary: #007bff;
  --color-danger: #dc3545;
  --spacing-small: 4px;
  --spacing-medium: 8px;
  --spacing-large: 16px;
  --font-size-body: 16px;
  --font-size-heading: 24px;
  --shadow-card: 0px 4px 12px 0px rgba(0,0,0,0.1);
}
```

---

## 3. 组件库工程化

### 3.1 Monorepo 结构

```
design-system/
├── packages/
│   ├── tokens/          # 设计令牌（JSON → CSS/TS/Swift/Android）
│   ├── core/            # 无样式基础组件（Headless UI）
│   ├── react/           # React 实现
│   ├── vue/             # Vue 实现
│   ├── themes/          # 主题预设
│   └── docs/            # Storybook 文档站
├── apps/
│   └── storybook/       # 交互式文档
└── scripts/
    └── release.mjs      # 自动化发布（Changesets）
```

### 3.2 多格式构建输出

```typescript
// vite.config.ts — 组件库构建配置
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: './src/index.ts',
      name: 'MyDesignSystem',
      formats: ['es', 'cjs', 'umd'],
      fileName: format => `index.${format}.js`,
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
  },
  plugins: [react(), dts({ insertTypesEntry: true })],
});
```

### 3.3 Tree Shaking 与副作用标记

```typescript
// src/components/Button/index.ts
export { Button } from './Button';
export type { ButtonProps } from './Button.types';

// package.json — 确保 bundler 能正确 tree-shake
{
  "sideEffects": ["*.css", "*.scss"],
  "exports": {
    ".": {
      "import": "./dist/index.es.js",
      "require": "./dist/index.cjs.js",
      "types": "./dist/index.d.ts"
    },
    "./Button": {
      "import": "./dist/Button.es.js",
      "types": "./dist/Button.d.ts"
    }
  }
}
```

### 3.4 CSS-in-JS 与主题注入

```typescript
// styled-components 主题示例
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';

const theme = {
  colors: {
    primary: '#007bff',
    danger: '#dc3545',
    text: '#212529',
  },
  spacing: (n: number) => `${n * 8}px`,
  breakpoints: {
    sm: '576px',
    md: '768px',
    lg: '992px',
  },
};

const GlobalStyle = createGlobalStyle`
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: ${props => props.theme.colors.text};
  }
`;

const Button = styled.button<{ $variant?: 'primary' | 'danger' }>`
  padding: ${props => props.theme.spacing(1)} ${props => props.theme.spacing(2)};
  border: none;
  border-radius: 4px;
  background: ${props => props.theme.colors[props.$variant || 'primary']};
  color: white;
  cursor: pointer;

  &:hover {
    filter: brightness(1.1);
  }

  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    width: 100%;
  }
`;

// 使用
function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Button $variant="primary">提交</Button>
      <Button $variant="danger">删除</Button>
    </ThemeProvider>
  );
}
```

---

## 4. 可访问性（A11y）与设计系统

```typescript
// Headless UI + Radix Primitives 模式：行为与样式分离
import * as Dialog from '@radix-ui/react-dialog';

const Modal = ({ open, onOpenChange, children }: Dialog.DialogProps) => (
  <Dialog.Root open={open} onOpenChange={onOpenChange}>
    <Dialog.Portal>
      <Dialog.Overlay className="modal-overlay" />
      <Dialog.Content className="modal-content" aria-describedby="modal-desc">
        {children}
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
);

// 自动管理 focus trap、ESC 关闭、ARIA 属性
```

---

## 5. CSS 自定义属性与动态主题

### 5.1 运行时主题切换

```typescript
// theme-switcher.ts
type Theme = 'light' | 'dark' | 'system';

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  } else {
    root.setAttribute('data-theme', theme);
  }
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  if (document.documentElement.getAttribute('data-theme') === 'system') applyTheme('system');
});
```

```css
:root[data-theme="light"] {
  --color-surface: #ffffff;
  --color-text: #1a1a1a;
  --color-primary: #007bff;
}
:root[data-theme="dark"] {
  --color-surface: #0a0a0a;
  --color-text: #f0f0f0;
  --color-primary: #4dabf7;
}
body { background: var(--color-surface); color: var(--color-text); }
```

### 5.2 CTI 命名约定（Category / Type / Item）

W3C Design Tokens 社区推荐按 `category-type-item` 层级命名：

```json
{
  "color": {
    "bg": { "primary": { "$value": "#ffffff" }, "secondary": { "$value": "#f5f5f5" } },
    "text": { "primary": { "$value": "#1a1a1a" }, "muted": { "$value": "#666666" } }
  },
  "spacing": { "xs": { "$value": "4px" }, "sm": { "$value": "8px" }, "md": { "$value": "16px" } }
}
```

### 5.3 语义令牌（Semantic Tokens）

将原始令牌映射到语义用途，实现跨主题一致性：

```typescript
const semanticTokens = {
  'button-bg-primary': { $value: '{color.primary}' },
  'button-bg-primary-hover': { $value: '{color.primary}', $modify: [{ type: 'darken', amount: 0.1 }] },
  'surface-page': { $value: '{color.bg.primary}' },
  'text-heading': { $value: '{color.text.primary}' },
} as const;
```

## 5. 与相邻模块的关系

- **51-ui-components**: UI 组件的设计与实现
- **56-code-generation**: 基于令牌的代码生成
- **13-code-organization**: 大型项目的代码组织

---

## 6. 参考资源

### 权威规范

- [W3C Design Tokens Community Group](https://www.w3.org/community/designtokens/) — 设计令牌标准制定
- [W3C Design Tokens Format Module](https://design-tokens.github.io/community-group/format/)
- [WCAG 2.2 — Web Content Accessibility Guidelines](https://www.w3.org/WAI/WCAG22/quickref/) — 可访问性规范
- [ARIA Authoring Practices Guide (APG)](https://www.w3.org/WAI/ARIA/apg/) — W3C 无障碍组件模式
- [CSS Custom Properties — MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)
- [prefers-color-scheme — MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme)
- [Dark Mode Best Practices — web.dev](https://web.dev/articles/prefers-color-scheme)

### 开源工具与设计系统

- [Style Dictionary — Amazon](https://amzn.github.io/style-dictionary/) — 跨平台设计令牌转换
- [CTI Token Naming Convention](https://amzn.github.io/style-dictionary/#/tokens/pipelines/cti)
- [Storybook](https://storybook.js.org/) — 组件驱动开发与文档
- [Radix UI](https://www.radix-ui.com/) — 无样式、可访问的基础组件原语
- [Headless UI](https://headlessui.com/) — Tailwind Labs 的无样式组件
- [Shadcn UI](https://ui.shadcn.com/) — 基于 Radix + Tailwind 的可复制组件
- [Material Design 3](https://m3.material.io/) — Google 设计系统规范
- [Polaris — Shopify](https://polaris.shopify.com/) — 电商设计系统范例
- [Lightning Design System — Salesforce](https://www.lightningdesignsystem.com/) — 企业级设计系统

### 工程化实践

- [Component-Driven Development](https://www.componentdriven.org/) — 组件驱动开发方法论
- [Chromatic](https://www.chromatic.com/) — 视觉回归测试与 UI 评审
- [Changesets](https://github.com/changesets/changesets) — Monorepo 版本管理与发布
- [Inclusive Design Principles](https://inclusivedesignprinciples.org/)
- [Open UI — Component Research](https://open-ui.org/)

---

*最后更新: 2026-04-29*
