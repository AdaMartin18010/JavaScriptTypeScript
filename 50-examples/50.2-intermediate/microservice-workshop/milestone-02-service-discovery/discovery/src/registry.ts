import Redis from "ioredis";
import { logger } from "../../gateway/src/logger.js";

export interface ServiceRegistration {
  name: string;
  host: string;
  port: number;
  healthCheckEndpoint: string;
  registeredAt: string;
  lastHeartbeat: string;
  metadata?: Record<string, string>;
}

const REDIS_PREFIX = "service:";
const DEFAULT_TTL_SECONDS = 30;

export class ServiceRegistry {
  private redis: Redis;
  private ttlSeconds: number;

  constructor(redisUrl?: string, ttlSeconds = DEFAULT_TTL_SECONDS) {
    this.redis = new Redis(redisUrl || process.env.REDIS_URL || "redis://localhost:6379");
    this.ttlSeconds = ttlSeconds;

    this.redis.on("error", (err) => {
      logger.error({ err }, "Redis connection error");
    });

    this.redis.on("connect", () => {
      logger.info("Connected to Redis service registry");
    });
  }

  /** 注册服务（带 TTL，需要心跳续期） */
  async register(service: ServiceRegistration): Promise<void> {
    const key = `${REDIS_PREFIX}${service.name}`;
    const value = JSON.stringify(service);

    await this.redis.setex(key, this.ttlSeconds, value);
    logger.info(
      { service: service.name, host: service.host, port: service.port, ttl: this.ttlSeconds },
      "Service registered"
    );
  }

  /** 注销服务 */
  async deregister(serviceName: string): Promise<void> {
    const key = `${REDIS_PREFIX}${serviceName}`;
    await this.redis.del(key);
    logger.info({ service: serviceName }, "Service deregistered");
  }

  /** 心跳续期 */
  async heartbeat(serviceName: string): Promise<void> {
    const key = `${REDIS_PREFIX}${serviceName}`;
    const exists = await this.redis.exists(key);
    if (!exists) {
      logger.warn({ service: serviceName }, "Heartbeat failed: service not registered");
      throw new Error(`Service ${serviceName} not registered`);
    }

    await this.redis.expire(key, this.ttlSeconds);
    logger.debug({ service: serviceName }, "Heartbeat refreshed");
  }

  /** 发现服务 */
  async discover(serviceName: string): Promise<ServiceRegistration | null> {
    const key = `${REDIS_PREFIX}${serviceName}`;
    const value = await this.redis.get(key);
    if (!value) {
      logger.warn({ service: serviceName }, "Service not found in registry");
      return null;
    }
    return JSON.parse(value) as ServiceRegistration;
  }

  /** 列出所有活跃服务 */
  async listServices(): Promise<ServiceRegistration[]> {
    const keys = await this.redis.keys(`${REDIS_PREFIX}*`);
    if (keys.length === 0) return [];

    const values = await this.redis.mget(...keys);
    return values
      .filter((v): v is string => v !== null)
      .map((v) => JSON.parse(v) as ServiceRegistration);
  }

  /** 关闭连接 */
  async close(): Promise<void> {
    await this.redis.quit();
  }
}

// 单例实例（教学用）
export const registry = new ServiceRegistry();
