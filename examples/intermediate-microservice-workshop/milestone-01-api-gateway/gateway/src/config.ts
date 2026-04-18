import { logger } from "./logger.js";

export interface GatewayConfig {
  port: number;
  jwtSecret: string;
  downstreamServices: Record<string, { host: string; port: number }>;
  rateLimit: {
    max: number;
    timeWindow: string;
  };
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
  downstreamServices: {
    users: {
      host: getEnv("USERS_SERVICE_HOST", "localhost"),
      port: parseInt(getEnv("USERS_SERVICE_PORT", "3001"), 10),
    },
    orders: {
      host: getEnv("ORDERS_SERVICE_HOST", "localhost"),
      port: parseInt(getEnv("ORDERS_SERVICE_PORT", "3002"), 10),
    },
  },
  rateLimit: {
    max: parseInt(getEnv("RATE_LIMIT_MAX", "100"), 10),
    timeWindow: getEnv("RATE_LIMIT_WINDOW", "1 minute"),
  },
};

logger.debug({ config: { ...config, jwtSecret: "[REDACTED]" } }, "Gateway config loaded");
