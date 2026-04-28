# JS/TS 全景知识库 — 全局导航索引

> **导航原则**：主题聚类 > 数字编号 | 形式-实践闭环 | 七种思维表征
> **最后更新**：2026-04-28

---

## 快速入口

| 角色 | 推荐路径 |
|------|---------|
| **语言研究者** | `10-fundamentals/` → 公理化基础 → 定理体系 → 形式证明 |
| **全栈工程师** | `20-code-lab/` → 可运行示例 → THEORY.md → 对比矩阵 |
| **技术决策者** | `30-knowledge-base/30.4-decision-trees/` → 选型决策 → 对比矩阵 |
| **生态观察者** | `40-ecosystem/` → 趋势报告 → Stars/下载量追踪 |
| **初学者** | `50-examples/50.1-beginner/` → 里程碑项目 → 学习路径 |

---

## 四层架构地图

### L1 语言核心层：`10-fundamentals/` — 形式语义与学术前沿

```
10-fundamentals/
├── 10.1-language-semantics/          # 语言语义与形式化
│   ├── axioms/                       # 公理化基础（3大公理）
│   ├── theorems/                     # 定理体系（5大定理）
│   ├── proofs/                       # 形式证明与推理树
│   └── ontology/                     # 本体论框架（形式-工程-感知三重统一）
├── 10.2-type-system/                 # 类型系统深度分析
│   ├── structural-vs-nominal.md
│   ├── gradual-typing-theory.md
│   ├── type-erasure-formalism.md
│   └── turing-completeness.md
├── 10.3-execution-model/             # 执行模型
│   ├── v8-pipeline/                  # V8 引擎管道源码级分析
│   ├── jit-states/                   # JIT 三态转化
│   ├── hidden-classes.md
│   └── deoptimization.md
├── 10.4-module-system/               # [NEW] 模块系统
│   ├── esm-cjs-interop.md
│   ├── import-attributes-defer.md
│   └── circular-dependency.md
├── 10.5-object-model/                # [NEW] 对象模型与原型链
│   ├── prototype-chain.md
│   ├── property-descriptors.md
│   ├── proxy-reflect.md
│   └── private-fields.md
├── 10.6-ecmascript-spec/             # [EXPANDED] 规范基础
│   ├── spec-algorithms.md
│   ├── abstract-operations.md
│   ├── completion-records.md
│   └── temporal-api-stage4.md
└── 10.7-academic-frontiers/          # [NEW] 学术前沿瞭望
    ├── guarded-domain-theory.md
    └── tsgo-native-compiler.md
```

### L2 代码实验室：`20-code-lab/` — 从理论到实践的桥梁

```
20-code-lab/
├── 20.1-fundamentals-lab/            # 基础层（合并原 00-09）
├── 20.2-language-patterns/           # 语言与设计模式
├── 20.3-concurrency-async/           # 并发与异步
├── 20.4-data-algorithms/             # 数据结构与算法
├── 20.5-frontend-frameworks/         # 前端框架
│   └── signals-patterns/             # [NEW] Signals 跨框架范式
├── 20.6-backend-apis/                # 后端与API
├── 20.7-ai-agent-infra/              # AI Agent 基础设施
│   ├── mcp-protocol/                 # [NEW] MCP 协议
│   ├── a2a-protocol/                 # [NEW] A2A 协议
│   └── agent-patterns/               # [NEW] ReAct/Plan-and-Solve
├── 20.8-edge-serverless/             # 边缘与Serverless
├── 20.9-observability-security/      # 可观测性与安全
├── 20.10-formal-verification/        # 形式化验证
├── 20.11-rust-toolchain/             # [NEW] Rust 统一工具链
├── 20.12-build-free-typescript/      # [NEW] Type Stripping 范式
└── 20.13-edge-databases/             # [NEW] SQLite at the Edge
```

> **每个模块必须包含**：`THEORY.md`（理论深化） + `ARCHITECTURE.md`（架构说明） + 可运行代码 + `.test.ts`

### L3 文档体系层：`30-knowledge-base/` — 选型决策与最佳实践

