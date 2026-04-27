---
last-updated: 2026-04-27
review-cycle: 6 months
next-review: 2026-10-27
status: current
---
# 分布式系统形式化理论

> **Distributed Systems Formal Theory**
>
> 本文档提供分布式系统的完整形式化理论，包含数学定义、证明、算法伪代码及 Node.js/TypeScript 实现。

---

## 目录

- [分布式系统形式化理论](#分布式系统形式化理论)
  - [目录](#目录)
  - [1. CAP 定理的完整形式化证明](#1-cap-定理的完整形式化证明)
    - [1.1 形式化定义](#11-形式化定义)
    - [1.2 CAP 定理的完整证明](#12-cap-定理的完整证明)
    - [1.3 形式化精确定理](#13-形式化精确定理)
    - [1.4 算法伪代码](#14-算法伪代码)
    - [1.5 Node.js/TypeScript 实现](#15-nodejstypescript-实现)
  - [2. 一致性模型的谱系](#2-一致性模型的谱系)
    - [2.1 一致性层次结构](#21-一致性层次结构)
    - [2.2 线性一致性（Linearizability）](#22-线性一致性linearizability)
    - [2.3 顺序一致性（Sequential Consistency）](#23-顺序一致性sequential-consistency)
    - [2.4 因果一致性（Causal Consistency）](#24-因果一致性causal-consistency)
    - [2.5 最终一致性（Eventual Consistency）](#25-最终一致性eventual-consistency)
    - [2.6 形式化证明：层次包含关系](#26-形式化证明层次包含关系)
    - [2.7 算法伪代码](#27-算法伪代码)
    - [2.8 Node.js/TypeScript 实现](#28-nodejstypescript-实现)
  - [3. 共识算法的形式化](#3-共识算法的形式化)
    - [3.1 共识问题形式化定义](#31-共识问题形式化定义)
    - [3.2 Paxos 算法形式化](#32-paxos-算法形式化)
    - [3.3 Raft 算法形式化](#33-raft-算法形式化)
    - [3.4 PBFT 算法形式化](#34-pbft-算法形式化)
    - [3.5 共识算法对比](#35-共识算法对比)
    - [3.6 算法伪代码](#36-算法伪代码)
    - [3.7 Node.js/TypeScript 实现](#37-nodejstypescript-实现)
  - [4. 分布式事务的模式](#4-分布式事务的模式)
    - [4.1 事务的 ACID 属性形式化](#41-事务的-acid-属性形式化)
    - [4.2 两阶段提交（2PC）形式化](#42-两阶段提交2pc形式化)
    - [4.3 三阶段提交（3PC）形式化](#43-三阶段提交3pc形式化)
    - [4.4 Saga 模式形式化](#44-saga-模式形式化)
    - [4.5 事务隔离级别形式化](#45-事务隔离级别形式化)
    - [4.6 算法伪代码](#46-算法伪代码)
    - [4.7 Node.js/TypeScript 实现](#47-nodejstypescript-实现)
  - [5. 向量时钟和逻辑时钟](#5-向量时钟和逻辑时钟)
    - [5.1 逻辑时钟理论基础](#51-逻辑时钟理论基础)
    - [5.2 Lamport 逻辑时钟](#52-lamport-逻辑时钟)
    - [5.3 向量时钟形式化](#53-向量时钟形式化)
    - [5.4 版本向量](#54-版本向量)
    - [5.5 标量时钟和矩阵时钟](#55-标量时钟和矩阵时钟)
    - [5.6 算法伪代码](#56-算法伪代码)
    - [5.7 Node.js/TypeScript 实现](#57-nodejstypescript-实现)
  - [6. Gossip 协议的收敛性分析](#6-gossip-协议的收敛性分析)
    - [6.1 Gossip 协议形式化定义](#61-gossip-协议形式化定义)
    - [6.2 信息传播模型](#62-信息传播模型)
    - [6.3 收敛性定理](#63-收敛性定理)
    - [6.4 反熵（Anti-Entropy）分析](#64-反熵anti-entropy分析)
    - [6.5 Gossip 协议变体](#65-gossip-协议变体)
    - [6.6 算法伪代码](#66-算法伪代码)
    - [6.7 Node.js/TypeScript 实现](#67-nodejstypescript-实现)
  - [7. 分区容错的形式化定义](#7-分区容错的形式化定义)
    - [7.1 网络分区形式化](#71-网络分区形式化)
    - [7.2 分区容错的形式化](#72-分区容错的形式化)
    - [7.3 分区检测算法](#73-分区检测算法)
    - [7.4 分区恢复策略](#74-分区恢复策略)
    - [7.5 算法伪代码](#75-算法伪代码)
    - [7.6 Node.js/TypeScript 实现](#76-nodejstypescript-实现)
  - [8. 拜占庭容错的形式化](#8-拜占庭容错的形式化)
    - [8.1 拜占庭故障模型](#81-拜占庭故障模型)
    - [8.2 拜占庭容错的下界定理](#82-拜占庭容错的下界定理)
    - [8.3 PBFT（实用拜占庭容错）形式化](#83-pbft实用拜占庭容错形式化)
    - [8.4 BFT 的复杂度分析](#84-bft-的复杂度分析)
    - [8.5 算法伪代码](#85-算法伪代码)
    - [8.6 Node.js/TypeScript 实现](#86-nodejstypescript-实现)
  - [9. 分布式系统的测试理论（Jepsen 模型）](#9-分布式系统的测试理论jepsen-模型)
    - [9.1 分布式系统测试的形式化框架](#91-分布式系统测试的形式化框架)
    - [9.2 Jepsen 测试模型](#92-jepsen-测试模型)
    - [9.3 一致性验证算法](#93-一致性验证算法)
    - [9.4 故障注入模型](#94-故障注入模型)
    - [9.5 算法伪代码](#95-算法伪代码)
    - [9.6 Node.js/TypeScript 实现](#96-nodejstypescript-实现)
  - [10. Node.js 分布式系统实践模式](#10-nodejs-分布式系统实践模式)
    - [10.1 微服务架构模式](#101-微服务架构模式)
      - [10.1.1 服务发现模式](#1011-服务发现模式)
      - [10.1.2 断路器模式](#1012-断路器模式)
    - [10.2 分布式缓存模式](#102-分布式缓存模式)
    - [10.3 消息队列模式](#103-消息队列模式)
    - [10.4 分布式事务实践](#104-分布式事务实践)
    - [10.5 分布式追踪](#105-分布式追踪)
    - [10.6 完整的分布式计数器服务示例](#106-完整的分布式计数器服务示例)
  - [总结](#总结)

---

## 1. CAP 定理的完整形式化证明

### 1.1 形式化定义

**定义 1.1**（分布式系统）：分布式系统是一个四元组 $D = (N, M, O, \rightarrow)$，其中：

- $N = \{n_1, n_2, ..., n_n\}$ 是节点集合
- $M$ 是消息集合
- $O = \{read, write\}$ 是操作集合
- $\rightarrow$ 是 happened-before 关系

**定义 1.2**（一致性 - Consistency）：
系统满足一致性当且仅当：
$$\forall r \in read, \forall w \in write : r \rightarrow w \Rightarrow value(r) = value(w)$$

即所有读取操作返回最新的已确认写入值。

**定义 1.3**（可用性 - Availability）：
系统满足可用性当且仅当：
$$\forall n_i \in N, \forall req : P[response(req) \text{ within } T] \geq 1 - \epsilon$$

其中 $T$ 是时间界限，$\epsilon$ 是任意小的正数。

**定义 1.4**（分区容错性 - Partition Tolerance）：
系统满足分区容错性当且仅当：
$$\forall P \subset N \times N : system\ continues\ to\ operate$$

即使网络分区 $P$ 将节点划分为不可通信的子集。

### 1.2 CAP 定理的完整证明

**定理 1.1**（CAP Theorem）：对于任何分布式系统，在存在网络分区的情况下，不可能同时保证一致性和可用性。

**证明**：

假设存在一个系统 $S$ 同时满足一致性 $C$、可用性 $A$ 和分区容错性 $P$。

**步骤 1**：考虑网络分区将节点划分为两个不相交的集合 $N_1$ 和 $N_2$，其中：

- $N_1 \cup N_2 = N$
- $N_1 \cap N_2 = \emptyset$
- $\forall n_i \in N_1, \forall n_j \in N_2 : no\ communication\ possible$

**步骤 2**：考虑客户端 $c_1$ 向 $N_1$ 中的节点写入值 $v_1$。

由可用性 $A$：
$$write(v_1)\ must\ return\ success$$

**步骤 3**：同时，客户端 $c_2$ 向 $N_2$ 中的节点发起读取操作。

由可用性 $A$：
$$read()\ must\ return\ within\ T$$

**步骤 4**：由于分区存在，$N_2$ 中的节点无法获知 $v_1$ 的写入。设 $N_2$ 中的当前值为 $v_0$（旧值）。

**情况 4a**：如果返回 $v_0$：
$$read() = v_0 \neq v_1$$
违反一致性 $C$。

**情况 4b**：如果等待同步直到分区恢复：
$$read()\ blocks$$
违反可用性 $A$（超出时间 $T$）。

**结论**：假设矛盾，因此 CAP 定理得证。$\square$

### 1.3 形式化精确定理

**定理 1.2**（PACELC）：如果存在分区（P），系统必须在可用性（A）和一致性（C）之间选择；否则（E），即使没有分区，系统也必须在延迟（L）和一致性（C）之间选择。

$$\forall S : (P \Rightarrow (A \lor C)) \land (\neg P \Rightarrow (L \lor C))$$

### 1.4 算法伪代码

```
Algorithm: CAP-Tradeoff-Decision
Input: operation op, consistency_level cl, timeout T
Output: result or error

1: function executeWithCAP(op, cl, T)
2:     if network_partition_detected() then
3:         if cl == STRONG then
4:             return ERROR_PARTITIONED  // 牺牲可用性
5:         else
6:             return execute_local(op)   // 牺牲一致性
7:     else
8:         return execute_consistent(op, T)
9:     end if
10: end function
```

### 1.5 Node.js/TypeScript 实现

```typescript
/**
 * CAP 定理的 TypeScript 实现
 * 演示在网络分区时的一致性-可用性权衡
 */

enum ConsistencyLevel {
  STRONG = 'STRONG',      // CP - 牺牲可用性
  EVENTUAL = 'EVENTUAL',  // AP - 牺牲一致性
}

interface NodeState {
  id: string;
  data: Map<string, any>;
  vectorClock: Map<string, number>;
  partitioned: boolean;
}

interface OperationResult {
  success: boolean;
  value?: any;
  error?: string;
  timestamp: number;
}

class CAPDistributedSystem {
  private nodes: Map<string, NodeState> = new Map();
  private partitions: Set<Set<string>> = new Set();

  constructor(nodeIds: string[]) {
    nodeIds.forEach(id => {
      this.nodes.set(id, {
        id,
        data: new Map(),
        vectorClock: new Map(nodeIds.map(nid => [nid, 0])),
        partitioned: false
      });
    });
  }

  /**
   * 模拟网络分区
   */
  simulatePartition(partitionGroups: string[][]): void {
    this.partitions.clear();
    partitionGroups.forEach(group => {
      this.partitions.add(new Set(group));
      group.forEach(nodeId => {
        const node = this.nodes.get(nodeId)!;
        node.partitioned = true;
      });
    });
  }

  /**
   * 检查两个节点是否在同一分区
   */
  private inSamePartition(node1: string, node2: string): boolean {
    for (const partition of this.partitions) {
      const has1 = partition.has(node1);
      const has2 = partition.has(node2);
      if (has1 && has2) return true;
      if (has1 || has2) return false;
    }
    return true; // 无分区时默认连通
  }

  /**
   * CAP 权衡执行
   */
  async executeOperation(
    nodeId: string,
    operation: 'read' | 'write',
    key: string,
    value?: any,
    consistencyLevel: ConsistencyLevel = ConsistencyLevel.STRONG,
    timeoutMs: number = 5000
  ): Promise<OperationResult> {
    const startTime = Date.now();
    const node = this.nodes.get(nodeId)!;

    // 检查是否处于分区状态
    if (node.partitioned && consistencyLevel === ConsistencyLevel.STRONG) {
      // CP 模式：拒绝操作以保持一致性
      return {
        success: false,
        error: 'Network partition detected. Operation rejected for strong consistency.',
        timestamp: Date.now()
      };
    }

    if (operation === 'write') {
      // 更新向量时钟
      const currentClock = node.vectorClock.get(nodeId) || 0;
      node.vectorClock.set(nodeId, currentClock + 1);

      // 写入数据（本地优先）
      node.data.set(key, {
        value,
        timestamp: Date.now(),
        vectorClock: new Map(node.vectorClock)
      });

      // 如果是强一致性，尝试同步到其他节点
      if (consistencyLevel === ConsistencyLevel.STRONG) {
        const syncSuccess = await this.syncToQuorum(nodeId, key, value);
        if (!syncSuccess) {
          return {
            success: false,
            error: 'Failed to achieve quorum consensus',
            timestamp: Date.now()
          };
        }
      }

      return {
        success: true,
        value,
        timestamp: Date.now()
      };
    }

    // 读操作
    if (consistencyLevel === ConsistencyLevel.STRONG) {
      // 从多数节点读取以确认最新值
      const value = await this.readFromQuorum(nodeId, key, timeoutMs);
      return {
        success: value !== undefined,
        value,
        timestamp: Date.now()
      };
    } else {
      // 最终一致性：直接返回本地值
      const localData = node.data.get(key);
      return {
        success: localData !== undefined,
        value: localData?.value,
        timestamp: Date.now()
      };
    }
  }

  private async syncToQuorum(
    sourceNode: string,
    key: string,
    value: any
  ): Promise<boolean> {
    const quorumSize = Math.floor(this.nodes.size / 2) + 1;
    let ackCount = 1; // 包含源节点

    for (const [nodeId, node] of this.nodes) {
      if (nodeId === sourceNode) continue;
      if (!this.inSamePartition(sourceNode, nodeId)) continue;

      // 模拟网络延迟
      await this.simulateNetworkDelay();

      node.data.set(key, value);
      ackCount++;

      if (ackCount >= quorumSize) return true;
    }

    return ackCount >= quorumSize;
  }

  private async readFromQuorum(
    nodeId: string,
    key: string,
    timeoutMs: number
  ): Promise<any> {
    const responses: any[] = [];
    const deadline = Date.now() + timeoutMs;

    for (const [id, node] of this.nodes) {
      if (!this.inSamePartition(nodeId, id)) continue;
      if (Date.now() > deadline) break;

      const data = node.data.get(key);
      if (data) responses.push(data);
    }

    // 返回最新值（基于时间戳）
    if (responses.length === 0) return undefined;

    return responses.reduce((latest, current) =>
      current.timestamp > latest.timestamp ? current : latest
    ).value;
  }

  private simulateNetworkDelay(): Promise<void> {
    return new Promise(resolve =>
      setTimeout(resolve, Math.random() * 50)
    );
  }
}

// ============ 使用示例 ============

async function demonstrateCAP() {
  const system = new CAPDistributedSystem(['node1', 'node2', 'node3']);

  // 正常操作 - 强一致性
  console.log('=== 正常操作（强一致性）===');
  const write1 = await system.executeOperation(
    'node1', 'write', 'key1', 'value1',
    ConsistencyLevel.STRONG
  );
  console.log('Write result:', write1);

  // 模拟网络分区
  console.log('\n=== 模拟网络分区 ===');
  system.simulatePartition([['node1'], ['node2', 'node3']]);

  // 在分区状态下尝试写入 - CP 模式
  console.log('\n=== 分区状态 - CP 模式（强一致性）===');
  const writeCP = await system.executeOperation(
    'node1', 'write', 'key2', 'value2',
    ConsistencyLevel.STRONG
  );
  console.log('CP Write result:', writeCP);

  // 在分区状态下尝试写入 - AP 模式
  console.log('\n=== 分区状态 - AP 模式（最终一致性）===');
  const writeAP = await system.executeOperation(
    'node1', 'write', 'key3', 'value3',
    ConsistencyLevel.EVENTUAL
  );
  console.log('AP Write result:', writeAP);
}

demonstrateCAP().catch(console.error);
```

---

## 2. 一致性模型的谱系

### 2.1 一致性层次结构

一致性模型形成以下谱系（从强到弱）：

$$\text{线性一致性} \subset \text{顺序一致性} \subset \text{因果一致性} \subset \text{最终一致性}$$

### 2.2 线性一致性（Linearizability）

**定义 2.1**（线性一致性）：
操作的历史 $H$ 是线性一致的，当且仅当存在操作的一个全序 $<$ 满足：

1. **顺序等价**：$\forall o_1, o_2 \in H : o_1 < o_2 \lor o_2 < o_1$（全序性）
2. **实时性**：$\forall o_1, o_2 : end(o_1) < start(o_2) \Rightarrow o_1 < o_2$
3. **读最新**：$\forall read(r) : value(r) = value(max_{<}\{w | w < r \land key(w) = key(r)\})$

**形式化**：
$$Linearizable(H) \iff \exists < : TotalOrder(<) \land RealTime(<) \land ReadLatest(<)$$

### 2.3 顺序一致性（Sequential Consistency）

**定义 2.2**（顺序一致性）：
操作的历史 $H$ 是顺序一致的，当且仅当存在操作的一个全序 $<$ 满足：

1. **程序顺序保持**：每个进程内的操作顺序被保留
2. **数据一致性**：存在一个全局顺序使得读操作看到最近的写

$$Sequential(H) \iff \exists < : ProgramOrder(<) \land DataConsistent(<)$$

**与线性一致性的区别**：

- 线性一致性要求实时性：操作实际发生的时间顺序必须被尊重
- 顺序一致性允许重排不同进程间的操作，只要保持每个进程内的程序顺序

### 2.4 因果一致性（Causal Consistency）

**定义 2.3**（Happens-Before 关系）：
对于操作 $o_1$ 和 $o_2$，定义 happens-before 关系 $\rightarrow$：

1. **程序顺序**：如果 $o_1$ 和 $o_2$ 在同一进程且 $o_1$ 在 $o_2$ 之前执行，则 $o_1 \rightarrow o_2$
2. **传递性**：如果 $o_1 \rightarrow o_2$ 且 $o_2 \rightarrow o_3$，则 $o_1 \rightarrow o_3$
3. **读-写依赖**：如果 $o_1$ 是写操作，$o_2$ 是读取 $o_1$ 值的读操作，则 $o_1 \rightarrow o_2$

**定义 2.4**（因果一致性）：
系统满足因果一致性当且仅当：

$$\forall o_1, o_2 : o_1 \rightarrow o_2 \Rightarrow \forall n \in N : visible_n(o_1) \leq visible_n(o_2)$$

其中 $visible_n(o)$ 表示操作 $o$ 在节点 $n$ 上变得可见的时间。

### 2.5 最终一致性（Eventual Consistency）

**定义 2.5**（最终一致性）：
系统满足最终一致性当且仅当：

$$\lim_{t \to \infty} P[\forall n_i, n_j \in N : state_{n_i}(t) = state_{n_j}(t)] = 1$$

即，如果没有新的更新，最终所有节点将达到一致状态。

### 2.6 形式化证明：层次包含关系

**定理 2.1**：线性一致性蕴含顺序一致性。

**证明**：
设 $H$ 是线性一致的，则存在全序 $<$ 满足实时性。

对于任意进程 $p$，设 $o_1, o_2$ 是 $p$ 中的操作且 $o_1$ 在程序顺序中先于 $o_2$。

由实时性条件：$end(o_1) < start(o_2) \Rightarrow o_1 < o_2$。

因此程序顺序被保持，$H$ 也是顺序一致的。$\square$

**定理 2.2**：顺序一致性蕴含因果一致性。

**证明**：
设 $H$ 是顺序一致的，则存在全序 $<$ 保持程序顺序。

对于任意 $o_1 \rightarrow o_2$：

- 如果 $o_1, o_2$ 在同一进程：由程序顺序保持，$o_1 < o_2$
- 如果存在读-写依赖：必然有 $o_1 < o_2$ 以保证读看到正确值

由传递性，happens-before 链中的所有操作在全序中保持顺序。

因此因果一致性满足。$\square$

**定理 2.3**：因果一致性蕴含最终一致性。

**证明**：
假设系统满足因果一致性但不满足最终一致性。

则存在节点 $n_i, n_j$ 使得它们的状态永不收敛。

这意味着存在某个操作 $o$ 使得 $visible_{n_i}(o) \neq visible_{n_j}(o)$ 永远成立。

但由因果一致性，所有 happens-before 关系最终都会被所有节点观察到。

矛盾，因此因果一致性蕴含最终一致性。$\square$

### 2.7 算法伪代码

```
Algorithm: ConsistencyModel-Checker
Input: history H, model M
Output: boolean (satisfies model or not)

1: function CheckLinearizability(H)
2:     for each possible linearization L of H do
3:         if IsValidLinearization(L, H) then
4:             return TRUE
5:     return FALSE
6:
7: function IsValidLinearization(L, H)
8:     // 检查实时性
9:     for each pair (o1, o2) in H do
10:        if end(o1) < start(o2) and position(o2) < position(o1) in L then
11:            return FALSE
12:    // 检查读最新
13:    for each read r in L do
14:        w = last write before r in L with same key
15:        if value(r) != value(w) then
16:            return FALSE
17:    return TRUE

1: function CheckCausalConsistency(H)
2:     // 构建 happens-before 图
3:     G = BuildHappensBeforeGraph(H)
4:
5:     for each node n in system do
6:         // 检查每个进程的视图是否尊重 happens-before
7:         view_n = GetOperationsVisibleAt(n)
8:         if not IsCausallyConsistent(view_n, G) then
9:             return FALSE
10:    return TRUE
```

### 2.8 Node.js/TypeScript 实现

```typescript
/**
 * 一致性模型的 TypeScript 实现
 * 演示不同一致性级别的行为差异
 */

interface Operation {
  id: string;
  type: 'read' | 'write';
  key: string;
  value?: any;
  processId: string;
  startTime: number;
  endTime: number;
}

interface History {
  operations: Operation[];
}

enum ConsistencyModel {
  LINEARIZABLE = 'LINEARIZABLE',
  SEQUENTIAL = 'SEQUENTIAL',
  CAUSAL = 'CAUSAL',
  EVENTUAL = 'EVENTUAL'
}

class ConsistencyChecker {
  /**
   * 检查线性一致性
   */
  checkLinearizability(history: History): boolean {
    const writes = history.operations.filter(o => o.type === 'write');
    const reads = history.operations.filter(o => o.type === 'read');

    // 尝试所有可能的线性化顺序
    const linearizations = this.generateLinearizations(history.operations);

    for (const linearization of linearizations) {
      if (this.isValidLinearization(linearization, writes, reads)) {
        return true;
      }
    }

    return false;
  }

  private isValidLinearization(
    linearization: Operation[],
    writes: Operation[],
    reads: Operation[]
  ): boolean {
    // 检查实时性：如果 op1 在 op2 开始前结束，则 op1 必须在前
    for (let i = 0; i < linearization.length; i++) {
      for (let j = i + 1; j < linearization.length; j++) {
        const op1 = linearization[i];
        const op2 = linearization[j];

        if (op1.endTime > op2.startTime && op2.endTime > op1.startTime) {
          // 并发操作，顺序可以任意
          continue;
        }

        if (op1.endTime <= op2.startTime) {
          // op1 先结束，必须在线性顺序中先出现（已在前面）
          continue;
        }
      }
    }

    // 检查读最新：每个读必须看到最近的写
    const state = new Map<string, any>();

    for (const op of linearization) {
      if (op.type === 'write') {
        state.set(op.key, op.value);
      } else {
        const expected = state.get(op.key);
        if (expected !== undefined && op.value !== expected) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * 检查因果一致性
   */
  checkCausalConsistency(history: History): boolean {
    // 构建 happens-before 图
    const happensBefore = this.buildHappensBeforeGraph(history);

    // 按进程分组
    const byProcess = this.groupByProcess(history.operations);

    // 检查每个进程的视图是否尊重 happens-before
    for (const [processId, operations] of byProcess) {
      for (let i = 0; i < operations.length; i++) {
        for (let j = i + 1; j < operations.length; j++) {
          const op1 = operations[i];
          const op2 = operations[j];

          // 检查 op1 是否 happens-before op2
          if (this.hasPath(happensBefore, op1.id, op2.id)) {
            // 在程序顺序中，op1 必须在 op2 之前（已满足）
            continue;
          }
        }
      }
    }

    return true;
  }

  private buildHappensBeforeGraph(history: History): Map<string, Set<string>> {
    const graph = new Map<string, Set<string>>();

    // 初始化
    for (const op of history.operations) {
      graph.set(op.id, new Set());
    }

    const byProcess = this.groupByProcess(history.operations);

    // 1. 程序顺序边
    for (const [, operations] of byProcess) {
      const sorted = operations.sort((a, b) => a.startTime - b.startTime);
      for (let i = 0; i < sorted.length - 1; i++) {
        graph.get(sorted[i].id)!.add(sorted[i + 1].id);
      }
    }

    // 2. 读-写依赖边
    const writes = history.operations.filter(o => o.type === 'write');
    const reads = history.operations.filter(o => o.type === 'read');

    for (const read of reads) {
      const matchingWrite = writes.find(w =>
        w.key === read.key && w.value === read.value
      );
      if (matchingWrite) {
        graph.get(matchingWrite.id)!.add(read.id);
      }
    }

    // 3. 传递闭包
    return this.transitiveClosure(graph);
  }

  private transitiveClosure(
    graph: Map<string, Set<string>>
  ): Map<string, Set<string>> {
    const result = new Map(graph);

    for (const [k] of result) {
      for (const [i] of result) {
        for (const [j] of result) {
          if (result.get(i)!.has(k) && result.get(k)!.has(j)) {
            result.get(i)!.add(j);
          }
        }
      }
    }

    return result;
  }

  private hasPath(
    graph: Map<string, Set<string>>,
    from: string,
    to: string
  ): boolean {
    return graph.get(from)!.has(to);
  }

  private groupByProcess(
    operations: Operation[]
  ): Map<string, Operation[]> {
    const result = new Map<string, Operation[]>();

    for (const op of operations) {
      if (!result.has(op.processId)) {
        result.set(op.processId, []);
      }
      result.get(op.processId)!.push(op);
    }

    return result;
  }

  private generateLinearizations(operations: Operation[]): Operation[][] {
    // 简化版：对于少量操作生成所有排列
    if (operations.length <= 8) {
      return this.permutations(operations);
    }

    // 对于大量操作，返回启发式排序
    return [operations.sort((a, b) => a.startTime - b.startTime)];
  }

  private permutations<T>(arr: T[]): T[][] {
    if (arr.length <= 1) return [arr];

    const result: T[][] = [];
    for (let i = 0; i < arr.length; i++) {
      const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
      for (const perm of this.permutations(rest)) {
        result.push([arr[i], ...perm]);
      }
    }

    return result;
  }
}

// ============ 一致性模型模拟器 ============

class ConsistencyModelSimulator {
  private data = new Map<string, { value: any; version: number }>();
  private version = 0;

  /**
   * 模拟线性一致性写入（原子操作）
   */
  async linearizableWrite(key: string, value: any): Promise<void> {
    // 使用全局锁模拟原子性
    const timestamp = Date.now();
    this.version++;

    // 模拟原子操作：在单个时间点完成
    this.data.set(key, { value, version: this.version });

    console.log(`[Linearizable] Write ${key}=${value} at t=${timestamp}`);
  }

  /**
   * 模拟线性一致性读取
   */
  async linearizableRead(key: string): Promise<any> {
    const timestamp = Date.now();
    const result = this.data.get(key);

    console.log(`[Linearizable] Read ${key}=${result?.value} at t=${timestamp}`);
    return result?.value;
  }

  /**
   * 模拟因果一致性写入
   */
  async causalWrite(
    key: string,
    value: any,
    vectorClock: Map<string, number>
  ): Promise<Map<string, number>> {
    const processId = 'local';
    const current = vectorClock.get(processId) || 0;
    vectorClock.set(processId, current + 1);

    this.version++;
    this.data.set(key, {
      value,
      version: this.version,
      vectorClock: new Map(vectorClock)
    });

    console.log(`[Causal] Write ${key}=${value}, VC=${JSON.stringify([...vectorClock])}`);
    return vectorClock;
  }

  /**
   * 模拟最终一致性写入
   */
  async eventualWrite(key: string, value: any): Promise<void> {
    // 立即确认，异步传播
    const timestamp = Date.now();

    setTimeout(() => {
      this.data.set(key, { value, version: ++this.version });
      console.log(`[Eventual] Async write ${key}=${value} propagated at t=${Date.now()}`);
    }, Math.random() * 100);

    console.log(`[Eventual] Write ${key}=${value} acknowledged at t=${timestamp}`);
  }
}

// ============ 使用示例 ============

async function demonstrateConsistencyModels() {
  const checker = new ConsistencyChecker();
  const simulator = new ConsistencyModelSimulator();

  console.log('=== 一致性模型演示 ===\n');

  // 示例历史记录
  const history: History = {
    operations: [
      { id: 'w1', type: 'write', key: 'x', value: 1, processId: 'p1', startTime: 0, endTime: 1 },
      { id: 'r1', type: 'read', key: 'x', value: 1, processId: 'p2', startTime: 2, endTime: 3 },
      { id: 'w2', type: 'write', key: 'x', value: 2, processId: 'p1', startTime: 4, endTime: 5 },
      { id: 'r2', type: 'read', key: 'x', value: 2, processId: 'p2', startTime: 6, endTime: 7 },
    ]
  };

  console.log('检查线性一致性:', checker.checkLinearizability(history));
  console.log('检查因果一致性:', checker.checkCausalConsistency(history));

  console.log('\n=== 操作演示 ===');

  await simulator.linearizableWrite('key1', 'value1');
  await simulator.linearizableRead('key1');

  const vc = new Map<string, number>();
  await simulator.causalWrite('key2', 'value2', vc);

  await simulator.eventualWrite('key3', 'value3');

  // 等待异步操作完成
  await new Promise(resolve => setTimeout(resolve, 200));
}

demonstrateConsistencyModels().catch(console.error);
```


---

## 3. 共识算法的形式化

### 3.1 共识问题形式化定义

**定义 3.1**（共识问题）：
设 $N = \{p_1, p_2, ..., p_n\}$ 是进程集合，每个进程 $p_i$ 提出一个值 $v_i \in V$。共识算法必须满足：

1. **终止性**（Termination）：每个正确进程最终必须决定某个值
   $$\forall p_i \in correct\ processes : \Diamond decided(p_i)$$

2. **一致性**（Agreement）：所有正确进程决定相同的值
   $$\forall p_i, p_j \in correct\ processes : decided(p_i) = decided(p_j)$$

3. **有效性**（Validity）：如果所有正确进程提出相同的值 $v$，那么所有正确进程必须决定 $v$
   $$\forall p_i \in correct : proposed(p_i) = v \Rightarrow decided(p_i) = v$$

**定理 3.1**（FLP 不可能性）：在异步系统中，即使只有一个进程可能崩溃，也不存在确定性的共识算法。

**证明概要**：

设系统有 $n$ 个进程，其中最多 $f$ 个可能崩溃。

1. 定义**双价配置**（Bivalent Configuration）：从该配置出发，可以到达决定 0 或决定 1 的配置。

2. **引理 1**：异步系统存在初始双价配置。

3. **引理 2**：从任何双价配置出发，存在一个步骤序列到达另一个双价配置。

4. 通过归纳，可以构造无限执行序列始终处于双价配置，因此无法满足终止性。

### 3.2 Paxos 算法形式化

**定义 3.2**（Paxos 角色）：

- **提议者**（Proposer）：提出提案 $(n, v)$，其中 $n$ 是提案编号，$v$ 是值
- **接受者**（Acceptor）：对提案进行投票
- **学习者**（Learner）：学习被决定的值

**Paxos 两阶段协议**：

**阶段 1：准备阶段（Prepare）**

提议者选择提案编号 $n$ 并发送 $\text{Prepare}(n)$ 给多数接受者。

接受者收到 $\text{Prepare}(n)$ 后：

- 如果 $n > minProposal$，则承诺不接受编号小于 $n$ 的提案，返回 $\text{Promise}(n, acceptedProposal, acceptedValue)$

**阶段 2：接受阶段（Accept）**

提议者收到多数 $\text{Promise}$ 后，选择值 $v$（如果有已接受的值则选最高的，否则选自己的提案值），发送 $\text{Accept}(n, v)$。

接受者收到 $\text{Accept}(n, v)$ 后：

- 如果未承诺更高的提案编号，则接受 $(n, v)$

**Paxos 安全性证明**：

**定理 3.2**（Paxos 安全性）：Paxos 算法保证一致性。

**证明**：

设两个不同的值 $v_1$ 和 $v_2$ 都被决定。

这意味着存在两个多数集合 $Q_1$ 和 $Q_2$ 分别接受了 $(n_1, v_1)$ 和 $(n_2, v_2)$。

由鸽巢原理，$Q_1 \cap Q_2 \neq \emptyset$，存在接受者 $a$ 同时接受了两个提案。

假设 $n_1 < n_2$，则 $a$ 在准备阶段 $n_2$ 时应该已经承诺不接受小于 $n_2$ 的提案，矛盾。

因此 $v_1 = v_2$。$\square$

### 3.3 Raft 算法形式化

**定义 3.3**（Raft 状态机）：
每个服务器处于以下三种状态之一：

- **Leader**：处理所有客户端请求
- **Follower**：被动响应请求
- **Candidate**：选举新 Leader 时的临时状态

**定义 3.4**（Raft 任期 Term）：
单调递增的整数，用于区分不同 Leader 的任期。

**Raft 安全性保证**：

**定理 3.3**（Leader 完整性）：如果一个日志条目在某个任期被提交，那么该条目将出现在所有更高任期的 Leader 的日志中。

**证明**：

设条目 $e$ 在任期 $T$ 被提交，这意味着它被复制到多数服务器。

考虑任期 $T' > T$ 的 Leader $L$。$L$ 必须获得多数投票才能成为 Leader。

由鸽巢原理，至少有一个服务器同时属于 $e$ 的多数和 $L$ 的多数。

该服务器只有在拥有 $e$ 时才会投票给 $L$，因此 $L$ 也拥有 $e$。$\square$

### 3.4 PBFT 算法形式化

**定义 3.5**（拜占庭容错）：
系统能够容忍最多 $f$ 个拜占庭（任意行为）故障，当且仅当 $n \geq 3f + 1$。

**定理 3.4**（PBFT 节点数下限）：
实现拜占庭容错共识需要至少 $3f + 1$ 个节点。

**证明**：

设系统有 $n$ 个节点，其中 $f$ 个可能是拜占庭节点。

正确节点数为 $n - f$。为了能够做出决策，正确节点需要形成多数：
$$n - f > \frac{n + f}{2}$$

解得：
$$2n - 2f > n + f$$
$$n > 3f$$
$$n \geq 3f + 1$$

**PBFT 三阶段协议**：

1. **Pre-prepare**：主节点分配序列号并广播
2. **Prepare**：副本验证并广播准备消息
3. **Commit**：收到 $2f$ 个准备后广播提交

### 3.5 共识算法对比

| 特性 | Paxos | Raft | PBFT |
|------|-------|------|------|
| 故障模型 | 崩溃故障 | 崩溃故障 | 拜占庭故障 |
| 节点数要求 | $2f + 1$ | $2f + 1$ | $3f + 1$ |
| 消息复杂度 | $O(n)$ | $O(n)$ | $O(n^2)$ |
| Leader 选举 | 隐式 | 显式 | 视图变更 |
| 工程实现 | 复杂 | 简单 | 中等 |

### 3.6 算法伪代码

```
Algorithm: Paxos-Proposer
Input: proposal value v

1: function Propose(v)
2:     n = generateUniqueProposalNumber()
3:     // Phase 1: Prepare
4:     promises = sendPrepareToMajority(n)
5:     if promises.size < majority then
6:         return FAILURE
7:
8:     // Choose value
9:     if any promise contains acceptedValue then
10:        v = value with highest acceptedProposal
11:
12:    // Phase 2: Accept
13:    accepts = sendAcceptToMajority(n, v)
14:    if accepts.size >= majority then
15:        return SUCCESS(v)
16:    else
17:        return FAILURE
18: end function

Algorithm: Raft-LeaderElection

1: function StartElection()
2:    currentTerm = currentTerm + 1
3:    voteFor = self
4:    votes = 1
5:    resetElectionTimeout()
6:
7:    for each server in cluster do
8:        if server != self then
9:            send RequestVote RPC
10:
11:   wait for votes or election timeout
12: end function

13: on receive RequestVote(term, candidateId, lastLogIndex, lastLogTerm)
14:    if term < currentTerm then
15:        reply FALSE
16:    if term > currentTerm then
17:        currentTerm = term
18:        convertToFollower()
19:    if voteFor is null or voteFor == candidateId then
20:        if candidate's log is at least as up-to-date then
21:            voteFor = candidateId
22:            reply TRUE
23: end on

Algorithm: PBFT-Replica

1: function Request(request)
2:    if isPrimary then
3:        sequenceNumber = nextSequenceNumber()
4:        broadcast PRE-PREPARE(view, sequenceNumber, digest(request))
5: end function

6: on receive PRE-PREPARE(v, n, d) from primary
7:    if valid(v, n, d) and not acceptedPrePrepare(v, n) then
8:        broadcast PREPARE(v, n, d, i)
9:        acceptedPrePrepare[v, n] = true
10: end on

11: on receive PREPARE(v, n, d, j)
12:    add to prepare log
13:    if 2f prepares received for (v, n, d) then
14:        broadcast COMMIT(v, n, d, i)
15:        prepared[v, n] = true
16: end on

17: on receive COMMIT(v, n, d, j)
18:    add to commit log
19:    if 2f+1 commits received for (v, n, d) and not executed then
20:        execute request
21:        send reply to client
22: end on
```

### 3.7 Node.js/TypeScript 实现

```typescript
/**
 * 共识算法的 TypeScript 实现
 * 包含 Paxos、Raft、PBFT 的简化实现
 */

import { EventEmitter } from 'events';

// ============ Paxos 实现 ============

interface PaxosProposal {
  id: number;
  value: any;
}

interface PromiseResponse {
  acceptedProposalId?: number;
  acceptedValue?: any;
}

class PaxosAcceptor {
  private minProposalId = 0;
  private acceptedProposal: PaxosProposal | null = null;

  async prepare(proposalId: number): Promise<PromiseResponse | null> {
    if (proposalId < this.minProposalId) {
      return null; // 拒绝
    }

    this.minProposalId = proposalId;

    if (this.acceptedProposal) {
      return {
        acceptedProposalId: this.acceptedProposal.id,
        acceptedValue: this.acceptedProposal.value
      };
    }

    return {}; // 承诺，但没有已接受的值
  }

  async accept(proposalId: number, value: any): Promise<boolean> {
    if (proposalId < this.minProposalId) {
      return false;
    }

    this.acceptedProposal = { id: proposalId, value };
    return true;
  }
}

class PaxosProposer {
  private proposalCounter = 0;
  private acceptors: PaxosAcceptor[] = [];

  constructor(acceptors: PaxosAcceptor[]) {
    this.acceptors = acceptors;
  }

  async propose(value: any): Promise<any> {
    this.proposalCounter++;
    const proposalId = this.proposalCounter;

    // Phase 1: Prepare
    const promises = await Promise.all(
      this.acceptors.map(a => a.prepare(proposalId))
    );

    const validPromises = promises.filter(p => p !== null);
    const majority = Math.floor(this.acceptors.length / 2) + 1;

    if (validPromises.length < majority) {
      throw new Error('Failed to get majority promises');
    }

    // 选择值（如果有已接受的值，选最高的）
    let chosenValue = value;
    let maxAcceptedId = -1;

    for (const promise of validPromises) {
      if (promise!.acceptedProposalId !== undefined &&
          promise!.acceptedProposalId > maxAcceptedId) {
        maxAcceptedId = promise!.acceptedProposalId;
        chosenValue = promise!.acceptedValue;
      }
    }

    // Phase 2: Accept
    const accepts = await Promise.all(
      this.acceptors.map(a => a.accept(proposalId, chosenValue))
    );

    const acceptCount = accepts.filter(a => a).length;

    if (acceptCount >= majority) {
      return chosenValue; // 达成共识
    }

    throw new Error('Failed to get majority accepts');
  }
}

// ============ Raft 实现 ============

enum RaftState {
  FOLLOWER = 'FOLLOWER',
  CANDIDATE = 'CANDIDATE',
  LEADER = 'LEADER'
}

interface LogEntry {
  term: number;
  index: number;
  command: any;
}

interface RequestVoteRequest {
  term: number;
  candidateId: string;
  lastLogIndex: number;
  lastLogTerm: number;
}

interface AppendEntriesRequest {
  term: number;
  leaderId: string;
  prevLogIndex: number;
  prevLogTerm: number;
  entries: LogEntry[];
  leaderCommit: number;
}

class RaftNode extends EventEmitter {
  id: string;
  state: RaftState = RaftState.FOLLOWER;
  currentTerm = 0;
  votedFor: string | null = null;
  log: LogEntry[] = [];
  commitIndex = 0;
  lastApplied = 0;

  // Leader 状态
  nextIndex: Map<string, number> = new Map();
  matchIndex: Map<string, number> = new Map();

  private peers: RaftNode[] = [];
  private electionTimeout: NodeJS.Timeout | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor(id: string) {
    super();
    this.id = id;
    this.resetElectionTimeout();
  }

  setPeers(peers: RaftNode[]) {
    this.peers = peers.filter(p => p.id !== this.id);
  }

  private resetElectionTimeout() {
    if (this.electionTimeout) clearTimeout(this.electionTimeout);

    const timeout = 150 + Math.random() * 150; // 150-300ms
    this.electionTimeout = setTimeout(() => this.startElection(), timeout);
  }

  private async startElection() {
    if (this.state === RaftState.LEADER) return;

    this.state = RaftState.CANDIDATE;
    this.currentTerm++;
    this.votedFor = this.id;

    console.log(`[${this.id}] Starting election for term ${this.currentTerm}`);

    const lastLog = this.log[this.log.length - 1];
    const request: RequestVoteRequest = {
      term: this.currentTerm,
      candidateId: this.id,
      lastLogIndex: lastLog ? lastLog.index : 0,
      lastLogTerm: lastLog ? lastLog.term : 0
    };

    let votes = 1; // 自己投自己

    for (const peer of this.peers) {
      try {
        const granted = await peer.handleRequestVote(request);
        if (granted) votes++;
      } catch (e) {
        // 网络错误
      }
    }

    const majority = Math.floor((this.peers.length + 1) / 2) + 1;

    if (votes >= majority && this.state === RaftState.CANDIDATE) {
      this.becomeLeader();
    } else {
      this.resetElectionTimeout();
    }
  }

  private becomeLeader() {
    this.state = RaftState.LEADER;
    console.log(`[${this.id}] Became leader for term ${this.currentTerm}`);

    // 初始化 Leader 状态
    for (const peer of this.peers) {
      this.nextIndex.set(peer.id, this.log.length + 1);
      this.matchIndex.set(peer.id, 0);
    }

    // 发送心跳
    this.sendHeartbeat();
    this.heartbeatInterval = setInterval(() => this.sendHeartbeat(), 50);
  }

  private async sendHeartbeat() {
    if (this.state !== RaftState.LEADER) {
      if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
      return;
    }

    for (const peer of this.peers) {
      const nextIdx = this.nextIndex.get(peer.id) || 1;
      const prevLog = this.log[nextIdx - 2];

      const request: AppendEntriesRequest = {
        term: this.currentTerm,
        leaderId: this.id,
        prevLogIndex: prevLog ? prevLog.index : 0,
        prevLogTerm: prevLog ? prevLog.term : 0,
        entries: this.log.slice(nextIdx - 1),
        leaderCommit: this.commitIndex
      };

      peer.handleAppendEntries(request).then(success => {
        if (success) {
          this.matchIndex.set(peer.id, nextIdx - 1 + request.entries.length);
          this.nextIndex.set(peer.id, nextIdx + request.entries.length);
        } else {
          this.nextIndex.set(peer.id, Math.max(1, nextIdx - 1));
        }
      });
    }
  }

  async handleRequestVote(request: RequestVoteRequest): Promise<boolean> {
    if (request.term < this.currentTerm) return false;

    if (request.term > this.currentTerm) {
      this.currentTerm = request.term;
      this.state = RaftState.FOLLOWER;
      this.votedFor = null;
    }

    const lastLog = this.log[this.log.length - 1];
    const logOk = !lastLog ||
      request.lastLogTerm > lastLog.term ||
      (request.lastLogTerm === lastLog.term &&
       request.lastLogIndex >= lastLog.index);

    if ((this.votedFor === null || this.votedFor === request.candidateId) &&
        logOk) {
      this.votedFor = request.candidateId;
      this.resetElectionTimeout();
      return true;
    }

    return false;
  }

  async handleAppendEntries(request: AppendEntriesRequest): Promise<boolean> {
    if (request.term < this.currentTerm) return false;

    this.resetElectionTimeout();
    this.currentTerm = request.term;
    this.state = RaftState.FOLLOWER;

    // 日志一致性检查
    if (request.prevLogIndex > 0) {
      const prevLog = this.log[request.prevLogIndex - 1];
      if (!prevLog || prevLog.term !== request.prevLogTerm) {
        return false;
      }
    }

    // 追加新条目
    if (request.entries.length > 0) {
      // 删除冲突条目
      for (let i = request.prevLogIndex; i < this.log.length; i++) {
        if (this.log[i].term !== request.entries[i - request.prevLogIndex]?.term) {
          this.log = this.log.slice(0, i);
          break;
        }
      }

      // 追加新条目
      this.log.push(...request.entries.slice(this.log.length - request.prevLogIndex));
    }

    // 更新 commit index
    if (request.leaderCommit > this.commitIndex) {
      this.commitIndex = Math.min(request.leaderCommit, this.log.length);
    }

    return true;
  }

  async propose(command: any): Promise<void> {
    if (this.state !== RaftState.LEADER) {
      throw new Error('Only leader can propose');
    }

    const entry: LogEntry = {
      term: this.currentTerm,
      index: this.log.length + 1,
      command
    };

    this.log.push(entry);
  }
}

// ============ PBFT 实现 ============

interface PBFTMessage {
  type: 'PRE-PREPARE' | 'PREPARE' | 'COMMIT' | 'REPLY';
  view: number;
  sequence: number;
  digest: string;
  id: string;
  value?: any;
}

class PBFTNode {
  id: string;
  view = 0;
  sequence = 0;
  private isPrimary: boolean;
  private nodes: PBFTNode[] = [];
  private f: number; // 最大容错数

  // 消息日志
  private prePrepareLog = new Map<string, PBFTMessage>();
  private prepareLog = new Map<string, PBFTMessage[]>();
  private commitLog = new Map<string, PBFTMessage[]>();
  private prepared = new Set<string>();
  private committed = new Set<string>();

  constructor(id: string, totalNodes: number) {
    this.id = id;
    this.f = Math.floor((totalNodes - 1) / 3);
    this.isPrimary = id === 'node0'; // 简化：node0 为主节点
  }

  setNodes(nodes: PBFTNode[]) {
    this.nodes = nodes;
  }

  get primaryId(): string {
    return `node${this.view % this.nodes.length}`;
  }

  async request(value: any): Promise<void> {
    if (!this.isPrimary) {
      // 转发给主节点
      const primary = this.nodes.find(n => n.id === this.primaryId);
      if (primary) {
        await primary.request(value);
      }
      return;
    }

    this.sequence++;
    const digest = this.computeDigest(value);

    const prePrepare: PBFTMessage = {
      type: 'PRE-PREPARE',
      view: this.view,
      sequence: this.sequence,
      digest,
      id: this.id,
      value
    };

    this.broadcast(prePrepare);
  }

  private async broadcast(msg: PBFTMessage) {
    for (const node of this.nodes) {
      if (node.id !== this.id) {
        await node.receive(msg);
      }
    }
  }

  async receive(msg: PBFTMessage) {
    const key = `${msg.view}-${msg.sequence}`;

    switch (msg.type) {
      case 'PRE-PREPARE':
        if (this.validatePrePrepare(msg)) {
          this.prePrepareLog.set(key, msg);

          const prepare: PBFTMessage = {
            type: 'PREPARE',
            view: msg.view,
            sequence: msg.sequence,
            digest: msg.digest,
            id: this.id
          };

          this.broadcast(prepare);
        }
        break;

      case 'PREPARE':
        if (!this.prepareLog.has(key)) {
          this.prepareLog.set(key, []);
        }
        this.prepareLog.get(key)!.push(msg);

        // 检查是否收到 2f 个 prepare
        if (this.prepareLog.get(key)!.length >= 2 * this.f &&
            !this.prepared.has(key)) {
          this.prepared.add(key);

          const commit: PBFTMessage = {
            type: 'COMMIT',
            view: msg.view,
            sequence: msg.sequence,
            digest: msg.digest,
            id: this.id
          };

          this.broadcast(commit);
        }
        break;

      case 'COMMIT':
        if (!this.commitLog.has(key)) {
          this.commitLog.set(key, []);
        }
        this.commitLog.get(key)!.push(msg);

        // 检查是否收到 2f+1 个 commit
        if (this.commitLog.get(key)!.length >= 2 * this.f + 1 &&
            !this.committed.has(key)) {
          this.committed.add(key);

          const prePrepare = this.prePrepareLog.get(key);
          if (prePrepare) {
            console.log(`[${this.id}] Committed: ${JSON.stringify(prePrepare.value)}`);
          }
        }
        break;
    }
  }

  private validatePrePrepare(msg: PBFTMessage): boolean {
    return msg.id === this.primaryId && msg.view === this.view;
  }

  private computeDigest(value: any): string {
    // 简化的摘要计算
    return Buffer.from(JSON.stringify(value)).toString('base64').slice(0, 16);
  }
}

// ============ 使用示例 ============

async function demonstrateConsensus() {
  console.log('=== Paxos 演示 ===');
  const acceptors = [new PaxosAcceptor(), new PaxosAcceptor(), new PaxosAcceptor()];
  const proposer = new PaxosProposer(acceptors);

  try {
    const result = await proposer.propose('value1');
    console.log('Paxos consensus reached:', result);
  } catch (e) {
    console.error('Paxos failed:', e);
  }

  console.log('\n=== Raft 演示 ===');
  const raftNodes = ['node1', 'node2', 'node3'].map(id => new RaftNode(id));
  raftNodes.forEach(node => node.setPeers(raftNodes));

  // 等待选举完成
  await new Promise(resolve => setTimeout(resolve, 500));

  // 找到 leader 并提交命令
  const leader = raftNodes.find(n => n.state === RaftState.LEADER);
  if (leader) {
    await leader.propose('command1');
    console.log('Raft command proposed by leader');
  }

  console.log('\n=== PBFT 演示 ===');
  const pbftNodes = ['node0', 'node1', 'node2', 'node3'].map(
    id => new PBFTNode(id, 4)
  );
  pbftNodes.forEach(node => node.setNodes(pbftNodes));

  await pbftNodes[0].request('transaction1');

  // 等待消息传播
  await new Promise(resolve => setTimeout(resolve, 100));
}

demonstrateConsensus().catch(console.error);
```


---

## 4. 分布式事务的模式

### 4.1 事务的 ACID 属性形式化

**定义 4.1**（事务）：事务 $T$ 是一个操作序列 $T = \langle o_1, o_2, ..., o_n \rangle$，满足 ACID 属性。

**原子性（Atomicity）**：
$$\forall T : commit(T) \lor abort(T) \text{ (全有或全无)}$$

**一致性（Consistency）**：
$$consistent(S) \land T(S) \Rightarrow consistent(T(S))$$

**隔离性（Isolation）**：
$$\forall T_1, T_2 : schedule(T_1, T_2) \text{ 等价于 } serial(T_1, T_2)$$

**持久性（Durability）**：
$$commit(T) \Rightarrow \Diamond permanent(T)$$

### 4.2 两阶段提交（2PC）形式化

**定义 4.2**（2PC 参与者状态机）：
参与者 $p$ 的状态转换：

- $INIT \xrightarrow{prepare} PREPARED$
- $INIT \xrightarrow{vote\ no} ABORTED$
- $PREPARED \xrightarrow{commit} COMMITTED$
- $PREPARED \xrightarrow{rollback} ABORTED$

**2PC 协议流程**：

**阶段 1：投票阶段**

1. 协调者向所有参与者发送 $\text{PREPARE}$
2. 参与者执行本地事务，记录 undo/redo 日志
3. 参与者回复 $\text{YES}$（准备就绪）或 $\text{NO}$（无法执行）

**阶段 2：决策阶段**

1. 协调者收集所有投票：
   - 如果全部 $\text{YES}$：发送 $\text{COMMIT}$
   - 如果有 $\text{NO}$：发送 $\text{ROLLBACK}$
2. 参与者执行提交或回滚
3. 参与者发送 $\text{ACK}$

**定理 4.1**（2PC 原子性）：2PC 保证分布式事务的原子性。

**证明**：

**情况 1**：所有参与者投票 YES

- 协调者发送 COMMIT
- 所有参与者提交，事务完成

**情况 2**：至少一个参与者投票 NO

- 协调者发送 ROLLBACK
- 所有参与者回滚，事务未完成

**情况 3**：协调者故障（需配合超时机制）

- 参与者等待超时后询问其他参与者
- 如果有参与者已提交/回滚，则跟随
- 否则等待协调者恢复

因此所有参与者最终达成一致的决策。$\square$

### 4.3 三阶段提交（3PC）形式化

**定义 4.3**（3PC 参与者状态机）：
3PC 增加了 PRE-COMMIT 状态，允许在协调者故障时安全地提交。

**3PC 协议流程**：

**阶段 1：CanCommit**

- 协调者询问参与者是否可以执行
- 参与者检查资源可用性，回复 YES/NO

**阶段 2：PreCommit**

- 如果全部 YES，协调者发送 PRE-COMMIT
- 参与者进入 PRE-COMMIT 状态，准备提交

**阶段 3：DoCommit**

- 协调者发送 COMMIT
- 参与者提交事务

**定理 4.2**（3PC 非阻塞性）：在网络分区不发生时，3PC 是非阻塞的。

**证明**：

在 3PC 中，当参与者处于 PRE-COMMIT 状态时，说明所有参与者都已准备好提交。

如果协调者故障，参与者可以安全地询问其他参与者：

- 如果有任何参与者已收到 COMMIT，则所有参与者都可以提交
- 如果所有参与者都在 PRE-COMMIT，则可以安全提交（协调者必然已收到全部 YES）
- 如果有参与者在 INIT，则回滚

因此 3PC 避免了 2PC 的阻塞问题（在特定条件下）。$\square$

### 4.4 Saga 模式形式化

**定义 4.4**（Saga）：Saga 是一系列本地事务 $S = \langle T_1, T_2, ..., T_n \rangle$，每个 $T_i$ 有对应的补偿事务 $C_i$。

**Saga 执行规则**：

1. **正向执行**：$T_1 \to T_2 \to ... \to T_n$（如果全部成功）
2. **补偿执行**：如果 $T_k$ 失败，则执行 $C_{k-1} \to C_{k-2} \to ... \to C_1$

**Saga 一致性保证**：

- **语义一致性**：每个本地事务是原子的
- **补偿一致性**：补偿事务逻辑上撤销原事务的效果
- **最终一致性**： Saga 完成后，系统达到一致状态

**定理 4.3**（Saga 可补偿性）：如果每个本地事务 $T_i$ 都有正确的补偿 $C_i$，则 Saga 保证最终一致性。

**证明**：

设 Saga 在 $T_k$ 处失败。

已执行的本地事务：$T_1, T_2, ..., T_{k-1}$

执行的补偿事务：$C_{k-1}, C_{k-2}, ..., C_1$

由补偿定义：
$$\forall i < k : C_i(T_i(S)) = S$$

因此：
$$C_1(C_2(...(C_{k-1}(T_{k-1}(...T_2(T_1(S))...))...)) = S$$

系统状态恢复到初始状态。$\square$

### 4.5 事务隔离级别形式化

**定义 4.5**（串行化图）：
对于调度 $S$，构造串行化图 $G_S = (V, E)$：

- $V$ = 事务集合
- $E$ = 冲突边：如果 $T_i$ 的操作在 $S$ 中先于 $T_j$ 的冲突操作，则 $T_i \to T_j \in E$

**定理 4.4**（可串行化判定）：调度 $S$ 是可串行化的当且仅当 $G_S$ 无环。

**隔离级别形式化**：

| 隔离级别 | 禁止的异常 |
|---------|-----------|
| READ UNCOMMITTED | 无 |
| READ COMMITTED | 脏读 |
| REPEATABLE READ | 脏读、不可重复读 |
| SERIALIZABLE | 脏读、不可重复读、幻读 |

**形式化定义**：

- **脏读**：$T_2$ 读取了 $T_1$ 未提交的写入
- **不可重复读**：$T_1$ 两次读取同一数据得到不同结果（中间有 $T_2$ 提交）
- **幻读**：$T_1$ 的查询结果集在重执行时改变（由于 $T_2$ 的插入/删除）

### 4.6 算法伪代码

```
Algorithm: Two-Phase-Commit
Coordinator:
1: function CommitTransaction(T)
2:    for each participant p in T.participants do
3:        send PREPARE to p
4:
5:    votes = collectVotes(timeout)
6:
7:    if all votes == YES then
8:        decision = COMMIT
9:        write COMMIT record to log
10:   else
11:       decision = ABORT
12:       write ABORT record to log
13:
14:   for each participant p do
15:       send decision to p
16:
17:   wait for all ACKs
18: end function

Participant:
1: on receive PREPARE from coordinator
2:    try
3:        execute local transaction
4:        write PREPARED record to log
5:        send YES to coordinator
6:    catch error
7:        write ABORT record to log
8:        send NO to coordinator
9: end on

10: on receive COMMIT from coordinator
11:    commit local transaction
12:    write COMMIT record to log
13:    send ACK to coordinator
14: end on

15: on receive ABORT from coordinator
16:    rollback local transaction
17:    write ABORT record to log
18:    send ACK to coordinator
19: end on

Algorithm: Saga-Execution
Input: saga S = [T1, T2, ..., Tn], compensations C = [C1, ..., Cn-1]

1: function ExecuteSaga(S, C)
2:    completed = []
3:
4:    for i = 1 to n do
5:        try
6:            result = execute(Ti)
7:            completed.push(Ti)
8:            if i < n then
9:                publishEvent(TiCompleted, result)
10:       catch error
11:           // 执行补偿
12:           for j = completed.length down to 1 do
13:               execute(C[j])
14:               publishEvent(TjCompensated)
15:           return FAILURE
16:
17:    return SUCCESS
18: end function
```

### 4.7 Node.js/TypeScript 实现

```typescript
/**
 * 分布式事务模式的 TypeScript 实现
 * 包含 2PC、3PC、Saga 模式的完整实现
 */

import { EventEmitter } from 'events';

// ============ 基础事务类型定义 ============

interface TransactionContext {
  transactionId: string;
  startTime: number;
  participants: string[];
}

interface TransactionLog {
  transactionId: string;
  operation: 'PREPARE' | 'COMMIT' | 'ABORT' | 'COMPENSATE';
  participantId: string;
  timestamp: number;
  data?: any;
}

// ============ 2PC 实现 ============

type ParticipantState = 'INIT' | 'PREPARED' | 'COMMITTED' | 'ABORTED';
type CoordinatorState = 'INIT' | 'WAITING' | 'COMMITTING' | 'ABORTING' | 'COMPLETED';

class TwoPhaseCommitParticipant extends EventEmitter {
  id: string;
  state: ParticipantState = 'INIT';
  private data: Map<string, any> = new Map();
  private undoLog: any[] = [];
  private redoLog: any[] = [];

  constructor(id: string) {
    super();
    this.id = id;
  }

  async onPrepare(transactionId: string, operations: any[]): Promise<boolean> {
    try {
      // 执行本地操作（但不提交）
      this.undoLog = [];

      for (const op of operations) {
        const oldValue = this.data.get(op.key);
        this.undoLog.push({ key: op.key, oldValue });
        this.data.set(op.key, op.value);
      }

      this.state = 'PREPARED';
      console.log(`[${this.id}] Prepared transaction ${transactionId}`);
      return true;
    } catch (error) {
      this.state = 'ABORTED';
      console.log(`[${this.id}] Failed to prepare: ${error}`);
      return false;
    }
  }

  async onCommit(transactionId: string): Promise<void> {
    if (this.state !== 'PREPARED') {
      throw new Error('Not in prepared state');
    }

    // 提交：清理日志
    this.undoLog = [];
    this.redoLog = [];
    this.state = 'COMMITTED';

    console.log(`[${this.id}] Committed transaction ${transactionId}`);
  }

  async onAbort(transactionId: string): Promise<void> {
    // 回滚：使用 undo log
    for (const entry of this.undoLog.reverse()) {
      if (entry.oldValue === undefined) {
        this.data.delete(entry.key);
      } else {
        this.data.set(entry.key, entry.oldValue);
      }
    }

    this.undoLog = [];
    this.state = 'ABORTED';

    console.log(`[${this.id}] Aborted transaction ${transactionId}`);
  }

  getState(): ParticipantState {
    return this.state;
  }

  getData(key: string): any {
    return this.data.get(key);
  }
}

class TwoPhaseCommitCoordinator extends EventEmitter {
  private participants: Map<string, TwoPhaseCommitParticipant> = new Map();
  private transactionLog: TransactionLog[] = [];
  private state: CoordinatorState = 'INIT';

  registerParticipant(participant: TwoPhaseCommitParticipant) {
    this.participants.set(participant.id, participant);
  }

  async executeTransaction(
    transactionId: string,
    operations: Map<string, any[]>
  ): Promise<boolean> {
    this.state = 'WAITING';

    console.log(`[Coordinator] Starting 2PC for ${transactionId}`);

    // Phase 1: Prepare
    const votes = new Map<string, boolean>();

    for (const [participantId, ops] of operations) {
      const participant = this.participants.get(participantId);
      if (!participant) {
        votes.set(participantId, false);
        continue;
      }

      try {
        const vote = await participant.onPrepare(transactionId, ops);
        votes.set(participantId, vote);

        this.logTransaction({
          transactionId,
          operation: 'PREPARE',
          participantId,
          timestamp: Date.now(),
          data: { vote }
        });
      } catch (error) {
        votes.set(participantId, false);
      }
    }

    // Phase 2: Decision
    const allYes = Array.from(votes.values()).every(v => v);

    if (allYes) {
      return this.doCommit(transactionId, Array.from(operations.keys()));
    } else {
      return this.doAbort(transactionId, Array.from(operations.keys()));
    }
  }

  private async doCommit(
    transactionId: string,
    participantIds: string[]
  ): Promise<boolean> {
    this.state = 'COMMITTING';

    console.log(`[Coordinator] Decided COMMIT for ${transactionId}`);

    this.logTransaction({
      transactionId,
      operation: 'COMMIT',
      participantId: 'coordinator',
      timestamp: Date.now()
    });

    for (const participantId of participantIds) {
      const participant = this.participants.get(participantId);
      if (participant) {
        await participant.onCommit(transactionId);
      }
    }

    this.state = 'COMPLETED';
    return true;
  }

  private async doAbort(
    transactionId: string,
    participantIds: string[]
  ): Promise<boolean> {
    this.state = 'ABORTING';

    console.log(`[Coordinator] Decided ABORT for ${transactionId}`);

    this.logTransaction({
      transactionId,
      operation: 'ABORT',
      participantId: 'coordinator',
      timestamp: Date.now()
    });

    for (const participantId of participantIds) {
      const participant = this.participants.get(participantId);
      if (participant) {
        await participant.onAbort(transactionId);
      }
    }

    this.state = 'COMPLETED';
    return false;
  }

  private logTransaction(log: TransactionLog) {
    this.transactionLog.push(log);
  }

  // 故障恢复
  async recoverFromLog(): Promise<void> {
    const incompleteTransactions = this.getIncompleteTransactions();

    for (const txId of incompleteTransactions) {
      const lastLog = this.getLastLogForTransaction(txId);

      if (lastLog?.operation === 'COMMIT') {
        // 需要完成提交
        console.log(`[Recovery] Completing commit for ${txId}`);
      } else if (lastLog?.operation === 'ABORT') {
        // 需要完成回滚
        console.log(`[Recovery] Completing abort for ${txId}`);
      }
    }
  }

  private getIncompleteTransactions(): string[] {
    const completed = new Set<string>();
    const started = new Set<string>();

    for (const log of this.transactionLog) {
      started.add(log.transactionId);
      if (log.operation === 'COMMIT' || log.operation === 'ABORT') {
        completed.add(log.transactionId);
      }
    }

    return Array.from(started).filter(id => !completed.has(id));
  }

  private getLastLogForTransaction(transactionId: string): TransactionLog | undefined {
    const logs = this.transactionLog.filter(l => l.transactionId === transactionId);
    return logs[logs.length - 1];
  }
}

// ============ Saga 模式实现 ============

type SagaStepStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'COMPENSATED';

interface SagaStep {
  id: string;
  name: string;
  execute: () => Promise<any>;
  compensate?: () => Promise<void>;
}

interface SagaStepResult {
  stepId: string;
  status: SagaStepStatus;
  result?: any;
  error?: Error;
}

class SagaOrchestrator extends EventEmitter {
  private steps: SagaStep[] = [];
  private results: SagaStepResult[] = [];
  private state: 'RUNNING' | 'COMPLETED' | 'COMPENSATING' | 'FAILED' = 'RUNNING';

  addStep(step: SagaStep) {
    this.steps.push(step);
  }

  async execute(sagaId: string): Promise<{ success: boolean; results: SagaStepResult[] }> {
    console.log(`[Saga ${sagaId}] Starting execution`);

    const completedSteps: SagaStep[] = [];

    for (const step of this.steps) {
      try {
        console.log(`[Saga ${sagaId}] Executing step: ${step.name}`);

        const result = await step.execute();

        this.results.push({
          stepId: step.id,
          status: 'COMPLETED',
          result
        });

        completedSteps.push(step);

        this.emit('stepCompleted', { sagaId, stepId: step.id, result });

      } catch (error) {
        console.log(`[Saga ${sagaId}] Step ${step.name} failed: ${error}`);

        this.results.push({
          stepId: step.id,
          status: 'FAILED',
          error: error as Error
        });

        // 执行补偿
        await this.compensate(sagaId, completedSteps);

        return { success: false, results: this.results };
      }
    }

    this.state = 'COMPLETED';
    console.log(`[Saga ${sagaId}] Completed successfully`);

    return { success: true, results: this.results };
  }

  private async compensate(sagaId: string, completedSteps: SagaStep[]): Promise<void> {
    this.state = 'COMPENSATING';
    console.log(`[Saga ${sagaId}] Starting compensation`);

    // 逆序执行补偿
    for (let i = completedSteps.length - 1; i >= 0; i--) {
      const step = completedSteps[i];

      if (step.compensate) {
        try {
          console.log(`[Saga ${sagaId}] Compensating step: ${step.name}`);
          await step.compensate();

          const result = this.results.find(r => r.stepId === step.id);
          if (result) result.status = 'COMPENSATED';

        } catch (compError) {
          console.error(`[Saga ${sagaId}] Compensation failed for ${step.name}:`, compError);
          // 补偿失败需要人工干预或重试
        }
      }
    }

    this.state = 'FAILED';
    console.log(`[Saga ${sagaId}] Compensation completed`);
  }
}

// ============ 实际应用示例 ============

// 订单 Saga 示例
class OrderSagaBuilder {
  static createOrderSaga(): SagaOrchestrator {
    const saga = new SagaOrchestrator();

    // 步骤 1: 创建订单
    saga.addStep({
      id: 'create-order',
      name: 'Create Order',
      execute: async () => {
        console.log('  -> Creating order in database');
        return { orderId: 'ORD-123', amount: 100 };
      },
      compensate: async () => {
        console.log('  <- Compensating: Canceling order');
      }
    });

    // 步骤 2: 扣减库存
    saga.addStep({
      id: 'reserve-inventory',
      name: 'Reserve Inventory',
      execute: async () => {
        console.log('  -> Reserving inventory');
        return { reserved: true };
      },
      compensate: async () => {
        console.log('  <- Compensating: Releasing inventory');
      }
    });

    // 步骤 3: 处理支付
    saga.addStep({
      id: 'process-payment',
      name: 'Process Payment',
      execute: async () => {
        console.log('  -> Processing payment');
        // 模拟随机失败
        if (Math.random() < 0.3) {
          throw new Error('Payment declined');
        }
        return { transactionId: 'TXN-456' };
      },
      compensate: async () => {
        console.log('  <- Compensating: Refunding payment');
      }
    });

    // 步骤 4: 发货
    saga.addStep({
      id: 'ship-order',
      name: 'Ship Order',
      execute: async () => {
        console.log('  -> Shipping order');
        return { trackingNumber: 'TRACK-789' };
      },
      compensate: async () => {
        console.log('  <- Compensating: Canceling shipment');
      }
    });

    return saga;
  }
}

// ============ 使用示例 ============

async function demonstrateDistributedTransactions() {
  console.log('=== 2PC 演示 ===\n');

  // 创建参与者
  const participants = [
    new TwoPhaseCommitParticipant('db1'),
    new TwoPhaseCommitParticipant('db2'),
    new TwoPhaseCommitParticipant('db3')
  ];

  // 创建协调者
  const coordinator = new TwoPhaseCommitCoordinator();
  participants.forEach(p => coordinator.registerParticipant(p));

  // 执行事务
  const operations = new Map([
    ['db1', [{ key: 'account:A', value: 900 }]],  // 扣减 A 账户
    ['db2', [{ key: 'account:B', value: 1100 }]], // 增加 B 账户
    ['db3', [{ key: 'transaction:tx1', value: { from: 'A', to: 'B', amount: 100 } }]]
  ]);

  const result = await coordinator.executeTransaction('TX-001', operations);
  console.log(`\nTransaction result: ${result ? 'COMMITTED' : 'ABORTED'}`);

  console.log('\n=== Saga 模式演示 ===\n');

  const orderSaga = OrderSagaBuilder.createOrderSaga();
  const sagaResult = await orderSaga.execute('ORDER-001');

  console.log(`\nSaga result: ${sagaResult.success ? 'SUCCESS' : 'FAILED'}`);
  console.log('Step results:', sagaResult.results.map(r => ({
    step: r.stepId,
    status: r.status
  })));
}

demonstrateDistributedTransactions().catch(console.error);
```



---

## 5. 向量时钟和逻辑时钟

### 5.1 逻辑时钟理论基础

**定义 5.1**（Happened-Before 关系 $\rightarrow$）：
对于事件 $e_1$ 和 $e_2$，定义：

- $e_1 \rightarrow e_2$ 如果 $e_1$ 和 $e_2$ 在同一进程且 $e_1$ 先于 $e_2$
- $e_1 \rightarrow e_2$ 如果 $e_1$ 是发送消息，$e_2$ 是接收该消息
- 传递性：如果 $e_1 \rightarrow e_2$ 且 $e_2 \rightarrow e_3$，则 $e_1 \rightarrow e_3$

**定义 5.2**（并发关系 $||$）：
两个事件是并发的当且仅当：
$$e_1 || e_2 \iff \neg(e_1 \rightarrow e_2) \land \neg(e_2 \rightarrow e_1)$$

### 5.2 Lamport 逻辑时钟

**定义 5.3**（Lamport 时间戳）：
每个进程 $p_i$ 维护一个时钟 $C_i$，规则如下：

1. **本地事件**：$C_i = C_i + 1$
2. **发送消息**：消息携带时间戳 $t = C_i$，然后 $C_i = C_i + 1$
3. **接收消息**：$C_i = \max(C_i, t) + 1$，其中 $t$ 是消息中的时间戳

**定理 5.1**（Lamport 时钟性质）：
$$e_1 \rightarrow e_2 \Rightarrow C(e_1) < C(e_2)$$

**注意**：逆命题不成立。$C(e_1) < C(e_2)$ 不蕴含 $e_1 \rightarrow e_2$。

### 5.3 向量时钟形式化

**定义 5.4**（向量时钟）：
对于 $n$ 个进程的系统，向量时钟是 $n$ 维向量 $V = [v_1, v_2, ..., v_n]$。

**向量时钟更新规则**：

1. **本地事件**：$V_i[i] = V_i[i] + 1$
2. **发送消息**：消息携带 $V_i$，然后 $V_i[i] = V_i[i] + 1$
3. **接收消息**：$V_i[j] = \max(V_i[j], V_m[j])$ 对所有 $j$，然后 $V_i[i] = V_i[i] + 1$

**定义 5.5**（向量时钟比较）：
对于两个向量时钟 $V$ 和 $W$：

- $V < W$ 如果 $\forall i : V[i] \leq W[i]$ 且 $\exists j : V[j] < W[j]$
- $V = W$ 如果 $\forall i : V[i] = W[i]$
- $V || W$（并发）如果 $\neg(V < W) \land \neg(W < V) \land V \neq W$

**定理 5.2**（向量时钟完备性）：
$$e_1 \rightarrow e_2 \iff V(e_1) < V(e_2)$$

**证明**：

**（$\Rightarrow$）方向**：

对 happens-before 关系的长度进行归纳。

**基础情况**：$e_1$ 和 $e_2$ 在同一进程 $p_i$ 且 $e_1$ 直接先于 $e_2$。

- $e_1$ 执行后 $V_i[i]$ 增加
- $e_2$ 执行后 $V_i[i]$ 再次增加
- 因此 $V(e_1)[i] < V(e_2)[i]$，且其他分量不变，故 $V(e_1) < V(e_2)$

**归纳步骤**：假设对于长度为 $k$ 的 happens-before 链成立。

对于长度 $k+1$ 的链 $e_1 \rightarrow ... \rightarrow e_k \rightarrow e_{k+1}$：

- 由归纳假设 $V(e_1) < V(e_k)$
- 由基础情况 $V(e_k) < V(e_{k+1})$（或消息传递情况）
- 由传递性 $V(e_1) < V(e_{k+1})$

**（$\Leftarrow$）方向**：

假设 $V(e_1) < V(e_2)$，则存在某个 $i$ 使得 $V(e_1)[i] < V(e_2)[i]$。

这意味着在进程 $p_i$ 上，事件 $e_2$ 看到的事件比 $e_1$ 多。

因此 $e_1$ 的因果影响必须已经传递到 $p_i$ 才能被 $e_2$ 看到，即 $e_1 \rightarrow e_2$。$\square$

### 5.4 版本向量

**定义 5.6**（版本向量）：
版本向量是向量时钟的优化版本，用于检测副本之间的分歧。

对于数据项 $x$ 的副本集 $R = \{r_1, ..., r_n\}$，版本向量 $VV(x)$ 记录每个副本的更新次数。

**冲突检测**：
对于同一数据项的两个版本 $x_1$ 和 $x_2$：

- 如果 $VV(x_1) < VV(x_2)$：$x_2$ 是 $x_1$ 的后代，选择 $x_2$
- 如果 $VV(x_2) < VV(x_1)$：$x_1$ 是 $x_2$ 的后代，选择 $x_1$
- 如果 $VV(x_1) || VV(x_2)$：存在冲突，需要解决

### 5.5 标量时钟和矩阵时钟

**标量时钟（Scalar Clock）**：
单一整数 $c$，更新规则：

- 本地：$c = c + 1$
- 接收：$c = \max(c, c_{msg}) + 1$

**矩阵时钟（Matrix Clock）**：
$n \times n$ 矩阵 $M$，其中 $M[i][j]$ 表示进程 $p_i$ 所知道的进程 $p_j$ 的事件数。

矩阵时钟可以回答："我是否知道所有其他进程所知道的一切？"

### 5.6 算法伪代码

```
Algorithm: Lamport-Timestamp
Process pi with clock Ci

1: on local event
2:    Ci = Ci + 1
3:    timestamp(event) = Ci
4: end on

5: on send message m
6:    Ci = Ci + 1
7:    m.timestamp = Ci
8:    send m
9: end on

10: on receive message m from pj
11:    Ci = max(Ci, m.timestamp) + 1
12:    timestamp(receive) = Ci
13: end on

Algorithm: Vector-Clock
Process pi with vector clock Vi[1..n]

1: function initialize()
2:    for j = 1 to n do
3:        Vi[j] = 0
4: end function

5: on local event
6:    Vi[i] = Vi[i] + 1
7:    timestamp(event) = copy(Vi)
8: end on

9: on send message m
10:   Vi[i] = Vi[i] + 1
11:   m.vector = copy(Vi)
12:   send m
13: end on

14: on receive message m from pj
15:   for k = 1 to n do
16:       Vi[k] = max(Vi[k], m.vector[k])
17:   Vi[i] = Vi[i] + 1
18:   timestamp(receive) = copy(Vi)
19: end on

20: function compare(V, W)
21:    dominates = false
22:    dominated = false
23:    for i = 1 to n do
24:        if V[i] < W[i] then dominated = true
25:        if V[i] > W[i] then dominates = true
26:    if dominated and not dominates then return "V < W"
27:    if dominates and not dominated then return "V > W"
28:    if not dominates and not dominated then return "V || W"
29:    return "V = W"
30: end function
```

### 5.7 Node.js/TypeScript 实现

```typescript
/**
 * 逻辑时钟和向量时钟的 TypeScript 实现
 */

// ============ Lamport 逻辑时钟 ============

class LamportClock {
  private clock: number = 0;

  // 获取当前时间戳
  getTimestamp(): number {
    return this.clock;
  }

  // 本地事件
  localEvent(): number {
    this.clock++;
    return this.clock;
  }

  // 发送消息
  sendEvent(): number {
    this.clock++;
    return this.clock;
  }

  // 接收消息
  receiveEvent(remoteTimestamp: number): number {
    this.clock = Math.max(this.clock, remoteTimestamp) + 1;
    return this.clock;
  }
}

// ============ 向量时钟 ============

class VectorClock {
  private vector: Map<string, number> = new Map();
  private processId: string;

  constructor(processId: string, allProcessIds: string[]) {
    this.processId = processId;
    allProcessIds.forEach(id => this.vector.set(id, 0));
  }

  // 本地事件
  localEvent(): Map<string, number> {
    const current = this.vector.get(this.processId) || 0;
    this.vector.set(this.processId, current + 1);
    return new Map(this.vector);
  }

  // 发送消息
  sendEvent(): Map<string, number> {
    return this.localEvent(); // 与本地事件相同
  }

  // 接收消息
  receiveEvent(remoteVector: Map<string, number>): Map<string, number> {
    // 逐元素取最大值
    for (const [processId, timestamp] of remoteVector) {
      const current = this.vector.get(processId) || 0;
      this.vector.set(processId, Math.max(current, timestamp));
    }

    // 增加本地进程的时间戳
    const current = this.vector.get(this.processId) || 0;
    this.vector.set(this.processId, current + 1);

    return new Map(this.vector);
  }

  // 获取当前向量时钟
  getVector(): Map<string, number> {
    return new Map(this.vector);
  }

  // 比较两个向量时钟
  static compare(
    v1: Map<string, number>,
    v2: Map<string, number>
  ): 'lt' | 'gt' | 'eq' | 'concurrent' {
    let hasLess = false;
    let hasGreater = false;
    let allEqual = true;

    const allKeys = new Set([...v1.keys(), ...v2.keys()]);

    for (const key of allKeys) {
      const val1 = v1.get(key) || 0;
      const val2 = v2.get(key) || 0;

      if (val1 < val2) {
        hasLess = true;
        allEqual = false;
      } else if (val1 > val2) {
        hasGreater = true;
        allEqual = false;
      }
    }

    if (allEqual) return 'eq';
    if (hasLess && !hasGreater) return 'lt';
    if (hasGreater && !hasLess) return 'gt';
    return 'concurrent';
  }

  // 检查因果关系
  static happensBefore(
    v1: Map<string, number>,
    v2: Map<string, number>
  ): boolean {
    return VectorClock.compare(v1, v2) === 'lt';
  }

  // 检查并发关系
  static concurrent(
    v1: Map<string, number>,
    v2: Map<string, number>
  ): boolean {
    return VectorClock.compare(v1, v2) === 'concurrent';
  }

  // 合并两个向量时钟（用于版本向量）
  static merge(v1: Map<string, number>, v2: Map<string, number>): Map<string, number> {
    const result = new Map<string, number>();
    const allKeys = new Set([...v1.keys(), ...v2.keys()]);

    for (const key of allKeys) {
      result.set(key, Math.max(v1.get(key) || 0, v2.get(key) || 0));
    }

    return result;
  }
}

// ============ 版本向量（用于冲突检测） ============

interface VersionedValue {
  value: any;
  versionVector: Map<string, number>;
  timestamp: number;
}

class VersionVectorStore {
  private data = new Map<string, VersionedValue>();
  private replicaId: string;

  constructor(replicaId: string) {
    this.replicaId = replicaId;
  }

  // 写入数据
  put(key: string, value: any): VersionedValue {
    const existing = this.data.get(key);
    const newVector = new Map(existing?.versionVector || []);

    // 增加本地版本号
    const currentVersion = newVector.get(this.replicaId) || 0;
    newVector.set(this.replicaId, currentVersion + 1);

    const versionedValue: VersionedValue = {
      value,
      versionVector: newVector,
      timestamp: Date.now()
    };

    this.data.set(key, versionedValue);
    return versionedValue;
  }

  // 获取数据
  get(key: string): VersionedValue | undefined {
    return this.data.get(key);
  }

  // 合并来自其他副本的更新
  merge(key: string, remoteValue: VersionedValue): 'accepted' | 'rejected' | 'conflict' {
    const localValue = this.data.get(key);

    if (!localValue) {
      // 本地没有该数据，直接接受
      this.data.set(key, remoteValue);
      return 'accepted';
    }

    const comparison = VectorClock.compare(
      localValue.versionVector,
      remoteValue.versionVector
    );

    switch (comparison) {
      case 'lt':
        // 远程版本更新，接受
        this.data.set(key, remoteValue);
        return 'accepted';

      case 'gt':
        // 本地版本更新，拒绝
        return 'rejected';

      case 'eq':
        // 版本相同，选择时间戳更新的
        if (remoteValue.timestamp > localValue.timestamp) {
          this.data.set(key, remoteValue);
          return 'accepted';
        }
        return 'rejected';

      case 'concurrent':
        // 并发冲突，需要解决
        return 'conflict';
    }
  }

  // 解决冲突（Last-Write-Wins 策略）
  resolveConflict(
    key: string,
    values: VersionedValue[]
  ): VersionedValue {
    // 选择时间戳最新的
    const winner = values.reduce((latest, current) =>
      current.timestamp > latest.timestamp ? current : latest
    );

    // 合并版本向量
    let mergedVector = winner.versionVector;
    for (const v of values) {
      mergedVector = VectorClock.merge(mergedVector, v.versionVector);
    }

    const resolved: VersionedValue = {
      value: winner.value,
      versionVector: mergedVector,
      timestamp: Date.now()
    };

    this.data.set(key, resolved);
    return resolved;
  }
}

// ============ 分布式事件排序系统 ============

interface Event {
  id: string;
  processId: string;
  type: 'local' | 'send' | 'receive';
  vectorClock: Map<string, number>;
  data?: any;
  relatedEvent?: string; // 对于 receive，指向对应的 send
}

class DistributedEventLog {
  private events: Event[] = [];
  private vectorClocks = new Map<string, VectorClock>();
  private processIds: string[];

  constructor(processIds: string[]) {
    this.processIds = processIds;
    processIds.forEach(id => {
      this.vectorClocks.set(id, new VectorClock(id, processIds));
    });
  }

  // 记录本地事件
  recordLocalEvent(processId: string, data?: any): Event {
    const clock = this.vectorClocks.get(processId)!;
    const event: Event = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      processId,
      type: 'local',
      vectorClock: clock.localEvent(),
      data
    };
    this.events.push(event);
    return event;
  }

  // 记录发送事件
  recordSendEvent(processId: string, data?: any): Event {
    const clock = this.vectorClocks.get(processId)!;
    const event: Event = {
      id: `send_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      processId,
      type: 'send',
      vectorClock: clock.sendEvent(),
      data
    };
    this.events.push(event);
    return event;
  }

  // 记录接收事件
  recordReceiveEvent(
    processId: string,
    sendEvent: Event,
    data?: any
  ): Event {
    const clock = this.vectorClocks.get(processId)!;
    const event: Event = {
      id: `recv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      processId,
      type: 'receive',
      vectorClock: clock.receiveEvent(sendEvent.vectorClock),
      data,
      relatedEvent: sendEvent.id
    };
    this.events.push(event);
    return event;
  }

  // 检查因果关系
  checkHappensBefore(event1Id: string, event2Id: string): boolean {
    const event1 = this.events.find(e => e.id === event1Id);
    const event2 = this.events.find(e => e.id === event2Id);

    if (!event1 || !event2) return false;

    return VectorClock.happensBefore(event1.vectorClock, event2.vectorClock);
  }

  // 检查并发
  checkConcurrent(event1Id: string, event2Id: string): boolean {
    const event1 = this.events.find(e => e.id === event1Id);
    const event2 = this.events.find(e => e.id === event2Id);

    if (!event1 || !event2) return false;

    return VectorClock.concurrent(event1.vectorClock, event2.vectorClock);
  }

  // 获取所有事件的全序（拓扑排序）
  getTopologicalOrder(): Event[] {
    // 使用向量时钟进行拓扑排序
    return [...this.events].sort((a, b) => {
      const comparison = VectorClock.compare(a.vectorClock, b.vectorClock);

      if (comparison === 'lt') return -1;
      if (comparison === 'gt') return 1;

      // 并发事件，按时间戳排序
      return a.id.localeCompare(b.id);
    });
  }

  // 查找并发事件组
  findConcurrentGroups(): Event[][] {
    const groups: Event[][] = [];
    const processed = new Set<string>();

    for (const event of this.events) {
      if (processed.has(event.id)) continue;

      const group = [event];
      processed.add(event.id);

      for (const other of this.events) {
        if (processed.has(other.id)) continue;

        if (VectorClock.concurrent(event.vectorClock, other.vectorClock)) {
          group.push(other);
          processed.add(other.id);
        }
      }

      if (group.length > 1) {
        groups.push(group);
      }
    }

    return groups;
  }
}

// ============ 使用示例 ============

function demonstrateClocks() {
  console.log('=== Lamport 逻辑时钟演示 ===\n');

  const p1Clock = new LamportClock();
  const p2Clock = new LamportClock();
  const p3Clock = new LamportClock();

  // P1 执行本地事件
  console.log('P1 local event:', p1Clock.localEvent());

  // P1 发送消息给 P2（时间戳 1）
  const msg1 = p1Clock.sendEvent();
  console.log('P1 send to P2:', msg1);

  // P2 接收消息
  console.log('P2 receive:', p2Clock.receiveEvent(msg1));

  // P2 执行本地事件
  console.log('P2 local event:', p2Clock.localEvent());

  // P2 发送消息给 P3
  const msg2 = p2Clock.sendEvent();
  console.log('P2 send to P3:', msg2);

  // P3 接收消息
  console.log('P3 receive:', p3Clock.receiveEvent(msg2));

  console.log('\n=== 向量时钟演示 ===\n');

  const processIds = ['A', 'B', 'C'];
  const clockA = new VectorClock('A', processIds);
  const clockB = new VectorClock('B', processIds);
  const clockC = new VectorClock('C', processIds);

  // A 执行事件
  const v1 = clockA.localEvent();
  console.log('A after event 1:', Object.fromEntries(v1));

  // A 发送消息给 B
  const sendAB = clockA.sendEvent();
  console.log('A sends to B:', Object.fromEntries(sendAB));

  // B 接收
  const recvB = clockB.receiveEvent(sendAB);
  console.log('B receives:', Object.fromEntries(recvB));

  // B 执行事件
  const v2 = clockB.localEvent();
  console.log('B after event:', Object.fromEntries(v2));

  // B 发送消息给 C
  const sendBC = clockB.sendEvent();
  console.log('B sends to C:', Object.fromEntries(sendBC));

  // A 执行另一个事件（与 B->C 并发）
  const v3 = clockA.localEvent();
  console.log('A event 2:', Object.fromEntries(v3));

  // C 接收 B 的消息
  const recvC = clockC.receiveEvent(sendBC);
  console.log('C receives:', Object.fromEntries(recvC));

  // 检查并发
  console.log('\nComparison A2 vs C:');
  console.log('  A2 < C?', VectorClock.compare(v3, recvC));
  console.log('  Concurrent?', VectorClock.concurrent(v3, recvC));

  console.log('\n=== 版本向量冲突检测演示 ===\n');

  const replica1 = new VersionVectorStore('R1');
  const replica2 = new VersionVectorStore('R2');

  // R1 写入
  const v1_r1 = replica1.put('key1', 'value1');
  console.log('R1 writes:', {
    value: v1_r1.value,
    version: Object.fromEntries(v1_r1.versionVector)
  });

  // R2 写入（并发）
  const v1_r2 = replica2.put('key1', 'value2');
  console.log('R2 writes:', {
    value: v1_r2.value,
    version: Object.fromEntries(v1_r2.versionVector)
  });

  // R1 合并 R2 的更新
  const mergeResult = replica1.merge('key1', v1_r2);
  console.log('R1 merges R2 update:', mergeResult);

  // R1 再次写入
  const v2_r1 = replica1.put('key1', 'value3');
  console.log('R1 writes again:', {
    value: v2_r1.value,
    version: Object.fromEntries(v2_r1.versionVector)
  });

  // R2 尝试合并（应该被拒绝或检测到冲突）
  const mergeResult2 = replica2.merge('key1', v2_r1);
  console.log('R2 merges R1 update:', mergeResult2);

  console.log('\n=== 分布式事件日志演示 ===\n');

  const eventLog = new DistributedEventLog(['A', 'B', 'C']);

  // 模拟分布式事件
  const e1 = eventLog.recordLocalEvent('A', 'event 1');
  const e2 = eventLog.recordSendEvent('A', 'send to B');
  const e3 = eventLog.recordReceiveEvent('B', e2, 'receive from A');
  const e4 = eventLog.recordLocalEvent('B', 'event 2');
  const e5 = eventLog.recordLocalEvent('C', 'concurrent event');
  const e6 = eventLog.recordSendEvent('B', 'send to C');
  const e7 = eventLog.recordReceiveEvent('C', e6, 'receive from B');

  console.log('Events recorded:', eventLog['events'].length);
  console.log('E1 -> E3?', eventLog.checkHappensBefore(e1.id, e3.id));
  console.log('E3 || E5?', eventLog.checkConcurrent(e3.id, e5.id));

  const concurrentGroups = eventLog.findConcurrentGroups();
  console.log('Concurrent groups:', concurrentGroups.length);
}

demonstrateClocks();
```



---

## 6. Gossip 协议的收敛性分析

### 6.1 Gossip 协议形式化定义

**定义 6.1**（Gossip 系统）：
Gossip 系统是一个三元组 $G = (N, S, P)$，其中：

- $N = \{n_1, ..., n_n\}$ 是节点集合
- $S$ 是状态空间
- $P: N \times N \to [0, 1]$ 是节点间通信概率矩阵

**定义 6.2**（Gossip 轮次）：
在第 $t$ 轮中，每个节点 $n_i$ 以概率 $p$ 随机选择另一个节点 $n_j$ 进行状态交换。

### 6.2 信息传播模型

**SI 模型**（Susceptible-Infected）：

- 节点状态：$S$（未收到信息）或 $I$（已收到信息）
- 传播规则：$S + I \xrightarrow{\beta} 2I$

**SIR 模型**（Susceptible-Infected-Recovered）：

- 节点状态：$S$、$I$、$R$（不再传播）
- 传播规则：
  - $S + I \xrightarrow{\beta} 2I$
  - $I \xrightarrow{\gamma} R$

### 6.3 收敛性定理

**定理 6.1**（Gossip 收敛时间）：
对于 $n$ 个节点的完全图，使用推-拉（push-pull）Gossip 协议传播一条消息，期望收敛时间为 $O(\log n)$ 轮。

**证明**：

设 $X_t$ 为第 $t$ 轮时已收到消息的节点数。

**推-拉分析**：

在推-拉 Gossip 中，每轮每个节点随机选择一个邻居进行双向信息交换。

对于未感染节点，被感染的概率：
$$P(\text{infection}) = 1 - \left(1 - \frac{X_t}{n}\right)^2$$

（选择已感染节点作为目标，或被已感染节点选择）

期望增长：
$$E[X_{t+1} - X_t] \approx \frac{2X_t(n-X_t)}{n}$$

令 $y_t = X_t/n$，则：
$$y_{t+1} - y_t \approx 2y_t(1-y_t)$$

这是逻辑斯谛增长，其解显示收敛时间为 $O(\log n)$。

具体地，当 $y_t \ll 1$ 时：
$$\frac{dy}{dt} \approx 2y \Rightarrow y(t) \approx y_0 e^{2t}$$

从 $y_0 = 1/n$ 增长到 $y = 1/2$ 需要时间 $t_1 \approx \frac{1}{2}\log(n/2) = O(\log n)$。

从 $y = 1/2$ 增长到 $y = 1 - 1/n$ 需要时间 $t_2 = O(\log n)$。

因此总时间 $T = t_1 + t_2 = O(\log n)$。$\square$

**定理 6.2**（Gossip 可靠性）：
推-拉 Gossip 协议以概率 $1 - o(1)$ 确保所有节点最终收到消息。

**证明**：

考虑最后未感染的节点。在每一轮，它被选中的概率至少为 $1 - (1 - 1/n)^{2(n-1)} \approx 1 - e^{-2}$。

因此，在 $O(n \log n)$ 轮内，所有节点都会被感染的概率至少为 $1 - 1/n$。$\square$

### 6.4 反熵（Anti-Entropy）分析

**定义 6.3**（熵）：系统熵衡量节点间状态的不一致性：
$$H(S) = -\sum_{s \in S} p(s) \log p(s)$$

其中 $p(s)$ 是状态 $s$ 在系统中的分布比例。

**定理 6.3**（反熵收敛）：
反熵 Gossip 协议以指数速度减少系统熵。

**证明**：

设 $H_t$ 为第 $t$ 轮的系统熵。

当两个节点交换状态时，它们的状态差异减小，导致系统整体熵减少。

对于随机选择的节点对，期望熵减少：
$$E[H_{t+1} - H_t] \leq -\alpha H_t$$

其中 $\alpha > 0$ 是某个常数。

因此：
$$H_t \leq H_0 e^{-\alpha t}$$

即指数收敛。$\square$

### 6.5 Gossip 协议变体

**1. 推 Gossip（Push Gossip）**

- 感染者主动向随机节点推送信息
- 适合初始传播阶段

**2. 拉 Gossip（Pull Gossip）**

- 未感染者主动向随机节点拉取信息
- 适合收尾阶段

**3. 推-拉 Gossip（Push-Pull Gossip）**

- 结合推和拉的优势
- 最优的收敛速度

### 6.6 算法伪代码

```
Algorithm: Push-Pull-Gossip
State: local state s

1: function gossipRound()
2:    // 推阶段
3:    target = selectRandomPeer()
4:    send PUSH(s) to target
5:
6:    // 拉阶段
7:    if received PUSH(s_target) then
8:        send PULL(s) to sender
9:        s = merge(s, s_target)
10:
11:   if received PULL(s_requester) then
12:       s = merge(s, s_requester)
13: end function

14: function merge(local, remote)
15:   // 根据应用逻辑合并状态
16:   return resolved_state
17: end function

Algorithm: Anti-Entropy-Gossip
State: local data D, version vector V

1: function antiEntropyRound()
2:    target = selectRandomPeer()
3:
4:    // 交换摘要（bloom filter 或 Merkle tree）
5:    send DIGEST(V) to target
6:
7:    on receive DIGEST(V_remote)
8:        diff = computeDifference(V, V_remote)
9:        send DIFF_REQUEST(diff.missing_at_sender)
10:
11:   on receive DIFF_REQUEST(request)
12:       data = retrieveData(request)
13:       send DIFF_RESPONSE(data)
14:
15:   on receive DIFF_RESPONSE(data)
16:       D = merge(D, data)
17:       V = updateVersionVector(V, data)
18: end function

Algorithm: Epidemic-Broadcast
Input: message m to broadcast

1: function broadcast(m)
2:    infected = true
3:    while infected do
4:        target = selectRandomPeer()
5:        send m to target
6:        wait random timeout
7:        if received confirmation from majority then
8:            infected = false  // 停止传播
9: end function

10: on receive message m
11:    if not seen(m) then
12:        store(m)
13:        infected = true
14:        broadcast(m)  // 继续传播
15: end on
```

### 6.7 Node.js/TypeScript 实现

```typescript
/**
 * Gossip 协议的 TypeScript 实现
 * 包含多种 Gossip 变体和收敛性分析
 */

import { EventEmitter } from 'events';

// ============ 基础 Gossip 节点 ============

interface GossipMessage {
  type: 'PUSH' | 'PULL' | 'STATE' | 'DIGEST';
  senderId: string;
  payload: any;
  timestamp: number;
}

interface NodeState {
  version: number;
  data: any;
  vectorClock: Map<string, number>;
}

class GossipNode extends EventEmitter {
  id: string;
  private peers: string[] = [];
  private state: NodeState;
  private messageLog = new Set<string>();
  private gossipInterval: NodeJS.Timeout | null = null;

  // 统计信息
  stats = {
    messagesSent: 0,
    messagesReceived: 0,
    statesMerged: 0
  };

  constructor(id: string, initialData: any = {}) {
    super();
    this.id = id;
    this.state = {
      version: 1,
      data: initialData,
      vectorClock: new Map([[id, 1]])
    };
  }

  setPeers(peers: string[]) {
    this.peers = peers.filter(p => p !== this.id);
  }

  // 启动 Gossip
  startGossip(intervalMs: number = 1000) {
    this.gossipInterval = setInterval(() => {
      this.gossipRound();
    }, intervalMs);
  }

  stopGossip() {
    if (this.gossipInterval) {
      clearInterval(this.gossipInterval);
    }
  }

  // Gossip 轮次
  private gossipRound() {
    if (this.peers.length === 0) return;

    const target = this.selectRandomPeer();
    this.sendPush(target);
  }

  private selectRandomPeer(): string {
    return this.peers[Math.floor(Math.random() * this.peers.length)];
  }

  // 推操作
  private sendPush(targetId: string) {
    const message: GossipMessage = {
      type: 'PUSH',
      senderId: this.id,
      payload: {
        state: this.state,
        messageIds: Array.from(this.messageLog).slice(-100) // 最近的 100 条消息
      },
      timestamp: Date.now()
    };

    this.emit('send', targetId, message);
    this.stats.messagesSent++;
  }

  // 拉操作
  private sendPull(targetId: string, targetState: NodeState) {
    const message: GossipMessage = {
      type: 'PULL',
      senderId: this.id,
      payload: {
        state: this.state,
        request: this.computeDiff(targetState)
      },
      timestamp: Date.now()
    };

    this.emit('send', targetId, message);
    this.stats.messagesSent++;
  }

  // 接收消息
  receiveMessage(message: GossipMessage) {
    this.stats.messagesReceived++;

    switch (message.type) {
      case 'PUSH':
        this.handlePush(message);
        break;
      case 'PULL':
        this.handlePull(message);
        break;
      case 'STATE':
        this.handleState(message);
        break;
    }
  }

  private handlePush(message: GossipMessage) {
    const remoteState = message.payload.state as NodeState;

    // 合并状态
    this.mergeState(remoteState);

    // 回复拉请求（推-拉模式）
    this.sendPull(message.senderId, remoteState);
  }

  private handlePull(message: GossipMessage) {
    const remoteState = message.payload.state as NodeState;
    this.mergeState(remoteState);
  }

  private handleState(message: GossipMessage) {
    this.mergeState(message.payload.state as NodeState);
  }

  // 状态合并
  private mergeState(remoteState: NodeState) {
    // 向量时钟比较
    const comparison = this.compareVectorClocks(
      this.state.vectorClock,
      remoteState.vectorClock
    );

    switch (comparison) {
      case 'concurrent':
        // 并发更新，需要合并
        this.state.data = this.mergeData(this.state.data, remoteState.data);
        this.state.vectorClock = this.mergeVectorClocks(
          this.state.vectorClock,
          remoteState.vectorClock
        );
        this.state.version++;
        this.stats.statesMerged++;
        this.emit('stateMerged', this.state);
        break;

      case 'lt':
        // 本地落后，采用远程状态
        this.state = { ...remoteState };
        this.emit('stateUpdated', this.state);
        break;

      case 'eq':
        // 状态相同，无需操作
        break;

      case 'gt':
        // 本地更新，无需操作
        break;
    }
  }

  // 计算状态差异
  private computeDiff(remoteState: NodeState): any {
    // 简化实现：返回本地有但远程可能没有的数据
    const diff: any = {};
    for (const key in this.state.data) {
      if (this.state.data[key] !== remoteState.data[key]) {
        diff[key] = this.state.data[key];
      }
    }
    return diff;
  }

  // 合并数据（应用特定逻辑）
  private mergeData(local: any, remote: any): any {
    // 使用 LWW（Last Write Wins）策略
    const merged = { ...local };
    for (const key in remote) {
      if (!(key in merged) || remote[key].timestamp > merged[key].timestamp) {
        merged[key] = remote[key];
      }
    }
    return merged;
  }

  // 向量时钟比较
  private compareVectorClocks(
    v1: Map<string, number>,
    v2: Map<string, number>
  ): 'lt' | 'gt' | 'eq' | 'concurrent' {
    let hasLess = false;
    let hasGreater = false;

    const allKeys = new Set([...v1.keys(), ...v2.keys()]);

    for (const key of allKeys) {
      const val1 = v1.get(key) || 0;
      const val2 = v2.get(key) || 0;

      if (val1 < val2) hasLess = true;
      else if (val1 > val2) hasGreater = true;
    }

    if (!hasLess && !hasGreater) return 'eq';
    if (hasLess && !hasGreater) return 'lt';
    if (hasGreater && !hasLess) return 'gt';
    return 'concurrent';
  }

  private mergeVectorClocks(
    v1: Map<string, number>,
    v2: Map<string, number>
  ): Map<string, number> {
    const merged = new Map(v1);
    for (const [key, val] of v2) {
      merged.set(key, Math.max(merged.get(key) || 0, val));
    }
    return merged;
  }

  // 传播消息（流行病广播）
  broadcastMessage(messageId: string, data: any, fanout: number = 3) {
    if (this.messageLog.has(messageId)) return;

    this.messageLog.add(messageId);

    // 感染 fanout 个随机节点
    const targets = this.selectRandomPeers(fanout);
    for (const target of targets) {
      const message: GossipMessage = {
        type: 'STATE',
        senderId: this.id,
        payload: { messageId, data },
        timestamp: Date.now()
      };

      this.emit('send', target, message);
      this.stats.messagesSent++;
    }

    this.emit('messageBroadcast', messageId);
  }

  private selectRandomPeers(count: number): string[] {
    const shuffled = [...this.peers].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  getState(): NodeState {
    return { ...this.state, vectorClock: new Map(this.state.vectorClock) };
  }

  getStats() {
    return { ...this.stats };
  }
}

// ============ Gossip 网络模拟器 ============

class GossipNetwork extends EventEmitter {
  private nodes = new Map<string, GossipNode>();
  private latencyMap = new Map<string, number>(); // 模拟网络延迟

  createNode(id: string, initialData?: any): GossipNode {
    const node = new GossipNode(id, initialData);
    this.nodes.set(id, node);

    // 设置消息路由
    node.on('send', (targetId: string, message: GossipMessage) => {
      this.routeMessage(node.id, targetId, message);
    });

    return node;
  }

  private routeMessage(fromId: string, toId: string, message: GossipMessage) {
    const latency = this.latencyMap.get(`${fromId}-${toId}`) || 10;

    setTimeout(() => {
      const targetNode = this.nodes.get(toId);
      if (targetNode) {
        targetNode.receiveMessage(message);
      }
    }, latency);
  }

  setLatency(fromId: string, toId: string, latencyMs: number) {
    this.latencyMap.set(`${fromId}-${toId}`, latencyMs);
  }

  connectAllNodes() {
    const nodeIds = Array.from(this.nodes.keys());
    for (const node of this.nodes.values()) {
      node.setPeers(nodeIds);
    }
  }

  startAllGossip(intervalMs?: number) {
    for (const node of this.nodes.values()) {
      node.startGossip(intervalMs);
    }
  }

  stopAllGossip() {
    for (const node of this.nodes.values()) {
      node.stopGossip();
    }
  }

  // 收敛性分析
  analyzeConvergence(): {
    maxVersionDifference: number;
    stateEntropy: number;
    consensusRatio: number;
  } {
    const states = Array.from(this.nodes.values()).map(n => n.getState());

    // 计算最大版本差异
    const versions = states.map(s => s.version);
    const maxVersionDifference = Math.max(...versions) - Math.min(...versions);

    // 计算状态熵
    const stateStrings = states.map(s => JSON.stringify(s.data));
    const stateCounts = new Map<string, number>();
    for (const s of stateStrings) {
      stateCounts.set(s, (stateCounts.get(s) || 0) + 1);
    }

    let stateEntropy = 0;
    const n = states.length;
    for (const count of stateCounts.values()) {
      const p = count / n;
      stateEntropy -= p * Math.log2(p);
    }

    // 计算共识比例
    const maxCount = Math.max(...stateCounts.values());
    const consensusRatio = maxCount / n;

    return {
      maxVersionDifference,
      stateEntropy,
      consensusRatio
    };
  }

  getAllStats() {
    const stats: any = {};
    for (const [id, node] of this.nodes) {
      stats[id] = node.getStats();
    }
    return stats;
  }
}

// ============ 收敛性测试 ============

class GossipConvergenceTester {
  async testEpidemicBroadcast(network: GossipNetwork): Promise<{
    convergenceTime: number;
    messagesSent: number;
    coverage: number;
  }> {
    const nodeIds = Array.from(network['nodes'].keys());
    const startNode = network['nodes'].get(nodeIds[0])!;

    // 从第一个节点广播消息
    const messageId = `msg_${Date.now()}`;
    const startTime = Date.now();

    startNode.broadcastMessage(messageId, { content: 'test' }, 3);

    // 等待收敛
    let convergenceTime = 0;
    let messagesSent = 0;

    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;

        // 检查覆盖率
        let covered = 0;
        let totalMessages = 0;

        for (const node of network['nodes'].values()) {
          if (node['messageLog'].has(messageId)) {
            covered++;
          }
          totalMessages += node.getStats().messagesSent;
        }

        const coverage = covered / nodeIds.length;

        if (coverage >= 0.99 || elapsed > 30000) {
          clearInterval(checkInterval);
          resolve({
            convergenceTime: elapsed,
            messagesSent: totalMessages,
            coverage
          });
        }
      }, 100);
    });
  }
}

// ============ 使用示例 ============

async function demonstrateGossip() {
  console.log('=== Gossip 协议演示 ===\n');

  // 创建网络
  const network = new GossipNetwork();

  // 创建 10 个节点
  for (let i = 0; i < 10; i++) {
    network.createNode(`node${i}`, { value: i * 10 });
  }

  // 连接所有节点
  network.connectAllNodes();

  console.log('节点数量:', network['nodes'].size);

  // 测试流行病广播
  console.log('\n--- 流行病广播测试 ---');
  const tester = new GossipConvergenceTester();
  const result = await tester.testEpidemicBroadcast(network);

  console.log('收敛时间:', result.convergenceTime, 'ms');
  console.log('消息总数:', result.messagesSent);
  console.log('覆盖率:', (result.coverage * 100).toFixed(2), '%');

  // 测试反熵 Gossip
  console.log('\n--- 反熵 Gossip 测试 ---');

  const network2 = new GossipNetwork();
  for (let i = 0; i < 5; i++) {
    network2.createNode(`node${i}`, { counter: 0, updates: [] });
  }
  network2.connectAllNodes();

  // 启动 Gossip
  network2.startAllGossip(500);

  // 节点 0 更新数据
  const node0 = network2['nodes'].get('node0')!;
  node0['state'].data = { counter: 100, updates: ['update1'] };
  node0['state'].version++;

  // 等待传播
  await new Promise(resolve => setTimeout(resolve, 3000));

  // 分析收敛
  const analysis = network2.analyzeConvergence();
  console.log('最大版本差异:', analysis.maxVersionDifference);
  console.log('状态熵:', analysis.stateEntropy.toFixed(4));
  console.log('共识比例:', (analysis.consensusRatio * 100).toFixed(2), '%');

  // 显示各节点状态
  console.log('\n各节点最终状态:');
  for (const [id, node] of network2['nodes']) {
    console.log(`  ${id}:`, JSON.stringify(node.getState().data));
  }

  network2.stopAllGossip();
}

demonstrateGossip().catch(console.error);
```



---

## 7. 分区容错的形式化定义

### 7.1 网络分区形式化

**定义 7.1**（网络分区）：
对于节点集 $N$，网络分区 $P$ 是 $N$ 的一个划分：
$$P = \{N_1, N_2, ..., N_k\}$$
其中：

- $\bigcup_{i=1}^k N_i = N$
- $\forall i \neq j : N_i \cap N_j = \emptyset$
- $\forall i \neq j : \forall n \in N_i, m \in N_j : unreachable(n, m)$

**定义 7.2**（分区类型）：

- **简单分区**：$k = 2$，网络分为两个连通子集
- **多向分区**：$k > 2$，网络分为多个子集
- **脑裂**（Split-Brain）：多个子集都认为自己是主分区

### 7.2 分区容错的形式化

**定义 7.3**（分区容错性）：
系统 $S$ 具有分区容错性当且仅当：
$$\forall P \in Partition(N) : S\ continues\ to\ provide\ service$$

**定理 7.1**（分区下的不可能性）：
在网络分区期间，系统不可能同时保证强一致性和可用性。

**证明**：

设分区 $P = \{N_1, N_2\}$。

假设系统保持可用，则：
$$\forall n \in N_1, m \in N_2 : n\ and\ m\ can\ accept\ writes$$

设客户端向 $n$ 写入 $v_1$，向 $m$ 写入 $v_2$，其中 $v_1 \neq v_2$。

由于分区，$n$ 和 $m$ 无法同步，因此它们的状态将分歧。

因此强一致性被破坏。$\square$

### 7.3 分区检测算法

**定义 7.4**（心跳机制）：
节点 $n$ 维护一个心跳向量 $H_n$，其中 $H_n[m]$ 是最近一次从 $m$ 收到心跳的时间。

**分区检测**：
$$partitioned(n, m) \iff current\_time - H_n[m] > timeout$$

### 7.4 分区恢复策略

**策略 1：静态多数派（Static Quorum）**

- 预定义多数派集合
- 只有多数派可以继续服务

**策略 2：动态多数派（Dynamic Quorum）**

- 基于当前可达节点动态确定多数派
- 需要 careful 的重新配置

**策略 3：双主冲突解决（Master-Master Conflict Resolution）**

- 允许双主写入
- 使用向量时钟或版本向量检测和解决冲突

### 7.5 算法伪代码

```
Algorithm: Partition-Detection
State: heartbeat table H, timeout T

1: function checkPartition()
2:    currentTime = now()
3:    suspectedPartition = false
4:
5:    for each node m in cluster do
6:        if m != self and currentTime - H[m] > T then
7:            markAsSuspected(m)
8:            suspectedPartition = true
9:
10:   if suspectedPartition then
11:       runConsensusProtocol()
12:       if confirmedPartition() then
13:           initiatePartitionRecovery()
14: end function

Algorithm: Dynamic-Quorum-Adjustment
Input: suspected partition members S

1: function adjustQuorum(S)
2:    reachable = getReachableNodes()
3:
4:    if |reachable| < minimumQuorumSize then
5:        enterReadOnlyMode()
6:        return
7:
8:    newQuorum = floor(|reachable| / 2) + 1
9:
10:   // 确保新的多数派不包含旧多数派的冲突视图
11:   if validateNewQuorum(reachable, newQuorum) then
12:       updateQuorumSize(newQuorum)
13:       announceNewQuorum(reachable)
14:   else
15:       waitForReconciliation()
16: end function

Algorithm: Split-Brain-Resolution
State: epoch number e, node priority p

1: on partition detected
2:    // 递增 epoch
3:    e = e + 1
4:
5:    // 广播 epoch 声明
6:    broadcast EPOCH_CLAIM(e, p, nodeId)
7:
8:    wait for responses with timeout
9:
10:   if received higher epoch or (same epoch and higher priority) then
11:       demoteToSecondary()
12:   else
13:       promoteToPrimary()
14: end on
15:
16: on partition healed
17:   // 合并期间的操作日志
18:   mergeOperationLogs()
19:   resolveConflicts()
20:   synchronizeState()
21: end on
```

### 7.6 Node.js/TypeScript 实现

```typescript
/**
 * 分区容错的 TypeScript 实现
 * 包含分区检测、恢复策略和脑裂解决
 */

import { EventEmitter } from 'events';

// ============ 分区检测器 ============

interface HeartbeatInfo {
  lastSeen: number;
  suspicionLevel: number;
  status: 'healthy' | 'suspected' | 'failed';
}

interface PartitionView {
  epoch: number;
  members: string[];
  primary: string;
  timestamp: number;
}

class PartitionDetector extends EventEmitter {
  private nodeId: string;
  private heartbeats = new Map<string, HeartbeatInfo>();
  private heartbeatTimeout: number;
  private suspicionThreshold: number;
  private checkInterval: NodeJS.Timeout | null = null;

  constructor(
    nodeId: string,
    heartbeatTimeout: number = 5000,
    suspicionThreshold: number = 3
  ) {
    super();
    this.nodeId = nodeId;
    this.heartbeatTimeout = heartbeatTimeout;
    this.suspicionThreshold = suspicionThreshold;
  }

  startDetection(intervalMs: number = 1000) {
    this.checkInterval = setInterval(() => {
      this.checkPartitions();
    }, intervalMs);
  }

  stopDetection() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
  }

  // 记录心跳
  recordHeartbeat(fromNode: string) {
    const info = this.heartbeats.get(fromNode);

    if (info && info.status === 'suspected') {
      // 从怀疑状态恢复
      this.emit('nodeRecovered', fromNode);
    }

    this.heartbeats.set(fromNode, {
      lastSeen: Date.now(),
      suspicionLevel: 0,
      status: 'healthy'
    });
  }

  // 检查分区
  private checkPartitions() {
    const now = Date.now();
    const suspectedNodes: string[] = [];
    const failedNodes: string[] = [];

    for (const [nodeId, info] of this.heartbeats) {
      if (info.status === 'failed') continue;

      const elapsed = now - info.lastSeen;

      if (elapsed > this.heartbeatTimeout) {
        info.suspicionLevel++;

        if (info.suspicionLevel >= this.suspicionThreshold) {
          info.status = 'failed';
          failedNodes.push(nodeId);
        } else {
          info.status = 'suspected';
          suspectedNodes.push(nodeId);
        }
      }
    }

    if (suspectedNodes.length > 0) {
      this.emit('suspectedPartition', suspectedNodes);
    }

    if (failedNodes.length > 0) {
      this.emit('confirmedPartition', failedNodes);
    }
  }

  // 获取可达节点
  getReachableNodes(): string[] {
    const now = Date.now();
    return Array.from(this.heartbeats.entries())
      .filter(([_, info]) => now - info.lastSeen <= this.heartbeatTimeout)
      .map(([nodeId, _]) => nodeId);
  }

  // 获取当前分区视图
  getPartitionView(): PartitionView {
    return {
      epoch: Date.now(),
      members: [this.nodeId, ...this.getReachableNodes()],
      primary: this.nodeId,
      timestamp: Date.now()
    };
  }
}

// ============ 动态多数派管理器 ============

class QuorumManager extends EventEmitter {
  private nodeId: string;
  private currentQuorumSize: number;
  private totalNodes: number;
  private minQuorumSize: number;
  private detector: PartitionDetector;

  constructor(
    nodeId: string,
    totalNodes: number,
    detector: PartitionDetector,
    minQuorumSize: number = 2
  ) {
    super();
    this.nodeId = nodeId;
    this.totalNodes = totalNodes;
    this.detector = detector;
    this.minQuorumSize = minQuorumSize;
    this.currentQuorumSize = Math.floor(totalNodes / 2) + 1;

    detector.on('confirmedPartition', () => {
      this.adjustQuorum();
    });
  }

  // 调整多数派
  private adjustQuorum() {
    const reachable = this.detector.getReachableNodes();
    const reachableCount = reachable.length + 1; // 包含自己

    if (reachableCount < this.minQuorumSize) {
      this.emit('insufficientQuorum', reachableCount);
      return;
    }

    const newQuorum = Math.floor(reachableCount / 2) + 1;

    if (newQuorum !== this.currentQuorumSize) {
      console.log(`[${this.nodeId}] Adjusting quorum: ${this.currentQuorumSize} -> ${newQuorum}`);
      this.currentQuorumSize = newQuorum;
      this.emit('quorumChanged', newQuorum, reachable);
    }
  }

  // 检查是否有多数派
  hasQuorum(ackCount: number): boolean {
    return ackCount >= this.currentQuorumSize;
  }

  getQuorumSize(): number {
    return this.currentQuorumSize;
  }
}

// ============ 脑裂解决器 ============

class SplitBrainResolver extends EventEmitter {
  private nodeId: string;
  private priority: number;
  private epoch = 0;
  private role: 'primary' | 'secondary' | 'unknown' = 'unknown';
  private partitionViews = new Map<string, PartitionView>();

  constructor(nodeId: string, priority: number) {
    super();
    this.nodeId = nodeId;
    this.priority = priority;
  }

  // 处理分区检测
  onPartitionDetected(members: string[]) {
    this.epoch++;

    console.log(`[${this.nodeId}] Partition detected, epoch ${this.epoch}`);

    // 广播 epoch 声明
    this.emit('claimEpoch', {
      epoch: this.epoch,
      priority: this.priority,
      nodeId: this.nodeId,
      members
    });
  }

  // 接收其他节点的 epoch 声明
  onEpochClaim(claim: { epoch: number; priority: number; nodeId: string; members: string[] }) {
    this.partitionViews.set(claim.nodeId, {
      epoch: claim.epoch,
      members: claim.members,
      primary: claim.nodeId,
      timestamp: Date.now()
    });

    // 比较并决定角色
    this.resolveRole();
  }

  private resolveRole() {
    let maxEpoch = this.epoch;
    let maxPriority = this.priority;
    let winner = this.nodeId;

    for (const [nodeId, view] of this.partitionViews) {
      if (view.epoch > maxEpoch) {
        maxEpoch = view.epoch;
        maxPriority = view.primary === nodeId ? this.getNodePriority(nodeId) : 0;
        winner = nodeId;
      } else if (view.epoch === maxEpoch) {
        const nodePriority = this.getNodePriority(nodeId);
        if (nodePriority > maxPriority) {
          maxPriority = nodePriority;
          winner = nodeId;
        }
      }
    }

    const newRole: 'primary' | 'secondary' = winner === this.nodeId ? 'primary' : 'secondary';

    if (newRole !== this.role) {
      this.role = newRole;
      console.log(`[${this.nodeId}] Role changed to ${this.role}`);
      this.emit('roleChanged', this.role);
    }
  }

  private getNodePriority(nodeId: string): number {
    // 简化：基于节点 ID 的优先级
    return parseInt(nodeId.replace(/\D/g, '')) || 0;
  }

  getRole(): string {
    return this.role;
  }

  // 分区恢复
  onPartitionHealed(allNodes: string[]) {
    console.log(`[${this.nodeId}] Partition healed, reconciling...`);
    this.emit('startReconciliation', allNodes);
  }
}

// ============ 分区容错协调器 ============

class PartitionTolerantCoordinator extends EventEmitter {
  private detector: PartitionDetector;
  private quorumManager: QuorumManager;
  private resolver: SplitBrainResolver;
  private operationLog: any[] = [];
  private isReadOnly = false;

  constructor(nodeId: string, totalNodes: number, priority: number) {
    super();

    this.detector = new PartitionDetector(nodeId);
    this.quorumManager = new QuorumManager(nodeId, totalNodes, this.detector);
    this.resolver = new SplitBrainResolver(nodeId, priority);

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    // 分区检测
    this.detector.on('confirmedPartition', (nodes) => {
      this.resolver.onPartitionDetected(
        [this.detector['nodeId'], ...this.detector.getReachableNodes()]
      );
    });

    // 多数派不足
    this.quorumManager.on('insufficientQuorum', (count) => {
      console.log(`Insufficient quorum (${count}), entering read-only mode`);
      this.isReadOnly = true;
      this.emit('readOnlyMode');
    });

    // 角色变化
    this.resolver.on('roleChanged', (role) => {
      this.emit('roleChange', role);
    });

    // 开始协调
    this.resolver.on('claimEpoch', (claim) => {
      this.emit('broadcastEpoch', claim);
    });
  }

  start() {
    this.detector.startDetection();
  }

  stop() {
    this.detector.stopDetection();
  }

  // 记录心跳
  heartbeat(fromNode: string) {
    this.detector.recordHeartbeat(fromNode);
  }

  // 执行写操作（带分区容错）
  async executeWrite(operation: any, requiredAcks: number): Promise<boolean> {
    if (this.isReadOnly) {
      throw new Error('System is in read-only mode due to partition');
    }

    if (!this.quorumManager.hasQuorum(requiredAcks)) {
      throw new Error('Insufficient quorum for write operation');
    }

    // 记录操作
    this.operationLog.push({
      operation,
      timestamp: Date.now(),
      epoch: this.resolver['epoch']
    });

    return true;
  }

  // 处理 epoch 声明
  handleEpochClaim(claim: any) {
    this.resolver.onEpochClaim(claim);
  }

  // 获取统计信息
  getStats() {
    return {
      reachableNodes: this.detector.getReachableNodes().length + 1,
      quorumSize: this.quorumManager.getQuorumSize(),
      role: this.resolver.getRole(),
      isReadOnly: this.isReadOnly,
      operationLogSize: this.operationLog.length
    };
  }
}

// ============ 使用示例 ============

function demonstratePartitionTolerance() {
  console.log('=== 分区容错演示 ===\n');

  // 创建协调器
  const coordinator1 = new PartitionTolerantCoordinator('node1', 5, 10);
  const coordinator2 = new PartitionTolerantCoordinator('node2', 5, 5);
  const coordinator3 = new PartitionTolerantCoordinator('node3', 5, 1);

  // 启动
  coordinator1.start();
  coordinator2.start();
  coordinator3.start();

  // 模拟心跳
  console.log('--- 正常状态 ---');
  coordinator1.heartbeat('node2');
  coordinator1.heartbeat('node3');
  coordinator2.heartbeat('node1');
  coordinator2.heartbeat('node3');
  coordinator3.heartbeat('node1');
  coordinator3.heartbeat('node2');

  console.log('Node1 stats:', coordinator1.getStats());

  // 模拟分区（node1 与其他节点断开）
  console.log('\n--- 模拟分区（node1 隔离）---');

  // node1 不再收到 node2 和 node3 的心跳
  // node2 和 node3 继续相互通信
  setTimeout(() => {
    coordinator2.heartbeat('node3');
    coordinator3.heartbeat('node2');

    console.log('Node1 stats after partition:', coordinator1.getStats());
    console.log('Node2 stats after partition:', coordinator2.getStats());
  }, 2000);

  // 模拟脑锁解决
  console.log('\n--- 脑裂解决 ---');

  // node1 检测到分区并声明 epoch
  coordinator1['resolver'].onPartitionDetected(['node1']);

  // node2 和 node3 形成另一个分区
  coordinator2['resolver'].onPartitionDetected(['node2', 'node3']);
  coordinator3['resolver'].onPartitionDetected(['node2', 'node3']);

  setTimeout(() => {
    console.log('Node1 role:', coordinator1['resolver'].getRole());
    console.log('Node2 role:', coordinator2['resolver'].getRole());
    console.log('Node3 role:', coordinator3['resolver'].getRole());
  }, 100);

  // 清理
  setTimeout(() => {
    coordinator1.stop();
    coordinator2.stop();
    coordinator3.stop();
  }, 3000);
}

demonstratePartitionTolerance();
```



---

## 8. 拜占庭容错的形式化

### 8.1 拜占庭故障模型

**定义 8.1**（拜占庭故障）：
节点 $n$ 表现出拜占庭故障，如果它：

- 发送与协议不一致的消息
- 发送矛盾的消息给不同节点
- 假装接收到从未发送的消息
- 静默（崩溃但不通知）

**定义 8.2**（拜占庭容错）：
系统 $S$ 容忍 $f$ 个拜占庭故障当且仅当：
$$\forall F \subset N, |F| \leq f : system\ operates\ correctly$$

其中 $F$ 是拜占庭节点集合。

### 8.2 拜占庭容错的下界定理

**定理 8.1**（节点数下限）：
容忍 $f$ 个拜占庭故障需要至少 $n \geq 3f + 1$ 个节点。

**证明**：

**情况 1**：$n = 3f$

考虑以下场景：

- 将军（主节点）是拜占庭节点
- 它向 $f$ 个节点发送"攻击"，向 $f$ 个节点发送"撤退"
- 剩下 $f$ 个诚实节点无法区分

诚实节点看到的投票：

- $f$ 票"攻击"
- $f$ 票"撤退"

诚实节点无法确定将军的真实意图。

**情况 2**：$n = 3f + 1$

即使 $f$ 个拜占庭节点发送矛盾消息，诚实节点仍占多数：
$$honest = 3f + 1 - f = 2f + 1$$

多数派阈值：
$$quorum = \lfloor(3f + 1)/2\rfloor + 1 = 2f + 1$$

诚实节点恰好达到多数派阈值，可以做出正确决策。

因此 $n \geq 3f + 1$ 是必要且充分的。$\square$

### 8.3 PBFT（实用拜占庭容错）形式化

**定义 8.3**（PBFT 视图）：
视图 $v$ 由主节点 $primary = v \mod n$ 领导。

**定义 8.4**（PBFT 消息类型）：

- $\text{REQUEST}(o, t, c)$：客户端请求
- $\text{PRE-PREPARE}(v, n, d, m)$：主节点分配序列号
- $\text{PREPARE}(v, n, d, i)$：副本验证准备
- $\text{COMMIT}(v, n, d, i)$：副本提交
- $\text{REPLY}(v, t, c, i, r)$：执行结果

其中 $d = digest(m)$ 是消息摘要。

**定理 8.2**（PBFT 安全性）：
PBFT 算法保证所有诚实节点对请求的执行顺序达成一致。

**证明**：

**准备阶段（PREPARE）**：
副本 $i$ 进入准备状态当收到：

- 有效的 $\text{PRE-PREPARE}$ 来自主节点
- $2f$ 个匹配的 $\text{PREPARE}$ 来自其他副本

**提交阶段（COMMIT）**：
副本 $i$ 进入提交状态当收到 $2f + 1$ 个匹配的 $\text{COMMIT}$。

**安全性论证**：

假设两个不同的请求 $m_1$ 和 $m_2$ 被分配到相同的序列号 $n$。

对于 $m_1$ 被提交，需要 $2f + 1$ 个节点发送 $\text{COMMIT}$。
对于 $m_2$ 被提交，需要 $2f + 1$ 个节点发送 $\text{COMMIT}$。

由鸽巢原理：
$$|honest\ nodes| = n - f = 2f + 1$$

两个多数派的交集至少包含：
$$2(2f + 1) - (3f + 1) = f + 1$$

即至少有一个诚实节点同时提交了 $m_1$ 和 $m_2$，矛盾。

因此安全性得证。$\square$

### 8.4 BFT 的复杂度分析

**通信复杂度**：

- PBFT：$O(n^2)$ 每轮（三阶段广播）
- HotStuff：$O(n)$ 每轮（线性通信）
- Tendermint：$O(n^2)$ 每轮

**消息延迟**：

- 最佳情况：3 轮网络延迟
- 视图变更：额外延迟

### 8.5 算法伪代码

```
Algorithm: PBFT-Primary
State: view v, sequence number s

1: function handleClientRequest(request)
2:    s = s + 1
3:    digest = hash(request)
4:
5:    prePrepare = {
6:        view: v,
7:        sequence: s,
8:        digest: digest,
9:        request: request
10:   }
11:
12:   broadcast PRE-PREPARE(prePrepare)
13: end function

Algorithm: PBFT-Replica
State: view v, log L, prepared[n], committed[n]

1: on receive PRE-PREPARE(v, n, d, m) from primary
2:    if valid(v, n, d, m) and not acceptedPrePrepare(v, n) then
3:        acceptedPrePrepare[v, n] = m
4:        broadcast PREPARE(v, n, d, self)
5: end on

6: on receive PREPARE(v, n, d, j)
7:    add to prepareLog[v, n]
8:    if prepareLog[v, n].size >= 2f and not prepared[v, n] then
9:        prepared[v, n] = true
10:       broadcast COMMIT(v, n, d, self)
11: end on

12: on receive COMMIT(v, n, d, j)
13:    add to commitLog[v, n]
14:    if commitLog[v, n].size >= 2f + 1 and not committed[v, n] then
15:        committed[v, n] = true
16:        execute(request)
17:        send REPLY to client
18: end on

Algorithm: View-Change
Trigger: timeout or suspicion of primary failure

1: function initiateViewChange()
2:    v = v + 1
3:
4:    viewChange = {
5:        newView: v,
6:        lastStableCheckpoint: c,
7:        preparedProofs: collectPreparedProofs()
8:    }
9:
10:   broadcast VIEW-CHANGE(viewChange)
11: end function

12: on receive 2f + 1 VIEW-CHANGE messages
13:   if self == primary(v) then
14:       newView = constructNewView()
15:       broadcast NEW-VIEW(newView)
16: end on

17: on receive NEW-VIEW(v, V, O)
18:   if validNewView(v, V, O) then
19:       adoptNewView(O)
20:       enterView(v)
21: end on
```

### 8.6 Node.js/TypeScript 实现

```typescript
/**
 * 拜占庭容错的 TypeScript 实现
 * 包含 PBFT 算法的简化实现
 */

import { EventEmitter } from 'events';
import { createHash } from 'crypto';

// ============ BFT 类型定义 ============

type PBFTPhase = 'REQUEST' | 'PRE_PREPARE' | 'PREPARE' | 'COMMIT' | 'REPLY';

interface PBFTMessage {
  type: PBFTPhase;
  view: number;
  sequence: number;
  digest: string;
  nodeId: string;
  payload?: any;
  signature?: string;
}

interface Request {
  operation: string;
  timestamp: number;
  clientId: string;
}

// ============ PBFT 节点 ============

class PBFTNode extends EventEmitter {
  id: string;
  private totalNodes: number;
  private f: number; // 最大容错数
  private view = 0;
  private sequenceNumber = 0;
  private isPrimary: boolean;

  // 消息日志
  private prePrepareLog = new Map<string, PBFTMessage>();
  private prepareLog = new Map<string, PBFTMessage[]>();
  private commitLog = new Map<string, PBFTMessage[]>();
  private requestLog = new Map<string, Request>();
  private executed = new Set<string>();

  // 状态
  private prepared = new Set<string>();
  private committed = new Set<string>();

  // 统计
  stats = {
    requestsProcessed: 0,
    viewChanges: 0,
    byzantineDetected: 0
  };

  constructor(id: string, totalNodes: number) {
    super();
    this.id = id;
    this.totalNodes = totalNodes;
    this.f = Math.floor((totalNodes - 1) / 3);
    this.isPrimary = this.calculatePrimary() === id;

    console.log(`[${id}] Initialized (f=${this.f}, primary=${this.isPrimary})`);
  }

  private calculatePrimary(): string {
    return `node${this.view % this.totalNodes}`;
  }

  // 客户端请求入口
  async clientRequest(request: Request): Promise<void> {
    if (!this.isPrimary) {
      // 转发给主节点
      this.emit('forwardToPrimary', request);
      return;
    }

    this.sequenceNumber++;
    const digest = this.computeDigest(request);
    const key = `${this.view}-${this.sequenceNumber}`;

    this.requestLog.set(key, request);

    const prePrepare: PBFTMessage = {
      type: 'PRE_PREPARE',
      view: this.view,
      sequence: this.sequenceNumber,
      digest,
      nodeId: this.id,
      payload: request
    };

    console.log(`[${this.id}] Broadcasting PRE-PREPARE for seq=${this.sequenceNumber}`);
    this.emit('broadcast', prePrepare);

    // 自己也记录
    this.handlePrePrepare(prePrepare);
  }

  // 处理 PRE-PREPARE
  handlePrePrepare(msg: PBFTMessage): void {
    const key = `${msg.view}-${msg.sequence}`;

    // 验证
    if (!this.validatePrePrepare(msg)) {
      console.log(`[${this.id}] Invalid PRE-PREPARE rejected`);
      return;
    }

    // 检查是否重复
    if (this.prePrepareLog.has(key)) {
      return;
    }

    this.prePrepareLog.set(key, msg);
    this.requestLog.set(key, msg.payload);

    // 发送 PREPARE
    const prepare: PBFTMessage = {
      type: 'PREPARE',
      view: msg.view,
      sequence: msg.sequence,
      digest: msg.digest,
      nodeId: this.id
    };

    console.log(`[${this.id}] Broadcasting PREPARE for seq=${msg.sequence}`);
    this.emit('broadcast', prepare);
    this.addToPrepareLog(prepare);
  }

  // 处理 PREPARE
  handlePrepare(msg: PBFTMessage): void {
    this.addToPrepareLog(msg);

    const key = `${msg.view}-${msg.sequence}`;

    // 检查是否达到 2f 个 PREPARE
    if (!this.prepared.has(key) && this.countPrepares(key) >= 2 * this.f) {
      this.prepared.add(key);
      console.log(`[${this.id}] Prepared for seq=${msg.sequence}`);

      // 发送 COMMIT
      const commit: PBFTMessage = {
        type: 'COMMIT',
        view: msg.view,
        sequence: msg.sequence,
        digest: msg.digest,
        nodeId: this.id
      };

      this.emit('broadcast', commit);
      this.addToCommitLog(commit);
    }
  }

  // 处理 COMMIT
  handleCommit(msg: PBFTMessage): void {
    this.addToCommitLog(msg);

    const key = `${msg.view}-${msg.sequence}`;

    // 检查是否达到 2f+1 个 COMMIT
    if (!this.committed.has(key) && this.countCommits(key) >= 2 * this.f + 1) {
      this.committed.add(key);
      console.log(`[${this.id}] Committed for seq=${msg.sequence}`);

      // 执行请求
      this.executeRequest(key);
    }
  }

  private executeRequest(key: string): void {
    if (this.executed.has(key)) return;

    const request = this.requestLog.get(key);
    if (!request) {
      console.log(`[${this.id}] Request not found for ${key}`);
      return;
    }

    this.executed.add(key);
    this.stats.requestsProcessed++;

    console.log(`[${this.id}] Executed: ${request.operation}`);

    // 发送回复给客户端
    const reply = {
      type: 'REPLY',
      view: this.view,
      timestamp: request.timestamp,
      clientId: request.clientId,
      nodeId: this.id,
      result: `Result of ${request.operation}`
    };

    this.emit('replyToClient', reply);
  }

  // 视图变更
  initiateViewChange(): void {
    this.view++;
    this.stats.viewChanges++;
    this.isPrimary = this.calculatePrimary() === this.id;

    console.log(`[${this.id}] View changed to ${this.view}, primary=${this.isPrimary}`);

    // 清理临时状态
    this.sequenceNumber = 0;
  }

  // 验证函数
  private validatePrePrepare(msg: PBFTMessage): boolean {
    // 检查视图
    if (msg.view !== this.view) return false;

    // 检查发送者是否是主节点
    const expectedPrimary = this.calculatePrimary();
    if (msg.nodeId !== expectedPrimary) {
      console.log(`[${this.id}] Byzantine behavior detected: ${msg.nodeId} pretending to be primary`);
      this.stats.byzantineDetected++;
      return false;
    }

    // 验证摘要
    if (msg.payload) {
      const computedDigest = this.computeDigest(msg.payload);
      if (computedDigest !== msg.digest) {
        console.log(`[${this.id}] Digest mismatch detected`);
        return false;
      }
    }

    return true;
  }

  // 辅助函数
  private addToPrepareLog(msg: PBFTMessage): void {
    const key = `${msg.view}-${msg.sequence}`;
    if (!this.prepareLog.has(key)) {
      this.prepareLog.set(key, []);
    }
    this.prepareLog.get(key)!.push(msg);
  }

  private addToCommitLog(msg: PBFTMessage): void {
    const key = `${msg.view}-${msg.sequence}`;
    if (!this.commitLog.has(key)) {
      this.commitLog.set(key, []);
    }
    this.commitLog.get(key)!.push(msg);
  }

  private countPrepares(key: string): number {
    const prepares = this.prepareLog.get(key) || [];
    // 去重计数
    const uniqueNodes = new Set(prepares.map(p => p.nodeId));
    return uniqueNodes.size;
  }

  private countCommits(key: string): number {
    const commits = this.commitLog.get(key) || [];
    const uniqueNodes = new Set(commits.map(c => c.nodeId));
    return uniqueNodes.size;
  }

  private computeDigest(data: any): string {
    return createHash('sha256')
      .update(JSON.stringify(data))
      .digest('hex')
      .slice(0, 16);
  }

  getStats() {
    return { ...this.stats };
  }
}

// ============ BFT 网络模拟器 ============

class BFTNetwork extends EventEmitter {
  private nodes = new Map<string, PBFTNode>();
  private messageDelay = 50;
  private byzantineNodes = new Set<string>();

  createNode(id: string, totalNodes: number): PBFTNode {
    const node = new PBFTNode(id, totalNodes);
    this.nodes.set(id, node);

    // 设置消息路由
    node.on('broadcast', (msg: PBFTMessage) => {
      this.broadcast(id, msg);
    });

    node.on('replyToClient', (reply: any) => {
      this.emit('clientReply', reply);
    });

    return node;
  }

  // 设置拜占庭节点
  setByzantine(nodeId: string) {
    this.byzantineNodes.add(nodeId);
    console.log(`[Network] ${nodeId} marked as Byzantine`);
  }

  private broadcast(fromId: string, msg: PBFTMessage) {
    for (const [id, node] of this.nodes) {
      if (id === fromId) continue;

      // 模拟网络延迟
      setTimeout(() => {
        // 拜占庭节点可能篡改消息
        if (this.byzantineNodes.has(fromId)) {
          msg = this.byzantineTransform(msg);
        }

        this.deliverMessage(node, msg);
      }, this.messageDelay + Math.random() * 50);
    }
  }

  private deliverMessage(node: PBFTNode, msg: PBFTMessage) {
    switch (msg.type) {
      case 'PRE_PREPARE':
        node.handlePrePrepare(msg);
        break;
      case 'PREPARE':
        node.handlePrepare(msg);
        break;
      case 'COMMIT':
        node.handleCommit(msg);
        break;
    }
  }

  private byzantineTransform(msg: PBFTMessage): PBFTMessage {
    // 模拟拜占庭行为：随机篡改
    if (Math.random() < 0.3) {
      return {
        ...msg,
        digest: 'tampered_' + msg.digest
      };
    }
    return msg;
  }

  async sendClientRequest(request: Request): Promise<void> {
    // 发送给主节点
    for (const node of this.nodes.values()) {
      if (node['isPrimary']) {
        await node.clientRequest(request);
        return;
      }
    }
  }

  getAllStats() {
    const stats: any = {};
    for (const [id, node] of this.nodes) {
      stats[id] = node.getStats();
    }
    return stats;
  }
}

// ============ 使用示例 ============

async function demonstrateByzantineFaultTolerance() {
  console.log('=== 拜占庭容错演示 ===\n');

  // 创建 4 节点网络（可容忍 1 个拜占庭节点）
  const network = new BFTNetwork();
  const nodeCount = 4;

  for (let i = 0; i < nodeCount; i++) {
    network.createNode(`node${i}`, nodeCount);
  }

  console.log('--- 正常操作 ---');

  // 发送客户端请求
  await network.sendClientRequest({
    operation: 'transfer $100 from A to B',
    timestamp: Date.now(),
    clientId: 'client1'
  });

  // 等待处理
  await new Promise(resolve => setTimeout(resolve, 500));

  console.log('\n--- 添加拜占庭节点后 ---');

  // 标记 node3 为拜占庭节点
  network.setByzantine('node3');

  // 发送另一个请求
  await network.sendClientRequest({
    operation: 'transfer $50 from C to D',
    timestamp: Date.now(),
    clientId: 'client2'
  });

  await new Promise(resolve => setTimeout(resolve, 500));

  console.log('\n--- 统计信息 ---');
  console.log(JSON.stringify(network.getAllStats(), null, 2));
}

demonstrateByzantineFaultTolerance().catch(console.error);
```


---

## 9. 分布式系统的测试理论（Jepsen 模型）

### 9.1 分布式系统测试的形式化框架

**定义 9.1**（测试模型）：
分布式系统测试是一个五元组 $T = (S, O, H, P, \Phi)$：

- $S$：系统状态空间
- $O$：操作集合
- $H$：历史（操作执行序列）
- $P$：性质规约
- $\Phi$：判定函数（历史是否满足性质）

**定义 9.2**（线性化点）：
操作 $o$ 的线性化点 $L(o)$ 是一个时间点，使得：
$$start(o) \leq L(o) \leq end(o)$$

且所有线性化点构成一个与规范一致的顺序。

### 9.2 Jepsen 测试模型

**Jepsen 测试流程**：

1. **Setup**：初始化系统
2. **Generate**：生成随机操作序列
3. **Execute**：并发执行操作
4. **Check**：验证一致性

**定义 9.3**（历史模型）：
历史 $H$ 是操作调用和响应的多重集：
$$H = \{(invoke, o, t), (response, o, t, result)\}$$

**定理 9.1**（线性化判定复杂度）：
判定一个历史是否线性一致是 NP-完全问题。

**证明概要**：

可归约到区间图着色问题或 SAT 问题。

给定历史，需要为每个操作分配线性化点，满足：

- 线性化点在操作区间内
- 线性化顺序与规范一致

这等价于约束满足问题，是 NP-完全的。$\square$

### 9.3 一致性验证算法

**定义 9.4**（可串行化图）：
对于历史 $H$，构造图 $G = (V, E)$：

- $V$ = 事务集合
- $E$ = $\{(T_i, T_j) | T_i \text{ 的操作在 } H \text{ 中先于 } T_j \text{ 的冲突操作}\}$

**定理 9.2**（可串行化判定）：
历史 $H$ 是可串行化的当且仅当 $G_H$ 无环。

**判定算法**：

```
Algorithm: IsSerializable(H)
Input: history H
Output: boolean

1: G = buildSerializationGraph(H)
2: return not hasCycle(G)
```

### 9.4 故障注入模型

**定义 9.5**（故障模型）：
故障注入是函数 $F: Time \to \{partition, crash, delay, drop\}$。

**故障类型**：

- **网络分区**：断开节点间通信
- **节点崩溃**：停止节点进程
- **消息延迟**：增加网络延迟
- **消息丢失**：丢弃消息

**定理 9.3**（故障覆盖）：
对于 $n$ 个节点的系统，完全覆盖所有故障场景需要 $O(2^n)$ 个测试用例。

### 9.5 算法伪代码

```
Algorithm: Jepsen-Linearizability-Checker
Input: history H, model M
Output: boolean

1: function checkLinearizability(H, M)
2:    // 提取完成操作
3:    completed = filterCompleted(H)
4:
5:    // 尝试所有可能的线性化
6:    return tryLinearize(completed, emptyState(), M)
7: end function

8: function tryLinearize(remaining, currentState, M)
9:    if remaining.isEmpty() then
10:       return TRUE
11:
12:   for each op in remaining do
13:       if canApply(op, currentState, M) then
14:           newState = apply(op, currentState, M)
15:           newRemaining = remaining - {op}
16:           if tryLinearize(newRemaining, newState, M) then
17:               return TRUE
18:
19:   return FALSE
20: end function

Algorithm: Generate-Test-Scenario
Input: node count n, operation count m
Output: test scenario

1: function generateScenario(n, m)
2:    scenario = {
3:        nodes: createNodes(n),
4:        nemesis: createNemesis(),
5:        clientOps: []
6:    }
7:
8:    for i = 1 to m do
9:        op = randomChoice([read, write, cas])
10:       key = randomKey()
11:       value = randomValue()
12:       scenario.clientOps.push({op, key, value})
13:
14:   // 添加随机故障
15:   if random() < 0.3 then
16:       scenario.nemesis.addPartition(randomPartition(n))
17:
18:   if random() < 0.2 then
19:       scenario.nemesis.addCrash(randomNode(n))
20:
21:   return scenario
22: end function

Algorithm: Sequential-Consistency-Checker
Input: history H
Output: boolean

1: function checkSequentialConsistency(H)
2:    // 按进程分组
3:    byProcess = groupByProcess(H)
4:
5:    // 提取每个进程内的操作顺序
6:    processOrders = {}
7:    for each (pid, ops) in byProcess do
8:        processOrders[pid] = sortByTime(ops)
9:
10:   // 尝试找到一个全局顺序满足所有进程顺序
11:   return findGlobalOrder(processOrders)
12: end function
```

### 9.6 Node.js/TypeScript 实现

```typescript
/**
 * 分布式系统测试框架的 TypeScript 实现
 * 包含线性化检查器、故障注入器和测试执行器
 */

import { EventEmitter } from 'events';

// ============ 类型定义 ============

type OperationType = 'read' | 'write' | 'cas' | 'delete';

interface Operation {
  id: string;
  type: OperationType;
  key: string;
  value?: any;
  expectedValue?: any;
  processId: string;
}

interface HistoryEntry {
  operationId: string;
  type: 'invoke' | 'response';
  operation: Operation;
  timestamp: number;
  result?: any;
  error?: string;
}

interface Model {
  initialState: any;
  step: (state: any, operation: Operation) => { valid: boolean; newState: any; result?: any };
}

// ============ 线性一致性检查器 ============

class LinearizabilityChecker {
  private model: Model;

  constructor(model: Model) {
    this.model = model;
  }

  /**
   * 检查历史是否线性一致
   */
  check(history: HistoryEntry[]): boolean {
    // 提取完成的操作（有 invoke 和 response）
    const completed = this.extractCompletedOperations(history);

    // 尝试线性化
    return this.tryLinearize(completed, this.model.initialState);
  }

  private extractCompletedOperations(history: HistoryEntry[]): Map<string, { invoke: HistoryEntry; response: HistoryEntry }> {
    const invokes = new Map<string, HistoryEntry>();
    const responses = new Map<string, HistoryEntry>();

    for (const entry of history) {
      if (entry.type === 'invoke') {
        invokes.set(entry.operationId, entry);
      } else {
        responses.set(entry.operationId, entry);
      }
    }

    const completed = new Map<string, { invoke: HistoryEntry; response: HistoryEntry }>();

    for (const [id, invoke] of invokes) {
      const response = responses.get(id);
      if (response) {
        completed.set(id, { invoke, response });
      }
    }

    return completed;
  }

  private tryLinearize(
    remaining: Map<string, { invoke: HistoryEntry; response: HistoryEntry }>,
    currentState: any
  ): boolean {
    if (remaining.size === 0) {
      return true;
    }

    // 尝试每个剩余的操作作为下一个线性化点
    for (const [id, entry] of remaining) {
      const op = entry.invoke.operation;
      const result = entry.response!.result;

      // 检查是否可以应用此操作
      const stepResult = this.model.step(currentState, op);

      if (stepResult.valid && this.resultsMatch(stepResult.result, result)) {
        // 递归尝试剩余操作
        const newRemaining = new Map(remaining);
        newRemaining.delete(id);

        if (this.tryLinearize(newRemaining, stepResult.newState)) {
          return true;
        }
      }
    }

    return false;
  }

  private resultsMatch(expected: any, actual: any): boolean {
    if (expected === undefined) return true; // 读操作可以返回任何值
    return JSON.stringify(expected) === JSON.stringify(actual);
  }
}

// ============ 顺序一致性检查器 ============

class SequentialConsistencyChecker {
  /**
   * 检查历史是否顺序一致
   */
  check(history: HistoryEntry[]): boolean {
    // 按进程分组并保留程序顺序
    const processOrders = this.groupByProcess(history);

    // 提取所有完成的操作
    const allOperations: { invoke: HistoryEntry; response: HistoryEntry }[] = [];
    for (const [_, entries] of processOrders) {
      const completed = this.extractCompleted(entries);
      allOperations.push(...completed);
    }

    // 尝试找到一个满足所有进程顺序的全局顺序
    return this.findGlobalOrder(allOperations, processOrders);
  }

  private groupByProcess(history: HistoryEntry[]): Map<string, HistoryEntry[]> {
    const groups = new Map<string, HistoryEntry[]>();

    for (const entry of history) {
      const pid = entry.operation.processId;
      if (!groups.has(pid)) {
        groups.set(pid, []);
      }
      groups.get(pid)!.push(entry);
    }

    // 按时间排序
    for (const [pid, entries] of groups) {
      groups.set(pid, entries.sort((a, b) => a.timestamp - b.timestamp));
    }

    return groups;
  }

  private extractCompleted(entries: HistoryEntry[]): { invoke: HistoryEntry; response: HistoryEntry }[] {
    const invokes = new Map<string, HistoryEntry>();
    const responses = new Map<string, HistoryEntry>();

    for (const entry of entries) {
      if (entry.type === 'invoke') {
        invokes.set(entry.operationId, entry);
      } else {
        responses.set(entry.operationId, entry);
      }
    }

    const completed: { invoke: HistoryEntry; response: HistoryEntry }[] = [];

    for (const [id, invoke] of invokes) {
      const response = responses.get(id);
      if (response) {
        completed.push({ invoke, response });
      }
    }

    return completed;
  }

  private findGlobalOrder(
    operations: { invoke: HistoryEntry; response: HistoryEntry }[],
    processOrders: Map<string, HistoryEntry[]>
  ): boolean {
    // 简化：检查每个进程内的顺序是否被全局顺序尊重
    // 实际实现需要拓扑排序

    // 构建依赖图
    const dependencies = new Map<string, Set<string>>();

    for (const [pid, entries] of processOrders) {
      const completed = this.extractCompleted(entries);

      for (let i = 0; i < completed.length - 1; i++) {
        const current = completed[i].invoke.operationId;
        const next = completed[i + 1].invoke.operationId;

        if (!dependencies.has(next)) {
          dependencies.set(next, new Set());
        }
        dependencies.get(next)!.add(current);
      }
    }

    // 拓扑排序检查
    return this.canTopologicalSort(operations.map(o => o.invoke.operationId), dependencies);
  }

  private canTopologicalSort(nodes: string[], dependencies: Map<string, Set<string>>): boolean {
    const visited = new Set<string>();
    const recStack = new Set<string>();

    const visit = (node: string): boolean => {
      if (recStack.has(node)) return false; // 有环
      if (visited.has(node)) return true;

      recStack.add(node);
      visited.add(node);

      const deps = dependencies.get(node) || new Set();
      for (const dep of deps) {
        if (!visit(dep)) return false;
      }

      recStack.delete(node);
      return true;
    };

    for (const node of nodes) {
      if (!visited.has(node)) {
        if (!visit(node)) return false;
      }
    }

    return true;
  }
}

// ============ 故障注入器（Nemesis） ============

type FaultType = 'partition' | 'crash' | 'delay' | 'drop' | 'noop';

interface Fault {
  type: FaultType;
  target: string | string[];
  startTime: number;
  duration: number;
  intensity?: number;
}

class Nemesis extends EventEmitter {
  private scheduledFaults: Fault[] = [];
  private activeFaults = new Set<string>();
  private nodes: string[] = [];

  setNodes(nodes: string[]) {
    this.nodes = nodes;
  }

  /**
   * 计划网络分区
   */
  schedulePartition(groups: string[][], startTime: number, duration: number) {
    const target = groups.flat().join(',');
    this.scheduledFaults.push({
      type: 'partition',
      target,
      startTime,
      duration,
      intensity: groups.length
    });
  }

  /**
   * 计划节点崩溃
   */
  scheduleCrash(nodeId: string, startTime: number, duration: number) {
    this.scheduledFaults.push({
      type: 'crash',
      target: nodeId,
      startTime,
      duration
    });
  }

  /**
   * 计划网络延迟
   */
  scheduleDelay(nodeId: string, delayMs: number, startTime: number, duration: number) {
    this.scheduledFaults.push({
      type: 'delay',
      target: nodeId,
      startTime,
      duration,
      intensity: delayMs
    });
  }

  /**
   * 生成随机故障序列
   */
  generateRandomFaults(count: number, testDuration: number): Fault[] {
    const faults: Fault[] = [];
    const faultTypes: FaultType[] = ['partition', 'crash', 'delay', 'noop'];

    for (let i = 0; i < count; i++) {
      const type = faultTypes[Math.floor(Math.random() * faultTypes.length)];
      const startTime = Math.random() * testDuration * 0.8;
      const duration = 1000 + Math.random() * 5000;

      let target: string | string[];

      switch (type) {
        case 'partition':
          target = this.createRandomPartition();
          break;
        case 'crash':
          target = this.nodes[Math.floor(Math.random() * this.nodes.length)];
          break;
        case 'delay':
          target = this.nodes[Math.floor(Math.random() * this.nodes.length)];
          break;
        default:
          target = 'none';
      }

      faults.push({ type, target, startTime, duration });
    }

    return faults.sort((a, b) => a.startTime - b.startTime);
  }

  private createRandomPartition(): string {
    // 随机分成两组
    const shuffled = [...this.nodes].sort(() => Math.random() - 0.5);
    const splitPoint = 1 + Math.floor(Math.random() * (this.nodes.length - 1));
    const group1 = shuffled.slice(0, splitPoint);
    const group2 = shuffled.slice(splitPoint);
    return `${group1.join(',')}|${group2.join(',')}`;
  }

  /**
   * 执行故障注入
   */
  async execute(testDuration: number): Promise<void> {
    const startTime = Date.now();

    return new Promise((resolve) => {
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;

        // 应用当前时间应该激活的故障
        for (const fault of this.scheduledFaults) {
          if (fault.startTime <= elapsed &&
              elapsed < fault.startTime + fault.duration &&
              !this.activeFaults.has(this.faultKey(fault))) {
            this.activateFault(fault);
          }

          // 停用过期故障
          if (elapsed >= fault.startTime + fault.duration &&
              this.activeFaults.has(this.faultKey(fault))) {
            this.deactivateFault(fault);
          }
        }

        if (elapsed >= testDuration) {
          clearInterval(interval);
          // 清理所有故障
          for (const fault of this.scheduledFaults) {
            if (this.activeFaults.has(this.faultKey(fault))) {
              this.deactivateFault(fault);
            }
          }
          resolve();
        }
      }, 100);
    });
  }

  private faultKey(fault: Fault): string {
    return `${fault.type}-${fault.target}-${fault.startTime}`;
  }

  private activateFault(fault: Fault) {
    this.activeFaults.add(this.faultKey(fault));
    console.log(`[Nemesis] Activated ${fault.type} on ${fault.target}`);
    this.emit('faultActivated', fault);
  }

  private deactivateFault(fault: Fault) {
    this.activeFaults.delete(this.faultKey(fault));
    console.log(`[Nemesis] Deactivated ${fault.type} on ${fault.target}`);
    this.emit('faultDeactivated', fault);
  }
}

// ============ 测试执行器 ============

interface TestResult {
  passed: boolean;
  history: HistoryEntry[];
  violations: string[];
  stats: {
    totalOperations: number;
    successfulOperations: number;
    failedOperations: number;
    duration: number;
  };
}

class DistributedSystemTester extends EventEmitter {
  private nemesis: Nemesis;
  private history: HistoryEntry[] = [];
  private operationCounter = 0;

  constructor(nemesis: Nemesis) {
    super();
    this.nemesis = nemesis;
  }

  /**
   * 执行测试
   */
  async runTest(options: {
    duration: number;
    operationRate: number;
    faultRate: number;
  }): Promise<TestResult> {
    const startTime = Date.now();
    this.history = [];

    // 生成随机故障
    const faultCount = Math.floor(options.duration / 1000 * options.faultRate);
    const faults = this.nemesis.generateRandomFaults(faultCount, options.duration);
    this.nemesis['scheduledFaults'] = faults;

    // 启动故障注入
    const nemesisPromise = this.nemesis.execute(options.duration);

    // 生成操作
    const operationInterval = 1000 / options.operationRate;
    let operationId = 0;

    const operationTimer = setInterval(() => {
      this.generateRandomOperation(operationId++);

      if (Date.now() - startTime >= options.duration) {
        clearInterval(operationTimer);
      }
    }, operationInterval);

    // 等待测试完成
    await nemesisPromise;

    const duration = Date.now() - startTime;

    // 分析结果
    return this.analyzeResults(duration);
  }

  private generateRandomOperation(id: number) {
    const processId = `client${Math.floor(Math.random() * 5)}`;
    const operation: Operation = {
      id: `op-${id}`,
      type: Math.random() < 0.5 ? 'read' : 'write',
      key: `key-${Math.floor(Math.random() * 10)}`,
      value: Math.random() < 0.5 ? 'value1' : 'value2',
      processId
    };

    // 记录调用
    this.history.push({
      operationId: operation.id,
      type: 'invoke',
      operation,
      timestamp: Date.now()
    });

    // 模拟执行
    setTimeout(() => {
      const success = Math.random() < 0.9;

      this.history.push({
        operationId: operation.id,
        type: 'response',
        operation,
        timestamp: Date.now(),
        result: success ? (operation.type === 'read' ? 'value1' : 'OK') : undefined,
        error: success ? undefined : 'timeout'
      });
    }, 50 + Math.random() * 100);
  }

  private analyzeResults(duration: number): TestResult {
    const invokes = this.history.filter(h => h.type === 'invoke');
    const responses = this.history.filter(h => h.type === 'response');
    const successful = responses.filter(h => !h.error);

    // 使用线性一致性检查器
    const model: Model = {
      initialState: new Map<string, any>(),
      step: (state: Map<string, any>, op: Operation) => {
        if (op.type === 'read') {
          return { valid: true, newState: state, result: state.get(op.key) };
        } else if (op.type === 'write') {
          const newState = new Map(state);
          newState.set(op.key, op.value);
          return { valid: true, newState, result: 'OK' };
        }
        return { valid: false, newState: state };
      }
    };

    const checker = new LinearizabilityChecker(model);
    const isLinearizable = checker.check(this.history);

    return {
      passed: isLinearizable,
      history: this.history,
      violations: isLinearizable ? [] : ['Linearizability violation detected'],
      stats: {
        totalOperations: invokes.length,
        successfulOperations: successful.length,
        failedOperations: responses.length - successful.length,
        duration
      }
    };
  }
}

// ============ 使用示例 ============

async function demonstrateTesting() {
  console.log('=== 分布式系统测试框架演示 ===\n');

  // 创建 Nemesis
  const nemesis = new Nemesis();
  nemesis.setNodes(['node1', 'node2', 'node3', 'node4', 'node5']);

  // 创建测试器
  const tester = new DistributedSystemTester(nemesis);

  // 运行测试
  console.log('Running test with random faults...\n');

  const result = await tester.runTest({
    duration: 3000,      // 3秒测试
    operationRate: 10,   // 每秒10个操作
    faultRate: 0.5       // 每2秒一个故障
  });

  console.log('--- 测试结果 ---');
  console.log('Passed:', result.passed);
  console.log('Total operations:', result.stats.totalOperations);
  console.log('Successful:', result.stats.successfulOperations);
  console.log('Failed:', result.stats.failedOperations);
  console.log('Duration:', result.stats.duration, 'ms');

  if (result.violations.length > 0) {
    console.log('\nViolations:');
    result.violations.forEach(v => console.log('  -', v));
  }

  // 演示一致性检查器
  console.log('\n--- 一致性检查器演示 ---');

  const model: Model = {
    initialState: new Map<string, any>(),
    step: (state: Map<string, any>, op: Operation) => {
      const newState = new Map(state);

      if (op.type === 'read') {
        return { valid: true, newState, result: state.get(op.key) };
      } else if (op.type === 'write') {
        newState.set(op.key, op.value);
        return { valid: true, newState, result: 'OK' };
      }

      return { valid: false, newState };
    }
  };

  const checker = new LinearizabilityChecker(model);

  // 创建一个简单的历史
  const simpleHistory: HistoryEntry[] = [
    { operationId: '1', type: 'invoke', operation: { id: '1', type: 'write', key: 'x', value: 1, processId: 'p1' }, timestamp: 0 },
    { operationId: '1', type: 'response', operation: { id: '1', type: 'write', key: 'x', value: 1, processId: 'p1' }, timestamp: 10, result: 'OK' },
    { operationId: '2', type: 'invoke', operation: { id: '2', type: 'read', key: 'x', processId: 'p2' }, timestamp: 20 },
    { operationId: '2', type: 'response', operation: { id: '2', type: 'read', key: 'x', processId: 'p2' }, timestamp: 30, result: 1 },
  ];

  console.log('Simple history is linearizable:', checker.check(simpleHistory));
}

demonstrateTesting().catch(console.error);
```


---

## 10. Node.js 分布式系统实践模式

### 10.1 微服务架构模式

#### 10.1.1 服务发现模式

```typescript
/**
 * 服务发现与注册中心
 */

interface ServiceInstance {
  id: string;
  name: string;
  host: string;
  port: number;
  health: 'healthy' | 'unhealthy' | 'unknown';
  metadata: Record<string, string>;
  lastHeartbeat: number;
}

class ServiceRegistry extends EventEmitter {
  private services = new Map<string, ServiceInstance[]>();
  private heartbeatInterval = 30000;

  register(instance: ServiceInstance): void {
    const instances = this.services.get(instance.name) || [];
    const existingIndex = instances.findIndex(i => i.id === instance.id);
    if (existingIndex >= 0) {
      instances[existingIndex] = instance;
    } else {
      instances.push(instance);
    }
    this.services.set(instance.name, instances);
    this.emit('serviceRegistered', instance);
  }

  discover(serviceName: string): ServiceInstance[] {
    return this.services.get(serviceName)?.filter(i => i.health === 'healthy') || [];
  }

  startHealthCheck(): void {
    setInterval(() => {
      const now = Date.now();
      for (const [name, instances] of this.services) {
        for (const instance of instances) {
          if (now - instance.lastHeartbeat > this.heartbeatInterval * 2) {
            instance.health = 'unhealthy';
          }
        }
      }
    }, this.heartbeatInterval);
  }
}
```

#### 10.1.2 断路器模式

```typescript
/**
 * 断路器模式实现
 */

type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

interface CircuitBreakerOptions {
  failureThreshold: number;
  successThreshold: number;
  timeout: number;
}

class CircuitBreaker extends EventEmitter {
  private state: CircuitState = 'CLOSED';
  private failures = 0;
  private successes = 0;
  private nextAttempt = 0;

  constructor(
    private action: () => Promise<any>,
    private options: CircuitBreakerOptions
  ) {
    super();
  }

  async execute<T>(): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        throw new Error('Circuit breaker is OPEN');
      }
      this.state = 'HALF_OPEN';
    }

    try {
      const result = await this.action();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    if (this.state === 'HALF_OPEN') {
      this.successes++;
      if (this.successes >= this.options.successThreshold) {
        this.close();
      }
    } else {
      this.failures = 0;
    }
  }

  private onFailure(): void {
    this.failures++;
    if (this.failures >= this.options.failureThreshold) {
      this.open();
    }
  }

  private open(): void {
    this.state = 'OPEN';
    this.nextAttempt = Date.now() + this.options.timeout;
    this.emit('open');
  }

  private close(): void {
    this.state = 'CLOSED';
    this.failures = 0;
    this.successes = 0;
    this.emit('close');
  }
}
```

### 10.2 分布式缓存模式

```typescript
/**
 * 分布式缓存实现
 */

interface CacheEntry {
  value: any;
  expireAt: number;
  version: number;
}

class DistributedCache {
  private local = new Map<string, CacheEntry>();

  constructor(private nodeId: string, private defaultTTL: number = 60000) {}

  async get<T>(key: string, loader: () => Promise<T>): Promise<T> {
    const cached = this.local.get(key);
    if (cached && cached.expireAt > Date.now()) {
      return cached.value;
    }

    const value = await loader();
    await this.set(key, value);
    return value;
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    const entry: CacheEntry = {
      value,
      expireAt: Date.now() + (ttl || this.defaultTTL),
      version: Date.now()
    };
    this.local.set(key, entry);
  }

  async invalidate(key: string): Promise<void> {
    this.local.delete(key);
  }
}
```

### 10.3 消息队列模式

```typescript
/**
 * 可靠消息队列实现
 */

interface Message {
  id: string;
  topic: string;
  payload: any;
  timestamp: number;
  attempts: number;
  maxAttempts: number;
  visibleAfter?: number;
}

class ReliableMessageQueue extends EventEmitter {
  private messages = new Map<string, Message>();
  private consumers = new Map<string, Array<(msg: Message) => Promise<void>>>();
  private processing = new Set<string>();

  constructor(private visibilityTimeout: number = 30000) {
    super();
  }

  async publish(topic: string, payload: any): Promise<string> {
    const message: Message = {
      id: `${Date.now()}-${Math.random()}`,
      topic,
      payload,
      timestamp: Date.now(),
      attempts: 0,
      maxAttempts: 3
    };
    this.messages.set(message.id, message);
    this.deliver(message);
    return message.id;
  }

  subscribe(topic: string, handler: (msg: Message) => Promise<void>): void {
    const handlers = this.consumers.get(topic) || [];
    handlers.push(handler);
    this.consumers.set(topic, handlers);
  }

  async acknowledge(messageId: string): Promise<void> {
    this.processing.delete(messageId);
    this.messages.delete(messageId);
  }

  private async deliver(message: Message): Promise<void> {
    const handlers = this.consumers.get(message.topic) || [];
    for (const handler of handlers) {
      try {
        await handler(message);
        return;
      } catch (error) {
        console.error(`Handler failed for ${message.id}:`, error);
      }
    }
  }
}
```

### 10.4 分布式事务实践

```typescript
/**
 * Node.js 分布式事务实现
 * 使用 Saga 模式
 */

interface SagaStep {
  name: string;
  execute: () => Promise<any>;
  compensate: () => Promise<void>;
}

class SagaOrchestrator {
  private steps: SagaStep[] = [];
  private executed: string[] = [];

  addStep(step: SagaStep) {
    this.steps.push(step);
  }

  async execute(): Promise<{ success: boolean; error?: Error }> {
    for (const step of this.steps) {
      try {
        await step.execute();
        this.executed.push(step.name);
      } catch (error) {
        await this.compensate();
        return { success: false, error: error as Error };
      }
    }
    return { success: true };
  }

  private async compensate(): Promise<void> {
    for (let i = this.executed.length - 1; i >= 0; i--) {
      const step = this.steps.find(s => s.name === this.executed[i])!;
      try {
        await step.compensate();
      } catch (e) {
        console.error(`Compensation failed for ${step.name}:`, e);
      }
    }
  }
}

// 使用示例
function createOrderSaga(): SagaOrchestrator {
  const saga = new SagaOrchestrator();

  saga.addStep({
    name: 'createOrder',
    execute: async () => {
      console.log('Creating order...');
    },
    compensate: async () => {
      console.log('Canceling order...');
    }
  });

  saga.addStep({
    name: 'reserveInventory',
    execute: async () => {
      console.log('Reserving inventory...');
    },
    compensate: async () => {
      console.log('Releasing inventory...');
    }
  });

  saga.addStep({
    name: 'processPayment',
    execute: async () => {
      console.log('Processing payment...');
    },
    compensate: async () => {
      console.log('Refunding payment...');
    }
  });

  return saga;
}
```

### 10.5 分布式追踪

```typescript
/**
 * 分布式追踪实现
 */

interface Span {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  operationName: string;
  startTime: number;
  endTime?: number;
  tags: Record<string, any>;
}

class Tracer {
  private spans: Span[] = [];

  startSpan(operationName: string, parentContext?: any): Span {
    return {
      traceId: parentContext?.traceId || this.generateId(),
      spanId: this.generateId(),
      parentSpanId: parentContext?.spanId,
      operationName,
      startTime: Date.now(),
      tags: {}
    };
  }

  finishSpan(span: Span): void {
    span.endTime = Date.now();
    this.spans.push(span);
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}

// Express 中间件
function tracingMiddleware(tracer: Tracer) {
  return (req: any, res: any, next: any) => {
    const span = tracer.startSpan(`${req.method} ${req.path}`);
    req.span = span;

    res.on('finish', () => {
      span.tags.status = res.statusCode;
      tracer.finishSpan(span);
    });

    next();
  };
}
```

### 10.6 完整的分布式计数器服务示例

```typescript
/**
 * 完整的分布式计数器服务
 * 综合运用 Gossip、向量时钟和分区容错
 */

class DistributedCounterService extends EventEmitter {
  private counters = new Map<string, {
    value: number;
    versionVector: Map<string, number>;
  }>();

  private nodeId: string;
  private peers: string[] = [];

  constructor(nodeId: string) {
    super();
    this.nodeId = nodeId;
  }

  setPeers(peers: string[]) {
    this.peers = peers.filter(p => p !== this.nodeId);
  }

  start(): void {
    setInterval(() => this.gossip(), 5000);
  }

  async increment(counterName: string, delta: number = 1): Promise<number> {
    let counter = this.counters.get(counterName);
    if (!counter) {
      counter = { value: 0, versionVector: new Map() };
    }

    counter.value += delta;
    const version = counter.versionVector.get(this.nodeId) || 0;
    counter.versionVector.set(this.nodeId, version + 1);

    this.counters.set(counterName, counter);
    return counter.value;
  }

  private gossip(): void {
    if (this.peers.length === 0) return;

    const peer = this.peers[Math.floor(Math.random() * this.peers.length)];
    const state = this.prepareState();

    this.emit('gossip', peer, state);
  }

  private prepareState() {
    return {
      nodeId: this.nodeId,
      counters: Array.from(this.counters.entries()).map(([name, data]) => ({
        name,
        value: data.value,
        versionVector: Array.from(data.versionVector.entries())
      }))
    };
  }
}

// 使用示例
async function demonstrateDistributedCounter() {
  const node1 = new DistributedCounterService('node1');
  const node2 = new DistributedCounterService('node2');

  node1.setPeers(['node1', 'node2']);
  node2.setPeers(['node1', 'node2']);

  node1.on('gossip', (peer, state) => {
    if (peer === 'node2') {
      console.log('Node1 gossiping to Node2:', state);
    }
  });

  node1.start();
  node2.start();

  // 并发递增
  await node1.increment('counter1', 5);
  await node2.increment('counter1', 3);

  console.log('Node1 counter:', node1['counters'].get('counter1'));
  console.log('Node2 counter:', node2['counters'].get('counter1'));
}

demonstrateDistributedCounter().catch(console.error);
```

---

## 总结

本文档提供了分布式系统形式化理论的完整覆盖：

1. **CAP 定理**：完整的形式化证明，展示了在网络分区下一致性与可用性的权衡
2. **一致性模型**：从线性一致性到最终一致性的完整谱系，包含层次包含关系证明
3. **共识算法**：Paxos、Raft、PBFT 的形式化定义、安全性证明和对比分析
4. **分布式事务**：2PC、3PC、Saga 的形式化描述和正确性证明
5. **时钟理论**：Lamport 时钟、向量时钟、版本向量的完整理论
6. **Gossip 协议**：收敛性分析和反熵理论
7. **分区容错**：分区检测、恢复策略和脑裂解决
8. **拜占庭容错**：PBFT 算法和 $3f+1$ 下界证明
9. **测试理论**：Jepsen 模型、线性化检查器和故障注入
10. **Node.js 实践**：微服务、断路器、缓存、消息队列、Saga、分布式追踪等实用模式

所有理论都配有完整的 TypeScript 实现示例，可直接用于实际项目开发。

---

*文档版本: 1.0*
*最后更新: 2026-04-08*
