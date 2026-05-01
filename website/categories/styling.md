---
title: 样式/CSS工具
description: JavaScript/TypeScript 样式/CSS工具 2025-2026 生态全景 — Tailwind v4、零运行时 CSS-in-JS、原生 CSS 演进
---

# CSS 与样式处理生态

> **趋势洞察**：Tailwind CSS v4 凭借 Rust 驱动的 Oxide 引擎实现构建速度 10 倍提升，进一步巩固统治地位；零运行时 CSS-in-JS 成为新标准，传统运行时方案（styled-components、Emotion）进入维护模式；原生 CSS 的 `@layer`、容器查询与 `:has()` 已在主流浏览器全面落地。2026 年，前端样式领域呈现"Tailwind 统治、CSS-in-JS 衰退、原生 CSS 复兴"的三极格局。

---

## 核心数据概览（2026年5月）

| 方案 | GitHub Stars | npm 周下载量 | 最新版本 | 状态 |
|------|-------------|-------------|---------|------|
| Tailwind CSS | ~95k | ~1,800 万+ | v4.1.18 | 🟢 活跃，2025.1 发布 v4 |
| UnoCSS | ~19k | ~100 万+ | v0.66 | 🟢 活跃，Anthony Fu 主导 |
| Panda CSS | ~5.5k | ~20 万+ | v0.52 | 🟢 活跃，Chakra UI 团队出品 |
| StyleX (Meta) | ~13k | ~8 万+ | v0.11 | 🟢 活跃，React 官方默认方案 |
| styled-components | ~41k | ~500 万+ | v6.4 | 🟡 维护模式，2025.3 声明 |
| Emotion | ~18k | ~400 万+ | v11.14 | 🟡 维护模式，核心维护者减少 |
| Linaria | ~11k | ~15 万+ | v7.0 | 🟢 活跃，零运行时先驱 |
| Vanilla Extract | ~11k | ~50 万+ | v1.15 | 🟢 活跃，TypeScript 原生 |
| CSS Modules | - | - | - | 🟢 原生支持，所有主流构建工具 |
| Style Dictionary | ~3.5k | ~80 万+ | v4.0 | 🟢 活跃，Amazon 开源 |

> 📊 **数据来源**：GitHub Stars 取自各仓库公开 API；npm 下载量来自 npm registry 公开数据；版本状态截至 2026 年 5 月。存在统计延迟，仅供参考。

---

## Tailwind CSS v4：Oxide 引擎与 CSS-first 革命

Tailwind CSS v4 于 **2025 年 1 月** 正式发布，核心是基于 **Rust 重写的 Oxide 引擎**，彻底替代了此前的 JavaScript JIT 编译器。v4 不仅是性能升级，更是配置范式从 JavaScript 向原生 CSS 的根本迁移。

```bash
npm install -D tailwindcss@4
```

### v4 关键改进

- **构建速度提升 10 倍**：增量编译时间从数百毫秒降至数十毫秒；大型项目构建时间从 3-5 秒降至 300-500 毫秒
- **CSS-first 配置**：完全抛弃 `tailwind.config.js`，通过 CSS 的 `@theme` 指令直接定义设计令牌
- **零配置开箱即用**：自动内容检测，无需手动配置 `content` 路径
- **原生 `@layer` 集成**：完全基于 `@layer`、`@property` 等现代 CSS 标准生成样式
- **容器查询内置**：`@container` 变体成为一等公民，`@container/card (min-width: 400px)` 直接可用
- **浏览器支持**：Chrome 111+、Firefox 128+、Safari 17.4+

### CSS-first 配置详解

v4 的核心哲学是将配置权交还 CSS 文件本身，设计令牌以原生 CSS 变量的形式存在：

```css
/* v4 配置方式：直接在 CSS 中声明主题 */
@import "tailwindcss";

@theme {
  /* 颜色令牌 */
  --color-brand: #0ea5e9;
  --color-brand-dark: #0284c7;

  /* 字体令牌 */
  --font-sans: "Inter", system-ui, sans-serif;
  --font-mono: "Fira Code", monospace;

  /* 间距令牌（支持转义） */
  --spacing-4\.5: 1.125rem;

  /* 断点令牌 */
  --breakpoint-xs: 30rem;
  --breakpoint-sm: 40rem;

  /* 动画令牌 */
  --animate-fade-in: fade-in 0.3s ease-out;
}

/* 自定义层叠顺序 */
@layer theme, base, components, utilities;
```

