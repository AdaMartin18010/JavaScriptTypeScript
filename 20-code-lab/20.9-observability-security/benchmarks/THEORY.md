# 基准测试 — 理论基础

## 1. 基准测试原则

科学的性能测试必须遵循：

- **可重复**: 相同输入产生相同结果
- **可比较**: 不同实现使用相同测试条件
- **统计显著**: 多次运行取均值/中位数，报告方差
- **隔离变量**: 每次只改变一个因素

## 2. 测量指标

| 指标 | 含义 | 关注点 |
|------|------|--------|
| **吞吐量** | 单位时间完成操作数 | 系统整体能力 |
| **延迟** | 单次操作耗时 | 用户体验 |
| **内存占用** | 运行时内存使用 | 资源效率 |
| **CPU 时间** | 实际 CPU 消耗 | 算法效率 |

## 3. JS 基准测试工具对比

| 维度 | Benchmark.js | Mitata | Tinybench |
|------|-------------|--------|-----------|
| **维护状态** | ⚠️ 归档模式（原仓库不再活跃） | ✅ 积极维护 | ✅ 积极维护 |
| **运行时支持** | 浏览器 / Node.js | Node.js / Deno / Bun | Node.js / Deno / Bun / 浏览器 |
| **统计精度** | 高（多次采样、方差分析） | 高（内置 histogram） | 高（均值/方差/百分位） |
| **API 风格** | 回调式 / 事件驱动 | 函数式 / 链式 | 类 Jest / 极简 API |
| **TypeScript** | ⚠️ @types/benchmark | ✅ 原生 TS | ✅ 原生 TS |
| **ESM 支持** | ⚠️ 主要 CJS | ✅ 原生 ESM | ✅ 原生 ESM |
| **输出格式** | 文本表格 | 彩色终端 / JSON | 文本表格 / JSON |
| **体积** | ~20KB min | ~5KB min | ~3KB min |
| **最佳场景** | 遗留项目、浏览器兼容 | 现代 CLI / CI 基准 | 轻量嵌入、库内自测 |

> **选型建议**：新项目优先 **Mitata**（统计丰富 + 现代运行时原生支持）；需要最小体积嵌入到测试框架中选 **Tinybench**；维护旧浏览器项目可选 **Benchmark.js**。

## 4. 代码示例

### 统计基准测试（Mitata）

```typescript
// bench/sort-algorithms.bench.ts
import { bench, describe, run } from 'mitata';

function quickSort(arr: number[]): number[] {
  if (arr.length <= 1) return arr;
  const pivot = arr[arr.length - 1];
  const left: number[] = [];
  const right: number[] = [];
  for (let i = 0; i < arr.length - 1; i++) {
    (arr[i] < pivot ? left : right).push(arr[i]);
  }
  return [...quickSort(left), pivot, ...quickSort(right)];
}

function nativeSort(arr: number[]): number[] {
  return arr.slice().sort((a, b) => a - b);
}

// 生成不同规模的测试数据
const sizes = [100, 1000, 10000];

for (const size of sizes) {
  describe(`sort n=${size}`, () => {
    const data = Array.from({ length: size }, () => Math.random());

    bench(`quickSort`, () => quickSort(data)).range(size);
    bench(`native .sort()`, () => nativeSort(data)).range(size);
  });
}

// 运行并输出统计报告
run({
  format: 'mitata',      // 彩色终端表格
  collect: true,         // 收集原始数据
  percentiles: [50, 95, 99], // 报告 P50 / P95 / P99
});
```

### 统计基准测试（Tinybench）

```typescript
// bench/string-ops.bench.ts
import { Bench } from 'tinybench';

const bench = new Bench({
  time: 100,      // 每个测试至少运行 100ms
  iterations: 10, // 最少采样次数
});

const longText = 'x'.repeat(1_000_000);

bench
  .add('split + join', () => {
    const _ = longText.split('').reverse().join('');
  })
  .add('spread reverse', () => {
    const _ = [...longText].reverse().join('');
  })
  .add('Array.from reverse', () => {
    const _ = Array.from(longText).reverse().join('');
  });

await bench.run();

console.table(bench.table());
// 输出包含：任务名、ops/sec、平均耗时、方差、样本数、P75/P99/P995/P999
```

### 统计显著性检验（手动 Welch's t-test）

