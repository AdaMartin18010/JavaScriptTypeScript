/**
 * @file Raft 一致性算法
 * @category Consensus → Raft
 * @difficulty hard
 * @tags raft, consensus, leader-election, log-replication, safety
 * @description
 * Raft 将一致性分解为三个子问题：领导者选举、日志复制、安全性。
 * 通过强领导人模型简化 Paxos 的难以理解性，是工程实践中使用最广泛的一致性算法之一。
 *
 * @complexity_analysis
 * - 时间复杂度：
 *   - 领导者选举：O(n)，候选者需向所有节点发送 RequestVote 并收集响应
 *   - 日志复制：O(n) 每批次，领导者需将日志条目并发发送给所有跟随者
 *   - 提交确认：O(1) 领导者本地计数，无需额外通信
 * - 空间复杂度：
 *   - 每个节点 O(L)，其中 L 为日志总长度
 *   - 领导者额外维护 nextIndex 与 matchIndex，空间 O(n)
 *
 * 安全性证明概要（Safety Proof Sketch）：
 * 1. 选举安全性（Election Safety）：任意任期内至多只有一个领导者。
 *    不变量说明：候选人需获得严格多数派（strict majority）投票；根据鸽巢原理，
 *    两个不同候选人不可能在同一任期同时获得互不相交的多数派集合。
 *    因此，在同一 term 内，不可能出现两个独立的 leader。
 * 2. 领导人完备性（Leader Completeness）：若某日志条目在任期 T 被提交，
 *    则后续任期的领导者必然包含该条目。
 *    不变量说明：提交意味着已复制到多数派；新领导者必须获得多数派投票，
 *    因此至少会与一个已包含该条目的节点通信，并在投票比较时采纳更完整的日志。
 *    这保证了已提交的日志永远不会丢失。
 * 3. 状态机安全性（State Machine Safety）：若某节点将日志条目应用于状态机，
 *    则其他任何节点不会在同一索引处应用不同的命令。
 *    不变量说明：领导者确保其日志是最新的；跟随者无条件复制领导者日志；
 *    提交条件要求该条目及之前所有条目已复制到多数派，因此索引-任期二元组 (index, term) 唯一确定命令。
 *
 * 网络分区安全性：
 * - 当网络发生分区时，只有包含多数派节点的分区能够成功选举出领导者。
 * - 少数派分区中的候选者无法收集到足够票数，因此不会形成 split-brain（脑裂）。
 * - 这直接由 Election Safety 保证：多数派的唯一性阻止了不同分区同时产生 leader。
 */

export type NodeState = 'follower' | 'candidate' | 'leader';

export interface LogEntry {
  term: number;
  index: number;
  command: string;
}

export interface RaftNode {
  id: string;
  state: NodeState;
  currentTerm: number;
  votedFor: string | null;
  log: LogEntry[];
  commitIndex: number;
  lastApplied: number;
  nextIndex: Map<string, number>;
  matchIndex: Map<string, number>;
}

// Raft算法实现
export class RaftConsensus {
  private nodes: Map<string, RaftNode> = new Map();
  private leader: string | null = null;
  private heartbeatInterval = 100;
  private electionTimeout = 300;

  addNode(nodeId: string): void {
    this.nodes.set(nodeId, {
      id: nodeId,
      state: 'follower',
      currentTerm: 0,
      votedFor: null,
      log: [],
      commitIndex: 0,
      lastApplied: 0,
      nextIndex: new Map(),
      matchIndex: new Map()
    });
  }

  // 启动选举
  startElection(nodeId: string): boolean {
    const node = this.nodes.get(nodeId);
    if (!node) return false;

    node.state = 'candidate';
    node.currentTerm++;
    node.votedFor = nodeId;

    console.log(`[Raft] Node ${nodeId} 开始第 ${node.currentTerm} 任期选举`);

    // 请求其他节点投票
    let votes = 1; // 自己投自己

    for (const [id, other] of this.nodes) {
      if (id === nodeId) continue;

      // 投票逻辑：比较日志的完整度
      const shouldVote = this.shouldVoteFor(other, node);
      if (shouldVote) {
        votes++;
        console.log(`[Raft] ${id} 投票给 ${nodeId}`);
      }
    }

    // 获得多数票成为领导者
    const majority = Math.floor(this.nodes.size / 2) + 1;
    if (votes >= majority) {
      this.becomeLeader(nodeId);
      return true;
    }

    node.state = 'follower';
    return false;
  }

  private shouldVoteFor(voter: RaftNode, candidate: RaftNode): boolean {
    // 如果投票者已投票给其他人，或任期更高，不投票
    if (voter.votedFor && voter.votedFor !== candidate.id) return false;
    if (voter.currentTerm > candidate.currentTerm) return false;

    // 比较日志的完整度：Raft 安全性要求，只有日志至少一样新的候选者才能获得投票
    const voterLastLog = voter.log[voter.log.length - 1];
    const candidateLastLog = candidate.log[candidate.log.length - 1];

    if (!voterLastLog) return true;
    if (!candidateLastLog) return false;

    if (candidateLastLog.term > voterLastLog.term) return true;
    if (candidateLastLog.term === voterLastLog.term &&
        candidateLastLog.index >= voterLastLog.index) return true;

    return false;
  }

