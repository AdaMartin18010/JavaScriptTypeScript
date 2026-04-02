/**
 * @file Grover 搜索算法
 * @category Quantum Computing → Algorithms
 * @difficulty hard
 * @description
 * 在未排序数据库中以量子二次加速搜索目标项。
 * @mathematical_basis
 * 初始化：|s⟩ = H^{⊗n}|0...0⟩ = 1/√N Σ_x |x⟩，其中 N = 2^n。
 * Oracle O 为目标态 |w⟩ 引入 π 相位：O = I − 2|w⟩⟨w|。
 * 扩散算子（Grover Diffusion Operator）D = 2|s⟩⟨s| − I。
 * 每次迭代施加 DO，将状态向量在由 |w⟩ 与 |s⟩ 张成的平面上向 |w⟩ 旋转 2θ，
 * 其中 sin θ = 1/√N。
 * 最优迭代次数约为 π/4 · √N，此时测得 |w⟩ 的概率趋近于 1。
 * @complexity_analysis
 * 时间复杂度 O(√N)，空间复杂度 O(N)。经典搜索为 O(N)。
 */

import { ComplexNumber, QuantumCircuitV2 } from './quantum-simulator.js';

/** 构造相位 Oracle：对角矩阵，目标项处为 -1，其余为 +1 */
export function buildPhaseOracle(n: number, target: number): ComplexNumber[][] {
  const size = 1 << n;
  const matrix: ComplexNumber[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => ComplexNumber.zero())
  );
  for (let i = 0; i < size; i++) {
    matrix[i][i] = new ComplexNumber(i === target ? -1 : 1, 0);
  }
  return matrix;
}

/** 构造扩散算子 D = 2|s⟩⟨s| − I */
export function buildDiffusionOperator(n: number): ComplexNumber[][] {
  const size = 1 << n;
  const matrix: ComplexNumber[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => ComplexNumber.zero())
  );
  const offDiag = 2 / size;
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const val = i === j ? offDiag - 1 : offDiag;
      matrix[i][j] = new ComplexNumber(val, 0);
    }
  }
  return matrix;
}

/** 运行 Grover 搜索，返回测量结果与成功标志 */
export function runGroverSearch(n: number, target: number): { success: boolean; measured: number; iterations: number } {
  const N = 1 << n;
  const iterations = Math.floor((Math.PI / 4) * Math.sqrt(N));
  const circuit = new QuantumCircuitV2(n);
  for (let i = 0; i < n; i++) {
    circuit.h(i);
  }
  const oracle = buildPhaseOracle(n, target);
  const diffusion = buildDiffusionOperator(n);
  for (let step = 0; step < iterations; step++) {
    circuit.stateVector.applyGate(oracle);
    circuit.stateVector.applyGate(diffusion);
  }
  const measured = circuit.measureAll();
  return { success: measured === target, measured, iterations };
}

export function demo(): void {
  console.log('=== Grover 搜索算法 ===\n');
  const n = 2; // N = 4
  const target = 2; // |10⟩
  const result = runGroverSearch(n, target);
  console.log(`N=${1 << n}, target=${target} (${target.toString(2).padStart(n, '0')}), iterations=${result.iterations}`);
  console.log('测量结果:', result.measured.toString(2).padStart(n, '0'));
  console.log('是否成功:', result.success);
}
