---
last-updated: 2026-04-27
review-cycle: 6 months
next-review: 2026-10-27
status: current
---
# JS/TS 全景综述 v3 增强计划（已归档）

> **归档状态**：本计划中的任务已在 v4.0.0 发布周期内全部完成或已演进为 v4.x 的持续跟踪项。
> **归档日期**：2026-04-18
> **归档原因**：v4.0 已实现对 2025–2026 年权威前沿内容的系统性覆盖，v3 增强计划的目标已达成。

---

> 原目标：全面对齐 2025–2026 年国际最新权威内容，将文档深度与广度推进至前沿水平。
> 时间基准：2026 年 4 月 17 日
> 策略：文档与代码并重；规范级语义分析、真实编译器 API 实现、国际顶尖大学课程对齐三位一体已全部完成。

---

## 一、2025–2026 年权威前沿内容梳理

基于对 **ECMA-262 2025/2027**、**TypeScript 官方博客**、**TC39 提案库**、**V8 引擎博客**、**Node.js Release Notes**、**WinterTC 官方标准**、**POPL/PLDI 2025 学术会议** 的最新检索，以下是影响本项目的核心新知：

### 1.1 TypeScript：5.9 → 6.0 正式发布，7.0/Go 重写颠覆性变革

- **TypeScript 6.0** 已于 **2026 年 3 月 17 日**正式发布 [^ts-6.0-release]
  - 新增 `es2025` `target` / `lib` 选项
  - 内置 **Temporal API** 类型（Temporal 提案已达 **Stage 4**）
  - 支持 `#/` subpath imports
  - `import defer` 语法支持（TC39 Stage 3）
  - 方法推断改进：`this`-less functions 不再无条件被视为上下文敏感
- **TypeScript 7.0（代号 Corsa）**：微软正用 **Go 语言重写 TypeScript 编译器** [^ts-native-port]
  - JS 版本 tsc 将在 6.x 后进入维护模式
  - 目标：命令行类型检查性能提升 **10 倍**
  - 2025 年中预览版，2025 年底完整语言服务
  - 将彻底迁移至 **Language Server Protocol (LSP)**

### 1.2 ECMAScript / TC39：ES2025 已定稿，ES2026 轮廓清晰

**已达 Stage 4（已纳入标准）**：

- `Temporal` API：替代 `Date` 的全新日期时间系统
- `Array.fromAsync`：从异步可迭代对象创建数组
- `Error.isError`：跨 Realm 的可靠错误检测
- `Explicit Resource Management`：`using` / `await using` 声明
- `Promise.try`：统一同步/异步错误处理
- `RegExp.escape`：安全转义字符串为正则

**Stage 3（候选，大概率进入 ES2026）**：

- `import defer`：延迟模块求值（大型应用启动优化关键）
- `Import Attributes`：`import ... with { type: 'json' }`
- `Decorators`：类装饰器标准语法
- `Atomics.pause`：共享内存自旋锁优化
- `Joint Iteration`：多迭代器同步推进
- `Source Phase Imports`：在源码阶段导入模块（用于 bundler 元编程）

**Stage 2（值得关注）**：

- `Async Context`：异步上下文传播（OpenTelemetry、AOP 的基础）
- `Structs`：固定布局对象 + 同步原语（JS 性能模型的潜在范式转移）

### 1.3 Node.js / 运行时：24 发布，TypeScript 原生支持成为默认

- **Node.js 24**（2026 年 3 月）[^nodejs-24-release]
  - `--experimental-strip-types` 已**默认启用**：可直接 `node file.ts`
  - `--experimental-require-module` 已**默认启用**：CJS `require()` 完美加载同步 ESM
  - 新增 `import.meta.main`：检测模块是否为主入口
  - `fs.watch` AsyncIterator 优化，支持 burst 事件处理
- Node.js 23.6.0+ 已支持原生 TypeScript 执行

### 1.4 WinterTC（原 WinterCG）：成为 Ecma TC55，首个标准已发布

- **2025 年 1 月**：WinterCG 正式关闭，**Ecma TC55（WinterTC）**成立 [^wintertc-announcement]
- **2025 年 12 月**：发布首个 **Minimum Common Web API 2025 Snapshot** [^min-common-api-2025]
- 正在制定：
  - **CLI API**：统一的环境变量、命令行参数、当前工作目录访问
  - **Sockets API**：跨运行时的 TCP/TLS socket 标准
