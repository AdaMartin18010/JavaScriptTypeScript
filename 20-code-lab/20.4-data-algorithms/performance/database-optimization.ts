/**
 * @file 数据库性能优化
 * @category Performance -> Database Optimization
 * @difficulty hard
 * @tags performance, database, sql, indexing, connection-pool, caching
 *
 * @description
 * 数据库性能是全栈应用的关键瓶颈之一。本模块涵盖查询优化、索引设计、
 * 连接池管理和多级缓存策略，适用于 PostgreSQL / MySQL / SQLite 等关系型数据库。
 */

// ============================================================================
// 1. 查询优化与执行计划分析
// ============================================================================

export interface QueryPlan {
  sql: string;
  estimatedCost: number;
  estimatedRows: number;
  actualTime?: number;
  actualRows?: number;
  scans: ScanInfo[];
  indexUsed?: string;
  sortOperations?: number;
}

export interface ScanInfo {
  type: 'seq' | 'index' | 'bitmap' | 'index-only';
  table: string;
  index?: string;
  rowsScanned: number;
  rowsReturned: number;
  condition?: string;
}

export class QueryAnalyzer {
  private slowQueryThreshold = 100; // ms

  analyze(sql: string, plan: QueryPlan): { isSlow: boolean; suggestions: string[] } {
    const suggestions: string[] = [];
    let isSlow = false;

    // 检查全表扫描
    const seqScans = plan.scans.filter((s) => s.type === 'seq');
    for (const scan of seqScans) {
      if (scan.rowsScanned > 10000) {
        suggestions.push(`表 "${scan.table}" 发生大范围全表扫描（${scan.rowsScanned} 行），建议添加索引`);
        isSlow = true;
      }
    }

    // 检查索引使用
    if (!plan.indexUsed && plan.scans.length > 0) {
      suggestions.push('查询未使用索引，检查 WHERE 条件中的字段是否有索引覆盖');
    }

    // 检查排序操作
    if (plan.sortOperations && plan.sortOperations > 1) {
      suggestions.push(`存在 ${plan.sortOperations} 次排序操作，考虑在 ORDER BY 字段上建索引`);
    }

    // 行数估计偏差
    if (plan.estimatedRows && plan.actualRows) {
      const ratio = Math.max(plan.estimatedRows, 1) / Math.max(plan.actualRows, 1);
      if (ratio > 10 || ratio < 0.1) {
        suggestions.push('行数估计偏差大，建议执行 ANALYZE 更新统计信息');
      }
    }

    if (plan.actualTime && plan.actualTime > this.slowQueryThreshold) {
      isSlow = true;
    }

    return { isSlow, suggestions };
  }

  /** 生成查询优化建议 */
  suggestIndex(sql: string, table: string, whereColumns: string[], orderByColumns: string[] = []): string {
    const allColumns = [...whereColumns, ...orderByColumns];
    const indexName = `idx_${table}_${allColumns.join('_')}`;
    return `CREATE INDEX ${indexName} ON ${table} (${allColumns.join(', ')});`;
  }

  /** 检查 N+1 查询模式 */
  detectNPlus1(queryLog: Array<{ sql: string; timestamp: number }>): { detected: boolean; pattern?: string; count: number } {
    const tableQueries = new Map<string, number>();

    for (const q of queryLog) {
      // 简化检测：同一张表的多次点查
      const match = q.sql.match(/SELECT.*FROM\s+(\w+).*WHERE.*=\s*\?/i);
      if (match) {
        const table = match[1];
        tableQueries.set(table, (tableQueries.get(table) ?? 0) + 1);
      }
    }

    for (const [table, count] of tableQueries) {
      if (count > 5) {
        return {
          detected: true,
          pattern: `对表 "${table}" 的 ${count} 次点查，疑似 N+1 问题`,
          count,
        };
      }
    }

    return { detected: false, count: 0 };
  }
}

// ============================================================================
// 2. 索引设计策略
// ============================================================================

export interface IndexDesign {
  name: string;
  table: string;
  columns: Array<{ name: string; order: 'asc' | 'desc' }>;
  type: 'btree' | 'hash' | 'gin' | 'gist';
  unique?: boolean;
  partialCondition?: string;
  reason: string;
}

