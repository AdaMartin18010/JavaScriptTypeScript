import Redis from "ioredis";
import { logger } from "../../gateway/src/logger.js";

export interface DeadLetterEvent {
  originalSubject: string;
  payload: unknown;
  error: string;
  failedAt: string;
  attemptCount: number;
  headers?: Record<string, string>;
}

const DLQ_KEY = "event:dlq";
const RETRY_KEY_PREFIX = "event:retry:";
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAYS_MS = [5000, 15000, 60000]; // 指数退避：5s, 15s, 60s

export class EventRetryManager {
  private redis: Redis;

  constructor(redisUrl?: string) {
    this.redis = new Redis(redisUrl || process.env.REDIS_URL || "redis://localhost:6379");
  }

  /** 记录失败事件到重试队列 */
  async scheduleRetry(
    subject: string,
    payload: unknown,
    error: Error,
    attemptCount: number,
    headers?: Record<string, string>
  ): Promise<boolean> {
    if (attemptCount >= MAX_RETRY_ATTEMPTS) {
      await this.moveToDLQ(subject, payload, error, attemptCount, headers);
      return false;
    }

    const retryEvent = {
      subject,
      payload,
      error: error.message,
      attemptCount,
      headers,
      scheduledAt: new Date().toISOString(),
    };

    const delay = RETRY_DELAYS_MS[attemptCount] || RETRY_DELAYS_MS[RETRY_DELAYS_MS.length - 1];
    const executeAt = Date.now() + delay;

    await this.redis.zadd(`${RETRY_KEY_PREFIX}${subject}`, executeAt, JSON.stringify(retryEvent));
    logger.info(
      { subject, attemptCount, delayMs: delay, executeAt: new Date(executeAt).toISOString() },
      "Event scheduled for retry"
    );
    return true;
  }

  /** 获取到期可重试的事件 */
  async getRetryableEvents(subject: string): Promise<Array<{ score: number; event: unknown }>> {
    const now = Date.now();
    const items = await this.redis.zrangebyscore(`${RETRY_KEY_PREFIX}${subject}`, 0, now, "WITHSCORES");

    const events: Array<{ score: number; event: unknown }> = [];
    for (let i = 0; i < items.length; i += 2) {
      events.push({ score: Number(items[i + 1]), event: JSON.parse(items[i]) });
    }
    return events;
  }

  /** 从重试队列移除 */
  async removeRetryEvent(subject: string, eventJson: string): Promise<void> {
    await this.redis.zrem(`${RETRY_KEY_PREFIX}${subject}`, eventJson);
  }

  /** 移入死信队列 */
  async moveToDLQ(
    subject: string,
    payload: unknown,
    error: Error,
    attemptCount: number,
    headers?: Record<string, string>
  ): Promise<void> {
    const dlqEvent: DeadLetterEvent = {
      originalSubject: subject,
      payload,
      error: error.message,
      failedAt: new Date().toISOString(),
      attemptCount,
      headers,
    };

    await this.redis.lpush(DLQ_KEY, JSON.stringify(dlqEvent));
    logger.warn(
      { subject, attemptCount, error: error.message },
      "Event moved to dead letter queue"
    );
  }

  /** 获取死信队列事件 */
  async getDLQEvents(count = 50): Promise<DeadLetterEvent[]> {
    const items = await this.redis.lrange(DLQ_KEY, 0, count - 1);
    return items.map((item) => JSON.parse(item) as DeadLetterEvent);
  }

  /** 死信队列长度 */
  async dlqLength(): Promise<number> {
    return this.redis.llen(DLQ_KEY);
  }

  async close(): Promise<void> {
    await this.redis.quit();
  }
}

export const retryManager = new EventRetryManager();
