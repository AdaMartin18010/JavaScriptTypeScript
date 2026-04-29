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

## 6. 服务治理

- **服务发现**: Consul、Eureka、Kubernetes DNS
- **负载均衡**: 轮询、最小连接、一致性哈希
- **熔断降级**: 服务故障时快速失败，防止级联故障
- **限流**: 令牌桶、漏桶算法保护服务
- **链路追踪**: OpenTelemetry、Jaeger 追踪请求链路

## 7. 与相邻模块的关系

- **70-distributed-systems**: 分布式系统基础理论
- **22-deployment-devops**: 微服务的 CI/CD 流程
- **73-service-mesh-advanced**: 服务网格高级治理

## 参考链接

- [Building Microservices — Sam Newman (O'Reilly)](https://samnewman.io/books/building_microservices/)
- [gRPC Documentation](https://grpc.io/docs/)
- [Microservices.io Patterns](https://microservices.io/patterns/)
- [The Modular Monolith: Rails Architecture with One Foot in the Microservices Door](https://shopify.engineering/modular-monolith-rails-architecture)
- [AWS Microservices Whitepaper](https://docs.aws.amazon.com/whitepapers/latest/microservices-on-aws/introduction.html)
