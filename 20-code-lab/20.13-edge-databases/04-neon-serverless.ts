/**
 * 04-neon-serverless.ts
 * ========================================
 * Neon Serverless 驱动与类型安全查询
 *
 * Neon 是一个 Serverless Postgres 平台，将存储与计算分离。
 * 其 `@neondatabase/serverless` 驱动专为 Serverless/边缘环境设计，
 * 通过 HTTP/WebSocket 协议连接数据库，无需持久 TCP。
 *
 * 核心特性:
 *   - 存储/计算分离架构
 *   - 自动暂停/恢复（节省成本）
 *   - 数据库分支（Git 式工作流）
 *   - Serverless 驱动兼容 Edge Runtime
 *
 * 安装依赖: npm install @neondatabase/serverless
 * 运行环境: Node.js, Cloudflare Workers, Vercel Edge, Deno
 */

import { neon, NeonQueryFunction, Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { integer, text, pgTable, serial, timestamp, varchar, jsonb } from "drizzle-orm/pg-core";
import { eq, desc, and, sql as drizzleSql } from "drizzle-orm";

// ============================================================================
// 1. 类型定义 — 业务模型
// ============================================================================

interface Product {
  id: number;
  sku: string;
  name: string;
  description: string;
  price: number;
  category: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

interface Order {
  id: number;
  customerEmail: string;
  totalAmount: number;
  status: "pending" | "paid" | "shipped" | "delivered" | "cancelled";
  items: OrderItem[];
  createdAt: string;
}

interface OrderItem {
  productId: number;
  quantity: number;
  unitPrice: number;
}

interface SalesReport {
  category: string;
  totalRevenue: number;
  orderCount: number;
  avgOrderValue: number;
}

// ============================================================================
// 2. Schema 定义 — 使用 Drizzle ORM
// ============================================================================

// Drizzle 的 schema 定义是 TypeScript 对象，完全类型安全
const products = pgTable("products", {
  id: serial("id").primaryKey(),
  sku: varchar("sku", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: integer("price").notNull(), // 以分为单位存储，避免浮点误差
  category: varchar("category", { length: 100 }).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerEmail: varchar("customer_email", { length: 255 }).notNull(),
  totalAmount: integer("total_amount").notNull(), // 以分为单位
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  items: jsonb("items").$type<OrderItem[]>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// ============================================================================
// 3. 原始 SQL 模式 — neon() 模板标签函数
// ============================================================================

/**
 * neon() 返回一个查询函数，支持模板字符串语法：
 *   const sql = neon(process.env.DATABASE_URL);
 *   const rows = await sql`SELECT * FROM products WHERE id = ${id}`;
 *
 * 优势：
 *   - HTTP 协议，无持久连接
 *   - 自动参数化（防注入）
 *   - 返回类型化数组
 */

function createNeonClient(): NeonQueryFunction<false, false> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is required");
  }
  return neon(connectionString);
}

// 使用原始 SQL 进行 CRUD
async function seedProductsWithNeon(sql: NeonQueryFunction<false, false>): Promise<void> {
  const sampleProducts = [
    { sku: "TECH-001", name: "Mechanical Keyboard", price: 14999, category: "electronics", description: "RGB backlit mechanical keyboard" },
    { sku: "TECH-002", name: "4K Monitor", price: 39999, category: "electronics", description: "27-inch 4K IPS display" },
    { sku: "HOME-001", name: "Smart Lamp", price: 4999, category: "home", description: "WiFi-enabled LED lamp" },
  ];

  for (const p of sampleProducts) {
    await sql`
      INSERT INTO products (sku, name, description, price, category)
      VALUES (${p.sku}, ${p.name}, ${p.description}, ${p.price}, ${p.category})
      ON CONFLICT (sku) DO NOTHING
    `;
  }
}

async function findProductBySku(
  sql: NeonQueryFunction<false, false>,
  sku: string
): Promise<Product | null> {
  const rows = await sql<Product>`
    SELECT id, sku, name, description, price, category, metadata,
           created_at as "createdAt", updated_at as "updatedAt"
    FROM products WHERE sku = ${sku}
  `;
  return rows[0] ?? null;
}

async function updateProductPrice(
  sql: NeonQueryFunction<false, false>,
  sku: string,
  newPrice: number
): Promise<void> {
  await sql`
    UPDATE products
    SET price = ${newPrice}, updated_at = NOW()
    WHERE sku = ${sku}
  `;
}

// ============================================================================
// 4. Drizzle ORM 模式 — 编译时类型安全
// ============================================================================

/**
 * Drizzle + Neon Serverless 提供最高级别的类型安全：
 *   - 表结构即类型定义
 *   - 查询构建器自动推断返回类型
 *   - 关系查询自动推断连接结果
 */

class ProductRepository {
  private db: ReturnType<typeof drizzle>;

  constructor(pool: Pool) {
    this.db = drizzle(pool, { schema: { products, orders } });
  }

  async createProduct(data: typeof products.$inferInsert): Promise<typeof products.$inferSelect> {
    const result = await this.db.insert(products).values(data).returning();
    return result[0];
  }

  async findById(id: number): Promise<typeof products.$inferSelect | null> {
    const result = await this.db.select().from(products).where(eq(products.id, id)).limit(1);
    return result[0] ?? null;
  }

  async findByCategory(category: string): Promise<(typeof products.$inferSelect)[]> {
    return this.db.select().from(products).where(eq(products.category, category));
  }

  async updatePrice(id: number, newPrice: number): Promise<void> {
    await this.db
      .update(products)
      .set({ price: newPrice, updatedAt: new Date() })
      .where(eq(products.id, id));
  }

  async deleteProduct(id: number): Promise<void> {
    await this.db.delete(products).where(eq(products.id, id));
  }

  // 聚合查询 — 使用 Drizzle 的 sql 模板
  async getCategoryStats(): Promise<SalesReport[]> {
    const result = await this.db
      .select({
        category: products.category,
        totalRevenue: drizzleSql<number>`SUM(${products.price})`,
        productCount: drizzleSql<number>`COUNT(*)`,
        avgPrice: drizzleSql<number>`AVG(${products.price})`,
      })
      .from(products)
      .groupBy(products.category);

    return result.map((r) => ({
      category: r.category,
      totalRevenue: Number(r.totalRevenue),
      orderCount: Number(r.productCount),
      avgOrderValue: Number(r.avgPrice),
    }));
  }
}

class OrderRepository {
  private db: ReturnType<typeof drizzle>;

  constructor(pool: Pool) {
    this.db = drizzle(pool, { schema: { products, orders } });
  }

  async createOrder(data: typeof orders.$inferInsert): Promise<typeof orders.$inferSelect> {
    const result = await this.db.insert(orders).values(data).returning();
    return result[0];
  }

  async findByStatus(status: Order["status"]): Promise<(typeof orders.$inferSelect)[]> {
    return this.db
      .select()
      .from(orders)
      .where(eq(orders.status, status))
      .orderBy(desc(orders.createdAt));
  }

  async getCustomerOrders(email: string): Promise<(typeof orders.$inferSelect)[]> {
    return this.db
      .select()
      .from(orders)
      .where(eq(orders.customerEmail, email))
      .orderBy(desc(orders.createdAt));
  }

  async updateStatus(id: number, status: Order["status"]): Promise<void> {
    await this.db.update(orders).set({ status }).where(eq(orders.id, id));
  }

  // 复杂查询：最近 30 天的销售汇总
  async getRecentSales(days = 30): Promise<{ date: string; revenue: number; orders: number }[]> {
    const result = await this.db
      .select({
        date: drizzleSql<string>`DATE(${orders.createdAt})`,
        revenue: drizzleSql<number>`SUM(${orders.totalAmount})`,
        orderCount: drizzleSql<number>`COUNT(*)`,
      })
      .from(orders)
      .where(
        and(
          eq(orders.status, "paid"),
          drizzleSql`${orders.createdAt} > NOW() - INTERVAL '${drizzleSql.raw(String(days))} days'`
        )
      )
      .groupBy(drizzleSql`DATE(${orders.createdAt})`)
      .orderBy(drizzleSql`DATE(${orders.createdAt})`);

    return result.map((r) => ({
      date: r.date,
      revenue: Number(r.revenue),
      orders: Number(r.orderCount),
    }));
  }
}

// ============================================================================
// 5. 连接池管理 — Serverless 环境的关键
// ============================================================================

/**
 * 虽然 neon() 函数使用 HTTP（无连接），但 Drizzle ORM 需要 Pool。
 * Neon 的 Pool 在 Serverless 环境中自动管理 WebSocket 连接。
 */

function createPoolClient(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is required");
  }

  return new Pool({ connectionString });
}

// ============================================================================
// 6. 事务支持 — 使用 Pool Client
// ============================================================================

async function createOrderWithInventoryCheck(
  pool: Pool,
  customerEmail: string,
  items: OrderItem[]
): Promise<number> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 计算总价
    const totalAmount = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

    // 创建订单
    const orderResult = await client.query(
      `INSERT INTO orders (customer_email, total_amount, status, items)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [customerEmail, totalAmount, "pending", JSON.stringify(items)]
    );

    const orderId = orderResult.rows[0].id;

    // 这里可以添加库存检查逻辑
    // 如果库存不足，抛出错误并回滚

    await client.query("COMMIT");
    return orderId;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

// ============================================================================
// 7. 主执行区
// ============================================================================

async function main(): Promise<void> {
  console.log("=== Neon Serverless Postgres Demo ===\n");

  const sql = createNeonClient();
  const pool = createPoolClient();
  const productRepo = new ProductRepository(pool);
  const orderRepo = new OrderRepository(pool);

  try {
    // 使用 Drizzle 创建表（生产环境应使用迁移工具）
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        sku VARCHAR(100) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price INTEGER NOT NULL,
        category VARCHAR(100) NOT NULL,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        customer_email VARCHAR(255) NOT NULL,
        total_amount INTEGER NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        items JSONB NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log("Schema initialized");

    // 使用原始 SQL 插入产品
    await seedProductsWithNeon(sql);
    console.log("Products seeded");

    // 使用 Repository 模式查询
    const keyboard = await productRepo.findById(1);
    console.log("Found product:", keyboard?.name, "- $", (keyboard?.price ?? 0) / 100);

    // 按类别查询
    const electronics = await productRepo.findByCategory("electronics");
    console.log(`Electronics: ${electronics.length} product(s)`);

    // 创建订单
    const order = await orderRepo.createOrder({
      customerEmail: "customer@example.com",
      totalAmount: 14999,
      status: "paid",
      items: [{ productId: 1, quantity: 1, unitPrice: 14999 }],
    });
    console.log(`Created order #${order.id}`);

    // 聚合统计
    const stats = await productRepo.getCategoryStats();
    console.log("Category stats:", stats.map((s) => `${s.category}: $${s.totalRevenue / 100}`));

    // 事务演示
    const orderId = await createOrderWithInventoryCheck(pool, "alice@example.com", [
      { productId: 1, quantity: 2, unitPrice: 14999 },
    ]);
    console.log(`Transaction created order #${orderId}`);

    console.log("\n=== Success: Neon Serverless operations completed ===");
  } finally {
    await pool.end();
  }
}

if (import.meta.main || (typeof process !== "undefined" && process.argv[1]?.includes("04-neon-serverless"))) {
  main().catch(console.error);
}

export {
  createNeonClient,
  createPoolClient,
  seedProductsWithNeon,
  findProductBySku,
  updateProductPrice,
  ProductRepository,
  OrderRepository,
  createOrderWithInventoryCheck,
  type Product,
  type Order,
  type OrderItem,
  type SalesReport,
};

// ============================================================================
// 8. Neon 平台特性与配置
// ============================================================================

/**
 * === 数据库分支 ===
 * Neon 允许像 Git 一样创建数据库分支：
 *   neonctl branches create --name feature-x --parent main
 *   neonctl branches reset --name feature-x --parent main
 *
 * 开发工作流:
 *   1. 为功能开发创建分支
 *   2. 使用分支的 connection_string 进行本地开发
 *   3. 测试通过后合并到 main
 *
 * === 自动暂停 ===
 * Neon 在无活动 5 分钟后自动暂停计算节点，
 * 下次请求时自动恢复（冷启动约 500ms）。
 * 付费计划可配置暂停时间或禁用自动暂停。
 *
 * === 连接配置 ===
 * DATABASE_URL 格式:
 *   postgresql://user:password@host.neon.tech/dbname?sslmode=require
 *
 * === 与 Prisma 集成 ===
 *   generator client { provider = "prisma-client-js" }
 *   datasource db { provider = "postgresql" url = env("DATABASE_URL") }
 *
 * === 与 Drizzle 集成 ===
 *   import { drizzle } from "drizzle-orm/neon-serverless";
 *   const db = drizzle(pool, { schema });
 */
