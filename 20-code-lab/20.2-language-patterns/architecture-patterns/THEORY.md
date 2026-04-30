# 架构模式 — 理论基础

## 1. 分层架构（Layered Architecture）

最经典的架构模式，将系统分为水平层次：

- **表现层**: UI、API 接口
- **业务逻辑层**: 领域模型、用例、服务
- **数据访问层**: 仓储、ORM、数据库访问
- **优点**: 简单易懂，职责分离清晰
- **缺点**: 层间耦合，难以横向扩展

### 分层架构代码示例

```typescript
// layered-architecture.ts — 经典三层架构

// 数据访问层（DAL）
interface UserRepository {
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<void>;
}

class PostgresUserRepository implements UserRepository {
  constructor(private db: DatabaseConnection) {}
  async findById(id: string): Promise<User | null> {
    const row = await this.db.query('SELECT * FROM users WHERE id = $1', [id]);
    return row ? new User(row.id, row.name, row.email) : null;
  }
  async save(user: User): Promise<void> {
    await this.db.query('INSERT INTO users ...', [user.id, user.name, user.email]);
  }
}

// 业务逻辑层（BLL）
class UserService {
  constructor(private repo: UserRepository) {}
  async activateUser(id: string): Promise<void> {
    const user = await this.repo.findById(id);
    if (!user) throw new Error('User not found');
    user.activate();
    await this.repo.save(user);
  }
}

// 表现层（Presentation）
class UserController {
  constructor(private service: UserService) {}
  async handleActivate(req: Request, res: Response) {
    await this.service.activateUser(req.params.id);
    res.json({ success: true });
  }
}
```

---

## 2. 六边形架构（Hexagonal / Ports and Adapters）

Alistair Cockburn 提出，强调**业务逻辑独立于外部世界**：

- **核心域**: 纯业务逻辑，不依赖任何框架
- **端口**: 定义核心业务需要的接口（输入/输出）
- **适配器**: 端口的具体实现（HTTP、数据库、消息队列）
- **测试优势**: 可用 Mock 适配器单元测试核心域

---

## 3. CQRS（Command Query Responsibility Segregation）

将读操作和写操作分离到不同模型：

- **Command 端**: 处理写操作，维护事务一致性
- **Query 端**: 处理读操作，使用反规范化视图优化查询
- **适用场景**: 读多写少、复杂查询、事件溯源配合

---

## 4. 事件溯源（Event Sourcing）

以事件为唯一真相来源，系统状态通过重放事件重建：

- **事件存储**: 只追加的不可变日志
- **投影（Projection）**: 将事件流转换为查询视图
- **快照**: 定期保存状态加速恢复

---

## 5. 微内核架构（Microkernel / Plugin）

核心系统提供最小功能，通过插件扩展：

- **核心**: 插件管理、基础服务
- **插件**: 独立开发、动态加载
- **应用**: VS Code、Eclipse、Chrome 扩展

---

## 6. 架构模式对比

| 模式 | 耦合度 | 可测试性 | 扩展性 | 复杂度 | 典型应用 |
|------|--------|----------|--------|--------|----------|
| 分层架构 | 中 | 中 | 低 | 低 | 传统企业应用 |
| 六边形架构 | 低 | 高 | 高 | 中 | 领域驱动设计 |
| CQRS | 低 | 高 | 高 | 高 | 电商、金融系统 |
| 事件溯源 | 低 | 中 | 高 | 高 | 审计追踪、金融 |
| 微内核 | 低 | 高 | 高 | 中 | IDE、浏览器 |

---

## 7. 代码示例：六边形架构端口定义

```typescript
// 核心域：纯业务逻辑，零外部依赖
interface OrderService {
  placeOrder(command: PlaceOrderCommand): Promise<Order>;
  cancelOrder(orderId: string): Promise<void>;
}

// 输入端口（驱动适配器实现）
interface ForPlacingOrders {
  placeOrder(cmd: PlaceOrderCommand): Promise<Order>;
}

// 输出端口（被驱动适配器实现）
interface ForInventory {
  checkAvailability(productId: string, qty: number): Promise<boolean>;
}

// 核心实现
class OrderServiceImpl implements OrderService {
  constructor(private inventory: ForInventory) {}

  async placeOrder(cmd: PlaceOrderCommand): Promise<Order> {
    const available = await this.inventory.checkAvailability(cmd.productId, cmd.quantity);
    if (!available) throw new OutOfStockError(cmd.productId);
    // ... 核心逻辑
  }
}
```

### 六边形架构完整示例

