---
dimension: 综合
sub-dimension: Multi tenancy
created: 2026-04-28
---

# 模块归属声明

本模块归属 **「综合」** 维度，聚焦 Multi tenancy 核心概念与工程实践。

## 包含内容

- 多租户架构模式（Shared Database / Schema-per-Tenant / Database-per-Tenant）
- 租户上下文传递与隔离（AsyncLocalStorage / CLS）
- 租户解析策略（子域名 / Header / JWT / 路径参数）
- 数据库层路由与连接池管理
- Schema 级隔离与 PostgreSQL Row-Level Security
- 租户级资源配额与限流

## 相关索引

- `30-knowledge-base/30.2-categories/README.md` — 分类总览
- `20-code-lab/` — 代码实验室实践

## 目录内容

- 📄 README.md
- 📄 THEORY.md
- 📄 _MIGRATED_FROM.md
- 📄 database-router.test.ts
- 📄 database-router.ts
- 📄 index.ts
- 📄 resource-quota.test.ts
- 📄 resource-quota.ts
- 📄 schema-isolation.test.ts
- 📄 schema-isolation.ts
- 📄 tenant-architecture.test.ts
- 📄 tenant-architecture.ts
- 📄 tenant-config.test.ts
- 📄 tenant-config.ts
- 📄 tenant-context.test.ts
- 📄 tenant-context.ts
- 📄 tenant-resolver.test.ts
- 📄 tenant-resolver.ts


---

> 此分类文档由批量生成脚本自动创建，请根据实际模块内容补充和调整。

## 子模块索引

| 子模块 | 说明 | 关键文件 |
|--------|------|----------|
| `tenant-architecture/` | 多租户架构模式（共享/独立 schema） | `tenant-architecture.ts`, `tenant-architecture.test.ts` |
| `tenant-config/` | 租户配置管理与动态加载 | `tenant-config.ts`, `tenant-config.test.ts` |
| `tenant-context/` | 请求级租户上下文传递 | `tenant-context.ts`, `tenant-context.test.ts` |
| `tenant-resolver/` | 租户标识解析（域名/Header/JWT） | `tenant-resolver.ts`, `tenant-resolver.test.ts` |
| `database-router/` | 数据层路由与分片 | `database-router.ts`, `database-router.test.ts` |
| `schema-isolation/` | Schema 级隔离与权限控制 | `schema-isolation.ts`, `schema-isolation.test.ts` |
| `resource-quota/` | 租户级资源配额与限流 | `resource-quota.ts`, `resource-quota.test.ts` |

## 代码示例

### 基于 AsyncLocalStorage 的租户上下文隔离

```typescript
import { AsyncLocalStorage } from 'async_hooks';

const tenantStorage = new AsyncLocalStorage<{ tenantId: string; dbUrl: string }>();

export function withTenant<T>(tenant: { tenantId: string; dbUrl: string }, fn: () => T): T {
  return tenantStorage.run(tenant, fn);
}

export function getCurrentTenant() {
  const store = tenantStorage.getStore();
  if (!store) throw new Error('Tenant context not available');
  return store;
}
```

### 租户解析中间件（域名 / Header / JWT）

```typescript
// tenant-resolver.ts
import type { IncomingMessage, ServerResponse } from 'http';

interface TenantConfig {
  tenantId: string;
  schema: string;
  dbPool: string;
}

function resolveTenant(req: IncomingMessage): TenantConfig {
  // 1. 子域名解析：acme.example.com → tenantId = acme
  const host = req.headers.host || '';
  const subdomain = host.split('.')[0];
  if (subdomain && subdomain !== 'www') {
    return lookupTenantById(subdomain);
  }

  // 2. Header 解析
  const headerId = req.headers['x-tenant-id'] as string;
  if (headerId) return lookupTenantById(headerId);

  // 3. JWT 解析
  const auth = req.headers.authorization || '';
  if (auth.startsWith('Bearer ')) {
    const payload = decodeJwt(auth.slice(7));
    return lookupTenantById(payload.tenantId);
  }

  throw new Error('Unable to resolve tenant');
}

// Express / Node.js HTTP 中间件
export function tenantMiddleware(
  req: IncomingMessage & { tenant?: TenantConfig },
  res: ServerResponse,
  next: () => void
) {
  try {
    req.tenant = resolveTenant(req);
    next();
  } catch (e) {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: 'Tenant resolution failed' }));
  }
}
```

### Schema 级隔离与路由

```typescript
// schema-isolation.ts — 基于 PostgreSQL row-level security + schema
import { Pool } from 'pg';

class SchemaIsolatedPool {
  constructor(private basePool: Pool) {}

  async query(tenantSchema: string, sql: string, params?: unknown[]) {
    const client = await this.basePool.connect();
    try {
      await client.query(`SET search_path TO ${tenantSchema}, public`);
      return await client.query(sql, params);
    } finally {
      client.release();
    }
  }
}

// database-router.ts — 动态数据库连接路由
class DatabaseRouter {
  private pools = new Map<string, Pool>();

  getPool(tenantId: string, dbUrl: string): Pool {
    if (!this.pools.has(tenantId)) {
      this.pools.set(tenantId, new Pool({ connectionString: dbUrl, max: 10 }));
    }
    return this.pools.get(tenantId)!;
  }

  async routeQuery(tenantId: string, dbUrl: string, sql: string, params?: unknown[]) {
    const pool = this.getPool(tenantId, dbUrl);
    return pool.query(sql, params);
  }
}
```

