/**
 * @file Turso / libSQL 连接与查询示例
 * @category ORM Modern Lab → Edge Database
 * @difficulty medium
 * @tags turso, libsql, sqlite, edge, serverless, drizzle, connection
 *
 * @description
 * Turso 是基于 libSQL（SQLite fork）的边缘数据库，提供全球复制和低延迟读取。
 * 本文件演示：
 * - libSQL 客户端连接配置（本地文件 / 远程 Turso / 内存模式）
 * - 基础 CRUD 查询
 * - 批量操作与事务
 * - 与 Drizzle ORM 集成
 * - Edge Runtime（Cloudflare Workers / Vercel Edge）中的使用
 */

import { createClient, Client } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import { sql } from 'drizzle-orm'

// ============================================================================
// 1. 连接配置模式
// ============================================================================

/**
 * 模式 A：本地 SQLite 文件（开发/测试）
 */
export function createLocalClient(dbPath: string = 'file:local.db'): Client {
  return createClient({ url: dbPath })
}

/**
 * 模式 B：远程 Turso 数据库（生产/边缘）
 */
export function createTursoClient(url: string, authToken: string): Client {
  return createClient({ url, authToken })
}

/**
 * 模式 C：内存数据库（单元测试）
 */
export function createMemoryClient(): Client {
  return createClient({ url: ':memory:' })
}

/**
 * 模式 D：统一工厂（按环境自动选择）
 */
export function createClientFromEnv(env: {
  TURSO_DATABASE_URL?: string
  TURSO_AUTH_TOKEN?: string
  NODE_ENV?: string
}): Client {
  if (env.TURSO_DATABASE_URL && env.TURSO_AUTH_TOKEN) {
    return createTursoClient(env.TURSO_DATABASE_URL, env.TURSO_AUTH_TOKEN)
  }

  if (env.NODE_ENV === 'test') {
    return createMemoryClient()
  }

  return createLocalClient()
}

// ============================================================================
// 2. 基础 CRUD 查询（原始 libSQL 客户端）
// ============================================================================

