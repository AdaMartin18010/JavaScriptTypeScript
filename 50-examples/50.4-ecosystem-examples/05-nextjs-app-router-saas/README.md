# Next.js App Router SaaS 模板

基于 Next.js 14+ App Router 的生产级 SaaS 启动模板。

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | Next.js 14+ (App Router) |
| 语言 | TypeScript 5.4+ |
| 样式 | Tailwind CSS + shadcn/ui |
| 数据库 | Prisma + PostgreSQL |
| 认证 | NextAuth.js / Clerk |
| 支付 | Stripe |
| 部署 | Vercel |

## 快速开始

```bash
# 1. 克隆模板
git clone <repo-url> my-saas
cd my-saas

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env.local
# 编辑 DATABASE_URL, NEXTAUTH_SECRET, STRIPE_SECRET_KEY 等

# 4. 初始化数据库
npx prisma migrate dev
npx prisma db seed

# 5. 启动开发服务器
npm run dev
```

## 项目结构

```
my-saas/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   ├── settings/
│   │   └── billing/
│   ├── api/
│   │   ├── auth/[...nextauth]/
│   │   ├── stripe/
│   │   └── webhooks/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/           # shadcn/ui 组件
│   └── app/          # 业务组件
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   └── stripe.ts
├── prisma/
│   └── schema.prisma
├── types/
│   └── index.ts
├── middleware.ts
└── next.config.js
```

## 核心功能

- [x] **认证系统** — Email/Password + OAuth (Google/GitHub)
- [x] **组织/团队** — 多租户workspace支持
- [x] **角色权限** — RBAC (Owner/Admin/Member)
- [x] **订阅计费** — Stripe Checkout + 用量计费
- [x] **仪表盘** — 数据统计 + 活动日志
- [x] **API 限流** — 基于计划的请求配额

## 部署

```bash
# Vercel
vercel --prod

# 或 Docker
docker build -t my-saas .
docker run -p 3000:3000 my-saas
```

## 相关专题

- [React + Next.js App Router 深度专题](/react-nextjs-app-router/)
