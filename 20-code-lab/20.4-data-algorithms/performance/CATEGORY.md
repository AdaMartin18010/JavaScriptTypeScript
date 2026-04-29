---
dimension: 综合
sub-dimension: Performance
created: 2026-04-28
---

# 模块归属声明

本模块归属 **「综合」** 维度，聚焦 Performance 核心概念与工程实践。

## 包含内容

- 本模块聚焦 performance 核心概念与工程实践。

## 相关索引

- `30-knowledge-base/30.2-categories/README.md` — 分类总览
- `20-code-lab/` — 代码实验室实践
## 目录内容

- 📄 ARCHITECTURE.md
- 📄 README.md
- 📄 THEORY.md
- 📄 _MIGRATED_FROM.md
- 📄 benchmark-suite.ts
- 📄 bundle-optimization.test.ts
- 📄 bundle-optimization.ts
- 📄 database-optimization.md
- 📄 database-optimization.ts
- 📄 index.ts
- 📄 memory-management.test.ts
- 📄 memory-management.ts
- 📄 network-optimization.test.ts
- 📄 network-optimization.ts
- 📄 optimization-patterns.test.ts
- ... 等 3 个条目


---

> 此分类文档由批量生成脚本自动创建，请根据实际模块内容补充和调整。

## 子模块速查

| 子模块 | 核心能力 | 关联文件 |
|--------|----------|----------|
| Benchmark Suite | 使用 Benchmark.js / tinybench 进行可重复性能测试 | `benchmark-suite.ts` |
| Bundle Optimization | Tree-shaking、Code-splitting、压缩策略验证 | `bundle-optimization.ts` |
| Memory Management | 内存泄漏检测、WeakRef、FinalizationRegistry | `memory-management.ts` |
| Network Optimization | 请求合并、预加载、缓存策略 | `network-optimization.ts` |
| Database Optimization | 查询计划分析、索引策略、连接池 | `database-optimization.ts` |

## 代码示例：Benchmark Suite

```typescript
import { Bench } from 'tinybench';

const bench = new Bench({ time: 100 });

const arr = Array.from({ length: 10_000 }, (_, i) => i);

bench
  .add('for loop', () => {
    let sum = 0;
    for (let i = 0; i < arr.length; i++) sum += arr[i];
    return sum;
  })
  .add('for-of', () => {
    let sum = 0;
    for (const v of arr) sum += v;
    return sum;
  })
  .add('reduce', () => arr.reduce((a, b) => a + b, 0));

await bench.run();
console.table(bench.table());
```

## 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| V8 Blog | 引擎优化深入 | [v8.dev/blog](https://v8.dev/blog) |
| web.dev — Performance | 性能指南 | [web.dev/performance](https://web.dev/performance) |
| Chrome DevTools — Performance | 性能分析工具 | [developer.chrome.com/docs/devtools/performance](https://developer.chrome.com/docs/devtools/performance) |
| MDN | 文档 | [developer.mozilla.org](https://developer.mozilla.org) |
| web.dev | 指南 | [web.dev](https://web.dev) |

---

*最后更新: 2026-04-29*
