# 事件溯源 — 理论基础

## 1. 核心概念

与传统 CRUD 直接修改状态不同，事件溯源将状态变更记录为**不可变事件序列**：

```
状态 = fold(初始状态, 事件列表)
```

事件溯源的核心思想是：**系统状态不是被存储的，而是被计算出来的**。这使得系统具备了完整的时间旅行能力、审计追踪能力和并发冲突解决能力。

## 2. 事件结构

```typescript
interface DomainEvent {
  eventId: string       // 唯一标识 (UUID v4)
  eventType: string     // 事件类型 (完全限定名)
  aggregateId: string   // 聚合根 ID
  version: number       // 版本号（乐观并发控制）
  timestamp: Date       // 发生时间 (ISO 8601)
  payload: object       // 事件数据 (不可变值对象)
  metadata?: {
    correlationId: string;  // 分布式追踪
    causationId: string;    // 因果关系
    userId: string;         // 操作者
  };
}
```

## 3. 事件溯源模式对比

| 维度 | 事件溯源 (ES) | 传统 CRUD | CQRS (无 ES) | 状态机 |
|------|--------------|-----------|--------------|--------|
| 数据模型 | 事件流 (不可变) | 当前状态 (可变) | 分离读写模型 | 状态 + 转换 |
| 历史查询 | ★★★★★ (完整) | ★ (无/审计表) | ★★ (日志) | ★★★ |
| 审计追踪 | 原生支持 | 需额外实现 | 需额外实现 | 部分支持 |
| 并发控制 | 乐观锁 (版本号) | 悲观/乐观锁 | 按模型选择 | 状态锁 |
| 复杂度 | 高 | 低 | 中 | 中 |
| 存储增长 | 只增不减 | 稳定 | 稳定 | 稳定 |
| 最终一致性 | 投影异步 | 强一致 | 读写分离 | 强一致 |
| 典型场景 | 金融、审计、协作 | 一般业务 | 高读写比 | 工作流 |
| 代表作 | Greg Young |  everywhere | Udi Dahan | Martin Fowler |

## 4. 读写分离

- **写模型（Command Side）**: 接收命令，验证业务规则，追加事件
- **读模型（Query Side）**: 通过投影将事件流物化为查询优化的视图
- **CQRS**: 命令与查询责任分离，常配合事件溯源使用

## 5. 投影（Projection）

将事件流转换为查询视图的过程：

- **同步投影**: 事务内同步更新（强一致性，性能较低）
- **异步投影**: 消息队列异步处理（最终一致性，性能高）
- **快照**: 定期保存聚合状态，避免从头重放所有事件

## 6. 事件存储与投影代码示例

### 6.1 事件存储接口与实现

```typescript
// event-sourcing/src/EventStore.ts
interface EventRecord {
  aggregateId: string;
  version: number;
  eventType: string;
  payload: object;
  timestamp: Date;
}

interface EventStore {
  append(events: EventRecord[], expectedVersion: number): Promise<void>;
  getEvents(aggregateId: string): Promise<EventRecord[]>;
  getAllEvents(afterPosition?: number, limit?: number): Promise<EventRecord[]>;
}

class InMemoryEventStore implements EventStore {
  private streams = new Map<string, EventRecord[]>();

  async append(events: EventRecord[], expectedVersion: number): Promise<void> {
    const stream = this.streams.get(events[0].aggregateId) ?? [];

    if (stream.length !== expectedVersion) {
      throw new Error(
        `Concurrency conflict: expected ${expectedVersion}, found ${stream.length}`
      );
    }

    for (let i = 0; i < events.length; i++) {
      events[i].version = expectedVersion + i + 1;
    }

    stream.push(...events);
    this.streams.set(events[0].aggregateId, stream);
  }

  async getEvents(aggregateId: string): Promise<EventRecord[]> {
    return [...(this.streams.get(aggregateId) ?? [])];
  }

  async getAllEvents(afterPosition = 0, limit = 100): Promise<EventRecord[]> {
    const allEvents: EventRecord[] = [];
    for (const stream of this.streams.values()) {
      allEvents.push(...stream);
    }
    return allEvents
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
      .slice(afterPosition, afterPosition + limit);
  }
}
```

### 6.2 聚合根与事件应用

