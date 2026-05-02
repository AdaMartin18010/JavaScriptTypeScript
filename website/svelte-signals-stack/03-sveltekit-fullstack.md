---
title: SvelteKit 2.x 全栈框架深度指南
description: 'SvelteKit 文件系统路由、数据加载、Form Actions、API 路由、适配器与部署策略的完整指南'
keywords: 'SvelteKit, 全栈框架, 路由, Form Actions, SSR, 适配器, Edge部署'
---

# SvelteKit 2.x 全栈框架深度指南

## 概述

SvelteKit 是 Svelte 的官方全栈应用框架，它基于 Svelte 编译器构建，提供了从开发到部署的完整解决方案。
与 React 生态中的 Next.js 或 Vue 生态中的 Nuxt 类似，SvelteKit 为开发者提供了文件系统路由、服务器端渲染（SSR）、静态生成（SSG）、API 路由和多种部署适配器等核心能力。
但得益于 Svelte 的编译时优化特性，SvelteKit 在运行时性能、包体积和内存占用方面通常具有显著优势。

SvelteKit 的设计理念是"约定优于配置"，通过清晰的文件命名约定来定义路由、布局、API 端点和服务端逻辑，同时保留了充分的灵活性，允许开发者在需要时覆盖默认行为。
这种设计使得开发者可以快速上手，同时又能应对复杂的生产级应用需求。

