/**
 * @file CAP 定理形式化模型
 * @category Consensus → CAP Theorem
 * @difficulty hard
 * @description
 * CAP 定理指出：在异步网络中，当发生网络分区时，分布式系统无法同时保证
 * 一致性（Consistency）和可用性（Availability），只能二选一。
 *
 * 数学模型：
 * - 系统状态 S = (V₁, V₂, ..., Vₙ)，Vᵢ 为节点 i 的本地状态。
 * - 一致性 C：∀i,j ∈ [1,n], Vᵢ = Vⱼ（所有节点看到相同的最新写入）。
 * - 可用性 A：∀请求 r，∃响应（每个请求最终收到非错误响应）。
 * - 分区容错 P：网络可能分裂为至少两个互不连通的子集。
 * - 定理：P ∧ C ⇒ ¬A；P ∧ A ⇒ ¬C。
 *
 * @complexity_analysis
 * - 状态空间：O(kⁿ)，k 为每个节点的可能状态数，n 为节点数。
 * - 分区检测：O(n)（遍历节点连通性）
 */

export type NodeId = string;
export type PartitionId = string;

export interface DistributedState {
  readonly key: string;
  value: number;
  version: number;
  timestamp: number;
}

export interface SystemNode {
  readonly id: NodeId;
  state: DistributedState;
  reachable: Set<NodeId>;
  pendingRequests: Array<{ clientId: string; operation: 'read' | 'write'; value?: number }>;
}

export interface Partition {
  readonly id: PartitionId;
  nodes: Set<NodeId>;
}

export class CapDistributedSystem {
  private nodes = new Map<NodeId, SystemNode>();
  private partitions: Partition[] = [];
  private history: string[] = [];

  addNode(id: NodeId, initialValue: number): void {
    this.nodes.set(id, {
      id,
      state: { key: 'x', value: initialValue, version: 0, timestamp: 0 },
      reachable: new Set(),
      pendingRequests: []
    });
    // 默认全连通
    for (const other of this.nodes.values()) {
      other.reachable.add(id);
      if (other.id !== id) {
        this.nodes.get(id)!.reachable.add(other.id);
      }
    }
  }

  getNode(id: NodeId): SystemNode | undefined {
    return this.nodes.get(id);
  }

  /** 创建网络分区：将节点分为两个互不连通的组 */
  createPartition(groupA: NodeId[], groupB: NodeId[]): void {
    this.partitions = [
      { id: 'partition-A', nodes: new Set(groupA) },
      { id: 'partition-B', nodes: new Set(groupB) }
    ];

    for (const node of this.nodes.values()) {
      node.reachable.clear();
      const inSamePartition = (other: NodeId): boolean => {
        for (const p of this.partitions) {
          if (p.nodes.has(node.id) && p.nodes.has(other)) return true;
        }
        return false;
      };

      for (const other of this.nodes.keys()) {
        if (other === node.id || inSamePartition(other)) {
          node.reachable.add(other);
        }
      }
    }

    this.history.push(`分区发生: A=[${groupA.join(',')}], B=[${groupB.join(',')}]`);
    console.log(`[CAP] 网络分区: A=[${groupA.join(',')}], B=[${groupB.join(',')}]`);
  }

  /** 恢复全连通 */
  healPartition(): void {
    this.partitions = [];
    for (const node of this.nodes.values()) {
      node.reachable.clear();
      for (const other of this.nodes.keys()) {
        node.reachable.add(other);
      }
    }
    this.history.push('分区恢复');
    console.log('[CAP] 分区恢复，网络全连通');
  }

  /**
   * CP 模式：保证一致性，牺牲可用性。
   * 若节点不在包含大多数节点的分区中，拒绝写操作。
   */
  writeCP(nodeId: NodeId, clientId: string, value: number): boolean {
    const node = this.nodes.get(nodeId);
    if (!node) return false;

    const partitionSize = node.reachable.size;
    const majority = Math.floor(this.nodes.size / 2) + 1;

    if (partitionSize < majority) {
      this.history.push(`CP-拒绝: ${clientId} @ ${nodeId} 写 ${value}（分区太小）`);
      console.log(`[CP] ${nodeId} 拒绝写请求（分区大小 ${partitionSize} < 多数派 ${majority}）`);
      return false;
    }

    // 同步到所有可达节点
    const newVersion = node.state.version + 1;
    for (const otherId of node.reachable) {
      const other = this.nodes.get(otherId)!;
      other.state = { ...other.state, value, version: newVersion, timestamp: Date.now() };
    }

    this.history.push(`CP-成功: ${clientId} @ ${nodeId} 写 ${value} (v=${newVersion})`);
    console.log(`[CP] ${nodeId} 成功写入 ${value}，版本=${newVersion}，同步到 ${partitionSize} 个节点`);
    return true;
  }

