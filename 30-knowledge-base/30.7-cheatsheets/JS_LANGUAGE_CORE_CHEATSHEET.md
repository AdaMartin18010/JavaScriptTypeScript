# JavaScript 语言核心速查表

> JavaScript 核心语法与语义快速参考，覆盖 ES2024/ES2025 关键特性。

---

## 变量与作用域

```javascript
// 声明方式对比
var     // 函数作用域，可提升，可重复声明 — 避免使用
let     // 块作用域，不可提升，不可重复声明
const   // 块作用域，不可重新赋值 — 默认选择

// TDZ（Temporal Dead Zone）
console.log(a) // ReferenceError
let a = 1
```

## 类型系统

```javascript
// 原始类型
string | number | boolean | null | undefined | symbol | bigint

// 类型判断
typeof null === 'object'        // 历史 bug
Array.isArray([])               // ✅ 判断数组
Object.prototype.toString.call(value) // [object Type]

// 强制类型转换（避免隐式转换）
Number('42')     // 42
String(42)       // '42'
Boolean(0)       // false
```

## ES2024/ES2025 新特性

```javascript
// Array 不可变方法（ES2024）
const arr = [3, 1, 2]
arr.toSorted()     // [1, 2, 3] — arr 不变
arr.toReversed()   // [2, 1, 3]
arr.toSpliced(1, 1) // [3, 2]

// Promise.withResolvers（ES2024）
const { promise, resolve, reject } = Promise.withResolvers()

// Object.groupBy（ES2024）
const grouped = Object.groupBy(users, u => u.role)

// Array.fromAsync（ES2025 Stage 3）
const pages = await Array.fromAsync(fetchPages())
```

## 异步模式

```javascript
// Promise 链
fetch('/api')
  .then(r => r.json())
  .catch(e => console.error(e))

// async/await
try {
  const data = await fetch('/api').then(r => r.json())
} catch (e) {
  console.error(e)
}

// 并行执行
const [a, b] = await Promise.all([fetchA(), fetchB()])

// 竞速
const winner = await Promise.race([fetchA(), timeout(5000)])
```

## 闭包与 this

```javascript
// 箭头函数继承外层 this
const obj = {
  value: 42,
  getValue: () => this.value,  // ❌ 不绑定 obj
  getValue2() { return this.value } // ✅ 绑定 obj
}

// 显式绑定
fn.call(context, arg1, arg2)
fn.apply(context, [arg1, arg2])
const bound = fn.bind(context)
```

## 常用工具方法

```javascript
// 解构与默认值
const { a = 1, b: renamed } = obj
const [first, ...rest] = arr

// 可选链 + 空值合并
const value = obj?.nested?.property ?? 'default'

// 对象简洁写法
const name = 'John'
const user = { name, age: 30 }  // { name: 'John', age: 30 }
```

---

## 参考资源

- [MDN JavaScript Reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [ECMAScript 2025 Specification](https://tc39.es/ecma262/)
- [JavaScript Info](https://javascript.info/)

---

*最后更新: 2026-04-29*
