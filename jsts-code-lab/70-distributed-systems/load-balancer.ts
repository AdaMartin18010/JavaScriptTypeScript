/**
 * @file 负载均衡策略实现
 * @category Distributed Systems → Routing
 * @difficulty hard
 * @tags distributed-systems, load-balancer, consistent-hashing, round-robin
 *
 * @description
 * 负载均衡是分布式系统的流量入口核心组件，负责将请求合理分配到多个后端节点。
 *
 * 一致性哈希（Consistent Hashing）原理：
 * - 将节点和请求键都映射到同一个哈希环上
 * - 请求顺时针找到最近的节点处理
 * - 当节点增减时，只有环上相邻区间的数据需要重新映射，大大降低迁移成本
 * - 通过虚拟节点（Virtual Nodes）降低数据倾斜，使分布更均匀
 *
 * 轮询（Round Robin）：按顺序依次分配，简单公平
 * 加权轮询（Weighted Round Robin）：按节点权重比例分配，适应异构硬件
 * 最少连接（Least Connections）：将请求分配给当前连接数最少的节点，适合长连接场景
 */

export interface BackendNode {
  id: string;
  weight?: number;
  connections?: number;
}

// ==================== Round Robin ====================

export class RoundRobinBalancer {
  private index = 0;

  constructor(private nodes: BackendNode[]) {}

  pick(): BackendNode | null {
    if (this.nodes.length === 0) return null;
    const node = this.nodes[this.index];
    this.index = (this.index + 1) % this.nodes.length;
    return node;
  }

  updateNodes(nodes: BackendNode[]): void {
    this.nodes = nodes;
    this.index = 0;
  }
}

// ==================== Weighted Round Robin ====================

export class WeightedRoundRobinBalancer {
  private nodes: BackendNode[] = [];
  private currentWeight = 0;
  private currentIndex = -1;

  constructor(nodes: BackendNode[]) {
    this.updateNodes(nodes);
  }

  pick(): BackendNode | null {
    if (this.nodes.length === 0) return null;

    const maxWeight = Math.max(...this.nodes.map((n) => n.weight ?? 1));
    const gcd = this.computeGCD(this.nodes.map((n) => n.weight ?? 1));

    while (true) {
      this.currentIndex = (this.currentIndex + 1) % this.nodes.length;
      if (this.currentIndex === 0) {
        this.currentWeight -= gcd;
        if (this.currentWeight <= 0) {
          this.currentWeight = maxWeight;
          if (this.currentWeight === 0) return null;
        }
      }

      const node = this.nodes[this.currentIndex];
      if ((node.weight ?? 1) >= this.currentWeight) {
        return node;
      }
    }
  }

  updateNodes(nodes: BackendNode[]): void {
    this.nodes = nodes;
    this.currentWeight = 0;
    this.currentIndex = -1;
  }

  private computeGCD(numbers: number[]): number {
    return numbers.reduce((a, b) => this.gcd(a, b), numbers[0] ?? 1);
  }

  private gcd(a: number, b: number): number {
    return b === 0 ? a : this.gcd(b, a % b);
  }
}

// ==================== Least Connections ====================

export class LeastConnectionsBalancer {
  constructor(private nodes: BackendNode[]) {}

  pick(): BackendNode | null {
    if (this.nodes.length === 0) return null;

    let selected = this.nodes[0];
    let minConnections = selected.connections ?? 0;

    for (const node of this.nodes) {
      const conn = node.connections ?? 0;
      if (conn < minConnections) {
        minConnections = conn;
        selected = node;
      }
    }

    return selected;
  }

  updateNodes(nodes: BackendNode[]): void {
    this.nodes = nodes;
  }
}

// ==================== Consistent Hashing with Virtual Nodes ====================

export class ConsistentHashBalancer {
  private ring: Map<number, string> = new Map();
  private nodeMap: Map<string, BackendNode> = new Map();
  private virtualNodes = 150;

  constructor(nodes: BackendNode[] = [], virtualNodes = 150) {
    this.virtualNodes = virtualNodes;
    for (const node of nodes) {
      this.addNode(node);
    }
  }

  addNode(node: BackendNode): void {
    this.nodeMap.set(node.id, node);
    // 一致性哈希通过虚拟节点降低数据倾斜
    for (let i = 0; i < this.virtualNodes; i++) {
      const hash = this.hash(`${node.id}#vn-${i}`);
      this.ring.set(hash, node.id);
    }
  }

