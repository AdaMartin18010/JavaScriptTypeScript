import { describe, it, expect } from 'vitest'
import { evalBigStep, type BExpr } from './big-step.js'

function numExpr(v: number) { return { kind: 'num' as const, value: v }; }
function varExpr(n: string) { return { kind: 'var' as const, name: n }; }
function addExpr(l: BExpr, r: BExpr) { return { kind: 'add' as const, left: l, right: r }; }
function assignExpr(n: string, e: BExpr) { return { kind: 'assign' as const, name: n, expr: e }; }
function seqExpr(a: BExpr, b: BExpr) { return { kind: 'seq' as const, first: a, second: b }; }

describe('big-step', () => {
  it('evaluates addition', () => {
    const result = evalBigStep(addExpr(numExpr(2), numExpr(3)), new Map());
    expect(result.value).toBe(5);
  });

  it('evaluates sequence with assignment', () => {
    const result = evalBigStep(seqExpr(assignExpr('x', numExpr(10)), varExpr('x')), new Map());
    expect(result.value).toBe(10);
    expect(result.store.get('x')).toBe(10);
  });
})
