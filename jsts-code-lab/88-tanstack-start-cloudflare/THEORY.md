# TanStack Start + Cloudflare 核心理论

> 本文件阐述 TanStack Start 在 Cloudflare Workers 平台上的核心运行原理。

---

## 1. 边缘渲染语义（Edge Rendering Semantics）

### 1.1 请求生命周期

在 Cloudflare Workers 上，TanStack Start 的渲染流程遵循以下阶段：

1. **Edge Ingress**：HTTP 请求到达最近的 Cloudflare PoP（Point of Presence）。
2. **Worker 激活**：Cloudflare Workers 运行时启动（或复用）一个 V8 Isolate，加载 TanStack Start 的服务端产物。
3. **路由解析**：TanStack Router 在 Worker 内部执行服务端路由匹配，生成匹配路径的 `RouteMatch` 数组。
4. **Loader 调度**：框架并行执行所有匹配路由的 `loader`，同时解析 `beforeLoad` 钩子。
5. **React 流式渲染**：调用 `renderToReadableStream`（Web Streams API），将 HTML Shell 立即写入响应流。
6. **Suspense 解析**：异步数据就绪后，框架通过内联 `<script>` 将 HTML 片段注入流中（React 的 streaming HTML protocol）。
7. **客户端水合**：浏览器接收完整（或渐进）HTML 后，React 执行选择性水合（Selective Hydration）。

### 1.2 边缘特性

- **零冷启动负担**：V8 Isolate 的启动时间通常在毫秒级，配合 TanStack Start 的轻量运行时，TTFB 极低。
- **请求级状态隔离**：每个请求拥有独立的 Router 实例与 Loader 上下文，不存在跨请求污染。
- **Bindings 零延迟访问**：D1、KV、R2 等 Bindings 在 Worker 所在的同数据中心内访问，网络延迟可忽略。

---

## 2. Server Function 执行模型

### 2.1 RPC 编译机制

`createServerFn` 在构建阶段被 TanStack Start 的 Vite 插件扫描并转换：

- **客户端**：`createServerFn` 的 `.handler()` 被替换为一个轻量封装，负责序列化输入参数并通过 HTTP POST/GET 调用内部 RPC 端点。
- **服务端**：原始 `.handler()` 逻辑被注册到服务端路由表中，由框架的请求处理器统一调度。

### 2.2 运行时调度

在 Cloudflare Workers 环境下：

- Server Function 与页面 SSR **共享同一个 Worker Isolate**。
- 不存在独立的 "API Server" 进程，RPC 调用本质上是 Worker 内部的函数调用（通过请求分发器模拟）。
- 因此 Server Function 可以无缝访问 `cloudflare:workers` 的 `env`，包括 Bindings 和 Secrets。

### 2.3 安全边界

- **切勿**在 `createServerFn` 中返回敏感信息（如密码哈希、内部密钥），除非经过脱敏处理。
- 对于仅在服务端执行、不希望暴露为 RPC 的工具函数，应使用 `createServerOnlyFn`（若框架版本支持）或将其抽离到独立的服务端模块中。

---

## 3. TanStack Router 类型安全路由原理

### 3.1 文件路由约定

TanStack Router 支持基于文件系统的路由约定（File-Based Routing）。在构建时，`@tanstack/react-start/plugin/vite` 扫描 `src/routes` 目录，自动生成：

- `routeTree.gen.ts`：包含所有路由节点的注册代码。
- `api.routes.ts`：类型定义文件，供 `createFileRoute` 使用。

### 3.2 类型推导链路

以 `src/routes/posts.$postId.tsx` 为例：

1. **文件路径 → 路由 ID**：`posts.$postId` 被解析为 `/posts/$postId`。
2. **参数提取**：TypeScript 模板字面量类型从路径中提取出 `postId: string`。
3. **Schema 验证**：开发者通过 `validateSearch` 传入 Zod / Valibot Schema，框架将其推导为搜索参数类型。
4. **导航类型校验**：`<Link to="/posts/$postId" params={{ postId: '123' }} />` 中，`to` 与 `params` 的组合会在编译期被校验。若 `postId` 缺失或 `to` 指向不存在的路由，TypeScript 将报错。

### 3.3 上下文类型扩展

通过 `beforeLoad` 可以向路由上下文注入自定义依赖（如 QueryClient、Auth State）：

```typescript
const rootRoute = createRootRoute({
  beforeLoad: () => {
    return { queryClient: new QueryClient() };
  },
});
```

子路由的 `loader` 可通过 `context.queryClient` 访问该实例，且类型完全推导。

---

## 4. 与 Cloudflare 平台模型的映射

| TanStack Start 概念 | Cloudflare Workers 映射 |
|---------------------|-------------------------|
| `vite dev` | `@cloudflare/vite-plugin` 启动本地 Miniflare 模拟器 |
| Server Function RPC | Worker 内部函数调用（通过请求路由器分发） |
| Route Loader | Worker 请求处理链中的数据获取阶段 |
| `env` / Bindings | Cloudflare Workers 运行时注入的平台服务句柄 |
| SSR Streaming | `renderToReadableStream` + Web Streams Response |
| `wrangler deploy` | 将构建产物上传至 Cloudflare 边缘网络 |
