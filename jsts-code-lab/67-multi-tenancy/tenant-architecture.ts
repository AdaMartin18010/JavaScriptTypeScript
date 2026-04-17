/**
 * @file 多租户架构
 * @category Multi-Tenancy → Architecture
 * @difficulty hard
 * @tags multi-tenancy, tenant-isolation, data-sharding
 */

export interface Tenant {
  id: string;
  name: string;
  plan: 'free' | 'pro' | 'enterprise';
  settings: Record<string, unknown>;
  createdAt: number;
}

export interface TenantContext {
  tenantId: string;
  userId?: string;
  permissions: string[];
}

// 租户管理器
export class TenantManager {
  private tenants = new Map<string, Tenant>();
  private contexts = new Map<string, TenantContext>();
  
  createTenant(tenant: Omit<Tenant, 'id' | 'createdAt'>): Tenant {
    const newTenant: Tenant = {
      ...tenant,
      id: `tenant-${Math.random().toString(36).slice(2)}`,
      createdAt: Date.now()
    };
    
    this.tenants.set(newTenant.id, newTenant);
    return newTenant;
  }
  
  getTenant(id: string): Tenant | undefined {
    return this.tenants.get(id);
  }
  
  setContext(requestId: string, context: TenantContext): void {
    this.contexts.set(requestId, context);
  }
  
  getContext(requestId: string): TenantContext | undefined {
    return this.contexts.get(requestId);
  }
  
  clearContext(requestId: string): void {
    this.contexts.delete(requestId);
  }
  
  getAllTenants(): Tenant[] {
    return Array.from(this.tenants.values());
  }
}

// 租户隔离的数据存储
export class TenantIsolatedStore<T> {
  private data = new Map<string, Map<string, T>>();
  
  set(tenantId: string, key: string, value: T): void {
    if (!this.data.has(tenantId)) {
      this.data.set(tenantId, new Map());
    }
    this.data.get(tenantId)!.set(key, value);
  }
  
  get(tenantId: string, key: string): T | undefined {
    return this.data.get(tenantId)?.get(key);
  }
  
  getAll(tenantId: string): T[] {
    return Array.from(this.data.get(tenantId)?.values() || []);
  }
  
  delete(tenantId: string, key: string): boolean {
    return this.data.get(tenantId)?.delete(key) || false;
  }
  
  clearTenant(tenantId: string): void {
    this.data.delete(tenantId);
  }
  
  // 跨租户查询（仅限超级管理员）
  queryAcrossTenants(predicate: (item: T) => boolean): { tenantId: string; key: string; value: T }[] {
    const results: { tenantId: string; key: string; value: T }[] = [];
    
    for (const [tenantId, tenantData] of this.data) {
      for (const [key, value] of tenantData) {
        if (predicate(value)) {
          results.push({ tenantId, key, value });
        }
      }
    }
    
    return results;
  }
}

// 资源配额管理
export interface ResourceQuota {
  maxUsers: number;
  maxStorage: number; // MB
  maxRequestsPerMinute: number;
  maxProjects: number;
}

const PLAN_QUOTAS: Record<string, ResourceQuota> = {
  free: { maxUsers: 3, maxStorage: 100, maxRequestsPerMinute: 60, maxProjects: 1 },
  pro: { maxUsers: 20, maxStorage: 1000, maxRequestsPerMinute: 600, maxProjects: 10 },
  enterprise: { maxUsers: Infinity, maxStorage: 10000, maxRequestsPerMinute: 6000, maxProjects: Infinity }
};

export class QuotaManager {
  private usage = new Map<string, Record<string, number>>();
  private requestCounts = new Map<string, number[]>();
  
  constructor(private tenantManager: TenantManager) {}
  
  getQuota(tenantId: string): ResourceQuota {
    const tenant = this.tenantManager.getTenant(tenantId);
    return PLAN_QUOTAS[tenant?.plan || 'free'];
  }
  
  checkQuota(tenantId: string, resource: keyof ResourceQuota): boolean {
    const quota = this.getQuota(tenantId);
    const current = this.getUsage(tenantId, resource);
    return current < quota[resource];
  }
  
  incrementUsage(tenantId: string, resource: string, amount = 1): void {
    const current = this.getUsage(tenantId, resource);
    this.setUsage(tenantId, resource, current + amount);
  }
  
