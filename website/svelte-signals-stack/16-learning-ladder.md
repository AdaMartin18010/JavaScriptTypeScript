---
title: Svelte 渐进式学习阶梯
description: '从第 0 天到第 100 天的完整 Svelte 学习路径：8 个级别，每个含知识点、练习项目、检验标准'
keywords: 'Svelte学习路径, 渐进式学习, 初学者, 全栈开发, 练习项目, 学习阶梯'
---

# Svelte 渐进式学习阶梯

> 本文档提供从完全新手到 Svelte 生态贡献者的结构化学习路径。每个 Level 建议按天推进，但可根据个人节奏调整。每一天的学习都应伴随编码实践，而非仅阅读文档。
>
> 适用版本：Svelte 5 (Runes) + SvelteKit 2.x
> 最后更新: 2026-05-02

---

## Level 0: 预备知识（第 0 天）

> **耗时预估**: 1 天（已掌握者可跳过）
> **前置条件**: 无

### 🎯 学习目标

1. 能独立编写语义化的 HTML 页面，使用 CSS Flexbox/Grid 完成常见布局
2. 理解 JavaScript 核心概念：`this`、`闭包`、`原型链`、`事件循环`
3. 能使用 TypeScript 为变量、函数、对象编写基础类型注解
4. 理解浏览器 `DOM` 树结构、`事件冒泡/捕获` 机制、`HTTP` 请求/响应流程

### 📚 知识点清单

#### HTML / CSS

- 语义化标签：`header`、`nav`、`main`、`article`、`section`、`aside`、`footer`
- CSS 盒模型、`margin` 折叠、`BFC`
- Flexbox 主轴/交叉轴、常用属性：`justify-content`、`align-items`、`flex-grow`
- CSS Grid 行列定义、`grid-template-areas`
- 响应式基础：`meta viewport`、`@media` 查询、相对单位 `rem`/`vw`
- CSS 变量（Custom Properties）定义与作用域

#### JavaScript（ES2020+）

- `let`/`const` vs `var`，块级作用域，`TDZ`
- 箭头函数与普通函数的区别，`this` 绑定规则
- 解构赋值：对象、数组、嵌套、重命名、默认值
- 展开运算符 `...`（剩余参数与展开）
- 模板字符串与标签模板
- 可选链 `?.`、空值合并 `??`
- `Promise` 链式调用、`async/await` 错误处理
- `fetch` API、`JSON` 序列化/反序列化
- 模块系统：`import`/`export`、`default` vs 命名导出、动态 `import()`

#### TypeScript 基础

- 基础类型：`string`、`number`、`boolean`、`array`、`tuple`、`enum`
- 接口 `interface` 与类型别名 `type`
- 函数类型：参数类型、返回值类型、可选参数、默认参数
- 泛型初识：`<T>` 在函数和接口中的使用
- 联合类型 `|`、交叉类型 `&`
- 类型断言 `as`、非空断言 `!`
- 基础配置：`tsconfig.json` 中 `strict`、`esModuleInterop` 的作用

#### 前置网络 & 浏览器概念

- `DOM API`：`querySelector`、`addEventListener`、`createElement`
- 事件机制：冒泡、捕获、`stopPropagation`、`preventDefault`
- `HTTP` 方法：`GET`、`POST`、`PUT`、`DELETE` 的语义
- 状态码：`200`、`201`、`400`、`401`、`403`、`404`、`500`
- `JSON` 数据格式、`Content-Type` 头部
- 浏览器 `DevTools`：Elements、Console、Network、Application 面板

### 🛠️ 练习项目：个人简介静态页

**项目描述**：不使用任何框架，纯 HTML/CSS/JS 创建一个响应式个人简介页面。

**验收标准**：

- [ ] 使用语义化 HTML5 标签
- [ ] CSS Grid 或 Flexbox 实现响应式布局（适配手机与桌面）
- [ ] 使用 CSS 变量管理颜色主题（至少支持亮色/暗色切换）
- [ ] 使用原生 JS 实现一个表单提交，用 `fetch` 发送 POST 请求到 `https://httpbin.org/post`
- [ ] 用 TypeScript 编写（通过 `tsc` 编译或直接写在 `.ts` 文件中）

### ✅ 自检清单

- [ ] 能手写 Flexbox 三栏布局（两侧固定，中间自适应）
- [ ] 能解释 `Promise.then().catch().finally()` 的执行顺序
- [ ] 能写出包含接口和泛型的 TypeScript 函数
- [ ] 能在 DevTools Network 面板分析 HTTP 请求耗时

### 🔗 相关专题链接

