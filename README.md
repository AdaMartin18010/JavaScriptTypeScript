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
> 📚 配套代码实验室：[jsts-code-lab](./jsts-code-lab/) - 80+ 模块，280+ TypeScript 文件，从理论到实践的完整实现

---

## 📖 文档导航

### 🗺️ 项目整体架构

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    JavaScript/TypeScript 全景知识库                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────┐ │
│  │ awesome-jsts-       │    │   jsts-code-lab     │    │   学习路径文档   │ │
│  │   ecosystem         │    │  (代码实验室)        │    │   (Learning     │ │
│  │                     │    │                     │    │     Paths)      │ │
│  │ • 生态工具导航       │    │ • 80+ 技术模块       │    │                 │ │
│  │ • 框架对比          │    │ • 280+ TS 实现      │    │ • 初学者路径     │ │
│  │ • 最佳实践          │    │ • 理论+实践结合      │    │ • 进阶路径       │ │
│  │ • 资源收录          │    │ • 可运行示例        │    │ • 架构师路径     │ │
│  └─────────────────────┘    └─────────────────────┘    └─────────────────┘ │
│           │                          │                      │              │
│           └──────────────────────────┼──────────────────────┘              │
│                                      │                                     │
│                                      ▼                                     │
│                           ┌─────────────────────┐                          │
│                           │    GLOSSARY.md      │                          │
│                           │    (术语表)          │                          │
│                           └─────────────────────┘                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 📂 快速链接

| 文档 | 描述 | 目标读者 |
|------|------|----------|
| [📦 awesome-jsts-ecosystem](./awesome-jsts-ecosystem/) | JS/TS 生态工具导航 | 所有开发者 |
| [🧪 jsts-code-lab](./jsts-code-lab/) | 代码实验室（80+ 模块） | 实践学习者 |
| [📚 jsts-code-lab/CROSS-REFERENCE.md](./jsts-code-lab/CROSS-REFERENCE.md) | 模块交叉引用索引 | 系统学习者 |
| [📖 GLOSSARY.md](./GLOSSARY.md) | 专业术语表（中英对照） | 所有读者 |
| [🎓 beginners-path.md](./docs/learning-paths/beginners-path.md) | 初学者学习路径 | 初学者 |
| [📈 intermediate-path.md](./docs/learning-paths/intermediate-path.md) | 进阶学习路径 | 中级开发者 |
| [🎯 advanced-path.md](./docs/learning-paths/advanced-path.md) | 架构师学习路径 | 高级开发者 |
| [🤝 CONTRIBUTING.md](./CONTRIBUTING.md) | 贡献指南 | 贡献者 |

---

## 🌟 收录标准

本项目收录的资源需满足以下条件：

