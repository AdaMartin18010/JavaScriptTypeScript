/**
 * 03-bun-runner.ts
 * ========================================
 * Bun 运行时的 TypeScript 原生支持
 *
 * Bun 是一个极速 JavaScript 运行时，使用 Zig 编写，内置 TypeScript
 * 和 JSX 转译器。它对 TypeScript 的支持是开箱即用、零配置的。
 *
 * 运行方式:
 *   bun run 03-bun-runner.ts
 *   bun run --watch 03-bun-runner.ts  # 开发 watch 模式
 *   bun test                          # 运行 .test.ts 文件
 */

// ============================================================================
// 1. 原生 TypeScript 执行 — 无需任何配置
// ============================================================================

// Bun 在内部自动转译 TypeScript，支持所有标准 TS 特性
// 包括：类型注解、接口、泛型、枚举、命名空间、装饰器（实验性）

interface Product {
  id: string;
  name: string;
  price: number;
  category: "electronics" | "clothing" | "food";
  tags: string[];
}

// 使用 `satisfies` 运算符确保对象符合类型，同时保留具体类型信息
const sampleProduct = {
  id: "prod-001",
  name: "Wireless Headphones",
  price: 199.99,
  category: "electronics" as const,
  tags: ["audio", "bluetooth", "wireless"],
} satisfies Product;

// ============================================================================
// 2. Bun 特有的高性能 API
// ============================================================================

// Bun.file 提供带类型的文件读取接口
async function readProductsFromFile(path: string): Promise<Product[]> {
  const file = Bun.file(path);

  // Bun.file 返回的类型包含 size、type、text()、json() 等方法
  if (!(await file.exists())) {
    return [];
  }

  // .json() 自动解析并支持泛型推断
  return file.json<Product[]>();
}

// Bun.write 是高性能的文件写入 API
async function saveProductsToFile(path: string, products: Product[]): Promise<void> {
  await Bun.write(path, JSON.stringify(products, null, 2));
}

// ============================================================================
// 3. Bun 内置 SQLite — 无需额外依赖
// ============================================================================

// bun:sqlite 是 Bun 独有的内置模块，性能极高
import { Database } from "bun:sqlite";

interface ProductRow {
  id: string;
  name: string;
  price: number;
  category: string;
}

