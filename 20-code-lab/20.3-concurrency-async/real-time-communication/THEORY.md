# 实时通信 — 理论基础

## 1. 实时通信技术对比

| 技术 | 传输方向 | 协议基础 | 实时性 | 适用场景 | 浏览器支持 |
|------|---------|---------|--------|----------|------------|
| **WebSocket** | 全双工 | TCP | 极低延迟 | 聊天、游戏、协作编辑 | 现代浏览器全支持 |
| **SSE** | 服务端→客户端单向 | HTTP | 低延迟 | 股票行情、新闻推送、日志流 | 除 IE 外全支持 |
| **WebRTC** | P2P 双向 | UDP (DTLS/SRTP) | 极低延迟 | 音视频通话、文件传输、屏幕共享 | 现代浏览器 |
| **Long-Polling** | 客户端轮询 | HTTP | 较高延迟 | 兼容性要求极高的旧系统 | 全浏览器 |

## 2. WebSocket 协议

- 基于 TCP 的全双工通信
- 握手使用 HTTP Upgrade 请求
- 帧格式：文本帧、二进制帧、控制帧（ping/pong/close）
- 心跳机制：防止 NAT 超时和检测死连接

## 3. WebRTC 架构

```
信令服务器（交换 SDP 和 ICE 候选）
       ↓
STUN 服务器（获取公网地址）
       ↓
TURN 服务器（中继，当 P2P 失败时）
       ↓
P2P 连接（DTLS 加密 + SRTP 媒体传输）
```

## 4. WebSocket 代码示例

### 客户端（Browser）

```typescript
const socket = new WebSocket('wss://example.com/chat');

socket.addEventListener('open', () => {
  console.log('Connected to server');
  socket.send(JSON.stringify({ type: 'join', room: 'general' }));
});

socket.addEventListener('message', (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
});

socket.addEventListener('close', () => {
  console.log('Disconnected');
});

// 心跳保活
setInterval(() => {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type: 'ping' }));
  }
}, 30000);
```

### 服务端（Node.js + ws）

```typescript
import { WebSocketServer, WebSocket } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

const rooms = new Map<string, Set<WebSocket>>();

wss.on('connection', (ws) => {
  ws.on('message', (raw) => {
    const msg = JSON.parse(raw.toString());

    if (msg.type === 'join') {
      if (!rooms.has(msg.room)) rooms.set(msg.room, new Set());
      rooms.get(msg.room)!.add(ws);
    }

    if (msg.type === 'chat') {
      const clients = rooms.get(msg.room) || new Set();
      clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'chat',
            content: msg.content,
            timestamp: Date.now()
          }));
        }
      });
    }
  });

  ws.on('close', () => {
    rooms.forEach((clients) => clients.delete(ws));
  });
});
```

## 5. 实时架构模式

- **发布-订阅**: 频道/主题模型，客户端订阅感兴趣的主题
- **房间模型**: 用户加入房间，消息广播给房间内所有用户
- **Presence**: 用户在线状态、正在输入指示器
- **消息排序**: 全局序列号保证消息顺序
- **消息持久化**: 离线消息存储，用户上线后推送

## 6. 与相邻模块的关系

- **90-web-apis-lab**: WebSocket、WebRTC API 的实践
- **32-edge-computing**: 边缘节点的实时数据分发
- **25-microservices**: 微服务间的事件驱动通信

## 权威参考链接

- [MDN WebSocket API](https://developer.mozilla.org/zh-CN/docs/Web/API/WebSocket)
- [MDN Server-Sent Events](https://developer.mozilla.org/zh-CN/docs/Web/API/Server-sent_events)
- [MDN WebRTC API](https://developer.mozilla.org/zh-CN/docs/Web/API/WebRTC_API)
- [RFC 6455 — The WebSocket Protocol](https://datatracker.ietf.org/doc/html/rfc6455)
- [WebSocket vs SSE vs Long Polling (Ably)](https://ably.com/blog/websockets-vs-sse)
- [ws — Node.js WebSocket 库](https://github.com/websockets/ws)
