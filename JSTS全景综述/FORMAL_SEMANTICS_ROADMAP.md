# JS/TS 语言深度分析文档改进路线图 (v2)

> 目标：将项目从"知识示例库"升级为"面向研究者与高级开发者的 JS/TS 语言深度分析项目"。
> 策略：先文档、后代码；深度优先；概念准确但无需机械证明（Coq/K Framework）。

---

## 一、现状诊断：7大问题

| # | 问题 | 影响 | 处理文档 |
|---|------|------|----------|
| 1 | **伪形式化泛滥**：用 ASCII 画图代替精确语义规则，类型相等用 `JSON.stringify` 实现 | 严重误导，学术不严谨 | `JS_TS_语言语义模型全面分析.md` |
| 2 | **类型推断理论错误**：将 TS 的约束求解算法误称为 "Hindley-Milner 扩展" | 核心概念错误 | `01_language_core.md` |
| 3 | **Event Loop 模型过时**：未区分 V8/宿主/Node.js 三层边界，未更新到 HTML Living Standard 2025 | 工程理解偏差 | `04_concurrency.md` |
| 4 | **运行时架构完全缺失**：没有 V8 引擎、编译管线、GC、模块解析器的深度分析 | 无法解释"代码如何变成机器行为" | 新建文档 |
| 5 | **高级模块玩具化**：量子计算/NLP/区块链等模块是空壳类 | 稀释项目深度，应降级为索引 | `10_ai_ml.md` 等（本阶段暂不处理） |
| 6 | **代码与文档自相矛盾**：`formal-type-system.ts` 中使用 `any` 和 `@ts-ignore` | 削弱类型系统论述的可信度 | 代码阶段处理 |
| 7 | **缺少最新趋势**：未覆盖 `--erasableSyntaxOnly`、`NoInfer<T>`、`using`、WinterCG 等 | 时效性差 | 所有核心文档 |

---

## 二、文档重写计划

### P0：核心语义模型（已完成 → 进行中）

- **文件**：`JS_TS_语言语义模型全面分析.md`（重写）
- **目标**：建立准确、分层、可追溯权威规范的语义概念框架
- **关键改进**：
  1. 将"形式化"重新定义为"基于 ECMA-262 / TS Spec 的精确概念模型"
  2. 用 **Inference Rules** 风格（前提/结论）表达核心操作语义，但不追求机械可执行
  3. 区分 **JavaScript 运行时语义**、**TypeScript 擦除语义**、**宿主调度语义** 三个层次
  4. 引入 Gradual Typing 的学术视角解释 `any` / `unknown`

### P1：语言核心修正（已完成 → 进行中）

- **文件**：`01_language_core.md`（重写）
- **目标**：修正类型推断、子类型、变型的核心概念错误，补充 ES2025 / TS 5.8 新特性
- **关键改进**：
  1. 用 **Constraint-Based Type Inference** 替代错误的 HM 描述
  2. 增加 `NoInfer<T>`、`satisfies`、`using` 的语义分析
  3. 补充 ES2025（ES16）新特性：`Atomics.pause`、RegExp `/v` flag、Top-level `await` 在模块中的成熟语义
  4. 移除"形式化证明"中的明显逻辑漏洞

### P2：并发与执行模型（已完成 → 进行中）

- **文件**：`04_concurrency.md`（重写）
- **目标**：更新到 2024-2025 年的 Event Loop 规范与 V8 实现细节
- **关键改进**：
  1. 明确区分 **HTML Event Loop**、**Node.js/libuv Event Loop**、**V8 引擎内部机制**
  2. 引入 `v8::Isolate`、`v8::MicrotaskQueue`、`v8::TaskRunner` 的层级关系
  3. 解释 **task queues**（复数）与 **microtask checkpoint** 的精确触发时机
  4. 分析 `Top-level await` 的模块图（Module Graph）冻结语义

### P3：现代运行时深度分析（新建）

