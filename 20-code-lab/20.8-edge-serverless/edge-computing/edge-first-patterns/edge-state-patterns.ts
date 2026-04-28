/**
 * =============================================================================
 * 边缘状态管理模式实践 — edge-state-patterns.ts
 * =============================================================================
 *
 * 本模块演示在边缘计算环境中 3 种核心状态管理模式的 TypeScript 实现。
 * 边缘节点的分布式特性使得状态管理成为架构设计中最复杂的挑战之一。
 *
 * 使用的模式：
 * 1. Durable Object 模式    — 模拟单对象单线程的协调状态（类似 Cloudflare Durable Objects）
 * 2. CRDT 边缘同步          — 简单的 G-Counter CRDT 演示，支持无冲突的分布式更新
 * 3. Session-Affinity       — 基于用户 ID 的路由到特定边缘节点，保证状态局部性
 *
 * 每个模式都包含「错误做法（反例）」和「正确模式（生产级）」的对比。
 * =============================================================================
 */

// ─────────────────────────────────────────────────────────────────────────────
// 类型定义区
// ─────────────────────────────────────────────────────────────────────────────

/** 用户会话信息 */
interface UserSession {
  userId: string;
  region: string;
  preferences: Record<string, unknown>;
  lastActivityAt: number;
}

/** 边缘节点信息 */
interface EdgeNode {
  id: string;
  region: string;
  host: string;
  capacity: number;
  currentLoad: number;
}

/** 分布式事件 */
interface EdgeEvent {
  type: string;
  payload: unknown;
  timestamp: number;
  sourceNode: string;
}

/** Durable Object 状态快照 */
interface DOStateSnapshot<T> {
  data: T;
  version: number;
  lastModifiedAt: number;
  modifiedBy: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// 工具函数
// ─────────────────────────────────────────────────────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateId(): string {
  return `id-${Math.random().toString(36).slice(2)}-${Date.now()}`;
}

// ═════════════════════════════════════════════════════════════════════════════
// 模式 1: Durable Object 模式（单对象单线程协调状态）
// ═════════════════════════════════════════════════════════════════════════════

/**
 * ❌ 错误做法：在边缘节点中使用普通的共享内存 + 锁来管理状态。
 * 问题：
 *   1. 边缘节点是分布式的，没有全局锁
 *   2. 多线程/多进程竞争条件（race condition）无法避免
 *   3. 节点故障时状态丢失
 *   4. 没有状态持久化机制
 */
class BadSharedStateManager {
  private state = new Map<string, unknown>();
  private locks = new Set<string>();

  async update<T>(key: string, updater: (current: T | undefined) => T): Promise<T> {
    // 错误：在单节点内用 Set 模拟锁，但跨节点完全无效
    while (this.locks.has(key)) {
      await delay(10);
    }
    this.locks.add(key);

    try {
      const current = this.state.get(key) as T | undefined;
      const next = updater(current);
      this.state.set(key, next);
      return next;
    } finally {
      this.locks.delete(key);
    }
  }
}

/**
 * ✅ 正确做法：Durable Object 模式生产级实现
 *
 * 核心思想（来自 Cloudflare Durable Objects）：
 *   1. 每个逻辑对象有唯一的 ID（如 room:lobby-001, user:session-abc）
 *   2. 同一时刻，全局只有**一个**边缘实例负责该对象
 *   3. 所有对该对象的请求都路由到这个唯一的实例
 *   4. 实例内部是单线程的，无需锁即可保证状态一致性
 *   5. 状态变更自动持久化到后端存储
 *
 * 本实现使用 TypeScript 类 + Map 模拟，演示核心设计原则。
 */
class DurableObjectStub<T> {
  private state: T;
  private version = 0;
  private lastModifiedAt = Date.now();
  private readonly eventLog: Array<{ action: string; timestamp: number; detail: unknown }> = [];
  private hibernationTimer: ReturnType<typeof setTimeout> | null = null;
  private isActive = true;

  constructor(
    public readonly objectId: string,
    public readonly objectClass: string,
    initialState: T
  ) {
    this.state = initialState;
    console.log(`  [DO] 🏗️ 创建 DurableObject: ${objectClass}(id=${objectId})`);
    this.scheduleHibernation();
  }

