/**
 * 02-turso-libsql.ts
 * ========================================
 * Turso 边缘数据库与嵌入式副本
 *
 * Turso 是 libSQL（SQLite 的开源分支）的托管服务，专为全球边缘分布设计。
 * 其核心特性是"嵌入式副本"：在本地或边缘节点维护一个同步副本，
 * 实现亚毫秒级读取，同时保持与中心数据库的一致性。
 *
 * 安装依赖: npm install @libsql/client
 * 运行环境: Node.js, Bun, Deno（通过 npm 兼容层）, Cloudflare Workers
 */

import { createClient, Client } from "@libsql/client/web";

// ============================================================================
// 1. 类型定义 — 业务领域模型
// ============================================================================

interface Article {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: string; // ISO 8601
  tags: string[]; // 存储为 JSON 字符串
  readTime: number; // 分钟
}

interface Comment {
  id: number;
  articleId: number;
  author: string;
  body: string;
  createdAt: string;
}

// 数据库连接配置
interface TursoConfig {
  url: string; // libsql:// 或 file:// 或 wss://
  authToken?: string;
  syncUrl?: string; // 嵌入式副本的远程同步地址
  syncInterval?: number; // 自动同步间隔（秒）
}

// ============================================================================
// 2. 客户端初始化 — 远程模式 vs 嵌入式副本模式
// ============================================================================

function createTursoClient(config: TursoConfig): Client {
  // 远程模式：直接连接到 Turso 托管数据库
  // createClient({ url: "libsql://my-db.turso.io", authToken: "..." })

  // 嵌入式副本模式：本地数据库 + 远程同步
  // 这是 Turso 区别于 D1 的核心优势
  return createClient({
    url: config.url,
    authToken: config.authToken,
    syncUrl: config.syncUrl,
  });
}

// ============================================================================
// 3. Schema 初始化 — 标准 SQLite DDL
// ============================================================================

async function initializeTursoSchema(client: Client): Promise<void> {
  // Turso 完全兼容 SQLite 语法
  await client.batch(
    [
      `CREATE TABLE IF NOT EXISTS articles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        excerpt TEXT,
        content TEXT NOT NULL,
        author TEXT NOT NULL,
        published_at TEXT,
        tags TEXT DEFAULT '[]',
        read_time INTEGER DEFAULT 0
      )`,
      `CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        article_id INTEGER NOT NULL,
        author TEXT NOT NULL,
        body TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
      )`,
      `CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug)`,
      `CREATE INDEX IF NOT EXISTS idx_articles_author ON articles(author)`,
      `CREATE INDEX IF NOT EXISTS idx_comments_article ON comments(article_id)`,
    ],
    "write" // 写模式事务
  );
}

// ============================================================================
// 4. CRUD 操作 — 类型安全的参数化查询
// ============================================================================

