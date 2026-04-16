import { describe, it, expect } from 'vitest'
import { tbase, tarrow, tvar, tabs, tapp, typeCheck, typeToString } from './simply-typed'

describe('simply-typed', () => {
  it('types identity function', () => {
    const env = new Map<string, ReturnType<typeof tbase>>();
    const id = tabs('x', tbase('A'), tvar('x'));
    const ty = typeCheck(env, id);
    expect(typeToString(ty)).toBe('(A -> A)');
  });

  it('types application', () => {
    const env = new Map<string, ReturnType<typeof tbase>>();
    const id = tabs('x', tbase('A'), tvar('x'));
    const term = tapp(id, tvar('y'));
    env.set('y', tbase('A'));
    const ty = typeCheck(env, term);
    expect(typeToString(ty)).toBe('A');
  });

  it('throws on type mismatch', () => {
    const env = new Map<string, ReturnType<typeof tbase>>();
    const id = tabs('x', tbase('A'), tvar('x'));
    env.set('y', tbase('B'));
    const term = tapp(id, tvar('y'));
    expect(() => typeCheck(env, term)).toThrow('Type mismatch');
  });
})
