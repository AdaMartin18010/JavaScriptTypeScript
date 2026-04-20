/**
 * @file 分布式一致性模型
 * @category Distributed Systems → Consistency
 * @difficulty hard
 * @tags consistency, linearizability, causal, eventual, crdt
 *
 * @description
 * 实现并演示分布式系统中的核心一致性模型：线性一致性、顺序一致性、因果一致性、最终一致性。
 */

// ============================================================================
// 1. 抽象分布式节点
// ============================================================================

export interface DistributedNode {
  id: string
  localClock: number
  state: Map<string, unknown>
  log: Array<{ key: string; value: unknown; timestamp: number; nodeId: string }>
}

export function createNode(id: string): DistributedNode {
  return {
    id,
    localClock: 0,
    state: new Map(),
    log: []
  }
}

// ============================================================================
// 2. 线性一致性 (Linearizability)
// ============================================================================

export class LinearizableStore {
  private primary: DistributedNode
  private replicas: DistributedNode[] = []
  private operationLog: Array<{ op: string; key: string; value: unknown; timestamp: number }> = []
  private globalTimestamp = 0

  constructor(primaryId: string) {
    this.primary = createNode(primaryId)
  }

  addReplica(node: DistributedNode): void {
    this.replicas.push(node)
  }

  // 写操作：必须同步到所有副本后才返回
  async write(key: string, value: unknown): Promise<void> {
    const timestamp = ++this.globalTimestamp

    // 写入主节点
    this.primary.state.set(key, value)
    this.primary.log.push({ key, value, timestamp, nodeId: this.primary.id })
    this.operationLog.push({ op: 'write', key, value, timestamp })

    // 同步到所有副本（模拟网络延迟）
    await Promise.all(
      this.replicas.map(async (replica, index) => {
        await this.simulateNetworkDelay(index)
        replica.state.set(key, value)
        replica.localClock = Math.max(replica.localClock, timestamp)
        replica.log.push({ key, value, timestamp, nodeId: this.primary.id })
      })
    )
  }

  // 读操作：从任意节点读取，必须读到最新值
  read(key: string, nodeId?: string): { value: unknown | undefined; fromNode: string; timestamp: number } {
    const node = nodeId
      ? this.replicas.find(r => r.id === nodeId) ?? this.primary
      : this.primary

    // 检查是否落后
    const latestLog = this.operationLog.filter(op => op.key === key).pop()
    const nodeLog = node.log.filter(l => l.key === key).pop()

    return {
      value: node.state.get(key),
      fromNode: node.id,
      timestamp: nodeLog?.timestamp ?? 0
    }
  }

  // 验证线性一致性：所有操作必须有一个全局顺序
  verifyLinearizability(): boolean {
    // 简单验证：所有副本的状态必须与主节点一致
    for (const replica of this.replicas) {
      for (const [key, value] of this.primary.state) {
        if (replica.state.get(key) !== value) {
          console.log(`  [Linearizability] Violation: replica ${replica.id} has stale value for ${key}`)
          return false
        }
      }
    }
    return true
  }

  private async simulateNetworkDelay(index: number): Promise<void> {
    await new Promise(r => setTimeout(r, 10 + index * 5))
  }
}

// ============================================================================
// 3. 因果一致性 (Causal Consistency)
// ============================================================================

export interface CausalEvent {
  id: string
  key: string
  value: unknown
  vectorClock: Map<string, number>
  nodeId: string
}

export class CausalStore {
  private nodes = new Map<string, DistributedNode>()
  private events: CausalEvent[] = []

  addNode(node: DistributedNode): void {
    this.nodes.set(node.id, node)
  }

  // 本地写入
  write(nodeId: string, key: string, value: unknown): CausalEvent {
    const node = this.nodes.get(nodeId)!
    node.localClock++

    const vectorClock = new Map<string, number>()
    // 复制当前向量时钟
    for (const n of this.nodes.values()) {
      vectorClock.set(n.id, n.id === nodeId ? node.localClock : n.localClock)
    }

    const event: CausalEvent = {
      id: `${nodeId}-${node.localClock}`,
      key,
      value,
      vectorClock,
      nodeId
    }

    node.state.set(key, value)
    node.log.push({ key, value, timestamp: node.localClock, nodeId })
    this.events.push(event)

    return event
  }

  // 接收其他节点的事件
  receiveEvent(targetNodeId: string, event: CausalEvent): boolean {
    const node = this.nodes.get(targetNodeId)!

    // 检查因果依赖是否满足
    if (!this.canApply(node, event)) {
      console.log(`  [Causal] Node ${targetNodeId} cannot apply ${event.id}: dependencies not met`)
      return false
    }

    // 应用事件
    node.state.set(event.key, event.value)
    node.log.push({ key: event.key, value: event.value, timestamp: event.vectorClock.get(event.nodeId) ?? 0, nodeId: event.nodeId })

    // 合并向量时钟
    for (const [nid, time] of event.vectorClock) {
      const current = node.localClock // simplified
      node.localClock = Math.max(current, time)
    }

    return true
  }

