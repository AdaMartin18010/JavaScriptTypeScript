import { describe, it, expect } from 'vitest';
import { teleportState } from './quantum-teleportation.js';
import { ComplexNumber } from './quantum-simulator.js';

describe('Quantum Teleportation', () => {
  it('teleports |0⟩ with fidelity 1', () => {
    const result = teleportState(ComplexNumber.one(), ComplexNumber.zero());
    expect(result.fidelity).toBeCloseTo(1, 10);
  });

  it('teleports |1⟩ with fidelity 1', () => {
    const result = teleportState(ComplexNumber.zero(), ComplexNumber.one());
    expect(result.fidelity).toBeCloseTo(1, 10);
  });

  it('teleports |+⟩ with fidelity 1', () => {
    const s = 1 / Math.sqrt(2);
    const result = teleportState(new ComplexNumber(s, 0), new ComplexNumber(s, 0));
    expect(result.fidelity).toBeCloseTo(1, 10);
  });

  it('teleports arbitrary state with fidelity 1', () => {
    const alpha = new ComplexNumber(0.6, 0.1);
    const beta = new ComplexNumber(Math.sqrt(1 - 0.36 - 0.01), 0);
    const result = teleportState(alpha, beta);
    expect(result.fidelity).toBeCloseTo(1, 10);
  });
});
