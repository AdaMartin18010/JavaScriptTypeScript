# 部署平台对比

> Vercel、Netlify、Cloudflare Pages、Railway、Render 的深度对比矩阵。

---

## 对比矩阵

| 维度 | Vercel | Netlify | Cloudflare Pages | Railway | Render |
|------|--------|---------|------------------|---------|--------|
| **Next.js 支持** | ✅ 完美 | ✅ 良好 | ⚠️ 部分 | ✅ | ✅ |
| **ISR** | ✅ 原生 | ✅ | ⚠️ | ⚠️ | ⚠️ |
| **Edge Middleware** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **预览部署** | ✅ PR 自动 | ✅ | ✅ | ❌ | ❌ |
| **冷启动** | 无 | 无 | ~12ms | 无 | 30–60s |
| **免费构建分钟** | 6,000/月 | 300/月 | 500/月 | 500/月 | 500/月 |
| **商业免费 tier** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **数据库原生** | ❌ | ❌ | D1/KV | ✅ | ✅ |
| **Pro 定价** | $20/用户/月 | $19/用户/月 | $5/月 | $20/月固定 | 按服务计费 |

---

## 深度对比：Vercel vs Netlify vs AWS vs GCP

| 维度 | Vercel | Netlify | AWS (Amplify / ECS) | GCP (Cloud Run / Firebase) |
|------|--------|---------|---------------------|---------------------------|
| **定位** | 前端优先 / 全托管 | 前端优先 / JAMstack | 云基础设施全栈 | 云基础设施全栈 |
| **部署模型** | Git 触发自动构建 | Git 触发自动构建 | 容器 / Serverless | 容器 / Serverless |
| **框架优化** | ⭐⭐⭐⭐⭐ (Next.js 原生) | ⭐⭐⭐⭐ (广泛支持) | ⭐⭐⭐ (通用) | ⭐⭐⭐⭐ (Firebase 集成) |
| **Edge Network** | Vercel Edge Network | Netlify Edge | CloudFront / Lambda@Edge | Cloud CDN / Cloud Functions |
| **Serverless Functions** | ✅ Node.js / Edge Runtime | ✅ Node.js / Go / Rust | ✅ Lambda (全语言) | ✅ Cloud Functions / Run |
| **容器支持** | ❌ | ❌ | ✅ ECS / EKS / Fargate | ✅ Cloud Run / GKE |
| **数据库集成** | 第三方 (Neon / Upstash) | 第三方 (Fauna / Supabase) | ✅ RDS / DynamoDB / Aurora | ✅ Cloud SQL / Firestore |
| **自定义域名** | ✅ 免费 SSL | ✅ 免费 SSL | ✅ Route53 + ACM | ✅ Cloud DNS + SSL |
| **流量成本** | 包含在套餐 | 包含在套餐 | 按出站流量计费 | 按出站流量计费 |
| **Vendor Lock-in** | 中 (Next.js 深度绑定) | 低 | 高 | 高 |
| **合规认证** | SOC 2 Type II | SOC 2 Type II | 全面 (ISO, HIPAA, FedRAMP) | 全面 (ISO, HIPAA, FedRAMP) |
| **适用场景** | Next.js 全栈 / 前端 | 静态站点 / JAMstack | 企业级 / 复杂架构 | 数据密集型 / GCP 生态 |

---

## 代码示例

### Vercel：Serverless Function (`api/hello.ts`)

```typescript
// api/hello.ts — Vercel Serverless Function
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const { name = 'World' } = req.query;

  res.status(200).json({
    message: `Hello, ${name}!`,
    timestamp: new Date().toISOString(),
    region: process.env.VERCEL_REGION,
  });
}
```

### Cloudflare Pages：Edge Function (`functions/api/[[path]].ts`)

