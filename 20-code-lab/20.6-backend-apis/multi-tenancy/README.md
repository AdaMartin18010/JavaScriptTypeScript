# 67-multi-tenancy

Multi-tenancy architecture patterns implemented in TypeScript.

## Topics

| Topic | File | Description |
|---|---|---|
| Tenant Architecture | `tenant-architecture.ts` | Core tenant manager, isolated store, and quota basics |
| Tenant Context | `tenant-context.ts` | AsyncLocalStorage-based tenant context manager |
| Tenant Resolver | `tenant-resolver.ts` | JWT-based tenant resolver with multi-source support |
| Schema Isolation | `schema-isolation.ts` | Shared / separate schema / separate database strategies |
| Database Router | `database-router.ts` | Tenant-aware database shard routing |
| Tenant Config | `tenant-config.ts` | Per-tenant configuration manager |
| Resource Quota | `resource-quota.ts` | Rate limiting and resource quota enforcement |

## Running Tests

```bash
npx vitest run 67-multi-tenancy
```
