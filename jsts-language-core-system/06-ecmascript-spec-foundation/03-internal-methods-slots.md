# 内部方法与内部槽

> ECMAScript 对象的底层操作机制：[[Get]]、[[Set]]、[[Call]] 等

---

## 内容大纲（TODO）

### 1. 内部方法概述

- 双括号表示法：`[[Method]]`
- 所有对象共有的基本内部方法

### 2. 基本内部方法

- [[GetPrototypeOf]]
- [[SetPrototypeOf]]
- [[IsExtensible]]
- [[PreventExtensions]]
- [[GetOwnProperty]]
- [[DefineOwnProperty]]
- [[HasProperty]]
- [[Get]]
- [[Set]]
- [[Delete]]
- [[OwnPropertyKeys]]

### 3. 函数对象的内部方法

- [[Call]]
- [[Construct]]

### 4. 内部槽（Internal Slots）

- [[Prototype]]
- [[Extensible]]
- Array 的 [[ArrayLength]]
- Promise 的 [[PromiseState]] / [[PromiseResult]]

### 5. Proxy 与内部方法

- Proxy 的拦截点与内部方法的对应
- 不可代理的内部槽

### 6. 与反射 API 的关系

- Reflect 方法与内部方法的一一对应
