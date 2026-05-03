import os

base = r'e:\_src\JavaScriptTypeScript\website\examples'

examples = [
    {
        'path': os.path.join(base, 'api-design', 'openapi-swagger-practice.md'),
        'content': open(r'e:\_src\JavaScriptTypeScript\website\examples\api-design\index.md', 'r', encoding='utf-8').read()
    },
]

print("Using direct write approach")

# File 1: api-design
f1 = os.path.join(base, 'api-design', 'openapi-swagger-practice.md')
os.makedirs(os.path.dirname(f1), exist_ok=True)
with open(f1, 'w', encoding='utf-8') as f:
    f.write("""---
title: "OpenAPI 3.1 / Swagger 实战"
description: "从API设计到自动生成客户端SDK：OpenAPI规范、Zod生成、Swagger UI与版本管理完整指南"
date: 2026-05-03
tags: ["示例", "OpenAPI", "Swagger", "API设计", "Zod", "TypeScript", "SDK生成"]
category: "examples"
---

# OpenAPI 3.1 / Swagger 实战

> 现代 API 开发的核心痛点在于"文档与实现不同步"。OpenAPI 规范通过声明式的方式描述 API 接口，使得文档、验证、测试和客户端生成可以基于同一事实来源。

## 为什么需要 OpenAPI？

```mermaid
flowchart LR
    A[手写API文档] -->|不同步| B[代码实现]
    B -->|不一致| C[前端Mock]
    C -->|断裂| D[集成测试]
    E[OpenAPI规范] -->|统一事实来源| F[文档/Swagger UI]
    E -->|生成| G[TypeScript客户端]
    E -->|验证| H[运行时校验]
    E -->|驱动| I[集成测试]
```

## OpenAPI 3.1 规范核心结构

```yaml
openapi: 3.1.0
info:
  title: E-Commerce API
  version: 1.0.0
  description: 电商系统RESTful API

servers:
  - url: https://api.example.com/v1

paths:
  /products:
    get:
      summary: 获取商品列表
      parameters:
        - name: category
          in: query
          schema:
            type: string
      responses:
        '200':
          description: 成功
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Product'

components:
  schemas:
    Product:
      type: object
      required: [id, name, price]
      properties:
        id:
          type: string
          format: uuid
        name:
          type: string
          minLength: 1
          maxLength: 200
        price:
          type: number
          minimum: 0
```

### 关键字段速查

| 字段 | 说明 | 示例 |
|------|------|------|
| `openapi` | 规范版本 | `3.1.0` |
| `info` | API 元信息 | title, version, description |
| `servers` | 服务器地址列表 | 支持变量替换 |
| `paths` | 端点定义 | `/users`, `/orders/{id}` |
| `components` | 可复用组件 | schemas, parameters, responses |
| `securitySchemes` | 认证方式 | bearer, oauth2, apiKey |

## 从 Zod Schema 生成 OpenAPI

```typescript
import { z } from 'zod';
import { extendZodWithOpenApi } from 'zod-openapi';

extendZodWithOpenApi(z);

const ProductSchema = z.object({
  id: z.string().uuid().openapi({ example: '550e8400-e29b-41d4-a716-446655440000' }),
  name: z.string().min(1).max(200),
  price: z.number().min(0),
  tags: z.array(z.string()).optional(),
}).openapi('Product');

// 使用 @asteasolutions/zod-to-openapi 生成完整文档
import { OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';

const generator = new OpenApiGeneratorV3([ProductSchema]);
const docs = generator.generateDocument({
  openapi: '3.1.0',
  info: { title: 'E-Commerce API', version: '1.0.0' },
});
```

### 与 Hono 集成

```typescript
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { swaggerUI } from '@hono/swagger-ui';

const app = new Hono();

app.post('/products', zValidator('json', CreateProductRequest), async (c) => {
  const data = c.req.valid('json');
  const product = await createProduct(data);
  return c.json(product, 201);
});

app.get('/ui', swaggerUI({ url: '/doc' }));
```

## 自动生成 TypeScript 客户端

### openapi-typescript

```bash
npx openapi-typescript https://api.example.com/openapi.json -o src/api-types.ts
```

### openapi-fetch（推荐）

```typescript
import createClient from 'openapi-fetch';
import type { paths } from './api-types';

const client = createClient<paths>({ baseUrl: 'https://api.example.com' });

const { data, error } = await client.GET('/products', {
  params: {
    query: { category: 'electronics' },
  },
});
```

### Orval

```typescript
// orval.config.ts
export default {
  api: {
    input: { target: './openapi.json' },
    output: {
      target: './src/generated',
      client: 'react-query',
      mock: true,
    },
  },
};
```

## API 版本管理与变更检测

```mermaid
flowchart LR
    A[API变更] --> B[optic diff]
    B -->|breaking| C[阻断CI]
    B -->|additive| D[允许合并]
    D --> E[自动生成Changelog]
```

### Optic 变更检测

```bash
npm install -g @useoptic/optic
optic diff openapi.yaml --base main
```

### Bump.sh 文档托管

```yaml
# .github/workflows/bump.yml
- name: Deploy API documentation
  uses: bump-sh/github-action@v1
  with:
    file: openapi.yaml
    doc: 'e-commerce-api'
    token: ${{ secrets.BUMP_TOKEN }}
```

## 完整工作流总结

```mermaid
flowchart TB
    subgraph 开发阶段
        A[Zod Schema定义] --> B[生成OpenAPI]
        B --> C[Swagger UI预览]
    end
    subgraph 验证阶段
        D[optic diff检测变更] -->|breaking| E[修复或版本升级]
        D -->|additive| F[允许合并]
    end
    subgraph 发布阶段
        G[生成TypeScript客户端] --> H[发布npm包]
        B --> I[部署Swagger文档]
    end
    C --> D
    F --> G
    F --> I
```

## 最佳实践清单

- [ ] 使用 Zod 等 Schema 库生成 OpenAPI，避免手写 YAML
- [ ] 为所有字段添加 `example` 和 `description`
- [ ] 使用 `securitySchemes` 统一描述认证方式
- [ ] 在 CI 中集成 optic diff 检测破坏性变更
- [ ] 为前端项目生成 openapi-fetch 客户端，消除类型不匹配
- [ ] 使用 tags 分组组织端点，提升 Swagger UI 可读性

## 参考资源

| 资源 | 链接 | 说明 |
|------|------|------|
| OpenAPI 3.1 规范 | https://spec.openapis.org/oas/3.1.0 | 官方规范文档 |
| zod-to-openapi | https://github.com/asteasolutions/zod-to-openapi | Zod 生成 OpenAPI |
| openapi-typescript | https://openapi-ts.dev | 类型生成工具 |
| openapi-fetch | https://openapi-ts.dev/openapi-fetch | 类型安全 fetch 客户端 |
| Optic | https://www.useoptic.com | API 变更检测 |

---

 [← 返回 API 设计示例首页](./)
""")
print(f"Created api-design: {os.path.getsize(f1)} bytes")

