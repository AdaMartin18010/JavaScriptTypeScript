# 性能优化 — 架构设计

## 1. 架构概述

本模块构建了一个性能分析实验室，通过可运行的基准测试和优化示例，展示 JavaScript/TypeScript 应用中的性能瓶颈识别与优化策略。架构采用"采集→分析→优化→验证"的闭环设计，使每次优化都可被量化验证，避免过早优化和伪优化。

## 2. 架构图

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         被测系统 (System Under Test)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │  Algorithm   │  │   Data       │  │   Render     │  │   Network   │ │
│  │   Module     │  │  Structure   │  │   Loop       │  │   Layer     │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬──────┘ │
└─────────┼─────────────────┼─────────────────┼─────────────────┼────────┘
          │                 │                 │                 │
          ▼                 ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        采集层 (Instrumentation)                         │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  Runtime Probe  │  Memory Profiler  │  GC Logger  │  Network Log│   │
│  │  (performance.  │  (heap snapshot)  │  (--trace-  │  (Resource  │   │
│  │   now / mark)   │                   │   gc)       │   Timing)   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      基准测试引擎 (Benchmark Engine)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │   Warmup     │  │   Multiple   │  │   Stats      │  │   Load      │ │
│  │   Phase      │  │   Iterations │  │   Engine     │  │  Generator  │ │
│  │  (JIT stab.) │  │  (min 100x)  │  │(median/IQR)  │  │ (concurrent)│ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      优化策略库 (Optimization Library)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │   Memory     │  │   Render     │  │   Network    │  │  Algorithm  │ │
│  │  Optimizer   │  │  Optimizer   │  │  Optimizer   │  │  Optimizer  │ │
│  │(pool/WeakMap)│  │(v-list/lazy) │  │(batch/cache) │  │(Big O/cache)│ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        报告层 (Reporting)                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                   │
│  │   Console    │  │    JSON      │  │   HTML       │                   │
│  │   Table      │  │   Export     │  │   Chart      │                   │
│  └──────────────┘  └──────────────┘  └──────────────┘                   │
└─────────────────────────────────────────────────────────────────────────┘
```

## 3. 核心组件

### 3.1 基准测试引擎

| 组件 | 职责 | 关键技术 | 精度 |
|------|------|----------|------|
| Benchmark Runner | 自动执行多次测量，计算统计显著性 | `performance.now()` / `process.hrtime.bigint()` | 亚毫秒级 |
| Metrics Collector | 收集时间、内存、GC 频率等指标 | `performance.memory` / V8 flags | — |
| Reporter | 生成对比报告和趋势图表 | 中位数 + IQR / 置信区间 | 统计显著 |

### 3.2 优化策略库

| 组件 | 职责 | 适用场景 | 优化手段 |
|------|------|----------|----------|
| Memory Optimizer | 对象池、WeakMap、内存泄漏检测 | 高频对象创建 | 对象复用、弱引用 |
| Render Optimizer | 虚拟列表、懒加载、防抖节流 | 大量 DOM 元素 | 减少重排重绘 |
| Network Optimizer | 缓存策略、请求合并、预加载 | 高频网络请求 | 减少 RTT |
| Algorithm Optimizer | 算法替换、Memoization | 计算密集型 | 降低时间复杂度 |

### 3.3 性能监控探针

| 组件 | 职责 | 侵入性 | 运行时开销 |
|------|------|--------|------------|
| Runtime Probe | 运行时插入的性能测量点 | 低（装饰器） | <1% |
| Load Generator | 模拟并发用户请求的负载生成器 | 无 | — |

## 4. 数据流

```
测试定义 → Benchmark Runner → 多次执行 → Metrics Collector → 统计分析 → Reporter
```

## 5. 技术栈对比

| 工具/框架 | 测量粒度 | 统计方法 | 可视化 | CI 集成 | 适用场景 |
|-----------|----------|----------|--------|---------|----------|
| 本实验室 | 函数级 | 中位数 + IQR | 终端表格 | 手动 | 学习/原型 |
| Benchmark.js | 操作级 | 均值 + 方差 | 无 | 手动 | 微基准 |
| Vitest Bench | 测试级 | 均值 | 内置 | 原生 | 项目集成 |
| Clinic.js | 进程级 | 采样 | 火焰图 | 手动 | Node.js 诊断 |
| Lighthouse | 页面级 | 分数制 | 详细报告 | CI 插件 | Web 性能 |
| WebPageTest | 网络级 | 瀑布图 | 可视化 | API | 真实环境 |

## 6. 代码示例

### 6.1 基准测试引擎核心

```typescript
// performance/src/benchmark/Benchmark.ts
interface BenchmarkOptions {
  warmupIterations?: number;
  minIterations?: number;
  minTimeMs?: number;
}

