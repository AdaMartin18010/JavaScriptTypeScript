# 微服务 — 理论基础

## 1. 微服务定义

微服务架构将应用拆分为一组小型、自治的服务，每个服务：

- 围绕业务能力组织
- 独立部署
- 通过轻量级协议通信（HTTP/gRPC/消息队列）
- 拥有自己的数据存储

## 2. 架构范式对比

| 维度 | Monolith | Modular Monolith | Microservices |
|------|----------|------------------|---------------|
| **部署单元** | 单个进程/包 | 单个进程，内部模块化 | 多个独立进程 |
| **代码库** | 单一仓库 | 单一仓库，边界清晰 | 多仓库或单仓多服务 |
| **数据库** | 共享 | 共享，模块间通过 API 隔离 | 每个服务独立 |
| **通信成本** | 函数调用 | 模块间接口调用 | 网络调用（ms 级延迟） |
| **团队规模** | < 10 人 | 10-30 人 | 30+ 人（康威定律） |
| **运维复杂度** | 低 | 低 | 高（服务发现、监控、链路追踪） |
| **扩展粒度** | 整体扩展 | 整体扩展 | 独立扩展热点服务 |
| **技术栈** | 统一 | 统一 | 异构允许 |
| **适用阶段** | MVP / 初创期 | 成长期过渡 | 成熟期 / 大厂 |

> **建议**：多数团队应从 Modular Monolith 起步，在团队规模和性能瓶颈确实需要时再拆分微服务，避免过早优化带来的分布式复杂度。

## 3. 服务拆分策略

| 策略 | 依据 | 示例 |
|------|------|------|
| **按业务领域** | DDD 限界上下文 | 订单服务、用户服务、库存服务 |
| **按技术能力** | 非功能性需求 | 图片处理服务、搜索服务 |
| **按团队** | 康威定律 | 团队边界 = 服务边界 |

## 4. 服务间通信

### 同步通信

- **REST**: 简单通用，适合外部 API
- **gRPC**: 高性能二进制协议，适合内部服务
- **GraphQL Federation**: 统一查询多个服务

### 异步通信

- **消息队列**: Kafka、RabbitMQ、SQS，解耦生产者与消费者
- **事件总线**: 发布-订阅模式，服务间事件驱动
- **Saga 模式**: 分布式事务，通过补偿操作保证最终一致性

## 5. gRPC 服务定义示例

```protobuf
syntax = "proto3";
package order;

service OrderService {
  rpc CreateOrder(CreateOrderRequest) returns (Order);
  rpc GetOrder(GetOrderRequest) returns (Order);
  rpc StreamOrderUpdates(StreamRequest) returns (stream OrderUpdate);
}

message CreateOrderRequest {
  string user_id = 1;
  repeated OrderItem items = 2;
}

message OrderItem {
  string product_id = 1;
  int32 quantity = 2;
}

message Order {
  string id = 1;
  string user_id = 2;
  repeated OrderItem items = 3;
  OrderStatus status = 4;
}

enum OrderStatus {
  PENDING = 0;
  CONFIRMED = 1;
  SHIPPED = 2;
  DELIVERED = 3;
}
```

Node.js 服务端实现：

```typescript
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';

const packageDefinition = protoLoader.loadSync('./order.proto');
const proto = grpc.loadPackageDefinition(packageDefinition) as any;

const orders = new Map<string, any>();

const orderService = {
  createOrder: (call: any, callback: any) => {
    const order = {
      id: crypto.randomUUID(),
      ...call.request,
      status: 'PENDING'
    };
    orders.set(order.id, order);
    callback(null, order);
  },
  getOrder: (call: any, callback: any) => {
    const order = orders.get(call.request.id);
    if (!order) {
      callback({ code: grpc.status.NOT_FOUND, message: 'Order not found' });
      return;
    }
    callback(null, order);
  }
};

const server = new grpc.Server();
server.addService(proto.order.OrderService.service, orderService);
server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
  server.start();
  console.log('gRPC server running on port 50051');
});
```

