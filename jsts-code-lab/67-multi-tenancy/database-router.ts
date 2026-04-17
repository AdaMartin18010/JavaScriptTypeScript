/**
 * @file 租户隔离的数据库路由
 * @category Multi-Tenancy → Database Router
 * @difficulty hard
 * @tags multi-tenancy, database-routing, connection-pool, shard
 *
 * @description
 * 根据租户 ID 动态路由到对应的数据库分片或实例。
 * 支持基于规则的路由和一致性哈希的默认路由策略。
 */

/** 数据库连接信息 */
export interface DatabaseConnection {
  /** 连接标识 */
  id: string;
  /** 数据库主机 */
  host: string;
  /** 数据库端口 */
  port: number;
  /** 数据库名称 */
  database: string;
  /** 租户 Schema（可选） */
  schema?: string;
}

/** 路由规则 */
export interface RoutingRule {
  /** 租户 ID 匹配正则 */
  tenantPattern: RegExp;
  /** 目标分片索引 */
  targetShard: number;
  /** 规则优先级（数字越小优先级越高） */
  priority?: number;
}

/** 租户数据库路由器 */
export class TenantDatabaseRouter {
  private readonly connections = new Map<string, DatabaseConnection>();
  private readonly rules: RoutingRule[] = [];
  private readonly shards: readonly DatabaseConnection[];

  /**
   * @param shards - 数据库分片列表
   */
  constructor(shards: DatabaseConnection[]) {
    if (shards.length === 0) {
      throw new Error('At least one database shard is required');
    }
    this.shards = [...shards];
  }

  /**
   * 添加路由规则
   * @param rule - 路由规则
   * @returns 当前实例（链式调用）
   */
  addRule(rule: RoutingRule): this {
    this.rules.push({ ...rule, priority: rule.priority ?? 0 });
    this.rules.sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));
    return this;
  }

  /**
   * 根据租户 ID 获取数据库连接信息
   * @param tenantId - 租户标识
   * @returns 数据库连接信息
   * @throws 当未找到对应分片时抛出错误
   */
  route(tenantId: string): DatabaseConnection {
    const existing = this.connections.get(tenantId);
    if (existing) return existing;

    for (const rule of this.rules) {
      if (rule.tenantPattern.test(tenantId)) {
        const conn = this.shards[rule.targetShard];
        if (!conn) {
          throw new Error(`Shard ${rule.targetShard} not found for tenant ${tenantId}`);
        }
        const tenantConn = { ...conn, schema: tenantId };
        this.connections.set(tenantId, tenantConn);
        return tenantConn;
      }
    }

    const shardIndex = this.computeHash(tenantId) % this.shards.length;
    const conn = this.shards[shardIndex];
    const tenantConn = { ...conn, schema: tenantId };
    this.connections.set(tenantId, tenantConn);
    return tenantConn;
  }

  /**
   * 释放租户连接缓存
   * @param tenantId - 租户标识
   * @returns 是否成功释放
   */
  release(tenantId: string): boolean {
    return this.connections.delete(tenantId);
  }

  /**
   * 获取所有活跃的租户连接
   * @returns 活跃连接映射
   */
  getActiveConnections(): ReadonlyMap<string, DatabaseConnection> {
    return new Map(this.connections);
  }

  /**
   * 获取活跃连接数量
   * @returns 连接数
   */
  getActiveConnectionCount(): number {
    return this.connections.size;
  }

  /**
   * 清空所有连接缓存
   */
  clear(): void {
    this.connections.clear();
  }

  private computeHash(tenantId: string): number {
    let hash = 0;
    for (let i = 0; i < tenantId.length; i++) {
      hash = ((hash << 5) - hash) + tenantId.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash);
  }
}