# File 2: edge-architecture
f2 = os.path.join(base, 'edge-architecture', 'cloudflare-workers-deployment.md')
with open(f2, 'w', encoding='utf-8') as f:
    f.write("""---
title: "Cloudflare Workers 边缘部署实战"
description: "从零构建边缘计算应用：Workers架构、Wrangler部署、KV/D1/R2存储、缓存策略与框架集成"
date: 2026-05-03
tags: ["示例", "Cloudflare", "Workers", "边缘计算", "Serverless", "V8 Isolate", "Wrangler"]
category: "examples"
---

# Cloudflare Workers 边缘部署实战

> Cloudflare Workers 是全球部署最广泛的边缘计算平台之一，利用 V8 Isolate 技术在全球 300+ 城市毫秒级响应。

## Workers 架构解析

传统 Serverless 采用容器化冷启动模型，而 Workers 基于 V8 Isolates：

```mermaid
flowchart LR
    subgraph 传统Serverless
        A[请求] --> B[启动容器]
        B --> C[加载运行时]
        C --> D[执行代码]
        D --> E[响应]
        B -.->|冷启动| F[100-1000ms]
    end
    subgraph Workers V8 Isolate
        G[请求] --> H[复用Isolate]
        H --> I[执行代码]
        I --> J[响应]
        H -.->|零冷启动| K[0ms]
    end
```

| 特性 | AWS Lambda | Cloudflare Workers |
|------|-----------|-------------------|
| 运行时模型 | 容器 | V8 Isolate |
| 冷启动 | 100ms-10s | 0ms |
| 内存限制 | 10GB | 128MB |
| CPU 限制 | 6 vCPU | 50ms CPU/请求 |
| 全球边缘 | CloudFront | 300+ 城市原生 |

## 环境准备

```bash
npm install -g wrangler
wrangler login
npm create cloudflare@latest my-worker
```

## 基础 Worker 脚本

```typescript
export interface Env {
  MY_KV: KVNamespace;
  MY_D1: D1Database;
  API_KEY: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    switch (url.pathname) {
      case '/api/health':
        return new Response(JSON.stringify({ status: 'ok', region: request.cf?.colo }), {
          headers: { 'Content-Type': 'application/json' },
        });
      default:
        return new Response('Not Found', { status: 404 });
    }
  },
};
```

## Wrangler 配置

```json
{
  "name": "my-worker",
  "main": "src/index.ts",
  "compatibility_date": "2026-05-01",
  "compatibility_flags": ["nodejs_compat"],
  "vars": { "ENVIRONMENT": "production" },
  "kv_namespaces": [{ "binding": "MY_KV", "id": "xxx" }],
  "d1_databases": [{ "binding": "MY_D1", "database_name": "prod-db", "database_id": "xxx" }],
  "r2_buckets": [{ "binding": "MY_BUCKET", "bucket_name": "assets" }]
}
```

## 存储服务实战

### KV 键值存储

```typescript
async function getConfig(env: Env, key: string) {
  const cached = await env.MY_KV.get(key, { cacheTtl: 3600 });
  if (cached) return JSON.parse(cached);

  const config = await fetchFromOrigin(key);
  await env.MY_KV.put(key, JSON.stringify(config), { expirationTtl: 86400 });
  return config;
}
```

### D1 SQLite 数据库

```typescript
import { drizzle } from 'drizzle-orm/d1';

const db = drizzle(env.MY_D1);
const user = await db.select().from(users).where(eq(users.id, userId)).get();
```

### R2 对象存储

```typescript
async function uploadFile(env: Env, key: string, body: ReadableStream) {
  await env.MY_BUCKET.put(key, body, {
    httpMetadata: { contentType: 'image/png' },
  });
  return await env.MY_BUCKET.createSignedUrl(key, { expiresIn: 86400 });
}
```

## 边缘缓存策略

```mermaid
flowchart TD
    A[用户请求] --> B{CDN缓存?}
    B -->|命中| C[直接返回]
    B -->|未命中| D[Worker执行]
    D --> E{Worker缓存?}
    E -->|命中| F[返回缓存]
    E -->|未命中| G[回源/计算]
    G --> H[写入缓存]
    H --> I[返回响应]
```

## 与前端框架集成

### Hono 框架（推荐）

```typescript
import { Hono } from 'hono';
import { cache } from 'hono/cache';

const app = new Hono<{ Bindings: Env }>();
app.use('*', logger());
app.use('/api/*', cache({ cacheName: 'api-cache', cacheControl: 'max-age=3600' }));

app.get('/api/users/:id', async (c) => {
  const id = c.req.param('id');
  const user = await c.env.MY_D1.prepare('SELECT * FROM users WHERE id = ?').bind(id).first();
  return user ? c.json(user) : c.json({ error: 'Not found' }, 404);
});

export default app;
```

## 部署与监控

```bash
wrangler dev --local
wrangler deploy
wrangler tail
wrangler traces
```

### 关键指标

| 指标 | 目标值 | 说明 |
|------|--------|------|
| CPU Time | < 50ms | 单请求CPU时间上限 |
| Memory | < 128MB | Worker内存限制 |
| Cold Start | 0ms | V8 Isolate零冷启动 |
| TTFB | < 100ms | 全球边缘响应 |

## 完整架构

```mermaid
flowchart TB
    A[用户浏览器] -->|HTTPS| B[Cloudflare CDN]
    B -->|边缘缓存| C[Worker]
    C -->|读取| D[KV缓存]
    C -->|查询| E[D1数据库]
    C -->|上传/下载| F[R2存储]
    C -->|API调用| G[上游服务]
    D -->|未命中| E
    E -->|写入| D
```

## 参考资源

| 资源 | 链接 |
|------|------|
| Workers 文档 | https://developers.cloudflare.com/workers/ |
| Wrangler CLI | https://developers.cloudflare.com/workers/wrangler/ |
| Hono 框架 | https://hono.dev |
| Drizzle ORM | https://orm.drizzle.team |

---

 [← 返回 Edge 架构示例首页](./)
""")
print(f"Created edge-architecture: {os.path.getsize(f2)} bytes")
import os

base = r'e:\_src\JavaScriptTypeScript\website\examples'

