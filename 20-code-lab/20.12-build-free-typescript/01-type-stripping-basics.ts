/**
 * 01-type-stripping-basics.ts
 * ========================================
 * Node.js 23+ 类型剥离、tsx 与 jiti 基础用法
 *
 * 本文件演示如何在 Node.js 23+ 中直接运行 TypeScript，无需 tsc 编译。
 * 同时展示 tsx 和 jiti 作为向后兼容的替代方案。
 *
 * 运行方式:
 *   Node.js 23+:  node --experimental-strip-types 01-type-stripping-basics.ts
 *   tsx:          npx tsx 01-type-stripping-basics.ts
 *   jiti:         node --import jiti/register 01-type-stripping-basics.ts
 */

// ============================================================================
// 1. 基础类型注解 — 运行时被完全剥离
// ============================================================================

// 这些类型注解在运行时不存在任何开销，Node.js 的 strip-types 会在
// 加载模块时直接移除它们，保留纯 JavaScript 语义。
interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "editor" | "viewer";
}

// 函数参数和返回值的类型会在运行时被移除
type UserInput = Omit<User, "id">;

function createUser(input: UserInput): User {
  return {
    id: Math.floor(Math.random() * 100000),
    ...input,
  };
}

// 泛型同样被完全剥离，运行时至多看到常规的 JavaScript 函数
function mapArray<T, U>(arr: T[], mapper: (item: T) => U): U[] {
  return arr.map(mapper);
}

// ============================================================================
// 2. 枚举的处理 — Node.js strip-types 将枚举编译为对象
// ============================================================================

// Node.js 23+ 的类型剥离器会保留枚举作为运行时对象
// 这与 TypeScript 的编译行为一致
enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

function log(level: LogLevel, message: string): void {
  const prefix = ["DEBUG", "INFO", "WARN", "ERROR"][level];
  console.log(`[${prefix}] ${message}`);
}

// ============================================================================
// 3. 类型导入导出 — 使用 `type` 前缀确保完全擦除
// ============================================================================

// `import type` 保证这些导入在编译后完全消失，不会留下副作用
// 这是免构建模式下的最佳实践
import type { ReadableStream } from "node:stream/web";

// 值导入保留在运行时
import { createHash } from "node:crypto";

function hashEmail(email: string): string {
  return createHash("sha256").update(email).digest("hex").slice(0, 16);
}

// ============================================================================
// 4. 接口驱动开发 — 类型作为活文档
// ============================================================================

interface Repository<T> {
  findById(id: number): Promise<T | null>;
  save(entity: T): Promise<T>;
  delete(id: number): Promise<boolean>;
}

// 内存实现，仅用于演示
class InMemoryUserRepo implements Repository<User> {
  private users = new Map<number, User>();

  async findById(id: number): Promise<User | null> {
    return this.users.get(id) ?? null;
  }

  async save(entity: User): Promise<User> {
    this.users.set(entity.id, entity);
    return entity;
  }

  async delete(id: number): Promise<boolean> {
    return this.users.delete(id);
  }
}

// ============================================================================
// 5. 类型谓词与运行时检查的结合 — AI 辅助编码的典型模式
// ============================================================================

// AI 工具（如 Cursor、Copilot）常生成此类模式：
// 类型谓词提供编译时保证，运行时检查提供安全性
function isValidUser(obj: unknown): obj is User {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "id" in obj &&
    typeof (obj as Record<string, unknown>).id === "number" &&
    "name" in obj &&
    typeof (obj as Record<string, unknown>).name === "string" &&
    "email" in obj &&
    typeof (obj as Record<string, unknown>).email === "string"
  );
}

// ============================================================================
// 6. 主执行区 — 演示所有功能的实际运行
// ============================================================================

async function main(): Promise<void> {
  console.log("=== Node.js Type Stripping Demo ===\n");

  // 演示基础类型被剥离后正常运行
  const user = createUser({
    name: "Alice",
    email: "alice@example.com",
    role: "admin",
  });
  console.log("Created user:", user);

  // 演示泛型函数
  const emails = mapArray([user], (u) => u.email);
  console.log("Mapped emails:", emails);

  // 演示枚举保留
  log(LogLevel.INFO, "Application started");
  log(LogLevel.DEBUG, `User hash: ${hashEmail(user.email)}`);

  // 演示 Repository 模式
  const repo = new InMemoryUserRepo();
  await repo.save(user);
  const found = await repo.findById(user.id);
  console.log("Found from repo:", found);

  // 演示类型谓词
  const rawData = { id: 42, name: "Bob", email: "bob@test.com", role: "editor" };
  if (isValidUser(rawData)) {
    console.log("Valid user:", rawData.name);
  }

  console.log("\n=== Success: TypeScript ran without build step ===");
}

main().catch(console.error);

// ============================================================================
// 7. 向后兼容：tsx 与 jiti 的运行时加载
// ============================================================================

/**
 * tsx (基于 esbuild):
 *   - 支持完整的 TypeScript 特性，包括装饰器、namespace
 *   - 启动速度接近原生，适合开发阶段
 *   - 命令: npx tsx 01-type-stripping-basics.ts
 *
 * jiti (基于 Babel):
 *   - 轻量级运行时编译器，兼容性极好
 *   - 适合在已有 Node.js 项目中渐进式引入 TS
 *   - 命令: node --import jiti/register 01-type-stripping-basics.ts
 *
 * 选型建议:
 *   - Node 23+ 生产环境 → node --experimental-strip-types
 *   - 开发/完整特性   → tsx
 *   - 兼容性优先      → jiti
 */