CSS-first 配置的优势在于：

1. **原生级联**：令牌是真正的 CSS 自定义属性，可在浏览器 DevTools 中实时调试
2. **无构建依赖**：设计系统可以直接分发 `.css` 文件，无需 JS 构建步骤
3. **运行时主题切换**：通过修改 CSS 变量实现毫秒级主题切换，无需重新编译

### @layer 与样式隔离

Tailwind v4 深度利用 CSS Cascade Layers（层叠层）管理优先级：

```css
@layer base {
  /* 重置和基础样式 */
  html { font-family: var(--font-sans); }
}

@layer components {
  /* 组件级样式 */
  .btn {
    @apply px-4 py-2 rounded-lg;
    background: var(--color-brand);
  }
}

@layer utilities {
  /* 工具类始终在最上层 */
  .text-balance { text-wrap: balance; }
}
```

层叠层解决了传统 CSS 的"特异性战争"问题。无论 `@layer utilities` 中的选择器特异性多低，它总能覆盖 `@layer components` 中的冲突声明。

### 容器查询实战

v4 将容器查询从实验性特性提升为核心功能：

```html
<div class="@container/card">
  <div class="grid gap-4 @min-[400px]/card:grid-cols-2 @min-[600px]/card:grid-cols-3">
    <article class="p-4 bg-white rounded-lg">...</article>
  </div>
</div>
```

与媒体查询相比，容器查询基于**组件容器尺寸**而非视口尺寸响应，这使得组件在不同布局上下文中具备真正的自适应性。

> 💡 **采用率**：State of CSS 2025 调查显示，**78% 的受访者** 正在使用或计划使用 Tailwind CSS，较 2024 年增长 12 个百分点。Next.js 15+ 的 `create-next-app` 已将 Tailwind v4 作为默认样式方案。

---

## UnoCSS：按需原子化引擎

UnoCSS 是由 Anthony Fu 创建的**即时按需原子化 CSS 引擎**，其核心理念是"引擎优先，预设驱动"。与 Tailwind 的"框架优先"不同，UnoCSS 本身不生成任何 CSS，所有工具类都通过可插拔的预设（Presets）提供。

```bash
npm install -D unocss
```

### 核心特性

| 特性 | 说明 |
|------|------|
| **按需生成** | 仅扫描到的类名才会生成对应 CSS，零未使用样式 |
| **预设系统** | 通过预设组合任意原子化策略：Tailwind 兼容、Windi、Bootstrap 等 |
| **Attributify 模式** | 将工具类写入 HTML 属性：`text="red" p="4"` |
| **Icon 预设** | 内联任意 Iconify 图标为 CSS，`i-ri-user-line` 直接可用 |
| **Shortcuts** | 自定义缩写规则，`btn: "px-4 py-2 rounded bg-blue-500"` |

### 预设系统详解

UnoCSS 的灵活性来自其强大的预设生态：

```ts
// uno.config.ts
import { defineConfig, presetUno, presetAttributify, presetIcons, presetTypography } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),        // 默认 Tailwind/Windi 兼容预设
    presetAttributify(), // 属性化模式支持
    presetIcons(),      // 图标预设
    presetTypography(), // 排版预设
  ],
  rules: [
    // 自定义静态规则
    ['m-custom', { margin: '2rem' }],
    // 自定义动态规则
    [/^text-(\d+)$/, ([, d]) => ({ 'font-size': `${d}px` })],
  ],
  shortcuts: {
    // 组合缩写
    'btn': 'px-4 py-2 rounded-lg transition-colors',
    'btn-primary': 'btn bg-blue-500 text-white hover:bg-blue-600',
  },
})
```

**主要预设对比**：

| 预设 | 用途 | 与 Tailwind 关系 |
|------|------|-----------------|
| `preset-uno` | 默认预设，兼容 Tailwind + Windi | 超集 |
| `preset-wind3` | Tailwind v3 精确兼容 | 子集/等价 |
| `preset-wind4` | Tailwind v4 兼容，支持现代 CSS 特性 | 子集/等价 |
| `preset-mini` | 最小化预设，仅核心工具类 | 无关 |
| `preset-icons` | 纯 CSS 图标，支持 20 万+ 图标 | 无关 |

