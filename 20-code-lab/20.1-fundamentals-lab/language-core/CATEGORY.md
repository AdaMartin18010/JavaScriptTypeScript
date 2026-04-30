---
category: language-core
dimension: 语言核心
created: 2026-04-27
---

# CATEGORY.md — 00-language-core

## 所属维度

**语言核心（Language Core）**

## 边界说明

本模块专注于 JavaScript/TypeScript 语言本身的基础语法与语义机制，包括：

- 数据类型与类型转换
- 变量声明与作用域
- 函数与闭包
- 对象与原型链
- 模块系统（ESM / 动态导入）
- 元编程（Proxy / Reflect）

**非本模块内容**：框架 API、运行时平台特性、工程工具链配置。

## 在语言核心体系中的位置

```
语言核心基础（本模块）
  ├── 01-ecmascript-evolution   → 语言特性演进史
  ├── jsts-language-core-system → 深度理论机制
  └── 03-concurrency            → 异步与并发
```

## 子模块索引

| 子模块 | 核心主题 | 关键概念 |
|--------|----------|----------|
| **syntax** | 语法基础 | 表达式、语句、运算符、控制流、严格模式 |
| **types** | 数据类型 | 原始类型、引用类型、类型转换、typeof、TypeScript 类型注解 |
| **scope** | 作用域机制 | 词法作用域、作用域链、块级作用域、变量提升、TDZ |
| **closures** | 闭包 | 词法闭包、私有变量、工厂函数、模块模式 |
| **prototypes** | 原型与继承 | 原型链、`__proto__`、`prototype`、class 语法糖、混入模式 |
| **modules** | 模块系统 | ESM、CommonJS、动态导入 `import()`、循环依赖、tree-shaking |

## 代码示例

### 作用域与暂时性死区（TDZ）

```typescript
// scope-tdz.ts — 理解 let/const 的暂时性死区
function demonstrateTDZ() {
  // console.log(a); // ❌ ReferenceError: Cannot access 'a' before initialization
  let a = 1;

  {
    // 块级作用域遮蔽
    let a = 2;
    console.log(a); // 2
  }
  console.log(a); // 1
}

// const 要求立即初始化且不可重新绑定
const CONFIG = { apiUrl: 'https://api.example.com' };
CONFIG.apiUrl = 'https://other.com'; // ✅ 允许修改对象属性
// CONFIG = {}; // ❌ TypeError: Assignment to constant variable
```

### 闭包与私有状态

```typescript
// closure-module.ts — 模块模式实现私有状态
function createCounter(initial = 0) {
  let count = initial; // 私有变量，闭包捕获

  return {
    increment() {
      return ++count;
    },
    decrement() {
      return --count;
    },
    get value() {
      return count;
    },
    reset() {
      count = initial;
    },
  };
}

const counter = createCounter(10);
counter.increment();
console.log(counter.value); // 11
// console.log(counter.count); // ❌ undefined — 真正私有
```

### 原型链与 Class 语法糖

```typescript
// prototypes.ts — 手动原型 vs class 语法
// === 底层原型机制 ===
function Animal(name: string) {
  this.name = name;
}
Animal.prototype.speak = function () {
  return `${this.name} makes a sound`;
};

function Dog(name: string, breed: string) {
  Animal.call(this, name); // 借用父类构造函数
  this.breed = breed;
}
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;
Dog.prototype.speak = function () {
  return `${this.name} barks`;
};

// === 等价的 class 语法（ES2015+）===
class AnimalClass {
  constructor(public name: string) {}
  speak() {
    return `${this.name} makes a sound`;
  }
}

class DogClass extends AnimalClass {
  constructor(name: string, public breed: string) {
    super(name);
  }
  override speak() {
    return `${this.name} barks`;
  }
}

// instanceof 检查的是原型链，而非构造函数
console.log(new Dog('Rex', 'Husky') instanceof Animal); // true
```

### 模块循环依赖处理

```typescript
// a.ts
import { b } from './b.js';
export const a = 'A';
console.log('in a.ts, b =', b); // b 可能为 undefined（若 b 尚未执行完）

// b.ts
import { a } from './a.js';
export const b = 'B';
console.log('in b.ts, a =', a); // 'A' — a 已执行完

// 最佳实践：将共享状态提取到独立模块，或使用函数惰性求值
```

### 动态导入与条件加载

```typescript
// dynamic-import.ts — 运行时按需加载
async function loadChartLibrary(type: 'line' | 'bar' | 'pie') {
  // 条件分支 + 动态导入，实现代码分割
  if (type === 'line') {
    const { LineChart } = await import('./charts/line.js');
    return new LineChart();
  }
  // 兜底：使用默认图表
  const module = await import('./charts/base.js');
  return new module.BaseChart();
}

// import.meta 获取模块元数据
console.log(import.meta.url); // 当前模块的绝对 URL
```

### Proxy 与 Reflect 元编程

