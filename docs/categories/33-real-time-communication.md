---
last-updated: 2026-04-27
review-cycle: 6 months
next-review: 2026-10-27
status: current
---

# 实时通信（Application Domain）

> **维度**: 应用领域 | **边界**: 本文档聚焦实时通信技术的应用开发，底层网络协议（TCP/UDP/WebSocket 协议细节）和通用后端框架请参见 `docs/guides/NETWORK_PROGRAMMING.md` 和 `docs/categories/14-backend-frameworks.md`。

---

## 分类概览

| 类别 | 代表技术 | 适用场景 |
|------|----------|----------|
| WebSocket 库 | ws, Socket.IO, µWebSockets | 双向实时通信、聊天室 |
| SSE | 原生 EventSource / fetch 流 | 股票行情、日志流 |
| WebRTC | 原生 API + adapter.js | 视频会议、P2P 传输 |
| 信令服务 | Socket.IO, Firebase, Ably | WebRTC 信令、房间管理 |
| 实时数据 | Ably, Pusher, PubNub | 实时数据同步、在线状态 |

---

## 与基础设施的边界

```
应用领域 (本文档)                     基础设施层
├─ 实时聊天应用                        ├─ WebSocket 协议实现
├─ 在线协作白板                        ├─ 网络层 (TCP/UDP)
├─ 直播弹幕系统                        ├─ 消息队列 (Kafka/RabbitMQ)
└─ P2P 文件传输                        └─ 信号处理 / 编解码器
```

---

## 关联资源

- `jsts-code-lab/30-real-time-communication/` — SSE、WebRTC 代码模式
- `jsts-code-lab/19-backend-development/websocket-patterns.ts` — WebSocket 后端模式
- `docs/application-domains-index.md` — 应用领域总索引

---

> 📅 最后更新: 2026-04-27
