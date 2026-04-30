---
dimension: 应用领域
application-domain: 实时通信
created: 2026-04-27
---

# 维度标注

- **所属维度**: 应用领域（Application Domain）
- **应用域**: 实时通信 — WebSocket、SSE、WebRTC 与实时数据推送
- **模块编号**: 30-real-time-communication

## 边界说明

本模块聚焦实时通信技术的应用开发模式，包括：

- WebSocket 双向通信与房间管理
- SSE 服务器推送与自动重连
- WebRTC P2P 连接与数据通道

底层网络协议（TCP/UDP）和通用后端框架不属于本模块范围。

## 子模块目录结构

| 子模块 | 说明 | 典型文件 |
|--------|------|----------|
| `websocket/` | WebSocket 客户端封装与房间管理 | `room-manager.ts`, `reconnect-socket.ts` |
| `sse/` | Server-Sent Events 自动重连与事件解析 | `event-source-manager.ts`, `sse-parser.ts` |
| `webrtc/` | P2P 连接、DataChannel 与信令 | `peer-connection.ts`, `signaling-client.ts` |
| `sse-webrtc.ts` | SSE 与 WebRTC 混合架构示例 | `sse-webrtc.test.ts` |
| `index.ts` | 模块统一导出 | — |

## 代码示例

### 可重连 WebSocket 封装

```typescript
export class ResilientWebSocket {
  private ws?: WebSocket;
  private reconnectTimer?: ReturnType<typeof setTimeout>;
  private url: string;
  private listeners: Map<string, Set<(data: unknown) => void>> = new Map();

  constructor(url: string) {
    this.url = url;
    this.connect();
  }

  private connect() {
    this.ws = new WebSocket(this.url);
    this.ws.onmessage = (event) => {
      const { type, payload } = JSON.parse(event.data);
      this.listeners.get(type)?.forEach((cb) => cb(payload));
    };
    this.ws.onclose = () => {
      this.reconnectTimer = setTimeout(() => this.connect(), 3000);
    };
  }

  on(type: string, handler: (data: unknown) => void) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type)!.add(handler);
  }

  send(type: string, payload: unknown) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    }
  }

  close() {
    clearTimeout(this.reconnectTimer);
    this.ws?.close();
  }
}
```

### WebSocket 二进制流传输

```typescript
// binary-streaming.ts — WebSocket 分片传输大文件
export class BinaryChunkUploader {
  private ws: WebSocket;
  private chunkSize = 16 * 1024; // 16KB

  constructor(url: string) {
    this.ws = new WebSocket(url);
    this.ws.binaryType = 'arraybuffer';
  }

  async upload(file: File, onProgress?: (sent: number, total: number) => void): Promise<void> {
    const totalChunks = Math.ceil(file.size / this.chunkSize);
    const stream = file.stream();
    const reader = stream.getReader();
    let chunkIndex = 0;
    let sent = 0;

    // 发送元数据
    this.ws.send(JSON.stringify({ type: 'start', name: file.name, totalChunks }));

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      this.ws.send(value);
      sent += value.byteLength;
      onProgress?.(sent, file.size);
      chunkIndex++;
    }

    this.ws.send(JSON.stringify({ type: 'end' }));
  }
}
```

### SSE 自动重连管理器

```typescript
export class SSEManager extends EventTarget {
  private source?: EventSource;
  private url: string;

  constructor(url: string) {
    super();
    this.url = url;
    this.connect();
  }

  private connect() {
    this.source = new EventSource(this.url);
    this.source.onmessage = (e) =>
      this.dispatchEvent(new CustomEvent('message', { detail: JSON.parse(e.data) }));
    this.source.onerror = () => {
      this.source?.close();
      setTimeout(() => this.connect(), 5000);
    };
  }

  close() {
    this.source?.close();
  }
}
```

### SSE 多通道事件分发

```typescript
// multi-channel-sse.ts — 基于事件名称的类型安全分发
type SSEEventMap = {
  'price-update': { symbol: string; price: number };
  'order-fill': { orderId: string; status: 'filled' | 'partial' };
  'system-alert': { level: 'warn' | 'critical'; message: string };
};

export class TypedEventSource<TMap extends Record<string, unknown>> extends EventTarget {
  private source: EventSource;

  constructor(url: string) {
    super();
    this.source = new EventSource(url);
    this.source.onmessage = (e) => {
      const { event, data } = JSON.parse(e.data);
      this.dispatchEvent(new CustomEvent(event, { detail: data }));
    };
  }

  on<K extends keyof TMap>(event: K, handler: (data: TMap[K]) => void) {
    this.addEventListener(event as string, ((e: CustomEvent) => handler(e.detail)) as EventListener);
  }
}

// 使用
const sse = new TypedEventSource<SSEEventMap>('/api/events');
sse.on('price-update', (data) => console.log(data.symbol, data.price));
```

