import { describe, it, expect } from 'vitest';
import { ComplexNumber } from './quantum-simulator.js';
import { Gates } from './quantum-gates.js';

function isUnitary(gate: ComplexNumber[][]): boolean {
  const n = gate.length;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let sum = ComplexNumber.zero();
      for (let k = 0; k < n; k++) {
        sum = sum.add(gate[k][i].conjugate().multiply(gate[k][j]));
      }
      const expected = i === j ? 1 : 0;
      if (Math.abs(sum.real - expected) > 1e-10 || Math.abs(sum.imag) > 1e-10) {
        return false;
      }
    }
  }
  return true;
}

describe('Quantum Gates', () => {
  it('H is unitary', () => expect(isUnitary(Gates.H())).toBe(true));
  it('X is unitary', () => expect(isUnitary(Gates.X())).toBe(true));
  it('Y is unitary', () => expect(isUnitary(Gates.Y())).toBe(true));
  it('Z is unitary', () => expect(isUnitary(Gates.Z())).toBe(true));
  it('S is unitary', () => expect(isUnitary(Gates.S())).toBe(true));
  it('T is unitary', () => expect(isUnitary(Gates.T())).toBe(true));
  it('CNOT is unitary', () => expect(isUnitary(Gates.CNOT())).toBe(true));
  it('CZ is unitary', () => expect(isUnitary(Gates.CZ())).toBe(true));
  it('SWAP is unitary', () => expect(isUnitary(Gates.SWAP())).toBe(true));
  it('Toffoli is unitary', () => expect(isUnitary(Gates.Toffoli())).toBe(true));

  it('Rx(π) ≈ -iX', () => {
    const rx = Gates.Rx(Math.PI);
    expect(rx[0][0].real).toBeCloseTo(0);
    expect(rx[0][0].imag).toBeCloseTo(0);
    expect(rx[0][1].real).toBeCloseTo(0);
    expect(rx[0][1].imag).toBeCloseTo(-1);
    expect(rx[1][0].real).toBeCloseTo(0);
    expect(rx[1][0].imag).toBeCloseTo(-1);
  });

  it('Ry(π) = -iY? No, Ry(π) = [[0,-1],[1,0]]', () => {
    const ry = Gates.Ry(Math.PI);
    expect(ry[0][1].real).toBeCloseTo(-1);
    expect(ry[1][0].real).toBeCloseTo(1);
  });

  it('Rz(0) = I', () => {
    const rz = Gates.Rz(0);
    expect(rz[0][0].real).toBeCloseTo(1);
    expect(rz[1][1].real).toBeCloseTo(1);
  });
});
