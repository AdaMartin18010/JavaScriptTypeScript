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

## 样式方案决策树

```
样式方案？
├── 原子化 CSS / 设计系统 → Tailwind CSS v4
├── CSS-in-JS / 组件级样式 → Panda CSS / StyleX
├── 零运行时 CSS-in-JS → Vanilla Extract
├── 预处理器（Sass/Less）→ 传统项目迁移兼容
└── CSS Modules → 作用域隔离 + 无运行时开销
```

---

## Monorepo 工具决策树

```
Monorepo 需求？
├── 快速 + 简洁 → pnpm workspaces
├── 强任务管道 + 远程缓存 → Nx
├── 统一版本 + Changesets → Turborepo + Changesets
├── 大型多语言仓库 → Bazel / Buck2
└── 内置发布 + 文档 → Nx + Docusaurus
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

### 带权决策矩阵评分器

```typescript
type Criterion = { name: string; weight: number };
type Option = { name: string; scores: number[] };

function weightedScore(options: Option[], criteria: Criterion[]): Map<string, number> {
  const totalWeight = criteria.reduce((s, c) => s + c.weight, 0);
  const result = new Map<string, number>();

  for (const opt of options) {
    const score = opt.scores.reduce((sum, s, i) => sum + (s * criteria[i].weight) / totalWeight, 0);
    result.set(opt.name, Number(score.toFixed(2)));
  }

  return new Map([...result.entries()].sort((a, b) => b[1] - a[1]));
}

// 前端框架选型评分示例
const criteria: Criterion[] = [
  { name: '生态成熟度', weight: 0.30 },
  { name: 'TypeScript 体验', weight: 0.25 },
  { name: '运行时性能', weight: 0.25 },
  { name: '招聘友好度', weight: 0.20 },
];

const options: Option[] = [
  { name: 'React 19 + Next.js 15', scores: [9, 9, 7, 10] },
  { name: 'Vue 3.5 + Nuxt 3', scores: [8, 9, 8, 6] },
  { name: 'Svelte 5 + SvelteKit', scores: [6, 8, 9, 4] },
  { name: 'SolidJS + SolidStart', scores: [5, 8, 10, 3] },
];

console.log('框架选型加权得分：');
weightedScore(options, criteria).forEach((score, name) => {
  console.log(`  ${name}: ${score}`);
});
```

### 交互式 CLI 决策向导（Node.js + inquirer）

```typescript
// 生产级 CLI 决策向导示例
import { createPromptModule } from 'inquirer';

const prompt = createPromptModule();

interface TechChoice {
  category: string;
  question: string;
  choices: { name: string; value: string; description?: string }[];
}

const questions: TechChoice[] = [
  {
    category: 'frontend',
    question: '选择前端框架：',
    choices: [
      { name: 'React', value: 'react', description: '最大生态，Next.js 全栈' },
      { name: 'Vue', value: 'vue', description: '渐进式，易上手' },
      { name: 'Svelte', value: 'svelte', description: '编译优化，包体积小' },
    ],
  },
  {
    category: 'state',
    question: '选择状态管理方案：',
    choices: [
      { name: 'Zustand', value: 'zustand', description: '极简，无样板代码' },
      { name: 'TanStack Query', value: 'tanstack-query', description: '服务端状态首选' },
      { name: 'Redux Toolkit', value: 'redux', description: '大型企业级' },
    ],
  },
];

async function runWizard() {
  const answers: Record<string, string> = {};
  for (const q of questions) {
    const { choice } = await prompt({
      type: 'list',
      name: 'choice',
      message: q.question,
      choices: q.choices.map(c => ({
        name: `${c.name} — ${c.description}`,
        value: c.value,
      })),
    });
    answers[q.category] = choice;
  }
  console.log('\n✅ 你的技术栈选择：', answers);
}

// runWizard();
```

## 代码示例：AI 辅助技术选型（基于规则 + LLM 混合）

```typescript
// ai-assisted-decision.ts — 结合规则引擎与大模型推理的选型助手
interface ProjectRequirement {
  teamSize: 'small' | 'medium' | 'large';
  performancePriority: 'low' | 'medium' | 'high';
  ssrRequired: boolean;
  edgeRuntime: boolean;
  existingStack?: string[];
}

