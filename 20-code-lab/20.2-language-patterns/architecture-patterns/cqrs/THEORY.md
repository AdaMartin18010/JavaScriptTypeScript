# CQRS 模式

> **定位**：`20-code-lab/20.2-language-patterns/architecture-patterns/cqrs`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块解决读写负载分离的架构问题。通过命令查询职责分离提升高并发场景下的系统吞吐量与数据一致性。

### 1.2 形式化基础

设系统状态为 $S$，命令集为 $C$，查询集为 $Q$：

- 命令端：$c: S \to S'$（状态转换函数）
- 查询端：$q: S \to V$（只读投影函数）
- CQRS 约束：$C \cap Q = \emptyset$（命令与查询接口分离）

### 1.3 关键概念

| 概念 | 定义 | 关联 |
|------|------|------|
| 命令端 | 负责状态变更的写模型 | commands/ |
| 查询端 | 针对读优化的投影模型 | queries/ |
| 事件溯源 | 可选的持久化机制，通过事件流重建状态 | events/ |

---

## 二、设计原理

### 2.1 为什么存在

读写负载的特征截然不同：读操作高频且可缓存，写操作需要事务保证。CQRS 通过分离模型让两端独立优化，是高并发系统的有效架构。

### 2.2 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 完全分离 | 读写独立优化 | 最终一致性复杂 | 高并发系统 |
| 共享模型 | 简单一致 | 读写互相拖累 | 中小型应用 |

### 2.3 模式对比

| 维度 | CRUD | CQS | CQRS | CQRS + Event Sourcing |
|------|------|-----|------|----------------------|
| 接口数量 | 1（统一模型） | 1（命令/查询方法分离） | 2（独立模型） | 2 + 事件存储 |
| 存储数量 | 1 | 1 | 1 或 2 | 2（事件库 + 读库） |
| 一致性 | 强一致 | 强一致 | 最终一致 | 最终一致 |
| 复杂度 | 低 | 低 | 高 | 极高 |
| 可审计性 | 低 | 低 | 中 | 高（完整事件流） |
| 适用规模 | 小型单体 | 中小型应用 | 大型分布式 | 需要审计与溯源的系统 |

---

## 三、实践映射

### 3.1 从理论到代码

以下示例展示一个简单的 TypeScript CQRS 实现，命令端与查询端分别操作独立的内存存储：

```typescript
// cqrs-demo.ts
type User = { id: string; name: string; email: string };

// 命令端（写模型）
class UserCommandHandler {
  constructor(private db: Map<string, User>, private events: string[]) {}
  createUser(id: string, name: string, email: string) {
    const user: User = { id, name, email };
    this.db.set(id, user);
    this.events.push(JSON.stringify({ type: 'UserCreated', payload: user }));
  }
  updateEmail(id: string, email: string) {
    const user = this.db.get(id);
    if (!user) throw new Error('User not found');
    user.email = email;
    this.events.push(JSON.stringify({ type: 'EmailUpdated', payload: { id, email } }));
  }
}

// 查询端（读模型）
class UserQueryHandler {
  constructor(private readDb: Map<string, User>) {}
  getUser(id: string): User | undefined {
    return this.readDb.get(id);
  }
  searchByEmail(email: string): User[] {
    return Array.from(this.readDb.values()).filter((u) => u.email.includes(email));
  }
}

// 同步读模型（实际场景中可通过事件总线异步同步）
const writeDb = new Map<string, User>();
const events: string[] = [];
const readDb = writeDb; // 简化示例：共享内存；生产环境应分离

const commands = new UserCommandHandler(writeDb, events);
const queries = new UserQueryHandler(readDb);

commands.createUser('1', 'Alice', 'alice@example.com');
console.log(queries.getUser('1'));
```

#### 显式命令/查询接口分离

在生产实践中，命令与查询应通过显式接口约束，防止混用：

```typescript
// cqrs-interfaces.ts
interface Command<T> {
  readonly type: string;
  readonly payload: T;
}

interface Query<T, R> {
  readonly type: string;
  readonly payload: T;
  execute(): Promise<R>;
}

// 命令
class CreateUserCommand implements Command<{ id: string; name: string; email: string }> {
  readonly type = 'CreateUser';
  constructor(readonly payload: { id: string; name: string; email: string }) {}
}

// 查询
class GetUserByIdQuery implements Query<{ id: string }, User | null> {
  readonly type = 'GetUserById';
  constructor(readonly payload: { id: string }, private readStore: UserReadStore) {}
  async execute() {
    return this.readStore.findById(this.payload.id);
  }
}
```

