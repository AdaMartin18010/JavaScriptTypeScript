---
title: '同构渲染与 Edge SSR'
description: 'RSC, Islands Architecture, Qwik Resumability, Edge SSR caching, and streaming HTML analysis'
---

# 同构渲染与 Edge SSR

> 理论深度: 高级 | 目标读者: 前端架构师、全栈开发者、性能工程师

## 核心观点

1. **Hydration 是纯开销**：客户端重新执行服务器已完成的计算，产生下载、解析、执行三重税。现代架构从正交角度攻击这一冗余。

2. **RSC 消除客户端 JS**：React Server Components 在服务器执行数据获取和渲染，仅将序列化结果传输到客户端，Server Components 零客户端 JavaScript 负担。

3. **Islands 最小化水合面**：Astro 等框架只水合页面中的「交互岛屿」，静态海洋保持零 JS，典型页面初始加载可低至 1–18KB。

4. **Qwik 彻底消除 Hydration**：通过序列化应用状态和事件处理器闭包，实现「Resume」而非「Hydrate」，初始仅需 ~1KB 的 Qwikloader。

5. **Edge SSR 的缓存是核心挑战**：HTML 的 stale-while-revalidate 比 API JSON 更复杂，需要精细的缓存键构造、片段缓存策略和流式语义处理。

## 关键概念

### React Server Components (RSC)

RSC 的核心不变式绝对严格：**Server Components 只在服务器执行；Client Components 只在客户端执行**。这一边界带来了深远的架构影响：

- Server Component 可以直接访问数据库、文件系统和内部 API，无需序列化边界——数据从未离开服务器进程
- Client Component 不能导入 Server Component，必须通过 props 或 children 接收服务器计算内容
- 当 Server Component 渲染 Client Component 时，它序列化的不是执行结果，而是一个「客户端引用」——`(moduleId, exportName, props)` 元组

构建系统维护两个独立的模块图：
- **Server Module Graph (SMG)**：包含所有 Server Components 及其服务器端依赖，永不发送到客户端
- **Client Module Graph (CMG)**：包含所有 Client Components 及其客户端依赖，bundler 生成 chunk URL 映射表

**Flight 协议**是 RSC 的流式传输格式，不是 JSON，而是支持去重、反向引用、Promise 流式和客户端指令交织的结构化流：

| 行类型 | 含义 |
|--------|------|
| `J` | JSON 值（原始 props、数组、对象） |
| `S` | 去重字符串（首次发射，后续引用） |
| `E` | React 元素（组件引用 + props） |
| `C` | 客户端引用（`moduleId:exportName`） |
| `L` | 懒加载 / Promise（占位符，解析后追加） |
| `I` | 导入指令（预加载客户端 chunk） |

Flight 的去重机制通过身份比较（`===`）检测相同对象引用，只序列化一次，保持客户端的引用相等性——这对 `useMemo` 依赖和 `React.memo` 比较至关重要。

### Islands Architecture

Astro 推广的 Islands 架构将页面分为两个区域：

- **Static Sea**：服务器渲染的 HTML，永不在客户端执行 JS。包括导航、布局、内容区域等。
- **Interactive Islands**：自包含的交互组件，携带自己的 JS payload，彼此独立。

Astro 支持 **framework-agnostic islands**：同一页面可混合 React、Vue、Svelte、Preact、Solid 组件。每个 island 只捆绑该 island 的框架运行时和依赖。

**部分水合指令谱系**：

| 指令 | 触发条件 | 适用场景 |
|------|---------|----------|
| `client:load` | 页面加载立即执行 | 首屏交互内容 |
| `client:idle` | `requestIdleCallback` | 非关键交互 |
| `client:visible` | `IntersectionObserver` 进入视口 | 折叠下方组件 |
| `client:media` | CSS 媒体查询匹配 | 响应式组件 |
| `client:only` | 永不服务器渲染 | 需浏览器 API 的组件 |

跨岛通信通过 Nano Stores（~300B，基于 `CustomEvent`）或 URL 状态实现。Astro 的静态海洋天然最大化缓存效率。

### Qwik Resumability

