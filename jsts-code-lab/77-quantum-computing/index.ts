/**
 * @file 量子计算模块
 * @module Quantum Computing
 * @description
 * 量子计算教学库：基于状态向量的完整模拟器、量子门、量子算法与协议。
 * 包含 Deutsch-Jozsa、Grover 搜索、Shor 算法（QFT 演示）、
 * 量子隐形传态、Bernstein-Vazirani、量子纠错码等核心内容。
 */

export {
  ComplexNumber,
  StateVector,
  QuantumCircuitV2,
  BB84Protocol,
  expandSingleQubitGate,
  expandTwoQubitGate,
  expandThreeQubitGate,
  expandCNOT,
  expandSWAP,
  expandToffoli,
  demo as demoQuantumSimulator
} from './quantum-simulator.js';

export { Gates, demo as demoQuantumGates } from './quantum-gates.js';

export {
  buildDeutschJozsaOracle,
  runDeutschJozsa,
  demo as demoDeutschJozsa
} from './deutsch-jozsa.js';

export {
  buildPhaseOracle,
  buildDiffusionOperator,
  runGroverSearch,
  demo as demoGroverSearch
} from './grover-search.js';

export {
  buildQFTMatrix,
  applyQFT,
  preparePeriodicState,
  estimatePeriod,
  demo as demoShorAlgorithm
} from './shor-algorithm.js';

export { teleportState, demo as demoQuantumTeleportation } from './quantum-teleportation.js';

export {
  buildBVOracle,
  runBernsteinVazirani,
  demo as demoBernsteinVazirani
} from './bernstein-vazirani.js';

export {
  runBitFlipCode,
  demo as demoQuantumErrorCorrection
} from './quantum-error-correction.js';
