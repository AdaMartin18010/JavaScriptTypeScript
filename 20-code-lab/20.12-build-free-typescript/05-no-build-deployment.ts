/**
 * 05-no-build-deployment.ts
 * ========================================
 * 无构建部署到 Deno Deploy、Bun 运行时、Node 23+
 *
 * 本文件演示如何将 TypeScript 代码直接部署到各类平台，
 * 无需 webpack、esbuild 或 tsc 构建步骤。
 *
 * 适用平台:
 *   - Deno Deploy: 原生支持 TS，git push 即部署
 *   - Bun 运行时: bun run 直接执行 TS，Docker 化部署
 *   - Node.js 23+: --experimental-strip-types 容器化运行
 *   - Cloudflare Workers: Wrangler 自动处理 TS 转译
 */

// ============================================================================
// 1. 平台无关的 Web 框架 — Hono（全运行时兼容）
// ============================================================================

// Hono 是一个轻量、快速、多运行时兼容的 Web 框架
// 支持 Deno、Bun、Node.js、Cloudflare Workers、AWS Lambda 等
// 这里使用条件导入以兼容不同平台

// 类型定义 — 所有运行时都能理解这些纯类型信息
interface AppContext {
  runtime: "deno" | "bun" | "node" | "cloudflare";
  version: string;
  region?: string;
}

interface ApiHealth {
  status: "healthy" | "degraded" | "down";
  uptime: number;
  memory: {
    used: number;
    total: number;
  };
  timestamp: string;
}

// ============================================================================
// 2. 运行时检测与适配 — 关键的多平台兼容层
// ============================================================================

function detectRuntime(): AppContext["runtime"] {
  // @ts-ignore - Deno 全局变量仅在 Deno 运行时存在
  if (typeof Deno !== "undefined") return "deno";
  // @ts-ignore - Bun 全局变量仅在 Bun 运行时存在
  if (typeof Bun !== "undefined") return "bun";
  // Cloudflare Workers 环境
  // @ts-ignore
  if (typeof WebSocketPair !== "undefined") return "cloudflare";
  return "node";
}

function getRuntimeVersion(runtime: AppContext["runtime"]): string {
  switch (runtime) {
    // @ts-ignore
    case "deno": return Deno.version.deno;
    // @ts-ignore
    case "bun": return Bun.version;
    case "node": return process.version;
    default: return "unknown";
  }
}

function getMemoryUsage(): { used: number; total: number } {
  const runtime = detectRuntime();

  switch (runtime) {
    case "node":
    case "bun": {
      const usage = process.memoryUsage();
      return {
        used: Math.round(usage.heapUsed / 1024 / 1024),
        total: Math.round(usage.heapTotal / 1024 / 1024),
      };
    }
    case "deno": {
      // @ts-ignore
      const mem = Deno.memoryUsage();
      return {
        used: Math.round(mem.heapUsed / 1024 / 1024),
        total: Math.round(mem.heapTotal / 1024 / 1024),
      };
    }
    default:
      return { used: 0, total: 0 };
  }
}

// ============================================================================
// 3. 请求处理器 — 纯 TypeScript，无框架依赖
// ============================================================================

class EdgeRouter {
  private routes = new Map<string, (req: Request) => Promise<Response> | Response>();

  get(path: string, handler: (req: Request) => Promise<Response> | Response): void {
    this.routes.set(`GET:${path}`, handler);
  }

  post(path: string, handler: (req: Request) => Promise<Response> | Response): void {
    this.routes.set(`POST:${path}`, handler);
  }

