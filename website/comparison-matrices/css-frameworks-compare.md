---
title: CSS 框架对比矩阵
description: 'Tailwind CSS、UnoCSS、Panda CSS、CSS Modules、Styled Components、Open Props 选型全面对比'
---

# CSS 框架对比矩阵

> 最后更新: 2026-05-01 | 覆盖: 原子化 CSS / CSS-in-JS / 零运行时 / 设计令牌 / 构建工具链 / CSS 架构方法论

---

## 概述

CSS 生态在 2024-2026 年经历了范式转移：**原子化 CSS 统治市场**（Tailwind 78% 采用率），**CSS-in-JS 进入维护模式**（Styled Components 2025.3 宣布维护），**零运行时方案崛起**（Panda CSS、UnoCSS）。与此同时，原生 CSS 能力大幅增强（`@layer`、`@container`、`@scope`、`@property`），推动了"原生 CSS 复兴"的浪潮。本矩阵覆盖从快速原型到企业设计系统的全场景选型，并纳入 CSS 架构方法论与构建工具链的深度对比。

---

## 核心对比矩阵

### 综合对比

| 框架 | 大小(gzip) | 运行时 | TS 支持 | 构建时间 | 2026 采用率 | 状态 |
|------|-----------|:------:|:-------:|:--------:|------------|:----:|
| **Tailwind CSS v4** | ~14KB | 0 | ✅ | 快 | **78%** | 🟢 活跃 |
| **UnoCSS** | ~0KB(按需) | 0 | ✅ | 极快 | 8% | 🟢 活跃 |
| **Panda CSS** | ~0KB(按需) | 0 | ✅ | 快 | 3% | 🟢 活跃 |
| **CSS Modules** | 取决于内容 | 0 | ⚠️ 需插件 | 无 | 15% | 🟢 稳定 |
| **Styled Components** | ~12KB | 有 | ✅ | 慢 | 5% | 🟡 维护 |
| **Emotion** | ~10KB | 有 | ✅ | 慢 | 8% | 🟡 维护 |
| **Linaria v7** | ~0KB | 0 | ✅ | 中 | 1% | 🟢 活跃 |
| **Open Props** | ~5KB | 0 | ✅ | 无 | 2% | 🟢 活跃 |
| **Semantic UI** | ~100KB+ | 有 | ⚠️ | 无 | <1% | 🔴 停滞 |
| **Bulma** | ~25KB | 0 | ⚠️ | 无 | 2% | 🟡 维护 |
| **Foundation** | ~40KB | 0 | ⚠️ | 无 | <1% | 🔴 停滞 |

📊 采用率来源: State of CSS 2025 调查 (n=7,000+)，npm 周下载量 (2026-04)

---

## 深度维度对比

### 原子化 CSS 对比

| 特性 | Tailwind v4 | UnoCSS | Panda CSS |
|------|:-----------:|:------:|:---------:|
| 预设系统 | 核心 + 插件 | 100+ 预设 | 核心 + Recipe |
| 自定义主题 | `@theme` CSS-first | `uno.config.ts` | `panda.config.ts` |
| 容器查询 | ✅ 一等公民 | ✅ | ✅ |
| 深色模式 | `dark:` 变体 | `dark:` 变体 | 条件 Recipe |
| 任意值 | `w-[123px]` | `w-123px` | `css({ w: '123px' })` |
| 构建工具 | Lightning CSS | 自定义引擎 | PostCSS |
| IDE 支持 | Tailwind CSS IntelliSense | UnoCSS VS Code | 有限 |

### 零运行时方案对比

| 特性 | CSS Modules | Linaria v7 | Panda CSS |
|------|:-----------:|:----------:|:---------:|
| 运行时开销 | 0 | 0 | 0 |
| 类型安全 | ⚠️ 需 typed-css-modules | ✅ | ✅ 生成类型 |
| 动态样式 | ❌ | ⚠️ CSS 变量 | ✅ runtime 条件 |
| 服务端渲染 | ✅ | ✅ | ✅ |
| 代码分割 | ✅ | ✅ | ✅ |
| 包体积影响 | 低 | 极低 | 低 |

### CSS-in-JS 现状 (2026)

