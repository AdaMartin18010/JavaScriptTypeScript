# JavaScript / TypeScript 语言核心深度体系

> 体系化梳理 JS/TS 语言核心：类型系统 → 变量系统 → 控制流 → 执行模型 → 执行流 → 规范基础
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
| [01 类型系统](./01-type-system/README.md) | 16 | 从基础类型到类型级编程、TS 6.x/7.0 新特性 | 🚧 骨架 |
| [02 变量系统](./02-variable-system/README.md) | 9 | 声明、作用域、闭包、环境记录、TDZ | 🚧 骨架 |
| [03 控制流](./03-control-flow/README.md) | 9 | 同步/异步控制流、生成器、异常、using | 🚧 骨架 |
| [04 执行模型](./04-execution-model/README.md) | 12 | 引擎架构、事件循环、GC、Agent/Realm | 🚧 骨架 |
| [05 执行流](./05-execution-flow/README.md) | 6 | 代码执行顺序、Promise/async-await 流、经典题目 | 🚧 骨架 |
| [06 规范基础](./06-ecmascript-spec-foundation/README.md) | 4 | 抽象操作、规范类型、内部方法、完成记录 | 🚧 骨架 |

### 学习路径建议

```
入门路线：01-foundations → 02-var-let-const → 03-conditional-statements → 04-engine-architecture → 05-synchronous-flow
进阶路线：01-generics-deep-dive → 02-closure-deep-dive → 03-async-control-flow → 04-event-loop-browser → 05-promise-execution-flow
专家路线：01-type-level-programming → 05-lexical-environment → 04-agent-realm-job-queue → 06-completion-records
```

### 与现有内容的交叉引用

| 本专题文件 | 对应现有内容 |
|-----------|-------------|
| `01-type-system/12-variance.md` | `JSTS全景综述/ADVANCED_TYPE_SYSTEM_FEATURES.md` §4 |
| `04-execution-model/07-event-loop-browser.md` | `JSTS全景综述/CONCURRENCY_MODELS_DEEP_DIVE.md` §1-2 |
| `04-execution-model/12-agent-realm-job-queue.md` | `JSTS全景综述/JS_TS_语言语义模型全面分析.md` §4.1, §7.1 |
| `06-ecmascript-spec-foundation/` | `JSTS全景综述/FORMAL_SEMANTICS_COMPLETE.md` §2 |

---

## 持续推进计划

### Phase 1：骨架搭建 ✅

- [x] 创建完整目录结构（56个文件）
- [x] 编写根 README.md 与 6 个专题 README.md

### Phase 2：类型系统专题

- [ ] 填充 `01-type-system/` 16 个子专题
- [ ] 重点：TS 5.x/6.x/7.0 最新类型特性、类型级编程、变型

### Phase 3：变量系统专题

- [ ] 填充 `02-variable-system/` 9 个子专题
- [ ] 重点：TDZ 深度机制、词法环境规范模型、闭包内存模型

### Phase 4：控制流专题

- [ ] 填充 `03-control-flow/` 9 个子专题
- [ ] 重点：异步控制流、生成器执行挂起恢复、using 显式资源管理

### Phase 5：执行模型与执行流专题

- [ ] 填充 `04-execution-model/` 12 个子专题
- [ ] 填充 `05-execution-flow/` 6 个子专题
- [ ] 重点：浏览器 vs Node.js 事件循环差异、V8 GC、经典事件循环题目体系

### Phase 6：规范基础与整合

- [ ] 填充 `06-ecmascript-spec-foundation/` 4 个子专题
- [ ] 全体系交叉引用检查、可视化图表补充
- [ ] 与 `JSTS全景综述/` 和 `jsts-code-lab/` 建立双向链接
