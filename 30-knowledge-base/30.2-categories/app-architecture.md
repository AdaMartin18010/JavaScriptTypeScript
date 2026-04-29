# 应用架构模式

> JavaScript/TypeScript 应用的主流架构模式对比与选型指南。

---

## 架构模式深度对比

| 模式 | 核心思想 | 依赖方向 | 测试难度 | 适用场景 |
|------|---------|---------|---------|---------|
| **分层架构 (Layered)** | 水平分层：Presentation → Business → Data | 上层依赖下层 | ⭐ 简单 | 标准 CRUD、MVC/ MVP 后端 |
| **六边形架构 (Hexagonal)** | 领域为核心，端口(Ports)定义契约，适配器(Adapters)隔离技术细节 | 向内指向领域 | ⭐⭐ 中等 | 复杂业务逻辑、长期演进的单体 |
| **整洁架构 (Clean)** | 四层同心圆：Entities → Use Cases → Interface Adapters → Frameworks | 依赖规则指向圆心 | ⭐⭐⭐ 较高 | 企业级应用、需要清晰边界的系统 |
| **洋葱架构 (Onion)** | 与 Clean 类似，显式强调 Application Services 层与 Domain Services 层分离 | 向内指向核心 | ⭐⭐⭐ 较高 | DDD 实践、事件驱动系统 |

### 模式关系

```
Layered          Hexagonal        Clean / Onion
─────────────────────────────────────────────────
Controller       Adapter          Controller / Presenter
  │                  │                    │
Service          Port ────────→   Use Case (Interactor)
  │                  │                    │
Repository       Adapter          Repository / Gateway
  │                  │                    │
DB              Domain Model      Entity / Domain Service
```

---

## Clean Architecture 目录结构示例 (Node.js/TypeScript)

```
src/
├── domain/                    # 最内层：Entities、Value Objects、Domain Events
│   ├── entities/
│   │   └── Order.ts
│   ├── value-objects/
│   │   └── Money.ts
│   └── events/
│       └── OrderPlaced.ts
│
├── application/               # 用例层：编排业务逻辑，无外部依赖
│   ├── ports/
│   │   ├── incoming/          # 驱动端口 (Use Cases)
│   │   │   └── CreateOrder.ts
│   │   └── outgoing/          # 被驱动端口 (Repository Interface)
│   │       └── OrderRepository.ts
│   └── services/
│       └── CreateOrderService.ts
│
├── adapters/                  # 适配器层：将用例与外部技术连接
│   ├── inbound/
│   │   ├── http/
│   │   │   ├── OrderController.ts   # Fastify / Express / Hono
│   │   │   └── routes.ts
│   │   └── cli/
│   │       └── OrderCLI.ts
│   └── outbound/
│       ├── persistence/
│       │   └── PrismaOrderRepository.ts
│       └── messaging/
│           └── KafkaEventPublisher.ts
│
└── config/                    # 框架与配置层：DI 容器、中间件、环境变量
    └── di-container.ts
```

### 核心代码片段

```ts
// src/application/ports/outgoing/OrderRepository.ts
export interface OrderRepository {
  findById(id: string): Promise<Order | null>;
  save(order: Order): Promise<void>;
}

// src/application/services/CreateOrderService.ts
export class CreateOrderService implements CreateOrder {
  constructor(private readonly repo: OrderRepository) {}

  async execute(dto: CreateOrderDTO): Promise<Order> {
    const order = Order.create(dto);
    await this.repo.save(order);
    return order;
  }
}

// src/adapters/outbound/persistence/PrismaOrderRepository.ts
export class PrismaOrderRepository implements OrderRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string) {
    const row = await this.prisma.order.findUnique({ where: { id } });
    return row ? OrderMapper.toDomain(row) : null;
  }

  async save(order: Order) {
    await this.prisma.order.upsert({
      where: { id: order.id },
      create: OrderMapper.toPrisma(order),
      update: OrderMapper.toPrisma(order),
    });
  }
}
```

---

## 2026 趋势

- **Module Federation 2.0**：类型安全、离线容错、DevTools
- **Native Federation**：框架无关的模块联邦标准
- **React Server Components**：服务端组件减少客户端 bundle
- **BFF → Edge-First**：逻辑从独立 BFF 服务迁移至边缘计算层（Vercel Edge / Cloudflare Workers）

---

## 权威链接

- [Robert C. Martin — The Clean Architecture (2012)](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Alistair Cockburn — Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
- [Microsoft — Onion Architecture](https://learn.microsoft.com/en-us/previous-versions/msp-n-p/jj554200(v=pandp.10))
- [DDD Reference by Eric Evans](https://www.domainlanguage.com/ddd/reference/)
- [NestJS — Official Architecture Docs](https://docs.nestjs.com/)

---

*最后更新: 2026-04-29*
