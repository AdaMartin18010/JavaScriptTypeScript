# 架构师学习路径 (Architect Path)

> 目标人群：资深工程师，希望掌握系统架构设计能力
> 预计周期：8-12 周
> 前置要求：完成进阶工程师路径，或具备 3+ 年全栈开发经验

---

## 路径概览

```
Week 1-2: 系统设计与架构模式
    ├── 微服务架构
    ├── 事件驱动架构
    ├── CQRS / Event Sourcing
    └── 分布式系统基础

Week 3-4: 性能工程
    ├── 前端性能优化
    ├── 后端性能调优
    ├── 数据库优化
    └── 负载测试与压测

Week 5-6: 安全与可靠性
    ├── Web 安全深度
    ├── AI 应用安全
    ├── 容错设计
    └── 灾难恢复

Week 7-8: 前沿技术
    ├── AI Agent 架构
    ├── Edge Computing
    ├── WebAssembly
    └── 形式化验证

Week 9-10: 工程领导力
    ├── 技术选型方法论
    ├── 代码审查文化
    ├── 团队效能
    └── 技术债务管理

Week 11-12: 毕业设计
    ├── 设计一个完整的分布式系统
    ├── 编写架构设计文档 (ADR)
    └── 技术演讲与答辩
```

---

## Week 1-2: 系统设计与架构模式

### 学习目标

- 掌握常见的分布式架构模式
- 理解 CAP 定理和一致性模型
- 能够设计可扩展的系统架构

### 学习资源

| 主题 | 理论文档 | 代码实践 | 预计时间 |
|------|---------|---------|---------|
| 微服务设计 | `JSTS全景综述/05_distributed_systems.md` | `jsts-code-lab/25-microservices/` | 8h |
| 事件溯源 | `JSTS全景综述/05_distributed_systems.md` §Event Sourcing | `jsts-code-lab/26-event-sourcing/` | 6h |
| CQRS 模式 | `jsts-code-lab/06-architecture-patterns/cqrs-pattern.ts` | `jsts-code-lab/06-architecture-patterns/` | 5h |
| 分布式共识 | `JSTS全景综述/05_distributed_systems.md` §Consensus | `jsts-code-lab/71-consensus-algorithms/` | 6h |
| 容器编排 | `jsts-code-lab/72-container-orchestration/` | `examples/intermediate-microservice-workshop/` | 5h |

### Checkpoint 1: 架构设计验证

1. **系统设计挑战**：设计一个类似 Twitter 的社交 feed 系统，要求：
   - 支持 100K QPS 的读操作
   - 支持 fan-out 和 fan-in 两种 feed 生成策略
   - 绘制完整的架构图和数据流

2. **一致性挑战**：在最终一致性和强一致性之间为你的设计做选择，写出决策理由。

---

## Week 3-4: 性能工程

### 学习目标

- 系统性地分析和优化性能瓶颈
- 掌握性能测试方法论
- 理解浏览器和 Node.js 运行时原理

### 学习资源

| 主题 | 理论文档 | 代码实践 | 预计时间 |
|------|---------|---------|---------|
| 前端性能 | `JSTS全景综述/06_workflow_patterns.md` §性能 | `jsts-code-lab/08-performance/` | 6h |
| 运行时优化 | `JS_TS_现代运行时深度分析.md` | `jsts-code-lab/50-browser-runtime/` | 5h |
| 数据库优化 | `docs/categories/11-orm-database.md` §优化 | `jsts-code-lab/20-database-orm/` | 5h |
| Benchmark 设计 | `jsts-code-lab/11-benchmarks/` | `jsts-code-lab/08-performance/benchmarking.ts` | 4h |

### Checkpoint 2: 性能优化验证

1. 对一个现有的 React 应用进行性能审计，使用 Lighthouse 和 React DevTools Profiler，将 LCP 从 3s 优化到 <1.5s。
2. 设计并执行一个 Node.js API 的负载测试，找出吞吐量瓶颈并优化。

---

## Week 5-6: 安全与可靠性

### 学习目标

- 构建安全的全栈应用
- 设计容错和自愈系统
- 掌握 AI 应用特有的安全挑战

### 学习资源