  removeNode(nodeId: string): void {
    this.nodeMap.delete(nodeId);
    for (let i = 0; i < this.virtualNodes; i++) {
      const hash = this.hash(`${nodeId}#vn-${i}`);
      this.ring.delete(hash);
    }
  }

  pick(key: string): BackendNode | null {
    if (this.ring.size === 0) return null;

    const hash = this.hash(key);
    const sortedHashes = Array.from(this.ring.keys()).sort((a, b) => a - b);

    // 顺时针找到第一个大于等于 hash 的虚拟节点
    for (const h of sortedHashes) {
      if (h >= hash) {
        const nodeId = this.ring.get(h)!;
        return this.nodeMap.get(nodeId) ?? null;
      }
    }

    // 回绕到环的第一个节点
    const nodeId = this.ring.get(sortedHashes[0])!;
    return this.nodeMap.get(nodeId) ?? null;
  }

  /**
   * 统计每个物理节点的 key 分布数量，用于验证虚拟节点的均匀性
   */
  getDistribution(keys: string[]): Record<string, number> {
    const dist: Record<string, number> = {};
    for (const key of keys) {
      const node = this.pick(key);
      if (node) {
        dist[node.id] = (dist[node.id] ?? 0) + 1;
      }
    }
    return dist;
  }

  private hash(str: string): number {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = ((h << 5) - h) + str.charCodeAt(i);
      h = h & h;
    }
    return Math.abs(h);
  }
}

// ==================== Demo ====================

export function demo(): void {
  console.log('=== 负载均衡策略 ===\n');

  const nodes: BackendNode[] = [
    { id: 'node-a', weight: 5, connections: 10 },
    { id: 'node-b', weight: 3, connections: 5 },
    { id: 'node-c', weight: 2, connections: 20 }
  ];

  // 1. Round Robin
  console.log('--- 轮询（Round Robin）---');
  const rr = new RoundRobinBalancer(nodes);
  const rrStats: Record<string, number> = {};
  for (let i = 0; i < 12; i++) {
    const node = rr.pick();
    if (node) {
      rrStats[node.id] = (rrStats[node.id] ?? 0) + 1;
      process.stdout.write(`${node.id} `);
    }
  }
  console.log('\n  分布:', JSON.stringify(rrStats));

  // 2. Weighted Round Robin
  console.log('\n--- 加权轮询（Weighted Round Robin）---');
  const wrr = new WeightedRoundRobinBalancer(nodes);
  const wrrStats: Record<string, number> = {};
  for (let i = 0; i < 20; i++) {
    const node = wrr.pick();
    if (node) {
      wrrStats[node.id] = (wrrStats[node.id] ?? 0) + 1;
      process.stdout.write(`${node.id} `);
    }
  }
  console.log('\n  分布:', JSON.stringify(wrrStats));

  // 3. Least Connections
  console.log('\n--- 最少连接（Least Connections）---');
  const lc = new LeastConnectionsBalancer(nodes);
  const picked = lc.pick();
  console.log(`  当前连接数: a=10, b=5, c=20`);
  console.log(`  选中节点: ${picked?.id} (连接数最少)`);

  // 4. Consistent Hashing
  console.log('\n--- 一致性哈希（Consistent Hashing）---');
  const ch = new ConsistentHashBalancer(nodes, 150);
  const keys = Array.from({ length: 10000 }, (_, i) => `user:${i}`);
  console.log(`  虚拟节点数: 150/节点, 测试 keys: 10000`);
  console.log('  初始分布:', JSON.stringify(ch.getDistribution(keys)));

  // 移除 node-b，观察数据迁移量
  ch.removeNode('node-b');
  const afterRemove = ch.getDistribution(keys);
  console.log('  移除 node-b 后分布:', JSON.stringify(afterRemove));

  // 计算迁移比例
  const migrated = keys.filter((k) => {
    const original = new ConsistentHashBalancer(nodes, 150).pick(k)?.id;
    const current = ch.pick(k)?.id;
    return original !== current;
  }).length;
  console.log(`  数据迁移比例: ${(migrated / keys.length * 100).toFixed(2)}% (理论期望 ≈ 1/3)`);

  console.log('\n--- 策略选择建议 ---');
  console.log('  轮询：节点性能同质，短连接请求');
  console.log('  加权轮询：节点性能异构，需要按能力分配');
  console.log('  最少连接：长连接、WebSocket、流式请求');
  console.log('  一致性哈希：需要会话保持或缓存局部性');
}
