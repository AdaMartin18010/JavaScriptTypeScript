/**
 * @file Drizzle SQL-like 查询模式大全
 * @category ORM Modern Lab → Query Patterns
 * @difficulty medium
 * @tags drizzle, query, sql, join, cte, subquery, crud
 *
 * @description
 * Drizzle ORM 提供两套查询 API：
 * 1. SQL-like Fluent API（显式、透明、无隐藏查询）
 * 2. Relational Query API（ORM 风格，自动处理关联）
 *
 * 本文件覆盖：
 * - SELECT / WHERE / ORDER BY / LIMIT OFFSET / 聚合
 * - JOIN（inner, left, right, full）
 * - INSERT / UPDATE / DELETE / UPSERT
 * - Subquery（子查询）
 * - CTE（Common Table Expression / WITH 语句）
 * - 事务与批量操作
 * - 动态查询构建
 */

import { eq, ne, gt, gte, lt, lte, like, ilike, inArray, notInArray,
  isNull, isNotNull, between, asc, desc, and, or, not,
  sql, count, sum, avg, max, min, exists } from 'drizzle-orm'
import { pgTable, serial, varchar, integer, text, boolean, timestamp, decimal } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// ============================================================================
// 1. 示例 Schema（内联定义，方便单文件运行）
// ============================================================================

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  age: integer('age'),
  status: varchar('status', { length: 20 }).notNull().default('active'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  total: decimal('total', { precision: 10, scale: 2 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').notNull().references(() => orders.id),
  productName: varchar('product_name', { length: 255 }).notNull(),
  quantity: integer('quantity').notNull(),
  unitPrice: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
})

export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
}))

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  items: many(orderItems),
}))

// ============================================================================
// 2. SELECT 查询模式
// ============================================================================

export async function selectPatterns(db: any) {
  console.log('=== SELECT 查询模式 ===\n')

  // 2.1 基础查询
  const allUsers = await db.select().from(users)
  console.log('全部用户:', allUsers.length)

  // 2.2 指定列 + 别名
  const userEmails = await db
    .select({
      id: users.id,
      email: users.email,
      displayName: users.name,
    })
    .from(users)
  console.log('指定列:', userEmails.length)

  // 2.3 WHERE 条件（单条件）
  const activeUsers = await db
    .select()
    .from(users)
    .where(eq(users.status, 'active'))

  // 2.4 WHERE 多条件（AND / OR）
  const adultActiveUsers = await db
    .select()
    .from(users)
    .where(
      and(
        eq(users.status, 'active'),
        gte(users.age, 18)
      )
    )

  const specialUsers = await db
    .select()
    .from(users)
    .where(
      or(
        eq(users.email, 'admin@example.com'),
        and(
          eq(users.status, 'vip'),
          gte(users.age, 21)
        )
      )
    )

  // 2.5 LIKE / ILIKE（模糊匹配）
  const gmailUsers = await db
    .select()
    .from(users)
    .where(like(users.email, '%@gmail.com'))

  const nameContainsJohn = await db
    .select()
    .from(users)
    .where(ilike(users.name, '%john%'))

  // 2.6 IN / NOT IN
  const specificUsers = await db
    .select()
    .from(users)
    .where(inArray(users.id, [1, 2, 3, 4, 5]))

  const excludedUsers = await db
    .select()
    .from(users)
    .where(notInArray(users.status, ['banned', 'deleted']))

  // 2.7 NULL 检查
  const unnamedUsers = await db
    .select()
    .from(users)
    .where(isNull(users.name))

  const namedUsers = await db
    .select()
    .from(users)
    .where(isNotNull(users.name))

  // 2.8 BETWEEN
  const middleAged = await db
    .select()
    .from(users)
    .where(between(users.age, 30, 50))

  // 2.9 ORDER BY + LIMIT + OFFSET（分页）
  const paginatedUsers = await db
    .select()
    .from(users)
    .where(eq(users.status, 'active'))
    .orderBy(desc(users.createdAt), asc(users.name))
    .limit(20)
    .offset(40)

  // 2.10 聚合查询
  const userStats = await db
    .select({
      totalUsers: count(users.id),
      avgAge: avg(users.age),
      maxAge: max(users.age),
      minAge: min(users.age),
    })
    .from(users)

  // 2.11 GROUP BY + HAVING
  const statusCounts = await db
    .select({
      status: users.status,
      count: count(users.id),
    })
    .from(users)
    .groupBy(users.status)
    .having(sql`count(${users.id}) > 5`)

  console.log('SELECT 模式演示完成')
}

