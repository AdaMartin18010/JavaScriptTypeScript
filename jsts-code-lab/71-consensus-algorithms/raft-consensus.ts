/**
 * @file Raft一致性算法
 * @category Consensus → Raft
 * @difficulty hard
 * @tags raft, consensus, leader-election, log-replication
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
    
    // 比较日志的完整度
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

// 简单Paxos实现
export interface PaxosValue {
  proposalNumber: number;
  value: string;
  proposer: string;
}

export class PaxosConsensus {
  private promises: Map<string, Set<string>> = new Map();
  private accepts: Map<string, Map<number, PaxosValue>> = new Map();
  private chosen: Map<string, PaxosValue> = new Map();
  private maxProposalNumber = 0;
  
  // Phase 1: Prepare
  prepare(proposalNumber: number, proposer: string): { promised: boolean; existingValue?: PaxosValue } {
    if (proposalNumber <= this.maxProposalNumber) {
      return { promised: false };
    }
    
    this.maxProposalNumber = proposalNumber;
    
    // 查找已接受的值
    const accepted = this.accepts.get('default');
    if (accepted && accepted.size > 0) {
      const highest = Array.from(accepted.values())
        .sort((a, b) => b.proposalNumber - a.proposalNumber)[0];
      return { promised: true, existingValue: highest };
    }
    
    return { promised: true };
  }
  
  // Phase 2: Accept
  accept(proposal: PaxosValue): boolean {
    if (proposal.proposalNumber < this.maxProposalNumber) {
      return false;
    }
    
    if (!this.accepts.has('default')) {
      this.accepts.set('default', new Map());
    }
    
    this.accepts.get('default')!.set(proposal.proposalNumber, proposal);
    
    // 检查是否被选定
    this.checkChosen('default');
    
    return true;
  }
  
  private checkChosen(instance: string): void {
    const accepts = this.accepts.get(instance);
    if (!accepts) return;
    
    // 简化：一旦有值被接受，就认为选定
    if (accepts.size > 0 && !this.chosen.has(instance)) {
      const chosen = Array.from(accepts.values())
        .sort((a, b) => b.proposalNumber - a.proposalNumber)[0];
      this.chosen.set(instance, chosen);
      console.log(`[Paxos] 值已选定: ${chosen.value} (提案 ${chosen.proposalNumber})`);
    }
  }
  
  getChosenValue(instance: string = 'default'): PaxosValue | undefined {
    return this.chosen.get(instance);
  }
}

export function demo(): void {
  console.log('=== 一致性算法 ===\n');
  
  // Raft演示
  console.log('--- Raft算法 ---');
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
  
  // Paxos演示
  console.log('\n--- Paxos算法 ---');
  const paxos = new PaxosConsensus();
  
  // 第一阶段
  const prepare1 = paxos.prepare(1, 'proposer-a');
  console.log(`提案1准备: ${prepare1.promised ? '成功' : '失败'}`);
  
  // 第二阶段
  const accepted = paxos.accept({
    proposalNumber: 1,
    value: 'value-a',
    proposer: 'proposer-a'
  });
  console.log(`提案1接受: ${accepted ? '成功' : '失败'}`);
  
  console.log(`选定值: ${paxos.getChosenValue()?.value}`);
}
