# 模块交叉引用索引

> jsts-code-lab 模块间的依赖关系和学习路径导航

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
│  │00-language-  │───▶│01-ecmascript-│    │10-js-ts-     │                   │
│  │   core       │    │  evolution   │    │ comparison   │                   │
│  └──────────────┘    └──────────────┘    └──────────────┘                   │
│         │                   │                   │                           │
│         ▼                   ▼                   ▼                           │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                   │
│  │02-design-    │◀───│03-concurrency│    │04-data-      │                   │
│  │  patterns    │    │              │◀───│ structures   │                   │
│  └──────┬───────┘    └──────────────┘    └──────────────┘                   │
│         │                   ▲                                            │
│         │                   │                                            │
│         ▼                   │                                            │
│  ┌──────────────┐    ┌─────┴────────┐    ┌──────────────┐                   │
│  │06-architecture│    │05-algorithms │    │07-testing    │                   │
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
│  │18-frontend-  │    │19-backend-   │    │20-database-  │                   │
│  │  frameworks │    │ development  │────▶│    orm       │                   │
│  └──────┬───────┘    └──────┬───────┘    └──────────────┘                   │
│         │                   │                                             │
│         │            ┌──────┴───────┐                                     │
│         │            │              │                                     │
│         ▼            ▼              ▼                                     │
│  ┌──────────────┐  ┌──────────┐  ┌──────────────┐                          │
│  │50-browser-   │  │21-api-   │  │25-microservices                             │
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
│  │70-distributed│◀───│71-consensus- │    │72-container- │                   │
│  │   systems   │    │  algorithms  │    │orchestration │                   │
│  └──────┬───────┘    └──────────────┘    └──────────────┘                   │
│         │                                                                  │
│         ▼                                                                  │
│  ┌──────────────────────────────────────────────────────────────┐          │
│  │                    高级专题 (Advanced Topics)                  │          │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │          │
│  │  │77-quantum│  │80-formal │  │76-ml-    │  │33-ai-    │        │          │
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
| **00-language-core** | - | - | 02-design-patterns, 10-js-ts-comparison |
| **01-ecmascript-evolution** | - | 00-language-core | 10-js-ts-comparison |
| **02-design-patterns** | 00-language-core | 03-concurrency | 06-architecture-patterns |
| **03-concurrency** | 00-language-core | 02-design-patterns | 15-data-flow, 70-distributed-systems |
| **04-data-structures** | 00-language-core | 05-algorithms | 08-performance |
| **05-algorithms** | 00-language-core | 04-data-structures | 08-performance |
| **06-architecture-patterns** | 02-design-patterns | - | 25-microservices |
| **07-testing** | 00-language-core | 02-design-patterns | 28-testing-advanced |
| **10-js-ts-comparison** | 00-language-core, 01-ecmascript-evolution | - | - |
| **18-frontend-frameworks** | 02-design-patterns, 50-browser-runtime | - | 51-ui-components |
| **19-backend-development** | 06-architecture-patterns, 07-testing | 20-database-orm | 21-api-security |
| **20-database-orm** | 00-language-core | 19-backend-development | 24-graphql |
| **25-microservices** | 06-architecture-patterns | 22-deployment-devops | 70-distributed-systems |
| **50-browser-runtime** | 03-concurrency | - | 52-web-rendering |
| **70-distributed-systems** | 03-concurrency, 06-architecture-patterns | 25-microservices | 71-consensus-algorithms |
| **71-consensus-algorithms** | 70-distributed-systems | - | 72-container-orchestration |

---

## 📚 按主题分类索引

### 📝 语言核心与形式化理论

| 主题 | 主要模块 | 理论文档 | 相关模块 |
|------|---------|---------|---------|
| ECMAScript 演进 | 01-ecmascript-evolution | [index.ts](./01-ecmascript-evolution/index.ts) | 10-js-ts-comparison |
| JS/TS 语义对比 | 10-js-ts-comparison | [THEORY.md](./10-js-ts-comparison/THEORY.md) | 40-type-theory-formal |
| 共识算法 | 71-consensus-algorithms | [THEORY.md](./71-consensus-algorithms/THEORY.md) | 70-distributed-systems |
| 形式化验证 | 80-formal-verification | [THEORY.md](./80-formal-verification/THEORY.md) | 41-formal-semantics |

### 🏗️ 架构与设计

| 主题 | 主要模块 | 理论文档 | 相关模块 |
|------|---------|---------|---------|
| 设计模式 | 02-design-patterns | [THEORY.md](./02-design-patterns/THEORY.md) | 06-architecture-patterns |
| 架构模式 | 06-architecture-patterns | [ARCHITECTURE.md](./06-architecture-patterns/ARCHITECTURE.md) | 25-microservices, 53-app-architecture |
| 并发架构 | 03-concurrency | [ARCHITECTURE.md](./03-concurrency/ARCHITECTURE.md) | 50-browser-runtime |
| 微服务 | 25-microservices | - | 22-deployment-devops, 61-api-gateway |
| 分布式系统 | 70-distributed-systems | [THEORY.md](./70-distributed-systems/THEORY.md) | 71-consensus-algorithms |

### ⚡ 运行时与性能

