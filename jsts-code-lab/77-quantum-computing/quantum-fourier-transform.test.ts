import { describe, it, expect } from 'vitest';
import { buildQFTMatrix, applyQFT, applyQFTCircuit } from './quantum-fourier-transform.js';
import { QuantumCircuitV2 } from './quantum-simulator.js';
import { ComplexNumber } from './quantum-state-vector.js';

describe('Quantum Fourier Transform', () => {
  it('QFT matrix is unitary for n=3', () => {
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

  it('QFT + IQFT restores original state', () => {
    const circuit = new QuantumCircuitV2(3, 5); // |101⟩
    const clone = circuit.cloneState();
    applyQFT(circuit);
    applyQFT(circuit, true);
    for (let i = 0; i < clone.size; i++) {
      expect(circuit.stateVector.amplitudes[i].real).toBeCloseTo(clone.amplitudes[i].real, 10);
      expect(circuit.stateVector.amplitudes[i].imag).toBeCloseTo(clone.amplitudes[i].imag, 10);
    }
  });

  it('circuit-level QFT + IQFT restores original state', () => {
    const circuit = new QuantumCircuitV2(3, 5); // |101⟩
    const clone = circuit.cloneState();
    applyQFTCircuit(circuit);
    applyQFTCircuit(circuit, true);
    for (let i = 0; i < clone.size; i++) {
      expect(circuit.stateVector.amplitudes[i].real).toBeCloseTo(clone.amplitudes[i].real, 10);
      expect(circuit.stateVector.amplitudes[i].imag).toBeCloseTo(clone.amplitudes[i].imag, 10);
    }
  });
});
