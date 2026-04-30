---
dimension: 综合
sub-dimension: Benchmarks
created: 2026-04-28
---

# 模块归属声明

本模块归属 **「综合」** 维度，聚焦 Benchmarks 核心概念与工程实践。

## 包含内容

- 本模块聚焦 benchmarks 核心概念与工程实践。
- 涵盖 JS/TS 性能基准测试方法论、微基准设计与统计显著性验证。

## 子模块速查

| 子模块 | 类型 | 说明 |
|--------|------|------|
| README.md | 文档 | 模块入口与快速开始 |
| THEORY.md | 文档 | 基准测试理论形式化定义 |
| js-vs-ts-performance.ts | 源码 | JS 与 TS 编译产物性能对比 |
| index.ts | 源码 | 模块统一导出 |

## 代码示例

### 微基准测试框架

```typescript
// js-vs-ts-performance.ts — 微基准测试框架
interface BenchmarkResult {
  name: string;
  opsPerSecond: number;
  marginOfError: number;
  samples: number;
}

class MicroBenchmark {
  private results: BenchmarkResult[] = [];

  add(name: string, fn: () => void, durationMs = 1000): this {
    // 预热
    for (let i = 0; i < 1000; i++) fn();

    const samples: number[] = [];
    const deadline = performance.now() + durationMs;
    while (performance.now() < deadline) {
      const start = performance.now();
      const batch = 10000;
      for (let i = 0; i < batch; i++) fn();
      const elapsed = performance.now() - start;
      samples.push(batch / (elapsed / 1000));
    }

    const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
    const variance = samples.reduce((s, v) => s + (v - mean) ** 2, 0) / samples.length;
    const stdDev = Math.sqrt(variance);

    this.results.push({
      name,
      opsPerSecond: mean,
      marginOfError: (stdDev / mean) * 100,
      samples: samples.length,
    });
    return this;
  }

  report(): void {
    console.table(this.results);
  }
}

// 使用
new MicroBenchmark()
  .add('array push', () => { const a = []; a.push(1); })
  .add('array prealloc', () => { const a = new Array(1); a[0] = 1; })
  .report();
```

### 统计显著性检验（Welch's t-test）

```typescript
// statistical-significance.ts — 基准结果显著性检验
interface Sample {
  mean: number;
  variance: number;
  n: number;
}

function welchTTest(a: Sample, b: Sample): { t: number; p: number; significant: boolean } {
  const se = Math.sqrt(a.variance / a.n + b.variance / b.n);
  const t = (a.mean - b.mean) / se;
  const df = Math.pow(a.variance / a.n + b.variance / b.n, 2) /
    (Math.pow(a.variance / a.n, 2) / (a.n - 1) + Math.pow(b.variance / b.n, 2) / (b.n - 1));

  // 近似 p-value（双尾）
  const p = 2 * (1 - studentTCDF(Math.abs(t), df));
  return { t, p, significant: p < 0.05 };
}

// 近似 t 分布 CDF
function studentTCDF(t: number, df: number): number {
  const x = df / (df + t * t);
  let result = 0;
  if (df % 2 === 0) {
    let term = 1;
    for (let k = 1; k < df / 2; k++) {
      term *= (2 * k - 1) / (2 * k) * x;
      result += term;
    }
    result = 1 - 0.5 * Math.pow(x, df / 2) * result;
  } else {
    // 简化处理
    result = 0.5 + 0.5 * Math.atan(t / Math.sqrt(df)) / (Math.PI / 2);
  }
  return result;
}
```

### 内存压力测试与 GC 分析

```typescript
// memory-benchmark.ts — 堆内存与 GC 行为测量
import { performance } from 'node:perf_hooks';
import v8 from 'node:v8';

interface MemorySnapshot {
  usedHeapSize: number;
  totalHeapSize: number;
  external: number;
}

function getMemorySnapshot(): MemorySnapshot {
  const stats = v8.getHeapStatistics();
  return {
    usedHeapSize: stats.used_heap_size,
    totalHeapSize: stats.total_heap_size,
    external: stats.external_memory,
  };
}

async function benchmarkMemory<T>(
  name: string,
  factory: () => T,
  iterations = 100000
): Promise<{ durationMs: number; heapDeltaMB: number; result: T }> {
  global.gc && global.gc(); // 强制 GC（需 --expose-gc）
  const before = getMemorySnapshot();
  const start = performance.now();

  const result = factory();
  for (let i = 0; i < iterations; i++) {
    factory();
  }

  const durationMs = performance.now() - start;
  global.gc && global.gc();
  const after = getMemorySnapshot();

  return {
    durationMs,
    heapDeltaMB: (after.usedHeapSize - before.usedHeapSize) / 1024 / 1024,
    result,
  };
}
```

### Benchmark.js 风格异步基准

```typescript
// async-benchmark.ts — 异步操作基准测试
async function benchmarkAsync<T>(
  name: string,
  fn: () => Promise<T>,
  options: { warmup = 3, iterations = 100 } = {}
): Promise<{ name: string; meanMs: number; p95Ms: number; p99Ms: number }> {
  // 预热
  for (let i = 0; i < options.warmup; i++) await fn();

  const durations: number[] = [];
  for (let i = 0; i < options.iterations; i++) {
    const start = performance.now();
    await fn();
    durations.push(performance.now() - start);
  }

  durations.sort((a, b) => a - b);
  const meanMs = durations.reduce((a, b) => a + b, 0) / durations.length;
  const p95Ms = durations[Math.floor(durations.length * 0.95)];
  const p99Ms = durations[Math.floor(durations.length * 0.99)];

  return { name, meanMs, p95Ms, p99Ms };
}
```

### Mitata 风格微基准