### UnoCSS vs Tailwind CSS

| 维度 | UnoCSS | Tailwind CSS v4 |
|------|--------|-----------------|
| **架构** | 引擎 + 预设，无主见核心 | 框架 + 插件，高度主见 |
| **构建速度** | 最快（Vite 原生集成） | 很快（Rust 引擎） |
| **灵活性** | 极高，可自定义任意规则 | 高，通过配置和插件扩展 |
| **学习曲线** | 中等（需理解预设系统） | 低（类名即文档） |
| **生态** | 较小但增长迅速 | 最大，组件库最丰富 |
| **适用场景** | 高度定制、Vite 生态、实验性项目 | 通用项目、团队协作、快速交付 |

> ⭐ **GitHub Stars**：~19k | **npm**：~100 万周下载 | **适用场景**：追求极致构建速度、需要高度自定义原子类规则、Vite/Nuxt 生态项目

---

## Panda CSS：类型安全的 CSS-in-JS

Panda CSS 由 Chakra UI 创始人 Segun Adebayo 打造，是**零运行时、类型安全、设计令牌优先**的 CSS-in-JS 框架。它在编译时将样式对象转换为原子 CSS 类，既保留了 CSS-in-JS 的 DX，又消除了运行时开销。

```bash
npm install -D @pandacss/dev
npx panda init --postcss
```

### 核心设计

Panda 采用三层架构：

1. **设计令牌层**：W3C 标准令牌格式，支持基础和语义令牌
2. **Recipe 层**：类型安全的多变体组件样式（类似 CVA/Stitches）
3. **模式层**：预定义布局模式（Stack、Grid、Circle 等）

```ts
import { css } from '../styled-system/css'
import { circle, stack } from '../styled-system/patterns'
import { cva } from '../styled-system/css'

// 原子样式 — 编译为工具类
const className = css({
  padding: '4',
  fontSize: 'lg',
  color: 'gray.800',
  _hover: { bg: 'gray.100' },
})

// 布局模式
const layout = stack({ direction: 'row', gap: '4', p: '6' })

// Recipe — 多变体组件样式
const button = cva({
  base: { fontWeight: 'medium', px: '3', rounded: 'md' },
  variants: {
    visual: {
      solid: { bg: 'blue.500', color: 'white' },
      outline: { border: '1px solid', borderColor: 'blue.500', color: 'blue.500' },
    },
    size: {
      sm: { fontSize: 'sm', py: '1' },
      md: { fontSize: 'md', py: '2' },
    },
  },
  defaultVariants: { visual: 'solid', size: 'md' },
})
```

### 设计令牌系统

Panda 原生支持 W3C Design Tokens 社区组规范：

```ts
// panda.config.ts
export default defineConfig({
  theme: {
    tokens: {
      colors: {
        primary: { value: '#0ea5e9' },
        secondary: { value: '#6366f1' },
      },
      fonts: {
        body: { value: 'Inter, sans-serif' },
      },
    },
    semanticTokens: {
      colors: {
        danger: {
          value: { base: '{colors.red.500}', _dark: '{colors.red.300}' },
        },
        success: {
          value: { base: '{colors.green.500}', _dark: '{colors.green.300}' },
        },
      },
    },
  },
})
```

编译后生成：

```css
@layer tokens {
  :root {
    --colors-primary: #0ea5e9;
    --colors-danger: var(--colors-red-500);
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --colors-danger: var(--colors-red-300);
    }
  }
}
```

### 类型安全

Panda 的最大优势是**端到端类型安全**：

- 所有 CSS 属性受 `csstype` 约束，拼写错误在编译时报错
- 设计令牌自动补全，`color: 'pri...'` 会提示 `primary`、`primary.dark` 等
- Recipe 变体受 TypeScript 联合类型约束，`visual="ghost"` 会报错

> ⭐ **GitHub Stars**：~5.5k | **npm**：~20 万周下载 | **适用场景**：设计系统建设、React/Next.js 项目、类型安全优先的团队、多主题应用

---

## CSS Modules：本地作用域与 TypeScript 集成

CSS Modules 是最成熟的组件级样式方案之一，通过构建时类名哈希实现**本地作用域隔离**，无需额外运行时。

