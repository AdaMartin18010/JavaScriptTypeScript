# 边缘数据库

> **定位**：`20-code-lab/20.13-edge-databases`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块解决边缘计算场景下的数据持久化问题。探讨 SQLite、D1、LibSQL 等轻量级数据库在边缘环境的部署策略。

### 1.2 形式化基础

边缘数据库可形式化为一个有限状态复制机 (Finite-State Replication Machine)：
- 每个边缘节点维护本地副本 $L_i$
- 写入操作先提交到 $L_i$，再通过异步反熵协议同步到中心 $C$
- 读操作 $R(x)$ 优先在 $L_i$ 执行，满足 $R(x) \in \{L_i, C\}$

### 1.3 关键概念

| 概念 | 定义 | 关联 |
|------|------|------|
| D1 | Cloudflare 的 SQLite 边缘数据库 | d1-client.ts |
| 本地优先 | 数据先写本地再同步的架构 | local-first.ts |
| LibSQL | Turso 托管的 SQLite 分支，支持远程复制 | libsql-client.ts |

### 1.4 边缘数据库对比

| 维度 | SQLite (Wasm/本地) | Cloudflare D1 | Turso (LibSQL) |
|------|---------------------|---------------|----------------|
| 部署模式 | 嵌入进程 / WASM | Serverless 托管 | 全球边缘复制 |
| 复制协议 | 无（单机） | 单区域 + 快照复制 | LibSQL 远程同步 |
| 最大存储 | 依赖宿主（通常 TB 级） | 500 MB – 2 GB（当前） | 取决于计划 |
| 并发写入 | 串行（WAL 优化） | 串行（单区域） | 串行（单副本写） |
| 边缘延迟 | < 1 ms（本地） | < 50 ms | < 50 ms（全球） |
| 供应商锁定 | 无 | Cloudflare 生态 | 低（开源协议） |
| 适用场景 | 浏览器/嵌入式缓存 | Workers + D1 全栈 | 全球边缘应用 |
| 客户端 SDK | `better-sqlite3`, `sql.js` | `@cloudflare/workers-types` | `@libsql/client` |

---

## 二、设计原理

### 2.1 为什么存在

边缘计算要求数据尽可能地靠近用户。轻量级边缘数据库解决了低延迟读写和离线可用性问题，是边缘架构的关键组件。

### 2.2 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 边缘 SQLite | 轻量、成熟 | 写入扩展受限 | 读多写少 |
| D1 | 托管、Serverless | 供应商锁定 | Cloudflare 生态 |
| LibSQL/Turso | 边缘复制、全球分布 | 额外运维成本 | 全球边缘应用 |

### 2.3 与相关技术的对比

| 维度 | 边缘数据库 | 中心式数据库 | 客户端缓存 |
|------|-----------|-------------|-----------|
| 持久化 | ✅ 磁盘持久化 | ✅ 磁盘持久化 | ❌ 易失性 |
| 延迟 | < 50 ms | 50–300 ms | < 1 ms |
| 一致性 | 最终一致 | 强一致 | 无保证 |
| 离线可用 | ✅ | ❌ | ✅ |
| 典型产品 | D1, Turso, SQLite | PostgreSQL, MySQL | LocalStorage |

---

## 三、实践映射

### 3.1 从理论到代码

以下示例演示使用 Cloudflare D1 的 TypeScript 客户端进行边缘查询与批量写入：

```typescript
// d1-client.ts
import { D1Database } from '@cloudflare/workers-types';

export async function getUsers(db: D1Database, limit = 10) {
  const { results } = await db.prepare('SELECT id, email FROM users ORDER BY created_at DESC LIMIT ?')
    .bind(limit)
    .all<{ id: number; email: string }>();
  return results;
}

export async function seedUsers(db: D1Database) {
  const batch = [
    db.prepare('INSERT INTO users (email) VALUES (?)').bind('alice@example.com'),
    db.prepare('INSERT INTO users (email) VALUES (?)').bind('bob@example.com'),
  ];
  await db.batch(batch);
}
```

#### Turso / LibSQL 边缘客户端示例

LibSQL 支持嵌入式副本 (Embedded Replicas)，可在本地维护一个同步副本以实现亚毫秒级读取：

```typescript
// turso-client.ts
import { createClient } from '@libsql/client/web';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

// 自动路由到最近边缘节点
export async function getPosts() {
  const rs = await client.execute('SELECT id, title FROM posts ORDER BY created_at DESC LIMIT 10');
  return rs.rows;
}

// 参数化写入
export async function createPost(title: string, body: string) {
  await client.execute({
    sql: 'INSERT INTO posts (title, body) VALUES (?, ?)',
    args: [title, body],
  });
}
```

#### SQLite WASM 浏览器端示例

