import { describe, it, expect } from 'vitest'
import { evalSmallStep, type Expr } from './small-step.js'

function numExpr(v: number): Expr { return { kind: 'num', value: v }; }
function varExpr(n: string): Expr { return { kind: 'var', name: n }; }
function addExpr(l: Expr, r: Expr): Expr { return { kind: 'add', left: l, right: r }; }
function assignExpr(n: string, e: Expr): Expr { return { kind: 'assign', name: n, expr: e }; }
function seqExpr(a: Expr, b: Expr): Expr { return { kind: 'seq', first: a, second: b }; }

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
