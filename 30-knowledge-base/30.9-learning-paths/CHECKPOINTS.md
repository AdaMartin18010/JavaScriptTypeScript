---
last-updated: 2026-04-27
review-cycle: 6 months
next-review: 2026-10-27
status: current
---

# 学习路径 Checkpoint 总索引

> 本文档汇总三条学习路径（初学者 / 进阶 / 架构师）的全部里程碑验证节点，作为能力评估的单一入口。
>
> 每个 Checkpoint 均包含：**理论自检清单** + **实践验证项目** + **通过标准** + **关联资源**。

---

## 📋 快速导航

| 路径 | 阶段数 | Checkpoint 数 | 预计总时长 |
|------|--------|---------------|-----------|
| [🌱 初学者路径](#初学者路径-checkpoints) | 4 | 4 | 4-6 周 |
| [⚙️ 进阶路径](#进阶路径-checkpoints) | 4 | 4 | 6-8 周 |
| [🏗️ 架构师路径](#架构师路径-checkpoints) | 5 | 5 | 8-12 周 |

**关联文档**：

- [项目制认证体系](./project-based-certification.md) — 以可交付成果验证能力的认证体系
- [示例项目总览](../../50-examples/README.md) — 所有配套实战项目（新架构）
- [代码实验室](../../20-code-lab/) — 按主题组织的代码示例与练习（新架构）
- [基础理论](../../10-fundamentals/) — 语言核心与类型系统深度理论（新架构）
- [知识库](../../30-knowledge-base/) — 对比矩阵、决策树、研究文档（新架构）

---

## 🌱 初学者路径 Checkpoints

> 完整路径：[beginners-path.md](./beginners-path.md)

| 阶段 | 主题 | Checkpoint 项目 | 代码位置 | 通过标准 | 难度 | 预计时间 |
|------|------|----------------|----------|---------|------|---------|
| 1 | TypeScript 基础 | 类型安全 `EventEmitter` | `jsts-code-lab/00-language-core/event-emitter-typed.ts` | `vitest run` 全部通过 | ⭐⭐ | 1-2 周 |
| 2 | 设计模式入门 | Todo 应用 + 3 种设计模式 | `jsts-code-lab/02-design-patterns/todo-app-patterns/` | 模式实现正确 + 单元测试覆盖 | ⭐⭐⭐ | 1-2 周 |
| 3 | 测试驱动开发 | TDD 计算器 | `jsts-code-lab/07-testing/calculator-tdd/` | 测试覆盖率 ≥ 90% | ⭐⭐⭐ | 1 周 |
| 4 | 前端框架入门 | React Todo (Milestone 3) | `examples/beginner-todo-master/` | 功能完整 + TS 无错误 + E2E 通过 | ⭐⭐⭐ | 1-2 周 |

### 初学者路径理论自检速查

- **阶段 1**：`interface` vs `type` 的 3 个核心区别 / 泛型约束工具类型 / 类型收窄 3 种方式
- **阶段 2**：工厂/观察者/策略模式 UML 图 / 适用场景与反模式
- **阶段 3**：红-绿-重构循环 / 单元/集成/E2E 边界 / Mock vs Stub
- **阶段 4**：组件化核心思想 / props vs state / 单向数据流

---

## ⚙️ 进阶路径 Checkpoints

> 完整路径：[intermediate-path.md](./intermediate-path.md)

| 阶段 | 主题 | Checkpoint 项目 | 代码位置 | 通过标准 | 难度 | 预计时间 |
|------|------|----------------|----------|---------|------|---------|
| 1 | 架构模式 | 六边形架构订单系统 | `jsts-code-lab/06-architecture-patterns/hexagonal-order/` | 领域层无外部依赖 + 测试覆盖 ≥ 80% | ⭐⭐⭐⭐ | 2 周 |
| 2 | 并发编程 | 请求限流器 | `jsts-code-lab/03-concurrency/rate-limiter/` | 并发测试通过 + Benchmark | ⭐⭐⭐⭐ | 2 周 |
| 3 | 性能优化 | 虚拟列表优化 | `jsts-code-lab/50-browser-runtime/virtual-list-optimization/` | Lighthouse Performance ≥ 90 | ⭐⭐⭐⭐ | 1-2 周 |
| 4 | 后端开发 | 带认证 API 服务 | `jsts-code-lab/21-api-security/authenticated-api/` | 安全扫描通过 + 集成测试覆盖 | ⭐⭐⭐⭐ | 2 周 |

### 进阶路径理论自检速查

- **阶段 1**：分层/六边形/CQRS 核心思想 / 架构模式选型 / 微服务拓扑图
- **阶段 2**：事件循环完整流程图 / Promise/AsyncAwait/Generator 底层 / 并发控制方案
- **阶段 3**：Chrome DevTools 性能分析 / 虚拟列表原理 / 缓存策略设计
- **阶段 4**：RESTful API 设计 / JWT 认证流程 / 数据库 Schema 设计

---

## 🏗️ 架构师路径 Checkpoints

> 完整路径：[advanced-path.md](./advanced-path.md)

| 阶段 | 主题 | Checkpoint 项目 | 代码位置 | 通过标准 | 难度 | 预计时间 |
|------|------|----------------|----------|---------|------|---------|
| 1 | 分布式系统 | 简化版 Raft 节点 | `jsts-code-lab/71-consensus-algorithms/raft-implementation/` | 3 节点集群测试 + 网络分区容错 | ⭐⭐⭐⭐⭐ | 3 周 |
| 2 | 微服务与云原生 | K8s 微服务部署 | `examples/intermediate-microservice-workshop/` | K8s 健康检查 + 分布式追踪可见 | ⭐⭐⭐⭐⭐ | 2 周 |
| 3 | 形式化验证 | TLA+ 分布式锁 | `jsts-code-lab/80-formal-verification/tla-plus-distributed-lock/` | TLC 模型检查通过 + 不变量保持 | ⭐⭐⭐⭐⭐ | 2 周 |
| 4 | 前沿技术 | AI Agent / Wasm / 量子模拟（三选一） | 见下方选项 | 见下方选项 | ⭐⭐⭐⭐⭐ | 3 周 |
| 5 | 架构师思维 | 技术选型 ADR | `30-knowledge-base/30.8-research/tsjs-stack-panorama-2026/技术选型方法论与评估框架.md` | 8 维度评估 + 量化评分 + 风险提示 | ⭐⭐⭐⭐ | 2 周 |

### 架构师路径 — 阶段 4 选项详情

| 选项 | 项目 | 代码位置 | 通过标准 |
|------|------|----------|---------|
| A | AI Agent 工作流 | `examples/ai-agent-production/` | Agent 能完成多步任务 |
| B | Wasm 模块集成 | `jsts-code-lab/36-web-assembly/wasm-integration/` | 性能比纯 JS 提升 ≥ 50% |
| C | 量子算法模拟 | `jsts-code-lab/77-quantum-computing/quantum-simulation/` | 正确模拟量子门操作 |

### 架构师路径理论自检速查

- **阶段 1**：CAP 定理形式化证明 / Raft 领导者选举+日志复制 / 分布式事务方案
- **阶段 2**：DDD 限界上下文拆分 / Service Mesh Sidecar 模式 / CI/CD 流水线设计
- **阶段 3**：Hoare 三元组 / TLA+ 并发协议 / 模型检测原理
- **阶段 4**：Transformer/Attention 原理 / AI Agent 架构 / Wasm Component Model
- **阶段 5**：完整 ADR 编写 / 技术选型 8 维度评估 / 技术债务偿还计划

---

## 🎯 跨路径能力矩阵

| 能力维度 | 初学者 | 进阶 | 架构师 |
|----------|--------|------|--------|
| 类型系统 | 基础类型 + 泛型 | 高级类型体操 | 类型理论形式化 |
| 设计模式 | 5 种常用模式 | 架构模式（六边形/CQRS） | 模式语言与演进 |
| 测试 | 单元测试 + TDD | 集成测试 + 性能测试 | 形式化验证 + 属性基测试 |
| 并发 | 异步基础 | 并发控制 + 响应式 | 分布式共识算法 |
| 性能 | 基础优化 | 系统级 profiling | 容量规划 + 负载建模 |
| 安全 | 基础输入验证 | API 安全 + JWT | 威胁建模 + 形式化安全 |
| 架构 | 模块化思维 | 分层/微服务设计 | 分布式系统 + ADR |
| 前沿技术 | — | Edge/SSR | AI/量子/Wasm |

---

## ✅ 认证项目对照

| 认证等级 | 对应路径 | 必做 Checkpoint | 认证项目数 |
|----------|----------|----------------|-----------|
| JSTS-Junior | 初学者路径 | 全部 4 个 | 4 个（Calculator / Todo / Blog / E-commerce Mini） |
| JSTS-Professional | 进阶路径 | 全部 4 个 | 3 个（Real-time Chat / Performance Dashboard / Microservice System） |
| JSTS-Architect | 架构师路径 | 全部 5 个 | 2 个（Compiler Toy / Distributed Consensus） |

### 与新架构目录的对应关系

| 认证等级 | 推荐学习顺序（新架构） |
|----------|---------------------|
| JSTS-Junior | `10-fundamentals/10.1-language-semantics` → `10.2-type-system` → `20-code-lab/20.2-language-patterns/design-patterns` → `50-examples/50.1-beginner/todo-master` |
| JSTS-Professional | `20-code-lab/20.3-concurrency-async` → `20.4-data-algorithms` → `20.5-frontend-frameworks` → `20.6-backend-apis` |
| JSTS-Architect | `20-code-lab/20.8-edge-serverless` → `20.9-observability-security` → `20.10-formal-verification` → `20.11-rust-toolchain` → `30-knowledge-base/30.8-research/` |

详细认证要求请参阅 [project-based-certification.md](./project-based-certification.md)。

---

## 🔗 外部资源索引

| 资源类型 | 链接 | 说明 |
|----------|------|------|
| 代码实验室 | `../../jsts-code-lab/` | 90+ 主题模块，含测试 |
| 示例项目 | `../../examples/README.md` | 13 个生产级示例 |
| 理论综述 | `../../30-knowledge-base/30.8-research/tsjs-stack-panorama-2026/` | 8 大主题全景文档 |
| 认证体系 | `./project-based-certification.md` | 项目制能力认证 |
| 构建工具对比 | `../30.3-comparison-matrices/build-tools-compare.md` | 工具选型矩阵 |

---

**💡 使用建议**：

1. **自学者**：按路径顺序完成每个 Checkpoint，使用本页作为进度追踪表
2. **导师/评审者**：使用本页快速定位验证标准和通过阈值
3. **招聘参考**：JSTS-Junior ≈ 初级前端，JSTS-Professional ≈ 中级全栈，JSTS-Architect ≈ 资深/架构师

---

*最后更新: 2026-04-27*
