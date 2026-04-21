# JavaScript / TypeScript 语言核心深度体系

> 体系化梳理 JS/TS 语言核心：类型系统 → 变量系统 → 控制流 → 执行模型 → 执行流 → 规范基础
>
> 版本对齐：ECMAScript 2025 (ES16) / ES2026 草案 | TypeScript 5.8–6.0 / 7.0 前瞻
> 最后更新：2026-04

---

## 体系总览

本系列从**语言核心原理**角度，按六大专题维度进行体系化、递进式梳理，区别于：

- `JSTS全景综述/01_language_core.md` —— 按 ES 版本罗列特性（特性百科式）
- `JSTS全景综述/FORMAL_SEMANTICS_COMPLETE.md` —— 学术形式化语义
- `jsts-code-lab/00-language-core/` —— 零散代码示例

### 六大专题

| 专题 | 子专题数 | 核心覆盖 | 状态 |
|------|---------|---------|------|
| [01 类型系统](./01-type-system/README.md) | 13 | 从基础类型到类型级编程、TS 6.x/7.0 新特性 | ✅ 完成 |
| [02 变量系统](./02-variable-system/README.md) | 9 | 声明、作用域、闭包、环境记录、TDZ | ✅ 完成 |
| [03 控制流](./03-control-flow/README.md) | 9 | 同步/异步控制流、生成器、异常、using | ✅ 完成 |
| [04 执行模型](./04-execution-model/README.md) | 11 | 引擎架构、事件循环、GC、Agent/Realm | ✅ 完成 |
| [05 执行流](./05-execution-flow/README.md) | 6 | 代码执行顺序、Promise/async-await 流、经典题目 | ✅ 完成 |
| [06 规范基础](./06-ecmascript-spec-foundation/README.md) | 4 | 抽象操作、规范类型、内部方法、完成记录 | ✅ 完成 |

**总计：52 个子专题文件 + 7 个 README = 59 个文件**

---

## 学习路径建议

```
入门路线：
01-foundations → 02-var-let-const → 03-conditional-statements → 04-engine-architecture → 05-synchronous-flow

进阶路线：
01-generics-deep-dive → 02-closure-deep-dive → 03-async-control-flow → 04-event-loop-browser → 05-promise-execution-flow

专家路线：
01-ts7-go-compiler-preview → 05-lexical-environment → 04-agent-realm-job-queue → 06-completion-records
```

---

## 与现有内容的交叉引用

| 本专题文件 | 对应现有内容 | 关系 |
|-----------|-------------|------|
| `01-type-system/12-variance.md` | `JSTS全景综述/ADVANCED_TYPE_SYSTEM_FEATURES.md` §4 | 互补：更贴近实战场景 |
| `04-execution-model/07-event-loop-browser.md` | `JSTS全景综述/CONCURRENCY_MODELS_DEEP_DIVE.md` §1-2 | 互补：更简洁实用 |
| `04-execution-model/12-agent-realm-job-queue.md` | `JSTS全景综述/JS_TS_语言语义模型全面分析.md` §4.1, §7.1 | 互补：更聚焦规范基础 |
| `06-ecmascript-spec-foundation/` | `JSTS全景综述/FORMAL_SEMANTICS_COMPLETE.md` §2 | 互补：从学术到工程 |
| `02-variable-system/05-lexical-environment.md` | `JSTS全景综述/JS_TS_语言语义模型全面分析.md` §4.1.3 | 互补：更易读 |
| `03-control-flow/07-async-control-flow.md` | `JSTS全景综述/CONCURRENCY_MODELS_DEEP_DIVE.md` §3-4 | 互补：更聚焦控制流 |
| `04-execution-model/11-memory-management-gc.md` | `JSTS全景综述/V8_RUNTIME_THEORY.md` | 互补：更聚焦开发者视角 |

---

## 内容特色

- **对齐网络最新内容**：整合 2025-2026 年最新资料（TypeScript 6.x/7.0 Go 编译器、ES2025/2026、Temporal API、Iterator Helpers、Float16Array、显式资源管理、Error.isError 等）
- **规范引用**：基于 ECMA-262 2025（16th edition）和 TypeScript 5.8-6.0 规范
- **递进式结构**：每个专题从概念 → 机制 → 规范 → 实践 → 陷阱 → 前沿
- **可视化辅助**：Mermaid 时序图/状态机/流程图
- **与现有内容互补**：不重复现有内容，重新组织、补充空白、提升体系性

---

## 持续推进计划（已 100% 完成）

- [x] **Phase 1**：骨架搭建（59 个文件目录结构）
- [x] **Phase 2**：类型系统专题（13 个子专题）
- [x] **Phase 3**：变量系统专题（9 个子专题）
- [x] **Phase 4**：控制流专题（9 个子专题）
- [x] **Phase 5**：执行模型与执行流专题（17 个子专题）
- [x] **Phase 6**：规范基础与整合（4 个子专题 + 交叉引用 + README 更新）

---

**参考规范汇总**：

- ECMA-262 16th edition (ECMAScript 2025)
- TypeScript 5.8–6.0 Language Specification
- HTML Living Standard §8.1.4 Event loops
- Node.js 22+ Documentation
- V8 12.x Internals Documentation
