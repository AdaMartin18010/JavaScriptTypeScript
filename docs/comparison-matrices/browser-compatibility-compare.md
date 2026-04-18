# 浏览器兼容性对比矩阵

> 最后更新：2026年4月

## 核心对比表：ES2020 - ES2025 特性

| 特性 | Chrome | Firefox | Safari | Edge | Node.js | Polyfill | core-js | 备注 |
|------|--------|---------|--------|------|---------|----------|---------|------|
| **ES2020 BigInt** | 🟢 67 | 🟢 68 | 🟢 14 | 🟢 79 | 🟢 10.4 | 🔴 无 | 🟢 3 | 64位整数 |
| **ES2020 Optional Chaining `?.`** | 🟢 80 | 🟢 74 | 🟢 13.1 | 🟢 80 | 🟢 14.0 | 🔴 语法 | 🟢 3 | 短路属性访问 |
| **ES2020 Nullish Coalescing `??`** | 🟢 80 | 🟢 72 | 🟢 13.1 | 🟢 80 | 🟢 14.0 | 🔴 语法 | 🟢 3 | 仅对 null/undefined |
| **ES2020 Dynamic Import `import()`** | 🟢 63 | 🟢 67 | 🟢 11.1 | 🟢 79 | 🟢 12.20 | 🔴 语法 | 🟢 3 | 运行时异步加载 |
| **ES2020 `Promise.allSettled`** | 🟢 76 | 🟢 71 | 🟢 13 | 🟢 79 | 🟢 12.9 | 🟢 手动 | 🟢 3 | 等待全部完成 |
| **ES2020 `globalThis`** | 🟢 71 | 🟢 65 | 🟢 12.1 | 🟢 79 | 🟢 12.0 | 🟢 手动 | 🟢 3 | 统一全局对象 |
| **ES2021 `Promise.any`** | 🟢 85 | 🟢 79 | 🟢 14 | 🟢 85 | 🟢 15.0 | 🟢 手动 | 🟢 3 | 首个 resolve |
| **ES2021 Logical Assignment `??=`** | 🟢 85 | 🟢 79 | 🟢 14 | 🟢 85 | 🟢 15.0 | 🔴 语法 | 🟢 3 | 逻辑赋值运算符 |
| **ES2021 `String.prototype.replaceAll`** | 🟢 85 | 🟢 77 | 🟢 14 | 🟢 85 | 🟢 15.0 | 🟢 手动 | 🟢 3 | 全局替换字符串 |
| **ES2021 Numeric Separators `1_000`** | 🟢 75 | 🟢 70 | 🟢 13.1 | 🟢 79 | 🟢 12.5 | 🔴 语法 | 🟢 3 | 可读性数字分隔 |
| **ES2022 Class Fields** | 🟢 74 | 🟢 90 | 🟢 14.1 | 🟢 79 | 🟢 12.0 | 🔴 语法 | 🟢 3 | 公有/私有字段 |
| **ES2022 Class Static Block** | 🟢 91 | 🟢 93 | 🟢 16 | 🟢 91 | 🟢 16.4 | 🔴 语法 | 🟢 3 | 类静态初始化 |
| **ES2022 `Array.prototype.at`** | 🟢 92 | 🟢 90 | 🟢 15.4 | 🟢 92 | 🟢 16.6 | 🟢 手动 | 🟢 3 | 负索引访问 |
| **ES2022 Top-level `await`** | 🟢 89 | 🟢 89 | 🟢 15 | 🟢 89 | 🟢 14.8 | 🔴 语法 | 🟢 3 | 模块顶层 await |
| **ES2022 Error Cause** | 🟢 93 | 🟢 91 | 🟢 15 | 🟢 93 | 🟢 16.9 | 🟢 手动 | 🟢 3 | 错误链传递 |
| **ES2023 Immutable Array Methods** | 🟢 110 | 🟢 115 | 🟢 16 | 🟢 110 | 🟢 20.0 | 🟢 手动 | 🟢 3 | `toSorted`/`toReversed` 等 |
| **ES2023 `Array.prototype.findLast`** | 🟢 110 | 🟢 115 | 🟢 16 | 🟢 110 | 🟢 20.0 | 🟢 手动 | 🟢 3 | 反向查找 |
| **ES2023 `Hashbang` #!** | 🟢 117 | 🟢 116 | 🟢 16.4 | 🟢 117 | 🟢 20.0 | 🔴 语法 | 🟢 3 | 脚本 Shebang |
| **ES2024 `Object.groupBy`** | 🟢 117 | 🟢 119 | 🟢 17 | 🟢 117 | 🟢 21.0 | 🟢 手动 | 🟢 3 | 对象分组 |
| **ES2024 `Map.groupBy`** | 🟢 117 | 🟢 119 | 🟢 17 | 🟢 117 | 🟢 21.0 | 🟢 手动 | 🟢 3 | Map 分组 |
| **ES2024 `Promise.withResolvers`** | 🟢 119 | 🟢 121 | 🟢 17 | 🟢 119 | 🟢 22.0 | 🟢 手动 | 🟢 3 | 外部 resolve/reject |
| **ES2024 RegExp `v` flag** | 🟢 112 | 🟢 116 | 🟢 17 | 🟢 112 | 🟢 20.0 | 🔴 语法 | 🟢 3 | Unicode 集合运算 |
| **ES2024 `Atomics.waitAsync`** | 🟢 87 | 🟢 131 | 🟢 16 | 🟢 87 | 🟢 16.0 | 🔴 无 | 🟢 3 | SharedArrayBuffer 异步等待 |
| **ES2025 Iterator Helpers** | 🟢 122 | 🟢 136 | 🟡 18 (部分) | 🟢 122 | 🟢 23.0 | 🟢 手动 | 🟢 3.39 | `Iterator.prototype.map` 等 |
| **ES2025 Set Methods** | 🟢 122 | 🟢 127 | 🟢 17 | 🟢 122 | 🟢 23.0 | 🟢 手动 | 🟢 3.38 | `union`/`intersection` 等 |
| **ES2025 `Promise.try`** | 🟢 128 | 🟢 135 | 🟢 18 | 🟢 128 | 🟢 24.0 | 🟢 手动 | 🟢 3.40 | 同步转 Promise |

