---
title: JavaScript 语法速查表
description: "JavaScript 核心语法速查：数据类型、数组/对象操作、异步模式、模块化、常用技巧与常见陷阱"
editLink: true
head:
  - - meta
    - property: og:title
      content: "JavaScript 语法速查表 | Awesome JS/TS Ecosystem"
---

# JavaScript 语法速查表

> 覆盖 ES2020+ 常用语法，按使用频率排序。建议在不确定语法行为时 Ctrl+F 定位查阅。

## 数据类型与判断

```javascript
// 7 种原始类型
string | number | bigint | boolean | undefined | symbol | null

// typeof 返回值（注意历史包袱）
typeof 'x'      // 'string'
typeof 42       // 'number'
typeof 42n      // 'bigint'
typeof true     // 'boolean'
typeof undefined // 'undefined'
typeof Symbol() // 'symbol'
typeof null     // 'object'  ← 历史 bug，用 === null 判断
typeof {}       // 'object'
typeof []       // 'object'
typeof function(){} // 'function'

// 可靠的对象类型判断
Object.prototype.toString.call([])   // '[object Array]'
Object.prototype.toString.call({})   // '[object Object]'
Object.prototype.toString.call(null) // '[object Null]'
Array.isArray([])                    // true

// 空值判断（ES2020）
const value = null ?? 'default'      // 'default'
const zero = 0 ?? 'default'          // 0（仅 null/undefined 触发）
```

## 数组操作速查

### 创建与转换

```javascript
// 创建
Array.from({ length: 5 }, (_, i) => i)   // [0, 1, 2, 3, 4]
[...Array(5).keys()]                      // [0, 1, 2, 3, 4]
Array.from('abc')                         // ['a', 'b', 'c']

// 二维数组（避免引用陷阱）
Array.from({ length: 3 }, () => [])      // [[], [], []]
new Array(3).fill([])                    // 错误！3 个元素指向同一数组
```

### 遍历与变换

| 方法 | 功能 | 返回值 | 是否改变原数组 |
|------|------|--------|----------------|
| `map(fn)` | 映射 | 新数组 | ❌ |
| `filter(fn)` | 过滤 | 新数组 | ❌ |
| `flatMap(fn)` | 映射+扁平化 | 新数组 | ❌ |
| `reduce(fn, init)` | 归约 | 单个值 | ❌ |
| `find(fn)` | 查找首个匹配 | 元素/undefined | ❌ |
| `findIndex(fn)` | 查找首个匹配索引 | 索引/-1 | ❌ |
| `some(fn)` | 是否有满足条件的 | boolean | ❌ |
| `every(fn)` | 是否全部满足 | boolean | ❌ |
| `sort(fn)` | 排序 | 原数组引用 | ✅ |
| `toSorted(fn)` | 排序副本（ES2023） | 新数组 | ❌ |
| `splice(start, deleteCount, ...items)` | 增删 | 被删除元素 | ✅ |
| `slice(start, end)` | 切片 | 新数组 | ❌ |

```javascript
// 常用组合模式
const sum = arr.reduce((a, b) => a + b, 0)
const unique = [...new Set(arr)]
const grouped = Object.groupBy(arr, x => x.category)  // ES2024
const sortedDesc = arr.toSorted((a, b) => b - a)       // ES2023，不改变原数组
```

## 对象操作速查

```javascript
// 创建与合并
const obj = { a: 1, b: 2 }
const merged = { ...obj, c: 3 }                        // 浅拷贝+扩展
const deepClone = structuredClone(obj)                 // 深拷贝（ES2022）

// 键值操作
Object.keys(obj)       // ['a', 'b']
Object.values(obj)     // [1, 2]
Object.entries(obj)    // [['a', 1], ['b', 2]]
Object.fromEntries([['x', 1]])  // { x: 1 }

// 属性描述符
Object.defineProperty(obj, 'hidden', {
  value: 42,
  enumerable: false,    // 不可枚举
  writable: false,      // 不可写
  configurable: false   // 不可配置
})

// 安全属性访问（ES2020）
const deep = obj?.a?.b?.c        // 可选链
const hasMethod = obj?.method?.() // 可选链调用

// 动态属性名
const key = 'dynamic'
const dynamic = { [key]: 42 }    // { dynamic: 42 }
```

## 异步模式速查

### Promise

