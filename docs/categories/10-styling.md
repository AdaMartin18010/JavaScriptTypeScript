# CSS 与样式方案生态全景

> 优先级：P0 | 趋势：Tailwind CSS 统治级，CSS-in-JS 降温，零运行时方案兴起

---

## 生态概览

| 类别 | 代表方案 | 趋势 |
|------|----------|------|
| Utility-First CSS | Tailwind CSS | 统治级增长 |
| CSS-in-JS | Styled Components -> Panda CSS | 向零运行时迁移 |
| CSS 预处理器 | Sass/SCSS | 稳定使用 |
| CSS 后处理器 | PostCSS | 基础设施级 |
| CSS 框架 | Bootstrap | 逐渐被 Tailwind 替代 |
| CSS 工具 | PurgeCSS | 集成化趋势 |

---

## 1. Utility-First CSS（原子化 CSS）

### 1.1 Tailwind CSS (83k+)

| 属性 | 详情 |
|------|------|
| Stars | 83k+ |
| TS 支持 | 完整支持，官方提供 TypeScript 类型 |
| 运行时开销 | 零运行时（构建时生成） |
| 版本 | v3.x / v4.0（alpha） |

**核心特点：**
- 原子化类名：flex, pt-4, text-center, bg-blue-500
- JIT 编译器：即时生成所需样式，开发体验极佳
- 高度可配置：通过 tailwind.config.js 完全自定义设计系统
- 响应式优先：内置断点系统（sm:, md:, lg:, xl:）
- Dark Mode 支持：原生支持深色模式
- v4 新特性：基于 Rust 引擎，性能大幅提升

**生态系统：**
- Tailwind UI：官方付费组件库
- Headless UI：无样式 UI 组件
- Heroicons：配套图标库
- Tailwind CSS IntelliSense：VS Code 智能提示

**适用场景：**
- 现代 React/Vue/Angular 项目
- 需要快速原型开发
- 设计系统构建
- 团队协作开发

**链接：**
- 官网：https://tailwindcss.com
- GitHub：https://github.com/tailwindlabs/tailwindcss

---

### 1.2 Windi CSS

| 属性 | 详情 |
|------|------|
| Stars | - |
| TS 支持 | 支持 |
| 运行时开销 | 零运行时 |
| 维护状态 | **已停止维护**（2022年） |

**核心特点：**
- 从 v3.0 起停止维护，官方建议迁移至 UnoCSS
- 曾是 Tailwind 的替代方案，按需编译速度快

**迁移建议：**
```bash
# 官方迁移工具
npx @windicss/windicss-to-unocss
```

**适用场景：**
- 新项目不推荐使用
- 现有项目建议迁移到 UnoCSS

---

### 1.3 UnoCSS (17k+)

| 属性 | 详情 |
|------|------|
| Stars | 17k+ |
| TS 支持 | 原生 TypeScript 编写 |
| 运行时开销 | 零运行时 |
| 维护者 | Anthony Fu（Vue/Vite 核心团队） |

**核心特点：**
- 即时原子化 CSS：按需生成，毫秒级冷启动
- 完全可定制：基于预设（presets）的架构
- 预设生态丰富：
  - @unocss/preset-wind：兼容 Tailwind
  - @unocss/preset-mini：最小化核心
  - @unocss/preset-icons：纯 CSS 图标
  - @unocss/preset-typography：排版预设
- 属性化模式：<div m-2 p-4 bg-blue></div>
- 交互式文档：可视化规则探索

**适用场景：**
- 需要极致构建性能的项目
- 希望完全自定义原子化方案
- 图标与样式一体化需求
- Vite 项目首选

**链接：**
- 官网：https://unocss.dev
- GitHub：https://github.com/unocss/unocss

---

### 1.4 Tachyons (11k+)

| 属性 | 详情 |
|------|------|
| Stars | 11k+ |
| TS 支持 | 无官方类型定义 |
| 运行时开销 | 零运行时 |
| 诞生时间 | 2014年（老牌方案） |

**核心特点：**
- 最早的原子化 CSS 方案之一
- 功能性类名：pa2, ma3, f4, bg-blue
- 移动优先：dn（display:none）vs dib-l（large 屏幕显示）
- 色彩系统：包含丰富的配色方案
- 单一 CSS 文件：无需构建工具

**适用场景：**
- 快速原型开发
- 小型项目
- 无构建工具的静态页面
- 学习原子化 CSS 概念

**链接：**
- 官网：https://tachyons.io
- GitHub：https://github.com/tachyons-css/tachyons

---

## 2. CSS-in-JS

### 2.1 Styled Components (40k+)

