/**
 * @file 领导者选举理论（Bully 与 Ring 算法）
 * @category Consensus → Leader Election
 * @difficulty medium
 * @description
 * 在分布式系统中，领导者选举用于在多个对等节点中唯一确定一个协调者（Leader）。
 * 这里实现 Bully 算法（基于节点 ID 大小）和 Ring 算法（基于令牌环传递）。
 *
 * 数学模型：
 * - 节点集合 P = {p₁, p₂, ..., pₙ}，每个节点有唯一标识符 uid(pᵢ)。
 * - Bully 算法：
 *   当进程 pᵢ 怀疑当前领导者失效时，向所有 uid > uid(pᵢ) 的进程发送 ELECTION。
 *   若无响应，pᵢ 自升为领导者并广播 COORDINATOR。
 *   若有更高 uid 进程响应，则等待其广播 COORDINATOR。
 *   最终领导者为 max{uid(p) | p ∈ P 且 p 存活}。
 * - Ring 算法：
 *   进程按逻辑环排列。选举消息沿环传递，每个进程转发当前见到的最大 uid。
 *   当消息回到发起者时，uid 最大的节点被确认为领导者。
 *
 * @complexity_analysis
 * - Bully 算法时间复杂度：O(n²) 最坏情况（最小 ID 节点发起选举）
 * - Bully 算法消息复杂度：O(n²)
 * - Ring 算法时间复杂度：O(n)
 * - Ring 算法消息复杂度：O(n)（每轮选举最多 2n 条消息）
 */

export interface ElectionMessage {
  readonly type: 'ELECTION' | 'OK' | 'COORDINATOR' | 'ELECTION_RING';
  readonly senderId: string;
  readonly candidateId: string;
}

export class BullyNode {
  readonly id: string;
  readonly priority: number;
  private alive = true;
  private leader: string | null = null;
  private neighbors: BullyNode[] = [];
  private receivedOk = false;
  private messageLog: ElectionMessage[] = [];

  constructor(id: string, priority: number) {
    this.id = id;
    this.priority = priority;
  }

  isAlive(): boolean {
    return this.alive;
  }

  setAlive(alive: boolean): void {
    this.alive = alive;
  }

  get currentLeader(): string | null {
    return this.leader;
  }

  setNeighbors(nodes: BullyNode[]): void {
    this.neighbors = nodes.filter(n => n.id !== this.id);
  }

  /** 发起选举 */
  startElection(): void {
    if (!this.alive) return;
    this.leader = null;
    this.receivedOk = false;

    console.log(`[Bully ${this.id}] 发起选举`);
    const higher = this.neighbors.filter(n => n.priority > this.priority && n.alive);

    if (higher.length === 0) {
      // 没有更高优先级节点，自升为领导者
      this.becomeLeader();
      return;
    }

    for (const n of higher) {
      this.sendMessage(n, { type: 'ELECTION', senderId: this.id, candidateId: this.id });
    }

    // 等待超时（简化：同步检查）
    if (!this.receivedOk) {
      this.becomeLeader();
    }
  }

  /** 处理收到的消息 */
  receiveMessage(msg: ElectionMessage): void {
    this.messageLog.push(msg);

    if (!this.alive) return;

    switch (msg.type) {
      case 'ELECTION': {
        const sender = this.neighbors.find(n => n.id === msg.senderId);
        const senderPriority = sender?.priority ?? 0;
        if (this.priority > senderPriority) {
          if (sender) {
            this.sendMessage(sender, { type: 'OK', senderId: this.id, candidateId: this.id });
          }
          // 自己也发起选举
          this.startElection();
        }
        break;
      }
      case 'OK':
        this.receivedOk = true;
        break;
      case 'COORDINATOR':
        this.leader = msg.candidateId;
        console.log(`[Bully ${this.id}] 承认领导者: ${msg.candidateId}`);
        break;
    }
  }

  private becomeLeader(): void {
    this.leader = this.id;
    console.log(`[Bully ${this.id}] 自升为领导者`);
    for (const n of this.neighbors) {
      if (n.alive) {
        this.sendMessage(n, { type: 'COORDINATOR', senderId: this.id, candidateId: this.id });
      }
    }
  }

  private sendMessage(target: BullyNode, msg: ElectionMessage): void {
    target.receiveMessage(msg);
  }

  getMessageLog(): ElectionMessage[] {
    return [...this.messageLog];
  }
}

/** Ring 算法节点 */
export class RingNode {
  readonly id: string;
  readonly priority: number;
  private alive = true;
  private nextNode: RingNode | null = null;
  private leader: string | null = null;
  private messageLog: ElectionMessage[] = [];

  constructor(id: string, priority: number) {
    this.id = id;
    this.priority = priority;
  }

