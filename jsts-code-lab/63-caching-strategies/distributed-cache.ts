/**
 * @file 分布式缓存
 * @category Caching → Distributed Cache
 * @difficulty hard
 * @tags distributed-cache, cache-cluster, redis-cluster, consistent-hashing
 *
 * @description
 * 分布式缓存实现：一致性哈希、虚拟节点、缓存分片、集群管理
 */

// ============================================================================
// 类型定义
// ============================================================================

export interface CacheNode {
  id: string;
  host: string;
  port: number;
  weight: number;
  healthy: boolean;
  virtualNodes?: number;
}

export interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  version: number;
}

export interface NodeStats {
  id: string;
  keyCount: number;
  memoryUsage: number;
  hitRate: number;
  latency: number;
}

// ============================================================================
// 一致性哈希环
// ============================================================================

export class ConsistentHashRing {
  private ring: Map<number, string> = new Map(); // hash -> nodeId
  private nodes: Map<string, CacheNode> = new Map();
  private sortedKeys: number[] = [];
  private virtualNodes: number;

  constructor(virtualNodes: number = 150) {
    this.virtualNodes = virtualNodes;
  }

  /**
   * 添加节点
   */
  addNode(node: CacheNode): void {
    this.nodes.set(node.id, node);

    // 创建虚拟节点
    const vNodes = node.virtualNodes || this.virtualNodes;
    for (let i = 0; i < vNodes; i++) {
      const hash = this.hash(`${node.id}:${i}`);
      this.ring.set(hash, node.id);
    }

    this.updateSortedKeys();
  }

  /**
   * 移除节点
   */
  removeNode(nodeId: string): void {
    const node = this.nodes.get(nodeId);
    if (!node) return;

    const vNodes = node.virtualNodes || this.virtualNodes;
    for (let i = 0; i < vNodes; i++) {
      const hash = this.hash(`${node.id}:${i}`);
      this.ring.delete(hash);
    }

    this.nodes.delete(nodeId);
    this.updateSortedKeys();
  }

  /**
   * 获取 key 对应的节点
   */
  getNode(key: string): CacheNode | null {
    if (this.ring.size === 0) return null;

    const hash = this.hash(key);
    const nodeId = this.findNodeId(hash);
    
    if (!nodeId) return null;

    const node = this.nodes.get(nodeId);
    if (!node?.healthy) {
      // 如果节点不健康，找下一个节点
      return this.getNextHealthyNode(hash);
    }

    return node || null;
  }

  /**
   * 获取 key 应该存储的节点列表（用于复制）
   */
  getNodes(key: string, replicaCount: number): CacheNode[] {
    const nodes: CacheNode[] = [];
    const seen = new Set<string>();

    if (this.ring.size === 0) return nodes;

    let hash = this.hash(key);

    while (nodes.length < replicaCount && seen.size < this.nodes.size) {
      const nodeId = this.findNodeId(hash);
      if (!nodeId) break;

      if (!seen.has(nodeId)) {
        seen.add(nodeId);
        const node = this.nodes.get(nodeId);
        if (node?.healthy) {
          nodes.push(node);
        }
      }

      // 找下一个虚拟节点
      const index = this.sortedKeys.findIndex(k => k >= hash);
      const nextIndex = (index + 1) % this.sortedKeys.length;
      
      if (nextIndex === 0 && index !== -1) {
        // 已经遍历一圈
        break;
      }
      
      hash = this.sortedKeys[nextIndex];
    }

    return nodes;
  }

  /**
   * 获取所有健康节点
   */
  getHealthyNodes(): CacheNode[] {
    return Array.from(this.nodes.values()).filter(n => n.healthy);
  }

  private findNodeId(hash: number): string | undefined {
    // 找到第一个 >= hash 的节点
    for (const key of this.sortedKeys) {
      if (key >= hash) {
        return this.ring.get(key);
      }
    }
    // 如果没有找到，返回第一个节点（环状）
    return this.ring.get(this.sortedKeys[0]);
  }

