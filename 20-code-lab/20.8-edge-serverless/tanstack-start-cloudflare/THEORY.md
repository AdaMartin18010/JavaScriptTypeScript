# TanStack Start + Cloudflare — 理论基础

## 1. TanStack Start

TanStack Start 是一个基于 TanStack Router 的全栈 React 框架：

- **文件系统路由**: 约定式路由配置
- **服务端函数**: 类型安全的服务端 API
- **流式 SSR**: 结合 React Server Components
- **全栈类型安全**: 端到端 TypeScript 类型推断

## 2. Cloudflare 集成

TanStack Start 可部署到 Cloudflare Workers：

- **边缘渲染**: SSR 在 Cloudflare 边缘节点执行
- **D1 数据库**: SQLite 边缘数据库
- **KV 存储**: 全局低延迟键值存储
- **R2 存储**: S3 兼容的对象存储

## 3. 与相邻模块的关系

- **18-frontend-frameworks**: React 框架对比
- **32-edge-computing**: 边缘计算架构
- **93-deployment-edge-lab**: 边缘部署实践