## 6. NestJS 微服务与消息队列

```typescript
// order-service.ts
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OrderService } from './order.service';

@Controller()
export class OrderController {
  constructor(private readonly service: OrderService) {}

  @MessagePattern('order.create')
  async createOrder(@Payload() data: { userId: string; items: OrderItem[] }) {
    return this.service.create(data);
  }

  @MessagePattern('order.get')
  async getOrder(@Payload() id: string) {
    return this.service.findById(id);
  }
}
```

```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.REDIS,
    options: { host: 'localhost', port: 6379 },
  });
  await app.listen();
}
bootstrap();
```

## 7. Saga 模式：分布式事务编排

```typescript
// saga-orchestrator.ts
interface SagaStep {
  name: string;
  execute: () => Promise<void>;
  compensate: () => Promise<void>;
}

export class SagaOrchestrator {
  private steps: SagaStep[] = [];
  private executed: SagaStep[] = [];

  addStep(step: SagaStep): this {
    this.steps.push(step);
    return this;
  }

  async execute(): Promise<void> {
    for (const step of this.steps) {
      try {
        await step.execute();
        this.executed.push(step);
      } catch (err) {
        // 逆向补偿
        for (const completed of this.executed.reverse()) {
          await completed.compensate();
        }
        throw new Error(`Saga failed at step "${step.name}": ${err}`);
      }
    }
  }
}

// 使用示例
const createOrderSaga = new SagaOrchestrator()
  .addStep({
    name: 'reserve_inventory',
    execute: () => inventoryService.reserve(order.items),
    compensate: () => inventoryService.release(order.items),
  })
  .addStep({
    name: 'process_payment',
    execute: () => paymentService.charge(order.total),
    compensate: () => paymentService.refund(order.total),
  });
```

## 8. 熔断与限流

```typescript
// circuit-breaker.ts
import CircuitBreaker from 'opossum';

const options = {
  timeout: 3000,
  errorThresholdPercentage: 50,
  resetTimeout: 30000,
};

const breaker = new CircuitBreaker(asyncCallToRemoteService, options);

breaker.on('open', () => console.warn('[CircuitBreaker] Opened'));
breaker.on('halfOpen', () => console.info('[CircuitBreaker] Half-Open'));
breaker.on('close', () => console.info('[CircuitBreaker] Closed'));

// 使用
breaker.fire({ id: '123' }).catch(() => fallback());
```

## 9. 链路追踪（OpenTelemetry）

```typescript
// tracing.ts
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({ url: 'http://localhost:4318/v1/traces' }),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();

process.on('SIGTERM', () => sdk.shutdown().then(() => process.exit(0)));
```

## 10. API Gateway 与 BFF 模式

```typescript
// api-gateway.ts — 统一入口、路由聚合、认证鉴权

import { createProxyMiddleware } from 'http-proxy-middleware';
import express from 'express';

const app = express();

// 认证中间件
app.use('/api', verifyJwtToken);

// 路由聚合：将多个微服务 API 聚合为统一端点
app.use('/api/users', createProxyMiddleware({ target: 'http://user-service:3001', changeOrigin: true }));
app.use('/api/orders', createProxyMiddleware({ target: 'http://order-service:3002', changeOrigin: true }));
app.use('/api/inventory', createProxyMiddleware({ target: 'http://inventory-service:3003', changeOrigin: true }));

// BFF（Backend for Frontend）— 为移动端定制聚合 API
app.get('/mobile/home', async (req, res) => {
  const [user, recommendations, notifications] = await Promise.all([
    fetchUser(req.userId),
    fetchRecommendations(req.userId),
    fetchNotifications(req.userId),
  ]);
  res.json({ user, recommendations, notifications });
});
```

## 11. 健康检查与优雅关闭

