/**
 * @file 资源配额限制器
 * @category Multi-Tenancy → Resource Quota
 * @difficulty hard
 * @tags multi-tenancy, quota, rate-limiting, resource-management, throttling
 *
 * @description
 * 为每个租户维护独立的资源配额与使用量统计，支持速率限制、资源消耗检查及使用报告生成。
 * 适用于多租户 SaaS 平台中对不同租户进行资源隔离与计费控制。
 */

/** 配额配置 */
export interface QuotaConfig {
  /** 每分钟最大请求数 */
  maxRequestsPerMinute: number;
  /** 最大存储字节数 */
  maxStorageBytes: number;
  /** 最大用户数 */
  maxUsers: number;
  /** 最大项目数 */
  maxProjects: number;
}

/** 配额使用状态 */
export interface QuotaUsage {
  /** 当前使用量 */
  current: number;
  /** 限制值 */
  limit: number;
  /** 重置时间戳 */
  resetAt: number;
}

/** 速率限制检查结果 */
export interface RateLimitResult {
  /** 是否允许 */
  allowed: boolean;
  /** 剩余配额 */
  remaining: number;
  /** 窗口重置剩余毫秒数 */
  resetInMs: number;
}

/** 资源消耗结果 */
export interface ConsumeResult {
  /** 是否允许 */
  allowed: boolean;
  /** 当前使用量 */
  current: number;
  /** 限制值 */
  limit: number;
}

/** 资源配额限制器 */
export class ResourceQuotaLimiter {
  private readonly quotas = new Map<string, QuotaConfig>();
  private readonly usages = new Map<string, Map<string, QuotaUsage>>();
  private readonly requestWindows = new Map<string, number[]>();

  /**
   * 设置租户配额
   * @param tenantId - 租户标识
   * @param quota - 配额配置（部分更新）
   */
  setQuota(tenantId: string, quota: Partial<QuotaConfig>): void {
    const existing = this.quotas.get(tenantId);
    this.quotas.set(tenantId, {
      maxRequestsPerMinute: quota.maxRequestsPerMinute ?? existing?.maxRequestsPerMinute ?? 60,
      maxStorageBytes: quota.maxStorageBytes ?? existing?.maxStorageBytes ?? 104857600,
      maxUsers: quota.maxUsers ?? existing?.maxUsers ?? 5,
      maxProjects: quota.maxProjects ?? existing?.maxProjects ?? 2
    });
  }

  /**
   * 检查请求是否超出速率限制
   * @param tenantId - 租户标识
   * @returns 速率限制结果
   */
  checkRateLimit(tenantId: string): RateLimitResult {
    this.ensureQuota(tenantId);
    const quota = this.quotas.get(tenantId)!;

    const now = Date.now();
    const windowStart = now - 60000;

    let window = this.requestWindows.get(tenantId) ?? [];
    window = window.filter(t => t > windowStart);
    window.push(now);
    this.requestWindows.set(tenantId, window);

    const remaining = Math.max(0, quota.maxRequestsPerMinute - window.length);
    return {
      allowed: window.length <= quota.maxRequestsPerMinute,
      remaining,
      resetInMs: window.length > 0 ? 60000 - (now - window[0]) : 0
    };
  }

  /**
   * 检查并增加资源使用量
   * @param tenantId - 租户标识
   * @param resource - 资源类型
   * @param amount - 增加量
   * @returns 消耗结果
   */
  consumeResource(
    tenantId: string,
    resource: keyof QuotaConfig,
    amount = 1
  ): ConsumeResult {
    this.ensureQuota(tenantId);
    const quota = this.quotas.get(tenantId)!;
    const tenantUsages = this.usages.get(tenantId) ?? new Map();
    const usage = tenantUsages.get(resource) ?? {
      current: 0,
      limit: quota[resource],
      resetAt: Date.now()
    };

    const newCurrent = usage.current + amount;
    const allowed = newCurrent <= usage.limit;

    if (allowed) {
      usage.current = newCurrent;
      tenantUsages.set(resource, usage);
      this.usages.set(tenantId, tenantUsages);
    }

    return { allowed, current: usage.current, limit: usage.limit };
  }

  /**
   * 减少资源使用量
   * @param tenantId - 租户标识
   * @param resource - 资源类型
   * @param amount - 减少量
   */
  releaseResource(tenantId: string, resource: keyof QuotaConfig, amount = 1): void {
    const tenantUsages = this.usages.get(tenantId);
    if (!tenantUsages) return;

    const usage = tenantUsages.get(resource);
    if (usage) {
      usage.current = Math.max(0, usage.current - amount);
      tenantUsages.set(resource, usage);
    }
  }

  /**
   * 获取租户配额使用报告
   * @param tenantId - 租户标识
   * @returns 各资源的使用报告
   */
  getUsageReport(tenantId: string): Record<string, { used: number; limit: number; percentage: number }> {
    this.ensureQuota(tenantId);
    const quota = this.quotas.get(tenantId)!;
    const tenantUsages = this.usages.get(tenantId) ?? new Map();
    const report: Record<string, { used: number; limit: number; percentage: number }> = {};

    for (const key of Object.keys(quota) as Array<keyof QuotaConfig>) {
      const usage = tenantUsages.get(key);
      const used = usage?.current ?? 0;
      const limit = quota[key];
      report[key] = {
        used,
        limit,
        percentage: limit === Infinity || limit === 0 ? 0 : (used / limit) * 100
      };
    }

    return report;
  }

  private ensureQuota(tenantId: string): void {
    if (!this.quotas.has(tenantId)) {
      this.setQuota(tenantId, {});
    }
  }
}
