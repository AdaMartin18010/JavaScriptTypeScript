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
| 模块化单体 | 部署简单、内部解耦 | 无法独立扩展 | 中型团队过渡 |

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

**令牌桶速率限制器**

```typescript
// rate-limiter.ts — 保护下游服务的令牌桶实现
class TokenBucket {
  private tokens: number;
  private lastRefill: number;

  constructor(
    private capacity: number,
    private refillRatePerSec: number
  ) {
    this.tokens = capacity;
    this.lastRefill = Date.now();
  }

  tryAcquire(tokens = 1): boolean {
    this.refill();
    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      return true;
    }
    return false;
  }

  private refill() {
    const now = Date.now();
    const delta = (now - this.lastRefill) / 1000;
    this.tokens = Math.min(this.capacity, this.tokens + delta * this.refillRatePerSec);
    this.lastRefill = now;
  }
}

// 装饰器模式应用于服务方法
function rateLimited(bucket: TokenBucket) {
  return function (_target: any, _key: string, descriptor: PropertyDescriptor) {
    const original = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      if (!bucket.tryAcquire()) {
        throw new Error('Rate limit exceeded');
      }
      return original.apply(this, args);
    };
  };
}

class PaymentGateway {
  private bucket = new TokenBucket(100, 10); // 容量 100，每秒补充 10

  @rateLimited(this.bucket)
  async charge(amount: number, token: string) {
    // 调用外部支付 API
    return { transactionId: `txn-${Date.now()}` };
  }
}
```

**服务发现与健康检查**

```typescript
// service-registry.ts — 基于内存的服务注册与发现
interface ServiceInstance {
  id: string;
  name: string;
  host: string;
  port: number;
  health: 'UP' | 'DOWN';
  metadata: Record<string, string>;
  lastHeartbeat: number;
}

class ServiceRegistry {
  private services = new Map<string, ServiceInstance[]>();
  private readonly heartbeatTimeout = 30000;

  register(instance: ServiceInstance): void {
    const list = this.services.get(instance.name) ?? [];
    const idx = list.findIndex((s) => s.id === instance.id);
    if (idx >= 0) list[idx] = instance;
    else list.push(instance);
    this.services.set(instance.name, list);
  }

  deregister(serviceName: string, instanceId: string): void {
    const list = this.services.get(serviceName) ?? [];
    this.services.set(
      serviceName,
      list.filter((s) => s.id !== instanceId)
    );
  }

  discover(serviceName: string): ServiceInstance | null {
    const healthy = this.services
      .get(serviceName)
      ?.filter((s) => s.health === 'UP' && Date.now() - s.lastHeartbeat < this.heartbeatTimeout);
    if (!healthy?.length) return null;
    // 简单轮询负载均衡
    return healthy[Math.floor(Math.random() * healthy.length)];
  }

  heartbeat(instanceId: string): void {
    for (const list of this.services.values()) {
      const instance = list.find((s) => s.id === instanceId);
      if (instance) {
        instance.lastHeartbeat = Date.now();
        instance.health = 'UP';
        return;
      }
    }
  }
}
```

### 3.2 Saga 编排示例（Orchestration）

以下是用 TypeScript 实现的简化 Saga 编排器，展示如何以中央协调器管理分布式事务步骤：

```typescript
// saga-orchestrator.ts
type SagaStep = {
  name: string;
  action: () => Promise<void>;
  compensate: () => Promise<void>;
};

class SagaOrchestrator {
  private completed: string[] = [];

  async execute(steps: SagaStep[]) {
    for (const step of steps) {
      try {
        await step.action();
        this.completed.unshift(step.name); // 记录以便回滚
      } catch (err) {
        await this.rollback();
        throw new Error(`Saga failed at step "${step.name}": ${err}`);
      }
    }
  }

  private async rollback() {
    for (const name of this.completed) {
      const step = this.steps.find(s => s.name === name)!;
      await step.compensate().catch(() => {/* 补偿失败需人工介入 */});
    }
  }

  constructor(private steps: SagaStep[]) {}
}

// 使用示例：创建订单 Saga
const createOrderSaga = new SagaOrchestrator([
  {
    name: 'reserveInventory',
    action: () => inventoryService.reserve(sku, qty),
    compensate: () => inventoryService.release(sku, qty),
  },
  {
    name: 'processPayment',
    action: () => paymentService.charge(userId, amount),
    compensate: () => paymentService.refund(userId, amount),
  },
  {
    name: 'shipOrder',
    action: () => shippingService.create(orderId),
    compensate: () => shippingService.cancel(orderId),
  },
]);
```

### 3.3 gRPC 内部通信示例

对于低延迟、强类型的内部服务通信，gRPC 是首选协议：

```typescript
// protobuf/payments.proto
syntax = "proto3";
service PaymentService {
  rpc Charge (ChargeRequest) returns (ChargeResponse);
}
message ChargeRequest {
  string user_id = 1;
  double amount = 2;
}
message ChargeResponse {
  string transaction_id = 1;
  bool success = 2;
}

// server.ts
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';

const packageDef = protoLoader.loadSync('./protobuf/payments.proto');
const grpcObj = grpc.loadPackageDefinition(packageDef) as any;
const server = new grpc.Server();

server.addService(grpcObj.PaymentService.service, {
  charge: (call: any, callback: any) => {
    const { user_id, amount } = call.request;
    // 业务逻辑...
    callback(null, { transaction_id: 'txn-123', success: true });
  },
});
server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
  server.start();
});

// client.ts
const client = new grpcObj.PaymentService('payments:50051', grpc.credentials.createInsecure());
client.charge({ user_id: 'u1', amount: 99.9 }, (err: any, response: any) => {
  console.log(response);
});
```

