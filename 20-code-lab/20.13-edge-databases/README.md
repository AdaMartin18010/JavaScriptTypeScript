# 边缘数据库代码实验室

> **定位**：`20-code-lab/20.13-edge-databases/`

---

## 一、Turso (libSQL)

```typescript
// turso-example.ts
import { createClient } from '@libsql/client/web';

const client = createClient({
  url: 'libsql://your-db.turso.io',
  authToken: process.env.TURSO_AUTH_TOKEN!
});

// 创建表
await client.execute(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE
  )
`);

// 插入数据
await client.execute({
  sql: 'INSERT INTO users (name, email) VALUES (?, ?)',
  args: ['Alice', 'alice@example.com']
});

// 查询
const result = await client.execute('SELECT * FROM users');
console.log(result.rows);
```

---

## 二、Cloudflare D1

```typescript
// d1-example.ts (Cloudflare Worker)
export interface Env {
  DB: D1Database;
}

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);

    if (url.pathname === '/users') {
      const { results } = await env.DB.prepare(
        'SELECT * FROM users LIMIT 10'
      ).all();
      return Response.json(results);
    }

    return new Response('Not Found', { status: 404 });
  }
};
```

---

## 三、Deno KV

```typescript
// deno-kv-example.ts
const kv = await Deno.openKv();

// 写入
await kv.set(['users', 'alice'], { name: 'Alice', age: 30 });

// 读取
const result = await kv.get(['users', 'alice']);
console.log(result.value);

// 原子事务
await kv.atomic()
  .set(['users', 'alice'], { name: 'Alice', age: 31 })
  .set(['logs', Date.now()], 'age updated')
  .commit();
```

---

## 四、本地开发策略

```typescript
// db.ts - 统一接口
interface Database {
  query(sql: string, args?: unknown[]): Promise<unknown[]>;
}

// 根据环境选择实现
const db: Database = process.env.CLOUDFLARE
  ? new D1Database()
  : process.env.DENO
  ? new DenoKVDatabase()
  : new TursoDatabase();

export { db };
```

---

*本模块为 L2 代码实验室的边缘数据库专项。*
