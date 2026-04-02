import { describe, it, expect } from 'vitest';
import { SMTProblem, SMT, generateArraySortProblem, generateSchedulingProblem } from './z3-smt-bridge.js';

describe('z3-smt-bridge', () => {
  describe('SMT expressions', () => {
    it('should format constant correctly', () => {
      expect(SMT.const(42).toSMTLIB()).toBe('42');
      expect(SMT.const(true).toSMTLIB()).toBe('true');
    });

    it('should format variable reference correctly', () => {
      expect(SMT.var('x').toSMTLIB()).toBe('x');
    });

    it('should format arithmetic operations', () => {
      expect(SMT.add(SMT.var('x'), SMT.const(1)).toSMTLIB()).toBe('(+ x 1)');
      expect(SMT.sub(SMT.var('x'), SMT.var('y')).toSMTLIB()).toBe('(- x y)');
      expect(SMT.mul(SMT.const(2), SMT.var('z')).toSMTLIB()).toBe('(* 2 z)');
    });

    it('should format comparison operations', () => {
      expect(SMT.eq(SMT.var('x'), SMT.const(0)).toSMTLIB()).toBe('(= x 0)');
      expect(SMT.lt(SMT.var('a'), SMT.var('b')).toSMTLIB()).toBe('(< a b)');
      expect(SMT.le(SMT.var('a'), SMT.var('b')).toSMTLIB()).toBe('(<= a b)');
    });

    it('should format logical operations', () => {
      expect(SMT.and(SMT.var('p'), SMT.var('q')).toSMTLIB()).toBe('(and p q)');
      expect(SMT.or(SMT.var('p'), SMT.var('q')).toSMTLIB()).toBe('(or p q)');
      expect(SMT.not(SMT.var('p')).toSMTLIB()).toBe('(not p)');
      expect(SMT.implies(SMT.var('p'), SMT.var('q')).toSMTLIB()).toBe('(=> p q)');
    });

    it('should format distinct', () => {
      expect(SMT.distinct(SMT.var('x'), SMT.var('y'), SMT.var('z')).toSMTLIB()).toBe('(distinct x y z)');
    });
  });

  describe('SMTProblem', () => {
    it('should generate valid SMT-LIB output', () => {
      const problem = new SMTProblem();
      problem.declareInt('x').assert(SMT.ge(SMT.var('x'), SMT.const(0)));
      const output = problem.toSMTLIB();

      expect(output).toContain('(set-logic QF_LIA)');
      expect(output).toContain('(declare-fun x () Int)');
      expect(output).toContain('(assert (>= x 0))');
      expect(output).toContain('(check-sat)');
      expect(output).toContain('(get-model)');
    });

    it('should track variables and assertions', () => {
      const problem = new SMTProblem();
      problem.declareInt('x').declareBool('p').assert(SMT.var('p'));
      expect(problem.getVariables().length).toBe(2);
      expect(problem.getAssertions().length).toBe(1);
    });
  });

  describe('array sort problem', () => {
    it('should generate sorting constraints', () => {
      const problem = generateArraySortProblem();
      const output = problem.toSMTLIB();
      expect(output).toContain('a0');
      expect(output).toContain('a1');
      expect(output).toContain('a2');
      expect(output).toContain('(<= a0 a1)');
      expect(output).toContain('(<= a1 a2)');
    });
  });

  describe('scheduling problem', () => {
    it('should generate scheduling constraints', () => {
      const problem = generateSchedulingProblem();
      const output = problem.toSMTLIB();
      expect(output).toContain('start1');
      expect(output).toContain('start2');
      expect(output).toContain('onM1_t1');
      expect(output).toContain('onM1_t2');
      expect(output).toContain('(>= start1 0)');
      expect(output).toContain('(or');
    });
  });
});
