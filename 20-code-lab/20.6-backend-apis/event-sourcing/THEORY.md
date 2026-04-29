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

## 7. 挑战与应对

| 挑战 | 应对策略 |
|------|---------|
| 事件演变 | 向上/向下转换器（Upcaster/Downcaster） |
| 查询复杂 | CQRS + 物化视图 |
| 外部系统集成 | 在投影中发送外部通知（发件箱模式） |
| 事件存储增长 | 归档旧事件、压缩、快照 |
| 并发冲突 | 乐观并发控制（版本号） |

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
