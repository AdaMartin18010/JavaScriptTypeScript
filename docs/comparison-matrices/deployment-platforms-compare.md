# 部署平台对比矩阵

> 最后更新：2026年4月

## 核心对比表

| 特性 | Vercel | Netlify | Cloudflare Pages+Workers | AWS Amplify | Render | Fly.io | Railway | Docker+K8s |
|------|--------|---------|--------------------------|-------------|--------|--------|---------|------------|
| **流行度/Stars** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **SSR 支持** | 🟢 Next.js 最优 | 🔵 需适配 | 🟢 Workers 支持 | 🟢 | 🟢 原生 | 🟢 原生 | 🟢 原生 | 🟢 完全可控 |
| **SSG 支持** | 🟢 原生 | 🟢 原生 | 🟢 原生 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 |
| **ISR 支持** | 🟢 原生 (Next.js) | 🔴 无 | 🟡 边缘 KV 模拟 | 🔵 有限 | 🔴 无 | 🔴 无 | 🔴 无 | 🟢 需自实现 |
| **边缘函数 (Edge Functions)** | 🟢 Vercel Edge | 🟢 Netlify Edge | 🟢 Workers (全球) | 🔵 Lambda@Edge | 🔴 无 | 🔵 部分 | 🔴 无 | 🟢 自托管边缘 |
| **冷启动** | ⚡ 无 (边缘) | ⚡ 无 | ⚡ 无 | 🐢 中 (Lambda) | 🐢 中 | 🚀 快 | 🚀 快 | 🐢 慢 |
| **构建时长限制** | 45min (Pro) | 30min | 20min | 30min | 无限制 | 无限制 | 无限制 | 无限制 |
| **并发限制** | 高 | 高 | 极高 | 高 | 中 | 高 | 中 | 🟢 完全可控 |
| **自定义域名/HTTPS** | 🟢 原生 | 🟢 原生 | 🟢 原生 | 🟢 原生 | 🟢 原生 | 🟢 原生 | 🟢 原生 | 🟢 需配置 |
| **免费额度** | 🟢 慷慨 | 🟢 慷慨 | 🟢 非常慷慨 | 🟢  generous | 🟢  generous | 🟡 需信用卡 | 🟡 有限 | 🔵 自托管成本 |
| **Git 集成** | 🟢 深度 (GitHub/GitLab/Bitbucket) | 🟢 深度 | 🟢 深度 | 🟢 深度 | 🟢 原生 | 🔵 CLI 优先 | 🟢 原生 | 🔵 需 CI/CD |
| **Rollback** | 🟢 即时 | 🟢 即时 | 🟢 即时 | 🟢 即时 | 🟢 原生 | 🟢 原生 | 🟢 原生 | 🟢 完全可控 |
| **TypeScript 原生支持度** | 🟢 最佳 (Next.js) | 🟢 良好 | 🟢 良好 | 🟢 良好 | 🟢 良好 | 🟢 良好 | 🟢 良好 | 🟢 完全可控 |

## 详细分析

### Vercel

```bash
npm i -g vercel
vercel --prod
```

- **定位**: 前端云 (Frontend Cloud)，Next.js 官方托管平台
- **核心原理**: 基于 Serverless Functions 的按需构建与部署
- **优势**:
  - **Next.js 体验最佳**：ISR、App Router、Server Components 原生支持
  - 边缘函数 (Edge Functions) 全球部署
  - 预览部署 (Preview Deployment) 集成 PR 工作流
  - 图像优化、分析、速度洞察内置
  - 零配置即可启动
- **劣势**:
  - 服务端逻辑限制在 Serverless 模型
  - 长时间运行任务受限（函数超时限制）
  - 大规模流量成本上升
- **适用场景**: Next.js/React 项目、需要 ISR/SSR 的前端应用

```json
// vercel.json
{
  "version": 2,
  "builds": [
    { "src": "package.json", "use": "@vercel/next" }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/api/$1" }
  ],
  "functions": {
    "api/*.ts": {
      "maxDuration": 30
    }
  },
  "crons": [
    {
      "path": "/api/cron/daily",
      "schedule": "0 0 * * *"
    }
  ]
}
```

