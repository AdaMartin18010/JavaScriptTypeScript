/**
 * @file Shor 算法（简化版）
 * @category Quantum Computing → Algorithms
 * @difficulty hard
 * @description
 * 演示 Shor 算法中的量子傅里叶变换（QFT）与周期提取。
 * 由于完整模幂运算门的构建极为复杂，本实现采用简化的周期态制备方式，
 * 重点展示 QFT 如何从周期性叠加态中提取周期信息。
 * @mathematical_basis
 * Shor 算法将整数因数分解归约为“周期查找”问题：
 *   给定互质的 a 与 N，寻找最小正整数 r 使得 a^r ≡ 1 (mod N)。
 * 量子阶段：
 *   1. 制备均匀叠加态 |ψ⟩ = 1/√{2^m} Σ_{x=0}^{2^m-1} |x⟩|a^x mod N⟩。
 *   2. 测量第二个寄存器，第一个寄存器坍缩为周期叠加态
 *      |φ⟩ ∝ Σ_{k} |x_0 + k·r⟩。
 *   3. 对第一个寄存器应用 QFT：
 *      QFT|j⟩ = 1/√{2^m} Σ_{k=0}^{2^m-1} e^{2πi·jk/2^m} |k⟩。
 *   4. 测量结果以高概率给出 j·2^m/r 的近似值，通过连分数展开提取 r。
 * @complexity_analysis
 * 经典因数分解为次指数时间（如数域筛法），Shor 算法为多项式时间 O((log N)^3)。
 * 本教学模拟器限制 m ≤ 4，空间复杂度 O(2^m)。
 */

import { ComplexNumber, QuantumCircuitV2, StateVector } from './quantum-simulator.js';

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

/** 制备一个具有给定周期的周期叠加态 |ψ⟩ ∝ Σ_k |k·r⟩ */
export function preparePeriodicState(n: number, period: number): StateVector {
  const size = 1 << n;
  const amplitudes: ComplexNumber[] = Array.from({ length: size }, () => ComplexNumber.zero());
  for (let i = 0; i < size; i += period) {
    amplitudes[i] = ComplexNumber.one();
  }
  const sv = StateVector.fromAmplitudes(amplitudes);
  sv.normalize();
  return sv;
}

/** 通过 QFT 测量提取周期（使用简单有理逼近） */
export function estimatePeriod(n: number, period: number): { measured: number; estimatedPeriod: number } {
  let measured = 0;
  // 若测得 0 则无法提取周期，重新采样直至非零
  while (measured === 0) {
    const circuit = new QuantumCircuitV2(n);
    circuit.stateVector = preparePeriodicState(n, period);
    applyQFT(circuit);
    measured = circuit.measureAll();
  }
  const frac = measured / (1 << n);
  let bestDenom = 1;
  let bestError = Infinity;
  for (let d = 1; d <= period * 2; d++) {
    const num = Math.round(frac * d);
    const error = Math.abs(frac - num / d);
    if (error < bestError) {
      bestError = error;
      bestDenom = d;
    }
  }
  return { measured, estimatedPeriod: bestDenom };
}

export function demo(): void {
  console.log('=== Shor 算法（QFT 周期提取演示） ===\n');
  const n = 4;
  const period = 4;
  console.log(`制备周期为 ${period} 的周期态（${n} 量子比特）`);
  const result = estimatePeriod(n, period);
  console.log('QFT 测量值:', result.measured);
  console.log('估算周期:', result.estimatedPeriod);
}
