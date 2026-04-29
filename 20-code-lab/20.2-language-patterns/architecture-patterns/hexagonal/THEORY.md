# 六边形架构（Ports & Adapters）

> **定位**：`20-code-lab/20.2-language-patterns/architecture-patterns/hexagonal`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块解决**业务逻辑与外部依赖耦合**的问题。通过**端口（Ports）**与**适配器（Adapters）**模式实现可测试、可替换的整洁架构。核心规则：应用内部不依赖任何外部框架、数据库或 UI 技术，所有交互通过抽象端口完成。

### 1.2 形式化基础

- **端口**：应用核心定义的驱动（Driving）端口与 driven（Driven）端口，描述"需要什么能力"而非"如何提供"。
- **适配器**：外部技术的具体实现，将 HTTP、SQL、CLI、消息队列等转换为端口契约。
- **依赖方向**：适配器 → 端口 ← 领域核心（箭头方向即依赖方向）。

### 1.3 端口 vs 适配器对比

| 维度 | 端口（Port） | 适配器（Adapter） |
|------|-------------|------------------|
| **本质** | 抽象接口/契约 | 具体技术实现 |
| **位置** | 领域层内部 | 领域层外部 |
| **数量** | 少量、稳定 | 可替换、可扩展 |
| **示例** | `UserRepository`、`EmailService` | `PrismaUserRepository`、`SendGridAdapter` |
| **变更频率** | 低（随业务变） | 高（随技术栈变） |

---

## 二、设计原理

### 2.1 为什么存在

业务逻辑不应依赖具体技术实现。六边形架构通过端口和适配器将核心业务与框架、数据库和 UI 解耦，提升可测试性和技术迁移能力。

### 2.2 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 严格六边形 | 完全解耦、可测试 | 抽象开销 | 长生命周期系统 |
| 宽松分层 | 开发效率高 | 边界易模糊 | 快速迭代项目 |

### 2.3 与相关技术的对比

与洋葱架构对比：六边形更强调外部适配器，洋葱更强调依赖方向。二者核心思想一致，可以看作同一思想的两种表达。

---

## 三、实践映射

### 3.1 从理论到代码

**TypeScript 端口接口与适配器实现**

```typescript
// ========== 领域层：端口定义（零外部依赖） ==========
interface UserRepository {
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<void>;
}

interface EmailNotifier {
  send(to: string, subject: string, body: string): Promise<void>;
}

// ========== 领域层：业务用例 ==========
class RegisterUserUseCase {
  constructor(
    private users: UserRepository,
    private notifier: EmailNotifier
  ) {}

  async execute(email: string, password: string): Promise<void> {
    const user = new User(email, password);
    await this.users.save(user);
    await this.notifier.send(email, 'Welcome!', 'Thanks for signing up.');
  }
}

// ========== 适配器层：Prisma 实现 ==========
class PrismaUserRepository implements UserRepository {
  constructor(private prisma: PrismaClient) {}
  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }
  async save(user: User) {
    await this.prisma.user.create({ data: user });
  }
}

// ========== 适配器层：SendGrid 实现 ==========
class SendGridEmailNotifier implements EmailNotifier {
  async send(to: string, subject: string, body: string) {
    await sendgrid.send({ to, subject, text: body });
  }
}

// ========== 组合根（Composition Root） ==========
const useCase = new RegisterUserUseCase(
  new PrismaUserRepository(prisma),
  new SendGridEmailNotifier()
);
```

**可运行测试（内存适配器）**

```typescript
// 测试无需真实数据库或邮件服务
class InMemoryUserRepository implements UserRepository {
  private store = new Map<string, User>();
  async findById(id: string) { return this.store.get(id) ?? null; }
  async save(user: User) { this.store.set(user.id, user); }
}

class SpyEmailNotifier implements EmailNotifier {
  sent: { to: string; subject: string }[] = [];
  async send(to: string, subject: string) { this.sent.push({ to, subject }); }
}

// 纯内存测试，毫秒级执行
const users = new InMemoryUserRepository();
const notifier = new SpyEmailNotifier();
const uc = new RegisterUserUseCase(users, notifier);
await uc.execute('alice@example.com', 'secret');
assert(notifier.sent.length === 1);
```

### 3.2 进阶：完整六边形订单系统（含错误处理与事件）

