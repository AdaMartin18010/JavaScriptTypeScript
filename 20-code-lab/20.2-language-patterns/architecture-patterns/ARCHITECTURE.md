# 架构模式 — 架构设计

## 1. 架构概述

本模块实现企业级应用的核心架构模式，涵盖从单体到分布式、从同步到异步的多种架构风格。每种模式都配有可运行的 TypeScript 示例，展示其实现方式与适用场景。架构采用"模式目录 + 可运行骨架"的元结构，每个模式实例都是一个最小可运行的垂直切片（Vertical Slice），包含完整的请求-响应生命周期。

## 2. 架构图

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         模式目录 (Pattern Catalog)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │   Layered    │  │   Hexagonal  │  │    CQRS +    │  │   Event     │ │
│  │ Architecture │  │ (Ports &     │  │   Event      │  │   Driven    │ │
│  │              │  │  Adapters)   │  │  Sourcing    │  │ Architecture│ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬──────┘ │
└─────────┼─────────────────┼─────────────────┼─────────────────┼────────┘
          │                 │                 │                 │
          ▼                 ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      共享基础设施层 (Shared Infrastructure)               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │  DI Container│  │   Event Bus  │  │   Result<T>  │  │   Logger    │ │
│  │  (Factory)   │  │  (In-Mem)    │  │    Type      │  │   /Tracer   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

## 3. 核心组件

### 3.1 分层架构实现

| 层级 | 职责 | 依赖方向 | 测试策略 |
|------|------|----------|----------|
| Presentation Layer | HTTP 路由、请求/响应转换 | → Business Layer | E2E / 集成测试 |
| Business Layer | 领域服务、用例编排、业务规则验证 | → Data Layer | 单元测试 |
| Data Layer | 仓储接口、数据库访问抽象 | → 外部 DB | 集成测试 |

### 3.2 六边形架构（Ports & Adapters）

| 组件 | 职责 | 端口/适配器类型 | 可替换性 |
|------|------|-----------------|----------|
| Domain Core | 纯业务逻辑，零外部依赖 | — | 不可替换（核心）|
| Inbound Adapters | HTTP 控制器、CLI 命令、消息消费者 | 驱动端口 | 高 |
| Outbound Adapters | 数据库仓储、外部 API 客户端、消息生产者 | 被驱动端口 | 高 |

### 3.3 CQRS + Event Sourcing

| 组件 | 职责 | 数据方向 | 一致性 |
|------|------|----------|--------|
| Command Handler | 接收命令，验证业务规则，生成事件 | 写入事件存储 | 强一致性（单聚合）|
| Event Store | 只追加的不可变事件日志 | 顺序写入 | 顺序一致性 |
| Projection Worker | 异步构建查询视图 | 读取物化视图 | 最终一致性 |

## 4. 数据流

```
HTTP Request → Router → Controller → Use Case → Domain Service → Repository → Database
                                    ↓
                              Domain Event → Event Bus → Projection Handler → Read Model
```

## 5. 架构模式对比

| 维度 | 分层架构 | 六边形架构 | CQRS+ES | 微服务 | 整洁架构 |
|------|----------|------------|---------|--------|----------|
| 复杂度 | 低 | 中 | 高 | 很高 | 中 |
| 可测试性 | ★★★ | ★★★★★ | ★★★★ | ★★★ | ★★★★★ |
| 技术灵活性 | 低 | 高 | 高 | 很高 | 高 |
| 团队协作 | 按层分工 | 按特性分工 | 按读写分工 | 按服务分工 | 按层分工 |
| 数据一致性 | 简单 | 简单 | 最终一致 | 分布式事务 | 简单 |
| 适合规模 | 中小 | 中大 | 大 | 超大 | 中大 |
| 学习曲线 | 平缓 | 中等 | 陡峭 | 陡峭 | 中等 |
| 代表作 | MVC, N-tier | Alistair Cockburn | Greg Young | Netflix | Robert C. Martin |

## 6. 代码示例

### 6.1 六边形架构核心接口

