---
title: 'CSS 架构与渲染管线关系'
description: 'CSS Architecture and Rendering Pipeline: Cascade, Specificity, Cascade Layers, Container Queries, CSS Houdini, and their interaction with browser rendering'
last-updated: 2026-05-05
review-cycle: 6 months
next-review: 2026-11-05
status: complete
priority: P0
english-abstract: 'A comprehensive analysis of CSS architecture mechanisms and their deep interaction with the browser rendering pipeline, covering cascade algorithms, specificity calculation, @layer cascade layers, container queries, CSS Houdini APIs, and containment strategies.'
references:
  - 'W3C, CSS Cascading and Inheritance Level 6'
  - 'W3C, CSS Containment Module Level 2'
  - 'W3C, CSS Houdini'
  - 'Chromium, Style Engine Architecture'
  - 'Mozilla, CSS Cascade'
---

# CSS 架构与渲染管线关系

> **理论深度**: 高级
> **前置阅读**: [14a-parsing-and-layout-engine.md](../70.2-cognitive-interaction-models/14a-parsing-and-layout-engine.md), [14b-paint-composite-engine.md](../70.2-cognitive-interaction-models/14b-paint-composite-engine.md)
> **目标读者**: CSS 架构师、浏览器引擎开发者、设计系统工程师
> **核心问题**: CSS 的层叠、作用域和架构机制如何与浏览器的渲染流水线深度耦合？现代 CSS 特性如何改变渲染性能模型？

---

## 目录

