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

---

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

---

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

// RegExp.escape（ES2025 Stage 3）
RegExp.escape('Hello. How are you?') // 'Hello\\. How are you\\?'
```

---

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

// 所有 settled（无论成功失败）
const results = await Promise.allSettled([fetchA(), fetchB()])
results.filter(r => r.status === 'fulfilled').map(r => r.value)
```

---

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

---

## 生成器与迭代器

```javascript
// 生成器函数
function* idGenerator() {
  let id = 1
  while (true) {
    yield id++
  }
}

const gen = idGenerator()
console.log(gen.next().value) // 1
console.log(gen.next().value) // 2

// 自定义可迭代对象
class Range {
  constructor(start, end) {
    this.start = start
    this.end = end
  }
  *[Symbol.iterator]() {
    for (let i = this.start; i <= this.end; i++) {
      yield i
    }
  }
}

const range = new Range(1, 3)
console.log([...range]) // [1, 2, 3]

// 异步生成器
async function* fetchPages(urls) {
  for (const url of urls) {
    yield await fetch(url).then(r => r.json())
  }
}
```

---

## Symbol 与 Well-Known Symbols

```javascript
// 唯一标识符
const id = Symbol('userId')
const user = { [id]: 42, name: 'Alice' }
console.log(user[id]) // 42

// Well-Known Symbols
class MyCollection {
  constructor(items) { this.items = items }

  *[Symbol.iterator]() {
    yield* this.items
  }

  [Symbol.toStringTag] = 'MyCollection'

  [Symbol.hasInstance](instance) {
    return Array.isArray(instance.items)
  }
}

const coll = new MyCollection([1, 2, 3])
console.log([...coll]) // [1, 2, 3]
console.log(Object.prototype.toString.call(coll)) // [object MyCollection]
```

---

## WeakMap / WeakSet / WeakRef

```javascript
// WeakMap：键必须是对象，不计入 GC 引用计数
const privateData = new WeakMap()

class User {
  constructor(name) {
    privateData.set(this, { name, createdAt: Date.now() })
  }
  getName() {
    return privateData.get(this).name
  }
}

// WeakRef：不阻止垃圾回收的引用
let ref = new WeakRef(largeObject)
const obj = ref.deref() // 可能返回 undefined（已被回收）

// FinalizationRegistry：对象被回收时执行回调
const registry = new FinalizationRegistry((heldValue) => {
  console.log(`Object ${heldValue} was garbage collected`)
})
registry.register(someObject, 'my-object-id')
```

---

## Proxy 与 Reflect

```javascript
// 代理对象拦截操作
const handler = {
  get(target, prop) {
    if (prop in target) return target[prop]
    throw new Error(`Property ${String(prop)} does not exist`)
  },
  set(target, prop, value) {
    if (typeof value !== 'number') {
      throw new TypeError('Value must be a number')
    }
    target[prop] = value
    return true
  },
  deleteProperty(target, prop) {
    console.log(`Deleting ${String(prop)}`)
    return Reflect.deleteProperty(target, prop)
  },
}

const numbers = new Proxy({}, handler)
numbers.a = 10      // ✅
numbers.b = 'hello' // ❌ TypeError
```

---

## 结构化克隆与深拷贝

```javascript
// structuredClone：浏览器与 Node.js 原生深拷贝
const original = {
  date: new Date(),
  map: new Map([['key', 'value']]),
  nested: { a: [1, 2, 3] },
}
const cloned = structuredClone(original)
cloned.nested.a.push(4)
console.log(original.nested.a) // [1, 2, 3] — 独立副本

// 限制：无法克隆函数、DOM 节点、某些 Error 类型
```

---

## Intl API（国际化）

```javascript
// 相对时间格式化
const rtf = new Intl.RelativeTimeFormat('zh', { numeric: 'auto' })
rtf.format(-1, 'day')    // '昨天'
rtf.format(2, 'hour')    // '2小时后'

// 数字格式化
const numFmt = new Intl.NumberFormat('zh-CN', {
  style: 'currency',
  currency: 'CNY',
})
numFmt.format(1234567.89) // '¥1,234,567.89'

// 列表格式化
const listFmt = new Intl.ListFormat('en', { type: 'conjunction' })
listFmt.format(['Alice', 'Bob', 'Charlie']) // 'Alice, Bob, and Charlie'

// 日期范围格式化
const drFmt = new Intl.DateTimeFormat('zh', {
  dateStyle: 'medium',
  timeStyle: 'short',
})
drFmt.formatRange(new Date(2026, 3, 1), new Date(2026, 3, 15))
// '2026年4月1日 00:00 – 4月15日 00:00'
```

---

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

// 逻辑赋值运算符
obj.count ??= 0   // 仅当 null/undefined 时赋值
obj.count &&= 10  // 仅当 truthy 时赋值
obj.count ||= 1   // 仅当 falsy 时赋值

// 管道运算符（Stage 2，需 Babel）
// const result = value |> double |> add(1) |> String
```

---

## 参考资源

- [MDN JavaScript Reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [ECMAScript 2025 Specification](https://tc39.es/ecma262/)
- [JavaScript Info](https://javascript.info/)
- [V8 Blog](https://v8.dev/blog) — Google V8 引擎技术博客
- [TC39 Proposals](https://github.com/tc39/proposals) — ECMAScript 提案跟踪
- [Node.js — ECMAScript Modules](https://nodejs.org/api/esm.html) — ESM 模块系统官方文档
- [Can I Use — JavaScript](https://caniuse.com/?search=javascript) — 浏览器兼容性查询
- [Exploring JS — Dr. Axel Rauschmayer](https://exploringjs.com/) — JavaScript 深度教程系列
- [2ality — JavaScript & TypeScript Blog](https://2ality.com/) — Dr. Axel 的技术博客
- [JavaScript Weekly](https://javascriptweekly.com/) — JS 生态每周精选
- [State of JS 2025](https://stateofjs.com/) — JavaScript 开发者年度调查报告

---

*最后更新: 2026-04-29*