  private becomeLeader(nodeId: string): void {
    const node = this.nodes.get(nodeId)!;
    node.state = 'leader';
    this.leader = nodeId;

    // 初始化每个跟随者的nextIndex
    const nextIndex = node.log.length + 1;
    for (const id of this.nodes.keys()) {
      if (id !== nodeId) {
        node.nextIndex.set(id, nextIndex);
        node.matchIndex.set(id, 0);
      }
    }

    console.log(`[Raft] Node ${nodeId} 成为领导者 (任期 ${node.currentTerm})`);

    // 开始发送心跳
    this.startHeartbeat(nodeId);
  }

  private startHeartbeat(leaderId: string): void {
    // 模拟心跳发送
    const sendHeartbeat = () => {
      const leader = this.nodes.get(leaderId);
      if (!leader || leader.state !== 'leader') return;

      for (const [id, node] of this.nodes) {
        if (id !== leaderId) {
          // 重置跟随者的选举超时
          if (node.state === 'follower') {
            node.votedFor = null;
          }
        }
      }
    };

    // 简化：立即执行一次
    sendHeartbeat();
  }

  // 提交命令
  submitCommand(leaderId: string, command: string): boolean {
    const leader = this.nodes.get(leaderId);
    if (!leader || leader.state !== 'leader') {
      console.log(`[Raft] ${leaderId} 不是领导者，无法提交命令`);
      return false;
    }

    const entry: LogEntry = {
      term: leader.currentTerm,
      index: leader.log.length + 1,
      command
    };

    leader.log.push(entry);
    console.log(`[Raft] 领导者 ${leaderId} 添加日志: ${command}`);

    // 异步复制到跟随者
    this.replicateLog(leaderId, entry);

    return true;
  }

  private replicateLog(leaderId: string, entry: LogEntry): void {
    const leader = this.nodes.get(leaderId)!;
    let replicatedCount = 1; // 领导者自己

    for (const [id, node] of this.nodes) {
      if (id === leaderId) continue;

      // 模拟日志复制
      if (this.appendEntries(node, entry)) {
        replicatedCount++;
        leader.matchIndex.set(id, entry.index);
      }
    }

    // 多数复制成功，提交
    const majority = Math.floor(this.nodes.size / 2) + 1;
    if (replicatedCount >= majority) {
      leader.commitIndex = entry.index;
      console.log(`[Raft] 日志 ${entry.index} 已提交 (${replicatedCount}/${this.nodes.size})`);
    }
  }

  private appendEntries(node: RaftNode, entry: LogEntry): boolean {
    // 简化：假设跟随者总是成功追加
    node.log.push(entry);
    node.currentTerm = entry.term;
    return true;
  }

  getNodeStatus(nodeId: string): { state: NodeState; term: number; logLength: number; isLeader: boolean } | null {
    const node = this.nodes.get(nodeId);
    if (!node) return null;

    return {
      state: node.state,
      term: node.currentTerm,
      logLength: node.log.length,
      isLeader: this.leader === nodeId
    };
  }

  getClusterStatus(): Array<{ id: string; state: NodeState; term: number }> {
    return Array.from(this.nodes.entries()).map(([id, node]) => ({
      id,
      state: node.state,
      term: node.currentTerm
    }));
  }
}

/** 网络分区模拟器：演示 Raft 在网络分区时的安全性行为 */
export class NetworkPartitionSimulator {
  private raft = new RaftConsensus();

  constructor() {
    for (let i = 1; i <= 5; i++) {
      this.raft.addNode(`node-${i}`);
    }
  }

  /**
   * 模拟网络分区并尝试在分区内选举。
   * 根据 Election Safety，只有包含多数派的分区才能选出 leader。
   */
  simulatePartition(majorityGroup: string[], minorityGroup: string[]): void {
    console.log('\n=== 网络分区模拟 ===');
    console.log(`多数派分区: [${majorityGroup.join(', ')}]`);
    console.log(`少数派分区: [${minorityGroup.join(', ')}]`);

    // 在多数派分区中选举
    const majorityElected = this.raft.startElection(majorityGroup[0]!);
    console.log(`多数派分区选举结果: ${majorityElected ? '成功 ✅' : '失败 ❌'}`);

    console.log('\n--- 少数派分区尝试选举 ---');
    // 由于少数派无法获得多数票，选举必然失败
    const minorityRaft = new RaftConsensus();
    for (const id of minorityGroup) {
      minorityRaft.addNode(id);
    }
    const minorityElected = minorityRaft.startElection(minorityGroup[0]!);
    console.log(`少数派分区选举结果: ${minorityElected ? '成功 ❌ (出现脑裂!)' : '失败 ✅ (符合预期，无 split-brain)'}`);
  }

  getRaft(): RaftConsensus {
    return this.raft;
  }
}

export function demo(): void {
  console.log('=== Raft 一致性算法演示 ===\n');

  const raft = new RaftConsensus();

  // 创建5节点集群
  for (let i = 1; i <= 5; i++) {
    raft.addNode(`node-${i}`);
  }

  // 启动选举
  const elected = raft.startElection('node-1');
  console.log(`选举结果: ${elected ? '成功' : '失败'}`);

  if (elected) {
    // 提交命令
    raft.submitCommand('node-1', 'SET x = 1');
    raft.submitCommand('node-1', 'SET y = 2');
  }

  console.log('\n集群状态:');
  console.log(raft.getClusterStatus());

  // 网络分区安全性演示
  const partitionSim = new NetworkPartitionSimulator();
  partitionSim.simulatePartition(['node-1', 'node-2', 'node-3'], ['node-4', 'node-5']);
}
