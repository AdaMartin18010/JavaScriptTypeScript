# 决策树

> JavaScript/TypeScript 技术选型的结构化决策框架。

---

## 前端框架

```
新项目？
├── 需要最大生态/招聘 → React + Next.js
├── 渐进式增强/易上手 → Vue + Nuxt
├── 极致性能/编译优化 → Svelte + SvelteKit
├── 内容驱动/零 JS → Astro
└── 全栈类型安全 → React + tRPC + Next.js
```

---

## 框架选择决策树 (Framework Selection Decision Tree)

```
是否需要服务端渲染 (SSR) 或静态生成 (SSG)?
├── ❌ 纯 CSR (单页应用)
│   ├── 大型 / 企业级 → React + React Router / TanStack Router
│   ├── 中等规模 → Vue + Vue Router
│   └── 追求极简 → Preact + WMR
│
└── ✅ 需要 SSR / SSG
    ├── 需要 RSC (React Server Components)?
    │   ├── ✅ → Next.js 15 (App Router) — 唯一成熟选择
    │   └── ❌ →
    │       ├── 需要边缘计算 (Edge Runtime)?
    │       │   ├── ✅ → Remix / React Router v7 (Cloudflare/Vercel)
    │       │   └── ❌ → Next.js (Pages Router) 或 Nuxt 3
    │       └──
    └── 非 React 技术栈
        ├── Vue 生态 → Nuxt 3 (SSR/SSG/Edge 全覆盖)
        ├── Svelte 生态 → SvelteKit (简洁高效)
        └── 内容驱动 (文档/博客/Marketing) → Astro (零 JS 默认)
```

---

## 状态管理

```
状态类型？
├── 服务端数据 → TanStack Query / SWR
├── 全局 UI 状态 → Zustand
├── 原子化/派生复杂 → Jotai
├── 大型团队规范 → Redux Toolkit
└── 细粒度响应式 → Signals (Preact / Vue)
```

---

## 状态管理决策矩阵 (State Management Decision Matrix)

| 决策问题 | 答案 | 推荐方案 | 原因 |
|----------|------|---------|------|
| 数据来自服务端 API? | ✅ | TanStack Query / SWR | 缓存、去重、后台刷新、乐观更新内置 |
| 需要跨组件共享的 UI 状态? | ✅ | Zustand | 极简 API、无 Provider 包裹、TypeScript 友好 |
| 状态逻辑复杂、派生多? | ✅ | Jotai / Recoil | 原子化设计，细粒度订阅，自动依赖追踪 |
| 大型团队、需严格规范? | ✅ | Redux Toolkit (RTK) | 时间旅行调试、严格数据流、生态成熟 |
| 追求极致性能 / 细粒度响应? | ✅ | Signals (Preact / Vue / Solid) | 直接 DOM 更新，无 Virtual DOM 开销 |
| 表单状态复杂? | ✅ | React Hook Form + Zod | 非受控组件优化，验证集成 |
| URL 状态管理? | ✅ | Nuqs / TanStack Router | 类型安全的 URL 状态同步 |

---

## 状态管理方案对比表

| 方案 | 学习曲线 | 包体积 | TypeScript | 调试工具 | 适用规模 |
|------|---------|--------|------------|---------|---------|
| **Zustand** | 低 | ~1KB | 优秀 | Redux DevTools | 小-中 |
| **Jotai** | 中 | ~5KB | 优秀 | Redux DevTools | 中 |
| **Redux Toolkit** | 中 | ~12KB | 优秀 | Redux DevTools | 大 |
| **TanStack Query** | 中 | ~12KB | 优秀 | DevTools 插件 | 任何 |
| **Valtio** | 低 | ~5KB | 良好 | Proxy 追踪 | 小-中 |
| **Pinia** | 低 | ~5KB | 优秀 | Vue DevTools | 中 (Vue) |

---

## 构建工具

```
项目规模？
├── 小型/快速启动 → Vite
├── 大型/企业级 → Rspack / Webpack
├── 极致速度 + Rust → Rolldown（未来）
└── 库开发 → Rollup / tsup
```

---

## 部署平台

```
应用类型？
├── Next.js 全功能 → Vercel
├── 静态/多框架 → Netlify
├── 高流量/低成本 → Cloudflare Pages
├── 全栈 + 数据库 → Railway
└── Docker/容器 → Render / Fly.io
```

---

## 测试策略

```
测试层级？
├── 单元测试（逻辑/工具函数）
│   ├── 需要极速 + 原生 ESM → Vitest
│   └── 需要完善模拟生态 → Jest
├── 组件测试（UI 交互）
│   ├── React 组件 → React Testing Library + Vitest
│   └── Vue 组件 → Vue Test Utils + Vitest
├── E2E 测试（用户流程）
│   ├── 现代 Chromium 首选 → Playwright
│   └── 多浏览器兼容 → Cypress / Selenium
└── 视觉回归
    └── Chromatic / Percy / Storybook Test Runner
```