## 核心对比表：Web API

| 特性 | Chrome | Firefox | Safari | Edge | Node.js | Polyfill | core-js | 备注 |
|------|--------|---------|--------|------|---------|----------|---------|------|
| **Fetch API** | 🟢 42 | 🟢 40 | 🟢 10.1 | 🟢 14 | 🟢 18.0 | 🟢 whatwg-fetch | 🟢 3 | 现代网络请求 |
| **Streams API** | 🟢 76 | 🟢 102 | 🟢 14.1 | 🟢 79 | 🟢 16.5 | 🔵 部分 | 🟢 3 | 流式数据处理 |
| **WebGL 1.0** | 🟢 8 | 🟢 4 | 🟢 8 | 🟢 12 | 🔴 无 | 🔴 无 | 🔴 无 | 3D 图形 |
| **WebGL 2.0** | 🟢 56 | 🟢 51 | 🟢 15 | 🟢 79 | 🔴 无 | 🔴 无 | 🔴 无 | 进阶 3D 图形 |
| **WebGPU** | 🟢 113 | 🟡 部分 (Nightly) | 🟢 17 | 🟢 113 | 🔵 实验性 | 🔴 无 | 🔴 无 | 下一代 GPU API |
| **Service Worker** | 🟢 45 | 🟢 44 | 🟢 11.1 | 🟢 17 | 🔴 无 | 🔴 无 | 🔴 无 | PWA 离线支持 |
| **Clipboard API** | 🟢 66 | 🟢 127 | 🟢 13.1 | 🟢 79 | 🟢 22.0 (readText) | 🔵 部分 | 🔴 无 | 剪贴板读写 |
| **Notifications API** | 🟢 22 | 🟢 22 | 🟢 16 | 🟢 14 | 🔴 无 | 🔴 无 | 🔴 无 | 桌面通知 |
| **Web Animations API** | 🟢 75 | 🟢 48 | 🟢 13.1 | 🟢 79 | 🔴 无 | 🟢 部分 | 🔴 无 | 统一动画控制 |
| **ResizeObserver** | 🟢 64 | 🟢 69 | 🟢 13.1 | 🟢 79 | 🔴 无 | 🟢 polyfill | 🔴 无 | 元素尺寸监听 |
| **IntersectionObserver** | 🟢 51 | 🟢 55 | 🟢 12.1 | 🟢 15 | 🔴 无 | 🟢 polyfill | 🔴 无 | 视口交叉检测 |
| **BroadcastChannel** | 🟢 54 | 🟢 38 | 🟢 15.4 | 🟢 79 | 🟢 15.4 | 🟢 手动 | 🔴 无 | 同源页面通信 |
| **Web Share API** | 🟢 61 | 🔵 仅移动端 | 🟢 12.1 | 🟢 89 | 🔴 无 | 🔵 部分 | 🔴 无 | 原生分享面板 |
| **File System Access API** | 🟢 86 | 🔴 不支持 | 🔴 不支持 | 🟢 86 | 🔴 无 | 🔴 无 | 🔴 无 | 本地文件读写 |
| **WebRTC** | 🟢 23 | 🟢 22 | 🟢 11 | 🟢 12 | 🟢 部分 | 🔵 部分 | 🔴 无 | 点对点音视频 |
| **WebSockets** | 🟢 16 | 🟢 11 | 🟢 7 | 🟢 12 | 🟢 原生 | 🟢 socket.io | 🔴 无 | 双向实时通信 |
| **WebAssembly (Wasm)** | 🟢 57 | 🟢 52 | 🟢 11 | 🟢 16 | 🟢 原生 | 🔴 无 | 🔴 无 | 高性能字节码 |
| **Web Workers** | 🟢 4 | 🟢 3.5 | 🟢 4 | 🟢 10 | 🟢 Worker Threads | 🔴 无 | 🔴 无 | 多线程 JS |
| **IndexedDB** | 🟢 24 | 🟢 16 | 🟢 8 | 🟢 12 | 🔴 无 | 🟢 localForage | 🔴 无 | 客户端结构化存储 |

