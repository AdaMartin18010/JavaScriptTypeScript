import { describe, it, expect } from 'vitest'
import { num, var_, add, assign, seq, evalSmallStep } from './small-step'

function numExpr(v: number) { return { kind: 'num' as const, value: v }; }
function varExpr(n: string) { return { kind: 'var' as const, name: n }; }
function addExpr(l: ReturnType<typeof numExpr>, r: ReturnType<typeof numExpr>) { return { kind: 'add' as const, left: l, right: r }; }
function assignExpr(n: string, e: ReturnType<typeof numExpr>) { return { kind: 'assign' as const, name: n, expr: e }; }
function seqExpr(a: ReturnType<typeof numExpr>, b: ReturnType<typeof numExpr>) { return { kind: 'seq' as const, first: a, second: b }; }

describe('small-step', () => {
  it('evaluates addition', () => {
    const result = evalSmallStep(addExpr(numExpr(2), numExpr(3)));
    expect(result.value).toBe(5);
  });

  it('evaluates assignment', () => {
    const result = evalSmallStep(assignExpr('x', numExpr(42)));
    expect(result.value).toBe(42);
    expect(result.store.get('x')).toBe(42);
  });

  it('evaluates sequence', () => {
    const result = evalSmallStep(seqExpr(assignExpr('x', numExpr(1)), varExpr('x')));
    expect(result.value).toBe(1);
  });
})