```typescript
// event-sourcing/src/Aggregate.ts
abstract class AggregateRoot {
  private _version = 0;
  private _uncommittedEvents: EventRecord[] = [];

  get id(): string { return (this as any)._id; }
  get version(): number { return this._version; }
  get uncommittedEvents(): EventRecord[] { return [...this._uncommittedEvents]; }

  protected applyEvent(event: EventRecord): void {
    const handler = (this as any)[`on${event.eventType}`];
    if (handler) {
      handler.call(this, event.payload);
    }
    this._version = event.version;
  }

  protected raiseEvent(eventType: string, payload: object): void {
    const event: EventRecord = {
      aggregateId: this.id,
      version: this._version + 1,
      eventType,
      payload,
      timestamp: new Date(),
    };
    this.applyEvent(event);
    this._uncommittedEvents.push(event);
  }

  loadFromHistory(events: EventRecord[]): void {
    for (const event of events) {
      this.applyEvent(event);
    }
  }

  markCommitted(): void {
    this._uncommittedEvents = [];
  }
}

// 示例：银行账户聚合
class BankAccount extends AggregateRoot {
  private _balance = 0;
  private _isClosed = false;

  get balance(): number { return this._balance; }

  static open(id: string, owner: string): BankAccount {
    const account = new BankAccount();
    (account as any)._id = id;
    account.raiseEvent('AccountOpened', { id, owner, initialBalance: 0 });
    return account;
  }

  deposit(amount: number): void {
    if (amount <= 0) throw new Error('Amount must be positive');
    if (this._isClosed) throw new Error('Account is closed');
    this.raiseEvent('MoneyDeposited', { amount, newBalance: this._balance + amount });
  }

  withdraw(amount: number): void {
    if (amount <= 0) throw new Error('Amount must be positive');
    if (this._isClosed) throw new Error('Account is closed');
    if (amount > this._balance) throw new Error('Insufficient funds');
    this.raiseEvent('MoneyWithdrawn', { amount, newBalance: this._balance - amount });
  }

  // 事件处理器
  private onAccountOpened(payload: { initialBalance: number }): void {
    this._balance = payload.initialBalance;
  }

  private onMoneyDeposited(payload: { amount: number; newBalance: number }): void {
    this._balance = payload.newBalance;
  }

  private onMoneyWithdrawn(payload: { amount: number; newBalance: number }): void {
    this._balance = payload.newBalance;
  }
}
```

### 6.3 投影系统

```typescript
// event-sourcing/src/projection/Projection.ts
interface Projection {
  eventTypes: string[];
  handle(event: EventRecord): Promise<void>;
}

interface ReadModel {
  id: string;
  [key: string]: any;
}

class InMemoryProjectionStore {
  private models = new Map<string, ReadModel>();

  async upsert(id: string, updater: (model: ReadModel | null) => ReadModel): Promise<void> {
    const current = this.models.get(id) ?? null;
    this.models.set(id, updater(current));
  }

  async get(id: string): Promise<ReadModel | null> {
    return this.models.get(id) ?? null;
  }

  async query(predicate: (model: ReadModel) => boolean): Promise<ReadModel[]> {
    return Array.from(this.models.values()).filter(predicate);
  }
}

// 账户余额投影
class AccountBalanceProjection implements Projection {
  eventTypes = ['AccountOpened', 'MoneyDeposited', 'MoneyWithdrawn'];

  constructor(private store: InMemoryProjectionStore) {}

  async handle(event: EventRecord): Promise<void> {
    switch (event.eventType) {
      case 'AccountOpened': {
        await this.store.upsert(event.aggregateId, () => ({
          id: event.aggregateId,
          balance: (event.payload as any).initialBalance,
          lastUpdated: event.timestamp,
        }));
        break;
      }
      case 'MoneyDeposited':
      case 'MoneyWithdrawn': {
        await this.store.upsert(event.aggregateId, (model) => ({
          id: event.aggregateId,
          balance: (event.payload as any).newBalance,
          lastUpdated: event.timestamp,
        }));
        break;
      }
    }
  }
}

// 事件总线与投影分发
class ProjectionEngine {
  private projections: Projection[] = [];

  register(projection: Projection): void {
    this.projections.push(projection);
  }

  async project(event: EventRecord): Promise<void> {
    await Promise.all(
      this.projections
        .filter(p => p.eventTypes.includes(event.eventType))
        .map(p => p.handle(event))
    );
  }
}
```

### 6.4 快照模式（Snapshot Pattern）

