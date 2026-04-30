# 内部方法与内部槽（Internal Methods & Slots）

> **形式化定义**：内部方法（Internal Methods）和内部槽（Internal Slots）是 ECMA-262 规范中用于定义对象行为的抽象机制。内部方法是对象必须或可选实现的方法（如 `[[Get]]`、`[[Set]]`），内部槽是对象内部存储的数据（如 `[[Prototype]]`、`[[Extensible]]`）。ECMA-262 §6.1.7.2 定义了必要内部方法，§6.1.7.3 定义了必要内部槽。Proxy 对象通过拦截内部方法实现代理行为。
>
> 对齐版本：ECMA-262 16th ed §6.1.7 | TypeScript 5.8–6.0

---

## 1. 概念定义 (Concept Definition)

### 1.1 形式化定义

ECMA-262 §6.1.7.2 定义：

> *"An ordinary object is an object that satisfies all of the following criteria... For all of the internal methods... the object uses those defined in 10.1."*

内部方法列表：

```
[[GetPrototypeOf]], [[SetPrototypeOf]], [[IsExtensible]],
[[PreventExtensions]], [[GetOwnProperty]], [[DefineOwnProperty]],
[[HasProperty]], [[Get]], [[Set]], [[Delete]], [[OwnPropertyKeys]]
```

---

## 2. 属性与特征 (Properties & Characteristics)

### 2.1 内部方法特征

| 特征 | 说明 |
|------|------|
| 双括号标记 | `[[MethodName]]` 表示内部方法 |
| 不可直接调用 | JavaScript 代码不能调用 |
| Proxy 可拦截 | Proxy 的 handler 可以拦截 |
| 普通对象默认实现 | Ordinary Object 使用规范默认实现 |

---

## 3. 关系分析 (Relationship Analysis)

### 3.1 Proxy 拦截的内部方法

```javascript
const handler = {
  get(target, prop) { /* 拦截 [[Get]] */ },
  set(target, prop, value) { /* 拦截 [[Set]] */ },
  // ... 其他陷阱
};

const proxy = new Proxy(target, handler);
```

### 3.2 Reflect API 与内部方法映射

```javascript
// Reflect 提供内部方法的默认实现，可用于转发调用
const target = { a: 1 };

// 以下两式等价（都触发 [[Get]]）
const v1 = target.a;
const v2 = Reflect.get(target, 'a');

// 以下两式等价（都触发 [[Set]]）
target.a = 2;
Reflect.set(target, 'a', 2);

// 以下两式等价（都触发 [[Delete]]）
delete target.a;
Reflect.deleteProperty(target, 'a');
```

---

## 4. 机制解释 (Mechanism Explanation)

### 4.1 [[Get]] 内部方法

```mermaid
flowchart TD
    A[[Get]](O, P, Receiver) --> B{O 有 P 自有属性?}
    B -->|是| C[返回属性值]
    B -->|否| D[沿原型链查找]
    D --> E{找到?}
    E -->|是| C
    E -->|否| F[返回 undefined]
```

### 4.2 内部方法触发时机详解

```javascript
// [[GetPrototypeOf]] → Object.getPrototypeOf / __proto__ / instanceof
const proto = Object.getPrototypeOf({}); // Object.prototype

// [[SetPrototypeOf]] → Object.setPrototypeOf / __proto__ = ...
const obj = {};
Object.setPrototypeOf(obj, null); // obj.[[Prototype]] = null

// [[IsExtensible]] → Object.isExtensible
console.log(Object.isExtensible({})); // true

// [[PreventExtensions]] → Object.preventExtensions / seal / freeze
const sealed = Object.seal({ a: 1 });
sealed.a = 2; // 静默失败（严格模式抛 TypeError）

// [[GetOwnProperty]] → Object.getOwnPropertyDescriptor
console.log(Object.getOwnPropertyDescriptor({ a: 1 }, 'a'));
// { value: 1, writable: true, enumerable: true, configurable: true }

// [[DefineOwnProperty]] → Object.defineProperty
const defined = {};
Object.defineProperty(defined, 'readOnly', {
  value: 42,
  writable: false,
  enumerable: true,
  configurable: false
});

// [[HasProperty]] → in 运算符 / Reflect.has
console.log('toString' in {}); // true（原型链查找）

// [[Get]] → 属性访问 / Reflect.get
// [[Set]] → 属性赋值 / Reflect.set
// [[Delete]] → delete 运算符 / Reflect.deleteProperty
// [[OwnPropertyKeys]] → Object.keys / Object.getOwnPropertyNames / Object.getOwnPropertySymbols / Reflect.ownKeys
```

---

## 5. 论证与分析 (Argumentation & Analysis)

