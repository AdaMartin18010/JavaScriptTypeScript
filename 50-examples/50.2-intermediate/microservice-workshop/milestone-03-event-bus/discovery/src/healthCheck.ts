import { logger } from "../../gateway/src/logger.js";
import { registry, type ServiceRegistration } from "./registry.js";

export interface HealthStatus {
  service: string;
  healthy: boolean;
  latencyMs: number;
  error?: string;
  checkedAt: string;
}

export class HealthChecker {
  private intervalMs: number;
  private timeoutMs: number;
  private timer?: NodeJS.Timeout;

  constructor(intervalMs = 15000, timeoutMs = 5000) {
    this.intervalMs = intervalMs;
    this.timeoutMs = timeoutMs;
  }

  async checkService(service: ServiceRegistration): Promise<HealthStatus> {
    const url = `http://${service.host}:${service.port}${service.healthCheckEndpoint}`;
    const start = performance.now();
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);
      const latencyMs = performance.now() - start;
      const healthy = response.status === 200;
      if (!healthy) {
        logger.warn({ service: service.name, status: response.status }, "Health check returned non-200");
      }
      return { service: service.name, healthy, latencyMs: Math.round(latencyMs), checkedAt: new Date().toISOString() };
    } catch (err) {
      const latencyMs = performance.now() - start;
      logger.error({ err, service: service.name, url }, "Health check failed");
      return { service: service.name, healthy: false, latencyMs: Math.round(latencyMs), error: err instanceof Error ? err.message : String(err), checkedAt: new Date().toISOString() };
    }
  }

  async checkAll(): Promise<HealthStatus[]> {
    const services = await registry.listServices();
    const results = await Promise.all(services.map((s) => this.checkService(s)));
    const healthyCount = results.filter((r) => r.healthy).length;
    logger.info({ total: results.length, healthy: healthyCount, unhealthy: results.length - healthyCount }, "Health check round completed");
    return results;
  }

  start(): void {
    if (this.timer) return;
    logger.info({ intervalMs: this.intervalMs }, "Starting health checker");
    this.timer = setInterval(() => {
      this.checkAll().catch((err) => logger.error({ err }, "Health check round error"));
    }, this.intervalMs);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
      logger.info("Health checker stopped");
    }
  }
}

export const healthChecker = new HealthChecker();