  // 检查事件 B 是否因果依赖于事件 A
  static isCausallyDependent(a: CausalEvent, b: CausalEvent): boolean {
    // B 依赖于 A，如果 A 的向量时钟 ≤ B 的向量时钟（至少在一个分量上严格小于）
    let hasStrictLess = false
    for (const [nodeId, timeA] of a.vectorClock) {
      const timeB = b.vectorClock.get(nodeId) ?? 0
      if (timeA > timeB) return false
      if (timeA < timeB) hasStrictLess = true
    }
    return hasStrictLess
  }

  // 检查两个事件是否并发（无因果关系）
  static isConcurrent(a: CausalEvent, b: CausalEvent): boolean {
    return !CausalStore.isCausallyDependent(a, b) && !CausalStore.isCausallyDependent(b, a)
  }

  private canApply(node: DistributedNode, event: CausalEvent): boolean {
    // 简化的因果检查：目标节点必须已经看到所有因果前驱
    for (const [nid, time] of event.vectorClock) {
      if (nid === event.nodeId) continue
      const otherNode = this.nodes.get(nid)
      if (otherNode && otherNode.localClock < time) {
        return false
      }
    }
    return true
  }
}

// ============================================================================
// 4. 最终一致性 (Eventual Consistency) + CRDT
// ============================================================================

export interface GCounter {
  nodeId: string
  values: Map<string, number> // nodeId -> count
}

export class CRDTGCounter {
  private counters = new Map<string, GCounter>()

  increment(nodeId: string, amount = 1): void {
    let counter = this.counters.get(nodeId)
    if (!counter) {
      counter = { nodeId, values: new Map() }
      this.counters.set(nodeId, counter)
    }
    const current = counter.values.get(nodeId) ?? 0
    counter.values.set(nodeId, current + amount)
  }

  // 合并另一个节点的计数器状态
  merge(other: CRDTGCounter): void {
    for (const [nodeId, counter] of other.counters) {
      const local = this.counters.get(nodeId)
      if (!local) {
        this.counters.set(nodeId, { nodeId, values: new Map(counter.values) })
      } else {
        for (const [srcNode, value] of counter.values) {
          const localValue = local.values.get(srcNode) ?? 0
          local.values.set(srcNode, Math.max(localValue, value))
        }
      }
    }
  }

  value(): number {
    let sum = 0
    for (const counter of this.counters.values()) {
      for (const v of counter.values.values()) {
        sum += v
      }
    }
    return sum
  }

  getState(): Map<string, Map<string, number>> {
    const state = new Map<string, Map<string, number>>()
    for (const [nodeId, counter] of this.counters) {
      state.set(nodeId, new Map(counter.values))
    }
    return state
  }
}

// LWW (Last-Write-Wins) Register
export class LWWRegister<T> {
  private value: T | undefined
  private timestamp = 0
  private nodeId = ''

  set(value: T, timestamp: number, nodeId: string): void {
    if (timestamp > this.timestamp || (timestamp === this.timestamp && nodeId > this.nodeId)) {
      this.value = value
      this.timestamp = timestamp
      this.nodeId = nodeId
    }
  }

  get(): T | undefined {
    return this.value
  }

  merge(other: LWWRegister<T>): void {
    if (other.timestamp > this.timestamp || (other.timestamp === this.timestamp && other.nodeId > this.nodeId)) {
      this.value = other.value
      this.timestamp = other.timestamp
      this.nodeId = other.nodeId
    }
  }
}

// ============================================================================
// 5. 幂等性设计
// ============================================================================

export class IdempotencyKeyStore {
  private processedKeys = new Set<string>()
  private results = new Map<string, unknown>()
  private ttlMs: number

  constructor(ttlMs = 86400000) {
    this.ttlMs = ttlMs
  }

  async execute<T>(key: string, operation: () => Promise<T>): Promise<T> {
    // 检查是否已处理
    if (this.processedKeys.has(key)) {
      console.log(`  [Idempotency] Key ${key} already processed, returning cached result`)
      return this.results.get(key) as T
    }

    // 执行操作
    const result = await operation()

    // 记录结果
    this.processedKeys.add(key)
    this.results.set(key, result)

    // 设置过期清理
    setTimeout(() => {
      this.processedKeys.delete(key)
      this.results.delete(key)
    }, this.ttlMs)

    return result
  }
}

// ============================================================================
// 6. Saga 事务模式
// ============================================================================

export interface SagaStep {
  name: string
  execute: () => Promise<void>
  compensate: () => Promise<void>
}

export class SagaOrchestrator {
  private steps: SagaStep[] = []
  private executedSteps: SagaStep[] = []

  addStep(step: SagaStep): void {
    this.steps.push(step)
  }

