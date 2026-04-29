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

## 实时协议深度对比

| 维度 | WebSocket | SSE (Server-Sent Events) | WebRTC | MQTT |
|------|-----------|-------------------------|--------|------|
| **通信方向** | 全双工 (双向) | 单向 (服务器 → 客户端) | 全双工 (P2P) | 发布/订阅 (Pub/Sub) |
| **传输层** | TCP (HTTP Upgrade) | HTTP/1.1 长连接 | UDP (SRTP) + TCP (信令) | TCP / TLS / WebSocket |
| **浏览器支持** | ✅ 原生 (`WebSocket`) | ✅ 原生 (`EventSource`) | ✅ 原生 (复杂 API) | ❌ 需 MQTT.js |
| **重连机制** | 需手动实现 | 原生自动重连 (`retry`) | ICE 重新协商 | 原生 `clean session` |
| **二进制传输** | ✅ `ArrayBuffer` / `Blob` | ❌ 仅文本 (Base64 编码) | ✅ 原生媒体流 | ✅ 原生支持 |
| **穿透 NAT** | ✅ (基于 TCP) | ✅ (基于 HTTP) | ⚠️ 需 STUN/TURN | ✅ (基于 TCP) |
| **最大并发** | 高 (~1M/服务器) | 极高 (HTTP 兼容) | P2P 去中心化 | 极高 (轻量协议) |
| **消息送达保证** | 需应用层实现 | 需应用层实现 | UDP 不可靠 | ✅ QoS 0/1/2 |
| **典型延迟** | < 100ms | < 100ms | < 50ms (P2P) | < 100ms |
| **适用场景** | 聊天、游戏、协作 | 股票行情、推送通知 | 音视频、P2P 文件 | IoT、传感器、消息总线 |

---

## 代码示例：SSE + WebSocket 混合实现

### 服务端：Express + SSE 端点

```typescript
import express from 'express';

const app = express();
const clients = new Set<Response>();

// SSE 端点 — 股票行情推送
app.get('/api/stocks/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  clients.add(res);

  // 发送初始连接确认
  res.write(`data: ${JSON.stringify({ type: 'connected', time: Date.now() })}

`);

  req.on('close', () => {
    clients.delete(res);
  });
});

// 广播函数
function broadcastStockUpdate(symbol: string, price: number) {
  const data = JSON.stringify({ type: 'price', symbol, price, time: Date.now() });
  clients.forEach((client) => {
    client.write(`data: ${data}

`);
  });
}

// 模拟行情更新
setInterval(() => {
  broadcastStockUpdate('AAPL', 150 + Math.random() * 10);
}, 1000);

app.listen(3000, () => console.log('SSE server on :3000'));
```

### 客户端：SSE 消费 + WebSocket 备用

```typescript
class RealtimeClient {
  private eventSource: EventSource | null = null;
  private ws: WebSocket | null = null;

  connectSSE(url: string, onMessage: (data: unknown) => void) {
    this.eventSource = new EventSource(url);

    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (e) {
        console.error('SSE parse error:', e);
      }
    };

    this.eventSource.onerror = (err) => {
      console.error('SSE error, falling back to WebSocket:', err);
      this.eventSource?.close();
      // 降级到 WebSocket
      this.connectWS('ws://localhost:3001', onMessage);
    };
  }

  connectWS(url: string, onMessage: (data: unknown) => void) {
    this.ws = new WebSocket(url);

    this.ws.onmessage = (event) => {
      try {
        onMessage(JSON.parse(event.data));
      } catch (e) {
        console.error('WS parse error:', e);
      }
    };

    this.ws.onclose = () => {
      // 指数退避重连
      setTimeout(() => this.connectWS(url, onMessage), 3000);
    };
  }

  disconnect() {
    this.eventSource?.close();
    this.ws?.close();
  }
}

// 使用
const client = new RealtimeClient();
client.connectSSE('/api/stocks/stream', (data) => {
  console.log('Stock update:', data);
});
```

### 简单 WebSocket 服务端 (ws 库)

```typescript
import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 3001 });

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (data) => {
    const msg = JSON.parse(data.toString());
    // 广播给所有客户端
    wss.clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(JSON.stringify({ ...msg, timestamp: Date.now() }));
      }
    });
  });

  ws.on('close', () => console.log('Client disconnected'));
});
```

---

## 进阶代码示例

### Socket.IO 房间管理与命名空间

