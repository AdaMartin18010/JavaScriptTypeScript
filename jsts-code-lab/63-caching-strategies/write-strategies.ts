/**
 * @file 写缓存策略
 * @category Caching → Write Strategies
 * @difficulty medium
 * @tags write-through, write-behind, write-around
 *
 * @description
 * 写缓存策略实现：Write Through、Write Behind (Write Back)、Write Around
 */

// ============================================================================
// 类型定义
// ============================================================================

export interface StorageAdapter<T> {
  get(key: string): Promise<T | null> | T | null;
  set(key: string, value: T): Promise<void> | void;
  delete(key: string): Promise<void> | void;
}

export interface WriteStrategyOptions {
  writeQueueSize?: number;
  flushInterval?: number;
  retryAttempts?: number;
}

// ============================================================================
// Write Through 模式
// 同时写入缓存和数据源
// ============================================================================

export class WriteThroughCache<T> {
  private stats = { writes: 0, writeErrors: 0 };

  constructor(
    private cache: StorageAdapter<T>,
    private dataSource: StorageAdapter<T>
  ) {}

  /**
   * 读取数据
   */
  async get(key: string): Promise<T | null> {
    // 先查缓存
    const cached = await this.cache.get(key);
    if (cached !== null && cached !== undefined) {
      return cached;
    }

    // 缓存未命中，查数据源
    const data = await this.dataSource.get(key);
    
    // 回填缓存
    if (data !== null) {
      await this.cache.set(key, data);
    }

    return data;
  }

  /**
   * 写入数据（同步写入缓存和数据源）
   */
  async set(key: string, value: T): Promise<void> {
    try {
      // 同时写入缓存和数据源
      await Promise.all([
        this.cache.set(key, value),
        this.dataSource.set(key, value)
      ]);
      
      this.stats.writes++;
    } catch (error) {
      this.stats.writeErrors++;
      throw error;
    }
  }

  /**
   * 删除数据
   */
  async delete(key: string): Promise<void> {
    await Promise.all([
      this.cache.delete(key),
      this.dataSource.delete(key)
    ]);
  }

  getStats(): typeof this.stats {
    return { ...this.stats };
  }
}

// ============================================================================
// Write Behind (Write Back) 模式
// 先写缓存，异步批量写入数据源
// ============================================================================

interface PendingWrite<T> {
  key: string;
  value: T | null; // null 表示删除
  timestamp: number;
  attempts: number;
}

export class WriteBehindCache<T> {
  private writeQueue: Map<string, PendingWrite<T>> = new Map();
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private stats = { 
    writes: 0, 
    asyncWrites: 0, 
    writeErrors: 0,
    queueSize: 0 
  };

  constructor(
    private cache: StorageAdapter<T>,
    private dataSource: StorageAdapter<T>,
    private options: WriteStrategyOptions = {}
  ) {
    this.options = {
      writeQueueSize: 100,
      flushInterval: 5000, // 5秒
      retryAttempts: 3,
      ...options
    };

    this.startFlushTimer();
  }

  /**
   * 启动定时刷盘
   */
  startFlushTimer(): void {
    if (this.flushTimer) return;
    
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.options.flushInterval);
  }

  /**
   * 停止定时刷盘
   */
  stopFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }

  /**
   * 读取数据
   */
  async get(key: string): Promise<T | null> {
    // 先查缓存
    const cached = await this.cache.get(key);
    if (cached !== null && cached !== undefined) {
      return cached;
    }

    // 检查写队列中是否有待写入的数据
    const pending = this.writeQueue.get(key);
    if (pending) {
      return pending.value;
    }

    // 查数据源
    return await this.dataSource.get(key);
  }

  /**
   * 写入数据（异步写入数据源）
   */
  async set(key: string, value: T): Promise<void> {
    // 1. 立即写入缓存
    await this.cache.set(key, value);

    // 2. 加入写队列
    this.writeQueue.set(key, {
      key,
      value,
      timestamp: Date.now(),
      attempts: 0
    });

    this.stats.writes++;
    this.stats.queueSize = this.writeQueue.size;

    // 3. 检查是否需要立即刷盘
    if (this.writeQueue.size >= (this.options.writeQueueSize || 100)) {
      await this.flush();
    }
  }

  /**
   * 删除数据
   */
  async delete(key: string): Promise<void> {
    // 1. 立即删除缓存
    await this.cache.delete(key);

    // 2. 加入写队列（标记为删除）
    this.writeQueue.set(key, {
      key,
      value: null,
      timestamp: Date.now(),
      attempts: 0
    });

    this.stats.queueSize = this.writeQueue.size;
  }

  /**
   * 强制刷盘
   */
  async flush(): Promise<void> {
    if (this.writeQueue.size === 0) return;

    const writes = Array.from(this.writeQueue.values());
    this.writeQueue.clear();
    this.stats.queueSize = 0;

    for (const write of writes) {
      try {
        if (write.value === null) {
          await this.dataSource.delete(write.key);
        } else {
          await this.dataSource.set(write.key, write.value);
        }
        this.stats.asyncWrites++;
      } catch (error) {
        write.attempts++;
        
        if (write.attempts < (this.options.retryAttempts || 3)) {
          // 重新入队
          this.writeQueue.set(write.key, write);
        } else {
          this.stats.writeErrors++;
          console.error(`[WriteBehind] Failed to write ${write.key} after ${write.attempts} attempts`);
        }
      }
    }
  }

  /**
   * 获取统计
   */
  getStats(): typeof this.stats {
    return { ...this.stats, queueSize: this.writeQueue.size };
  }
}

