# 四维分类总索引

> 本项目按 **语言核心 / 框架生态 / 应用领域 / 技术基础设施** 四大维度组织全部内容。
> 本文档是四维分类体系的单一入口。

---

## 🔵 维度一：语言核心 (Language Core)

> JavaScript/TypeScript 语言本身 — 语法、类型系统、执行模型、规范、模块、对象模型

### 核心索引

- [语言核心总索引](./language-core-index.md) — 完整导航
- [语言核心速查表](./cheatsheets/JS_LANGUAGE_CORE_CHEATSHEET.md)

### 理论文档

| 文档 | 路径 | 描述 |
|------|------|------|
| 语言核心系统 | [../jsts-language-core-system/](../jsts-language-core-system/) | 类型系统/变量系统/控制流/执行模型/规范基础/模块系统/对象模型 (52+ 篇) |
| JSTS 全景综述 | [../30-knowledge-base/30.8-research/tsjs-stack-panorama-2026/](../30-knowledge-base/30.8-research/tsjs-stack-panorama-2026/) | ECMAScript 演进、形式化语义、学术前沿 |

### 代码实践

| 模块 | 路径 | 描述 |
|------|------|------|
| 语言核心实验 | [../jsts-code-lab/00-language-core/](../jsts-code-lab/00-language-core/) | TypeScript 类型系统完整实现 |
| ECMAScript 演进 | [../jsts-code-lab/01-ecmascript-evolution/](../jsts-code-lab/01-ecmascript-evolution/) | ES6+ 新特性代码实现 |
| 设计模式 | [../jsts-code-lab/02-design-patterns/](../jsts-code-lab/02-design-patterns/) | GoF 23 种设计模式 |
| 数据结构 | [../jsts-code-lab/04-data-structures/](../jsts-code-lab/04-data-structures/) | 链表、树、图、哈希表 |
| 算法 | [../jsts-code-lab/05-algorithms/](../jsts-code-lab/05-algorithms/) | 排序、搜索、动态规划 |
| JS/TS 对比 | [../jsts-code-lab/10-js-ts-comparison/](../jsts-code-lab/10-js-ts-comparison/) | 语言差异深度分析 |

### 决策支持

