import { describe, it, expect } from 'vitest';
import { HoareVerifier, type Env, type Assertion, type Invariant } from './hoare-logic.js';

describe('hoare-logic', () => {
  const verifier = new HoareVerifier();

  describe('verifyCommand', () => {
    it('should validate swap variables', () => {
      const env: Env = { x: 5, y: 3 };
      const pre: Assertion[] = [
        e => e['x'] !== undefined && e['y'] !== undefined
      ];
      const post: Assertion[] = [
        e => e['x'] === 3 && e['y'] === 5
      ];
      const { env: newEnv, result } = verifier.verifyCommand(env, pre, e => {
        const t = e['x']!;
        return { ...e, x: e['y']!, y: t };
      }, post);

      expect(result.valid).toBe(true);
      expect(newEnv['x']).toBe(3);
      expect(newEnv['y']).toBe(5);
    });

    it('should detect postcondition failure', () => {
      const env: Env = { x: 1 };
      const pre: Assertion[] = [];
      const post: Assertion[] = [e => e['x'] === 99];
      const { result } = verifier.verifyCommand(env, pre, e => e, post);

      expect(result.valid).toBe(false);
      expect(result.violations.length).toBeGreaterThan(0);
    });

    it('should detect precondition failure', () => {
      const env: Env = { x: 1 };
      const pre: Assertion[] = [e => e['x'] === 99];
      const post: Assertion[] = [];
      const { result } = verifier.verifyCommand(env, pre, e => e, post);

      expect(result.valid).toBe(false);
      expect(result.violations.some(v => v.includes('Precondition'))).toBe(true);
    });
  });

  describe('verifyLoop', () => {
    it('should validate sum loop with correct invariants', () => {
      const init: Env = { n: 5, i: 0, sum: 0 };
      const condition = (e: Env) => e['i']! < e['n']!;
      const body = (e: Env) => ({
        ...e,
        i: e['i']! + 1,
        sum: e['sum']! + e['i']! + 1
      });
      const invariants: Invariant[] = [
        { name: 'i-range', check: e => e['i']! >= 0 && e['i']! <= e['n']! },
        { name: 'sum-formula', check: e => e['sum']! === (e['i']! * (e['i']! + 1)) / 2 }
      ];
      const post: Assertion[] = [
        e => e['sum']! === (e['n']! * (e['n']! + 1)) / 2
      ];

      const result = verifier.verifyLoop(init, condition, body, invariants, post);
      expect(result.valid).toBe(true);
    });

    it('should detect invariant violation', () => {
      const init: Env = { n: 3, i: 0, sum: 0 };
      const condition = (e: Env) => e['i']! < e['n']!;
      const body = (e: Env) => ({
        ...e,
        i: e['i']! + 1,
        sum: e['sum']! + e['i']! + 1
      });
      const badInvariants: Invariant[] = [
        { name: 'wrong', check: e => e['sum']! === e['i']! * 100 }
      ];

      const result = verifier.verifyLoop(init, condition, body, badInvariants, []);
      expect(result.valid).toBe(false);
      expect(result.violations.some(v => v.includes('wrong'))).toBe(true);
    });
  });

  describe('verifyAssignment', () => {
    it('should validate simple assignment', () => {
      const env: Env = { x: 0 };
      const post: Assertion[] = [e => e['x'] === 5];
      const { env: newEnv, result } = verifier.verifyAssignment(env, 'x', () => 5, post);
      expect(result.valid).toBe(true);
      expect(newEnv['x']).toBe(5);
    });
  });
});