### 5.1 内部方法 vs Proxy 陷阱

| 内部方法 | Proxy 陷阱 | 说明 |
|---------|-----------|------|
| `[[Get]]` | `get` | 读取属性 |
| `[[Set]]` | `set` | 设置属性 |
| `[[HasProperty]]` | `has` | in 运算符 |
| `[[Delete]]` | `deleteProperty` | delete 运算符 |
| `[[OwnPropertyKeys]]` | `ownKeys` | Object.keys |

---

## 6. 实例与示例 (Examples)

### 6.1 正例：Proxy 拦截

```javascript
const target = { a: 1 };
const proxy = new Proxy(target, {
  get(target, prop) {
    console.log(`Getting ${prop}`);
    return target[prop];
  }
});

proxy.a; // "Getting a" → 1
```

### 6.2 可撤销 Proxy（Revocable Proxy）

```javascript
const { proxy, revoke } = Proxy.revocable({ secret: 42 }, {
  get(target, prop) {
    if (prop === 'secret') throw new Error('Access denied');
    return target[prop];
  }
});

console.log(proxy.secret); // Error: Access denied
revoke(); // 撤销代理
console.log(proxy.secret); // TypeError: Cannot perform 'get' on a proxy that has been revoked
```

### 6.3 使用 Reflect 实现默认转发

```javascript
// 安全日志代理：记录所有属性访问但不改变行为
function createLoggedProxy(target, name) {
  return new Proxy(target, {
    get(t, p, receiver) {
      console.log(`[${name}] GET ${String(p)}`);
      return Reflect.get(t, p, receiver);
    },
    set(t, p, value, receiver) {
      console.log(`[${name}] SET ${String(p)} = ${value}`);
      return Reflect.set(t, p, value, receiver);
    },
    deleteProperty(t, p) {
      console.log(`[${name}] DELETE ${String(p)}`);
      return Reflect.deleteProperty(t, p);
    },
    ownKeys(t) {
      console.log(`[${name}] OWNKEYS`);
      return Reflect.ownKeys(t);
    }
  });
}

const logged = createLoggedProxy({ a: 1, b: 2 }, 'MyObj');
logged.a;        // [MyObj] GET a
logged.c = 3;    // [MyObj] SET c = 3
delete logged.b; // [MyObj] DELETE b
Object.keys(logged); // [MyObj] OWNKEYS → ['a', 'c']
```

---

## 7. 权威参考与国际化对齐 (References)

- **ECMA-262 §6.1.7** — Object Internal Methods and Internal Slots
- **ECMA-262 §10.1** — Ordinary Object Internal Methods
- **ECMA-262 §10.5** — Proxy Object Internal Methods and Internal Slots
- **MDN: Proxy** — <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy>
- **MDN: Reflect** — <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Reflect>
- **MDN: Object.defineProperty** — <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty>

---

## 8. 思维表征总结 (Cognitive Representations)

### 8.1 内部方法分类

```mermaid
mindmap
  root((内部方法))
    原型操作
      [[GetPrototypeOf]]
      [[SetPrototypeOf]]
    扩展性
      [[IsExtensible]]
      [[PreventExtensions]]
    属性操作
      [[GetOwnProperty]]
      [[DefineOwnProperty]]
      [[HasProperty]]
      [[Get]]
      [[Set]]
      [[Delete]]
      [[OwnPropertyKeys]]
```

---

## 9. 公理化表述与形式证明 (Axiomatization & Formal Proof)

### 9.1 公理化基础

**公理 1（内部方法的不可变性）**：
> 内部方法的实现由引擎决定，JavaScript 代码不能直接修改。

### 9.2 定理与证明

**定理 1（Proxy 的不透明性）**：
> Proxy 对象的行为可以完全自定义，不与目标对象行为一致。

*证明*：
> Proxy 的 handler 可以拦截所有内部方法，返回任意值。
> ∎

---

## 10. 推理链与演绎分析 (Deductive Reasoning Chain)

### 10.1 演绎推理

```mermaid
graph TD
    A[属性访问 obj.prop] --> B[调用 [[Get]]]
    B --> C{Proxy?}
    C -->|是| D[调用 handler.get]
    C -->|否| E[普通对象 [[Get]]]
    E --> F[返回属性值]
```

---

**参考规范**：ECMA-262 §6.1.7 | MDN: Proxy


---

## 补充：Exotic Objects 与内部方法变体

### 补充 1：Exotic Objects 概述

并非所有 JavaScript 对象都是"普通对象"（Ordinary Object）。ECMA-262 定义了多种**异质对象（Exotic Object）**，它们重写了部分内部方法：

