import { describe, it, expect } from 'vitest';
import { SafeTCPStateMachine, transitionTCP, handleEvent } from './type-safe-statemachine.js';

describe('TypeSafeStateMachine', () => {
  it('should transition through TCP states', () => {
    const tcp = new SafeTCPStateMachine();
    expect(tcp.getState().tag).toBe('CLOSED');
    tcp.dispatch({ tag: 'OPEN' });
    expect(tcp.getState().tag).toBe('LISTEN');
    tcp.dispatch({ tag: 'RECV_SYN', srcPort: 8080, destPort: 3000 });
    expect(tcp.getState().tag).toBe('SYN_RECEIVED');
  });

  it('should ignore invalid events', () => {
    const tcp = new SafeTCPStateMachine();
    tcp.dispatch({ tag: 'SEND_FIN', srcPort: 1, destPort: 2, seqNum: 0 });
    expect(tcp.getState().tag).toBe('CLOSED');
  });

  it('should handle events descriptively', () => {
    expect(handleEvent({ tag: 'OPEN' })).toBe('user open');
  });
});
