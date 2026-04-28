import { describe, it, expect } from 'vitest';
import { runBitFlipCode } from './quantum-error-correction.js';
import { ComplexNumber } from './quantum-simulator.js';

describe('Quantum Error Correction', () => {
  it('corrects error on qubit 0', () => {
    const alpha = new ComplexNumber(Math.sqrt(0.3), 0);
    const beta = new ComplexNumber(Math.sqrt(0.7), 0);
    const result = runBitFlipCode(alpha, beta, 0);
    expect(result.fidelity).toBeCloseTo(1, 10);
    expect(result.corrected).toBe(true);
  });

  it('corrects error on qubit 1', () => {
    const alpha = new ComplexNumber(1 / Math.sqrt(2), 0.2);
    const beta = new ComplexNumber(Math.sqrt(1 - 0.5 - 0.04), 0);
    const result = runBitFlipCode(alpha, beta, 1);
    expect(result.fidelity).toBeCloseTo(1, 10);
    expect(result.corrected).toBe(true);
  });

  it('corrects error on qubit 2', () => {
    const alpha = new ComplexNumber(0.6, 0);
    const beta = new ComplexNumber(0.8, 0);
    const result = runBitFlipCode(alpha, beta, 2);
    expect(result.fidelity).toBeCloseTo(1, 10);
    expect(result.corrected).toBe(true);
  });
});