```typescript
// proxy-validation.ts — 使用 Proxy 实现运行时校验
function createValidatedObject<T extends Record<string, any>>(
  schema: { [K in keyof T]: (v: any) => boolean }
): T {
  const store = {} as T;

  return new Proxy(store, {
    set(target, prop: string, value) {
      const validator = schema[prop];
      if (validator && !validator(value)) {
        throw new TypeError(`Invalid value for ${prop}: ${value}`);
      }
      target[prop as keyof T] = value;
      return true;
    },
    get(target, prop: string) {
      if (!(prop in target)) {
        console.warn(`Accessing undefined property: ${prop}`);
      }
      return target[prop as keyof T];
    },
    deleteProperty(target, prop: string) {
      if (prop in schema) {
        throw new Error(`Cannot delete required property: ${prop}`);
      }
      return Reflect.deleteProperty(target, prop);
    },
  });
}

const user = createValidatedObject({
  name: (v) => typeof v === 'string' && v.length > 0,
  age: (v) => Number.isInteger(v) && v >= 0 && v <= 150,
});

user.name = 'Alice'; // ✅
user.age = 30;       // ✅
// user.age = -5;    // ❌ TypeError: Invalid value for age: -5
```

### Generator 与 Iterator 协议

```typescript
// generators.ts — 惰性序列与自定义迭代器
function* fibonacci(limit: number) {
  let [a, b] = [0, 1];
  while (a <= limit) {
    yield a;
    [a, b] = [b, a + b];
  }
}

// 消费生成器
for (const n of fibonacci(100)) {
  console.log(n); // 0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89
}

// 自定义可迭代对象
class Range implements Iterable<number> {
  constructor(private start: number, private end: number, private step = 1) {}

  *[Symbol.iterator](): Iterator<number> {
    for (let i = this.start; i <= this.end; i += this.step) {
      yield i;
    }
  }

  // 反向迭代
  *[Symbol.asyncIterator](): AsyncIterator<number> {
    for (let i = this.end; i >= this.start; i -= this.step) {
      yield await Promise.resolve(i);
    }
  }
}

const range = new Range(1, 5);
console.log([...range]); // [1, 2, 3, 4, 5]
```

### Symbol 与 Well-Known Symbols

```typescript
// symbols.ts — 唯一键与元编程符号
const hiddenKey = Symbol('private');

const obj = {
  name: 'public',
  [hiddenKey]: 'secret data',
};

// Symbol 属性不可被常规枚举
console.log(Object.keys(obj)); // ['name']
console.log(Object.getOwnPropertySymbols(obj)); // [Symbol(private)]

// Well-Known Symbols — 改变对象内置行为
const collection = {
  items: ['a', 'b', 'c'],
  [Symbol.iterator]() {
    let i = 0;
    return {
      next: () => ({
        value: this.items[i++],
        done: i > this.items.length,
      }),
    };
  },
  [Symbol.toPrimitive](hint: string) {
    if (hint === 'number') return this.items.length;
    return this.items.join(', ');
  },
  get [Symbol.toStringTag]() {
    return 'CustomCollection';
  },
};

console.log([...collection]);      // ['a', 'b', 'c']
console.log(String(collection));   // "a, b, c"
console.log(Number(collection));   // 3
console.log(Object.prototype.toString.call(collection)); // [object CustomCollection]
```

## 权威参考链接

| 资源 | 类型 | 链接 |
|------|------|------|
| MDN JavaScript 指南 | 文档 | [developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide) |
| MDN JavaScript 参考 | 文档 | [developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference) |
| ECMA-262 规范 (第 15 版) | 规范 | [262.ecma-international.org/15.0](https://262.ecma-international.org/15.0/) |
| TypeScript 官方文档 | 文档 | [typescriptlang.org/docs](https://www.typescriptlang.org/docs/) |
| JavaScript Info (现代教程) | 教程 | [javascript.info](https://javascript.info/) |
| You Don't Know JS (2nd ed) | 书籍 | [github.com/getify/You-Dont-Know-JS](https://github.com/getify/You-Dont-Know-JS) — Kyle Simpson 经典开源书 |
| Deep JavaScript | 书籍 | [exploringjs.com/deep-js](https://exploringjs.com/deep-js/) — Dr. Axel Rauschmayer |
| JavaScript Weekly | 周刊 | [javascriptweekly.com](https://javascriptweekly.com) |
| V8 Blog — JavaScript internals | 博客 | [v8.dev/blog/tags/javascript](https://v8.dev/blog/tags/javascript) |
| Node.js Module System | 文档 | [nodejs.org/api/modules.html](https://nodejs.org/api/modules.html) & [esm.html](https://nodejs.org/api/esm.html) |
| TC39 Proposals (GitHub) | 规范提案 | [github.com/tc39/proposals](https://github.com/tc39/proposals) |
| 2ality — JavaScript 深度博客 | 博客 | [2ality.com](https://2ality.com/) — Dr. Axel Rauschmayer |
| MDN Proxy & Reflect | 文档 | [developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy) |
| MDN Generator Functions | 文档 | [developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Generator](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Generator) |
| MDN Symbol | 文档 | [developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Symbol](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Symbol) |
| ECMAScript Compatibility Table | 兼容性 | [compat-table.github.io/compat-table/](https://compat-table.github.io/compat-table/) |

## 关联索引

- [10-fundamentals/10.1-language-semantics/README.md](../../../10-fundamentals/10.1-language-semantics/README.md)
- [30-knowledge-base/30.2-categories/00-language-core.md](../../../30-knowledge-base/30.2-categories/00-language-core.md)