```typescript
// event-sourcing/src/Snapshot.ts
interface Snapshot {
  aggregateId: string;
  version: number;
  state: object;
  timestamp: Date;
}

interface SnapshotStore {
  save(snapshot: Snapshot): Promise<void>;
  load(aggregateId: string): Promise<Snapshot | null>;
}

class InMemorySnapshotStore implements SnapshotStore {
  private snapshots = new Map<string, Snapshot>();

  async save(snapshot: Snapshot): Promise<void> {
    this.snapshots.set(snapshot.aggregateId, snapshot);
  }

  async load(aggregateId: string): Promise<Snapshot | null> {
    return this.snapshots.get(aggregateId) ?? null;
  }
}

// 带快照的聚合加载器
class SnapshotAggregateLoader<T extends AggregateRoot> {
  constructor(
    private eventStore: EventStore,
    private snapshotStore: SnapshotStore,
    private factory: () => T,
    private snapshotInterval = 10
  ) {}

  async load(aggregateId: string): Promise<T> {
    const snapshot = await this.snapshotStore.load(aggregateId);
    const events = await this.eventStore.getEvents(aggregateId);

    const aggregate = this.factory();
    (aggregate as any)._id = aggregateId;

    if (snapshot) {
      // 从快照恢复状态
      Object.assign(aggregate, snapshot.state);
      (aggregate as any)._version = snapshot.version;
      // 只重放快照之后的事件
      const newEvents = events.filter(e => e.version > snapshot.version);
      aggregate.loadFromHistory(newEvents);
    } else {
      aggregate.loadFromHistory(events);
    }

    return aggregate;
  }

  async save(aggregate: T): Promise<void> {
    const events = aggregate.uncommittedEvents;
    if (events.length === 0) return;

    await this.eventStore.append(events, aggregate.version - events.length);
    aggregate.markCommitted();

    // 每 N 个版本创建一次快照
    if (aggregate.version % this.snapshotInterval === 0) {
      await this.snapshotStore.save({
        aggregateId: aggregate.id,
        version: aggregate.version,
        state: { ...(aggregate as any) },
        timestamp: new Date(),
      });
    }
  }
}
```

### 6.5 事件版本升级（Upcasting）

```typescript
// event-sourcing/src/Upcaster.ts
interface EventUpcaster {
  fromVersion: number;
  toVersion: number;
  eventType: string;
  upcast(payload: object): object;
}

class EventUpcasterChain {
  private upcasters: Map<string, EventUpcaster[]> = new Map();

  register(upcaster: EventUpcaster): void {
    const list = this.upcasters.get(upcaster.eventType) ?? [];
    list.push(upcaster);
    list.sort((a, b) => a.fromVersion - b.fromVersion);
    this.upcasters.set(upcaster.eventType, list);
  }

  upcast(event: EventRecord): EventRecord {
    const chain = this.upcasters.get(event.eventType) ?? [];
    let payload = event.payload;

    for (const upcaster of chain) {
      payload = upcaster.upcast(payload);
    }

    return { ...event, payload };
  }
}

// 使用示例：MoneyDeposited v1 → v2 升级（添加 currency 字段）
const depositUpcaster: EventUpcaster = {
  eventType: 'MoneyDeposited',
  fromVersion: 1,
  toVersion: 2,
  upcast: (payload) => ({
    ...payload,
    currency: (payload as any).currency ?? 'USD', // 默认值迁移
  }),
};
```

### 6.6 发件箱模式（Outbox Pattern）

```typescript
// event-sourcing/src/Outbox.ts
interface OutboxMessage {
  id: string;
  topic: string;
  payload: string;
  headers: Record<string, string>;
  createdAt: Date;
  processedAt?: Date;
}

interface OutboxStore {
  enqueue(message: OutboxMessage): Promise<void>;
  pollPending(limit: number): Promise<OutboxMessage[]>;
  markProcessed(id: string): Promise<void>;
}

// 在事务中同时写入事件和 outbox，保证原子性
class EventSourcingWithOutbox {
  constructor(
    private eventStore: EventStore,
    private outboxStore: OutboxStore
  ) {}

  async executeCommand(
    aggregate: AggregateRoot,
    publish: (event: EventRecord) => OutboxMessage[]
  ): Promise<void> {
    const events = aggregate.uncommittedEvents;
    if (events.length === 0) return;

    // 事务边界内同时写入事件和 outbox
    await this.eventStore.append(events, aggregate.version - events.length);

    for (const event of events) {
      const messages = publish(event);
      for (const msg of messages) {
        await this.outboxStore.enqueue(msg);
      }
    }

    aggregate.markCommitted();
  }
}

// 后台轮询处理器
class OutboxPoller {
  constructor(
    private outboxStore: OutboxStore,
    private publisher: (msg: OutboxMessage) => Promise<void>,
    private intervalMs = 1000
  ) {}

  start(): void {
    setInterval(async () => {
      const pending = await this.outboxStore.pollPending(100);
      for (const msg of pending) {
        try {
          await this.publisher(msg);
          await this.outboxStore.markProcessed(msg.id);
        } catch (err) {
          console.error(`Failed to publish outbox message ${msg.id}:`, err);
        }
      }
    }, this.intervalMs);
  }
}
```

