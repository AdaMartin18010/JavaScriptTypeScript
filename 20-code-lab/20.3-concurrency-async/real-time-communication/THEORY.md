# 实时通信 — 理论基础

## 1. 实时通信技术对比

| 技术 | 传输方向 | 协议基础 | 实时性 | 适用场景 | 浏览器支持 |
|------|---------|---------|--------|----------|------------|
| **WebSocket** | 全双工 | TCP | 极低延迟 | 聊天、游戏、协作编辑 | 现代浏览器全支持 |
| **SSE** | 服务端→客户端单向 | HTTP | 低延迟 | 股票行情、新闻推送、日志流 | 除 IE 外全支持 |
| **WebRTC** | P2P 双向 | UDP (DTLS/SRTP) | 极低延迟 | 音视频通话、文件传输、屏幕共享 | 现代浏览器 |
| **Long-Polling** | 客户端轮询 | HTTP | 较高延迟 | 兼容性要求极高的旧系统 | 全浏览器 |

---

## 2. WebSocket 协议

- 基于 TCP 的全双工通信
- 握手使用 HTTP Upgrade 请求
- 帧格式：文本帧、二进制帧、控制帧（ping/pong/close）
- 心跳机制：防止 NAT 超时和检测死连接

---

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

---

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

### 带自动重连的 WebSocket 封装

```typescript
// resilient-websocket.ts — 生产级重连客户端
interface ResilientSocketOptions {
  url: string;
  reconnectInterval?: number;
  maxReconnects?: number;
  heartbeatInterval?: number;
}

class ResilientWebSocket extends EventTarget {
  private ws: WebSocket | null = null;
  private reconnectCount = 0;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private intentionalClose = false;

  constructor(private options: ResilientSocketOptions) {
    super();
    this.connect();
  }

  private connect() {
    this.ws = new WebSocket(this.options.url);

    this.ws.addEventListener('open', () => {
      this.reconnectCount = 0;
      this.startHeartbeat();
      this.dispatchEvent(new Event('open'));
    });

    this.ws.addEventListener('message', (e) => {
      // 过滤心跳响应
      if (e.data === 'pong') return;
      this.dispatchEvent(new MessageEvent('message', { data: e.data }));
    });

    this.ws.addEventListener('close', () => {
      this.stopHeartbeat();
      if (!this.intentionalClose) {
        this.scheduleReconnect();
      }
      this.dispatchEvent(new Event('close'));
    });

    this.ws.addEventListener('error', (e) => {
      this.dispatchEvent(new ErrorEvent('error', { error: e }));
    });
  }

  private scheduleReconnect() {
    const max = this.options.maxReconnects ?? Infinity;
    if (this.reconnectCount >= max) return;

    const delay = (this.options.reconnectInterval ?? 3000) * Math.min(this.reconnectCount + 1, 5);
    setTimeout(() => {
      this.reconnectCount++;
      this.connect();
    }, delay);
  }

  private startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      this.ws?.send('ping');
    }, this.options.heartbeatInterval ?? 30000);
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  send(data: string | ArrayBufferLike | Blob | ArrayBufferView) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(data);
    } else {
      throw new Error('WebSocket is not open');
    }
  }

  close() {
    this.intentionalClose = true;
    this.ws?.close();
  }
}

// 使用
const socket = new ResilientWebSocket({
  url: 'wss://example.com/ws',
  reconnectInterval: 2000,
  maxReconnects: 10,
});
socket.addEventListener('message', (e) => console.log(e.data));
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

---

## 5. Server-Sent Events (SSE) 代码示例

```typescript
// 客户端
const evtSource = new EventSource('/api/events');

evtSource.addEventListener('price-update', (e) => {
  const { symbol, price } = JSON.parse(e.data);
  console.log(`${symbol}: $${price}`);
});

evtSource.addEventListener('error', () => {
  console.error('SSE connection lost, auto-reconnecting...');
});

