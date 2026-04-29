# 共识算法 — 理论基础

## 1. 共识问题定义

在分布式系统中，多个节点就某个值达成一致，即使部分节点故障。形式化要求：

- **终止性**: 所有正确节点最终做出决定
- **一致性**: 所有正确节点决定相同的值
- **有效性**: 决定的值必须来自某个节点的提议

## 2. 主流共识算法对比

| 维度 | Paxos | Raft | PBFT |
|---|---|---|---|
| 故障模型 | 崩溃容错（Crash Fault） | 崩溃容错（Crash Fault） | 拜占庭容错（Byzantine Fault） |
| 领导者 | 多 Proposer（无固定领导者） | 强领导者（Leader Election） | 主节点轮换（Primary-Backup） |
| 阶段/消息复杂度 | 两阶段（Prepare / Accept） | 两阶段（日志复制 + 心跳） | 三阶段（Pre-Prepare / Prepare / Commit） |
| 工程实现难度 | 极高（出了名的晦涩） | 低（模块化设计） | 中高（网络开销大） |
| 性能特点 | 延迟低但实现复杂 | 延迟低、吞吐高 | 消息数量 O(n²)，节点数受限 |
| 最小节点数 | 2f+1 | 2f+1 | 3f+1 |
| 典型应用 | Chubby、ZooKeeper（ZAB 变体） | etcd、Consul、TiKV、NATS Streaming | Hyperledger Fabric、联盟链 |

## 3. Paxos

Leslie Lamport 提出的经典共识算法：

- **角色**: Proposer（提议者）、Acceptor（接受者）、Learner（学习者）
- **两阶段**: Prepare（承诺不接受更早提案）→ Accept（接受提案）
- **难点**: 工程实现复杂，难以理解和调试

## 4. Raft

Paxos 的工程化替代，通过**强领导者**简化设计：

- **领导者选举**: 基于超时和心跳的选举机制
- **日志复制**: 领导者接收客户端请求，复制到跟随者
- **安全性**: 确保已提交的日志不会被覆盖
- **应用场景**: etcd、Consul、TiKV、NATS Streaming

## 5. Raft 领导者选举伪代码

```text
// 每个节点维护的状态
state ∈ { Follower, Candidate, Leader }
currentTerm = 0
votedFor = null

// 超时器
resetElectionTimeout()

on election timeout:
    state = Candidate
    currentTerm += 1
    votedFor = self
    send RequestVote RPC to all peers
    resetElectionTimeout()

on receiving RequestVote(term, candidateId):
    if term > currentTerm:
        currentTerm = term
        state = Follower
        votedFor = null
    if term == currentTerm and (votedFor == null or votedFor == candidateId):
        votedFor = candidateId
        reply VoteGranted = true
    else:
        reply VoteGranted = false

on receiving AppendEntries(term, leaderId, ...):
    if term >= currentTerm:
        currentTerm = term
        state = Follower
        votedFor = null
        resetElectionTimeout()
        // 处理日志条目...

// 成为 Leader 后
if votes received from majority:
    state = Leader
    send heartbeat AppendEntries to all peers periodically
```

## 6. PBFT（实用拜占庭容错）

容忍拜占庭故障（恶意节点）的共识算法：

- 需要 `3f+1` 个节点容忍 `f` 个拜占庭节点
- 三阶段通信：Pre-Prepare → Prepare → Commit
- 应用场景：区块链（Hyperledger Fabric）、联盟链

## 7. Gossip 协议

最终一致性协议，通过随机传播达到共识：

- 每个节点随机选择邻居交换状态
- 传播速度呈指数级（类似流行病模型）
- 应用场景：Cassandra 反熵、Redis Cluster、区块链 P2P

## 8. 代码示例：Gossip 协议 TypeScript 实现

