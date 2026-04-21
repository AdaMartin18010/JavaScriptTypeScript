# 内部方法与内部槽

> ECMAScript 对象的底层操作机制：[[Get]]、[[Set]]、[[Call]] 等
>
> 对齐版本：ECMA-262 §6.1.7, §10.1, §10.2

---

## 1. 内部方法概述

**内部方法（Internal Methods）** 使用双括号表示法 `[[Method]]`，定义了对象的基本行为。

所有对象共有的基本内部方法：

| 内部方法 | 说明 |
|---------|------|
| [[GetPrototypeOf]] | 获取原型 |
| [[SetPrototypeOf]] | 设置原型 |
| [[IsExtensible]] | 是否可扩展 |
| [[PreventExtensions]] | 阻止扩展 |
| [[GetOwnProperty]] | 获取自有属性描述符 |
| [[DefineOwnProperty]] | 定义自有属性 |
| [[HasProperty]] | 是否具有属性（含继承）|
| [[Get]] | 获取属性值 |
| [[Set]] | 设置属性值 |
| [[Delete]] | 删除属性 |
| [[OwnPropertyKeys]] | 获取自有属性键 |

---

## 2. 函数对象的内部方法

### 2.1 [[Call]]

普通函数调用：

```javascript
function greet() { return "Hello"; }
greet(); // 调用 [[Call]]
```

### 2.2 [[Construct]]

构造函数调用（new）：

```javascript
function Person(name) { this.name = name; }
new Person("Alice"); // 调用 [[Construct]]
```

**箭头函数没有 [[Construct]]**：

```javascript
const Arrow = () => {};
new Arrow(); // TypeError: Arrow is not a constructor
```

---

## 3. 内部槽（Internal Slots）

### 3.1 通用内部槽

| 内部槽 | 说明 |
|--------|------|
| [[Prototype]] | 原型对象 |
| [[Extensible]] | 是否可扩展 |

### 3.2 特定对象的内部槽

```javascript
// Array
const arr = [1, 2, 3];
// arr.[[ArrayLength]] = 3

// Promise
const p = Promise.resolve(1);
// p.[[PromiseState]] = "fulfilled"
// p.[[PromiseResult]] = 1

// Date
const d = new Date();
// d.[[DateValue]] = 时间戳
```

---

## 4. Proxy 与内部方法

Proxy 可以拦截内部方法的调用：

```javascript
const target = { x: 1 };
const proxy = new Proxy(target, {
  get(obj, prop) {
    console.log(`Getting ${String(prop)}`);
    return obj[prop];
  },
  set(obj, prop, value) {
    console.log(`Setting ${String(prop)} = ${value}`);
    obj[prop] = value;
    return true;
  }
});

proxy.x;      // 拦截 [[Get]]
proxy.x = 2;  // 拦截 [[Set]]
```

### 4.1 不可代理的内部槽

某些内部槽无法通过 Proxy 拦截：

```javascript
const date = new Date();
const proxy = new Proxy(date, {});
proxy.getDate(); // TypeError: this is not a Date object
// 因为 Date 的内部槽 [[DateValue]] 不会被 Proxy 复制
```

---

## 5. 与反射 API 的关系

Reflect 方法与内部方法一一对应：

| Reflect 方法 | 内部方法 |
|-------------|---------|
| Reflect.get | [[Get]] |
| Reflect.set | [[Set]] |
| Reflect.has | [[HasProperty]] |
| Reflect.deleteProperty | [[Delete]] |
| Reflect.getPrototypeOf | [[GetPrototypeOf]] |
| Reflect.setPrototypeOf | [[SetPrototypeOf]] |
| Reflect.defineProperty | [[DefineOwnProperty]] |
| Reflect.ownKeys | [[OwnPropertyKeys]] |

---

**参考规范**：ECMA-262 §6.1.7 The Object Type | ECMA-262 §10.1 Ordinary Object Internal Methods and Internal Slots
