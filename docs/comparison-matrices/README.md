---
last-updated: 2026-04-27
review-cycle: 6 months
next-review: 2026-10-27
status: current
---
# 技术对比矩阵导航

> 最后更新: 2026-04 | 本目录当前维护 15 个技术选型对比矩阵与 1 份导航索引。

本目录汇集了 16 个技术选型对比矩阵（含本导航），聚焦语义差异与工程实践，为团队决策提供结构化参考。

## 矩阵目录

| 矩阵名称 | 文件 | 说明 |
|---|---|---|
| 前端框架对比 | [frontend-frameworks-compare.md](frontend-frameworks-compare.md) | React、Vue、Svelte、Angular 等主流前端框架选型参考 |
| 后端框架对比 | [backend-frameworks-compare.md](backend-frameworks-compare.md) | Express、Fastify、NestJS、Hono 等 Node.js 后端框架选型参考 |
| SSR 元框架对比 | [ssr-metaframeworks-compare.md](ssr-metaframeworks-compare.md) | Next.js、Nuxt、SvelteKit、Astro 等全栈/元框架选型参考 |
| 构建工具对比 | [build-tools-compare.md](build-tools-compare.md) | Vite、Webpack、Rollup、Rspack 等打包与编译工具选型参考 |
| JS/TS 编译器对比 | [js-ts-compilers-compare.md](js-ts-compilers-compare.md) | TypeScript、swc、esbuild、Babel 等转译方案选型参考 |
| UI 库对比 | [ui-libraries-compare.md](ui-libraries-compare.md) | 组件库、无头组件与设计系统选型参考 |
| 状态管理对比 | [state-management-compare.md](state-management-compare.md) | Redux、Zustand、MobX、Jotai 等状态管理方案选型参考 |
| 测试工具对比 | [testing-compare.md](testing-compare.md) | 单元测试、E2E 测试与 Mock 方案选型参考 |
| ORM 对比 | [orm-compare.md](orm-compare.md) | Prisma、Drizzle、TypeORM、Sequelize 等数据访问方案选型参考 |
| 包管理器对比 | [package-managers-compare.md](package-managers-compare.md) | npm、pnpm、Yarn、Bun 等依赖管理工具选型参考 |
| Monorepo 工具对比 | [monorepo-tools-compare.md](monorepo-tools-compare.md) | Turborepo、Nx、Rush、pnpm workspace 等 Monorepo 方案选型参考 |
| 可观测性工具对比 | [observability-tools-compare.md](observability-tools-compare.md) | 日志、监控、链路追踪与前端埋点方案选型参考 |
| 部署平台对比 | [deployment-platforms-compare.md](deployment-platforms-compare.md) | Vercel、Netlify、Cloudflare Pages 等托管与部署方案选型参考 |
| CI/CD 工具对比 | [ci-cd-tools-compare.md](ci-cd-tools-compare.md) | GitHub Actions、GitLab CI、CircleCI 等流水线方案选型参考 |
| 浏览器兼容性对比 | [browser-compatibility-compare.md](browser-compatibility-compare.md) | 主流浏览器特性支持与 Polyfill 策略选型参考 |
| **矩阵导航** | **README.md** | **本文件，汇总全部对比矩阵索引与推荐阅读顺序** |

## 推荐阅读顺序

1. 先做前端/后端框架选型，确定技术栈主基调。
2. 结合 SSR 元框架与构建工具对比，完善工程化链路。
3. 参考状态管理与 UI 库对比，细化应用层基础设施。
4. 通过 Monorepo 工具与包管理器对比，统一仓库与依赖治理。
5. 借助可观测性与 CI/CD 工具对比，补齐质量保障与交付链路。
6. 最后阅读测试工具、ORM、部署平台与浏览器兼容性对比，完善质量、数据层与运行时方案。

## 更新记录

最后更新: 2026-04-27 | 更新: 矩阵目录扩展至 15 个对比文件，补充 Monorepo、可观测性、部署平台、CI/CD、浏览器兼容性矩阵及阅读顺序
