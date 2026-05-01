/**
 * 04-tsx-loader.ts
 * ========================================
 * tsx / esno 开发加载器的高级用法
 *
 * tsx 是基于 esbuild 的 TypeScript 执行工具，为 Node.js 提供了最快的
 * TypeScript 执行体验。它是 Node.js 23+ 原生 strip-types 之前最成熟的
 * 免构建方案，至今仍因完整的 TS 特性支持而广泛使用。
 *
 * 安装: npm install --save-dev tsx
 *
 * 运行方式:
 *   npx tsx 04-tsx-loader.ts
 *   npx tsx watch 04-tsx-loader.ts    # watch 模式
 *   tsx                               # TypeScript REPL
 */

// ============================================================================
// 1. tsx 支持的完整 TypeScript 特性
// ============================================================================

// tsx 使用 esbuild 进行转译，支持几乎所有 TypeScript 特性：
// - 类型注解、接口、类型别名、泛型
// - 枚举（包括 const enum）
// - 装饰器（legacy 和 TC39 Stage 3）
// - 模块解析（包括 paths 映射）
// - JSX/TSX（开箱即用）
// - Import assertions 和 Import attributes

// 装饰器示例 — Node.js 原生 strip-types 不支持，但 tsx 完美支持
function LogCall(target: unknown, propertyKey: string, descriptor: PropertyDescriptor): void {
  const original = descriptor.value;
  descriptor.value = function (...args: unknown[]) {
    console.log(`[CALL] ${propertyKey}(${args.map((a) => JSON.stringify(a)).join(", ")})`);
    return original.apply(this, args);
  };
}

class Calculator {
  private history: string[] = [];

  @LogCall
  add(a: number, b: number): number {
    const result = a + b;
    this.history.push(`add(${a}, ${b}) = ${result}`);
    return result;
  }

  @LogCall
  multiply(a: number, b: number): number {
    const result = a * b;
    this.history.push(`multiply(${a}, ${b}) = ${result}`);
    return result;
  }

  getHistory(): readonly string[] {
    return this.history;
  }
}

// ============================================================================
// 2. 路径别名解析 — tsx 读取 tsconfig.json paths
// ============================================================================

// 如果 tsconfig.json 中配置了：
// "paths": { "@/*": ["./src/*"], "@utils/*": ["./src/utils/*"] }
// tsx 会自动解析这些别名，无需额外配置

// 本文件内演示相对导入的模拟
// import { validateEmail } from "@utils/validation"; // 若有 tsconfig paths 配置则可正常工作

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ============================================================================
// 3. 类型安全的环境配置加载
// ============================================================================

// tsx 运行时可以配合 dotenv 实现类型安全的环境变量
interface AppEnv {
  NODE_ENV: "development" | "production" | "test";
  PORT: number;
  DATABASE_URL: string;
  API_SECRET: string;
}

function loadEnv(): AppEnv {
  // 在 tsx 环境中，process.env 与 Node.js 完全一致
  const port = parseInt(process.env.PORT ?? "3000", 10);

  if (Number.isNaN(port)) {
    throw new Error(`Invalid PORT: ${process.env.PORT}`);
  }

  return {
    NODE_ENV: (process.env.NODE_ENV as AppEnv["NODE_ENV"]) ?? "development",
    PORT: port,
    DATABASE_URL: process.env.DATABASE_URL ?? "postgres://localhost:5432/myapp",
    API_SECRET: process.env.API_SECRET ?? "dev-secret-change-in-production",
  };
}

// ============================================================================
// 4. 使用 tsx 进行脚本与 CLI 开发
// ============================================================================

// tsx 特别适合开发内部脚本和 CLI 工具
interface Task {
  name: string;
  action: () => Promise<void>;
}

class TaskRunner {
  private tasks = new Map<string, Task>();

  register(name: string, action: () => Promise<void>): void {
    this.tasks.set(name, { name, action });
  }

  async run(name: string): Promise<void> {
    const task = this.tasks.get(name);
    if (!task) {
      console.error(`Unknown task: ${name}`);
      console.log(`Available tasks: ${Array.from(this.tasks.keys()).join(", ")}`);
      process.exit(1);
    }

    console.log(`Running task: ${name}`);
    const start = performance.now();
    await task.action();
    console.log(`Completed in ${(performance.now() - start).toFixed(2)}ms`);
  }
}

// ============================================================================
// 5. ESM 与 CJS 互操作 — tsx 自动处理
// ============================================================================