# File 3: testing
f3 = os.path.join(base, 'testing', 'vitest-unit-testing.md')
with open(f3, 'w', encoding='utf-8') as f:
    f.write("""---
title: "Vitest 单元测试实战"
description: "现代前端测试框架完全指南：配置、Mock、覆盖率、CI集成与React/Vue测试最佳实践"
date: 2026-05-03
tags: ["示例", "Vitest", "单元测试", "测试工程", "Mock", "覆盖率", "Jest", "前端测试"]
category: "examples"
---

# Vitest 单元测试实战

> Vitest 是 2024-2026 年增长最快的 JavaScript 测试框架，原生支持 ESM 和 TypeScript，速度是 Jest 的 5-10 倍。本文档将带你从零构建企业级单元测试体系。

## 为什么选择 Vitest？

```mermaid
flowchart LR
    subgraph Jest痛点
        A[ESM支持不完善] --> B[需要babel转译]
        C[TypeScript慢] --> D[ts-jest开销]
        E[配置复杂] --> F[jest.config.js+babel+ts]
    end
    subgraph Vitest优势
        G[原生ESM] --> H[Vite驱动]
        I[原生TypeScript] --> J[esbuild转译]
        K[配置极简] --> L[vite.config.ts统一]
    end
```

| 特性 | Jest | Vitest |
|------|------|--------|
| ESM 支持 | 实验性，需配置 | 原生支持 |
| TypeScript | ts-jest 较慢 | esbuild 极快 |
| 配置 | 独立 jest.config | 复用 vite.config |
| 断言库 | 内置 | 兼容 chai/jest |
| 模式 | 多进程 | 多线程（更快） |
| Vite 项目 | 需适配 | 零配置 |

## 环境准备

```bash
# 安装
npm install -D vitest @vitest/ui

# 可选：DOM 测试工具
npm install -D jsdom @testing-library/jest-dom

# React 测试
npm install -D @testing-library/react @testing-library/user-event

# Vue 测试
npm install -D @vue/test-utils
```

## 基础配置

```typescript
// vite.config.ts
import &#123; defineConfig &#125; from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(&#123;
  plugins: [react()],
  test: &#123;
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: &#123;
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/test/'],
    &#125;,
  &#125;,
&#125;);
```

```json
// package.json
&#123;
  "scripts": &#123;
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:run": "vitest run"
  &#125;
&#125;
```

## 核心测试模式

### 基础断言

```typescript
// src/utils/math.test.ts
import &#123; describe, it, expect &#125; from 'vitest';
import &#123; add, multiply, divide &#125; from './math';

describe('math utils', () => &#123;
  it('adds two numbers', () => &#123;
    expect(add(2, 3)).toBe(5);
  &#125;);

  it('multiplies numbers', () => &#123;
    expect(multiply(4, 5)).toBe(20);
  &#125;);

  it('throws on division by zero', () => &#123;
    expect(() => divide(10, 0)).toThrow('Cannot divide by zero');
  &#125;);

  it('compares objects deeply', () => &#123;
    expect(&#123; a: 1, b: 2 &#125;).toEqual(&#123; a: 1, b: 2 &#125;);
    expect(&#123; a: 1 &#125;).not.toBe(&#123; a: 1 &#125;); // 不同引用
  &#125;);
&#125;);
```

### Mock 与 Spy

```typescript
// src/services/api.test.ts
import &#123; describe, it, expect, vi &#125; from 'vitest';
import &#123; fetchUser &#125; from './api';

describe('api service', () => &#123;
  it('fetches user data', async () => &#123;
    const mockUser = &#123; id: '1', name: 'Alice' &#125;;

    // Mock global fetch
    global.fetch = vi.fn().mockResolvedValue(&#123;
      json: async () => mockUser,
      ok: true,
    &#125;);

    const user = await fetchUser('1');
    expect(user).toEqual(mockUser);
    expect(fetch).toHaveBeenCalledWith('/api/users/1');
  &#125;);

  it('handles API errors', async () => &#123;
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    await expect(fetchUser('1')).rejects.toThrow('Network error');
  &#125;);
&#125;);
```

### 模块 Mock

```typescript
// src/components/UserProfile.test.tsx
import &#123; describe, it, expect, vi &#125; from 'vitest';
import &#123; render, screen &#125; from '@testing-library/react';
import UserProfile from './UserProfile';

// 自动 Mock 整个模块
vi.mock('../hooks/useAuth', () => (&#123;
  useAuth: () => (&#123;
    user: &#123; id: '1', name: 'Test User', email: 'test@example.com' &#125;,
    isLoading: false,
  &#125;),
&#125;));

describe('UserProfile', () => &#123;
  it('renders user info', () => &#123;
    render(<UserProfile />);
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  &#125;);
&#125;);
```

## React 组件测试

```typescript
// src/components/Counter.test.tsx
import &#123; describe, it, expect &#125; from 'vitest';
import &#123; render, screen, fireEvent &#125; from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Counter from './Counter';

describe('Counter', () => &#123;
  it('increments on click', async () => &#123;
    const user = userEvent.setup();
    render(<Counter initial={0} />);

    const button = screen.getByRole('button', &#123; name: /increment/i &#125;);
    await user.click(button);
    await user.click(button);

    expect(screen.getByText('Count: 2')).toBeInTheDocument();
  &#125;);

  it('displays error for negative initial value', () => &#123;
    render(<Counter initial={-1} />);
    expect(screen.getByText(/invalid/i)).toBeInTheDocument();
  &#125;);
&#125;);
```

## 测试分层策略

```mermaid
flowchart TB
    subgraph 测试金字塔
        A[单元测试<br/>70%] --> B[集成测试<br/>20%]
        B --> C[E2E测试<br/>10%]
    end
    subgraph Vitest适用层
        D[纯函数测试] --> A
        E[组件测试] --> A
        F[Hook测试] --> A
        G[服务集成] --> B
    end
```

## 覆盖率与 CI 集成

```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'npm'
      - run: npm ci
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v4
        with:
          files: ./coverage/lcov.info
```

## 最佳实践清单

- [ ] 使用 `userEvent` 代替 `fireEvent` 模拟真实用户交互
- [ ] Mock 外部 API 调用，保持测试独立
- [ ] 优先测试行为而非实现细节
- [ ] 保持测试简单，一个测试验证一个概念
- [ ] 使用 `screen` 查询而非容器查询
- [ ] 在 CI 中设置覆盖率阈值（如 80%）

## 参考资源

| 资源 | 链接 |
|------|------|
| Vitest 官方文档 | https://vitest.dev |
| Testing Library | https://testing-library.com |
| React Testing Patterns | https://kentcdodds.com/blog/testing-react-apps |

---

 [← 返回测试示例首页](./)
""")
print(f"Created testing: {os.path.getsize(f3)} bytes")

