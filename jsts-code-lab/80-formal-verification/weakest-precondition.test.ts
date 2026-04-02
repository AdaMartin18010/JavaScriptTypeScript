import { describe, it, expect } from 'vitest';
import { WPCalculator, StmtBuilder, type State } from './weakest-precondition.js';

describe('weakest-precondition', () => {
  const wp = new WPCalculator();

  describe('assignment', () => {
    it('wp(x := x+1, x > 5) should require x > 4', () => {
      const stmt = StmtBuilder.assign('x', s => s['x'] + 1);
      const post = (s: State) => s['x'] > 5;
      const result = wp.compute(stmt, post);

      expect(result.predicate({ x: 5 })).toBe(true);
      expect(result.predicate({ x: 4 })).toBe(false);
      expect(result.predicate({ x: 3 })).toBe(false);
      expect(result.verification.passed).toBe(true);
    });
  });

  describe('sequence', () => {
    it('wp(x := x+1; y := x*2, y > 10) should require x > 4', () => {
      const stmt = StmtBuilder.seq(
        StmtBuilder.assign('x', s => s['x'] + 1),
        StmtBuilder.assign('y', s => s['x'] * 2)
      );
      const post = (s: State) => s['y'] > 10;
      const result = wp.compute(stmt, post);

      expect(result.predicate({ x: 5 })).toBe(true);  // x=6, y=12
      expect(result.predicate({ x: 4 })).toBe(false); // x=5, y=10
      expect(result.predicate({ x: 3 })).toBe(false);
    });
  });

  describe('conditional', () => {
    it('wp(if x>0 then y:=x else y:=-x, y>0) should hold for x != 0', () => {
      const stmt = StmtBuilder.ifStmt(
        s => s['x'] > 0,
        StmtBuilder.assign('y', s => s['x']),
        StmtBuilder.assign('y', s => -s['x'])
      );
      const post = (s: State) => s['y'] > 0;
      const result = wp.compute(stmt, post);

      expect(result.predicate({ x: 5 })).toBe(true);
      expect(result.predicate({ x: -3 })).toBe(true);
      expect(result.predicate({ x: 0 })).toBe(false);
    });
  });

  describe('while loop (invariant approximation)', () => {
    it('should return invariant as wp predicate', () => {
      const body = StmtBuilder.seq(
        StmtBuilder.assign('i', s => s['i'] + 1),
        StmtBuilder.assign('sum', s => s['sum'] + s['i'])
      );
      const stmt = StmtBuilder.whileLoop(
        s => s['i'] < s['n'],
        s => s['sum'] === (s['i'] * (s['i'] + 1)) / 2,
        body
      );
      const post = (s: State) => s['sum'] === (s['n'] * (s['n'] + 1)) / 2;
      const result = wp.compute(stmt, post);

      expect(result.predicate({ i: 0, n: 5, sum: 0 })).toBe(true);
      expect(result.description).toContain('wp');
    });
  });
});
