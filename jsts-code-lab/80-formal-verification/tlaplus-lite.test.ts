import { describe, it, expect } from 'vitest';
import { TLAPlusLite, type TLAPlusSpec } from './tlaplus-lite.js';

describe('TLAPlusLite', () => {
  interface CounterState {
    value: number;
  }

  const spec: TLAPlusSpec<CounterState> = {
    name: 'Counter',
    variables: ['value'],
    init: s => s.value === 0,
    next: (curr, next) => {
      const diff = Math.abs(next.value - curr.value);
      return diff === 1;
    }
  };

  const checker = new TLAPlusLite(spec);

  it('should generate initial states', () => {
    const initials = checker.generateInitialStates(() => [{ value: 0 }, { value: 1 }]);
    expect(initials).toEqual([{ value: 0 }]);
  });

  it('should check invariant', () => {
    const initialStates = [{ value: 0 }];
    const stepGenerator = (s: CounterState) => [
      { value: s.value + 1 },
      { value: s.value - 1 }
    ];

    const result = checker.checkInvariant(
      initialStates,
      s => s.value >= -2,
      stepGenerator,
      3
    );
    expect(result.holds).toBe(true);
  });

  it('should find invariant violation', () => {
    const initialStates = [{ value: 0 }];
    const stepGenerator = (s: CounterState) => [
      { value: s.value + 1 },
      { value: s.value - 1 }
    ];

    const result = checker.checkInvariant(
      initialStates,
      s => s.value >= 0,
      stepGenerator,
      3
    );
    expect(result.holds).toBe(false);
    expect(result.counterexample).toBeDefined();
  });

  it('should detect deadlock', () => {
    const initialStates = [{ value: 0 }];
    const stepGenerator = () => [];
    const result = checker.checkDeadlock(initialStates, stepGenerator, s => false, 3);
    expect(result.deadlocked).toBe(true);
    expect(result.state).toEqual({ value: 0 });
  });

  it('should not report deadlock for terminal state', () => {
    const initialStates = [{ value: 0 }];
    const stepGenerator = () => [];
    const result = checker.checkDeadlock(initialStates, stepGenerator, s => s.value === 0, 3);
    expect(result.deadlocked).toBe(false);
  });
});
