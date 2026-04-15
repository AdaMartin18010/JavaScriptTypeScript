/**
 * @file D1 数据库查询示例
 * @description
 * 演示在 TanStack Start 的 Server Function 中通过 `env.DB` 访问 Cloudflare D1。
 * 涵盖 prepare/first/all/run 等常用 API。
 */

import { createServerFn } from '@tanstack/react-start/server';
import { env } from 'cloudflare:workers';

export interface UserRow {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

/**
 * 查询用户列表（使用 prepare + all）
 */
export const listUsers = createServerFn({ method: 'GET' }).handler(async () => {
  const { results } = await env.DB.prepare('SELECT id, name, email, created_at FROM users ORDER BY created_at DESC LIMIT 50').all<UserRow>();

  return { users: results };
});

/**
 * 根据 ID 查询单个用户（使用 prepare + first）
 */
export const getUserById = createServerFn({ method: 'GET' })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    const row = await env.DB.prepare('SELECT id, name, email, created_at FROM users WHERE id = ?').bind(id).first<UserRow>();

    if (!row) {
      throw new Error(`User not found: ${id}`);
    }

    return { user: row };
  });

/**
 * 创建用户（使用 prepare + run）
 */
export const createUser = createServerFn({ method: 'POST' })
  .validator((data: { name: string; email: string }) => data)
  .handler(async ({ data }) => {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const result = await env.DB.prepare('INSERT INTO users (id, name, email, created_at) VALUES (?, ?, ?, ?)')
      .bind(id, data.name, data.email, now)
      .run();

    return {
      success: result.success,
      meta: result.meta,
      user: { id, name: data.name, email: data.email, created_at: now },
    };
  });
