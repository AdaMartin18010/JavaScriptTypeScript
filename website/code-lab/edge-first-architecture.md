---
title: Edge-First 架构实战
description: "Awesome JS/TS Ecosystem 代码实验室: Edge-First 架构实战"
---

# 🌐 Edge-First 架构实战

> 最后更新: 2026-05-01 | 难度: 进阶 | 预计用时: 4 小时

---

## 概述

Edge Computing 已从"酷炫演示"变为"现代 Web 默认架构"。Cloudflare Workers 在 State of JS 2025 中使用率从 **1% 暴增至 12%**，Edge 函数覆盖 **300+ 全球位置**，相对传统 Serverless 成本节省 **70%**。

本实验室将构建一个完整的 Edge-First 全栈应用：

```
前端: React + Vite + TanStack Query
API: Hono + Zod (Cloudflare Workers)
数据库: Drizzle ORM + Cloudflare D1 (SQLite)
缓存: Cloudflare KV
部署: Wrangler CLI + GitHub Actions
```

---

## 环境准备

### 前置要求

- Node.js >= 22.0.0
- Wrangler CLI: `npm install -g wrangler`
- Cloudflare 账号（免费即可）

### 初始化项目

```bash
# 创建 monorepo
mkdir edge-first-app && cd edge-first-app
pnpm init

# 配置 pnpm workspace
cat > pnpm-workspace.yaml << 'EOF'
packages:
  - 'apps/*'
  - 'packages/*'
EOF

# 创建应用目录
mkdir -p apps/web apps/api packages/schema
```

---

## 第一步: Edge API with Hono

### 安装依赖

```bash
cd apps/api
pnpm init
pnpm add hono zod @hono/zod-validator
pnpm add -D wrangler @cloudflare/workers-types typescript
```

### Hono + Zod 路由定义

```typescript
// apps/api/src/index.ts
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { D1Database, KVNamespace } from '@cloudflare/workers-types';

export interface Env {
  DB: D1Database;
  CACHE: KVNamespace;
}

const app = new Hono<{ Bindings: Env }>();

// 健康检查
app.get('/health', (c) => c.json({ status: 'ok', region: c.req.raw.cf?.colo }));

// 创建任务
const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
});

app.post('/tasks', zValidator('json', createTaskSchema), async (c) => {
  const data = c.req.valid('json');
  const { success } = await c.env.DB.prepare(
    'INSERT INTO tasks (title, priority, created_at) VALUES (?, ?, ?)'
  )
    .bind(data.title, data.priority, Date.now())
    .run();

  if (!success) return c.json({ error: 'Failed to create task' }, 500);
  return c.json({ success: true }, 201);
});

// 获取任务列表（带 KV 缓存）
app.get('/tasks', async (c) => {
  const cacheKey = 'tasks:all';
  const cached = await c.env.CACHE.get(cacheKey);

  if (cached) {
    return c.json({ data: JSON.parse(cached), source: 'kv' });
  }

  const { results } = await c.env.DB.prepare(
    'SELECT * FROM tasks ORDER BY created_at DESC LIMIT 50'
  ).all();

  // 缓存 60 秒
  await c.env.CACHE.put(cacheKey, JSON.stringify(results), { expirationTtl: 60 });
  return c.json({ data: results, source: 'db' });
});

export default app;
```

### Wrangler 配置

```toml
# apps/api/wrangler.toml
name = "edge-first-api"
main = "src/index.ts"
compatibility_date = "2026-05-01"
compatibility_flags = ["nodejs_compat"]

[[d1_databases]]
binding = "DB"
database_name = "edge-tasks-db"
database_id = "your-db-id"

[[kv_namespaces]]
binding = "CACHE"
id = "your-kv-id"
```

---

## 第二步: Drizzle ORM + D1

### 安装 ORM

```bash
cd packages/schema
pnpm init
pnpm add drizzle-orm
pnpm add -D drizzle-kit @types/better-sqlite3
```

### Schema 定义

```typescript
// packages/schema/src/index.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const tasks = sqliteTable('tasks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  priority: text('priority', { enum: ['low', 'medium', 'high'] }).notNull().default('medium'),
  completed: integer('completed', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
```

### 迁移配置

```typescript
// packages/schema/drizzle.config.ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/index.ts',
  out: './migrations',
  dialect: 'sqlite',
  driver: 'd1-http',
  dbCredentials: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
    databaseId: process.env.D1_DATABASE_ID!,
    token: process.env.CLOUDFLARE_API_TOKEN!,
  },
});
```

---

## 第三步: 前端 React + Vite

### 安装依赖

```bash
cd apps/web
pnpm create vite . --template react-ts
pnpm add @tanstack/react-query zod
```

### Edge API 客户端

