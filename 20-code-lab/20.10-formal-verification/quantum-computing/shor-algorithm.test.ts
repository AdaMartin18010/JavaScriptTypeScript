import { describe, it, expect } from 'vitest';
import { buildQFTMatrix, applyQFT, estimatePeriod } from './shor-algorithm.js';
import { ComplexNumber, QuantumCircuitV2 } from './quantum-simulator.js';

describe('Shor Algorithm (QFT)', () => {
  it('QFT is unitary', () => {
    const qft = buildQFTMatrix(3);
    const size = qft.length;
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        let sum = ComplexNumber.zero();
        for (let k = 0; k < size; k++) {
          sum = sum.add(qft[k][i].conjugate().multiply(qft[k][j]));
        }
        const expected = i === j ? 1 : 0;
        expect(sum.real).toBeCloseTo(expected, 10);
        expect(sum.imag).toBeCloseTo(0, 10);
      }
    }
  });

  it('QFT followed by inverse QFT yields identity', () => {
    const circuit = new QuantumCircuitV2(3, 5); // |101⟩
    const clone = circuit.cloneState();
    applyQFT(circuit);
    applyQFT(circuit, true);
    for (let i = 0; i < clone.size; i++) {
      expect(circuit.stateVector.amplitudes[i].real).toBeCloseTo(clone.amplitudes[i].real, 10);
      expect(circuit.stateVector.amplitudes[i].imag).toBeCloseTo(clone.amplitudes[i].imag, 10);
    }
  });

  it('estimates period correctly for n=4, r=4', () => {
    // QFT 可能给出周期的约数（如 2），因此允许 2 或 4
    const result = estimatePeriod(4, 4);
    expect([2, 4]).toContain(result.estimatedPeriod);
  });

  it('estimates period correctly for n=4, r=2', () => {
    const result = estimatePeriod(4, 2);
    expect(result.estimatedPeriod).toBe(2);
  });
});
