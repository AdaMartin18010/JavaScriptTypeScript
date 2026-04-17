/**
 * @file 形式化验证模块
 * @module Formal Verification
 * @description
 * 形式化验证教学库，涵盖从 Hoare 逻辑、分离逻辑、时序逻辑到
 * 模型检测、SMT 桥接与类型级状态机的完整实践示例。
 */

export * as VerificationFramework from './verification-framework.js';
export * as HoareLogic from './hoare-logic.js';
export * as WeakestPrecondition from './weakest-precondition.js';
export * as SeparationLogic from './separation-logic.js';
export * as TLAPlusLite from './tlaplus-lite.js';
export * as TLAPlusPatterns from './tla-plus-patterns.js';
export * as SMTSolverBridge from './smt-solver-bridge.js';
export * as Z3SMTBridge from './z3-smt-bridge.js';
export * as TypeSafeStateMachine from './type-safe-statemachine.js';
export * as TypeSafeStateMachineLegacy from './type-safe-state-machine.js';
export * as TemporalLogic from './temporal-logic.js';
export * as BoundedModelChecking from './bounded-model-checking.js';
export * as RefinementTypes from './refinement-types.js';
export * as SymbolicExecution from './symbolic-execution.js';
export * as ProgramCorrectnessProofs from './program-correctness-proofs.js';
export * as PropertyBasedTesting from './property-based-testing.js';
