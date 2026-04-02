/**
 * @file 量子纠错码
 * @category Quantum Computing → Protocols
 * @difficulty hard
 * @description
 * 演示 3-qubit bit-flip 纠错码的完整流程：编码、引入错误、
 * Syndrome 测量、纠错与解码。
 * @mathematical_basis
 * 逻辑量子比特编码为 |ψ_L⟩ = α|000⟩ + β|111⟩。
 * 该码空间可以检测并纠正任意单个比特翻转错误 X_i。
 * Syndrome 通过两个辅助量子比特测量 stabilizer 生成元得到：
 *   Z_1 Z_2 (ancilla 0) 与 Z_2 Z_3 (ancilla 1)。
 * Syndrome 00 表示无错；01 对应 qubit 2 翻转；10 对应 qubit 0 翻转；11 对应 qubit 1 翻转。
 * 根据 Syndrome 对相应物理量子比特施加 X 门即可恢复原始逻辑态。
 * @complexity_analysis
 * 编码需要 2 个 CNOT，Syndrome 提取需要 4 个 CNOT，纠错需要 1 个 X 门，
 * 解码需要 2 个 CNOT。整体电路深度 O(1)。
 */

import { ComplexNumber, QuantumCircuitV2 } from './quantum-simulator.js';

export function runBitFlipCode(
  alpha: ComplexNumber,
  beta: ComplexNumber,
  errorQubit: 0 | 1 | 2
): { corrected: boolean; fidelity: number } {
  // 5 量子比特：0,1,2 为数据位，3,4 为辅助位
  const circuit = new QuantumCircuitV2(5);
  circuit.stateVector.amplitudes[0] = alpha.clone(); // |00000⟩
  circuit.stateVector.amplitudes[1] = beta.clone();  // |00001⟩ (qubit 0 = 1)
  circuit.stateVector.normalize();

  // 编码：|ψ⟩ -> α|000⟩ + β|111⟩ (qubits 0,1,2)
  circuit.cnot(0, 1).cnot(0, 2);

  // 引入单比特翻转错误
  if (errorQubit >= 0 && errorQubit <= 2) {
    circuit.x(errorQubit);
  }

  // Syndrome 提取
  circuit.cnot(0, 3).cnot(1, 3); // ancilla 3 测量 Z1 Z2
  circuit.cnot(1, 4).cnot(2, 4); // ancilla 4 测量 Z2 Z3

  // 测量辅助位
  const s0 = circuit.measure(3);
  const s1 = circuit.measure(4);
  const syndrome = (s0 << 1) | s1;

  // Syndrome -> 纠错映射
  const correctionMap: Record<number, number> = { 0b00: -1, 0b01: 2, 0b10: 0, 0b11: 1 };
  const correctQubit = correctionMap[syndrome];
  if (correctQubit >= 0) {
    circuit.x(correctQubit);
  }

  // 解码
  circuit.cnot(0, 2).cnot(0, 1);

  // 提取 qubit 0 的最终态（只需 qubits 1,2 为 0，ancillas 保持测量态）
  let finalAlpha = ComplexNumber.zero();
  let finalBeta = ComplexNumber.zero();
  for (let i = 0; i < 32; i++) {
    if ((i & 0b110) === 0) {
      const bit0 = i & 1;
      if (bit0 === 0) {
        finalAlpha = finalAlpha.add(circuit.stateVector.amplitudes[i]);
      } else {
        finalBeta = finalBeta.add(circuit.stateVector.amplitudes[i]);
      }
    }
  }
  const norm = Math.sqrt(finalAlpha.magnitudeSquared() + finalBeta.magnitudeSquared());
  if (norm > 0) {
    finalAlpha = finalAlpha.scale(1 / norm);
    finalBeta = finalBeta.scale(1 / norm);
  }

  const overlap = alpha.conjugate().multiply(finalAlpha).add(beta.conjugate().multiply(finalBeta));
  const fidelity = overlap.magnitudeSquared();

  return { corrected: correctQubit === errorQubit, fidelity };
}

export function demo(): void {
  console.log('=== 3-Qubit Bit-Flip 纠错码 ===\n');
  const alpha = new ComplexNumber(Math.sqrt(0.3), 0);
  const beta = new ComplexNumber(Math.sqrt(0.7), 0);
  for (let q = 0; q < 3; q++) {
    const result = runBitFlipCode(alpha, beta, q as 0 | 1 | 2);
    console.log(`在 qubit ${q} 引入翻转错误 -> 保真度: ${result.fidelity.toFixed(6)}, 纠正正确: ${result.corrected}`);
  }
}
