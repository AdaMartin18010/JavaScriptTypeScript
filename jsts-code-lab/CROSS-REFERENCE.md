<!-- 迁移说明：本文档中的旧数字编号引用已更新为新的语义化主题名称。模块目录已迁移至 20-code-lab/ 下的分类目录结构。-->

# 模块交叉引用索引

> jsts-code-lab 模块间的依赖关系和学习路径导航

> 🧠 **配套理论深度文档**：[jsts-language-core-system](../jsts-language-core-system/) — 52 篇按知识领域重组的深度文档，与本代码实验室形成理论与实践互补。

## 📊 模块关系图

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          JavaScript/TypeScript 代码实验室                    │
│                              模块依赖关系图谱                                 │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              基础层 (Foundation)                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                   │
│  │language-  │───▶│ecmascript-│    │js-ts-     │                   │
│  │   core       │    │  evolution   │    │ comparison   │                   │
│  └──────────────┘    └──────────────┘    └──────────────┘                   │
│         │                   │                   │                           │
│         ▼                   ▼                   ▼                           │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                   │
│  │design-    │◀───│concurrency│    │data-      │                   │
│  │  patterns    │    │              │◀───│ structures   │                   │
│  └──────┬───────┘    └──────────────┘    └──────────────┘                   │
│         │                   ▲                                            │
│         │                   │                                            │
│         ▼                   │                                            │
│  ┌──────────────┐    ┌─────┴────────┐    ┌──────────────┐                   │
│  │architecture│    │algorithms │    │testing    │                   │
│  │  patterns    │    │              │    │              │                   │
│  └──────┬───────┘    └──────────────┘    └──────────────┘                   │
│         │                                                                  │
└─────────┼──────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              应用层 (Application)                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                   │
│  │frontend-  │    │backend-   │    │database-  │                   │
│  │  frameworks │    │ development  │────▶│    orm       │                   │
│  └──────┬───────┘    └──────┬───────┘    └──────────────┘                   │
│         │                   │                                             │
│         │            ┌──────┴───────┐                                     │
│         │            │              │                                     │
│         ▼            ▼              ▼                                     │
│  ┌──────────────┐  ┌──────────┐  ┌──────────────┐                          │
│  │browser-   │  │api-   │  │microservices                             │
│  │   runtime   │  │  security│  │              │                          │
│  └──────────────┘  └──────────┘  └──────┬───────┘                          │
│                                         │                                  │
└─────────────────────────────────────────┼──────────────────────────────────┘
                                          │
                                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            系统层 (System)                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                   │
│  │distributed│◀───│consensus- │    │container- │                   │
│  │   systems   │    │  algorithms  │    │orchestration │                   │
│  └──────┬───────┘    └──────────────┘    └──────────────┘                   │
│         │                                                                  │
│         ▼                                                                  │
│  ┌──────────────────────────────────────────────────────────────┐          │
│  │                    高级专题 (Advanced Topics)                  │          │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │          │
│  │  │quantum│  │formal │  │ml-    │  │ai-    │        │          │
│  │  │computing │  │verification  │engineering │integration│        │          │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │          │
│  └──────────────────────────────────────────────────────────────┘          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔗 模块依赖矩阵

| 模块 | 前置依赖 | 并行学习 | 后续进阶 |
|------|---------|---------|---------|
| **language-core** | - | - | design-patterns, js-ts-comparison |
| **ecmascript-evolution** | - | language-core | js-ts-comparison |
| **design-patterns** | language-core | concurrency | architecture-patterns |
| **concurrency** | language-core | design-patterns | data-flow, distributed-systems |
| **data-structures** | language-core | algorithms | performance |
| **algorithms** | language-core | data-structures | performance |
| **architecture-patterns** | design-patterns | - | microservices |
| **testing** | language-core | design-patterns | testing-advanced |
| **js-ts-comparison** | language-core, ecmascript-evolution | - | - |
| **frontend-frameworks** | design-patterns, browser-runtime | - | ui-components |
| **backend-development** | architecture-patterns, testing | database-orm | api-security |
| **database-orm** | language-core | backend-development | graphql |
| **microservices** | architecture-patterns | deployment-devops | distributed-systems |
| **browser-runtime** | concurrency | - | web-rendering |
| **distributed-systems** | concurrency, architecture-patterns | microservices | consensus-algorithms |
| **consensus-algorithms** | distributed-systems | - | container-orchestration |