```css
/* Button.module.css */
.button {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  background: var(--color-primary);
  transition: background 0.2s;
}

.button:hover {
  background: var(--color-primary-dark);
}

/* 组合另一个模块的类 */
.primary {
  composes: button;
  background: blue;
}

/* 全局选择器例外 */
:global(.dark) .button {
  border-color: white;
}
```

```tsx
// Button.tsx
import styles from './Button.module.css'

export function Button({ variant }: { variant: 'primary' | 'secondary' }) {
  return <button className={styles[variant]}>点击</button>
}
```

### 核心机制

| 特性 | 说明 |
|------|------|
| **本地作用域** | 所有类名默认哈希化 `.Button_button__ac2E0` |
| **composes** | 复用其他类的声明，不增加选择器特异性 |
| `:global()` | 在本地模块中注入全局规则 |
| `@value`** | 跨模块共享变量（推荐改用 CSS 自定义属性） |

### TypeScript 集成

CSS Modules 与 TypeScript 的深度集成需要类型声明支持：

```ts
// typed-css-modules 或 Vite 插件自动生成
declare module '*.module.css' {
  const classes: Record<string, string>
  export default classes
}
```

现代构建工具提供增强支持：

- **Vite**：`vite-plugin-css-modules` 提供类型生成和路径别名支持
- **Next.js**：App Router 原生支持 `*.module.css`，自动代码分割
- **TypeScript Plugin**：`typescript-plugin-css-modules` 在编辑器中提供类名自动补全和跳转到定义

```tsx
// 配合 CSS 变量实现主题
import styles from './Card.module.css'

// CSS 变量在 :root 或容器上定义，模块仅负责结构
<div className={styles.card} style={{ '--card-bg': '#fff' } as React.CSSProperties}>
  <h3 className={styles.title}>标题</h3>
</div>
```

> **适用场景**：遗留项目维护、需要完全控制 CSS 的团队、与 Sass/Less 配合、避免原子类学习成本

---

## CSS-in-JS 现状：衰退与转型

React Server Components (RSC) 的普及宣告了**运行时 CSS-in-JS 的终结**。在服务端组件中运行时注入样式的机制会导致水合不匹配和性能瓶颈。2025-2026 年，CSS-in-JS 生态呈现明显的两极分化。

### 运行时方案：维护模式

#### styled-components

- **Stars**：~41k | **npm**：~500 万周下载 | **版本**：v6.4（2026）
- **状态**：🟡 **维护模式**。2025 年 3 月维护者 Evan Jacobs 正式宣布进入维护模式，不再开发新功能
- **关键问题**：
  - 从未实现 React 18 的 `useInsertionEffect`，初始渲染比最优方案慢 40%
  - 不支持 RSC，服务端组件必须使用 `'use client'` 指令
  - 性能开销随组件数量线性增长
- **迁移建议**：新项目避免使用；存量项目逐步迁移至 Tailwind / StyleX / Panda

#### Emotion

- **Stars**：~18k | **npm**：~400 万周下载 | **版本**：v11.14
- **状态**：🟡 **维护模式**。核心维护者减少，官方承认"对新功能不感兴趣"
- **关键问题**：
  - 运行时样式计算开销不可忽视
  - RSC 兼容性差，与 Next.js App Router 配合困难
  - TypeScript 类型更新滞后于 CSS 新特性（如 `container-type: scroll-state`）
- **迁移建议**：与 styled-components 类似，逐步向零运行时方案迁移

### 零运行时方案：新纪元

#### Linaria

- **Stars**：~11k | **npm**：~15 万周下载 | **版本**：v7.0（基于 WyW-in-JS）
- **状态**：🟢 活跃维护
- **核心机制**：编译时提取 CSS 到静态文件，运行时零开销。动态样式通过 CSS 变量回退实现
- **特点**：
  - 模板字符串语法，与 styled-components 高度相似
  - 支持 Sass/PostCSS 预处理
  - Airbnb 等大厂生产验证
- **局限**：构建配置复杂，Babel/Rollup 等工具链设置门槛高；社区生态较小

```tsx
import { styled } from '@linaria/react'

const Button = styled.button<{ primary?: boolean }>`
  padding: 1rem;
  background: ${props => props.primary ? 'blue' : 'gray'};
  /* 编译为 CSS 变量驱动的静态类 */
`
```

#### Pigment CSS（MUI 团队）