  async execute(): Promise<{ success: boolean; failedAt?: string }> {
    for (const step of this.steps) {
      try {
        await step.execute()
        this.executedSteps.push(step)
      } catch (err) {
        console.log(`  [Saga] Step ${step.name} failed, starting compensation...`)
        await this.compensate()
        return { success: false, failedAt: step.name }
      }
    }
    return { success: true }
  }

  private async compensate(): Promise<void> {
    // 逆序补偿
    for (let i = this.executedSteps.length - 1; i >= 0; i--) {
      const step = this.executedSteps[i]
      try {
        await step.compensate()
        console.log(`  [Saga] Compensated: ${step.name}`)
      } catch (compErr) {
        console.log(`  [Saga] Compensation failed for ${step.name}, requires manual intervention`)
      }
    }
  }
}

// ============================================================================
// 7. Demo
// ============================================================================

export async function demo(): Promise<void> {
  console.log('=== 分布式一致性模型演示 ===\n')

  console.log('1. 线性一致性')
  const linearStore = new LinearizableStore('primary')
  linearStore.addReplica(createNode('replica-1'))
  linearStore.addReplica(createNode('replica-2'))

  await linearStore.write('balance', 1000)
  console.log('  写入 balance=1000')

  const read1 = linearStore.read('balance', 'replica-1')
  console.log(`  从 replica-1 读取: ${read1.value} (timestamp=${read1.timestamp})`)

  const read2 = linearStore.read('balance', 'replica-2')
  console.log(`  从 replica-2 读取: ${read2.value} (timestamp=${read2.timestamp})`)

  console.log(`  线性一致性验证: ${linearStore.verifyLinearizability() ? '通过' : '失败'}`)

  console.log('\n2. 因果一致性')
  const causalStore = new CausalStore()
  const nodeA = createNode('node-A')
  const nodeB = createNode('node-B')
  const nodeC = createNode('node-C')
  causalStore.addNode(nodeA)
  causalStore.addNode(nodeB)
  causalStore.addNode(nodeC)

  const event1 = causalStore.write('node-A', 'comment', 'Hello from A')
  console.log(`  Node A 写入: ${event1.id}`)

  const event2 = causalStore.write('node-B', 'reply', 'Reply from B')
  console.log(`  Node B 写入: ${event2.id}`)

  // 将 A 的事件传播到 C
  const applied1 = causalStore.receiveEvent('node-C', event1)
  console.log(`  Node C 应用 A 的事件: ${applied1}`)

  console.log(`  event1 与 event2 并发: ${CausalStore.isConcurrent(event1, event2)}`)

  console.log('\n3. CRDT G-Counter')
  const counterA = new CRDTGCounter()
  const counterB = new CRDTGCounter()

  counterA.increment('node-A', 3)
  counterA.increment('node-B', 2)
  console.log(`  Counter A 值: ${counterA.value()}`)

  counterB.increment('node-B', 5)
  counterB.increment('node-C', 1)
  console.log(`  Counter B 值: ${counterB.value()}`)

  // 合并
  counterA.merge(counterB)
  console.log(`  合并后值: ${counterA.value()} (应为 11)`)

  console.log('\n4. LWW Register')
  const regA = new LWWRegister<string>()
  const regB = new LWWRegister<string>()

  regA.set('value-A', 10, 'node-A')
  regB.set('value-B', 20, 'node-B')

  regA.merge(regB)
  console.log(`  LWW 合并后值: ${regA.get()} (应为 value-B，因为 timestamp 更大)`)

  console.log('\n5. 幂等性')
  const idempotencyStore = new IdempotencyKeyStore()

  const payment = await idempotencyStore.execute('payment-001', async () => {
    console.log('  执行支付操作...')
    return { status: 'success', amount: 100 }
  })
  console.log('  第一次支付结果:', payment)

  const cached = await idempotencyStore.execute('payment-001', async () => {
    console.log('  这不应该执行')
    return { status: 'duplicate' }
  })
  console.log('  第二次支付结果（幂等）:', cached)

  console.log('\n6. Saga 事务')
  const saga = new SagaOrchestrator()

  saga.addStep({
    name: '扣减库存',
    execute: async () => { console.log('  扣减库存成功') },
    compensate: async () => { console.log('  恢复库存') }
  })

  saga.addStep({
    name: '扣款',
    execute: async () => { console.log('  扣款成功') },
    compensate: async () => { console.log('  退款') }
  })

  saga.addStep({
    name: '发货',
    execute: async () => { throw new Error('物流异常') },
    compensate: async () => { console.log('  取消发货') }
  })

  const sagaResult = await saga.execute()
  console.log(`  Saga 结果: ${sagaResult.success ? '成功' : '失败'}${sagaResult.failedAt ? ` (失败于: ${sagaResult.failedAt})` : ''}`)

  console.log('\n分布式系统要点:')
  console.log('- 线性一致性：最强一致性，代价最高')
  console.log('- 因果一致性：保留因果关系，允许并发')
  console.log('- CRDT：无冲突复制数据类型，自动合并')
  console.log('- 幂等性：防止重复操作导致副作用')
  console.log('- Saga：长事务的补偿模式')
}
