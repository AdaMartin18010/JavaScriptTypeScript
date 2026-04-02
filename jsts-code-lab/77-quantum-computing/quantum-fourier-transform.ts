/**
 * @file 量子傅里叶变换 (QFT)
 * @category Quantum Computing → Algorithms
 * @difficulty hard
 * @tags qft, quantum-fourier-transform, phase-estimation, periodicity
 * @description
 * 实现量子傅里叶变换（QFT）的矩阵构造与电路级模拟演示。
 * QFT 是 Shor 算法、量子相位估计等核心算法的基石，
 * 它能将计算基上的周期性信息转换为可读取的频率/相位信息。
 * @mathematical_basis
 * 对 n 量子比特系统，QFT 定义为：
 *   QFT|j⟩ = 1/√{2^n} Σ_{k=0}^{2^n-1} e^{2πi·jk/2^n} |k⟩
 * 逆 QFT（IQFT）则将频率基转回计算基，用于相位提取。
 * 物理上，QFT 是一系列 Hadamard 门与受控旋转门（Controlled-Phase）的级联。
 * @complexity_analysis
 * 显式构造 QFT 矩阵的时间复杂度为 O(4^n)，空间复杂度 O(4^n)。
 * 实际量子电路实现仅需 O(n^2) 个单/双量子门，远快于经典快速傅里叶变换的 O(n·2^n)。
 */

import { ComplexNumber, QuantumCircuitV2, StateVector } from './quantum-simulator.js';
import { expandSingleQubitGate, expandTwoQubitGate } from './quantum-state-vector.js';
import { Gates } from './quantum-gates-extended.js';

/** 构造 n 量子比特的量子傅里叶变换矩阵（可选逆 QFT） */
export function buildQFTMatrix(n: number, inverse = false): ComplexNumber[][] {
  const size = 1 << n;
  const matrix: ComplexNumber[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => ComplexNumber.zero())
  );
  const sign = inverse ? -1 : 1;
  const norm = 1 / Math.sqrt(size);
  for (let j = 0; j < size; j++) {
    for (let k = 0; k < size; k++) {
      const angle = (sign * 2 * Math.PI * j * k) / size;
      matrix[j][k] = new ComplexNumber(norm * Math.cos(angle), norm * Math.sin(angle));
    }
  }
  return matrix;
}

/** 对已有电路应用 QFT（或逆 QFT） */
export function applyQFT(circuit: QuantumCircuitV2, inverse = false): void {
  circuit.stateVector.applyGate(buildQFTMatrix(circuit.stateVector.n, inverse));
}

/**
 * 用基本门构造 QFT 电路：Hadamard + Controlled-Phase 级联。
 * 这是 QFT 的物理电路实现方式，避免了显式构造巨大矩阵。
 */
/**
 * 用基本门构造 QFT 电路的核心级联：Hadamard + Controlled-Phase。
 * 注意：此实现不包含末端的 SWAP 网络，因此其效果与矩阵 QFT 相差一个
 * 比特顺序反转（bit-reversal）。这在量子计算教材中是常见约定，
 * 且使得正向与逆电路严格互为酉逆。
 */
export function applyQFTCircuit(circuit: QuantumCircuitV2, inverse = false): void {
  const n = circuit.stateVector.n;
  const sign = inverse ? -1 : 1;

  for (let i = 0; i < n; i++) {
    const q = inverse ? n - 1 - i : i;
    circuit.h(q);
    for (let j = 1; j < n - i; j++) {
      const target = inverse ? n - 1 - (i + j) : i + j;
      const control = q;
      const angle = (sign * Math.PI) / (1 << j);
      // 受控相位门 CR(control, target, angle)
      const cpMatrix = buildControlledPhase(n, control, target, angle);
      circuit.stateVector.applyGate(cpMatrix);
    }
  }
}

/** 构造 n 量子比特上的受控相位门矩阵：当控制位与目标位均为 1 时施加 e^{iθ} 相位 */
function buildControlledPhase(n: number, control: number, target: number, theta: number): ComplexNumber[][] {
  const size = 1 << n;
  const matrix: ComplexNumber[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => ComplexNumber.zero())
  );
  const phase = ComplexNumber.expI(theta);
  for (let i = 0; i < size; i++) {
    const c = (i >> control) & 1;
    const t = (i >> target) & 1;
    matrix[i][i] = c === 1 && t === 1 ? phase.clone() : ComplexNumber.one();
  }
  return matrix;
}

export function demo(): void {
  console.log('=== 量子傅里叶变换 (QFT) ===\n');

  for (const n of [3, 4]) {
    console.log(`--- ${n} 量子比特 QFT ---`);

    // 制备一个简单输入态 |1...1⟩（计算基）
    const circuitMatrix = new QuantumCircuitV2(n, (1 << n) - 1);
    applyQFT(circuitMatrix);
    const probsMatrix = circuitMatrix.getProbabilities();
    console.log('输入态 |' + '1'.repeat(n) + '⟩ 经矩阵 QFT 后的概率分布前4项:', probsMatrix.slice(0, 4).map((p) => p.toFixed(4)));

    // 电路级 QFT（不含末端 SWAP，与矩阵 QFT 相差比特顺序反转）
    const circuitGate = new QuantumCircuitV2(n, (1 << n) - 1);
    applyQFTCircuit(circuitGate);
    const probsGate = circuitGate.getProbabilities();
    console.log('输入态 |' + '1'.repeat(n) + '⟩ 经电路级 QFT 后的概率分布前4项:', probsGate.slice(0, 4).map((p) => p.toFixed(4)));

    // 验证电路级 QFT + IQFT 能严格恢复原态
    const circuitInv = new QuantumCircuitV2(n, (1 << n) - 1);
    applyQFTCircuit(circuitInv);
    applyQFTCircuit(circuitInv, true);
    const finalProbs = circuitInv.getProbabilities();
    const recovered = finalProbs[(1 << n) - 1];
    console.log('电路级 QFT + IQFT 恢复原始态的概率:', recovered.toFixed(6));

    // 验证矩阵级 QFT + IQFT
    const circuitInvMatrix = new QuantumCircuitV2(n, (1 << n) - 1);
    applyQFT(circuitInvMatrix);
    applyQFT(circuitInvMatrix, true);
    const recoveredMatrix = circuitInvMatrix.getProbabilities()[(1 << n) - 1];
    console.log('矩阵级 QFT + IQFT 恢复原始态的概率:', recoveredMatrix.toFixed(6));
    console.log('');
  }
}
