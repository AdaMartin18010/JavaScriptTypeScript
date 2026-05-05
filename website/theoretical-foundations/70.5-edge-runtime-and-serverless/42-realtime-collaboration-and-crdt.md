---
title: '实时协作与 CRDT'
description: 'CRDTs, Operational Transform, Yjs, Automerge 2.0, Loro, PartyKit/Liveblocks, and edge synchronization strategies'
---

# 实时协作与 CRDT

> 理论深度: 高级 | 目标读者: 分布式系统工程师、协作应用开发者、边缘计算架构师

## 核心观点

1. **CRDT 的数学基础是单调半格**：若将复制状态建模为半格元素、更新建模为单调函数，则无论操作顺序和网络分区如何，各副本通过反复取 join 即可收敛到一致状态。这是无需服务器仲裁即可实现最终一致性的数学保证。

2. **OT 与 CRDT 是状态空间与操作空间的对偶**：OT 在操作空间中通过变换函数解决并发，需要中央服务器定义全局操作顺序；CRDT 在状态空间中通过合并函数解决并发，可在边缘完全自治。TP2 的不可能性定理证明：通用操作集上不存在同时满足 TP1 和 TP2 的变换函数。

3. **文本 CRDT 的交错异常是经典陷阱**：两个用户并发插入字符串时，若位置标识符排序不当，可能产生字符交错（如期望 `"abcxyz"` 却得到 `"axbycz"`）。Yjs 的 YATA 算法通过 `origin` + `rightOrigin` 双锚定、Loro 的 Fugue 算法通过树状路径选择，有效缓解此问题。

4. **墓碑累积是长期运行的性能杀手**：CRDT 的收敛性依赖保留已删除元素的元数据。高频编辑系统一年后可能有数百万墓碑，加载时间从毫秒退化到秒级。需通过时钟累积 GC（Yjs 默认开启）、定期快照归档或有界增长设计控制。

5. **边缘同步策略与 CRDT 类型选择同等重要**：WebSocket 实时同步（边缘节点维护热缓存，同 PoP < 1ms）、周期性合并（因果切割保证正确性）、Delta Sync（状态向量控制带宽）、短暂/持久对等节点分层架构（Figma/Notion 的生产模式）。

## 关键概念

### 半格与 CRDT 的形式化定义

**偏序集** $(S, \leq)$ 中，若任意两个元素都有最小上界（Least Upper Bound, LUB），则称为 **join 半格**，记作 $a \vee b$。

**状态式 CRDT（CvRDT，Convergent Replicated Data Type）**：三元组 $(S, s_0, \vee)$，其中 $S$ 是 join 半格，$s_0$ 是初始状态，$\vee$ 是合并函数。此外存在查询操作 $q: S \to T$ 和更新操作 $u: S \to S$，其中每个更新操作都必须是单调的。

**定理（CvRDT 收敛性）**：设网络中存在 $n$ 个副本，每个副本 $i$ 维护状态 $s_i$。若所有副本以任意顺序、任意频率地执行本地更新和与其他副本的状态合并（$s_i \leftarrow s_i \vee s_j$），且底层网络满足最终传递性（eventual delivery），则所有副本最终将达到相同状态 $s_{final} = \bigvee_{i=1}^n s_i$。

证明概要：由半格结合律和交换律，有限 join 的结果与顺序无关。最终传递性保证每个更新最终会被所有副本观测到。

**操作式 CRDT（CmRDT，Commutative Replicated Data Type）**：四元组 $(S, s_0, A, \text{apply})$，要求操作满足交换性：

$$\text{apply}(a, \text{apply}(b, s)) = \text{apply}(b, \text{apply}(a, s))$$

实际系统（Yjs、Automerge）采用混合策略：操作在因果就绪时按顺序应用，非因果就绪的操作则通过状态合并解决。

### 核心 CRDT 数据类型

**LWW Register（Last-Write-Wins）**：存储值、时间戳（或版本向量）、副本 ID。合并时选择时间戳较大的值；时间戳相同则按副本 ID 字典序仲裁。状态空间构成半格，偏序定义为：$(v_1, t_1, r_1) \leq (v_2, t_2, r_2)$ 当且仅当 $t_1 < t_2$，或 $t_1 = t_2$ 且 $r_1 \leq_{lex} r_2$。

**G-Counter（Grow-Only Counter）**：每个副本维护从副本 ID 到本地计数的映射。查询时返回所有计数之和；合并时对每个副本 ID 取最大值。状态空间是 $\mathbb{N}^n$（$n$ 为副本数），偏序为逐坐标比较，join 为逐坐标取最大值。

