import { describe, it, expect } from 'vitest';
import { SMTSolverBridge, SMTIntExpr } from './smt-solver-bridge.js';

describe('SMTSolverBridge', () => {
  it('should solve integer linear constraints', () => {
    const solver = new SMTSolverBridge();
    solver.declareConst('x', 'Int');
    solver.declareConst('y', 'Int');
    solver.assert(new SMTIntExpr('x', '>=', 1));
    solver.assert(new SMTIntExpr('y', '>=', 1));
    solver.push();
    solver.assert(new SMTIntExpr('x', '=', 2));
    solver.assert(new SMTIntExpr('y', '=', 3));
    const result = solver.checkSat(5);
    expect(result.sat).toBe(true);
    expect(result.model?.get('x')).toBe(2);
    expect(result.model?.get('y')).toBe(3);
  });

  it('should detect unsatisfiable constraints', () => {
    const solver = new SMTSolverBridge();
    solver.declareConst('x', 'Int');
    solver.assert(new SMTIntExpr('x', '>', 10));
    const result = solver.checkSat(5);
    expect(result.sat).toBe(false);
  });
});