```typescript
// functions/api/[[path]].ts — Cloudflare Pages Function (Edge Runtime)
export interface Env {
  KV_NAMESPACE: KVNamespace;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env, params } = context;
  const url = new URL(request.url);

  // Edge KV 读取
  const cached = await env.KV_NAMESPACE.get(url.pathname);
  if (cached) {
    return new Response(cached, {
      headers: { 'Content-Type': 'application/json', 'X-Cache': 'HIT' },
    });
  }

  const data = {
    path: params.path,
    method: request.method,
    cf: request.cf, // Cloudflare 请求元数据
    timestamp: Date.now(),
  };

  const json = JSON.stringify(data);
  await env.KV_NAMESPACE.put(url.pathname, json, { expirationTtl: 60 });

  return new Response(json, {
    headers: { 'Content-Type': 'application/json', 'X-Cache': 'MISS' },
  });
};
```

### AWS CDK：ECS Fargate 部署

```typescript
// lib/web-stack.ts
import * as cdk from 'aws-cdk-lib';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecsPatterns from 'aws-cdk-lib/aws-ecs-patterns';
import * as ecrAssets from 'aws-cdk-lib/aws-ecr-assets';

export class WebStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const image = new ecrAssets.DockerImageAsset(this, 'WebImage', {
      directory: './',
      file: 'Dockerfile',
    });

    new ecsPatterns.ApplicationLoadBalancedFargateService(this, 'WebService', {
      taskImageOptions: {
        image: ecs.ContainerImage.fromDockerImageAsset(image),
        containerPort: 3000,
        environment: {
          NODE_ENV: 'production',
          PORT: '3000',
        },
      },
      desiredCount: 2,
      cpu: 512,
      memoryLimitMiB: 1024,
      publicLoadBalancer: true,
    });
  }
}
```

### Railway：Dockerfile 部署

```dockerfile
# Dockerfile — Railway / Render / Fly.io 通用
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json .
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json .
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

### GitHub Actions CI/CD 流水线

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

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build

      # 部署到 Vercel
      - name: Deploy to Vercel
        uses: vercel/action-deploy@v1
        if: github.ref == 'refs/heads/main'
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}

      # 或部署到 Cloudflare Pages
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        if: github.ref == 'refs/heads/main'
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: my-app
          directory: dist
```

### Terraform：多平台基础设施即代码

```hcl
# terraform/main.tf — AWS + Cloudflare DNS
terraform {
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.0" }
    cloudflare = { source = "cloudflare/cloudflare", version = "~> 4.0" }
  }
}

provider "aws" {
  region = "us-east-1"
}

# ECS Cluster
resource "aws_ecs_cluster" "app" {
  name = "my-app-cluster"
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

# Cloudflare DNS Record
resource "cloudflare_record" "app" {
  zone_id = var.cloudflare_zone_id
  name    = "app"
  type    = "CNAME"
  value   = aws_lb.app.dns_name
  proxied = true
}
```

---

## 实测性能

| 指标 | Vercel | Netlify | Cloudflare |
|------|--------|---------|------------|
| TTFB | ~70ms | ~90ms | ~30ms |
| Edge Function 冷启动 | ~12ms | ~28ms | ~0ms |

---

## 选型建议

| 场景 | 推荐平台 |
|------|---------|
| Next.js App Router + RSC | Vercel |
| 静态站点 / JAMstack / 表单 | Netlify |
| 全球边缘 / 低延迟 API | Cloudflare Pages |
| 全栈 + PostgreSQL / Redis | Railway / Render |
| 企业级 / 合规要求 | AWS / GCP / Azure |
| 容器化微服务 | AWS ECS / GCP Cloud Run |

---

## 权威参考链接

