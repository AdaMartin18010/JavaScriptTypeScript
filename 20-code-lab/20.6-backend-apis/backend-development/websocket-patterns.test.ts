import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WebSocketServer, WebSocketClient } from './websocket-patterns.js';

describe('WebSocketServer', () => {
  let server: WebSocketServer;

  beforeEach(() => {
    server = new WebSocketServer();
  });

  it('should connect and disconnect clients', () => {
    server.connect('user-1');
    expect(server.getClientCount()).toBe(1);

    server.disconnect('user-1');
    expect(server.getClientCount()).toBe(0);
  });

  it('should manage rooms', () => {
    server.connect('user-1');
    server.connect('user-2');

    server.joinRoom('user-1', 'room-a');
    server.joinRoom('user-2', 'room-a');

    expect(server.getRoomMembers('room-a')).toContain('user-1');
    expect(server.getRoomMembers('room-a')).toContain('user-2');
    expect(server.getRoomCount()).toBe(1);

    server.leaveRoom('user-1', 'room-a');
    expect(server.getRoomMembers('room-a')).not.toContain('user-1');
  });

  it('should disconnect removes client from rooms', () => {
    server.connect('user-1');
    server.joinRoom('user-1', 'room-a');
    server.disconnect('user-1');
    expect(server.getRoomMembers('room-a')).not.toContain('user-1');
  });

  it('should send message to specific client', () => {
    server.connect('user-1');
    const result = server.sendToClient('user-1', {
      type: 'notify',
      payload: {},
      timestamp: Date.now(),
      id: '1',
    });
    expect(result).toBe(true);
  });

  it('should fail to send to disconnected client', () => {
    const result = server.sendToClient('user-1', {
      type: 'notify',
      payload: {},
      timestamp: Date.now(),
      id: '1',
    });
    expect(result).toBe(false);
  });

  it('should broadcast messages', () => {
    server.connect('user-1');
    server.connect('user-2');

    const message = { type: 'broadcast', payload: {}, timestamp: Date.now(), id: '1' };
    server.broadcast(message, 'user-1');
    // Broadcasting is logged; we mainly test it doesn't throw
  });

  it('should broadcast to room', () => {
    server.connect('user-1');
    server.connect('user-2');
    server.joinRoom('user-1', 'room-a');
    server.joinRoom('user-2', 'room-a');

    const message = { type: 'room-msg', payload: {}, timestamp: Date.now(), id: '1' };
    server.broadcastToRoom('room-a', message);
  });

  it('should register and trigger message handlers', () => {
    const handler = vi.fn();
    server.onMessage('chat', handler);

    server.connect('user-1');
    server.handleMessage('user-1', JSON.stringify({
      type: 'chat',
      payload: { text: 'hello' },
      timestamp: Date.now(),
      id: '1',
    }));

    expect(handler).toHaveBeenCalled();
  });

  it('should respond to ping with pong', () => {
    server.connect('user-1');
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    server.handleMessage('user-1', JSON.stringify({
      type: 'ping',
      payload: null,
      timestamp: Date.now(),
      id: '1',
    }));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('pong'));
    logSpy.mockRestore();
  });

  it('should handle invalid JSON gracefully', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    server.handleMessage('user-1', 'not-json');
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it('should support connection and disconnection handlers', () => {
    const onConnect = vi.fn();
    const onDisconnect = vi.fn();

    server.onConnection(onConnect);
    server.onDisconnection(onDisconnect);

    server.connect('user-1');
    expect(onConnect).toHaveBeenCalledWith('user-1');

    server.disconnect('user-1');
    expect(onDisconnect).toHaveBeenCalledWith('user-1');
  });

  it('should allow unsubscribing handlers', () => {
    const handler = vi.fn();
    const unsubscribe = server.onMessage('chat', handler);
    unsubscribe();

    server.connect('user-1');
    server.handleMessage('user-1', JSON.stringify({ type: 'chat', payload: {}, timestamp: Date.now(), id: '1' }));
    expect(handler).not.toHaveBeenCalled();
  });
});

describe('WebSocketClient', () => {
  it('should instantiate', () => {
    const client = new WebSocketClient('ws://localhost:8080');
    expect(client).toBeInstanceOf(WebSocketClient);
  });

  it('should queue messages when disconnected', () => {
    const client = new WebSocketClient('ws://localhost:8080');
    client.send('chat', { text: 'hello' });
    expect(client.messageQueue.length).toBe(1);
  });

  it('should register and trigger message handlers', () => {
    const client = new WebSocketClient('ws://localhost:8080');
    const handler = vi.fn();
    client.on('chat', handler);

    // @ts-expect-error accessing private method for testing
    client.handleMessage({ type: 'chat', payload: {}, timestamp: Date.now(), id: '1' });

    expect(handler).toHaveBeenCalled();
  });

  it('should allow unsubscribing from messages', () => {
    const client = new WebSocketClient('ws://localhost:8080');
    const handler = vi.fn();
    const unsubscribe = client.on('chat', handler);
    unsubscribe();

    // @ts-expect-error accessing private method for testing
    client.handleMessage({ type: 'chat', payload: {}, timestamp: Date.now(), id: '1' });
    expect(handler).not.toHaveBeenCalled();
  });
});
