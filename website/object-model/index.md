---
title: JavaScript 对象模型与原型链
description: "从 V8 引擎底层到语言表面的深度解析，涵盖对象创建、原型链、Class 语法糖、Proxy/Reflect、私有字段与对象设计模式。"
editLink: true
head:
  - - meta
    - property: og:title
      content: "对象模型深度专题 | Awesome JS/TS Ecosystem"
  - - meta
    - property: og:description
      content: "JavaScript 对象模型深度解析：V8 引擎底层、原型链、Class 语法糖、Proxy/Reflect、私有字段"
---

# JavaScript 对象模型与原型链

> 本专题是 L1 语言核心层的结构性缺口之一。JavaScript 的对象系统既是语言最灵活的部分，也是性能陷阱与安全隐患的集中地。理解 V8 的底层表示，是写出高性能、可维护代码的前提。

## 专题全景图

```mermaid
mindmap
  root((对象模型<br/>Object Model))
    对象基础
      字面量 / new / Object.create
      属性描述符
      Getter / Setter
      V8 JSObject
    原型链
      [[Prototype]]
      __proto__ / getPrototypeOf
      原型污染防护
      属性查找与 IC
    Class 语法糖
      extends / super
      new.target
      语义差异
    Proxy / Reflect
      拦截器矩阵
      不可撤销 Proxy
      性能代价
    私有字段
      #prefix
      WeakMap 模拟
      封装边界
    对象模式
      工厂 / 混入
      组合优于继承
      Object.assign 陷阱
```

## 核心概念速查

| 概念 | 说明 | 代码示例 |
|------|------|----------|
| 普通对象 | 键值对的集合 | `{ a: 1 }` |
| 数组 | 带索引的特殊对象 | `[1, 2, 3]` |
| 函数 | 可调用的对象，含 `prototype` | `function() {}` |
| 原型 | 对象继承属性的来源 | `obj.__proto__` |
| 原型链 | 原型对象形成的链式结构 | `A → B → Object.prototype` |
| 属性描述符 | 控制属性的行为 | `{ value, writable, enumerable, configurable }` |
| Proxy | 对象拦截代理 | `new Proxy(target, handler)` |
| Reflect | 操作对象的 API | `Reflect.get(obj, 'key')` |

## V8 中的对象表示

```
JSObject (JavaScript 对象在 V8 中的 C++ 类)
├── Map (隐藏类 / HiddenClass / Shape)
│   └── 描述对象的结构：属性名、偏移量、转型树
├── Properties (慢属性 / 字典模式)
│   └── 当属性过多或频繁删除时使用 HashTable
├── Elements (数组索引属性)
│   └── 快速模式：Packed / Holey
└── In-Object Properties (内联属性 / 快属性)
    └── 直接存储在对象体内，访问最快
```

**性能要点**：

- 内联属性（In-Object）访问最快，类似 C 结构体字段
- 隐藏类（HiddenClass）相同意味着对象结构相同，可共享优化代码
- 避免动态增删属性，否则导致隐藏类退化（deopt）

```javascript
// ✅ 隐藏类稳定（所有对象结构相同）
function Point(x, y) {
  this.x = x
  this.y = y
}
const p1 = new Point(1, 2)
const p2 = new Point(3, 4)

// ❌ 隐藏类退化（p2 多出一个属性）
const p3 = new Point(5, 6)
p3.z = 9  // 创建新的隐藏类！
```

## 章节导航

| 章节 | 内容 | 预计阅读 |
|------|------|----------|
| [01 - 对象基础](./01-object-fundamentals) | 创建方式、属性描述符、Getter/Setter、V8 内部表示 | 15 min |
| [02 - 原型链深度](./02-prototype-chain) | `[[Prototype]]`、原型查找、原型污染、性能对比 | 20 min |
| [03 - Class vs 原型](./03-class-vs-prototype) | ES6 Class 继承链、`super`、`new.target` | 15 min |
| [04 - Proxy / Reflect](./04-proxy-reflect) | 拦截器、不可撤销 Proxy、Reflect API | 15 min |
| [05 - 私有字段](./05-private-fields) | `#prefix`、WeakMap 模拟、封装模式 | 10 min |
| [06 - 对象模式](./06-object-patterns) | 工厂、混入、组合优于继承、Object.assign 陷阱 | 15 min |

## 常见问题

### `__proto__`  vs `Object.getPrototypeOf`

| 特性 | `__proto__` | `Object.getPrototypeOf` |
|------|-------------|-------------------------|
| 标准性 | 遗留特性（Annex B） | ES5 标准 |
| 可写性 | 可设置（改变原型链） | 只读获取 |
| 性能 | 有 getter/setter 开销 | 直接访问内部槽 |
| 推荐度 | ❌ 不推荐 | ✅ 推荐 |

```javascript
// 获取原型
Object.getPrototypeOf(obj)  // ✅
obj.__proto__               // ❌ 遗留写法

// 设置原型（尽量避免，性能差）
Object.setPrototypeOf(obj, newProto)  // 如果必须
```

### Class 不是传统的 Class

```javascript
class Animal {
  speak() { return 'sound' }
}

class Dog extends Animal {
  speak() { return 'woof' }
}

// 本质上仍是原型委托
Dog.prototype.__proto__ === Animal.prototype  // true
typeof Dog === 'function'  // true（Class 是语法糖）
```

### 原型污染防护

```javascript
// 危险：合并对象时可能污染 Object.prototype
function merge(target, source) {
  for (const key in source) {
    if (typeof source[key] === 'object') {
      merge(target[key], source[key])  // 如果 key === '__proto__'...
    } else {
      target[key] = source[key]
    }
  }
}

// ✅ 安全版本
function safeMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (key === '__proto__' || key === 'constructor') continue
    // ...
  }
}

// ✅ 使用 Object.create(null) 创建无原型对象
const safe = Object.create(null)
safe.__proto__ = 'value'  // 不会污染 Object.prototype
```

## 延伸阅读

- **[对象模型理论研究](../30-knowledge-base/30.8-research/tsjs-stack-panorama-2026/OBJECT_MODEL_THEORY.md)** — 原型继承、属性描述符、Proxy元编程与内存布局的形式化语义，为专题中的 [01 对象基础](./01-object-fundamentals)、[02 原型链深度](./02-prototype-chain.md) 和 [03 Class vs 原型](./03-class-vs-prototype.md) 提供编译器视角的深度解析。
- **[JavaScript 引擎原理](../30-knowledge-base/30.8-research/tsjs-stack-panorama-2026/JS_ENGINE_PRINCIPLES.md)** — V8隐藏类、内联缓存与垃圾回收的形式化算法，直接支撑对象创建、属性访问与内存管理的性能优化策略。
- [基础导读 — 对象模型](../fundamentals/object-model) — 面向初学者的对象模型概述
- [设计模式](../patterns/) — 对象模式在工程中的应用

## 学习路径

1. **对象基础** — 先建立对 JS 对象在 V8 中如何存储的直觉。
2. **原型链** — 理解属性查找的遍历过程与原型污染风险。
3. **Class vs 原型** — 破除「Class 就是传统 OOP」的误解。
4. **Proxy / Reflect** — 掌握元编程与拦截器。
5. **私有字段** — 厘清语言级私有与约定式私有的区别。
6. **对象模式** — 在实际工程中做出合理的对象设计决策。
