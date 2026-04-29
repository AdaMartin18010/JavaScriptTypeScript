# 分类总览

> 本项目知识库的分类体系导航，帮助快速定位所需技术领域。

---

## 分类体系

| 分类 | 文件 | 说明 |
|------|------|------|
| **状态管理** | `04-state-management.md` | Redux, Zustand, Jotai, Signals |
| **表单处理** | `05-forms.md` | React Hook Form, FormKit, Server Actions |
| **包管理器** | `07-package-managers.md` | npm, pnpm, Yarn, Bun |
| **Monorepo** | `08-monorepo-tools.md` | Turborepo, Nx, Moon, Rush |
| **部署平台** | `09-deployment-platforms.md` | Vercel, Netlify, Cloudflare, Railway |
| **CSS 框架** | `10-css-frameworks.md` | Tailwind, UnoCSS, Panda CSS |
| **CI/CD** | `13-ci-cd.md` | GitHub Actions, GitLab CI, Jenkins |
| **代码检查** | `14-linting-formatting.md` | ESLint, Biome, Oxlint, Prettier |
| **性能优化** | `18-performance.md` | Core Web Vitals, INP, Bundle 优化 |
| **API 设计** | `21-api-design.md` | REST, GraphQL, tRPC, gRPC |
| **安全** | `25-security.md` | OWASP, 供应链安全, 边缘安全 |
| **数据可视化** | `DATA_VISUALIZATION.md` | D3, ECharts, Observable Plot |
| **移动开发** | `MOBILE_DEVELOPMENT.md` | React Native, Capacitor, PWA |

---

## 生态系统分类学 (Ecosystem Taxonomy)

| 层级 | 类别 | 典型技术栈 | 选型权重 |
|------|------|-----------|---------|
| **运行时层** | JS Engine / Runtime | V8, SpiderMonkey, Node.js, Deno, Bun | 稳定性 > 性能 |
| **语言层** | Language / Type System | TypeScript, JSDoc, Flow | 类型安全 > 生态 |
| **框架层** | UI Framework | React, Vue, Svelte, Angular, Solid | 生态 > 性能 > 学习曲线 |
| **元框架层** | Meta Framework | Next.js, Nuxt, SvelteKit, Astro, Remix | 功能完整度 > 部署集成 |
| **状态层** | State Management | Redux, Zustand, Jotai, Pinia, Signals | 复杂度匹配 > 性能 |
| **样式层** | Styling Solution | Tailwind, CSS Modules, Panda, Linaria | 运行时开销 > 定制性 |
| **构建层** | Build Tool | Vite, Rspack, Webpack, Rollup, esbuild | 构建速度 > 生态兼容 |
| **测试层** | Testing | Vitest, Jest, Playwright, Cypress | 速度 > 覆盖率 > 成本 |
| **部署层** | Deployment | Vercel, Netlify, Cloudflare, AWS, GCP | 成本 > 性能 > 锁定风险 |
| **观测层** | Observability | Grafana, Datadog, Sentry, Highlight.io | 成本 > 集成度 > 开源 |

---

## 框架选择矩阵 (Framework Selection Matrix)

| 评估维度 | React 19 + Next.js 15 | Vue 3 + Nuxt 3 | Svelte 5 + SvelteKit | Angular 18 | Solid + SolidStart |
|----------|----------------------|----------------|----------------------|------------|-------------------|
| **GitHub Stars** | 228k / 127k | 208k / 55k | 81k / 19k | 96k | 35k / 5k |
| **学习曲线** | 中 | 低 | 低 | 高 | 中 |
| **性能 (Lighthouse)** | 良好 | 良好 | 优秀 | 良好 | 优秀 |
| **包体积 (基础)** | ~40KB | ~30KB | ~5KB | ~120KB | ~7KB |
| **企业级支持** | Meta / Vercel | 社区驱动 | 社区驱动 | Google | 社区驱动 |
| **RSC 支持** | ✅ 原生 | ⚠️ 实验性 | ❌ | ❌ | ❌ |
| **TypeScript** | ✅ 原生 | ✅ 优秀 | ✅ 良好 | ✅ 强制 | ✅ 优秀 |
| **招聘市场** | 🔥 最高 | 高 | 中 | 中 | 低 |
| **SSR/SSG** | ✅ 完善 | ✅ 完善 | ✅ 完善 | ✅ 完善 | ✅ 完善 |
| **生态成熟度** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |

---

## 按学习路径浏览

- **初学者** → `30.9-learning-paths/beginner-path.md`
- **进阶工程师** → `30.9-learning-paths/intermediate-path.md`
- **架构师** → `30.9-learning-paths/architect-path.md`

---

## 权威参考链接

| 资源 | 链接 | 说明 |
|------|------|------|
| State of JS 2024 | <https://stateofjs.com/en-US> | 年度 JavaScript 生态调查报告 |
| State of CSS 2024 | <https://stateofcss.com/en-US> | CSS 生态与工具链趋势 |
| npm Trends | <https://npmtrends.com> | 包下载量对比工具 |
| Bundlephobia | <https://bundlephobia.com> | 包体积分析工具 |
| JS Benchmarks | <https://krausest.github.io/js-framework-benchmark/> | 前端框架性能基准测试 |
| web.dev | <https://web.dev> | Google 官方 Web 性能与最佳实践 |
| MDN Web Docs | <https://developer.mozilla.org> | 权威 Web 技术文档 |
| Node.js Docs | <https://nodejs.org/docs/latest/api/> | Node.js 官方 API 文档 |
| TypeScript Handbook | <https://www.typescriptlang.org/docs/> | TypeScript 官方手册 |

---

*最后更新: 2026-04-29*
