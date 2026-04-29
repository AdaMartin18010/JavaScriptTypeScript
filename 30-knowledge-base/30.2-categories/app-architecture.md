# 应用架构模式

> JavaScript/TypeScript 应用的主流架构模式对比。

---

## 架构模式对比

| 模式 | 特点 | 适用场景 |
|------|------|---------|
| **分层架构** | Controller → Service → Repository | 标准 CRUD 应用 |
| **六边形架构** | 领域为核心，端口/适配器隔离 | 复杂业务逻辑 |
| **微前端** | 独立部署的前端子应用 | 大型团队并行开发 |
| **Module Federation** | 运行时动态加载远程模块 | 渐进式迁移 |
| **Serverless** | 函数即服务，自动扩缩容 | 事件驱动，流量波动 |
| **Edge-First** | 逻辑前置到 CDN 边缘 | 全球低延迟需求 |

## 2026 趋势

- **Module Federation 2.0**：类型安全、离线容错、DevTools
- **Native Federation**：框架无关的模块联邦标准
- **React Server Components**：服务端组件减少客户端 bundle

---

*最后更新: 2026-04-29*