function ruleBasedRecommendation(req: ProjectRequirement): string[] {
  const candidates: string[] = [];

  if (req.ssrRequired) {
    if (req.edgeRuntime) candidates.push('Remix / React Router v7');
    else candidates.push('Next.js 15 (App Router)', 'Nuxt 3');
  } else {
    candidates.push('Vite + React', 'Vite + Vue');
  }

  if (req.performancePriority === 'high') {
    candidates.push('SvelteKit', 'SolidStart');
  }

  if (req.teamSize === 'large') {
    // 大型团队优先生态成熟度
    candidates.unshift('Next.js 15 (App Router)');
  }

  return [...new Set(candidates)];
}

// 生成自然语言提示词，供 LLM 进一步分析
function generatePrompt(req: ProjectRequirement, candidates: string[]): string {
  return `作为资深前端架构师，请基于以下项目需求，从候选方案中给出最终推荐并说明理由：

项目需求：
- 团队规模：${req.teamSize}
- 性能优先级：${req.performancePriority}
- SSR 需求：${req.ssrRequired}
- Edge Runtime：${req.edgeRuntime}
- 现有技术栈：${req.existingStack?.join(', ') ?? '无'}

候选方案：
${candidates.map((c) => `- ${c}`).join('\n')}

请输出：1) 最终推荐 2) 备选方案 3) 风险与注意事项`;
}

// 使用示例
// const req: ProjectRequirement = { teamSize: 'large', performancePriority: 'high', ssrRequired: true, edgeRuntime: true };
// const candidates = ruleBasedRecommendation(req);
// const prompt = generatePrompt(req, candidates);
// const recommendation = await callLLM(prompt);
```

## 代码示例：npm 包趋势对比决策辅助

```typescript
// npm-trends-decision.ts — 基于下载量趋势的选型辅助
interface PackageMetrics {
  name: string;
  weeklyDownloads: number;
  growthRate: number; // 近 6 个月增长率
  lastUpdateDays: number;
  issuesOpen: number;
  stars: number;
}

function scorePackage(metrics: PackageMetrics): number {
  // 综合评分：下载量 40% + 增长率 30% + 活跃度 30%
  const downloadScore = Math.min(metrics.weeklyDownloads / 1_000_000, 1) * 40;
  const growthScore = Math.min(Math.max(metrics.growthRate, -1), 1) * 30 + 15; // 基础分 15
  const freshnessScore = metrics.lastUpdateDays < 30 ? 15 : metrics.lastUpdateDays < 90 ? 10 : 5;
  const healthScore = metrics.issuesOpen < 100 ? 10 : 5;
  return downloadScore + growthScore + freshnessScore + healthScore;
}

// 示例数据（2026-04 估算）
const packages: PackageMetrics[] = [
  { name: 'next', weeklyDownloads: 5_200_000, growthRate: 0.12, lastUpdateDays: 3, issuesOpen: 412, stars: 127000 },
  { name: 'nuxt', weeklyDownloads: 1_800_000, growthRate: 0.08, lastUpdateDays: 5, issuesOpen: 230, stars: 55000 },
  { name: 'sveltekit', weeklyDownloads: 800_000, growthRate: 0.15, lastUpdateDays: 7, issuesOpen: 89, stars: 82000 },
];