```typescript
// gossip-protocol.ts

interface GossipNode {
  id: string;
  state: Map<string, unknown>;
  version: Map<string, number>; // Vector clock
  neighbors: string[];
}

class GossipProtocol {
  private nodes = new Map<string, GossipNode>();

  addNode(node: GossipNode) {
    this.nodes.set(node.id, node);
  }

  // Simulate one gossip round for a node
  gossipRound(nodeId: string) {
    const node = this.nodes.get(nodeId);
    if (!node || node.neighbors.length === 0) return;

    // Pick random neighbor
    const neighborId = node.neighbors[Math.floor(Math.random() * node.neighbors.length)];
    const neighbor = this.nodes.get(neighborId);
    if (!neighbor) return;

    // Exchange states: merge newer versions
    this.mergeStates(node, neighbor);
    this.mergeStates(neighbor, node);
  }

  private mergeStates(local: GossipNode, remote: GossipNode) {
    for (const [key, remoteVer] of remote.version) {
      const localVer = local.version.get(key) || 0;
      if (remoteVer > localVer) {
        local.state.set(key, remote.state.get(key)!);
        local.version.set(key, remoteVer);
      }
    }
  }

  setValue(nodeId: string, key: string, value: unknown) {
    const node = this.nodes.get(nodeId);
    if (!node) return;
    node.state.set(key, value);
    node.version.set(key, (node.version.get(key) || 0) + 1);
  }

  // Check convergence: how many nodes share the same value for a key
  convergenceRatio(key: string): number {
    const values = new Map<unknown, number>();
    for (const node of this.nodes.values()) {
      const v = node.state.get(key);
      values.set(v, (values.get(v) || 0) + 1);
    }
    const maxCount = Math.max(...values.values());
    return maxCount / this.nodes.size;
  }
}

// Usage
const gossip = new GossipProtocol();

// Create a 5-node ring topology
for (let i = 0; i < 5; i++) {
  gossip.addNode({
    id: `node-${i}`,
    state: new Map(),
    version: new Map(),
    neighbors: [`node-${(i + 1) % 5}`, `node-${(i + 4) % 5}`],
  });
}

// Node 0 sets a value
gossip.setValue('node-0', 'leader', 'node-0');

// Simulate gossip rounds
for (let round = 0; round < 10; round++) {
  for (let i = 0; i < 5; i++) {
    gossip.gossipRound(`node-${i}`);
  }
  console.log(`Round ${round}: convergence = ${gossip.convergenceRatio('leader')}`);
}
```

## 9. 代码示例：Raft 日志复制状态机（简化）

```typescript
// raft-log-replication.ts

type LogEntry = { term: number; index: number; command: string };
type NodeState = 'Follower' | 'Candidate' | 'Leader';

class RaftNode {
  id: string;
  state: NodeState = 'Follower';
  currentTerm = 0;
  votedFor: string | null = null;
  log: LogEntry[] = [];
  commitIndex = 0;
  lastApplied = 0;

  // Leader state
  nextIndex: Map<string, number> = new Map();
  matchIndex: Map<string, number> = new Map();

  constructor(id: string) {
    this.id = id;
  }

  becomeLeader(peers: string[]) {
    this.state = 'Leader';
    for (const peer of peers) {
      this.nextIndex.set(peer, this.log.length + 1);
      this.matchIndex.set(peer, 0);
    }
  }

  appendEntry(command: string): LogEntry {
    const entry: LogEntry = {
      term: this.currentTerm,
      index: this.log.length + 1,
      command,
    };
    this.log.push(entry);
    return entry;
  }

  // Handle AppendEntries RPC from leader
  handleAppendEntries(
    term: number,
    leaderId: string,
    prevLogIndex: number,
    prevLogTerm: number,
    entries: LogEntry[],
    leaderCommit: number
  ): boolean {
    if (term < this.currentTerm) return false;

    this.currentTerm = term;
    this.state = 'Follower';
    this.votedFor = null;

    // Log consistency check
    if (prevLogIndex > 0) {
      const prevEntry = this.log[prevLogIndex - 1];
      if (!prevEntry || prevEntry.term !== prevLogTerm) {
        return false;
      }
    }

    // Append new entries
    for (let i = 0; i < entries.length; i++) {
      const idx = prevLogIndex + i;
      if (idx < this.log.length && this.log[idx].term !== entries[i].term) {
        // Conflict: truncate
        this.log = this.log.slice(0, idx);
      }
      if (idx >= this.log.length) {
        this.log.push(entries[i]);
      }
    }

    // Update commit index
    if (leaderCommit > this.commitIndex) {
      this.commitIndex = Math.min(leaderCommit, this.log.length);
    }

    return true;
  }

  getLogString(): string {
    return this.log.map(e => `[T${e.term}:${e.command}]`).join(' -> ');
  }
}

// Usage
const leader = new RaftNode('leader-1');
leader.currentTerm = 1;
leader.becomeLeader(['follower-1', 'follower-2']);

leader.appendEntry('SET x=1');
leader.appendEntry('SET y=2');

console.log('Leader log:', leader.getLogString());

const follower = new RaftNode('follower-1');
const success = follower.handleAppendEntries(
  1, 'leader-1', 0, 0, leader.log, leader.commitIndex
);
console.log('Replication success:', success);
console.log('Follower log:', follower.getLogString());
```

## 10. 权威外部链接

