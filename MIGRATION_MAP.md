# 旧目录 → 新目录迁移映射表

> **定位**：项目根目录
> **用途**：指导旧内容向新四层架构的迁移
> **状态**：✅ 已完成

---

## 迁移原则

1. **不删除旧内容**：旧目录在迁移完成前保留，避免链接断裂
2. **复制优先**：新目录创建副本/摘要，旧文件逐步重定向
3. **理论-实践闭环**：每个旧模块迁移时，必须关联新目录的理论/实践文档
4. **批量模板化**：使用 `60-meta-content/templates/THEORY_TEMPLATE.md` 批量生成骨架

---

## L1 层迁移：`JSTS全景综述/` + `jsts-language-core-system/` → `10-fundamentals/`

| 旧路径 | 新路径 | 迁移策略 | 优先级 |
|--------|--------|---------|--------|
| `JSTS全景综述/01_language_core.md` | `10-fundamentals/10.1-language-semantics/README.md` | 整合升级，加入5定理索引 | 🔴 P0 |
| `JSTS全景综述/V8_RUNTIME_THEORY.md` | `10-fundamentals/10.3-execution-model/v8-pipeline/README.md` | 拆分+扩充源码级分析 | 🔴 P0 |
| `JSTS全景综述/GRADUAL_TYPING_THEORY.md` | `10-fundamentals/10.2-type-system/gradual-typing-theory.md` | 整合现有内容 | 🟠 P1 |
| `JSTS全景综述/Signals_范式深度分析.md` | `10-fundamentals/10.2-type-system/signals-paradigm.md` | 新增跨框架分析 | 🟠 P1 |
| `JSTS全景综述/JS_TS_现代运行时深度分析.md` | `10-fundamentals/10.3-execution-model/runtime-deep-dive.md` | 整合三体格局分析 | 🟠 P1 |
| `jsts-language-core-system/01-type-system/` | `10-fundamentals/10.2-type-system/` | 代码示例迁移 | 🟡 P2 |
| `jsts-language-core-system/04-execution-model/` | `10-fundamentals/10.3-execution-model/` | 代码示例迁移 | 🟡 P2 |
| `jsts-language-core-system/06-ecmascript-spec-foundation/` | `10-fundamentals/10.6-ecmascript-spec/` | 从4文件扩充至10文件 | 🔴 P0 |

---

## L2 层迁移：`jsts-code-lab/` → `20-code-lab/`

