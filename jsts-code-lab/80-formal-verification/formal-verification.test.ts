import { describe, it, expect } from 'vitest';
import * as fv from './index.js';

describe('Formal Verification Index', () => {
  it('should export all modules', () => {
    expect(fv.VerificationFramework).toBeDefined();
    expect(fv.HoareLogic).toBeDefined();
    expect(fv.WeakestPrecondition).toBeDefined();
    expect(fv.SeparationLogic).toBeDefined();
    expect(fv.TLAPlusLite).toBeDefined();
    expect(fv.TLAPlusPatterns).toBeDefined();
    expect(fv.SMTSolverBridge).toBeDefined();
    expect(fv.Z3SMTBridge).toBeDefined();
    expect(fv.TypeSafeStateMachine).toBeDefined();
    expect(fv.TypeSafeStateMachineLegacy).toBeDefined();
    expect(fv.TemporalLogic).toBeDefined();
    expect(fv.BoundedModelChecking).toBeDefined();
    expect(fv.RefinementTypes).toBeDefined();
    expect(fv.SymbolicExecution).toBeDefined();
    expect(fv.ProgramCorrectnessProofs).toBeDefined();
  });

  it('should run demo functions without throwing', () => {
    expect(() => { fv.VerificationFramework.demo(); }).not.toThrow();
    expect(() => { fv.HoareLogic.demo(); }).not.toThrow();
    expect(() => { fv.WeakestPrecondition.demo(); }).not.toThrow();
    expect(() => { fv.SeparationLogic.demo(); }).not.toThrow();
    expect(() => { fv.TLAPlusLite.demo(); }).not.toThrow();
    expect(() => { fv.TLAPlusPatterns.demo(); }).not.toThrow();
    expect(() => { fv.SMTSolverBridge.demo(); }).not.toThrow();
    expect(() => { fv.Z3SMTBridge.demo(); }).not.toThrow();
    expect(() => { fv.TypeSafeStateMachine.demo(); }).not.toThrow();
    expect(() => { fv.TypeSafeStateMachineLegacy.demo(); }).not.toThrow();
    expect(() => { fv.TemporalLogic.demo(); }).not.toThrow();
    expect(() => { fv.BoundedModelChecking.demo(); }).not.toThrow();
    expect(() => { fv.RefinementTypes.demo(); }).not.toThrow();
    expect(() => { fv.SymbolicExecution.demo(); }).not.toThrow();
    expect(() => { fv.ProgramCorrectnessProofs.demo(); }).not.toThrow();
  });
});
