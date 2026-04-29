# 对比表格模板

本文档提供各类库对比表格的标准模板，用于在 awesome-jsts-ecosystem 中统一展示库之间的差异。

---

## 通用对比维度

| 维度 | 说明 | 数据来源 |
|------|------|---------|
| Stars | GitHub stars 数量 | GitHub API |
| 维护状态 | 最后更新时间 | GitHub API |
| TS 支持 | TypeScript 支持度 | 源码分析 |
| 包体积 | 安装后大小 | BundlePhobia |
| 下载量 | 周下载量 | npm stats |

---

## 模板一：HTTP 客户端对比

```markdown
### HTTP 客户端对比

| 库 | TS 支持 | Stars | 包体积 | 特点 | 适用场景 |
|---|--------|------|--------|------|---------|
| [axios](link) | 🟡⭐⭐⭐ | 105k | 14KB | 支持浏览器和 Node，API 友好 | 通用 HTTP 请求 |
| [fetch](link) | 🟢⭐⭐⭐ | native | 0KB | 原生 API，无需安装 | 现代环境首选 |
| [ky](link) | 🟢⭐⭐⭐ | 12k | 4KB | fetch 包装，更友好的 API | 轻量级请求 |
| [got](link) | 🟢⭐⭐ | 13k | 45KB | Node 专用，功能强大 | Node.js 服务端 |
```

#### 代码示例：批量获取仓库 Stars

```typescript
// scripts/fetch-stars.ts
import { Octokit } from '@octokit/rest';

interface RepoInfo {
  name: string;
  stars: number;
  updated: string;
}

async function fetchRepoStars(owner: string, repos: string[]): Promise<RepoInfo[]> {
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  const results: RepoInfo[] = [];

  for (const repo of repos) {
    const { data } = await octokit.repos.get({ owner, repo });
    results.push({
      name: repo,
      stars: data.stargazers_count,
      updated: data.updated_at,
    });
  }
  return results;
}

// 使用示例
fetchRepoStars('axios', ['axios']).then(console.table);
```

---

## 模板二：ORM 对比

```markdown
### ORM 对比

| ORM | TS 支持 | Stars | 数据库 | 特点 | 适用场景 |
|-----|--------|------|--------|------|---------|
| [Prisma](link) | 🟢⭐⭐⭐🏢 | 40k | 多数据库 | 类型安全，自动生成 | 企业级应用 |
| [TypeORM](link) | 🟢⭐⭐🏢 | 34k | 多数据库 | Decorator 风格，成熟 | 传统 ORM 用户 |
| [Drizzle](link) | 🟢⭐⭐⭐🚀 | 24k | SQL 为主 | SQL-like API，轻量 | 追求性能和控制 |
| [Mongoose](link) | 🟡⭐⭐⭐ | 26k | MongoDB | MongoDB 专用，功能丰富 | MongoDB 项目 |
```

#### 代码示例：用脚本自动填充对比表格

```typescript
// scripts/generate-compare-table.ts
import { getPackageInfo } from './npm-utils';

interface ORMEntry {
  name: string;
  tsSupport: string;
  stars: number;
  sizeKb: number;
  weeklyDownloads: number;
}

async function generateORMTable(packages: string[]): Promise<string> {
  const rows = await Promise.all(
    packages.map(async (pkg) => {
      const info = await getPackageInfo(pkg);
      return `| [${pkg}](https://www.npmjs.com/package/${pkg}) | 🟢⭐⭐⭐ | ${info.stars} | ${info.sizeKb}KB | ${info.weeklyDownloads.toLocaleString()}/周 |`;
    })
  );
  return ['| 库 | TS 支持 | Stars | 包体积 | 下载量 |', '|---|---|---|---|---|', ...rows].join('\n');
}

// 输出 Markdown 表格到控制台
generateORMTable(['prisma', 'typeorm', 'drizzle-orm', 'mongoose']).then(console.log);
```

---

## 模板三：测试框架对比

```markdown
### 测试框架对比

| 框架 | TS 支持 | Stars | 测试类型 | 特点 | 适用场景 |
|------|--------|------|---------|------|---------|
| [Vitest](link) | 🟢⭐⭐⭐🏢 | 14k | 单元/集成 | 极速，Vite 原生 | Vite 项目首选 |
| [Jest](link) | 🟡⭐⭐⭐🏢 | 44k | 单元/集成 | 生态丰富，成熟 | 传统项目 |
| [Playwright](link) | 🟢⭐⭐⭐🏢 | 68k | E2E | 多浏览器，可靠 | E2E 测试 |
| [Cypress](link) | 🟡⭐⭐⭐ | 47k | E2E | 开发体验好 | 前端 E2E |
```

#### 代码示例：用 Playwright 做跨浏览器截图对比

```typescript
// e2e/visual-regression.spec.ts
import { test, expect } from '@playwright/test';

