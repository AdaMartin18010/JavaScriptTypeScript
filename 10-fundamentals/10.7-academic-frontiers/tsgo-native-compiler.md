# TypeScript Go 编译器（tsgo）跟踪报告

> **定位**：`10-fundamentals/10.7-academic-frontiers/`
> **来源**：TypeScript Team Blog | @typescript/native-preview

---

## 一、项目背景

2025 年初，Microsoft TypeScript 团队宣布使用 **Go 语言**重写 TypeScript 编译器（代号 **tsgo** / `@typescript/native-preview`），目标是解决 tsc 在超大型代码库上的性能瓶颈。

---

## 二、核心数据

| 指标 | tsc (Node.js) | tsgo (Go) | 提升倍数 |
|------|--------------|-----------|---------|
| 类型检查速度 | 1x | **10x** | 10x |
| 内存占用 | 1x | **0.3x** | -70% |
| 启动时间 | 1x | **0.1x** | -90% |
| 项目 | VS Code (~150万行) | VS Code | 实测 |

---

## 三、TS 编译器全面对比

| 维度 | tsc (Node.js) | tsgo (Go) | SWC (Rust) | Oxc (Rust) | esbuild (Go) |
|------|---------------|-----------|------------|------------|--------------|
| **语言** | TypeScript | Go | Rust | Rust | Go |
| **类型检查** | ✅ 完整 | ✅ 完整 | ❌ 仅转译 | ❌ 仅转译 | ❌ 仅转译 |
| **转译速度** | 1x (基准) | ~5x | **~50x** | **~60x** | **~100x** |
| **内存占用** | 1x | ~0.3x | ~0.2x | ~0.15x | ~0.1x |
| **Emit 输出** | .js + .d.ts | .js + .d.ts | .js | .js | .js |
| **IDE 支持** | TS Language Service | TS Language Service (Go 版) | 无 | 无 | 无 |
| **配置兼容** | tsconfig.json | tsconfig.json | 部分 | 部分 | 极简 |
| **适用场景** | 生产构建 | 未来生产构建 | 开发热更新 | Lint/分析 | 快速打包 |

**关键结论**：tsgo 的独特定位是**保留完整类型检查语义的同时达到接近 SWC 的转译速度**，而非单纯追求最快转译。

---

## 四、架构变化

### 4.1 为什么用 Go 而非 Rust？

| 维度 | Go | Rust | 团队选择理由 |
|------|-----|------|-------------|
| **开发速度** | 快 | 慢 | 快速迭代 |
| **并发模型** | Goroutines | async/ownership | 适合并行类型检查 |
| **GC** | 有 | 无 | 简化内存管理 |
| **团队熟悉度** | 高 | 低 | 微软内部 Go 经验丰富 |
| **与 Node 集成** | NAPI / WASM | NAPI | 均可 |

### 4.2 并行类型检查

tsgo 将类型检查工作负载分配到多个 CPU 核心：

```
单线程 tsc:
  文件1 ──► 文件2 ──► 文件3 ──► ... 串行

多线程 tsgo:
  文件1 ──►┐
  文件2 ──►├─► 合并结果 ──► 输出
  文件3 ──►┘
  并行类型检查 + 最终统一诊断
```

### 4.3 Go 编译器架构代码示例

```go
// 伪代码：tsgo 的并行类型检查核心逻辑
package checker

import (
 "sync"
 "typescript/ast"
 "typescript/types"
)

// TypeCheckerPool 管理并行类型检查 workers
type TypeCheckerPool struct {
 workers int
 files   []ast.SourceFile
}

func (p *TypeCheckerPool) CheckAll() []types.Diagnostic {
 var wg sync.WaitGroup
 results := make(chan []types.Diagnostic, len(p.files))

 // 每个 worker 处理一批文件
 for i := 0; i < p.workers; i++ {
  wg.Add(1)
  go func(workerID int) {
   defer wg.Done()
   checker := NewTypeChecker()
   for _, file := range p.filesForWorker(workerID) {
    diags := checker.CheckSourceFile(file)
    results <- diags
   }
  }(i)
 }

 // 等待所有 workers 完成
 go func() {
  wg.Wait()
  close(results)
 }()

 // 合并诊断结果
 var allDiags []types.Diagnostic
 for diags := range results {
  allDiags = append(allDiags, diags...)
 }
 return allDiags
}
```

