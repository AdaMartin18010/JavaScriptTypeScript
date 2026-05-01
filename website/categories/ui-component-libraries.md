---
title: UI 组件库
description: 2025-2026 年 JavaScript/TypeScript UI 组件库完整生态指南，覆盖 Headless 原语、完整组件库、Vue 生态与跨框架方案
---

## 🧪 关联代码实验室

> **1** 个关联模块 · 平均成熟度：**🌳**

| 模块 | 成熟度 | 实现文件 | 测试文件 |
|------|--------|----------|----------|
| [51-ui-components](../../jsts-code-lab/51-ui-components/) | 🌳 | 6 | 6 |

> 用于构建用户界面的组件库和 UI 框架。本文档基于 GitHub Stars、npm 下载量、TypeScript 支持度、主题定制能力与无障碍（a11y）支持五大维度进行深度评估。

---

## 一、Headless UI 基础层

Headless UI 是指**提供完整交互逻辑与无障碍支持，但不提供默认样式**的 UI 原语（Primitives）。它们是现代组件栈的基石，允许开发者在保留完全样式控制权的同时，不重新发明复杂的键盘导航、焦点管理、屏幕阅读器适配等逻辑。

### 1.1 四大 Headless 原语对比

| 库名 | Stars | 周下载量 | 框架支持 | TS 支持 | 定位 | 官网 |
|------|-------|----------|----------|---------|------|------|
| **Radix UI** | 20k⭐ | ~4,200,000 | React | ⭐⭐⭐⭐⭐ | 低层 UI 原语，粒度最细 | [radix-ui.com](https://www.radix-ui.com) |
| **Headless UI** | 28k⭐ | ~1,500,000 | React, Vue | ⭐⭐⭐⭐⭐ | Tailwind Labs 官方，高阶组件 | [headlessui.com](https://headlessui.com) |
| **Ark UI** | 5k⭐ | ~180,000 | React, Vue, Solid, Svelte | ⭐⭐⭐⭐⭐ | Chakra 团队出品，多框架统一 API | [ark-ui.com](https://ark-ui.com) |
| **shadcn/ui 底层** | — | — | React | ⭐⭐⭐⭐⭐ | Radix UI + Tailwind CSS 的集成范式 | [ui.shadcn.com](https://ui.shadcn.com) |

#### Radix UI（React 生态的「基础设施」）

Radix UI 由 WorkOS 团队维护，是目前 React 生态中最被广泛依赖的 Headless 原语层。shadcn/ui、Tamagui、Park UI 等知名项目均构建于 Radix Primitives 之上。

- **核心特点**：将每个交互模式拆解为极细粒度的子组件（如 `Dialog.Trigger`、`Dialog.Portal`、`Dialog.Overlay`），提供近乎无限的组合能力。
- **无障碍**：完整遵循 WAI-ARIA 设计模式，内置焦点陷阱、键盘导航（Escape 关闭、Tab 循环）、屏幕阅读器播报。
- **TS 体验**：类型推导极致精准，支持 `asChild` 模式将行为无缝透传至自定义元素。
- **生态位**：适合**设计系统团队**或需要从零构建高度定制化组件库的项目。

```bash
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu
```

#### Headless UI（Tailwind 生态的官方搭档）

由 Tailwind Labs 开发，与 Tailwind CSS 设计理念高度一致：「只提供逻辑，绝不假设样式」。

- **核心特点**：组件 API 更上层，开箱即用程度高于 Radix，但定制自由度稍低。提供 `Transition` 组件处理进入/离开动画。
- **框架支持**：同时维护 React 与 Vue 版本，API 设计保持框架习惯用法。
- **生态位**：适合**已有 Tailwind CSS 项目**快速搭建 Modal、Dropdown、Tabs 等常见交互组件。

```bash
npm install @headlessui/react
```

#### Ark UI（多框架统一的野心）

Chakra UI 团队 2023 年推出的多框架 Headless 库，底层基于 Zag.js（状态机驱动的 UI 逻辑引擎）。

- **核心特点**：一套 Zag.js 状态机，通过框架适配层输出 React/Vue/Solid/Svelte 组件，保证跨框架行为一致性。
- **优势**：对于需要**跨技术栈统一设计系统**的大型组织极具吸引力。
- **劣势**：社区规模尚小，部分组件成熟度不及 Radix。
- **生态位**：大型企业的跨框架设计系统底层。

```bash
npm install @ark-ui/react
```

---

## 二、完整 React 组件库

### 2.1 主流库深度数据对比

| 库名 | Stars | 周下载量 | 框架支持 | TS 支持 | 主题系统 | 包体积(gzip) | 官网 |
|------|-------|----------|----------|---------|----------|--------------|------|
| **shadcn/ui** | 85k⭐ | — | React | ⭐⭐⭐⭐⭐ | CSS 变量 + Tailwind | 零运行时 | [ui.shadcn.com](https://ui.shadcn.com) |
| **@mui/material v6** | 96k⭐ | ~8,700,000 | React | ⭐⭐⭐⭐⭐ | CSS-in-JS (Emotion) / CSS 变量 | ~300KB+ | [mui.com](https://mui.com) |
| **antd v5** | 94k⭐ | ~3,000,000 | React | ⭐⭐⭐⭐⭐ | Less + CSS 变量 | ~500KB+ | [ant.design](https://ant.design) |
| **Chakra UI v3** | 40k⭐ | ~1,800,000 | React | ⭐⭐⭐⭐⭐ | CSS 变量 + Panda CSS | ~100KB | [chakra-ui.com](https://chakra-ui.com) |
| **Next UI v2** | 24k⭐ | ~420,000 | React | ⭐⭐⭐⭐⭐ | Tailwind CSS 插件 | ~80KB | [nextui.org](https://nextui.org) |
| **Mantine v7** | 19k⭐ | ~380,000 | React | ⭐⭐⭐⭐⭐ | CSS 变量 + PostCSS | ~100KB | [mantine.dev](https://mantine.dev) |

> 数据来源：GitHub API、npm registry API，统计截至 2026 年 4 月。shadcn/ui 无 npm 包，故无下载量统计。

### 2.2 shadcn/ui 专题分析：为什么它改变了生态

shadcn/ui 并非传统意义上的「npm 包」，而是一种 **Copy-paste 组件集合 + CLI 分发机制**。它的崛起标志着前端 UI 工程从「依赖第三方黑盒」向「拥有并掌控每一行 UI 代码」的范式转移。

#### 核心创新点

| 维度 | 传统组件库 | shadcn/ui |
|------|-----------|-----------|
| **分发方式** | `npm install` 黑盒包 | `npx shadcn add button` 将源码直接写入项目 |
| **运行时依赖** | 大（组件逻辑 + 样式引擎） | 零（仅依赖 Radix + Tailwind） |
| **样式定制** | 覆盖主题变量 / 深度选择器 | 直接修改 Tailwind class，所见即所得 |
| **升级策略** | semver 升级可能引发 Breaking Change | 开发者完全控制代码，按需手动同步官方更新 |
| **包体积** | 不可控（tree-shaking 有限） | 只打包实际使用的组件 |

#### 为什么它成功了？

1. **Tailwind CSS 的普及为前提**：2023-2025 年 Tailwind 已成为 React 项目事实标准，shadcn/ui 将「原子化 CSS + 预置交互逻辑」完美结合。
2. **设计系统民主化**：无需专门的 DesignOps 团队，中小团队也能快速搭建出具备大厂水准的 UI。
3. **可维护性幻觉的破除**：传统组件库看似「不用管实现」，但一旦需要深度定制（如修改 DatePicker 的日期算法），往往比直接拥有源码更痛苦。
4. **Vercel 与 Next.js 生态的助推**：shadcn 与 Next.js App Router、Server Components 天然契合，成为新一代全栈项目的默认选择。

```bash
# 初始化 shadcn/ui
npx shadcn@latest init

# 添加组件（代码将出现在你的项目 components/ui/ 目录）
npx shadcn add button card dialog
```

#### 局限与争议

- **维护负担**：组件代码存在于项目内部，Radix UI 或 Tailwind 升级时，需要开发者手动处理兼容性问题。
- **团队规范挑战**：由于每个项目都可以自由修改组件，跨项目的一致性需要严格的内部设计令牌（Design Tokens）规范来约束。
- **不适合快速 POC**：如果需要 10 分钟内搭出完整后台原型，antd 或 MUI 仍是更快选择。

### 2.3 MUI v6 与 Ant Design 5：企业级双雄

**MUI v6**（2024 年发布）完成了从 Emotion CSS-in-JS 向 **CSS 变量 + 零运行时样式方案** 的战略转型：

- 引入 `pigment-css` 实验性构建时 CSS-in-JS 方案，解决 RSC（React Server Components）兼容性问题。
- 保留 `@mui/material` 的完整 API 兼容性，降低升级成本。
- Material Design 3（You）设计规范全面落地，视觉更加现代。

**Ant Design 5** 继续巩固中后台统治地位：

- 设计令牌（Design Token）体系最为完善，支持全局/组件级/局部三级主题定制。
- 配套生态（ProComponents、AntV 图表、umi 框架）形成闭环。
- 阿里巴巴内部海量项目验证，稳定性无可置疑。
- 劣势：包体积极大，默认视觉「后台感」强烈，用户端（C 端）适配成本高。

### 2.4 Chakra UI v3 的进化

Chakra UI v3（2024 年末发布）是该项目历史上最大的一次架构重构：

- **底层迁移**：从 Emotion 迁移至 **Panda CSS**（构建时原子化 CSS 生成器），彻底消除运行时开销。
- **样式即属性（Style Props）保留**：`bg="blue.500"` 等熟悉的 API 不变，但构建产物变为静态 CSS。
- **Ark UI 集成**：部分组件底层开始共享 Ark UI / Zag.js 状态机，为多框架战略铺垫。

---

## 三、Vue UI 组件库生态

Vue 生态在 2025-2026 年呈现出「Element Plus 守成、PrimeVue 进取、Nuxt UI 崛起」的格局。

### 3.1 主流库深度数据对比

| 库名 | Stars | 周下载量 | Vue 版本 | TS 支持 | 主题系统 | 官网 |
|------|-------|----------|----------|---------|----------|------|
| **Element Plus** | 25k⭐ | ~800,000 | Vue 3 | ⭐⭐⭐⭐⭐ | SCSS + CSS 变量 | [element-plus.org](https://element-plus.org) |
| **Vuetify v3** | 39k⭐ | ~600,000 | Vue 3 | ⭐⭐⭐⭐⭐ | SASS + CSS 变量 | [vuetifyjs.com](https://vuetifyjs.com) |
| **PrimeVue v4** | 14k⭐ | ~300,000 | Vue 3 | ⭐⭐⭐⭐⭐ | CSS 变量 + 主题预设 | [primevue.org](https://primevue.org) |
| **Nuxt UI v3** | 6k⭐ | ~150,000 | Vue 3 / Nuxt | ⭐⭐⭐⭐⭐ | Tailwind CSS + App Config | [ui.nuxt.com](https://ui.nuxt.com) |
| **Ant Design Vue** | 19k⭐ | ~200,000 | Vue 3 | ⭐⭐⭐⭐⭐ | Less + CSS 变量 | [antdv.com](https://www.antdv.com) |
| **Naive UI** | 16k⭐ | ~120,000 | Vue 3 | ⭐⭐⭐⭐⭐ | CSS-in-JS (Vue 版本) | [naiveui.com](https://www.naiveui.com) |

> 数据来源：GitHub API、npm registry API，统计截至 2026 年 4 月。

### 3.2 各库定位与选型要点

**Element Plus**：Vue 3 桌面端组件库的「安全牌」。从 Element UI 迁移路径成熟，中文文档完善，国内后台系统首选。组件数量超过 80 个，表单/表格/树形控件等企业级功能极其完备。

**Vuetify**：Material Design 在 Vue 世界的官方代言人。v3 版本全面支持 Vue 3 和 Vite，提供丰富的布局系统（Grid、Spacing、Elevation）和主题定制工具。适合需要严格遵循 Material Design 规范的项目。

**PrimeVue**：被低估的全能型选手。提供 Material、Bootstrap、Aura 多套主题预设，组件丰富度不亚于 Element Plus，且官方同时维护 PrimeReact、PrimeNG，适合**跨前端框架统一 UI** 的场景。

**Nuxt UI v3**：Nuxt Labs 官方出品，与 Nuxt 3/4 深度集成。基于 Tailwind CSS 和 Headless UI 理念，采用 App Config 进行主题配置。是**Nuxt 全栈项目**的首选 UI 方案，Server Components 支持良好。

**Naive UI**：图森未来出品，采用 Vue 3 的 CSS-in-JS 方案（`css-render`），支持完全的类型安全主题定制。风格现代，但社区规模相对较小。

---

## 四、跨框架 Headless 解决方案：TanStack 家族

TanStack 由 Tanner Linsley 创建，提供了一系列**框架无关（Framework-Agnostic）的核心逻辑层**，上层通过适配器包装为 React/Vue/Svelte/Solid 组件。

### 4.1 TanStack 三大 UI 原语

| 库名 | Stars | 周下载量 | 支持框架 | TS 支持 | 定位 | 官网 |
|------|-------|----------|----------|---------|------|------|
| **@tanstack/table** | 12k⭐ | ~1,200,000 | React, Vue, Svelte, Solid | ⭐⭐⭐⭐⭐ | Headless 表格与数据网格 | [tanstack.com/table](https://tanstack.com/table) |
| **@tanstack/virtual** | 6k⭐ | ~800,000 | React, Vue, Svelte, Solid | ⭐⭐⭐⭐⭐ | 虚拟滚动（长列表/表格） | [tanstack.com/virtual](https://tanstack.com/virtual) |
| **@tanstack/form** | 4k⭐ | ~180,000 | React, Vue, Svelte, Solid | ⭐⭐⭐⭐⭐ | 类型安全表单状态管理 | [tanstack.com/form](https://tanstack.com/form) |

> 数据来源：GitHub API、npm registry API。周下载量为核心包（@tanstack/react-table 等）汇总估算，统计截至 2026 年 4 月。

#### TanStack Table

从 React Table v7 演进而来，v8 彻底重构为框架无关核心。它只负责**表格状态管理**（排序、过滤、分页、分组、展开），渲染完全交给开发者。

```tsx
import { useReactTable, getCoreRowModel } from '@tanstack/react-table';

const table = useReactTable({
  data,
  columns,
  getCoreRowModel: getCoreRowModel(),
});

// 渲染层完全自定义：可用 div、table、甚至 Canvas
```

#### TanStack Virtual

虚拟化领域的「瑞士军刀」。支持窗口化（Window Virtualization）、网格虚拟化、动态高度测量。与 Table 结合可处理百万级数据表格。

#### TanStack Form

2024 年正式 GA，主打**类型安全**和**零依赖**。与 React Hook Form 相比，TanStack Form 的跨框架能力是其最大差异化优势。

---

## 五、CSS 架构对比：CSS-in-JS 衰退 vs CSS 变量/原子化兴起

2023-2026 年是前端样式架构的分水岭。以 styled-components 和 Emotion 为代表的**运行时 CSS-in-JS 方案正在明显衰退**，而以 Tailwind CSS、Panda CSS、CSS 变量为代表的**构建时原子化 + 设计令牌**方案成为主流。

### 5.1 架构演进时间线

| 时期 | 主导方案 | 代表技术 | 驱动力 |
|------|---------|----------|--------|
| 2015-2018 | CSS Modules | `css-loader` | 组件级作用域 |
| 2018-2022 | 运行时 CSS-in-JS | styled-components, Emotion, Stitches | 动态主题、JS 逻辑驱动样式 |
| 2022-2024 | 原子化 CSS | Tailwind CSS, Windi CSS | 包体积优化、开发效率 |
| 2024-2026 | 构建时样式 + CSS 变量 | Tailwind v4, Panda CSS, Pigment CSS | RSC 兼容、零运行时、设计令牌 |

### 5.2 运行时 CSS-in-JS 为何衰退？

1. **React Server Components（RSC）不兼容**：运行时 CSS-in-JS 需要在客户端执行 `<style>` 标签注入，与 Server Components 的「零客户端 JS」理念冲突。
2. **性能瓶颈**：大型应用在 hydration 阶段需要序列化和反序列化样式规则，增加主线程负担。
3. **包体积**：styled-components 和 Emotion 的运行时本身增加 ~10-20KB gzip。
4. **缓存效率**：动态生成的类名难以利用浏览器缓存和 CDN 边缘缓存。

### 5.3 各组件库的样式架构现状

| 组件库 | 2022 年架构 | 2025-2026 年架构 | 迁移策略 |
|--------|------------|-----------------|---------|
| **shadcn/ui** | — | Tailwind CSS + CSS 变量 | 原生零运行时 |
| **MUI** | Emotion (运行时) | CSS 变量 + Pigment CSS (实验性) | 渐进式迁移 |
| **Chakra UI** | Emotion (运行时) | Panda CSS (构建时原子化) | v3 彻底重构 |
| **Ant Design** | Less (构建时) | CSS 变量 + Less | 增强 CSS 变量覆盖 |
| **Element Plus** | SCSS | SCSS + CSS 变量 | 增强 CSS 变量覆盖 |
| **Nuxt UI** | — | Tailwind CSS + App Config | 原生零运行时 |

### 5.4 当前最佳实践

- **新项目**：优先选择基于 Tailwind CSS 或 Panda CSS 的组件库（shadcn/ui、Nuxt UI、Chakra v3）。
- **需要深度动态主题**：使用 CSS 变量（Custom Properties）作为设计令牌载体，而非 JS 运行时对象。
- **遗留项目迁移**：若使用 styled-components/Emotion，可逐步将静态样式迁移至 Tailwind，保留动态样式在 JS 中处理。

---

## 六、无障碍（a11y）支持对比

无障碍支持已从「加分项」变为**企业级组件库的准入门槛**。2025 年欧美多国 Web 无障碍法规（如欧盟 EAA、美国 ADA）生效，推动组件库全面强化 a11y。

### 6.1 无障碍能力评估矩阵

| 组件库 | WAI-ARIA 覆盖 | 键盘导航 | 焦点管理 | 屏幕阅读器测试 | 减少动画 | 色彩对比度 |
|--------|--------------|----------|----------|---------------|----------|-----------|
| **Radix UI** | ✅ 完整 | ✅ 完整 | ✅ 焦点陷阱 | ✅ 官方测试 | ✅ 内置 | 开发者负责 |
| **Headless UI** | ✅ 完整 | ✅ 完整 | ✅ 焦点陷阱 | ✅ 官方测试 | ✅ 内置 | 开发者负责 |
| **Ark UI** | ✅ 完整 | ✅ 完整 | ✅ 焦点陷阱 | ✅ 官方测试 | ✅ 内置 | 开发者负责 |
| **shadcn/ui** | ✅（继承 Radix） | ✅ | ✅ | ✅ | ✅ | 开发者负责 |
| **MUI v6** | ✅ 完整 | ✅ 完整 | ✅ | ✅ 官方测试 | ✅ `prefers-reduced-motion` | 默认通过 WCAG AA |
| **Ant Design 5** | ✅ 完整 | ✅ 完整 | ✅ | ⚠️ 社区测试 | ✅ | 默认通过 WCAG AA |
| **Chakra UI v3** | ✅ 完整 | ✅ 完整 | ✅ | ✅ 官方测试 | ✅ 内置 | 默认通过 WCAG AA |
| **Element Plus** | ✅ 较完整 | ✅ | ⚠️ 部分组件 | ⚠️ 社区测试 | ⚠️ 需手动 | 开发者负责 |
| **Vuetify v3** | ✅ 较完整 | ✅ | ⚠️ 部分组件 | ⚠️ 社区测试 | ✅ | 默认通过 WCAG AA |

### 6.2 关键无障碍指标说明

- **WAI-ARIA 覆盖**：是否遵循 W3C 的 ARIA 设计模式（如 `role="dialog"`、`aria-expanded`、`aria-live`）。
- **焦点管理（Focus Management）**：Modal 打开时是否正确将焦点移入、关闭时是否归还焦点；焦点是否在可交互元素间循环。
- **屏幕阅读器**：是否通过 NVDA、JAWS、VoiceOver 实测验证。
- **减少动画**：是否响应 `prefers-reduced-motion` 媒体查询，为眩晕敏感用户提供无动画模式。

### 6.3 选型建议

- **对 a11y 有强合规要求**（金融、医疗、政府）：优先选择 **Radix UI / Headless UI** 自建，或 **MUI / Chakra UI** 完整库，确保可控和可测试。
- **Vue 项目**：Element Plus 和 Vuetify 的 a11y 支持已达到可用水平，但复杂交互（如 Tree、Table）仍需手动补充 `aria-*` 属性。
- **永远不要完全信任「默认无障碍」**：即使使用 Radix UI，颜色对比度、表单错误提示关联（`aria-describedby`）仍需要开发者正确配置。

---

## 七、选型决策树

### 7.1 按项目类型决策

```
┌─────────────────────────────────────────────────────────────┐
│                    开始 UI 组件库选型                         │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
        ┌─────────┐    ┌──────────┐    ┌──────────┐
        │ Admin   │    │ 用户端   │    │ 设计系统 │
        │ 后台    │    │ C 端/B端 │    │ DesignSys│
        └────┬────┘    └────┬─────┘    └────┬─────┘
             │              │               │
    ┌────────┴────────┐    │        ┌──────┴──────┐
    ▼                 ▼    ▼        ▼             ▼
┌─────────┐      ┌─────────┐   ┌─────────┐  ┌──────────┐
│ 要快速  │      │ 要定制  │   │ 要跨框架│  │ 要单框架 │
│ 出原型？│      │ 化品牌？│   │ 支持？  │  │ 深度整合？│
└────┬────┘      └────┬────┘   └────┬────┘  └────┬─────┘
     │                │             │            │
   是 ▼             是 ▼          是 ▼         是 ▼
┌─────────┐    ┌──────────┐   ┌─────────┐  ┌──────────┐
│ antd    │    │shadcn/ui │   │ Ark UI  │  │ Radix UI │
│ 或 MUI  │    │+ Tailwind│   │+ Panda  │  │+ Tokens  │
└─────────┘    └──────────┘   └─────────┘  └──────────┘
     │                │             │            │
    否 ▼             否 ▼          否 ▼         否 ▼
┌─────────┐    ┌──────────┐   ┌─────────┐  ┌──────────┐
│MUI v6   │    │Mantine   │   │ shadcn  │  │HeadlessUI│
│(长期维护)│   │或 Chakra │   │/ Chakra │  │+ Tailwind│
└─────────┘    └──────────┘   └─────────┘  └──────────┘
```

### 7.2 按技术栈快速推荐

#### React 项目

| 场景 | 推荐方案 | 理由 |
|------|---------|------|
| 快速搭建企业后台 | **Ant Design 5** | 组件最全、中文生态最强、后台模板丰富 |
| 中大型长期维护应用 | **MUI v6** | 生态成熟、TypeScript 支持完善、企业级支持可选 |
| 高度定制化品牌视觉 | **shadcn/ui** | 拥有源码、Tailwind 无限定制、无运行时负担 |
| 现代极简风格 + 开发体验 | **Chakra UI v3** | API 优雅、暗色模式极简、a11y 内置 |
| 已有 Tailwind 项目扩展 | **shadcn/ui** / **Headless UI** | 风格一致、零额外样式引擎 |
| 全功能一站式（含图表/表单） | **Mantine v7** | 120+ 组件、Hook 丰富、文档极佳 |

#### Vue 项目

| 场景 | 推荐方案 | 理由 |
|------|---------|------|
| 企业后台系统 | **Element Plus** | 国内最主流、组件完备、中文文档 |
| Material Design | **Vuetify v3** | Vue 官方推荐、Material 规范最严格 |
| Nuxt 全栈项目 | **Nuxt UI v3** | 与 Nuxt 深度集成、RSC 友好 |
| 跨框架统一 UI | **PrimeVue** | 同系列覆盖 React/Angular/Blazor |
| 现代风格 + TS 优先 | **Naive UI** | 类型安全最佳、视觉现代 |

#### 跨框架 / 设计系统

| 场景 | 推荐方案 | 理由 |
|------|---------|------|
| 跨 React/Vue/Svelte 设计系统 | **Ark UI + Panda CSS** | 统一状态机、多框架适配 |
| 仅 React 设计系统底层 | **Radix UI** | 最成熟、社区最大、生态最广 |
| 表格/虚拟化/表单专用 | **TanStack** 系列 | 框架无关、逻辑与渲染分离 |

---

## 八、相关资源

- [CSS-in-JS 完整指南](../guide/css-in-js-styling.md) — 样式架构深度解析
- [UI 组件库对比矩阵](../comparison-matrices/ui-libraries-compare.md) — 核心指标速查表
- [状态管理](./state-management.md)
- [表单处理](./form-handling.md)
- [样式处理](./styling.md)

---

## 九、数据来源与更新说明

| 数据维度 | 来源 | 更新时间 |
|---------|------|---------|
| GitHub Stars | GitHub API (github.com) | 2026 年 4 月 |
| npm 周下载量 | npm registry API (npmjs.com) | 2026 年 4 月 |
| 版本信息 | 各库官方文档与 GitHub Releases | 2026 年 4 月 |
| 包体积估算 | bundlephobia.com / 官方文档 | 2026 年 4 月 |
| 无障碍评估 | 官方 a11y 文档、WAI-ARIA 实践、社区测试报告 | 2026 年 4 月 |
| 趋势判断 | State of JavaScript 2025、State of CSS 2025 | 2025 年调查周期 |

> 本文档采用滚动更新机制。如发现数据滞后或错误，欢迎通过项目 [Issue](https://github.com/AdaMartin18010/JavaScriptTypeScript/issues) 提交修正。