```typescript
// app/api/hello/route.ts (Next.js App Router)
export const runtime = 'edge'  // 或 'nodejs'

export async function GET(request: Request) {
  return Response.json({ message: 'Hello from Vercel Edge' })
}
```

### Netlify

```bash
npm i -g netlify-cli
netlify deploy --prod
```

- **定位**: 现代 Web 项目的全功能托管与自动化平台
- **核心原理**: Git 驱动 CI/CD + 边缘函数 + 表单处理
- **优势**:
  - **JAMstack 先驱**，静态托管体验成熟
  - 边缘函数 (Netlify Edge Functions) 基于 Deno
  - 内置表单处理、身份验证、大数据分析
  - Split Testing (分支 A/B 测试)
  - 大屏展示和部署预览完善
- **劣势**:
  - SSR 支持不如 Vercel 深度
  - 服务端逻辑有一定限制
- **适用场景**: 静态站点、JAMstack、内容驱动网站、需要边缘计算的项目

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "22"

[[edge_functions]]
  function = "hello"
  path = "/api/hello"

[dev]
  command = "npm run dev"
  targetPort = 5173

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
```

```typescript
// netlify/edge-functions/hello.ts
import type { Context } from '@netlify/edge-functions'

export default async (request: Request, context: Context) => {
  const url = new URL(request.url)
  const name = url.searchParams.get('name') || 'world'

  return new Response(`Hello ${name} from Netlify Edge!`)
}

export const config = { path: '/api/hello' }
```

### Cloudflare Pages + Workers

```bash
npm create cloudflare@latest
# 或 Wrangler CLI
npx wrangler pages deploy dist
```

- **定位**: 全球边缘网络驱动的全栈部署平台
- **核心原理**: 内容分发到 300+ 边缘节点 + Workers V8 Isolate 执行
- **优势**:
  - **全球边缘部署**，延迟极低
  - Workers 冷启动几乎为零 (V8 Isolates)
  - 与 Cloudflare 生态整合（R2、D1、KV、Durable Objects）
  - 免费额度极其慷慨
  - Pages Functions 与 Workers 无缝结合
- **劣势**:
  - Workers 有运行时限制（CPU 时间、内存）
  - Node.js 兼容层仍在完善
  - 调试本地与生产环境差异
- **适用场景**: 边缘优先应用、全球用户、需要低延迟的 API

```typescript
// functions/api/hello.ts (Pages Functions)
interface Env {}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env, params } = context

  return Response.json({
    message: 'Hello from Cloudflare Pages Functions',
    cf: request.cf,
  })
}
```

```typescript
// Worker (独立部署)
export interface Env {
  MY_KV: KVNamespace
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const value = await env.MY_KV.get('key')
    return Response.json({ value })
  },
}
```

```toml
# wrangler.toml
name = "my-worker"
main = "src/index.ts"
compatibility_date = "2026-04-01"

[[kv_namespaces]]
binding = "MY_KV"
id = "xxx"
```

### AWS Amplify

```bash
npm install -g @aws-amplify/cli
amplify init
amplify hosting add
amplify publish
```

- **定位**: AWS 全托管的前后端一体化部署平台
- **核心原理**: 封装 AWS CloudFormation + S3/CloudFront + Lambda/AppSync
- **优势**:
  - 与 AWS 服务深度集成（Cognito、AppSync、S3、DynamoDB）
  - 可视化建站工具 (Amplify Studio)
  - 自动生成 CI/CD 管道
  - 前端托管 + 后端资源一键部署
- **劣势**:
  - 抽象层故障排查困难
  - 超出免费额度后 AWS 账单复杂
  - 构建速度相对慢
  - 冷启动受 Lambda 限制
- **适用场景**: 需要 AWS 生态集成的全栈应用、移动端+Web 项目

```yaml
# amplify.yml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
backend:
  phases:
    build:
      commands:
        - amplifyPush --simple
```

### Render

```bash
# 通过 Git 集成或 Render Dashboard 部署
```

- **定位**: 开发者友好的全栈云托管平台
- **核心原理**: 原生支持 Web Service、Static Site、Background Worker、PostgreSQL/Redis
- **优势**:
  - **原生支持长时间运行服务**（非 Serverless）
  - 自动 HTTPS、预览环境
  - 托管数据库和缓存
  - 简单透明的定价
  - 从 Heroku 迁移的最佳选择
- **劣势**:
  - 边缘网络覆盖不如 Cloudflare/Vercel
  - 构建速度中等
  - 无边缘函数
- **适用场景**: 传统后端服务、需要长期运行进程的应用、数据库密集型应用

```yaml
# render.yaml (Infrastructure as Code)
services:
  - type: web
    name: my-express-app
    runtime: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: my-db
          property: connectionString