- 未来 Conformance Levels：Graphics、CLI/File System、Servers [^wintertc-tpac-2025]

### 1.5 V8 引擎：Turbolev 项目，编译器栈最终统一

- **Turbolev**（Maglev 前端 + Turboshaft 后端）正在开发中，目标是**最终取代 TurboFan** [^v8-turbolev]
- 这意味着 V8 将从 Sea of Nodes 架构彻底回归传统 CFG
- **WasmGC** 引入类型规范化（Canonical Type Index），为 WebAssembly 带来 GC 类型系统

### 1.6 PL 学术前沿（2025）

- **POPL 2025**：*Denotational Semantics of Gradual Typing using Synthetic Guarded Domain Theory* —— 用 Guarded Domain Theory 为渐进类型建立可复用的数学基础 [^popl-2025-gradual]
- **PLDI 2025**：*Type-Constrained Code Generation with Language Models* —— 用类型系统约束 LLM 的代码生成，在 TypeScript 上验证，编译错误减少超过一半 [^pldi-2025-type-llm]
- **POPL 2025**：*Data Race Freedom à la Mode* / *Relaxed Memory Concurrency Re-executed* —— *relaxed memory* 模型的最新验证技术

---

## 二、现有文档覆盖缺口分析

| 文档 | 当前状态 | 缺口 |
|------|---------|------|
| `01_language_core.md` | 覆盖到 TS 5.8 / ES2025 | **缺失**：TS 6.0 新特性（Temporal、es2025、import defer、#/`subpath imports）；**缺失**：TS 7.0/Go 重写这一架构级变革；`using` 当前标注为"Stage 3/4"，但现已**确定 Stage 4** |
| `JS_TS_语言语义模型全面分析.md` | 三层语义模型已建立 | **缺失**：`import defer` 的语义分析；**缺失**：TS 7.0 对"类型擦除"范式的潜在冲击（Go 重写是否改变编译器架构？）；**缺失**：`Async Context` 对执行模型的影响前瞻 |
| `04_concurrency.md` | HTML 2025 + V8 三层边界 | **缺失**：`Async Context`（Stage 2）作为异步上下文传播机制的前瞻分析；**缺失**：Node.js 24 的 `require(esm)` 与模块并发加载的边界细化 |
| `JS_TS_现代运行时深度分析.md` | V8 编译器/GC/模块解析 | **缺失**：Turbolev 项目及其对 TurboFan 的替代意义；**缺失**：Node.js 24 Type Stripping 默认启用对运行时工具链的影响；**缺失**：WasmGC / Type Canonicalization |
| `JS_TS_深度技术分析.md` | 2025 推荐配置 | tsconfig.json 仍为 5.8 级别，需升级至 **6.0 推荐配置**；未提及 TS 7.0 迁移准备 |
| **全局** | 无专门学术前沿文档 | 缺少对 PL 前沿（Guarded Domain Theory、Type-Constrained LLM Generation）的概念性引介，无法体现"研究者向"深度 |

---

## 三、v3 增强任务清单

### P0：紧跟主流发布（必须立即更新）

#### T1. `01_language_core.md` → 补充 TS 6.0 + ES2026 前瞻

- [x] 新增 **"TypeScript 6.x 核心特性"** 章节（已在 v4.0 `01_language_core.md` 与 `ES2026_FEATURES_PREVIEW.md` 中覆盖）
  - `es2025` target/lib 的语义
  - Temporal API 类型：与 `Date` 的本质差异，不可变性与时区安全
  - `#/` subpath imports：package.json `imports` 字段的解析语义
  - `import defer`：延迟求值的精确语义与工程场景
- [x] 更新 `using` 声明：明确标注为 **Stage 4 / 已纳入标准**（已在 v4.0 语言核心文档中更新）
- [x] 新增 **"TypeScript 7.0 前瞻：Go 重写与 LSP 迁移"** 章节（已在 v4.0 `JS_TS_TypeScript_7_Native_Compiler.md` 中覆盖）
  - 解释为什么从 JS 迁移到 Go（性能、并发、类型检查吞吐量）
  - 对生态的影响：JS 版 tsc 维护模式、LSP 统一、编辑器集成变革

