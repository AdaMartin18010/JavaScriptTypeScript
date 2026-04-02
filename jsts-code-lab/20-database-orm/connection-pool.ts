/**
 * @file 数据库连接池
 * @category Database → Connection Pool
 * @difficulty medium
 * @tags connection-pool, database, pooling, resource-management
 * 
 * @description
 * 数据库连接池实现：
 * - 连接复用
 * - 健康检查
 * - 动态扩缩容
 * - 等待队列
 */

// ============================================================================
// 1. 连接池配置
// ============================================================================

export interface PoolConfig {
  minConnections: number;
  maxConnections: number;
  acquireTimeout: number;
  idleTimeout: number;
  maxLifetime: number;
  healthCheckInterval: number;
  connectionTimeout: number;
}

export const DefaultPoolConfig: PoolConfig = {
  minConnections: 5,
  maxConnections: 20,
  acquireTimeout: 30000,      // 30秒
  idleTimeout: 600000,        // 10分钟
  maxLifetime: 1800000,       // 30分钟
  healthCheckInterval: 30000, // 30秒
  connectionTimeout: 5000     // 5秒
};

// ============================================================================
// 2. 池化连接
// ============================================================================

export interface PooledConnection {
  id: string;
  createdAt: Date;
  lastUsedAt: Date;
  useCount: number;
  isHealthy: boolean;
  isInUse: boolean;
  metadata: {
    host: string;
    database: string;
  };
}

// 模拟连接工厂
export interface ConnectionFactory {
  create(): Promise<PooledConnection>;
  validate(conn: PooledConnection): Promise<boolean>;
  destroy(conn: PooledConnection): Promise<void>;
}

// ============================================================================
// 3. 连接池实现
// ============================================================================

export class ConnectionPool {
  private config: PoolConfig;
  private factory: ConnectionFactory;
  
  private connections: PooledConnection[] = [];
  private availableConnections: PooledConnection[] = [];
  private waitQueue: Array<{
    resolve: (conn: PooledConnection) => void;
    reject: (error: Error) => void;
    timeout: ReturnType<typeof setTimeout>;
  }> = [];
  
  private stats = {
    totalCreated: 0,
    totalDestroyed: 0,
    totalAcquired: 0,
    totalReleased: 0,
    totalWaited: 0,
    totalTimeouts: 0
  };

  private maintenanceInterval: ReturnType<typeof setInterval> | null = null;
  private isShuttingDown = false;

  constructor(factory: ConnectionFactory, config: Partial<PoolConfig> = {}) {
    this.factory = factory;
    this.config = { ...DefaultPoolConfig, ...config };
    this.startMaintenance();
  }

  // 初始化连接池
  async initialize(): Promise<void> {
    console.log(`Initializing pool with ${this.config.minConnections} connections...`);
    
    const createPromises: Promise<void | PooledConnection>[] = [];
    for (let i = 0; i < this.config.minConnections; i++) {
      createPromises.push(this.createConnection());
    }
    
    await Promise.all(createPromises);
    console.log('Pool initialized successfully');
  }

  // 获取连接
  async acquire(): Promise<PooledConnection> {
    if (this.isShuttingDown) {
      throw new Error('Pool is shutting down');
    }

    this.stats.totalAcquired++;

    // 1. 尝试获取可用连接
    const available = this.getAvailableConnection();
    if (available) {
      return this.markInUse(available);
    }

    // 2. 尝试创建新连接
    if (this.connections.length < this.config.maxConnections) {
      const conn = await this.createConnection();
      return this.markInUse(conn);
    }

    // 3. 加入等待队列
    return this.waitForConnection();
  }

  // 释放连接
  async release(connection: PooledConnection): Promise<void> {
    const index = this.connections.findIndex(c => c.id === connection.id);
    if (index === -1) {
      throw new Error('Connection not found in pool');
    }

    connection.isInUse = false;
    connection.lastUsedAt = new Date();
    this.stats.totalReleased++;

    // 优先分配给等待队列
    const waiter = this.waitQueue.shift();
    if (waiter) {
      clearTimeout(waiter.timeout);
      connection.isInUse = true;
      waiter.resolve(connection);
      return;
    }

    // 放回可用队列
    this.availableConnections.push(connection);
  }

