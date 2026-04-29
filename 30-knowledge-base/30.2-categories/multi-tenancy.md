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

## PostgreSQL RLS 示例

```sql
-- 启用行级安全
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- 创建策略
CREATE POLICY tenant_isolation ON projects
  USING (tenant_id = current_setting('app.current_tenant')::UUID);
```

---

*最后更新: 2026-04-29*
