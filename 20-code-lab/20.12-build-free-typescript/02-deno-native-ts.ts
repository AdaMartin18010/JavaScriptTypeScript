/**
 * 02-deno-native-ts.ts
 * ========================================
 * Deno 原生 TypeScript 执行
 *
 * Deno 将 TypeScript 作为一等公民支持，无需任何配置即可直接运行 .ts 文件。
 * 本文件展示 Deno 特有的模块系统、权限模型、以及原生 TS 开发模式。
 *
 * 运行方式:
 *   deno run --allow-net --allow-read 02-deno-native-ts.ts
 *   deno run --allow-all 02-deno-native-ts.ts  # 开发便利，生产不推荐
 */

// ============================================================================
// 1. URL 导入 — Deno 原生支持的模块解析方式
// ============================================================================

// Deno 支持通过 HTTPS URL 直接导入模块，无需 npm/node_modules
// 在生产代码中应锁定版本号，避免意外更新
import { Hono } from "https://deno.land/x/hono@v3.12.0/mod.ts";

// 同时支持 npm 兼容层，通过 npm: 前缀使用 Node 生态包
// import { z } from "npm:zod@3.22.4";

// ============================================================================
// 2. Deno 内置 API — 原生 TypeScript 类型支持
// ============================================================================

// Deno 的全局命名空间自带完整类型定义
// 无需 @types/node，Deno 的核心 API 本身就是 TS 编写的

interface ServerConfig {
  port: number;
  hostname?: string;
}

function getEnvPort(defaultPort = 8000): number {
  // Deno.env 是类型安全的，有完整的自动补全
  const port = Deno.env.get("PORT");
  return port ? parseInt(port, 10) : defaultPort;
}

// ============================================================================
// 3. 文件系统操作 — 带类型的 Deno API
// ============================================================================

async function readJsonFile<T>(path: string): Promise<T> {
  // Deno.readTextFile 返回 Promise<string>，类型自动推断
  const text = await Deno.readTextFile(path);
  return JSON.parse(text) as T;
}

interface AppConfig {
  name: string;
  version: string;
  features: string[];
}

async function loadConfig(): Promise<AppConfig | null> {
  try {
    // 需要 --allow-read 权限才能执行
    return await readJsonFile<AppConfig>("./config.json");
  } catch {
    console.warn("config.json not found, using defaults");
    return null;
  }
}

// ============================================================================
// 4. 构建轻量 HTTP 服务 — Hono + Deno.serve
// ============================================================================

// 定义路由级别的类型安全请求/响应
interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: number;
}

interface HealthCheck {
  status: "ok" | "degraded" | "down";
  uptime: number;
  denoVersion: string;
}

function createApp() {
  const app = new Hono();
  const startTime = Date.now();

  // 类型安全的中间件：Hono 的 ctx 自带完整类型
  app.use(async (ctx, next) => {
    console.log(`[${ctx.req.method}] ${ctx.req.url}`);
    await next();
  });

  // 健康检查端点 — 返回类型安全的 JSON
  app.get("/health", (ctx) => {
    const response: ApiResponse<HealthCheck> = {
      success: true,
      data: {
        status: "ok",
        uptime: Date.now() - startTime,
        denoVersion: Deno.version.deno,
      },
      timestamp: Date.now(),
    };
    return ctx.json(response);
  });

  // 参数化路由 — 类型安全的路径参数
  app.get("/users/:id", (ctx) => {
    const id = ctx.req.param("id");
    const user = {
      id,
      name: `User ${id}`,
      platform: "deno",
    };
    return ctx.json({ success: true, data: user, timestamp: Date.now() });
  });

  // POST 请求体解析 — 配合 Zod 可实现运行时校验
  app.post("/echo", async (ctx) => {
    const body = await ctx.req.json();
    return ctx.json({
      success: true,
      data: body,
      timestamp: Date.now(),
    });
  });

  return app;
}

// ============================================================================
// 5. Deno 测试运行器 — 原生支持 .ts 测试文件
// ============================================================================

// Deno.test 是内置的测试 API，无需 jest/vitest 等外部依赖
// 在另一个文件中可以写: deno test some.test.ts

function add(a: number, b: number): number {
  return a + b;
}

// 如果直接运行此文件则启动服务器，如果被测试则导出函数
if (import.meta.main) {
  const app = createApp();
  const config: ServerConfig = {
    port: getEnvPort(),
    hostname: "0.0.0.0",
  };

  console.log(`Starting Deno server on port ${config.port}...`);
  console.log(`Deno version: ${Deno.version.deno}`);

  // Deno.serve 是内置的高性能 HTTP 服务器，原生支持 TS 处理函数
  Deno.serve(
    {
      port: config.port,
      hostname: config.hostname,
      // Deno 的 serve 选项自带类型检查
      onError: (err) => {
        console.error("Server error:", err);
        return new Response(JSON.stringify({ error: "Internal error" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      },
    },
    app.fetch
  );

  // 演示文件系统权限的使用（需要 --allow-read）
  loadConfig().then((cfg) => {
    if (cfg) {
      console.log("Loaded config:", cfg.name, cfg.version);
    }
  });
}

// 导出供测试使用
export { add, createApp, type ApiResponse, type HealthCheck };

// ============================================================================
// 6. Deno 工作区配置示例 (deno.json)
// ============================================================================

/**
 * deno.json 替代了 package.json 的部分功能：
 *
 * {
 *   "name": "@myapp/deno-api",
 *   "version": "1.0.0",
 *   "exports": "./mod.ts",
 *   "tasks": {
 *     "dev": "deno run --allow-all --watch 02-deno-native-ts.ts",
 *     "start": "deno run --allow-net --allow-read --allow-env 02-deno-native-ts.ts",
 *     "test": "deno test --allow-all"
 *   },
 *   "imports": {
 *     "hono": "https://deno.land/x/hono@v3.12.0/mod.ts",
 *     "zod": "npm:zod@3.22.4"
 *   },
 *   "compilerOptions": {
 *     "strict": true,
 *     "exactOptionalPropertyTypes": true
 *   }
 * }
 *
 * 优势：
 *   - 无需 node_modules，依赖通过 URL 直接获取并缓存到全局
 *   - deno.lock 提供可复现的依赖锁定
 *   - 原生 TypeScript，零构建配置
 */
