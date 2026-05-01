/**
 * 01-d1-sqlite.ts
 * ========================================
 * Cloudflare D1 基础操作与 Drizzle ORM 集成
 *
 * Cloudflare D1 是一个基于 SQLite 的 Serverless 边缘数据库，
 * 与 Cloudflare Workers 深度集成。本文件演示 D1 的 SQL 操作、
 * 批量写入、参数化查询，以及 Drizzle ORM 的类型安全集成。
 *
 * 运行环境: Cloudflare Worker (wrangler dev / wrangler deploy)
 * 本地开发: npx wrangler dev --local
 */

// ============================================================================
// 1. D1 类型定义 — Cloudflare Workers 环境类型
// ============================================================================

// D1Database 接口由 @cloudflare/workers-types 提供
// 在 tsconfig.json 中配置: "types": ["@cloudflare/workers-types"]

export interface Env {
  DB: D1Database; // 绑定到 wrangler.toml 中定义的 D1 数据库
}

// 业务类型定义
interface User {
  id: number;
  email: string;
  name: string;
  role: "admin" | "user" | "guest";
  createdAt: string; // ISO 8601
}

interface Post {
  id: number;
  title: string;
  content: string;
  authorId: number;
  published: number; // SQLite boolean as 0/1
  createdAt: string;
}

// ============================================================================
// 2. 原始 SQL 操作 — 直接使用 D1 API
// ============================================================================

/**
 * D1 的核心 API 包含:
 *   db.prepare(sql) -> D1PreparedStatement
 *   stmt.bind(...values) -> 绑定参数
 *   stmt.first<T>() -> 取第一行
 *   stmt.all<T>() -> 取所有行
 *   stmt.run() -> 执行非查询
 *   db.batch([stmt1, stmt2]) -> 批量执行
 */