### 6.7 事件存储事务边界（PostgreSQL 实现）

```typescript
// event-sourcing/src/PgEventStore.ts — 生产级 PostgreSQL 事件存储
import { Pool, PoolClient } from 'pg';

interface PgEventRecord extends EventRecord {
  position: bigint; // 全局有序位置
}

class PostgreSQLEventStore implements EventStore {
  constructor(private pool: Pool) {}

  async append(events: EventRecord[], expectedVersion: number): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // 乐观并发控制：检查当前版本
      const { rows } = await client.query(
        `SELECT COUNT(*) as version FROM events WHERE aggregate_id = $1 FOR UPDATE`,
        [events[0].aggregateId]
      );
      const currentVersion = parseInt(rows[0].version, 10);
      if (currentVersion !== expectedVersion) {
        throw new Error(`Concurrency conflict: expected ${expectedVersion}, found ${currentVersion}`);
      }

      // 批量插入事件
      for (let i = 0; i < events.length; i++) {
        await client.query(
          `INSERT INTO events (aggregate_id, version, event_type, payload, metadata, occurred_at)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            events[i].aggregateId,
            expectedVersion + i + 1,
            events[i].eventType,
            JSON.stringify(events[i].payload),
            JSON.stringify(events[i].metadata ?? {}),
            events[i].timestamp,
          ]
        );
      }

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async getEvents(aggregateId: string): Promise<EventRecord[]> {
    const { rows } = await this.pool.query(
      `SELECT aggregate_id, version, event_type, payload, metadata, occurred_at
       FROM events WHERE aggregate_id = $1 ORDER BY version ASC`,
      [aggregateId]
    );
    return rows.map((r) => ({
      aggregateId: r.aggregate_id,
      version: r.version,
      eventType: r.event_type,
      payload: r.payload,
      metadata: r.metadata,
      timestamp: r.occurred_at,
    }));
  }

  async getAllEvents(afterPosition = 0, limit = 100): Promise<EventRecord[]> {
    const { rows } = await this.pool.query(
      `SELECT * FROM events WHERE position > $1 ORDER BY position ASC LIMIT $2`,
      [afterPosition, limit]
    );
    return rows.map((r) => ({
      aggregateId: r.aggregate_id,
      version: r.version,
      eventType: r.event_type,
      payload: r.payload,
      metadata: r.metadata,
      timestamp: r.occurred_at,
    }));
  }
}
```

## 7. 挑战与应对

| 挑战 | 应对策略 |
|------|---------|
| 事件演变 | 向上/向下转换器（Upcaster/Downcaster） |
| 查询复杂 | CQRS + 物化视图 |
| 外部系统集成 | 在投影中发送外部通知（发件箱模式） |
| 事件存储增长 | 归档旧事件、压缩、快照 |
| 并发冲突 | 乐观并发控制（版本号） |

### 7.1 事件溯源测试模式

```typescript
// event-sourcing/src/testing.ts — 事件溯源的 Given-When-Then 测试
class AggregateTestHarness<T extends AggregateRoot> {
  constructor(private factory: () => T, private loader: SnapshotAggregateLoader<T>) {}

  async given(events: EventRecord[]): Promise<WhenPhase<T>> {
    const aggregate = this.factory();
    (aggregate as any)._id = events[0]?.aggregateId ?? 'test-id';
    aggregate.loadFromHistory(events);
    return new WhenPhase(aggregate, this.loader);
  }
}

class WhenPhase<T extends AggregateRoot> {
  constructor(private aggregate: T, private loader: SnapshotAggregateLoader<T>) {}

  async when(action: (aggregate: T) => void): Promise<ThenPhase<T>> {
    action(this.aggregate);
    await this.loader.save(this.aggregate);
    return new ThenPhase(this.aggregate);
  }
}