### WebRTC DataChannel 文件传输

```typescript
export async function createDataChannel(
  pc: RTCPeerConnection
): Promise<RTCDataChannel> {
  const channel = pc.createDataChannel('fileTransfer', {
    ordered: true,
    maxRetransmits: 3,
  });

  return new Promise((resolve) => {
    channel.onopen = () => resolve(channel);
  });
}
```

### WebRTC 完美协商模式

```typescript
// perfect-negotiation.ts — 处理信令冲突的推荐模式
export function setupPerfectNegotiation(pc: RTCPeerConnection, signaling: SignalingChannel, polite: boolean) {
  let makingOffer = false;
  let ignoreOffer = false;

  pc.onnegotiationneeded = async () => {
    try {
      makingOffer = true;
      await pc.setLocalDescription();
      signaling.send({ description: pc.localDescription });
    } catch (err) {
      console.error(err);
    } finally {
      makingOffer = false;
    }
  };

  pc.onicecandidate = ({ candidate }) => signaling.send({ candidate });

  signaling.onMessage = async ({ description, candidate }) => {
    try {
      if (description) {
        const offerCollision = description.type === 'offer' && (makingOffer || pc.signalingState !== 'stable');
        ignoreOffer = !polite && offerCollision;
        if (ignoreOffer) return;

        await pc.setRemoteDescription(description);
        if (description.type === 'offer') {
          await pc.setLocalDescription();
          signaling.send({ description: pc.localDescription });
        }
      } else if (candidate) {
        await pc.addIceCandidate(candidate);
      }
    } catch (err) {
      if (!ignoreOffer) console.error(err);
    }
  };
}
```

### WebTransport 客户端（HTTP/3 双向流）

```typescript
// webtransport-client.ts — 下一代 Web 传输 API
export class WebTransportClient {
  private transport?: WebTransport;
  private datagramWriter?: WritableStreamDefaultWriter;

  async connect(url: string) {
    this.transport = new WebTransport(url);
    await this.transport.ready;

    // 数据报（不可靠但低延迟，类似 UDP）
    const datagrams = this.transport.datagrams;
    this.datagramWriter = datagrams.writable.getWriter();

    // 读取数据报
    const reader = datagrams.readable.getReader();
    this.readLoop(reader);

    // 双向流（可靠，类似 TCP）
    const stream = await this.transport.createBidirectionalStream();
    this.handleStream(stream);
  }

  private async readLoop(reader: ReadableStreamDefaultReader<Uint8Array>) {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      console.log('Received datagram:', new TextDecoder().decode(value));
    }
  }

  private async handleStream(stream: WebTransportBidirectionalStream) {
    const writer = stream.writable.getWriter();
    const reader = stream.readable.getReader();

    await writer.write(new TextEncoder().encode('Hello from WebTransport'));

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      console.log('Stream data:', new TextDecoder().decode(value));
    }
  }

  async sendDatagram(data: Uint8Array) {
    await this.datagramWriter?.write(data);
  }
}
```

### Presence（在线状态）心跳管理

```typescript
// presence-manager.ts — 用户在线状态与心跳机制
export class PresenceManager {
  private ws: WebSocket;
  private heartbeatInterval?: ReturnType<typeof setInterval>;
  private missedPongs = 0;
  private readonly heartbeatMs = 30000;
  private readonly maxMissedPongs = 2;

  constructor(ws: WebSocket) {
    this.ws = ws;
    this.ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.type === 'pong') this.missedPongs = 0;
    };
  }

  start() {
    this.heartbeatInterval = setInterval(() => {
      if (this.missedPongs >= this.maxMissedPongs) {
        this.ws.close();
        this.stop();
        return;
      }
      this.ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
      this.missedPongs++;
    }, this.heartbeatMs);
  }

  stop() {
    clearInterval(this.heartbeatInterval);
  }
}
```

## 关联模块

- `19-backend-development` — 后端 WebSocket 模式
- `30-knowledge-base/30.2-categories/33-real-time-communication.md` — 实时通信技术分类
- `30-knowledge-base/application-domains-index.md` — 应用领域总索引

