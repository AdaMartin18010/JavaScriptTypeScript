---
title: 实时通信（Real-Time Communication）
description: JavaScript/TypeScript 实时通信完整指南，覆盖 WebSocket、SSE、WebRTC、PartyKit、Ably、Pusher 与 Yjs CRDT
---

# 实时通信（Real-Time Communication）

> 本文档系统梳理 2025-2026 年 JavaScript/TypeScript 生态中实时通信的关键技术与服务。覆盖 WebSocket、Server-Sent Events、WebRTC、边缘实时平台及协作编辑框架。数据截至 2026 年 4 月。

---

## 📊 整体概览

| 技术/服务 | 定位 | Stars / 规模 | TS 支持 | 协议 |
|-----------|------|--------------|:-------:|------|
| **Socket.io** | WebSocket 封装 + 降级机制 | 61,000+ Stars / 350万+ 周下载 | ✅ 官方 | WebSocket / HTTP 长轮询 |
| **原生 WebSocket** | 浏览器/Node.js 原生 API | 内置 | ✅ 原生 | RFC 6455 WebSocket |
| **Server-Sent Events** | 服务端单向推送 | 浏览器原生 | ✅ 原生 | `text/event-stream` |
| **WebRTC** | P2P 音视频/数据通道 | 浏览器原生 | ✅ `@types/webrtc` | ICE / STUN / TURN |
| **PartyKit** | Cloudflare 边缘实时协作 | 被 Cloudflare 收购（2024） | ✅ 原生 | WebSocket |
| **Ably** | 托管实时消息服务 | 商业服务 | ✅ 官方 SDK | WebSocket / SSE / MQTT |
| **Pusher** | 托管实时服务（被 MessageBird 收购） | 商业服务 | ✅ 官方 SDK | WebSocket |
| **Yjs** | CRDT 协作编辑框架 | 16,500+ Stars | ✅ 原生 | 自定义 CRDT |

---

## 1. WebSocket：原生 API 与 Socket.io

### 1.1 原生 WebSocket

现代浏览器和 Node.js（通过 `ws` 库）对 WebSocket 的支持已非常成熟。2025 年的关键趋势是：**对于简单场景，原生 WebSocket 已足够，Socket.io 不再是必选项**。

```typescript
// 浏览器端原生 WebSocket
const ws = new WebSocket('wss://api.example.com/live');

ws.onopen = () => console.log('Connected');
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
};
ws.onerror = (err) => console.error('WebSocket error:', err);
ws.onclose = () => console.log('Disconnected');

// 发送消息
ws.send(JSON.stringify({ type: 'subscribe', channel: 'orders' }));

// Node.js 服务端（ws 库）
import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });
wss.on('connection', (ws, req) => {
  console.log('Client connected from', req.socket.remoteAddress);

  ws.on('message', (data) => {
    // 广播给所有客户端
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  });
});
```

**`ws` 库数据（2026-04）**：

| 属性 | 数值 |
|------|------|
| Stars | 23,000+ |
| 周下载 | 4500万+（Node.js WebSocket 绝对统治） |
| 包大小 | ~50KB |

### 1.2 Socket.io：仍必要吗？