```typescript
// mitata-style-benchmark.ts
// Mitata 是 Rust 级性能基准工具，此处展示等效 JS 实现

interface BenchOptions {
  warmup?: number;
  time?: number;
}

async function bench(name: string, fn: () => void, options: BenchOptions = {}) {
  const warmup = options.warmup ?? 100;
  const time = options.time ?? 1000;

  for (let i = 0; i < warmup; i++) fn();

  let iterations = 0;
  const start = performance.now();
  const deadline = start + time;

  while (performance.now() < deadline) {
    fn();
    iterations++;
  }

  const elapsed = performance.now() - start;
  const opsPerSec = (iterations / elapsed) * 1000;
  console.log(`${name}: ${opsPerSec.toLocaleString()} ops/s (${iterations} iterations in ${elapsed.toFixed(2)}ms)`);
}

// 使用
// await bench('json parse', () => JSON.parse('{"a":1,"b":2}'));
// await bench('json stringify', () => JSON.stringify({ a: 1, b: 2 }));
```

### 火焰图数据生成器（0x 风格）

```typescript
// flamegraph-generator.ts — 基于 --prof 日志的火焰图数据处理
import { execSync } from 'child_process';
import fs from 'fs';

function generateFlamegraph(profilePath: string, outputPath: string) {
  // 需要安装 0x: npm i -g 0x
  // 或使用内置的 --prof-process
  const processed = execSync(`node --prof-process ${profilePath}`, { encoding: 'utf-8' });
  fs.writeFileSync(outputPath, processed);
  console.log(`Flamegraph data written to ${outputPath}`);
}

// 使用
// node --prof app.js
// node --prof-process isolate-0x*.log > profile.txt
```

### 结构化 JSON 序列化基准对比

```typescript
// serialization-benchmark.ts
function benchmarkSerialization(payload: object, iterations = 1_000_000) {
  const results: Record<string, number> = {};

  // JSON.stringify
  const jsonStart = performance.now();
  for (let i = 0; i < iterations; i++) {
    JSON.stringify(payload);
  }
  results['JSON.stringify'] = performance.now() - jsonStart;

  // 结构化克隆（Node.js v18+）
  if (typeof structuredClone === 'function') {
    const cloneStart = performance.now();
    for (let i = 0; i < iterations; i++) {
      structuredClone(payload);
    }
    results['structuredClone'] = performance.now() - cloneStart;
  }

  // MessagePack（需 msgpackr 包）
  // const { pack } = require('msgpackr');
  // const mpStart = performance.now();
  // for (let i = 0; i < iterations; i++) { pack(payload); }
  // results['msgpackr'] = performance.now() - mpStart;

  return results;
}
```

## 相关索引

- `30-knowledge-base/30.2-categories/README.md` — 分类总览
- `20-code-lab/` — 代码实验室实践

## 目录内容

- 📄 ARCHIVED.md
- 📄 README.md
- 📄 THEORY.md
- 📄 _MIGRATED_FROM.md
- 📄 index.ts
- 📄 js-vs-ts-performance.test.ts
- 📄 js-vs-ts-performance.ts


---

> 此分类文档由批量生成脚本自动创建，请根据实际模块内容补充和调整。


## 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| MDN | 文档 | [developer.mozilla.org](https://developer.mozilla.org) |
| web.dev | 指南 | [web.dev](https://web.dev) |
| Mitata (Rust-level Benchmarking) | 源码 | [github.com/evanwashere/mitata](https://github.com/evanwashere/mitata) |
| Benchmark.js | 源码 | [github.com/bestiejs/benchmark.js](https://github.com/bestiejs/benchmark.js) |
| V8 Blog | 博客 | [v8.dev/blog](https://v8.dev/blog) |
| WebKit JSC Blog | 博客 | [webkit.org/blog/category/javascript](https://webkit.org/blog/category/javascript/) |
| Statistical Rethinking (McElreath) | 书籍 | [xcelab.net/rm/statistical-rethinking](https://xcelab.net/rm/statistical-rethinking/) |
| Node.js — v8 module | 官方文档 | [nodejs.org/api/v8.html](https://nodejs.org/api/v8.html) |
| Node.js — perf_hooks | 官方文档 | [nodejs.org/api/perf_hooks.html](https://nodejs.org/api/perf_hooks.html) |
| TechEmpower Framework Benchmarks | 数据集 | [techempower.com/benchmarks](https://www.techempower.com/benchmarks/) |
| Web Benchmarking Best Practices | 指南 | [web.dev/performance-budgets-101](https://web.dev/articles/performance-budgets-101) |
| V8 — Deoptimization Guide | 内部文档 | [v8.dev/blog/deoptimizing](https://v8.dev/blog/deoptimizing) |
| 0x — Flamegraph Tool | 工具 | [github.com/davidmarkclements/0x](https://github.com/davidmarkclements/0x) |
| clinic.js — Node.js Performance Profiling | 工具 | [clinicjs.org](https://clinicjs.org/) |
| Autocannon — HTTP Benchmarking | 工具 | [github.com/mcollina/autocannon](https://github.com/mcollina/autocannon) |
| Hyperfine — Command-line Benchmarking | 工具 | [github.com/sharkdp/hyperfine](https://github.com/sharkdp/hyperfine) |
| JSBench.me — Online Benchmarking | 工具 | [jsbench.me](https://jsbench.me/) |
| WebPageTest — Web Performance Testing | 工具 | [webpagetest.org](https://www.webpagetest.org/) |
| Lighthouse CI | 工具 | [github.com/GoogleChrome/lighthouse-ci](https://github.com/GoogleChrome/lighthouse-ci) |
| Criterion.rs (Rust 基准参考) | 源码 | [github.com/bheisler/criterion.rs](https://github.com/bheisler/criterion.rs) |

---

*最后更新: 2026-04-30*
