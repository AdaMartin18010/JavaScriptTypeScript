---
last-updated: 2026-04-27
review-cycle: 6 months
next-review: 2026-10-27
status: current
---

# 应用领域专项学习路径 (Application Domains Path)

> 从跑通 Demo 到在生产环境可靠运行，覆盖 Web、AI、实时通信与边缘计算等主流场景。
>
> **覆盖维度**：应用领域

## 路径目标与预期产出

完成本路径后，你将能够：

- **入门**：独立交付完整的 Web 应用与 RESTful API，掌握基础安全实践
- **进阶**：集成 LLM 与 AI Agent，构建实时协作系统，并将服务部署至边缘节点
- **专家**：设计多租户 SaaS 架构，建立生产级可观测性体系，实施混沌工程验证系统韧性

**预计总周期**：7–11 周（每天 2–3 小时）

---

## 目录

- [应用领域专项学习路径 (Application Domains Path)](#应用领域专项学习路径-application-domains-path)
  - [路径目标与预期产出](#路径目标与预期产出)
  - [目录](#目录)
  - [阶段一：入门 —— Web 应用与 API 服务 (2–3 周)](#阶段一入门--web-应用与-api-服务-23-周)
    - [节点 1.1 全栈 Web 应用开发](#节点-11-全栈-web-应用开发)
    - [节点 1.2 RESTful API 与安全](#节点-12-restful-api-与安全)
      - [代码示例：JWT 认证中间件（Node.js + Fastify）](#代码示例jwt-认证中间件nodejs--fastify)
    - [节点 1.3 数据库与 ORM](#节点-13-数据库与-orm)
  - [阶段二：进阶 —— AI 集成与边缘计算 (2–3 周)](#阶段二进阶--ai-集成与边缘计算-23-周)
    - [节点 2.1 AI 与 LLM 工程化](#节点-21-ai-与-llm-工程化)
      - [代码示例：ReAct Agent 工作流骨架](#代码示例react-agent-工作流骨架)
    - [节点 2.2 实时通信与协作](#节点-22-实时通信与协作)
      - [代码示例：WebSocket 协作服务器（Socket.io）](#代码示例websocket-协作服务器socketio)
    - [节点 2.3 边缘计算与 Serverless](#节点-23-边缘计算与-serverless)
      - [代码示例：Cloudflare Workers 边缘函数](#代码示例cloudflare-workers-边缘函数)
  - [阶段三：专家 —— 生产级部署与可观测性 (3–4 周)](#阶段三专家--生产级部署与可观测性-34-周)
    - [节点 3.1 微服务与多租户架构](#节点-31-微服务与多租户架构)
    - [节点 3.2 可观测性平台](#节点-32-可观测性平台)
      - [代码示例：OpenTelemetry Node.js 自动埋点](#代码示例opentelemetry-nodejs-自动埋点)
    - [节点 3.3 韧性工程与混沌测试](#节点-33-韧性工程与混沌测试)
  - [阶段验证 Checkpoint](#阶段验证-checkpoint)
    - [Checkpoint 1：带认证 API 服务](#checkpoint-1带认证-api-服务)
    - [Checkpoint 2：AI Agent 工作流 或 边缘函数](#checkpoint-2ai-agent-工作流-或-边缘函数)
    - [Checkpoint 3：多租户 SaaS + 可观测性](#checkpoint-3多租户-saas--可观测性)
  - [推荐资源](#推荐资源)
  - [权威参考链接](#权威参考链接)

---

## 阶段一：入门 —— Web 应用与 API 服务 (2–3 周)

### 节点 1.1 全栈 Web 应用开发

- **关联文件/模块**：
  - `20-code-lab/`
  - `20-code-lab/`
  - `examples/beginner-todo-master/`
  - `examples/desktop-tauri-react/`
- **关键技能**：
  - 前后端分离与全栈类型安全
  - 身份认证与会话管理
  - 基础性能优化（懒加载、代码分割）

### 节点 1.2 RESTful API 与安全

- **关联文件/模块**：
  - `20-code-lab/`
  - `30-knowledge-base/30.8-research/tsjs-stack-panorama-2026/API_DESIGN_THEORY.md`
  - `30-knowledge-base/30.8-research/tsjs-stack-panorama-2026/SECURITY_MODEL_ANALYSIS.md`
- **关键技能**：
  - RESTful 资源设计、HTTP 状态码语义
  - JWT / OAuth 2.0 / OIDC 流程
  - 输入验证、SQL 注入、XSS、CSRF 防护

#### 代码示例：JWT 认证中间件（Node.js + Fastify）

```typescript
import Fastify from 'fastify';
import jwt from '@fastify/jwt';
import bcrypt from 'bcrypt';

const app = Fastify();
app.register(jwt, { secret: process.env.JWT_SECRET! });

// 注册
app.post('/auth/register', async (req, reply) => {
  const { email, password } = req.body as { email: string; password: string };
  const hash = await bcrypt.hash(password, 12);
  // 存储 hash 到数据库...
  return { success: true };
});

// 登录并签发 JWT
app.post('/auth/login', async (req, reply) => {
  const { email, password } = req.body as { email: string; password: string };
  // 从数据库读取用户 hash...
  const token = app.jwt.sign({ sub: email, role: 'user' });
  return { token };
});

// 受保护路由
app.get('/profile', async (req, reply) => {
  await req.jwtVerify();
  return { user: req.user };
});
```

### 节点 1.3 数据库与 ORM

- **关联文件/模块**：
  - `20-code-lab/`
  - `30-knowledge-base/30.8-research/tsjs-stack-panorama-2026/DATABASE_ORM_THEORY.md`
- **关键技能**：
  - Prisma / TypeORM / Drizzle 的选型与 trade-off
  - 索引设计、查询优化、连接池
  - 事务边界与 Saga 模式基础

---

## 阶段二：进阶 —— AI 集成与边缘计算 (2–3 周)

### 节点 2.1 AI 与 LLM 工程化

- **关联文件/模块**：
  - `20-code-lab/20.7-ai-agent-infra/ai-integration/`
  - `20-code-lab/20.7-ai-agent-infra/ml-engineering/`
  - `examples/ai-agent-production/`
  - `30-knowledge-base/30.8-research/tsjs-stack-panorama-2026/AI_ML_INTEGRATION_THEORY.md`
  - `30-knowledge-base/30.8-research/tsjs-stack-panorama-2026/10_ai_ml.md`
- **关键技能**：
  - Prompt Engineering 与结构化输出
  - RAG（检索增强生成）架构
  - Agent 工作流设计（ReAct、Plan-and-Execute）
  - 流式响应与 SSE/WebSocket 集成

#### 代码示例：ReAct Agent 工作流骨架

```typescript
interface AgentStep {
  thought: string;
  action: 'search' | 'calculate' | 'finalize';
  input: string;
  observation?: string;
}

async function reactAgent(query: string, maxSteps = 5): Promise<string> {
  const steps: AgentStep[] = [];
  for (let i = 0; i < maxSteps; i++) {
    const step = await llm.generateNextStep(query, steps);
    steps.push(step);
    if (step.action === 'finalize') return step.input;
    step.observation = await executeTool(step.action, step.input);
  }
  return 'Max steps reached';
}

// 流式 SSE 输出
async function* streamAgent(query: string) {
  const response = await fetch('/api/agent', {
    method: 'POST',
    body: JSON.stringify({ query }),
  });
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    yield decoder.decode(value);
  }
}
```

### 节点 2.2 实时通信与协作

- **关联文件/模块**：
  - `20-code-lab/`
  - `30-knowledge-base/30.8-research/tsjs-stack-panorama-2026/REALTIME_COMMUNICATION_THEORY.md`
- **关键技能**：
  - WebSocket / SSE / WebRTC 的选型矩阵
  - OT（Operational Transformation）与 CRDT 基础
  - Presence、心跳与重连策略

#### 代码示例：WebSocket 协作服务器（Socket.io）

```typescript
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';

const io = new Server({ adapter: createAdapter(pubClient, subClient) });

io.on('connection', (socket) => {
  socket.on('join-document', (docId: string) => {
    socket.join(docId);
    socket.to(docId).emit('presence', { user: socket.id, status: 'online' });
  });

  socket.on('operation', ({ docId, op }) => {
    // 广播操作到同文档的其他客户端
    socket.to(docId).emit('operation', op);
  });

  socket.on('disconnecting', () => {
    for (const room of socket.rooms) {
      socket.to(room).emit('presence', { user: socket.id, status: 'offline' });
    }
  });
});
```

### 节点 2.3 边缘计算与 Serverless

- **关联文件/模块**：
  - `20-code-lab/`
  - `20-code-lab/`
  - `examples/edge-ai-inference/`
  - `30-knowledge-base/30.8-research/tsjs-stack-panorama-2026/EDGE_SERVERLESS_THEORY.md`
- **关键技能**：
  - 边缘函数（Edge Functions）限制与冷启动优化
  - KV 存储与缓存策略在边缘节点的应用
  - 渐进式渲染与边缘 SSR

#### 代码示例：Cloudflare Workers 边缘函数

```typescript
// workers.ts — 边缘推理代理
export interface Env {
  AI: Ai;
  KV_CACHE: KVNamespace;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const cacheKey = new URL(request.url).pathname;
    const cached = await env.KV_CACHE.get(cacheKey);
    if (cached) return new Response(cached, { headers: { 'X-Cache': 'HIT' } });

    const input = await request.json<{ prompt: string }>();
    const response = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
      prompt: input.prompt,
      max_tokens: 512,
    });

    const json = JSON.stringify(response);
    await env.KV_CACHE.put(cacheKey, json, { expirationTtl: 300 });
    return new Response(json, { headers: { 'X-Cache': 'MISS' } });
  },
};
```

---

## 阶段三：专家 —— 生产级部署与可观测性 (3–4 周)

### 节点 3.1 微服务与多租户架构

- **关联文件/模块**：
  - `20-code-lab/`
  - `20-code-lab/`
  - `examples/intermediate-microservice-workshop/`
  - `examples/monorepo-fullstack-saas/`
- **关键技能**：
  - 服务拆分策略（DDD 限界上下文）
  - 多租户隔离模型（Row-level Security、Schema-per-tenant、Pool-per-tenant）
  - API 网关、BFF（Backend-for-Frontend）与熔断降级

### 节点 3.2 可观测性平台

- **关联文件/模块**：
  - `20-code-lab/`
  - `20-code-lab/`
  - `examples/edge-observability-starter/`
  - `30-knowledge-base/30.8-research/tsjs-stack-panorama-2026/08_observability.md`
- **关键技能**：
  - 三大支柱：Metrics / Logs / Traces 的采集与关联
  - OpenTelemetry 在 Node.js 与浏览器端的接入
  - SLO/SLI 定义与错误预算管理

#### 代码示例：OpenTelemetry Node.js 自动埋点

```typescript
// telemetry.ts — 初始化可观测性
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';

export function initTelemetry() {
  const sdk = new NodeSDK({
    traceExporter: new OTLPTraceExporter({ url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT }),
    metricReader: new PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter(),
      exportIntervalMillis: 15000,
    }),
    instrumentations: [getNodeAutoInstrumentations()],
    serviceName: process.env.OTEL_SERVICE_NAME || 'api-service',
  });
  sdk.start();
  return sdk;
}

// 业务代码中手动创建 Span
import { trace } from '@opentelemetry/api';

export async function processOrder(orderId: string) {
  const tracer = trace.getTracer('order-service');
  return tracer.startActiveSpan('processOrder', async (span) => {
    span.setAttribute('order.id', orderId);
    try {
      const result = await db.orders.update(orderId, { status: 'processing' });
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (e) {
      span.recordException(e as Error);
      throw e;
    } finally {
      span.end();
    }
  });
}
```

### 节点 3.3 韧性工程与混沌测试

- **关联文件/模块**：
  - `20-code-lab/`
  - `30-knowledge-base/30.8-research/tsjs-stack-panorama-2026/ERROR_HANDLING_RELIABILITY.md`
- **关键技能**：
  - 故障注入与熔断器模式
  - 降级策略与兜底 UI（Fallback UI）
  - 事后复盘（Postmortem）与故障树分析

---

## 阶段验证 Checkpoint

### Checkpoint 1：带认证 API 服务

- **项目**：实现一个带认证的 RESTful API 服务
- **代码位置**：`20-code-lab/21-api-security/authenticated-api/`
- **要求**：用户注册/登录/CRUD、JWT 认证、输入验证、速率限制
- **通过标准**：安全扫描通过 + 集成测试覆盖
- **难度**：⭐⭐⭐⭐ | **预计时间**：2 周

### Checkpoint 2：AI Agent 工作流 或 边缘函数

- **选项 A（AI Agent）**：实现一个多步 AI Agent 工作流
  - **代码位置**：`examples/ai-agent-production/`
  - **要求**：能完成多步任务（如检索 → 分析 → 生成报告）
  - **通过标准**：端到端任务成功率 ≥ 80%，含错误重试与人工介入点
- **选项 B（边缘函数）**：将 API 服务部署至边缘运行时
  - **代码位置**：`20-code-lab/32-edge-computing/edge-deployment/`
  - **要求**：冷启动 < 200ms，支持流式响应
  - **通过标准**：压力测试通过（1000 RPS，P99 < 500ms）
- **难度**：⭐⭐⭐⭐ | **预计时间**：2–3 周

### Checkpoint 3：多租户 SaaS + 可观测性

- **项目**：在 monorepo 中交付一个多租户 SaaS 核心模块
- **代码位置**：`examples/monorepo-fullstack-saas/`
- **要求**：
  - 租户隔离与权限模型
  - OpenTelemetry 接入（Trace + Metric）
  - 至少一个 SLO 定义与告警规则
  - 含一次故障演练与事后复盘文档
- **通过标准**：
  - 可观测性 dashboard 可见 3 大支柱数据
  - 故障演练中系统自动恢复或按预期降级
- **难度**：⭐⭐⭐⭐⭐ | **预计时间**：3–4 周

---

## 推荐资源

- *Designing Data-Intensive Applications* — Martin Kleppmann
- *Building Microservices* (2nd) — Sam Newman
- *Site Reliability Engineering* — Google SRE Book
- [OpenTelemetry Docs](https://opentelemetry.io/docs/)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)

---

## 权威参考链接

- [MDN — Web APIs](https://developer.mozilla.org/en-US/docs/Web/API) — 浏览器端 API 参考
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/) — Web 安全速查
- [Auth0 — JWT Handbook](https://auth0.com/resources/ebooks/jwt-handbook) — JWT 深度指南
- [OAuth 2.0 Simplified](https://aaronparecki.com/oauth-2-simplified/) — OAuth 流程图解
- [Socket.io Documentation](https://socket.io/docs/v4/) — 实时通信官方文档
- [Cloudflare Workers Runtime APIs](https://developers.cloudflare.com/workers/runtime-apis/) — 边缘运行时 API
- [OpenTelemetry JavaScript](https://opentelemetry.io/docs/languages/js/) — Node.js / 浏览器埋点
- [Prisma Documentation](https://www.prisma.io/docs) — ORM 与数据库工具
- [Drizzle ORM Docs](https://orm.drizzle.team/docs/overview) — 类型安全 SQL 构造器
- [LangChain.js](https://js.langchain.com/docs/introduction/) — LLM 应用框架
- [Vercel AI SDK](https://sdk.vercel.ai/docs) — AI 流式 UI 组件
- [Google SRE Book — Monitoring](https://sre.google/sre-book/monitoring-distributed-systems/) — 可观测性经典章节
- [CNCF Observability Whitepaper](https://github.com/cncf/tag-observability/blob/main/whitepaper.md) — 云原生可观测性白皮书
- [Martin Fowler — Microservices](https://martinfowler.com/articles/microservices.html) — 微服务定义原文

---

*最后更新: 2026-04-29*