  async handle(req: Request): Promise<Response> {
    const key = `${req.method}:${new URL(req.url).pathname}`;
    const handler = this.routes.get(key);

    if (!handler) {
      return new Response(JSON.stringify({ error: "Not Found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      return await handler(req);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return new Response(JSON.stringify({ error: message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }
}

// ============================================================================
// 4. 业务逻辑 — 类型安全的路由实现
// ============================================================================

const startTime = Date.now();
const router = new EdgeRouter();

// 健康检查端点 — 所有平台通用
router.get("/health", () => {
  const health: ApiHealth = {
    status: "healthy",
    uptime: Date.now() - startTime,
    memory: getMemoryUsage(),
    timestamp: new Date().toISOString(),
  };

  return new Response(JSON.stringify(health), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
    },
  });
});

// 运行时信息端点
router.get("/info", () => {
  const runtime = detectRuntime();
  const info: AppContext = {
    runtime,
    version: getRuntimeVersion(runtime),
    region: process.env.REGION ?? "unknown",
  };

  return Response.json(info);
});

// Echo 端点 — 演示 POST + JSON body
router.post("/echo", async (req) => {
  const body = await req.json();
  return Response.json({
    received: body,
    runtime: detectRuntime(),
    timestamp: Date.now(),
  });
});

// ============================================================================
// 5. 各平台启动适配器
// ============================================================================

async function startNodeServer(): Promise<void> {
  const { createServer } = await import("node:http");
  const port = parseInt(process.env.PORT ?? "3000", 10);

  createServer(async (req, res) => {
    // 将 Node.js 的 IncomingMessage 转换为标准 Request
    const url = `http://${req.headers.host}${req.url}`;
    const body = req.method !== "GET" && req.method !== "HEAD"
      ? await new Promise<Buffer>((resolve) => {
          const chunks: Buffer[] = [];
          req.on("data", (c) => chunks.push(c));
          req.on("end", () => resolve(Buffer.concat(chunks)));
        })
      : undefined;

    const request = new Request(url, {
      method: req.method,
      headers: new Headers(Object.entries(req.headers).map(([k, v]) => [k, String(v)])),
      body: body?.length ? body : undefined,
    });

    const response = await router.handle(request);
    res.statusCode = response.status;
    response.headers.forEach((v, k) => res.setHeader(k, v));
    res.end(await response.text());
  }).listen(port, () => {
    console.log(`Node.js server listening on port ${port}`);
  });
}

function startBunServer(): void {
  // @ts-ignore - Bun 特有的全局变量
  Bun.serve({
    port: Number(process.env.PORT ?? 3000),
    fetch: (req) => router.handle(req),
  });
  console.log("Bun server started");
}

function startDenoServer(): void {
  // @ts-ignore - Deno 特有的全局变量
  Deno.serve(
    { port: Number(Deno.env.get("PORT") ?? 3000) },
    (req) => router.handle(req)
  );
  console.log("Deno server started");
}

// Cloudflare Workers 默认导出 fetch 处理器
function cloudflareFetch(request: Request): Promise<Response> {
  return router.handle(request);
}

// ============================================================================
// 6. 主入口 — 自动检测运行时并启动对应服务器
// ============================================================================

const runtime = detectRuntime();
console.log(`Detected runtime: ${runtime}`);

// 仅在实际运行服务器时执行（非测试/导入场景）
if (import.meta.main || (typeof process !== "undefined" && process.argv[1]?.includes("05-no-build-deployment"))) {
  switch (runtime) {
    case "node":
      startNodeServer();
      break;
    case "bun":
      startBunServer();
      break;
    case "deno":
      startDenoServer();
      break;
    default:
      console.log("Exporting fetch handler for Cloudflare Workers / Edge runtime");
  }
}

// 导出供 Cloudflare Workers 和测试使用
export { router, cloudflareFetch as fetch, detectRuntime, type ApiHealth, type AppContext };

// ============================================================================
// 7. 部署配置参考
// ============================================================================

/**
 * === Deno Deploy ===
 * 1. 推送代码到 GitHub
 * 2. 在 deno.com/deploy 中关联仓库
 * 3. 入口文件设为 05-no-build-deployment.ts
 * 4. 自动部署，无需构建步骤
 *
 * === Bun + Docker ===
 * Dockerfile:
 *   FROM oven/bun:1 AS base
 *   WORKDIR /app
 *   COPY package.json bun.lockb ./
 *   RUN bun install --production
 *   COPY . .
 *   EXPOSE 3000
 *   CMD ["bun", "run", "05-no-build-deployment.ts"]
 *
 * === Node.js 23+ + Docker ===
 * Dockerfile:
 *   FROM node:23-alpine
 *   WORKDIR /app
 *   COPY package.json ./
 *   RUN npm install --production
 *   COPY . .
 *   EXPOSE 3000
 *   CMD ["node", "--experimental-strip-types", "05-no-build-deployment.ts"]
 *
 * === Cloudflare Workers (Wrangler) ===
 * wrangler.toml:
 *   name = "my-edge-api"
 *   main = "05-no-build-deployment.ts"
 *   compatibility_date = "2026-01-01"
 *
 * 部署:
 *   npx wrangler deploy
 *
 * === 平台对比 ===
 * | 平台           | 构建步骤 | TS 支持   | 冷启动 | 适用场景       |
 * |----------------|---------|----------|--------|---------------|
 * | Deno Deploy    | 无       | 原生      | <10ms  | 边缘 API       |
 * | Bun 运行时      | 无       | 原生      | <20ms  | 高性能服务     |
 * | Node 23+       | 无       | 剥离      | <80ms  | 稳定生产       |
 * | Cloudflare     | Wrangler | 自动转译  | <5ms   | 全球边缘       |
 */
