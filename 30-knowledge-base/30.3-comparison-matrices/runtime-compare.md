# 运行时对比矩阵：Node.js vs Bun vs Deno（2026）

> **定位**：`30-knowledge-base/30.3-comparison-matrices/`
> **新增**：2026-04

---

## 核心对比矩阵

| 维度 | Node.js (v24+) | Bun (v2.0+) | Deno (v2.0+) | 胜出者 |
|------|---------------|-------------|--------------|--------|
| **JS 引擎** | V8 (Google) | JavaScriptCore (Apple) | V8 (Google) | — |
| **TS 支持** | 转译（SWC/tsx） | **原生直接执行** | **原生直接执行** | Bun/Deno |
| **Web API 标准** | 部分（fetch, streams） | **完整原生实现** | **自始完整** | Bun/Deno |
| **安全模型** | 默认完全访问 | 默认完全访问 | **权限沙盒** | Deno |
| **实现语言** | C++ | **Zig** | Rust | — |
| **冷启动** | 中等 (~50ms) | **极快 (~10ms)** | 快 (~30ms) | **Bun** |
| **HTTP 吞吐量** | 中等 | **高** | 中高 | **Bun** |
| **包管理器** | npm/pnpm/yarn | **内置** | 内置 | Bun/Deno |
| **内置测试** | `node --test` | `bun test` | `deno test` | Bun/Deno |
| **内置打包** | 无 | `bun build` | `deno bundle` | Bun/Deno |
| **npm 兼容性** | **100%** | ~98% | ~95% | **Node.js** |
| **边缘部署** | 需适配 | 原生支持 | **Deno Deploy** | Deno |
| **适用场景** | 企业存量/通用 | Serverless/微服务 | 金融/高安全 | — |

---

## 性能基准数据

| 测试项 | Node.js v24 | Bun v2 | Deno v2 | 最快 |
|--------|------------|--------|---------|------|
| HTTP Hello World (req/s) | ~45K | **~68K** | ~55K | Bun |
| 文件读取 (ops/s) | ~12K | **~50K** | ~20K | Bun |
| JSON 解析 (ops/s) | ~280K | **~350K** | ~300K | Bun |
| 启动延迟 (ms) | 45 | **12** | 28 | Bun |
| 内存占用 (MB) | 35 | **22** | 28 | Bun |

*数据来源：TechEmpower Framework Benchmarks Round 23+，环境 x64/Linux。*

---

## 选型决策矩阵

| 场景 | 首选 | 次选 | 避免 | 理由 |
|------|------|------|------|------|
| 企业存量迁移 | Node.js | — | Bun/Deno | npm 生态兼容性 |
| Serverless/FaaS | Bun | Deno | Node.js | 冷启动速度 |
| 金融/医疗 | Deno | — | Node.js/Bun | 权限沙盒合规 |
| 边缘函数 | Bun/Deno | Node.js | — | 启动延迟 |
| 全栈 TS 新项目 | Bun | Deno | Node.js | 开发体验 |
| 需要特定 npm 包 | Node.js | Bun | Deno | 兼容性验证 |

---

*本矩阵基于 2026-04 的最新基准数据，建议每季度更新。*
