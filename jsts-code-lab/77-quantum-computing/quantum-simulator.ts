/**
 * @file 量子模拟器 V2
 * @category Quantum Computing → Simulator
 * @difficulty hard
 * @description
 * 基于状态向量的完整量子模拟器，支持多量子比特系统的酉演化与测量。
 * 包含 ComplexNumber、StateVector、QuantumCircuitV2 以及 BB84 协议的经典模拟。
 * @mathematical_basis
 * n 量子比特系统的状态由 2^n 维复向量 |ψ⟩ = Σ_{i=0}^{2^n-1} α_i |i⟩ 描述，
 * 其中 |i⟩ 为计算基矢（狄拉克符号）。量子门对应 2^n × 2^n 酉矩阵 U，
 * 演化规则为 |ψ'⟩ = U|ψ⟩。测量遵循玻恩规则：测得基矢 |i⟩ 的概率为 |α_i|^2，
 * 测量后状态坍缩至对应基矢。
 * @complexity_analysis
 * 状态向量存储 O(2^n)。applyGate 为矩阵-向量乘法，时间复杂度 O(4^n)。
 * 单次偏迹测量为 O(2^n)。适用于教学演示的小型量子系统（n ≤ 10）。
 */

import { Gates } from './quantum-gates.js';

export interface Complex {
  real: number;
  imag: number;
}

export class ComplexNumber implements Complex {
  constructor(public real: number, public imag: number) {}

  add(other: Complex): ComplexNumber {
    return new ComplexNumber(this.real + other.real, this.imag + other.imag);
  }

  subtract(other: Complex): ComplexNumber {
    return new ComplexNumber(this.real - other.real, this.imag - other.imag);
  }

  multiply(other: Complex): ComplexNumber {
    return new ComplexNumber(
      this.real * other.real - this.imag * other.imag,
      this.real * other.imag + this.imag * other.real
    );
  }

  divide(other: Complex): ComplexNumber {
    const denom = other.real * other.real + other.imag * other.imag;
    if (denom === 0) throw new Error('Division by zero complex number');
    return new ComplexNumber(
      (this.real * other.real + this.imag * other.imag) / denom,
      (this.imag * other.real - this.real * other.imag) / denom
    );
  }

  conjugate(): ComplexNumber {
    return new ComplexNumber(this.real, -this.imag);
  }

  magnitude(): number {
    return Math.hypot(this.real, this.imag);
  }

  magnitudeSquared(): number {
    return this.real * this.real + this.imag * this.imag;
  }

  scale(factor: number): ComplexNumber {
    return new ComplexNumber(this.real * factor, this.imag * factor);
  }

  clone(): ComplexNumber {
    return new ComplexNumber(this.real, this.imag);
  }

  equals(other: Complex, epsilon = 1e-10): boolean {
    return Math.abs(this.real - other.real) < epsilon && Math.abs(this.imag - other.imag) < epsilon;
  }

  toString(): string {
    if (Math.abs(this.imag) < 1e-10) return `${this.real.toFixed(3)}`;
    if (Math.abs(this.real) < 1e-10) return `${this.imag.toFixed(3)}i`;
    const sign = this.imag >= 0 ? '+' : '-';
    return `${this.real.toFixed(3)} ${sign} ${Math.abs(this.imag).toFixed(3)}i`;
  }

  static expI(theta: number): ComplexNumber {
    return new ComplexNumber(Math.cos(theta), Math.sin(theta));
  }

  static zero(): ComplexNumber {
    return new ComplexNumber(0, 0);
  }

  static one(): ComplexNumber {
    return new ComplexNumber(1, 0);
  }

  static fromReal(real: number): ComplexNumber {
    return new ComplexNumber(real, 0);
  }
}

export class StateVector {
  readonly n: number;
  readonly size: number;
  readonly amplitudes: ComplexNumber[];

  constructor(n: number, initialStateIndex = 0) {
    if (n < 0 || !Number.isInteger(n)) {
      throw new Error('Qubit count must be a non-negative integer');
    }
    this.n = n;
    this.size = 1 << n;
    this.amplitudes = Array.from({ length: this.size }, () => ComplexNumber.zero());
    this.amplitudes[initialStateIndex] = ComplexNumber.one();
  }

