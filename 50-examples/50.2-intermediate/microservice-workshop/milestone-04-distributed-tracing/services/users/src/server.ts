import Fastify from "fastify";
import { config } from "./config.js";
import { logger } from "./logger.js";
import { registerService, deregisterService } from "./register.js";
import { initTracing } from "../../../tracing/src/tracer.js";
import { tracingPlugin } from "../../../tracing/src/middleware.js";

const sdk = initTracing({ serviceName: config.serviceName, otlpEndpoint: config.otlpEndpoint });
const fastify = Fastify({ logger, genReqId: () => crypto.randomUUID() });

const users = new Map<string, { id: string; name: string; email: string; createdAt: string }>([
  ["user-1", { id: "user-1", name: "Alice", email: "alice@example.com", createdAt: new Date().toISOString() }],
  ["user-2", { id: "user-2", name: "Bob", email: "bob@example.com", createdAt: new Date().toISOString() }],
]);

fastify.get("/health", async () => ({
  status: "ok",
  service: config.serviceName,
  uptime: process.uptime(),
  timestamp: new Date().toISOString(),
}));

fastify.get("/", async () => ({
  data: Array.from(users.values()),
}));

fastify.get("/:id", async (request: { params: { id: string } }, reply) => {
  const user = users.get(request.params.id);
  if (!user) {
    return reply.status(404).send({ error: "Not Found", message: `User ${request.params.id} not found` });
  }
  return { data: user };
});

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

fastify.setErrorHandler((error, request, reply) => {
  logger.error({ err: error, url: request.url }, "Service error");
  reply.status(error.statusCode ?? 500).send({
    error: "Internal Server Error",
    message: process.env.NODE_ENV === "production" ? "Something went wrong" : error.message,
  });
});

async function start(): Promise<void> {
  try {
    await fastify.register(tracingPlugin, { serviceName: config.serviceName });
    await registerService();
    await fastify.listen({ port: config.port, host: "0.0.0.0" });
    logger.info(`👤 Users Service listening on http://localhost:${config.port}`);
  } catch (err) {
    logger.error(err, "Failed to start users service");
    process.exit(1);
  }
}

process.on("SIGINT", async () => {
  await deregisterService();
  await sdk.shutdown();
  await fastify.close();
  process.exit(0);
});

start();
