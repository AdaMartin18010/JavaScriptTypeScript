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
| web.dev — WebRTC for the Curious | 指南 | [webrtcforthecurious.com](https://webrtcforthecurious.com) |
| Socket.IO Docs | 文档 | [socket.io/docs/v4](https://socket.io/docs/v4) |
| W3C — WebRTC Specification | 规范 | [w3c.github.io/webrtc-pc](https://w3c.github.io/webrtc-pc) |
| RFC 6455 — WebSocket Protocol | 标准 | [datatracker.ietf.org/doc/html/rfc6455](https://datatracker.ietf.org/doc/html/rfc6455) |
| RFC 9112 — HTTP/1.1 | 标准 | [datatracker.ietf.org/doc/html/rfc9112](https://datatracker.ietf.org/doc/html/rfc9112) |
| WebTransport API | 文档 | [developer.mozilla.org/en-US/docs/Web/API/WebTransport](https://developer.mozilla.org/en-US/docs/Web/API/WebTransport) |
| WebCodecs API | 文档 | [developer.mozilla.org/en-US/docs/Web/API/WebCodecs_API](https://developer.mozilla.org/en-US/docs/Web/API/WebCodecs_API) |
| WebRTC Perfect Negotiation | 指南 | [developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Perfect_negotiation](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Perfect_negotiation) |
| Ably — Realtime Concepts | 文章 | [ably.com/topic](https://ably.com/topic) |

---

*最后更新: 2026-04-29*
