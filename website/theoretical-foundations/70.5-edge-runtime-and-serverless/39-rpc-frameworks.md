---
title: 'RPC 框架与类型安全传输'
description: 'RPC Frameworks and Type-Safe Transport: tRPC v11, Hono RPC, oRPC, Connect 2.1.1, gRPC-Web, JSON-RPC 2.0, Schema Evolution'
---

# RPC 框架与类型安全传输

> 理论深度: 高级 | 目标读者: 全栈架构师、API 设计师、类型系统爱好者

## 核心观点

1. **类型安全 RPC 的三层保证**：从共享类型定义（L1）到路由级类型推断（L2）再到编译时契约验证（L3），每一层都减少运行时 schema 不匹配的风险。大多数 TypeScript 项目应至少达到 L2。

2. **tRPC 的零代码生成优势**：前后端共享同一套 TypeScript 类型，通过类型推断自动同步 API 契约，消除了 REST 中常见的"后端改字段、前端未同步"问题。适合单体全栈项目，但跨语言边界时 Protobuf 更稳定。

3. **Connect 的三协议兼容性**：同时支持 Connect Protocol（浏览器原生）、gRPC（数据中心标准）和 gRPC-Web（现有客户端兼容），是唯一能在浏览器直接运行且兼容数据中心 gRPC 的框架，无需 Envoy 代理。

4. **Schema 演化是工程必需品**：Protobuf 有严格的向后兼容性规则（安全：添加新字段；危险：修改编号/类型）；tRPC 依赖 Zod schema 的谨慎扩展。没有规划的类型变更等于 API 破坏，版本前缀和转换管道是最佳实践。

5. **Edge 环境重塑 RPC 选择**：CPU 时间限制（Cloudflare Workers 50ms/10ms）、无 Node.js 模块（不能用 grpc-js）、HTTP/2 支持有限，使得 **Hono RPC**（`hc` 零开销客户端）、Connect Protocol (JSON) 和 tRPC v11 Batch Link 成为 Edge 函数间通信的最优解。SSE 是 WebSocket 在 Edge 中的有效替代。

6. **oRPC 填补类型安全 + OpenAPI 的空白**：当团队需要编译时类型安全且必须输出 OpenAPI 3.1 文档时，oRPC 是比 "tRPC + 第三方生成器" 更简洁的选择。

## 关键概念

### 从 REST 到 RPC 的范式迁移

REST（Representational State Transfer）的设计核心是资源（Resource）和统一接口（GET/POST/PUT/DELETE）。然而，在复杂业务系统中，REST 的 CRUD 语义往往无法自然表达操作：

```
POST /orders/123/cancel    // 不是创建资源
POST /carts/merge          // 不是标准 CRUD
POST /users/123/deactivate // 部分更新，但 PATCH 语义模糊
```

RPC（Remote Procedure Call）将网络通信建模为过程调用（Procedure Call），更贴近开发者的心智模型：

```typescript
const result = await api.orders.cancel({ orderId: "123" });
const merged = await api.carts.merge({ sourceCartId: "a", targetCartId: "b" });
```

类型安全 RPC 的额外承诺：客户端调用的类型签名与服务器实现保持编译时同步，避免运行时的 schema 不匹配。当后端修改了某个字段的类型，前端会在编译阶段就发现错误，而不是在生产环境出现运行时异常。

### 类型安全的三层保证

**Level 1 — 请求/响应类型共享**：
使用共享的 TypeScript 类型定义请求体和响应体。运行时仍需序列化/反序列化，类型只在编译时检查。这是最低成本的方式，但无法保证路由路径和参数顺序的正确性。

**Level 2 — 路由级类型推断**：
路由器定义中嵌入类型，客户端根据路由自动推断参数和返回类型。tRPC 和 Connect 属于这一层。服务端修改路由结构后，客户端的调用代码会立即出现类型错误。

**Level 3 — 编译时契约验证**：
构建流程中验证客户端生成的代码是否与服务器 schema 兼容。gRPC 的 protoc 编译属于这一层。Connect 也支持这一层，因为 .proto 文件的变化会在代码生成阶段被捕获。

### tRPC v11 的架构核心

tRPC v11（2026-03 发布）的设计理念是"不要分割你的类型系统"：前后端共享同一个 TypeScript 类型定义，通过类型推断自动同步 API 契约。v11 深度集成 TanStack Query v5，并原生支持 React Server Components。

服务端定义使用 Zod 进行运行时验证和类型推断：

```typescript
const appRouter = router({
  user: router({
    getById: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(({ input }) => db.user.findById(input.id)),
  }),
});

type AppRouter = typeof appRouter;
```

