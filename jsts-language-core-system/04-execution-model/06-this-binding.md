# this 绑定机制

> this 值的确定规则：调用点决定绑定对象
>
> 对齐版本：ECMAScript 2025 (ES16)

---

## 1. this 的四条绑定规则

### 1.1 默认绑定

```javascript
function showThis() {
  console.log(this);
}

showThis(); // 全局对象（非严格模式）或 undefined（严格模式）
```

### 1.2 隐式绑定

```javascript
const obj = {
  name: "Alice",
  greet() {
    console.log(`Hello, ${this.name}`);
  }
};

obj.greet(); // "Hello, Alice" — this 指向 obj
```

### 1.3 显式绑定

```javascript
function greet() {
  console.log(`Hello, ${this.name}`);
}

const person = { name: "Bob" };

greet.call(person);   // "Hello, Bob"
greet.apply(person);  // "Hello, Bob"
const bound = greet.bind(person);
bound();              // "Hello, Bob"
```

### 1.4 new 绑定

```javascript
function Person(name) {
  this.name = name;
}

const alice = new Person("Alice");
console.log(alice.name); // "Alice"
// this 指向新创建的对象
```

---

## 2. 箭头函数的 this

箭头函数**没有自己的 this**，继承外层作用域：

```javascript
const obj = {
  name: "Alice",
  regular: function() {
    console.log(this.name); // "Alice"
  },
  arrow: () => {
    console.log(this.name); // undefined（继承全局 this）
  }
};

obj.regular();
obj.arrow();
```

### 2.1 箭头函数的实用场景

```javascript
const obj = {
  name: "Alice",
  friends: ["Bob", "Carol"],
  greetFriends() {
    // 箭头函数保持 this
    this.friends.forEach(friend => {
      console.log(`${this.name} says hi to ${friend}`);
    });
  }
};

obj.greetFriends();
// "Alice says hi to Bob"
// "Alice says hi to Carol"
```

---

## 3. 隐式丢失

```javascript
const obj = {
  name: "Alice",
  greet() {
    console.log(this.name);
  }
};

const greet = obj.greet;
greet(); // undefined（this 丢失）

// 回调中的丢失
setTimeout(obj.greet, 100); // undefined
```

### 3.1 解决方案

```javascript
// 方案 1：箭头函数
const obj = {
  name: "Alice",
  greet: () => {
    console.log(this.name); // 小心！继承外层 this
  }
};

// 方案 2：bind
setTimeout(obj.greet.bind(obj), 100);

// 方案 3：包装函数
setTimeout(() => obj.greet(), 100);
```

---

## 4. 类中的 this

```javascript
class Counter {
  count = 0;

  increment() {
    this.count++;
  }

  // 自动绑定（ES2022+）
  decrement = () => {
    this.count--;
  };
}

const counter = new Counter();
const increment = counter.increment;
increment(); // ❌ this 丢失，count 不会增加

const decrement = counter.decrement;
decrement(); // ✅ 箭头函数，this 保持
```

---

## 5. 严格模式的影响

```javascript
"use strict";

function test() {
  console.log(this); // undefined（不是全局对象）
}

test();
```

严格模式下，默认绑定不会指向全局对象，而是 `undefined`。

---

## 6. this 绑定优先级

从高到低：

1. **new 绑定**（最高）
2. **显式绑定**（call/apply/bind）
3. **隐式绑定**（obj.method()）
4. **默认绑定**（最低）

```javascript
function foo() {
  console.log(this.a);
}

const obj1 = { a: 1, foo };
const obj2 = { a: 2, foo };

obj1.foo();           // 1（隐式）
obj1.foo.call(obj2);  // 2（显式覆盖隐式）
new obj1.foo();       // undefined（new 最高）
```

---

**参考规范**：ECMA-262 §10.2.1.1 OrdinaryCallBindThis

## 扩展话题：相关规范与实现细节

### 规范引用

ECMA-262 规范详细定义了本节所有机制。关键章节包括：
- §6.2.3 Completion Record 规范
- §9.1 Environment Records
- §9.4 Execution Contexts
- §10.2.1.1 OrdinaryCallBindThis

### 引擎实现差异

| 引擎 | 相关实现 |
|------|---------|
| V8 (Chrome/Node) | 快速属性访问、隐藏类优化 |
| SpiderMonkey (Firefox) | 形状(shape)系统、基线编译器 |
| JavaScriptCore (Safari) | DFG/FTL 编译器、类型推断 |

### 调试技巧

`javascript
// 使用 Chrome DevTools 检查内部状态
debugger; // 在 Sources 面板查看 Scope 链

// 使用 console.trace() 查看调用栈
function deep() {
  console.trace("Current stack");
}
`

### 常见面试题

1. 解释暂时性死区(TDZ)及其产生原因
2. var/let/const 的区别是什么？
3. 函数声明和函数表达式的提升行为有何不同？
4. 解释 this 的四种绑定规则
5. 什么是闭包？它如何工作？

### 推荐阅读

- ECMA-262 规范官方文档
- TypeScript Handbook
- You Don't Know JS (Kyle Simpson)
- JavaScript: The Definitive Guide

## 深入理解：内存模型与性能

### 内存布局

JavaScript 引擎在内存中组织对象和变量：

`
栈内存（Stack）：
  - 原始值（number, string, boolean等）
  - 函数调用帧
  - 局部变量引用

堆内存（Heap）：
  - 对象
  - 函数闭包
  - 大型数据结构
`

### V8 优化技术

| 技术 | 描述 |
|------|------|
| 隐藏类 | 为对象创建内部形状描述 |
| 内联缓存 | 缓存属性查找位置 |
| 标量替换 | 将小对象分解为局部变量 |
| 逃逸分析 | 确定对象是否离开作用域 |

### 性能基准

`javascript
// 快速属性访问（单态）
obj.x; // 优化：直接偏移访问

// 多态属性访问
if (condition) obj = { x: 1 }; else obj = { x: 2, y: 3 };
obj.x; // 降级：字典查找
`

### 垃圾回收影响

`javascript
// 减少 GC 压力
function process() {
  const data = new Array(1000000);
  // 使用 data...
  // 函数返回后，data 可被回收
}

// 避免内存泄漏
let cache = {};
// 定期清理或使用 WeakMap
`

### 最佳实践总结

1. **优先使用 const**：不可变性帮助引擎优化
2. **避免动态属性**：稳定结构利于隐藏类
3. **减少嵌套深度**：浅层作用域链查找更快
4. **使用箭头函数**：减少 this 绑定开销
5. **缓存频繁访问**：将深层属性提取到局部变量
