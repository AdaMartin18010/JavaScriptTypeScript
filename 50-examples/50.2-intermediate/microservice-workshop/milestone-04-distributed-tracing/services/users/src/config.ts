export const config = {
  port: parseInt(process.env.USERS_SERVICE_PORT || "3001", 10),
  host: process.env.USERS_SERVICE_HOST || "localhost",
  serviceName: "users-service",
  logLevel: process.env.LOG_LEVEL || "info",
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
  otlpEndpoint: process.env.OTLP_ENDPOINT,
};
