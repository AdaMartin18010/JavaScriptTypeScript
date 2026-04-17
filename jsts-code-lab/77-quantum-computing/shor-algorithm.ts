/**
 * @file Shor 算法（简化版）
 * @category Quantum Computing → Algorithms
 * @difficulty hard
 * @tags shor-algorithm, period-finding, factoring, qft, modular-exponentiation
 * @description
 * 实现 Shor 算法中的量子周期查找（Order Finding）与完整因数分解流程。
 * 以 N=15 为例，演示如何通过量子加速将整数分解为素因子。
 * @mathematical_basis
 * Shor 算法将整数因数分解归约为"周期查找"问题：
 *   给定互质的 a 与 N，寻找最小正整数 r 使得 a^r ≡ 1 (mod N)。
 * 量子阶段：
 *   1. 制备均匀叠加态 |ψ⟩ = 1/√{2^m} Σ_{x=0}^{2^m-1} |x⟩|a^x mod N⟩。
 *   2. 测量第二个寄存器，第一个寄存器坍缩为周期叠加态
 *      |φ⟩ ∝ Σ_{k} |x_0 + k·r⟩。
 *   3. 对第一个寄存器应用 QFT：
 *      QFT|j⟩ = 1/√{2^m} Σ_{k=0}^{2^m-1} e^{2πi·jk/2^m} |k⟩。
 *   4. 测量结果以高概率给出 j·2^m/r 的近似值，通过连分数展开提取 r。
 * 经典后处理：
 *   若 r 为偶数且 a^{r/2} ≠ -1 (mod N)，则
 *   gcd(a^{r/2} ± 1, N) 即为 N 的非平凡因子。
 * @complexity_analysis
 * 经典因数分解为次指数时间（如数域筛法），Shor 算法为多项式时间 O((log N)^3)。
 * 本教学模拟器限制 m ≤ 4，空间复杂度 O(2^m)。
 */

import { ComplexNumber, QuantumCircuitV2, StateVector } from './quantum-simulator.js';
import { buildQFTMatrix, applyQFT } from './quantum-fourier-transform.js';

// 向后兼容：QFT 核心函数已迁移至 quantum-fourier-transform.ts
export { buildQFTMatrix, applyQFT } from './quantum-fourier-transform.js';

/** 模幂运算：计算 (base^exp) mod modulus */
function modPow(base: number, exp: number, modulus: number): number {
  let result = 1;
  let b = base % modulus;
  let e = exp;
  while (e > 0) {
    if (e & 1) result = (result * b) % modulus;
    b = (b * b) % modulus;
    e >>= 1;
  }
  return result;
}

/** 最大公约数 */
function gcd(a: number, b: number): number {
  while (b !== 0) {
    const t = a % b;
    a = b;
    b = t;
  }
  return a;
}

/** 制备一个具有给定周期的周期叠加态 |ψ⟩ ∝ Σ_k |k·r⟩ */
export function preparePeriodicState(n: number, period: number): StateVector {
  const size = 1 << n;
  const amplitudes: ComplexNumber[] = Array.from({ length: size }, () => ComplexNumber.zero());
  for (let i = 0; i < size; i += period) {
    amplitudes[i] = ComplexNumber.one();
  }
  const sv = StateVector.fromAmplitudes(amplitudes);
  sv.normalize();
  return sv;
}

/** 通过 QFT 测量提取周期（使用简单有理逼近） */
export function estimatePeriod(n: number, period: number): { measured: number; estimatedPeriod: number } {
  let measured = 0;
  // 若测得 0 则无法提取周期，重新采样直至非零
  while (measured === 0) {
    const circuit = new QuantumCircuitV2(n);
    circuit.stateVector = preparePeriodicState(n, period);
    applyQFT(circuit);
    measured = circuit.measureAll();
  }
  const frac = measured / (1 << n);
  let bestDenom = 1;
  let bestError = Infinity;
  for (let d = 1; d <= period * 2; d++) {
    const num = Math.round(frac * d);
    const error = Math.abs(frac - num / d);
    if (error < bestError) {
      bestError = error;
      bestDenom = d;
    }
  }
  return { measured, estimatedPeriod: bestDenom };
}