  // 获取连接池统计
  getStats(): PoolStats {
    const inUse = this.connections.filter(c => c.isInUse).length;
    const idle = this.availableConnections.length;
    
    return {
      ...this.stats,
      totalConnections: this.connections.length,
      activeConnections: inUse,
      idleConnections: idle,
      waitingRequests: this.waitQueue.length,
      utilizationRate: this.connections.length > 0 
        ? (inUse / this.connections.length) * 100 
        : 0
    };
  }

  // 关闭连接池
  async shutdown(): Promise<void> {
    this.isShuttingDown = true;
    
    if (this.maintenanceInterval) {
      clearInterval(this.maintenanceInterval);
    }

    // 拒绝所有等待的请求
    while (this.waitQueue.length > 0) {
      const waiter = this.waitQueue.shift()!;
      clearTimeout(waiter.timeout);
      waiter.reject(new Error('Pool is shutting down'));
    }

    // 关闭所有连接
    const closePromises = this.connections.map(conn => 
      this.factory.destroy(conn)
    );
    await Promise.all(closePromises);
    
    this.connections = [];
    this.availableConnections = [];
    
    console.log('Pool shutdown complete');
  }

  // 清空连接池（用于测试或重置）
  async clear(): Promise<void> {
    await this.shutdown();
    this.isShuttingDown = false;
    this.stats = {
      totalCreated: 0,
      totalDestroyed: 0,
      totalAcquired: 0,
      totalReleased: 0,
      totalWaited: 0,
      totalTimeouts: 0
    };
  }

  private async createConnection(): Promise<PooledConnection> {
    const conn = await this.factory.create();
    this.connections.push(conn);
    this.availableConnections.push(conn);
    this.stats.totalCreated++;
    return conn;
  }

  private getAvailableConnection(): PooledConnection | null {
    // 清理过期连接
    while (this.availableConnections.length > 0) {
      const conn = this.availableConnections[0];
      
      if (!this.isConnectionValid(conn)) {
        this.availableConnections.shift();
        this.removeConnection(conn);
        continue;
      }
      
      return this.availableConnections.shift()!;
    }
    
    return null;
  }

  private isConnectionValid(conn: PooledConnection): boolean {
    const now = Date.now();
    const age = now - conn.createdAt.getTime();
    const idleTime = now - conn.lastUsedAt.getTime();
    
    // 检查最大生命周期
    if (age > this.config.maxLifetime) {
      return false;
    }
    
    // 检查空闲超时
    if (idleTime > this.config.idleTimeout) {
      return false;
    }
    
    // 健康检查
    return conn.isHealthy;
  }

  private markInUse(connection: PooledConnection): PooledConnection {
    connection.isInUse = true;
    connection.lastUsedAt = new Date();
    connection.useCount++;
    return connection;
  }

  private waitForConnection(): Promise<PooledConnection> {
    return new Promise((resolve, reject) => {
      this.stats.totalWaited++;
      
      const timeout = setTimeout(() => {
        const index = this.waitQueue.findIndex(w => w.resolve === resolve);
        if (index > -1) {
          this.waitQueue.splice(index, 1);
        }
        this.stats.totalTimeouts++;
        reject(new Error('Connection acquisition timeout'));
      }, this.config.acquireTimeout);

      this.waitQueue.push({ resolve, reject, timeout });
    });
  }

  private async removeConnection(conn: PooledConnection): Promise<void> {
    const index = this.connections.indexOf(conn);
    if (index > -1) {
      this.connections.splice(index, 1);
    }
    
    await this.factory.destroy(conn);
    this.stats.totalDestroyed++;
  }

  private startMaintenance(): void {
    this.maintenanceInterval = setInterval(async () => {
      await this.performMaintenance();
    }, this.config.healthCheckInterval);
  }