# File 4: performance
f4 = os.path.join(base, 'performance', 'core-web-vitals-diagnosis.md')
with open(f4, 'w', encoding='utf-8') as f:
    f.write("""---
title: "Core Web Vitals 诊断实战"
description: "从CrUX数据集到真实用户监控：LCP/INP/CLS根因分析、Performance API与电商优化案例"
date: 2026-05-03
tags: ["示例", "Web Vitals", "性能诊断", "CrUX", "RUM", "LCP", "INP", "CLS", "性能工程"]
category: "examples"
---

# Core Web Vitals 诊断实战

> 性能优化不能仅靠猜测。本文档将系统讲解如何从 Chrome User Experience Report (CrUX) 获取真实用户数据，建立 RUM 监控体系，并使用 Performance API 进行根因分析。

## 性能数据的三层模型

```mermaid
flowchart LR
    A[实验室数据<br/>Lighthouse] -->|合成测试| B[控制变量]
    C[字段数据<br/>CrUX/RUM] -->|真实用户| D[反映实际体验]
    E[本地开发<br/>DevTools] -->|调试分析| F[快速迭代]
    B --> G[优化决策]
    D --> G
    F --> G
```

| 数据来源 | 类型 | 优势 | 局限 |
|----------|------|------|------|
| Lighthouse | 实验室 | 可控、可复现 | 不代表真实用户 |
| CrUX | 字段 | 真实用户、海量 | 仅 Chrome、延迟28天 |
| RUM (自采集) | 字段 | 实时、全浏览器 | 需要埋点开发 |
| DevTools | 本地 | 详细、交互式 | 仅开发环境 |

## CrUX 数据分析

### BigQuery 查询

```sql
-- 查询某个站点的 Web Vitals 分布
SELECT
  origin,
  DATE(yyyymmdd) as date,
  ROUND(SUM(lcp.good) / SUM(lcp.density) * 100, 2) as lcp_good_pct,
  ROUND(SUM(inp.good) / SUM(inp.density) * 100, 2) as inp_good_pct,
  ROUND(SUM(cls.good) / SUM(cls.density) * 100, 2) as cls_good_pct
FROM `chrome-ux-report.all.202501`
WHERE origin = 'https://example.com'
GROUP BY origin, date
ORDER BY date DESC;
```

### CrUX API

```typescript
// 使用 CrUX API 获取真实用户数据
async function getCruxData(origin: string) &#123;
  const response = await fetch('https://chromeuxreport.googleapis.com/v1/records:queryRecord', &#123;
    method: 'POST',
    headers: &#123; 'Content-Type': 'application/json', 'Authorization': `Bearer $&#123;API_KEY&#125;` &#125;,
    body: JSON.stringify(&#123; origin &#125;),
  &#125;);

  const data = await response.json();
  return &#123;
    lcp: data.record.metrics.largest_contentful_paint.percentiles.p75,
    inp: data.record.metrics.interaction_to_next_paint?.percentiles.p75,
    cls: data.record.metrics.cumulative_layout_shift.percentiles.p75,
  &#125;;
&#125;
```

## 真实用户监控 (RUM)

### web-vitals.js 集成

```typescript
// src/analytics/vitals.ts
import &#123; onLCP, onINP, onCLS, onTTFB, onFCP &#125; from 'web-vitals';
import &#123; sendToAnalytics &#125; from './analytics';

// 发送到分析平台
onLCP((metric) => sendToAnalytics('LCP', metric));
onINP((metric) => sendToAnalytics('INP', metric));
onCLS((metric) => sendToAnalytics('CLS', metric));
onTTFB((metric) => sendToAnalytics('TTFB', metric));
onFCP((metric) => sendToAnalytics('FCP', metric));

// 自定义阈值告警
onLCP((metric) => &#123;
  if (metric.value > 2500) &#123;
    console.warn('Poor LCP detected:', metric.value, metric.entries);
    // 上报到监控系统
  &#125;
&#125;);
```

### 自定义性能标记

```typescript
// 标记关键业务时刻
performance.mark('app-init-start');
await initializeApp();
performance.mark('app-init-end');

performance.measure('app-initialization', 'app-init-start', 'app-init-end');

// 读取测量结果
const measure = performance.getEntriesByName('app-initialization')[0];
console.log(`App initialized in $&#123;measure.duration&#125;ms`);
```

## LCP 根因诊断

```mermaid
flowchart TD
    A[LCP > 2.5s] --> B&#123;元素类型?&#125;
    B -->|img| C[图片优化]
    B -->|video| D[视频 poster]
    B -->|文本块| E[字体优化]
    B -->|背景图| F[CSS优化]
    C --> G[压缩/WebP/AVIF]
    C --> H[预加载/preload]
    C --> I[响应式图片]
    E --> J[font-display: swap]
    E --> K[字体子集化]
```

### 诊断代码

```typescript
// 识别 LCP 元素并分析
new PerformanceObserver((list) => &#123;
  const entries = list.getEntries();
  const lastEntry = entries[entries.length - 1];

  console.log('LCP Element:', lastEntry.element);
  console.log('LCP Value:', lastEntry.startTime);
  console.log('LCP URL:', lastEntry.url);

  // 分析资源加载时间
  if (lastEntry.url) &#123;
    const resource = performance.getEntriesByName(lastEntry.url)[0];
    console.log('Resource Load Time:', resource?.responseEnd - resource?.startTime);
  &#125;
&#125;).observe(&#123; entryTypes: ['largest-contentful-paint'] &#125;);
```

## INP 交互诊断

```typescript
// 检测长任务阻塞主线程
new PerformanceObserver((list) => &#123;
  for (const entry of list.getEntries()) &#123;
    if (entry.duration > 50) &#123;
      console.warn('Long Task detected:', entry.duration, 'ms');
      // 分析调用栈（需要 JS Self-Profiling API）
    &#125;
  &#125;
&#125;).observe(&#123; entryTypes: ['longtask'] &#125;);

// 检测输入延迟
new PerformanceObserver((list) => &#123;
  for (const entry of list.getEntries()) &#123;
    const delay = entry.processingStart - entry.startTime;
    if (delay > 100) &#123;
      console.warn('High input delay:', delay, 'ms', entry.name);
    &#125;
  &#125;
&#125;).observe(&#123; type: 'first-input', buffered: true &#125;);
```

## 真实案例：电商站点优化

```mermaid
flowchart LR
    A[诊断前<br/>LCP 4.2s] --> B[图片优化]
    B --> C[字体预加载]
    C --> D[代码分割]
    D --> E[诊断后<br/>LCP 1.8s]
```

### 优化措施与效果

| 优化项 | 实施前 | 实施后 | 收益 |
|--------|--------|--------|------|
| 图片转 AVIF | 2.1MB | 0.4MB | LCP -1.2s |
| 关键 CSS 内联 | 渲染阻塞 | 无阻塞 | FCP -0.5s |
| 字体预加载 | FOIT 3s | FOUT 0.1s | LCP -0.8s |
| 代码分割 | 800KB JS | 120KB 首屏 | TTI -2s |
| 预连接 CDN | DNS 200ms | 0ms | TTFB -0.2s |

## 参考资源

| 资源 | 链接 |
|------|------|
| web-vitals.js | https://github.com/GoogleChrome/web-vitals |
| CrUX Dashboard | https://developer.chrome.com/docs/crux/dashboard |
| Performance API | https://developer.mozilla.org/en-US/docs/Web/API/Performance |
| web.dev 性能指南 | https://web.dev/performance-scoring |

---

 [← 返回性能示例首页](./)
""")
print(f"Created performance: {os.path.getsize(f4)} bytes")

print('Batch 1 done')

