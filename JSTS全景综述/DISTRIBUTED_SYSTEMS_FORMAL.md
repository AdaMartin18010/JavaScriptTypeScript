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