```typescript
// apps/web/src/lib/api.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_BASE = import.meta.env.VITE_API_URL;

export interface Task {
  id: number;
  title: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  createdAt: string;
}

export const useTasks = () =>
  useQuery({
    queryKey: ['tasks'],
    queryFn: async (): Promise<Task[]> => {
      const res = await fetch(`${API_BASE}/tasks`);
      const json = await res.json();
      return json.data;
    },
    // Edge 缓存已经很高效，前端适当延长 staleTime
    staleTime: 30000,
  });

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (task: { title: string; priority: string }) => {
      const res = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task),
      });
      if (!res.ok) throw new Error('Failed to create task');
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });
};
```

### App 组件

```tsx
// apps/web/src/App.tsx
import { useState } from 'react';
import { useTasks, useCreateTask } from './lib/api';

function App() {
  const [title, setTitle] = useState('');
  const { data: tasks, isLoading } = useTasks();
  const createTask = useCreateTask();

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">🌐 Edge-First Tasks</h1>

      <div className="flex gap-2 mb-6">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New task..."
          className="flex-1 border rounded px-3 py-2"
        />
        <button
          onClick={() => {
            createTask.mutate({ title, priority: 'medium' });
            setTitle('');
          }}
          disabled={createTask.isPending}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {createTask.isPending ? '...' : 'Add'}
        </button>
      </div>

      {isLoading ? (
        <p>Loading from edge...</p>
      ) : (
        <ul className="space-y-2">
          {tasks?.map((task) => (
            <li key={task.id} className="border rounded p-3 flex justify-between">
              <span>{task.title}</span>
              <span className="text-sm text-gray-500">{task.priority}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
```

---

## 第四步: 部署流水线

### GitHub Actions 配置

```yaml
# .github/workflows/deploy-edge.yml
name: Deploy Edge App

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v3
        with: { version: 10 }

      - uses: actions/setup-node@v4
        with: { node-version: '22', cache: 'pnpm' }

      - run: pnpm install --frozen-lockfile

      # 运行数据库迁移
      - name: Apply D1 Migrations
        working-directory: packages/schema
        run: pnpm drizzle-kit migrate
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}

      # 部署 Worker
      - name: Deploy API
        working-directory: apps/api
        run: pnpm wrangler deploy
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}

      # 构建并部署前端
      - name: Build Web
        working-directory: apps/web
        run: pnpm build

      - name: Deploy to Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: edge-first-web
          directory: apps/web/dist
```

---

## Edge 平台对比

| 平台 | 冷启动 | 内存限制 | 执行时间 | 特点 |
|------|--------|----------|----------|------|
| **Cloudflare Workers** | <1ms | 128MB | 30s (付费) | 零出口费用，300+ 城市 |
| **Vercel Edge** | <5ms | 128MB | 30s | Next.js 原生集成 |
| **Deno Deploy** | <1ms | — | 50ms CPU(免费) / 200ms(付费) | Web 标准优先 |
| **Netlify Edge** | <1ms | 128MB | 50ms CPU | Git 原生工作流 |

---

## 性能优化技巧

### 1. KV 缓存策略

```typescript
// 分层缓存: KV → D1 → Origin
const getWithCache = async <T>(
  c: Context,
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 60
): Promise<T> => {
  const cached = await c.env.CACHE.get(key);
  if (cached) return JSON.parse(cached);

  const data = await fetcher();
  await c.env.CACHE.put(key, JSON.stringify(data), { expirationTtl: ttl });
  return data;
};
```

### 2. D1 查询优化

```typescript
// 使用索引提示
const { results } = await c.env.DB.prepare(
  'SELECT * FROM tasks INDEXED BY idx_created_at ORDER BY created_at DESC LIMIT ?'
)
  .bind(50)
  .all();
```

### 3. 边缘地理位置处理

```typescript
app.get('/geo', (c) => {
  const cf = c.req.raw.cf;
  return c.json({
    country: cf?.country,
    city: cf?.city,
    colo: cf?.colo,        // Cloudflare 数据中心代码
    latitude: cf?.latitude,
    longitude: cf?.longitude,
  });
});
```

---

## 扩展挑战

1. **添加 AI 推理**: 集成 Cloudflare Workers AI 绑定，实现任务优先级自动分类
2. **实时同步**: 使用 Durable Objects 实现 WebSocket 实时任务更新
3. **多区域部署**: 配置 Smart Placement 将计算调度至靠近 D1 数据库的区域
4. **R2 文件上传**: 添加附件上传功能，使用 R2 对象存储

---

## 参考资源

- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Hono 框架](https://hono.dev)
- [Drizzle ORM + D1](https://orm.drizzle.team/docs/connect-cloudflare-d1)
- [TanStack Query](https://tanstack.com/query)