```javascript
// 创建
const p = new Promise((resolve, reject) => { ... })
const resolved = Promise.resolve(value)
const rejected = Promise.reject(reason)

// 组合
Promise.all([p1, p2])           // 全部成功 / 任一失败则整体失败
Promise.allSettled([p1, p2])    // 等待全部完成，不短路
Promise.race([p1, p2])          // 第一个 settled 的结果
Promise.any([p1, p2])           // 第一个 fulfilled 的结果（ES2021）

// ES2024：Promise.withResolvers
const { promise, resolve, reject } = Promise.withResolvers()
setTimeout(() => resolve('done'), 1000)
await promise

// 错误处理
await promise.catch(err => console.error(err))
// 或
try { await promise } catch (err) { ... }
```

### Async / Await

```javascript
// 串行（慢）
const a = await fetchA()
const b = await fetchB()

// 并行（快）
const [a, b] = await Promise.all([fetchA(), fetchB()])

// for...of 中的串行 await
for (const url of urls) {
  await fetch(url)  // 串行执行，避免并发过大
}

// 并发控制（常见面试题）
async function* batch(urls, concurrency = 3) {
  const iterator = urls[Symbol.iterator]()
  const workers = Array(concurrency).fill(iterator).map(work)
  async function work(iter) {
    for (const url of iter) {
      yield await fetch(url)
    }
  }
  // 实际实现需用 p-queue 等库
}
```

## 字符串与解构

```javascript
// 模板字符串
const name = 'World'
const html = `\n  <div>Hello ${name}</div>\n`

// 标签模板（用于 i18n / styled-components）
function tag(strings, ...values) {
  // strings: ['Hello ', '']
  // values: ['World']
}
tag`Hello ${name}`

// 解构
const { a, b: alias, c = 3 } = obj
const [first, , third, ...rest] = arr

// 嵌套解构
const { user: { name: userName } } = { user: { name: 'Alice' } }

// 参数解构 + 默认值
function draw({ size = 'big', coords: { x, y } = {} } = {}) { ... }
```

## 函数模式

```javascript
// 默认参数（注意：默认参数在函数作用域内求值）
function greet(name = 'Guest', greeting = `Hello, ${name}`) { ... }

// 剩余参数
function sum(...numbers) {
  return numbers.reduce((a, b) => a + b, 0)
}

// 箭头函数（无自身 this / arguments / prototype / super）
const add = (a, b) => a + b
const obj = {
  value: 42,
  getValue: () => this.value  // 注意：箭头函数 this 继承外层
}

// 立即执行函数（IIFE）
const result = (() => { return 42 })()

// 函数柯里化
const curry = fn => arg => fn.bind(null, arg)
const addOne = curry((a, b) => a + b)(1)
```

## 模块导入导出

```javascript
// 命名导出
export const foo = 1
export function bar() { ... }
export { foo as defaultFoo }

// 默认导出（每模块仅一个）
export default function() { ... }

// 导入
import { foo, bar } from './module.js'
import * as mod from './module.js'
import defaultExport from './module.js'
import defaultExport, { named } from './module.js'

// 动态导入（返回 Promise）
const mod = await import('./module.js')
if (condition) {
  const { heavy } = await import('./heavy-module.js')  // 代码分割
}

// 导入断言（JSON 等）
import data from './data.json' with { type: 'json' }  // ES2024 Stage 3
```

## 常见陷阱

| 陷阱 | 错误示范 | 正确做法 |
|------|----------|----------|
| `==` 隐式转换 | `0 == ''` → `true` | 始终使用 `===` 和 `!==` |
| `this` 丢失 | `setTimeout(obj.method, 100)` | `setTimeout(() => obj.method(), 100)` |
| 浮点精度 | `0.1 + 0.2 !== 0.3` | 用整数运算或 `Number.EPSILON` 比较 |
| 闭包循环引用 | `for(var i=0; i<3; i++) setTimeout(()=>console.log(i))` | 用 `let` 或 IIFE |
| 原型链污染 | `obj.__proto__.evil = true` | 使用 `Object.create(null)` 或 `Object.freeze` |
| `Array(3).map(()=>1)` | 返回空槽位 | `Array.from({length:3}, ()=>1)` |

## 参考资源

- [MDN JavaScript 参考](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference)
- [JavaScript.info](https://javascript.info/)
- [33 Concepts Every JS Developer Should Know](https://github.com/leonardomso/33-js-concepts)
- [You Don't Know JS](https://github.com/getify/You-Dont-Know-JS)