**PN-Counter**：由两个 G-Counter 组成（增量 P 和减量 N），查询值为 $P - N$。局限性：不能表示负总数；减量超过增量时语义模糊。

**OR-Set（Observed-Removed Set）**：每个元素赋予全局唯一标记（tag）。添加操作加入 $(value, tag)$ 对，删除操作将已观测的 tag 加入 tombstone 集合 $R$。查询返回添加了但未被删除的标记对应的值（$A \setminus R$）。实现 add-wins 语义。

### Yjs 架构要点

Yjs 是当前 JavaScript 生态中最广泛使用的 CRDT 库。

**Item 链表**：所有序列类型（`Y.Text`、`Y.Array`、`Y.XmlFragment`）底层基于统一的双向链表。每个 `Item` 包含：
- `id: ID` — 唯一标识符，由 `(client, clock)` 对构成
- `origin: ID | null` — 该 Item 插入位置左侧的 Item 的 ID，是并发插入解析的核心
- `rightOrigin: ID | null` — 该 Item 插入位置右侧的 Item 的 ID
- `content: Content` — 实际存储的数据
- `deleted: boolean` — 逻辑删除标记（tombstone）

**并发插入解析（YATA）**：两个客户端在同一位置并发插入时，通过比较 `origin`、`rightOrigin` 和 `id` 确定全序。具体规则：首先按 `origin` 分组；在每个组内按 `(origin.clock, client)` 字典序排列。最终的文档状态是确定性的，与消息到达顺序无关。

**更新编码**：采用自定义二进制编码，包括客户端 ID 去重（变长整数索引引用）、clock 差分编码、内容游程编码、删除集压缩（范围列表而非逐个标记）。

**Awareness Protocol**：轻量级 CRDT，用于同步用户光标、选区、在线状态等短暂状态。基于 `Map<clientID, Meta>`，默认 30 秒超时清理。编码非常紧凑，只包含变更的客户端 ID 和状态 JSON，适合高频广播。

**托管协作基础设施（2026）**：除自托管 Provider 外，PartyKit（基于 Cloudflare Durable Objects，提供房间管理、presence、持久化）和 Liveblocks（商业托管后端，提供 Storage 和 Comments API，与 React/Next.js 深度集成）成为快速启动多人协作应用的重要选项，无需自建 WebSocket 服务器。

### Automerge 与 Loro 的差异

**Automerge**：将整个应用状态视为单一的不可变文档（document），每次变更产生具有新哈希的新文档版本。核心特点：
- 列式存储二进制格式（Rust 核心 `automerge-rs`），压缩率比早期 JSON 格式提升 5-10 倍。性能基准：处理 260,000 次按键操作的文档加载和合并仅需约 **600 毫秒**，相比早期版本有数量级提升
- 显式冲突 API：并发设置同一键时保留所有冲突值
- 原生时间旅行：变更历史图（DAG）支持检出任意版本快照
- Sync Patches 使用 Bloom filter 高效判断缺失操作

**Loro**：Rust 核心 + WASM 绑定，针对富文本编辑、可移动树结构和高性能场景优化：
- 分数索引（fractional indexing）：变长字节串保证全序性、稠密性、有界键长 $O(\log n)$
- MovableTree：通过"创建父节点"和"最新移动父节点"双指针，配合时间戳比较和循环检测，解决树结构并发移动
- Fugue 算法：列表 CRDT 插入密集场景下时间复杂度接近 $O(1)$，位置标识符平均长度 < 20 字节
- 分层日志结构：OpLog（只追加）+ DocState（物化快照）+ Checkout（历史视图）

| 维度 | Yjs | Automerge | Loro |
|------|-----|-----------|------|
| 状态模型 | 可变文档 + 类型树 | 不可变文档快照 | Rust 核心 + WASM |
| 网络协议 | State vector + delta | Sync state + Bloom filter | 同步状态机 + FEC |
| 冲突处理 | 类型语义隐式解决 | 显式冲突 API | 富文本与可移动树 |
| 时间旅行 | 需外部存储更新日志 | 原生支持（文档图） | 轻量级 checkout |
| 二进制格式 | 自定义紧凑编码 | 列式压缩编码 | 分层日志结构 |
| 持久化 | Provider 负责 | `save()` / `load()` | 分层物化 |

### 操作性转换（OT）

