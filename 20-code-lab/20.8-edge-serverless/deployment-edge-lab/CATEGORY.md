---
dimension: 综合
sub-dimension: Deployment edge lab
created: 2026-04-28
---

# 模块归属声明

本模块归属 **「综合」** 维度，聚焦 Deployment edge lab 核心概念与工程实践。

## 包含内容

- 本模块聚焦 deployment edge lab 核心概念与工程实践。
- 涵盖 Cloudflare Worker、Vercel Edge Config 与 Docker 边缘优化部署模式。

## 子模块速查

| 子模块 | 类型 | 说明 |
|--------|------|------|
| ARCHITECTURE.md | 文档 | 边缘部署架构设计 |
| README.md | 文档 | 模块入口与快速开始 |
| THEORY.md | 文档 | 边缘部署理论形式化定义 |
| cloudflare-worker.ts | 源码 | Cloudflare Worker 部署模板 |
| docker-optimize.ts | 源码 | 边缘容器体积优化 |
| vercel-edge-config.ts | 源码 | Vercel Edge Config 集成 |
| index.ts | 源码 | 模块统一导出 |

## 代码示例

```typescript
// cloudflare-worker.ts — 类型安全边缘 Worker
export interface Env {
  KV_NAMESPACE: KVNamespace;
  ASSETS: Fetcher;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const cacheKey = new Request(url.toString(), request);
    const cache = caches.default;

    // 边缘缓存优先
    let response = await cache.match(cacheKey);
    if (response) return response;

    // KV 回源
    const html = await env.KV_NAMESPACE.get(`page:${url.pathname}`);
    if (html) {
      response = new Response(html, { headers: { 'Content-Type': 'text/html' } });
      ctx.waitUntil(cache.put(cacheKey, response.clone()));
      return response;
    }

    return env.ASSETS.fetch(request);
  },
};
```

### Vercel Edge Config 动态配置

```typescript
// vercel-edge-config.ts — 边缘动态配置与特性开关
import { get } from '@vercel/edge-config';

interface FeatureFlags {
  enableBetaUI: boolean;
  maxItemsPerPage: number;
  maintenanceMode: boolean;
}

export async function getFeatureFlags(): Promise<FeatureFlags> {
  const defaults: FeatureFlags = {
    enableBetaUI: false,
    maxItemsPerPage: 20,
    maintenanceMode: false,
  };

  const [beta, max, maintenance] = await Promise.all([
    get<boolean>('enableBetaUI'),
    get<number>('maxItemsPerPage'),
    get<boolean>('maintenanceMode'),
  ]);

  return {
    enableBetaUI: beta ?? defaults.enableBetaUI,
    maxItemsPerPage: max ?? defaults.maxItemsPerPage,
    maintenanceMode: maintenance ?? defaults.maintenanceMode,
  };
}

// Vercel Edge Middleware 中使用
export async function middleware(request: Request) {
  const flags = await getFeatureFlags();
  if (flags.maintenanceMode) {
    return new Response('Under maintenance', { status: 503 });
  }
  // 继续处理...
}
```

### Hono 边缘框架路由示例

```typescript
// hono-edge.ts — 基于 Hono 的边缘 API 路由
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { cache } from 'hono/cache';
import type { Env } from './cloudflare-worker';

const app = new Hono<{ Bindings: Env }>();

app.use('*', cors());

app.get('/api/health', (c) => c.json({ status: 'ok', region: c.req.raw.cf?.colo }));

app.get(
  '/api/posts/:id',
  cache({
    cacheName: 'posts',
    cacheControl: 'max-age=3600',
  }),
  async (c) => {
    const id = c.req.param('id');
    const cached = await c.env.KV_NAMESPACE.get(`post:${id}`);
    if (cached) return c.json(JSON.parse(cached));

    // 模拟数据库查询
    const post = { id, title: `Post ${id}`, content: '...' };
    c.executionCtx.waitUntil(
      c.env.KV_NAMESPACE.put(`post:${id}`, JSON.stringify(post), { expirationTtl: 3600 })
    );
    return c.json(post);
  }
);

app.post('/api/webhook', async (c) => {
  const payload = await c.req.json();
  // 异步处理 webhook
  c.executionCtx.waitUntil(processWebhook(payload, c.env));
  return c.json({ received: true });
});

async function processWebhook(payload: unknown, env: Env): Promise<void> {
  console.log('Processing webhook:', payload);
  // 触发下游服务或重放事件
}

export default app;
```

### Docker 边缘多阶段构建优化

