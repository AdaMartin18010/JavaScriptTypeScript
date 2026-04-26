# 样式/CSS工具

CSS 和样式工具生态系统，包括 CSS 框架、CSS-in-JS 解决方案、CSS 处理器和样式系统。

---

## CSS框架

### [Tailwind CSS](https://tailwindcss.com/) ⭐ 94.3k

> A utility-first CSS framework for rapid UI development.

实用优先的 CSS 框架，通过组合原子类快速构建自定义界面。**Tailwind CSS v4 于 2025.1 发布**，是一次架构级重写，采用基于 Rust 的 Lightning CSS 引擎，构建速度提升 **100 倍（增量）/ 5 倍（完整构建）**。

**核心特性：**

- 实用优先（Utility-first）的设计哲学
- JIT（Just-in-Time）编译器，只生成使用的样式
- 深色模式、响应式断点内置支持
- 与 React、Vue、Svelte 等框架深度集成

**Tailwind CSS v4 重大更新**

| 特性 | 说明 |
|------|------|
| **Oxide / Lightning CSS 引擎** | Rust 编写的新一代 CSS 解析、转换与打包引擎，替代 PostCSS 链路，增量构建速度提升 **100x** |
| **CSS-first 配置** | 废弃 `tailwind.config.js`，配置完全迁移到 CSS：`@import "tailwindcss"` + `@theme` 块 |
| **`@utility`** | 在 CSS 中直接定义自定义 utility 类，无需 JS 配置 |
| **`@custom-variant`** | 直接在 CSS 中声明自定义变体（如 `@custom-variant --hocus (&:hover, &:focus)`） |
| **`@starting-style` variant** | 原生支持 `transition-behavior: allow-discrete` 的进入动画，解决 `display: none → block` 无过渡问题 |
| **`not-*` variant** | 否定变体，如 `not-hover:bg-red-500` |
| **容器查询原生支持** | `@container` / `@min-*` / `@max-*` 变体开箱即用，无需插件 |
| **P3 广色域色彩** | 内置 `oklch`、`display-p3` 等现代色彩空间支持 |
| **3D 变换** | 原生 `rotate-x-*`、`rotate-y-*`、`perspective-*`、`transform-3d` 等 utility |

```css
/* v4 全新配置方式：纯 CSS */
@import "tailwindcss";

@theme {
  --color-brand: #0ea5e9;
  --font-sans: "Inter", system-ui, sans-serif;
  --breakpoint-3xl: 1920px;
}

@utility content-auto {
  content-visibility: auto;
}

@custom-variant --hocus (&:hover, &:focus);
```

```bash
# v4 安装（无需 init 配置文件）
npm install -D tailwindcss@4
```

```html
<!-- 示例：v4 的 @starting-style 进入动画 -->
<div class="starting:opacity-0 opacity-100 transition-opacity duration-300">
  淡入内容
</div>

<!-- 示例：3D 变换 + P3 色彩 -->
<div class="rotate-y-12 perspective-1000 bg-[color(display-p3_0.5_0.2_0.9)]">
  3D 卡片
</div>
```

---

### [shadcn/ui](https://ui.shadcn.com/) ⭐ 82k+

> Beautifully designed components that you can copy and paste into your apps. Accessible. Customizable. Open Source.

**shadcn/ui 不是传统意义上的组件库（component library），而是可复制代码片段集合（copy-paste components / registry pattern）。**

**架构模式：**

- **无 NPM 依赖包**：组件源码通过 CLI (`npx shadcn add button`) 直接下载到项目 `components/ui/` 目录
- **完全拥有代码**：开发者拥有组件源码，可自由修改样式、行为与逻辑，无升级锁死风险
- **基于 Tailwind CSS**：所有组件样式使用 Tailwind utility class，易于主题定制
- **Radix UI / Ariakit 为基**：底层交互逻辑依赖无样式 Headless UI 库，确保可访问性 (a11y)
- **主题系统**：通过 `css-variables` 统一色彩、圆角、阴影，一键切换主题

```bash
npx shadcn@latest init
npx shadcn add button dialog dropdown-menu
```

```tsx
// 下载后的组件位于你的项目内，可随意修改
import { Button } from "@/components/ui/button";

export function Demo() {
  return <Button variant="outline" size="sm">点击我</Button>;
}
```

**适用场景**：

- 需要高度定制 UI 的中大型项目
- 不想被组件库样式锁定的团队
- 追求 Design System 与代码完全对齐的设计驱动开发 (DDD)

---

---

### [Bootstrap](https://getbootstrap.com/) ⭐ 174.1k