---

## 运行时与包管理器

```
新项目初始化？
├── 运行时
│   ├── 最大生态兼容 → Node.js LTS (npm/pnpm)
│   ├── 内置 TS + 安全默认 → Deno
│   └── 极致速度 + 内置打包 → Bun
├── 包管理器
│   ├── 经典稳定 → npm
│   ├── 磁盘优化 +  monorepo → pnpm
│   └── 并行下载 + Workspace → Yarn Berry (PnP)
└── 锁文件策略
    ├── 确定性安装 → package-lock.json / pnpm-lock.yaml
    └── 零安装 (Zero-Install) → Yarn .pnp.cjs
```

---

## 数据库选型

```
数据模型与访问模式？
├── 关系型 / 强事务 / 复杂查询 → PostgreSQL
│   └── ORM 选择
│       ├── 类型安全 + 迁移 → Prisma
│       ├── SQL-like + 高性能 → Drizzle ORM
│       └── 灵活 + 活跃记录 → TypeORM
├── 文档型 / 快速迭代 / 非结构化 → MongoDB
├── 键值 / 缓存 / 会话 → Redis
├── 图数据 / 关系网络 → Neo4j
├── 时序数据 / IoT → TimescaleDB / InfluxDB
└── 全文搜索 → Elasticsearch / Meilisearch
```

---

## 快速参考卡

| 决策 | 2026 默认选择 | 备选 |
|------|-------------|------|
| 框架 | React 19 + Next.js 15 | Vue 3 / Svelte 5 |
| 状态 | Zustand + TanStack Query | Jotai / Redux |
| 样式 | Tailwind CSS v4 | Panda CSS |
| 构建 | Vite 6 | Rspack |
| 测试 | Vitest + Playwright | Jest + Cypress |
| 部署 | Vercel | Cloudflare |

---

## 可编程决策树引擎

以下是一个极简的 TypeScript 决策树遍历器，可用于将上述文本决策树转化为可交互的 CLI 或 Web 向导：

```typescript
type DecisionNode = {
  question: string;
  choices: { label: string; next?: DecisionNode; result?: string }[];
};

function traverse(node: DecisionNode): string {
  console.log(`\n❓ ${node.question}`);
  node.choices.forEach((c, i) => console.log(`  ${i + 1}. ${c.label}`));
  // 实际项目中可替换为 readline / inquirer / Web UI 输入
  const selected = node.choices[0]; // 模拟选择
  if (selected.result) return selected.result;
  if (selected.next) return traverse(selected.next);
  return 'No result';
}

// 示例：构建工具决策
const buildToolTree: DecisionNode = {
  question: '项目规模与目标？',
  choices: [
    { label: '小型/快速启动', result: '推荐：Vite' },
    { label: '大型/企业级', result: '推荐：Rspack / Webpack' },
    { label: '库开发', result: '推荐：Rollup / tsup' },
  ],
};

console.log(traverse(buildToolTree));
```

---

## 权威参考链接

| 资源 | 链接 | 说明 |
|------|------|------|
| Next.js 文档 | <https://nextjs.org/docs> | React 全栈框架官方文档 |
| Nuxt 文档 | <https://nuxt.com/docs> | Vue 全栈框架官方文档 |
| SvelteKit 文档 | <https://kit.svelte.dev/docs> | Svelte 全栈框架官方文档 |
| Astro 文档 | <https://docs.astro.build> | 内容驱动框架官方文档 |
| Zustand GitHub | <https://github.com/pmndrs/zustand> | 极简状态管理 |
| Jotai 文档 | <https://jotai.org/docs> | 原子化状态管理 |
| Redux Toolkit | <https://redux-toolkit.js.org/> | 企业级状态管理 |
| TanStack Query | <https://tanstack.com/query/latest> | 服务端状态管理 |
| Web Framework Performance | <https://web-frameworks-benchmark.netlify.app/> | 框架性能基准对比 |
| State of JS | <https://stateofjs.com/> | JavaScript 生态年度调查 |
| Stack Overflow Survey | <https://survey.stackoverflow.co/> | 全球开发者技术栈与满意度调查 |
| Node.js 文档 | <https://nodejs.org/en/docs/> | 运行时官方文档 |
| npm 文档 | <https://docs.npmjs.com/> | 包管理器官方文档 |
| Vitest | <https://vitest.dev/> | 下一代单元测试框架 |
| Playwright | <https://playwright.dev/> | 现代 E2E 测试框架 |
| Prisma | <https://www.prisma.io/docs/> | 类型安全 ORM |
| Drizzle ORM | <https://orm.drizzle.team/> | SQL-like TypeScript ORM |

---

*最后更新: 2026-04-29*
