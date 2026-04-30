# 里程碑学习指南

> 每个里程碑都是独立的、可运行的学习单元。建议按顺序完成，但也可按需跳跃。

---

## Milestone 1: API Gateway（API 网关）

**目标**：理解微服务统一入口的设计原则

**关键问题**：

- 为什么需要 API Gateway？
- 如何优雅地聚合多个下游服务的响应？
- 速率限制应该放在哪一层？

**运行方式**：

```bash
cd milestone-01-api-gateway
npm install
npm run dev        # 同时启动 gateway + users + orders
```

**验证**：

```bash
curl http://localhost:3000/health
curl http://localhost:3000/users
curl http://localhost:3000/orders
curl -H "Authorization: Bearer <token>" http://localhost:3000/users/profile
```

### 代码示例：Fastify API Gateway 插件

```typescript
import fp from 'fastify-plugin';

export default fp(async (fastify, opts) => {
  fastify.register(require('@fastify/http-proxy'), {
    upstream: 'http://localhost:3001',
    prefix: '/users',
    rewritePrefix: '/users',
  });

  fastify.register(require('@fastify/http-proxy'), {
    upstream: 'http://localhost:3002',
    prefix: '/orders',
    rewritePrefix: '/orders',
  });

  // 全局速率限制
  await fastify.register(require('@fastify/rate-limit'), {
    max: 100,
    timeWindow: '1 minute',
  });
});
```

---

## Milestone 2: Service Discovery（服务发现）

**目标**：理解动态服务注册与发现的必要性

**关键问题**：

- 硬编码服务地址有什么问题？
- 如何实现心跳机制？
- 服务宕机后如何自动剔除？

**运行方式**：

```bash
cd milestone-02-service-discovery
npm install
npm run infra      # 启动 Redis
docker-compose up -d redis
npm run dev
```

**验证**：

```bash
# 查看 Redis 中的注册信息
docker exec -it workshop-redis redis-cli KEYS "service:*"

# Gateway 动态路由
curl http://localhost:3000/users    # 自动路由到 users-service
```

### 代码示例：Redis 服务注册中心

```typescript
import Redis from 'ioredis';

const redis = new Redis({ host: 'localhost', port: 6379 });

interface ServiceInstance {
  id: string;
  name: string;
  host: string;
  port: number;
  healthPath: string;
}

async function registerService(instance: ServiceInstance): Promise<void> {
  const key = `service:${instance.name}:${instance.id}`;
  await redis.setex(key, 30, JSON.stringify(instance)); // 30s TTL
}

async function discoverService(name: string): Promise<ServiceInstance | null> {
  const keys = await redis.keys(`service:${name}:*`);
  if (keys.length === 0) return null;
  // 简单随机负载均衡
  const key = keys[Math.floor(Math.random() * keys.length)];
  const data = await redis.get(key);
  return data ? JSON.parse(data) : null;
}

// 心跳续期
setInterval(async () => {
  const key = `service:users:${serviceId}`;
  await redis.expire(key, 30);
}, 10000);
```

---

## Milestone 3: Event Bus（事件总线）

**目标**：掌握异步事件驱动通信模式

**关键问题**：

- 同步调用 vs 异步事件，何时选择哪个？
- 如何保证消息不丢失？
- 死信队列（DLQ）的作用是什么？

**运行方式**：

```bash
cd milestone-03-event-bus
npm install
npm run infra      # 启动 NATS + Redis + Postgres
npm run dev
```

**验证**：

```bash
# 创建订单（触发事件）
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -d '{"userId":"u1","product":"Book","amount":99.99}'

# 查看 notifications-service 日志（收到 order.created 事件）
```

### 代码示例：NATS JetStream 发布订阅

```typescript
import { connect, JSONCodec } from 'nats';

const nc = await connect({ servers: 'nats://localhost:4222' });
const jc = JSONCodec();
const js = nc.jetstream();

// 发布事件
async function publishOrderCreated(order: Order) {
  await js.publish('orders.created', jc.encode(order), {
    msgID: order.id, // 幂等性
  });
}

// 消费事件
const consumer = await js.pullSubscribe('orders.created', {
  config: { durable_name: 'notifications-service' },
});

(async () => {
  for await (const msg of consumer) {
    const order = jc.decode(msg.data) as Order;
    await sendNotification(order.userId, `Order ${order.id} created`);
    msg.ack();
  }
})();
```

