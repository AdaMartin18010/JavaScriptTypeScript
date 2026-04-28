import { describe, it, expect } from 'vitest';
import { PropertyBasedTesting } from './property-based-testing.js';

describe('PropertyBasedTesting', () => {
  it('should verify commutativity of addition', () => {
    const result = PropertyBasedTesting.forAll(
      PropertyBasedTesting.integer(-100, 100),
      (x) => {
        const y = PropertyBasedTesting.integer(-100, 100)();
        return x + y === y + x;
      },
      500
    );
    expect(result.passed).toBe(true);
  });

  it('should find counterexample for false property', () => {
    const result = PropertyBasedTesting.forAll(
      PropertyBasedTesting.integer(0, 100),
      (x) => x < 50,
      200
    );
    expect(result.passed).toBe(false);
    expect(result.counterexample).toBeDefined();
    expect(result.counterexample as number).toBeGreaterThanOrEqual(50);
  });

  it('should shrink counterexample toward zero', () => {
    const result = PropertyBasedTesting.forAllWithShrink(
      PropertyBasedTesting.integer(-100, 100),
      PropertyBasedTesting.shrinkInt,
      (x) => x < 50,
      200
    );
    expect(result.passed).toBe(false);
    expect(result.counterexample).toBe(50);
  });

  it('should catch exceptions as failures', () => {
    const result = PropertyBasedTesting.forAll(
      PropertyBasedTesting.integer(1, 20),
      (x) => {
        if (x === 10) throw new Error('simulated error');
        return x < 25;
      },
      100
    );
    expect(result.passed).toBe(false);
    expect(result.counterexample).toBe(10);
  });
});
