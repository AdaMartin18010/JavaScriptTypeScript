---
category: language-core
dimension: 语言核心
created: 2026-04-27
---

# CATEGORY.md — 01-ecmascript-evolution

## 所属维度

**语言核心（Language Core）**

## 边界说明

本模块专注于 ECMAScript 语言规范的版本演进，涵盖从 ES3 到 ES2026 的语言特性变迁。所有内容均围绕 TC39 提案与 ECMA-262 规范展开，不涉及具体框架或运行时的实现差异（除非用于说明语义）。

**非本模块内容**：框架特性、构建工具演进、非标准扩展。

## 在语言核心体系中的位置

```
语言核心
  ├── 00-language-core            → 语法基础
  ├── 01-ecmascript-evolution（本模块）→ 规范演进史
  └── 10-fundamentals/10.1-language-semantics → 语义基础
```

## 子模块目录结构

| 子模块 | 说明 | 关键特性 |
|--------|------|----------|
| `es2015/` | ES6 核心特性实验（let/const、箭头函数、类、模块） | 块级作用域、Promise、模板字符串 |
| `es2016/` | Array.prototype.includes 与指数运算符 | `**`、`.includes()` |
| `es2017/` | 异步函数与 Object 扩展 | `async/await`、Object entries/values |
| `es2018/` | 异步迭代、Rest/Spread、正则增强 | `for-await-of`、命名捕获组 |
| `es2019/` | Array.flat、Object.fromEntries、trimStart/End | 数组扁平化、描述符简化 |
| `es2020/` | 空值合并、可选链、BigInt、动态 import | `??`、`?.`、BigInt、`import()` |
| `es2021/` | Promise.any、逻辑赋值、数字分隔符 | `||=`、`&&=`、`??=`、`|x|n` |
| `es2022/` | 类私有字段、顶层 await、.at() | `#field`、`await` at top-level、`.at()` |
| `es2023/` | Array.findLast、Hashbang 注释 | `.findLast()`、`.findLastIndex()`、shebang |
| `es2024/` | Array.groupBy、Promise.withResolvers | `Map.groupBy`、Atomics.waitAsync |
| `es2025/` | Set 方法、正则表达式修饰符 | `Set.prototype.intersection`、`/v` flag |

## 代码示例

### ES2015 解构与模块默认导出

```typescript
// es2015/destructure.ts — 声明式数据提取
interface ApiResponse {
  data: {
    user: {
      id: number;
      name: string;
      email: string;
      address: { city: string; zip: string };
    };
  };
}

function extractUser({ data: { user } }: ApiResponse) {
  // 嵌套解构 + 重命名
  const {
    id,
    name: displayName,
    address: { city },
  } = user;
  return { id, displayName, city };
}

// 数组解构与 rest
const [first, ...rest] = [10, 20, 30, 40];
console.log(first, rest); // 10 [20, 30, 40]

// 默认导出模块
export default function formatDate(d: Date): string {
  return d.toISOString().split('T')[0];
}
```

### ES2016 指数运算符与 Array.includes

```typescript
// es2016/math.ts
// 指数运算符 **（右结合）
console.log(2 ** 3);      // 8
console.log(2 ** 3 ** 2); // 512（等价于 2 ** (3 ** 2)）

// Array.prototype.includes（使用 SameValueZero 比较）
const nums = [NaN, +0, 1, 2];
console.log(nums.includes(NaN));  // true（与 indexOf 不同）
console.log(nums.includes(-0));   // true（SameValueZero 认为 +0 === -0）
console.log(nums.includes(3));    // false

// 与 indexOf 的对比：indexOf 使用严格相等，无法检测 NaN
console.log(nums.indexOf(NaN));   // -1
```

### ES2017 异步函数与字符串填充

```typescript
// es2017/async-values.ts
async function fetchData() {
  const res = await fetch('/api/data');
  return res.json();
}

// Object.entries / Object.values / Object.getOwnPropertyDescriptors
const obj = { a: 1, b: 2 };
console.log(Object.entries(obj));   // [['a', 1], ['b', 2]]
console.log(Object.values(obj));    // [1, 2]
console.log(Object.getOwnPropertyDescriptors(obj));
// { a: { value: 1, writable: true, enumerable: true, configurable: true }, ... }

// 字符串填充（String padding）
const code = '42'.padStart(5, '0');     // '00042'
const label = 'OK'.padEnd(6, '.');      // 'OK....'
console.log(code, label);
```

### ES2018 异步迭代与 for-await-of

```typescript
// es2018/async-iteration.ts — 消费异步数据源
async function* fetchPages(urls: string[]) {
  for (const url of urls) {
    const res = await fetch(url);
    yield res.json();
  }
}

// 顺序消费异步生成器
async function loadAll(urls: string[]) {
  const results: unknown[] = [];
  for await (const page of fetchPages(urls)) {
    results.push(page);
  }
  return results;
}

// 并行映射 + 顺序消费
async function* streamWithTimeout<T>(
  promises: Promise<T>[],
  ms: number
) {
  for (const p of promises) {
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), ms)
    );
    yield Promise.race([p, timeout]);
  }
}
```

