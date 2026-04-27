# Edge Databases Guide

> SQLite at the Edge: Turso, Cloudflare D1, Neon Serverless, and SQLite Cloud.

---

## 1. Why Edge Databases?

Traditional databases require a round-trip to a central region. Edge databases bring data closer to users:

```
User (Tokyo) → Edge Database (Tokyo) → 5ms latency
User (Tokyo) → Central Postgres (us-east) → 150ms latency
```

## 2. Comparison

| Database | Engine | Replication | Best For |
|----------|--------|-------------|----------|
| **Turso** | libSQL (SQLite fork) | Global | Mobile/Edge apps |
| **Cloudflare D1** | SQLite | Regional | Workers apps |
| **Neon** | Postgres | Branching | Serverless full-stack |
| **SQLite Cloud** | SQLite | Edge caching | Read-heavy workloads |

## 3. Decision Tree

```
Need Postgres compatibility?
  ├─ YES → Neon
  └─ NO → Need global replication?
           ├─ YES → Turso
           └─ NO → Using Cloudflare Workers?
                    ├─ YES → D1
                    └─ NO → SQLite Cloud
```

## 4. Drizzle ORM Integration

```typescript
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';

const client = createClient({ url: 'libsql://...', authToken: '...' });
const db = drizzle(client);

const users = await db.select().from(userTable).all();
```

*For the full Chinese version, see [../categories/30-edge-databases.md](../categories/30-edge-databases.md)*
