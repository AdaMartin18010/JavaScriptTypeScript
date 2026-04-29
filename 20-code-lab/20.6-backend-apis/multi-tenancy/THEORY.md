# 多租户架构理论：从隔离到弹性

> **目标读者**：SaaS 开发者、平台架构师
> **关联文档**：`30-knowledge-base/30.2-categories/multi-tenancy.md` (Legacy) [Legacy link]
> **版本**：2026-04
> **字数**：约 3,200 字

---

## 1. 多租户模型

### 1.1 三种隔离策略

| 策略 | 数据库 | 隔离度 | 成本 | 适用 |
|------|--------|--------|------|------|
| **独立数据库** | 每租户一个 DB | 最高 | 高 | 企业级客户 |
| **共享数据库独立 Schema** | 一个 DB，多 Schema | 中 | 中 | 中型 SaaS |
| **共享数据库共享 Schema** | 行级隔离 | 低 | 低 | 消费级 SaaS |

### 1.2 行级隔离实现

```typescript
// 应用层过滤 — 强制所有查询携带 tenantId
async function getUsers(tenantId: string) {
  return db.users.findMany({
    where: { tenantId },  // 强制过滤
  });
}

// ORM 中间件自动注入 — 防止遗漏
db.$extends({
  query: {
    async $allOperations({ model, operation, args, query }) {
      const tenantId = getCurrentTenantContext();
      if (model && args && tenantId) {
        args.where = { ...args.where, tenantId };
      }
      return query(args);
    },
  },
});
```

```sql
-- 数据库层：PostgreSQL Row Level Security (RLS)
CREATE POLICY tenant_isolation ON users
  USING (tenant_id = current_setting('app.current_tenant')::uuid);

-- 在连接建立时设置租户上下文
SET app.current_tenant = 'tenant-uuid';
```

---

## 2. 租户路由

### 2.1 路由策略

| 策略 | 示例 | 特点 |
|------|------|------|
| **子域名** | `tenant1.saas.com` | 直观、支持自定义域名 |
| **路径前缀** | `saas.com/t/tenant1` | 简单、单证书 |
| **Header** | `X-Tenant-ID: tenant1` | API 友好 |

### 2.2 中间件解析租户

```typescript
// tenant-middleware.ts — Express/Koa 风格租户解析
import { Request, Response, NextFunction } from 'express';

interface TenantContext {
  id: string;
  plan: 'free' | 'pro' | 'enterprise';
  schema?: string; // 共享数据库独立 Schema 时使用
  dbUrl?: string;  // 独立数据库时使用
}

declare global {
  namespace Express {
    interface Request {
      tenant: TenantContext;
    }
  }
}

async function tenantResolver(req: Request, res: Response, next: NextFunction) {
  // 优先级: Header > 子域名 > JWT claim
  const tenantId =
    req.headers['x-tenant-id'] as string ||
    req.subdomains[0] ||
    req.user?.tenantId;

  if (!tenantId) {
    return res.status(400).json({ error: 'Tenant identification required' });
  }

  // 查询租户元数据（可缓存于 Redis）
  const tenant = await getTenantFromCache(tenantId);
  if (!tenant) {
    return res.status(404).json({ error: 'Tenant not found' });
  }

  req.tenant = tenant;
  next();
}
```

---

## 3. 资源配额与限流

```typescript
// resource-quota.ts — 租户级限流与配额检查
interface QuotaConfig {
  requestsPerMinute: number;
  storageBytes: number;
  concurrentConnections: number;
}

const tenantQuota: Record<string, QuotaConfig> = {
  free: { requestsPerMinute: 100, storageBytes: 1e9, concurrentConnections: 10 },
  pro: { requestsPerMinute: 10_000, storageBytes: 1e11, concurrentConnections: 100 },
  enterprise: { requestsPerMinute: Infinity, storageBytes: Infinity, concurrentConnections: 1000 },
};

class TenantRateLimiter {
  private counters = new Map<string, { count: number; resetAt: number }>();

  isAllowed(tenantId: string, plan: string): boolean {
    const quota = tenantQuota[plan] ?? tenantQuota.free;
    const now = Date.now();
    const windowStart = Math.floor(now / 60_000) * 60_000;
    let entry = this.counters.get(tenantId);

    if (!entry || entry.resetAt !== windowStart) {
      entry = { count: 0, resetAt: windowStart };
      this.counters.set(tenantId, entry);
    }

    if (entry.count >= quota.requestsPerMinute) return false;
    entry.count++;
    return true;
  }
}

// 生产环境推荐使用 Redis + Sliding Window Log 或 Token Bucket
```

---

## 4. 连接池与数据库路由

