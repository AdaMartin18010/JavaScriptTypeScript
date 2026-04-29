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

## 8. 权威外部链接

- [Raft 论文（In Search of an Understandable Consensus Algorithm）](https://raft.github.io/raft.pdf)
- [Raft 可视化演示](https://raft.github.io/)
- [etcd 官方文档](https://etcd.io/docs/latest/)
- [etcd-io/raft GitHub 仓库](https://github.com/etcd-io/raft)
- [Consul Consensus 文档](https://www.consul.io/docs/architecture/consensus)
- [Hyperledger Fabric 共识文档](https://hyperledger-fabric.readthedocs.io/en/latest/)
- [ZooKeeper ZAB 协议](https://zookeeper.apache.org/doc/r3.9.2/zookeeperInternals.html)

## 9. 与相邻模块的关系

- **70-distributed-systems**: 分布式系统的基础理论
- **83-blockchain-advanced**: 区块链共识机制
- **75-chaos-engineering**: 共识算法的韧性测试