- [CSS 架构与渲染管线关系](#css-架构与渲染管线关系)
  - [目录](#目录)
  - [1. CSS 层叠算法（Cascade）的形式化](#1-css-层叠算法cascade的形式化)
    - [1.1 层叠的八个来源与优先级](#11-层叠的八个来源与优先级)
    - [1.2 层叠解决的三阶段算法](#12-层叠解决的三阶段算法)
  - [2. 特异性（Specificity）与选择器匹配成本](#2-特异性specificity与选择器匹配成本)
    - [2.1 特异性三元组 (a, b, c)](#21-特异性三元组-a-b-c)
    - [2.2 选择器匹配的算法复杂度](#22-选择器匹配的算法复杂度)
  - [3. @layer：层叠层的架构革命](#3-layer层叠层的架构革命)
    - [3.1 层叠层解决的问题](#31-层叠层解决的问题)
    - [3.2 @layer 的语法与语义](#32-layer-的语法与语义)
    - [3.3 对渲染引擎的影响](#33-对渲染引擎的影响)
  - [4. CSS 作用域与封装模型](#4-css-作用域与封装模型)
    - [4.1 @scope（CSS Scope Module Level 1）](#41-scopecss-scope-module-level-1)
    - [4.2 Shadow DOM 的样式封装](#42-shadow-dom-的样式封装)
  - [5. Container Queries：从视口到容器的响应式](#5-container-queries从视口到容器的响应式)
    - [5.1 容器查询的语义转变](#51-容器查询的语义转变)
    - [5.2 对渲染流水线的影响](#52-对渲染流水线的影响)
  - [6. CSS Houdini：扩展渲染引擎](#6-css-houdini扩展渲染引擎)
    - [6.1 Houdini APIs 概览](#61-houdini-apis-概览)
    - [6.2 Houdini 与渲染管线的集成](#62-houdini-与渲染管线的集成)
  - [7. CSS Containment：渲染隔离边界](#7-css-containment渲染隔离边界)
    - [7.1 contain 属性的四种值](#71-contain-属性的四种值)
    - [7.2 Content Visibility（content-visibility）](#72-content-visibilitycontent-visibility)
  - [8. 范畴论语义：样式系统的代数结构](#8-范畴论语义样式系统的代数结构)
  - [9. 对称差分析：旧 CSS 架构 vs 现代架构](#9-对称差分析旧-css-架构-vs-现代架构)
  - [10. 工程决策矩阵](#10-工程决策矩阵)
  - [11. 反例与局限性](#11-反例与局限性)
    - [11.1 @layer 的覆盖反例](#111-layer-的覆盖反例)
    - [11.2 Container Queries 的循环依赖](#112-container-queries-的循环依赖)
    - [11.3 CSS Houdini 的碎片化](#113-css-houdini-的碎片化)
    - [11.4 content-visibility 的可访问性陷阱](#114-content-visibility-的可访问性陷阱)
  - [TypeScript 代码示例](#typescript-代码示例)
    - [示例 1：特异性计算器](#示例-1特异性计算器)
    - [示例 2：@layer 优先级模拟器](#示例-2layer-优先级模拟器)
    - [示例 3：Container Query 评估器](#示例-3container-query-评估器)
    - [示例 4：CSS Houdini Paint Worklet 注册器](#示例-4css-houdini-paint-worklet-注册器)
    - [示例 5：Containment 边界检测器](#示例-5containment-边界检测器)
    - [示例 6：Content Visibility 优化计算器](#示例-6content-visibility-优化计算器)
  - [参考文献](#参考文献)

---

## 1. CSS 层叠算法（Cascade）的形式化

### 1.1 层叠的八个来源与优先级

CSS 的层叠（Cascade）算法决定了当多个规则匹配同一元素时，哪个规则的属性值最终被应用。层叠不是一个简单的"后来居上"机制，而是一个精心设计的**八层优先级系统**（CSS Cascading Level 6）：

**按优先级从高到低**：

1. **Transition 声明**：正在执行 CSS transition 的属性值具有最高优先级，确保动画平滑
2. **Important 用户代理（UA）声明**：浏览器内置样式表中的 `!important` 规则
3. **Important 用户声明**：用户在浏览器设置中定义的 `!important` 规则（如强制高对比度模式）
4. **Important 作者声明**：网页开发者编写的 `!important` 规则
5. **动画声明（Animation）**：正在执行的 CSS animation 关键帧中的值
6. **普通作者声明**：开发者编写的普通规则（最常见）
7. **普通用户声明**：用户的自定义样式表
8. **普通 UA 声明**：浏览器的默认样式表（如 `<h1>` 的默认字体大小）

**层叠的关键洞察**：`!important` 并非简单的"优先级提升"，而是将声明移动到**独立的层**（作者 important、用户 important、UA important），与普通层完全隔离。这解释了为什么 `!important` 规则之间的冲突仍然需要比较特异性——它们在同一个 important 层内竞争。

### 1.2 层叠解决的三阶段算法

当多个声明竞争同一元素的同一属性时，浏览器执行以下三阶段算法：

**阶段一：来源与重要性（Origin and Importance）**

- 比较声明的来源和是否标记 `!important`
- 高来源层的声明立即获胜，无需进入后续阶段

**阶段二：层叠层（Cascade Layers）**

- 如果来源相同，比较 `@layer` 声明
- 未分层（unlayered）的声明优先级最高，其次是后定义的层，然后是先定义的层

**阶段三：特异性与文档顺序（Specificity & Document Order）**

- 如果层相同，计算选择器的特异性（a, b, c）三元组
- 如果特异性相同，后定义的规则获胜

这种三阶段结构可以形式化为一个**字典序比较**（Lexicographic Ordering）：

```
(Origin, Layer, Specificity, Order)
```

声明 A 战胜声明 B，当且仅当 A 的四元组在字典序上大于 B。

---

## 2. 特异性（Specificity）与选择器匹配成本

### 2.1 特异性三元组 (a, b, c)

CSS 选择器的特异性是一个**三元组** (a, b, c)，而非一个十进制数：

- **a**：内联样式（`style` 属性）的数量。`a` 的 1 可以战胜任何数量的 b 和 c
- **b**：ID 选择器（`#id`）的数量
- **c**：类选择器（`.class`）、属性选择器（`[attr]`）、伪类（`:hover`）的数量
- **d**：类型选择器（`div`）、伪元素（`::before`）的数量（在 Level 4 中并入 c）

**常见误解**：`(0, 1, 0)` 不是 "100"，而是 "1 个 ID"。`(0, 0, 10)` 永远不会战胜 `(0, 1, 0)`，因为 b 位上的 1 > c 位上的任何数量。

### 2.2 选择器匹配的算法复杂度

在 Blink/WebKit 中，选择器匹配不是简单的"遍历所有规则"。浏览器使用 **RuleSet** 数据结构来加速：

**Bloom Filter 加速**：

- 为每个元素构建祖先链的 Bloom Filter（参见 14a）
- 在匹配后代选择器（`.ancestor .descendant`）时，先检查 Bloom Filter。如果祖先不在 Bloom Filter 中，立即跳过该规则
- 假阳性率可控（约 1%），但从不出现假阴性

**Invalidation Set 优化**：

- 当 DOM 变化时，浏览器不需要重新匹配所有选择器
- 通过分析选择器结构，构建 Invalidation Set：只有特定 class/id/tag 的变化才可能影响特定规则
- 例如，规则 `.nav .item` 只在 class 为 `nav` 或 `item` 的元素变化时才需要重新匹配

**性能陷阱**：

- 过度嵌套的选择器（如 `.a .b .c .d .e`）增加匹配成本，因为需要遍历祖先链
- `:has()` 选择器（CSS Level 4）虽然强大，但在没有 `:has()` 专用优化（Chromium 2023+）的浏览器中，需要检查所有后代，成本极高
- 通用选择器 `*` 的特异性为 (0,0,0)，匹配所有元素，常导致意外的层叠失败

---

## 3. @layer：层叠层的架构革命

### 3.1 层叠层解决的问题

在 `@layer` 之前，CSS 的层叠优先级完全由**来源和特异性**决定。这导致大型代码库和第三方组件中的**特异性战争**（Specificity Wars）：

- 组件库为了避免被覆盖，使用高特异性选择器（如 `.btn.btn-primary`）
- 应用开发者为了覆盖组件库，不得不使用更高的特异性或 `!important`
- 最终形成特异性军备竞赛，代码难以维护

**`@layer` 的解决方案**：

- 开发者显式声明层（layer），层的优先级完全由**定义顺序**决定，与选择器特异性无关
- 后定义的层可以覆盖先定义的层，无论选择器特异性如何
- 层内的特异性仅在同一层内竞争

### 3.2 @layer 的语法与语义

```css
@layer reset, base, components, utilities;
/* 层优先级：utilities > components > base > reset */

@layer reset {
  * { margin: 0; padding: 0; }
}

@layer components {
  .button { padding: 8px 16px; }
}

@layer utilities {
  .p-4 { padding: 16px; } /* 即使特异性相同，utilities 层获胜 */
}
```

**嵌套层**：层可以嵌套，形成层级结构。子层的优先级在其父层内按定义顺序排序。

**未分层样式**：未显式放入 `@layer` 的样式具有最高优先级（在相同来源内）。这确保了既有代码不会因为引入 `@layer` 而意外被覆盖。

### 3.3 对渲染引擎的影响

`@layer` 改变了浏览器的样式计算流水线：

- **Style Engine 的层缓存**：Blink 的 `StyleEngine` 为每个层维护独立的 `MatchedPropertiesRange`
- **层叠计算优化**：在层明确的情况下，浏览器可以跳过跨层的特异性比较，直接按层顺序决定优先级
- **内存开销**：每层需要额外的元数据存储，但对于典型页面（<10 层），开销可以忽略

---

## 4. CSS 作用域与封装模型

### 4.1 @scope（CSS Scope Module Level 1）

**`@scope`** 允许选择器的作用域限制在特定的 DOM 子树内：

```css
@scope (.card) {
  :scope { border: 1px solid #ccc; }
  .title { font-size: 1.2em; } /* 只匹配 .card 内的 .title */
}
```

**与 Shadow DOM 的区别**：

- Shadow DOM 创建真正的 DOM 边界，样式完全隔离（除非使用 CSS 自定义属性或 `::part`）
- `@scope` 是"软边界"，样式只在特定子树内匹配，但不阻止外部样式通过更高特异性或 `!important` 进入

### 4.2 Shadow DOM 的样式封装

Shadow DOM 提供了三种样式穿透机制：

1. **CSS 自定义属性（Variables）**：外部定义 `--primary-color`，Shadow DOM 内部使用。这是**唯一**的"向下穿透"机制。
2. **`::part()` 伪元素**：外部可以通过 `my-element::part(button)` 选中 Shadow DOM 内标记了 `part="button"` 的元素。
3. **`::slotted()` 伪元素**：Shadow DOM 内部可以通过 `::slotted(img)` 为插槽（slot）中的元素设置样式，但特异性受限。

**性能影响**：Shadow DOM 的样式作用域意味着浏览器可以为每个 Shadow Root 独立构建 `RuleSet`，减少全局选择器匹配成本。但在 Shadow Tree 深度嵌套时，样式计算需要遍历多个 Shadow Boundary，增加复杂度。

---

## 5. Container Queries：从视口到容器的响应式

### 5.1 容器查询的语义转变

**媒体查询（Media Queries）**：基于**视口**（Viewport）尺寸进行响应式设计。问题在于：组件的尺寸由其容器决定，而非视口。

**容器查询（Container Queries）**：基于**元素容器**的尺寸进行响应式设计。这使得组件真正"自包含"——同一组件在不同容器中可以呈现不同布局，无需知晓全局视口状态。

```css
.card-container {
  container-type: inline-size;
}

@container (min-width: 400px) {
  .card { display: flex; }
}
```

### 5.2 对渲染流水线的影响

容器查询对浏览器渲染引擎提出了新的挑战：

**循环依赖问题**：

- 容器查询的结果是"子元素的样式依赖于容器的尺寸"
- 但容器的尺寸又可能依赖于子元素的尺寸（如 `width: max-content`）
- 这形成了一个潜在的循环依赖，类似于表格布局中的百分比高度问题

**Chromium 的解决方案**：

- 在 LayoutNG 中，容器查询的解析被集成到**布局传递**（Layout Pass）中
- 如果检测到循环依赖，浏览器会打破循环（通常以容器尺寸为准，子元素自适应）
- 容器查询的评估发生在布局阶段之后、绘制阶段之前，这意味着容器查询变化会触发布局重算（Reflow），而非仅重绘（Repaint）

**性能优化**：

- 浏览器为每个 `container-type` 元素创建 **Container Query Evaluation Context**
- 只有当容器尺寸实际变化时，才重新评估该容器内的查询
- 容器查询不会跨 Shadow Boundary 传播（每个 Shadow Root 独立评估）

---

## 6. CSS Houdini：扩展渲染引擎

### 6.1 Houdini APIs 概览

CSS Houdini 是一组底层 API，允许开发者扩展浏览器的 CSS 引擎：

**Typed OM（Typed Object Model）**：

- 将 CSS 值从字符串解析为结构化对象（`CSSUnitValue`、`CSSMathValue`）
- 支持算术运算：`el.attributeStyleMap.set('width', CSS.percent(50))`

**Properties & Values API**：

- 注册自定义属性（CSS Variables）的类型、继承行为和初始值
- 支持动画：只有注册了 `@property` 的自定义属性才能参与 CSS transition/animation

```css
@property --gradient-angle {
  syntax: '<angle>';
  inherits: false;
  initial-value: 0deg;
}
```

**Paint API**：

- 用 JavaScript 编写 `paint()` 函数，生成自定义背景、边框或遮罩
- 在合成器线程的 Worklet 中执行，不阻塞主线程

**Layout API**：

- 自定义布局算法（如 masonry layout、环形布局）
- 在 Layout Worklet 中执行，与主线程隔离

**Animation Worklet**：

- 将 JavaScript 动画逻辑提升到合成器线程
- 支持 scroll-linked 动画和物理仿真

### 6.2 Houdini 与渲染管线的集成

**Paint Worklet 的执行时序**：

1. 主线程解析 CSS，发现 `background: paint(myPainter)`
2. 主线程将 Paint Worklet 的代码和参数传递给 **Paint Worklet 线程**
3. Paint Worklet 执行 `paint(ctx, size, properties)`，生成位图
4. 位图作为纹理传递给 **Compositor Thread**，参与图层合成

**性能特征**：

- Paint Worklet 的执行是**同步**的（必须在绘制前完成），但运行在独立线程
- 如果 Paint Worklet 执行时间过长（>16ms），会导致帧率下降
- Layout Worklet 更昂贵，因为它直接参与布局传递，可能触发连锁重排

---

## 7. CSS Containment：渲染隔离边界

### 7.1 contain 属性的四种值

**`contain: layout`**：元素的布局不影响外部（反之亦然）。子元素的布局变化不会导致外部元素重排。

**`contain: paint`**：元素的内容不会溢出其边界绘制到外部。浏览器可以创建独立的绘制层，优化合成。

**`contain: size`**：元素的尺寸计算不依赖子元素（需要显式设置 width/height）。允许浏览器跳过子树布局。

**`contain: style`**：样式变化（如 CSS Counter、Quotes）不逸出到外部。

**`contain: strict`**：`layout paint size` 的简写。

**`contain: content`**：`layout paint` 的简写。

### 7.2 Content Visibility（content-visibility）

**`content-visibility: auto`** 是 `contain: layout paint style` 的自动应用变体：

- 当元素在视口外时，浏览器**跳过**其布局、样式计算和绘制
- 元素保留占位空间（需要配合 `contain-intrinsic-size`）
- 当元素进入视口时，浏览器才执行完整的渲染流水线

**对渲染管线的影响**：

- 对于大型列表或复杂文档，`content-visibility: auto` 可以将首次绘制时间减少 50-70%
- 被跳过的内容不会生成 LayoutObject、PaintLayer 或 Display List
- 这直接减少了 Commit 数据量和 Layer Tree 复杂度（参见 14b 的 Layer Squashing）

---

## 8. 范畴论语义：样式系统的代数结构

CSS 的层叠系统可以形式化为一个**有序幺半群（Ordered Monoid）** **(S, ⊕, ≤, 0)**：

- **S**：所有可能的声明集合
- **⊕**：层叠合并操作（两个声明竞争时，按层叠算法选择获胜者）
- **≤**：优先级偏序（声明 A ≤ 声明 B 表示 B 在层叠中战胜 A）
- **0**：最低优先级的声明（普通 UA 样式）

**性质**：

- **结合律**：`(a ⊕ b) ⊕ c = a ⊕ (b ⊕ c)`，层叠的顺序不影响最终结果
- **单位元**：`0 ⊕ a = a`，最低优先级声明与任何声明合并都不改变结果
- **交换律**：`a ⊕ b = b ⊕ a`**不成立**。层叠不是简单的取最大值，因为来源和层引入了非对称结构。

**@layer 的范畴模型**：
`@layer` 将声明集合划分为不相交的子集（层）。层叠操作先在每个层内执行，然后按层顺序合并。这对应于范畴论中的**余积（Coproduct）**结构：

```
CascadedValue = ⨆_{layer ∈ Layers} (layer_internal_cascade)
```

---

## 9. 对称差分析：旧 CSS 架构 vs 现代架构

| 维度 | 旧架构（CSS2.1 时代） | 现代架构（CSS 2024+） | 交集 |
|------|---------------------|---------------------|------|
| 层叠控制 | 无显式层，仅来源+特异性 | `@layer` 显式层 + 来源 + 特异性 | 来源和特异性机制 |
| 作用域 | 全局命名空间 | `@scope` + Shadow DOM + CSS Modules | 选择器匹配 |
| 响应式基础 | 媒体查询（视口） | 容器查询（元素容器）+ 媒体查询 | 条件语法 `@media` / `@container` |
| 自定义能力 | 无（仅预定义属性） | CSS Houdini（Paint/Layout/Animation Worklet） | CSS 自定义属性（Variables） |
| 渲染隔离 | 无 | `contain` + `content-visibility` | `overflow: hidden`（弱隔离） |
| 性能优化 | 手动减少选择器复杂度 | 浏览器自动优化（Invalidation Set、@layer 层缓存） | 特异性优化 |
| 组件封装 | BEM / SMACSS 命名约定 | Shadow DOM 原生封装 + `::part` | 类名前缀约定 |

---

## 10. 工程决策矩阵

| 场景 | 推荐方案 | 理由 | 风险 |
|------|---------|------|------|
| 大型设计系统 | `@layer` 分层 + CSS 自定义属性 | 消除特异性战争，第三方组件可预测覆盖 | 旧浏览器不支持（Safari 15.4+，Chrome 99+）|
| 第三方组件嵌入 | Shadow DOM + `::part` | 真正封装，防止全局样式污染 | 深层穿透困难，主题定制受限 |
| 长列表性能 | `content-visibility: auto` | 跳过视口外元素的布局/绘制 | 需要 `contain-intrinsic-size`，否则滚动条跳动 |
| 复杂自定义背景 | CSS Paint API | GPU 加速的自定义绘制，不阻塞主线程 | Worklet 调试困难，不支持所有 CSS 属性上下文 |
| 组件级响应式 | Container Queries | 组件自适应容器，非视口 | 循环依赖风险，旧浏览器无支持 |
| 动画性能 | Animation Worklet | 合成器线程执行，避免主线程阻塞 | API 不稳定，Chrome 仅部分支持 |
| 作用域样式 | `@scope`（渐进增强） | 原生作用域，无需构建工具 | 支持度低（Chrome 118+），fallback 到 BEM |

---

## 11. 反例与局限性

### 11.1 @layer 的覆盖反例

某团队将组件库放入 `@layer(components)`，应用样式放入 `@layer(app)`。一个开发者为了"快速修复"，在应用层使用了 `!important`：

```css
@layer app {
  .button { background: red !important; }
}
```

结果：`!important` 跳出了层系统，进入了"作者 important"层。后续组件库更新时，即使提高层优先级也无法覆盖这个 `!important`，导致样式债务累积。

**教训**：`@layer` 消除了特异性战争，但 `!important` 仍然是核选项，应尽量避免。

### 11.2 Container Queries 的循环依赖

```css
.container {
  container-type: size;
  height: auto;
}

@container (min-height: 200px) {
  .child { height: 100px; }
}
```

如果 `.container` 的高度由 `.child` 决定（`height: auto`），而 `.child` 的高度又由容器查询决定，形成了循环依赖。Chromium 会打破循环（以容器固有尺寸为准），但结果可能不符合开发者预期。

### 11.3 CSS Houdini 的碎片化

截至 2026 年，CSS Houdini 的 API 支持极度不均衡：

- Typed OM：Chrome/Firefox/Safari 基本支持
- Paint API：Chrome 完整支持，Firefox/Safari 有限
- Layout API：Chrome 实验性，其他浏览器不支持
- Animation Worklet：Chrome 部分支持，其他浏览器无支持

这种碎片化使得 Houdini 在生产环境中的使用极为受限，主要用于渐进增强。

### 11.4 content-visibility 的可访问性陷阱

`content-visibility: auto` 跳过的内容对辅助技术（屏幕阅读器）不可见。如果开发者未提供 `aria-label` 或语义化替代内容，会导致屏幕阅读器用户完全无法访问被跳过的内容。

---

## TypeScript 代码示例

### 示例 1：特异性计算器

```typescript
interface Specificity {
  a: number; // inline styles
  b: number; // IDs
  c: number; // classes, attributes, pseudo-classes
}

function calculateSpecificity(selector: string): Specificity {
  const result: Specificity = { a: 0, b: 0, c: 0 };

  // Inline style (not in selector, but checked separately)
  // For selector string analysis:
  const clean = selector.replace(/\s+/g, ' ').trim();

  // Count IDs
  result.b = (clean.match(/#[\w-]+/g) || []).length;

  // Count classes, attributes, pseudo-classes
  result.c = (clean.match(/\.[\w-]+/g) || []).length
    + (clean.match(/\[[^\]]+\]/g) || []).length
    + (clean.match(/:[a-z-]+/gi) || []).filter(s => !s.startsWith('::')).length;

  // Type selectors and pseudo-elements (counted in c for simplicity)
  result.c += (clean.match(/\b[a-z]+/gi) || []).length;

  return result;
}

function compareSpecificity(a: Specificity, b: Specificity): number {
  if (a.a !== b.a) return a.a - b.a;
  if (a.b !== b.b) return a.b - b.b;
  return a.c - b.c;
}
```

### 示例 2：@layer 优先级模拟器

```typescript
type LayerName = string;

interface StyleRule {
  selector: string;
  property: string;
  value: string;
  specificity: Specificity;
  layer?: LayerName;
  important: boolean;
}

class LayerCascade {
  private layers: LayerName[] = [];
  private rules: StyleRule[] = [];

  defineLayerOrder(...names: LayerName[]) {
    this.layers = names;
  }

  add(rule: StyleRule) {
    this.rules.push(rule);
  }

  resolve(element: string, property: string): StyleRule | null {
    const matches = this.rules.filter(r =>
      r.property === property && this.matchesSelector(element, r.selector)
    );

    return matches.sort((a, b) => {
      // 1. Important (simplified: important wins)
      if (a.important !== b.important) return a.important ? 1 : -1;
      // 2. Layer order
      const layerA = a.layer ? this.layers.indexOf(a.layer) : Infinity;
      const layerB = b.layer ? this.layers.indexOf(b.layer) : Infinity;
      if (layerA !== layerB) return layerB - layerA;
      // 3. Specificity
      const specDiff = compareSpecificity(a.specificity, b.specificity);
      if (specDiff !== 0) return specDiff;
      // 4. Document order
      return 0;
    })[0] || null;
  }

  private matchesSelector(element: string, selector: string): boolean {
    // Simplified: exact match or class containment
    return element === selector || element.includes(selector.replace('.', ''));
  }
}
```

### 示例 3：Container Query 评估器

```typescript
interface ContainerQuery {
  property: 'width' | 'height' | 'inline-size' | 'block-size';
  operator: '>' | '<' | '>=' | '<=' | '=';
  value: number;
  unit: 'px' | 'em' | 'rem';
}

class ContainerQueryEvaluator {
  evaluate(query: ContainerQuery, containerSize: { width: number; height: number }): boolean {
    const actual = query.property === 'width' || query.property === 'inline-size'
      ? containerSize.width
      : containerSize.height;

    switch (query.operator) {
      case '>': return actual > query.value;
      case '<': return actual < query.value;
      case '>=': return actual >= query.value;
      case '<=': return actual <= query.value;
      case '=': return actual === query.value;
    }
  }

  findMatchingQueries(
    queries: ContainerQuery[],
    containerSize: { width: number; height: number }
  ): ContainerQuery[] {
    return queries.filter(q => this.evaluate(q, containerSize));
  }
}
```

### 示例 4：CSS Houdini Paint Worklet 注册器

```typescript
interface PaintWorkletDefinition {
  name: string;
  inputProperties: string[];
  paint(ctx: PaintRenderingContext2D, size: PaintSize, props: StylePropertyMapReadOnly): void;
}

declare class PaintRenderingContext2D extends CanvasRenderingContext2D {}
interface PaintSize { width: number; height: number; }

class PaintWorkletRegistry {
  private definitions = new Map<string, PaintWorkletDefinition>();

  register(def: PaintWorkletDefinition) {
    this.definitions.set(def.name, def);
    // In real usage: CSS.paintWorklet.addModule('worklet.js');
  }

  get(name: string): PaintWorkletDefinition | undefined {
    return this.definitions.get(name);
  }

  // Simulate paint execution
  simulatePaint(name: string, width: number, height: number, props: Map<string, string>): ImageData | null {
    const def = this.definitions.get(name);
    if (!def) return null;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    // Mock StylePropertyMapReadOnly
    const propMap = {
      get: (name: string) => ({ toString: () => props.get(name) || '' }),
    } as any;

    def.paint(ctx as any, { width, height }, propMap);
    return ctx.getImageData(0, 0, width, height);
  }
}
```

### 示例 5：Containment 边界检测器

```typescript
type ContainmentType = 'layout' | 'paint' | 'size' | 'style' | 'strict' | 'content';

class ContainmentAnalyzer {
  private containmentValues: Map<string, Set<ContainmentType>> = new Map();

  parse(value: string): Set<ContainmentType> {
    const result = new Set<ContainmentType>();
    const parts = value.split(/\s+/);

    for (const part of parts) {
      if (part === 'strict') {
        result.add('layout').add('paint').add('size').add('style');
      } else if (part === 'content') {
        result.add('layout').add('paint').add('style');
      } else if (['layout', 'paint', 'size', 'style'].includes(part)) {
        result.add(part as ContainmentType);
      }
    }
    return result;
  }

  isLayoutContained(element: string): boolean {
    const vals = this.containmentValues.get(element);
    return vals?.has('layout') || vals?.has('strict') || false;
  }

  isPaintContained(element: string): boolean {
    const vals = this.containmentValues.get(element);
    return vals?.has('paint') || vals?.has('strict') || vals?.has('content') || false;
  }

  // Check if style change in child can affect parent
  canAffectParent(child: string, parent: string): boolean {
    return !this.isLayoutContained(child) && !this.isPaintContained(child);
  }
}
```

### 示例 6：Content Visibility 优化计算器

```typescript
interface ElementMetrics {
  id: string;
  rect: DOMRect;
  childCount: number;
  hasComplexLayout: boolean;
}

class ContentVisibilityOptimizer {
  private viewport: { width: number; height: number } = { width: 0, height: 0 };

  setViewport(w: number, h: number) {
    this.viewport = { width: w, height: h };
  }

  shouldApplyCV(element: ElementMetrics): { apply: boolean; intrinsicSize: string } {
    // Only apply to elements outside initial viewport
    const isInViewport = element.rect.top < this.viewport.height &&
      element.rect.bottom > 0;

    if (isInViewport) {
      return { apply: false, intrinsicSize: '' };
    }

    // Only apply to complex elements
    if (element.childCount < 50 && !element.hasComplexLayout) {
      return { apply: false, intrinsicSize: '' };
    }

    // Estimate intrinsic size to prevent scrollbar jumps
    const estimatedHeight = Math.max(element.rect.height, 100);
    return {
      apply: true,
      intrinsicSize: `0 ${estimatedHeight}px`,
    };
  }

  generateStyles(elements: ElementMetrics[]): string {
    const styles: string[] = [];
    for (const el of elements) {
      const result = this.shouldApplyCV(el);
      if (result.apply) {
        styles.push(`#${el.id} { content-visibility: auto; contain-intrinsic-size: ${result.intrinsicSize}; }`);
      }
    }
    return styles.join('\n');
  }
}
```

---

## 参考文献

1. W3C. *CSS Cascading and Inheritance Level 6.* W3C Working Draft. <https://www.w3.org/TR/css-cascade-6/>
2. W3C. *CSS Containment Module Level 2.* W3C Candidate Recommendation. <https://www.w3.org/TR/css-contain-2/>
3. W3C. *CSS Conditional Rules Module Level 5.* (Container Queries). <https://www.w3.org/TR/css-conditional-5/>
4. W3C. *CSS Houdini.* <https://www.w3.org/TR/css-houdini-1/>
5. W3C. *CSS Scoping Module Level 1.* <https://www.w3.org/TR/css-scoping-1/>
6. Miriam Suzanne. *A Complete Guide to CSS Cascade Layers.* CSS-Tricks, 2022.
7. Bramus Van Damme. *The Future of CSS: Cascade Layers.* bram.us, 2022.
8. Chrome Developers. *Content-visibility: the new CSS property that boosts your rendering performance.* web.dev, 2020.
9. Tab Atkins Jr. *CSS Houdini and the Future of Styling.* Google Chrome Developers, 2016.
10. Chromium. *Style Engine Internals.* Chromium Source Code / Blink Renderer.