  static fromAmplitudes(amplitudes: ComplexNumber[]): StateVector {
    const size = amplitudes.length;
    if (size === 0 || (size & (size - 1)) !== 0) {
      throw new Error('Amplitudes array length must be a non-zero power of 2');
    }
    const n = Math.log2(size);
    const sv = Object.create(StateVector.prototype) as StateVector;
    (sv as unknown as Record<string, unknown>).n = n;
    (sv as unknown as Record<string, unknown>).size = size;
    (sv as unknown as Record<string, unknown>).amplitudes = amplitudes.map((a) => a.clone());
    return sv;
  }

  clone(): StateVector {
    return StateVector.fromAmplitudes(this.amplitudes);
  }

  tensorProduct(other: StateVector): StateVector {
    const newAmplitudes: ComplexNumber[] = [];
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < other.size; j++) {
        newAmplitudes.push(this.amplitudes[i].multiply(other.amplitudes[j]));
      }
    }
    return StateVector.fromAmplitudes(newAmplitudes);
  }

  applyGate(matrix: ComplexNumber[][]): void {
    if (matrix.length !== this.size || matrix[0]?.length !== this.size) {
      throw new Error(
        `Gate matrix size ${matrix.length}x${matrix[0]?.length} does not match state vector size ${this.size}`
      );
    }
    const newAmplitudes: ComplexNumber[] = [];
    for (let i = 0; i < this.size; i++) {
      let sum = ComplexNumber.zero();
      const row = matrix[i];
      for (let j = 0; j < this.size; j++) {
        sum = sum.add(row[j].multiply(this.amplitudes[j]));
      }
      newAmplitudes.push(sum);
    }
    for (let i = 0; i < this.size; i++) {
      this.amplitudes[i] = newAmplitudes[i];
    }
  }

  measure(qubitIndex: number): 0 | 1 {
    if (qubitIndex < 0 || qubitIndex >= this.n) {
      throw new Error(`Invalid qubit index ${qubitIndex}`);
    }
    let prob0 = 0;
    for (let i = 0; i < this.size; i++) {
      if (((i >> qubitIndex) & 1) === 0) {
        prob0 += this.amplitudes[i].magnitudeSquared();
      }
    }
    const outcome = Math.random() < prob0 ? 0 : 1;
    for (let i = 0; i < this.size; i++) {
      if (((i >> qubitIndex) & 1) !== outcome) {
        this.amplitudes[i] = ComplexNumber.zero();
      }
    }
    this.normalize();
    return outcome as 0 | 1;
  }

  measureAll(): number {
    const probs = this.amplitudes.map((a) => a.magnitudeSquared());
    const rand = Math.random();
    let cumulative = 0;
    let outcome = 0;
    for (let i = 0; i < this.size; i++) {
      cumulative += probs[i];
      if (rand < cumulative) {
        outcome = i;
        break;
      }
    }
    if (rand >= cumulative) {
      for (let i = this.size - 1; i >= 0; i--) {
        if (probs[i] > 0) {
          outcome = i;
          break;
        }
      }
    }
    for (let i = 0; i < this.size; i++) {
      this.amplitudes[i] = i === outcome ? ComplexNumber.one() : ComplexNumber.zero();
    }
    return outcome;
  }

  normalize(): void {
    let normSq = 0;
    for (const a of this.amplitudes) {
      normSq += a.magnitudeSquared();
    }
    if (normSq < 1e-15) {
      throw new Error('Cannot normalize a zero state vector');
    }
    const factor = 1 / Math.sqrt(normSq);
    for (let i = 0; i < this.size; i++) {
      this.amplitudes[i] = this.amplitudes[i].scale(factor);
    }
  }

  getProbabilities(): number[] {
    return this.amplitudes.map((a) => a.magnitudeSquared());
  }

  toString(): string {
    return this.amplitudes
      .map((a, i) => `${a.toString()}|${i.toString(2).padStart(this.n, '0')}⟩`)
      .join(' + ');
  }
}

