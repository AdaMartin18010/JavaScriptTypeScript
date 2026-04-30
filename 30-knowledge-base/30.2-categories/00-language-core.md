---
last-updated: 2026-04-27
review-cycle: 6 months
next-review: 2026-10-27
status: current
category-boundary: language-core
---

# 语言核心（Language Core）

> 本分类专注于 **JavaScript / TypeScript 语言本身**，与框架、运行时平台、工程工具链保持清晰的边界。
>
> **边界说明**：本文档仅收录与语法、语义、类型系统、执行模型、规范直接相关的内容。前端框架（React/Vue）、构建工具（Vite/Webpack）、运行时平台（Node.js/Deno 平台特性而非语言语义）等请参见其他分类。

---

## 📋 分类边界

### ✅ 属于语言核心

- 语法与语义（Syntax & Semantics）
- 类型系统（Type System）与类型推断
- 变量声明、作用域链、闭包
- 控制流：条件、循环、异常、生成器
- 执行模型：调用栈、执行上下文、事件循环
- 模块系统：ESM、CommonJS、模块解析
- 对象模型、原型链、Proxy / Reflect
- 异步编程：Promise、async/await、Task Queues
- ECMAScript 规范基础（抽象操作、内部方法、Realm）
- JavaScript / TypeScript 语义差异与类型擦除

### ❌ 不属于语言核心（参见其他分类）

| 内容 | 所属分类 |
|------|---------|
| React / Vue / Angular 等前端框架 | [01-frontend-frameworks.md](./01-frontend-frameworks.md) |
| Vite / Webpack / Rollup 等构建工具 | [03-build-tools.md](./03-build-tools.md) |
| Node.js 平台 API（fs、http、cluster） | [14-backend-frameworks.md](./14-backend-frameworks.md) |
| 测试框架（Jest / Vitest） | [12-testing.md](./12-testing.md) |
| 部署与 CI/CD | [13-ci-cd.md](./24-ci-cd-devops.md) |
| 数据库与 ORM | [11-orm-database.md](./11-orm-database.md) |

---

## 🗺️ 内容导航

### 深度理论系统

| 目录 | 专题 | 文件数 |
|------|------|--------|
| [jsts-language-core-system/01-type-system/](../../10-fundamentals/10.2-type-system/) | 类型系统 | 12+ |
| [jsts-language-core-system/02-variable-system/](../../10-fundamentals/10.1-language-semantics/02-variables/) | 变量系统 | 9+ |
| [jsts-language-core-system/03-control-flow/](../../10-fundamentals/10.1-language-semantics/03-control-flow/) | 控制流 | 9+ |
| [jsts-language-core-system/04-execution-model/](../../10-fundamentals/10.3-execution-model/) | 执行模型 | 11+ |
| [jsts-language-core-system/05-execution-flow/](../../10-fundamentals/10.3-execution-model/) | 执行流 | 6+ |
| [jsts-language-core-system/06-ecmascript-spec-foundation/](../../10-fundamentals/10.6-ecmascript-spec/) | 规范基础 | 6+ |
| [jsts-language-core-system/07-js-ts-symmetric-difference/](../../10-fundamentals/10.1-language-semantics/) | JS/TS 对称差 | 6 |
| [jsts-language-core-system/08-module-system/](../../10-fundamentals/10.4-module-system/) | 模块系统 | 6+ |
| [jsts-language-core-system/09-object-model/](../../10-fundamentals/10.5-object-model/) | 对象模型 | 5+ |

### 代码实验室

| 目录 | 主题 |
|------|------|
| [jsts-code-lab/00-language-core/](../../20-code-lab/20.1-fundamentals-lab/language-core/) | 语言核心基础（类型、变量、控制流、函数、对象、模块、元编程） |
| [jsts-code-lab/01-ecmascript-evolution/](../../20-code-lab/20.1-fundamentals-lab/ecmascript-evolution/) | ECMAScript 演进史（ES2015–ES2026） |
| [jsts-code-lab/02-design-patterns/](../../20-code-lab/20.2-language-patterns/design-patterns/) | 设计模式（创建型 / 结构型 / 行为型 / JS-TS 特定模式） |
| [jsts-code-lab/03-concurrency/](../../20-code-lab/20.3-concurrency-async/concurrency/) | 并发编程（Promise、async/await、Worker、Atomics、事件循环） |
| [jsts-code-lab/04-data-structures/](../../20-code-lab/20.4-data-algorithms/data-structures/) | 数据结构（内置 / 自定义 / 函数式） |
| [jsts-code-lab/05-algorithms/](../../20-code-lab/20.4-data-algorithms/algorithms/) | 算法（排序、搜索、动态规划、图、递归） |
| [jsts-code-lab/10-js-ts-comparison/](../../20-code-lab/20.1-fundamentals-lab/js-ts-comparison/) | JavaScript / TypeScript 对比分析 |

### 全景综述

