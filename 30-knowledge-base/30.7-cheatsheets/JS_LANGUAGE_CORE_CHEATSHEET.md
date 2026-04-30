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

## 错误处理模式

```javascript
// try/catch/finally
try {
  riskyOperation();
} catch (e) {
  if (e instanceof TypeError) {
    console.error('类型错误:', e.message);
  } else {
    throw e; // 重新抛出未知错误
  }
} finally {
  cleanup(); // 无论成功与否都执行
}

// 全局错误捕获（浏览器）
window.addEventListener('error', (event) => {
  reportError({ message: event.message, stack: event.error?.stack });
});

// 全局未处理的 Promise 拒绝
window.addEventListener('unhandledrejection', (event) => {
  console.warn('Unhandled rejection:', event.reason);
  event.preventDefault(); // 阻止控制台报错
});

// Error Cause（ES2022）— 保留错误链
try {
  await fetchUser();
} catch (e) {
  throw new Error('Failed to load dashboard', { cause: e });
}
```

---

## 现代数组与对象方法（ES2023+）

```javascript
// Array.prototype.toSorted / toReversed / toSpliced（ES2023）
const nums = [3, 1, 4];
const sorted = nums.toSorted((a, b) => a - b); // [1, 3, 4]
const reversed = nums.toReversed(); // [4, 1, 3]

// Array.prototype.with — 不可变替换（ES2023）
const replaced = nums.with(1, 99); // [3, 99, 4]

// Array.prototype.findLast / findLastIndex（ES2023）
const lastEven = [1, 2, 3, 4].findLast(n => n % 2 === 0); // 4

// Object.groupBy（ES2024）
const inventory = [
  { name: 'asparagus', type: 'vegetables' },
  { name: 'banana', type: 'fruit' },
];
const grouped = Object.groupBy(inventory, ({ type }) => type);
// { vegetables: [...], fruit: [...] }

// Map.prototype.emplace（Stage 3 提案预览）
// const map = new Map();
// map.emplace('key', { insert: () => 'value', update: (existing) => existing + '!' });
```

---

## Map、Set 与 Weak 集合

```javascript
// Map — 任意键类型，保持插入顺序
const userAges = new Map([
  ['Alice', 30],
  ['Bob', 25],
]);
userAges.set('Charlie', 35);

// Set — 唯一值集合
const tags = new Set(['js', 'ts', 'js']); // { 'js', 'ts' }
tags.add('rust');

// WeakMap — 私有属性模式（见 WeakMap 节）
// WeakSet — 标记对象是否被处理过
const processed = new WeakSet();
function process(obj) {
  if (processed.has(obj)) return;
  processed.add(obj);
  // ...
}
```

---

## BigInt 与高精度整数

```javascript
// BigInt 用于超过 Number.MAX_SAFE_INTEGER 的整数
const huge = 9007199254740993n; // 超过 2^53 - 1
const another = BigInt('9007199254740993');

// 算术运算（不能混用 Number 和 BigInt）
const sum = huge + 1n; // ✅
// const bad = huge + 1; // ❌ TypeError

// 比较可以混用
console.log(1n === 1); // false（严格不等）
console.log(1n == 1);  // true（宽松相等）
console.log(1n < 2);   // true

// JSON 序列化需自定义
JSON.stringify({ value: huge }, (k, v) =>
  typeof v === 'bigint' ? v.toString() : v
);
// {"value":"9007199254740993"}
```

---

## AbortController 与可取消异步操作

```javascript
// 取消 fetch 请求
const controller = new AbortController();
const signal = controller.signal;

fetch('/api/slow', { signal })
  .then(r => r.json())
  .catch(err => {
    if (err.name === 'AbortError') {
      console.log('Request was cancelled');
    }
  });

// 5 秒后取消
setTimeout(() => controller.abort(), 5000);

// 组合多个信号（AbortSignal.any — ES2024+）
const ctrl1 = new AbortController();
const ctrl2 = new AbortController();
const combined = AbortSignal.any([ctrl1.signal, ctrl2.signal]);
fetch('/api', { signal: combined });
```

