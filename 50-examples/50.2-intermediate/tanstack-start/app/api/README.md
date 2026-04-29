# API 路由目录

> **路径**: `50-examples/50.2-intermediate/tanstack-start/app/api/`

## 概述

此目录存放 **TanStack Start** 应用的服务端 API 路由文件。TanStack Start 采用文件系统路由约定：`app/api/` 下的每个 `.ts` 文件都会自动映射为一个 HTTP 端点，支持 `GET`、`POST`、`PUT`、`DELETE` 等标准方法，并在服务端直接执行。

这与传统的前后端分离架构不同：API 路由与前端页面共享同一套代码库和类型系统，既享受全栈类型安全，又保留了服务端渲染（SSR）与客户端渲染（CSR）的灵活性。

## 文件说明

| 文件 | 路由路径 | 作用 |
|------|----------|------|
| `hello.ts` | `/api/hello` | 示例 API，演示如何读取查询参数、模拟异步操作并返回 JSON |

## 核心概念

### 1. 创建 API 路由

使用 `createAPIFileRoute` 定义路由路径与处理器：

```ts
import { json } from '@tanstack/start';
import { createAPIFileRoute } from '@tanstack/start/api';

export const APIRoute = createAPIFileRoute('/api/hello')({
  GET: async ({ request }) => {
    // 处理逻辑...
    return json({ message: 'Hello' });
  },
});
```

### 2. 多方法支持

一个文件可同时导出 `GET`、`POST`、`PUT`、`DELETE` 等处理器，实现 RESTful 接口：

```ts
export const APIRoute = createAPIFileRoute('/api/users')({
  GET: async () => { /* 查询列表 */ },
  POST: async ({ request }) => { /* 创建资源 */ },
});
```

### 3. 常见使用场景

- **表单提交**：接收前端表单数据，进行校验后写入数据库
- **第三方 API 代理**：隐藏密钥，统一错误处理与响应格式
- **鉴权中间件**：验证 JWT / Session，保护敏感接口
- **文件上传/下载**：利用服务端流式处理大文件

## 开发规范

1. **统一返回格式**：建议使用 `json()` 辅助函数，保持响应结构一致（至少包含 `data` 与 `error` 字段）。
2. **错误处理**：使用 `try/catch` 捕获异常，返回适当的 HTTP 状态码（400 客户端错误、500 服务端错误）。
3. **类型安全**：为请求体与响应体定义 TypeScript 接口，与前端组件共享类型定义。
4. **环境变量**：敏感配置（数据库连接串、第三方 API Key）通过 `process.env` 读取，不要硬编码。

## 扩展建议

- 随着接口增多，可按资源维度拆分子目录，例如 `api/users/`、`api/orders/`。
- 可引入 `zod` 进行请求参数校验，减少手动校验代码。
- 若需要 WebSocket 或 Server-Sent Events (SSE)，TanStack Start 同样支持，可用于实时推送场景。

---

*此目录是 TanStack Start 全栈应用的服务端入口之一，负责承载所有无页面交互的后端逻辑。*