| 属性 | 详情 |
|------|------|
| Stars | 40k+ |
| TS 支持 | 完整支持，社区类型定义 |
| 运行时开销 | 有运行时开销 |
| 维护者 | Callstack / styled-components 团队 |

**核心特点：**
- 标签模板语法
- 动态样式：基于 props 的样式计算
- 主题系统：内置 ThemeProvider
- CSS 预处理：支持 SCSS 语法
- 服务端渲染：支持 SSR

**性能考量：**
- 运行时生成类名和样式
- 大型应用可能有性能瓶颈
- React 18 配合并发特性有所改善

**适用场景：**
- React 项目
- 需要高度动态样式的组件
- 已有项目维护
- 新项目建议评估零运行时方案

**链接：**
- 官网：https://styled-components.com
- GitHub：https://github.com/styled-components/styled-components

---

### 2.2 Emotion (17k+)

| 属性 | 详情 |
|------|------|
| Stars | 17k+ |
| TS 支持 | 完整支持 |
| 运行时开销 | 有运行时开销（比 styled-components 轻量） |
| 性能 | 比 styled-components 更高效 |

**核心特点：**
- 高性能：优化的运行时性能
- 两种写法：css prop 模式和 styled 模式
- 源映射：更好的开发体验
- 压缩后体积小：约 4KB（gzipped）
- 测试友好：易于测试样式

**适用场景：**
- React 项目
- 性能敏感的应用
- 需要 css prop 灵活性的项目
- MUI (Material-UI) 底层依赖

**链接：**
- 官网：https://emotion.sh
- GitHub：https://github.com/emotion-js/emotion

---

### 2.3 Stitches (7k+)

| 属性 | 详情 |
|------|------|
| Stars | 7k+ |
| TS 支持 | 原生 TypeScript，类型体验极佳 |
| 运行时开销 | 轻量运行时 |
| 维护状态 | **已停止维护**（2023年） |

**核心特点：**
- 基于 Variant 的样式
- 极致的类型推断：CSS 属性、主题 token 都有类型提示
- 主题 Token 系统：设计系统友好
- 运行时性能：比 styled-components 更高效

**停止维护说明：**
- 官方建议迁移至 Panda CSS 或 Tailwind CSS

**适用场景：**
- 新项目不推荐使用
- 现有项目建议评估迁移

**链接：**
- 官网：https://stitches.dev
- GitHub：https://github.com/stitchesjs/stitches

---

### 2.4 vanilla-extract (12k+)

| 属性 | 详情 |
|------|------|
| Stars | 12k+ |
| TS 支持 | 原生 TypeScript，CSS-in-TS |
| 运行时开销 | **零运行时** |
| 维护者 | Seek（澳大利亚招聘公司） |

**核心特点：**
- 零运行时：构建时生成静态 CSS 文件
- 类型安全：CSS 属性都有 TypeScript 类型检查
- 主题系统：createTheme 函数定义主题
- Scoped Styles：自动生成唯一类名
- CSS 变量：原生 CSS 变量支持
- Sprinkles API：类似原子化 CSS 的工具

**适用场景：**
- 需要类型安全的样式系统
- 零运行时开销要求
- 设计系统构建
- 服务端渲染应用

**链接：**
- 官网：https://vanilla-extract.style
- GitHub：https://github.com/vanilla-extract-css/vanilla-extract

---

### 2.5 Linaria (12k+)

| 属性 | 详情 |
|------|------|
| Stars | 12k+ |
| TS 支持 | 支持 |
| 运行时开销 | **零运行时** |
| 底层 | 基于 Babel 转换 |

**核心特点：**
- 零运行时：构建时提取 CSS
- 类似 styled-components 的 API
- 动态样式限制：动态值转换为 CSS 变量
- CSS 提取：生成独立 CSS 文件
- 构建工具集成：支持 Webpack、Vite、Rollup

**适用场景：**
- 从 styled-components 迁移的零运行时方案
- 需要零运行时但需要 CSS-in-JS 体验
- React 项目

**链接：**
- 官网：https://linaria.dev
- GitHub：https://github.com/callstack/linaria

---

### 2.6 Panda CSS (6k+)

| 属性 | 详情 |
|------|------|
| Stars | 6k+ |
| TS 支持 | 原生 TypeScript，类型体验极佳 |
| 运行时开销 | **零运行时** |
| 维护者 | Chakra UI 团队 |

**核心特点：**
- 零运行时：构建时生成静态 CSS
- 极佳的类型体验：类型提示无处不在
- 类 Stitches API：继承了 Stitches 的优秀设计
- CSS 属性对象：<div className={css({ bg: 'red.300', p: '4' })} />
- Recipe System：组件变体系统
- PostCSS 集成：与 PostCSS 生态兼容