### 3.2 事件存储与读模型投影

```typescript
// event-store.ts — 极简内存事件存储
interface DomainEvent {
  readonly id: string;
  readonly type: string;
  readonly payload: unknown;
  readonly timestamp: number;
}

class EventStore {
  private streams = new Map<string, DomainEvent[]>();

  append(streamId: string, event: Omit<DomainEvent, 'id' | 'timestamp'>) {
    const stream = this.streams.get(streamId) || [];
    stream.push({
      ...event,
      id: `${streamId}-${stream.length}`,
      timestamp: Date.now(),
    });
    this.streams.set(streamId, stream);
  }

  getStream(streamId: string): readonly DomainEvent[] {
    return Object.freeze(this.streams.get(streamId) || []);
  }

  // 通过事件流重建聚合状态
  fold<T>(streamId: string, initial: T, reducer: (state: T, event: DomainEvent) => T): T {
    return this.getStream(streamId).reduce(reducer, initial);
  }
}

// 读模型投影（Read Model Projection）
class UserProjector {
  private readModel = new Map<string, User>();

  apply(event: DomainEvent): void {
    switch (event.type) {
      case 'UserCreated': {
        const u = event.payload as User;
        this.readModel.set(u.id, u);
        break;
      }
      case 'EmailUpdated': {
        const { id, email } = event.payload as { id: string; email: string };
        const user = this.readModel.get(id);
        if (user) user.email = email;
        break;
      }
    }
  }

  get state() {
    return new Map(this.readModel);
  }
}
```

### 3.3 命令总线与中间件管道

```typescript
// command-bus.ts — 支持中间件（日志、校验、事务）的命令总线
type CommandHandler<C, R> = (command: C) => Promise<R>;
type Middleware<C, R> = (next: CommandHandler<C, R>) => CommandHandler<C, R>;

class CommandBus {
  private handlers = new Map<string, CommandHandler<any, any>>();
  private middlewares: Middleware<any, any>[] = [];

  register<C, R>(type: string, handler: CommandHandler<C, R>): void {
    this.handlers.set(type, handler);
  }

  use<C, R>(middleware: Middleware<C, R>): void {
    this.middlewares.push(middleware);
  }

  async dispatch<C, R>(command: Command<C>): Promise<R> {
    const handler = this.handlers.get(command.type);
    if (!handler) throw new Error(`No handler for ${command.type}`);

    const pipeline = this.middlewares.reduceRight(
      (next, mw) => mw(next),
      handler
    );
    return pipeline(command);
  }
}

// 使用示例
const bus = new CommandBus();

// 注册日志中间件
bus.use((next) => async (cmd) => {
  console.log(`[Command] ${cmd.type}`, cmd.payload);
  const result = await next(cmd);
  console.log(`[Command] ${cmd.type} completed`);
  return result;
});

// 注册处理器
bus.register('CreateUser', async (cmd: CreateUserCommand) => {
  // 实际持久化逻辑
  return { userId: cmd.payload.id };
});
```

### 3.4 Saga 模式：分布式事务编排

```typescript
// saga.ts — 补偿事务编排示例
interface SagaStep {
  execute(): Promise<void>;
  compensate(): Promise<void>;
}

class OrderSaga {
  private steps: SagaStep[] = [];
  private executed: SagaStep[] = [];

  add(step: SagaStep) {
    this.steps.push(step);
  }

  async run(): Promise<void> {
    for (const step of this.steps) {
      try {
        await step.execute();
        this.executed.push(step);
      } catch (err) {
        // 回滚已执行的步骤
        for (const s of this.executed.reverse()) {
          await s.compensate().catch(() => {});
        }
        throw err;
      }
    }
  }
}

// 使用示例
const saga = new OrderSaga();
saga.add({
  execute: async () => await reserveInventory(),
  compensate: async () => await releaseInventory(),
});
saga.add({
  execute: async () => await chargePayment(),
  compensate: async () => await refundPayment(),
});
```

### 3.5 读模型与 PostgreSQL 物化视图同步

