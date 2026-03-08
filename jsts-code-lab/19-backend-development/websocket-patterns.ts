/**
 * @file WebSocket 实时通信模式
 * @category Backend Development → WebSocket
 * @difficulty medium
 * @tags websocket, realtime, socketio, event-driven
 * 
 * @description
 * WebSocket 实时通信实现：
 * - 房间管理
 * - 消息广播
 * - 心跳检测
 * - 重连机制
 */

// ============================================================================
// 1. 基础类型
// ============================================================================

export interface WebSocketMessage<T = unknown> {
  type: string;
  payload: T;
  timestamp: number;
  id: string;
}

export interface ConnectionState {
  isConnected: boolean;
  lastPing: number;
  reconnectAttempts: number;
}

type MessageHandler<T = unknown> = (message: WebSocketMessage<T>, clientId: string) => void;
type ConnectionHandler = (clientId: string) => void;

// ============================================================================
// 2. WebSocket 服务器
// ============================================================================

export class WebSocketServer {
  private clients: Map<string, ConnectionState> = new Map();
  private rooms: Map<string, Set<string>> = new Map();
  private handlers: Map<string, MessageHandler[]> = new Map();
  private connectionHandlers: ConnectionHandler[] = [];
  private disconnectionHandlers: ConnectionHandler[] = [];
  
  // 配置
  private heartbeatInterval = 30000; // 30秒
  private maxReconnectAttempts = 5;

  constructor() {
    this.startHeartbeat();
  }

  // 客户端连接
  connect(clientId: string): void {
    this.clients.set(clientId, {
      isConnected: true,
      lastPing: Date.now(),
      reconnectAttempts: 0
    });
    
    this.connectionHandlers.forEach(handler => handler(clientId));
    console.log(`Client ${clientId} connected`);
  }

  // 客户端断开
  disconnect(clientId: string): void {
    // 从所有房间移除
    this.rooms.forEach((clients, room) => {
      clients.delete(clientId);
    });
    
    this.clients.delete(clientId);
    this.disconnectionHandlers.forEach(handler => handler(clientId));
    console.log(`Client ${clientId} disconnected`);
  }

  // 加入房间
  joinRoom(clientId: string, room: string): void {
    if (!this.rooms.has(room)) {
      this.rooms.set(room, new Set());
    }
    this.rooms.get(room)!.add(clientId);
    console.log(`Client ${clientId} joined room ${room}`);
  }

  // 离开房间
  leaveRoom(clientId: string, room: string): void {
    this.rooms.get(room)?.delete(clientId);
    console.log(`Client ${clientId} left room ${room}`);
  }

  // 发送消息给指定客户端
  sendToClient(clientId: string, message: WebSocketMessage): boolean {
    const client = this.clients.get(clientId);
    if (client?.isConnected) {
      this.emitMessage(clientId, message);
      return true;
    }
    return false;
  }

  // 广播给所有客户端
  broadcast(message: WebSocketMessage, excludeClientId?: string): void {
    this.clients.forEach((state, clientId) => {
      if (clientId !== excludeClientId && state.isConnected) {
        this.emitMessage(clientId, message);
      }
    });
  }

  // 广播给房间
  broadcastToRoom(room: string, message: WebSocketMessage, excludeClientId?: string): void {
    const roomClients = this.rooms.get(room);
    if (!roomClients) return;

    roomClients.forEach(clientId => {
      if (clientId !== excludeClientId) {
        this.sendToClient(clientId, message);
      }
    });
  }

  // 注册消息处理器
  onMessage<T>(type: string, handler: MessageHandler<T>): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, []);
    }
    this.handlers.get(type)!.push(handler as MessageHandler);
    
    return () => {
      const handlers = this.handlers.get(type);
      if (handlers) {
        const index = handlers.indexOf(handler as MessageHandler);
        if (index > -1) handlers.splice(index, 1);
      }
    };
  }

  // 注册连接处理器
  onConnection(handler: ConnectionHandler): () => void {
    this.connectionHandlers.push(handler);
    return () => {
      const index = this.connectionHandlers.indexOf(handler);
      if (index > -1) this.connectionHandlers.splice(index, 1);
    };
  }

  // 注册断开处理器
  onDisconnection(handler: ConnectionHandler): () => void {
    this.disconnectionHandlers.push(handler);
    return () => {
      const index = this.disconnectionHandlers.indexOf(handler);
      if (index > -1) this.disconnectionHandlers.splice(index, 1);
    };
  }

  // 处理收到的消息
  handleMessage(clientId: string, rawMessage: string): void {
    try {
      const message: WebSocketMessage = JSON.parse(rawMessage);
      
      // 更新心跳
      const client = this.clients.get(clientId);
      if (client) {
        client.lastPing = Date.now();
      }

      // 处理心跳
      if (message.type === 'ping') {
        this.sendToClient(clientId, {
          type: 'pong',
          payload: null,
          timestamp: Date.now(),
          id: this.generateId()
        });
        return;
      }

      // 分发给处理器
      const handlers = this.handlers.get(message.type);
      if (handlers) {
        handlers.forEach(handler => handler(message, clientId));
      }
    } catch (error) {
      console.error('Failed to parse message:', error);
    }
  }

  // 获取房间成员
  getRoomMembers(room: string): string[] {
    return Array.from(this.rooms.get(room) || []);
  }

  // 获取客户端数量
  getClientCount(): number {
    return this.clients.size;
  }

  // 获取房间数量
  getRoomCount(): number {
    return this.rooms.size;
  }

  private emitMessage(clientId: string, message: WebSocketMessage): void {
    // 实际实现中通过 WebSocket 发送
    console.log(`[${clientId}] <- ${message.type}`);
  }

  private startHeartbeat(): void {
    setInterval(() => {
      const now = Date.now();
      this.clients.forEach((state, clientId) => {
        // 检查超时（60秒无响应）
        if (now - state.lastPing > 60000) {
          console.log(`Client ${clientId} timeout, disconnecting`);
          this.disconnect(clientId);
        }
      });
    }, this.heartbeatInterval);
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}