async function createArticle(
  client: Client,
  article: Omit<Article, "id">
): Promise<{ id: number }> {
  const result = await client.execute({
    sql: `
      INSERT INTO articles (slug, title, excerpt, content, author, published_at, tags, read_time)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      article.slug,
      article.title,
      article.excerpt,
      article.content,
      article.author,
      article.publishedAt,
      JSON.stringify(article.tags),
      article.readTime,
    ],
  });

  return { id: Number(result.lastInsertRowid) };
}

async function findArticleBySlug(client: Client, slug: string): Promise<Article | null> {
  const result = await client.execute({
    sql: `
      SELECT id, slug, title, excerpt, content, author,
             published_at as publishedAt, tags, read_time as readTime
      FROM articles WHERE slug = ?
    `,
    args: [slug],
  });

  const row = result.rows[0];
  if (!row) return null;

  // 运行时类型转换与校验
  return {
    id: Number(row.id),
    slug: String(row.slug),
    title: String(row.title),
    excerpt: String(row.excerpt ?? ""),
    content: String(row.content),
    author: String(row.author),
    publishedAt: String(row.publishedAt ?? ""),
    tags: JSON.parse(String(row.tags ?? "[]")) as string[],
    readTime: Number(row.read_time ?? 0),
  };
}

async function listArticlesByAuthor(
  client: Client,
  author: string,
  limit = 10
): Promise<Article[]> {
  const result = await client.execute({
    sql: `
      SELECT id, slug, title, excerpt, content, author,
             published_at as publishedAt, tags, read_time as readTime
      FROM articles WHERE author = ? ORDER BY published_at DESC LIMIT ?
    `,
    args: [author, limit],
  });

  return result.rows.map((row) => ({
    id: Number(row.id),
    slug: String(row.slug),
    title: String(row.title),
    excerpt: String(row.excerpt ?? ""),
    content: String(row.content),
    author: String(row.author),
    publishedAt: String(row.publishedAt ?? ""),
    tags: JSON.parse(String(row.tags ?? "[]")) as string[],
    readTime: Number(row.read_time ?? 0),
  }));
}

async function addComment(
  client: Client,
  comment: Omit<Comment, "id" | "createdAt">
): Promise<void> {
  await client.execute({
    sql: "INSERT INTO comments (article_id, author, body) VALUES (?, ?, ?)",
    args: [comment.articleId, comment.author, comment.body],
  });
}

async function getArticleComments(client: Client, articleId: number): Promise<Comment[]> {
  const result = await client.execute({
    sql: `
      SELECT id, article_id as articleId, author, body, created_at as createdAt
      FROM comments WHERE article_id = ? ORDER BY created_at DESC
    `,
    args: [articleId],
  });

  return result.rows.map((row) => ({
    id: Number(row.id),
    articleId: Number(row.articleId),
    author: String(row.author),
    body: String(row.body),
    createdAt: String(row.createdAt),
  }));
}

// ============================================================================
// 5. 嵌入式副本同步 — Turso 的核心特性
// ============================================================================

class EmbeddedReplicaManager {
  private client: Client;

  constructor(config: TursoConfig) {
    this.client = createTursoClient(config);
  }

  // 显式同步远程数据到本地副本
  async sync(): Promise<void> {
    // sync() 仅在配置了 syncUrl 时有效
    // 将远程数据库的最新变更拉取到本地
    await this.client.sync();
    console.log("[Turso] Embedded replica synced with remote");
  }

  // 读取操作 — 从本地副本获取（亚毫秒级）
  async read<T>(query: string, args?: unknown[]): Promise<T[]> {
    const result = await this.client.execute({ sql: query, args: args ?? [] });
    return result.rows as T[];
  }

  // 写入操作 — 自动同步到远程
  async write(sql: string, args?: unknown[]): Promise<{ rowsAffected: number; lastId: number }> {
    const result = await this.client.execute({ sql, args: args ?? [] });
    return {
      rowsAffected: result.rowsAffected,
      lastId: Number(result.lastInsertRowid),
    };
  }

  close(): void {
    this.client.close();
  }
}

// ============================================================================
// 6. 全文搜索 — 利用 SQLite FTS5 扩展
// ============================================================================

async function initializeFullTextSearch(client: Client): Promise<void> {
  await client.execute(`
    CREATE VIRTUAL TABLE IF NOT EXISTS articles_fts USING fts5(
      title, content, content='articles', content_rowid='id'
    )
  `);

  // 创建触发器保持 FTS 索引同步
  await client.batch([
    `CREATE TRIGGER IF NOT EXISTS articles_ai AFTER INSERT ON articles BEGIN
      INSERT INTO articles_fts(rowid, title, content)
      VALUES (new.id, new.title, new.content);
    END`,
    `CREATE TRIGGER IF NOT EXISTS articles_ad AFTER DELETE ON articles BEGIN
      INSERT INTO articles_fts(articles_fts, rowid, title, content)
      VALUES ('delete', old.id, old.title, old.content);
    END`,
    `CREATE TRIGGER IF NOT EXISTS articles_au AFTER UPDATE ON articles BEGIN
      INSERT INTO articles_fts(articles_fts, rowid, title, content)
      VALUES ('delete', old.id, old.title, old.content);
      INSERT INTO articles_fts(rowid, title, content)
      VALUES (new.id, new.title, new.content);
    END`,
  ]);
}

async function searchArticles(client: Client, query: string): Promise<Array<{ id: number; title: string }>> {
  const result = await client.execute({
    sql: `
      SELECT a.id, a.title
      FROM articles_fts fts
      JOIN articles a ON a.id = fts.rowid
      WHERE articles_fts MATCH ?
      ORDER BY rank
      LIMIT 20
    `,
    args: [query],
  });

  return result.rows.map((row) => ({
    id: Number(row.id),
    title: String(row.title),
  }));
}

// ============================================================================
// 7. 主执行区 — 演示完整工作流
// ============================================================================

async function main(): Promise<void> {
  // 生产环境应从环境变量读取
  const config: TursoConfig = {
    url: process.env.TURSO_DATABASE_URL ?? "libsql://demo.turso.io",
    authToken: process.env.TURSO_AUTH_TOKEN,
    // syncUrl 用于嵌入式副本模式
    syncUrl: process.env.TURSO_SYNC_URL,
  };

  console.log("=== Turso / libSQL Edge Database Demo ===\n");

  const client = createTursoClient(config);

  try {
    // 初始化 schema
    await initializeTursoSchema(client);
    console.log("Schema initialized");

    // 创建文章
    const { id: articleId } = await createArticle(client, {
      slug: "build-free-typescript",
      title: "Build-Free TypeScript in 2026",
      excerpt: "Running TypeScript without compilation steps",
      content: "TypeScript can now run natively in Node.js 23+, Bun, and Deno...",
      author: "dev-team",
      publishedAt: new Date().toISOString(),
      tags: ["typescript", "javascript", "deno", "bun"],
      readTime: 8,
    });
    console.log(`Created article with id: ${articleId}`);

    // 查询文章
    const article = await findArticleBySlug(client, "build-free-typescript");
    console.log("Found article:", article?.title, "- tags:", article?.tags);

    // 添加评论
    await addComment(client, {
      articleId,
      author: "reader-1",
      body: "Great overview of the modern TS landscape!",
    });
    console.log("Added comment");

    // 获取评论
    const comments = await getArticleComments(client, articleId);
    console.log(`Article has ${comments.length} comment(s)`);

    // 列出作者的所有文章
    const articles = await listArticlesByAuthor(client, "dev-team", 5);
    console.log(`Author has ${articles.length} article(s)`);

    // 嵌入式副本演示（如果有配置 syncUrl）
    if (config.syncUrl) {
      const replicaManager = new EmbeddedReplicaManager(config);
      await replicaManager.sync();
      const localData = await replicaManager.read<{ id: number; title: string }>(
        "SELECT id, title FROM articles LIMIT 5"
      );
      console.log("Local replica data:", localData);
      replicaManager.close();
    }

    console.log("\n=== Success: Turso operations completed ===");
  } finally {
    client.close();
  }
}

// 仅在直接运行时执行
if (import.meta.main || (typeof process !== "undefined" && process.argv[1]?.includes("02-turso-libsql"))) {
  main().catch(console.error);
}

export {
  createTursoClient,
  initializeTursoSchema,
  createArticle,
  findArticleBySlug,
  listArticlesByAuthor,
  addComment,
  getArticleComments,
  EmbeddedReplicaManager,
  initializeFullTextSearch,
  searchArticles,
  type Article,
  type Comment,
  type TursoConfig,
};

// ============================================================================
// 8. Turso CLI 与部署参考
// ============================================================================

/**
 * === 安装 Turso CLI ===
 * curl -sSfL https://get.tur.so/install.sh | bash
 *
 * === 创建数据库 ===
 * turso db create my-blog-db
 * turso db show my-blog-db # 获取连接 URL
 *
 * === 生成访问 Token ===
 * turso db tokens create my-blog-db
 *
 * === 嵌入式副本配置 ===
 * const client = createClient({
 *   url: "file:local-replica.db",        // 本地文件路径
 *   syncUrl: "libsql://my-blog-db.turso.io",
 *   authToken: "your-token"
 * });
 * await client.sync(); // 手动同步
 *
 * === 与 Cloudflare Workers 集成 ===
 * Turso 的 @libsql/client/web 专为 Web 标准环境设计，
 * 无需 Node.js 特定 API，可直接在 Workers 中运行。
 *
 * === 本地开发 ===
 * turso dev --db-file local.db # 启动本地 libSQL 服务器
 */
