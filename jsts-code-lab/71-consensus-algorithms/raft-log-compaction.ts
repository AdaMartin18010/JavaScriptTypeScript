/**
 * @file Raft 日志压缩（Snapshot）机制
 * @category Consensus → Raft → Log Compaction
 * @difficulty hard
 * @description
 * Raft 中日志会无限增长，需要定期压缩。Snapshot 将当前状态机持久化为快照，
 * 并截断已包含在快照中的日志前缀。当落后节点无法通过 AppendEntries 追平时，
 * 领导者通过 InstallSnapshot RPC 直接发送快照。
 *
 * 数学模型：
 * - 日志 L = [l₁, l₂, ..., lₙ]，快照点 lastIncludedIndex = k。
 * - 截断后日志 L' = [lₖ₊₁, ..., lₙ]，状态机状态 Sₖ 被快照持久化。
 * - InstallSnapshot 保证：若跟随者日志起始索引 > k，则覆盖；若 < k，则截断前缀。
 *
 * @complexity_analysis
 * - 快照生成：O(|S|)，S 为状态机大小
 * - InstallSnapshot 传输：O(|S|) 网络开销
 * - 日志截断：O(1)（只需调整偏移指针）
 */

export interface CompactedLogEntry {
  readonly term: number;
  readonly index: number;
  readonly command: string;
}

export interface Snapshot {
  readonly lastIncludedTerm: number;
  readonly lastIncludedIndex: number;
  readonly data: Record<string, unknown>;
}

export interface InstallSnapshotRequest {
  readonly term: number;
  readonly leaderId: string;
  readonly lastIncludedIndex: number;
  readonly lastIncludedTerm: number;
  readonly data: Record<string, unknown>;
  readonly done: boolean;
}

export interface InstallSnapshotResponse {
  readonly term: number;
  readonly success: boolean;
}

export class RaftNodeWithSnapshot {
  readonly id: string;
  currentTerm = 0;
  log: CompactedLogEntry[] = [];
  commitIndex = 0;
  lastApplied = 0;
  stateMachine: Record<string, unknown> = {};
  snapshot: Snapshot | null = null;
  logOffset = 0; // 被截断的日志前缀长度

  constructor(id: string) {
    this.id = id;
  }

  /** 将命令应用到状态机 */
  applyCommand(entry: CompactedLogEntry): void {
    if (entry.command.startsWith('SET ')) {
      const [, kv] = entry.command.split('SET ');
      if (kv) {
        const [k, v] = kv.split('=');
        if (k !== undefined && v !== undefined) {
          this.stateMachine[k.trim()] = v.trim();
        }
      }
    }
    this.lastApplied = entry.index;
  }

  /** 生成快照，截断日志 */
  takeSnapshot(upToIndex: number): void {
    if (upToIndex > this.lastApplied) {
      console.log(`[Snapshot ${this.id}] 无法快照未应用的索引 ${upToIndex}`);
      return;
    }

    const entry = this.log.find(e => e.index === upToIndex);
    if (!entry && this.log.length === 0 && this.snapshot) {
      // 已有快照，无需重复
      return;
    }

    const term = entry?.term ?? (this.snapshot?.lastIncludedTerm ?? 0);
    this.snapshot = {
      lastIncludedTerm: term,
      lastIncludedIndex: upToIndex,
      data: { ...this.stateMachine }
    };

    // 截断日志前缀
    this.log = this.log.filter(e => e.index > upToIndex);
    this.logOffset = upToIndex;

    console.log(`[Snapshot ${this.id}] 生成快照到索引 ${upToIndex}，剩余日志长度 ${this.log.length}`);
  }

  /** 处理 InstallSnapshot RPC */
  installSnapshot(req: InstallSnapshotRequest): InstallSnapshotResponse {
    if (req.term < this.currentTerm) {
      return { term: this.currentTerm, success: false };
    }

    this.currentTerm = req.term;

    // 若本地已有更晚的快照，忽略
    if (this.snapshot && req.lastIncludedIndex <= this.snapshot.lastIncludedIndex) {
      return { term: this.currentTerm, success: true };
    }

    this.snapshot = {
      lastIncludedTerm: req.lastIncludedTerm,
      lastIncludedIndex: req.lastIncludedIndex,
      data: { ...req.data }
    };
    this.stateMachine = { ...req.data };
    this.logOffset = req.lastIncludedIndex;

    // 丢弃与快照冲突的日志
    this.log = this.log.filter(e => e.index > req.lastIncludedIndex);
    this.lastApplied = Math.max(this.lastApplied, req.lastIncludedIndex);
    this.commitIndex = Math.max(this.commitIndex, req.lastIncludedIndex);

    console.log(`[Snapshot ${this.id}] 安装快照到索引 ${req.lastIncludedIndex}，来自领导者 ${req.leaderId}`);
    return { term: this.currentTerm, success: true };
  }

  /** 获取有效日志索引（考虑偏移） */
  get effectiveLogStart(): number {
    return this.logOffset;
  }

  /** 获取最后日志索引 */
  get lastLogIndex(): number {
    if (this.log.length === 0) return this.logOffset;
    return this.log[this.log.length - 1]!.index;
  }

