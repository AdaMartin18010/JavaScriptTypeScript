# 基础设置

> **定位**：`20-code-lab/20.8-edge-serverless/tanstack-start-cloudflare/01-basic-setup`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块解决 TanStack Start 在 Cloudflare 边缘平台的部署问题。涵盖 SSR、服务端函数和边缘缓存的集成。

### 1.2 形式化基础

[本模块的形式化定义与公理/定理陈述]

### 1.3 关键概念

| 概念 | 定义 | 关联 |
|------|------|------|
| SSR | 服务端渲染的流式传输 | ssr-streaming.ts |
| API 路由 | 文件系统约定的服务端端点 | api-routes.ts |
| 边缘适配器 | 将 Node.js 框架适配到边缘运行时的层 | edge-adapter.ts |

---

## 二、设计原理

### 2.1 为什么存在

TanStack Start 提供了类型安全的路由和数据层，结合 Cloudflare 的边缘计算能力，可以在全球范围提供低延迟的全栈应用体验。

### 2.2 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 边缘 SSR | 首屏快、SEO | 函数冷启动 | 内容站点 |
| CSR | 交互丰富 | 首屏慢 | 后台应用 |

### 2.3 与相关技术的对比

| 维度 | TanStack Start + Cloudflare | Next.js + Vercel | Remix + Cloudflare |
|------|---------------------------|------------------|-------------------|
| 路由类型 | 文件系统 + 配置化 | 文件系统 | 文件系统 |
| 数据层 | TanStack Query 原生集成 | Server Actions / Route Handlers | Loader/Action |
| 边缘运行时 | Cloudflare Workers | Vercel Edge Functions | Cloudflare Workers |
| 框架耦合 | 框架无关（React/Solid/Vue） | React 强耦合 | React 强耦合 |
| 包体积 | 轻量（~30KB 路由） | 较大 | 中等 |
| 流式 SSR | 原生支持 | 原生支持 | 原生支持 |
| 类型安全 | 端到端（TSRPC 风格） | 部分 | 部分 |

---

## 三、实践映射

### 3.1 从理论到代码

```typescript
// app.config.ts — TanStack Start + Cloudflare 最小配置
import { defineConfig } from '@tanstack/react-start/config';

export default defineConfig({
  server: {
    preset: 'cloudflare-pages',
    rollupConfig: {
      // 输出 Cloudflare Pages Functions 格式
      output: {
        format: 'esm',
      },
    },
  },
  tsr: {
    appDirectory: 'app',
    generatedRouteTree: 'app/routeTree.gen.ts',
    routesDirectory: 'app/routes',
  },
  vite: {
    plugins: [],
  },
});

// app/routes/__root.tsx — 根布局
import { Outlet, createRootRoute } from '@tanstack/react-router';

export const Route = createRootRoute({
  component: () => (
    <html lang="zh-CN">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <Outlet />
      </body>
    </html>
  ),
});
```

本模块的代码示例将上述理论概念映射为可运行的实现。通过实际编码练习，可以验证对 基础设置 核心机制的理解，并观察不同实现选择带来的行为差异。

### 3.2 常见误区

| 误区 | 正确理解 |
|------|---------|
| 边缘 SSR 总是比 CSR 快 | 首次加载快，但交互复杂度影响体验 |
| TanStack Start 是元框架 | Start 是路由+数据层，需配合 UI 框架 |

### 3.3 扩展阅读

- [TanStack Start](https://tanstack.com/start/latest)
- `20.8-edge-serverless/`

---

## 四、权威参考

| 资源 | 类型 | 链接 |
|------|------|------|
| TanStack Start Docs | 官方文档 | [tanstack.com/start/latest](https://tanstack.com/start/latest) |
| TanStack Router Docs | 官方文档 | [tanstack.com/router/latest](https://tanstack.com/router/latest) |
| Cloudflare Pages Functions | 官方文档 | [developers.cloudflare.com/pages/functions](https://developers.cloudflare.com/pages/functions/) |
| Vinxi (Universal Dev Server) | 源码 | [github.com/nksaraf/vinxi](https://github.com/nksaraf/vinxi) |
| Nitro (Universal Server Engine) | 官方文档 | [nitro.unjs.io](https://nitro.unjs.io/) |

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
