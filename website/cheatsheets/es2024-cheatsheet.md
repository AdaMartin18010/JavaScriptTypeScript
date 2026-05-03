---
title: ES2024+ 新特性速查表
description: "ES2024 (ES15) 及 Stage 3 提案速查：Object.groupBy、Promise.withResolvers、Array.prototype.toSorted 等新 API 与语法特性"
editLink: true
head:
  - - meta
    - property: og:title
      content: "ES2024+ 新特性速查表 | Awesome JS/TS Ecosystem"
---

# ES2024+ 新特性速查表

> ES2024（ECMAScript 2024 / ES15）已于 2024 年 6 月正式定稿。本速查表覆盖已发布的 ES2024 特性以及 Stage 3 高确定性提案，帮助开发者规划迁移路线图。

## 特性状态速览

| 特性 | 版本 | 状态 | 核心用途 |
|------|------|------|----------|
| `Object.groupBy` | ES2024 | ✅ 已发布 | 对象数组分组 |
| `Map.groupBy` | ES2024 | ✅ 已发布 | Map 数组分组 |
| `Promise.withResolvers` | ES2024 | ✅ 已发布 | 外部控制 Promise |
| `Array.prototype.toSorted` | ES2023 | ✅ 已发布 | 不可变排序 |
| `Array.prototype.toReversed` | ES2023 | ✅ 已发布 | 不可变反转 |
| `Array.prototype.toSpliced` | ES2023 | ✅ 已发布 | 不可变 splice |
| `Array.prototype.with` | ES2023 | ✅ 已发布 | 不可变元素替换 |
| `Array.fromAsync` | ES2024 | ✅ 已发布 | 异步迭代器转数组 |
| `Atomics.waitAsync` | ES2024 | ✅ 已发布 | 共享内存异步等待 |
| `String.prototype.isWellFormed` | ES2024 | ✅ 已发布 | Unicode 合法性检查 |
| `String.prototype.toWellFormed` | ES2024 | ✅ 已发布 | Unicode 修复 |
| RegExp `v` flag | ES2024 | ✅ 已发布 | 集合运算与 Unicode 属性 |
| `Array.prototype.findLast` | ES2023 | ✅ 已发布 | 反向查找 |
| `Hashbang` | ES2023 | ✅ 已发布 | 脚本首行 shebang |
| `import attributes` | ES2024 | ✅ 已发布 | 导入元数据断言 |
| Decorators | ES2024 | ✅ 已发布 | 装饰器语法 |
| `Set` 方法扩展 | Stage 3 | 🔄 推进中 | 集合运算（union/intersection） |
| `Iterator` 辅助方法 | Stage 3 | 🔄 推进中 | 通用迭代器工具 |
| `Temporal` API | Stage 3 | 🔄 推进中 | 现代日期时间 API |

## ES2024 核心特性

### Object.groupBy / Map.groupBy

```javascript
const users = [
  { name: 'Alice', role: 'admin' },
  { name: 'Bob', role: 'user' },
  { name: 'Carol', role: 'admin' }
]

// Object.groupBy — 返回普通对象
const byRole = Object.groupBy(users, u => u.role)
// {
//   admin: [{ name: 'Alice', role: 'admin' }, { name: 'Carol', role: 'admin' }],
//   user: [{ name: 'Bob', role: 'user' }]
// }

// Map.groupBy — 返回 Map（键可以是任意类型）
const byNameLength = Map.groupBy(users, u => u.name.length > 4)
// Map(2) { false => [...], true => [...] }

// 对比 lodash 的 groupBy
// Object.groupBy 是原生实现，不需要库依赖
// 但注意：返回的对象没有原型（Object.create(null)）
```

### Promise.withResolvers

```javascript
// 以前：手动解构
let resolve, reject
const promise = new Promise((res, rej) => {
  resolve = res
  reject = rej
})

// ES2024：一行搞定
const { promise, resolve, reject } = Promise.withResolvers()

// 典型使用场景：外部控制异步流程
class TaskQueue {
  #current = Promise.withResolvers()

  async enqueue(task) {
    const next = Promise.withResolvers()
    const prev = this.#current
    this.#current = next
    await prev.promise
    try {
      const result = await task()
      next.resolve(result)
      return result
    } catch (err) {
      next.reject(err)
      throw err
    }
  }
}
```

### Array.fromAsync

```javascript
// 将异步迭代器转换为数组
async function* asyncGenerator() {
  yield 1
  yield 2
  yield 3
}

const arr = await Array.fromAsync(asyncGenerator())
// [1, 2, 3]

// 带映射函数（类似 Array.from 的第二个参数）
const doubled = await Array.fromAsync(asyncGenerator(), x => x * 2)
// [2, 4, 6]

// 对比手动实现
const manual = []
for await (const item of asyncGenerator()) {
  manual.push(item)
}
// Array.fromAsync 更简洁且原生优化
```

### RegExp `v` flag（Unicode 集合运算）

```javascript
// v 标志是 u 标志的超集，支持集合运算
const re = /[\p{Script=Latin}&&[^a-zA-Z]]/v
// 匹配拉丁文但不匹配 ASCII 字母

// 字符类集合运算
/[a-z--[aeiou]]/v     // 小写字母排除元音（差集）
/[a-z&&[abcdef]]/v    // 交集
/[[a-z][0-9]]/v       // 并集（与普通 [] 相同）

// 多字符属性
/\p{RGI_Emoji}/v.test('👨‍👩‍👧‍👦')  // true（完整 Emoji 序列）
```

