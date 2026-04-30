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

## gRPC 通信实战

gRPC 是 Node.js 微服务内部通信的高性能选择。以下包含 `.proto` 定义、服务端与客户端完整代码：

```protobuf
// protobuf/orders.proto
syntax = "proto3";

service OrderService {
  rpc CreateOrder (CreateOrderRequest) returns (Order);
  rpc StreamOrderEvents (OrderEventRequest) returns (stream OrderEvent);
}

message CreateOrderRequest {
  string user_id = 1;
  repeated string items = 2;
}

message Order {
  string order_id = 1;
  string status = 2;
}

message OrderEventRequest {
  string order_id = 1;
}

message OrderEvent {
  string type = 1;
  string payload = 2;
}
```

```typescript
// grpc-server.ts
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';

const packageDef = protoLoader.loadSync('./protobuf/orders.proto', {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const proto = grpc.loadPackageDefinition(packageDef) as any;

const server = new grpc.Server();
server.addService(proto.OrderService.service, {
  createOrder: (call: any, callback: any) => {
    const { user_id, items } = call.request;
    callback(null, { order_id: `ord-${Date.now()}`, status: 'CREATED' });
  },
  streamOrderEvents: (call: any) => {
    const events = [{ type: 'PAID' }, { type: 'SHIPPED' }];
    for (const ev of events) call.write(ev);
    call.end();
  },
});
server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
  server.start();
  console.log('gRPC server listening on :50051');
});

// grpc-client.ts
const client = new proto.OrderService('order-service:50051', grpc.credentials.createInsecure());
client.createOrder({ user_id: 'u1', items: ['sku-1'] }, (err: any, response: any) => {
  console.log('Created:', response);
});
```

---

## 可观测性集成：OpenTelemetry + NestJS

在 NestJS 中接入 OpenTelemetry，实现分布式追踪与指标上报：

```typescript
// tracing.ts
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

export function initTracing(serviceName: string) {
  const sdk = new NodeSDK({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
    }),
    traceExporter: new OTLPTraceExporter({ url: 'http://otel-collector:4317' }),
    instrumentations: [getNodeAutoInstrumentations()],
  });
  sdk.start();
  process.on('SIGTERM', () => sdk.shutdown());
}

// main.ts
import { initTracing } from './tracing';
initTracing('order-service');
```

---

## Kubernetes 部署示例

以下是一个适用于 Node.js 微服务的标准 Deployment 与 Service 配置：

```yaml
# k8s/order-service.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: order-service
  labels:
    app: order-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: order-service
  template:
    metadata:
      labels:
        app: order-service
    spec:
      containers:
        - name: app
          image: registry/order-service:v1.2.0
          ports:
            - containerPort: 3000
          env:
            - name: NATS_URL
              value: "nats://nats:4222"
          resources:
            requests:
              memory: "256Mi"
              cpu: "250m"
            limits:
              memory: "512Mi"
              cpu: "500m"
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 10
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /ready
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: order-service
spec:
  selector:
    app: order-service
  ports:
    - port: 80
      targetPort: 3000
  type: ClusterIP
```

---

## 代码示例：Fastify 微服务 + pino 结构化日志

```typescript
// fastify-microservice.ts — 轻量级高性能微服务骨架

import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';

const app = Fastify({
  logger: {
    level: 'info',
    transport: process.env.NODE_ENV === 'development'
      ? { target: 'pino-pretty', options: { colorize: true } }
      : undefined,
  },
});

// 插件注册
await app.register(cors);
await app.register(helmet);

// 健康检查
app.get('/health', async () => ({ status: 'ok', uptime: process.uptime() }));

//  readiness 检查（含依赖验证）
app.get('/ready', async () => {
  // 检查数据库、消息队列连接状态
  const dbHealthy = await checkDatabaseConnection();
  const mqHealthy = await checkMessageQueueConnection();
  if (!dbHealthy || !mqHealthy) {
    return app.httpErrors.serviceUnavailable('Dependencies not ready');
  }
  return { status: 'ready' };
});

// 业务路由
app.post<{ Body: { userId: string; items: string[] } }>(
  '/orders',
  {
    schema: {
      body: {
        type: 'object',
        required: ['userId', 'items'],
        properties: {
          userId: { type: 'string', format: 'uuid' },
          items: { type: 'array', items: { type: 'string' } },
        },
      },
    },
  },
  async (request, reply) => {
    const { userId, items } = request.body;
    const order = await orderService.create({ userId, items });
    reply.status(201).send(order);
  }
);

// 优雅关闭
app.addHook('onClose', async () => {
  await db.disconnect();
  await mq.disconnect();
});

await app.listen({ port: 3000, host: '0.0.0.0' });
```