- [MDN HTML 基础](https://developer.mozilla.org/zh-CN/docs/Learn/HTML)
- [MDN CSS 基础](https://developer.mozilla.org/zh-CN/docs/Learn/CSS)
- [现代 JavaScript 教程](https://zh.javascript.info/)
- [TypeScript 官方文档](https://www.typescriptlang.org/docs/)

---

## Level 1: 初识 Svelte（第 1-3 天）

> **耗时预估**: 3 天
> **前置条件**: Level 0

### 🎯 学习目标

1. 理解 Svelte 的核心理念：`编译时框架`、`真正的响应式`、`无 Virtual DOM`
2. 能使用 `create-vite` 或 `sv` 创建 Svelte 5 项目并理解项目结构
3. 掌握 Runes 基础：`$state`、`$derived`、`$effect` 的用法与区别
4. 能独立完成包含事件处理、条件渲染、列表渲染的交互组件
5. 理解 `.svelte` 单文件组件的三大块：`script`、`template`、`style`

### 📚 知识点清单

#### Svelte 哲学与项目搭建

- Svelte vs React/Vue/Vanilla 的核心差异
- Svelte 编译时优化：`compile` 阶段将组件转为高效的原生 JS
- 项目创建方式：`npm create vite@latest`（选 Svelte + TS）或 `npx sv create`
- 项目结构解析：`src/lib/`、`src/routes/`（SvelteKit）、`svelte.config.js`、`vite.config.ts`
- `svelte-check` 的作用：类型检查与编译诊断

#### Runes 基础（Svelte 5 核心）

- `$state`：声明响应式状态（`let count = $state(0)`）
- `$state.raw`：浅层响应式（对象内部属性不追踪）
- `$state.snapshot`：获取响应式状态的当前快照
- `$derived`：派生状态（自动依赖追踪的计算属性）
- `$derived.by`：复杂派生逻辑
- `$effect`：副作用（DOM 操作、数据同步、外部库集成）
- `$effect.pre` / `$effect.root`：预渲染副作用与手动清理
- `$inspect`：开发调试用，追踪状态变化
- 响应式原理：编译时依赖图构建，`Signal` 细粒度更新

#### 模板语法

- 文本插值：`{expression}`
- 条件渲染：`{#if}`、`{:else if}`、`{:else}`
- 列表渲染：`{#each items as item, index (key)}`
- `key` 表达式的必要性（列表项身份识别）
- 事件绑定：`onclick`、`oninput` 等（注意：无 `on:` 前缀，Svelte 5 原生 DOM 事件）
- 事件修饰符：`preventDefault`、`stopPropagation` 的使用方式变化
- 属性绑定：`class`、`style`、自定义属性 `{...props}`
- `bind:value`：表单元素双向绑定

#### 样式与作用域

- Svelte 样式默认组件作用域（编译时添加唯一属性选择器）
- `:global()` 全局样式覆盖
- CSS 变量透传：`style="--theme-color: {color}"`
- `class:` 指令简化条件类名

### 🛠️ 练习项目：Todo List 基础版

**项目描述**：使用 Svelte 5 创建一个功能完整的 Todo 应用。

**验收标准**：

- [ ] 使用 `$state` 管理 todo 列表（每条包含 `id`、`text`、`done`）
- [ ] 实现添加、删除、标记完成/未完成功能
- [ ] 使用 `$derived` 计算：总任务数、已完成数、待完成数
- [ ] 使用 `$effect` 将数据持久化到 `localStorage`（页面刷新不丢失）
- [ ] 条件渲染：空列表时显示提示文案
- [ ] 列表渲染使用 `(todo.id)` 作为 key
- [ ] 使用 TypeScript 定义 Todo 接口
- [ ] 样式使用组件作用域，完成项有删除线样式

### ✅ 自检清单

- [ ] 能解释 `$state` 和 `$derived` 的区别，什么情况下用哪个
- [ ] 能在 `$effect` 中正确清理副作用（如移除事件监听器）
- [ ] 能独立搭建 Svelte 5 + TypeScript 项目并配置路径别名
- [ ] 能解释 Svelte 为什么不需要 Virtual DOM

### 🔗 相关专题链接

- [Svelte 官方教程](https://svelte.dev/tutorial)
- [Svelte 5 Runes 介绍](https://svelte.dev/blog/runes)
- [Vite 配置参考](https://vitejs.dev/config/)

---

## Level 2: 组件交互（第 4-7 天）

> **耗时预估**: 4 天
> **前置条件**: Level 1

### 🎯 学习目标

1. 掌握组件间通信：`$props` 接收数据、回调 Props 传递事件
2. 理解并使用 `Snippet`（片段）实现灵活的组件内容分发
3. 熟练使用各类双向绑定：`bind:value`、`bind:checked`、`bind:group`
4. 理解 Svelte 5 中的生命周期概念与 `$effect` 的替代关系
5. 能构建可复用、可配置的 UI 组件

### 📚 知识点清单

#### Props 系统

- `$props()`：声明组件接收的属性（`let { title, count = 0 } = $props()`）
- `$bindable`：让 Props 支持双向绑定（子组件可更新父组件状态）
- 回调 Props 模式：通过传递函数实现子→父通信（`onConfirm`、`onCancel`）
- Props 解构与默认值
- Rest props：`let { title, ...rest } = $props()` 接收剩余属性
- 类型安全：为 `$props` 添加 TypeScript 接口

#### Snippet（片段）—— Svelte 5 内容分发

- `{#snippet name(params)}` 定义可复用模板片段
- `{@render name(args)}` 渲染片段
- 与 `slot` 的对比：Snippet 更灵活、可传参、可多次渲染
- 默认片段与命名片段的使用场景
- 将 Snippet 作为 Props 传递给深层组件

#### 双向绑定进阶

- `bind:value`：输入框、文本域、选择框
- `bind:checked`：复选框
- `bind:group`：单选框组、复选框组
- `bind:this`：获取 DOM 元素引用
- `$bindable` 在自定义组件中的使用

#### 生命周期（Svelte 5 模式）

- Svelte 5 中 `onMount`、`beforeUpdate`、`afterUpdate`、`onDestroy` 的演变
- `$effect` 替代生命周期：挂载/更新时执行
- `$effect` 的清理函数：返回一个函数在卸载/重新执行前调用
- `$effect.pre`：在 DOM 更新前执行（类似 `beforeUpdate`）
- `$effect.root`：手动创建独立的效果作用域
- `tick()`：微任务刷新 DOM，等待挂起状态更新完成

#### 组件设计模式

- 容器组件（Container）与展示组件（Presentational）
- 受控组件与非受控组件
- 复合组件（Compound Component）模式初识
- 组件 API 设计：Props 命名、事件命名、文档注释

### 🛠️ 练习项目 1：Modal 对话框组件

**项目描述**：创建一个高度可复用的 Modal 组件。

**验收标准**：

- [ ] 使用 `$props` 接收 `open`、`title`、`onClose` 等属性
- [ ] 使用 Snippet 允许调用者自定义 Header、Body、Footer 内容
- [ ] 使用 `bind:this` 获取 Modal DOM，实现打开时聚焦首个可交互元素
- [ ] 使用 `$effect` 监听 `open` 变化，处理 `Escape` 键关闭和背景点击关闭
- [ ] 清理副作用：Modal 关闭时移除事件监听器
- [ ] 使用 TypeScript 导出 Modal Props 接口
- [ ] 提供使用示例：确认对话框、表单对话框、信息展示对话框

### 🛠️ 练习项目 2：表单验证组件集

**项目描述**：构建一组带验证功能的表单组件。

**验收标准**：

- [ ] `InputField` 组件：支持 `type`、`label`、`error`、`bind:value`，实时验证
- [ ] `SelectField` 组件：支持选项列表、双向绑定、验证
- [ ] 使用回调 Props 向上传递验证状态
- [ ] 父表单组件收集所有子字段验证状态，控制提交按钮可用性
- [ ] 验证规则可配置（通过 Props 传入验证函数数组）

### ✅ 自检清单

- [ ] 能写出使用 Snippet 和 `{@render}` 的复合组件
- [ ] 能解释 `$bindable` 的使用场景与潜在风险
- [ ] 能在 `$effect` 中正确管理事件监听器的添加与移除
- [ ] 能设计一套组件 Props API，兼顾灵活性与易用性
- [ ] 能使用 `tick()` 解决状态更新后 DOM 未立即刷新的问题

### 🔗 相关专题链接

- [Svelte Snippets 文档](https://svelte.dev/docs/svelte/snippet)
- [Svelte $props 文档](https://svelte.dev/docs/svelte/$props)
- [Svelte $effect 文档](https://svelte.dev/docs/svelte/$effect)

---

## Level 3: 状态管理（第 8-14 天）

> **耗时预估**: 7 天
> **前置条件**: Level 2

### 🎯 学习目标

1. 掌握 `$state` 在跨组件场景中的共享模式（`.svelte.ts`）
2. 理解 `$derived` 的依赖追踪原理与性能考量
3. 掌握 `$effect` 的依赖数组逻辑（自动追踪 vs 手动控制）
4. 了解 Svelte Store（`writable`、`readable`、`derived`）的历史与使用场景
5. 能设计中小型应用的状态架构

### 📚 知识点清单

#### 跨组件状态共享

- `.svelte.ts` 文件：Svelte 5 的通用状态模块
- 在 `.svelte.ts` 中使用 `$state` 创建全局/模块级状态
- 导出状态函数 vs 导出状态对象（单例模式）
- 状态模块化：按领域拆分（`user.svelte.ts`、`cart.svelte.ts`）
- 状态重置模式：工厂函数创建新状态实例

#### $derived 深入

- 自动依赖追踪：读取哪些 `$state` 就追踪哪些
- `$derived` 的惰性求值：仅在被读取时重新计算
- `$derived` 与 `$effect` 的区别：纯函数 vs 副作用
- 避免在 `$derived` 中执行副作用（赋值、DOM 操作、网络请求）
- `$derived.by` 处理复杂逻辑或多步计算
- 派生状态的派生状态：层级 `$derived` 链

#### $effect 深入

- `$effect` 的自动依赖追踪机制
- `$effect` 的清理函数：返回函数在依赖变化前调用
- `$effect.pre`：在 DOM 更新前同步执行
- `$effect.root`：手动创建效果作用域并控制清理时机
- `$effect` 中异步操作的处理
- 避免 `$effect` 无限循环（不要在 `$effect` 中无条件下修改其依赖的状态）

#### Svelte Store（兼容与迁移）

- `writable`：可写 Store
- `readable`：只读 Store（常用于外部数据源封装）
- `derived`：派生 Store
- Store 的订阅/取消订阅模式（`$` 自动订阅语法）
- Store 与 Runes 的对比：何时仍需 Store
- 从 Store 迁移到 Runes 的策略

#### 状态设计原则

- 单一数据源（Single Source of Truth）
- 状态提升（Lifting State Up）与状态下沉
- 派生优先：能用 `$derived` 就不用 `$state`
- 状态归一化：避免深层嵌套对象
- 不可变更新 vs Svelte 的细粒度变异追踪

### 🛠️ 练习项目 1：购物车状态管理

**项目描述**：实现一个完整的购物车状态系统。

**验收标准**：

- [ ] 创建 `cart.svelte.ts` 模块，使用 `$state` 管理购物车数组
- [ ] 实现添加商品、移除商品、修改数量、清空购物车
- [ ] 使用 `$derived` 计算：商品总数、商品种类数、总价（含折扣逻辑）
- [ ] 使用 `$effect` 将购物车持久化到 `localStorage`
- [ ] 支持在多个组件中导入并使用同一购物车状态
- [ ] 使用 TypeScript 定义 `CartItem`、`Product` 接口
- [ ] 实现促销规则：满减、折扣码（通过 `$derived` 实时计算最终价格）

### 🛠️ 练习项目 2：主题切换系统

**项目描述**：实现全局主题切换（亮色/暗色/自定义）。

**验收标准**：

- [ ] 创建 `theme.svelte.ts` 管理当前主题模式
- [ ] 主题配置包含颜色、字体、间距等 CSS 变量映射
- [ ] 使用 `$effect` 将主题应用到 `document.documentElement`
- [ ] 主题切换时平滑过渡（CSS transition）
- [ ] 持久化用户偏好到 `localStorage`
- [ ] 监听系统主题偏好（`prefers-color-scheme`）作为默认主题
- [ ] 提供自定义主题编辑器（用户可调整各颜色变量）

### ✅ 自检清单

- [ ] 能独立创建 `.svelte.ts` 模块并在多个组件中共享状态
- [ ] 能解释 `$derived` 的惰性求值与缓存机制
- [ ] 能识别并修复 `$effect` 中的无限循环问题
- [ ] 能判断一个状态应该用 `$state` 还是 `$derived`
- [ ] 能使用 Store 封装与外部 API 的实时连接（WebSocket、SSE）

### 🔗 相关专题链接

- [Svelte Runes 文档](https://svelte.dev/docs/svelte/$state)
- [Svelte Store 文档](https://svelte.dev/docs/svelte/stores)
- 状态管理最佳实践（参见 12-svelte-language-complete 与 13-component-patterns）


---

## Level 4: SvelteKit 全栈（第 15-30 天）

> **耗时预估**: 16 天
> **前置条件**: Level 3

### 🎯 学习目标

1. 理解 SvelteKit 的定位：`全栈框架`、`文件系统路由`、`Vite 驱动`
2. 掌握文件系统路由：静态路由、动态路由、`[param]`、`[...rest]`、`(group)`
3. 熟练使用 `load` 函数进行服务端数据获取（`+page.ts` / `+page.server.ts`）
4. 掌握 Form Actions：渐进增强表单、服务器端验证、错误处理
5. 能创建 API 路由（`+server.ts`）实现 RESTful 接口
6. 理解适配器（Adapter）机制，能配置 `adapter-node`、`adapter-static`、`adapter-vercel`

### 📚 知识点清单

#### 项目结构与路由系统

- `src/routes/` 目录即路由定义
- `+page.svelte`：页面组件
- `+layout.svelte` / `+layout.ts`：嵌套布局
- `+error.svelte`：错误页面
- 动态路由：`[id]`、`[slug]`、`[[optional]]`
- 捕获所有路由：`[...path]`
- 路由分组：`(group)` 不改变 URL 路径
- `+page.ts`（Universal load）vs `+page.server.ts`（Server-only load）
- `+layout.ts` / `+layout.server.ts`：布局级数据加载

#### Load 函数

- `load` 函数的参数：`params`、`url`、`fetch`、`route`、`parent`
- 服务端 `load` 中的 `locals`、`cookies`、`platform`
- 返回值结构：`{ data }` 或抛出 `error()`、`redirect()`
- 客户端导航时的 `load` 行为（数据预取）
- `await parent()`：等待父布局 load 完成
- 依赖失效与重新加载：`invalidate()`、`invalidateAll()`、`depends()`
- `export const prerender = true` / `export const ssr = false` / `export const csr = true`

#### Form Actions

- `+page.server.ts` 中 `export const actions = { default: ..., named: ... }`
- 渐进增强表单：`use:enhance` 实现无刷新提交
- `use:enhance` 回调：`pending`、`result`、`update`、`formData`
- 表单验证：服务端返回 `fail(400, { errors })`
- 成功后的重定向与状态重置
- 多 Action 命名：`formaction="?/delete"`

#### API 路由

- `+server.ts` 中导出 HTTP 方法处理函数：`GET`、`POST`、`PUT`、`DELETE`、`PATCH`
- `Request` 对象解析：`request.json()`、`request.formData()`
- `Response` 构造：`json(data)`、`new Response(body, { status })`
- 中间件模式：在 `hooks.server.ts` 中处理请求
- `handle` hook 的 `resolve(event)` 调用链
- 认证集成：在 `hooks.server.ts` 中验证 JWT/Session，注入 `locals.user`

#### 数据流与缓存

- `setHeaders` / `set-cookie` 在 load 和 actions 中的使用
- HTTP 缓存控制：`cache-control`、`etag`
- SvelteKit 的缓存策略：`body` 缓存、`dependencies` 追踪
- 流式响应：`Streaming` 与 `defer`

#### 适配器与部署

- 构建输出：`svelte-kit build`
- `adapter-auto`：自动检测平台
- `adapter-node`：独立 Node.js 服务器
- `adapter-static`：纯静态站点（SPA 模式 `fallback: 'index.html'`）
- `adapter-vercel` / `adapter-netlify`：边缘函数部署
- 环境变量：`$env/static/private`、`$env/static/public`、`$env/dynamic/private`、`$env/dynamic/public`
- Docker 化 SvelteKit 应用：多阶段构建、环境变量注入

### 🛠️ 练习项目 1：全栈博客系统

**项目描述**：使用 SvelteKit 构建一个包含文章发布、评论、管理的博客。

**验收标准**：

- [ ] 使用文件系统路由创建首页、文章列表页、文章详情页（`[slug]`）、关于页
- [ ] 使用 `+page.server.ts` 从数据库（或内存数组）加载文章数据
- [ ] 文章详情页使用动态路由，`load` 函数根据 `params.slug` 查询文章
- [ ] 使用 `+layout.svelte` 实现包含导航栏和页脚的共享布局
- [ ] 实现 404 页面（`+error.svelte`）
- [ ] 使用 Form Actions 实现评论提交（服务端验证：必填、长度限制）
- [ ] 使用 `use:enhance` 实现评论无刷新提交
- [ ] 在 `hooks.server.ts` 中实现简单的请求日志记录
- [ ] 配置 `adapter-static` 并验证构建输出

### 🛠️ 练习项目 2：REST API CRUD 服务

**项目描述**：纯 API 路由实现资源管理接口。

**验收标准**：

- [ ] 创建 `api/items` 和 `api/items/[id]` API 路由
- [ ] 实现 `GET`、`POST`、`PUT`、`DELETE` 完整 CRUD
- [ ] 使用内存存储（后续可替换为数据库）
- [ ] 请求体 JSON 解析与验证（使用 Zod 或手动验证）
- [ ] 统一的错误响应格式：`{ success: false, error: string }`
- [ ] 使用 `hooks.server.ts` 实现 API 密钥认证中间件
- [ ] 编写测试脚本（curl 或 httpie）验证所有端点

### ✅ 自检清单

- [ ] 能解释 `+page.ts` 和 `+page.server.ts` 的区别及适用场景
- [ ] 能在 `load` 函数中正确使用 `fetch` 和 `params`
- [ ] 能实现渐进增强表单（无 JS 也能工作，有 JS 体验更好）
- [ ] 能配置不同适配器并解释其工作原理
- [ ] 能在 `hooks.server.ts` 中实现请求拦截与认证注入

### 🔗 相关专题链接

- [SvelteKit 官方文档](https://kit.svelte.dev/docs)
- [SvelteKit Routing](https://kit.svelte.dev/docs/routing)
- [SvelteKit Load](https://kit.svelte.dev/docs/load)
- [SvelteKit Form Actions](https://kit.svelte.dev/docs/form-actions)

---

## Level 5: 工程化（第 31-45 天）

> **耗时预估**: 15 天
> **前置条件**: Level 4

### 🎯 学习目标

1. 配置 TypeScript 严格模式并理解所有 `tsconfig` 选项对 Svelte 项目的影响
2. 搭建 Vitest 单元测试环境，为 Svelte 组件编写可维护的测试
3. 配置 Playwright E2E 测试，覆盖关键用户路径
4. 建立 CI/CD 流水线（GitHub Actions / GitLab CI），实现自动化测试与部署
5. 使用 Docker 容器化 SvelteKit 应用，支持多环境配置
6. 掌握代码质量工具：`eslint-plugin-svelte`、`prettier-plugin-svelte`、`svelte-check`

### 📚 知识点清单

#### TypeScript 严格模式

- `strict: true` 启用的所有子选项解析
- `noImplicitAny`、`strictNullChecks`、`strictFunctionTypes`
- Svelte 组件的 TypeScript 支持：`lang="ts"`、`Generics in Svelte`
- 为 `$props` 编写复杂类型：联合类型、条件类型、映射类型
- 为 `Snippet` 定义类型参数
- 类型安全的 `EventHandler`：自定义事件类型
- `svelte-check` 的 CLI 使用与 CI 集成
- `.svelte.ts` 文件中的类型推导与显式注解

#### 单元测试（Vitest）

- Vitest 与 Jest 的对比：ESM 原生支持、更快的速度
- `@testing-library/svelte` + `vitest` 环境配置
- `render(Component, { props })` 与组件挂载
- 查询元素：`getByRole`、`getByText`、`getByTestId`
- 用户事件模拟：`userEvent.click`、`userEvent.type`
- 断言状态变化：`await waitFor(() => expect(...))`
- 测试 `$state` 响应式：状态更新后 DOM 变化验证
- Mock 外部依赖：`vi.mock`、`vi.fn`、`vi.spyOn`
- 测试覆盖率：`v8` / `istanbul` 报告器，阈值配置
- 快照测试：UI 组件快照比对

#### E2E 测试（Playwright）

- Playwright 测试框架架构：Test Runner、Fixtures、Page Object Model
- `playwright.config.ts` 配置：多浏览器测试、移动端视口、并行执行
- 定位器（Locators）优先于选择器：`getByRole`、`getByText`、`getByTestId`
- 操作与断言：`click`、`fill`、`expect(page).toHaveURL`
- 网络拦截：`page.route` Mock API 响应
- 认证状态复用：`storageState` 保存登录态
- 视觉回归测试：`toHaveScreenshot`
- CI 集成：Playwright Docker 镜像、视频/截图失败重试

#### CI/CD 与 DevOps

- GitHub Actions 工作流：`.github/workflows/ci.yml`
- 流水线阶段：Lint → Type Check → Unit Test → Build → E2E Test → Deploy
- 缓存策略：`actions/cache` 缓存 `node_modules`、Playwright 浏览器
- 并行任务矩阵：多 Node.js 版本、多浏览器
- 环境变量与 Secrets：安全注入部署令牌
- 部署策略：Vercel / Netlify / Docker 的自动部署配置
- 预览部署（Preview Deployment）：PR 自动部署临时环境

#### 代码质量工具链

- `eslint-plugin-svelte`：Svelte 专用规则配置
- `prettier-plugin-svelte`：Svelte 文件格式化
- `husky` + `lint-staged`：提交前自动检查
- `commitlint`：规范提交信息（Conventional Commits）
- `depcheck` / `knip`：检测未使用依赖

#### Docker 与容器化

- 多阶段构建（Multi-stage Build）减小镜像体积
- `node:alpine` 或 `node:slim` 基础镜像选择
- `adapter-node` 应用的 Docker 化流程
- 运行时环境变量注入（非构建时）
- Docker Compose：本地开发环境编排（App + DB + Redis）
- 健康检查（Healthcheck）配置
- 非 root 用户运行 Node.js 进程

### 🛠️ 练习项目：SaaS 项目骨架

**项目描述**：搭建一个生产就绪的 SaaS 项目脚手架。

**验收标准**：

- [ ] 项目结构：`src/lib/components/`、`src/lib/server/`、`src/lib/stores/`、`src/routes/(app)/`、`src/routes/(marketing)/`
- [ ] TypeScript 严格模式启用，零 `any` 类型（除必要场景外）
- [ ] Vitest + Testing Library 环境搭建，为核心工具函数编写单元测试（覆盖率 ≥ 80%）
- [ ] 为登录流程、核心 CRUD 操作编写 Playwright E2E 测试
- [ ] GitHub Actions CI 流水线：代码提交时自动运行 Lint、Type Check、Test、Build
- [ ] PR 时自动部署预览环境（Vercel / Netlify）
- [ ] 提交前 Husky 钩子：运行 `lint-staged`（ESLint + Prettier）
- [ ] 提交信息符合 Conventional Commits 规范
- [ ] Dockerfile 多阶段构建，最终镜像 < 200MB
- [ ] `docker-compose.yml` 支持一键启动完整开发环境

### ✅ 自检清单

- [ ] 能为 Svelte 组件编写覆盖交互逻辑的单元测试
- [ ] 能配置 Playwright 测试多浏览器兼容性
- [ ] 能独立编写 GitHub Actions 工作流文件
- [ ] 能解释 Docker 多阶段构建的优势并手写 Dockerfile
- [ ] 能在 CI 中正确缓存依赖和构建产物以加速流水线

### 🔗 相关专题链接

- [Vitest 文档](https://vitest.dev/)
- [Playwright 文档](https://playwright.dev/)
- [GitHub Actions 文档](https://docs.github.com/cn/actions)
- [Docker Node.js 最佳实践](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)

---

## Level 6: 高级模式（第 46-60 天）

> **耗时预估**: 15 天
> **前置条件**: Level 5

### 🎯 学习目标

1. 能开发自定义 Svelte Action，封装 DOM 操作与第三方库集成
2. 掌握泛型组件开发，实现类型安全的可复用组件库
3. 了解 Svelte 编译器架构，能编写简单的预处理器
4. 理解微前端架构，能在 Svelte 中集成 Module Federation / Web Components
5. 能设计并开发一套内部组件库

### 📚 知识点清单

#### 自定义 Action

- `use:action` 语法：`function action(node, params)`
- Action 的生命周期：挂载时调用、参数更新时调用、卸载时清理
- 返回对象：`update`、`destroy`
- 常见 Action 场景：
  - 点击外部关闭（`clickOutside`）
  - 懒加载图片（`lazyLoad`）
  - 自动聚焦与选择（`autoFocus`）
  - 无限滚动（`infiniteScroll`）
  - 第三方库集成（Chart.js、Mapbox、CodeMirror）
- Action 与 `$effect` 的对比：何时用 Action 何时用 `$effect`
- 类型安全的 Action：`Action` / `ActionReturn` 类型

#### 泛型组件

- Svelte 5 组件泛型：`<script generics="T extends { id: string }">`
- 泛型 Props：`interface Props<T> { items: T[]; render: Snippet<[T]> }`
- 泛型 Snippet：`Snippet<[T]>` 的类型推导
- 类型安全的列表组件：`DataTable<T>`、`Select<T>`
- 条件类型在组件 Props 中的应用
- 默认泛型参数

#### 编译器与预处理器

- Svelte 编译流程：Parse → Validate → Compile → Output (JS + CSS)
- AST（抽象语法树）基础：`TemplateNode`、`Expression`
- 预处理器接口：`{ markup, script, style }`
- 使用 `svelte-preprocess`：TypeScript、SCSS、PostCSS、Pug
- 自定义预处理器：将特定语法转换为标准 Svelte
- Source Map 处理与调试
- Vite 插件开发：与 Svelte 编译器交互

#### 微前端与集成

- 微前端架构模式：`Module Federation`、`Web Components`、`iframe`
- Svelte 组件导出为 Web Component：`customElement: true`
- Web Component 的 Props、Events、Slots 映射
- `Module Federation` 在 Vite 中的配置（`@originjs/vite-plugin-federation`）
- 跨框架状态共享：使用原生事件或共享 Store
- 样式隔离策略：Shadow DOM、CSS Modules、BEM

#### 组件库开发

- 组件库项目结构：独立包、Monorepo
- 使用 `svelte-package` 打包组件库
- `exports` 字段配置：`svelte` 条件导出
- 类型声明文件自动生成与手动维护
- 文档站点：Storybook / Histoire / 自定义 VitePress
- 主题系统：CSS 变量、主题配置对象、深色模式支持
- 无障碍（a11y）基础：`ARIA` 属性、键盘导航、焦点管理、颜色对比度
- 组件 API 设计原则：Props 命名约定、事件命名、版本兼容性

### 🛠️ 练习项目：内部组件库开发

**项目描述**：开发并发布一套基础 UI 组件库。

**验收标准**：

- [ ] 至少包含 10 个组件：Button、Input、Select、Modal、Toast、Table、Pagination、Tabs、Dropdown、Tooltip
- [ ] 所有组件使用 TypeScript，核心组件使用泛型（如 DataTable、Select）
- [ ] 至少 3 个自定义 Action（clickOutside、tooltip、autoFocus）
- [ ] 组件库支持主题定制：通过 CSS 变量覆盖样式
- [ ] 提供深色模式支持
- [ ] 每个组件有完整的使用文档和 Props 说明
- [ ] 使用 `svelte-package` 打包，支持 `import { Button } from 'my-ui-lib'`
- [ ] 发布到内部 npm registry 或 GitHub Packages
- [ ] 提供 Storybook / Histoire 文档站点
- [ ] 所有组件通过基础无障碍检查（键盘可操作、ARIA 标签正确）

### ✅ 自检清单

- [ ] 能独立开发一个封装第三方库（如 Chart.js）的 Svelte Action
- [ ] 能编写使用泛型的类型安全组件（如 `DataTable<T>`）
- [ ] 能解释 Svelte 编译的主要阶段和输出产物
- [ ] 能将 Svelte 组件打包为 Web Component 并在纯 HTML 中使用
- [ ] 能设计组件库的公共 API 并编写使用文档

### 🔗 相关专题链接

- [Svelte Actions 文档](https://svelte.dev/docs/svelte/action)
- [Svelte 编译器 API](https://svelte.dev/docs/svelte-compiler)
- [svelte-preprocess](https://github.com/sveltejs/svelte-preprocess)
- [Histoire（Svelte 组件文档）](https://histoire.dev/)


---

## Level 7: 架构设计（第 61-90 天）

> **耗时预估**: 30 天
> **前置条件**: Level 6

### 🎯 学习目标

1. 掌握领域驱动设计（DDD）在前端应用中的实践方法
2. 能设计可扩展的微前端架构，处理跨应用通信与共享依赖
3. 设计大型应用的状态架构，平衡本地状态、共享状态与服务器状态
4. 建立系统化的性能优化策略：加载性能、运行时性能、构建性能
5. 将无障碍（Accessibility）作为一等公民融入开发流程
6. 能输出技术方案文档（RFC）并推动团队共识

### 📚 知识点清单

#### 领域驱动设计（DDD）前端实践

- 战略设计：`限界上下文（Bounded Context）`识别与映射
- 战术设计：`实体（Entity）`、`值对象（Value Object）`、`聚合（Aggregate）`
- 前端分层架构：`Presentation` → `Application` → `Domain` → `Infrastructure`
- `Repository` 模式：封装数据获取逻辑，隔离基础设施
- `Service` 对象：处理跨聚合的业务逻辑
- `Command` / `Query` 分离：明确写操作与读操作的路径
- 模块边界与依赖规则：领域层不依赖框架
- `.svelte.ts` 在 DDD 中的定位：Application 层与 Presentation 层的桥梁

#### 微前端架构深入

- 微前端决策矩阵：何时需要微前端，何时是过度设计
- 集成模式对比：
  - `Module Federation`：运行时共享模块，适合同源团队协作
  - `Web Components`：框架无关，适合异构技术栈
  - `iframe`：强隔离，适合第三方/遗留系统集成
  - `Edge Side Includes (ESI)`：服务端组装
- 共享依赖策略：`singleton` 模式、版本兼容性、共享库抽离
- 跨应用路由：基座路由（Shell Router）与子应用路由协同
- 跨应用状态通信：`CustomEvent`、`BroadcastChannel`、共享 Cookie/LocalStorage
- 样式隔离进阶：CSS 变量命名空间、构建时样式前缀、Shadow DOM 利弊
- 独立部署与版本管理：向后兼容策略、灰度发布

#### 状态架构设计

- 状态分类：
  - `UI State`（本地）：模态框开关、表单临时值 → `$state`
  - `Client State`（共享）：用户偏好、购物车 → `.svelte.ts`
  - `Server State`：远程数据、缓存、乐观更新 → `SvelteKit load` + 自定义封装
  - `URL State`：筛选条件、分页 → URL query params
- 状态同步策略：`Stale-While-Revalidate`、`Optimistic Update`、`Polling` vs `SSE` vs `WebSocket`
- 大型状态树拆分：按领域模块拆分，避免单一巨型状态对象
- 派生状态的性能： memoization、选择性订阅
- 状态持久化策略：`localStorage`、`IndexedDB`、`OPFS`、服务端会话

#### 性能架构

- **加载性能**：
  - 路由级代码分割：`dynamic import()`
  - 资源优先级：`preload`、`prefetch`、`modulepreload`
  - 图片优化：`avif`/`webp` 格式、`srcset`、懒加载、`<picture>` 元素
  - 字体优化：`font-display: swap`、子集化、预加载关键字体
  - Core Web Vitals：`LCP`、`INP`、`CLS` 的测量与优化
- **运行时性能**：
  - 响应式性能：避免过大的 `$state` 对象、细粒度拆分
  - 列表虚拟化：十万级数据渲染（`svelte-virtual` 或自研）
  - `$effect` 性能：减少不必要的依赖追踪、批量更新
  - 内存管理：组件卸载时清理事件、定时器、外部引用
- **构建性能**：
  - Vite 构建优化：`rollup` 配置、`manualChunks`
  - 依赖预构建（`optimizeDeps`）
  - 增量构建与 `vite-plugin-inspect` 分析

#### 无障碍与包容性设计

- WCAG 2.2 标准：A、AA、AAA 级别要求
- 语义化 HTML 与 ARIA 的权衡：优先原生语义，ARIA 补充
- 键盘导航：`Tab` 顺序、`focus trap`（Modal 中）、`Skip Link`
- 屏幕阅读器：有意义的标题层级、表单标签关联、`aria-live` 区域
- 焦点管理：路由切换后焦点重置、错误聚焦
- 色彩与对比度：WCAG 对比度要求（4.5:1 正文、3:1 大文本）、不只依赖颜色传达信息
- 动态内容通知：`aria-live="polite/assertive"`
- 无障碍测试：`axe-core` 自动化扫描、屏幕阅读器手动测试（NVDA/VoiceOver）
- 国际化（i18n）基础：`svelte-i18n` / `typesafe-i18n`、RTL 布局支持

#### 技术治理

- RFC（Request for Comments）文档结构：问题背景、方案对比、影响评估、实施计划
- 架构决策记录（ADR）：记录重大技术决策及其上下文
- 代码审查清单：性能、安全、无障碍、测试覆盖
- 技术债务管理：识别、量化、偿还计划

### 🛠️ 练习项目：设计大型应用架构

**项目描述**：为一个假想的"企业级项目管理平台"输出完整架构设计。

**验收标准**：

- [ ] 输出系统上下文图（C4 Model Level 1）和容器图（C4 Model Level 2）
- [ ] 划分限界上下文：项目管理、团队协作、权限控制、通知系统、报表分析
- [ ] 为每个上下文设计独立部署单元（Monolith Modular 或 Micro-Frontend）
- [ ] 设计全局状态架构图，标明各类状态的位置与流向
- [ ] 输出性能预算：首屏加载时间、交互响应时间、内存占用上限
- [ ] 制定无障碍检查清单并融入 CI
- [ ] 编写一份 RFC 文档，论证技术选型（SvelteKit vs Next.js vs Nuxt）
- [ ] 设计错误监控与性能监控方案（Sentry + Web Vitals）

### ✅ 自检清单

- [ ] 能识别应用中的限界上下文并合理划分模块边界
- [ ] 能为大型应用设计分层的领域模型（Entity、VO、Aggregate）
- [ ] 能针对 Core Web Vitals 制定具体的优化方案并验证效果
- [ ] 能主导一次技术 RFC 评审并处理反对意见
- [ ] 能在 CI 中集成无障碍自动化检查

### 🔗 相关专题链接

- [C4 Model](https://c4model.com/)
- [Web Vitals](https://web.dev/vitals/)
- [WCAG 2.2 中文翻译](https://www.w3.org/WAI/WCAG22/quickref/)
- [Svelte 性能优化指南](https://svelte.dev/docs/kit/performance)

---

## Level 8: 源码与生态（第 91-100 天）

> **耗时预估**: 10 天
> **前置条件**: Level 7

### 🎯 学习目标

1. 深入理解 Svelte 编译器源码结构，能阅读并解释核心编译流程
2. 理解 Svelte 5 响应式引擎的实现原理：`Signal`、`Effect`、`Schedule`
3. 能为 Svelte / SvelteKit 开源项目贡献代码（Bug Fix、文档改进、功能实现）
4. 能独立发布并维护一个开源 Svelte 库或工具
5. 建立持续学习与技术影响力的长期机制

### 📚 知识点清单

#### 编译器源码探索

- Svelte 仓库结构：`packages/svelte/src/compiler/`
- 编译三阶段：
  1. `parse`：`template` → `AST`（`TemplateNode`、`Element`、`ExpressionTag`）
  2. `analyze`：变量追踪、依赖图构建、响应式标记
  3. `transform` / `compile`：AST → JavaScript 代码字符串
- 关键源码文件：
  - `phases/1-parse/`：模板解析器（基于状态机）
  - `phases/2-analyze/`：语义分析、作用域分析、响应式分析
  - `phases/3-transform/`：代码生成、DOM 操作生成
- `compile` 函数 API 与选项
- Source Map 生成机制
- SSR 编译模式与 DOM 编译模式的差异

#### 响应式引擎原理

- `Signal` 模式：细粒度响应式的核心抽象
- `state` → `source signal`：值的包装与变更通知
- `derived` → `computed signal`：依赖追踪与缓存失效
- `effect` → `effect signal`：副作用执行与调度
- 依赖图结构：有向无环图（DAG）、依赖收集（订阅时建立连接）
- 调度算法：批处理更新（Microtask Queue）、优先级排序
- 循环检测：防止派生状态形成循环依赖
- 与 Reactivity 系统的对比：Vue Vapor Mode、SolidJS、Preact Signals

#### 开源贡献

- 贡献前准备：阅读 `CONTRIBUTING.md`、签署 CLA
- Issue 管理：搜索重复 Issue、提供最小复现（REPL / StackBlitz）
- 本地开发环境：`pnpm` workspace、`svelte` 包链接
- 调试编译器：`console.log` / 断点调试 AST 变换
- 测试要求：单元测试、`runtime-tests`、`server-side-tests`
- 提交规范：`Conventional Commits`、关联 Issue 编号
- PR 流程：草稿 PR → 评审 → 修改 → 合并
- 文档贡献：API 文档、教程改进、翻译

#### 发布与维护开源库

- 开源库命名与定位
- `package.json` 完整配置：`exports`、`types`、`files`、`peerDependencies`
- 版本管理：`semver` 规范、Changesets 工具
- 发布流程：`npm publish`、GitHub Releases、自动化发布（Changeset Bot）
- 社区运营：README 撰写、使用示例、迁移指南
- Issue 模板与 PR 模板配置
- 长期维护策略：兼容性承诺、弃用策略、安全更新响应

#### 持续学习与技术影响力

- 关注 Svelte RFC 仓库：参与新特性讨论
- 订阅官方博客与核心开发者 Twitter / Bluesky
- 撰写技术博客：源码解析、架构实践、踩坑记录
- 技术演讲与分享：Meetup、技术大会提案
- 建立个人技术品牌：GitHub Profile、技术博客、开源作品集

### 🛠️ 练习项目 1：修复一个真实 Bug

**项目描述**：在 Svelte 或 SvelteKit 仓库中找到一个标记为 `good first issue` 的 Issue 并修复。

**验收标准**：

- [ ] 在 GitHub 上找到并认领一个 Issue（或确认无人处理）
- [ ] 本地克隆仓库并能运行测试套件
- [ ] 编写最小复现测试用例（如为 `runtime-tests` 添加新测试）
- [ ] 定位 Bug 根因并修复
- [ ] 所有现有测试通过，新测试验证修复
- [ ] 提交 PR，包含清晰的描述和变更说明
- [ ] 响应维护者的评审意见并完成修改

### 🛠️ 练习项目 2：发布开源库

**项目描述**：将 Level 6 开发的组件库或一个新工具发布为开源项目。

**验收标准**：

- [ ] 创建独立的 GitHub 仓库，包含完整的 README（安装、使用、API、License）
- [ ] 配置 GitHub Actions：CI 测试、类型检查、自动发布
- [ ] 使用 Changesets 管理版本和 CHANGELOG
- [ ] 发布到 npm registry
- [ ] 提供在线文档站点或 Storybook
- [ ] 配置 Issue 模板和 PR 模板
- [ ] 在社区分享（Twitter、Reddit r/sveltejs、Discord）并收集反馈
- [ ] 根据用户反馈迭代至少一个版本

### ✅ 自检清单

- [ ] 能阅读 Svelte 编译器源码并解释一个组件的编译输出变化
- [ ] 能解释 Signal 的依赖追踪与调度机制
- [ ] 能独立完成一次开源项目的 Bug Fix 并合并到主分支
- [ ] 能独立发布并维护一个 npm 包
- [ ] 能撰写一篇被社区认可的技术文章或演讲

### 🔗 相关专题链接

- [Svelte GitHub 仓库](https://github.com/sveltejs/svelte)
- [SvelteKit GitHub 仓库](https://github.com/sveltejs/kit)
- [Svelte RFCs](https://github.com/sveltejs/rfcs)
- [Svelte Discord](https://svelte.dev/chat)
- [npm semver 规范](https://docs.npmjs.com/about-semantic-versioning)

---

## 附录：百日学习路线图速览

| 阶段 | 天数 | 核心主题 | 关键产出 |
|------|------|----------|----------|
| Level 0 | 第 0 天 | 预备知识 | 响应式静态页 + TypeScript |
| Level 1 | 第 1-3 天 | 初识 Svelte | Todo List（Runes 基础）|
| Level 2 | 第 4-7 天 | 组件交互 | Modal + 表单验证组件 |
| Level 3 | 第 8-14 天 | 状态管理 | 购物车 + 主题系统 |
| Level 4 | 第 15-30 天 | SvelteKit 全栈 | 全栈博客 + REST API |
| Level 5 | 第 31-45 天 | 工程化 | SaaS 项目骨架（CI/CD + Docker）|
| Level 6 | 第 46-60 天 | 高级模式 | 内部组件库（泛型 + Action）|
| Level 7 | 第 61-90 天 | 架构设计 | 企业级平台架构 RFC |
| Level 8 | 第 91-100 天 | 源码与生态 | 开源贡献 + 发布 npm 包 |

---

## 学习建议

### 每日节奏

- **上午（理论）**：阅读文档或源码 1-2 小时，做笔记
- **下午（实践）**：动手编码，完成当天的练习项目或验收标准
- **晚上（复盘）**：回顾当天难点，整理到个人知识库（Notion / Obsidian / 博客）

### 避坑指南

1. **不要跳过 Level 0**：现代 JS 和 TS 基础不牢，后续调试会大量时间花在类型错误上
2. **不要只看不写**：Svelte 的响应式思维需要肌肉记忆，每天至少写 100 行组件代码
3. **不要过早优化**：Level 1-3 不要纠结性能，先让功能跑通；性能优化在 Level 6+ 系统学习
4. **不要孤立学习**：遇到卡住的问题，优先查官方文档和源码，其次社区提问
5. **不要忽视测试**：Level 5 之后的每个练习项目都应附带测试，测试即文档

### 社区资源

- **官方**：<https://svelte.dev> / <https://kit.svelte.dev>
- **教程**：Svelte 官方 Interactive Tutorial（强烈推荐完整走一遍）
- **问答**：Stack Overflow（`svelte` / `sveltekit` 标签）、Reddit r/sveltejs
- **实时交流**：Svelte Discord（#help、#showcase 频道）
- **中文社区**：掘金、知乎、语雀上的 Svelte 专题

### 推荐书单

- 《JavaScript 高级程序设计》（第 4 版）— 夯实 JS 基础
- 《TypeScript 编程》（Boris Cherny）— 类型系统深入
- 《领域驱动设计》（Eric Evans）— 战略设计思维
- 《Web 性能权威指南》（Ilya Grigorik）— 性能优化体系
- 《Svelte and SvelteKit》— Svelte 生态专著（如有出版）

> 💡 **记住**：100 天不是终点，而是让你建立独立学习和解决复杂问题能力的起点。技术永远在演进，培养阅读源码、跟踪 RFC、参与社区的习惯，比记住任何 API 都更重要。

---

*本文档遵循 [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) 协议，欢迎引用与改进。*
