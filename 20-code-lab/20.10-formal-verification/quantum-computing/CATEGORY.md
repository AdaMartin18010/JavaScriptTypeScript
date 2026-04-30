---
dimension: 应用领域
application-domain: ML 工程与科学计算
created: 2026-04-27
---

# 维度标注

- **所属维度**: 应用领域（Application Domain）
- **应用域**: 量子计算 — 量子模拟、量子门与量子算法
- **模块编号**: 77-quantum-computing

## 边界说明

本模块聚焦量子计算的 TypeScript 模拟实现，包括：

- 量子态向量与量子门操作
- 量子算法（Grover、Shor、Deutsch-Jozsa）
- 量子纠错与变分量子特征求解器

真实量子硬件编程和量子力学理论推导不属于本模块范围。

## 子模块目录结构

| 子模块 | 说明 | 典型文件 |
|--------|------|----------|
| `quantum-gates/` | 量子门操作与矩阵表示 | `hadamard.ts`, `cnot.ts`, `phase-shift.ts` |
| `quantum-algorithms/` | 经典量子算法模拟 | `grover-search.ts`, `shor-period.ts`, `deutsch-jozsa.ts` |
| `quantum-circuits/` | 量子电路构建与可视化 | `circuit-builder.ts`, `qasm-export.ts` |
| `error-correction/` | 量子纠错码模拟 | `shor-code.ts`, `steane-code.ts` |

## 量子编程库对比

| 特性 | Qiskit (Python) | Cirq (Python) | PennyLane | 本模块 (TS/JS) |
|------|-----------------|---------------|-----------|----------------|
| **语言** | Python | Python | Python | TypeScript |
| **目标硬件** | IBM Quantum | Google Sycamore | 多后端 (IBM/Rigetti) | 纯模拟 |
| **本地模拟** | ✅ Aer 模拟器 | ✅ qsim | ✅ 内置 | ✅ 自定义态向量 |
| **自动微分** | ❌ | ❌ | ✅ | ❌ |
| **可视化** | ✅ 成熟 | ✅ 中等 | ✅ 中等 | ⚠️ 基础 |
| **社区规模** | 最大 | 大 | 中等 | 最小 |
| **适用场景** | 学术研究/工业 | NISQ 算法 | 量子机器学习 | 教学/前端可视化 |

## 代码示例

### 单量子比特态向量

```typescript
// quantum-state.ts — 单量子比特态向量表示
class Qubit {
  // 态向量: α|0⟩ + β|1⟩，用复数近似 [real, imag]
  constructor(
    public alpha: [number, number] = [1, 0], // |0⟩ 概率幅
    public beta: [number, number] = [0, 0]   // |1⟩ 概率幅
  ) {}

  /** 应用 Hadamard 门: H = 1/√2 [[1,1],[1,-1]] */
  hadamard(): Qubit {
    const s = 1 / Math.sqrt(2);
    const a0 = this.alpha, a1 = this.beta;
    return new Qubit(
      [s * (a0[0] + a1[0]), s * (a0[1] + a1[1])],
      [s * (a0[0] - a1[0]), s * (a0[1] - a1[1])]
    );
  }

  /** 测量概率（Born 规则） */
  measure0(): number {
    return this.alpha[0] ** 2 + this.alpha[1] ** 2;
  }

  toString(): string {
    const fmt = (c: [number, number]) =>
      c[1] === 0 ? c[0].toFixed(3) : `(${c[0].toFixed(3)}+${c[1].toFixed(3)}i)`;
    return `${fmt(this.alpha)}|0⟩ + ${fmt(this.beta)}|1⟩`;
  }
}

// 演示：|0⟩ → H → 叠加态
const q0 = new Qubit();
const q1 = q0.hadamard();
console.log(q1.toString()); // ≈ 0.707|0⟩ + 0.707|1⟩
console.log('P(|0⟩) =', q1.measure0().toFixed(3)); // ≈ 0.500
```

### 多量子比特与 CNOT 门

```typescript
// multi-qubit.ts — 两量子比特与受控非门
function cnot(control: Qubit, target: Qubit): [Qubit, Qubit] {
  // 若 control 为 |1⟩，则翻转 target
  const cProb = control.measure0();
  const isOne = cProb < 0.5; // 简化判断

  if (isOne) {
    // 翻转 target: 交换 alpha 与 beta
    return [control, new Qubit(target.beta, target.alpha)];
  }
  return [control, target];
}

// Bell 态制备: |00⟩ → H⊗I → CNOT → (|00⟩+|11⟩)/√2
const qA = new Qubit().hadamard();
const qB = new Qubit();
const [bellA, bellB] = cnot(qA, qB);
console.log('Bell state prepared');
```

### Grover 搜索算法模拟