class ThenPhase<T extends AggregateRoot> {
  constructor(private aggregate: T) {}

  expectEvents(expectedTypes: string[]): ThenPhase<T> {
    const actual = this.aggregate.uncommittedEvents.map((e) => e.eventType);
    if (JSON.stringify(actual) !== JSON.stringify(expectedTypes)) {
      throw new Error(`Expected events ${JSON.stringify(expectedTypes)}, got ${JSON.stringify(actual)}`);
    }
    return this;
  }

  expectState(predicate: (state: T) => boolean): ThenPhase<T> {
    if (!predicate(this.aggregate)) {
      throw new Error('Aggregate state did not match expected predicate');
    }
    return this;
  }
}

// 使用示例
const harness = new AggregateTestHarness(() => new BankAccount(), loader);

await harness
  .given([
    { aggregateId: 'acc-1', version: 1, eventType: 'AccountOpened', payload: { initialBalance: 0 }, timestamp: new Date() },
  ])
  .when((acc) => acc.deposit(100))
  .then((t) => t.expectEvents(['MoneyDeposited']).expectState((acc) => acc.balance === 100));
```

## 8. 与相邻模块的关系

- **06-architecture-patterns**: 架构模式（CQRS、事件驱动）
- **70-distributed-systems**: 分布式系统中的事件一致性
- **25-microservices**: 微服务间的事件通信

## 9. 参考链接

- [Event Sourcing - Martin Fowler](https://martinfowler.com/eaaDev/EventSourcing.html) — 事件溯源模式定义
- [CQRS, Task Based UIs, Event Sourcing agh! - Greg Young](https://codebetter.com/gregyoung/2010/02/16/cqrs-task-based-uis-event-sourcing-agh/) — Greg Young 的 CQRS+ES 开创文章
- [Microsoft Event Sourcing Pattern](https://docs.microsoft.com/en-us/azure/architecture/patterns/event-sourcing) — 微软云架构模式文档
- [Event Store DB Documentation](https://developers.eventstore.com/) — 专用事件存储数据库
- [Designing Event-Driven Systems - Confluent](https://www.confluent.io/designing-event-driven-systems/) — 事件驱动系统设计
- [The Dark Side of Event Sourcing - Haufe](https://www.haufegroup.io/en/blog/event-sourcing-the-dark-side) — 事件溯源实践中的挑战与对策
- [RFC 4122 — UUID](https://datatracker.ietf.org/doc/html/rfc4122) — UUID v4 标准规范
- [ISO 8601 Date Format](https://www.iso.org/iso-8601-date-and-time-format.html) — 国际日期时间标准
- [Building Microservices - Sam Newman](https://samnewman.io/books/building_microservices/) — 微服务架构经典，含事件溯源章节
- [Implementing Domain-Driven Design - Vaughn Vernon](https://www.oreilly.com/library/view/implementing-domain-driven-design/9780133039900/) — DDD 实现，聚合根与事件存储
- [Outbox Pattern - Chris Richardson](https://microservices.io/patterns/data/transactional-outbox.html) — 微服务模式：事务性发件箱
- [Event Sourcing with PostgreSQL - AxonIQ](https://www.axoniq.io/resources/event-sourcing) — 生产级事件溯源实践
- [Kafka as an Event Store - Confluent Blog](https://www.confluent.io/blog/apache-kafka-event-store/) — 使用 Kafka 实现事件存储
- [Projections in Event Sourcing - Alexey Zimarev](https://zimarev.com/blog/event-sourcing/projections/) — 投影模式详解
- [Event Sourcing in Practice - Bernd Rücker](https://www.berndruecker.io/) — Camunda 联合创始人的事件溯源实践
- [PostgreSQL Documentation — Transaction Isolation](https://www.postgresql.org/docs/current/transaction-iso.html) — PostgreSQL 事务隔离级别
- [Axon Framework Reference Guide](https://docs.axoniq.io/reference-guide/) — Java 事件溯源框架权威参考
- [Event Modeling — Adam Dymitruk](https://eventmodeling.org/) — 事件建模方法论
- [ESDB Performance Tuning](https://developers.eventstore.com/server/v24.2/configuration.html) — EventStoreDB 性能调优官方指南
- [Event Store Sourcing Patterns — O'Reilly](https://www.oreilly.com/library/view/software-architecture-patterns/9781491971437/ch02.html) — O'Reilly 软件架构模式：事件驱动