### 4.4 与现有工具链的集成策略

```typescript
// tsgo-integration.ts —— tsgo 与现有工作流集成方案

// 方案 1：直接替换 tsc（未来默认）
// package.json
{
  "scripts": {
    "typecheck": "tsgo --noEmit",
    "build": "tsgo --outDir dist"
  }
}

// 方案 2：tsgo + SWC 混合（推荐过渡方案）
// tsgo 负责类型检查，SWC 负责转译
{
  "scripts": {
    "typecheck": "tsgo --noEmit",
    "build": "swc src -d dist"  // SWC 极速转译
  }
}

// 方案 3：通过 LSP 集成到编辑器
// VS Code 的 TypeScript 语言服务可由 tsgo 提供后端
// 实现实时类型检查，延迟从秒级降至毫秒级
```

---

## 五、对生态的影响

| 影响对象 | 预期变化 |
|---------|---------|
| **VS Code** | 内置 TS 语言服务响应速度大幅提升 |
| **CI/CD** | 类型检查阶段从分钟级降至秒级 |
| **大型 Monorepo** | 增量编译体验接近 IDE 级别 |
| **替代工具** | SWC/Oxc 的类型检查功能需差异化定位 |

---

## 六、时间线预判

| 阶段 | 时间 | 状态 |
|------|------|------|
| 预览版发布 | 2025 Q1 | ✅ 已完成 |
| VS Code 集成 | 2025 Q4 | ✅ 已完成 |
| 功能完备 | 2026 Q2 | 🧪 进行中 |
| 默认编译器 | 2026 Q4-2027 | 📋 预计 |

---

## 七、代码示例：性能基准测试脚本

```typescript
// benchmark-tsc-vs-tsgo.ts —— 比较 tsc 与 tsgo 性能

import { execSync } from 'child_process';
import { performance } from 'perf_hooks';

interface BenchmarkResult {
  tool: string;
  elapsedMs: number;
  memoryPeakMB: number;
}

function benchmark(tool: string, cmd: string): BenchmarkResult {
  const start = performance.now();
  // 使用 /usr/bin/time -v 获取内存峰值（Linux）
  // macOS: use -l instead of -v
  execSync(cmd, { stdio: 'pipe' });
  const elapsedMs = performance.now() - start;

  return {
    tool,
    elapsedMs,
    memoryPeakMB: 0, // 实际中从 time 输出解析
  };
}

function runComparison(projectPath: string): void {
  console.log(`Benchmarking project: ${projectPath}\n`);

  const tscResult = benchmark('tsc', `npx tsc --project ${projectPath}/tsconfig.json --noEmit`);
  console.log(`tsc: ${tscResult.elapsedMs.toFixed(0)}ms`);

  const tsgoResult = benchmark('tsgo', `tsgo --project ${projectPath}/tsconfig.json --noEmit`);
  console.log(`tsgo: ${tsgoResult.elapsedMs.toFixed(0)}ms`);

  const speedup = tscResult.elapsedMs / tsgoResult.elapsedMs;
  console.log(`\nSpeedup: ${speedup.toFixed(1)}x`);
}

// runComparison('./fixtures/vscode-src');
```

### NAPI-rs 集成示例：从 Node.js 调用 tsgo

```typescript
// napi-tsgo-bridge.ts —— Node.js 通过 NAPI 调用 tsgo 原生模块

import { loadNativeAddon } from './load-addon';

interface TsgoCheckOptions {
  configPath: string;
  files?: string[];
  noEmit?: boolean;
}

interface TsgoDiagnostic {
  file?: string;
  line: number;
  column: number;
  message: string;
  category: 'error' | 'warning' | 'suggestion';
  code: number;
}

// 假设 tsgo 已编译为 NAPI 原生模块
const tsgo = loadNativeAddon('tsgo-native');

export function typeCheck(options: TsgoCheckOptions): TsgoDiagnostic[] {
  // 直接调用 Go 编译器，无需 shell 进程开销
  return tsgo.checkProject(JSON.stringify(options)) as TsgoDiagnostic[];
}

// 与 ts-patch/ts-node 集成，实现零延迟类型检查
export function createTsgoCompilerHost(): unknown {
  return tsgo.createCompilerHost({
    moduleResolution: 'node',
    target: 'ES2022',
  });
}
```

