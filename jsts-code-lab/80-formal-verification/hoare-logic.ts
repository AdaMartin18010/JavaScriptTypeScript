/**
 * @file Hoare 逻辑验证框架
 * @category Formal Verification → Hoare Logic
 * @difficulty hard
 * @tags hoare-triple, precondition, postcondition, loop-invariant, partial-correctness
 * @description
 * 实现 Hoare 三元组 `{P} C {Q}` 的运行时验证框架，支持前置条件、后置条件、
 * 循环不变量的断言检查。演示二分查找的完全正确性（partial + total correctness）。
 *
 * @theoretical_basis
 * - **Hoare Triple**: Tony Hoare 于 1969 年提出 `{P} C {Q}`，表示若前置条件 P 成立，
 *   执行命令 C 后后置条件 Q 成立。
 * - **Loop Invariant**: 循环不变量 I 满足：
 *   1. Initiation: P ⇒ I
 *   2. Maintenance: {I ∧ B} C {I}
 *   3. Termination: I ∧ ¬B ⇒ Q
 * - **Total Correctness**: 在部分正确性基础上增加终止性证明，通常依赖 well-founded
 *   递减函数（variant function）证明循环必终止。
 */

export class HoareLogic<T> {
  private preconditions: Array<(input: T) => boolean> = [];
  private postconditions: Array<(input: T, output: unknown) => boolean> = [];

  require(name: string, predicate: (input: T) => boolean): this {
    this.preconditions.push(predicate);
    return this;
  }

  ensure(name: string, predicate: (input: T, output: unknown) => boolean): this {
    this.postconditions.push(predicate);
    return this;
  }

  execute<R>(input: T, computation: (input: T) => R): R {
    // 验证前置条件（P）
    for (const pre of this.preconditions) {
      if (!pre(input)) {
        throw new Error(`Hoare precondition violated`);
      }
    }

    const output = computation(input);

    // 验证后置条件（Q）
    for (const post of this.postconditions) {
      if (!post(input, output)) {
        throw new Error(`Hoare postcondition violated`);
      }
    }

    return output;
  }
}

/**
 * 循环不变量监视器
 *
 * 用于在运行时检查循环不变量是否保持。
 */
export class LoopInvariantMonitor {
  static assert<T>(label: string, invariant: () => boolean): void {
    if (!invariant()) {
      throw new Error(`Loop invariant violated: ${label}`);
    }
  }
}

/**
 * 二分查找的完全正确性演示
 *
 * 前置条件：数组已排序
 * 后置条件：若返回值 ≥ 0，则 arr[return] = target；若返回 -1，则 target 不存在于数组
 * 循环不变量：
 *   1. 0 ≤ left ≤ right+1 ≤ n
 *   2. 若 target 存在于数组，则 target ∈ arr[left..right]
 * 终止函数：right - left + 1（每次迭代严格递减）
 */
export function verifiedBinarySearch(sortedArr: number[], target: number): number {
  const n = sortedArr.length;

  // 前置条件检查：数组必须有序
  for (let i = 1; i < n; i++) {
    if (sortedArr[i] < sortedArr[i - 1]) {
      throw new Error('Precondition failed: array must be sorted');
    }
  }

  let left = 0;
  let right = n - 1;

  while (left <= right) {
    // 循环不变量 I1: 0 ≤ left ≤ right+1 ≤ n
    LoopInvariantMonitor.assert('I1: bounds', () => left >= 0 && left <= right + 1 && right + 1 <= n);

    // 循环不变量 I2: target ∈ arr[left..right]（若存在）
    LoopInvariantMonitor.assert('I2: containment', () => {
      const found = sortedArr.findIndex(x => x === target);
      if (found === -1) return true;
      return found >= left && found <= right;
    });

    const mid = left + Math.floor((right - left) / 2);
    if (sortedArr[mid] === target) {
      // 后置条件：返回有效索引
      return mid;
    } else if (sortedArr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }

    // 终止性：right - left + 1 严格递减（well-founded ordering）
  }

  // 后置条件：返回 -1 表示未找到
  return -1;
}

/**
 * 插入排序的正确性演示
 *
 * 循环不变量（外层循环）：
 *   每次迭代开始时，子数组 arr[0..i-1] 已排序，且包含原数组 arr[0..i-1] 的所有元素。
 */
export function verifiedInsertionSort(arr: number[]): number[] {
  const result = [...arr];
  const n = result.length;

  for (let i = 1; i < n; i++) {
    // 外层不变量：result[0..i-1] 已排序
    LoopInvariantMonitor.assert('outer: sorted prefix', () => {
      for (let k = 1; k < i; k++) {
        if (result[k] < result[k - 1]) return false;
      }
      return true;
    });

    // 外层不变量：result[0..i-1] 是原数组的多重集子集
    LoopInvariantMonitor.assert('outer: permutation prefix', () => {
      const originalPrefix = arr.slice(0, i).sort((a, b) => a - b);
      const currentPrefix = result.slice(0, i).sort((a, b) => a - b);
      return JSON.stringify(originalPrefix) === JSON.stringify(currentPrefix);
    });

    const key = result[i];
    let j = i - 1;

    while (j >= 0 && result[j] > key) {
      result[j + 1] = result[j];
      j--;
    }
    result[j + 1] = key;
  }

  // 后置条件：整个数组已排序
  for (let i = 1; i < n; i++) {
    if (result[i] < result[i - 1]) {
      throw new Error('Postcondition failed: array not sorted');
    }
  }

  // 后置条件：是原数组的排列
  const sortedOriginal = [...arr].sort((a, b) => a - b);
  if (JSON.stringify(result) !== JSON.stringify(sortedOriginal)) {
    throw new Error('Postcondition failed: not a permutation');
  }

  return result;
}

export function demo(): void {
  console.log('=== Hoare Logic ===\n');

  const arr = [1, 3, 5, 7, 9, 11, 13];
  console.log('Binary search for 7:', verifiedBinarySearch(arr, 7));
  console.log('Binary search for 4:', verifiedBinarySearch(arr, 4));

  const unsorted = [5, 2, 4, 6, 1, 3];
  console.log('Insertion sort:', verifiedInsertionSort(unsorted));

  // Hoare 三元组显式验证
  const hoare = new HoareLogic<number>();
  hoare
    .require('non-negative', x => x >= 0)
    .ensure('sqrt-approx', (x, out) => Math.abs((out as number) ** 2 - x) < 0.001);

  const sqrtResult = hoare.execute(25, Math.sqrt);
  console.log('Hoare sqrt(25):', sqrtResult);
}
