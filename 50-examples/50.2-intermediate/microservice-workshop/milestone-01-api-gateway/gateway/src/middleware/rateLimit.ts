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
      // 优先使用认证用户ID，其次使用 IP
      const userId = (req as unknown as { user?: { userId: string } }).user?.userId;
      const key = userId ?? req.ip;
      return key;
    },
    errorResponseBuilder: (req, context) => {
      logger.warn({ ip: req.ip, limit: context.max }, "Rate limit exceeded");
      return {
        statusCode: 429,
        error: "Too Many Requests",
        message: `Rate limit exceeded. Try again in ${context.after}`,
        retryAfter: context.after,
      };
    },
    onExceeded: (req) => {
      logger.warn({ ip: req.ip, url: req.url }, "Rate limit hit");
    },
  });

  logger.info(
    { max: config.rateLimit.max, timeWindow: config.rateLimit.timeWindow },
    "Rate limit configured"
  );
});
