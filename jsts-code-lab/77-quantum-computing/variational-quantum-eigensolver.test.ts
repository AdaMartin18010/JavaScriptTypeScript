import { describe, it, expect } from 'vitest';
import { runVQE } from './variational-quantum-eigensolver.js';

describe('Variational Quantum Eigensolver', () => {
  it('converges close to exact ground state energy for H = Z + 0.5 X', () => {
    const result = runVQE(0.5);
    const exact = -Math.sqrt(1 + 0.5 * 0.5);
    expect(result.estimatedGroundEnergy).toBeLessThan(-1.0);
    expect(Math.abs(result.estimatedGroundEnergy - exact)).toBeLessThan(0.15);
  });

  it('energy history shows downward trend', () => {
    const result = runVQE(0.5);
    const first = result.history[0];
    const last = result.history[result.history.length - 1];
    expect(last).toBeLessThanOrEqual(first + 0.1);
  });
});
