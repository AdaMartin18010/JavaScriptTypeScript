export const config = {
  port: parseInt(process.env.USERS_SERVICE_PORT || "3001", 10),
  serviceName: "users-service",
  logLevel: process.env.LOG_LEVEL || "info",
};