  private async performMaintenance(): Promise<void> {
    // 1. 健康检查所有连接
    for (const conn of this.connections) {
      if (conn.isInUse) continue;
      
      const isHealthy = await this.factory.validate(conn);
      conn.isHealthy = isHealthy;
      
      if (!isHealthy) {
        await this.removeConnection(conn);
      }
    }

    // 2. 确保最小连接数
    const deficit = this.config.minConnections - this.connections.length;
    if (deficit > 0) {
      const createPromises: Promise<void>[] = [];
      for (let i = 0; i < deficit; i++) {
        createPromises.push(this.createConnection().then(() => {}));
      }
      await Promise.all(createPromises);
    }

    // 3. 清理过期连接
    for (const conn of [...this.connections]) {
      if (conn.isInUse) continue;
      
      const age = Date.now() - conn.createdAt.getTime();
      if (age > this.config.maxLifetime) {
        await this.removeConnection(conn);
      }
    }
  }
}

// ============================================================================
// 4. 连接池统计
// ============================================================================

export interface PoolStats {
  totalCreated: number;
  totalDestroyed: number;
  totalAcquired: number;
  totalReleased: number;
  totalWaited: number;
  totalTimeouts: number;
  totalConnections: number;
  activeConnections: number;
  idleConnections: number;
  waitingRequests: number;
  utilizationRate: number;
}

// ============================================================================
// 5. 模拟连接工厂
// ============================================================================

export class MockConnectionFactory implements ConnectionFactory {
  private counter = 0;

  async create(): Promise<PooledConnection> {
    // 模拟连接创建延迟
    await this.delay(10);
    
    this.counter++;
    return {
      id: `conn-${this.counter}`,
      createdAt: new Date(),
      lastUsedAt: new Date(),
      useCount: 0,
      isHealthy: true,
      isInUse: false,
      metadata: {
        host: 'localhost',
        database: 'test'
      }
    };
  }

  async validate(conn: PooledConnection): Promise<boolean> {
    // 模拟验证延迟
    await this.delay(5);
    return conn.isHealthy;
  }

  async destroy(conn: PooledConnection): Promise<void> {
    // 模拟关闭延迟
    await this.delay(5);
    console.log(`  Connection ${conn.id} destroyed`);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ============================================================================
// 6. 使用示例
// ============================================================================

export async function demo(): Promise<void> {
  console.log('=== 数据库连接池 ===\n');

  const factory = new MockConnectionFactory();
  const pool = new ConnectionPool(factory, {
    minConnections: 3,
    maxConnections: 10,
    acquireTimeout: 5000
  });

  console.log('1. 初始化连接池');
  await pool.initialize();
  console.log('   Stats:', pool.getStats());

  console.log('\n2. 获取连接');
  const conn1 = await pool.acquire();
  const conn2 = await pool.acquire();
  console.log('   Acquired:', conn1.id, conn2.id);
  console.log('   Stats:', pool.getStats());

  console.log('\n3. 释放连接');
  await pool.release(conn1);
  console.log('   Released:', conn1.id);
  console.log('   Stats:', pool.getStats());

  console.log('\n4. 获取已释放的连接（复用）');
  const conn3 = await pool.acquire();
  console.log('   Reused:', conn3.id);
  console.log('   Stats:', pool.getStats());

  console.log('\n5. 清理');
  await pool.release(conn2);
  await pool.release(conn3);
  await pool.shutdown();
  console.log('   Final stats:', pool.getStats());

  console.log('\n连接池要点:');
  console.log('- 连接复用：避免频繁创建/销毁连接的开销');
  console.log('- 连接限制：防止数据库过载');
  console.log('- 健康检查：自动检测和替换无效连接');
  console.log('- 等待队列：连接不足时排队等待');
  console.log('- 生命周期管理：自动回收过期连接');
}

// ============================================================================
// 导出 (已在上面导出)
// ============================================================================