# File 5: security
f5 = os.path.join(base, 'security', 'owasp-top10-defense.md')
with open(f5, 'w', encoding='utf-8') as f:
    f.write("""---
title: "OWASP Top 10 防御实战"
description: "Web应用安全完全指南：注入攻击、身份认证、XSS、CSRF、依赖安全与纵深防御策略"
date: 2026-05-03
tags: ["示例", "安全", "OWASP", "XSS", "CSRF", "注入攻击", "JWT", "依赖安全"]
category: "examples"
---

# OWASP Top 10 防御实战

> OWASP Top 10 是 Web 应用安全领域最具影响力的标准文档，代表了当前最普遍和最关键的安全风险。本文档将系统讲解每一项风险的防御策略，并提供可直接落地的 TypeScript/Node.js 代码示例。

## OWASP Top 10 2021 概览

```mermaid
flowchart TB
    A[OWASP Top 10] --> B[A01 访问控制失效]
    A --> C[A02 加密机制失效]
    A --> D[A03 注入攻击]
    A --> E[A04 不安全设计]
    A --> F[A05 安全配置错误]
    A --> G[A06 易受攻击组件]
    A --> H[A07 身份识别与认证失效]
    A --> I[A08 软件和数据完整性故障]
    A --> J[A09 安全日志与监控失效]
    A --> K[A10 SSRF]
```

## A01: 访问控制失效

### 垂直越权防护

```typescript
// 错误示例：仅前端隐藏按钮
function AdminPanel() &#123;
  // 危险！仅依赖前端条件
  if (user.role === 'admin') &#123;
    return <AdminDashboard />;
  &#125;
&#125;

// 正确示例：后端校验 + 最小权限
async function getAdminData(req: Request) &#123;
  const session = await verifySession(req);

  // 后端强制校验权限
  if (!session.user.permissions.includes('admin:read')) &#123;
    throw new HTTPError(403, 'Insufficient permissions');
  &#125;

  return await db.query.admin.getAll();
&#125;
```

### 水平越权防护

```typescript
// 错误示例：仅校验登录态
app.get('/api/orders/:orderId', async (req, res) => &#123;
  // 危险！任何登录用户都能访问任意订单
  const order = await db.orders.findById(req.params.orderId);
  res.json(order);
&#125;);

// 正确示例：数据级权限校验
app.get('/api/orders/:orderId', requireAuth, async (req, res) => &#123;
  const order = await db.orders.findById(req.params.orderId);

  // 校验当前用户是否有权访问此订单
  if (order.userId !== req.user.id && !req.user.isAdmin) &#123;
    throw new HTTPError(403, 'Access denied');
  &#125;

  res.json(order);
&#125;);
```

## A03: 注入攻击防御

### SQL 注入

```typescript
// 错误示例：字符串拼接
const query = `SELECT * FROM users WHERE email = '$&#123;email&#125;'`;

// 正确示例：参数化查询
const user = await db.prepare('SELECT * FROM users WHERE email = ?')
  .bind(email)
  .first();

// 使用 ORM（Prisma）
const user = await prisma.user.findUnique(&#123;
  where: &#123; email &#125;,
&#125;);
```

### NoSQL 注入

```typescript
// 错误示例：直接传入对象
app.post('/login', async (req, res) => &#123;
  const user = await db.users.findOne(req.body); // 危险！
&#125;);

// 正确示例：严格校验输入
import &#123; z &#125; from 'zod';

const LoginSchema = z.object(&#123;
  email: z.string().email(),
  password: z.string().min(8),
&#125;);

app.post('/login', async (req, res) => &#123;
  const &#123; email, password &#125; = LoginSchema.parse(req.body);
  const user = await db.users.findOne(&#123; email &#125;);
  // ...
&#125;);
```

### 命令注入

```typescript
// 错误示例
const result = execSync(`git log --author=$&#123;author&#125;`);

// 正确示例：使用数组参数
import &#123; execFileSync &#125; from 'child_process';
const result = execFileSync('git', ['log', '--author', author]);
```

## A07: 身份认证失效

### JWT 安全实践

```typescript
import &#123; SignJWT, jwtVerify &#125; from 'jose';

// 生成 Token
const token = await new SignJWT(&#123; userId: user.id, role: user.role &#125;)
  .setProtectedHeader(&#123; alg: 'HS256' &#125;)
  .setIssuedAt()
  .setExpirationTime('2h')
  .setAudience('api.example.com')
  .setIssuer('auth.example.com')
  .sign(new TextEncoder().encode(JWT_SECRET));

// 验证 Token
async function verifyToken(token: string) &#123;
  try &#123;
    const &#123; payload &#125; = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET), &#123;
      audience: 'api.example.com',
      issuer: 'auth.example.com',
      clockTolerance: 60,
    &#125;);
    return payload;
  &#125; catch (e) &#123;
    throw new HTTPError(401, 'Invalid token');
  &#125;
&#125;
```

### 密码安全

```typescript
import bcrypt from 'bcrypt';

// 注册时哈希密码
const saltRounds = 12;
const hashedPassword = await bcrypt.hash(password, saltRounds);

// 验证密码
const isValid = await bcrypt.compare(password, hashedPassword);

// 密钥派生（替代方案）
import &#123; hash, verify &#125; from 'argon2';
const argonHash = await hash(password);
const isValidArgon = await verify(argonHash, password);
```

## A03: XSS 防御

### 内容安全策略 (CSP)

```typescript
// Express 中间件
app.use((req, res, next) => &#123;
  res.setHeader('Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'nonce-$&#123;res.locals.nonce&#125;'; " +
    "style-src 'self' 'nonce-$&#123;res.locals.nonce&#125;'; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self' https://api.example.com; " +
    "frame-ancestors 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self';"
  );
  next();
&#125;);
```

### 输出编码

```typescript
// React 自动转义（默认安全）
function Comment(&#123; text &#125;) &#123;
  return <div>&#123;text&#125;</div>; // 自动转义 <script>
&#125;

// 危险！使用 dangerouslySetInnerHTML
function UnsafeComment(&#123; html &#125;) &#123;
  return <div dangerouslySetInnerHTML=&#123;&#123; __html: html &#125;&#125; />;
&#125;

// 安全的 Markdown 渲染
import DOMPurify from 'dompurify';
import &#123; JSDOM &#125; from 'jsdom';

const window = new JSDOM('').window;
const purify = DOMPurify(window);

const clean = purify.sanitize(dirtyHtml, &#123;
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p'],
  ALLOWED_ATTR: ['href'],
&#125;);
```

## A06: 易受攻击组件

### 依赖管理

```bash
# 扫描漏洞
npm audit
npm audit fix

# 使用 Snyk
npx snyk test
npx snyk monitor

# 使用 Dependabot（GitHub 内置）
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: npm
    directory: /
    schedule:
      interval: weekly
    open-pull-requests-limit: 10
```

```typescript
// 运行时版本检查
import packageJson from '../package.json';

const vulnerablePackages = ['lodash', 'axios'];
for (const pkg of vulnerablePackages) &#123;
  const version = packageJson.dependencies[pkg];
  const isVulnerable = await checkVulnerability(pkg, version);
  if (isVulnerable) &#123;
    console.error(`Vulnerable package: $&#123;pkg&#125;@$&#123;version&#125;`);
  &#125;
&#125;
```

## 纵深防御清单

```mermaid
flowchart TB
    A[用户请求] --> B[WAF]
    B --> C[HTTPS/TLS]
    C --> D[输入校验]
    D --> E[参数化查询]
    E --> F[输出编码]
    F --> G[CSP]
    G --> H[最小权限]
    H --> I[审计日志]
```

| 层次 | 措施 | 工具/技术 |
|------|------|----------|
| 网络层 | TLS 1.3、HSTS | cert-manager, Let's Encrypt |
| 应用层 | WAF、Rate Limit | Cloudflare, express-rate-limit |
| 输入层 | 校验、清洗 | Zod, validator.js |
| 数据层 | 参数化查询 | Prisma, pg-promise |
| 输出层 | 编码、CSP | DOMPurify, Helmet |
| 会话层 | JWT、HttpOnly Cookie | jose, csurf |
| 基础设施 | 漏洞扫描 | Snyk, Dependabot, Trivy |

## 参考资源

| 资源 | 链接 |
|------|------|
| OWASP Top 10 | https://owasp.org/Top10/ |
| OWASP Cheat Sheets | https://cheatsheetseries.owasp.org/ |
| Mozilla Security Guidelines | https://infosec.mozilla.org/guidelines/web_security |
| Helmet.js | https://helmetjs.github.io/ |

---

 [← 返回安全示例首页](./)
""")
print(f"Created security: {os.path.getsize(f5)} bytes")

