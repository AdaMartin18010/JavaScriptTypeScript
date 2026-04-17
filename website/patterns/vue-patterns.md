---
title: 'Vue 3 + TypeScript 设计模式'
description: 'Vue 3 开发中最常用的 10 种设计模式索引，涵盖组合式 API、依赖注入、插槽、状态管理、路由等核心主题。'
---

# Vue 3 + TypeScript 设计模式

> 本文档涵盖了 Vue 3 开发中最常用的 10 种设计模式，所有示例均使用 TypeScript 编写。

完整源码及详细示例请参见 [`docs/patterns/VUE_PATTERNS.md`](https://github.com/AdaMartin18010/JavaScriptTypeScript/blob/main/docs/patterns/VUE_PATTERNS.md)。

---

## 1. 组合式 API (Composition API) 模式

在大型组件中，选项式 API 导致相关逻辑分散在不同的选项中（data、methods、computed），使得代码难以维护和复用。组合式 API 通过 `setup` 函数或 `<script setup>` 将相关逻辑聚合在一起，配合 `composables` 实现跨组件复用。

**核心要点**：

- 使用 `<script setup>` 简化代码
- 提取可复用的 composable 函数
- 使用 `ref` / `reactive` / `computed` 管理状态
- 生命周期钩子扁平化

---

## 2. 选项式 API 最佳实践

虽然 Vue 3 推荐使用组合式 API，但在维护遗留项目或团队协作中，仍需要使用选项式 API。掌握其最佳实践有助于平滑迁移和团队协作。

**核心要点**：

- 组件命名与文件组织
- Props 定义与验证
- 事件命名规范
- Mixins 的替代方案

---

## 3. Provide/Inject 依赖注入

深层嵌套的组件需要通过 props 逐层传递数据，导致 prop drilling 问题。Vue 3 的 `provide` / `inject` API 提供了跨层级依赖注入的能力。

**核心要点**：

- 使用 Symbol 作为注入键避免命名冲突
- 配合 `computed` 实现响应式注入
- TypeScript 类型安全注入
- 与组合式 API 的结合使用

---

## 4. 自定义指令模式

需要直接操作 DOM 实现特定功能（如焦点管理、拖拽、权限控制）时，组件化方式过于笨重。自定义指令是更轻量的解决方案。

**核心要点**：

- 指令生命周期钩子
- 参数与修饰符
- TypeScript 类型定义
- 常见指令：v-focus、v-permission、v-debounce

---

## 5. 渲染函数和 JSX

模板语法在处理动态渲染逻辑、高阶组件或复杂条件渲染时能力有限。渲染函数和 JSX 提供了更灵活的编程式渲染能力。

**核心要点**：

- `h()` 函数的使用
- JSX / TSX 配置
- 函数式组件
- 与模板语法的对比与选型

---

## 6. 插槽 (Slots) 高级模式

需要创建高度可定制的组件，让用户能够完全控制组件的某些部分，同时保持组件的封装性。插槽是 Vue 组件组合的核心机制。

**核心要点**：

- 具名插槽与默认插槽
- 作用域插槽
- 动态插槽名
- 渲染函数中的插槽处理

---

## 7. 状态管理 (Pinia/Vuex)

多个组件需要共享状态，props 传递和事件机制变得复杂，需要集中式的状态管理方案。Vue 3 官方推荐 Pinia 作为状态管理库。

**核心要点**：

- Store 定义与模块化
- State / Getter / Action / Plugin
- 组合式 Store
- SSR 兼容性

---

## 8. 组件库设计模式

需要设计一套可复用、可扩展的组件库，支持主题定制、类型提示和良好的开发者体验。

**核心要点**：

- Config Provider 全局配置
- 组件样式隔离与 CSS 变量
- 类型安全的组件库
- 按需加载与 Tree Shaking

---

## 9. Vue 3 的响应式系统原理

深入理解 Vue 3 响应式系统的工作原理，以便更好地调试和优化应用性能。

**核心要点**：

- `Proxy` 与 `Reflect`
- `ref` vs `reactive`
- 依赖收集与触发
- 常见响应式陷阱与解决方案

---

## 10. Vue Router 高级模式

需要实现复杂的导航守卫、动态路由、路由元信息处理等高级路由功能。

**核心要点**：

- 导航守卫链
- 动态路由与路由懒加载
- 路由元信息
- 滚动行为控制
- 组合式 API 中的路由操作

---

## 推荐阅读顺序

1. **入门**：先掌握组合式 API 与选项式 API 最佳实践
2. **进阶**：学习 Provide/Inject、插槽和自定义指令
3. **工程化**：深入状态管理、组件库设计和响应式原理
4. **高级**：探索渲染函数/JSX 和 Vue Router 高级模式

---

> 📎 完整代码示例和详细说明请参考项目源码 [`docs/patterns/VUE_PATTERNS.md`](https://github.com/AdaMartin18010/JavaScriptTypeScript/blob/main/docs/patterns/VUE_PATTERNS.md)。
