/**
 * @file small-step.ts
 * @category Formal Semantics → Operational
 * @difficulty hard
 * @theoretical_basis Small-step operational semantics
 */

export type Expr =
  | { kind: 'num'; value: number }
  | { kind: 'var'; name: string }
  | { kind: 'add'; left: Expr; right: Expr }
  | { kind: 'seq'; first: Expr; second: Expr }
  | { kind: 'assign'; name: string; expr: Expr }

export type Store = Map<string, number>
export interface Config { kind: 'config'; expr: Expr; store: Store }

export function isValue(e: Expr): boolean {
  return e.kind === 'num'
}

export function step(config: Config): Config | { kind: 'val'; value: number; store: Store } {
  const { expr, store } = config;

  switch (expr.kind) {
    case 'num':
      return { kind: 'val', value: expr.value, store };
    case 'var': {
      const v = store.get(expr.name);
      if (v === undefined) throw new Error(`Unbound variable: ${expr.name}`);
      return { kind: 'val', value: v, store };
    }
    case 'add': {
      if (!isValue(expr.left)) {
        const next = step({ kind: 'config', expr: expr.left, store });
        if (next.kind === 'val') return step({ kind: 'config', expr: { kind: 'add', left: { kind: 'num', value: next.value }, right: expr.right }, store: next.store });
        return { kind: 'config', expr: { kind: 'add', left: next.expr, right: expr.right }, store: next.store };
      }
      if (!isValue(expr.right)) {
        const next = step({ kind: 'config', expr: expr.right, store });
        if (next.kind === 'val') return step({ kind: 'config', expr: { kind: 'add', left: expr.left, right: { kind: 'num', value: next.value } }, store: next.store });
        return { kind: 'config', expr: { kind: 'add', left: expr.left, right: next.expr }, store: next.store };
      }
      return { kind: 'val', value: (expr.left as { kind: 'num'; value: number }).value + (expr.right as { kind: 'num'; value: number }).value, store };
    }
    case 'assign': {
      if (!isValue(expr.expr)) {
        const next = step({ kind: 'config', expr: expr.expr, store });
        if (next.kind === 'val') {
          const newStore = new Map(next.store);
          newStore.set(expr.name, next.value);
          return { kind: 'val', value: next.value, store: newStore };
        }
        return { kind: 'config', expr: { kind: 'assign', name: expr.name, expr: next.expr }, store: next.store };
      }
      const newStore = new Map(store);
      newStore.set(expr.name, (expr.expr as { kind: 'num'; value: number }).value);
      return { kind: 'val', value: (expr.expr as { kind: 'num'; value: number }).value, store: newStore };
    }
    case 'seq': {
      if (!isValue(expr.first)) {
        const next = step({ kind: 'config', expr: expr.first, store });
        if (next.kind === 'val') return step({ kind: 'config', expr: expr.second, store: next.store });
        return { kind: 'config', expr: { kind: 'seq', first: next.expr, second: expr.second }, store: next.store };
      }
      return step({ kind: 'config', expr: expr.second, store });
    }
  }
}

export function evalSmallStep(expr: Expr, store: Store = new Map()): { value: number; store: Store } {
  let config: Config | { kind: 'val'; value: number; store: Store } = { kind: 'config', expr, store };
  let steps = 0;
  const MAX_STEPS = 1000;
  while (config.kind !== 'val' && steps < MAX_STEPS) {
    config = step(config);
    steps++;
  }
  if (config.kind !== 'val') throw new Error('Evaluation did not terminate');
  return { value: config.value, store: config.store };
}