  /**
   * AP 模式：保证可用性，牺牲强一致性。
   * 任何节点都可以接受写操作，但不同分区可能产生分歧。
   */
  writeAP(nodeId: NodeId, clientId: string, value: number): boolean {
    const node = this.nodes.get(nodeId);
    if (!node) return false;

    const newVersion = node.state.version + 1;
    for (const otherId of node.reachable) {
      const other = this.nodes.get(otherId)!;
      other.state = { ...other.state, value, version: newVersion, timestamp: Date.now() };
    }

    this.history.push(`AP-成功: ${clientId} @ ${nodeId} 写 ${value} (v=${newVersion})`);
    console.log(`[AP] ${nodeId} 成功写入 ${value}，版本=${newVersion}，同步到 ${node.reachable.size} 个节点`);
    return true;
  }

  /** 读取指定节点状态 */
  read(nodeId: NodeId): DistributedState | null {
    return this.nodes.get(nodeId)?.state ?? null;
  }

  /** 检查系统当前是否满足一致性 */
  checkConsistency(): boolean {
    if (this.nodes.size === 0) return true;
    const first = Array.from(this.nodes.values())[0]!.state;
    for (const node of this.nodes.values()) {
      if (node.state.value !== first.value || node.state.version !== first.version) {
        return false;
      }
    }
    return true;
  }

  /** 检查系统在分区期间是否所有请求都被处理（可用性） */
  checkAvailability(requestsCount: number, successesCount: number): boolean {
    return requestsCount === successesCount;
  }

  /** 演示 CAP 不可兼得 */
  demonstrateCAP(): { cpConsistent: boolean; cpAvailable: boolean; apConsistent: boolean; apAvailable: boolean } {
    console.log('=== CAP 定理形式化演示 ===\n');

    // 初始化 5 节点系统
    for (let i = 1; i <= 5; i++) {
      this.addNode(`node-${i}`, 0);
    }

    console.log('--- CP 路径演示 ---');
    this.createPartition(['node-1', 'node-2'], ['node-3', 'node-4', 'node-5']);
    const cpOk1 = this.writeCP('node-1', 'client-A', 100);
    const cpOk2 = this.writeCP('node-3', 'client-B', 200);
    const cpConsistent = this.checkConsistency();
    const cpAvailable = cpOk1 && cpOk2;
    console.log(`CP 一致性: ${cpConsistent}, CP 可用性: ${cpAvailable}（node-1 成功=${cpOk1}, node-3 成功=${cpOk2}）`);

    this.healPartition();

    // 重置状态
    for (const node of this.nodes.values()) {
      node.state = { key: 'x', value: 0, version: 0, timestamp: 0 };
    }

    console.log('\n--- AP 路径演示 ---');
    this.createPartition(['node-1', 'node-2'], ['node-3', 'node-4', 'node-5']);
    const apOk1 = this.writeAP('node-1', 'client-A', 100);
    const apOk2 = this.writeAP('node-3', 'client-B', 200);
    const apConsistent = this.checkConsistency();
    const apAvailable = apOk1 && apOk2;
    console.log(`AP 一致性: ${apConsistent}, AP 可用性: ${apAvailable}（node-1 成功=${apOk1}, node-3 成功=${apOk2}）`);
    console.log(`分区后状态: node-1=${this.read('node-1')?.value}, node-3=${this.read('node-3')?.value}`);

    this.healPartition();

    return { cpConsistent, cpAvailable, apConsistent, apAvailable };
  }
}

export function demo(): void {
  const system = new CapDistributedSystem();
  const result = system.demonstrateCAP();

  console.log('\n=== CAP 结论 ===');
  console.log(`CP 系统: 一致性=${result.cpConsistent}, 可用性=${result.cpAvailable} → 分区时牺牲可用性`);
  console.log(`AP 系统: 一致性=${result.apConsistent}, 可用性=${result.apAvailable} → 分区时牺牲强一致性`);
  console.log('因此，P 发生时 C 与 A 不可兼得。');
}
