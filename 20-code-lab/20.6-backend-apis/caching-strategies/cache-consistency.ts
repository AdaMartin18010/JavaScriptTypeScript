/**
 * @file 分布式缓存一致性
 * @category Caching → Consistency
 * @difficulty hard
 * @tags cache, distributed, consistency, invalidation, pub-sub
 *
 * @description
 * 分布式缓存一致性策略：主动失效、延迟双删、最终一致性模型
 */

// ============================================================================
// 类型定义
// ============================================================================

export interface CacheNode {
  id: string;
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
}

export interface InvalidationMessage {
  type: 'invalidate' | 'update';
  key: string;
  value?: string;
  ttl?: number;
  sourceNode: string;
  timestamp: number;
}

export type ConsistencyLevel = 'eventual' | 'strong';

// ============================================================================
// 缓存一致性协调器
// ============================================================================

export class CacheConsistencyCoordinator {
  private nodes = new Map<string, CacheNode>();
  private subscribers = new Set<(msg: InvalidationMessage) => void>();

  /**
   * 注册缓存节点
   */
  registerNode(node: CacheNode): void {
    this.nodes.set(node.id, node);
  }

  /**
   * 订阅失效消息
   */
  subscribe(handler: (msg: InvalidationMessage) => void): () => void {
    this.subscribers.add(handler);
    return () => this.subscribers.delete(handler);
  }

  /**
   * 广播失效消息
   */
  broadcast(message: InvalidationMessage): void {
    for (const handler of this.subscribers) {
      try {
        handler(message);
      } catch {
        // 忽略订阅者错误
      }
    }
  }

  /**
   * 主动失效（Invalidate-After-Write）
   */
  async invalidateAfterWrite(
    sourceNodeId: string,
    key: string,
    writeFn: () => Promise<void>
  ): Promise<void> {
    // 1. 先更新数据源
    await writeFn();

    // 2. 广播失效消息
    this.broadcast({
      type: 'invalidate',
      key,
      sourceNode: sourceNodeId,
      timestamp: Date.now()
    });

    // 3. 删除本地缓存
    const sourceNode = this.nodes.get(sourceNodeId);
    if (sourceNode) {
      await sourceNode.delete(key);
    }
  }

  /**
   * 延迟双删（Delayed Double Delete）
   */
  async delayedDoubleDelete(
    sourceNodeId: string,
    key: string,
    writeFn: () => Promise<void>,
    delayMs = 500
  ): Promise<void> {
    const sourceNode = this.nodes.get(sourceNodeId);

    // 1. 第一次删除缓存
    if (sourceNode) {
      await sourceNode.delete(key);
    }

    // 2. 更新数据源
    await writeFn();

    // 3. 延迟后第二次删除
    await this.sleep(delayMs);

    this.broadcast({
      type: 'invalidate',
      key,
      sourceNode: sourceNodeId,
      timestamp: Date.now()
    });

    if (sourceNode) {
      await sourceNode.delete(key);
    }
  }

  /**
   * 更新后广播新值（Write-Through + Broadcast）
   */
  async updateAndBroadcast(
    sourceNodeId: string,
    key: string,
    value: string,
    ttl?: number
  ): Promise<void> {
    // 1. 更新本地缓存
    const sourceNode = this.nodes.get(sourceNodeId);
    if (sourceNode) {
      await sourceNode.set(key, value, ttl);
    }

    // 2. 广播更新消息
    this.broadcast({
      type: 'update',
      key,
      value,
      ttl,
      sourceNode: sourceNodeId,
      timestamp: Date.now()
    });
  }

  /**
   * 处理失效消息
   */
  async handleInvalidation(nodeId: string, message: InvalidationMessage): Promise<void> {
    // 不处理自己发出的消息
    if (message.sourceNode === nodeId) return;

    const node = this.nodes.get(nodeId);
    if (!node) return;

    if (message.type === 'invalidate') {
      await node.delete(message.key);
    } else if (message.type === 'update' && message.value !== undefined) {
      await node.set(message.key, message.value, message.ttl);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ============================================================================
// 版本向量缓存
// ============================================================================

export interface VersionedValue {
  value: string;
  version: number;
  timestamp: number;
}

export class VersionedCache {
  private data = new Map<string, VersionedValue>();

  /**
   * 获取值（带版本检查）
   */
  get(key: string): VersionedValue | undefined {
    return this.data.get(key);
  }

  /**
   * 设置值（版本号递增）
   */
  set(key: string, value: string): VersionedValue {
    const existing = this.data.get(key);
    const versioned: VersionedValue = {
      value,
      version: (existing?.version ?? 0) + 1,
      timestamp: Date.now()
    };

    this.data.set(key, versioned);
    return versioned;
  }

  /**
   * 合并外部值（基于版本向量）
   */
  merge(key: string, incoming: VersionedValue): boolean {
    const existing = this.data.get(key);

    if (!existing || incoming.version > existing.version) {
      this.data.set(key, incoming);
      return true;
    }

    return false;
  }

  /**
   * 删除值
   */
  delete(key: string): boolean {
    return this.data.delete(key);
  }
}

// ============================================================================
// 使用示例
// ============================================================================

export function demo(): void {
  console.log('=== 分布式缓存一致性 ===\n');

  const coordinator = new CacheConsistencyCoordinator();

  // 模拟两个缓存节点
  const nodeAData = new Map<string, string>();
  const nodeBData = new Map<string, string>();

  const nodeA: CacheNode = {
    id: 'node-a',
    get: async key => nodeAData.get(key) ?? null,
    set: async (key, value) => nodeAData.set(key, value),
    delete: async key => nodeAData.delete(key)
  };

  const nodeB: CacheNode = {
    id: 'node-b',
    get: async key => nodeBData.get(key) ?? null,
    set: async (key, value) => nodeBData.set(key, value),
    delete: async key => nodeBData.delete(key)
  };

  coordinator.registerNode(nodeA);
  coordinator.registerNode(nodeB);

  // 订阅失效消息
  coordinator.subscribe(async msg => {
    await coordinator.handleInvalidation('node-b', msg);
  });

  // 模拟场景
  console.log('--- Invalidate After Write ---');
  nodeAData.set('user:1', 'Alice');
  nodeBData.set('user:1', 'Alice');
  console.log('Before: A=', nodeAData.get('user:1'), 'B=', nodeBData.get('user:1'));

  coordinator.invalidateAfterWrite('node-a', 'user:1', async () => {
    // 模拟数据库更新
  });

  console.log('After invalidate: A=', nodeAData.get('user:1'), 'B=', nodeBData.get('user:1'));

  // 版本向量
  console.log('\n--- Version Vectors ---');
  const vCache = new VersionedCache();
  vCache.set('key', 'v1');
  vCache.set('key', 'v2');
  console.log('Local version:', vCache.get('key'));

  const merged = vCache.merge('key', { value: 'v3', version: 3, timestamp: Date.now() });
  console.log('Merge accepted:', merged);
  console.log('Current value:', vCache.get('key')?.value);
}
