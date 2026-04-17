import { describe, it, expect } from 'vitest';
import { runVQE } from './variational-quantum-eigensolver.js';

describe('Variational Quantum Eigensolver', () => {
  it('converges close to exact ground state energy for H = Z + 0.5 X', () => {
    const result = runVQE(0.5, Math.PI / 4);
    const exact = -Math.sqrt(1 + 0.5 * 0.5);
    expect(result.estimatedGroundEnergy).toBeLessThan(-0.95);
    expect(Math.abs(result.estimatedGroundEnergy - exact)).toBeLessThan(0.2);
  });

  it('energy history shows downward trend', () => {
    const result = runVQE(0.5, Math.PI / 4);
    const first = result.history[0];
    const last = result.history[result.history.length - 1];
    expect(last).toBeLessThanOrEqual(first + 0.1);
  });
});