| 属性 | 详情 |
|------|------|
| **版本** | 2.53.x (2026-05) |
| **Stars** | ~19,000+ |
| **GitHub** | [sveltejs/kit](https://github.com/sveltejs/kit) |
| **官网** | [kit.svelte.dev](https://kit.svelte.dev) |
| **底层构建** | Vite 6/8 |
| **运行时** | Node.js / Edge (Cloudflare/Vercel/Netlify) |
| **包体积（SPA 基础）** | ~25KB gzipped |
| **首次发布** | 2021年（SvelteKit 1.0 于 2022-12 发布） |
| **当前大版本** | SvelteKit 2.x（2023-12 发布） |

::: tip 为什么选择 SvelteKit？
如果你已经在使用 Svelte，SvelteKit 是官方推荐的下一个步骤。
它不是一个"可选"的附加框架，而是 Svelte 应用的标准运行环境。
相较于其他元框架，SvelteKit 的 bundle 体积更小、内存占用更低，且其 Form Actions 和渐进式增强模型提供了独特而优雅的开发体验。
:::

---

## 快速开始

SvelteKit 项目现在推荐使用官方 CLI 工具 `sv`（前身为 `create-svelte`）进行初始化。
`sv` CLI 提供了现代化的交互式项目创建体验，支持多种模板和可选功能（TypeScript、ESLint、Prettier、Playwright 测试等）。

```bash
# 创建新项目（使用 sv CLI，推荐）
npm create sv@latest my-app
cd my-app
npm install
npm run dev

# 或 pnpm
pnpm create sv@latest my-app --template minimal

# 使用特定选项
npx sv create my-app --template skeleton --types typescript
```

初始化完成后，项目结构将自动配置好 Vite、Svelte 编译器和 SvelteKit 路由系统。
`npm run dev` 会启动 Vite 开发服务器，支持快速热更新（HMR）。

```bash
# 常用命令
npm run dev        # 启动开发服务器 (Vite HMR)
npm run build      # 生产构建（根据适配器输出）
npm run preview    # 预览生产构建（使用 adapter-auto 或 adapter-node）
npm run check      # 运行 svelte-check 进行类型检查
```

---

## 文件系统路由

SvelteKit 的路由系统基于文件系统，这是其最核心也最具特色的设计之一。
所有路由相关的文件都位于 `src/routes/` 目录下，SvelteKit 在构建和运行时会自动将这些文件映射为对应的路由。

### 项目结构概览

```
my-app/
├── src/
│   ├── routes/                    # 路由根目录
│   │   ├── +page.svelte           # 首页 (/)
│   │   ├── +page.ts               # 页面 load 函数（同构）
│   │   ├── +layout.svelte         # 根布局
│   │   ├── +layout.ts             # 布局 load 函数（同构）
│   │   ├── about/
│   │   │   ├── +page.svelte       # /about
│   │   │   └── +page.ts
│   │   ├── blog/
│   │   │   ├── +page.svelte       # /blog
│   │   │   └── [slug]/            # 动态路由段
│   │   │       ├── +page.svelte   # /blog/:slug
│   │   │       └── +page.ts
│   │   ├── (marketing)/           # 路由分组（不影响 URL）
│   │   │   ├── +layout.svelte
│   │   │   ├── pricing/
│   │   │   │   └── +page.svelte   # /pricing
│   │   │   └── features/
│   │   │       └── +page.svelte   # /features
│   │   ├── admin/
│   │   │   ├── +layout.svelte     # /admin 专属布局
│   │   │   ├── +layout.server.ts  # admin 服务端布局 load
│   │   │   ├── +page.svelte       # /admin
│   │   │   └── settings/
│   │   │       └── +page.svelte   # /admin/settings
│   │   └── api/                   # API 路由
│   │       └── hello/
│   │           └── +server.ts     # API 端点
│   ├── lib/                       # 内部库（$lib 别名）
│   │   ├── db/
│   │   ├── components/
│   │   └── utils/
│   ├── app.html                   # HTML 页面模板
│   ├── app.d.ts                   # 全局类型声明
│   └── hooks.ts                   # 全局服务端 hooks
├── static/                        # 静态资源（直接复制到输出）
├── svelte.config.js               # Svelte 配置
├── vite.config.ts                 # Vite 配置
├── tsconfig.json                  # TypeScript 配置
└── package.json
```

### 路由特殊文件详解

SvelteKit 使用 `+` 前缀来标识具有特殊意义的文件，这是为了避免与普通组件或工具文件混淆。

| 文件名 | 用途 | 执行环境 |
|--------|------|----------|
| `+page.svelte` | 页面组件，渲染路由对应的 UI | 服务端 + 客户端 |
| `+page.ts` / `+page.js` | 页面 load 函数，SSR/CSR 数据获取 | 服务端 + 客户端（同构） |
| `+page.server.ts` | 仅服务端执行的 load，可访问私有 API/数据库 | 仅服务端 |
| `+layout.svelte` | 布局组件，包裹下级路由 | 服务端 + 客户端 |
| `+layout.ts` | 布局 load 函数 | 服务端 + 客户端（同构） |
| `+layout.server.ts` | 仅服务端布局 load | 仅服务端 |
| `+server.ts` | API 端点，处理 HTTP 请求 | 仅服务端 |
| `+error.svelte` | 错误页面，处理路由或 load 抛出的错误 | 服务端 + 客户端 |
| `+hooks.ts` | 服务端 hooks（如认证、日志、CORS） | 仅服务端 |
| `+params/` | 自定义参数匹配器目录 | 构建时 |

::: warning `.server.` 后缀的重要性
任何带有 `.server.` 后缀的文件（如 `+page.server.ts`）都保证只在服务端执行，其代码不会被打包到客户端 bundle 中。
这意味着你可以安全地在这些文件中导入数据库连接字符串、服务端 SDK 密钥或执行任意服务端逻辑，而无需担心信息泄露。
:::

### 动态路由与参数

动态路由段使用方括号命名：

```
routes/
├── blog/
│   └── [slug]/
│       └── +page.svelte          # /blog/hello-world
├── products/
│   └── [id=integer]/             # 使用自定义匹配器
│       └── +page.svelte          # /products/123
└── [...catchall]/
    └── +page.svelte              # /any/deep/path
```

自定义参数匹配器位于 `src/params/`：

```ts
// src/params/integer.ts
import type { ParamMatcher } from '@sveltejs/kit';

export const match: ParamMatcher = (param) => {
  return /^\d+$/.test(param);
};
```

### 路由分组

路由分组（Route Groups）使用圆括号命名，用于共享布局而不影响 URL 结构：

```
routes/
├── (app)/
│   ├── +layout.svelte            # 应用布局（侧边栏等）
│   ├── dashboard/
│   │   └── +page.svelte          # /dashboard
│   └── settings/
│       └── +page.svelte          # /settings
├── (marketing)/
│   ├── +layout.svelte            # 营销页面布局（不同导航）
│   ├── about/
│   │   └── +page.svelte          # /about
│   └── pricing/
│       └── +page.svelte          # /pricing
```

---

## 数据加载（Load Functions）

数据加载是 SvelteKit 全栈能力的核心。
`load` 函数负责在渲染页面之前获取所需数据，支持在服务端、客户端或两者同时运行。
SvelteKit 的 `load` 系统经过精心设计，能够优雅地处理 SSR 水合、客户端导航和预渲染等场景。

### 页面级数据加载（同构）

使用 `+page.ts`（或 `+page.js`）定义的 load 函数在服务端渲染期间和客户端导航时都会执行。这是最常见的数据获取模式。

```ts
// src/routes/blog/[slug]/+page.ts
import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ params, fetch, url, route }) => {
  // params: 路由参数 { slug: string }
  // fetch: 增强版 fetch，在 SSR 时直接请求内部端点
  // url: 当前页面 URL
  // route: { id: string }

  const response = await fetch(`/api/posts/${params.slug}`);

  if (!response.ok) {
    error(404, 'Post not found');
  }

  const post = await response.json();

  return {
    post,
    title: post.title,
    meta: {
      description: post.excerpt,
      publishedAt: post.publishedAt
    }
  };
};
```

```svelte
<!-- src/routes/blog/[slug]/+page.svelte -->
<script>
  let { data } = $props(); // data 来自 load 函数返回
</script>

<svelte:head>
  <title>{data.title}</title>
  <meta name="description" content={data.meta.description} />
</svelte:head>

<h1>{data.post.title}</h1>
<article>{@html data.post.content}</article>
```

### 服务端数据加载

当数据获取需要访问数据库、私有 API 或执行服务端专属逻辑时，使用 `+page.server.ts`：

```ts
// src/routes/admin/+page.server.ts
import type { PageServerLoad } from './$types';
import { db } from '$lib/db';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals, depends, cookies, request }) => {
  // 仅服务端执行，代码永远不会泄露到客户端

  // 认证检查
  if (!locals.user?.isAdmin) {
    redirect(307, '/login');
  }

  // 访问数据库
  const users = await db.query.users.findMany({
    orderBy: (users, { desc }) => [desc(users.createdAt)],
    limit: 50
  });

  // 声明依赖，用于后续手动失效
  depends('app:users');

  // 读取请求头
  const acceptLanguage = request.headers.get('accept-language');

  return {
    users,
    adminName: locals.user.name,
    acceptLanguage
  };
};
```

::: tip `depends` 与 `invalidate`
调用 `depends('app:users')` 后，你可以在页面中通过 `invalidate('app:users')` 触发该 load 函数的重新执行，这在数据变更后刷新页面数据时非常有用。
:::

### 布局级数据加载

布局也可以定义 load 函数，其返回的数据会向下传递给所有子路由：

```ts
// src/routes/+layout.ts
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ fetch, url }) => {
  const settings = await fetch('/api/site-settings').then(r => r.json());

  return {
    settings,
    currentPath: url.pathname
  };
};
```

子布局的 load 函数会**继承**父布局返回的数据（通过 `data` 参数访问），并可以进一步扩展：

```ts
// src/routes/admin/+layout.ts
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ data }) => {
  // data 包含父 +layout.ts 返回的数据
  return {
    ...data,
    adminMenu: [
      { label: 'Dashboard', href: '/admin' },
      { label: 'Users', href: '/admin/users' },
      { label: 'Settings', href: '/admin/settings' }
    ]
  };
};
```

### Streaming（流式传输）

SvelteKit 支持通过返回 Promise 来实现流式数据传输。这对于优化首屏加载时间非常关键——页面可以立即渲染无需等待的部分，数据到达后再更新。

```ts
// src/routes/dashboard/+page.ts
export const load = async () => {
  // 同步返回的数据立即可用
  const fastData = await fetchQuickStats();

  return {
    fastData,
    // Promise 会流式传输到客户端
    slowData: new Promise<string>((resolve) => {
      setTimeout(() => resolve('Heavy analytics loaded!'), 2000);
    }),
    // 也可以流式传输另一个 load 结果
    recommendations: fetchRecommendations() // 返回 Promise
  };
};
```

```svelte
<!-- +page.svelte -->
<script>
  let { data } = $props();
</script>

<!-- 立即可渲染 -->
<QuickStats stats={data.fastData} />

<!-- 等待流式数据 -->
{#await data.slowData}
  <AnalyticsSkeleton />
{:then analytics}
  <HeavyAnalytics data={analytics} />
{:catch err}
  <ErrorAlert message={err.message} />
{/await}

<!-- 另一种流式数据 -->
{#await data.recommendations}
  <RecommendationSkeleton />
{:then items}
  <RecommendationList {items} />
{/await}
```

::: info 流式 SSR
在 SSR 模式下，SvelteKit 会使用 HTTP 分块传输编码（chunked transfer encoding）将 HTML 的静态部分先发送给浏览器，待 Promise resolve 后再注入后续内容。这显著提升了感知性能和 TTFB（Time to First Byte）。
:::

### Load 函数完整参数

```ts
interface LoadEvent {
  // 路由参数（动态段）
  params: Record<string, string>;
  // 增强版 fetch：SSR 时内部直接调用，无需网络请求
  fetch: typeof fetch;
  // 当前页面的完整 URL
  url: URL;
  // 路由 ID，如 /blog/[slug]
  route: { id: string | null };
  // 声明依赖，用于 invalidate
  depends: (...deps: string[]) => void;
  // 父级布局 load 返回的数据（仅 layout load）
  data: Record<string, unknown>;
  // 仅在 +page.server.ts / +layout.server.ts 中可用
  cookies: Cookies;
  locals: App.Locals;
  platform: Readonly<App.Platform>;
  request: Request;
}
```

---

## Form Actions

SvelteKit 的 Form Actions 是其最独特和强大的特性之一。它基于原生 HTML Form 构建，通过服务端处理函数来实现数据提交，同时提供了渐进式增强（Progressive Enhancement）机制，让表单在没有 JavaScript 的情况下也能正常工作。

### 基本 Form Action

```ts
// src/routes/contact/+page.server.ts
import type { Actions } from './$types';
import { fail } from '@sveltejs/kit';

export const actions: Actions = {
  // default action：处理没有指定 action 的表单
  default: async ({ request, cookies, getClientAddress }) => {
    const formData = await request.formData();
    const email = formData.get('email') as string;
    const message = formData.get('message') as string;

    // 服务端验证
    if (!email || !message) {
      return fail(400, {
        email,
        message,
        missing: true,
        error: 'All fields are required'
      });
    }

    if (!email.includes('@')) {
      return fail(400, {
        email,
        message,
        invalid: true,
        error: 'Invalid email address'
      });
    }

    // 保存到数据库...
    await saveContact({ email, message, ip: getClientAddress() });

    return { success: true, submittedAt: new Date().toISOString() };
  }
};
```

```svelte
<!-- src/routes/contact/+page.svelte -->
<script>
  let { form } = $props(); // form 来自 action 返回的数据
</script>

<form method="POST">
  <label>
    Email:
    <input
      name="email"
      type="email"
      value={form?.email ?? ''}
      aria-invalid={form?.invalid ? 'true' : undefined}
    />
  </label>

  <label>
    Message:
    <textarea name="message">{form?.message ?? ''}</textarea>
  </label>

  <button type="submit">Send</button>
</form>

{#if form?.success}
  <p role="alert">Thank you! We'll be in touch soon.</p>
{/if}

{#if form?.missing || form?.invalid}
  <p role="alert" class="error">{form.error}</p>
{/if}
```

### 命名 Action

一个页面可以定义多个命名 action，通过 `?/actionName` 来路由：

```ts
// src/routes/todos/+page.server.ts
import type { Actions } from './$types';

export const actions: Actions = {
  create: async ({ request }) => {
    const data = await request.formData();
    const text = data.get('text');
    // ... 创建 todo
    return { created: true };
  },

  delete: async ({ request }) => {
    const data = await request.formData();
    const id = data.get('id');
    // ... 删除 todo
    return { deleted: true };
  },

  toggle: async ({ request }) => {
    const data = await request.formData();
    const id = data.get('id');
    const done = data.get('done') === 'on';
    // ... 切换状态
    return { toggled: true };
  }
};
```

```svelte
<!-- 使用命名 action -->
<form method="POST" action="?/create">
  <input name="text" />
  <button type="submit">Add</button>
</form>

{#each todos as todo}
  <form method="POST" action="?/toggle">
    <input type="hidden" name="id" value={todo.id} />
    <input type="checkbox" name="done" checked={todo.done} />
    <span>{todo.text}</span>
    <button formaction="?/delete">Delete</button>
  </form>
{/each}
```

### 渐进式增强（Progressive Enhancement）

这是 SvelteKit Form Actions 的杀手锏。通过 `use:enhance`，表单可以在有 JavaScript 时拦截提交、提供即时反馈，无 JavaScript 时回退到标准表单提交：

```svelte
<script>
  import { enhance } from '$app/forms';
  import type { SubmitFunction } from './$types';

  let submitting = $state(false);
  let optimisticTodos = $state([]);

  const handleSubmit: SubmitFunction = ({ formData, action, cancel }) => {
    // 1. 提交前：可以取消、修改 formData、显示 loading
    submitting = true;

    // 乐观更新示例
    const text = formData.get('text');
    optimisticTodos = [...optimisticTodos, { id: crypto.randomUUID(), text, done: false }];

    return async ({ result, update }) => {
      // 2. 提交后：result 包含服务端返回
      submitting = false;

      if (result.type === 'failure') {
        // 验证失败，回滚乐观更新
        optimisticTodos = optimisticTodos.slice(0, -1);
        return;
      }

      // 3. 调用 update() 重新运行 load 函数并更新页面
      await update();
    };
  };
</script>

<form method="POST" action="?/create" use:enhance={handleSubmit}>
  <input name="text" required disabled={submitting} />
  <button type="submit" disabled={submitting}>
    {submitting ? 'Adding...' : 'Add'}
  </button>
</form>
```

`enhance` 的回调中 `result` 的可能类型：

| `result.type` | 含义 |
|--------------|------|
| `success` | Action 正常返回对象 |
| `failure` | Action 调用了 `fail()` |
| `redirect` | Action 调用了 `redirect()` |
| `error` | Action 抛出了未捕获的错误 |

::: tip 无 JavaScript 也能工作
不使用 `use:enhance` 时，表单就是标准的 HTML Form，通过 POST 请求提交到服务端，服务端处理后返回页面。这意味着你的应用即使在 JavaScript 加载失败或被禁用的环境下依然可用——这是现代 Web 应用应有的韧性。
:::

---

## API 路由

除了页面路由，SvelteKit 还支持通过 `+server.ts` 文件创建 RESTful API 端点。这些端点可以处理标准的 HTTP 方法（GET、POST、PUT、PATCH、DELETE 等），是构建全栈应用后端逻辑的主要方式之一。

### 基本 API 端点

```ts
// src/routes/api/users/+server.ts
import type { RequestHandler } from './$types';
import { json, error, text } from '@sveltejs/kit';

// GET /api/users?page=1
export const GET: RequestHandler = async ({ url, locals, setHeaders }) => {
  const page = Number(url.searchParams.get('page') ?? '1');
  const limit = Number(url.searchParams.get('limit') ?? '20');
  const search = url.searchParams.get('search') ?? '';

  if (page < 1 || limit > 100) {
    error(400, 'Invalid pagination parameters');
  }

  const users = await locals.db.query.users.findMany({
    where: search ? (users, { like }) => like(users.name, `%${search}%`) : undefined,
    limit,
    offset: (page - 1) * limit
  });

  const total = await locals.db.query.users.count();

  setHeaders({
    'Cache-Control': 'max-age=60',
    'X-Total-Count': String(total)
  });

  return json({
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
};

// POST /api/users
export const POST: RequestHandler = async ({ request, locals, getClientAddress }) => {
  const body = await request.json();

  // 输入验证
  if (!body.name || typeof body.name !== 'string') {
    error(400, { message: 'Name is required and must be a string' });
  }

  const existing = await locals.db.query.users.findFirst({
    where: (users, { eq }) => eq(users.email, body.email)
  });

  if (existing) {
    error(409, 'User with this email already exists');
  }

  const user = await locals.db
    .insert(users)
    .values({
      name: body.name,
      email: body.email,
      createdAt: new Date(),
      createdByIp: getClientAddress()
    })
    .returning();

  return json(user[0], { status: 201 });
};
```

### 带参数的动态 API 路由

```ts
// src/routes/api/users/[id]/+server.ts
import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params, locals }) => {
  const user = await locals.db.query.users.findFirst({
    where: (users, { eq }) => eq(users.id, params.id)
  });

  if (!user) {
    error(404, 'User not found');
  }

  return json(user);
};

export const PATCH: RequestHandler = async ({ params, request, locals }) => {
  const updates = await request.json();

  const updated = await locals.db
    .update(users)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(users.id, params.id))
    .returning();

  if (!updated.length) {
    error(404, 'User not found');
  }

  return json(updated[0]);
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
  await locals.db.delete(users).where(eq(users.id, params.id));
  return new Response(null, { status: 204 });
};
```

### CORS 处理

```ts
// src/routes/api/external/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://trusted-app.com',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

export const GET: RequestHandler = async () => {
  return json({ data: 'external api response' }, { headers: corsHeaders });
};

export const OPTIONS: RequestHandler = async () => {
  return new Response(null, {
    status: 204,
    headers: corsHeaders
  });
};
```

---

## 适配器与部署

SvelteKit 通过**适配器（Adapter）**将应用打包为不同平台可部署的格式。这种设计让同一套 SvelteKit 代码可以部署到 Node.js 服务器、静态托管、Serverless 平台或 Edge Runtime 上。

### 官方适配器一览

| 适配器 | 目标平台 | 安装 | 适用场景 |
|--------|----------|------|----------|
| `@sveltejs/adapter-auto` | 自动检测 | 内置 | 开发阶段，自动识别 Vercel/Netlify/Cloudflare 等 |
| `@sveltejs/adapter-node` | Node.js 服务器 | `npm i -D @sveltejs/adapter-node` | 自建服务器、Docker、PaaS |
| `@sveltejs/adapter-static` | 静态托管 | `npm i -D @sveltejs/adapter-static` | SPA、预渲染站点、CDN |
| `@sveltejs/adapter-vercel` | Vercel | `npm i -D @sveltejs/adapter-vercel` | Vercel Serverless / Edge |
| `@sveltejs/adapter-cloudflare` | Cloudflare Pages | `npm i -D @sveltejs/adapter-cloudflare` | Cloudflare Pages + Workers |
| `@sveltejs/adapter-cloudflare-workers` | Cloudflare Workers | `npm i -D @sveltejs/adapter-cloudflare-workers` | 纯 Workers 部署 |
| `@sveltejs/adapter-netlify` | Netlify | `npm i -D @sveltejs/adapter-netlify` | Netlify Functions / Edge |

::: warning adapter-auto 的局限
`adapter-auto` 在开发时很方便，但生产环境建议显式安装目标适配器。这确保了构建输出的确定性，并能使用该适配器的全部配置选项。
:::

### Node.js 部署配置

Node.js 适配器输出一个自包含的服务器，支持 HTTP/2、压缩、环境变量前缀等高级功能。

```js
// svelte.config.js
import adapter from '@sveltejs/adapter-node';

export default {
  kit: {
    adapter: adapter({
      // 输出目录
      out: 'build',
      // 预压缩静态资源（gzip + brotli）
      precompress: true,
      // 环境变量前缀过滤
      envPrefix: 'APP_',
      // 自定义 polyfills
      polyfill: true
    }),
    // 强制所有页面 SSR（用于全动态应用）
    // prerender: { entries: [] }
  }
};
```

构建后运行：

```bash
npm run build
node build  # 启动 Node.js 服务器，默认监听 process.env.PORT 或 3000
```

Docker 部署示例：

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json .
RUN npm ci --omit=dev
COPY build ./build
EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "build"]
```

### Cloudflare Workers / Pages 部署

Cloudflare 适配器将 SvelteKit 应用编译为 Workers 格式，支持 KV、D1、R2 等 Cloudflare 原生绑定。

```js
// svelte.config.js
import adapter from '@sveltejs/adapter-cloudflare';

export default {
  kit: {
    adapter: adapter({
      routes: {
        include: ['/*'],
        exclude: ['<all>']  // 排除静态资源，由 Pages 直接处理
      },
      platformProxy: {
        configPath: 'wrangler.toml',
        environment: undefined
      }
    }),
    alias: {
      $lib: './src/lib'
    }
  }
};
```

```toml
# wrangler.toml
name = "my-sveltekit-app"
compatibility_date = "2026-04-01"

# D1 数据库绑定
[[d1_databases]]
binding = "DB"
database_name = "prod-db"
database_id = "your-db-id"

# KV 命名空间绑定
[[kv_namespaces]]
binding = "CACHE"
id = "your-kv-id"
```

在服务端代码中访问绑定：

```ts
// +page.server.ts
export const load = async ({ platform }) => {
  const db = platform.env.DB;      // D1Database
  const cache = platform.env.CACHE; // KVNamespace

  const cached = await cache.get('homepage-data');
  if (cached) return JSON.parse(cached);

  const result = await db.prepare('SELECT * FROM posts LIMIT 10').all();
  await cache.put('homepage-data', JSON.stringify(result), { expirationTtl: 300 });

  return { posts: result.results };
};
```

### 静态生成（SSG）配置

```js
// svelte.config.js
import adapter from '@sveltejs/adapter-static';

export default {
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: 'index.html',  // SPA 回退（可选）
      precompress: true,
      strict: true             // 遇到不能预渲染的页面时构建失败
    }),
    prerender: {
      // 预渲染的入口页面
      entries: ['/', '/about', '/blog'],
      // 遇到外部链接时的行为：ignore / fail / warn
      handleHttpError: 'warn'
    }
  }
};
```

### 渲染模式配置

每个页面可以通过导出来控制渲染行为：

```ts
// src/routes/blog/[slug]/+page.ts
// 构建时生成静态 HTML
export const prerender = true;

