# Mermaid 图表索引：七种思维表征体系

> **定位**：`30-knowledge-base/30.5-diagrams/`
> **更新**：2026-04

---

## 概述

本目录使用 **Mermaid** 语法维护 TS/JS 知识体系的全部可视化图表。图表不仅是文档的装饰，更是**思维表征（Mental Representation）**的外化——通过七种可视化范式，将形式化定理、架构决策、概念网络和场景策略转化为可快速感知的图形语言。

---

## 七种思维表征定义与用途

| # | 表征类型 | 定义 | 适用场景 | 认知功能 |
|---|---------|------|---------|---------|
| 1 | **概念思维导图** (Mindmap) | 以中心主题为根，层级放射展开概念网络 | 类型系统、引擎架构、生态全景 | 建立概念间的层级关联与整体轮廓 |
| 2 | **定理证明树** (Theorem Tree) | 从公理到引理再到定理结论的演绎链 | 五大核心定理的形式化证明 | 展示逻辑演绎的严谨路径 |
| 3 | **场景决策树** (Scenario Tree) | 以条件分支展开的交互式决策路径 | 渲染策略、安全防御、技术选型 | 将复杂决策空间结构化 |
| 4 | **流程图** (Flowchart) | 步骤与判断的顺序执行可视化 | 构建管道、类型检查、模块解析 | 明确时序依赖与分支逻辑 |
| 5 | **状态图** (State Diagram) | 系统状态与触发转移的形式化描述 | Promise 生命周期、GC 状态机 | 刻画状态空间的完备性 |
| 6 | **时序图** (Sequence Diagram) | 多实体间消息交互的时间轴视图 | MCP/A2A 协议、框架内部通信 | 强调交互顺序与责任边界 |
| 7 | **矩阵图** (Matrix Diagram) | 多维度属性的正交比较网格 | 工具对比、框架选型、性能基准 | 支持多属性权衡决策 |
| 8 | **演化时间线** (Timeline) | 技术版本与演化的时序展开 | 语言版本、引擎迭代、生态迁移 | 建立历史演进的全景视图 |
| 9 | **范畴论交换图** (Category Diagram) | 数学结构到实现概念的映射 | 类型系统函子、形式化语义 | 揭示深层数学同构关系 |

---

## 当前图表索引

### 概念思维导图 (`mindmaps/`)

| 文件名 | 主题 | 关联定理/模块 | 核心覆盖 |
|--------|------|--------------|---------|
| `type-system-concept.mmd` | TypeScript 类型系统 | **T2** 类型模块化定理 | 类型注解、渐进类型、结构子类型、类型推断、类型变换、模块边界 |
| `v8-engine-concept.mmd` | V8 引擎执行管道 | **T1** JIT 三态定理、**T5** JIT 安全张力定理 | 解析、Ignition、TurboFan、GC、Hidden Classes、JIT 安全 |
| `runtime-ecosystem-concept.mmd` | JS 运行时生态系统 | **T3** 运行时收敛定理 | Node.js / Bun / Deno 对比、WinterCG、边缘计算 |
| `module-system-concept.mmd` | 模块系统 ESM/CJS | **T2** 类型模块化定理 | ESM 静态结构、CJS 动态结构、Import Attributes、互操作、循环依赖 |
| `object-model-concept.mmd` | 对象模型与元编程 | 10.9-object-model | 原型链、Proxy 陷阱、私有字段、Reflect API、WeakMap/WeakSet |
| `ai-agent-infra-concept.mmd` | AI Agent 基础设施 | ai-agent-production | MCP/A2A 协议、ReAct/Plan-and-Solve、沙盒、记忆系统、观测评估 |
| `edge-computing-concept.mmd` | 边缘计算架构 | edge-observability-starter | V8 Isolates、部署平台、Edge DB、CDN、安全合规、观测性 |

### 定理证明树 (`theorem-trees/`)

| 文件名 | 主题 | 关联定理 | 证明结构 |
|--------|------|---------|---------|
| `jit-three-state-proof.mmd` | JIT 三态转换证明 | **T1** | 公理 → 引理 → Ignition ↔ TurboFan ↔ Deoptimizer 循环 |

### 流程图 (`flowcharts/`)

