# 缓存策略

> Web 应用缓存分层与选型指南。

---

## 缓存分层

| 层级 | 技术 | TTL | 说明 |
|------|------|-----|------|
| **浏览器** | Cache-Control | 用户控制 | 静态资源长期缓存 |
| **CDN** | Cloudflare/Vercel Edge | 秒–小时 | 全局边缘缓存 |
| **应用** | Redis / Memcached | 分钟–小时 | 会话、热点数据 |
| **数据库** | PostgreSQL Buffer Pool | 自动 | 查询结果缓存 |

## 缓存模式

| 模式 | 说明 | 适用 |
|------|------|------|
| **Cache-Aside** | 应用先查缓存，缺失再查 DB | 通用 |
| **Read-Through** | 缓存代理 DB 查询 | ORM 集成 |
| **Write-Through** | 写时同步更新缓存 | 强一致性 |
| **Write-Behind** | 异步批量写 DB | 高吞吐 |

---

*最后更新: 2026-04-29*
