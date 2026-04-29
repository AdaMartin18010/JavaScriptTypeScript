# 多租户

> SaaS 应用多租户架构设计模式。

---

## 架构模式

| 模式 | 隔离级别 | 复杂度 | 成本 |
|------|---------|--------|------|
| **独立数据库** | 最高 | 高 | 高 |
| **共享数据库，独立 Schema** | 高 | 中 | 中 |
| **共享 Schema，租户 ID 隔离** | 中 | 低 | 低 |
| **行级安全（RLS）** | 中 | 低 | 低 |

---

## 租户隔离模型深度对比

| 维度 | 独立数据库（DB-per-Tenant） | Schema 隔离 | 共享 Schema + Tenant ID | 行级安全（RLS） |
|------|---------------------------|-------------|------------------------|-----------------|
| **数据隔离** | 物理隔离 | 逻辑隔离 | 应用层隔离 | 数据库层强制隔离 |
| **安全合规** | 最强（满足 HIPAA/SOX） | 强 | 中（依赖应用） | 强（数据库策略） |
| **单租户备份** | 简单（独立导出） | 中等（Schema 级导出） | 复杂（过滤导出） | 中等（策略过滤） |
| **资源利用率** | 低（连接/内存开销大） | 中 | 高 | 高 |
| **跨租户查询** | 困难（需聚合） | 中等 | 简单 | 简单 |
| **Schema 迁移** | 复杂（逐个 DB 执行） | 中等（逐个 Schema） | 简单（单次执行） | 简单（单次执行） |
| **租户 onboarding** | 慢（创建 DB + 迁移） | 中（创建 Schema） | 极快（插入 tenant 行） | 极快 |
| **适用规模** | 大客户 / 高合规 | 中大型企业 | 中小 SaaS / 消费级 | 现代 PostgreSQL SaaS |
| **2026 推荐度** | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

---

## 代码示例：Prisma + 共享 Schema Tenant ID 隔离

```typescript
// prisma/schema.prisma
// 每个模型必须包含 tenantId 字段
model Tenant {
  id        String   @id @default(uuid())
  name      String
  createdAt DateTime @default(now())
  users     User[]
  projects  Project[]
}

model User {
  id       String @id @default(uuid())
  email    String @unique
  tenantId String
  tenant   Tenant @relation(fields: [tenantId], references: [id])

  @@index([tenantId])
}

model Project {
  id          String   @id @default(uuid())
  name        String
  tenantId    String
  tenant      Tenant   @relation(fields: [tenantId], references: [id])
  createdAt   DateTime @default(now())

  @@index([tenantId])
}

// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// lib/tenant-context.ts
import { AsyncLocalStorage } from 'node:async_hooks';

export const tenantStorage = new AsyncLocalStorage<string>();

export function getCurrentTenantId(): string {
  const tenantId = tenantStorage.getStore();
  if (!tenantId) {
    throw new Error('Tenant context not initialized. Wrap your request in tenantStorage.run().');
  }
  return tenantId;
}

// middleware/tenant-prisma.ts
import { Prisma } from '@prisma/client';
import { tenantStorage } from './tenant-context';

export const tenantMiddleware: Prisma.Middleware = async (params, next) => {
  const tenantId = tenantStorage.getStore();

  // 自动为查询添加 tenantId 过滤
  if (tenantId && params.model && ['User', 'Project'].includes(params.model)) {
    if (params.action === 'findUnique' || params.action === 'findFirst') {
      params.args = { where: { ...params.args.where, tenantId } };
    }
    if (params.action === 'findMany') {
      params.args.where = { ...params.args.where, tenantId };
    }
    if (params.action === 'create' || params.action === 'createMany') {
      if (Array.isArray(params.args.data)) {
        params.args.data = params.args.data.map((d: Record<string, unknown>) => ({ ...d, tenantId }));
      } else {
        params.args.data = { ...params.args.data, tenantId };
      }
    }
  }

  return next(params);
};

prisma.$use(tenantMiddleware);

// 使用示例（Express / Fastify 中间件中）
import { tenantStorage, getCurrentTenantId } from './lib/tenant-context';
import { prisma } from './lib/prisma';

async function handleRequest(tenantId: string) {
  return tenantStorage.run(tenantId, async () => {
    // 所有查询自动附加 tenantId
    const users = await prisma.user.findMany();
    const projects = await prisma.project.findMany({ where: { name: { contains: 'AI' } } });
    return { users, projects };
  });
}
```

**租户解析与连接池管理**：