```typescript
// socket-io-rooms.ts
import { Server } from 'socket.io';

const io = new Server(3002, { cors: { origin: '*' } });

// 命名空间：按业务隔离
const chatNamespace = io.of('/chat');
const gameNamespace = io.of('/game');

chatNamespace.on('connection', (socket) => {
  console.log(`Chat user connected: ${socket.id}`);

  // 加入房间
  socket.on('join-room', (roomId: string) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-joined', { userId: socket.id, roomId });

    // 发送房间当前人数
    const roomSize = chatNamespace.adapter.rooms.get(roomId)?.size ?? 0;
    socket.emit('room-info', { roomId, memberCount: roomSize });
  });

  // 房间内消息
  socket.on('send-message', (roomId: string, message: string) => {
    // 只广播给同房间其他人（不含自己）
    socket.to(roomId).emit('new-message', {
      userId: socket.id,
      message,
      timestamp: Date.now(),
    });
  });

  // 离开房间
  socket.on('leave-room', (roomId: string) => {
    socket.leave(roomId);
    socket.to(roomId).emit('user-left', { userId: socket.id });
  });

  socket.on('disconnect', () => {
    console.log(`Chat user disconnected: ${socket.id}`);
  });
});

// 中间件：鉴权
chatNamespace.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (verifyToken(token)) {
    next();
  } else {
    next(new Error('Authentication error'));
  }
});
```

### WebRTC 数据通道（P2P 传输）

```typescript
// webrtc-datachannel.ts — 简化版 WebRTC 数据通道
interface PeerConnectionConfig {
  iceServers: RTCIceServer[];
}

const DEFAULT_ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  // TURN 服务器用于对称 NAT 穿透
  // { urls: 'turn:turn.example.com', username: 'user', credential: 'pass' }
];

class P2PDataChannel {
  private pc: RTCPeerConnection;
  private channel: RTCDataChannel | null = null;

  constructor(private onMessage: (data: string) => void) {
    this.pc = new RTCPeerConnection({ iceServers: DEFAULT_ICE_SERVERS });

    this.pc.ondatachannel = (event) => {
      this.channel = event.channel;
      this.setupChannel();
    };

    this.pc.onicecandidate = (event) => {
      if (event.candidate) {
        // 通过信令服务器发送 ICE candidate 给对端
        this.sendSignal({ type: 'ice-candidate', candidate: event.candidate });
      }
    };
  }

  createChannel(label: string): RTCDataChannel {
    this.channel = this.pc.createDataChannel(label, {
      ordered: true, // 保证顺序送达
    });
    this.setupChannel();
    return this.channel;
  }

  private setupChannel() {
    if (!this.channel) return;
    this.channel.onopen = () => console.log('Data channel open');
    this.channel.onmessage = (event) => this.onMessage(event.data);
    this.channel.onclose = () => console.log('Data channel closed');
  }

  async createOffer(): Promise<RTCSessionDescriptionInit> {
    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);
    return offer;
  }

  async acceptOffer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    await this.pc.setRemoteDescription(offer);
    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);
    return answer;
  }

  async acceptAnswer(answer: RTCSessionDescriptionInit) {
    await this.pc.setRemoteDescription(answer);
  }

  async addIceCandidate(candidate: RTCIceCandidateInit) {
    await this.pc.addIceCandidate(candidate);
  }

  send(data: string) {
    if (this.channel?.readyState === 'open') {
      this.channel.send(data);
    }
  }

  // 抽象方法：通过外部信令服务器发送消息
  private sendSignal(message: unknown) {
    // 由子类或外部注入实现
    console.log('Signal:', message);
  }
}
```

### MQTT 发布/订阅（IoT 场景）

```typescript
// mqtt-client.ts
import mqtt from 'mqtt';

const client = mqtt.connect('mqtt://broker.hivemq.com:1883', {
  clientId: `jsts-client-${Math.random().toString(16).slice(2, 8)}`,
  clean: true,
  connectTimeout: 4000,
  reconnectPeriod: 1000,
});

client.on('connect', () => {
  console.log('Connected to MQTT broker');

  // 订阅主题，QoS 1（至少送达一次）
  client.subscribe('factory/sensor/+/temperature', { qos: 1 }, (err) => {
    if (!err) console.log('Subscribed to temperature sensors');
  });
});

client.on('message', (topic, payload) => {
  const data = JSON.parse(payload.toString());
  console.log(`[${topic}] Temperature: ${data.value}°C at ${data.timestamp}`);

  // 温度超过阈值，发布告警
  if (data.value > 80) {
    client.publish('factory/alerts', JSON.stringify({
      level: 'warning',
      message: `High temperature: ${data.value}°C`,
      topic,
    }), { qos: 2 }); // QoS 2：恰好一次送达
  }
});

// 模拟传感器发布
function publishSensorData(sensorId: string, temperature: number) {
  client.publish(
    `factory/sensor/${sensorId}/temperature`,
    JSON.stringify({ value: temperature, timestamp: Date.now() }),
    { qos: 1 }
  );
}

setInterval(() => {
  publishSensorData('A1', 20 + Math.random() * 70);
}, 5000);
```