```typescript
// hexagonal-example.ts — 六边形架构的端口与适配器实现

// ===== 核心域（Domain）===== 零框架依赖 =====

interface EmailService {
  send(to: string, subject: string, body: string): Promise<void>;
}

class NotificationDomain {
  constructor(private email: EmailService) {}

  async notifyUser(userEmail: string, message: string): Promise<void> {
    if (!userEmail.includes('@')) throw new Error('Invalid email');
    await this.email.send(userEmail, 'Notification', message);
  }
}

// ===== 适配器（Adapters）===== =====

// 输出适配器：SendGrid 实现
class SendGridEmailAdapter implements EmailService {
  constructor(private apiKey: string) {}
  async send(to: string, subject: string, body: string): Promise<void> {
    await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.apiKey}` },
      body: JSON.stringify({ personalizations: [{ to: [{ email: to }] }], subject, content: [{ type: 'text/plain', value: body }] }),
    });
  }
}

// 输出适配器：Console 实现（测试用）
class ConsoleEmailAdapter implements EmailService {
  async send(to: string, subject: string, body: string): Promise<void> {
    console.log(`[EMAIL] To: ${to}, Subject: ${subject}, Body: ${body}`);
  }
}

// 输入适配器：HTTP REST
class NotificationHttpController {
  constructor(private domain: NotificationDomain) {}
  async postNotify(req: { email: string; message: string }) {
    await this.domain.notifyUser(req.email, req.message);
    return { status: 'sent' };
  }
}

// 输入适配器：CLI
class NotificationCliAdapter {
  constructor(private domain: NotificationDomain) {}
  async run(args: string[]) {
    const [email, message] = args;
    await this.domain.notifyUser(email, message);
  }
}

// ===== 组装（Composition Root）===== =====
function createProductionApp() {
  const email = new SendGridEmailAdapter(process.env.SENDGRID_KEY!);
  const domain = new NotificationDomain(email);
  return new NotificationHttpController(domain);
}

function createTestApp() {
  const email = new ConsoleEmailAdapter();
  const domain = new NotificationDomain(email);
  return new NotificationHttpController(domain);
}
```

---

## 8. 代码示例：CQRS 实现

以下展示一个简化的 CQRS 结构，命令端与查询端使用独立模型与存储：

```typescript
// commands/place-order.ts
interface PlaceOrderCommand {
  userId: string;
  productId: string;
  quantity: number;
}

class OrderCommandHandler {
  constructor(private orderRepo: OrderWriteRepository) {}

  async handle(cmd: PlaceOrderCommand): Promise<void> {
    const order = Order.create(cmd);
    await this.orderRepo.save(order);
    // 发布领域事件，供投影同步
    await eventBus.publish('OrderPlaced', { orderId: order.id, ...cmd });
  }
}

// queries/order-summary.ts
class OrderQueryHandler {
  constructor(private readDb: OrderReadRepository) {}

  async getUserOrders(userId: string): Promise<OrderSummary[]> {
    // 直接查询反规范化视图，避免 JOIN
    return this.readDb.findByUser(userId);
  }
}

// 同步投影（Projection）
eventBus.subscribe('OrderPlaced', async (event) => {
  await readDb.upsertSummary({
    orderId: event.orderId,
    userId: event.userId,
    status: 'PENDING',
    placedAt: new Date(),
  });
});
```

### CQRS + Saga 模式：分布式事务协调

```typescript
// saga.ts — Saga 模式实现分布式事务

type SagaStep = {
  execute: () => Promise<void>;
  compensate: () => Promise<void>;
};

class Saga {
  private steps: SagaStep[] = [];
  private executed: SagaStep[] = [];

  add(step: SagaStep) {
    this.steps.push(step);
    return this;
  }

  async execute(): Promise<void> {
    for (const step of this.steps) {
      try {
        await step.execute();
        this.executed.push(step);
      } catch (err) {
        // 回滚已执行的步骤
        for (const s of this.executed.reverse()) {
          await s.compensate();
        }
        throw err;
      }
    }
  }
}

// 使用示例：订单创建 Saga
async function createOrderSaga(order: Order) {
  const saga = new Saga()
    .add({
      execute: () => inventoryService.reserve(order.productId, order.qty),
      compensate: () => inventoryService.release(order.productId, order.qty),
    })
    .add({
      execute: () => paymentService.charge(order.userId, order.amount),
      compensate: () => paymentService.refund(order.userId, order.amount),
    })
    .add({
      execute: () => orderRepo.confirm(order.id),
      compensate: () => orderRepo.cancel(order.id),
    });

  await saga.execute();
}
```

---

## 9. 代码示例：事件溯源与状态重建

```typescript
// event-store.ts
interface DomainEvent {
  aggregateId: string;
  type: string;
  payload: unknown;
  occurredAt: Date;
}