Qwik 的激进创新是**完全消除 Hydration 概念**。服务器将完整应用状态、事件处理器引用和组件边界序列化为 HTML 中的 JSON。客户端从不水合整个页面，只在用户交互时「恢复」执行。

关键机制：

- **`$` 后缀约定**：标记客户端执行的函数（`onClick$`），编译器提取为独立懒加载 chunk
- **Qwikloader**：~1KB 的内联脚本，使用事件委托在 `document` 层捕获所有事件
- **符号引用**：`on:click="./chunk-a.js#Button_onClick_abc123"`，内容哈希支持长期缓存
- **无组件实例**：没有 `this`、生命周期方法或初始化时的虚拟 DOM 协调

**Hydration 光谱对比**（以内容型页面为例）：

| 架构 | 初始 JS | 框架运行时 | Hydration Tax |
|------|--------:|-----------:|--------------:|
| 传统 SSR + Hydration | 180KB | React 42KB | 100% |
| RSC + App Router | 85KB | React 42KB | ~40% |
| Astro Islands (Preact) | **18KB** | Preact 10KB | 3 islands |
| Qwik | **1KB** | Qwikloader 1KB | **0%** |

Qwik 的总交互大小是用户行为的函数——用户与所有三个 widget 交互可能下载 15KB，仍远低于其他方案。

### Edge SSR 与缓存策略

Edge SSR 将渲染逻辑放在 CDN 边缘节点，相比源站 SSR 的核心权衡：

| 维度 | 源站 SSR | Edge SSR |
|------|----------|----------|
| 用户延迟 | 50–300ms | **5–50ms** |
| 数据库延迟 | <1–10ms | 50–300ms |
| 计算能力 | 多核、GB 级内存 | 单核、MB 级内存 |
| 缓存粒度 | 页面级 | 组件/子页面级 |
| 有状态会话 | 容易（sticky sessions） | 困难（分布式状态） |

**Stale-While-Revalidate (SWR) for HTML**：边缘节点收到请求后立即返回缓存的 HTML（即使略过期），同时异步重新渲染或回源获取最新版本。缓存键必须包含 URL path、locale、设备类型、A/B 分组、认证状态等所有变体维度。

**流式缓存困境**：
- 缓冲完整流再缓存 → 失去 TTFB 优势
- 只缓存 shell（到第一个 Suspense 边界）→ 保持 TTFB，动态内容始终流式
- 片段缓存 → 实验性，依赖框架支持（Cloudflare HTML rewriter）

**Streaming HTML 与 Suspense**：
- HTTP/2 多路复用消除队头阻塞，HTTP/3 (QUIC) 的独立流拥塞控制对移动网络丢包尤其有益
- React 使用 `<!--$?-->...<!--/$-->` 标记 Suspense 边界
- Out-of-order streaming：后面边界先解析完成时，服务器可立即发射其 HTML，通过 `$RC("id", "html")` 脚本替换占位符

### Server Actions 与 RPC 模式

现代框架将服务器端 mutation 暴露为类型安全的 RPC 接口：

- **Next.js Server Actions**：`'use server'` 标记的异步函数，客户端直接导入调用。支持渐进增强（JS 禁用时表单标准 POST 提交）。
- **Remix Loaders/Actions**：每个页面有 `loader`（GET）和 `action`（POST/PUT/DELETE），基于 Web Fetch API 的纯函数 `Request → Response`。
- **缓存失效**：Next.js 用 `revalidatePath()`/`revalidateTag()`；Remix 自动重新获取当前路由的所有 loaders。

安全考量：Server Actions 必须每次重新验证用户身份和权限；CSRF 通过自定义头或嵌入 token 缓解；参数反序列化需白名单防止原型污染。

## 工程决策矩阵

| 评估维度 | 权重 | Next.js App Router | Astro Islands | Qwik | Remix + Edge |
|---------|------|:------------------:|:-------------:|:----:|:------------:|
| TTFB 性能 | 0.20 | 4 | 5 | 5 | 4 |
| TTI 性能 | 0.20 | 4 | 4 | 5 | 3 |
| 缓存效率 | 0.15 | 3 | 5 | 5 | 3 |
| 动态内容支持 | 0.15 | 5 | 2 | 3 | 4 |
| 交互密度 | 0.10 | 4 | 2 | 3 | 4 |
| 开发者体验 | 0.10 | 3 | 4 | 3 | 4 |
| 迁移成本 | 0.10 | 2 | 4 | 1 | 3 |
| **加权得分** | 1.00 | **3.75** | **3.75** | **3.70** | **3.55** |

