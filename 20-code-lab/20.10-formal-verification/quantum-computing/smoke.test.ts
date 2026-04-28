import { describe, it, expect } from 'vitest';
import * as QuantumComputing from './index';

describe('77-quantum-computing smoke test', () => {
  it('should export quantum computing primitives', () => {
    expect(QuantumComputing.ComplexNumber).toBeDefined();
    expect(QuantumComputing.StateVector).toBeDefined();
    expect(QuantumComputing.QuantumCircuitV2).toBeDefined();
    expect(QuantumComputing.Gates).toBeDefined();
  });

  it('should export algorithm demos', () => {
    expect(typeof QuantumComputing.demoStateVector).toBe('function');
    expect(typeof QuantumComputing.demoQuantumSimulator).toBe('function');
    expect(typeof QuantumComputing.demoQuantumGates).toBe('function');
  });
});
