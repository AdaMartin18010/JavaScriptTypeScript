# 跨维度引用索引

> 当一项技术横跨多个维度时，本索引提供交叉导航。

---

## 按技术领域交叉索引

### React

| 维度 | 相关文档/模块 |
|------|-------------|
| **语言核心** | [执行模型](../jsts-language-core-system/04-execution-model/) — 组件渲染与调度机制 |
| **框架生态** | [前端框架对比](./categories/01-frontend-frameworks.md)、[React 模式](./patterns/REACT_PATTERNS.md) |
| **应用领域** | [RSC 安全指南](./guides/react-server-components-security.md)、[AI Coding Workflow 选型](./decision-trees.md#16-ai-coding-workflow-选型决策树) |
| **技术基础设施** | [构建工具对比](./categories/03-build-tools.md)、[测试框架对比](./comparison-matrices/testing-frameworks-compare.md) |

### TypeScript

| 维度 | 相关文档/模块 |
|------|-------------|
| **语言核心** | [类型系统](../jsts-language-core-system/01-type-system/)、[JS/TS 差异](../jsts-language-core-system/07-js-ts-symmetric-difference/) |
| **框架生态** | [框架类型安全](./categories/01-frontend-frameworks.md#类型安全) |
| **应用领域** | [Build-Free TS 指南](./guides/build-free-typescript-guide.md) |
| **技术基础设施** | [TS 7.0 迁移指南](./guides/typescript-7-migration.md)、[编译器对比](./comparison-matrices/js-ts-compilers-compare.md) |

### AI / LLM

| 维度 | 相关文档/模块 |
|------|-------------|
| **语言核心** | [生成器与迭代器](../jsts-code-lab/01-ecmascript-evolution/) — 流式输出基础 |
| **框架生态** | [AI Agent 基础设施](./categories/28-ai-agent-infrastructure.md)、[Vercel AI SDK 指南](./guides/ai-sdk-guide.md) |
| **应用领域** | [AI 可观测性](./guides/ai-observability-guide.md)、[LLM 安全](./guides/llm-security-guide.md)、[A2A 协议](./guides/a2a-protocol-guide.md) |
| **技术基础设施** | [MCP 指南](./guides/mcp-guide.md)、[可观测性工具对比](./comparison-matrices/observability-tools-compare.md) |

### 边缘计算 / Serverless

| 维度 | 相关文档/模块 |
|------|-------------|
| **语言核心** | [模块系统](../jsts-language-core-system/08-module-system/) — ESM 与边缘运行时 |
| **框架生态** | [Hono 框架](./categories/02-backend-frameworks.md)、[边缘框架选型](./decision-trees.md#9-部署平台选型决策树) |
| **应用领域** | [边缘数据库](./categories/30-edge-databases.md)、[边缘优先架构](../JSTS全景综述/边缘优先架构设计方法论.md) |
| **技术基础设施** | [部署平台对比](./categories/09-deployment-platforms.md)、[可观测性](./categories/23-error-monitoring-logging.md) |

---

## 按学习场景交叉索引

### 我想深入理解 JavaScript 引擎

```
语言核心 → 执行模型 → V8 引擎 → 运行时 → 性能优化
    ↓           ↓          ↓         ↓          ↓
01-language-core  04-execution-model  50-browser-runtime  08-performance  11-benchmarks
```

### 我想构建一个全栈 AI 应用

```
框架生态 → 应用领域 → 技术基础设施
    ↓          ↓            ↓
React/Next.js  AI Agent      部署/可观测性/安全
    ↓          ↓            ↓
18-frontend-frameworks  33-ai-integration  22-deployment-devops
                        94-ai-agent-lab    74-observability
```

### 我想优化现有项目的构建速度

```
技术基础设施 → 语言核心 → 框架生态
       ↓           ↓          ↓
构建工具对比    Type Stripping   框架编译优化
       ↓           ↓          ↓
03-build-tools   build-free-ts    前端框架性能
```

---

## 维度边界说明

| 边界问题 | 处理原则 | 示例 |
|---------|---------|------|
| 类型系统属于语言核心还是框架？ | 语言核心：TS 类型语法、类型推断、类型兼容 | `jsts-language-core-system/01-type-system/` |
| 框架的类型安全属于哪边？ | 框架生态：框架特定的类型模式（React.FC、Vue props 类型） | `docs/categories/01-frontend-frameworks.md` |
| 构建工具属于框架还是基础设施？ | 技术基础设施：Webpack/Vite/Rolldown 本身 | `docs/categories/03-build-tools.md` |
| 框架特定的构建配置属于哪边？ | 框架生态：Next.js 配置、Nuxt 配置 | `docs/guides/` 中框架迁移指南 |
| AI SDK 属于框架还是应用？ | 框架生态：SDK 本身是库；应用领域：具体 AI 应用架构 | SDK → `categories/28-ai-agent-infrastructure.md`，应用 → `guides/ai-observability-guide.md` |

---

> 如发现更多跨维度边界模糊的内容，请通过 Issue 反馈，我们将持续优化分类体系。

*最后更新: 2026-04-27*
*review-cycle: 3 months*
*status: current*
