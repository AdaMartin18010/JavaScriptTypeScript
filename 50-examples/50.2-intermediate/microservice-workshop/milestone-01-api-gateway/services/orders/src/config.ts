export const config = {
  port: parseInt(process.env.ORDERS_SERVICE_PORT || "3002", 10),
  serviceName: "orders-service",
  logLevel: process.env.LOG_LEVEL || "info",
};
