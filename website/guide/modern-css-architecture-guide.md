---
title: 现代 CSS 架构指南
description: Tailwind CSS 4、CSS 变量系统、容器查询、层叠层与原子化 CSS 的完全指南
---

# 现代 CSS 架构指南

> 最后更新: 2026-05-01

---

## 1. CSS 架构演进

```
2010: 语义化 CSS (OOCSS)
2015: BEM + Sass / 命名空间方法
2018: CSS-in-JS 爆发 (Styled Components, Emotion)
2020: Utility-First (Tailwind CSS) + CSS 变量普及
2022: 原生层叠层 @layer 进入主流浏览器 (来源: MDN, caniuse.com)
2023: CSS 容器查询全面支持 (来源: caniuse.com, 全球使用率 > 93%)
2024: Tailwind CSS 4 发布，转向 CSS-first 配置 (来源: tailwindcss.com/blog)
2025: 零运行时 CSS-in-JS (Linaria, Panda CSS) 与设计令牌系统标准化
```

从手写语义化类名到原子化工具类，从预处理器到原生 CSS 的强大特性，现代 CSS 架构的核心矛盾始终是：**可维护性、可扩展性与运行时性能之间的平衡**。

---

## 2. CSS 架构方法论

### 2.1 BEM (Block Element Modifier)

BEM 由 Yandex 团队提出，是最广泛采用的 CSS 命名约定之一。

```html
<!-- BEM 命名示例 -->
<div class="card card--featured">
  <img class="card__image" src="..." alt="..." />
  <div class="card__content">
    <h2 class="card__title">标题</h2>
    <p class="card__text">描述文本</p>
    <button class="card__button card__button--primary">操作</button>
  </div>
</div>
```

```css
/* BEM 对应的 CSS */
.card { border: 1px solid #e5e7eb; border-radius: 0.5rem; }
.card--featured { border-color: #3b82f6; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
.card__image { width: 100%; height: auto; object-fit: cover; }
.card__content { padding: 1rem; }
.card__title { font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem; }
.card__button { padding: 0.5rem 1rem; border-radius: 0.25rem; }
.card__button--primary { background: #3b82f6; color: white; }
```

**优势**：命名空间避免冲突、结构清晰、适合大型团队。
**局限**：类名冗长、深层嵌套时命名困难、与组件化框架结合时冗余。

### 2.2 SMACSS (Scalable and Modular Architecture for CSS)

由 Jonathan Snook 提出，将样式分为五类 (来源: smacss.com)。

```css
/* 1. Base - 元素默认样式 */
html { box-sizing: border-box; }
*, *::before, *::after { box-sizing: inherit; }
body { font-family: system-ui, sans-serif; line-height: 1.5; }

/* 2. Layout - 页面结构 (.l- 前缀) */
.l-container { max-width: 1200px; margin-inline: auto; padding-inline: 1rem; }
.l-grid { display: grid; gap: 1rem; }

/* 3. Module - 可复用组件 */
.btn { display: inline-flex; align-items: center; gap: 0.5rem; }
.media { display: flex; gap: 1rem; }

/* 4. State - 状态类 (.is- 前缀) */
.is-hidden { display: none !important; }
.is-active { background-color: var(--color-primary-500); }

/* 5. Theme - 主题覆盖 */
.theme-dark { --bg-page: #0f172a; --text-page: #f8fafc; }
```

### 2.3 ITCSS (Inverted Triangle CSS)

由 Harry Roberts 提出，按特异性倒三角组织样式 (来源: itcss.io / csswizardry.com)。

```css
/* Settings - 变量与配置 */
@import "settings.colors";
@import "settings.typography";

/* Tools - Sass 混合与函数 */
@import "tools.mixins";

/* Generic - 重置与归一化 */
@import "generic.reset";

/* Elements - 裸元素样式 */
@import "elements.headings";
@import "elements.links";

/* Objects - OOCSS 布局模式 */
@import "objects.layout";
@import "objects.media";

/* Components - 显式 UI 组件 */
@import "components.buttons";
@import "components.cards";

/* Trumps/Utilities - 辅助与覆盖 */
@import "trumps.spacing";
@import "trumps.utilities";
```

ITCSS 的关键在于**特异性由低到高、范围由广到窄**，避免特异性战争。

### 2.4 CUBE CSS

由 Andy Bell 提出，强调组合而非单一职责 (来源: cube.fyi)。

```css
/* C: Composition - 布局组合 */
.cluster { display: flex; flex-wrap: wrap; gap: var(--space, 1rem); }
.sidebar { display: flex; flex-wrap: wrap; gap: var(--space, 1rem); }
.sidebar > :first-child { flex-basis: 20rem; flex-grow: 1; }
.sidebar > :last-child { flex-basis: 0; flex-grow: 999; min-width: 50%; }

/* U: Utility - 工具类 */
.visually-hidden {
  position: absolute;
  width: 1px; height: 1px;
  padding: 0; margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* B: Block - 语义化块级组件 */
.card {
  /* 仅包含卡片特有的、无法被组合和工具类替代的样式 */
  border: 1px solid var(--color-border);
}

/* E: Exception - 状态与变体 */
.card[data-variant="featured"] {
  border-color: var(--color-primary);
}
```