```typescript
// read-model-sync.ts — 用 PostgreSQL 物化视图作为读模型
import { Pool } from 'pg';

class OrderReadModel {
  constructor(private pool: Pool) {}

  async refresh(): Promise<void> {
    // 刷新物化视图（实际由事件触发）
    await this.pool.query('REFRESH MATERIALIZED VIEW CONCURRENTLY order_summary');
  }

  async findByCustomer(customerId: string) {
    const { rows } = await this.pool.query(
      'SELECT * FROM order_summary WHERE customer_id = $1 ORDER BY created_at DESC',
      [customerId]
    );
    return rows;
  }

  async getTopProducts(limit = 10) {
    const { rows } = await this.pool.query(
      'SELECT product_id, SUM(quantity) as total_sold FROM order_summary GROUP BY product_id ORDER BY total_sold DESC LIMIT $1',
      [limit]
    );
    return rows;
  }
}
```

### 3.6 事件溯源快照（Snapshotting）优化

```typescript
// snapshot.ts — 避免重放全部事件
interface Snapshot<T> {
  aggregateId: string;
  version: number;
  state: T;
  createdAt: Date;
}

class SnapshotStore<T> {
  private snapshots = new Map<string, Snapshot<T>>();
  private readonly SNAPSHOT_EVERY = 50; // 每 50 个事件打快照

  save(snapshot: Snapshot<T>): void {
    this.snapshots.set(snapshot.aggregateId, snapshot);
  }

  load(aggregateId: string): Snapshot<T> | undefined {
    return this.snapshots.get(aggregateId);
  }

  shouldSnapshot(eventCount: number): boolean {
    return eventCount % this.SNAPSHOT_EVERY === 0;
  }
}

// 使用：重建聚合时优先加载快照，再重放增量事件
function rehydrateAggregate<T>(
  aggregateId: string,
  eventStore: EventStore,
  snapshotStore: SnapshotStore<T>,
  initialState: T,
  reducer: (state: T, event: DomainEvent) => T
): T {
  const snapshot = snapshotStore.load(aggregateId);
  const fromVersion = snapshot ? snapshot.version : 0;
  let state = snapshot ? snapshot.state : initialState;

  const events = eventStore.getStream(aggregateId).slice(fromVersion);
  for (const event of events) {
    state = reducer(state, event);
  }

  if (snapshotStore.shouldSnapshot(fromVersion + events.length)) {
    snapshotStore.save({
      aggregateId,
      version: fromVersion + events.length,
      state,
      createdAt: new Date(),
    });
  }

  return state;
}
```

### 3.7 常见误区

| 误区 | 正确理解 |
|------|---------|
| CQRS 必须配合事件溯源 | CQRS 可独立使用，事件溯源是可选的 |
| 分离后读写总是一致的 | 最终一致性需要额外的同步机制 |
| CQRS 适合所有项目 | 中小型项目引入 CQRS 可能过度设计 |
| Saga 保证 ACID | Saga 只保证最终一致性，需补偿处理 |

### 3.8 扩展阅读

- [CQRS 模式 — Martin Fowler](https://martinfowler.com/bliki/CQRS.html)
- [Microsoft — CQRS Pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/cqrs)
- [Event Sourcing and CQRS — Martin Fowler](https://martinfowler.com/eaaDev/EventSourcing.html)
- [DDD Reference — Eric Evans](https://www.domainlanguage.com/ddd/reference/)
- [Axon Framework — CQRS & Event Sourcing](https://axoniq.io/)
- [Greg Young — CQRS, Task Based UIs, Event Sourcing aha!](https://web.archive.org/web/20230205142705/http://codebetter.com/gregyoung/2010/02/16/cqrs-task-based-uis-event-sourcing-aha/)
- [Microsoft — Event Sourcing pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/event-sourcing)
- [Saga Pattern — Chris Richardson](https://microservices.io/patterns/data/saga.html) — 微服务架构中的 Saga 事务模式
- [EventStoreDB Documentation](https://developers.eventstore.com/) — 专用事件存储数据库
- [NestJS CQRS Module](https://docs.nestjs.com/recipes/cqrs) — Node.js 生态 CQRS 实践框架
- [Microsoft — Saga distributed pattern](https://learn.microsoft.com/en-us/azure/architecture/reference-architectures/saga/saga) — Azure 官方 Saga 架构参考
- [PostgreSQL Materialized Views](https://www.postgresql.org/docs/current/rules-materializedviews.html)
- [Redis Streams for Event Sourcing](https://redis.io/docs/data-types/streams/)
- [Apache Kafka — Event Sourcing Guide](https://kafka.apache.org/documentation/)

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
