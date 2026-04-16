// @ts-nocheck
/**
 * @file better-auth + Cloudflare D1 集成配置
 * @description
 * 展示如何在 Cloudflare Workers 环境中将 better-auth 配置为使用 sqlite 驱动连接 D1。
 * 注意：实际项目中需根据 better-auth 版本调整 API。
 */

import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { drizzle } from 'drizzle-orm/d1';
import { env } from 'cloudflare:workers';
import * as schema from './drizzle-schema.js';

/**
 * 创建 better-auth 实例
 * 在 Cloudflare Workers 中，每次请求应使用同一个 D1 绑定 `env.DB`。
 */
export function createAuth() {
  const db = drizzle(env.DB, { schema });

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: 'sqlite',
    }),
    secret: env.AUTH_SECRET,
    socialProviders: {
      github: {
        clientId: env.GITHUB_CLIENT_ID ?? '',
        clientSecret: env.GITHUB_CLIENT_SECRET ?? '',
      },
    },
    advanced: {
      // Cloudflare Workers 使用 Web Crypto API，无需额外配置
      generateId: false,
    },
  });
}

/**
 * Auth 实例类型导出
 */
export type AuthInstance = ReturnType<typeof createAuth>;

