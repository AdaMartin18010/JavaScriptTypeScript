# ES2022 新特性

> **定位**：`20-code-lab/20.1-fundamentals-lab/ecmascript-evolution/es2022`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块聚焦 ECMAScript 2022 标准新增的 6 项核心特性，解决 JavaScript 在类封装、模块顶层 await、数组负索引、错误原因链等方面的表达能力不足。

### 1.2 形式化基础

| 特性 | 规范章节 | 状态 |
|------|----------|------|
| 类私有字段与方法 | ECMA-262 §15.7.3 | Stage 4 (ES2022) |
| 类静态块 | ECMA-262 §15.7.13 | Stage 4 (ES2022) |
| 顶层 await | ECMA-262 §16.6 | Stage 4 (ES2022) |
| `Array.prototype.at` | ECMA-262 §23.1.3.1 | Stage 4 (ES2022) |
| `Object.hasOwn` | ECMA-262 §20.1.2.10 | Stage 4 (ES2022) |
| 错误原因（Error Cause） | ECMA-262 §20.5.8.1 | Stage 4 (ES2022) |

### 1.3 关键概念

| 特性 | 定义 | 关联 |
|------|------|------|
| 私有字段 `#x` | 类实例上真正的私有属性，外部不可访问 | TypeScript `private`（编译时） |
| 私有方法 `#fn()` | 类实例上的私有方法 | 闭包模拟私有 |
| 静态块 `static {}` | 类静态初始化代码块 | 静态属性赋值 |
| 顶层 await | 模块顶层直接使用 `await`，无需包裹 `async` | IIFE + async |
| `.at()` | 支持负索引的数组/字符串访问 | `arr[arr.length - 1]` |
| `Error.cause` | 错误链化，保留原始错误上下文 | 错误包装模式 |

---

## 二、设计原理

### 2.1 为什么存在

ES2022 标志着 JavaScript 类模型向成熟面向对象语言靠拢：私有字段提供运行时的真正封装，解决了 TypeScript `private` 仅编译时检查的局限；顶层 await 简化模块初始化逻辑；`.at()` 使负索引访问成为一等公民；`Error.cause` 支持错误链的可观测性。

### 2.2 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 私有字段 `#x` | 运行时真正私有、不可反射 | 语法新、不支持旧引擎 | 需要强封装 |
| TypeScript `private` | 广泛支持、IDE 友好 | 编译后消失、可被绕过 | 一般封装需求 |
| WeakMap 私有 | 运行时私有 | 样板代码多、性能开销 | 旧环境兼容 |

### 2.3 与相关技术的对比

私有字段 vs TypeScript `private`：前者是运行时语言特性，通过 WeakMap-like 机制实现；后者仅编译时检查，转译后变为普通属性。顶层 await vs 模块 IIFE：前者是声明式，后者是命令式包装。

---

## 三、实践映射

### 3.1 类私有字段与方法

```typescript
class BankAccount {
  #balance: number = 0;          // 私有字段
  #transactions: string[] = [];   // 私有字段

  constructor(initial: number) {
    this.#balance = initial;
  }

  // 私有方法
  #log(message: string): void {
    this.#transactions.push(`${Date.now()}: ${message}`);
  }

  deposit(amount: number): void {
    if (amount <= 0) throw new Error('Invalid amount', { cause: 'NEGATIVE_DEPOSIT' });
    this.#balance += amount;
    this.#log(`Deposited ${amount}`);
  }

  get balance(): number {
    return this.#balance;
  }

  // 静态私有字段
  static #bankName = 'Universal Bank';
  static get bankName(): string {
    return this.#bankName;
  }
}

const account = new BankAccount(100);
account.deposit(50);
console.log(account.balance); // 150
// account.#balance; // SyntaxError: Private field must be declared in enclosing class
```

### 3.2 类静态块

```typescript
class DatabaseConfig {
  static host: string;
  static port: number;
  static credentials: { user: string; pass: string };

  static {
    // 复杂的静态初始化逻辑
    const env = process.env.NODE_ENV || 'development';
    const configs: Record<string, { host: string; port: number }> = {
      development: { host: 'localhost', port: 5432 },
      production: { host: 'db.production.internal', port: 5432 },
    };
    this.host = configs[env].host;
    this.port = configs[env].port;
  }

  static {
    // 可以有多个 static 块，按顺序执行
    this.credentials = { user: 'app', pass: 'secret' };
  }
}
```

### 3.3 顶层 await

```typescript
// config.ts — 模块顶层直接 await
const configResponse = await fetch('/api/config');
export const config = await configResponse.json();

// db.ts — 依赖 config 的初始化
import { config } from './config.js';
export const db = await createConnection(config.database);

// main.ts — 导入即就绪
import { db } from './db.js';
// db 已初始化完成，可直接使用
await db.query('SELECT 1');
```

### 3.4 Array.prototype.at

```typescript
const arr = ['a', 'b', 'c', 'd'];

// 正索引
arr.at(0);  // 'a'
arr.at(2);  // 'c'

// 负索引
arr.at(-1); // 'd' — 最后一个
arr.at(-2); // 'c' — 倒数第二个

// 对比传统写法
const lastLegacy = arr[arr.length - 1];
const lastModern = arr.at(-1);

// 字符串同样适用
const str = 'hello';
str.at(-1); // 'o'
```

### 3.5 Object.hasOwn

```typescript
const obj = { foo: 1 };
Object.setPrototypeOf(obj, { bar: 2 });

// 仅检查自有属性
Object.hasOwn(obj, 'foo'); // true
Object.hasOwn(obj, 'bar'); // false（继承属性）

// 对比 Object.prototype.hasOwnProperty
obj.hasOwnProperty('foo'); // true
// 但可能被覆盖或对象没有该方法
// Object.hasOwn 更安全
```

### 3.6 Error Cause

```typescript
async function fetchUserData(userId: string) {
  try {
    const response = await fetch(`/api/users/${userId}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`, {
        cause: { status: response.status, url: response.url },
      });
    }
    return await response.json();
  } catch (error) {
    throw new Error(`Failed to fetch user ${userId}`, { cause: error });
  }
}

// 使用
try {
  await fetchUserData('123');
} catch (e) {
  console.error(e.message);          // Failed to fetch user 123
  console.error(e.cause?.message);   // HTTP 404
  console.error(e.cause?.cause);     // { status: 404, url: '...' }
}
```

### 3.7 常见误区

| 误区 | 正确理解 |
|------|---------|
| 私有字段可被反射获取 | `#x` 是硬私有，Reflect.ownKeys 不可见 |
| 顶层 await 可在任意脚本使用 | 仅 ESM 模块顶层可用，普通脚本不行 |
| `.at()` 会修改原数组 | 纯读取操作，无副作用 |
| `Object.hasOwn` 检查继承链 | 仅检查自有属性，与 `in` 运算符不同 |

---

## 四、权威参考

- [ECMA-262 — 2022 Language Specification](https://262.ecma-international.org/13.0/) — 官方规范
- [MDN — Private class features](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_class_fields) — Mozilla 文档
- [MDN — Top-level await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await#top_level_await) — Mozilla 文档
- [MDN — Array.prototype.at](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/at) — Mozilla 文档
- [MDN — Object.hasOwn](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwn) — Mozilla 文档
- [V8 Blog — ES2022 Features](https://v8.dev/features/tags/es2022) — V8 引擎实现解析

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
