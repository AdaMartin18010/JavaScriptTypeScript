/**
 * @file big-step.ts
 * @category Formal Semantics → Operational
 * @difficulty hard
 * @theoretical_basis Big-step operational semantics
 */

export type BExpr =
  | { kind: 'num'; value: number }
  | { kind: 'var'; name: string }
  | { kind: 'add'; left: BExpr; right: BExpr }
  | { kind: 'seq'; first: BExpr; second: BExpr }
  | { kind: 'assign'; name: string; expr: BExpr }

export type BStore = Map<string, number>

export function evalBigStep(expr: BExpr, store: BStore): { value: number; store: BStore } {
  switch (expr.kind) {
    case 'num':
      return { value: expr.value, store };
    case 'var': {
      const v = store.get(expr.name);
      if (v === undefined) throw new Error(`Unbound variable: ${expr.name}`);
      return { value: v, store };
    }
    case 'add': {
      const left = evalBigStep(expr.left, store);
      const right = evalBigStep(expr.right, left.store);
      return { value: left.value + right.value, store: right.store };
    }
    case 'assign': {
      const inner = evalBigStep(expr.expr, store);
      const newStore = new Map(inner.store);
      newStore.set(expr.name, inner.value);
      return { value: inner.value, store: newStore };
    }
    case 'seq': {
      const first = evalBigStep(expr.first, store);
      return evalBigStep(expr.second, first.store);
    }
  }
}
