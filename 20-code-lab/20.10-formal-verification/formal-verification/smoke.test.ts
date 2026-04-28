import { describe, it, expect } from 'vitest';
import * as FormalVerification from './index';

describe('80-formal-verification smoke test', () => {
  it('should export all verification submodules', () => {
    expect(FormalVerification.VerificationFramework).toBeDefined();
    expect(FormalVerification.HoareLogic).toBeDefined();
    expect(FormalVerification.WeakestPrecondition).toBeDefined();
    expect(FormalVerification.SeparationLogic).toBeDefined();
    expect(FormalVerification.TLAPlusLite).toBeDefined();
    expect(FormalVerification.TLAPlusPatterns).toBeDefined();
    expect(FormalVerification.SMTSolverBridge).toBeDefined();
    expect(FormalVerification.Z3SMTBridge).toBeDefined();
    expect(FormalVerification.TypeSafeStateMachine).toBeDefined();
    expect(FormalVerification.TemporalLogic).toBeDefined();
    expect(FormalVerification.BoundedModelChecking).toBeDefined();
    expect(FormalVerification.RefinementTypes).toBeDefined();
    expect(FormalVerification.SymbolicExecution).toBeDefined();
    expect(FormalVerification.ProgramCorrectnessProofs).toBeDefined();
    expect(FormalVerification.PropertyBasedTesting).toBeDefined();
  });

  it('should have object-type module exports', () => {
    expect(typeof FormalVerification.HoareLogic).toBe('object');
    expect(typeof FormalVerification.SymbolicExecution).toBe('object');
  });
});