interface EventStore {
  append(event: DomainEvent): Promise<void>;
  getEvents(aggregateId: string): Promise<DomainEvent[]>;
}

// 聚合根：通过重放事件重建状态
class BankAccount {
  private balance = 0;
  private id: string;

  constructor(id: string, events: DomainEvent[] = []) {
    this.id = id;
    for (const e of events) this.apply(e);
  }

  private apply(event: DomainEvent) {
    switch (event.type) {
      case 'AccountDeposited':
        this.balance += (event.payload as { amount: number }).amount;
        break;
      case 'AccountWithdrawn':
        this.balance -= (event.payload as { amount: number }).amount;
        break;
    }
  }

  deposit(amount: number): DomainEvent {
    return {
      aggregateId: this.id,
      type: 'AccountDeposited',
      payload: { amount },
      occurredAt: new Date(),
    };
  }

  getBalance() { return this.balance; }
}

// 使用示例
const events = await eventStore.getEvents('acc-123');
const account = new BankAccount('acc-123', events);
const newEvent = account.deposit(100);
await eventStore.append(newEvent);
```

### 事件溯源：快照优化

```typescript
// snapshot.ts — 快照加速状态重建

interface Snapshot<T> {
  aggregateId: string;
  version: number;
  state: T;
}

class SnapshotRepository {
  constructor(private store: EventStore, private snapshotInterval = 100) {}

  async loadAccount(id: string): Promise<BankAccount> {
    // 1. 读取最新快照
    const snapshot = await this.loadLatestSnapshot<BankAccountState>(id);
    const fromVersion = snapshot ? snapshot.version : 0;

    // 2. 读取快照之后的事件
    const events = await this.store.getEventsAfter(id, fromVersion);

    // 3. 从快照重建 + 重放剩余事件
    const account = snapshot
      ? BankAccount.fromSnapshot(snapshot.state)
      : new BankAccount(id);

    for (const e of events) account.apply(e);

    // 4. 若事件数超过阈值，保存新快照
    if (events.length >= this.snapshotInterval) {
      await this.saveSnapshot({
        aggregateId: id,
        version: fromVersion + events.length,
        state: account.toSnapshot(),
      });
    }

    return account;
  }

  private async loadLatestSnapshot<T>(id: string): Promise<Snapshot<T> | null> { /* ... */ return null; }
  private async saveSnapshot<T>(snapshot: Snapshot<T>): Promise<void> { /* ... */ }
}
```

---

## 10. 代码示例：微内核插件加载器

```typescript
// plugin-system.ts
interface Plugin {
  name: string;
  activate(context: PluginContext): void | Promise<void>;
  deactivate?(): void | Promise<void>;
}

class PluginSystem {
  private plugins = new Map<string, Plugin>();
  private context: PluginContext = { registerCommand: () => {} };

  async load(pluginPath: string) {
    const module = await import(pluginPath);
    const plugin: Plugin = module.default ?? module;
    await plugin.activate(this.context);
    this.plugins.set(plugin.name, plugin);
    console.log(`Plugin "${plugin.name}" loaded.`);
  }

  async unload(name: string) {
    const plugin = this.plugins.get(name);
    if (plugin?.deactivate) await plugin.deactivate();
    this.plugins.delete(name);
  }
}

// 示例插件 my-plugin.ts
const myPlugin: Plugin = {
  name: 'LoggerPlugin',
  activate(ctx) {
    ctx.registerCommand('log', (msg: string) => console.log(msg));
  },
};
export default myPlugin;
```

---

## 11. 代码示例：BFF（Backend for Frontend）模式

```typescript
// bff.ts — 为不同前端定制的后端聚合层

class MobileBffController {
  constructor(private api: InternalApiClient) {}

  async getDashboard(userId: string) {
    // 移动端：精简数据，减少传输
    const [profile, notifications] = await Promise.all([
      this.api.getUserProfile(userId),
      this.api.getUnreadNotifications(userId),
    ]);
    return {
      name: profile.name,
      avatar: profile.avatar.small, // 小图
      unreadCount: notifications.length,
    };
  }
}

class DesktopBffController {
  constructor(private api: InternalApiClient) {}

