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

---

*最后更新: 2026-04-29*
