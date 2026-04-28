import type { FastifyInstance, FastifyReply, FastifyRequest, HookHandlerDoneFunction } from "fastify";
import fp from "fastify-plugin";
import jwt from "jsonwebtoken";
import { config } from "../config.js";
import { logger } from "../logger.js";

export interface AuthenticatedRequest extends FastifyRequest {
  user?: { userId: string; email: string; role: string };
}

declare module "fastify" {
  interface FastifyRequest {
    user?: { userId: string; email: string; role: string };
  }
}

export function verifyToken(token: string): { userId: string; email: string; role: string } {
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as { userId: string; email: string; role: string };
    return decoded;
  } catch (err) {
    logger.warn({ err }, "JWT verification failed");
    throw new Error("Invalid or expired token");
  }
}

export function generateToken(payload: { userId: string; email: string; role: string }): string {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: "24h" });
}

export const authMiddleware = fp(async function (fastify: FastifyInstance) {
  fastify.decorate(
    "authenticate",
    async function (request: AuthenticatedRequest, reply: FastifyReply) {
      const authHeader = request.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) {
        reply.status(401).send({ error: "Unauthorized", message: "Missing or invalid Authorization header" });
        return;
      }

      const token = authHeader.slice(7);
      try {
        request.user = verifyToken(token);
      } catch {
        reply.status(401).send({ error: "Unauthorized", message: "Invalid token" });
      }
    }
  );
});

// 兼容 Fastify onRequest hook 的预签路由
export function requireAuth(
  request: FastifyRequest,
  reply: FastifyReply,
  done: HookHandlerDoneFunction
) {
  const authHeader = request.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    reply.status(401).send({ error: "Unauthorized", message: "Missing or invalid Authorization header" });
    return;
  }

  const token = authHeader.slice(7);
  try {
    (request as AuthenticatedRequest).user = verifyToken(token);
    done();
  } catch {
    reply.status(401).send({ error: "Unauthorized", message: "Invalid token" });
  }
}