// tsx 的一大优势是自动处理模块格式
// 无论 tsconfig.json 配置 module 为 CommonJS 还是 ESNext，tsx 都能正确运行

// 动态导入（ESM 特性）在 tsx 中正常工作
async function loadModule<T>(path: string): Promise<T> {
  const mod = await import(path);
  return mod as T;
}

// 顶层 await — tsx 完全支持
const config = {
  appName: "tsx-demo",
  version: "1.0.0",
};

// ============================================================================
// 6. 类型安全的事件总线 — 利用 TS 泛型实现
// ============================================================================

type EventMap = {
  "user:login": { userId: string; timestamp: number };
  "user:logout": { userId: string; timestamp: number };
  "error": { message: string; stack?: string };
};

type EventName = keyof EventMap;

type EventHandler<K extends EventName> = (payload: EventMap[K]) => void;

class TypedEventBus {
  private listeners: {
    [K in EventName]?: Array<EventHandler<K>>;
  } = {};

  on<K extends EventName>(event: K, handler: EventHandler<K>): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(handler);

    // 返回取消订阅函数
    return () => {
      this.listeners[event] = this.listeners[event]!.filter((h) => h !== handler);
    };
  }

  emit<K extends EventName>(event: K, payload: EventMap[K]): void {
    const handlers = this.listeners[event];
    if (handlers) {
      handlers.forEach((h) => h(payload));
    }
  }
}

// ============================================================================
// 7. 主执行区
// ============================================================================

async function main(): Promise<void> {
  console.log("=== tsx TypeScript Loader Demo ===\n");

  // 演示装饰器（tsx 支持，Node.js strip-types 不支持）
  const calc = new Calculator();
  console.log("add(2, 3):", calc.add(2, 3));
  console.log("multiply(4, 5):", calc.multiply(4, 5));
  console.log("History:", calc.getHistory());

  // 演示环境变量加载
  const env = loadEnv();
  console.log("\nEnvironment:", {
    nodeEnv: env.NODE_ENV,
    port: env.PORT,
    dbUrl: env.DATABASE_URL.replace(/:\/\/.*@/, "://***@"), // 隐藏凭据
  });

  // 演示邮箱验证
  console.log("\nvalidateEmail('test@example.com'):", validateEmail("test@example.com"));
  console.log("validateEmail('invalid'):", validateEmail("invalid"));

  // 演示任务运行器
  const runner = new TaskRunner();
  runner.register("health-check", async () => {
    console.log("  Checking system health...");
    await new Promise((r) => setTimeout(r, 50));
    console.log("  System healthy");
  });
  runner.register("sync-data", async () => {
    console.log("  Syncing data...");
    await new Promise((r) => setTimeout(r, 50));
    console.log("  Sync complete");
  });

  await runner.run("health-check");

  // 演示类型安全的事件总线
  const bus = new TypedEventBus();
  bus.on("user:login", (payload) => {
    console.log(`\nUser ${payload.userId} logged in at ${payload.timestamp}`);
  });
  bus.emit("user:login", { userId: "user-123", timestamp: Date.now() });

  console.log("\n=== Success: tsx executed full TypeScript ===");
}

main().catch(console.error);

export { Calculator, TaskRunner, TypedEventBus, loadEnv, validateEmail };

// ============================================================================
// 8. tsx 配置与脚本最佳实践
// ============================================================================

/**
 * package.json 推荐配置:
 *
 * {
 *   "scripts": {
 *     "dev": "tsx watch src/index.ts",
 *     "start": "tsx src/index.ts",
 *     "cli": "tsx scripts/cli.ts",
 *     "migrate": "tsx scripts/migrate.ts",
 *     "typecheck": "tsc --noEmit",
 *     "test": "vitest"
 *   },
 *   "devDependencies": {
 *     "tsx": "^4.7.0",
 *     "typescript": "^5.4.0"
 *   }
 * }
 *
 * tsx 对比其他方案:
 *   - 比 ts-node 快 10-20 倍（esbuild vs tsc）
 *   - 比 nodemon + tsc 快且配置更少
 *   - 比 Node.js strip-types 功能更完整（支持装饰器等）
 *   - 与 jiti 相比启动稍快，但 jiti 兼容性更好
 *
 * 适用场景:
 *   - 开发阶段的快速迭代
 *   - CLI 工具和内部脚本
 *   - 需要完整 TS 特性支持的 Node.js 项目
 *   - 测试文件直接执行
 */