> The most popular HTML, CSS, and JavaScript framework for developing responsive, mobile first projects on the web.

最经典的 CSS 框架，由 Twitter 开发。提供完整的组件库、栅格系统和 JavaScript 插件。

**核心特性：**

- 丰富的预构建组件（按钮、模态框、导航等）
- 响应式 12 列栅格系统
- 内置 JavaScript 交互组件
- 庞大的主题和插件生态
- 优秀的文档和社区支持

```bash
npm install bootstrap
```

```html
<!-- 示例：Bootstrap 按钮组 -->
<div class="btn-group" role="group">
  <button type="button" class="btn btn-primary">左</button>
  <button type="button" class="btn btn-primary">中</button>
  <button type="button" class="btn btn-primary">右</button>
</div>
```

---

### [Bulma](https://bulma.io/) ⭐ 50.1k

> Modern CSS framework based on Flexbox

基于 Flexbox 的现代 CSS 框架，纯 CSS 无 JavaScript，语法简洁直观。

**核心特性：**

- 纯 CSS，无 JavaScript 依赖
- 基于 Flexbox 的现代布局
- 语义化类名，易于理解
- 模块化导入，可按需使用
- 100+ 内置 helper 类

```bash
npm install bulma
```

```html
<!-- 示例：Bulma 布局 -->
<div class="columns">
  <div class="column is-three-quarters">3/4</div>
  <div class="column">1/4</div>
</div>
```

---

### [UnoCSS](https://unocss.dev/) ⭐ 18.7k

> The instant on-demand atomic CSS engine.

即时按需原子 CSS 引擎，受 Tailwind CSS、Windi CSS 启发，但完全可定制。

**核心特性：**

- 完全按需生成，零运行时开销
- 完全可定制，无核心工具类
- 属性化模式（Attributify）支持
- 变体组（Variant Groups）简化代码
- 规则、快捷方式、主题完全可配置

```bash
npm install -D unocss
```

```ts
// uno.config.ts
import { defineConfig } from 'unocss'

export default defineConfig({
  rules: [
    ['m-1', { margin: '0.25rem' }],
  ],
})
```

```html
<!-- 示例：UnoCSS 属性化模式 -->
<div m-1 p-2 bg-blue text-white rounded>
  内容
</div>
```

---

### [Windi CSS](https://windicss.org/) ⭐ 6.5k

> Next generation utility-first CSS framework.

下一代实用优先 CSS 框架，Tailwind CSS 的替代品，**已不再积极维护**。

**⚠️ 状态：** 项目已归档，建议迁移到 UnoCSS 或 Tailwind CSS v4

**核心特性：**

- 完全兼容 Tailwind CSS
- 按需生成，无需 purge
- 更快的编译速度
- 额外的功能（变体组、属性化模式等）

---

## CSS-in-JS

### [styled-components](https://styled-components.com/) ⭐ 41.0k

> Fast, expressive styling for React. Server components, client components, streaming SSR, React Native—one API.

React 的 CSS-in-JS 标准方案，支持标签模板字符串定义组件样式。

**核心特性：**

- 组件级样式作用域
- 支持主题（Theme）系统
- 动态样式基于 props
- 自动供应商前缀
- SSR 支持

```bash
npm install styled-components
```

```jsx
import styled from 'styled-components';

const Button = styled.button`
  background: ${props => props.primary ? 'blue' : 'white'};
  color: ${props => props.primary ? 'white' : 'blue'};
  padding: 10px 20px;
  border-radius: 4px;
`;

// 使用
<Button primary>主要按钮</Button>
```

---

### [Emotion](https://emotion.sh/) ⭐ 18.0k

> CSS-in-JS library designed for high performance style composition

高性能 CSS-in-JS 库，支持字符串和对象样式，适用于 React。

**核心特性：**

- 高性能，支持缓存
- 源映射和标签支持
- 可预测的样式组合
- 支持 `css` prop
- 支持字符串和对象样式

```bash
npm install @emotion/react @emotion/styled
```

```jsx
/** @jsx jsx */
import { jsx, css } from '@emotion/react'

const style = css`
  color: hotpink;
  &:hover {
    color: darkorchid;
  }
`

<div css={style}>内容</div>
```

---

### [Linaria](https://github.com/callstack/linaria) ⭐ 12.3k

> Zero-runtime CSS in JS library

零运行时 CSS-in-JS 库，构建时将样式提取到 CSS 文件。

**核心特性：**

