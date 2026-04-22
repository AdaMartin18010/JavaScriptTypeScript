# Monorepo Fullstack SaaS

基于 pnpm + Turborepo 的全栈 SaaS Monorepo 模板，演示现代 TypeScript 全栈开发的最佳实践。

## 技术栈

- **前端**: Next.js 15 + React 19 + TypeScript + Tailwind CSS + shadcn/ui
- **后端**: NestJS + Prisma + PostgreSQL + Redis
- **共享包**:
  - `@saas/types`: Zod schemas + TypeScript 类型
  - `@saas/ui`: 共享 React 组件（基于 shadcn/ui）
  - `@saas/eslint-config`: 共享 ESLint 配置
- **基础设施**: Docker Compose、GitHub Actions CI/CD、Turborepo 远程缓存

## 目录结构

```
monorepo-fullstack-saas/
├── apps/
│   ├── web/          # Next.js 15 前端
│   └── api/          # NestJS 后端 API
├── packages/
│   ├── types/        # 共享类型 + Zod schemas
│   ├── ui/           # 共享 React 组件
│   └── eslint-config/# 共享 ESLint 配置
├── turbo.json
├── pnpm-workspace.yaml
├── docker-compose.yml
├── .github/workflows/ci.yml
└── README.md
```

## 前置要求

- Node.js >= 20
- pnpm >= 9
- Docker & Docker Compose

## 安装步骤

```bash
# 1. 安装依赖
pnpm install

# 2. 启动基础设施（PostgreSQL + Redis）
docker-compose up -d

# 3. 初始化数据库
pnpm --filter api db:push

# 4. 环境变量配置
cp apps/web/.env.example apps/web/.env
cp apps/api/.env.example apps/api/.env
# 根据需要编辑 .env 文件
```

## 运行命令

```bash
# 开发模式（同时启动 web + api）
pnpm dev

# 构建所有应用和包
pnpm build

# 运行所有测试
pnpm test

# 代码检查
pnpm lint

# 格式化
pnpm format
```

## 独立运行

```bash
# 仅启动前端
pnpm --filter web dev

# 仅启动后端
pnpm --filter api dev
```

## 环境变量

### Web (.env)

```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### API (.env)

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/saas?schema=public
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-jwt-key
PORT=3001
```

## 部署

本项目包含 GitHub Actions 工作流，支持：

- 代码提交时自动运行 lint / test / build
- Docker 镜像构建与推送
- 可选：Vercel（前端）+ Railway/Render（后端）分离部署


---

## 🔗 关联知识库模块

完成本项目后，建议深入以下代码实验室与理论文档：

| 模块 | 路径 | 与本项目的关联 |
|------|------|---------------|
| 包管理 | `jsts-code-lab/12-package-management/THEORY.md` | pnpm Workspaces、Version Catalogs、Monorepo 依赖设计 |
| Monorepo 工具 | `docs/categories/25-monorepo-tools.md` | Turborepo、Nx、Rush 工具对比与选型 |
| Monorepo 架构理论 | `JSTS全景综述/Monorepo_架构设计与边界划分.md` | Monorepo 边界划分、分层设计、循环依赖治理 |
| 认证与授权 | `docs/categories/29-authentication.md` | better-auth、Auth.js、Passkeys、JWT 安全 |
| ORM 与数据库 | `docs/categories/11-orm-database.md` | Prisma、Drizzle、Turso、边缘数据库选型 |

> 📚 [返回知识库首页](../README.md)
