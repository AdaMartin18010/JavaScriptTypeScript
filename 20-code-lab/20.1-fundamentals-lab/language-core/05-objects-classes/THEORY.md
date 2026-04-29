# 对象与类

> **定位**：`20-code-lab/20.1-fundamentals-lab/language-core/05-objects-classes`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块对比对象原型链与类语法，解决面向对象设计在 JS/TS 中的表达力与继承复杂度问题。探讨组合优于继承的实践策略。

### 1.2 形式化基础

[本模块的形式化定义与公理/定理陈述]

### 1.3 关键概念

| 概念 | 定义 | 关联 |
|------|------|------|
| 原型链 | 对象属性继承的查找机制 | prototype-chain.ts |
| 类字段 | ES2022 类实例属性的声明语法 | class-fields.ts |

---

## 二、设计原理

### 2.1 为什么存在

JavaScript 基于原型而非类，但 ES6 class 语法提供了更 familiar 的 OOP 体验。对象与类的机制是组织复杂数据和行为的基石。

### 2.2 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 类继承 | 代码复用直观 | 紧耦合、脆弱基类 | IS-A 关系明确 |
| 对象组合 | 灵活、低耦合 | 更多样板代码 | 行为组装 |

### 2.3 特性对比表：原型委托 vs ES6 Class

| 特性 | 原型委托 (Prototypal) | ES6 Class 语法糖 |
|------|----------------------|-----------------|
| 创建对象 | `Object.create(proto)` / 构造函数 | `class Foo extends Bar` |
| 继承机制 | 原型链动态委托 | 内部仍是原型链，语法更直观 |
| 构造函数 | 普通函数 + `new` | `constructor()` 方法 |
| 方法定义 | `Foo.prototype.method = fn` | 类体内直接声明 |
| 私有成员 | 闭包模拟 / WeakMap | 硬私有 `#field`（ES2022） |
| 静态成员 | `Foo.staticProp = val` | `static prop = val` |
| 可读性 | 分散、需要理解机制 | 集中、类 C++/Java 风格 |
| 运行时修改 | 可动态替换原型 | 类声明后不可重新绑定 |

### 2.4 与相关技术的对比

与经典 OOP 对比：JS 原型委托提供了更轻量的继承机制。

---

## 三、实践映射

### 3.1 从理论到代码

本模块的代码示例将上述理论概念映射为可运行的实现。通过实际编码练习，可以验证对 对象与类 核心机制的理解，并观察不同实现选择带来的行为差异。

### 3.2 代码示例：原型 vs Class 的等价实现

```typescript
// ===== 原型委托风格 =====
function AnimalProto(name: string) {
  this.name = name;
}
AnimalProto.prototype.speak = function (): string {
  return `${this.name} makes a sound.`;
};

function DogProto(name: string, breed: string) {
  AnimalProto.call(this, name);
  this.breed = breed;
}
DogProto.prototype = Object.create(AnimalProto.prototype);
DogProto.prototype.constructor = DogProto;
DogProto.prototype.speak = function (): string {
  return `${this.name} the ${this.breed} barks!`;
};

// ===== ES6 Class 风格（语法糖，底层等价） =====
class Animal {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
  speak(): string {
    return `${this.name} makes a sound.`;
  }
}

class Dog extends Animal {
  breed: string;
  constructor(name: string, breed: string) {
    super(name);
    this.breed = breed;
  }
  speak(): string {
    return `${this.name} the ${this.breed} barks!`;
  }
}

// ===== 硬私有字段（ES2022） =====
class BankAccount {
  #balance: number = 0; // 真正私有，外部不可访问

  deposit(amount: number): void {
    if (amount > 0) this.#balance += amount;
  }

  getBalance(): number {
    return this.#balance;
  }
}

const acc = new BankAccount();
acc.deposit(100);
console.log(acc.getBalance()); // 100
// console.log((acc as any).#balance); // SyntaxError: Private field must be declared
```

### 3.3 代码示例：组合优于继承

