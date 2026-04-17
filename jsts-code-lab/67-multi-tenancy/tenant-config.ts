/**
 * @file 租户级配置管理器
 * @category Multi-Tenancy → Configuration
 * @difficulty medium
 * @tags multi-tenancy, configuration, tenant-settings, customization
 *
 * @description
 * 为每个租户维护独立的配置空间，支持层级合并与默认值回退。
 * 适用于 SaaS 场景中不同租客的个性化定制需求。
 */

/** 租户配置结构 */
export interface TenantConfiguration {
  /** UI 主题 */
  theme: string;
  /** 功能开关 */
  features: Record<string, boolean>;
  /** 资源限制 */
  limits: Record<string, number>;
  /** 自定义字段 */
  customFields: Record<string, unknown>;
}

/** 租户配置管理器 */
export class TenantConfigManager {
  private readonly configs = new Map<string, TenantConfiguration>();
  private readonly defaults: TenantConfiguration;

  /**
   * @param defaults - 全局默认配置
   */
  constructor(defaults: Partial<TenantConfiguration> = {}) {
    this.defaults = {
      theme: defaults.theme ?? 'light',
      features: defaults.features ?? {},
      limits: defaults.limits ?? {},
      customFields: defaults.customFields ?? {}
    };
  }

  /**
   * 获取或初始化租户配置
   * @param tenantId - 租户标识
   * @returns 租户配置对象
   */
  getConfig(tenantId: string): TenantConfiguration {
    if (!this.configs.has(tenantId)) {
      this.configs.set(tenantId, this.createDefaultConfig());
    }
    return this.configs.get(tenantId)!;
  }

  /**
   * 更新租户配置（深度合并）
   * @param tenantId - 租户标识
   * @param updates - 要更新的配置项
   */
  updateConfig(tenantId: string, updates: Partial<TenantConfiguration>): void {
    const current = this.getConfig(tenantId);
    this.configs.set(tenantId, {
      theme: updates.theme ?? current.theme,
      features: { ...current.features, ...updates.features },
      limits: { ...current.limits, ...updates.limits },
      customFields: { ...current.customFields, ...updates.customFields }
    });
  }

  /**
   * 检查租户是否启用某功能
   * @param tenantId - 租户标识
   * @param feature - 功能名称
   * @returns 是否启用
   */
  isFeatureEnabled(tenantId: string, feature: string): boolean {
    return this.getConfig(tenantId).features[feature] ?? false;
  }

  /**
   * 设置租户功能开关
   * @param tenantId - 租户标识
   * @param feature - 功能名称
   * @param enabled - 是否启用
   */
  setFeature(tenantId: string, feature: string, enabled: boolean): void {
    const config = this.getConfig(tenantId);
    config.features[feature] = enabled;
  }

  /**
   * 获取租户配置项限制值
   * @param tenantId - 租户标识
   * @param limitKey - 限制项名称
   * @returns 限制值，不存在时返回 undefined
   */
  getLimit(tenantId: string, limitKey: string): number | undefined {
    return this.getConfig(tenantId).limits[limitKey];
  }

  /**
   * 删除租户配置
   * @param tenantId - 租户标识
   * @returns 是否成功删除
   */
  removeConfig(tenantId: string): boolean {
    return this.configs.delete(tenantId);
  }

  /**
   * 获取所有已注册租户的 ID 列表
   * @returns 租户 ID 列表
   */
  getRegisteredTenants(): string[] {
    return Array.from(this.configs.keys());
  }

  private createDefaultConfig(): TenantConfiguration {
    return {
      theme: this.defaults.theme,
      features: { ...this.defaults.features },
      limits: { ...this.defaults.limits },
      customFields: { ...this.defaults.customFields }
    };
  }
}
