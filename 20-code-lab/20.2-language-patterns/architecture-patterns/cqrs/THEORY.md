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

### 3.2 常见误区

| 误区 | 正确理解 |
|------|---------|
| CQRS 必须配合事件溯源 | CQRS 可独立使用，事件溯源是可选的 |
| 分离后读写总是一致的 | 最终一致性需要额外的同步机制 |
| CQRS 适合所有项目 | 中小型项目引入 CQRS 可能过度设计 |

### 3.3 扩展阅读

- [CQRS 模式 — Martin Fowler](https://martinfowler.com/bliki/CQRS.html)
- [Microsoft — CQRS Pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/cqrs)
- [Event Sourcing and CQRS — Martin Fowler](https://martinfowler.com/eaaDev/EventSourcing.html)
- [DDD Reference — Eric Evans](https://www.domainlanguage.com/ddd/reference/)
- [Axon Framework — CQRS & Event Sourcing](https://axoniq.io/)
- [Greg Young — CQRS, Task Based UIs, Event Sourcing aha!](https://web.archive.org/web/20230205142705/http://codebetter.com/gregyoung/2010/02/16/cqrs-task-based-uis-event-sourcing-aha/)
- [Microsoft — Event Sourcing pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/event-sourcing)

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
