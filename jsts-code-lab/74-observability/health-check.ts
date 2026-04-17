/**
 * @file 健康检查框架
 * @category Observability → Health Checks
 * @difficulty medium
 * @tags observability, health-check, readiness, liveness, probe
 *
 * @description
 * 健康检查框架，支持存活探针（Liveness）、就绪探针（Readiness）和启动探针（Startup）。
 *
 * 探针类型：
 * - Liveness: 应用是否正在运行（崩溃则重启）
 * - Readiness: 应用是否准备好接收流量
 * - Startup: 应用是否已完成启动
 *
 * 检查类型：
 * - HTTP 端点检查
 * - 依赖服务检查（数据库、缓存、消息队列）
 * - 资源使用检查（内存、磁盘、CPU）
 * - 自定义检查函数
 */

export enum HealthStatus {
  HEALTHY = 'healthy',
  UNHEALTHY = 'unhealthy',
  DEGRADED = 'degraded',
  UNKNOWN = 'unknown'
}

export interface HealthCheckResult {
  name: string;
  status: HealthStatus;
  durationMs: number;
  message?: string;
  metadata?: Record<string, unknown>;
  timestamp: number;
}

export interface AggregateHealth {
  status: HealthStatus;
  checks: HealthCheckResult[];
  totalDurationMs: number;
  timestamp: number;
}

export type HealthCheckFn = () => HealthCheckResult | Promise<HealthCheckResult>;

// ==================== 基础健康检查 ====================

export abstract class HealthCheck {
  constructor(public readonly name: string) {}

  abstract check(): HealthCheckResult | Promise<HealthCheckResult>;

  protected createResult(
    status: HealthStatus,
    durationMs: number,
    message?: string,
    metadata?: Record<string, unknown>
  ): HealthCheckResult {
    return {
      name: this.name,
      status,
      durationMs,
      message,
      metadata,
      timestamp: Date.now()
    };
  }
}

// ==================== 内置检查实现 ====================

export class MemoryHealthCheck extends HealthCheck {
  constructor(
    name = 'memory',
    private thresholdPercent = 90
  ) {
    super(name);
  }

  check(): HealthCheckResult {
    const start = performance.now();

    // 模拟内存检查
    const usedPercent = this.getMemoryUsagePercent();
    const duration = performance.now() - start;

    if (usedPercent >= this.thresholdPercent) {
      return this.createResult(
        HealthStatus.UNHEALTHY,
        duration,
        `Memory usage ${usedPercent.toFixed(1)}% exceeds threshold ${this.thresholdPercent}%`,
        { usedPercent, threshold: this.thresholdPercent }
      );
    }

    if (usedPercent >= this.thresholdPercent * 0.8) {
      return this.createResult(
        HealthStatus.DEGRADED,
        duration,
        `Memory usage ${usedPercent.toFixed(1)}% is high`,
        { usedPercent, threshold: this.thresholdPercent }
      );
    }

    return this.createResult(
      HealthStatus.HEALTHY,
      duration,
      `Memory usage ${usedPercent.toFixed(1)}% is normal`,
      { usedPercent }
    );
  }

  private getMemoryUsagePercent(): number {
    // 简化实现，实际应使用 process.memoryUsage()
    return Math.random() * 100;
  }
}

export class DiskHealthCheck extends HealthCheck {
  constructor(
    name = 'disk',
    private thresholdPercent = 90
  ) {
    super(name);
  }

  check(): HealthCheckResult {
    const start = performance.now();
    const usedPercent = this.getDiskUsagePercent();
    const duration = performance.now() - start;

    if (usedPercent >= this.thresholdPercent) {
      return this.createResult(
        HealthStatus.UNHEALTHY,
        duration,
        `Disk usage ${usedPercent.toFixed(1)}% exceeds threshold`,
        { usedPercent }
      );
    }

    return this.createResult(
      HealthStatus.HEALTHY,
      duration,
      `Disk usage ${usedPercent.toFixed(1)}%`,
      { usedPercent }
    );
  }

  private getDiskUsagePercent(): number {
    return Math.random() * 100;
  }
}

export class DependencyHealthCheck extends HealthCheck {
  constructor(
    name: string,
    private checkFn: () => boolean | Promise<boolean>,
    private timeoutMs = 5000
  ) {
    super(name);
  }

  async check(): Promise<HealthCheckResult> {
    const start = performance.now();

    try {
      const result = await this.runWithTimeout(this.checkFn(), this.timeoutMs);
      const duration = performance.now() - start;

      if (result) {
        return this.createResult(HealthStatus.HEALTHY, duration, `${this.name} is reachable`);
      }

      return this.createResult(HealthStatus.UNHEALTHY, duration, `${this.name} check returned false`);
    } catch (error) {
      const duration = performance.now() - start;
      return this.createResult(
        HealthStatus.UNHEALTHY,
        duration,
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  private runWithTimeout<T>(promise: T | Promise<T>, timeoutMs: number): Promise<T> {
    return Promise.race([
      Promise.resolve(promise),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error(`Health check timed out after ${timeoutMs}ms`)), timeoutMs);
      })
    ]);
  }
}

export class CustomHealthCheck extends HealthCheck {
  constructor(
    name: string,
    private fn: HealthCheckFn
  ) {
    super(name);
  }

  check(): HealthCheckResult | Promise<HealthCheckResult> {
    return this.fn();
  }
}

// ==================== 健康检查注册表 ====================

export class HealthRegistry {
  private livenessChecks: HealthCheck[] = [];
  private readinessChecks: HealthCheck[] = [];
  private startupChecks: HealthCheck[] = [];

  registerLiveness(check: HealthCheck): void {
    this.livenessChecks.push(check);
  }

