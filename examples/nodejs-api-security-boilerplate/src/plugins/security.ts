import fp from "fastify-plugin";
import helmet from "@fastify/helmet";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import csrfProtection from "@fastify/csrf-protection";
import type { FastifyInstance } from "fastify";
import { collectDefaultMetrics, register } from "prom-client";

// 初始化默认 Prometheus 指标
collectDefaultMetrics({ register });

export const securityPlugins = fp(async (app: FastifyInstance) => {
  // Helmet: 安全响应头
  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  });

  // CORS: 严格的跨域控制
  await app.register(cors, {
    origin: process.env.CORS_ORIGIN?.split(",") ?? ["http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
  });

  // Rate Limit: 请求限流
  await app.register(rateLimit, {
    max: 100,
    timeWindow: "1 minute",
    keyGenerator: (req) =>
      req.headers["x-forwarded-for"]?.toString() ?? req.ip,
    errorResponseBuilder: (_req, context) => ({
      error: "Too Many Requests",
      retryAfter: context.after,
    }),
  });

  // 对登录相关接口应用更严格的限流
  await app.register(rateLimit, {
    max: 10,
    timeWindow: "1 minute",
    prefix: "/auth/",
  });

  // CSRF 防护
  await app.register(csrfProtection, {
    cookieOpts: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    },
    sessionPlugin: "@fastify/cookie",
  });
});
