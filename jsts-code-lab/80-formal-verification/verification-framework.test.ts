import { describe, it, expect } from 'vitest';
import {
  InvariantChecker,
  ModelChecker,
  ContractEnforcer,
  verify,
  assume
} from './verification-framework.js';
import type { StateMachine } from './verification-framework.js';

describe('verification-framework', () => {
  describe('InvariantChecker', () => {
    it('should pass when all invariants hold', () => {
      const checker = new InvariantChecker<{ x: number }>();
      checker.addInvariant('x-positive', s => s.x > 0);
      expect(checker.check({ x: 5 })).toBe(true);
      expect(checker.getViolations()).toEqual([]);
    });

    it('should fail when an invariant is violated', () => {
      const checker = new InvariantChecker<{ x: number }>();
      checker.addInvariant('x-positive', s => s.x > 0);
      expect(checker.check({ x: -1 })).toBe(false);
      expect(checker.getViolations()).toContain('x-positive');
    });
  });

  describe('ModelChecker', () => {
    type S = 'a' | 'b' | 'c';
    type A = 'next';
    const machine: StateMachine<S, A> = {
      initial: 'a',
      states: ['a', 'b', 'c'],
      actions: ['next'],
      transition: (s, a) => {
        if (a !== 'next') return null;
        if (s === 'a') return 'b';
        if (s === 'b') return 'c';
        return null;
      }
    };

    it('should find reachable state', () => {
      const mc = new ModelChecker(machine);
      const result = mc.checkReachability('c', 5);
      expect(result.reachable).toBe(true);
      expect(result.path).toEqual(['next', 'next']);
    });

    it('should check safety property', () => {
      const mc = new ModelChecker(machine);
      const result = mc.checkSafety(s => s !== ('d' as string), 5);
      expect(result.holds).toBe(true);
    });

    it('should detect safety violation', () => {
      const mc = new ModelChecker(machine);
      const result = mc.checkSafety(s => s !== 'c', 5);
      expect(result.holds).toBe(false);
      expect(result.counterexample).toBeDefined();
    });

    it('should check liveness property', () => {
      const mc = new ModelChecker(machine);
      const result = mc.checkLiveness(s => s === 'b' || s === 'c', 5);
      expect(result.holds).toBe(true);
    });
  });

  describe('ContractEnforcer', () => {
    it('should enforce preconditions and postconditions', () => {
      const enforcer = new ContractEnforcer();
      enforcer.register<number>('double', {
        preconditions: [x => x >= 0],
        postconditions: [(x, r) => (r as number) === (x as number) * 2]
      });

      const result = enforcer.enforce('double', (x: number) => x * 2, 4);
      expect(result).toBe(8);
    });

    it('should throw on precondition violation', () => {
      const enforcer = new ContractEnforcer();
      enforcer.register<number>('double', {
        preconditions: [x => x >= 0],
        postconditions: []
      });

      expect(() => enforcer.enforce('double', (x: number) => x * 2, -1)).toThrow('Precondition');
    });
  });

  describe('verify & assume', () => {
    it('verify should return proved value when predicate holds', () => {
      const proved = verify(10, x => x > 0);
      expect(proved).toBe(10);
    });

    it('verify should return null when predicate fails', () => {
      const proved = verify(-5, x => x > 0);
      expect(proved).toBeNull();
    });

    it('assume should throw when condition is false', () => {
      expect(() => assume(false, 'test')).toThrow('Assumption failed');
    });

    it('assume should not throw when condition is true', () => {
      expect(() => assume(true, 'test')).not.toThrow();
    });
  });
});