  /** 查找指定索引的日志条目 */
  getEntry(index: number): CompactedLogEntry | undefined {
    if (index <= this.logOffset) return undefined;
    return this.log.find(e => e.index === index);
  }
}

export class RaftLogCompactionCluster {
  private nodes = new Map<string, RaftNodeWithSnapshot>();
  private leaderId: string | null = null;

  addNode(id: string): void {
    this.nodes.set(id, new RaftNodeWithSnapshot(id));
  }

  setLeader(id: string): void {
    this.leaderId = id;
  }

  getNode(id: string): RaftNodeWithSnapshot | undefined {
    return this.nodes.get(id);
  }

  /** 领导者提交命令并复制 */
  submitCommand(leaderId: string, command: string): boolean {
    if (this.leaderId !== leaderId) return false;
    const leader = this.nodes.get(leaderId);
    if (!leader) return false;

    const index = leader.lastLogIndex + 1;
    const entry: CompactedLogEntry = { term: leader.currentTerm, index, command };
    leader.log.push(entry);
    leader.applyCommand(entry);
    leader.commitIndex = index;

    // 复制到所有跟随者
    for (const [id, node] of this.nodes) {
      if (id !== leaderId) {
        // 若跟随者日志起始索引大于 entry.index，说明需要快照
        if (node.effectiveLogStart > index || node.lastLogIndex + 1 < index) {
          // 触发快照安装
          this.sendSnapshot(leader, node);
        }
        // 追加日志（简化：假设总是成功）
        node.log.push(entry);
        node.applyCommand(entry);
        node.commitIndex = index;
      }
    }

    console.log(`[RaftCompaction] 领导者 ${leaderId} 提交命令: ${command} @ index=${index}`);
    return true;
  }

  /** 领导者触发本地快照 */
  leaderSnapshot(leaderId: string, upToIndex: number): void {
    const leader = this.nodes.get(leaderId);
    if (!leader) return;
    leader.takeSnapshot(upToIndex);
  }

  /** 向落后节点发送快照 */
  private sendSnapshot(leader: RaftNodeWithSnapshot, follower: RaftNodeWithSnapshot): void {
    if (!leader.snapshot) return;
    const req: InstallSnapshotRequest = {
      term: leader.currentTerm,
      leaderId: leader.id,
      lastIncludedIndex: leader.snapshot.lastIncludedIndex,
      lastIncludedTerm: leader.snapshot.lastIncludedTerm,
      data: leader.snapshot.data,
      done: true
    };
    follower.installSnapshot(req);
  }

  /** 模拟一个严重落后的节点通过 InstallSnapshot 恢复 */
  recoverLaggingNode(nodeId: string): boolean {
    const node = this.nodes.get(nodeId);
    const leader = this.leaderId ? this.nodes.get(this.leaderId) : undefined;
    if (!node || !leader || !leader.snapshot) return false;

    // 模拟节点日志被清空（极端落后）
    node.log = [];
    node.logOffset = 0;
    node.lastApplied = 0;
    node.commitIndex = 0;
    node.stateMachine = {};
    node.snapshot = null;

    this.sendSnapshot(leader, node);

    // 追加领导者当前日志并应用
    for (const entry of leader.log) {
      node.log.push(entry);
      if (entry.index > node.lastApplied) {
        node.applyCommand(entry);
      }
    }
    node.commitIndex = leader.commitIndex;

    console.log(`[RaftCompaction] 节点 ${nodeId} 通过快照恢复，当前 commit=${node.commitIndex}`);
    return true;
  }
}

export function demo(): void {
  console.log('=== Raft 日志压缩演示 ===\n');

  const cluster = new RaftLogCompactionCluster();
  cluster.addNode('node-1');
  cluster.addNode('node-2');
  cluster.addNode('node-3');
  cluster.setLeader('node-1');

  const leader = cluster.getNode('node-1')!;
  leader.currentTerm = 1;
  for (const n of ['node-2', 'node-3']) {
    cluster.getNode(n)!.currentTerm = 1;
  }

  console.log('--- 提交多条命令 ---');
  for (let i = 1; i <= 5; i++) {
    cluster.submitCommand('node-1', `SET key${i}=value${i}`);
  }

  console.log('\n--- 领导者生成快照 ---');
  cluster.leaderSnapshot('node-1', 3);
  console.log(`领导者日志长度: ${leader.log.length}, 偏移: ${leader.effectiveLogStart}, 最后索引: ${leader.lastLogIndex}`);

  console.log('\n--- 继续提交命令 ---');
  cluster.submitCommand('node-1', 'SET key6=value6');

  console.log('\n--- 模拟 node-2 极端落后，通过 InstallSnapshot 恢复 ---');
  cluster.recoverLaggingNode('node-2');

  console.log('\n--- 最终状态 ---');
  for (const id of ['node-1', 'node-2', 'node-3']) {
    const node = cluster.getNode(id)!;
    console.log(`${id}: logOffset=${node.effectiveLogStart}, lastLog=${node.lastLogIndex}, stateMachine=${JSON.stringify(node.stateMachine)}`);
  }
}