OT 通过变换函数 $T$ 调整并发操作：$T(O_1, O_2) = O_1'$，使得对于任意状态 $S$：

$$O_2 \circ O_1'(S) = O_1 \circ O_2'(S)$$

这一性质被称为 **TP1**（Transformation Property 1）。更强的 **TP2** 要求对于三个操作：

$$T(T(O_1, O_2), T(O_3, O_2)) = T(T(O_1, O_3), T(O_2, O_3))$$

TP2 保证了操作日志的收敛性，但已被证明在支持通用操作的系统中不可满足。Google Docs 通过服务器权威和全局操作顺序来回避 TP2 问题。

文本编辑器中的基本操作是 Retain（跳过 n 个字符）、Insert（插入字符串）和 Delete（删除 n 个字符）。两个基本操作的变换规则：
- **Insert-Insert**：若位置相同，按用户 ID 字典序确定性仲裁
- **Insert-Delete**：插入在删除之前且位置 ≤ 删除位置，删除位置后移插入长度
- **Delete-Delete**：区间无重叠则互相调整位置；有重叠则合并删除效果

### 边缘同步策略

**WebSocket 实时同步**：连接通常终止于最近的边缘节点。每个边缘节点维护其连接客户端的文档状态热缓存：
1. Edge PoP 立即将更新广播给同 PoP 内的其他客户端（< 1ms 延迟）
2. Edge PoP 将更新异步复制到 Regional State Store（Redis、DynamoDB Global Tables）
3. Regional State Store 通过 pub/sub 通知其他 Edge PoP
4. 其他 Edge PoP 将更新广播给其客户端

关键优化：边缘节点不应只充当透明代理。它们应该解析并缓存 CRDT 更新（维护本地 state vector 以便快速计算 delta），合并同 PoP 内的更新后再跨 PoP 传播，并以固定频率（60Hz 或 30Hz）聚合 awareness 更新后广播。

**周期性合并与因果切割**：在边缘节点可能长时间断连的场景（IoT 设备、移动应用），边缘节点定期（如每 30 秒）将因果闭合的操作子集上传中央存储。因果闭合意味着：若操作 $O$ 被包含，则 $O$ 的所有因果前驱（happens-before 关系中的祖先）也必须被包含。

**Delta Sync**：状态向量 $SV$ 记录每个对等节点接收到的最大逻辑时钟值。给定本地 $SV_{local}$ 和远程 $SV_{remote}$，需要发送的操作集合为：$\text{Delta} = \{ op \mid op \in \text{Log} \land op.clock > SV_{remote}[op.actor] \}$。Yjs 使用变长整数映射编码状态向量，Automerge 使用 Bloom filter 近似。

**短暂对等节点 vs 持久对等节点**：
- **短暂节点**：浏览器标签页、移动应用前台、边缘 Worker；生命周期短（分钟到小时），不承担持久化，只消费和产生更新。
- **持久节点**：边缘服务器、Durable Objects、数据库节点；生命周期长，负责更新日志的持久存储和转发，作为短暂节点的"锚点"。

协调协议：短暂节点启动时连接最近的持久节点请求 delta；短暂节点之间可通过 WebRTC 数据通道建立直接连接（经持久节点信令）；持久节点之间通过周期性合并或流复制保持最终一致。

### 反例与故障模式

**LWW Register 的静默数据丢失**：并发写入时只有一个值能存活。两个用户同时编辑表单字段，B 的设备时钟快 1 秒，A 的输入完全丢失且无任何提示。缓解：使用多值寄存器（MV-Register）保留所有并发值并暴露冲突。

**文本 CRDT 的交错异常**：两个用户在同一位置并发插入多字符字符串时，某些算法可能导致字符交错（如 `"axbycz"`）。Yjs YATA 和 Loro Fugue 通过不同的锚定机制有效缓解。应用层可通过"原子插入块"语义将一次用户输入的多字符视为单一操作。

**集合删除的幽灵复活**：OR-Set 中，元素被删除后，另一并发操作再次添加"相同值"（但不同 tag），该值会重新出现。根因：OR-Set 的 add-wins 语义将每次添加视为独立事件。缓解：应用层实现语义去重或明确告知用户并发活动导致重新添加。

**状态爆炸与墓碑累积**：每天编辑 10,000 次的文档，一年后积累 365 万个墓碑。缓解：时钟累积 GC（所有活跃副本确认后移除 tombstone）、定期快照归档、有界增长设计（滑动窗口或环缓冲区）。

## 工程决策矩阵