| 文件名 | 主题 | 关联定理/模块 | 流程覆盖 |
|--------|------|--------------|---------|
| `type-checking-pipeline.mmd` | TypeScript 类型检查流程 | 10.2-type-system | Scanner → Parser → Binder → Checker → Emitter 完整管道 |
| `esm-cjs-interop.mmd` | ESM/CJS 互操作解析 | 10.8-module-system | package.json 判断、模块加载策略、循环依赖处理、错误路径 |
| `react-server-components.mmd` | RSC 渲染流程 | 20.5-frontend-frameworks | Server/Client 边界、水合、流式传输、交互回环 |

### 状态图 (`state-diagrams/`)

| 文件名 | 主题 | 关联定理/模块 | 状态覆盖 |
|--------|------|--------------|---------|
| `promise-states.mmd` | Promise A+ 状态机 | 10.5-execution-flow | pending → fulfilled/rejected，不可逆状态转移，微任务调度 |
| `v8-gc-states.mmd` | V8 垃圾回收状态 | v8-engine-concept | Scavenge → Mark-Sweep → Mark-Compact → Incremental/Concurrent |

### 时序图 (`sequence-diagrams/`)

| 文件名 | 主题 | 关联定理/模块 | 交互覆盖 |
|--------|------|--------------|---------|
| `mcp-protocol-flow.mmd` | MCP 协议交互时序 | ai-agent-production | Host ↔ Client ↔ Server：初始化、工具调用、资源获取、采样 |
| `a2a-protocol-flow.mmd` | A2A 协议 Agent 通信 | ai-agent-production | Agent A → Directory → Agent B → Agent C：任务委派、验证、完成 |

### 矩阵图 (`matrices/`)

| 文件名 | 主题 | 关联定理/模块 | 对比维度 |
|--------|------|--------------|---------|
| `frontend-frameworks-matrix.mmd` | 前端框架对比矩阵 | 20.5-frontend-frameworks | React/Vue/Svelte/Solid/Angular：DX vs 性能四象限 |
| `edge-databases-matrix.mmd` | 边缘数据库对比矩阵 | 30-edge-databases | Turso/D1/Deno KV/LibSQL：一致性、锁定、容量、定价、分布 |

### 演化时间线 (`timelines/`)

| 文件名 | 主题 | 关联定理/模块 | 时间覆盖 |
|--------|------|--------------|---------|
| `typescript-evolution.mmd` | TypeScript 版本演化 | 10.2-type-system | 1.0 → 5.8 → tsgo：关键特性与性能里程碑 |
| `javascript-engine-evolution.mmd` | JS 引擎演化 | v8-engine-concept | SpiderMonkey → V8 → JSC → Bun：编译器架构演进 |

### 范畴论交换图 (`category-diagrams/`)

| 文件名 | 主题 | 关联定理/模块 | 映射覆盖 |
|--------|------|--------------|---------|
| `type-system-functor.mmd` | 类型系统函子映射 | 10.2-type-system | TS 类型层 → JS 值层：Erase/Infer/Narrow/Map 函子变换 |

### 场景决策树 (`scenario-trees/`)

| 文件名 | 主题 | 关联定理/模块 | 决策维度 |
|--------|------|--------------|---------|
| `rendering-strategies.mmd` | 交互场景渲染策略 | **T4** 合成优先定理 | 高频动画 / 内容变更 / 复杂列表 / 用户输入 |
| `security-defense.mmd` | 安全威胁防御层级 | **T5** JIT 安全张力定理 | 浏览器层 / 运行时层 / 应用层 / 输入层 |

---

## 如何渲染这些图

### 方式一：Mermaid CLI（推荐）

```bash
# 安装 Mermaid CLI
npm install -g @mermaid-js/mermaid-cli

# 渲染单个文件为 PNG
mmdc -i mindmaps/type-system-concept.mmd -o type-system.png

# 渲染为 SVG（矢量，推荐）
mmdc -i mindmaps/type-system-concept.mmd -o type-system.svg

# 批量渲染当前目录所有 .mmd 文件
for file in */*.mmd; do mmdc -i "$file" -o "renders/$(basename $file .mmd).svg"; done
```

### 方式二：在线工具