### 3.4 基于 Redis 的分布式锁

```typescript
// distributed-lock.ts — Redlock 算法的简化实现
import Redis from 'ioredis';

class DistributedLock {
  private redis: Redis;

  constructor(redisUrl: string) {
    this.redis = new Redis(redisUrl);
  }

  async acquire(lockKey: string, ttlMs: number): Promise<{ release: () => Promise<void> } | null> {
    const token = crypto.randomUUID();
    const acquired = await this.redis.set(lockKey, token, 'PX', ttlMs, 'NX');
    if (acquired !== 'OK') return null;

    return {
      release: async () => {
        const current = await this.redis.get(lockKey);
        if (current === token) {
          await this.redis.del(lockKey);
        }
      },
    };
  }

  async withLock<T>(lockKey: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
    const lock = await this.acquire(lockKey, ttlMs);
    if (!lock) throw new Error(`Failed to acquire lock: ${lockKey}`);
    try {
      return await fn();
    } finally {
      await lock.release();
    }
  }
}

// 使用：防止库存超卖
const lock = new DistributedLock('redis://localhost:6379');
await lock.withLock(`inventory:${sku}`, 5000, async () => {
  const stock = await inventoryRepo.getStock(sku);
  if (stock < qty) throw new Error('Out of stock');
  await inventoryRepo.decrement(sku, qty);
});
```

### 3.5 常见误区

| 误区 | 正确理解 |
|------|---------|
| 微服务解决所有扩展问题 | 引入分布式复杂度，需要配套基础设施 |
| 服务越小越好 | 过细的服务导致通信开销和事务困难 |
| 先拆微服务再迭代 | 应从模块化单体开始，在痛点出现时拆分 |
| 共享数据库没问题 | 违反去中心化数据原则，导致隐性耦合 |

### 3.6 扩展阅读

- [Building Microservices — Sam Newman](https://samnewman.io/books/building_microservices/)
- [The Twelve-Factor App](https://12factor.net/)
- [NATS Documentation](https://docs.nats.io/)
- [Temporal: Durable Execution](https://temporal.io/)
- [Martin Fowler — Microservices](https://martinfowler.com/articles/microservices.html) — 微服务架构奠基性文章
- [Microservices.io Patterns](https://microservices.io/patterns/index.html) — 微服务模式大全与实现指南
- [Microsoft Azure — Microservices Architecture](https://docs.microsoft.com/en-us/azure/architecture/microservices/) — 微软云架构中心微服务实践
- [AWS Microservices](https://aws.amazon.com/microservices/) — AWS 微服务最佳实践白皮书
- [Enterprise Integration Patterns](https://www.enterpriseintegrationpatterns.com/) — 企业集成模式权威参考
- [gRPC Node.js Documentation](https://grpc.io/docs/languages/node/) — Google 官方 gRPC Node.js 指南
- [Google SRE Book — Distributed Systems](https://sre.google/sre-book/distributed-systems/) — Google SRE 分布式系统章节
- [AWS Builder's Library — Avoiding Fallback in Distributed Systems](https://aws.amazon.com/builders-library/avoiding-fallback-in-distributed-systems/) — AWS 分布式系统设计
- [Netflix Tech Blog — Fault Tolerance in a High Volume Distributed System](https://netflixtechblog.com/fault-tolerance-in-a-high-volume-distributed-system-91ab4faae74a) — Netflix 容错设计
- [Redlock Algorithm — Redis](https://redis.io/docs/manual/patterns/distributed-locks/) — Redis 官方分布式锁算法
- [CNCF Cloud Native Definition](https://github.com/cncf/toc/blob/main/DEFINITION.md) — 云原生基金会定义
- `20.2-language-patterns/architecture-patterns/`

### 3.6 API Gateway 模式实现

```typescript
// api-gateway.ts — 简易反向代理网关
import http from 'node:http';
import httpProxy from 'http-proxy';

const proxy = httpProxy.createProxyServer();
const routes: Record<string, string> = {
  '/orders': 'http://order-service:3001',
  '/payments': 'http://payment-service:3002',
  '/inventory': 'http://inventory-service:3003',
};

const gateway = http.createServer((req, res) => {
  const target = Object.keys(routes).find((prefix) => req.url?.startsWith(prefix));
  if (!target) { res.writeHead(404); res.end('Not Found'); return; }
  proxy.web(req, res, { target: routes[target] });
});

gateway.listen(3000, () => console.log('API Gateway on :3000'));
```

### 3.7 指数退避与抖动重试

```typescript
// retry.ts — 带抖动的指数退避重试
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 5,
  baseDelay = 100
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try { return await fn(); } catch (err) {
      if (i === maxRetries - 1) throw err;
      const jitter = Math.random() * baseDelay;
      const delay = Math.pow(2, i) * baseDelay + jitter;
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error('Unreachable');
}
```

### 新增权威参考链接

- [API Gateway Pattern — AWS](https://docs.aws.amazon.com/whitepapers/latest/microservices-on-aws/api-gateway.html) — AWS 微服务白皮书
- [Istio Service Mesh](https://istio.io/latest/docs/concepts/what-is-istio/) — 服务网格概念与配置
- [Kubernetes Services](https://kubernetes.io/docs/concepts/services-networking/service/) — K8s 服务发现官方文档
- [Envoy Proxy Documentation](https://www.envoyproxy.io/docs) — 云原生代理配置参考
- [Netflix Eureka](https://github.com/Netflix/eureka) — 服务注册与发现
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/) — 云架构最佳实践

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