/**
 * 运行简化版 Shor 因数分解，目标是分解合数 N。
 * 本演示仅支持小规模 N（如 15），因为模拟器需要显式构造大矩阵。
 * 返回找到的因子与算法步骤记录。
 */
export function runShorFactoring(
  N: number,
  a?: number
): { success: boolean; factors: [number, number]; a: number; period: number; steps: string[] } {
  const steps: string[] = [];
  steps.push(`目标: 分解 N = ${N}`);

  // 随机选择 a
  let base = a ?? 0;
  if (!base || base <= 1 || base >= N) {
    const candidates = [];
    for (let i = 2; i < N; i++) {
      if (gcd(i, N) === 1) candidates.push(i);
    }
    base = candidates[Math.floor(Math.random() * candidates.length)];
  }
  steps.push(`随机选择 a = ${base}，且 gcd(${base}, ${N}) = ${gcd(base, N)}`);

  const g = gcd(base, N);
  if (g > 1) {
    return { success: true, factors: [g, N / g], a: base, period: 0, steps };
  }

  // 量子周期查找：模拟制备 f(x)=a^x mod N 的周期态
  // 为教学演示，我们用小寄存器规模 m（N=15 时周期为 4，可用 m=4）
  const m = 4;
  const size = 1 << m;

  // 构造函数值表，找到周期 r
  const values = new Map<number, number[]>();
  for (let x = 0; x < size; x++) {
    const v = modPow(base, x, N);
    if (!values.has(v)) values.set(v, []);
    values.get(v)!.push(x);
  }

  // 模拟测量第二个寄存器，第一个寄存器坍缩为周期叠加态
  const [, xs] = Array.from(values.entries())[0];
  const r = xs[1] - xs[0];
  steps.push(`模拟测量得到函数值，推断周期 r = ${r}`);
  steps.push(`验证: ${base}^${r} mod ${N} = ${modPow(base, r, N)}`);

  if (r % 2 === 1) {
    steps.push('周期为奇数，本次运行失败，需要重试。');
    return { success: false, factors: [1, N], a: base, period: r, steps };
  }

  const halfPow = modPow(base, r / 2, N);
  if (halfPow === N - 1) {
    steps.push(`a^{r/2} ≡ -1 (mod N)，本次运行失败，需要重试。`);
    return { success: false, factors: [1, N], a: base, period: r, steps };
  }

  const p1 = gcd(halfPow - 1, N);
  const p2 = gcd(halfPow + 1, N);
  steps.push(`计算因子: gcd(${halfPow} - 1, ${N}) = ${p1}`);
  steps.push(`计算因子: gcd(${halfPow} + 1, ${N}) = ${p2}`);

  if (p1 > 1 && p1 < N && p2 > 1 && p2 < N) {
    return { success: true, factors: [p1, p2], a: base, period: r, steps };
  }

  return { success: false, factors: [1, N], a: base, period: r, steps };
}

export function demo(): void {
  console.log('=== Shor 算法（因数分解演示） ===\n');

  const N = 15;
  console.log(`目标: 将 ${N} 分解为两个素因子的乘积。`);

  // 使用 QFT 提取周期演示
  const n = 4;
  const period = 4;
  console.log(`\n--- QFT 周期提取演示 ---`);
  console.log(`制备周期为 ${period} 的周期态（${n} 量子比特）`);
  const result = estimatePeriod(n, period);
  console.log('QFT 测量值:', result.measured);
  console.log('估算周期:', result.estimatedPeriod);

  // 完整因数分解
  console.log(`\n--- 完整 Shor 因数分解 (N=${N}) ---`);
  for (const a of [7, 11, 13]) {
    const res = runShorFactoring(N, a);
    console.log(`\n尝试 a = ${a}:`);
    res.steps.forEach((s) => { console.log('  ' + s); });
    if (res.success) {
      console.log(`  => 成功分解: ${N} = ${res.factors[0]} × ${res.factors[1]}`);
    } else {
      console.log('  => 失败，需重试');
    }
  }
}
