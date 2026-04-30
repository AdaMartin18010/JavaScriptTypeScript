# 量子计算理论汇总

> 本文件基于 `jsts-code-lab/77-quantum-computing` 目录下的 `quantum-state-vector.ts`、`quantum-gates-extended.ts`、
> `quantum-fourier-transform.ts`、`grover-search.ts`、`shor-algorithm.ts` 等实现，
> 汇总量子比特、量子门数学原理、Shor / Grover / QFT 算法的复杂度与形式化分析。

---

## 目录

1. [量子比特 (Qubit)](#量子比特-qubit)
2. [量子门数学原理](#量子门数学原理)
3. [量子傅里叶变换 (QFT)](#量子傅里叶变换-qft)
4. [Shor 算法](#shor-算法)
5. [Grover 算法](#grover-算法)
6. [算法复杂度汇总](#算法复杂度汇总)
7. [扩展代码示例](#扩展代码示例)
8. [权威参考链接](#权威参考链接)

---

## 量子比特 Qubit

### 1. 单量子比特

经典比特只有 $0$ 或 $1$ 两种状态，而量子比特（qubit）的状态是二维复希尔伯特空间中的单位向量：

$$
|\psi\rangle = \alpha |0\rangle + \beta |1\rangle =
\begin{pmatrix} \alpha \\ \beta \end{pmatrix},
\quad \alpha, \beta \in \mathbb{C},
\quad |\alpha|^2 + |\beta|^2 = 1
$$

根据 **玻恩规则 (Born Rule)**，测量得到 $|0\rangle$ 的概率为 $|\alpha|^2$，得到 $|1\rangle$ 的概率为 $|\beta|^2$。
测量后状态会**坍缩**到对应的基矢上。

在代码中（`quantum-state-vector.ts`），`StateVector` 类使用长度为 $2^n$ 的复数数组 `amplitudes` 存储多量子比特系统的完整波函数，并通过 `magnitudeSquared()` 计算测量概率。

### 2. 多量子比特与张量积

$n$ 个量子比特的联合状态空间维度为 $2^n$，其态向量通过张量积（Tensor Product）构造：

$$
|\psi\rangle = |\psi_1\rangle \otimes |\psi_2\rangle \otimes \cdots \otimes |\psi_n\rangle
$$

`quantum-state-vector.ts` 中的 `StateVector.tensorProduct(other)` 实现了该操作：

```typescript
for (let i = 0; i < this.size; i++) {
  for (let j = 0; j < other.size; j++) {
    newAmplitudes.push(this.amplitudes[i].multiply(other.amplitudes[j]));
  }
}
```

时间复杂度为 $O(2^{n_1 + n_2})$，对应张量积的维度乘法。

### 3. 量子纠缠

当多量子比特系统的联合状态**无法**分解为各子系统状态的直积时，称这些量子比特处于**纠缠态**（Entanglement）。

**贝尔态 (Bell State)** 是最著名的两量子比特纠缠态：

$$
|\Phi^+\rangle = \frac{1}{\sqrt{2}} \left( |00\rangle + |11\rangle \right)
$$

在 `quantum-simulator.ts` 的演示中，通过 `H(0)` 后接 `CNOT(0,1)` 即可制备该态：

```typescript
const bellCircuit = new QuantumCircuitV2(2);
bellCircuit.h(0).cnot(0, 1);
```

---

## 量子门数学原理

> 本节内容对应 `quantum-gates-extended.ts` 与 `quantum-state-vector.ts` 中的矩阵生成与扩展逻辑。

### 1. 酉性约束

所有量子门都是**酉矩阵**（Unitary Matrix），满足：

$$
U^\dagger U = I
$$

其中 $U^\dagger$ 为 $U$ 的共轭转置。酉演化保证量子态的模长守恒，从而保证概率守恒。

### 2. 单量子比特门

#### Hadamard 门 H

创建均匀叠加态：

$$
H = \frac{1}{\sqrt{2}}
\begin{pmatrix}
1 & 1 \\
1 & -1
\end{pmatrix}
$$

对应代码：`Gates.H()`。

#### Pauli 门 X, Y, Z

$$
X = \begin{pmatrix} 0 & 1 \\ 1 & 0 \end{pmatrix}, \quad
Y = \begin{pmatrix} 0 & -i \\ i & 0 \end{pmatrix}, \quad
Z = \begin{pmatrix} 1 & 0 \\ 0 & -1 \end{pmatrix}
$$

#### 相位门 S 与 T

$$
S = \begin{pmatrix} 1 & 0 \\ 0 & i \end{pmatrix}, \quad
T = \begin{pmatrix} 1 & 0 \\ 0 & e^{i\pi/4} \end{pmatrix}
$$

#### 旋转门 Rx, Ry, Rz

绕各轴旋转角度 $\theta$：

$$
R_x(\theta) =
\begin{pmatrix}
\cos\frac{\theta}{2} & -i\sin\frac{\theta}{2} \\
-i\sin\frac{\theta}{2} & \cos\frac{\theta}{2}
\end{pmatrix}
$$

$$
R_y(\theta) =
\begin{pmatrix}
\cos\frac{\theta}{2} & -\sin\frac{\theta}{2} \\
\sin\frac{\theta}{2} & \cos\frac{\theta}{2}
\end{pmatrix}
$$

$$
R_z(\theta) =
\begin{pmatrix}
e^{-i\theta/2} & 0 \\
0 & e^{i\theta/2}
\end{pmatrix}
$$

#### 通用单量子门 U($\theta, \phi, \lambda$)

IBM Qiskit 等框架的标准通用门：

$$
U(\theta, \phi, \lambda) =
\begin{pmatrix}
\cos\frac{\theta}{2} & -e^{i\lambda}\sin\frac{\theta}{2} \\
e^{i\phi}\sin\frac{\theta}{2} & e^{i(\phi+\lambda)}\cos\frac{\theta}{2}
\end{pmatrix}
$$

对应代码：`Gates.U(theta, phi, lambda)`。

### 3. 多量子比特门

#### CNOT（受控非门）

$$
\text{CNOT} = |0\rangle\langle 0| \otimes I + |1\rangle\langle 1| \otimes X
= \begin{pmatrix}
1 & 0 & 0 & 0 \\
0 & 1 & 0 & 0 \\
0 & 0 & 0 & 1 \\
0 & 0 & 1 & 0
\end{pmatrix}
$$

当控制位为 $|1\rangle$ 时，翻转目标位。

`quantum-state-vector.ts` 中的 `expandCNOT(n, control, target)` 将该 $4 \times 4$ 矩阵扩展为 $2^n \times 2^n$ 的完整酉矩阵，确保在叠加态与纠缠态上正确演化。

#### SWAP 门

交换两个量子比特的状态：

$$
\text{SWAP} = \begin{pmatrix}
1 & 0 & 0 & 0 \\
0 & 0 & 1 & 0 \\
0 & 1 & 0 & 0 \\
0 & 0 & 0 & 1
\end{pmatrix}
$$

#### Toffoli 门（CCNOT）

双控制位均为 $|1\rangle$ 时翻转目标位。对应 $8 \times 8$ 矩阵。

#### CSWAP (Fredkin)

控制位为 $|1\rangle$ 时交换两个目标位。

### 4. 门扩展复杂度

`quantum-gates-extended.ts` 的 `@complexity_analysis` 指出：

> 每个门生成的时间与空间复杂度均为 $O(4^k)$，其中 $k$ 为门作用的量子比特数（$k=1,2,3$）。

而 `quantum-state-vector.ts` 中的 `applyGate` 为完整的矩阵-向量乘法：

> 时间复杂度 $O(4^n)$，空间复杂度 $O(2^n)$（状态向量存储）。

这意味着基于状态向量的完整模拟器仅适用于教学演示的小型系统（$n \le 10$）。

---

## 量子傅里叶变换 QFT

> 对应 `quantum-fourier-transform.ts`。

### 1. 数学定义

对 $n$ 量子比特系统，QFT 将计算基 $|j\rangle$ 变换为：

$$
\text{QFT}|j\rangle = \frac{1}{\sqrt{2^n}} \sum_{k=0}^{2^n-1} e^{2\pi i \cdot jk / 2^n} |k\rangle
$$

用矩阵表示，QFT 的元素为：

$$
U_{jk} = \frac{1}{\sqrt{2^n}} \exp\left( \frac{2\pi i \cdot jk}{2^n} \right)
$$

代码中 `buildQFTMatrix(n, inverse?)` 直接按此公式构造 $2^n \times 2^n$ 矩阵，时间 $O(4^n)$。

### 2. 物理电路实现

实际的量子计算机不会显式构造巨大矩阵，而是通过基本门级联实现 QFT：

```
for i = 0 to n-1:
  H(i)
  for j = 1 to n-i-1:
    CR(i, i+j, π/2^j)
```

即对每个量子比特施加 Hadamard 门，随后施加一系列**受控相位门**（Controlled-Phase）。

代码中的 `applyQFTCircuit` 实现了该级联逻辑，时间复杂度 $O(n^2)$（共 $O(n^2)$ 个单/双量子门）。

### 3. 逆 QFT (IQFT)

逆变换将频率基转回计算基，用于**量子相位估计**。只需将上述所有旋转角度取负，并反转执行顺序（加上 SWAP 网络以修正比特顺序）。

---

## Shor 算法

> 对应 `shor-algorithm.ts`。

### 1. 数学基础：因数分解 → 周期查找

Shor 算法的核心洞察是：整数 $N$ 的因数分解可归约为**模幂周期查找**（Order Finding）。

选取与 $N$ 互质的随机整数 $a$，寻找最小正整数 $r$ 使得：

$$
a^r \equiv 1 \pmod{N}
$$

若 $r$ 为偶数且 $a^{r/2} \not\equiv -1 \pmod{N}$，则：

$$
\gcd(a^{r/2} \pm 1, N)
$$

以高概率给出 $N$ 的非平凡因子。

### 2. 量子周期查找流程

1. **制备叠加态**：
   $$
   |\psi\rangle = \frac{1}{\sqrt{2^m}} \sum_{x=0}^{2^m-1} |x\rangle |a^x \bmod N\rangle
   $$

2. **测量第二个寄存器**：第一个寄存器坍缩为周期叠加态：
   $$
   |\phi\rangle \propto \sum_{k} |x_0 + k \cdot r\rangle
   $$

3. **应用 QFT**：将周期信息转换为频率峰。

4. **测量并提取周期**：测量结果以高概率近似 $j \cdot 2^m / r$，通过**连分数展开**（Continued Fraction）提取 $r$。

代码中的 `estimatePeriod(n, period)` 模拟了步骤 3-4：制备周期态后应用 QFT，再通过有理逼近恢复周期。

### 3. 复杂度分析

| 指标 | 复杂度 | 说明 |
|------|--------|------|
| 经典最优算法（数域筛法） | 次指数 $e^{O((\log N)^{1/3})}$ | 当前大整数分解标准 |
| Shor 量子算法 | $O((\log N)^3)$ | 多项式时间 |
| 模拟器空间 | $O(2^m)$ | $m$ 为量子寄存器位数（教学演示中 $m \le 4$）|

---

## Grover 算法

> 对应 `grover-search.ts`。

### 1. 数学基础：振幅放大

Grover 算法在未排序数据库中搜索目标项，提供相对于经典线性搜索的**二次加速**。

#### 初始化

将 $n$ 个量子比特制备为均匀叠加态：

$$
|s\rangle = H^{\otimes n} |0\rangle^{\otimes n} = \frac{1}{\sqrt{N}} \sum_{x=0}^{N-1} |x\rangle,
\quad N = 2^n
$$

#### Oracle

Oracle $O$ 为目标态 $|w\rangle$ 引入 $\pi$ 相位翻转：

$$
O = I - 2|w\rangle\langle w|
$$

对应代码中 `buildPhaseOracle(n, target)` 构造的对角矩阵：目标索引处为 $-1$，其余为 $+1$。

#### 扩散算子 (Diffusion Operator)

$$
D = 2|s\rangle\langle s| - I
$$

对应代码中 `buildDiffusionOperator(n)` 构造的矩阵，非对角元为 $2/N$，对角元为 $2/N - 1$。

#### 几何解释

定义 $|w\rangle$ 为正交于所有非目标态的向量，$|s'\rangle$ 为所有非目标态的均匀叠加。则 $|s\rangle$ 可分解为：

$$
|s\rangle = \sin\theta \, |w\rangle + \cos\theta \, |s'\rangle,
\quad \sin\theta = \frac{1}{\sqrt{N}}
$$

每次施加 $DO$（Oracle 后接 Diffusion），状态向量在由 $|w\rangle$ 与 $|s'\rangle$ 张成的二维平面上向 $|w\rangle$ 旋转 $2\theta$。

### 2. 最优迭代次数

为了使状态尽可能对齐 $|w\rangle$，需要的迭代次数为：

$$
k \approx \frac{\pi}{4\theta} = \frac{\pi}{4} \sqrt{N}
$$

当 $N \gg 1$ 时，$\theta \approx 1/\sqrt{N}$，因此：

$$
k \approx \frac{\pi}{4} \sqrt{N}
$$

代码中 `runGroverSearch` 即按此公式计算迭代次数：

```typescript
const iterations = Math.floor((Math.PI / 4) * Math.sqrt(N));
```

### 3. 复杂度分析

| 指标 | Grover | 经典搜索 |
|------|--------|----------|
| 时间复杂度 | $O(\sqrt{N})$ | $O(N)$ |
| 空间复杂度 | $O(N)$（状态向量） | $O(1)$ |
| 加速比 | 二次加速 | — |

---

## 算法复杂度汇总

| 模块 | 操作/算法 | 时间复杂度 | 空间复杂度 | 备注 |
|------|-----------|-----------|-----------|------|
| **状态向量模拟** | `applyGate` (完整矩阵) | $O(4^n)$ | $O(2^n)$ | 教学演示仅限 $n \le 10$ |
| **单/双/三量子门生成** | `Gates.X / CNOT / Toffoli` | $O(4^k)$ | $O(4^k)$ | $k$ 为作用比特数 |
| **QFT 矩阵构造** | `buildQFTMatrix` | $O(4^n)$ | $O(4^n)$ | 显式构造完整酉矩阵 |
| **QFT 电路级联** | `applyQFTCircuit` | $O(n^2)$ | $O(1)$ | 仅生成基本门序列 |
| **Grover 搜索** | `runGroverSearch` | $O(\sqrt{N})$ | $O(N)$ | 振幅放大，$N=2^n$ |
| **Shor 因数分解** | `runShorFactoring` | $O((\log N)^3)$ | $O(2^m)$ | $m$ 为寄存器规模 |

---

## 扩展代码示例

### 量子隐形传态 (Quantum Teleportation)

```typescript
// quantum-teleportation.ts — 模拟量子隐形传态协议
import { StateVector, Complex } from './quantum-state-vector';
import { Gates } from './quantum-gates-extended';

function quantumTeleportation(
  psi: StateVector // 待传输的单量子比特状态
): { aliceResult: [number, number]; bobState: StateVector } {
  // Alice 和 Bob 共享贝尔态 |Φ⁺⟩ = (|00⟩ + |11⟩)/√2
  const bell = new StateVector(2);
  bell.applyGate(Gates.H(), [0]);
  bell.applyGate(Gates.CNOT(), [0, 1]);

  // 三量子比特总状态: |ψ⟩ ⊗ |Φ⁺⟩
  const total = psi.tensorProduct(bell);

  // Alice 对前两个量子比特执行 CNOT 和 H
  total.applyGate(Gates.CNOT(), [0, 1]);
  total.applyGate(Gates.H(), [0]);

  // 模拟测量前两个量子比特（Alice 的量子比特）
  const aliceResult = total.measure([0, 1]);
  const [m1, m2] = aliceResult;

  // Bob 根据 Alice 的测量结果应用修正门
  const bobState = total.partialTrace([0, 1]);
  if (m2 === 1) bobState.applyGate(Gates.X(), [0]);
  if (m1 === 1) bobState.applyGate(Gates.Z(), [0]);

  return { aliceResult: [m1, m2], bobState };
}
```

### Deutsch-Jozsa 算法

```typescript
// deutsch-jozsa.ts — 判断函数是常函数还是平衡函数
function deutschJozsa(
  n: number,
  oracle: (x: number) => number // 黑盒函数: f: {0,1}ⁿ → {0,1}
): 'constant' | 'balanced' {
  const N = 1 << n;
  const state = new StateVector(n + 1);

  // 初始化: 前 n 个量子比特置 |0⟩，辅助量子比特置 |1⟩
  // 全部施加 H 门
  for (let i = 0; i <= n; i++) {
    state.applyGate(Gates.H(), [i]);
  }

  // 应用 Oracle: U_f|x,y⟩ = |x, y ⊕ f(x)⟩
  const oracleMatrix = buildDeutschJozsaOracle(n, oracle);
  state.applyGate(oracleMatrix, Array.from({ length: n + 1 }, (_, i) => i));

  // 对前 n 个量子比特施加 H
  for (let i = 0; i < n; i++) {
    state.applyGate(Gates.H(), [i]);
  }

  // 测量前 n 个量子比特
  const measurements = [];
  for (let i = 0; i < n; i++) {
    measurements.push(state.measureSingleQubit(i));
  }

  // 如果全为 0，则是常函数；否则是平衡函数
  return measurements.every((m) => m === 0) ? 'constant' : 'balanced';
}

// 经典情况需要最多 2^(n-1) + 1 次查询，量子算法只需 1 次
```

### 变分量子本征求解器 (VQE) 轮廓

```typescript
// variational-quantum-eigensolver.ts — 使用经典优化器寻找基态能量
interface VQEParams {
  numQubits: number;
  ansatzLayers: number; //  ansatz 层数
  hamiltonian: Complex[][]; // 目标哈密顿量矩阵
}

function buildAnsatz(params: number[], n: number, layers: number): Complex[][] {
  // 硬件高效 ansatz: 每层 Ry + Rz 旋转 + CNOT 纠缠
  // 参数数量: 2 * n * layers
  // 返回完整的酉矩阵
  // ...
}

function vqeEnergy(
  params: number[],
  { numQubits, ansatzLayers, hamiltonian }: VQEParams
): number {
  const ansatz = buildAnsatz(params, numQubits, ansatzLayers);
  const state = new StateVector(numQubits);
  state.applyGate(ansatz, Array.from({ length: numQubits }, (_, i) => i));

  // E = ⟨ψ|H|ψ⟩
  const energy = state.expectationValue(hamiltonian);
  return energy.real;
}

// 使用经典优化器（如 COBYLA 或梯度下降）最小化能量
// const optimalParams = minimize(vqeEnergy, initialGuess);
// const groundStateEnergy = vqeEnergy(optimalParams, vqeConfig);
```

### Bernstein-Vazirani 算法

```typescript
// bernstein-vazirani.ts — 通过一次查询恢复隐藏字符串
function bernsteinVazirani(hiddenString: string): string {
  const n = hiddenString.length;
  const state = new StateVector(n + 1);

  // 初始化 |0⟩^{⊗n}|1⟩
  state.applyGate(Gates.X(), [n]);
  for (let i = 0; i <= n; i++) {
    state.applyGate(Gates.H(), [i]);
  }

  // Oracle: f(x) = s · x (mod 2)
  const s = parseInt(hiddenString, 2);
  const oracleMatrix = buildBVOracle(n, s);
  state.applyGate(oracleMatrix, Array.from({ length: n + 1 }, (_, i) => i));

  // H^{⊗n} 变换
  for (let i = 0; i < n; i++) {
    state.applyGate(Gates.H(), [i]);
  }

  // 测量直接得到 s
  const result = [];
  for (let i = 0; i < n; i++) {
    result.push(state.measureSingleQubit(i));
  }
  return result.join('');
}
// 经典情况需要 n 次查询，量子算法只需 1 次
```

### 量子相位估计 (QPE) 实现

```typescript
// quantum-phase-estimation.ts — 估计本征值的相位
function quantumPhaseEstimation(
  unitary: Complex[][],
  eigenstate: StateVector,
  precisionBits: number
): number {
  const n = precisionBits;
  const state = new StateVector(n).applyGate(Gates.H(), Array.from({ length: n }, (_, i) => i));
  const combined = state.tensorProduct(eigenstate);

  // 受控酉操作: 对第 i 个控制位施加 U^(2^i)
  for (let i = 0; i < n; i++) {
    const power = 1 << i;
    const uPower = matrixPower(unitary, power);
    // 受控应用 uPower 到 eigenstate 寄存器
    combined.applyControlledGate(uPower, [i], Array.from({ length: eigenstate.qubits }, (_, j) => n + j));
  }

  // 逆 QFT 到前 n 个量子比特
  applyInverseQFT(combined, n);

  // 测量前 n 个量子比特得到相位估计
  let measured = 0;
  for (let i = 0; i < n; i++) {
    measured = (measured << 1) | combined.measureSingleQubit(i);
  }
  return measured / (1 << n); // 相位 ∈ [0, 1)
}
```

### 三量子比特量子纠错码 (Bit-Flip Code)

```typescript
// quantum-error-correction.ts — 3-qubit bit-flip 纠错码
function encodeBitFlip(state: StateVector): StateVector {
  // |ψ⟩ = α|0⟩ + β|1⟩ → α|000⟩ + β|111⟩
  const encoded = state.tensorProduct(new StateVector(2));
  encoded.applyGate(Gates.CNOT(), [0, 1]);
  encoded.applyGate(Gates.CNOT(), [0, 2]);
  return encoded;
}

function measureSyndrome(state: StateVector): [number, number] {
  // 使用辅助量子比特测量稳定子生成元
  // Z1 Z2 和 Z2 Z3 的测量结果指示错误位置
  const ancilla = new StateVector(2);
  const combined = state.tensorProduct(ancilla);

  // 简化的 syndrome 提取逻辑
  const s1 = (state.measureSingleQubit(0) ^ state.measureSingleQubit(1));
  const s2 = (state.measureSingleQubit(1) ^ state.measureSingleQubit(2));
  return [s1, s2];
}

function correctBitFlip(state: StateVector, syndrome: [number, number]): StateVector {
  const [s1, s2] = syndrome;
  if (s1 === 1 && s2 === 1) state.applyGate(Gates.X(), [0]);
  else if (s1 === 1 && s2 === 0) state.applyGate(Gates.X(), [1]);
  else if (s1 === 0 && s2 === 1) state.applyGate(Gates.X(), [2]);
  return state;
}
```

---

## 参考实现文件

- `quantum-state-vector.ts` — 复数、态矢量、张量积、矩阵扩展
- `quantum-gates-extended.ts` — 单/多量子比特门矩阵定义
- `quantum-simulator.ts` — `QuantumCircuitV2`、测量、BB84 协议
- `quantum-fourier-transform.ts` — QFT / IQFT 矩阵与电路实现
- `grover-search.ts` — Grover 搜索的 Oracle 与扩散算子
- `shor-algorithm.ts` — 周期态制备、QFT 周期提取、因数分解
- `quantum-teleportation.ts` — 贝尔态共享与经典通信传态
- `deutsch-jozsa.ts` — 常函数/平衡函数判定
- `bernstein-vazirani.ts` — 隐藏字符串恢复
- `variational-quantum-eigensolver.ts` — VQE 参数化电路与能量最小化
- `quantum-error-correction.ts` — 量子纠错码基础
- `quantum-phase-estimation.ts` — 量子相位估计实现

---

## 模块代码文件索引

本模块包含以下可运行 TypeScript 代码文件，用于将上述理论概念转化为实践：

- `bernstein-vazirani.ts`
- `deutsch-jozsa.ts`
- `grover-search.ts`
- `index.ts`
- `quantum-error-correction.ts`
- `quantum-fourier-transform.ts`
- `quantum-gates-extended.ts`
- `quantum-gates.ts`
- `quantum-phase-estimation.ts`
- `quantum-simulator.ts`
- `quantum-state-vector.ts`
- `quantum-teleportation.ts`
- `shor-algorithm.ts`
- `variational-quantum-eigensolver.ts`

> 💡 **学习建议**：阅读 THEORY.md 后，逐一运行上述代码文件，观察理论概念的实际行为。修改参数和边界条件，加深理解。

## 核心理论深化

### 关键设计模式

本模块涉及的核心设计模式包括（根据代码实现提炼）：

1. **模式一**：待根据代码具体分析
2. **模式二**：待根据代码具体分析
3. **模式三**：待根据代码具体分析

### 与相邻模块的关系

| 相邻模块 | 关系说明 |
|---------|---------|
| 前置依赖 | 建议先掌握的基础模块 |
| 后续进阶 | 可继续深化的相关模块 |

---

## 权威参考链接

| 资源 | 描述 | 链接 |
|------|------|------|
| **Qiskit Textbook** | IBM 量子计算开源教材 | [qiskit.org/learn](https://qiskit.org/learn/) |
| **IBM Quantum** | 云端量子计算平台与文档 | [quantum.ibm.com](https://quantum.ibm.com/) |
| **Google Quantum AI** | 量子霸权与量子纠错研究 | [quantumai.google](https://quantumai.google/) |
| **Microsoft Azure Quantum** | 量子开发工具与云服务 | [azure.microsoft.com/quantum](https://azure.microsoft.com/en-us/products/quantum/) |
| **Quirk Quantum Simulator** | 交互式量子电路模拟器 | [algassert.com/quirk](https://algassert.com/quirk) |
| **Quantum Computing Stack Exchange** | 量子计算问答社区 | [quantumcomputing.stackexchange.com](https://quantumcomputing.stackexchange.com/) |
| **Nielsen & Chuang** | 《量子计算与量子信息》— 领域圣经 | [Cambridge University Press](https://www.cambridge.org/highereducation/books/quantum-computation-and-quantum-information/01E10196D0A682A6AEFFEA52D53A9E14) |
| **Preskill Lecture Notes** | John Preskill 量子信息讲义 | [theory.caltech.edu/~preskill/ph219](http://theory.caltech.edu/~preskill/ph219/ph219_2020-21.html) |
| **arXiv quant-ph** | 量子物理预印本论文库 | [arxiv.org/list/quant-ph/recent](https://arxiv.org/list/quant-ph/recent) |
| **Q# Documentation** | Microsoft 量子编程语言 | [docs.microsoft.com/azure/quantum](https://docs.microsoft.com/en-us/azure/quantum/) |
| **Cirq Documentation** | Google 量子编程框架 | [quantumai.google/cirq](https://quantumai.google/cirq) |
| **PennyLane** | 量子机器学习与变分算法平台 | [pennylane.ai](https://pennylane.ai/) |
| **Quantum Open Source Foundation** | 量子开源软件清单 | [qosf.org](https://qosf.org/) |
| **Error Correction Zoo** | 量子纠错码分类学 | [errorcorrectionzoo.org](https://errorcorrectionzoo.org/) |
| **QWorld (QBronze/QSilver)** | 量子计算入门课程 | [qworld.net](https://qworld.net/) |
| **MIT OpenCourseWare — Quantum Computation** | 课程讲义与作业 | [ocw.mit.edu/courses/8-370x-quantum-information-science-i-spring-2018](https://ocw.mit.edu/courses/8-370x-quantum-information-science-i-spring-2018/) |
| **Stim — Quantum Error Correction Simulator** | Google 表面码模拟器 | [github.com/quantumlib/Stim](https://github.com/quantumlib/Stim) |
| **tket Compiler** | Cambridge Quantum 量子编译器 | [cqcl.github.io/tket](https://cqcl.github.io/tket-site/api-docs/) |

---

> 📅 理论深化更新：2026-04-30
