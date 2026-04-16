import { describe, it, expect } from 'vitest';
import { SSEServer, SignalingServer, WebRTCConnection, CollaborativeWhiteboard } from './sse-webrtc';

describe('SSEServer', () => {
  it('subscribes, broadcasts, and unsubscribes', () => {
    const server = new SSEServer();
    const msgs: any[] = [];
    const unsub = server.subscribe('c1', m => msgs.push(m));
    server.broadcast({ data: 'hi' });
    expect(msgs.length).toBe(1);
    expect(msgs[0].data).toBe('hi');
    unsub();
    server.broadcast({ data: 'bye' });
    expect(msgs.length).toBe(1);
  });

  it('formats SSE messages', () => {
    const msg = SSEServer.formatMessage({ id: '1', event: 'update', data: 'x', retry: 3000 });
    expect(msg).toContain('id: 1');
    expect(msg).toContain('event: update');
    expect(msg).toContain('retry: 3000');
    expect(msg).toContain('data: x');
  });
});

describe('SignalingServer', () => {
  it('joins room and broadcasts join message', () => {
    const ss = new SignalingServer();
    const msgsA: any[] = [];
    const msgsB: any[] = [];
    ss.join('r1', 'a', m => msgsA.push(m));
    ss.join('r1', 'b', m => msgsB.push(m));
    expect(msgsA.some(m => m.type === 'join' && (m.payload as any).peers.includes('b'))).toBe(true);
    expect(msgsB.some(m => m.type === 'join')).toBe(false);
  });

  it('relays message to target peer', () => {
    const ss = new SignalingServer();
    const inbox: any[] = [];
    ss.join('r1', 'a', () => {});
    ss.join('r1', 'b', m => inbox.push(m));
    ss.relay({ type: 'offer', from: 'a', to: 'b', payload: {}, timestamp: 0 });
    expect(inbox.length).toBe(1);
    expect(inbox[0].type).toBe('offer');
  });
});

describe('WebRTCConnection', () => {
  it('creates offer and transitions state', async () => {
    const conn = new WebRTCConnection('p1', 'p2');
    const offer = await conn.createOffer();
    expect(offer.type).toBe('offer');
    expect(conn.getState()).toBe('connecting');
  });

  it('creates answer and connects', async () => {
    const conn = new WebRTCConnection('p1', 'p2');
    const answer = await conn.createAnswer({ type: 'offer', sdp: 'v=0' });
    expect(answer.type).toBe('answer');
    expect(conn.getState()).toBe('connected');
  });
});

describe('CollaborativeWhiteboard', () => {
  it('draws and broadcasts to peers', () => {
    const board = new CollaborativeWhiteboard();
    const seen: any[] = [];
    board.join('u1', a => seen.push(a));
    board.join('u2', a => seen.push(a));
    board.draw({ type: 'draw', x: 1, y: 2, peerId: 'u1', timestamp: 0 });
    expect(board.getActionCount()).toBe(1);
    expect(seen.length).toBe(1);
    expect(seen[0].peerId).toBe('u1');
  });
});