// src/routes/dashboard/+page.ts
// 禁用 SSR，纯客户端渲染（CSR）
export const ssr = false;

// src/routes/search/+page.ts
// 禁用 CSR，纯服务端渲染（无水合）
export const csr = false;

// 组合使用
export const prerender = 'auto';  // 自动判断是否能静态生成
```

```ts
// src/routes/api/webhook/+server.ts
// API 路由不支持 prerender
export const prerender = false;
```

---

## Hooks

Hooks 是 SvelteKit 的请求处理管道，允许你在请求到达路由之前或响应返回之前执行全局逻辑。最常见的用途包括认证、授权、日志记录、CORS、请求 ID 注入和性能监控。

### 服务端 Handle Hook

```ts
// src/hooks.ts
import type { Handle, HandleFetch } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

// 1. 认证 Hook
const handleAuth: Handle = async ({ event, resolve }) => {
  const sessionToken = event.cookies.get('session');

  if (sessionToken) {
    try {
      const user = await validateSession(sessionToken);
      event.locals.user = user;
    } catch {
      event.cookies.delete('session', { path: '/' });
    }
  }

  return resolve(event);
};

// 2. 日志 & 请求追踪 Hook
const handleLogging: Handle = async ({ event, resolve }) => {
  const start = Date.now();
  const requestId = crypto.randomUUID();

  event.locals.requestId = requestId;
  event.setHeaders({ 'X-Request-Id': requestId });

  const response = await resolve(event);

  const duration = Date.now() - start;
  console.log(
    `[${requestId}] ${event.request.method} ${event.url.pathname} - ${response.status} (${duration}ms)`
  );

  return response;
};

