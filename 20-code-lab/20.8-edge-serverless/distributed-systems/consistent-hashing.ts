/**
 * @file 一致性哈希实现
 * @category Distributed Systems → Load Balancing
 * @difficulty medium
 * @tags consistent-hashing, load-balancer, distributed-cache, hash-ring
 *
 * @description
 * 一致性哈希（Consistent Hashing）是分布式系统中常用的负载均衡与数据分片算法。
 * 通过引入虚拟节点（virtual nodes），一致性哈希能够在节点增删时最小化数据迁移量。
 *
 * 核心概念：
 * - Hash Ring：将节点和键映射到同一个哈希环上（0 ~ 2³²-1）
 * - Virtual Nodes：每个物理节点对应多个虚拟节点，改善负载均衡度
 * - 顺时针查找：键的哈希值顺时针遇到的第一个节点即为其负责节点
 */

export interface HashRingNode {
  /** 物理节点唯一标识 */
  id: string;
  /** 节点权重（权重越高，分配的虚拟节点越多） */
  weight?: number;
}

export interface HashRingOptions {
  /** 每个物理节点的默认虚拟节点数 */
  virtualNodes?: number;
  /** 哈希函数（默认使用简单的 32-bit FNV-1a） */
  hashFn?: (input: string) => number;
}

export class ConsistentHashRing {
  /** 哈希环：哈希值 → 物理节点 ID */
  private ring = new Map<number, string>();
  /** 已注册的物理节点 */
  private nodes = new Map<string, HashRingNode>();
  /** 排序后的哈希值数组，用于二分查找 */
  private sortedKeys: number[] = [];
  private readonly virtualNodes: number;
  private readonly hashFn: (input: string) => number;

  constructor(options: HashRingOptions = {}) {
    this.virtualNodes = options.virtualNodes ?? 150;
    this.hashFn = options.hashFn ?? this.fnv1a32;
  }

  /**
   * 注册一个物理节点到哈希环
   * @param node - 节点信息
   */
  addNode(node: HashRingNode): void {
    if (this.nodes.has(node.id)) {
      throw new Error(`Node ${node.id} already exists in the ring`);
    }
    this.nodes.set(node.id, node);

    const weight = node.weight ?? 1;
    const replicas = Math.floor(this.virtualNodes * weight);

    for (let i = 0; i < replicas; i++) {
      const hash = this.hashFn(`${node.id}#${i}`);
      this.ring.set(hash, node.id);
    }

    this.rebuildSortedKeys();
  }

  /**
   * 从哈希环移除一个物理节点
   * @param nodeId - 节点 ID
   */
  removeNode(nodeId: string): void {
    if (!this.nodes.has(nodeId)) {
      throw new Error(`Node ${nodeId} does not exist in the ring`);
    }
    this.nodes.delete(nodeId);

    for (const [hash, id] of this.ring) {
      if (id === nodeId) {
        this.ring.delete(hash);
      }
    }

    this.rebuildSortedKeys();
  }

  /**
   * 根据 key 查找负责的物理节点
   * @param key - 数据键
   * @returns 节点 ID，若环为空则返回 undefined
   */
  getNode(key: string): string | undefined {
    if (this.sortedKeys.length === 0) {
      return undefined;
    }

    const hash = this.hashFn(key);
    const idx = this.binarySearchUpperBound(hash);
    const targetHash = this.sortedKeys[idx % this.sortedKeys.length];
    return this.ring.get(targetHash);
  }

  /**
   * 获取当前环中所有物理节点 ID
   */
  getNodes(): string[] {
    return Array.from(this.nodes.keys());
  }

  /**
   * 获取哈希环上的虚拟节点数量
   */
  getVirtualNodeCount(): number {
    return this.sortedKeys.length;
  }

  private rebuildSortedKeys(): void {
    this.sortedKeys = Array.from(this.ring.keys()).sort((a, b) => a - b);
  }

  /** 二分查找：返回第一个大于等于 target 的索引 */
  private binarySearchUpperBound(target: number): number {
    let left = 0;
    let right = this.sortedKeys.length;

    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      if (this.sortedKeys[mid] < target) {
        left = mid + 1;
      } else {
        right = mid;
      }
    }

    return left;
  }

  /** 32-bit FNV-1a 哈希（教学级实现） */
  private fnv1a32(input: string): number {
    let hash = 0x811c9dc5;
    for (let i = 0; i < input.length; i++) {
      hash ^= input.charCodeAt(i);
      hash = ((hash * 0x01000193) >>> 0) & 0xffffffff;
    }
    return hash;
  }
}

export function demo(): void {
  console.log('=== 一致性哈希 ===\n');

  const ring = new ConsistentHashRing({ virtualNodes: 100 });

  ring.addNode({ id: 'node-a', weight: 1 });
  ring.addNode({ id: 'node-b', weight: 1 });
  ring.addNode({ id: 'node-c', weight: 2 });

  console.log('已注册节点:', ring.getNodes());
  console.log('虚拟节点总数:', ring.getVirtualNodeCount());

  const keys = ['user:1001', 'user:1002', 'user:1003', 'order:5001', 'order:5002', 'product:2001'];
  console.log('\n数据键分配:');
  for (const key of keys) {
    console.log(`  ${key} -> ${ring.getNode(key)}`);
  }

  console.log('\n移除 node-b 后:');
  ring.removeNode('node-b');
  for (const key of keys) {
    console.log(`  ${key} -> ${ring.getNode(key)}`);
  }
}