| 文档 | 说明 |
|------|------|
| [30-knowledge-base/30.8-research/tsjs-stack-panorama-2026/01_language_core.md](../../30-knowledge-base/30.8-research/tsjs-stack-panorama-2026/01_language_core.md) | ES2020–ES2026 特性全览 |
| [30-knowledge-base/30.8-research/tsjs-stack-panorama-2026/04_concurrency.md](../../30-knowledge-base/30.8-research/tsjs-stack-panorama-2026/04_concurrency.md) | 并发模型全景 |
| 30-knowledge-base/30.8-research/tsjs-stack-panorama-2026/ecmascript-features/ | 分版本 ECMAScript 特性深度文档 |

---

## 📊 语言核心主题速查表

| 主题 | ECMAScript 版本 | 关键概念 | 难度 |
|------|----------------|---------|------|
| 解构赋值 | ES2015 | 数组/对象解构、嵌套、默认值 | ⭐ |
| 展开运算符 | ES2018 | `...rest` / `...spread`、浅拷贝 | ⭐ |
| Promise | ES2015 | 链式调用、`Promise.all`/`race`、`finally` | ⭐⭐ |
| async/await | ES2017 | 语法糖、错误处理、并发控制 | ⭐⭐ |
| Proxy | ES2015 | 拦截器、`Reflect`、不可变性 | ⭐⭐⭐ |
| Symbol | ES2015 | 唯一性、`Symbol.iterator`、`Symbol.toStringTag` | ⭐⭐ |
| WeakRef / FinalizationRegistry | ES2021 | 弱引用、内存管理 | ⭐⭐⭐ |
| Temporal API | ES2024（提案） | 替代 `Date`、不可变、时区安全 | ⭐⭐ |
| 装饰器 | ES2023 / Stage 3 | `@decorator`、元数据反射 | ⭐⭐⭐ |
| 管道运算符 | Stage 2 | `|>`、部分应用 | ⭐⭐ |
| 类型谓词 (TS) | TS 3.0+ | `is`、自定义类型守卫 | ⭐⭐ |
| 条件类型 (TS) | TS 2.8+ | `extends ? :`、分布式条件类型 | ⭐⭐⭐ |
| 模板字面量类型 (TS) | TS 4.1+ | 字符串操作、类型级编程 | ⭐⭐⭐ |
| infer 关键字 (TS) | TS 2.8+ | 类型提取、递归类型 | ⭐⭐⭐⭐ |

---

## 🔬 JavaScript vs TypeScript 语法对比

| 特性 | JavaScript (ES2024) | TypeScript (5.6+) | 说明 |
|------|--------------------|--------------------|------|
| 类型注解 | 无 | `let x: string` | TS 编译时检查，运行时擦除 |
| 接口 | 无 | `interface Foo {}` | 仅存在于编译期 |
| 枚举 | 无 | `enum Color { Red }` | TS 生成反向映射对象 |
| 泛型 | 无 | `function id<T>(x: T): T` | 类型参数化 |
| 私有字段 | `#count` | `private count` / `#count` | TS `private` 仅编译期；`#` 为原生私有 |
| 装饰器 | Stage 3 (原生) | `@decorator`（实验性/标准） | TS 早期实现与 ES 标准略有差异 |
| 命名空间 | 无 | `namespace Utils {}` | TS 特有模块组织方式 |
| 类型导入 | 无 | `import type { X }` | 确保无运行时副作用 |
| satisfies | 无 | `const x = {} satisfies Y` | TS 4.9+，保留推断同时检查 |
| using 声明 | ES2024 提案 | `using resource = ...` | 基于 `Symbol.dispose` 的 RAII |

---

## 💻 代码示例：类型系统高级模式

```typescript
// advanced-type-patterns.ts
// 展示 TypeScript 类型系统的核心能力

// 1. 类型守卫（Type Guards）
function isString(value: unknown): value is string {
  return typeof value === "string";
}

function processValue(input: string | number | Date) {
  if (isString(input)) {
    // TypeScript 知道此处 input 为 string
    return input.toUpperCase();
  }
  if (input instanceof Date) {
    return input.toISOString();
  }
  // 剩余分支自动推断为 number
  return input.toFixed(2);
}

// 2. 映射类型 + 条件类型：自动推导 API 响应类型
type APIEndpoints = {
  "/users": { id: number; name: string }[];
  "/posts": { id: number; title: string; body: string }[];
  "/user/:id": { id: number; name: string; email: string };
};

type APIResponse<T extends keyof APIEndpoints> = APIEndpoints[T];

async function fetchAPI<T extends keyof APIEndpoints>(
  endpoint: T
): Promise<APIResponse<T>> {
  const res = await fetch(endpoint as string);
  return res.json();
}

// 使用：类型自动推断
const users = await fetchAPI("/users");     // 类型: { id: number; name: string }[]
const user  = await fetchAPI("/user/:id");  // 类型: { id: number; name: string; email: string }

// 3. 模板字面量类型：类型安全的 CSS 变量
type ColorChannel = "red" | "green" | "blue";
type CSSVariable = `--color-${ColorChannel}-${100 | 200 | 300 | 400 | 500}`;

function setCSSVar(name: CSSVariable, value: string): void {
  document.documentElement.style.setProperty(name, value);
}

setCSSVar("--color-red-500", "#ef4444");   // ✅ 合法
// setCSSVar("--color-purple-900", "#..."); // ❌ 编译错误

// 4.  branded type：避免原始类型混淆
type UserId = string & { __brand: "UserId" };
type OrderId = string & { __brand: "OrderId" };

function createUserId(id: string): UserId {
  return id as UserId;
}

function lookupOrder(id: OrderId) { /* ... */ }

const uid = createUserId("u-123");
// lookupOrder(uid); // ❌ 编译错误：UserId 不能赋值给 OrderId
```

