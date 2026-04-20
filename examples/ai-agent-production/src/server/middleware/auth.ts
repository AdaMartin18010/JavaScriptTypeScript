/**
 * @file better-auth 认证中间件
 * @description Hono 中间件：验证用户身份、解析 Session、注入用户信息
 */

import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { auth } from "../../lib/auth.js";
import type { User } from "better-auth";

/**
 * Hono Context 扩展类型
 */
declare module "hono" {
  interface ContextVariableMap {
    user: User | null;
    session: { id: string; userId: string } | null;
  }
}

/**
 * 认证中间件
 * 从请求 Cookie/Header 中解析 Session，将用户信息注入 Context
 */
export const authMiddleware = createMiddleware(async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    c.set("user", null);
    c.set("session", null);
  } else {
    c.set("user", session.user);
    c.set("session", { id: session.session.id, userId: session.session.userId });
  }

  await next();
});

/**
 * 要求登录中间件
 * 若用户未登录，返回 401 Unauthorized
 */
export const requireAuth = createMiddleware(async (c, next) => {
  const user = c.get("user");
  if (!user) {
    throw new HTTPException(401, { message: "请先登录以访问此资源" });
  }
  await next();
});

/**
 * 要求特定角色中间件
 * @param allowedRoles - 允许访问的角色列表
 */
export function requireRole(...allowedRoles: string[]) {
  return createMiddleware(async (c, next) => {
    const user = c.get("user");
    if (!user) {
      throw new HTTPException(401, { message: "请先登录" });
    }

    const role = (user as unknown as Record<string, string>).role ?? "viewer";
    if (!allowedRoles.includes(role)) {
      throw new HTTPException(403, { message: `权限不足，需要角色: ${allowedRoles.join(", ")}` });
    }

    await next();
  });
}
