# JavaScript/TypeScript 全景知识库 - 完整文档索引

> **版本**: v1.8.0 | **最后更新**: 2026-05-07 | **维护状态**: 活跃维护

---

## 🆕 四维分类体系

> 本项目现已按 **语言核心 / 框架生态 / 应用领域 / 技术基础设施** 四大维度重组。
>
> 👉 [查看四维分类总索引](30-knowledge-base/30.9-learning-paths/FOUR_DIMENSIONS_PATHS.md) — 推荐从此入口开始探索

| 维度 | 索引 | 核心内容 |
|------|------|---------|
| 🔵 **语言核心** | [language-core-index.md](30-knowledge-base/language-core-index.md) | 类型系统、执行模型、ES2026、模块系统 |
| 🟢 **框架生态** | [frameworks-index.md](30-knowledge-base/frameworks-index.md) | React/Vue/Angular、Next.js/Nuxt、状态管理 |
| 🟠 **应用领域** | [application-domains-index.md](30-knowledge-base/application-domains-index.md) | AI Agent、Web3、移动端、边缘计算 |
| 🔴 **技术基础设施** | [infrastructure-index.md](30-knowledge-base/infrastructure-index.md) | 构建工具、测试、部署、可观测性、安全 |

---

## 文档全景图

本知识库包含五大核心组成部分：