export class IndexDesigner {
  private indexes: IndexDesign[] = [];

  /** 为 WHERE 条件设计单列索引 */
  addWhereIndex(table: string, column: string, selectivity: number): void {
    if (selectivity < 0.01) {
      // 低选择性（如性别字段），不建议单独索引
      return;
    }
    this.indexes.push({
      name: `idx_${table}_${column}`,
      table,
      columns: [{ name: column, order: 'asc' }],
      type: 'btree',
      reason: `WHERE ${column} = ? 查询优化，选择性 ${(selectivity * 100).toFixed(2)}%`,
    });
  }

  /** 为复合查询设计联合索引 */
  addCompositeIndex(table: string, columns: string[], reason: string): void {
    this.indexes.push({
      name: `idx_${table}_${columns.join('_')}`,
      table,
      columns: columns.map((c) => ({ name: c, order: 'asc' })),
      type: 'btree',
      reason,
    });
  }

  /** 为排序设计索引 */
  addOrderByIndex(table: string, columns: string[], reason: string): void {
    this.indexes.push({
      name: `idx_${table}_${columns.join('_')}_order`,
      table,
      columns: columns.map((c) => ({ name: c, order: 'asc' })),
      type: 'btree',
      reason: `ORDER BY ${columns.join(', ')} 优化: ${reason}`,
    });
  }

  /** 为覆盖索引设计 */
  addCoveringIndex(table: string, whereColumns: string[], selectColumns: string[], reason: string): void {
    const allColumns = [...new Set([...whereColumns, ...selectColumns])];
    this.indexes.push({
      name: `idx_${table}_${whereColumns.join('_')}_cover`,
      table,
      columns: allColumns.map((c) => ({ name: c, order: 'asc' })),
      type: 'btree',
      reason: `覆盖索引（Index-Only Scan）: ${reason}`,
    });
  }

  /** 为全文搜索设计 GIN 索引 */
  addFullTextIndex(table: string, column: string): void {
    this.indexes.push({
      name: `idx_${table}_${column}_fts`,
      table,
      columns: [{ name: column, order: 'asc' }],
      type: 'gin',
      reason: `全文搜索优化: ${column}`,
    });
  }

  getIndexes(): IndexDesign[] {
    return this.indexes;
  }

  generateDDL(): string {
    return this.indexes.map((idx) => {
      const cols = idx.columns.map((c) => `${c.name} ${c.order.toUpperCase()}`).join(', ');
      const unique = idx.unique ? 'UNIQUE ' : '';
      const partial = idx.partialCondition ? ` WHERE ${idx.partialCondition}` : '';
      return `CREATE ${unique}INDEX ${idx.name} ON ${idx.table} USING ${idx.type} (${cols})${partial}; -- ${idx.reason}`;
    }).join('\n');
  }
}

// ============================================================================
// 3. 连接池管理
// ============================================================================

export interface PoolConfig {
  minConnections: number;
  maxConnections: number;
  maxIdleTime: number;        // ms
  connectionTimeout: number;  // ms
  acquireTimeout: number;     // ms
  retryAttempts: number;
  healthCheckInterval: number; // ms
}

export interface PoolStats {
  total: number;
  active: number;
  idle: number;
  waiting: number;
  maxWaitTime: number;
  avgQueryTime: number;
}

export class ConnectionPool {
  private connections: Array<{ id: string; active: boolean; lastUsed: number; createdAt: number }> = [];
  private waitingQueue: Array<(conn: string) => void> = [];
  private stats: PoolStats = { total: 0, active: 0, idle: 0, waiting: 0, maxWaitTime: 0, avgQueryTime: 0 };

  constructor(private config: PoolConfig) {
    this.initialize();
  }

  private initialize(): void {
    for (let i = 0; i < this.config.minConnections; i++) {
      this.createConnection();
    }
    this.startHealthCheck();
  }

