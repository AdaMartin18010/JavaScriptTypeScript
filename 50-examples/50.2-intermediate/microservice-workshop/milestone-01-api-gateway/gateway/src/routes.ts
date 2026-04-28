import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { config } from "./config.js";
import { logger } from "./logger.js";
import { requireAuth } from "./middleware/auth.js";

interface ProxyParams {
  "*": string;
}

async function proxyRequest(
  serviceName: string,
  path: string,
  method: string,
  headers: Record<string, string | undefined>,
  body?: unknown
): Promise<{ statusCode: number; body: unknown; headers: Record<string, string> }> {
  const service = config.downstreamServices[serviceName];
  if (!service) {
    throw new Error(`Unknown service: ${serviceName}`);
  }

  const url = new URL(path, `http://${service.host}:${service.port}`);
  const startTime = performance.now();

  try {
    const response = await fetch(url.toString(), {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(headers.authorization ? { authorization: headers.authorization } : {}),
        "x-request-id": headers["x-request-id"] || crypto.randomUUID(),
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const duration = performance.now() - startTime;
    const responseBody = await response.json().catch(() => null);

    logger.info(
      {
        service: serviceName,
        method,
        path,
        statusCode: response.status,
        durationMs: duration.toFixed(2),
      },
      "Proxy request completed"
    );

    return {
      statusCode: response.status,
      body: responseBody,
      headers: Object.fromEntries(response.headers.entries()),
    };
  } catch (err) {
    logger.error({ err, service: serviceName, method, path }, "Proxy request failed");
    throw new Error(`Service ${serviceName} unavailable`);
  }
}

export async function gatewayRoutes(fastify: FastifyInstance): Promise<void> {
  // 健康检查
  fastify.get("/health", async () => ({
    status: "ok",
    service: "api-gateway",
    timestamp: new Date().toISOString(),
  }));

  // 公开路由：登录获取 JWT（教学用简化版）
  fastify.post(
    "/auth/login",
    async (
      request: FastifyRequest<{ Body: { email: string; password: string } }>,
      reply: FastifyReply
    ) => {
      const { email, password } = request.body;

      // 教学用：任何密码都通过（实际应查询数据库）
      if (!email || !password) {
        return reply.status(400).send({ error: "Bad Request", message: "Email and password required" });
      }

      const { generateToken } = await import("./middleware/auth.js");
      const token = generateToken({
        userId: `user-${Buffer.from(email).toString("base64url")}`,
        email,
        role: "user",
      });

      logger.info({ email }, "User logged in");
      return { token, type: "Bearer" };
    }
  );

  // 受保护路由示例
  fastify.get("/users/profile", { onRequest: [requireAuth] }, async (request: FastifyRequest, reply) => {
    return { user: request.user };
  });

  // 代理 /users/* 到 users-service
  fastify.route({
    method: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    url: "/users/*",
    handler: async (
      request: FastifyRequest<{ Params: ProxyParams }>,
      reply: FastifyReply
    ) => {
      const path = `/${request.params["*"]}`;
      const result = await proxyRequest("users", path, request.method, {
        authorization: request.headers.authorization,
        "x-request-id": request.id,
      }, request.body as Record<string, unknown> | undefined);

      return reply.status(result.statusCode).headers(result.headers).send(result.body);
    },
  });

  // 代理 /orders/* 到 orders-service
  fastify.route({
    method: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    url: "/orders/*",
    handler: async (
      request: FastifyRequest<{ Params: ProxyParams }>,
      reply: FastifyReply
    ) => {
      const path = `/${request.params["*"]}`;
      const result = await proxyRequest("orders", path, request.method, {
        authorization: request.headers.authorization,
        "x-request-id": request.id,
      }, request.body as Record<string, unknown> | undefined);

      return reply.status(result.statusCode).headers(result.headers).send(result.body);
    },
  });

  // 根路径
  fastify.get("/", async () => ({
    service: "api-gateway",
    version: "1.0.0",
    endpoints: ["/health", "/auth/login", "/users/*", "/orders/*"],
  }));
}
