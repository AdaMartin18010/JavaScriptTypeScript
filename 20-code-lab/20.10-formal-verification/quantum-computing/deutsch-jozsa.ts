/**
 * @file Deutsch-Jozsa 算法
 * @category Quantum Computing → Algorithms
 * @difficulty hard
 * @description
 * 判断一个黑盒函数 f: {0,1}^n → {0,1} 是常数函数还是平衡函数。
 * @mathematical_basis
 * 算法利用相位反冲（phase kickback）原理。
 * 初始化：|0⟩^{⊗n}|1⟩，对所有 n+1 个量子比特应用 H 门后得到
 *   |ψ_0⟩ = Σ_x |x⟩/√{2^n} ⊗ (|0⟩−|1⟩)/√2。
 * Oracle U_f 定义为 U_f|x⟩|y⟩ = |x⟩|y ⊕ f(x)⟩。
 * 当辅助比特处于 |−⟩ 态时，U_f|x⟩|−⟩ = (−1)^{f(x)}|x⟩|−⟩。
 * 对输入寄存器再次应用 H^{⊗n} 后，计算基上的振幅反映 f 的性质：
 *   若 f 为常数，则测得 |0...0⟩ 的概率为 1；
 *   若 f 为平衡，则至少有一个输入量子比特测得 1。
 * @complexity_analysis
 * 经典算法最坏情况下需要 2^{n−1}+1 次查询才能确定；量子算法仅需 1 次查询。
 * 电路空间复杂度 O(2^{n+1})。
 */

import { ComplexNumber, QuantumCircuitV2 } from './quantum-simulator.js';

export type DJOracle = (x: number) => 0 | 1;

/** 构造 Deutsch-Jozsa 算法的 Oracle 矩阵（n 输入 + 1 辅助） */
export function buildDeutschJozsaOracle(n: number, f: DJOracle): ComplexNumber[][] {
  const totalQubits = n + 1;
  const size = 1 << totalQubits;
  const inputMask = (1 << n) - 1;
  const matrix: ComplexNumber[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => ComplexNumber.zero())
  );
  for (let col = 0; col < size; col++) {
    const x = col & inputMask;
    const aux = (col >> n) & 1;
    const fx = f(x);
    const newAux = aux ^ fx;
    const row = (col & inputMask) | (newAux << n);
    matrix[row][col] = ComplexNumber.one();
  }
  return matrix;
}

/** 运行 Deutsch-Jozsa 算法，返回 'constant' 或 'balanced' */
export function runDeutschJozsa(n: number, f: DJOracle): 'constant' | 'balanced' {
  const circuit = new QuantumCircuitV2(n + 1, 1 << n); // |0...01⟩
  for (let i = 0; i <= n; i++) {
    circuit.h(i);
  }
  circuit.stateVector.applyGate(buildDeutschJozsaOracle(n, f));
  for (let i = 0; i < n; i++) {
    circuit.h(i);
  }
  for (let i = 0; i < n; i++) {
    if (circuit.measure(i) === 1) {
      return 'balanced';
    }
  }
  return 'constant';
}

export function demo(): void {
  console.log('=== Deutsch-Jozsa 算法 ===\n');
  const n = 3;

  const constantOracle: DJOracle = () => 0;
  console.log('常数函数 f(x)=0:', runDeutschJozsa(n, constantOracle));

  const balancedOracle: DJOracle = (x) => (x & 1) as 0 | 1;
  console.log('平衡函数 f(x)=x_0:', runDeutschJozsa(n, balancedOracle));
}