- 零运行时开销
- 真正的 CSS 文件输出
- 支持 CSS 嵌套和自定义属性
- 与 React、Preact 集成
- 支持动态样式

```bash
npm install @linaria/core @linaria/react
```

```jsx
import { styled } from '@linaria/react';

const Title = styled.h1`
  font-size: 24px;
  color: ${props => props.color};
`;
```

---

### [vanilla-extract](https://vanilla-extract.style/) ⭐ 10.3k

> Zero-runtime Stylesheets-in-TypeScript

零运行时 TypeScript 样式表，在构建时生成类型安全的 CSS。

**核心特性：**

- 类型安全，100% TypeScript
- 零运行时开销
- CSS 变量和主题支持
- 原子 CSS 支持
- 可与任何框架配合使用

```bash
npm install @vanilla-extract/css
```

```ts
// styles.css.ts
import { style, createTheme } from '@vanilla-extract/css';

export const [themeClass, vars] = createTheme({
  color: {
    brand: 'blue'
  }
});

export const button = style({
  backgroundColor: vars.color.brand,
  padding: '10px'
});
```

---

### [Stitches](https://stitches.dev/) ⭐ 7.8k

> [Not Actively Maintained] CSS-in-JS with near-zero runtime, SSR, multi-variant support, and a best-in-class developer experience.

高性能 CSS-in-JS 库，支持多变体，**已不再积极维护**。

**⚠️ 状态：** 项目已归档，建议考虑其他方案

**核心特性：**

- 近零运行时开销
- 变体（Variants）支持
- 服务器端渲染
- 主题支持
- 开发者体验优秀

```bash
npm install @stitches/react
```

---

## CSS 新原生 API

现代浏览器已原生支持多项此前需要 polyfill 或 JS 库实现的样式能力。

### Popover API

无需 JS 即可实现点击外部关闭的浮动元素（tooltip、dropdown、menu）。

```html
<button popovertarget="my-popover">打开菜单</button>
<div id="my-popover" popover>
  <ul>
    <li>选项 1</li>
    <li>选项 2</li>
  </ul>
</div>
```

- `popover="auto"`：自动管理焦点与点击外部关闭（只能有一个同时打开）
- `popover="manual"`：完全由 JS 控制显隐

---

### Anchor Positioning

原生 CSS 锚点定位，解决下拉菜单、tooltip 相对于触发元素的绝对定位难题。

```css
.anchor { anchor-name: --trigger; }
.tooltip {
  position-anchor: --trigger;
  position-area: bottom center;
  /* 自动处理视口边界翻转 */
  position-try-fallbacks: flip-block;
}
```

---

### `@starting-style`

解决元素从 `display: none` 变为可见时无法触发 `transition` 的历史难题（配合 `transition-behavior: allow-discrete`）。

```css
.dialog {
  opacity: 1;
  transform: scale(1);
  transition: opacity 0.3s, transform 0.3s, display 0.3s;
  transition-behavior: allow-discrete;
}

/* 进入前的起始状态 */
@starting-style {
  .dialog {
    opacity: 0;
    transform: scale(0.9);
  }
}

.dialog[open] {
  display: block;
}
```

---

### `@scope`

CSS 作用域规则，限定选择器仅在特定 DOM 子树内生效，避免全局命名冲突。

```css
@scope (.card) {
  :scope { background: white; }
  .title { font-size: 1.25rem; }
  img { border-radius: 8px; }
}
/* .title 与 img 仅在 .card 内部匹配，不影响外部同名元素 */
```

---

## CSS工具

### [PostCSS](https://postcss.org/) ⭐ 29.0k

> Transforming styles with JS plugins

使用 JavaScript 插件转换 CSS 的工具，现代 CSS 工作流的核心。

**核心特性：**

- 插件生态丰富
- 现代 CSS 转译（未来的语法）
- 代码优化和压缩
- 与构建工具集成

```bash
npm install -D postcss postcss-cli
```

```js
// postcss.config.js
module.exports = {
  plugins: [
    require('autoprefixer'),
    require('postcss-preset-env')
  ]
}
```

---

### [Autoprefixer](https://github.com/postcss/autoprefixer) ⭐ 22.6k

> Parse CSS and add vendor prefixes to rules by Can I Use

PostCSS 插件，根据 Can I Use 数据自动添加浏览器前缀。

**核心特性：**

- 自动添加浏览器前缀
- 移除过时的前缀
- 支持 Flexbox、Grid 等
- 可配置目标浏览器

```js
// postcss.config.js
module.exports = {
  plugins: [
    require('autoprefixer')({
      browsers: ['last 2 versions', '> 1%']
    })
  ]
}
```

