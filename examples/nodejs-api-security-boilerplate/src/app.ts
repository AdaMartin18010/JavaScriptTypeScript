import Fastify from "fastify";
import { loggerConfig } from "./utils/logger.js";
import { securityPlugins } from "./plugins/security.js";
import { authPlugin } from "./plugins/auth.js";
import { usersRoutes } from "./routes/users.js";
import { register } from "prom-client";

const app = Fastify({
  logger: loggerConfig,
  genReqId: () => `req_${Math.random().toString(36).slice(2)}`,
});

// 注册安全插件
await app.register(securityPlugins);

// 注册认证插件
await app.register(authPlugin);

// 健康检查
app.get("/health", async () => {
  return { status: "ok", timestamp: new Date().toISOString() };
});

// Prometheus metrics
app.get("/metrics", async (_req, reply) => {
  reply.header("Content-Type", register.contentType);
  return register.metrics();
});

// 注册业务路由
await app.register(usersRoutes, { prefix: "/users" });

// 全局错误处理
app.setErrorHandler((error, _request, reply) => {
  app.log.error(error);

  if (error.validation) {
    return reply.status(400).send({
      error: "Validation Error",
      message: error.message,
    });
  }

  return reply.status(error.statusCode ?? 500).send({
    error: error.name,
    message:
      process.env.NODE_ENV === "production"
        ? "Internal Server Error"
        : error.message,
  });
});

// 启动服务器
const start = async () => {
  try {
    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
    await app.listen({ port, host: "0.0.0.0" });
    app.log.info(`🚀 Server running on http://0.0.0.0:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();

export { app };