---

## 📚 按主题分类索引

### 📝 语言核心与形式化理论

| 主题 | 主要模块 | 理论文档 | 相关模块 |
|------|---------|---------|---------|
| ECMAScript 演进 | ecmascript-evolution | [index.ts](../20-code-lab/20.1-fundamentals-lab/ecmascript-evolution/index.ts) | js-ts-comparison |
| JS/TS 语义对比 | js-ts-comparison | [THEORY.md](../20-code-lab/20.1-fundamentals-lab/js-ts-comparison/THEORY.md) | type-theory-formal |
| 共识算法 | consensus-algorithms | [THEORY.md](../20-code-lab/20.8-edge-serverless/consensus-algorithms/THEORY.md) | distributed-systems |
| 形式化验证 | formal-verification | [THEORY.md](../20-code-lab/20.10-formal-verification/formal-verification/THEORY.md) | formal-semantics |

### 🏗️ 架构与设计

| 主题 | 主要模块 | 理论文档 | 相关模块 |
|------|---------|---------|---------|
| 设计模式 | design-patterns | [THEORY.md](../20-code-lab/20.2-language-patterns/design-patterns/THEORY.md) | architecture-patterns |
| 架构模式 | architecture-patterns | [ARCHITECTURE.md](../20-code-lab/20.2-language-patterns/architecture-patterns/ARCHITECTURE.md) | microservices, app-architecture |
| 并发架构 | concurrency | [ARCHITECTURE.md](../20-code-lab/20.3-concurrency-async/concurrency/ARCHITECTURE.md) | browser-runtime |
| 微服务 | microservices | - | deployment-devops, api-gateway |
| 分布式系统 | distributed-systems | [THEORY.md](../20-code-lab/20.8-edge-serverless/distributed-systems/THEORY.md) | consensus-algorithms |

### ⚡ 运行时与性能