# File 6: database
f6 = os.path.join(base, 'database', 'prisma-postgresql-practice.md')
with open(f6, 'w', encoding='utf-8') as f:
    f.write("""---
title: "Prisma + PostgreSQL 实战"
description: "现代数据库开发工作流：Schema设计、迁移、查询优化、事务与tRPC/GraphQL集成"
date: 2026-05-03
tags: ["示例", "Prisma", "PostgreSQL", "数据库", "ORM", "迁移", "事务", "查询优化"]
category: "examples"
---

# Prisma + PostgreSQL 实战

> Prisma 是 2024-2026 年最流行的 TypeScript ORM，以类型安全、自动迁移和卓越的开发体验著称。本文档将带你构建完整的 Prisma + PostgreSQL 工作流。

## 为什么选择 Prisma？

```mermaid
flowchart LR
    subgraph 传统ORM痛点
        A[类型不安全] --> B[any泛滥]
        C[迁移困难] --> D[手写SQL]
        E[查询不透明] --> F[N+1问题]
    end
    subgraph Prisma优势
        G[自动类型生成] --> H[100%类型覆盖]
        I[声明式迁移] --> J[prisma migrate]
        K[查询优化] --> L[自动包含查询]
    end
```

## 环境准备

```bash
# 安装依赖
npm install prisma @prisma/client
npm install -D prisma

# 初始化
npx prisma init

# 安装数据库驱动（PostgreSQL）
npm install pg
```

## Schema 设计

```prisma
// prisma/schema.prisma

generator client &#123;
  provider = "prisma-client-js"
&#125;

datasource db &#123;
  provider = "postgresql"
  url      = env("DATABASE_URL")
&#125;

// 用户模型
model User &#123;
  id        String   @id @default(uuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // 关系
  posts     Post[]
  profile   Profile?
&#125;

// 文章模型
model Post &#123;
  id        String   @id @default(uuid())
  title     String
  content   String?
  published Boolean  @default(false)
  createdAt DateTime @default(now())

  // 外键
  authorId  String
  author    User     @relation(fields: [authorId], references: [id])

  // 分类（多对多）
  categories Category[]
&#125;

// 用户资料（一对一）
model Profile &#123;
  id     String @id @default(uuid())
  bio    String?
  avatar String?

  userId String @unique
  user   User   @relation(fields: [userId], references: [id])
&#125;

// 分类模型
model Category &#123;
  id    String @id @default(uuid())
  name  String @unique
  posts Post[]
&#125;
```

### 关系类型速查

| 关系 | Prisma 语法 | 数据库表现 |
|------|------------|-----------|
| 一对一 | `@relation` + `@unique` | 外键 + UNIQUE |
| 一对多 | `@relation` | 外键 |
| 多对多 | 隐式/显式连接表 | 中间表 |

## 迁移管理

```bash
# 生成迁移文件
npx prisma migrate dev --name init

# 应用到生产
npx prisma migrate deploy

# 生成新的迁移
npx prisma migrate dev --name add_user_roles

# 重置数据库（开发环境）
npx prisma migrate reset
```

```typescript
// 程序化迁移检查
import &#123; PrismaClient &#125; from '@prisma/client';

const prisma = new PrismaClient();

async function checkMigrationStatus() &#123;
  const result = await prisma.$queryRaw`
    SELECT * FROM \_prisma_migrations ORDER BY finished_at DESC LIMIT 5
  `;
  console.log('Recent migrations:', result);
&#125;
```

## 查询优化

### 基础 CRUD

```typescript
// 创建
const user = await prisma.user.create(&#123;
  data: &#123;
    email: 'alice@example.com',
    name: 'Alice',
    posts: &#123;
      create: [&#123; title: 'Hello World' &#125;],
    &#125;,
  &#125;,
&#125;);

// 读取（包含关系）
const userWithPosts = await prisma.user.findUnique(&#123;
  where: &#123; id: 'xxx' &#125;,
  include: &#123;
    posts: &#123;
      where: &#123; published: true &#125;,
      orderBy: &#123; createdAt: 'desc' &#125;,
      take: 5,
    &#125;,
    profile: true,
  &#125;,
&#125;);

// 更新
await prisma.user.update(&#123;
  where: &#123; id: 'xxx' &#125;,
  data: &#123; name: 'Alice Updated' &#125;,
&#125;);

// 删除
await prisma.user.delete(&#123; where: &#123; id: 'xxx' &#125; &#125;);
```

### 解决 N+1 问题

```typescript
// N+1 问题示例（避免！）
const users = await prisma.user.findMany();
for (const user of users) &#123;
  // 每个用户都触发一次查询
  const posts = await prisma.post.findMany(&#123; where: &#123; authorId: user.id &#125; &#125;);
&#125;
// 1 + N 次查询 ❌

// 正确做法：使用 include
const usersWithPosts = await prisma.user.findMany(&#123;
  include: &#123; posts: true &#125;,
&#125;);
// 1 次查询 ✅

// 或使用 select 精确控制字段
const users = await prisma.user.findMany(&#123;
  select: &#123;
    id: true,
    name: true,
    _count: &#123;
      select: &#123; posts: true &#125;,
    &#125;,
  &#125;,
&#125;);
```

### 全文搜索

```prisma
// Schema 中定义索引
model Post &#123;
  id      String @id @default(uuid())
  title   String
  content String?

  @@index([title, content], name: "post_search_idx")
&#125;
```

```typescript
// 使用 PostgreSQL 全文搜索
const posts = await prisma.$queryRaw`
  SELECT * FROM "Post"
  WHERE to_tsvector('chinese', title || ' ' || COALESCE(content, ''))
    @@ plainto_tsquery('chinese', $&#123;searchTerm&#125;)
  ORDER BY ts_rank(
    to_tsvector('chinese', title || ' ' || COALESCE(content, '')),
    plainto_tsquery('chinese', $&#123;searchTerm&#125;)
  ) DESC
`;
```

## 事务处理

```typescript
// 嵌套写事务
await prisma.$transaction(async (tx) => &#123;
  const user = await tx.user.create(&#123;
    data: &#123; email: 'new@example.com' &#125;,
  &#125;);

  await tx.post.create(&#123;
    data: &#123;
      title: 'Welcome Post',
      authorId: user.id,
    &#125;,
  &#125;);

  // 如果任何步骤失败，整个事务回滚
&#125;);

// 乐观锁（使用版本号）
await prisma.post.update(&#123;
  where: &#123; id: 'xxx', version: currentVersion &#125;,
  data: &#123;
    title: 'Updated',
    version: &#123; increment: 1 &#125;,
  &#125;,
&#125;);
```

## 与 API 层集成

### tRPC + Prisma

```typescript
// router.ts
import &#123; initTRPC &#125; from '@trpc/server';
import &#123; PrismaClient &#125; from '@prisma/client';

const t = initTRPC.create();
const prisma = new PrismaClient();

export const appRouter = t.router(&#123;
  user: t.router(&#123;
    list: t.procedure.query(() => prisma.user.findMany()),

    byId: t.procedure
      .input(z.string())
      .query((&#123; input &#125;) =>
        prisma.user.findUnique(&#123; where: &#123; id: input &#125; &#125;)
      ),

    create: t.procedure
      .input(z.object(&#123; email: z.string().email(), name: z.string() &#125;))
      .mutation((&#123; input &#125;) =>
        prisma.user.create(&#123; data: input &#125;)
      ),
  &#125;),
&#125;);
```

## 参考资源

| 资源 | 链接 |
|------|------|
| Prisma 文档 | https://www.prisma.io/docs |
| Prisma 示例 | https://github.com/prisma/prisma-examples |
| PostgreSQL 文档 | https://www.postgresql.org/docs/ |

---

 [← 返回数据库示例首页](./)
""")
print(f"Created database: {os.path.getsize(f6)} bytes")

