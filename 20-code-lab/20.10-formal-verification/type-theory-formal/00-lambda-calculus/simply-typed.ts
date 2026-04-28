/**
 * @file simply-typed.ts
 * @category Type Theory → Simple Types
 * @difficulty hard
 * @theoretical_basis Simply typed lambda calculus
 * @references
 *   1. H. P. Barendregt. Lambda Calculi with Types. 1992.
 */

export type Ty = TBase | TArrow;
export interface TBase { kind: 'base'; name: string }
export interface TArrow { kind: 'arrow'; domain: Ty; codomain: Ty }

export const tbase = (name: string): TBase => ({ kind: 'base', name });
export const tarrow = (domain: Ty, codomain: Ty): TArrow => ({ kind: 'arrow', domain, codomain });

export type TypedTerm = TVar | TAbs | TApp;
export interface TVar { kind: 'var'; name: string }
export interface TAbs { kind: 'abs'; param: string; type: Ty; body: TypedTerm }
export interface TApp { kind: 'app'; func: TypedTerm; arg: TypedTerm }

export const tvar = (name: string): TVar => ({ kind: 'var', name });
export const tabs = (param: string, type: Ty, body: TypedTerm): TAbs => ({ kind: 'abs', param, type, body });
export const tapp = (func: TypedTerm, arg: TypedTerm): TApp => ({ kind: 'app', func, arg });

export type Env = Map<string, Ty>;

export function typeCheck(env: Env, term: TypedTerm): Ty {
  switch (term.kind) {
    case 'var': {
      const ty = env.get(term.name);
      if (!ty) throw new Error(`Unbound variable: ${term.name}`);
      return ty;
    }
    case 'abs': {
      const newEnv = new Map(env);
      newEnv.set(term.param, term.type);
      const bodyTy = typeCheck(newEnv, term.body);
      return tarrow(term.type, bodyTy);
    }
    case 'app': {
      const funcTy = typeCheck(env, term.func);
      const argTy = typeCheck(env, term.arg);
      if (funcTy.kind !== 'arrow') {
        throw new Error('Function expected in application');
      }
      if (!typeEqual(funcTy.domain, argTy)) {
        throw new Error('Type mismatch in application');
      }
      return funcTy.codomain;
    }
  }
}

function typeEqual(a: Ty, b: Ty): boolean {
  if (a.kind !== b.kind) return false;
  if (a.kind === 'base' && b.kind === 'base') return a.name === b.name;
  if (a.kind === 'arrow' && b.kind === 'arrow') {
    return typeEqual(a.domain, b.domain) && typeEqual(a.codomain, b.codomain);
  }
  return false;
}

export function typeToString(ty: Ty): string {
  switch (ty.kind) {
    case 'base': return ty.name;
    case 'arrow': return `(${typeToString(ty.domain)} -> ${typeToString(ty.codomain)})`;
  }
}
