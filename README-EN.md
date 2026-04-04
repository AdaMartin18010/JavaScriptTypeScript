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

> A curated list of high-quality resources in the JavaScript/TypeScript ecosystem, covering frameworks, tools, libraries, and best practices. TypeScript-first approach.

<p align="center">
  <a href="README.md">🇨🇳 中文</a> | <strong>🇺🇸 English</strong>
</p>

---

## 📖 Overview

This project aims to be a comprehensive, TypeScript-first resource collection that rivals [awesome-nodejs](https://github.com/sindresorhus/awesome-nodejs) and [awesome-javascript](https://github.com/sorrycc/awesome-javascript).

### Why This List?

- 🎯 **TypeScript-First**: Prioritizing tools and libraries with first-class TypeScript support
- 🔥 **Actively Maintained**: All resources are regularly updated and maintained
- ⭐ **Quality Filtered**: Only includes battle-tested, production-ready tools
- 🌍 **Bilingual Support**: Available in both Chinese and English

---

## 📚 Table of Contents

- [🌟 Inclusion Criteria](#-inclusion-criteria)
- [⚡ Quick Start](#-quick-start)
- [📦 Frameworks & Runtimes](#-frameworks--runtimes)
  - [Web Frameworks](#web-frameworks)
  - [Full-Stack Frameworks](#full-stack-frameworks)
  - [Runtimes](#runtimes)
- [🔧 Development Tools](#-development-tools)
  - [Build Tools](#build-tools)
  - [Code Quality](#code-quality)
  - [Testing Frameworks](#testing-frameworks)
- [📊 Data & Storage](#-data--storage)
  - [ORM & Database Tools](#orm--database-tools)
  - [Caching & Message Queues](#caching--message-queues)
- [🔐 Security & Authentication](#-security--authentication)
- [🚀 Deployment & DevOps](#-deployment--devops)
- [🧩 Utility Libraries](#-utility-libraries)
- [📝 Contribution Guidelines](#-contribution-guidelines)
- [📄 License](#-license)

---

## 🌟 Inclusion Criteria

Resources included in this project must meet the following criteria:

| Criterion | Requirement |
|-----------|-------------|
| ⭐ **GitHub Stars** | > 1000 (exceptions for exceptional projects) |
| 🔄 **Actively Maintained** | Updated within the last 6 months |
| 📘 **TypeScript Support** | Native support or type definitions provided |
| ✅ **Production-Ready** | Has real-world production use cases |

[View Full Criteria](./CONTRIBUTING.md#inclusion-criteria)

---

## ⚡ Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/awesome-jsts-ecosystem.git

# Browse categories
# Click the Table of Contents above to jump to sections of interest
```

---

## 📦 Frameworks & Runtimes

### Web Frameworks

| Project | Description | Stars |
|---------|-------------|-------|
| [Express](https://github.com/expressjs/express) | Fast, unopinionated, minimalist web framework for Node.js | ![Stars](https://img.shields.io/github/stars/expressjs/express?style=flat-square) |
| [Fastify](https://github.com/fastify/fastify) | Fast and low overhead web framework | ![Stars](https://img.shields.io/github/stars/fastify/fastify?style=flat-square) |
| [NestJS](https://github.com/nestjs/nest) | Progressive Node.js framework for building efficient and scalable server-side applications | ![Stars](https://img.shields.io/github/stars/nestjs/nest?style=flat-square) |
| [Koa](https://github.com/koajs/koa) | Next-generation web framework by the Express team | ![Stars](https://img.shields.io/github/stars/koajs/koa?style=flat-square) |
| [Hono](https://github.com/honojs/hono) | Ultra-lightweight, ultra-fast web framework for multiple runtimes | ![Stars](https://img.shields.io/github/stars/honojs/hono?style=flat-square) |
| [Elysia](https://github.com/elysiajs/elysia) | Fast, friendly backend framework powered by Bun | ![Stars](https://img.shields.io/github/stars/elysiajs/elysia?style=flat-square) |

### Full-Stack Frameworks

| Project | Description | Stars |
|---------|-------------|-------|
| [Next.js](https://github.com/vercel/next.js) | The React Framework for Full-Stack Applications | ![Stars](https://img.shields.io/github/stars/vercel/next.js?style=flat-square) |
| [Nuxt](https://github.com/nuxt/nuxt) | The Intuitive Vue Framework | ![Stars](https://img.shields.io/github/stars/nuxt/nuxt?style=flat-square) |
| [SvelteKit](https://github.com/sveltejs/kit) | Full-stack framework for Svelte | ![Stars](https://img.shields.io/github/stars/sveltejs/kit?style=flat-square) |
| [Remix](https://github.com/remix-run/remix) | Full-stack framework focused on web standards | ![Stars](https://img.shields.io/github/stars/remix-run/remix?style=flat-square) |
| [Astro](https://github.com/withastro/astro) | Framework for content-driven fast websites | ![Stars](https://img.shields.io/github/stars/withastro/astro?style=flat-square) |

### Runtimes

| Project | Description | Stars |
|---------|-------------|-------|
| [Node.js](https://github.com/nodejs/node) | JavaScript runtime built on Chrome's V8 engine | ![Stars](https://img.shields.io/github/stars/nodejs/node?style=flat-square) |
| [Deno](https://github.com/denoland/deno) | Modern JavaScript/TypeScript runtime with security defaults | ![Stars](https://img.shields.io/github/stars/denoland/deno?style=flat-square) |
| [Bun](https://github.com/oven-sh/bun) | Fast JavaScript runtime, bundler, test runner | ![Stars](https://img.shields.io/github/stars/oven-sh/bun?style=flat-square) |

---

## 🔧 Development Tools

### Build Tools

| Project | Description | Stars |
|---------|-------------|-------|
| [Vite](https://github.com/vitejs/vite) | Next-generation frontend tooling | ![Stars](https://img.shields.io/github/stars/vitejs/vite?style=flat-square) |
| [esbuild](https://github.com/evanw/esbuild) | Extremely fast JavaScript bundler | ![Stars](https://img.shields.io/github/stars/evanw/esbuild?style=flat-square) |
| [tsc](https://github.com/microsoft/TypeScript) | TypeScript compiler | ![Stars](https://img.shields.io/github/stars/microsoft/TypeScript?style=flat-square) |
| [swc](https://github.com/swc-project/swc) | Rust-based super-fast JavaScript/TypeScript compiler | ![Stars](https://img.shields.io/github/stars/swc-project/swc?style=flat-square) |
| [Turbopack](https://github.com/vercel/turbopack) | Incremental bundler written in Rust | ![Stars](https://img.shields.io/github/stars/vercel/turbopack?style=flat-square) |
| [Rollup](https://github.com/rollup/rollup) | JavaScript module bundler | ![Stars](https://img.shields.io/github/stars/rollup/rollup?style=flat-square) |

### Code Quality

| Project | Description | Stars |
|---------|-------------|-------|
| [ESLint](https://github.com/eslint/eslint) | Pluggable JavaScript linter | ![Stars](https://img.shields.io/github/stars/eslint/eslint?style=flat-square) |
| [Prettier](https://github.com/prettier/prettier) | Opinionated code formatter | ![Stars](https://img.shields.io/github/stars/prettier/prettier?style=flat-square) |
| [Biome](https://github.com/biomejs/biome) | Fast formatter and linter | ![Stars](https://img.shields.io/github/stars/biomejs/biome?style=flat-square) |
| [TypeScript-ESLint](https://github.com/typescript-eslint/typescript-eslint) | TypeScript tooling for ESLint | ![Stars](https://img.shields.io/github/stars/typescript-eslint/typescript-eslint?style=flat-square) |

### Testing Frameworks

| Project | Description | Stars |
|---------|-------------|-------|
| [Jest](https://github.com/jestjs/jest) | Delightful JavaScript testing framework | ![Stars](https://img.shields.io/github/stars/jestjs/jest?style=flat-square) |
| [Vitest](https://github.com/vitest-dev/vitest) | Blazing fast unit testing powered by Vite | ![Stars](https://img.shields.io/github/stars/vitest-dev/vitest?style=flat-square) |
| [Playwright](https://github.com/microsoft/playwright) | Reliable end-to-end testing framework | ![Stars](https://img.shields.io/github/stars/microsoft/playwright?style=flat-square) |
| [Cypress](https://github.com/cypress-io/cypress) | Next-generation frontend testing tool | ![Stars](https://img.shields.io/github/stars/cypress-io/cypress?style=flat-square) |
| [Mocha](https://github.com/mochajs/mocha) | Feature-rich JavaScript test framework for Node.js and browsers | ![Stars](https://img.shields.io/github/stars/mochajs/mocha?style=flat-square) |

---

## 📊 Data & Storage

### ORM & Database Tools

| Project | Description | Stars |
|---------|-------------|-------|
| [Prisma](https://github.com/prisma/prisma) | Next-generation ORM | ![Stars](https://img.shields.io/github/stars/prisma/prisma?style=flat-square) |
| [TypeORM](https://github.com/typeorm/typeorm) | ORM for TypeScript and JavaScript | ![Stars](https://img.shields.io/github/stars/typeorm/typeorm?style=flat-square) |
| [Drizzle](https://github.com/drizzle-team/drizzle-orm) | TypeScript ORM known for type safety and SQL-like syntax | ![Stars](https://img.shields.io/github/stars/drizzle-team/drizzle-orm?style=flat-square) |
| [Sequelize](https://github.com/sequelize/sequelize) | Promise-based Node.js ORM | ![Stars](https://img.shields.io/github/stars/sequelize/sequelize?style=flat-square) |
| [Mongoose](https://github.com/Automattic/mongoose) | MongoDB object modeling for Node.js | ![Stars](https://img.shields.io/github/stars/Automattic/mongoose?style=flat-square) |

### Caching & Message Queues

| Project | Description | Stars |
|---------|-------------|-------|
| [ioredis](https://github.com/redis/ioredis) | Robust Redis client for Node.js | ![Stars](https://img.shields.io/github/stars/redis/ioredis?style=flat-square) |
| [Bull](https://github.com/OptimalBits/bull) | Redis-based queue system for Node.js | ![Stars](https://img.shields.io/github/stars/OptimalBits/bull?style=flat-square) |
| [BullMQ](https://github.com/taskforcesh/bullmq) | TypeScript rewrite of Bull | ![Stars](https://img.shields.io/github/stars/taskforcesh/bullmq?style=flat-square) |

---

## 🔐 Security & Authentication

| Project | Description | Stars |
|---------|-------------|-------|
| [Passport](https://github.com/jaredhanson/passport) | Simple, flexible authentication middleware for Node.js | ![Stars](https://img.shields.io/github/stars/jaredhanson/passport?style=flat-square) |
| [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) | JSON Web Token implementation | ![Stars](https://img.shields.io/github/stars/auth0/node-jsonwebtoken?style=flat-square) |
| [bcrypt](https://github.com/kelektiv/node.bcrypt.js) | Library for hashing passwords | ![Stars](https://img.shields.io/github/stars/kelektiv/node.bcrypt.js?style=flat-square) |
| [Helmet](https://github.com/helmetjs/helmet) | Security middleware for Express apps | ![Stars](https://img.shields.io/github/stars/helmetjs/helmet?style=flat-square) |
| [CORS](https://github.com/expressjs/cors) | CORS middleware for Node.js | ![Stars](https://img.shields.io/github/stars/expressjs/cors?style=flat-square) |

---

## 🚀 Deployment & DevOps

| Project | Description | Stars |
|---------|-------------|-------|
| [PM2](https://github.com/Unitech/pm2) | Node.js process manager | ![Stars](https://img.shields.io/github/stars/Unitech/pm2?style=flat-square) |
| [Dockerode](https://github.com/apocas/dockerode) | Docker remote API client for Node.js | ![Stars](https://img.shields.io/github/stars/apocas/dockerode?style=flat-square) |
| [Clinic.js](https://github.com/clinicjs/node-clinic) | Node.js performance diagnostics tool | ![Stars](https://img.shields.io/github/stars/clinicjs/node-clinic?style=flat-square) |
| [0x](https://github.com/davidmarkclements/0x) | Zero-config flamegraph generation | ![Stars](https://img.shields.io/github/stars/davidmarkclements/0x?style=flat-square) |

---

## 🧩 Utility Libraries

| Project | Description | Stars |
|---------|-------------|-------|
| [Lodash](https://github.com/lodash/lodash) | Modern JavaScript utility library | ![Stars](https://img.shields.io/github/stars/lodash/lodash?style=flat-square) |
| [Ramda](https://github.com/ramda/ramda) | Functional programming utility library | ![Stars](https://img.shields.io/github/stars/ramda/ramda?style=flat-square) |
| [Day.js](https://github.com/iamkun/dayjs) | 2KB immutable date library | ![Stars](https://img.shields.io/github/stars/iamkun/dayjs?style=flat-square) |
| [date-fns](https://github.com/date-fns/date-fns) | Modern JavaScript date utility library | ![Stars](https://img.shields.io/github/stars/date-fns/date-fns?style=flat-square) |
| [Zod](https://github.com/colinhacks/zod) | TypeScript-first schema validation with static type inference | ![Stars](https://img.shields.io/github/stars/colinhacks/zod?style=flat-square) |
| [Zodios](https://github.com/ecyrbe/zodios) | End-to-end type-safe REST API tools | ![Stars](https://img.shields.io/github/stars/ecyrbe/zodios?style=flat-square) |
| [tRPC](https://github.com/trpc/trpc) | End-to-end typesafe APIs | ![Stars](https://img.shields.io/github/stars/trpc/trpc?style=flat-square) |
| [tsx](https://github.com/privatenumber/tsx) | TypeScript execution and reloading tool | ![Stars](https://img.shields.io/github/stars/privatenumber/tsx?style=flat-square) |

---

## 📝 Contribution Guidelines

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) to learn how to submit resources.

### Quick Contribution Checklist

- [ ] Project has > 1000 GitHub stars (exceptions allowed for exceptional projects)
- [ ] Project is actively maintained (updated within last 6 months)
- [ ] Project has TypeScript support
- [ ] Project is production-ready

---

## 📄 License

[![CC0](https://licensebuttons.net/p/zero/1.0/88x31.png)](LICENSE)

This project is open-sourced under the [MIT License](LICENSE).

---

<p align="center">
  If you find this project helpful, please give it a ⭐ Star!
</p>
