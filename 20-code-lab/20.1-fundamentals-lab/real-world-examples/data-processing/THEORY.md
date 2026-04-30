# 数据处理

> **定位**：`20-code-lab/20.1-fundamentals-lab/real-world-examples/data-processing`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块解决大规模数据转换与清洗的效率问题。通过流式处理、批处理和函数式管道提升数据处理性能。

### 1.2 形式化基础

数据处理可形式化为偏函数组合 `(f ∘ g ∘ h)(x)`，其中每个阶段保持引用透明性。流式处理满足结合律：

```
pipe(a, [f, g, h]) ≡ pipe(pipe(a, [f, g]), [h])
```

### 1.3 关键概念

| 概念 | 定义 | 关联 |
|------|------|------|
| 管道操作 | 数据变换的链式组合 | pipeline.ts |
| 懒求值 | 按需计算以避免中间集合 | lazy-eval.ts |

---

## 二、设计原理

### 2.1 为什么存在

现代应用处理的数据规模持续增长。高效的数据处理流程是 ETL、分析和报表系统的核心，直接影响业务决策的时效性。

### 2.2 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 流式处理 | 内存占用低 | 实现复杂 | 大文件处理 |
| 批量处理 | 逻辑简单 | 内存峰值高 | 小数据集 |

### 2.3 与相关技术的对比

| 特性 | Lodash | Ramda | RxJS | 原生 Iterator Helpers |
|------|--------|-------|------|----------------------|
| 求值策略 | 立即求值 | 立即求值 | 惰性/响应式 | 惰性求值 |
| 不可变性 | 部分支持 | 完全支持 | 完全支持 | 完全支持 |
| 中间集合 | 产生 | 避免 | 避免 | 避免 |
| 异步流 | 不支持 | 不支持 | 原生支持 | 需手动包装 |
| 树摇优化 | 支持 | 优秀 | 支持 | 原生零成本 |
| 学习曲线 | 低 | 中 | 高 | 低 |

与 SQL 对比：流式处理适合无模式数据，SQL 适合结构化查询。

---

## 三、实践映射

### 3.1 从理论到代码

本模块的代码示例将上述理论概念映射为可运行的实现。通过实际编码练习，可以验证对 数据处理 核心机制的理解，并观察不同实现选择带来的行为差异。

#### 可运行示例：惰性管道 + 错误处理

```typescript
// pipeline.ts — 惰性数据处理管道，可运行 (Node.js ≥18)

interface Result<T, E = Error> {
  ok: boolean;
  value?: T;
  error?: E;
}

function* lazyRange(start: number, end: number): Generator<number> {
  for (let i = start; i < end; i++) yield i;
}

function* filter<T>(
  gen: Generator<T>,
  predicate: (x: T) => boolean
): Generator<T> {
  for (const x of gen) if (predicate(x)) yield x;
}

function* map<T, U>(
  gen: Generator<T>,
  transform: (x: T) => U
): Generator<U> {
  for (const x of gen) yield transform(x);
}

function* take<T>(gen: Generator<T>, n: number): Generator<T> {
  let count = 0;
  for (const x of gen) {
    if (count++ >= n) break;
    yield x;
  }
}

function safeParseInt(x: string): Result<number> {
  const n = Number(x);
  return Number.isNaN(n) || !Number.isInteger(n)
    ? { ok: false, error: new Error(`Invalid integer: "${x}"`) }
    : { ok: true, value: n };
}

// 演示：从大量原始字符串中提取有效偶数，仅处理前 5 个
const raw = lazyRange(1, 1_000_000).map(String);
const evens = take(
  filter(
    map(raw, safeParseInt),
    (r): r is Result<number> & { ok: true } => r.ok && (r.value! % 2 === 0)
  ),
  5
);

for (const r of evens) {
  console.log(r.value); // 2, 4, 6, 8, 10
}

// 对比：数组方法链会产生中间集合
// const result = Array.from({length: 1_000_000}, (_, i) => String(i + 1))
//   .map(safeParseInt)
//   .filter(r => r.ok && r.value! % 2 === 0)
//   .slice(0, 5);
```

