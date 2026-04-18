# 93-deployment-edge-lab: 部署与边缘计算实战实验室

## 模块说明

本模块涵盖现代部署与边缘计算场景：Cloudflare Workers 边缘模式、Vercel Edge Config / Edge Function、以及 Node.js Docker 镜像优化策略。所有代码均为可直接用于生产环境的工程模式。

## 学习目标

1. 掌握 Cloudflare Workers 的核心模式：边缘缓存、KV 存储、Durable Objects
2. 理解 Vercel Edge Config 在 A/B 测试与特性开关中的应用
3. 实现 Node.js Docker 镜像的多阶段构建、pnpm 缓存、distroless 与 Layer 缓存优化

## 文件清单

| 文件 | 说明 |
|---|---|
| `cloudflare-worker.ts` | Cloudflare Workers 边缘模式 |
| `vercel-edge-config.ts` | Vercel Edge Config / Edge Function 模式 |
| `docker-optimize.ts` | Node.js Docker 镜像优化策略 |
| `deployment-edge-lab.test.ts` | 集成测试 |
| `index.ts` | 模块入口 |

## 运行方式

```bash
# 运行测试
pnpm vitest run 93-deployment-edge-lab

# 类型检查
pnpm tsc --noEmit 93-deployment-edge-lab/*.ts
```

## 部署工具链

- Wrangler (Cloudflare)
- Vercel CLI
- Docker ≥ 24