### ES2019 数组扁平化与 Symbol.description

```typescript
// es2019/flat-and-symbols.ts
// Array.prototype.flat / flatMap
const nested = [1, [2, 3], [4, [5, 6]]];
console.log(nested.flat());       // [1, 2, 3, 4, [5, 6]]
console.log(nested.flat(2));      // [1, 2, 3, 4, 5, 6]

const sentences = ['Hello world', 'Good morning'];
console.log(sentences.flatMap(s => s.split(' '))); // ['Hello', 'world', 'Good', 'morning']

// Object.fromEntries（与 Object.entries 互逆）
const entries = [['a', 1], ['b', 2]];
const obj = Object.fromEntries(entries); // { a: 1, b: 2 }

// Symbol.description
const sym = Symbol('my-description');
console.log(sym.description); // 'my-description'

// String.prototype.trimStart / trimEnd
const str = '  hello  ';
console.log(str.trimStart()); // 'hello  '
console.log(str.trimEnd());   // '  hello'
```

### ES2020 可选链与空值合并

```typescript
// nullish-coalescing.ts — 安全访问深层属性
interface User {
  profile?: {
    settings?: {
      theme?: 'light' | 'dark';
    };
  };
}

function getTheme(user: User | null): 'light' | 'dark' {
  // 可选链 (?.) + 空值合并 (??)
  return user?.profile?.settings?.theme ?? 'light';
}

// 与逻辑或 (||) 的区别：仅对 null/undefined 回退，而非所有 falsy 值
const count = response.data.count ?? 0; // 0 不会被覆盖

// 动态 import
async function loadPlugin(name: string) {
  const plugin = await import(`./plugins/${name}.js`);
  return plugin.default;
}

// BigInt
const huge = 9007199254740991n;
console.log(huge + 1n); // 9007199254740992n
```

### ES2021 逻辑赋值与数字分隔符

```typescript
// logical-assignment.ts — 简洁的条件更新
const config: { timeout?: number; retries?: number } = {};

// 仅当左侧为 falsy 时才赋值
config.timeout ||= 5000;   // 等价于: config.timeout || (config.timeout = 5000)
config.retries ??= 3;      // 等价于: config.retries ?? (config.retries = 3)

// 与 &&= 结合用于条件清空
let cache: Map<string, any> | null = new Map();
cache &&= null; // 仅当 cache 存在时才置空

// 数字分隔符（Numeric separators）
const billion = 1_000_000_000;
const bytes = 0xFF_FF_FF_FF;
const binary = 0b1010_0001_1000_0101;
console.log(billion, bytes, binary);

// String.prototype.replaceAll
const query = 'SELECT * FROM users WHERE name = ? AND age = ?';
console.log(query.replaceAll('?', '$1')); // SELECT * FROM users WHERE name = $1 AND age = $1

// Promise.any
const fastest = await Promise.any([
  fetch('/api/fast'),
  fetch('/api/slow'),
]);
```

### ES2022 类私有字段与静态块

```typescript
// private-fields.ts — 真正的封装
class SecureCounter {
  #count = 0;              // 私有字段，外部不可访问
  static #instances = 0;    // 私有静态字段

  static {
    // 静态初始化块
    this.#instances = 0;
  }

  increment() {
    this.#count++;
    SecureCounter.#instances++;
    return this;
  }

  get count() {
    return this.#count;
  }

  static get instances() {
    return this.#instances;
  }
}

const c = new SecureCounter();
c.increment();
console.log(c.count);        // 1
// console.log(c.#count);    // SyntaxError: Private field must be declared

// Array.prototype.at（支持负索引）
const arr = ['a', 'b', 'c'];
console.log(arr.at(-1)); // 'c'
console.log(arr.at(-2)); // 'b'
```

### ES2023 不变数组方法与 findLast

```typescript
// find-last.ts — 从尾部搜索
const logs = [
  { level: 'info', msg: 'start' },
  { level: 'error', msg: 'db down' },
  { level: 'warn', msg: 'retry' },
  { level: 'error', msg: 'timeout' },
];

// 查找最后一个 error，无需 reverse()
const lastError = logs.findLast(l => l.level === 'error');
console.log(lastError?.msg); // 'timeout'

const lastErrorIndex = logs.findLastIndex(l => l.level === 'error');
console.log(lastErrorIndex); // 3

// 不变数组方法（返回新数组，不修改原数组）
const original = [3, 1, 4, 1, 5];

const sorted = original.toSorted((a, b) => a - b);
console.log(sorted);    // [1, 1, 3, 4, 5]
console.log(original);  // [3, 1, 4, 1, 5]（未改变）

const reversed = original.toReversed();
console.log(reversed);  // [5, 1, 4, 1, 3]

const spliced = original.toSpliced(1, 2, 9, 9);
console.log(spliced);   // [3, 9, 9, 1, 5]

const replaced = original.with(2, 99);
console.log(replaced);  // [3, 1, 99, 1, 5]

// Hashbang 注释支持
// #!/usr/bin/env node
// console.log('Hello from CLI');
```