**选型启发式：**

- **Next.js App Router**：数据密集型、深度服务器/客户端集成、团队已投入 React、Streaming Suspense 有明确 UX 收益
- **Astro Islands**：内容型站点（营销、文档、博客）、稀疏交互、最大缓存效率、框架灵活性
- **Qwik**：性能绝对优先（电商、媒体）、多入口但典型用户仅交互少量功能、长期缓存单个符号有价值
- **Remix**：Web 标准合规和边缘部署关键、渐进增强不可妥协、复杂表单工作流、偏好显式数据流

## TypeScript 示例

### Edge SSR 缓存验证器

```typescript
interface CachePolicy {
  maxAge: number;
  staleWhileRevalidate: number;
  tags: string[];
  vary: string[];
}

class EdgeSSRCacheValidator {
  constructor(private cache: Cache) {}

  private normalizeKey(req: Request): string {
    const url = new URL(req.url);
    url.searchParams.sort();
    ['utm_source', 'utm_medium', 'fbclid', 'gclid'].forEach(p => url.searchParams.delete(p));

    let key = url.pathname + url.search;
    for (const header of ['Accept-Language', 'X-Device-Type']) {
      const value = req.headers.get(header);
      if (value) key += `|${header}=${value.split(',')[0].trim()}`;
    }
    return key;
  }

  async lookup(req: Request): Promise<
    | { status: 'fresh'; response: Response }
    | { status: 'stale'; response: Response; revalidate: () => Promise<void> }
    | { status: 'miss' }
  > {
    const key = this.normalizeKey(req);
    const cached = await this.cache.match(`https://cache.internal/${key}`);
    if (!cached) return { status: 'miss' };

    const storedAt = parseInt(cached.headers.get('X-Stored-At') || '0', 10);
    const policy: CachePolicy = JSON.parse(cached.headers.get('X-Policy') || '{}');
    const age = (Date.now() - storedAt) / 1000;

    if (age < policy.maxAge) {
      return { status: 'fresh', response: this.sanitize(cached) };
    }
    if (age < policy.maxAge + policy.staleWhileRevalidate) {
      return {
        status: 'stale',
        response: this.sanitize(cached),
        revalidate: async () => { /* background refresh */ },
      };
    }
    return { status: 'miss' };
  }

  async store(req: Request, response: Response, policy: CachePolicy): Promise<void> {
    const headers = new Headers(response.headers);
    headers.set('X-Stored-At', Date.now().toString());
    headers.set('X-Policy', JSON.stringify(policy));
    await this.cache.put(
      `https://cache.internal/${this.normalizeKey(req)}`,
      new Response(response.body, { status: response.status, headers })
    );
  }

  private sanitize(response: Response): Response {
    const headers = new Headers(response.headers);
    headers.delete('X-Stored-At');
    headers.delete('X-Policy');
    return new Response(response.body, { status: response.status, headers });
  }
}
```

### Islands 水合调度器

```typescript
type IslandDirective = 'load' | 'idle' | 'visible' | 'media' | 'event';

interface Island {
  id: string;
  directive: IslandDirective;
  element: HTMLElement;
  hydrate: () => Promise<void>;
  dependencies: string[];
}

class IslandsHydrationScheduler {
  private islands = new Map<string, Island>();
  private hydrated = new Set<string>();
  private observers = new Map<string, IntersectionObserver>();

  register(island: Island): void {
    this.islands.set(island.id, island);
  }

  start(): void {
    for (const island of this.islands.values()) {
      this.scheduleIsland(island);
    }
  }

  destroy(): void {
    for (const observer of this.observers.values()) observer.disconnect();
    this.observers.clear();
  }

