import { verify } from "jose";
import type { MiddlewareHandler } from "hono";
import type { AppEnv } from "../index";

export const authMiddleware: MiddlewareHandler<AppEnv> = async (c, next) => {
  const authHeader = c.req.header("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "Missing or invalid authorization header" }, 401);
  }

  const token = authHeader.slice(7);
  const secret = c.env.JWT_SECRET;

  if (!secret) {
    console.error("JWT_SECRET is not configured");
    return c.json({ error: "Authentication service unavailable" }, 503);
  }

  try {
    const secretKey = new TextEncoder().encode(secret);
    const { payload } = await verify(token, secretKey, {
      algorithms: ["HS256"],
      clockTolerance: 60,
    });

    if (typeof payload.sub !== "string") {
      return c.json({ error: "Invalid token payload" }, 401);
    }

    c.set("userId", payload.sub);
    await next();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid token";
    return c.json({ error: "Unauthorized", detail: message }, 401);
  }
};
