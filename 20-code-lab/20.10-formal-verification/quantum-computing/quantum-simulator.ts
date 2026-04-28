/**
 * @file 量子模拟器 V2
 * @category Quantum Computing → Simulator
 * @difficulty hard
 * @tags quantum-simulator, quantum-circuit, measurement, bb84
 * @description
 * 基于状态向量的完整量子模拟器，支持多量子比特系统的酉演化与测量。
 * 本文件保留 QuantumCircuitV2（电路构造器）与 BB84 协议模拟，
 * 复数与状态向量实现已迁移至 quantum-state-vector.ts。
 * @mathematical_basis
 * n 量子比特系统的状态由 2^n 维复向量 |ψ⟩ = Σ_{i=0}^{2^n-1} α_i |i⟩ 描述，
 * 其中 |i⟩ 为计算基矢（狄拉克符号）。量子门对应 2^n × 2^n 酉矩阵 U，
 * 演化规则为 |ψ'⟩ = U|ψ⟩。测量遵循玻恩规则：测得基矢 |i⟩ 的概率为 |α_i|^2，
 * 测量后状态坍缩至对应基矢。
 * @complexity_analysis
 * 状态向量存储 O(2^n)。applyGate 为矩阵-向量乘法，时间复杂度 O(4^n)。
 * 单次偏迹测量为 O(2^n)。适用于教学演示的小型量子系统（n ≤ 10）。
 */

import {
  ComplexNumber,
  StateVector,
  expandSingleQubitGate,
  expandTwoQubitGate,
  expandCNOT,
  expandSWAP,
  expandToffoli
} from './quantum-state-vector.js';
import { Gates } from './quantum-gates-extended.js';

// 为了保持向后兼容，将基础类型重新导出
export {
  ComplexNumber,
  StateVector,
  expandSingleQubitGate,
  expandTwoQubitGate,
  expandThreeQubitGate,
  expandCNOT,
  expandSWAP,
  expandToffoli
} from './quantum-state-vector.js';

export class QuantumCircuitV2 {
  stateVector: StateVector;

  constructor(numQubits: number, initialStateIndex = 0) {
    this.stateVector = new StateVector(numQubits, initialStateIndex);
  }

  h(qubit: number): this {
    this.stateVector.applyGate(expandSingleQubitGate(this.stateVector.n, qubit, Gates.H()));
    return this;
  }

  x(qubit: number): this {
    this.stateVector.applyGate(expandSingleQubitGate(this.stateVector.n, qubit, Gates.X()));
    return this;
  }

  y(qubit: number): this {
    this.stateVector.applyGate(expandSingleQubitGate(this.stateVector.n, qubit, Gates.Y()));
    return this;
  }

  z(qubit: number): this {
    this.stateVector.applyGate(expandSingleQubitGate(this.stateVector.n, qubit, Gates.Z()));
    return this;
  }

  s(qubit: number): this {
    this.stateVector.applyGate(expandSingleQubitGate(this.stateVector.n, qubit, Gates.S()));
    return this;
  }

  t(qubit: number): this {
    this.stateVector.applyGate(expandSingleQubitGate(this.stateVector.n, qubit, Gates.T()));
    return this;
  }

  rx(qubit: number, theta: number): this {
    this.stateVector.applyGate(expandSingleQubitGate(this.stateVector.n, qubit, Gates.Rx(theta)));
    return this;
  }

  ry(qubit: number, theta: number): this {
    this.stateVector.applyGate(expandSingleQubitGate(this.stateVector.n, qubit, Gates.Ry(theta)));
    return this;
  }

  rz(qubit: number, theta: number): this {
    this.stateVector.applyGate(expandSingleQubitGate(this.stateVector.n, qubit, Gates.Rz(theta)));
    return this;
  }

  /**
   * CNOT（受控非门）的严谨实现。
   * 通过 expandCNOT 构建完整 2^n × 2^n 酉矩阵，确保在叠加态与纠缠态上正确演化。
   * 此实现修复了旧版仅在高概率阈值下翻转目标的简化逻辑缺陷。
   */
  cnot(control: number, target: number): this {
    this.stateVector.applyGate(expandCNOT(this.stateVector.n, control, target));
    return this;
  }