// ============================================================================
// 3. WebSocket 客户端
// ============================================================================

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private messageQueue: WebSocketMessage[] = [];
  private handlers: Map<string, MessageHandler[]> = new Map();
  private state: ConnectionState = {
    isConnected: false,
    lastPing: 0,
    reconnectAttempts: 0
  };

  constructor(url: string) {
    this.url = url;
  }

  connect(): void {
    // 浏览器环境
    if (typeof WebSocket !== 'undefined') {
      this.ws = new WebSocket(this.url);
      this.setupEventHandlers();
    } else {
      console.log('WebSocket not available in Node.js');
    }
  }

  private setupEventHandlers(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.state.isConnected = true;
      this.reconnectAttempts = 0;
      this.flushMessageQueue();
    };

    this.ws.onmessage = (event) => {
      const message: WebSocketMessage = JSON.parse(event.data);
      this.handleMessage(message);
    };

    this.ws.onclose = () => {
      console.log('WebSocket closed');
      this.state.isConnected = false;
      this.attemptReconnect();
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      console.log(`Reconnecting in ${delay}ms... (attempt ${this.reconnectAttempts})`);
      
      setTimeout(() => {
        this.connect();
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  send(type: string, payload: unknown): void {
    const message: WebSocketMessage = {
      type,
      payload,
      timestamp: Date.now(),
      id: this.generateId()
    };

    if (this.state.isConnected && this.ws) {
      this.ws.send(JSON.stringify(message));
    } else {
      this.messageQueue.push(message);
    }
  }

  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift()!;
      this.ws?.send(JSON.stringify(message));
    }
  }

  private handleMessage(message: WebSocketMessage): void {
    const handlers = this.handlers.get(message.type);
    if (handlers) {
      handlers.forEach(handler => handler(message, 'server'));
    }
  }

  on<T>(type: string, handler: MessageHandler<T>): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, []);
    }
    this.handlers.get(type)!.push(handler as MessageHandler);
    
    return () => {
      const handlers = this.handlers.get(type);
      if (handlers) {
        const index = handlers.indexOf(handler as MessageHandler);
        if (index > -1) handlers.splice(index, 1);
      }
    };
  }

  disconnect(): void {
    this.ws?.close();
  }

  isConnected(): boolean {
    return this.state.isConnected;
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}

// ============================================================================
// 4. 使用示例
// ============================================================================

export function demo(): void {
  console.log('=== WebSocket 实时通信模式 ===\n');

  // 创建服务器
  const server = new WebSocketServer();

  // 注册处理器
  server.onConnection((clientId) => {
    console.log(`   🟢 Client ${clientId} connected`);
  });

  server.onDisconnection((clientId) => {
    console.log(`   🔴 Client ${clientId} disconnected`);
  });

  server.onMessage<{ text: string }>('chat', (message, clientId) => {
    console.log(`   💬 ${clientId}: ${message.payload.text}`);
    
    // 广播给所有人
    server.broadcast({
      type: 'chat',
      payload: { text: message.payload.text, from: clientId },
      timestamp: Date.now(),
      id: Math.random().toString(36).substring(2)
    });
  });

  console.log('1. 模拟客户端连接');
  server.connect('user-1');
  server.connect('user-2');
  server.connect('user-3');

  console.log('\n2. 房间管理');
  server.joinRoom('user-1', 'room-a');
  server.joinRoom('user-2', 'room-a');
  server.joinRoom('user-3', 'room-b');
  
  console.log('   Room A members:', server.getRoomMembers('room-a'));
  console.log('   Room B members:', server.getRoomMembers('room-b'));

  console.log('\n3. 消息广播');
  server.broadcastToRoom('room-a', {
    type: 'notification',
    payload: { message: 'Hello Room A!' },
    timestamp: Date.now(),
    id: 'msg-1'
  });

  console.log('\n4. 处理消息');
  server.handleMessage('user-1', JSON.stringify({
    type: 'chat',
    payload: { text: 'Hello everyone!' },
    timestamp: Date.now(),
    id: 'msg-2'
  }));

  console.log('\n5. 统计信息');
  console.log('   Total clients:', server.getClientCount());
  console.log('   Total rooms:', server.getRoomCount());

  console.log('\n6. 断开连接');
  server.disconnect('user-3');
  console.log('   Remaining clients:', server.getClientCount());

  console.log('\nWebSocket 要点:');
  console.log('- 全双工通信：服务器和客户端可同时发送消息');
  console.log('- 房间机制：实现群组消息广播');
  console.log('- 心跳检测：保持连接活跃，检测死连接');
  console.log('- 自动重连：客户端断开后自动恢复连接');
  console.log('- 消息队列：离线时缓存消息，恢复后发送');
}

// ============================================================================
// 导出 (已在上面导出)
// ============================================================================