  private getNextHealthyNode(startHash: number): CacheNode | null {
    const startIndex = this.sortedKeys.findIndex(k => k >= startHash);
    
    for (let i = 0; i < this.sortedKeys.length; i++) {
      const index = (startIndex + i) % this.sortedKeys.length;
      const nodeId = this.ring.get(this.sortedKeys[index]);
      if (nodeId) {
        const node = this.nodes.get(nodeId);
        if (node?.healthy) {
          return node;
        }
      }
    }

    return null;
  }

  private updateSortedKeys(): void {
    this.sortedKeys = Array.from(this.ring.keys()).sort((a, b) => a - b);
  }

  private hash(key: string): number {
    // FNV-1a hash
    let hash = 2166136261;
    for (let i = 0; i < key.length; i++) {
      hash ^= key.charCodeAt(i);
      hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }
    return Math.abs(hash);
  }
}

// ============================================================================
// 分片缓存
// ============================================================================

export class ShardedCache<T> {
  private shards: Map<string, Map<string, CacheEntry<T>>> = new Map();
  private hashRing: ConsistentHashRing;
  private defaultTTL: number;

  constructor(nodes: CacheNode[], options: { defaultTTL?: number; virtualNodes?: number } = {}) {
    this.defaultTTL = options.defaultTTL || 3600;
    this.hashRing = new ConsistentHashRing(options.virtualNodes);

    for (const node of nodes) {
      this.hashRing.addNode(node);
      this.shards.set(node.id, new Map());
    }
  }

  /**
   * 获取值
   */
  get(key: string): T | undefined {
    const node = this.hashRing.getNode(key);
    if (!node) return undefined;

    const shard = this.shards.get(node.id);
    if (!shard) return undefined;

    const entry = shard.get(key);
    if (!entry) return undefined;

    if (Date.now() > entry.expiresAt) {
      shard.delete(key);
      return undefined;
    }

    return entry.value;
  }

  /**
   * 设置值
   */
  set(key: string, value: T, ttl?: number): void {
    const node = this.hashRing.getNode(key);
    if (!node) throw new Error('No available cache node');

    let shard = this.shards.get(node.id);
    if (!shard) {
      shard = new Map();
      this.shards.set(node.id, shard);
    }

    const entry: CacheEntry<T> = {
      value,
      expiresAt: Date.now() + (ttl || this.defaultTTL) * 1000,
      version: 1
    };

    shard.set(key, entry);
  }

  /**
   * 删除值
   */
  delete(key: string): boolean {
    const node = this.hashRing.getNode(key);
    if (!node) return false;

    const shard = this.shards.get(node.id);
    if (!shard) return false;

    return shard.delete(key);
  }

  /**
   * 使节点失效时的数据迁移
   */
  rebalance(failedNodeId: string): { movedKeys: number; targetNodes: string[] } {
    const failedShard = this.shards.get(failedNodeId);
    if (!failedShard || failedShard.size === 0) {
      return { movedKeys: 0, targetNodes: [] };
    }

    let movedKeys = 0;
    const targetNodes = new Set<string>();

    // 将失败节点的数据重新分配到其他节点
    for (const [key, entry] of failedShard) {
      // 临时标记节点为不健康，让哈希环选择其他节点
      const newNode = this.hashRing.getNode(key);
      
      if (newNode && newNode.id !== failedNodeId) {
        let newShard = this.shards.get(newNode.id);
        if (!newShard) {
          newShard = new Map();
          this.shards.set(newNode.id, newShard);
        }
        
        newShard.set(key, entry);
        targetNodes.add(newNode.id);
        movedKeys++;
      }
    }

    // 清空失败节点
    failedShard.clear();

    return { movedKeys, targetNodes: Array.from(targetNodes) };
  }

  /**
   * 获取分片统计
   */
  getShardStats(): Array<{ nodeId: string; keyCount: number }> {
    return Array.from(this.shards.entries()).map(([nodeId, shard]) => ({
      nodeId,
      keyCount: shard.size
    }));
  }
}