# File 7: devops
f7 = os.path.join(base, 'devops', 'docker-containerization.md')
with open(f7, 'w', encoding='utf-8') as f:
    f.write("""---
title: "Docker 容器化部署实战"
description: "Node.js应用生产级容器化：多阶段构建、Compose、健康检查、安全扫描与CI/CD缓存"
date: 2026-05-03
tags: ["示例", "Docker", "容器化", "DevOps", "CI/CD", "安全", "Node.js"]
category: "examples"
---

# Docker 容器化部署实战

> Docker 已成为现代应用部署的标准。本文档将系统讲解 Node.js 应用的生产级容器化方案，从多阶段构建优化到安全加固的完整工作流。

## 多阶段构建优化

传统 Dockerfile 直接将源码和依赖打包，导致镜像体积臃肿。多阶段构建分离构建环境和运行环境：

```dockerfile
# 阶段1：构建
FROM node:22-alpine AS builder
WORKDIR /app

# 安装依赖
COPY package*.json ./
RUN npm ci

# 复制源码并构建
COPY . .
RUN npm run build

# 阶段2：生产运行
FROM node:22-alpine AS production
WORKDIR /app

# 仅安装生产依赖
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# 从构建阶段复制产物
COPY --from=builder /app/dist ./dist

# 非 root 用户运行
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
USER nodejs

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

EXPOSE 3000
CMD ["node", "dist/main.js"]
```

### 镜像体积对比

| 构建方式 | 镜像大小 | 说明 |
|----------|----------|------|
| 单阶段（全量） | 1.2GB | 包含 devDependencies、源码、.git |
| 多阶段优化 | 180MB | 仅生产依赖 + 构建产物 |
| 多阶段 + alpine | 85MB | 使用 alpine 基础镜像 |
| 多阶段 + distroless | 65MB | Google distroless（推荐） |

### 使用 Distroless 基础镜像

```dockerfile
# 更安全的运行时镜像
FROM gcr.io/distroless/nodejs22-debian12
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./

USER nonroot
EXPOSE 3000
CMD ["dist/main.js"]
```

## Docker Compose 开发环境

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      target: development  # 开发阶段
    ports:
      - '3000:3000'
    volumes:
      - .:/app
      - /app/node_modules  # 排除宿主机 node_modules
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://postgres:password@db:5432/myapp
    depends_on:
      - db
      - redis
    command: npm run dev

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: myapp
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - '5432:5432'

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'

  # 本地负载均衡测试
  nginx:
    image: nginx:alpine
    ports:
      - '80:80'
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - app

volumes:
  postgres_data:
```

## 优雅关闭与健康检查

```typescript
// src/server.ts
import express from 'express';

const app = express();
const server = app.listen(3000);

// 健康检查端点
app.get('/health', (req, res) => &#123;
  // 检查数据库连接等依赖
  const isHealthy = checkDependencies();
  res.status(isHealthy ? 200 : 503).json(&#123; status: isHealthy ? 'ok' : 'unhealthy' &#125;);
&#125;);

// 优雅关闭
async function gracefulShutdown(signal: string) &#123;
  console.log(`Received $&#123;signal&#125;, starting graceful shutdown...`);

  // 停止接收新请求
  server.close(async () => &#123;
    // 关闭数据库连接
    await prisma.$disconnect();

    // 关闭 Redis 连接
    await redis.quit();

    console.log('Graceful shutdown complete');
    process.exit(0);
  &#125;);

  // 强制退出兜底
  setTimeout(() => &#123;
    console.error('Forced shutdown after timeout');
    process.exit(1);
  &#125;, 30000);
&#125;

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
```

## 镜像安全扫描

```bash
# Trivy 扫描
npm install -g @aquasecurity/trivy
trivy image myapp:latest

# Snyk 扫描
npm install -g snyk
snyk container test myapp:latest

# Docker Scout
docker scout cves myapp:latest
```

```yaml
# .github/workflows/security.yml
name: Security Scan
on: push
jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build image
        run: docker build -t myapp:${&#123;&#123; github.sha &#125;&#125; .
      - name: Run Trivy
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: myapp:${&#123;&#123; github.sha &#125;&#125;
          format: sarif
          output: trivy-results.sarif
```

## CI/CD 中的 Docker 缓存

```yaml
# .github/workflows/docker.yml
name: Docker Build
on: push
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      # 设置 Buildx
      - uses: docker/setup-buildx-action@v3

      # 登录镜像仓库
      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: $&#123;&#123; github.actor &#125;&#125;
          password: $&#123;&#123; secrets.GITHUB_TOKEN &#125;&#125;

      # 构建并推送（利用缓存）
      - uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ghcr.io/$&#123;&#123; github.repository &#125;&#125;:$&#123;&#123; github.sha &#125;&#125;
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

## 参考资源

| 资源 | 链接 |
|------|------|
| Docker 文档 | https://docs.docker.com |
| Node.js Docker 最佳实践 | https://nodejs.org/en/docs/guides/nodejs-docker-webapp |
| Distroless 镜像 | https://github.com/GoogleContainerTools/distroless |
| Trivy 扫描器 | https://trivy.dev |

---

 [← 返回 DevOps 示例首页](./)
""")
print(f"Created devops: {os.path.getsize(f7)} bytes")

