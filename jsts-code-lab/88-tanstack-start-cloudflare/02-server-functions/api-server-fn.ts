// @ts-nocheck
/**
 * @file createServerFn 基础示例
 * @description
 * 展示如何在 TanStack Start 中定义 Server Function，并从 context.cloudflare.env 读取环境变量。
 * 在 Cloudflare Workers 运行时中，Server Function 与 SSR 共享同一个 Worker 实例。
 */

import { createServerFn } from '@tanstack/react-start/server';

/**
 * 获取应用元数据的 Server Function
 */
export const getAppMeta = createServerFn({ method: 'GET' }).handler(async () => {
  // 在 Cloudflare Workers 环境中，通过 env 访问 vars 与 secrets
  // 此处为示例，假设已通过 wrangler.jsonc 或 wrangler secret 配置
  const appName = (globalThis as typeof globalThis & { env?: Record<string, string> }).env?.APP_NAME ?? 'Unknown';

  return {
    name: appName,
    timestamp: Date.now(),
    runtime: 'cloudflare-workers',
  };
});

/**
 * 带输入验证的 Server Function
 * 注意：实际生产环境建议使用 Zod / Valibot 进行校验
 */
export const greetUser = createServerFn({ method: 'POST' })
  .validator((data: { name: string }) => {
    if (!data.name || data.name.length < 2) {
      throw new Error('Name must be at least 2 characters');
    }
    return data;
  })
  .handler(async ({ data }) => {
    return {
      message: `Hello, ${data.name}!`,
      generatedAt: new Date().toISOString(),
    };
  });

