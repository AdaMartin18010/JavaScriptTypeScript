# 微服务完整指南

> JavaScript/TypeScript 微服务架构的设计原则、通信模式与运维实践。

---

## 核心概念

微服务不是"小服务"，而是**围绕业务能力组织的独立部署单元**。

| 特征 | 单体 | 微服务 |
|------|------|--------|
| 代码库 | 单一 | 多个独立 |
| 部署 | 全量 | 独立 |
| 数据库 | 共享 | 每服务独立 |
| 通信 | 内存调用 | 网络调用 |
| 团队结构 | 分层 | 跨功能小队 |

---

## 通信模式

| 模式 | 同步 | 异步 | 适用场景 |
|------|------|------|---------|
| **REST API** | ✅ | ❌ | 简单请求-响应 |
| **gRPC** | ✅ | 双向流 | 内部高性能通信 |
| **GraphQL Federation** | ✅ | ❌ | 统一查询网关 |
| **消息队列** | ❌ | ✅ | 事件驱动，解耦 |
| **Event Sourcing** | ❌ | ✅ | 审计，复杂状态 |
| **Saga 模式** | ❌ | ✅ | 分布式事务 |

---

## 服务间通信深度对比

| 维度 | REST / HTTP | gRPC | GraphQL Federation | Message Queue | Event Bus |
|------|-------------|------|-------------------|---------------|-----------|
| **协议** | HTTP/1.1, HTTP/2 | HTTP/2 + Protobuf | HTTP/2 + JSON | AMQP / MQTT / STOMP | 自定义 (CloudEvents) |
| **序列化** | JSON | Protocol Buffers | JSON | 二进制 / JSON | JSON / Avro |
| **性能** | 中 (文本序列化) | 高 (二进制 + 长连接) | 中 (单次请求聚合) | 高 (异步解耦) | 高 (最终一致性) |
| **类型安全** | OpenAPI / Zod | 原生 `.proto` | Schema 校验 | 弱 | Schema Registry |
| **流支持** | SSE / 长轮询 | 双向流 (Native) | Subscriptions | 拉取 / 推送 | 事件流 |
| **浏览器支持** | ✅ 原生 | ❌ 需 grpc-web | ✅ 原生 | ❌ 需网关 | ❌ 需网关 |
| **调试工具** | curl, Postman | grpcurl, BloomRPC | GraphiQL, Playground | 管理后台 | 事件追踪 |
| **TS 代码生成** | OpenAPI Generator | protoc / ts-proto | Codegen | 手动定义 | Avro / JSON Schema |

---

## 微服务设计模式表

| 模式 | 问题 | 解决方案 | 代表库/工具 |
|------|------|---------|------------|
| **API Gateway** | 客户端直接调用多个服务 | 统一入口，路由/认证/限流 | Kong, Traefik, Express Gateway |
| **Circuit Breaker** | 级联故障 | 故障时快速失败，自动恢复 | opossum, resilience4j (移植) |
| **Bulkhead** | 资源耗尽 | 隔离线程池/连接池 | 手动实现 / Node.js Worker Threads |
| **Retry + Backoff** | 瞬时网络故障 | 指数退避重试 | p-retry, axios-retry |
| **Saga (Orchestration)** | 分布式事务 | 中央协调器管理事务步骤 | Temporal, Camunda |
| **Saga (Choreography)** | 分布式事务 | 服务间通过事件自治协调 | NATS, Kafka + 事件契约 |
| **CQRS** | 读写负载不均 | 读写模型分离 | Prisma (读) + MongoDB (写) |
| **Event Sourcing** | 状态变更追溯 | 存储事件流而非当前状态 | EventStoreDB, Kafka |
| **Strangler Fig** | 单体迁移微服务 | 逐步替换旧功能，代理路由 | Nginx, Traefik |
| **BFF (Backend for Frontend)** | 多客户端需求差异 | 每类客户端独立后端服务 | NestJS, Fastify |

---

## Node.js 微服务栈

| 层级 | 技术选型 |
|------|---------|
| **网关** | Kong, Traefik, Apollo Federation |
| **服务框架** | Fastify, NestJS, Hono |
| **消息队列** | NATS, RabbitMQ, Kafka |
| **数据库** | PostgreSQL, MongoDB, Redis |
| **可观测性** | OpenTelemetry, Jaeger, Grafana |
| **部署** | Docker, Kubernetes, Helm |

---

## 代码示例：NestJS + NATS 微服务

```typescript
// apps/order-service/src/main.ts
import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { OrderModule } from './order.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    OrderModule,
    {
      transport: Transport.NATS,
      options: {
        servers: ['nats://localhost:4222'],
        queue: 'order-service',
      },
    },
  );
  await app.listen();
  console.log('Order service is listening via NATS');
}
bootstrap();

// apps/order-service/src/order.controller.ts
import { Controller } from '@nestjs/common';
import { MessagePattern, EventPattern } from '@nestjs/microservices';
import { OrderService } from './order.service';

@Controller()
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // 同步请求-响应
  @MessagePattern({ cmd: 'create_order' })
  async createOrder(data: { userId: string; items: string[] }) {
    return this.orderService.create(data);
  }

  // 异步事件监听
  @EventPattern('payment_succeeded')
  async handlePaymentSucceeded(data: { orderId: string; amount: number }) {
    await this.orderService.confirmPayment(data.orderId);
  }
}

// apps/api-gateway/src/app.controller.ts
import { Controller, Post, Body, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Controller('orders')
export class AppController {
  constructor(
    @Inject('ORDER_SERVICE') private orderClient: ClientProxy,
  ) {}

  @Post()
  async createOrder(@Body() body: { userId: string; items: string[] }) {
    const response$ = this.orderClient.send({ cmd: 'create_order' }, body);
    return lastValueFrom(response$);
  }
}
```

---

## 最佳实践

1. **数据库 per Service**：禁止直接访问其他服务的数据库
2. **API 版本化**：`/v1/users` → `/v2/users`，支持渐进迁移
3. **熔断与降级**：Circuit Breaker 防止级联故障
4. **分布式追踪**：每个请求携带 Trace ID，贯穿所有服务
5. **契约测试**：消费者驱动契约（Pact）确保 API 兼容性

---

## 权威参考链接

| 资源 | 链接 | 说明 |
|------|------|------|
| NestJS Microservices | https://docs.nestjs.com/microservices/basics | NestJS 官方微服务文档 |
| NATS Documentation | https://docs.nats.io/ | 高性能消息系统文档 |
| OpenTelemetry JS | https://opentelemetry.io/docs/languages/js/ | 分布式追踪 SDK |
| The Twelve-Factor App | https://12factor.net/ | 云原生应用方法论 |
| Microservices.io | https://microservices.io/patterns/index.html | 微服务模式大全 |
| Building Microservices (O'Reilly) | https://samnewman.io/books/building_microservices_2nd_edition/ | 微服务架构权威著作 |
| gRPC Docs | https://grpc.io/docs/languages/node/ | Node.js gRPC 指南 |
| Temporal | https://docs.temporal.io/ | 工作流编排与 Saga 实现 |
| Pact.io | https://pact.io/ | 消费者驱动契约测试 |

---

*最后更新: 2026-04-29*