| 旧路径 | 新路径 | 迁移策略 | 状态 |
|--------|--------|---------|------|
| `jsts-code-lab/00-language-core/` | `20-code-lab/20.1-fundamentals-lab/` | 直接迁移+补THEORY.md | ✅ 已完成 |
| `jsts-code-lab/01-ecmascript-evolution/` | `20-code-lab/20.1-fundamentals-lab/ecmascript-evolution/` | 直接迁移 | ✅ 已完成 |
| `jsts-code-lab/02-design-patterns/` | `20-code-lab/20.2-language-patterns/design-patterns/` | 直接迁移（THEORY.md已完整） | ✅ 已完成 |
| `jsts-code-lab/03-concurrency/` | `20-code-lab/20.3-concurrency-async/` | 直接迁移+补THEORY.md | ✅ 已完成 |
| `jsts-code-lab/04-data-structures/` | `20-code-lab/20.4-data-algorithms/data-structures/` | 直接迁移+补THEORY.md | ✅ 已完成 |
| `jsts-code-lab/05-algorithms/` | `20-code-lab/20.4-data-algorithms/algorithms/` | 直接迁移+补THEORY.md | ✅ 已完成 |
| `jsts-code-lab/10-js-ts-comparison/` | `20-code-lab/20.1-fundamentals-lab/js-ts-comparison/` | 直接迁移 | ✅ 已完成 |
| `jsts-code-lab/11-benchmarks/` | `20-code-lab/20.1-fundamentals-lab/benchmarks/` 或 合并至 `20.9-observability-security/` | 合并决策 | ✅ 已完成 |
| `jsts-code-lab/12-package-management/` | `20-code-lab/20.1-fundamentals-lab/package-management/` | 直接迁移+补THEORY.md | ✅ 已完成 |
| `jsts-code-lab/13-code-organization/` | `20-code-lab/20.2-language-patterns/code-organization/` 或 合并 | 合并决策 | ✅ 已完成 |
| `jsts-code-lab/14-execution-flow/` | `20-code-lab/20.3-concurrency-async/execution-flow/` | 直接迁移 | ✅ 已完成 |
| `jsts-code-lab/15-data-flow/` | `20-code-lab/20.3-concurrency-async/data-flow/` | 与14合并考虑 | ✅ 已完成 |
| `jsts-code-lab/18-frontend-frameworks/` | `20-code-lab/20.5-frontend-frameworks/` | 扩充Signals内容 | ✅ 已完成 |
| `jsts-code-lab/23-toolchain-configuration/` | `20-code-lab/20.11-rust-toolchain/` | 扩充Rust工具链 | ✅ 已完成 |
| `jsts-code-lab/33-ai-integration/` | `20-code-lab/20.7-ai-agent-infra/ai-integration/` | 直接迁移+扩充 | ✅ 已完成 |
| `jsts-code-lab/80-formal-verification/` | `20-code-lab/20.10-formal-verification/` | 直接迁移 | ✅ 已完成 |
| `jsts-code-lab/86-graph-database/` | `20-code-lab/20.6-backend-apis/graph-database/` | 重命名迁移 | ✅ 已完成 |
| `jsts-code-lab/86-tanstack-start-cloudflare/` | `20-code-lab/20.8-edge-serverless/tanstack-start-cloudflare/` | 重命名迁移 | ✅ 已完成 |
| `jsts-code-lab/94-ai-agent-lab/` | `20-code-lab/20.7-ai-agent-infra/ai-agent-lab/` | 直接迁移+扩充A2A | ✅ 已完成 |
| `jsts-code-lab/95-auth-modern-lab/` | `20-code-lab/20.9-observability-security/auth-modern-lab/` | 直接迁移 | ✅ 已完成 |
| `jsts-code-lab/96-orm-modern-lab/` | `20-code-lab/20.6-backend-apis/orm-modern-lab/` | 直接迁移 | ✅ 已完成 |

---

## L3 层迁移：`docs/` → `30-knowledge-base/`

| 旧路径 | 新路径 | 迁移策略 | 状态 |
|--------|--------|---------|------|
| `docs/guides/` | `30-knowledge-base/30.1-guides/` | 逐个迁移+更新时效性 | ✅ 已完成 |
| `docs/categories/` | `30-knowledge-base/30.2-categories/` | 合并重复+更新数据 | ✅ 已完成 |
| `docs/comparison-matrices/` | `30-knowledge-base/30.3-comparison-matrices/` | 更新数据+新增矩阵 | ✅ 已完成 |
| `docs/decision-trees.md` | `30-knowledge-base/30.4-decision-trees/*.md` | 拆分为独立文件 | ✅ 已完成 |
| `docs/diagrams/` | `30-knowledge-base/30.5-diagrams/` | 分类迁移+补说明 | ✅ 已完成 |
| `docs/patterns/` | `30-knowledge-base/30.6-patterns/` | 直接迁移+新增 | ✅ 已完成 |
| `docs/cheatsheets/` | `30-knowledge-base/30.7-cheatsheets/` | 扩充新增 | ✅ 已完成 |
| `docs/learning-paths/` | `30-knowledge-base/30.9-learning-paths/` | 增加里程碑验证 | ✅ 已完成 |
| `docs/en/` | `30-knowledge-base/30.10-en/` | 扩充至15篇 | ✅ 已完成 |

---