---

## Milestone 4: Distributed Tracing（分布式链路追踪）

**目标**：建立跨服务的可观测性能力

**关键问题**：

- 如何在服务间传播 Trace Context？
- Root Span 应该在哪里创建？
- NATS 消息如何携带追踪信息？

**运行方式**：

```bash
cd milestone-04-distributed-tracing
npm install
npm run infra      # 启动全部基础设施
npm run dev
```

**验证**：

```bash
# 发起一个跨服务请求
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -d '{"userId":"u1","product":"Book","amount":99.99}'

# 打开 Jaeger UI
open http://localhost:16686
# 搜索 Service = "api-gateway"，查看完整链路
```

### 代码示例：OpenTelemetry 跨服务传播

```typescript
import { NodeSDK } from '@opentelemetry/sdk-node';
import { W3CTraceContextPropagator } from '@opentelemetry/core';
import { context, propagation, trace } from '@opentelemetry/api';

// 网关创建 Root Span
async function gatewayHandler(req: FastifyRequest) {
  const tracer = trace.getTracer('api-gateway');
  return tracer.startActiveSpan('handle-request', async (span) => {
    span.setAttribute('http.method', req.method);
    span.setAttribute('http.url', req.url);

    // 将 trace context 注入到下游请求头
    const headers: Record<string, string> = {};
    propagation.inject(context.active(), headers);

    const response = await fetch('http://users-service/users', { headers });
    span.setAttribute('http.status_code', response.status);
    span.end();
    return response;
  });
}

// 下游服务提取 context
async function usersHandler(req: FastifyRequest) {
  const parentContext = propagation.extract(context.active(), req.headers);
  const tracer = trace.getTracer('users-service');
  return tracer.startActiveSpan('get-users', { parent: parentContext }, async (span) => {
    const users = await db.query('SELECT * FROM users');
    span.setAttribute('db.users.count', users.length);
    span.end();
    return users;
  });
}
```

### 代码示例：Milestone 5 断路器（Circuit Breaker）

```typescript
import { CircuitBreaker } from 'opossum';

const options = {
  timeout: 3000,
  errorThresholdPercentage: 50,
  resetTimeout: 30000,
};

const breaker = new CircuitBreaker(fetchUsers, options);

breaker.fire()
  .then(console.log)
  .catch(e => console.error('Circuit open or failure:', e));

// 监听状态转换
breaker.on('open', () => console.warn('Circuit breaker opened'));
breaker.on('halfOpen', () => console.info('Circuit breaker half-open, testing...'));
```

### 代码示例：Milestone 6 Saga 编排式事务

```typescript
// 协同式 Saga：每个服务完成后发送事件，由 Saga 协调器监听并决定下一步
async function createOrderSaga(orderId: string) {
  const steps = [
    async () => await reserveInventory(orderId),
    async () => await processPayment(orderId),
    async () => await shipOrder(orderId),
  ];

  const compensations: (() => Promise<void>)[] = [];
  try {
    for (const step of steps) {
      const result = await step();
      compensations.push(result.undo);
    }
  } catch (e) {
    // 反向补偿：按 LIFO 顺序执行已完成的补偿操作
    for (const compensate of compensations.reverse()) {
      await compensate();
    }
    throw new Error(`Saga failed: ${e.message}`);
  }
}
```

### 代码示例：Milestone 7 动态配置中心

```typescript
import { ConfigService } from '@nestjs/config';

// 基于文件/Redis 的动态配置，支持热更新
const configService = new ConfigService();
const dbHost = configService.get<string>('DATABASE_HOST', 'localhost');

// 监听配置变更并热重载连接池
configService.onChange('DATABASE_HOST', async (newHost) => {
  console.log(`Database host changed to ${newHost}, reconnecting...`);
  await pool.reconnect(newHost);
});
```

### 代码示例：Milestone 8 mTLS 与 JWT 鉴权

