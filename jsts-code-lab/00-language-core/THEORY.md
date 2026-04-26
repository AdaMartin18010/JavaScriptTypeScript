# 语言核心 — 理论基础

## 1. JavaScript 类型系统

JavaScript 拥有 8 种基本数据类型：

- **原始类型**: `undefined`, `null`, `boolean`, `number`, `bigint`, `string`, `symbol`
- **引用类型**: `object`（含 Array、Function、Date、RegExp 等）

### 类型转换规则

- **抽象相等（==）**: 触发强制类型转换，`0 == '0'` 为 true
- **严格相等（===）**: 不转换类型，`0 === '0'` 为 false
- **真值/假值**: `false`, `0`, `''`, `null`, `undefined`, `NaN` 为假值；其余为真值

## 2. 执行上下文与作用域

### 执行上下文类型

- **全局执行上下文**: 程序入口，创建全局对象（浏览器为 `window`，Node.js 为 `global`）
- **函数执行上下文**: 每次函数调用创建，包含变量环境、词法环境、`this` 绑定
- **Eval 执行上下文**: `eval()` 代码执行时的上下文

### 作用域链

```javascript
function outer() {
  const a = 1
  function inner() {
    const b = 2
    console.log(a + b) // 访问 outer 的 a，形成作用域链
  }
  inner()
}
```

## 3. 闭包

闭包是函数与其词法环境的组合，使函数可以访问定义时的外部变量：

- **私有变量**: 模块模式、工厂函数
- **状态保持**: 事件处理器、回调函数保留上下文
- **内存影响**: 闭包引用的变量不会被垃圾回收

## 4. this 绑定规则

| 调用方式 | this 指向 |
|---------|----------|
| `obj.method()` | obj |
| `func()` | undefined（严格模式）/ global（非严格） |
| `new Func()` | 新创建的对象 |
| `func.call/apply(obj)` | 显式指定的 obj |
| 箭头函数 | 词法继承（定义时的 this） |

## 5. 原型链

```
对象 → __proto__ → 原型对象 → __proto__ → Object.prototype → null
```

- `Object.create(proto)`: 创建以 proto 为原型的对象
- `Object.setPrototypeOf`: 动态修改原型（性能影响）
- `class` 语法糖：底层仍为原型继承

## 6. 与相邻模块的关系

- **01-ecmascript-evolution**: ECMAScript 标准演进
- **10-js-ts-comparison**: JavaScript 与 TypeScript 的差异
- **14-execution-flow**: 执行流与调用栈
