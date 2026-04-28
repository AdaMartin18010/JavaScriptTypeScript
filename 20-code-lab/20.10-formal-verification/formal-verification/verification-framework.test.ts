import { describe, it, expect } from 'vitest';
import { InvariantChecker, ModelChecker, ContractEnforcer, type StateMachine } from './verification-framework.js';

describe('VerificationFramework', () => {
  it('should check invariants', () => {
    const checker = new InvariantChecker<{ x: number }>();
    checker.addInvariant('positive', s => s.x > 0);
    expect(checker.check({ x: 5 })).toBe(true);
    expect(checker.check({ x: -1 })).toBe(false);
  });

  it('should perform model checking on traffic light', () => {
    const sm: StateMachine<'red' | 'green', 'timer'> = {
      initial: 'red',
      states: ['red', 'green'],
      actions: ['timer'],
      transition: (s, a) => (a === 'timer' ? (s === 'red' ? 'green' : 'red') : null)
    };
    const mc = new ModelChecker(sm);
    expect(mc.checkReachability('green', 5).reachable).toBe(true);
    expect(mc.checkSafety(s => s === 'red' || s === 'green', 5).holds).toBe(true);
  });

  it('should enforce contracts', () => {
    const enforcer = new ContractEnforcer();
    enforcer.register<number>('double', {
      preconditions: [x => x >= 0],
      postconditions: [(x, out) => (out as number) === (x) * 2]
    });
    expect(enforcer.enforce('double', x => x * 2, 5)).toBe(10);
    expect(() => enforcer.enforce('double', x => x * 2, -1)).toThrow();
  });
});