```typescript
import fastify from 'fastify';
import fs from 'fs';

const app = fastify({
  https: {
    key: fs.readFileSync('server-key.pem'),
    cert: fs.readFileSync('server-cert.pem'),
    ca: fs.readFileSync('ca-cert.pem'),
    requestCert: true, // 要求客户端证书
    rejectUnauthorized: true,
  },
});

// JWT 验证插件
app.register(require('@fastify/jwt'), { secret: process.env.JWT_SECRET! });

app.get('/secure', { preValidation: [app.authenticate] }, async (req) => {
  return { user: req.user };
});
```

---

## 设计决策记录（ADR）

### ADR-1: 为什么选择 Fastify？

- **性能**：比 Express 快 3 倍（基于 HTTP 解析器优化）
- **生态**：内置 schema validation、插件体系
- **TypeScript 友好**：原生支持类型推导

### ADR-2: 为什么选择 NATS 而非 RabbitMQ？

- **轻量**：单二进制文件，无外部依赖
- **JetStream**：内置持久化，无需额外组件
- **云原生**：与 Kubernetes 集成良好

### ADR-3: 为什么使用 Redis 做服务发现？

- **简单**：无需引入 Consul/Eureka 等重型方案
- **过期机制**：Redis TTL 天然支持心跳剔除
- **教学聚焦**：避免服务发现本身的复杂度掩盖教学主题

### ADR-4: 为什么选择 NATS JetStream 而非 Kafka？

- **部署成本**：单二进制启动，无需 ZooKeeper
- **消费模型**：Push + Pull 双模式，更灵活
- **主题层级**：原生支持通配符订阅（`orders.*`）

### ADR-5: 为什么使用 OpenTelemetry 而非 Jaeger Client SDK？

- **厂商无关**：统一 API，后端可切换至 Jaeger/Zipkin/Tempo
- **标准传播**：W3C Trace Context 自动跨语言兼容
- **未来-proof**：OpenTelemetry Metrics/Logs 统一链路

---

## 扩展里程碑

| 里程碑 | 主题 | 关键概念 |
|--------|------|----------|
| Milestone 5 | 断路器与降级 | Circuit Breaker、Bulkhead、Timeout |
| Milestone 6 | Saga 分布式事务 | 编排式 / 协同式 Saga、补偿事务 |
| Milestone 7 | 配置中心 | 动态配置、灰度发布、配置加密 |
| Milestone 8 | 安全通信 | mTLS、JWT 鉴权、OAuth2 客户端凭证 |

---

## 权威参考

| 资源 | 类型 | 链接 |
|------|------|------|
| Fastify | 官方文档 | [fastify.dev](https://fastify.dev/) |
| NATS | 官方文档 | [docs.nats.io](https://docs.nats.io/) |
| Redis | 官方文档 | [redis.io](https://redis.io/) |
| OpenTelemetry | 官方文档 | [opentelemetry.io](https://opentelemetry.io/) |
| Jaeger | 分布式追踪 | [jaegertracing.io](https://www.jaegertracing.io/) |
| Microservices Patterns | 书籍 | [microservices.io/patterns](https://microservices.io/patterns/) |
| Building Microservices (O'Reilly) | 书籍 | [samnewman.io/books/building_microservices](https://samnewman.io/books/building_microservices/) |

### 扩展里程碑权威参考

| 资源 | 类型 | 链接 |
|------|------|------|
| Opossum (Circuit Breaker) | npm 包 | [nodeshift.dev/opossum](https://nodeshift.dev/opossum/) |
| Saga Pattern | 微服务模式 | [microservices.io/patterns/data/saga.html](https://microservices.io/patterns/data/saga.html) |
| mTLS in Node.js | 官方文档 | [nodejs.org/api/tls.html](https://nodejs.org/api/tls.html) |
| JWT Best Practices | IETF RFC | [datatracker.ietf.org/doc/html/rfc8725](https://datatracker.ietf.org/doc/html/rfc8725) |
| OpenTelemetry Semantic Conventions | 规范 | [opentelemetry.io/docs/concepts/semantic-conventions](https://opentelemetry.io/docs/concepts/semantic-conventions/) |

---

*最后更新: 2026-04-29*