客户端根据 AppRouter 类型自动推断所有路由的参数和返回值：

```typescript
const user = await trpc.user.getById.query({ id: "123" }); // 完全类型安全
```

**传输协议与批处理**：
tRPC v11 默认使用 HTTP/1.1 JSON，但支持多种传输层优化：

- **HTTP Batch Link**：在单个 tick 内收集多个查询，合并为一个 HTTP 请求。减少网络往返，但增加了首字节延迟（TTFB）。批处理窗口默认 0ms（同步收集同一事件循环内的调用）。
- **HTTP Streaming Link**：使用 HTTP/2 或 HTTP/3 的多路复用，支持服务器推送。适合订阅（Subscription）场景。
- **WebSocket Link**：全双工通信，支持真正的实时订阅。增加了连接管理复杂度（心跳、重连）。

### Hono RPC：边缘原生的类型安全客户端

**Hono** 是专为 Edge Runtime 设计的轻量 Web 框架，其 `hc`（Hono Client）提供类型安全 RPC 能力：

- **零运行时开销**：`hc` 是纯类型层，编译后无额外代码，bundle 大小接近零
- **全边缘平台支持**：Cloudflare Workers、Deno Deploy、Vercel Edge、Bun 原生兼容
- **周下载量 2.8M+**（2026），生态快速增长
- **与 tRPC 对比**：Hono RPC 更轻量，适合简单 RESTful API；tRPC v11 更适合复杂路由嵌套和中间件链

### oRPC：OpenAPI 优先的类型安全 RPC

**oRPC** 是 2026 年新兴框架，定位介于 tRPC 和 Connect 之间：

- **OpenAPI 3.1 原生输出**：自动生成标准 OpenAPI 文档，无需额外工具
- **多 schema 支持**：Zod、Valibot、ArkType 均可作为验证器
- **边缘友好**：无 Node.js 原生依赖，可在 Cloudflare Workers 和 Deno Deploy 直接运行
- **选型建议**：需要**类型安全** + **OpenAPI 文档** + **边缘部署**三者兼备时的最佳选择

### Connect RPC（2.1.1）：Protobuf 与 HTTP 的融合

Connect RPC（当前稳定版 2.1.1）独特之处在于同时支持三种传输协议，使服务端可以同时服务不同类型的客户端：

**Connect Protocol**：基于 HTTP/2 或 HTTP/3，使用标准 Content-Type（application/json 或 application/proto），支持一元调用和流式调用（Server Streaming、Client Streaming、Bidirectional Streaming）。浏览器原生可用，无需 gRPC-Web 代理。

**gRPC Protocol**：完全兼容标准 gRPC（HTTP/2 + protobuf）。服务端可同时处理 Connect 客户端和 gRPC 客户端，这意味着现有 gRPC 服务可以无缝迁移到 Connect。

**gRPC-Web Protocol**：兼容现有 gRPC-Web 客户端，通过 Connect 自己的兼容层支持，无需 Envoy 代理。

与 tRPC 的关键差异：tRPC 使用 TypeScript 原生类型 + Zod 进行运行时验证；Connect 使用 Protobuf schema，类型定义在 .proto 文件中，天然支持多语言共享。

### gRPC-Web 的限制

原生 gRPC 依赖 HTTP/2 的特性（如 trailers、流控制、二进制 framing），这些在浏览器环境中受限：
- 浏览器无法直接发送 HTTP/2 trailers（Fetch API 不支持）
- 浏览器无法直接控制 HTTP/2 流的优先级

gRPC-Web 的解决方案需要代理层（Envoy、grpcwebproxy 或 Connect）将 gRPC-Web 翻译为标准 gRPC。

关键限制：不支持 Client Streaming / Bidirectional Streaming（浏览器 Fetch API 限制）。这意味着某些 gRPC 服务（如文件上传、实时双向通信）无法直接通过 gRPC-Web 暴露给浏览器。

### JSON-RPC 2.0：轻量级替代

JSON-RPC 2.0 是一个极简的 RPC 协议，无代码生成，无 schema 文件：

```json
{"jsonrpc": "2.0", "method": "user.getById", "params": {"id": "123"}, "id": 1}
```

关键特性：
- **通知（Notification）**：无 id 字段的请求，不期望响应（如日志上报）
- **批量调用（Batch）**：数组形式的请求，原子执行
- **错误编码**：标准化的错误码（-32700 解析错误、-32600 无效请求等）

优势：极轻量、通用性（任何支持 JSON 的客户端/服务器都可以互操作）、调试友好（curl 可直接调用）。
劣势：无原生类型安全，需使用 JSON Schema 或 Zod 手动添加类型检查。

