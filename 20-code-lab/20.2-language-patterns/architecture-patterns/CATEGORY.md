---
dimension: 综合
sub-dimension: Architecture patterns
created: 2026-04-28
---

# 模块归属声明

本模块归属 **「综合」** 维度，聚焦 Architecture patterns 核心概念与工程实践。

## 包含内容

- 分层架构、MVC/MVVM、CQRS、六边形架构与微服务模式的实现与对比。

## 相关索引

- `30-knowledge-base/30.2-categories/README.md` — 分类总览
- `20-code-lab/` — 代码实验室实践

## 目录内容

- 📄 ARCHITECTURE.md
- 📄 README.md
- 📄 THEORY.md
- 📄 _MIGRATED_FROM.md
- 📁 cqrs
- 📁 hexagonal
- 📁 layered
- 📁 microservices
- 📁 mvc
- 📁 mvvm

## 子模块速查

| 子模块 | 说明 | 入口文件 |
|--------|------|----------|
| cqrs | 命令查询职责分离，读写模型独立演进 | `cqrs/THEORY.md` |
| hexagonal | 端口与适配器架构，解耦业务与外部系统 | `hexagonal/THEORY.md` |
| layered | 经典分层架构（表现/业务/数据层） | `layered/THEORY.md` |
| microservices | 微服务拆分、通信与治理模式 | `microservices/THEORY.md` |
| mvc | 模型-视图-控制器职责分离 | `mvc/THEORY.md` |
| mvvm | 模型-视图-视图模型，数据绑定驱动 | `mvvm/THEORY.md` |

## 架构模式对比

| 模式 | 核心思想 | 耦合方向 | 可测试性 | 扩展性 | 适用规模 |
|------|----------|----------|----------|--------|----------|
| Layered | 水平分层，上层依赖下层 | 单向向下 | 中 | 中 | 中小型单体 |
| MVC | 模型-视图-控制器分离 | 视图依赖模型 | 中 | 中 | 服务端渲染 / 早期 SPA |
| MVP | Presenter 作为视图与模型中介 | 视图与模型隔离 | 高 | 中 | 企业桌面应用 |
| MVVM | 双向数据绑定，VM 解耦视图 | 视图 ↔ VM | 高 | 高 | 现代数据驱动 UI |
| Hexagonal | 端口-适配器，业务核心独立 | 外部依赖内部 | 极高 | 极高 | 复杂业务领域 |
| CQRS | 读写模型分离，独立优化 | 命令/查询分治 | 高 | 极高 | 高并发分布式系统 |
| Microservices | 按业务能力垂直拆分服务 | 服务间 API 契约 | 高 | 极高 | 大型组织、独立团队 |

## 代码示例

以下展示一个极简的分层架构入口，演示如何通过依赖注入组合各层：

```typescript
// index.ts
import { UserController } from './layered/presentation/user-controller';
import { UserService } from './layered/application/user-service';
import { UserRepository } from './layered/infrastructure/user-repository';

// 手动依赖注入组装
const repo = new UserRepository();
const service = new UserService(repo);
const controller = new UserController(service);

// 处理请求
const user = await controller.getUserById('42');
console.log(user);
```

#### 六边形架构端口与适配器示例

```typescript
// hexagonal-ports.ts
interface ForUserRepository {
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<void>;
}

// 驱动适配器（入口）
class UserController {
  constructor(private service: UserService) {}
  async handleGetUser(id: string) {
    return this.service.getUser(id);
  }
}

// 被驱动适配器（出口）
class SqlUserRepository implements ForUserRepository {
  async findById(id: string) { /* ... */ }
  async save(user: User) { /* ... */ }
}
```

#### MVVM 模式实现（Vue 3 Composition API）

