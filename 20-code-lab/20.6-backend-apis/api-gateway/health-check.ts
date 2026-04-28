/**
 * @file 健康检查
 * @category API Gateway → Health Check
 * @difficulty medium
 * @tags api-gateway, health-check, circuit-breaker, readiness
 *
 * @description
 * API 网关健康检查系统：服务健康探测、聚合状态、就绪/存活检查
 */

// ============================================================================
// 类型定义
// ============================================================================

export interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  checks: HealthCheckResult[];
  timestamp: number;
  uptime: number;
}

export interface HealthCheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  responseTime: number;
  message?: string;
  metadata?: Record<string, unknown>;
}

export interface HealthCheckConfig {
  name: string;
  interval: number;
  timeout: number;
  retries: number;
  check: () => Promise<void> | void;
}

export interface ServiceHealth {
  serviceId: string;
  endpoint: string;
  status: 'healthy' | 'unhealthy' | 'unknown';
  lastChecked: number;
  responseTime: number;
  consecutiveFailures: number;
}

// ============================================================================
// 健康检查器
// ============================================================================

export class HealthChecker {
  private checks = new Map<string, HealthCheckConfig>();
  private results = new Map<string, HealthCheckResult>();
  private intervals = new Map<string, ReturnType<typeof setInterval>>();
  private startTime = Date.now();

  /**
   * 注册健康检查
   */
  register(config: HealthCheckConfig): void {
    this.checks.set(config.name, config);
  }

  /**
   * 启动健康检查
   */
  start(): void {
    for (const [name, config] of this.checks) {
      this.runCheck(config);

      const interval = setInterval(() => {
        this.runCheck(config);
      }, config.interval);

      this.intervals.set(name, interval);
    }
  }

  /**
   * 停止健康检查
   */
  stop(): void {
    for (const interval of this.intervals.values()) {
      clearInterval(interval);
    }
    this.intervals.clear();
  }

  /**
   * 执行单次健康检查
   */
  async runCheck(config: HealthCheckConfig): Promise<HealthCheckResult> {
    const start = Date.now();
    let status: HealthCheckResult['status'] = 'pass';
    let message: string | undefined;

    for (let attempt = 0; attempt < config.retries; attempt++) {
      try {
        await Promise.race([
          config.check(),
          new Promise<void>((_, reject) =>
            setTimeout(() => reject(new Error('Health check timeout')), config.timeout)
          )
        ]);
        break;
      } catch (error) {
        if (attempt === config.retries - 1) {
          status = 'fail';
          message = error instanceof Error ? error.message : 'Health check failed';
        }
      }
    }

    const result: HealthCheckResult = {
      name: config.name,
      status,
      responseTime: Date.now() - start,
      message
    };

    this.results.set(config.name, result);
    return result;
  }

  /**
   * 获取聚合健康状态
   */
  getStatus(): HealthStatus {
    const checks = Array.from(this.results.values());
    const hasFail = checks.some(c => c.status === 'fail');
    const hasWarn = checks.some(c => c.status === 'warn');

    let status: HealthStatus['status'] = 'healthy';
    if (hasFail) status = 'unhealthy';
    else if (hasWarn) status = 'degraded';

    return {
      status,
      checks,
      timestamp: Date.now(),
      uptime: Date.now() - this.startTime
    };
  }

  /**
   * 获取单个检查结果
   */
  getResult(name: string): HealthCheckResult | undefined {
    return this.results.get(name);
  }

  /**
   *  readiness 检查（所有检查通过）
   */
  isReady(): boolean {
    const checks = Array.from(this.results.values());
    return checks.length > 0 && checks.every(c => c.status === 'pass');
  }

  /**
   * liveness 检查（无严重失败）
   */
  isAlive(): boolean {
    const checks = Array.from(this.results.values());
    return checks.length === 0 || !checks.some(c => c.status === 'fail');
  }
}

// ============================================================================
// 服务健康监控
// ============================================================================

export class ServiceHealthMonitor {
  private services = new Map<string, ServiceHealth>();
  private failureThreshold: number;

  constructor(options: { failureThreshold?: number } = {}) {
    this.failureThreshold = options.failureThreshold ?? 3;
  }

  /**
   * 注册服务
   */
  register(serviceId: string, endpoint: string): void {
    this.services.set(serviceId, {
      serviceId,
      endpoint,
      status: 'unknown',
      lastChecked: 0,
      responseTime: 0,
      consecutiveFailures: 0
    });
  }

  /**
   * 更新服务健康状态
   */
  updateHealth(serviceId: string, healthy: boolean, responseTime: number): void {
    const service = this.services.get(serviceId);
    if (!service) return;

    service.lastChecked = Date.now();
    service.responseTime = responseTime;

    if (healthy) {
      service.status = 'healthy';
      service.consecutiveFailures = 0;
    } else {
      service.consecutiveFailures++;
      if (service.consecutiveFailures >= this.failureThreshold) {
        service.status = 'unhealthy';
      }
    }
  }

  /**
   * 获取健康服务列表
   */
  getHealthyServices(): ServiceHealth[] {
    return Array.from(this.services.values()).filter(s => s.status === 'healthy');
  }

  /**
   * 获取不健康服务列表
   */
  getUnhealthyServices(): ServiceHealth[] {
    return Array.from(this.services.values()).filter(s => s.status === 'unhealthy');
  }

  /**
   * 获取所有服务状态
   */
  getAllServices(): ServiceHealth[] {
    return Array.from(this.services.values());
  }

  /**
   * 检查服务是否健康
   */
  isHealthy(serviceId: string): boolean {
    return this.services.get(serviceId)?.status === 'healthy';
  }
}

// ============================================================================
// 使用示例
// ============================================================================

export function demo(): void {
  console.log('=== 健康检查 ===\n');

  const checker = new HealthChecker();

  checker.register({
    name: 'database',
    interval: 30000,
    timeout: 5000,
    retries: 2,
    check: () => { /* 模拟 DB 检查 */ }
  });

  checker.register({
    name: 'cache',
    interval: 30000,
    timeout: 2000,
    retries: 1,
    check: () => { /* 模拟缓存检查 */ }
  });

  // 模拟手动检查
  const dbResult = checker.runCheck({
    name: 'database',
    interval: 30000,
    timeout: 5000,
    retries: 1,
    check: () => { /* OK */ }
  });

  console.log('DB check result:', dbResult);
  console.log('Overall status:', checker.getStatus());

  // 服务监控
  const monitor = new ServiceHealthMonitor({ failureThreshold: 2 });
  monitor.register('user-service', 'http://user-svc:8080');
  monitor.register('order-service', 'http://order-svc:8080');

  monitor.updateHealth('user-service', true, 45);
  monitor.updateHealth('order-service', false, 0);
  monitor.updateHealth('order-service', false, 0);

  console.log('\nHealthy services:', monitor.getHealthyServices().map(s => s.serviceId));
  console.log('Unhealthy services:', monitor.getUnhealthyServices().map(s => s.serviceId));
}
