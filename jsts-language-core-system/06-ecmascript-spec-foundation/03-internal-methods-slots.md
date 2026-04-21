# 内部方法与内部槽

> ECMAScript 对象的底层操作与元对象协议
>
> 对齐版本：ECMAScript 2025 (ES16)

---

## 1. 内部方法（Internal Methods）

内部方法是规范定义的**对象基本操作**，所有对象都必须实现：

| 内部方法 | 触发场景 | 对应 Reflect API |
|---------|---------|-----------------|
| `[[GetPrototypeOf]]` | `Object.getPrototypeOf(obj)` | `Reflect.getPrototypeOf` |
| `[[SetPrototypeOf]]` | `Object.setPrototypeOf(obj, proto)` | `Reflect.setPrototypeOf` |
| `[[IsExtensible]]` | `Object.isExtensible(obj)` | `Reflect.isExtensible` |
| `[[PreventExtensions]]` | `Object.preventExtensions(obj)` | `Reflect.preventExtensions` |
| `[[GetOwnProperty]]` | `Object.getOwnPropertyDescriptor(obj, p)` | `Reflect.getOwnPropertyDescriptor` |
| `[[DefineOwnProperty]]` | `Object.defineProperty(obj, p, desc)` | `Reflect.defineProperty` |
| `[[HasProperty]]` | `"prop" in obj` | `Reflect.has` |
| `[[Get]]` | `obj.prop` | `Reflect.get` |
| `[[Set]]` | `obj.prop = value` | `Reflect.set` |
| `[[Delete]]` | `delete obj.prop` | `Reflect.deleteProperty` |
| `[[OwnPropertyKeys]]` | `Object.keys(obj)` / `Reflect.ownKeys(obj)` | `Reflect.ownKeys` |
| `[[Call]]` | `func()` | `Reflect.apply` |
| `[[Construct]]` | `new Constructor()` | `Reflect.construct` |

### 1.1 必需 vs 可选

- **必需**：`[[GetPrototypeOf]]`、`[[SetPrototypeOf]]`、`[[IsExtensible]]`、`[[PreventExtensions]]`、`[[GetOwnProperty]]`、`[[DefineOwnProperty]]`、`[[HasProperty]]`、`[[Get]]`、`[[Set]]`、`[[Delete]]`、`[[OwnPropertyKeys]]`
- **可选**：`[[Call]]`（仅函数对象）、`[[Construct]]`（仅构造函数）

---

## 2. 内部槽（Internal Slots）

内部槽是规范描述的**对象内部状态**，不可从 JavaScript 直接访问：

| 内部槽 | 所属对象 | 用途 |
|-------|---------|------|
| `[[Prototype]]` | 普通对象 | 原型链指针 |
| `[[Extensible]]` | 普通对象 | 是否可扩展 |
| `[[Realm]]` | 函数对象 | 创建时的 Realm |
| `[[Environment]]` | 函数对象 | 闭包捕获的词法环境 |
| `[[PrivateElements]]` | 普通对象 | 私有字段存储 |
| `[[DateValue]]` | Date 对象 | 时间戳 |
| `[[RegExpMatcher]]` | RegExp 对象 | 匹配算法 |
| `[[ArrayLength]]` | Array 对象 | 数组长度 |
| `[[TypedArrayName]]` | TypedArray | 类型名称 |
| `[[ViewedArrayBuffer]]` | TypedArray | 关联的 ArrayBuffer |

---

## 3. 内部方法的调用链

```javascript
// obj.prop = 1 的规范步骤：
// 1. 创建 Reference（base=obj, name="prop"）
// 2. PutValue(ref, 1)
// 3. 调用 obj.[[Set]]("prop", 1, obj)
// 4. 如果 obj 没有该属性，沿原型链查找 setter
// 5. 最终设置属性或抛出错误
```

### 3.1 属性查找流程

