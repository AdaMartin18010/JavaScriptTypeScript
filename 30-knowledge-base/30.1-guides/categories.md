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

## 代表性技术代码示例

### 状态管理：Zustand

```typescript
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface BearState {
  bears: number;
  increase: () => void;
  decrease: () => void;
}

export const useBearStore = create<BearState>()(
  devtools(
    persist(
      (set) => ({
        bears: 0,
        increase: () => set((state) => ({ bears: state.bears + 1 })),
        decrease: () => set((state) => ({ bears: Math.max(0, state.bears - 1) })),
      }),
      { name: 'bear-storage' }
    )
  )
);

// 组件中使用
function BearCounter() {
  const { bears, increase } = useBearStore();
  return <button onClick={increase}>Bears: {bears}</button>;
}
```

### 表单处理：React Hook Form + Zod

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm: z.string(),
}).refine((data) => data.password === data.confirm, {
  message: "Passwords don't match",
  path: ['confirm'],
});

type FormData = z.infer<typeof schema>;

function SignUpForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <input {...register('email')} placeholder="Email" />
      {errors.email && <span>{errors.email.message}</span>}
      <input {...register('password')} type="password" placeholder="Password" />
      <input {...register('confirm')} type="password" placeholder="Confirm" />
      <button type="submit">Sign Up</button>
    </form>
  );
}
```

### Monorepo：Turborepo Pipeline

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "lint": { "dependsOn": ["^build"] },
    "test": { "dependsOn": ["^build"] },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

### CI/CD：GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [20, 22]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm test --coverage
      - run: pnpm build
```

### API 设计：tRPC OpenAPI 集成

```typescript
import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { generateOpenApiDocument } from 'trpc-openapi';

const t = initTRPC.create();
export const appRouter = t.router({
  userById: t.procedure
    .meta({ openapi: { method: 'GET', path: '/user/{id}' } })
    .input(z.object({ id: z.string() }))
    .output(z.object({ id: z.string(), name: z.string() }))
    .query(({ input }) => ({ id: input.id, name: 'Alice' })),
});

export const openApiDocument = generateOpenApiDocument(appRouter, {
  title: 'My API',
  version: '1.0.0',
  baseUrl: 'https://api.example.com',
});
```

### 性能优化：Core Web Vitals 测量

```typescript
// web-vitals 测量与上报
import { onCLS, onINP, onLCP, type Metric } from 'web-vitals';

function sendToAnalytics(metric: Metric) {
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    id: metric.id,
    rating: metric.rating, // 'good' | 'needs-improvement' | 'poor'
  });

  // 使用 sendBeacon 确保数据可靠上报
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/analytics/vitals', body);
  } else {
    fetch('/analytics/vitals', { body, method: 'POST', keepalive: true });
  }
}

onCLS(sendToAnalytics);
onINP(sendToAnalytics);
onLCP(sendToAnalytics);
```

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
| Zustand Documentation | <https://docs.pmnd.rs/zustand> | 轻量状态管理库文档 |
| React Hook Form | <https://react-hook-form.com/> | 高性能表单验证库 |
| Turborepo Docs | <https://turbo.build/repo/docs> | Monorepo 构建系统文档 |
| GitHub Actions Docs | <https://docs.github.com/en/actions> | CI/CD 工作流官方文档 |
| tRPC Documentation | <https://trpc.io/docs> | 端到端类型安全 API |
| OWASP Top 10 | <https://owasp.org/www-project-top-ten/> | Web 应用安全风险清单 |
| web-vitals | <https://github.com/GoogleChrome/web-vitals> | Chrome 核心 Web 指标库 |
| Can I Use | <https://caniuse.com/> | 浏览器特性兼容性查询 |

---

*最后更新: 2026-04-29*
