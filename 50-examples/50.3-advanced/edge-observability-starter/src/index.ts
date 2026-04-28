import { Hono } from "hono";
import { sentryMiddleware } from "./middleware/sentry";
import { loggerMiddleware } from "./middleware/logger";
import { authMiddleware } from "./middleware/auth";
import { traceMiddleware } from "./middleware/trace";
import type { Env } from "hono";

export interface AppEnv extends Env {
  Bindings: {
    JWT_SECRET: string;
    SENTRY_DSN?: string;
    ENVIRONMENT?: string;
  };
  Variables: {
    requestId: string;
    traceId: string;
    userId?: string;
  };
}

const app = new Hono<AppEnv>();

// 全局中间件链（顺序很重要）
app.use(traceMiddleware);
app.use(loggerMiddleware);
app.use(sentryMiddleware);

// 健康检查
app.get("/", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    requestId: c.get("requestId"),
    traceId: c.get("traceId"),
  });
});

// 边缘缓存示例
app.get("/api/cache-demo", async (c) => {
  const cacheKey = new Request(c.req.url);
  const cache = caches.default;

  let response = await cache.match(cacheKey);
  if (response) {
    return c.json({ cached: true, data: await response.json() });
  }

  const data = {
    message: "Fresh data",
    generatedAt: new Date().toISOString(),
  };

  response = new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=60",
    },
  });

  c.executionCtx.waitUntil(cache.put(cacheKey, response.clone()));
  return c.json(data);
});

// 受保护的路由
app.use("/api/protected/*", authMiddleware);
app.get("/api/protected/profile", (c) => {
  return c.json({
    userId: c.get("userId"),
    message: "This is protected data",
    requestId: c.get("requestId"),
  });
});

// 全局错误处理
app.onError((err, c) => {
  console.error(`[Error] ${c.get("requestId")}:`, err);
  return c.json(
    {
      error: "Internal Server Error",
      requestId: c.get("requestId"),
    },
    500
  );
});

export default app;
