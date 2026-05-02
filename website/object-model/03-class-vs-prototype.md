---
title: 03 - Class 语法糖 vs 原型
description: 解构 ES6 Class 的继承链、super 调用语义、new.target，以及 V8 对 Class 构造函数与普通函数的优化差异。
---

# 03 - Class 语法糖 vs 原型

## ES6 Class 的本质

`class` 在 JavaScript 中并非引入新的对象模型，而是 **原型继承的语法糖**：

```js
class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  move(dx, dy) {
    this.x += dx;
    this.y += dy;
  }
}

// 大致等价于
function Point(x, y) {
  this.x = x;
  this.y = y;
}
Point.prototype.move = function(dx, dy) {
  this.x += dx;
  this.y += dy;
};
```

但存在**关键语义差异**：

1. Class 只能通过 `new` 调用（内部 `[[Call]]` 会抛错）。
2. Class 方法不可枚举（`enumerable: false`）。
3. Class 构造函数内部没有 `prototype` 属性被重新绑定的问题。

---

## Class 继承链

```js
class Animal {
  constructor(name) { this.name = name; }
  speak() { console.log(`${this.name} says`); }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name); // 必须！
    this.breed = breed;
  }
  speak() {
    super.speak(); // 调用父类原型方法
    console.log('Woof!');
  }
}
```

### `extends` 的底层

`extends` 会做三件事：

1. 设置 `Dog.prototype.__proto__ = Animal.prototype`
2. 设置 `Dog.__proto__ = Animal`（静态继承）
3. 在 `Dog` 内部注入 `super` 绑定

```mermaid
graph TB
    subgraph 实例层
        D[d: Dog<br/>{ name, breed }]
    end
    subgraph 原型层
        DP[Dog.prototype<br/>{ speak, constructor }]
        AP[Animal.prototype<br/>{ speak, constructor }]
        OP[Object.prototype]
    end
    subgraph 构造函数层
        D_C[Dog 构造函数]
        A_C[Animal 构造函数]
        O_C[Object]
    end

    D -->|[[Prototype]]| DP
    DP -->|[[Prototype]]| AP
    AP -->|[[Prototype]]| OP

    D_C -->|[[Prototype]]| A_C
    A_C -->|[[Prototype]]| O_C

    DP -.->|constructor| D_C
    AP -.->|constructor| A_C
```

> **注意**：`super()` 在派生构造函数中必须在使用 `this` 之前调用，因为派生类的实例对象实际上是由基类构造函数分配的（`Reflect.construct` 语义）。

---

## `super` 关键字

`super` 有两种用法：

| 场景 | 语义 | V8 实现 |
|---|---|---|
| `super(args)` | 调用父类构造函数 | 通过 `[[HomeObject]]` 找到基类，执行 `Reflect.construct` |
| `super.method()` | 调用父类原型方法 | 通过 `[[HomeObject]].__proto__` 定位方法，绑定 `this` |

```js
class A {
  foo() { return 1; }
}
class B extends A {
  foo() {
    // V8 内部：B.prototype.__proto__.foo.call(this)
    return super.foo() + 1;
  }
}
```

`super` 的绑定是静态的（在类定义时通过 `[[HomeObject]]` 确定），因此 **无法脱离方法上下文** 使用：

```js
const b = new B();
const fn = b.foo;
fn(); // TypeError: 无法确定 super 绑定
```

---

## `new.target`

`new.target` 指向**被 `new` 调用的原始构造函数**，常用于抽象基类或构建工厂：

```js
class AbstractShape {
  constructor() {
    if (new.target === AbstractShape) {
      throw new TypeError('Cannot instantiate abstract class directly');
    }
  }
}

class Circle extends AbstractShape {
  constructor(r) {
    super();
    this.r = r;
  }
}

new AbstractShape(); // TypeError
new Circle(1); // OK
```

在 V8 中，`new.target` 作为调用帧的一个内部插槽存储，几乎零运行时开销。

---

## Class vs 原型函数对比表

| 特性 | Class | 传统构造函数 |
|---|---|---|
| 调用方式 | 必须 `new` | `new` 或普通调用 |
| 方法枚举性 | 不可枚举 | 默认可枚举 |
| 原型链设置 | `extends` 自动处理 | 手动 `Object.create` |
| 静态继承 | `extends` 继承静态方法 | 无原生支持 |
| 内部方法 `[[Call]]` | 抛 TypeError | 执行函数体 |
| V8 优化识别 | 更易被识别为构造函数，IC 更稳定 | 需通过调用模式推断 |

---

## V8 对 Class 的优化

由于 Class 的语义更严格，V8 可以进行更强的假设：

1. **构造函数识别**：Class 构造函数不会被当作普通函数调用，减少了 `[[Call]]` 与 `[[Construct]]` 的分歧。
2. **Shape 预置**：字段声明（Public Class Fields）使 V8 在实例创建前即可确定 Map，多个实例共享同一 HiddenClass。
3. **IC 稳定性**：`super` 绑定在定义时固定，原型链查找路径在类加载后通常不变。

```mermaid
graph LR
    subgraph Class Optimization
        C1[Class Circle<br/>fields: r]
        C2[instance c1]
        C3[instance c2]
        Map[Shared Map<br/>{ r }]
    end

    C2 --> Map
    C3 --> Map
    Map --> C1
```

---

## 性能对比：实例化开销

| 方式 | 单次实例化耗时 (ns) | Shape 稳定性 |
|---|---|---|
| 对象字面量 | ~8 | 高 |
| Class `new` | ~12 | 高（字段预声明） |
| 构造函数 `new` | ~10 | 中（动态添加） |
| `Object.create` + 赋值 | ~25 | 低（通常字典模式） |

```js
// 推荐：Class 字段预声明，确保 Monomorphic IC
class FastPoint {
  x = 0;
  y = 0;
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

// 不推荐：构造函数内动态添加属性可能导致 Transition 链过长
function SlowPoint(x, y) {
  this.x = x;
  this.y = y;
  if (x > 0) this.z = 0; // 条件属性 → 多个 Shape
}
```

---

## 小结

- Class 是原型继承的严格化语法糖，带来了更清晰的继承链与静态分析友好性。
- `super` 依赖 `[[HomeObject]]`，不可提取使用。
- `new.target` 是零开销的元信息，适合抽象类检查。
- V8 对 Class 的优化优于传统构造函数，尤其在字段预声明与继承链稳定性方面。
