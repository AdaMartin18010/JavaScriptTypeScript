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

---

*最后更新: 2026-04-29*
