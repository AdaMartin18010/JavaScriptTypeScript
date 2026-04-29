---
dimension: 应用领域
sub-dimension: 真实案例
created: 2026-04-28
---

# 模块归属声明

本模块归属 **「应用领域」** 维度，聚焦 真实案例 核心概念与工程实践。

## 包含内容

- 生产级项目拆解、架构决策复盘、性能优化实战、故障排查案例。

## 相关索引

- `30-knowledge-base/30.2-categories/README.md` — 分类总览
- `20-code-lab/` — 代码实验室实践

## 子模块一览

| 子模块 | 说明 | 关键文件 |
|--------|------|----------|
| api-client | HTTP API 客户端设计与实现 | `THEORY.md`, `*.ts` |
| auth-system | JWT 认证与权限中间件 | `THEORY.md`, `*.ts` |
| cli-tools | 命令行工具开发实践 | `*.ts` |
| data-processing | 数据处理流水线 | `*.ts` |
| event-bus | 发布订阅与事件总线 | `THEORY.md`, `*.ts` |
| state-management | 状态管理方案 | `*.ts` |
| validation | 数据校验与 Schema | `*.ts` |
| web-server | Web 服务器与中间件 | `THEORY.md`, `*.ts` |

## 代码示例：模块化架构入口

```typescript
// index.ts：统一导出所有真实案例模块
export { createHttpClient } from './api-client';
export { createAuthMiddleware } from './auth-system';
export { TypedEventBus } from './event-bus';
export { createServer } from './web-server';
export { validateSchema } from './validation';
export { createPipeline } from './data-processing';

// 快速组合示例：带认证的 API 客户端 + 事件总线
import { createHttpClient } from './api-client';
import { TypedEventBus } from './event-bus';

interface AppEvents {
  'api:error': (err: Error) => void;
  'api:success': (endpoint: string, latency: number) => void;
}

const bus = new TypedEventBus<AppEvents>();
const client = createHttpClient({
  baseURL: 'https://api.example.com',
  onError: (err) => bus.emit('api:error', err),
  onSuccess: (ep, latency) => bus.emit('api:success', ep, latency),
});
```

## 目录内容

- 📄 README.md
- 📄 THEORY.md
- 📄 _MIGRATED_FROM.md
- 📁 api-client
- 📁 auth-system
- 📁 cli-tools
- 📁 data-processing
- 📁 event-bus
- 📄 index.ts
- 📁 state-management
- 📁 validation
- 📁 web-server

---

> 此分类文档由批量生成脚本自动创建，请根据实际模块内容补充和调整。

## 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| Node.js Design Patterns | 书籍 | [nodejsdesignpatterns.com](https://nodejsdesignpatterns.com/) |
| MDN | 文档 | [developer.mozilla.org](https://developer.mozilla.org) |
| web.dev | 指南 | [web.dev](https://web.dev) |

---

*最后更新: 2026-04-29*
