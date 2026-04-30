# 部署平台 (Deployment Platforms)

> JavaScript/TypeScript 应用部署平台的全景对比，覆盖边缘部署、无服务器与容器化方案。

---

## 核心概念

2026 年部署平台按**运行时模型**分为三类：

| 模型 | 特点 | 代表平台 |
|------|------|---------|
| **边缘部署** | V8 Isolates，全球 CDN，极低冷启动 | Vercel Edge, Cloudflare Pages, Deno Deploy |
| **无服务器函数** | 事件驱动，按需计费，自动扩缩容 | Vercel Serverless, Netlify Functions, AWS Lambda |
| **容器化部署** | 完整 Node.js 运行时，持久化支持 | Railway, Render, Fly.io, DigitalOcean |

> **关键认知**：没有"最好的平台"，只有"最适合你业务模型"的平台。

---

## 主流平台对比矩阵

| 维度 | Vercel | Netlify | Cloudflare Pages | Railway | Render |
|------|--------|---------|------------------|---------|--------|
| **核心优势** | Next.js 原生，最佳 DX | 多框架支持，商业免费 | 无限带宽，边缘优先 | 全栈一体，数据库原生 | Docker 原生，Heroku 替代 |
| **Next.js App Router** | ✅ 完美支持 | ✅（Next Runtime） | ⚠️ 部分支持 | ✅ | ✅ |
| **ISR** | ✅ 原生 | ✅ | ⚠️ 需配置 | ⚠️ | ⚠️ |
| **Edge Middleware** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Preview Deployments** | ✅（PR 自动预览） | ✅ | ✅ | ❌ | ❌ |
| **冷启动** | 无 | 无 | ~12ms | 无（持续运行） | 30–60s（免费 tier） |
| **免费构建分钟** | 6,000/月 | 300/月 | 500/月 | 500/月 | 500/月 |
| **带宽（免费）** | 100 GB | 100 GB | 无限 | 100 GB | 100 GB |
| **商业使用（免费 tier）** | ❌ 禁止 | ✅ 允许 | ✅ 允许 | ✅ 允许 | ✅ 允许 |
| **数据库原生** | ❌（需外部） | ❌（需外部） | D1 / KV | ✅ Postgres/Redis/MySQL | ✅ Postgres/Redis |
| **定价（Pro）** | $20/用户/月 | $19/用户/月 | $5/月 | $20/月（固定） | 按服务计费 |

---

## 深度对比

### Vercel vs Netlify

| 指标 | Vercel | Netlify |
|------|--------|---------|
| TTFB（平均） | ~70ms | ~90ms |
| Edge Function 冷启动 | ~12ms | ~28ms |
| Serverless 冷启动 | ~1s | ~3s+ |
| 边缘节点数 | 100+ | 16+ |
| Turborepo 集成 | 原生 | 插件 |

> **实测数据**：Social Animal 团队运行 91K+ ISR 页面，Vercel Pro 为主力平台，Netlify 处理 Astro 静态站点。

### Cloudflare Pages 的独特价值

- **无限带宽**：高流量场景下成本显著低于 Vercel/Netlify
- **Workers 集成**：同一平台部署静态页面 + 边缘函数 + D1 数据库
- **D1 边缘数据库**：SQLite 兼容，全球复制，查询延迟 <50ms
- **限制**：Next.js App Router 部分功能（如 Server Actions）需适配

### Railway 与 Render 的全栈定位

| 特性 | Railway | Render |
|------|---------|--------|
| 定价模式 | 用量计费 + 固定 Pro | 按服务计费 |
| 数据库 | 一键创建 Postgres/Redis | 一键创建 Postgres/Redis |
| Docker | 原生支持 | 原生支持 |
| 后台任务 | 原生支持 | 原生支持（Cron） |
| 预览部署 | ❌ | ❌ |
| 最佳场景 | 全栈 Next.js + 数据库 | Heroku 迁移，Docker 部署 |

---

## 选型决策树

```
项目需求？
├── Next.js + 前沿功能优先 → Vercel
├── 多框架 / 商业免费 tier → Netlify
├── 高流量 / 成本控制优先 → Cloudflare Pages
├── 全栈（前端 + 数据库 + 后端）→ Railway
├── Heroku 迁移 / Docker 原生 → Render
└── 全球边缘 + 低延迟 API → Cloudflare Workers / Deno Deploy
```

---

## 2026 新兴趋势

### 边缘数据库崛起

- **Cloudflare D1**：SQLite 兼容，全球边缘复制，零配置
- **Turso**：libSQL fork，基于 Fly.io 全球部署，嵌入式 SQLite
- **Vercel Postgres / KV**：与 Next.js 深度集成，Vercel Dashboard 统一管理