  private scheduleIsland(island: Island): void {
    switch (island.directive) {
      case 'load':
        this.hydrateWhenReady(island);
        break;
      case 'idle': {
        const handler = () => this.hydrateWhenReady(island);
        if ('requestIdleCallback' in window) {
          requestIdleCallback(handler, { timeout: 2000 });
        } else {
          setTimeout(handler, 200);
        }
        break;
      }
      case 'visible': {
        const observer = new IntersectionObserver(([entry]) => {
          if (entry.isIntersecting) {
            observer.unobserve(entry.target);
            this.hydrateWhenReady(island);
          }
        }, { rootMargin: '100px' });
        observer.observe(island.element);
        this.observers.set(island.id, observer);
        break;
      }
      case 'media': {
        const query = window.matchMedia('(min-width: 768px)');
        if (query.matches) this.hydrateWhenReady(island);
        else query.addEventListener('change', (e) => { if (e.matches) this.hydrateWhenReady(island); });
        break;
      }
    }
  }

  private async hydrateWhenReady(island: Island): Promise<void> {
    const pending = island.dependencies.filter(d => !this.hydrated.has(d));
    if (pending.length > 0) {
      await new Promise<void>(resolve => {
        const check = () => {
          if (pending.every(d => this.hydrated.has(d))) resolve();
          else setTimeout(check, 50);
        };
        check();
      });
    }
    if (this.hydrated.has(island.id)) return;
    await island.hydrate();
    this.hydrated.add(island.id);
  }
}
```

### Server Action 路由器

```typescript
type SerializableArg = string | number | boolean | null | SerializableArg[] | { [k: string]: SerializableArg };
type ActionHandler<TArgs extends SerializableArg[], TReturn> = (
  ctx: { request: Request; user?: { id: string; roles: string[] } },
  ...args: TArgs
) => Promise<TReturn>;
type Middleware = (ctx: any, next: () => Promise<Response>) => Promise<Response>;

class ServerActionRouter {
  private actions = new Map<string, { handler: ActionHandler<any, any>; middleware: Middleware[]; cacheTags?: string[] }>();
  private globalMiddleware: Middleware[] = [];

  use(mw: Middleware): void { this.globalMiddleware.push(mw); }

  register<TArgs extends SerializableArg[], TReturn>(
    id: string,
    handler: ActionHandler<TArgs, TReturn>,
    options: { middleware?: Middleware[]; cacheTags?: string[] } = {}
  ): void {
    this.actions.set(id, { handler, middleware: options.middleware ?? [], cacheTags: options.cacheTags });
  }

  async handle(request: Request): Promise<Response> {
    try {
      const json = await request.json();
      const action = this.actions.get(json.actionId);
      if (!action) return Response.json({ error: 'Unknown action' }, { status: 404 });

      const ctx = { request };
      const chain = [...this.globalMiddleware, ...action.middleware];
      let index = 0;

      const next = async (): Promise<Response> => {
        if (index < chain.length) return chain[index++](ctx, next);
        const result = await action.handler(ctx, ...json.args);
        return Response.json({ result, invalidatedTags: action.cacheTags });
      };

      return await next();
    } catch (err) {
      return Response.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 500 });
    }
  }

  createCaller<TArgs extends SerializableArg[], TReturn>(actionId: string) {
    return async (...args: TArgs): Promise<TReturn> => {
      const res = await fetch('/api/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionId, args }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data.result;
    };
  }
}
```

## 延伸阅读

- [完整理论文档](../../70-theoretical-foundations/70.5-edge-runtime-and-serverless/36-isomorphic-rendering-and-edge-ssr.md)
- [Edge Runtime 架构对比](./34-edge-runtime-architecture.md)
- [Edge 数据库与状态管理](./37-edge-databases.md)
- [React Server Components RFC](https://github.com/reactjs/rfcs/blob/main/text/0188-server-components.md)
- [Qwik 官方文档](https://qwik.dev/)
- [Astro Islands 架构](https://docs.astro.build/en/concepts/islands/)
- [Next.js Partial Pre-rendering](https://nextjs.org/docs/app/building-your-application/rendering/partial-prerendering)
- [Remix Web Standard Philosophy](https://remix.run/docs/en/main/discussion/introduction)
