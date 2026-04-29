# 类型系统

> **定位**：`20-code-lab/20.1-fundamentals-lab/language-core/01-types`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块聚焦 JavaScript 的类型系统与 TypeScript 的静态类型扩展，解决动态类型带来的运行时错误与可维护性挑战。通过类型注解和推断提升代码可靠性。

### 1.2 形式化基础

[本模块的形式化定义与公理/定理陈述]

### 1.3 关键概念

| 概念 | 定义 | 关联 |
|------|------|------|
| 原始类型 | string/number/boolean/null/undefined/symbol/bigint | primitives.ts |
| 对象类型 | 引用类型的结构与接口定义 | object-types.ts |
| 联合类型 | 多个可能类型的析取组合 | union-types.ts |

---

## 二、设计原理

### 2.1 为什么存在

类型系统是防止运行时错误的防线。JavaScript 的动态类型提供了灵活性，但也导致大量隐蔽 bug。TypeScript 在保持 JS 语义的同时引入静态类型，实现了灵活性与安全性的平衡。

### 2.2 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 显式注解 | 意图清晰、文档化 | 编写繁琐 | 公共接口 |
| 类型推断 | 代码简洁 | 复杂逻辑难追踪 | 内部实现 |

### 2.3 特性对比表：原始类型 vs 对象类型

| 特性 | 原始类型 (Primitive) | 对象类型 (Object) |
|------|---------------------|-------------------|
| 存储方式 | 栈内存，按值存储 | 堆内存，按引用存储 |
| 可变性 | 不可变 (immutable) | 可变 (mutable) |
| 比较行为 | 值比较 | 引用比较 |
| 种类 | string, number, boolean, null, undefined, symbol, bigint | Object, Array, Function, Date, RegExp 等 |
| 装箱机制 | 自动装箱为临时对象 | 无需装箱 |
| typeof 结果 | 对应类型字符串 | `"object"` / `"function"` |

### 2.4 与相关技术的对比

与 Flow 对比：TS 生态更成熟，类型系统表达力更强。

---

## 三、实践映射

### 3.1 从理论到代码

本模块的代码示例将上述理论概念映射为可运行的实现。通过实际编码练习，可以验证对 类型系统 核心机制的理解，并观察不同实现选择带来的行为差异。

### 3.2 代码示例：`typeof` 与 `instanceof` 的类型判别

```typescript
// typeof：判别原始类型
function checkPrimitive(value: unknown): string {
  if (typeof value === 'string') return `字符串，长度 ${value.length}`;
  if (typeof value === 'number' && !isNaN(value)) return `数字 ${value}`;
  if (typeof value === 'boolean') return `布尔 ${value}`;
  if (typeof value === 'bigint') return `BigInt ${value}`;
  if (typeof value === 'symbol') return `Symbol ${value.toString()}`;
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  return '非原始类型';
}

// instanceof：判别对象原型链
class Dog {
  bark() { return 'Woof!'; }
}
class Cat {
  meow() { return 'Meow!'; }
}

function checkAnimal(animal: unknown): string {
  if (animal instanceof Dog) return animal.bark();
  if (animal instanceof Cat) return animal.meow();
  return 'Unknown animal';
}

// 注意：typeof null === 'object' 是历史遗留 bug
console.log(typeof null);        // "object"
console.log(null instanceof Object); // false
```

### 3.3 常见误区

| 误区 | 正确理解 |
|------|---------|
| any 可以临时替代所有类型 | any 会传播并破坏整个类型链 |
| unknown 与 any 等价 | unknown 要求使用前先进行类型收窄 |

### 3.4 扩展阅读

- [TypeScript 类型手册](https://www.typescriptlang.org/docs/handbook/basic-types.html)
- [MDN：JavaScript 数据类型与数据结构](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures)
- [MDN：typeof](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof)
- [MDN：instanceof](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/instanceof)
- [ECMAScript® 2025 Language Specification — ECMAScript Data Types and Values](https://tc39.es/ecma262/#sec-ecmascript-data-types-and-values)
- `10-fundamentals/10.1-language-semantics/01-types/`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