  cz(control: number, target: number): this {
    this.stateVector.applyGate(expandTwoQubitGate(this.stateVector.n, control, target, Gates.CZ()));
    return this;
  }

  swap(a: number, b: number): this {
    this.stateVector.applyGate(expandSWAP(this.stateVector.n, a, b));
    return this;
  }

  toffoli(c1: number, c2: number, target: number): this {
    this.stateVector.applyGate(expandToffoli(this.stateVector.n, c1, c2, target));
    return this;
  }

  measure(qubitIndex: number): 0 | 1 {
    return this.stateVector.measure(qubitIndex);
  }

  measureAll(): number {
    return this.stateVector.measureAll();
  }

  getProbabilities(): number[] {
    return this.stateVector.getProbabilities();
  }

  cloneState(): StateVector {
    return this.stateVector.clone();
  }
}

/**
 * BB84 量子密钥分发协议（经典模拟）
 * Alice 与 Bob 通过随机选择基并比对，生成共享密钥。
 */
export class BB84Protocol {
  generateKey(length: number): { alice: string; bob: string; errorRate: number } {
    let alice = '';
    let bob = '';
    let errors = 0;

    for (let i = 0; i < length; i++) {
      const aliceBit = Math.random() < 0.5 ? 0 : 1;
      const aliceBasis = Math.random() < 0.5 ? 'Z' : 'X';
      const bobBasis = Math.random() < 0.5 ? 'Z' : 'X';

      if (aliceBasis === bobBasis) {
        const error = Math.random() < 0.05;
        const bobBit = error ? 1 - aliceBit : aliceBit;
        alice += aliceBit;
        bob += bobBit;
        if (error) errors++;
      }
    }

    return {
      alice,
      bob,
      errorRate: alice.length > 0 ? errors / alice.length : 0
    };
  }
}

export function demo(): void {
  console.log('=== 量子模拟器 V2 演示 ===\n');

  // Bell State：展示量子纠缠——两个量子比特的状态无法独立描述
  console.log('--- 贝尔态 (Bell State) ---');
  const bellCircuit = new QuantumCircuitV2(2);
  bellCircuit.h(0).cnot(0, 1);
  console.log('电路: H(q0) -> CNOT(q0,q1)');
  console.log('状态向量:', bellCircuit.stateVector.toString());
  const stats = { '00': 0, '01': 0, '10': 0, '11': 0 };
  const runs = 1000;
  for (let i = 0; i < runs; i++) {
    const c = new QuantumCircuitV2(2);
    c.h(0).cnot(0, 1);
    const result = c.measureAll().toString(2).padStart(2, '0') as keyof typeof stats;
    stats[result]++;
  }
  console.log(`测量统计 (${runs}次):`, stats);
  console.log('');

  // GHZ State：多体纠缠的典范
  console.log('--- GHZ 态 ---');
  const ghzCircuit = new QuantumCircuitV2(3);
  ghzCircuit.h(0).cnot(0, 1).cnot(0, 2);
  console.log('电路: H(q0) -> CNOT(q0,q1) -> CNOT(q0,q2)');
  console.log('状态向量:', ghzCircuit.stateVector.toString());
  const ghzStats = { '000': 0, '111': 0, other: 0 };
  for (let i = 0; i < runs; i++) {
    const c = new QuantumCircuitV2(3);
    c.h(0).cnot(0, 1).cnot(0, 2);
    const result = c.measureAll().toString(2).padStart(3, '0');
    if (result === '000') ghzStats['000']++;
    else if (result === '111') ghzStats['111']++;
    else ghzStats.other++;
  }
  console.log(`测量统计 (${runs}次):`, ghzStats);
  console.log('');

  // BB84
  console.log('--- BB84 协议 ---');
  const bb84 = new BB84Protocol();
  const key = bb84.generateKey(100);
  console.log('密钥长度:', key.alice.length);
  console.log('错误率:', (key.errorRate * 100).toFixed(2) + '%');
  console.log('Alice密钥:', key.alice.slice(0, 20) + '...');
  console.log('Bob密钥:  ', key.bob.slice(0, 20) + '...');
}
