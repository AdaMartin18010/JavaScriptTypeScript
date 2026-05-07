# 05. Edge 环境 ORM 模式

## Edge 数据库连接的挑战

Edge Runtime 的限制直接影响 ORM 的选择：

| 限制 | 影响 |
|------|------|
| 无原生 TCP | 无法直接连接 PostgreSQL/MySQL |
| 短生命周期 | 连接池难以维护 |
| 小内存 | 大型 ORM 引擎不友好 |

## 解决方案矩阵

### 方案 A: HTTP 数据库驱动 (推荐)

```typescript
// Neon (PostgreSQL over HTTP)
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

export const runtime = 'edge';
export async function GET() {
  const users = await db.select().from(usersTable);
  return Response.json(users);
}
```

### 方案 B: 连接池代理

```typescript
// PlanetScale (Serverless MySQL)
import { connect } from '@planetscale/database';

const conn = connect({
  host: process.env.DATABASE_HOST,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
});

// 内部使用 HTTP/2 连接复用
const results = await conn.execute('SELECT * FROM users');
```

### 方案 C: 边缘原生数据库

```typescript
// Turso (LibSQL on Edge)
import { createClient } from '@libsql/client/web';

const client = createClient({
  url: process.env.TURSO_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

// 自动路由到最近的副本
const result = await client.execute('SELECT * FROM todos');
```

## 各 ORM 的 Edge 支持状态

| ORM | Edge 支持 | 方式 | 备注 |
|-----|----------|------|------|
| Drizzle | ✅ 原生 | neon-http, libsql | 最佳体验 |
| Prisma | ⚠️ 需 Accelerate | @prisma/client/edge | 额外服务 |
| Kysely | ✅ | 任何 HTTP 驱动 | 需手动配置 |
| TypeORM | ❌ | 不支持 | - |

## 架构模式: Edge Cache + Origin DB

```
┌──────────┐     ┌──────────────┐     ┌─────────────┐
│  User    │────▶│ Edge Function│────▶│  Edge Cache │
│ (全球)   │     │ (Drizzle)    │     │ (KV/R2)     │
└──────────┘     └──────────────┘     └──────┬──────┘
                                              │ 未命中
                                       ┌──────▼──────┐
                                       │ Origin DB   │
                                       │ (PostgreSQL)│
                                       └─────────────┘
```

```typescript
export async function GET(request: Request) {
  const cacheKey = new URL(request.url).pathname;
  
  // 1. 检查边缘缓存
  const cached = await env.KV.get(cacheKey);
  if (cached) return Response.json(JSON.parse(cached));
  
  // 2. 查询数据库
  const result = await db.select().from(posts).limit(10);
  
  // 3. 写入缓存
  await env.KV.put(cacheKey, JSON.stringify(result), { expirationTtl: 60 });
  
  return Response.json(result);
}
```

## 延伸阅读

- [Neon Serverless Driver](https://neon.tech/docs/serverless/serverless-driver)
- [Turso Edge Replicas](https://docs.turso.tech/features/edge-replicas)
