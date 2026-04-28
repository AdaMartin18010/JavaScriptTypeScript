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
    this.redis.on("error", (err) => logger.error({ err }, "Redis connection error"));
    this.redis.on("connect", () => logger.info("Connected to Redis service registry"));
  }

  async register(service: ServiceRegistration): Promise<void> {
    const key = `${REDIS_PREFIX}${service.name}`;
    await this.redis.setex(key, this.ttlSeconds, JSON.stringify(service));
    logger.info({ service: service.name, host: service.host, port: service.port, ttl: this.ttlSeconds }, "Service registered");
  }

  async deregister(serviceName: string): Promise<void> {
    await this.redis.del(`${REDIS_PREFIX}${serviceName}`);
    logger.info({ service: serviceName }, "Service deregistered");
  }

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

  async discover(serviceName: string): Promise<ServiceRegistration | null> {
    const value = await this.redis.get(`${REDIS_PREFIX}${serviceName}`);
    if (!value) {
      logger.warn({ service: serviceName }, "Service not found in registry");
      return null;
    }
    return JSON.parse(value) as ServiceRegistration;
  }

  async listServices(): Promise<ServiceRegistration[]> {
    const keys = await this.redis.keys(`${REDIS_PREFIX}*`);
    if (keys.length === 0) return [];
    const values = await this.redis.mget(...keys);
    return values.filter((v): v is string => v !== null).map((v) => JSON.parse(v) as ServiceRegistration);
  }

  async close(): Promise<void> {
    await this.redis.quit();
  }
}

export const registry = new ServiceRegistry();
