---
dimension: 综合
sub-dimension: Fullstack patterns
created: 2026-04-28
---

# 模块归属声明

本模块归属 **「综合」** 维度，聚焦 Fullstack patterns 核心概念与工程实践。

## 包含内容

- 本模块聚焦 fullstack patterns 核心概念与工程实践。
- BFF（Backend-for-Frontend）模式、API Gateway 编排、端到端类型安全、数据流模式。

## 子模块总览

| 子模块 | 说明 | 文件 |
|--------|------|------|
| BFF Pattern | 为前端定制的后端聚合层，减少请求往返 | `bff-pattern.ts` / `bff-pattern.test.ts` |
| API Gateway | 统一入口、路由、鉴权与限流 | `api-gateway.ts` |
| End-to-End Types | 前后端共享 Schema，实现端到端类型安全 | `end-to-end-types.ts` / `end-to-end-types.test.ts` |
| Data Flow Patterns | 全栈数据流设计：SSR、CSR、 islands 架构 | `data-flow-patterns.ts` |

## 代码示例：BFF 聚合层

```typescript
// bff-pattern.ts — 为移动端聚合多个微服务接口
export async function getUserDashboard(userId: string) {
  const [profile, orders, notifications] = await Promise.all([
    fetch(`/users/${userId}`).then(r => r.json()),
    fetch(`/orders?userId=${userId}`).then(r => r.json()),
    fetch(`/notifications?userId=${userId}`).then(r => r.json()),
  ]);
  return { profile, orders, notifications };
}
```

## 相关索引

- `30-knowledge-base/30.2-categories/README.md` — 分类总览
- `20-code-lab/` — 代码实验室实践

## 目录内容

- 📄 README.md
- 📄 THEORY.md
- 📄 _MIGRATED_FROM.md
- 📄 api-gateway.ts
- 📄 bff-pattern.test.ts
- 📄 bff-pattern.ts
- 📄 data-flow-patterns.ts
- 📄 end-to-end-types.test.ts
- 📄 end-to-end-types.ts
- 📄 index.ts

---

> 此分类文档由批量生成脚本自动创建，请根据实际模块内容补充和调整。

## 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| MDN | 文档 | [developer.mozilla.org](https://developer.mozilla.org) |
| web.dev | 指南 | [web.dev](https://web.dev) |
| Patterns.dev — BFF | 文章 | [patterns.dev/posts/bff](https://www.patterns.dev/posts/bff/) |
| Martin Fowler — BFF | 文章 | [martinfowler.com/bliki/BackendForFrontend.html](https://martinfowler.com/bliki/BackendForFrontend.html) |
| tRPC Documentation | 文档 | [trpc.io/docs](https://trpc.io/docs) |
| GraphQL Best Practices | 文档 | [graphql.org/learn/best-practices](https://graphql.org/learn/best-practices/) |
| Next.js Data Fetching | 文档 | [nextjs.org/docs/app/building-your-application/data-fetching](https://nextjs.org/docs/app/building-your-application/data-fetching) |

---

*最后更新: 2026-04-29*