// ============================================================================
// 复制缓存（高可用）
// ============================================================================

export class ReplicatedCache<T> {
  private primaryShards: Map<string, Map<string, CacheEntry<T>>> = new Map();
  private replicaShards: Map<string, Map<string, CacheEntry<T>>> = new Map();
  private hashRing: ConsistentHashRing;
  private replicationFactor: number;

  constructor(nodes: CacheNode[], replicationFactor: number = 2) {
    this.hashRing = new ConsistentHashRing();
    this.replicationFactor = replicationFactor;

    for (const node of nodes) {
      this.hashRing.addNode(node);
      this.primaryShards.set(node.id, new Map());
      this.replicaShards.set(node.id, new Map());
    }
  }

  /**
   * 获取值（优先从主节点读取，失败时从副本读取）
   */
  get(key: string): T | undefined {
    // 获取应该存储这个 key 的所有节点
    const nodes = this.hashRing.getNodes(key, this.replicationFactor);

    // 先尝试主节点
    for (const node of nodes) {
      const shard = this.primaryShards.get(node.id);
      if (shard) {
        const entry = shard.get(key);
        if (entry && Date.now() <= entry.expiresAt) {
          return entry.value;
        }
      }
    }

    // 尝试副本
    for (const node of nodes) {
      const replica = this.replicaShards.get(node.id);
      if (replica) {
        const entry = replica.get(key);
        if (entry && Date.now() <= entry.expiresAt) {
          return entry.value;
        }
      }
    }

    return undefined;
  }

  /**
   * 设置值（写入主节点和副本）
   */
  set(key: string, value: T, ttl?: number): void {
    const nodes = this.hashRing.getNodes(key, this.replicationFactor);
    const entry: CacheEntry<T> = {
      value,
      expiresAt: Date.now() + (ttl || 3600) * 1000,
      version: 1
    };

    // 第一个节点作为主节点
    if (nodes.length > 0) {
      const primary = this.primaryShards.get(nodes[0].id);
      if (primary) {
        primary.set(key, entry);
      }
    }

    // 其他节点作为副本
    for (let i = 1; i < nodes.length; i++) {
      const replica = this.replicaShards.get(nodes[i].id);
      if (replica) {
        replica.set(key, entry);
      }
    }
  }
}

// ============================================================================
// 缓存集群管理器
// ============================================================================

export class CacheCluster {
  private nodes: Map<string, CacheNode> = new Map();
  private hashRing: ConsistentHashRing;
  private stats: Map<string, NodeStats> = new Map();

  constructor() {
    this.hashRing = new ConsistentHashRing();
  }

  /**
   * 添加节点
   */
  addNode(node: CacheNode): void {
    this.nodes.set(node.id, node);
    this.hashRing.addNode(node);
    this.stats.set(node.id, {
      id: node.id,
      keyCount: 0,
      memoryUsage: 0,
      hitRate: 0,
      latency: 0
    });

    console.log(`[CacheCluster] Added node: ${node.id} (${node.host}:${node.port})`);
  }

  /**
   * 移除节点
   */
  removeNode(nodeId: string): void {
    this.nodes.delete(nodeId);
    this.hashRing.removeNode(nodeId);
    this.stats.delete(nodeId);

    console.log(`[CacheCluster] Removed node: ${nodeId}`);
  }

  /**
   * 标记节点健康状态
   */
  setNodeHealth(nodeId: string, healthy: boolean): void {
    const node = this.nodes.get(nodeId);
    if (node) {
      node.healthy = healthy;
      console.log(`[CacheCluster] Node ${nodeId} health: ${healthy}`);
    }
  }

  /**
   * 获取 key 对应的节点
   */
  getNodeForKey(key: string): CacheNode | null {
    return this.hashRing.getNode(key);
  }

