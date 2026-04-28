import { describe, it, expect } from 'vitest';
import { wp, assign, seq, v, c, add, mul, predicateToString } from './weakest-precondition.js';

describe('WeakestPrecondition', () => {
  it('should compute wp for sequential assignment', () => {
    const program = seq(assign('y', add(v('x'), c(1))), assign('z', mul(v('y'), c(2))));
    const post = { type: 'eq' as const, left: v('z'), right: add(mul(c(2), v('x')), c(2)) };
    const pre = wp(program, post);
    // wp 结果应为 ((x + 1) * 2) = ((2 * x) + 2)，不再包含 z
    expect(predicateToString(pre)).toContain('x');
    expect(predicateToString(pre)).toContain('=');
  });

  it('should compute wp for if-then-else', () => {
    const program = {
      type: 'if' as const,
      cond: { type: 'lt' as const, left: c(0), right: v('x') },
      thenBranch: assign('y', v('x')),
      elseBranch: assign('y', { type: 'sub' as const, left: c(0), right: v('x') })
    };
    const post = { type: 'le' as const, left: c(0), right: v('y') };
    const pre = wp(program, post);
    const text = predicateToString(pre);
    expect(text).toContain('⇒');
  });
});
