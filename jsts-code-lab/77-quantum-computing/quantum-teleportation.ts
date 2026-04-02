/**
 * @file 量子隐形传态
 * @category Quantum Computing → Protocols
 * @difficulty hard
 * @description
 * 演示如何通过爱因斯坦-波多尔斯基-罗森（EPR）纠缠对和 2 个经典比特，
 * 将一个未知量子态从 Alice 传输给 Bob。
 * @mathematical_basis
 * Alice 持有未知态 |ψ⟩ = α|0⟩ + β|1⟩（量子比特 0）。
 * Alice 与 Bob 共享最大纠缠态 |Φ⁺⟩ = (|00⟩+|11⟩)/√2（量子比特 1,2）。
 * 总初始态：|ψ⟩_0 ⊗ |Φ⁺⟩_{12}。
 * 1. Alice 对 (0,1) 执行 CNOT 门，再对量子比特 0 执行 H 门。
 * 2. Alice 测量量子比特 0 与 1，得到经典结果 (m0, m1)。
 * 3. Bob 根据 (m0, m1) 对量子比特 2 施加 Z^{m0} X^{m1}。
 * 最终 Bob 的量子比特 2 精确恢复为 |ψ⟩。
 * @complexity_analysis
 * 电路深度 O(1)，通信开销为 2 经典比特 + 1 个预先共享的贝尔对。
 */

import { ComplexNumber, QuantumCircuitV2 } from './quantum-simulator.js';

export function teleportState(alpha: ComplexNumber, beta: ComplexNumber): { m0: 0 | 1; m1: 0 | 1; fidelity: number } {
  const circuit = new QuantumCircuitV2(3);
  // 初始化 Alice 的未知态到 qubit 0
  circuit.stateVector.amplitudes[0] = alpha.clone(); // |000⟩
  circuit.stateVector.amplitudes[1] = beta.clone();  // |001⟩ (qubit 0 = 1)
  circuit.stateVector.normalize();

  // 制备贝尔对 (qubit 1, 2)
  circuit.h(1).cnot(1, 2);

  // Alice 的局域操作
  circuit.cnot(0, 1).h(0);

  // Alice 测量并发送经典比特给 Bob
  const m0 = circuit.measure(0);
  const m1 = circuit.measure(1);

  // Bob 根据经典信息纠错
  if (m1 === 1) circuit.x(2);
  if (m0 === 1) circuit.z(2);

  // 提取 Bob 的 qubit 2 的归一化态矢
  const mask = (m1 << 1) | m0;
  let finalAlpha = ComplexNumber.zero();
  let finalBeta = ComplexNumber.zero();
  for (let i = 0; i < 8; i++) {
    if ((i & 0b011) === mask) {
      const bit2 = (i >> 2) & 1;
      if (bit2 === 0) {
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

  // 保真度 F = |⟨ψ|ψ'⟩|^2 = |α* α' + β* β'|^2
  const overlap = alpha.conjugate().multiply(finalAlpha).add(beta.conjugate().multiply(finalBeta));
  const fidelity = overlap.magnitudeSquared();

  return { m0, m1, fidelity };
}

export function demo(): void {
  console.log('=== 量子隐形传态 ===\n');
  const alpha = new ComplexNumber(1 / Math.sqrt(2), 0);
  const beta = new ComplexNumber(0, 1 / Math.sqrt(2)); // |+i⟩
  const result = teleportState(alpha, beta);
  console.log('原始态:', alpha.toString(), '|0⟩ +', beta.toString(), '|1⟩');
  console.log('Alice 测量结果:', `m0=${result.m0}, m1=${result.m1}`);
  console.log('保真度 (Fidelity):', result.fidelity.toFixed(6));
}
