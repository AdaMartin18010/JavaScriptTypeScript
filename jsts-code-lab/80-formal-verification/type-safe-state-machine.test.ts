import { describe, it, expect } from 'vitest';
import {
  TCPStates,
  tcpReducer,
  activeOpen,
  receiveSynAck,
  closeFromEstablished,
  receiveAck,
  timeout,
  finalTimeout
} from './type-safe-state-machine.js';
import type { TCPState } from './type-safe-state-machine.js';

describe('type-safe-state-machine', () => {
  describe('TCP state transitions', () => {
    it('should transition from CLOSED to SYN_SENT on ACTIVE_OPEN', () => {
      const state = tcpReducer(TCPStates.closed(), { type: 'ACTIVE_OPEN' });
      expect(state.tag).toBe('SYN_SENT');
    });

    it('should transition from SYN_SENT to ESTABLISHED on SYN_ACK', () => {
      let state: TCPState = TCPStates.closed();
      state = tcpReducer(state, { type: 'ACTIVE_OPEN' });
      state = tcpReducer(state, { type: 'SYN_ACK' });
      expect(state.tag).toBe('ESTABLISHED');
    });

    it('should transition from ESTABLISHED to FIN_WAIT_1 on CLOSE', () => {
      let state: TCPState = TCPStates.established();
      state = tcpReducer(state, { type: 'CLOSE' });
      expect(state.tag).toBe('FIN_WAIT_1');
    });

    it('should transition from FIN_WAIT_1 to FIN_WAIT_2 on ACK', () => {
      let state: TCPState = TCPStates.finWait1();
      state = tcpReducer(state, { type: 'ACK' });
      expect(state.tag).toBe('FIN_WAIT_2');
    });

    it('should transition from FIN_WAIT_2 to TIME_WAIT on TIMEOUT', () => {
      let state: TCPState = TCPStates.finWait2();
      state = tcpReducer(state, { type: 'TIMEOUT' });
      expect(state.tag).toBe('TIME_WAIT');
    });

    it('should transition from TIME_WAIT to CLOSED on TIMEOUT', () => {
      let state: TCPState = TCPStates.timeWait();
      state = tcpReducer(state, { type: 'TIMEOUT' });
      expect(state.tag).toBe('CLOSED');
    });
  });

  describe('compile-time type safety (runtime validation of branded types)', () => {
    it('activeOpen should only accept ClosedState', () => {
      const closed = TCPStates.closed();
      const synSent = activeOpen(closed);
      expect(synSent.tag).toBe('SYN_SENT');
    });

    it('receiveSynAck should only accept SynSentState', () => {
      const synSent = TCPStates.synSent();
      const established = receiveSynAck(synSent);
      expect(established.tag).toBe('ESTABLISHED');
    });

    it('closeFromEstablished should only accept EstablishedState', () => {
      const established = TCPStates.established();
      const finWait1 = closeFromEstablished(established);
      expect(finWait1.tag).toBe('FIN_WAIT_1');
    });

    it('receiveAck should only accept FinWait1State', () => {
      const finWait1 = TCPStates.finWait1();
      const finWait2 = receiveAck(finWait1);
      expect(finWait2.tag).toBe('FIN_WAIT_2');
    });

    it('timeout should only accept FinWait2State', () => {
      const finWait2 = TCPStates.finWait2();
      const timeWait = timeout(finWait2);
      expect(timeWait.tag).toBe('TIME_WAIT');
    });

    it('finalTimeout should only accept TimeWaitState', () => {
      const timeWait = TCPStates.timeWait();
      const closed = finalTimeout(timeWait);
      expect(closed.tag).toBe('CLOSED');
    });
  });

  describe('invalid transitions should throw at runtime', () => {
    it('should throw for invalid action in CLOSED', () => {
      expect(() => tcpReducer(TCPStates.closed(), { type: 'CLOSE' })).toThrow('Invalid action');
    });

    it('should throw for invalid action in ESTABLISHED', () => {
      expect(() => tcpReducer(TCPStates.established(), { type: 'TIMEOUT' })).toThrow('Invalid action');
    });
  });
});
