import type { FastifyInstance } from "fastify";
import { requireAuth } from "../plugins/auth.js";
import { validate, userIdParamSchema } from "../utils/validator.js";

// 内存存储（生产环境应使用数据库）
const users = new Map<string, { id: string; email: string; name?: string }>();

export async function usersRoutes(app: FastifyInstance) {
  // 获取当前用户信息
  app.get("/me", { preHandler: requireAuth }, async (request) => {
    return { user: request.user };
  });

  // 用户列表（仅示例，实际应分页）
  app.get("/", { preHandler: requireAuth }, async () => {
    return {
      users: Array.from(users.values()).map((u) => ({
        id: u.id,
        email: u.email,
        name: u.name,
      })),
    };
  });

  // 用户详情
  app.get("/:id", { preHandler: requireAuth }, async (request, reply) => {
    const params = validate(userIdParamSchema, request.params);
    const user = users.get(params.id);

    if (!user) {
      return reply.status(404).send({ error: "User not found" });
    }

    return { user };
  });
}
