---
title: "浏览器解析与布局引擎原理"
description: "Browser Parsing and Layout Engine Principles"
last-updated: 2026-05-05
review-cycle: 6 months
next-review: 2026-11-05
status: complete
priority: P0
actual-length: "~18000 words"
english-abstract: "A comprehensive technical analysis..."
references:
  - WHATWG, "HTML Standard — Parsing" (2025)
  - W3C, "CSSOM Module Level 1" (2023)
---

# 浏览器解析与布局引擎原理

> **理论深度**: 高级
> **前置阅读**: [01-cognitive-science-primer-for-developers.md](01-cognitive-science-primer-for-developers.md), [11-expert-novice-differences-in-js-ts.md](11-expert-novice-differences-in-js-ts.md)
> **目标读者**: 浏览器引擎开发者、前端性能工程师、渲染优化专家
> **核心问题**: 浏览器如何从原始字节流构建出精确的几何布局？现代 LayoutNG 如何解决 Legacy Layout 的可靠性危机？

---

## 目录

- [浏览器解析与布局引擎原理](#浏览器解析与布局引擎原理)
  - [目录](#目录)
  - [1. 历史脉络：从 Mosaic 到 RenderingNG](#1-历史脉络从-mosaic-到-renderingng)
  - [2. HTML 解析：Tokenization 与 Tree Construction](#2-html-解析tokenization-与-tree-construction)
    - [2.1 Tokenizer 状态机：80+ 个状态的精密机械](#21-tokenizer-状态机80-个状态的精密机械)
    - [2.2 Tree Construction：开放元素栈与插入模式](#22-tree-construction开放元素栈与插入模式)
    - [2.3 Foster Parenting：表格中错位元素的重定位算法](#23-foster-parenting表格中错位元素的重定位算法)
    - [2.4 Adoption Agency Algorithm：格式化元素的深度限制处理](#24-adoption-agency-algorithm格式化元素的深度限制处理)
    - [2.5 模板与流式解析：`<template>` 与 `document.write()`](#25-模板与流式解析template-与-documentwrite)
  - [3. Preload Scanner：独立线程的前瞻资源发现](#3-preload-scanner独立线程的前瞻资源发现)
    - [3.1 为什么需要 Preload Scanner](#31-为什么需要-preload-scanner)
    - [3.2 预加载扫描器的线程模型](#32-预加载扫描器的线程模型)
    - [3.3 与主解析器的协同与冲突](#33-与主解析器的协同与冲突)
  - [4. CSS 解析与样式计算](#4-css-解析与样式计算)
    - [4.1 CSS Selector Matching：从 O(n) 到近似 O(1)](#41-css-selector-matching从-on-到近似-o1)
    - [4.2 Bloom Filter 与 Ancestor Filter：快速排除不匹配选择器](#42-bloom-filter-与-ancestor-filter快速排除不匹配选择器)
    - [4.3 Invalidation Set：样式失效的精确追踪](#43-invalidation-set样式失效的精确追踪)
    - [4.4 Cascade Layers：`@layer` 与 Scoped Styles](#44-cascade-layerslayer-与-scoped-styles)
    - [4.5 现代特异性计算：`:is()` / `:where()` / `:has()` / `:not()`](#45-现代特异性计算is--where--has--not)
    - [4.6 Computed Style 共享缓存](#46-computed-style-共享缓存)
  - [5. Render Tree 构建：从 DOM 到 Flattened Tree](#5-render-tree-构建从-dom-到-flattened-tree)
    - [5.1 Shadow DOM 与 Composed Tree](#51-shadow-dom-与-composed-tree)
    - [5.2 Slot Distribution 算法](#52-slot-distribution-算法)
    - [5.3 匿名块盒的生成条件](#53-匿名块盒的生成条件)
    - [5.4 `display:none` vs `visibility:hidden` 的 LayoutObject 差异](#54-displaynone-vs-visibilityhidden-的-layoutobject-差异)
  - [6. Layout：几何计算的核心](#6-layout几何计算的核心)
    - [6.1 Legacy Layout 的问题：可变树与脏标记传播](#61-legacy-layout-的问题可变树与脏标记传播)
    - [6.2 LayoutNG 架构革命](#62-layoutng-架构革命)
    - [6.3 不可变片段树（Immutable Fragment Tree）](#63-不可变片段树immutable-fragment-tree)
    - [6.4 约束空间（Constraint Space）与缓存键](#64-约束空间constraint-space与缓存键)
    - [6.5 Inline Formatting Context（IFC）：Line Box 与 Text Shaping](#65-inline-formatting-contextifcline-box-与-text-shaping)
    - [6.6 Block Formatting Context（BFC）：Margin Collapse 的三类规则](#66-block-formatting-contextbfcmargin-collapse-的三类规则)
    - [6.7 Flexbox 算法的 9 个步骤](#67-flexbox-算法的-9-个步骤)
    - [6.8 Grid 的 Track Sizing Algorithm](#68-grid-的-track-sizing-algorithm)
    - [6.9 Subtree Layout 与 Layout Boundaries](#69-subtree-layout-与-layout-boundaries)
  - [7. 对称差分析：Legacy vs LayoutNG](#7-对称差分析legacy-vs-layoutng)
  - [8. 工程决策矩阵](#8-工程决策矩阵)
  - [9. 精确直觉类比与边界](#9-精确直觉类比与边界)
  - [10. 反例与局限性](#10-反例与局限性)
  - [TypeScript 代码示例](#typescript-代码示例)
    - [示例 1：HTML Tokenizer 状态机模拟](#示例-1html-tokenizer-状态机模拟)
    - [示例 2：CSS Selector Matching 性能分析器（Bloom Filter 模拟）](#示例-2css-selector-matching-性能分析器bloom-filter-模拟)
    - [示例 3：Shadow DOM Slot Distribution 模拟器](#示例-3shadow-dom-slot-distribution-模拟器)
    - [示例 4：LayoutNG Constraint Space 可视化](#示例-4layoutng-constraint-space-可视化)
    - [示例 5：Flexbox 9 步算法实现](#示例-5flexbox-9-步算法实现)
    - [示例 6：Grid Track Sizing 计算器](#示例-6grid-track-sizing-计算器)
  - [参考文献](#参考文献)

---

## 1. 历史脉络：从 Mosaic 到 RenderingNG

1993 年，Marc Andreessen 领导的 NCSA Mosaic 项目首次将图像与文本整合在同一窗口中展示，开启了图形化浏览器时代。Mosaic 的解析器极为简单：它逐字节读取 HTML，遇到 `<` 则进入标签模式，其余均视为文本，没有状态机概念，也不处理嵌套错误——遇到未闭合的标签直接忽略。这种**容错解析（Fault-tolerant Parsing）**的萌芽并非设计目标，而是工程约束下的副产品。

1994 年 Netscape Navigator 发布后，浏览器市场进入第一次大战。为兼容大量手写错误的网页，Netscape 引入了隐式标签闭合规则：例如 `<p>` 遇到另一个 `<p>` 时自动闭合前一个。这些启发式规则没有统一规范，导致 IE 与 Navigator 在相同标记下渲染出截然不同的结果。

1998 年 W3C 发布 HTML 4.0 规范，但并未定义解析算法，仅描述了合法文档的抽象语法树（AST）。这造成了一个根本性问题：**规范与实现脱节**。浏览器厂商各自维护私有的逆向工程解析器，IE 的 Trident 引擎甚至将 HTML 解析与布局耦合在单一 pass 中，形成了臭名昭著的 "hasLayout" 属性体系。

2004 年，Mozilla 基金会从 Netscape 的废墟中推出 Firefox（Gecko 引擎）。Gecko 首次引入了显式的词法分析器（Tokenizer）与语法分析器（Parser）分离架构，但其状态机仍相对简单，仅覆盖约 40 个状态。与此同时，Apple 于 2003 年基于 KHTML 开发了 WebKit（Safari），采用更清晰的 DOM 树构建模型。

2008 年 Google 发布 Chrome，搭载从 WebKit 分支而来的 Blink 引擎（2013 年正式分离）。Chrome 的多进程架构（Browser Process + Renderer Process）要求解析器必须具备**可重入性（Reentrancy）**，因为 `document.write()` 可能在解析中途注入新字节流。这一时期，HTML5 规范开始由 WHATWG 主导编写，首次以算法形式精确定义了解析流程，包含 80 余个 tokenizer 状态和明确的 Tree Construction 插入模式。

2013-2019 年间，Mozilla 的 Servo 实验项目（后用为 Firefox Quantum）探索了并行布局与类型安全内存模型。虽然 Servo 未完全替代 Gecko，但其**不可变树（Immutable Tree）**与**基于约束的布局（Constraint-based Layout）**思想深刻影响了 Chromium 团队。

2019 至 2021 年，Blink 团队执行了代号为 **LayoutNG** 的布局引擎全面重写。LayoutNG 彻底抛弃了 Legacy Layout 的可变树模型，引入了不可变片段树（Immutable Fragment Tree）和约束空间（Constraint Space），将布局从一次性的“脏标记传播”转变为函数式的“输入 → 输出”计算。

2022 年至今，Chromium 的 **RenderingNG** 项目进一步将解析、样式、布局、绘制与合成分层解耦，实现了跨进程的 GPU 光栅化（GPU Rasterization）和合成器线程（Compositor Thread）的独立滚动。现代浏览器引擎已演进为一个高度并行化的流水线：Network Process → HTML Parser (Main Thread) → Preload Scanner (Helper Thread) → CSS Parser → Style Resolution → LayoutNG → Paint → Composite → GPU。

---

## 2. HTML 解析：Tokenization 与 Tree Construction

### 2.1 Tokenizer 状态机：80+ 个状态的精密机械

WHATWG HTML Living Standard 将 tokenizer 定义为一个确定性有限状态机（Deterministic Finite State Automaton, DFSA），截至 2025 年规范共定义了 **80 余个独立状态**。这些状态可归纳为七大类：

**（1）数据状态族（Data State Family）**

- **Data state**：初始状态，消耗字符并输出文本 token。遇到 `&` 转入 Character reference state；遇到 `<` 转入 Tag open state。
- **RCDATA state**：用于 `<textarea>` 和 `<title>` 元素。在此状态下，`<` 仅当后接 `/` 且关闭标签名匹配当前元素时才被当作标签起始；否则 `<` 作为文本。
- **RAWTEXT state**：用于 `<style>`、`<xmp>`、`<iframe>`、`<noembed>`、`<noframes>`。不解析实体引用（character references），`<` 仅识别结束标签。
- **Script data state**：用于 `<script>`。不解析 HTML 实体，但识别 `<!--` 和 `-->` 作为脚本注释（这是著名的 `<script>...<!--...//--></script>` 兼容逻辑）。

**（2）标签解析状态族（Tag Parsing Family）**

- **Tag open state** (`<`)：后续字符决定进入 Tag name state、End tag open state、Markup declaration open state（`!`）或 Bogus comment state。
- **End tag open state** (`</`)：若后接 ASCII alpha，进入 Tag name state 并标记为结束标签；若遇到 `>`，则解析为错误并忽略；否则进入 Bogus comment state。
- **Tag name state**：收集标签名，遇到空格转 Before attribute name state，遇到 `>` 发射 token 并返回 Data state，遇到 `/` 转 Self-closing start tag state。

**（3）属性解析状态族（Attribute Parsing Family）**
包含 Before attribute name、Attribute name、After attribute name、Before attribute value、Attribute value (double-quoted)、Attribute value (single-quoted)、Attribute value (unquoted)、After attribute value (quoted) 等 8 个状态。对于无引号属性值（unquoted），遇到空格、`>` 或 `/` 即终止。

**（4）注释与 DOCTYPE 状态族**

- **Markup declaration open state** (`<!`)：后续字符为 `--` 转 Comment start state；为 `DOCTYPE`（大小写不敏感）转 DOCTYPE state；为 `[CDATA[` 且处于 foreign content 则转 CDATA section state；否则进入 Bogus comment state。
- **DOCTYPE state**：解析 name、public/system identifier。若 DOCTYPE 缺失或格式错误，浏览器进入 **quirks mode**。具体触发条件为：
  - 缺失 `<!DOCTYPE html>`
  - 公共标识符（Public Identifier）包含特定字符串如 `-//W3C//DTD HTML 4.01 Transitional//EN` 且缺失系统标识符
  - 系统标识符（System Identifier）为 `http://www.ibm.com/data/dtd/v11/ibmxhtml1-transitional.dtd`

**（5）字符引用解析（Character Reference Resolution）**
当 tokenizer 处于 Data、RCDATA 或 Attribute value 状态并遇到 `&` 时，进入 Character reference state。算法如下：

1. 尝试匹配最长命名字符引用（Named character reference），如 `&amp;`、`&#x1F600;`。
2. 若以数字开头（`&#`），进入 Numeric character reference state：
   - `&#x` 或 `&#X` 触发 Hexadecimal character reference start state
   - 否则进入 Decimal character reference start state
3. 解析数字直至遇到 `;` 或非数字字符。若超出 Unicode 范围（如大于 `0x10FFFF`）或处于 surrogates 范围（`0xD800`–`0xDFFF`），则以 replacement character (`U+FFFD`) 替换。
4. 若未找到结尾分号且下一个字符为 `=` 或 ASCII alphanumeric，则不解析引用，将 `&` 作为字面量。

**（6）Script 与 CDATA 特殊状态**
Script data 拥有独立的转义序列识别：`<script><!--` 和 `//--></script>`。此外，存在 Script data less-than sign state、Script data escape start state、Script data double escape start state 等复杂子状态，用于处理 JavaScript 字符串中碰巧包含 `</script>` 的情况。

**（7）Foreign Content 状态**
当解析器处于 MathML 或 SVG 命名空间时，进入 Foreign content 模式。此时 `<` 后的标签名需区分 HTML 集成点（HTML integration point）。例如，`<desc>` 在 SVG 中作为 foreign element，但若其父为 HTML `<div>` 则按 HTML 解析。

> **精确直觉类比**：Tokenizer 状态机如同一台老式打孔纸带读取机。每一个状态对应纸带上一个固定宽度的读取窗口，窗口内的字符组合决定下一步将纸带推进多少格、是否向外部输出一个 token。不同的是，这台机器拥有 80 多个读取窗口，且能在遇到错误时不停止——而是将错误本身编码为一种特殊的 "bogus" token 继续处理。然而，与真正的有限自动机不同，HTML tokenizer 需要维护一个 **return state**（用于字符引用解析后恢复），这使得它严格来说是一个带有下推存储（push-down store）的自动机，而非纯 DFSA。

### 2.2 Tree Construction：开放元素栈与插入模式

Tree Construction 阶段接收 token stream，维护两个核心数据结构：

- **Stack of open elements（开放元素栈）**：后进先出（LIFO）栈，保存当前尚未闭合的元素节点。栈底为 `html` 元素，栈顶为当前正在处理的元素。
- **List of active formatting elements（活跃格式化元素列表）**：维护尚未闭合的格式化标签（如 `<b>`、`<i>`、`<a>`），用于处理跨元素的重叠标签。

Tree Construction 定义了 **23 种插入模式（Insertion Modes）**，包括：initial、before html、before head、in head、in head noscript、after head、in body、text、in table、in table text、in caption、in column group、in table body、in row、in cell、in select、in select in table、in template、after body、in frameset、after frameset、after after body、after after frameset。

插入模式由当前栈顶元素和 token 类型共同决定。例如，当处于 **in body** 模式并收到 `<div>` start tag 时：

1. 压入 `<div>` 到开放元素栈
2. 将 `<div>` 插入为当前父节点的子节点
3. 若 `<div>` 具有特殊作用（如触发重流），则标记布局脏位

若收到未预期的结束标签（如在 `<table>` 内部直接出现 `<p>` 的结束标签），解析器不会立即报错，而是执行 **"any other end tag"** 规则：从栈顶向下查找与标签名匹配的元素，若找到则将该元素及之上所有元素弹出，并隐式闭合它们；若未找到，则忽略该 token。

### 2.3 Foster Parenting：表格中错位元素的重定位算法

Foster parenting 是 HTML 解析器处理表格内错位内容（Mislav Content）的核心算法。当解析器处于 **in table** 插入模式，收到一个非表格相关元素（如 `<p>`、`<div>`、文本）且当前父节点为 `<table>` 时，该元素不能作为 `<table>` 的直接子节点（因为 `<table>` 只能容纳 `<caption>`、`<colgroup>`、`<tbody>`、`<thead>`、`<tfoot>` 和 `<tr>`）。

**Foster Parenting 算法**：

1. 设 `foster parent` 为当前 `<table>` 的父节点（若 `<table>` 本身也在栈中）。
2. 若 `foster parent` 存在，则将错位元素插入到 `foster parent` 中，**位于 `<table>` 之前**（即作为 `<table>` 的前一个兄弟节点）。
3. 若 `<table>` 无父节点（即为根元素），则将元素追加到文档的 `body` 中。
4. 若当前存在 **template contents**（模板内容文档片段），则插入到模板片段中。

这解释了为何以下 HTML：

```html
<table>
  <tr><td>cell</td></tr>
  <p>paragraph inside table</p>
</table>
```

在浏览器中 `<p>` 实际上会出现在 `<table>` **之前**，而非内部。这种现象被称为 "foster parenting"，是 Web 兼容性（Web Compatibility）的关键保证。

### 2.4 Adoption Agency Algorithm：格式化元素的深度限制处理

当用户书写严重嵌套且交叉的格式化标签时，如：

```html
<p><b><i>one</b> two</i></p>
```

开放元素栈与活跃格式化元素列表会出现不一致。Adoption Agency Algorithm（AAA）是 HTML5 规范中用于重构 DOM 树以恢复一致性的核心算法。

**算法触发条件**：当在 **in body** 模式下遇到格式化元素（formatting element）的结束标签，且该元素不在当前栈顶位置时。

**算法步骤**（简化版）：

1. 设 `outer loop counter` = 0。
2. 若 `outer loop counter` ≥ 8，直接中止（这是硬编码的深度限制，防止无限循环）。
3. 在活跃格式化元素列表中查找与当前结束标签对应的格式化元素 `formatting element`。
4. 若该元素不在列表中，按普通 end tag 规则处理（从栈顶查找并弹出）。
5. 设 `furthest block` 为开放元素栈中位于 `formatting element` 之上的第一个 "special" 元素（如 `<div>`、`<p>`、`<table>` 等）。
6. 若不存在 `furthest block`，则将 `formatting element` 从栈和列表中移除，算法结束。
7. 设 `common ancestor` 为 `formatting element` 在栈中的前一个元素。
8. 将 `furthest block` 以上的节点（即 `formatting element` 与 `furthest block` 之间的节点）重新组织：
   - 对每一个节点 `node`，将其从原父节点移除。
   - 在 `common ancestor` 下创建一个与 `formatting element` 同类型的新元素。
   - 将 `node` 追加到新创建的元素下。
   - 将新元素插入到 `common ancestor` 中，位于原 `node` 位置。
9. 将 `furthest block` 从 `common ancestor` 移除，追加到 `formatting element` 的副本下。
10. 将 `formatting element` 从列表和栈中移除，将其副本插入到列表和栈的相应位置。
11. `outer loop counter` 自增，返回步骤 2。

AAA 的 8 次迭代限制是 Web 平台的关键安全阀，防止通过极端嵌套构造导致解析器栈溢出。

> **精确直觉类比**：Adoption Agency Algorithm 类似于一个收养机构处理混乱的家庭关系。当多个 "孩子"（内联节点）被多个 "父母"（格式化标签）交叉收养时，机构需要在一个有限的办公室（8 次迭代限制）内，重新建立合法的监护关系（DOM 树结构），将每个孩子安置到新的、明确的抚养家庭（重构后的元素层级）中，而不允许无限期的社会调查。

### 2.5 模板与流式解析：`<template>` 与 `document.write()`

**`<template>` 的内容文档片段**
HTML5 引入的 `<template>` 元素具有独特的解析语义。其内容不被视为活动文档的一部分，而是存储在一个独立的 **Template Contents Document Fragment（模板内容文档片段）** 中。Tree Construction 维护一个 **stack of template insertion modes**，每当遇到 `<template>` 时：

1. 创建一个新的 DocumentFragment 作为模板内容容器。
2. 将当前的 template insertion mode 压栈，并切换为 **in template** 模式。
3. 将 `<template>` 压入开放元素栈，同时记录其关联的文档片段。
4. 当遇到 `</template>` 时，将栈顶直至 `<template>` 的所有元素弹出，并将它们附加到模板内容片段中。

这意味着 `<template>` 内部的 `<script>` 不会执行，`<img>` 不会加载，`<style>` 不会应用——直到通过 JavaScript 的 `template.content.cloneNode(true)` 激活。

**`document.write()` 对流式解析的影响**
`document.write()` 是现代浏览器解析器中最复杂的特性之一。当解析器在主线程解析 HTML 时遇到同步 `<script>`，必须暂停 tokenizer，执行脚本。若脚本调用 `document.write('<div>new content</div>')`，新字节流被**插入到输入流中当前位置**，导致：

1. **Tokenizer 重入**：tokenizer 必须从插入点继续，而非结束。
2. **插入模式切换**：新内容可能改变当前插入模式（例如在 `</table>` 后写入 `<table>` 会重置为 in table 模式）。
3. **Preload Scanner 失效**：预加载扫描器基于原始字节流的推测性分析可能被 `document.write()` 完全颠覆，因此现代浏览器在检测到 `document.write()` 时会降低预加载的优先级或重新扫描。

规范将 `document.write()` 建模为向 **tokenization stage** 的输入流中插入字符串，这要求解析器具备**双向流控制**能力。在 Chromium 中，这通过 `HTMLDocumentParser` 的 `Append()` 和 `Insert()` 方法实现，其中 `Insert()` 会触发 tokenizer 的 `Flush()` 和 `Resume()` 循环。

---

## 3. Preload Scanner：独立线程的前瞻资源发现

### 3.1 为什么需要 Preload Scanner

主 HTML Parser（Tokenizer + Tree Construction）运行在渲染器主线程（Renderer Main Thread）。当遇到同步 `<script src="...">` 时，解析必须暂停，等待脚本下载、解析、执行完毕。在此期间，主线程闲置，但页面中位于脚本之后的资源（如样式表、图片、字体）本可以提前开始下载。

Preload Scanner（预加载扫描器）正是为解决这一**解析阻塞导致的资源加载延迟**而设计。它是一个轻量级的、与主解析器并行运行的前瞻扫描器，仅执行浅层词法分析（shallow lexical analysis），识别关键资源标签。

### 3.2 预加载扫描器的线程模型

在 Blink（Chromium）架构中，Preload Scanner 运行在一个独立的 **Parser Thread（或 Worker Thread）** 上。其设计遵循以下原则：

- **无状态快照（Stateless Snapshot）**：Preload Scanner 不维护开放元素栈，也不构建 DOM 树。它仅扫描原始字节流，维护一个极简的标签识别状态机。
- **乐观推测（Optimistic Speculation）**：它假设所有扫描到的资源最终都会被使用，即使后续 `document.write()` 或脚本修改可能使某些资源变得不必要。
- **高优先级预请求（High-priority Pre-request）**：对于阻塞渲染的资源（如 `<link rel="stylesheet">` 和 `<script>`），Preload Scanner 会立即向浏览器资源调度器（Resource Scheduler）发起请求，并标记为 **VeryHigh** 或 **High** 优先级。

Preload Scanner 识别的标签包括：

- `<link rel="stylesheet" href="...">`
- `<script src="...">`（同步与异步）
- `<img srcset="...">` / `<picture>` 内的 `<source>`
- `<video poster="...">` / `<audio src="...">`
- `<input type="image" src="...">`
- `@import` URL（在 `<style>` 块内，Preload Scanner 会执行简化的 CSS 扫描）

### 3.3 与主解析器的协同与冲突

Preload Scanner 与主解析器通过 **Shared Memory** 或 **Message Passing** 协同。主解析器将已接收但尚未处理的字节流区间暴露给 Preload Scanner，后者向前扫描但不消耗数据。

**协同场景**：
当主解析器因 `<script>` 阻塞时，Preload Scanner 已经扫描到脚本之后 2KB~4KB 的内容（具体阈值因浏览器而异），提前请求了关键 CSS 和图片。这显著缩短了**首次内容绘制（First Contentful Paint, FCP）**时间。

**冲突场景**：

1. **`document.write()` 颠覆预测**：若脚本通过 `document.write()` 重写了后续内容，Preload Scanner 之前发起的请求可能成为浪费。现代 Chromium 通过 **Predictor** 机制统计 `document.write()` 的使用频率，动态调整预加载策略。
2. **隐藏资源**：某些资源仅在特定条件下加载（如 `<link rel="stylesheet" media="print">`）。Preload Scanner 通常忽略媒体查询，可能错误地预加载非关键资源。Blink 的优化是在扫描时执行简化的媒体查询求值。
3. **CSP（Content Security Policy）冲突**：若页面的 CSP 禁止从特定域加载资源，但 Preload Scanner 在 CSP 元标签解析完成前已发起请求，可能导致无效的网络活动。解决方案是优先扫描 `<meta http-equiv="Content-Security-Policy">`。

> **精确直觉类比**：Preload Scanner 类似于餐厅里在正式点餐系统之前运行的“预备厨房”。主厨（主解析器）因等待一批特殊食材（同步脚本）而无法开工时，预备厨房根据菜单的粗略扫描提前清洗、切配后续菜品所需的蔬菜。它不关心最终摆盘（DOM 树），只确保食材（资源）在需要时已经备妥。但如果顾客临时改了订单（`document.write()`），预备厨房的工作就可能白费——这正是推测执行的固有代价。

---

## 4. CSS 解析与样式计算

### 4.1 CSS Selector Matching：从 O(n) 到近似 O(1)

在早期的浏览器引擎中，CSS 选择器匹配采用朴素遍历：对每个元素，遍历所有样式规则，检查选择器是否匹配。其时间复杂度为 $O(n \cdot m)$，其中 $n$ 为元素数量，$m$ 为规则数量。

现代 Chromium 采用 **RuleSet** 与 **RuleFeatureSet** 双层架构实现近似的 $O(1)$ 匹配：

**RuleSet 架构**

- 样式表解析后，每条规则（Rule）被拆分为 **Selector + Declaration Block**。
- RuleSet 将规则按**最右侧简单选择器（rightmost simple selector）**分桶（Bucketing）：
  - **ID Bucket**：以 `#id` 结尾的选择器
  - **Class Bucket**：以 `.class` 结尾的选择器
  - **Tag Bucket**：以 `div` 等标签名结尾的选择器
  - **Universal Bucket**：`*` 或复杂选择器
- 当需要为元素 `e` 计算样式时，引擎仅检查与 `e` 的 `id`、`class`、`tagName` 对应的桶，而非全部规则。

**RuleFeatureSet 架构**
RuleFeatureSet 是 RuleSet 的索引层。它收集所有选择器中的**特征（Features）**，如类名、ID、标签名、属性名等，用于后续的样式失效追踪（Invalidation）。

### 4.2 Bloom Filter 与 Ancestor Filter：快速排除不匹配选择器

对于复杂后代选择器（如 `.article p span`），即使最右侧 `span` 匹配，仍需验证祖先链是否包含 `.article`。为避免昂贵的祖先遍历，Blink 使用 **Bloom Filter** 和 **Ancestor Filter**：

**Bloom Filter 原理**
Bloom Filter 是一种空间高效的 Probabilistic Data Structure。在样式计算前，引擎为当前元素的祖先链构建一个 Bloom Filter，将祖先的 `tagName`、`class`、`id` 哈希后映射到一个位数组（bit array）中。

对于选择器 `.article p span`，在检查 `span` 之前，先查询 Bloom Filter：

- `.article` 是否在祖先链中？若 Bloom Filter 返回**否定（Definitely No）**，则直接排除该选择器。
- 若返回**可能（Maybe）**，则执行精确的祖先遍历验证。

由于 Bloom Filter 的**无假阴性（No False Negatives）**特性，它不会漏掉任何匹配，但可能产生少量假阳性（False Positives），这些通过后续的精确检查过滤。

**Ancestor Filter**
Ancestor Filter 是 Bloom Filter 的特化版本，它不仅在样式计算时使用，还在**样式失效（Style Invalidation）**阶段使用。当 DOM 发生变化（如添加 class），引擎更新 Ancestor Filter，快速判断哪些后代元素的选择器匹配结果可能改变。

> **精确直觉类比**：Bloom Filter 如同图书馆的检索卡片柜。卡片柜按主题分类（哈希桶），当你查找一本可能存在的书时，先查卡片柜。若卡片柜显示“该书不存在”，你可以确定无疑地离开；若显示“可能存在”，你仍需去书架上确认。卡片柜节省了绝大多数“空查找”的时间，代价是偶尔让你白跑一趟（假阳性）。

### 4.3 Invalidation Set：样式失效的精确追踪

当 DOM 或 Class 属性动态变化时，浏览器需要知道哪些元素的 Computed Style 需要重新计算。全量重算（Recalculate Style for entire document）的复杂度为 $O(n)$，在大型单页应用（SPA）中不可接受。

**Invalidation Set 机制**
Blink 的 **StyleInvalidator** 模块维护 Invalidation Sets，将 DOM 变化映射到受影响的元素集合：

1. **Class Invalidation Set**：当类名 `active` 被添加/移除时，收集所有包含 `.active` 选择器的规则，标记匹配这些规则的元素为 "style dirty"。
2. **ID Invalidation Set**：类似处理 `id` 变化。
3. **Attribute Invalidation Set**：处理 `[type="text"]` 等属性选择器。
4. **Pseudo-class Invalidation Set**：处理 `:hover`、`:focus` 等。

对于 `:has()` 选择器（如 `:has(.child)`），Invalidation Set 需要反向追踪：当 `.child` 变化时，不仅 `.child` 本身需要重算，其父链上所有可能匹配 `:has(.child)` 的元素都需要标记。Blink 为 `:has()` 引入了 **:has() invalidation set**，在元素增减时向上传播失效标记。

**`:has()` 引入后的样式回退失效策略**
`:has()` 的匹配方向是从锚点元素（anchor）向下/向内查找后代，这与传统选择器的祖先链检查相反。当 `:has()` 选择器过于复杂（如 `:has(> .direct-child + .sibling)`），Blink 无法构建精确的 Invalidation Set，此时触发 **Fallback Invalidation（回退失效）**：将失效范围扩大到包含锚点元素的整个子树，甚至整个文档。

回退失效的代价极高。优化策略包括：

- **:has() 的静态分析**：在样式表解析阶段，分析 `:has()` 内部选择器的复杂度，若无法优化则发出性能警告（DevTools）。
- **限制 :has() 的匹配深度**：Blink 对 `:has()` 的后代查找设置了深度和广度限制。

### 4.4 Cascade Layers：`@layer` 与 Scoped Styles

CSS Cascading and Inheritance Level 5 引入了 **Cascade Layers（层叠层）** 与 **Scoped Styles（作用域样式）**，从根本上改变了特异性（Specificity）的排序维度。

**@layer 机制**
`@layer` 允许开发者显式定义层叠优先级：

```css
@layer reset, base, components, utilities;
```

层的优先级顺序由声明顺序决定，与选择器特异性无关。在层 `reset` 中定义的 `!important` 规则甚至优先于层 `utilities` 中的普通规则（但弱于 `utilities` 中的 `!important`）。

形式化地，层叠优先级（Cascading Priority）$P$ 可表示为：
$$P = (L, S, O)$$
其中 $L$ 为层优先级（layer precedence），$S$ 为选择器特异性（specificity），$O$ 为源代码顺序（order of appearance）。

**@scope 机制**
`@scope` 引入了近似作用域：

```css
@scope (.article) to (.breakout) {
  p { color: darkgray; }
}
```

`.article` 为**作用域根（Scope Root）**，`.breakout` 为**作用域限制（Scope Limit）**。位于 `.article` 内但位于 `.breakout` 内的 `<p>` 不受规则影响。

`@scope` 引入了**作用域 proximity（邻近性）**作为新的层叠因子：当两个 `@scope` 规则的选择器特异性相同时，作用域根距离目标元素更近的规则获胜。

### 4.5 现代特异性计算：`:is()` / `:where()` / `:has()` / `:not()`

CSS Selectors Level 4 引入了若干伪类，其特异性计算有特殊规则：

- **`:is()`**：特异性等于其参数列表中**最高特异性选择器**的特异性。
  - `:is(#id, .class)` 的特异性为 `[1,0,0]`（ID 级别）
- **`:where()`**：特异性恒为 `[0,0,0]`，无论参数多复杂。
  - `:where(#id, .class)` 的特异性为 `[0,0,0]`
- **`:not()`**：特异性等于其参数列表中**最高特异性选择器**的特异性（同 `:is()`）。
- **`:has()`**：特异性等于其参数列表中**最高特异性选择器**的特异性。

形式化表示，设选择器特异性为三元组 $(a, b, c)$，其中 $a$ 为 ID 数量，$b$ 为类/属性/伪类数量，$c$ 为标签/伪元素数量：
$$\text{Specificity}(:is(S_1, S_2, \dots, S_n)) = \max_{i} \text{Specificity}(S_i)$$

`:has()` 的特殊性在于它是**功能性伪类（Functional Pseudo-class）**中唯一具有**反向查找语义**的。其参数选择器的匹配结果不影响 `:has()` 自身的特异性计算方式，但参数内的复杂选择器（如 `:has(:is(#a, .b) > c)`）遵循同样的 `:is()` 规则。

### 4.6 Computed Style 共享缓存

Computed Style（计算样式）是样式层叠、继承与解析的最终结果，存储于 `ComputedStyle` 对象中。在大型文档中，大量元素（如按钮、列表项）具有完全相同的计算样式。

**Style Sharing Cache（样式共享缓存）**
Chromium 在样式计算阶段维护一个 **LRU Cache**，键（Key）由以下因素决定：

- 父元素的 ComputedStyle 指针
- 元素的匹配规则集合（Matched Rules）
- 元素的 inline style
- 元素的自定义属性（CSS Variables）值
- 元素的逻辑属性（Logical Properties）解析状态

若两个元素的上述键完全相同，则它们共享同一个 `ComputedStyle` 对象，无需重新计算。这尤其受益于 **Classical Inheritance**：子元素默认继承父元素的字体、颜色等属性，因此同级同类的兄弟节点极易产生相同的 Computed Style。

共享缓存的命中率在典型网页中可达 **40%-60%**，显著降低了样式计算的内存占用与 CPU 消耗。

---

## 5. Render Tree 构建：从 DOM 到 Flattened Tree

### 5.1 Shadow DOM 与 Composed Tree

DOM（Document Object Model）是 HTML 解析器的直接产物，但它不直接对应视觉呈现。Render Tree（或现代 Chromium 中的 **Layout Tree / Flattened Tree**）需要将 Shadow DOM 与 Light DOM 组合（Compose）为单一的可布局树。

**Shadow Root 的封装边界**
Shadow DOM 为 Web Components 提供了封装边界：

- **Open Mode**：`element.shadowRoot` 可被外部 JavaScript 访问。
- **Closed Mode**：`element.shadowRoot` 返回 `null`，内部实现完全隔离。

无论 Open 或 Closed，Shadow Root 均构成一个独立的 DOM 子树。在构建 Flattened Tree 时，布局引擎执行 **Tree Composition**：

1. 从 Document Root 开始深度优先遍历。
2. 遇到 Shadow Host（具有 Shadow Root 的元素）时，不遍历其 Light DOM 子节点（除非通过 Slot 分配）。
3. 将 Shadow Root 的子节点插入到 Shadow Host 的位置，替代 Light DOM 的直接子节点。
4. 在 Shadow Tree 内部继续递归，遇到嵌套的 Shadow Host 则重复此过程。

最终得到的 **Composed Tree（组合树）** 或 **Flattened Tree（扁平化树）** 是一个包含所有可见节点的单一层级结构，作为 Layout 阶段的输入。

### 5.2 Slot Distribution 算法

`<slot>` 元素是 Shadow DOM 的插槽机制，负责将 Light DOM 的节点分发到 Shadow DOM 的指定位置。

**分配算法（Slot Assignment Algorithm）**：

1. 收集 Shadow Host 的所有直接子节点，称为 **assigned nodes（待分配节点）**。
2. 在 Shadow Tree 中查找所有 `<slot>` 元素。
3. 对于每个待分配节点：
   - 若节点具有 `slot` 属性（如 `<span slot="title">`），则将其分配给同名的 **Named Slot**（`<slot name="title">`）。
   - 若节点无 `slot` 属性，或同名的 Named Slot 不存在，则将其分配给 **Default Slot**（`<slot>` 无 `name` 属性）。
4. 若 Default Slot 不存在，未分配的节点不显示（但不从 DOM 中移除）。
5. 设置每个 slot 的 `.assignedNodes()` 和 `.assignedElements()` 属性。

**Slotchange 事件触发时机**
`slotchange` 事件在以下情况触发：

- 初始分配完成后（若 slot 获得了分配节点）。
- 已分配节点的集合发生变化（添加、移除、替换）。
- 注意：`slotchange` 是**不冒泡的（Non-bubbling）**，且必须在 slot 元素上监听。

**回退内容（Fallback Content）**
若 slot 未分配到任何节点，则显示其自身的子节点：

```html
<slot name="icon">
  <img src="default-icon.png">  <!-- 回退内容 -->
</slot>
```

> **精确直觉类比**：Slot Distribution 如同机场的值机柜台分配。乘客（Light DOM 子节点）手持不同目的地的机票（`slot="name"`），值机系统（分配算法）将他们引导至对应柜台（Named Slot）。无指定目的地的乘客去通用柜台（Default Slot）。若某个柜台关闭（无对应 slot），乘客只能在候机厅等待（不显示）。机场的广播系统（slotchange）会在航班变更时通知对应柜台的值班人员，但不会在整座航站楼广播。

### 5.3 匿名块盒的生成条件

CSS 2.1 规范规定，块级框（Block-level Box）不能直接与行内框（Inline-level Box）成为兄弟。当混合内容出现时，布局引擎必须生成 **Anonymous Block Boxes（匿名块盒）**。

**生成条件（Block Splitting 算法）**：
当块容器框（Block Container Box）同时包含块级内容与行内内容时：

1. 将连续的块级兄弟框提取出来。
2. 将剩余的行内内容包裹在一个 Anonymous Block Box 中。
3. 该 Anonymous Block Box 的 `display` 属性内部视为 `block`，但不对应任何 DOM 元素。

例如：

```html
<div>
  Some text
  <p>A paragraph</p>
  More text
</div>
```

在 Render Tree 中实际结构为：

- `<div>` block container
  - Anonymous Block Box: "Some text"
  - `<p>` block box
  - Anonymous Block Box: "More text"

Anonymous Block Box 的样式继承自其父块容器，但其自身的盒模型属性（如 `margin`、`padding`）由引擎自动计算，通常不可通过 CSS 选择器直接定位。

### 5.4 `display:none` vs `visibility:hidden` 的 LayoutObject 差异

这两个属性在视觉上都使元素不可见，但在 Render Tree / Layout Tree 中的处理截然不同：

**`display: none`**

- 不生成 **LayoutObject**（Legacy）或 **LayoutBox**（LayoutNG）。
- 元素及其所有后代均不进入 Render Tree。
- 不占据布局空间（无几何计算）。
- 无 Paint Layer，不参与合成。

**`visibility: hidden`**

- 生成 LayoutObject / LayoutBox。
- 元素的几何尺寸（width、height、margin、padding）完全计算。
- 占据布局空间。
- 创建 Paint Layer，但绘制阶段被跳过（或绘制为透明）。
- 若子元素设置 `visibility: visible`，则子元素可见（继承可被覆盖）。

在 Chromium 的代码中，`display: none` 的检查发生在 **Attach Layout Tree** 阶段：若元素的 Computed Style 为 `display: none`，则跳过 `CreateLayoutObject()` 调用。而 `visibility: hidden` 仅设置 `Visibility()` 属性为 `EVisibility::kHidden`，不影响 Layout Tree 的构建。

---

## 6. Layout：几何计算的核心

### 6.1 Legacy Layout 的问题：可变树与脏标记传播

在 LayoutNG 之前，Blink 使用 **Legacy Layout**（亦称为 "Old Layout" 或 "Mutable Layout Tree"）。其核心特征是一个**双向可变树（Bidirectional Mutable Tree）**：

- **DOM Node** ↔ **LayoutObject** 双向指针。
- LayoutObject 存储最终的几何结果：`m_frameRect`、`m_overflowRect`、`m_logicalWidth` 等。
- 当样式或内容变化时，设置**脏标记（Dirty Bits）**：`NeedsLayout`、`NeedsPositionedMovementLayout`、`ChildNeedsLayout`。
- 脏标记通过父链向上传播（MarkParentAsDirty），通过子树向下传播（MarkChildrenAsDirty）。

**可靠性危机**
Legacy Layout 的致命缺陷在于**副作用（Side Effects）**：

1. 布局函数在计算自身尺寸的同时修改子节点的位置。
2. 子节点的布局函数可能反向修改父节点的尺寸（如百分比高度解析）。
3. 多次布局遍历（Layout Passes）可能产生**累积舍入误差**。
4. `LayoutState` 等全局对象在遍历过程中被隐式修改，导致重入和状态不一致。

这些问题在复杂布局（如多列布局、弹性盒、网格）中尤为突出，催生了大量难以复现的 bug。

### 6.2 LayoutNG 架构革命

2019 年至 2021 年，Blink 团队逐步将 Legacy Layout 替换为 **LayoutNG**（Next Generation Layout）。LayoutNG 的核心哲学是**函数式布局（Functional Layout）**：

$$\text{Layout}(\text{Node}, \text{ConstraintSpace}) \rightarrow \text{Fragment Tree}$$

**关键架构变革**：

- **输入与输出分离**：Layout 算法接收一个 **Constraint Space（约束空间）** 和一个节点，输出一个不可变的 **Fragment（片段）**。
- **无副作用**：布局过程不修改输入对象，不依赖全局可变状态。
- **单次遍历（Single Pass）**：对于无子树的叶子节点，布局在单次函数调用中完成。
- **缓存友好**：相同的（Node + ConstraintSpace）组合可复用之前的 Fragment，避免重复计算。

### 6.3 不可变片段树（Immutable Fragment Tree）

LayoutNG 的输出是 **Fragment Tree**，与 Legacy Layout 的 LayoutObject Tree 分离：

- **NGPhysicalFragment**：物理坐标系下的几何结果，包含 `size`、`offset`、`baselines`。
- **NGFragmentItem**：IFC（Inline Formatting Context）中的最小单元，如文本行、行内盒。
- **NGLayoutResult**：布局算法返回的完整结果，包含 Fragment、溢出区域（Overflow）、子节点列表等。

Fragment Tree 的不可变性意味着：

- 一旦创建，Fragment 的 `size` 和 `offset` 不可修改。
- 若约束变化，创建新的 Fragment，旧 Fragment 由垃圾回收机制处理。
- 增量布局（Incremental Layout）通过比较新旧 Constraint Space 的哈希值决定是否复用 Fragment。

### 6.4 约束空间（Constraint Space）与缓存键

**Constraint Space** 是父元素传递给子元素的布局约束集合，包含：

- **Available Size**：可用空间（width/height），可能为固定值、百分比或 `kIndefinite`。
- **Percentage Resolution Size**：用于解析百分比 margin/padding 的参考尺寸。
- **Writing Mode**：书写方向（horizontal-tb、vertical-rl 等）。
- **Table Cell Constraints**：表格单元格的特殊约束（如baseline对齐）。
- **Fragmentation Constraints**：分页/分栏约束。

**缓存键（Cache Key）**
LayoutNG 使用 **(LayoutInput, ConstraintSpace)** 作为缓存键：
$$CacheKey = Hash(StyleHash, ContentHash, ConstraintSpaceHash)$$

当 DOM 变化仅影响局部子树时，若父节点的 Constraint Space 未变，子树可完全复用缓存的 Fragment Tree，实现 $O(\Delta)$ 的增量布局复杂度。

### 6.5 Inline Formatting Context（IFC）：Line Box 与 Text Shaping

IFC 是最复杂的布局上下文之一，处理行内级框（inline-level boxes）的排布。

**Line Box 构建**

1. 收集 IFC 内所有 Inline Items（文本、`<span>`、`<img>`、`<br>` 等）。
2. 按 **Bidirectional Algorithm（Unicode BiDi）** 重排序。
3. 将 items 分割为 **Line Boxes（行盒）**，每行受可用宽度限制。
4. 对每一行计算 **Strut**：一个不可见的零宽行内元素，用于确定行的最小高度和基线（baseline）。
5. 执行 **Text Justification**（若 `text-align: justify`）。

**Harfbuzz Text Shaping**
对于非拉丁文本（如阿拉伯语、印地语、中文），字形的最终呈现依赖 **Harfbuzz** 库：

- Harfbuzz 接收 Unicode 码点序列和字体文件（OpenType/GPOS/GSUB）。
- 输出 **Glyph ID 序列** 及每个 glyph 的偏移（X, Y）和进宽（Advance Width）。
- 复杂脚本（如阿拉伯语的上下文形变）通过字体中的 `calt`、`init`、`medi`、`fina` 特征表处理。

在 LayoutNG 中，文本 shaping 发生在 IFC 构建阶段，输出 **NGTextFragment**，包含 shaping 后的字形信息和几何边界。

### 6.6 Block Formatting Context（BFC）：Margin Collapse 的三类规则

BFC 中的 **Margin Collapse（外边距折叠）** 是 CSS 最反直觉的特性之一。三个独立的外边距可能折叠为一个，其规则分为三类：

**（1）相邻兄弟元素（Adjacent Siblings）**
若两个块级兄弟元素的垂直外边距相邻（无 border、padding、clearance 分隔），则：
$$M_{collapsed} = \max(M_1, M_2)$$
正 margin 与负 margin 相加：$M_{collapsed} = \max(M_{positive}) + \min(M_{negative})$。

**（2）父元素与首/末子元素（Parent-First/Last Child）**
若父元素的 margin-top 与其第一个子元素的 margin-top 之间无 border/padding 分隔，则二者折叠。同理适用于 margin-bottom 与末子元素。

此时，折叠后的外边距位于**父元素的外部**。这意味着：

```css
.parent { margin-top: 20px; }
.child { margin-top: 30px; }
```

父元素与子元素的整体上边距为 `30px`，而非 `50px`。

**（3）空块元素（Empty Blocks）**
若一个块元素无内容、无 border、无 padding、无 height/min-height，则其 margin-top 与 margin-bottom 相互折叠：
$$M_{collapsed} = \max(M_{top}, M_{bottom})$$
折叠后的 margin 穿透该空块，影响其上下兄弟元素。

> **精确直觉类比**：Margin Collapse 类似于两栋相邻大楼的顶部天台。若两栋楼之间没有围墙（border/padding）隔开，较高的天台高度决定了整个区域的天际线（折叠后的 margin）。若中间有一栋空壳楼（empty block），它的顶层和底层天台也会合并，最终效果仿佛这栋楼不存在。这个类比在大多数情况成立，但需注意：建立新的 Formatting Context（如 `overflow: hidden`、`display: flow-root`）会在两栋楼之间竖起一堵不可见的防火墙，阻止 margin 穿透。

### 6.7 Flexbox 算法的 9 个步骤

CSS Flexible Box Layout Module Level 1 将 Flex 布局算法精确定义为 9 个步骤。以下给出形式化描述：

设容器的主轴尺寸为 $C_{main}$，交叉轴尺寸为 $C_{cross}$，共有 $n$ 个 flex items。

**Step 1: 生成匿名 flex items**
将连续的纯文本节点包裹为匿名 flex item。每个 flex item 的初始样式由其元素的 `display` 决定（必须为 `flex` 容器的直接子节点）。

**Step 2: 确定可用主轴与交叉轴尺寸**

- 若容器的 `width`/`height` 确定，则 $C_{main}$、$C_{cross}$ 为固定值。
- 若为 `auto`，则 $C_{main}$ 受父 Constraint Space 限制。
- 解析 `row-gap` 与 `column-gap`。

**Step 3: 确定 flex base size**
对每个 item $i$：

- 若 `flex-basis` 为 `auto` 且 `width`/`height` 确定，则 $B_i = main\_size(width/height)$。
- 若 `flex-basis` 为具体长度，则 $B_i = flex\_basis$。
- 若为 `content`，则 $B_i = max\_content$ 尺寸（基于内容最大宽度）。

**Step 4: 确定 hypothetical main size**
将 $B_i$ 受限于 `min-width`/`max-width`（或对应主轴属性）：
$$H_i = clamp(B_i, min_i, max_i)$$

**Step 5: 收集 flex lines**
根据 `flex-wrap` 将 items 分装入 flex lines：

- `nowrap`：所有 items 放入单行，行宽 $L = \sum H_i + \sum gap$。
- `wrap`：当累计宽度超过 $C_{main}$ 时换行。

**Step 6: 解析弹性长度（Resolve Flexible Lengths）**
设剩余空间 $R = C_{main} - \sum H_i$。

- 若 $R > 0$（扩张）：
  计算 flex grow 因子：$G_i = flex\_grow_i \cdot H_i$
  分配比例：$\Delta_i = R \cdot \frac{G_i}{\sum G_j}$
- 若 $R < 0$（收缩）：
  计算 flex shrink 因子：$S_i = flex\_shrink_i \cdot H_i$
  注意：规范定义了 **scaled flex shrink factor** $\hat{S}_i = S_i \cdot min\_size_i$ 的复杂算法，防止小元素被过度压缩。
  分配后尺寸受限于 `min-width`/`max-width`。

**Step 7: 确定交叉轴尺寸**

- 若 `align-items: stretch` 且 item 的交叉轴尺寸为 `auto`，则交叉轴尺寸等于该 flex line 的最大交叉轴尺寸。
- 否则，使用内容高度或指定高度。

**Step 8: 对齐 flex lines（`align-content`）**
在多行情况下，根据 `align-content`（`flex-start`、`center`、`space-between`、`space-around`、`stretch`）分配各行在容器交叉轴上的位置。

**Step 9: 对齐 items（`justify-content` 与 `align-items`）**

- 主轴对齐：`justify-content` 分配 item 在行内的剩余空间。
- 交叉轴对齐：`align-items` / `align-self` 确定 item 在 line 内的垂直位置。
- **Auto Margin**：若 item 在某一轴上 `margin: auto`，则吸收该轴上所有剩余空间，实现完美居中。

### 6.8 Grid 的 Track Sizing Algorithm

CSS Grid Layout 的 Track Sizing 是一个多维约束求解问题。

**术语定义**

- **Explicit Grid**：由 `grid-template-columns` 和 `grid-template-rows` 定义的轨道。
- **Implicit Grid**：因放置超出 explicit grid 范围的 items 而自动生成的轨道。
- **Track**：网格的一行或一列。
- **Grid Area**：一个 item 占据的矩形区域，跨一个或多个 track。

**Track Sizing Algorithm（简化版）**

设需要确定 $m$ 列 tracks 的宽度 $[w_1, w_2, \dots, w_m]$。

**Phase 1: 初始化轨道**

- 对于固定尺寸（`100px`、`10%`）：$w_i = specified\_value$。
- 对于 `fr` 单位：初始 $w_i = 0$，待 Phase 3 分配。
- 对于 `minmax(min, max)`：初始 $w_i = min$。

**Phase 2: 解析基于内容的尺寸（Intrinsic Sizing）**
遍历所有 grid items，对于每个 item 的主轴尺寸需求：

- 若 item 跨单个 track：
  - `auto` / `min-content` track：$w_i \geq item\_min\_content$
  - `max-content` track：$w_i \geq item\_max\_content$
- 若 item 跨多个 tracks：
  将 item 的尺寸需求按比例或均等策略分配到所跨 tracks 上。

此阶段需迭代至收敛，因为一个 track 可能受多个 spanning items 约束。

**Phase 3: 增长轨道以填充剩余空间**
计算剩余空间 $R = ContainerWidth - \sum w_i$。

- 仅增长标记为 `fr` 的 tracks。
- 设总 fr 值为 $F = \sum fr_i$，则每个 fr track 增长 $\Delta_i = R \cdot \frac{fr_i}{F}$。
- 但增长后不得超出 `max` 限制（若 track 为 `minmax`）。

**Phase 4: 处理隐式轨道与 subgrid**

- 若有 items 放置在 explicit grid 之外，创建 implicit tracks，其尺寸默认为 `auto`（可由 `grid-auto-columns`/`grid-auto-rows` 控制）。
- **Subgrid**：子网格的 track 尺寸由父网格继承。子网格的 `grid-template-columns: subgrid` 意味着其列轨道与父网格的对应列轨道完全同步尺寸。这引入了跨树约束，需父网格先完成 sizing，子网格才能布局。

### 6.9 Subtree Layout 与 Layout Boundaries

现代浏览器的布局优化依赖于**布局边界的识别**：

**Layout Root**
当样式变化发生时，引擎寻找**布局根（Layout Root）**：受变化影响的最高层节点，其上方所有节点的布局不受此变化影响。布局计算从 Layout Root 开始向下遍历。

**CSS Containment**
`contain: layout` 显式建立布局边界：

- 子树内的布局变化不向外传播。
- 外部布局变化不向内传播（除非强制同步）。
- 这为引擎提供了强有力的优化保证。

**Layout Boundaries（布局边界）**
即使没有 `contain: layout`，引擎也会启发式地识别隐式布局边界：

- `transform`、`opacity`、`will-change` 等元素常形成合成层，也隐式限制布局传播。
- 独立的 BFC（如 `overflow: hidden`、`display: flow-root`）可阻止 margin collapse 传播，但不一定阻止尺寸变化传播。

---

## 7. 对称差分析：Legacy vs LayoutNG

设 Legacy Layout 模型为 $M_1$，LayoutNG 模型为 $M_2$。二者的对称差（Symmetric Difference）$\Delta(M_1, M_2)$ 包含以下核心差异：

**数据模型差异**

- $M_1$：单一可变树（Mutable LayoutObject Tree），布局结果直接写入节点。
- $M_2$：分离的输入-输出模型（DOM + Style → Constraint Space → Fragment Tree），结果不可变。

**计算范式差异**

- $M_1$：命令式（Imperative），全局状态（`LayoutState`）在遍历中被修改。
- $M_2$：函数式（Functional），$Layout(Node, CS) \rightarrow Fragment$，无副作用。

**缓存与复用差异**

- $M_1$：脏标记传播（Dirty Bit Propagation），子树可能因父节点一个尺寸变化而完全重算。
- $M_2$：基于 Constraint Space 哈希的缓存，子树在约束不变时完全复用。

**可靠性差异**

- $M_1$：存在**双向依赖**（子依赖父的 Constraint，父依赖子的 Size），导致循环依赖和舍入误差累积。
- $M_2$：**单向数据流**（Top-down Constraints → Bottom-up Sizes），通过 **Layout Pass Isolation** 消除循环。

**复杂度差异**

- $M_1$：布局代码高度耦合，BFC/Flex/Grid 在 LayoutObject 子类中交错实现。
- $M_2$：每种布局算法（Block、Flex、Grid、Table）拥有独立的 **Layout Algorithm Object**（如 `NGFlexLayoutAlgorithm`），通过多态接口与框架交互。

**性能特征差异**

| 维度 | Legacy ($M_1$) | LayoutNG ($M_2$) |
|---|---|---|
| 初始布局 | 较快（直接写入） | 稍慢（构建 Fragment Tree） |
| 增量布局 | $O(n)$ 子树重算 | $O(\Delta)$ 缓存复用 |
| 内存占用 | 较低 | 较高（双树结构） |
| 多线程潜力 | 极低（全局可变状态） | 高（不可变数据结构） |

---

## 8. 工程决策矩阵

在构建自定义布局引擎（如 React Native、Flutter for Web、PDF 渲染器）时，以下决策矩阵指导架构选择：

| 决策维度 | 选项 A：Legacy 风格 | 选项 B：LayoutNG 风格 | 推荐场景 |
|---|---|---|---|
| **树模型** | 单一可变树 | 输入-输出分离的不可变树 | B 适合大型动态文档；A 适合静态一次性渲染 |
| **缓存策略** | 脏标记传播 | Constraint Space 哈希缓存 | B 适合高交互 SPA；A 适合简单页面 |
| **布局算法实现** | 子类化覆写 | 独立算法对象 + 多态 | B 降低算法间耦合，利于单元测试 |
| **文本处理** | 平台原生 API | 统一 Shaping 库（HarfBuzz） | B 保证跨平台一致性；A 依赖平台字体引擎 |
| **并行度** | 单线程 | 工作窃取（Work Stealing）线程池 | B 适合多核设备；A 适合资源受限嵌入式 |
| **内存预算** | 低（复用对象） | 中（Fragment 对象池） | A 适合 < 1GB 内存设备；B 适合桌面/移动端 |
| **容错需求** | 高（容错解析+恢复） | 中（严格输入验证） | A 适合 Web 浏览器；B 适合受控内容（如设计工具） |

**关键结论**：对于现代 Web 浏览器，LayoutNG 风格是无可争议的优胜者，因其可靠性、可测试性和增量性能。但对于资源极度受限（如智能手表）或输入完全受控（如 Figma 的文档渲染）的场景，Legacy 风格的低内存占用仍具吸引力。

---

## 9. 精确直觉类比与边界

**浏览器解析与布局引擎的全局类比**

将整个浏览器渲染管线类比为一座**自动化印刷厂**：

1. **HTML Tokenizer** 如同印刷厂的**拆信与分拣员**。它面对成堆的 raw HTML（信件），按照 80 多条规则将每一封信拆分为地址标签（start tag）、内容页（text token）和回执（end tag）。它极其宽容——即使信件格式混乱（错误嵌套），它也不会撕毁信件，而是贴上修正标签继续处理。

2. **Tree Construction** 如同**装订车间**。分拣员传来的页面按顺序被装订成册（DOM 树）。Adoption Agency Algorithm 相当于装订工发现章节顺序错乱时，在有限次尝试（8 次）内重新整理页码；Foster Parenting 则像发现某页本应属于附录却被错放到了正文中时，将其粘贴在正确的位置（表格外部）。

3. **Preload Scanner** 如同**原料采购部**。装订车间因等待特殊油墨（同步脚本）而停工时，采购部根据订单预览提前采购后续章节所需的纸张和图片。它不干涉装订，却确保生产线恢复时原料齐备。

4. **CSS 样式计算** 如同**排版规格部**。Bloom Filter 是规格部的快速索引柜；Invalidation Set 是变更通知系统，当某章节修改时，仅通知受影响的排版台重新计算。

5. **LayoutNG** 如同**数控机床（CNC）**。Legacy Layout 是手工车床，师傅一边测量一边调整（可变状态）；LayoutNG 则是将图纸（Constraint Space）输入电脑，由机床一次性精确加工出零件（Fragment），零件尺寸永久固定（不可变），可复用于相同订单。

**边界与“哪里不像”**

- **印刷厂是线性的，布局树是分支的**：印刷厂按页码顺序处理，而布局中的父子约束传播是树形的双向流动。
- **印刷错误可召回，布局错误不可撤销**：浏览器不能因解析错误而拒绝显示页面，必须输出*某种*结果；而印刷厂可以停机检查。
- **原料是无限的，带宽是有限的**：Preload Scanner 的预测采购受网络带宽和 CSP 策略限制，真实印刷厂的纸张通常是无限的。

---

## 10. 反例与局限性

**反例 1：LayoutNG 的内存膨胀问题**

LayoutNG 的不可变 Fragment Tree 在大型、频繁变化的文档中会导致显著的内存分配压力。

**具体场景**：在一个实时协作的文档编辑器（如 Google Docs）中，用户每输入一个字符都会触发 IFC 的重新布局。LayoutNG 会创建新的 Line Box Fragments 和 Text Fragments，旧 Fragments 等待垃圾回收。在高频输入场景下（> 10 chars/sec），Legacy Layout 的原地修改模型反而内存更稳定，而 LayoutNG 可能触发频繁的 GC 停顿。

**根本原因**：不可变数据结构的优势在于共享与复用，但当变化粒度极细且变化频率极高时，对象创建速率超过复用收益。

**修正方案**：引入 **Fragment Object Pool（片段对象池）**。对高频变化的布局上下文（如文本编辑区域），使用对象池复用 Fragment 的内存空间，而非完全依赖 GC。Chromium 已在 LayoutNG 中实现了部分对象池（如 `NGFragmentItem` 的 arena allocation），但尚未覆盖所有 Fragment 类型。

**反例 2：Bloom Filter 在深层 DOM 中的假阳性累积**

在拥有 50+ 层嵌套（如深层嵌套的 React/Vue 组件树）的 DOM 中，Bloom Filter 的位数组会因哈希碰撞而产生严重的假阳性累积。

**具体场景**：假设一个电商页面的商品列表使用了 30 层嵌套的 `<div>` 容器，每一层都有动态的 `className`。Ancestor Filter 的 Bloom Filter 位数组（通常 256~512 位）在 30 次哈希插入后，假阳性率 $p$ 按公式：
$$p \approx \left(1 - e^{-kn/m}\right)^k$$
其中 $k$ 为哈希函数数量，$n$ 为插入元素数，$m$ 为位数。当 $n=30$、$m=256$、$k=3$ 时，$p \approx 12\%$。这意味着约 12% 的选择器匹配检查会错误地进入昂贵的精确遍历，在复杂样式表下成为性能瓶颈。

**根本原因**：Bloom Filter 的假设是 $n \ll m$，但深层 DOM 的祖先链长度可能接近或超过位数组的设计容量。

**修正方案**：采用**分层 Bloom Filter（Hierarchical Bloom Filter）**。将 DOM 树按深度划分为若干层（如每 16 层为一组），每组维护独立的 Bloom Filter。选择器匹配时，仅需检查目标元素所在层及其上方的分层过滤器，将单次 $n$ 降为 $n/L$（$L$ 为层数），显著降低假阳性率。或者，对于已知深层树的应用，动态扩展 Bloom Filter 的位数组大小（自适应位图）。

---

## TypeScript 代码示例

### 示例 1：HTML Tokenizer 状态机模拟

```typescript
/**
 * 简化版 HTML5 Tokenizer 状态机模拟
 * 覆盖：Data state, Tag open, Tag name, End tag, Character reference
 */
type Token =
  | { type: 'StartTag'; name: string; attrs: Record<string, string> }
  | { type: 'EndTag'; name: string }
  | { type: 'Text'; content: string }
  | { type: 'Doctype'; quirks: boolean };

type State =
  | 'Data' | 'TagOpen' | 'EndTagOpen' | 'TagName'
  | 'BeforeAttrName' | 'AttrName' | 'BeforeAttrValue' | 'AttrValueDQ'
  | 'CharRef' | 'NumericCharRef';

class HTMLTokenizer {
  private state: State = 'Data';
  private buffer = '';
  private tokens: Token[] = [];
  private currentTag: { name: string; attrs: Record<string,string>; selfClosing: boolean } | null = null;
  private currentAttr: { name: string; value: string } | null = null;
  private returnState: State = 'Data';

  constructor(private input: string) {}

  tokenize(): Token[] {
    for (let i = 0; i <= this.input.length; i++) {
      const ch = this.input[i] ?? '\0'; // EOF
      this.step(ch);
    }
    return this.tokens;
  }

  private step(ch: string): void {
    switch (this.state) {
      case 'Data':
        if (ch === '<') {
          this.emitText();
          this.state = 'TagOpen';
        } else if (ch === '&') {
          this.returnState = 'Data';
          this.state = 'CharRef';
        } else if (ch !== '\0') {
          this.buffer += ch;
        }
        break;

      case 'TagOpen':
        if (ch === '/') {
          this.state = 'EndTagOpen';
        } else if (/[a-zA-Z]/.test(ch)) {
          this.currentTag = { name: ch.toLowerCase(), attrs: {}, selfClosing: false };
          this.state = 'TagName';
        } else if (ch === '!') {
          // Simplified: treat as bogus comment/doctype
          this.state = 'Data';
        }
        break;

      case 'EndTagOpen':
        if (/[a-zA-Z]/.test(ch)) {
          this.currentTag = { name: ch.toLowerCase(), attrs: {}, selfClosing: false };
          this.state = 'TagName';
        }
        break;

      case 'TagName':
        if (ch === ' ' || ch === '\n') {
          this.state = 'BeforeAttrName';
        } else if (ch === '>') {
          this.emitStartTag();
          this.state = 'Data';
        } else if (ch === '/') {
          if (this.currentTag) this.currentTag.selfClosing = true;
        } else if (/[a-zA-Z0-9]/.test(ch)) {
          this.currentTag!.name += ch.toLowerCase();
        }
        break;

      case 'BeforeAttrName':
        if (/[a-zA-Z]/.test(ch)) {
          this.currentAttr = { name: ch.toLowerCase(), value: '' };
          this.state = 'AttrName';
        } else if (ch === '>') {
          this.emitStartTag();
          this.state = 'Data';
        }
        break;

      case 'AttrName':
        if (ch === '=') {
          this.state = 'BeforeAttrValue';
        } else if (/[a-zA-Z0-9-]/.test(ch)) {
          this.currentAttr!.name += ch.toLowerCase();
        }
        break;

      case 'BeforeAttrValue':
        if (ch === '"') {
          this.state = 'AttrValueDQ';
        } else if (/[^ \n>]/.test(ch)) {
          this.currentAttr!.value += ch;
          this.state = 'BeforeAttrValue'; // simplified unquoted
        }
        break;

      case 'AttrValueDQ':
        if (ch === '"') {
          this.currentTag!.attrs[this.currentAttr!.name] = this.currentAttr!.value;
          this.state = 'BeforeAttrName';
        } else {
          this.currentAttr!.value += ch;
        }
        break;

      case 'CharRef':
        if (ch === '#') {
          this.state = 'NumericCharRef';
          this.buffer = '';
        } else {
          // Simplified named refs: &amp; &lt; &gt;
          this.buffer += ch;
        }
        break;

      case 'NumericCharRef':
        if (ch === ';') {
          const code = parseInt(this.buffer, this.buffer.startsWith('x') ? 16 : 10);
          const char = isNaN(code) ? '\uFFFD' : String.fromCodePoint(code);
          this.buffer = char;
          this.state = this.returnState;
        } else if (/[0-9a-fA-FxX]/.test(ch)) {
          this.buffer += ch;
        }
        break;
    }
  }

  private emitText(): void {
    if (this.buffer) {
      this.tokens.push({ type: 'Text', content: this.buffer });
      this.buffer = '';
    }
  }

  private emitStartTag(): void {
    if (!this.currentTag) return;
    if (this.currentTag.name.startsWith('/')) {
      this.tokens.push({ type: 'EndTag', name: this.currentTag.name.slice(1) });
    } else {
      this.tokens.push({ type: 'StartTag', name: this.currentTag.name, attrs: this.currentTag.attrs });
    }
    this.currentTag = null;
  }
}

// Demo
const tokenizer = new HTMLTokenizer('<div class="box"><p>Hello &amp; world</p></div>');
console.log(tokenizer.tokenize());
```

### 示例 2：CSS Selector Matching 性能分析器（Bloom Filter 模拟）

```typescript
/**
 * 模拟 Ancestor Filter 中的 Bloom Filter 快速排除机制
 */
class BloomFilter {
  private bits: Uint8Array;
  private size: number;
  private hashCount = 3;

  constructor(size: number = 256) {
    this.size = size;
    this.bits = new Uint8Array(size);
  }

  private hashes(value: string): number[] {
    // Simple djb2 / sdbm hybrid for demo
    let h1 = 5381, h2 = 0;
    for (let i = 0; i < value.length; i++) {
      const c = value.charCodeAt(i);
      h1 = ((h1 << 5) + h1) + c;
      h2 = c + (h2 << 6) + (h2 << 16) - h2;
    }
    return [
      Math.abs(h1) % this.size,
      Math.abs(h2) % this.size,
      Math.abs(h1 ^ h2) % this.size
    ];
  }

  add(value: string): void {
    for (const h of this.hashes(value)) {
      this.bits[h] = 1;
    }
  }

  maybeContains(value: string): boolean {
    return this.hashes(value).every(h => this.bits[h] === 1);
  }

  reset(): void {
    this.bits.fill(0);
  }
}

class AncestorFilterSimulator {
  private filter = new BloomFilter(512);

  // 模拟从当前元素向上构建祖先过滤器
  buildFilter(ancestors: string[]): void {
    this.filter.reset();
    for (const tag of ancestors) {
      this.filter.add(tag);
    }
  }

  // 快速排除不匹配的后代选择器
  canMatch(selectorChain: string[]): boolean {
    // selectorChain 如 ['article', 'section', 'p']
    // 检查除了最右侧外的所有祖先需求
    for (let i = 0; i < selectorChain.length - 1; i++) {
      if (!this.filter.maybeContains(selectorChain[i])) {
        return false; // 确定不匹配（无假阴性）
      }
    }
    return true; // 可能匹配，需精确验证
  }
}

// Demo
const af = new AncestorFilterSimulator();
af.buildFilter(['html', 'body', 'article', 'section', 'div']);
console.log(af.canMatch(['article', 'p'])); // true (maybe)
console.log(af.canMatch(['header', 'p']));  // false (definitely no)
```

### 示例 3：Shadow DOM Slot Distribution 模拟器

```typescript
/**
 * 模拟 Shadow DOM 的 Slot Distribution 算法
 */
interface LightNode {
  type: 'element' | 'text';
  tagName?: string;
  slot?: string;
  text?: string;
  children?: LightNode[];
}

interface SlotDef {
  name?: string;
  fallback?: LightNode[];
}

class ShadowRootSimulator {
  private slots = new Map<string | undefined, SlotDef>();
  private assignedNodes = new Map<string | undefined, LightNode[]>();

  defineSlot(slotDef: SlotDef): void {
    this.slots.set(slotDef.name, slotDef);
    this.assignedNodes.set(slotDef.name, []);
  }

  // 执行 Slot Distribution
  distribute(lightChildren: LightNode[]): void {
    // 清空现有分配
    for (const key of this.assignedNodes.keys()) {
      this.assignedNodes.set(key, []);
    }

    for (const child of lightChildren) {
      const slotName = child.type === 'element' ? child.slot : undefined;
      const targetSlot = this.slots.has(slotName) ? slotName : undefined;

      if (this.slots.has(targetSlot)) {
        this.assignedNodes.get(targetSlot)!.push(child);
      }
      // 若无 default slot 且无匹配，节点被“丢弃”（不渲染）
    }
  }

  getFlattenedTree(lightChildren: LightNode[]): LightNode[] {
    this.distribute(lightChildren);
    const result: LightNode[] = [];

    for (const [name, slot] of this.slots) {
      const assigned = this.assignedNodes.get(name)!;
      if (assigned.length > 0) {
        result.push(...assigned);
      } else if (slot.fallback) {
        result.push(...slot.fallback);
      }
    }
    return result;
  }
}

// Demo
const shadow = new ShadowRootSimulator();
shadow.defineSlot({ name: 'title' });
shadow.defineSlot({ name: undefined, fallback: [{ type: 'text', text: 'Default content' }] });

const lightDOM: LightNode[] = [
  { type: 'element', tagName: 'h2', slot: 'title', text: 'Chapter 1' },
  { type: 'element', tagName: 'p', text: 'Body paragraph' }
];

console.log(shadow.getFlattenedTree(lightDOM));
// [ { type: 'element', tagName: 'h2', slot: 'title', text: 'Chapter 1' },
//   { type: 'text', text: 'Default content' } ]
```

### 示例 4：LayoutNG Constraint Space 可视化

```typescript
/**
 * 模拟 LayoutNG 的 Constraint Space 与缓存键机制
 */
interface ConstraintSpace {
  availableWidth: number;
  availableHeight: number;
  percentageResolutionWidth: number;
  percentageResolutionHeight: number;
  writingMode: 'horizontal-tb' | 'vertical-rl' | 'vertical-lr';
  isFixedInlineSize: boolean;
  isFixedBlockSize: boolean;
}

interface LayoutInput {
  styleHash: string;
  contentHash: string;
}

interface NGFragment {
  width: number;
  height: number;
  baseline: number;
  children: NGFragment[];
  cacheHit?: boolean;
}

class LayoutNGCache {
  private cache = new Map<string, NGFragment>();

  private makeKey(input: LayoutInput, space: ConstraintSpace): string {
    return `${input.styleHash}|${input.contentHash}|` +
           `${space.availableWidth}x${space.availableHeight}|` +
           `${space.writingMode}`;
  }

  layout(input: LayoutInput, space: ConstraintSpace): NGFragment {
    const key = this.makeKey(input, space);
    const cached = this.cache.get(key);
    if (cached) {
      return { ...cached, cacheHit: true };
    }

    // 模拟布局计算
    const fragment: NGFragment = {
      width: Math.min(space.availableWidth, 800),
      height: space.availableHeight === Infinity ? 600 : space.availableHeight,
      baseline: 16,
      children: [],
      cacheHit: false
    };

    this.cache.set(key, fragment);
    return fragment;
  }

  invalidate(styleHash: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(styleHash + '|')) {
        this.cache.delete(key);
      }
    }
  }
}

// Demo
const engine = new LayoutNGCache();
const space: ConstraintSpace = {
  availableWidth: 1024,
  availableHeight: Infinity,
  percentageResolutionWidth: 1024,
  percentageResolutionHeight: 768,
  writingMode: 'horizontal-tb',
  isFixedInlineSize: true,
  isFixedBlockSize: false
};

const input: LayoutInput = { styleHash: 'abc123', contentHash: 'content456' };
console.log(engine.layout(input, space)); // cacheHit: false
console.log(engine.layout(input, space)); // cacheHit: true
```

### 示例 5：Flexbox 9 步算法实现

```typescript
/**
 * 简化版 Flexbox 9 步算法核心实现
 */
interface FlexItem {
  flexGrow: number;
  flexShrink: number;
  flexBasis: number | 'auto';
  minWidth: number;
  maxWidth: number;
  contentWidth: number;
}

interface FlexLine {
  items: FlexItem[];
  mainSize: number;
}

function resolveFlexBasis(item: FlexItem): number {
  if (item.flexBasis !== 'auto') return item.flexBasis;
  return item.contentWidth;
}

function clamp(size: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, size));
}

class FlexboxEngine {
  layout(containerWidth: number, items: FlexItem[]): FlexLine[] {
    // Step 1 & 3 & 4: Determine flex base size & hypothetical main size
    const hypotheticalSizes = items.map(item => {
      const base = resolveFlexBasis(item);
      return clamp(base, item.minWidth, item.maxWidth);
    });

    // Step 5: Collect flex lines (simplified single line / nowrap)
    const line: FlexLine = { items: [], mainSize: 0 };
    let usedSpace = 0;
    for (let i = 0; i < items.length; i++) {
      line.items.push(items[i]);
      usedSpace += hypotheticalSizes[i];
    }
    line.mainSize = usedSpace;

    // Step 6: Resolve flexible lengths
    const totalHypothetical = hypotheticalSizes.reduce((a, b) => a + b, 0);
    const remaining = containerWidth - totalHypothetical;

    const finalSizes = hypotheticalSizes.map((h, idx) => {
      const item = items[idx];
      if (remaining > 0 && item.flexGrow > 0) {
        const totalGrow = items.reduce((s, it) => s + it.flexGrow, 0);
        const delta = remaining * (item.flexGrow / totalGrow);
        return clamp(h + delta, item.minWidth, item.maxWidth);
      } else if (remaining < 0 && item.flexShrink > 0) {
        const totalShrink = items.reduce((s, it) => s + it.flexShrink * h, 0);
        const delta = remaining * (item.flexShrink * h / totalShrink);
        return clamp(h + delta, item.minWidth, item.maxWidth);
      }
      return h;
    });

    // Step 7-9: Simplified cross-axis and alignment
    return [{
      items: items.map((it, i) => ({ ...it, _finalMainSize: finalSizes[i] } as any)),
      mainSize: finalSizes.reduce((a, b) => a + b, 0)
    }];
  }
}

// Demo
const items: FlexItem[] = [
  { flexGrow: 1, flexShrink: 0, flexBasis: 200, minWidth: 100, maxWidth: 400, contentWidth: 200 },
  { flexGrow: 2, flexShrink: 1, flexBasis: 200, minWidth: 100, maxWidth: 500, contentWidth: 200 },
];

const engine = new FlexboxEngine();
console.log(engine.layout(800, items));
```

### 示例 6：Grid Track Sizing 计算器

```typescript
/**
 * 简化版 Grid Track Sizing Algorithm
 * 支持：固定宽度、auto、minmax、fr 单位
 */
type TrackSize =
  | { type: 'fixed'; value: number }
  | { type: 'auto' }
  | { type: 'minmax'; min: number | 'auto'; max: number | 'fr' | 'auto' }
  | { type: 'fr'; value: number };

interface GridItem {
  columnSpan: number;
  rowSpan: number;
  minContentWidth: number;
  maxContentWidth: number;
}

class GridTrackSizer {
  solveTracks(
    containerWidth: number,
    tracks: TrackSize[],
    items: GridItem[]
  ): number[] {
    const widths: number[] = new Array(tracks.length).fill(0);
    const frTracks: number[] = [];

    // Phase 1: Initialize fixed and minmax(min)
    for (let i = 0; i < tracks.length; i++) {
      const t = tracks[i];
      if (t.type === 'fixed') {
        widths[i] = t.value;
      } else if (t.type === 'minmax') {
        widths[i] = t.min === 'auto' ? 0 : t.min;
      } else if (t.type === 'fr') {
        frTracks.push(i);
        widths[i] = 0; // placeholder
      }
      // 'auto' starts at 0
    }

    // Phase 2: Intrinsic sizing for 'auto' and 'minmax' tracks
    // Simplified: distribute max-content contribution to spanned tracks
    for (const item of items) {
      if (item.columnSpan === 1) {
        for (let c = 0; c < tracks.length; c++) {
          const t = tracks[c];
          if (t.type === 'auto' || (t.type === 'minmax' && t.max === 'auto')) {
            widths[c] = Math.max(widths[c], item.maxContentWidth);
          }
        }
      }
    }

    // Phase 3: Grow fr tracks
    const usedSpace = widths.reduce((a, b) => a + b, 0);
    const remaining = Math.max(0, containerWidth - usedSpace);

    if (remaining > 0 && frTracks.length > 0) {
      const totalFr = frTracks.reduce((s, idx) => s + (tracks[idx] as any).value, 0);
      for (const idx of frTracks) {
        const fr = (tracks[idx] as any).value as number;
        widths[idx] = remaining * (fr / totalFr);
      }
    }

    // Phase 4: Ensure minmax max constraint (simplified)
    for (let i = 0; i < tracks.length; i++) {
      const t = tracks[i];
      if (t.type === 'minmax' && typeof t.max === 'number') {
        widths[i] = Math.min(widths[i], t.max);
      }
    }

    return widths;
  }
}

// Demo
const tracks: TrackSize[] = [
  { type: 'fixed', value: 200 },
  { type: 'auto' },
  { type: 'fr', value: 1 },
  { type: 'minmax', min: 100, max: 'fr' }
];

const items: GridItem[] = [
  { columnSpan: 1, rowSpan: 1, minContentWidth: 150, maxContentWidth: 300 }
];

const sizer = new GridTrackSizer();
console.log(sizer.solveTracks(1000, tracks, items));
```

---

## 参考文献

1. WHATWG. *HTML Living Standard — Parsing HTML documents*. <https://html.spec.whatwg.org/multipage/parsing.html> (2025)
2. W3C. *CSSOM Module Level 1*. <https://www.w3.org/TR/cssom-1/> (2023)
3. W3C. *CSS Cascading and Inheritance Level 5*. <https://www.w3.org/TR/css-cascade-5/> (2022)
4. W3C. *CSS Flexible Box Layout Module Level 1*. <https://www.w3.org/TR/css-flexbox-1/> (2018)
5. W3C. *CSS Grid Layout Module Level 2*. <https://www.w3.org/TR/css-grid-2/> (2020)
6. Chromium Project. *LayoutNG*. <https://www.chromium.org/blink/layoutng/> (2021)
7. Chrome Developers. *Inside look at modern web browser (Part 2)*. <https://developer.chrome.com/blog/inside-browser-part2/> (2018)
8. Google. *RenderingNG: An overview*. <https://developer.chrome.com/articles/renderingng/> (2022)
9. Rune Lillesveen et al. *Style Invalidation in Blink*. BlinkOn Conference (2017)
10. Emilio Cobos Álvarez. *:has() invalidation in Gecko*. Mozilla Hacks (2022)
