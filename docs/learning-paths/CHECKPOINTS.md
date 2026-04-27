---
last-updated: 2026-04-27
review-cycle: 6 months
next-review: 2026-10-27
status: current
---
# 学习路径能力验证节点总览 (CHECKPOINTS)

> 本文档汇总所有学习路径（初学者 / 进阶 / 架构师）的 Checkpoint 验证节点，提供统一的能力评估入口。

---

## 📋 验证节点索引

| 路径 | 阶段 | 验证主题 | 自测题数 | 实践挑战 | 关联 code-lab | 关联示例项目 |
|------|------|----------|----------|----------|---------------|-------------|
| [初学者](#初学者路径-checkpoints) | 阶段 1 | TypeScript 基础 | 4 | 类型安全 EventEmitter | `00-language-core` | — |
| [初学者](#初学者路径-checkpoints) | 阶段 2 | 设计模式入门 | 3 | Todo 应用设计模式改造 | `02-design-patterns` | `beginner-todo-master` |
| [初学者](#初学者路径-checkpoints) | 阶段 3 | 测试驱动开发 | 3 | TDD 实现计算器 | `07-testing` | — |
| [初学者](#初学者路径-checkpoints) | 阶段 4 | 前端框架入门 | 3 | React + TypeScript Todo | `18-frontend-frameworks` | `beginner-todo-master` |
| [进阶](#进阶路径-checkpoints) | 阶段 1 | 架构模式 | 3 | 六边形架构订单系统 | `06-architecture-patterns` | — |
| [进阶](#进阶路径-checkpoints) | 阶段 2 | 并发编程 | 3 | 请求限流器实现 | `03-concurrency` | — |
| [进阶](#进阶路径-checkpoints) | 阶段 3 | 性能优化 | 3 | 虚拟列表优化 | `50-browser-runtime` | — |
| [进阶](#进阶路径-checkpoints) | 阶段 4 | 后端开发 | 3 | 认证 API 服务 | `21-api-security` | `nodejs-api-security-boilerplate` |
| [架构师](#架构师路径-checkpoints) | 阶段 1 | 分布式系统 | 3 | 简化版 Raft 节点 | `70-distributed-systems`, `71-consensus-algorithms` | — |
| [架构师](#架构师路径-checkpoints) | 阶段 2 | 微服务与云原生 | 3 | K8s 微服务部署 | `25-microservices`, `72-container-orchestration` | `intermediate-microservice-workshop` |
| [架构师](#架构师路径-checkpoints) | 阶段 3 | 形式化验证 | 3 | TLA+ 验证分布式锁 | `80-formal-verification` | — |
| [架构师](#架构师路径-checkpoints) | 阶段 4 | 前沿技术 | 3 | AI Agent / Wasm / 量子算法（三选一） | `33-ai-integration`, `36-web-assembly`, `77-quantum-computing` | `ai-agent-production` |
| [架构师](#架构师路径-checkpoints) | 阶段 5 | 架构师思维 | 3 | 编写技术选型 ADR | `06-architecture-patterns` | — |

---

## 🌱 初学者路径 Checkpoints

详细内容请参阅 [beginners-path.md](./beginners-path.md#-里程碑验证机制)

### Checkpoint 1: TypeScript 基础

- **理论自检**：interface vs type 区别、泛型约束工具类型、类型收窄方式
- **实践挑战**：实现类型安全 `EventEmitter`
- **通过标准**：`vitest run` 全部通过
- **关联模块**：`jsts-code-lab/00-language-core/`, `jsts-code-lab/10-js-ts-comparison/`

### Checkpoint 2: 设计模式入门

- **理论自检**：画出工厂/观察者/策略模式 UML、识别反模式
- **实践挑战**：为 Todo 应用添加 3 种设计模式
- **通过标准**：模式实现正确 + 单元测试覆盖
- **关联模块**：`jsts-code-lab/02-design-patterns/`
- **关联项目**：`examples/beginner-todo-master/`

### Checkpoint 3: 测试驱动开发

- **理论自检**：TDD 红-绿-重构、测试分层边界、Mock vs Stub
- **实践挑战**：用 TDD 实现计算器（加减乘除 + 幂运算 + 链式调用）
- **通过标准**：测试覆盖率 ≥ 90%
- **关联模块**：`jsts-code-lab/07-testing/`

### Checkpoint 4: 前端框架入门

- **理论自检**：组件化核心思想、props vs state、单向数据流
- **实践挑战**：完成 `examples/beginner-todo-master` 的 Milestone 3
- **通过标准**：功能完整 + TypeScript 无错误 + E2E 测试通过
- **关联模块**：`jsts-code-lab/18-frontend-frameworks/`
- **关联项目**：`examples/beginner-todo-master/`

---

## ⚙️ 进阶路径 Checkpoints

详细内容请参阅 [intermediate-path.md](./intermediate-path.md#-里程碑验证机制)

### Checkpoint 1: 架构模式

- **理论自检**：分层/六边形/CQRS 核心思想、架构模式选型、微服务拓扑图
- **实践挑战**：六边形架构订单系统（领域层 + 应用层 + 基础设施层）
- **通过标准**：领域层无外部依赖 + 单元测试覆盖 ≥ 80%
- **关联模块**：`jsts-code-lab/06-architecture-patterns/`

### Checkpoint 2: 并发编程

- **理论自检**：事件循环流程图、Promise/Async/Generator 底层、并发控制方案
- **实践挑战**：实现请求限流器（令牌桶 + 滑动窗口）
- **通过标准**：并发测试通过 + 性能 Benchmark
- **关联模块**：`jsts-code-lab/03-concurrency/`, `jsts-code-lab/15-data-flow/`

### Checkpoint 3: 性能优化

- **理论自检**：Chrome DevTools 性能分析、虚拟列表原理、缓存策略设计
- **实践挑战**：优化慢速列表组件（10,000 项 → 60fps）
- **通过标准**：Lighthouse Performance ≥ 90
- **关联模块**：`jsts-code-lab/50-browser-runtime/`, `jsts-code-lab/08-performance/`

### Checkpoint 4: 后端开发

- **理论自检**：RESTful API 设计、JWT 认证流程、数据库 Schema 设计
- **实践挑战**：带认证的 API 服务（注册/登录/CRUD + JWT + 输入验证）
- **通过标准**：安全扫描通过 + 集成测试覆盖
- **关联模块**：`jsts-code-lab/19-backend-development/`, `jsts-code-lab/21-api-security/`
- **关联项目**：`examples/nodejs-api-security-boilerplate/`

---

## 🏗️ 架构师路径 Checkpoints

详细内容请参阅 [advanced-path.md](./advanced-path.md#-里程碑验证机制)

### Checkpoint 1: 分布式系统

- **理论自检**：形式化证明 CAP、Raft 核心逻辑、分布式事务方案
- **实践挑战**：简化版 Raft 节点（领导者选举 + 心跳 + 日志复制）
- **通过标准**：3 节点集群测试通过 + 网络分区容错测试
- **关联模块**：`jsts-code-lab/70-distributed-systems/`, `jsts-code-lab/71-consensus-algorithms/`

### Checkpoint 2: 微服务与云原生

- **理论自检**：DDD 限界上下文拆分、Service Mesh Sidecar 模式、CI/CD 流水线
- **实践挑战**：部署微服务到 Kubernetes（用户 + 订单 + API 网关）
- **通过标准**：K8s 健康检查通过 + 分布式追踪可见
- **关联模块**：`jsts-code-lab/25-microservices/`, `jsts-code-lab/72-container-orchestration/`
- **关联项目**：`examples/intermediate-microservice-workshop/`

### Checkpoint 3: 形式化验证

- **理论自检**：Hoare 三元组、TLA+ 并发协议描述、模型检测原理
- **实践挑战**：用 TLA+ 验证分布式锁（获取/释放/容错/无死锁）
- **通过标准**：TLC 模型检查通过 + 所有不变量保持
- **关联模块**：`jsts-code-lab/80-formal-verification/`

### Checkpoint 4: 前沿技术（三选一）

- **理论自检**：Transformer/Attention 原理、AI Agent 架构、Wasm Component Model
- **实践挑战**：
  - 选项 A：AI Agent 工作流 → `examples/ai-agent-production/`
  - 选项 B：Wasm 模块集成 → `jsts-code-lab/36-web-assembly/`
  - 选项 C：量子算法模拟 → `jsts-code-lab/77-quantum-computing/`
- **关联模块**：`jsts-code-lab/33-ai-integration/`, `jsts-code-lab/36-web-assembly/`, `jsts-code-lab/77-quantum-computing/`

### Checkpoint 5: 架构师思维

- **理论自检**：完整 ADR 编写、技术选型框架评估、技术债务识别
- **实践挑战**：为团队编写技术选型 ADR（8 维度评估 + 量化评分 + 风险提示）
- **通过标准**：评估维度完整 + 决策可追溯
- **关联模块**：`jsts-code-lab/06-architecture-patterns/`

---

## ✅ 认证体系衔接

完成各路径 Checkpoint 后，可继续挑战 [项目制认证体系](./project-based-certification.md)：

| 路径 | 对应认证等级 | 认证项目 |
|------|-------------|---------|
| 初学者路径 | JSTS-Junior | Calculator / Todo List / Blog / E-commerce Mini |
| 进阶路径 | JSTS-Professional | Real-time Chat / Performance Dashboard / Microservice System |
| 架构师路径 | JSTS-Architect | Compiler Toy / Distributed Consensus |

---

## 🚀 快速导航

- [初学者学习路径](./beginners-path.md)
- [进阶学习路径](./intermediate-path.md)
- [高级/架构师学习路径](./advanced-path.md)
- [项目制认证体系](./project-based-certification.md)

---

*最后更新: 2026-04-27*
