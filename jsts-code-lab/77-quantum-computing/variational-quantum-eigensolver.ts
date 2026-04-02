/**
 * @file 变分量子特征求解器 (VQE)
 * @category Quantum Computing → Algorithms
 * @difficulty hard
 * @tags vqe, variational-quantum-eigensolver, optimization, ground-state, hamiltonian
 * @description
 * 实现 VQE 的简化模拟：参数化量子电路（Ansatz）+ 经典优化器迭代，
 * 演示如何求解简单哈密顿量的基态能量。
 * VQE 是量子计算在化学、材料科学中最有前景的近未来应用之一。
 * @mathematical_basis
 * 根据变分原理，对任意试探态 |ψ(θ)⟩，其能量期望值
 *   E(θ) = ⟨ψ(θ)|H|ψ(θ)⟩ ≥ E_0（基态能量）。
 * 因此通过经典优化器调整参数 θ，使 E(θ) 最小化，即可逼近基态能量。
 * 本例使用单量子比特哈密顿量 H = Z + 0.5 X，Ansatz 为 Ry(θ)|0⟩。
 * 解析最小能量为 -√(1 + 0.5²) ≈ -1.118，对应 tan(θ) = 0.5。
 * @complexity_analysis
 * 每次能量评估需要运行量子电路并测量（本模拟为 O(2^n)）。
 * 经典优化器迭代次数决定总复杂度。对小型系统教学演示可瞬时完成。
 */

import { QuantumCircuitV2 } from './quantum-simulator.js';

/** 用有限次测量估算 Pauli-Z 的期望值 ⟨Z⟩ */
function estimateZ(circuit: QuantumCircuitV2, qubit: number, shots = 2000): number {
  let sum = 0;
  for (let i = 0; i < shots; i++) {
    const c = new QuantumCircuitV2(circuit.stateVector.n);
    // 复制当前态（避免重复构建电路）
    c.stateVector = circuit.cloneState();
    const outcome = c.measure(qubit);
    sum += outcome === 0 ? 1 : -1;
  }
  return sum / shots;
}

/** 用有限次测量估算 Pauli-X 的期望值 ⟨X⟩（测量前施加 H 门将 X 基旋转到 Z 基） */
function estimateX(circuit: QuantumCircuitV2, qubit: number, shots = 2000): number {
  let sum = 0;
  for (let i = 0; i < shots; i++) {
    const c = new QuantumCircuitV2(circuit.stateVector.n);
    c.stateVector = circuit.cloneState();
    c.h(qubit);
    const outcome = c.measure(qubit);
    sum += outcome === 0 ? 1 : -1;
  }
  return sum / shots;
}

/** 计算哈密顿量 H = Z + coeff * X 的期望值 */
function energy(theta: number, coeff: number): number {
  const circuit = new QuantumCircuitV2(1);
  circuit.ry(0, theta);
  const z = estimateZ(circuit, 0, 1500);
  const x = estimateX(circuit, 0, 1500);
  return z + coeff * x;
}

/** 简单的经典梯度下降优化器 */
function optimize(
  coeff: number,
  initialTheta: number,
  learningRate = 0.15,
  steps = 30
): { theta: number; energy: number; history: number[] } {
  let theta = initialTheta;
  const history: number[] = [];
  for (let i = 0; i < steps; i++) {
    const e = energy(theta, coeff);
    history.push(e);
    // 数值梯度
    const delta = 0.01;
    const ePlus = energy(theta + delta, coeff);
    const eMinus = energy(theta - delta, coeff);
    const grad = (ePlus - eMinus) / (2 * delta);
    theta -= learningRate * grad;
  }
  const finalEnergy = energy(theta, coeff);
  history.push(finalEnergy);
  return { theta, energy: finalEnergy, history };
}

export function runVQE(
  coeff = 0.5
): {
  optimalTheta: number;
  estimatedGroundEnergy: number;
  exactGroundEnergy: number;
  history: number[];
} {
  const initialTheta = Math.random() * Math.PI;
  const result = optimize(coeff, initialTheta);
  const exact = -Math.sqrt(1 + coeff * coeff);
  return {
    optimalTheta: result.theta,
    estimatedGroundEnergy: result.energy,
    exactGroundEnergy: exact,
    history: result.history
  };
}

export function demo(): void {
  console.log('=== 变分量子特征求解器 (VQE) ===\n');

  const coeff = 0.5;
  console.log(`哈密顿量: H = Z + ${coeff} X`);
  console.log('解析基态能量:', -Math.sqrt(1 + coeff * coeff).toFixed(6));
  console.log('');

  const result = runVQE(coeff);
  console.log('初始随机参数优化后的结果:');
  console.log('  最优参数 θ:', result.optimalTheta.toFixed(6), 'rad');
  console.log('  估计基态能量:', result.estimatedGroundEnergy.toFixed(6));
  console.log('  与解析解误差:', Math.abs(result.estimatedGroundEnergy - result.exactGroundEnergy).toFixed(6));
  console.log('');
  console.log('能量迭代历史 (前10步):');
  console.log(result.history.slice(0, 10).map((e) => e.toFixed(4)).join(' -> '));
}
