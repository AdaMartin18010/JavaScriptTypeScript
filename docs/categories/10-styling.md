# 样式/CSS工具

CSS 和样式工具生态系统，包括 CSS 框架、CSS-in-JS 解决方案、CSS 处理器和样式系统。

---

## CSS框架

### [Tailwind CSS](https://tailwindcss.com/) ⭐ 94.3k

> A utility-first CSS framework for rapid UI development.

实用优先的 CSS 框架，通过组合原子类快速构建自定义界面。Tailwind v4 于 2025 年发布，采用基于 Rust 的 CSS 引擎，构建速度提升 10 倍。

**核心特性：**
- 实用优先（Utility-first）的设计哲学
- JIT（Just-in-Time）编译器，只生成使用的样式
- 高度可配置的设计系统
- 深色模式、响应式断点内置支持
- 与 React、Vue、Svelte 等框架深度集成

```bash
npm install -D tailwindcss
npx tailwindcss init
```

```html
<!-- 示例：使用 Tailwind 构建卡片 -->
<div class="max-w-sm rounded overflow-hidden shadow-lg bg-white">
  <img class="w-full" src="/img/card-top.jpg" alt="Sunset">
  <div class="px-6 py-4">
    <div class="font-bold text-xl mb-2">标题</div>
    <p class="text-gray-700 text-base">
      卡片内容描述...
    </p>
  </div>
</div>
```

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
| 大型项目定制 | Tailwind CSS、UnoCSS |
| React 组件样式 | styled-components、Emotion |
| 零运行时开销 | Linaria、vanilla-extract |
| 遗留项目维护 | Sass、Less |
| 现代构建工具链 | PostCSS + Lightning CSS |
| 设计系统构建 | Theme UI、Styled System |

---

> 📊 **数据统计时间**：2025年4月
> 
> ⭐ Stars 数据来源于 GitHub API，可能存在延迟