| 资源 | 链接 | 说明 |
|------|------|------|
| Vercel Docs | <https://vercel.com/docs> | 官方文档与框架指南 |
| Vercel Edge Runtime | <https://edge-runtime.vercel.app/> | 边缘运行时 API 参考 |
| Netlify Docs | <https://docs.netlify.com/> | 官方文档 |
| Netlify Edge Functions | <https://docs.netlify.com/edge-functions/overview/> | 边缘函数文档 |
| Cloudflare Pages | <https://developers.cloudflare.com/pages/> | 官方开发者文档 |
| Cloudflare Workers | <https://developers.cloudflare.com/workers/> | Workers 运行时文档 |
| Railway Docs | <https://docs.railway.app/> | 官方文档 |
| Render Docs | <https://render.com/docs> | 官方文档 |
| AWS Amplify | <https://docs.amplify.aws/> | AWS 全栈部署文档 |
| AWS CDK | <https://docs.aws.amazon.com/cdk/> | 基础设施即代码 |
| GCP Cloud Run | <https://cloud.google.com/run/docs> | 容器化 Serverless |
| Fly.io Docs | <https://fly.io/docs/> | 全球应用部署平台 |
| DigitalOcean App Platform | <https://docs.digitalocean.com/products/app-platform/> | 简化应用部署 |
| web.dev 部署指南 | <https://web.dev/articles/deploy-to-netlify> | Google 官方部署最佳实践 |
| Jamstack.org | <https://jamstack.org/generators/> | 静态站点生成器对比 |
| Docker Docs | <https://docs.docker.com/> | 容器化部署标准 |
| Terraform Registry | <https://registry.terraform.io/> | 基础设施模块市场 |
| GitHub Actions Docs | <https://docs.github.com/en/actions> | CI/CD 自动化 |
| State of JS: Deployment | <https://stateofjs.com/en-US/other_tools/deployment/> | 开发者部署平台调查 |

---

*最后更新: 2026-04-29*

---

## 深化补充：更多平台实战示例与权威参考

### Netlify Edge Function 示例

```typescript
// netlify/edge-functions/geo.ts
import type { Context } from 'https://edge.netlify.com/';

export default async (request: Request, context: Context) => {
  const url = new URL(request.url);
  const country = context.geo?.country?.code || 'UNKNOWN';

  if (url.pathname === '/api/geo') {
    return Response.json({
      message: `Hello from ${country}`,
      deployId: context.deploy.id,
      edgeRegion: context.site.url,
    });
  }
  return context.next();
};
```

### Render Blueprint 基础设施即代码

```yaml
# render.yaml
services:
  - type: web
    name: my-app
    runtime: node
    plan: standard
    buildCommand: npm ci && npm run build
    startCommand: node dist/server.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: postgres-db
          property: connectionString
databases:
  - name: postgres-db
    plan: starter
```

### 多平台部署抽象层

```typescript
// lib/deploy-adapter.ts
interface DeployAdapter {
  name: string;
  edgeRuntime: boolean;
  supportedRegions: string[];
  deploy(options: DeployOptions): Promise<DeployResult>;
}
const adapters: Record<string, DeployAdapter> = {
  vercel: { name: 'Vercel', edgeRuntime: true, supportedRegions: ['iad1', 'hkg1'], async deploy(opts) { return { url: '' }; } },
  cloudflare: { name: 'Cloudflare', edgeRuntime: true, supportedRegions: ['global'], async deploy(opts) { return { url: '' }; } },
};
```

### 权威外部链接索引

| 资源 | 链接 | 说明 |
|------|------|------|
| Vercel Docs | <https://vercel.com/docs> | Vercel 官方文档 |
| Netlify Docs | <https://docs.netlify.com/> | Netlify 官方文档 |
| Cloudflare Pages Docs | <https://developers.cloudflare.com/pages/> | Cloudflare 官方文档 |
| Railway Docs | <https://docs.railway.app/> | Railway 官方文档 |
| Render Docs | <https://render.com/docs> | Render 官方文档 |
| Fly.io Docs | <https://fly.io/docs/> | Fly.io 官方文档 |
| AWS CDK | <https://docs.aws.amazon.com/cdk/> | AWS 基础设施即代码 |
| OpenNext | <https://open-next.js.org/> | 开源 Next.js 部署适配器 |
| SST | <https://sst.dev/> | AWS 基础设施框架 |
| Pulumi | <https://www.pulumi.com/docs/> | 多语言基础设施即代码 |
| Deno Deploy | <https://docs.deno.com/deploy/> | Deno 边缘部署 |