```typescript
// docker-optimize.ts — 生成最小边缘容器配置
interface DockerBuildConfig {
  baseImage: string;
  entrypoint: string;
  layers: string[];
}

function generateOptimizedDockerfile(config: DockerBuildConfig): string {
  return `
# 阶段 1: 构建
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# 阶段 2: 最小运行时
FROM gcr.io/distroless/nodejs20-debian12
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY ${config.entrypoint} ./
EXPOSE 3000
CMD ["${config.entrypoint.replace('.js', '')}"]
`.trim();
}

// 针对边缘设备的 wasm 运行时配置
function generateWasmRuntimeConfig(): string {
  return `
# wasm-edge-runtime
FROM scratch
COPY --from=builder /app/dist/main.wasm /main.wasm
ENTRYPOINT ["/main.wasm"]
`.trim();
}
```

### Deno Deploy 边缘函数

```typescript
// deno-deploy.ts — Deno Deploy 边缘部署模板
import { serve } from 'https://deno.land/std@0.200.0/http/server.ts';

const kv = await Deno.openKv();

serve(async (req: Request) => {
  const url = new URL(req.url);

  if (url.pathname === '/api/counter') {
    const atomic = kv.atomic();
    const result = await atomic
      .set(['counters', 'visits'], (await kv.get<number>(['counters', 'visits'])).value ?? 0 + 1)
      .commit();
    return Response.json({ visits: result.ok });
  }

  if (url.pathname === '/api/cache') {
    const key = url.searchParams.get('key');
    if (!key) return new Response('Missing key', { status: 400 });

    const cached = await kv.get<string>(['cache', key]);
    if (cached.value) {
      return new Response(cached.value, { headers: { 'X-Cache': 'HIT' } });
    }

    const fresh = await fetchUpstream(key);
    await kv.set(['cache', key], fresh, { expireIn: 60_000 });
    return new Response(fresh, { headers: { 'X-Cache': 'MISS' } });
  }

  return new Response('Not Found', { status: 404 });
});

async function fetchUpstream(key: string): Promise<string> {
  return `Data for ${key}`;
}
```

### Fastly Compute@Edge 服务处理

```typescript
// fastly-compute.ts — Fastly Compute@Edge 服务
import { Router } from '@fastly/expressly';

const router = new Router();

// 在边缘处理请求，无需回源
router.get('/api/geoip', async (req, res) => {
  const client = req.fastly.client;
  return res.json({
    country: client.geo.country_code,
    city: client.geo.city,
    latitude: client.geo.latitude,
    longitude: client.geo.longitude,
  });
});

// 边缘响应改写
router.get('/api/rewrite', async (req, res) => {
  const backendResponse = await fetch(req.fastly.backend('origin'), { backend: 'origin' });
  const body = await backendResponse.text();

  // 在边缘修改响应内容
  const modified = body.replace(/{{edge_region}}/g, req.fastly.client.geo.city ?? 'unknown');

  return new Response(modified, {
    status: backendResponse.status,
    headers: {
      'Content-Type': 'text/html',
      'X-Edge-Processed': 'true',
    },
  });
});

router.listen();
```

### AWS Lambda@Edge 原始请求处理

```typescript
// lambda-at-edge.ts — CloudFront Lambda@Edge 触发器
import { CloudFrontRequestEvent, CloudFrontRequestResult } from 'aws-lambda';

export const handler = async (
  event: CloudFrontRequestEvent
): Promise<CloudFrontRequestResult> => {
  const request = event.Records[0].cf.request;
  const headers = request.headers;

  // 根据设备类型重写到不同路径
  const userAgent = headers['user-agent']?.[0]?.value ?? '';
  if (/Mobile|Android|iPhone/.test(userAgent)) {
    request.uri = request.uri.replace(/^\//, '/mobile/');
  }

  // A/B 测试：基于 Cookie 路由
  const cookie = headers['cookie']?.[0]?.value ?? '';
  if (cookie.includes('experiment=new-ui')) {
    headers['x-experiment'] = [{ key: 'X-Experiment', value: 'new-ui' }];
  }

  // 国家/地区路由
  const country = headers['cloudfront-viewer-country']?.[0]?.value ?? 'US';
  if (country === 'CN') {
    request.origin = {
      custom: {
        domainName: 'origin-cn.example.com',
        port: 443,
        protocol: 'https',
        sslProtocols: ['TLSv1.2'],
        path: '',
        readTimeout: 30,
        keepaliveTimeout: 5,
        customHeaders: {},
      },
    };
  }

  return request;
};
```

### WebAssembly 边缘模块（Rust 编译为 WASM）

