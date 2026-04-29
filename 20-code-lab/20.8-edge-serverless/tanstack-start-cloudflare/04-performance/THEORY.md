# 性能优化

> **定位**：`20-code-lab/20.8-edge-serverless/tanstack-start-cloudflare/04-performance`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块解决 TanStack Start 在 Cloudflare 边缘平台的性能优化问题。涵盖流式 SSR、边缘缓存策略、代码分割与资源预加载。

### 1.2 形式化基础

[本模块的形式化定义与公理/定理陈述]

### 1.3 关键概念

| 概念 | 定义 | 关联 |
|------|------|------|
| 流式 SSR | 分块传输 HTML，优先渲染关键内容 | streaming-ssr.ts |
| 边缘缓存 | CDN 级别响应缓存与失效 | edge-cache.ts |
|  islands 架构 | 选择性 hydration 降低 JS 负载 | islands.ts |

---

## 二、设计原理

### 2.1 为什么存在

边缘环境资源受限（128MB 内存、50ms CPU 限制），需要通过流式传输、智能缓存和选择性 hydration 最大化用户体验。

### 2.2 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 流式 SSR | 首字节快 | 代码复杂度高 | 大页面 |
| 边缘缓存 | 毫秒级响应 | 动态内容难缓存 | 静态片段 |
| Islands | JS 包小 | 交互区延迟 | 内容为主站点 |

### 2.3 与相关技术的对比

| 维度 | TanStack Start 流式 | Next.js Streaming | Remix Deferred | Astro Islands |
|------|--------------------|-------------------|----------------|---------------|
| 流式粒度 | 路由级 + 组件级 | 组件级（Suspense） | Loader 级 | 页面级 |
| 边缘原生 | 是（Vinxi 适配） | 是（Edge Runtime） | 是 | 是 |
| 选择性 Hydration | 手动标记 | React Server Components | 手动（defer） | 自动（Islands） |
| 打包策略 | Vite（ESM） | Webpack/Turbopack | Vite（ESM） | Vite（ESM） |
| 瀑布请求 | 可消除 | 依赖 Suspense | 可消除 | 无（MPA） |
| 总 Blocking Time | 低 | 中 | 低 | 极低 |

---

## 三、实践映射

### 3.1 从理论到代码

```typescript
// performance/edge-cache.ts — Cloudflare 边缘缓存策略
import { createServerFn } from '@tanstack/react-start';

interface CacheConfig {
  ttlSeconds: number;
  staleWhileRevalidate?: number;
  varyBy?: string[];
}

export const createCachedServerFn = <T>(
  config: CacheConfig,
  handler: () => Promise<T>
) => {
  return createServerFn({ method: 'GET' }).handler(async () => {
    const env = process.env as unknown as Env;
    const cacheKey = `cache:${config.varyBy?.join(':') ?? 'default'}`;

    // KV 边缘缓存层
    const cached = await env.CACHE_KV.get(cacheKey);
    if (cached) {
      const { data, expiredAt } = JSON.parse(cached) as { data: T; expiredAt: number };
      if (Date.now() < expiredAt) return data;
      // stale-while-revalidate 背景刷新
      env.CACHE_KV.put(cacheKey, JSON.stringify({ data: await handler(), expiredAt: Date.now() + config.ttlSeconds * 1000 }));
      return data;
    }

    const data = await handler();
    await env.CACHE_KV.put(
      cacheKey,
      JSON.stringify({ data, expiredAt: Date.now() + config.ttlSeconds * 1000 }),
      { expirationTtl: config.ttlSeconds + (config.staleWhileRevalidate ?? 0) }
    );
    return data;
  });
};

// 使用：自动缓存的 API
export const getProducts = createCachedServerFn(
  { ttlSeconds: 60, staleWhileRevalidate: 300, varyBy: ['products'] },
  async () => {
    const env = process.env as unknown as Env;
    const { results } = await env.DB.prepare('SELECT * FROM products').all();
    return results;
  }
);

// streaming-ssr.tsx — 流式组件边界
import { Suspense } from 'react';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <>
      <h1>Dashboard</h1>
      {/* 关键内容优先渲染 */}
      <StatsPanel />
      {/* 非关键内容流式延迟加载 */}
      <Suspense fallback={<Skeleton />}>
        <ActivityFeed />
      </Suspense>
    </>
  );
}
```

本模块的代码示例将上述理论概念映射为可运行的实现。通过实际编码练习，可以验证对 性能优化 核心机制的理解，并观察不同实现选择带来的行为差异。

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
| Cloudflare Cache API | 官方文档 | [developers.cloudflare.com/workers/runtime-apis/cache](https://developers.cloudflare.com/workers/runtime-apis/cache/) |
| Web Vitals | 官方指南 | [web.dev/vitals](https://web.dev/vitals/) |
| React Streaming SSR | 官方文档 | [react.dev/reference/react-dom/server/renderToPipeableStream](https://react.dev/reference/react-dom/server/renderToPipeableStream) |
| Astro Islands Architecture | 官方文档 | [docs.astro.build/en/concepts/islands](https://docs.astro.build/en/concepts/islands/) |
| TanStack Query Caching | 官方文档 | [tanstack.com/query/latest/docs/framework/react/guides/caching](https://tanstack.com/query/latest/docs/framework/react/guides/caching) |
| Core Web Vitals LCP Optimization | 指南 | [web.dev/optimize-lcp](https://web.dev/optimize-lcp/) |

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