| 框架 | 运行时 | 包大小 | 2026 状态 | 迁移建议 |
|------|:------:|:------:|:---------:|---------|
| **Styled Components** | 有 | ~12KB | 🟡 维护模式 | 迁移至 Tailwind/Panda |
| **Emotion** | 有 | ~10KB | 🟡 维护模式 | 迁移至 Tailwind/Panda |
| **Linaria** | 0 | ~0KB | 🟢 活跃 | 零运行时替代 |
| **Pigment CSS** | 0 | ~0KB | 🟢 新兴 | MUI 官方迁移目标 |

> Styled Components 2025.3 声明进入维护模式（来源: [styled-components 官方博客](https://styled-components.com/)）

---

## 传统 CSS 框架对比

| 特性 | Semantic UI | Bulma | Foundation |
|------|:-----------:|:-----:|:----------:|
| 发布年份 | 2013 | 2016 | 2011 |
| 包大小(gzip) | ~100KB+ | ~25KB | ~40KB |
| 组件数量 | 50+ | 40+ | 30+ |
| 定制化 | 主题变量 | Sass 变量 | Sass 变量 |
| JS 依赖 | jQuery/React | 无 | 无 |
| 深色模式 | ❌ | ✅ v1.0+ | ⚠️ 有限 |
| 响应式网格 | ✅ 12列 | ✅ 12列 | ✅ 12列 |
| 维护状态 | 🔴 停滞 | 🟡 社区维护 | 🔴 停滞 |
| 适用场景 | 遗留项目 | 快速原型 | 遗留项目 |

> Semantic UI 自 2021 年后核心更新停滞，社区 fork 出 [Fomantic UI](https://fomantic-ui.com/) 继续维护。Foundation 由 ZURB 开发，2022 年后官方维护放缓。Bulma 在 2025 年发布 v1.0，引入深色模式和 CSS 变量支持，但仍以传统类名架构为主。

---

## CSS 架构方法论

### 方法论对比矩阵

| 方法论 | 核心思想 | 命名规范 | 适用规模 | 学习曲线 | 2026 相关性 |
|--------|---------|:--------:|:--------:|:--------:|:-----------:|
| **BEM** | 块-元素-修饰符 | `.block__element--mod` | 中小 | 低 | ⭐⭐⭐ 稳定 |
| **SMACSS** | 分类规则（基础、布局、模块等） | 无强制 | 中大 | 中 | ⭐⭐ 降低 |
| **ITCSS** | 倒三角分层（设置→工具→组件） | 前缀分层 | 大 | 中 | ⭐⭐⭐ 稳定 |
| **CUBE CSS** | 组合工具+块+异常+自定义属性 | 语义+工具混合 | 中大 | 中 | ⭐⭐⭐⭐ 上升 |
| **层叠层 @layer** | 原生级联控制 | 无 | 所有 | 低 | ⭐⭐⭐⭐⭐ 主流 |

### 各方法论详解

#### BEM (Block Element Modifier)

BEM 由 Yandex 提出，通过严格的命名约定避免选择器冲突：

```css
/* Block */
.card { }
/* Element */
.card__title { }
.card__button { }
/* Modifier */
.card--featured { }
.card__button--primary { }
```

**优势**: 无工具依赖、团队易理解、与任何框架兼容。
**局限**: 类名冗长、嵌套深度受限、无法表达组件关系。
**2026 定位**: 在 Tailwind 原子类与原生 `@scope` 的双重挤压下，BEM 在新建项目中采用率下降，但在设计系统文档和遗留代码库中仍有价值。

#### SMACSS (Scalable and Modular Architecture for CSS)

Jonathan Snook 提出，将样式分为五类：Base、Layout、Module、State、Theme。强调通过规则分类而非命名约定来管理复杂性。

**2026 定位**: 理念影响了 Tailwind 的 `base`/`components`/`utilities` 分层，但作为独立方法论已较少被直接引用。

#### ITCSS (Inverted Triangle CSS)

Harry Roberts 提出，按特异性递增顺序组织 CSS：Settings → Tools → Generic → Elements → Objects → Components → Utilities。

**2026 定位**: 与 Tailwind v4 的 `@layer` 结构高度契合：`@layer theme, base, components, utilities;`。ITCSS 的分层思想被现代原子化框架内置吸收。

#### CUBE CSS

Andy Bell 提出，强调 **C**omposition + **U**tility + **B**lock + **E**xception。核心理念：使用工具类处理大部分样式，仅在需要时使用语义化的 Block 类。

```html
<!-- CUBE CSS: 工具类 + 语义块 -->
<div class="grid gap-4 p-6 bg-white rounded-lg card">
  <h2 class="text-xl font-bold">标题</h2>
</div>
```

**2026 定位**: CUBE CSS 的"工具优先+语义兜底"思想直接预示了 Tailwind 的成功，是现代 CSS 架构的哲学基础。

#### 层叠层 (@layer)

CSS 原生级联控制机制，2022 年成为标准，2024 年后所有现代浏览器完整支持：

```css
@layer reset, base, components, utilities;

@layer base {
  body { line-height: 1.5; }
}

@layer utilities {
  .text-center { text-align: center; }
}
```

**2026 定位**: `@layer` 是原生 CSS 复兴的核心驱动力。Tailwind v4 使用 `@layer` 组织生成代码，开发者无需工具即可实现类似 ITCSS 的分层架构。

---

## Tailwind CSS v4 深度解析

### CSS-first 配置架构

Tailwind v4 彻底抛弃了 `tailwind.config.js`，转向纯 CSS 配置：

```css
/* index.css */
@import "tailwindcss";

@theme {
  --color-brand: #3b82f6;
  --color-brand-dark: #1d4ed8;
  --font-sans: 'Inter', system-ui, sans-serif;
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --breakpoint-md: 48rem;
  --breakpoint-lg: 64rem;
}
```

**优势**: 无需 JS 构建步骤即可配置；IDE 原生支持 CSS 变量自动补全；与原生 CSS 生态无缝集成。

### @theme 系统

`@theme` 指令将 CSS 自定义属性注册为 Tailwind 主题值，支持：

- `--color-*` → `text-`、`bg-`、`border-` 等工具类
- `--spacing-*` → `p-`、`m-`、`gap-` 等工具类
- `--font-*` → `font-` 工具类
- `--breakpoint-*` → 响应式变体

### 容器查询一等公民

```html
<div class="@container">
  <div class="@md:flex @md:gap-4">
    <!-- 容器宽度 >= md 时应用 -->
  </div>
</div>
```

Tailwind v4 将容器查询提升至与媒体查询同等地位，`@container` 和 `@<breakpoint>` 变体原生支持，无需插件。

### 基于 Lightning CSS 的构建

Tailwind v4 内置 Lightning CSS（原 Parcel CSS），替代 PostCSS 链：

| 特性 | Tailwind v3 (PostCSS) | Tailwind v4 (Lightning CSS) |
|------|:---------------------:|:---------------------------:|
| 构建速度 | 基准 | **~3-5x 提升** |
| 浏览器前缀 | autoprefixer | 内置 |
| 嵌套语法 | postcss-nesting | 原生支持 |
| 自定义媒体 | 插件 | 内置 |
| 色彩空间 | 有限 | oklch、lab 完整支持 |

📊 来源: Tailwind CSS 官方 benchmark，2025-10

---

## UnoCSS 深度解析

### 预设系统架构

UnoCSS 的核心竞争力在于高度模块化的预设系统：

| 预设 | 功能 | 用途 |
|------|------|------|
| `@unocss/preset-uno` | Tailwind 兼容预设 | 迁移场景 |
| `@unocss/preset-wind` | Windi CSS 兼容 | 历史兼容 |
| `@unocss/preset-mini` | 最小原子化基础 | 自定义框架 |
| `@unocss/preset-icons` | 图标即 CSS | 图标系统 |
| `@unocss/preset-typography` | 排版工具 | 内容站点 |
| `@unocss/preset-web-fonts` | Web 字体集成 | 字体加载 |
| `@unocss/preset-attributify` | 属性化模式 | 减少类名字符 |

### 与 Tailwind CSS 的核心差异

| 维度 | Tailwind CSS v4 | UnoCSS |
|------|:---------------:|:------:|
| 配置方式 | CSS-first `@theme` | `uno.config.ts` 纯配置 |
| 引擎 | Lightning CSS | 自定义扫描+生成引擎 |
| 按需生成 | JIT 编译时扫描 | 运行时/编译时双模式 |
| 规则扩展 | 插件 API | 规则函数，更底层 |
| 构建速度 | ~800ms | **~200ms** |
| 生态成熟度 | 极大 | 中等 |
| IDE 支持 | 官方 IntelliSense | 社区插件 |
| 属性化模式 | ❌ | ✅ `bg="red-500"` |

### 属性化模式 (Attributify)

```html
<!-- Tailwind: 冗长的类名列表 -->
<div class="m-1 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"></div>

<!-- UnoCSS 属性化: 语义更清晰的属性 -->
<div m-1 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600></div>
```

属性化模式将工具类转化为 HTML 属性，显著减少 `class` 属性的长度，提升模板可读性。

---

## Panda CSS 深度解析

### 类型安全样式系统

Panda CSS 的核心价值是将 CSS 属性映射为类型安全的 JavaScript API：

```tsx
import { css } from '../styled-system/css'

// TypeScript 自动补全和类型检查
function Button({ variant }: { variant: 'primary' | 'secondary' }) {
  return (
    <button className={css({
      bg: variant === 'primary' ? 'blue.500' : 'gray.500',
      color: 'white',
      px: '4',
      py: '2',
      rounded: 'lg',
      _hover: { opacity: 0.9 },
      // 拼写错误会在编译时报错
    })}>
      点击我
    </button>
  )
}
```

Panda 在构建时生成 `styled-system/` 目录，包含：

- `css/` — 原子化 CSS 工具函数
- `patterns/` — 布局模式（stack、grid、flex 等）
- `recipes/` — 组件变体系统
- `tokens/` — 设计令牌类型定义

### Recipe 系统

Recipe 是 Panda CSS 对组件变体管理的解决方案：

```ts
// panda.config.ts
import { defineRecipe } from '@pandacss/dev'

const buttonRecipe = defineRecipe({
  className: 'button',
  base: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
  variants: {
    variant: {
      primary: { bg: 'blue.500', color: 'white' },
      secondary: { bg: 'gray.200', color: 'gray.800' },
      danger: { bg: 'red.500', color: 'white' },
    },
    size: {
      sm: { px: '2', py: '1', fontSize: 'sm' },
      md: { px: '4', py: '2', fontSize: 'md' },
      lg: { px: '6', py: '3', fontSize: 'lg' },
    },
  },
  defaultVariants: { variant: 'primary', size: 'md' },
})
```

**优势**: 变体组合在构建时预计算，运行时零开销；类型安全保证所有变体组合合法；与设计令牌深度集成。

---

## CSS-in-JS 深度现状 (2024-2026)

### 维护模式的影响

Styled Components 和 Emotion 于 2025 年进入维护模式，标志着 CSS-in-JS 黄金时代的终结：

| 维度 | 影响 |
|------|------|
| 新功能 | 仅接受 bug 修复，不添加新特性 |
| React 兼容 | 逐步落后于 React Compiler / Server Components |
| 社区迁移 | 大量项目从 Styled Components → Tailwind/Panda |
| 招聘市场 | 新增职位要求 Tailwind 比例从 45% → 78% |

> 来源: GitHub 仓库活跃度分析，npm 下载量趋势 (2024-2026)

### 各方案详细对比

| 特性 | Styled Components | Emotion | Linaria v7 | Pigment CSS |
|------|:-----------------:|:-------:|:----------:|:-----------:|
| 运行时样式注入 | ✅ (慢) | ✅ (快于 SC) | ❌ | ❌ |
| SSR 支持 | ✅ | ✅ | ✅ | ✅ |
| 编译时提取 | ❌ | ⚠️ (部分) | ✅ | ✅ |
| React Server Components | ❌ | ❌ | ✅ | ✅ |
| 主题动态切换 | ✅ | ✅ | ⚠️ CSS 变量 | ⚠️ CSS 变量 |
| 包体积(gzip) | ~12KB | ~10KB | ~0KB | ~0KB |
| 维护状态 | 🟡 维护 | 🟡 维护 | 🟢 活跃 | 🟢 活跃 |

### 迁移路径建议

```
Styled Components / Emotion 项目
├── 小型项目 (组件 < 50)
│   └── 直接迁移至 Tailwind CSS (重写成本可控)
├── 中型项目 (组件 50-200)
│   └── 渐进式迁移: 新组件用 Tailwind，旧组件维持
├── 大型项目 (组件 > 200) / 设计系统
│   └── 迁移至 Panda CSS (Recipe 系统对应组件封装)
└── MUI 生态项目
    └── 迁移至 Pigment CSS (MUI 官方零运行时方案)
```

---

## 设计令牌 (Design Tokens) 深度

### 生态系统对比

| 工具 | W3C 标准格式 | 多平台输出 | Figma 集成 | CI/CD 友好 | 2026 状态 |
|------|:----------:|:--------:|:--------:|:----------:|:---------:|
| **Style Dictionary** | ✅ v4+ | ✅ iOS/Android/Web/JSON | ⚠️ 需插件 | ✅ | 🟢 行业标准 |
| **Tokens Studio** | ✅ | ⚠️ Figma 插件为主 | ✅ 原生 | ⚠️ 需配置 | 🟢 活跃 |
| **Cobalt UI** | ✅ | ✅ | ❌ | ✅ | 🟢 新兴 |
| **Tailwind @theme** | ⚠️ 自定义 | ❌ Web only | ❌ | ✅ | 🟢 框架内置 |
| **Panda tokens** | ⚠️ 自定义 | ❌ Web only | ❌ | ✅ | 🟢 框架内置 |

### W3C Design Tokens 标准 (DRAFT)

W3C Design Tokens Community Group 于 2024 年发布格式规范，推动跨工具互操作：

```json
{
  "$schema": "https://tokens.studio/schema.json",
  "color": {
    "brand": {
      "primary": {
        "$type": "color",
        "$value": "#3b82f6",
        "$description": "品牌主色"
      }
    }
  },
  "spacing": {
    "md": {
      "$type": "dimension",
      "$value": "16px"
    }
  }
}
```

**2026 进展**: Style Dictionary v4 原生支持 W3C 格式；Tokens Studio 插件支持双向同步；大型设计系统开始以 W3C 格式为单一数据源。

### 设计令牌工作流

```
Figma (设计)
  → Tokens Studio (提取)
  → W3C JSON (标准化)
  → Style Dictionary (转换)
  → Tailwind @theme / Panda tokens / iOS/Android (消费)
```

---

## 响应式设计演进

### 媒体查询 vs 容器查询 vs 逻辑属性

| 特性 | 媒体查询 | 容器查询 | 逻辑属性 |
|------|:--------:|:--------:|:--------:|
| 查询目标 | 视口/设备 | 容器元素 | 不适用 |
| 语法 | `@media (min-width: 768px)` | `@container (min-width: 400px)` | `inline-start`、`block-end` |
| 浏览器支持 | ✅ 全面 | ✅ 2023+ 现代浏览器 | ✅ 2022+ 现代浏览器 |
| 主要用途 | 页面级布局 | 组件级响应式 | 多语言/书写模式适配 |
| Tailwind v4 | `md:`、`lg:` | `@md:`、`@lg:` | `ms-`、`me-` (margin-inline-start/end) |

### 容器查询实战

容器查询解决了组件在不同上下文中自适配的问题：

```css
/* 原生 CSS */
.card-container { container-type: inline-size; }

@container (min-width: 400px) {
  .card { flex-direction: row; }
}
```

```html
<!-- Tailwind v4 -->
<div class="@container">
  <div class="@md:flex-row flex-col flex gap-4">
    <img class="@md:w-1/3 w-full" src="..." />
    <div class="@md:w-2/3 w-full">
      <h3>标题</h3>
      <p>内容...</p>
    </div>
  </div>
</div>
```

### 逻辑属性

逻辑属性将物理方向（top/left/right/bottom）映射为逻辑方向（inline/block + start/end），天然支持 RTL 布局：

| 物理属性 | 逻辑属性 | 说明 |
|---------|---------|------|
| `margin-left` | `margin-inline-start` | 行首间距 |
| `margin-right` | `margin-inline-end` | 行尾间距 |
| `border-top` | `border-block-start` | 块首边框 |
| `width` | `inline-size` | 行向尺寸 |
| `height` | `block-size` | 块向尺寸 |

Tailwind v4 提供 `ms-` (margin-inline-start)、`me-` (margin-inline-end)、`ps-` (padding-inline-start) 等工具类。

---

## 构建工具链

### PostCSS / Lightning CSS / Parcel CSS

| 工具 | 类型 | 构建速度 | 功能覆盖 | 生态集成 | 2026 推荐度 |
|------|------|:--------:|:--------:|:--------:|:-----------:|
| **PostCSS** | 插件生态 | 基准 | 极大 (插件无数) | 全面 | ⭐⭐⭐⭐ 稳定 |
| **Lightning CSS** | 单文件编译器 | **~10x PostCSS** | 大 (内置核心功能) | 增长中 | ⭐⭐⭐⭐⭐ 首选 |
| **Parcel CSS** | 单文件编译器 | ~8x PostCSS | 中 (已被 Lightning 吸收) | 有限 | ⭐⭐ 过时 |

### Lightning CSS 核心能力

Lightning CSS 由 Parcel 团队开发，现被 Tailwind v4 内置采用：

- **CSS 压缩**: 比 cssnano 更小、更快
- **自动前缀**: 内置 browerslist 支持
- **嵌套展开**: 原生 CSS 嵌套语法转译
- **自定义媒体**: `@custom-media` 支持
- **色彩空间**: oklch、lab、color-mix 完整支持
- **CSS 模块**: 内置 `:local` / `:global` 处理

```js
// vite.config.ts
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss()], // 内置 Lightning CSS
  css: {
    transformer: 'lightningcss', // Vite 原生支持
  },
})
```

### 构建工具选型建议

```
新项目 (2026)
├── 使用 Tailwind v4
│   └── Lightning CSS (内置，无需配置)
├── 不使用 Tailwind
│   └── Vite + Lightning CSS (Vite 6+ 原生支持)
└── 遗留 PostCSS 链
    └── 评估迁移至 Lightning CSS (功能覆盖 90%+)

大型项目 / 自定义需求
└── PostCSS (需要特定插件时保留)
```

---

## 2026 趋势与展望

### 十大趋势

| 趋势 | 描述 | 数据支撑 |
|------|------|----------|
| **Tailwind 统治巩固** | 78% 采用率，v4 CSS-first 配置成为行业标准 | State of CSS 2025, npm 下载量 |
| **CSS-in-JS 持续衰退** | 新项目采用率 <10%，维护模式项目不再推荐 | GitHub 活跃度, npm 趋势 |
| **零运行时全面崛起** | Panda CSS、Linaria、Pigment CSS 成为迁移目标 | npm 下载量同比增长 200%+ |
| **原生 CSS 复兴** | `@layer`、`@container`、`@scope`、`@property` 减少工具依赖 | caniuse 覆盖率 95%+ |
| **设计令牌标准化** | W3C Design Tokens 格式推动跨工具互操作 | Style Dictionary v4 采纳 |
| **容器查询普及** | 组件级响应式取代部分媒体查询使用场景 | Tailwind v4 一等公民支持 |
| **逻辑属性默认化** | `ms-`/`me-` 取代 `ml-`/`mr-` 成为多语言项目标准 | Tailwind v4 文档推荐 |
| **Lightning CSS 替代 PostCSS** | 在性能敏感场景成为默认选择 | Tailwind v4 内置, Vite 6+ 支持 |
| **类型安全样式** | Panda CSS 引领"样式即类型"范式 | TypeScript 项目渗透率提升 |
| **CSS 变量主题化** | 深色/浅色模式通过 CSS 变量切换，零 JS 运行时 | 主流框架全部支持 |

### 范式转移时间线

```
2015-2018: CSS-in-JS 黄金期 (Styled Components, Emotion 崛起)
2018-2021: 原子化 CSS 崛起 (Tailwind v1-v3 快速增长)
2022-2023: 零运行时探索 (Linaria, Vanilla Extract)
2024: Tailwind v4 预览 / W3C Design Tokens DRAFT
2025: Styled Components 维护模式 / Panda CSS v1 / Tailwind v4 正式发布
2026: 原子化+零运行时统治 / 原生 CSS 能力追赶 / CSS-in-JS 边缘化
```

---

## 设计令牌支持

| 框架 | W3C 令牌 | Style Dictionary | Figma 同步 | CSS 变量输出 |
|------|:--------:|:----------------:|:----------:|:------------:|
| **Tailwind v4** | ⚠️ 自定义 | ✅ 插件 | ⚠️ 第三方 | ✅ `@theme` |
| **Panda CSS** | ✅ | ✅ | ⚠️ 第三方 | ✅ |
| **Open Props** | ⚠️ | ❌ | ❌ | ✅ |
| **CSS Modules** | ❌ | ❌ | ❌ | 手动 |

---

## 性能对比

### 构建时间 (1000 组件)

| 方案 | 冷构建 | 增量构建 | HMR |
|------|:------:|:--------:|:---:|
| **Tailwind v4** | ~800ms | ~50ms | ~20ms |
| **UnoCSS** | ~200ms | ~10ms | ~5ms |
| **Panda CSS** | ~1500ms | ~100ms | ~30ms |
| **Styled Components** | ~3000ms | ~200ms | ~50ms |
| **CSS Modules** | ~500ms | ~30ms | ~15ms |

📊 来源: 社区 benchmark，2026-04

### 运行时开销

| 方案 | JS 执行 | 样式重计算 | 内存占用 |
|------|:-------:|:----------:|:--------:|
| **Tailwind v4** | 0 | 低 | 低 |
| **UnoCSS** | 0 | 低 | 低 |
| **Styled Components** | 高 | 高 | 高 |
| **Emotion** | 高 | 高 | 高 |

---

## 框架集成

| 框架 | Tailwind | UnoCSS | Panda | CSS Modules |
|------|:--------:|:------:|:-----:|:-----------:|
| **React** | ✅ | ✅ | ✅ | ✅ |
| **Vue** | ✅ | ✅ | ⚠️ | ✅ |
| **Svelte** | ✅ | ✅ | ⚠️ | ✅ |
| **Solid** | ✅ | ✅ | ⚠️ | ✅ |
| **Next.js** | ✅ 内置 | ✅ | ⚠️ | ✅ |
| **Astro** | ✅ | ✅ | ⚠️ | ✅ |

---

## 选型决策树

```
项目类型？
├── 快速原型 / MVP
│   └── Tailwind CSS (最快速度)
├── 设计系统
│   ├── 需要类型安全 → Panda CSS
│   └── 需要极速构建 → UnoCSS + 自定义预设
├── 遗留项目迁移
│   ├── CSS-in-JS 项目 → Linaria / Pigment CSS (零运行时)
│   └── 传统 CSS → Tailwind (渐进式采用)
├── 性能敏感
│   └── UnoCSS (按需生成，零浪费)
├── 全栈框架
│   └── Tailwind v4 (生态最成熟)
├── 多语言/国际化项目
│   └── Tailwind v4 (逻辑属性 ms-/me- 原生支持)
└── 设计令牌驱动
    └── Panda CSS + Style Dictionary (端到端类型安全)
```

---

## 代码示例

### Tailwind v4 (CSS-first 配置)

```css
/* index.css */
@import "tailwindcss";

@theme {
  --color-brand: #3b82f6;
  --font-sans: 'Inter', system-ui;
}
```

```html
<button class="bg-brand text-white px-4 py-2 rounded-lg hover:bg-blue-700">
  点击我
</button>
```

### Panda CSS (类型安全)

```tsx
import { css } from '../styled-system/css'

function Button() {
  return (
    <button className={css({
      bg: 'brand',
      color: 'white',
      px: '4',
      py: '2',
      rounded: 'lg',
      _hover: { bg: 'blue.700' }
    })}>
      点击我
    </button>
  )
}
```

### 原生 CSS @layer + 容器查询

```css
@layer reset, base, components, utilities;

@layer components {
  .product-card {
    container-type: inline-size;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  @container (min-width: 400px) {
    .product-card {
      flex-direction: row;
    }
  }
}
```

---

## 参考资源

- [Tailwind CSS v4 文档](https://tailwindcss.com/) 📚
- [UnoCSS 文档](https://unocss.dev/) 📚
- [Panda CSS 文档](https://panda-css.com/) 📚
- [State of CSS 2025](https://stateofcss.com/) 📊
- [Open Props](https://open-props.style/) 📚
- [W3C Design Tokens Format](https://design-tokens.github.io/) 📚
- [Style Dictionary](https://styledictionary.com/) 📚
- [Lightning CSS](https://lightningcss.dev/) 📚
- [CUBE CSS](https://cube.fyi/) 📚
- [Every Layout](https://every-layout.dev/) 📚
