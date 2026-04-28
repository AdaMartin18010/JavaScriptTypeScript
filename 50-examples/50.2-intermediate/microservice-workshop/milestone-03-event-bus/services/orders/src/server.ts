import Fastify from "fastify";
import { config } from "./config.js";
import { logger } from "./logger.js";
import { registerService, deregisterService } from "./register.js";
import { EventPublisher } from "../../../events/src/publisher.js";

const fastify = Fastify({ logger, genReqId: () => crypto.randomUUID() });
const publisher = new EventPublisher(config.natsUrl);

const orders = new Map<string, { id: string; userId: string; product: string; amount: number; status: string; createdAt: string }>([
  ["order-1", { id: "order-1", userId: "user-1", product: "TypeScript Handbook", amount: 29.99, status: "completed", createdAt: new Date().toISOString() }],
]);

fastify.get("/health", async () => ({
  status: "ok",
  service: config.serviceName,
  uptime: process.uptime(),
  timestamp: new Date().toISOString(),
}));

fastify.get("/", async () => ({
  data: Array.from(orders.values()),
}));

fastify.get("/:id", async (request: { params: { id: string } }, reply) => {
  const order = orders.get(request.params.id);
  if (!order) {
    return reply.status(404).send({ error: "Not Found", message: `Order ${request.params.id} not found` });
  }
  return { data: order };
});

fastify.post("/", async (request: { body: { userId: string; product: string; amount: number } }, reply) => {
  const { userId, product, amount } = request.body;
  if (!userId || !product || typeof amount !== "number") {
    return reply.status(400).send({ error: "Bad Request", message: "userId, product, and amount are required" });
  }

  const id = `order-${Date.now()}`;
  const order = { id, userId, product, amount, status: "pending", createdAt: new Date().toISOString() };
  orders.set(id, order);

  logger.info({ orderId: id, userId }, "Order created");

  // 发布 order.created 事件
  try {
    await publisher.publish({
      subject: "order.created",
      payload: { orderId: id, userId, product, amount, createdAt: order.createdAt },
    });
  } catch (err) {
    logger.error({ err, orderId: id }, "Failed to publish order.created event");
    // 生产环境：事件应进入 Outbox 表，由后台进程可靠发送
  }

  reply.status(201);
  return { data: order };
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
    await publisher.connect();
    await registerService();
    await fastify.listen({ port: config.port, host: "0.0.0.0" });
    logger.info(`📦 Orders Service listening on http://localhost:${config.port}`);
  } catch (err) {
    logger.error(err, "Failed to start orders service");
    process.exit(1);
  }
}

process.on("SIGINT", async () => {
  await deregisterService();
  await publisher.close();
  await fastify.close();
  process.exit(0);
});

start();