```typescript
// health-check.ts — Kubernetes 探针与优雅关闭

import http from 'http';

let isReady = false;
let isShuttingDown = false;

const server = http.createServer((req, res) => {
  if (req.url === '/healthz') {
    res.writeHead(200);
    res.end('OK');
    return;
  }
  if (req.url === '/ready') {
    res.writeHead(isReady && !isShuttingDown ? 200 : 503);
    res.end(isReady ? 'Ready' : 'Not Ready');
    return;
  }
  // ... 业务处理
});

// 优雅关闭
process.on('SIGTERM', () => {
  isShuttingDown = true;
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    // 关闭数据库连接等
    process.exit(0);
  });
});

// 启动完成后标记就绪
connectToDatabase().then(() => {
  isReady = true;
  server.listen(3000);
});
```

## 12. 重试与抖动（Jitter）退避

```typescript
// retry-with-jitter.ts — 指数退避 + 全抖动，避免惊群效应

async function fetchWithRetryAndJitter<T>(
  fn: () => Promise<T>,
  options: { retries?: number; baseDelay?: number; maxDelay?: number } = {}
): Promise<T> {
  const { retries = 3, baseDelay = 100, maxDelay = 10000 } = options;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === retries) throw err;
      // 全抖动：random(0, min(maxDelay, baseDelay * 2^attempt))
      const expDelay = Math.min(baseDelay * 2 ** attempt, maxDelay);
      const jitter = Math.random() * expDelay;
      await new Promise(resolve => setTimeout(resolve, jitter));
    }
  }
  throw new Error('Unreachable');
}
```

## 13. 服务治理

- **服务发现**: Consul、Eureka、Kubernetes DNS
- **负载均衡**: 轮询、最小连接、一致性哈希
- **熔断降级**: 服务故障时快速失败，防止级联故障
- **限流**: 令牌桶、漏桶算法保护服务
- **链路追踪**: OpenTelemetry、Jaeger 追踪请求链路

## 14. 与相邻模块的关系

- **70-distributed-systems**: 分布式系统基础理论
- **22-deployment-devops**: 微服务的 CI/CD 流程
- **73-service-mesh-advanced**: 服务网格高级治理

## 参考链接

- [Building Microservices — Sam Newman (O'Reilly)](https://samnewman.io/books/building_microservices/)
- [gRPC Documentation](https://grpc.io/docs/)
- [Microservices.io Patterns](https://microservices.io/patterns/)
- [The Modular Monolith: Rails Architecture with One Foot in the Microservices Door](https://shopify.engineering/modular-monolith-rails-architecture)
- [AWS Microservices Whitepaper](https://docs.aws.amazon.com/whitepapers/latest/microservices-on-aws/introduction.html)
- [NestJS Microservices](https://docs.nestjs.com/microservices/basics)
- [Redis Streams — Messaging](https://redis.io/docs/data-types/streams/)
- [NATS Documentation](https://docs.nats.io/)
- [OpenTelemetry — Node.js](https://opentelemetry.io/docs/instrumentation/js/getting-started/nodejs/)
- [Saga Pattern — Chris Richardson](https://microservices.io/patterns/data/saga.html)
- [opossum — Circuit Breaker](https://nodeshift.dev/opossum/)
- [Microsoft — Cloud Design Patterns](https://learn.microsoft.com/en-us/azure/architecture/patterns/) — 微软云设计模式库
- [CNCF — Cloud Native Landscape](https://landscape.cncf.io/) — 云原生技术全景图
- [AWS Well-Architected Framework](https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html) — AWS 架构最佳实践
- [Google Cloud — Microservices Best Practices](https://cloud.google.com/architecture/microservices-best-practices) — Google 微服务实践
- [Kubernetes — Health Checks](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/) — K8s 探针配置
- [Envoy Proxy — Architecture](https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview) — 服务网格代理架构
- [Istio — Service Mesh Concepts](https://istio.io/latest/docs/concepts/what-is-istio/) — Istio 服务网格概念
