---
dimension: 综合
sub-dimension: Consensus algorithms
created: 2026-04-28
---

# 模块归属声明

本模块归属 **「综合」** 维度，聚焦 Consensus algorithms 核心概念与工程实践。

## 包含内容

- 本模块聚焦 consensus algorithms 核心概念与工程实践。
- 涵盖 CAP 定理形式化验证、Paxos/Raft 共识实现、领导者选举与分布式时钟同步。

## 子模块速查

| 子模块 | 类型 | 说明 |
|--------|------|------|
| ARCHITECTURE.md | 文档 | 共识算法架构设计 |
| README.md | 文档 | 模块入口与快速开始 |
| THEORY.md | 文档 | 共识理论形式化定义 |
| cap-theorem.ts | 源码 | CAP 定理 TypeScript 实现 |
| cap-theorem-formal.ts | 源码 | CAP 定理形式化证明 |
| distributed-clock.ts | 源码 | 分布式逻辑时钟 |
| leader-election.ts | 源码 | 领导者选举算法 |
| paxos-consensus.ts | 源码 | Multi-Paxos 共识实现 |
| index.ts | 源码 | 模块统一导出 |

## 代码示例

```typescript
// paxos-consensus.ts — 简化的 Paxos Accept 阶段
interface Proposal {
  id: number;
  value: string;
}

class PaxosAcceptor {
  private promisedId = -1;
  private accepted: Proposal | null = null;

  prepare(proposalId: number): Promise<{ ok: boolean; accepted?: Proposal }> {
    if (proposalId <= this.promisedId) {
      return Promise.resolve({ ok: false });
    }
    this.promisedId = proposalId;
    return Promise.resolve({ ok: true, accepted: this.accepted ?? undefined });
  }

  accept(proposal: Proposal): Promise<boolean> {
    if (proposal.id < this.promisedId) return Promise.resolve(false);
    this.accepted = proposal;
    return Promise.resolve(true);
  }
}
```

### Raft 领导者选举模拟

```typescript
// leader-election.ts — Raft 风格任期与投票
enum NodeState { Follower, Candidate, Leader }

interface RaftNode {
  id: string;
  state: NodeState;
  currentTerm: number;
  votedFor: string | null;
  voteCount: number;
}

class RaftCluster {
  private nodes = new Map<string, RaftNode>();
  private heartbeatMs = 150;
  private electionTimeoutMs = 300;

  addNode(id: string) {
    this.nodes.set(id, {
      id,
      state: NodeState.Follower,
      currentTerm: 0,
      votedFor: null,
      voteCount: 0,
    });
  }

  // 节点超时触发选举
  startElection(nodeId: string): boolean {
    const node = this.nodes.get(nodeId);
    if (!node) return false;

    node.state = NodeState.Candidate;
    node.currentTerm += 1;
    node.votedFor = nodeId;
    node.voteCount = 1; // 自己投一票

    // 向其他节点请求投票（简化模拟：随机多数通过）
    for (const [id, peer] of this.nodes) {
      if (id === nodeId) continue;
      if (peer.currentTerm <= node.currentTerm && (peer.votedFor === null || peer.votedFor === nodeId)) {
        peer.votedFor = nodeId;
        node.voteCount++;
      }
    }

    const majority = Math.floor(this.nodes.size / 2) + 1;
    if (node.voteCount >= majority) {
      node.state = NodeState.Leader;
      console.log(`Node ${nodeId} elected leader for term ${node.currentTerm}`);
      return true;
    }

    node.state = NodeState.Follower;
    return false;
  }

  sendHeartbeat(leaderId: string): void {
    const leader = this.nodes.get(leaderId);
    if (!leader || leader.state !== NodeState.Leader) return;

    for (const [, peer] of this.nodes) {
      if (peer.id !== leaderId && peer.currentTerm <= leader.currentTerm) {
        // 重置追随者超时
        peer.state = NodeState.Follower;
        peer.currentTerm = leader.currentTerm;
        peer.votedFor = null;
      }
    }
  }
}

// 演示：3 节点集群选举
const cluster = new RaftCluster();
cluster.addNode('A');
cluster.addNode('B');
cluster.addNode('C');
cluster.startElection('A');
cluster.sendHeartbeat('A');
```

### 分布式逻辑时钟（Lamport & Vector）