  registerReadiness(check: HealthCheck): void {
    this.readinessChecks.push(check);
  }

  registerStartup(check: HealthCheck): void {
    this.startupChecks.push(check);
  }

  /**
   * 执行存活检查
   */
  async checkLiveness(): Promise<AggregateHealth> {
    return this.runChecks(this.livenessChecks);
  }

  /**
   * 执行就绪检查
   */
  async checkReadiness(): Promise<AggregateHealth> {
    return this.runChecks(this.readinessChecks);
  }

  /**
   * 执行启动检查
   */
  async checkStartup(): Promise<AggregateHealth> {
    return this.runChecks(this.startupChecks);
  }

  /**
   * 执行所有检查
   */
  async checkAll(): Promise<{
    liveness: AggregateHealth;
    readiness: AggregateHealth;
    startup: AggregateHealth;
  }> {
    const [liveness, readiness, startup] = await Promise.all([
      this.checkLiveness(),
      this.checkReadiness(),
      this.checkStartup()
    ]);

    return { liveness, readiness, startup };
  }

  private async runChecks(checks: HealthCheck[]): Promise<AggregateHealth> {
    const start = performance.now();
    const results: HealthCheckResult[] = [];

    // 并行执行所有检查
    const promises = checks.map(async check => {
      try {
        return await Promise.resolve(check.check());
      } catch (error) {
        return {
          name: check.name,
          status: HealthStatus.UNHEALTHY,
          durationMs: 0,
          message: error instanceof Error ? error.message : String(error),
          timestamp: Date.now()
        };
      }
    });

    results.push(...await Promise.all(promises));

    const totalDuration = performance.now() - start;
    const overallStatus = this.aggregateStatus(results);

    return {
      status: overallStatus,
      checks: results,
      totalDurationMs: totalDuration,
      timestamp: Date.now()
    };
  }

  private aggregateStatus(results: HealthCheckResult[]): HealthStatus {
    if (results.length === 0) return HealthStatus.UNKNOWN;

    const statuses = new Set(results.map(r => r.status));

    if (statuses.has(HealthStatus.UNHEALTHY)) {
      return HealthStatus.UNHEALTHY;
    }
    if (statuses.has(HealthStatus.DEGRADED)) {
      return HealthStatus.DEGRADED;
    }
    if (statuses.has(HealthStatus.UNKNOWN)) {
      return HealthStatus.UNKNOWN;
    }

    return HealthStatus.HEALTHY;
  }
}

// ==================== HTTP 格式化器 ====================

export class HealthFormatter {
  static toHttpResponse(health: AggregateHealth): {
    statusCode: number;
    body: Record<string, unknown>;
  } {
    const statusCode = health.status === HealthStatus.HEALTHY ? 200 :
      health.status === HealthStatus.DEGRADED ? 200 : 503;

    return {
      statusCode,
      body: {
        status: health.status,
        checks: health.checks.map(c => ({
          name: c.name,
          status: c.status,
          durationMs: Math.round(c.durationMs * 100) / 100,
          message: c.message
        })),
        totalDurationMs: Math.round(health.totalDurationMs * 100) / 100
      }
    };
  }

  static toPrometheusFormat(health: AggregateHealth): string {
    const lines: string[] = [];
    lines.push('# HELP health_check_status Health check status (0=unhealthy, 1=healthy, 2=degraded)');
    lines.push('# TYPE health_check_status gauge');

    for (const check of health.checks) {
      const value = check.status === HealthStatus.HEALTHY ? 1 :
        check.status === HealthStatus.DEGRADED ? 2 : 0;
      lines.push(`health_check_status{name="${check.name}"} ${value}`);
    }

    return lines.join('\n');
  }
}

// ==================== 演示 ====================

export function demo(): void {
  console.log('=== 健康检查框架 ===\n');

  const registry = new HealthRegistry();

  // 注册存活检查
  registry.registerLiveness(new MemoryHealthCheck('memory-liveness', 95));

  // 注册就绪检查
  registry.registerReadiness(new CustomHealthCheck('database', () => ({
    name: 'database',
    status: HealthStatus.HEALTHY,
    durationMs: 12,
    message: 'Database connection OK',
    timestamp: Date.now()
  })));

  registry.registerReadiness(new DependencyHealthCheck('redis', async () => true, 1000));

  // 注册启动检查
  registry.registerStartup(new CustomHealthCheck('migrations', () => ({
    name: 'migrations',
    status: HealthStatus.HEALTHY,
    durationMs: 5,
    message: 'All migrations applied',
    timestamp: Date.now()
  })));

  // 执行检查
  registry.checkAll().then(({ liveness, readiness, startup }) => {
    console.log('--- Liveness ---');
    console.log(`  Status: ${liveness.status}`);
    liveness.checks.forEach(c => console.log(`  ${c.name}: ${c.status} (${c.durationMs.toFixed(2)}ms)`));

    console.log('\n--- Readiness ---');
    console.log(`  Status: ${readiness.status}`);
    readiness.checks.forEach(c => console.log(`  ${c.name}: ${c.status} (${c.durationMs.toFixed(2)}ms)`));

    console.log('\n--- Startup ---');
    console.log(`  Status: ${startup.status}`);
    startup.checks.forEach(c => console.log(`  ${c.name}: ${c.status} (${c.durationMs.toFixed(2)}ms)`));

    // HTTP 响应格式
    console.log('\n--- HTTP 响应 ---');
    const response = HealthFormatter.toHttpResponse(readiness);
    console.log(`  Status: ${response.statusCode}`);
    console.log('  Body:', JSON.stringify(response.body, null, 2));
  });
}
