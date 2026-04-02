import { describe, it, expect } from 'vitest';
import { LTLModelChecker, LTL, requestResponseFSM } from './temporal-logic.js';

describe('temporal-logic', () => {
  const fsm = requestResponseFSM();

  describe('safety properties', () => {
    it('should verify G(not error) holds', () => {
      const checker = new LTLModelChecker(fsm, 6);
      const formula = LTL.G(LTL.atom(s => s !== 'error'));
      const result = checker.check(formula);
      expect(result.holds).toBe(true);
    });

    it('should detect G(idle) violation', () => {
      const checker = new LTLModelChecker(fsm, 3);
      const formula = LTL.G(LTL.atom(s => s === 'idle'));
      const result = checker.check(formula);
      expect(result.holds).toBe(false);
      expect(result.counterexample).toBeDefined();
    });
  });

  describe('liveness properties', () => {
    it('should verify F(response) holds', () => {
      const checker = new LTLModelChecker(fsm, 6);
      const formula = LTL.F(LTL.atom(s => s === 'response'));
      const result = checker.check(formula);
      expect(result.holds).toBe(true);
    });

    it('should detect F(impossible) violation', () => {
      const checker = new LTLModelChecker(fsm, 4);
      const formula = LTL.F(LTL.atom(s => s === 'nonexistent'));
      const result = checker.check(formula);
      expect(result.holds).toBe(false);
    });
  });

  describe('next operator', () => {
    it('should verify X(request) from idle', () => {
      const checker = new LTLModelChecker(fsm, 3);
      const formula = LTL.X(LTL.atom(s => s === 'request'));
      const result = checker.check(formula);
      expect(result.holds).toBe(true);
    });

    it('should detect X(response) violation from idle', () => {
      const checker = new LTLModelChecker(fsm, 3);
      const formula = LTL.X(LTL.atom(s => s === 'response'));
      const result = checker.check(formula);
      expect(result.holds).toBe(false);
    });
  });

  describe('until operator', () => {
    it('should verify request U processing', () => {
      const checker = new LTLModelChecker(fsm, 7);
      // G(request -> (request U processing))
      const formula = LTL.G(
        LTL.or(
          LTL.atom(s => s !== 'request'),
          LTL.U(LTL.atom(s => s === 'request'), LTL.atom(s => s === 'processing'))
        )
      );
      const result = checker.check(formula);
      expect(result.holds).toBe(true);
    });

    it('should detect invalid until formula', () => {
      // A simple FSM where idle -> request -> processing -> response -> idle
      // Let's test a until that fails: idle U response (idle must hold until response, but request and processing are in between)
      const checker = new LTLModelChecker(fsm, 6);
      const formula = LTL.U(LTL.atom(s => s === 'idle'), LTL.atom(s => s === 'response'));
      const result = checker.check(formula);
      // This should fail because on path idle->request->processing->response, idle does not hold at request/processing
      expect(result.holds).toBe(false);
    });
  });

  describe('boolean combinations', () => {
    it('should support not, and, or', () => {
      const checker = new LTLModelChecker(fsm, 4);
      const formula = LTL.G(
        LTL.and(
          LTL.not(LTL.atom(s => s === 'nonexistent')),
          LTL.or(LTL.atom(s => s === 'idle'), LTL.atom(s => s !== 'idle'))
        )
      );
      const result = checker.check(formula);
      expect(result.holds).toBe(true);
    });
  });
});
