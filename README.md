# Awesome JavaScript/TypeScript Ecosystem [![Awesome](https://awesome.re/badge.svg)](https://awesome.re)

<p align="center">
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/javascript/javascript-original.svg" width="60" alt="JavaScript" />
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/typescript/typescript-original.svg" width="60" alt="TypeScript" />
</p>

<p align="center">
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white" alt="Node.js" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License: MIT" /></a>
  <a href="CONTRIBUTING.md"><img src="https://img.shields.io/badge/Contributions-Welcome-brightgreen.svg" alt="Contributions Welcome" /></a>
</p>

> 🚀 精心策划的 JavaScript/TypeScript 生态系统资源列表，涵盖框架、工具、库和最佳实践。
>
> 📚 配套代码实验室：[jsts-code-lab](./jsts-code-lab/) - 90+ 模块，从理论到实践的完整实现
>
> 📊 技术选型体系：15 个对比矩阵（含包管理器/Monorepo/可观测性/部署平台/CI/CD/浏览器兼容性）、14 大选型决策树、21 个 Mermaid 知识图谱（含 3 个大型知识图谱）
>
> 🎓 旗舰文档：[JS_TS_语言语义模型全面分析](./JSTS全景综述/JS_TS_语言语义模型全面分析.md) - 基于 ECMA-2025/2026、TypeScript 5.8–7.0，对齐 Stanford/MIT/CMU/Berkeley/UW 学术课程
>
> 🏷️ **项目状态**: v4.0 里程碑 | 持续演进中

---

## 📖 文档导航

### 🗺️ 项目整体架构

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    JavaScript/TypeScript 全景知识库                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────┐  │
│  │ awesome-jsts-       │    │   jsts-code-lab     │    │   学习路径文档   │  │
│  │   ecosystem         │    │  (代码实验室)        │    │   (Learning     │  │
│  │                     │    │                     │    │     Paths)      │  │
│  │ • 生态工具导航       │    │ • 90+ 技术模块       │    │                 │  │
│  │ • 框架对比           │    │ • 280+ TS 实现      │    │ • 初学者路径     │  │
│  │ • 最佳实践           │    │ • 理论+实践结合      │    │ • 进阶路径       │  │
│  │ • 资源收录           │    │ • 可运行示例         │    │ • 架构师路径     │  │
│  └─────────────────────┘    └─────────────────────┘    └─────────────────┘  │
│           │                          │                      │               │
│           └──────────────────────────┼──────────────────────┘               │
│                                      │                                      │
│                                      ▼                                      │
│                           ┌─────────────────────┐                           │
│                           │    GLOSSARY.md      │                           │
│                           │    (术语表)          │                           │
│                           └─────────────────────┘                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 📂 快速链接

| 文档 | 描述 | 目标读者 |
|------|------|----------|
| [📦 awesome-jsts-ecosystem](./awesome-jsts-ecosystem/) | JS/TS 生态工具导航 | 所有开发者 |
| [🧪 jsts-code-lab](./jsts-code-lab/) | 代码实验室（90+ 模块） | 实践学习者 |
| [📚 jsts-code-lab/CROSS-REFERENCE.md](./jsts-code-lab/CROSS-REFERENCE.md) | 模块交叉引用索引 | 系统学习者 |
| [📖 GLOSSARY.md](./GLOSSARY.md) | 专业术语表（中英对照） | 所有读者 |
| [🎓 beginners-path.md](./docs/learning-paths/beginners-path.md) | 初学者学习路径 | 初学者 |
| [📈 intermediate-path.md](./docs/learning-paths/intermediate-path.md) | 进阶学习路径 | 中级开发者 |
| [🎯 advanced-path.md](./docs/learning-paths/advanced-path.md) | 架构师学习路径 | 高级开发者 |
| [📊 comparison-matrices](./docs/comparison-matrices/) | 15 个框架/工具对比矩阵 | 技术选型者 |
| [🌳 技术选型决策树](./docs/decision-trees.md) | 14 大选型场景的决策树 | 技术选型者 |
| [🗺️ diagrams](./docs/diagrams/) | 21 个 Mermaid 图表与知识图谱 | 可视化学习者 |
| [🌐 web-apis-guide.md](./docs/guides/web-apis-guide.md) | Web APIs 完全指南 | 全栈开发者 |
| [🟢 nodejs-core-modules-guide.md](./docs/guides/nodejs-core-modules-guide.md) | Node.js 核心模块指南 | 后端开发者 |
| [🏗️ categories.md](./docs/categories.md) | 运维与工程基建分类 | 运维工程师 |
| [🤖 AI Agent 基础设施](./docs/categories/23-ai-agent-infrastructure.md) | MCP / Vercel AI SDK / Mastra 生态导航 | AI 开发者 |
| [🔐 RSC 安全指南](./docs/guides/rsc-security-guide.md) | React Server Components 安全最佳实践 | 全栈开发者 |
| [📘 TS 7.0 迁移指南](./docs/guides/typescript-7-migration-guide.md) | TypeScript 7.0 Go 编译器迁移策略 | TS 开发者 |
| [🔑 better-auth 专题](./docs/guides/better-auth-guide.md) | 现代认证方案 better-auth 完整实践 | 后端开发者 |
| [🤝 CONTRIBUTING.md](./CONTRIBUTING.md) | 贡献指南 | 贡献者 |

---

## 📈 项目规模概览

| 指标 | 数量 | 说明 |
|------|------|------|
| 文档总数 | 220+ | 涵盖指南、对比矩阵、决策树、知识图谱 |
| 分类文档 | 27 | 按技术领域系统分类 |
| 对比矩阵 | 15 | 多维度工具/框架横向对比 |
| 代码模块 | 90+ | jsts-code-lab 可运行示例 |
| Mermaid 图表 | 21 | 含 3 个大型知识图谱 |
| 决策树场景 | 14 | 交互式技术选型流程 |
| AI Agent 模块 | 5+ | MCP / Vercel AI SDK / Mastra 集成 |
| 现代认证模块 | 3+ | better-auth / Passkeys / OAuth 2.1 |

---

## 📊 技术选型体系

本项目提供完整的技术选型支持体系，帮助开发者做出明智的技术决策：

| 资源类型 | 数量 | 说明 |
|----------|------|------|
| 对比矩阵 | 15 个 | 多维度工具/框架横向对比 |
| 决策树 | 14 个场景 | 交互式选型流程图 |
| 知识图谱 | 21 个图表 | 3 个大型知识图谱 + 18 个专题流程图 |

### 对比矩阵清单

| 矩阵文档 | 对比范围 |
|----------|----------|
| [前端框架对比](./docs/comparison-matrices/frontend-frameworks-compare.md) | React / Vue / Svelte / Solid / Angular |
| [后端框架对比](./docs/comparison-matrices/backend-frameworks-compare.md) | Express / Fastify / NestJS / Koa / Hono / Elysia |
| [全栈元框架对比](./docs/comparison-matrices/ssr-metaframeworks-compare.md) | Next.js / Nuxt / SvelteKit / Remix / Astro |
| [构建工具对比](./docs/comparison-matrices/build-tools-compare.md) | Vite / esbuild / swc / Turbopack / Rollup |
| [JS/TS 编译器对比](./docs/comparison-matrices/js-ts-compilers-compare.md) | tsc / swc / esbuild / Babel |
| [UI 组件库对比](./docs/comparison-matrices/ui-libraries-compare.md) | Ant Design / MUI / shadcn/ui / Chakra UI 等 |
| [状态管理对比](./docs/comparison-matrices/state-management-compare.md) | Redux / Zustand / Jotai / Pinia 等 |
| [测试框架对比](./docs/comparison-matrices/testing-compare.md) | Jest / Vitest / Playwright / Cypress |
| [ORM 对比](./docs/comparison-matrices/orm-compare.md) | Prisma / TypeORM / Drizzle / Sequelize |
| [包管理器对比](./docs/comparison-matrices/package-managers-compare.md) | npm / Yarn / pnpm / Bun / Deno |
| [Monorepo 工具对比](./docs/comparison-matrices/monorepo-tools-compare.md) | Nx / Turborepo / Rush / pnpm workspaces |
| [可观测性工具对比](./docs/comparison-matrices/observability-tools-compare.md) | Sentry / Datadog / Grafana / Prometheus |
| [部署平台对比](./docs/comparison-matrices/deployment-platforms-compare.md) | Vercel / Netlify / AWS / Fly.io / Railway |
| [CI/CD 工具对比](./docs/comparison-matrices/ci-cd-tools-compare.md) | GitHub Actions / GitLab CI / CircleCI / Jenkins |
| [浏览器兼容性对比](./docs/comparison-matrices/browser-compatibility-compare.md) | 现代浏览器特性支持矩阵 |
| [AI 框架选型](./docs/decision-trees.md) | Vercel AI SDK / LangChain / Mastra / MCP 对比 |
| [认证方案选型](./docs/decision-trees.md) | better-auth / NextAuth / Passkeys / OAuth 2.1 对比 |

### 决策树清单