---

## 💻 代码示例：ES2024+ 运行时特性

### `using` 声明与显式资源管理（RAII）

```typescript
// ES2024 Explicit Resource Management
// 基于 Symbol.dispose / Symbol.asyncDispose

class DatabaseConnection implements Disposable {
  #connected = true;

  query(sql: string): unknown[] {
    if (!this.#connected) throw new Error("Connection closed");
    return []; // mock
  }

  [Symbol.dispose](): void {
    this.#connected = false;
    console.log("DB connection released");
  }
}

// 自动释放资源，即使发生异常
function fetchUsers(): unknown[] {
  using conn = new DatabaseConnection();
  return conn.query("SELECT * FROM users");
  // conn[Symbol.dispose]() 自动调用
}

// Async version
class AsyncLock implements AsyncDisposable {
  async [Symbol.asyncDispose](): Promise<void> {
    await this.release();
  }
  async release(): Promise<void> { /* ... */ }
}

async function doWork() {
  await using lock = new AsyncLock();
  // 临界区代码
} // lock[Symbol.asyncDispose]() 自动 await
```

### WeakRef 与 FinalizationRegistry（内存敏感场景）

```typescript
// 构建一个不阻止垃圾回收的缓存
class WeakCache<K, V extends object> {
  private cache = new Map<K, WeakRef<V>>();
  private registry = new FinalizationRegistry<K>((key) => {
    this.cache.delete(key);
    console.log(`Cache entry ${key} garbage-collected`);
  });

  set(key: K, value: V): void {
    this.cache.set(key, new WeakRef(value));
    this.registry.register(value, key);
  }

  get(key: K): V | undefined {
    const ref = this.cache.get(key);
    return ref?.deref();
  }
}

// 使用：大型对象缓存，不阻止 GC
const imageCache = new WeakCache<string, ImageBitmap>();
```

### Proxy + Reflect 实现只读深度冻结

```typescript
function deepFreeze<T extends object>(obj: T): Readonly<T> {
  return new Proxy(obj, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);
      if (value && typeof value === "object") {
        return deepFreeze(value);
      }
      return value;
    },
    set(target, prop) {
      throw new Error(
        `Cannot set property ${String(prop)} on frozen object`
      );
    },
    deleteProperty(target, prop) {
      throw new Error(
        `Cannot delete property ${String(prop)} on frozen object`
      );
    },
  });
}

const config = deepFreeze({ db: { host: "localhost", port: 5432 } });
// config.db.port = 3306; // Runtime error!
```

---

## 📚 学习路径

| 阶段 | 目标 | 推荐文档 |
|------|------|---------|
| 入门 | 掌握语法与基础语义 | `jsts-code-lab/00-language-core/` → `jsts-language-core-system/02-variable-system/` |
| 进阶 | 理解类型系统与执行模型 | `jsts-language-core-system/01-type-system/` → `04-execution-model/` |
| 深入 | 掌握规范与引擎原理 | `jsts-language-core-system/06-ecmascript-spec-foundation/` → `30-knowledge-base/30.8-research/tsjs-stack-panorama-2026/JS_TS_语言语义模型全面分析.md` |

---

## 🔗 相关索引与权威链接

- 语言核心总索引 — 完整的跨目录导航与学习路径
- [TypeScript 速查表](../30.7-cheatsheets/TYPESCRIPT_CHEATSHEET.md)
- [JS 语言核心速查表](../30.7-cheatsheets/JS_LANGUAGE_CORE_CHEATSHEET.md)
- [ECMAScript 2024 语言规范](https://tc39.es/ecma262/2024/)
- [TypeScript 官方文档](https://www.typescriptlang.org/docs/)
- [MDN JavaScript 参考](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript)
- [TC39 提案跟踪](https://github.com/tc39/proposals)
- [TypeScript Deep Dive（中文）](https://basarat.gitbook.io/typescript/)
- [Exploring JS — JavaScript 全书](https://exploringjs.com/)
- [V8 Blog](https://v8.dev/blog)
- [SpiderMonkey Blog](https://spidermonkey.dev/)
- [JavaScript Visualizer (事件循环)](https://www.jsv9000.app/)
- [ECMAScript Explicit Resource Management Proposal](https://github.com/tc39/proposal-explicit-resource-management)
- [MDN — `using`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/using)
- [MDN — WeakRef](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakRef)
- [MDN — Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
- [TypeScript Handbook — Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)
- [TypeScript Handbook — Type Guards](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- [TypeScript Handbook — Mapped Types](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html)
- [TypeScript Handbook — Template Literal Types](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html)
- [2ality — JavaScript 特性深度解析](https://2ality.com/)