### 迁移检查清单：从 tsc 到 tsgo

```typescript
// migration-checklist.ts —— 自动化迁移评估

import { readFileSync } from 'fs';
import * as ts from 'typescript';

interface MigrationReport {
  compatible: boolean;
  issues: Array<{ file: string; line: number; issue: string }>;
  unsupportedFeatures: string[];
}

function assessMigrationCompatibility(projectPath: string): MigrationReport {
  const configPath = ts.findConfigFile(projectPath, ts.sys.fileExists);
  if (!configPath) {
    return { compatible: false, issues: [], unsupportedFeatures: ['No tsconfig.json found'] };
  }

  const config = ts.readConfigFile(configPath, ts.sys.readFile);
  const options = config.config.compilerOptions ?? {};
  const issues: MigrationReport['issues'] = [];
  const unsupportedFeatures: string[] = [];

  // 检查已知的不兼容选项
  if (options.emitDecoratorMetadata) {
    unsupportedFeatures.push('emitDecoratorMetadata 行为可能有差异');
  }

  if (options.customConditions) {
    unsupportedFeatures.push('customConditions 需验证支持状态');
  }

  // 检查 tsconfig extends 链
  if (options.extends) {
    // tsgo 完全支持 extends，但需确保路径解析一致
  }

  return {
    compatible: unsupportedFeatures.length === 0,
    issues,
    unsupportedFeatures,
  };
}

// 使用
const report = assessMigrationCompatibility('./');
console.log(JSON.stringify(report, null, 2));
```

---

## 参考链接

- [TypeScript Go — Native Preview Announcement](https://devblogs.microsoft.com/typescript/typescript-native-port/)
- [TypeScript GitHub — native-preview branch](https://github.com/microsoft/typescript-go)
- [tsgo Architecture Notes (社区整理)](https://github.com/microsoft/typescript-go/discussions)
- [SWC — Rust-based TypeScript/JavaScript Compiler](https://swc.rs/)
- [Oxc — JavaScript High-Performance Toolchain](https://oxc.rs/)
- [esbuild — An extremely fast JavaScript bundler](https://esbuild.github.io/)
- [Go Concurrency Patterns](https://go.dev/talks/2012/concurrency.slide)
- [Microsoft TypeScript Native Preview Blog](https://devblogs.microsoft.com/typescript/typescript-native-port/) — 官方公告
- [TypeScript-Go GitHub Discussions](https://github.com/microsoft/typescript-go/discussions) — 架构讨论
- [Go Memory Model](https://go.dev/ref/mem) — Go 内存模型
- [NAPI — Node-API Documentation](https://nodejs.org/api/n-api.html) — Node 原生模块接口
- [napi-rs](https://napi.rs/) — Rust/Go 构建 Node 原生模块的框架
- [SWC vs tsc 性能基准](https://swc.rs/docs/benchmarks) — SWC 官方基准
- [Bun Bundler](https://bun.sh/docs/bundler) — 另一款基于 Zig 的极速打包器
- [Rolldown](https://rolldown.rs/) — 基于 Rust 的 Rollup 兼容打包器
- [Turbopack](https://turbo.build/pack) — Next.js 的原生打包器
- [Vite](https://vitejs.dev/) — 前端构建工具生态
- [Go Blog — Shared Memory Concurrency](https://go.dev/blog/share-memory-by-communicating) — Go 并发哲学
- [TypeScript 5.8 Release Notes](https://devblogs.microsoft.com/typescript/announcing-typescript-5-8/) — 最新 tsc 特性
- [TC39 — Type Annotations Proposal](https://github.com/tc39/proposal-type-annotations) — JS 原生类型标注提案

---

*本文件为学术前沿瞭望的 tsgo 跟踪报告，每季度更新。*