// 3. CORS Hook
const handleCors: Handle = async ({ event, resolve }) => {
  const response = await resolve(event);

  if (event.url.pathname.startsWith('/api/')) {
    response.headers.set('Access-Control-Allow-Origin', event.request.headers.get('origin') ?? '*');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  return response;
};

// 使用 sequence 组合多个 hook（按顺序执行）
export const handle = sequence(handleAuth, handleLogging, handleCors);
```

### 类型声明扩展

为了让 TypeScript 识别 `locals` 上的自定义属性，需要扩展 `App.Locals`：

```ts
// src/app.d.ts
declare global {
  namespace App {
    interface Locals {
      user?: {
        id: string;
        email: string;
        name: string;
        isAdmin: boolean;
      };
      requestId: string;
      db: import('$lib/db').DatabaseClient;
    }

    interface Platform {
      env?: {
        DB?: D1Database;
        CACHE?: KVNamespace;
      };
    }

    interface Error {
      code?: string;
      requestId?: string;
    }
  }
}

export {};
```

### HandleFetch Hook

`handleFetch` 允许你拦截应用内部使用 `fetch` 发出的请求，常用于开发环境代理或内部请求优化：

```ts
// src/hooks.ts
import type { HandleFetch } from '@sveltejs/kit';

export const handleFetch: HandleFetch = async ({ request, fetch }) => {
  // 将内部 API 请求直接路由到本地 handler，避免网络往返
  if (request.url.startsWith('http://localhost:5173/api/')) {
    // 重写为内部请求
    return fetch(
      new Request(request.url.replace('http://localhost:5173', 'http://127.0.0.1:5173'), request)
    );
  }

  return fetch(request);
};
```

### 错误处理

```ts
// src/hooks.ts
import type { HandleServerError } from '@sveltejs/kit';

export const handleError: HandleServerError = async ({ error, event, status, message }) => {
  const errorId = crypto.randomUUID();

  // 记录到外部监控系统
  await logErrorToService({
    errorId,
    status,
    message,
    path: event.url.pathname,
    method: event.request.method,
    stack: error instanceof Error ? error.stack : undefined,
    userId: event.locals.user?.id
  });

  // 返回给客户端的简化错误信息
  return {
    message: status >= 500 ? 'Internal Server Error' : message,
    errorId
  };
};
```

---

## 与 Next.js / Nuxt 对比

| 特性 | SvelteKit 2.x | Next.js 15 | Nuxt 3 |
|------|---------------|------------|--------|
| **路由模型** | 文件系统路由（`+page`） | 文件系统路由（App Router） | 文件系统路由（pages/ + app/） |
| **数据获取** | `load` / `+page.server` | Server Components / `fetch` | `asyncData` / `useFetch` |
| **表单处理** | Form Actions（内置渐进增强） | Server Actions | 手动或第三方库 |
| **Bundle 体积（SPA 基础）** | ~25KB gzipped | ~95KB gzipped | ~58KB gzipped |
| **SSR 吞吐量（RPS）** | ~1,200 | ~850 | ~900 |
| **Edge Runtime 支持** | ✅ 官方适配器（CF/Vercel/Netlify） | ✅ Vercel Edge 原生 | ✅ Nitro 适配器 |
| **学习曲线** | 低（概念少，文档清晰） | 中等（概念多，模式复杂） | 低 |
| **TypeScript 支持** | 优秀（自动生成 `$types`） | 优秀 | 优秀 |
| **生态规模** | 中等（快速增长） | 极大（React 生态） | 大（Vue 生态） |
| **编译策略** | 编译时优化（无 Virtual DOM） | 运行时优化 + RSC | 编译时 + 运行时优化 |
| **内置功能** | 路由、load、actions、API、适配器 | 路由、RSC、API、images、font | 路由、data、API、modules、devtools |
| **状态管理** | Svelte 5 Runes（内置） | useState / Context / 外部库 | Pinia / Composables |

来源：devmorph.dev benchmark 2026-02 | 测试环境：Node.js 22, 4 vCPU, 8GB RAM

::: info 性能差异来源
SvelteKit 的包体积和 SSR 性能优势主要源于 Svelte 的编译时优化策略。Svelte 在构建阶段将组件编译为高效的命令式 DOM 操作代码，消除了运行时的 Virtual DOM diff 开销。这使得 SvelteKit 在 SSR 时生成的 HTML 更轻量，客户端水合（hydration）也更快。
:::

---

## 2026 新特性

SvelteKit 2.x 持续演进，以下是截至 2026 年 5 月的重要更新：

| 特性 | 版本 | 说明 |
|------|------|------|
| **Remote Functions** | 2.50+（实验性） | RPC-like 函数调用，自动渐进增强，无需手写 API 端点 |
| **Navigation Scroll** | 2.51+ | `beforeNavigate` / `onNavigate` / `afterNavigate` 包含精确的滚动位置信息，支持更细粒度的导航控制 |
| **Vite 8 支持** | 2.53+ | 全面兼容 Vite 8 的新特性，包括改进的模块热替换和构建性能 |
| **`match()` 工具函数** | 2.52+ | 路径反向解析：给定 URL 反推到 route id 和 params，用于程序化导航和链接生成 |
| **`better-auth` addon** | sv 0.12+ | Svelte CLI (`sv`) 官方集成认证脚手架，一键添加 OAuth、密码登录、会话管理 |
| **改进的 Streaming** | 2.48+ | 支持更多数据类型的流式传输，错误边界处理更完善 |
| **适配器性能优化** | 持续 | Node.js 适配器启动时间减少 30%，Cloudflare 适配器包体积减少 15% |

### Remote Functions 预览

Remote Functions 是 SvelteKit 正在实验的 RPC 功能，旨在进一步简化客户端-服务端通信：

```ts
// src/lib/server/remote.ts（实验性 API，可能变更）
import { remote } from '@sveltejs/kit/remote';

export const getUser = remote(async (id: string) => {
  // 这段代码只在服务端运行
  return await db.query.users.findFirst({ where: eq(users.id, id) });
});
```

```svelte
<script>
  import { getUser } from '$lib/server/remote';

  let userId = $state('123');
  // 直接调用服务端函数，SvelteKit 自动处理 RPC 调用和类型安全
  let user = $derived(getUser(userId));
</script>
```

---

## 最佳实践总结

### 1. 数据加载策略

- **静态内容**：使用 `+page.ts` + `prerender = true`
- **用户相关动态内容**：使用 `+page.server.ts`（保护数据隐私）
- **可公开的动态内容**：使用 `+page.ts`（支持客户端导航缓存）
- **慢速数据**：使用 Promise streaming 优化首屏

### 2. 表单设计

- 始终从原生 HTML Form 开始，再添加 `use:enhance`
- 服务端验证是必须的，客户端验证是体验优化
- 使用 `fail()` 返回验证错误，保持表单状态
- 利用乐观更新提升感知性能

### 3. 部署选择

| 场景 | 推荐适配器 |
|------|-----------|
| 个人项目/博客 | `adapter-static` + CDN |
| 商业 SaaS | `adapter-node` + Docker |
| Serverless | `adapter-vercel` 或 `adapter-cloudflare` |
| 边缘计算 | `adapter-cloudflare`（Workers） |

### 4. 类型安全

SvelteKit 自动生成 `$types` 导入，务必使用它们：

```ts
import type { PageLoad, PageServerLoad, Actions, RequestHandler } from './$types';
// 而非手动定义类型
```

---

## 参考资源

- [SvelteKit 官方文档](https://kit.svelte.dev/docs) 📚 — 最权威、最全面的参考
- [SvelteKit 交互式教程](https://learn.svelte.dev) 📚 — 通过浏览器内的实战学习
- [Svelte CLI (sv)](https://github.com/sveltejs/cli) 🛠️ — 项目脚手架和 addon 系统
- [适配器文档](https://kit.svelte.dev/docs/adapters) 📚 — 部署配置详解
- [Svelte 5 Runes 指南](02-svelte-5-runes) 📚 — SvelteKit 构建于 Svelte 5 之上
- [Svelte Society](https://sveltesociety.dev/) 🌐 — 社区组件、模板和资源库

> **最后更新**: 2026-05-02 | **SvelteKit 版本**: 2.53.x | **数据来源**: kit.svelte.dev, GitHub Stars 2026-05, npm registry 2026-05