  /** 获取当前状态（只读快照） */
  getState(): DOStateSnapshot<T> {
    return {
      data: this.state,
      version: this.version,
      lastModifiedAt: this.lastModifiedAt,
      modifiedBy: this.objectId,
    };
  }

  /** 执行状态变更（单线程安全，无需锁） */
  async transaction(updater: (current: T) => T, actionName: string): Promise<DOStateSnapshot<T>> {
    if (!this.isActive) {
      await this.wakeUp();
    }

    // 模拟单线程执行：在真实 DO 中，这由运行时保证
    const previous = JSON.stringify(this.state);
    const nextState = updater(this.state);
    const nextSerialized = JSON.stringify(nextState);

    // 只有真正发生变化才更新版本
    if (previous !== nextSerialized) {
      this.state = nextState;
      this.version += 1;
      this.lastModifiedAt = Date.now();

      this.eventLog.push({
        action: actionName,
        timestamp: this.lastModifiedAt,
        detail: { version: this.version },
      });

      console.log(
        `  [DO] 📝 状态变更: ${this.objectClass}(id=${this.objectId}), action="${actionName}", version=${this.version}`
      );

      // 模拟持久化到后端（非阻塞）
      this.schedulePersistence();
    } else {
      console.log(`  [DO] ➖ 状态无变化: ${this.objectClass}(id=${this.objectId}), action="${actionName}"`);
    }

    this.resetHibernationTimer();
    return this.getState();
  }

  /** 模拟 WebSocket 连接 attached 到该 DO */
  attachWebSocket(clientId: string): void {
    console.log(`  [DO] 🔌 WebSocket 连接接入: client="${clientId}" → ${this.objectClass}(id=${this.objectId})`);
    this.resetHibernationTimer();
  }

  /** 模拟广播消息给所有连接的客户端 */
  broadcast(message: unknown): void {
    console.log(
      `  [DO] 📢 广播消息: ${this.objectClass}(id=${this.objectId}), msg=${JSON.stringify(message)}`
    );
  }

  /** 模拟持久化到持久存储 */
  private schedulePersistence(): void {
    // 在真实 DO 中，运行时自动处理；这里仅打印日志
    // console.log(`  [DO] 💾 持久化已调度: ${this.objectClass}(id=${this.objectId})`);
  }

  /** 模拟休眠机制：长时间无活动后释放内存，但状态已持久化 */
  private scheduleHibernation(): void {
    this.hibernationTimer = setTimeout(() => {
      this.isActive = false;
      console.log(`  [DO] 😴 休眠: ${this.objectClass}(id=${this.objectId})（状态已持久化）`);
    }, 30000); // 30 秒无活动即休眠
  }

  private resetHibernationTimer(): void {
    if (this.hibernationTimer) {
      clearTimeout(this.hibernationTimer);
    }
    this.scheduleHibernation();
  }

  private async wakeUp(): Promise<void> {
    console.log(`  [DO] ⏰ 唤醒: ${this.objectClass}(id=${this.objectId})`);
    // 模拟从持久存储恢复状态
    await delay(5);
    this.isActive = true;
  }

  /** 获取事件日志（用于审计和调试） */
  getEventLog(): Array<{ action: string; timestamp: number; detail: unknown }> {
    return [...this.eventLog];
  }
}

/**
 * Durable Object 调度器 / 命名空间
 * 负责根据 objectId 找到或创建对应的 DO 实例，保证「同一对象全局唯一」
 */
class DurableObjectNamespace {
  private stubs = new Map<string, DurableObjectStub<unknown>>();

  getOrCreate<T>(objectClass: string, objectId: string, initialState: T): DurableObjectStub<T> {
    const key = `${objectClass}:${objectId}`;
    let stub = this.stubs.get(key) as DurableObjectStub<T> | undefined;

    if (!stub) {
      stub = new DurableObjectStub(objectId, objectClass, initialState);
      this.stubs.set(key, stub as DurableObjectStub<unknown>);
    }

    return stub;
  }

