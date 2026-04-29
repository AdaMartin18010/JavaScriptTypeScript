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


## 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| MDN | 文档 | [developer.mozilla.org](https://developer.mozilla.org) |
| web.dev | 指南 | [web.dev](https://web.dev) |
| EventStoreDB | 官方文档 | [eventstore.com](https://www.eventstore.com/) |
| Martin Fowler — Event Sourcing | 权威文章 | [martinfowler.com](https://martinfowler.com/eaaDev/EventSourcing.html) |
| Microsoft — Event Sourcing pattern | 架构指南 | [learn.microsoft.com](https://learn.microsoft.com/en-us/azure/architecture/patterns/event-sourcing) |

---

*最后更新: 2026-04-29*