```typescript
// bench/statistical-analysis.ts
function mean(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function variance(arr: number[]): number {
  const m = mean(arr);
  return arr.reduce((sum, v) => sum + (v - m) ** 2, 0) / (arr.length - 1);
}

function welchTTest(a: number[], b: number[]): { t: number; p: number } {
  const ma = mean(a), mb = mean(b);
  const va = variance(a), vb = variance(b);
  const se = Math.sqrt(va / a.length + vb / b.length);
  const t = (ma - mb) / se;
  const df = Math.floor(
    (va / a.length + vb / b.length) ** 2 /
    ((va / a.length) ** 2 / (a.length - 1) + (vb / b.length) ** 2 / (b.length - 1))
  );
  // 简化 p-value 估计（双尾，使用正态近似）
  const p = 2 * (1 - normalCDF(Math.abs(t)));
  return { t, p };
}

function normalCDF(x: number): number {
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
  const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x) / Math.sqrt(2);
  const t = 1 / (1 + p * x);
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return 0.5 * (1 + sign * y);
}

// 使用示例：比较两种实现的样本
const samplesA = [/* 1000 次运行耗时（ns） */];
const samplesB = [/* 1000 次运行耗时（ns） */];
const { t, p } = welchTTest(samplesA, samplesB);
console.log(`t=${t.toFixed(3)}, p=${p.toFixed(4)}`);
if (p < 0.05) {
  console.log('差异具有统计显著性 (p < 0.05)');
} else {
  console.log('差异不具有统计显著性');
}
```

### 内存基准测试

```typescript
// bench/memory-benchmark.ts
import v8 from 'node:v8';

function measureMemory<T>(fn: () => T): { result: T; heapUsedDelta: number } {
  if (global.gc) global.gc(); // 强制 GC，需 --expose-gc 启动
  const before = v8.getHeapStatistics().used_heap_size;
  const result = fn();
  if (global.gc) global.gc();
  const after = v8.getHeapStatistics().used_heap_size;
  return { result, heapUsedDelta: after - before };
}

// 比较不同数据结构的内存占用
const arrSize = 1_000_000;

const arrBench = measureMemory(() => {
  return Array.from({ length: arrSize }, (_, i) => ({ id: i, value: `item-${i}` }));
});

const mapBench = measureMemory(() => {
  const map = new Map<number, { id: number; value: string }>();
  for (let i = 0; i < arrSize; i++) {
    map.set(i, { id: i, value: `item-${i}` });
  }
  return map;
});

console.log(`Array heap delta: ${(arrBench.heapUsedDelta / 1024 / 1024).toFixed(2)} MB`);
console.log(`Map heap delta:   ${(mapBench.heapUsedDelta / 1024 / 1024).toFixed(2)} MB`);
```

### CI 基准测试工作流

```typescript
// bench/ci-benchmark.ts — 在 CI 中运行并存储基准历史
import { Bench } from 'tinybench';
import { writeFileSync, readFileSync, existsSync } from 'fs';

interface BenchmarkHistory {
  timestamp: string;
  commit: string;
  results: Record<string, { mean: number; hz: number }>;
}

const HISTORY_FILE = './bench-history.json';

function loadHistory(): BenchmarkHistory[] {
  if (!existsSync(HISTORY_FILE)) return [];
  return JSON.parse(readFileSync(HISTORY_FILE, 'utf-8'));
}

function saveHistory(history: BenchmarkHistory[]) {
  writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
}

function detectRegression(
  current: Record<string, { mean: number }>,
  baseline: Record<string, { mean: number }>,
  threshold = 0.1 // 10% 退化阈值
): string[] {
  const regressions: string[] = [];
  for (const [name, cur] of Object.entries(current)) {
    const base = baseline[name];
    if (!base) continue;
    const delta = (cur.mean - base.mean) / base.mean;
    if (delta > threshold) {
      regressions.push(`${name}: +${(delta * 100).toFixed(1)}% (>${threshold * 100}%)`);
    }
  }
  return regressions;
}

async function runCIBenchmark() {
  const bench = new Bench({ time: 200 });
  // ... 添加测试用例 ...
  await bench.run();

  const current: Record<string, { mean: number; hz: number }> = {};
  for (const task of bench.tasks) {
    current[task.name] = {
      mean: task.result!.mean,
      hz: task.result!.hz,
    };
  }

  const history = loadHistory();
  const baseline = history.length > 0 ? history[history.length - 1].results : null;

  if (baseline) {
    const regressions = detectRegression(current, baseline);
    if (regressions.length > 0) {
      console.error('性能退化检测：');
      regressions.forEach((r) => console.error(`  - ${r}`));
      process.exit(1);
    }
  }

  history.push({
    timestamp: new Date().toISOString(),
    commit: process.env.GITHUB_SHA || 'local',
    results: current,
  });

  saveHistory(history);
  console.log('基准测试完成，无显著退化。');
}
```

