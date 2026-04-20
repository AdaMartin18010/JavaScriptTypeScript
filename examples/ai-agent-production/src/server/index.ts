/**
 * @file Hono 应用入口
 * @description 组装路由、中间件与全局错误处理
 */

import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";

import { authMiddleware } from "./middleware/auth.js";
import { rateLimit } from "./middleware/rate-limit.js";

import agentsRoutes from "./routes/agents.js";
import workflowsRoutes from "./routes/workflows.js";
import mcpRoutes from "./routes/mcp.js";

/**
 * 创建 Hono 应用实例
 */
const app = new Hono();

/**
 * 全局中间件
 */
app.use(logger());
app.use(cors({
  origin: process.env.NODE_ENV === "production" ? ["https://your-domain.com"] : "*",
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
}));
app.use(rateLimit({ windowMs: 60_000, maxRequests: 120 }));
app.use(authMiddleware);

/**
 * 健康检查
 */
app.get("/health", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

/**
 * API 路由挂载
 */
app.route("/api/agents", agentsRoutes);
app.route("/api/workflows", workflowsRoutes);
app.route("/api/mcp", mcpRoutes);

/**
 * 全局错误处理
 */
app.onError((err, c) => {
  console.error("[Error]", err);

  if (err instanceof HTTPException) {
    return c.json(
      {
        success: false,
        error: err.message,
        status: err.status,
      },
      err.status
    );
  }

  return c.json(
    {
      success: false,
      error: process.env.NODE_ENV === "production" ? "服务器内部错误" : err.message,
    },
    500
  );
});

/**
 * 404 处理
 */
app.notFound((c) => {
  return c.json({ success: false, error: "接口不存在" }, 404);
});

/**
 * 启动服务器（Node.js 环境）
 */
const port = Number(process.env.PORT ?? 3000);

if (import.meta.url.startsWith("file://") && process.argv[1] && import.meta.url.includes(process.argv[1].replace(/\\/g, "/"))) {
  // Node.js 环境下使用 @hono/node-server 启动
  const { serve } = await import("@hono/node-server");
  serve({ fetch: app.fetch, port });
  console.log(`🚀 Server running at http://localhost:${port}`);
}

export default app;