// ============================================================================
// 3. JOIN 查询模式（无 N+1，显式控制）
// ============================================================================

export async function joinPatterns(db: any) {
  console.log('\n=== JOIN 查询模式 ===\n')

  // 3.1 INNER JOIN
  const ordersWithUsers = await db
    .select({
      orderId: orders.id,
      total: orders.total,
      userEmail: users.email,
      userName: users.name,
    })
    .from(orders)
    .innerJoin(users, eq(orders.userId, users.id))

  // 3.2 LEFT JOIN（保留所有订单，即使用户缺失）
  const allOrdersWithUsers = await db
    .select({
      orderId: orders.id,
      total: orders.total,
      userEmail: users.email,
    })
    .from(orders)
    .leftJoin(users, eq(orders.userId, users.id))

  // 3.3 RIGHT JOIN
  const usersWithOrders = await db
    .select()
    .from(orders)
    .rightJoin(users, eq(orders.userId, users.id))

  // 3.4 FULL JOIN
  const allUsersAndOrders = await db
    .select()
    .from(orders)
    .fullJoin(users, eq(orders.userId, users.id))

  // 3.5 多表 JOIN（orders + users + order_items）
  const detailedOrders = await db
    .select({
      orderId: orders.id,
      userEmail: users.email,
      productName: orderItems.productName,
      quantity: orderItems.quantity,
      lineTotal: sql`${orderItems.quantity} * ${orderItems.unitPrice}`.as('line_total'),
    })
    .from(orders)
    .innerJoin(users, eq(orders.userId, users.id))
    .innerJoin(orderItems, eq(orderItems.orderId, orders.id))
    .where(eq(orders.status, 'completed'))

  // 3.6 自连接（例如查询同一用户的订单对）
  const u1 = users
  const u2 = users
  // 实际自连接需要表别名，Drizzle 支持通过重新 import 或使用 sql 别名

  console.log('JOIN 模式演示完成')
}

// ============================================================================
// 4. INSERT / UPDATE / DELETE / UPSERT
// ============================================================================

export async function writePatterns(db: any) {
  console.log('\n=== 写入操作模式 ===\n')

  // 4.1 单条 INSERT
  const newUser = await db
    .insert(users)
    .values({
      email: 'alice@example.com',
      name: 'Alice',
      age: 28,
    })
    .returning()

  // 4.2 批量 INSERT
  const newUsers = await db
    .insert(users)
    .values([
      { email: 'bob@example.com', name: 'Bob', age: 32 },
      { email: 'carol@example.com', name: 'Carol', age: 25 },
      { email: 'dave@example.com', name: 'Dave', age: 40 },
    ])
    .returning()

  // 4.3 INSERT ... ON CONFLICT DO NOTHING（忽略冲突）
  const maybeInserted = await db
    .insert(users)
    .values({ email: 'alice@example.com', name: 'Alice Duplicate' })
    .onConflictDoNothing({ target: users.email })
    .returning()

  // 4.4 INSERT ... ON CONFLICT DO UPDATE（UPSERT）
  const upsertedUser = await db
    .insert(users)
    .values({ email: 'alice@example.com', name: 'Alice Updated', age: 29 })
    .onConflictDoUpdate({
      target: users.email,
      set: { name: 'Alice Updated', age: 29 },
    })
    .returning()

  // 4.5 UPDATE（单条）
  const updatedUser = await db
    .update(users)
    .set({ name: 'Alice Smith', age: 30 })
    .where(eq(users.id, 1))
    .returning()

  // 4.6 UPDATE（批量）
  const batchUpdate = await db
    .update(users)
    .set({ status: 'inactive' })
    .where(lt(users.createdAt, new Date('2023-01-01')))

  // 4.7 UPDATE with 表达式（age + 1）
  const incrementedAge = await db
    .update(users)
    .set({ age: sql`${users.age} + 1` })
    .where(eq(users.id, 1))
    .returning()

  // 4.8 DELETE（单条）
  const deletedUser = await db
    .delete(users)
    .where(eq(users.id, 99))
    .returning()

  // 4.9 DELETE（批量）
  const deletedInactive = await db
    .delete(users)
    .where(eq(users.status, 'deleted'))

  console.log('写入操作模式演示完成')
}