## 代码示例：Circuit Breaker 熔断器实现

```typescript
// circuit-breaker.ts — 基于 opossum 的熔断模式

import CircuitBreaker from 'opossum';

async function fetchInventory(productId: string) {
  const response = await fetch(`http://inventory-service/products/${productId}`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

const breaker = new CircuitBreaker(fetchInventory, {
  timeout: 3000,        // 3 秒超时
  errorThresholdPercentage: 50, // 50% 错误率触发熔断
  resetTimeout: 10000,  // 10 秒后尝试半开恢复
});

// 熔断状态监听
breaker.on('open', () => console.warn('Circuit breaker OPENED'));
breaker.on('halfOpen', () => console.info('Circuit breaker HALF-OPEN'));
breaker.on('close', () => console.info('Circuit breaker CLOSED'));

// 服务中使用，自动降级
app.get('/products/:id/inventory', async (req, reply) => {
  try {
    const inventory = await breaker.fire(req.params.id);
    reply.send(inventory);
  } catch (err) {
    // 熔断或超时，返回缓存的默认值
    reply.send({ productId: req.params.id, quantity: 0, cached: true });
  }
});
```

## 代码示例：Event Sourcing 事件溯源基础

```typescript
// event-sourcing.ts — 内存事件存储与状态重放

interface DomainEvent {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  timestamp: Date;
  aggregateId: string;
}

class EventStore {
  private events: DomainEvent[] = [];

  append(event: DomainEvent): void {
    this.events.push(event);
  }

  getEventsForAggregate(aggregateId: string): DomainEvent[] {
    return this.events.filter(e => e.aggregateId === aggregateId);
  }

  // 状态重放：从事件流重建当前状态
  replay<T>(
    aggregateId: string,
    initialState: T,
    reducer: (state: T, event: DomainEvent) => T
  ): T {
    return this.getEventsForAggregate(aggregateId).reduce(reducer, initialState);
  }
}

// 使用示例：订单聚合
interface OrderState {
  id: string;
  items: string[];
  status: 'pending' | 'paid' | 'shipped';
}

const store = new EventStore();

store.append({
  id: crypto.randomUUID(),
  type: 'OrderCreated',
  payload: { items: ['sku-1', 'sku-2'] },
  timestamp: new Date(),
  aggregateId: 'order-123',
});

store.append({
  id: crypto.randomUUID(),
  type: 'OrderPaid',
  payload: { amount: 199.99 },
  timestamp: new Date(),
  aggregateId: 'order-123',
});

const currentState = store.replay<OrderState>(
  'order-123',
  { id: 'order-123', items: [], status: 'pending' },
  (state, event) => {
    switch (event.type) {
      case 'OrderCreated':
        return { ...state, items: event.payload.items as string[] };
      case 'OrderPaid':
        return { ...state, status: 'paid' };
      default:
        return state;
    }
  }
);

console.log(currentState); // { id: 'order-123', items: ['sku-1', 'sku-2'], status: 'paid' }
```

## 代码示例：Schema Registry + Avro 事件契约

```typescript
// schema-registry-avro.ts — 跨服务事件契约验证

import avro from 'avsc';

// 定义订单创建事件的 Avro Schema
const OrderCreatedSchema = avro.Type.forSchema({
  type: 'record',
  name: 'OrderCreated',
  fields: [
    { name: 'orderId', type: 'string' },
    { name: 'userId', type: 'string' },
    { name: 'items', type: { type: 'array', items: 'string' } },
    { name: 'totalAmount', type: 'double' },
    { name: 'timestamp', type: 'long' },
  ],
});

// 序列化（发布前）
function serializeOrderCreated(event: unknown): Buffer {
  return OrderCreatedSchema.toBuffer(event);
}

// 反序列化（消费时）
function deserializeOrderCreated(buffer: Buffer): unknown {
  return OrderCreatedSchema.fromBuffer(buffer);
}

// Kafka 生产者中使用
// producer.send({ topic: 'orders', messages: [{ value: serializeOrderCreated(event) }] });

