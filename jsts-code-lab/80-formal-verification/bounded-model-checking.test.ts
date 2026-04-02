import { describe, it, expect } from 'vitest';
import { BMCChecker, mutexBMCSystem, buggyMutexBMCSystem } from './bounded-model-checking.js';
import type { BMCState } from './bounded-model-checking.js';

describe('bounded-model-checking', () => {
  describe('safety checking', () => {
    it('should pass safety for correct mutex system', () => {
      const system = mutexBMCSystem();
      const checker = new BMCChecker(system);
      const safety = (s: BMCState) => !(s['p1'] === 'cs' && s['p2'] === 'cs');
      const result = checker.check(safety, 5);
      expect(result.counterexampleFound).toBe(false);
      expect(result.nodesExplored).toBeGreaterThan(0);
    });

    it('should find counterexample in buggy mutex system', () => {
      const system = buggyMutexBMCSystem();
      const checker = new BMCChecker(system);
      const safety = (s: BMCState) => !(s['p1'] === 'cs' && s['p2'] === 'cs');
      const result = checker.check(safety, 5);
      expect(result.counterexampleFound).toBe(true);
      expect(result.counterexample).toBeDefined();
      expect(result.counterexample!.length).toBeGreaterThan(0);
    });
  });

  describe('liveness checking', () => {
    it('should find liveness counterexample without fairness assumption', () => {
      const system = mutexBMCSystem();
      const checker = new BMCChecker(system);
      // Without fairness, there exists a path where p1 never takes a turn
      const liveness = (s: BMCState) => s['p1'] === 'cs';
      const result = checker.checkLiveness(liveness, 8);
      expect(result.counterexampleFound).toBe(true);
      expect(result.counterexample).toBeDefined();
    });

    it('should find pseudo-counterexample with insufficient bound', () => {
      const system = mutexBMCSystem();
      const checker = new BMCChecker(system);
      const liveness = (s: BMCState) => s['p1'] === 'cs';
      const result = checker.checkLiveness(liveness, 2);
      // With bound=2, we may not reach cs, so a pseudo-counterexample may be found
      expect(result.nodesExplored).toBeGreaterThan(0);
    });

    it('should find starvation counterexample in system where p1 never reaches cs', () => {
      // Custom system: p2 always grabs cs, p1 waits forever
      const starvationSystem = {
        initial: { p1: 'wait', p2: 'cs' } as BMCState,
        transitions: [
          (s: BMCState) => (s['p2'] === 'cs' ? { p1: 'wait', p2: 'ncs' } : null),
          (s: BMCState) => (s['p2'] === 'ncs' ? { p1: 'wait', p2: 'cs' } : null)
          // p1 never transitions
        ]
      };
      const checker = new BMCChecker(starvationSystem);
      const liveness = (s: BMCState) => s['p1'] === 'cs';
      const result = checker.checkLiveness(liveness, 5);
      expect(result.counterexampleFound).toBe(true);
      expect(result.counterexample).toBeDefined();
    });
  });

  describe('BMC result properties', () => {
    it('should report path length for counterexamples', () => {
      const system = buggyMutexBMCSystem();
      const checker = new BMCChecker(system);
      const safety = (s: BMCState) => s['p1'] !== 'cs';
      const result = checker.check(safety, 5);
      expect(result.counterexampleFound).toBe(true);
      expect(result.length).toBeDefined();
      expect(result.counterexample!.length).toBeGreaterThan(0);
    });
  });
});
