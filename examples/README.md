# 示例项目总览

> `examples/` 目录包含与 JavaScript/TypeScript 全景知识库配套的生产级示例项目，覆盖从初学者到架构师的完整技能谱系。

---

## 📊 项目图谱

```
examples/
├── 🌱 初学者 (Beginner)
│   ├── beginner-todo-master/          # 渐进式 Todo 应用（6 个里程碑）
│   └── design-patterns-ts/            # 5 种常用设计模式 TypeScript 实现
│
├── ⚙️ 进阶 (Intermediate)
│   ├── intermediate-microservice-workshop/  # 微服务工作坊（API Gateway + 服务发现 + 事件总线）
│   ├── nodejs-api-security-boilerplate/     # Node.js API 安全加固模板
│   ├── fullstack-tanstack-start/            # TanStack Start 全栈 SSR 示例
│   ├── edge-observability-starter/          # 边缘计算 + 可观测性 Starter
│   ├── edge-ai-inference/                   # Edge Runtime AI 推理
│   ├── desktop-tauri-react/                 # Tauri v2 跨平台桌面应用
│   ├── mobile-react-native-expo/            # Expo + React Native 移动应用
│   ├── monorepo-fullstack-saas/             # pnpm + Turborepo 全栈 SaaS 模板
│   └── 04-build-tools/                      # Vite 构建工具配置示例
│
└── 🏗️ 高级 (Advanced)
    ├── advanced-compiler-workshop/          # Mini TypeScript 编译器实现
    └── ai-agent-production/               # 多 Agent 协作生产级系统
```

---

## 🌱 初学者项目

### beginner-todo-master

- **难度**: ⭐⭐ - ⭐⭐⭐
- **预计用时**: 10-16 小时
- **技术栈**: Vanilla JS → TypeScript → React 19 → Vitest → Vite
- **关联 code-lab**: `00-language-core`, `02-design-patterns`, `07-testing`, `18-frontend-frameworks`, `10-js-ts-comparison`
- **关联理论**: [语言核心基础](../JSTS全景综述/01_language_core.md), [设计模式入门](../JSTS全景综述/03_design_patterns.md)
- **学习路径**: [初学者路径](../docs/learning-paths/beginners-path.md)
- **里程碑**: 6 个（原生 JS → TS → React → 状态管理 → 测试 → 部署）
- **能力验证**: 完成 Milestone 3 可作为初学者路径 Checkpoint 4 的通过标准
- [查看详情](./beginner-todo-master/README.md)

### design-patterns-ts

- **难度**: ⭐⭐
- **预计用时**: 2-4 小时
- **技术栈**: TypeScript
- **关联 code-lab**: `02-design-patterns`
- **关联理论**: [设计模式入门](../JSTS全景综述/03_design_patterns.md)
- **能力验证**: 理解并运行 5 种设计模式示例（工厂/策略/观察者/装饰器/代理）
- [查看详情](./design-patterns-ts/README.md)

---

## ⚙️ 进阶项目

### intermediate-microservice-workshop

- **难度**: ⭐⭐⭐⭐ - ⭐⭐⭐⭐⭐
- **预计用时**: 7-10 天
- **技术栈**: Fastify, Redis, NATS, PostgreSQL, OpenTelemetry, Jaeger
- **关联 code-lab**: `03-concurrency`, `06-architecture-patterns`, `20-database-orm`, `25-microservices`, `26-event-sourcing`, `30-real-time-communication`
- **关联理论**: [并发编程](../JSTS全景综述/04_concurrency.md), [微服务与事件溯源](../JSTS全景综述/07_architecture.md)
- **学习路径**: [进阶路径](../docs/learning-paths/intermediate-path.md) 阶段 4 / [架构师路径](../docs/learning-paths/advanced-path.md) 阶段 2
- **里程碑**: 4 个（API Gateway → 服务发现 → 事件总线 → 分布式追踪）
- **能力验证**: 可作为架构师路径 Checkpoint 2 的实践挑战
- [查看详情](./intermediate-microservice-workshop/README.md)

### nodejs-api-security-boilerplate

- **难度**: ⭐⭐⭐⭐
- **预计用时**: 3-5 天
- **技术栈**: Fastify, TypeScript, Zod, JWT, WebAuthn/Passkeys, pino, Prometheus
- **关联 code-lab**: `19-backend-development`, `21-api-security`, `38-web-security`, `81-cybersecurity`
- **关联理论**: [API 安全与认证](../JSTS全景综述/05_distributed_systems.md)
- **学习路径**: [进阶路径](../docs/learning-paths/intermediate-path.md) 阶段 4
- **能力验证**: 可作为进阶路径 Checkpoint 4 的实践挑战参考
- [查看详情](./nodejs-api-security-boilerplate/README.md)

### fullstack-tanstack-start

- **难度**: ⭐⭐⭐
- **预计用时**: 1-2 天
- **技术栈**: TanStack Start, Vinxi, React, TypeScript
- **关联 code-lab**: `18-frontend-frameworks`, `32-edge-computing`
- **关联理论**: [前端框架解析](../JSTS全景综述/ecmascript-features/)
- **学习路径**: [初学者路径](../docs/learning-paths/beginners-path.md) 阶段 4 扩展
- [查看详情](./fullstack-tanstack-start/README.md)

### edge-observability-starter

- **难度**: ⭐⭐⭐⭐
- **预计用时**: 2-3 天
- **技术栈**: Hono, Cloudflare Workers, Sentry, pino, OpenTelemetry, JWT
- **关联 code-lab**: `32-edge-computing`, `21-api-security`, `39-performance-monitoring`
- **关联理论**: [边缘优先架构设计方法论](../JSTS全景综述/边缘优先架构设计方法论.md)
- **学习路径**: [进阶路径](../docs/learning-paths/intermediate-path.md)
- [查看详情](./edge-observability-starter/README.md)

