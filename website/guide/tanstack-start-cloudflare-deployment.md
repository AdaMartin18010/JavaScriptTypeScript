---
title: TanStack Start + Cloudflare Workers 部署完全指南
description: "Awesome JS/TS Ecosystem 指南: TanStack Start + Cloudflare Workers 部署完全指南"
---

---
title: 'TanStack Start + Cloudflare Workers 部署完全指南'
---

# TanStack Start + Cloudflare Workers 部署完全指南

> 本指南基于 Cloudflare 官方 2026-04 文档编写，涵盖从项目初始化到生产部署的完整流程。基准版本：`@tanstack/react-start@1.154.0`

---

## 目录

- [TanStack Start + Cloudflare Workers 部署完全指南](#tanstack-start--cloudflare-workers-部署完全指南)
  - [目录](#目录)
  - [1. 快速开始](#1-快速开始)
    - [1.1 创建新项目](#11-创建新项目)
    - [1.2 在现有项目中接入](#12-在现有项目中接入)
  - [2. 项目配置](#2-项目配置)
    - [2.1 `vite.config.ts`](#21-viteconfigts)
    - [2.2 `wrangler.jsonc`](#22-wranglerjsonc)
    - [2.3 `package.json` scripts](#23-packagejson-scripts)
  - [3. Cloudflare Bindings 使用](#3-cloudflare-bindings-使用)
    - [3.1 配置 D1 数据库](#31-配置-d1-数据库)
    - [3.2 配置 KV 命名空间](#32-配置-kv-命名空间)
    - [3.3 配置 R2 对象存储](#33-配置-r2-对象存储)
    - [3.4 类型生成](#34-类型生成)
  - [4. 环境变量管理](#4-环境变量管理)
    - [4.1 普通变量（Vars）](#41-普通变量vars)
    - [4.2 密钥（Secrets）](#42-密钥secrets)
    - [4.3 本地开发环境变量](#43-本地开发环境变量)
  - [5. 部署命令与 CI/CD](#5-部署命令与-cicd)
    - [5.1 本地部署](#51-本地部署)
    - [5.2 CI/CD 示例（GitHub Actions）](#52-cicd-示例github-actions)
    - [5.3 预发布（Preview）部署](#53-预发布preview部署)
  - [6. SSR Streaming](#6-ssr-streaming)
    - [6.1 Streaming 的工作方式](#61-streaming-的工作方式)
    - [6.2 自定义服务端入口（可选）](#62-自定义服务端入口可选)
    - [6.3 性能优化建议](#63-性能优化建议)
  - [7. 常见问题排查](#7-常见问题排查)
    - [7.1 构建报错：`process is not defined`](#71-构建报错process-is-not-defined)
    - [7.2 预渲染（Prerender）时 D1/KV 查询失败](#72-预渲染prerender时-d1kv-查询失败)
    - [7.3 TypeScript 不识别 `env.DB` 等 Bindings](#73-typescript-不识别-envdb-等-bindings)
    - [7.4 本地开发时 Bindings 返回 `undefined`](#74-本地开发时-bindings-返回-undefined)
  - [8. 参考资源](#8-参考资源)

---

## 1. 快速开始

### 1.1 创建新项目

Cloudflare 提供了一键初始化模板，已内置 TanStack Start 与 Cloudflare Workers 配置：

```bash
npm create cloudflare@latest my-app -- --framework=tanstack-start
cd my-app
npm install
```

### 1.2 在现有项目中接入

若已有 TanStack Start 项目，仅需安装两个依赖并修改配置文件：

```bash
npm i -D @cloudflare/vite-plugin wrangler
```

---

## 2. 项目配置

### 2.1 `vite.config.ts`

在 Vite 配置中，**必须**将 `@cloudflare/vite-plugin` 置于 `@tanstack/react-start/plugin/vite` 之前（或按官方示例顺序）。`viteEnvironment: { name: 'ssr' }` 是 Cloudflare 插件的必需参数，用于指定 SSR 环境的名称。

```typescript
import { defineConfig } from 'vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import { cloudflare } from '@cloudflare/vite-plugin';
import viteReact from '@vitejs/plugin-react';
import tsConfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    cloudflare({ viteEnvironment: { name: 'ssr' } }),
    tanstackStart(),
    viteReact(),
    tsConfigPaths(),
  ],
});
```

**关键说明**：

- `cloudflare()` 插件负责在本地开发时模拟 Cloudflare Workers 运行时，并在构建时生成兼容 Workers 的产物。
- `tanstackStart()` 插件负责处理 Server Function 的编译、路由树生成、SSR 入口注入等框架逻辑。

### 2.2 `wrangler.jsonc`

`wrangler.jsonc` 是 Cloudflare Workers 的配置文件（JSON with Comments）。TanStack Start 的入口由框架提供，**必须**将 `main` 指向 `@tanstack/react-start/server-entry`。

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "my-tanstack-start-app",
  // 使用今天的日期或更近的兼容性日期
  "compatibility_date": "2026-04-15",
  "compatibility_flags": ["nodejs_compat"],
  // 指向 TanStack Start 内置的服务端入口
  "main": "@tanstack/react-start/server-entry",
  "observability": {
    "enabled": true
  },
  // 若需静态资源托管，可配置 assets（可选）
  "assets": {
    "directory": ".output/public"
  }
}
```

**字段解释**：

| 字段 | 说明 |
|------|------|
| `compatibility_date` | Cloudflare Workers 运行时的 API 兼容基准日期，建议使用项目上线日期或更新 |
| `compatibility_flags` | `nodejs_compat` 为必需，开启 Node.js API 兼容层（如 `crypto`、`Buffer` 等） |
| `main` | 固定为 `@tanstack/react-start/server-entry`，框架会解析为实际构建产物 |
| `observability` | 开启 Workers 可观测性面板，便于查看日志与性能指标 |

### 2.3 `package.json` scripts

```json
{
  "scripts": {
    "dev": "vite dev",
    "build": "vite build && tsc --noEmit",
    "preview": "vite preview",
    "deploy": "npm run build && wrangler deploy",
    "cf-typegen": "wrangler types"
  },
  "dependencies": {
    "@tanstack/react-router": "latest",
    "@tanstack/react-start": "^1.154.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@cloudflare/vite-plugin": "latest",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "typescript": "^5.8.0",
    "vite": "latest",
    "wrangler": "latest"
  }
}
```

**脚本说明**：

- `dev`：启动 Vite 开发服务器，同时由 `@cloudflare/vite-plugin` 提供本地 Workers 运行时模拟
- `build`：Vite 构建产物 + TypeScript 类型检查（`--noEmit` 不输出额外文件）
- `preview`：本地预览生产构建产物
- `deploy`：构建后调用 `wrangler deploy` 推送到 Cloudflare
- `cf-typegen`：根据 `wrangler.jsonc` 中的 Bindings 配置，自动生成 `worker-configuration.d.ts` 类型定义文件

---

## 3. Cloudflare Bindings 使用

Bindings 是 Cloudflare 平台服务的运行时句柄（D1、KV、R2、AI 等）。在 TanStack Start 中，通过 `cloudflare:workers` 模块导入的 `env` 对象访问，**切勿**使用 `process.env`。

### 3.1 配置 D1 数据库

在 `wrangler.jsonc` 中声明 D1 绑定：

```jsonc
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "my-database",
      "database_id": "your-database-id"
    }
  ]
}
```

在 Server Function 中使用：

```typescript
import { createServerFn } from '@tanstack/react-start/server';
import { env } from 'cloudflare:workers';

export const getUsers = createServerFn({ method: 'GET' })
  .handler(async () => {
    const { results } = await env.DB
      .prepare('SELECT id, name, email FROM users LIMIT 50')
      .all<{ id: string; name: string; email: string }>();

    return { users: results };
  });
```

### 3.2 配置 KV 命名空间

在 `wrangler.jsonc` 中声明 KV 绑定：

```jsonc
{
  "kv_namespaces": [
    {
      "binding": "CACHE",
      "id": "your-kv-namespace-id"
    }
  ]
}
```

在 Server Function 中使用：

```typescript
import { createServerFn } from '@tanstack/react-start/server';
import { env } from 'cloudflare:workers';

export const getCacheValue = createServerFn({ method: 'GET' })
  .validator((key: string) => key)
  .handler(async ({ data: key }) => {
    const value = await env.CACHE.get(key);
    return { key, value };
  });

export const setCacheValue = createServerFn({ method: 'POST' })
  .validator((data: { key: string; value: string; ttl?: number }) => data)
  .handler(async ({ data }) => {
    await env.CACHE.put(data.key, data.value, {
      expirationTtl: data.ttl,
    });
    return { success: true };
  });
```

### 3.3 配置 R2 对象存储

在 `wrangler.jsonc` 中声明 R2 绑定：

```jsonc
{
  "r2_buckets": [
    {
      "binding": "STORAGE",
      "bucket_name": "my-bucket"
    }
  ]
}
```

在 Server Function 中使用：

```typescript
import { createServerFn } from '@tanstack/react-start/server';
import { env } from 'cloudflare:workers';

export const uploadFile = createServerFn({ method: 'POST' })
  .validator((data: { key: string; content: string; contentType?: string }) => data)
  .handler(async ({ data }) => {
    await env.STORAGE.put(data.key, data.content, {
      httpMetadata: { contentType: data.contentType ?? 'application/octet-stream' },
    });
    return { success: true };
  });

export const downloadFile = createServerFn({ method: 'GET' })
  .validator((key: string) => key)
  .handler(async ({ data: key }) => {
    const object = await env.STORAGE.get(key);
    if (!object) {
      return { exists: false, text: null };
    }
    const text = await object.text();
    return { exists: true, text };
  });
```

### 3.4 类型生成

每次修改 `wrangler.jsonc` 中的 Bindings 后，运行：

```bash
npm run cf-typegen
```

这会在项目根目录生成 `worker-configuration.d.ts`，为 `env` 对象提供完整的 TypeScript 类型支持：

```typescript
// worker-configuration.d.ts（自动生成，勿手动修改）
interface Env {
  DB: D1Database;
  CACHE: KVNamespace;
  STORAGE: R2Bucket;
}
```

---

## 4. 环境变量管理

### 4.1 普通变量（Vars）

对于非敏感配置（如 API URL、功能开关），直接在 `wrangler.jsonc` 中声明：

```jsonc
{
  "vars": {
    "APP_NAME": "My TanStack App",
    "API_BASE_URL": "https://api.example.com"
  }
}
```

在 Server Function 中读取：

```typescript
import { env } from 'cloudflare:workers';

const apiUrl = env.API_BASE_URL;
```

### 4.2 密钥（Secrets）

对于敏感信息（如数据库密码、JWT Secret、第三方 API Key），**不要**写入 `wrangler.jsonc`，应使用 Wrangler CLI：

```bash
# 设置密钥
wrangler secret put JWT_SECRET
wrangler secret put STRIPE_API_KEY

# 列出密钥（仅名称）
wrangler secret list
```

在 Server Function 中，Secrets 与普通 Vars 一样通过 `env` 读取：

```typescript
import { env } from 'cloudflare:workers';

const jwtSecret = env.JWT_SECRET;
```

### 4.3 本地开发环境变量

本地开发时，创建 `.dev.vars` 文件（不被 Git 跟踪，格式为 `KEY=VALUE`）：

```text
JWT_SECRET=dev-secret-only
STRIPE_API_KEY=sk_test_xxx
```

`vite dev` 配合 `@cloudflare/vite-plugin` 会自动读取 `.dev.vars` 中的变量并注入到本地 Workers 运行时。

---

## 5. 部署命令与 CI/CD

### 5.1 本地部署

```bash
# 1. 登录 Cloudflare 账户（仅需一次）
npx wrangler login

# 2. 构建并部署
npm run deploy
```

### 5.2 CI/CD 示例（GitHub Actions）

```yaml
name: Deploy to Cloudflare Workers

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Deploy
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
        run: npx wrangler deploy
```

**注意**：

- 在 GitHub 仓库的 `Settings → Secrets` 中配置 `CLOUDFLARE_API_TOKEN`
- 在 Cloudflare Dashboard 中创建 API Token 时，选择 **Edit Cloudflare Workers** 模板

### 5.3 预发布（Preview）部署

每次 Pull Request 或分支推送时，可部署到预览环境：

```bash
npx wrangler deploy --branch preview
```

---

## 6. SSR Streaming

TanStack Start 默认启用流式 SSR（Streaming SSR）。在 Cloudflare Workers 环境中，框架使用 `renderToReadableStream`（Web Streams API）将 HTML 分块发送给客户端。

### 6.1 Streaming 的工作方式

1. **Shell 优先**：服务器先渲染页面的静态外壳（导航、布局等），立即发送给浏览器
2. **Suspense 边界流式填充**：被 `<Suspense>` 包裹的异步数据区域，在数据就绪后以 inline script 形式追加到流中
3. **选择性水合（Selective Hydration）**：客户端优先水合用户交互区域，非关键区域延后水合

### 6.2 自定义服务端入口（可选）

若需自定义 Workers 行为（如 scheduled handler、service bindings、Workflows），可创建自定义入口文件并在 `wrangler.jsonc` 中修改 `main`：

```typescript
// src/server.ts
import {
  createStartHandler,
  defaultStreamHandler,
} from '@tanstack/react-start/server';
import { getRouterManifest } from '@tanstack/react-start/router-manifest';
import { createRouter } from './router';

// 标准 TanStack Start 流式处理器
export default createStartHandler({
  createRouter,
  getRouterManifest,
})(defaultStreamHandler);
```

```jsonc
{
  "main": "src/server.ts"
}
```

### 6.3 性能优化建议

- **优先渲染 Above-the-Fold 内容**：将关键数据放在路由 loader 中直接返回，避免不必要的 Suspense
- **控制 chunk 大小**：对于大数据列表，使用分页或虚拟滚动，避免单次流式传输过大 HTML
- **设置超时**：在 Server Function 中设置合理的 fetch / DB 查询超时，防止流式连接挂起

---

## 7. 常见问题排查

### 7.1 构建报错：`process is not defined`

**原因**：Cloudflare Workers 运行时没有 `process` 对象。
**解决**：所有环境变量与 Bindings 必须通过 `cloudflare:workers` 的 `env` 访问。

### 7.2 预渲染（Prerender）时 D1/KV 查询失败

**原因**：`vite build` 阶段的静态预渲染在本地 Node 进程执行，无法访问 Cloudflare Bindings。
**解决**：

- 对依赖 Bindings 的路由禁用预渲染：

```typescript
export const Route = createFileRoute('/dashboard')({
  loader: async () => { /* 查询 D1 */ },
  prerender: false,
});
```

- 或在 loader 中判断运行时的 Cloudflare 上下文是否存在：

```typescript
loader: async ({ context }) => {
  if (typeof context.cloudflare === 'undefined') {
    return { users: [] }; // 预渲染阶段返回空数据
  }
  const result = await context.cloudflare.env.DB.prepare('SELECT * FROM users').all();
  return { users: result.results };
}
```

### 7.3 TypeScript 不识别 `env.DB` 等 Bindings

**原因**：修改 `wrangler.jsonc` 后未重新生成类型定义。
**解决**：

```bash
npm run cf-typegen
```

确保 `tsconfig.json` 包含了生成的 `worker-configuration.d.ts`。

### 7.4 本地开发时 Bindings 返回 `undefined`

**原因**：`@cloudflare/vite-plugin` 未正确加载 `wrangler.jsonc`。
**解决**：

- 确认 `vite.config.ts` 中 `cloudflare()` 插件位于 `tanstackStart()` 之前
- 确认 `wrangler.jsonc` 位于项目根目录
- 对于本地未创建的 D1 数据库，先执行 `wrangler d1 create my-database`

---

## 8. 参考资源

- [Cloudflare Workers - TanStack Start 官方指南](https://developers.cloudflare.com/workers/framework-guides/web-apps/tanstack-start/)
- [TanStack Start 部署文档](https://tanstack.com/router/latest/docs/framework/react/start/deployment)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)