  private createConnection(): void {
    const conn = {
      id: `conn_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
      active: false,
      lastUsed: Date.now(),
      createdAt: Date.now(),
    };
    this.connections.push(conn);
    this.stats.total++;
  }

  /** 获取连接 */
  async acquire(): Promise<string> {
    const idle = this.connections.find((c) => !c.active);
    if (idle) {
      idle.active = true;
      idle.lastUsed = Date.now();
      this.updateStats();
      return idle.id;
    }

    if (this.connections.length < this.config.maxConnections) {
      this.createConnection();
      const newConn = this.connections[this.connections.length - 1];
      newConn.active = true;
      newConn.lastUsed = Date.now();
      this.updateStats();
      return newConn.id;
    }

    // 等待可用连接
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('获取连接超时'));
      }, this.config.acquireTimeout);

      this.waitingQueue.push((connId: string) => {
        clearTimeout(timeout);
        resolve(connId);
      });
    });
  }

  /** 释放连接 */
  release(connectionId: string): void {
    const conn = this.connections.find((c) => c.id === connectionId);
    if (!conn) return;

    conn.active = false;
    conn.lastUsed = Date.now();

    // 服务等待队列
    if (this.waitingQueue.length > 0) {
      const waiter = this.waitingQueue.shift()!;
      conn.active = true;
      waiter(conn.id);
    }

    this.updateStats();
  }

  /** 执行查询（自动管理连接） */
  async query<T>(sql: string, params: unknown[]): Promise<T[]> {
    const conn = await this.acquire();
    const start = performance.now();

    try {
      // 模拟查询执行
      console.log(`[DB] ${conn} executing: ${sql.slice(0, 80)}...`);
      return [] as T[];
    } finally {
      const elapsed = performance.now() - start;
      this.stats.avgQueryTime = this.stats.avgQueryTime * 0.9 + elapsed * 0.1;
      this.release(conn);
    }
  }

  private startHealthCheck(): void {
    setInterval(() => {
      const now = Date.now();
      // 清理超时空闲连接
      this.connections = this.connections.filter((c) => {
        if (!c.active && now - c.lastUsed > this.config.maxIdleTime) {
          if (this.connections.length > this.config.minConnections) {
            this.stats.total--;
            return false;
          }
        }
        return true;
      });
      this.updateStats();
    }, this.config.healthCheckInterval);
  }

  getStats(): PoolStats {
    return { ...this.stats };
  }

  private updateStats(): void {
    this.stats.active = this.connections.filter((c) => c.active).length;
    this.stats.idle = this.connections.filter((c) => !c.active).length;
    this.stats.waiting = this.waitingQueue.length;
  }
}

// ============================================================================
// 4. 缓存策略
// ============================================================================

export interface CacheConfig {
  ttl: number;          // ms
  maxSize: number;
  strategy: 'lru' | 'lfu' | 'fifo';
}

export interface CacheEntry<T> {
  value: T;
  createdAt: number;
  accessCount: number;
  lastAccessed: number;
}

/** 应用层缓存 */
export class ApplicationCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private config: CacheConfig;

  constructor(config: CacheConfig) {
    this.config = config;
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    if (Date.now() - entry.createdAt > this.config.ttl) {
      this.cache.delete(key);
      return undefined;
    }

    entry.accessCount++;
    entry.lastAccessed = Date.now();
    return entry.value;
  }

  set(key: string, value: T): void {
    if (this.cache.size >= this.config.maxSize) {
      this.evict();
    }

    this.cache.set(key, {
      value,
      createdAt: Date.now(),
      accessCount: 1,
      lastAccessed: Date.now(),
    });
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  private evict(): void {
    if (this.cache.size === 0) return;

    let keyToEvict: string | undefined;

    switch (this.config.strategy) {
      case 'lru': {
        let oldest = Infinity;
        for (const [key, entry] of this.cache) {
          if (entry.lastAccessed < oldest) {
            oldest = entry.lastAccessed;
            keyToEvict = key;
          }
        }
        break;
      }
      case 'lfu': {
        let leastUsed = Infinity;
        for (const [key, entry] of this.cache) {
          if (entry.accessCount < leastUsed) {
            leastUsed = entry.accessCount;
            keyToEvict = key;
          }
        }
        break;
      }
      case 'fifo': {
        let oldest = Infinity;
        for (const [key, entry] of this.cache) {
          if (entry.createdAt < oldest) {
            oldest = entry.createdAt;
            keyToEvict = key;
          }
        }
        break;
      }
    }

    if (keyToEvict) {
      this.cache.delete(keyToEvict);
    }
  }

  getStats(): { size: number; hitRate: number; missRate: number } {
    return {
      size: this.cache.size,
      hitRate: 0, // 需要外部统计
      missRate: 0,
    };
  }
}

// ============================================================================
// 5. 多级缓存策略协调器
// ============================================================================

export class MultiTierCache<T> {
  private l1: ApplicationCache<T>;  // 内存
  private l2?: ApplicationCache<T>; // 进程内二级（可选）

  constructor(l1Config: CacheConfig, l2Config?: CacheConfig) {
    this.l1 = new ApplicationCache<T>(l1Config);
    if (l2Config) {
      this.l2 = new ApplicationCache<T>(l2Config);
    }
  }

  async get(key: string, fetcher: () => Promise<T>): Promise<T> {
    // L1 查询
    const l1Value = this.l1.get(key);
    if (l1Value !== undefined) return l1Value;

    // L2 查询
    if (this.l2) {
      const l2Value = this.l2.get(key);
      if (l2Value !== undefined) {
        this.l1.set(key, l2Value); // 回填 L1
        return l2Value;
      }
    }

    // 回源
    const value = await fetcher();
    this.l1.set(key, value);
    this.l2?.set(key, value);
    return value;
  }

  invalidate(key: string): void {
    this.l1.delete(key);
    this.l2?.delete(key);
  }

  invalidatePattern(pattern: RegExp): void {
    for (const key of this.l1['cache'].keys()) {
      if (pattern.test(key)) this.l1.delete(key);
    }
    if (this.l2) {
      for (const key of this.l2['cache'].keys()) {
        if (pattern.test(key)) this.l2.delete(key);
      }
    }
  }
}

// ============================================================================
// 6. 演示
// ============================================================================

export function demo(): void {
  console.log('=== 数据库性能优化 ===\n');

  // 查询分析
  console.log('--- 查询分析 ---');
  const analyzer = new QueryAnalyzer();
  const plan: QueryPlan = {
    sql: 'SELECT * FROM orders WHERE status = ? ORDER BY created_at DESC',
    estimatedCost: 15000,
    estimatedRows: 5000,
    actualTime: 320,
    actualRows: 50,
    scans: [
      { type: 'seq', table: 'orders', rowsScanned: 500000, rowsReturned: 50, condition: 'status = ?' },
    ],
    sortOperations: 1,
  };
  const analysis = analyzer.analyze(plan.sql, plan);
  console.log('慢查询:', analysis.isSlow);
  console.log('优化建议:', analysis.suggestions);

  // 索引设计
  console.log('\n--- 索引设计 ---');
  const designer = new IndexDesigner();
  designer.addWhereIndex('orders', 'status', 0.3);
  designer.addCompositeIndex('orders', ['status', 'created_at'], 'WHERE status = ? ORDER BY created_at DESC');
  designer.addCoveringIndex('orders', ['status'], ['id', 'total', 'created_at'], '避免回表查询');
  console.log(designer.generateDDL());

  // 连接池
  console.log('\n--- 连接池 ---');
  const pool = new ConnectionPool({
    minConnections: 2,
    maxConnections: 10,
    maxIdleTime: 30000,
    connectionTimeout: 5000,
    acquireTimeout: 3000,
    retryAttempts: 3,
    healthCheckInterval: 10000,
  });
  console.log('连接池统计:', pool.getStats());

  // 缓存
  console.log('\n--- 应用层缓存 ---');
  const cache = new ApplicationCache<string>({ ttl: 60000, maxSize: 100, strategy: 'lru' });
  cache.set('user:1001', '{"name":"Alice"}');
  cache.set('user:1002', '{"name":"Bob"}');
  console.log('缓存命中:', cache.get('user:1001'));
  console.log('缓存未命中:', cache.get('user:9999'));
}
