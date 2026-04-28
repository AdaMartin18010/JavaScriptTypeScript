import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { ServiceRegistry } from "../../discovery/src/registry.js";
import { config } from "./config.js";
import { logger } from "./logger.js";
import { requireAuth } from "./middleware/auth.js";
import { injectTraceContext } from "../../tracing/src/nats.js";

interface ProxyParams { "*": string; }

const registry = new ServiceRegistry(config.redisUrl);

async function proxyRequest(
  serviceName: string,
  path: string,
  method: string,
  headers: Record<string, string | undefined>,
  body?: unknown
): Promise<{ statusCode: number; body: unknown; headers: Record<string, string> }> {
  const service = await registry.discover(serviceName);
  if (!service) throw new Error(`Service '${serviceName}' not available`);
  const url = new URL(path, `http://${service.host}:${service.port}`);
  const startTime = performance.now();

  // 注入 trace context 到下游请求
  const traceHeaders = injectTraceContext({
    "Content-Type": "application/json",
    ...(headers.authorization ? { authorization: headers.authorization } : {}),
    "x-request-id": headers["x-request-id"] || crypto.randomUUID(),
  });

  try {
    const response = await fetch(url.toString(), {
      method,
      headers: traceHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });
    const duration = performance.now() - startTime;
    const responseBody = await response.json().catch(() => null);
    logger.info({ service: serviceName, method, path, statusCode: response.status, durationMs: duration.toFixed(2) }, "Proxy request completed");
    return { statusCode: response.status, body: responseBody, headers: Object.fromEntries(response.headers.entries()) };
  } catch (err) {
    logger.error({ err, service: serviceName, method, path }, "Proxy request failed");
    throw new Error(`Service ${serviceName} unavailable`);
  }
}

export async function gatewayRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get("/health", async () => ({ status: "ok", service: "api-gateway", timestamp: new Date().toISOString() }));
  fastify.get("/discovery/services", async () => ({ data: await registry.listServices() }));

  fastify.post("/auth/login", async (request: FastifyRequest<{ Body: { email: string; password: string } }>, reply: FastifyReply) => {
    const { email, password } = request.body;
    if (!email || !password) {
      return reply.status(400).send({ error: "Bad Request", message: "Email and password required" });
    }
    const { generateToken } = await import("./middleware/auth.js");
    const token = generateToken({ userId: `user-${Buffer.from(email).toString("base64url")}`, email, role: "user" });
    logger.info({ email }, "User logged in");
    return { token, type: "Bearer" };
  });

  fastify.get("/users/profile", { onRequest: [requireAuth] }, async (request: FastifyRequest) => ({ user: request.user }));

  fastify.route({
    method: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    url: "/users/*",
    handler: async (request: FastifyRequest<{ Params: ProxyParams }>, reply: FastifyReply) => {
      const path = `/${request.params["*"]}`;
      const result = await proxyRequest("users-service", path, request.method, { authorization: request.headers.authorization, "x-request-id": request.id }, request.body as Record<string, unknown> | undefined);
      return reply.status(result.statusCode).headers(result.headers).send(result.body);
    },
  });

  fastify.route({
    method: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    url: "/orders/*",
    handler: async (request: FastifyRequest<{ Params: ProxyParams }>, reply: FastifyReply) => {
      const path = `/${request.params["*"]}`;
      const result = await proxyRequest("orders-service", path, request.method, { authorization: request.headers.authorization, "x-request-id": request.id }, request.body as Record<string, unknown> | undefined);
      return reply.status(result.statusCode).headers(result.headers).send(result.body);
    },
  });

  fastify.get("/", async () => ({
    service: "api-gateway",
    version: "1.0.0",
    features: ["dynamic-service-discovery", "rate-limit", "jwt-auth", "event-bus", "distributed-tracing"],
    endpoints: ["/health", "/discovery/services", "/auth/login", "/users/*", "/orders/*"],
  }));
}