test('homepage visual regression across browsers', async ({ page, browserName }) => {
  await page.goto('https://example.com');
  await page.waitForLoadState('networkidle');

  // 对每个浏览器生成独立的基线快照
  await expect(page).toHaveScreenshot(`homepage-${browserName}.png`, {
    fullPage: true,
    threshold: 0.2,
  });
});
```

---

## 模板四：构建工具对比

```markdown
### 构建工具对比

| 工具 | TS 支持 | Stars | 构建速度 | 配置复杂度 | 适用场景 |
|------|--------|------|---------|-----------|---------|
| [Vite](link) | 🟢⭐⭐⭐🏢 | 69k | ⭐⭐⭐⭐⭐ | 低 | 现代前端开发 |
| [esbuild](link) | 🟢⭐⭐⭐ | 38k | ⭐⭐⭐⭐⭐ | 中 | 极速构建 |
| [tsc](link) | 🟢⭐⭐⭐ | native | ⭐⭐⭐ | 低 | 类型检查 |
| [Webpack](link) | 🟡⭐⭐⭐ | 64k | ⭐⭐⭐ | 高 | 复杂配置需求 |
```

#### 代码示例：Vite 插件统计构建耗时

```typescript
// vite-plugins/build-time-plugin.ts
import type { Plugin } from 'vite';

export function buildTimePlugin(): Plugin {
  let startTime: number;
  return {
    name: 'build-time-tracker',
    buildStart() {
      startTime = performance.now();
    },
    buildEnd() {
      const duration = (performance.now() - startTime).toFixed(2);
      console.log(`\n⚡ Build completed in ${duration}ms`);
    },
  };
}

// vite.config.ts
import { defineConfig } from 'vite';
import { buildTimePlugin } from './vite-plugins/build-time-plugin';

export default defineConfig({
  plugins: [buildTimePlugin()],
});
```

---

## 模板五：表单处理库对比

```markdown
### 表单处理库对比

| 库 | TS 支持 | Stars | 包体积 | 验证方案 | 适用场景 |
|---|--------|------|--------|---------|---------|
| [React Hook Form](link) | 🟢⭐⭐⭐ | 43k | 9KB | 配合 zod/yup | 性能优先 |
| [Formik](link) | 🟡⭐⭐ | 33k | 13KB | 内置 + 配合 yup | 传统方案 |
| [TanStack Form](link) | 🟢⭐⭐⭐ | 4k | 8KB | 配合 zod | 跨框架 |
```

#### 代码示例：React Hook Form + Zod 严格类型表单

```typescript
// components/LoginForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type FormData = z.infer<typeof schema>;

export function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    console.log('Submitting:', data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} placeholder="Email" />
      {errors.email && <span>{errors.email.message}</span>}
      <input type="password" {...register('password')} placeholder="Password" />
      {errors.password && <span>{errors.password.message}</span>}
      <button type="submit">Login</button>
    </form>
  );
}
```

---

## 模板六：UI 组件库对比

```markdown
### React UI 组件库对比

| 库 | TS 支持 | Stars | 样式方案 | 组件数量 | 适用场景 |
|---|--------|------|---------|---------|---------|
| [shadcn/ui](link) | 🟢⭐⭐⭐🚀 | 82k | Tailwind | 50+ | 现代项目 |
| [MUI](link) | 🟢⭐⭐⭐🏢 | 93k | CSS-in-JS | 100+ | 企业级应用 |
| [Ant Design](link) | 🟢⭐⭐⭐🏢 | 92k | CSS-in-JS | 80+ | 中后台系统 |
| [Chakra UI](link) | 🟢⭐⭐⭐ | 38k | CSS-in-JS | 50+ | 简洁设计 |
```

#### 代码示例：shadcn/ui 组件自定义主题

```typescript
// components/ui/button.tsx
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);
Button.displayName = 'Button';
export { Button, buttonVariants };
```

---

## 模板七：状态管理库对比

```markdown
### React 状态管理对比

