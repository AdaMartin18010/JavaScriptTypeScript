# 多租户架构理论：从隔离到弹性

> **目标读者**：SaaS 开发者、平台架构师
> **关联文档**：[`docs/categories/67-multi-tenancy.md`](../../docs/categories/67-multi-tenancy.md)
> **版本**：2026-04
> **字数**：约 2,800 字

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
// 应用层过滤
async function getUsers(tenantId: string) {
  return db.users.findMany({
    where: { tenantId },  // 强制过滤
  });
}

// 数据库层：Row Level Security (PostgreSQL)
CREATE POLICY tenant_isolation ON users
  USING (tenant_id = current_setting('app.current_tenant')::uuid);
```

---

## 2. 租户路由

### 2.1 路由策略

| 策略 | 示例 | 特点 |
|------|------|------|
| **子域名** | `tenant1.saas.com` | 直观、支持自定义域名 |
| **路径前缀** | `saas.com/t/tenant1` | 简单、单证书 |
| **Header** | `X-Tenant-ID: tenant1` | API 友好 |

---

## 3. 资源配额与限流

```typescript
// 租户级限流
const tenantQuota = {
  'free': { requests: 100, storage: '1GB' },
  'pro': { requests: 10000, storage: '100GB' },
  'enterprise': { requests: Infinity, storage: 'Unlimited' },
};
```

---

## 4. 反模式

### 反模式 1：租户泄露

❌ 忘记在查询中加 `tenantId` 过滤。
✅ 使用 ORM 中间件自动注入租户过滤。

### 反模式 2：无资源限制

❌ 单个租户占用全部资源。
✅ CPU/内存/存储的硬限制和告警。

---

## 5. 总结

多租户的核心是**在成本与隔离之间找到平衡**。

**推荐策略**：
- 免费用户 → 行级隔离
- 付费用户 → 可选独立 Schema
- 企业用户 → 独立数据库 / 独立部署

---

## 参考资源

- [Multi-Tenant SaaS Patterns](https://docs.microsoft.com/en-us/azure/sql-database/saas-tenancy-app-design-patterns)
- [PostgreSQL RLS](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
