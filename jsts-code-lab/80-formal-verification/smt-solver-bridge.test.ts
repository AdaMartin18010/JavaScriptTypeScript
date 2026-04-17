import { describe, it, expect } from 'vitest';
import { SMTSolverBridge, SMTIntExpr, SMTBoolExpr } from './smt-solver-bridge.js';

describe('SMTSolverBridge', () => {
  it('should solve simple integer constraints', () => {
    const solver = new SMTSolverBridge();
    solver.declareConst('x', 'Int');
    solver.declareConst('y', 'Int');
    solver.assert(new SMTIntExpr('x', '>=', 1));
    solver.assert(new SMTIntExpr('y', '>=', 1));
    solver.assert(new SMTIntExpr('x', '=', 2));
    solver.assert(new SMTIntExpr('y', '=', 3));

    const result = solver.checkSat(5);
    expect(result.sat).toBe(true);
    expect(result.model).toBeDefined();
    expect(result.model!.get('x')).toBe(2);
    expect(result.model!.get('y')).toBe(3);
  });

  it('should return unsat for conflicting constraints', () => {
    const solver = new SMTSolverBridge();
    solver.declareConst('x', 'Int');
    solver.assert(new SMTIntExpr('x', '>', 10));
    const result = solver.checkSat(5);
    expect(result.sat).toBe(false);
  });

  it('should support push/pop scopes', () => {
    const solver = new SMTSolverBridge();
    solver.declareConst('x', 'Int');
    solver.assert(new SMTIntExpr('x', '>=', 1));

    solver.push();
    solver.assert(new SMTIntExpr('x', '=', 5));
    expect(solver.checkSat(5).sat).toBe(true);

    solver.pop();
    solver.assert(new SMTIntExpr('x', '=', 3));
    expect(solver.checkSat(5).sat).toBe(true);
  });

  it('should solve boolean constraints', () => {
    const solver = new SMTSolverBridge();
    solver.declareConst('p', 'Bool');
    solver.declareConst('q', 'Bool');
    solver.assert(new SMTBoolExpr('p', 'and', 'q'));
    solver.assert(new SMTBoolExpr('p', '=>', true));

    const result = solver.checkSat(0);
    expect(result.sat).toBe(true);
    expect(result.model!.get('p')).toBe(true);
    expect(result.model!.get('q')).toBe(true);
  });

  it('should list assertions', () => {
    const solver = new SMTSolverBridge();
    solver.declareConst('x', 'Int');
    solver.assert(new SMTIntExpr('x', '>=', 1));
    expect(solver.getAssertions().length).toBe(1);
  });
});
