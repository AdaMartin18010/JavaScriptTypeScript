/**
 * @file 实时通信技术
 * @category Real-Time Communication → SSE/WebRTC
 * @difficulty hard
 * @tags sse, webrtc, real-time, streaming
 * 
 * @description
 * 实时通信实现：
 * - Server-Sent Events (SSE)
 * - WebRTC 点对点通信
 * - 信令服务器
 * - 数据通道
 */

// ============================================================================
// 1. Server-Sent Events (SSE)
// ============================================================================

export interface SSEMessage {
  id?: string;
  event?: string;
  data: string;
  retry?: number;
}

export class SSEServer {
  private clients: Map<string, (message: SSEMessage) => void> = new Map();

  subscribe(clientId: string, callback: (message: SSEMessage) => void): () => void {
    this.clients.set(clientId, callback);
    console.log(`SSE client ${clientId} connected`);
    
    return () => {
      this.clients.delete(clientId);
      console.log(`SSE client ${clientId} disconnected`);
    };
  }

  broadcast(message: SSEMessage): void {
    this.clients.forEach((callback, clientId) => {
      try {
        callback(message);
      } catch (error) {
        console.error(`Error sending to ${clientId}:`, error);
        this.clients.delete(clientId);
      }
    });
  }

  sendTo(clientId: string, message: SSEMessage): void {
    const callback = this.clients.get(clientId);
    if (callback) {
      callback(message);
    }
  }

  // 格式化 SSE 消息
  static formatMessage(message: SSEMessage): string {
    let output = '';
    if (message.id) output += `id: ${message.id}\n`;
    if (message.event) output += `event: ${message.event}\n`;
    if (message.retry) output += `retry: ${message.retry}\n`;
    output += `data: ${message.data}\n\n`;
    return output;
  }

  getClientCount(): number {
    return this.clients.size;
  }
}

// ============================================================================
// 2. WebRTC 信令服务器
// ============================================================================

export interface SignalMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'join' | 'leave';
  from: string;
  to: string;
  payload: unknown;
  timestamp: number;
}

export class SignalingServer {
  private rooms: Map<string, Set<string>> = new Map();
  private handlers: Map<string, (message: SignalMessage) => void> = new Map();

  join(roomId: string, peerId: string, handler: (msg: SignalMessage) => void): void {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
    }
    this.rooms.get(roomId)!.add(peerId);
    this.handlers.set(peerId, handler);
    
    // 通知房间其他成员
    this.broadcast(roomId, {
      type: 'join',
      from: 'server',
      to: peerId,
      payload: { roomId, peers: Array.from(this.rooms.get(roomId)!) },
      timestamp: Date.now()
    }, peerId);
  }

  leave(roomId: string, peerId: string): void {
    this.rooms.get(roomId)?.delete(peerId);
    this.handlers.delete(peerId);
    
    if (this.rooms.get(roomId)?.size === 0) {
      this.rooms.delete(roomId);
    }
  }

  relay(message: SignalMessage): void {
    const handler = this.handlers.get(message.to);
    if (handler) {
      handler(message);
    }
  }

  broadcast(roomId: string, message: SignalMessage, excludePeer?: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    room.forEach(peerId => {
      if (peerId !== excludePeer) {
        const handler = this.handlers.get(peerId);
        if (handler) {
          handler({ ...message, to: peerId });
        }
      }
    });
  }
}

// ============================================================================
// 3. WebRTC 连接管理器
// ============================================================================

export enum ConnectionState {
  NEW = 'new',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  FAILED = 'failed',
  CLOSED = 'closed'
}

export class WebRTCConnection {
  private peerId: string;
  private targetId: string;
  private state: ConnectionState = ConnectionState.NEW;
  private dataChannel: unknown | null = null;
  private iceCandidates: RTCIceCandidate[] = [];

  onStateChange?: (state: ConnectionState) => void;
  onDataChannelMessage?: (data: unknown) => void;
  onIceCandidate?: (candidate: RTCIceCandidate) => void;

  constructor(peerId: string, targetId: string) {
    this.peerId = peerId;
    this.targetId = targetId;
  }

  async createOffer(): Promise<RTCSessionDescriptionInit> {
    this.setState(ConnectionState.CONNECTING);
    
    // 模拟创建 offer
    const offer: RTCSessionDescriptionInit = {
      type: 'offer',
      sdp: `v=0\r\n${this.peerId} offering to ${this.targetId}`
    };
    
    return offer;
  }

  async createAnswer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    const answer: RTCSessionDescriptionInit = {
      type: 'answer',
      sdp: `v=0\r\n${this.peerId} answering to ${this.targetId}`
    };
    
