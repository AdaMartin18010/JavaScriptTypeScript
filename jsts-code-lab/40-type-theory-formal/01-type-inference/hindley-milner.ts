/**
 * @file hindley-milner.ts
 * @category Type Theory → Type Inference
 * @difficulty extreme
 * @theoretical_basis Hindley-Milner type inference, unification
 * @references
 *   1. L. Damas, R. Milner. Principal type-schemes for functional programs. POPL 1982.
 */

export type HMType = HMVar | HMBase | HMArrow;
export interface HMVar { kind: 'var'; id: number }
export interface HMBase { kind: 'base'; name: string }
export interface HMArrow { kind: 'arrow'; domain: HMType; codomain: HMType }

let varCounter = 0;
export const freshVar = (): HMVar => ({ kind: 'var', id: varCounter++ });
export const hmbase = (name: string): HMBase => ({ kind: 'base', name });
export const hmarrow = (domain: HMType, codomain: HMType): HMArrow => ({ kind: 'arrow', domain, codomain });

export function occursIn(v: HMVar, t: HMType): boolean {
  if (t.kind === 'var') return t.id === v.id;
  if (t.kind === 'base') return false;
  return occursIn(v, t.domain) || occursIn(v, t.codomain);
}

export function unify(a: HMType, b: HMType, subst: Map<number, HMType> = new Map()): Map<number, HMType> {
  const resolvedA = resolve(a, subst);
  const resolvedB = resolve(b, subst);

  if (resolvedA.kind === 'var') {
    if (resolvedB.kind === 'var' && resolvedA.id === resolvedB.id) return subst;
    if (occursIn(resolvedA, resolvedB)) throw new Error('Occurs check failed');
    subst.set(resolvedA.id, resolvedB);
    return subst;
  }

  if (resolvedB.kind === 'var') {
    if (occursIn(resolvedB, resolvedA)) throw new Error('Occurs check failed');
    subst.set(resolvedB.id, resolvedA);
    return subst;
  }

  if (resolvedA.kind === 'base' && resolvedB.kind === 'base') {
    if (resolvedA.name !== resolvedB.name) throw new Error(`Cannot unify ${resolvedA.name} with ${resolvedB.name}`);
    return subst;
  }

  if (resolvedA.kind === 'arrow' && resolvedB.kind === 'arrow') {
    unify(resolvedA.domain, resolvedB.domain, subst);
    unify(resolvedA.codomain, resolvedB.codomain, subst);
    return subst;
  }

  throw new Error('Cannot unify');
}

function resolve(t: HMType, subst: Map<number, HMType>): HMType {
  if (t.kind !== 'var') return t;
  const s = subst.get(t.id);
  if (!s) return t;
  return resolve(s, subst);
}

export function applySubst(t: HMType, subst: Map<number, HMType>): HMType {
  const r = resolve(t, subst);
  if (r.kind === 'arrow') {
    return hmarrow(applySubst(r.domain, subst), applySubst(r.codomain, subst));
  }
  return r;
}

export function typeToString(t: HMType): string {
  if (t.kind === 'var') return `t${t.id}`;
  if (t.kind === 'base') return t.name;
  return `(${typeToString(t.domain)} -> ${typeToString(t.codomain)})`;
}
