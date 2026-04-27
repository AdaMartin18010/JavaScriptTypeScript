---
last-updated: 2026-04-27
review-cycle: 6 months
next-review: 2026-10-27
status: current
---

# 四维分类学习路径总览

> 本项目全部学习资源按「语言核心 / 框架生态 / 应用领域 / 技术基础设施」四个维度重新组织，每个维度均设置「入门 → 进阶 → 专家」三级递进路径，方便不同背景的学习者按需切入。

---

## 目录

- [四维分类学习路径总览](#四维分类学习路径总览)
  - [目录](#目录)
  - [总览矩阵](#总览矩阵)
  - [维度一：语言核心 (Language Core)](#维度一语言核心-language-core)
    - [入门：TypeScript 基础与 ECMAScript 现代语法](#入门typescript-基础与-ecmascript-现代语法)
    - [进阶：类型系统深度与执行模型](#进阶类型系统深度与执行模型)
    - [专家：形式化语义与编译器设计](#专家形式化语义与编译器设计)
  - [维度二：框架生态 (Frameworks Ecosystem)](#维度二框架生态-frameworks-ecosystem)
    - [入门：组件化开发与状态管理](#入门组件化开发与状态管理)
    - [进阶：架构模式与元框架](#进阶架构模式与元框架)
    - [专家：元框架架构与编译时优化](#专家元框架架构与编译时优化)
  - [维度三：应用领域 (Application Domains)](#维度三应用领域-application-domains)
    - [入门：Web 应用与 API 服务](#入门web-应用与-api-服务)
    - [进阶：AI 集成与边缘计算](#进阶ai-集成与边缘计算)
    - [专家：生产级部署与可观测性](#专家生产级部署与可观测性)
  - [维度四：技术基础设施 (Technical Infrastructure)](#维度四技术基础设施-technical-infrastructure)
    - [入门：工具链与包管理](#入门工具链与包管理)
    - [进阶：CI/CD 与容器化部署](#进阶cicd-与容器化部署)
    - [专家：SRE 运维与混沌工程](#专家sre-运维与混沌工程)
  - [跨维度推荐组合](#跨维度推荐组合)
  - [相关文档](#相关文档)

---

## 总览矩阵

| 维度 | 入门 (4–6 周) | 进阶 (6–8 周) | 专家 (8–12 周) |
|------|--------------|--------------|---------------|
| **语言核心** | TS 基础、ES 新特性、变量与类型 | 类型体操、事件循环、模块系统 | 形式化语义、类型理论、编译器 |
| **框架生态** | 组件开发、React/Vue 基础 | 六边形/CQRS、全栈元框架 | 自定义框架、编译时优化、DX |
| **应用领域** | Todo/Blog、REST API | AI Agent、实时通信、Edge | 多租户 SaaS、可观测性平台 |
| **技术基础设施** | Vite/npm、调试与监控 | K8s、CI/CD、服务网格 | SRE、混沌工程、平台工程 |

---

## 维度一：语言核心 (Language Core)

> 从能写代码到理解代码为什么这样运行。
> 专项路径详见 [`language-core-path.md`](./language-core-path.md)。

### 入门：TypeScript 基础与 ECMAScript 现代语法

- **周期**：1–2 周
- **核心资源**：
  - `jsts-code-lab/00-language-core/` — 语言核心代码实验
  - `jsts-code-lab/01-ecmascript-evolution/` — ECMAScript 特性演进
  - `docs/cheatsheets/TYPESCRIPT_CHEATSHEET.md`
  - `JSTS全景综述/01_language_core.md`
- **Checkpoint**：类型安全 `EventEmitter` (`jsts-code-lab/00-language-core/event-emitter-typed.ts`)

### 进阶：类型系统深度与执行模型

- **周期**：2–3 周
- **核心资源**：
  - `jsts-code-lab/10-js-ts-comparison/` — JS/TS 对称差集
  - `jsts-code-lab/14-execution-flow/` — 执行流与事件循环
  - `jsts-code-lab/40-type-theory-formal/` — 类型理论形式化
  - `jsts-language-core-system/` — 语言核心系统文档
  - `JSTS全景综述/ADVANCED_TYPE_SYSTEM_FEATURES.md`
- **Checkpoint**：实现一个支持泛型约束的工具类型库

### 专家：形式化语义与编译器设计

- **周期**：3–4 周
- **核心资源**：
  - `jsts-code-lab/41-formal-semantics/` — 形式化语义
  - `jsts-code-lab/79-compiler-design/` — 编译器设计
  - `jsts-code-lab/78-metaprogramming/` — 元编程与反射
  - `JSTS全景综述/FORMAL_SEMANTICS_COMPLETE.md`
  - `JSTS全景综述/COMPILER_LANGUAGE_DESIGN.md`
- **Checkpoint**：用 TLA+ 验证并发协议 或 实现玩具级编译器前端

---

## 维度二：框架生态 (Frameworks Ecosystem)

> 从使用框架到设计框架，再到理解框架背后的编译与运行时权衡。
> 专项路径详见 [`frameworks-path.md`](./frameworks-path.md)。

### 入门：组件化开发与状态管理

- **周期**：1–2 周
- **核心资源**：
  - `jsts-code-lab/18-frontend-frameworks/` — 前端框架基础
  - `jsts-code-lab/51-ui-components/` — UI 组件设计
  - `examples/beginner-todo-master/` — 实战项目
  - `docs/cheatsheets/REACT_CHEATSHEET.md`
- **Checkpoint**：完成 React + TS Todo 应用并通过 E2E 测试

### 进阶：架构模式与元框架

- **周期**：2–3 周
- **核心资源**：
  - `jsts-code-lab/06-architecture-patterns/` — 六边形/CQRS/事件溯源
  - `jsts-code-lab/53-app-architecture/` — 应用架构
  - `jsts-code-lab/59-fullstack-patterns/` — 全栈模式
  - `examples/fullstack-tanstack-start/` — 全栈元框架实战
  - `JSTS全景综述/ARCHITECTURE_PATTERNS_THEORY.md`
- **Checkpoint**：六边形架构订单系统 + 单元测试覆盖 ≥ 80%

### 专家：元框架架构与编译时优化

- **周期**：3–4 周
- **核心资源**：
  - `jsts-code-lab/79-compiler-design/` — 编译器与 transpiler
  - `jsts-code-lab/56-code-generation/` — 代码生成
  - `jsts-code-lab/60-developer-experience/` — DX 与平台工程
  - `examples/advanced-compiler-workshop/` — 编译器工作坊
  - `JSTS全景综述/METAPROGRAMMING_REFLECTION.md`
- **Checkpoint**：设计并原型验证一个迷你前端元框架（含编译时优化）

---

## 维度三：应用领域 (Application Domains)

> 从跑通 Demo 到在生产环境可靠运行。
> 专项路径详见 [`application-domains-path.md`](./application-domains-path.md)。

### 入门：Web 应用与 API 服务

- **周期**：2–3 周
- **核心资源**：
  - `jsts-code-lab/16-application-development/` — 应用开发
  - `jsts-code-lab/19-backend-development/` — 后端开发
  - `jsts-code-lab/21-api-security/` — API 安全
  - `examples/nodejs-api-security-boilerplate/`
  - `examples/desktop-tauri-react/`
- **Checkpoint**：带 JWT 认证的 RESTful API 服务（集成测试通过）

### 进阶：AI 集成与边缘计算

- **周期**：2–3 周
- **核心资源**：
  - `jsts-code-lab/33-ai-integration/` — AI 集成
  - `jsts-code-lab/30-real-time-communication/` — 实时通信
  - `jsts-code-lab/32-edge-computing/` — 边缘计算
  - `examples/ai-agent-production/` — AI Agent 生产级示例
  - `examples/edge-ai-inference/` — 边缘 AI 推理
  - `JSTS全景综述/AI_ML_INTEGRATION_THEORY.md`
- **Checkpoint**：AI Agent 工作流 或 边缘函数部署并通过冷启动测试

### 专家：生产级部署与可观测性

- **周期**：3–4 周
- **核心资源**：
  - `jsts-code-lab/74-observability/` — 可观测性
  - `jsts-code-lab/67-multi-tenancy/` — 多租户架构
  - `jsts-code-lab/75-chaos-engineering/` — 混沌工程
  - `examples/monorepo-fullstack-saas/` — SaaS  monorepo
  - `examples/intermediate-microservice-workshop/` — 微服务实战
  - `JSTS全景综述/08_observability.md`
- **Checkpoint**：多租户 SaaS 核心模块 + 分布式追踪 + 混沌测试

---

## 维度四：技术基础设施 (Technical Infrastructure)

> 从会用到会配，再到会设计高可用的工程平台。
> 专项路径详见 [`infrastructure-path.md`](./infrastructure-path.md)。

### 入门：工具链与包管理

- **周期**：1–2 周
- **核心资源**：
  - `jsts-code-lab/12-package-management/` — 包管理
  - `jsts-code-lab/23-toolchain-configuration/` — 工具链配置
  - `jsts-code-lab/17-debugging-monitoring/` — 调试与监控
  - `examples/04-build-tools/` — 构建工具示例
  - `docs/comparison-matrices/build-tools-compare.md`
- **Checkpoint**：从零配置一个 monorepo 工具链（lint/test/build/ci-ready）

### 进阶：CI/CD 与容器化部署

- **周期**：2–3 周
- **核心资源**：
  - `jsts-code-lab/22-deployment-devops/` — 部署与 DevOps
  - `jsts-code-lab/72-container-orchestration/` — 容器编排
  - `jsts-code-lab/25-microservices/` — 微服务
  - `JSTS全景综述/DEVOPS_DEPLOYMENT_THEORY.md`
- **Checkpoint**：微服务 K8s 部署（健康检查 + 分布式追踪可见）

### 专家：SRE 运维与混沌工程

- **周期**：3–4 周
- **核心资源**：
  - `jsts-code-lab/74-observability/` — 可观测性平台
  - `jsts-code-lab/75-chaos-engineering/` — 混沌工程
  - `jsts-code-lab/73-service-mesh-advanced/` — 高级服务网格
  - `examples/edge-observability-starter/` — 边缘可观测性 starter
  - `JSTS全景综述/08_observability.md`
- **Checkpoint**：设计并执行一次生产级故障演练（含 SLO 定义、回滚策略、事后复盘）

---

## 跨维度推荐组合

| 学习者画像 | 推荐维度组合 | 预计周期 |
|-----------|-------------|---------|
| 初级前端开发者 | 语言核心(入门) + 框架生态(入门) | 4–6 周 |
| 中级全栈开发者 | 框架生态(进阶) + 应用领域(入门) + 技术基础设施(入门) | 8–10 周 |
| 资深架构师 | 语言核心(专家) + 应用领域(专家) + 技术基础设施(专家) | 12–16 周 |
| AI 应用开发者 | 语言核心(进阶) + 框架生态(进阶) + 应用领域(进阶) | 8–10 周 |
| 平台/SRE 工程师 | 技术基础设施(全阶段) + 应用领域(进阶) | 10–14 周 |

---

## 相关文档

- [初学者路径 (beginners-path.md)](./beginners-path.md) — 语言核心 + 框架生态（入门）
- [进阶路径 (intermediate-path.md)](./intermediate-path.md) — 框架生态 + 技术基础设施（进阶）
- [高级路径 (advanced-path.md)](./advanced-path.md) — 框架生态 + 技术基础设施（专家）
- [Checkpoint 总索引 (CHECKPOINTS.md)](./CHECKPOINTS.md) — 所有验证节点一览
- [项目制认证体系 (project-based-certification.md)](./project-based-certification.md)

---

*最后更新: 2026-04-27*
