# 微服务架构（Microservices Architecture）

> **定位**：`20-code-lab/20.2-language-patterns/architecture-patterns/microservices`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块解决**单体应用扩展性受限**的问题。通过服务拆分、独立部署和分布式通信实现水平扩展。核心原则：**围绕业务能力组织服务、独立部署、去中心化数据管理**。

### 1.2 形式化基础

- **服务边界（Bounded Context）**：以领域驱动设计中的限界上下文划分服务，而非技术层。
- **独立部署**：每个服务拥有独立的 CI/CD 流水线，变更无需全量部署。
- **去中心化数据**：每个服务管理自己的数据存储，通过 API 或事件暴露数据，禁止直接访问其他服务数据库。

### 1.3 服务协作模式对比

| 维度 | 编排（Orchestration） | 协作（Choreography） |
|------|----------------------|---------------------|
| **中心控制** | 有（中央编排器） | 无（事件总线驱动） |
| **耦合度** | 业务逻辑与编排器耦合 | 服务间通过事件松耦合 |
| **可观测性** | 流程集中可见 | 需分布式追踪 |
| **复杂度** | 简单流程易管理 | 复杂流程难追踪 |
| **适用场景** | 订单处理、审批流 | 库存扣减、通知广播 |
| **代表技术** | Temporal, Camunda | Kafka, NATS, EventBridge |

---

## 二、设计原理

### 2.1 为什么存在

单体应用在团队规模扩大时遇到部署和扩展瓶颈。微服务通过垂直拆分业务边界，实现独立部署、技术异构和弹性伸缩。

### 2.2 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 微服务 | 独立扩展、技术异构 | 分布式复杂度 | 大型团队 |
| 单体 | 简单一致 | 扩展受限 | 小型团队 |

### 2.3 与相关技术的对比

与模块化单体对比：微服务部署独立但分布式复杂度高。康威定律指出：系统设计倾向于组织沟通结构的复制。

---

## 三、实践映射

### 3.1 从理论到代码

**事件驱动的微服务通信（TypeScript + NATS）**

```typescript
// ========== 共享契约：领域事件 ==========
interface OrderCreatedEvent {
  type: 'OrderCreated';
  payload: { orderId: string; userId: string; amount: number };
}

interface InventoryReservedEvent {
  type: 'InventoryReserved';
  payload: { orderId: string; sku: string; qty: number };
}

// ========== 订单服务：发布事件 ==========
class OrderService {
  constructor(private eventBus: EventBus, private repo: OrderRepository) {}

  async createOrder(userId: string, items: CartItem[]) {
    const order = await this.repo.save({ userId, items, status: 'PENDING' });
    await this.eventBus.publish<OrderCreatedEvent>('OrderCreated', {
      orderId: order.id,
      userId,
      amount: items.reduce((s, i) => s + i.price * i.qty, 0),
    });
    return order;
  }
}

// ========== 库存服务：订阅事件 ==========
class InventoryService {
  constructor(private eventBus: EventBus, private inventory: InventoryRepo) {}

  async start() {
    await this.eventBus.subscribe('OrderCreated', async (event: OrderCreatedEvent) => {
      const { orderId } = event.payload;
      // 扣减库存逻辑...
      await this.inventory.reserve(orderId, event.payload);
      await this.eventBus.publish<InventoryReservedEvent>('InventoryReserved', {
        orderId,
        sku: 'SKU-001',
        qty: 1,
      });
    });
  }
}

// ========== 抽象事件总线（可替换为 Kafka/SNS/NATS） ==========
interface EventBus {
  publish<T extends { type: string }>(topic: string, event: T): Promise<void>;
  subscribe<T>(topic: string, handler: (event: T) => Promise<void>): Promise<void>;
}

// NATS 实现
class NatsEventBus implements EventBus {
  constructor(private nc: NatsConnection) {}
  async publish<T>(topic: string, event: T) {
    this.nc.publish(topic, JSON.stringify(event));
  }
  async subscribe<T>(topic: string, handler: (event: T) => Promise<void>) {
    const sub = this.nc.subscribe(topic);
    for await (const msg of sub) {
      await handler(JSON.parse(msg.data as string));
    }
  }
}
```

**熔断器模式（防止级联故障）**

```typescript
type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private failures = 0;
  private readonly threshold = 5;
  private readonly timeout = 30000;

  async call<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') throw new Error('Circuit is OPEN');
    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (err) {
      this.onFailure();
      throw err;
    }
  }

  private onSuccess() { this.failures = 0; this.state = 'CLOSED'; }
  private onFailure() {
    this.failures++;
    if (this.failures >= this.threshold) {
      this.state = 'OPEN';
      setTimeout(() => this.state = 'HALF_OPEN', this.timeout);
    }
  }
}

// 用法
const cb = new CircuitBreaker();
const user = await cb.call(() => userService.fetchUser(id));
```

### 3.2 常见误区

| 误区 | 正确理解 |
|------|---------|
| 微服务解决所有扩展问题 | 引入分布式复杂度，需要配套基础设施 |
| 服务越小越好 | 过细的服务导致通信开销和事务困难 |
| 先拆微服务再迭代 | 应从模块化单体开始，在痛点出现时拆分 |

### 3.3 扩展阅读

- [Building Microservices — Sam Newman](https://samnewman.io/books/building_microservices/)
- [The Twelve-Factor App](https://12factor.net/)
- [NATS Documentation](https://docs.nats.io/)
- [Temporal: Durable Execution](https://temporal.io/)
- `20.2-language-patterns/architecture-patterns/`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