# File 8: microservices
f8 = os.path.join(base, 'microservices', 'grpc-service-communication.md')
with open(f8, 'w', encoding='utf-8') as f:
    f.write("""---
title: "gRPC 服务通信实战"
description: "高性能微服务间通信：Protocol Buffers、四种服务类型、拦截器、错误处理与服务网格集成"
date: 2026-05-03
tags: ["示例", "gRPC", "微服务", "Protocol Buffers", "RPC", "服务网格", "Envoy"]
category: "examples"
---

# gRPC 服务通信实战

> gRPC 是 Google 开源的高性能 RPC 框架，基于 HTTP/2 和 Protocol Buffers，在微服务架构中提供比 REST 更高效、更类型安全的通信方案。

## gRPC vs REST 对比

```mermaid
flowchart LR
    subgraph REST
        A[JSON] --> B[HTTP/1.1]
        B --> C[文本传输]
        C --> D[大体积]
    end
    subgraph gRPC
        E[Protobuf] --> F[HTTP/2]
        F --> G[二进制流]
        G --> H[小体积+多路复用]
    end
```

| 特性 | REST | gRPC |
|------|------|------|
| 协议 | HTTP/1.1 | HTTP/2 |
| 格式 | JSON | Protobuf（二进制） |
| 性能 | 中等 | 高（5-10x） |
| 类型安全 | 无 | 强类型 |
| 流支持 | 有限（SSE） | 原生双向流 |
| 浏览器 | 原生支持 | 需 gRPC-Web |
| 调试 | 容易 | 需工具 |

## Protocol Buffers 定义

```protobuf
// proto/ecommerce.proto
syntax = "proto3";

package ecommerce;

// 商品服务
service ProductService &#123;
  // Unary：获取单个商品
  rpc GetProduct(GetProductRequest) returns (Product);

  // Server Streaming：获取商品列表（流式返回）
  rpc ListProducts(ListProductsRequest) returns (stream Product);

  // Client Streaming：批量上传商品
  rpc BatchCreateProducts(stream CreateProductRequest) returns (BatchResult);

  // Bidirectional Streaming：实时价格更新
  rpc SubscribePriceUpdates(stream PriceSubscription) returns (stream PriceUpdate);
&#125;

message Product &#123;
  string id = 1;
  string name = 2;
  string description = 3;
  double price = 4;
  int32 stock = 5;
  repeated string tags = 6;
&#125;

message GetProductRequest &#123;
  string id = 1;
&#125;

message ListProductsRequest &#123;
  string category = 1;
  int32 page_size = 2;
  string page_token = 3;
&#125;

message CreateProductRequest &#123;
  string name = 1;
  double price = 2;
  int32 stock = 3;
&#125;

message BatchResult &#123;
  int32 created_count = 1;
  repeated string errors = 2;
&#125;

message PriceSubscription &#123;
  repeated string product_ids = 1;
&#125;

message PriceUpdate &#123;
  string product_id = 1;
  double new_price = 2;
  int64 timestamp = 3;
&#125;
```

## TypeScript gRPC 服务端

```typescript
// server.ts
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';

const PROTO_PATH = path.join(__dirname, '../proto/ecommerce.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, &#123;
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
&#125;);

const proto = grpc.loadPackageDefinition(packageDefinition).ecommerce as any;

// 商品数据存储
const products = new Map&lt;string, any&gt;();

const productService = &#123;
  // Unary
  getProduct: (call: grpc.ServerUnaryCall&lt;any, any&gt;, callback: grpc.sendUnaryData&lt;any&gt;) => &#123;
    const product = products.get(call.request.id);
    if (product) &#123;
      callback(null, product);
    &#125; else &#123;
      callback(&#123; code: grpc.status.NOT_FOUND, message: 'Product not found' &#125; as grpc.ServiceError, null);
    &#125;
  &#125;,

  // Server Streaming
  listProducts: (call: grpc.ServerWritableStream&lt;any, any&gt;) => &#123;
    const category = call.request.category;
    for (const [, product] of products) &#123;
      if (product.category === category) &#123;
        call.write(product);
      &#125;
    &#125;
    call.end();
  &#125;,

  // Client Streaming
  batchCreateProducts: (call: grpc.ServerReadableStream&lt;any, any&gt;, callback: grpc.sendUnaryData&lt;any&gt;) => &#123;
    const errors: string[] = [];
    let count = 0;

    call.on('data', (request: any) => &#123;
      try &#123;
        const id = `prod_$&#123;Date.now()&#125;_&#123;count&#125;`;
        products.set(id, &#123; id, ...request &#125;);
        count++;
      &#125; catch (e) &#123;
        errors.push(e.message);
      &#125;
    &#125;);

    call.on('end', () => &#123;
      callback(null, &#123; created_count: count, errors &#125;);
    &#125;);
  &#125;,

  // Bidirectional Streaming
  subscribePriceUpdates: (call: grpc.ServerDuplexStream&lt;any, any&gt;) => &#123;
    const subscribedIds = new Set&lt;string&gt;();

    call.on('data', (subscription: any) => &#123;
      subscription.product_ids.forEach((id: string) => subscribedIds.add(id));
      call.write(&#123;
        product_id: id,
        new_price: products.get(id)?.price ?? 0,
        timestamp: Date.now(),
      &#125;);
    &#125;);

    // 模拟价格更新推送
    const interval = setInterval(() => &#123;
      for (const id of subscribedIds) &#123;
        const product = products.get(id);
        if (product) &#123;
          call.write(&#123;
            product_id: id,
            new_price: product.price * (0.9 + Math.random() * 0.2),
            timestamp: Date.now(),
          &#125;);
        &#125;
      &#125;
    &#125;, 5000);

    call.on('end', () => &#123;
      clearInterval(interval);
    &#125;);
  &#125;,
&#125;;

// 启动服务器
const server = new grpc.Server();
server.addService(proto.ProductService.service, productService);
server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => &#123;
  console.log('gRPC server running on port 50051');
  server.start();
&#125;);
```

## TypeScript gRPC 客户端

```typescript
// client.ts
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';

const PROTO_PATH = path.join(__dirname, '../proto/ecommerce.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const proto = grpc.loadPackageDefinition(packageDefinition).ecommerce as any;

const client = new proto.ProductService(
  'localhost:50051',
  grpc.credentials.createInsecure()
);

// Unary 调用
async function getProduct(id: string) &#123;
  return new Promise((resolve, reject) => &#123;
    client.getProduct(&#123; id &#125;, (err: any, response: any) => &#123;
      if (err) reject(err);
      else resolve(response);
    &#125;);
  &#125;);
&#125;

// Server Streaming
function listProducts(category: string) &#123;
  const stream = client.listProducts(&#123; category &#125;);
  stream.on('data', (product: any) => &#123;
    console.log('Received:', product.name);
  &#125;);
  stream.on('end', () => &#123;
    console.log('Stream ended');
  &#125;);
&#125;

// Client Streaming
async function batchCreateProducts(products: any[]) &#123;
  const stream = client.batchCreateProducts((err: any, result: any) => &#123;
    if (err) console.error(err);
    else console.log('Created:', result.created_count);
  &#125;);

  for (const product of products) &#123;
    stream.write(product);
  &#125;
  stream.end();
&#125;
```

## 拦截器与元数据

```typescript
// 认证拦截器
const authInterceptor = (options: any, nextCall: any) => &#123;
  return new grpc.InterceptingCall(nextCall(options), &#123;
    start: (metadata, listener, next) => &#123;
      metadata.set('authorization', `Bearer $&#123;getToken()&#125;`);
      next(metadata, listener);
    &#125;,
  &#125;);
&#125;;

const client = new proto.ProductService('localhost:50051', grpc.credentials.createInsecure(), &#123;
  interceptors: [authInterceptor],
&#125;);

// 服务端拦截器
server.addService(proto.ProductService.service, productService, &#123;
  interceptors: [loggingInterceptor, authInterceptor],
&#125;);
```

## 错误处理

| gRPC 状态码 | HTTP 对应 | 使用场景 |
|------------|----------|---------|
| OK (0) | 200 | 成功 |
| CANCELLED (1) | 499 | 客户端取消 |
| INVALID_ARGUMENT (3) | 400 | 参数错误 |
| NOT_FOUND (5) | 404 | 资源不存在 |
| ALREADY_EXISTS (6) | 409 | 资源已存在 |
| PERMISSION_DENIED (7) | 403 | 权限不足 |
| UNAUTHENTICATED (16) | 401 | 未认证 |
| UNAVAILABLE (14) | 503 | 服务不可用 |
| DEADLINE_EXCEEDED (4) | 504 | 超时 |

## 服务网格集成

```mermaid
flowchart TB
    A[服务A] -->|gRPC| B[Envoy Sidecar]
    C[服务B] -->|gRPC| D[Envoy Sidecar]
    B -->|mTLS| D
    D -->|负载均衡| E[gRPC服务集群]
    E --> F[健康检查]
    E --> G[熔断器]
    E --> H[重试策略]
```

## 参考资源

| 资源 | 链接 |
|------|------|
| gRPC 官方文档 | https://grpc.io/docs/ |
| Protocol Buffers | https://protobuf.dev/ |
| gRPC-Web | https://github.com/grpc/grpc-web |
| Envoy Proxy | https://www.envoyproxy.io/ |

---

 [← 返回微服务示例首页](./)
""")
print(f"Created microservices: {os.path.getsize(f8)} bytes")

print('All 8 files created!')