### 3.2 代码示例：Node.js 流式数据处理

```typescript
// stream-processing.ts — 使用 Node.js Transform 流处理大文件
import { createReadStream, createWriteStream } from "fs";
import { createInterface } from "readline";
import { Transform, pipeline } from "stream";

// 逐行处理 GB 级 CSV 文件，内存占用恒定
function processLargeCSV(inputPath: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const readStream = createReadStream(inputPath, { encoding: "utf-8" });
    const writeStream = createWriteStream(outputPath);

    // 自定义 Transform：将每行 JSON 转换为汇总统计
    const aggregator = new Transform({
      objectMode: true,
      transform(chunk: string, _encoding, callback) {
        try {
          const record = JSON.parse(chunk);
          const summary = {
            id: record.id,
            total: record.items.reduce(
              (sum: number, item: { price: number }) => sum + item.price,
              0
            ),
            count: record.items.length,
          };
          callback(null, JSON.stringify(summary) + "\n");
        } catch (err) {
          callback(err as Error);
        }
      },
    });

    const lineReader = createInterface({ input: readStream });

    pipeline(lineReader as unknown as NodeJS.ReadableStream, aggregator, writeStream, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

// 使用：await processLargeCSV("huge-data.jsonl", "summary.jsonl");
```

### 3.3 代码示例：函数式管道组合

```typescript
// functional-pipe.ts — 类型安全的函数管道

type Fn<A, B> = (a: A) => B;

function pipe<A>(a: A): A;
function pipe<A, B>(a: A, f1: Fn<A, B>): B;
function pipe<A, B, C>(a: A, f1: Fn<A, B>, f2: Fn<B, C>): C;
function pipe<A, B, C, D>(a: A, f1: Fn<A, B>, f2: Fn<B, C>, f3: Fn<C, D>): D;
function pipe(a: unknown, ...fns: Fn<unknown, unknown>[]): unknown {
  return fns.reduce((acc, fn) => fn(acc), a);
}

// 可复用的数据处理函数
const trim = (s: string) => s.trim();
const toUpper = (s: string) => s.toUpperCase();
const removeExtraSpaces = (s: string) => s.replace(/\s+/g, " ");
const capitalizeWords = (s: string) =>
  s.replace(/\b\w/g, (c) => c.toUpperCase());

// 组合管道
const normalizeName = (s: string) =>
  pipe(s, trim, removeExtraSpaces, toUpper, capitalizeWords);

console.log(normalizeName("  john   doe  ")); // "John Doe"

// 数组数据处理管道
interface User {
  name: string;
  age: number;
  active: boolean;
}

const users: User[] = [
  { name: "Alice", age: 30, active: true },
  { name: "Bob", age: 17, active: false },
  { name: "Charlie", age: 25, active: true },
];

const activeAdultNames = users
  .filter((u) => u.active && u.age >= 18)
  .map((u) => u.name)
  .sort();

console.log(activeAdultNames); // ["Alice", "Charlie"]
```

### 3.4 代码示例：Web Streams API（浏览器原生流）

```typescript
// web-streams.ts — 使用标准 Web Streams API 处理数据

async function* streamLines(
  response: Response
): AsyncGenerator<string, void, unknown> {
  const reader = response.body?.getReader();
  if (!reader) return;

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) yield line;
  }

  if (buffer) yield buffer;
}

// 使用：流式解析 NDJSON（每行一个 JSON）
async function processNDJSONStream(url: string) {
  const response = await fetch(url);
  let count = 0;

  for await (const line of streamLines(response)) {
    if (!line.trim()) continue;
    const record = JSON.parse(line);
    count++;
    // 实时处理，无需等待全部下载
    if (count % 1000 === 0) {
      console.log(`Processed ${count} records...`);
    }
  }
}
```

### 3.5 代码示例：Array.fromAsync 与分组聚合

