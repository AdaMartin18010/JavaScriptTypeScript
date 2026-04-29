# 控制流

> **定位**：`20-code-lab/20.1-fundamentals-lab/language-core/03-control-flow`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块分析控制流结构（条件、循环、异常），解决复杂业务逻辑下的流程清晰性与错误处理问题。通过结构化编程原则提升代码可读性。

### 1.2 形式化基础

[本模块的形式化定义与公理/定理陈述]

### 1.3 关键概念

| 概念 | 定义 | 关联 |
|------|------|------|
| 短路求值 | && / \|\| 的条件执行语义 | short-circuit.ts |
| 异常传播 | Error 的冒泡与捕获链 | error-handling.ts |

---

## 二、设计原理

### 2.1 为什么存在

程序的本质是控制流的组合。条件、循环和异常处理构成了业务逻辑的骨架，清晰的控制流设计直接影响代码的可读性与可维护性。

### 2.2 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 早期返回 | 减少嵌套深度 | 分散退出点 | 验证前置条件 |
| 异常抛出 | 强制处理错误 | 控制流隐式跳转 | 不可恢复错误 |

### 2.3 特性对比表：控制流模式

| 模式 | 适用场景 | 可读性 | 扩展性 | 注意事项 |
|------|---------|--------|--------|----------|
| `if/else if/else` | 简单二元或有限条件 | 高 | 低 | 嵌套过深时用早期返回 |
| `switch` | 离散值多分支匹配 | 中 | 中 | 必须显式 `break`，否则穿透 |
| 三元运算符 `? :` | 简单值选择 | 中 | 低 | 避免嵌套超过一层 |
| 短路求值 `&& \|\|` | 默认值与条件执行 | 高 | 低 | 注意 `0`、`""`、`false` 等假值 |
| 策略模式/Map | 大量离散规则 | 高 | 高 | 将逻辑与数据分离 |
| 异常 `try/catch` | 错误恢复与资源清理 | 中 | 中 | 仅用于异常场景，不要控制正常流 |

### 2.4 与相关技术的对比

与结构化编程理论对比：JS 的异常机制增强了非局部退出能力。

---

## 三、实践映射

### 3.1 从理论到代码

本模块的代码示例将上述理论概念映射为可运行的实现。通过实际编码练习，可以验证对 控制流 核心机制的理解，并观察不同实现选择带来的行为差异。

### 3.2 代码示例：`switch` vs 策略模式（Map）

```typescript
// 传统 switch：容易遗漏 break，扩展性差
function getStatusMessage(status: number): string {
  switch (status) {
    case 200: return 'OK';
    case 201: return 'Created';
    case 400: return 'Bad Request';
    case 401: return 'Unauthorized';
    case 404: return 'Not Found';
    case 500: return 'Internal Server Error';
    default: return 'Unknown Status';
  }
}

// 策略模式（Map）：更 declarative，天然防穿透，可动态扩展
const statusMap = new Map<number, string>([
  [200, 'OK'],
  [201, 'Created'],
  [400, 'Bad Request'],
  [401, 'Unauthorized'],
  [404, 'Not Found'],
  [500, 'Internal Server Error'],
]);

function getStatusMessageModern(status: number): string {
  return statusMap.get(status) ?? 'Unknown Status';
}

// 带逻辑的复杂策略模式
interface Order {
  type: 'standard' | 'express' | 'international';
  weight: number;
}

const shippingStrategies: Record<Order['type'], (o: Order) => number> = {
  standard: (o) => o.weight * 1.0,
  express: (o) => o.weight * 2.5 + 10,
  international: (o) => o.weight * 5.0 + 25,
};

function calculateShipping(order: Order): number {
  const strategy = shippingStrategies[order.type];
  if (!strategy) throw new Error(`Unsupported order type: ${order.type}`);
  return strategy(order);
}
```

### 3.3 代码示例：短路求值与默认值陷阱

```typescript
// short-circuit-patterns.ts

// 陷阱：0 和空字符串会被 || 跳过
const inputCount = 0;
const badCount = inputCount || 10;  // 10（错误！用户明确输入了 0）
const goodCount = inputCount ?? 10; // 0（正确 — 仅 null/undefined 时回退）

// 安全的配置合并
interface Config {
  timeout?: number;
  retries?: number;
  endpoint?: string;
}

function mergeConfig(user: Config, defaults: Required<Config>): Required<Config> {
  return {
    timeout: user.timeout ?? defaults.timeout,
    retries: user.retries ?? defaults.retries,
    endpoint: user.endpoint || defaults.endpoint, // 空字符串时允许回退
  };
}

// 条件执行链（替代深层 if）
function processUser(user: { name?: string; email?: string; age?: number }): string {
  return (
    (user.name && `Name: ${user.name}`) ||
    (user.email && `Email: ${user.email}`) ||
    (user.age !== undefined && `Age: ${user.age}`) ||
    'Anonymous'
  );
}
```

### 3.4 代码示例：`for...of` 与迭代器控制

