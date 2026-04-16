# ECMAScript 2015 - 2019 完整特性回顾

> **文档版本**: v1.0
> **最后更新**: 2026-04-08
> **范围**: ES2015(ES6) - ES2019

---

## 📑 目录

- [ECMAScript 2015 - 2019 完整特性回顾](#ecmascript-2015---2019-完整特性回顾)
  - [📑 目录](#-目录)
  - [一、ES2015 (ES6) - JavaScript 的革命](#一es2015-es6---javascript-的革命)
    - [1.1 新增特性列表](#11-新增特性列表)
    - [1.2 let 与 const](#12-let-与-const)
      - [形式化定义](#形式化定义)
      - [核心特性](#核心特性)
      - [代码示例](#代码示例)
    - [1.3 箭头函数 (Arrow Functions)](#13-箭头函数-arrow-functions)
      - [形式化定义](#形式化定义-1)
      - [与普通函数的区别](#与普通函数的区别)
      - [代码示例](#代码示例-1)
    - [1.4 Class 语法](#14-class-语法)
      - [形式化定义](#形式化定义-2)
      - [代码示例](#代码示例-2)
    - [1.5 Module 模块系统](#15-module-模块系统)
      - [形式化定义](#形式化定义-3)
      - [导出语法](#导出语法)
      - [导入语法](#导入语法)
      - [模块特性](#模块特性)
    - [1.6 Promise](#16-promise)
      - [形式化定义](#形式化定义-4)
      - [代码示例](#代码示例-3)
    - [1.7 解构赋值 (Destructuring)](#17-解构赋值-destructuring)
      - [形式化定义](#形式化定义-5)
      - [数组解构](#数组解构)
      - [对象解构](#对象解构)
    - [1.8 展开/剩余运算符 (Spread/Rest)](#18-展开剩余运算符-spreadrest)
      - [形式化定义](#形式化定义-6)
      - [展开运算符 (Spread)](#展开运算符-spread)
      - [剩余参数 (Rest)](#剩余参数-rest)
    - [1.9 其他重要特性](#19-其他重要特性)
      - [模板字符串 (Template Literals)](#模板字符串-template-literals)
      - [增强的对象字面量](#增强的对象字面量)
      - [默认参数](#默认参数)
      - [Map 和 Set](#map-和-set)
    - [1.10 兼容性信息](#110-兼容性信息)
    - [1.11 与后续版本的关联](#111-与后续版本的关联)
  - [二、ES2016 - 小步快跑的年度版本](#二es2016---小步快跑的年度版本)
    - [2.1 新增特性列表](#21-新增特性列表)
    - [2.2 指数运算符 (Exponentiation Operator)](#22-指数运算符-exponentiation-operator)
      - [形式化定义](#形式化定义-7)
      - [代码示例](#代码示例-4)
    - [2.3 Array.prototype.includes](#23-arrayprototypeincludes)
      - [形式化定义](#形式化定义-8)
      - [与 indexOf 的对比](#与-indexof-的对比)
      - [代码示例](#代码示例-5)
    - [2.4 兼容性信息](#24-兼容性信息)
    - [2.5 与后续版本的关联](#25-与后续版本的关联)
  - [三、ES2017 - 异步编程的里程碑](#三es2017---异步编程的里程碑)
    - [3.1 新增特性列表](#31-新增特性列表)
    - [3.2 async/await](#32-asyncawait)
      - [形式化定义](#形式化定义-9)
      - [async 函数特性](#async-函数特性)
      - [代码示例](#代码示例-6)
    - [3.3 Object.entries 和 Object.values](#33-objectentries-和-objectvalues)
      - [形式化定义](#形式化定义-10)
      - [代码示例](#代码示例-7)
    - [3.4 String.prototype.padStart / padEnd](#34-stringprototypepadstart--padend)
      - [形式化定义](#形式化定义-11)
      - [代码示例](#代码示例-8)
    - [3.5 Trailing Commas（尾随逗号）](#35-trailing-commas尾随逗号)
      - [语法扩展](#语法扩展)
      - [优势](#优势)
    - [3.6 兼容性信息](#36-兼容性信息)
    - [3.7 与后续版本的关联](#37-与后续版本的关联)
  - [四、ES2018 - 异步迭代与对象展开](#四es2018---异步迭代与对象展开)
    - [4.1 新增特性列表](#41-新增特性列表)
    - [4.2 异步迭代 (Asynchronous Iteration)](#42-异步迭代-asynchronous-iteration)
      - [形式化定义](#形式化定义-12)
      - [代码示例](#代码示例-9)
    - [4.3 Rest/Spread Properties（对象展开）](#43-restspread-properties对象展开)
      - [形式化定义](#形式化定义-13)
      - [代码示例](#代码示例-10)
    - [4.4 Promise.finally](#44-promisefinally)
      - [形式化定义](#形式化定义-14)
      - [代码示例](#代码示例-11)
    - [4.5 正则表达式增强](#45-正则表达式增强)
      - [4.5.1 命名捕获组 (Named Capturing Groups)](#451-命名捕获组-named-capturing-groups)
      - [4.5.2 后行断言 (Lookbehind Assertions)](#452-后行断言-lookbehind-assertions)
      - [4.5.3 Unicode 属性转义](#453-unicode-属性转义)
      - [4.5.4 s/dotAll 标志](#454-sdotall-标志)
    - [4.6 兼容性信息](#46-兼容性信息)
    - [4.7 与后续版本的关联](#47-与后续版本的关联)
  - [五、ES2019 - 数组与字符串增强](#五es2019---数组与字符串增强)
    - [5.1 新增特性列表](#51-新增特性列表)
    - [5.2 Array.prototype.flat](#52-arrayprototypeflat)
      - [形式化定义](#形式化定义-15)
      - [代码示例](#代码示例-12)
    - [5.3 Array.prototype.flatMap](#53-arrayprototypeflatmap)
      - [形式化定义](#形式化定义-16)
      - [代码示例](#代码示例-13)
    - [5.4 Object.fromEntries](#54-objectfromentries)
      - [形式化定义](#形式化定义-17)
      - [代码示例](#代码示例-14)
    - [5.5 String.prototype.trimStart / trimEnd](#55-stringprototypetrimstart--trimend)
      - [形式化定义](#形式化定义-18)
      - [代码示例](#代码示例-15)
    - [5.6 可选 catch 绑定](#56-可选-catch-绑定)
      - [形式化定义](#形式化定义-19)
      - [代码示例](#代码示例-16)
    - [5.7 Symbol.prototype.description](#57-symbolprototypedescription)
      - [代码示例](#代码示例-17)
    - [5.8 稳定排序 (Stable Sort)](#58-稳定排序-stable-sort)
    - [5.9 兼容性信息](#59-兼容性信息)
    - [5.10 与后续版本的关联](#510-与后续版本的关联)
  - [六、版本演进时间线](#六版本演进时间线)
    - [6.1 特性演进图谱](#61-特性演进图谱)
    - [6.2 现代 JavaScript 基石](#62-现代-javascript-基石)
    - [6.3 浏览器支持现状 (2026)](#63-浏览器支持现状-2026)
  - [参考资源](#参考资源)

---

## 一、ES2015 (ES6) - JavaScript 的革命

**发布日期**: 2015年6月
**TC39 进程**: 第一个采用"Train Model"发布的大型版本

### 1.1 新增特性列表

| 特性类别 | 特性名称 | 重要性 |
|---------|---------|--------|
| 变量声明 | `let` / `const` | ⭐⭐⭐⭐⭐ |
| 函数 | 箭头函数 (Arrow Functions) | ⭐⭐⭐⭐⭐ |
| 面向对象 | Class 语法 | ⭐⭐⭐⭐⭐ |
| 模块化 | Module (import/export) | ⭐⭐⭐⭐⭐ |
| 异步 | Promise | ⭐⭐⭐⭐⭐ |
| 解构 | 数组/对象解构 | ⭐⭐⭐⭐⭐ |
| 运算符 | 展开运算符 (Spread) / 剩余参数 (Rest) | ⭐⭐⭐⭐⭐ |
| 字符串 | 模板字符串 (Template Literals) | ⭐⭐⭐⭐⭐ |
| 对象 | 属性简写、计算属性名 | ⭐⭐⭐⭐ |
| 函数 | 默认参数、剩余参数 | ⭐⭐⭐⭐ |
| 迭代器 | for...of 循环、Symbol.iterator | ⭐⭐⭐⭐ |
| 代理 | Proxy / Reflect | ⭐⭐⭐⭐ |
| 集合 | Map / Set / WeakMap / WeakSet | ⭐⭐⭐⭐ |
| 类型 | Symbol 类型 | ⭐⭐⭐ |
| 函数 | 尾调用优化 (TCO) | ⭐⭐⭐ |

### 1.2 let 与 const

#### 形式化定义

```
LetDeclaration:
  let BindingList;

ConstDeclaration:
  const BindingList;

BindingList:
  LexicalBinding
  BindingList, LexicalBinding

LexicalBinding:
  BindingIdentifier Initializer_opt
  BindingPattern Initializer
```

#### 核心特性

| 特性 | `var` | `let` | `const` |
|-----|-------|-------|---------|
| 作用域 | 函数作用域 | 块级作用域 | 块级作用域 |
| 变量提升 | 是（初始化为 undefined） | 是（TDZ 暂时性死区） | 是（TDZ 暂时性死区） |
| 重复声明 | 允许 | 不允许 | 不允许 |
| 重新赋值 | 允许 | 允许 | 不允许 |
| 必须初始化 | 否 | 否 | 是 |

#### 代码示例

```javascript
// ========== let: 块级作用域 ==========
function letExample() {
  let x = 10;

  if (true) {
    let x = 20;  // 块级作用域，不影响外部
    console.log(x);  // 20
  }

  console.log(x);  // 10
}

// ========== const: 常量声明 ==========
const PI = 3.14159;
// PI = 3.14;  // TypeError: Assignment to constant variable

// const 保证的是引用不变，对象内容可变
const config = { host: 'localhost', port: 3000 };
config.port = 8080;  // ✅ 允许
// config = {};  // ❌ 错误：重新赋值

// 冻结对象
const frozenConfig = Object.freeze({ host: 'localhost' });
// frozenConfig.host = 'remote';  // 严格模式下报错

// ========== TDZ (暂时性死区) ==========
function tdzExample() {
  // console.log(a);  // ReferenceError: Cannot access 'a' before initialization
  let a = 5;
  console.log(a);  // 5
}

// ========== 最佳实践 ==========
// 1. 默认使用 const
// 2. 需要重新赋值时使用 let
// 3. 绝不使用 var
function bestPractices() {
  const API_URL = 'https://api.example.com';
  let count = 0;

  for (let i = 0; i < 10; i++) {
    count += i;
  }
  // i 在此处不可访问

  return count;
}
```

### 1.3 箭头函数 (Arrow Functions)

#### 形式化定义

```
ArrowFunction:
  ArrowParameters => ConciseBody

ArrowParameters:
  BindingIdentifier
  CoverParenthesizedExpressionAndArrowParameterList

ConciseBody:
  [lookahead ≠ { ] AssignmentExpression
  { FunctionBody }
```

#### 与普通函数的区别

| 特性 | 普通函数 | 箭头函数 |
|-----|---------|---------|
| `this` 绑定 | 动态绑定（调用时确定） | 词法绑定（定义时确定） |
| `arguments` 对象 | 有 | 没有（使用 rest 参数替代） |
| `new` 操作符 | 可以作为构造函数 | 不能作为构造函数 |
| `prototype` 属性 | 有 | 没有 |
| 语法 | 较冗长 | 简洁 |

#### 代码示例

```javascript
// ========== 基本语法 ==========
// 单行表达式（隐式返回）
const add = (a, b) => a + b;

// 多行需要显式 return
const multiply = (a, b) => {
  const result = a * b;
  return result;
};

// 单参数可省略括号
const square = x => x * x;

// 无参数需要空括号
const getRandom = () => Math.random();

// 返回对象需要括号
const createUser = name => ({ name, createdAt: Date.now() });

// ========== this 的词法绑定 ==========
class Counter {
  constructor() {
    this.count = 0;

    // 箭头函数：this 继承自外部作用域
    this.increment = () => {
      this.count++;
    };
  }

  // 普通方法：this 取决于调用方式
  decrement() {
    this.count--;
  }
}

const counter = new Counter();
const increment = counter.increment;
increment();  // this 仍然指向 counter 实例 ✅

const decrement = counter.decrement;
// decrement();  // this 指向全局或 undefined ❌

// ========== 在回调中的使用 ==========
const team = {
  members: ['Alice', 'Bob', 'Charlie'],
  teamName: 'Engineering',

  // 使用箭头函数保持 this
  greetAll() {
    return this.members.map(member =>
      `${member} is on team ${this.teamName}`
    );
  },

  // 传统方式需要手动绑定
  greetAllOld() {
    const self = this;
    return this.members.map(function(member) {
      return `${member} is on team ${self.teamName}`;
    });
  }
};

// ========== 不适用于箭头函数的场景 ==========
const obj = {
  value: 42,

  // ❌ 不要用作对象方法（this 不绑定到 obj）
  getValueWrong: () => this.value,  // this 指向外层

  // ✅ 使用普通函数
  getValueRight() {
    return this.value;
  }
};

// ❌ 不能用作构造函数
// const Person = (name) => { this.name = name; };
// new Person('John');  // TypeError

// ❌ 没有 arguments 对象
const checkArgs = () => {
  // console.log(arguments);  // 引用外层 arguments 或报错
};
// ✅ 使用 rest 参数代替
const checkArgsRight = (...args) => {
  console.log(args);
};
```

### 1.4 Class 语法

#### 形式化定义

```
ClassDeclaration:
  class BindingIdentifier ClassTail
  class ClassTail

ClassTail:
  ClassHeritage_opt { ClassBody_opt }

ClassHeritage:
  extends LeftHandSideExpression

ClassBody:
  ClassElementList

ClassElementList:
  ClassElement
  ClassElementList ClassElement

ClassElement:
  MethodDefinition
  static MethodDefinition
  FieldDefinition
  static FieldDefinition
  ClassStaticBlock
  ;
```

#### 代码示例

```javascript
// ========== 基本类定义 ==========
class Animal {
  // 构造函数
  constructor(name) {
    this.name = name;
    this.createdAt = Date.now();
  }

  // 实例方法
  speak() {
    console.log(`${this.name} makes a sound.`);
  }

  // 静态方法
  static isAnimal(obj) {
    return obj instanceof Animal;
  }

  // 静态属性（ES2022 之前用 getter 模拟）
  static get category() {
    return 'Living Being';
  }
}

// ========== 继承 ==========
class Dog extends Animal {
  constructor(name, breed) {
    super(name);  // 必须在使用 this 之前调用
    this.breed = breed;
  }

  // 方法重写
  speak() {
    console.log(`${this.name} barks!`);
  }

  // 调用父类方法
  describe() {
    return `${super.speak()} It's a ${this.breed}.`;
  }

  // Getter/Setter
  get info() {
    return `${this.name} (${this.breed})`;
  }

  set info(value) {
    [this.name, this.breed] = value.split(' ');
  }
}

// ========== 类表达式 ==========
const Cat = class extends Animal {
  speak() {
    console.log('Meow!');
  }
};

// 命名类表达式
const Fish = class NamedFish {
  // NamedFish 只在类体内可见
  swim() {
    console.log(NamedFish.name);
  }
};

// ========== 私有成员（后续版本增强） ==========
class BankAccount {
  // ES2015 使用闭包模拟私有
  constructor(initialBalance) {
    let balance = initialBalance;  // 闭包私有

    this.getBalance = () => balance;
    this.deposit = (amount) => {
      if (amount > 0) balance += amount;
    };
  }
}

// ES2019+ 私有字段（类字段提案）
class ModernBankAccount {
  #balance = 0;  // 私有字段

  constructor(initialBalance) {
    this.#balance = initialBalance;
  }

  getBalance() {
    return this.#balance;
  }

  #validateAmount(amount) {  // 私有方法
    return amount > 0;
  }

  deposit(amount) {
    if (this.#validateAmount(amount)) {
      this.#balance += amount;
    }
  }
}

// ========== 类与原型链的关系 ==========
console.log(typeof Animal);  // 'function'
console.log(Dog.prototype.__proto__ === Animal.prototype);  // true
console.log(Dog.__proto__ === Animal);  // true (静态继承)
```

### 1.5 Module 模块系统

#### 形式化定义

```
Module:
  ModuleBody_opt

ModuleBody:
  ModuleItemList

ModuleItemList:
  ModuleItem
  ModuleItemList ModuleItem

ModuleItem:
  ImportDeclaration
  ExportDeclaration
  StatementListItem
```

#### 导出语法

```javascript
// ========== 命名导出 (named exports) ==========
// math.js

// 单独导出
export const PI = 3.14159;

export function add(a, b) {
  return a + b;
}

export class Calculator {
  multiply(a, b) {
    return a * b;
  }
}

// 批量导出
const subtract = (a, b) => a - b;
const divide = (a, b) => a / b;

export { subtract, divide };

// 重命名导出
export { subtract as minus };

// 默认导出
export default function main() {
  console.log('Main function');
}

// 或
const config = { env: 'production' };
export default config;

// 混合导出
export default class MainClass {
  run() {}
}
export { helper1, helper2 };
```

#### 导入语法

```javascript
// ========== 命名导入 ==========
import { add, subtract, PI } from './math.js';

// 重命名导入
import { add as sum, subtract as minus } from './math.js';

// 默认导入
import main from './math.js';
import config from './config.js';  // 可以自定义名称

// 混合导入
import MainClass, { helper1, helper2 } from './module.js';

// 命名空间导入
import * as math from './math.js';
console.log(math.PI);
console.log(math.add(2, 3));

// 仅执行模块（副作用）
import './polyfills.js';

// 动态导入 (ES2020)
const module = await import('./dynamic-module.js');
```

#### 模块特性

| 特性 | 说明 |
|-----|------|
| 严格模式 | 模块自动启用严格模式 |
| 作用域 | 模块有自己的作用域，变量不会污染全局 |
| 单例 | 模块只加载执行一次，多次导入返回同一实例 |
| 静态分析 | 导入导出在编译时确定，支持 tree-shaking |
| 循环依赖 | 支持，但需小心设计 |

### 1.6 Promise

#### 形式化定义

```
Promise 是一个代表异步操作最终完成或失败的对象。

状态机：
  Pending (等待) → Fulfilled (成功)
                 → Rejected (失败)

状态转换是单向且不可变的。
```

#### 代码示例

```javascript
// ========== 创建 Promise ==========
const promise = new Promise((resolve, reject) => {
  // 异步操作
  setTimeout(() => {
    const success = true;
    if (success) {
      resolve('Operation completed');
    } else {
      reject(new Error('Operation failed'));
    }
  }, 1000);
});

// ========== 基本使用 ==========
promise
  .then(result => {
    console.log('Success:', result);
    return result.toUpperCase();
  })
  .then(upperResult => {
    console.log('Transformed:', upperResult);
  })
  .catch(error => {
    console.error('Error:', error.message);
  })
  .finally(() => {
    console.log('Cleanup (always runs)');
  });

// ========== Promise 静态方法 ==========
// Promise.resolve - 创建已成功的 Promise
const resolved = Promise.resolve(42);

// Promise.reject - 创建已拒绝的 Promise
const rejected = Promise.reject(new Error('Oops'));

// Promise.all - 等待所有 Promise 完成
const promises = [
  fetch('/api/users'),
  fetch('/api/posts'),
  fetch('/api/comments')
];

Promise.all(promises)
  .then(([users, posts, comments]) => {
    // 所有请求都成功
  })
  .catch(error => {
    // 任一请求失败
  });

// Promise.race - 返回最快完成的 Promise
Promise.race([
  fetch('/api/data'),
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Timeout')), 5000)
  )
]);

// Promise.allSettled (ES2020) - 等待所有完成，无论成功失败
Promise.allSettled(promises)
  .then(results => {
    results.forEach(result => {
      if (result.status === 'fulfilled') {
        console.log('Success:', result.value);
      } else {
        console.log('Failed:', result.reason);
      }
    });
  });

// ========== 实际应用模式 ==========
// 串行执行
async function sequential(promises) {
  const results = [];
  for (const promise of promises) {
    results.push(await promise);
  }
  return results;
}

// 带限制的并发
async function limitedConcurrency(tasks, limit) {
  const results = [];
  const executing = [];

  for (const task of tasks) {
    const p = task().then(result => {
      executing.splice(executing.indexOf(p), 1);
      return result;
    });

    results.push(p);
    executing.push(p);

    if (executing.length >= limit) {
      await Promise.race(executing);
    }
  }

  return Promise.all(results);
}
```

### 1.7 解构赋值 (Destructuring)

#### 形式化定义

```
DestructuringAssignment:
  ArrayDestructuringPattern
  ObjectDestructuringPattern

ArrayDestructuringPattern:
  [ AssignmentElementList ]

ObjectDestructuringPattern:
  { AssignmentPropertyList }
```

#### 数组解构

```javascript
// ========== 基本解构 ==========
const [a, b] = [1, 2];
// a = 1, b = 2

// 跳过元素
const [, , c] = [1, 2, 3];
// c = 3

// 剩余元素
const [first, ...rest] = [1, 2, 3, 4];
// first = 1, rest = [2, 3, 4]

// 默认值
const [x = 10, y = 20] = [1];
// x = 1, y = 20

// 嵌套解构
const [m, [n, o]] = [1, [2, 3]];

// 交换变量
let p = 1, q = 2;
[p, q] = [q, p];

// 函数返回值解构
function getCoords() {
  return [10, 20];
}
const [x1, y1] = getCoords();
```

#### 对象解构

```javascript
// ========== 基本解构 ==========
const { name, age } = { name: 'Alice', age: 25 };

// 重命名
const { name: userName, age: userAge } = { name: 'Bob', age: 30 };

// 默认值
const { role = 'guest' } = { name: 'Charlie' };
// role = 'guest'

// 嵌套解构
const user = {
  profile: {
    name: 'Dave',
    address: { city: 'Beijing' }
  }
};

const { profile: { name: profileName, address: { city } } } = user;

// 剩余属性
const { id, ...userData } = { id: 1, name: 'Eve', age: 28 };
// id = 1, userData = { name: 'Eve', age: 28 }

// 函数参数解构
function createUser({ name, email, role = 'user' }) {
  return { name, email, role };
}

createUser({ name: 'Frank', email: 'frank@example.com' });

// 深层解构与重命名
function processConfig({
  server: { port: serverPort = 3000 },
  db: { host: dbHost = 'localhost' }
}) {
  return { serverPort, dbHost };
}
```

### 1.8 展开/剩余运算符 (Spread/Rest)

#### 形式化定义

```
SpreadElement:
  ... AssignmentExpression

RestElement:
  ... DestructuringPattern

RestParameter:
  ... BindingIdentifier
  ... BindingPattern
```

#### 展开运算符 (Spread)

```javascript
// ========== 数组展开 ==========
const arr1 = [1, 2, 3];
const arr2 = [...arr1, 4, 5];  // [1, 2, 3, 4, 5]

// 数组复制（浅拷贝）
const copy = [...arr1];

// 数组拼接
const combined = [...arr1, ...arr2];

// 将类数组/可迭代对象转为数组
const strChars = [...'hello'];  // ['h', 'e', 'l', 'l', 'o']
const setToArray = [...new Set([1, 2, 3])];

// 函数调用时展开
const numbers = [1, 2, 3];
Math.max(...numbers);  // 等同于 Math.max(1, 2, 3)

// ========== 对象展开 (ES2018) ==========
const obj1 = { a: 1, b: 2 };
const obj2 = { ...obj1, c: 3 };  // { a: 1, b: 2, c: 3 }

// 对象复制（浅拷贝）
const objCopy = { ...obj1 };

// 对象合并
const merged = { ...obj1, ...obj2 };

// 覆盖属性
const updated = { ...obj1, b: 20 };  // { a: 1, b: 20 }

// 条件展开
const withCondition = {
  ...obj1,
  ...(condition ? { extra: 'value' } : {})
};
```

#### 剩余参数 (Rest)

```javascript
// ========== 函数剩余参数 ==========
function sum(...numbers) {
  return numbers.reduce((a, b) => a + b, 0);
}

sum(1, 2, 3, 4);  // 10

// 与常规参数结合
function logUser(role, ...actions) {
  console.log(`Role: ${role}`);
  actions.forEach(action => console.log(`- ${action}`));
}

// 剩余参数 vs arguments
function oldStyle() {
  // arguments 是类数组对象
  console.log(arguments);
}

function newStyle(...args) {
  // args 是真正的数组
  console.log(args);
}

// ========== 解构中的剩余 ==========
const [head, ...tail] = [1, 2, 3, 4];  // head=1, tail=[2,3,4]

const { id, ...rest } = { id: 1, name: 'A', age: 20 };
// id=1, rest={name:'A', age:20}
```

### 1.9 其他重要特性

#### 模板字符串 (Template Literals)

```javascript
// 基本插值
const name = 'World';
const greeting = `Hello, ${name}!`;

// 多行字符串
const html = `
  <div>
    <h1>Title</h1>
    <p>Content</p>
  </div>
`;

// 标签模板字符串
function highlight(strings, ...values) {
  return strings.reduce((result, str, i) => {
    const value = values[i] ? `<b>${values[i]}</b>` : '';
    return result + str + value;
  }, '');
}

const price = 100;
const message = highlight`The price is $${price}`;
```

#### 增强的对象字面量

```javascript
const name = 'app';
const version = '1.0.0';

const app = {
  // 属性简写
  name,
  version,

  // 方法简写
  start() {
    console.log('Starting...');
  },

  // 计算属性名
  [`${name}_config`]: {},
  [Symbol.iterator]: function* () {
    yield 1;
    yield 2;
  }
};
```

#### 默认参数

```javascript
function greet(name = 'Guest', greeting = 'Hello') {
  return `${greeting}, ${name}!`;
}

// 默认参数可以是表达式
function fetchData(url, timeout = getDefaultTimeout()) {
  // ...
}

// 默认参数可以使用前面的参数
function createUser(name, email = `${name}@example.com`) {
  // ...
}
```

#### Map 和 Set

```javascript
// ========== Map ==========
const map = new Map();

// 设置值
map.set('key', 'value');
map.set(1, 'number key');
map.set({ id: 1 }, 'object key');

// 获取值
map.get('key');  // 'value'

// 检查存在
map.has('key');  // true

// 删除
map.delete('key');

// 遍历
map.forEach((value, key) => {
  console.log(key, value);
});

for (const [key, value] of map) {
  console.log(key, value);
}

// 从对象创建 Map
const userMap = new Map(Object.entries({ name: 'John', age: 30 }));

// ========== Set ==========
const set = new Set([1, 2, 2, 3, 3, 3]);  // {1, 2, 3}

// 添加/删除
set.add(4);
set.delete(2);

// 检查存在
set.has(3);  // true

// 去重数组
const unique = [...new Set([1, 1, 2, 2, 3])];
```

### 1.10 兼容性信息

| 环境 | 支持程度 |
|-----|---------|
| Chrome | 45+ (2015年9月) |
| Firefox | 22+ (部分) / 45+ (完整) |
| Safari | 10+ (2016年9月) |
| Edge | 12+ (2015年7月) |
| Node.js | 4.0+ (部分) / 6.0+ (大部分) |

**Babel 转换**: ES2015 是 Babel 最核心的转换目标，几乎所有特性都有对应的转换插件。

### 1.11 与后续版本的关联

| ES2015 特性 | 后续演进 |
|------------|---------|
| Class | ES2022 添加私有字段、静态块 |
| Module | ES2020 添加动态 import |
| Promise | ES2018 添加 finally，ES2020 添加 allSettled |
| 函数 | ES2016 添加尾调用优化保证（未实现），ES2024 添加顶层 await 函数 |
| 解构 | ES2018 扩展为 Rest/Spread Properties |

---

## 二、ES2016 - 小步快跑的年度版本

**发布日期**: 2016年6月
**版本理念**: TC39 转为每年发布新版本，每个版本包含当年完成的特性

### 2.1 新增特性列表

| 特性 | 语法 | 重要性 |
|-----|------|--------|
| 指数运算符 | `**` | ⭐⭐⭐ |
| Array.prototype.includes | `arr.includes(value)` | ⭐⭐⭐⭐ |

### 2.2 指数运算符 (Exponentiation Operator)

#### 形式化定义

```
ExponentiationExpression:
  UnaryExpression
  UnaryExpression ** ExponentiationExpression

// 右结合：2 ** 3 ** 2 === 2 ** (3 ** 2) === 512
```

#### 代码示例

```javascript
// ========== 基本用法 ==========
2 ** 3;           // 8
Math.pow(2, 3);   // 8 (等价写法)

// 右结合性
2 ** 3 ** 2;      // 512 (2 ** (3 ** 2))
(2 ** 3) ** 2;    // 64

// 与一元运算符结合
-2 ** 2;          // SyntaxError: 必须用括号
(-2) ** 2;        // 4
-(2 ** 2);        // -4

// 赋值简写
let x = 2;
x **= 3;          // x = 8 (等价于 x = x ** 3)

// 实际应用
// 计算平方
const square = n => n ** 2;

// 计算立方
const cube = n => n ** 3;

// 科学计算
const distance3D = (x, y, z) => (x ** 2 + y ** 2 + z ** 2) ** 0.5;

// 大数计算（BigInt，ES2020）
const bigNum = 2n ** 64n;
```

### 2.3 Array.prototype.includes

#### 形式化定义

```
Array.prototype.includes(searchElement, fromIndex?)

参数:
  - searchElement: 要查找的元素
  - fromIndex: 开始查找的位置（可选，默认 0）

返回: boolean
```

#### 与 indexOf 的对比

| 特性 | `includes` | `indexOf` |
|-----|------------|-----------|
| 返回值 | boolean | number (索引或 -1) |
| NaN 检测 | ✅ 可以检测 | ❌ 无法检测 (NaN !== NaN) |
| -0 vs +0 | 视为相等 | 视为相等 |
| 可读性 | `arr.includes(x)` | `arr.indexOf(x) !== -1` |

#### 代码示例

```javascript
const arr = [1, 2, 3, NaN, -0];

// ========== 基本用法 ==========
arr.includes(2);        // true
arr.includes(5);        // false

// ========== NaN 检测（关键改进）==========
arr.includes(NaN);      // true ✅
arr.indexOf(NaN);       // -1 ❌

// ========== fromIndex 参数 ==========
arr.includes(1, 1);     // false (从索引1开始查找)
arr.includes(2, 1);     // true

// 负数索引（从末尾开始）
arr.includes(3, -2);    // true (从 arr.length - 2 开始)

// ========== -0 处理 ==========
arr.includes(+0);       // true (-0 和 +0 视为相等)

// ========== 与查找函数对比 ==========
// includes 使用 SameValueZero 算法
// 适合简单值类型的存在性检查

const users = [{ id: 1 }, { id: 2 }];
users.includes({ id: 1 });  // false (不同对象引用)

// 对象数组应使用 some
users.some(u => u.id === 1);  // true

// ========== 类型化数组支持 ==========
const typedArray = new Int8Array([1, 2, 3]);
typedArray.includes(2);  // true
```

### 2.4 兼容性信息

| 环境 | 支持程度 |
|-----|---------|
| Chrome | 52+ (2016年7月) |
| Firefox | 47+ (指数) / 43+ (includes) |
| Safari | 10.1+ |
| Edge | 14+ |
| Node.js | 7.0+ |

### 2.5 与后续版本的关联

- `includes` 方法的查找算法（SameValueZero）在后续版本中被复用
- 指数运算符的右结合特性影响了运算符优先级设计
- 年度发布模式的确立，后续版本都遵循此节奏

---

## 三、ES2017 - 异步编程的里程碑

**发布日期**: 2017年6月
**核心主题**: 异步编程、对象操作、字符串填充

### 3.1 新增特性列表

| 特性 | 语法 | 重要性 |
|-----|------|--------|
| async/await | `async function` / `await` | ⭐⭐⭐⭐⭐ |
| Object.entries | `Object.entries(obj)` | ⭐⭐⭐⭐⭐ |
| Object.values | `Object.values(obj)` | ⭐⭐⭐⭐⭐ |
| Object.getOwnPropertyDescriptors | `Object.getOwnPropertyDescriptors(obj)` | ⭐⭐⭐ |
| String.prototype.padStart | `str.padStart(targetLength, padString)` | ⭐⭐⭐⭐ |
| String.prototype.padEnd | `str.padEnd(targetLength, padString)` | ⭐⭐⭐⭐ |
| Trailing Commas | `function(a, b, )` | ⭐⭐⭐ |
| SharedArrayBuffer | 共享内存 | ⭐⭐ |
| Atomics | 原子操作 | ⭐⭐ |

### 3.2 async/await

#### 形式化定义

```
AsyncFunctionDeclaration:
  async function BindingIdentifier ( FormalParameters ) { AsyncFunctionBody }
  async function ( FormalParameters ) { AsyncFunctionBody }

AsyncArrowFunction:
  async AsyncArrowBindingIdentifier => AsyncConciseBody
  CoverCallExpressionAndAsyncArrowHead => AsyncConciseBody

AwaitExpression:
  await UnaryExpression
```

#### async 函数特性

| 特性 | 说明 |
|-----|------|
| 返回值 | 始终返回 Promise |
| 内部异常 | 会被 Promise 捕获并 reject |
| await | 只能在 async 函数内部使用 |
| 执行 | 遇到 await 会暂停，让出线程 |
| 并行 | 多个独立 await 应使用 Promise.all |

#### 代码示例

```javascript
// ========== 基本用法 ==========
async function fetchUserData(userId) {
  const response = await fetch(`/api/users/${userId}`);
  const user = await response.json();
  return user;
}

// 箭头函数形式
const fetchPosts = async () => {
  const response = await fetch('/api/posts');
  return response.json();
};

// ========== 错误处理 ==========
async function fetchWithErrorHandling() {
  try {
    const response = await fetch('/api/data');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Fetch failed:', error);
    throw error;  // 重新抛出或返回默认值
  }
}

// 并行错误处理
async function fetchMultiple() {
  const [users, posts] = await Promise.all([
    fetch('/api/users').catch(e => []),
    fetch('/api/posts').catch(e => [])
  ]);
  return { users, posts };
}

// ========== 串行 vs 并行 ==========
// ❌ 串行（慢）
async function sequentialSlow() {
  const user = await fetchUser(1);      // 等待 100ms
  const posts = await fetchPosts(1);    // 等待 100ms
  const comments = await fetchComments(1); // 等待 100ms
  return { user, posts, comments };     // 总共 300ms
}

// ✅ 并行（快）
async function parallelFast() {
  const [user, posts, comments] = await Promise.all([
    fetchUser(1),
    fetchPosts(1),
    fetchComments(1)
  ]);
  return { user, posts, comments };     // 总共 100ms
}

// ========== 循环中的 await ==========
// ❌ 串行循环
async function processSerial(items) {
  const results = [];
  for (const item of items) {
    results.push(await processItem(item));  // 每次等待
  }
  return results;
}

// ✅ 并行循环
async function processParallel(items) {
  const promises = items.map(item => processItem(item));
  return await Promise.all(promises);
}

// ✅ 带限制的并发
async function processLimited(items, limit = 5) {
  const results = [];
  for (let i = 0; i < items.length; i += limit) {
    const chunk = items.slice(i, i + limit);
    const chunkResults = await Promise.all(
      chunk.map(item => processItem(item))
    );
    results.push(...chunkResults);
  }
  return results;
}

// ========== 顶层 await (ES2022+) ==========
// ES2017 时只能在 async 函数中使用 await
// ES2022 支持模块顶层 await

// module.js (ES2022+)
const config = await fetch('/api/config').then(r => r.json());
export { config };

// ========== async 生成器 (ES2018) ==========
async function* asyncGenerator() {
  yield await Promise.resolve(1);
  yield await Promise.resolve(2);
}

// 使用 for await...of (ES2018)
async function consume() {
  for await (const num of asyncGenerator()) {
    console.log(num);
  }
}
```

### 3.3 Object.entries 和 Object.values

#### 形式化定义

```
Object.entries(obj)
  → 返回 [[key1, value1], [key2, value2], ...]

Object.values(obj)
  → 返回 [value1, value2, ...]

Object.getOwnPropertyDescriptors(obj)
  → 返回 { prop1: descriptor1, prop2: descriptor2, ... }
```

#### 代码示例

```javascript
const user = {
  name: 'Alice',
  age: 25,
  role: 'admin'
};

// ========== Object.entries ==========
Object.entries(user);
// [['name', 'Alice'], ['age', 25], ['role', 'admin']]

// 与 Map 的互转
const map = new Map(Object.entries(user));
const backToObj = Object.fromEntries(map);  // ES2019

// 遍历对象
for (const [key, value] of Object.entries(user)) {
  console.log(`${key}: ${value}`);
}

// 过滤对象属性
const filtered = Object.fromEntries(
  Object.entries(user).filter(([key]) => key !== 'role')
);

// ========== Object.values ==========
Object.values(user);
// ['Alice', 25, 'admin']

// 检查所有值
const allStrings = Object.values(user).every(v => typeof v === 'string');

// 求和
const scores = { math: 90, english: 85, science: 92 };
const average = Object.values(scores).reduce((a, b) => a + b, 0) / 3;

// ========== Object.getOwnPropertyDescriptors ==========
const descriptors = Object.getOwnPropertyDescriptors(user);
// {
//   name: { value: 'Alice', writable: true, enumerable: true, configurable: true },
//   age: { value: 25, writable: true, enumerable: true, configurable: true },
//   ...
// }

// 完整复制对象（包括不可枚举属性、getters/setters）
const shallowClone = Object.defineProperties(
  {},
  Object.getOwnPropertyDescriptors(user)
);

// 类混入模式
function mixin(target, source) {
  Object.defineProperties(
    target,
    Object.getOwnPropertyDescriptors(source)
  );
  return target;
}
```

### 3.4 String.prototype.padStart / padEnd

#### 形式化定义

```
String.prototype.padStart(targetLength, padString = ' ')
String.prototype.padEnd(targetLength, padString = ' ')

targetLength: 目标字符串长度
padString: 用于填充的字符串（默认为空格）
```

#### 代码示例

```javascript
// ========== padStart ==========
// 补零对齐
'5'.padStart(2, '0');        // '05'
'123'.padStart(5, '0');      // '00123'

// 格式化时间
const hours = '9'.padStart(2, '0');   // '09'
const minutes = '5'.padStart(2, '0'); // '05'
console.log(`${hours}:${minutes}`);   // '09:05'

// 信用卡号掩码
const card = '1234';
card.padStart(16, '*');      // '************1234'

// ========== padEnd ==========
// 固定宽度显示
'JavaScript'.padEnd(15, '.');  // 'JavaScript.....'
'Python'.padEnd(15, '.');      // 'Python.........'

// 表格对齐
const items = [
  { name: 'Apple', price: 1.5 },
  { name: 'Banana', price: 0.8 },
  { name: 'Cherry', price: 3.2 }
];

items.forEach(({ name, price }) => {
  console.log(`${name.padEnd(10)} $${price.toFixed(2)}`);
});
// Apple      $1.50
// Banana     $0.80
// Cherry     $3.20

// ========== 注意事项 ==========
// padString 过长会被截断
'abc'.padStart(10, '0123456789');  // '0123456abc'

// targetLength 小于原字符串长度，返回原字符串
'hello'.padStart(3);  // 'hello'
```

### 3.5 Trailing Commas（尾随逗号）

#### 语法扩展

```javascript
// ========== 函数参数 ==========
function example(
  param1,
  param2,  // 允许尾随逗号
) {
  // ...
}

// 函数调用
example(
  arg1,
  arg2,  // 允许
);

// ========== 解构 ==========
const [
  a,
  b,  // 允许
] = [1, 2];

const {
  x,
  y,  // 允许
} = { x: 1, y: 2 };

// ========== 之前的支持 ==========
// 数组字面量（ES5+）
const arr = [1, 2, 3,];

// 对象字面量（ES5+）
const obj = { a: 1, b: 2, };

// JSON 不支持尾随逗号！
// JSON.parse('[1, 2,]');  // SyntaxError
```

#### 优势

1. **版本控制友好**: 添加新参数时只显示一行变更
2. **代码生成简化**: 无需特殊处理最后一个元素
3. **可读性**: 明确提示列表可以继续扩展

### 3.6 兼容性信息

| 环境 | 支持程度 |
|-----|---------|
| Chrome | 55+ (async/await) / 57+ (全部) |
| Firefox | 52+ |
| Safari | 10.1+ (桌面) / 10.3+ (iOS) |
| Edge | 15+ |
| Node.js | 7.6+ (async/await) / 8.0+ (全部) |

### 3.7 与后续版本的关联

| ES2017 特性 | 后续演进 |
|------------|---------|
| async/await | ES2018 异步迭代器，ES2022 顶层 await |
| Object.entries | ES2019 Object.fromEntries 成为其逆操作 |
| padStart/padEnd | 文本处理基础，后续无重大变化 |

---

## 四、ES2018 - 异步迭代与对象展开

**发布日期**: 2018年6月
**核心主题**: 异步迭代、对象操作、正则增强

### 4.1 新增特性列表

| 特性 | 语法 | 重要性 |
|-----|------|--------|
| 异步迭代 | `for await...of` | ⭐⭐⭐⭐⭐ |
| 异步生成器 | `async function*` | ⭐⭐⭐⭐ |
| Rest/Spread Properties | `{ ...obj }` | ⭐⭐⭐⭐⭐ |
| Promise.finally | `promise.finally(callback)` | ⭐⭐⭐⭐⭐ |
| 正则表达式 - 命名捕获组 | `(?<name>...)` | ⭐⭐⭐⭐ |
| 正则表达式 - 后行断言 | `(?<=...)`, `(?<!...)` | ⭐⭐⭐⭐ |
| 正则表达式 - Unicode 属性转义 | `\p{...}` | ⭐⭐⭐ |
| 正则表达式 - s/dotAll 标志 | `/./s` | ⭐⭐⭐ |

### 4.2 异步迭代 (Asynchronous Iteration)

#### 形式化定义

```
AsyncIterator:
  具有 [Symbol.asyncIterator] 方法的对象

AsyncIteratorProtocol:
  next() → Promise<{ value, done }>

ForInOfStatement:
  for await ( LeftHandSideExpression of AssignmentExpression ) Statement
```

#### 代码示例

```javascript
// ========== 异步可迭代对象 ==========
const asyncIterable = {
  [Symbol.asyncIterator]() {
    let i = 0;
    return {
      async next() {
        if (i < 3) {
          await new Promise(resolve => setTimeout(resolve, 100));
          return { value: i++, done: false };
        }
        return { done: true };
      }
    };
  }
};

// 使用 for await...of
(async () => {
  for await (const num of asyncIterable) {
    console.log(num);  // 0, 1, 2（间隔 100ms）
  }
})();

// ========== 异步生成器 ==========
async function* asyncGenerator() {
  let i = 0;
  while (i < 3) {
    await new Promise(resolve => setTimeout(resolve, 100));
    yield i++;
  }
}

// 使用异步生成器
async function consume() {
  for await (const num of asyncGenerator()) {
    console.log(num);
  }
}

// ========== 实际应用：分页数据获取 ==========
async function* fetchPaginatedData(apiUrl) {
  let nextUrl = apiUrl;

  while (nextUrl) {
    const response = await fetch(nextUrl);
    const data = await response.json();

    yield* data.items;  // 委托给 items 数组

    nextUrl = data.nextPageUrl;
  }
}

// 消费所有分页数据
async function loadAllItems() {
  const items = [];
  for await (const item of fetchPaginatedData('/api/items')) {
    items.push(item);
    // 可以边加载边处理，无需等待全部加载完成
    renderItem(item);
  }
  return items;
}

// ========== 错误处理 ==========
async function* fetchWithRetry(urls) {
  for (const url of urls) {
    try {
      const response = await fetch(url);
      yield await response.json();
    } catch (error) {
      yield { error: error.message, url };
    }
  }
}

// 使用
for await (const result of fetchWithRetry(urls)) {
  if (result.error) {
    console.error('Failed:', result.url);
  } else {
    processData(result);
  }
}

// ========== 与 ReadableStream 结合 ==========
async function* streamToLines(stream) {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop();  // 保留不完整的行

      for (const line of lines) {
        yield line;
      }
    }

    if (buffer) yield buffer;
  } finally {
    reader.releaseLock();
  }
}
```

### 4.3 Rest/Spread Properties（对象展开）

#### 形式化定义

```
ObjectLiteral:
  { PropertyDefinitionList }

PropertyDefinition:
  ... AssignmentExpression  // SpreadElement

DestructuringPattern:
  { BindingPropertyList, BindingRestProperty }

BindingRestProperty:
  ... BindingIdentifier
```

#### 代码示例

```javascript
// ========== 对象展开（浅拷贝）==========
const original = { a: 1, b: 2, c: { deep: 'value' } };
const copy = { ...original };

// copy !== original (新对象)
// copy.c === original.c (浅拷贝，嵌套对象引用相同)

// ========== 对象合并 ==========
const defaults = { host: 'localhost', port: 3000 };
const config = { port: 8080, ssl: true };

const merged = { ...defaults, ...config };
// { host: 'localhost', port: 8080, ssl: true }
// 后面的属性覆盖前面的

// ========== 添加/覆盖属性 ==========
const base = { name: 'app', version: '1.0' };
const withUpdate = { ...base, version: '2.0', updated: true };

// ========== 条件展开 ==========
const condition = true;
const conditional = {
  ...base,
  ...(condition ? { extra: 'data' } : {})
};

// ========== Rest Properties（解构）==========
const user = {
  id: 1,
  name: 'Alice',
  email: 'alice@example.com',
  role: 'admin'
};

const { id, ...userInfo } = user;
// id = 1
// userInfo = { name: 'Alice', email: 'alice@example.com', role: 'admin' }

// 函数参数中使用
function logUser({ id, timestamp, ...rest }) {
  console.log('ID:', id);
  console.log('Data:', rest);
}

// 嵌套解构
const data = {
  user: { name: 'Bob', age: 30 },
  posts: [1, 2, 3],
  settings: { theme: 'dark' }
};

const { user: { name }, ...metadata } = data;
// name = 'Bob'
// metadata = { posts: [1, 2, 3], settings: { theme: 'dark' } }

// ========== 与数组展开对比 ==========
// 数组展开：保持顺序，可重复
const arr1 = [1, 2];
const arr2 = [3, 4];
[...arr1, ...arr2];  // [1, 2, 3, 4]

// 对象展开：后面的覆盖前面的
const obj1 = { x: 1, y: 2 };
const obj2 = { y: 3, z: 4 };
{ ...obj1, ...obj2 };  // { x: 1, y: 3, z: 4 }

// ========== 不可枚举属性 ==========
const withGetter = {
  a: 1,
  get b() { return 2; }
};

const spread = { ...withGetter };
// { a: 1, b: 2 }
// 会展开 getter 的值，不是 getter 本身
```

### 4.4 Promise.finally

#### 形式化定义

```
Promise.prototype.finally(onFinally)

参数:
  - onFinally: 无论 Promise 成功或失败都会执行的回调

返回: 新的 Promise
```

#### 代码示例

```javascript
// ========== 基本用法 ==========
fetch('/api/data')
  .then(response => response.json())
  .catch(error => console.error(error))
  .finally(() => {
    // 无论成功失败都会执行
    console.log('Request completed');
    hideLoadingSpinner();
  });

// ========== 与 try/catch/finally 对比 ==========
// 传统写法
async function traditional() {
  showLoading();
  try {
    const data = await fetchData();
    return process(data);
  } catch (error) {
    handleError(error);
  } finally {
    hideLoading();  // 总是执行
  }
}

// Promise.finally 写法
function promiseStyle() {
  showLoading();
  return fetchData()
    .then(process)
    .catch(handleError)
    .finally(hideLoading);
}

// ========== 使用场景 ==========
class DataLoader {
  constructor() {
    this.loading = false;
  }

  async load(url) {
    this.loading = true;

    try {
      const response = await fetch(url);
      return await response.json();
    } finally {
      this.loading = false;  // 总是重置状态
    }
  }
}

// ========== 返回值处理 ==========
Promise.resolve('success')
  .finally(() => 'ignored')  // finally 的返回值被忽略
  .then(value => console.log(value));  // 'success'

Promise.reject('error')
  .finally(() => 'ignored')
  .catch(reason => console.log(reason));  // 'error'

// 除非 finally 中抛出错误
Promise.resolve('success')
  .finally(() => { throw new Error('cleanup failed'); })
  .catch(e => console.log(e.message));  // 'cleanup failed'
```

### 4.5 正则表达式增强

#### 4.5.1 命名捕获组 (Named Capturing Groups)

```javascript
// ========== 传统编号捕获组 ==========
const dateRegex = /(\d{4})-(\d{2})-(\d{2})/;
const match = '2024-03-15'.match(dateRegex);
// match[1] = '2024', match[2] = '03', match[3] = '15'

// ========== 命名捕获组 ==========
const namedDateRegex = /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/;
const namedMatch = '2024-03-15'.match(namedDateRegex);

console.log(namedMatch.groups);
// { year: '2024', month: '03', day: '15' }

console.log(namedMatch.groups.year);   // '2024'

// ========== 解构使用 ==========
const { groups: { year, month, day } } = '2024-03-15'.match(namedDateRegex);

// ========== 替换中使用 ==========
'2024-03-15'.replace(namedDateRegex, '$<day>/$<month>/$<year>');
// '15/03/2024'

// ========== 反向引用 ==========
const repeatRegex = /(?<word>\w+)\s+\k<word>/;
'repeat repeat'.test(repeatRegex);  // true
```

#### 4.5.2 后行断言 (Lookbehind Assertions)

```javascript
// ========== 正向后行断言 ==========
// 匹配前面是 $ 的数字
const priceRegex = /(?<=\$)\d+/;
'$100'.match(priceRegex);  // ['100']
'€100'.match(priceRegex);  // null

// ========== 负向后行断言 ==========
// 匹配前面不是 $ 的数字
const nonPriceRegex = /(?<!\$)\d+/;
'€100'.match(nonPriceRegex);  // ['100']
'$100'.match(nonPriceRegex);  // null (或匹配后面的数字)

// ========== 实际应用 ==========
// 提取引号内的内容（不包括引号）
const quoted = /(?<=["']).*?(?=["'])/;
'"hello"'.match(quoted);  // ['hello']

// 替换特定格式的数字
'Price: $100, Discount: $20'.replace(/(?<=\$)\d+/g, '***');
// 'Price: $***, Discount: $***'
```

#### 4.5.3 Unicode 属性转义

```javascript
// ========== 需要 u 标志 ==========
// 匹配所有字母（任何语言）
const letters = /\p{Letter}/u;
letters.test('A');   // true
letters.test('中');  // true
letters.test('の');  // true

// ========== 常用属性 ==========
\p{Letter}     // 所有字母
\p{Lu}         // 大写字母
\p{Ll}         // 小写字母
\p{Number}     // 数字
\p{Punctuation} // 标点
\p{White_Space} // 空白字符
\p{Emoji}      // 表情符号

// ========== 实际应用 ==========
// 分割字符串（支持多语言）
const words = /\p{Letter}+/gu;
'Hello 世界!'.match(words);  // ['Hello', '世界']

// 验证多语言名称
const nameRegex = /^[\p{Letter}\s'-]+$/u;
nameRegex.test('José García-Márquez');  // true
nameRegex.test('中村 太郎');             // true
```

#### 4.5.4 s/dotAll 标志

```javascript
// ========== 传统 . 的问题 ==========
// . 不匹配换行符
'line1\nline2'.match(/line1.line2/);  // null

// ========== 使用 [\s\S] 或 [\d\D] 作为变通 ==========
'line1\nline2'.match(/line1[\s\S]line2/);  // 匹配

// ========== s 标志（dotAll）==========
'line1\nline2'.match(/line1.line2/s);  // 匹配 ✅

// 多行内容匹配
const multiline = `start
middle
end`;

multiline.match(/start.*end/s);   // 匹配全部
multiline.match(/start.*end/);    // null
```

### 4.6 兼容性信息

| 环境 | 支持程度 |
|-----|---------|
| Chrome | 63+ |
| Firefox | 57+ (大部分) / 78+ (全部) |
| Safari | 11.1+ |
| Edge | 79+ (Chromium) |
| Node.js | 8.10+ (部分) / 10.0+ (全部) |

### 4.7 与后续版本的关联

| ES2018 特性 | 后续演进 |
|------------|---------|
| 异步迭代 | ES2020 for-await-of 与 BigInt 结合使用 |
| Promise.finally | 成为 Promise 标准的一部分，无后续变化 |
| 正则表达式 | ES2022 添加 d 标志 (hasIndices)，ES2024 添加集合操作 |
| 对象展开 | ES2019 Object.fromEntries 形成完整的对象转换管道 |

---

## 五、ES2019 - 数组与字符串增强

**发布日期**: 2019年6月
**核心主题**: 数组扁平化、对象转换、字符串处理

### 5.1 新增特性列表

| 特性 | 语法 | 重要性 |
|-----|------|--------|
| Array.prototype.flat | `arr.flat(depth)` | ⭐⭐⭐⭐⭐ |
| Array.prototype.flatMap | `arr.flatMap(callback)` | ⭐⭐⭐⭐⭐ |
| Object.fromEntries | `Object.fromEntries(entries)` | ⭐⭐⭐⭐⭐ |
| String.prototype.trimStart | `str.trimStart()` | ⭐⭐⭐⭐ |
| String.prototype.trimEnd | `str.trimEnd()` | ⭐⭐⭐⭐ |
| 可选 catch 绑定 | `try { } catch { }` | ⭐⭐⭐ |
| Symbol.prototype.description | `sym.description` | ⭐⭐⭐ |
| JSON.stringify 改进 | 正确处理 U+D800-DFFF | ⭐⭐ |
| Array.prototype.sort 稳定 | 稳定排序保证 | ⭐⭐⭐⭐ |
| Function.prototype.toString | 保留原始源码 | ⭐⭐ |

### 5.2 Array.prototype.flat

#### 形式化定义

```
Array.prototype.flat(depth = 1)

参数:
  - depth: 展平的深度，默认为 1，Infinity 表示完全展平

返回: 新数组
```

#### 代码示例

```javascript
// ========== 基本用法 ==========
const nested = [1, [2, 3], [4, [5, 6]]];

nested.flat();      // [1, 2, 3, 4, [5, 6]] (深度 1)
nested.flat(1);     // 同上
nested.flat(2);     // [1, 2, 3, 4, 5, 6] (深度 2)
nested.flat(Infinity);  // 完全展平

// ========== 空槽处理 ==========
// flat 会跳过空槽
[1, , 3].flat();  // [1, 3]

// ========== 实际应用 ==========
// 展平嵌套数据
const data = [
  { items: [1, 2] },
  { items: [3, 4] },
  { items: [5, 6] }
];
const allItems = data.map(d => d.items).flat();
// [1, 2, 3, 4, 5, 6]

// 或直接使用 flatMap
data.flatMap(d => d.items);

// ========== 多维数组处理 ==========
const matrix = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9]
];

// 转置
matrix[0].map((_, i) => matrix.map(row => row[i]));
// [[1, 4, 7], [2, 5, 8], [3, 6, 9]]

// 展平
matrix.flat();  // [1, 2, 3, 4, 5, 6, 7, 8, 9]

// ========== 性能考虑 ==========
// 大数组展平使用指定深度优于 Infinity
const deep = [[[[[1]]]]];
deep.flat(5);     // ✅ 更快
deep.flat(Infinity);  // 稍慢
```

### 5.3 Array.prototype.flatMap

#### 形式化定义

```
Array.prototype.flatMap(callback, thisArg?)

callback: (element, index, array) => value | array

等价于: arr.map(callback).flat(1)
但更高效（只遍历一次）
```

#### 代码示例

```javascript
// ========== 基本用法 ==========
const sentences = ['Hello world', 'How are you'];

// 分割并展平
sentences.flatMap(s => s.split(' '));
// ['Hello', 'world', 'How', 'are', 'you']

// 等价于
sentences.map(s => s.split(' ')).flat();

// ========== 过滤 + 映射 ==========
const numbers = [1, 2, 3, 4];

// 只保留偶数并翻倍
numbers.flatMap(n => n % 2 === 0 ? [n * 2] : []);
// [4, 8]

// 对比 filter + map（两次遍历）
numbers.filter(n => n % 2 === 0).map(n => n * 2);

// ========== 增删元素 ==========
// 将每个元素展开为多个
const repeat = [1, 2, 3];
repeat.flatMap(n => [n, n, n]);
// [1, 1, 1, 2, 2, 2, 3, 3, 3]

// 条件删除
const items = [1, null, 2, undefined, 3];
items.flatMap(item => item != null ? [item] : []);
// [1, 2, 3]

// ========== 实际应用 ==========
// 处理异步请求结果
async function fetchAll(urls) {
  const responses = await Promise.all(urls.map(fetch));

  // 提取所有数据并展平
  return responses.flatMap(async r => {
    const data = await r.json();
    return Array.isArray(data) ? data : [data];
  });
}

// 构建菜单结构
const menuData = [
  { category: 'Drinks', items: ['Coffee', 'Tea'] },
  { category: 'Food', items: ['Pizza', 'Burger'] }
];

menuData.flatMap(section =>
  section.items.map(item => `${section.category}: ${item}`)
);
// ['Drinks: Coffee', 'Drinks: Tea', 'Food: Pizza', 'Food: Burger']
```

### 5.4 Object.fromEntries

#### 形式化定义

```
Object.fromEntries(iterable)

参数:
  - iterable: 包含 [key, value] 对的迭代对象

返回: 新对象

与 Object.entries 互为逆操作
```

#### 代码示例

```javascript
// ========== 基本用法 ==========
const entries = [['a', 1], ['b', 2], ['c', 3]];
const obj = Object.fromEntries(entries);
// { a: 1, b: 2, c: 3 }

// ========== 与 Object.entries 结合 ==========
// 对象 → 过滤 → 新对象（管道操作）
const user = { name: 'Alice', age: 25, role: 'admin' };

const filtered = Object.fromEntries(
  Object.entries(user).filter(([key]) => key !== 'role')
);
// { name: 'Alice', age: 25 }

// 转换所有值
const upperCased = Object.fromEntries(
  Object.entries(user).map(([k, v]) => [k, String(v).toUpperCase()])
);

// ========== 从 Map 创建对象 ==========
const map = new Map([['x', 1], ['y', 2]]);
const fromMap = Object.fromEntries(map);
// { x: 1, y: 2 }

// ========== 从查询字符串创建对象 ==========
const params = new URLSearchParams('a=1&b=2&c=3');
const queryObj = Object.fromEntries(params);
// { a: '1', b: '2', c: '3' }

// ========== 从 Headers 创建对象 ==========
const headers = new Headers({ 'Content-Type': 'application/json' });
const headerObj = Object.fromEntries(headers);

// ========== 数组转对象（带索引）==========
const fruits = ['apple', 'banana', 'cherry'];
const indexed = Object.fromEntries(
  fruits.map((fruit, index) => [index, fruit])
);
// { 0: 'apple', 1: 'banana', 2: 'cherry' }

// ========== 复杂转换管道 ==========
const data = [
  { id: 1, name: 'Item 1', active: true },
  { id: 2, name: 'Item 2', active: false },
  { id: 3, name: 'Item 3', active: true }
];

// 创建以 id 为键的查找表
const lookup = Object.fromEntries(
  data
    .filter(item => item.active)
    .map(item => [item.id, item.name])
);
// { 1: 'Item 1', 3: 'Item 3' }
```

### 5.5 String.prototype.trimStart / trimEnd

#### 形式化定义

```
String.prototype.trimStart() / trimLeft()  (别名)
String.prototype.trimEnd() / trimRight()    (别名)

返回: 去除前导/尾随空白的新字符串
```

#### 代码示例

```javascript
const str = '   hello world   ';

// ========== 基本用法 ==========
str.trimStart();  // 'hello world   '
str.trimEnd();    // '   hello world'
str.trim();       // 'hello world' (ES5)

// ========== 实际应用 ==========
// 格式化代码块
const code = `
  function example() {
    return 42;
  }
`;

// 去除公共缩进
const lines = code.split('\n');
const minIndent = lines
  .filter(l => l.trim())
  .reduce((min, l) => Math.min(min, l.match(/^\s*/)[0].length), Infinity);

const dedented = lines
  .map(l => l.slice(minIndent))
  .join('\n')
  .trimStart();

// ========== 解析格式化数据 ==========
const paddedId = '   00123';
const id = paddedId.trimStart();  // '00123'

// ========== 保留内部空白 ==========
const formatted = '  Line 1\n  Line 2  ';
formatted.trimEnd();
// '  Line 1\n  Line 2'
```

### 5.6 可选 catch 绑定

#### 形式化定义

```
Catch:
  catch ( CatchParameter ) Block
  catch Block  // ES2019: 可选参数
```

#### 代码示例

```javascript
// ========== 传统写法 ==========
try {
  riskyOperation();
} catch (error) {
  // 即使不使用 error，也必须声明
  console.log('Operation failed');
}

// ========== 可选 catch 绑定 ==========
try {
  riskyOperation();
} catch {
  // 不需要错误对象时
  console.log('Operation failed');
}

// ========== 使用场景 ==========
// 1. 仅需知道是否失败
function isValidJSON(str) {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

// 2. 有默认值的尝试
function readConfig() {
  try {
    return JSON.parse(fs.readFileSync('config.json'));
  } catch {
    return { default: true };
  }
}

// 3. 需要错误对象时仍需声明
try {
  riskyOperation();
} catch (error) {
  console.error('Details:', error.message);
  throw error;
}
```

### 5.7 Symbol.prototype.description

#### 代码示例

```javascript
// ========== 访问 Symbol 描述 ==========
const sym = Symbol('my description');

sym.description;        // 'my description'
sym.toString();         // 'Symbol(my description)'

// ========== 无描述 Symbol ==========
const emptySym = Symbol();
emptySym.description;   // undefined

// ========== 全局 Symbol ==========
const globalSym = Symbol.for('app.shared');
globalSym.description;  // 'app.shared'

// ========== 使用场景 ==========
// 调试输出
const actionTypes = {
  FETCH_USER: Symbol('FETCH_USER'),
  UPDATE_USER: Symbol('UPDATE_USER')
};

function logAction(action) {
  console.log(`Dispatching: ${action.description}`);
}
```

### 5.8 稳定排序 (Stable Sort)

```javascript
// ES2019 保证 Array.prototype.sort 是稳定排序
// 相等元素的相对顺序保持不变

const items = [
  { name: 'A', priority: 2 },
  { name: 'B', priority: 1 },
  { name: 'C', priority: 2 }
];

// 按 priority 排序，A 和 C 的相对顺序保持不变
items.sort((a, b) => a.priority - b.priority);
// [{ name: 'B', priority: 1 }, { name: 'A', priority: 2 }, { name: 'C', priority: 2 }]
```

### 5.9 兼容性信息

| 环境 | 支持程度 |
|-----|---------|
| Chrome | 73+ |
| Firefox | 66+ |
| Safari | 12.1+ (flat/flatMap) / 13+ (fromEntries) |
| Edge | 79+ (Chromium) |
| Node.js | 11.0+ (flat/flatMap) / 12.0+ (fromEntries) |

### 5.10 与后续版本的关联

| ES2019 特性 | 后续演进 |
|------------|---------|
| flat/flatMap | ES2023 添加 toSorted/toReversed/toSpliced（不改变原数组的版本） |
| Object.fromEntries | 与 Object.entries 形成标准对象转换管道 |
| trimStart/trimEnd | 后续无重大变化 |
| 可选 catch | 语法简化趋势的一部分 |

---

## 六、版本演进时间线

### 6.1 特性演进图谱

```
ES2015 (ES6)
├── let/const → 块级作用域标准化
├── Arrow Function → 词法 this
├── Class → 面向对象语法糖
├── Module → 静态模块系统
├── Promise → 异步基础
├── Destructuring → 数据提取
├── Spread/Rest → 集合操作
└── Template Literals → 字符串插值

ES2016
├── Exponentiation Operator (**) → Math.pow 语法糖
└── Array.prototype.includes → indexOf 替代

ES2017
├── async/await → Promise 语法糖，异步革命
├── Object.entries/values → 对象迭代
├── String padding → 格式化
└── Trailing commas → 开发者体验

ES2018
├── Async Iteration → 异步数据流
├── Object Spread/Rest → 对象操作完整
├── Promise.finally → 清理操作
└── RegExp enhancements → 文本处理强大

ES2019
├── flat/flatMap → 数组扁平化
├── Object.fromEntries → entries 逆操作
├── trimStart/End → 字符串处理
└── Optional catch → 语法简化
```

### 6.2 现代 JavaScript 基石

这五个版本奠定了现代 JavaScript 的基础：

| 领域 | 核心特性 |
|-----|---------|
| **变量声明** | let/const 取代 var |
| **函数** | 箭头函数、默认参数、剩余参数 |
| **异步** | Promise → async/await → 异步迭代 |
| **数据结构** | Map/Set、解构、展开 |
| **模块化** | ES Module 标准 |
| **面向对象** | Class 语法 |
| **字符串** | 模板字符串、pad、trim |
| **数组** | 迭代方法、flat、flatMap |
| **对象** | entries/values/fromEntries 管道 |
| **正则** | 命名捕获、断言、Unicode |

### 6.3 浏览器支持现状 (2026)

| 特性 | Chrome | Firefox | Safari | Edge | Node.js |
|-----|--------|---------|--------|------|---------|
| ES2015 全部 | 58+ | 54+ | 10+ | 79+ | 6+ |
| ES2016 | 52+ | 47+ | 10.1+ | 79+ | 7+ |
| ES2017 | 57+ | 52+ | 10.1+ | 79+ | 8+ |
| ES2018 | 63+ | 78+ | 11.1+ | 79+ | 10+ |
| ES2019 | 73+ | 66+ | 13+ | 79+ | 12+ |

**结论**: ES2015-ES2019 特性已得到全面支持，现代应用可以放心使用，无需转换（针对现代浏览器/Node.js）。

---

## 参考资源

- [ECMAScript 2015 Specification](https://262.ecma-international.org/6.0/)
- [ECMAScript 2016 Specification](https://262.ecma-international.org/7.0/)
- [ECMAScript 2017 Specification](https://262.ecma-international.org/8.0/)
- [ECMAScript 2018 Specification](https://262.ecma-international.org/9.0/)
- [ECMAScript 2019 Specification](https://262.ecma-international.org/10.0/)
- [MDN JavaScript 文档](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript)
- [Can I Use - JavaScript](https://caniuse.com/)
