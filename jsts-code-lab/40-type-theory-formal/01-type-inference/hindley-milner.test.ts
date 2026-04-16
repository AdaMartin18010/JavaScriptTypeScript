import { describe, it, expect } from 'vitest'
import { freshVar, hmbase, hmarrow, unify, applySubst, typeToString } from './hindley-milner.js'

describe('hindley-milner', () => {
  it('unifies identical base types', () => {
    const subst = unify(hmbase('int'), hmbase('int'));
    expect(subst.size).toBe(0);
  });

  it('unifies variable with type', () => {
    const v = freshVar();
    const subst = unify(v, hmbase('int'));
    expect(typeToString(applySubst(v, subst))).toBe('int');
  });

  it('unifies arrow types', () => {
    const a = freshVar();
    const b = freshVar();
    const arrow1 = hmarrow(a, b);
    const arrow2 = hmarrow(hmbase('int'), hmbase('bool'));
    const subst = unify(arrow1, arrow2);
    expect(typeToString(applySubst(a, subst))).toBe('int');
    expect(typeToString(applySubst(b, subst))).toBe('bool');
  });

  it('throws on mismatch', () => {
    expect(() => unify(hmbase('int'), hmbase('bool'))).toThrow();
  });
})
