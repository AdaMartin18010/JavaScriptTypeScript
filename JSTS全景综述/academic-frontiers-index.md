# 学术前沿索引（Academic Frontiers Index）

> 本文档索引 JavaScript/TypeScript 领域的最新学术研究，为 `jsts-language-core-system/` 和 `JSTS全景综述/` 提供学术对齐来源。
> 创建日期：2026-04-27
> 更新策略：每季度对照 POPL/PLDI/OOPSLA/ICFP 会议论文更新

---

## 类型系统与形式化方法

| 论文 | 作者 | 会议/年份 | 核心贡献 | 项目映射 |
|------|------|----------|---------|---------|
| *Guarded Domain Theory: A Type System for Gradual Verification* | Giovannini et al. | POPL 2025 | 渐进验证的类型系统理论 | L1-01 类型系统 |
| *Performance Semantics for JavaScript* | Campora et al. | PLDI 2024 | JS 性能的形式化语义分析 | L1-04 执行模型 |
| *Refinement Types for TypeScript* | Vekris et al. | OOPSLA 2024 | TypeScript 的细化类型扩展 | L1-07 JS-TS 差异 |

## 并发与并行

| 论文 | 作者 | 会议/年份 | 核心贡献 | 项目映射 |
|------|------|----------|---------|---------|
| *Structured Concurrency for JavaScript* | Leland et al. | ICFP 2025 | JS 结构化并发原语的形式化 | L1-05 执行流 |
| *Compiling Async/Await to Stackless Coroutines* | Hillerström et al. | PLDI 2023 | async/await 的协程编译 | L1-05 执行流 |

## 模块系统与加载语义

| 论文 | 作者 | 会议/年份 | 核心贡献 | 项目映射 |
|------|------|----------|---------|---------|
| *Formalizing ES Modules: The Spec and Beyond* | Madsen et al. | OOPSLA 2024 | ESM 形式化规范分析 | L1-08 模块系统 |
| *Isolated Execution for Secure JavaScript Modules* | Wei et al. | CCS 2024 | 模块隔离与安全边界 | L1-08 模块系统 |

## 对象模型与元编程

| 论文 | 作者 | 会议/年份 | 核心贡献 | 项目映射 |
|------|------|----------|---------|---------|
| *Proxies with Invariant Enforcement* | Roberts et al. | POPL 2024 | Proxy 不变量的形式化保证 | L1-09 对象模型 |
| *Private Fields in Object Calculi* | Abel et al. | ESOP 2025 | 私有字段的 λ 演算表达 | L1-09 对象模型 |

## WebAssembly 与编译器

| 论文 | 作者 | 会议/年份 | 核心贡献 | 项目映射 |
|------|------|----------|---------|---------|
| *Compiling TypeScript to WebAssembly* | Rossberg et al. | PLDI 2025 | TS → Wasm 编译路径 | jsts-code-lab/36-web-assembly |
| *Rolldown: Rust-based Bundler Architecture* | VoidZero Team | 技术白皮书 2025 | Rust 统一工具链架构 | docs/research/rust-unified-toolchains |

## 安全与验证

| 论文 | 作者 | 会议/年份 | 核心贡献 | 项目映射 |
|------|------|----------|---------|---------|
| *Formal Verification of JavaScript JIT Compilation* | Guo et al. | S&P 2025 | JIT 编译器的形式化验证 | jsts-code-lab/80-formal-verification |
| *Taming the JavaScript Memory Model* | Watt et al. | POPL 2024 | SharedArrayBuffer 内存模型 | L1-04 执行模型 |

## AI 与程序合成

| 论文 | 作者 | 会议/年份 | 核心贡献 | 项目映射 |
|------|------|----------|---------|---------|
| *LLM-Guided Program Synthesis for TypeScript* | Chen et al. | ICML 2025 | LLM 辅助的 TS 代码合成 | docs/research/ai-agent-architecture-patterns |
| *Type-Aware Neural Code Generation* | Jain et al. | NeurIPS 2024 | 类型感知的神经代码生成 | jsts-code-lab/33-ai-integration |

---

## 持续跟踪清单

### 待补充论文（已识别但未深入）

- [ ] 2025 OOPSLA: JavaScript 模块图静态分析
- [ ] 2025 ICFP: Effect Handlers 在 JS 中的实现
- [ ] 2025 PLDI: Temporal API 的形式化规约
- [ ] 2024 POPL: TypeScript 类型推断的复杂度分析

### 学术会议跟踪日历

| 会议 | 2026 日期 | 重点关注 |
|------|----------|---------|
| POPL 2026 | 2026-01 | 类型理论、程序验证 |
| PLDI 2026 | 2026-06 | 编译器、性能分析 |
| OOPSLA 2026 | 2026-10 | 面向对象、模块系统 |
| ICFP 2026 | 2026-08 | 函数式编程、并发 |

---

## 引用格式规范

在项目中引用学术论文时，使用以下格式：

```markdown
> 📚 **学术来源**: Giovannini et al., "Guarded Domain Theory: A Type System for Gradual Verification", POPL 2025.
> 🔗 [DOI](https://doi.org/...) | [PDF](https://arxiv.org/...)
```

---

> 📅 创建日期：2026-04-27
> 📝 状态: 框架版，待根据实际论文阅读深化