在浏览器中直接使用 SQLite，实现完全离线的本地优先应用：

```typescript
// sqlite-wasm-client.ts
import { sqlite3Worker1Promiser } from '@sqlite.org/sqlite-wasm';

let promiser: Awaited<ReturnType<typeof sqlite3Worker1Promiser>>;

export async function initSQLite() {
  promiser = await sqlite3Worker1Promiser({
    worker: () => new Worker('/sqlite-worker.js', { type: 'module' }),
    onerror: console.error,
  });
  return promiser('open', { filename: 'file:local.db?vfs=opfs' });
}

export async function queryTodos() {
  const response = await promiser('exec', {
    sql: 'SELECT id, title, done FROM todos ORDER BY created_at DESC',
    returnValue: 'resultRows',
    rowMode: 'object',
  });
  return response.result.resultRows as Array<{ id: number; title: string; done: boolean }>;
}

export async function addTodo(title: string) {
  await promiser('exec', {
    sql: 'INSERT INTO todos (title, done) VALUES (?, 0)',
    bind: [title],
  });
}
```

#### 本地优先同步模式（基于 CRDT 的冲突解决）

```typescript
// local-first-sync.ts
interface SyncDoc {
  id: string;
  content: string;
  hlc: string; // Hybrid Logical Clock 向量时钟
  deleted?: boolean;
}

/**
 * 简单的 LWW (Last-Write-Wins) 元素级合并
 * 实际生产环境推荐使用 Yjs、Automerge 或 Electric SQL
 */
export function mergeDocs(local: SyncDoc, remote: SyncDoc): SyncDoc {
  if (local.hlc > remote.hlc) return local;
  if (remote.hlc > local.hlc) return remote;
  // 时钟相等时按节点 ID 字典序打破平局
  return local.id >= remote.id ? local : remote;
}

export class LocalFirstStore {
  private db: IDBDatabase | null = null;

  async open(dbName = 'local-first-db') {
    return new Promise<void>((resolve, reject) => {
      const req = indexedDB.open(dbName, 1);
      req.onupgradeneeded = () => {
        req.result.createObjectStore('docs', { keyPath: 'id' });
      };
      req.onsuccess = () => { this.db = req.result; resolve(); };
      req.onerror = () => reject(req.error);
    });
  }

  async put(doc: SyncDoc) {
    if (!this.db) throw new Error('DB not open');
    const tx = this.db.transaction('docs', 'readwrite');
    const store = tx.objectStore('docs');

    // 读取本地版本，执行 CRDT 合并
    const existing = await new Promise<SyncDoc | undefined>((r) => {
      const getReq = store.get(doc.id);
      getReq.onsuccess = () => r(getReq.result);
      getReq.onerror = () => r(undefined);
    });

    const winner = existing ? mergeDocs(existing, doc) : doc;
    await new Promise<void>((r, reject) => {
      const putReq = store.put(winner);
      putReq.onsuccess = () => r();
      putReq.onerror = () => reject(putReq.error);
    });
    return winner;
  }
}
```

### 3.2 常见误区

| 误区 | 正确理解 |
|------|---------|
| 边缘数据库等于缓存 | 边缘数据库提供持久化，不仅是缓存 |
| 边缘 SQLite 功能不完整 | 现代边缘 SQLite 支持大部分标准特性 |
| D1 支持任意写入并发 | D1 单区域写入仍有串行化限制 |

### 3.3 扩展阅读

- [Cloudflare D1 文档](https://developers.cloudflare.com/d1/)
- [Turso / LibSQL 文档](https://docs.turso.tech/)
- [SQLite WASM](https://sqlite.org/wasm/doc/trunk/index.md)
- [local-first software](https://www.inkandswitch.com/local-first/)
- [Edge Database Patterns — Cloudflare Blog](https://blog.cloudflare.com/tag/d1/)
- [LibSQL GitHub — Open Contribution Fork](https://github.com/tursodatabase/libsql)
- [Drizzle ORM — Edge 友好 ORM](https://orm.drizzle.team/)
- [Fly.io — SQLite at the Edge](https://fly.io/blog/all-in-on-sqlite-litestream/)
- [SQLite Official Documentation](https://sqlite.org/docs.html)
- [Electric SQL — Local-First Sync Engine](https://electric-sql.com/)
- [Yjs — CRDTs for Collaborative Editing](https://docs.yjs.dev/)
- [Automerge — JSON-like CRDT](https://automerge.org/)
- [Litestream — Streaming SQLite Replication](https://litestream.io/)
- [Prisma ORM — Edge Compatibility](https://www.prisma.io/docs/orm/prisma-client/deployment/edge)
- [Cloudflare Durable Objects — Coordinated Edge State](https://developers.cloudflare.com/durable-objects/)

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