// 服务端（Node.js + Express）
app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const interval = setInterval(() => {
    res.write(`event: price-update\n`);
    res.write(`data: ${JSON.stringify({ symbol: 'BTC', price: Math.random() * 50000 })}\n\n`);
  }, 2000);

  req.on('close', () => clearInterval(interval));
});
```

---

## 6. WebRTC 数据通道代码示例

```typescript
// 简化的 WebRTC DataChannel 文件传输

const pc = new RTCPeerConnection({
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
});

const dc = pc.createDataChannel('fileTransfer', { ordered: true });

dc.onopen = () => {
  const file = document.getElementById('fileInput')!.files![0];
  const chunkSize = 16384;
  let offset = 0;

  const reader = new FileReader();
  reader.onload = (e) => {
    const chunk = e.target!.result as ArrayBuffer;
    if (dc.readyState === 'open') {
      dc.send(chunk);
      offset += chunk.byteLength;
      if (offset < file.size) readSlice(offset);
      else dc.send('EOF');
    }
  };

  const readSlice = (o: number) => {
    const slice = file.slice(o, o + chunkSize);
    reader.readAsArrayBuffer(slice);
  };
  readSlice(0);
};

// 信令交换（需通过 WebSocket 或 SSE 实现）
pc.onicecandidate = (e) => {
  if (e.candidate) signalServer.send({ type: 'ice', candidate: e.candidate });
};
```

---

## 7. BroadcastChannel API（同-origin 跨标签页通信）

```typescript
// tab-communication.ts — 无服务器同页签通信
const channel = new BroadcastChannel('app_sync');

// 发送状态变更
channel.postMessage({ type: 'login', user: 'alice', timestamp: Date.now() });

// 接收并响应
channel.addEventListener('message', (event) => {
  if (event.data.type === 'login') {
    console.log(`User ${event.data.user} logged in from another tab`);
    // 同步本地状态
    localStorage.setItem('currentUser', event.data.user);
  }
});

// 优雅关闭
window.addEventListener('beforeunload', () => channel.close());
```

---

## 8. 实时架构模式

- **发布-订阅**: 频道/主题模型，客户端订阅感兴趣的主题
- **房间模型**: 用户加入房间，消息广播给房间内所有用户
- **Presence**: 用户在线状态、正在输入指示器
- **消息排序**: 全局序列号保证消息顺序
- **消息持久化**: 离线消息存储，用户上线后推送

## 9. 与相邻模块的关系

- **90-web-apis-lab**: WebSocket、WebRTC API 的实践
- **32-edge-computing**: 边缘节点的实时数据分发
- **25-microservices**: 微服务间的事件驱动通信

## 权威参考链接

- [MDN WebSocket API](https://developer.mozilla.org/zh-CN/docs/Web/API/WebSocket)
- [MDN Server-Sent Events](https://developer.mozilla.org/zh-CN/docs/Web/API/Server-sent_events)
- [MDN WebRTC API](https://developer.mozilla.org/zh-CN/docs/Web/API/WebRTC_API)
- [MDN BroadcastChannel](https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel)
- [RFC 6455 — The WebSocket Protocol](https://datatracker.ietf.org/doc/html/rfc6455)
- [WebSocket vs SSE vs Long Polling (Ably)](https://ably.com/blog/websockets-vs-sse)
- [ws — Node.js WebSocket 库](https://github.com/websockets/ws)
- [WebRTC.org — Getting Started](https://webrtc.org/getting-started/)
- [MDN — RTCPeerConnection](https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection)
- [HTML Spec — Server-sent events](https://html.spec.whatwg.org/multipage/server-sent-events.html)
- [caniuse — WebRTC](https://caniuse.com/rtcpeerconnection)
- [Web.dev — Real-time updates](https://web.dev/articles/real-time)
- [Socket.io Documentation](https://socket.io/docs/v4/) — 流行实时通信库
- [WebTransport API — MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebTransport_API) — HTTP/3 双向通信

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