- [语言核心学习路径](../docs/learning-paths/beginner-path.md#week-1-2-javascript-语言核心)

---

## 🟢 维度二：框架生态 (Framework Ecosystem)

> 前端框架、元框架、后端框架、状态管理、UI 组件库

### 核心索引

- [框架生态总索引](./frameworks-index.md) — 完整导航
- [框架速查表](./cheatsheets/FRAMEWORKS_CHEATSHEET.md)

### 分类文档

| 文档 | 路径 | 描述 |
|------|------|------|
| 前端框架对比 | [./categories/01-frontend-frameworks.md](./categories/01-frontend-frameworks.md) | React/Vue/Angular/Svelte/SolidJS 对比 |
| 后端框架对比 | [./categories/02-backend-frameworks.md](./categories/02-backend-frameworks.md) | Express/Fastify/NestJS/Hono 对比 |
| 状态管理 | [./categories/05-state-management.md](./categories/05-state-management.md) | Redux/Zustand/Jotai/Pinia |
| 样式方案 | [./categories/10-styling.md](./categories/10-styling.md) | Tailwind v4/CSS-in-JS/组件库 |

### 代码实践

| 模块 | 路径 | 描述 |
|------|------|------|
| 前端框架 | [../jsts-code-lab/18-frontend-frameworks/](../jsts-code-lab/18-frontend-frameworks/) | React/Vue/Angular 实战 |
| 后端开发 | [../jsts-code-lab/19-backend-development/](../jsts-code-lab/19-backend-development/) | API 设计与服务端开发 |
| 浏览器运行时 | [../jsts-code-lab/50-browser-runtime/](../jsts-code-lab/50-browser-runtime/) | V8/渲染管线/内存管理 |
| UI 组件 | [../jsts-code-lab/51-ui-components/](../jsts-code-lab/51-ui-components/) | 组件设计与实现 |
| Web 渲染 | [../jsts-code-lab/52-web-rendering/](../jsts-code-lab/52-web-rendering/) | SSR/SSG/ Islands |

### 决策支持

- [前端框架对比矩阵](./comparison-matrices/frontend-frameworks-compare.md)
- [框架选型决策树](./decision-trees.md#1-ui库选型决策树)

---

## 🟠 维度三：应用领域 (Application Domains)

> AI/ML、Web3、移动端、桌面端、实时通信、边缘计算、WebXR、低代码

### 核心索引

- [应用域总索引](./application-domains-index.md) — 完整导航
- [应用域选型指南](./guides/application-domain-selection-guide.md)

### 分类文档

| 文档 | 路径 | 描述 |
|------|------|------|
| AI Agent 基础设施 | [./categories/28-ai-agent-infrastructure.md](./categories/28-ai-agent-infrastructure.md) | MCP/A2A/Vercel AI SDK/Mastra |
| 边缘数据库 | [./categories/30-edge-databases.md](./categories/30-edge-databases.md) | Turso/D1/Neon/SQLite Cloud |
| 实时通信 | [./categories/15-realtime-communication.md](./categories/15-realtime-communication.md) | WebSocket/SSE/WebRTC |
| Web3 | [./categories/34-blockchain-web3.md](./categories/34-blockchain-web3.md) | 区块链/Web3 开发 |

### 代码实践

| 模块 | 路径 | 描述 |
|------|------|------|
| AI 集成 | [../jsts-code-lab/33-ai-integration/](../jsts-code-lab/33-ai-integration/) | LLM API 调用与集成 |
| AI Agent 实验室 | [../jsts-code-lab/94-ai-agent-lab/](../jsts-code-lab/94-ai-agent-lab/) | MCP Server / Multi-Agent 工作流 |
| 边缘计算 | [../jsts-code-lab/32-edge-computing/](../jsts-code-lab/32-edge-computing/) | Cloudflare Workers / Vercel Edge |
| WebAssembly | [../jsts-code-lab/36-web-assembly/](../jsts-code-lab/36-web-assembly/) | Wasm Component Model |
| 实时通信 | [../jsts-code-lab/30-real-time-communication/](../jsts-code-lab/30-real-time-communication/) | WebSocket / WebRTC |

### 示例项目

| 项目 | 路径 | 应用领域 |
|------|------|---------|
| AI Agent 生产级示例 | [../examples/ai-agent-production/](../examples/ai-agent-production/) | AI 多 Agent 协作 |
| 桌面 Tauri React | [../examples/desktop-tauri-react/](../examples/desktop-tauri-react/) | 桌面端开发 |
| 边缘 AI 推理 | [../examples/edge-ai-inference/](../examples/edge-ai-inference/) | 边缘 AI |

### 决策支持

- [AI 框架选型决策树](./decision-trees.md#15-ai-框架选型决策树)
- [Edge 数据库选型决策树](./decision-trees.md#18-edge-数据库选型决策树)

---

## 🔴 维度四：技术基础设施 (Technical Infrastructure)

> 构建工具、测试、部署、可观测性、安全、性能、数据库、API 设计、认证

### 核心索引

- [技术基础设施总索引](./infrastructure-index.md) — 完整导航
- [基础设施决策矩阵](./comparison-matrices/infrastructure-stack-decision-matrix.md)

### 分类文档

| 文档 | 路径 | 描述 |
|------|------|------|
| 构建工具 | [./categories/03-build-tools.md](./categories/03-build-tools.md) | Vite/Webpack/esbuild/Rolldown/Oxc |
| 测试 | [./categories/12-testing.md](./categories/12-testing.md) | Vitest/Jest/Playwright/Cypress |
| 部署平台 | [./categories/09-deployment-platforms.md](./categories/09-deployment-platforms.md) | Vercel/Cloudflare/AWS/Fly.io |
| 可观测性 | [./categories/23-error-monitoring-logging.md](./categories/23-error-monitoring-logging.md) | Sentry/Datadog/OpenTelemetry |
| 数据库与 ORM | [./categories/11-orm-database.md](./categories/11-orm-database.md) | Prisma/Drizzle/Turso/Neon |
| 认证方案 | [./categories/29-authentication.md](./categories/29-authentication.md) | better-auth/Auth.js/Passkeys |

### 代码实践

| 模块 | 路径 | 描述 |
|------|------|------|
| 包管理 | [../jsts-code-lab/12-package-management/](../jsts-code-lab/12-package-management/) | npm/pnpm/Bun workspaces |
| 工具链配置 | [../jsts-code-lab/23-toolchain-configuration/](../jsts-code-lab/23-toolchain-configuration/) | ESLint/Prettier/Biome/Vite |
| 测试 | [../jsts-code-lab/07-testing/](../jsts-code-lab/07-testing/) | 单元测试/E2E/性能测试 |
| API 安全 | [../jsts-code-lab/21-api-security/](../jsts-code-lab/21-api-security/) | 认证/授权/安全最佳实践 |
| 性能优化 | [../jsts-code-lab/08-performance/](../jsts-code-lab/08-performance/) | 前端/后端/数据库优化 |
| 可观测性 | [../jsts-code-lab/74-observability/](../jsts-code-lab/74-observability/) | 日志/监控/追踪 |
| 现代认证 | [../jsts-code-lab/95-auth-modern-lab/](../jsts-code-lab/95-auth-modern-lab/) | Passkeys/WebAuthn/OAuth 2.1 |

### 决策支持

- [构建工具对比矩阵](./comparison-matrices/build-tools-compare.md)
- [测试框架对比矩阵](./comparison-matrices/testing-frameworks-compare.md)
- [部署平台选型决策树](./decision-trees.md#9-部署平台选型决策树)
- [Type Stripping 策略决策树](./decision-trees.md#17-type-stripping-策略决策树)

---

## 🌐 跨维度导航

- [跨维度引用索引](./cross-dimensional-reference.md) — 当技术横跨多个维度时导航
- [学习路径总览](./learning-paths/) — 按能力层级组织的学习路线

---

> 💡 **使用建议**：
>
> - 想深入语言机制 → 从 **🔵 语言核心** 开始
> - 想选型框架 → 从 **🟢 框架生态** 开始
> - 想解决具体业务场景 → 从 **🟠 应用领域** 开始
> - 想搭建工程体系 → 从 **🔴 技术基础设施** 开始

*最后更新: 2026-04-27*
*review-cycle: 3 months*
*status: current*