### PostgreSQL Row-Level Security（RLS）策略

```sql
-- 启用 RLS 的租户隔离示例
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 为每个租户创建策略
CREATE POLICY tenant_isolation_policy ON orders
  USING (tenant_id = current_setting('app.current_tenant')::UUID);

-- 应用层在每个查询前设置租户上下文
-- await client.query("SET app.current_tenant = 'tenant-acme-uuid'");
```

```typescript
// rls-client.ts — Prisma + PostgreSQL RLS 集成
import { PrismaClient } from '@prisma/client';

export function createPrismaClientWithRLS(tenantId: string) {
  const prisma = new PrismaClient({
    log: ['query', 'error'],
  });

  // 使用中间件在每个查询前注入 RLS 上下文
  prisma.$use(async (params, next) => {
    await prisma.$executeRawUnsafe(`SET LOCAL app.current_tenant = '${tenantId}'`);
    return next(params);
  });

  return prisma;
}
```

### 租户级资源配额限流

```typescript
// resource-quota.ts — 基于 Token Bucket 的租户限流
class TenantRateLimiter {
  private buckets = new Map<string, { tokens: number; last: number }>();
  private readonly capacity: number;
  private readonly refillRate: number; // tokens per ms

  constructor(capacity: number, refillPerSecond: number) {
    this.capacity = capacity;
    this.refillRate = refillPerSecond / 1000;
  }

  allow(tenantId: string, cost = 1): boolean {
    const now = Date.now();
    const bucket = this.buckets.get(tenantId) || { tokens: this.capacity, last: now };

    const elapsed = now - bucket.last;
    bucket.tokens = Math.min(this.capacity, bucket.tokens + elapsed * this.refillRate);
    bucket.last = now;

    if (bucket.tokens >= cost) {
      bucket.tokens -= cost;
      this.buckets.set(tenantId, bucket);
      return true;
    }

    this.buckets.set(tenantId, bucket);
    return false;
  }
}

// 使用示例：每个租户每秒最多 100 次请求
const limiter = new TenantRateLimiter(100, 100);
if (!limiter.allow(req.tenant!.tenantId)) {
  res.statusCode = 429;
  res.end('Rate limit exceeded');
}
```

### 多租户缓存键命名空间

```typescript
// tenant-cache.ts — Redis 缓存键隔离
class TenantCache {
  constructor(private redis: Redis, private keyPrefix = 'tenant') {}

  private namespacedKey(tenantId: string, key: string): string {
    return `${this.keyPrefix}:${tenantId}:${key}`;
  }

  async get<T>(tenantId: string, key: string): Promise<T | null> {
    const raw = await this.redis.get(this.namespacedKey(tenantId, key));
    return raw ? JSON.parse(raw) : null;
  }

  async set(tenantId: string, key: string, value: unknown, ttlSeconds = 300): Promise<void> {
    await this.redis.setex(
      this.namespacedKey(tenantId, key),
      ttlSeconds,
      JSON.stringify(value)
    );
  }

  async flushTenant(tenantId: string): Promise<void> {
    const pattern = this.namespacedKey(tenantId, '*');
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}
```

## 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| MDN | 文档 | [developer.mozilla.org](https://developer.mozilla.org) |
| web.dev | 指南 | [web.dev](https://web.dev) |
| Microsoft — Multi-tenant SaaS | 架构指南 | [learn.microsoft.com/azure/architecture/example-scenario/multi-saas](https://learn.microsoft.com/en-us/azure/architecture/example-scenario/multi-saas/multi-tenant-data-partitioning) |
| AWS SaaS Tenant Isolation | 最佳实践 | [docs.aws.amazon.com/saas](https://docs.aws.amazon.com/wellarchitected/latest/saas-lens/tenant-isolation.html) |
| Stripe — Multitenancy at Scale | 工程博客 | [stripe.com/blog](https://stripe.com/blog) |
| Node.js AsyncLocalStorage | API 文档 | [nodejs.org/api/async_context](https://nodejs.org/api/async_context.html) |
| Prisma — Multi-tenancy Guide | 文档 | [prisma.io/docs/orm/overview/prisma-in-your-stack/multi-tenancy](https://www.prisma.io/docs/orm/overview/prisma-in-your-stack/multi-tenancy) |
| PostgreSQL Row Level Security | 文档 | [postgresql.org/docs/current/ddl-rowsecurity.html](https://www.postgresql.org/docs/current/ddl-rowsecurity.html) |
| CNCF — SaaS Tenant Isolation Patterns | 白皮书 | [cncf.io](https://www.cncf.io/reports/) |
| Martin Fowler — MultiTenancy Bliki | 文章 | [martinfowler.com/bliki/Multitenancy.html](https://martinfowler.com/bliki/Multitenancy.html) |
| Prisma Middleware | 文档 | [prisma.io/docs/orm/prisma-client/client-extensions/middleware](https://www.prisma.io/docs/orm/prisma-client/client-extensions/middleware) |
| Node.js Async Hooks | 文档 | [nodejs.org/api/async_hooks.html](https://nodejs.org/api/async_hooks.html) |
| Redis Keyspace Notifications | 文档 | [redis.io/docs/manual/keyspace-notifications](https://redis.io/docs/latest/develop/use/keyspace-notifications/) |

---

*最后更新: 2026-04-29*
