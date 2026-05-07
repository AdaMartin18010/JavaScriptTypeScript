---
title: 12 Pages Router → App Router 迁移指南
description: 掌握从 Next.js Pages Router 迁移到 App Router 的完整流程：迁移策略、常见陷阱、渐进式重构和性能对比。
---

# 12 Pages Router → App Router 迁移

> **前置知识**：Pages Router、App Router
>
> **目标**：能够设计并执行迁移计划

---

## 1. 迁移策略

### 1.1 渐进式迁移

```
Phase 1: 并行运行
├── 保持 Pages Router 运行
├── 新页面使用 App Router
└── 通过 rewrites 统一入口

Phase 2: 低风险页面迁移
├── 静态页面
├── 简单数据获取页面
└── 营销页面

Phase 3: 核心功能迁移
├── 复杂路由
├── API 路由迁移
└── 认证流程

Phase 4: 移除 Pages Router
├── 删除 pages 目录
├── 清理兼容性代码
└── 优化构建配置
```

### 1.2 重写规则

```javascript
// next.config.js
module.exports = {
  async rewrites() {
    return [
      // App Router 优先，回退到 Pages Router
      {
        source: '/about',
        destination: '/about', // App Router
      },
      {
        source: '/legacy/:path*',
        destination: '/legacy/:path*', // Pages Router
      },
    ];
  },
};
```

---

## 2. 代码映射

### 2.1 数据获取

```javascript
// Pages Router: getServerSideProps
export async function getServerSideProps() {
  const data = await fetchData();
  return { props: { data } };
}

// App Router: Server Component
async function Page() {
  const data = await fetchData();
  return <div>{data}</div>;
}
```

### 2.2 API 路由

```javascript
// Pages Router: pages/api/hello.js
export default function handler(req, res) {
  res.status(200).json({ message: 'Hello' });
}

// App Router: app/api/hello/route.js
export async function GET() {
  return Response.json({ message: 'Hello' });
}
```

---

## 3. 常见陷阱

| 陷阱 | Pages Router | App Router |
|------|-------------|-----------|
| 数据获取 | getStaticProps/getServerSideProps | 直接 fetch |
| 路由参数 | useRouter().query | params prop |
| Head 管理 | next/head | 原生 metadata |
| 布局 | _app.js /_document.js | layout.js |
| 404 页面 | 404.js | not-found.js |
| Loading | 手动实现 | loading.js |

---

## 延伸阅读

- [Next.js App Router Migration](https://nextjs.org/docs/app/building-your-application/upgrading/app-router-migration)
