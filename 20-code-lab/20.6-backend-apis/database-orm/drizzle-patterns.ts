/**
 * @file Drizzle ORM 实践模式
 * @category Database → ORM
 * @difficulty medium
 * @tags drizzle, orm, schema, query, edge, serverless
 *
 * @description
 * Drizzle ORM 是 2025-2026 年 TypeScript 生态中最活跃的 ORM 之一。
 * 本文件演示在传统后端项目中的 Drizzle 实践模式：
 * - TypeScript-native Schema 定义
 * - SQL-like 查询与关系查询
 * - 事务与批量操作
 * - 与 libSQL / Turso 的集成
 */

import { eq, and, or, like, desc, asc, sql, count } from 'drizzle-orm'

// ============================================================================
// 1. Schema 定义（以 SQLite/libSQL 为例，也可用于 PostgreSQL）
// ============================================================================

// 注意：实际项目中 schema 通常放在单独的 schema.ts 文件中
// 这里内联定义以便单文件演示

interface DrizzleUser {
  id: number
  email: string
  name: string | null
  age: number | null
  status: 'active' | 'inactive' | 'banned'
  createdAt: Date
}

interface DrizzlePost {
  id: number
  title: string
  content: string | null
  published: boolean
  authorId: number
  createdAt: Date
}

// ============================================================================
// 2. Repository 模式（Drizzle 风格）
// ============================================================================

/**
 * Drizzle ORM 不强制 Repository 模式，但在中大型项目中推荐封装数据访问层。
 * 以下是一个轻量级的 Drizzle Repository 实现。
 */

export interface DrizzleRepository<T, InsertT> {
  findMany(options?: { where?: Partial<T>; orderBy?: { field: keyof T; direction: 'asc' | 'desc' }; limit?: number; offset?: number }): Promise<T[]>
  findById(id: number): Promise<T | null>
  findFirst(where: Partial<T>): Promise<T | null>
  create(data: InsertT): Promise<T>
  update(id: number, data: Partial<InsertT>): Promise<T>
  delete(id: number): Promise<void>
  count(where?: Partial<T>): Promise<number>
}

/**
 * 模拟 Drizzle db 实例（实际项目通过 drizzle(client) 创建）
 */
export interface MockDrizzleDb {
  select: () => any
  insert: (table: any) => any
  update: (table: any) => any
  delete: (table: any) => any
  query: any
  transaction: <T>(fn: (tx: MockDrizzleDb) => Promise<T>) => Promise<T>
}

export class UserRepository implements DrizzleRepository<DrizzleUser, Omit<DrizzleUser, 'id' | 'createdAt'>> {
  constructor(private db: MockDrizzleDb, private table: any) {}

  async findMany(options?: Parameters<DrizzleRepository<DrizzleUser, any>['findMany']>[0]): Promise<DrizzleUser[]> {
    // SQL-like 风格示例
    let query = this.db.select().from(this.table)

    if (options?.where) {
      const conditions = Object.entries(options.where).map(([key, value]) =>
        eq(this.table[key], value)
      )
      if (conditions.length > 0) {
        query = query.where(conditions.length === 1 ? conditions[0] : and(...conditions))
      }
    }

    if (options?.orderBy) {
      const orderFn = options.orderBy.direction === 'asc' ? asc : desc
      query = query.orderBy(orderFn(this.table[options.orderBy.field]))
    }

    if (options?.limit) query = query.limit(options.limit)
    if (options?.offset) query = query.offset(options.offset)

    return query.execute()
  }

  async findById(id: number): Promise<DrizzleUser | null> {
    const results = await this.db.select().from(this.table).where(eq(this.table.id, id)).limit(1)
    return results[0] ?? null
  }

  async findFirst(where: Partial<DrizzleUser>): Promise<DrizzleUser | null> {
    const results = await this.findMany({ where, limit: 1 })
    return results[0] ?? null
  }

  async create(data: Omit<DrizzleUser, 'id' | 'createdAt'>): Promise<DrizzleUser> {
    const result = await this.db.insert(this.table).values(data).returning()
    return result[0]
  }

  async update(id: number, data: Partial<Omit<DrizzleUser, 'id' | 'createdAt'>>): Promise<DrizzleUser> {
    const result = await this.db
      .update(this.table)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(this.table.id, id))
      .returning()
    return result[0]
  }

  async delete(id: number): Promise<void> {
    await this.db.delete(this.table).where(eq(this.table.id, id))
  }

  async count(where?: Partial<DrizzleUser>): Promise<number> {
    let query = this.db.select({ value: count() }).from(this.table)
    if (where) {
      const conditions = Object.entries(where).map(([key, value]) =>
        eq(this.table[key], value)
      )
      query = query.where(conditions.length === 1 ? conditions[0] : and(...conditions))
    }
    const result = await query
    return result[0]?.value ?? 0
  }
}

// ============================================================================
// 3. 查询模式示例
// ============================================================================

export class DrizzleQueryPatterns {
  constructor(private db: MockDrizzleDb, private usersTable: any, private postsTable: any) {}