  async getDashboard(userId: string) {
    // 桌面端：完整数据，支持复杂展示
    const [profile, notifications, activities] = await Promise.all([
      this.api.getUserProfile(userId),
      this.api.getAllNotifications(userId),
      this.api.getRecentActivities(userId),
    ]);
    return {
      name: profile.name,
      avatar: profile.avatar.large, // 大图
      notifications,
      activities,
      preferences: profile.preferences,
    };
  }
}
```

---

## 12. 代码示例：洋葱架构（Onion Architecture）

```typescript
// onion.ts — 洋葱架构：领域核心在最内层

// 最内层：领域实体（无依赖）
class OrderEntity {
  constructor(public id: string, public items: OrderItem[]) {}
  calculateTotal(): number {
    return this.items.reduce((sum, item) => sum + item.price * item.qty, 0);
  }
}

// 内层：领域服务（仅依赖实体）
interface OrderRepository {
  save(order: OrderEntity): Promise<void>;
  findById(id: string): Promise<OrderEntity | null>;
}

class OrderDomainService {
  constructor(private repo: OrderRepository) {}
  async createOrder(items: OrderItem[]): Promise<OrderEntity> {
    const order = new OrderEntity(crypto.randomUUID(), items);
    await this.repo.save(order);
    return order;
  }
}

// 外层：应用服务（依赖领域层）
class OrderApplicationService {
  constructor(private domain: OrderDomainService) {}
  async placeOrder(dto: CreateOrderDto): Promise<OrderEntity> {
    const items = dto.items.map(i => new OrderItem(i.productId, i.price, i.qty));
    return this.domain.createOrder(items);
  }
}

// 最外层：基础设施（依赖所有内层）
class PostgresOrderRepository implements OrderRepository {
  async save(order: OrderEntity): Promise<void> { /* SQL */ }
  async findById(id: string): Promise<OrderEntity | null> { /* SQL */ }
}

// 依赖方向：外层 → 内层（通过接口反转依赖）
// PostgresOrderRepository → OrderRepository（接口）→ OrderDomainService → OrderEntity
```

---

## 13. 权威参考

- [Hexagonal Architecture by A. Cockburn](https://alistair.cockburn.us/hexagonal-architecture/) — 原始论文
- [Martin Fowler — CQRS](https://martinfowler.com/bliki/CQRS.html) — 模式详解
- [Microsoft — CQRS Pattern](https://docs.microsoft.com/en-us/azure/architecture/patterns/cqrs) — Azure 架构指南
- [Event Sourcing by Fowler](https://martinfowler.com/eaaDev/EventSourcing.html) — 事件溯源模式
- [Domain-Driven Design Reference](https://domainlanguage.com/ddd/) — Eric Evans 领域驱动设计权威参考
- [Microsoft — Event Sourcing Pattern](https://docs.microsoft.com/en-us/azure/architecture/patterns/event-sourcing) — Azure 事件溯源架构指南
- [Microservices.io — CQRS](https://microservices.io/patterns/data/cqrs.html) — CQRS 数据模式详细说明
- [Refactoring Guru — Design Patterns](https://refactoring.guru/design-patterns) — 软件设计模式权威可视化教程
- [O'Reilly — Software Architecture Patterns](https://www.oreilly.com/library/view/software-architecture-patterns/9781491971437/) — Mark Richards 架构模式经典著作
- [The Twelve-Factor App](https://12factor.net/) — 云原生应用架构方法论
- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html) — 整洁架构
- [Onion Architecture by Jeffrey Palermo](https://jeffreypalermo.com/2008/07/the-onion-architecture-part-1/) — 洋葱架构
- [Saga Pattern by Chris Richardson](https://microservices.io/patterns/data/saga.html) — Saga 分布式事务模式
- [BFF Pattern by SoundCloud](https://www.thoughtworks.com/insights/blog/bff-soundcloud) — BFF 模式起源
- [Martin Fowler — Patterns of Enterprise Application Architecture](https://martinfowler.com/eaaCatalog/) — 企业应用架构模式
- [AWS Well-Architected Framework](https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html) — AWS 架构最佳实践
- [Azure Architecture Center](https://docs.microsoft.com/en-us/azure/architecture/) — Azure 架构中心
- [Google Cloud Architecture Center](https://cloud.google.com/architecture) — GCP 架构中心
- [DDD Community](https://dddcommunity.org/) — 领域驱动设计社区
- [Event Store Documentation](https://developers.eventstore.com/) — 事件存储数据库文档
- [Axon Framework](https://docs.axoniq.io/) — CQRS/ES Java 框架参考实现

## 14. 与相邻模块的关系

- **59-fullstack-patterns**: 全栈应用的具体架构实践
- **53-app-architecture**: 前端应用架构模式
- **68-plugin-system**: 插件系统的实现机制