```typescript
// array-from-async.ts — 使用 ES2025 Array.fromAsync 处理异步迭代器
async function* fetchPages(urls: string[]) {
  for (const url of urls) {
    const resp = await fetch(url);
    yield resp.json();
  }
}

// Array.fromAsync 将异步迭代器转换为数组（ES2025+）
const pages = await Array.fromAsync(fetchPages(['/api/page1', '/api/page2']));

// Object.groupBy 数据分组（ES2024+）
const products = [
  { name: 'Laptop', category: 'Electronics', price: 1200 },
  { name: 'Phone', category: 'Electronics', price: 800 },
  { name: 'Desk', category: 'Furniture', price: 300 },
];

const byCategory = Object.groupBy(products, p => p.category);
console.log(byCategory.Electronics.length); // 2

// Map.groupBy 使用函数分组
const byPriceRange = Map.groupBy(products, p =>
  p.price > 500 ? 'premium' : 'budget'
);
console.log(byPriceRange.get('premium')?.length); // 2
```

### 3.6 代码示例：使用 Iterator Helpers 处理大数据集

```typescript
// iterator-helpers.ts — TC39 Stage 3 Iterator Helpers 提案
// 部分运行时（Node.js 22+ / Chrome 122+）已原生支持

function* generateData() {
  for (let i = 1; i <= 1_000_000; i++) {
    yield { id: i, value: Math.random() };
  }
}

// 使用迭代器助手方法链（零中间数组）
const topValues = generateData()
  .filter(item => item.value > 0.5)
  .map(item => ({ ...item, score: item.value * 100 }))
  .take(10)
  .toArray();

console.log(topValues.length); // ≤ 10

// drop + flatMap 组合
const nested = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
];
const flattened = nested
  .values()
  .drop(1) // 跳过第一个子数组
  .flatMap(arr => arr.values())
  .toArray();
console.log(flattened); // [4, 5, 6, 7, 8, 9]
```

### 3.7 代码示例：使用 AbortController 取消长耗时数据处理

```typescript
// cancellable-processing.ts — 可取消的数据处理任务
async function processWithCancellation(
  data: AsyncIterable<number>,
  signal: AbortSignal
): Promise<number[]> {
  const results: number[] = [];

  for await (const item of data) {
    if (signal.aborted) {
      throw new Error('Processing cancelled');
    }

    // 模拟耗时计算
    await new Promise(r => setTimeout(r, 10));
    results.push(item * 2);

    // 每处理 100 项检查一次取消信号
    if (results.length % 100 === 0) {
      await new Promise(r => setTimeout(r, 0)); // 让出事件循环
    }
  }

  return results;
}

// 使用示例
const controller = new AbortController();
setTimeout(() => controller.abort(), 500); // 500ms 后取消

try {
  const processed = await processWithCancellation(
    (async function* () {
      for (let i = 0; i < 1000; i++) yield i;
    })(),
    controller.signal
  );
} catch (e) {
  console.log(e.message); // "Processing cancelled"
}
```

### 3.2 常见误区

| 误区 | 正确理解 |
|------|---------|
| 数组方法链总是最优 | 大数组多次遍历可能不如单次循环高效 |
| 流式处理只适合大文件 | 流式也能改善内存抖动和响应性 |
| Object.groupBy 修改原数组 | groupBy 返回新对象，不修改原数组 |
| 所有环境都支持 Iterator Helpers | 需检查运行时版本或引入 polyfill |

### 3.3 扩展阅读

- [RxJS 文档](https://rxjs.dev/guide/overview)
- [Node.js Stream API](https://nodejs.org/api/stream.html)
- [TC39 Iterator Helpers Proposal](https://github.com/tc39/proposal-iterator-helpers)
- [Apache Arrow JavaScript](https://arrow.apache.org/docs/js/)
- [MDN — Web Streams API](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API)
- [MDN — Array.fromAsync](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/fromAsync)
- [MDN — Object.groupBy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/groupBy)
- [MDN — Map.groupBy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/groupBy)
- [Node.js Performance Best Practices](https://nodejs.org/en/learn/getting-started/how-to-read-environment-variables-from-nodejs)
- [JavaScript Weekly — Data Processing](https://javascriptweekly.com/)
- [web.dev — Streams API Concepts](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Concepts)
- [2ality — Iterator Helpers in JavaScript](https://2ality.com/2023/06/iterator-helpers.html)
- `30-knowledge-base/30.8-data`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
