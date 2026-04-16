/**
 * @file untyped-lambda.ts
 * @category Type Theory → Lambda Calculus
 * @difficulty hard
 * @theoretical_basis Untyped lambda calculus, Church-Rosser theorem
 * @references
 *   1. A. Church. The Calculi of Lambda Conversion. 1941.
 */

export type LambdaTerm = Var | Abs | App;

export interface Var { kind: 'var'; name: string }
export interface Abs { kind: 'abs'; param: string; body: LambdaTerm }
export interface App { kind: 'app'; func: LambdaTerm; arg: LambdaTerm }

export const var_ = (name: string): Var => ({ kind: 'var', name });
export const abs = (param: string, body: LambdaTerm): Abs => ({ kind: 'abs', param, body });
export const app = (func: LambdaTerm, arg: LambdaTerm): App => ({ kind: 'app', func, arg });

function freeVariables(term: LambdaTerm): Set<string> {
  switch (term.kind) {
    case 'var': return new Set([term.name]);
    case 'abs': {
      const inner = freeVariables(term.body);
      inner.delete(term.param);
      return inner;
    }
    case 'app': {
      const left = freeVariables(term.func);
      freeVariables(term.arg).forEach((v) => left.add(v));
      return left;
    }
  }
}

function substitute(term: LambdaTerm, name: string, replacement: LambdaTerm): LambdaTerm {
  switch (term.kind) {
    case 'var':
      return term.name === name ? replacement : term;
    case 'abs':
      if (term.param === name) return term;
      if (freeVariables(replacement).has(term.param)) {
        const fresh = term.param + '_';
        const renamedBody = substitute(term.body, term.param, var_(fresh));
        return abs(fresh, substitute(renamedBody, name, replacement));
      }
      return abs(term.param, substitute(term.body, name, replacement));
    case 'app':
      return app(substitute(term.func, name, replacement), substitute(term.arg, name, replacement));
  }
}

export function betaReduce(term: LambdaTerm): LambdaTerm {
  switch (term.kind) {
    case 'var':
      return term;
    case 'abs':
      return abs(term.param, betaReduce(term.body));
    case 'app': {
      const func = betaReduce(term.func);
      const arg = betaReduce(term.arg);
      if (func.kind === 'abs') {
        return betaReduce(substitute(func.body, func.param, arg));
      }
      return app(func, arg);
    }
  }
}

export function termToString(term: LambdaTerm): string {
  switch (term.kind) {
    case 'var': return term.name;
    case 'abs': return `(λ${term.param}. ${termToString(term.body)})`;
    case 'app': return `(${termToString(term.func)} ${termToString(term.arg)})`;
  }
}
