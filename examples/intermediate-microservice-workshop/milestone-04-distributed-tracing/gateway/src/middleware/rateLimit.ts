import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import rateLimit from "@fastify/rate-limit";
import { config } from "../config.js";
import { logger } from "../logger.js";

export const rateLimitPlugin = fp(async function (fastify: FastifyInstance) {
  await fastify.register(rateLimit, {
    max: config.rateLimit.max,
    timeWindow: config.rateLimit.timeWindow,
    keyGenerator: (req) => {
      const userId = (req as unknown as { user?: { userId: string } }).user?.userId;
      return userId ?? req.ip;
    },
    errorResponseBuilder: (_req, context) => ({
      statusCode: 429,
      error: "Too Many Requests",
      message: `Rate limit exceeded. Try again in ${context.after}`,
      retryAfter: context.after,
    }),
    onExceeded: (req) => {
      logger.warn({ ip: req.ip, url: req.url }, "Rate limit hit");
    },
  });
  logger.info({ max: config.rateLimit.max, timeWindow: config.rateLimit.timeWindow }, "Rate limit configured");
});
