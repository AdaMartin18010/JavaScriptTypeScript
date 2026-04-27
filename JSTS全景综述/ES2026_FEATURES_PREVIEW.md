---
last-updated: 2026-04-27
review-cycle: 6 months
next-review: 2026-10-27
status: current
---
# ES2026 新特性预览：TC39 Stage 3/4 提案完整分析

> 文档版本: 1.0.0
> 最后更新: 2026-04-16
> 参考来源: TC39 Proposals GitHub、ECMA-262 草案、官方规范文档

---

## 目录

- [ES2026 新特性预览：TC39 Stage 3/4 提案完整分析](#es2026-新特性预览tc39-stage-34-提案完整分析)
  - [目录](#目录)
  - [1. TC39 提案流程概述](#1-tc39-提案流程概述)
  - [2. Stage 4 提案（已标准化）](#2-stage-4-提案已标准化)
    - [2.1 Temporal API](#21-temporal-api)
      - [提案状态](#提案状态)
      - [动机与背景](#动机与背景)
      - [核心类型体系](#核心类型体系)
      - [语法形式与使用示例](#语法形式与使用示例)
        - [Instant - 精确时间点](#instant---精确时间点)
        - [PlainDate - 日历日期](#plaindate---日历日期)
        - [ZonedDateTime - 带时区的日期时间](#zoneddatetime---带时区的日期时间)
        - [Duration - 时间间隔](#duration---时间间隔)
        - [与 Date 的关系](#与-date-的关系)
      - [语义分析](#语义分析)
    - [2.2 Explicit Resource Management](#22-explicit-resource-management)
      - [提案状态](#提案状态-1)
      - [动机与背景](#动机与背景-1)
      - [语法形式](#语法形式)
        - [`using` 声明 - 同步资源](#using-声明---同步资源)
        - [`await using` 声明 - 异步资源](#await-using-声明---异步资源)
      - [核心机制](#核心机制)
      - [使用示例](#使用示例)
        - [文件操作](#文件操作)
        - [数据库连接池](#数据库连接池)
        - [DisposableStack - 复合资源管理](#disposablestack---复合资源管理)
        - [AsyncDisposableStack](#asyncdisposablestack)
      - [语义分析](#语义分析-1)
      - [与现有特性的关系](#与现有特性的关系)
  - [3. Stage 3 提案（候选阶段）](#3-stage-3-提案候选阶段)
    - [3.1 Decorators](#31-decorators)
      - [提案状态](#提案状态-2)
      - [动机与背景](#动机与背景-2)
      - [语法形式](#语法形式-1)
      - [装饰器类型与语义](#装饰器类型与语义)
        - [类装饰器](#类装饰器)
        - [方法装饰器](#方法装饰器)
        - [Getter/Setter 装饰器](#gettersetter-装饰器)
        - [字段装饰器](#字段装饰器)
        - [访问器装饰器 (accessor)](#访问器装饰器-accessor)
        - [私有成员装饰](#私有成员装饰)
      - [Decorator Metadata（配套提案）](#decorator-metadata配套提案)
      - [与 TypeScript 装饰器的区别](#与-typescript-装饰器的区别)
      - [语义分析](#语义分析-2)
    - [3.2 Joint Iteration](#32-joint-iteration)
      - [提案状态](#提案状态-3)
      - [动机与背景](#动机与背景-3)
      - [API 设计](#api-设计)
        - [Iterator.zip](#iteratorzip)
        - [Iterator.zipKeyed](#iteratorzipkeyed)
      - [模式选项](#模式选项)
        - [shortest（默认）](#shortest默认)
        - [longest](#longest)
        - [strict](#strict)
      - [使用示例](#使用示例-1)
        - [并行遍历多个数组](#并行遍历多个数组)
        - [矩阵转置](#矩阵转置)
        - [数据表行转对象](#数据表行转对象)
        - [与异步迭代器配合](#与异步迭代器配合)
      - [语义分析](#语义分析-3)
      - [与现有特性的关系](#与现有特性的关系-1)
    - [3.3 近期状态变更提案与新增 Stage 3 成员](#33-近期状态变更提案与新增-stage-3-成员)
      - [Type Annotations 提案（已停滞 / 撤回）](#type-annotations-提案已停滞--撤回)
      - [Pattern Matching](#pattern-matching)
      - [Records \& Tuples（已正式 Withdrawn）](#records--tuples已正式-withdrawn)
      - [Float16Array](#float16array)
      - [Math.sumPrecise](#mathsumprecise)
      - [Atomics.pause](#atomicspause)
      - [Deferring Module Evaluation](#deferring-module-evaluation)
      - [Dynamic Code Brand Checks](#dynamic-code-brand-checks)
      - [Import Text](#import-text)
  - [4. 提案对比与采用建议](#4-提案对比与采用建议)
    - [特性就绪度矩阵](#特性就绪度矩阵)
    - [采用路线图](#采用路线图)
    - [迁移策略](#迁移策略)
      - [Temporal 迁移示例](#temporal-迁移示例)
      - [资源管理迁移示例](#资源管理迁移示例)
  - [5. 参考资源](#5-参考资源)
    - [官方规范](#官方规范)
    - [提案详情](#提案详情)
    - [实现与工具](#实现与工具)
    - [相关文章](#相关文章)

---

## 1. TC39 提案流程概述

TC39（Technical Committee 39）是负责 ECMAScript 标准化的委员会。提案通过以下阶段逐步成熟：

| 阶段 | 名称 | 状态说明 | 主要工作 |
|:---:|:---:|:---|:---|
| **Stage 0** | Strawperson | 草案阶段 | 初步想法，无准入门槛 |
| **Stage 1** | Proposal | 提案阶段 | 正式提案，委员会认可问题空间 |
| **Stage 2** | Draft | 草案阶段 | 设计解决方案，撰写规范初稿 |
| **Stage 2.7** | Candidate | 候选阶段 | 完整规范，等待测试和实现反馈 |
| **Stage 3** | Candidate | 候选阶段 | 推荐实现，收集生产环境反馈 |
| **Stage 4** | Finished | 完成阶段 | 标准化完成，纳入 ECMA-262 |

> **时间节点**: TC39 每年7月向 Ecma 大会提交规范。2月1日产生候选草案，3月会议合并 Stage 4 提案。

---

## 2. Stage 4 提案（已标准化）

### 2.1 Temporal API

#### 提案状态

| 属性 | 详情 |
|:---|:---|
| **当前阶段** | ✅ Stage 4（2026年3月达到） |
| **预计纳入** | ES2026（第17版） |
| **实现状态** | Firefox 139+、Chrome 144+、Edge 144+ 已支持 |
| **Champions** | Philipp Dunkel, Maggie Johnson-Pint, Matt Johnson-Pint, Brian Terlson, Shane Carr, Ujjwal Sharma, Philip Chimento, Jason Williams, Justin Grant |
| **规范文档** | [tc39.es/proposal-temporal](https://tc39.es/proposal-temporal/) |

#### 动机与背景

JavaScript 的 `Date` 对象自1995年诞生以来一直是开发者的痛点：

- **可变性**: 方法调用会修改原对象
- **0索引月份**: 一月是0，十二月是11
- **时区支持缺失**: 仅支持本地时间和UTC
- **解析不一致**: 不同浏览器解析行为不同
- **精度限制**: 毫秒级精度无法满足高精度需求

Temporal 是 ECMAScript 历史上最大的新增特性（自 ES2015 以来），测试套件包含约4500个测试用例。

#### 核心类型体系

```
┌─────────────────────────────────────────────────────────────┐
│                      Temporal API 类型架构                    │
├─────────────────────────────────────────────────────────────┤
│  Temporal.Instant        →  时间点（纳秒精度，UTC）            │
│  Temporal.PlainDate      →  日历日期（无时区）                 │
│  Temporal.PlainTime      →  时间（无日期）                    │
│  Temporal.PlainDateTime  →  日期+时间（无时区）                │
│  Temporal.ZonedDateTime  →  带时区的日期时间                  │
│  Temporal.PlainYearMonth →  年月（如 2026-04）               │
│  Temporal.PlainMonthDay  →  月日（如 04-08，用于生日等）      │
│  Temporal.Duration       →  时间间隔                          │
└─────────────────────────────────────────────────────────────┘
```

#### 语法形式与使用示例

##### Instant - 精确时间点

```javascript
// 获取当前时间戳
const now = Temporal.Now.instant();
console.log(now.toString()); // "2026-04-08T06:00:00.000000001Z"

// 从字符串解析
const instant = Temporal.Instant.from("2026-04-08T14:00:00+08:00");

// 纳秒精度时间戳
console.log(now.epochNanoseconds); //  bigint
console.log(now.epochMilliseconds); //  number

// 时间运算
const tomorrow = now.add({ hours: 24 });
const yesterday = now.subtract({ days: 1 });
```

##### PlainDate - 日历日期

```javascript
// 当前日期
const today = Temporal.Now.plainDateISO();

// 从对象创建
const date = Temporal.PlainDate.from({ year: 2026, month: 4, day: 8 });

// 日期计算（不可变）
const nextMonth = date.add({ months: 1 }); // 2026-05-08
const lastWeek = date.subtract({ weeks: 1 }); // 2026-04-01

// 比较
const comparison = Temporal.PlainDate.compare(date1, date2); // -1, 0, 1

// 查询
console.log(date.dayOfWeek);    // 3 (星期三，周一=1)
console.log(date.daysInMonth);  // 30
console.log(date.inLeapYear);   // false
```

##### ZonedDateTime - 带时区的日期时间

```javascript
// 获取特定时区的当前时间
const tokyoNow = Temporal.Now.zonedDateTimeISO('Asia/Tokyo');
const nyNow = Temporal.Now.zonedDateTimeISO('America/New_York');

// 创建带时区的时间
const meeting = Temporal.ZonedDateTime.from({
  year: 2026,
  month: 4,
  day: 8,
  hour: 14,
  minute: 30,
  timeZone: 'Asia/Shanghai'
});

// 时区转换
const meetingInTokyo = meeting.withTimeZone('Asia/Tokyo');

// 处理夏令时 (DST-safe)
const springForward = Temporal.ZonedDateTime.from({
  year: 2026,
  month: 3,
  day: 8,
  hour: 2,
  minute: 30,
  timeZone: 'America/New_York' // 自动处理不存在的时刻
});
```

##### Duration - 时间间隔

```javascript
// 创建持续时间
const duration = Temporal.Duration.from({ hours: 2, minutes: 30 });

// 链式计算
const total = duration.add({ minutes: 15 }).subtract({ seconds: 30 });

// 格式化
const formatted = duration.toString(); // "PT2H29M30S"

// 归一化（考虑日历）
const date = Temporal.PlainDate.from("2026-01-31");
const nextMonth = date.add({ months: 1 }); // 自动处理 2月只有28天的情况
```

##### 与 Date 的关系

| 特性 | Date | Temporal |
|:---|:---|:---|
| 可变性 | ❌ 可变 | ✅ 不可变 |
| 时区支持 | 本地/UTC 仅 | ✅ 完整 IANA 时区支持 |
| 精度 | 毫秒 | ✅ 纳秒 |
| 日历系统 | 仅公历 | ✅ 多日历支持 |
| 类型安全 | 单一类型 | ✅ 多个强类型 |
| 字符串解析 | 不一致 | ✅ ISO 8601 / RFC 9557 |

```javascript
// 与旧 Date 互操作
const legacyDate = new Date();
const instant = legacyDate.toTemporalInstant();

const newDate = new Date(instant.epochMilliseconds);
```

#### 语义分析

**不可变性保证**:

```javascript
const date = Temporal.PlainDate.from("2026-04-08");
const nextDay = date.add({ days: 1 });

console.log(date.toString());   // "2026-04-08" (未改变)
console.log(nextDay.toString()); // "2026-04-09" (新对象)
```

**时区安全运算**:

```javascript
// 跨越夏令时边界
const beforeDST = Temporal.ZonedDateTime.from("2026-03-07T00:00[America/New_York]");
const afterDST = beforeDST.add({ days: 1 });
// 自动处理 DST 转换，保持24小时间隔
```

**大数支持**:

```javascript
// 处理超过 Number.MAX_SAFE_INTEGER 的时间戳
const ancient = Temporal.Instant.fromEpochNanoseconds(-8640000000000000000n);
```

---

### 2.2 Explicit Resource Management

#### 提案状态

| 属性 | 详情 |
|:---|:---|
| **当前阶段** | ✅ Stage 4（2025年6月达到） |
| **已纳入** | ES2025 |
| **实现状态** | TypeScript 5.2+、Babel 7.22+、Firefox 已支持 |
| **Champion** | Ron Buckton |
| **规范文档** | [tc39.es/proposal-explicit-resource-management](https://tc39.es/proposal-explicit-resource-management/) |

#### 动机与背景

资源管理是软件开发中的常见模式：

- 文件句柄需要关闭
- 数据库连接需要释放
- 锁需要解锁
- 事件监听需要移除

传统的 `try-finally` 模式繁琐且容易出错：

```javascript
// 传统方式
const file = openFile("data.txt");
try {
  write(file, "content");
} finally {
  file.close(); // 容易遗漏
}
```

#### 语法形式

##### `using` 声明 - 同步资源

```javascript
{
  using file = openFile("data.txt");
  write(file, "Hello, World!");
} // 块结束时自动调用 file[Symbol.dispose]()
```

##### `await using` 声明 - 异步资源

```javascript
async function processData() {
  {
    await using db = await connectToDatabase();
    await db.query("SELECT * FROM users");
  } // 块结束时自动 await db[Symbol.asyncDispose]()
}
```

#### 核心机制

**Symbol.dispose**:

```javascript
const disposable = {
  [Symbol.dispose]() {
    console.log("资源已释放");
    cleanup();
  }
};

{
  using res = disposable;
  // 使用 res
} // 自动调用 Symbol.dispose
```

**Symbol.asyncDispose**:

```javascript
const asyncDisposable = {
  async [Symbol.asyncDispose]() {
    await cleanupAsync();
  }
};

async function main() {
  {
    await using res = asyncDisposable;
    // 使用 res
  } // 自动 await Symbol.asyncDispose
}
```

#### 使用示例

##### 文件操作

```javascript
import { open } from 'node:fs/promises';

// 为 FileHandle 添加 Symbol.asyncDispose
Object.defineProperty(FileHandle.prototype, Symbol.asyncDispose, {
  value: function() { return this.close(); }
});

async function processFile() {
  {
    await using file = await open('data.txt', 'w');
    await file.write('Hello');
    // 自动关闭文件
  }
}
```

##### 数据库连接池

```javascript
class DatabaseConnection {
  async connect() { /* ... */ }

  async [Symbol.asyncDispose]() {
    await this.close();
    console.log("数据库连接已释放");
  }
}

async function queryUsers() {
  {
    await using conn = await getConnection();
    const users = await conn.query("SELECT * FROM users");
    return users;
  } // 保证连接归还到池
}
```

##### DisposableStack - 复合资源管理

```javascript
class ResourceManager {
  #stack;

  constructor() {
    using stack = new DisposableStack();

    this.#logger = stack.use(new Logger());
    this.#cache = stack.use(new Cache());
    this.#metrics = stack.use(new MetricsCollector());

    // 转移所有权到实例
    this.#stack = stack.move();
  }

  [Symbol.dispose]() {
    this.#stack.dispose();
  }
}

// 使用
{
  using manager = new ResourceManager();
  // 所有资源在块结束时统一释放
}
```

##### AsyncDisposableStack

```javascript
async function initSystem() {
  await using stack = new AsyncDisposableStack();

  const db = stack.use(await connectDB());
  const cache = stack.use(await createCache());
  const mq = stack.use(await connectMessageQueue());

  // 即使抛出错误，所有资源也会按相反顺序释放
  await process(db, cache, mq);
}
```

#### 语义分析

**释放顺序**:

```javascript
{
  using a = createA(); // 先声明
  using b = createB(); // 后声明
} // b 先释放，然后 a 释放（LIFO）
```

**异常处理**:

```javascript
{
  using resource = createResource();
  throw new Error("出错");
} // 即使抛出错误，resource 仍会被释放
```

**与 try-finally 对比**:

| 场景 | try-finally | using |
|:---|:---|:---|
| 提前返回 | 需要手动处理 | ✅ 自动释放 |
| 异常抛出 | finally 块执行 | ✅ 自动释放 |
| 嵌套资源 | 深层嵌套 | ✅ 平级声明 |
| 代码可读性 | 资源声明与释放分离 | ✅ 声明即约定 |

#### 与现有特性的关系

```javascript
// 与 async/await 集成
async function* generateResources() {
  await using conn = await getConnection();
  yield conn.query("SELECT 1");
} // 迭代器结束时自动释放

// 与迭代器集成
class ManagedResource {
  *[Symbol.iterator]() {
    using inner = this.acquire();
    yield inner;
  }
}
```

---

## 3. Stage 3 提案（候选阶段）

### 3.1 Decorators

#### 提案状态

| 属性 | 详情 |
|:---|:---|
| **当前阶段** | 🟡 Stage 3 |
| **Champions** | Daniel Ehrenberg, Kristen Hewell Garrett |
| **TypeScript 支持** | 5.0+ |
| **Babel 支持** | @babel/plugin-proposal-decorators |
| **规范文档** | [tc39.es/proposal-decorators](https://tc39.es/proposal-decorators/) |
| **历史** | 2016年首次提出，经历多次重大修订 |

#### 动机与背景

装饰器模式允许在不修改原类定义的情况下，通过包装方式添加功能。这在以下场景非常有用：

- 日志记录和性能监控
- 属性验证和类型检查
- 依赖注入
- 缓存和记忆化
- 访问控制（认证/授权）

#### 语法形式

```javascript
// 装饰器表达式可以是：
@decorator              // 标识符
@namespace.decorator    // 成员访问
@decorator.factory()    // 函数调用
@(expression)           // 任意表达式（括号包裹）
```

#### 装饰器类型与语义

##### 类装饰器

```javascript
function logged(constructor) {
  return class extends constructor {
    constructor(...args) {
      console.log(`Creating instance with args: ${args}`);
      super(...args);
    }
  };
}

@logged
class Person {
  constructor(name) {
    this.name = name;
  }
}

const p = new Person("Alice"); // 日志: Creating instance with args: ["Alice"]
```

##### 方法装饰器

```javascript
function measure(target, context) {
  const original = target;

  return function(...args) {
    const start = performance.now();
    const result = original.call(this, ...args);
    const end = performance.now();
    console.log(`${context.name} took ${end - start}ms`);
    return result;
  };
}

class Calculator {
  @measure
  fibonacci(n) {
    return n < 2 ? n : this.fibonacci(n - 1) + this.fibonacci(n - 2);
  }
}
```

##### Getter/Setter 装饰器

```javascript
function lazy(target, context) {
  const cacheKey = Symbol(`lazy_${context.name}`);

  return function() {
    if (!this[cacheKey]) {
      this[cacheKey] = target.call(this);
    }
    return this[cacheKey];
  };
}

class DataLoader {
  @lazy
  get expensiveData() {
    console.log("Loading expensive data...");
    return fetch("/api/data").then(r => r.json());
  }
}
```

##### 字段装饰器

```javascript
function required(target, context) {
  return function(value) {
    if (value == null) {
      throw new TypeError(`${context.name} is required`);
    }
    return value;
  };
}

function readonly(target, context) {
  return function(value) {
    Object.defineProperty(this, context.name, {
      value,
      writable: false,
      configurable: false
    });
    return value;
  };
}

class User {
  @required
  @readonly
  id;

  @required
  name;
}
```

##### 访问器装饰器 (accessor)

```javascript
function tracked(target, context) {
  const { get, set } = target;
  const storage = Symbol(`_${context.name}`);

  return {
    get() {
      trackAccess(context.name);
      return get.call(this);
    },
    set(value) {
      const old = get.call(this);
      set.call(this, value);
      triggerUpdate(context.name, old, value);
    },
    init(value) {
      return value;
    }
  };
}

class Component {
  @tracked accessor count = 0;
}
```

##### 私有成员装饰

```javascript
function memoize(target, context) {
  const cache = new WeakMap();

  return function(...args) {
    if (!cache.has(this)) {
      cache.set(this, new Map());
    }
    const instanceCache = cache.get(this);
    const key = JSON.stringify(args);

    if (!instanceCache.has(key)) {
      instanceCache.set(key, target.apply(this, args));
    }
    return instanceCache.get(key);
  };
}

class MathOps {
  @memoize
  #expensive(n) {
    // 复杂计算
    return n * n;
  }

  compute(n) {
    return this.#expensive(n);
  }
}
```

#### Decorator Metadata（配套提案）

```javascript
function entity(name) {
  return function(target, context) {
    context.metadata.kind = "entity";
    context.metadata.name = name;
  };
}

function column(type) {
  return function(target, context) {
    if (!context.metadata.columns) {
      context.metadata.columns = [];
    }
    context.metadata.columns.push({
      name: context.name,
      type
    });
  };
}

@entity("users")
class User {
  @column("uuid")
  id;

  @column("varchar")
  name;
}

// 通过 Symbol.metadata 访问元数据
const metadata = User[Symbol.metadata];
console.log(metadata.kind); // "entity"
console.log(metadata.columns); // [{ name: "id", type: "uuid" }, ...]
```

#### 与 TypeScript 装饰器的区别

| 特性 | TS 旧装饰器 | TC39 Stage 3 装饰器 |
|:---|:---|:---|
| 执行时机 | 运行时立即执行 | 类定义后批量应用 |
| 元数据 | 依赖 reflect-metadata | 原生 Symbol.metadata |
| 参数数量 | 3-4个参数 | 2个参数 (target, context) |
| 静态分析 | 困难 | 优化，支持 tree-shaking |
| 私有成员 | 不支持 | 支持 |
| 访问器 | 不支持 | 支持 accessor 关键字 |

#### 语义分析

**执行顺序**:

```javascript
@decorator1
@decorator2
class Foo {
  @methodDec
  method() {}

  @fieldDec
  field;
}

// 执行顺序:
// 1. decorator2 (从上到下)
// 2. decorator1
// 3. methodDec
// 4. fieldDec
// 5. 类装饰器应用（从下到上）
```

---

### 3.2 Joint Iteration

#### 提案状态

| 属性 | 详情 |
|:---|:---|
| **当前阶段** | 🟡 Stage 3 (2025年11月确认) |
| **Champion** | Michael Ficarra |
| **规范文档** | [tc39.es/proposal-joint-iteration](https://tc39.es/proposal-joint-iteration/) |
| **Demo** | [在线演示](https://tc39.es/proposal-joint-iteration/demo/) |

#### 动机与背景

经常需要对多个位置对齐的迭代器进行同步遍历（如 Python 的 `zip`）。现有方案需要手动管理多个迭代器：

```javascript
// 传统方式 - 繁琐且容易出错
const keys = ['a', 'b', 'c'];
const values = [1, 2, 3];

for (let i = 0; i < Math.min(keys.length, values.length); i++) {
  console.log(keys[i], values[i]);
}
```

#### API 设计

##### Iterator.zip

将多个可迭代对象压缩成数组形式的迭代器：

```javascript
// 基本用法
const zipped = Iterator.zip([
  [0, 1, 2],
  [3, 4, 5],
  ['a', 'b', 'c']
]);

console.log([...zipped]);
// [[0, 3, 'a'], [1, 4, 'b'], [2, 5, 'c']]

// 与 Iterator helpers 链式使用
Iterator.zip([users, orders])
  .map(([user, order]) => ({ user, order }))
  .toArray();
```

##### Iterator.zipKeyed

将键值对形式的可迭代对象压缩成对象形式的迭代器：

```javascript
const data = Iterator.zipKeyed({
  name: ['Alice', 'Bob', 'Carol'],
  age: [25, 30, 35],
  city: ['NYC', 'LA', 'Chicago']
});

console.log([...data]);
// [
//   { name: 'Alice', age: 25, city: 'NYC' },
//   { name: 'Bob', age: 30, city: 'LA' },
//   { name: 'Carol', age: 35, city: 'Chicago' }
// ]
```

#### 模式选项

##### shortest（默认）

以最短的迭代器为准：

```javascript
Iterator.zip([
  [1, 2, 3, 4],
  ['a', 'b']
]).toArray();
// [[1, 'a'], [2, 'b']]
```

##### longest

以最长的迭代器为准，短的用填充值：

```javascript
// zip 使用数组填充
Iterator.zip(
  [[1, 2], ['a', 'b', 'c', 'd']],
  { mode: 'longest', padding: [null, 'x'] }
).toArray();
// [[1, 'a'], [2, 'b'], [null, 'c'], [null, 'd']]

// zipKeyed 使用对象填充
Iterator.zipKeyed(
  { a: [1, 2], b: ['x', 'y', 'z'] },
  { mode: 'longest', padding: { a: 0, b: '-' } }
).toArray();
// [{ a: 1, b: 'x' }, { a: 2, b: 'y' }, { a: 0, b: 'z' }]
```

##### strict

要求所有迭代器长度相同，否则抛出错误：

```javascript
Iterator.zip(
  [[1, 2], ['a', 'b', 'c']],
  { mode: 'strict' }
);
// RangeError: Iterator.zip called with iterators of different lengths
```

#### 使用示例

##### 并行遍历多个数组

```javascript
const names = ['file1.txt', 'file2.txt', 'file3.txt'];
const sizes = [1024, 2048, 4096];
const modified = [new Date('2026-01-01'), new Date('2026-02-01'), new Date('2026-03-01')];

for (const [name, size, date] of Iterator.zip([names, sizes, modified])) {
  console.log(`${name}: ${size} bytes, modified ${date.toISOString()}`);
}
```

##### 矩阵转置

```javascript
const matrix = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9]
];

const transposed = Iterator.zip(matrix).toArray();
// [[1, 4, 7], [2, 5, 8], [3, 6, 9]]
```

##### 数据表行转对象

```javascript
const headers = ['name', 'age', 'email'];
const rows = [
  ['Alice', 25, 'alice@example.com'],
  ['Bob', 30, 'bob@example.com']
];

const records = rows.map(row =>
  Object.fromEntries(Iterator.zip([headers, row]))
);
// 或使用 zipKeyed 如果数据是列式存储
```

##### 与异步迭代器配合

```javascript
// 假设有多个异步数据源
const usersAsync = fetchUsers();
const ordersAsync = fetchOrders();

for await (const [user, order] of AsyncIterator.zip([usersAsync, ordersAsync])) {
  // 处理配对的用户和订单
}
```

#### 语义分析

**早期终止**:

```javascript
const iter1 = [1, 2, 3][Symbol.iterator]();
const iter2 = ['a', 'b', 'c'][Symbol.iterator]();

for (const [n, s] of Iterator.zip([[1, 2, 3], ['a', 'b', 'c']])) {
  if (n === 2) break; // 自动调用所有底层迭代器的 return()
}
```

**惰性求值**:

```javascript
// 不会一次性消耗所有输入
const infinite = Iterator.zip([
  Iterator.range(0, Infinity),
  Iterator.range(100, Infinity)
]);

console.log(infinite.next().value); // [0, 100]
console.log(infinite.next().value); // [1, 101]
```

#### 与现有特性的关系

```javascript
// 与 Object.fromEntries 配合
const keys = ['a', 'b', 'c'];
const values = [1, 2, 3];
const obj = Object.fromEntries(Iterator.zip([keys, values]));
// { a: 1, b: 2, c: 3 }

// 与 Map 构造器配合
const map = new Map(Iterator.zip([keys, values]));

// 与解构配合
const pairs = Iterator.zip([users, permissions]);
for (const [user, perm] of pairs) {
  assignPermission(user, perm);
}
```

---

### 3.3 近期状态变更提案与新增 Stage 3 成员

#### Type Annotations 提案（已停滞 / 撤回）

| 属性 | 详情 |
|:---|:---|
| **当前阶段** | 🔴 已停滞（Stalled），2025 年中 TC39 未推进至 Stage 2 |
| **原因** | 与 TypeScript 生态的兼容性争议、语法空间冲突（与已有类型注释语法难以统一）、引擎实现方反对意见 |
| **影响** | 该提案的失败进一步巩固了 TypeScript 作为 JS 生态主导类型方言的地位，同时也促使 Node.js Type Stripping 等"擦除而非原生"路线获得更强支撑 |

> Type Annotations 提案的停滞并不意味着 JS 不会获得任何类型相关特性。相反，Structs、Composite Keys 以及未来可能的类型引导运行时（type-directed runtime）提案，代表了另一种"不引入类型语法但让运行时感知布局"的探索方向。

#### Pattern Matching

| 属性 | 详情 |
|:---|:---|
| **当前阶段** | 🟡 Stage 2.7 → Stage 3（2025 年底至 2026 年初推进中） |
| **Champions** | Jordan Harband, Mark S. Miller, Tab Atkins-Bittner |
| **规范文档** | [tc39.es/proposal-pattern-matching](https://tc39.es/proposal-pattern-matching/) |

Pattern Matching 旨在为 JavaScript 引入声明式的解构与匹配语法，核心形式如下：

```javascript
const result = match (res) {
  when ({ status: 200, body: String }) -> `Success: ${body}`
  when ({ status: 404 }) -> 'Not found'
  when ({ status: n }) if (n >= 500) -> 'Server error'
  default -> 'Unknown'
};
```

截至 2026-04，该提案已进入规范的最终打磨阶段，主要争议点在于 `when` 子句的完成值（completion value）语义与现有 `switch` 语句的兼容边界。若 2026 年中前能收集到两份独立实现反馈，有望进入 Stage 3 甚至 Stage 4 冲刺。

#### Records & Tuples（已正式 Withdrawn）

| 属性 | 详情 |
|:---|:---|
| **当前阶段** | 🔴 Withdrawn（2025-04-14 TC39 全会） |
| **撤回原因** | 按值深层比较（`===`）的性能预期不现实，引擎实现复杂度过高 |
| **替代方案** | **Composite / Composite Keys** 提案（Stage 1），聚焦 Map/Set 多值键场景 |

```javascript
// 原 Records & Tuples 语法（已作废）
// const rec = #{ a: 1 }; // 不再推进

// 替代：Composite Keys（Stage 1）
const key = Composite({ 0: "hello", 1: "world" });
const map = new Map();
map.set(key, 42);
console.log(map.has(Composite({ 0: "hello", 1: "world" }))); // true
```

#### Float16Array

| 属性 | 详情 |
|:---|:---|
| **当前阶段** | ✅ Stage 4（已纳入 ES2025） |
| **Champions** | Kevin Gibbons |
| **用途** | 16 位浮点数 TypedArray，适配 ML 推理与 GPU 数据交换 |

```javascript
const f16 = new Float16Array([1.0, 2.0, 3.0]);
console.log(f16.BYTES_PER_ELEMENT); // 2
// 与 WebGPU 的 f16 数据类型直接对齐
```

#### Math.sumPrecise

| 属性 | 详情 |
|:---|:---|
| **当前阶段** | ✅ Stage 4（已纳入 ES2025） |
| **Champions** | Kevin Gibbons |
| **用途** | 精确求和，避免浮点数累加误差（类似 Python 的 math.fsum） |

```javascript
// 传统加法存在精度误差
console.log(0.1 + 0.2 + 0.3); // 0.6000000000000001

// Math.sumPrecise 提供正确舍入的求和
console.log(Math.sumPrecise([0.1, 0.2, 0.3])); // 0.6
```

#### Atomics.pause

```javascript
// 在自旋等待时提示 CPU 降低功耗
while (!lockAcquired) {
  Atomics.pause(); // 微等待，减少能耗
  lockAcquired = Atomics.load(lock, 0);
}
```

| 属性 | 详情 |
|:---|:---|
| **用途** | 低功耗自旋锁提示 |
| **Champion** | Shu-yu Guo |
| **适用场景** | WebAssembly 互操作、高性能并发 |

#### Deferring Module Evaluation

```javascript
// 延迟模块求值，直到首次使用
import defer * as heavyModule from './heavy-module.js';

// heavyModule 此时还未执行
button.addEventListener('click', async () => {
  await heavyModule; // 此时才执行模块
  heavyModule.doSomething();
});
```

| 属性 | 详情 |
|:---|:---|
| **用途** | 优化启动性能，按需加载 |
| **Champions** | Yulia Startsev, Guy Bedford, Nicolò Ribaudo |

#### Dynamic Code Brand Checks

```javascript
// 安全地检查代码来源
import source code from "./user-code.js";

if (isCodeBrand(code, trustedBrand)) {
  eval(code); // 安全执行
}
```

| 属性 | 详情 |
|:---|:---|
| **用途** | 防止动态代码注入攻击 |
| **Champions** | Krzysztof Kotowicz, Mike Samuel, Nicolo Ribaudo |

#### Import Text

```javascript
// 直接导入文本内容
import text shaderCode from "./shader.glsl";
import text css from "./styles.css";

console.log(typeof shaderCode); // "string"
```

| 属性 | 详情 |
|:---|:---|
| **用途** | 原生支持导入文本资源 |
| **Champion** | Eemeli Aro |

> **说明**：`Array.fromAsync`、Set methods（`difference`、`intersection`、`union`、`symmetricDifference`）等提案已随 **ES2025** 正式发布，不再属于 ES2026 Preview 范畴。

---

## 4. 提案对比与采用建议

### 特性就绪度矩阵

| 提案 | 阶段 | 浏览器支持 | 生产可用 | 学习成本 | 优先级 |
|:---:|:---:|:---:|:---:|:---:|:---:|
| Temporal API | Stage 4 | ✅ 主流浏览器 | polyfill | 中等 | 🔥 高 |
| Explicit Resource Mgmt | Stage 4 | ✅ Firefox/TS | Babel | 低 | 🔥 高 |
| Decorators | Stage 3 | Babel/TS 5.0+ | 工具链 | 中等 | 🟡 中 |
| Joint Iteration | Stage 3 | polyfill | polyfill | 低 | 🟡 中 |
| Float16Array | Stage 4 | ✅ 主流引擎 | polyfill | 低 | 🟢 低 |
| Math.sumPrecise | Stage 4 | ✅ 主流引擎 | polyfill | 低 | 🟢 低 |
| Pattern Matching | Stage 2.7/3 | 无 | 不推荐 | 中等 | 🟡 中 |
| Import Text | Stage 3 | 构建工具 | 构建工具 | 低 | 🟢 低 |
| Type Annotations | 停滞 | — | — | — | ⚫ 不再关注 |
| Records & Tuples | Withdrawn | — | — | — | ⚫ 不再关注 |

> **ES2025 已发布特性（不再预览）**：`Array.fromAsync`、Iterator Helpers、Set methods（`difference` / `intersection` / `union` / `symmetricDifference`）、`Promise.withResolvers` 等。

### 采用路线图

```
2026 Q1-Q2                    2026 Q3-Q4                    2027+
    │                              │                          │
    ▼                              ▼                          ▼
┌─────────────┐            ┌─────────────┐            ┌─────────────┐
│  立即采用    │            │  评估试点    │            │  等待成熟    │
├─────────────┤            ├─────────────┤            ├─────────────┤
│ • Temporal  │            │ • Decorators│            │ • Pattern   │
│   (polyfill)│            │ • Joint     │            │   Matching  │
│ • using     │            │   Iteration │            │ • Stage 2   │
│   (Babel)   │            │ • Float16   │            │   提案       │
│             │            │ • sumPrecise│            │             │
└─────────────┘            └─────────────┘            └─────────────┘
```

### 迁移策略

#### Temporal 迁移示例

```javascript
// 从 Date 迁移到 Temporal

// 旧代码
const date = new Date();
date.setDate(date.getDate() + 1); // 可变！
const isoString = date.toISOString();

// 新代码
const date = Temporal.Now.plainDateISO();
const tomorrow = date.add({ days: 1 }); // 不可变
const isoString = tomorrow.toString();
```

#### 资源管理迁移示例

```javascript
// 从 try-finally 迁移到 using

// 旧代码
async function process() {
  const conn = await getConnection();
  try {
    await conn.query('SELECT 1');
  } finally {
    await conn.close();
  }
}

// 新代码
async function process() {
  await using conn = await getConnection();
  await conn.query('SELECT 1');
}
```

---

## 5. 参考资源

### 官方规范

- [TC39 Proposals 追踪](https://github.com/tc39/proposals)
- [ECMA-262 规范草案](https://tc39.es/ecma262/)
- [ECMA-402 国际化 API](https://tc39.es/ecma402/)

### 提案详情

| 提案 | GitHub | 规范文档 |
|:---|:---|:---|
| Temporal | [proposal-temporal](https://github.com/tc39/proposal-temporal) | [tc39.es/proposal-temporal](https://tc39.es/proposal-temporal/) |
| Explicit Resource Mgmt | [proposal-explicit-resource-management](https://github.com/tc39/proposal-explicit-resource-management) | [tc39.es/proposal-explicit-resource-management](https://tc39.es/proposal-explicit-resource-management/) |
| Decorators | [proposal-decorators](https://github.com/tc39/proposal-decorators) | [tc39.es/proposal-decorators](https://tc39.es/proposal-decorators/) |
| Joint Iteration | [proposal-joint-iteration](https://github.com/tc39/proposal-joint-iteration) | [tc39.es/proposal-joint-iteration](https://tc39.es/proposal-joint-iteration/) |
| Decorator Metadata | [proposal-decorator-metadata](https://github.com/tc39/proposal-decorator-metadata) | [tc39.es/proposal-decorator-metadata](https://tc39.es/proposal-decorator-metadata/) |
| Pattern Matching | [proposal-pattern-matching](https://github.com/tc39/proposal-pattern-matching) | [tc39.es/proposal-pattern-matching](https://tc39.es/proposal-pattern-matching/) |
| Float16Array | [proposal-float16array](https://github.com/tc39/proposal-float16array) | [tc39.es/proposal-float16array](https://tc39.es/proposal-float16array/) |
| Math.sumPrecise | [proposal-math-sum](https://github.com/tc39/proposal-math-sum) | [tc39.es/proposal-math-sum](https://tc39.es/proposal-math-sum/) |

### 实现与工具

- **Temporal Polyfill**: [js-temporal/temporal-polyfill](https://github.com/js-temporal/temporal-polyfill)
- **Babel 插件**: @babel/plugin-proposal-decorators, @babel/plugin-proposal-explicit-resource-management
- **TypeScript**: 5.0+ 支持新装饰器，5.2+ 支持 using/await using

### 相关文章

- [Temporal: The 9-Year Journey](https://bloomberg.github.io/js-blog/post/temporal/) - Bloomberg 团队回顾
- [TC39 Process Document](https://tc39.es/process-document/) - 提案流程官方文档

---

> **免责声明**: 本文档基于截至2026年4月的公开信息编写。TC39 提案在达到 Stage 4 之前可能发生变化。生产环境使用前请查阅最新规范。

---

*文档结束*