### 背压控制与速率限制

```typescript
// backpressure-rate-limit.ts
import { WebSocketServer, WebSocket } from 'ws';

interface RateLimitConfig {
  maxMessagesPerSecond: number;
  burstSize: number;
}

class RateLimitedWebSocketServer {
  private wss: WebSocketServer;
  private clientBuckets = new Map<WebSocket, { tokens: number; lastUpdate: number }>();

  constructor(
    port: number,
    private config: RateLimitConfig = { maxMessagesPerSecond: 10, burstSize: 20 }
  ) {
    this.wss = new WebSocketServer({ port });
    this.wss.on('connection', (ws) => this.handleConnection(ws));

    // 每秒补充令牌
    setInterval(() => this.refillTokens(), 1000);
  }

  private handleConnection(ws: WebSocket) {
    this.clientBuckets.set(ws, { tokens: this.config.burstSize, lastUpdate: Date.now() });

    ws.on('message', (data) => {
      const bucket = this.clientBuckets.get(ws);
      if (!bucket) return;

      if (bucket.tokens > 0) {
        bucket.tokens--;
        this.processMessage(ws, data);
      } else {
        // 触发背压：通知客户端减速
        ws.send(JSON.stringify({ type: 'backpressure', retryAfter: 1000 }));
      }
    });

    ws.on('close', () => this.clientBuckets.delete(ws));
  }

  private refillTokens() {
    for (const [ws, bucket] of this.clientBuckets) {
      if (ws.readyState === WebSocket.OPEN) {
        bucket.tokens = Math.min(
          bucket.tokens + this.config.maxMessagesPerSecond,
          this.config.burstSize
        );
      }
    }
  }

  private processMessage(ws: WebSocket, data: unknown) {
    // 实际业务处理
    this.wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }
}

new RateLimitedWebSocketServer(3003);
```

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

## 权威参考链接

| 资源 | 链接 | 说明 |
|------|------|------|
| WebSocket API (MDN) | [developer.mozilla.org/Web/API/WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket) | 浏览器 WebSocket 文档 |
| SSE (MDN) | [developer.mozilla.org/Web/API/Server-sent_events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events) | 服务器发送事件文档 |
| WebRTC Guide | [webrtc.org/getting-started/overview](https://webrtc.org/getting-started/overview) | WebRTC 官方入门指南 |
| MQTT.js | [github.com/mqttjs/MQTT.js](https://github.com/mqttjs/MQTT.js) | Node.js / 浏览器 MQTT 客户端 |
| Socket.IO | [socket.io/docs/v4](https://socket.io/docs/v4/) | 实时应用框架文档 |
| µWebSockets | [github.com/uNetworking/uWebSockets](https://github.com/uNetworking/uWebSockets) | 高性能 WebSocket 库 |
| Ably Documentation | [ably.com/docs](https://ably.com/docs) | 实时数据平台文档 |
| WebTransport | [developer.mozilla.org/Web/API/WebTransport](https://developer.mozilla.org/en-US/docs/Web/API/WebTransport) | 下一代 Web 传输 API |
| WebRTC Specification | [w3.org/TR/webrtc](https://www.w3.org/TR/webrtc/) | W3C WebRTC 标准 |
| MQTT Specification | [mqtt.org/mqtt-specification](https://mqtt.org/mqtt-specification/) | MQTT 协议标准 |
| WebSocket RFC 6455 | [rfc-editor.org/rfc/rfc6455](https://www.rfc-editor.org/rfc/rfc6455.html) | WebSocket 协议 RFC |
| SSE Specification | [html.spec.whatwg.org/multipage/server-sent-events.html](https://html.spec.whatwg.org/multipage/server-sent-events.html) | HTML 标准 SSE 章节 |
| Socket.IO Admin UI | [socket.io/docs/v4/admin-ui](https://socket.io/docs/v4/admin-ui/) | Socket.IO 监控面板 |
| Pusher Documentation | [pusher.com/docs](https://pusher.com/docs) | 托管实时通信服务 |

---

> 📅 最后更新: 2026-04-29
