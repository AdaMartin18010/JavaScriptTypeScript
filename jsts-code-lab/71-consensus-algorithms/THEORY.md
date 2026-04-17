# 共识算法理论

> 本文档为 `71-consensus-algorithms` 模块提供理论基础，系统阐述 Paxos、Raft 等共识算法的安全性与活性证明要点，以及 FLP 不可能性定理对异步系统的根本限制。

---

## 目录

- [共识算法理论](#共识算法理论)
  - [目录](#目录)
  - [1. 共识问题形式化定义](#1-共识问题形式化定义)
    - [1.1 共识属性](#11-共识属性)
    - [1.2 系统模型分类](#12-系统模型分类)
  - [2. FLP 不可能性定理](#2-flp-不可能性定理)
    - [2.1 定理陈述](#21-定理陈述)
    - [2.2 证明直觉](#22-证明直觉)
  - [3. Paxos 算法](#3-paxos-算法)
    - [3.1 角色定义](#31-角色定义)
    - [3.2 两阶段协议](#32-两阶段协议)
    - [3.3 安全性证明要点](#33-安全性证明要点)
  - [4. Raft 算法](#4-raft-算法)
    - [4.1 状态与任期](#41-状态与任期)
    - [4.2 选举安全性](#42-选举安全性)
    - [4.3 日志匹配与提交](#43-日志匹配与提交)
    - [4.4 与 Paxos 的对比](#44-与-paxos-的对比)
  - [5. PBFT 与拜占庭容错](#5-pbft-与拜占庭容错)
    - [5.1 拜占庭故障](#51-拜占庭故障)
    - [5.2 PBFT 三阶段协议](#52-pbft-三阶段协议)
  - [6. CAP 约束下的算法选择](#6-cap-约束下的算法选择)
    - [6.1 算法-场景匹配矩阵](#61-算法-场景匹配矩阵)
    - [6.2 选择决策树](#62-选择决策树)
  - [7. 与代码实现的映射](#7-与代码实现的映射)
    - [7.1 代码实验室结构](#71-代码实验室结构)
    - [7.2 从理论到代码的桥接](#72-从理论到代码的桥接)
    - [7.3 与相关模块的交叉引用](#73-与相关模块的交叉引用)

---

## 1. 共识问题形式化定义

### 1.1 共识属性

在分布式系统中，共识 (Consensus) 要求一组进程就某个值达成一致。形式化地，任何共识算法必须满足以下三个属性：

| 属性 | 定义 |
|------|------|
| **一致性 (Agreement)** | 没有两个正确的进程决定不同的值 |
| **有效性 (Validity)** | 如果一个正确的进程决定了值 `v`，则 `v` 必为某个进程提出的值 |
| **终止性 (Termination)** | 所有正确的进程最终都会决定某个值 |

**FLP 结果**：在**纯异步**网络模型中，即使只有一个进程可能故障（崩溃停止），也不存在确定性算法能同时满足上述三个属性。因此实际算法必须在 **部分同步 (partial synchrony)** 假设下运行，或采用**随机化**机制。

### 1.2 系统模型分类

```
┌─────────────────────────────────────────────────────────┐
│                    共识系统模型                          │
├─────────────────────────────────────────────────────────┤
│  故障模型                                                │
│    ├── 崩溃停止 (Crash-stop)        ← Paxos, Raft       │
│    ├── 崩溃恢复 (Crash-recovery)                        │
│    └── 拜占庭 (Byzantine)           ← PBFT, HotStuff    │
│  通信模型                                                │
│    ├── 同步 (Synchronous)                               │
│    ├── 异步 (Asynchronous)          ← FLP 不可能        │
│    └── 部分同步 (Partial synchrony) ← 实际算法首选       │
└─────────────────────────────────────────────────────────┘
```

---

## 2. FLP 不可能性定理

### 2.1 定理陈述

> Fischer, Lynch, Paterson (1985)
>
> 在异步分布式系统中，若最多只有一个进程可能崩溃停止，则不存在确定性的共识算法能同时满足一致性和终止性。

### 2.2 证明直觉

核心思路是**初始双价性 (Bivalence)**：

1. 存在一个**初始配置**是双价的（既可以达成 0，也可以达成 1）。
2. 从任何双价配置出发，存在一个**决定性事件**（某个进程接收某条消息）可将系统带向单价配置。
3. 但在异步网络中，通过无限期延迟某条消息，可以构造一个**无限执行序列**，使系统永远停留在双价配置。
4. 因此，某个正确的进程可能永远无法决定，违反了终止性。

**工程启示**：

- 引入**超时机制**（Leader Election 超时）打破异步假设
- 引入**随机化**（如 Ben-Or 算法）以概率 1 收敛
- 接受**部分同步**模型：系统在某些未知但有限的时间段内表现同步

---

## 3. Paxos 算法

### 3.1 角色定义

| 角色 | 职责 |
|------|------|
| **Proposer** | 提出提案 (Proposal = (n, v)) |
| **Acceptor** | 对提案进行投票，接受或拒绝 |
| **Learner** | 学习已被选定的值 |

### 3.2 两阶段协议

**Phase 1 (Prepare & Promise)**：

1. Proposer 广播 `Prepare(n)` 给多数派 Acceptor
2. Acceptor 若 `n` 大于其已响应的最大编号，则承诺不再接受更小编号，并返回已接受的最高编号提案

**Phase 2 (Accept & Accepted)**：

1. Proposer 收到多数 Promise 后，选择其中编号最大的值 `v`（若都没有则使用自己的值），广播 `Accept(n, v)`
2. Acceptor 若未对更高编号做出承诺，则接受 `(n, v)`

### 3.3 安全性证明要点

**引理 1 (Promise 的单调性)**：Acceptor 一旦对 `Prepare(n)` 做出承诺，就不再接受任何编号 `< n` 的提案。

**引理 2 (值的继承)**：若某个提案 `(n, v)` 被多数派接受，则任何更高编号的提案必须携带相同的值 `v`。

**定理 (一致性)**：没有两个不同的值可以被选中。

---

## 4. Raft 算法

### 4.1 状态与任期

Raft 将一致性问题分解为三个相对独立的子问题：

1. **Leader 选举** (Leader Election)
2. **日志复制** (Log Replication)
3. **安全性** (Safety)

每个节点处于以下三种状态之一：

- **Follower**：被动响应 Leader 和 Candidate 的请求
- **Candidate**：发起选举，争取成为 Leader
- **Leader**：处理所有客户端请求，复制日志到 Follower

### 4.2 选举安全性

**选举限制 (Election Restriction)**：
Candidate 必须获得**多数派**的投票才能成为 Leader。投票条件之一是 Candidate 的日志必须至少与投票者一样新（Last Term + Index 比较）。

**定理**：已提交的日志条目一定存在于当前 Leader 的日志中。

### 4.3 日志匹配与提交

**日志匹配属性 (Log Matching Property)**：
若两个日志条目具有相同的索引和任期，则它们存储相同的命令，且在该索引之前的所有日志条目也完全相同。

**提交规则**：
Leader 仅在当前任期的日志条目被复制到多数派后，才认为该条目（及其之前的所有条目）已提交。

### 4.4 与 Paxos 的对比

| 维度 | Paxos | Raft |
|------|-------|------|
| 可理解性 | 低（多角色交互复杂） | 高（强 Leader 模型） |
| 工程实现 | 多变体 (Multi-Paxos) | 清晰分离子问题 |
| 日志连续性 | 不保证（可存在空洞） | 保证连续 |
| 典型实现 | Chubby, ZooKeeper | etcd, Consul, TiKV |

---

## 5. PBFT 与拜占庭容错

### 5.1 拜占庭故障

拜占庭故障是最强的故障模型：故障节点可以**任意行为**（包括发送矛盾消息、故意误导）。

**容错阈值**：在有 `f` 个拜占庭节点的系统中，至少需要 `N = 3f + 1` 个节点才能保证安全性和活性。

### 5.2 PBFT 三阶段协议

Practical Byzantine Fault Tolerance (PBFT) 是首个实用的拜占庭容错算法：

1. **Pre-prepare**：Leader 分配序列号并广播
2. **Prepare**：节点验证后广播准备消息，收集 `2f` 个匹配的准备
3. **Commit**：节点广播提交消息，收集 `2f + 1` 个匹配的提交后执行

**Quorum 机制**：

```
任何两个大小为 2f + 1 的集合必有至少 f + 1 个正确节点重叠
```

---

## 6. CAP 约束下的算法选择

来自 `70-distributed-systems/THEORY.md` 的 CAP 定理告诉我们：

```
∄ 算法 A: ∀e, Partition(e) → Consistent(e) ∧ Available(e)
```

### 6.1 算法-场景匹配矩阵

| 场景特征 | 推荐算法 | 理由 |
|----------|---------|------|
| 崩溃故障、强一致性、小集群 | **Raft** | 工程实现最成熟，etcd/Consul 验证 |
| 崩溃故障、大规模、高吞吐 | **Multi-Paxos / EPaxos** | 减少 Leader 瓶颈 |
| 拜占庭故障、区块链 | **PBFT / HotStuff** | BFT 安全保证 |
| 高可用优先、可接受最终一致 | **Gossip / CRDT** | 放弃强一致性换取可用性 |
| 跨地域、低延迟写入 | **Spanner / PacificA** | 结合 TrueTime 或租约机制 |

### 6.2 选择决策树

```
需要容忍拜占庭故障？
├── 是 → PBFT / HotStuff (N ≥ 3f + 1)
└── 否 → 继续
    需要最大化可理解性/可维护性？
    ├── 是 → Raft
    └── 否 → Paxos 变体
        需要最优写入延迟？
        ├── 是 → EPaxos / Flexible Paxos
        └── 否 → Multi-Paxos
```

---

## 7. 与代码实现的映射

### 7.1 代码实验室结构

`71-consensus-algorithms/` 目录下的实现按以下主题组织：

| 代码文件 | 对应理论 | 说明 |
|----------|---------|------|
| `raft-*.ts` | Raft §4 | Leader 选举、日志复制、状态机应用 |
| `paxos-*.ts` | Paxos §3 | Proposer/Acceptor 两阶段交互模拟 |
| `pbft-*.ts` | PBFT §5 | 三阶段拜占庭容错演示 |
| `byzantine-*.ts` | 拜占庭模型 §5 | 叛徒将军问题的交互模拟 |

### 7.2 从理论到代码的桥接

**Raft 日志复制安全性** → TypeScript 实现要点：

```typescript
// 日志匹配属性的代码体现
interface LogEntry {
  term: number;
  index: number;
  command: unknown;
}

function isLogMatching(a: LogEntry, b: LogEntry): boolean {
  return a.term === b.term && a.index === b.index;
}

// Leader 提交规则：仅当当前任期条目复制到多数派时才提交
function canCommit(entries: LogEntry[], matchCount: number, quorum: number): boolean {
  return matchCount >= quorum;
}
```

**FLP 的模拟** → 通过控制消息延迟演示无限双价：

```typescript
// 在模拟器中，通过设置 networkDelay = Infinity
// 可以展示 Candidate 如何因无法收到多数选票而无限期超时重试
```

### 7.3 与相关模块的交叉引用

- `70-distributed-systems/THEORY.md` — CAP 定理与一致性谱系
- `70-distributed-systems/` — 分布式锁、ID 生成、事务的实现
- `80-formal-verification/THEORY.md` — TLA+ 规约与安全性证明

---

> **参考**
>
> - Fischer, M.J., Lynch, N.A., Paterson, M.S. "Impossibility of Distributed Consensus with One Faulty Process" (1985)
> - Lamport, L. "The Part-Time Parliament" (Paxos, 1998)
> - Ongaro, D., Ousterhout, J. "In Search of an Understandable Consensus Algorithm" (Raft, 2014)
> - Castro, M., Liskov, B. "Practical Byzantine Fault Tolerance" (PBFT, 1999)
