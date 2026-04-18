import Fastify from "fastify";
import { context } from "@opentelemetry/api";
import { config } from "./config.js";
import { logger } from "./logger.js";
import { EventSubscriber } from "../../../events/src/subscriber.js";
import { EventRetryManager } from "../../../events/src/retry.js";
import { initTracing, withSpan } from "../../../tracing/src/tracer.js";
import { tracingPlugin } from "../../../tracing/src/middleware.js";
import { extractTraceContextFromNats, getCurrentTraceId } from "../../../tracing/src/nats.js";

const sdk = initTracing({ serviceName: config.serviceName, otlpEndpoint: config.otlpEndpoint });
const fastify = Fastify({ logger, genReqId: () => crypto.randomUUID() });
const subscriber = new EventSubscriber(config.natsUrl);
const retryManager = new EventRetryManager(config.redisUrl);

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

fastify.get("/dlq", async () => {
  const count = await retryManager.dlqLength();
  const events = await retryManager.getDLQEvents(20);
  return { count, events };
});

async function start(): Promise<void> {
  try {
    await fastify.register(tracingPlugin, { serviceName: config.serviceName });
    await subscriber.connect();

    await subscriber.subscribe({
      subject: "order.created",
      queue: "notifications-workers",
      handler: async (payload, msg) => {
        // 从 NATS 消息中提取 trace context
        const parentContext = extractTraceContextFromNats(msg);
        const data = payload as { orderId: string; userId: string; product: string; amount: number };

        // 在提取的 context 下创建子 span
        await withSpan(
          "process-notification",
          async (span) => {
            span.setAttribute("notification.type", "order_confirmation");
            span.setAttribute("order.id", data.orderId);
            span.setAttribute("user.id", data.userId);

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
            logger.info({ notification, traceId: getCurrentTraceId() }, "Notification sent");
          },
          { parentContext, attributes: { "messaging.system": "nats", "messaging.destination": "order.created" } }
        );
      },
    });

    await fastify.listen({ port: config.port, host: "0.0.0.0" });
    logger.info(`🔔 Notifications Service listening on http://localhost:${config.port}`);
  } catch (err) {
    logger.error(err, "Failed to start notifications service");
    process.exit(1);
  }
}

async function shutdown(): Promise<void> {
  await subscriber.close();
  await retryManager.close();
  await sdk.shutdown();
  await fastify.close();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

start();
