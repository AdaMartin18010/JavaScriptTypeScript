# 内部方法与内部槽

> ECMAScript 对象的底层机制：[[Get]]、[[Set]]、[[Call]] 等
>
> 对齐版本：ECMAScript 2025 (ES16)

---

## 1. 内部方法（Internal Methods）

内部方法是 ECMA-262 规范中定义的算法，以函数形式表示，用于辅助规范的其他部分。所有对象必须实现以下内部方法：

| 内部方法 | 签名 | 用途 |
|---------|------|------|
| [[GetPrototypeOf]] | () → Object \| null | 获取原型 |
| [[SetPrototypeOf]] | (Object \| null) → Boolean | 设置原型 |
| [[IsExtensible]] | () → Boolean | 是否可扩展 |
| [[PreventExtensions]] | () → Boolean | 阻止扩展 |
| [[GetOwnProperty]] | (propertyKey) → Property Descriptor \| undefined | 获取自有属性 |
| [[DefineOwnProperty]] | (propertyKey, PropertyDescriptor) → Boolean | 定义属性 |
| [[HasProperty]] | (propertyKey) → Boolean | 检查属性 |
| [[Get]] | (propertyKey, Receiver) → any | 获取属性值 |
| [[Set]] | (propertyKey, value, Receiver) → Boolean | 设置属性值 |
| [[Delete]] | (propertyKey) → Boolean | 删除属性 |
| [[OwnPropertyKeys]] | () → List | 获取自有属性键 |

### 1.1 普通对象 vs 异质对象

**普通对象（Ordinary Object）**：使用默认的内部方法实现。

**异质对象（Exotic Object）**：覆盖一个或多个内部方法。

---

## 2. 内部槽（Internal Slots）

内部槽是对象的内部状态，不可从 JavaScript 访问：

### 2.1 常见内部槽

| 内部槽 | 用途 |
|--------|------|
| [[Prototype]] | 对象的原型 |
| [[Extensible]] | 是否可扩展 |
| [[PrivateElements]] | 私有字段 |

### 2.2 函数的额外内部槽

| 内部槽 | 用途 |
|--------|------|
| [[Environment]] | 函数创建时的词法环境（闭包） |
| [[FormalParameters]] | 形参列表 |
| [[ECMAScriptCode]] | 函数体代码 |
| [[ThisMode]] | lexical / strict / global |
| [[FunctionKind]] | normal / classConstructor / generator 等 |

### 2.3 Proxy 的额外内部槽

| 内部槽 | 用途 |
|--------|------|
| [[ProxyHandler]] | Proxy 的 handler 对象 |
| [[ProxyTarget]] | Proxy 的目标对象 |

---

## 3. Proxy 与内部方法

Proxy 可以拦截内部方法的调用：

```javascript
const target = {};
const proxy = new Proxy(target, {
  get(target, prop, receiver) {
    console.log(`Getting ${String(prop)}`);
    return Reflect.get(target, prop, receiver);
  },
  set(target, prop, value, receiver) {
    console.log(`Setting ${String(prop)} = ${value}`);
    return Reflect.set(target, prop, value, receiver);
  }
});

proxy.x = 1; // Setting x = 1
console.log(proxy.x); // Getting x → 1
```

---

## 4. 不可拦截的内部方法

以下内部方法不能被 Proxy 拦截：

- [[Call]] 和 [[Construct]] 的部分行为
- 某些规范级别的内部操作

---

## 5. 与 JavaScript 的关系

理解内部方法和槽有助于：

1. **理解对象行为**：`obj.prop` 调用 [[Get]]，`obj.prop = value` 调用 [[Set]]
2. **理解函数调用**：`fn()` 调用 [[Call]]，`new Fn()` 调用 [[Construct]]
3. **理解 Proxy 限制**：知道哪些操作可以被拦截

---

**参考规范**：ECMA-262 §6.1.7.2 Object Internal Methods and Internal Slots | ECMA-262 §10.5 Proxy Object Internal Methods and Internal Slots