| 决策树文档 | 覆盖场景 |
|----------|----------|
| [UI 库选型](./docs/decision-trees.md) | React/Vue 组件库选择 |
| [状态管理选型](./docs/decision-trees.md) | 全局/服务端/原子化状态 |
| [构建工具选型](./docs/decision-trees.md) | 编译器/打包器选择 |
| [ORM 选型](./docs/decision-trees.md) | SQL/NoSQL/Edge 数据库 |
| [测试策略选型](./docs/decision-trees.md) | 单元/集成/E2E 测试框架 |
| [部署平台选型](./docs/decision-trees.md) | 静态/Serverless/容器化 |
| [包管理器选型](./docs/decision-trees.md) | npm/pnpm/Yarn/Bun/Deno |
| [Monorepo 选型](./docs/decision-trees.md) | 工具链与 Workspace 方案 |
| [全栈框架选型](./docs/decision-trees.md) | SSR/SSG/边缘渲染框架 |
| [实时通信选型](./docs/decision-trees.md) | WebSocket/Socket.io/PartyKit |
| [认证方案选型](./docs/decision-trees.md) | OAuth/JWT/SSO/无密码 |
| [CSS 方案选型](./docs/decision-trees.md) | Tailwind/CSS-in-JS/原子化 |
| [运行时选型](./docs/decision-trees.md) | Node.js/Deno/Bun |
| [CI/CD 选型](./docs/decision-trees.md) | GitHub Actions/GitLab CI 等 |
| [AI 框架选型](./docs/decision-trees.md) | LLM SDK / Agent 框架 / MCP 工具选择 |
| [认证方案选型](./docs/decision-trees.md) | 现代认证方案（better-auth / Passkeys / OAuth 2.1） |

---

## 🌟 收录标准

本项目收录的资源需满足以下条件：

- ⭐ **GitHub Stars > 1000**（特殊优秀项目除外；对爆发性新技术如 MCP，Stars 门槛可适度放宽至 300+）
- 🔄 **活跃维护**：最近 6 个月内有更新
- 📘 **TypeScript 支持**：原生支持或提供类型定义
- ✅ **生产就绪**：有实际生产环境使用案例