| 场景 | 推荐方案 | 理由 | 风险 |
|------|---------|------|------|
| 通用 Web 协作应用 | Yjs | 性能极高，生态成熟，provider 丰富 | 冲突隐式解决，需应用层兜底 |
| 审计/合规密集型应用 | Automerge | 不可变文档、显式冲突、时间旅行 | Rust 核心集成复杂度 |
| 富文本编辑器/白板 | Loro | Fugue 算法、MovableTree、富文本优化 | 生态较新，工具链待完善 |
| 边缘间歇连接环境 | CRDT（任意库）+ 周期性合并 | 离线优先，边缘自治 | 合并延迟取决于同步频率 |
| 需要 P2P 去中心化 | Yjs + y-webrtc | WebRTC 数据通道直连 | 信令服务器仍是单点 |
| 遗留系统 OT 互操作 | OT 适配层 | 兼容现有 Google Docs 类系统 | TP2 不可能性限制架构 |
| 高并发千人编辑 | Yjs + 边缘聚合 | 同 PoP 合并更新，awareness 聚合 | 反压和 QoS 分级需求 |

## TypeScript 示例

### LWW Register

```typescript
export interface LWWState<T> { value: T; timestamp: number; replicaId: string; }

export class LWWRegister<T> {
  private state: LWWState<T>;

  constructor(initialValue: T, private replicaId: string, initialTimestamp = 0) {
    this.state = { value: initialValue, timestamp: initialTimestamp, replicaId };
  }

  set(value: T, timestamp = Date.now()): void {
    if (timestamp > this.state.timestamp ||
        (timestamp === this.state.timestamp && this.replicaId > this.state.replicaId)) {
      this.state = { value, timestamp, replicaId: this.replicaId };
    }
  }

  get(): T { return this.state.value; }
  getState(): LWWState<T> { return { ...this.state }; }

  merge(other: LWWState<T>): void {
    if (other.timestamp > this.state.timestamp ||
        (other.timestamp === this.state.timestamp && other.replicaId > this.state.replicaId)) {
      this.state = { ...other };
    }
  }

  static dominates<T>(a: LWWState<T>, b: LWWState<T>): boolean {
    return a.timestamp > b.timestamp || (a.timestamp === b.timestamp && a.replicaId >= b.replicaId);
  }
}
```

### G-Counter

```typescript
export type GCounterState = Map<string, number>;

export class GCounter {
  private state: GCounterState = new Map();
  constructor(private replicaId: string) {}

  increment(delta = 1): void {
    if (delta < 0) throw new Error('G-Counter cannot decrement');
    const current = this.state.get(this.replicaId) ?? 0;
    this.state.set(this.replicaId, current + delta);
  }

  get(): number {
    let sum = 0;
    for (const count of this.state.values()) sum += count;
    return sum;
  }

  getState(): GCounterState { return new Map(this.state); }

  merge(other: GCounterState): void {
    for (const [replicaId, count] of other.entries()) {
      const current = this.state.get(replicaId) ?? 0;
      this.state.set(replicaId, Math.max(current, count));
    }
  }

  static verifyInvariants(state: GCounterState): boolean {
    for (const count of state.values()) {
      if (count < 0 || !Number.isInteger(count)) return false;
    }
    return true;
  }
}
```

### Yjs 状态向量同步

```typescript
import * as Y from 'yjs';

export async function syncYDocViaStateVector(
  localDoc: Y.Doc,
  sendUpdate: (update: Uint8Array) => Promise<void>,
  receiveUpdate: () => Promise<Uint8Array>
): Promise<void> {
  // Step 1: 发送本地状态向量
  const sv = Y.encodeStateVector(localDoc);
  await sendUpdate(sv);

  // Step 2: 接收远程状态向量
  const remoteSV = await receiveUpdate();

  // Step 3: 计算并发送 delta（仅包含对方未见过的内容）
  const delta = Y.encodeStateAsUpdate(localDoc, remoteSV);
  await sendUpdate(delta);

  // Step 4: 接收并应用远程 delta
  const remoteDelta = await receiveUpdate();
  Y.applyUpdate(localDoc, remoteDelta);
}
```

## 延伸阅读

- [完整理论文档](../../70-theoretical-foundations/70.5-edge-runtime-and-serverless/42-realtime-collaboration-and-crdt.md)
- [RPC 框架与类型安全传输](./39-rpc-frameworks.md)
- [Edge 安全与零信任架构](./41-edge-security-and-zero-trust.md)
