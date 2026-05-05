---
title: '模块化系统与 Web Components'
description: 'Module Systems and Web Components: ES Modules, Import Maps, Module Federation, Web Components Lifecycle, and Custom Element Architecture'
last-updated: 2026-05-05
review-cycle: 6 months
next-review: 2026-11-05
status: complete
priority: P0
english-abstract: 'A comprehensive technical analysis of JavaScript module systems and Web Components architecture, covering ES Modules semantics, Import Maps resolution, Module Federation patterns, Custom Elements lifecycle, Shadow DOM encapsulation, and their interaction with modern bundlers and frameworks.'
references:
  - 'W3C, Web Components Specs (Custom Elements, Shadow DOM, HTML Templates)'
  - 'WHATWG, HTML Module Script Specification'
  - 'WICG, Import Maps'
  - 'Module Federation, webpack 5 / vite'
  - 'W3C, HTML Web Components Proposal'
---

# 模块化系统与 Web Components

> **理论深度**: 高级
> **前置阅读**: [24-http-protocol-stack.md](24-http-protocol-stack.md), [25-event-loop-and-concurrency-model.md](25-event-loop-and-concurrency-model.md)
> **目标读者**: 前端架构师、浏览器开发者、组件库作者
> **核心问题**: ES Module 的静态解析语义如何影响加载性能？Web Components 的原生封装与框架组件模型如何共存？

---

## 目录