- **状态**：🟢 新兴力量
- **核心机制**：基于 WyW-in-JS 编译为 CSS Modules，Next.js/Vite 插件开箱即用
- **背景**：Material UI 团队为替代 Emotion 而开发，计划在未来大版本中默认采用
- **优势**：API 与 styled-components 相似，迁移成本低；MUI 的庞大用户群将推动普及

### CSS-in-JS 迁移路径

```
运行时 CSS-in-JS (styled-components/Emotion)
    │
    ├─→ 追求类型安全 + 设计系统 ──→ Panda CSS / Vanilla Extract
    ├─→ 追求性能 + React 生态 ────→ StyleX / Pigment CSS
    ├─→ 追求简洁 + 跨框架 ────────→ Tailwind CSS + CSS Modules
    └─→ 遗留项目渐进迁移 ─────────→ Linaria（兼容 API）
```

---

## 原生 CSS 架构：方法论复兴

随着原生 CSS 能力的爆发式增长（嵌套、层叠层、容器查询、`:has()`），传统 CSS 架构方法论在 2026 年迎来复兴。这些方法论不再是"没有工具时的权宜之计"，而是与现代 CSS 特性深度结合的最佳实践。

### BEM（Block Element Modifier）

最经典、最广泛验证的命名约定：

```css
/* Block */
.card { }

/* Element */
.card__title { }
.card__image { }

/* Modifier */
.card--featured { }
.card__title--large { }
```

**2026 年演进**：BEM 与 `@layer` 结合，彻底摆脱特异性困扰：

```css
@layer components {
  .card { /* ... */ }
  .card__title { /* ... */ }
}

@layer utilities {
  .card--featured { /* 更高优先级，无需 !important */ }
}
```

### ITCSS（Inverted Triangle CSS）

Harry Roberts 提出的分层架构，按特异性从低到高组织：

| 层级 | 用途 | 示例 |
|------|------|------|
| **Settings** | 全局变量、配置 | 颜色、字体、断点 |
| **Tools** | 混入和函数 | `mixins`、`clamp` 工具 |
| **Generic** | 重置和标准化 | `box-sizing`、`reset.css` |
| **Elements** | 裸 HTML 元素 | `h1`、`a`、`p` |
| **Objects** | 布局模式 | `.o-grid`、`.o-media` |
| **Components** | 具体 UI 组件 | `.c-button`、`.c-card` |
| **Utilities** | 覆盖和辅助 | `.u-text-center`、`.u-hidden` |

ITCSS 在 2026 年与 `@layer` 完美映射：

```css
@layer settings, tools, generic, elements, objects, components, utilities;
```

### CUBE CSS

Andy Bell 提出的方法论，强调**组合性**而非层叠：

- **C**omposition：布局由父级控制（Flex、Grid）
- **U**tility：原子工具类处理常见模式
- **B**lock：组件自身样式
- **E**xception：修饰符处理变体

```html
<div class="grid gap-4 sm:grid-cols-2">
  <article class="card [ featured ]">
    <!-- Composition: grid 和 gap 控制布局 -->
    <!-- Block: card 定义组件基础 -->
    <!-- Exception: [ featured ] 修饰符 -->
  </article>
</div>
```

### 层叠层（Cascade Layers）实践

现代浏览器全面支持 `@layer`（Chrome 99+ / Safari 15.4+ / Firefox 97+），它成为管理大型 CSS 架构的核心工具：

```css
/* 1. 定义全局层顺序 */
@layer reset, tokens, base, layout, components, utilities, overrides;

/* 2. 各文件声明自身所属层 */
@layer reset {
  *, *::before, *::after { box-sizing: border-box; margin: 0; }
}

@layer tokens {
  :root {
    --color-primary: #0ea5e9;
    --space-sm: 0.5rem;
    --radius-md: 0.375rem;
  }
}

@layer components {
  .btn {
    padding: var(--space-sm) 1rem;
    border-radius: var(--radius-md);
    background: var(--color-primary);
  }
}

@layer overrides {
  /* 最高优先级，用于 A/B 测试或紧急修复 */
  .btn--experiment { background: purple; }
}
```

层叠层的核心价值：

1. **特异性民主化**：层顺序决定优先级，选择器特异性仅在同一层内生效
2. **第三方隔离**：`@layer bootstrap { @import url(bootstrap.css); }` 将框架样式置于底层
3. **可预测的重写**：无需 `!important` 即可确保覆盖