```
30-knowledge-base/
├── 30.1-guides/                      # 深度指南（26个）
│   ├── a2a-protocol-guide.md         # [NEW]
│   ├── ai-observability-guide.md     # [NEW]
│   ├── build-free-typescript-guide.md # [NEW]
│   ├── llm-security-guide.md         # [NEW]
│   └── ai-coding-workflow.md         # [UPDATED]
├── 30.2-categories/                  # 技术分类（31个）
│   ├── 01-frontend-frameworks.md
│   ├── 05-state-management.md        # [UPDATED] Signals
│   ├── 28-ai-agent-infrastructure.md # [UPDATED]
│   ├── 29-authentication.md          # [UPDATED]
│   └── 30-edge-databases.md          # [NEW]
├── 30.3-comparison-matrices/         # 对比矩阵（20个）
│   ├── frontend-frameworks-compare.md
│   ├── build-tools-compare.md        # [UPDATED]
│   ├── runtime-compare.md            # [NEW] Node/Bun/Deno
│   └── ...
├── 30.4-decision-trees/              # 决策树（独立目录）
│   ├── runtime-selection.md          # [UPDATED]
│   ├── ai-coding-workflow.md         # [NEW]
│   └── type-stripping-strategy.md    # [NEW]
├── 30.5-diagrams/                    # 七种思维表征
│   ├── mindmaps/                     # 思维导图
│   ├── matrices/                     # 多维矩阵可视化
│   ├── theorem-trees/                # 定理推理树
│   └── scenario-trees/               # 应用场景树
├── 30.6-patterns/                    # 设计模式
├── 30.7-cheatsheets/                 # 速查表
├── 30.8-research/                    # 研究报告
│   └── tsjs-stack-panorama-2026/     # [MIGRATED] view/ 旗舰内容
├── 30.9-learning-paths/              # 学习路径（含里程碑验证）
└── 30.10-en/                         # 英文摘要
```

### L4 生态导航层：`40-ecosystem/` — 趋势与数据

```
40-ecosystem/
├── 40.1-categories/                  # 分类导航
├── 40.2-data/                        # Stars/下载量追踪
└── 40.3-trends/                      # [NEW] 趋势报告
    └── ECOSYSTEM_TRENDS_2026.md
```

### L5 示例项目层：`50-examples/` — 可运行参考实现

```
50-examples/
├── 50.1-beginner/                    # 初学者路径
├── 50.2-intermediate/                # 进阶路径
├── 50.3-advanced/                    # 高级路径
├── 50.4-mobile/                      # [NEW] React Native + Expo
├── 50.5-desktop/                     # [NEW] Tauri v2 + React
└── 50.6-ai-agent/                    # [NEW] Mastra + MCP
```

### L6 元数据层：`60-meta-content/` — 内容生产基础设施

```
60-meta-content/
├── templates/                        # 内容模板（THEORY/ARCHITECTURE）
├── quarterly-audit/                  # 季度审计清单
└── ci-checks/                        # 自动化内容检查
```

---

## 旧路径 → 新路径映射表

| 旧路径 | 新路径 | 状态 |
|--------|--------|------|
| `JSTS全景综述/01_language_core.md` | `10-fundamentals/10.1-language-semantics/README.md` | 待迁移 |
| `jsts-code-lab/00-language-core/` | `20-code-lab/20.1-fundamentals-lab/` | 待迁移 |
| `jsts-code-lab/02-design-patterns/` | `20-code-lab/20.2-language-patterns/` | 待迁移 |
| `jsts-code-lab/86-graph-database/` | `20-code-lab/20.6-backend-apis/graph-database/` | 待迁移 |
| `jsts-code-lab/86-tanstack-start-cloudflare/` | `20-code-lab/20.8-edge-serverless/tanstack-start-cloudflare/` | 待迁移 |
| `docs/guides/` | `30-knowledge-base/30.1-guides/` | 待迁移 |
| `docs/categories/` | `30-knowledge-base/30.2-categories/` | 待迁移 |
| `docs/comparison-matrices/` | `30-knowledge-base/30.3-comparison-matrices/` | 待迁移 |
| `docs/decision-trees.md` | `30-knowledge-base/30.4-decision-trees/` | 待拆分 |
| `docs/diagrams/` | `30-knowledge-base/30.5-diagrams/` | 待迁移 |
| `awesome-jsts-ecosystem/` | `40-ecosystem/` | 待迁移 |
| `examples/` | `50-examples/` | 待迁移 |
| `view/TS_JS_Stack_Analysis_2026.md` | `30-knowledge-base/30.8-research/tsjs-stack-panorama-2026/` | ✅ 已完成 |

---

## 五大定理快速导航

| 定理 | 位置 | 思维表征 |
|------|------|---------|
| **T1 JIT三态转化定理** | `10-fundamentals/10.3-execution-model/jit-states/` | 推理树 + 状态机图 |
| **T2 类型模块化定理** | `10-fundamentals/10.2-type-system/` | 范畴论图 + 矩阵 |
| **T3 运行时收敛定理** | `10-fundamentals/10.7-academic-frontiers/` | 演化时间线 |
| **T4 合成优先定理** | `30-knowledge-base/30.6-patterns/` | 决策树 + 场景树 |
| **T5 JIT安全张力定理** | `10-fundamentals/10.1-language-semantics/theorems/` | 推理树 + 漏洞分析 |

---

*本导航索引随内容重构持续更新。如发现断裂链接，请提交 Issue。*