- ⭐ **GitHub Stars > 1000**（特殊优秀项目除外）
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
| [Express](https://github.com/expressjs/express) | 快速、无约束、极简的 Node.js Web 框架 | ![Stars](https://img.shields.io/github/stars/expressjs/express?style=flat-square) |
| [Fastify](https://github.com/fastify/fastify) | 快速且低开销的 Web 框架 | ![Stars](https://img.shields.io/github/stars/fastify/fastify?style=flat-square) |
| [NestJS](https://github.com/nestjs/nest) | 渐进式 Node.js 框架，用于构建高效、可靠和可扩展的服务器端应用程序 | ![Stars](https://img.shields.io/github/stars/nestjs/nest?style=flat-square) |
| [Koa](https://github.com/koajs/koa) | 由 Express 原班团队打造的下一代 Web 框架 | ![Stars](https://img.shields.io/github/stars/koajs/koa?style=flat-square) |
| [Hono](https://github.com/honojs/hono) | 超轻量级、超快速的 Web 框架，支持多种运行时 | ![Stars](https://img.shields.io/github/stars/honojs/hono?style=flat-square) |
| [Elysia](https://github.com/elysiajs/elysia) | 基于 Bun 的快速、友好的后端框架 | ![Stars](https://img.shields.io/github/stars/elysiajs/elysia?style=flat-square) |

### 全栈框架

| 项目 | 描述 | Stars |
|------|------|-------|
| [Next.js](https://github.com/vercel/next.js) | React 全栈框架 | ![Stars](https://img.shields.io/github/stars/vercel/next.js?style=flat-square) |
| [Nuxt](https://github.com/nuxt/nuxt) | 基于 Vue 的直观 Web 框架 | ![Stars](https://img.shields.io/github/stars/nuxt/nuxt?style=flat-square) |
| [SvelteKit](https://github.com/sveltejs/kit) | Svelte 全栈框架 | ![Stars](https://img.shields.io/github/stars/sveltejs/kit?style=flat-square) |
| [Remix](https://github.com/remix-run/remix) | 专注于 Web 标准的全栈框架 | ![Stars](https://img.shields.io/github/stars/remix-run/remix?style=flat-square) |
| [Astro](https://github.com/withastro/astro) | 内容驱动的快速网站构建框架 | ![Stars](https://img.shields.io/github/stars/withastro/astro?style=flat-square) |

### 运行时

| 项目 | 描述 | Stars |
|------|------|-------|
| [Node.js](https://github.com/nodejs/node) | JavaScript 运行时 | ![Stars](https://img.shields.io/github/stars/nodejs/node?style=flat-square) |
| [Deno](https://github.com/denoland/deno) | 现代 JavaScript/TypeScript 运行时 | ![Stars](https://img.shields.io/github/stars/denoland/deno?style=flat-square) |
| [Bun](https://github.com/oven-sh/bun) | 极速 JavaScript 运行时、打包器、测试运行器 | ![Stars](https://img.shields.io/github/stars/oven-sh/bun?style=flat-square) |

---

## 🔧 开发工具

### 构建工具

| 项目 | 描述 | Stars |
|------|------|-------|
| [Vite](https://github.com/vitejs/vite) | 下一代前端工具链 | ![Stars](https://img.shields.io/github/stars/vitejs/vite?style=flat-square) |
| [esbuild](https://github.com/evanw/esbuild) | 极速 JavaScript 打包器 | ![Stars](https://img.shields.io/github/stars/evanw/esbuild?style=flat-square) |
| [swc](https://github.com/swc-project/swc) | 基于 Rust 的超快速 JavaScript/TypeScript 编译器 | ![Stars](https://img.shields.io/github/stars/swc-project/swc?style=flat-square) |
| [Turbopack](https://github.com/vercel/turbopack) | Rust 编写的增量打包工具 | ![Stars](https://img.shields.io/github/stars/vercel/turbopack?style=flat-square) |
| [Rollup](https://github.com/rollup/rollup) | JavaScript 模块打包器 | ![Stars](https://img.shields.io/github/stars/rollup/rollup?style=flat-square) |

### 代码质量

| 项目 | 描述 | Stars |
|------|------|-------|
| [ESLint](https://github.com/eslint/eslint) | 可插拔的 JavaScript 代码检查工具 | ![Stars](https://img.shields.io/github/stars/eslint/eslint?style=flat-square) |
| [Prettier](https://github.com/prettier/prettier) | 代码格式化工具 | ![Stars](https://img.shields.io/github/stars/prettier/prettier?style=flat-square) |
| [Biome](https://github.com/biomejs/biome) | 快速格式化器和检查工具 | ![Stars](https://img.shields.io/github/stars/biomejs/biome?style=flat-square) |
| [TypeScript-ESLint](https://github.com/typescript-eslint/typescript-eslint) | TypeScript 的 ESLint 工具 | ![Stars](https://img.shields.io/github/stars/typescript-eslint/typescript-eslint?style=flat-square) |

### 测试框架

| 项目 | 描述 | Stars |
|------|------|-------|
| [Jest](https://github.com/jestjs/jest) | 令人愉快的 JavaScript 测试框架 | ![Stars](https://img.shields.io/github/stars/jestjs/jest?style=flat-square) |
| [Vitest](https://github.com/vitest-dev/vitest) | 由 Vite 驱动的极速单元测试框架 | ![Stars](https://img.shields.io/github/stars/vitest-dev/vitest?style=flat-square) |
| [Playwright](https://github.com/microsoft/playwright) | 可靠的端到端测试框架 | ![Stars](https://img.shields.io/github/stars/microsoft/playwright?style=flat-square) |
| [Cypress](https://github.com/cypress-io/cypress) | 为现代 Web 构建的下一代前端测试工具 | ![Stars](https://img.shields.io/github/stars/cypress-io/cypress?style=flat-square) |

---

## 📊 数据与存储

### ORM 与数据库工具

| 项目 | 描述 | Stars |
|------|------|-------|
| [Prisma](https://github.com/prisma/prisma) | 下一代 ORM | ![Stars](https://img.shields.io/github/stars/prisma/prisma?style=flat-square) |
| [TypeORM](https://github.com/typeorm/typeorm) | 支持 TypeScript 的 ORM | ![Stars](https://img.shields.io/github/stars/typeorm/typeorm?style=flat-square) |
| [Drizzle](https://github.com/drizzle-team/drizzle-orm) | TypeScript ORM，以类型安全和 SQL 风格著称 | ![Stars](https://img.shields.io/github/stars/drizzle-team/drizzle-orm?style=flat-square) |
| [Sequelize](https://github.com/sequelize/sequelize) | 基于 Promise 的 Node.js ORM | ![Stars](https://img.shields.io/github/stars/sequelize/sequelize?style=flat-square) |
| [Mongoose](https://github.com/Automattic/mongoose) | MongoDB 对象建模 | ![Stars](https://img.shields.io/github/stars/Automattic/mongoose?style=flat-square) |

### 缓存与消息队列

| 项目 | 描述 | Stars |
|------|------|-------|
| [ioredis](https://github.com/redis/ioredis) | 强大的 Redis 客户端 | ![Stars](https://img.shields.io/github/stars/redis/ioredis?style=flat-square) |
| [Bull](https://github.com/OptimalBits/bull) | 基于 Redis 的 Node.js 队列系统 | ![Stars](https://img.shields.io/github/stars/OptimalBits/bull?style=flat-square) |
| [BullMQ](https://github.com/taskforcesh/bullmq) | Bull 的 TypeScript 重写版 | ![Stars](https://img.shields.io/github/stars/taskforcesh/bullmq?style=flat-square) |

---

## 🔐 安全与认证

| 项目 | 描述 | Stars |
|------|------|-------|
| [Passport](https://github.com/jaredhanson/passport) | Node.js 的简洁、灵活的认证中间件 | ![Stars](https://img.shields.io/github/stars/jaredhanson/passport?style=flat-square) |
| [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) | JSON Web Token 实现 | ![Stars](https://img.shields.io/github/stars/auth0/node-jsonwebtoken?style=flat-square) |
| [bcrypt](https://github.com/kelektiv/node.bcrypt.js) | bcrypt 库 | ![Stars](https://img.shields.io/github/stars/kelektiv/node.bcrypt.js?style=flat-square) |
| [Helmet](https://github.com/helmetjs/helmet) | 帮助保护 Express 应用的安全中间件 | ![Stars](https://img.shields.io/github/stars/helmetjs/helmet?style=flat-square) |
| [CORS](https://github.com/expressjs/cors) | Node.js CORS 中间件 | ![Stars](https://img.shields.io/github/stars/expressjs/cors?style=flat-square) |

---

## 🚀 部署与运维

| 项目 | 描述 | Stars |
|------|------|-------|
| [PM2](https://github.com/Unitech/pm2) | Node.js 进程管理器 | ![Stars](https://img.shields.io/github/stars/Unitech/pm2?style=flat-square) |
| [Dockerode](https://github.com/apocas/dockerode) | Docker 远程 API 的 Node.js 库 | ![Stars](https://img.shields.io/github/stars/apocas/dockerode?style=flat-square) |
| [Clinic.js](https://github.com/clinicjs/node-clinic) | Node.js 性能诊断工具 | ![Stars](https://img.shields.io/github/stars/clinicjs/node-clinic?style=flat-square) |

---

## 🧩 实用库

| 项目 | 描述 | Stars |
|------|------|-------|
| [Lodash](https://github.com/lodash/lodash) | 现代 JavaScript 实用工具库 | ![Stars](https://img.shields.io/github/stars/lodash/lodash?style=flat-square) |
| [Ramda](https://github.com/ramda/ramda) | 函数式编程实用工具库 | ![Stars](https://img.shields.io/github/stars/ramda/ramda?style=flat-square) |
| [Day.js](https://github.com/iamkun/dayjs) | 2KB 不可变日期库 | ![Stars](https://img.shields.io/github/stars/iamkun/dayjs?style=flat-square) |
| [date-fns](https://github.com/date-fns/date-fns) | 现代 JavaScript 日期工具库 | ![Stars](https://img.shields.io/github/stars/date-fns/date-fns?style=flat-square) |
| [Zod](https://github.com/colinhacks/zod) | TypeScript 优先的模式验证与静态类型推断 | ![Stars](https://img.shields.io/github/stars/colinhacks/zod?style=flat-square) |
| [tRPC](https://github.com/trpc/trpc) | 端到端的类型安全 API | ![Stars](https://img.shields.io/github/stars/trpc/trpc?style=flat-square) |

---

## 📚 代码实验室 (jsts-code-lab)

[jsts-code-lab](./jsts-code-lab/) 是本项目的核心实践部分，包含：

- **80+ 技术模块**：从基础语法到分布式系统
- **280+ TypeScript 文件**：完整的类型安全实现
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
