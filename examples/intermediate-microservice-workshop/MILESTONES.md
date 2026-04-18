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
