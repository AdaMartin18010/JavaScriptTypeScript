---
dimension: 综合
sub-dimension: Multi tenancy
created: 2026-04-28
---

# 模块归属声明

本模块归属 **「综合」** 维度，聚焦 Multi tenancy 核心概念与工程实践。

## 包含内容

- 本模块聚焦 multi tenancy 核心概念与工程实践。

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


## 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| MDN | 文档 | [developer.mozilla.org](https://developer.mozilla.org) |
| web.dev | 指南 | [web.dev](https://web.dev) |
| Microsoft — Multi-tenant SaaS | 架构指南 | [learn.microsoft.com/azure/architecture/example-scenario/multi-saas](https://learn.microsoft.com/en-us/azure/architecture/example-scenario/multi-saas/multi-tenant-data-partitioning) |
| AWS SaaS Tenant Isolation | 最佳实践 | [docs.aws.amazon.com/saas](https://docs.aws.amazon.com/wellarchitected/latest/saas-lens/tenant-isolation.html) |
| Stripe — Multitenancy at Scale | 工程博客 | [stripe.com/blog](https://stripe.com/blog) |
| Node.js AsyncLocalStorage | API 文档 | [nodejs.org/api/async_context](https://nodejs.org/api/async_context.html) |

---

*最后更新: 2026-04-29*
