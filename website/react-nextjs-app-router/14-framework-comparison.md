---
title: 14 框架对比矩阵
description: Next.js App Router 与 Nuxt、SvelteKit、Remix 的全维度对比：架构、性能、生态和适用场景。
---

# 14 框架对比矩阵

## 全维度对比

| 维度 | Next.js App Router | Nuxt 3 | SvelteKit | Remix |
|------|-------------------|--------|-----------|-------|
| **基础框架** | React | Vue | Svelte | React |
| **路由模式** | 文件系统 + App Router | 文件系统 | 文件系统 | 文件系统 |
| **渲染模式** | RSC / SSR / SSG / ISR | SSR / SSG / ISR | SSR / SSG / CSR | SSR / CSR |
| **Server Components** | ✅ 原生 | ⚠️ 实验性 | ❌ | ❌ |
| **Streaming** | ✅ 原生 | ✅ | ✅ | ⚠️ |
| **Bundle 体积** | 中 | 中 | 小 | 小 |
| **学习曲线** | 陡峭 | 中 | 平缓 | 中 |
| **生态规模** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐☆ | ⭐⭐⭐☆☆ | ⭐⭐⭐☆☆ |
| **企业采用** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐☆ | ⭐⭐⭐☆☆ | ⭐⭐⭐☆☆ |
| **托管平台** | Vercel（最优） | Vercel/Netlify | Vercel/Netlify | Vercel/Fly |

## 选型建议

| 场景 | 推荐 |
|------|------|
| React 生态 / 大型应用 | Next.js |
| Vue 生态 / 中型应用 | Nuxt |
| 性能优先 / 小型应用 | SvelteKit |
| Web 标准优先 | Remix |
