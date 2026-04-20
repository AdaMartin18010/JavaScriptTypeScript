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