```typescript
// 组合模式 — 通过混入（Mixin）和接口实现灵活的行为组装

// 行为定义
interface Flyable {
  fly(): string;
}

interface Swimmable {
  swim(): string;
}

// 可复用的行为工厂
function FlyableMixin(base: new (...args: any[]) => {}) {
  return class extends base implements Flyable {
    fly() {
      return `${this.constructor.name} is flying!`;
    }
  };
}

function SwimmableMixin(base: new (...args: any[]) => {}) {
  return class extends base implements Swimmable {
    swim() {
      return `${this.constructor.name} is swimming!`;
    }
  };
}

// 基类
class Animal {
  constructor(public name: string) {}
  move() {
    return `${this.name} moves.`;
  }
}

// 通过组合构建具体类
class Duck extends SwimmableMixin(FlyableMixin(Animal)) {}
class Penguin extends SwimmableMixin(Animal) {} // 不能飞
class Eagle extends FlyableMixin(Animal) {}     // 不能游

const duck = new Duck("Daffy");
console.log(duck.fly());   // "Duck is flying!"
console.log(duck.swim());  // "Duck is swimming!"

const penguin = new Penguin("Skipper");
console.log(penguin.swim()); // "Penguin is swimming!"
// penguin.fly(); // 编译错误：Property 'fly' does not exist
```

### 3.4 代码示例：Symbol 与 Well-Known Symbols

```typescript
// Symbol 创建唯一键 — 避免命名冲突
const privateKey = Symbol("private");

class SafeBox {
  [privateKey] = "secret";

  getSecret(): string {
    return this[privateKey];
  }
}

// Well-Known Symbols — 定制对象行为
class Range {
  constructor(public start: number, public end: number) {}

  *[Symbol.iterator](): Generator<number> {
    for (let i = this.start; i <= this.end; i++) yield i;
  }

  [Symbol.toPrimitive](hint: string): number | string {
    if (hint === "number") return this.end - this.start;
    return `Range(${this.start}..${this.end})`;
  }
}

const range = new Range(1, 5);
console.log([...range]);        // [1, 2, 3, 4, 5]
console.log(+range);            // 4 (长度)
console.log(`${range}`);        // "Range(1..5)"
```

### 3.5 代码示例：Reflect API 与元编程

```typescript
// Reflect — 更规范的元编程接口
const target = { name: "Alice", age: 30 };

// Reflect.get / set 与直接访问等价但更规范
console.log(Reflect.get(target, "name"));        // "Alice"
Reflect.set(target, "age", 31);
console.log(target.age);                         // 31

// Reflect.defineProperty — 返回布尔值而非抛出
const success = Reflect.defineProperty(target, "id", {
  value: "uuid-123",
  writable: false,
});
console.log(success); // true

// Reflect.apply — 显式指定 this 调用函数
function greet(greeting: string) {
  return `${greeting}, ${this.name}!`;
}
console.log(Reflect.apply(greet, target, ["Hello"])); // "Hello, Alice!"

// Proxy + Reflect 组合 — 拦截并转发
const observed = new Proxy(target, {
  get(target, prop, receiver) {
    console.log(`Getting ${String(prop)}`);
    return Reflect.get(target, prop, receiver);
  },
  set(target, prop, value, receiver) {
    console.log(`Setting ${String(prop)} = ${value}`);
    return Reflect.set(target, prop, value, receiver);
  },
});

observed.name = "Bob"; // "Setting name = Bob"
console.log(observed.name); // "Getting name" → "Bob"
```

### 3.6 常见误区

| 误区 | 正确理解 |
|------|---------|
| class 引入了真正的类 | JS class 仍是原型继承的语法糖 |
| 私有字段 # 可通过反射访问 | 硬私有字段在语言层面不可从外部访问 |
| 箭头函数适合类方法 | 箭头函数无原型，无法被 super 调用 |

### 3.4 扩展阅读

- [MDN 类](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes)
- [MDN：继承与原型链](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Inheritance_and_the_prototype_chain)
- [MDN：类私有字段](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_class_fields)
- [MDN：Object.create()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create)
- [ECMAScript® 2025 — Ordinary and Exotic Objects Behaviours](https://tc39.es/ecma262/#sec-ordinary-and-exotic-objects-behaviours)
- [MDN — Symbol](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol)
- [MDN — Reflect](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Reflect)
- [MDN — Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
- [JavaScript Info — Class Inheritance](https://javascript.info/class-inheritance)
- [Composition over Inheritance — Medium](https://medium.com/hackernoon/object-oriented-the-great-debate-7fd5a9f0a33d)
- `10-fundamentals/10.1-language-semantics/05-objects-classes/`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
