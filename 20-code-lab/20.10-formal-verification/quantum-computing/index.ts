/**
 * @file 量子计算模块
 * @module Quantum Computing
 * @description
 * 量子计算教学库：基于状态向量的完整模拟器、量子门、量子算法与协议。
 * 包含 Deutsch-Jozsa、Grover 搜索、Shor 算法（QFT 周期提取与因数分解）、
 * 量子隐形传态、Bernstein-Vazirani、量子纠错码、VQE 等核心内容。
 */

export {
  ComplexNumber,
  StateVector,
  expandSingleQubitGate,
  expandTwoQubitGate,
  expandThreeQubitGate,
  expandCNOT,
  expandSWAP,
  expandToffoli,
  demo as demoStateVector
} from './quantum-state-vector.js';

export { QuantumCircuitV2, BB84Protocol, demo as demoQuantumSimulator } from './quantum-simulator.js';

export { Gates, demo as demoQuantumGates } from './quantum-gates-extended.js';

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
  applyQFTCircuit,
  demo as demoQuantumFourierTransform
} from './quantum-fourier-transform.js';

export {
  preparePeriodicState,
  estimatePeriod,
  runShorFactoring,
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

export {
  runVQE,
  demo as demoVQE
} from './variational-quantum-eigensolver.js';