```typescript
// ===== 领域层：实体与值对象 =====
class Order {
  constructor(
    public readonly id: string,
    public readonly customerId: string,
    public readonly items: OrderItem[],
    public status: OrderStatus = 'pending'
  ) {}

  total(): Money {
    return this.items.reduce((sum, item) => sum.add(item.price.multiply(item.quantity)), Money.zero());
  }

  confirm(): void {
    if (this.status !== 'pending') throw new DomainError('Only pending orders can be confirmed');
    this.status = 'confirmed';
  }
}

// ===== 端口定义 =====
interface OrderRepository {
  findById(id: string): Promise<Order | null>;
  save(order: Order): Promise<void>;
}

interface PaymentGateway {
  charge(amount: Money, cardToken: string): Promise<PaymentResult>;
}

interface EventPublisher {
  publish(event: DomainEvent): Promise<void>;
}

// ===== 领域事件 =====
interface DomainEvent {
  readonly occurredOn: Date;
  readonly type: string;
}

class OrderConfirmedEvent implements DomainEvent {
  readonly occurredOn = new Date();
  readonly type = 'OrderConfirmed';
  constructor(public readonly orderId: string, public readonly total: Money) {}
}

// ===== 用例：确认订单并支付 =====
class ConfirmOrderUseCase {
  constructor(
    private orders: OrderRepository,
    private payments: PaymentGateway,
    private events: EventPublisher
  ) {}

  async execute(orderId: string, cardToken: string): Promise<void> {
    const order = await this.orders.findById(orderId);
    if (!order) throw new NotFoundError(`Order ${orderId} not found`);

    const total = order.total();
    const payment = await this.payments.charge(total, cardToken);
    if (!payment.success) throw new PaymentError(payment.reason);

    order.confirm();
    await this.orders.save(order);
    await this.events.publish(new OrderConfirmedEvent(order.id, total));
  }
}

// ===== 适配器：内存测试替身 =====
class InMemoryOrderRepository implements OrderRepository {
  private store = new Map<string, Order>();
  async findById(id: string) { return this.store.get(id) ?? null; }
  async save(order: Order) { this.store.set(order.id, order); }
}

class FakePaymentGateway implements PaymentGateway {
  shouldFail = false;
  async charge(amount: Money, _token: string): Promise<PaymentResult> {
    return this.shouldFail
      ? { success: false, reason: 'insufficient_funds' }
      : { success: true, transactionId: 'tx-' + Math.random().toString(36).slice(2) };
  }
}

class InMemoryEventPublisher implements EventPublisher {
  events: DomainEvent[] = [];
  async publish(event: DomainEvent) { this.events.push(event); }
}

// ===== 集成测试（无需真实 DB / 支付网关） =====
async function testConfirmOrder() {
  const orders = new InMemoryOrderRepository();
  const payments = new FakePaymentGateway();
  const events = new InMemoryEventPublisher();
  const uc = new ConfirmOrderUseCase(orders, payments, events);

  // Arrange
  const order = new Order('o1', 'c1', [new OrderItem('p1', Money.of(100), 2)]);
  await orders.save(order);

  // Act
  await uc.execute('o1', 'tok_visa');

  // Assert
  const saved = await orders.findById('o1');
  console.assert(saved?.status === 'confirmed');
  console.assert(events.events.some(e => e.type === 'OrderConfirmed'));
  console.log('✅ ConfirmOrderUseCase test passed');
}

testConfirmOrder();
```

### 3.3 常见误区

| 误区 | 正确理解 |
|------|---------|
| 六边形架构需要六层 | 六边形是隐喻，核心是端口与适配器 |
| 适配器只是接口包装 | 适配器包含技术细节和错误转换 |
| 端口必须对应外部系统 | 端口也可以用于模块间通信 |

### 3.4 扩展阅读

- [Hexagonal Architecture — Alistair Cockburn](https://alistair.cockburn.us/hexagonal-architecture/)
- [Hexagonal Architecture Explained — AWS](https://aws.amazon.com/blogs/compute/developing-evolutionary-software-with-hexagonal-architecture/)
- [Applying Hexagonal Architecture to a Symfony Project — Matthieu Napoli](https://matthiasnoback.nl/2017/08/docker-and-hexagonal-architecture/)
- `20.2-language-patterns/architecture-patterns/`

## 四、权威外部资源

| 资源 | 链接 | 说明 |
|------|------|------|
| Alistair Cockburn — Hexagonal Architecture 原文 | [alistair.cockburn.us/hexagonal-architecture](https://alistair.cockburn.us/hexagonal-architecture/) | 六边形架构首创者原文 |
| AWS — Hexagonal Architecture on Lambda | [aws.amazon.com/blogs/compute/developing-evolutionary-software-with-hexagonal-architecture](https://aws.amazon.com/blogs/compute/developing-evolutionary-software-with-hexagonal-architecture/) | 云原生场景下的六边形实践 |
| Clean Architecture (Robert C. Martin) | [blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html) | 与六边形同源的整洁架构 |
| Implementing DDD (Vaughn Vernon) | [dddcommunity.org/book/evans_2003](https://dddcommunity.org/book/evans_2003/) | 领域驱动设计与架构模式 |
| Ports and Adapters Pattern (Microsoft) | [docs.microsoft.com/en-us/archive/msdn-magazine/2013/february/patterns-the-presentation-patterns](https://docs.microsoft.com/en-us/archive/msdn-magazine/2013/february/patterns-the-presentation-patterns) | 微软架构杂志深度解析 |
| Test-Driven Development with Ports and Adapters | [matthiasnoback.nl/books](https://matthiasnoback.nl/books/) | Matthias Noback 架构系列著作 |
| NestJS — Dependency Injection | [docs.nestjs.com/fundamentals/custom-providers](https://docs.nestjs.com/fundamentals/custom-providers) | TS 生态中最接近六边形的框架实践 |
| tsyringe (Microsoft) | [github.com/microsoft/tsyringe](https://github.com/microsoft/tsyringe) | TypeScript 依赖注入容器 |
| inversifyjs | [inversify.io](https://inversify.io/) | IoC 容器，支持六边形组合根 |
| ArchUnit (TS 移植) | [github.com/TNG/ArchUnitNET](https://github.com/TNG/ArchUnitNET) | 架构规则自动化测试工具 |

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