export async function basicCrudOperations(client: Client) {
  console.log('=== Turso / libSQL 基础 CRUD ===\n')

  // 2.1 创建表（如不存在）
  await client.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      name TEXT,
      age INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  await client.execute(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT,
      user_id INTEGER NOT NULL,
      published INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `)

  // 2.2 INSERT（单条）
  const insertResult = await client.execute({
    sql: 'INSERT INTO users (email, name, age) VALUES (?, ?, ?)',
    args: ['alice@example.com', 'Alice', 28],
  })
  console.log('插入用户 ID:', insertResult.lastInsertRowid)

  // 2.3 INSERT（批量）
  const batchResult = await client.batch([
    {
      sql: 'INSERT INTO users (email, name, age) VALUES (?, ?, ?)',
      args: ['bob@example.com', 'Bob', 32],
    },
    {
      sql: 'INSERT INTO users (email, name, age) VALUES (?, ?, ?)',
      args: ['carol@example.com', 'Carol', 25],
    },
    {
      sql: 'INSERT INTO users (email, name, age) VALUES (?, ?, ?)',
      args: ['dave@example.com', 'Dave', 40],
    },
  ], 'write')
  console.log('批量插入完成，条数:', batchResult.length)

  // 2.4 SELECT（参数化查询）
  const selectResult = await client.execute({
    sql: 'SELECT * FROM users WHERE age > ? ORDER BY age DESC',
    args: [25],
  })
  console.log('查询结果:', selectResult.rows)

  // 2.5 SELECT（分页）
  const pageSize = 2
  const page = 1
  const paginatedResult = await client.execute({
    sql: 'SELECT * FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?',
    args: [pageSize, (page - 1) * pageSize],
  })
  console.log('分页结果:', paginatedResult.rows)

  // 2.6 UPDATE
  const updateResult = await client.execute({
    sql: 'UPDATE users SET age = age + 1 WHERE email = ?',
    args: ['alice@example.com'],
  })
  console.log('更新行数:', updateResult.rowsAffected)

  // 2.7 DELETE
  const deleteResult = await client.execute({
    sql: 'DELETE FROM users WHERE email = ?',
    args: ['dave@example.com'],
  })
  console.log('删除行数:', deleteResult.rowsAffected)

  // 2.8 COUNT / 聚合
  const countResult = await client.execute({
    sql: 'SELECT COUNT(*) as total, AVG(age) as avg_age FROM users',
    args: [],
  })
  console.log('聚合结果:', countResult.rows[0])
}

// ============================================================================
// 3. 事务操作
// ============================================================================

export async function transactionOperations(client: Client) {
  console.log('\n=== Turso / libSQL 事务 ===\n')

  // 3.1 交互式事务（推荐用于复杂逻辑）
  const transaction = await client.transaction('write')

  try {
    // 插入用户
    const userResult = await transaction.execute({
      sql: 'INSERT INTO users (email, name, age) VALUES (?, ?, ?)',
      args: ['txn-user@example.com', 'Txn User', 30],
    })
    const userId = userResult.lastInsertRowid

    // 插入关联文章
    await transaction.execute({
      sql: 'INSERT INTO posts (title, content, user_id, published) VALUES (?, ?, ?, ?)',
      args: ['Hello Turso', 'Transaction demo content', userId, 1],
    })

    await transaction.execute({
      sql: 'INSERT INTO posts (title, content, user_id, published) VALUES (?, ?, ?, ?)',
      args: ['Second Post', 'Another transaction post', userId, 0],
    })

    // 提交事务
    await transaction.commit()
    console.log('事务提交成功')
  } catch (error) {
    // 回滚事务
    await transaction.rollback()
    console.error('事务回滚:', (error as Error).message)
    throw error
  }

  // 3.2 批量原子操作（implicit transaction）
  // batch 方法默认作为一个事务执行
  const batchTxnResult = await client.batch([
    {
      sql: 'INSERT INTO users (email, name, age) VALUES (?, ?, ?)',
      args: ['batch1@example.com', 'Batch One', 22],
    },
    {
      sql: 'INSERT INTO users (email, name, age) VALUES (?, ?, ?)',
      args: ['batch2@example.com', 'Batch Two', 24],
    },
    {
      sql: 'INSERT INTO posts (title, user_id, published) VALUES (?, last_insert_rowid(), ?)',
      args: ['Batch Post', 1],
    },
  ], 'write')
  console.log('批量事务完成:', batchTxnResult.length, '条语句')
}

// ============================================================================
// 4. 与 Drizzle ORM 集成
// ============================================================================

import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'

// Drizzle SQLite Schema（与 libSQL 完全兼容）
export const drizzleUsers = sqliteTable('drizzle_users', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  name: text('name'),
  age: integer('age', { mode: 'number' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

export const drizzlePosts = sqliteTable('drizzle_posts', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  content: text('content'),
  userId: integer('user_id', { mode: 'number' }).notNull(),
  published: integer('published', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

export const drizzleUsersRelations = relations(drizzleUsers, ({ many }) => ({
  posts: many(drizzlePosts),
}))

export const drizzlePostsRelations = relations(drizzlePosts, ({ one }) => ({
  author: one(drizzleUsers, {
    fields: [drizzlePosts.userId],
    references: [drizzleUsers.id],
  }),
}))

/**
 * 使用 Drizzle ORM + libSQL 客户端
 */
export async function drizzleWithLibsql(client: Client) {
  console.log('\n=== Drizzle ORM + libSQL ===\n')

  const db = drizzle(client)

  // 创建表（通过 drizzle-kit migrate 更佳，这里演示 execute）
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS drizzle_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      name TEXT,
      age INTEGER,
      created_at INTEGER DEFAULT (unixepoch() * 1000)
    )
  `)

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS drizzle_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT,
      user_id INTEGER NOT NULL,
      published INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (unixepoch() * 1000)
    )
  `)

  // INSERT
  const newUsers = await db
    .insert(drizzleUsers)
    .values([
      { email: 'drizzle1@example.com', name: 'Drizzle One', age: 25 },
      { email: 'drizzle2@example.com', name: 'Drizzle Two', age: 30 },
    ])
    .returning()
  console.log('Drizzle 插入:', newUsers.length, '条')

  // SELECT with JOIN
  const usersWithPosts = await db
    .select({
      userId: drizzleUsers.id,
      email: drizzleUsers.email,
      postTitle: drizzlePosts.title,
    })
    .from(drizzleUsers)
    .leftJoin(drizzlePosts, sql`${drizzlePosts.userId} = ${drizzleUsers.id}`)

  console.log('Drizzle JOIN 结果:', usersWithPosts.length, '条')

  // Relational Query
  const allUsers = await db.query.drizzleUsers.findMany({
    with: {
      posts: true,
    },
  })
  console.log('Drizzle Relational 查询:', allUsers.length, '位用户')
}

// ============================================================================
// 5. Edge Runtime 中的使用
// ============================================================================

/**
 * Cloudflare Workers Handler（libSQL 直连）
 */
export async function handleCloudflareWorkersRequest(
  request: Request,
  env: { TURSO_DATABASE_URL: string; TURSO_AUTH_TOKEN: string }
): Promise<Response> {
  const client = createTursoClient(env.TURSO_DATABASE_URL, env.TURSO_AUTH_TOKEN)

  try {
    const url = new URL(request.url)

    // GET /users - 列出用户
    if (request.method === 'GET' && url.pathname === '/users') {
      const result = await client.execute({
        sql: 'SELECT id, email, name, age, created_at FROM users LIMIT 50',
        args: [],
      })
      return Response.json({ users: result.rows })
    }

    // POST /users - 创建用户
    if (request.method === 'POST' && url.pathname === '/users') {
      const body = await request.json() as { email: string; name?: string; age?: number }
      const result = await client.execute({
        sql: 'INSERT INTO users (email, name, age) VALUES (?, ?, ?)',
        args: [body.email, body.name ?? null, body.age ?? null],
      })
      return Response.json(
        { id: result.lastInsertRowid, email: body.email },
        { status: 201 }
      )
    }

    // GET /users/:id/posts - 用户文章
    const postsMatch = url.pathname.match(/^\/users\/(\d+)\/posts$/)
    if (request.method === 'GET' && postsMatch) {
      const userId = parseInt(postsMatch[1], 10)
      const result = await client.execute({
        sql: 'SELECT * FROM posts WHERE user_id = ? ORDER BY created_at DESC',
        args: [userId],
      })
      return Response.json({ posts: result.rows })
    }

    return new Response('Not Found', { status: 404 })
  } catch (error) {
    return Response.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  } finally {
    client.close()
  }
}

/**
 * Vercel Edge API Route（Drizzle + libSQL）
 */
export async function handleVercelEdgeRequest(
  request: Request,
  env: { TURSO_DATABASE_URL: string; TURSO_AUTH_TOKEN: string }
): Promise<Response> {
  const client = createTursoClient(env.TURSO_DATABASE_URL, env.TURSO_AUTH_TOKEN)
  const db = drizzle(client)

  try {
    if (request.method === 'GET') {
      const users = await db
        .select({
          id: drizzleUsers.id,
          email: drizzleUsers.email,
          name: drizzleUsers.name,
        })
        .from(drizzleUsers)
        .limit(20)

      return Response.json({ users })
    }

    if (request.method === 'POST') {
      const body = await request.json() as { email: string; name?: string }
      const inserted = await db
        .insert(drizzleUsers)
        .values({ email: body.email, name: body.name })
        .returning()

      return Response.json({ user: inserted[0] }, { status: 201 })
    }

    return new Response('Method Not Allowed', { status: 405 })
  } catch (error) {
    return Response.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  } finally {
    client.close()
  }
}

// ============================================================================
// 6. 高级模式：同步与迁移
// ============================================================================

/**
 * libSQL 远程同步模式（适用于嵌入式/移动端场景）
 */
export async function syncDemo(client: Client) {
  console.log('\n=== libSQL 同步模式 ===\n')

  // 对于本地 libSQL 文件 + 远程 Turso 的场景，可以执行同步
  // 注意：这需要使用 @libsql/client 的 embeddedReplicas 功能

  // const clientWithSync = createClient({
  //   url: 'file:local-sync.db',
  //   syncUrl: 'libsql://your-db.turso.io',
  //   authToken: process.env.TURSO_AUTH_TOKEN,
  // })

  // 手动触发同步
  // await clientWithSync.sync()

  console.log('libSQL 支持嵌入式副本与远程同步')
  console.log('适合：IoT 设备、移动端、边缘节点本地缓存')
}

// ============================================================================
// 7. 演示入口
// ============================================================================

export async function demo(): Promise<void> {
  console.log('=== Turso / libSQL 连接与查询示例 ===\n')

  // 使用内存数据库进行演示
  const client = createMemoryClient()

  try {
    await basicCrudOperations(client)
    await transactionOperations(client)
    await drizzleWithLibsql(client)
    await syncDemo(client)

    console.log('\n要点总结:')
    console.log('- 连接模式: 本地文件 / 远程 Turso / 内存（测试）')
    console.log('- 查询方式: 原始 SQL 参数化 或 Drizzle ORM')
    console.log('- 事务支持: 交互式事务 + 批量原子操作')
    console.log('- Edge 原生: HTTP 协议，无连接池开销')
    console.log('- 全球复制: 写主库，读边缘副本，延迟 < 50ms')
    console.log('- 适用场景: 读多写少、IoT、边缘缓存、Serverless')
  } finally {
    client.close()
  }
}