### ISR 与 Partial Prerendering (PPR)

Next.js 14+ 的 PPR 允许页面同时包含静态和动态部分：

- **Vercel**：原生支持，零配置
- **Netlify**：通过 Next Runtime 支持
- **自托管**：需自定义缓存策略和 CDN 配置

### 部署平台 MCP Server

2026 年多个平台推出 **MCP（Model Context Protocol）Server**，允许 AI Agent 直接执行部署、回滚、日志查询等操作：

- Vercel MCP：通过 AI 触发部署和预览
- Cloudflare MCP：管理 Workers 和 KV 存储
- Railway MCP：创建数据库实例和服务

---

## 代码示例

### Vercel Edge Function（Middleware）

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export const config = { matcher: ['/api/:path*'] };

export function middleware(request: NextRequest) {
  const country = request.geo?.country ?? 'US';
  const response = NextResponse.next();
  response.headers.set('x-edge-region', request.geo?.region ?? 'unknown');

  // A/B 测试：按国家分桶
  if (country === 'CN') {
    return NextResponse.rewrite(new URL('/api/cn-variant', request.url));
  }
  return response;
}
```

### Cloudflare Pages Function（边缘函数）

```typescript
// functions/api/[[route]].ts
import { PagesFunction } from '@cloudflare/workers-types';

export const onRequestGet: PagesFunction<{ DB: D1Database }> = async (context) => {
  const { DB } = context.env;
  const { results } = await DB.prepare('SELECT * FROM users WHERE id = ?')
    .bind(context.params.id)
    .all();
  return Response.json(results);
};
```

### AWS Lambda + API Gateway（Serverless Framework）

```yaml
# serverless.yml
service: my-api
provider:
  name: aws
  runtime: nodejs20.x
  region: us-east-1
functions:
  hello:
    handler: dist/handler.hello
    events:
      - http:
          path: hello
          method: get
```

```typescript
// handler.ts
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

export const hello = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'Hello from Lambda', path: event.path }),
  };
};
```

### Dockerfile（通用 Node.js 生产部署）

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./
EXPOSE 3000
USER node
CMD ["node", "dist/main.js"]
```

### Fly.io 部署配置（fly.toml）

```toml
# fly.toml
app = "my-node-app"
primary_region = "iad"

[build]
  dockerfile = "Dockerfile"

[http_service]
  internal_port = 3000
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0

[[vm]]
  size = "shared-cpu-1x"
  memory = "512mb"
```

### Deno Deploy 边缘函数

```typescript
// main.ts
import { serve } from 'https://deno.land/std@0.192.0/http/server.ts';

serve((req) => {
  const url = new URL(req.url);
  if (url.pathname === '/api/edge') {
    return new Response(JSON.stringify({ region: Deno.env.get('DENO_REGION'), time: Date.now() }), {
      headers: { 'content-type': 'application/json' },
    });
  }
  return new Response('Not Found', { status: 404 });
});
```

### GitHub Actions CI/CD 部署流水线

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint and Test
        run: |
          npm run lint
          npm run test:ci

      - name: Build
        run: npm run build
        env:
          NODE_ENV: production

      - name: Deploy to Vercel
        uses: vercel/action-deploy@v1
        if: github.ref == 'refs/heads/main'
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

### Terraform 基础设施即代码

```hcl
# main.tf — AWS Lambda + API Gateway
terraform {
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.0" }
  }
}

provider "aws" { region = "us-east-1" }

resource "aws_lambda_function" "api" {
  function_name = "js-api"
  runtime       = "nodejs20.x"
  handler       = "handler.handler"
  filename      = "./dist/lambda.zip"
  source_code_hash = filebase64sha256("./dist/lambda.zip")

  environment {
    variables = {
      NODE_ENV = "production"
    }
  }
}

resource "aws_apigatewayv2_api" "http_api" {
  name          = "js-http-api"
  protocol_type = "HTTP"
}
```

### 健康检查驱动的部署门控