## 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| MDN — WebSocket API | 文档 | [developer.mozilla.org/en-US/docs/Web/API/WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket) |
| MDN — Server-Sent Events | 文档 | [developer.mozilla.org/en-US/docs/Web/API/Server-sent_events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events) |
| MDN — WebRTC API | 文档 | [developer.mozilla.org/en-US/docs/Web/API/WebRTC_API](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API) |
| MDN — WebTransport API | 文档 | [developer.mozilla.org/en-US/docs/Web/API/WebTransport](https://developer.mozilla.org/en-US/docs/Web/API/WebTransport) |
| web.dev — WebRTC for the Curious | 指南 | [webrtcforthecurious.com](https://webrtcforthecurious.com) |
| Socket.IO Docs | 文档 | [socket.io/docs/v4](https://socket.io/docs/v4) |
| W3C — WebRTC Specification | 规范 | [w3c.github.io/webrtc-pc](https://w3c.github.io/webrtc-pc) |
| RFC 6455 — WebSocket Protocol | 标准 | [datatracker.ietf.org/doc/html/rfc6455](https://datatracker.ietf.org/doc/html/rfc6455) |
| RFC 9112 — HTTP/1.1 | 标准 | [datatracker.ietf.org/doc/html/rfc9112](https://datatracker.ietf.org/doc/html/rfc9112) |
| WebTransport API | 文档 | [developer.mozilla.org/en-US/docs/Web/API/WebTransport](https://developer.mozilla.org/en-US/docs/Web/API/WebTransport) |
| WebCodecs API | 文档 | [developer.mozilla.org/en-US/docs/Web/API/WebCodecs_API](https://developer.mozilla.org/en-US/docs/Web/API/WebCodecs_API) |
| WebRTC Perfect Negotiation | 指南 | [developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Perfect_negotiation](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Perfect_negotiation) |
| Ably — Realtime Concepts | 文章 | [ably.com/topic](https://ably.com/topic) |
| WebTransport Working Draft | W3C | [w3c.github.io/webtransport/](https://w3c.github.io/webtransport/) |
| IETF WebTransport Protocol | 草案 | [datatracker.ietf.org/doc/html/draft-ietf-webtrans-http3](https://datatracker.ietf.org/doc/html/draft-ietf-webtrans-http3/) |
| Google WebRTC Internals | 工具 | [webrtc.github.io/samples/](https://webrtc.github.io/samples/) |
| Janus WebRTC Server | 开源 | [janus.conf.meetecho.com](https://janus.conf.meetecho.com/) |
| mediasoup — WebRTC SFU | 开源 | [mediasoup.org](https://mediasoup.org/) |
| SSE vs WebSocket — Ably | 对比 | [ably.com/topic/server-sent-events-vs-websockets](https://ably.com/topic/server-sent-events-vs-websockets) |
| WebSocket Compression (RFC 7692) | 标准 | [datatracker.ietf.org/doc/html/rfc7692](https://datatracker.ietf.org/doc/html/rfc7692) |

### WebSocket 压缩（permessage-deflate）

```typescript
// websocket-compression.ts — 在 ws 库中启用压缩
import WebSocket from 'ws';

const server = new WebSocket.Server({
  port: 8080,
  perMessageDeflate: {
    zlibDeflateOptions: { chunkSize: 1024, memLevel: 7, level: 3 },
    clientNoContextTakeover: true,
    serverNoContextTakeover: true,
  },
});

server.on('connection', (socket) => {
  socket.on('message', (data) => console.log('received', data));
  socket.send(JSON.stringify({ type: 'hello', payload: 'compressed' }));
});
```

### WebRTC 屏幕采集

```typescript
// screen-capture.ts — 获取屏幕共享流
async function startScreenCapture() {
  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: { cursor: 'always' as const },
    audio: false,
  });

  const videoTrack = stream.getVideoTracks()[0];
  console.log('Screen capture track:', videoTrack.label);

  // 将流添加到现有 RTCPeerConnection
  pc.addTrack(videoTrack, stream);
}
```

### 新增权威参考链接

| 资源 | 类型 | 链接 |
|------|------|------|
| RFC 7692 — WebSocket Compression | 标准 | [datatracker.ietf.org/doc/html/rfc7692](https://datatracker.ietf.org/doc/html/rfc7692) |
| MDN — getDisplayMedia | 文档 | [developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia) |
| WebRTC Screen Capture API | 文档 | [developer.mozilla.org/en-US/docs/Web/API/Screen_Capture_API](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Capture_API) |
| web.dev — WebRTC Basics | 指南 | [web.dev/webrtc-basics](https://web.dev/webrtc-basics/) |
| Socket.IO Rooms | 文档 | [socket.io/docs/v4/rooms](https://socket.io/docs/v4/rooms/) |
| Ably WebSocket Guide | 文章 | [ably.com/topic/websockets](https://ably.com/topic/websockets) |

---

*最后更新: 2026-04-30*