- [模块化系统与 Web Components](#模块化系统与-web-components)
  - [目录](#目录)
  - [1. ES Module 的形式化语义](#1-es-module-的形式化语义)
    - [1.1 模块记录的构建](#11-模块记录的构建)
    - [1.2 模块绑定的实时性](#12-模块绑定的实时性)
    - [1.3 循环依赖的处理](#13-循环依赖的处理)
  - [2. Import Maps 与模块解析](#2-import-maps-与模块解析)
    - [2.1 模块说明符的解析问题](#21-模块说明符的解析问题)
    - [2.2 Import Maps 的映射机制](#22-import-maps-的映射机制)
    - [2.3 对加载性能的影响](#23-对加载性能的影响)
  - [3. 动态导入与代码分割](#3-动态导入与代码分割)
    - [3.1 import() 的语义](#31-import-的语义)
    - [3.2 代码分割策略](#32-代码分割策略)
    - [3.3 Top-Level Await](#33-top-level-await)
  - [4. Module Federation 架构](#4-module-federation-架构)
    - [4.1 微前端的模块共享问题](#41-微前端的模块共享问题)
    - [4.2 Module Federation 的核心机制](#42-module-federation-的核心机制)
    - [4.3 与原生 ES Module 的关系](#43-与原生-es-module-的关系)
  - [5. Custom Elements 生命周期](#5-custom-elements-生命周期)
    - [5.1 四个生命周期回调](#51-四个生命周期回调)
    - [5.2 升级（Upgrade）机制](#52-升级upgrade机制)
    - [5.3 Form-Associated Custom Elements](#53-form-associated-custom-elements)
  - [6. Shadow DOM 与样式封装](#6-shadow-dom-与样式封装)
    - [6.1 Shadow Tree 的创建与挂载](#61-shadow-tree-的创建与挂载)
    - [6.2 插槽（Slot）分发机制](#62-插槽slot分发机制)
    - [6.3 Shadow DOM 的 CSS 伪类与函数](#63-shadow-dom-的-css-伪类与函数)
  - [7. Declarative Shadow DOM 与 SSR](#7-declarative-shadow-dom-与-ssr)
    - [7.1 声明式 Shadow DOM 的语法](#71-声明式-shadow-dom-的语法)
    - [7.2 服务端渲染（SSR）集成](#72-服务端渲染ssr集成)
    - [7.3 序列化与 Hydration](#73-序列化与-hydration)
  - [8. 框架互操作与封装边界](#8-框架互操作与封装边界)
    - [8.1 Web Components 与 React 的互操作](#81-web-components-与-react-的互操作)
    - [8.2 设计系统的封装策略](#82-设计系统的封装策略)
  - [9. 范畴论语义：模块作为态射](#9-范畴论语义模块作为态射)
  - [10. 对称差分析：脚本加载 vs 模块加载](#10-对称差分析脚本加载-vs-模块加载)
  - [11. 工程决策矩阵](#11-工程决策矩阵)
  - [12. 反例与局限性](#12-反例与局限性)
    - [12.1 Import Maps 的瀑布效应](#121-import-maps-的瀑布效应)
    - [12.2 Shadow DOM 的可访问性断裂](#122-shadow-dom-的可访问性断裂)
    - [12.3 Module Federation 的版本地狱](#123-module-federation-的版本地狱)
    - [12.4 Custom Elements 的构造函数限制](#124-custom-elements-的构造函数限制)
  - [TypeScript 代码示例](#typescript-代码示例)
    - [示例 1：Import Map 解析器](#示例-1import-map-解析器)
    - [示例 2：模块依赖图分析器](#示例-2模块依赖图分析器)
    - [示例 3：Custom Element 生命周期管理器](#示例-3custom-element-生命周期管理器)
    - [示例 4：Shadow DOM 样式隔离检测器](#示例-4shadow-dom-样式隔离检测器)
    - [示例 5：Module Federation 共享版本解析器](#示例-5module-federation-共享版本解析器)
    - [示例 6：声明式 Shadow DOM SSR 渲染器](#示例-6声明式-shadow-dom-ssr-渲染器)
  - [参考文献](#参考文献)

---

## 1. ES Module 的形式化语义

### 1.1 模块记录的构建

在 ECMAScript 规范中，模块不是一个运行时对象，而是一个**模块记录（Module Record）**——一个包含元数据和绑定信息的规范抽象结构。当浏览器遇到 `<script type="module">` 时，它执行以下步骤：

**阶段一：加载（Loading）**

- 解析模块说明符（specifier），解析为绝对 URL
- 发起网络请求（遵守 CORS，需要正确的 MIME type：`text/javascript`）
- 下载模块源码

**阶段二：解析（Parsing）**

- 将源码解析为抽象语法树（AST）
- 提取 `import` 和 `export` 声明，构建 **ImportEntries** 和 **LocalExportEntries** 列表
- 执行**早期错误检查**（Early Errors）：如重复导出、非法绑定名等

**阶段三：链接（Linking）**

- **ResolveExport**：解析每个 `export` 的目标绑定
- **InitializeEnvironment**：为每个模块创建词法环境（Lexical Environment），分配 `var`/`let`/`const`/`import` 绑定的存储槽位
- 建立模块间的**绑定连接**：导入绑定不是值的拷贝，而是对导出模块绑定槽位的**实时引用**

**阶段四：执行（Evaluation）**

- 按**深度优先后序遍历**执行模块图（Module Graph）
- 执行模块体代码，初始化绑定值
- `import` 绑定的值在导出模块执行后才可用

### 1.2 模块绑定的实时性

ES Module 的 `import` 创建的是**活绑定（Live Binding）**，而非值的拷贝：

```javascript
// counter.js
export let count = 0;
export function increment() { count++; }

// main.js
import { count, increment } from './counter.js';
console.log(count); // 0
increment();
console.log(count); // 1 — 实时反映了导出模块中的变化
```

这种实时性是通过模块环境记录（Module Environment Record）中的**间接绑定（Indirect Binding）**实现的。导入标识符不直接存储值，而是存储一个**指向导出模块绑定槽位的引用**。

**与 CommonJS 的本质区别**：

- CommonJS 的 `require()` 返回的是**值的快照**（拷贝）
- ES Module 的 `import` 是**只读视图**（read-only view），不能重新赋值，但可以观察导出方的变化

### 1.3 循环依赖的处理

ES Module 规范允许循环依赖（Circular Dependencies），处理方式基于**绑定槽位的提前分配**：

```javascript
// a.js
import { b } from './b.js';
export const a = 'A';
console.log(b); // undefined（b 尚未执行）

// b.js
import { a } from './a.js';
export const b = 'B';
console.log(a); // 'A'（a 已执行）
```

处理顺序：

1. 加载并解析 a.js 和 b.js
2. 链接阶段：为 a.js 和 b.js 分配绑定槽位（此时值为 `undefined`）
3. 执行 a.js：执行到 `import { b }`，触发 b.js 的执行
4. 执行 b.js：`import { a }` 发现 a.js 已在执行中，使用其已分配的槽位（此时 `a === undefined`）
5. b.js 执行完毕，`b = 'B'`
6. a.js 继续执行，`console.log(b)` 此时仍是 `undefined`（因为 b 的赋值在 b.js 中，而 a.js 中的引用是在 b.js 执行前读取的）

**关键点**：循环依赖中，后执行的模块可以看到先执行模块的导出值，反之则不行。

---

## 2. Import Maps 与模块解析

### 2.1 模块说明符的解析问题

在纯 ES Module 环境中，浏览器只能解析两种模块说明符：

- **相对路径**：`./foo.js`、`../bar.js`
- **绝对 URL**：`https://cdn.example.com/lib.js`

这导致两个问题：

1. **裸说明符（Bare Specifier）**：`import React from 'react'` 在浏览器中无法解析
2. **版本管理**：CDN URL 包含版本号（`https://cdn.skypack.dev/react@18.2.0`），升级时需要修改所有引用

### 2.2 Import Maps 的映射机制

**Import Maps** 允许开发者在 HTML 中声明说明符到 URL 的映射：

```html
<script type="importmap">
{
  "imports": {
    "react": "https://esm.sh/react@18.2.0",
    "react-dom": "https://esm.sh/react-dom@18.2.0",
    "lodash/": "https://cdn.jsdelivr.net/npm/lodash-es/"
  },
  "scopes": {
    "/app/admin/": {
      "react": "https://esm.sh/react@17.0.2"
    }
  }
}
</script>
```

**解析算法**：

1. 提取说明符的最长前缀匹配（如 `lodash/debounce` 匹配 `lodash/`）
2. 将匹配前缀替换为对应的 URL 前缀（`lodash/debounce` → `https://cdn.jsdelivr.net/npm/lodash-es/debounce`）
3. `scopes` 允许为特定路径范围覆盖全局映射

**与 Node.js 的兼容性**：

- Node.js 的模块解析使用 `node_modules` 和 `package.json` 的 `exports` 字段
- Import Maps 是浏览器端的等效机制，但语义不同（没有 `node_modules` 目录遍历）
- 工具链（如 Vite、Deno）支持从 `package.json` 自动生成 Import Maps

### 2.3 对加载性能的影响

Import Maps 改变了浏览器的模块加载流水线：

- 浏览器在解析任何 `<script type="module">` 之前，必须先**阻塞**并解析 Import Map
- 如果 Import Map 放在 `<script type="module">` 之后，浏览器会报错（Import Map 必须在第一个模块脚本之前）
- 大型 Import Map（数百个条目）会增加 HTML 解析时间，但通常比执行 `node_modules` 遍历快得多

---

## 3. 动态导入与代码分割

### 3.1 import() 的语义

`import()` 是 ES Module 中的**动态导入**表达式，返回一个 Promise：

```javascript
const module = await import('./heavy-feature.js');
```

**与静态 import 的关键差异**：

- `import()` 可以在任意位置调用（条件分支、函数内部、事件回调）
- `import()` 的参数可以是**运行时计算的字符串**
- `import()` 触发**新的模块图分支**的加载、链接和执行
- 浏览器为 `import()` 创建**独立的网络请求**，可利用 HTTP/2 多路复用

### 3.2 代码分割策略

**路由级分割**：

- 每个 SPA 路由对应一个动态导入的 chunk
- 首屏只加载当前路由代码，其他路由按需加载
- 配合 `modulepreload` 预加载高概率导航路由

**组件级分割**：

- 大型组件（如图表库、富文本编辑器）通过 `import()` 延迟加载
- 使用 React.lazy() / Vue.defineAsyncComponent() / Svelte 的动态组件封装

**供应商分割（Vendor Splitting）**：

- 将第三方库与业务代码分离，利用长期缓存（vendor chunk 的 hash 只在库版本变化时改变）
- 但过度分割会增加 HTTP 请求数，在 HTTP/2 下影响较小，在 HTTP/1.1 下可能适得其反

### 3.3 Top-Level Await

ES2022 引入的 **Top-Level Await** 允许模块在顶层使用 `await`：

```javascript
// config.js
const response = await fetch('/api/config');
export const config = await response.json();
```

**对模块图的影响**：

- 包含 TLA 的模块成为**异步模块**，其父模块也必须等待其解析完成
- 这会向上传播异步性，可能导致整个模块图的执行延迟
- 浏览器在执行到 TLA 时会暂停该模块的执行，等待 Promise 解决，但继续解析其他不依赖该模块的脚本

---

## 4. Module Federation 架构

### 4.1 微前端的模块共享问题

在微前端架构中，多个独立部署的应用需要共享依赖（如 React、Vue、设计系统组件库）。传统方案的问题：

- **npm 依赖重复**：每个微应用都打包自己的 React 副本，导致页面加载多份 React
- **版本冲突**：微应用 A 使用 React 18，微应用 B 使用 React 17，全局只能有一份 React
- **构建时耦合**：微应用需要知道其他应用的依赖版本，失去独立部署的优势

### 4.2 Module Federation 的核心机制

**Module Federation**（webpack 5 引入，Vite/Rollup 有等效插件）通过**运行时模块共享**解决上述问题：

**Remote Container**：

- 每个微应用暴露一个"容器"（Container），包含其导出的模块和共享依赖的元数据
- 容器通过独立的 `<script>` 标签或 `import()` 加载

**Shared Scope**：

- 所有微应用将依赖注册到全局的 **Shared Scope**（一个全局对象，如 `window.__webpack_share_scopes__`）
- 版本解析策略：先加载的版本被注册，后续加载的模块检查 Shared Scope 中是否已有兼容版本（通过 semver 范围匹配）
- 如果版本不兼容，加载自己的副本（降级为独立实例）

**运行时模块解析**：

- 当微应用 A 需要 `react` 时，先检查 Shared Scope
- 如果 Shared Scope 中有兼容版本，直接使用（通过代理或引用）
- 如果没有，从 Remote Container 加载或回退到本地副本

### 4.3 与原生 ES Module 的关系

Module Federation 是**构建时**的抽象，最终输出的是：

- 一组 JS chunk（可能是 ESM 或 UMD 格式）
- 一个运行时引导代码（Runtime Bootstrap），负责模块注册和解析

在纯 ESM 环境中（无 webpack），可以使用 **Native Federation** 或 **Module Federation 2.0** 的 ESM 输出模式，将模块共享逻辑编译为原生 `import` 和 `importmap` 兼容的格式。

---

## 5. Custom Elements 生命周期

### 5.1 四个生命周期回调

**Custom Elements** 允许开发者定义新的 HTML 标签，通过继承 `HTMLElement` 并实现生命周期回调：

```javascript
class MyElement extends HTMLElement {
  static observedAttributes = ['data-value'];

  constructor() {
    super();
    // 元素被创建（通过 new 或 parser）
  }

  connectedCallback() {
    // 元素被插入 DOM
  }

  disconnectedCallback() {
    // 元素从 DOM 移除
  }

  attributeChangedCallback(name, oldValue, newValue) {
    // 观察的属性变化
  }

  adoptedCallback() {
    // 元素被移动到另一个 document（如 iframe）
  }
}
customElements.define('my-element', MyElement);
```

### 5.2 升级（Upgrade）机制

当 HTML 解析器遇到未定义的自定义标签（如 `<my-element>`）时：

- 浏览器创建 **HTMLUnknownElement**（或 `HTMLElement` 的通用实例）
- 元素被插入 DOM，表现如同普通 `HTMLDivElement`
- 当 `customElements.define('my-element', MyElement)` 执行后，浏览器执行**升级（Upgrade）**：
  - 创建新的 `MyElement` 实例
  - 调用 `constructor()`
  - 如果元素已在 DOM 中，调用 `connectedCallback()`
  - 复制原元素的所有属性和子节点

**同步 vs 异步定义**：

- `customElements.define()` 是同步的，升级立即发生
- 如果自定义元素定义在模块中，而模块通过 `import()` 动态加载，页面会先显示"未升级"状态，然后突然升级

### 5.3 Form-Associated Custom Elements

**Form-Associated Custom Elements**（FACE，Chrome 77+ / Safari 17.4+）允许自定义元素参与表单提交和验证：

- 元素可以设置 `static formAssociated = true`
- 通过 `attachInternals()` 获取 `ElementInternals`，设置表单值、验证状态和 ARIA 角色
- 支持 `:valid`、`:invalid`、`:required` 等伪类

---

## 6. Shadow DOM 与样式封装

### 6.1 Shadow Tree 的创建与挂载

**Shadow DOM** 为 Custom Element 创建独立的 DOM 子树：

```javascript
const shadow = this.attachShadow({ mode: 'open' });
shadow.innerHTML = `
  <style>:host { display: block; }</style>
  <slot></slot>
`;
```

**mode 参数**：

- `open`：`element.shadowRoot` 可从外部访问，便于调试和测试
- `closed`：`element.shadowRoot` 返回 `null`，只有元素内部代码可以访问。但这不是安全边界（可通过 Object.prototype 或 DevTools 绕过）。

### 6.2 插槽（Slot）分发机制

**默认插槽**：`<slot></slot>` 接收所有未被命名插槽捕获的子元素
**命名插槽**：`<slot name="header"></slot>` 只接收 `slot="header"` 属性的子元素
**回退内容**：`<slot>默认内容</slot>` 在没有分发内容时显示

**分发不是移动**：

- 子元素在 Light DOM 中保留其原始位置
- Shadow DOM 中的 `<slot>` 是**占位符**，浏览器在渲染时将 Light DOM 子元素的视觉表示"投影"到插槽位置
- JavaScript 访问子元素时，仍通过 `element.children`（Light DOM）获取，而非 Shadow DOM

### 6.3 Shadow DOM 的 CSS 伪类与函数

- `:host`：选择 Shadow Root 的宿主元素
- `:host(.active)`：宿主元素同时拥有 `.active` 类时生效
- `:host-context(.dark-theme)`：选择器在宿主元素的祖先链中匹配时生效（已废弃，不建议使用）
- `::slotted(img)`：为插槽中的特定元素设置样式（只能设置直接子元素，且特异性受限）
- `::part(button)`：从外部穿透 Shadow DOM，为标记了 `part="button"` 的元素设置样式
- `::theme()`（已废弃）：原设计用于全局主题穿透

---

## 7. Declarative Shadow DOM 与 SSR

### 7.1 声明式 Shadow DOM 的语法

**Declarative Shadow DOM（DSD）** 允许在 HTML 中直接声明 Shadow Tree，无需 JavaScript：

```html
<my-element>
  <template shadowrootmode="open">
    <style>:host { color: blue; }</style>
    <slot></slot>
  </template>
  <span>Light DOM content</span>
</my-element>
```

**浏览器支持**：Chrome 90+、Safari 17+、Firefox 123+（2024年）。

### 7.2 服务端渲染（SSR）集成

DSD 是 Web Components SSR 的关键：

- 服务端可以渲染完整的 Custom Element HTML，包括 Shadow Tree
- 客户端 Hydration 时，浏览器识别 `<template shadowrootmode>` 并自动挂载 Shadow Root
- 无需在客户端重新创建 Shadow DOM 结构，避免闪烁（Flash of Unstyled Content）

**与框架 SSR 的对比**：

- React/Vue/Angular 的 SSR 输出纯 HTML，Hydration 时重新构建组件树
- Web Components 的 SSR 输出包含 Shadow DOM 结构，Hydration 更高效（只需附加事件监听器和状态）

### 7.3 序列化与 Hydration

**`getHTML({ serializableShadowRoots: true })`**（Chrome 125+）：

- 允许将带有 Shadow DOM 的元素序列化为包含 `<template shadowrootmode>` 的 HTML 字符串
- 支持 `declarativeShadowRootSerializable` 选项控制哪些 Shadow Root 可序列化

---

## 8. 框架互操作与封装边界

### 8.1 Web Components 与 React 的互操作

React 与 Web Components 的集成存在以下摩擦点：

**属性 vs 特性（Properties vs Attributes）**：

- React 的 JSX 属性默认映射到 HTML 特性（attribute）
- 但 Custom Elements 的复杂数据（对象、数组、函数）需要通过 JavaScript 属性（property）传递
- 解决方案：React 19+ 改进了对 Custom Elements 的支持，自动检测 property/attribute 差异

**事件处理**：

- Web Components 使用标准 `CustomEvent`，通过 `addEventListener` 监听
- React 的 JSX 事件绑定（`onClick`）依赖于 React 的合成事件系统
- 在 Custom Element 上直接使用 `onMyEvent={handler}` 在旧版 React 中不工作，需要 `useRef` + `useEffect` 手动添加监听器

**样式隔离**：

- React 组件的样式（CSS Modules、Styled Components）与 Shadow DOM 的样式是独立的
- 需要设计系统同时提供 Shadow DOM 样式和全局 CSS 变量（用于主题定制）

### 8.2 设计系统的封装策略

现代设计系统通常采用**混合策略**：

- **核心组件**：使用 Web Components 实现（原生封装，跨框架可用）
- **框架适配器**：为 React/Vue/Angular 提供薄包装，处理属性绑定和事件转换
- **样式变量**：通过 CSS 自定义属性（`--ds-primary-color`）实现主题定制，穿透 Shadow DOM

---

## 9. 范畴论语义：模块作为态射

从范畴论视角，JavaScript 的模块系统可以建模为一个**范畴** **M**：

- **对象**：模块的导出接口（Export Signature），即导出的绑定名称和类型的集合
- **态射**：模块之间的导入关系。模块 A 导入模块 B 的绑定，形成态射 `f: B → A`
- **复合**：如果 A 导入 B，B 导入 C，则 A 可以通过 B 间接依赖 C。但 ES Module 不支持**传递导入**（Transitive Import），A 不能直接访问 C 的导出，除非 A 显式导入 C。

**预范畴（Precategory）而非范畴**：
严格来说，**M** 不是真正的范畴，因为态射复合不封闭。A → B 和 B → C 的复合不等于 A → C（A 不能直接访问 C 的导出）。但如果我们把对象定义为"模块及其所有可达导出"，则复合封闭，形成范畴。

**Module Federation 的范畴模型**：
Module Federation 引入了**余极限（Colimit）**结构：多个微应用（模块图）通过共享依赖合并为一个全局模块图。共享依赖的解析对应于余锥（Cocone）的顶点选择——选择一个兼容版本作为统一接口。

---

## 10. 对称差分析：脚本加载 vs 模块加载

| 维度 | 传统 `<script>` | ES Module (`<script type="module">`) | 交集 |
|------|----------------|-------------------------------------|------|
| 解析时机 | 下载完成后立即解析执行 | 下载 → 解析 import → 递归加载依赖 | 网络请求 |
| 执行顺序 | 文档顺序，阻塞解析 | 依赖图深度优先后序，defer 行为 | 单线程执行 |
| 作用域 | 全局（`var` 泄漏到 `window`） | 模块作用域（顶级 `var` 不泄漏） | `function` 声明提升 |
| 严格模式 | 可选 | 强制严格模式 | 语法子集 |
| 异步加载 | `async` / `defer` 属性 | `import()` 动态导入 | 非阻塞加载 |
| 循环依赖 | 无规范支持（依赖全局状态顺序） | 规范支持（绑定槽位预分配） | 运行时错误风险 |
| 树摇优化 | 不可能（全局副作用不可分析） | 静态分析支持 | 构建工具处理 |
| 浏览器缓存 | 按 URL 缓存 | 按 URL 缓存，但模块图需要一致版本 | HTTP 缓存语义 |

---

## 11. 工程决策矩阵

| 场景 | 推荐方案 | 理由 | 风险 |
|------|---------|------|------|
| 新项目的模块系统 | 原生 ES Module + Import Maps | 浏览器原生支持，无构建工具依赖 | 旧浏览器需 polyfill（SystemJS），裸说明符需要 Import Maps |
| 大型 SPA 性能优化 | 路由级 `import()` + `modulepreload` | 减少首屏 JS 体积 | 路由切换时需要加载新 chunk，可能延迟导航 |
| 微前端共享依赖 | Module Federation + Shared Scope | 运行时共享，独立部署 | 版本冲突时降级为多个副本，增加内存占用 |
| 跨框架组件库 | Web Components (Custom Elements + Shadow DOM) | 原生封装，React/Vue/Angular 通用 | 与框架的属性和事件集成有摩擦 |
| 设计系统主题定制 | CSS 自定义属性 + `::part()` | 穿透封装，保持组件隔离 | `::part()` 样式特异性低，容易被覆盖 |
| SSR + Web Components | Declarative Shadow DOM | 服务端渲染 Shadow Tree，零客户端闪烁 | 浏览器支持度仍在提升中 |
| 表单自定义组件 | Form-Associated Custom Elements (FACE) | 原生表单集成，验证和提交 | 浏览器支持度差异大 |

---

## 12. 反例与局限性

### 12.1 Import Maps 的瀑布效应

虽然 Import Maps 简化了模块解析，但如果映射指向的 CDN 性能不佳，会导致：

- 每个模块的加载延迟累积（即使 HTTP/2 多路复用，仍受 RTT 限制）
- 未预加载的深层依赖产生请求瀑布（Waterfall）
- 解决方案：使用 `modulepreload` 预加载关键依赖图，但手动维护 preload 列表与 Import Maps 的同步是负担

### 12.2 Shadow DOM 的可访问性断裂

Shadow DOM 的封装边界对辅助技术构成挑战：

- 屏幕阅读器需要遍历**扁平化树（Flattened Tree）**才能获取完整内容，但某些旧版辅助技术无法正确遍历 Shadow Boundary
- `aria-owns` 和 `aria-controls` 指向 Shadow DOM 内的 ID 时，可能在浏览器外部计算中失败
- 解决方案：在 Light DOM 中保留语义化结构，使用 `role` 和 `aria-*` 属性， Shadow DOM 仅用于视觉呈现

### 12.3 Module Federation 的版本地狱

Shared Scope 的 semver 匹配在复杂场景中会导致意外行为：

- 微应用 A 请求 React `^18.0.0`，微应用 B 请求 React `^18.2.0`
- 如果 B 先加载，Shared Scope 中有 `18.2.0`，A 的 `^18.0.0` 范围包含 `18.2.0`，所以 A 使用 B 的版本
- 但如果 A 依赖 React 18.0.0 的某个行为，而 18.2.0 已更改该行为，A 会无声地出现 bug
- 解决方案：严格的版本对齐策略，或放弃共享（每个应用独立打包）

### 12.4 Custom Elements 的构造函数限制

Custom Elements 的 `constructor()` 有严格限制：

- 必须在第一条语句调用 `super()`
- 不能在 `constructor()` 中读取/写入元素的属性或子节点（因为元素可能还未被解析完成）
- 不能在 `constructor()` 中执行 `attachShadow()` 之外的 DOM 操作（升级时会导致重复操作）

这些限制导致很多开发者误用生命周期，在 `constructor()` 中执行应该在 `connectedCallback()` 中执行的逻辑。

---

## TypeScript 代码示例

### 示例 1：Import Map 解析器

```typescript
interface ImportMap {
  imports: Record<string, string>;
  scopes?: Record<string, Record<string, string>>;
}

class ImportMapResolver {
  constructor(private map: ImportMap) {}

  resolve(specifier: string, referrer?: string): string {
    // 1. Scopes lookup
    if (referrer && this.map.scopes) {
      for (const [scopePrefix, mappings] of Object.entries(this.map.scopes)) {
        if (referrer.startsWith(scopePrefix)) {
          const scoped = this.matchSpecifier(specifier, mappings);
          if (scoped) return scoped;
        }
      }
    }

    // 2. Global imports lookup
    const resolved = this.matchSpecifier(specifier, this.map.imports);
    if (resolved) return resolved;

    // 3. Fallback: return specifier as-is (relative or absolute URL)
    return specifier;
  }

  private matchSpecifier(specifier: string, mappings: Record<string, string>): string | null {
    // Find longest prefix match
    let bestMatch = '';
    for (const prefix of Object.keys(mappings)) {
      if (specifier.startsWith(prefix) && prefix.length > bestMatch.length) {
        bestMatch = prefix;
      }
    }
    if (!bestMatch) return null;
    return mappings[bestMatch] + specifier.slice(bestMatch.length);
  }
}
```

### 示例 2：模块依赖图分析器

```typescript
interface ModuleNode {
  url: string;
  imports: string[];
  exports: string[];
}

class ModuleGraphAnalyzer {
  private modules = new Map<string, ModuleNode>();
  private visited = new Set<string>();

  addModule(node: ModuleNode) {
    this.modules.set(node.url, node);
  }

  detectCycles(): string[][] {
    const cycles: string[][] = [];

    const dfs = (node: string, path: string[], visiting: Set<string>) => {
      if (visiting.has(node)) {
        const cycleStart = path.indexOf(node);
        cycles.push(path.slice(cycleStart).concat(node));
        return;
      }
      if (this.visited.has(node)) return;

      visiting.add(node);
      path.push(node);

      const module = this.modules.get(node);
      if (module) {
        for (const imp of module.imports) {
          dfs(imp, [...path], new Set(visiting));
        }
      }

      visiting.delete(node);
      this.visited.add(node);
    };

    for (const url of this.modules.keys()) {
      if (!this.visited.has(url)) {
        dfs(url, [], new Set());
      }
    }

    return cycles;
  }

  getLoadOrder(): string[] {
    const visited = new Set<string>();
    const order: string[] = [];

    const visit = (url: string) => {
      if (visited.has(url)) return;
      visited.add(url);

      const module = this.modules.get(url);
      if (module) {
        for (const imp of module.imports) {
          visit(imp);
        }
      }
      order.push(url);
    };

    for (const url of this.modules.keys()) {
      visit(url);
    }

    return order;
  }
}
```

### 示例 3：Custom Element 生命周期管理器

```typescript
type LifecycleCallback = 'connected' | 'disconnected' | 'adopted' | 'attributeChanged';

class CustomElementBase extends HTMLElement {
  private _lifecycleHooks: Map<LifecycleCallback, Set<Function>> = new Map();

  constructor() {
    super();
    this._lifecycleHooks.set('connected', new Set());
    this._lifecycleHooks.set('disconnected', new Set());
    this._lifecycleHooks.set('adopted', new Set());
    this._lifecycleHooks.set('attributeChanged', new Set());
  }

  onLifecycle(event: LifecycleCallback, callback: Function) {
    this._lifecycleHooks.get(event)?.add(callback);
    return () => this._lifecycleHooks.get(event)?.delete(callback);
  }

  connectedCallback() {
    this._lifecycleHooks.get('connected')?.forEach(cb => cb());
  }

  disconnectedCallback() {
    this._lifecycleHooks.get('disconnected')?.forEach(cb => cb());
  }

  adoptedCallback() {
    this._lifecycleHooks.get('adopted')?.forEach(cb => cb());
  }

  attributeChangedCallback(name: string, oldVal: string | null, newVal: string | null) {
    this._lifecycleHooks.get('attributeChanged')?.forEach(cb => cb(name, oldVal, newVal));
  }
}
```

### 示例 4：Shadow DOM 样式隔离检测器

```typescript
class ShadowDOMAnalyzer {
  checkStyleLeak(shadowHost: HTMLElement, externalCSS: string): string[] {
    const leaks: string[] = [];
    const shadowRoot = shadowHost.shadowRoot;
    if (!shadowRoot) return leaks;

    // Check if external selectors can pierce Shadow DOM
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(externalCSS);

    for (const rule of Array.from(sheet.cssRules)) {
      if (rule instanceof CSSStyleRule) {
        const selector = rule.selectorText;
        // Only ::part() and ::slotted() can pierce
        if (!selector.includes('::part') && !selector.includes('::slotted')) {
          try {
            const matches = shadowRoot.querySelectorAll(selector);
            if (matches.length > 0) {
              leaks.push(`Selector "${selector}" would not match Shadow DOM content from outside`);
            }
          } catch {
            // Invalid selector for Shadow DOM context
          }
        }
      }
    }

    return leaks;
  }

  getFlattenedTree(root: HTMLElement): Node[] {
    const result: Node[] = [];
    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_ELEMENT,
      null,
      false
    );

    let node: Node | null = walker.currentNode;
    while (node) {
      result.push(node);
      // If element has Shadow DOM, traverse into it
      if (node instanceof HTMLElement && node.shadowRoot) {
        result.push(...this.getFlattenedTree(node.shadowRoot as any));
      }
      node = walker.nextNode();
    }

    return result;
  }
}
```

### 示例 5：Module Federation 共享版本解析器

```typescript
interface SharedModule {
  version: string;
  factory: () => any;
  eager?: boolean;
}

class SharedScopeResolver {
  private scope = new Map<string, SharedModule[]>();

  register(name: string, version: string, factory: () => any) {
    if (!this.scope.has(name)) {
      this.scope.set(name, []);
    }
    this.scope.get(name)!.push({ version, factory });
  }

  resolve(name: string, requiredRange: string): SharedModule | null {
    const versions = this.scope.get(name);
    if (!versions) return null;

    // Simple semver matching (simplified)
    const compatible = versions.filter(v => this.satisfies(v.version, requiredRange));
    if (compatible.length === 0) return null;

    // Return highest compatible version
    return compatible.sort((a, b) => this.compareVersion(b.version, a.version))[0];
  }

  private satisfies(version: string, range: string): boolean {
    // Simplified: supports ^x.y.z and exact matches
    if (range.startsWith('^')) {
      const req = range.slice(1).split('.').map(Number);
      const ver = version.split('.').map(Number);
      if (ver[0] !== req[0]) return false;
      if (ver[0] > req[0]) return true;
      if (ver[1] > req[1]) return true;
      if (ver[1] === req[1] && ver[2] >= req[2]) return true;
      return false;
    }
    return version === range;
  }

  private compareVersion(a: string, b: string): number {
    const pa = a.split('.').map(Number);
    const pb = b.split('.').map(Number);
    for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
      const na = pa[i] || 0;
      const nb = pb[i] || 0;
      if (na !== nb) return na - nb;
    }
    return 0;
  }
}
```

### 示例 6：声明式 Shadow DOM SSR 渲染器

```typescript
interface DeclarativeShadowDOMOptions {
  mode: 'open' | 'closed';
  styles?: string[];
  html: string;
  slots?: Record<string, string>;
}

class DSDRenderer {
  render(tagName: string, options: DeclarativeShadowDOMOptions): string {
    const styles = (options.styles || [])
      .map(css => `<style>${this.escapeHtml(css)}</style>`)
      .join('');

    const slotContent = Object.entries(options.slots || {})
      .map(([name, content]) => `<span slot="${name}">${content}</span>`)
      .join('');

    return `
<${tagName}>
  <template shadowrootmode="${options.mode}">
    ${styles}
    ${options.html}
  </template>
  ${slotContent}
</${tagName}>
    `.trim();
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Client-side hydration check
  static canHydrate(element: HTMLElement): boolean {
    return !!element.shadowRoot || element.querySelector('template[shadowrootmode]') !== null;
  }
}
```

---

## 参考文献

1. WHATWG. *HTML Standard — Module Script Loading.* <https://html.spec.whatwg.org/multipage/webappapis.html#module-script>
2. ECMAScript. *ECMA-262 — Modules.* <https://tc39.es/ecma262/#sec-modules>
3. W3C. *Web Components Specifications.* <https://www.w3.org/wiki/WebComponents/>
4. WICG. *Import Maps.* <https://wicg.github.io/import-maps/>
5. Google. *Module Federation.* <https://module-federation.io/>
6. W3C. *HTML Web Components.* <https://github.com/WICG/webcomponents/blob/gh-pages/proposals/Declarative-Shadow-DOM.md>
7. Lit. *Shadow DOM and Styling.* <https://lit.dev/docs/components/shadow-dom/>
8. Chrome Developers. *Form-Associated Custom Elements.* web.dev, 2024.
9. Steve Kinney. *Building Design Systems with Web Components.* Frontend Masters, 2023.
10. Matias Capeletto. *Vite and Web Components.* ViteConf, 2023.