| 主题 | 主要模块 | 理论文档 | 相关模块 |
|------|---------|---------|---------|
| 浏览器运行时 | browser-runtime | [THEORY.md](../20-code-lab/20.3-concurrency-async/browser-runtime/THEORY.md) | web-rendering |
| 性能优化 | performance, intelligent-performance | - | data-structures, algorithms |
| 内存管理 | browser-runtime | [THEORY.md](../20-code-lab/20.3-concurrency-async/browser-runtime/THEORY.md#内存管理理论) | concurrency |

### 🤖 AI 与智能系统

| 主题 | 主要模块 | 理论文档 | 相关模块 |
|------|---------|---------|---------|
| AI 集成 | ai-integration | - | ml-engineering |
| AI 测试 | ai-testing | [THEORY.md](../20-code-lab/20.7-ai-agent-infra/ai-testing/THEORY.md) | testing, testing-advanced |
| 智能代码生成 | code-generation | - | metaprogramming |

### 🔐 安全与可靠性

| 主题 | 主要模块 | 理论文档 | 相关模块 |
|------|---------|---------|---------|
| API 安全 | api-security | - | web-security, cybersecurity |
| Web 安全 | web-security | - | api-security |
| 混沌工程 | chaos-engineering | - | observability |

### 📊 数据与存储

| 主题 | 主要模块 | 理论文档 | 相关模块 |
|------|---------|---------|---------|
| 数据库 ORM | database-orm | - | graph-database |
| 缓存策略 | caching-strategies | - | database-orm |
| 事件溯源 | event-sourcing | - | architecture-patterns, message-queue |

---

## 🎯 学习路径推荐

### 路径一：全栈开发工程师

```
language-core → design-patterns → architecture-patterns
                        ↓
        ┌───────────────┼───────────────┐
        ↓               ↓               ↓
frontend-frameworks backend-development database-orm
        ↓               ↓               ↓
        └───────────────┴───────────────┘
                        ↓
              microservices → deployment-devops
```

### 路径二：前端架构师

```
language-core → design-patterns → concurrency
                                            ↓
                                    browser-runtime → web-rendering
                                            ↓
                                    ui-components → design-system
                                            ↓
                                    intelligent-performance
```

### 路径三：后端架构师

```
language-core → design-patterns → architecture-patterns
                                            ↓
                    ┌───────────────────────┼───────────────────────┐
                    ↓                       ↓                       ↓
            backend-development   database-orm        microservices
                    │                       │                       ↓
                    └───────────────────────┴───────────────────────┘
                                            ↓
                                    distributed-systems → consensus-algorithms
                                            ↓
                                    container-orchestration
```

### 路径四：AI 工程师

```
language-core → data-structures → algorithms
                                            ↓
                                    ai-integration → ml-engineering
                                            ↓
                    ┌───────────────────────┼───────────────────────┐
                    ↓                       ↓                       ↓
            ai-testing            code-generation        edge-ai
```

---

## 🔄 模块间关键依赖说明

### 理论基础依赖

| 依赖方向 | 说明 |
|---------|------|
| **design-patterns** → **architecture-patterns** | 架构模式建立在设计模式基础之上 |
| **concurrency** → **distributed-systems** | 分布式系统需要理解单机并发模型 |
| **architecture-patterns** → **microservices** | 微服务是架构模式的具体应用 |

### 技术栈依赖

| 依赖方向 | 说明 |
|---------|------|
| **language-core** → **所有模块** | TypeScript 是所有模块的基础 |
| **testing** → **所有功能模块** | 测试是质量保证的基础 |
| **deployment-devops** → **生产模块** | 部署知识用于上线应用 |

---

## 📖 快速导航

### 按难度分类

**入门级 (⭐)**

- language-core
- ecmascript-evolution
- testing
- js-ts-comparison

**中级 (⭐⭐⭐)**

- design-patterns
- concurrency
- data-structures
- architecture-patterns
- frontend-frameworks
- backend-development

**高级 (⭐⭐⭐⭐⭐)**

- microservices
- browser-runtime
- distributed-systems
- consensus-algorithms
- quantum-computing
- autonomous-systems

### 按热门技术分类

**云原生**

- deployment-devops
- microservices
- container-orchestration
- service-mesh-advanced
- realtime-analytics
- tanstack-start-cloudflare

**人工智能**

- ai-integration
- ai-testing
- code-generation
- ml-engineering
- edge-ai
- ai-agent-lab

**Web 技术**

- frontend-frameworks
- edge-computing
- web-assembly
- pwa
- browser-runtime

---

## 🧩 按技术栈组合查找

| 技术栈组合 | 涉及模块 | 说明 |
|------------|----------|------|
| **AI 全栈** | ai-agent-lab + ai-integration + edge-ai | MCP Server、Vercel AI SDK Tool Calling、Multi-agent Workflow |
| **现代认证全栈** | auth-modern-lab + api-security | better-auth、Passkeys、OAuth2 PKCE、RBAC |
| **边缘数据库全栈** | orm-modern-lab + edge-computing | Drizzle Schema、Query Patterns、Prisma 7 Edge、Turso |
| **实时分析全栈** | realtime-analytics + tanstack-start-cloudflare | TanStack Start、Cloudflare Workers、实时流处理 |

---

## 📂 模块文件交叉引用

### web-apis-lab: Web APIs Lab

| 文件 | 关联模块 | 关联文档 |
|------|----------|----------|
| fetch-advanced.ts | execution-flow | docs/guides/web-apis-guide.md |
| streams-pipeline.ts | data-flow | docs/guides/web-apis-guide.md |
| service-worker-cache.ts | edge-computing | docs/guides/web-apis-guide.md |
| observer-patterns.ts | browser-runtime | docs/guides/web-apis-guide.md |

### nodejs-core-lab: Node.js Core Modules Lab

| 文件 | 关联模块 | 关联文档 |
|------|----------|----------|
| fs-patterns.ts | package-management | docs/guides/nodejs-core-modules-guide.md |
| http-server-patterns.ts | backend-development | docs/guides/nodejs-core-modules-guide.md |
| crypto-patterns.ts | api-security | docs/guides/nodejs-core-modules-guide.md |
| stream-pipeline.ts | execution-flow | docs/guides/nodejs-core-modules-guide.md |

### observability-lab: Observability Lab

| 文件 | 关联模块 | 关联文档 |
|------|----------|----------|
| structured-logger.ts | observability | docs/categories/23-error-monitoring-logging.md |
| error-reporter.ts | web-security | docs/categories/23-error-monitoring-logging.md |
| performance-observer.ts | performance | docs/categories/23-error-monitoring-logging.md |

### deployment-edge-lab: Deployment & Edge Computing Lab

| 文件 | 关联模块 | 关联文档 |
|------|----------|----------|
| cloudflare-worker.ts | edge-computing | docs/categories/26-deployment-hosting.md |
| vercel-edge-config.ts | serverless | docs/categories/26-deployment-hosting.md |
| docker-optimize.ts | deployment-devops | docs/categories/26-deployment-hosting.md |

### ai-agent-lab: AI Agent Lab

| 文件 | 关联模块 | 关联文档 |
|------|----------|----------|
| mcp-server-demo.ts | ai-integration | docs/categories/28-ai-agent-infrastructure.md |
| vercel-ai-sdk-tool-calling.ts | ai-integration | docs/categories/28-ai-agent-infrastructure.md |
| multi-agent-workflow.ts | ai-integration | docs/categories/28-ai-agent-infrastructure.md |

### auth-modern-lab: Modern Authentication Lab

| 文件 | 关联模块 | 关联文档 |
|------|----------|----------|
| better-auth-setup.ts | api-security | docs/categories/29-authentication.md |
| passkeys-implementation.ts | api-security | docs/categories/29-authentication.md |
| oauth2-pkce-flow.ts | api-security | docs/categories/29-authentication.md |
| rbac-middleware.ts | api-security | docs/categories/29-authentication.md |

### orm-modern-lab: Modern ORM Lab

| 文件 | 关联模块 | 关联文档 |
|------|----------|----------|
| drizzle-schema.ts | database-orm | docs/categories/11-orm-database.md |
| drizzle-query-patterns.ts | database-orm | docs/categories/11-orm-database.md |
| prisma-7-edge.ts | edge-computing | docs/categories/11-orm-database.md |
| turso-connection.ts | edge-computing | docs/categories/11-orm-database.md |

---

## 📝 更新日志

| 日期 | 更新内容 |
|------|----------|
| 2026-04-19 | 新增 ai-agent-lab、auth-modern-lab、orm-modern-lab 模块交叉引用；新增按技术栈组合查找表格 |
| 2026-04-19 | 新增 web-apis-lab、nodejs-core-lab、observability-lab、deployment-edge-lab 模块交叉引用 |
| 2026-04-17 | 新增 ECMAScript 2025/2026、JS/TS 语义对比、共识算法、形式化验证模块的交叉引用 |
| 2026-04-04 | 创建初始交叉引用文档，包含模块关系图、依赖矩阵和学习路径 |

---

**使用说明**：

1. 根据你的学习目标选择合适的学习路径
2. 查看模块的前置依赖，确保基础知识完备
3. 参考相关模块扩展学习视野
4. 定期检查本文档获取最新的模块关系信息