// ============================================================================
// Write Around 模式
// 写入时绕过缓存，直接写入数据源
// ============================================================================

export class WriteAroundCache<T> {
  private stats = { writes: 0, cacheMisses: 0 };

  constructor(
    private cache: StorageAdapter<T>,
    private dataSource: StorageAdapter<T>
  ) {}

  /**
   * 读取数据
   */
  async get(key: string): Promise<T | null> {
    // 先查缓存
    const cached = await this.cache.get(key);
    if (cached !== null && cached !== undefined) {
      return cached;
    }

    this.stats.cacheMisses++;

    // 缓存未命中，查数据源
    const data = await this.dataSource.get(key);
    
    // 回填缓存
    if (data !== null) {
      await this.cache.set(key, data);
    }

    return data;
  }

  /**
   * 写入数据（绕过缓存，直接写入数据源）
   */
  async set(key: string, value: T): Promise<void> {
    // 直接写入数据源
    await this.dataSource.set(key, value);
    this.stats.writes++;

    // 可选：使缓存失效或更新缓存
    // await this.cache.delete(key); // 使缓存失效
    await this.cache.set(key, value); // 更新缓存
  }

  /**
   * 删除数据
   */
  async delete(key: string): Promise<void> {
    await this.dataSource.delete(key);
    await this.cache.delete(key);
  }
}

// ============================================================================
// 批量写入优化
// ============================================================================

export class BatchWriteCache<T> {
  private batch: Array<{ key: string; value: T }> = [];
  private flushTimer: ReturnType<typeof setTimeout> | null = null;
  private maxBatchSize: number;
  private flushDelay: number;

  constructor(
    private cache: StorageAdapter<T>,
    private dataSource: StorageAdapter<T>,
    options: { maxBatchSize?: number; flushDelay?: number } = {}
  ) {
    this.maxBatchSize = options.maxBatchSize || 100;
    this.flushDelay = options.flushDelay || 100;
  }

  /**
   * 批量写入
   */
  async set(key: string, value: T): Promise<void> {
    // 立即更新缓存
    await this.cache.set(key, value);

    // 加入批量队列
    this.batch.push({ key, value });

    // 检查是否需要立即刷盘
    if (this.batch.length >= this.maxBatchSize) {
      await this.flush();
    } else {
      // 延迟刷盘
      this.scheduleFlush();
    }
  }

  /**
   * 强制刷盘
   */
  async flush(): Promise<void> {
    if (this.batch.length === 0) return;

    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }

    const operations = [...this.batch];
    this.batch = [];

    // 批量写入数据源
    for (const { key, value } of operations) {
      await this.dataSource.set(key, value);
    }
  }

  private scheduleFlush(): void {
    if (this.flushTimer) return;

    this.flushTimer = setTimeout(() => {
      this.flush();
    }, this.flushDelay);
  }
}

// ============================================================================
// 使用示例
// ============================================================================

export async function demo(): Promise<void> {
  console.log('=== 写缓存策略演示 ===\n');

  // 模拟存储
  const memoryCache = new Map<string, string>();
  const database = new Map<string, string>();

  const cacheAdapter: StorageAdapter<string> = {
    get: async (k) => memoryCache.get(k) || null,
    set: async (k, v) => { memoryCache.set(k, v); },
    delete: async (k) => { memoryCache.delete(k); }
  };

  const dbAdapter: StorageAdapter<string> = {
    get: async (k) => database.get(k) || null,
    set: async (k, v) => { 
      await new Promise(r => setTimeout(r, 10)); // 模拟延迟
      database.set(k, v);
    },
    delete: async (k) => { database.delete(k); }
  };

  // 1. Write Through
  console.log('--- Write Through ---');
  const writeThrough = new WriteThroughCache(cacheAdapter, dbAdapter);
  
  await writeThrough.set('key-1', 'value-1');
  console.log(`  Cache: ${memoryCache.get('key-1')}`);
  console.log(`  Database: ${database.get('key-1')}`);
  console.log(`  Stats: ${JSON.stringify(writeThrough.getStats())}`);

  // 2. Write Behind
  console.log('\n--- Write Behind ---');
  const writeBehind = new WriteBehindCache(cacheAdapter, dbAdapter, {
    flushInterval: 1000
  });

  await writeBehind.set('key-2', 'value-2');
  console.log(`  Cache: ${memoryCache.get('key-2')}`);
  console.log(`  Database (before flush): ${database.get('key-2') || 'not written yet'}`);
  console.log(`  Queue size: ${writeBehind.getStats().queueSize}`);

  await writeBehind.flush();
  console.log(`  Database (after flush): ${database.get('key-2')}`);

  // 3. Write Around
  console.log('\n--- Write Around ---');
  const writeAround = new WriteAroundCache(cacheAdapter, dbAdapter);

  await writeAround.set('key-3', 'value-3');
  console.log(`  Database: ${database.get('key-3')}`);
  console.log(`  Cache (updated): ${memoryCache.get('key-3')}`);

  console.log('\n--- 策略对比 ---');
  console.log(`  Write Through: 强一致性，高延迟`);
  console.log(`  Write Behind: 最终一致性，低延迟，有数据丢失风险`);
  console.log(`  Write Around: 适合写多读少场景`);
}