> **适用场景**：大型长期项目、设计系统 CSS 架构、遗留系统重构、多团队协作代码库

---

## 设计令牌：从 Figma 到代码的桥梁

设计令牌（Design Tokens）是设计系统的原子单位，将颜色、间距、字体等视觉决策抽象为命名变量。2026 年，设计令牌已成为连接设计与开发的通用语言。

### 架构分层

```
基础令牌 (Primitives)          语义令牌 (Semantic)           组件令牌 (Component)
    │                                │                              │
    ├─ color.blue.500               ├─ color.text.primary          ├─ button.bg.default
    ├─ color.gray.100               ├─ color.surface.background    ├─ button.padding.md
    ├─ space.4 (1rem)               ├─ space.section.gap           ├─ card.radius.lg
    └─ font.size.md                 ├─ font.heading.weight         └─ input.border.color
                                    └─ shadow.elevation.md
```

### Style Dictionary

Amazon 开源的跨平台令牌转换引擎，仍是 2026 年行业事实标准。

```bash
npm install -D style-dictionary
```

```json
// tokens/colors/base.json
{
  "color": {
    "blue": {
      "500": { "value": "#3b82f6", "type": "color" }
    }
  }
}
```

```js
// style-dictionary.config.js
module.exports = {
  source: ['tokens/**/*.json'],
  platforms: {
    css: {
      transformGroup: 'css',
      buildPath: 'build/css/',
      files: [{ destination: 'variables.css', format: 'css/variables' }]
    },
    tailwind: {
      transformGroup: 'js',
      buildPath: 'build/tailwind/',
      files: [{ destination: 'theme.js', format: 'javascript/module' }]
    }
  }
}
```

Style Dictionary v4（2025）新增：

- **W3C 规范兼容**：原生支持 `$value` / `$type` 语法
- **Hooks API**：自定义 transform、format、filter 更灵活
- **多主题输出**：单命令生成亮色/暗色/品牌变体

> ⭐ **GitHub Stars**：~3.5k | **npm**：~80 万周下载 | **适用场景**：多平台设计系统、需要向 iOS/Android/Web 同步令牌、大型品牌体系

### Tokens Studio

Figma 插件，让设计师在视觉环境中管理令牌并同步到代码仓库：

| 特性 | 说明 |
|------|------|
| **双向同步** | Figma ↔ GitHub/GitLab，设计变更即 Pull Request |
| **集合与主题** | 支持多品牌、多主题的令牌集合切换 |
| **引用与别名** | `{colors.primary.500}` 形式的令牌引用 |
| **Graph Engine** | 节点编辑器，通过算法生成色彩梯度、间距比例 |

**典型工作流**：

1. 设计师在 Tokens Studio 中调整 `color.brand.primary`
2. 点击"Push to GitHub"，生成 JSON 变更提交
3. CI 触发 Style Dictionary，自动生成 CSS 变量、Tailwind 主题、iOS Asset
4. 开发团队通过常规 Code Review 流程合并设计变更

### CSS 变量系统实践

原生 CSS 自定义属性已成为令牌落地的首选格式：

```css
/* 1. 基础层 */
:root {
  --color-blue-50: #eff6ff;
  --color-blue-500: #3b82f6;
  --color-blue-900: #1e3a8a;
  --space-1: 0.25rem;
  --space-4: 1rem;
}

/* 2. 语义层 */
:root {
  --color-text-primary: var(--color-blue-900);
  --color-interactive-default: var(--color-blue-500);
  --space-component-gap: var(--space-4);
}

/* 3. 主题切换 */
[data-theme="dark"] {
  --color-text-primary: var(--color-blue-50);
  --color-interactive-default: var(--color-blue-500);
}

/* 4. 组件使用 */
.btn {
  background: var(--color-interactive-default);
  padding: var(--space-2) var(--space-4);
}
```

CSS 变量的优势在于**运行时动态性**：JavaScript 可直接读写，支持平滑过渡动画，无需重新编译样式表。

---

## 响应式设计：从媒体查询到容器查询

2026 年的响应式设计已进入"组件自适应"时代。容器查询的普及和 CSS 逻辑属性的成熟，让响应式不再局限于视口维度。

### 媒体查询的演进