```typescript
// grover-search.ts — 在 N=4 数据库中搜索标记项
function groverOracle(target: number): (x: number) => number {
  // 当 x === target 时相位翻转
  return (x: number) => (x === target ? -1 : 1);
}

function groverDiffusion(probabilities: number[]): number[] {
  const mean = probabilities.reduce((a, b) => a + b, 0) / probabilities.length;
  return probabilities.map((p) => 2 * mean - p);
}

function simulateGrover(nQubits: number, target: number): number {
  const N = 2 ** nQubits;
  // 初始化均匀叠加态
  let amps = new Array(N).fill(1 / Math.sqrt(N));
  const oracle = groverOracle(target);

  const iterations = Math.round((Math.PI / 4) * Math.sqrt(N));
  for (let i = 0; i < iterations; i++) {
    // Oracle: 标记目标项
    amps = amps.map((a, x) => a * oracle(x));
    // Diffusion: 关于平均值反射
    amps = groverDiffusion(amps);
  }

  // 返回概率最大的索引
  return amps.indexOf(Math.max(...amps.map(Math.abs)));
}

console.log(simulateGrover(2, 2)); // 在 4 个元素中搜索 2，高概率返回 2
```

### 量子傅里叶变换 (QFT) 模拟

```typescript
// qft.ts — 量子傅里叶变换 TypeScript 模拟
function qft(amplitudes: [number, number][]): [number, number][] {
  const N = amplitudes.length;
  const result: [number, number][] = new Array(N).fill(0).map(() => [0, 0]);
  for (let k = 0; k < N; k++) {
    let real = 0, imag = 0;
    for (let j = 0; j < N; j++) {
      const angle = (2 * Math.PI * j * k) / N;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const [ajR, ajI] = amplitudes[j];
      real += ajR * cos + ajI * sin;
      imag += ajI * cos - ajR * sin;
    }
    result[k] = [real / Math.sqrt(N), imag / Math.sqrt(N)];
  }
  return result;
}

// 验证：QFT 作用于 |1⟩ 基态
const input: [number, number][] = [[0, 0], [1, 0], [0, 0], [0, 0]];
const output = qft(input);
console.log('QFT output:', output.map(c => `(${c[0].toFixed(3)}, ${c[1].toFixed(3)})`).join(', '));
```

### Shor 算法周期查找模拟

```typescript
// shor-period.ts — 经典模拟 Shor 周期查找
function modularExp(base: number, exp: number, mod: number): number {
  let result = 1;
  let b = base % mod;
  let e = exp;
  while (e > 0) {
    if (e & 1) result = (result * b) % mod;
    b = (b * b) % mod;
    e >>= 1;
  }
  return result;
}

function findPeriodClassical(a: number, N: number): number {
  let r = 1;
  let current = a % N;
  while (current !== 1) {
    current = (current * a) % N;
    r++;
    if (r > N) return -1;
  }
  return r;
}

// 模拟：分解 N=15，选 a=7，期望周期 r=4
const period = findPeriodClassical(7, 15);
console.log(`Period of 7^x mod 15 = ${period}`);
// 若 r 为偶数，可计算 gcd(a^(r/2) ± 1, N) 得到因子
```

### Deutsch-Jozsa 算法模拟

```typescript
// deutsch-jozsa.ts — 判断函数是常数还是平衡
function deutschJozsa(n: number, f: (x: number) => number): 'constant' | 'balanced' {
  const N = 2 ** n;
  // 初始化为 |0...0⟩，最后一位为 |1⟩
  let amps: [number, number][] = new Array(N).fill([0, 0]);
  amps[0] = [1 / Math.sqrt(N / 2), 0];
  amps[N - 1] = [1 / Math.sqrt(N / 2), 0];

  // 量子 Oracle 查询（模拟）
  let sum = 0;
  for (let x = 0; x < N; x++) {
    sum += (-1) ** f(x);
  }

  // 若所有 f(x) 相同，sum = ±N；否则 sum = 0
  return Math.abs(sum) === N ? 'constant' : 'balanced';
}

// 测试常数函数 f(x)=0
console.log(deutschJozsa(2, () => 0)); // 'constant'

// 测试平衡函数 f(x)=x % 2
console.log(deutschJozsa(2, x => x % 2)); // 'balanced'
```

### 量子噪声与退相干模拟

```typescript
// noise-model.ts — 简化的退极化噪声
function depolarize(qubit: Qubit, p: number): Qubit {
  // 以概率 p 施加随机 Pauli 噪声（简化：仅翻转振幅符号）
  if (Math.random() < p) {
    return new Qubit([-qubit.alpha[0], -qubit.alpha[1]], qubit.beta);
  }
  return qubit;
}

// 在 Grover 迭代中注入噪声观察性能衰减
const noisyAmps = simulateGrover(3, 5); // 8 元素搜索
console.log('Noisy search result:', noisyAmps);
```

### 量子纠缠态制备（GHZ 态）

