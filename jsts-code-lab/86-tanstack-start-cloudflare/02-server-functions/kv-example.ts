/**
 * @file KV 读写示例
 * @description
 * 演示在 TanStack Start 的 Server Function 中通过 `env.CACHE` 访问 Cloudflare KV。
 */

import { createServerFn } from '@tanstack/react-start/server';
import { env } from 'cloudflare:workers';

export interface CacheEntry {
  value: string;
  metadata?: Record<string, string>;
}

/**
 * 读取 KV 值
 */
export const getKVValue = createServerFn({ method: 'GET' })
  .validator((key: string) => key)
  .handler(async ({ data: key }) => {
    const value = await env.CACHE.get(key);
    const metadata = await env.CACHE.getWithMetadata<Record<string, string>>(key);

    return {
      key,
      value,
      metadata: metadata?.metadata ?? null,
    };
  });

/**
 * 写入 KV 值（支持可选 TTL）
 */
export const setKVValue = createServerFn({ method: 'POST' })
  .validator((data: { key: string; value: string; ttlSeconds?: number; metadata?: Record<string, string> }) => data)
  .handler(async ({ data }) => {
    await env.CACHE.put(data.key, data.value, {
      expirationTtl: data.ttlSeconds,
      metadata: data.metadata,
    });

    return {
      success: true,
      key: data.key,
      ttl: data.ttlSeconds ?? null,
    };
  });

/**
 * 删除 KV 值
 */
export const deleteKVValue = createServerFn({ method: 'POST' })
  .validator((key: string) => key)
  .handler(async ({ data: key }) => {
    await env.CACHE.delete(key);
    return { success: true, key };
  });