| 对象类型 | 重写的内部方法 | 特殊行为 |
|---------|-------------|---------|
| **Array** | `[[DefineOwnProperty]]` | 自动维护 `length` 属性 |
| **String** | `[[GetOwnProperty]]` | 将索引访问映射到字符串字符 |
| **Function** | `[[Call]]`, `[[Construct]]` | 可调用、可作为构造函数 |
| **Arguments** | `[[GetOwnProperty]]` | 非严格模式下与形参联动 |
| **Module Namespace** | `[[Get]]`, `[[Set]]` | Live Binding 语义 |
| **Proxy** | **全部** | 自定义所有内部方法 |
| **Bound Function** | `[[Call]]`, `[[Construct]]` | 预设 this 和部分参数 |

### 补充 2：Array 的 `[[DefineOwnProperty]]` 特殊性

```javascript
const arr = []
arr[0] = 'a'
console.log(arr.length)  // 1 ✅ length 自动更新

arr.length = 0
console.log(arr[0])      // undefined ✅ 索引属性被删除
```

Array 的 `[[DefineOwnProperty]]` 在检测到索引属性设置时，会自动更新 `length`；反之，设置 `length` 时也会删除超出范围的索引属性。

### 补充 3：String 的 `[[GetOwnProperty]]` 特殊性

```javascript
const str = 'hello';

// String 对象将索引访问映射到字符
console.log(str[0]);        // "h"
console.log(str.length);    // 5

// 无法修改（因为属性描述符的 writable: false）
str[0] = 'H';
console.log(str[0]);        // 仍为 "h"

// 通过 Object.getOwnPropertyDescriptor 观察内部槽行为
console.log(Object.getOwnPropertyDescriptor(str, '0'));
// { value: 'h', writable: false, enumerable: true, configurable: false }
```

### 补充 4：Proxy 的不变量（Invariants）

即使 Proxy 可以拦截所有内部方法，ECMA-262 仍规定了**不可违反的不变量**：

| 不变量 | 说明 | 违反后果 |
|--------|------|---------|
| `[[GetPrototypeOf]]` 结果必须一致 | 对同一对象多次调用必须返回相同值（或沿着原型链） | TypeError |
| 不可扩展对象的 `[[SetPrototypeOf]]` | 如果目标不可扩展，`setPrototypeOf` 必须返回 false | TypeError |
| `[[IsExtensible]]` 不可伪造 | Proxy 的 `isExtensible` 必须与目标一致 | TypeError |
| `[[OwnPropertyKeys]]` 必须包含不可配置属性 | 返回的键列表不能遗漏目标的不可配置属性 | TypeError |
| `[[Get]]` 不可配置属性的值 | 如果属性不可配置且无 getter，返回值必须与目标一致 | TypeError |

```javascript
const target = { a: 1 }
Object.preventExtensions(target)

const proxy = new Proxy(target, {
  isExtensible() { return true }  // ❌ 违反不变量！
})

Object.isExtensible(proxy)  // TypeError: 'isExtensible' on proxy: trap result does not reflect extensibility of proxy target
```

### 补充 5：内部方法完整映射表

| 内部方法 | 普通对象行为 | Proxy 陷阱 | JS 语法触发 |
|---------|------------|-----------|-----------|
| `[[GetPrototypeOf]]` | 返回 `[[Prototype]]` | `getPrototypeOf` | `Object.getPrototypeOf` |
| `[[SetPrototypeOf]]` | 修改 `[[Prototype]]` | `setPrototypeOf` | `Object.setPrototypeOf` |
| `[[IsExtensible]]` | 返回 `[[Extensible]]` | `isExtensible` | `Object.isExtensible` |
| `[[PreventExtensions]]` | 设置 `[[Extensible]]=false` | `preventExtensions` | `Object.preventExtensions` |
| `[[GetOwnProperty]]` | 返回属性描述符 | `getOwnPropertyDescriptor` | `Object.getOwnPropertyDescriptor` |
| `[[DefineOwnProperty]]` | 创建/修改属性 | `defineProperty` | `Object.defineProperty` |
| `[[HasProperty]]` | 检查属性存在（含原型链） | `has` | `in` 运算符 |
| `[[Get]]` | 读取属性值 | `get` | `obj.prop` |
| `[[Set]]` | 设置属性值 | `set` | `obj.prop = val` |
| `[[Delete]]` | 删除属性 | `deleteProperty` | `delete obj.prop` |
| `[[OwnPropertyKeys]]` | 返回所有自有键 | `ownKeys` | `Object.keys/entries` |
| `[[Call]]` | 函数调用 | `apply` | `func()` |
| `[[Construct]]` | 构造函数 | `construct` | `new Func()` |

---

> 📅 补充更新：2026-04-27