## 详细分析

### ES2020 特性

```typescript
// BigInt — 处理超出 Number.MAX_SAFE_INTEGER 的整数
const huge = 9007199254740991n
const result = huge + 1n
console.log(result === 9007199254740992n) // true

// 与 Number 混合运算需显式转换
const mixed = huge + BigInt(10)
```

```typescript
// Optional Chaining `?.` — 安全访问深层属性
const user = {
  profile: {
    name: 'Alice',
    address: null as { city: string } | null,
  },
}

const city = user.profile?.address?.city  // undefined，不报错
const name = user.profile?.name           // 'Alice'

// 结合函数调用
const result = someObj?.method?.()
```

```typescript
// Nullish Coalescing `??` — 仅对 null/undefined 生效
const value = 0
const a = value || 100      // 100 (0 被视为 falsy)
const b = value ?? 100      // 0 (0 不是 null/undefined)

const empty = ''
const c = empty || 'default' // 'default'
const d = empty ?? 'default' // ''
```

```typescript
// Dynamic Import — 运行时异步加载模块
async function loadModule(path: string) {
  const module = await import(`./modules/${path}.js`)
  module.init()
}

// 条件加载
if (user.prefersDarkMode) {
  const { enableDarkMode } = await import('./dark-mode.js')
  enableDarkMode()
}
```

### ES2021 特性

```typescript
// Promise.any — 返回首个 fulfilled 的 Promise
const requests = [
  fetch('/api/fast'),
  fetch('/api/reliable'),
  fetch('/api/fallback'),
]

try {
  const fastest = await Promise.any(requests)
  console.log('最快响应:', fastest)
} catch (error) {
  // AggregateError: All promises were rejected
  console.log('全部失败:', error.errors)
}
```

```typescript
// Logical Assignment — 简洁的条件赋值
let config = { timeout: 0 }

// 以前
config.timeout = config.timeout || 5000

// 现在
config.timeout ||= 5000   // timeout 为 falsy 时赋值
config.timeout &&= 1000   // timeout 为 truthy 时赋值
config.timeout ??= 5000   // timeout 为 null/undefined 时赋值
```

```typescript
// String.prototype.replaceAll
const query = 'SELECT * FROM users WHERE name = ? AND status = ?'
const sql = query.replaceAll('?', '"$1"')
// SELECT * FROM users WHERE name = "$1" AND status = "$1"
```

### ES2022 特性

```typescript
// Class Fields — 类字段声明
class Counter {
  // 公有字段
  count = 0

  // 私有字段 (硬私有，外部无法访问)
  #step = 1

  // 静态字段
  static instances = 0

  // 静态私有字段
  static #max = 1000

  increment() {
    this.count += this.#step
  }
}

const c = new Counter()
console.log(c.count)    // 0
console.log(c.#step)    // SyntaxError: Private field
```

