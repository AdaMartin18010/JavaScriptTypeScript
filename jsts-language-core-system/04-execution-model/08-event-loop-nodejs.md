# Node.js 事件循环

> libuv 的事件循环阶段详解与浏览器差异

---

## 内容大纲（TODO）

### 1. libuv 概述

- 跨平台异步 I/O 库
- 事件循环的核心地位

### 2. 事件循环阶段

1. timers：setTimeout/setInterval 回调
2. pending callbacks：系统操作的回调
3. idle, prepare：内部使用
4. poll：检索新的 I/O 事件
5. check：setImmediate 回调
6. close callbacks：关闭事件的回调

### 3. process.nextTick

- 独立于事件循环
- 当前操作完成后立即执行
- 优先于 Promise 微任务

### 4. setImmediate vs setTimeout

- 两者在 poll 阶段的交互
- 非 I/O 循环中的不确定性

### 5. 与浏览器事件循环的差异

- 阶段划分的差异
- process.nextTick 的特殊性
- I/O 优先级的差异

### 6. 可视化

- libuv 事件循环的 Mermaid 流程图