```typescript
// iterator-control.ts

// 带索引的迭代（避免传统 for 循环的越界错误）
const items = ['a', 'b', 'c'];
for (const [index, value] of items.entries()) {
  console.log(`${index}: ${value}`);
}

// 提前终止与跳过
function findFirstPrime(numbers: number[]): number | undefined {
  for (const n of numbers) {
    if (n < 2) continue;
    if (isPrime(n)) return n;
  }
  return undefined;
}

function isPrime(n: number): boolean {
  for (let i = 2; i * i <= n; i++) {
    if (n % i === 0) return false;
  }
  return n > 1;
}

// 标签语句：嵌套循环中跳出外层（慎用，影响可读性）
function findDuplicateMatrix(matrix: number[][]): [number, number] | null {
  outer: for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[i].length; j++) {
      for (let k = i + 1; k < matrix.length; k++) {
        for (let l = 0; l < matrix[k].length; l++) {
          if (matrix[i][j] === matrix[k][l]) {
            return [i, j];
          }
        }
      }
    }
  }
  return null;
}
```

### 3.5 代码示例：结构化异常处理与资源清理

```typescript
// structured-error-handling.ts

// 现代资源管理：using 声明（TypeScript 5.2+ / ES2023）
interface DisposableResource {
  data: string;
  [Symbol.dispose](): void;
}

function createResource(): DisposableResource {
  return {
    data: 'sensitive-data',
    [Symbol.dispose]() {
      console.log('Resource cleaned up');
    },
  };
}

// 使用 using 自动清理
{
  using res = createResource();
  console.log(res.data);
} // 此处自动调用 res[Symbol.dispose]()

// Async 资源清理（TypeScript 5.2+）
interface AsyncDisposable {
  [Symbol.asyncDispose](): Promise<void>;
}

// 传统 try/finally 模式（兼容所有环境）
async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timer); // 无论成功或失败都清理定时器
  }
}

// 错误分类与包装
class NetworkError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

class ValidationError extends Error {
  constructor(public fields: string[], message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

async function robustApiCall<T>(fetcher: () => Promise<T>): Promise<T> {
  try {
    return await fetcher();
  } catch (err) {
    if (err instanceof NetworkError) {
      console.error(`Network failure: ${err.statusCode}`);
      throw err; // 向上传播，调用方决定重试或降级
    }
    if (err instanceof ValidationError) {
      console.error(`Invalid input: ${err.fields.join(', ')}`);
      throw err;
    }
    throw new Error(`Unexpected error: ${String(err)}`);
  }
}
```

### 3.6 代码示例：异步控制流（顺序 vs 并行 vs 竞速）

```typescript
// async-control-flow.ts

interface Task {
  id: number;
  run(): Promise<string>;
}

// 顺序执行（保留依赖关系）
async function sequential(tasks: Task[]): Promise<string[]> {
  const results: string[] = [];
  for (const task of tasks) {
    results.push(await task.run()); // 等待前一个完成
  }
  return results;
}

// 并行执行（无依赖时首选）
async function parallel(tasks: Task[]): Promise<string[]> {
  return Promise.all(tasks.map((t) => t.run()));
}

// 限制并发（防止资源耗尽）
async function limitedParallel(tasks: Task[], limit: number): Promise<string[]> {
  const results: string[] = new Array(tasks.length);
  const executing: Promise<void>[] = [];

  for (let i = 0; i < tasks.length; i++) {
    const p = tasks[i].run().then((r) => {
      results[i] = r;
    });
    executing.push(p);

    if (executing.length >= limit) {
      await Promise.race(executing);
      executing.splice(
        executing.findIndex((ep) => ep === p),
        1
      );
    }
  }
  await Promise.all(executing);
  return results;
}

// 竞速模式（获取最快响应）
async function raceWithTimeout<T>(promises: Promise<T>[], timeoutMs: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Timeout')), timeoutMs)
  );
  return Promise.race([...promises, timeout]);
}
```

### 3.7 常见误区

| 误区 | 正确理解 |
|------|---------|
| switch 默认有 break | 缺少 break 会导致穿透执行 |
| try/catch 可以捕获异步错误 | 异步错误需配合 await 或 .catch |
| `||` 与 `??` 等价 | `??` 仅对 null/undefined 回退，`||` 对所有 falsy 值回退 |
| for...in 适合数组遍历 | for...in 遍历可枚举属性，数组遍历应使用 for...of 或 .forEach |

---

## 四、扩展阅读

- [MDN 控制流](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Control_flow_and_error_handling)
- [MDN：switch](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/switch)
- [MDN：try...catch](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch)
- [MDN：异常与错误处理](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch)
- [MDN：for...of](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...of)
- [MDN：Using 声明（显式资源管理）](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/using)
- [ECMAScript® 2025 — Statements](https://tc39.es/ecma262/#sec-ecmascript-language-statements-and-declarations)
- [ECMAScript® 2025 — Try Statement](https://tc39.es/ecma262/#sec-try-statement)
- [TC39 Explicit Resource Management Proposal](https://github.com/tc39/proposal-explicit-resource-management) — `using` 语法提案
- [JavaScript Info：Error Handling](https://javascript.info/error-handling) — 异常处理最佳实践
- [You Don't Know JS Yet: Async & Performance](https://github.com/getify/You-Dont-Know-JS/blob/2nd-ed/async-performance/README.md) — 异步控制流深度解析
- [Refactoring Guru: Replace Conditional with Polymorphism](https://refactoring.guru/replace-conditional-with-polymorphism) — 策略模式重构指南
- `10-fundamentals/10.1-language-semantics/03-control-flow/`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