    this.setState(ConnectionState.CONNECTED);
    return answer;
  }

  addIceCandidate(candidate: RTCIceCandidate): void {
    this.iceCandidates.push(candidate);
    console.log(`ICE candidate added for ${this.targetId}`);
  }

  createDataChannel(label: string): void {
    this.dataChannel = {
      label,
      readyState: 'open',
      send: (data: unknown) => {
        console.log(`Data sent via ${label}:`, data);
      }
    };
    console.log(`Data channel '${label}' created`);
  }

  sendData(data: unknown): void {
    if (this.dataChannel) {
      (this.dataChannel as any).send(data);
    }
  }

  close(): void {
    this.setState(ConnectionState.CLOSED);
    this.dataChannel = null;
  }

  private setState(state: ConnectionState): void {
    this.state = state;
    this.onStateChange?.(state);
  }

  getState(): ConnectionState {
    return this.state;
  }
}

// ============================================================================
// 4. 实时协作示例：共享白板
// ============================================================================

export interface DrawingAction {
  type: 'draw' | 'clear' | 'undo';
  x?: number;
  y?: number;
  color?: string;
  peerId: string;
  timestamp: number;
}

export class CollaborativeWhiteboard {
  private actions: DrawingAction[] = [];
  private peers: Map<string, (action: DrawingAction) => void> = new Map();
  private undoStack: DrawingAction[] = [];

  join(peerId: string, callback: (action: DrawingAction) => void): void {
    this.peers.set(peerId, callback);
    console.log(`Peer ${peerId} joined whiteboard`);
  }

  leave(peerId: string): void {
    this.peers.delete(peerId);
    console.log(`Peer ${peerId} left whiteboard`);
  }

  draw(action: DrawingAction): void {
    this.actions.push(action);
    this.broadcast(action, action.peerId);
  }

  undo(peerId: string): void {
    const lastAction = this.actions.pop();
    if (lastAction) {
      this.undoStack.push(lastAction);
      this.broadcast({ type: 'undo', peerId, timestamp: Date.now() }, peerId);
    }
  }

  clear(peerId: string): void {
    this.undoStack = [...this.actions, ...this.undoStack];
    this.actions = [];
    this.broadcast({ type: 'clear', peerId, timestamp: Date.now() }, peerId);
  }

  private broadcast(action: DrawingAction, excludePeer: string): void {
    this.peers.forEach((callback, peerId) => {
      if (peerId !== excludePeer) {
        callback(action);
      }
    });
  }

  getActionCount(): number {
    return this.actions.length;
  }
}

// ============================================================================
// 5. 使用示例
// ============================================================================

export function demo(): void {
  console.log('=== 实时通信技术 ===\n');

  console.log('1. Server-Sent Events');
  const sseServer = new SSEServer();
  
  const unsubscribe1 = sseServer.subscribe('client-1', (msg) => {
    console.log(`   Client 1 received: ${msg.data}`);
  });
  
  sseServer.subscribe('client-2', (msg) => {
    console.log(`   Client 2 received: ${msg.data}`);
  });

  sseServer.broadcast({ event: 'update', data: 'New notification!' });
  sseServer.broadcast({ event: 'message', data: 'Hello from server' });
  
  console.log(`   Total clients: ${sseServer.getClientCount()}`);
  unsubscribe1();

  console.log('\n2. WebRTC 信令');
  const signaling = new SignalingServer();
  
  signaling.join('room-1', 'peer-a', (msg) => {
    console.log(`   Peer A received: ${msg.type}`);
  });
  
  signaling.join('room-1', 'peer-b', (msg) => {
    console.log(`   Peer B received: ${msg.type}`);
  });

  signaling.relay({
    type: 'offer',
    from: 'peer-a',
    to: 'peer-b',
    payload: { sdp: 'offer-sdp' },
    timestamp: Date.now()
  });

  console.log('\n3. WebRTC 连接');
  const connection = new WebRTCConnection('peer-a', 'peer-b');
  
  connection.onStateChange = (state) => {
    console.log(`   Connection state: ${state}`);
  };

  connection.createOffer().then(offer => {
    console.log(`   Offer created: ${offer.type}`);
  });

  connection.createAnswer({ type: 'offer', sdp: 'test' }).then(answer => {
    console.log(`   Answer created: ${answer.type}`);
  });

  console.log('\n4. 协作白板');
  const whiteboard = new CollaborativeWhiteboard();
  
  whiteboard.join('user-1', (action) => {
    console.log(`   User 1 sees: ${action.type} at (${action.x}, ${action.y})`);
  });
  
  whiteboard.join('user-2', (action) => {
    console.log(`   User 2 sees: ${action.type}`);
  });

  whiteboard.draw({
    type: 'draw',
    x: 100,
    y: 200,
    color: '#ff0000',
    peerId: 'user-1',
    timestamp: Date.now()
  });

  console.log(`   Total actions: ${whiteboard.getActionCount()}`);

  console.log('\n实时通信要点:');
  console.log('- SSE: 服务器向客户端单向推送，适合通知、直播');
  console.log('- WebRTC: 点对点通信，适合视频会议、文件传输');
  console.log('- 信令服务器: 协助建立 P2P 连接');
  console.log('- 数据通道: 低延迟传输任意数据');
  console.log('- 协作应用: 操作同步、冲突解决');
}

// ============================================================================
// 导出
// ============================================================================

export type { SSEMessage, SignalMessage, DrawingAction };