| 库 | TS 支持 | Stars | 学习曲线 | 特点 | 适用场景 |
|---|--------|------|---------|------|---------|
| [Zustand](link) | 🟢⭐⭐⭐🚀 | 47k | 低 | 简单，高性能 | 中小型应用 |
| [Jotai](link) | 🟢⭐⭐⭐ | 19k | 中 | 原子化，React 风格 | 细粒度状态 |
| [Redux Toolkit](link) | 🟢⭐⭐⭐🏢 | 11k | 高 | 规范，生态丰富 | 大型应用 |
| [Valtio](link) | 🟢⭐⭐⭐ | 10k | 低 | Proxy 驱动，可变状态 | 简单可变状态 |
```

#### 代码示例：Zustand 切片模式 + 持久化

```typescript
// stores/useAppStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface UserSlice {
  name: string;
  setName: (name: string) => void;
}

interface CartSlice {
  items: string[];
  addItem: (item: string) => void;
}

const createUserSlice = (set: any): UserSlice => ({
  name: '',
  setName: (name) => set({ name }),
});

const createCartSlice = (set: any): CartSlice => ({
  items: [],
  addItem: (item) => set((state: CartSlice) => ({ items: [...state.items, item] })),
});

export const useAppStore = create<UserSlice & CartSlice>()(
  persist(
    (set, get, api) => ({
      ...createUserSlice(set),
      ...createCartSlice(set),
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ name: state.name }), // 仅持久化 user
    }
  )
);
```

---

## 使用说明

### 填充步骤

1. **收集数据**：从 GitHub/npm 获取最新数据
2. **验证标签**：根据实际体验验证 TS 支持度和维护状态
3. **补充说明**：添加实际使用中的关键差异点
4. **定期更新**：每季度检查更新一次

### 数据获取命令

```bash
# 获取 GitHub stars
curl -s https://api.github.com/repos/OWNER/REPO | jq '.stargazers_count'

# 获取 npm 下载量
npm view PACKAGE_NAME --json | jq '.versions'

# 获取包体积
npx bundlephobia PACKAGE_NAME
```

#### 代码示例：自动化数据收集脚本

```typescript
// scripts/collect-metrics.ts
import { writeFileSync } from 'fs';

async function fetchNpmDownloads(pkg: string): Promise<number> {
  const res = await fetch(`https://api.npmjs.org/downloads/point/last-week/${pkg}`);
  const data = await res.json();
  return data.downloads ?? 0;
}

async function fetchGitHubStars(owner: string, repo: string): Promise<number> {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers: process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {},
  });
  const data = await res.json();
  return data.stargazers_count ?? 0;
}

interface PackageMetrics {
  package: string;
  weeklyDownloads: number;
  githubStars: number;
  fetchedAt: string;
}

async function collectMetrics(packages: { npm: string; gh: [string, string] }[]): Promise<void> {
  const results: PackageMetrics[] = [];
  for (const { npm, gh } of packages) {
    const [weeklyDownloads, githubStars] = await Promise.all([
      fetchNpmDownloads(npm),
      fetchGitHubStars(...gh),
    ]);
    results.push({ package: npm, weeklyDownloads, githubStars, fetchedAt: new Date().toISOString() });
  }
  writeFileSync('metrics.json', JSON.stringify(results, null, 2));
  console.table(results);
}

collectMetrics([
  { npm: 'axios', gh: ['axios', 'axios'] },
  { npm: 'zustand', gh: ['pmndrs', 'zustand'] },
]);
```

### 注意事项

- 数据应保持最新，建议每季度更新
- 客观描述，避免主观偏见
- 重要差异用 **粗体** 标注
- 版本差异在备注中说明

---

## 权威参考链接

| 资源 | 说明 | 链接 |
|------|------|------|
| npm Registry API | 官方包元数据与下载量接口 | [github.com/npm/registry](https://github.com/npm/registry/blob/master/docs/REGISTRY-API.md) |
| GitHub REST API | 仓库统计、Stars、Release 信息 | [docs.github.com/rest](https://docs.github.com/en/rest) |
| BundlePhobia | 包体积与依赖分析 | [bundlephobia.com](https://bundlephobia.com/) |
| npm trends | 多包下载量趋势对比 | [npmtrends.com](https://npmtrends.com/) |
| State of JS | JavaScript 生态年度调查 | [stateofjs.com](https://stateofjs.com/) |
| State of TS | TypeScript 生态年度调查 | [stateoftypescript.com](https://stateoftypescript.com/) |
| Openbase | 开源包对比与评分 | [openbase.com](https://openbase.com/) |
| Snyk Advisor | 包健康度与安全评估 | [snyk.io/advisor](https://snyk.io/advisor/) |
| JS Benchmark | 运行时性能基准测试 | [benchmarkjs.com](https://benchmarkjs.com/) |
| ECMAScript® 2025 Language Specification | 语言规范 | [tc39.es/ecma262](https://tc39.es/ecma262/) |

---

*最后更新: 2026-04-29*