### Schema 演化与版本兼容性

**Protobuf 的向后兼容性规则**：
安全变更：添加新字段（使用新的字段编号）、将字段标记为 optional、添加 reserved 标记回收旧字段编号。
破坏性变更：修改现有字段的编号、修改字段类型（如 int32 → string）、删除字段（除非所有客户端已升级）。

**tRPC 的演化挑战**：
tRPC 不使用显式 schema 文件，演化依赖于 TypeScript 的类型系统。安全模式是在输入解析器中使用 .optional() 或 .default()；风险模式是直接修改 z.object() 的形状，导致旧客户端编译失败。

最佳实践：使用 API 版本前缀（api.v1.user.get → api.v2.user.get）；在 Zod schema 中使用 .transform() 和 .pipe() 进行向后兼容的数据转换。

### Edge 场景下的 RPC 优化

在 Edge Runtime 中，RPC 调用面临特殊约束：
- **CPU 时间限制**：Cloudflare Workers 50ms/10ms，不适合复杂序列化
- **无 Node.js 模块**：不能直接使用 @grpc/grpc-js（依赖原生模块）
- **HTTP/2 支持有限**：部分 Edge Runtime 仅支持 HTTP/1.1 fetch

优化策略：
- 使用 Connect Protocol 的 JSON 模式（无需 protobuf 编译器，纯 TypeScript）
- 启用 tRPC 的 HTTP Batch Link，减少请求数
- 对高频调用使用 Edge Config 或 KV 缓存响应
- 传统 WebSocket 订阅的替代方案：Server-Sent Events（SSE）通过 HTTP 流推送，无需 WebSocket 握手，兼容 Edge 函数

### REST vs RPC vs GraphQL 的对称差分析

| 维度 | REST | RPC (tRPC/Connect) | GraphQL |
|------|------|-------------------|---------|
| 核心抽象 | 资源（URL） | 过程/操作 | 图查询 |
| 类型安全 | 无（OpenAPI 可补充） | 编译时类型安全 | Schema 类型安全 |
| 版本控制 | URL 版本（/v1/） | Schema 演化/路由版本 | Schema 演化（弃用字段） |
| 批量获取 | 多次 HTTP 请求 | Batch Link 合并 | 单次查询嵌套获取 |
| 实时更新 | WebSocket/SSE 手动实现 | Subscription 原生支持 | Subscription 支持 |
| 缓存策略 | HTTP Cache 成熟 | 需自定义缓存键 | 需 Apollo/Relay 缓存 |
| 浏览器兼容 | 完美 | gRPC-Web 需代理 | 完美 |
| Edge 运行 | 完美 | Connect Protocol 完美 | 需查询解析，CPU 消耗大 |
| 学习曲线 | 低 | 中（需理解路由器） | 高（需理解 Schema/Resolver）|

**选择指南**：公共 API 暴露优先 REST + OpenAPI；全栈 TypeScript 单体优先 tRPC；多语言微服务优先 Connect + Protobuf；复杂数据图查询需求优先 GraphQL。

## 工程决策矩阵

| 场景 | 推荐方案 | 理由 | 风险 |
|------|---------|------|------|
| 全栈 TypeScript 单体应用 | tRPC v11 | 端到端类型安全，TanStack Query v5 深度集成，RSC 原生支持 | 与外部系统（非 TS）集成困难 |
| 多语言微服务 | Connect + Protobuf | Protobuf 跨语言，gRPC/Connect/Web 三协议兼容 | 需要 .proto 文件管理流程 |
| 浏览器直接调用数据中心 gRPC | gRPC-Web + Envoy | 利用现有 gRPC 服务 | 仅支持 Unary + Server Streaming |
| 极简 IoT/嵌入式客户端 | JSON-RPC 2.0 | 极轻量，无代码生成 | 无原生类型安全，需手动校验 |
| Edge 函数间通信 | Hono RPC (`hc`) | 零运行时开销，全边缘平台原生支持 | 功能较简单，无复杂中间件链 |
| 实时协作应用 | tRPC v11 Subscriptions / SSE | 内置订阅支持，类型安全 | WebSocket 在 Edge 环境受限 |
| 第三方 API 暴露 | oRPC / REST + OpenAPI | 类型安全 + 自动 OpenAPI 3.1 输出 | 新兴框架，社区资源较少 |
| 复杂数据图查询 | GraphQL | 客户端控制返回字段，减少 over-fetch | 服务器解析开销大，缓存复杂 |

## TypeScript 示例

### tRPC 路由类型提取

