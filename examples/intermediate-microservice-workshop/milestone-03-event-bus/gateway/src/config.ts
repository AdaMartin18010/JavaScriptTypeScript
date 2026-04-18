import { logger } from "./logger.js";

export interface GatewayConfig {
  port: number;
  jwtSecret: string;
  rateLimit: { max: number; timeWindow: string };
  redisUrl: string;
}

function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key] ?? defaultValue;
  if (value === undefined) {
    logger.error({ key }, "Missing required environment variable");
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const config: GatewayConfig = {
  port: parseInt(getEnv("GATEWAY_PORT", "3000"), 10),
  jwtSecret: getEnv("JWT_SECRET", "dev-secret-key"),
  rateLimit: {
    max: parseInt(getEnv("RATE_LIMIT_MAX", "100"), 10),
    timeWindow: getEnv("RATE_LIMIT_WINDOW", "1 minute"),
  },
  redisUrl: getEnv("REDIS_URL", "redis://localhost:6379"),
};