[查看完整收录标准](./CONTRIBUTING.md#收录标准)

---

## ⚡ 快速开始

### 方式一：浏览生态工具

查看 [awesome-jsts-ecosystem](./awesome-jsts-ecosystem/) 目录，获取精选的框架、工具和库。

### 方式二：动手实践

```bash
# 1. 进入代码实验室
cd jsts-code-lab

# 2. 安装依赖
pnpm install

# 3. 运行指定模块的 Demo
pnpm tsx run-demos.ts design-patterns
pnpm tsx run-demos.ts consensus-algorithms

# 4. 运行测试
pnpm test
```

### 方式三：按路径学习

1. **[初学者路径](./docs/learning-paths/beginners-path.md)** - 掌握 TypeScript 基础和设计模式
2. **[进阶路径](./docs/learning-paths/intermediate-path.md)** - 深入架构设计和性能优化
3. **[架构师路径](./docs/learning-paths/advanced-path.md)** - 分布式系统和形式化验证

---

## 📦 框架与运行时

### Web 框架

| 项目 | 描述 | Stars |
|------|------|-------|
| [Express](https://github.com/expressjs/express) | 快速、无约束、极简的 Node.js Web 框架 | ![Stars](<<<https://img.shields.io/github/stars/expressjs/express?style=flat-square&cacheSeconds=3600&t=1776450896763> |
| [Fastify](https://github.com/fastify/fastify) | 快速且低开销的 Web 框架 | ![Stars](<<<https://img.shields.io/github/stars/fastify/fastify?style=flat-square&cacheSeconds=3600&t=1776450896763> |
| [NestJS](https://github.com/nestjs/nest) | 渐进式 Node.js 服务端框架 | ![Stars](<<<https://img.shields.io/github/stars/nestjs/nest?style=flat-square&cacheSeconds=3600&t=1776450896763> |
| [Koa](https://github.com/koajs/koa) | Express 团队打造的下一代框架 | ![Stars](<<<https://img.shields.io/github/stars/koajs/koa?style=flat-square&cacheSeconds=3600&t=1776450896763> |
| [Hono](https://github.com/honojs/hono) | 超轻量级、超快速的 Web 框架，支持多种运行时 | ![Stars](<<<https://img.shields.io/github/stars/honojs/hono?style=flat-square&cacheSeconds=3600&t=1776450896763> |
| [Elysia](https://github.com/elysiajs/elysia) | 基于 Bun 的快速、友好的后端框架 | ![Stars](<<<https://img.shields.io/github/stars/elysiajs/elysia?style=flat-square&cacheSeconds=3600&t=1776450896763> |

### 全栈框架

| 项目 | 描述 | Stars |
|------|------|-------|
| [Next.js](https://github.com/vercel/next.js) | React 全栈框架 | ![Stars](<<<https://img.shields.io/github/stars/vercel/next.js?style=flat-square&cacheSeconds=3600&t=1776450896763> |
| [Nuxt](https://github.com/nuxt/nuxt) | 基于 Vue 的直观 Web 框架 | ![Stars](<<<https://img.shields.io/github/stars/nuxt/nuxt?style=flat-square&cacheSeconds=3600&t=1776450896763> |
| [SvelteKit](https://github.com/sveltejs/kit) | Svelte 全栈框架 | ![Stars](<<<https://img.shields.io/github/stars/sveltejs/kit?style=flat-square&cacheSeconds=3600&t=1776450896763> |
| [Remix](https://github.com/remix-run/remix) | 专注于 Web 标准的全栈框架 | ![Stars](<<<https://img.shields.io/github/stars/remix-run/remix?style=flat-square&cacheSeconds=3600&t=1776450896763> |
| [Astro](https://github.com/withastro/astro) | 内容驱动的快速网站构建框架 | ![Stars](<<<https://img.shields.io/github/stars/withastro/astro?style=flat-square&cacheSeconds=3600&t=1776450896763> |

### 运行时

| 项目 | 描述 | Stars |
|------|------|-------|
| [Node.js](https://github.com/nodejs/node) | JavaScript 运行时 | ![Stars](<<<https://img.shields.io/github/stars/nodejs/node?style=flat-square&cacheSeconds=3600&t=1776450896763> |
| [Deno](https://github.com/denoland/deno) | 现代 JS/TS 运行时 | ![Stars](<<<https://img.shields.io/github/stars/denoland/deno?style=flat-square&cacheSeconds=3600&t=1776450896763> |
| [Bun](https://github.com/oven-sh/bun) | 极速 JS 运行时与打包器 | ![Stars](<<<https://img.shields.io/github/stars/oven-sh/bun?style=flat-square&cacheSeconds=3600&t=1776450896763> |

---

## 🔧 开发工具

### 构建工具

| 项目 | 描述 | Stars |
|------|------|-------|
| [Vite](https://github.com/vitejs/vite) | 下一代前端工具链 | ![Stars](<<<https://img.shields.io/github/stars/vitejs/vite?style=flat-square&cacheSeconds=3600&t=1776450896763> |
| [esbuild](https://github.com/evanw/esbuild) | 极速 JavaScript 打包器 | ![Stars](<<<https://img.shields.io/github/stars/evanw/esbuild?style=flat-square&cacheSeconds=3600&t=1776450896763> |
| [swc](https://github.com/swc-project/swc) | Rust 编写的 JS/TS 编译器 | ![Stars](<<<https://img.shields.io/github/stars/swc-project/swc?style=flat-square&cacheSeconds=3600&t=1776450896763> |
| [Turbopack](https://github.com/vercel/turbopack) | Rust 编写的增量打包工具 | ![Stars](<<<https://img.shields.io/github/stars/vercel/turbopack?style=flat-square&cacheSeconds=3600&t=1776450896763> |
| [Rollup](https://github.com/rollup/rollup) | JavaScript 模块打包器 | ![Stars](<<<https://img.shields.io/github/stars/rollup/rollup?style=flat-square&cacheSeconds=3600&t=1776450896763> |

### 代码质量

| 项目 | 描述 | Stars |
|------|------|-------|
| [ESLint](https://github.com/eslint/eslint) | 可插拔的 JavaScript 代码检查工具 | ![Stars](<<<https://img.shields.io/github/stars/eslint/eslint?style=flat-square&cacheSeconds=3600&t=1776450896763> |
| [Prettier](https://github.com/prettier/prettier) | 代码格式化工具 | ![Stars](<<<https://img.shields.io/github/stars/prettier/prettier?style=flat-square&cacheSeconds=3600&t=1776450896763> |
| [Biome](https://github.com/biomejs/biome) | 快速格式化器和检查工具 | ![Stars](<<<https://img.shields.io/github/stars/biomejs/biome?style=flat-square&cacheSeconds=3600&t=1776450896763> |
| [TypeScript-ESLint](https://github.com/typescript-eslint/typescript-eslint) | TS ESLint 工具集 | ![Stars](<<<https://img.shields.io/github/stars/typescript-eslint/typescript-eslint?style=flat-square&cacheSeconds=3600&t=1776450896763> |

### 测试框架

| 项目 | 描述 | Stars |
|------|------|-------|
| [Jest](https://github.com/jestjs/jest) | 令人愉快的 JavaScript 测试框架 | ![Stars](<<<https://img.shields.io/github/stars/jestjs/jest?style=flat-square&cacheSeconds=3600&t=1776450896763> |
| [Vitest](https://github.com/vitest-dev/vitest) | 由 Vite 驱动的极速单元测试框架 | ![Stars](<<<https://img.shields.io/github/stars/vitest-dev/vitest?style=flat-square&cacheSeconds=3600&t=1776450896763> |
| [Playwright](https://github.com/microsoft/playwright) | 可靠的端到端测试框架 | ![Stars](<<<https://img.shields.io/github/stars/microsoft/playwright?style=flat-square&cacheSeconds=3600&t=1776450896763> |
| [Cypress](https://github.com/cypress-io/cypress) | 为现代 Web 构建的下一代前端测试工具 | ![Stars](<<<https://img.shields.io/github/stars/cypress-io/cypress?style=flat-square&cacheSeconds=3600&t=1776450896763> |

---

## 📝 错误处理与日志记录

### 统一错误处理架构

**错误类型定义**

```typescript
// lib/errors.ts
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: Record<string, any>
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'VALIDATION_ERROR', 400, details)
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 'AUTHENTICATION_ERROR', 401)
    this.name = 'AuthenticationError'
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 'NOT_FOUND', 404)
    this.name = 'NotFoundError'
  }
}
```

**全局错误处理中间件**

```typescript
// middleware/errorHandler.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { AppError } from '@/lib/errors'
import { logger } from '@/lib/logger'

export function errorHandler(
  err: Error,
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 记录错误
  logger.error({
    err: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    query: req.query,
    body: req.body
  })

  // AppError 处理
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details
      }
    })
  }

  // Zod 验证错误
  if (err.name === 'ZodError') {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: err.issues
      }
    })
  }

  // 未知错误
  return res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message
    }
  })
}
```

**React 错误边界**

```typescript
// components/ErrorBoundary.tsx
'use client'

import { Component, ErrorInfo, ReactNode } from 'react'
import { logger } from '@/lib/logger'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error({
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    })
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-fallback">
          <h2>出错了</h2>
          <p>抱歉，发生了意外错误。</p>
          <button onClick={() => window.location.reload()}>
            刷新页面
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
```

---

### 日志记录最佳实践

**结构化日志配置**

```typescript
// lib/logger.ts
import pino from 'pino'

const isDev = process.env.NODE_ENV === 'development'

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: isDev
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'yyyy-mm-dd HH:MM:ss',
          ignore: 'pid,hostname'
        }
      }
    : undefined,
  base: {
    env: process.env.NODE_ENV,
    version: process.env.NEXT_PUBLIC_APP_VERSION
  },
  //  redact 敏感字段
  redact: {
    paths: [
      'password',
      'token',
      'authorization',
      '*.password',
      '*.token'
    ],
    remove: true
  }
})

// 子日志实例
export function createLogger(component: string) {
  return logger.child({ component })
}
```

**日志使用示例**

```typescript
// API 路由中使用
import { createLogger } from '@/lib/logger'

const logger = createLogger('AuthAPI')

export async function POST(req: Request) {
  logger.info({ email: req.body.email }, 'Login attempt')

  try {
    const user = await authenticate(req.body)
    logger.info({ userId: user.id }, 'Login successful')
    return Response.json(user)
  } catch (error) {
    logger.warn({ email: req.body.email, error }, 'Login failed')
    return Response.json({ error: 'Invalid credentials' }, { status: 401 })
  }
}
```

**前端日志收集**

```typescript
// lib/client-logger.ts
export function logError(error: Error, context?: Record<string, any>) {
  // 发送到日志服务
  fetch('/api/log', {
    method: 'POST',
    body: JSON.stringify({
      level: 'error',
      message: error.message,
      stack: error.stack,
      context,
      url: window.location.href,
      userAgent: navigator.userAgent
    })
  })
}

// React Query 错误处理
import { QueryCache, QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      logError(error as Error, {
        queryKey: query.queryKey,
        operation: 'query'
      })
    }
  })
})
```

---

### 监控与告警

**Sentry 集成**

```typescript
// lib/sentry.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  release: process.env.NEXT_PUBLIC_APP_VERSION,

  // 采样率
  tracesSampleRate: 1.0,
  profilesSampleRate: 0.1,

  //  replays
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // 过滤
  beforeSend(event) {
    // 忽略 404 错误
    if (event.exception?.values?.some(e =>
      e.value?.includes('Not found')
    )) {
      return null
    }
    return event
  },

  // 标签
  initialScope: {
    tags: {
      component: 'web'
    }
  }
})
```

**性能监控**

```typescript
// lib/performance.ts
export function measurePerformance(name: string, fn: () => Promise<any>) {
  const start = performance.now()

  return fn().finally(() => {
    const duration = performance.now() - start

    // 发送到分析平台
    if (window.gtag) {
      window.gtag('event', 'timing_complete', {
        name,
        value: Math.round(duration)
      })
    }

    // 慢操作告警
    if (duration > 3000) {
      console.warn(`Slow operation: ${name} took ${duration}ms`)
    }
  })
}
```

**健康检查端点**

```typescript
// app/api/health/route.ts
import { prisma } from '@/lib/prisma'
import { redis } from '@/lib/redis'

export async function GET() {
  const checks = {
    database: false,
    redis: false,
    timestamp: new Date().toISOString()
  }

  try {
    await prisma.$queryRaw`SELECT 1`
    checks.database = true
  } catch (error) {
    console.error('Database health check failed', error)
  }

  try {
    await redis.ping()
    checks.redis = true
  } catch (error) {
    console.error('Redis health check failed', error)
  }

  const healthy = checks.database && checks.redis

  return Response.json(checks, {
    status: healthy ? 200 : 503
  })
}
```

---

## 🌍 国际化(i18n)实现方案

### next-intl 完整配置

**安装**

```bash
npm install next-intl
```

**配置文件**

```typescript
// i18n.ts
import { getRequestConfig } from 'next-intl/server'
import { notFound } from 'next/navigation'

export const locales = ['en', 'zh', 'ja'] as const
export type Locale = (typeof locales)[number]

export default getRequestConfig(async ({ locale }) => {
  if (!locales.includes(locale as any)) notFound()

  return {
    messages: (await import(`./messages/${locale}.json`)).default
  }
})
```

**消息文件结构**

```json
// messages/zh.json
{
  "Metadata": {
    "title": "我的应用",
    "description": "这是一个示例应用"
  },
  "Navigation": {
    "home": "首页",
    "about": "关于",
    "contact": "联系我们"
  },
  "Hero": {
    "title": "欢迎来到{appName}",
    "subtitle": "我们提供{service}服务",
    "cta": "立即开始"
  },
  "Errors": {
    "required": "此字段为必填项",
    "email": "请输入有效的邮箱地址",
    "minLength": "至少需要{count}个字符"
  }
}

// messages/en.json
{
  "Metadata": {
    "title": "My App",
    "description": "This is a sample application"
  },
  "Navigation": {
    "home": "Home",
    "about": "About",
    "contact": "Contact Us"
  },
  "Hero": {
    "title": "Welcome to {appName}",
    "subtitle": "We provide {service} services",
    "cta": "Get Started"
  },
  "Errors": {
    "required": "This field is required",
    "email": "Please enter a valid email",
    "minLength": "At least {count} characters required"
  }
}
```

**Next.js 配置**

```typescript
// next.config.js
const withNextIntl = require('next-intl/plugin')('./i18n.ts')

module.exports = withNextIntl({
  // 其他配置
})
```

**中间件配置**

```typescript
// middleware.ts
import createMiddleware from 'next-intl/middleware'
import { locales } from './i18n'

export default createMiddleware({
  locales,
  defaultLocale: 'zh',
  localePrefix: 'as-needed' // 或 'always'
})

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
}
```

**页面结构**

```
app/
├── [locale]/
│   ├── page.tsx          # 首页
│   ├── about/
│   │   └── page.tsx      # 关于页
│   ├── layout.tsx        # 带翻译的 layout
│   └── not-found.tsx     # 404 页
├── api/
└── layout.tsx            # 根 layout
```

**使用示例**

```typescript
// app/[locale]/page.tsx
import { useTranslations } from 'next-intl'
import { getTranslations } from 'next-intl/server'

// 服务端组件
export async function generateMetadata({
  params: { locale }
}: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: 'Metadata' })
  return {
    title: t('title'),
    description: t('description')
  }
}

export default function HomePage() {
  const t = useTranslations('Hero')

  return (
    <div>
      <h1>{t('title', { appName: 'MyApp' })}</h1>
      <p>{t('subtitle', { service: t('service.web') })}</p>
      <button>{t('cta')}</button>
    </div>
  )
}

// 客户端组件
'use client'
import { useTranslations } from 'next-intl'

export function Navigation() {
  const t = useTranslations('Navigation')

  return (
    <nav>
      <a href="/">{t('home')}</a>
      <a href="/about">{t('about')}</a>
    </nav>
  )
}
```

**语言切换组件**

```typescript
// components/LocaleSwitcher.tsx
'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'

export function LocaleSwitcher() {
  const t = useTranslations('LocaleSwitcher')
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const handleChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale })
  }

  return (
    <select
      value={locale}
      onChange={(e) => handleChange(e.target.value)}
    >
      <option value="zh">中文</option>
      <option value="en">English</option>
      <option value="ja">日本語</option>
    </select>
  )
}
```

---

### 日期/数字/货币格式化

```typescript
import { useFormatter, useNow } from 'next-intl'

function FormattedValues() {
  const format = useFormatter()
  const now = useNow({
    updateInterval: 1000 * 60 // 每分钟更新
  })

  // 日期
  format.dateTime(new Date(), {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) // 2024年1月15日

  // 相对时间
  format.relativeTime(new Date('2024-01-01'))
  // 2周前

  // 数字
  format.number(1234567.89, {
    style: 'currency',
    currency: 'CNY'
  }) // ¥1,234,567.89

  // 列表
  format.list(['苹果', '香蕉', '橙子'])
  // 苹果、香蕉和橙子
}
```

---

### 复数规则

```json
{
  "items": {
    "zero": "没有项目",
    "one": "1个项目",
    "other": "{count}个项目"
  }
}
```

```typescript
const t = useTranslations()
t('items', { count: 0 }) // 没有项目
t('items', { count: 1 }) // 1个项目
t('items', { count: 5 }) // 5个项目
```

---

### 翻译管理 CLI

**提取脚本**

```bash
# 提取所有翻译键
npx next-intl extract

# 检查结果
ls messages/
# en.json  zh.json  ja.json
```

**翻译工作流**

```bash
# 1. 开发时添加新 key
const t = useTranslations()
t('newFeature.title')

# 2. 提取
npm run i18n:extract

# 3. 发送给翻译团队
# 使用 Crowdin/Lokalise 等平台

# 4. 下载翻译后验证
npm run i18n:validate
```

---

## 🚀 多平台部署配置

### Vercel 部署 (推荐)

**vercel.json 配置**

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "next build",
  "framework": "nextjs",
  "installCommand": "pnpm install",
  "regions": ["hkg1", "sin1"],
  "crons": [
    {
      "path": "/api/cron/daily",
      "schedule": "0 2 * * *"
    }
  ],
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" }
      ]
    },
    {
      "source": "/static/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

**环境变量设置**

```bash
# Production
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_SECRET production

# 预览环境
vercel env add DATABASE_URL preview
```

---

### AWS ECS + Fargate 部署

**task-definition.json**

```json
{
  "family": "my-app",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "app",
      "image": "ACCOUNT.dkr.ecr.REGION.amazonaws.com/my-app:latest",
      "portMappings": [
        { "containerPort": 3000, "protocol": "tcp" }
      ],
      "environment": [
        { "name": "NODE_ENV", "value": "production" }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:REGION:ACCOUNT:secret:database-url"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/my-app",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:3000/api/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3
      }
    }
  ]
}
```

**GitHub Actions 部署到 ECS**

```yaml
# .github/workflows/deploy-aws.yml
name: Deploy to AWS ECS

on:
  push:
    branches: [main]

env:
  AWS_REGION: us-east-1
  ECR_REPOSITORY: my-app
  ECS_SERVICE: my-app-service
  ECS_CLUSTER: my-app-cluster

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2

      - name: Build and push Docker image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
          echo "image=$ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG" >> $GITHUB_OUTPUT

      - name: Update ECS service
        run: |
          aws ecs update-service \
            --cluster $ECS_CLUSTER \
            --service $ECS_SERVICE \
            --force-new-deployment
```

---

### Docker Compose 本地/生产部署

**docker-compose.yml**

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/myapp
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
    networks:
      - app-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: myapp
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - app-network
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    networks:
      - app-network
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - app
    networks:
      - app-network
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:

networks:
  app-network:
    driver: bridge
```

---

### Kubernetes 部署配置

**deployment.yaml**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
  labels:
    app: my-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
      - name: app
        image: my-app:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: database-url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

**service.yaml**

```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-app-service
spec:
  selector:
    app: my-app
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: LoadBalancer
```

**ingress.yaml**

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: my-app-ingress
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: "letsencrypt"
spec:
  tls:
  - hosts:
    - myapp.example.com
    secretName: myapp-tls
  rules:
  - host: myapp.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: my-app-service
            port:
              number: 80
```

---

### 部署平台对比

| 平台 | 适用场景 | 成本 | 复杂度 | 扩展性 |
|------|---------|------|--------|--------|
| Vercel | 前端/全栈应用 | $$$ | 低 | 自动 |
| Netlify | 静态站点/JAMstack | $$ | 低 | 自动 |
| AWS ECS | 企业级应用 | $$-$$$ | 高 | 手动/自动 |
| Kubernetes | 大规模微服务 | $$$$ | 极高 | 自动 |
| Railway/Render | 中小项目 | $ | 低 | 自动 |
| Fly.io | 全球边缘部署 | $$ | 中 | 自动 |

---

## 🔌 GraphQL 实现方案

### tRPC 方案（推荐用于全栈 TypeScript）

**为什么选 tRPC？**

- 端到端类型安全，无需代码生成
- 与 React Query 集成，缓存开箱即用
- 支持订阅（WebSocket）
- 前后端共享类型定义

**项目结构**

```
src/
├── server/
│   ├── routers/
│   │   ├── _app.ts        # 主路由合并
│   │   ├── user.ts        # 用户路由
│   │   └── post.ts        # 文章路由
│   ├── context.ts         # 上下文（auth/db）
│   └── trpc.ts            # tRPC 初始化
├── lib/
│   └── trpc.ts            # 客户端初始化
└── app/
    └── api/trpc/[trpc]/route.ts  # API 路由
```

**服务端配置**

```typescript
// src/server/trpc.ts
import { initTRPC, TRPCError } from '@trpc/server'
import { Context } from './context'

const t = initTRPC.context<Context>().create()

export const router = t.router
export const publicProcedure = t.procedure

// 受保护的过程（需要登录）
export const protectedProcedure = t.procedure.use(
  t.middleware(({ ctx, next }) => {
    if (!ctx.session?.user) {
      throw new TRPCError({ code: 'UNAUTHORIZED' })
    }
    return next({
      ctx: {
        ...ctx,
        session: ctx.session
      }
    })
  })
)
```

**路由定义**

```typescript
// src/server/routers/user.ts
import { router, publicProcedure, protectedProcedure } from '../trpc'
import { z } from 'zod'

export const userRouter = router({
  // 查询
  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: input.id }
      })
      if (!user) throw new TRPCError({ code: 'NOT_FOUND' })
      return user
    }),

  // 列表查询（分页）
  list: publicProcedure
    .input(z.object({
      cursor: z.string().optional(),
      limit: z.number().min(1).max(100).default(10)
    }))
    .query(async ({ ctx, input }) => {
      const users = await ctx.prisma.user.findMany({
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { createdAt: 'desc' }
      })

      let nextCursor: typeof input.cursor = undefined
      if (users.length > input.limit) {
        const nextItem = users.pop()
        nextCursor = nextItem!.id
      }

      return { users, nextCursor }
    }),

  // 创建（需要登录）
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(2),
      email: z.string().email()
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.user.create({
        data: input
      })
    })
})
```

**主路由合并**

```typescript
// src/server/routers/_app.ts
import { router } from '../trpc'
import { userRouter } from './user'
import { postRouter } from './post'

export const appRouter = router({
  user: userRouter,
  post: postRouter
})

export type AppRouter = typeof appRouter
```

**API 路由**

```typescript
// src/app/api/trpc/[trpc]/route.ts
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter } from '@/server/routers/_app'
import { createContext } from '@/server/context'

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => createContext(req)
  })

export { handler as GET, handler as POST }
```

**客户端使用**

```typescript
// src/lib/trpc.ts
import { createTRPCReact } from '@trpc/react-query'
import type { AppRouter } from '@/server/routers/_app'

export const trpc = createTRPCReact<AppRouter>()

// Provider 配置
// src/app/providers.tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { httpBatchLink } from '@trpc/client'
import { useState } from 'react'
import { trpc } from '@/lib/trpc'

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: '/api/trpc'
        })
      ]
    })
  )

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  )
}
```

**React 组件中使用**

```typescript
// 查询
function UserList() {
  const { data, fetchNextPage, hasNextPage } = trpc.user.list.useInfiniteQuery(
    { limit: 10 },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor
    }
  )

  return (
    <div>
      {data?.pages.map((page) =>
        page.users.map((user) => <UserCard key={user.id} user={user} />)
      )}
      {hasNextPage && (
        <button onClick={() => fetchNextPage()}>加载更多</button>
      )}
    </div>
  )
}

// 修改
function CreateUser() {
  const utils = trpc.useContext()
  const mutation = trpc.user.create.useMutation({
    onSuccess: () => {
      // 刷新列表
      utils.user.list.invalidate()
    }
  })

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      mutation.mutate({ name: 'John', email: 'john@example.com' })
    }}>
      <button type="submit" disabled={mutation.isLoading}>
        {mutation.isLoading ? '创建中...' : '创建用户'}
      </button>
    </form>
  )
}
```

---

### Apollo Client + GraphQL Yoga 方案

**适用场景**: 需要与现有 GraphQL 生态集成，或团队熟悉 GraphQL

**服务端 (GraphQL Yoga)**

```typescript
// src/app/api/graphql/route.ts
import { createYoga } from 'graphql-yoga'
import { schema } from '@/server/graphql/schema'

const { handleRequest } = createYoga({
  schema,
  graphqlEndpoint: '/api/graphql',
  fetchAPI: { Response }
})

export { handleRequest as GET, handleRequest as POST }
```

**Schema 定义**

```typescript
// src/server/graphql/schema.ts
import { makeExecutableSchema } from '@graphql-tools/schema'
import { typeDefs } from './typeDefs'
import { resolvers } from './resolvers'

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers
})

// src/server/graphql/typeDefs.ts
export const typeDefs = `
  type User {
    id: ID!
    name: String!
    email: String!
    posts: [Post!]!
  }

  type Post {
    id: ID!
    title: String!
    content: String!
    author: User!
  }

  type Query {
    users: [User!]!
    user(id: ID!): User
    posts: [Post!]!
  }

  type Mutation {
    createUser(name: String!, email: String!): User!
    createPost(title: String!, content: String!, authorId: ID!): Post!
  }
`
```

**客户端 (Apollo Client)**

```typescript
// src/lib/apollo.ts
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'

const httpLink = createHttpLink({
  uri: '/api/graphql'
})

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token')
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : ''
    }
  }
})

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          users: {
            keyArgs: false,
            merge(existing = [], incoming) {
              return [...existing, ...incoming]
            }
          }
        }
      }
    }
  })
})
```

---

### 方案对比

| 特性 | tRPC | GraphQL |
|------|------|---------|
| 类型安全 | ✅ 端到端 | ⚠️ 需代码生成 |
| 学习曲线 | 低 | 高 |
| 生态系统 |  growing | 成熟丰富 |
| 缓存 | React Query 内置 | Apollo Client |
| 订阅 | 支持 | 原生支持 |
| 文件上传 | 需额外处理 | 原生支持 |
| 适用场景 | 全栈 TS 项目 | 多客户端/公共 API |

**选型建议**

- 新项目 + 全栈 TypeScript → **tRPC**
- 需要移动端/第三方接入 → **GraphQL**
- 已有 GraphQL 生态 → **GraphQL Yoga**

---

## 📡 WebSocket 实时通信实现

### Socket.io 完整实现

**服务端 (Next.js API Route)**

```typescript
// src/app/api/socket/route.ts
import { Server as NetServer } from 'http'
import { NextApiRequest } from 'next'
import { Server as ServerIO } from 'socket.io'

export const config = {
  api: {
    bodyParser: false
  }
}

export async function GET(req: NextApiRequest) {
  if ((req.socket as any).server.io) {
    return new Response('Socket already running', { status: 200 })
  }

  const httpServer: NetServer = (req.socket as any).server
  const io = new ServerIO(httpServer, {
    path: '/api/socket',
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  })

  // 连接处理
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id)

    // 加入房间
    socket.on('join-room', (roomId: string) => {
      socket.join(roomId)
      socket.to(roomId).emit('user-joined', socket.id)
    })

    // 离开房间
    socket.on('leave-room', (roomId: string) => {
      socket.leave(roomId)
      socket.to(roomId).emit('user-left', socket.id)
    })

    // 消息广播
    socket.on('send-message', (data: { roomId: string; message: string }) => {
      socket.to(data.roomId).emit('new-message', {
        id: Date.now(),
        text: data.message,
        sender: socket.id,
        timestamp: new Date().toISOString()
      })
    })

    // 协作编辑（Yjs 集成）
    socket.on('doc-update', (data: { roomId: string; update: Uint8Array }) => {
      socket.to(data.roomId).emit('doc-update', data.update)
    })

    // 断开连接
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id)
    })
  })

  ;(req.socket as any).server.io = io

  return new Response('Socket initialized', { status: 200 })
}
```

**客户端 Hook**

```typescript
// src/hooks/useSocket.ts
import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'

export function useSocket(roomId?: string) {
  const socketRef = useRef<Socket>()
  const [isConnected, setIsConnected] = useState(false)
  const [messages, setMessages] = useState<any[]>([])

  useEffect(() => {
    // 初始化 Socket
    socketRef.current = io({
      path: '/api/socket'
    })

    socketRef.current.on('connect', () => {
      setIsConnected(true)
      console.log('Connected:', socketRef.current?.id)

      // 加入房间
      if (roomId) {
        socketRef.current?.emit('join-room', roomId)
      }
    })

    socketRef.current.on('disconnect', () => {
      setIsConnected(false)
    })

    // 监听消息
    socketRef.current.on('new-message', (message) => {
      setMessages((prev) => [...prev, message])
    })

    // 清理
    return () => {
      if (roomId) {
        socketRef.current?.emit('leave-room', roomId)
      }
      socketRef.current?.disconnect()
    }
  }, [roomId])

  const sendMessage = (message: string) => {
    if (roomId && socketRef.current) {
      socketRef.current.emit('send-message', { roomId, message })
    }
  }

  return { isConnected, messages, sendMessage }
}
```

**聊天组件**

```typescript
// src/components/Chat.tsx
'use client'

import { useSocket } from '@/hooks/useSocket'
import { useState } from 'react'

export function Chat({ roomId }: { roomId: string }) {
  const { isConnected, messages, sendMessage } = useSocket(roomId)
  const [input, setInput] = useState('')

  return (
    <div className="chat-container">
      <div className="connection-status">
        {isConnected ? '🟢 已连接' : '🔴 未连接'}
      </div>

      <div className="messages">
        {messages.map((msg) => (
          <div key={msg.id} className="message">
            <span className="sender">{msg.sender.slice(0, 6)}</span>
            <p>{msg.text}</p>
            <span className="time">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </span>
          </div>
        ))}
      </div>

      <form onSubmit={(e) => {
        e.preventDefault()
        sendMessage(input)
        setInput('')
      }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入消息..."
        />
        <button type="submit" disabled={!isConnected}>
          发送
        </button>
      </form>
    </div>
  )
}
```

---

### PartyKit 边缘实时方案

**PartyKit 服务端**

```typescript
// party/server.ts
import type * as Party from 'partykit/server'

export default class Server implements Party.Server {
  constructor(readonly room: Party.Room) {}

  onConnect(conn: Party.Connection) {
    console.log(`Client ${conn.id} connected to room ${this.room.id}`)

    // 广播新用户加入
    this.room.broadcast(
      JSON.stringify({ type: 'user-joined', userId: conn.id }),
      [conn.id] // 排除自己
    )
  }

  onMessage(message: string, sender: Party.Connection) {
    const data = JSON.parse(message)

    switch (data.type) {
      case 'cursor-move':
        // 广播光标位置（排除发送者）
        this.room.broadcast(
          JSON.stringify({
            type: 'cursor-update',
            userId: sender.id,
            x: data.x,
            y: data.y
          }),
          [sender.id]
        )
        break

      case 'doc-update':
        // Yjs 文档更新广播
        this.room.broadcast(message, [sender.id])
        break

      case 'chat-message':
        // 聊天消息持久化 + 广播
        this.persistMessage(data)
        this.room.broadcast(message)
        break
    }
  }

  onClose(conn: Party.Connection) {
    this.room.broadcast(
      JSON.stringify({ type: 'user-left', userId: conn.id })
    )
  }

  async persistMessage(data: any) {
    // 保存到外部数据库
    await fetch(process.env.API_URL + '/messages', {
      method: 'POST',
      body: JSON.stringify({
        roomId: this.room.id,
        ...data
      })
    })
  }
}

Server satisfies Party.Worker
```

**PartyKit 配置**

```typescript
// partykit.json
{
  "name": "my-collab-app",
  "main": "party/server.ts",
  "compatibilityDate": "2024-01-01",
  "parties": {
    "main": "party/server.ts"
  }
}
```

**客户端使用**

```typescript
// src/hooks/useParty.ts
import { useEffect, useRef, useState } from 'react'

export function useParty(roomId: string) {
  const wsRef = useRef<WebSocket>()
  const [users, setUsers] = useState<string[]>([])

  useEffect(() => {
    const host = process.env.NEXT_PUBLIC_PARTYKIT_HOST!
    const ws = new WebSocket(`wss://${host}/party/${roomId}`)
    wsRef.current = ws

    ws.onopen = () => console.log('Connected to PartyKit')

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)

      switch (data.type) {
        case 'user-joined':
          setUsers((prev) => [...prev, data.userId])
          break
        case 'user-left':
          setUsers((prev) => prev.filter((id) => id !== data.userId))
          break
        case 'cursor-update':
          // 更新其他用户光标位置
          updateCursor(data.userId, data.x, data.y)
          break
      }
    }

    return () => ws.close()
  }, [roomId])

  const broadcast = (message: any) => {
    wsRef.current?.send(JSON.stringify(message))
  }

  return { users, broadcast }
}
```

---

### Yjs 协作编辑实现

**文档同步**

```typescript
// src/hooks/useYjs.ts
import { useEffect, useRef, useState } from 'react'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { useParty } from './useParty'

export function useCollaborativeEditor(roomId: string) {
  const docRef = useRef<Y.Doc>()
  const [content, setContent] = useState('')
  const { broadcast } = useParty(roomId)

  useEffect(() => {
    const doc = new Y.Doc()
    docRef.current = doc

    const yText = doc.getText('content')

    // 监听本地变化
    yText.observe(() => {
      setContent(yText.toString())
    })

    // 通过 PartyKit 同步
    doc.on('update', (update) => {
      broadcast({
        type: 'doc-update',
        update: Array.from(update)
      })
    })

    return () => doc.destroy()
  }, [roomId])

  const updateContent = (newContent: string) => {
    const yText = docRef.current?.getText('content')
    if (yText) {
      yText.delete(0, yText.length)
      yText.insert(0, newContent)
    }
  }

  const applyRemoteUpdate = (update: Uint8Array) => {
    Y.applyUpdate(docRef.current!, update)
  }

  return { content, updateContent, applyRemoteUpdate }
}
```

---

### 实时方案对比

| 方案 | 延迟 | 扩展性 | 复杂度 | 适用场景 |
|------|------|--------|--------|----------|
| Socket.io | <100ms | 需 Redis | 中 | 通用实时应用 |
| PartyKit | <50ms | 自动 | 低 | 边缘实时协作 |
| Ably/Pusher | <100ms | 托管 | 低 | 快速上线 |
| AWS AppSync | <200ms | 托管 | 高 | AWS 生态 |
| Yjs + WebRTC | P2P | 无需服务器 | 中 | 本地优先协作 |

---

## 📊 数据与存储

### ORM 与数据库工具

| 项目 | 描述 | Stars |
|------|------|-------|
| [Prisma](https://github.com/prisma/prisma) | 下一代 ORM | ![Stars](<<<https://img.shields.io/github/stars/prisma/prisma?style=flat-square&cacheSeconds=3600&t=1776450896763> |
| [TypeORM](https://github.com/typeorm/typeorm) | 支持 TypeScript 的 ORM | ![Stars](<<<https://img.shields.io/github/stars/typeorm/typeorm?style=flat-square&cacheSeconds=3600&t=1776450896763> |
| [Drizzle](https://github.com/drizzle-team/drizzle-orm) | 类型安全的 SQL 风格 ORM | ![Stars](<<<https://img.shields.io/github/stars/drizzle-team/drizzle-orm?style=flat-square&cacheSeconds=3600&t=1776450896763> |
| [Sequelize](https://github.com/sequelize/sequelize) | Node.js ORM 库 | ![Stars](<<<https://img.shields.io/github/stars/sequelize/sequelize?style=flat-square&cacheSeconds=3600&t=1776450896763> |
| [Mongoose](https://github.com/Automattic/mongoose) | MongoDB 对象建模 | ![Stars](<<<https://img.shields.io/github/stars/Automattic/mongoose?style=flat-square&cacheSeconds=3600&t=1776450896763> |

### 缓存与消息队列

| 项目 | 描述 | Stars |
|------|------|-------|
| [ioredis](https://github.com/redis/ioredis) | 强大的 Redis 客户端 | ![Stars](<<<https://img.shields.io/github/stars/redis/ioredis?style=flat-square&cacheSeconds=3600&t=1776450896763> |
| [Bull](https://github.com/OptimalBits/bull) | 基于 Redis 的 Node.js 队列系统 | ![Stars](<<<https://img.shields.io/github/stars/OptimalBits/bull?style=flat-square&cacheSeconds=3600&t=1776450896763> |
| [BullMQ](https://github.com/taskforcesh/bullmq) | Bull 的 TypeScript 重写版 | ![Stars](<<<https://img.shields.io/github/stars/taskforcesh/bullmq?style=flat-square&cacheSeconds=3600&t=1776450896763> |

---

## 🔐 安全与认证

| 项目 | 描述 | Stars |
|------|------|-------|
| [Passport](https://github.com/jaredhanson/passport) | Node.js 的简洁、灵活的认证中间件 | ![Stars](<<<https://img.shields.io/github/stars/jaredhanson/passport?style=flat-square&cacheSeconds=3600&t=1776450896763> |
| [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) | JSON Web Token 实现 | ![Stars](<<<https://img.shields.io/github/stars/auth0/node-jsonwebtoken?style=flat-square&cacheSeconds=3600&t=1776450896763> |
| [bcrypt](https://github.com/kelektiv/node.bcrypt.js) | bcrypt 库 | ![Stars](<<<https://img.shields.io/github/stars/kelektiv/node.bcrypt.js?style=flat-square&cacheSeconds=3600&t=1776450896763> |
| [Helmet](https://github.com/helmetjs/helmet) | 帮助保护 Express 应用的安全中间件 | ![Stars](<<<https://img.shields.io/github/stars/helmetjs/helmet?style=flat-square&cacheSeconds=3600&t=1776450896763> |
| [CORS](https://github.com/expressjs/cors) | Node.js CORS 中间件 | ![Stars](<<<https://img.shields.io/github/stars/expressjs/cors?style=flat-square&cacheSeconds=3600&t=1776450896763> |

---

## 🚀 部署与运维

| 项目 | 描述 | Stars |
|------|------|-------|
| [PM2](https://github.com/Unitech/pm2) | Node.js 进程管理器 | ![Stars](<<<https://img.shields.io/github/stars/Unitech/pm2?style=flat-square&cacheSeconds=3600&t=1776450896763> |
| [Dockerode](https://github.com/apocas/dockerode) | Docker API 库 | ![Stars](<<<https://img.shields.io/github/stars/apocas/dockerode?style=flat-square&cacheSeconds=3600&t=1776450896763> |
| [Clinic.js](https://github.com/clinicjs/node-clinic) | Node.js 性能诊断工具 | ![Stars](<<<https://img.shields.io/github/stars/clinicjs/node-clinic?style=flat-square&cacheSeconds=3600&t=1776450896763> |

---

## 🧩 实用库

| 项目 | 描述 | Stars |
|------|------|-------|
| [Lodash](https://github.com/lodash/lodash) | 现代 JavaScript 实用工具库 | ![Stars](<<<https://img.shields.io/github/stars/lodash/lodash?style=flat-square&cacheSeconds=3600&t=1776450896763> |
| [Ramda](https://github.com/ramda/ramda) | 函数式编程实用工具库 | ![Stars](<<<https://img.shields.io/github/stars/ramda/ramda?style=flat-square&cacheSeconds=3600&t=1776450896763> |
| [Day.js](https://github.com/iamkun/dayjs) | 2KB 不可变日期库 | ![Stars](<<<https://img.shields.io/github/stars/iamkun/dayjs?style=flat-square&cacheSeconds=3600&t=1776450896763> |
| [date-fns](https://github.com/date-fns/date-fns) | 现代 JavaScript 日期工具库 | ![Stars](<<<https://img.shields.io/github/stars/date-fns/date-fns?style=flat-square&cacheSeconds=3600&t=1776450896763> |
| [Zod](https://github.com/colinhacks/zod) | TypeScript 优先的模式验证与静态类型推断 | ![Stars](<<<https://img.shields.io/github/stars/colinhacks/zod?style=flat-square&cacheSeconds=3600&t=1776450896763> |
| [tRPC](https://github.com/trpc/trpc) | 端到端的类型安全 API | ![Stars](<<<https://img.shields.io/github/stars/trpc/trpc?style=flat-square&cacheSeconds=3600&t=1776450896763> |

---

## 🧪 测试策略与配置

### 测试金字塔实现

```
    /\
   /  \     E2E 测试 (Playwright) - 关键用户流程
  /----\
 /      \   集成测试 (Vitest) - API/组件交互
/--------\
----------  单元测试 (Vitest) - 纯函数/工具类
```

### Vitest 单元测试配置

**vitest.config.ts**

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*'
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70,
        statements: 80
      }
    },
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
```

**测试配置 (tests/setup.ts)**

```typescript
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock 全局对象
global.matchMedia = vi.fn().mockImplementation(query => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))
```

**单元测试示例**

```typescript
// utils/calculate.test.ts
import { describe, it, expect } from 'vitest'
import { calculateTotal, applyDiscount } from './calculate'

describe('calculateTotal', () => {
  it('应该正确计算商品总价', () => {
    const items = [
      { price: 100, quantity: 2 },
      { price: 50, quantity: 1 }
    ]
    expect(calculateTotal(items)).toBe(250)
  })

  it('空购物车应该返回 0', () => {
    expect(calculateTotal([])).toBe(0)
  })
})

describe('applyDiscount', () => {
  it('应该正确应用折扣', () => {
    expect(applyDiscount(100, 20)).toBe(80)
  })

  it('折扣不能超过 100%', () => {
    expect(() => applyDiscount(100, 150)).toThrow('Invalid discount')
  })
})
```

**React 组件测试**

```typescript
// components/Button.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './Button'

describe('Button', () => {
  it('应该正确渲染按钮文本', () => {
    render(<Button>点击我</Button>)
    expect(screen.getByText('点击我')).toBeInTheDocument()
  })

  it('点击时应该触发 onClick 事件', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>点击</Button>)

    fireEvent.click(screen.getByText('点击'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('禁用时应该不可点击', () => {
    const handleClick = vi.fn()
    render(<Button disabled onClick={handleClick}>禁用</Button>)

    fireEvent.click(screen.getByText('禁用'))
    expect(handleClick).not.toHaveBeenCalled()
  })
})
```

**API 测试 (MSW Mock)**

```typescript
// tests/mocks/handlers.ts
import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('/api/user', () => {
    return HttpResponse.json({
      id: '1',
      name: 'John Doe',
      email: 'john@example.com'
    })
  }),

  http.post('/api/login', async ({ request }) => {
    const body = await request.json()

    if (body.email === 'test@example.com' && body.password === 'password') {
      return HttpResponse.json({ token: 'fake-jwt-token' })
    }

    return new HttpResponse(null, { status: 401 })
  })
]
```

---

### Playwright E2E 测试配置

**playwright.config.ts**

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] }
    }
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI
  }
})
```

**E2E 测试示例**

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test'

test.describe('认证流程', () => {
  test('用户应该能登录', async ({ page }) => {
    await page.goto('/login')

    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'password')
    await page.click('button[type="submit"]')

    // 验证跳转
    await expect(page).toHaveURL('/dashboard')

    // 验证用户信息显示
    await expect(page.locator('[data-testid="user-name"]')).toContainText('Test User')
  })

  test('错误密码应该显示错误信息', async ({ page }) => {
    await page.goto('/login')

    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'wrong-password')
    await page.click('button[type="submit"]')

    await expect(page.locator('[data-testid="error-message"]')).toContainText('Invalid credentials')
  })
})

test.describe('购物车流程', () => {
  test('用户应该能添加商品到购物车并结账', async ({ page }) => {
    await page.goto('/products')

    // 添加商品
    await page.click('[data-testid="add-to-cart-1"]')
    await page.click('[data-testid="add-to-cart-2"]')

    // 去购物车
    await page.click('[data-testid="cart-button"]')
    await expect(page).toHaveURL('/cart')

    // 验证商品
    await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(2)

    // 结账
    await page.click('[data-testid="checkout-button"]')
    await expect(page).toHaveURL('/checkout')
  })
})
```

---

### 测试最佳实践

**测试命名规范**

```typescript
// ❌ 不好的命名
test('works', () => {})
test('test1', () => {})

// ✅ 好的命名
test('当用户点击提交按钮时应该创建新订单', () => {})
test('当库存不足时应该显示错误提示', () => {})
```

**测试数据工厂**

```typescript
// tests/factories/user.ts
import { faker } from '@faker-js/faker'

export function createUser(override = {}) {
  return {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    avatar: faker.image.avatar(),
    createdAt: faker.date.past(),
    ...override
  }
}

export function createProduct(override = {}) {
  return {
    id: faker.string.uuid(),
    name: faker.commerce.productName(),
    price: Number(faker.commerce.price()),
    description: faker.commerce.productDescription(),
    image: faker.image.url(),
    ...override
  }
}

// 使用
const user = createUser({ name: '特定测试用户' })
const products = Array.from({ length: 10 }, () => createProduct())
```

**覆盖率报告集成**

```yaml
# .github/workflows/test.yml
- name: Run tests with coverage
  run: npm run test:coverage

- name: Upload coverage to Codecov
  uses: codecov/codecov-action@v3
  with:
    file: ./coverage/lcov.info
    fail_ci_if_error: true
```

---

## 📚 代码实验室 (jsts-code-lab)

[jsts-code-lab](./jsts-code-lab/) 是本项目的核心实践部分，包含：

- **90+ 技术模块**：从基础语法到分布式系统
- **430+ TypeScript 文件**：完整的类型安全实现
- **理论 + 实践**：每个模块配有 THEOERY.md 和可运行代码
- **测试覆盖**：使用 Vitest 进行单元测试

### 模块分类

| 类别 | 模块范围 | 示例模块 |
|------|----------|----------|
| 🎓 语言核心 | 00-09 | 类型系统、设计模式、并发、数据结构 |
| 🛠️ 工程实践 | 10-29 | 性能测试、包管理、数据库 ORM |
| 🌐 全栈开发 | 30-49 | AI 集成、Web3、PWA、边缘计算 |
| 🤖 智能系统 | 50-59 | AI 驱动 UI、智能渲染、代码生成 |
| 🏢 企业架构 | 60-69 | API 网关、消息队列、多租户、插件系统 |
| 🌐 分布式 | 70-79 | 一致性算法、容器编排、量子计算 |
| 🔬 高级专题 | 80-89 | 形式化验证、网络安全、自动化系统 |

---

## 🎯 学习路径推荐

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           推荐学习路径                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  🎓 初学者 (4-6周)                                                           │
│  ├── 00-language-core: TypeScript 基础                                       │
│  ├── 02-design-patterns: 设计模式                                            │
│  ├── 07-testing: 单元测试                                                    │
│  └── 18-frontend-frameworks: 前端框架                                        │
│                              ↓                                               │
│  📈 进阶 (6-8周)                                                             │
│  ├── 06-architecture-patterns: 架构模式                                      │
│  ├── 03-concurrency: 并发编程                                                │
│  ├── 08-performance: 性能优化                                                │
│  └── 19-backend-development: 后端开发                                        │
│                              ↓                                               │
│  🎯 高级 (8-12周)                                                            │
│  ├── 70-distributed-systems: 分布式系统                                      │
│  ├── 71-consensus-algorithms: 一致性算法                                      │
│  └── 25-microservices: 微服务架构                                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

详细路径请参考：

- [初学者路径](./docs/learning-paths/beginners-path.md)
- [进阶路径](./docs/learning-paths/intermediate-path.md)
- [架构师路径](./docs/learning-paths/advanced-path.md)

---

## 📚 真实项目案例

### 案例一：电商平台（月活 50万）

**项目背景**

- 类型: B2C 电商平台
- 规模: 月活 50万，日均订单 5000+
- 团队: 8 人（2 前端 + 2 后端 + 2 全栈 + 1 产品 + 1 设计）

**技术栈**

```
前端: Next.js 14 + TypeScript + Tailwind + Zustand + React Query
后端: Next.js API Routes + tRPC + Prisma + PostgreSQL + Redis
部署: Vercel + AWS S3 + CloudFront
监控: Vercel Analytics + Sentry + LogRocket
```

**架构亮点**

1. **ISR + SSR 混合渲染**
   - 商品详情页: ISR (revalidate: 60s)
   - 用户中心: SSR (实时数据)
   - 首页: SSG + 客户端数据获取

2. **性能优化成果**
   - Lighthouse 评分: 92 (Performance)
   - 首屏加载: 1.2s (from 3.5s)
   - 转化率提升: 15%

3. **关键技术决策**
   - 状态管理: Zustand (替代 Redux，减少 60% 样板代码)
   - 图片优化: Next.js Image + WebP (减少 70% 图片体积)
   - 数据库: Prisma + 连接池 (查询性能提升 40%)

**核心代码示例**

```typescript
// 商品详情页 ISR
export async function generateStaticParams() {
  const products = await prisma.product.findMany({
    select: { id: true },
    take: 1000 // 预渲染前 1000 个商品
  })
  return products.map(p => ({ id: p.id }))
}

export const revalidate = 60

// 购物车乐观更新
const useCart = create<CartState>((set, get) => ({
  items: [],
  addItem: async (product) => {
    // 乐观更新
    set((state) => ({
      items: [...state.items, { ...product, quantity: 1 }]
    }))

    try {
      await api.cart.add(product.id)
    } catch {
      // 失败回滚
      set((state) => ({
        items: state.items.filter(i => i.id !== product.id)
      }))
    }
  }
}))
```

**遇到的挑战与解决方案**

| 挑战 | 解决方案 | 效果 |
|------|---------|------|
| 首屏加载慢 | 代码分割 + 图片优化 + ISR | LCP 从 3.5s 降到 1.2s |
| 购物车数据不同步 | 乐观更新 + 本地缓存 | 用户体验提升 |
| 搜索性能差 | Algolia + 防抖 | 搜索延迟 < 100ms |
| 支付超时 | 异步队列 + 重试机制 | 支付成功率 99.5% |

---

### 案例二：实时协作白板（团队 20 人同时编辑）

**项目背景**

- 类型: 在线白板工具（类似 Miro）
- 规模: 支持 20 人同时编辑，延迟 < 50ms
- 技术挑战: 实时同步、冲突解决、离线编辑

**技术栈**

```
前端: SvelteKit + TypeScript + Yjs + PartyKit
样式: Tailwind CSS + 自定义 Canvas 渲染
存储: Yjs CRDT + Supabase (持久化)
实时: PartyKit (WebSocket) + Yjs
部署: Vercel + PartyKit
```

**核心架构**

```
用户操作 → Yjs Doc → 本地更新 → PartyKit → 其他用户
              ↓
          自动冲突解决 (CRDT)
              ↓
         持久化到 Supabase
```

**关键技术实现**

1. **CRDT 文档结构**

```typescript
// yjs/document.ts
import * as Y from 'yjs'

export function createWhiteboardDoc() {
  const doc = new Y.Doc()

  // 形状集合
  const shapes = doc.getMap('shapes')

  // 用户光标位置
  const cursors = doc.getMap('cursors')

  // 视口信息
  const viewport = doc.getMap('viewport')

  return { doc, shapes, cursors, viewport }
}

// 添加形状
export function addShape(shapes: Y.Map<any>, shape: Shape) {
  shapes.set(shape.id, new Y.Map(Object.entries(shape)))
}

// 更新形状位置（实时同步）
export function moveShape(shapes: Y.Map<any>, id: string, x: number, y: number) {
  const shape = shapes.get(id)
  if (shape) {
    shape.set('x', x)
    shape.set('y', y)
  }
}
```

1. **PartyKit 同步**

```typescript
// party/whiteboard.ts
export default class WhiteboardServer implements Party.Server {
  doc = new Y.Doc()

  onConnect(conn: Party.Connection) {
    // 发送当前文档状态
    const state = Y.encodeStateAsUpdate(this.doc)
    conn.send(state)
  }

  onMessage(message: Uint8Array, sender: Party.Connection) {
    // 应用更新
    Y.applyUpdate(this.doc, message)

    // 广播给其他用户
    this.room.broadcast(message, [sender.id])

    // 持久化（防抖）
    this.debouncedSave()
  }

  debouncedSave = debounce(async () => {
    const state = Y.encodeStateAsUpdate(this.doc)
    await supabase.from('whiteboards')
      .update({ ydoc: state })
      .eq('id', this.room.id)
  }, 5000)
}
```

1. **离线支持**

```typescript
// hooks/useWhiteboard.ts
export function useWhiteboard(roomId: string) {
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    // 加载本地缓存
    const cached = localStorage.getItem(`doc-${roomId}`)
    if (cached) {
      Y.applyUpdate(doc, new Uint8Array(JSON.parse(cached)))
    }

    // 监听网络状态
    window.addEventListener('online', () => {
      setIsOffline(false)
      // 同步离线期间的更改
      syncPendingChanges()
    })

    window.addEventListener('offline', () => {
      setIsOffline(true)
    })

    // 定期本地保存
    const interval = setInterval(() => {
      const state = Y.encodeStateAsUpdate(doc)
      localStorage.setItem(`doc-${roomId}`, JSON.stringify(Array.from(state)))
    }, 1000)

    return () => clearInterval(interval)
  }, [roomId])

  return { isOffline, doc }
}
```

**性能数据**

- 同步延迟: < 50ms (P95)
- 内存占用: < 200MB (1000 个形状)
- 离线恢复: < 1s

---

### 案例三：AI 客服系统（日处理 1万+ 对话）

**项目背景**

- 类型: AI 智能客服系统
- 规模: 日处理 1万+ 对话，平均响应时间 < 3s
- 技术挑战: RAG 知识库、流式输出、上下文管理

**技术栈**

```
前端: Next.js 14 + Vercel AI SDK + Tailwind
后端: Next.js API + LangChain.js + OpenAI
向量库: Supabase Vector (pgvector)
缓存: Upstash Redis
部署: Vercel
```

**系统架构**

```
用户提问 → 向量化 → 相似度搜索 → 召回上下文 → LLM → 流式响应
                 ↓
            知识库 (Supabase Vector)
```

**核心实现**

1. **知识库构建**

```typescript
// scripts/ingest.ts
import { OpenAIEmbeddings } from '@langchain/openai'
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'

async function ingestDocuments(docs: Document[]) {
  // 文档分块
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200
  })
  const chunks = await splitter.splitDocuments(docs)

  // 向量化并存储
  const embeddings = new OpenAIEmbeddings()
  await SupabaseVectorStore.fromDocuments(chunks, embeddings, {
    client: supabase,
    tableName: 'documents'
  })
}
```

1. **聊天 API (流式)**

```typescript
// app/api/chat/route.ts
import { OpenAIStream, StreamingTextResponse } from 'ai'
import { OpenAI } from 'openai'

export async function POST(req: Request) {
  const { messages } = await req.json()
  const lastMessage = messages[messages.length - 1]

  // 检索相关上下文
  const relevantDocs = await vectorStore.similaritySearch(
    lastMessage.content,
    5
  )

  const context = relevantDocs.map(d => d.pageContent).join('\n')

  // 构建提示
  const prompt = `
    你是客服助手。基于以下知识回答问题：
    ${context}

    用户问题: ${lastMessage.content}
  `

  // 流式响应
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'system', content: prompt }, ...messages],
    stream: true
  })

  const stream = OpenAIStream(response)
  return new StreamingTextResponse(stream)
}
```

1. **上下文管理**

```typescript
// lib/conversation.ts
export async function manageConversation(
  sessionId: string,
  newMessage: Message
) {
  // 获取历史消息
  const history = await redis.lrange(`chat:${sessionId}`, 0, 9)
  const messages = history.map(h => JSON.parse(h))

  // 计算 token 数，必要时总结
  const totalTokens = estimateTokens(messages)
  if (totalTokens > 3000) {
    const summary = await summarizeConversation(messages.slice(0, -5))
    messages = [{ role: 'system', content: summary }, ...messages.slice(-5)]
  }

  // 保存新消息
  await redis.lpush(`chat:${sessionId}`, JSON.stringify(newMessage))
  await redis.expire(`chat:${sessionId}`, 60 * 60 * 24) // 24h TTL

  return messages
}
```

**运营数据**

- 问题解决率: 78% (无需人工介入)
- 平均响应时间: 2.3s
- 用户满意度: 4.2/5
- 成本: $0.15/对话

---

### 案例四：企业级 Monorepo（50+ 包，30+ 开发者）

**项目背景**

- 类型: 金融 SaaS 平台
- 规模: 50+ 内部包，30+ 开发者，10+ 应用
- 技术挑战: 构建性能、代码复用、版本管理

**技术栈**

```
Monorepo: Nx + pnpm + TypeScript
应用: Next.js + React
组件库: 内部设计系统 (基于 Radix UI)
工具链: ESLint + Prettier + Husky + Changesets
CI/CD: GitHub Actions + AWS CodePipeline
```

**Monorepo 结构**

```
packages/
├── ui/                 # 设计系统组件
├── utils/              # 共享工具函数
├── hooks/              # 共享 React Hooks
├── types/              # 共享类型定义
├── eslint-config/      # 共享 ESLint 配置
└── tsconfig/           # 共享 TS 配置

apps/
├── web/                # 主站
├── admin/              # 管理后台
├── api/                # API 服务
└── docs/               # 文档站点
tools/
└── generators/         # Nx 代码生成器
```

**关键配置**

1. **Nx 任务管道**

```json
{
  "targetDefaults": {
    "build": {
      "dependsOn": ["^build"],
      "cache": true,
      "outputs": ["{projectRoot}/dist"]
    },
    "test": {
      "cache": true,
      "inputs": ["default", "^default"]
    },
    "lint": {
      "cache": true
    }
  },
  "parallel": 8,
  "cacheDirectory": ".nx/cache"
}
```

1. **变更集管理**

```bash
# 创建变更
npx changeset

# 版本更新
npx changeset version

# 发布
npx changeset publish
```

1. **构建优化**

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    target: 'es2022',
    rollupOptions: {
      // 外部化依赖
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        }
      }
    }
  }
})
```

**成果**

- 构建时间: 从 15min 优化到 3min (Nx 缓存)
- 代码复用率: 60%+ (共享包)
- 发布频率: 每周 20+ 次 (自动化)
- 开发者满意度: 显著提升

**经验教训**

1. 尽早定义清晰的包边界
2. 强制代码审查 + CI 检查
3. 定期清理无用依赖
4. 文档即代码 (Docs 应用)

---

## 🆕 最新动态

### v1.3.0 更新要点

- **6 个全新对比矩阵**：包管理器、Monorepo 工具、可观测性工具、部署平台、CI/CD 工具、浏览器兼容性
- **8 个全新决策树**：覆盖包管理器、Monorepo、全栈框架、实时通信、认证方案、CSS 方案、运行时、CI/CD 选型
- **3 个大型知识图谱**：语言核心知识图谱、工程实践知识图谱、生态系统全景图谱
- **2 部全新指南**：[Web APIs 完全指南](./docs/guides/web-apis-guide.md)、[Node.js 核心模块指南](./docs/guides/nodejs-core-modules-guide.md)
- **5 个运维与工程基建分类**：新增分类体系覆盖部署、监控、安全、性能、工作流
- **代码实验室扩容**：从 83+ 扩展至 **90+ 技术模块**

---

## 🤝 贡献指南

我们欢迎各种形式的贡献！请阅读 [CONTRIBUTING.md](./CONTRIBUTING.md) 了解如何参与。

### 贡献类型

- 🆕 添加新的资源或工具
- 📝 改进文档和说明
- 🐛 修复错误或过时链接
- 💡 提出新的想法和建议

---

## 📄 许可证

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

本项目采用 [MIT 许可证](LICENSE) 开源。

---

<p align="center">
  <b>⭐ 如果这个项目对你有帮助，请给我们一个 Star！</b>
</p>

<p align="center">
  <sub>Made with ❤️ by the JS/TS Community</sub>
</p>
