import { describe, it, expect } from 'vitest';
import {
  symConst,
  symVar,
  symAdd,
  symSub,
  symMul,
  solveConstraints,
  SymbolicExecutionEngine
} from './symbolic-execution.js';

describe('SymbolicExecution', () => {
  it('should evaluate symbolic expressions', () => {
    const expr = symAdd(symConst(2), symMul(symVar('x'), symConst(3)));
    const assignment = new Map([['x', 4]]);
    // We don't export evaluateSymbolic, but we can test via solveConstraints
    const constraint = { type: 'eq' as const, left: expr, right: symConst(14) };
    const model = solveConstraints([constraint], ['x'], 10);
    expect(model).not.toBeNull();
    expect(model!.get('x')).toBe(4);
  });

  it('should solve multiple constraints', () => {
    const c1 = { type: 'eq' as const, left: symVar('x'), right: symConst(2) };
    const c2 = { type: 'eq' as const, left: symVar('y'), right: symConst(3) };
    const model = solveConstraints([c1, c2], ['x', 'y'], 5);
    expect(model).not.toBeNull();
    expect(model!.get('x')).toBe(2);
    expect(model!.get('y')).toBe(3);
  });

  it('should return null for unsatisfiable constraints', () => {
    const c1 = { type: 'eq' as const, left: symVar('x'), right: symConst(2) };
    const c2 = { type: 'eq' as const, left: symVar('x'), right: symConst(3) };
    const model = solveConstraints([c1, c2], ['x'], 5);
    expect(model).toBeNull();
  });

  it('should explore branches with engine', () => {
    const initialState = {
      variables: new Map([['x', symVar('input_x')]]),
      pathConstraint: []
    };
    const engine = new SymbolicExecutionEngine(initialState);
    const state1 = engine.assign(initialState, 'y', symAdd(symVar('x'), symConst(5)));
    const branches = engine.branch(state1, { type: 'gt' as const, left: symVar('y'), right: symConst(10) });

    expect(branches.trueBranch.pathConstraint.length).toBe(1);
    expect(branches.falseBranch.pathConstraint.length).toBe(1);
  });
});
