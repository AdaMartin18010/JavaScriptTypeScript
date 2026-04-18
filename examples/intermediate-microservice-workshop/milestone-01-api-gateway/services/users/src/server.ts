import Fastify from "fastify";
import pino from "pino";
import { config } from "./config.js";

const logger = pino({
  level: config.logLevel,
  transport:
    process.env.NODE_ENV !== "production"
      ? { target: "pino-pretty", options: { colorize: true, translateTime: "SYS:standard", ignore: "pid,hostname" } }
      : undefined,
  base: { service: config.serviceName },
});

const fastify = Fastify({ logger, genReqId: () => crypto.randomUUID() });

// 内存数据存储（教学用）
const users = new Map<string, { id: string; name: string; email: string; createdAt: string }>([
  ["user-1", { id: "user-1", name: "Alice", email: "alice@example.com", createdAt: new Date().toISOString() }],
  ["user-2", { id: "user-2", name: "Bob", email: "bob@example.com", createdAt: new Date().toISOString() }],
]);

// 健康检查
fastify.get("/health", async () => ({
  status: "ok",
  service: config.serviceName,
  uptime: process.uptime(),
  timestamp: new Date().toISOString(),
}));

// 列表用户
fastify.get("/", async () => ({
  data: Array.from(users.values()),
}));

// 获取单个用户
fastify.get("/:id", async (request: { params: { id: string } }, reply) => {
  const user = users.get(request.params.id);
  if (!user) {
    return reply.status(404).send({ error: "Not Found", message: `User ${request.params.id} not found` });
  }
  return { data: user };
});

// 创建用户
fastify.post("/", async (request: { body: { name: string; email: string } }, reply) => {
  const { name, email } = request.body;
  if (!name || !email) {
    return reply.status(400).send({ error: "Bad Request", message: "name and email are required" });
  }

  const id = `user-${Date.now()}`;
  const user = { id, name, email, createdAt: new Date().toISOString() };
  users.set(id, user);

  logger.info({ userId: id }, "User created");
  reply.status(201);
  return { data: user };
});

// 全局错误处理
fastify.setErrorHandler((error, request, reply) => {
  logger.error({ err: error, url: request.url }, "Service error");
  reply.status(error.statusCode ?? 500).send({
    error: "Internal Server Error",
    message: process.env.NODE_ENV === "production" ? "Something went wrong" : error.message,
  });
});

async function start(): Promise<void> {
  try {
    await fastify.listen({ port: config.port, host: "0.0.0.0" });
    logger.info(`👤 Users Service listening on http://localhost:${config.port}`);
  } catch (err) {
    logger.error(err, "Failed to start users service");
    process.exit(1);
  }
}

process.on("SIGINT", async () => {
  await fastify.close();
  process.exit(0);
});

start();