#### T2. `JS_TS_语言语义模型全面分析.md` → 补充模块语义与编译器变革

- [x] 新增 **`import defer` 语义模型**（已在 v4.0 `JS_TS_语言语义模型全面分析.md` 与 `ES2026_FEATURES_PREVIEW.md` 中覆盖）
  - 与 `dynamic import()` 的本质区别（同步句法 vs 异步求值）
  - 模块命名空间代理（Module Namespace Proxy）的惰性求值语义
- [x] 新增 **TS 7.0 / Go 重写对语义层的影响分析**（已在 v4.0 `JS_TS_TypeScript_7_Native_Compiler.md` 中覆盖）
  - 类型擦除语义不变，但编译器内部 IR 和增量检查模型将彻底改变
- [x] 修正 `using` 的规范状态为 Stage 4（已在 v4.0 相关文档中修正）

#### T3. `JS_TS_深度技术分析.md` → 升级 2026 推荐配置

- [x] 重写第 6 节，给出 **TypeScript 6.0 / 2026 年 tsconfig.json**（已在 v4.0 `JS_TS_深度技术分析.md` 中升级）
  - 包含 `target: "ES2025"`、`moduleResolution: "bundler"`（apps）或 `"node16"`（libs）
  - 包含 `strictInference: true`（TS 5.9+）
  - 明确注释每个选项的 2026 年工程意义
- [x] 新增 **"为 TS 7.0 做准备"** 小节（已在 v4.0 `JS_TS_深度技术分析.md` 中覆盖）
  - 如何编写与原生编译器兼容的代码
  - 避免已被标记为废弃的特性

### P1：运行时与引擎前沿（深度扩展）

#### T4. `JS_TS_现代运行时深度分析.md` → 补充 V8 与 Node.js 24

- [x] 新增 **Turbolev 与编译器栈未来** 小节（已在 v4.0 `JS_TS_现代运行时深度分析.md` 中覆盖）
  - 解释 Turbolev 如何统一 Maglev + Turboshaft
  - 分析 "Sea of Nodes 之死"：为什么 V8 回归 CFG
- [x] 新增 **Node.js 24 与原生 TypeScript 支持**（已在 v4.0 `JS_TS_现代运行时深度分析.md` 与 `01_language_core.md` 中覆盖）
  - Type Stripping 的语义：它**不是** transpilation，而是 annotation removal
  - `require(esm)` 的实现机制与同步图求值
  - `import.meta.main` 的模块语义
- [x] 新增 **WebAssembly 前沿：WasmGC 与 Type Canonicalization**（已在 v4.0 `WEBASSEMBLY_PERFORMANCE.md` 中覆盖）
  - 解释 Canonical Type Index vs Module Type Index
  - 对 JS/Wasm 互操作类型的影响

#### T5. `04_concurrency.md` → 补充异步上下文前瞻

- [x] 新增 **Async Context（Stage 2）前瞻分析**（已在 v4.0 `04_concurrency.md` 中覆盖）
  - 解释 Async Context 如何解决 Promise 链中的上下文丢失问题
  - 与 Zone.js、Node.js AsyncLocalStorage 的关系
  - 对可观测性（OpenTelemetry）、AOP 的影响
- [x] 细化 Node.js 24 模块并发：同步 `require(esm)` 的求值冻结语义更新（已在 v4.0 `01_language_core.md` 中覆盖）

### P2：标准化生态（广度扩展）

#### T6. 新增文档：`JS_TS_标准化生态与运行时互操作.md`

- [x] 第 1 节：WinterTC / Ecma TC55 的诞生与使命（已在 v4.0 `JS_TS_标准化生态与运行时互操作.md` 中覆盖）
  - 从 WinterCG 到 TC55 的历程
  - Minimum Common Web API 2025 Snapshot 的核心内容
- [x] 第 2 节：Conformance Levels 与未来路线（已在 v4.0 `JS_TS_标准化生态与运行时互操作.md` 中覆盖）
  - Minimum（必实现）
  - Graphics / CLI-File System / Servers（可选扩展）