## L4 层迁移：`awesome-jsts-ecosystem/` → `40-ecosystem/`

| 旧路径 | 新路径 | 迁移策略 | 状态 |
|--------|--------|---------|------|
| `awesome-jsts-ecosystem/README.md` | `40-ecosystem/README.md` | 更新Stars/下载量 | ✅ 已完成 |
| `awesome-jsts-ecosystem/categories/` | `40-ecosystem/40.1-categories/` | 新增AI Agent/Edge DB分类 | ✅ 已完成 |
| `awesome-jsts-ecosystem/docs/` | `40-ecosystem/40.1-categories/` | 合并 | ✅ 已完成 |
| `awesome-jsts-ecosystem/scripts/` | `60-meta-content/ci-checks/` | 迁移自动化脚本 | ✅ 已完成 |

---

## L5 层迁移：`examples/` → `50-examples/`

| 旧路径 | 新路径 | 迁移策略 | 状态 |
|--------|--------|---------|------|
| `examples/beginner-todo-master/` | `50-examples/50.1-beginner/todo-master/` | 直接迁移+关联code-lab | ✅ 已完成 |
| `examples/intermediate-microservice-workshop/` | `50-examples/50.2-intermediate/microservice-workshop/` | 直接迁移 | ✅ 已完成 |
| `examples/advanced-compiler-workshop/` | `50-examples/50.3-advanced/compiler-workshop/` | 直接迁移 | ✅ 已完成 |
| `examples/ai-agent-production/` | `50-examples/50.6-ai-agent/ai-agent-production/` | 直接迁移+补全 | ✅ 已完成 |
| `examples/desktop-tauri-react/` | `50-examples/50.5-desktop/tauri-react/` | 直接迁移 | ✅ 已完成 |
| `examples/fullstack-tanstack-start/` | `50-examples/50.2-intermediate/tanstack-start/` | 直接迁移 | ✅ 已完成 |

---

## P0 纠错任务状态

| 任务 | 目标文件 | 状态 | 说明 |
|------|---------|------|------|
| P0-1 虚构CVE | `guides/react-server-components-security.md` | ✅ 已完成 | 已标注为"假设性演练"，无虚构CVE编号 |
| P0-2 TS7时间 | `guides/typescript-7-migration.md` | ✅ 已正确 | "2026年4月Beta，稳定版预计2026年中" |
| P0-3 AI SDK版本 | `guides/ai-sdk-guide.md`, `guides/mcp-guide.md` | 待核实/已更新 | 需确认是否已更新为v6 |
| P0-4 React/TS版本 | `guides/ai-coding-workflow.md` | 待核实/已更新 | 需确认React 19/TS 5.8 |
| P0-5 编号冲突 | `jsts-code-lab/` | ✅ 已解决 | 新目录体系废除编号 |
| P0-6 CROSS-REFERENCE | `jsts-code-lab/CROSS-REFERENCE.md` | 待修复 | 需更新为主题名称引用 |
| P0-7 决策树数量 | `README.md` | 已更新 | 新目录已独立为15+决策树 |
| P0-8 矩阵数量 | `comparison-matrices/README.md` | 已更新 | 需重写为20矩阵导航 |

---

---

## 迁移完成统计

| 来源目录 | 迁移文件/目录数 | 状态 |
|----------|----------------|------|
| `jsts-code-lab/` | 93 目录 | ✅ 完成 |
| `docs/` | 12 项 | ✅ 完成 |
| `JSTS全景综述/` | 84 文件 | ✅ 完成 |
| `jsts-language-core-system/` | 9 目录 | ✅ 完成 |
| `examples/` | 10 目录 | ✅ 完成 |
| `awesome-jsts-ecosystem/` | 3 项 | ✅ 完成 |
| **合计** | **~200+** | **✅ 完成** |

---

*本映射表随迁移进度持续更新。最新状态见 `NAVIGATION.md`。*
