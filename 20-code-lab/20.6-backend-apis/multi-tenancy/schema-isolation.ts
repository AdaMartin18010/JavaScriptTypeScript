/**
 * @file Schema 隔离策略
 * @category Multi-Tenancy → Schema Isolation
 * @difficulty hard
 * @tags multi-tenancy, schema-isolation, database, tenant-separation
 *
 * @description
 * 实现三种经典的多租户数据库隔离策略：共享 Schema、独立 Schema 和独立数据库。
 * 提供统一的接口来管理不同隔离级别下的表结构定义与访问。
 */

/** 隔离策略类型 */
export type IsolationStrategy = 'shared_schema' | 'separate_schema' | 'separate_database';

/** Schema 配置 */
export interface SchemaConfig {
  /** 隔离策略 */
  strategy: IsolationStrategy;
  /** 默认 Schema 名称 */
  defaultSchema: string;
  /** Schema 前缀 */
  schemaPrefix: string;
}

/** 表结构定义 */
export interface TableDefinition {
  /** 表名 */
  name: string;
  /** 列定义 */
  columns: Record<string, string>;
  /** 索引定义 */
  indexes?: string[];
}

/** Schema 隔离策略管理器 */
export class SchemaIsolationStrategy {
  private readonly schemas = new Map<string, Map<string, TableDefinition>>();
  private readonly config: SchemaConfig;

  /**
   * @param config - Schema 配置选项
   */
  constructor(config: Partial<SchemaConfig> = {}) {
    this.config = {
      strategy: config.strategy ?? 'shared_schema',
      defaultSchema: config.defaultSchema ?? 'public',
      schemaPrefix: config.schemaPrefix ?? 'tenant_'
    };
  }

  /**
   * 获取租户对应的 Schema 名称
   * @param tenantId - 租户标识
   * @returns Schema 名称
   */
  getSchemaName(tenantId: string): string {
    switch (this.config.strategy) {
      case 'shared_schema':
        return this.config.defaultSchema;
      case 'separate_schema':
        return `${this.config.schemaPrefix}${this.sanitizeName(tenantId)}`;
      case 'separate_database':
        return `db_${this.sanitizeName(tenantId)}`;
      default:
        throw new Error(`Unknown isolation strategy: ${this.config.strategy}`);
    }
  }

  /**
   * 在租户 Schema 中创建表定义
   * @param tenantId - 租户标识
   * @param table - 表结构定义
   */
  createTable(tenantId: string, table: TableDefinition): void {
    const schemaName = this.getSchemaName(tenantId);
    if (!this.schemas.has(schemaName)) {
      this.schemas.set(schemaName, new Map());
    }
    this.schemas.get(schemaName)!.set(table.name, table);
  }

  /**
   * 获取租户 Schema 中的表定义
   * @param tenantId - 租户标识
   * @param tableName - 表名
   * @returns 表定义，不存在时返回 undefined
   */
  getTable(tenantId: string, tableName: string): TableDefinition | undefined {
    const schemaName = this.getSchemaName(tenantId);
    return this.schemas.get(schemaName)?.get(tableName);
  }

  /**
   * 获取租户的所有表
   * @param tenantId - 租户标识
   * @returns 表定义列表
   */
  getTables(tenantId: string): TableDefinition[] {
    const schemaName = this.getSchemaName(tenantId);
    return Array.from(this.schemas.get(schemaName)?.values() ?? []);
  }

  /**
   * 检查租户是否包含指定表
   * @param tenantId - 租户标识
   * @param tableName - 表名
   * @returns 是否存在
   */
  hasTable(tenantId: string, tableName: string): boolean {
    const schemaName = this.getSchemaName(tenantId);
    return this.schemas.get(schemaName)?.has(tableName) ?? false;
  }

  /**
   * 删除租户的 Schema
   * @param tenantId - 租户标识
   * @returns 是否成功删除
   */
  dropSchema(tenantId: string): boolean {
    const schemaName = this.getSchemaName(tenantId);
    return this.schemas.delete(schemaName);
  }

  /**
   * 获取当前隔离策略
   * @returns 隔离策略枚举值
   */
  getStrategy(): IsolationStrategy {
    return this.config.strategy;
  }

  /**
   * 获取所有已创建的 Schema 名称
   * @returns Schema 名称列表
   */
  getAllSchemaNames(): string[] {
    return Array.from(this.schemas.keys());
  }

  private sanitizeName(name: string): string {
    return name.replace(/[^a-zA-Z0-9_]/g, '_');
  }
}