function initDatabase(): Database {
  // 创建或打开 SQLite 数据库（内存模式用 ":memory:"）
  const db = new Database("products.db", { create: true });

  // 启用 WAL 模式提升并发性能
  db.run("PRAGMA journal_mode = WAL;");

  // 创建表
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      category TEXT NOT NULL,
      created_at INTEGER DEFAULT (unixepoch())
    )
  `);

  return db;
}

function seedProducts(db: Database): void {
  // 预处理语句（prepared statement）提供最佳性能
  const insert = db.prepare(`
    INSERT OR IGNORE INTO products (id, name, price, category)
    VALUES ($id, $name, $price, $category)
  `);

  // 使用事务批量插入
  db.transaction(() => {
    const products: Omit<Product, "tags">[] = [
      { id: "p1", name: "Laptop", price: 1299.0, category: "electronics" },
      { id: "p2", name: "T-Shirt", price: 29.99, category: "clothing" },
      { id: "p3", name: "Coffee", price: 12.5, category: "food" },
    ];

    for (const p of products) {
      insert.run({ $id: p.id, $name: p.name, $price: p.price, $category: p.category });
    }
  })();
}

function queryProducts(db: Database, minPrice = 0): ProductRow[] {
  // query 返回带类型的行数据
  const stmt = db.prepare("SELECT id, name, price, category FROM products WHERE price >= $minPrice");
  return stmt.all({ $minPrice: minPrice }) as ProductRow[];
}

// ============================================================================
// 4. Bun 的 HTTP 服务器 — 极速启动
// ============================================================================

// Bun.serve 是高性能 HTTP 服务器，支持 TypeScript 处理函数直接作为处理器
function startServer(db: Database): void {
  const server = Bun.serve({
    port: Number(Bun.env.PORT ?? 3000),
    // 请求处理器可以是异步函数，类型自动推断
    async fetch(req): Promise<Response> {
      const url = new URL(req.url);

      // 路由分发
      if (url.pathname === "/" && req.method === "GET") {
        return Response.json({
          runtime: "Bun",
          version: Bun.version,
          timestamp: Date.now(),
        });
      }

      if (url.pathname === "/products" && req.method === "GET") {
        const minPrice = parseFloat(url.searchParams.get("minPrice") ?? "0");
        const products = queryProducts(db, minPrice);
        return Response.json({ data: products, count: products.length });
      }

      if (url.pathname === "/products" && req.method === "POST") {
        // req.json() 自动解析 JSON body
        const body = (await req.json()) as Partial<Product>;

        if (!body.id || !body.name || typeof body.price !== "number") {
          return new Response(JSON.stringify({ error: "Invalid product data" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        const insert = db.prepare(`
          INSERT INTO products (id, name, price, category)
          VALUES ($id, $name, $price, $category)
        `);
        insert.run({
          $id: body.id,
          $name: body.name,
          $price: body.price,
          $category: body.category ?? "unknown",
        });

        return Response.json({ success: true, id: body.id }, { status: 201 });
      }

      return new Response("Not Found", { status: 404 });
    },

    // 错误处理
    error(error): Response {
      console.error("Server error:", error);
      return new Response("Internal Server Error", { status: 500 });
    },
  });

  console.log(`Bun server running at ${server.url}`);
}

// ============================================================================
// 5. Bun 测试运行器 — 原生支持 TypeScript 测试
// ============================================================================

// Bun 内置测试运行器，API 与 Jest 兼容，但直接支持 .ts 文件
// 在 .test.ts 文件中可以这样写：
// import { test, expect } from "bun:test";
// test("addition", () => { expect(1 + 1).toBe(2); });

function formatPrice(price: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(price);
}

// ============================================================================
// 6. 主执行区
// ============================================================================

if (import.meta.main) {
  console.log("=== Bun TypeScript Runtime Demo ===");
  console.log(`Bun version: ${Bun.version}`);
  console.log(`Runtime: ${Bun.runtime}`);

  // 演示文件操作
  await saveProductsToFile("/tmp/sample-products.json", [sampleProduct]);
  const loaded = await readProductsFromFile("/tmp/sample-products.json");
  console.log("Loaded from file:", loaded[0]?.name);

  // 演示 SQLite
  const db = initDatabase();
  seedProducts(db);
  const allProducts = queryProducts(db, 0);
  console.log(`Database has ${allProducts.length} products`);

  // 演示格式化
  console.log("Formatted price:", formatPrice(199.99));

  // 启动 HTTP 服务器（取消注释以运行）
  // startServer(db);

  console.log("\n=== Success: Bun ran TypeScript natively ===");
}

export { initDatabase, seedProducts, queryProducts, formatPrice, type Product, type ProductRow };

// ============================================================================
// 7. Bun 配置示例 (package.json 或 bunfig.toml)
// ============================================================================

/**
 * package.json:
 * {
 *   "name": "bun-ts-demo",
 *   "scripts": {
 *     "dev": "bun run --watch 03-bun-runner.ts",
 *     "start": "bun run 03-bun-runner.ts",
 *     "test": "bun test",
 *     "typecheck": "tsc --noEmit"
 *   },
 *   "dependencies": {},
 *   "devDependencies": {
 *     "typescript": "^5.4.0",
 *     "@types/bun": "latest"
 *   }
 * }
 *
 * bunfig.toml:
 * [install]
 * exact = true
 *
 * [run]
 * # 自动将 ts 文件作为 ESM 处理
 * bun = true
 *
 * 优势：
 *   - 启动速度极快（冷启动 < 20ms）
 *   - 内置打包器、测试运行器、SQLite
 *   - package.json scripts 直接用 bun run 执行
 *   - 兼容 Node.js API，迁移成本低
 */