  checkRateLimit(tenantId: string): boolean {
    const quota = this.getQuota(tenantId);
    const now = Date.now();
    const windowStart = now - 60000; // 1分钟窗口
    
    let counts = this.requestCounts.get(tenantId) || [];
    counts = counts.filter(t => t > windowStart);
    counts.push(now);
    
    this.requestCounts.set(tenantId, counts);
    
    return counts.length <= quota.maxRequestsPerMinute;
  }
  
  getUsage(tenantId: string, resource: string): number {
    return this.usage.get(tenantId)?.[resource] || 0;
  }
  
  setUsage(tenantId: string, resource: string, value: number): void {
    if (!this.usage.has(tenantId)) {
      this.usage.set(tenantId, {});
    }
    this.usage.get(tenantId)![resource] = value;
  }
  
  getUsageReport(tenantId: string): Record<string, { used: number; limit: number; percentage: number }> {
    const quota = this.getQuota(tenantId);
    const report: Record<string, { used: number; limit: number; percentage: number }> = {};
    
    for (const key of Object.keys(quota)) {
      const used = this.getUsage(tenantId, key);
      const limit = quota[key as keyof ResourceQuota];
      report[key] = {
        used,
        limit,
        percentage: limit === Infinity ? 0 : (used / limit) * 100
      };
    }
    
    return report;
  }
}

// 数据库路由（简化示例）
export class DatabaseRouter {
  private connections = new Map<string, any>();
  
  constructor(private strategy: 'schema' | 'database' | 'shard' = 'schema') {}
  
  getConnection(tenantId: string): any {
    if (!this.connections.has(tenantId)) {
      this.connections.set(tenantId, this.createConnection(tenantId));
    }
    return this.connections.get(tenantId);
  }
  
  private createConnection(tenantId: string): any {
    switch (this.strategy) {
      case 'schema':
        return { schema: tenantId, db: 'shared_db' };
      case 'database':
        return { db: `tenant_${tenantId}` };
      case 'shard':
        const shardId = this.getShardId(tenantId);
        return { shard: shardId, tenantId };
      default:
        return { db: 'default' };
    }
  }
  
  private getShardId(tenantId: string): number {
    let hash = 0;
    for (let i = 0; i < tenantId.length; i++) {
      hash = ((hash << 5) - hash) + tenantId.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash) % 4; // 4个分片
  }
}

export function demo(): void {
  console.log('=== 多租户架构 ===\n');
  
  const manager = new TenantManager();
  
  // 创建租户
  const tenant1 = manager.createTenant({
    name: 'Acme Corp',
    plan: 'pro',
    settings: { theme: 'dark' }
  });
  
  const tenant2 = manager.createTenant({
    name: 'Startup Inc',
    plan: 'free',
    settings: {}
  });
  
  console.log('创建租户:', tenant1.id, tenant2.id);
  
  // 数据隔离
  const store = new TenantIsolatedStore<{ name: string }>();
  store.set(tenant1.id, 'project-1', { name: 'Project A' });
  store.set(tenant2.id, 'project-1', { name: 'Different Project A' });
  
  console.log('\n隔离数据:');
  console.log(`  ${tenant1.name}:`, store.get(tenant1.id, 'project-1'));
  console.log(`  ${tenant2.name}:`, store.get(tenant2.id, 'project-1'));
  
  // 配额管理
  const quotaManager = new QuotaManager(manager);
  
  quotaManager.incrementUsage(tenant1.id, 'maxUsers', 5);
  quotaManager.incrementUsage(tenant2.id, 'maxUsers', 2);
  
  console.log('\n配额使用报告:');
  console.log(`  ${tenant1.name}:`, quotaManager.getUsageReport(tenant1.id).maxUsers);
  console.log(`  ${tenant2.name}:`, quotaManager.getUsageReport(tenant2.id).maxUsers);
  
  // 数据库路由
  const router = new DatabaseRouter('shard');
  console.log('\n分片路由:');
  [tenant1.id, tenant2.id, 'tenant-3', 'tenant-4'].forEach(id => {
    const conn = router.getConnection(id);
    console.log(`  ${id} -> 分片 ${conn.shard}`);
  });
}