- **Mermaid Live Editor**: [https://mermaid.live](https://mermaid.live)
  - 复制 `.mmd` 文件内容粘贴即可实时预览
  - 支持导出 PNG / SVG / PDF
- **GitHub / GitLab**: 直接在 Markdown 中使用 \`\`\`mermaid 代码块渲染
- **VS Code**: 安装插件 `Markdown Preview Mermaid Support`

### 方式三：文档站点集成

本项目的 VitePress 文档站点已配置 Mermaid 插件，可在 Markdown 中直接嵌入：

```markdown
::: mermaid
graph TD
    A[开始] --> B{判断}
    B -->|是| C[执行A]
    B -->|否| D[执行B]
:::
```

---

## 待补充图表清单（建议新增）

### 高优先级

| # | 建议文件名 | 类型 | 主题 | 关联内容 |
|---|-----------|------|------|---------|
| 1 | `theorem-trees/runtime-convergence-proof.mmd` | 定理证明树 | T3 运行时收敛定理的完整证明链 | `runtime-convergence-theorem.md` |
| 2 | `theorem-trees/type-modularity-proof.mmd` | 定理证明树 | T2 类型模块化定理的依赖图演绎 | `type-modularity-theorem.md` |
| 3 | `theorem-trees/jit-security-tension-proof.mmd` | 定理证明树 | T5 JIT 安全张力定理的攻击面推导 | `jit-security-tension-theorem.md` |
| 4 | `theorem-trees/compositing-priority-proof.mmd` | 定理证明树 | T4 合成优先定理的渲染管道证明 | `compositing-priority-theorem.md` |
| 5 | `mindmaps/signals-paradigm-concept.mmd` | 概念思维导图 | Signals 跨框架响应式范式全景 | `signals-patterns/README.md` |

### 中优先级

| # | 建议文件名 | 类型 | 主题 | 关联内容 |
|---|-----------|------|------|---------|
| 6 | `mindmaps/rust-toolchain-concept.mmd` | 概念思维导图 | Rust 重写 JS 工具链全栈 | `build-tools-compare.md` |
| 7 | `scenario-trees/runtime-selection.mmd` | 场景决策树 | Node.js / Bun / Deno 选型决策 | `runtime-compare.md` |
| 8 | `scenario-trees/build-tool-migration.mmd` | 场景决策树 | Webpack / Vite / Rspack 迁移路径 | `build-tools-compare.md` |
| 9 | `flowcharts/ci-cd-pipeline.mmd` | 流程图 | TS/JS 项目的 CI/CD 完整管道 | `30.6-patterns/` |
| 10 | `state-diagrams/jit-lifecycle.mmd` | 状态图 | V8 JIT 编译对象的生命周期状态机 | `v8-pipeline/` |
| 11 | `sequence-diagrams/ssr-hydration.mmd` | 时序图 | SSR 服务端渲染与水合过程 | `20.5-frontend-frameworks/` |
| 12 | `mindmaps/edge-databases-concept.mmd` | 概念思维导图 | SQLite at the Edge 产品生态 | `30-edge-databases.md` |
| 13 | `scenario-trees/edge-database-selection.mmd` | 场景决策树 | Turso / D1 / Neon / Deno KV 选型 | `30-edge-databases.md` |
| 14 | `flowcharts/module-resolution.mmd` | 流程图 | Node.js ESM / CJS 模块解析算法 | `10.8-module-system/` |
| 15 | `state-diagrams/promise-lifecycle.mmd` | 状态图 | Promise / Async-Await 状态转移 | `10.5-execution-flow/` |

---

## 贡献指南

新增图表请遵循以下规范：

1. **文件名规范**: `{type}/{kebab-case-topic}.mmd`
2. **类型目录**: `mindmaps/` | `theorem-trees/` | `scenario-trees/` | `flowcharts/` | `state-diagrams/` | `sequence-diagrams/` | `matrices/` | `timelines/` | `category-diagrams/`
3. **注释要求**: 在 `.mmd` 文件顶部添加 `%% 主题: XXX | 关联: XXX` 注释
4. **样式统一**: 根节点使用 `fill:#f9f,stroke:#333`，结论/安全节点使用 `fill:#bfb,stroke:#333`，风险节点使用 `fill:#fbb,stroke:#333`
5. **更新索引**: 新增图表后必须在本文档的「当前图表索引」表格中登记

---

*本索引为 TS/JS 全景知识库的可视化导航系统。每种表征类型对应一种认知操作——选择正确的图，就是选择正确的思考方式。*