databases:
  - name: my-db
    databaseName: myapp
    user: myapp
    plan: free
```

### Fly.io

```bash
# 安装 flyctl
curl -L https://fly.io/install.sh | sh

# 启动应用
fly launch
fly deploy
```

- **定位**: 基于 Firecracker MicroVM 的全球应用托管
- **核心原理**: 将容器打包为 MicroVM，部署到全球边缘节点
- **优势**:
  - **接近原生容器体验**，Dockerfile 即配置
  - Firecracker MicroVM 启动极快
  - 可部署到全球多个区域
  - 支持长时间运行和后台任务
  - 内置 PostgreSQL/Redis 托管
- **劣势**:
  - 需信用卡验证（即使免费套餐）
  - 学习曲线较陡（需理解 Fly 的架构）
  - 社区规模小于 Vercel/Netlify
- **适用场景**: 容器化应用、需要接近裸机性能的服务、全球多区域部署

```dockerfile
# Dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

```toml
# fly.toml
app = 'my-app'
primary_region = 'lax'

[build]
  dockerfile = 'Dockerfile'

[http_service]
  internal_port = 3000
  force_https = true
  auto_stop_machines = 'stop'
  auto_start_machines = true
  min_machines_running = 0
  processes = ['app']

[[vm]]
  size = 'shared-cpu-1x'
  memory = '512mb'
```

### Railway

```bash
npm i -g @railway/cli
railway login
railway init
railway up
```

- **定位**: 现代化的基础设施即平台 (Infrastructure as a Platform)
- **核心原理**: Git 驱动部署 + 自动服务发现 + 托管数据库
- **优势**:
  - **极简部署体验**，几乎零配置
  - 自动环境变量注入
  - 内置数据库（PostgreSQL、MySQL、Redis、MongoDB）
  - 团队协作友好
  - 实时日志和部署状态
- **劣势**:
  - 免费额度有限
  - 定制性不如 Fly/K8s
  - 企业级功能仍在完善
- **适用场景**: 快速原型、初创项目、全栈应用快速上线

```json
// package.json (Railway 自动检测)
{
  "scripts": {
    "start": "node dist/server.js",
    "build": "tsc"
  }
}
```

### Docker + Kubernetes (K8s)

```bash
# Dockerfile → 镜像 → 部署到任意 K8s 集群
docker build -t myapp:latest .
kubectl apply -f k8s/
```

- **定位**: 云原生应用的事实标准部署方案
- **核心原理**: 容器化 + 声明式编排 + 自动扩缩容
- **优势**:
  - **完全可控**，无厂商锁定
  - 云厂商全覆盖（EKS、GKE、AKS、自建）
  - 自动扩缩容 (HPA/VPA)、自愈、滚动更新
  - 服务网格、金丝雀发布等高级能力
  - 适用于任何规模
- **劣势**:
  - **运维复杂度最高**
  - 需要 K8s 专业知识
  - 成本管理复杂
  - 对纯前端项目过重
- **适用场景**: 大型企业、微服务架构、需要完全可控的生产环境

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
        - name: app
          image: myapp:latest
          ports:
            - containerPort: 3000
          resources:
            requests:
              memory: "256Mi"
              cpu: "250m"
            limits:
              memory: "512Mi"
              cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: my-app-service
spec:
  selector:
    app: my-app
  ports:
    - port: 80
      targetPort: 3000
  type: ClusterIP