// 矩阵扩展辅助函数：将单/双/三量子比特门扩展至 n 量子比特的完整酉矩阵

export function expandSingleQubitGate(n: number, qubit: number, gate: ComplexNumber[][]): ComplexNumber[][] {
  const size = 1 << n;
  const matrix: ComplexNumber[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => ComplexNumber.zero())
  );
  for (let col = 0; col < size; col++) {
    const bit = (col >> qubit) & 1;
    for (let newBit = 0; newBit < 2; newBit++) {
      const row = col ^ ((newBit ^ bit) << qubit);
      matrix[row][col] = gate[newBit][bit].clone();
    }
  }
  return matrix;
}

export function expandTwoQubitGate(n: number, q1: number, q2: number, gate: ComplexNumber[][]): ComplexNumber[][] {
  const size = 1 << n;
  const mask = ~((1 << q1) | (1 << q2));
  const matrix: ComplexNumber[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => ComplexNumber.zero())
  );
  for (let col = 0; col < size; col++) {
    const b1 = (col >> q1) & 1;
    const b2 = (col >> q2) & 1;
    const inputIdx = (b1 << 1) | b2;
    for (let out1 = 0; out1 < 2; out1++) {
      for (let out2 = 0; out2 < 2; out2++) {
        const outputIdx = (out1 << 1) | out2;
        const row = (col & mask) | (out1 << q1) | (out2 << q2);
        matrix[row][col] = matrix[row][col].add(gate[outputIdx][inputIdx]);
      }
    }
  }
  return matrix;
}

export function expandThreeQubitGate(
  n: number,
  q1: number,
  q2: number,
  q3: number,
  gate: ComplexNumber[][]
): ComplexNumber[][] {
  const size = 1 << n;
  const mask = ~((1 << q1) | (1 << q2) | (1 << q3));
  const matrix: ComplexNumber[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => ComplexNumber.zero())
  );
  for (let col = 0; col < size; col++) {
    const b1 = (col >> q1) & 1;
    const b2 = (col >> q2) & 1;
    const b3 = (col >> q3) & 1;
    const inputIdx = (b1 << 2) | (b2 << 1) | b3;
    for (let out1 = 0; out1 < 2; out1++) {
      for (let out2 = 0; out2 < 2; out2++) {
        for (let out3 = 0; out3 < 2; out3++) {
          const outputIdx = (out1 << 2) | (out2 << 1) | out3;
          const row = (col & mask) | (out1 << q1) | (out2 << q2) | (out3 << q3);
          matrix[row][col] = matrix[row][col].add(gate[outputIdx][inputIdx]);
        }
      }
    }
  }
  return matrix;
}

export function expandCNOT(n: number, control: number, target: number): ComplexNumber[][] {
  const size = 1 << n;
  const matrix: ComplexNumber[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => ComplexNumber.zero())
  );
  for (let col = 0; col < size; col++) {
    const row = ((col >> control) & 1) ? col ^ (1 << target) : col;
    matrix[row][col] = ComplexNumber.one();
  }
  return matrix;
}

export function expandSWAP(n: number, a: number, b: number): ComplexNumber[][] {
  const size = 1 << n;
  const matrix: ComplexNumber[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => ComplexNumber.zero())
  );
  for (let col = 0; col < size; col++) {
    const bitA = (col >> a) & 1;
    const bitB = (col >> b) & 1;
    const row = bitA === bitB ? col : col ^ (1 << a) ^ (1 << b);
    matrix[row][col] = ComplexNumber.one();
  }
  return matrix;
}

export function expandToffoli(n: number, c1: number, c2: number, target: number): ComplexNumber[][] {
  const size = 1 << n;
  const matrix: ComplexNumber[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => ComplexNumber.zero())
  );
  for (let col = 0; col < size; col++) {
    const row = ((col >> c1) & 1) && ((col >> c2) & 1) ? col ^ (1 << target) : col;
    matrix[row][col] = ComplexNumber.one();
  }
  return matrix;
}

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

  // Bell State
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

  // GHZ State
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