```
obj.prop
  → [[Get]]("prop", receiver)
    → 检查 obj.[[OwnProperty]]
      → 有？返回描述符的 [[Value]]
      → 无？检查 obj.[[Prototype]]
        → 原型为 null？返回 undefined
        → 否则递归调用原型的 [[Get]]
```

---

## 4. Proxy 与内部方法

```javascript
const proxy = new Proxy(target, {
  get(target, prop, receiver) {
    // 拦截 [[Get]]
    console.log(`Getting ${String(prop)}`);
    return Reflect.get(target, prop, receiver);
  },
  set(target, prop, value, receiver) {
    // 拦截 [[Set]]
    console.log(`Setting ${String(prop)} = ${value}`);
    return Reflect.set(target, prop, value, receiver);
  },
  has(target, prop) {
    // 拦截 [[HasProperty]]
    console.log(`Checking ${String(prop)}`);
    return Reflect.has(target, prop);
  }
});
```

### 4.1 Proxy 的 13 种拦截器

| 拦截器 | 内部方法 |
|-------|---------|
| `get` | `[[Get]]` |
| `set` | `[[Set]]` |
| `has` | `[[HasProperty]]` |
| `deleteProperty` | `[[Delete]]` |
| `getPrototypeOf` | `[[GetPrototypeOf]]` |
| `setPrototypeOf` | `[[SetPrototypeOf]]` |
| `isExtensible` | `[[IsExtensible]]` |
| `preventExtensions` | `[[PreventExtensions]]` |
| `getOwnPropertyDescriptor` | `[[GetOwnProperty]]` |
| `defineProperty` | `[[DefineOwnProperty]]` |
| `ownKeys` | `[[OwnPropertyKeys]]` |
| `apply` | `[[Call]]` |
| `construct` | `[[Construct]]` |

### 4.2 不变量（Invariants）

Proxy 必须维护以下不变量，否则抛出 `TypeError`：

```javascript
const proxy = new Proxy({}, {
  get(target, prop, receiver) {
    // ❌ 违反不变量：目标不可配置且不可写时，返回值必须相同
    if (prop === "locked") return "different";
    return Reflect.get(target, prop, receiver);
  }
});

Object.defineProperty(proxy, "locked", {
  value: "original",
  writable: false,
  configurable: false
});

proxy.locked; // TypeError: invariant violated
```

---

## 5. 普通对象与异质对象

### 5.1 普通对象（Ordinary Objects）

使用默认的内部方法实现：

```javascript
const obj = {}; // 普通对象
```

### 5.2 异质对象（Exotic Objects）

覆盖默认的内部方法实现：

| 类型 | 特殊行为 |
|------|---------|
| Array | `[[DefineOwnProperty]]` 特殊处理 `length` |
| String | `[[GetOwnProperty]]` 返回索引字符 |
| Arguments | `[[Get]]` / `[[Set]]` 映射到参数 |
| Integer-Indexed | TypedArray 的索引访问 |
| Module Namespace | `[[Get]]` 返回导出绑定 |
| Immutable Prototype | `[[SetPrototypeOf]]` 始终返回 false |
| Proxy | 所有内部方法可自定义 |

---

## 6. 内部槽访问示例

```javascript
// 虽然内部槽不可直接访问，但可通过 API 间接操作

// [[Prototype]]
const proto = Object.getPrototypeOf(obj);
Object.setPrototypeOf(obj, newProto);

// [[Extensible]]
Object.isExtensible(obj);
Object.preventExtensions(obj);
Object.seal(obj);      // preventExtensions + 配置所有属性不可配置
Object.freeze(obj);    // seal + 所有数据属性不可写

// [[PrivateElements]]（ES2022）
class Example {
  #privateField = 42; // 存储在 [[PrivateElements]] 中
  getPrivate() {
    return this.#privateField;
  }
}
```

---

**参考规范**：ECMA-262 §6.1.7.2 Object Internal Methods and Internal Slots | ECMA-262 §10.5 Proxy Object Internal Methods