```

## 性能对比

| 指标 | Vercel | Netlify | Cloudflare | AWS Amplify | Render | Fly.io | Railway | K8s |
|------|--------|---------|------------|-------------|--------|--------|---------|-----|
| **全球边缘节点** | 100+ | 100+ | 300+ | 200+ (CloudFront) | 4 区域 | 30+ 区域 | 2 区域 | 取决于配置 |
| **首字节时间 (TTFB)** | ⚡ <50ms | ⚡ <50ms | ⚡ <20ms | 🚀 <100ms | 🚀 <100ms | 🚀 <50ms | 🚀 <100ms | 🟢 可控 |
| **冷启动** | ⚡ 0ms (Edge) | ⚡ 0ms (Edge) | ⚡ 0ms | 🐢 100-500ms | 🚀 快 | 🚀 快 | 🚀 快 | 🐢 慢 |
| **构建速度** | ⚡ 快 | ⚡ 快 | ⚡ 快 | 🐢 较慢 | 🚀 中 | 🚀 中 | ⚡ 快 | 🟢 取决于 CI |
| **最大函数执行时间** | 5min (Pro) | 10min | 50ms CPU | 15min | 无限制 | 无限制 | 无限制 | 无限制 |

## 功能对比

| 功能 | Vercel | Netlify | Cloudflare | AWS Amplify | Render | Fly.io | Railway | K8s |
|------|--------|---------|------------|-------------|--------|--------|---------|-----|
| **静态站点托管** | ✅ | ✅ 最强 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Serverless Functions** | ✅ | ✅ | ✅ Workers | ✅ Lambda | ❌ | ❌ | ❌ | ✅ Knative |
| **边缘计算** | ✅ | ✅ | ✅ 最强 | 🔵 Lambda@Edge | ❌ | ✅ | ❌ | ✅ |
| **容器部署** | 🔵 有限 | ❌ | ❌ | ❌ | ✅ | ✅ 原生 | ✅ | ✅ 原生 |
| **托管数据库** | 🔵 第三方 | 🔵 第三方 | ✅ D1/R2 | ✅ DynamoDB | ✅ | ✅ | ✅ | ✅ |
| **预览部署** | ✅ PR 集成 | ✅ PR 集成 | ✅ | ✅ | ✅ | ✅ | ✅ | 🔵 需 CI |
| **密码保护/SSO** | ✅ 企业版 | ✅ 企业版 | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| **分析/监控** | ✅ 内置 | ✅ 内置 | ✅ | ✅ | 🟡 基础 | 🟡 基础 | 🟡 基础 | 🔵 需额外工具 |
| **自定义 Headers/Rewrites** | ✅ `vercel.json` | ✅ `netlify.toml` | ✅ | 🔵 有限 | ❌ | ❌ | ❌ | ✅ Ingress |
| **WebSocket 支持** | 🔵 有限 | ❌ | 🟡 有限 | ❌ | ✅ | ✅ | ✅ | ✅ |

## 选型建议

| 场景 | 推荐平台 | 理由 |
|------|----------|------|
| Next.js/React 项目 | Vercel | 原生支持最佳 |
| 静态/JAMstack 站点 | Netlify / Cloudflare Pages | 成熟生态 + 边缘部署 |
| 边缘优先/全球低延迟 | Cloudflare Workers + Pages | 300+ 节点 + 零冷启动 |
| AWS 全栈应用 | AWS Amplify | 一键集成 Cognito/AppSync |
| 长期运行后端服务 | Render / Fly.io / Railway | 原生容器/VM 支持 |
| 容器化微服务 | Fly.io / K8s | 完全容器控制 |
| 快速原型/MVP | Railway / Vercel | 零配置上线 |
| 从 Heroku 迁移 | Render | 体验最接近 |
| 企业级/完全可控 | K8s (EKS/GKE/AKS) | 无厂商锁定 |
| 全栈 TS + 边缘 | Cloudflare / Vercel | 边缘函数原生 TS |

## 组合方案

```bash
# 现代全栈推荐组合
# 前端: Next.js → Vercel
# API/边缘: Hono → Cloudflare Workers
# 数据库: PlanetScale / Neon / Supabase
# 存储: Cloudflare R2 / AWS S3
```

| 层级 | 推荐平台 | 职责 |
|------|----------|------|
| 前端托管 | Vercel / Cloudflare Pages | SSR/SSG/边缘函数 |
| API/边缘逻辑 | Cloudflare Workers / Vercel Edge | 低延迟 API |
| 后端服务 | Render / Fly.io | 长时间运行服务 |
| 数据库 | Railway / Render / 云厂商 | 数据持久化 |
| CDN/存储 | Cloudflare R2 / AWS S3 | 静态资源 |
