# 边缘计算 — 理论基础

## 1. 边缘计算定义

边缘计算是一种分布式计算范式，将计算和数据存储放置在靠近数据源的网络边缘，而非集中式云数据中心。核心目标是**降低延迟**、**减少带宽消耗**、**提高可用性**。

## 2. 边缘运行时架构

### 2.1 V8 Isolate 模型

现代边缘平台（Cloudflare Workers、Vercel Edge Functions）使用 V8 Isolate 而非完整容器：

- **启动时间**: < 1ms（容器为 100ms+）
- **内存开销**: 每个 Isolate 约 5-10MB（容器为 100MB+）
- **冷启动**: 几乎为零（Isolate 复用）
- **限制**: 无文件系统、无原生模块、CPU 时间限制（50ms/请求）

### 2.2 请求生命周期

```
用户请求 → CDN 边缘节点 → V8 Isolate 执行 → 缓存/状态存储 → 响应
         ↑                    ↓
    DNS 路由（Anycast）    Durable Objects/KV
```

## 3. 边缘状态管理

| 存储类型 | 一致性 | 延迟 | 适用场景 |
|---------|--------|------|---------|
| **KV 存储** | 最终一致性 | 全球 < 50ms | 配置、缓存 |
| **Durable Objects** | 强一致性 | 区域 < 10ms | 协作编辑、游戏状态 |
| **SQLite (D1)** | ACID | 区域 < 20ms | 关系型数据 |
| **Cache API** | 最终一致性 | 边缘 < 1ms | HTTP 响应缓存 |

## 4. 边缘渲染策略

- **SSR at Edge**: 在边缘节点执行 React/Vue SSR，减少 TTFB
- **ISR (Incremental Static Regeneration)**: 边缘缓存 + 后台重新生成
- **Streaming**: 边缘流式传输 HTML，渐进式渲染

## 5. 关键挑战

- **调试困难**: 边缘环境难以本地复现
- **供应商锁定**: 各平台 API 差异大（Workers vs Edge Functions）
- **执行限制**: CPU/内存/时间严格受限
- **冷数据**: 跨区域数据访问延迟高

## 6. 与相邻模块的关系

- **93-deployment-edge-lab**: 边缘部署的实践与工具
- **31-serverless**: FaaS 与边缘函数的架构对比
- **96-orm-modern-lab**: 边缘环境下的 ORM 适配
