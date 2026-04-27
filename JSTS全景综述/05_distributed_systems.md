---
last-updated: 2026-04-27
review-cycle: 6 months
next-review: 2026-10-27
status: current
---
# 分布式系统设计模型全面梳理

> 基于JavaScript/TypeScript生态的分布式系统架构指南

---

## 目录

- [分布式系统设计模型全面梳理](#分布式系统设计模型全面梳理)
  - [目录](#目录)
  - [1. 分布式系统基础理论](#1-分布式系统基础理论)
    - [1.1 CAP定理](#11-cap定理)
      - [定义与形式化](#定义与形式化)
      - [实际权衡](#实际权衡)
      - [反例：错误的CAP理解](#反例错误的cap理解)
    - [1.2 BASE理论](#12-base理论)
      - [定义与原理](#定义与原理)
      - [实现示例](#实现示例)
      - [反例：错误设计](#反例错误设计)
    - [1.3 PACELC定理](#13-pacelc定理)
      - [定义与形式化](#定义与形式化-1)
      - [实现示例](#实现示例-1)
    - [1.4 一致性模型](#14-一致性模型)
      - [1.4.1 强一致性（线性一致性）](#141-强一致性线性一致性)
      - [1.4.2 顺序一致性](#142-顺序一致性)
      - [1.4.3 因果一致性](#143-因果一致性)
      - [1.4.4 最终一致性](#144-最终一致性)
      - [一致性模型对比](#一致性模型对比)
  - [2. 通信模式](#2-通信模式)
    - [2.1 同步RPC](#21-同步rpc)
      - [定义与原理](#定义与原理-1)
      - [tRPC实现（TypeScript原生）](#trpc实现typescript原生)
      - [JSON-RPC实现](#json-rpc实现)
      - [反例：错误的RPC设计](#反例错误的rpc设计)
    - [2.2 异步消息](#22-异步消息)
      - [消息队列模式](#消息队列模式)
      - [发布订阅模式](#发布订阅模式)
      - [反例：错误的消息队列使用](#反例错误的消息队列使用)
    - [2.3 事件驱动架构](#23-事件驱动架构)
      - [Event Sourcing](#event-sourcing)
      - [CQRS（命令查询职责分离）](#cqrs命令查询职责分离)
      - [反例：错误的事件驱动设计](#反例错误的事件驱动设计)
    - [2.4 流处理（Reactive Streams）](#24-流处理reactive-streams)
  - [3. 服务架构模式](#3-服务架构模式)
    - [3.1 微服务架构](#31-微服务架构)
      - [定义与形式化](#定义与形式化-2)
      - [反例：错误的微服务设计](#反例错误的微服务设计)
    - [3.2 服务网格（Service Mesh）](#32-服务网格service-mesh)
      - [定义与原理](#定义与原理-2)
    - [3.3 Serverless架构](#33-serverless架构)
      - [定义与原理](#定义与原理-3)
    - [3.4 边缘计算](#34-边缘计算)
  - [4. 数据管理](#4-数据管理)
    - [4.1 数据分片](#41-数据分片)
      - [定义与形式化](#定义与形式化-3)
      - [反例：错误的分片设计](#反例错误的分片设计)
    - [4.2 数据复制](#42-数据复制)
      - [定义与形式化](#定义与形式化-4)
    - [4.3 分布式事务](#43-分布式事务)
      - [定义与形式化](#定义与形式化-5)
      - [反例：错误的分布式事务设计](#反例错误的分布式事务设计)
    - [4.4 分布式ID生成](#44-分布式id生成)
  - [5. 可靠性模式](#5-可靠性模式)
    - [5.1 熔断器（Circuit Breaker）](#51-熔断器circuit-breaker)
      - [定义与形式化](#定义与形式化-6)
      - [反例：错误的熔断器使用](#反例错误的熔断器使用)
    - [5.2 限流（Rate Limiting）](#52-限流rate-limiting)
      - [定义与形式化](#定义与形式化-7)
    - [5.3 降级（Degradation）](#53-降级degradation)
      - [定义与原理](#定义与原理-4)
    - [5.4 重试（Retry）](#54-重试retry)
      - [定义与形式化](#定义与形式化-8)
      - [反例：错误的重试设计](#反例错误的重试设计)
    - [5.5 幂等性（Idempotency）](#55-幂等性idempotency)
      - [定义与形式化](#定义与形式化-9)
    - [5.6 分布式追踪](#56-分布式追踪)
      - [定义与原理](#定义与原理-5)
  - [总结](#总结)

---

## 1. 分布式系统基础理论

### 1.1 CAP定理

#### 定义与形式化

CAP定理指出：在分布式数据存储系统中，**一致性(Consistency)**、**可用性(Availability)**、**分区容错性(Partition Tolerance)**三者不可兼得，最多只能同时满足其中两项。

**形式化定义：**

设分布式系统为 $S = \{N_1, N_2, ..., N_n\}$，其中 $N_i$ 表示第 $i$ 个节点。

- **一致性 (C)**: $\forall N_i, N_j \in S, \forall t: read_i(t) = write_j(t')$ 其中 $t' < t$
  - 所有节点在同一时刻看到的数据一致

- **可用性 (A)**: $\forall N_i \in S, \forall request: P(response_i) = 1$
  - 每个请求都能在有限时间内获得响应

- **分区容错性 (P)**: $\forall partition(N_i, N_j): S \text{ continues to operate}$
  - 系统在网络分区时仍能继续运行

**定理证明：**

假设存在网络分区，将系统分为 $G_1$ 和 $G_2$ 两个分区。

1. 若客户端向 $G_1$ 写入数据
2. 若保证一致性(C)，则必须等待 $G_2$ 同步完成
3. 但由于网络分区，$G_2$ 无法收到同步请求
4. 若等待，则 $G_1$ 无法响应，违反可用性(A)
5. 若不等待直接响应，则违反一致性(C)

因此，在网络分区(P)发生时，C和A不可兼得。∎

#### 实际权衡

```typescript
// CAP权衡的三种典型系统

// CP系统示例：ZooKeeper, etcd, Consul
// 牺牲可用性，保证一致性和分区容错性
class CPSystem {
  // 在分区发生时，拒绝写入直到分区恢复
  async write(key: string, value: unknown): Promise<void> {
    const quorum = Math.floor(this.nodes.length / 2) + 1;
    const acks = await this.replicateToQuorum(key, value, quorum);

    if (acks < quorum) {
      // 无法达到法定人数，拒绝写入
      throw new Error('Quorum not reached - partition detected');
    }
  }
}

// AP系统示例：Cassandra, DynamoDB, Couchbase
// 牺牲强一致性，保证可用性和分区容错性
class APSystem {
  // 始终响应，可能返回旧数据
  async read(key: string): Promise<unknown> {
    // 读取任意可用节点
    const node = this.getAvailableNode();
    const value = await node.get(key);

    // 返回可能过期的数据
    return value;
  }

  // 使用向量时钟解决冲突
  async resolveConflict(
    key: string,
    versions: VectorClock[]
  ): Promise<unknown> {
    // 最后写入获胜或客户端解决
    return this.lastWriteWins(versions);
  }
}

// CA系统示例：传统关系型数据库（单节点）
// 牺牲分区容错性，保证一致性和可用性
class CASystem {
  // 单节点部署，无网络分区问题
  private data = new Map<string, unknown>();

  async write(key: string, value: unknown): Promise<void> {
    this.data.set(key, value); // 强一致性保证
  }

  async read(key: string): Promise<unknown> {
    return this.data.get(key); // 始终可用
  }
}
```

#### 反例：错误的CAP理解

```typescript
// ❌ 错误：试图同时满足CAP三者
class ImpossibleSystem {
  private nodes: Node[];

  // 错误：在网络分区时仍试图保证强一致性和100%可用性
  async writeDuringPartition(key: string, value: unknown): Promise<void> {
    const writePromises = this.nodes.map(node =>
      node.write(key, value).catch(() => null)
    );

    // 错误：等待所有节点确认
    const results = await Promise.all(writePromises);

    // 分区发生时，部分节点不可达
    if (results.some(r => r === null)) {
      // 错误选择1：无限等待（违反可用性）
      // 错误选择2：返回成功但数据不一致（违反一致性）
      throw new Error('Cannot satisfy both C and A during partition');
    }
  }
}

// ❌ 错误：忽视分区容错性的设计
class NoPartitionHandling {
  // 假设网络永远可靠
  async replicate(data: unknown): Promise<void> {
    // 没有超时和降级策略
    await this.remoteNode.sync(data); // 可能永远阻塞
  }
}
```

---

### 1.2 BASE理论

#### 定义与原理

BASE是对CAP定理中AP系统的延伸，代表：

- **B**asically **A**vailable（基本可用）
- **S**oft state（软状态）
- **E**ventually consistent（最终一致性）

**形式化定义：**

设系统状态为 $S(t)$，写操作为 $W$，读操作为 $R$。

- **基本可用**: $\forall request: P(response) \geq 1 - \epsilon$，其中 $\epsilon$ 是很小的故障率
- **软状态**: $\exists t: S(t) \neq S(t + \Delta t)$ 在没有新输入的情况下
- **最终一致性**: $\lim_{t \to \infty} P(R_i(t) = R_j(t)) = 1$

#### 实现示例

```typescript
// BASE理论在电商系统中的应用

interface Product {
  id: string;
  name: string;
  stock: number;
  price: number;
  version: number; // 用于乐观锁
}

class BASEInventorySystem {
  private cache: Map<string, Product>; // 软状态
  private db: Database;
  private messageQueue: MessageQueue;

  // 基本可用：降级读取缓存
  async getProduct(productId: string): Promise<Product | null> {
    try {
      // 优先读取缓存（可能过期）
      const cached = this.cache.get(productId);
      if (cached) {
        return cached; // 软状态，可能不是最新
      }

      // 缓存未命中，读取数据库
      const product = await this.db.query(
        'SELECT * FROM products WHERE id = ?',
        [productId]
      );

      // 异步更新缓存（不阻塞响应）
      this.updateCacheAsync(productId, product);

      return product;
    } catch (error) {
      // 基本可用：数据库故障时返回缓存数据
      console.warn('Database unavailable, returning cached data');
      return this.cache.get(productId) || null;
    }
  }

  // 软状态：库存扣减异步处理
  async deductStock(
    productId: string,
    quantity: number
  ): Promise<{ success: boolean; message: string }> {
    // 1. 立即返回接受状态（基本可用）
    const requestId = generateUUID();

    // 2. 异步处理库存扣减
    this.messageQueue.publish('stock.deduct', {
      requestId,
      productId,
      quantity,
      timestamp: Date.now()
    });

    // 3. 立即返回，不等待实际扣减完成
    return {
      success: true,
      message: 'Order accepted, processing asynchronously'
    };
  }

  // 最终一致性：库存同步消费者
  async processStockDeduct(message: StockDeductMessage): Promise<void> {
    const { productId, quantity, requestId } = message;

    // 使用乐观锁处理并发
    const result = await this.db.transaction(async (trx) => {
      const product = await trx.query(
        'SELECT * FROM products WHERE id = ? FOR UPDATE',
        [productId]
      );

      if (product.stock < quantity) {
        throw new Error('Insufficient stock');
      }

      // 更新库存和版本号
      await trx.execute(
        `UPDATE products
         SET stock = stock - ?, version = version + 1
         WHERE id = ? AND version = ?`,
        [quantity, productId, product.version]
      );

      return { success: true };
    });

    // 异步更新缓存，实现最终一致性
    await this.invalidateCache(productId);
  }

  // 最终一致性检查
  async checkConsistency(productId: string): Promise<boolean> {
    const cached = this.cache.get(productId);
    const dbProduct = await this.db.query(
      'SELECT * FROM products WHERE id = ?',
      [productId]
    );

    // 允许短暂的不一致
    if (!cached) return true;

    // 检查关键字段一致性
    return cached.stock === dbProduct.stock &&
           cached.price === dbProduct.price;
  }
}
```

#### 反例：错误设计

```typescript
// ❌ 错误：在BASE系统中强求强一致性
class WrongBASEUsage {
  // 错误：每次读取都强制同步所有节点
  async getProduct(productId: string): Promise<Product> {
    // 这在BASE系统中是反模式的
    const results = await Promise.all(
      this.nodes.map(n => n.read(productId))
    );

    // 强制等待所有节点返回相同值
    const unique = new Set(results.map(r => JSON.stringify(r)));
    if (unique.size > 1) {
      throw new Error('Inconsistency detected'); // 违反基本可用
    }

    return results[0];
  }

  // 错误：同步阻塞等待所有副本确认
  async updateStock(productId: string, delta: number): Promise<void> {
    // 在BASE系统中，这违反了基本可用原则
    await Promise.all(
      this.nodes.map(n => n.update(productId, delta))
    );
  }
}
```

---

### 1.3 PACELC定理

#### 定义与形式化

PACELC是CAP定理的扩展，考虑了**延迟(Latency)**与一致性之间的权衡。

**形式化表述：**

$$\text{If } P \text{ then } (A \text{ or } C) \text{ else } (L \text{ or } C)$$

- **P**artition（分区）：如果发生网络分区
  - 选择 **A**vailability（可用性）或 **C**onsistency（一致性）
- **E**lse（否则，正常运行时）
  - 选择 **L**atency（低延迟）或 **C**onsistency（一致性）

**四种系统类型：**

| 类型 | 分区时 | 正常时 | 代表系统 |
|------|--------|--------|----------|
| PA/EL | 选可用性 | 选低延迟 | Dynamo, Cassandra |
| PA/EC | 选可用性 | 选一致性 | 无典型代表 |
| PC/EL | 选一致性 | 选低延迟 | 无典型代表 |
| PC/EC | 选一致性 | 选一致性 | MongoDB, HBase |

#### 实现示例

```typescript
// PACELC定理的实现框架

enum TradeoffChoice {
  AVAILABILITY = 'A',
  CONSISTENCY = 'C',
  LATENCY = 'L'
}

interface PACELCConfig {
  onPartition: TradeoffChoice.AVAILABILITY | TradeoffChoice.CONSISTENCY;
  onNormal: TradeoffChoice.LATENCY | TradeoffChoice.CONSISTENCY;
}

class PACELCSystem {
  private config: PACELCConfig;
  private partitionDetector: PartitionDetector;

  constructor(config: PACELCConfig) {
    this.config = config;
    this.partitionDetector = new PartitionDetector();
  }

  async read(key: string): Promise<unknown> {
    const hasPartition = await this.partitionDetector.checkPartition();

    if (hasPartition) {
      // 分区发生时的选择
      return this.config.onPartition === TradeoffChoice.AVAILABILITY
        ? this.readWithAvailability(key)    // PA: 可能读到旧数据
        : this.readWithConsistency(key);    // PC: 可能超时/失败
    } else {
      // 正常情况下的选择
      return this.config.onNormal === TradeoffChoice.LATENCY
        ? this.readWithLowLatency(key)      // EL: 读本地副本
        : this.readWithConsistency(key);    // EC: 读主节点或法定人数
    }
  }

  // PA/EL 系统：Dynamo风格
  private async readWithAvailability(key: string): Promise<unknown> {
    // 读取任意可用节点
    const nodes = this.getAvailableNodes();
    const promises = nodes.map(n =>
      n.read(key).catch(() => null)
    );

    // 返回第一个成功的响应
    const result = await Promise.race(
      promises.filter(p => p !== null)
    );

    return result;
  }

  // PC/EC 系统：强一致性风格
  private async readWithConsistency(key: string): Promise<unknown> {
    const quorum = Math.floor(this.nodes.length / 2) + 1;

    // 读取法定数量的节点
    const results = await this.readFromQuorum(key, quorum);

    // 返回最新版本
    return this.selectLatestVersion(results);
  }

  // EL 系统：低延迟优先
  private async readWithLowLatency(key: string): Promise<unknown> {
    // 直接读取本地副本，不等待同步
    return this.localNode.read(key);
  }
}

// 分区检测器
class PartitionDetector {
  private heartbeatInterval = 5000; // 5秒心跳
  private missedThreshold = 3;
  private nodeHeartbeats = new Map<string, number>();

  async checkPartition(): Promise<boolean> {
    const now = Date.now();
    let partitionedNodes = 0;

    for (const [nodeId, lastHeartbeat] of this.nodeHeartbeats) {
      const missedBeats = (now - lastHeartbeat) / this.heartbeatInterval;
      if (missedBeats > this.missedThreshold) {
        partitionedNodes++;
      }
    }

    // 如果超过半数节点失联，认为发生分区
    return partitionedNodes > this.nodeHeartbeats.size / 2;
  }
}
```

---

### 1.4 一致性模型

#### 1.4.1 强一致性（线性一致性）

**形式化定义：**

操作历史 $H$ 是线性一致的，如果存在一个全序 $<$ 满足：

1. **实时顺序保持**: 若操作 $op_1$ 在 $op_2$ 开始前完成，则 $op_1 < op_2$
2. **读己之写**: 进程 $p$ 的写操作 $w$ 后接读操作 $r$，则 $r$ 必须读到 $w$ 的值或更新的值
3. **单调读**: 若进程 $p$ 读到值 $v_1$ 后读到 $v_2$，则 $v_2 \geq v_1$

```typescript
// 线性一致性实现：基于共识算法

interface LinearizableStore {
  // 使用Raft/Paxos保证线性一致性
  private raftNode: RaftNode;

  async write(key: string, value: unknown): Promise<void> {
    // 所有写操作通过Leader，复制到多数派
    const entry: LogEntry = {
      term: this.raftNode.currentTerm,
      index: this.raftNode.nextLogIndex(),
      command: { type: 'PUT', key, value }
    };

    // 等待复制到多数派
    await this.raftNode.replicate(entry);

    // 提交并应用
    await this.raftNode.commit(entry.index);
  }

  async read(key: string): Promise<unknown> {
    // 读取Leader保证线性一致性
    // 或使用read index机制
    const readIndex = await this.raftNode.getReadIndex();
    return this.raftNode.readAtIndex(key, readIndex);
  }
}

// 线性一致性验证测试
class LinearizabilityTest {
  private history: Operation[] = [];

  recordOp(op: Operation): void {
    this.history.push({
      ...op,
      timestamp: Date.now()
    });
  }

  // 检查历史是否线性一致
  verifyLinearizability(): boolean {
    // 使用Wing-Gong算法验证
    // 1. 构建操作偏序关系
    // 2. 检查是否存在满足条件的全序
    return this.checkSequentialConsistency() &&
           this.checkRealTimeOrdering();
  }
}
```

#### 1.4.2 顺序一致性

**形式化定义：**

操作历史 $H$ 是顺序一致的，如果存在一个全序 $<$ 满足：

1. **程序顺序保持**: 每个进程内部的操作顺序保持不变
2. **全局一致**: 所有进程看到相同的操作顺序（但不要求与实时一致）

```typescript
// 顺序一致性实现

class SequentiallyConsistentStore {
  private vectorClock: Map<string, number> = new Map();
  private operationLog: Operation[] = [];

  async write(key: string, value: unknown): Promise<void> {
    const nodeId = this.getNodeId();

    // 增加向量时钟
    const current = this.vectorClock.get(nodeId) || 0;
    this.vectorClock.set(nodeId, current + 1);

    const operation: Operation = {
      type: 'WRITE',
      key,
      value,
      nodeId,
      vectorClock: new Map(this.vectorClock),
      timestamp: Date.now()
    };

    // 广播到所有节点
    await this.broadcast(operation);
  }

  // 按向量时钟排序执行
  private applyOperation(op: Operation): void {
    // 等待所有依赖的操作到达
    for (const [node, clock] of op.vectorClock) {
      while ((this.vectorClock.get(node) || 0) < clock) {
        // 等待前置操作
        this.waitForOperation(node, clock);
      }
    }

    // 应用操作
    this.store.set(op.key, op.value);
    this.operationLog.push(op);
  }
}
```

#### 1.4.3 因果一致性

**形式化定义：**

定义 happens-before 关系 $\to$：

- 同一进程内：$op_1 \to op_2$ 若 $op_1$ 在 $op_2$ 之前执行
- 跨进程：$write(x) \to read(x)$ 若 $read$ 读到 $write$ 的值
- 传递性：若 $a \to b$ 且 $b \to c$，则 $a \to c$

因果一致性要求：若 $op_1 \to op_2$，则所有进程必须看到 $op_1$ 在 $op_2$ 之前。

```typescript
// 因果一致性实现

interface CausalContext {
  vectorClock: Map<string, number>;
  dependencies: Set<string>;
}

class CausallyConsistentStore {
  private vectorClock: Map<string, number> = new Map();
  private pendingWrites: WriteOperation[] = [];

  async write(
    key: string,
    value: unknown,
    context: CausalContext
  ): Promise<void> {
    const nodeId = this.getNodeId();
    const newClock = (this.vectorClock.get(nodeId) || 0) + 1;
    this.vectorClock.set(nodeId, newClock);

    // 合并因果上下文
    for (const [node, clock] of context.vectorClock) {
      const current = this.vectorClock.get(node) || 0;
      this.vectorClock.set(node, Math.max(current, clock));
    }

    const write: WriteOperation = {
      key,
      value,
      nodeId,
      vectorClock: new Map(this.vectorClock),
      timestamp: Date.now()
    };

    await this.replicate(write);
  }

  async read(key: string): Promise<{ value: unknown; context: CausalContext }> {
    // 返回当前向量时钟作为因果上下文
    return {
      value: this.store.get(key),
      context: {
        vectorClock: new Map(this.vectorClock),
        dependencies: new Set()
      }
    };
  }

  // 处理收到的复制请求
  private async handleReplicatedWrite(write: WriteOperation): Promise<void> {
    // 检查因果依赖是否满足
    const canApply = this.checkCausalDependencies(write.vectorClock);

    if (canApply) {
      this.applyWrite(write);
    } else {
      // 缓存等待依赖满足
      this.pendingWrites.push(write);
    }

    // 尝试应用等待中的写操作
    this.tryApplyPendingWrites();
  }

  private checkCausalDependencies(clock: Map<string, number>): boolean {
    for (const [node, timestamp] of clock) {
      const current = this.vectorClock.get(node) || 0;
      if (current < timestamp - 1) {
        // 缺少前置操作
        return false;
      }
    }
    return true;
  }
}
```

#### 1.4.4 最终一致性

**形式化定义：**

$$\lim_{t \to \infty} P(\forall N_i, N_j \in S: value_i(t) = value_j(t)) = 1$$

在没有新更新的情况下，最终所有副本会收敛到相同值。

```typescript
// 最终一致性实现：使用反熵和读修复

class EventuallyConsistentStore {
  private data = new Map<string, VersionedValue>();
  private merkleTree: MerkleTree;

  // 反熵：定期同步
  async antiEntropySync(): Promise<void> {
    for (const node of this.getPeerNodes()) {
      try {
        // 交换Merkle树，找出差异
        const remoteTree = await node.getMerkleTree();
        const differences = this.merkleTree.compare(remoteTree);

        // 同步差异数据
        for (const diff of differences) {
          const value = await node.getValue(diff.key);
          this.mergeValue(diff.key, value);
        }
      } catch (error) {
        console.warn(`Sync with ${node.id} failed`, error);
      }
    }
  }

  // 读修复
  async readWithRepair(key: string): Promise<unknown> {
    // 读取多个副本
    const responses = await Promise.all(
      this.getReplicaNodes(key).map(node =>
        node.read(key).catch(() => null)
      )
    );

    const validResponses = responses.filter(r => r !== null);

    // 检查版本冲突
    const versions = validResponses.map(r => r.version);
    const maxVersion = Math.max(...versions);
    const latest = validResponses.find(r => r.version === maxVersion);

    // 修复旧版本副本
    for (const response of validResponses) {
      if (response.version < maxVersion) {
        this.repairNode(response.nodeId, key, latest);
      }
    }

    return latest.value;
  }

  // 使用向量时钟合并值
  private mergeValue(key: string, remote: VersionedValue): void {
    const local = this.data.get(key);

    if (!local) {
      this.data.set(key, remote);
      return;
    }

    const comparison = this.compareVectorClocks(
      local.vectorClock,
      remote.vectorClock
    );

    switch (comparison) {
      case 'before':
        // remote更新，采用remote
        this.data.set(key, remote);
        break;
      case 'after':
        // local更新，保持local
        break;
      case 'concurrent':
        // 并发冲突，需要解决
        const resolved = this.resolveConflict(local, remote);
        this.data.set(key, resolved);
        break;
    }
  }

  private resolveConflict(
    v1: VersionedValue,
    v2: VersionedValue
  ): VersionedValue {
    // 策略1: 最后写入获胜
    if (v1.timestamp > v2.timestamp) return v1;
    if (v2.timestamp > v1.timestamp) return v2;

    // 策略2: 向量时钟比较
    // 策略3: 应用特定合并逻辑
    // 策略4: 保留多个版本让客户端解决
    return this.keepMultipleVersions(v1, v2);
  }
}
```

#### 一致性模型对比

| 特性 | 线性一致性 | 顺序一致性 | 因果一致性 | 最终一致性 |
|------|------------|------------|------------|------------|
| 实时顺序 | ✓ | ✗ | ✗ | ✗ |
| 程序顺序 | ✓ | ✓ | ✓ | ✗ |
| 因果关系 | ✓ | ✓ | ✓ | ✗ |
| 收敛保证 | ✓ | ✓ | ✓ | ✓ |
| 延迟 | 高 | 中 | 低 | 最低 |
| 可用性 | 低 | 中 | 高 | 最高 |

---


## 2. 通信模式

### 2.1 同步RPC

#### 定义与原理

RPC（Remote Procedure Call）允许程序像调用本地函数一样调用远程服务。

**形式化模型：**

设本地过程为 $P_{local}$，远程过程为 $P_{remote}$，RPC框架提供映射：

$$RPC: P_{local}(args) \xrightarrow{serialize \to network \to deserialize} P_{remote}(args) \to result$$

```typescript
// gRPC实现示例

// 定义.proto文件
/*
syntax = "proto3";

service UserService {
  rpc GetUser(GetUserRequest) returns (User);
  rpc ListUsers(ListUsersRequest) returns (stream User);
  rpc CreateUsers(stream CreateUserRequest) returns (CreateUsersResponse);
  rpc Chat(stream ChatMessage) returns (stream ChatMessage);
}

message GetUserRequest {
  string user_id = 1;
}

message User {
  string user_id = 1;
  string name = 2;
  string email = 3;
}
*/

// TypeScript gRPC客户端实现
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';

interface GRPCClientConfig {
  endpoint: string;
  timeout: number;
  retries: number;
  loadBalancing: 'round_robin' | 'pick_first';
}

class UserGRPCClient {
  private client: any;
  private config: GRPCClientConfig;

  constructor(config: GRPCClientConfig) {
    this.config = config;

    const packageDefinition = protoLoader.loadSync(
      './user.proto',
      {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
      }
    );

    const proto = grpc.loadPackageDefinition(packageDefinition);

    this.client = new (proto as any).UserService(
      config.endpoint,
      grpc.credentials.createInsecure(),
      {
        'grpc.lb_policy_name': config.loadBalancing,
        'grpc.keepalive_time_ms': 10000,
        'grpc.keepalive_timeout_ms': 5000,
      }
    );
  }

  // 一元RPC
  async getUser(userId: string): Promise<User> {
    return new Promise((resolve, reject) => {
      const deadline = Date.now() + this.config.timeout;

      this.client.GetUser(
        { user_id: userId },
        { deadline },
        (error: grpc.ServiceError, response: User) => {
          if (error) {
            reject(this.handleGRPCError(error));
          } else {
            resolve(response);
          }
        }
      );
    });
  }

  // 服务端流式RPC
  async *listUsers(filter: UserFilter): AsyncGenerator<User> {
    const stream = this.client.ListUsers(filter);

    for await (const user of stream) {
      yield user;
    }
  }

  // 客户端流式RPC
  async batchCreateUsers(
    users: CreateUserRequest[]
  ): Promise<CreateUsersResponse> {
    const stream = this.client.CreateUsers(
      (error: grpc.ServiceError, response: CreateUsersResponse) => {
        if (error) throw this.handleGRPCError(error);
        return response;
      }
    );

    for (const user of users) {
      stream.write(user);
    }

    stream.end();

    return new Promise((resolve, reject) => {
      stream.on('data', resolve);
      stream.on('error', reject);
    });
  }

  // 双向流式RPC
  chat(): BidirectionalStream<ChatMessage, ChatMessage> {
    return this.client.Chat();
  }

  private handleGRPCError(error: grpc.ServiceError): Error {
    switch (error.code) {
      case grpc.status.DEADLINE_EXCEEDED:
        return new TimeoutError('RPC timeout');
      case grpc.status.UNAVAILABLE:
        return new ServiceUnavailableError('Service unavailable');
      case grpc.status.INTERNAL:
        return new InternalError('Internal server error');
      default:
        return error;
    }
  }
}

// gRPC服务端实现
class UserGRPCServer {
  private server: grpc.Server;

  constructor(private userService: UserService) {
    this.server = new grpc.Server({
      'grpc.max_receive_message_length': 16 * 1024 * 1024,
      'grpc.max_send_message_length': 16 * 1024 * 1024,
    });

    this.registerHandlers();
  }

  private registerHandlers(): void {
    this.server.addService(UserService, {
      GetUser: this.handleGetUser.bind(this),
      ListUsers: this.handleListUsers.bind(this),
      CreateUsers: this.handleCreateUsers.bind(this),
      Chat: this.handleChat.bind(this),
    });
  }

  private async handleGetUser(
    call: grpc.ServerUnaryCall<GetUserRequest, User>,
    callback: grpc.sendUnaryData<User>
  ): Promise<void> {
    try {
      const user = await this.userService.getUser(call.request.user_id);
      callback(null, user);
    } catch (error) {
      callback(this.convertToGRPCError(error), null);
    }
  }

  private handleListUsers(
    call: grpc.ServerWritableStream<ListUsersRequest, User>
  ): void {
    const stream = this.userService.listUsers(call.request);

    stream.on('data', (user: User) => call.write(user));
    stream.on('end', () => call.end());
    stream.on('error', (error) => call.destroy(error));
  }

  start(port: number): void {
    this.server.bindAsync(
      `0.0.0.0:${port}`,
      grpc.ServerCredentials.createInsecure(),
      (error) => {
        if (error) throw error;
        this.server.start();
        console.log(`gRPC server started on port ${port}`);
      }
    );
  }
}
```

#### tRPC实现（TypeScript原生）

```typescript
// tRPC: 端到端类型安全的RPC

import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { createHTTPServer } from '@trpc/server/adapters/standalone';

// 定义Schema
const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
});

const CreateUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

// 创建tRPC实例
const t = initTRPC.create();

// 定义路由
const appRouter = t.router({
  // 查询
  getUser: t.procedure
    .input(z.object({ id: z.string() }))
    .output(UserSchema)
    .query(async ({ input, ctx }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: input.id }
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found'
        });
      }

      return user;
    }),

  // 变更
  createUser: t.procedure
    .input(CreateUserSchema)
    .output(UserSchema)
    .mutation(async ({ input, ctx }) => {
      const user = await ctx.db.user.create({
        data: input
      });

      // 发布事件
      await ctx.eventBus.publish('user.created', { userId: user.id });

      return user;
    }),

  // 订阅（实时更新）
  onUserCreated: t.procedure
    .subscription(async function* ({ ctx }) {
      for await (const event of ctx.eventBus.subscribe('user.created')) {
        yield event;
      }
    }),
});

// 类型导出
export type AppRouter = typeof appRouter;

// 服务端
const server = createHTTPServer({
  router: appRouter,
  middleware: cors(),
  createContext: async () => ({
    db: createPrismaClient(),
    eventBus: createEventBus(),
    auth: await authenticateRequest(),
  }),
});

// 客户端（类型安全）
import { createTRPCClient, httpBatchLink } from '@trpc/client';

const client = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:3000/trpc',
      headers: async () => ({
        Authorization: `Bearer ${await getToken()}`
      }),
    }),
  ],
});

// 完全类型推断
const user = await client.getUser.query({ id: '123' });
//    ^? { id: string; name: string; email: string; }

const newUser = await client.createUser.mutate({
  name: 'John',
  email: 'john@example.com'
});
```

#### JSON-RPC实现

```typescript
// JSON-RPC 2.0实现

interface JSONRPCRequest {
  jsonrpc: '2.0';
  method: string;
  params?: unknown[] | Record<string, unknown>;
  id?: string | number | null;
}

interface JSONRPCResponse {
  jsonrpc: '2.0';
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
  id: string | number | null;
}

class JSONRPCServer {
  private handlers = new Map<string, Function>();

  registerMethod(name: string, handler: Function): void {
    this.handlers.set(name, handler);
  }

  async handleRequest(request: JSONRPCRequest): Promise<JSONRPCResponse> {
    // 验证请求
    if (request.jsonrpc !== '2.0') {
      return this.createErrorResponse(
        request.id ?? null,
        -32600,
        'Invalid Request'
      );
    }

    const handler = this.handlers.get(request.method);
    if (!handler) {
      return this.createErrorResponse(
        request.id ?? null,
        -32601,
        'Method not found'
      );
    }

    try {
      const result = await handler(request.params);
      return {
        jsonrpc: '2.0',
        result,
        id: request.id ?? null
      };
    } catch (error) {
      return this.createErrorResponse(
        request.id ?? null,
        -32603,
        error instanceof Error ? error.message : 'Internal error'
      );
    }
  }

  private createErrorResponse(
    id: string | number | null,
    code: number,
    message: string
  ): JSONRPCResponse {
    return {
      jsonrpc: '2.0',
      error: { code, message },
      id
    };
  }
}

// Express中间件集成
function jsonRPCMiddleware(server: JSONRPCServer) {
  return async (req: Request, res: Response) => {
    const requests: JSONRPCRequest[] = Array.isArray(req.body)
      ? req.body
      : [req.body];

    const responses = await Promise.all(
      requests.map(r => server.handleRequest(r))
    );

    res.json(responses.length === 1 ? responses[0] : responses);
  };
}
```

#### 反例：错误的RPC设计

```typescript
// ❌ 错误：同步阻塞调用导致级联故障
class BadRPCDesign {
  async processOrder(order: Order): Promise<void> {
    // 错误：顺序同步调用，延迟累积
    const user = await this.userService.getUser(order.userId);      // 100ms
    const inventory = await this.inventoryService.check(order.items); // 100ms
    const payment = await this.paymentService.charge(order.total);    // 200ms
    const shipping = await this.shippingService.create(order);        // 100ms

    // 总延迟：500ms+，且任一服务故障导致整个流程失败
  }
}

// ❌ 错误：没有超时和重试策略
class NoTimeoutRPC {
  async callService(): Promise<void> {
    // 可能永远阻塞
    const result = await this.httpClient.post('/api/service', data);
    // 如果服务挂起，此调用永远不会返回
  }
}

// ❌ 错误：错误的错误处理
class BadErrorHandling {
  async getUser(id: string): Promise<User> {
    try {
      return await this.rpcClient.getUser({ id });
    } catch (error) {
      // 错误：吞掉所有异常，返回null
      return null as any;
    }
  }
}
```

---

### 2.2 异步消息

#### 消息队列模式

**形式化模型：**

消息队列是一个FIFO（先进先出）结构：

$$Q = \langle m_1, m_2, ..., m_n \rangle$$

操作：

- $enqueue(Q, m)$: $Q \to \langle m_1, ..., m_n, m \rangle$
- $dequeue(Q)$: $Q \to \langle m_2, ..., m_n \rangle$, 返回 $m_1$

```typescript
// 消息队列抽象接口

interface MessageQueue<T> {
  // 生产者接口
  publish(message: T, options?: PublishOptions): Promise<void>;

  // 消费者接口
  subscribe(
    handler: MessageHandler<T>,
    options?: SubscribeOptions
  ): Promise<Subscription>;

  // 管理接口
  createQueue(name: string, options?: QueueOptions): Promise<void>;
  deleteQueue(name: string): Promise<void>;
}

interface PublishOptions {
  priority?: number;        // 消息优先级
  delay?: number;           // 延迟投递（毫秒）
  ttl?: number;             // 消息存活时间
  persistent?: boolean;     // 持久化
  headers?: Record<string, unknown>;
}

interface SubscribeOptions {
  prefetch?: number;        // 预取数量
  ackMode?: 'auto' | 'manual' | 'none';
  concurrency?: number;     // 并发处理数
  deadLetterQueue?: string; // 死信队列
}

// RabbitMQ实现
import amqp, { Connection, Channel, ConsumeMessage } from 'amqplib';

class RabbitMQQueue<T> implements MessageQueue<T> {
  private connection: Connection;
  private channel: Channel;

  constructor(private config: RabbitMQConfig) {}

  async connect(): Promise<void> {
    this.connection = await amqp.connect(this.config.url);
    this.channel = await this.connection.createChannel();

    // 设置QoS
    await this.channel.prefetch(this.config.prefetch || 10);

    // 启用发布确认
    await this.channel.confirmSelect();
  }

  async publish(message: T, options: PublishOptions = {}): Promise<void> {
    const buffer = Buffer.from(JSON.stringify(message));

    const publishOptions: amqp.Options.Publish = {
      persistent: options.persistent ?? true,
      priority: options.priority,
      expiration: options.ttl,
      headers: options.headers,
    };

    // 使用确认模式确保消息到达
    await this.channel.publish(
      this.config.exchange,
      this.config.routingKey,
      buffer,
      publishOptions
    );
  }

  async subscribe(
    handler: MessageHandler<T>,
    options: SubscribeOptions = {}
  ): Promise<Subscription> {
    const { queue } = await this.channel.assertQueue(this.config.queueName, {
      durable: true,
      deadLetterExchange: options.deadLetterQueue,
    });

    const consumer = await this.channel.consume(
      queue,
      async (msg: ConsumeMessage | null) => {
        if (!msg) return;

        try {
          const content = JSON.parse(msg.content.toString()) as T;

          await handler(content, {
            messageId: msg.properties.messageId,
            timestamp: msg.properties.timestamp,
            headers: msg.properties.headers as Record<string, unknown>,
            ack: () => this.channel.ack(msg),
            nack: (requeue = false) => this.channel.nack(msg, false, requeue),
            reject: (requeue = false) => this.channel.reject(msg, requeue),
          });

          if (options.ackMode !== 'manual') {
            this.channel.ack(msg);
          }
        } catch (error) {
          // 处理失败，进入死信队列或重试
          this.handleFailedMessage(msg, error, options);
        }
      },
      { noAck: options.ackMode === 'auto' }
    );

    return {
      unsubscribe: () => this.channel.cancel(consumer.consumerTag),
    };
  }

  private handleFailedMessage(
    msg: ConsumeMessage,
    error: Error,
    options: SubscribeOptions
  ): void {
    const retryCount = (msg.properties.headers?.['x-retry-count'] as number) || 0;
    const maxRetries = 3;

    if (retryCount < maxRetries) {
      // 重试：重新发布到队列
      const updatedHeaders = {
        ...msg.properties.headers,
        'x-retry-count': retryCount + 1,
        'x-last-error': error.message,
      };

      this.channel.publish(
        '',
        msg.fields.routingKey,
        msg.content,
        { ...msg.properties, headers: updatedHeaders }
      );

      this.channel.ack(msg);
    } else {
      // 超过重试次数，进入死信队列
      this.channel.reject(msg, false);
    }
  }
}

// Apache Kafka实现
import { Kafka, Producer, Consumer, EachMessagePayload } from 'kafkajs';

class KafkaQueue<T> implements MessageQueue<T> {
  private kafka: Kafka;
  private producer: Producer;
  private consumer: Consumer;

  constructor(private config: KafkaConfig) {
    this.kafka = new Kafka({
      clientId: config.clientId,
      brokers: config.brokers,
      retry: {
        retries: 5,
        initialRetryTime: 300,
      },
    });
  }

  async connect(): Promise<void> {
    this.producer = this.kafka.producer({
      idempotent: true,  // 幂等生产者
      transactionalId: this.config.transactionalId,
    });

    this.consumer = this.kafka.consumer({
      groupId: this.config.groupId,
      sessionTimeout: 30000,
      heartbeatInterval: 3000,
    });

    await this.producer.connect();
    await this.consumer.connect();
  }

  async publish(message: T, options: PublishOptions = {}): Promise<void> {
    const key = options.headers?.['key'] as string || 'default';

    await this.producer.send({
      topic: this.config.topic,
      messages: [{
        key,
        value: JSON.stringify(message),
        headers: options.headers as Record<string, string>,
        timestamp: Date.now().toString(),
      }],
    });
  }

  async publishTransaction(
    messages: Array<{ topic: string; message: T }>
  ): Promise<void> {
    const transaction = await this.producer.transaction();

    try {
      for (const { topic, message } of messages) {
        await transaction.send({
          topic,
          messages: [{ value: JSON.stringify(message) }],
        });
      }

      await transaction.commit();
    } catch (error) {
      await transaction.abort();
      throw error;
    }
  }

  async subscribe(
    handler: MessageHandler<T>,
    options: SubscribeOptions = {}
  ): Promise<Subscription> {
    await this.consumer.subscribe({
      topic: this.config.topic,
      fromBeginning: false,
    });

    await this.consumer.run({
      autoCommit: options.ackMode === 'auto',
      autoCommitInterval: 5000,
      partitionsConsumedConcurrently: options.concurrency || 1,

      eachMessage: async (payload: EachMessagePayload) => {
        const { topic, partition, message } = payload;

        try {
          const content = JSON.parse(message.value?.toString() || '{}') as T;

          await handler(content, {
            messageId: message.offset,
            timestamp: Number(message.timestamp),
            headers: message.headers as Record<string, unknown>,
            ack: async () => {
              await this.consumer.commitOffsets([{
                topic,
                partition,
                offset: (Number(message.offset) + 1).toString(),
              }]);
            },
            nack: async (requeue = false) => {
              if (!requeue) {
                // 发送到死信主题
                await this.sendToDLT(content, 'processing_failed');
              }
              // 否则不提交offset，会重新消费
            },
            reject: async () => {
              await this.sendToDLT(content, 'rejected');
            },
          });
        } catch (error) {
          console.error('Message processing failed:', error);
          await this.sendToDLT(
            JSON.parse(message.value?.toString() || '{}'),
            (error as Error).message
          );
        }
      },
    });

    return {
      unsubscribe: () => this.consumer.disconnect(),
    };
  }

  private async sendToDLT(message: T, reason: string): Promise<void> {
    await this.producer.send({
      topic: `${this.config.topic}.dlq`,
      messages: [{
        value: JSON.stringify({
          originalMessage: message,
          failedAt: new Date().toISOString(),
          reason,
        }),
      }],
    });
  }
}
```

#### 发布订阅模式

```typescript
// 发布订阅模式实现

interface PubSub<T> {
  publish(topic: string, message: T, options?: PublishOptions): Promise<void>;
  subscribe(
    topic: string,
    handler: MessageHandler<T>,
    options?: SubscribeOptions
  ): Promise<Subscription>;
  unsubscribe(subscription: Subscription): Promise<void>;
}

// Redis Pub/Sub实现
import { createClient, RedisClientType } from 'redis';

class RedisPubSub<T> implements PubSub<T> {
  private publisher: RedisClientType;
  private subscriber: RedisClientType;
  private handlers = new Map<string, Set<MessageHandler<T>>>();

  constructor(private config: RedisConfig) {
    this.publisher = createClient({ url: config.url });
    this.subscriber = createClient({ url: config.url });
  }

  async connect(): Promise<void> {
    await this.publisher.connect();
    await this.subscriber.connect();

    // 设置消息处理器
    this.subscriber.on('message', (channel, message) => {
      const handlers = this.handlers.get(channel);
      if (handlers) {
        const parsed = JSON.parse(message) as T;
        handlers.forEach(h => h(parsed, {
          messageId: '',
          timestamp: Date.now(),
          headers: {},
          ack: () => {},
          nack: () => {},
          reject: () => {},
        }));
      }
    });
  }

  async publish(
    topic: string,
    message: T,
    options: PublishOptions = {}
  ): Promise<void> {
    const payload = JSON.stringify({
      data: message,
      timestamp: Date.now(),
      ...options.headers,
    });

    await this.publisher.publish(topic, payload);
  }

  async subscribe(
    topic: string,
    handler: MessageHandler<T>,
    options: SubscribeOptions = {}
  ): Promise<Subscription> {
    // 支持模式匹配订阅
    if (topic.includes('*') || topic.includes('?')) {
      await this.subscriber.pSubscribe(topic, (message, channel) => {
        const parsed = JSON.parse(message) as T;
        handler(parsed, {
          messageId: '',
          timestamp: Date.now(),
          headers: { channel },
          ack: () => {},
          nack: () => {},
          reject: () => {},
        });
      });
    } else {
      await this.subscriber.subscribe(topic, (message) => {
        const parsed = JSON.parse(message) as T;
        handler(parsed, {
          messageId: '',
          timestamp: Date.now(),
          headers: {},
          ack: () => {},
          nack: () => {},
          reject: () => {},
        });
      });
    }

    if (!this.handlers.has(topic)) {
      this.handlers.set(topic, new Set());
    }
    this.handlers.get(topic)!.add(handler);

    return {
      unsubscribe: async () => {
        this.handlers.get(topic)?.delete(handler);
        if (this.handlers.get(topic)?.size === 0) {
          await this.subscriber.unsubscribe(topic);
        }
      }
    };
  }
}

// 事件总线（应用内）
class EventBus<T extends Record<string, unknown>> {
  private listeners = new Map<
    keyof T,
    Set<(payload: T[keyof T]) => void | Promise<void>>
  >();

  on<K extends keyof T>(
    event: K,
    handler: (payload: T[K]) => void | Promise<void>
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    this.listeners.get(event)!.add(handler as any);

    return () => {
      this.listeners.get(event)?.delete(handler as any);
    };
  }

  once<K extends keyof T>(
    event: K,
    handler: (payload: T[K]) => void | Promise<void>
  ): void {
    const onceHandler = (payload: T[K]) => {
      this.off(event, onceHandler);
      handler(payload);
    };
    this.on(event, onceHandler);
  }

  off<K extends keyof T>(
    event: K,
    handler: (payload: T[K]) => void | Promise<void>
  ): void {
    this.listeners.get(event)?.delete(handler as any);
  }

  async emit<K extends keyof T>(
    event: K,
    payload: T[K]
  ): Promise<void> {
    const handlers = this.listeners.get(event);
    if (!handlers) return;

    // 并行执行所有处理器
    await Promise.all(
      Array.from(handlers).map(async handler => {
        try {
          await handler(payload);
        } catch (error) {
          console.error(`Event handler failed for ${String(event)}:`, error);
        }
      })
    );
  }

  // 带超时的emit
  async emitWithTimeout<K extends keyof T>(
    event: K,
    payload: T[K],
    timeout: number
  ): Promise<void> {
    const handlers = this.listeners.get(event);
    if (!handlers) return;

    await Promise.all(
      Array.from(handlers).map(handler =>
        Promise.race([
          handler(payload),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Handler timeout')), timeout)
          )
        ])
      )
    );
  }
}

// 类型安全的事件定义
type AppEvents = {
  'user.created': { userId: string; email: string };
  'order.completed': { orderId: string; userId: string; total: number };
  'payment.failed': { paymentId: string; reason: string };
};

const eventBus = new EventBus<AppEvents>();

// 订阅事件
const unsubscribe = eventBus.on('user.created', async ({ userId, email }) => {
  await sendWelcomeEmail(email);
  await createUserProfile(userId);
});

// 发布事件
await eventBus.emit('user.created', {
  userId: '123',
  email: 'user@example.com'
});
```

#### 反例：错误的消息队列使用

```typescript
// ❌ 错误：同步处理消息
class BadMessageHandler {
  async processMessage(message: OrderMessage): Promise<void> {
    // 错误：同步调用外部服务
    const payment = await this.paymentService.process(message.payment);
    const inventory = await this.inventoryService.deduct(message.items);
    const shipping = await this.shippingService.schedule(message.address);

    // 问题：处理时间长，阻塞其他消息消费
  }
}

// ❌ 错误：不处理消息失败
class NoFailureHandling {
  async consume(message: Message): Promise<void> {
    // 错误：没有try-catch，失败时消息丢失
    await this.process(message);
    // 没有确认机制
  }
}

// ❌ 错误：消息顺序依赖
class OrderDependentMessages {
  // 错误设计：假设消息按顺序到达
  async handleUserEvent(event: UserEvent): Promise<void> {
    if (event.type === 'created') {
      await this.createUser(event.data);
    } else if (event.type === 'updated') {
      // 危险：如果update先于create到达会失败
      await this.updateUser(event.data);
    }
  }
}
```

---

### 2.3 事件驱动架构

#### Event Sourcing

**形式化定义：**

系统状态 $S$ 是事件序列 $E = \langle e_1, e_2, ..., e_n \rangle$ 的折叠结果：

$$S_n = fold(apply, S_0, \langle e_1, e_2, ..., e_n \rangle)$$

其中 $apply: S \times E \to S$ 是状态转换函数。

```typescript
// Event Sourcing实现

// 领域事件基类
abstract class DomainEvent {
  constructor(
    public readonly aggregateId: string,
    public readonly version: number,
    public readonly timestamp: Date = new Date(),
    public readonly eventId: string = generateUUID()
  ) {}
}

// 具体事件
class OrderCreatedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    version: number,
    public readonly userId: string,
    public readonly items: OrderItem[],
    public readonly total: number
  ) {
    super(aggregateId, version);
  }
}

class OrderPaidEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    version: number,
    public readonly paymentId: string,
    public readonly amount: number
  ) {
    super(aggregateId, version);
  }
}

class OrderShippedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    version: number,
    public readonly trackingNumber: string,
    public readonly carrier: string
  ) {
    super(aggregateId, version);
  }
}

// 聚合根
class Order {
  private events: DomainEvent[] = [];
  private uncommittedEvents: DomainEvent[] = [];

  constructor(
    public readonly id: string,
    public userId: string = '',
    public items: OrderItem[] = [],
    public total: number = 0,
    public status: OrderStatus = 'pending',
    public version: number = 0
  ) {}

  // 工厂方法：从事件重建
  static rehydrate(id: string, events: DomainEvent[]): Order {
    const order = new Order(id);

    for (const event of events.sort((a, b) => a.version - b.version)) {
      order.apply(event);
      order.version = event.version;
    }

    return order;
  }

  // 创建订单
  static create(
    id: string,
    userId: string,
    items: OrderItem[]
  ): Order {
    const order = new Order(id);
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    order.applyChange(new OrderCreatedEvent(
      id,
      1,
      userId,
      items,
      total
    ));

    return order;
  }

  // 支付
  pay(paymentId: string, amount: number): void {
    if (this.status !== 'pending') {
      throw new Error('Order cannot be paid');
    }

    if (amount !== this.total) {
      throw new Error('Payment amount mismatch');
    }

    this.applyChange(new OrderPaidEvent(
      this.id,
      this.version + 1,
      paymentId,
      amount
    ));
  }

  // 发货
  ship(trackingNumber: string, carrier: string): void {
    if (this.status !== 'paid') {
      throw new Error('Order must be paid before shipping');
    }

    this.applyChange(new OrderShippedEvent(
      this.id,
      this.version + 1,
      trackingNumber,
      carrier
    ));
  }

  // 应用事件到状态
  private apply(event: DomainEvent): void {
    if (event instanceof OrderCreatedEvent) {
      this.userId = event.userId;
      this.items = event.items;
      this.total = event.total;
      this.status = 'pending';
    } else if (event instanceof OrderPaidEvent) {
      this.status = 'paid';
    } else if (event instanceof OrderShippedEvent) {
      this.status = 'shipped';
    }
  }

  // 记录未提交事件
  private applyChange(event: DomainEvent): void {
    this.apply(event);
    this.uncommittedEvents.push(event);
    this.version = event.version;
  }

  // 获取未提交事件
  getUncommittedEvents(): DomainEvent[] {
    return [...this.uncommittedEvents];
  }

  // 标记已提交
  markCommitted(): void {
    this.events.push(...this.uncommittedEvents);
    this.uncommittedEvents = [];
  }
}

// 事件存储
interface EventStore {
  append(aggregateId: string, events: DomainEvent[], expectedVersion: number): Promise<void>;
  getEvents(aggregateId: string): Promise<DomainEvent[]>;
  getEventsByType(eventType: string): AsyncGenerator<DomainEvent>;
  getAllEvents(afterPosition?: number): AsyncGenerator<DomainEvent>;
}

// PostgreSQL事件存储实现
class PostgresEventStore implements EventStore {
  constructor(private db: Knex) {}

  async append(
    aggregateId: string,
    events: DomainEvent[],
    expectedVersion: number
  ): Promise<void> {
    await this.db.transaction(async (trx) => {
      // 乐观并发控制
      const current = await trx('events')
        .where('aggregate_id', aggregateId)
        .max('version as max_version')
        .first();

      if (current.max_version !== expectedVersion) {
        throw new ConcurrencyException(
          `Expected version ${expectedVersion} but found ${current.max_version}`
        );
      }

      // 批量插入事件
      const eventRecords = events.map(event => ({
        event_id: event.eventId,
        aggregate_id: aggregateId,
        aggregate_type: 'order',
        event_type: event.constructor.name,
        version: event.version,
        data: JSON.stringify(event),
        metadata: JSON.stringify({}),
        created_at: event.timestamp,
      }));

      await trx('events').insert(eventRecords);

      // 发布到事件总线（事务内）
      for (const event of events) {
        await trx('outbox').insert({
          event_id: event.eventId,
          event_type: event.constructor.name,
          payload: JSON.stringify(event),
          created_at: new Date(),
        });
      }
    });
  }

  async getEvents(aggregateId: string): Promise<DomainEvent[]> {
    const rows = await this.db('events')
      .where('aggregate_id', aggregateId)
      .orderBy('version', 'asc');

    return rows.map(row => this.deserializeEvent(row));
  }

  async *getAllEvents(afterPosition = 0): AsyncGenerator<DomainEvent> {
    let position = afterPosition;

    while (true) {
      const rows = await this.db('events')
        .where('id', '>', position)
        .orderBy('id', 'asc')
        .limit(100);

      if (rows.length === 0) break;

      for (const row of rows) {
        yield this.deserializeEvent(row);
        position = row.id;
      }
    }
  }

  private deserializeEvent(row: any): DomainEvent {
    const eventClass = eventRegistry.get(row.event_type);
    return eventClass.fromJSON(row.data);
  }
}

// 仓储模式
class OrderRepository {
  constructor(private eventStore: EventStore) {}

  async findById(id: string): Promise<Order | null> {
    const events = await this.eventStore.getEvents(id);

    if (events.length === 0) {
      return null;
    }

    return Order.rehydrate(id, events);
  }

  async save(order: Order): Promise<void> {
    const uncommitted = order.getUncommittedEvents();

    if (uncommitted.length === 0) return;

    await this.eventStore.append(
      order.id,
      uncommitted,
      order.version - uncommitted.length
    );

    order.markCommitted();
  }
}
```

#### CQRS（命令查询职责分离）

```typescript
// CQRS实现

// 命令端（写模型）
namespace Command {
  // 命令基类
  abstract class Command {
    constructor(public readonly commandId: string = generateUUID()) {}
  }

  export class CreateOrderCommand extends Command {
    constructor(
      public readonly userId: string,
      public readonly items: OrderItem[]
    ) {
      super();
    }
  }

  export class PayOrderCommand extends Command {
    constructor(
      public readonly orderId: string,
      public readonly paymentId: string,
      public readonly amount: number
    ) {
      super();
    }
  }

  // 命令处理器
  export class OrderCommandHandler {
    constructor(
      private orderRepository: OrderRepository,
      private eventPublisher: EventPublisher
    ) {}

    async handleCreateOrder(cmd: CreateOrderCommand): Promise<string> {
      const orderId = generateUUID();

      const order = Order.create(
        orderId,
        cmd.userId,
        cmd.items
      );

      await this.orderRepository.save(order);

      // 发布领域事件
      for (const event of order.getUncommittedEvents()) {
        await this.eventPublisher.publish(event);
      }

      return orderId;
    }

    async handlePayOrder(cmd: PayOrderCommand): Promise<void> {
      const order = await this.orderRepository.findById(cmd.orderId);

      if (!order) {
        throw new Error('Order not found');
      }

      order.pay(cmd.paymentId, cmd.amount);

      await this.orderRepository.save(order);

      for (const event of order.getUncommittedEvents()) {
        await this.eventPublisher.publish(event);
      }
    }
  }
}

// 查询端（读模型）
namespace Query {
  // 查询DTO
  export interface OrderDTO {
    id: string;
    userId: string;
    items: Array<{
      productId: string;
      name: string;
      quantity: number;
      price: number;
    }>;
    total: number;
    status: string;
    createdAt: Date;
    paidAt?: Date;
    shippedAt?: Date;
  }

  // 查询对象
  export class GetOrderQuery {
    constructor(public readonly orderId: string) {}
  }

  export class ListUserOrdersQuery {
    constructor(
      public readonly userId: string,
      public readonly page: number = 1,
      public readonly pageSize: number = 20
    ) {}
  }

  // 查询处理器
  export class OrderQueryHandler {
    constructor(private readDb: ReadDatabase) {}

    async handleGetOrder(query: GetOrderQuery): Promise<OrderDTO | null> {
      // 直接从读模型查询，优化查询性能
      return this.readDb.queryOne<OrderDTO>(`
        SELECT o.*,
               json_agg(oi.*) as items
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE o.id = $1
        GROUP BY o.id
      `, [query.orderId]);
    }

    async handleListUserOrders(
      query: ListUserOrdersQuery
    ): Promise<PaginatedResult<OrderDTO>> {
      const offset = (query.page - 1) * query.pageSize;

      const [orders, total] = await Promise.all([
        this.readDb.query<OrderDTO>(`
          SELECT * FROM orders
          WHERE user_id = $1
          ORDER BY created_at DESC
          LIMIT $2 OFFSET $3
        `, [query.userId, query.pageSize, offset]),

        this.readDb.queryOne<{ count: number }>(`
          SELECT COUNT(*) as count FROM orders WHERE user_id = $1
        `, [query.userId])
      ]);

      return {
        data: orders,
        total: total!.count,
        page: query.page,
        pageSize: query.pageSize,
      };
    }
  }
}

// 投影（事件处理器，同步读写模型）
class OrderProjection {
  constructor(private readDb: ReadDatabase) {}

  async handleOrderCreated(event: OrderCreatedEvent): Promise<void> {
    await this.readDb.execute(`
      INSERT INTO orders (id, user_id, total, status, created_at)
      VALUES ($1, $2, $3, 'pending', $4)
    `, [event.aggregateId, event.userId, event.total, event.timestamp]);

    // 插入订单项
    for (const item of event.items) {
      await this.readDb.execute(`
        INSERT INTO order_items (order_id, product_id, name, quantity, price)
        VALUES ($1, $2, $3, $4, $5)
      `, [event.aggregateId, item.productId, item.name, item.quantity, item.price]);
    }
  }

  async handleOrderPaid(event: OrderPaidEvent): Promise<void> {
    await this.readDb.execute(`
      UPDATE orders
      SET status = 'paid', paid_at = $1
      WHERE id = $2
    `, [event.timestamp, event.aggregateId]);
  }

  async handleOrderShipped(event: OrderShippedEvent): Promise<void> {
    await this.readDb.execute(`
      UPDATE orders
      SET status = 'shipped', shipped_at = $1, tracking_number = $2, carrier = $3
      WHERE id = $4
    `, [event.timestamp, event.trackingNumber, event.carrier, event.aggregateId]);
  }
}

// 同步机制
class ReadModelSynchronizer {
  constructor(
    private eventStore: EventStore,
    private projections: OrderProjection[],
    private checkpointStore: CheckpointStore
  ) {}

  async start(): Promise<void> {
    const checkpoint = await this.checkpointStore.get('order_projection');

    // 从上次检查点开始处理事件
    for await (const event of this.eventStore.getAllEvents(checkpoint)) {
      await this.handleEvent(event);
      await this.checkpointStore.save('order_projection', event.eventId);
    }
  }

  private async handleEvent(event: DomainEvent): Promise<void> {
    for (const projection of this.projections) {
      const handler = projection[`handle${event.constructor.name}`];
      if (handler) {
        await handler.call(projection, event);
      }
    }
  }
}
```

#### 反例：错误的事件驱动设计

```typescript
// ❌ 错误：在事件处理器中直接修改聚合状态
class WrongEventHandler {
  async handleOrderCreated(event: OrderCreatedEvent): Promise<void> {
    // 错误：直接修改数据库，绕过领域模型
    await this.db.execute(`
      INSERT INTO orders (id, user_id, status)
      VALUES (?, ?, 'pending')
    `, [event.aggregateId, event.userId]);

    // 问题：业务逻辑散落在各处，无法保证一致性
  }
}

// ❌ 错误：循环依赖的事件
class CircularEventDependency {
  async handleUserCreated(event: UserCreatedEvent): Promise<void> {
    await this.createDefaultOrder(event.userId);
  }

  async createDefaultOrder(userId: string): Promise<void> {
    const order = await this.orderService.create(userId, []);
    // 发布OrderCreated事件

    // 问题：如果OrderCreated又触发User更新，形成循环
  }
}

// ❌ 错误：缺少事件版本控制
class NoEventVersioning {
  // 事件结构变化会导致反序列化失败
  async deserializeEvent(data: string): Promise<DomainEvent> {
    return JSON.parse(data) as DomainEvent;
    // 问题：没有版本号，无法处理事件演化
  }
}
```

---

### 2.4 流处理（Reactive Streams）

```typescript
// Reactive Streams实现

import {
  Observable,
  Observer,
  Subject,
  BehaviorSubject,
  ReplaySubject,
  AsyncSubject,
  from,
  of,
  interval,
  timer,
  fromEvent,
  merge,
  combineLatest,
  zip,
  forkJoin,
} from 'rxjs';
import {
  map,
  filter,
  reduce,
  scan,
  debounceTime,
  throttleTime,
  distinctUntilChanged,
  bufferTime,
  bufferCount,
  switchMap,
  mergeMap,
  concatMap,
  exhaustMap,
  catchError,
  retry,
  retryWhen,
  delay,
  take,
  takeUntil,
  share,
  shareReplay,
  publish,
  refCount,
  multicast,
} from 'rxjs/operators';

// 背压处理
class BackpressureHandler {
  // 1. 节流（Throttle）
  createThrottledStream<T>(
    source: Observable<T>,
    intervalMs: number
  ): Observable<T> {
    return source.pipe(
      throttleTime(intervalMs)
    );
  }

  // 2. 防抖（Debounce）
  createDebouncedStream<T>(
    source: Observable<T>,
    delayMs: number
  ): Observable<T> {
    return source.pipe(
      debounceTime(delayMs)
    );
  }

  // 3. 缓冲（Buffer）
  createBufferedStream<T>(
    source: Observable<T>,
    bufferSize: number
  ): Observable<T[]> {
    return source.pipe(
      bufferCount(bufferSize)
    );
  }

  // 4. 时间窗口缓冲
  createTimeBufferedStream<T>(
    source: Observable<T>,
    windowMs: number
  ): Observable<T[]> {
    return source.pipe(
      bufferTime(windowMs)
    );
  }

  // 5. 采样
  createSampledStream<T>(
    source: Observable<T>,
    sampler: Observable<any>
  ): Observable<T> {
    return source.pipe(
      sample(sampler)
    );
  }
}

// 实时数据流处理
class RealtimeStreamProcessor {
  // 传感器数据流处理
  processSensorData(sensorStream: Observable<SensorReading>): Observable<ProcessedData> {
    return sensorStream.pipe(
      // 过滤异常值
      filter(reading => this.isValidReading(reading)),

      // 去重
      distinctUntilChanged((a, b) =>
        a.value === b.value && a.sensorId === b.sensorId
      ),

      // 滑动窗口平均
      scan((acc, reading) => {
        acc.push(reading);
        if (acc.length > 10) acc.shift();
        return acc;
      }, [] as SensorReading[]),

      // 计算移动平均
      map(readings => ({
        sensorId: readings[0].sensorId,
        average: readings.reduce((sum, r) => sum + r.value, 0) / readings.length,
        timestamp: new Date(),
        sampleCount: readings.length,
      })),

      // 错误处理
      catchError((error, caught) => {
        console.error('Stream error:', error);
        return caught; // 重启流
      }),

      // 共享订阅
      shareReplay(1)
    );
  }

  // 合并多个传感器流
  mergeSensorStreams(
    streams: Observable<SensorReading>[]
  ): Observable<AggregatedData> {
    return combineLatest(streams).pipe(
      map(readings => ({
        timestamp: new Date(),
        readings: readings.reduce((acc, r) => {
          acc[r.sensorId] = r.value;
          return acc;
        }, {} as Record<string, number>),
        average: readings.reduce((sum, r) => sum + r.value, 0) / readings.length,
      }))
    );
  }

  // 流控：处理慢消费者
  createControlledStream<T>(
    source: Observable<T>,
    maxConcurrency: number
  ): Observable<T> {
    return source.pipe(
      // concatMap保证顺序，限制并发
      concatMap(async (item) => {
        await this.processItem(item);
        return item;
      })
    );
  }

  // 使用exhaustMap忽略新请求直到当前完成
  createExhaustedStream<T, R>(
    trigger: Observable<T>,
    processor: (value: T) => Promise<R>
  ): Observable<R> {
    return trigger.pipe(
      exhaustMap(value => from(processor(value)))
    );
  }

  // 使用switchMap取消之前的请求
  createSwitchingStream<T, R>(
    trigger: Observable<T>,
    processor: (value: T) => Observable<R>
  ): Observable<R> {
    return trigger.pipe(
      switchMap(value => processor(value))
    );
  }
}

// WebSocket流处理
class WebSocketStreamManager {
  private messageSubject = new Subject<WebSocketMessage>();
  private connectionStatus = new BehaviorSubject<ConnectionStatus>('disconnected');

  constructor(private wsUrl: string) {}

  connect(): void {
    const ws = new WebSocket(this.wsUrl);

    fromEvent(ws, 'open').subscribe(() => {
      this.connectionStatus.next('connected');
    });

    fromEvent(ws, 'close').subscribe(() => {
      this.connectionStatus.next('disconnected');
      // 自动重连
      timer(5000).subscribe(() => this.connect());
    });

    fromEvent<MessageEvent>(ws, 'message').subscribe(event => {
      try {
        const message = JSON.parse(event.data);
        this.messageSubject.next(message);
      } catch (error) {
        console.error('Failed to parse message:', error);
      }
    });
  }

  // 订阅特定类型的消息
  subscribeToMessageType<T>(type: string): Observable<T> {
    return this.messageSubject.pipe(
      filter(msg => msg.type === type),
      map(msg => msg.payload as T),
      share() // 共享订阅，避免重复处理
    );
  }

  // 带重连的消息流
  getReliableMessageStream<T>(type: string): Observable<T> {
    return this.subscribeToMessageType<T>(type).pipe(
      retryWhen(errors =>
        errors.pipe(
          tap(error => console.log('Stream error, retrying...', error)),
          delay(1000),
          take(5) // 最多重试5次
        )
      )
    );
  }
}

// Node.js流集成
import { Transform, Readable, Writable } from 'stream';
import { fromReadableStream, fromWritableStream } from 'rxjs/stream';

class NodeStreamIntegration {
  // 将Node.js Readable转换为Observable
  createObservableFromStream<T>(
    stream: Readable
  ): Observable<T> {
    return fromReadableStream<T>(stream);
  }

  // 将Observable转换为Node.js Writable
  createStreamFromObservable<T>(
    source: Observable<T>
  ): Writable {
    return new Writable({
      objectMode: true,
      write(chunk, encoding, callback) {
        // 处理数据
        callback();
      }
    });
  }

  // 转换流
  createTransformStream<T, R>(
    transformFn: (chunk: T) => R
  ): Transform {
    return new Transform({
      objectMode: true,
      transform(chunk, encoding, callback) {
        try {
          const result = transformFn(chunk);
          callback(null, result);
        } catch (error) {
          callback(error as Error);
        }
      }
    });
  }

  // 管道操作
  async pipeThroughTransform(
    source: Readable,
    transforms: Transform[],
    destination: Writable
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      let pipeline = source;

      for (const transform of transforms) {
        pipeline = pipeline.pipe(transform);
      }

      pipeline
        .pipe(destination)
        .on('finish', resolve)
        .on('error', reject);
    });
  }
}
```

---


## 3. 服务架构模式

### 3.1 微服务架构

#### 定义与形式化

微服务架构将应用拆分为一组小型、自治的服务，每个服务围绕业务能力构建。

**形式化定义：**

设系统为 $S$，微服务集合为 $M = \{m_1, m_2, ..., m_n\}$，满足：

1. **单一职责**: $\forall m_i \in M: |responsibilities(m_i)| = 1$
2. **独立部署**: $\forall m_i, m_j \in M: deploy(m_i) \perp deploy(m_j)$
3. **松耦合**: $coupling(m_i, m_j) < \epsilon$ for $i \neq j$
4. **高内聚**: $cohesion(m_i) > \delta$

```typescript
// 微服务架构实现框架

// 1. 服务拆分策略

namespace ServiceDecomposition {
  // 按业务能力拆分（DDD限界上下文）
  interface BoundedContext {
    name: string;
    domain: string;
    aggregates: Aggregate[];
    services: DomainService[];
    events: DomainEvent[];
  }

  // 电商系统限界上下文
  const ecommerceContexts: BoundedContext[] = [
    {
      name: 'UserContext',
      domain: '用户域',
      aggregates: ['User', 'UserProfile', 'Address'],
      services: ['UserService', 'AuthenticationService'],
      events: ['UserRegistered', 'UserProfileUpdated']
    },
    {
      name: 'OrderContext',
      domain: '订单域',
      aggregates: ['Order', 'OrderItem'],
      services: ['OrderService', 'OrderQueryService'],
      events: ['OrderCreated', 'OrderPaid', 'OrderShipped']
    },
    {
      name: 'InventoryContext',
      domain: '库存域',
      aggregates: ['Product', 'Stock', 'Warehouse'],
      services: ['InventoryService', 'StockQueryService'],
      events: ['StockChanged', 'LowStockAlert']
    },
    {
      name: 'PaymentContext',
      domain: '支付域',
      aggregates: ['Payment', 'Refund', 'Transaction'],
      services: ['PaymentService', 'RefundService'],
      events: ['PaymentSucceeded', 'PaymentFailed', 'RefundProcessed']
    }
  ];

  // 拆分解耦分析
  function analyzeCoupling(contexts: BoundedContext[]): CouplingMatrix {
    const matrix: CouplingMatrix = {};

    for (const ctx of contexts) {
      matrix[ctx.name] = {};

      for (const other of contexts) {
        if (ctx.name === other.name) continue;

        // 计算耦合度
        const sharedEvents = ctx.events.filter(e =>
          other.events.includes(e)
        ).length;

        const sharedAggregates = ctx.aggregates.filter(a =>
          other.aggregates.includes(a)
        ).length;

        matrix[ctx.name][other.name] = {
          eventCoupling: sharedEvents,
          aggregateCoupling: sharedAggregates,
          total: sharedEvents + sharedAggregates * 2
        };
      }
    }

    return matrix;
  }
}

// 2. 服务注册与发现

interface ServiceInstance {
  id: string;
  name: string;
  host: string;
  port: number;
  metadata: Record<string, string>;
  health: 'healthy' | 'unhealthy' | 'unknown';
  lastHeartbeat: Date;
}

interface ServiceRegistry {
  register(instance: ServiceInstance): Promise<void>;
  deregister(instanceId: string): Promise<void>;
  discover(serviceName: string): Promise<ServiceInstance[]>;
  watch(serviceName: string, callback: (instances: ServiceInstance[]) => void): void;
}

// Consul实现
class ConsulServiceRegistry implements ServiceRegistry {
  private consul: any;
  private watchers = new Map<string, any>();

  constructor(config: { host: string; port: number }) {
    this.consul = require('consul')(config);
  }

  async register(instance: ServiceInstance): Promise<void> {
    await this.consul.agent.service.register({
      id: instance.id,
      name: instance.name,
      tags: Object.entries(instance.metadata).map(([k, v]) => `${k}:${v}`),
      port: instance.port,
      check: {
        http: `http://${instance.host}:${instance.port}/health`,
        interval: '10s',
        timeout: '5s',
        deregistercriticalserviceafter: '30s'
      }
    });

    // 发送心跳
    this.startHeartbeat(instance.id);
  }

  async deregister(instanceId: string): Promise<void> {
    await this.consul.agent.service.deregister(instanceId);
  }

  async discover(serviceName: string): Promise<ServiceInstance[]> {
    const services = await this.consul.health.service(serviceName);

    return services[0].map((s: any) => ({
      id: s.Service.ID,
      name: s.Service.Service,
      host: s.Service.Address,
      port: s.Service.Port,
      metadata: s.Service.Tags.reduce((acc: any, tag: string) => {
        const [k, v] = tag.split(':');
        acc[k] = v;
        return acc;
      }, {}),
      health: s.Checks.every((c: any) => c.Status === 'passing')
        ? 'healthy'
        : 'unhealthy',
      lastHeartbeat: new Date()
    }));
  }

  watch(serviceName: string, callback: (instances: ServiceInstance[]) => void): void {
    const watcher = this.consul.watch({
      method: this.consul.health.service,
      options: { service: serviceName }
    });

    watcher.on('change', (data: any) => {
      const instances = data.map((s: any) => ({
        id: s.Service.ID,
        name: s.Service.Service,
        host: s.Service.Address,
        port: s.Service.Port,
        health: s.Checks.every((c: any) => c.Status === 'passing')
          ? 'healthy'
          : 'unhealthy',
        lastHeartbeat: new Date()
      }));

      callback(instances);
    });

    this.watchers.set(serviceName, watcher);
  }

  private startHeartbeat(instanceId: string): void {
    setInterval(async () => {
      try {
        await this.consul.agent.check.pass(`service:${instanceId}`);
      } catch (error) {
        console.error('Heartbeat failed:', error);
      }
    }, 5000);
  }
}

// Etcd实现（更轻量）
class EtcdServiceRegistry implements ServiceRegistry {
  private etcd: any;

  constructor(config: { endpoints: string[] }) {
    const { Etcd3 } = require('etcd3');
    this.etcd = new Etcd3({ endpoints: config.endpoints });
  }

  async register(instance: ServiceInstance): Promise<void> {
    const key = `/services/${instance.name}/${instance.id}`;
    const value = JSON.stringify(instance);

    // 带租约注册（自动过期）
    const lease = this.etcd.lease(30); // 30秒租约
    await lease.put(key).value(value);

    // 保持租约
    lease.on('lost', () => {
      console.warn('Lease lost, re-registering...');
      this.register(instance);
    });
  }

  async discover(serviceName: string): Promise<ServiceInstance[]> {
    const key = `/services/${serviceName}/`;
    const values = await this.etcd.getAll().prefix(key);

    return Object.values(values).map(v => JSON.parse(v as string));
  }

  watch(serviceName: string, callback: (instances: ServiceInstance[]) => void): void {
    const key = `/services/${serviceName}/`;
    const watcher = this.etcd.watch().prefix(key);

    watcher.on('put', async () => {
      const instances = await this.discover(serviceName);
      callback(instances);
    });

    watcher.on('delete', async () => {
      const instances = await this.discover(serviceName);
      callback(instances);
    });
  }

  async deregister(instanceId: string): Promise<void> {
    await this.etcd.delete().key(instanceId);
  }
}

// 3. 客户端负载均衡

interface LoadBalancer {
  select(instances: ServiceInstance[]): ServiceInstance;
}

// 轮询
class RoundRobinBalancer implements LoadBalancer {
  private currentIndex = 0;

  select(instances: ServiceInstance[]): ServiceInstance {
    const healthy = instances.filter(i => i.health === 'healthy');
    if (healthy.length === 0) throw new Error('No healthy instances');

    const instance = healthy[this.currentIndex % healthy.length];
    this.currentIndex++;
    return instance;
  }
}

// 随机
class RandomBalancer implements LoadBalancer {
  select(instances: ServiceInstance[]): ServiceInstance {
    const healthy = instances.filter(i => i.health === 'healthy');
    if (healthy.length === 0) throw new Error('No healthy instances');

    return healthy[Math.floor(Math.random() * healthy.length)];
  }
}

// 加权轮询
class WeightedRoundRobinBalancer implements LoadBalancer {
  private currentIndex = 0;
  private currentWeight = 0;

  select(instances: ServiceInstance[]): ServiceInstance {
    const healthy = instances.filter(i => i.health === 'healthy');
    if (healthy.length === 0) throw new Error('No healthy instances');

    const maxWeight = Math.max(...healthy.map(i =>
      parseInt(i.metadata.weight || '1')
    ));

    while (true) {
      this.currentIndex = (this.currentIndex + 1) % healthy.length;
      if (this.currentIndex === 0) {
        this.currentWeight = this.currentWeight - this.gcd(healthy);
        if (this.currentWeight <= 0) {
          this.currentWeight = maxWeight;
        }
      }

      const instance = healthy[this.currentIndex];
      const weight = parseInt(instance.metadata.weight || '1');

      if (weight >= this.currentWeight) {
        return instance;
      }
    }
  }

  private gcd(instances: ServiceInstance[]): number {
    const weights = instances.map(i => parseInt(i.metadata.weight || '1'));
    return weights.reduce((a, b) => this.gcdTwo(a, b));
  }

  private gcdTwo(a: number, b: number): number {
    return b === 0 ? a : this.gcdTwo(b, a % b);
  }
}

// 一致性哈希
class ConsistentHashBalancer implements LoadBalancer {
  private ring = new Map<number, ServiceInstance>();
  private virtualNodes = 150;

  constructor(instances: ServiceInstance[]) {
    this.buildRing(instances);
  }

  select(instances: ServiceInstance[], key?: string): ServiceInstance {
    if (key) {
      const hash = this.hash(key);
      const sortedHashes = Array.from(this.ring.keys()).sort((a, b) => a - b);

      for (const h of sortedHashes) {
        if (h >= hash) {
          return this.ring.get(h)!;
        }
      }

      return this.ring.get(sortedHashes[0])!;
    }

    // 无key时使用轮询
    return new RoundRobinBalancer().select(instances);
  }

  private buildRing(instances: ServiceInstance[]): void {
    this.ring.clear();

    for (const instance of instances) {
      for (let i = 0; i < this.virtualNodes; i++) {
        const hash = this.hash(`${instance.id}:${i}`);
        this.ring.set(hash, instance);
      }
    }
  }

  private hash(key: string): number {
    // FNV-1a hash
    let hash = 2166136261;
    for (let i = 0; i < key.length; i++) {
      hash ^= key.charCodeAt(i);
      hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }
    return Math.abs(hash);
  }
}

// 4. API网关

interface RouteConfig {
  path: string;
  method: string;
  service: string;
  rewrite?: string;
  middlewares?: string[];
  rateLimit?: RateLimitConfig;
  auth?: AuthConfig;
}

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyPrefix?: string;
}

interface AuthConfig {
  type: 'jwt' | 'oauth2' | 'apikey';
  required: boolean;
}

class APIGateway {
  private routes: RouteConfig[] = [];
  private middlewares = new Map<string, Middleware>();
  private serviceRegistry: ServiceRegistry;
  private loadBalancer: LoadBalancer;
  private rateLimiter: RateLimiter;

  constructor(config: GatewayConfig) {
    this.serviceRegistry = config.registry;
    this.loadBalancer = config.loadBalancer;
    this.rateLimiter = config.rateLimiter;
  }

  addRoute(config: RouteConfig): void {
    this.routes.push(config);
  }

  registerMiddleware(name: string, middleware: Middleware): void {
    this.middlewares.set(name, middleware);
  }

  // Express中间件
  middleware() {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        // 1. 路由匹配
        const route = this.matchRoute(req.path, req.method);
        if (!route) {
          return res.status(404).json({ error: 'Route not found' });
        }

        // 2. 认证
        if (route.auth?.required) {
          const authResult = await this.authenticate(req, route.auth);
          if (!authResult.success) {
            return res.status(401).json({ error: 'Unauthorized' });
          }
          req.user = authResult.user;
        }

        // 3. 限流
        if (route.rateLimit) {
          const allowed = await this.rateLimiter.check(
            this.getRateLimitKey(req, route.rateLimit),
            route.rateLimit
          );
          if (!allowed) {
            return res.status(429).json({ error: 'Too many requests' });
          }
        }

        // 4. 执行中间件
        for (const middlewareName of route.middlewares || []) {
          const middleware = this.middlewares.get(middlewareName);
          if (middleware) {
            await middleware(req, res);
          }
        }

        // 5. 服务发现
        const instances = await this.serviceRegistry.discover(route.service);
        if (instances.length === 0) {
          return res.status(503).json({ error: 'Service unavailable' });
        }

        // 6. 负载均衡
        const instance = this.loadBalancer.select(instances);

        // 7. 请求代理
        const targetUrl = this.buildTargetUrl(instance, req, route);
        await this.proxyRequest(req, res, targetUrl);

      } catch (error) {
        next(error);
      }
    };
  }

  private matchRoute(path: string, method: string): RouteConfig | undefined {
    return this.routes.find(r => {
      const pathMatch = this.matchPath(path, r.path);
      const methodMatch = r.method === '*' || r.method.toLowerCase() === method.toLowerCase();
      return pathMatch && methodMatch;
    });
  }

  private matchPath(requestPath: string, routePath: string): boolean {
    // 支持路径参数 /users/:id
    const routeRegex = new RegExp(
      '^' + routePath.replace(/:([^/]+)/g, '([^/]+)') + '$'
    );
    return routeRegex.test(requestPath);
  }

  private buildTargetUrl(
    instance: ServiceInstance,
    req: Request,
    route: RouteConfig
  ): string {
    let path = req.path;

    // 路径重写
    if (route.rewrite) {
      path = path.replace(new RegExp(route.path), route.rewrite);
    }

    return `http://${instance.host}:${instance.port}${path}`;
  }

  private async proxyRequest(
    req: Request,
    res: Response,
    targetUrl: string
  ): Promise<void> {
    const proxyReq = http.request(
      targetUrl,
      {
        method: req.method,
        headers: {
          ...req.headers,
          'x-forwarded-for': req.ip,
          'x-request-id': req.headers['x-request-id'] || generateUUID(),
        }
      },
      (proxyRes) => {
        res.status(proxyRes.statusCode!);
        for (const [key, value] of Object.entries(proxyRes.headers)) {
          if (value) res.setHeader(key, value);
        }
        proxyRes.pipe(res);
      }
    );

    req.pipe(proxyReq);
  }
}
```

#### 反例：错误的微服务设计

```typescript
// ❌ 错误：分布式单体（错误的拆分）
class DistributedMonolith {
  // 所有服务共享数据库
  // 服务间紧耦合，必须同时部署

  async createOrder(userId: string, items: Item[]): Promise<void> {
    // 跨多个服务的分布式事务
    await this.db.transaction(async (trx) => {
      await trx.insert('orders', { userId });  // Order服务
      await trx.update('inventory', items);     // Inventory服务
      await trx.insert('payments', { amount }); // Payment服务
    });
    // 问题：数据库紧耦合，无法独立部署
  }
}

// ❌ 错误：循环依赖
class CircularDependency {
  // Order服务调用User服务
  // User服务又调用Order服务

  // OrderService
  async getOrderWithUser(orderId: string): Promise<Order> {
    const order = await this.orderRepo.find(orderId);
    order.user = await this.userService.getUser(order.userId);
    return order;
  }

  // UserService
  async getUserWithOrders(userId: string): Promise<User> {
    const user = await this.userRepo.find(userId);
    user.orders = await this.orderService.getUserOrders(userId);
    return user;
  }
}

// ❌ 错误：共享库过度耦合
class SharedLibraryCoupling {
  // 所有服务依赖同一个共享库
  // 修改共享库需要同时更新所有服务

  import { User, Order, Payment } from '@company/shared-models';
  import { BaseService, BaseRepository } from '@company/shared-core';

  // 问题：共享库变更导致级联更新
}
```

---

### 3.2 服务网格（Service Mesh）

#### 定义与原理

服务网格是一个专用的基础设施层，用于处理服务间的通信，无需修改应用代码。

**架构：**

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Service   │     │   Service   │     │   Service   │
│     A       │     │     B       │     │     C       │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
┌──────▼──────┐     ┌──────▼──────┐     ┌──────▼──────┐
│   Sidecar   │◄────┤   Sidecar   │◄────┤   Sidecar   │
│  (Envoy)    │     │  (Envoy)    │     │  (Envoy)    │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       └───────────────────┴───────────────────┘
                           │
                    ┌──────▼──────┐
                    │  Control    │
                    │   Plane     │
                    │ (Istio/     │
                    │  Linkerd)   │
                    └─────────────┘
```

```typescript
// 服务网格的TypeScript抽象

// Sidecar代理接口
interface SidecarProxy {
  // 流量管理
  routeTraffic(request: IncomingRequest): OutgoingRequest;

  // 安全
  handleMTLS(connection: Connection): SecureConnection;

  // 可观测性
  reportMetrics(metrics: TrafficMetrics): void;
  emitTrace(span: TraceSpan): void;

  // 弹性
  applyCircuitBreaker(request: Request): Promise<Response>;
  applyRetry(request: Request): Promise<Response>;
  applyTimeout(request: Request): Promise<Response>;
}

// 数据平面配置
interface DataPlaneConfig {
  proxy: {
    port: number;
    adminPort: number;
  };
  listeners: ListenerConfig[];
  clusters: ClusterConfig[];
  routes: RouteConfig[];
}

interface ListenerConfig {
  name: string;
  address: string;
  port: number;
  filters: FilterConfig[];
}

interface ClusterConfig {
  name: string;
  type: 'static' | 'strict_dns' | 'logical_dns' | 'eds';
  endpoints: EndpointConfig[];
  healthChecks?: HealthCheckConfig;
  circuitBreaker?: CircuitBreakerConfig;
}

// 控制平面接口
interface ControlPlane {
  // 服务发现
  getServiceEndpoints(serviceName: string): Promise<Endpoint[]>;

  // 配置分发
  pushConfig(proxyId: string, config: DataPlaneConfig): Promise<void>;

  // 证书管理
  issueCertificate(identity: string): Promise<Certificate>;
  rotateCertificate(cert: Certificate): Promise<Certificate>;

  // 策略执行
  checkPolicy(request: Request, policy: Policy): Promise<Decision>;
}

// Istio风格的配置
namespace IstioConfig {
  // VirtualService: 流量路由
  interface VirtualService {
    apiVersion: 'networking.istio.io/v1beta1';
    kind: 'VirtualService';
    metadata: {
      name: string;
      namespace: string;
    };
    spec: {
      hosts: string[];
      gateways?: string[];
      http: HTTPRoute[];
    };
  }

  interface HTTPRoute {
    match?: HTTPMatchRequest[];
    route: HTTPRouteDestination[];
    redirect?: HTTPRedirect;
    rewrite?: HTTPRewrite;
    retries?: HTTPRetry;
    timeout?: string;
    fault?: HTTPFaultInjection;
  }

  // DestinationRule: 流量策略
  interface DestinationRule {
    apiVersion: 'networking.istio.io/v1beta1';
    kind: 'DestinationRule';
    metadata: {
      name: string;
      namespace: string;
    };
    spec: {
      host: string;
      trafficPolicy?: TrafficPolicy;
      subsets?: Subset[];
    };
  }

  interface TrafficPolicy {
    connectionPool?: ConnectionPoolSettings;
    loadBalancer?: LoadBalancerSettings;
    outlierDetection?: OutlierDetection;
    tls?: TLSSettings;
  }

  // 使用示例
  export const userServiceVirtualService: VirtualService = {
    apiVersion: 'networking.istio.io/v1beta1',
    kind: 'VirtualService',
    metadata: {
      name: 'user-service',
      namespace: 'default'
    },
    spec: {
      hosts: ['user-service'],
      http: [
        {
          match: [
            {
              headers: {
                'x-canary': {
                  exact: 'true'
                }
              }
            }
          ],
          route: [
            {
              destination: {
                host: 'user-service',
                subset: 'v2'
              },
              weight: 100
            }
          ]
        },
        {
          route: [
            {
              destination: {
                host: 'user-service',
                subset: 'v1'
              },
              weight: 90
            },
            {
              destination: {
                host: 'user-service',
                subset: 'v2'
              },
              weight: 10
            }
          ],
          retries: {
            attempts: 3,
            perTryTimeout: '2s',
            retryOn: 'gateway-error,connect-failure,refused-stream'
          },
          timeout: '10s'
        }
      ]
    }
  };

  export const userServiceDestinationRule: DestinationRule = {
    apiVersion: 'networking.istio.io/v1beta1',
    kind: 'DestinationRule',
    metadata: {
      name: 'user-service',
      namespace: 'default'
    },
    spec: {
      host: 'user-service',
      trafficPolicy: {
        connectionPool: {
          tcp: {
            maxConnections: 100
          },
          http: {
            http1MaxPendingRequests: 50,
            http2MaxRequests: 100
          }
        },
        outlierDetection: {
          consecutive5xxErrors: 5,
          interval: '30s',
          baseEjectionTime: '30s'
        },
        tls: {
          mode: 'ISTIO_MUTUAL'
        }
      },
      subsets: [
        {
          name: 'v1',
          labels: {
            version: 'v1'
          }
        },
        {
          name: 'v2',
          labels: {
            version: 'v2'
          }
        }
      ]
    }
  };
}

// Node.js中的Sidecar模式实现
class NodeSidecar implements SidecarProxy {
  private config: DataPlaneConfig;
  private circuitBreakers = new Map<string, CircuitBreaker>();

  constructor(private controlPlane: ControlPlane) {}

  async start(): Promise<void> {
    // 从控制平面获取初始配置
    this.config = await this.fetchConfig();

    // 启动代理服务器
    this.startProxyServer();

    // 监听配置更新
    this.watchConfigUpdates();
  }

  routeTraffic(request: IncomingRequest): OutgoingRequest {
    // 1. 匹配路由规则
    const route = this.matchRoute(request);

    // 2. 应用流量分割
    const destination = this.selectDestination(route);

    // 3. 构建出站请求
    return {
      ...request,
      targetHost: destination.host,
      targetPort: destination.port,
      headers: {
        ...request.headers,
        'x-envoy-original-path': request.path,
        'x-request-id': generateUUID(),
      }
    };
  }

  async applyCircuitBreaker(request: Request): Promise<Response> {
    const serviceName = this.getServiceName(request);

    if (!this.circuitBreakers.has(serviceName)) {
      this.circuitBreakers.set(
        serviceName,
        new CircuitBreaker({
          failureThreshold: 5,
          resetTimeout: 30000,
          halfOpenRequests: 3
        })
      );
    }

    const cb = this.circuitBreakers.get(serviceName)!;
    return cb.execute(() => this.forwardRequest(request));
  }

  emitTrace(span: TraceSpan): void {
    // 发送到Jaeger/Zipkin
    const trace = {
      traceId: span.traceId,
      spanId: span.spanId,
      parentSpanId: span.parentSpanId,
      operationName: span.operationName,
      startTime: span.startTime,
      duration: span.duration,
      tags: span.tags,
      logs: span.logs,
    };

    // 异步发送，不阻塞请求
    this.sendTraceAsync(trace);
  }

  private async sendTraceAsync(trace: TraceData): Promise<void> {
    try {
      await fetch('http://jaeger-collector:14268/api/traces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trace),
      });
    } catch (error) {
      // 追踪失败不应影响主流程
      console.warn('Failed to send trace:', error);
    }
  }
}

// 轻量级服务网格（纯Node.js）
class LightweightServiceMesh {
  private proxies = new Map<string, NodeSidecar>();

  injectSidecar(serviceName: string, servicePort: number): number {
    const sidecarPort = this.allocatePort();

    const sidecar = new NodeSidecar(this.controlPlane);
    sidecar.start();

    this.proxies.set(serviceName, sidecar);

    // 返回Sidecar端口，服务应监听此端口
    return sidecarPort;
  }

  configureTrafficSplit(
    service: string,
    splits: Array<{ version: string; weight: number }>
  ): void {
    // 更新VirtualService配置
    const config = this.generateVirtualService(service, splits);
    this.controlPlane.applyConfig(config);
  }

  configureMTLS(service: string): void {
    // 为服务启用mTLS
    const cert = this.controlPlane.issueCertificate(service);
    this.proxies.get(service)?.configureTLS(cert);
  }
}
```

---

### 3.3 Serverless架构

#### 定义与原理

Serverless是一种云计算执行模型，云提供商动态管理计算资源的分配和扩展。

**形式化模型：**

$$Function(f, event) \to \{provision, execute, scale\} \to Result$$

```typescript
// FaaS（函数即服务）实现

// 1. 函数定义
interface ServerlessFunction {
  // 函数配置
  config: FunctionConfig;

  // 处理函数
  handler: (event: any, context: FunctionContext) => Promise<any>;
}

interface FunctionConfig {
  name: string;
  runtime: 'nodejs18' | 'nodejs16' | 'python3.9' | 'java11';
  memory: number; // MB
  timeout: number; // seconds
  environment: Record<string, string>;
  triggers: TriggerConfig[];
  vpc?: VPCConfig;
}

interface FunctionContext {
  functionName: string;
  memoryLimitInMB: number;
  invokedFunctionArn: string;
  awsRequestId: string;
  logGroupName: string;
  logStreamName: string;
  identity?: CognitoIdentity;
  clientContext?: ClientContext;

  // 方法
  getRemainingTimeInMillis(): number;
  done(error?: Error, result?: any): void;
  fail(error: Error): void;
  succeed(result: any): void;
}

// AWS Lambda风格实现
namespace LambdaFunctions {
  // HTTP触发函数
  export const httpHandler = async (
    event: APIGatewayEvent,
    context: FunctionContext
  ): Promise<APIGatewayProxyResult> => {
    console.log('Request ID:', context.awsRequestId);

    try {
      const { httpMethod, path, body, headers } = event;

      // 路由处理
      if (path === '/users' && httpMethod === 'GET') {
        const users = await getUsers();
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'max-age=3600'
          },
          body: JSON.stringify(users)
        };
      }

      if (path === '/users' && httpMethod === 'POST') {
        const userData = JSON.parse(body || '{}');
        const user = await createUser(userData);

        return {
          statusCode: 201,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(user)
        };
      }

      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Not found' })
      };

    } catch (error) {
      console.error('Error:', error);

      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Internal server error',
          requestId: context.awsRequestId
        })
      };
    }
  };

  // 事件触发函数
  export const eventHandler = async (
    event: SQSEvent | SNSEvent | EventBridgeEvent,
    context: FunctionContext
  ): Promise<void> => {
    // 批量处理SQS消息
    if ('Records' in event && event.Records[0]?.eventSource === 'aws:sqs') {
      const sqsEvent = event as SQSEvent;

      for (const record of sqsEvent.Records) {
        try {
          const message = JSON.parse(record.body);
          await processMessage(message);

          // 消息处理成功，自动删除
        } catch (error) {
          console.error('Failed to process message:', record.messageId, error);

          // 抛出错误使消息进入死信队列
          throw error;
        }
      }
    }

    // 处理SNS通知
    if ('Records' in event && event.Records[0]?.EventSource === 'aws:sns') {
      const snsEvent = event as SNSEvent;

      for (const record of snsEvent.Records) {
        const message = JSON.parse(record.Sns.Message);
        await processNotification(message);
      }
    }
  };

  // 定时触发函数
  export const scheduledHandler = async (
    event: ScheduledEvent,
    context: FunctionContext
  ): Promise<void> => {
    console.log('Scheduled event:', event.time);

    // 执行定时任务
    await cleanupExpiredData();
    await generateDailyReport();
    await syncExternalData();
  };
}

// 2. 冷启动优化

class ColdStartOptimizer {
  // 预置并发
  async provisionedConcurrency(
    functionName: string,
    count: number
  ): Promise<void> {
    // 保持指定数量的函数实例预热
    await this.lambda.putProvisionedConcurrencyConfig({
      FunctionName: functionName,
      ProvisionedConcurrentExecutions: count
    });
  }

  // 初始化优化
  static optimizeInitialization() {
    // 将初始化代码移到handler外部
    // ❌ 错误：在handler内初始化
    // export const handler = async (event) => {
    //   const db = await createConnection(); // 每次调用都创建
    //   ...
    // }

    // ✅ 正确：在模块级别初始化
    const dbConnection = createConnection(); // 只执行一次

    export const handler = async (event: any) => {
      const db = await dbConnection; // 复用连接
      ...
    };
  }

  // 依赖注入优化
  static optimizeDependencies() {
    // 延迟加载重型依赖
    let heavyModule: any;

    const getHeavyModule = async () => {
      if (!heavyModule) {
        heavyModule = await import('./heavy-module');
      }
      return heavyModule;
    };

    export const handler = async (event: any) => {
      // 只在需要时加载
      if (event.requiresHeavyProcessing) {
        const module = await getHeavyModule();
        await module.process(event);
      }
    };
  }

  // 连接池管理
  class ConnectionPool {
    private pool: any;
    private isInitialized = false;

    async initialize(): Promise<void> {
      if (this.isInitialized) return;

      this.pool = createPool({
        host: process.env.DB_HOST,
        max: 10,
        idleTimeoutMillis: 120000,
      });

      this.isInitialized = true;
    }

    async getConnection(): Promise<any> {
      await this.initialize();
      return this.pool.acquire();
    }

    async release(connection: any): Promise<void> {
      await this.pool.release(connection);
    }
  }

  const connectionPool = new ConnectionPool();
}

// 3. BaaS（后端即服务）集成

class BaaSIntegration {
  // Firebase风格
  constructor(private firebase: any) {}

  // 认证
  async authenticateUser(token: string): Promise<DecodedToken> {
    return this.firebase.auth().verifyIdToken(token);
  }

  // 数据库
  async getDocument(collection: string, docId: string): Promise<any> {
    const doc = await this.firebase
      .firestore()
      .collection(collection)
      .doc(docId)
      .get();

    return doc.exists ? doc.data() : null;
  }

  async queryCollection(
    collection: string,
    filters: QueryFilter[]
  ): Promise<any[]> {
    let query: any = this.firebase.firestore().collection(collection);

    for (const filter of filters) {
      query = query.where(filter.field, filter.op, filter.value);
    }

    const snapshot = await query.get();
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
  }

  // 实时订阅
  subscribeToCollection(
    collection: string,
    callback: (docs: any[]) => void
  ): () => void {
    return this.firebase
      .firestore()
      .collection(collection)
      .onSnapshot((snapshot: any) => {
        const docs = snapshot.docs.map((doc: any) => ({
          id: doc.id,
          ...doc.data()
        }));
        callback(docs);
      });
  }

  // 文件存储
  async uploadFile(path: string, data: Buffer): Promise<string> {
    const bucket = this.firebase.storage().bucket();
    const file = bucket.file(path);

    await file.save(data, {
      metadata: {
        contentType: 'application/octet-stream'
      }
    });

    // 获取公开URL
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 24 * 60 * 60 * 1000
    });

    return url;
  }

  // 云函数触发器
  createDatabaseTrigger(
    collection: string,
    handler: (change: Change<DocumentSnapshot>, context: EventContext) => Promise<void>
  ): CloudFunction {
    return this.firebase
      .functions()
      .firestore
      .document(`${collection}/{docId}`)
      .onWrite(handler);
  }
}

// 4. Serverless框架

class ServerlessFramework {
  // 基础设施即代码
  static generateSAMTemplate(config: ServiceConfig): object {
    return {
      AWSTemplateFormatVersion: '2010-09-09',
      Transform: 'AWS::Serverless-2016-10-31',
      Resources: {
        [config.name]: {
          Type: 'AWS::Serverless::Function',
          Properties: {
            Handler: config.handler,
            Runtime: config.runtime,
            CodeUri: config.codeUri,
            MemorySize: config.memory,
            Timeout: config.timeout,
            Environment: {
              Variables: config.environment
            },
            Events: config.triggers.map(trigger => ({
              [trigger.name]: {
                Type: trigger.type,
                Properties: trigger.properties
              }
            }))
          }
        }
      }
    };
  }

  // 本地开发模拟
  static createLocalEnvironment(): LocalLambdaEnvironment {
    return {
      invoke: async (functionName: string, event: any) => {
        const handler = require(`./${functionName}`).handler;
        const context = createMockContext();
        return handler(event, context);
      },

      startApi: (port: number) => {
        const app = express();

        // 模拟API Gateway
        app.all('/:functionName', async (req, res) => {
          const event = convertRequestToLambdaEvent(req);
          const result = await this.invoke(req.params.functionName, event);
          res.status(result.statusCode).json(JSON.parse(result.body));
        });

        app.listen(port);
      }
    };
  }
}
```

---

### 3.4 边缘计算

```typescript
// 边缘计算实现

// 1. CDN边缘函数

interface EdgeRequest {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: string;
  clientIp: string;
  geo: {
    country: string;
    region: string;
    city: string;
    latitude: number;
    longitude: number;
  };
}

interface EdgeResponse {
  status: number;
  headers: Record<string, string>;
  body: string | Uint8Array;
}

// Cloudflare Workers风格
namespace EdgeFunctions {
  // A/B测试
  export const abTestHandler = async (
    request: EdgeRequest
  ): Promise<EdgeResponse> => {
    const cookie = request.headers['cookie'] || '';
    const variant = cookie.includes('variant=B') ? 'B' : 'A';

    // 根据variant路由到不同源站
    const url = new URL(request.url);
    url.hostname = variant === 'A'
      ? 'origin-a.example.com'
      : 'origin-b.example.com';

    const response = await fetch(url.toString(), {
      method: request.method,
      headers: request.headers,
      body: request.body
    });

    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });

    // 设置variant cookie
    headers['set-cookie'] = `variant=${variant}; Path=/; Max-Age=86400`;

    return {
      status: response.status,
      headers,
      body: await response.text()
    };
  };

  // 地理路由
  export const geoRoutingHandler = async (
    request: EdgeRequest
  ): Promise<EdgeResponse> => {
    const { geo } = request;

    // 根据地理位置选择最近的源站
    const originMap: Record<string, string> = {
      'US': 'us-origin.example.com',
      'EU': 'eu-origin.example.com',
      'ASIA': 'asia-origin.example.com'
    };

    const region = getRegionFromCountry(geo.country);
    const origin = originMap[region] || originMap['US'];

    const url = new URL(request.url);
    url.hostname = origin;

    const response = await fetch(url.toString());

    return {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      body: await response.text()
    };
  };

  // 边缘缓存
  export const edgeCacheHandler = async (
    request: EdgeRequest
  ): Promise<EdgeResponse> => {
    const cacheKey = new Request(request.url);
    const cache = caches.default;

    // 尝试从边缘缓存获取
    let response = await cache.match(cacheKey);

    if (!response) {
      // 缓存未命中，回源获取
      response = await fetch(request.url);

      // 根据响应头设置缓存策略
      const cacheControl = response.headers.get('cache-control');
      if (cacheControl?.includes('public')) {
        // 克隆响应（因为响应只能读取一次）
        const cloned = response.clone();

        // 存入边缘缓存
        await cache.put(cacheKey, cloned);
      }
    }

    return {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      body: await response.text()
    };
  };

  // 边缘认证
  export const edgeAuthHandler = async (
    request: EdgeRequest
  ): Promise<EdgeResponse> => {
    const authHeader = request.headers['authorization'];

    if (!authHeader) {
      return {
        status: 401,
        headers: {
          'www-authenticate': 'Bearer'
        },
        body: JSON.stringify({ error: 'Unauthorized' })
      };
    }

    const token = authHeader.replace('Bearer ', '');

    // 在边缘验证JWT（无需回源）
    try {
      const payload = await verifyJWTAtEdge(token, {
        issuer: 'https://auth.example.com',
        audience: 'https://api.example.com'
      });

      // 验证通过，添加用户信息到请求头
      const headers = {
        ...request.headers,
        'x-user-id': payload.sub,
        'x-user-role': payload.role
      };

      // 继续请求
      const response = await fetch(request.url, { headers });

      return {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        body: await response.text()
      };

    } catch (error) {
      return {
        status: 401,
        headers: {},
        body: JSON.stringify({ error: 'Invalid token' })
      };
    }
  };
}

// 2. 边缘KV存储

class EdgeKV {
  constructor(private namespace: any) {}

  async get(key: string): Promise<any> {
    const value = await this.namespace.get(key);
    return value ? JSON.parse(value) : null;
  }

  async put(key: string, value: any, options?: { expirationTtl?: number }): Promise<void> {
    await this.namespace.put(key, JSON.stringify(value), options);
  }

  async delete(key: string): Promise<void> {
    await this.namespace.delete(key);
  }

  // 列表查询（带前缀）
  async list(options?: { prefix?: string; limit?: number; cursor?: string }): Promise<{
    keys: Array<{ name: string; expiration?: number }>;
    list_complete: boolean;
    cursor?: string;
  }> {
    return this.namespace.list(options);
  }
}

// 3. 边缘Durable Objects（有状态边缘计算）

interface DurableObjectState {
  storage: DurableObjectStorage;
  id: DurableObjectId;
}

interface DurableObjectStorage {
  get(key: string): Promise<any>;
  put(key: string, value: any): Promise<void>;
  delete(key: string): Promise<void>;
  list(options?: { start?: string; end?: string; prefix?: string }): Promise<Map<string, any>>;
  transaction(closure: (txn: Transaction) => Promise<void>): Promise<void>;
}

// WebSocket聊天室示例
class ChatRoom implements DurableObject {
  private sessions: Map<string, WebSocket> = new Map();
  private messages: Array<{ user: string; text: string; time: number }> = [];

  constructor(private state: DurableObjectState) {}

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/websocket') {
      // 升级WebSocket连接
      const [client, server] = Object.values(new WebSocketPair());

      await this.handleSession(server);

      return new Response(null, {
        status: 101,
        webSocket: client
      });
    }

    if (url.pathname === '/messages') {
      return new Response(JSON.stringify(this.messages), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response('Not found', { status: 404 });
  }

  private async handleSession(ws: WebSocket): Promise<void> {
    ws.accept();

    const sessionId = generateUUID();
    this.sessions.set(sessionId, ws);

    // 发送历史消息
    ws.send(JSON.stringify({
      type: 'history',
      messages: this.messages.slice(-50)
    }));

    ws.addEventListener('message', async (event) => {
      const data = JSON.parse(event.data as string);

      if (data.type === 'chat') {
        const message = {
          user: data.user,
          text: data.text,
          time: Date.now()
        };

        // 保存到持久化存储
        this.messages.push(message);
        await this.state.storage.put('messages', this.messages);

        // 广播给所有连接的客户端
        this.broadcast(JSON.stringify({
          type: 'message',
          ...message
        }));
      }
    });

    ws.addEventListener('close', () => {
      this.sessions.delete(sessionId);
    });
  }

  private broadcast(message: string): void {
    for (const [_, ws] of this.sessions) {
      try {
        ws.send(message);
      } catch (error) {
        // 忽略已关闭的连接
      }
    }
  }
}

// 4. 边缘-中心协同

class EdgeCenterCoordination {
  // 边缘预处理 + 中心聚合
  async processAnalyticsData(edgeData: AnalyticsEvent[]): Promise<void> {
    // 在边缘进行初步聚合
    const aggregated = this.aggregateAtEdge(edgeData);

    // 批量发送到中心
    await this.sendToCenter(aggregated);
  }

  private aggregateAtEdge(events: AnalyticsEvent[]): AggregatedData {
    const result: Record<string, { count: number; sum: number }> = {};

    for (const event of events) {
      if (!result[event.metric]) {
        result[event.metric] = { count: 0, sum: 0 };
      }

      result[event.metric].count++;
      result[event.metric].sum += event.value;
    }

    return {
      timestamp: Date.now(),
      region: getCurrentRegion(),
      metrics: result
    };
  }

  // 边缘渲染 + 中心数据
  async renderPageAtEdge(request: Request): Promise<Response> {
    // 从边缘缓存获取静态部分
    const cached = await this.edgeCache.get(request.url);

    if (cached) {
      // 缓存命中，快速响应
      return new Response(cached.body, {
        headers: {
          'content-type': 'text/html',
          'x-cache': 'HIT'
        }
      });
    }

    // 缓存未命中，从中心获取数据
    const pageData = await this.fetchFromCenter('/api/page-data', {
      url: request.url,
      user: getUserFromRequest(request)
    });

    // 在边缘渲染HTML
    const html = this.renderHTML(pageData);

    // 存入边缘缓存
    await this.edgeCache.put(request.url, {
      body: html,
      timestamp: Date.now()
    }, { expirationTtl: 300 });

    return new Response(html, {
      headers: {
        'content-type': 'text/html',
        'x-cache': 'MISS'
      }
    });
  }
}
```

---


## 4. 数据管理

### 4.1 数据分片

#### 定义与形式化

数据分片将数据分布到多个节点，以提高可扩展性和性能。

**形式化定义：**

设数据集为 $D$，分片函数为 $shard: D \to \{S_1, S_2, ..., S_n\}$，满足：

1. **完整性**: $\bigcup_{i=1}^{n} S_i = D$
2. **不相交**: $\forall i \neq j: S_i \cap S_j = \emptyset$（水平分片）
3. **负载均衡**: $\forall i, j: |S_i| \approx |S_j|$

```typescript
// 分片策略实现

// 1. 范围分片（Range Sharding）

interface RangeShardConfig {
  shardKey: string;
  ranges: Array<{
    min: number | string;
    max: number | string;
    shardId: string;
  }>;
}

class RangeShardStrategy {
  constructor(private config: RangeShardConfig) {}

  getShardId(keyValue: number | string): string {
    for (const range of this.config.ranges) {
      if (keyValue >= range.min && keyValue < range.max) {
        return range.shardId;
      }
    }

    throw new Error(`No shard found for key: ${keyValue}`);
  }

  // 时间范围分片（适用于时序数据）
  static createTimeBasedRanges(
    startDate: Date,
    shardDurationMs: number,
    numShards: number
  ): RangeShardConfig {
    const ranges = [];
    let current = startDate.getTime();

    for (let i = 0; i < numShards; i++) {
      ranges.push({
        min: current,
        max: current + shardDurationMs,
        shardId: `shard-${i}`
      });
      current += shardDurationMs;
    }

    return {
      shardKey: 'timestamp',
      ranges
    };
  }
}

// 2. 哈希分片（Hash Sharding）

class HashShardStrategy {
  constructor(
    private numShards: number,
    private hashFunction: (key: string) => number = murmurHash
  ) {}

  getShardId(key: string): string {
    const hash = this.hashFunction(key);
    const shardIndex = hash % this.numShards;
    return `shard-${shardIndex}`;
  }

  // 虚拟节点支持
  getVirtualShardId(key: string, virtualNodes: number): string {
    const hash = this.hashFunction(key);
    const virtualIndex = hash % (this.numShards * virtualNodes);
    const shardIndex = Math.floor(virtualIndex / virtualNodes);
    return `shard-${shardIndex}`;
  }
}

// MurmurHash实现
function murmurHash(key: string): number {
  const seed = 0;
  const c1 = 0xcc9e2d51;
  const c2 = 0x1b873593;
  const r1 = 15;
  const r2 = 13;
  const m = 5;
  const n = 0xe6546b64;

  let hash = seed;
  const bytes = Buffer.from(key);
  const length = bytes.length;

  // 处理4字节块
  for (let i = 0; i < length - 3; i += 4) {
    let k = bytes.readInt32LE(i);

    k = (k * c1) | 0;
    k = (k << r1) | (k >>> (32 - r1));
    k = (k * c2) | 0;

    hash ^= k;
    hash = (hash << r2) | (hash >>> (32 - r2));
    hash = (hash * m + n) | 0;
  }

  // 处理剩余字节
  let k = 0;
  switch (length % 4) {
    case 3: k ^= bytes[length - 1] << 16;
    case 2: k ^= bytes[length - 2] << 8;
    case 1: k ^= bytes[length - 3];
      k = (k * c1) | 0;
      k = (k << r1) | (k >>> (32 - r1));
      k = (k * c2) | 0;
      hash ^= k;
  }

  // 最终化
  hash ^= length;
  hash ^= hash >>> 16;
  hash = (hash * 0x85ebca6b) | 0;
  hash ^= hash >>> 13;
  hash = (hash * 0xc2b2ae35) | 0;
  hash ^= hash >>> 16;

  return Math.abs(hash);
}

// 3. 一致性哈希（Consistent Hashing）

interface ConsistentHashRing {
  addNode(nodeId: string, virtualNodes?: number): void;
  removeNode(nodeId: string): void;
  getNode(key: string): string;
  getNodes(key: string, count: number): string[];
}

class ConsistentHashRingImpl implements ConsistentHashRing {
  private ring = new Map<number, string>(); // hash -> nodeId
  private sortedHashes: number[] = [];
  private nodeVirtualCounts = new Map<string, number>();
  private readonly defaultVirtualNodes = 150;

  addNode(nodeId: string, virtualNodes = this.defaultVirtualNodes): void {
    this.nodeVirtualCounts.set(nodeId, virtualNodes);

    for (let i = 0; i < virtualNodes; i++) {
      const hash = murmurHash(`${nodeId}:${i}`);
      this.ring.set(hash, nodeId);
    }

    this.updateSortedHashes();
  }

  removeNode(nodeId: string): void {
    const virtualNodes = this.nodeVirtualCounts.get(nodeId) || 0;

    for (let i = 0; i < virtualNodes; i++) {
      const hash = murmurHash(`${nodeId}:${i}`);
      this.ring.delete(hash);
    }

    this.nodeVirtualCounts.delete(nodeId);
    this.updateSortedHashes();
  }

  getNode(key: string): string {
    if (this.ring.size === 0) {
      throw new Error('Ring is empty');
    }

    const hash = murmurHash(key);
    const nodeHash = this.findNodeHash(hash);
    return this.ring.get(nodeHash)!;
  }

  getNodes(key: string, count: number): string[] {
    if (count >= this.nodeVirtualCounts.size) {
      return Array.from(this.nodeVirtualCounts.keys());
    }

    const hash = murmurHash(key);
    const nodes: string[] = [];
    const seen = new Set<string>();

    let index = this.findIndex(hash);

    while (nodes.length < count && seen.size < this.ring.size) {
      const nodeHash = this.sortedHashes[index % this.sortedHashes.length];
      const nodeId = this.ring.get(nodeHash)!;

      if (!seen.has(nodeId)) {
        nodes.push(nodeId);
        seen.add(nodeId);
      }

      index++;
    }

    return nodes;
  }

  private findNodeHash(hash: number): number {
    const index = this.findIndex(hash);
    return this.sortedHashes[index];
  }

  private findIndex(hash: number): number {
    // 二分查找
    let left = 0;
    let right = this.sortedHashes.length;

    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      if (this.sortedHashes[mid] < hash) {
        left = mid + 1;
      } else {
        right = mid;
      }
    }

    // 环形回绕
    return left % this.sortedHashes.length;
  }

  private updateSortedHashes(): void {
    this.sortedHashes = Array.from(this.ring.keys()).sort((a, b) => a - b);
  }

  // 计算数据迁移量
  calculateMigration(oldRing: ConsistentHashRingImpl): Map<string, number> {
    const migration = new Map<string, number>();
    const testKeys = this.generateTestKeys(10000);

    for (const key of testKeys) {
      const oldNode = oldRing.getNode(key);
      const newNode = this.getNode(key);

      if (oldNode !== newNode) {
        migration.set(oldNode, (migration.get(oldNode) || 0) + 1);
      }
    }

    return migration;
  }

  private generateTestKeys(count: number): string[] {
    return Array.from({ length: count }, (_, i) => `key-${i}`);
  }
}

// 4. 复合分片策略

class CompositeShardStrategy {
  constructor(
    private primaryStrategy: ShardStrategy,
    private secondaryStrategy: ShardStrategy,
    private secondaryKeyExtractor: (doc: any) => string
  ) {}

  getShardId(document: any): string {
    const primaryShard = this.primaryStrategy.getShardId(document.id);
    const secondaryShard = this.secondaryStrategy.getShardId(
      this.secondaryKeyExtractor(document)
    );

    // 复合分片：主分片 + 次分片
    return `${primaryShard}:${secondaryShard}`;
  }
}

// 5. 分片管理器

interface ShardManager {
  getShardForKey(key: string): Shard;
  executeQuery(query: Query): Promise<any[]>;
  executeTransaction(operations: Operation[]): Promise<void>;
  rebalance(): Promise<void>;
  addShard(shard: Shard): Promise<void>;
  removeShard(shardId: string): Promise<void>;
}

class DistributedShardManager implements ShardManager {
  private shards = new Map<string, Shard>();
  private strategy: ShardStrategy;
  private metadataStore: MetadataStore;

  constructor(
    strategy: ShardStrategy,
    metadataStore: MetadataStore
  ) {
    this.strategy = strategy;
    this.metadataStore = metadataStore;
  }

  getShardForKey(key: string): Shard {
    const shardId = this.strategy.getShardId(key);
    const shard = this.shards.get(shardId);

    if (!shard) {
      throw new Error(`Shard not found: ${shardId}`);
    }

    return shard;
  }

  async executeQuery(query: Query): Promise<any[]> {
    // 分析查询，确定需要访问的分片
    const shardIds = this.analyzeQueryShards(query);

    if (shardIds.length === 1) {
      // 单分片查询
      const shard = this.shards.get(shardIds[0])!;
      return shard.query(query);
    }

    // 多分片查询（ scatter-gather ）
    const results = await Promise.all(
      shardIds.map(id => this.shards.get(id)!.query(query))
    );

    // 合并结果
    return this.mergeResults(results, query);
  }

  async executeTransaction(operations: Operation[]): Promise<void> {
    // 按分片分组操作
    const grouped = this.groupByShard(operations);

    if (grouped.size === 1) {
      // 单分片事务
      const [shardId, ops] = grouped.entries().next().value;
      await this.shards.get(shardId)!.transaction(ops);
    } else {
      // 跨分片事务 - 使用2PC
      await this.executeDistributedTransaction(grouped);
    }
  }

  private async executeDistributedTransaction(
    grouped: Map<string, Operation[]>
  ): Promise<void> {
    const coordinator = new TwoPhaseCoordinator();
    const participants = Array.from(grouped.entries()).map(
      ([shardId, ops]) => ({
        id: shardId,
        execute: () => this.shards.get(shardId)!.prepare(ops),
        commit: () => this.shards.get(shardId)!.commit(),
        rollback: () => this.shards.get(shardId)!.rollback()
      })
    );

    await coordinator.execute(participants);
  }

  async rebalance(): Promise<void> {
    // 分析各分片负载
    const stats = await this.collectShardStats();

    // 识别热点分片
    const hotShards = stats.filter(s => s.load > this.threshold);

    for (const hotShard of hotShards) {
      // 分裂热点分片
      await this.splitShard(hotShard.id);
    }

    // 迁移数据以平衡负载
    await this.migrateDataForBalance();
  }

  private async splitShard(shardId: string): Promise<void> {
    const shard = this.shards.get(shardId)!;
    const midpoint = await shard.findMidpoint();

    // 创建新分片
    const newShardId = `${shardId}-split`;
    const newShard = await this.createShard(newShardId);

    // 迁移后半部分数据
    await shard.migrateRange(midpoint, null, newShard);

    // 更新路由
    await this.metadataStore.updateShardRange(shardId, null, midpoint);
    await this.metadataStore.addShardRange(newShardId, midpoint, null);
  }
}

// 6. 分片路由中间件

class ShardRouter {
  constructor(
    private shardManager: ShardManager,
    private config: RouterConfig
  ) {}

  middleware() {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        // 从请求中提取分片键
        const shardKey = this.extractShardKey(req);

        // 确定目标分片
        const shard = this.shardManager.getShardForKey(shardKey);

        // 将分片信息附加到请求
        req.shard = shard;
        req.shardKey = shardKey;

        next();
      } catch (error) {
        res.status(500).json({ error: 'Shard routing failed' });
      }
    };
  }

  private extractShardKey(req: Request): string {
    // 从路径参数
    if (req.params.userId) {
      return req.params.userId;
    }

    // 从查询参数
    if (req.query.shardKey) {
      return req.query.shardKey as string;
    }

    // 从请求头
    if (req.headers['x-shard-key']) {
      return req.headers['x-shard-key'] as string;
    }

    // 从JWT
    if (req.user?.id) {
      return req.user.id;
    }

    throw new Error('Cannot extract shard key from request');
  }
}
```

#### 反例：错误的分片设计

```typescript
// ❌ 错误：分片键选择不当
class BadShardKeySelection {
  // 使用时间戳作为分片键
  // 问题：最新数据总是写入同一个分片（热点）

  // ❌ 错误：单调递增ID
  getShardId(orderId: string): string {
    // orderId是自增的，如 "order_10001", "order_10002"
    const id = parseInt(orderId.split('_')[1]);
    return `shard-${id % 10}`;
    // 新订单总是集中在少数分片
  }
}

// ❌ 错误：跨分片查询过多
class ExcessiveCrossShardQueries {
  async getUserOrders(userId: string): Promise<Order[]> {
    // 如果订单按订单ID分片，用户订单分散在各分片
    const allShards = this.shardManager.getAllShards();

    // 需要查询所有分片
    const results = await Promise.all(
      allShards.map(s => s.query({ userId }))
    );

    // 性能差，扩展性差
    return results.flat();
  }
}

// ❌ 错误：分片后缺少路由
class MissingShardRouting {
  async createOrder(order: Order): Promise<void> {
    // 错误：直接写入默认数据库
    await this.db.insert('orders', order);
    // 问题：没有路由到正确的分片
  }
}
```

---

### 4.2 数据复制

#### 定义与形式化

数据复制在多个节点上维护相同数据的副本，提高可用性和读取性能。

**形式化定义：**

设数据为 $D$，副本集合为 $R = \{r_1, r_2, ..., r_n\}$，复制协议为 $P$。

复制一致性模型：

- **主从复制**: $\exists! r_{master} \in R: write(D) \to r_{master}$
- **多主复制**: $\forall r \in R: write(D) \to r$（需要冲突解决）
- **无主复制**: $write(D) \to W \subseteq R, |W| \geq W_{quorum}$

```typescript
// 复制策略实现

// 1. 主从复制（Primary-Backup）

interface ReplicationConfig {
  primary: NodeConfig;
  replicas: NodeConfig[];
  replicationMode: 'async' | 'sync' | 'semi-sync';
  syncTimeout?: number;
}

class PrimaryBackupReplication {
  private primary: DatabaseNode;
  private replicas: DatabaseNode[];
  private config: ReplicationConfig;
  private replicationLag = new Map<string, number>();

  constructor(config: ReplicationConfig) {
    this.config = config;
    this.primary = new DatabaseNode(config.primary);
    this.replicas = config.replicas.map(r => new DatabaseNode(r));
  }

  async write(data: WriteOperation): Promise<WriteResult> {
    // 1. 写入主节点
    const result = await this.primary.write(data);

    // 2. 复制到从节点
    switch (this.config.replicationMode) {
      case 'sync':
        // 同步复制：等待所有从节点确认
        await this.syncToAllReplicas(data, result.position);
        break;

      case 'semi-sync':
        // 半同步：等待至少一个从节点确认
        await this.syncToAtLeastOneReplica(data, result.position);
        break;

      case 'async':
        // 异步复制：不等待从节点
        this.asyncReplicate(data, result.position);
        break;
    }

    return result;
  }

  async read(options: ReadOptions): Promise<ReadResult> {
    if (options.consistent) {
      // 强一致性读：从主节点读取
      return this.primary.read(options);
    }

    // 选择延迟最小的从节点
    const replica = this.selectReplicaByLag();
    return replica.read(options);
  }

  private selectReplicaByLag(): DatabaseNode {
    let minLag = Infinity;
    let selected = this.replicas[0];

    for (const replica of this.replicas) {
      const lag = this.replicationLag.get(replica.id) || Infinity;
      if (lag < minLag) {
        minLag = lag;
        selected = replica;
      }
    }

    return selected;
  }

  // 故障转移
  async failover(): Promise<void> {
    // 1. 选举新的主节点（延迟最小的从节点）
    const newPrimary = this.selectReplicaByLag();

    // 2. 提升为新的主节点
    await newPrimary.promoteToPrimary();

    // 3. 更新其他从节点的复制源
    for (const replica of this.replicas) {
      if (replica !== newPrimary) {
        await replica.changePrimary(newPrimary);
      }
    }

    // 4. 更新配置
    this.primary = newPrimary;
    this.replicas = this.replicas.filter(r => r !== newPrimary);
    this.replicas.push(this.primary);
  }

  // 监控复制延迟
  startReplicationMonitor(): void {
    setInterval(async () => {
      const primaryPosition = await this.primary.getReplicationPosition();

      for (const replica of this.replicas) {
        const replicaPosition = await replica.getReplicationPosition();
        const lag = primaryPosition - replicaPosition;
        this.replicationLag.set(replica.id, lag);

        // 告警：延迟过大
        if (lag > 1000) {
          this.alertHighReplicationLag(replica.id, lag);
        }
      }
    }, 5000);
  }
}

// 2. 多主复制（Multi-Master）

class MultiMasterReplication {
  private masters: DatabaseNode[];
  private conflictResolver: ConflictResolver;
  private vectorClocks = new Map<string, VectorClock>();

  constructor(
    masters: DatabaseNode[],
    conflictResolver: ConflictResolver
  ) {
    this.masters = masters;
    this.conflictResolver = conflictResolver;
  }

  async write(data: WriteOperation, nodeId: string): Promise<WriteResult> {
    const master = this.masters.find(m => m.id === nodeId);
    if (!master) {
      throw new Error(`Master node ${nodeId} not found`);
    }

    // 更新向量时钟
    const clock = this.vectorClocks.get(data.key) || new VectorClock();
    clock.increment(nodeId);
    this.vectorClocks.set(data.key, clock);

    // 写入本地
    const result = await master.write({
      ...data,
      vectorClock: clock.toJSON()
    });

    // 异步复制到其他主节点
    this.replicateToOtherMasters(data, nodeId);

    return result;
  }

  async read(key: string, options: ReadOptions): Promise<ReadResult> {
    // 读取所有主节点的版本
    const versions = await Promise.all(
      this.masters.map(m => m.read({ key }))
    );

    // 检查冲突
    const conflicts = this.detectConflicts(versions);

    if (conflicts.length > 0) {
      // 解决冲突
      const resolved = await this.conflictResolver.resolve(conflicts);

      // 如果解决了冲突，写回所有节点
      if (options.propagateResolution) {
        await this.propagateResolution(key, resolved);
      }

      return resolved;
    }

    // 无冲突，返回最新版本
    return this.selectLatestVersion(versions);
  }

  private detectConflicts(versions: Version[]): Conflict[] {
    const conflicts: Conflict[] = [];

    for (let i = 0; i < versions.length; i++) {
      for (let j = i + 1; j < versions.length; j++) {
        const v1 = versions[i];
        const v2 = versions[j];

        const relation = this.compareVectorClocks(v1.clock, v2.clock);

        if (relation === 'concurrent') {
          conflicts.push({ v1, v2 });
        }
      }
    }

    return conflicts;
  }

  private compareVectorClocks(c1: VectorClock, c2: VectorClock): string {
    let v1Dominates = false;
    let v2Dominates = false;

    const allNodes = new Set([...c1.keys(), ...c2.keys()]);

    for (const node of allNodes) {
      const t1 = c1.get(node) || 0;
      const t2 = c2.get(node) || 0;

      if (t1 > t2) v1Dominates = true;
      if (t2 > t1) v2Dominates = true;
    }

    if (v1Dominates && !v2Dominates) return 'after';
    if (v2Dominates && !v1Dominates) return 'before';
    if (!v1Dominates && !v2Dominates) return 'equal';
    return 'concurrent';
  }
}

// 3. 无主复制（Quorum-based）

class QuorumReplication {
  private nodes: DatabaseNode[];
  private readQuorum: number;
  private writeQuorum: number;

  constructor(
    nodes: DatabaseNode[],
    replicationFactor: number
  ) {
    this.nodes = nodes;
    // 确保 R + W > N
    this.readQuorum = Math.floor(replicationFactor / 2) + 1;
    this.writeQuorum = Math.floor(replicationFactor / 2) + 1;
  }

  async write(data: WriteOperation): Promise<WriteResult> {
    // 1. 选择W个节点
    const nodes = this.selectNodes(data.key, this.writeQuorum);

    // 2. 并行写入
    const writes = nodes.map(node =>
      node.write(data).catch(error => ({ error, node }))
    );

    const results = await Promise.all(writes);

    // 3. 检查成功数量
    const successes = results.filter(r => !('error' in r));

    if (successes.length < this.writeQuorum) {
      throw new Error(
        `Write quorum not reached: ${successes.length}/${this.writeQuorum}`
      );
    }

    return {
      timestamp: Date.now(),
      nodes: successes.map(s => (s as any).nodeId)
    };
  }

  async read(key: string): Promise<ReadResult> {
    // 1. 选择R个节点
    const nodes = this.selectNodes(key, this.readQuorum);

    // 2. 并行读取
    const reads = nodes.map(node =>
      node.read({ key }).catch(error => ({ error, node }))
    );

    const results = await Promise.all(reads);

    // 3. 检查成功数量
    const successes = results.filter(r => !('error' in r)) as Version[];

    if (successes.length < this.readQuorum) {
      throw new Error(
        `Read quorum not reached: ${successes.length}/${this.readQuorum}`
      );
    }

    // 4. 版本比较和修复
    const latest = this.selectLatestVersion(successes);

    // 5. 读修复：更新旧版本节点
    const staleNodes = successes.filter(v =>
      v.timestamp < latest.timestamp
    );

    for (const stale of staleNodes) {
      this.repairNode(stale.nodeId, key, latest);
    }

    return latest;
  }

  private selectNodes(key: string, count: number): DatabaseNode[] {
    // 使用一致性哈希选择节点
    const hash = murmurHash(key);
    const selected: DatabaseNode[] = [];
    const seen = new Set<string>();

    for (let i = 0; selected.length < count && i < this.nodes.length * 2; i++) {
      const index = (hash + i) % this.nodes.length;
      const node = this.nodes[index];

      if (!seen.has(node.id)) {
        selected.push(node);
        seen.add(node.id);
      }
    }

    return selected;
  }

  private selectLatestVersion(versions: Version[]): Version {
    return versions.reduce((latest, current) =>
      current.timestamp > latest.timestamp ? current : latest
    );
  }

  private async repairNode(
    nodeId: string,
    key: string,
    value: Version
  ): Promise<void> {
    const node = this.nodes.find(n => n.id === nodeId);
    if (node) {
      // 异步修复，不阻塞读取
      node.write({ key, value }).catch(console.error);
    }
  }
}

// 4. 冲突解决策略

interface ConflictResolver {
  resolve(conflicts: Conflict[]): Promise<Version>;
}

// 最后写入获胜
class LastWriteWinsResolver implements ConflictResolver {
  async resolve(conflicts: Conflict[]): Promise<Version> {
    const allVersions = conflicts.flatMap(c => [c.v1, c.v2]);
    return allVersions.reduce((latest, current) =>
      current.timestamp > latest.timestamp ? current : latest
    );
  }
}

// 向量时钟合并
class VectorClockResolver implements ConflictResolver {
  async resolve(conflicts: Conflict[]): Promise<Version> {
    const allVersions = conflicts.flatMap(c => [c.v1, c.v2]);

    // 合并向量时钟
    const mergedClock = new VectorClock();
    for (const v of allVersions) {
      mergedClock.merge(v.clock);
    }

    // 选择最新的值（应用特定逻辑）
    return {
      ...allVersions[0],
      clock: mergedClock,
      value: this.mergeValues(allVersions.map(v => v.value))
    };
  }

  private mergeValues(values: any[]): any {
    // 应用特定的合并逻辑
    // 例如：购物车合并
    if (Array.isArray(values[0])) {
      return [...new Set(values.flat())];
    }

    // 默认：返回最后一个
    return values[values.length - 1];
  }
}

// 保留多版本（让客户端解决）
class MultiVersionResolver implements ConflictResolver {
  async resolve(conflicts: Conflict[]): Promise<Version> {
    const allVersions = conflicts.flatMap(c => [c.v1, c.v2]);

    return {
      type: 'conflict',
      versions: allVersions,
      // 客户端需要选择合适的版本或合并
    } as any;
  }
}
```

---

### 4.3 分布式事务

#### 定义与形式化

分布式事务确保跨多个节点的操作要么全部成功，要么全部失败。

**形式化定义：**

事务 $T = \{op_1, op_2, ..., op_n\}$ 满足ACID特性：

- **原子性 (A)**: $\forall T: commit(T) \lor abort(T)$
- **一致性 (C)**: $\forall T: valid(state_{before}) \land commit(T) \to valid(state_{after})$
- **隔离性 (I)**: $\forall T_1, T_2: effect(T_1) \perp effect(T_2)$
- **持久性 (D)**: $commit(T) \to permanent(T)$

```typescript
// 分布式事务实现

// 1. 两阶段提交（2PC）

interface Participant {
  id: string;
  prepare: () => Promise<boolean>;
  commit: () => Promise<void>;
  rollback: () => Promise<void>;
}

class TwoPhaseCommit {
  private coordinatorLog: CoordinatorLog;

  async executeTransaction(
    transactionId: string,
    participants: Participant[]
  ): Promise<void> {
    // Phase 1: Prepare
    console.log(`[2PC] Phase 1: Prepare - ${transactionId}`);

    const prepareResults = await Promise.all(
      participants.map(async p => {
        try {
          const canCommit = await p.prepare();
          return { participant: p, canCommit };
        } catch (error) {
          return { participant: p, canCommit: false, error };
        }
      })
    );

    const allCanCommit = prepareResults.every(r => r.canCommit);

    // 记录决策
    await this.coordinatorLog.recordDecision(
      transactionId,
      allCanCommit ? 'COMMIT' : 'ABORT'
    );

    // Phase 2: Commit or Abort
    if (allCanCommit) {
      console.log(`[2PC] Phase 2: Commit - ${transactionId}`);

      // 发送commit给所有参与者
      await Promise.all(
        participants.map(p =>
          p.commit().catch(async error => {
            // 提交失败，记录并告警
            await this.handleCommitFailure(transactionId, p, error);
          })
        )
      );
    } else {
      console.log(`[2PC] Phase 2: Abort - ${transactionId}`);

      // 发送rollback给所有参与者
      await Promise.all(
        participants.map(p =>
          p.rollback().catch(error => {
            console.error(`Rollback failed for ${p.id}:`, error);
          })
        )
      );
    }
  }

  // 故障恢复
  async recover(): Promise<void> {
    // 读取未完成的协调器日志
    const pendingTransactions = await this.coordinatorLog.getPending();

    for (const tx of pendingTransactions) {
      if (tx.decision === 'COMMIT') {
        // 重试提交
        for (const participant of tx.participants) {
          await participant.commit();
        }
      } else {
        // 回滚
        for (const participant of tx.participants) {
          await participant.rollback();
        }
      }

      await this.coordinatorLog.markCompleted(tx.id);
    }
  }

  private async handleCommitFailure(
    transactionId: string,
    participant: Participant,
    error: Error
  ): Promise<void> {
    // 记录失败，需要人工介入或自动重试
    await this.alertAdmin({
      type: 'COMMIT_FAILURE',
      transactionId,
      participantId: participant.id,
      error: error.message
    });
  }
}

// 2. 三阶段提交（3PC）

class ThreePhaseCommit {
  private coordinatorLog: CoordinatorLog;

  async executeTransaction(
    transactionId: string,
    participants: Participant[]
  ): Promise<void> {
    // Phase 1: CanCommit
    console.log(`[3PC] Phase 1: CanCommit - ${transactionId}`);

    const canCommitResults = await Promise.all(
      participants.map(async p => {
        try {
          const canCommit = await p.canCommit();
          return { participant: p, canCommit };
        } catch (error) {
          return { participant: p, canCommit: false };
        }
      })
    );

    if (!canCommitResults.every(r => r.canCommit)) {
      // 某个参与者不能提交，直接中止
      await this.abort(transactionId, participants);
      return;
    }

    // Phase 2: PreCommit
    console.log(`[3PC] Phase 2: PreCommit - ${transactionId}`);

    await this.coordinatorLog.recordDecision(transactionId, 'PRECOMMIT');

    const preCommitResults = await Promise.all(
      participants.map(p =>
        p.preCommit().catch(() => false)
      )
    );

    if (!preCommitResults.every(r => r)) {
      // PreCommit失败，回滚
      await this.abort(transactionId, participants);
      return;
    }

    // Phase 3: DoCommit
    console.log(`[3PC] Phase 3: DoCommit - ${transactionId}`);

    await this.coordinatorLog.recordDecision(transactionId, 'COMMIT');

    await Promise.all(
      participants.map(p => p.commit())
    );
  }

  private async abort(
    transactionId: string,
    participants: Participant[]
  ): Promise<void> {
    await this.coordinatorLog.recordDecision(transactionId, 'ABORT');

    await Promise.all(
      participants.map(p =>
        p.rollback().catch(console.error)
      )
    );
  }
}

// 3. Saga模式

type SagaStep = {
  name: string;
  execute: () => Promise<void>;
  compensate: () => Promise<void>;
};

type SagaExecutionResult =
  | { status: 'success' }
  | { status: 'compensated'; failedStep: string; errors: Error[] };

class Saga {
  private steps: SagaStep[] = [];
  private executedSteps: SagaStep[] = [];

  addStep(step: SagaStep): this {
    this.steps.push(step);
    return this;
  }

  async execute(): Promise<SagaExecutionResult> {
    console.log('[Saga] Starting execution');

    for (const step of this.steps) {
      try {
        console.log(`[Saga] Executing step: ${step.name}`);
        await step.execute();
        this.executedSteps.push(step);
      } catch (error) {
        console.error(`[Saga] Step failed: ${step.name}`, error);

        // 执行补偿
        return this.compensate(step.name, error as Error);
      }
    }

    console.log('[Saga] Execution completed successfully');
    return { status: 'success' };
  }

  private async compensate(
    failedStepName: string,
    originalError: Error
  ): Promise<SagaExecutionResult> {
    console.log('[Saga] Starting compensation');

    const errors: Error[] = [originalError];

    // 逆序执行补偿
    for (let i = this.executedSteps.length - 1; i >= 0; i--) {
      const step = this.executedSteps[i];

      try {
        console.log(`[Saga] Compensating step: ${step.name}`);
        await step.compensate();
      } catch (compensateError) {
        console.error(`[Saga] Compensation failed: ${step.name}`, compensateError);
        errors.push(compensateError as Error);
        // 继续补偿其他步骤
      }
    }

    return {
      status: 'compensated',
      failedStep: failedStepName,
      errors
    };
  }
}

// Saga编排器（Orchestration）
class SagaOrchestrator {
  private sagaLog: SagaLog;
  private eventBus: EventBus;

  async executeOrderSaga(orderRequest: CreateOrderRequest): Promise<void> {
    const sagaId = generateUUID();

    const saga = new Saga()
      .addStep({
        name: 'reserveInventory',
        execute: async () => {
          await this.eventBus.publish('inventory.reserve', {
            sagaId,
            items: orderRequest.items
          });
          await this.waitForResponse(`inventory.reserved.${sagaId}`);
        },
        compensate: async () => {
          await this.eventBus.publish('inventory.release', {
            sagaId,
            items: orderRequest.items
          });
        }
      })
      .addStep({
        name: 'processPayment',
        execute: async () => {
          await this.eventBus.publish('payment.process', {
            sagaId,
            amount: orderRequest.total,
            userId: orderRequest.userId
          });
          await this.waitForResponse(`payment.processed.${sagaId}`);
        },
        compensate: async () => {
          await this.eventBus.publish('payment.refund', {
            sagaId,
            amount: orderRequest.total
          });
        }
      })
      .addStep({
        name: 'createOrder',
        execute: async () => {
          await this.eventBus.publish('order.create', {
            sagaId,
            orderRequest
          });
          await this.waitForResponse(`order.created.${sagaId}`);
        },
        compensate: async () => {
          await this.eventBus.publish('order.cancel', { sagaId });
        }
      })
      .addStep({
        name: 'scheduleShipping',
        execute: async () => {
          await this.eventBus.publish('shipping.schedule', {
            sagaId,
            address: orderRequest.shippingAddress
          });
        },
        compensate: async () => {
          await this.eventBus.publish('shipping.cancel', { sagaId });
        }
      });

    const result = await saga.execute();

    if (result.status === 'compensated') {
      // 通知用户订单失败
      await this.eventBus.publish('order.failed', {
        sagaId,
        reason: result.errors[0].message
      });
    }
  }

  private waitForResponse(eventName: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Response timeout'));
      }, 30000);

      this.eventBus.once(eventName, (data) => {
        clearTimeout(timeout);
        if (data.error) {
          reject(new Error(data.error));
        } else {
          resolve(data);
        }
      });
    });
  }
}

// 4. TCC（Try-Confirm-Cancel）

interface TCCParticipant {
  try(): Promise<void>;
  confirm(): Promise<void>;
  cancel(): Promise<void>;
}

class TCCTransaction {
  private participants: TCCParticipant[] = [];
  private state: 'trying' | 'confirmed' | 'cancelled' = 'trying';

  addParticipant(participant: TCCParticipant): this {
    this.participants.push(participant);
    return this;
  }

  async execute(): Promise<void> {
    // Phase 1: Try
    console.log('[TCC] Phase 1: Try');

    const tryResults = await Promise.allSettled(
      this.participants.map(p => p.try())
    );

    const allTried = tryResults.every(r => r.status === 'fulfilled');

    if (allTried) {
      // Phase 2: Confirm
      console.log('[TCC] Phase 2: Confirm');
      this.state = 'confirmed';

      await Promise.all(
        this.participants.map(p => p.confirm())
      );
    } else {
      // Phase 2: Cancel
      console.log('[TCC] Phase 2: Cancel');
      this.state = 'cancelled';

      await Promise.all(
        this.participants.map(p => p.cancel())
      );

      throw new Error('TCC transaction cancelled');
    }
  }
}

// TCC示例：库存扣减
class InventoryTCC implements TCCParticipant {
  private reservedStock: number | null = null;

  constructor(
    private productId: string,
    private quantity: number,
    private inventoryService: InventoryService
  ) {}

  async try(): Promise<void> {
    // 预扣库存
    this.reservedStock = await this.inventoryService.reserve(
      this.productId,
      this.quantity
    );
  }

  async confirm(): Promise<void> {
    // 确认扣减
    if (this.reservedStock !== null) {
      await this.inventoryService.confirmDeduction(
        this.productId,
        this.reservedStock
      );
    }
  }

  async cancel(): Promise<void> {
    // 释放预留
    if (this.reservedStock !== null) {
      await this.inventoryService.release(
        this.productId,
        this.reservedStock
      );
    }
  }
}
```

#### 反例：错误的分布式事务设计

```typescript
// ❌ 错误：在微服务中使用2PC
class Wrong2PCInMicroservices {
  async createOrder(order: Order): Promise<void> {
    // 错误：2PC在微服务中会导致长时间锁定
    await this.transactionCoordinator.execute({
      participants: [
        this.orderService,
        this.inventoryService,
        this.paymentService
      ]
    });
    // 问题：网络延迟、锁竞争、单点故障
  }
}

// ❌ 错误：缺少补偿的Saga
class IncompleteSaga {
  async processOrder(order: Order): Promise<void> {
    await this.inventoryService.reserve(order.items);
    await this.paymentService.charge(order.total);
    await this.orderService.create(order);
    // 问题：如果最后一步失败，前面没有补偿
  }
}

// ❌ 错误：幂等性缺失
class NoIdempotency {
  async deductInventory(productId: string, quantity: number): Promise<void> {
    // 错误：没有幂等性检查
    const current = await this.db.getStock(productId);
    await this.db.setStock(productId, current - quantity);
    // 问题：重复调用会导致超卖
  }
}
```

---

### 4.4 分布式ID生成

```typescript
// 分布式ID生成策略

// 1. UUID
class UUIDGenerator {
  static generate(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // UUID v7（时间排序）
  static generateV7(): string {
    const timestamp = Date.now();
    const bytes = new Uint8Array(16);

    // 48位时间戳
    bytes[0] = (timestamp >> 40) & 0xFF;
    bytes[1] = (timestamp >> 32) & 0xFF;
    bytes[2] = (timestamp >> 24) & 0xFF;
    bytes[3] = (timestamp >> 16) & 0xFF;
    bytes[4] = (timestamp >> 8) & 0xFF;
    bytes[5] = timestamp & 0xFF;

    // 随机部分
    for (let i = 6; i < 16; i++) {
      bytes[i] = Math.random() * 256 | 0;
    }

    // 版本和变体
    bytes[6] = (bytes[6] & 0x0F) | 0x70;
    bytes[8] = (bytes[8] & 0x3F) | 0x80;

    return this.bytesToUUID(bytes);
  }

  private static bytesToUUID(bytes: Uint8Array): string {
    const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }
}

// 2. Snowflake算法

interface SnowflakeConfig {
  workerId: number;      // 5位，0-31
  datacenterId: number;  // 5位，0-31
  epoch?: number;        // 起始时间戳
}

class SnowflakeIdGenerator {
  private static readonly WORKER_ID_BITS = 5;
  private static readonly DATACENTER_ID_BITS = 5;
  private static readonly SEQUENCE_BITS = 12;

  private static readonly MAX_WORKER_ID = -1 ^ (-1 << SnowflakeIdGenerator.WORKER_ID_BITS);
  private static readonly MAX_DATACENTER_ID = -1 ^ (-1 << SnowflakeIdGenerator.DATACENTER_ID_BITS);
  private static readonly SEQUENCE_MASK = -1 ^ (-1 << SnowflakeIdGenerator.SEQUENCE_BITS);

  private static readonly WORKER_ID_SHIFT = SnowflakeIdGenerator.SEQUENCE_BITS;
  private static readonly DATACENTER_ID_SHIFT = SnowflakeIdGenerator.SEQUENCE_BITS + SnowflakeIdGenerator.WORKER_ID_BITS;
  private static readonly TIMESTAMP_LEFT_SHIFT = SnowflakeIdGenerator.SEQUENCE_BITS +
    SnowflakeIdGenerator.WORKER_ID_BITS + SnowflakeIdGenerator.DATACENTER_ID_BITS;

  private lastTimestamp = -1;
  private sequence = 0;
  private readonly epoch: number;

  constructor(private config: SnowflakeConfig) {
    if (config.workerId > SnowflakeIdGenerator.MAX_WORKER_ID || config.workerId < 0) {
      throw new Error(`Worker ID must be between 0 and ${SnowflakeIdGenerator.MAX_WORKER_ID}`);
    }

    if (config.datacenterId > SnowflakeIdGenerator.MAX_DATACENTER_ID || config.datacenterId < 0) {
      throw new Error(`Datacenter ID must be between 0 and ${SnowflakeIdGenerator.MAX_DATACENTER_ID}`);
    }

    this.epoch = config.epoch || 1609459200000; // 2021-01-01
  }

  generate(): bigint {
    let timestamp = this.currentTime();

    if (timestamp < this.lastTimestamp) {
      throw new Error('Clock moved backwards');
    }

    if (timestamp === this.lastTimestamp) {
      this.sequence = (this.sequence + 1) & SnowflakeIdGenerator.SEQUENCE_MASK;

      if (this.sequence === 0) {
        // 序列溢出，等待下一毫秒
        timestamp = this.waitNextMillis(this.lastTimestamp);
      }
    } else {
      this.sequence = 0;
    }

    this.lastTimestamp = timestamp;

    return BigInt(
      ((timestamp - this.epoch) << SnowflakeIdGenerator.TIMESTAMP_LEFT_SHIFT) |
      (this.config.datacenterId << SnowflakeIdGenerator.DATACENTER_ID_SHIFT) |
      (this.config.workerId << SnowflakeIdGenerator.WORKER_ID_SHIFT) |
      this.sequence
    );
  }

  parse(id: bigint): ParsedSnowflake {
    const binary = id.toString(2).padStart(64, '0');

    return {
      timestamp: parseInt(binary.slice(0, 42), 2) + this.epoch,
      datacenterId: parseInt(binary.slice(42, 47), 2),
      workerId: parseInt(binary.slice(47, 52), 2),
      sequence: parseInt(binary.slice(52, 64), 2)
    };
  }

  private currentTime(): number {
    return Date.now();
  }

  private waitNextMillis(lastTimestamp: number): number {
    let timestamp = this.currentTime();
    while (timestamp <= lastTimestamp) {
      timestamp = this.currentTime();
    }
    return timestamp;
  }
}

interface ParsedSnowflake {
  timestamp: number;
  datacenterId: number;
  workerId: number;
  sequence: number;
}

// 3. 数据库号段模式

class DatabaseSegmentGenerator {
  private currentSegment: Segment | null = null;
  private readonly bufferSize = 1000;

  constructor(
    private db: Database,
    private businessType: string
  ) {}

  async generate(): Promise<number> {
    if (!this.currentSegment || this.currentSegment.isExhausted()) {
      this.currentSegment = await this.fetchNewSegment();
    }

    return this.currentSegment.nextId();
  }

  async generateBatch(count: number): Promise<number[]> {
    const ids: number[] = [];

    for (let i = 0; i < count; i++) {
      ids.push(await this.generate());
    }

    return ids;
  }

  private async fetchNewSegment(): Promise<Segment> {
    return this.db.transaction(async (trx) => {
      // 获取当前号段
      const row = await trx('id_generator')
        .where('business_type', this.businessType)
        .forUpdate() // 悲观锁
        .first();

      const maxId = row.max_id;
      const step = row.step;

      // 更新号段
      await trx('id_generator')
        .where('business_type', this.businessType)
        .update({
          max_id: maxId + step,
          update_time: new Date()
        });

      return new Segment(maxId, maxId + step);
    });
  }
}

class Segment {
  private current: number;

  constructor(
    private start: number,
    private end: number
  ) {
    this.current = start;
  }

  nextId(): number {
    if (this.isExhausted()) {
      throw new Error('Segment exhausted');
    }
    return this.current++;
  }

  isExhausted(): boolean {
    return this.current >= this.end;
  }
}

// 4. 号段双缓冲优化

class DoubleBufferSegmentGenerator {
  private currentSegment: Segment | null = null;
  private nextSegment: Segment | null = null;
  private isLoading = false;

  constructor(
    private db: Database,
    private businessType: string,
    private threshold = 0.8 // 当前号段使用80%时预取
  ) {}

  async generate(): Promise<number> {
    // 检查是否需要预取
    if (this.currentSegment &&
        this.currentSegment.usageRate() > this.threshold &&
        !this.nextSegment &&
        !this.isLoading) {
      this.prefetchNextSegment();
    }

    // 当前号段耗尽，切换到下一个
    if (!this.currentSegment || this.currentSegment.isExhausted()) {
      if (this.nextSegment) {
        this.currentSegment = this.nextSegment;
        this.nextSegment = null;
      } else {
        this.currentSegment = await this.fetchNewSegment();
      }
    }

    return this.currentSegment.nextId();
  }

  private prefetchNextSegment(): void {
    this.isLoading = true;
    this.fetchNewSegment()
      .then(segment => {
        this.nextSegment = segment;
      })
      .finally(() => {
        this.isLoading = false;
      });
  }

  private async fetchNewSegment(): Promise<Segment> {
    // 同DatabaseSegmentGenerator
    return this.db.transaction(async (trx) => {
      const row = await trx('id_generator')
        .where('business_type', this.businessType)
        .forUpdate()
        .first();

      const maxId = row.max_id;
      const step = row.step;

      await trx('id_generator')
        .where('business_type', this.businessType)
        .update({ max_id: maxId + step });

      return new Segment(maxId, maxId + step);
    });
  }
}

// 5. Redis原子自增

class RedisIdGenerator {
  constructor(private redis: RedisClient) {}

  async generate(key: string): Promise<number> {
    return this.redis.incr(`id:${key}`);
  }

  async generateWithBatch(key: string, count: number): Promise<number[]> {
    const end = await this.redis.incrby(`id:${key}`, count);
    const start = end - count + 1;

    return Array.from({ length: count }, (_, i) => start + i);
  }

  // 带时间戳的ID
  async generateTimestamped(key: string): Promise<string> {
    const timestamp = Date.now().toString(36);
    const sequence = await this.redis.incr(`id:${key}:${timestamp}`);

    return `${timestamp}-${sequence.toString(36).padStart(4, '0')}`;
  }
}

// 6. 组合ID生成器

class CompositeIdGenerator {
  // 格式：时间戳(42位) + 业务类型(8位) + 序列号(14位)

  constructor(
    private businessTypeId: number,
    private sequenceGenerator: SequenceGenerator
  ) {}

  async generate(): Promise<bigint> {
    const timestamp = BigInt(Date.now());
    const sequence = await this.sequenceGenerator.next();

    return (timestamp << 22n) |
           (BigInt(this.businessTypeId) << 14n) |
           BigInt(sequence);
  }

  parse(id: bigint): ParsedCompositeId {
    const sequence = Number(id & 0x3FFFn);
    const businessType = Number((id >> 14n) & 0xFFn);
    const timestamp = Number(id >> 22n);

    return {
      timestamp: new Date(timestamp),
      businessType,
      sequence
    };
  }
}

interface ParsedCompositeId {
  timestamp: Date;
  businessType: number;
  sequence: number;
}
```

---


## 5. 可靠性模式

### 5.1 熔断器（Circuit Breaker）

#### 定义与形式化

熔断器防止故障级联，当错误率达到阈值时，快速失败而不是继续尝试可能失败的操作。

**状态机：**

$$\text{State} \in \{CLOSED, OPEN, HALF\_OPEN\}$$

**状态转换：**

- $CLOSED \xrightarrow{failure\_rate > threshold} OPEN$
- $OPEN \xrightarrow{timeout} HALF\_OPEN$
- $HALF\_OPEN \xrightarrow{success} CLOSED$
- $HALF\_OPEN \xrightarrow{failure} OPEN$

```typescript
// 熔断器实现

enum CircuitBreakerState {
  CLOSED = 'CLOSED',       // 正常状态，请求通过
  OPEN = 'OPEN',           // 熔断状态，请求快速失败
  HALF_OPEN = 'HALF_OPEN'  // 半开状态，试探性放行
}

interface CircuitBreakerConfig {
  failureThreshold: number;      // 触发熔断的失败次数阈值
  successThreshold: number;      // 半开状态恢复所需的连续成功次数
  timeout: number;               // 熔断持续时间（毫秒）
  halfOpenMaxCalls?: number;     // 半开状态最大试探请求数
}

interface CircuitBreakerMetrics {
  state: CircuitBreakerState;
  failureCount: number;
  successCount: number;
  lastFailureTime: number;
  totalRequests: number;
  totalFailures: number;
}

class CircuitBreaker {
  private state: CircuitBreakerState = CircuitBreakerState.CLOSED;
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime = 0;
  private halfOpenCalls = 0;
  private metrics: CircuitBreakerMetrics;

  constructor(
    private config: CircuitBreakerConfig,
    private name: string
  ) {
    this.metrics = this.createMetrics();
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === CircuitBreakerState.OPEN) {
      if (this.shouldAttemptReset()) {
        this.transitionTo(CircuitBreakerState.HALF_OPEN);
      } else {
        throw new CircuitBreakerOpenError(
          `Circuit breaker '${this.name}' is OPEN`
        );
      }
    }

    if (this.state === CircuitBreakerState.HALF_OPEN) {
      if (this.halfOpenCalls >= (this.config.halfOpenMaxCalls || 3)) {
        throw new CircuitBreakerOpenError(
          `Circuit breaker '${this.name}' HALF_OPEN limit reached`
        );
      }
      this.halfOpenCalls++;
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;

    if (this.state === CircuitBreakerState.HALF_OPEN) {
      this.successCount++;

      if (this.successCount >= this.config.successThreshold) {
        this.transitionTo(CircuitBreakerState.CLOSED);
      }
    }

    this.updateMetrics();
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.state === CircuitBreakerState.HALF_OPEN) {
      this.transitionTo(CircuitBreakerState.OPEN);
    } else if (
      this.state === CircuitBreakerState.CLOSED &&
      this.failureCount >= this.config.failureThreshold
    ) {
      this.transitionTo(CircuitBreakerState.OPEN);
    }

    this.updateMetrics();
  }

  private shouldAttemptReset(): boolean {
    return Date.now() - this.lastFailureTime >= this.config.timeout;
  }

  private transitionTo(newState: CircuitBreakerState): void {
    const oldState = this.state;
    this.state = newState;

    // 重置计数器
    if (newState === CircuitBreakerState.CLOSED) {
      this.failureCount = 0;
      this.successCount = 0;
      this.halfOpenCalls = 0;
    } else if (newState === CircuitBreakerState.HALF_OPEN) {
      this.successCount = 0;
      this.halfOpenCalls = 0;
    }

    console.log(`[CircuitBreaker] ${this.name}: ${oldState} -> ${newState}`);

    // 触发状态变更事件
    this.emitStateChange(oldState, newState);
  }

  private emitStateChange(from: CircuitBreakerState, to: CircuitBreakerState): void {
    // 可以集成事件系统
  }

  getState(): CircuitBreakerState {
    return this.state;
  }

  getMetrics(): CircuitBreakerMetrics {
    return { ...this.metrics };
  }

  private createMetrics(): CircuitBreakerMetrics {
    return {
      state: this.state,
      failureCount: 0,
      successCount: 0,
      lastFailureTime: 0,
      totalRequests: 0,
      totalFailures: 0,
    };
  }

  private updateMetrics(): void {
    this.metrics = {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime,
      totalRequests: this.metrics.totalRequests + 1,
      totalFailures: this.state === CircuitBreakerState.OPEN
        ? this.metrics.totalFailures + 1
        : this.metrics.totalFailures,
    };
  }
}

// 熔断器注册表
class CircuitBreakerRegistry {
  private breakers = new Map<string, CircuitBreaker>();

  getOrCreate(name: string, config: CircuitBreakerConfig): CircuitBreaker {
    if (!this.breakers.has(name)) {
      this.breakers.set(name, new CircuitBreaker(config, name));
    }
    return this.breakers.get(name)!;
  }

  getMetrics(): Record<string, CircuitBreakerMetrics> {
    const metrics: Record<string, CircuitBreakerMetrics> = {};
    for (const [name, breaker] of this.breakers) {
      metrics[name] = breaker.getMetrics();
    }
    return metrics;
  }
}

// 装饰器风格使用
function CircuitBreakerDecorator(
  config: CircuitBreakerConfig
) {
  const registry = new CircuitBreakerRegistry();

  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const breaker = registry.getOrCreate(
      `${target.constructor.name}.${propertyKey}`,
      config
    );

    descriptor.value = async function (...args: any[]) {
      return breaker.execute(() => originalMethod.apply(this, args));
    };
  };
}

// 使用示例
class UserService {
  private httpClient: HttpClient;

  @CircuitBreakerDecorator({
    failureThreshold: 5,
    successThreshold: 3,
    timeout: 30000,
    halfOpenMaxCalls: 2
  })
  async getUser(userId: string): Promise<User> {
    return this.httpClient.get(`/users/${userId}`);
  }

  @CircuitBreakerDecorator({
    failureThreshold: 3,
    successThreshold: 2,
    timeout: 60000
  })
  async createUser(userData: CreateUserRequest): Promise<User> {
    return this.httpClient.post('/users', userData);
  }
}

// 自定义错误
class CircuitBreakerOpenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CircuitBreakerOpenError';
  }
}
```

#### 反例：错误的熔断器使用

```typescript
// ❌ 错误：熔断器范围过大
class WrongCircuitBreakerScope {
  private breaker = new CircuitBreaker({
    failureThreshold: 5,
    successThreshold: 3,
    timeout: 30000
  }, 'all-operations');

  async anyOperation(): Promise<any> {
    // 错误：所有操作共享一个熔断器
    // 问题：一个慢操作会影响所有其他操作
    return this.breaker.execute(() => this.doSomething());
  }
}

// ❌ 错误：忽略熔断器状态
class IgnoreCircuitBreakerState {
  async callService(): Promise<any> {
    try {
      return await this.service.call();
    } catch (error) {
      if (error instanceof CircuitBreakerOpenError) {
        // 错误：直接重试，无视熔断器
        return await this.service.call();
      }
      throw error;
    }
  }
}
```

---

### 5.2 限流（Rate Limiting）

#### 定义与形式化

限流控制单位时间内允许的请求数量，防止系统过载。

**形式化定义：**

设限流窗口为 $W$，限制数量为 $N$，则：

$$\forall t: count(requests \in [t, t+W]) \leq N$$

```typescript
// 限流算法实现

// 1. 令牌桶算法

interface TokenBucketConfig {
  capacity: number;        // 桶容量
  refillRate: number;      // 每秒填充令牌数
  initialTokens?: number;  // 初始令牌数
}

class TokenBucket {
  private tokens: number;
  private lastRefillTime: number;

  constructor(private config: TokenBucketConfig) {
    this.tokens = config.initialTokens ?? config.capacity;
    this.lastRefillTime = Date.now();
  }

  consume(tokens = 1): boolean {
    this.refill();

    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      return true;
    }

    return false;
  }

  private refill(): void {
    const now = Date.now();
    const elapsedMs = now - this.lastRefillTime;
    const tokensToAdd = (elapsedMs / 1000) * this.config.refillRate;

    this.tokens = Math.min(
      this.config.capacity,
      this.tokens + tokensToAdd
    );

    this.lastRefillTime = now;
  }

  getAvailableTokens(): number {
    this.refill();
    return this.tokens;
  }
}

// 2. 漏桶算法

interface LeakyBucketConfig {
  capacity: number;      // 桶容量
  leakRate: number;      // 每秒漏出请求数
}

class LeakyBucket {
  private volume = 0;
  private lastLeakTime: number;

  constructor(private config: LeakyBucketConfig) {
    this.lastLeakTime = Date.now();
  }

  addRequest(): boolean {
    this.leak();

    if (this.volume < this.config.capacity) {
      this.volume++;
      return true;
    }

    return false; // 桶满，请求被拒绝
  }

  private leak(): void {
    const now = Date.now();
    const elapsedMs = now - this.lastLeakTime;
    const requestsToLeak = (elapsedMs / 1000) * this.config.leakRate;

    this.volume = Math.max(0, this.volume - requestsToLeak);
    this.lastLeakTime = now;
  }
}

// 3. 滑动窗口计数器

interface SlidingWindowConfig {
  windowSizeMs: number;  // 窗口大小
  maxRequests: number;   // 窗口内最大请求数
}

class SlidingWindowCounter {
  private requests: number[] = [];

  constructor(private config: SlidingWindowConfig) {}

  allowRequest(): boolean {
    const now = Date.now();
    const windowStart = now - this.config.windowSizeMs;

    // 移除窗口外的请求记录
    this.requests = this.requests.filter(time => time > windowStart);

    if (this.requests.length < this.config.maxRequests) {
      this.requests.push(now);
      return true;
    }

    return false;
  }

  getCurrentCount(): number {
    const windowStart = Date.now() - this.config.windowSizeMs;
    return this.requests.filter(time => time > windowStart).length;
  }
}

// 4. 分布式限流（Redis实现）

import { Redis } from 'ioredis';

class DistributedRateLimiter {
  constructor(private redis: Redis) {}

  // 令牌桶分布式实现
  async tokenBucketCheck(
    key: string,
    config: TokenBucketConfig
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const luaScript = `
      local key = KEYS[1]
      local capacity = tonumber(ARGV[1])
      local refillRate = tonumber(ARGV[2])
      local requested = tonumber(ARGV[3])
      local now = tonumber(ARGV[4])

      local bucket = redis.call('HMGET', key, 'tokens', 'last_refill')
      local tokens = tonumber(bucket[1]) or capacity
      local lastRefill = tonumber(bucket[2]) or now

      -- 计算新令牌
      local elapsed = now - lastRefill
      local newTokens = math.min(capacity, tokens + (elapsed / 1000) * refillRate)

      -- 检查是否足够
      if newTokens >= requested then
        newTokens = newTokens - requested
        redis.call('HMSET', key, 'tokens', newTokens, 'last_refill', now)
        redis.call('EXPIRE', key, 60)
        return {1, math.floor(newTokens), 0}
      else
        redis.call('HMSET', key, 'tokens', newTokens, 'last_refill', now)
        local resetTime = math.ceil((requested - newTokens) / refillRate * 1000)
        return {0, math.floor(newTokens), resetTime}
      end
    `;

    const result = await this.redis.eval(
      luaScript,
      1,
      key,
      config.capacity,
      config.refillRate,
      1,
      Date.now()
    ) as [number, number, number];

    return {
      allowed: result[0] === 1,
      remaining: result[1],
      resetTime: result[2]
    };
  }

  // 滑动窗口分布式实现
  async slidingWindowCheck(
    key: string,
    config: SlidingWindowConfig
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const now = Date.now();
    const windowStart = now - config.windowSizeMs;

    const pipeline = this.redis.pipeline();

    // 移除窗口外的请求
    pipeline.zremrangebyscore(key, 0, windowStart);

    // 获取当前窗口内的请求数
    pipeline.zcard(key);

    // 添加当前请求
    pipeline.zadd(key, now, `${now}-${Math.random()}`);

    // 设置过期时间
    pipeline.expire(key, Math.ceil(config.windowSizeMs / 1000));

    const results = await pipeline.exec();
    const currentCount = results![1][1] as number;

    const allowed = currentCount < config.maxRequests;
    const remaining = Math.max(0, config.maxRequests - currentCount - 1);

    // 获取窗口中最早的请求时间
    const oldestRequest = await this.redis.zrange(key, 0, 0, 'WITHSCORES');
    const resetTime = oldestRequest.length > 0
      ? parseInt(oldestRequest[1]) + config.windowSizeMs - now
      : 0;

    return { allowed, remaining, resetTime };
  }
}

// 5. 限流中间件

interface RateLimitMiddlewareConfig {
  keyGenerator: (req: Request) => string;
  limiter: RateLimiter;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  handler?: (req: Request, res: Response) => void;
}

class RateLimitMiddleware {
  constructor(private config: RateLimitMiddlewareConfig) {}

  middleware() {
    return async (req: Request, res: Response, next: NextFunction) => {
      const key = this.config.keyGenerator(req);

      const result = await this.config.limiter.check(key);

      // 设置响应头
      res.setHeader('X-RateLimit-Limit', result.limit);
      res.setHeader('X-RateLimit-Remaining', result.remaining);
      res.setHeader('X-RateLimit-Reset', result.resetTime);

      if (!result.allowed) {
        res.setHeader('Retry-After', Math.ceil(result.resetTime / 1000));

        if (this.config.handler) {
          return this.config.handler(req, res);
        }

        return res.status(429).json({
          error: 'Too Many Requests',
          retryAfter: Math.ceil(result.resetTime / 1000)
        });
      }

      // 记录响应状态
      res.on('finish', () => {
        if (this.config.skipSuccessfulRequests && res.statusCode < 400) {
          this.config.limiter.decrement(key);
        }
        if (this.config.skipFailedRequests && res.statusCode >= 400) {
          this.config.limiter.decrement(key);
        }
      });

      next();
    };
  }
}

// 使用示例
const rateLimit = new RateLimitMiddleware({
  keyGenerator: (req) => {
    // 按用户ID限流
    return req.user?.id || req.ip;
  },
  limiter: new DistributedRateLimiter(redis),
  handler: (req, res) => {
    res.status(429).json({
      error: 'Rate limit exceeded',
      upgradeUrl: '/billing'
    });
  }
});

app.use('/api/', rateLimit.middleware());
```

---

### 5.3 降级（Degradation）

#### 定义与原理

降级是在系统负载过高或部分故障时，主动降低服务质量以保证核心功能可用。

```typescript
// 降级策略实现

interface DegradationStrategy {
  shouldDegrade(context: RequestContext): boolean;
  getDegradedResponse(context: RequestContext): Promise<any>;
}

// 1. 功能降级

class FeatureDegradation {
  private strategies = new Map<string, DegradationStrategy>();

  register(feature: string, strategy: DegradationStrategy): void {
    this.strategies.set(feature, strategy);
  }

  async execute<T>(
    feature: string,
    normalFn: () => Promise<T>,
    context: RequestContext
  ): Promise<T> {
    const strategy = this.strategies.get(feature);

    if (strategy?.shouldDegrade(context)) {
      console.log(`[Degradation] Feature '${feature}' degraded`);
      return strategy.getDegradedResponse(context) as T;
    }

    return normalFn();
  }
}

// 电商系统降级示例
class EcommerceDegradation {
  private degradation = new FeatureDegradation();

  constructor() {
    this.setupDegradationStrategies();
  }

  private setupDegradationStrategies(): void {
    // 推荐服务降级
    this.degradation.register('recommendations', {
      shouldDegrade: (ctx) => ctx.load > 0.8 || ctx.recommendationServiceDown,
      getDegradedResponse: async () => {
        // 返回热门商品代替个性化推荐
        return this.getPopularProducts();
      }
    });

    // 库存查询降级
    this.degradation.register('inventory-check', {
      shouldDegrade: (ctx) => ctx.inventoryServiceSlow,
      getDegradedResponse: async () => {
        // 假设有库存，允许下单后异步校验
        return { available: true, deferred: true };
      }
    });

    // 价格计算降级
    this.degradation.register('price-calculation', {
      shouldDegrade: (ctx) => ctx.pricingServiceDown,
      getDegradedResponse: async (ctx) => {
        // 使用缓存价格
        return this.getCachedPrice(ctx.productId);
      }
    });

    // 物流查询降级
    this.degradation.register('shipping-estimate', {
      shouldDegrade: (ctx) => ctx.shippingServiceDown,
      getDegradedResponse: async () => {
        // 返回默认估算时间
        return { estimatedDays: '3-5', isDefault: true };
      }
    });
  }

  async getProductPage(productId: string, context: RequestContext): Promise<ProductPage> {
    const [product, recommendations, inventory, price, shipping] = await Promise.all([
      this.getProduct(productId),
      this.degradation.execute('recommendations',
        () => this.getRecommendations(productId), context),
      this.degradation.execute('inventory-check',
        () => this.checkInventory(productId), context),
      this.degradation.execute('price-calculation',
        () => this.calculatePrice(productId), context),
      this.degradation.execute('shipping-estimate',
        () => this.estimateShipping(productId), context),
    ]);

    return { product, recommendations, inventory, price, shipping };
  }
}

// 2. 数据降级

class DataDegradation {
  private cache: Cache;
  private fallbackData: Map<string, any>;

  async getDataWithDegradation<T>(
    key: string,
    fetchFn: () => Promise<T>,
    options: DegradationOptions
  ): Promise<T> {
    try {
      // 尝试正常获取
      const data = await fetchFn();

      // 缓存成功结果
      await this.cache.set(key, data, options.cacheTtl);

      return data;
    } catch (error) {
      console.warn(`[Degradation] Fetch failed for ${key}, using fallback`);

      // 1. 尝试读取缓存
      const cached = await this.cache.get<T>(key);
      if (cached) {
        console.log(`[Degradation] Using cached data for ${key}`);
        return cached;
      }

      // 2. 使用默认值
      if (options.defaultValue !== undefined) {
        return options.defaultValue;
      }

      // 3. 使用静态fallback
      const fallback = this.fallbackData.get(key);
      if (fallback) {
        return fallback;
      }

      // 4. 构造空响应
      if (options.emptyResponse) {
        return options.emptyResponse;
      }

      throw error;
    }
  }
}

// 3. 静态化降级

class StaticFallbackDegradation {
  private staticPages: Map<string, string>;

  async handleRequest(req: Request, res: Response): Promise<void> {
    try {
      // 尝试动态生成
      const dynamicContent = await this.generateDynamicContent(req);
      res.send(dynamicContent);
    } catch (error) {
      // 降级到静态页面
      const staticPage = this.getStaticFallback(req.path);

      if (staticPage) {
        console.log(`[Degradation] Serving static fallback for ${req.path}`);
        res.setHeader('X-Degraded', 'true');
        res.send(staticPage);
      } else {
        res.status(503).send('Service Temporarily Unavailable');
      }
    }
  }

  private getStaticFallback(path: string): string | null {
    // 预生成的静态页面
    return this.staticPages.get(path) || this.staticPages.get('/fallback');
  }
}
```

---

### 5.4 重试（Retry）

#### 定义与形式化

重试在操作失败时自动重试，应对临时性故障。

**形式化定义：**

设操作 $op$ 的成功概率为 $p$，最大重试次数为 $n$，则成功概率：

$$P(success) = 1 - (1 - p)^n$$

```typescript
// 重试策略实现

interface RetryConfig {
  maxAttempts: number;           // 最大重试次数
  delay: number;                 // 初始延迟（毫秒）
  backoffStrategy: 'fixed' | 'linear' | 'exponential' | 'jitter';
  backoffMultiplier?: number;    // 退乘数
  maxDelay?: number;             // 最大延迟
  retryableErrors?: string[];    // 可重试的错误类型
  nonRetryableErrors?: string[]; // 不可重试的错误类型
  onRetry?: (attempt: number, error: Error, delay: number) => void;
}

class RetryPolicy {
  constructor(private config: RetryConfig) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= this.config.maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;

        // 检查是否应该重试
        if (!this.shouldRetry(error as Error, attempt)) {
          throw error;
        }

        // 计算延迟
        const delay = this.calculateDelay(attempt);

        // 回调
        this.config.onRetry?.(attempt, lastError, delay);

        // 等待后重试
        if (attempt < this.config.maxAttempts) {
          await this.sleep(delay);
        }
      }
    }

    throw lastError!;
  }

  private shouldRetry(error: Error, attempt: number): boolean {
    // 达到最大重试次数
    if (attempt >= this.config.maxAttempts) {
      return false;
    }

    // 检查不可重试错误
    if (this.config.nonRetryableErrors) {
      for (const errorType of this.config.nonRetryableErrors) {
        if (error.name === errorType || error.message.includes(errorType)) {
          return false;
        }
      }
    }

    // 检查可重试错误
    if (this.config.retryableErrors) {
      for (const errorType of this.config.retryableErrors) {
        if (error.name === errorType || error.message.includes(errorType)) {
          return true;
        }
      }
      // 如果指定了可重试错误，其他错误不重试
      return false;
    }

    // 默认重试
    return true;
  }

  private calculateDelay(attempt: number): number {
    const baseDelay = this.config.delay;
    const multiplier = this.config.backoffMultiplier || 2;
    const maxDelay = this.config.maxDelay || 30000;

    let delay: number;

    switch (this.config.backoffStrategy) {
      case 'fixed':
        delay = baseDelay;
        break;

      case 'linear':
        delay = baseDelay * attempt;
        break;

      case 'exponential':
        delay = baseDelay * Math.pow(multiplier, attempt - 1);
        break;

      case 'jitter':
        // 指数退避 + 随机抖动
        const expDelay = baseDelay * Math.pow(multiplier, attempt - 1);
        delay = expDelay * (0.5 + Math.random() * 0.5);
        break;

      default:
        delay = baseDelay;
    }

    return Math.min(delay, maxDelay);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 装饰器风格
function Retryable(config: RetryConfig) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const retryPolicy = new RetryPolicy(config);

    descriptor.value = async function (...args: any[]) {
      return retryPolicy.execute(() => originalMethod.apply(this, args));
    };
  };
}

// 使用示例
class PaymentService {
  @Retryable({
    maxAttempts: 3,
    delay: 1000,
    backoffStrategy: 'exponential',
    retryableErrors: ['ECONNRESET', 'ETIMEDOUT', 'ServiceUnavailableError'],
    nonRetryableErrors: ['ValidationError', 'InsufficientFundsError'],
    onRetry: (attempt, error, delay) => {
      console.log(`Retry attempt ${attempt} after ${delay}ms: ${error.message}`);
    }
  })
  async processPayment(payment: PaymentRequest): Promise<PaymentResult> {
    return this.paymentGateway.charge(payment);
  }
}

// 断路器 + 重试组合
class ResilientHttpClient {
  private circuitBreaker: CircuitBreaker;
  private retryPolicy: RetryPolicy;

  constructor() {
    this.circuitBreaker = new CircuitBreaker({
      failureThreshold: 5,
      successThreshold: 3,
      timeout: 30000
    }, 'http-client');

    this.retryPolicy = new RetryPolicy({
      maxAttempts: 3,
      delay: 1000,
      backoffStrategy: 'exponential'
    });
  }

  async request(config: RequestConfig): Promise<Response> {
    return this.circuitBreaker.execute(() =>
      this.retryPolicy.execute(() => this.doRequest(config))
    );
  }
}
```

#### 反例：错误的重试设计

```typescript
// ❌ 错误：对所有错误都重试
class BadRetryAllErrors {
  async callService(): Promise<any> {
    for (let i = 0; i < 3; i++) {
      try {
        return await this.service.call();
      } catch (error) {
        // 错误：对所有错误都重试，包括4xx错误
        await sleep(1000);
      }
    }
  }
}

// ❌ 错误：没有退避策略
class NoBackoffRetry {
  async callService(): Promise<any> {
    for (let i = 0; i < 5; i++) {
      try {
        return await this.service.call();
      } catch (error) {
        // 错误：固定间隔重试，可能导致惊群效应
        await sleep(100);
      }
    }
  }
}

// ❌ 错误：重试嵌套
class NestedRetry {
  @Retryable({ maxAttempts: 3 })
  async outer(): Promise<any> {
    return this.inner(); // inner也有重试
  }

  @Retryable({ maxAttempts: 3 })
  async inner(): Promise<any> {
    return this.service.call();
    // 问题：最多9次调用，指数级增长
  }
}
```

---

### 5.5 幂等性（Idempotency）

#### 定义与形式化

幂等性保证同一操作多次执行的结果与一次执行相同。

**形式化定义：**

操作 $f$ 是幂等的，如果：

$$\forall x: f(f(x)) = f(x)$$

```typescript
// 幂等性实现

interface IdempotencyConfig {
  keyGenerator: (req: Request) => string;
  storage: IdempotencyStorage;
  ttl: number;  // 幂等键有效期
}

interface IdempotencyStorage {
  get(key: string): Promise<IdempotencyRecord | null>;
  set(key: string, record: IdempotencyRecord, ttl: number): Promise<void>;
  delete(key: string): Promise<void>;
}

interface IdempotencyRecord {
  status: 'processing' | 'completed' | 'failed';
  response?: any;
  createdAt: number;
}

class IdempotencyMiddleware {
  constructor(private config: IdempotencyConfig) {}

  middleware() {
    return async (req: Request, res: Response, next: NextFunction) => {
      // 获取幂等键
      const idempotencyKey = req.headers['idempotency-key'] as string;

      if (!idempotencyKey) {
        // 非幂等请求，直接处理
        return next();
      }

      const key = this.config.keyGenerator(req);
      const storageKey = `idempotency:${key}:${idempotencyKey}`;

      // 检查是否已有记录
      const existing = await this.config.storage.get(storageKey);

      if (existing) {
        if (existing.status === 'processing') {
          // 请求正在处理中
          return res.status(409).json({
            error: 'Request is being processed',
            retryAfter: 5
          });
        }

        if (existing.status === 'completed') {
          // 请求已完成，返回缓存响应
          res.setHeader('X-Idempotency-Replay', 'true');
          return res.status(200).json(existing.response);
        }

        if (existing.status === 'failed') {
          // 之前失败了，允许重试
          // 删除旧记录，重新处理
          await this.config.storage.delete(storageKey);
        }
      }

      // 标记为处理中
      await this.config.storage.set(storageKey, {
        status: 'processing',
        createdAt: Date.now()
      }, this.config.ttl);

      // 劫持响应
      const originalJson = res.json.bind(res);
      res.json = (body: any) => {
        // 保存响应
        this.config.storage.set(storageKey, {
          status: res.statusCode >= 200 && res.statusCode < 300
            ? 'completed'
            : 'failed',
          response: body,
          createdAt: Date.now()
        }, this.config.ttl);

        return originalJson(body);
      };

      next();
    };
  }
}

// 数据库幂等操作
class IdempotentOperations {
  constructor(private db: Database) {}

  // 幂等插入（UPSERT）
  async upsert(
    table: string,
    data: Record<string, any>,
    uniqueKey: string
  ): Promise<void> {
    await this.db.execute(`
      INSERT INTO ${table} (${Object.keys(data).join(', ')})
      VALUES (${Object.keys(data).map(() => '?').join(', ')})
      ON CONFLICT (${uniqueKey}) DO UPDATE SET
      ${Object.keys(data).map(k => `${k} = EXCLUDED.${k}`).join(', ')}
    `, Object.values(data));
  }

  // 幂等更新（带版本控制）
  async updateWithVersion(
    table: string,
    id: string,
    data: Record<string, any>,
    expectedVersion: number
  ): Promise<boolean> {
    const result = await this.db.execute(`
      UPDATE ${table}
      SET ${Object.keys(data).map(k => `${k} = ?`).join(', ')}, version = version + 1
      WHERE id = ? AND version = ?
    `, [...Object.values(data), id, expectedVersion]);

    return result.rowCount > 0;
  }

  // 幂等扣减（防止超卖）
  async deductWithCheck(
    productId: string,
    quantity: number,
    operationId: string
  ): Promise<{ success: boolean; remaining: number }> {
    return this.db.transaction(async (trx) => {
      // 检查是否已执行
      const existing = await trx.query(
        'SELECT * FROM operations WHERE id = ?',
        [operationId]
      );

      if (existing.length > 0) {
        // 已执行过，返回之前的结果
        return { success: true, remaining: existing[0].remaining_stock };
      }

      // 执行扣减
      const result = await trx.execute(`
        UPDATE products
        SET stock = stock - ?
        WHERE id = ? AND stock >= ?
        RETURNING stock
      `, [quantity, productId, quantity]);

      if (result.rowCount === 0) {
        return { success: false, remaining: 0 };
      }

      // 记录操作
      await trx.execute(
        'INSERT INTO operations (id, product_id, quantity, remaining_stock) VALUES (?, ?, ?, ?)',
        [operationId, productId, quantity, result.rows[0].stock]
      );

      return { success: true, remaining: result.rows[0].stock };
    });
  }
}

// 消息幂等消费
class IdempotentConsumer {
  private processedMessages = new Set<string>();
  private messageStorage: MessageStorage;

  async consume(message: Message): Promise<void> {
    const messageId = message.messageId;

    // 检查是否已处理
    if (await this.isProcessed(messageId)) {
      console.log(`[IdempotentConsumer] Message ${messageId} already processed, skipping`);
      return;
    }

    try {
      // 处理消息
      await this.processMessage(message);

      // 标记为已处理
      await this.markProcessed(messageId);
    } catch (error) {
      // 处理失败，不标记，允许重试
      throw error;
    }
  }

  private async isProcessed(messageId: string): Promise<boolean> {
    // 内存检查
    if (this.processedMessages.has(messageId)) {
      return true;
    }

    // 持久化存储检查
    return this.messageStorage.exists(messageId);
  }

  private async markProcessed(messageId: string): Promise<void> {
    this.processedMessages.add(messageId);
    await this.messageStorage.save(messageId, {
      processedAt: Date.now()
    });

    // 清理旧记录
    if (this.processedMessages.size > 10000) {
      this.processedMessages.clear();
    }
  }
}
```

---

### 5.6 分布式追踪

#### 定义与原理

分布式追踪记录请求在分布式系统中的完整调用链。

**形式化模型：**

追踪 $T$ 是有向无环图 $G = (S, E)$，其中：

- $S$ 是Span集合（操作单元）
- $E$ 是父子关系边

```typescript
// 分布式追踪实现

import { trace, context, Span, SpanStatusCode, SpanKind } from '@opentelemetry/api';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { Resource } from '@opentelemetry/resources';

// 追踪配置
interface TracingConfig {
  serviceName: string;
  serviceVersion: string;
  jaegerEndpoint: string;
  samplingRate: number;
}

class DistributedTracer {
  private tracer: any;

  constructor(config: TracingConfig) {
    const sdk = new NodeSDK({
      resource: new Resource({
        'service.name': config.serviceName,
        'service.version': config.serviceVersion,
      }),
      traceExporter: new JaegerExporter({
        endpoint: config.jaegerEndpoint,
      }),
      sampler: {
        shouldSample: () => Math.random() < config.samplingRate
      }
    });

    sdk.start();
    this.tracer = trace.getTracer(config.serviceName, config.serviceVersion);
  }

  // 创建Span
  createSpan(
    name: string,
    options?: {
      kind?: SpanKind;
      attributes?: Record<string, any>;
      parent?: Span;
    }
  ): Span {
    const ctx = options?.parent
      ? trace.setSpan(context.active(), options.parent)
      : context.active();

    return this.tracer.startSpan(name, {
      kind: options?.kind || SpanKind.INTERNAL,
      attributes: options?.attributes,
    }, ctx);
  }

  // 自动追踪函数
  async trace<T>(
    name: string,
    fn: (span: Span) => Promise<T>,
    options?: {
      attributes?: Record<string, any>;
    }
  ): Promise<T> {
    const span = this.createSpan(name, { attributes: options?.attributes });

    try {
      const result = await fn(span);
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: (error as Error).message,
      });
      span.recordException(error as Error);
      throw error;
    } finally {
      span.end();
    }
  }
}

// Express中间件集成
function tracingMiddleware(tracer: DistributedTracer) {
  return (req: Request, res: Response, next: NextFunction) => {
    const span = tracer.createSpan(`${req.method} ${req.path}`, {
      kind: SpanKind.SERVER,
      attributes: {
        'http.method': req.method,
        'http.url': req.url,
        'http.route': req.route?.path,
        'http.client_ip': req.ip,
        'http.user_agent': req.headers['user-agent'],
      }
    });

    // 将span附加到请求
    req.span = span;

    // 传播追踪上下文
    const traceParent = `00-${span.spanContext().traceId}-${span.spanContext().spanId}-01`;
    res.setHeader('traceparent', traceParent);

    res.on('finish', () => {
      span.setAttributes({
        'http.status_code': res.statusCode,
        'http.response_size': res.getHeader('content-length'),
      });

      if (res.statusCode >= 400) {
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: `HTTP ${res.statusCode}`,
        });
      }

      span.end();
    });

    next();
  };
}

// HTTP客户端集成
class TracedHttpClient {
  constructor(
    private httpClient: HttpClient,
    private tracer: DistributedTracer
  ) {}

  async request(config: RequestConfig): Promise<Response> {
    const span = this.tracer.createSpan(`HTTP ${config.method}`, {
      kind: SpanKind.CLIENT,
      attributes: {
        'http.method': config.method,
        'http.url': config.url,
        'http.target': new URL(config.url).pathname,
        'http.host': new URL(config.url).host,
      }
    });

    // 注入追踪上下文
    config.headers = config.headers || {};
    config.headers['traceparent'] = `00-${span.spanContext().traceId}-${span.spanContext().spanId}-01`;

    try {
      const response = await this.httpClient.request(config);

      span.setAttributes({
        'http.status_code': response.status,
        'http.response_size': response.headers['content-length'],
      });

      return response;
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: (error as Error).message,
      });
      span.recordException(error as Error);
      throw error;
    } finally {
      span.end();
    }
  }
}

// 数据库查询追踪
class TracedDatabase {
  constructor(
    private db: Database,
    private tracer: DistributedTracer
  ) {}

  async query(sql: string, params?: any[]): Promise<any> {
    const span = this.tracer.createSpan('db.query', {
      attributes: {
        'db.system': 'postgresql',
        'db.statement': sql,
        'db.operation': sql.split(' ')[0].toLowerCase(),
      }
    });

    const startTime = Date.now();

    try {
      const result = await this.db.query(sql, params);

      span.setAttributes({
        'db.response.returned_rows': result.rowCount,
        'db.response.duration_ms': Date.now() - startTime,
      });

      return result;
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: (error as Error).message,
      });
      throw error;
    } finally {
      span.end();
    }
  }
}

// 消息队列追踪
class TracedMessageProducer {
  constructor(
    private producer: MessageProducer,
    private tracer: DistributedTracer
  ) {}

  async send(topic: string, message: Message): Promise<void> {
    const span = this.tracer.createSpan(`send ${topic}`, {
      kind: SpanKind.PRODUCER,
      attributes: {
        'messaging.system': 'kafka',
        'messaging.destination': topic,
        'messaging.destination_kind': 'topic',
      }
    });

    // 注入追踪上下文到消息头
    message.headers = message.headers || {};
    message.headers['traceparent'] = `00-${span.spanContext().traceId}-${span.spanContext().spanId}-01`;

    try {
      await this.producer.send(topic, message);
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: (error as Error).message,
      });
      throw error;
    } finally {
      span.end();
    }
  }
}

// 日志与追踪关联
class CorrelatedLogger {
  constructor(private tracer: DistributedTracer) {}

  log(level: string, message: string, meta?: Record<string, any>): void {
    const span = trace.getSpan(context.active());

    const logEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      traceId: span?.spanContext().traceId,
      spanId: span?.spanContext().spanId,
      ...meta,
    };

    console.log(JSON.stringify(logEntry));
  }
}

// 追踪分析
class TraceAnalyzer {
  // 查找慢请求
  async findSlowTraces(
    minDuration: number,
    timeRange: { start: Date; end: Date }
  ): Promise<Trace[]> {
    // 查询Jaeger API
    const response = await fetch(
      `${this.jaegerUrl}/api/traces?` +
      `service=${this.serviceName}&` +
      `minDuration=${minDuration}ms&` +
      `start=${timeRange.start.getTime() * 1000}&` +
      `end=${timeRange.end.getTime() * 1000}`
    );

    return (await response.json()).data;
  }

  // 查找错误请求
  async findErrorTraces(timeRange: { start: Date; end: Date }): Promise<Trace[]> {
    const response = await fetch(
      `${this.jaegerUrl}/api/traces?` +
      `service=${this.serviceName}&` +
      `tags={"error":"true"}&` +
      `start=${timeRange.start.getTime() * 1000}&` +
      `end=${timeRange.end.getTime() * 1000}`
    );

    return (await response.json()).data;
  }

  // 服务依赖分析
  async analyzeServiceDependencies(): Promise<ServiceDependencyGraph> {
    const traces = await this.getAllTraces();

    const graph: ServiceDependencyGraph = {};

    for (const trace of traces) {
      for (const span of trace.spans) {
        const service = span.process.serviceName;
        const parentService = this.findParentService(span, trace);

        if (parentService && parentService !== service) {
          if (!graph[parentService]) {
            graph[parentService] = [];
          }
          if (!graph[parentService].includes(service)) {
            graph[parentService].push(service);
          }
        }
      }
    }

    return graph;
  }
}
```

---

## 总结

本文档全面梳理了分布式系统的核心设计模型，涵盖：

1. **基础理论**: CAP定理、BASE理论、PACELC定理、一致性模型
2. **通信模式**: RPC（gRPC/tRPC/JSON-RPC）、消息队列、事件驱动（Event Sourcing/CQRS）、流处理
3. **服务架构**: 微服务、服务网格、Serverless、边缘计算
4. **数据管理**: 分片（一致性哈希）、复制（主从/多主/无主）、分布式事务（2PC/3PC/Saga/TCC）、ID生成
5. **可靠性模式**: 熔断器、限流、降级、重试、幂等性、分布式追踪

每种模式都包含：

- 形式化定义和原理
- TypeScript/Node.js实现示例
- 反例（错误设计）
- 适用场景分析

---

*文档版本: 1.0*
*最后更新: 2024*
