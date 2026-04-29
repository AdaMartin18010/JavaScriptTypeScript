# 共识算法 — 架构设计

## 1. 架构概述

本模块深入实现了多种分布式共识算法的核心逻辑，包括 Raft、PBFT 和 Gossip 协议。通过模拟网络环境验证算法在故障场景下的行为。架构采用"算法引擎 + 网络模拟 + 状态可视化"的分层设计，每个共识算法作为独立的确定性状态机运行，通过可配置的消息传递层交换提案和确认，使分布式系统的核心难题在教学环境中可观察、可验证。

## 2. 架构图

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       可视化与测试层 (Visualization & Test)              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                   │
│  │   State      │  │   Log        │  │   Fuzz       │                   │
│  │   Machine    │  │   Replay     │  │   Tester     │                   │
│  │   Viz        │  │   (Event     │  │   (Chaos     │                   │
│  │              │  │   Sourcing)  │  │   Monkey)    │                   │
│  └──────────────┘  └──────────────┘  └──────────────┘                   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       共识算法引擎层 (Consensus Engines)                 │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐       │
│  │      Raft        │  │      PBFT        │  │     Gossip       │       │
│  │  ┌────────────┐  │  │  ┌────────────┐  │  │  ┌────────────┐  │       │
│  │  │  Election  │  │  │  │Pre-Prepare │  │  │  │   Digest   │  │       │
│  │  │  (Timeout) │  │  │  │  Handler   │  │  │  │  Exchange  │  │       │
│  │  ├────────────┤  │  │  ├────────────┤  │  │  ├────────────┤  │       │
│  │  │  Log Mgmt  │  │  │  │  Prepare   │  │  │  │Anti-Entropy│  │       │
│  │  │ (Index/Term)│  │  │  │  Handler   │  │  │  │  Repair    │  │       │
│  │  ├────────────┤  │  │  ├────────────┤  │  │  ├────────────┤  │       │
│  │  │ Snapshotter│  │  │  │  Commit    │  │  │  │   Scuttle  │  │       │
│  │  │(Compaction)│  │  │  │  Handler   │  │  │  │   Butt     │  │       │
│  │  └────────────┘  │  │  ├────────────┤  │  │  └────────────┘  │       │
│  │                  │  │  │View Changer│  │  │                  │       │
│  │                  │  │  │(Byzantine) │  │  │                  │       │
│  │                  │  │  └────────────┘  │  │                  │       │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘       │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       网络模拟层 (Network Simulation)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │   Message    │  │   Latency    │  │   Partition  │  │   Packet    │ │
│  │   Router     │  │   Injector   │  │   Simulator  │  │   Loss      │ │
│  │(Broadcast /  │  │(Configurable │  │(Network     │  │ (Probabilis-│ │
│  │ Unicast)     │  │  Delay)      │  │  Split)      │  │ tic)        │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       节点层 (Node Layer)                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Node 0  │  │  Node 1  │  │  Node 2  │  │  Node 3  │  │  Node 4  │  │
│  │ (Leader) │  │(Follower)│  │(Follower)│  │(Follower)│  │(Follower)│  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

## 3. 核心组件

### 3.1 Raft 实现

| 组件 | 职责 | 状态转换 | 关键参数 |
|------|------|----------|----------|
| Election Module | 超时驱动的领导者选举 | Follower -> Candidate -> Leader | electionTimeout: 150-300ms |
| Log Manager | 日志索引、任期管理、提交判定 | 日志复制 + 提交索引推进 | heartbeatInterval: 50ms |
| Snapshotter | 状态快照，加速新节点加入 | 日志压缩 + 快照传输 | snapshotInterval: 10000 |

### 3.2 PBFT 实现

| 组件 | 职责 | 消息类型 | 容错能力 |
|------|------|----------|----------|
| Message Handler | Pre-Prepare/Prepare/Commit 三阶段处理 | PRE-PREPARE, PREPARE, COMMIT | f < n/3 |
| View Changer | 主节点故障时的视图切换 | VIEW-CHANGE, NEW-VIEW | 视图轮换 |
| Checkpoint Manager | 周期性检查点，清理旧日志 | CHECKPOINT | 稳定点共识 |

### 3.3 Gossip 实现

