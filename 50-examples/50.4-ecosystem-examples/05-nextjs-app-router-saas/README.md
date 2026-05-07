# Next.js App Router SaaS 模板

## 概述

生产级 SaaS 模板，基于 Next.js 15 App Router。

## 技术栈

- Next.js 15 (App Router)
- TypeScript 5.x
- Prisma + PostgreSQL
- NextAuth.js v5
- Stripe 支付
- Tailwind CSS + shadcn/ui
- Vercel AI SDK（可选）

## 功能

- [x] 用户认证（OAuth + 邮箱）
- [x] 订阅管理（Stripe）
- [x] 团队/工作区
- [x] 角色权限（RBAC）
- [x] 管理后台
- [x] AI 聊天集成（可选）

## 快速开始

```bash
cp .env.example .env
npm install
npx prisma migrate dev
npm run dev
```

## 关联专题

- [React + Next.js 深度专题](../../../website/react-nextjs-app-router/)