| 属性 | 详情 |
|------|------|
| **Stars** | ⭐ 61,000+ |
| **周下载** | 350万+ |
| **GitHub** | [socketio/socket.io](https://github.com/socketio/socket.io) |

**2025-2026 评估**：

> Socket.io 的**自动降级**（WebSocket → HTTP 长轮询）和**房间/命名空间**抽象在复杂场景仍有价值，但以下情况**可直接使用原生 WebSocket**：
> - 内部系统，网络环境可控（无需降级）
> - 已使用 Cloudflare Workers / Deno（Socket.io 依赖引擎不匹配）
> - 仅需简单广播，无需房间管理

**Socket.io 仍具优势的场景**：

- 需要可靠的消息送达保证（acknowledgements）
- 多房间/命名空间的复杂频道管理
- 需要自动重连和心跳机制
- 存量系统维护

```typescript
// Socket.io v4.8+（2025 年活跃维护版本）
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';

const io = new Server(server, {
  cors: { origin: 'https://app.example.com' },
  transports: ['websocket', 'polling'], // 自动降级
});

// Redis 适配器实现多节点广播
io.adapter(createAdapter(pubClient, subClient));

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.join('room:general');

  socket.on('chat:message', (msg, callback) => {
    io.to('room:general').emit('chat:message', {
      ...msg,
      timestamp: Date.now(),
    });
    callback({ status: 'delivered' }); // Acknowledgement
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});
```

---

## 2. Server-Sent Events (SSE)：AI 流式响应推动复兴

### 2.1 为什么 SSE 在 2025-2026 年强势回归？

随着 OpenAI、Anthropic 等 API 普遍采用 SSE 传输流式 Token，SSE 从"被遗忘的协议"重新成为**服务器向客户端推送文本流的首选方案**。

**SSE vs WebSocket 对比**：

| 维度 | SSE | WebSocket |
|------|-----|-----------|
| **通信方向** | 服务端 → 客户端（单向） | 全双工 |
| **协议** | HTTP/1.1 或 HTTP/2（自动多路复用） | TCP + WebSocket 握手 |
| **重连** | 浏览器原生自动重连 + `Last-Event-ID` | 需手动实现 |
| **穿透性** | 基于 HTTP，穿透代理/防火墙无压力 | 某些企业防火墙会阻断 |
| **二进制数据** | ❌ 仅文本 | ✅ 支持 |
| **适用场景** | AI 流式输出、股票行情、日志推送 | 聊天、游戏、协作编辑 |

```typescript
// 服务端：Next.js Route Handler 实现 SSE
// app/api/stream/route.ts
export async function GET() {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: string) => {
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      };

      send(JSON.stringify({ type: 'connected' }));

      // 模拟 AI 流式输出
      const tokens = ['Hello', ' from', ' the', ' server', '!'];
      for (const token of tokens) {
        await new Promise((r) => setTimeout(r, 200));
        send(JSON.stringify({ type: 'token', content: token }));
      }

      send(JSON.stringify({ type: 'done' }));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}

// 客户端：EventSource API（现代推荐：使用 fetch + ReadableStream 获得更细粒度控制）
const eventSource = new EventSource('/api/stream');

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'token') {
    appendToUI(data.content);
  }
};

eventSource.onerror = () => eventSource.close();
```

**Vercel AI SDK 中的 SSE**：

```typescript
import { streamText } from 'ai';

// AI SDK 内部自动处理 SSE 协议细节
const result = streamText({ model: openai('gpt-4o'), prompt: 'Hello' });
return result.toDataStreamResponse(); // 自动返回 text/event-stream
```

---

## 3. WebRTC：P2P 实时音视频

### 3.1 项目概述

WebRTC 是浏览器内置的 P2P 实时通信标准，2025 年在 JS/TS 生态中的主要应用场景包括：视频会议、屏幕共享、P2P 文件传输和低延迟游戏。

**2025-2026 关键进展**：

- **WebRTC NV（Next Version）**：支持 Insertable Streams 端到端加密、SVC（可伸缩视频编码）
- **WISH 协议**：IETF 正在标准化 HTTP 信令替代方案，降低 WebRTC 部署门槛
- **Mediasoup / LiveKit**：SFU（选择性转发单元）方案成为多人会议主流（P2P 超过 4 人性能骤降）

```typescript
// 简化版 WebRTC 对等连接
const pc = new RTCPeerConnection({
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
});

// 获取本地媒体
const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
stream.getTracks().forEach((track) => pc.addTrack(track, stream));

// 信令交换（通过 WebSocket / SSE 传递 SDP）
pc.onicecandidate = (event) => {
  if (event.candidate) {
    signaling.send({ type: 'ice-candidate', candidate: event.candidate });
  }
};

const offer = await pc.createOffer();
await pc.setLocalDescription(offer);
signaling.send({ type: 'offer', sdp: offer });

// 接收远端流
pc.ontrack = (event) => {
  remoteVideo.srcObject = event.streams[0];
};
```

**JS/TS SFU 库**：

| 库 | Stars | 定位 |
|----|-------|------|
| **Mediasoup** | 5,500+ | 高性能 Node.js SFU，支持 Simulcast/SVC |
| **LiveKit** | 11,000+ | 全栈实时 SDK（SFU + 客户端） |
| **Jitsi Meet** | 23,000+ | 开源视频会议完整方案 |

---

## 4. PartyKit：Cloudflare 边缘实时协作

### 4.1 项目概述

| 属性 | 详情 |
|------|------|
| **名称** | PartyKit |
| **状态** | 2024 年被 Cloudflare 收购，核心能力并入 Cloudflare Durable Objects |
| **官网** | [partykit.io](https://partykit.io) → 迁移至 [developers.cloudflare.com/durable-objects](https://developers.cloudflare.com/durable-objects) |

**一句话描述**：PartyKit 曾是基于 Cloudflare Workers 的实时协作框架，被收购后其理念成为 Cloudflare Durable Objects 官方能力的一部分。

**2025-2026 状态**：

- PartyKit 独立服务已逐步迁移至 **Cloudflare Durable Objects + Agents SDK**
- 新项目的推荐路径：直接使用 `Cloudflare Durable Objects` 或 `Cloudflare Agents SDK` 构建有状态实时应用

```typescript
// Cloudflare Durable Objects 实现实时房间（PartyKit 的演进形态）
export class ChatRoom extends DurableObject {
  sessions: WebSocket[] = [];

  async fetch(request: Request) {
    const upgradeHeader = request.headers.get('Upgrade');
    if (upgradeHeader !== 'websocket') {
      return new Response('Expected websocket', { status: 400 });
    }

    const [client, server] = Object.values(new WebSocketPair());
    this.sessions.push(server);

    server.accept();
    server.addEventListener('message', (msg) => {
      // 广播给房间内所有客户端
      this.sessions.forEach((ws) => {
        if (ws.readyState === WebSocket.READY_STATE_OPEN) {
          ws.send(msg.data as string);
        }
      });
    });

    return new Response(null, { status: 101, webSocket: client });
  }
}
```

---

## 5. Ably / Pusher：托管实时服务

### 5.1 Ably

| 属性 | 详情 |
|------|------|
| **官网** | [ably.com](https://ably.com) |
| **TS SDK** | `ably` |

**2025-2026 亮点**：

- **Ably Spaces**：专为实时协作（光标位置、用户在线状态）设计的高层次 API
- **MQTT 支持**：IoT 设备可直接通过 MQTT 接入 Ably 网络
- **消息排序保证**：全球有序消息传递，无需应用层处理

```typescript
import * as Ably from 'ably';

const client = new Ably.Realtime.Promise({ key: process.env.ABLY_API_KEY });
const channel = client.channels.get('live-updates');

await channel.subscribe('order:123', (message) => {
  console.log('Order update:', message.data);
});

await channel.publish('order:123', { status: 'shipped', eta: '2h' });
```

### 5.2 Pusher

| 属性 | 详情 |
|------|------|
| **官网** | [pusher.com](https://pusher.com) |
| **状态** | 被 MessageBird 收购后保持独立运营 |

Pusher 在 2025 年依然是**最简单接入的托管实时服务**，适合快速原型和小规模应用。Channels（Pub/Sub）和 Beams（Push 通知）两条产品线稳定维护。

---

## 6. Yjs：CRDT 协作编辑框架

### 6.1 项目概述

| 属性 | 详情 |
|------|------|
| **名称** | Yjs |
| **Stars** | ⭐ 16,500+ |
| **周下载** | 60万+ |
| **GitHub** | [yjs/yjs](https://github.com/yjs/yjs) |
| **官网** | [docs.yjs.dev](https://docs.yjs.dev) |

**一句话描述**：JS/TS 生态中最成熟、应用最广泛的 CRDT（无冲突复制数据类型）库，为 Notion、Figma、Linear 等产品的实时协作提供底层能力。

**2025-2026 关键更新**：

- **Yjs v14**：持久化层性能提升 50%，文档加载时间大幅降低
- **y-protocols 生态成熟**：`y-websocket`、`y-webrtc`、`y-indexeddb` 提供完整的同步与存储方案
- **Tiptap / BlockNote 集成**：主流富文本编辑器均内置 Yjs 协作支持

```typescript
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

// 创建共享文档
const doc = new Y.Doc();
const yText = doc.getText('content');

// WebSocket 同步
const provider = new WebsocketProvider(
  'wss://demos.yjs.dev',
  'my-document-room',
  doc
);

// 本地编辑（自动同步给所有客户端）
yText.insert(0, 'Hello collaborative world!');

// 监听远程变化
yText.observe(() => {
  console.log('Current content:', yText.toString());
});

// 与 ProseMirror / Monaco 绑定
import { ProseMirrorBinding } from 'y-prosemirror';
// const binding = new ProseMirrorBinding(yText, editorView);
```

**CRDT 方案对比**：

| 库 | Stars | 定位 | 适用场景 |
|----|-------|------|----------|
| **Yjs** | 16.5k+ | 成熟 CRDT 框架 | 富文本、白板、表格协作 |
| **Automerge** | 8,000+ | 本地优先 CRDT | 本地优先应用、P2P |
| **Loro** | 3,500+ | 高性能 Rust CRDT（WASM 绑定） | 高性能需求、大文档 |

---

## 7. 选型决策矩阵

| 场景 | 推荐方案 | 理由 |
|------|----------|------|
| **AI 流式聊天输出** | **SSE** | 单向文本流，HTTP 兼容，自动重连 |
| **双向实时聊天/游戏** | **原生 WebSocket** 或 **Socket.io** | 低延迟全双工 |
| **视频会议（< 8 人）** | **WebRTC P2P** | 无服务器成本 |
| **视频会议（> 8 人）** | **LiveKit** 或 **Mediasoup** | SFU 架构保证质量 |
| **协作文档/白板** | **Yjs + y-websocket** | 成熟的 CRDT 冲突解决 |
| **全球低延迟实时** | **Ably** 或 **Cloudflare Durable Objects** | 边缘部署，< 50ms 延迟 |
| **快速原型 / MVP** | **Pusher** | 5 分钟接入，免费额度充足 |
| **Serverless 边缘实时** | **Cloudflare Durable Objects** | 有状态 WebSocket，零冷启动 |

---

## 8. 关键数据汇总（2026-04）

| 项目 | Stars | 周下载 / 规模 | 采用趋势 |
|------|-------|---------------|----------|
| Socket.io | 61,000+ | 350万+ | ➡️ 稳定（存量大） |
| ws (Node.js) | 23,000+ | 4500万+ | ⬆️ 统治级 |
| Yjs | 16,500+ | 60万+ | ⬆️ 增长 |
| WebRTC | 浏览器原生 | 100% 现代浏览器 | ➡️ 成熟 |
| SSE | 浏览器原生 | 100% 现代浏览器 | ⬆️ 复兴（AI 驱动） |
| LiveKit | 11,000+ | 15万+ | ⬆️ 增长 |
| PartyKit | — | 并入 Cloudflare | ➡️ 转型 |
| Ably SDK | — | 商业服务 | ➡️ 稳定 |
| Pusher SDK | — | 商业服务 | ➡️ 稳定 |

---

> 📅 本文档最后更新：2026 年 4 月
>
> 💡 **提示**：2025-2026 年实时通信领域最显著的趋势是 **SSE 的复兴**（由 AI 流式响应推动）和 **边缘有状态计算**（Cloudflare Durable Objects）的成熟。对于新项目，建议优先考虑 SSE 替代简单场景下的 WebSocket，并使用 Cloudflare 或 Ably 处理全球实时分发需求。Yjs 仍是协作编辑的唯一成熟选择。