interface BenchmarkResult {
  name: string;
  samples: number[];
  median: number;
  mean: number;
  stdDev: number;
  min: number;
  max: number;
  opsPerSecond: number;
}

class BenchmarkRunner {
  async run(
    name: string,
    fn: () => void,
    options: BenchmarkOptions = {}
  ): Promise<BenchmarkResult> {
    const { warmupIterations = 10, minIterations = 100, minTimeMs = 1000 } = options;

    // Warmup: 稳定 JIT
    for (let i = 0; i < warmupIterations; i++) {
      fn();
    }

    // 收集样本
    const samples: number[] = [];
    let totalTime = 0;
    let iterations = 0;

    while (totalTime < minTimeMs || iterations < minIterations) {
      const start = performance.now();
      fn();
      const end = performance.now();
      samples.push(end - start);
      totalTime += end - start;
      iterations++;
    }

    samples.sort((a, b) => a - b);
    const median = samples[Math.floor(samples.length / 2)];
    const mean = totalTime / iterations;
    const min = samples[0];
    const max = samples[samples.length - 1];
    const variance = samples.reduce((s, x) => s + (x - mean) ** 2, 0) / samples.length;
    const stdDev = Math.sqrt(variance);

    return {
      name,
      samples,
      median,
      mean,
      stdDev,
      min,
      max,
      opsPerSecond: 1000 / median,
    };
  }

  compare(results: BenchmarkResult[]): string {
    const baseline = results[0];
    const rows = results.map(r => ({
      name: r.name,
      median: `${r.median.toFixed(3)}ms`,
      opsSec: `${(r.opsPerSecond / 1000).toFixed(1)}k ops/s`,
      vsBaseline: r === baseline ? 'baseline' : `${(baseline.median / r.median).toFixed(2)}x`,
    }));
    return this.formatTable(rows);
  }

  private formatTable(rows: Record<string, string>[]): string {
    return JSON.stringify(rows, null, 2);
  }
}
```

### 6.2 对象池实现

```typescript
// performance/src/optimizers/ObjectPool.ts
class ObjectPool<T> {
  private pool: T[] = [];
  private createFn: () => T;
  private resetFn: (obj: T) => void;
  private maxSize: number;

  constructor(createFn: () => T, resetFn: (obj: T) => void, maxSize = 100) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.maxSize = maxSize;
  }

  acquire(): T {
    return this.pool.pop() ?? this.createFn();
  }

  release(obj: T): void {
    if (this.pool.length < this.maxSize) {
      this.resetFn(obj);
      this.pool.push(obj);
    }
  }
}

// 使用示例：高频创建的临时对象
const vec3Pool = new ObjectPool(
  () => ({ x: 0, y: 0, z: 0 }),
  (v) => { v.x = v.y = v.z = 0; },
  200
);
```

## 7. 技术决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 测量精度 | performance.now() + process.hrtime | 亚毫秒级精度 |
| 统计方法 | 中位数 + 置信区间 | 排除异常值干扰 |
| 测试隔离 | 独立进程执行 | 防止 JIT 状态污染 |

## 8. 质量属性

- **准确性**: 多次采样消除随机波动
- **可重复性**: 固定种子和环境的可复现测试
- **可扩展性**: 插件式架构支持自定义指标

## 9. 参考链接

- [V8 Performance Tips](https://v8.dev/docs/profile) — V8 引擎性能分析官方指南
- [Web Performance MDN](https://developer.mozilla.org/en-US/docs/Web/Performance) — MDN Web 性能权威文档
- [Google Web Vitals](https://web.dev/vitals/) — Google 核心网页指标定义与优化
- [High Performance Browser Networking](https://hpbn.co/) — Ilya Grigorik 的网络性能经典著作
- [JavaScript Engine Fundamentals](https://mathiasbynens.be/notes/shapes-ics) — V8 隐藏类与内联缓存原理
- [Benchmark.js](https://benchmarkjs.com/) — JavaScript 基准测试库标杆
