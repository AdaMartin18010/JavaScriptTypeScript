# 部署指南

## 1. Node.js 服务器部署

### 1.1 环境准备

```bash
# 系统要求
node -v  # >= 20.0.0
npm -v   # >= 10.0.0
```

### 1.2 安装依赖

```bash
cd examples/ai-agent-production
npm install
```

### 1.3 配置环境变量

```bash
cp .env.example .env
# 编辑 .env，填入 API Key 与 OAuth 凭证
```

### 1.4 数据库初始化

```bash
npm run db:migrate
```

### 1.5 启动 MCP Server（开发环境）

```bash
# 终端 1：启动文件系统 MCP Server
npm run mcp:filesystem

# 终端 2：启动 GitHub MCP Server
npm run mcp:github
```

### 1.6 启动主服务

```bash
# 开发模式（热重载）
npm run dev

# 生产模式
npm run build
npm start
```

### 1.7 Docker 部署

```bash
# 构建镜像
docker-compose build

# 启动全部服务
docker-compose up -d

# 查看日志
docker-compose logs -f app
```

### 1.8 Docker Compose 生产配置示例

```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  app:
    build:
      context: ../../..
      dockerfile: examples/ai-agent-production/Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/ai_agent
      - REDIS_URL=redis://redis:6379
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - LANGFUSE_PUBLIC_KEY=${LANGFUSE_PUBLIC_KEY}
      - LANGFUSE_SECRET_KEY=${LANGFUSE_SECRET_KEY}
    depends_on:
      - db
      - redis
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: ai_agent
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    volumes:
      - redisdata:/data
    ports:
      - "6379:6379"

  mcp-filesystem:
    build:
      context: ../../..
      dockerfile: examples/ai-agent-production/mcp/Dockerfile.filesystem
    environment:
      - MCP_ALLOWED_DIRS=/data
    volumes:
      - ./data:/data:ro

volumes:
  pgdata:
  redisdata:
```

### 1.9 健康检查与优雅关闭

```typescript
// src/server/health.ts —— 生产级健康检查端点
import { Hono } from 'hono';

const app = new Hono();

app.get('/health', async (c) => {
  const checks = await Promise.all([
    checkDatabase(),
    checkRedis(),
    checkMCPConnections(),
  ]);

  const allHealthy = checks.every((c) => c.status === 'ok');
  return c.json(
    {
      status: allHealthy ? 'healthy' : 'degraded',
      checks: Object.fromEntries(checks.map((c) => [c.name, c.status])),
      timestamp: new Date().toISOString(),
    },
    allHealthy ? 200 : 503,
  );
});

async function checkDatabase() {
  try {
    await db.execute(sql`SELECT 1`);
    return { name: 'database', status: 'ok' as const };
  } catch {
    return { name: 'database', status: 'error' as const };
  }
}

async function checkRedis() {
  try {
    await redis.ping();
    return { name: 'redis', status: 'ok' as const };
  } catch {
    return { name: 'redis', status: 'error' as const };
  }
}

async function checkMCPConnections() {
  try {
    await mcpClient.ping();
    return { name: 'mcp', status: 'ok' as const };
  } catch {
    return { name: 'mcp', status: 'error' as const };
  }
}

// 优雅关闭
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await Promise.all([db.$disconnect(), redis.quit(), mcpClient.close()]);
  process.exit(0);
});
```

---

## 2. Cloudflare Workers 部署

### 2.1 环境准备

```bash
# 安装 Wrangler CLI
npm install -g wrangler

# 登录 Cloudflare
wrangler login
```

### 2.2 创建 Wrangler 配置

在项目根目录创建 `wrangler.toml`：

```toml
name = "ai-agent-production"
main = "src/server/index.ts"
compatibility_date = "2026-04-01"
compatibility_flags = ["nodejs_compat"]

[vars]
DEFAULT_MODEL_PROVIDER = "openai"
DEFAULT_MODEL = "gpt-4o"
NODE_ENV = "production"

[[d1_databases]]
binding = "DB"
database_name = "ai-agent-db"
database_id = "your-database-id"

[ai]
binding = "AI"
```

### 2.3 适配边缘运行时

#### 数据库适配

创建 `src/lib/db.edge.ts`：

```typescript
import { drizzle } from "drizzle-orm/d1";
import * as schema from "../../database/schema.js";

export function createDB(d1: D1Database) {
  return drizzle(d1, { schema });
}
```

#### 服务器入口适配

修改 `src/server/index.ts`，在文件末尾添加：

```typescript
// Cloudflare Workers 导出
export const fetch = app.fetch;
```

#### 边缘环境变量注入

```typescript
// src/lib/env.ts —— 统一环境变量访问
export interface Env {
  DB: D1Database;
  AI: Ai; // Cloudflare AI binding
  KV: KVNamespace;
  OPENAI_API_KEY: string;
  LANGFUSE_PUBLIC_KEY: string;
  LANGFUSE_SECRET_KEY: string;
}

export function getEnv(request: Request): Env {
  // 在 Cloudflare Workers 中，env 通过 request 的 cf 或全局绑定传入
  return (request as unknown as { env: Env }).env;
}
```