### edge-ai-inference

- **难度**: ⭐⭐⭐⭐
- **预计用时**: 2-3 天
- **技术栈**: Cloudflare Workers, ONNX/GGML, Web Streams
- **关联 code-lab**: `32-edge-computing`, `33-ai-integration`, `90-web-apis-lab`
- **关联理论**: [边缘优先架构设计方法论](../JSTS全景综述/边缘优先架构设计方法论.md)
- **学习路径**: [架构师路径](../docs/learning-paths/advanced-path.md) 阶段 4（前沿技术）
- [查看详情](./edge-ai-inference/README.md)

### desktop-tauri-react

- **难度**: ⭐⭐⭐
- **预计用时**: 2-3 天
- **技术栈**: Tauri v2, React 19, TypeScript, Tailwind CSS v4, Rust
- **关联 code-lab**: `00-language-core`, `02-design-patterns`, `18-frontend-frameworks`
- **关联理论**: [JS/TS 现代运行时深度分析](../JSTS全景综述/JS_TS_现代运行时深度分析.md)
- **里程碑**: 5 个（Tauri 架构 → UI 搭建 → Rust 后端 → 前后端通信 → 打包分发）
- [查看详情](./desktop-tauri-react/README.md)

### mobile-react-native-expo

- **难度**: ⭐⭐⭐
- **预计用时**: 3-5 天
- **技术栈**: Expo SDK 52, React Native 0.76, NativeWind, Zustand, TanStack Query
- **关联 code-lab**: `00-language-core`, `02-design-patterns`, `18-frontend-frameworks`
- **关联理论**: [移动开发全景指南](../docs/categories/16-mobile-development.md)
- **里程碑**: 6 个（详见项目 docs/MILESTONES.md）
- [查看详情](./mobile-react-native-expo/README.md)

### monorepo-fullstack-saas

- **难度**: ⭐⭐⭐⭐
- **预计用时**: 5-7 天
- **技术栈**: pnpm, Turborepo, Next.js 15, NestJS, Prisma, PostgreSQL, Redis, shadcn/ui
- **关联 code-lab**: `12-package-management`, `23-toolchain-configuration`
- **关联理论**: [Monorepo 架构设计](../JSTS全景综述/Monorepo_架构设计与边界划分.md)
- [查看详情](./monorepo-fullstack-saas/README.md)

### 04-build-tools

- **难度**: ⭐⭐
- **预计用时**: 1-2 小时
- **技术栈**: Vite, TypeScript
- **关联 code-lab**: `12-package-management`, `23-toolchain-configuration`
- **关联理论**: [构建工具生态](../docs/categories/03-build-tools.md)
- [查看详情](./04-build-tools/README.md)

---

## 🏗️ 高级项目

### advanced-compiler-workshop

- **难度**: ⭐⭐⭐⭐⭐
- **预计用时**: 14-21 天
- **技术栈**: TypeScript（递归下降解析器、类型检查器）
- **关联 code-lab**: `01-ecmascript-evolution`, `40-type-theory-formal`, `78-metaprogramming`, `79-compiler-design`
- **关联理论**: [ECMAScript 规范与演进](../JSTS全景综述/01_language_core.md)
- **学习路径**: [架构师路径](../docs/learning-paths/advanced-path.md) 阶段 4（前沿技术）
- **里程碑**: 5 个（词法/语法分析 → 类型检查 → 泛型推断 → 条件类型 → 类型体操）
- **能力验证**: 可作为项目制认证 [Compiler Toy](../docs/learning-paths/project-based-certification.md#项目-1-compiler-toy编译器玩具) 的参考实现
- [查看详情](./advanced-compiler-workshop/README.md)

### ai-agent-production

- **难度**: ⭐⭐⭐⭐⭐
- **预计用时**: 10-14 天
- **技术栈**: Mastra, Vercel AI SDK v6, MCP, better-auth, Hono, Drizzle ORM
- **关联 code-lab**: `33-ai-integration`, `21-api-security`, `31-serverless`, `94-ai-agent-lab`
- **关联理论**: [AI Agent 基础设施](../docs/categories/28-ai-agent-infrastructure.md)
- **学习路径**: [架构师路径](../docs/learning-paths/advanced-path.md) 阶段 4（前沿技术）
- **里程碑**: 5 个（Mastra 基础 → MCP 协议 → 多 Agent 工作流 → 认证授权 → 边缘部署）
- **能力验证**: 可作为架构师路径 Checkpoint 4（选项 A）的实践挑战
- [查看详情](./ai-agent-production/README.md)

---

## 🔗 关联导航

| 资源 | 链接 | 说明 |
|------|------|------|
| 代码实验室 | `../jsts-code-lab/` | 按主题组织的代码示例与练习 |
| 初学者学习路径 | `../docs/learning-paths/beginners-path.md` | 4 阶段初学者路线 |
| 进阶学习路径 | `../docs/learning-paths/intermediate-path.md` | 4 阶段进阶路线 |
| 架构师学习路径 | `../docs/learning-paths/advanced-path.md` | 5 阶段架构师路线 |
| 能力验证总览 | `../docs/learning-paths/CHECKPOINTS.md` | 所有路径的 Checkpoint 节点索引 |
| 项目制认证 | `../docs/learning-paths/project-based-certification.md` | 以项目成果验证能力的认证体系 |

---

*最后更新: 2026-04-27*
