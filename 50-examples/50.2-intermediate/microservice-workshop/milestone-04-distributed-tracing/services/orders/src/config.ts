export const config = {
  port: parseInt(process.env.ORDERS_SERVICE_PORT || "3002", 10),
  host: process.env.ORDERS_SERVICE_HOST || "localhost",
  serviceName: "orders-service",
  logLevel: process.env.LOG_LEVEL || "info",
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
  natsUrl: process.env.NATS_URL || "nats://localhost:4222",
  otlpEndpoint: process.env.OTLP_ENDPOINT,
};