```typescript
// lib/tenant-resolver.ts — 从请求解析租户标识
import { AsyncLocalStorage } from 'node:async_hooks';

interface TenantConfig {
  id: string;
  databaseUrl?: string;     // DB-per-tenant 模式
  schemaName?: string;      // Schema 隔离模式
  plan: 'free' | 'pro' | 'enterprise';
  rateLimit: number;
}

class TenantResolver {
  private tenants = new Map<string, TenantConfig>();
  private connectionPools = new Map<string, unknown>(); // 实际项目中使用 pg-pool 等

  register(tenant: TenantConfig): void {
    this.tenants.set(tenant.id, tenant);
  }

  /** 从 HTTP 请求解析租户 */
  resolveFromRequest(req: { headers: Record<string, string | string[] | undefined>; url?: string }): TenantConfig | null {
    // 策略 1: 子域名 (tenant.example.com)
    const host = req.headers.host as string | undefined;
    if (host) {
      const subdomain = host.split('.')[0];
      const tenant = this.tenants.get(subdomain);
      if (tenant) return tenant;
    }

    // 策略 2: Header (X-Tenant-ID)
    const headerId = req.headers['x-tenant-id'];
    if (typeof headerId === 'string') {
      return this.tenants.get(headerId) ?? null;
    }

    // 策略 3: JWT Claim
    const auth = req.headers.authorization;
    if (typeof auth === 'string' && auth.startsWith('Bearer ')) {
      try {
        const payload = JSON.parse(Buffer.from(auth.split('.')[1], 'base64').toString());
        const tenantId = payload.tenantId as string;
        return this.tenants.get(tenantId) ?? null;
      } catch {
        return null;
      }
    }

    return null;
  }

  /** 获取或创建租户专属连接池 */
  getConnectionPool(tenantId: string): unknown {
    if (!this.connectionPools.has(tenantId)) {
      const config = this.tenants.get(tenantId);
      if (!config?.databaseUrl) throw new Error(`No database URL for tenant ${tenantId}`);
      // const pool = new Pool({ connectionString: config.databaseUrl });
      // this.connectionPools.set(tenantId, pool);
    }
    return this.connectionPools.get(tenantId);
  }
}

export const tenantResolver = new TenantResolver();
```

---

## PostgreSQL RLS 示例

```sql
-- 启用行级安全
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- 创建策略
CREATE POLICY tenant_isolation ON projects
  USING (tenant_id = current_setting('app.current_tenant')::UUID);
```

**Prisma + PostgreSQL RLS 完整集成**：

```typescript
// lib/prisma-rls.ts — Prisma 与 PostgreSQL RLS 集成
import { PrismaClient } from '@prisma/client';

export function createPrismaWithRLS(tenantId: string): PrismaClient {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: `${process.env.DATABASE_URL}?application_name=tenant_${tenantId}`,
      },
    },
  });

  // 在每个查询前设置 RLS 变量
  prisma.$connect().then(async () => {
    await prisma.$executeRawUnsafe(`SET app.current_tenant = '${tenantId}'`);
  });

  return prisma;
}

// Express 中间件：为每个请求创建 RLS 绑定的 Prisma 实例
// app.use(async (req, res, next) => {
//   const tenant = tenantResolver.resolveFromRequest(req);
//   if (!tenant) return res.status(401).json({ error: 'Tenant not found' });
//   req.prisma = createPrismaWithRLS(tenant.id);
//   next();
// });
```

---

## 权威参考链接

| 资源 | 链接 | 说明 |
|------|------|------|
| Prisma 文档：多租户指南 | <https://www.prisma.io/docs/orm/prisma-client/client-extensions> | Prisma 官方多租户建议 |
| PostgreSQL 行级安全 (RLS) | <https://www.postgresql.org/docs/current/ddl-rowsecurity.html> | 官方 RLS 文档 |
| AWS SaaS 多租户架构白皮书 | <https://docs.aws.amazon.com/wellarchitected/latest/saas-lens/welcome.html> | AWS Well-Architected SaaS Lens |
| Microsoft Azure 多租户设计模式 | <https://learn.microsoft.com/en-us/azure/architecture/guide/multitenant/overview> | Azure 架构中心多租户指南 |
| Prisma Client Extensions | <https://www.prisma.io/docs/orm/prisma-client/client-extensions> | 客户端扩展 API |
| Node.js AsyncLocalStorage | <https://nodejs.org/api/async_context.html#class-asynclocalstorage> | 异步上下文存储 |
| Supabase Row Level Security | <https://supabase.com/docs/guides/auth/row-level-security> | Supabase RLS 实战指南 |
| PlanetScale Multi-tenancy | <https://planetscale.com/blog/multi-tenant-saas-database-pattern> | PlanetScale 多租户模式 |
| Stripe 多租户架构博客 | <https://stripe.com/blog/marketplaces> | Stripe 多租户支付架构 |
| Martin Fowler: Multi-tenant | <https://martinfowler.com/articles/multi-tenant.html> | 多租户架构模式权威论述 |
| OWASP SaaS Security | <https://owasp.org/www-project-saas-security/> | SaaS 安全指南 |
| Neon Serverless Postgres | <https://neon.tech/docs/introduction> | 无服务器 PostgreSQL（适合多租户） |

---

*最后更新: 2026-04-29*