| 主题 | 理论文档 | 代码实践 | 预计时间 |
|------|---------|---------|---------|
| Web 安全 | `docs/guides/react-server-components-security.md` | `jsts-code-lab/21-api-security/` | 6h |
| LLM 安全 | `docs/guides/llm-security-guide.md` | `jsts-code-lab/33-ai-integration/` | 5h |
| 容错设计 | `JSTS全景综述/05_distributed_systems.md` §Reliability | `jsts-code-lab/70-distributed-systems/` | 5h |
| 可观测性 | `docs/guides/ai-observability-guide.md` | `jsts-code-lab/74-observability/` | 4h |

### Checkpoint 3: 安全审计验证

1. 对一个示例应用进行完整的安全审计，找出至少 5 个漏洞并给出修复方案。
2. 设计一个 AI Agent 的安全架构，包含 Prompt Injection 防御、输出验证和权限边界。

---

## Week 7-8: 前沿技术

### 学习目标

- 理解 2026 年最具颠覆性的技术趋势
- 能够将前沿技术融入架构设计

### 学习资源

| 主题 | 理论文档 | 代码实践 | 预计时间 |
|------|---------|---------|---------|
| AI Agent 架构 | `docs/categories/28-ai-agent-infrastructure.md` | `jsts-code-lab/94-ai-agent-lab/` | 8h |
| Edge Computing | `JSTS全景综述/边缘优先架构设计方法论.md` | `jsts-code-lab/32-edge-computing/` | 5h |
| WebAssembly | `docs/guides/webassembly-guide.md` | `jsts-code-lab/36-web-assembly/` | 5h |
| 形式化验证 | `JSTS全景综述/03_design_patterns.md` §Formal Methods | `jsts-code-lab/80-formal-verification/` | 4h |

### Checkpoint 4: 前沿技术验证

1. 设计一个基于 MCP + A2A 的多 Agent 协作系统架构图。
2. 比较 Edge-first 和 Centralized 架构在你的业务场景中的优劣。

---

## Week 9-10: 工程领导力

### 学习目标

- 掌握技术选型的系统方法论
- 建立高效的代码审查文化
- 管理技术债务和团队效能

### 学习资源

| 主题 | 文档 | 预计时间 |
|------|------|---------|
| 技术选型框架 | `JSTS全景综述/技术选型方法论与评估框架.md` | 4h |
| 决策树实践 | `docs/decision-trees.md` | 3h |
| 技术债务管理 | `CRITICAL_ANALYSIS_AND_IMPROVEMENT_PLAN.md` | 2h |
| 代码审查指南 | `CONTRIBUTING.md` | 2h |

### Checkpoint 5: 技术决策验证

1. 为你的团队选择一个新的状态管理库，使用项目的技术选型框架完成完整的评估报告。
2. 编写一份技术债务清理计划，包含优先级、成本和预期收益。

---

## Week 11-12: 毕业设计

### 项目：设计一个完整的分布式系统

**选题示例**（三选一）：

1. **AI-Native SaaS 平台**：支持多租户、实时协作、AI Agent 集成
2. **边缘优先电商平台**：全球部署、低延迟、高可用
3. **实时数据流处理系统**：支持百万级 QPS、 Exactly-Once 语义

**交付物**：

- [ ] 架构设计文档 (ADR) ≥ 50 页
- [ ] 技术选型决策记录 ≥ 10 条
- [ ] 数据模型和 API 设计
- [ ] 部署架构图和成本估算
- [ ] 风险评估和应急预案
- [ ] 30 分钟技术演讲 (PPT + 演示)

**评审标准**：

- 架构的合理性和可扩展性
- 技术选型的论证充分性
- 安全性和可靠性设计
- 成本效益分析
- 演讲表达能力

---

## 完成此路径后，你应该能够

- 设计支撑百万用户的分布式系统
- 进行全面的技术选型评估
- 领导和指导技术团队
- 在业务和技术的交叉点做出决策
- 持续跟踪和引入前沿技术

**认证**：完成毕业设计并通过评审后，获得项目「架构师认证」。

---

*最后更新: 2026-04-27*
*review-cycle: 6 months*
*next-review: 2026-10-27*
*status: current*