  isAlive(): boolean {
    return this.alive;
  }

  setAlive(alive: boolean): void {
    this.alive = alive;
  }

  get currentLeader(): string | null {
    return this.leader;
  }

  setNext(node: RingNode): void {
    this.nextNode = node;
  }

  /** 发起环选举 */
  startElection(): void {
    if (!this.alive) return;
    console.log(`[Ring ${this.id}] 发起环选举`);
    this.forward({ type: 'ELECTION_RING', senderId: this.id, candidateId: this.id });
  }

  /** 转发选举消息 */
  forward(msg: ElectionMessage): void {
    if (!this.alive) return;

    if (msg.type === 'ELECTION_RING') {
      // 更新候选人为当前看到的最大优先级
      const myPriority = this.priority;
      const candidatePriority = this.getPriority(msg.candidateId);
      const newCandidate = myPriority > candidatePriority ? this.id : msg.candidateId;

      if (msg.senderId === this.id && msg.candidateId !== this.id) {
        // 消息已绕环一周，选举结束
        this.leader = msg.candidateId;
        console.log(`[Ring ${this.id}] 选举完成，领导者: ${msg.candidateId}`);
        return;
      }

      const forwardMsg: ElectionMessage = { type: 'ELECTION_RING', senderId: msg.senderId, candidateId: newCandidate };
      this.messageLog.push(forwardMsg);
      this.nextNode?.forward(forwardMsg);
    }
  }

  private getPriority(id: string): number {
    // 支持 "n1"、"ring-1" 等格式，提取末尾数字
    const match = /(\d+)$/.exec(id);
    return match ? parseInt(match[1], 10) : 0;
  }

  getMessageLog(): ElectionMessage[] {
    return [...this.messageLog];
  }
}

export class LeaderElectionCluster {
  private bullyNodes = new Map<string, BullyNode>();
  private ringNodes = new Map<string, RingNode>();

  addBullyNode(node: BullyNode): void {
    this.bullyNodes.set(node.id, node);
    for (const other of this.bullyNodes.values()) {
      other.setNeighbors(Array.from(this.bullyNodes.values()));
    }
  }

  addRingNode(node: RingNode): void {
    this.ringNodes.set(node.id, node);
    // 维护环连接：按插入顺序连接
    const nodes = Array.from(this.ringNodes.values());
    for (let i = 0; i < nodes.length; i++) {
      nodes[i].setNext(nodes[(i + 1) % nodes.length]);
    }
  }

  getBullyNode(id: string): BullyNode | undefined {
    return this.bullyNodes.get(id);
  }

  getRingNode(id: string): RingNode | undefined {
    return this.ringNodes.get(id);
  }

  /** 运行 Bully 选举 */
  runBullyElection(initiatorId: string): string | null {
    const initiator = this.bullyNodes.get(initiatorId);
    if (!initiator) return null;
    initiator.startElection();

    // 返回当前确认的领导者
    for (const node of this.bullyNodes.values()) {
      if (node.currentLeader) return node.currentLeader;
    }
    return null;
  }

  /** 运行 Ring 选举 */
  runRingElection(initiatorId: string): string | null {
    const initiator = this.ringNodes.get(initiatorId);
    if (!initiator) return null;
    initiator.startElection();

    // 查找已确定的领导者
    for (const node of this.ringNodes.values()) {
      if (node.currentLeader) return node.currentLeader;
    }
    return null;
  }
}

export function demo(): void {
  console.log('=== 领导者选举理论演示 ===\n');

  const cluster = new LeaderElectionCluster();

  console.log('--- Bully 算法 ---');
  cluster.addBullyNode(new BullyNode('node-1', 1));
  cluster.addBullyNode(new BullyNode('node-2', 2));
  cluster.addBullyNode(new BullyNode('node-3', 3));
  cluster.addBullyNode(new BullyNode('node-4', 4));
  cluster.addBullyNode(new BullyNode('node-5', 5));

  // 模拟 node-5 故障
  cluster.getBullyNode('node-5')?.setAlive(false);

  const bullyLeader = cluster.runBullyElection('node-1');
  console.log(`Bully 选举结果: 领导者 = ${bullyLeader}`);

  console.log('\n--- Ring 算法 ---');
  cluster.addRingNode(new RingNode('ring-1', 1));
  cluster.addRingNode(new RingNode('ring-2', 2));
  cluster.addRingNode(new RingNode('ring-3', 3));
  cluster.addRingNode(new RingNode('ring-4', 4));
  cluster.addRingNode(new RingNode('ring-5', 5));

  const ringLeader = cluster.runRingElection('ring-1');
  console.log(`Ring 选举结果: 领导者 = ${ringLeader}`);
}
