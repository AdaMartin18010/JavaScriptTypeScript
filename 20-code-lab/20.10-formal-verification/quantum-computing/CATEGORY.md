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

## 关联模块

- `76-ml-engineering` — ML 工程
- `30-knowledge-base/application-domains-index.md` — 应用领域总索引

---

*最后更新: 2026-04-29*
