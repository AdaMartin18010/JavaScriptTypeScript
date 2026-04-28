import Fastify from "fastify";
import { config } from "./config.js";
import { logger } from "./logger.js";
import { EventSubscriber } from "../../../events/src/subscriber.js";
import { EventRetryManager } from "../../../events/src/retry.js";

const fastify = Fastify({ logger, genReqId: () => crypto.randomUUID() });
const subscriber = new EventSubscriber(config.natsUrl);
const retryManager = new EventRetryManager(config.redisUrl);

// 模拟通知发送记录
const notifications: Array<{ id: string; type: string; recipient: string; message: string; sentAt: string }> = [];

fastify.get("/health", async () => ({
  status: "ok",
  service: config.serviceName,
  uptime: process.uptime(),
  timestamp: new Date().toISOString(),
}));

fastify.get("/notifications", async () => ({
  data: notifications,
}));

// 模拟死信队列查看端点
fastify.get("/dlq", async () => {
  const count = await retryManager.dlqLength();
  const events = await retryManager.getDLQEvents(20);
  return { count, events };
});

async function start(): Promise<void> {
  try {
    await subscriber.connect();

    // 订阅 order.created 事件（使用 queue group 实现负载均衡）
    await subscriber.subscribe({
      subject: "order.created",
      queue: "notifications-workers",
      handler: async (payload) => {
        const data = payload as { orderId: string; userId: string; product: string; amount: number };

        // 模拟通知发送（有 10% 概率失败，用于演示重试）
        if (Math.random() < 0.1) {
          const err = new Error("Simulated notification delivery failure");
          await retryManager.scheduleRetry("order.created", payload, err, 0);
          throw err;
        }

        const notification = {
          id: `notif-${Date.now()}`,
          type: "order_confirmation",
          recipient: data.userId,
          message: `Your order for ${data.product} ($${data.amount}) has been received!`,
          sentAt: new Date().toISOString(),
        };
        notifications.push(notification);
        logger.info({ notification }, "Notification sent");
      },
    });

    await fastify.listen({ port: config.port, host: "0.0.0.0" });
    logger.info(`🔔 Notifications Service listening on http://localhost:${config.port}`);
    logger.info("Subscribed to: order.created [queue: notifications-workers]");
  } catch (err) {
    logger.error(err, "Failed to start notifications service");
    process.exit(1);
  }
}

async function shutdown(): Promise<void> {
  await subscriber.close();
  await retryManager.close();
  await fastify.close();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

start();
