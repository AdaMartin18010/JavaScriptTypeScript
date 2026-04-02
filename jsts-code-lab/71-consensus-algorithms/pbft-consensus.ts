/**
 * @file PBFT（实用拜占庭容错）算法
 * @category Consensus → PBFT
 * @difficulty hard
 * @description
 * PBFT 解决拜占庭将军问题，允许系统在最多 f 个恶意节点存在时仍保持一致性。
 * 节点总数需满足 n ≥ 3f + 1。
 *
 * 数学模型：
 * - 设总节点数 n，故障节点上限 f = ⌊(n - 1) / 3⌋。
 * -  quorum = ⌈(n + f + 1) / 2⌉ = 2f + 1，保证任何两个 quorum 至少有一个诚实节点重叠。
 * - 消息阶段：Request → Pre-Prepare → Prepare → Commit → Reply。
 *
 * @complexity_analysis
 * - 时间复杂度：O(n²) 每请求（每个阶段消息在全连接网络中广播）
 * - 空间复杂度：O(n) 每个节点维护的日志与准备证书（prepare certificate）
 */

export type PbftPhase = 'idle' | 'pre-prepare' | 'prepare' | 'commit' | 'replied';

export interface PbftMessage {
  readonly view: number;
  readonly sequence: number;
  readonly digest: string;
  readonly clientId: string;
  readonly type: 'REQUEST' | 'PRE-PREPARE' | 'PREPARE' | 'COMMIT' | 'REPLY';
  readonly senderId: string;
  readonly payload?: string;
}

/** 模拟摘要生成（实际应为密码学哈希） */
function digest(value: string): string {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = ((hash << 5) - hash + value.charCodeAt(i)) | 0;
  }
  return `0x${Math.abs(hash).toString(16).padStart(8, '0')}`;
}

export class PbftNode {
  readonly id: string;
  readonly isByzantine: boolean;
  private view = 0;
  private sequence = 0;
  private log: PbftMessage[] = [];
  private prepareVotes = new Map<string, Set<string>>();
  private commitVotes = new Map<string, Set<string>>();
  private prepared = new Set<string>();
  private committed = new Set<string>();
  private replies = new Map<string, string>();

  constructor(id: string, isByzantine: boolean) {
    this.id = id;
    this.isByzantine = isByzantine;
  }

  get currentView(): number {
    return this.view;
  }

  maxFaulty(totalNodes: number): number {
    return Math.floor((totalNodes - 1) / 3);
  }

  quorumSize(totalNodes: number): number {
    const f = this.maxFaulty(totalNodes);
    return 2 * f + 1;
  }

  isPrimary(allNodes: readonly PbftNode[]): boolean {
    const sorted = [...allNodes].map(n => n.id).sort();
    const primaryIndex = this.view % sorted.length;
    return sorted[primaryIndex] === this.id;
  }

  /** 客户端发送请求给主节点 */
  handleRequest(msg: PbftMessage, allNodes: readonly PbftNode[]): PbftMessage[] {
    if (this.isByzantine) {
      // 拜占庭节点发送不一致的消息
      return this.generateByzantineMessages(msg);
    }

    this.log.push(msg);
    this.sequence++;
    const seq = this.sequence;
    const d = digest(msg.payload ?? '');
    const key = `${this.view}-${seq}-${d}`;

    // 主节点 implicit 投票给 prepare
    const prepareVotes = this.prepareVotes.get(key) ?? new Set<string>();
    prepareVotes.add(this.id);
    this.prepareVotes.set(key, prepareVotes);

    const prePrepare: PbftMessage = {
      view: this.view,
      sequence: seq,
      digest: d,
      clientId: msg.clientId,
      type: 'PRE-PREPARE',
      senderId: this.id,
      payload: msg.payload
    };

    return [prePrepare];
  }

  /** 处理 Pre-Prepare 消息 */
  handlePrePrepare(msg: PbftMessage, allNodes: readonly PbftNode[]): PbftMessage[] {
    if (this.isByzantine) return this.generateByzantineMessages(msg);

    this.log.push(msg);
    const key = `${msg.view}-${msg.sequence}-${msg.digest}`;

    const votes = this.prepareVotes.get(key) ?? new Set<string>();
    // 收到主节点的 PRE-PREPARE 视同主节点已 PREPARE
    votes.add(msg.senderId);
    votes.add(this.id);
    this.prepareVotes.set(key, votes);

    const prepare: PbftMessage = {
      view: msg.view,
      sequence: msg.sequence,
      digest: msg.digest,
      clientId: msg.clientId,
      type: 'PREPARE',
      senderId: this.id,
      payload: msg.payload
    };

    return [prepare];
  }

  /** 处理 Prepare 消息 */
  handlePrepare(msg: PbftMessage, allNodes: readonly PbftNode[]): PbftMessage[] {
    if (this.isByzantine) return this.generateByzantineMessages(msg);

    const key = `${msg.view}-${msg.sequence}-${msg.digest}`;
    const votes = this.prepareVotes.get(key) ?? new Set<string>();
    votes.add(msg.senderId);
    this.prepareVotes.set(key, votes);

    if (votes.size >= this.quorumSize(allNodes.length) && !this.prepared.has(key)) {
      this.prepared.add(key);
      // implicit 投票给 commit
      const commitVotes = this.commitVotes.get(key) ?? new Set<string>();
      commitVotes.add(this.id);
      this.commitVotes.set(key, commitVotes);

      const commit: PbftMessage = {
        view: msg.view,
        sequence: msg.sequence,
        digest: msg.digest,
        clientId: msg.clientId,
        type: 'COMMIT',
        senderId: this.id,
        payload: msg.payload
      };
      return [commit];
    }

    return [];
  }