- **文件**：`JS_TS_现代运行时深度分析.md`（新建）
- **目标**：填补"JS 代码 → 机器指令"黑盒的空白
- **关键改进**：
  1. V8 编译管线：Ignition → Maglev → Turbofan 的分层编译策略
  2. 对象模型：Hidden Classes、Shapes、Inline Caching 的交互
  3. 内存管理：Orinoco GC（分代、并发标记、增量回收）
  4. 模块解析：从 `require()` 到 ESM 再到 `nodenext` / `bundler` resolution 的演进
  5. 新运行时：Deno、Bun、WinterCG 的语义承诺与差异

### P4：深度技术分析整合（已完成 → 进行中）

- **文件**：`JS_TS_深度技术分析.md`（更新）
- **目标**：作为前面文档的" executive summary "与最佳实践出口
- **关键改进**：
  1. 总结 v2 文档的核心洞察
  2. 给出 tsconfig.json 的 2025 年推荐配置（基于 TypeScript 5.8）
  3. 提供"深度优先"学习路径

---

## 三、权威参考来源（本版文档必须对齐）

1. **ECMAScript® 2025 Language Specification** (ECMA-262, 16th Edition) - <https://tc39.es/ecma262/2025/>
2. **TypeScript 5.8 Release Notes** - <https://devblogs.microsoft.com/typescript/announcing-typescript-5-8/>
3. **HTML Living Standard - Event Loop** (2025) - <https://html.spec.whatwg.org/multipage/webappapis.html#event-loops>
4. **V8 Blog / Design Docs**:
   - "Maglev: V8's Fastest Optimizing Compiler" (2023)
   - "Orinoco: Young Generation Garbage Collection" (2024)
   - V8 API Headers (`v8.h`, `isolate.cc`)
5. **学术论文**:
   - Victor Lanvin, *A semantic foundation for gradual set-theoretic types* (2022) — Gradual Typing 理论
   - Bruno et al., *Recursive Subtyping for All* (JFP 2025) — 递归子类型最新进展
   - Brown University S5 / JSCert — JS 形式化语义方向
6. **WinterCG** (Web-interoperable Runtimes Community Group) — 现代运行时标准化

---

## 四、完成标准（Checklist）

- [ ] `JS_TS_语言语义模型全面分析.md` v2 发布：无伪形式化，三层语义边界清晰
- [ ] `01_language_core.md` v2 发布：无 HM 错误，覆盖 ES2025 + TS 5.8
- [ ] `04_concurrency.md` v2 发布：Event Loop 模型对齐 HTML 2025 + V8
- [ ] `JS_TS_现代运行时深度分析.md` 新建完成：填补编译器/GC/模块解析空白
- [ ] `JS_TS_深度技术分析.md` 更新：汇总 v2 洞察，给出 2025 推荐配置
- [ ] 所有 v2 文档在关键论断处标注规范来源（如 `[ECMA-262 §9.5]`、`[TS 5.8 Release Notes]`）

---

**状态**：🟢 文档重写 + v3 增强 100% 完成 | **进度**：8/8 完成

- [x] `JS_TS_语言语义模型全面分析.md` v2/v3 发布
- [x] `01_language_core.md` v2/v3 发布
- [x] `04_concurrency.md` v2/v3 发布
- [x] `JS_TS_现代运行时深度分析.md` 新建完成
- [x] `JS_TS_深度技术分析.md` 更新完成
- [x] `JS_TS_标准化生态与运行时互操作.md` 新建完成
- [x] `JS_TS_学术前沿瞭望.md` 新建完成
- [x] 全局一致性修复与来源标注升级

- [x] `JS_TS_语言语义模型全面分析.md` v2 发布：无伪形式化，三层语义边界清晰
- [x] `01_language_core.md` v2 发布：无 HM 错误，覆盖 ES2025 + TS 5.8
- [x] `04_concurrency.md` v2 发布：Event Loop 模型对齐 HTML 2025 + V8
- [x] `JS_TS_现代运行时深度分析.md` 新建完成：填补编译器/GC/模块解析空白
- [x] `JS_TS_深度技术分析.md` 更新：汇总 v2 洞察，给出 2025 推荐配置
