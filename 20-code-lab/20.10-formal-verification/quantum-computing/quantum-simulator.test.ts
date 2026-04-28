import { describe, it, expect } from 'vitest';
import { ComplexNumber, StateVector, QuantumCircuitV2, BB84Protocol } from './quantum-simulator.js';

describe('ComplexNumber', () => {
  it('adds correctly', () => {
    const a = new ComplexNumber(1, 2);
    const b = new ComplexNumber(3, -1);
    const c = a.add(b);
    expect(c.real).toBeCloseTo(4);
    expect(c.imag).toBeCloseTo(1);
  });

  it('multiplies correctly', () => {
    const a = new ComplexNumber(1, 2);
    const b = new ComplexNumber(3, -1);
    const c = a.multiply(b);
    expect(c.real).toBeCloseTo(5);
    expect(c.imag).toBeCloseTo(5);
  });

  it('computes magnitude', () => {
    const a = new ComplexNumber(3, 4);
    expect(a.magnitude()).toBeCloseTo(5);
  });

  it('conjugate works', () => {
    const a = new ComplexNumber(2, -3);
    const c = a.conjugate();
    expect(c.real).toBeCloseTo(2);
    expect(c.imag).toBeCloseTo(3);
  });
});

describe('StateVector', () => {
  it('initializes to |0...0⟩', () => {
    const sv = new StateVector(2);
    expect(sv.amplitudes[0].real).toBeCloseTo(1);
    expect(sv.amplitudes[1].real).toBeCloseTo(0);
    expect(sv.amplitudes[2].real).toBeCloseTo(0);
    expect(sv.amplitudes[3].real).toBeCloseTo(0);
  });

  it('tensor product works', () => {
    const a = new StateVector(1, 1); // |1⟩
    const b = new StateVector(1, 0); // |0⟩
    const c = a.tensorProduct(b);
    expect(c.size).toBe(4);
    expect(c.amplitudes[2].real).toBeCloseTo(1); // |10⟩ = index 2
  });

  it('measure collapses and normalizes', () => {
    const sv = new StateVector(1);
    sv.amplitudes[0] = new ComplexNumber(1 / Math.sqrt(2), 0);
    sv.amplitudes[1] = new ComplexNumber(1 / Math.sqrt(2), 0);
    sv.measure(0);
    const probs = sv.getProbabilities();
    expect(probs[0] + probs[1]).toBeCloseTo(1);
    expect(probs[0] === 1 || probs[1] === 1).toBe(true);
  });
});

describe('QuantumCircuitV2', () => {
  it('creates Bell state', () => {
    const circuit = new QuantumCircuitV2(2);
    circuit.h(0).cnot(0, 1);
    const probs = circuit.getProbabilities();
    expect(probs[0]).toBeCloseTo(0.5); // |00⟩
    expect(probs[3]).toBeCloseTo(0.5); // |11⟩
    expect(probs[1]).toBeCloseTo(0);
    expect(probs[2]).toBeCloseTo(0);
  });

  it('creates GHZ state', () => {
    const circuit = new QuantumCircuitV2(3);
    circuit.h(0).cnot(0, 1).cnot(0, 2);
    const probs = circuit.getProbabilities();
    expect(probs[0]).toBeCloseTo(0.5); // |000⟩
    expect(probs[7]).toBeCloseTo(0.5); // |111⟩
    for (let i = 1; i < 7; i++) {
      expect(probs[i]).toBeCloseTo(0);
    }
  });

  it('Bell state measurement statistics', () => {
    const runs = 1000;
    const counts = { '00': 0, '01': 0, '10': 0, '11': 0 };
    for (let i = 0; i < runs; i++) {
      const c = new QuantumCircuitV2(2);
      c.h(0).cnot(0, 1);
      const result = c.measureAll().toString(2).padStart(2, '0') as keyof typeof counts;
      counts[result]++;
    }
    expect(counts['00'] / runs).toBeCloseTo(0.5, 1);
    expect(counts['11'] / runs).toBeCloseTo(0.5, 1);
    expect(counts['01'] / runs).toBeCloseTo(0, 1);
    expect(counts['10'] / runs).toBeCloseTo(0, 1);
  });

  it('SWAP gate exchanges qubits', () => {
    const circuit = new QuantumCircuitV2(2);
    circuit.x(0).swap(0, 1);
    const probs = circuit.getProbabilities();
    expect(probs[2]).toBeCloseTo(1); // |10⟩
  });

  it('Toffoli gate flips target when both controls are 1', () => {
    const circuit = new QuantumCircuitV2(3);
    circuit.x(0).x(1).toffoli(0, 1, 2);
    const probs = circuit.getProbabilities();
    expect(probs[7]).toBeCloseTo(1); // |111⟩
  });
});

describe('BB84Protocol', () => {
  it('generates keys with low error rate', () => {
    const protocol = new BB84Protocol();
    const result = protocol.generateKey(1000);
    expect(result.alice.length).toBeGreaterThan(0);
    expect(result.errorRate).toBeLessThan(0.1);
  });
});