```css
/* 传统媒体查询 */
@media (min-width: 768px) { /* ... */ }

/* 现代范围语法 */
@media (width >= 768px) and (width < 1024px) { /* ... */ }

/* 偏好查询 */
@media (prefers-color-scheme: dark) { /* ... */ }
@media (prefers-reduced-motion: reduce) { /* ... */ }
@media (prefers-contrast: high) { /* ... */ }
```

### 容器查询：组件级响应

容器查询基于**容器尺寸**而非视口，使组件在任何上下文中都能自适应：

```css
/* 1. 声明容器 */
.card-container {
  container-type: inline-size;
  container-name: card;
}

/* 2. 容器查询规则 */
@container card (min-width: 400px) {
  .card {
    grid-template-columns: 150px 1fr;
    gap: 1.5rem;
  }
  .card__title {
    font-size: 1.5rem;
  }
}

@container card (min-width: 600px) {
  .card {
    grid-template-columns: 200px 1fr;
  }
  .card__meta {
    display: flex;
    gap: 1rem;
  }
}
```

**容器查询 vs 媒体查询**：

| 维度 | 媒体查询 | 容器查询 |
|------|----------|----------|
| 参照物 | 视口/设备 | 最近容器 |
| 适用场景 | 页面级布局 | 组件级适配 |
| 组件复用 | 需要预知上下文 | 上下文无关 |
| 浏览器支持 | 全面 | Chrome 105+ / Safari 16+ / FF 110+ |

### clamp()：流体排版的瑞士军刀

`clamp()` 实现无需断点的连续响应：

```css
/* 最小 1rem，首选 2.5vw + 0.5rem，最大 3rem */
h1 {
  font-size: clamp(1.5rem, 4vw + 0.5rem, 3rem);
}

/* 流体间距系统 */
.section {
  padding: clamp(1rem, 5vw, 4rem);
}

/* 流体容器宽度 */
.container {
  width: clamp(20rem, 90%, 75rem);
  margin-inline: auto;
}
```

### 逻辑属性

逻辑属性用**相对流向**替代物理方向，天然支持 RTL 和竖排文本：

```css
/* 物理属性 → 逻辑属性 */
margin-left / margin-right    →  margin-inline-start / margin-inline-end
padding-top / padding-bottom  →  padding-block-start / padding-block-end
border-left                   →  border-inline-start
width / height                →  inline-size / block-size

/* 实际应用 */
.dialog {
  margin-inline: auto;        /* 水平居中，RTL 自动翻转 */
  padding-inline: 1.5rem;     /* 左右内边距 */
  border-inline-start: 4px solid blue;
  inline-size: min(100% - 2rem, 40rem);
}
```

主流浏览器已全面支持逻辑属性，现代项目应优先使用逻辑属性以确保国际化兼容性。

---

## 2026 趋势：三极格局与选型决策

### 趋势一：Tailwind 统治地位巩固

- **市场份额**：State of CSS 2025 显示，Tailwind 使用率从 2023 年的 55% 跃升至 2026 年的 **78%**
- **生态锁定**：shadcn/ui、Radix UI、Headless UI 等头部组件库均以 Tailwind 为默认样式方案
- **框架绑定**：Next.js、Nuxt、Astro、SvelteKit 均提供官方 Tailwind 集成
- **人才市场**：招聘需求同比增长 40%，已成为前端工程师的标配技能

### 趋势二：CSS-in-JS 不可逆转的衰退

- **运行时方案**：styled-components 和 Emotion 进入维护模式，社区创新停滞
- **零运行时替代**：Panda CSS、StyleX、Vanilla Extract、Pigment CSS 瓜分迁移需求
- **RSC 倒逼**：React Server Components 的默认化使运行时样式注入成为"反模式"
- **MUI 转向**：Material UI 下一代版本将默认采用 Pigment CSS，抛弃 Emotion

### 趋势三：原生 CSS 复兴

- **预处理器衰退**：Sass 周下载量从峰值下降，原生嵌套和 `color-mix()` 替代大部分 Sass 功能
- **架构方法论回归**：BEM + `@layer`、ITCSS、CUBE CSS 成为大型项目新标配
- **浏览器能力追赶**：`:has()`、容器查询、`@property`、`@layer` 全面普及，"无需构建的 CSS"成为可能
- **性能优先**：原生 CSS 零构建开销、零运行时开销，在 Core Web Vitals 时代具备天然优势

### 选型决策树