1. **70-theoretical-foundations** - 理论基础层 (83篇深度文档，~850,000字，每篇≥8000字+≥6可运行TS示例，范畴论·认知科学·多模型分析·Web平台机制·边缘运行时)
2. **awesome-jsts-ecosystem** - 生态工具导航
3. **jsts-code-lab** - 代码实验室 (96个技术模块)
4. **jsts-language-core-system** - 语言核心系统 (52个深度文档，>5000字节/篇)
5. **docs/** - 分类文档与学习路径（已按四维重组）

---

## 1. 语言核心 (Language Core)

### 1.1 类型系统

| 文档 | 路径 | 描述 | 复杂度 |
|------|------|------|--------|
| **语言核心系统** | **./jsts-language-core-system/** | **类型系统/变量系统/控制流/执行模型/执行流/规范基础 (52篇深度文档)** | **3-5星** |
| 语言核心代码实验 | ./jsts-code-lab/00-language-core/ | TypeScript 类型系统完整实现 | 2星 |
| JS/TS 对比分析 | ./jsts-code-lab/10-js-ts-comparison/ | JavaScript 与 TypeScript 深度对比 | 2星 |
| 元编程 | ./jsts-code-lab/78-metaprogramming/ | 装饰器、反射、代理模式 | 4星 |

### 1.2 ECMAScript 演进

| 文档 | 路径 | 描述 | 复杂度 |
|------|------|------|--------|
| ECMAScript 演进史 | ./jsts-code-lab/01-ecmascript-evolution/ | ES6+ 新特性代码实现 | 2星 |
| ES2025 Atomics.pause | ./jsts-code-lab/01-ecmascript-evolution/es2025-preview/atomics-pause.ts | SharedArrayBuffer 自旋锁与性能优化 | 4星 |
| 执行流分析 | ./jsts-code-lab/14-execution-flow/ | 事件循环、调用栈、执行上下文 | 3星 |

### 1.3 数据结构

| 文档 | 路径 | 描述 | 复杂度 |
|------|------|------|--------|
| 数据结构实现 | ./jsts-code-lab/04-data-structures/ | 链表、树、图、哈希表等 | 3星 |
| 数据结构理论 | ./jsts-code-lab/04-data-structures/THEORY.md | 时间/空间复杂度与形式化推导 | 4星 |
| 算法实现 | ./jsts-code-lab/05-algorithms/ | 排序、搜索、动态规划等 | 3星 |
| 算法理论 | ./jsts-code-lab/05-algorithms/THEORY.md | 复杂度证明、主定理与循环不变式 | 4星 |

---

## 2. 运行时 (Runtime)

### 2.1 浏览器运行时

| 文档 | 路径 | 描述 | 复杂度 |
|------|------|------|--------|
| 浏览器运行时理论 | ./jsts-code-lab/50-browser-runtime/THEORY.md | V8引擎、渲染管线、内存管理 | 3星 |
| Web 渲染优化 | ./jsts-code-lab/52-web-rendering/ | 重绘、回流、合成优化 | 3星 |
| 前端框架对比 | 30-knowledge-base/categories/01-frontend-frameworks.md | React/Vue/Angular/Svelte 对比 | 2星 |
| Web APIs 完全指南 | 30-knowledge-base/guides/web-apis-guide.md | DOM/Fetch/Streams/Canvas/Service Worker 等系统梳理 | 2星 |
| Node.js 核心模块指南 | 30-knowledge-base/guides/nodejs-core-modules-guide.md | fs/http/crypto/stream/events 等内置模块详解 | 2星 |
| Web APIs 实战实验室 | ./jsts-code-lab/90-web-apis-lab/ | Fetch/Streams/Service Worker/Observer 可运行代码 | 3星 |
| Node.js 核心模块实验室 | ./jsts-code-lab/91-nodejs-core-lab/ | fs/http/crypto/stream 核心模块可运行代码 | 3星 |

### 2.2 并发模型

| 文档 | 路径 | 描述 | 复杂度 |
|------|------|------|--------|
| 并发架构文档 | ./jsts-code-lab/03-concurrency/ARCHITECTURE.md | 事件循环、内存模型、并发控制 | 3星 |
| 异步模式实现 | ./jsts-code-lab/03-concurrency/ | Promise、Async/Await、Worker | 3星 |
| 数据流管理 | ./jsts-code-lab/15-data-flow/ | RxJS、Observable、响应式编程 | 3星 |

### 2.3 工具链

| 文档 | 路径 | 描述 | 复杂度 |
|------|------|------|--------|
| 构建工具对比 | 30-knowledge-base/categories/03-build-tools.md | Vite/Webpack/esbuild/Rollup | 2星 |
| 代码规范工具 | 30-knowledge-base/categories/14-linting-formatting.md | ESLint/Prettier/Biome | 1星 |
| 包管理 | ./jsts-code-lab/12-package-management/ | npm/yarn/pnpm/bun | 2星 |

---

## 3. 架构 (Architecture)

### 3.1 设计模式

| 文档 | 路径 | 描述 | 复杂度 |
|------|------|------|--------|
| 设计模式理论 | ./jsts-code-lab/02-design-patterns/THEORY.md | GoF 23种设计模式 + SOLID 原则 | 3星 |
| 设计模式实现 | ./jsts-code-lab/02-design-patterns/ | TypeScript 实现可运行代码 | 3星 |

### 3.2 架构模式

| 文档 | 路径 | 描述 | 复杂度 |
|------|------|------|--------|
| 架构模式分析 | ./jsts-code-lab/06-architecture-patterns/ARCHITECTURE.md | 分层、六边形、CQRS、事件溯源 | 4星 |
| 架构模式实现 | ./jsts-code-lab/06-architecture-patterns/ | 企业级架构代码示例 | 4星 |
| 微服务 | ./jsts-code-lab/25-microservices/ | 服务拆分、通信、治理 | 5星 |

### 3.3 分布式系统

| 文档 | 路径 | 描述 | 复杂度 |
|------|------|------|--------|
| 分布式系统理论 | ./jsts-code-lab/70-distributed-systems/THEORY.md | CAP定理、一致性模型、分区容错 | 5星 |
| 分布式系统实现 | ./jsts-code-lab/70-distributed-systems/ | 分布式ID、锁、事务 | 5星 |
| 共识算法 | ./jsts-code-lab/71-consensus-algorithms/ | Paxos、Raft、PBFT | 5星 |
| 容器编排 | ./jsts-code-lab/72-container-orchestration/ | Docker、Kubernetes | 4星 |

---

## 4. 工程实践 (Engineering Practices)

### 4.1 测试

| 文档 | 路径 | 描述 | 复杂度 |
|------|------|------|--------|
| 测试基础 | ./jsts-code-lab/07-testing/ | 单元测试、集成测试、TDD | 2星 |
| 高级测试 | ./jsts-code-lab/28-testing-advanced/ | E2E、契约测试、混沌测试 | 3星 |
| AI测试理论 | ./jsts-code-lab/55-ai-testing/THEORY.md | AI驱动测试生成理论 | 4星 |
| 测试工具对比 | 30-knowledge-base/categories/13-testing-ecosystem.md | Jest/Vitest/Playwright | 2星 |
| 测试对比矩阵 | 30-knowledge-base/comparison-matrices/testing-compare.md | 测试框架详细对比 | 2星 |
| JS/TS 编译器对比矩阵 | 30-knowledge-base/comparison-matrices/js-ts-compilers-compare.md | tsc/Babel/SWC/esbuild/Rolldown/tsgo 语义差异 | 3星 |
| 包管理器对比矩阵 | 30-knowledge-base/comparison-matrices/package-managers-compare.md | npm/yarn/pnpm/Bun/Deno 对比 | 2星 |
| Monorepo 工具对比矩阵 | 30-knowledge-base/comparison-matrices/monorepo-tools-compare.md | Turborepo/Nx/Rush/Bit/Bazel 对比 | 2星 |
| 可观测性工具对比矩阵 | 30-knowledge-base/comparison-matrices/observability-tools-compare.md | Sentry/Datadog/winston/pino 监控日志对比 | 2星 |
| 部署平台对比矩阵 | 30-knowledge-base/comparison-matrices/deployment-platforms-compare.md | Vercel/Netlify/Cloudflare/AWS 等部署目标对比 | 2星 |
| CI/CD 工具对比矩阵 | 30-knowledge-base/comparison-matrices/ci-cd-tools-compare.md | GitHub Actions/GitLab CI/Jenkins 等对比 | 2星 |
| 浏览器兼容性矩阵 | 30-knowledge-base/comparison-matrices/browser-compatibility-compare.md | ES2020-ES2025 + Web API 兼容性 + polyfill | 2星 |

### 4.2 安全

| 文档 | 路径 | 描述 | 复杂度 |
|------|------|------|--------|
| API安全 | ./jsts-code-lab/21-api-security/ | OAuth2、JWT、CSRF、XSS防护 | 3星 |
| Web安全 | ./jsts-code-lab/38-web-security/ | CSP、CORS、内容安全策略 | 3星 |
| 网络安全 | ./jsts-code-lab/81-cybersecurity/ | 渗透测试、安全审计 | 4星 |

### 4.3 性能

| 文档 | 路径 | 描述 | 复杂度 |
|------|------|------|--------|
| 性能优化 | ./jsts-code-lab/08-performance/ | 算法优化、内存管理、懒加载 | 3星 |
| 智能性能 | ./jsts-code-lab/54-intelligent-performance/ | AI驱动性能优化 | 4星 |
| 性能监控 | ./jsts-code-lab/39-performance-monitoring/ | RUM、APM、性能指标 | 3星 |
| 基准测试 | ./jsts-code-lab/11-benchmarks/ | 性能测试方法与工具 | 3星 |

### 4.4 部署与运维

| 文档 | 路径 | 描述 | 复杂度 |
|------|------|------|--------|
| DevOps | ./jsts-code-lab/22-deployment-devops/ | CI/CD、GitOps、蓝绿部署 | 3星 |
| TanStack Start Cloudflare 部署 | 30-knowledge-base/guides/TANSTACK_START_CLOUDFLARE_DEPLOYMENT.md | 官方部署指南与边缘实战 | 3星 |
| 可观测性 | ./jsts-code-lab/74-observability/ | 日志、指标、链路追踪 | 3星 |
| 混沌工程 | ./jsts-code-lab/75-chaos-engineering/ | 故障注入、韧性测试 | 4星 |
| Serverless | ./jsts-code-lab/31-serverless/ | FaaS、BaaS、冷启动优化 | 3星 |
| 可观测性实战实验室 | ./jsts-code-lab/92-observability-lab/ | 结构化日志/错误上报/Web Vitals 采集 | 3星 |
| 部署与边缘计算实验室 | ./jsts-code-lab/93-deployment-edge-lab/ | Cloudflare Workers/Vercel Edge/Docker 优化 | 3星 |
| 现代认证实验室 | ./jsts-code-lab/95-auth-modern-lab/ | better-auth / Passkeys / OAuth 2.1 实践 | 3星 |
| 现代 ORM 实验室 | ./jsts-code-lab/96-orm-modern-lab/ | Drizzle ORM / 边缘数据库 / Prisma 迁移 | 3星 |

---

## 5. 前沿技术 (Emerging Technologies)

### 5.1 AI 与机器学习

| 文档 | 路径 | 描述 | 复杂度 |
|------|------|------|--------|
| AI集成 | ./jsts-code-lab/33-ai-integration/ | LLM API集成、Prompt工程 | 3星 |
| AI Agent 实验室 | ./jsts-code-lab/94-ai-agent-lab/ | MCP / Vercel AI SDK / Mastra 工作流编排 | 4星 |
| ML工程 | ./jsts-code-lab/76-ml-engineering/ | TensorFlow.js、模型部署 | 4星 |
| 代码生成 | ./jsts-code-lab/56-code-generation/ | AI辅助编程、代码补全 | 3星 |
| 边缘AI | ./jsts-code-lab/82-edge-ai/ | 端侧推理、模型压缩 | 4星 |
| NLP工程 | ./jsts-code-lab/85-nlp-engineering/ | 自然语言处理应用 | 4星 |

### 5.2 边缘计算

| 文档 | 路径 | 描述 | 复杂度 |
|------|------|------|--------|
| 边缘计算 | ./jsts-code-lab/32-edge-computing/ | CDN Workers、边缘函数 | 3星 |

### 5.3 WebAssembly

| 文档 | 路径 | 描述 | 复杂度 |
|------|------|------|--------|
| WebAssembly | ./jsts-code-lab/36-web-assembly/ | WASM集成、性能优化 | 4星 |
| WebAssembly生态 | 30-knowledge-base/categories/20-webassembly.md | WASM工具与框架 | 3星 |

### 5.4 Web3 与区块链

| 文档 | 路径 | 描述 | 复杂度 |
|------|------|------|--------|
| Web3基础 | ./jsts-code-lab/34-blockchain-web3/ | 智能合约、DApp开发 | 4星 |
| 区块链高级 | ./jsts-code-lab/83-blockchain-advanced/ | 共识机制、跨链协议 | 5星 |

### 5.5 量子计算

| 文档 | 路径 | 描述 | 复杂度 |
|------|------|------|--------|
| 量子计算 | ./jsts-code-lab/77-quantum-computing/ | 量子算法、Q#集成 | 5星 |
| 量子计算理论 | ./jsts-code-lab/77-quantum-computing/THEORY.md | 量子门数学原理与复杂度分析 | 5星 |

---

## 6. 形式化理论 (Formal Theory)

### 6.1 形式化验证

| 文档 | 路径 | 描述 | 复杂度 |
|------|------|------|--------|
| 形式化验证 | ./jsts-code-lab/80-formal-verification/ | TLA+、模型检测、定理证明 | 5星 |

### 6.2 编译器设计

| 文档 | 路径 | 描述 | 复杂度 |
|------|------|------|--------|
| 编译器设计 | ./jsts-code-lab/79-compiler-design/ | AST、解析器、代码生成 | 5星 |

---

## 7. 生态工具导航 (Ecosystem Navigation)

### 7.1 前端生态

| 文档 | 路径 | 描述 |
|------|------|------|
| 前端框架 | 30-knowledge-base/categories/01-frontend-frameworks.md | React/Vue/Angular/Svelte等 |
| TanStack Start | 30-knowledge-base/categories/22-tanstack-start.md | 全栈框架与 Cloudflare 边缘部署 |
| UI组件库 | 30-knowledge-base/categories/02-ui-component-libraries.md | Material-UI/Ant Design/shadcn/ui等 |
| 状态管理 | 30-knowledge-base/categories/05-state-management.md | Redux/Zustand/Pinia等 |
| 路由 | 30-knowledge-base/categories/06-routing.md | React Router/TanStack Router等 |
| 样式方案 | 30-knowledge-base/categories/10-styling.md | Tailwind/Styled Components等 |
| 动画 | 30-knowledge-base/categories/16-animation.md | Framer Motion/GSAP等 |

### 7.2 后端生态

| 文档 | 路径 | 描述 |
|------|------|------|
| 后端框架 | 30-knowledge-base/categories/14-backend-frameworks.md | Express/NestJS/Fastify等 |
| ORM与数据库 | 30-knowledge-base/categories/11-orm-database.md | Prisma/TypeORM/Drizzle等 |
| 表单处理 | 30-knowledge-base/categories/07-form-handling.md | React Hook Form/Formik等 |
| 验证库 | 30-knowledge-base/categories/08-validation.md | Zod/Yup/Joi等 |
| AI Agent 基础设施 | 30-knowledge-base/categories/23-ai-agent-infrastructure.md | MCP / Vercel AI SDK / Mastra 生态 |
| 认证与授权 | 30-knowledge-base/categories/24-auth-modern.md | better-auth / Passkeys / OAuth 2.1 |

### 7.3 对比矩阵

| 文档 | 路径 | 描述 |
|------|------|------|
| 前端框架对比 | 30-knowledge-base/comparison-matrices/frontend-frameworks-compare.md | React/Vue/Svelte/Angular/Solid对比 |
| 后端框架对比 | 30-knowledge-base/comparison-matrices/backend-frameworks-compare.md | Express/Fastify/NestJS/Hono对比 |
| SSR元框架对比 | 30-knowledge-base/comparison-matrices/ssr-metaframeworks-compare.md | Next.js/Nuxt/Remix/Astro对比 |
| 构建工具对比 | 30-knowledge-base/comparison-matrices/build-tools-compare.md | Vite/Webpack/esbuild对比表 |
| JS/TS 编译器对比 | 30-knowledge-base/comparison-matrices/js-ts-compilers-compare.md | tsc/Babel/SWC/esbuild/Rolldown/tsgo 语义差异与选型 |
| ORM对比 | 30-knowledge-base/comparison-matrices/orm-compare.md | ORM选型决策矩阵 |
| 状态管理对比 | 30-knowledge-base/comparison-matrices/state-management-compare.md | 状态管理方案对比 |
| UI库对比 | 30-knowledge-base/comparison-matrices/ui-libraries-compare.md | UI组件库对比 |
| 包管理器对比 | 30-knowledge-base/comparison-matrices/package-managers-compare.md | npm/yarn/pnpm/Bun/Deno 包管理器对比 |
| Monorepo工具对比 | 30-knowledge-base/comparison-matrices/monorepo-tools-compare.md | Turborepo/Nx/Rush/Bit/Bazel 对比 |
| 可观测性工具对比 | 30-knowledge-base/comparison-matrices/observability-tools-compare.md | Sentry/Datadog/winston/pino 监控日志对比 |
| 部署平台对比 | 30-knowledge-base/comparison-matrices/deployment-platforms-compare.md | Vercel/Netlify/Cloudflare/AWS 等部署目标对比 |
| CI/CD工具对比 | 30-knowledge-base/comparison-matrices/ci-cd-tools-compare.md | GitHub Actions/GitLab CI/Jenkins 等对比 |
| 浏览器兼容性矩阵 | 30-knowledge-base/comparison-matrices/browser-compatibility-compare.md | ES2020-ES2025 + Web API 兼容性 + polyfill |

### 7.4 架构与知识图谱

| 文档 | 路径 | 描述 |
|------|------|------|
| 项目知识图谱 | 30-knowledge-base/diagrams/project-knowledge-graph.mmd | 全景知识库结构关系图 |
| JS执行模型 | 30-knowledge-base/diagrams/js-execution-model.mmd | 调用栈、事件循环、内存模型 |
| 事件循环详细 | 30-knowledge-base/diagrams/event-loop-detailed.mmd | 宏任务/微任务/渲染流程 |
| Promise状态机 | 30-knowledge-base/diagrams/promise-state-machine.mmd | Promise生命周期可视化 |
| TypeScript编译器架构 | 30-knowledge-base/diagrams/typescript-compiler-architecture.mmd | TS编译流程 |
| React Fiber架构 | 30-knowledge-base/diagrams/react-fiber-architecture.mmd | React协调机制 |
| 微服务架构模式 | 30-knowledge-base/diagrams/microservices-patterns.mmd | 常见微服务设计模式 |
| JWT认证流程 | 30-knowledge-base/diagrams/jwt-authentication-flow.mmd | Token认证时序图 |
| CI/CD流水线 | 30-knowledge-base/diagrams/ci-cd-pipeline.mmd | 持续集成部署流程 |
| 模块解析流程 | 30-knowledge-base/diagrams/module-resolution-flow.mmd | Node.js模块加载机制 |
| 语言核心知识图谱 | 30-knowledge-base/diagrams/language-core-knowledge-graph.mmd | ES/TS类型系统/运行时/编译/形式化理论关联网络 |
| 生态全景图谱 | 30-knowledge-base/diagrams/ecosystem-landscape-graph.mmd | 前端/后端/工具链/部署/AI 14大领域生态关联图 |
| 工程实践图谱 | 30-knowledge-base/diagrams/engineering-practices-graph.mmd | 设计模式/架构/性能/安全/测试/DevOps 实践网络 |

### 7.5 实战示例项目

| 项目 | 路径 | 描述 |
|------|------|------|
| 全栈 SaaS Monorepo | ./examples/monorepo-fullstack-saas/ | pnpm + Turborepo + Next.js + NestJS + Prisma |
| 边缘可观测性 Starter | ./examples/edge-observability-starter/ | Hono + Sentry + 结构化日志 + JWT 边缘验证 |
| Node.js API 安全 Boilerplate | ./examples/nodejs-api-security-boilerplate/ | Fastify + Helmet + Zod + pino + Passkeys |

---

## 8. 学习路径推荐

### 路径一：初学者入门 (4-6周)

| 阶段 | 模块 | 文档 | 时间 |
|------|------|------|------|
| 1 | TypeScript基础 | 30-knowledge-base/learning-paths/beginners-path.md | 1-2周 |
|   | 语言核心 | ./jsts-code-lab/00-language-core/ |      |
| 2 | 设计模式 | ./jsts-code-lab/02-design-patterns/THEORY.md | 1-2周 |
| 3 | 测试基础 | ./jsts-code-lab/07-testing/ | 1周 |
| 4 | 前端框架 | 30-knowledge-base/categories/01-frontend-frameworks.md | 1周 |

### 路径二：进阶工程师 (6-8周)

| 阶段 | 模块 | 文档 | 时间 |
|------|------|------|------|
| 1 | 架构模式 | 30-knowledge-base/learning-paths/intermediate-path.md | 2周 |
|   | 架构实现 | ./jsts-code-lab/06-architecture-patterns/ | |
| 2 | 并发编程 | ./jsts-code-lab/03-concurrency/ARCHITECTURE.md | 2周 |
| 3 | 性能优化 | ./jsts-code-lab/08-performance/ | 1周 |
| 4 | 后端开发 | ./jsts-code-lab/19-backend-development/ | 2周 |
| 5 | 微服务 | ./jsts-code-lab/25-microservices/ | 1周 |

### 路径三：架构师之路 (8-12周)

| 阶段 | 模块 | 文档 | 时间 |
|------|------|------|------|
| 1 | 分布式系统 | 30-knowledge-base/learning-paths/advanced-path.md | 3周 |
|   | 理论 | ./jsts-code-lab/70-distributed-systems/THEORY.md | |
| 2 | 一致性算法 | ./jsts-code-lab/71-consensus-algorithms/ | 2周 |
| 3 | 容器编排 | ./jsts-code-lab/72-container-orchestration/ | 2周 |
| 4 | 形式化验证 | ./jsts-code-lab/80-formal-verification/ | 2周 |
| 5 | AI集成 | ./jsts-code-lab/33-ai-integration/ | 2周 |

### 路径四：AI 专家 (6-10周)

| 阶段 | 模块 | 文档 | 时间 |
|------|------|------|------|
| 1 | AI集成基础 | ./jsts-code-lab/33-ai-integration/ | 2周 |
| 2 | ML工程 | ./jsts-code-lab/76-ml-engineering/ | 2周 |
| 3 | 智能性能优化 | ./jsts-code-lab/54-intelligent-performance/ | 2周 |
| 4 | AI测试 | ./jsts-code-lab/55-ai-testing/ | 2周 |
| 5 | 边缘AI | ./jsts-code-lab/82-edge-ai/ | 2周 |

### 路径五：安全专家 (6-8周)

| 阶段 | 模块 | 文档 | 时间 |
|------|------|------|------|
| 1 | Web安全基础 | ./jsts-code-lab/38-web-security/ | 2周 |
| 2 | API安全 | ./jsts-code-lab/21-api-security/ | 2周 |
| 3 | 网络安全 | ./jsts-code-lab/81-cybersecurity/ | 2周 |
| 4 | 形式化验证 | ./jsts-code-lab/80-formal-verification/ | 2周 |

---

## 9. 快速查找表

### 9.1 按技术领域查找

| 领域 | 核心文档 | 生态文档 |
|------|----------|----------|
| 前端开发 | ./jsts-code-lab/18-frontend-frameworks/ | 30-knowledge-base/categories/01-frontend-frameworks.md |
| 后端开发 | ./jsts-code-lab/19-backend-development/ | 30-knowledge-base/categories/14-backend-frameworks.md |
| DevOps | ./jsts-code-lab/22-deployment-devops/ | 30-knowledge-base/categories/03-build-tools.md |
| 数据可视化 | ./jsts-code-lab/58-data-visualization/ | 30-knowledge-base/platforms/DATA_VISUALIZATION.md |

### 9.2 按问题类型查找

| 问题类型 | 解决方案文档 |
|----------|--------------|
| 如何选型前端框架？ | 30-knowledge-base/decision-trees.md |
| 如何设计API？ | ./jsts-code-lab/19-backend-development/ |
| 如何优化性能？ | ./jsts-code-lab/08-performance/ |
| 如何保障安全？ | ./jsts-code-lab/38-web-security/ |
| 如何设计分布式系统？ | ./jsts-code-lab/70-distributed-systems/THEORY.md |
| 如何学习TypeScript？ | 30-knowledge-base/learning-paths/beginners-path.md |
| 如何进阶架构师？ | 30-knowledge-base/learning-paths/advanced-path.md |
| 如何选型ORM？ | 30-knowledge-base/comparison-matrices/orm-compare.md |
| 如何选型构建工具？ | 30-knowledge-base/comparison-matrices/build-tools-compare.md |
| 如何选型 JS/TS 编译器/转译器？ | 30-knowledge-base/comparison-matrices/js-ts-compilers-compare.md |
| 如何选型测试框架？ | 30-knowledge-base/comparison-matrices/testing-compare.md |
| 如何选型包管理器？ | 30-knowledge-base/comparison-matrices/package-managers-compare.md |
| 如何选型 Monorepo 工具？ | 30-knowledge-base/comparison-matrices/monorepo-tools-compare.md |
| 如何选型可观测性工具？ | 30-knowledge-base/comparison-matrices/observability-tools-compare.md |
| 如何选型部署平台？ | 30-knowledge-base/comparison-matrices/deployment-platforms-compare.md |
| 如何选型 CI/CD 工具？ | 30-knowledge-base/comparison-matrices/ci-cd-tools-compare.md |
| 浏览器兼容性如何？ | 30-knowledge-base/comparison-matrices/browser-compatibility-compare.md |

### 9.3 按复杂度分级

**1-2星 (入门级)**

- 30-knowledge-base/categories/14-linting-formatting.md - 代码规范工具
- ./jsts-code-lab/00-language-core/ - TypeScript基础
- ./jsts-code-lab/07-testing/ - 测试基础
- 30-knowledge-base/learning-paths/beginners-path.md - 初学者路径

**3星 (中级)**

- ./jsts-code-lab/02-design-patterns/ - 设计模式
- ./jsts-code-lab/03-concurrency/ - 并发编程
- ./jsts-code-lab/18-frontend-frameworks/ - 前端框架
- 30-knowledge-base/learning-paths/intermediate-path.md - 进阶路径

**4星 (高级)**

- ./jsts-code-lab/06-architecture-patterns/ - 架构模式
- ./jsts-code-lab/25-microservices/ - 微服务
- ./jsts-code-lab/33-ai-integration/ - AI集成

**5星 (专家级)**

- ./jsts-code-lab/70-distributed-systems/THEORY.md - 分布式系统理论
- ./jsts-code-lab/71-consensus-algorithms/ - 共识算法
- ./jsts-code-lab/80-formal-verification/ - 形式化验证
- ./jsts-code-lab/77-quantum-computing/ - 量子计算

---

## 10. 文档统计

### 10.1 数量统计

| 类别 | 数量 | 占比 |
|------|------|------|
| jsts-code-lab 模块 | 93 | 48% |
| docs/categories 分类 | 26 | 12% |
| docs/comparison-matrices 对比 | 15 | 6% |
| docs/diagrams 图表 | 21 | 10% |
| docs/learning-paths 路径 | 3 | 2% |
| docs/guides 指南 | 1 | 1% |
| 根目录及辅助文档 | 46 | 22% |
| **总计** | **220+** | **100%** |

### 10.2 代码实验室模块分布

| 层级 | 模块编号 | 数量 |
|------|----------|------|
| 核心层 (00-19) | 00-17 | 18 |
| 基础层 (20-49) | 20-37 | 18 |
| 智能层 (50-69) | 50-69 | 20 |
| 系统层 (70-89) | 70-89 | 21 |
| 其他 | - | 12 |
| **小计** | | **93** |

### 10.3 理论文档清单

| 模块 | 理论文档 | 类型 |
|------|----------|------|
| 02-design-patterns | THEORY.md | 设计原则 |
| 03-concurrency | ARCHITECTURE.md | 并发架构 |
| 06-architecture-patterns | ARCHITECTURE.md | 系统架构 |
| 50-browser-runtime | THEORY.md | 浏览器原理 |
| 55-ai-testing | THEORY.md | AI测试理论 |
| 70-distributed-systems | THEORY.md | 分布式理论 |

---

## 11. 更新日志

### v1.4.0 (2026-04-19)

- **新增 AI Agent 基础设施模块**：94-ai-agent-lab（MCP / Vercel AI SDK / Mastra）
- **新增现代认证实验室**：95-auth-modern-lab（better-auth / Passkeys / OAuth 2.1）
- **新增现代 ORM 实验室**：96-orm-modern-lab（Drizzle ORM / 边缘数据库）
- **新增生态分类**：AI Agent 基础设施、认证与授权
- **技术选型体系扩展**：新增 AI 框架选型、认证方案选型决策树与对比矩阵
- **自动化数据流水线**：`scripts/update-ecosystem-stats.js` + GitHub Actions 月度运行
- **技术雷达模板**：`docs/research/tech-radar-template.md` 引入 ThoughtWorks Tech Radar 格式
- **文档总数**：从 211 增至 220+

### v1.3.0 (2026-04-19)

- **新增 6 大对比矩阵**：包管理器、Monorepo工具、可观测性工具、部署平台、CI/CD工具、浏览器兼容性矩阵
- **决策树体系扩展至 15 个场景**：新增包管理器、Monorepo、部署平台、监控可观测性、CI/CD、Web API技术、认证方案、数据存储 8 大选型决策树
- **新增 3 大知识图谱**（433节点）：语言核心知识图谱、生态全景图谱、工程实践图谱
- **补齐语言核心深度文档**：Web APIs 完全指南（3131行）、Node.js 核心模块指南（2039行）
- **补齐 5 大缺失领域生态盘点**：错误监控与日志、CI/CD与DevOps、Monorepo工具、部署与托管平台、安全与合规
- **VitePress 站点导航同步**：侧边栏新增"语言核心与运行时"、"运维与工程基建"分组，对比矩阵与架构图全部接入
- **完整文档索引更新**：文档总数从 186 增至 211，分类从 21 扩至 26，对比矩阵从 9 扩至 15

### v1.2.0 (2026-04-17)

- **修正 ES2025 标准边界**：`Atomics.pause` 与 `Explicit Resource Management` 调整为 **Stage 3 预览 / 预计 ES2026**，严格对齐 ECMA-262 16th edition
- 更新 `ES2025_COMPLETE_FEATURES.md` 与 `01_language_core.md` 的版本声明
- 补充 ES2025 正式版 7 项缺失代码实现（Iterator Helpers、Set Methods、Promise.try 等）
- 新增 ES2026 Stage 4 前瞻代码模块（Temporal API、Array.fromAsync、Error.isError、Explicit Resource Management）
- 补齐 4 个高实施模块的 THEORY.md（形式化验证、共识算法、类型理论、JS/TS 对比）
- 全面 Mermaid 化 6 个决策树，新增 3 个对比矩阵与项目知识图谱

### v1.1.0 (2026-04-16)

- 新增 TanStack Start + Cloudflare 专题模块 (88-tanstack-start-cloudflare)
- 补充 Atomics.pause 示例与理论文档（后修正为 Stage 3 / 预计 ES2026）
- 新增数据结构与算法 THEORY.md 形式化推导
- 新增量子计算 THEORY.md
- 更新安全报告与依赖漏洞修复
- 补全 23 个核心模块测试文件
- 网站导航接入学习路径

### v1.0.0 (2026-04-08)

- 初始版本发布
- 建立完整的文档索引体系
- 定义五条学习路径
- 创建快速查找表

### 计划更新

- 添加更多 Mermaid 图表
- 完善文档覆盖率统计
- 增加交互式导航

---

## 12. 贡献指南

### 12.1 如何贡献文档

1. **Fork 仓库** - 创建您的仓库副本
2. **创建分支** - git checkout -b add/new-documentation
3. **遵循规范** - 参考 60-meta-content/ci-checks/ 中的规范说明
4. **提交 PR** - 详细说明添加的内容和原因

### 12.2 文档规范

- 所有文档使用 Markdown 格式
- 代码示例需可运行
- 理论文档需有论证过程
- 英文术语首次出现需附中文翻译

### 12.3 相关链接

- [项目贡献指南](./CONTRIBUTING.md)
- [代码实验室贡献指南](CONTRIBUTING.md)
- 文档编写规范（已归档）
- [术语表](./GLOSSARY.md)

---

## 附录：完整文件树

```
JavaScriptTypeScript/
├── README.md                          # 项目总览入口
├── README-EN.md                       # 英文版README
├── COMPLETE_DOCUMENTATION_INDEX.md   # 本文档
├── GLOSSARY.md                        # 术语表
├── CONTRIBUTING.md                    # 贡献指南
├── LICENSE                            # 许可证
├── SECURITY.md                        # 安全政策
│
├── awesome-jsts-ecosystem/            # 生态工具导航
│   ├── README.md
│   ├── CONTRIBUTING.md
│   └── docs/
│       ├── guides/
│       ├── comparison-tables/
│       └── translations/
│
├── docs/                              # 分类文档与对比
│   ├── categories/                    # 21个分类文档
│   │   ├── 01-frontend-frameworks.md
│   │   ├── 02-ui-component-libraries.md
│   │   ├── 03-build-tools.md
│   │   └── ... (共20个)
│   ├── comparison-matrices/           # 6个对比矩阵
│   │   ├── build-tools-compare.md
│   │   ├── orm-compare.md
│   │   └── ... (共5个)
│   ├── learning-paths/                # 3条学习路径
│   │   ├── beginners-path.md
│   │   ├── intermediate-path.md
│   │   └── advanced-path.md
│   ├── research/                      # 研究报告
│   └── templates/                     # 文档模板
│
├── jsts-code-lab/                     # 代码实验室 (91模块)
│   ├── README.md
│   ├── ARCHITECTURE_GUIDE.md          # 架构指南
│   ├── CROSS-REFERENCE.md             # 模块交叉引用
│   ├── DOCUMENTATION_GUIDE.md         # 文档规范
│   ├── CODE_STRUCTURE.md              # 代码结构
│   ├── PROJECT_STATUS.md              # 项目状态
│   └── [00-89]-*/                     # 90个技术模块
│       ├── THEORY.md / ARCHITECTURE.md
│       └── *.ts (实现代码)
│
└── website/                           # 项目网站
    ├── typescript-type-mastery/         # TypeScript 类型系统深度掌握 (13篇+60道类型体操)
    ├── react-nextjs-app-router/         # React + Next.js App Router 深度专题 (16篇)
    ├── server-first-frontend/           # 服务器优先前端范式 (13篇)
    ├── lit-web-components/              # Lit Web Components 跨框架复用 (13篇)
    ├── edge-runtime/                    # Edge Runtime 深度专题 (8篇)
    ├── database-layer/                  # 数据库层与 ORM 深度专题 (8篇)
    ├── ai-native-development/           # AI-Native Development 深度专题 (8篇)
    ├── svelte-signals-stack/            # Svelte 5 Signals 深度专题 (32篇)
    ├── mobile-cross-platform/           # 移动端跨平台开发深度专题 (9篇，含首页)
    └── webassembly/                     # WebAssembly 深度专题 (9篇，含首页)
```

---

> **维护者**: JavaScript/TypeScript 全景知识库团队
> **最后更新**: 2026-05-07
> **版本**: v1.6.0