// 初始化数据库表结构
async function initializeSchema(db: D1Database): Promise<void> {
  // D1 支持标准 SQLite DDL
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      author_id INTEGER NOT NULL,
      published INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (author_id) REFERENCES users(id)
    );

    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);
  `);
}

// 参数化查询 — 始终使用绑定参数防止 SQL 注入
async function findUserByEmail(db: D1Database, email: string): Promise<User | null> {
  const stmt = db
    .prepare("SELECT id, email, name, role, created_at as createdAt FROM users WHERE email = ?")
    .bind(email);

  // first() 返回第一行或 null
  const row = await stmt.first<{
    id: number;
    email: string;
    name: string;
    role: string;
    createdAt: string;
  }>();

  if (!row) return null;

  // 运行时类型校验（边缘环境尤其重要）
  if (!["admin", "user", "guest"].includes(row.role)) {
    throw new Error(`Invalid role in database: ${row.role}`);
  }

  return { ...row, role: row.role as User["role"] };
}

// 批量插入 — 使用事务保证原子性
async function seedUsers(db: D1Database, users: Omit<User, "id" | "createdAt">[]): Promise<void> {
  // batch() 在 D1 中将多个语句作为单个事务执行
  const statements = users.map((user) =>
    db
      .prepare("INSERT INTO users (email, name, role) VALUES (?, ?, ?)")
      .bind(user.email, user.name, user.role)
  );

  await db.batch(statements);
}

// 关联查询 — 获取用户及其文章
async function getUserWithPosts(
  db: D1Database,
  userId: number
): Promise<{ user: User; posts: Post[] } | null> {
  const userStmt = db
    .prepare("SELECT id, email, name, role, created_at as createdAt FROM users WHERE id = ?")
    .bind(userId);

  const postsStmt = db
    .prepare(
      `SELECT id, title, content, author_id as authorId, published, created_at as createdAt
       FROM posts WHERE author_id = ? ORDER BY created_at DESC`
    )
    .bind(userId);

  // 并行执行两个查询（D1 支持并发读取）
  const [userResult, postsResult] = await Promise.all([
    userStmt.first<User>(),
    postsStmt.all<Post>(),
  ]);

  if (!userResult) return null;

  return {
    user: userResult,
    posts: postsResult.results ?? [],
  };
}

// ============================================================================
// 3. 分页查询 — 边缘环境必须使用 LIMIT/OFFSET 控制数据量
// ============================================================================

interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    hasMore: boolean;
  };
}

async function listPublishedPosts(
  db: D1Database,
  page = 1,
  pageSize = 10
): Promise<PaginatedResult<Post>> {
  const offset = (page - 1) * pageSize;

  // 并行获取数据和总数
  const [dataResult, countResult] = await Promise.all([
    db
      .prepare(
        `SELECT id, title, content, author_id as authorId, published, created_at as createdAt
         FROM posts WHERE published = 1 ORDER BY created_at DESC LIMIT ? OFFSET ?`
      )
      .bind(pageSize, offset)
      .all<Post>(),
    db.prepare("SELECT COUNT(*) as total FROM posts WHERE published = 1").first<{ total: number }>(),
  ]);

  const total = countResult?.total ?? 0;

  return {
    data: dataResult.results ?? [],
    pagination: {
      page,
      pageSize,
      total,
      hasMore: offset + (dataResult.results?.length ?? 0) < total,
    },
  };
}

// ============================================================================
// 4. Drizzle ORM 集成 — 类型安全的查询构建器
// ============================================================================

// 在实际项目中，推荐使用 Drizzle ORM 进行类型安全的数据库操作：

/*
import { drizzle } from "drizzle-orm/d1";
import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { eq, desc, and } from "drizzle-orm";

const users = sqliteTable("users", {
  id: integer("id").primaryKey(),
  email: text("email").notNull(),
  name: text("name").notNull(),
  role: text("role", { enum: ["admin", "user", "guest"] }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

const posts = sqliteTable("posts", {
  id: integer("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  authorId: integer("author_id").notNull(),
  published: integer("published", { mode: "boolean" }).notNull().default(false),
});

// 在 Worker 中使用
const orm = drizzle(env.DB, { schema: { users, posts } });

// 类型安全查询 — 拼写错误会在编译时捕获
const admins = await orm.select().from(users).where(eq(users.role, "admin"));

// 关联查询
const userPosts = await orm
  .select({ user: users, post: posts })
  .from(users)
  .innerJoin(posts, eq(users.id, posts.authorId))
  .where(and(eq(users.id, userId), eq(posts.published, true)))
  .orderBy(desc(posts.createdAt));
*/

// ============================================================================
// 5. Worker 入口 — 路由分发与 D1 绑定
// ============================================================================

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    try {
      // 初始化表（生产环境应使用迁移工具）
      await initializeSchema(env.DB);

      // 路由分发
      if (path === "/api/users" && method === "GET") {
        const email = url.searchParams.get("email");
        if (!email) {
          return Response.json({ error: "email parameter required" }, { status: 400 });
        }
        const user = await findUserByEmail(env.DB, email);
        return user
          ? Response.json({ success: true, data: user })
          : Response.json({ error: "User not found" }, { status: 404 });
      }

      if (path === "/api/users" && method === "POST") {
        const body = (await request.json()) as Partial<User>;
        if (!body.email || !body.name) {
          return Response.json({ error: "email and name required" }, { status: 400 });
        }
        await seedUsers(env.DB, [
          { email: body.email, name: body.name, role: body.role ?? "user" },
        ]);
        return Response.json({ success: true }, { status: 201 });
      }

      if (path === "/api/users/posts" && method === "GET") {
        const userId = parseInt(url.searchParams.get("userId") ?? "", 10);
        if (Number.isNaN(userId)) {
          return Response.json({ error: "valid userId required" }, { status: 400 });
        }
        const result = await getUserWithPosts(env.DB, userId);
        return result
          ? Response.json({ success: true, data: result })
          : Response.json({ error: "User not found" }, { status: 404 });
      }

      if (path === "/api/posts" && method === "GET") {
        const page = parseInt(url.searchParams.get("page") ?? "1", 10);
        const pageSize = parseInt(url.searchParams.get("pageSize") ?? "10", 10);
        const posts = await listPublishedPosts(env.DB, page, pageSize);
        return Response.json({ success: true, data: posts });
      }

      return new Response("Not Found", { status: 404 });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Internal error";
      console.error("Worker error:", err);
      return Response.json({ error: message }, { status: 500 });
    }
  },
};

// ============================================================================
// 6. Wrangler 配置参考
// ============================================================================

/**
 * wrangler.toml:
 *
 * name = "d1-edge-api"
 * main = "01-d1-sqlite.ts"
 * compatibility_date = "2026-01-01"
 *
 * [[d1_databases]]
 * binding = "DB"
 * database_name = "my-app-db"
 * database_id = "your-database-uuid"
 *
 * === 本地开发流程 ===
 * 1. 创建数据库: npx wrangler d1 create my-app-db
 * 2. 执行迁移:   npx wrangler d1 execute my-app-db --local --file=schema.sql
 * 3. 本地运行:   npx wrangler dev --local
 * 4. 部署:       npx wrangler deploy
 *
 * === 最佳实践 ===
 * - 始终使用参数化查询（?.bind()）防止 SQL 注入
 * - 批量写入使用 db.batch() 减少往返
 * - LIMIT/OFFSET 控制返回数据量
 * - 为常用查询字段添加索引
 * - 生产环境使用 Drizzle ORM 获得编译时类型安全
 */