```typescript
// Array.prototype.at — 支持负索引
const arr = [10, 20, 30, 40, 50]

arr.at(0)    // 10
arr.at(-1)   // 50 (最后)
arr.at(-2)   // 40 (倒数第二)

// 替代繁琐的
arr[arr.length - 1]
```

```typescript
// Top-level await — 模块顶层直接使用 await
// db.ts
const connection = await createConnection({
  host: process.env.DB_HOST,
})

export { connection }

// app.ts — 导入时自动等待连接完成
import { connection } from './db.js'
console.log(connection.isConnected) // true
```

### ES2023 特性

```typescript
// Immutable Array Methods — 返回新数组，不修改原数组
const nums = [3, 1, 4, 1, 5]

const sorted = nums.toSorted()      // [1, 1, 3, 4, 5]
const reversed = nums.toReversed()  // [5, 1, 4, 1, 3]
const spliced = nums.toSpliced(1, 2, 9) // [3, 9, 1, 5]
const withReplaced = nums.with(0, 99)   // [99, 1, 4, 1, 5]

console.log(nums) // [3, 1, 4, 1, 5] — 原数组不变！
```

```typescript
// Array.prototype.findLast / findLastIndex
const temps = [72, 68, 65, 70, 75, 80, 78]

// 找到最后一个高于 75 的温度
const lastHot = temps.findLast(t => t > 75)        // 80
const lastHotIndex = temps.findLastIndex(t => t > 75) // 5
```

### ES2024 特性

```typescript
// Object.groupBy / Map.groupBy — 优雅的数据分组
const products = [
  { name: 'Apple', category: 'fruit' },
  { name: 'Carrot', category: 'vegetable' },
  { name: 'Banana', category: 'fruit' },
]

// 按字符串键分组
const byCategory = Object.groupBy(products, p => p.category)
// {
//   fruit: [{ name: 'Apple', ... }, { name: 'Banana', ... }],
//   vegetable: [{ name: 'Carrot', ... }]
// }

// 按对象键分组 (Map.groupBy)
const groups = new Map([
  ['fresh', p => p.category === 'fruit' || p.category === 'vegetable'],
  ['processed', p => p.category === 'snack'],
])

const byType = Map.groupBy(products, p =>
  [...groups.entries()].find(([, test]) => test(p))?.[0] ?? 'other'
)
```

```typescript
// Promise.withResolvers — 外部控制 Promise
function createTimeout(ms: number) {
  const { promise, resolve, reject } = Promise.withResolvers<string>()

  setTimeout(() => resolve('timeout completed'), ms)

  return { promise, resolve, reject }
}

const { promise, resolve } = createTimeout(5000)
// 可在其他地方调用 resolve() / reject()
```

```typescript
// RegExp `v` flag — Unicode 属性集运算
const greek = /\p{Script=Greek}/v

// 集合运算
const asciiLetters = /[a-z]/v
const asciiDigits = /[0-9]/v
const asciiWord = /[[a-z]--[aeiou]]/v // 辅音字母 (差集)

// 多字符属性
const emoji = /\p{RGI_Emoji}/v
```

### ES2025 特性

```typescript
// Iterator Helpers — 惰性计算链
const nums = [1, 2, 3, 4, 5]

const result = nums
  .values()
  .map(x => x * 2)
  .filter(x => x > 4)
  .take(2)
  .toArray()

console.log(result) // [6, 8]

// 支持任意可迭代对象
function* fibonacci() {
  let [a, b] = [0, 1]
  while (true) { yield a; [a, b] = [b, a + b] }
}

const first10 = fibonacci()
  .take(10)
  .toArray()
```

```typescript
// Set Methods — 集合运算
const setA = new Set([1, 2, 3, 4])
const setB = new Set([3, 4, 5, 6])

setA.union(setB)           // Set {1, 2, 3, 4, 5, 6}
setA.intersection(setB)    // Set {3, 4}
setA.difference(setB)      // Set {1, 2}
setA.symmetricDifference(setB) // Set {1, 2, 5, 6}
setA.isSubsetOf(setB)      // false
setA.isSupersetOf(new Set([1, 2])) // true
setA.isDisjointFrom(new Set([5, 6])) // true
```