```typescript
// distributed-clock.ts
class LamportClock {
  private time = 0;

  tick(): number {
    return ++this.time;
  }

  update(received: number): number {
    this.time = Math.max(this.time, received) + 1;
    return this.time;
  }

  get(): number {
    return this.time;
  }
}

class VectorClock {
  private vector: Map<string, number> = new Map();

  constructor(private nodeId: string) {
    this.vector.set(nodeId, 0);
  }

  tick(): Map<string, number> {
    const current = this.vector.get(this.nodeId) || 0;
    this.vector.set(this.nodeId, current + 1);
    return new Map(this.vector);
  }

  update(other: Map<string, number>): Map<string, number> {
    for (const [node, time] of other) {
      this.vector.set(node, Math.max(this.vector.get(node) || 0, time));
    }
    return this.tick();
  }

  compare(other: Map<string, number>): 'before' | 'after' | 'concurrent' {
    let allLessOrEqual = true;
    let allGreaterOrEqual = true;

    const keys = new Set([...this.vector.keys(), ...other.keys()]);
    for (const k of keys) {
      const a = this.vector.get(k) || 0;
      const b = other.get(k) || 0;
      if (a > b) allLessOrEqual = false;
      if (a < b) allGreaterOrEqual = false;
    }

    if (allLessOrEqual && !allGreaterOrEqual) return 'before';
    if (allGreaterOrEqual && !allLessOrEqual) return 'after';
    if (allLessOrEqual && allGreaterOrEqual) return 'before'; // equal
    return 'concurrent';
  }
}
```

### CAP 定理分区模拟

```typescript
// cap-theorem.ts
interface DistributedSystem {
  nodes: string[];
  partition: Set<string>; // 可达节点集合
}

function simulatePartition(sys: DistributedSystem, partitionId: string): void {
  const partitionA = sys.nodes.filter((_, i) => i % 2 === 0);
  const partitionB = sys.nodes.filter((_, i) => i % 2 === 1);

  console.log(`Network partition occurred:`);
  console.log(`  Partition A: ${partitionA.join(', ')}`);
  console.log(`  Partition B: ${partitionB.join(', ')}`);

  // CP 系统：拒绝写入直到分区恢复
  // AP 系统：允许写入，待分区恢复后合并
}
```

## 相关索引

- `30-knowledge-base/30.2-categories/README.md` — 分类总览
- `20-code-lab/` — 代码实验室实践

## 目录内容

- 📄 ARCHITECTURE.md
- 📄 README.md
- 📄 THEORY.md
- 📄 _MIGRATED_FROM.md
- 📄 cap-theorem-formal.test.ts
- 📄 cap-theorem-formal.ts
- 📄 cap-theorem.ts
- 📄 consensus-algorithms.test.ts
- 📄 distributed-clock.ts
- 📄 index.ts
- 📄 leader-election-theory.test.ts
- 📄 leader-election-theory.ts
- 📄 leader-election.ts
- 📄 paxos-consensus.test.ts
- 📄 paxos-consensus.ts
- ... 等 13 个条目


---

> 此分类文档由批量生成脚本自动创建，请根据实际模块内容补充和调整。


## 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| MDN | 文档 | [developer.mozilla.org](https://developer.mozilla.org) |
| web.dev | 指南 | [web.dev](https://web.dev) |
| Paxos Made Simple | 论文 | [lamport.azurewebsites.net](https://lamport.azurewebsites.net/pubs/paxos-simple.pdf) |
| Raft Consensus | 论文 | [raft.github.io](https://raft.github.io/raft.pdf) |
| FLP Impossibility | 论文 | [groups.csail.mit.edu](https://groups.csail.mit.edu/tds/papers/Lynch/jacm85.pdf) |
| etcd Raft Implementation | 源码 | [github.com/etcd-io/raft](https://github.com/etcd-io/raft) |
| Consus (Deterministic Consensus) | 论文 | [arxiv.org/abs/1502.05831](https://arxiv.org/abs/1502.05831) |
| MIT 6.824 Distributed Systems | 课程 | [pdos.csail.mit.edu/6.824](https://pdos.csail.mit.edu/6.824/) |
| Designing Data-Intensive Applications (Martin Kleppmann) | 书籍 | [dataintensive.net](https://dataintensive.net/) |
| Hashicorp Consul — Consensus Protocol | 文档 | [developer.hashicorp.com/consul/docs/architecture/consensus](https://developer.hashicorp.com/consul/docs/architecture/consensus) |
| Apache ZooKeeper — Internals | 文档 | [zookeeper.apache.org/doc/current/zookeeperInternals.html](https://zookeeper.apache.org/doc/current/zookeeperInternals.html) |
| Distributed Systems Reading List | 资源汇总 | [dancres.github.io/Pages](https://dancres.github.io/Pages/) |

---

*最后更新: 2026-04-29*
