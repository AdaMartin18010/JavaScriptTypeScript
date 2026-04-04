# Awesome JavaScript/TypeScript Ecosystem [![Awesome](https://awesome.re/badge.svg)](https://awesome.re)

<p align="center">
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/javascript/javascript-original.svg" width="60" alt="JavaScript" />
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/typescript/typescript-original.svg" width="60" alt="TypeScript" />
</p>

<p align="center">
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white" alt="Node.js" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License: MIT" /></a>
</p>

> 精心策划的 JavaScript/TypeScript 生态系统资源列表，涵盖框架、工具、库和最佳实践。

## 📚 目录

- [🌟 收录标准](#-收录标准)
- [⚡ 快速开始](#-快速开始)
- [📦 框架与运行时](#-框架与运行时)
  - [Web 框架](#web-框架)
  - [全栈框架](#全栈框架)
  - [运行时](#运行时)
- [🔧 开发工具](#-开发工具)
  - [构建工具](#构建工具)
  - [代码质量](#代码质量)
  - [测试框架](#测试框架)
- [📊 数据与存储](#-数据与存储)
  - [ORM 与数据库工具](#orm-与数据库工具)
  - [缓存与消息队列](#缓存与消息队列)
- [🔐 安全与认证](#-安全与认证)
- [🚀 部署与运维](#-部署与运维)
- [🧩 实用库](#-实用库)
- [📝 贡献指南](#-贡献指南)

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

```bash
# 克隆仓库
git clone https://github.com/yourusername/awesome-jsts-ecosystem.git

# 浏览分类
# 点击上方目录快速跳转到感兴趣的部分
```

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
| [tsc](https://github.com/microsoft/TypeScript) | TypeScript 编译器 | ![Stars](https://img.shields.io/github/stars/microsoft/TypeScript?style=flat-square) |
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
| [Mocha](https://github.com/mochajs/mocha) | Node.js 和浏览器的功能丰富的测试框架 | ![Stars](https://img.shields.io/github/stars/mochajs/mocha?style=flat-square) |

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
| [0x](https://github.com/davidmarkclements/0x) | 零配置火焰图生成 | ![Stars](https://img.shields.io/github/stars/davidmarkclements/0x?style=flat-square) |

---

## 🧩 实用库

| 项目 | 描述 | Stars |
|------|------|-------|
| [Lodash](https://github.com/lodash/lodash) | 现代 JavaScript 实用工具库 | ![Stars](https://img.shields.io/github/stars/lodash/lodash?style=flat-square) |
| [Ramda](https://github.com/ramda/ramda) | 函数式编程实用工具库 | ![Stars](https://img.shields.io/github/stars/ramda/ramda?style=flat-square) |
| [Day.js](https://github.com/iamkun/dayjs) | 2KB 不可变日期库 | ![Stars](https://img.shields.io/github/stars/iamkun/dayjs?style=flat-square) |
| [date-fns](https://github.com/date-fns/date-fns) | 现代 JavaScript 日期工具库 | ![Stars](https://img.shields.io/github/stars/date-fns/date-fns?style=flat-square) |
| [Zod](https://github.com/colinhacks/zod) | TypeScript 优先的模式验证与静态类型推断 | ![Stars](https://img.shields.io/github/stars/colinhacks/zod?style=flat-square) |
| [Zodios](https://github.com/ecyrbe/zodios) | 端到端的类型安全 REST API 工具 | ![Stars](https://img.shields.io/github/stars/ecyrbe/zodios?style=flat-square) |
| [tRPC](https://github.com/trpc/trpc) | 端到端的类型安全 API | ![Stars](https://img.shields.io/github/stars/trpc/trpc?style=flat-square) |
| [tsx](https://github.com/privatenumber/tsx) | TypeScript 执行和重载工具 | ![Stars](https://img.shields.io/github/stars/privatenumber/tsx?style=flat-square) |

---

## 📝 贡献指南

欢迎贡献！请阅读 [CONTRIBUTING.md](./CONTRIBUTING.md) 了解如何提交资源。

## 📄 许可证

[![CC0](https://licensebuttons.net/p/zero/1.0/88x31.png)](LICENSE)

本项目采用 [MIT 许可证](LICENSE) 开源。

---

<p align="center">
  如果觉得这个项目有帮助，请 ⭐ Star 支持一下！
</p>
