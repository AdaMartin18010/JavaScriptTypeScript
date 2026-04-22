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

---

## 7. 权威参考与国际化对齐 (References)

- **ECMA-262 §6.1.7** — Object Internal Methods and Internal Slots
- **MDN: Proxy** — <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy>

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
