---
last-updated: 2026-04-27
review-cycle: 6 months
next-review: 2026-10-27
status: current
---
# JavaScript/TypeScript 反模式百科全书

> 📚 一份全面的 JS/TS 陷阱指南，帮助开发者避免常见错误，写出更健壮的代码。

---

## 目录

- [JavaScript/TypeScript 反模式百科全书](#javascripttypescript-反模式百科全书)
  - [目录](#目录)
  - [1. 类型强制转换陷阱](#1-类型强制转换陷阱)
    - [1.1 相等运算符 `==` 的隐式转换](#11-相等运算符--的隐式转换)
      - [❌ 错误代码](#-错误代码)
      - [✅ 正确代码](#-正确代码)
      - [💡 原理说明](#-原理说明)
      - [🛡️ 防御措施](#️-防御措施)
    - [1.2 加号 `+` 运算符的陷阱](#12-加号--运算符的陷阱)
      - [❌ 错误代码](#-错误代码-1)
      - [✅ 正确代码](#-正确代码-1)
      - [💡 原理说明](#-原理说明-1)
      - [🛡️ 防御措施](#️-防御措施-1)
    - [1.3 空数组 `[]` 和空对象 `{}` 的布尔转换](#13-空数组--和空对象--的布尔转换)
      - [❌ 错误代码](#-错误代码-2)
      - [✅ 正确代码](#-正确代码-2)
      - [💡 原理说明](#-原理说明-2)
      - [🛡️ 防御措施](#️-防御措施-2)
  - [2. this 绑定问题](#2-this-绑定问题)
    - [2.1 普通函数的动态 this](#21-普通函数的动态-this)
      - [❌ 错误代码](#-错误代码-3)
      - [✅ 正确代码](#-正确代码-3)
      - [💡 原理说明](#-原理说明-3)
      - [🛡️ 防御措施](#️-防御措施-3)
    - [2.2 箭头函数的 this 陷阱](#22-箭头函数的-this-陷阱)
      - [❌ 错误代码](#-错误代码-4)
      - [✅ 正确代码](#-正确代码-4)
      - [💡 原理说明](#-原理说明-4)
      - [🛡️ 防御措施](#️-防御措施-4)
  - [3. 闭包陷阱](#3-闭包陷阱)
    - [3.1 循环中的闭包](#31-循环中的闭包)
      - [❌ 错误代码](#-错误代码-5)
      - [✅ 正确代码](#-正确代码-5)
      - [💡 原理说明](#-原理说明-5)
      - [🛡️ 防御措施](#️-防御措施-5)
    - [3.2 内存泄漏的闭包](#32-内存泄漏的闭包)
      - [❌ 错误代码](#-错误代码-6)
      - [✅ 正确代码](#-正确代码-6)
      - [💡 原理说明](#-原理说明-6)
      - [🛡️ 防御措施](#️-防御措施-6)
  - [4. 原型链问题](#4-原型链问题)
    - [4.1 属性查找和原型污染](#41-属性查找和原型污染)
      - [❌ 错误代码](#-错误代码-7)
      - [✅ 正确代码](#-正确代码-7)
      - [💡 原理说明](#-原理说明-7)
      - [🛡️ 防御措施](#️-防御措施-7)
    - [4.2 构造函数和 instanceof 问题](#42-构造函数和-instanceof-问题)
      - [❌ 错误代码](#-错误代码-8)
      - [✅ 正确代码](#-正确代码-8)
      - [💡 原理说明](#-原理说明-8)
      - [🛡️ 防御措施](#️-防御措施-8)
  - [5. 异步陷阱](#5-异步陷阱)
    - [5.1 回调地狱](#51-回调地狱)
      - [❌ 错误代码](#-错误代码-9)
      - [✅ 正确代码](#-正确代码-9)
      - [💡 原理说明](#-原理说明-9)
      - [🛡️ 防御措施](#️-防御措施-9)
    - [5.2 Promise 链常见错误](#52-promise-链常见错误)
      - [❌ 错误代码](#-错误代码-10)
      - [✅ 正确代码](#-正确代码-10)
      - [💡 原理说明](#-原理说明-10)
      - [🛡️ 防御措施](#️-防御措施-10)
    - [5.3 async/await 误用](#53-asyncawait-误用)
      - [❌ 错误代码](#-错误代码-11)
      - [✅ 正确代码](#-正确代码-11)
      - [💡 原理说明](#-原理说明-11)
      - [🛡️ 防御措施](#️-防御措施-11)
  - [6. 类型系统陷阱](#6-类型系统陷阱)
    - [6.1 any 类型滥用](#61-any-类型滥用)
      - [❌ 错误代码](#-错误代码-12)
      - [✅ 正确代码](#-正确代码-12)
      - [💡 原理说明](#-原理说明-12)
      - [🛡️ 防御措施](#️-防御措施-12)
    - [6.2 类型断言误用](#62-类型断言误用)
      - [❌ 错误代码](#-错误代码-13)
      - [✅ 正确代码](#-正确代码-13)
      - [💡 原理说明](#-原理说明-13)
      - [🛡️ 防御措施](#️-防御措施-13)
    - [6.3 逆变协变问题](#63-逆变协变问题)
      - [❌ 错误代码](#-错误代码-14)
      - [✅ 正确代码](#-正确代码-14)
      - [💡 原理说明](#-原理说明-14)
      - [🛡️ 防御措施](#️-防御措施-14)
  - [7. 内存管理陷阱](#7-内存管理陷阱)
    - [7.1 循环引用](#71-循环引用)
      - [❌ 错误代码](#-错误代码-15)
      - [✅ 正确代码](#-正确代码-15)
      - [💡 原理说明](#-原理说明-15)
      - [🛡️ 防御措施](#️-防御措施-15)
    - [7.2 全局变量和内存泄漏](#72-全局变量和内存泄漏)
      - [❌ 错误代码](#-错误代码-16)
      - [✅ 正确代码](#-正确代码-16)
      - [💡 原理说明](#-原理说明-16)
      - [🛡️ 防御措施](#️-防御措施-16)
    - [7.3 事件监听器泄漏](#73-事件监听器泄漏)
      - [❌ 错误代码](#-错误代码-17)
      - [✅ 正确代码](#-正确代码-17)
      - [💡 原理说明](#-原理说明-17)
      - [🛡️ 防御措施](#️-防御措施-17)
  - [8. 模块化陷阱](#8-模块化陷阱)
    - [8.1 循环依赖](#81-循环依赖)
      - [❌ 错误代码](#-错误代码-18)
      - [✅ 正确代码](#-正确代码-18)
      - [💡 原理说明](#-原理说明-18)
      - [🛡️ 防御措施](#️-防御措施-18)
    - [8.2 动态导入误用](#82-动态导入误用)
      - [❌ 错误代码](#-错误代码-19)
      - [✅ 正确代码](#-正确代码-19)
      - [💡 原理说明](#-原理说明-19)
      - [🛡️ 防御措施](#️-防御措施-19)
    - [8.3 Tree Shaking 问题](#83-tree-shaking-问题)
      - [❌ 错误代码](#-错误代码-20)
      - [✅ 正确代码](#-正确代码-20)
      - [💡 原理说明](#-原理说明-20)
      - [🛡️ 防御措施](#️-防御措施-20)
  - [9. 性能陷阱](#9-性能陷阱)
    - [9.1 大数组操作](#91-大数组操作)
      - [❌ 错误代码](#-错误代码-21)
      - [✅ 正确代码](#-正确代码-21)
      - [💡 原理说明](#-原理说明-21)
      - [🛡️ 防御措施](#️-防御措施-21)
    - [9.2 DOM 操作优化](#92-dom-操作优化)
      - [❌ 错误代码](#-错误代码-22)
      - [✅ 正确代码](#-正确代码-22)
      - [💡 原理说明](#-原理说明-22)
      - [🛡️ 防御措施](#️-防御措施-22)
    - [9.3 正则表达式回溯](#93-正则表达式回溯)
      - [❌ 错误代码](#-错误代码-23)
      - [✅ 正确代码](#-正确代码-23)
      - [💡 原理说明](#-原理说明-23)
      - [🛡️ 防御措施](#️-防御措施-23)
  - [10. 安全陷阱](#10-安全陷阱)
    - [10.1 XSS（跨站脚本攻击）](#101-xss跨站脚本攻击)
      - [❌ 错误代码](#-错误代码-24)
      - [✅ 正确代码](#-正确代码-24)
      - [💡 原理说明](#-原理说明-24)
      - [🛡️ 防御措施](#️-防御措施-24)
    - [10.2 CSRF（跨站请求伪造）](#102-csrf跨站请求伪造)
      - [❌ 错误代码](#-错误代码-25)
      - [✅ 正确代码](#-正确代码-25)
      - [💡 原理说明](#-原理说明-25)
      - [🛡️ 防御措施](#️-防御措施-25)
    - [10.3 原型污染](#103-原型污染)
      - [❌ 错误代码](#-错误代码-26)
      - [✅ 正确代码](#-正确代码-26)
      - [💡 原理说明](#-原理说明-26)
      - [🛡️ 防御措施](#️-防御措施-26)
  - [总结](#总结)
    - [快速参考表](#快速参考表)
    - [推荐工具](#推荐工具)

---

## 1. 类型强制转换陷阱

### 1.1 相等运算符 `==` 的隐式转换

#### ❌ 错误代码

```javascript
// 这些比较结果可能出乎意料
console.log(0 == '0');        // true
console.log(0 == []);         // true
console.log('' == false);     // true
console.log(null == undefined); // true
console.log([1,2] == '1,2');  // true

// 更隐蔽的问题
function checkInput(value) {
  if (value == null) {
    // 这里会捕获 null 和 undefined，但也可能有其他问题
    console.log('No value provided');
  }
}

checkInput(null);      // "No value provided"
checkInput(undefined); // "No value provided"

// 字符串和数字的混淆
console.log('5' == 5);  // true
console.log('5' === 5); // false
```

#### ✅ 正确代码

```javascript
// 始终使用严格相等运算符
console.log(0 === '0');        // false
console.log(0 === []);         // false
console.log('' === false);     // false
console.log(null === undefined); // false

// 显式处理 null 和 undefined
function checkInput(value) {
  if (value === null || value === undefined) {
    console.log('No value provided');
  }
}

// 或者使用可选链和空值合并
function checkInputModern(value) {
  const finalValue = value ?? 'default';
  console.log(finalValue);
}
```

#### 💡 原理说明

`==` 运算符在执行比较前会进行类型强制转换，遵循复杂的规则：

1. **数字 vs 字符串**：字符串转换为数字
2. **布尔值 vs 其他**：布尔值转换为数字（true→1, false→0）
3. **对象 vs 原始值**：对象通过 `valueOf()` 或 `toString()` 转换
4. **null 和 undefined**：它们之间相等，但与其他任何值都不相等

#### 🛡️ 防御措施

- **使用 ESLint 规则**：`eqeqeq: ['error', 'always']`
- **代码审查**：确保团队统一使用 `===` 和 `!==`
- **TypeScript**：启用 `strict` 模式减少隐式转换问题

---

### 1.2 加号 `+` 运算符的陷阱

#### ❌ 错误代码

```javascript
// 字符串拼接 vs 数字相加
const result1 = 1 + '2';      // "12"
const result2 = 1 + 2 + '3';  // "33"
const result3 = '1' + 2 + 3;  // "123"

// 数组和对象的意外行为
const arr1 = [1, 2] + [3, 4]; // "1,23,4"
const obj1 = {} + [];         // 0 (在浏览器中) 或 "[object Object]" (取决于上下文)
const obj2 = [] + {};         // "[object Object]"

// 日期对象
const date = new Date();
const dateStr = date + 1000;  // 字符串拼接，而非时间相加

// 隐式转换导致的 Bug
function calculateTotal(price, tax) {
  return price + tax; // 如果传入字符串，结果是拼接
}

calculateTotal('100', 10); // "10010" ❌
```

#### ✅ 正确代码

```javascript
// 显式类型转换
const num1 = Number('2');     // 2
const num2 = parseInt('2');   // 2
const str1 = String(123);     // "123"

// 安全的数字相加
function calculateTotal(price, tax) {
  return Number(price) + Number(tax);
}

// 或者使用 TypeScript
function calculateTotalTS(price: number, tax: number): number {
  return price + tax;
}

// 数组连接的正确方式
const arr1 = [1, 2].concat([3, 4]); // [1, 2, 3, 4]
const arr2 = [...[1, 2], ...[3, 4]]; // [1, 2, 3, 4]

// 日期时间相加
const date = new Date();
const newDate = new Date(date.getTime() + 1000); // 增加1000毫秒
```

#### 💡 原理说明

`+` 运算符的行为取决于操作数的类型：

1. **任一操作数是字符串**：执行字符串拼接
2. **两个都是数字**：执行数字相加
3. **对象参与**：先调用 `valueOf()`，如果返回原始值则使用；否则调用 `toString()`
4. **数组的 `toString()`**：默认返回逗号分隔的元素字符串

#### 🛡️ 防御措施

- **函数入口验证**：使用 `typeof` 或 `Number()` 确保类型正确
- **TypeScript 严格类型**：定义明确的参数类型
- **单元测试**：覆盖各种输入类型的测试用例

---

### 1.3 空数组 `[]` 和空对象 `{}` 的布尔转换

#### ❌ 错误代码

```javascript
// 空数组和空对象都是 truthy
if ([]) {
  console.log('Empty array is truthy'); // 会执行
}

if ({}) {
  console.log('Empty object is truthy'); // 会执行
}

// 常见错误：检查数组是否为空
function processItems(items) {
  if (items) {  // ❌ 空数组也会进入这里
    items.forEach(item => console.log(item));
  }
}

processItems([]); // 不会报错，但也不会有任何输出，可能不符合预期

// 错误地检查对象是否为空
function getConfig(config) {
  return config || { default: true }; // ❌ 空对象不会触发默认值
}

getConfig({}); // 返回 {} 而非 { default: true }
```

#### ✅ 正确代码

```javascript
// 正确检查数组是否为空
function processItems(items) {
  if (items && items.length > 0) {
    items.forEach(item => console.log(item));
  } else {
    console.log('No items to process');
  }
}

// 或者使用可选链
function processItemsModern(items) {
  items?.forEach?.(item => console.log(item));
}

// 正确检查对象是否为空
function isEmptyObject(obj) {
  return Object.keys(obj).length === 0;
}

function getConfig(config) {
  return isEmptyObject(config) ? { default: true } : config;
}

// 使用空值合并运算符处理 null/undefined
function getConfigSafe(config) {
  return config ?? { default: true }; // 只在 null/undefined 时使用默认值
}
```

#### 💡 原理说明

JavaScript 中只有以下值是 falsy：

- `false`
- `0` / `-0` / `0n`
- `""` (空字符串)
- `null`
- `undefined`
- `NaN`

**所有其他值都是 truthy**，包括：`[]`、`{}`、`"0"`、`"false"`、函数等。

#### 🛡️ 防御措施

- **显式检查**：不要依赖隐式布尔转换，明确检查 `.length` 或 `Object.keys()`
- **使用工具库**：Lodash 的 `_.isEmpty()`、`_.isNil()` 等
- **TypeScript 配合严格模式**：减少意外的空值问题

---

## 2. this 绑定问题

### 2.1 普通函数的动态 this

#### ❌ 错误代码

```javascript
const user = {
  name: 'Alice',
  greet: function() {
    console.log(`Hello, I'm ${this.name}`);
  },
  delayedGreet: function() {
    setTimeout(function() {
      console.log(`Hello, I'm ${this.name}`); // ❌ this 指向全局对象
    }, 100);
  }
};

user.greet();        // "Hello, I'm Alice"
user.delayedGreet(); // "Hello, I'm undefined" (严格模式) 或 "Hello, I'm " (非严格)

// 回调函数中的 this 丢失
const button = document.querySelector('#myButton');
const handler = {
  message: 'Clicked!',
  handleClick: function() {
    console.log(this.message); // ❌ 当作为回调时，this 不再指向 handler
  }
};

button.addEventListener('click', handler.handleClick); // this 指向 button

// 方法提取后的 this 丢失
const greet = user.greet;
greet(); // ❌ this 变为全局对象或 undefined
```

#### ✅ 正确代码

```javascript
const user = {
  name: 'Alice',
  greet: function() {
    console.log(`Hello, I'm ${this.name}`);
  },
  delayedGreet: function() {
    // 方案1：使用箭头函数继承外层 this
    setTimeout(() => {
      console.log(`Hello, I'm ${this.name}`); // ✅ this 正确指向 user
    }, 100);
  },
  delayedGreetAlt: function() {
    // 方案2：使用 bind
    setTimeout(function() {
      console.log(`Hello, I'm ${this.name}`);
    }.bind(this), 100);
  },
  delayedGreetLegacy: function() {
    // 方案3：使用 self/that 保存 this (ES5 时代)
    const self = this;
    setTimeout(function() {
      console.log(`Hello, I'm ${self.name}`);
    }, 100);
  }
};

// 回调函数解决方案
const handler = {
  message: 'Clicked!',
  handleClick: function() {
    console.log(this.message);
  }
};

// 方案1：使用箭头函数包装
button.addEventListener('click', () => handler.handleClick());

// 方案2：使用 bind
button.addEventListener('click', handler.handleClick.bind(handler));

// 方案3：使用对象方法定义（保持绑定）
const handlerModern = {
  message: 'Clicked!',
  handleClick: () => { // ❌ 注意：箭头函数 here 会捕获定义时的 this
    console.log(this.message); // this 可能不是 handlerModern
  }
};

// 正确的现代写法
const handlerCorrect = {
  message: 'Clicked!',
  handleClick() { // 方法简写，保持可变的 this
    console.log(this.message);
  }
};
button.addEventListener('click', (e) => handlerCorrect.handleClick(e));
```

#### 💡 原理说明

普通函数的 `this` 在**运行时**确定，取决于调用方式：

1. **方法调用** `obj.method()`：`this` 指向 `obj`
2. **直接调用** `func()`：
   - 非严格模式：`this` 指向全局对象（浏览器中是 `window`）
   - 严格模式：`this` 是 `undefined`
3. **构造函数** `new Func()`：`this` 指向新创建的实例
4. **call/apply/bind**：显式指定 `this`

**箭头函数**的 `this` 在**定义时**确定，继承自外层作用域，无法通过 call/apply/bind 改变。

#### 🛡️ 防御措施

- **优先使用箭头函数**：在需要保持 `this` 上下文的回调中
- **使用方法简写**：`handleClick() {}` 而非 `handleClick: function() {}`
- **显式绑定**：必要时使用 `.bind(this)`
- **TypeScript 配置**：启用 `noImplicitThis` 获得更好的类型检查

---

### 2.2 箭头函数的 this 陷阱

#### ❌ 错误代码

```javascript
const counter = {
  count: 0,
  increment: () => {
    // ❌ 箭头函数的 this 继承自定义时的上下文（通常是全局对象）
    this.count++;
    console.log(this.count);
  }
};

counter.increment(); // NaN (严格模式下是错误)

// 在类中使用箭头函数作为方法
class MyClass {
  constructor() {
    this.value = 42;
  }

  // ❌ 错误：箭头函数作为原型方法
  getValue = () => this.value; // 这实际上在实例上创建属性，而非原型方法
}

// 期望 this 指向 DOM 元素的事件处理
const component = {
  name: 'MyComponent',
  init: function() {
    document.querySelector('#btn').addEventListener('click', () => {
      // ❌ 箭头函数 this 指向 component，而非按钮
      console.log(this.name); // "MyComponent" - 如果这是想要的还好
      console.log(this.id);   // undefined - 无法访问按钮的 id
    });
  }
};
```

#### ✅ 正确代码

```javascript
// 对象方法应该使用普通函数
const counter = {
  count: 0,
  increment() { // 方法简写
    this.count++;
    console.log(this.count);
  },
  // 如果需要箭头函数作为回调
  startTimer() {
    setInterval(() => {
      this.count++; // ✅ 箭头函数保持 counter 作为 this
      console.log(this.count);
    }, 1000);
  }
};

// 类中的正确做法
class MyClass {
  constructor() {
    this.value = 42;
  }

  // ✅ 原型方法使用普通函数
  getValue() {
    return this.value;
  }

  // ✅ 如果需要绑定，可以在构造函数中绑定
  constructorWithBinding() {
    this.value = 42;
    this.getValue = this.getValue.bind(this);
  }
}

// 需要访问 DOM 元素时
const component = {
  name: 'MyComponent',
  init: function() {
    document.querySelector('#btn').addEventListener('click', function() {
      // ✅ 普通函数，this 指向按钮
      console.log(this.id); // "btn"
      console.log(component.name); // 通过闭包访问组件
    });
  }
};

// 或者使用事件对象
const componentModern = {
  name: 'MyComponent',
  init() {
    document.querySelector('#btn').addEventListener('click', (e) => {
      // ✅ 通过事件对象访问目标元素
      console.log(e.target.id); // "btn"
      console.log(this.name);   // "MyComponent"
    });
  }
};
```

#### 💡 原理说明

箭头函数与传统函数的关键区别：

| 特性 | 普通函数 | 箭头函数 |
|------|----------|----------|
| `this` | 运行时动态绑定 | 定义时词法绑定 |
| `arguments` | 有自己的 arguments | 继承外层的 arguments |
| `new` | 可以作为构造函数 | 不能用作构造函数 |
| `prototype` | 有 prototype 属性 | 没有 prototype |

**使用场景**：

- ✅ 回调函数（保持外层 `this`）
- ✅ 简短的函数表达式
- ❌ 对象方法（需要动态 `this`）
- ❌ 原型方法（应该在原型上）
- ❌ 需要 `arguments` 对象时

#### 🛡️ 防御措施

- **理解词法作用域**：明确箭头函数 `this` 的定义位置
- **类方法使用普通函数**：除非明确需要绑定实例
- **使用 TypeScript**：获得 `this` 类型的静态检查

---

## 3. 闭包陷阱

### 3.1 循环中的闭包

#### ❌ 错误代码

```javascript
// 经典问题：所有按钮都输出相同的数字
for (var i = 0; i < 5; i++) {
  setTimeout(function() {
    console.log(i); // 全部输出 5
  }, 100);
}

// 创建多个事件处理器
var buttons = document.querySelectorAll('.btn');
for (var i = 0; i < buttons.length; i++) {
  buttons[i].addEventListener('click', function() {
    console.log('Button ' + i + ' clicked'); // 总是输出最后一个索引
  });
}

// 异步操作中的闭包
function fetchUsers(userIds) {
  var users = [];
  for (var i = 0; i < userIds.length; i++) {
    fetch(`/api/users/${userIds[i]}`).then(function(response) {
      users[i] = response.json(); // ❌ i 已经是最终值
    });
  }
  return users;
}
```

#### ✅ 正确代码

```javascript
// 方案1：使用 let 替代 var（块级作用域）
for (let i = 0; i < 5; i++) {
  setTimeout(function() {
    console.log(i); // 输出 0, 1, 2, 3, 4
  }, 100);
}

// 方案2：使用 IIFE（立即执行函数）- ES5 方案
for (var i = 0; i < 5; i++) {
  (function(capturedI) {
    setTimeout(function() {
      console.log(capturedI); // 输出 0, 1, 2, 3, 4
    }, 100);
  })(i);
}

// 方案3：使用 forEach（推荐）
[0, 1, 2, 3, 4].forEach(function(i) {
  setTimeout(function() {
    console.log(i);
  }, 100);
});

// 异步操作的正确处理
function fetchUsers(userIds) {
  const promises = userIds.map((id, index) =>
    fetch(`/api/users/${id}`).then(response => ({ index, data: response.json() }))
  );
  return Promise.all(promises);
}

// 事件处理器的正确处理
const buttons = document.querySelectorAll('.btn');
buttons.forEach((button, index) => {
  button.addEventListener('click', () => {
    console.log(`Button ${index} clicked`); // 正确的索引
  });
});
```

#### 💡 原理说明

闭包捕获的是**变量的引用**，而非值：

1. **`var` 的问题**：`var` 具有函数作用域，循环中的 `i` 是同一个变量
2. **`let` 的解决**：`let` 具有块级作用域，每次迭代创建新的绑定
3. **IIFE 模式**：创建新的函数作用域，保存当前值

**闭包的形成条件**：

- 函数嵌套
- 内部函数引用外部函数的变量
- 内部函数在定义它的作用域外被调用

#### 🛡️ 防御措施

- **优先使用 `let`/`const`**：避免 `var` 的作用域问题
- **使用数组方法**：`forEach`、`map`、`for...of` 等
- **ESLint 规则**：`no-loop-func` 检测循环中的函数创建

---

### 3.2 内存泄漏的闭包

#### ❌ 错误代码

```javascript
// 意外的全局变量捕获
function createHugeArray() {
  const hugeArray = new Array(1000000).fill('x'); // 大数组

  return function() {
    // ❌ 即使只使用 tinyVar，整个 hugeArray 被闭包持有
    const tinyVar = 1;
    return tinyVar;
  };
}

const leak = createHugeArray(); // hugeArray 无法被垃圾回收

// DOM 元素引用
function setupElement() {
  const element = document.getElementById('myElement');
  const data = new Array(1000000).fill('data'); // 大量数据

  element.addEventListener('click', function() {
    // ❌ 即使元素被移除，闭包仍持有 element 和 data 的引用
    console.log('Clicked');
  });
}

// 定时器闭包
function startTimer() {
  const heavyData = loadHugeData();

  setInterval(function() {
    // ❌ heavyData 一直被持有，即使不再需要
    console.log('Tick');
  }, 1000);
}

// 缓存导致的内存泄漏
const cache = {};
function processData(key) {
  const hugeData = fetchHugeData();

  cache[key] = function() {
    // ❌ 缓存的函数持有 hugeData 的引用
    return hugeData.slice(0, 10);
  };
}
```

#### ✅ 正确代码

```javascript
// 只捕获需要的变量
function createCounter() {
  let count = 0; // 只持有需要的状态

  return {
    increment() { count++; },
    getCount() { return count; }
  };
}

// 显式清理不需要的引用
function createProcessor() {
  let hugeData = loadHugeData();

  const processor = {
    process() {
      const result = hugeData.map(transform);
      // 处理完成后释放引用
      hugeData = null;
      return result;
    }
  };

  return processor;
}

// 弱引用（WeakRef）和 WeakMap
const elementData = new WeakMap();

function setupElementSafe() {
  const element = document.getElementById('myElement');
  const data = { large: new Array(1000000) };

  // 使用 WeakMap，当 DOM 元素被移除后，数据可以被回收
  elementData.set(element, data);

  element.addEventListener('click', handleClick);
}

// 正确的清理模式
function createDisposableTimer() {
  let heavyData = loadHugeData();
  let intervalId = null;

  function tick() {
    if (!heavyData) return;
    // 使用 heavyData
  }

  function start() {
    intervalId = setInterval(tick, 1000);
  }

  function dispose() {
    clearInterval(intervalId);
    heavyData = null; // 显式释放
  }

  return { start, dispose };
}

const timer = createDisposableTimer();
timer.start();
// 使用完成后
timer.dispose();

// 使用 FinalizationRegistry 清理资源
const registry = new FinalizationRegistry((heldValue) => {
  console.log(`Cleaning up: ${heldValue}`);
  // 执行清理操作
});

function createResource() {
  const resource = acquireResource();
  registry.register(resource, 'resource-id');
  return resource;
}
```

#### 💡 原理说明

**垃圾回收与闭包**：

- 闭包会保持对外部作用域变量的引用
- 只要闭包存在，引用的变量就不会被垃圾回收
- 即使闭包只使用了外部作用域的部分变量，整个作用域对象都会被保持

**常见的内存泄漏来源**：

1. **全局变量**：意外创建的全局变量
2. **定时器**：未清理的 `setInterval`
3. **DOM 引用**：已移除的 DOM 元素仍被 JavaScript 引用
4. **闭包捕获**：闭包持有大量不再需要的数据

#### 🛡️ 防御措施

- **只捕获必要变量**：避免捕获整个大对象
- **使用 WeakMap/WeakSet**：对 DOM 元素使用弱引用
- **显式清理**：提供 `dispose()`、`destroy()` 等方法
- **内存分析**：使用 Chrome DevTools 的 Memory 面板检测泄漏
- **避免意外的全局变量**：使用严格模式 `'use strict'`

---

## 4. 原型链问题

### 4.1 属性查找和原型污染

#### ❌ 错误代码

```javascript
// 修改内置原型（永远不要这样做！）
Array.prototype.first = function() {
  return this[0];
};

Object.prototype.toJSON = function() {
  return JSON.stringify(this);
};

// 意外的原型链查找
const obj = {
  name: 'test'
};

console.log(obj.toString); // 继承自 Object.prototype，可能不符合预期
console.log(obj.constructor); // 继承的属性

// for...in 遍历到继承属性
for (let key in obj) {
  console.log(key); // 可能包含继承的可枚举属性
}

// hasOwnProperty 被覆盖
const maliciousObj = {
  hasOwnProperty: 'hacked'
};

// ❌ 会抛出错误
// maliciousObj.hasOwnProperty('key');

// 原型污染漏洞
function merge(target, source) {
  for (let key in source) {
    if (typeof source[key] === 'object') {
      // ❌ 没有检查 key 是否是 __proto__
      target[key] = merge(target[key] || {}, source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

// 攻击：修改所有对象的原型
const payload = JSON.parse('{"__proto__": {"polluted": "yes"}}');
merge({}, payload);
console.log({}.polluted); // "yes" - 所有对象都被污染了！
```

#### ✅ 正确代码

```javascript
// 使用 Object.create 创建没有原型的对象
const dict = Object.create(null);
dict.key = 'value';
console.log('toString' in dict); // false

// 安全的属性遍历
const obj = { a: 1, b: 2 };

// 方案1：使用 Object.keys（只遍历自身可枚举属性）
Object.keys(obj).forEach(key => {
  console.log(key, obj[key]);
});

// 方案2：使用 hasOwnProperty 检查
for (let key in obj) {
  if (Object.prototype.hasOwnProperty.call(obj, key)) {
    console.log(key, obj[key]);
  }
}

// 方案3：使用 Object.hasOwn（现代方法）
for (let key in obj) {
  if (Object.hasOwn(obj, key)) {
    console.log(key, obj[key]);
  }
}

// 安全的对象合并（防止原型污染）
function safeMerge(target, source) {
  for (let key of Object.keys(source)) {
    // 拒绝危险键
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue;
    }

    if (typeof source[key] === 'object' && source[key] !== null) {
      target[key] = safeMerge(target[key] || {}, source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

// 更安全的方案：使用 Object.defineProperty 防止原型链访问
function secureMerge(target, source) {
  const keys = Object.getOwnPropertyNames(source)
    .concat(Object.getOwnPropertySymbols(source));

  for (const key of keys) {
    if (typeof key === 'string' &&
        (key === '__proto__' || key === 'constructor')) {
      continue;
    }

    const descriptor = Object.getOwnPropertyDescriptor(source, key);
    Object.defineProperty(target, key, descriptor);
  }

  return target;
}

// 冻结原型防止修改
Object.freeze(Object.prototype);
Object.freeze(Array.prototype);
```

#### 💡 原理说明

**原型链查找规则**：

1. 首先在对象自身查找属性
2. 如果没找到，沿着 `[[Prototype]]` 链向上查找
3. 直到 `Object.prototype`，如果还没找到返回 `undefined`

**原型污染漏洞**：

- 通过修改 `__proto__` 可以影响所有对象
- 危险键：`__proto__`、`constructor`、`prototype`
- JSON 解析和对象合并是常见的攻击入口

#### 🛡️ 防御措施

- **冻结内置原型**：`Object.freeze(Object.prototype)`
- **使用 Object.create(null)**：创建无原型的对象作为字典
- **验证输入**：检查和处理危险键名
- **使用 Map 替代普通对象**：Map 不受原型污染影响
- **深度冻结敏感对象**：防止运行时修改

---

### 4.2 构造函数和 instanceof 问题

#### ❌ 错误代码

```javascript
// 忘记使用 new
function Person(name) {
  this.name = name;
}

const person = Person('Alice'); // ❌ 忘记 new
console.log(person); // undefined
console.log(window.name); // "Alice" (污染了全局对象)

// instanceof 的跨窗口问题
const iframe = document.createElement('iframe');
document.body.appendChild(iframe);
const IframeArray = iframe.contentWindow.Array;

const arr = new IframeArray(1, 2, 3);
console.log(arr instanceof Array); // false ❌

// 手动修改原型导致 instanceof 失效
function Animal() {}
const dog = new Animal();

Object.setPrototypeOf(dog, {});
console.log(dog instanceof Animal); // false

// 继承中的原型链断裂
function Parent() {}
Parent.prototype.sayHello = function() {
  return 'Hello';
};

function Child() {}
Child.prototype = Parent.prototype; // ❌ 共享同一个对象

Child.prototype.sayGoodbye = function() {
  return 'Goodbye';
};

console.log(new Parent().sayGoodbye()); // "Goodbye" - Parent 也获得子类方法！
```

#### ✅ 正确代码

```javascript
// 使用严格模式 + new.target 检查
function Person(name) {
  if (!new.target) {
    throw new Error('Person must be called with new');
  }
  this.name = name;
}

// 或者自动调用 new
function PersonSafe(name) {
  if (!(this instanceof PersonSafe)) {
    return new PersonSafe(name);
  }
  this.name = name;
}

// 现代类语法（推荐）
class PersonModern {
  constructor(name) {
    this.name = name;
  }
}

// 跨窗口类型检查
function isArray(obj) {
  return Object.prototype.toString.call(obj) === '[object Array]';
}

// 或者使用 Array.isArray
console.log(Array.isArray(arr)); // true ✅

// 正确的继承设置
function Parent() {}
Parent.prototype.sayHello = function() {
  return 'Hello';
};

function Child() {
  Parent.call(this); // 调用父类构造函数
}

// ✅ 正确的原型链设置
Child.prototype = Object.create(Parent.prototype);
Child.prototype.constructor = Child; // 修复 constructor 指向

Child.prototype.sayGoodbye = function() {
  return 'Goodbye';
};

// 现代类继承
class ParentModern {
  sayHello() {
    return 'Hello';
  }
}

class ChildModern extends ParentModern {
  sayGoodbye() {
    return 'Goodbye';
  }
}

// Symbol.hasInstance 自定义 instanceof 行为
class MyClass {
  static [Symbol.hasInstance](instance) {
    return instance && instance._isMyClass;
  }
}
```

#### 💡 原理说明

**`new` 运算符的工作流程**：

1. 创建空对象 `{}`
2. 设置对象的 `[[Prototype]]` 为构造函数的 `prototype`
3. 将构造函数中的 `this` 绑定到新对象
4. 执行构造函数代码
5. 返回新对象（除非构造函数显式返回对象）

**`instanceof` 的工作原理**：

- 检查右侧构造函数的 `prototype` 是否存在于左侧对象的原型链上
- 可以被 `Symbol.hasInstance` 自定义
- 跨窗口/iframe 时由于不同全局环境会失效

#### 🛡️ 防御措施

- **使用 ES6 类语法**：自动处理 new 检查和原型链设置
- **使用 `new.target`**：ES6 方式检查是否通过 new 调用
- **类型检查时优先使用 `Array.isArray`**：而非 `instanceof Array`
- **使用 `Object.create`**：正确设置原型链

---

## 5. 异步陷阱

### 5.1 回调地狱

#### ❌ 错误代码

```javascript
// 深层嵌套的回调（金字塔厄运）
getUserData(userId, function(err, user) {
  if (err) {
    console.error(err);
    return;
  }

  getOrders(user.id, function(err, orders) {
    if (err) {
      console.error(err);
      return;
    }

    getOrderDetails(orders[0].id, function(err, details) {
      if (err) {
        console.error(err);
        return;
      }

      processPayment(details, function(err, result) {
        if (err) {
          console.error(err);
          return;
        }

        sendConfirmation(result, function(err) {
          if (err) {
            console.error(err);
            return;
          }

          console.log('All done!');
        });
      });
    });
  });
});

// 错误处理不一致
asyncOperation1(function(err, result1) {
  if (err) throw err; // ❌ 在异步回调中 throw 无法被外部捕获

  asyncOperation2(result1, function(err, result2) {
    // 错误被静默忽略
    asyncOperation3(result2, function(err, result3) {
      // ...
    });
  });
});
```

#### ✅ 正确代码

```javascript
// 使用 Promise 链
getUserData(userId)
  .then(user => getOrders(user.id))
  .then(orders => getOrderDetails(orders[0].id))
  .then(details => processPayment(details))
  .then(result => sendConfirmation(result))
  .then(() => console.log('All done!'))
  .catch(err => console.error('Error:', err));

// 使用 async/await
async function processUserOrder(userId) {
  try {
    const user = await getUserData(userId);
    const orders = await getOrders(user.id);
    const details = await getOrderDetails(orders[0].id);
    const result = await processPayment(details);
    await sendConfirmation(result);
    console.log('All done!');
  } catch (err) {
    console.error('Error:', err);
    throw err; // 重新抛出让调用者处理
  }
}

// 并行执行（如果有依赖关系允许）
async function fetchUserData(userId) {
  const user = await getUserData(userId);

  // 并行获取不相关的数据
  const [orders, profile, preferences] = await Promise.all([
    getOrders(user.id),
    getProfile(user.id),
    getPreferences(user.id)
  ]);

  return { user, orders, profile, preferences };
}

// 错误处理的正确方式
async function robustOperation() {
  try {
    const result1 = await asyncOperation1();
    const result2 = await asyncOperation2(result1);
    return await asyncOperation3(result2);
  } catch (err) {
    // 统一的错误处理
    logger.error('Operation failed:', err);
    throw new CustomError('Failed to complete operation', { cause: err });
  }
}
```

#### 💡 原理说明

**回调的问题**：

1. **代码深度嵌套**：难以阅读和维护
2. **错误处理困难**：需要在每个回调中处理错误
3. **控制流复杂**：并行、串行、条件执行难以管理
4. **异常处理困难**：回调中抛出的错误无法被外部捕获

**Promise 的优势**：

1. **链式调用**：扁平化代码结构
2. **统一错误处理**：一个 `.catch()` 处理链中所有错误
3. **组合能力**：`Promise.all`、`Promise.race` 等
4. **可取消（通过包装）**：更好的控制流管理

#### 🛡️ 防御措施

- **优先使用 async/await**：代码更清晰，错误处理更直观
- **避免深层嵌套**：超过 2-3 层考虑重构
- **统一错误处理**：避免在每个回调中重复错误处理逻辑
- **使用 Promise 工具库**：如 `p-map`、`p-all` 等处理复杂并发

---

### 5.2 Promise 链常见错误

#### ❌ 错误代码

```javascript
// 忘记 return Promise
function fetchData() {
  fetch('/api/data')
    .then(response => {
      response.json(); // ❌ 忘记 return
    })
    .then(data => {
      console.log(data); // undefined
    });
}

// 在 then 中抛出异常的位置不当
fetch('/api/data')
  .then(response => {
    if (!response.ok) {
      throw new Error('Failed'); // ✅ 正确
    }
    return response.json();
  })
  .then(data => {
    processData(data);
    // ❌ 如果 processData 抛出错误，无法被链式 catch 捕获
  });

// Promise 构造函数误用
function delay(ms) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms);
    // ❌ 如果这里抛出错误，不会被 reject
    throw new Error('This is lost');
  });
}

// 嵌套 Promise（Promise 地狱）
fetchUser()
  .then(user => {
    return fetchOrders(user.id)
      .then(orders => {
        return fetchDetails(orders[0].id)
          .then(details => {
            // 嵌套过深，没有利用 Promise 链的优势
          });
      });
  });

// 同时调用 resolve 和 reject
new Promise((resolve, reject) => {
  resolve('success');
  reject('error'); // ❌ 无效，Promise 已经 settled
});

// 忘记处理 rejection
fetch('/api/data'); // ❌ 未处理的 Promise rejection

// 在 finally 中返回值
fetch('/api/data')
  .then(res => res.json())
  .finally(() => {
    return 'cleanup'; // ❌ finally 的返回值会被忽略
  });
```

#### ✅ 正确代码

```javascript
// 始终 return Promise
function fetchData() {
  return fetch('/api/data')
    .then(response => {
      return response.json(); // ✅ 返回 Promise
    })
    .then(data => {
      console.log(data);
      return data; // 继续传递
    });
}

// 正确处理异常
fetch('/api/data')
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    return processData(data); // ✅ 返回结果让异常能被捕获
  })
  .catch(err => {
    console.error('Error in chain:', err);
    throw err;
  });

// 正确的 Promise 构造函数用法
function delay(ms) {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(), ms);
    // 所有同步错误都应该被 try-catch 捕获并 reject
  });
}

// 扁平化的 Promise 链
fetchUser()
  .then(user => fetchOrders(user.id))
  .then(orders => fetchDetails(orders[0].id))
  .then(details => console.log(details))
  .catch(err => console.error(err));

// 或者使用 async/await
async function getDetails() {
  const user = await fetchUser();
  const orders = await fetchOrders(user.id);
  const details = await fetchDetails(orders[0].id);
  return details;
}

// 使用 Promise.all 处理多个 Promise
async function fetchAllData() {
  const [users, orders, products] = await Promise.all([
    fetchUsers(),
    fetchOrders(),
    fetchProducts()
  ]);
  return { users, orders, products };
}

// 正确处理拒绝
fetch('/api/data')
  .then(res => res.json())
  .catch(err => {
    console.error('Failed:', err);
    return { error: true }; // 提供默认值
  });

// finally 的正确使用
fetch('/api/data')
  .then(res => res.json())
  .catch(err => ({ error: err.message }))
  .finally(() => {
    console.log('Request completed');
    // 清理资源，不返回值
  });
```

#### 💡 原理说明

**Promise 的状态**：

- `pending`：初始状态
- `fulfilled`：操作成功完成
- `rejected`：操作失败
- **状态一旦确定就不能改变**，且只能改变一次

**Promise 链的关键规则**：

1. `then()` 返回新的 Promise
2. 如果回调返回 Promise，链会等待其完成
3. 如果回调抛出错误，Promise 被拒绝
4. `catch()` 处理上游的错误，如果正常返回则继续 fulfilled 链

#### 🛡️ 防御措施

- **始终 return**：在 `then()` 回调中返回需要传递的值
- **统一错误处理**：在链末尾使用 `catch()`
- **使用 async/await**：避免手动管理 Promise 链
- **启用 ESLint 规则**：`promise/catch-or-return`、`promise/always-return`

---

### 5.3 async/await 误用

#### ❌ 错误代码

```javascript
// 不必要的 await
async function getData() {
  const result = await Promise.resolve(42); // ❌ 多余的 await
  return result;
}

// 串行执行本可以并行的操作
async function fetchUserData(userId) {
  const user = await fetchUser(userId);        // 等待 100ms
  const orders = await fetchOrders(userId);    // 等待 100ms
  const profile = await fetchProfile(userId);  // 等待 100ms
  // 总计 300ms
  return { user, orders, profile };
}

// 在 forEach 中使用 async/await
async function processUsers(userIds) {
  userIds.forEach(async (id) => {
    // ❌ forEach 不会等待异步操作完成
    const user = await fetchUser(id);
    console.log(user);
  });
  console.log('All done'); // 这会在所有 fetch 完成前执行
}

// 错误处理不当
async function riskyOperation() {
  try {
    const result = await mightFail();
    const processed = await process(result);
    return processed;
  } catch (err) {
    // ❌ 捕获了所有错误，可能隐藏了意外的异常
    return null;
  }
}

// 顶层 await 的问题（旧环境）
const data = await fetchData(); // ❌ 在模块外使用会导致语法错误

// 忘记 await 导致获取 Promise 而非结果
async function getUser() {
  const user = fetchUser(1); // ❌ 忘记 await
  console.log(user.name);    // undefined - user 是 Promise
}

// 在条件中错误地使用 await
async function conditionalFetch(shouldFetch) {
  const data = shouldFetch && await fetchData(); // ❌ 可能返回 false
  return data;
}
```

#### ✅ 正确代码

```javascript
// 并行执行独立的异步操作
async function fetchUserData(userId) {
  const [user, orders, profile] = await Promise.all([
    fetchUser(userId),
    fetchOrders(userId),
    fetchProfile(userId)
  ]);
  // 总计约 100ms
  return { user, orders, profile };
}

// 使用 for...of 或 Promise.all 替代 forEach
async function processUsers(userIds) {
  // 方案1：串行处理（如果顺序重要）
  for (const id of userIds) {
    const user = await fetchUser(id);
    console.log(user);
  }

  // 方案2：并行处理（如果顺序不重要）
  await Promise.all(userIds.map(async (id) => {
    const user = await fetchUser(id);
    console.log(user);
  }));

  console.log('All done');
}

// 正确的错误处理
async function riskyOperation() {
  try {
    const result = await mightFail();
    return await process(result);
  } catch (err) {
    if (err instanceof SpecificError) {
      // 处理特定错误
      return handleSpecificError(err);
    }
    // 重新抛出未知错误
    throw err;
  }
}

// 使用 IIFE 实现顶层 await（旧环境）
(async () => {
  const data = await fetchData();
  console.log(data);
})();

// 现代模块中使用顶层 await
// module.mjs
const data = await fetchData();
export { data };

// 始终记得 await
async function getUser() {
  const user = await fetchUser(1);
  console.log(user.name);
  return user;
}

// 正确的条件 await
async function conditionalFetch(shouldFetch) {
  const data = shouldFetch ? await fetchData() : null;
  return data;
}

// 或者使用短路求值
async function conditionalFetchAlt(shouldFetch) {
  if (!shouldFetch) return null;
  return await fetchData();
}

// 处理可能为 null 的 await
async function safeFetch(getter) {
  const fetcher = getter();
  if (!fetcher) return null;
  return await fetcher;
}
```

#### 💡 原理说明

**async 函数的本质**：

- 总是返回 Promise
- `await` 暂停函数执行，等待 Promise 完成
- 不会阻塞主线程（非阻塞 I/O）

**并行 vs 串行**：

- 串行：`await` 一个接一个 → 总时间是各操作之和
- 并行：`Promise.all` → 总时间是最慢操作的时间

**常见误区**：

1. `forEach` + `async` = 不会等待，返回的 Promise 被忽略
2. `await` 在 `for` 循环中是串行的
3. 忘记 `await` 会得到 Promise 对象而非结果

#### 🛡️ 防御措施

- **识别可并行的操作**：使用 `Promise.all` 加速
- **使用 for...of 而非 forEach**：如果需要等待完成
- **小心错误处理**：不要过度捕获异常
- **ESLint 规则**：`require-await`、`no-return-await`（视情况）

---

## 6. 类型系统陷阱

### 6.1 any 类型滥用

#### ❌ 错误代码

```typescript
// 过度使用 any
function processData(data: any): any {
  return data.map((item: any) => item.value);
}

// 隐式 any
function fetchUser(id) {  // ❌ 参数隐式为 any
  return fetch(`/api/user/${id}`).then(res => res.json());
}

// any 传播
const user: any = fetchUser(1);
const name: string = user.name; // 类型安全丧失
const age: number = user.age;
const invalid = user.nonExistent.deep.nested; // 编译通过，运行时错误

// 为逃避类型检查而使用 any
interface User {
  name: string;
  age: number;
}

function updateUser(user: User, updates: any) { // ❌ 应该使用 Partial<User>
  return { ...user, ...updates };
}

// 第三方库没有类型定义时的粗暴处理
declare const library: any; // ❌ 应该写具体的类型声明

// JSON.parse 返回 any 的滥用
const config = JSON.parse(jsonString);
console.log(config.databse.host); // 拼写错误，但编译通过
```

#### ✅ 正确代码

```typescript
// 使用具体的类型
interface DataItem {
  value: string;
}

function processData(data: DataItem[]): string[] {
  return data.map(item => item.value);
}

// 启用 strict 模式，避免隐式 any
function fetchUser(id: number): Promise<User> {
  return fetch(`/api/user/${id}`).then(res => res.json());
}

// 使用 unknown 替代 any
function safeProcess(input: unknown): string {
  if (typeof input === 'string') {
    return input.toUpperCase();
  }
  if (Array.isArray(input)) {
    return input.join(',');
  }
  throw new Error('Unsupported input type');
}

// 类型守卫
function isUser(obj: unknown): obj is User {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'name' in obj &&
    'age' in obj &&
    typeof (obj as User).name === 'string' &&
    typeof (obj as User).age === 'number'
  );
}

function processUser(input: unknown) {
  if (isUser(input)) {
    console.log(input.name); // ✅ 类型安全
  }
}

// 泛型替代 any
function identity<T>(arg: T): T {
  return arg;
}

function mapArray<T, U>(array: T[], fn: (item: T) => U): U[] {
  return array.map(fn);
}

// 索引签名（比 any 更安全）
interface Dictionary<T> {
  [key: string]: T;
}

const users: Dictionary<User> = {};

// 条件类型和映射类型
function updateUser(user: User, updates: Partial<User>): User {
  return { ...user, ...updates };
}

// 为第三方库编写类型声明
declare const library: {
  initialize(options: { apiKey: string; timeout?: number }): void;
  fetchData<T>(endpoint: string): Promise<T>;
};

// JSON.parse 的类型安全封装
function parseJSON<T>(json: string, validator: (data: unknown) => data is T): T {
  const parsed = JSON.parse(json);
  if (!validator(parsed)) {
    throw new Error('Invalid JSON structure');
  }
  return parsed;
}

interface Config {
  database: { host: string; port: number };
}

const config = parseJSON<Config>(jsonString, isConfig);
console.log(config.database.host); // ✅ 类型安全，拼写错误会被捕获
```

#### 💡 原理说明

**`any` 的问题**：

1. **禁用类型检查**：编译器不会检查 `any` 类型的任何操作
2. **传染效应**：一个 `any` 会让相关代码都失去类型保护
3. **隐藏错误**：编译时通过的代码可能在运行时失败
4. **丧失 IDE 支持**：自动完成、重构等功能失效

**`unknown` vs `any`**：

- `unknown`：类型安全的顶层类型，不能直接操作，必须先类型检查
- `any`：完全绕过类型系统

#### 🛡️ 防御措施

- **启用 `strict` 模式**：`noImplicitAny`、`strictNullChecks` 等
- **使用 ESLint**：`@typescript-eslint/no-explicit-any`
- **逐步替换 any**：使用类型守卫、泛型、映射类型
- **第三方库**：安装 `@types` 包或编写声明文件

---

### 6.2 类型断言误用

#### ❌ 错误代码

```typescript
// 过度使用类型断言
interface User {
  name: string;
  age: number;
}

const data = fetchData();
const user = data as User; // ❌ 没有验证数据结构

// 双重断言（彻底绕过类型检查）
const anything = "string" as unknown as { complex: object };

// 使用 ! 非空断言
function getLength(str: string | null) {
  return str!.length; // ❌ 运行时可能报错
}

// 强制转换不兼容类型
const num = "123" as number; // ❌ 错误的使用

// 为逃避类型检查而断言
interface Animal { name: string; }
interface Dog extends Animal { bark(): void; }

function makeDogBark(animal: Animal) {
  (animal as Dog).bark(); // ❌ 可能运行时错误
}

// 在不确定的情况下使用 const 断言
const config = {
  apiUrl: "https://api.example.com",
  timeout: 5000
} as const; // 可能过于严格，导致后续无法修改

// 忽略 Promise 的类型
async function fetchData() {
  const response = await fetch('/api/data');
  return response.json() as any; // ❌ 没有具体类型
}
```

#### ✅ 正确代码

```typescript
// 使用类型守卫进行验证
function isUser(data: unknown): data is User {
  return (
    typeof data === 'object' &&
    data !== null &&
    'name' in data &&
    'age' in data &&
    typeof (data as Record<string, unknown>).name === 'string' &&
    typeof (data as Record<string, unknown>).age === 'number'
  );
}

const data = fetchData();
if (isUser(data)) {
  // ✅ 在这个块内，data 被正确地识别为 User 类型
  console.log(data.name);
}

// 安全的可选链和非空检查
function getLengthSafe(str: string | null | undefined): number {
  return str?.length ?? 0;
}

// 显式的类型转换
const num = Number("123"); // ✅ 运行时实际转换

// 运行时类型检查
function makeDogBarkSafe(animal: Animal) {
  if ('bark' in animal && typeof (animal as Dog).bark === 'function') {
    (animal as Dog).bark(); // ✅ 确认是 Dog 后再调用
  }
}

// 使用 satisfies 操作符（TypeScript 4.9+）
const config = {
  apiUrl: "https://api.example.com",
  timeout: 5000
} satisfies { apiUrl: string; timeout: number };

// 保留推断类型，同时检查结构
// config.timeout 仍然是 number 类型，而不是字面量 5000

// 泛型替代类型断言
async function fetchTyped<T>(url: string): Promise<T> {
  const response = await fetch(url);
  const data = await response.json();
  return data as T; // 仍然需要，但封装在通用函数中
}

// 更好的方式：运行时验证
async function fetchValidated<T>(
  url: string,
  validator: (data: unknown) => data is T
): Promise<T> {
  const response = await fetch(url);
  const data = await response.json();

  if (!validator(data)) {
    throw new Error('Response validation failed');
  }

  return data;
}

// 合理的类型断言场景
const canvas = document.getElementById('canvas') as HTMLCanvasElement;
// ✅ 如果你确定 ID 存在且是 canvas 元素

// 使用更加严格的断言方式
const input = document.querySelector('input[name="email"]');
if (input instanceof HTMLInputElement) {
  console.log(input.value); // ✅ 类型安全
}
```

#### 💡 原理说明

**类型断言的本质**：

- 告诉编译器"相信我，我知道这个值的类型"
- **不进行运行时检查**，只是编译时类型系统的操作
- 相当于其他语言中的类型转换，但 JavaScript 运行时不会发生转换

**危险的使用场景**：

1. **没有验证的断言**：将未知数据断言为具体类型
2. **双重断言**：`as unknown as Type` 完全绕过类型检查
3. **非空断言 `!`**：假设值不为 null/undefined

**合理的断言场景**：

1. DOM 元素查询（当你确定元素存在时）
2. 通用工具函数的返回值
3. 复杂的类型收窄（配合类型守卫）

#### 🛡️ 防御措施

- **优先使用类型守卫**：运行时验证 + 类型收窄
- **使用 `satisfies`**：在需要时检查结构而不改变类型
- **启用 `strict`** 模式：减少需要断言的场景
- **ESLint 规则**：`@typescript-eslint/no-non-null-assertion`

---

### 6.3 逆变协变问题

#### ❌ 错误代码

```typescript
// 协变误用
interface Animal { name: string; }
interface Dog extends Animal { bark(): void; }

let animals: Animal[] = [];
let dogs: Dog[] = [{ name: 'Buddy', bark: () => {} }];

animals = dogs; // ✅ 协变，允许
animals.push({ name: 'Cat' }); // ❌ 但我们向 Dog[] 添加了非 Dog！

// 函数参数的逆变问题
let animalHandler: (animal: Animal) => void;
let dogHandler: (dog: Dog) => void = (dog) => dog.bark();

animalHandler = dogHandler; // ❌ 可能不安全
// animalHandler({ name: 'Cat' }); // 运行时错误：Cat 没有 bark

// 泛型不变性
interface Container<T> {
  value: T;
  setValue(val: T): void;
}

let animalContainer: Container<Animal>;
let dogContainer: Container<Dog> = {
  value: { name: 'Buddy', bark() {} },
  setValue(dog) {}
};

// animalContainer = dogContainer; // ❌ 错误：泛型默认是不变的

// 可选属性的协变问题
interface Config {
  required: string;
  optional?: string;
}

const partial: { required: string } = { required: 'test' };
// const full: Config = partial; // ❌ 可能有问题
```

#### ✅ 正确代码

```typescript
// 理解数组的协变风险
function processAnimals(animals: readonly Animal[]) {
  // 只读数组防止修改
  animals.forEach(a => console.log(a.name));
}

processAnimals(dogs); // ✅ 安全

// 正确的函数类型设计
interface AnimalHandler {
  (animal: Animal): void;
}

// 接受更宽泛的参数（逆变）
const handleAnyAnimal: AnimalHandler = (animal) => {
  console.log(animal.name); // 只使用 Animal 的属性，安全
};

// 返回更具体的类型（协变）
interface AnimalFactory {
  (): Animal;
}

const createDog: AnimalFactory = () => ({
  name: 'Buddy',
  bark() {}
});

// 使用泛型约束
function processItems<T extends Animal>(items: T[]): void {
  items.forEach(item => console.log(item.name));
}

// 正确设置泛型参数位置
interface Getter<out T> { // TypeScript 4.7+ 协变注解
  get(): T;
}

interface Setter<in T> { // 逆变注解
  set(value: T): void;
}

interface ContainerVariant<in out T> { // 不变
  get(): T;
  set(value: T): void;
}

// 使用类型谓词实现安全的类型转换
function isDog(animal: Animal): animal is Dog {
  return 'bark' in animal && typeof (animal as Dog).bark === 'function';
}

function handleAnimal(animal: Animal) {
  if (isDog(animal)) {
    animal.bark(); // ✅ 类型安全
  }
}

// 结构类型的正确处理
interface AnimalConfig {
  readonly name: string;
  readonly age?: number;
}

const myPet = { name: 'Buddy', age: 3, breed: 'Labrador' };
const config: AnimalConfig = myPet; // ✅ 多余属性是允许的

// 使用 Pick/Omit 创建相关类型
type AnimalInfo = Pick<Animal, 'name'>;
type AnimalWithoutName = Omit<Animal, 'name'>;

// 函数重载处理不同类型
function process(input: Animal): void;
function process(input: Dog): void;
function process(input: Animal | Dog): void {
  console.log(input.name);
}
```

#### 💡 原理说明

**类型系统的变型规则**：

| 位置 | 变型 | 说明 |
|------|------|------|
| 返回值 | 协变 (covariant) | 可以返回子类型 |
| 参数 | 逆变 (contravariant) | 可以接受父类型 |
| 只读属性 | 协变 | 可以读取子类型 |
| 可变属性 | 不变 (invariant) | 必须是精确类型 |
| 数组元素 | 协变（有风险） | TypeScript 允许，但修改时不安全 |

**关键原则**：

- **协变（Covariant）**：子类型可以替代父类型
- **逆变（Contravariant）**：父类型可以替代子类型
- **不变（Invariant）**：必须精确匹配

TypeScript 默认对函数参数是双变（bivariant）的，可以通过 `strictFunctionTypes` 启用正确的逆变检查。

#### 🛡️ 防御措施

- **启用 `strictFunctionTypes`**：正确的函数参数逆变检查
- **使用 `readonly`**：防止协变数组的不安全修改
- **理解变型规则**：设计 API 时考虑类型的变型位置
- **使用泛型约束**：`T extends Base` 而非直接接受基类

---

## 7. 内存管理陷阱

### 7.1 循环引用

#### ❌ 错误代码

```javascript
// 对象间的循环引用
const objA = { name: 'A' };
const objB = { name: 'B' };

objA.ref = objB;
objB.ref = objA;

// 即使不再引用，在旧版浏览器（IE）中可能无法回收
let root = { a: objA };
root = null;

// DOM 元素和 JavaScript 对象的循环引用（IE 时代问题）
function createLeak() {
  const element = document.getElementById('leak');
  const obj = {};

  element.customData = obj;  // DOM 引用 JS 对象
  obj.element = element;     // JS 对象引用 DOM

  // 即使移除 DOM，循环引用可能导致内存泄漏
}

// 事件监听器中的循环引用
class Component {
  constructor() {
    this.data = new Array(1000000).fill('data');
    this.handleClick = function() {
      console.log(this.data.length);
    };

    document.addEventListener('click', this.handleClick);
  }

  // ❌ 没有清理方法
}

// Map 中的循环引用
const map = new Map();
const key = {};
const value = { ref: key };
key.ref = value;

map.set(key, value);
// map.clear(); // 如果不清理，即使外部没有引用，也保持存活
```

#### ✅ 正确代码

```javascript
// 现代引擎（V8等）使用标记-清除算法，可以处理循环引用
// 但仍然要注意不要保持不必要的引用

// 使用 WeakMap/WeakSet 避免阻止垃圾回收
const metadata = new WeakMap();

function processObject(obj) {
  // 即使 obj 在其他地方被回收，metadata 不会阻止它
  metadata.set(obj, { processed: true });
}

// DOM 和 JavaScript 的安全关联
const elementData = new WeakMap();

function setupElement(element) {
  elementData.set(element, {
    largeData: new Array(1000000),
    timestamp: Date.now()
  });

  // 当 DOM 元素被移除和垃圾回收后，关联数据也会被回收
}

// 正确的清理模式
class ComponentSafe {
  constructor() {
    this.data = new Array(1000000).fill('data');
    this.handleClick = this.handleClick.bind(this);

    document.addEventListener('click', this.handleClick);
  }

  handleClick() {
    console.log(this.data.length);
  }

  destroy() {
    document.removeEventListener('click', this.handleClick);
    this.data = null; // 帮助垃圾回收
  }
}

// 使用 WeakRef（谨慎使用）
class Cache {
  constructor() {
    this.cache = new Map();
  }

  set(key, value) {
    const ref = new WeakRef(value);
    this.cache.set(key, ref);
  }

  get(key) {
    const ref = this.cache.get(key);
    const value = ref?.deref();

    if (value === undefined) {
      this.cache.delete(key); // 清理已回收的引用
    }

    return value;
  }
}

// FinalizationRegistry 清理资源
const cleanupRegistry = new FinalizationRegistry((resourceId) => {
  console.log(`Cleaning up resource: ${resourceId}`);
  // 执行实际的清理操作
});

function createResource() {
  const resource = { data: new Array(1000000) };
  cleanupRegistry.register(resource, 'resource-123');
  return resource;
}

// 避免循环引用的设计
function createNode(value) {
  return {
    value,
    parent: null,    // 如果不需要双向关系，只保留一个方向
    children: []
  };
}

// 如果必须双向，使用 ID 引用而非直接引用
const nodes = new Map();

function createNodeWithId(value, parentId) {
  const id = generateId();
  const node = { id, value, parentId, childIds: [] };
  nodes.set(id, node);

  if (parentId) {
    const parent = nodes.get(parentId);
    parent.childIds.push(id);
  }

  return node;
}
```

#### 💡 原理说明

**垃圾回收算法**：

- **引用计数**：无法处理循环引用（旧版 IE）
- **标记-清除**：现代引擎使用，可以处理循环引用
- **分代回收**：对象按存活时间分代，优化回收效率

**循环引用的影响**：

- 现代引擎：通常不是问题，可以正确回收
- 但仍然要避免保持不必要的引用，防止内存膨胀
- WeakMap/WeakSet 是处理关联数据的最佳实践

#### 🛡️ 防御措施

- **使用 WeakMap/WeakSet**：DOM 数据和元数据关联
- **提供清理方法**：组件销毁时清理事件监听和引用
- **避免双向引用**：如果可能，使用 ID 而非直接引用
- **内存分析**：使用 Chrome DevTools Memory 面板

---

### 7.2 全局变量和内存泄漏

#### ❌ 错误代码

```javascript
// 意外创建全局变量
function accidentalGlobal() {
  leak = 'This is a global variable'; // ❌ 忘记 var/let/const
}

// this 默认绑定到全局对象
function createGlobal() {
  this.globalData = new Array(1000000); // ❌ 非严格模式下创建全局属性
}
createGlobal();

// 未清理的定时器
function startTimer() {
  const largeData = new Array(1000000);

  setInterval(() => {
    // largeData 被闭包引用，无法回收
    console.log('Tick');
  }, 1000);
}

// 未移除的事件监听器
function setupListeners() {
  const data = loadHugeData();

  window.addEventListener('resize', function handler() {
    // 引用 data，即使 data 不再需要
    process(data);
  });
  // ❌ 没有移除监听器
}

// 缓存无限增长
const cache = {};

function addToCache(key, value) {
  cache[key] = value; // ❌ 没有大小限制，无限增长
}

// 订阅者模式未取消订阅
class EventBus {
  constructor() {
    this.subscribers = [];
  }

  subscribe(fn) {
    this.subscribers.push(fn);
    // ❌ 没有返回取消订阅的方法
  }

  emit(data) {
    this.subscribers.forEach(fn => fn(data));
  }
}
```

#### ✅ 正确代码

```javascript
// 使用严格模式
'use strict';

function noAccidentalGlobal() {
  const leak = 'This is local'; // ✅ 使用 const/let
}

// 清理定时器
function safeTimer() {
  let largeData = new Array(1000000);

  const intervalId = setInterval(() => {
    if (!largeData) return;
    // 使用数据
  }, 1000);

  // 清理函数
  return function cleanup() {
    clearInterval(intervalId);
    largeData = null; // 帮助垃圾回收
  };
}

const cleanup = safeTimer();
// 稍后调用 cleanup()

// 正确的事件监听器管理
function setupListenersSafe() {
  const data = loadHugeData();

  function handler() {
    process(data);
  }

  window.addEventListener('resize', handler);

  // 返回清理函数
  return () => {
    window.removeEventListener('resize', handler);
  };
}

const removeListener = setupListenersSafe();
// 稍后调用 removeListener()

// 使用 AbortController（现代 API）
function setupWithAbortSignal() {
  const controller = new AbortController();

  window.addEventListener('resize', handler, { signal: controller.signal });

  return () => controller.abort(); // 一次性移除所有监听器
}

// 有限大小的 LRU 缓存
class LRUCache {
  constructor(maxSize = 100) {
    this.maxSize = maxSize;
    this.cache = new Map();
  }

  get(key) {
    if (!this.cache.has(key)) return undefined;

    // 移动到最新
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // 移除最旧的
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, value);
  }
}

// 带取消订阅的事件总线
class SafeEventBus {
  constructor() {
    this.subscribers = new Set();
  }

  subscribe(fn) {
    this.subscribers.add(fn);

    // 返回取消订阅函数
    return () => {
      this.subscribers.delete(fn);
    };
  }

  once(fn) {
    const unsubscribe = this.subscribe((...args) => {
      unsubscribe();
      fn(...args);
    });
    return unsubscribe;
  }

  emit(data) {
    this.subscribers.forEach(fn => fn(data));
  }

  clear() {
    this.subscribers.clear();
  }
}

// WeakRef 用于非必需缓存
class WeakCache {
  constructor() {
    this.cache = new Map();
  }

  set(key, value) {
    const ref = new WeakRef(value);
    this.cache.set(key, ref);
  }

  get(key) {
    const ref = this.cache.get(key);
    const value = ref?.deref();

    if (value === undefined) {
      this.cache.delete(key);
    }

    return value;
  }
}
```

#### 💡 原理说明

**常见的内存泄漏来源**：

1. **意外全局变量**：忘记 `var`/`let`/`const`
2. **未清理的定时器**：`setInterval` 持续运行
3. **未移除的事件监听**：DOM 事件、自定义事件
4. **无限增长的缓存**：没有大小限制或过期策略
5. **闭包引用**：不必要的变量被闭包捕获

**垃圾回收的关键**：

- 对象是否可从根对象（全局对象）访问
- 即使只有一处引用，对象也不会被回收

#### 🛡️ 防御措施

- **使用严格模式**：`'use strict'` 防止意外全局变量
- **提供清理 API**：组件/模块应该有 `destroy()`、`cleanup()` 方法
- **使用 WeakMap/WeakSet**：非必需的关联数据
- **限制缓存大小**：实现 LRU 或 TTL 策略
- **代码审查**：检查事件监听和定时器的清理

---

### 7.3 事件监听器泄漏

#### ❌ 错误代码

```javascript
// React 组件中常见的错误
class MyComponent extends React.Component {
  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll);
    // ❌ 没有在 componentWillUnmount 中移除
  }

  handleScroll = () => {
    this.setState({ scrollY: window.scrollY });
  }
}

// 重复添加监听器
function setupHandler() {
  document.addEventListener('click', handleClick);
}

setupHandler();
setupHandler(); // ❌ 同一个处理器被添加了两次

// 内联函数导致无法移除
function problematic() {
  document.addEventListener('click', function(e) {
    console.log(e);
  });
  // ❌ 无法引用这个函数来移除监听器
}

// SPA 中的路由切换泄漏
class Router {
  navigate(route) {
    const handler = () => this.handleRoute(route);
    window.addEventListener('popstate', handler);
    // ❌ 每次导航都添加新监听器，从不移除旧的
  }
}

// 第三方库的监听器未清理
function useLibrary() {
  const instance = new ThirdPartyLibrary();
  instance.on('event', () => {});
  // ❌ 组件卸载时可能泄漏
}
```

#### ✅ 正确代码

```javascript
// React 函数组件使用 hooks
import { useEffect } from 'react';

function MyComponent() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);

    window.addEventListener('scroll', handleScroll);

    // ✅ 清理函数
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
}

// React 类组件正确写法
class MyComponent extends React.Component {
  componentDidMount() {
    this.handleScroll = this.handleScroll.bind(this);
    window.addEventListener('scroll', this.handleScroll);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  }

  handleScroll() {
    this.setState({ scrollY: window.scrollY });
  }
}

// 防止重复添加
class EventManager {
  constructor() {
    this.listeners = new Map();
  }

  add(target, event, handler) {
    const key = `${event}-${handler}`;

    if (this.listeners.has(key)) {
      console.warn('Listener already added');
      return;
    }

    target.addEventListener(event, handler);
    this.listeners.set(key, { target, event, handler });
  }

  remove(target, event, handler) {
    const key = `${event}-${handler}`;
    const listener = this.listeners.get(key);

    if (listener) {
      target.removeEventListener(event, handler);
      this.listeners.delete(key);
    }
  }

  removeAll() {
    this.listeners.forEach(({ target, event, handler }) => {
      target.removeEventListener(event, handler);
    });
    this.listeners.clear();
  }
}

// 使用 AbortController
function setupWithAbortController() {
  const controller = new AbortController();

  window.addEventListener('resize', handleResize, {
    signal: controller.signal
  });

  window.addEventListener('scroll', handleScroll, {
    signal: controller.signal
  });

  // 一次性移除所有监听器
  return () => controller.abort();
}

// Vue 3 组合式函数示例
import { onMounted, onUnmounted } from 'vue';

export function useEventListener(target, event, handler) {
  onMounted(() => {
    target.addEventListener(event, handler);
  });

  onUnmounted(() => {
    target.removeEventListener(event, handler);
  });
}

// 用于第三方库的包装
class SafeWrapper {
  constructor() {
    this.instance = new ThirdPartyLibrary();
    this.cleanupFns = [];
  }

  on(event, handler) {
    this.instance.on(event, handler);

    this.cleanupFns.push(() => {
      this.instance.off(event, handler);
    });
  }

  destroy() {
    this.cleanupFns.forEach(fn => fn());
    this.cleanupFns = [];

    if (this.instance.destroy) {
      this.instance.destroy();
    }
  }
}
```

#### 💡 原理说明

**事件监听器泄漏的本质**：

- 监听器函数被 DOM 元素引用
- 如果监听器闭包了其他对象，那些对象也无法回收
- 在 SPA 中，路由切换时组件销毁但监听器未清理

**清理的关键时机**：

- 组件卸载（`componentWillUnmount`、`useEffect` 清理函数）
- 路由切换
- 对象销毁

#### 🛡️ 防御措施

- **框架生命周期**：利用 React/Vue/Angular 的清理机制
- **集中管理**：使用 EventManager 类统一管理
- **AbortController**：现代浏览器支持，一次性清理多个监听器
- **代码审查**：检查每个 `addEventListener` 是否有对应的 `remove`

---

## 8. 模块化陷阱

### 8.1 循环依赖

#### ❌ 错误代码

```javascript
// a.js
import { b } from './b.js';

export const a = {
  name: 'A',
  useB: () => b.doSomething()
};

console.log('A loading, b is:', b); // 可能是 undefined

// b.js
import { a } from './a.js';

export const b = {
  name: 'B',
  useA: () => a.doSomething()
};

console.log('B loading, a is:', a); // 可能是 undefined

// 运行结果：其中一个可能是 undefined，导致运行时错误
```

```javascript
// CommonJS 循环依赖问题
// a.js
const b = require('./b');

module.exports = {
  name: 'A',
  getB: () => b
};

// b.js
const a = require('./a'); // 此时 a 是空对象 {}

module.exports = {
  name: 'B',
  getA: () => a // 返回的是 {}，不是完整的 A
};
```

#### ✅ 正确代码

```javascript
// 方案1：重新组织代码，消除循环
// types.js - 共享的类型/常量
export const TYPES = {
  A: 'A',
  B: 'B'
};

// a.js
import { TYPES } from './types.js';

export const a = {
  name: 'A',
  type: TYPES.A,
  doSomething() {
    return 'A doing something';
  }
};

// b.js
import { TYPES } from './types.js';

export const b = {
  name: 'B',
  type: TYPES.B,
  doSomething() {
    return 'B doing something';
  }
};

// main.js - 在运行时组合
import { a } from './a.js';
import { b } from './b.js';

a.useB = () => b.doSomething();
b.useA = () => a.doSomething();

// 方案2：延迟加载
// a.js
export const a = {
  name: 'A',
  async useB() {
    const { b } = await import('./b.js');
    return b.doSomething();
  }
};

// b.js
export const b = {
  name: 'B',
  async useA() {
    const { a } = await import('./a.js');
    return a.doSomething();
  }
};

// 方案3：依赖注入
// a.js
export function createA(b) {
  return {
    name: 'A',
    useB: () => b.doSomething()
  };
}

// b.js
export function createB(a) {
  return {
    name: 'B',
    useA: () => a.doSomething()
  };
}

// main.js
import { createA } from './a.js';
import { createB } from './b.js';

const a = createA({
  doSomething: () => 'B doing something'
});

const b = createB({
  doSomething: () => 'A doing something'
});

// 完整初始化后互相注入
const fullA = createA(b);
const fullB = createB(fullA);

// 方案4：事件总线/发布订阅
// eventBus.js
export const eventBus = {
  listeners: new Map(),
  on(event, handler) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(handler);
  },
  emit(event, data) {
    this.listeners.get(event)?.forEach(handler => handler(data));
  }
};

// a.js
import { eventBus } from './eventBus.js';

export const a = {
  name: 'A',
  init() {
    eventBus.on('b:action', () => {
      console.log('A received B action');
    });
  },
  doSomething() {
    eventBus.emit('a:action', { from: 'A' });
  }
};

// b.js
import { eventBus } from './eventBus.js';

export const b = {
  name: 'B',
  init() {
    eventBus.on('a:action', (data) => {
      console.log('B received:', data);
    });
  },
  doSomething() {
    eventBus.emit('b:action', { from: 'B' });
  }
};
```

#### 💡 原理说明

**循环依赖的问题**：

1. **初始化顺序不确定**：ES 模块会尝试解决，但可能导致 `undefined`
2. **部分初始化**：CommonJS 中，循环依赖的模块得到的是不完整的导出
3. **难以维护**：代码耦合度高，难以理解依赖关系

**检测循环依赖**：

```bash
# 使用工具检测
npx madge --circular .
npx dependency-cruiser --config .dependency-cruiser.js src
```

#### 🛡️ 防御措施

- **重构代码**：提取共享代码到第三个模块
- **依赖注入**：通过参数传递依赖，而非静态导入
- **延迟加载**：使用动态 `import()` 在需要时加载
- **事件驱动**：使用事件总线解耦模块

---

### 8.2 动态导入误用

#### ❌ 错误代码

```javascript
// 在循环中动态导入
async function loadItems(itemIds) {
  const items = [];
  for (const id of itemIds) {
    // ❌ 串行加载，性能差
    const module = await import(`./items/${id}.js`);
    items.push(module.default);
  }
  return items;
}

// 没有错误处理的动态导入
function loadPlugin() {
  import('./heavy-plugin.js').then(plugin => {
    plugin.initialize();
  });
  // ❌ 加载失败没有处理，后续代码可能出错
}

// 重复导入
async function process() {
  const a = await import('./utils.js');
  // ... 其他代码
  const b = await import('./utils.js'); // ❌ 重复导入
  // a 和 b 是同一个模块，但代码不清晰
}

// 在条件外暴露动态导入的模块
let sharedModule;

async function init() {
  if (shouldLoadFeature) {
    sharedModule = await import('./feature.js');
  }
}

function useFeature() {
  // ❌ 可能没有检查 sharedModule 是否存在
  sharedModule.doSomething();
}

// 使用变量路径可能导致所有文件被打包
function dynamicLoad(moduleName) {
  return import(`./modules/${moduleName}.js`);
  // ❌ 如果不配置，打包工具可能包含所有 ./modules/ 下的文件
}
```

#### ✅ 正确代码

```javascript
// 并行加载
async function loadItemsParallel(itemIds) {
  const imports = itemIds.map(id =>
    import(`./items/${id}.js`)
      .then(m => m.default)
      .catch(err => {
        console.error(`Failed to load ${id}:`, err);
        return null;
      })
  );

  const items = await Promise.all(imports);
  return items.filter(item => item !== null);
}

// 完整的错误处理
async function loadPluginSafe() {
  try {
    const plugin = await import('./heavy-plugin.js');

    if (typeof plugin.initialize !== 'function') {
      throw new Error('Plugin missing initialize method');
    }

    await plugin.initialize();
    return plugin;
  } catch (err) {
    console.error('Failed to load plugin:', err);
    // 提供降级方案
    return loadFallbackPlugin();
  }
}

// 预加载关键模块
function preloadCriticalModules() {
  const preloadLink = document.createElement('link');
  preloadLink.rel = 'modulepreload';
  preloadLink.href = '/modules/critical.js';
  document.head.appendChild(preloadLink);
}

// 使用顶层 await 的模块模式
// config-loader.js
const { default: config } = await import('./config.js');
export { config };

// 条件导入的正确处理
class FeatureLoader {
  #featureModule = null;

  async initialize() {
    if (this.shouldLoadFeature()) {
      this.#featureModule = await import('./feature.js');
    }
  }

  useFeature() {
    if (!this.#featureModule) {
      throw new Error('Feature not loaded. Call initialize() first.');
    }
    return this.#featureModule.doSomething();
  }

  isFeatureAvailable() {
    return this.#featureModule !== null;
  }
}

// 智能代码分割
// 使用魔法注释控制打包
async function loadDashboard() {
  const { Dashboard } = await import(
    /* webpackChunkName: "dashboard" */
    /* webpackPrefetch: true */
    './Dashboard.js'
  );
  return new Dashboard();
}

async function loadAdminPanel() {
  const { AdminPanel } = await import(
    /* webpackChunkName: "admin" */
    /* webpackPreload: true */
    './AdminPanel.js'
  );
  return new AdminPanel();
}

// 导入缓存复用
const moduleCache = new Map();

async function loadCached(modulePath) {
  if (moduleCache.has(modulePath)) {
    return moduleCache.get(modulePath);
  }

  const modulePromise = import(modulePath);
  moduleCache.set(modulePath, modulePromise);

  return modulePromise;
}

// 超时控制
async function importWithTimeout(path, timeoutMs = 5000) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Import timeout')), timeoutMs)
  );

  return Promise.race([import(path), timeout]);
}
```

#### 💡 原理说明

**动态导入的工作原理**：

- 返回 Promise，解析为模块命名空间对象
- 支持字符串模板，但路径需要是静态可分析的
- 可以配合打包工具实现代码分割

**性能考虑**：

- 串行 vs 并行：多个独立导入应该并行
- 预加载：`modulepreload` 提前加载关键模块
- 预获取：`prefetch` 在空闲时加载可能需要的模块

#### 🛡️ 防御措施

- **并行加载**：使用 `Promise.all` 加载多个独立模块
- **错误处理**：始终使用 try-catch 处理导入失败
- **加载状态管理**：跟踪模块是否已加载
- **打包工具配置**：合理使用魔法注释控制代码分割

---

### 8.3 Tree Shaking 问题

#### ❌ 错误代码

```javascript
// 导出整个对象，导致全部被打包
// utils.js
export default {
  helper1() { /* ... */ },
  helper2() { /* ... */ },
  helper3() { /* 很大且很少使用 */ }
};

// 使用时
import utils from './utils.js';
utils.helper1(); // 即使只用了一个，全部被打包

// 副作用导入
import 'some-library'; // ❌ 整个库被打包，即使没有直接使用

// 动态属性访问阻止 tree shaking
import * as utils from './utils.js';
const methodName = 'helper' + '1';
utils[methodName](); // ❌ 无法静态分析，保留所有导出

// 在类中使用副作用
// @decorator  // ❌ 装饰器可能有副作用
class MyClass {
  @observable  // 可能阻止 tree shaking
  property = 'value';
}

// 错误使用 lodash
import _ from 'lodash'; // ❌ 整个 lodash 被打包
_.pick(obj, ['a', 'b']);

// 直接修改导入的对象
import { config } from './config.js';
config.debug = true; // ❌ 可能有副作用，阻止优化
```

#### ✅ 正确代码

```javascript
// 具名导出
// utils.js
export function helper1() { /* ... */ }
export function helper2() { /* ... */ }
export function helper3() { /* ... */ }

// 使用时只打包需要的
import { helper1 } from './utils.js';
helper1();

// 显式标记无副作用
// package.json
{
  "sideEffects": false
}

// 或有特定副作用文件
{
  "sideEffects": [
    "*.css",
    "*.scss",
    "./src/polyfills.js"
  ]
}

// 按需导入库
// lodash - 使用 lodash-es
import { pick, omit } from 'lodash-es';

// 或者使用特定路径
import pick from 'lodash/pick';

// 使用 babel-plugin-lodash 或 lodash-webpack-plugin

// 动态导入大型组件
async function loadHeavyComponent() {
  const { HeavyComponent } = await import('./HeavyComponent.js');
  return HeavyComponent;
}

// 使用 Pure 注解提示无副作用
/** @__PURE__ */
export const pureFunction = () => {
  return someCalculation();
};

// 避免动态属性访问
import { helper1, helper2 } from './utils.js';

const helpers = {
  method1: helper1,
  method2: helper2
};

const methodName = 'method1';
helpers[methodName](); // ✅ 显式映射，tree shaking 可以工作

// 使用 ES 模块的 re-export 模式
// index.js
export { helper1 } from './helper1.js';
export { helper2 } from './helper2.js';
export { helper3 } from './helper3.js';

// 配置 webpack 优化
// webpack.config.js
module.exports = {
  optimization: {
    usedExports: true,  // 标记未使用的导出
    sideEffects: false,  // 假设没有副作用
    concatenateModules: true  // 模块连接
  }
};

// 使用 Rollup/Vite 的优化
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // 将大型依赖分离
          'vendor': ['lodash-es', 'date-fns']
        }
      }
    }
  }
};

// 类型安全的 tree shaking
// types.ts
export type { User } from './User.js';
export type { Order } from './Order.js';

// 类型导入使用 import type
import type { User } from './types.js'; // ✅ 不会生成运行时代码
import { createUser } from './types.js'; // 运行时导入
```

#### 💡 原理说明

**Tree Shaking 的工作原理**：

1. **静态分析**：构建时分析导入/导出依赖关系
2. **标记清除**：标记未被使用的导出
3. **死代码消除**：移除未使用的代码

**影响 Tree Shaking 的因素**：

- **副作用**：无法确定是否安全的代码
- **动态导入**：运行时才能确定的导入
- **CommonJS**：动态性质难以静态分析
- `eval()` 和动态代码执行

#### 🛡️ 防御措施

- **使用 ES 模块**：优先使用 `import`/`export`
- **配置 sideEffects**：在 package.json 中明确标记
- **避免默认导出对象**：使用具名导出
- **按需导入库**：使用库的 ES 模块版本
- **分析打包结果**：使用 `webpack-bundle-analyzer`

---

## 9. 性能陷阱

### 9.1 大数组操作

#### ❌ 错误代码

```javascript
// 大数据集的链式操作
const largeArray = new Array(1000000).fill(0).map((_, i) => i);

// ❌ 多次遍历，创建多个临时数组
const result = largeArray
  .filter(x => x % 2 === 0)
  .map(x => x * 2)
  .filter(x => x > 100)
  .slice(0, 10);

// 在循环中使用数组方法
function findDuplicates(arr) {
  const duplicates = [];
  for (let i = 0; i < arr.length; i++) {
    // ❌ indexOf 每次都要遍历数组
    if (arr.indexOf(arr[i]) !== i) {
      duplicates.push(arr[i]);
    }
  }
  return duplicates;
}

// 大数组展开
const huge1 = new Array(500000).fill(1);
const huge2 = new Array(500000).fill(2);
// ❌ 可能栈溢出或内存问题
const combined = [...huge1, ...huge2];

// 使用 concat 大数组
let result = [];
for (const arr of arrays) {
  // ❌ 每次 concat 都创建新数组
  result = result.concat(arr);
}

// 排序比较函数错误
const items = [{ value: 10 }, { value: 2 }, { value: 5 }];
items.sort((a, b) => a.value > b.value); // ❌ 应该返回数字，不是布尔值

// 在排序中使用复杂计算
items.sort((a, b) => {
  // ❌ 每次比较都重新计算
  return expensiveCalculation(a) - expensiveCalculation(b);
});
```

#### ✅ 正确代码

```javascript
// 单次遍历处理多个操作
function processLargeArray(arr) {
  const result = [];
  let count = 0;

  for (let i = 0; i < arr.length && count < 10; i++) {
    const x = arr[i];
    if (x % 2 === 0) {
      const doubled = x * 2;
      if (doubled > 100) {
        result.push(doubled);
        count++;
      }
    }
  }

  return result;
}

// 使用生成器处理大数据流
function* processStream(arr) {
  for (const x of arr) {
    if (x % 2 === 0) {
      const doubled = x * 2;
      if (doubled > 100) {
        yield doubled;
      }
    }
  }
}

// 取前10个
const result = [...processStream(largeArray)].slice(0, 10);

// 使用 Set 进行快速查找
function findDuplicatesFast(arr) {
  const seen = new Set();
  const duplicates = new Set();

  for (const item of arr) {
    if (seen.has(item)) {
      duplicates.add(item);
    } else {
      seen.add(item);
    }
  }

  return [...duplicates];
}

// 大数组合并 - 使用 push
function combineArrays(arrays) {
  // 预分配容量
  const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
  const result = new Array(totalLength);

  let index = 0;
  for (const arr of arrays) {
    for (let i = 0; i < arr.length; i++) {
      result[index++] = arr[i];
    }
  }

  return result;
}

// TypedArray 处理数值数据
const numbers = new Float64Array(1000000);
// 处理大数值数据集更高效

// 正确的排序比较函数
items.sort((a, b) => a.value - b.value);

// 预计算排序键（施瓦茨变换）
const itemsWithKey = items.map(item => ({
  item,
  key: expensiveCalculation(item)
}));

itemsWithKey.sort((a, b) => a.key - b.key);
const sortedItems = itemsWithKey.map(({ item }) => item);

// 批量处理避免阻塞
async function processInBatches(arr, batchSize = 1000) {
  const results = [];

  for (let i = 0; i < arr.length; i += batchSize) {
    const batch = arr.slice(i, i + batchSize);
    const batchResults = batch.map(processItem);
    results.push(...batchResults);

    // 让出事件循环
    if (i + batchSize < arr.length) {
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }

  return results;
}

// 使用 Web Worker 处理大数据
// main.js
const worker = new Worker('worker.js');

worker.postMessage({ data: largeArray }, [largeArray.buffer]); // 转移所有权

worker.onmessage = (e) => {
  console.log('Processed:', e.data);
};

// worker.js
self.onmessage = (e) => {
  const { data } = e.data;
  const result = heavyProcessing(data);
  self.postMessage(result, [result.buffer]);
};
```

#### 💡 原理说明

**大数组操作的成本**：

- **时间复杂度**：`O(n)` 遍历 vs `O(n²)` 嵌套循环
- **空间复杂度**：每次 `map`/`filter` 创建新数组
- **内存分配**：频繁分配释放大数组导致 GC 压力

**优化策略**：

1. **单次遍历**：合并多个操作减少遍历次数
2. **使用 Set/Map**：`O(1)` 查找替代 `O(n)`
3. **预分配**：知道大小时预分配数组容量
4. **TypedArray**：数值数据的内存高效处理
5. **分块处理**：避免长时间阻塞主线程

#### 🛡️ 防御措施

- **算法优化**：选择正确的数据结构和算法
- **批量处理**：大数据集分块处理，保持 UI 响应
- **性能分析**：使用 Chrome DevTools Performance 面板
- **基准测试**：使用 `console.time()` 或 benchmark.js

---

### 9.2 DOM 操作优化

#### ❌ 错误代码

```javascript
// 频繁的 DOM 读写交替
function updateList(items) {
  const list = document.getElementById('list');

  items.forEach((item, index) => {
    const li = document.createElement('li');
    li.textContent = item.name;
    list.appendChild(li); // ❌ 每次都会触发重排

    // 强制同步布局
    const height = list.offsetHeight; // ❌ 读取强制立即重排
  });
}

// 多次修改样式
const element = document.getElementById('box');
element.style.width = '100px';  // 重排
element.style.height = '100px'; // 重排
element.style.margin = '10px';  // 重排

// 在循环中访问 offsetHeight
for (let i = 0; i < elements.length; i++) {
  // ❌ 强制布局抖动 (Layout Thrashing)
  const height = elements[i].offsetHeight;
  elements[i].style.height = (height + 10) + 'px';
}

// 事件处理器中高频更新
window.addEventListener('scroll', () => {
  // ❌ 每帧都更新 DOM
  document.getElementById('position').textContent = window.scrollY;
});

// 大量事件监听器
document.querySelectorAll('.item').forEach(item => {
  item.addEventListener('click', handleClick); // ❌ 每个元素都绑定
});
```

#### ✅ 正确代码

```javascript
// 使用文档片段批量插入
function updateListFast(items) {
  const list = document.getElementById('list');
  const fragment = document.createDocumentFragment();

  items.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item.name;
    fragment.appendChild(li);
  });

  // 单次 DOM 操作
  list.appendChild(fragment);
}

// 使用模板字符串批量构建 HTML
function updateListHTML(items) {
  const list = document.getElementById('list');
  const html = items.map(item => `<li>${escapeHtml(item.name)}</li>`).join('');
  list.innerHTML = html; // 注意：注意 XSS 风险，确保数据已转义
}

// 批量读写分离
// ❌ 坏的：交替读写
// ✅ 好的：先读后写
function batchUpdate(elements) {
  // 第一阶段：读取所有值
  const heights = elements.map(el => ({
    element: el,
    height: el.offsetHeight
  }));

  // 第二阶段：批量写入
  heights.forEach(({ element, height }) => {
    element.style.height = (height + 10) + 'px';
  });
}

// 使用 requestAnimationFrame
let pendingUpdate = null;

function scheduleUpdate(value) {
  if (pendingUpdate) return;

  pendingUpdate = requestAnimationFrame(() => {
    document.getElementById('position').textContent = value;
    pendingUpdate = null;
  });
}

window.addEventListener('scroll', () => {
  scheduleUpdate(window.scrollY);
});

// 使用防抖/节流
function throttle(fn, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

window.addEventListener('scroll', throttle(() => {
  updatePosition(window.scrollY);
}, 16)); // ~60fps

// 事件委托
document.getElementById('list').addEventListener('click', (e) => {
  if (e.target.matches('.item')) {
    handleItemClick(e.target);
  }
});

// 使用 CSS 类批量修改样式
// CSS
.box-expanded {
  width: 100px;
  height: 100px;
  margin: 10px;
}

// JS
element.classList.add('box-expanded'); // 单次重排

// 使用 will-change 提示浏览器
const animated = document.getElementById('animated');
animated.style.willChange = 'transform, opacity';

// 动画结束后移除
animated.addEventListener('transitionend', () => {
  animated.style.willChange = 'auto';
});

// 虚拟滚动处理大量列表
class VirtualScroller {
  constructor(container, itemHeight, totalItems) {
    this.container = container;
    this.itemHeight = itemHeight;
    this.totalItems = totalItems;
    this.visibleCount = Math.ceil(container.clientHeight / itemHeight);

    this.setup();
  }

  setup() {
    // 创建占位元素
    const spacer = document.createElement('div');
    spacer.style.height = `${this.totalItems * this.itemHeight}px`;
    this.container.appendChild(spacer);

    this.container.addEventListener('scroll', () => this.onScroll());
  }

  onScroll() {
    const scrollTop = this.container.scrollTop;
    const startIndex = Math.floor(scrollTop / this.itemHeight);

    // 只渲染可见项目
    this.renderItems(startIndex);
  }
}

// Intersection Observer 延迟加载
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      loadContent(entry.target);
      observer.unobserve(entry.target);
    }
  });
});

document.querySelectorAll('.lazy').forEach(el => observer.observe(el));
```

#### 💡 原理说明

**浏览器渲染流程**：

1. **JavaScript**：执行 JS 代码
2. **Style**：计算样式
3. **Layout**：计算布局（重排）
4. **Paint**：绘制像素（重绘）
5. **Composite**：合成图层

**强制同步布局（Layout Thrashing）**：

- 读取 `offsetHeight` 等属性会强制浏览器立即计算布局
- 如果在修改样式后立即读取，会导致额外的重排

**优化原则**：

1. **批量操作**：使用 DocumentFragment、innerHTML
2. **读写分离**：先批量读取，再批量写入
3. **使用 requestAnimationFrame**：在下一帧更新
4. **事件委托**：减少事件监听器数量
5. **虚拟滚动**：只渲染可见内容

#### 🛡️ 防御措施

- **使用 Chrome DevTools**：Performance 面板分析重排重绘
- **Lighthouse**：自动化性能检测
- **CSS Containment**：`contain: layout paint` 隔离优化
- **Web Animations API**：使用 `transform` 和 `opacity` 动画

---

### 9.3 正则表达式回溯

#### ❌ 错误代码

```javascript
// 灾难性回溯（Catastrophic Backtracking）
const badRegex = /(a+)+$/;
const input = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa!';
// 尝试匹配会耗尽所有计算资源

badRegex.test(input); // 可能永远不会完成

// 嵌套量词
const nestedQuantifier = /(a*)*$/;

// 贪婪量词配合模糊匹配
const greedy = /<.*>/; // 匹配 HTML 标签，但可能回溯严重
const html = '<tag>content</tag><tag>more</tag>';
greedy.exec(html); // 匹配整个字符串，然后回溯

// 多个交替的复杂模式
const complex = /(a|a?|a*)+$/;

// 没有锚点的模式
const noAnchor = /(\d+)+/;
// 在大量数字上可能回溯

// 验证邮箱的糟糕正则
const badEmail = /^([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})+$/;
// 量词嵌套 + 贪婪匹配
```

#### ✅ 正确代码

```javascript
// 使用 possessive 量词（在支持的引擎中）
// JavaScript 不支持，但可以模拟
const betterRegex = /(?>a+)$/; // 原子组，不回溯

// JavaScript 中的替代方案
const jsRegex = /(?=(a+))\1$/; // 使用前瞻捕获

// 限制输入长度
function safeTest(regex, input, maxLength = 1000) {
  if (input.length > maxLength) {
    throw new Error('Input too long');
  }
  return regex.test(input);
}

// 非贪婪量词
const nonGreedy = /<.*?>/; // 最小匹配
nonGreedy.exec(html); // 只匹配 '<tag>'

// 使用具体字符类
const specific = /<[^>]*>/; // 匹配到 > 就停止

// 原子化分组（使用 lookahead + backreference）
function atomic(pattern) {
  return new RegExp(`(?=(${pattern}))\\1`);
}

// 正则超时封装
function regexTimeout(pattern, input, timeoutMs = 1000) {
  return new Promise((resolve, reject) => {
    const worker = new Worker('regex-worker.js');

    const timer = setTimeout(() => {
      worker.terminate();
      reject(new Error('Regex timeout'));
    }, timeoutMs);

    worker.onmessage = (e) => {
      clearTimeout(timer);
      worker.terminate();
      resolve(e.data);
    };

    worker.postMessage({ pattern: pattern.source, input, flags: pattern.flags });
  });
}

// 优化的 HTML 标签匹配
const optimizedTag = /<[a-zA-Z][^>]*>/;

// 更安全的邮箱验证（分步验证）
function validateEmail(email) {
  // 快速长度检查
  if (email.length > 254) return false;

  // 简单预检查
  if (!email.includes('@')) return false;

  // 分步验证，不使用复杂嵌套正则
  const [local, domain] = email.split('@');

  if (!local || local.length > 64) return false;
  if (!domain || domain.length > 255) return false;

  // 使用更简单的正则分别验证
  const localValid = /^[a-zA-Z0-9._%+-]+$/.test(local);
  const domainValid = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(domain);

  return localValid && domainValid;
}

// 使用 RE2 引擎（Node.js）
// const RE2 = require('re2');
// const re = new RE2('(a+)+$');
// re.test(input); // RE2 保证线性时间

// 预编译正则
const compiledCache = new Map();

function getCompiled(pattern, flags) {
  const key = `${pattern}-${flags}`;
  if (!compiledCache.has(key)) {
    compiledCache.set(key, new RegExp(pattern, flags));
  }
  return compiledCache.get(key);
}

// 使用字符串操作替代正则
function extractBetween(str, start, end) {
  const startIdx = str.indexOf(start);
  if (startIdx === -1) return null;

  const endIdx = str.indexOf(end, startIdx + start.length);
  if (endIdx === -1) return null;

  return str.slice(startIdx + start.length, endIdx);
}
```

#### 💡 原理说明

**正则回溯的原理**：

- 正则引擎尝试匹配时，记录选择点（alternation、quantifier）
- 匹配失败时，回溯到上一个选择点尝试其他路径
- 嵌套量词会导致指数级增长的尝试路径

**灾难性回溯的模式**：

- `(a+)+`、`(a*)*`：嵌套量词
- `(a|aa)+`：交替项有共同前缀
- 没有锚点的全局匹配

**优化策略**：

1. **非贪婪量词**：`.*?` 替代 `.*`
2. **字符类限制**：`[^>]*` 替代 `.*`
3. **输入长度限制**：拒绝过长的输入
4. **超时机制**：防止无限运行
5. **专用引擎**：使用 RE2 等线性时间引擎

#### 🛡️ 防御措施

- **使用工具检测**：`safe-regex` npm 包检测危险模式
- **输入验证**：限制长度、预检查
- **超时机制**：包装正则执行
- **替代方案**：简单解析使用字符串操作，复杂解析使用专业解析器

---

## 10. 安全陷阱

### 10.1 XSS（跨站脚本攻击）

#### ❌ 错误代码

```javascript
// 直接插入用户输入到 HTML
const userInput = '<img src=x onerror=alert("XSS")>';
element.innerHTML = userInput; // ❌ 执行恶意代码

// 使用 document.write
document.write(userInput); // ❌ 同样危险

// 不安全的 URL 处理
const url = userInput; // javascript:alert('XSS')
location.href = url;

// React 中的 dangerouslySetInnerHTML
function Component({ content }) {
  return <div dangerouslySetInnerHTML={{ __html: content }} />; // ❌ 危险
}

// Vue 中的 v-html
// <div v-html="userContent"></div> // ❌ 危险

// 使用 eval
const userCode = 'alert(document.cookie)';
eval(userCode); // ❌ 执行任意代码

// 不安全的模板字符串
const template = `<div>${userInput}</div>`;
// 如果 userInput 包含 </div><script>...

// 存储型 XSS
localStorage.setItem('username', userInput);
// 稍后显示
element.textContent = localStorage.getItem('username'); // ✅ 安全
// 但如果后来改为 innerHTML 就会出问题
```

#### ✅ 正确代码

```javascript
// 使用 textContent（自动转义）
element.textContent = userInput; // ✅ 安全，显示为纯文本

// 创建元素并设置文本
const div = document.createElement('div');
div.textContent = userInput;
element.appendChild(div);

// HTML 转义函数
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// 或者手动转义
function escapeHtmlManual(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// 安全的 URL 验证
function isSafeUrl(url) {
  try {
    const parsed = new URL(url, window.location.href);
    // 只允许 http 和 https
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

function navigateTo(url) {
  if (isSafeUrl(url)) {
    window.location.href = url;
  } else {
    console.error('Unsafe URL rejected');
  }
}

// DOMPurify 库
// import DOMPurify from 'dompurify';
// const clean = DOMPurify.sanitize(dirtyHtml);

// CSP（内容安全策略）
// HTTP Header: Content-Security-Policy: default-src 'self'; script-src 'self'

// 使用模板引擎的自动转义
// Handlebars: {{userInput}} 自动转义
// Mustache: {{userInput}} 自动转义
// EJS: <%= userInput %> 自动转义

// React 安全实践
function SafeComponent({ content }) {
  // ✅ 自动转义
  return <div>{content}</div>;
}

// 必须使用时进行净化
function DangerousComponent({ html }) {
  const sanitized = DOMPurify.sanitize(html);
  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
}

// Vue 安全实践
// ✅ 使用 {{ }} 自动转义
// <div>{{ userContent }}</div>

// 输入验证和清理
function validateInput(input, type) {
  const validators = {
    username: /^[a-zA-Z0-9_-]{3,20}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    // 不使用复杂的嵌套正则
  };

  const validator = validators[type];
  return validator ? validator.test(input) : false;
}

// 安全的 JSON 处理
function safeJsonParse(str) {
  try {
    // 使用 reviver 清理
    return JSON.parse(str, (key, value) => {
      if (typeof value === 'string') {
        // 检查潜在的脚本
        if (/[<>]/.test(value)) {
          console.warn('Potentially dangerous content in JSON');
        }
      }
      return value;
    });
  } catch (e) {
    return null;
  }
}
```

#### 💡 原理说明

**XSS 攻击类型**：

1. **反射型**：恶意 URL 参数，诱导用户点击
2. **存储型**：恶意数据存入数据库，影响所有用户
3. **DOM 型**：前端 JavaScript 处理不当导致

**攻击向量**：

- `<script>alert(1)</script>`
- `<img src=x onerror=alert(1)>`
- `javascript:alert(1)` URL
- SVG、MathML 中的脚本
- 事件处理器：`onclick` 等

#### 🛡️ 防御措施

- **转义输出**：所有用户输入在插入 HTML 前转义
- **CSP**：限制脚本来源，禁止内联脚本
- **输入验证**：白名单验证输入格式
- **HttpOnly Cookie**：防止 JavaScript 访问敏感 Cookie
- **现代框架**：React、Vue 自动转义文本内容

---

### 10.2 CSRF（跨站请求伪造）

#### ❌ 错误代码

```javascript
// 没有 CSRF 保护的后端 API
// POST /api/transfer-money
// Body: { to: 'attacker', amount: 1000 }
// 攻击者可以在其他网站提交这个请求

// 依赖 Cookie 自动发送
fetch('/api/delete-account', {
  method: 'POST',
  credentials: 'include' // ❌ 如果没有 CSRF 保护，恶意网站可以调用
});

// 不验证请求来源
app.post('/api/update-email', (req, res) => {
  // ❌ 没有检查请求是否来自自己的网站
  updateEmail(req.body.email);
});

// 简单的 GET 请求执行敏感操作
app.get('/api/logout', (req, res) => {
  req.session.destroy(); // ❌ GET 请求不应该有副作用
});

// 依赖 Referer 检查（不可靠）
app.post('/api/action', (req, res) => {
  const referer = req.headers.referer;
  if (referer && referer.includes('mysite.com')) {
    // ❌ Referer 可以被禁用或伪造
    performAction(req.body);
  }
});
```

#### ✅ 正确代码

```javascript
// 前端：为每个请求添加 CSRF Token
async function apiCall(endpoint, data) {
  const csrfToken = document.querySelector('meta[name="csrf-token"]').content;

  return fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken
    },
    credentials: 'include',
    body: JSON.stringify(data)
  });
}

// 后端：生成和验证 CSRF Token
// Express + csurf 中间件
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

app.get('/form', csrfProtection, (req, res) => {
  res.render('form', { csrfToken: req.csrfToken() });
});

app.post('/api/action', csrfProtection, (req, res) => {
  // ✅ Token 已验证
  performAction(req.body);
});

// 双重 Cookie 提交模式
// 前端自动发送
async function apiCallDoubleCookie(endpoint, data) {
  return fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    },
    credentials: 'include', // 发送 Cookie
    body: JSON.stringify(data)
  });
}

// 后端验证 SameSite Cookie
// Set-Cookie: session=abc123; SameSite=Strict; Secure; HttpOnly

// SameSite Cookie（现代浏览器）
// Set-Cookie: session=abc123; SameSite=Lax
// Lax: 允许 GET 请求跨站，阻止 POST/PUT/DELETE
// Strict: 完全阻止跨站请求
// None: 允许跨站（需要 Secure）

// 验证 Origin/Referer
app.post('/api/sensitive', (req, res) => {
  const origin = req.headers.origin || req.headers.referer;

  if (!origin || !origin.startsWith('https://mysite.com')) {
    return res.status(403).json({ error: 'Invalid origin' });
  }

  performSensitiveAction(req.body);
});

// 自定义请求头（简单有效）
fetch('/api/action', {
  method: 'POST',
  headers: {
    'X-Requested-With': 'XMLHttpRequest' // 跨站请求无法设置此头
  },
  credentials: 'include'
});

// CORS 配置
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://mysite.com');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, X-CSRF-Token');
  next();
});

// 敏感操作需要重新验证
app.post('/api/transfer', async (req, res) => {
  const { password, ...transferData } = req.body;

  // 重新验证密码
  const valid = await verifyPassword(req.user.id, password);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid password' });
  }

  performTransfer(transferData);
});
```

#### 💡 原理说明

**CSRF 攻击原理**：

1. 用户登录网站 A，Cookie 保存在浏览器
2. 用户访问恶意网站 B
3. 网站 B 自动向网站 A 发送请求（图片、表单、fetch）
4. 浏览器自动附上网站 A 的 Cookie
5. 网站 A 认为是合法用户操作

**防御层次**：

1. **CSRF Token**：服务器生成的随机值，嵌入表单和验证
2. **SameSite Cookie**：浏览器级别的跨站请求控制
3. **Origin 验证**：验证请求来源
4. **自定义 Header**：跨站请求无法设置自定义 Header
5. **CORS**：控制跨域访问

#### 🛡️ 防御措施

- **使用 SameSite Cookie**：`SameSite=Lax` 或 `Strict`
- **CSRF Token**：对状态改变请求使用 Token
- **验证 Origin**：检查 Origin/Referer Header
- **敏感操作二次确认**：密码、验证码确认
- **不使用 GET 执行操作**：GET 应该是安全的、幂等的

---

### 10.3 原型污染

#### ❌ 错误代码

```javascript
// 不安全的对象合并（经典漏洞）
function merge(target, source) {
  for (let key in source) {
    if (typeof source[key] === 'object' && source[key] !== null) {
      if (!target[key]) target[key] = {};
      merge(target[key], source[key]); // ❌ 没有检查 key
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

// 攻击 payload
const malicious = JSON.parse('{"__proto__": {"isAdmin": true}}');
merge({}, malicious);

console.log({}.isAdmin); // true ❌ 所有对象都被污染了

// 另一个攻击向量
const payload = JSON.parse('{"constructor": {"prototype": {"hacked": true}}}');
merge({}, payload);

// 使用对象展开也可能有问题
const config = {
  ...userConfig, // 如果 userConfig 包含 __proto__
  defaultOption: true
};

// lodash 的漏洞版本
// _.merge({}, JSON.parse('{"__proto__": {"polluted": true}}'));

// 不安全的属性访问
function setProperty(obj, path, value) {
  const keys = path.split('.');
  let current = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!current[key]) current[key] = {};
    current = current[key]; // ❌ 可能访问 __proto__
  }

  current[keys[keys.length - 1]] = value;
}

setProperty({}, '__proto__.isAdmin', true);
```

#### ✅ 正确代码

```javascript
// 冻结内置原型
Object.freeze(Object.prototype);
Object.freeze(Array.prototype);
Object.freeze(Function.prototype);

// 使用 Map 替代对象作为字典
const safeDict = new Map();
safeDict.set('key', 'value');
// Map 不受原型污染影响

// 使用 Object.create(null)
const nullProtoObject = Object.create(null);
nullProtoObject.key = 'value';
console.log('toString' in nullProtoObject); // false

// 安全的对象合并
function safeMerge(target, source) {
  const dangerousKeys = ['__proto__', 'constructor', 'prototype'];

  for (const key of Object.keys(source)) {
    // 拒绝危险键
    if (dangerousKeys.includes(key)) {
      console.warn(`Rejected dangerous key: ${key}`);
      continue;
    }

    const value = source[key];

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      if (!target[key] || typeof target[key] !== 'object') {
        target[key] = {};
      }
      safeMerge(target[key], value);
    } else {
      target[key] = value;
    }
  }

  return target;
}

// 更安全的方案：只复制白名单属性
function safeMergeWhitelist(target, source, allowedKeys) {
  for (const key of allowedKeys) {
    if (key in source) {
      target[key] = source[key];
    }
  }
  return target;
}

// 使用 Object.defineProperty 安全设置
function safeSetProperty(obj, key, value) {
  if (key === '__proto__' || key === 'constructor') {
    throw new Error(`Setting ${key} is not allowed`);
  }

  Object.defineProperty(obj, key, {
    value,
    writable: true,
    enumerable: true,
    configurable: true
  });
}

// 使用 schema 验证
const Joi = require('joi'); // 或其他验证库

const schema = Joi.object({
  name: Joi.string().required(),
  age: Joi.number().integer().min(0),
  // 明确允许的字段
}).unknown(false); // 拒绝未知字段

function safeAssign(target, source) {
  const { error, value } = schema.validate(source);
  if (error) throw error;

  return Object.assign(target, value);
}

// 安全的属性路径设置
function safeSetByPath(obj, path, value) {
  const keys = path.split('.');
  let current = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];

    // 安全检查
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      throw new Error(`Invalid key in path: ${key}`);
    }

    // 使用 Object.prototype.hasOwnProperty.call 安全检查
    if (!Object.prototype.hasOwnProperty.call(current, key)) {
      current[key] = {};
    }

    current = current[key];
  }

  const lastKey = keys[keys.length - 1];
  if (['__proto__', 'constructor', 'prototype'].includes(lastKey)) {
    throw new Error(`Invalid key in path: ${lastKey}`);
  }

  current[lastKey] = value;
  return obj;
}

// 使用结构化克隆（深拷贝）
function deepClone(obj) {
  // 方法1：使用 structuredClone（现代环境）
  return structuredClone(obj);

  // 方法2：JSON 方法（有限制）
  // return JSON.parse(JSON.stringify(obj));

  // 方法3：手动实现的安全深拷贝
  // 检查循环引用、处理特殊类型等
}

// 使用 immer 进行不可变更新
import produce from 'immer';

const newState = produce(state, draft => {
  draft.nested.value = 'new value';
});
// immer 内部使用 Object.defineProperty，天然免疫原型污染
```

#### 💡 原理说明

**原型污染的原理**：

- JavaScript 对象可以通过 `__proto__` 访问原型
- 修改 `__proto__` 会影响所有继承该原型的对象
- `constructor.prototype` 是另一个攻击向量

**污染的影响**：

- 所有对象获得恶意属性
- 可能绕过安全检查（`if (user.isAdmin)`）
- 应用程序逻辑被破坏

**防护层次**：

1. **输入验证**：拒绝危险键名
2. **冻结原型**：`Object.freeze(Object.prototype)`
3. **使用 Map**：不受原型污染影响
4. **Object.create(null)**：没有原型的对象

#### 🛡️ 防御措施

- **输入净化**：验证和清理所有用户输入的键名
- **使用安全库**：保持 lodash、merge 等库更新
- **代码审查**：检查所有对象合并和属性设置
- **自动化扫描**：使用安全扫描工具检测漏洞
- **冻结原型**：应用启动时冻结内置原型

---

## 总结

### 快速参考表

| 陷阱类别 | 主要风险 | 关键防御措施 |
|---------|---------|-------------|
| 类型强制转换 | 意外的类型转换结果 | 使用 `===`，显式转换 |
| this 绑定 | 上下文丢失或错误 | 箭头函数、bind、方法简写 |
| 闭包 | 内存泄漏、循环变量捕获 | let/const、IIFE、理解作用域 |
| 原型链 | 属性查找错误、原型污染 | Object.create(null)、冻结原型 |
| 异步 | 回调地狱、未处理的 Promise | async/await、错误处理 |
| 类型系统 | any 滥用、类型断言误用 | strict 模式、类型守卫 |
| 内存管理 | 循环引用、全局变量 | WeakMap、清理方法、内存分析 |
| 模块化 | 循环依赖、tree shaking | 依赖注入、sideEffects 配置 |
| 性能 | 大数组操作、DOM 操作 | 批量处理、requestAnimationFrame |
| 安全 | XSS、CSRF、原型污染 | 转义、CSP、Token、输入验证 |

### 推荐工具

- **ESLint**：代码质量和安全问题检测
- **TypeScript strict 模式**：类型安全
- **DOMPurify**：XSS 防护
- **csurf**：CSRF 防护
- **Webpack Bundle Analyzer**：打包分析
- **Lighthouse**：性能和安全审计
- **Chrome DevTools**：内存和性能分析

---

*本文档持续更新，建议定期回顾以确保代码实践符合最新安全标准。*
