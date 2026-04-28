# 边缘数据库分类：SQLite at the Edge

> **定位**：`30-knowledge-base/30.2-categories/`
> **新增**：2026-04

---

## 一、为什么需要边缘数据库

传统架构：客户端 → CDN → 边缘函数 → 中心数据库（延迟 100-300ms）

边缘优先架构：客户端 → 边缘函数 + **边缘数据库**（延迟 10-50ms）

| 优势 | 说明 |
|------|------|
| **延迟降低** | 数据就近存储，消除跨区域往返 |
| **离线能力** | 本地 SQLite 支持离线读写 |
| **成本优化** | 减少中心数据库查询量 |
| **合规性** | 数据不出区域，满足 GDPR 等要求 |

---

## 二、主要产品对比

| 产品 | 架构 | 一致性模型 | 适用平台 | 定价模式 |
|------|------|-----------|---------|---------|
| **Turso** | libSQL (SQLite fork) | 最终一致 | 任意 | 按请求/存储 |
| **Cloudflare D1** | SQLite | 强一致 | Cloudflare Workers | 按请求 |
| **Neon Serverless** | Postgres | 强一致 | 任意 | 按计算时间 |
| **SQLite Cloud** | SQLite | 强一致 | 任意 | 按存储 |
| **Deno KV** | Key-Value | 最终一致 | Deno Deploy | 按请求 |

---

## 三、技术选型决策树

```
边缘数据库需求
├── 需要 SQL 关系查询?
│   ├── 是 → 需要 Postgres 兼容?
│   │   ├── 是 → Neon Serverless
│   │   └── 否 → Turso / D1
│   └── 否 → 简单 Key-Value?
│       └── 是 → Deno KV / Vercel KV
├── 部署平台锁定?
│   ├── Cloudflare → D1
│   ├── Deno → Deno KV
│   └── 平台无关 → Turso / Neon
└── 一致性要求?
    ├── 强一致 → D1 / Neon
    └── 最终一致 → Turso / Deno KV
```

---

## 四、代码示例

### Turso + TypeScript

```typescript
import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!
});

const result = await client.execute({
  sql: 'SELECT * FROM users WHERE id = ?',
  args: [userId]
});
```

### D1 + Cloudflare Workers

```typescript
export interface Env {
  DB: D1Database;
}

export default {
  async fetch(request: Request, env: Env) {
    const { results } = await env.DB.prepare(
      'SELECT * FROM users WHERE id = ?'
    ).bind(userId).all();
    return Response.json(results);
  }
};
```

---

## 五、边缘数据库的局限

| 局限 | 说明 | 缓解策略 |
|------|------|---------|
| **容量限制** | 单实例通常 < 10GB | 分片 + 中心归档 |
| **写入冲突** | 多区域写入可能冲突 | 单主写入 + 多读 |
| **复杂事务** | 跨边缘事务困难 | Saga 模式 + 补偿 |
| **备份恢复** | 边缘节点易失 | 自动同步到中心 |

---

*本分类文档为 2026 年边缘数据库技术的完整选型参考。*
