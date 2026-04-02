/**
 * @file 量子门矩阵
 * @category Quantum Computing → Gates
 * @difficulty medium
 * @description
 * 定义所有常用单量子比特门、双量子比特门及三量子比特门的矩阵生成函数。
 * @mathematical_basis
 * 量子门是作用在希尔伯特空间上的酉算符，满足 U†U = I。
 * 单量子比特门为 2×2 矩阵，双量子比特门为 4×4 矩阵，三量子比特门为 8×8 矩阵。
 * 常用门示例（狄拉克符号）：
 *   H = 1/√2 (|0⟩⟨0| + |0⟩⟨1| + |1⟩⟨0| − |1⟩⟨1|)
 *   X = |0⟩⟨1| + |1⟩⟨0|
 *   CNOT = |0⟩⟨0| ⊗ I + |1⟩⟨1| ⊗ X
 * @complexity_analysis
 * 每个门生成的时间与空间复杂度均为 O(4^k)，其中 k 为门作用的量子比特数（1, 2, 3）。
 */

import { ComplexNumber } from './quantum-simulator.js';

export const Gates = {
  /** Hadamard 门：H = 1/√2 [[1, 1], [1, -1]] */
  H: (): ComplexNumber[][] => [
    [new ComplexNumber(1 / Math.SQRT2, 0), new ComplexNumber(1 / Math.SQRT2, 0)],
    [new ComplexNumber(1 / Math.SQRT2, 0), new ComplexNumber(-1 / Math.SQRT2, 0)]
  ],

  /** Pauli-X 门（NOT）：X = [[0, 1], [1, 0]] */
  X: (): ComplexNumber[][] => [
    [ComplexNumber.zero(), ComplexNumber.one()],
    [ComplexNumber.one(), ComplexNumber.zero()]
  ],

  /** Pauli-Y 门：Y = [[0, -i], [i, 0]] */
  Y: (): ComplexNumber[][] => [
    [ComplexNumber.zero(), new ComplexNumber(0, -1)],
    [new ComplexNumber(0, 1), ComplexNumber.zero()]
  ],

  /** Pauli-Z 门：Z = [[1, 0], [0, -1]] */
  Z: (): ComplexNumber[][] => [
    [ComplexNumber.one(), ComplexNumber.zero()],
    [ComplexNumber.zero(), new ComplexNumber(-1, 0)]
  ],

  /** 相位门 S：S = [[1, 0], [0, i]] */
  S: (): ComplexNumber[][] => [
    [ComplexNumber.one(), ComplexNumber.zero()],
    [ComplexNumber.zero(), new ComplexNumber(0, 1)]
  ],

  /** T 门（π/8 门）：T = [[1, 0], [0, e^{iπ/4}]] */
  T: (): ComplexNumber[][] => {
    const c = Math.cos(Math.PI / 4);
    const s = Math.sin(Math.PI / 4);
    return [
      [ComplexNumber.one(), ComplexNumber.zero()],
      [ComplexNumber.zero(), new ComplexNumber(c, s)]
    ];
  },

  /** 绕 x 轴旋转门：Rx(θ) = [[cos(θ/2), -i·sin(θ/2)], [-i·sin(θ/2), cos(θ/2)]] */
  Rx: (theta: number): ComplexNumber[][] => {
    const c = Math.cos(theta / 2);
    const s = Math.sin(theta / 2);
    return [
      [new ComplexNumber(c, 0), new ComplexNumber(0, -s)],
      [new ComplexNumber(0, -s), new ComplexNumber(c, 0)]
    ];
  },

  /** 绕 y 轴旋转门：Ry(θ) = [[cos(θ/2), -sin(θ/2)], [sin(θ/2), cos(θ/2)]] */
  Ry: (theta: number): ComplexNumber[][] => {
    const c = Math.cos(theta / 2);
    const s = Math.sin(theta / 2);
    return [
      [new ComplexNumber(c, 0), new ComplexNumber(-s, 0)],
      [new ComplexNumber(s, 0), new ComplexNumber(c, 0)]
    ];
  },

  /** 绕 z 轴旋转门：Rz(θ) = [[e^{-iθ/2}, 0], [0, e^{iθ/2}]] */
  Rz: (theta: number): ComplexNumber[][] => {
    const eNeg = ComplexNumber.expI(-theta / 2);
    const ePos = ComplexNumber.expI(theta / 2);
    return [
      [eNeg, ComplexNumber.zero()],
      [ComplexNumber.zero(), ePos]
    ];
  },

  /** 受控非门（CNOT）：控制位为 |1⟩ 时翻转目标位 */
  CNOT: (): ComplexNumber[][] => [
    [ComplexNumber.one(), ComplexNumber.zero(), ComplexNumber.zero(), ComplexNumber.zero()],
    [ComplexNumber.zero(), ComplexNumber.one(), ComplexNumber.zero(), ComplexNumber.zero()],
    [ComplexNumber.zero(), ComplexNumber.zero(), ComplexNumber.zero(), ComplexNumber.one()],
    [ComplexNumber.zero(), ComplexNumber.zero(), ComplexNumber.one(), ComplexNumber.zero()]
  ],

  /** 受控相位门（CZ）：CZ = diag(1, 1, 1, -1) */
  CZ: (): ComplexNumber[][] => [
    [ComplexNumber.one(), ComplexNumber.zero(), ComplexNumber.zero(), ComplexNumber.zero()],
    [ComplexNumber.zero(), ComplexNumber.one(), ComplexNumber.zero(), ComplexNumber.zero()],
    [ComplexNumber.zero(), ComplexNumber.zero(), ComplexNumber.one(), ComplexNumber.zero()],
    [ComplexNumber.zero(), ComplexNumber.zero(), ComplexNumber.zero(), new ComplexNumber(-1, 0)]
  ],

  /** SWAP 门：交换两个量子比特的状态 */
  SWAP: (): ComplexNumber[][] => [
    [ComplexNumber.one(), ComplexNumber.zero(), ComplexNumber.zero(), ComplexNumber.zero()],
    [ComplexNumber.zero(), ComplexNumber.zero(), ComplexNumber.one(), ComplexNumber.zero()],
    [ComplexNumber.zero(), ComplexNumber.one(), ComplexNumber.zero(), ComplexNumber.zero()],
    [ComplexNumber.zero(), ComplexNumber.zero(), ComplexNumber.zero(), ComplexNumber.one()]
  ],

  /** Toffoli 门（CCNOT）：双控制位均为 |1⟩ 时翻转目标位 */
  Toffoli: (): ComplexNumber[][] => {
    const size = 8;
    const I: ComplexNumber[][] = Array.from({ length: size }, (_, i) =>
      Array.from({ length: size }, (_, j) => (i === j ? ComplexNumber.one() : ComplexNumber.zero()))
    );
    // 翻转 |110⟩（索引 6）与 |111⟩（索引 7）
    I[6][6] = ComplexNumber.zero();
    I[6][7] = ComplexNumber.one();
    I[7][7] = ComplexNumber.zero();
    I[7][6] = ComplexNumber.one();
    return I;
  }
};

export function demo(): void {
  console.log('=== 量子门矩阵 ===');
  console.log('H gate first row:', Gates.H()[0].map((c) => c.toString()).join(', '));
  console.log('X gate first row:', Gates.X()[0].map((c) => c.toString()).join(', '));
  console.log('CNOT gate dimension:', Gates.CNOT().length, 'x', Gates.CNOT()[0].length);
  console.log('Toffoli gate dimension:', Gates.Toffoli().length, 'x', Gates.Toffoli()[0].length);
}