```typescript
// Promise.try — 统一同步/异步错误处理
function fetchData() {
  // 无论 getData 是同步抛出还是返回 Promise
  return Promise.try(() => getData())
    .then(data => process(data))
    .catch(error => handleError(error))
}

// 替代繁琐的
// new Promise(resolve => resolve(getData()))
```

### Web API

```typescript
// Fetch API — 现代网络请求
async function fetchUser(id: string) {
  const response = await fetch(`/api/users/${id}`, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
    signal: AbortSignal.timeout(5000), // 5秒超时
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }

  return response.json()
}
```

```typescript
// Streams API — 流式处理大文件
const response = await fetch('/api/large-file')
const reader = response.body?.getReader()

while (reader) {
  const { done, value } = await reader.read()
  if (done) break
  processChunk(value) // Uint8Array
}
```

```typescript
// Service Worker — PWA 离线缓存
// sw.ts
const CACHE_NAME = 'v1'
const urlsToCache = ['/index.html', '/styles.css', '/app.js']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  )
})

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) =>
      response ?? fetch(event.request)
    )
  )
})
```

```typescript
// Clipboard API — 读写剪贴板
async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    console.log('复制成功')
  } catch (err) {
    console.error('复制失败:', err)
  }
}

async function pasteText(): Promise<string> {
  return navigator.clipboard.readText()
}
```

```typescript
// Notifications API — 桌面通知
if ('Notification' in window && Notification.permission === 'granted') {
  new Notification('任务完成', {
    body: '你的构建已成功部署',
    icon: '/icon.png',
  })
}

// 请求权限
Notification.requestPermission().then((permission) => {
  console.log('通知权限:', permission)
})
```

## 性能对比

| 指标 | ES2020 | ES2021 | ES2022 | ES2023 | ES2024 | ES2025 | Web API (Fetch) | Web API (Streams) |
|------|--------|--------|--------|--------|--------|--------|-----------------|-------------------|
| **原生执行速度** | ⚡ 原生 | ⚡ 原生 | ⚡ 原生 | ⚡ 原生 | ⚡ 原生 | ⚡ 原生 | ⚡ 原生 | ⚡ 原生 |
| **Babel 转译开销** | 🟡 低 | 🟡 低 | 🟡 低 | 🟡 低 | 🟡 低 | 🟡 低 | 🔵 需 polyfill | 🔵 需 polyfill |
| **core-js Polyfill 体积** | 🟢 极小 | 🟢 极小 | 🟢 极小 | 🟢 极小 | 🟡 中等 | 🟡 中等 | 🟡 中等 | 🟡 较大 |
| **语法转译后代码膨胀** | 🟡 <5% | 🟡 <5% | 🟡 <10% | 🟡 <5% | 🟢 无 (运行时) | 🟢 无 (运行时) | 🔴 需完整库 | 🔴 需完整库 |
| **运行时性能损失 (Polyfill)** | 🐢 10-50% | 🐢 10-50% | 🐢 5-20% | 🐢 5-20% | 🐢 5-20% | 🐢 5-20% | 🐢 20-100% | 🐢 50-200% |
| **启动加载时间影响** | 🟢 无 | 🟢 无 | 🟢 无 | 🟢 无 | 🟢 无 | 🟢 无 | 🟡 中等 | 🟡 中等 |

## 功能对比

