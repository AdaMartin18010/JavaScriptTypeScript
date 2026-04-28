import { ServiceRegistry, type ServiceRegistration } from "../../../discovery/src/registry.js";
import { config } from "./config.js";
import { logger } from "./logger.js";

const registry = new ServiceRegistry(config.redisUrl);
let heartbeatTimer: NodeJS.Timeout | undefined;

export async function registerService(): Promise<void> {
  const registration: ServiceRegistration = {
    name: config.serviceName,
    host: config.host,
    port: config.port,
    healthCheckEndpoint: "/health",
    registeredAt: new Date().toISOString(),
    lastHeartbeat: new Date().toISOString(),
    metadata: { version: "1.0.0", region: "local" },
  };

  await registry.register(registration);
  logger.info({ service: config.serviceName }, "Registered in service registry");

  heartbeatTimer = setInterval(async () => {
    try {
      await registry.heartbeat(config.serviceName);
    } catch (err) {
      logger.error({ err }, "Heartbeat failed, attempting re-register");
      try {
        await registry.register(registration);
      } catch (reErr) {
        logger.error({ err: reErr }, "Re-register failed");
      }
    }
  }, 10000);
}

export async function deregisterService(): Promise<void> {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = undefined;
  }
  await registry.deregister(config.serviceName);
  await registry.close();
  logger.info({ service: config.serviceName }, "Deregistered from service registry");
}