- [x] 第 3 节：对开发者的实际意义（已在 v4.0 `JS_TS_标准化生态与运行时互操作.md` 中覆盖）
  - "Write Once, Run on Node/Deno/Bun/Edge" 的可能性与边界
  - 如何编写 WinterTC 兼容代码

### P3：学术前沿瞭望（研究者向深度）

#### T7. 新增文档：`JS_TS_学术前沿瞭望.md`

- [x] 第 1 节：Gradual Typing 的数学基础新进展（已在 v4.0 `JS_TS_学术前沿瞭望.md` 中覆盖）
  - POPL 2025：Guarded Domain Theory 如何为渐进类型建立可复用的指称语义
  - 对 TypeScript `any` / `unknown` 语义理解的启示
- [x] 第 2 节：类型系统与 LLM 代码生成（已在 v4.0 `AI_ML_INTEGRATION_THEORY.md` 与 `JS_TS_学术前沿瞭望.md` 中覆盖）
  - PLDI 2025：Type-Constrained Decoding
  - 用类型推断引导 LLM 生成合法代码的原理
  - 对 TypeScript 类型体操与工程实践的影响
- [x] 第 3 节：Relaxed Memory 与并发验证（已在 v4.0 `JS_TS_学术前沿瞭望.md` 中覆盖）
  - POPL 2025：Relaxed Memory Concurrency Re-executed
  - 对 JavaScript `SharedArrayBuffer` / `Atomics` 内存模型理解的启示
- [x] 第 4 节：Structs 提案与 JS 性能模型的未来（已在 v4.0 `JS_TS_学术前沿瞭望.md` 中覆盖）
  - Stage 2 `Structs`：固定布局对象 + 同步原语
  - 如果进入标准，将如何改变 Hidden Classes / Shapes 的假设

### P4：全局一致性修复

#### T8. 全文档来源标注升级

- [x] 所有涉及 TC39 提案状态的描述，已对照 **2025–2026 年 TC39 proposals 仓库** 更新为准确阶段（v4.0 全文档已校核）
- [x] 所有 TypeScript 版本特性，已标注到 **5.9 / 6.0 / 7.0 预览**（v4.0 全文档已对齐）
- [x] 所有 Node.js 特性，已对齐 **Node.js 20 LTS / 22 / 24** 三个版本线（v4.0 全文档已对齐）

---

## 四、执行计划与里程碑

### 阶段一：P0 紧急更新（预计 2 天）

- 完成 T1、T2、T3
- 输出：语言核心、语义模型、技术分析三篇文档已对齐 TS 6.0 与 ES2025/2026

### 阶段二：P1 运行时深度扩展（预计 2 天）

- 完成 T4、T5
- 输出：运行时、并发两篇文档已覆盖 V8 Turbolev、Node.js 24、WasmGC

### 阶段三：P2 + P3 广度与学术深度（预计 3 天）

- 完成 T6、T7
- 输出：两篇全新文档（标准化生态、学术前沿瞭望）

### 阶段四：P4 一致性修复与审校（预计 1 天）

- 完成 T8
- 输出：全部文档规范引用已更新至 2026 年 4 月水平

**总计：约 8 天完成 v3 文档增强**

---

## 五、确认事项

请你确认以下问题，确认后我将立即开始并行推进：

1. **P0 的优先级是否最高？**
   - 是否需要我先跳过 P1/P2/P3，集中 2 天把 P0（TS 6.0 + ES2026 前瞻）做完给你看？

2. **新增的两篇文档（标准化生态、学术前沿瞭望）的定位**
   - A. 作为独立大文档，各 5k+ 字深度
   - B. 作为短篇瞭望（2-3k 字），快速建立概念框架

3. **TS 7.0 / Go 重写**
   - 这是一个仍在进行中的项目（预览版尚未完全公开细节），你希望：
     - A. 基于已公开的官方信息（Microsoft 博客、GitHub issue/PR）做深度分析
     - B. 仅做概念性介绍，不深入未公开实现细节

4. **是否有特定领域你最关心？**
   - 例如：Temporal API、import defer、Turbolev、WinterTC、Structs 等，我可以优先处理。

请回复确认，我将立即开始执行。
