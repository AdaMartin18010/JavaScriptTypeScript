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

### 3.2 常见误区

| 误区 | 正确理解 |
|------|---------|
| 数组方法链总是最优 | 大数组多次遍历可能不如单次循环高效 |
| 流式处理只适合大文件 | 流式也能改善内存抖动和响应性 |

### 3.3 扩展阅读

- [RxJS 文档](https://rxjs.dev/guide/overview)
- [Node.js Stream API](https://nodejs.org/api/stream.html)
- [TC39 Iterator Helpers Proposal](https://github.com/tc39/proposal-iterator-helpers)
- [Apache Arrow JavaScript](https://arrow.apache.org/docs/js/)
- `30-knowledge-base/30.8-data`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