```typescript
// deploy-gate.ts — 蓝绿部署与自动回滚门控
interface DeploymentGate {
  healthEndpoint: string;
  timeoutMs: number;
  retries: number;
  rollback: () => Promise<void>;
}

class DeployGateKeeper {
  async deployWithGate(
    deployFn: () => Promise<void>,
    gate: DeploymentGate
  ): Promise<'success' | 'rolled-back'> {
    await deployFn();

    const healthy = await this.probeHealth(gate);
    if (!healthy) {
      console.error('Health check failed. Initiating rollback...');
      await gate.rollback();
      return 'rolled-back';
    }

    return 'success';
  }

  private async probeHealth(gate: DeploymentGate): Promise<boolean> {
    for (let i = 0; i < gate.retries; i++) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), gate.timeoutMs);
        const res = await fetch(gate.healthEndpoint, { signal: controller.signal });
        clearTimeout(timer);

        if (res.ok) return true;
      } catch {
        // 继续重试
      }
      await new Promise((r) => setTimeout(r, 2000));
    }
    return false;
  }
}

// 使用示例
const gateKeeper = new DeployGateKeeper();
await gateKeeper.deployWithGate(
  async () => {
    // 执行实际部署（如更新 K8s Deployment 镜像）
    console.log('Deploying new version...');
  },
  {
    healthEndpoint: 'https://my-app.fly.dev/healthz',
    timeoutMs: 5000,
    retries: 5,
    rollback: async () => {
      // 回滚到上一个镜像版本
      console.log('Rolling back to previous version...');
    },
  }
);
```

---

## 最佳实践

1. **分离构建与部署**：CI 负责构建 Artifact，部署平台仅负责分发
2. **环境一致性**：开发 / 预览 / 生产使用相同 Node.js 版本和构建参数
3. **健康检查**：部署后自动探测 `/health` 端点，失败自动回滚
4. **带宽监控**：设置告警阈值，避免意外超额费用（Vercel $0.15/GB，Netlify 更贵）
5. **边缘安全**：敏感 API 使用边缘鉴权（JWT + Cloudflare Access / Vercel Edge Config）

---

## 参考资源

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Edge Functions](https://vercel.com/docs/functions/edge-functions)
- [Netlify Documentation](https://docs.netlify.com/)
- [Netlify Edge Functions](https://docs.netlify.com/edge-functions/overview/)
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Railway Documentation](https://docs.railway.app/)
- [Render Documentation](https://render.com/docs)
- [Fly.io Documentation](https://fly.io/docs/)
- [Deno Deploy](https://docs.deno.com/deploy/manual/)
- [AWS Lambda Developer Guide](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html)
- [Serverless Framework](https://www.serverless.com/framework/docs)
- [Docker — Best Practices for Node.js](https://docs.docker.com/build/building/best-practices/)
- [Vercel vs Netlify vs Cloudflare (2026)](https://socialanimal.dev/blog/best-deployment-stack-nextjs-vercel-netlify-cloudflare/)
- [Best Next.js Hosting 2026](https://thesoftwarescout.com/best-hosting-for-next-js-apps-in-2026-where-to-deploy-your-project/)
- [web.dev — Learn Core Web Vitals](https://web.dev/learn-core-web-vitals/)
- [MDN — Deploying Web Applications](https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Tools_and_setup/How_much_does_it_cost)
- [GitHub Actions Documentation](https://docs.github.com/en/actions) — CI/CD 自动化
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs) — AWS 基础设施即代码
- [Cloudflare Workers Pricing](https://developers.cloudflare.com/workers/platform/pricing/) — Workers 定价模型
- [AWS Lambda Limits](https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html) — Lambda 服务限制
- [Docker Multi-Stage Builds](https://docs.docker.com/build/building/multi-stage/) — 优化镜像大小
- [The Twelve-Factor App — Config](https://12factor.net/config) — 环境变量管理最佳实践
- [Vercel Edge Config](https://vercel.com/docs/storage/edge-config) — 边缘配置存储
- [Fly.io Autoscaling](https://fly.io/docs/reference/configuration/#services-autoscaling) — 自动扩缩容配置
- [Deno Deploy Runtime API](https://docs.deno.com/deploy/api/) — Deno Deploy 运行时 API
- [AWS Well-Architected Framework](https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html) — AWS 架构最佳实践
- [Cloudflare Pages Functions Limits](https://developers.cloudflare.com/pages/functions/limitations/) — Pages Functions 限制说明
- [Railway Deployment Patterns](https://docs.railway.app/reference/deployment-patterns) — Railway 部署模式
- [Render Health Checks](https://render.com/docs/health-checks) — Render 健康检查配置
- [Next.js Deployment Documentation](https://nextjs.org/docs/app/building-your-application/deploying) — Next.js 官方部署指南
- [OWASP Deployment Security](https://owasp.org/www-project-devsecops-guideline/latest/02a-Continuous-Integration/Deployment) — 部署安全指南

---

## 关联文档

- `30-knowledge-base/30.2-categories/13-ci-cd.md`
- `30-knowledge-base/30.2-categories/08-monorepo-tools.md`
- `20-code-lab/20.8-edge-serverless/`
- `40-ecosystem/comparison-matrices/deployment-platforms-compare.md`

---

*最后更新: 2026-04-30*
