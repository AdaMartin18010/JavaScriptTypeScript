import { describe, it, expect } from 'vitest';
import { QuantumCircuitV2, ComplexNumber } from './quantum-simulator.js';
import { runDeutschJozsa } from './deutsch-jozsa.js';
import { runGroverSearch } from './grover-search.js';
import { teleportState } from './quantum-teleportation.js';
import { runBitFlipCode } from './quantum-error-correction.js';

describe('Quantum Computing Integration', () => {
  it('Bell state measurement statistics', () => {
    const runs = 2000;
    let count00 = 0;
    let count11 = 0;
    let count01 = 0;
    let count10 = 0;
    for (let i = 0; i < runs; i++) {
      const c = new QuantumCircuitV2(2);
      c.h(0).cnot(0, 1);
      const result = c.measureAll().toString(2).padStart(2, '0');
      if (result === '00') count00++;
      else if (result === '11') count11++;
      else if (result === '01') count01++;
      else if (result === '10') count10++;
    }
    expect(count00 / runs).toBeCloseTo(0.5, 1);
    expect(count11 / runs).toBeCloseTo(0.5, 1);
    expect(count01 / runs).toBeCloseTo(0, 2);
    expect(count10 / runs).toBeCloseTo(0, 2);
  });

  it('GHZ state verification', () => {
    const c = new QuantumCircuitV2(3);
    c.h(0).cnot(0, 1).cnot(0, 2);
    const probs = c.getProbabilities();
    expect(probs[0]).toBeCloseTo(0.5);
    expect(probs[7]).toBeCloseTo(0.5);
    for (let i = 1; i < 7; i++) {
      expect(probs[i]).toBeCloseTo(0, 10);
    }
  });

  it('Deutsch-Jozsa distinguishes constant and balanced', () => {
    expect(runDeutschJozsa(3, () => 0)).toBe('constant');
    expect(runDeutschJozsa(3, () => 1)).toBe('constant');
    expect(runDeutschJozsa(3, (x) => (x & 1) as 0 | 1)).toBe('balanced');
  });

  it('Grover search hits target with high probability', () => {
    let successes = 0;
    for (let i = 0; i < 100; i++) {
      const result = runGroverSearch(3, 5);
      if (result.success) successes++;
    }
    expect(successes / 100).toBeGreaterThan(0.9);
  });

  it('Quantum teleportation fidelity is 1', () => {
    const a = new ComplexNumber(Math.sqrt(0.3), Math.sqrt(0.2));
    const b = new ComplexNumber(Math.sqrt(0.4), Math.sqrt(0.1));
    const res = teleportState(a, b);
    expect(res.fidelity).toBeCloseTo(1, 10);
  });

  it('Quantum error correction restores state', () => {
    const alpha = new ComplexNumber(1 / Math.sqrt(2), 0);
    const beta = new ComplexNumber(0, 1 / Math.sqrt(2));
    const result = runBitFlipCode(alpha, beta, 1);
    expect(result.fidelity).toBeCloseTo(1, 10);
  });
});
