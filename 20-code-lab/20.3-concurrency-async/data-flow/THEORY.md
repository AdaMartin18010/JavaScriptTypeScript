# 数据流 — 理论基础

## 1. 单向数据流

数据从父组件流向子组件，通过 props 传递：

```
父组件状态 → props → 子组件 → 事件 → 父组件更新状态
```

优点：数据变化可预测，调试容易。代表：React、Vue（可选）。

## 2. 双向数据绑定

数据在视图和模型之间自动同步：

```
视图 <-> 视图模型 <-> 模型
```

优点：代码量少。缺点：大规模应用难以追踪数据变化来源。代表：Vue v-model、Angular ngModel。

## 3. 响应式数据流

基于观察者模式，数据变化自动传播：

- **Observable**: 可观察的数据源
- **Observer**: 订阅并响应变化的消费者
- **Operators**: map、filter、merge、switchMap 等转换操作

代表：RxJS、MobX、Vue 3 Reactivity、Solid Signals。

## 4. 状态管理架构

| 模式 | 特点 | 代表 |
|------|------|------|
| **Flux** | 单向数据流，Action → Dispatcher → Store → View | Redux |
| **Proxy 响应式** | 自动追踪依赖，细粒度更新 | Vue、MobX |
| **原子化状态** | 独立原子单元，组合使用 | Recoil、Jotai |
| **状态机** | 有限状态，显式转换 | XState |

## 5. 与相邻模块的关系

- **14-execution-flow**: 执行顺序与异步控制
- **18-frontend-frameworks**: 前端框架的状态管理
- **53-app-architecture**: 应用架构中的数据层
