---
dimension: 综合
sub-dimension: Event sourcing
created: 2026-04-28
---

# 模块归属声明

本模块归属 **「综合」** 维度，聚焦 Event sourcing 核心概念与工程实践。

## 包含内容

- 本模块聚焦 event sourcing 核心概念与工程实践。

## 相关索引

- `30-knowledge-base/30.2-categories/README.md` — 分类总览
- `20-code-lab/` — 代码实验室实践
## 目录内容

- 📄 ARCHIVED.md
- 📄 README.md
- 📄 THEORY.md
- 📄 _MIGRATED_FROM.md
- 📄 event-store.test.ts
- 📄 event-store.ts
- 📄 index.ts


---

> 此分类文档由批量生成脚本自动创建，请根据实际模块内容补充和调整。

## 子模块索引

| 子模块 | 说明 | 关键文件 |
|--------|------|----------|
| `event-store/` | 事件存储、聚合重建与快照机制 | `event-store.ts`, `event-store.test.ts` |
| `index/` | 模块入口与公共 API 导出 | `index.ts` |

## 代码示例

### TypeScript 事件溯源聚合根

```typescript
interface DomainEvent {
  type: string;
  payload: unknown;
  occurredAt: Date;
}

class OrderAggregate {
  private events: DomainEvent[] = [];
  private state = { status: 'pending' as string, total: 0 };

  apply(event: DomainEvent) {
    switch (event.type) {
      case 'OrderCreated':
        this.state.status = 'created';
        break;
      case 'ItemAdded':
        this.state.total += (event.payload as { amount: number }).amount;
        break;
    }
    this.events.push(event);
  }

  getUncommittedEvents() {
    return [...this.events];
  }
}
```

### 快照与聚合重建

```typescript
// event-store.ts — 带快照优化的事件存储

interface Snapshot<T> {
  aggregateId: string;
  version: number;
  state: T;
}

interface StoredEvent {
  aggregateId: string;
  version: number;
  type: string;
  payload: unknown;
  occurredAt: string;
}

class EventStore {
  private events: StoredEvent[] = [];
  private snapshots = new Map<string, Snapshot<unknown>>();
  private snapshotInterval = 10; // 每 10 个事件生成快照

  append(event: StoredEvent): void {
    this.events.push(event);
    if (event.version % this.snapshotInterval === 0) {
      // 实际系统中应从聚合根生成快照
      this.snapshots.set(event.aggregateId, {
        aggregateId: event.aggregateId,
        version: event.version,
        state: {}, // 聚合根当前状态
      });
    }
  }

  getEvents(aggregateId: string, afterVersion = 0): StoredEvent[] {
    return this.events.filter(
      (e) => e.aggregateId === aggregateId && e.version > afterVersion
    );
  }

  getSnapshot(aggregateId: string): Snapshot<unknown> | undefined {
    return this.snapshots.get(aggregateId);
  }

  // 重建聚合：优先加载快照，再重放后续事件
  rebuild<T>(
    aggregateId: string,
    applyEvent: (state: T, event: StoredEvent) => T,
    initialState: T
  ): { state: T; version: number } {
    const snapshot = this.getSnapshot(aggregateId);
    let state = snapshot ? (snapshot.state as T) : initialState;
    let version = snapshot ? snapshot.version : 0;

    const events = this.getEvents(aggregateId, version);
    for (const event of events) {
      state = applyEvent(state, event);
      version = event.version;
    }

    return { state, version };
  }
}
```

### 投影（Read Model）构建

```typescript
// projections.ts — 基于事件流构建查询模型

interface OrderSummary {
  orderId: string;
  status: string;
  total: number;
  itemCount: number;
}

class OrderProjection {
  private readModel = new Map<string, OrderSummary>();

  handleEvent(event: StoredEvent): void {
    switch (event.type) {
      case 'OrderCreated': {
        const payload = event.payload as { orderId: string };
        this.readModel.set(payload.orderId, {
          orderId: payload.orderId,
          status: 'created',
          total: 0,
          itemCount: 0,
        });
        break;
      }
      case 'ItemAdded': {
        const p = event.payload as { orderId: string; amount: number };
        const summary = this.readModel.get(p.orderId);
        if (summary) {
          summary.total += p.amount;
          summary.itemCount += 1;
        }
        break;
      }
    }
  }

  getSummary(orderId: string): OrderSummary | undefined {
    return this.readModel.get(orderId);
  }
}
```

## 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| MDN | 文档 | [developer.mozilla.org](https://developer.mozilla.org) |
| web.dev | 指南 | [web.dev](https://web.dev) |
| EventStoreDB | 官方文档 | [eventstore.com](https://www.eventstore.com/) |
| Martin Fowler — Event Sourcing | 权威文章 | [martinfowler.com](https://martinfowler.com/eaaDev/EventSourcing.html) |
| Microsoft — Event Sourcing pattern | 架构指南 | [learn.microsoft.com](https://learn.microsoft.com/en-us/azure/architecture/patterns/event-sourcing) |
| Greg Young — CQRS, Task Based UIs, Event Sourcing agh! | 演讲 | [cqrs.files.wordpress.com](https://cqrs.files.wordpress.com/2010/11/cqrs_documents.pdf) |
| Designing Event-Driven Systems (O'Reilly) | 免费电子书 | [www.confluent.io/designing-event-driven-systems](https://www.confluent.io/designing-event-driven-systems/) |
| Axon Framework | Java/C# 事件溯源框架参考 | [axoniq.io](https://axoniq.io/) |
| Temporal — Durable Execution | 相关工作流持久化 | [temporal.io](https://temporal.io/) |

---

*最后更新: 2026-04-29*