### 2.5 层叠层 (Cascade Layers)

CSS `@layer` 规则允许开发者显式控制层叠优先级，无需依赖特异性或顺序 (来源: CSS Cascading and Inheritance Level 5, W3C)。

```css
/* 声明层顺序：后面的层优先级更高 */
@layer reset, base, components, utilities;

@layer reset {
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
  ul, ol { list-style: none; }
  img, picture, video, canvas, svg { display: block; max-width: 100%; }
}

@layer base {
  :root {
    --color-text: #1f2937;
    --color-bg: #ffffff;
    --font-body: system-ui, -apple-system, sans-serif;
  }
  body { font-family: var(--font-body); color: var(--color-text); background: var(--color-bg); }
  a { color: var(--color-primary-600); text-decoration: underline; }
}

@layer components {
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    font-weight: 500;
    transition: background-color 150ms ease;
  }
  .btn:hover { background-color: var(--color-primary-700); }
}

@layer utilities {
  .hidden { display: none !important; }
  .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; }
}
```

**关键特性**：即使 `utilities` 层中的规则特异性较低，它依然能覆盖 `components` 层中的规则，因为层顺序已经定义。

---

## 3. Tailwind CSS 4 深度

Tailwind CSS 4 是一次根本性重构，完全移除了基于 JavaScript 的配置文件，转向纯 CSS 配置 (来源: tailwindcss.com/docs/v4-beta)。

### 3.1 CSS-first Config

```css
/* tailwind.css - Tailwind 4 入口文件 */
@import "tailwindcss";

/* 自定义主题变量 */
@theme {
  --color-*: initial; /* 重置默认颜色 */

  --color-brand-50: #eff6ff;
  --color-brand-100: #dbeafe;
  --color-brand-500: #3b82f6;
  --color-brand-900: #1e3a8a;

  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "Fira Code", ui-monospace, monospace;

  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 2rem;

  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 1rem;

  --shadow-card: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
}

/* 自定义变体 */
@variant hocus (&:hover, &:focus-visible);

/* 使用 */
.btn-brand {
  @apply bg-brand-500 text-white px-md py-sm rounded-md shadow-card;
  @apply hocus:bg-brand-900;
}
```

### 3.2 @theme 指令详解

```css
@theme {
  /* 颜色 */
  --color-primary: oklch(0.65 0.2 250);
  --color-secondary: oklch(0.7 0.15 150);

  /* 响应式断点 */
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;

  /* 动画 */
  --animate-fade-in: fade-in 0.3s ease-out;
  --animate-slide-up: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1);

  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slide-up {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
}
```

### 3.3 容器查询支持

Tailwind 4 内置了容器查询工具类 (来源: tailwindcss.com/docs/container-queries)。

```html
<!-- 使用 @container 工具类 -->
<div class="@container/card">
  <div class="grid grid-cols-1 @md/card:grid-cols-2 @lg/card:grid-cols-3 gap-4">
    <div class="p-4 bg-white rounded-lg">Item 1</div>
    <div class="p-4 bg-white rounded-lg">Item 2</div>
    <div class="p-4 bg-white rounded-lg">Item 3</div>
  </div>
</div>
```

```css
/* 等效 CSS */
@container/card (min-width: 28rem) {
  .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@container/card (min-width: 32rem) {
  .grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
```

### 3.4 v4 性能提升

根据 Tailwind 官方基准测试 (来源: tailwindcss.com/blog/tailwindcss-v4)：

| 指标 | v3 | v4 | 提升 |
|------|-----|-----|------|
| 冷启动 (Cold Start) | ~800ms | ~100ms | **8x** |
| HMR 更新 | ~100ms | **< 50ms** | **2x** |
| 生产构建 | 依赖 PostCSS | Lightning CSS | 更快压缩 |
| 包体积 (零运行) | 需 PurgeCSS | 原生按需生成 | 无冗余 |

核心改进：

- 使用 Rust 编写的 Lightning CSS 替代 PostCSS 进行编译
- 移除 `tailwind.config.js`，解析与编译完全在 CSS 引擎中完成
- 不再需要 `content` 配置，通过扫描模块图自动发现类名

---

## 4. 设计令牌系统

设计令牌（Design Tokens）是设计系统中的单一事实来源，将颜色、间距、字体等抽象为平台无关的变量 (来源: W3C Design Tokens Community Group)。

### 4.1 CSS 自定义属性作为运行时令牌

```css
:root {
  /* 基础令牌 (Primitive Tokens) */
  --color-white: #ffffff;
  --color-black: #000000;
  --color-blue-50: #eff6ff;
  --color-blue-500: #3b82f6;
  --color-blue-900: #1e3a8a;

  --space-0: 0;
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-4: 1rem;
  --space-8: 2rem;
  --space-16: 4rem;

  --font-sans: "Inter", system-ui, -apple-system, sans-serif;
  --font-mono: "Fira Code", ui-monospace, monospace;

  /* 语义令牌 (Semantic Tokens) */
  --color-bg-default: var(--color-white);
  --color-bg-inverse: var(--color-black);
  --color-text-default: var(--color-black);
  --color-text-inverse: var(--color-white);
  --color-border-default: #e5e7eb;
  --color-border-focus: var(--color-blue-500);

  --space-inset-default: var(--space-4);
  --space-inset-sm: var(--space-2);
  --space-stack-default: var(--space-4);

  --radius-default: 0.5rem;
  --radius-pill: 9999px;

  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

/* 暗色模式覆盖 */
[data-theme="dark"] {
  --color-bg-default: #0f172a;
  --color-text-default: #f8fafc;
  --color-border-default: #1e293b;
}
```

