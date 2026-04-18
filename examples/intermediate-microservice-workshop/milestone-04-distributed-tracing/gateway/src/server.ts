import Fastify from "fastify";
import { config } from "./config.js";
import { logger } from "./logger.js";
import { authMiddleware } from "./middleware/auth.js";
import { rateLimitPlugin } from "./middleware/rateLimit.js";
import { gatewayRoutes } from "./routes.js";
import { healthChecker } from "../../discovery/src/healthCheck.js";
import { initTracing } from "../../tracing/src/tracer.js";
import { tracingPlugin } from "../../tracing/src/middleware.js";

// 初始化分布式追踪
const sdk = initTracing({ serviceName: "api-gateway", otlpEndpoint: config.otlpEndpoint });

const fastify = Fastify({ logger, genReqId: () => crypto.randomUUID(), requestTimeout: 30000 });

fastify.setErrorHandler((error, request, reply) => {
  logger.error({ err: error, reqId: request.id, url: request.url, method: request.method }, "Unhandled error");
  const statusCode = error.statusCode ?? 500;
  const message = statusCode >= 500 ? "Internal Server Error" : error.message;
  reply.status(statusCode).send({ error: error.name || "Error", message, requestId: request.id, ...(process.env.NODE_ENV !== "production" && { stack: error.stack }) });
});

fastify.setNotFoundHandler((request, reply) => {
  logger.warn({ url: request.url, method: request.method }, "Route not found");
  reply.status(404).send({ error: "Not Found", message: `Route ${request.method} ${request.url} not found`, requestId: request.id });
});

async function start(): Promise<void> {
  await fastify.register(tracingPlugin, { serviceName: "api-gateway" });
  await fastify.register(rateLimitPlugin);
  await fastify.register(authMiddleware);
  await fastify.register(gatewayRoutes);
  healthChecker.start();

  try {
    await fastify.listen({ port: config.port, host: "0.0.0.0" });
    logger.info(`🚀 API Gateway listening on http://localhost:${config.port}`);
    logger.info(`🔍 Tracing enabled. Jaeger UI: http://localhost:16686`);
  } catch (err) {
    logger.error(err, "Failed to start gateway");
    process.exit(1);
  }
}

async function shutdown(signal: string): Promise<void> {
  logger.info({ signal }, "Shutting down gracefully...");
  healthChecker.stop();
  await fastify.close();
  await sdk.shutdown();
  process.exit(0);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

start();
