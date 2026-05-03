---
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
RUN addgroup -g 1001 -S nodejs &&     adduser -S nodejs -u 1001
USER nodejs

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3   CMD node -e "require('http').get('http://localhost:3000/health', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

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
| Docker 文档 | <https://docs.docker.com> |
| Node.js Docker 最佳实践 | <https://nodejs.org/en/docs/guides/nodejs-docker-webapp> |
| Distroless 镜像 | <https://github.com/GoogleContainerTools/distroless> |
| Trivy 扫描器 | <https://trivy.dev> |

---

 [← 返回 DevOps 示例首页](./)