// packages.map(p => ({ name: p.name, score: scorePackage(p).toFixed(1) })).sort((a, b) => +b.score - +a.score);
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
| Tailwind CSS | <https://tailwindcss.com/docs> | 原子化 CSS 框架 |
| Nx | <https://nx.dev/> | 智能构建系统与 Monorepo 工具 |
| Turborepo | <https://turbo.build/repo/docs> | Vercel Monorepo 任务编排 |
| TC39 Proposals | <https://github.com/tc39/proposals> | ECMAScript 提案跟踪 |
| Deno 文档 | <https://docs.deno.com/> | Deno 运行时官方文档 |
| Bun 文档 | <https://bun.sh/docs> | Bun 运行时官方文档 |
| inquirer.js | <https://github.com/SBoudrias/Inquirer.js> | 交互式 Node.js CLI 库 |
| npmtrends.com | <https://www.npmtrends.com/> | npm 包下载量趋势对比 |
| Bundlephobia | <https://bundlephobia.com/> | 包体积分析工具 |
| Thoughtworks Technology Radar | <https://www.thoughtworks.com/radar> | 技术趋势雷达 |
| State of Frontend | <https://stateoffrontend.com/> | 前端生态年度调查 |
| NPM Registry API | <https://github.com/npm/registry/blob/master/docs/REGISTRY-API.md> | npm 元数据 API 文档 |
| React Server Components RFC | <https://github.com/reactjs/rfcs/blob/main/text/0188-server-components.md> | RSC 架构 RFC |
| Vercel Edge Runtime | <https://edge-runtime.vercel.app/> | Edge Runtime 规范与 API |
| Cloudflare Workers — Runtime APIs | <https://developers.cloudflare.com/workers/runtime-apis/> | Workers 运行时 API |
| OpenJS Foundation — Standards | <https://openjsf.org/> | JavaScript 运行时标准组织 |
| Node.js — Performance Best Practices | <https://nodejs.org/en/docs/guides/simple-profiling> | Node.js 性能调优指南 |
| Webpack — Tree Shaking | <https://webpack.js.org/guides/tree-shaking/> | 摇树优化深度指南 |

---

## API 风格决策树

```
需要与前端强类型契约?
├── ✅ → GraphQL ( Apollo / Pothos / Yoga )
│   └── 需要极致性能 / 低带宽? → gRPC + protobuf ( 配合 grpc-web )
└── ❌ → REST
    └── 需要标准化 / 自动生成文档? → OpenAPI + Zod
        └── 需要实时推送? → WebSocket / SSE
```

---

## 评分矩阵计算 — API 风格选型

```typescript
// api-selection-scorer.ts
type Criterion = { name: string; weight: number };
type Option = { name: string; scores: number[] };

function weightedScore(options: Option[], criteria: Criterion[]): Map<string, number> {
  const totalWeight = criteria.reduce((s, c) => s + c.weight, 0);
  const result = new Map<string, number>();
  for (const opt of options) {
    const score = opt.scores.reduce((sum, s, i) => sum + (s * criteria[i].weight) / totalWeight, 0);
    result.set(opt.name, Number(score.toFixed(2)));
  }
  return new Map([...result.entries()].sort((a, b) => b[1] - a[1]));
}

const apiCriteria: Criterion[] = [
  { name: '类型安全', weight: 0.30 },
  { name: '性能', weight: 0.25 },
  { name: '生态成熟度', weight: 0.25 },
  { name: '学习成本', weight: 0.20 },
];

const apiOptions: Option[] = [
  { name: 'REST + OpenAPI', scores: [6, 7, 10, 9] },
  { name: 'GraphQL', scores: [9, 6, 8, 6] },
  { name: 'tRPC', scores: [10, 7, 7, 7] },
  { name: 'gRPC', scores: [8, 10, 7, 5] },
];

console.log('API 风格加权得分：');
weightedScore(apiOptions, apiCriteria).forEach((score, name) => console.log('  ' + name + ': ' + score));
```

---

## 更多权威参考

| 资源 | 链接 | 说明 |
|------|------|------|
| OWASP Cheat Sheet Series | <https://cheatsheetseries.owasp.org/> | 安全最佳实践速查 |
| GraphQL Specification | <https://spec.graphql.org/> | GraphQL 官方规范 |
| gRPC Documentation | <https://grpc.io/docs/> | gRPC 官方文档 |
| OpenAPI Specification | <https://spec.openapis.org/> | OpenAPI 规范 |
| WebAuthn Guide | <https://webauthn.guide/> | 无密码认证指南 |

*最后更新: 2026-04-30*