  /**
   * 获取集群统计
   */
  getClusterStats(): {
    totalNodes: number;
    healthyNodes: number;
    totalKeys: number;
  } {
    const nodes = Array.from(this.nodes.values());
    const nodeStats = Array.from(this.stats.values());
    
    return {
      totalNodes: nodes.length,
      healthyNodes: nodes.filter(n => n.healthy).length,
      totalKeys: nodeStats.reduce((sum, s) => sum + s.keyCount, 0)
    };
  }

  /**
   * 获取节点分布信息
   */
  getDistribution(): Array<{ nodeId: string; keyRange: string; percentage: number }> {
    // 简化实现：计算每个虚拟节点负责的范围
    const distribution: Array<{ nodeId: string; keyRange: string; percentage: number }> = [];
    const healthyNodes = this.hashRing.getHealthyNodes();
    
    if (healthyNodes.length === 0) return distribution;

    const percentage = 100 / healthyNodes.length;
    
    for (const node of healthyNodes) {
      distribution.push({
        nodeId: node.id,
        keyRange: `${node.id}:0-${node.virtualNodes || 150}`,
        percentage: Math.round(percentage * 100) / 100
      });
    }

    return distribution;
  }
}

// ============================================================================
// 使用示例
// ============================================================================

export function demo(): void {
  console.log('=== 分布式缓存演示 ===\n');

  // 1. 一致性哈希环
  console.log('--- 一致性哈希环 ---');
  const hashRing = new ConsistentHashRing(100);

  const nodes: CacheNode[] = [
    { id: 'node-1', host: 'localhost', port: 7001, weight: 1, healthy: true },
    { id: 'node-2', host: 'localhost', port: 7002, weight: 1, healthy: true },
    { id: 'node-3', host: 'localhost', port: 7003, weight: 1, healthy: true }
  ];

  for (const node of nodes) {
    hashRing.addNode(node);
  }

  // 测试 key 分布
  const keyDistribution: Record<string, number> = {};
  for (let i = 0; i < 1000; i++) {
    const key = `key-${i}`;
    const node = hashRing.getNode(key);
    if (node) {
      keyDistribution[node.id] = (keyDistribution[node.id] || 0) + 1;
    }
  }

  console.log('  Key distribution (1000 keys):');
  for (const [nodeId, count] of Object.entries(keyDistribution)) {
    console.log(`    ${nodeId}: ${count} (${(count / 10).toFixed(1)}%)`);
  }

  // 2. 分片缓存
  console.log('\n--- 分片缓存 ---');
  const shardedCache = new ShardedCache<string>(nodes);

  // 写入数据
  for (let i = 0; i < 100; i++) {
    shardedCache.set(`data-${i}`, `value-${i}`);
  }

  // 查看分片分布
  console.log('  Shard distribution:');
  for (const stat of shardedCache.getShardStats()) {
    console.log(`    ${stat.nodeId}: ${stat.keyCount} keys`);
  }

  // 3. 节点失效和重新平衡
  console.log('\n--- 节点失效处理 ---');
  const rebalanceResult = shardedCache.rebalance('node-2');
  console.log(`  Moved ${rebalanceResult.movedKeys} keys to nodes: ${rebalanceResult.targetNodes.join(', ')}`);

  console.log('  After rebalance:');
  for (const stat of shardedCache.getShardStats()) {
    console.log(`    ${stat.nodeId}: ${stat.keyCount} keys`);
  }

  // 4. 复制缓存
  console.log('\n--- 复制缓存 (Replication Factor: 2) ---');
  const replicatedCache = new ReplicatedCache<string>(nodes, 2);

  replicatedCache.set('important-key', 'important-value');
  console.log('  Set key with 2 replicas');
  console.log(`  Get: ${replicatedCache.get('important-key')}`);

  // 5. 缓存集群
  console.log('\n--- 缓存集群 ---');
  const cluster = new CacheCluster();
  
  for (const node of nodes) {
    cluster.addNode(node);
  }

  console.log('  Cluster stats:', cluster.getClusterStats());
  console.log('  Distribution:', cluster.getDistribution());
}