```typescript
// mvvm-counter.ts — 视图模型驱动 UI
import { ref, computed } from 'vue';

// Model: 纯数据与业务规则
interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

// ViewModel: 响应式状态与派生逻辑
function useProductViewModel(initial: Product) {
  const product = ref<Product>(initial);
  const quantity = ref(1);

  const totalPrice = computed(() => product.value.price * quantity.value);
  const canPurchase = computed(() => quantity.value <= product.value.stock && quantity.value > 0);
  const discount = computed(() => (quantity.value >= 10 ? 0.9 : 1.0));
  const finalPrice = computed(() => totalPrice.value * discount.value);

  function increaseQty() {
    if (quantity.value < product.value.stock) quantity.value++;
  }

  function decreaseQty() {
    if (quantity.value > 1) quantity.value--;
  }

  return {
    product: readonly(product),
    quantity: readonly(quantity),
    totalPrice,
    canPurchase,
    finalPrice,
    increaseQty,
    decreaseQty,
  };
}

// View 层（Vue 单文件组件）只需绑定 VM 暴露的数据与方法
// <template>
//   <div>{{ product.name }}</div>
//   <button @click="decreaseQty">-</button>
//   <span>{{ quantity }}</span>
//   <button @click="increaseQty">+</button>
//   <div>总价: {{ finalPrice.toFixed(2) }}</div>
//   <button :disabled="!canPurchase">购买</button>
// </template>
```

#### CQRS 命令与查询分离

```typescript
// cqrs-pattern.ts
interface Command<T> {
  type: string;
  payload: T;
}

interface Query<T, R> {
  type: string;
  criteria: T;
}

// 命令处理器（写模型）
class OrderCommandHandler {
  constructor(private eventStore: EventStore) {}

  async handleCreateOrder(cmd: Command<{ customerId: string; items: LineItem[] }>) {
    const order = Order.create(cmd.payload.customerId, cmd.payload.items);
    await this.eventStore.append(order.uncommittedEvents);
    order.markCommitted();
    return order.id;
  }

  async handleCancelOrder(cmd: Command<{ orderId: string; reason: string }>) {
    const order = await this.eventStore.rehydrate(cmd.payload.orderId);
    order.cancel(cmd.payload.reason);
    await this.eventStore.append(order.uncommittedEvents);
  }
}

// 查询处理器（读模型，可直接读物化视图）
class OrderQueryHandler {
  constructor(private readDb: ReadDatabase) {}

  async handleGetOrderSummary(query: Query<string, OrderSummary>) {
    return this.readDb.orderSummaries.findById(query.criteria);
  }

  async handleSearchOrders(query: Query<OrderSearchCriteria, OrderSummary[]>) {
    return this.readDb.orderSummaries.search(query.criteria);
  }
}

// 读模型与写模型可独立优化、独立扩展
```

#### 微服务拆分模式：按业务能力边界

```typescript
// microservices-boundary.ts
// 订单服务（独立部署、独立数据库）
interface OrderService {
  createOrder(req: CreateOrderRequest): Promise<Order>;
  getOrder(id: string): Promise<Order>;
  cancelOrder(id: string): Promise<void>;
}

// 库存服务（独立部署、独立数据库）
interface InventoryService {
  reserveStock(productId: string, qty: number): Promise<Reservation>;
  releaseStock(reservationId: string): Promise<void>;
}

// 支付服务（独立部署、独立数据库）
interface PaymentService {
  charge(request: ChargeRequest): Promise<PaymentResult>;
  refund(paymentId: string): Promise<void>;
}

// Saga 编排器：跨服务事务协调
class OrderSagaOrchestrator {
  constructor(
    private orderService: OrderService,
    private inventoryService: InventoryService,
    private paymentService: PaymentService,
  ) {}

  async executeOrderFlow(request: CreateOrderRequest) {
    const order = await this.orderService.createOrder(request);
    try {
      const reservation = await this.inventoryService.reserveStock(
        request.productId, request.qty
      );
      try {
        await this.paymentService.charge({ orderId: order.id, amount: order.total });
      } catch (err) {
        await this.inventoryService.releaseStock(reservation.id);
        await this.orderService.cancelOrder(order.id);
        throw new OrderFailedError('Payment failed', err);
      }
    } catch (err) {
      await this.orderService.cancelOrder(order.id);
      throw new OrderFailedError('Inventory reservation failed', err);
    }
    return order;
  }
}
```

