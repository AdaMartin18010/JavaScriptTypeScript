/**
 * @file 速率限制中间件
 * @description 基于内存的滑动窗口限流，防止 API 被滥用
 */

import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";

/**
 * 限流配置
 */
interface RateLimitConfig {
  /** 时间窗口大小（毫秒） */
  windowMs: number;
  /** 窗口内最大请求数 */
  maxRequests: number;
}

/**
 * 请求记录
 */
interface RequestRecord {
  timestamps: number[];
}

/**
 * 内存存储（生产环境建议替换为 Redis）
 */
const requestStore = new Map<string, RequestRecord>();

/**
 * 清理过期记录的间隔
 */
const CLEANUP_INTERVAL_MS = 60_000;

// 定时清理过期记录
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of requestStore) {
    record.timestamps = record.timestamps.filter((t) => now - t < CLEANUP_INTERVAL_MS);
    if (record.timestamps.length === 0) {
      requestStore.delete(key);
    }
  }
}, CLEANUP_INTERVAL_MS);

/**
 * 创建限流中间件
 * @param config - 限流配置
 */
export function rateLimit(config?: Partial<RateLimitConfig>) {
  const windowMs = config?.windowMs ?? 60_000; // 默认 1 分钟
  const maxRequests = config?.maxRequests ?? Number(process.env.RATE_LIMIT_PER_MINUTE ?? 60);

  return createMiddleware(async (c, next) => {
    // 使用 IP + 用户 ID（如有）作为限流键
    const ip = c.req.header("x-forwarded-for") ?? c.req.header("x-real-ip") ?? "unknown";
    const userId = c.get("user")?.id ?? "anonymous";
    const key = `${ip}:${userId}`;

    const now = Date.now();
    let record = requestStore.get(key);

    if (!record) {
      record = { timestamps: [] };
      requestStore.set(key, record);
    }

    // 清理窗口外记录
    record.timestamps = record.timestamps.filter((t) => now - t < windowMs);

    // 检查是否超限
    if (record.timestamps.length >= maxRequests) {
      const oldest = record.timestamps[0] ?? now;
      const retryAfter = Math.ceil((oldest + windowMs - now) / 1000);

      throw new HTTPException(429, {
        message: `请求过于频繁，请 ${retryAfter} 秒后重试`,
        res: new Response(
          JSON.stringify({ error: "Rate limit exceeded", retryAfter }),
          {
            status: 429,
            headers: {
              "Content-Type": "application/json",
              "Retry-After": String(retryAfter),
            },
          }
        ),
      });
    }

    // 记录本次请求
    record.timestamps.push(now);

    // 添加响应头
    c.header("X-RateLimit-Limit", String(maxRequests));
    c.header("X-RateLimit-Remaining", String(maxRequests - record.timestamps.length));

    await next();
  });
}