// ============================================================================
// 5. Subquery（子查询）
// ============================================================================

export async function subqueryPatterns(db: any) {
  console.log('\n=== 子查询模式 ===\n')

  // 5.1 标量子查询（SELECT 中的子查询）
  const usersWithOrderCount = await db
    .select({
      id: users.id,
      email: users.email,
      orderCount: sql<number>`(SELECT count(*) FROM ${orders} WHERE ${orders.userId} = ${users.id})`.as('order_count'),
    })
    .from(users)

  // 5.2 子查询作为 derived table
  const userTotals = db
    .select({
      userId: orders.userId,
      totalSpent: sql<number>`sum(${orders.total})`.as('total_spent'),
    })
    .from(orders)
    .where(eq(orders.status, 'completed'))
    .groupBy(orders.userId)
    .as('user_totals')

  const topSpenders = await db
    .select({
      userEmail: users.email,
      totalSpent: userTotals.totalSpent,
    })
    .from(userTotals)
    .innerJoin(users, eq(userTotals.userId, users.id))
    .where(sql`${userTotals.totalSpent} > 1000`)

  // 5.3 EXISTS 子查询
  const usersWithOrders = await db
    .select()
    .from(users)
    .where(
      exists(
        db.select().from(orders).where(eq(orders.userId, users.id))
      )
    )

  // 5.4 IN 子查询
  const usersWithCompletedOrders = await db
    .select()
    .from(users)
    .where(
      inArray(
        users.id,
        db.select({ userId: orders.userId }).from(orders).where(eq(orders.status, 'completed'))
      )
    )

  console.log('子查询模式演示完成')
}

// ============================================================================
// 6. CTE（Common Table Expression / WITH 语句）
// ============================================================================

export async function ctePatterns(db: any) {
  console.log('\n=== CTE 模式 ===\n')

  // 6.1 简单 WITH CTE
  const activeUserCTE = db
    .select()
    .from(users)
    .where(eq(users.status, 'active'))
    .as('active_users')

  const result = await db
    .with(activeUserCTE)
    .select()
    .from(activeUserCTE)
    .where(gt(activeUserCTE.age, 18))

  // 6.2 递归 CTE（层级数据，如分类树、组织结构）
  // 注意：递归 CTE 语法需配合 sql 标签使用
  const categoryTree = await db.execute(sql`
    WITH RECURSIVE category_tree AS (
      SELECT id, name, parent_id, 0 AS depth
      FROM categories
      WHERE parent_id IS NULL

      UNION ALL

      SELECT c.id, c.name, c.parent_id, ct.depth + 1
      FROM categories c
      INNER JOIN category_tree ct ON c.parent_id = ct.id
    )
    SELECT * FROM category_tree;
  `)

  // 6.3 多个 CTE
  const cte1 = db.select().from(users).where(eq(users.status, 'active')).as('cte_active')
  const cte2 = db.select().from(orders).where(eq(orders.status, 'completed')).as('cte_completed')

  const multiCteResult = await db
    .with(cte1, cte2)
    .select({
      userEmail: cte1.email,
      orderId: cte2.id,
    })
    .from(cte1)
    .innerJoin(cte2, eq(cte1.id, cte2.userId))

  console.log('CTE 模式演示完成')
}

// ============================================================================
// 7. 事务与批量操作
// ============================================================================

export async function transactionPatterns(db: any) {
  console.log('\n=== 事务模式 ===\n')

  // 7.1 标准事务
  await db.transaction(async (tx: any) => {
    const user = await tx
      .insert(users)
      .values({ email: 'txn@example.com', name: 'Txn User' })
      .returning()

    await tx
      .insert(orders)
      .values({
        userId: user[0].id,
        total: '199.99',
        status: 'pending',
      })

    // 如果任何一步失败，整个事务回滚
  })

  // 7.2 事务中查询
  await db.transaction(async (tx: any) => {
    // 先锁定用户记录（FOR UPDATE）
    const user = await tx
      .select()
      .from(users)
      .where(eq(users.id, 1))
      .for('update')

    // 更新余额
    await tx
      .update(users)
      .set({ age: sql`${users.age} + 1` })
      .where(eq(users.id, 1))
  })

  // 7.3 批量插入（事务包裹）
  const orderValues = Array.from({ length: 100 }, (_, i) => ({
    userId: 1,
    total: String((i + 1) * 10),
    status: 'pending' as const,
  }))

  await db.transaction(async (tx: any) => {
    await tx.insert(orders).values(orderValues)
  })

  console.log('事务模式演示完成')
}