#### 事件驱动架构：发布-订阅模式

```typescript
// event-driven.ts — 领域事件与事件总线
interface DomainEvent {
  readonly id: string;
  readonly type: string;
  readonly payload: unknown;
  readonly occurredOn: Date;
}

interface EventHandler<T extends DomainEvent> {
  handle(event: T): Promise<void>;
}

class EventBus {
  private handlers = new Map<string, Array<EventHandler<any>>>();

  subscribe<T extends DomainEvent>(
    eventType: string,
    handler: EventHandler<T>
  ): () => void {
    const list = this.handlers.get(eventType) || [];
    list.push(handler);
    this.handlers.set(eventType, list);
    return () => {
      const idx = list.indexOf(handler);
      if (idx >= 0) list.splice(idx, 1);
    };
  }

  async publish(event: DomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.type) || [];
    await Promise.all(handlers.map(h => h.handle(event).catch(console.error)));
  }
}

// 使用示例
class OrderCreatedEvent implements DomainEvent {
  readonly id = crypto.randomUUID();
  readonly type = 'OrderCreated';
  readonly occurredOn = new Date();
  constructor(readonly payload: { orderId: string; amount: number }) {}
}

class SendEmailHandler implements EventHandler<OrderCreatedEvent> {
  async handle(event: OrderCreatedEvent) {
    console.log(`Sending confirmation email for order ${event.payload.orderId}`);
  }
}

const bus = new EventBus();
bus.subscribe('OrderCreated', new SendEmailHandler());
await bus.publish(new OrderCreatedEvent({ orderId: '123', amount: 99.99 }));
```

---

> 此分类文档由批量生成脚本自动创建，请根据实际模块内容补充和调整。

## 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| Martin Fowler — Patterns of Enterprise Application Architecture | 书籍 | [martinfowler.com/eaaCatalog](https://martinfowler.com/eaaCatalog/) |
| Microsoft — Cloud Design Patterns | 文档 | [learn.microsoft.com/azure/architecture/patterns](https://learn.microsoft.com/en-us/azure/architecture/patterns/) |
| Refactoring Guru — Design Patterns | 参考 | [refactoring.guru/design-patterns](https://refactoring.guru/design-patterns) |
| AWS Prescriptive Guidance | 指南 | [aws.amazon.com/prescriptive-guidance](https://aws.amazon.com/prescriptive-guidance/) |
| DDD Reference by Eric Evans | 参考 | [domainlanguage.com/ddd/reference](https://www.domainlanguage.com/ddd/reference/) |
| Hexagonal Architecture — Alistair Cockburn | 文章 | [alistair.cockburn.us/hexagonal-architecture/](https://alistair.cockburn.us/hexagonal-architecture/) |
| The Clean Architecture — Robert C. Martin | 文章 | [blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html) |
| Microsoft — Microservices Architecture | 文档 | [learn.microsoft.com/azure/architecture/microservices](https://learn.microsoft.com/en-us/azure/architecture/microservices/) |
| Chris Richardson — Microservices Patterns | 书籍 | [microservices.io/patterns](https://microservices.io/patterns/) |
| Vue.js — Composition API Guide | 文档 | [vuejs.org/guide/extras/composition-api-faq](https://vuejs.org/guide/extras/composition-api-faq.html) |
| NestJS Architecture | 文档 | [docs.nestjs.com](https://docs.nestjs.com/) |
| Domain-Driven Design Reference | 参考 | [domainlanguage.com/ddd/reference](https://www.domainlanguage.com/ddd/reference/) |
| Event-Driven Architecture (AWS) | 文档 | [aws.amazon.com/event-driven-architecture](https://aws.amazon.com/what-is/event-driven-architecture/) |
| Software Architecture Patterns (O'Reilly) | 书籍 | [www.oreilly.com/library/view/software-architecture-patterns](https://www.oreilly.com/library/view/software-architecture-patterns/9781491971437/) |

---

*最后更新: 2026-04-30*