| 功能/能力 | ES2020 | ES2021 | ES2022 | ES2023 | ES2024 | ES2025 | Fetch API | Service Worker |
|-----------|--------|--------|--------|--------|--------|--------|-----------|----------------|
| **语法级支持 (不可 Polyfill)** | ✅ 4项 | ✅ 2项 | ✅ 3项 | ✅ 1项 | ✅ 1项 | ✅ 1项 | ❌ 无 | ❌ 无 |
| **运行时 API (可 Polyfill)** | ✅ 2项 | ✅ 2项 | ✅ 2项 | ✅ 2项 | ✅ 3项 | ✅ 2项 | ✅ | 🟡 部分 |
| **TypeScript 类型支持** | 🟢 3.9+ | 🟢 4.1+ | 🟢 4.3+ | 🟢 4.9+ | 🟢 5.3+ | 🟢 5.7+ | 🟢 内置 | 🟢 内置 |
| **Babel 预设支持** | 🟢 `@babel/preset-env` | 🟢 同上 | 🟢 同上 | 🟢 同上 | 🟢 同上 | 🟡 需插件 | 🟢 同上 | 🔵 需配置 |
| **ESLint 解析** | 🟢 `espree` | 🟢 同上 | 🟢 同上 | 🟢 同上 | 🟢 同上 | 🟡 需更新 | 🟢 同上 | 🟢 同上 |
| **Bundler Tree Shaking** | 🟢 支持 | 🟢 支持 | 🟢 支持 | 🟢 支持 | 🟢 支持 | 🟢 支持 | 🟢 支持 | 🟢 支持 |
| **SSR/Node.js 兼容** | 🟢 12+ | 🟢 15+ | 🟢 16.6+ | 🟢 20+ | 🟢 22+ | 🟢 23+ | 🟢 18+ | 🔴 仅浏览器 |
| **Worker/边缘运行时可使用** | 🟢 是 | 🟢 是 | 🟢 是 | 🟢 是 | 🟢 是 | 🟡 部分 | 🟢 是 | 🟢 是 |
| **调试/Source Map 友好度** | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |

## 版本支持速查表

| 目标环境 | Chrome | Firefox | Safari | Edge | Node.js |
|----------|--------|---------|--------|------|---------|
| **现代浏览器 (2026)** | 122+ | 136+ | 17+ | 122+ | 22+ |
| **ES2024 完整支持** | 122+ | 127+ | 17+ | 122+ | 22+ |
| **ES2023 完整支持** | 110+ | 115+ | 16+ | 110+ | 20+ |
| **ES2022 完整支持** | 92+ | 90+ | 15.4+ | 92+ | 16.6+ |
| **ES2021 完整支持** | 85+ | 79+ | 14+ | 85+ | 15+ |
| **ES2020 完整支持** | 80+ | 74+ | 13.1+ | 80+ | 14+ |

## Polyfill 与 Transpilation 策略

| 策略 | 适用场景 | 工具 |
|------|----------|------|
| **Babel 转译** | 需支持旧浏览器 | `@babel/preset-env` |
| **core-js** | 完整 polyfill | `core-js@3` + `babel` |
| **按需 polyfill** | 现代浏览器为主 | `polyfill.io` / `core-js-pure` |
| **TypeScript 目标** | 编译到指定 ES 版本 | `tsconfig.json` `target` |
| **Vite 构建** | 自动 polyfill | `@vitejs/plugin-legacy` |

```json
// tsconfig.json — TypeScript 编译目标配置
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2024", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "Bundler"
  }
}
```

```javascript
// babel.config.js — Babel 按需 polyfill
module.exports = {
  presets: [
    ['@babel/preset-env', {
      useBuiltIns: 'usage',
      corejs: '3.40',
      targets: {
        chrome: '90',
        firefox: '90',
        safari: '14',
        node: '18',
      },
    }],
    '@babel/preset-typescript',
  ],
}
```

```typescript
// vite.config.ts — Vite 旧浏览器支持
import { defineConfig } from 'vite'
import legacy from '@vitejs/plugin-legacy'

export default defineConfig({
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11'],
      modernPolyfills: true,
    }),
  ],
})
```

## 选型建议

| 目标用户群 | 推荐 baseline | 配置 |
|------------|---------------|------|
| 内部企业应用 | ES2022 + Fetch + Streams | `target: ES2022` |
| 现代消费者产品 | ES2024 + 全部 Web API | `target: ES2024` |
| 需兼容旧浏览器 | ES2020 + Babel polyfill | `target: ES2020` + core-js |
| Node.js 服务端 | ES2024 / 最新 LTS | `target: ES2024` |
| 边缘计算 (Cloudflare/Deno) | ES2024 + Web API | 原生支持 |

## 检测与降级策略

```typescript
// 特性检测 + 优雅降级
async function copyToClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
  } else {
    // 降级：execCommand
    const textarea = document.createElement('textarea')
    textarea.value = text
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
  }
}

// ES2024 groupBy 检测
if ('groupBy' in Object) {
  Object.groupBy(items, keyFn)
} else {
  // 手动实现
  items.reduce((acc, item) => {
    const key = keyFn(item)
    ;(acc[key] ??= []).push(item)
    return acc
  }, {} as Record<string, typeof items>)
}
```
