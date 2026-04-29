# ECMAScript 演进史 — 理论基础

## 1. ES3 → ES5: 标准化基础（1999-2009）

- 严格模式（"use strict"）
- JSON 原生支持
- Object.defineProperty
- Array.prototype 方法（forEach、map、filter、reduce）

#### 代码示例：ES5 严格模式与属性描述符

```javascript
// "use strict" 捕获常见编码错误
"use strict";

// 静默失败变为显式抛出
delete Object.prototype; // TypeError

// 禁止意外创建全局变量
function leak() {
  undeclaredVar = 1; // ReferenceError
}

// Object.defineProperty — 定义不可变属性
const config = {};
Object.defineProperty(config, "apiUrl", {
  value: "https://api.example.com",
  writable: false,
  enumerable: true,
  configurable: false,
});

config.apiUrl = "hacked"; // 严格模式下 TypeError，非严格模式静默失败
```

## 2. ES2015 (ES6): 语言革命（2015）

最大规模的单次更新：

- `let` / `const`: 块级作用域
- 箭头函数: 词法 this
- 类（class）: 语法糖包装原型继承
- 模块（import/export）: 标准化模块系统
- Promise: 异步编程基础
- 解构、展开运算符、模板字符串、默认参数
- Proxy / Reflect: 元编程能力

#### 代码示例：ES6 核心特性综合

```javascript
// 块级作用域 + 解构 + 默认参数
function createUser({ name, role = "guest", permissions = [] } = {}) {
  const id = crypto.randomUUID?.() ?? Math.random().toString(36);
  return { id, name, role, permissions };
}

// 箭头函数的词法 this
const counter = {
  count: 0,
  increment: () => {
    // 注意：箭头函数没有自己的 this，这里指向外层 this
    // 实际应使用普通函数方法：increment() { this.count++; }
  },
};

// Promise 链式调用
fetch("/api/user")
  .then((res) => res.json())
  .then((user) => console.log(user.name))
  .catch((err) => console.error(err));

// Proxy — 拦截对象操作
const validator = {
  set(target, prop, value) {
    if (prop === "age" && (typeof value !== "number" || value < 0)) {
      throw new TypeError("Age must be a positive number");
    }
    target[prop] = value;
    return true;
  },
};

const person = new Proxy({}, validator);
person.age = 25; // OK
// person.age = -1; // TypeError
```

## 3. ES2017: 异步里程碑

- `async` / `await`: Promise 的语法糖，线性化异步代码
- Object.entries / Object.values / Object.keys
- String padding（padStart / padEnd）

#### 代码示例：async/await 对比 Promise 链

```javascript
// Promise 链式写法
function getUserData(userId) {
  return fetch(`/api/users/${userId}`)
    .then((res) => {
      if (!res.ok) throw new Error(res.statusText);
      return res.json();
    })
    .then((user) => fetch(`/api/orders/${user.id}`))
    .then((res) => res.json())
    .catch((err) => {
      console.error("Failed:", err);
      return [];
    });
}

// async/await 写法 — 线性、易读
async function getUserDataAsync(userId) {
  try {
    const userRes = await fetch(`/api/users/${userId}`);
    if (!userRes.ok) throw new Error(userRes.statusText);
    const user = await userRes.json();

    const orderRes = await fetch(`/api/orders/${user.id}`);
    return await orderRes.json();
  } catch (err) {
    console.error("Failed:", err);
    return [];
  }
}
```

## 4. ES2020-2022: 实用增强

- **ES2020**: BigInt、动态 import、空值合并（??）、可选链（?.）
- **ES2021**: Promise.any、逻辑赋值（||=、&&=、??=）
- **ES2022**: 类私有字段（#private）、类静态块、at() 方法

#### 代码示例：ES2020-2022 特性