**适用场景：**
- 新项目首选 CSS-in-JS 方案
- 从 Stitches 迁移的理想选择
- 需要类型安全 + 零运行时
- 设计系统开发

**链接：**
- 官网：https://panda-css.com
- GitHub：https://github.com/chakra-ui/panda

---

## 3. CSS 预处理器

### 3.1 Sass/SCSS (15k+)

| 属性 | 详情 |
|------|------|
| Stars | 15k+（Dart Sass 仓库） |
| TS 支持 | 通过类型定义 |
| 运行时开销 | 编译时处理 |
| 语法 | SCSS（推荐）/ Sass（缩进式） |

**核心特点：**
- 历史最悠久：2006年诞生，生态成熟
- 功能丰富：变量、嵌套、混合、继承、条件/循环
- 函数库：丰富的内置函数
- 模块系统：@use 替代 @import（现代方案）

**适用场景：**
- 大型项目样式系统
- 需要复杂样式逻辑
- 团队熟悉 CSS 预处理器
- 非 React 项目

**链接：**
- 官网：https://sass-lang.com
- GitHub：https://github.com/sass/dart-sass

---

### 3.2 Less

| 属性 | 详情 |
|------|------|
| Stars | 17k+ |
| TS 支持 | 通过类型定义 |
| 运行时开销 | 编译时处理 |
| 诞生时间 | 2009年 |

**核心特点：**
- JavaScript 编写：易于在 Node.js 环境运行
- 类 Sass 语法：变量、嵌套、混合等
- 客户端编译：可直接在浏览器运行（开发用）
- 历史原因：Ant Design 早期使用

**适用场景：**
- 历史项目维护
- Ant Design 项目（传统）

**链接：**
- 官网：https://lesscss.org
- GitHub：https://github.com/less/less.js

---

### 3.3 Stylus

| 属性 | 详情 |
|------|------|
| Stars | 11k+ |
| TS 支持 | 社区类型定义 |
| 运行时开销 | 编译时处理 |
| 诞生时间 | 2010年 |

**核心特点：**
- 极简语法：可选括号、分号、冒号
- 灵活性高：语法自由度大
- JavaScript 编写：Node.js 原生
- 功能丰富：内置函数、哈希对象等

**适用场景：**
- 喜欢极简语法的开发者
- 历史项目维护
- 新项目推荐使用 Sass

**链接：**
- 官网：https://stylus-lang.com
- GitHub：https://github.com/stylus/stylus

---

## 4. CSS 后处理器

### 4.1 PostCSS (28k+)

| 属性 | 详情 |
|------|------|
| Stars | 28k+ |
| TS 支持 | 官方类型定义 |
| 运行时开销 | 构建时处理 |
| 架构 | 插件化系统 |

**核心特点：**
- 插件化架构：超过 200 个官方/社区插件
- 用途广泛：添加浏览器前缀、未来 CSS 语法、CSS 优化
- 高性能：基于 JavaScript 的快速转换
- 生态丰富：与所有构建工具集成

**常用插件：**
- autoprefixer：添加浏览器前缀
- postcss-preset-env：未来 CSS 语法
- cssnano：CSS 优化压缩

**适用场景：**
- 所有现代前端项目的标配
- 需要处理 CSS 的构建流程
- Tailwind CSS 项目必需

**链接：**
- 官网：https://postcss.org
- GitHub：https://github.com/postcss/postcss

---

### 4.2 Autoprefixer

| 属性 | 详情 |
|------|------|
| Stars | 23k+（独立仓库） |
| TS 支持 | 支持 |
| 运行时开销 | 构建时处理 |
| 定位 | PostCSS 插件 |

**核心特点：**
- 自动添加浏览器前缀：-webkit-, -moz-, -ms-
- 基于 Can I Use：根据目标浏览器自动决策
- 纯 CSS：不修改代码逻辑
- 持续更新：跟随浏览器支持变化

**适用场景：**
- 所有需要兼容多浏览器的项目
- 现代 CSS 特性的安全使用

**链接：**
- GitHub：https://github.com/postcss/autoprefixer

---

### 4.3 cssnano

| 属性 | 详情 |
|------|------|
| Stars | 包含在 PostCSS 生态 |
| TS 支持 | 支持 |
| 运行时开销 | 构建时处理 |
| 定位 | PostCSS 插件 |

**核心特点：**
- CSS 压缩优化：删除空格、注释
- 高级优化：合并重复规则、优化颜色值
- Preset 系统：default, advanced, lite
- 安全优化：不会破坏 CSS 功能

**适用场景：**
- 生产环境 CSS 优化
- 减小 CSS 文件体积

**链接：**
- 官网：https://cssnano.co
- GitHub：https://github.com/cssnano/cssnano