  /** 处理 Commit 消息 */
  handleCommit(msg: PbftMessage, allNodes: readonly PbftNode[]): PbftMessage[] {
    if (this.isByzantine) return this.generateByzantineMessages(msg);

    const key = `${msg.view}-${msg.sequence}-${msg.digest}`;
    const votes = this.commitVotes.get(key) ?? new Set<string>();
    votes.add(msg.senderId);
    this.commitVotes.set(key, votes);

    if (votes.size >= this.quorumSize(allNodes.length) && !this.committed.has(key)) {
      this.committed.add(key);
      this.replies.set(key, msg.payload ?? '');
      console.log(`[PBFT ${this.id}] 已提交请求 (view=${msg.view}, seq=${msg.sequence}, digest=${msg.digest})`);
      const reply: PbftMessage = {
        view: msg.view,
        sequence: msg.sequence,
        digest: msg.digest,
        clientId: msg.clientId,
        type: 'REPLY',
        senderId: this.id,
        payload: msg.payload
      };
      return [reply];
    }

    return [];
  }

  hasCommitted(digestHash: string): boolean {
    for (const key of this.committed) {
      if (key.endsWith(`-${digestHash}`)) return true;
    }
    return false;
  }

  private generateByzantineMessages(original: PbftMessage): PbftMessage[] {
    // 拜占庭节点可能发送伪造的 prepare/commit，但在此模拟中简化为发送冲突摘要
    const fakeDigest = digest(`${original.payload ?? ''}-fake`);
    return [
      {
        ...original,
        digest: fakeDigest,
        type: 'PREPARE',
        senderId: this.id
      },
      {
        ...original,
        digest: fakeDigest,
        type: 'COMMIT',
        senderId: this.id
      }
    ];
  }
}

/** PBFT 网络模拟器 */
export class PbftNetwork {
  private _nodes: PbftNode[] = [];

  get nodes(): readonly PbftNode[] {
    return this._nodes;
  }

  addNode(node: PbftNode): void {
    this._nodes.push(node);
  }

  getNode(id: string): PbftNode | undefined {
    return this._nodes.find(n => n.id === id);
  }

  get f(): number {
    return Math.floor((this._nodes.length - 1) / 3);
  }

  get quorum(): number {
    return 2 * this.f + 1;
  }

  /** 模拟客户端发起请求并在网络中广播 */
  request(clientId: string, payload: string): boolean {
    const primary = this._nodes.find(n => n.isPrimary(this._nodes));
    if (!primary) return false;

    const requestMsg: PbftMessage = {
      view: primary.currentView,
      sequence: 0,
      digest: digest(payload),
      clientId,
      type: 'REQUEST',
      senderId: clientId,
      payload
    };

    // 请求发给主节点
    const prePrepares = primary.handleRequest(requestMsg, this.nodes);
    const messages: PbftMessage[] = [...prePrepares];

    // 广播 Pre-Prepare
    for (const pp of prePrepares) {
      for (const node of this.nodes) {
        if (node.id !== primary.id) {
          messages.push(...node.handlePrePrepare(pp, this.nodes));
        }
      }
    }

    // 处理 Prepare
    const prepares = messages.filter(m => m.type === 'PREPARE');
    for (const p of prepares) {
      for (const node of this._nodes) {
        if (node.id !== p.senderId) {
          messages.push(...node.handlePrepare(p, this._nodes));
        }
      }
    }

    // 处理 Commit
    const commits = messages.filter(m => m.type === 'COMMIT');
    for (const c of commits) {
      for (const node of this._nodes) {
        if (node.id !== c.senderId) {
          messages.push(...node.handleCommit(c, this._nodes));
        }
      }
    }

    // 检查是否达成 commit
    const honestNodes = this.nodes.filter(n => !n.isByzantine);
    const committedCount = honestNodes.filter(n => n.hasCommitted(requestMsg.digest)).length;
    console.log(`[PBFT Network] 诚实节点提交数: ${committedCount}/${honestNodes.length} (quorum=${this.quorum})`);
    return committedCount >= this.quorum;
  }
}

export function demo(): void {
  console.log('=== PBFT 演示 ===\n');

  // n = 4, f = 1
  const network = new PbftNetwork();
  network.addNode(new PbftNode('node-1', false)); // primary
  network.addNode(new PbftNode('node-2', false));
  network.addNode(new PbftNode('node-3', false));
  network.addNode(new PbftNode('node-4', true));  // byzantine

  console.log(`集群规模: ${network.nodes.length}, 最大容错: f=${network.f}, quorum=${network.quorum}`);

  const success = network.request('client-1', 'transfer $100');
  console.log(`\n请求结果: ${success ? '达成一致 ✅' : '失败 ❌'}`);
}