### 2.4 部署

```bash
# 创建 D1 数据库
wrangler d1 create ai-agent-db

# 应用迁移
wrangler d1 migrations apply ai-agent-db

# 部署 Workers
wrangler deploy
```

### 2.5 验证部署

```bash
curl https://ai-agent-production.your-account.workers.dev/health
```

---

## 3. Vercel 部署

### 3.1 配置

创建 `vercel.json`：

```json
{
  "builds": [
    {
      "src": "src/server/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/server/index.ts"
    }
  ]
}
```

### 3.2 部署

```bash
npm i -g vercel
vercel --prod
```

---

## 4. 生产环境检查清单

| 检查项 | 状态 | 说明 |
|--------|------|------|
| API Key 安全存储 | ☐ | 使用环境变量，勿提交到版本控制 |
| 数据库迁移已执行 | ☐ | 生产数据库 Schema 与代码一致 |
| 速率限制已启用 | ☐ | 防止 API 被滥用 |
| OAuth 回调域名配置正确 | ☐ | GitHub/Google 开发者后台 |
| 日志与监控接入 | ☐ | 建议接入 Langfuse / Sentry |
| TLS 证书有效 | ☐ | HTTPS 强制开启 |
| 备份策略 | ☐ | 数据库定期备份 |

---

## 5. 性能优化建议

1. **模型响应缓存**：对常见查询结果启用 Redis 缓存，减少 Token 消耗
2. **流式输出**：优先使用 SSE 流式响应，降低用户等待感
3. **连接池**：数据库与 MCP Server 使用连接池，减少建立连接开销
4. **边缘缓存**：静态资源与公共 API 响应使用 CDN 缓存

### 5.1 缓存策略代码示例

```typescript
// src/lib/cache.ts —— 多级缓存实现
import { createClient } from 'redis';

const redis = createClient({ url: process.env.REDIS_URL });
await redis.connect();

export async function getCachedOrFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds = 300,
): Promise<T> {
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);

  const result = await fetcher();
  await redis.setEx(key, ttlSeconds, JSON.stringify(result));
  return result;
}

// 在 Agent 调用中使用
const response = await getCachedOrFetch(
  `agent:response:${hashQuery(query)}`,
  () => agent.run(query),
  60, // 短 TTL，因为 Agent 响应可能变化
);
```

### 5.2 流式 SSE 响应

```typescript
// src/server/stream.ts —— 流式 Agent 响应
app.post('/agent/stream', async (c) => {
  const { message } = await c.req.json();

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const send = (data: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      for await (const chunk of agent.stream(message)) {
        send({ type: 'chunk', content: chunk.content });
      }

      send({ type: 'done' });
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
});
```

---

## 6. CI/CD 配置示例

```yaml
# .github/workflows/deploy.yml
name: Deploy AI Agent
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build
      - name: Deploy to Cloudflare Workers
        run: npx wrangler deploy
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CF_API_TOKEN }}
```

---

## 权威参考链接

- [Node.js Deployment Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/) — Node.js 官方 Docker 部署指南
- [Dockerfile Best Practices](https://docs.docker.com/develop/dev-best-practices/dockerfile_best-practices/) — Docker 官方构建最佳实践
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/) — Workers 运行时与部署文档
- [Wrangler CLI Reference](https://developers.cloudflare.com/workers/wrangler/commands/) — Wrangler 命令行完整参考
- [Cloudflare D1 Database](https://developers.cloudflare.com/d1/) — D1 边缘 SQL 数据库文档
- [Vercel Documentation](https://vercel.com/docs) — Vercel 部署平台文档
- [Langfuse Tracing](https://langfuse.com/docs) — LLM 应用可观测性平台
- [Sentry JavaScript SDK](https://docs.sentry.io/platforms/javascript/) — 生产错误监控
- [GitHub Actions Documentation](https://docs.github.com/en/actions) — CI/CD 工作流配置
- [Hono Cloudflare Workers Guide](https://hono.dev/docs/getting-started/cloudflare-workers) — Hono 框架 Workers 部署
- [Drizzle ORM with D1](https://orm.drizzle.team/docs/get-started-sqlite#expo-sqlite) — Drizzle ORM 边缘数据库适配
- [Cloudflare AI Binding](https://developers.cloudflare.com/workers/ai/) — Workers AI 推理绑定
- [MCP Protocol Transport](https://modelcontextprotocol.io/docs/concepts/transports) — MCP 协议传输层规范
- [OpenAI API Rate Limits](https://platform.openai.com/docs/guides/rate-limits) — API 调用限流策略
- [Redis Best Practices](https://redis.io/docs/management/optimization/benchmarks/) — Redis 性能优化指南