```typescript
// architecture-patterns/src/hexagonal/ports.ts

// ========== 驱动端口 (Inbound / Primary Ports) ==========
interface CreateOrderUseCase {
  execute(command: CreateOrderCommand): Promise<Result<OrderId>>;
}

interface GetOrderQuery {
  execute(query: GetOrderQueryInput): Promise<Result<OrderDto>>;
}

// ========== 被驱动端口 (Outbound / Secondary Ports) ==========
interface OrderRepository {
  save(order: Order): Promise<void>;
  findById(id: OrderId): Promise<Order | null>;
}

interface EventPublisher {
  publish(events: DomainEvent[]): Promise<void>;
}

interface PaymentGateway {
  charge(amount: Money, token: PaymentToken): Promise<PaymentResult>;
}

// ========== 领域核心 (零外部依赖) ==========
class Order {
  private constructor(
    private readonly id: OrderId,
    private items: OrderItem[],
    private status: OrderStatus,
    private readonly events: DomainEvent[] = []
  ) {}

  static create(id: OrderId, items: OrderItem[]): Result<Order> {
    if (items.length === 0) {
      return Result.fail('Order must contain at least one item');
    }
    const order = new Order(id, items, OrderStatus.PENDING);
    order.events.push(new OrderCreatedEvent(id, items));
    return Result.ok(order);
  }

  pay(paymentResult: PaymentResult): Result<void> {
    if (this.status !== OrderStatus.PENDING) {
      return Result.fail('Only pending orders can be paid');
    }
    if (!paymentResult.success) {
      return Result.fail('Payment failed');
    }
    this.status = OrderStatus.PAID;
    this.events.push(new OrderPaidEvent(this.id));
    return Result.ok();
  }

  getUncommittedEvents(): DomainEvent[] {
    return [...this.events];
  }
}

// ========== 入站适配器 (HTTP) ==========
class OrderController {
  constructor(private readonly createOrder: CreateOrderUseCase) {}

  async handleCreate(req: HttpRequest): Promise<HttpResponse> {
    const command = CreateOrderCommand.fromBody(req.body);
    const result = await this.createOrder.execute(command);
    return result.isSuccess
      ? HttpResponse.created(result.value)
      : HttpResponse.badRequest(result.error);
  }
}

// ========== 出站适配器 (In-Mem Repository) ==========
class InMemoryOrderRepository implements OrderRepository {
  private orders = new Map<string, Order>();

  async save(order: Order): Promise<void> {
    this.orders.set(order.id.toString(), order);
  }

  async findById(id: OrderId): Promise<Order | null> {
    return this.orders.get(id.toString()) ?? null;
  }
}
```

### 6.2 Result 类型实现

```typescript
// architecture-patterns/src/shared/Result.ts
class Result<T> {
  private constructor(
    private readonly _isSuccess: boolean,
    private readonly _value?: T,
    private readonly _error?: string
  ) {}

  static ok<U>(value?: U): Result<U> {
    return new Result<U>(true, value);
  }

  static fail<U>(error: string): Result<U> {
    return new Result<U>(false, undefined, error);
  }

  get isSuccess(): boolean { return this._isSuccess; }
  get isFailure(): boolean { return !this._isSuccess; }
  get value(): T { if (!this._isSuccess) throw new Error(); return this._value!; }
  get error(): string { if (this._isSuccess) throw new Error(); return this._error!; }

  map<U>(fn: (v: T) => U): Result<U> {
    return this._isSuccess ? Result.ok(fn(this._value!)) : Result.fail(this._error!);
  }

  flatMap<U>(fn: (v: T) => Result<U>): Result<U> {
    return this._isSuccess ? fn(this._value!) : Result.fail(this._error!);
  }
}
```

## 7. 技术决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 依赖注入 | 手动注入 + 工厂模式 | 减少框架依赖，保持领域纯净 |
| 事件存储 | 内存实现 + 接口抽象 | 便于测试和替换为真实数据库 |
| 错误处理 | Result 类型替代异常 | 强制调用方处理错误路径 |

## 8. 质量属性

- **可测试性**: 领域层无框架依赖，可 100% 单元测试
- **可扩展性**: 新增适配器不影响核心领域
- **可维护性**: 清晰的分层使变更影响范围可控

## 9. 参考链接

- [Hexagonal Architecture - Alistair Cockburn](https://alistair.cockburn.us/hexagonal-architecture/) — 六边形架构原始论文
- [CQRS, Task Based UIs, Event Sourcing agh! - Greg Young](https://codebetter.com/gregyoung/2010/02/16/cqrs-task-based-uis-event-sourcing-agh/) — CQRS+ES 开创性文章
- [The Clean Architecture - Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html) — 整洁架构经典论述
- [Microsoft .NET Architecture Guides](https://learn.microsoft.com/en-us/dotnet/architecture/) — 微软官方架构指南
- [Domain-Driven Design Reference - Eric Evans](https://www.domainlanguage.com/wp-content/uploads/2016/05/DDD_Reference_2015-03.pdf) — DDD 参考卡片
- [AWS Well-Architected Framework](https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html) — AWS 架构最佳实践