### 4.2 Style Dictionary

Style Dictionary 是 Amazon 开源的多平台设计令牌转换工具 (来源: amzn.github.io/style-dictionary)。

```json
// tokens/color/base.json
{
  "color": {
    "base": {
      "blue": {
        "50": { "value": "#eff6ff" },
        "500": { "value": "#3b82f6" },
        "900": { "value": "#1e3a8a" }
      }
    }
  }
}

// tokens/color/semantic.json
{
  "color": {
    "semantic": {
      "primary": { "value": "{color.base.blue.500}" },
      "bg": { "value": "{color.base.white}" }
    }
  }
}
```

```js
// sd.config.mjs
import StyleDictionary from 'style-dictionary';

const sd = new StyleDictionary({
  source: ['tokens/**/*.json'],
  platforms: {
    css: {
      transformGroup: 'css',
      buildPath: 'build/css/',
      files: [{
        destination: 'variables.css',
        format: 'css/variables',
        options: { outputReferences: true }
      }]
    },
    js: {
      transformGroup: 'js',
      buildPath: 'build/js/',
      files: [{
        destination: 'tokens.js',
        format: 'javascript/es6'
      }]
    }
  }
});

await sd.buildAllPlatforms();
```

```css
/* build/css/variables.css - 自动生成 */
:root {
  --color-base-blue-50: #eff6ff;
  --color-base-blue-500: #3b82f6;
  --color-semantic-primary: #3b82f6;
}
```

### 4.3 Tokens Studio for Figma

Tokens Studio 是 Figma 插件，支持双向同步设计令牌 (来源: tokens.studio)。

```json
// tokens.json (Tokens Studio 导出格式)
{
  "global": {
    "colors": {
      "Primary": {
        "value": "#3b82f6",
        "type": "color"
      },
      "Background": {
        "value": "{colors.White}",
        "type": "color"
      }
    },
    "spacing": {
      "sm": { "value": "4", "type": "spacing" },
      "md": { "value": "16", "type": "spacing" }
    }
  },
  "$themes": [],
  "$metadata": {
    "tokenSetOrder": ["global"]
  }
}
```

**工作流程**：

1. 设计师在 Figma 中通过 Tokens Studio 定义令牌
2. 导出 JSON 同步至 Git 仓库
3. CI 流水线通过 Style Dictionary 转换为 CSS/JS/iOS/Android 变量
4. 开发端自动消费，实现设计到代码的单一事实来源

---

## 5. 组件驱动样式

现代前端框架推动了组件级样式隔离的需求。CSS Modules、Scoped CSS 和 Shadow DOM 代表了三种不同的隔离策略。

### 5.1 CSS Modules

CSS Modules 通过构建时哈希将类名局部化 (来源: github.com/css-modules/css-modules)。

```css
/* Button.module.css */
.button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  transition: all 150ms ease;
}

.primary {
  composes: button;
  background: var(--color-primary-500);
  color: white;
}

.primary:hover {
  background: var(--color-primary-600);
}
```

```jsx
// Button.jsx
import styles from './Button.module.css';

export function Button({ variant = 'primary', children }) {
  return <button className={styles[variant]}>{children}</button>;
}
// 编译后: <button class="Button_primary__3x7a9">...</button>
```

**特性**：

- `composes` 实现类组合而不增加特异性
- `:global(.foo)` 可显式声明全局类
- 与 Tree Shaking 友好配合

### 5.2 Vue Scoped CSS / Svelte Scoped CSS

```vue
<!-- Vue 单文件组件 -->
<template>
  <button class="btn">
    <span class="icon"><slot name="icon" /></span>
    <span class="text"><slot /></span>
  </button>
</template>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
}
/* 编译后自动添加属性选择器: .btn[data-v-7ba5bd90] */
</style>
```

```svelte
<!-- Svelte 组件 -->
<button class="btn">
  <slot />
</button>

<style>
  .btn {
    /* Svelte 编译后自动添加类哈希: .btn.svelte-xyz123 */
    padding: 0.5rem 1rem;
  }
</style>
```

### 5.3 Shadow DOM 样式封装

Web Components 使用 Shadow DOM 实现真正的 DOM 与样式隔离 (来源: MDN Web Docs, Shadow DOM)。