  /**
   * 3.1 基础过滤 + 排序 + 分页
   */
  async listActiveUsers(page = 1, pageSize = 20) {
    return this.db
      .select()
      .from(this.usersTable)
      .where(eq(this.usersTable.status, 'active'))
      .orderBy(desc(this.usersTable.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize)
  }

  /**
   * 3.2 模糊搜索 + 多条件组合
   */
  async searchUsers(searchTerm: string, minAge?: number) {
    const conditions = [
      or(
        like(this.usersTable.email, `%${searchTerm}%`),
        like(this.usersTable.name, `%${searchTerm}%`)
      ),
    ]
    if (minAge !== undefined) {
      conditions.push(sql`${this.usersTable.age} >= ${minAge}`)
    }
    return this.db
      .select()
      .from(this.usersTable)
      .where(and(...conditions))
  }

  /**
   * 3.3 JOIN 查询（用户 + 其文章数）
   * Drizzle 的 join 是显式的，无 N+1 隐患
   */
  async usersWithPostCount() {
    return this.db
      .select({
        userId: this.usersTable.id,
        email: this.usersTable.email,
        postCount: sql<number>`count(${this.postsTable.id})`.as('post_count'),
      })
      .from(this.usersTable)
      .leftJoin(this.postsTable, eq(this.postsTable.authorId, this.usersTable.id))
      .groupBy(this.usersTable.id)
  }

  /**
   * 3.4 子查询（IN 子查询）
   */
  async usersWithPublishedPosts() {
    const publishedPostAuthors = this.db
      .select({ authorId: this.postsTable.authorId })
      .from(this.postsTable)
      .where(eq(this.postsTable.published, true))
      .as('published_authors')

    return this.db
      .select()
      .from(this.usersTable)
      .where(sql`${this.usersTable.id} IN ${publishedPostAuthors}`)
  }

  /**
   * 3.5 Relational Query（ORM 风格）
   */
  async getUserWithPosts(userId: number) {
    // 使用 Drizzle 的关系查询 API
    return this.db.query.users.findFirst({
      where: eq(this.usersTable.id, userId),
      with: {
        posts: {
          where: eq(this.postsTable.published, true),
          orderBy: desc(this.postsTable.createdAt),
        },
      },
    })
  }
}

// ============================================================================
// 4. 事务模式
// ============================================================================

export class DrizzleTransactionPatterns {
  constructor(private db: MockDrizzleDb, private usersTable: any, private postsTable: any) {}

  /**
   * 4.1 创建用户并同时创建默认文章（原子操作）
   */
  async createUserWithWelcomePost(userData: Omit<DrizzleUser, 'id' | 'createdAt'>) {
    return this.db.transaction(async (tx) => {
      const user = await tx
        .insert(this.usersTable)
        .values(userData)
        .returning()
        .then((r: any[]) => r[0])

      await tx.insert(this.postsTable).values({
        title: 'Welcome!',
        content: 'This is your first post.',
        published: true,
        authorId: user.id,
      })

      return user
    })
  }

  /**
   * 4.2 批量导入（事务包裹）
   */
  async bulkImportUsers(users: Array<Omit<DrizzleUser, 'id' | 'createdAt'>>) {
    return this.db.transaction(async (tx) => {
      const results = []
      for (const user of users) {
        const inserted = await tx.insert(this.usersTable).values(user).returning()
        results.push(inserted[0])
      }
      return results
    })
  }
}

// ============================================================================
// 5. Edge / Serverless 最佳实践
// ============================================================================

/**
 * Drizzle ORM 在 Edge Runtime 中的配置要点：
 *
 * 1. 驱动选择：
 *    - Cloudflare Workers → @libsql/client-web (Turso) 或 @neondatabase/serverless
 *    - Vercel Edge → 同上，使用 HTTP 驱动避免 TCP 连接池问题
 *
 * 2. 连接管理：
 *    - Edge 无传统连接池，每个请求新建连接
 *    - 使用支持 HTTP 的数据库驱动（Neon, Turso, PlanetScale）
 *    - 查询后无需显式关闭（serverless driver 自动管理）
 *
 * 3. 冷启动优化：
 *    - Drizzle 本身仅 ~7KB gzipped，对冷启动影响极小
 *    - 避免在 handler 顶层初始化大量 schema，延迟到首次请求
 */

export function createEdgeDrizzleClient(env: { TURSO_URL: string; TURSO_AUTH_TOKEN: string }) {
  // 实际项目中：
  // import { createClient } from '@libsql/client'
  // import { drizzle } from 'drizzle-orm/libsql'
  // const client = createClient({ url: env.TURSO_URL, authToken: env.TURSO_AUTH_TOKEN })
  // return drizzle(client)

  console.log('Edge Drizzle Client 配置:')
  console.log('- URL:', env.TURSO_URL)
  console.log('- Driver: @libsql/client (HTTP)')
  console.log('- ORM: drizzle-orm/libsql')
  console.log('- Bundle impact: ~7KB gzipped')

  return null as any
}

// ============================================================================
// 6. 演示入口
// ============================================================================

export function demo(): void {
  console.log('=== Drizzle ORM 实践模式 ===\n')

  console.log('Schema 定义:')
  console.log('- 纯 TypeScript，零生成步骤')
  console.log('- pgTable / sqliteTable 定义表结构')
  console.log('- relations 定义关联')

  console.log('\n查询模式:')
  console.log('- SQL-like Fluent API: select().from().where()')
  console.log('- 显式 join: innerJoin / leftJoin / rightJoin')
  console.log('- Relational Query API: db.query.users.findMany({ with: { posts: true } })')
  console.log('- 子查询与 CTE 支持')

  console.log('\n事务模式:')
  console.log('- db.transaction(async (tx) => { ... })')
  console.log('- 自动回滚，支持嵌套')

  console.log('\nEdge 优势:')
  console.log('- Bundle 体积极小 (~7KB gzipped)')
  console.log('- 无原生二进制依赖')
  console.log('- 支持 Cloudflare Workers / Vercel Edge / Deno')
  console.log('- 与 Turso / Neon / D1 深度集成')

  console.log('\n与 Prisma 对比:')
  console.log('- Drizzle: SQL-like，零生成，极小体积，显式控制')
  console.log('- Prisma 7: Schema-first，自动迁移，WASM引擎，生态成熟')
}