---

## Atomics 与 SharedArrayBuffer

```javascript
// 多线程共享内存原子操作
const sab = new SharedArrayBuffer(1024);
const int32 = new Int32Array(sab);

// 原子写入（线程安全）
Atomics.store(int32, 0, 42);

// 原子读取
const value = Atomics.load(int32, 0);

// 原子加法（返回旧值）
const oldValue = Atomics.add(int32, 1, 10);

// 等待与通知（用于 Worker 间同步）
// Atomics.wait(int32, 0, 42); // 挂起直到索引0的值不再是42
// Atomics.notify(int32, 0, 1); // 唤醒1个等待的线程
```

---

## Symbol.asyncIterator 与异步迭代协议

```javascript
// 自定义异步可迭代对象
class AsyncDataSource {
  constructor(urls) {
    this.urls = urls;
  }

  async *[Symbol.asyncIterator]() {
    for (const url of this.urls) {
      const resp = await fetch(url);
      yield await resp.json();
    }
  }
}

// 消费异步迭代器
const source = new AsyncDataSource(['/api/users/1', '/api/users/2']);
for await (const user of source) {
  console.log(user.name);
}

// for await...of 自动处理异步迭代
```

---

## 正则表达式进阶（ES2024+）

```javascript
// 具名捕获组
const re = /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/;
const match = '2026-04-29'.match(re);
console.log(match.groups); // { year: '2026', month: '04', day: '29' }

// 反向断言
const price = 'USD 100'.match(/(?<=USD )\d+/); // ['100']
const notPrice = 'EUR 100'.match(/(?<!USD )\d+/); // null

// dotAll 模式（s 标志）
const multiline = 'line1\nline2'.match(/line1.line2/s); // ✅ 匹配

// RegExp.escape（ES2025 Stage 3）
const literal = RegExp.escape('Hello. How are you?');
// 'Hello\\. How are you\\?'
new RegExp(literal).test('Hello. How are you?'); // true
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
- [JavaScript Error Cause Proposal](https://github.com/tc39/proposal-error-cause) — ES2022 Error Cause 提案
- [ES2023 New Array Features](https://dev.to/hemanth/es2023-new-array-features-3ek1) — 新数组方法详解
- [2ality — ES2024 Features](https://2ality.com/2024/01/ecmascript-2024.html) — Dr. Axel 的 ES2024 特性总结
- [TC39 Process Document](https://tc39.es/process-document/) — ECMAScript 提案阶段官方定义
- [MDN — Error Cause](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/cause) — Error Cause 文档
- [MDN — Array.prototype.toSorted](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/toSorted) — 不可变排序方法
- [Node.js Error Handling Best Practices](https://nodejs.org/en/learn/getting-started/error-handling) — Node.js 官方错误处理指南
- [MDN — BigInt](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt) — 高精度整数
- [MDN — AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController) — 可取消异步操作
- [MDN — Atomics](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Atomics) — 共享内存原子操作
- [MDN — SharedArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer) — 共享内存
- [MDN — Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) — 代理对象
- [MDN — Reflect](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Reflect) — 反射 API
- [MDN — FinalizationRegistry](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/FinalizationRegistry) — 垃圾回收回调
- [MDN — WeakRef](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakRef) — 弱引用
- [MDN — structuredClone](https://developer.mozilla.org/en-US/docs/Web/API/structuredClone) — 结构化克隆算法
- [MDN — Intl API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl) — 国际化 API
- [MDN — RegExp.escape](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/escape) — 正则表达式转义
- [MDN — Symbol.asyncIterator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/asyncIterator) — 异步迭代协议
- [HTML Living Standard — Structured Clone Algorithm](https://html.spec.whatwg.org/multipage/structured-data.html#safe-passing-of-structured-data) — 结构化克隆规范
- [V8 Blog — Understanding V8 Bytecode](https://v8.dev/blog/understanding-v8-bytecode) — V8 字节码解析
- [V8 Blog — TurboFan JIT](https://v8.dev/blog/turbofan-jit) — JIT 编译器原理

---

*最后更新: 2026-04-29*
