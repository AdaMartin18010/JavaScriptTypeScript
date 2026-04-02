/**
 * @file Bernstein-Vazirani 算法
 * @category Quantum Computing → Algorithms
 * @difficulty medium
 * @description
 * 通过一次量子查询找出隐藏的秘密二进制字符串 s。
 * @mathematical_basis
 * 黑盒函数定义为 f(x) = s · x (mod 2)，其中 s ∈ {0,1}^n。
 * Oracle 实现 U_f|x⟩|y⟩ = |x⟩|y ⊕ f(x)⟩。
 * 将辅助比特制备为 |−⟩ = (|0⟩−|1⟩)/√2 后，相位反冲使得
 *   U_f|x⟩|−⟩ = (−1)^{s·x}|x⟩|−⟩。
 * 对输入寄存器施加 H^{⊗n} 后，测量结果恰好为秘密字符串 s。
 * @complexity_analysis
 * 经典算法需要 n 次查询才能逐位确定 s；量子算法仅需 1 次查询。
 */

import { ComplexNumber, QuantumCircuitV2 } from './quantum-simulator.js';

export type BVOracle = (x: number) => 0 | 1;

function parity(v: number): 0 | 1 {
  let p = 0;
  while (v) {
    p ^= 1;
    v &= v - 1;
  }
  return p as 0 | 1;
}

/** 构造 Bernstein-Vazirani Oracle 矩阵 */
export function buildBVOracle(n: number, s: number): ComplexNumber[][] {
  const totalQubits = n + 1;
  const size = 1 << totalQubits;
  const inputMask = (1 << n) - 1;
  const matrix: ComplexNumber[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => ComplexNumber.zero())
  );
  for (let col = 0; col < size; col++) {
    const x = col & inputMask;
    const aux = (col >> n) & 1;
    const fx = parity(s & x);
    const newAux = aux ^ fx;
    const row = (col & inputMask) | (newAux << n);
    matrix[row][col] = ComplexNumber.one();
  }
  return matrix;
}

/** 运行 Bernstein-Vazirani 算法，返回秘密字符串的整数表示 */
export function runBernsteinVazirani(n: number, s: number): number {
  const circuit = new QuantumCircuitV2(n + 1, 1 << n);
  for (let i = 0; i <= n; i++) {
    circuit.h(i);
  }
  circuit.stateVector.applyGate(buildBVOracle(n, s));
  for (let i = 0; i < n; i++) {
    circuit.h(i);
  }
  let result = 0;
  for (let i = 0; i < n; i++) {
    if (circuit.measure(i) === 1) {
      result |= 1 << i;
    }
  }
  return result;
}

export function demo(): void {
  console.log('=== Bernstein-Vazirani 算法 ===\n');
  const n = 4;
  const s = 0b1010;
  const result = runBernsteinVazirani(n, s);
  console.log('秘密字符串 s:', s.toString(2).padStart(n, '0'));
  console.log('算法结果:', result.toString(2).padStart(n, '0'));
  console.log('是否一致:', result === s);
}