// Kafka 消费者中使用
// const event = deserializeOrderCreated(message.value);
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
| NestJS Microservices | <https://docs.nestjs.com/microservices/basics> | NestJS 官方微服务文档 |
| NATS Documentation | <https://docs.nats.io/> | 高性能消息系统文档 |
| OpenTelemetry JS | <https://opentelemetry.io/docs/languages/js/> | 分布式追踪 SDK |
| The Twelve-Factor App | <https://12factor.net/> | 云原生应用方法论 |
| Microservices.io | <https://microservices.io/patterns/index.html> | 微服务模式大全 |
| Building Microservices (O'Reilly) | <https://samnewman.io/books/building_microservices_2nd_edition/> | 微服务架构权威著作 |
| gRPC Docs | <https://grpc.io/docs/languages/node/> | Node.js gRPC 指南 |
| Temporal | <https://docs.temporal.io/> | 工作流编排与 Saga 实现 |
| Pact.io | <https://pact.io/> | 消费者驱动契约测试 |
| Kubernetes Deployments | <https://kubernetes.io/docs/concepts/workloads/controllers/deployment/> | K8s 官方工作负载文档 |
| Docker Documentation | <https://docs.docker.com/> | 容器化标准文档 |
| Consul | <https://www.consul.io/docs> | HashiCorp 服务发现与网格 |
| Istio | <https://istio.io/latest/docs/> | 服务网格流量管理与安全 |
| AWS Microservices | <https://aws.amazon.com/microservices/> | AWS 微服务白皮书 |
| Google Cloud Microservices | <https://cloud.google.com/microservices> | Google Cloud 微服务架构中心 |
| Fastify Documentation | <https://fastify.dev/> | 高性能 Node.js 框架 |
| Opossum Circuit Breaker | <https://nodeshift.dev/opossum/> | Node.js 熔断器库 |
| CloudEvents Specification | <https://cloudevents.io/> | 事件数据标准化规范 |
| Apache Avro | <https://avro.apache.org/docs/> | 数据序列化与 Schema 注册 |
| Confluent Schema Registry | <https://docs.confluent.io/platform/current/schema-registry/index.html> | Kafka Schema 管理 |

---

*最后更新: 2026-04-30*


---

## 深化补充：GraphQL Federation 与契约测试

### GraphQL Federation 网关示例

```typescript
// gateway.ts — Apollo Gateway 组装子图
import { ApolloGateway, IntrospectAndCompose } from '@apollo/gateway';
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

const gateway = new ApolloGateway({
  supergraphSdl: new IntrospectAndCompose({
    subgraphs: [
      { name: 'users', url: 'http://localhost:4001/graphql' },
      { name: 'orders', url: 'http://localhost:4002/graphql' },
    ],
  }),
});

const server = new ApolloServer({ gateway });
startStandaloneServer(server, { listen: { port: 4000 } });
```

### 本地开发：Docker Compose

```yaml
# docker-compose.dev.yml
version: '3.8'
services:
  nats:
    image: nats:latest
    ports: ["4222:4222"]
  order-service:
    build: ./apps/order-service
    environment:
      - NATS_URL=nats://nats:4222
    depends_on: [nats]
  api-gateway:
    build: ./apps/api-gateway
    ports: ["3000:3000"]
    depends_on: [order-service]
```

### Pact 消费者驱动契约测试

```typescript
// user-service.pact.spec.ts
import { Pact } from '@pact-foundation/pact';
import { userClient } from './user-client';

const provider = new Pact({
  consumer: 'OrderService',
  provider: 'UserService',
  port: 1234,
  log: './logs/pact.log',
  dir: './pacts',
});

describe('UserService Contract', () => {
  beforeAll(() => provider.setup());
  afterAll(() => provider.finalize());

  it('returns a user by id', async () => {
    await provider.addInteraction({
      state: 'user exists',
      uponReceiving: 'a request for user u1',
      withRequest: { method: 'GET', path: '/users/u1' },
      willRespondWith: {
        status: 200,
        body: { id: 'u1', name: 'Alice' },
      },
    });

    const user = await userClient.getUser('http://localhost:1234', 'u1');
    expect(user.name).toBe('Alice');
  });
});
```

---

### 更多权威参考链接

| 资源 | 链接 | 说明 |
|------|------|------|
| Apollo Federation | <https://www.apollographql.com/docs/federation/> | GraphQL 联邦官方文档 |
| Kong Gateway | <https://docs.konghq.com/gateway/latest/> | API 网关文档 |
| Traefik Proxy | <https://doc.traefik.io/traefik/> | 云原生反向代理 |
| Docker Compose | <https://docs.docker.com/compose/> | 本地多容器编排 |
| Pact.io | <https://pact.io/> | 消费者驱动契约测试 |
| NATS Streaming | <https://docs.nats.io/nats-concepts/jetstream> | JetStream 持久化消息 |
| Kubernetes Services | <https://kubernetes.io/docs/concepts/services-networking/service/> | K8s 服务网络 |
| Envoy Proxy | <https://www.envoyproxy.io/docs/envoy/latest/> | 服务网格数据面 |
