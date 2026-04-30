# 快速开始 / Getting Started

欢迎来到 **Awesome JS/TS Ecosystem**！

Welcome to **Awesome JS/TS Ecosystem**!

## 📖 关于本项目 / About This Project

本项目旨在成为中文领域最全面、最权威的 JavaScript/TypeScript 生态库导航，对标国际知名的 [awesome-nodejs](https://github.com/sindresorhus/awesome-nodejs) 和 [awesome-typescript](https://github.com/dzharii/awesome-typescript)。

This project aims to be the most comprehensive and authoritative JS/TS ecosystem navigation in Chinese, following the international standards of [awesome-nodejs](https://github.com/sindresorhus/awesome-nodejs) and [awesome-typescript](https://github.com/dzharii/awesome-typescript).

---

## 🚀 如何使用 / How to Use

### 浏览分类 / Browse Categories

项目按功能和用途分为多个分类，你可以：

The project is organized into categories by function and purpose. You can:

1. **查看目录 / View Table of Contents**: README 顶部有完整的目录导航 / Full table of contents at the top of README
2. **使用搜索 / Use Search**: 使用浏览器的搜索功能（Ctrl+F / Cmd+F）/ Use browser search (Ctrl+F / Cmd+F)
3. **关注徽章 / Watch Badges**: 注意星标数量徽章 [:star: xxx] / Watch for star count badges [:star: xxx]

### 贡献内容 / Contribute Content

如果你想添加新的库或资源：

If you want to add new libraries or resources:

1. 阅读 [CONTRIBUTING.md](../../../../CONTRIBUTING.md) / Read [CONTRIBUTING.md](../../../../CONTRIBUTING.md)
2. Fork 本仓库 / Fork this repository
3. 创建分支并修改 / Create a branch and make changes
4. 提交 Pull Request / Submit a Pull Request

---

## 📂 项目结构 / Project Structure

```
awesome-jsts-ecosystem/
├── README.md                 # 主文档 / Main documentation
├── LICENSE                   # MIT 许可证 / MIT License
├── CONTRIBUTING.md           # 贡献指南 / Contribution guide
├── package.json              # Node.js 配置 / Node.js config
├── tsconfig.json             # TypeScript 配置 / TypeScript config
├── .github/
│   └── workflows/            # GitHub Actions 工作流 / GitHub Actions workflows
└── docs/
    ├── guides/               # 使用指南 / User guides
    ├── examples/             # 示例代码 / Code examples
    └── translations/         # 翻译文档 / Translations
```

---

## 📊 快速导航表

| 我想做... | 查看分类 | 推荐工具 | 学习资源 |
|----------|---------|---------|---------|
| 构建 Web 应用 | [前端框架](../../../../30-knowledge-base/30.2-categories/01-frontend-frameworks.md) | React, Vue, Svelte | [React 官方教程](https://react.dev/learn) |
| 构建后端 API | [后端框架](../../../../30-knowledge-base/30.2-categories/14-backend-frameworks.md) | Hono, Express, NestJS | [Hono 文档](https://hono.dev/) |
| 数据库操作 | [ORM 与数据库](../../../../30-knowledge-base/30.2-categories/11-orm-database.md) | Prisma, Drizzle | [Prisma 入门](https://www.prisma.io/docs/getting-started) |
| 状态管理 | [状态管理](../../../../30-knowledge-base/30.2-categories/05-state-management.md) | Zustand, Jotai, Pinia | [Zustand 指南](https://zustand-demo.pmnd.rs/) |
| 构建工具 | [构建工具](../../../../30-knowledge-base/30.2-categories/03-build-tools.md) | Vite, esbuild, Rollup | [Vite 指南](https://vitejs.dev/guide/) |
| 测试 | [测试框架](../../../../30-knowledge-base/30.2-categories/12-testing.md) | Vitest, Playwright | [Vitest 文档](https://vitest.dev/) |
| AI / LLM 集成 | [AI 工具](../../../../30-knowledge-base/30.2-categories/ai-integration.md) | LangChain.js, Vercel AI SDK | [LangChain JS](https://js.langchain.com/) |
| 桌面应用 | [桌面开发](../../../../30-knowledge-base/30.2-categories/16-mobile-development.md) | Tauri, Electron | [Tauri 文档](https://v2.tauri.app/) |
| 部署与 CI/CD | [CI/CD](../../../../30-knowledge-base/30.2-categories/13-ci-cd.md) | GitHub Actions, Docker | [GitHub Actions](https://docs.github.com/en/actions) |

---

## 🎯 框架选型决策矩阵

| 场景 | 首选框架 | 次选 | 关键考量 |
|------|---------|------|---------|
| 企业级全栈 | Next.js (App Router) | Nuxt | SSR、RSC、生态成熟度 |
| 轻量 API 后端 | Hono | Fastify | 边缘兼容、TypeScript |
| 高性能 SPA | Vite + React | Vite + Vue | 构建速度、HMR |
| 内容站点 | Astro | Next.js | 岛屿架构、零 JS 默认 |
| AI 应用原型 | Vercel AI SDK + Next.js | LangChain.js | 流式 UI、模型切换 |
| 桌面应用 | Tauri | Electron | 包体积、内存占用 |
| 移动应用 | React Native | Expo | 原生性能、热更新 |
| CLI 工具 | Ink (React CLI) | Commander.js | 交互式 TUI、测试 |

---

## 🛠️ 快速创建项目示例

### 使用 Vite 创建 TypeScript 项目

```bash
# 创建项目
npm create vite@latest my-app -- --template vanilla-ts

# 或使用框架模板
npm create vite@latest my-react-app -- --template react-ts
npm create vite@latest my-vue-app -- --template vue-ts

cd my-app
npm install
npm run dev
```

### 使用 `create-next-app` 创建全栈项目

```bash
npx create-next-app@latest my-next-app --typescript --tailwind --eslint --app --src-dir
```

### 使用 `create-hono` 创建边缘 API

```bash
npm create hono@latest my-api
# 选择 Cloudflare Workers / Node.js / Deno 等运行时模板
```

### 使用 `npm init` 创建库项目（支持 Dual Package）

```bash
mkdir my-lib && cd my-lib
npm init -y
npm install -D typescript vitest @types/node
npx tsc --init
```

```json
// package.json — Dual Package (ESM + CJS)
{
  "name": "my-lib",
  "version": "1.0.0",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    }
  },
  "scripts": {
    "build": "tsup src/index.ts --format cjs,esm --dts",
    "test": "vitest"
  },
  "devDependencies": {
    "tsup": "^8.0.0",
    "typescript": "^5.4.0",
    "vitest": "^1.5.0"
  }
}
```

### 使用 pnpm Workspace 搭建 Monorepo

```json
// pnpm-workspace.yaml
packages:
  - 'packages/*'
  - 'apps/*'
```

```json
// package.json (root)
{
  "private": true,
  "scripts": {
    "build": "turbo run build",
    "test": "turbo run test"
  },
  "devDependencies": {
    "turbo": "^2.0.0"
  }
}
```

### 配置严格的 TypeScript 编译选项

```json
// tsconfig.json 推荐严格配置
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

---

## 🎯 收录标准 / Inclusion Criteria

我们遵循严格的收录标准，确保推荐内容的质量：

We follow strict inclusion criteria to ensure the quality of recommendations:

- ✅ 活跃维护 / Actively maintained
- ✅ 良好文档 / Good documentation
- ✅ 开源许可 / Open source license
- ✅ 社区认可 / Community recognition

---

## 📬 联系我们 / Contact Us

- 问题反馈 / Issue Report: GitHub Issues
- 功能建议 / Feature Request: GitHub Discussions

---

## 🔗 权威参考链接

- [awesome-nodejs](https://github.com/sindresorhus/awesome-nodejs) — Node.js 生态权威索引
- [awesome-typescript](https://github.com/dzharii/awesome-typescript) — TypeScript 资源大全
- [npm trends](https://npmtrends.com/) — 包下载量趋势对比
- [BundlePhobia](https://bundlephobia.com/) — 包体积分析
- [State of JS](https://stateofjs.com/) — JavaScript 生态年度调查
- [State of TS](https://stateoftypescript.com/) — TypeScript 生态年度调查
- [Node.js 官方文档](https://nodejs.org/docs/latest/api/) — Node.js API 参考
- [TypeScript 官方文档](https://www.typescriptlang.org/docs/) — TypeScript 语言文档
- [MDN Web Docs](https://developer.mozilla.org/) — Mozilla 开发者网络，Web 标准权威参考
- [JavaScript Info](https://javascript.info/) — 现代 JavaScript 教程
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices) — Node.js 工程最佳实践
- [Patterns.dev](https://www.patterns.dev/) — 现代 Web 应用设计模式
- [web.dev](https://web.dev/) — Google Chrome 团队 Web 性能与最佳实践
- [Total TypeScript](https://www.totaltypescript.com/) — Matt Pocock 的 TypeScript 进阶课程
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/) — Basarat 的 TypeScript 深度指南
- [Node.js Design Patterns](https://www.nodejsdesignpatterns.com/) — Node.js 设计模式（书籍）
- [ECMAScript® 2025 Language Specification](https://tc39.es/ecma262/) — ECMAScript 语言规范
- [TC39 Proposals](https://github.com/tc39/proposals) — ECMAScript 提案跟踪
- [npm Documentation](https://docs.npmjs.com/) — npm 官方文档
- [pnpm Documentation](https://pnpm.io/motivation) — pnpm 官方文档与 Monorepo 指南
- [Turbo Documentation](https://turbo.build/repo/docs) — Turborepo 构建系统文档
- [Vite Documentation](https://vitejs.dev/guide/) — Vite 下一代前端工具链
- [Vitest Documentation](https://vitest.dev/guide/) — Vitest 下一代测试框架
- [Rollup Documentation](https://rollupjs.org/introduction/) — Rollup 模块打包器
- [esbuild Documentation](https://esbuild.github.io/) — esbuild 极速打包器
- [SWC Documentation](https://swc.rs/docs/usage/core) — SWC 基于 Rust 的编译器
- [Deno Documentation](https://docs.deno.com/) — Deno 运行时官方文档
- [Bun Documentation](https://bun.sh/docs) — Bun 运行时官方文档
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/) — 边缘计算平台文档
- [Vercel Edge Functions](https://vercel.com/docs/functions/edge-functions) — Vercel 边缘函数文档
- [NestJS Documentation](https://docs.nestjs.com/) — NestJS 企业级框架文档
- [Prisma Documentation](https://www.prisma.io/docs/) — Prisma ORM 官方文档
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview) — Drizzle ORM 轻量文档
- [Playwright Documentation](https://playwright.dev/docs/intro) — Playwright E2E 测试文档
- [Testing Library](https://testing-library.com/docs/) — 测试工具集官方文档
- [Zod Documentation](https://zod.dev/) — Zod 运行时类型校验库
- [tsx Documentation](https://github.com/privatenumber/tsx) — tsx TypeScript 执行器
- [TSConfig Cheat Sheet](https://www.totaltypescript.com/tsconfig-cheat-sheet) — TSConfig 配置速查表
- [JavaScript Weekly](https://javascriptweekly.com/) — JavaScript 技术周刊
- [Node Weekly](https://nodeweekly.com/) — Node.js 技术周刊
- [Frontend Focus](https://frontendfoc.us/) — 前端技术周刊

---

感谢你的支持！/ Thank you for your support!
