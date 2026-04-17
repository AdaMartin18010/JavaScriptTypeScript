/**
 * @file 分布式锁（内存模拟版）
 * @category Distributed Systems → Coordination
 * @difficulty medium
 * @tags distributed-lock, mutex, lease, ttl, coordination
 *
 * @description
 * 分布式锁用于在分布式环境中协调对共享资源的访问。本实现为教学级内存模拟，
 * 演示了基于租约（lease/TTL）的锁机制、防死锁的超时释放以及可重入性检测。
 *
 * 核心概念：
 * - Lease/TTL：锁持有者在超时后自动释放，防止死锁
 * - Owner Tag：标识锁的持有者，确保只能由持有者释放
 * - Retry with Backoff：获取失败时支持有限次重试
 */

export interface LockOptions {
  /** 锁的自动过期时间（毫秒） */
  ttlMs: number;
  /** 获取失败时的最大重试次数 */
  maxRetries: number;
  /** 每次重试的间隔（毫秒） */
  retryDelayMs: number;
}

export interface LockRecord {
  owner: string;
  expiry: number;
  count: number; // 可重入计数
}

export class DistributedLock {
  private locks = new Map<string, LockRecord>();
  private readonly options: Required<LockOptions>;

  constructor(options: Partial<LockOptions> = {}) {
    this.options = {
      ttlMs: options.ttlMs ?? 5000,
      maxRetries: options.maxRetries ?? 3,
      retryDelayMs: options.retryDelayMs ?? 100
    };
  }

  /**
   * 尝试获取分布式锁
   * @param resource - 资源标识
   * @param owner - 锁持有者标识
   * @returns 是否成功获取
   */
  async acquire(resource: string, owner: string): Promise<boolean> {
    for (let attempt = 0; attempt <= this.options.maxRetries; attempt++) {
      const now = Date.now();
      const record = this.locks.get(resource);

      if (!record || now > record.expiry) {
        // 锁空闲或已过期，直接获取
        this.locks.set(resource, {
          owner,
          expiry: now + this.options.ttlMs,
          count: 1
        });
        return true;
      }

      if (record.owner === owner) {
        // 可重入
        record.count++;
        record.expiry = now + this.options.ttlMs;
        return true;
      }

      if (attempt < this.options.maxRetries) {
        await this.delay(this.options.retryDelayMs);
      }
    }

    return false;
  }

  /**
   * 释放分布式锁
   * @param resource - 资源标识
   * @param owner - 锁持有者标识
   * @returns 是否成功释放
   */
  release(resource: string, owner: string): boolean {
    const record = this.locks.get(resource);
    if (!record) return false;

    if (record.owner !== owner) {
      throw new Error(`Lock release failed: ${owner} is not the owner of ${resource}`);
    }

    record.count--;
    if (record.count <= 0) {
      this.locks.delete(resource);
    }

    return true;
  }

  /**
   * 强制释放（用于管理员清理或超时后的兜底）
   * @param resource - 资源标识
   */
  forceRelease(resource: string): void {
    this.locks.delete(resource);
  }

  /**
   * 查询锁状态
   * @param resource - 资源标识
   */
  isLocked(resource: string): boolean {
    const record = this.locks.get(resource);
    if (!record) return false;
    return Date.now() <= record.expiry;
  }

  /**
   * 获取锁的持有者
   * @param resource - 资源标识
   */
  getOwner(resource: string): string | undefined {
    const record = this.locks.get(resource);
    if (!record || Date.now() > record.expiry) return undefined;
    return record.owner;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export function demo(): void {
  console.log('=== 分布式锁 ===\n');

  const lock = new DistributedLock({ ttlMs: 2000, maxRetries: 2, retryDelayMs: 50 });

  async function run() {
    const r1 = await lock.acquire('order:1001', 'service-a');
    console.log('service-a 获取锁:', r1);

    const r2 = await lock.acquire('order:1001', 'service-b');
    console.log('service-b 获取锁:', r2);

    // 可重入
    const r3 = await lock.acquire('order:1001', 'service-a');
    console.log('service-a 重入锁:', r3);

    lock.release('order:1001', 'service-a');
    lock.release('order:1001', 'service-a');

    console.log('释放后是否锁定:', lock.isLocked('order:1001'));
  }

  run();
}
