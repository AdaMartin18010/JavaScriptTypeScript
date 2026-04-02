/**
 * @file Raft 状态机可视化
 * @category Consensus → Raft → Visualization
 * @difficulty medium
 * @tags raft, state-machine, ascii-visualization, log-replication
 * @description
 * 通过 ASCII 字符画和结构化日志输出，可视化 Raft 节点的状态转换与日志复制过程。
 * 帮助学习者直观理解 Raft 中领导者选举、日志追加、提交等核心概念。
 */

export type VisualNodeState = 'follower' | 'candidate' | 'leader';

export interface VisualLogEntry {
  readonly index: number;
  readonly term: number;
  readonly command: string;
  committed: boolean;
}

export class VisualRaftNode {
  readonly id: string;
  state: VisualNodeState = 'follower';
  currentTerm = 0;
  log: VisualLogEntry[] = [];
  commitIndex = 0;
  votedFor: string | null = null;

  constructor(id: string) {
    this.id = id;
  }

  transition(to: VisualNodeState): void {
    const arrow = `${this.state.padEnd(8)} -> ${to.padEnd(8)}`;
    console.log(`[RaftVisualizer] 节点 ${this.id} 状态转换: ${arrow} (term=${this.currentTerm})`);
    this.state = to;
  }

  appendLog(term: number, command: string): number {
    const index = this.log.length + 1;
    this.log.push({ index, term, command, committed: false });
    return index;
  }

  commitUpTo(index: number): void {
    for (const entry of this.log) {
      if (entry.index <= index) entry.committed = true;
    }
    this.commitIndex = index;
  }

  renderState(): string {
    const stateIcon = this.state === 'leader' ? '★' : this.state === 'candidate' ? '◐' : '○';
    return `${stateIcon} ${this.id.padEnd(8)} term=${this.currentTerm} commit=${this.commitIndex.toString().padStart(2)}`;
  }

  renderLog(): string {
    if (this.log.length === 0) return '  [空日志]';
    const bars = this.log.map(e => {
      const fill = e.committed ? '█' : '░';
      return ` [${e.index}:${e.term}]${fill}`;
    }).join('');
    return `  Log:${bars}  ${this.log.map(e => e.command).join(' | ')}`;
  }
}

export class RaftVisualizer {
  private nodes: VisualRaftNode[] = [];

  addNode(node: VisualRaftNode): void {
    this.nodes.push(node);
  }

  renderCluster(): void {
    console.log('\n┌' + '─'.repeat(60) + '┐');
    console.log('│' + ' Raft 集群状态 '.padStart(35).padEnd(60) + '│');
    console.log('├' + '─'.repeat(60) + '┤');
    for (const n of this.nodes) {
      console.log('│ ' + n.renderState().padEnd(58) + ' │');
      console.log('│ ' + n.renderLog().padEnd(58) + ' │');
    }
    console.log('└' + '─'.repeat(60) + '┘');
  }

  simulateElection(winnerId: string): void {
    console.log('\n>>> 模拟领导者选举');
    for (const n of this.nodes) {
      if (n.id === winnerId) {
        n.currentTerm += 1;
        n.transition('candidate');
        n.transition('leader');
      } else {
        const winnerTerm = this.nodes.find(x => x.id === winnerId)?.currentTerm ?? 0;
        n.currentTerm = Math.max(n.currentTerm, winnerTerm);
        n.transition('follower');
        n.votedFor = winnerId;
      }
    }
    this.renderCluster();
  }

  simulateReplicate(leaderId: string, command: string): void {
    console.log(`\n>>> 模拟日志复制: "${command}"`);
    const leader = this.nodes.find(n => n.id === leaderId);
    if (!leader || leader.state !== 'leader') {
      console.log(`错误: ${leaderId} 不是领导者`);
      return;
    }

    const term = leader.currentTerm;
    const idx = leader.appendLog(term, command);

    // 简化：复制到所有跟随者并提交
    for (const n of this.nodes) {
      if (n.id !== leaderId) {
        n.appendLog(term, command);
      }
    }

    const majority = Math.floor(this.nodes.length / 2) + 1;
    if (this.nodes.length >= majority) {
      for (const n of this.nodes) {
        n.commitUpTo(idx);
      }
      console.log(`日志 [${idx}] 已提交 (复制到 ${this.nodes.length} 个节点)`);
    }

    this.renderCluster();
  }

  simulatePartition(groupA: string[], groupB: string[]): void {
    console.log('\n>>> 模拟网络分区');
    console.log(`分区 A: [${groupA.join(', ')}]`);
    console.log(`分区 B: [${groupB.join(', ')}]`);
    const aSize = groupA.length;
    const bSize = groupB.length;
    const majority = Math.floor(this.nodes.length / 2) + 1;
    console.log(`多数派阈值: ${majority}`);
    console.log(`分区 A 大小=${aSize} ${aSize >= majority ? '→ 可能选举新 Leader' : '→ 无法选举，进入只读/拒绝模式'}`);
    console.log(`分区 B 大小=${bSize} ${bSize >= majority ? '→ 可能选举新 Leader' : '→ 无法选举，进入只读/拒绝模式'}`);
  }
}

export function demo(): void {
  console.log('=== Raft 可视化演示 ===\n');

  const viz = new RaftVisualizer();
  viz.addNode(new VisualRaftNode('node-1'));
  viz.addNode(new VisualRaftNode('node-2'));
  viz.addNode(new VisualRaftNode('node-3'));
  viz.addNode(new VisualRaftNode('node-4'));
  viz.addNode(new VisualRaftNode('node-5'));

  viz.simulateElection('node-1');
  viz.simulateReplicate('node-1', 'SET x=1');
  viz.simulateReplicate('node-1', 'SET y=2');
  viz.simulateReplicate('node-1', 'INCR x');

  // 网络分区演示
  viz.simulatePartition(['node-1', 'node-2'], ['node-3', 'node-4', 'node-5']);
}