### 异常值检测与过滤

```typescript
// bench/outlier-detection.ts
function median(arr: number[]): number {
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

function medianAbsoluteDeviation(arr: number[]): number {
  const m = median(arr);
  const deviations = arr.map((x) => Math.abs(x - m));
  return median(deviations);
}

// 使用 MAD（中位数绝对偏差）过滤异常值
function filterOutliers(samples: number[], threshold = 3): number[] {
  const m = median(samples);
  const mad = medianAbsoluteDeviation(samples);
  // 避免 mad === 0 时除零
  const normalizer = mad === 0 ? 1 : mad;
  return samples.filter((x) => Math.abs(x - m) / normalizer < threshold);
}

// 示例：过滤 GC 引起的异常值
const rawSamples = [10, 11, 10, 12, 150, 11, 10, 200, 11]; // 150 和 200 是 GC 异常值
const clean = filterOutliers(rawSamples);
console.log(`原始样本: ${rawSamples.length}, 过滤后: ${clean.length}`);
console.log(`均值: 原始=${(rawSamples.reduce((a,b)=>a+b)/rawSamples.length).toFixed(1)}, 过滤后=${(clean.reduce((a,b)=>a+b)/clean.length).toFixed(1)}`);
```

## 5. 避免基准测试陷阱

- **Dead Code Elimination**: 确保测试结果真正被使用
- **JIT 预热**: V8 需要多次执行才能优化，取稳定后的数据
- **GC 干扰**: 垃圾回收可能导致异常值，需多次采样
- **微基准偏差**: 小代码片段的优化可能不代表真实场景
- **环境噪声**: CI 共享 runner 性能波动大，应在裸机或专用 runner 上跑关键基准

## 6. 与相邻模块的关系

- **08-performance**: 性能优化策略
- **39-performance-monitoring**: 生产环境性能监控
- **54-intelligent-performance**: AI 辅助性能分析

## 7. 权威参考与外部链接

| 资源 | 描述 | 链接 |
|------|------|------|
| **Mitata** | 现代 JS 基准测试框架 | [github.com/evanwashere/mitata](https://github.com/evanwashere/mitata) |
| **Tinybench** | 轻量基准测试库 | [github.com/tinylibs/tinybench](https://github.com/tinylibs/tinybench) |
| **Benchmark.js** | 经典 JS 基准测试 | [github.com/bestiejs/benchmark.js](https://github.com/bestiejs/benchmark.js) |
| **Google Benchmark Best Practices** | C++ 基准最佳实践（原理通用） | [github.com/google/benchmark](https://github.com/google/benchmark/blob/main/docs/user_guide.md) |
| **Vyacheslav Egorov — Benchmarking JS Correctly** | V8 性能专家指南 | [mrale.ph/blog/2024/01/23/microbenchmarks.html](https://mrale.ph/blog/2024/01/23/microbenchmarks.html) |
| **WebKit — Understanding JIT Warmup** | JIT 编译预热机制 | [webkit.org/blog/7536/jsc-loves-es6](https://webkit.org/blog/7536/jsc-loves-es6/) |
| **Brendan Gregg — Systems Performance** | 系统性能工程圣经 | [brendangregg.com/systems-performance.html](http://www.brendangregg.com/systems-performance.html) |
| **V8 Blog — Tracing JIT** | V8 TurboFan 优化器内部 | [v8.dev/blog](https://v8.dev/blog) |
| **WebPageTest** | 真实环境 Web 性能测试 | [webpagetest.org](https://www.webpagetest.org/) |
| **Lighthouse CI** | 自动化性能审计 | [github.com/GoogleChrome/lighthouse-ci](https://github.com/GoogleChrome/lighthouse-ci) |

---

> 📅 理论深化更新：2026-04-29