  /** 模拟对象迁移：将 DO 从一个节点迁移到另一个节点 */
  async migrate<T>(objectClass: string, objectId: string, targetNode: string): Promise<void> {
    const key = `${objectClass}:${objectId}`;
    const stub = this.stubs.get(key);
    if (stub) {
      console.log(`  [DO-NS] 🚚 迁移对象: ${key} → 节点 ${targetNode}`);
      // 在真实场景中，这里会序列化状态、关闭旧实例、在新节点恢复
      await delay(20);
      this.stubs.delete(key);
    }
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// 模式 2: CRDT 边缘同步（无冲突复制数据类型）
// ═════════════════════════════════════════════════════════════════════════════

/**
 * ❌ 错误做法：在边缘节点之间使用「最后写入 wins」的策略同步状态。
 * 问题：
 *   1. 时钟不同步导致数据丢失
 *   2. 并发更新时一方的更新会被静默覆盖
 *   3. 网络分区恢复后无法合并状态
 *   4. 没有解决冲突的机制，只是掩盖了冲突
 */
class BadLastWriteWinsCounter {
  private value = 0;
  private lastUpdate = 0;

  increment(nodeId: string): void {
    const now = Date.now();
    // 错误：依赖本地时钟，在分布式环境中不可靠
    if (now > this.lastUpdate) {
      this.value += 1;
      this.lastUpdate = now;
      console.log(`  [LWW-BAD] 节点 ${nodeId} 增加计数到 ${this.value}`);
    }
  }

  getValue(): number {
    return this.value;
  }
}

/**
 * ✅ 正确做法：G-Counter（Grow-Only Counter）CRDT 生产级实现
 *
 * 核心思想：
 *   1. 每个边缘节点维护自己的计数器向量（vector of counts）
 *   2. 全局值 = 所有节点计数的总和
 *   3. 合并操作：对每个节点取最大值（单调性保证）
 *   4. 无需中央协调器，无需锁，网络分区恢复后自动合并
 *
 * 适用场景：
 *   - 页面浏览量统计
 *   - 点赞数、分享数
 *   - 任何只需要单调递增的计数场景
 */
interface GCounterState {
  /** 每个节点的本地计数: { [nodeId]: count } */
  vectors: Record<string, number>;
  /** 本节点的 ID */
  nodeId: string;
}

class GCounterCRDT {
  private state: GCounterState;

  constructor(nodeId: string, initialVectors: Record<string, number> = {}) {
    this.state = {
      vectors: { ...initialVectors },
      nodeId,
    };
  }

  /** 本节点增加计数 */
  increment(amount = 1): void {
    const current = this.state.vectors[this.state.nodeId] || 0;
    this.state.vectors[this.state.nodeId] = current + amount;
    console.log(
      `  [CRDT] ⬆️ 节点 ${this.state.nodeId} 本地增加 ${amount}, 本地计数=${this.state.vectors[this.state.nodeId]}`
    );
  }

  /** 获取本节点视角下的全局总值 */
  value(): number {
    return Object.values(this.state.vectors).reduce((sum, count) => sum + count, 0);
  }

  /** 获取本节点的本地贡献值 */
  localValue(): number {
    return this.state.vectors[this.state.nodeId] || 0;
  }

  /** 合并另一个 G-Counter 的状态（幂等、交换、结合） */
  merge(other: GCounterCRDT): void {
    const before = this.value();
    for (const [nodeId, count] of Object.entries(other.state.vectors)) {
      const current = this.state.vectors[nodeId] || 0;
      this.state.vectors[nodeId] = Math.max(current, count);
    }
    const after = this.value();
    console.log(
      `  [CRDT] 🔀 合并: 节点 ${this.state.nodeId} 合并了来自 ${other.state.nodeId} 的状态, 全局值 ${before} → ${after}`
    );
  }

  /** 序列化状态用于网络传输 */
  serialize(): string {
    return JSON.stringify(this.state.vectors);
  }

  /** 从序列化状态恢复 */
  static deserialize(nodeId: string, serialized: string): GCounterCRDT {
    const vectors = JSON.parse(serialized) as Record<string, number>;
    return new GCounterCRDT(nodeId, vectors);
  }

  /** 获取当前状态副本 */
  getState(): GCounterState {
    return {
      vectors: { ...this.state.vectors },
      nodeId: this.state.nodeId,
    };
  }
}

/**
 * 模拟边缘节点间的 CRDT 同步协调器
 */
class EdgeCRDTSyncCoordinator {
  private nodes = new Map<string, GCounterCRDT>();

  registerNode(nodeId: string): GCounterCRDT {
    const counter = new GCounterCRDT(nodeId);
    this.nodes.set(nodeId, counter);
    console.log(`  [CRDT-Coord] 🖥️ 注册边缘节点: ${nodeId}`);
    return counter;
  }

  /** 模拟两个节点之间的状态同步 */
  async sync(nodeAId: string, nodeBId: string): Promise<void> {
    const nodeA = this.nodes.get(nodeAId);
    const nodeB = this.nodes.get(nodeBId);
    if (!nodeA || !nodeB) {
      throw new Error(`节点未注册: ${nodeAId} 或 ${nodeBId}`);
    }

    console.log(`  [CRDT-Coord] 🔄 开始同步: ${nodeAId} ↔ ${nodeBId}`);
    await delay(30); // 模拟网络延迟

    // 双向合并（最终收敛到相同状态）
    nodeA.merge(nodeB);
    nodeB.merge(nodeA);

    console.log(`  [CRDT-Coord] ✅ 同步完成: ${nodeAId}=${nodeA.value()}, ${nodeBId}=${nodeB.value()}`);
  }

  /** 模拟全网广播同步（gossip 协议简化版） */
  async gossipSync(): Promise<void> {
    const nodeIds = Array.from(this.nodes.keys());
    console.log(`  [CRDT-Coord] 🌐 开始全网 Gossip 同步，节点数: ${nodeIds.length}`);

    for (let i = 0; i < nodeIds.length; i++) {
      for (let j = i + 1; j < nodeIds.length; j++) {
        await this.sync(nodeIds[i], nodeIds[j]);
      }
    }

    // 验证所有节点状态一致
    const values = nodeIds.map((id) => this.nodes.get(id)!.value());
    const allEqual = values.every((v) => v === values[0]);
    console.log(
      `  [CRDT-Coord] ${allEqual ? '✅' : '❌'} 全网一致性检查: 所有节点值=${values[0]}, 一致=${allEqual}`
    );
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// 模式 3: Session-Affinity（基于用户 ID 的路由到特定边缘节点）
// ═════════════════════════════════════════════════════════════════════════════

/**
 * ❌ 错误做法：完全无状态的路由，每个请求随机分配到任意边缘节点。
 * 问题：
 *   1. 用户会话数据需要在所有节点间同步，成本极高
 *   2. 缓存局部性差，热点数据分散
 *   3. 某些业务逻辑（如购物车、游戏状态）需要状态连续性
 *   4. 数据库连接池无法有效复用
 */
class BadRandomRouter {
  private nodes: EdgeNode[];

  constructor(nodes: EdgeNode[]) {
    this.nodes = nodes;
  }

  route(_userId: string): EdgeNode {
    // 错误：完全随机，不考虑用户状态局部性
    const idx = Math.floor(Math.random() * this.nodes.length);
    return this.nodes[idx];
  }
}

/**
 * ✅ 正确做法：Session-Affinity（粘性会话）生产级实现
 *
 * 核心思想：
 *   1. 根据用户 ID 的一致性哈希，将同一用户固定路由到同一（或邻近的）边缘节点
 *   2. 节点故障时自动迁移到备用节点
 *   3. 考虑节点负载，在一致性和负载均衡之间做权衡
 *   4. 支持会话预热和优雅迁移
 *
 * 实现方式：
 *   - 一致性哈希环（Consistent Hashing Ring）
 *   - 基于用户 ID 的哈希值确定首选节点
 *   - 备选节点列表用于故障转移
 */
class SessionAffinityRouter {
  private nodes: EdgeNode[];
  private virtualNodesPerPhysical = 150; // 每个物理节点对应 150 个虚拟节点
  private hashRing: Array<{ hash: number; nodeId: string }> = [];
  private sessions = new Map<string, { primaryNode: string; assignedAt: number }>();

  constructor(nodes: EdgeNode[]) {
    this.nodes = nodes;
    this.buildHashRing();
  }

  /** 构建一致性哈希环 */
  private buildHashRing(): void {
    this.hashRing = [];
    for (const node of this.nodes) {
      for (let i = 0; i < this.virtualNodesPerPhysical; i++) {
        const hash = this.hash(`${node.id}#${i}`);
        this.hashRing.push({ hash, nodeId: node.id });
      }
    }
    this.hashRing.sort((a, b) => a.hash - b.hash);
    console.log(`  [SessionAffinity] 🔧 一致性哈希环构建完成: ${this.nodes.length} 节点 × ${this.virtualNodesPerPhysical} 虚拟节点`);
  }

  /** 简单的字符串哈希函数（FNV-1a 简化版） */
  private hash(str: string): number {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
    }
    return Math.abs(h);
  }

  /** 获取用户 ID 对应的首选节点 */
  getPrimaryNode(userId: string): EdgeNode {
    const userHash = this.hash(userId);

    // 在哈希环上找到第一个 hash >= userHash 的虚拟节点
    let idx = this.hashRing.findIndex((vn) => vn.hash >= userHash);
    if (idx === -1) idx = 0; // 绕回环的起点

    const nodeId = this.hashRing[idx].nodeId;
    const node = this.nodes.find((n) => n.id === nodeId)!;

    // 记录会话分配
    this.sessions.set(userId, { primaryNode: nodeId, assignedAt: Date.now() });

    return node;
  }

  /** 获取用户 ID 对应的节点列表（首选 + 备选，用于故障转移） */
  getNodePreferenceList(userId: string, replicaCount = 3): EdgeNode[] {
    const userHash = this.hash(userId);
    const preferences: EdgeNode[] = [];
    const seen = new Set<string>();

    let idx = this.hashRing.findIndex((vn) => vn.hash >= userHash);
    if (idx === -1) idx = 0;

    while (preferences.length < replicaCount && preferences.length < this.nodes.length) {
      const nodeId = this.hashRing[idx].nodeId;
      if (!seen.has(nodeId)) {
        seen.add(nodeId);
        const node = this.nodes.find((n) => n.id === nodeId)!;
        preferences.push(node);
      }
      idx = (idx + 1) % this.hashRing.length;
    }

    return preferences;
  }

  /** 考虑负载的路由：如果首选节点过载，选择次优节点 */
  route(userId: string, loadThreshold = 0.8): EdgeNode {
    const preferences = this.getNodePreferenceList(userId);

    for (const node of preferences) {
      const loadRatio = node.currentLoad / node.capacity;
      if (loadRatio < loadThreshold) {
        console.log(
          `  [SessionAffinity] 🎯 路由用户 "${userId}" → 节点 ${node.id} (region=${node.region}, load=${(loadRatio * 100).toFixed(1)}%)`
        );
        this.sessions.set(userId, { primaryNode: node.id, assignedAt: Date.now() });
        return node;
      }
      console.log(
        `  [SessionAffinity] ⚠️ 节点 ${node.id} 过载 (${(loadRatio * 100).toFixed(1)}%)，尝试下一备选`
      );
    }

    // 所有节点都过载，返回首选（尽力而为）
    console.log(`  [SessionAffinity] 🚨 所有节点过载，强制路由到首选节点`);
    return preferences[0];
  }

  /** 模拟节点故障，将会话迁移 */
  async handleNodeFailure(failedNodeId: string): Promise<void> {
    console.log(`  [SessionAffinity] 💥 节点故障: ${failedNodeId}，开始会话迁移`);

    const affectedSessions: string[] = [];
    for (const [userId, session] of this.sessions.entries()) {
      if (session.primaryNode === failedNodeId) {
        affectedSessions.push(userId);
      }
    }

    // 从活跃节点列表中移除故障节点
    this.nodes = this.nodes.filter((n) => n.id !== failedNodeId);
    this.buildHashRing();

    // 重新路由受影响的会话
    for (const userId of affectedSessions) {
      const newNode = this.getPrimaryNode(userId);
      console.log(`  [SessionAffinity] 🚚 会话迁移: "${userId}" ${failedNodeId} → ${newNode.id}`);
      await delay(5); // 模拟迁移延迟
    }

    console.log(`  [SessionAffinity] ✅ 会话迁移完成: ${affectedSessions.length} 个会话已重新分配`);
  }

  /** 统计信息 */
  getStats(): {
    totalSessions: number;
    nodeDistribution: Record<string, number>;
  } {
    const distribution: Record<string, number> = {};
    for (const { primaryNode } of this.sessions.values()) {
      distribution[primaryNode] = (distribution[primaryNode] || 0) + 1;
    }
    return {
      totalSessions: this.sessions.size,
      nodeDistribution: distribution,
    };
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// Demo 演示函数
// ═════════════════════════════════════════════════════════════════════════════

export async function demo(): Promise<void> {
  console.log('\n╔══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                    边缘状态管理模式演示 — Edge State Patterns                  ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');

  // ── 演示 1: Durable Object 模式 ─────────────────────────────────────────────
  console.log('▶▶▶ 模式 1: Durable Object（单对象单线程协调状态）◀◀◀\n');

  const doNamespace = new DurableObjectNamespace();

  // 场景：多人在线协作编辑文档
  const docId = 'doc:collab-001';
  const docDO = doNamespace.getOrCreate('Document', docId, {
    title: '未命名文档',
    content: '',
    collaborators: [] as string[],
    revision: 0,
  });

  console.log('\n--- 模拟多个客户端并发编辑（在 DO 中实际为串行处理）---');
  const clientIds = ['alice', 'bob', 'charlie'];
  for (const clientId of clientIds) {
    docDO.attachWebSocket(clientId);
  }

  // Alice 编辑
  await docDO.transaction(
    (state) => ({
      ...state,
      title: '项目计划书',
      content: state.content + '[Alice 添加了标题]',
      collaborators: [...state.collaborators, 'alice'],
      revision: state.revision + 1,
    }),
    'alice-edit-title'
  );

  // Bob 编辑
  await docDO.transaction(
    (state) => ({
      ...state,
      content: state.content + '\n[Bob 添加了第一段落]',
      collaborators: state.collaborators.includes('bob') ? state.collaborators : [...state.collaborators, 'bob'],
      revision: state.revision + 1,
    }),
    'bob-edit-content'
  );

  // Charlie 尝试并发编辑（在 DO 中会自动串行化）
  await docDO.transaction(
    (state) => ({
      ...state,
      content: state.content + '\n[Charlie 添加了第二段落]',
      collaborators: state.collaborators.includes('charlie')
        ? state.collaborators
        : [...state.collaborators, 'charlie'],
      revision: state.revision + 1,
    }),
    'charlie-edit-content'
  );

  console.log('\n--- 最终文档状态 ---');
  const finalDoc = docDO.getState();
  console.log('  状态快照:', JSON.stringify(finalDoc.data, null, 4));
  console.log('  版本号:', finalDoc.version);
  console.log('  事件日志:', docDO.getEventLog().map((e) => `    - ${e.action} @ ${new Date(e.timestamp).toISOString()}`).join('\n'));

  // 模拟广播
  docDO.broadcast({ type: 'revision-update', version: finalDoc.version });

  // ── 演示 2: CRDT 边缘同步 ──────────────────────────────────────────────────
  console.log('\n\n▶▶▶ 模式 2: CRDT 边缘同步（无冲突复制数据类型）◀◀◀\n');

  const crdtCoordinator = new EdgeCRDTSyncCoordinator();

  // 注册 3 个边缘节点
  const nodeTokyo = crdtCoordinator.registerNode('edge-tokyo');
  const nodeLondon = crdtCoordinator.registerNode('edge-london');
  const nodeSaoPaulo = crdtCoordinator.registerNode('edge-saopaulo');

  console.log('\n--- 阶段 1: 各节点独立处理本地请求（网络分区场景）---');
  // 东京节点处理 5 次点赞
  for (let i = 0; i < 5; i++) nodeTokyo.increment();
  // 伦敦节点处理 3 次点赞
  for (let i = 0; i < 3; i++) nodeLondon.increment();
  // 圣保罗节点处理 2 次点赞
  for (let i = 0; i < 2; i++) nodeSaoPaulo.increment();

  console.log(`\n  分区期间各节点本地值:`);
  console.log(`    东京: ${nodeTokyo.localValue()} (全局视角=${nodeTokyo.value()})`);
  console.log(`    伦敦: ${nodeLondon.localValue()} (全局视角=${nodeLondon.value()})`);
  console.log(`    圣保罗: ${nodeSaoPaulo.localValue()} (全局视角=${nodeSaoPaulo.value()})`);

  console.log('\n--- 阶段 2: 网络恢复，节点间同步 ---');
  await crdtCoordinator.gossipSync();

  console.log(`\n  同步后各节点全局值:`);
  console.log(`    东京: ${nodeTokyo.value()}`);
  console.log(`    伦敦: ${nodeLondon.value()}`);
  console.log(`    圣保罗: ${nodeSaoPaulo.value()}`);
  console.log(`  预期总值: 5 + 3 + 2 = 10`);

  console.log('\n--- 阶段 3: 继续增量更新 + 增量同步 ---');
  nodeTokyo.increment(2);
  nodeLondon.increment(1);
  await crdtCoordinator.sync('edge-tokyo', 'edge-london');
  console.log(`  东京↔伦敦同步后，东京全局值: ${nodeTokyo.value()}`);

  // ── 演示 3: Session-Affinity ───────────────────────────────────────────────
  console.log('\n\n▶▶▶ 模式 3: Session-Affinity（基于用户 ID 的路由到特定边缘节点）◀◀◀\n');

  const edgeNodes: EdgeNode[] = [
    { id: 'edge-us-east-1', region: 'us-east', host: '10.0.1.1', capacity: 1000, currentLoad: 400 },
    { id: 'edge-us-west-1', region: 'us-west', host: '10.0.2.1', capacity: 1000, currentLoad: 200 },
    { id: 'edge-eu-central-1', region: 'eu-central', host: '10.0.3.1', capacity: 1000, currentLoad: 850 },
    { id: 'edge-ap-northeast-1', region: 'ap-northeast', host: '10.0.4.1', capacity: 1000, currentLoad: 300 },
  ];

  const router = new SessionAffinityRouter(edgeNodes);

  console.log('--- 路由一致性测试：同一用户多次请求应路由到同一节点 ---');
  const testUserId = 'user:alice-42';
  const node1 = router.route(testUserId);
  const node2 = router.route(testUserId);
  const node3 = router.route(testUserId);
  console.log(`  用户 "${testUserId}" 的 3 次请求路由结果:`);
  console.log(`    第 1 次: ${node1.id} (${node1.region})`);
  console.log(`    第 2 次: ${node2.id} (${node2.region})`);
  console.log(`    第 3 次: ${node3.id} (${node3.region})`);
  console.log(`    一致性: ${node1.id === node2.id && node2.id === node3.id ? '✅ 全部一致' : '❌ 不一致'}`);

  console.log('\n--- 备选节点列表 ---');
  const preferenceList = router.getNodePreferenceList(testUserId, 3);
  console.log(`  用户 "${testUserId}" 的节点偏好列表:`);
  preferenceList.forEach((node, idx) => {
    console.log(`    ${idx + 1}. ${node.id} (${node.region})`);
  });

  console.log('\n--- 负载感知路由：高负载节点被跳过 ---');
  const heavyUser = 'user:bob-99';
  // eu-central 节点负载 850/1000 = 85%，超过 80% 阈值，应被跳过
  const routedForHeavy = router.route(heavyUser, 0.8);
  console.log(`  用户 "${heavyUser}" 被路由到: ${routedForHeavy.id} (${routedForHeavy.region})`);

  console.log('\n--- 大规模用户路由分布统计 ---');
  const testUserCount = 10000;
  for (let i = 0; i < testUserCount; i++) {
    router.route(`user:load-test-${i}`);
  }
  const stats = router.getStats();
  console.log(`  总会话数: ${stats.totalSessions}`);
  console.log('  节点分布:');
  for (const [nodeId, count] of Object.entries(stats.nodeDistribution)) {
    const percentage = ((count / stats.totalSessions) * 100).toFixed(2);
    console.log(`    ${nodeId}: ${count} (${percentage}%)`);
  }

  console.log('\n--- 节点故障转移 ---');
  await router.handleNodeFailure('edge-us-east-1');
  const statsAfterFailure = router.getStats();
  console.log(`  故障后活跃节点数: ${Object.keys(statsAfterFailure.nodeDistribution).length}`);
  console.log('  新的节点分布:');
  for (const [nodeId, count] of Object.entries(statsAfterFailure.nodeDistribution)) {
    const percentage = ((count / statsAfterFailure.totalSessions) * 100).toFixed(2);
    console.log(`    ${nodeId}: ${count} (${percentage}%)`);
  }

  console.log('\n═══════════════════════════════════════════════════════════════════════════════\n');
}