// ============================================================================
// 8. 动态查询构建
// ============================================================================

export async function dynamicQueryPatterns(db: any) {
  console.log('\n=== 动态查询模式 ===\n')

  // 8.1 条件拼接 WHERE
  function buildUserQuery(filters: { status?: string; minAge?: number; search?: string }) {
    const conditions = []

    if (filters.status) {
      conditions.push(eq(users.status, filters.status))
    }
    if (filters.minAge !== undefined) {
      conditions.push(gte(users.age, filters.minAge))
    }
    if (filters.search) {
      conditions.push(ilike(users.name, `%${filters.search}%`))
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    return db
      .select()
      .from(users)
      .where(whereClause)
      .orderBy(asc(users.name))
  }

  // 使用
  const filteredUsers1 = await buildUserQuery({ status: 'active', minAge: 18 })
  const filteredUsers2 = await buildUserQuery({ search: 'john' })
  const filteredUsers3 = await buildUserQuery({})

  // 8.2 动态列选择
  function selectUserColumns(columns: ('id' | 'email' | 'name' | 'age')[]) {
    const selection: Record<string, any> = {}
    for (const col of columns) {
      selection[col] = users[col]
    }
    return db.select(selection).from(users).limit(10)
  }

  const minimalUsers = await selectUserColumns(['id', 'email'])

  // 8.3 动态排序
  function orderUsersBy(field: 'name' | 'age' | 'createdAt', direction: 'asc' | 'desc') {
    const column = users[field]
    const orderFn = direction === 'asc' ? asc : desc
    return db.select().from(users).orderBy(orderFn(column))
  }

  const sortedByAge = await orderUsersBy('age', 'desc')

  console.log('动态查询模式演示完成')
}

// ============================================================================
// 9. Relational Query API（ORM 风格）
// ============================================================================

export async function relationalQueryPatterns(db: any) {
  console.log('\n=== Relational Query API ===\n')

  // 9.1 查询用户及其订单
  const usersWithOrders = await db.query.users.findMany({
    where: eq(users.status, 'active'),
    with: {
      orders: {
        where: eq(orders.status, 'completed'),
        with: {
          items: true,
        },
      },
    },
  })

  // 9.2 查询单条及关联
  const userWithDetails = await db.query.users.findFirst({
    where: eq(users.id, 1),
    with: {
      orders: {
        columns: { id: true, total: true, status: true },
        orderBy: desc(orders.createdAt),
        limit: 5,
      },
    },
  })

  // 9.3 计数关联
  const usersWithOrderCount = await db.query.users.findMany({
    with: {
      orders: {
        columns: {}, // 不选择订单列，只计数
        extras: {
          orderCount: sql<number>`count(*)`.as('order_count'),
        },
      },
    },
  })

  console.log('Relational Query API 演示完成')
}

// ============================================================================
// 10. 汇总演示入口
// ============================================================================

export async function demo(db: any): Promise<void> {
  console.log('=== Drizzle 查询模式大全 ===\n')

  await selectPatterns(db)
  await joinPatterns(db)
  await writePatterns(db)
  await subqueryPatterns(db)
  await ctePatterns(db)
  await transactionPatterns(db)
  await dynamicQueryPatterns(db)
  await relationalQueryPatterns(db)

  console.log('\n要点总结:')
  console.log('- SQL-like API：显式、透明、开发者完全掌控 SQL')
  console.log('- 无 N+1：join 必须显式书写，查询行为可预测')
  console.log('- 零生成步骤：Schema 即 TypeScript，类型实时推导')
  console.log('- 两套 API：SQL-like（精细控制）+ Relational（便捷关联）')
  console.log('- 事务支持：标准 ACID 事务，支持 FOR UPDATE 锁定')
}
