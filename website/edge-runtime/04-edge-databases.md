# 04. 边缘数据库与存储

## 挑战

传统数据库连接（如直接连接 PostgreSQL）在 Edge Runtime 中面临问题：
- **TCP 连接**: 多数 Edge 平台不支持原生 TCP
- **连接池**: 短生命周期函数无法维护长连接
- **地理延迟**: 数据库在美国，用户在中国 = 300ms+ 延迟

## 边缘数据库解决方案

### 1. Turso (SQLite on the Edge)

LibSQL 的托管服务，数据库副本分布到全球边缘节点。

```typescript
import { createClient } from '@libsql/client/web';

const client = createClient({
  url: process.env.TURSO_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// 自动路由到最近的副本
const result = await client.execute('SELECT * FROM todos');
```

### 2. Cloudflare D1

Cloudflare 的边缘 SQLite 数据库。

```typescript
const { results } = await env.D1.prepare(
  'SELECT * FROM users WHERE id = ?'
).bind(userId).all();
```

### 3. PlanetScale (Serverless MySQL)

通过 HTTP 协议连接，无需 TCP。

```typescript
import { connect } from '@planetscale/database';

const conn = connect({
  host: process.env.DATABASE_HOST,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
});

const results = await conn.execute('SELECT * FROM users');
```

### 4. Supabase (pgBouncer + Edge)

使用连接池 + 事务模式兼容 Edge。

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(url, key, {
  auth: { persistSession: false }
});
```

## 对比矩阵

| 数据库 | 协议 | 全球复制 | 一致性 | 适用场景 |
|--------|------|---------|--------|----------|
| Turso | HTTP | ✅ 边缘副本 | 最终一致 | 读密集型、全球应用 |
| Cloudflare D1 | 内部 | ✅ 区域 | 强一致 | Workers 生态 |
| PlanetScale | HTTP | ✅ 只读副本 | 强一致 | 写密集型、事务 |
| Supabase | HTTP | ✅ 区域 | 强一致 | 全功能 PostgreSQL |
| Neon | HTTP | ✅ 分支 | 强一致 | 开发环境、无服务器 |

## 架构模式: Read-Through Edge Cache

```
用户请求 → Edge Function → Edge Cache (KV)
              ↓ 缓存未命中
         数据库副本 (Turso/D1)
              ↓ 写入
         主数据库 (PostgreSQL/MySQL)
```

```typescript
// 边缘缓存 + 数据库回源
export async function GET(request: Request) {
  const cacheKey = new URL(request.url).pathname;
  
  // 1. 检查边缘缓存
  const cached = await env.KV.get(cacheKey);
  if (cached) return Response.json(JSON.parse(cached));
  
  // 2. 查询边缘数据库
  const { rows } = await turso.execute(
    'SELECT * FROM posts WHERE slug = ?', [slug]
  );
  
  // 3. 写入缓存 (TTL 60s)
  await env.KV.put(cacheKey, JSON.stringify(rows[0]), { expirationTtl: 60 });
  
  return Response.json(rows[0]);
}
```

## 延伸阅读

- [Turso 文档](https://docs.turso.tech/)
- [Cloudflare D1](https://developers.cloudflare.com/d1/)
- [Edge Database 选型指南](https://edge-database-guide.vercel.app/)