```js
// custom-button.js
class CustomButton extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <style>
        :host {
          display: inline-flex;
          --btn-bg: var(--color-primary-500, #3b82f6);
          --btn-color: white;
        }
        :host([variant="secondary"]) {
          --btn-bg: transparent;
          --btn-color: var(--color-primary-500, #3b82f6);
        }
        button {
          background: var(--btn-bg);
          color: var(--btn-color);
          padding: 0.5rem 1rem;
          border: 1px solid var(--btn-bg);
          border-radius: 0.375rem;
          font: inherit;
          cursor: pointer;
        }
        button:focus-visible {
          outline: 2px solid var(--color-focus-ring, #60a5fa);
          outline-offset: 2px;
        }
        /* 样式外部插槽内容 */
        ::slotted(img) {
          width: 1rem;
          height: 1rem;
        }
      </style>
      <button part="base">
        <slot name="icon"></slot>
        <slot></slot>
      </button>
    `;
  }
}
customElements.define('custom-button', CustomButton);
```

```html
<!-- 外部可通过 CSS ::part 伪元素渗透样式 -->
<style>
  custom-button::part(base) {
    font-size: 1.125rem;
  }
</style>
<custom-button variant="secondary">点击我</custom-button>
```

**隔离策略对比**：

| 方案 | 隔离级别 | 运行时成本 | 全局主题穿透 | 适用场景 |
|------|----------|------------|--------------|----------|
| CSS Modules | 类名哈希 | 无 | 通过 `:global` | React/Vite 项目 |
| Scoped CSS | 属性/类哈希 | 无 | 需 `:global` | Vue/Svelte |
| Shadow DOM | 完全 DOM 隔离 | 轻微 | 通过 CSS 变量 / `::part` | 跨框架组件库 |

---

## 6. CSS-in-JS 现状

CSS-in-JS 在 2018-2021 年间经历了爆发式增长，但近年来生态发生了显著变化。

### 6.1 Styled Components 维护模式

Styled Components 进入维护模式，核心团队建议新项目谨慎采用 (来源: styled-components.com/releases)。

```jsx
// Styled Components 典型用法
import styled from 'styled-components';

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: ${props => props.theme.space.md};
  background: ${props => props.variant === 'primary'
    ? props.theme.colors.primary
    : 'transparent'};
  border-radius: 0.375rem;

  &:hover {
    background: ${props => props.theme.colors.primaryDark};
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

// 使用
<Button variant="primary" theme={theme}>提交</Button>
```

**现状**：

- v6 之后更新频率显著下降
- 服务端渲染 (SSR) 与水合 (hydration) 的样式不一致问题持续存在
- React 19 的 Server Components 对运行时 CSS-in-JS 不友好
- 社区建议：存量项目可继续使用，新项目考虑替代方案

### 6.2 Emotion 生态

Emotion 虽然仍在维护，但同样面临 Server Components 的兼容性挑战 (来源: emotion.sh/docs/introduction)。

```jsx
/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

const buttonStyle = css`
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  background: var(--color-primary-500);
  color: white;
  border-radius: 0.375rem;

  &:hover {
    background: var(--color-primary-600);
  }
`;

function Button({ children }) {
  return <button css={buttonStyle}>{children}</button>;
}
```

Emotion 11 开始支持 `@emotion/css` 的零运行时提取实验性功能，但成熟度不及专用方案。

### 6.3 Linaria 零运行时

Linaria 在构建时提取 CSS，运行时无样式计算开销 (来源: linaria.dev)。

```jsx
import { styled } from '@linaria/react';

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: ${props => props.theme.primary}; /* 构建时求值 */
  border-radius: 0.375rem;
`;
```

```js
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import linaria from '@wyw-in-js/vite';

export default defineConfig({
  plugins: [
    linaria({
      include: ['**/*.{ts,tsx}'],
      babelOptions: {
        presets: ['@babel/preset-typescript', '@babel/preset-react'],
      },
    }),
    react(),
  ],
});
```

**零运行时方案对比** (来源: 各项目官方文档及社区基准测试)：

| 方案 | 运行时 | 动态样式 | 主题方案 | 生态成熟度 |
|------|--------|----------|----------|------------|
| Styled Components | 有 | 完全支持 | ThemeProvider | 高（维护中） |
| Emotion | 有 | 完全支持 | ThemeProvider | 高 |
| Linaria | **无** | 构建时求值 | CSS 变量 | 中 |
| Panda CSS | **无** | 原子化生成 | Recipes / Slots | 中 |
| Vanilla Extract | **无** | TypeScript 驱动 | Themes API | 中 |

```ts
// Vanilla Extract 示例 - 完全类型安全的 CSS
import { style, createTheme, styleVariants } from '@vanilla-extract/css';

export const [themeClass, vars] = createTheme({
  color: {
    brand: 'blue',
    background: 'white',
  },
  space: {
    small: '4px',
    medium: '8px',
  },
});

export const button = style({
  padding: vars.space.medium,
  backgroundColor: vars.color.brand,
  color: vars.color.background,
});

export const variant = styleVariants({
  primary: { backgroundColor: 'blue' },
  secondary: { backgroundColor: 'gray' },
});
```

---

## 7. 响应式架构

现代响应式设计已从"视口媒体查询"演进为"组件级响应式"，配合逻辑属性实现国际化适配。

### 7.1 容器查询 (Container Queries)

容器查询允许组件根据**自身容器尺寸**而非视口尺寸进行响应 (来源: CSS Containment Module Level 3, W3C)。

```css
/* 定义容器 */
.product-card-wrapper {
  container-type: inline-size;
  container-name: card;
}

/* 基于容器尺寸的响应式布局 */
@container card (min-width: 300px) {
  .product-card {
    display: grid;
    grid-template-columns: 120px 1fr;
    gap: 1rem;
  }
  .product-card__image { aspect-ratio: 1; }
}

@container card (min-width: 500px) {
  .product-card {
    grid-template-columns: 200px 1fr;
  }
  .product-card__actions {
    display: flex;
    gap: 0.5rem;
  }
}

/* 容器查询单位: cqi (inline size %), cqb (block size %) */
@container card (min-width: 400px) {
  .product-card__title {
    font-size: clamp(1rem, 3cqi + 0.5rem, 1.5rem);
  }
}
```

```html
<!-- 同一组件在不同容器中自适应 -->
<div class="product-card-wrapper" style="width: 250px;">
  <article class="product-card">...</article>
</div>

<div class="product-card-wrapper" style="width: 600px;">
  <article class="product-card">...</article>
</div>
```

### 7.2 CSS 逻辑属性

逻辑属性根据文档的书写模式（writing-mode）自动映射物理方向 (来源: CSS Logical Properties and Values Level 1, W3C)。

```css
/* 物理属性 (传统) */
.traditional {
  margin-left: 1rem;
  margin-right: 1rem;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  border-left: 2px solid blue;
  text-align: left;
}

/* 逻辑属性 (现代推荐) */
.modern {
  /* inline = 文本流向轴 (LTR中为左右, RTL中为右左) */
  margin-inline: 1rem;
  padding-block: 0.5rem;
  border-inline-start: 2px solid blue;
  text-align: start;

  /* 等效于 border-radius 的逻辑版本 */
  border-start-start-radius: 0.5rem;
  border-end-end-radius: 0.5rem;
}

/* 尺寸逻辑属性 */
.logical-sizing {
  inline-size: 100%;   /* 代替 width */
  block-size: auto;    /* 代替 height */
  min-inline-size: 200px;
  max-block-size: 100dvb; /* dynamic viewport block size */
}
```

**逻辑属性映射表**：

| 物理属性 | 逻辑属性 (Start) | 逻辑属性 (End) |
|----------|------------------|----------------|
| `margin-left` | `margin-inline-start` | `margin-inline-end` |
| `padding-top` | `padding-block-start` | `padding-block-end` |
| `border-left-width` | `border-inline-start-width` | `border-inline-end-width` |
| `width` | `inline-size` | - |
| `height` | `block-size` | - |
| `text-align: left` | `text-align: start` | `text-align: end` |

### 7.3 clamp()、min()、max() 与比较函数

CSS 比较函数支持基于视口或容器的流体排版与布局 (来源: CSS Values and Units Module Level 4, W3C)。

```css
/* 流体排版: 在 320px 视口为 1rem, 在 1280px 视口为 2rem */
.fluid-heading {
  font-size: clamp(1rem, 0.5rem + 2.5vw, 2rem);
}

/* 等效计算 */
/* clamp(min, preferred, max) */
/* preferred = 0.5rem + (100vw / 1280) * 2rem ~ 0.5rem + 2.5vw */

/* 响应式间距 */
.responsive-section {
  padding-inline: clamp(1rem, 5vw, 3rem);
}

/* min() 与 max() 在布局中的应用 */
.constrained-layout {
  /* 宽度为 65ch 或 100% - 2rem 中的较小值 */
  inline-size: min(65ch, 100% - 2rem);
  margin-inline: auto;
}

.card-grid {
  /* 每列至少 250px, 最大 1fr */
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 250px), 1fr));
  gap: clamp(0.5rem, 2vw, 1.5rem);
}
```

```css
/* 现代响应式布局组合模式 */
.modern-layout {
  /* 流体容器 */
  inline-size: min(100% - 2rem, 1200px);
  margin-inline: auto;

  /* 流体间距 */
  padding-block: clamp(2rem, 5vh, 4rem);

  /* 流体字体 */
  font-size: clamp(0.875rem, 0.8rem + 0.25vw, 1rem);

  /* 流体行高 */
  line-height: clamp(1.4, 1.5 + 0.1vw, 1.7);
}
```

---

## 8. 性能优化

CSS 性能优化涵盖渲染路径、动画效率与资源加载策略。

### 8.1 关键 CSS (Critical CSS)

关键路径 CSS 是渲染首屏内容所必需的最小样式集合 (来源: web.dev/extract-critical-css)。

```html
<!-- 内联关键 CSS -->
<head>
  <style>
    /* 仅包含首屏所需样式 */
    :root { --color-primary: #3b82f6; }
    body { margin: 0; font-family: system-ui; }
    .hero { min-height: 100dvh; display: grid; place-items: center; }
    /* ... 其他首屏样式 */
  </style>
  <!-- 异步加载非关键 CSS -->
  <link rel="preload" href="/styles/main.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="/styles/main.css"></noscript>
</head>
```

```js
// Vite 关键 CSS 提取 (使用 critters 插件)
// vite.config.js
import { defineConfig } from 'vite';
import critters from 'critters-rs/vite';

export default defineConfig({
  plugins: [
    critters({
      preload: 'swap',      // 使用 font-display: swap
      inlineFonts: true,    // 内联关键字体
      pruneSource: true,    // 从 CSS 文件中移除已内联的样式
    }),
  ],
});
```

### 8.2 CSS 代码分割

```js
// 基于路由的动态 CSS 导入 (Vite / Webpack)
// router.js
const routes = [
  {
    path: '/dashboard',
    component: () => import('./pages/Dashboard.vue'),
    // Vue/Vite 自动将 <style> 块拆分为独立 CSS chunk
  },
  {
    path: '/analytics',
    component: () => import('./pages/Analytics.vue'),
  },
];
```

```css
/* 使用 @import 配合层叠层实现条件加载 */
@layer components {
  @import url("/css/components/button.css");
  @import url("/css/components/modal.css") layer(components.modal);
}
```

### 8.3 will-change 与 contain

```css
/* will-change: 提前告知浏览器哪些属性将变化，优化合成层 */
.animated-card {
  will-change: transform, opacity;
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.animated-card:hover {
  transform: translateY(-4px);
  opacity: 0.9;
}

/* 动画结束后移除 will-change 以避免内存开销 */
.animated-card.is-settled {
  will-change: auto;
}
```

```css
/* contain: 限制元素子树的影响范围，减少重排/重绘区域 */
.contained-widget {
  /* layout: 子元素的布局不影响外部 */
  /* paint: 子元素的绘制被裁剪到元素边界 */
  /* style: 计数器/引号不影响外部 */
  contain: layout paint style;
}

/* 严格隔离：子树完全独立于外部 */
.strict-island {
  contain: strict; /* 等价于 layout style paint size */
}

/* content-visibility: 延迟渲染屏幕外内容 */
.offscreen-section {
  content-visibility: auto;
  contain-intrinsic-size: auto 300px; /* 预估尺寸防止布局偏移 */
}
```

**contain 属性值对比** (来源: MDN Web Docs, CSS Containment Module Level 2)：

| 值 | 效果 | 适用场景 |
|----|------|----------|
| `layout` | 内部布局不影响外部 | 动态内容卡片 |
| `paint` | 内部绘制被裁剪 | 滚动区域、模态框 |
| `size` | 尺寸不依赖子元素 | 固定尺寸组件 |
| `style` | 计数器/quotes 隔离 | 使用 CSS 计数器的组件 |
| `strict` | 以上全部 | 独立组件/微前端边界 |
| `content` | layout + paint + style | 通用内容区域 |

---

## 9. 可访问性

CSS 在 Web 可访问性 (a11y) 中扮演关键角色：颜色对比度、焦点管理和运动偏好。

### 9.1 颜色对比度

WCAG 2.2 要求正文文本对比度至少 4.5:1，大文本至少 3:1 (来源: W3C WCAG 2.2)。

```css
/* 使用 OKLCH 等感知均匀色彩空间计算对比度 */
:root {
  /* 通过 OKLCH 的 L (亮度) 通道直接控制对比度 */
  --text-primary: oklch(0.25 0.02 260);   /* 深灰, L=25% */
  --text-secondary: oklch(0.45 0.03 260); /* 中灰, L=45% */
  --bg-default: oklch(0.99 0.005 260);    /* 近白, L=99% */
  --bg-muted: oklch(0.92 0.01 260);       /* 浅灰, L=92% */

  /* 确保任何前景色与背景色的 L 差值 > 60% 以满足 WCAG AAA */
  --color-brand: oklch(0.6 0.2 250);
  --color-on-brand: oklch(0.99 0 0); /* 白色, L 差约 39% -> 满足 AA */
}

.text-primary { color: var(--text-primary); }
.text-secondary { color: var(--text-secondary); }
.bg-default { background: var(--bg-default); }
.bg-muted { background: var(--bg-muted); }

/* 强制颜色模式支持 (Windows 高对比度) */
@media (forced-colors: active) {
  .btn {
    border: 2px solid CanvasText;
    forced-color-adjust: none; /* 允许自定义颜色覆盖 */
  }
}
```

```js
// 使用 APCA (Accessible Perceptual Contrast Algorithm) 计算对比度
// APCA 是 WCAG 3 的候选算法，在感知均匀性上优于 WCAG 2.x 的公式
// npm install apca-w3
import { calcAPCA } from 'apca-w3';

const contrast = calcAPCA('#3b82f6', '#ffffff'); // 返回 LC 值 (Lightness Contrast)
// LC > 75: 推荐用于正文
// LC > 60: 推荐用于大文本/UI元素
```

### 9.2 焦点样式 (Focus Styles)

```css
/* 可聚焦元素的可见焦点环 */
:focus-visible {
  outline: 3px solid var(--color-focus-ring, #60a5fa);
  outline-offset: 2px;
  border-radius: 2px;
}

/* 自定义焦点样式 */
.custom-focus:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px var(--color-focus-ring);
}

/* 焦点陷阱内的管理 */
.modal[aria-modal="true"] {
  /* 确保模态框内的焦点不会逃逸 */
}

/* Skip Link - 键盘导航辅助 */
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--color-text-default);
  color: var(--color-bg-default);
  padding: 0.5rem 1rem;
  z-index: 100;
  transition: top 0.2s;
}
.skip-link:focus {
  top: 0;
}
```

```html
<!-- Skip Link 用法 -->
<a href="#main-content" class="skip-link">跳转到主要内容</a>
<main id="main-content" tabindex="-1">
  <!-- 页面主要内容 -->
</main>
```

### 9.3 减少动画偏好

```css
/* 尊重用户的减少动画偏好设置 */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* 更精细的控制：仅禁用非必要动画 */
@media (prefers-reduced-motion: reduce) {
  .decorative-animation {
    animation: none;
  }
  .essential-transition {
    /* 保留必要的过渡，但缩短时长 */
    transition-duration: 0.1s;
  }
}

/* 偏好动画时的增强 */
@media (prefers-reduced-motion: no-preference) {
  .card {
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
                box-shadow 0.3s ease;
  }
  .card:hover {
    transform: translateY(-4px) scale(1.01);
    box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1);
  }
}
```

**可访问性媒体查询支持** (来源: caniuse.com, 2026)：

| 媒体特性 | 说明 | 全球支持率 |
|----------|------|------------|
| `prefers-reduced-motion` | 减少动画偏好 | > 98% |
| `prefers-color-scheme` | 暗色/亮色主题偏好 | > 98% |
| `prefers-contrast` | 高对比度偏好 | > 95% |
| `forced-colors` | 强制颜色模式 (高对比度主题) | > 96% |
| `prefers-reduced-transparency` | 减少透明度偏好 | > 94% |

---

## 10. 构建集成

现代 CSS 工具链围绕编译、转换和压缩展开。PostCSS 生态与新一代 Rust 工具正在重塑构建流程。

### 10.1 PostCSS 生态

PostCSS 仍是当前最主流的 CSS 处理工具，通过插件实现各类转换 (来源: postcss.org)。

```js
// postcss.config.js
module.exports = {
  plugins: [
    require('postcss-import'),        // @import 内联
    require('postcss-nesting'),       // CSS Nesting 规范支持
    require('tailwindcss'),           // Tailwind 处理
    require('autoprefixer'),          // 前缀自动添加
    require('postcss-preset-env')({   // 未来 CSS 特性 polyfill
      stage: 2,
      features: {
        'custom-media-queries': true,
        'nesting-rules': false, // 已由 postcss-nesting 处理
      },
    }),
    require('cssnano')({             // 生产环境压缩
      preset: ['default', {
        discardComments: { removeAll: true },
        normalizeWhitespace: true,
      }],
    }),
  ],
};
```

```css
/* 输入 */
@custom-media --viewport-md (width >= 768px);

.component {
  padding: 1rem;

  @media (--viewport-md) {
    padding: 2rem;
  }

  & &__title {
    font-size: 1.25rem;
  }
}
```

```css
/* 输出 (PostCSS 处理后) */
.component { padding: 1rem; }
@media (min-width: 768px) {
  .component { padding: 2rem; }
}
.component__title { font-size: 1.25rem; }
```

### 10.2 Lightning CSS

Lightning CSS 是用 Rust 编写的 CSS 解析器、转换器和压缩器，速度极快 (来源: lightningcss.dev)。

```js
// Vite 5+ 内置 Lightning CSS 支持
// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  css: {
    transformer: 'lightningcss', // 替代默认的 PostCSS 处理
    lightningcss: {
      targets: {
        chrome: 100,
        firefox: 100,
        safari: 15,
      },
      drafts: {
        customMedia: true,        // @custom-media
        nesting: true,            // CSS Nesting
      },
    },
  },
  build: {
    cssMinify: 'lightningcss',   // 使用 Lightning CSS 压缩
  },
});
```

```js
// 独立使用 Lightning CSS
import { transform, bundle } from 'lightningcss';

const { code, map } = transform({
  filename: 'style.css',
  code: Buffer.from(`
    .foo {
      color: oklch(0.6 0.2 250);
      padding: clamp(1rem, 2vw, 2rem);
    }
  `),
  minify: true,
  targets: {
    chrome: 100 << 16,
  },
});

// 输出: .foo{color:oklch(60% .2 250);padding:clamp(1rem,2vw,2rem)}
```

**性能对比** (来源: lightningcss.dev 官方基准，处理 10,000 行 CSS)：

| 工具 | 时间 | 备注 |
|------|------|------|
| esbuild | ~45ms | 快速但 CSS 特性支持有限 |
| Lightning CSS | **~20ms** | 完整 CSS 解析与 AST 操作 |
| cssnano + postcss | ~300ms | 传统方案，生态最丰富 |

### 10.3 @parcel/css (已并入 Lightning CSS)

> **注意**：Parcel 团队已将其 CSS 处理器贡献给 Lightning CSS，原 `@parcel/css` 不再独立维护 (来源: parceljs.org/blog/parcel-css)。

```js
// 迁移前 (Parcel CSS)
import { transform } from '@parcel/css';

// 迁移后 (Lightning CSS)
import { transform } from 'lightningcss';
// API 几乎完全一致
```

---

## 11. 案例研究：大型设计系统的 CSS 架构

### 11.1 Atlassian Design System (ADS)

Atlassian 的设计系统经历了从 Less + 工具类到 CSS-in-JS 再到原生 CSS 变量的演进 (来源: atlassian.design, 官方技术博客)。

**架构特点**：

- **分层令牌架构**：Primitive -> Semantic -> Component 三级令牌体系
- **CSS 自定义属性为主**：通过 Style Dictionary 生成多平台令牌
- **组件库 (Atlaskit)**：早期采用 Styled Components，后逐步迁移至 Emotion，并在 React 18 后评估零运行时方案

```css
/* Atlassian 令牌命名风格 */
:root {
  /* 基础令牌 */
  --ds-elevation-surface-raised: #ffffff;
  --ds-elevation-shadow-overflow: 0px 0px 8px #091e4229;

  /* 语义令牌 */
  --ds-background-input: #f4f5f7;
  --ds-background-input-hovered: #ebecf0;
  --ds-background-input-pressed: #dfe1e6;

  /* 组件令牌 (仅在组件层使用) */
  --ds-button-background-default: var(--ds-background-input);
}
```

### 11.2 IBM Carbon Design System

Carbon 采用 Sass + CSS 自定义属性的混合架构，强调可主题化与无障碍性 (来源: carbondesignsystem.com)。

```scss
// Carbon 主题系统 (简化)
// _theme-tokens.scss
$tokens: (
  colors: (
    background: #ffffff,
    background-hover: #e5e5e5,
    text-primary: #161616,
    text-secondary: #525252,
    focus: #0f62fe,
  ),
  spacing: (
    scale-1: 0.125rem,
    scale-2: 0.25rem,
    scale-4: 0.5rem,
    scale-8: 1rem,
    scale-16: 2rem,
  ),
);

// 生成 CSS 自定义属性
:root {
  @each $category, $values in $tokens {
    @each $name, $value in $values {
      --cds-#{$category}-#{$name}: #{$value};
    }
  }
}

// 组件使用
.cds--btn {
  background: var(--cds-colors-background);
  color: var(--cds-colors-text-primary);
  padding: var(--cds-spacing-scale-4) var(--cds-spacing-scale-8);

  &:hover {
    background: var(--cds-colors-background-hover);
  }

  &:focus {
    outline: 2px solid var(--cds-colors-focus);
    outline-offset: -2px;
  }
}
```

**架构决策**：

- 保留 Sass 用于令牌生成和复杂逻辑，输出原生 CSS 变量
- 组件样式使用 BEM 命名：`cds--btn`, `cds--btn--primary`
- 全面的暗色主题与高对比度主题支持
- 严格的 WCAG 2.1 AA 合规要求

### 11.3 Material Design 3 (Material You)

Material Design 3 引入了动态颜色系统 (Dynamic Color)，以源颜色生成完整的和谐配色方案 (来源: m3.material.io)。

```css
/* Material 3 生成的动态颜色令牌 */
:root {
  /* 从用户壁纸提取的源颜色生成的和谐调色板 */
  --md-sys-color-primary: #6750a4;
  --md-sys-color-on-primary: #ffffff;
  --md-sys-color-primary-container: #eaddff;
  --md-sys-color-on-primary-container: #21005d;

  --md-sys-color-secondary: #625b71;
  --md-sys-color-surface: #fffbfe;
  --md-sys-color-surface-variant: #e7e0ec;
  --md-sys-color-outline: #79747e;

  /* 动态升高 (Elevation) 通过色调叠加实现 */
  --md-sys-elevation-level1: linear-gradient(0deg, rgba(103, 80, 164, 0.05), rgba(103, 80, 164, 0.05));
  --md-sys-elevation-level2: linear-gradient(0deg, rgba(103, 80, 164, 0.08), rgba(103, 80, 164, 0.08));
}
```

```js
// Material Color Utilities (官方库生成动态主题)
import { argbFromHex, themeFromSourceColor, applyTheme } from '@material/material-color-utilities';

const sourceColor = argbFromHex('#6750a4');
const theme = themeFromSourceColor(sourceColor);

// 将生成的主题应用到 DOM
applyTheme(theme, { target: document.body, dark: false });
// 自动生成 Primary/Secondary/Tertiary/Error/Neutral/NeutralVariant 六个调色板
```

**Material 3 架构核心**：

- **HCT 色彩空间** (Hue-Chroma-Tone)：比 HSL 更感知均匀，确保生成的色调和谐
- **Token 体系**：`md-sys-color-*`、`md-sys-typescale-*`、`md-sys-shape-*`
- **自适应布局**：12 列响应式网格系统，配合断点令牌

---

## 12. 延伸阅读

- [样式处理分类](../categories/styling)
- [UI 组件库分类](../categories/ui-component-libraries)
- [W3C CSS Specification](https://www.w3.org/Style/CSS/)
- [MDN CSS Reference](https://developer.mozilla.org/zh-CN/docs/Web/CSS)
- [web.dev - CSS](https://web.dev/learn/css/)
- [Tailwind CSS 官方文档](https://tailwindcss.com/docs)
- [Style Dictionary 文档](https://amzn.github.io/style-dictionary/)
- [Lightning CSS 文档](https://lightningcss.dev/)
- [CUBE CSS](https://cube.fyi/)
- [Every Layout](https://every-layout.dev/)
- [Inclusive Design Principles](https://inclusivedesignprinciples.org/)

---

> 本指南基于截至 2026 年 5 月的 CSS 规范、浏览器支持数据及主流工具链版本编写。浏览器支持率数据来自 [caniuse.com](https://caniuse.com)，工具链特性来自各项目官方文档。