```typescript
// ghz-state.ts — Greenberger-Horne-Zeilinger 态
function prepareGHZ(n: number): [number, number][] {
  const N = 2 ** n;
  const state: [number, number][] = new Array(N).fill([0, 0]);
  state[0] = [1 / Math.sqrt(2), 0];       // |00...0⟩
  state[N - 1] = [1 / Math.sqrt(2), 0];   // |11...1⟩
  return state;
}

// GHZ 态是最大纠缠态，测量任意一个量子比特都会瞬间确定其他所有比特
const ghz3 = prepareGHZ(3);
console.log('GHZ(3) prepared:', ghz3.map((c, i) => `|${i.toString(2).padStart(3, '0')}⟩:${c[0].toFixed(3)}`).filter(s => !s.endsWith(':0.000')));
```

### 变分量子特征求解器 (VQE) 简化模拟

```typescript
// vqe-simplified.ts — 用经典优化器寻找基态能量
function expectationValue(params: [number, number]): number {
  const [theta, phi] = params;
  // 模拟一个简单的哈密顿量期望值 <ψ(θ,φ)|H|ψ(θ,φ)>
  // H = Z⊗Z + X⊗I + I⊗X
  return Math.cos(theta) * Math.cos(phi) + 0.5 * Math.sin(theta) + 0.5 * Math.sin(phi);
}

// 梯度下降优化
function optimizeVQE(steps = 100, lr = 0.1): [number, number] {
  let params: [number, number] = [Math.random() * Math.PI, Math.random() * Math.PI];
  for (let i = 0; i < steps; i++) {
    const [t, p] = params;
    const gradT = -Math.sin(t) * Math.cos(p) + 0.5 * Math.cos(t);
    const gradP = -Math.cos(t) * Math.sin(p) + 0.5 * Math.cos(p);
    params = [t - lr * gradT, p - lr * gradP];
  }
  return params;
}

const optimal = optimizeVQE();
console.log('Optimal parameters:', optimal.map(x => x.toFixed(4)));
console.log('Ground state energy estimate:', expectationValue(optimal).toFixed(6));
```

## 权威参考链接

| 资源 | 类型 | 链接 |
|------|------|------|
| Qiskit Textbook | 教材 | [qiskit.org/learn](https://qiskit.org/learn) |
| Quantum Computing for Computer Scientists | 论文 | [arxiv:quant-ph/0304015](https://arxiv.org/abs/quant-ph/0304015) |
| Cirq Documentation | 文档 | [quantumai.google/cirq](https://quantumai.google/cirq) |
| PennyLane Docs | 文档 | [pennylane.ai](https://pennylane.ai) |
| IBM Quantum Learning | 课程 | [learning.quantum.ibm.com](https://learning.quantum.ibm.com) |
| Quirk Quantum Simulator | 可视化 | [algassert.com/quirk](https://algassert.com/quirk) — 浏览器内量子电路模拟器 |
| Nielsen & Chuang 教材 | 书籍 | Quantum Computation and Quantum Information — 领域圣经 |
| Microsoft Azure Quantum | 文档 | [learn.microsoft.com/azure/quantum](https://learn.microsoft.com/azure/quantum) |
| Q# Documentation | 文档 | [learn.microsoft.com/azure/quantum/qsharp](https://learn.microsoft.com/azure/quantum/qsharp) |
| Quantum Open Source Foundation | 社区 | [qosf.org](https://qosf.org) |
| MIT 6.845 Quantum Complexity Theory | 课程 | [ocw.mit.edu/courses/6-845-quantum-complexity-theory-fall-2010](https://ocw.mit.edu/courses/6-845-quantum-complexity-theory-fall-2010/) |
| Quantum Computing Stack Exchange | 社区 | [quantumcomputing.stackexchange.com](https://quantumcomputing.stackexchange.com) |
| arXiv quant-ph | 论文预印本 | [arxiv.org/list/quant-ph/recent](https://arxiv.org/list/quant-ph/recent) |
| Google Quantum AI Publications | 论文 | [ai.google/discover/quantum-ai](https://ai.google/discover/quantum-ai/) |
| Quantum Algorithm Zoo | 算法目录 | [quantumalgorithmzoo.org](https://quantumalgorithmzoo.org/) |
| Qiskit GitHub | 开源 | [github.com/Qiskit](https://github.com/Qiskit) |
| PennyLane GitHub | 开源 | [github.com/PennyLaneAI/pennylane](https://github.com/PennyLaneAI/pennylane) |
| Quantum Inspire — 欧洲量子云平台 | 平台 | [www.quantum-inspire.com](https://www.quantum-inspire.com/) |
| Amazon Braket 文档 | 文档 | [docs.aws.amazon.com/braket](https://docs.aws.amazon.com/braket/) |
| Unitary Fund — 量子开源社区 | 社区 | [unitary.fund](https://unitary.fund/) |

## 关联模块

- `76-ml-engineering` — ML 工程
- `30-knowledge-base/application-domains-index.md` — 应用领域总索引

---

*最后更新: 2026-04-30*
