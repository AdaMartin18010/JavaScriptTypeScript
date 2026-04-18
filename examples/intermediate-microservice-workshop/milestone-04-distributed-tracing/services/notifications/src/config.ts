export const config = {
  port: parseInt(process.env.NOTIFICATIONS_SERVICE_PORT || "3003", 10),
  host: process.env.NOTIFICATIONS_SERVICE_HOST || "localhost",
  serviceName: "notifications-service",
  logLevel: process.env.LOG_LEVEL || "info",
  natsUrl: process.env.NATS_URL || "nats://localhost:4222",
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
  otlpEndpoint: process.env.OTLP_ENDPOINT,
};