---

### [postcss-preset-env](https://preset-env.cssdb.org/) ⭐ 1.0k

> PostCSS Tools and Plugins

将现代 CSS 转换为大多数浏览器可理解的代码。

**核心特性：**

- 支持 CSS 新特性
- 自动 polyfill
- 嵌套规则支持
- 自定义属性支持

---

### [Sass](https://sass-lang.com/) ⭐ 15.4k

> Sass makes CSS fun!

功能强大的 CSS 预处理器，支持变量、嵌套、混合等特性。

**核心特性：**

- 变量和计算
- 嵌套规则
- Mixins 和函数
- 继承
- 模块化（@use, @forward）

```scss
// 示例：Sass 变量和嵌套
$primary-color: #3498db;

.button {
  background: $primary-color;

  &:hover {
    background: darken($primary-color, 10%);
  }

  &--large {
    padding: 20px 40px;
  }
}
```

---

### [Less](https://lesscss.org/) ⭐ 17.0k

> Less. The dynamic stylesheet language.

动态样式语言，CSS 预处理器，语法类似于 CSS。

**核心特性：**

- 变量和运算
- 嵌套规则
- Mixins
- 命名空间和访问器
- 函数和运算

```less
// 示例：Less 变量和混合
@primary: #3498db;

.mixin-border-radius(@radius) {
  border-radius: @radius;
}

.button {
  color: @primary;
  .mixin-border-radius(4px);
}
```

---

### [Lightning CSS](https://lightningcss.dev/) ⭐ 7.5k

> An extremely fast CSS parser, transformer, bundler, and minifier written in Rust.

用 Rust 编写的极速 CSS 解析器、转换器、打包器和压缩器。

**核心特性：**

- 极快的处理速度
- CSS 模块支持
- 嵌套 CSS 转换
- 供应商前缀自动添加
- 代码压缩和优化
- 与 Parcel 集成

```bash
npm install lightningcss
```

---

## 样式系统

### [Theme UI](https://theme-ui.com/) ⭐ 5.4k

> Build consistent, themeable React apps based on constraint-based design principles

基于约束设计原则构建一致、可主题化的 React 应用。

**核心特性：**

- 主题规范
- 设计约束系统
- 深色模式支持
- 与 MDX 集成
- 响应式样式

```jsx
import { ThemeProvider } from 'theme-ui'

const theme = {
  colors: {
    text: '#000',
    background: '#fff',
    primary: '#07c',
  },
  fonts: {
    body: 'system-ui, sans-serif',
    heading: 'Georgia, serif',
  }
}

<ThemeProvider theme={theme}>
  <App />
</ThemeProvider>
```

---

### [Styled System](https://styled-system.com/) ⭐ 7.9k

> ⬢ Style props for rapid UI development

样式属性快速 UI 开发，通过 props 快速应用主题值。

**核心特性：**

- 样式属性 API
- 主题一致性
- 响应式样式
- 与 styled-components、emotion 配合

```jsx
import styled from 'styled-components'
import { color, space, typography } from 'styled-system'

const Box = styled.div`
  ${color}
  ${space}
  ${typography}
`

// 使用
<Box color="primary" bg="secondary" p={3} fontSize={2}>
  内容
</Box>
```

---

## 选择建议

| 场景 | 推荐方案 |
|------|----------|
| 快速原型开发 | Tailwind CSS、Bootstrap |
| 大型项目定制 | Tailwind CSS v4、UnoCSS |
| React 组件样式 | shadcn/ui + Tailwind、styled-components、Emotion |
| 零运行时开销 | Linaria、vanilla-extract |
| 遗留项目维护 | Sass、Less |
| 现代构建工具链 | Lightning CSS (Tailwind v4 内置) |
| 设计系统构建 | shadcn/ui、Theme UI、Styled System |
| 原生样式能力增强 | CSS Anchor Positioning、Popover API、@scope |

---

> 📊 **数据统计时间**：2026年4月
>
> ⭐ Stars 数据来源于 GitHub API，可能存在延迟


---

> 📦 **归档说明（2026-04-27）**
>
> 本文档与 `docs/guides/CSS_IN_JS_STYLING.md` 内容高度重叠。更详细的样式方案指南请参见 **[guides/CSS_IN_JS_STYLING.md](../guides/CSS_IN_JS_STYLING.md)**（2,100+ 行，覆盖 Tailwind v4、CSS-in-JS、原生 CSS 新特性等）。
>
> 本文档保留作为分类索引入口。