```typescript
// database-router.ts — 基于租户策略的动态数据库路由
import { PrismaClient } from '@prisma/client';

class TenantDatabaseRouter {
  private sharedPool = new PrismaClient(); // 共享 Schema / 行级隔离
  private dedicatedPools = new Map<string, PrismaClient>(); // 独立数据库缓存

  async getClient(tenant: TenantContext): Promise<PrismaClient> {
    switch (tenant.plan) {
      case 'enterprise':
        if (tenant.dbUrl) {
          if (!this.dedicatedPools.has(tenant.id)) {
            this.dedicatedPools.set(tenant.id, new PrismaClient({ datasources: { db: { url: tenant.dbUrl } } }));
          }
          return this.dedicatedPools.get(tenant.id)!;
        }
        break;
      case 'pro':
        if (tenant.schema) {
          // Prisma 尚不支持动态 schema 切换，此处示意
          await this.sharedPool.$executeRawUnsafe(`SET search_path TO "${tenant.schema}"`);
        }
        break;
    }
    return this.sharedPool;
  }
}
```

---

## 5. 反模式

### 反模式 1：租户泄露

❌ 忘记在查询中加 `tenantId` 过滤。
✅ 使用 ORM 中间件自动注入租户过滤，配合 RLS 做数据库级兜底。

### 反模式 2：无资源限制

❌ 单个租户占用全部连接池或存储。
✅ CPU/内存/存储的硬限制和告警，连接池按租户分片。

### 反模式 3：租户标识暴露于 URL

❌ 使用自增整数 tenant_id 暴露于 URL，可被遍历攻击。
✅ 使用 UUID 或加密标识符，配合权限校验。

---

## 6. 总结

多租户的核心是**在成本与隔离之间找到平衡**。

**推荐策略**：

- 免费用户 → 行级隔离（共享数据库共享 Schema）
- 付费用户 → 可选独立 Schema（共享数据库独立 Schema）
- 企业用户 → 独立数据库 / 独立部署

---

## 参考资源

| 资源 | 类型 | 链接 |
|------|------|------|
| Microsoft — Multi-Tenant SaaS Patterns | 文档 | [learn.microsoft.com/azure/azure-sql/database/saas-tenancy-app-design-patterns](https://learn.microsoft.com/azure/azure-sql/database/saas-tenancy-app-design-patterns) |
| AWS — SaaS Tenant Isolation Strategies | 白皮书 | [docs.aws.amazon.com/wellarchitected/latest/saas-lens/tenant-isolation.html](https://docs.aws.amazon.com/wellarchitected/latest/saas-lens/tenant-isolation.html) |
| PostgreSQL Row Level Security | 文档 | [postgresql.org/docs/current/ddl-rowsecurity.html](https://www.postgresql.org/docs/current/ddl-rowsecurity.html) |
| Prisma Multi-Schema | 文档 | [prisma.io/docs/orm/prisma-schema/data-model/models#multi-schema](https://www.prisma.io/docs/orm/prisma-schema/data-model/models#multi-schema) |
| Cloudflare Workers — Isolates | 博客 | [blog.cloudflare.com/cloud-computing-without-containers](https://blog.cloudflare.com/cloud-computing-without-containers/) |
| Martin Fowler — Multi-Tenancy | 文章 | [martinfowler.com/articles/multi-tenant-django.html](https://martinfowler.com/articles/multi-tenant-django.html) |
| Node.js Event Loop 与连接池 | 文档 | [nodejs.org/en/docs/guides/event-loop-timers-and-nexttick](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick) |
| Redis Rate Limiting Patterns | 指南 | [redis.io/docs/manual/patterns/distributed-locks](https://redis.io/docs/manual/patterns/distributed-locks) |

---

## 模块代码文件索引

本模块包含以下可运行 TypeScript 代码文件，用于将上述理论概念转化为实践：

- `database-router.ts`
- `index.ts`
- `resource-quota.ts`
- `schema-isolation.ts`
- `tenant-architecture.ts`
- `tenant-config.ts`
- `tenant-context.ts`
- `tenant-resolver.ts`

> 💡 **学习建议**：阅读 THEORY.md 后，逐一运行上述代码文件，观察理论概念的实际行为。修改参数和边界条件，加深理解。

## 核心理论深化

### 关键设计模式

本模块涉及的核心设计模式包括（根据代码实现提炼）：

1. **策略模式**：根据租户等级动态切换隔离策略（行级/Schema/独立数据库）
2. **代理模式**：ORM 中间件代理所有数据库操作，自动注入租户过滤
3. **单例变体**：租户级连接池缓存，避免频繁创建数据库连接

### 与相邻模块的关系

| 相邻模块 | 关系说明 |
|---------|---------|
| 前置依赖 | 建议先掌握数据库基础、TypeScript ORM（Prisma/TypeORM） |
| 后续进阶 | 可继续深化的相关模块：搜索引擎、后端 API 设计模式 |

---

> 📅 理论深化更新：2026-04-29