```javascript
// BigInt — 超过 Number.MAX_SAFE_INTEGER 的精确整数
const huge = 9007199254740993n;
const result = huge * 2n;
console.log(result); // 18014398509481986n

// 可选链 + 空值合并 — 安全深层访问
const userCity = user?.address?.city ?? "Unknown";

// 逻辑赋值 — 简洁的默认值设置
let config = null;
config ??= { theme: "dark", debug: false };
// 等价于: config = config ?? { theme: "dark", debug: false }

// 类私有字段（硬私有）
class BankAccount {
  #balance = 0; // 真正私有，外部不可访问

  deposit(amount) {
    if (amount > 0) this.#balance += amount;
  }

  getBalance() {
    return this.#balance;
  }
}

// 类静态块 — 复杂静态初始化
class Database {
  static #config;
  static connection;

  static {
    // 执行一次，类似类的 "constructor"
    this.#config = this.loadConfig();
    this.connection = this.createPool(this.#config);
  }

  static loadConfig() {
    return { host: "localhost", port: 5432 };
  }
  static createPool(cfg) {
    return { cfg, status: "connected" };
  }
}
```

## 5. ES2024-2026: 前沿特性

- **ES2024**: GroupBy、Promise.withResolvers、Array.prototype.toSorted
- **ES2025**: Set 方法（union/intersection/difference）、正则表达式增强
- **ES2026 (Stage 4)**: Temporal API（现代日期时间）、Math.sumPrecise、Error.isError

## 6. 版本特性矩阵

| 版本 | 年份 | 核心特性 | 影响力 |
|------|------|----------|--------|
| ES3 | 1999 | 基础语法 | 历史基准 |
| ES5 | 2009 | 严格模式、JSON、Object.defineProperty | ★★★☆☆ |
| ES2015 | 2015 | let/const、类、模块、Promise、Proxy | ★★★★★ |
| ES2017 | 2017 | async/await、Object.entries | ★★★★☆ |
| ES2020 | 2020 | 可选链、空值合并、BigInt | ★★★★☆ |
| ES2024 | 2024 | GroupBy、Promise.withResolvers | ★★★☆☆ |
| ES2025 | 2025 | Set 集合方法 | ★★★☆☆ |

## 7. 代码示例：Temporal API（ES2026）

```javascript
// 使用 Temporal 替代有缺陷的 Date API
const now = Temporal.Now.instant();
const date = Temporal.PlainDate.from('2026-04-28');
const time = Temporal.PlainTime.from('14:30:00');

// 时区感知运算
const zoned = now.toZonedDateTimeISO('Asia/Shanghai');
console.log(zoned.toString()); // 2026-04-28T14:30:00+08:00[Asia/Shanghai]

// 持续时间计算
const duration = Temporal.Duration.from({ days: 5, hours: 3 });
const future = date.add(duration);
```

#### 代码示例：Temporal 与 Date API 对比

```javascript
// === 旧 Date API — 充满陷阱 ===
const date = new Date(2026, 3, 28); // 3 = 四月（月份从0开始！）
date.setMonth(4); // 返回时间戳，修改原对象（可变！）
const iso = date.toISOString(); // 总是 UTC

// === Temporal — 不可变、明确、安全 ===
const plainDate = Temporal.PlainDate.from({ year: 2026, month: 4, day: 28 });
const nextMonth = plainDate.add({ months: 1 }); // 返回新对象，原对象不变
const withTime = plainDate.toPlainDateTime(Temporal.PlainTime.from("09:00:00"));

// 明确的时区处理
const shanghai = withTime.toZonedDateTime("Asia/Shanghai");
const ny = withTime.toZonedDateTime("America/New_York");
console.log(shanghai.toString()); // 2026-04-28T09:00:00+08:00[Asia/Shanghai]
console.log(ny.toString());       // 2026-04-27T21:00:00-04:00[America/New_York]
```

## 8. 提案阶段流程

```
Stage 0（Strawperson）→ Stage 1（Proposal）→ Stage 2（Draft）→ Stage 3（Candidate）→ Stage 4（Finished）
```

## 9. 权威参考