```
┌─────────────────────────────────────────────────────────────────┐
│                    项目类型评估                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
   ┌─────────┐          ┌─────────┐          ┌─────────┐
   │ 快速原型 │          │ 新项目  │          │ 遗留项目 │
   │ MVP/POC │          │ 设计系统│          │ 长期维护 │
   └────┬────┘          └────┬────┘          └────┬────┘
        │                    │                    │
        ▼                    ▼                    ▼
   ┌────────────┐      ┌────────────┐      ┌────────────┐
   │ Tailwind v4│      │ 需要类型安全? │      │ 已用 styled- │
   │ + shadcn/ui│      │              │      │ components?  │
   │            │      ├─────┬──────┤      ├──────┬─────┤
   │ 理由: 最快  │      │ 是   │ 否    │      │ 是    │ 否   │
   │ 的从 0 到 1│      ▼     ▼      │      ▼      ▼     │
   │ 路径，生态  │  Panda   Tailwind   Pigment  CSS Modules│
   │ 最丰富      │   CSS    + Tokens   CSS      + @layer  │
   │             │              │             │           │
   │ Stars: 95k  │      ┌──────┴──────┐      └─────┬─────┘
   │ 下载: 1800万 │      ▼             ▼            │
   └────────────┘  StyleX      Vanilla Extract    │
                   (React生态)   (跨框架)           ▼
                                              ┌──────────┐
                                              │ Sass/PostCSS│
                                              │ → Lightning  │
                                              │    CSS       │
                                              └──────────┘
```

### 详细选型矩阵

| 场景 | 首选方案 | 备选方案 | 核心理由 |
|------|---------|---------|---------|
| **快速原型 / 初创项目** | **Tailwind CSS v4** | UnoCSS | 最快交付速度，组件生态最丰富 |
| **企业设计系统** | **Panda CSS** | StyleX / Vanilla Extract | 类型安全 + 令牌系统 + Recipe 模式 |
| **React / Next.js 应用** | **Tailwind v4** | StyleX / Pigment CSS | RSC 兼容，社区方案最成熟 |
| **跨框架组件库** | **Vanilla Extract** | Panda CSS | 纯构建时，TypeScript 原生，无框架绑定 |
| **Vue / Nuxt 项目** | **UnoCSS** | Tailwind v4 | Vite 原生集成最佳，Attributify 模式与 Vue 模板契合 |
| **遗留项目维护** | **CSS Modules** | Sass + PostCSS | 渐进增强，无需重写，兼容现有架构 |
| **纯静态 / 零构建** | **原生 CSS** (`@layer` + 嵌套) | - | 浏览器已足够现代，零工具链依赖 |
| **移动端 / 小程序** | **UnoCSS** | Tailwind v4 | 按需生成产物极小，预设系统灵活适配 rpx 等单位 |

---

## 核心数据概览（精简对比表）

| 方案 | GitHub Stars | npm 周下载 | 状态 | 适用场景 |
|------|-------------|-----------|------|---------|
| Tailwind CSS v4 | ~95k | ~1,800 万 | 🟢 活跃 | 通用首选，快速交付 |
| UnoCSS | ~19k | ~100 万 | 🟢 活跃 | 高度定制，Vite 生态 |
| Panda CSS | ~5.5k | ~20 万 | 🟢 活跃 | 类型安全设计系统 |
| StyleX | ~13k | ~8 万 | 🟢 活跃 | React 官方，Meta 背书 |
| styled-components | ~41k | ~500 万 | 🟡 维护 | 存量维护，避免新项目 |
| Emotion | ~18k | ~400 万 | 🟡 维护 | 存量维护，逐步迁移 |
| Linaria | ~11k | ~15 万 | 🟢 活跃 | 零运行时，兼容 styled API |
| Vanilla Extract | ~11k | ~50 万 | 🟢 活跃 | 跨框架，TypeScript 原生 |
| CSS Modules | - | - | 🟢 原生 | 遗留项目，渐进增强 |
| Style Dictionary | ~3.5k | ~80 万 | 🟢 活跃 | 多平台令牌管理 |

---

> 📊 **数据统计时间**：2026年5月
> ⭐ Stars 与下载量数据来源于 GitHub / npm 公开 API，存在统计延迟
> 📎 关联实验室：[20.5-frontend-frameworks](../../20-code-lab/20.5-frontend-frameworks/)