### 学术论文与标准
- [Raft 论文（In Search of an Understandable Consensus Algorithm）](https://raft.github.io/raft.pdf)
- [The Part-Time Parliament (Paxos原始论文)](https://lamport.azurewebsites.net/pubs/lamport-paxos.pdf) — Leslie Lamport, ACM TOCS 1998
- [Paxos Made Simple](https://lamport.azurewebsites.net/pubs/paxos-simple.pdf) — Leslie Lamport, 2001
- [Practical Byzantine Fault Tolerance (PBFT)](http://pmg.csail.mit.edu/papers/osdi99.pdf) — Miguel Castro & Barbara Liskov, OSDI 1999
- [CAP Twelve Years Later: How the "Rules" Have Changed](https://sites.cs.ucsb.edu/~rich/class/cs293b-cloud/papers/brewer-cap.pdf) — Eric Brewer, IEEE Computer 2012
- [FLP Impossibility Result](https://groups.csail.mit.edu/tds/papers/Lynch/jacm85.pdf) — Fischer, Lynch, Paterson, JACM 1985

### 官方实现与文档
- [Raft 可视化演示](https://raft.github.io/)
- [etcd 官方文档](https://etcd.io/docs/latest/)
- [etcd-io/raft GitHub 仓库](https://github.com/etcd-io/raft)
- [Consul Consensus 文档](https://www.consul.io/docs/architecture/consensus)
- [Hyperledger Fabric 共识文档](https://hyperledger-fabric.readthedocs.io/en/latest/)
- [ZooKeeper ZAB 协议](https://zookeeper.apache.org/doc/r3.9.2/zookeeperInternals.html)

### 权威技术资源
- [AWS: Distributed Systems and Consensus](https://aws.amazon.com/builders-library/avoiding-fallback-in-distributed-systems/) — Amazon Builders Library
- [Google: The Chubby Lock Service](https://research.google/pubs/pub27897/) — Google Research, OSDI 2006
- [Microsoft: Distributed Consensus in Azure](https://learn.microsoft.com/en-us/azure/architecture/patterns/leader-election) — Azure 架构中心
- [Cloudflare: Consensus in Distributed Systems](https://blog.cloudflare.com/a-borrowed-jubilee/) — Cloudflare 分布式系统博客
- [Apache Cassandra: Gossip Protocol](https://cassandra.apache.org/doc/latest/cassandra/architecture/gossip.html) — Cassandra 官方 Gossip 文档
- [Redis Cluster Specification](https://redis.io/docs/management/scaling/) — Redis 集群规范

## 11. 与相邻模块的关系

- **70-distributed-systems**: 分布式系统的基础理论
- **83-blockchain-advanced**: 区块链共识机制
- **75-chaos-engineering**: 共识算法的韧性测试


---

## 进阶代码示例

### 简化 PBFT 三阶段提交

```typescript
// pbft-lite.ts
type Phase = 'prePrepare' | 'prepare' | 'commit';

interface PBFTMessage {
  view: number;
  sequence: number;
  digest: string;
  phase: Phase;
  nodeId: string;
}

class PBFTNode {
  private view = 0;
  private sequence = 0;
  private logs: PBFTMessage[] = [];
  private f: number;

  constructor(private nodeId: string, totalNodes: number) {
    this.f = Math.floor((totalNodes - 1) / 3);
  }

  receive(msg: PBFTMessage): boolean {
    if (msg.view < this.view) return false;
    this.logs.push(msg);
    return true;
  }

  committed(sequence: number): boolean {
    const commits = this.logs.filter(
      m => m.phase === 'commit' && m.sequence === sequence
    );
    return commits.length >= 2 * this.f + 1;
  }
}

// Usage
const node = new PBFTNode('N0', 4);
const seq = 1;
['prePrepare', 'prepare', 'commit'].forEach((phase) => {
  for (let j = 0; j < 3; j++) {
    node.receive({ view: 0, sequence: seq, digest: 'abc', phase: phase as Phase, nodeId: `N${j}` });
  }
});
console.log('Committed?', node.committed(seq)); // true
```

### 共识网络模拟器

```typescript
// consensus-simulator.ts
interface NetworkNode {
  id: string;
  state: 'Follower' | 'Candidate' | 'Leader';
  term: number;
}

class ConsensusNetwork {
  private nodes: NetworkNode[] = [];

  addNode(node: NetworkNode) {
    this.nodes.push(node);
  }

  simulateElection() {
    for (const node of this.nodes) {
      if (Math.random() > 0.5) {
        node.state = 'Candidate';
        node.term += 1;
      }
    }
    const leader = this.nodes.find(n => n.state === 'Candidate');
    if (leader) leader.state = 'Leader';
    return this.nodes.map(n => ({ id: n.id, state: n.state, term: n.term }));
  }
}

// Usage
const net = new ConsensusNetwork();
['A', 'B', 'C'].forEach(id => net.addNode({ id, state: 'Follower', term: 0 }));
console.log(net.simulateElection());
```

## 新增权威参考链接

- [Tendermint Consensus](https://docs.tendermint.com/v0.34/introduction/what-is-tendermint.html) — BFT 共识引擎
- [HotStuff Paper](https://arxiv.org/abs/1803.05069) — Facebook Diem 共识算法
- [Casper FFG Paper](https://arxiv.org/abs/1710.09437) — Ethereum 权益证明共识
- [Avalanche Consensus Whitepaper](https://arxiv.org/abs/1906.08936) — 雪崩协议
- [Distributed Systems for Fun and Profit](http://book.mixu.net/distsys/) — 免费分布式系统书籍
- [The Byzantine Generals Problem (Lamport)](https://dl.acm.org/doi/10.1145/357172.357176) — 拜占庭将军问题