- [ECMA-262 Specification](https://tc39.es/ecma262/) — 官方语言规范
- [MDN — JavaScript Reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference) — Mozilla 开发者网络
- [TC39 Proposals](https://github.com/tc39/proposals) — 官方提案追踪仓库
- [JavaScript Weekly](https://javascriptweekly.com/) — 社区动态周报
- [Can I Use](https://caniuse.com/) — 浏览器特性兼容性查询
- [ES Compatibility Table](https://compat-table.github.io/compat-table/es6/) — Kangax 特性矩阵
- [V8 Blog — ES Features](https://v8.dev/blog/tags/ecmascript) — V8 引擎新特性实现
- [2ality Blog — ES2025](https://2ality.com/2024/12/ecmascript-2025.html) — Dr. Axel 年度特性深度解析
- [Temporal Proposal Playground](https://tc39.es/proposal-temporal/docs/) — Temporal API 交互文档

## 10. 与相邻模块的关系

- **00-language-core**: JavaScript 核心机制
- **10-fundamentals/10.1-language-semantics**: 语言语义基础
- **56-code-generation**: 新特性的编译与降级


---

## 10. 代码示例：ES2024 `Object.groupBy`

```javascript
// group-by.ts
const products = [
  { category: 'fruit', name: 'apple' },
  { category: 'vegetable', name: 'carrot' },
  { category: 'fruit', name: 'banana' },
];

const grouped = Object.groupBy(products, p => p.category);
console.log(grouped);
// {
//   fruit: [ { category: 'fruit', name: 'apple' }, { category: 'fruit', name: 'banana' } ],
//   vegetable: [ { category: 'vegetable', name: 'carrot' } ]
// }
```

## 11. 代码示例：ES2025 `Set` 集合运算

```javascript
// set-operations.ts
const setA = new Set([1, 2, 3, 4]);
const setB = new Set([3, 4, 5, 6]);

console.log(setA.intersection(setB)); // Set { 3, 4 }
console.log(setA.union(setB));        // Set { 1, 2, 3, 4, 5, 6 }
console.log(setA.difference(setB));   // Set { 1, 2 }
```

#### 代码示例：ES2025 Set 方法进阶

```javascript
// 集合代数运算
const evens = new Set([2, 4, 6, 8]);
const primes = new Set([2, 3, 5, 7]);

// 对称差：仅在 A 或 B 中，不同时存在
console.log(evens.symmetricDifference(primes)); // {4, 6, 8, 3, 5, 7}

// 子集/超集判断
console.log(new Set([2, 4]).isSubsetOf(evens));      // true
console.log(evens.isSupersetOf(new Set([2, 4, 6]))); // true

// 不相交判断
console.log(evens.isDisjointFrom(new Set([1, 3, 5]))); // true
```

## 12. 代码示例：动态 import 与 `import.meta`

```javascript
// dynamic-import.ts
async function loadPlugin(name: string) {
  const module = await import(`./plugins/${name}.js`);
  return module.default;
}

console.log(import.meta.url); // 当前模块 URL
```

#### 代码示例：import.meta 与条件加载

```javascript
// 基于环境的条件模块加载
async function loadAnalytics() {
  if (import.meta.env?.PROD) {
    const { initAnalytics } = await import("./analytics.prod.js");
    return initAnalytics();
  }
  // 开发环境使用 mock
  const { initMockAnalytics } = await import("./analytics.mock.js");
  return initMockAnalytics();
}

// import.meta.resolve — 解析模块 URL（Node.js 20+ / 浏览器实验性）
const wasmUrl = import.meta.resolve("./module.wasm");
console.log(wasmUrl); // file:///path/to/module.wasm
```

## 13. 新增权威参考链接

- [TC39 Process Document](https://tc39.es/process-document/) — 提案阶段官方说明
- [Temporal Proposal](https://github.com/tc39/proposal-temporal) — Temporal API 提案仓库
- [Set Methods Proposal](https://github.com/tc39/proposal-set-methods) — Set 集合方法提案
- [Promise.withResolvers Proposal](https://github.com/tc39/proposal-promise-with-resolvers) — Promise.withResolvers 提案
- [V8 Blog](https://v8.dev/blog) — Google V8 新特性实现细节
- [State of JS](https://stateofjs.com/) — 开发者特性采用率调研
- [2ality Blog](https://2ality.com/) — Dr. Axel Rauschmayer 的 ECMAScript 深度解析
- [MDN — JavaScript Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide)
- [Node.js ES Modules](https://nodejs.org/api/esm.html) — Node.js ESM 实现文档