```typescript
import { initTRPC } from '@trpc/server';

const t = initTRPC.create();

const appRouter = t.router({
  user: t.router({
    getById: t.procedure
      .input((val: unknown) => {
        if (typeof val === 'object' && val !== null && 'id' in val) return val as { id: string };
        throw new Error('Invalid input');
      })
      .query(({ input }) => ({ id: input.id, name: 'Alice' })),
  }),
});

type AppRouter = typeof appRouter;
// AppRouter 类型自动导出给客户端，客户端调用时获得完整类型推断
```

### JSON-RPC 2.0 客户端

```typescript
interface JSONRPCRequest {
  jsonrpc: '2.0';
  method: string;
  params?: unknown;
  id?: string | number | null;
}

interface JSONRPCResponse {
  jsonrpc: '2.0';
  result?: unknown;
  error?: { code: number; message: string };
  id: string | number | null;
}

class JSONRPCClient {
  private idCounter = 0;
  constructor(private endpoint: string) {}

  async call<T>(method: string, params?: unknown): Promise<T> {
    const id = ++this.idCounter;
    const request: JSONRPCRequest = { jsonrpc: '2.0', method, params, id };
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    const data: JSONRPCResponse = await response.json();
    if (data.error) throw new Error(`JSON-RPC Error ${data.error.code}: ${data.error.message}`);
    return data.result as T;
  }
}
```

### RPC 批处理调度器

```typescript
interface PendingCall {
  method: string;
  params: unknown;
  resolve: (value: unknown) => void;
  reject: (error: Error) => void;
}

class RPCBatcher {
  private queue: PendingCall[] = [];
  private timeout: ReturnType<typeof setTimeout> | null = null;

  constructor(private endpoint: string) {}

  call(method: string, params: unknown): Promise<unknown> {
    return new Promise((resolve, reject) => {
      this.queue.push({ method, params, resolve, reject });
      if (!this.timeout) this.timeout = setTimeout(() => this.flush(), 10);
    });
  }

  private async flush() {
    this.timeout = null;
    if (this.queue.length === 0) return;
    const batch = this.queue.splice(0);
    const payload = batch.map((call, index) => ({
      jsonrpc: '2.0', method: call.method, params: call.params, id: index,
    }));

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const results = await response.json();
      for (const result of Array.isArray(results) ? results : [results]) {
        const call = batch[result.id];
        if (result.error) call.reject(new Error(result.error.message));
        else call.resolve(result.result);
      }
    } catch (err) {
      batch.forEach(call => call.reject(err as Error));
    }
  }
}
```

### Protobuf 兼容性检查器

```typescript
interface ProtoField { number: number; name: string; type: string; }
interface ProtoMessage { name: string; fields: ProtoField[]; }

class ProtoCompatibilityChecker {
  check(oldMsg: ProtoMessage, newMsg: ProtoMessage): string[] {
    const issues: string[] = [];
    const oldFields = new Map(oldMsg.fields.map(f => [f.number, f]));
    const newFields = new Map(newMsg.fields.map(f => [f.number, f]));

    for (const [num, field] of oldFields) {
      if (!newFields.has(num)) issues.push(`Field ${field.name} (#${num}) deleted`);
    }

    for (const [num, newField] of newFields) {
      const oldField = oldFields.get(num);
      if (oldField && oldField.type !== newField.type) {
        issues.push(`Field ${newField.name} (#${num}) changed type`);
      }
    }

    return issues;
  }
}
```

### 常见陷阱

**tRPC 的版本锁定**：tRPC 的路由类型深度耦合在 monorepo 中。拆分单体为微服务时，无法优雅地跨仓库共享类型（除非发布 npm 包）。tRPC 最适合单体全栈 TS 项目，跨服务边界时 Protobuf 更稳定。

**Protobuf 的 JSON 互操作陷阱**：`int64` 在 JSON 中可能丢失精度（JavaScript number 最大安全整数为 2^53-1）；`bytes` 在 JSON 中编码为 base64，增加 33% 体积；字段名在 JSON 中使用 camelCase，protobuf 使用 snake_case，需要显式配置。

**RPC 的"本地调用幻觉"**：本地调用耗时 < 1μs，RPC 调用耗时 > 10ms（跨地域 > 100ms）。在循环中调用 RPC 会导致性能灾难（N+1 问题）。缓解：使用 DataLoader 批量获取、断路器防止级联故障、显式超时配置。

## 延伸阅读

- [完整理论文档](../../70-theoretical-foundations/70.5-edge-runtime-and-serverless/39-rpc-frameworks.md)
- [Edge Runtime 架构](../70.4-web-platform-fundamentals/34-edge-runtime-architecture.md)
- [WebSocket 与实时协议](../70.4-web-platform-fundamentals/23-websocket-and-realtime-protocols.md)