---

## 5. CSS 框架

### 5.1 Bootstrap (167k+)

| 属性 | 详情 |
|------|------|
| Stars | 167k+ |
| TS 支持 | 社区类型定义 |
| 运行时开销 | 纯 CSS + 可选 JS |
| 诞生时间 | 2011年 |

**核心特点：**
- 历史最悠久：现代响应式框架的鼻祖
- 组件丰富：按钮、卡片、导航、模态框等
- 网格系统：经典的 12 列网格
- 主题系统：通过 Sass 变量定制
- JS 组件：基于 Popper.js 的交互组件

**版本变化：**
- Bootstrap 4：Flexbox 布局
- Bootstrap 5：移除 jQuery 依赖，原生 JavaScript

**适用场景：**
- 快速原型开发
- 后台管理系统
- 团队不熟悉 Tailwind
- 需要开箱即用的组件

**链接：**
- 官网：https://getbootstrap.com
- GitHub：https://github.com/twbs/bootstrap

---

### 5.2 Bulma (49k+)

| 属性 | 详情 |
|------|------|
| Stars | 49k+ |
| TS 支持 | 社区类型定义 |
| 运行时开销 | 纯 CSS |
| 诞生时间 | 2016年 |

**核心特点：**
- 纯 CSS：无 JavaScript 依赖
- Flexbox 网格：现代布局系统
- 简洁的类名：.button, .card, .modal
- 内置主题：多种配色方案
- 响应式优先：移动优先设计

**适用场景：**
- 不需要 JS 组件的项目
- 喜欢简洁语义化类名
- 快速原型开发

**链接：**
- 官网：https://bulma.io
- GitHub：https://github.com/jgthms/bulma

---

### 5.3 Foundation

| 属性 | 详情 |
|------|------|
| Stars | 30k+ |
| TS 支持 | 社区类型定义 |
| 运行时开销 | CSS + JS |
| 维护者 | ZURB |

**核心特点：**
- 移动优先：响应式设计
- 企业级：强调可访问性和性能
- 模块化：按需加载组件
- 高级功能：XY 网格、Motion UI 动画

**适用场景：**
- 企业级应用
- 强调可访问性的项目
- 需要丰富交互功能

**链接：**
- 官网：https://get.foundation
- GitHub：https://github.com/foundation/foundation-sites

---

## 6. CSS 工具

### 6.1 PurgeCSS

| 属性 | 详情 |
|------|------|
| Stars | 9k+ |
| TS 支持 | 支持 |
| 运行时开销 | 构建时处理 |
| 定位 | 未使用 CSS 移除工具 |

**核心特点：**
- 移除未使用的 CSS：分析 HTML/JS 文件
- 大幅减小 CSS 体积：可减少 90%+ 体积
- 灵活配置：白名单、提取器模式
- 集成友好：PostCSS 插件、Webpack 插件等

**Tailwind 集成：**
Tailwind JIT 内置了 PurgeCSS 功能，通过 content 配置自动优化。

**适用场景：**
- 使用大型 CSS 框架时优化体积
- 生产环境必用
- 与 Tailwind 配合使用

**链接：**
- 官网：https://purgecss.com
- GitHub：https://github.com/FullHuman/purgecss

---

## 生态趋势总结

### 2024-2025 关键趋势

| 趋势 | 说明 |
|------|------|
| Tailwind 统治级 | 成为现代前端默认选择 |
| 零运行时兴起 | Panda CSS, vanilla-extract 崛起 |
| CSS-in-JS 降温 | styled-components, Emotion 增长放缓 |
| 预处理器稳定 | Sass 仍是大型项目首选 |
| 构建时优化 | 性能优先的样式方案 |
| 类型安全 | TypeScript 集成成为标配 |

### 技术选型建议

**新项目：**
- 优先选择 Tailwind CSS 或 UnoCSS
- 需要 CSS-in-JS 时选择 Panda CSS 或 vanilla-extract

**现有项目：**
- styled-components/Emotion 可继续维护
- 考虑评估迁移到零运行时方案

**避免使用：**
- Windi CSS（已停止维护）
- Stitches（已停止维护）

---

## 统计信息

| 类别 | 方案数 | 总 Stars |
|------|--------|----------|
| Utility-First CSS | 4 | 111k+ |
| CSS-in-JS | 6 | 94k+ |
| CSS 预处理器 | 3 | 43k+ |
| CSS 后处理器 | 3 | 51k+ |
| CSS 框架 | 3 | 246k+ |
| CSS 工具 | 1 | 9k+ |
| **总计** | **20** | **554k+** |

---

*文档创建时间：2026年4月 | 维护状态：活跃*