### ES2024 Promise.withResolvers

```typescript
// deferred.ts — 更优雅的手动 resolve
function createDeferred<T>() {
  // 无需外部 let 声明
  const { promise, resolve, reject } = Promise.withResolvers<T>();
  return { promise, resolve, reject };
}

// 用例：将回调 API 包装为 Promise
function readFileAsync(path: string): Promise<string> {
  const { promise, resolve, reject } = Promise.withResolvers<string>();
  fs.readFile(path, 'utf8', (err, data) => {
    err ? reject(err) : resolve(data);
  });
  return promise;
}

// Map.groupBy / Object.groupBy
const people = [
  { name: 'Alice', age: 21 },
  { name: 'Bob', age: 17 },
  { name: 'Carol', age: 25 },
];

const byAdult = Object.groupBy(people, p => p.age >= 18 ? 'adult' : 'minor');
console.log(byAdult.adult?.length); // 2
```

### ES2025 Set 方法与正则 /v 标志

```typescript
// es2025/set-methods.ts — 集合代数运算
const admins = new Set(['alice', 'bob']);
const editors = new Set(['bob', 'charlie']);

const both = admins.intersection(editors);     // Set { 'bob' }
const either = admins.union(editors);          // Set { 'alice', 'bob', 'charlie' }
const onlyAdmins = admins.difference(editors); // Set { 'alice' }
const unique = admins.symmetricDifference(editors); // Set { 'alice', 'charlie' }

// 子集/超集判断
console.log(admins.isSubsetOf(either));  // true
console.log(either.isSupersetOf(admins)); // true

// 正则 /v 标志：支持集合运算与命名字符类
const re = /[\p{Emoji}--[\p{ASCII}]]/v; // 仅非 ASCII emoji
console.log(re.test('🚀')); // true
console.log(re.test('a'));  // false
```

## 关联索引

- [10-fundamentals/10.1-language-semantics/README.md](../../../10-fundamentals/10.1-language-semantics/README.md)
- [30-knowledge-base/30.2-categories/00-language-core.md](../../../30-knowledge-base/30.2-categories/00-language-core.md)

## 权威参考链接

| 资源 | 类型 | 链接 |
|------|------|------|
| MDN — JavaScript Guide | 文档 | [developer.mozilla.org/en-US/docs/Web/JavaScript/Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide) |
| TC39 Proposals | 仓库 | [github.com/tc39/proposals](https://github.com/tc39/proposals) — 所有阶段提案 |
| ECMA-262 规范 | 规范 | [tc39.es/ecma262](https://tc39.es/ecma262/) — 官方语言规范 |
| ES6 In Depth | 博客 | [hacks.mozilla.org/category/es6-in-depth](https://hacks.mozilla.org/category/es6-in-depth/) — Mozilla 深度系列 |
| Can I use... | 兼容性 | [caniuse.com](https://caniuse.com) — 浏览器特性兼容性矩阵 |
| V8 Blog | 引擎实现 | [v8.dev/blog](https://v8.dev/blog) — Google V8 新特性实现细节 |
| 2ality – JavaScript & more | 博客 | [2ality.com](https://2ality.com/) — Dr. Axel Rauschmayer 的 ECMAScript 深度解析 |
| TC39 Notes | 会议记录 | [github.com/tc39/notes](https://github.com/tc39/notes) — 标准委员会会议记录 |
| State of JS | 调研 | [stateofjs.com](https://stateofjs.com) — 开发者特性采用率调研 |
| Web Platform Tests | 测试套件 | [github.com/web-platform-tests/wpt](https://github.com/web-platform-tests/wpt) — 浏览器一致性测试 |
| JavaScript Weekly | 周刊 | [javascriptweekly.com](https://javascriptweekly.com/) — JS 生态每周精选 |
| Exploring JS | 书籍 | [exploringjs.com](https://exploringjs.com/) — Dr. Axel Rauschmayer 免费在线书籍 |
| TC39 Process | 规范 | [tc39.es/process-document](https://tc39.es/process-document/) — 提案阶段定义 |
| ECMAScript Compatibility Table | 兼容性 | [compat-table.github.io/compat-table](https://compat-table.github.io/compat-table/) — 特性支持矩阵 |
| JS Feature Proposals (Stage 3) | 提案 | [github.com/tc39/proposals/blob/main/README.md#stage-3](https://github.com/tc39/proposals/blob/main/README.md#stage-3) |
| MDN: New in JavaScript | 文档 | [developer.mozilla.org/en-US/docs/Web/JavaScript/New_in_JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/New_in_JavaScript) |
| JavaScript.info: The Modern JavaScript Tutorial | 教程 | [javascript.info](https://javascript.info/) |
| ES2025 Draft | 规范草案 | [tc39.es/ecma262](https://tc39.es/ecma262/) |

---

*最后更新: 2026-04-30*