```typescript
// wasm-edge-module.ts — 加载 WASM 进行边缘计算
export interface Env {
  WASM_MODULE: WebAssembly.Module;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/api/hash') {
      const input = url.searchParams.get('input') ?? '';

      // 实例化 WASM 模块（高性能哈希计算）
      const instance = await WebAssembly.instantiate(env.WASM_MODULE, {
        env: { memory: new WebAssembly.Memory({ initial: 1 }) },
      });

      const { hash_string, malloc, free } = instance.exports as any;

      // 分配内存并写入字符串
      const encoder = new TextEncoder();
      const bytes = encoder.encode(input);
      const ptr = malloc(bytes.length);
      new Uint8Array(instance.exports.memory.buffer, ptr, bytes.length).set(bytes);

      // 调用 WASM 函数
      const resultPtr = hash_string(ptr, bytes.length);
      const resultView = new Uint8Array(instance.exports.memory.buffer, resultPtr, 32);
      const hash = Array.from(resultView)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

      free(ptr);
      free(resultPtr);

      return new Response(JSON.stringify({ input, hash }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response('Not Found', { status: 404 });
  },
};
```

## 相关索引

- `30-knowledge-base/30.2-categories/README.md` — 分类总览
- `20-code-lab/` — 代码实验室实践

## 目录内容

- 📄 ARCHITECTURE.md
- 📄 README.md
- 📄 THEORY.md
- 📄 _MIGRATED_FROM.md
- 📄 cloudflare-worker.ts
- 📄 deployment-edge-lab.test.ts
- 📄 docker-optimize.ts
- 📄 index.ts
- 📄 vercel-edge-config.ts


---

> 此分类文档由批量生成脚本自动创建，请根据实际模块内容补充和调整。


## 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| MDN | 文档 | [developer.mozilla.org](https://developer.mozilla.org) |
| web.dev | 指南 | [web.dev](https://web.dev) |
| Cloudflare Workers | 官方文档 | [developers.cloudflare.com/workers](https://developers.cloudflare.com/workers/) |
| Vercel Edge Functions | 官方文档 | [vercel.com/docs/functions/edge-functions](https://vercel.com/docs/functions/edge-functions) |
| Winter CG (Web-interoperable Runtimes) | 规范 | [wintercg.org](https://wintercg.org/) |
| Deno Deploy | 官方文档 | [docs.deno.com/deploy/manual](https://docs.deno.com/deploy/manual/) |
| Docker BuildKit | 官方文档 | [docs.docker.com/build/buildkit](https://docs.docker.com/build/buildkit/) |
| Hono — Ultrafast Web Framework | 文档 | [hono.dev](https://hono.dev/) |
| Fastly Compute@Edge | 官方文档 | [developer.fastly.com/learning/compute](https://developer.fastly.com/learning/compute/) |
| Cloudflare Workers Runtime APIs | 参考 | [developers.cloudflare.com/workers/runtime-apis](https://developers.cloudflare.com/workers/runtime-apis/) |
| Vercel Edge Runtime — Node.js Compatibility | 文档 | [edge-runtime.vercel.app](https://edge-runtime.vercel.app/) |
| JSPI (JavaScript Promise Integration) for WASM | 提案 | [github.com/WebAssembly/js-promise-integration](https://github.com/WebAssembly/js-promise-integration) |
| Wasmer — Universal WebAssembly Runtime | 文档 | [wasmer.io](https://wasmer.io/) — 跨平台 WASM 运行时 |
| Wasmtime — WebAssembly Runtime | 文档 | [wasmtime.dev](https://wasmtime.dev/) — Bytecode Alliance 官方运行时 |
| Fly.io Machines | 文档 | [fly.io/docs/machines](https://fly.io/docs/machines/) — Firecracker 微 VM |
| StackBlitz WebContainers | 文档 | [webcontainers.io](https://webcontainers.io/) — 浏览器内 Node.js 运行时 |
| AWS Lambda@Edge | 官方文档 | [docs.aws.amazon.com/lambda/latest/dg/lambda-edge](https://docs.aws.amazon.com/lambda/latest/dg/lambda-edge.html) — CloudFront 边缘函数 |
| Cloudflare Durable Objects | 文档 | [developers.cloudflare.com/durable-objects](https://developers.cloudflare.com/durable-objects/) — 有状态边缘对象 |
| Supabase Edge Functions | 文档 | [supabase.com/docs/guides/functions](https://supabase.com/docs/guides/functions) — Deno 边缘函数 |
| Netlify Edge Functions | 文档 | [docs.netlify.com/edge-functions/overview](https://docs.netlify.com/edge-functions/overview/) — Deno 运行时边缘函数 |

---

*最后更新: 2026-04-30*