| 主题 | 主要模块 | 理论文档 | 相关模块 |
|------|---------|---------|---------|
| 浏览器运行时 | 50-browser-runtime | [THEORY.md](./50-browser-runtime/THEORY.md) | 52-web-rendering |
| 性能优化 | 08-performance, 54-intelligent-performance | - | 04-data-structures, 05-algorithms |
| 内存管理 | 50-browser-runtime | [THEORY.md](./50-browser-runtime/THEORY.md#内存管理理论) | 03-concurrency |

### 🤖 AI 与智能系统

| 主题 | 主要模块 | 理论文档 | 相关模块 |
|------|---------|---------|---------|
| AI 集成 | 33-ai-integration | - | 76-ml-engineering |
| AI 测试 | 55-ai-testing | [THEORY.md](./55-ai-testing/THEORY.md) | 07-testing, 28-testing-advanced |
| 智能代码生成 | 56-code-generation | - | 78-metaprogramming |

### 🔐 安全与可靠性

| 主题 | 主要模块 | 理论文档 | 相关模块 |
|------|---------|---------|---------|
| API 安全 | 21-api-security | - | 38-web-security, 81-cybersecurity |
| Web 安全 | 38-web-security | - | 21-api-security |
| 混沌工程 | 75-chaos-engineering | - | 74-observability |

### 📊 数据与存储

| 主题 | 主要模块 | 理论文档 | 相关模块 |
|------|---------|---------|---------|
| 数据库 ORM | 20-database-orm | - | 86-graph-database |
| 缓存策略 | 63-caching-strategies | - | 20-database-orm |
| 事件溯源 | 26-event-sourcing | - | 06-architecture-patterns, 62-message-queue |

---

## 🎯 学习路径推荐

### 路径一：全栈开发工程师

```
00-language-core → 02-design-patterns → 06-architecture-patterns
                        ↓
        ┌───────────────┼───────────────┐
        ↓               ↓               ↓
18-frontend-frameworks 19-backend-development 20-database-orm
        ↓               ↓               ↓
        └───────────────┴───────────────┘
                        ↓
              25-microservices → 22-deployment-devops
```

### 路径二：前端架构师

```
00-language-core → 02-design-patterns → 03-concurrency
                                            ↓
                                    50-browser-runtime → 52-web-rendering
                                            ↓
                                    51-ui-components → 57-design-system
                                            ↓
                                    54-intelligent-performance
```

### 路径三：后端架构师

```
00-language-core → 02-design-patterns → 06-architecture-patterns
                                            ↓
                    ┌───────────────────────┼───────────────────────┐
                    ↓                       ↓                       ↓
            19-backend-development   20-database-orm        25-microservices
                    │                       │                       ↓
                    └───────────────────────┴───────────────────────┘
                                            ↓
                                    70-distributed-systems → 71-consensus-algorithms
                                            ↓
                                    72-container-orchestration
```

### 路径四：AI 工程师

```
00-language-core → 04-data-structures → 05-algorithms
                                            ↓
                                    33-ai-integration → 76-ml-engineering
                                            ↓
                    ┌───────────────────────┼───────────────────────┐
                    ↓                       ↓                       ↓
            55-ai-testing            56-code-generation        82-edge-ai
```

---

## 🔄 模块间关键依赖说明

### 理论基础依赖

| 依赖方向 | 说明 |
|---------|------|
| **02-design-patterns** → **06-architecture-patterns** | 架构模式建立在设计模式基础之上 |
| **03-concurrency** → **70-distributed-systems** | 分布式系统需要理解单机并发模型 |
| **06-architecture-patterns** → **25-microservices** | 微服务是架构模式的具体应用 |

### 技术栈依赖

| 依赖方向 | 说明 |
|---------|------|
| **00-language-core** → **所有模块** | TypeScript 是所有模块的基础 |
| **07-testing** → **所有功能模块** | 测试是质量保证的基础 |
| **22-deployment-devops** → **生产模块** | 部署知识用于上线应用 |

---

## 📖 快速导航

### 按难度分类

**入门级 (⭐)**

- 00-language-core
- 01-ecmascript-evolution
- 07-testing
- 10-js-ts-comparison

**中级 (⭐⭐⭐)**

- 02-design-patterns
- 03-concurrency
- 04-data-structures
- 06-architecture-patterns
- 18-frontend-frameworks
- 19-backend-development

**高级 (⭐⭐⭐⭐⭐)**

- 25-microservices
- 50-browser-runtime
- 70-distributed-systems
- 71-consensus-algorithms
- 77-quantum-computing

### 按热门技术分类

**云原生**

- 22-deployment-devops
- 25-microservices
- 72-container-orchestration
- 73-service-mesh-advanced

**人工智能**

- 33-ai-integration
- 55-ai-testing
- 56-code-generation
- 76-ml-engineering
- 82-edge-ai

**Web 技术**

- 18-frontend-frameworks
- 32-edge-computing
- 36-web-assembly
- 37-pwa
- 50-browser-runtime

---

## 📝 更新日志

| 日期 | 更新内容 |
|------|----------|
| 2026-04-17 | 新增 ECMAScript 2025/2026、JS/TS 语义对比、共识算法、形式化验证模块的交叉引用 |
| 2026-04-04 | 创建初始交叉引用文档，包含模块关系图、依赖矩阵和学习路径 |

---

**使用说明**：

1. 根据你的学习目标选择合适的学习路径
2. 查看模块的前置依赖，确保基础知识完备
3. 参考相关模块扩展学习视野
4. 定期检查本文档获取最新的模块关系信息