### 字符串 Unicode 方法

```javascript
// 检查字符串是否为合法的 Unicode
'valid'.isWellFormed()       // true
'\uD800'.isWellFormed()      // false（孤立的代理对）

// 修复不合法的 Unicode
'\uD800'.toWellFormed()      // '\uFFFD'（替换字符）
```

### import attributes（原 import assertions）

```javascript
// JSON 导入（需要 type: 'json'）
import config from './config.json' with { type: 'json' }

// 动态导入也支持
const mod = await import('./module.js', {
  with: { type: 'json' }
})

// 对比旧语法（assert 已废弃，改用 with）
// import config from './config.json' assert { type: 'json' }  // 旧
// import config from './config.json' with { type: 'json' }    // 新
```

## ES2023 回顾（重要补充）

### 不可变数组方法

```javascript
const arr = [3, 1, 2]

// 不改变原数组的新方法
arr.toSorted()         // [1, 2, 3]（arr 不变）
arr.toReversed()       // [2, 1, 3]（arr 不变）
arr.toSpliced(1, 1, 99) // [3, 99, 2]（arr 不变）
arr.with(0, 100)       // [100, 1, 2]（arr 不变）

// 对比旧方法（改变原数组）
arr.sort()             // [1, 2, 3]（arr 被修改！）
```

### findLast / findLastIndex

```javascript
const arr = [1, 2, 3, 4, 3, 2, 1]

arr.findLast(x => x === 3)       // 3（从后往前找第一个）
arr.findLastIndex(x => x === 3)  // 4

// 对比 find / findIndex
arr.find(x => x === 3)           // 3（从前往后）
arr.findIndex(x => x === 3)      // 2
```

## Stage 3 高确定性提案

### Set 方法扩展

```javascript
// 即将标准化（Chrome 122+, Node 22+）
const a = new Set([1, 2, 3])
const b = new Set([2, 3, 4])

a.union(b)           // Set {1, 2, 3, 4}
a.intersection(b)    // Set {2, 3}
a.difference(b)      // Set {1}
a.symmetricDifference(b) // Set {1, 4}
a.isSubsetOf(b)      // false
a.isSupersetOf(b)    // false
a.isDisjointFrom(b)  // false
```

### Iterator 辅助方法

```javascript
// 即将标准化（Chrome 122+, Node 22+）
const map = new Map([['a', 1], ['b', 2], ['c', 3]])

map.keys()
  .filter(k => k !== 'b')
  .map(k => k.toUpperCase())
  .toArray()          // ['A', 'C']

// 其他辅助方法
iterator.take(5)      // 取前 5 个
diterator.drop(2)     // 跳过前 2 个
iterator.flatMap(fn)
iterator.reduce(fn, init)
iterator.some(fn)
iterator.every(fn)
iterator.find(fn)
iterator.toArray()
```

### Temporal API（日期时间革命）

```javascript
// 当前处于 Stage 3，可通过 polyfill 使用
import { Temporal } from '@js-temporal/polyfill'

// 替代混乱的 Date API
const now = Temporal.Now.instant()
const date = Temporal.PlainDate.from('2024-05-01')
const time = Temporal.PlainTime.from('14:30:00')
const datetime = Temporal.PlainDateTime.from('2024-05-01T14:30:00')

// 不可变、时区感知、无歧义
const tomorrow = date.add({ days: 1 })
const duration = Temporal.Duration.from({ hours: 2, minutes: 30 })

// 时区转换
const zoned = now.toZonedDateTimeISO('Asia/Shanghai')
```

## 兼容性速查

| 特性 | Chrome | Firefox | Safari | Node.js |
|------|--------|---------|--------|---------|
| `Object.groupBy` | 117 | 119 | 17.4 | 21.0 |
| `Promise.withResolvers` | 119 | 121 | 17.4 | 21.0 |
| `Array.fromAsync` | 121 | 122 | 17.4 | 22.0 |
| RegExp `v` flag | 112 | 116 | 17.0 | 20.0 |
| `toSorted/toReversed` | 110 | 115 | 16.0 | 20.0 |
| `findLast/findLastIndex` | 110 | 115 | 16.0 | 20.0 |
| `import with` | 123 | 125 | 17.2 | 22.0 |
| Decorators | 117 | 124 | 17.4 | 21.0 |
| Set 方法 | 122 | 127 | 17.4 | 22.0 |

## 迁移建议

```bash
# 1. 检查当前环境支持
npx compat-table es2024

# 2. TypeScript 配置（target 不影响 lib）
{
  "compilerOptions": {
    "target": "ES2022",      // 或更低以兼容旧环境
    "lib": ["ES2024"]        // 包含 ES2024 类型定义
  }
}

# 3. 渐进式采用策略
# - 优先使用不改变运行时的语法特性（如装饰器）
# - 对需要 polyfill 的方法，评估 bundle 体积影响
# - 使用 core-js 按需 polyfill
```

## 参考资源

- [ECMAScript 2024 语言规范](https://tc39.es/ecma262/2024/)
- [Can I Use — ES2024](https://caniuse.com/?search=es2024)
- [Compat Table](https://compat-table.github.io/compat-table/es2016plus/)
- [TypeScript 5.4 新特性](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-4.html)
- [ES2024 特性详解](https://2ality.com/2024/01/ecmascript-2024.html)
