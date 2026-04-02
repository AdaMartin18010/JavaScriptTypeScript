/**
 * @file 量子态矢量与矩阵运算
 * @category Quantum Computing → Foundation
 * @difficulty hard
 * @tags quantum-state, state-vector, tensor-product, linear-algebra, complex-numbers
 * @description
 * 定义多量子比特系统的态矢量（State Vector）表示与矩阵扩展工具。
 * n 个量子比特的纯态由 2^n 维复向量描述，支持张量积、酉演化与偏迹测量。
 * @mathematical_basis
 * 量子态 |ψ⟩ = Σ_{i=0}^{2^n-1} α_i |i⟩，其中 |i⟩ 为计算基矢。
 * 测量遵循玻恩规则：测得基矢 |i⟩ 的概率为 p(i)=|α_i|²。
 * 测量后状态发生"坍缩"，即非结果分量的振幅归零并重新归一化。
 */

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

/**
 * 状态向量：多量子比特系统的完整波函数描述。
 * 叠加（superposition）与纠缠（entanglement）都体现在振幅的分布中。
 */
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

  /** 张量积：将两个子系统的态组合为联合系统的态。这是多体量子力学的基本操作。 */
  tensorProduct(other: StateVector): StateVector {
    const newAmplitudes: ComplexNumber[] = [];
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < other.size; j++) {
        newAmplitudes.push(this.amplitudes[i].multiply(other.amplitudes[j]));
      }
    }
    return StateVector.fromAmplitudes(newAmplitudes);
  }

  /** 应用酉矩阵（完整 2^n × 2^n 矩阵）演化状态向量。 */
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

  /**
   * 对指定量子比特执行偏迹测量（partial trace measurement）。
   * 根据玻恩规则随机得到 0 或 1，并坍缩剩余系统的态。
   */
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

  /** 联合测量所有量子比特，返回整数表示的基矢索引。 */
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

/** 将单量子比特门扩展为 n 量子比特的完整酉矩阵（作用于指定量子比特）。 */
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

/** 将双量子比特门扩展为 n 量子比特的完整酉矩阵。 */
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

/** 将三量子比特门扩展为 n 量子比特的完整酉矩阵。 */
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

/** 严谨实现 CNOT（受控非门）的完整矩阵扩展。控制位为 |1⟩ 时翻转目标位。 */
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

/** SWAP 门的完整矩阵扩展：交换两个量子比特的状态。 */
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

/** Toffoli (CCNOT) 门的完整矩阵扩展：双控制位均为 |1⟩ 时翻转目标位。 */
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

export function demo(): void {
  console.log('=== 量子态矢量与矩阵运算 ===\n');

  const sv = new StateVector(2);
  console.log('初始态 |00⟩:', sv.toString());

  const plus = new StateVector(1);
  plus.amplitudes[0] = new ComplexNumber(1 / Math.SQRT2, 0);
  plus.amplitudes[1] = new ComplexNumber(1 / Math.SQRT2, 0);
  const tensor = plus.tensorProduct(plus);
  console.log('张量积 |+⟩⊗|+⟩:', tensor.toString());

  const bell = new StateVector(2);
  bell.applyGate(expandCNOT(2, 0, 1));
  console.log('CNOT|00⟩:', bell.toString());
}