| 组件 | 职责 | 传播模型 | 一致性保证 |
|------|------|----------|------------|
| Peer Selector | 随机选择通信邻居 | 随机 / 偏向 / 拓扑感知 | 概率性 |
| Digest Exchange | 摘要比较，只同步差异 | Merkle Tree / 版本向量 | 最终一致 |
| Anti-Entropy | 周期性全量同步修复不一致 | 推/拉/推拉混合 | 修复收敛 |

## 4. 数据流

```
Client -> Leader/Primary -> Broadcast to Replicas -> Collect Ack -> Commit -> Reply to Client
```

## 5. 共识算法对比

| 维度 | Raft | PBFT | Gossip | Paxos | HotStuff |
|------|------|------|--------|-------|----------|
| 故障模型 | 崩溃容错 (CFT) | 拜占庭容错 (BFT) | 崩溃容错 | 崩溃容错 | 拜占庭容错 |
| 容错数量 | f < n/2 | f < n/3 | 无严格限制 | f < n/2 | f < n/3 |
| 领导者 | 有（强领导） | 有（轮换） | 无 | 无 / Multi-Paxos | 有（轮换） |
| 消息复杂度 | O(n) | O(n^2) | O(log n) | O(n) | O(n) |
| 延迟 | 2 RTT | 3 RTT | 最终一致 | 2 RTT | 3 RTT |
| 实现复杂度 | 低 | 高 | 低 | 高 | 中 |
| 代表实现 | etcd, Consul | Hyperledger | Cassandra | Chubby | DiemBFT |
| 适用场景 | KV 存储 | 区块链 | 配置传播 | 锁服务 | 区块链 |

## 6. 代码示例

### 6.1 Raft 节点状态机

```typescript
// consensus-algorithms/src/raft/RaftNode.ts
type NodeRole = 'follower' | 'candidate' | 'leader';

interface LogEntry {
  term: number;
  index: number;
  command: any;
}

interface RaftMessage {
  type: 'RequestVote' | 'RequestVoteResponse' | 'AppendEntries' | 'AppendEntriesResponse';
  term: number;
  from: string;
  to: string;
  payload: any;
}

class RaftNode {
  private role: NodeRole = 'follower';
  private currentTerm = 0;
  private votedFor: string | null = null;
  private log: LogEntry[] = [{ term: 0, index: 0, command: null }]; // 索引从 1 开始
  private commitIndex = 0;
  private lastApplied = 0;
  private nextIndex: Map<string, number> = new Map();
  private matchIndex: Map<string, number> = new Map();

  constructor(
    private id: string,
    private peers: string[],
    private network: NetworkSimulator,
    private storage: StateStorage
  ) {}

  async onMessage(msg: RaftMessage): Promise<void> {
    if (msg.term > this.currentTerm) {
      this.currentTerm = msg.term;
      this.role = 'follower';
      this.votedFor = null;
    }

    switch (msg.type) {
      case 'RequestVote': {
        const grant = this.shouldGrantVote(msg);
        await this.network.send(msg.from, {
          type: 'RequestVoteResponse',
          term: this.currentTerm,
          from: this.id,
          to: msg.from,
          payload: { voteGranted: grant },
        });
        break;
      }
      case 'AppendEntries': {
        const success = this.handleAppendEntries(msg);
        await this.network.send(msg.from, {
          type: 'AppendEntriesResponse',
          term: this.currentTerm,
          from: this.id,
          to: msg.from,
          payload: { success, matchIndex: this.log.length - 1 },
        });
        break;
      }
    }
  }

  private shouldGrantVote(msg: RaftMessage): boolean {
    if (msg.term < this.currentTerm) return false;
    if (this.votedFor && this.votedFor !== msg.from) return false;

    const lastLog = this.log[this.log.length - 1];
    const candidateLastLog = msg.payload.lastLog;
    const logUpToDate =
      candidateLastLog.term > lastLog.term ||
      (candidateLastLog.term === lastLog.term && candidateLastLog.index >= lastLog.index);

    if (!logUpToDate) return false;

    this.votedFor = msg.from;
    return true;
  }

  private handleAppendEntries(msg: RaftMessage): boolean {
    const { prevLogIndex, prevLogTerm, entries, leaderCommit } = msg.payload;

    if (prevLogIndex > 0 &&
        (this.log[prevLogIndex]?.term !== prevLogTerm)) {
      return false; // 日志不一致
    }

    // 追加新条目
    for (let i = 0; i < entries.length; i++) {
      const idx = prevLogIndex + 1 + i;
      if (this.log[idx] && this.log[idx].term !== entries[i].term) {
        this.log = this.log.slice(0, idx); // 删除冲突条目
      }
      if (!this.log[idx]) {
        this.log.push(entries[i]);
      }
    }

    if (leaderCommit > this.commitIndex) {
      this.commitIndex = Math.min(leaderCommit, this.log.length - 1);
    }

    return true;
  }
}
```

