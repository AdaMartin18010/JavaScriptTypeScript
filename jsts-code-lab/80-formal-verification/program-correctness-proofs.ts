/**
 * @file 程序正确性证明
 * @category Formal Verification → Correctness Proofs
 * @difficulty hard
 * @tags loop-invariant, termination, euclidean-algorithm, quicksort, partial-correctness, total-correctness
 * @description
 * 展示几个经典算法的循环不变量与终止性证明，包括欧几里得算法（GCD）
 * 和快速排序的分区（Partition）过程。通过运行时断言模拟形式化证明步骤。
 *
 * @theoretical_basis
 * - **Partial Correctness**: 若程序终止，则结果满足后置条件。
 *   表达为 ⊢ {P} C {Q}。
 * - **Total Correctness**: 部分正确性 + 终止性，表达为 ⊢ [P] C [Q]。
 * - **Well-Founded Ordering**: 证明循环终止的标准方法是构造一个从状态到
 *   well-founded 集合（如自然数 ℕ）的递减函数（variant function）。
 * - **Floyd's Loop Invariant**: 循环不变量在三处检查：初始化前、每次迭代前、终止后。
 */

// ---------------------------------------------------------------------------
// 欧几里得算法（Euclidean Algorithm）
// ---------------------------------------------------------------------------

/**
 * 计算最大公约数（GCD）的欧几里得算法。
 *
 * 前置条件: a > 0 ∧ b > 0
 * 后置条件: result = gcd(a, b)
 *
 * 循环不变量:
 *   I1: a > 0 ∧ b > 0
 *   I2: gcd(a, b) = gcd(A, B)  （A, B 为原始输入）
 *
 * 终止函数（variant）: b
 *   每次迭代 b 严格递减且 b ≥ 0（well-founded on ℕ）
 */
export function verifiedGCD(a: number, b: number): number {
  if (a <= 0 || b <= 0) {
    throw new Error('Precondition failed: a and b must be positive');
  }

  const originalA = a;
  const originalB = b;

  while (b !== 0) {
    // 不变量 I1
    if (a <= 0 || b <= 0) {
      throw new Error('Invariant I1 violated');
    }

    // 不变量 I2: gcd(a, b) = gcd(originalA, originalB)
    const gcdBefore = gcd(a, b);
    const gcdOriginal = gcd(originalA, originalB);
    if (gcdBefore !== gcdOriginal) {
      throw new Error('Invariant I2 violated');
    }

    const oldB = b;
    const temp = b;
    b = a % b;
    a = temp;

    // 终止性检查：b 严格递减
    if (b >= 0 && b >= oldB && b !== 0) {
      throw new Error('Termination measure did not decrease');
    }
  }

  // 当 b = 0 时，gcd(a, 0) = a
  return a;
}

function gcd(x: number, y: number): number {
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x;
}

// ---------------------------------------------------------------------------
// 快速排序分区（QuickSort Partition）
// ---------------------------------------------------------------------------

/**
 * Lomuto 分区方案。
 *
 * 前置条件: arr 是数组，low 和 high 是有效索引，low ≤ high
 * 后置条件:
 *   - 返回的 pivotIndex 满足 low ≤ pivotIndex ≤ high
 *   - arr[low..pivotIndex-1] ≤ arr[pivotIndex]
 *   - arr[pivotIndex+1..high] ≥ arr[pivotIndex]
 *   - 分区后的 arr[low..high] 是原 arr[low..high] 的一个排列
 *
 * 循环不变量（for i 从 low 到 high-1）:
 *   I1: low ≤ i ≤ high
 *   I2: arr[low..storeIndex-1] ≤ pivot
 *   I3: arr[storeIndex..i-1] > pivot
 *   I4: arr[high] = pivot（pivot 位置不变）
 */
export function verifiedPartition(arr: number[], low: number, high: number): number {
  if (low < 0 || high >= arr.length || low > high) {
    throw new Error('Precondition failed: invalid indices');
  }

  const pivot = arr[high];
  let storeIndex = low;

  for (let i = low; i < high; i++) {
    // I1
    if (i < low || i > high) {
      throw new Error('Invariant I1 violated');
    }

    if (arr[i] <= pivot) {
      [arr[storeIndex], arr[i]] = [arr[i], arr[storeIndex]];
      storeIndex++;
    }

    // I2: arr[low..storeIndex-1] ≤ pivot
    for (let k = low; k < storeIndex; k++) {
      if (arr[k] > pivot) {
        throw new Error('Invariant I2 violated');
      }
    }

    // I3: arr[storeIndex..i] > pivot
    for (let k = storeIndex; k <= i; k++) {
      if (arr[k] <= pivot) {
        throw new Error('Invariant I3 violated');
      }
    }
  }

  [arr[storeIndex], arr[high]] = [arr[high], arr[storeIndex]];

  // 后置条件验证
  for (let k = low; k < storeIndex; k++) {
    if (arr[k] > arr[storeIndex]) {
      throw new Error('Postcondition violated: left side not ≤ pivot');
    }
  }
  for (let k = storeIndex + 1; k <= high; k++) {
    if (arr[k] < arr[storeIndex]) {
      throw new Error('Postcondition violated: right side not ≥ pivot');
    }
  }

  return storeIndex;
}

// ---------------------------------------------------------------------------
// 阶乘的循环不变量与终止性
// ---------------------------------------------------------------------------

/**
 * 阶乘计算。
 *
 * 前置条件: n ≥ 0
 * 后置条件: result = n!
 *
 * 循环不变量: result = i!
 * 终止函数: n - i（每次严格递减，下限 0）
 */
export function verifiedFactorial(n: number): number {
  if (n < 0 || !Number.isInteger(n)) {
    throw new Error('Precondition failed: n must be a non-negative integer');
  }

  let result = 1;
  for (let i = 1; i <= n; i++) {
    result *= i;

    // 不变量: result === i!
    let expected = 1;
    for (let j = 2; j <= i; j++) expected *= j;
    if (result !== expected) {
      throw new Error('Loop invariant violated: result != i!');
    }
  }

  // 后置条件: result === n!
  let expected = 1;
  for (let j = 2; j <= n; j++) expected *= j;
  if (result !== expected) {
    throw new Error('Postcondition violated');
  }

  return result;
}

export function demo(): void {
  console.log('=== Program Correctness Proofs ===\n');

  console.log('GCD(48, 18) =', verifiedGCD(48, 18));
  console.log('GCD(100, 35) =', verifiedGCD(100, 35));

  const arr = [3, 6, 8, 10, 1, 2, 1];
  const pivotIndex = verifiedPartition([...arr], 0, arr.length - 1);
  console.log('Partition pivot index:', pivotIndex);

  console.log('Factorial(5) =', verifiedFactorial(5));
}