### 6.2 PBFT 消息处理器

```typescript
// consensus-algorithms/src/pbft/PBFTNode.ts
interface PBFTMessage {
  type: 'PRE-PREPARE' | 'PREPARE' | 'COMMIT' | 'VIEW-CHANGE' | 'NEW-VIEW';
  view: number;
  sequence: number;
  digest: string;
  from: string;
  payload: any;
}

class PBFTNode {
  private view = 0;
  private sequence = 0;
  private prepared = new Map<string, Set<string>>();
  private committed = new Map<string, Set<string>>();
  private f: number; // 最大容错数

  constructor(private id: string, private peers: string[]) {
    this.f = Math.floor((peers.length - 1) / 3);
  }

  get primary(): string {
    return this.peers[this.view % this.peers.length];
  }

  async onMessage(msg: PBFTMessage): Promise<void> {
    if (msg.view < this.view) return; // 丢弃旧视图消息

    switch (msg.type) {
      case 'PRE-PREPARE': {
        if (msg.from !== this.primary) return;
        const prepareMsg: PBFTMessage = {
          type: 'PREPARE',
          view: msg.view,
          sequence: msg.sequence,
          digest: msg.digest,
          from: this.id,
          payload: {},
        };
        await this.broadcast(prepareMsg);
        break;
      }
      case 'PREPARE': {
        const key = `${msg.view}-${msg.sequence}-${msg.digest}`;
        const set = this.prepared.get(key) ?? new Set();
        set.add(msg.from);
        this.prepared.set(key, set);

        if (set.size >= 2 * this.f) {
          const commitMsg: PBFTMessage = {
            type: 'COMMIT',
            view: msg.view,
            sequence: msg.sequence,
            digest: msg.digest,
            from: this.id,
            payload: {},
          };
          await this.broadcast(commitMsg);
        }
        break;
      }
      case 'COMMIT': {
        const key = `${msg.view}-${msg.sequence}-${msg.digest}`;
        const set = this.committed.get(key) ?? new Set();
        set.add(msg.from);
        this.committed.set(key, set);

        if (set.size >= 2 * this.f + 1) {
          console.log(`Node ${this.id} committed request ${msg.sequence}`);
        }
        break;
      }
    }
  }

  private async broadcast(msg: PBFTMessage): Promise<void> {
    // 广播到所有节点
  }
}
```

## 7. 技术决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 消息传递 | 事件驱动模拟 | 便于测试和可视化 |
| 持久化 | 内存 + 可选落盘 | 教学用途优先 |
| 网络模型 | 可配置延迟/丢包/分区 | 模拟真实网络 |

## 8. 质量属性

- **正确性**: 严格遵循论文规范
- **可教育性**: 清晰的日志和状态输出
- **可扩展性**: 模块化设计，便于添加新算法

## 9. 参考链接

- [Raft Consensus Paper](https://raft.github.io/raft.pdf) — Raft 原始论文 (Diego Ongaro, John Ousterhout)
- [The Raft Consensus Algorithm](https://raft.github.io/) — Raft 官方可视化教程
- [PBFT Paper (Castro & Liskov, 1999)](https://pmg.csail.mit.edu/papers/osdi99.pdf) — Practical Byzantine Fault Tolerance
- [Gossip Protocols - Wikipedia](https://en.wikipedia.org/wiki/Gossip_protocol) — Gossip 协议综述
- [Paxos Made Simple](https://lamport.azurewebsites.net/pubs/paxos-simple.pdf) — Leslie Lamport 的 Paxos 简化说明
- [etcd Raft Implementation](https://github.com/etcd-io/raft) — 生产级 Raft 实现参考
