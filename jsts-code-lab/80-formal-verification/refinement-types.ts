/**
 * @file 精化类型模拟
 * @category Formal Verification → Refinement Types
 * @difficulty hard
 * @tags refinement-types, branded-types, runtime-check, liquid-types, predicate-types
 * @description
 * 在 TypeScript 的类型层面模拟精化类型（Refinement Types），通过 branded types 与
 * 断言函数实现运行时的谓词检查，将「满足谓词 P 的值 T」在类型系统中显式标记出来。
 *
 * @theoretical_basis
 * - **Refinement Types**: Freeman 与 Pfenning 提出的类型系统扩展，形式为 `{v: T | P(v)}`。
 *   Liquid Types 是其自动推断变体（Rondon, Kawaguchi, Jhala）。
 * - **Branded Types**: TypeScript 结构类型系统中利用唯一属性标签（brand）实现名义子类型的技巧。
 * - **Assertion Functions**: TypeScript 的 `asserts condition` 与 `asserts x is T` 允许在
 *   控制流中缩小类型，模拟轻量级证明。
 */

// ---------------------------------------------------------------------------
// Branded Type 基础
// ---------------------------------------------------------------------------

declare const __brand: unique symbol;

type Brand<B> = { [__brand]: B };

export type Branded<T, B> = T & Brand<B>;

// ---------------------------------------------------------------------------
// 正整数精化类型 PositiveInt = { v: number | v > 0 }
// ---------------------------------------------------------------------------

export type PositiveInt = Branded<number, 'PositiveInt'>;

export function assertPositiveInt(n: number): asserts n is PositiveInt {
  if (!Number.isFinite(n) || n <= 0) {
    throw new Error(`Refinement type violation: ${n} is not a PositiveInt`);
  }
}

export function asPositiveInt(n: number): PositiveInt {
  assertPositiveInt(n);
  return n;
}

// ---------------------------------------------------------------------------
// 非空数组精化类型 NonEmptyArray<T> = { v: T[] | v.length > 0 }
// ---------------------------------------------------------------------------

export type NonEmptyArray<T> = Branded<T[], 'NonEmptyArray'>;

export function assertNonEmptyArray<T>(arr: T[]): asserts arr is NonEmptyArray<T> {
  if (arr.length === 0) {
    throw new Error(`Refinement type violation: array is empty`);
  }
}

export function asNonEmptyArray<T>(arr: T[]): NonEmptyArray<T> {
  assertNonEmptyArray(arr);
  return arr;
}

// ---------------------------------------------------------------------------
// 范围整数 RangeInt<Min, Max> = { v: number | Min ≤ v ≤ Max }
// ---------------------------------------------------------------------------

export type RangeInt<Min extends number, Max extends number> = Branded<number, `RangeInt[${Min},${Max}]`>;

export function assertRangeInt<Min extends number, Max extends number>(
  n: number,
  min: Min,
  max: Max
): asserts n is RangeInt<Min, Max> {
  if (!Number.isInteger(n) || n < min || n > max) {
    throw new Error(`Refinement type violation: ${n} is not in [${min}, ${max}]`);
  }
}

export function asRangeInt<Min extends number, Max extends number>(n: number, min: Min, max: Max): RangeInt<Min, Max> {
  assertRangeInt(n, min, max);
  return n as RangeInt<Min, Max>;
}

// ---------------------------------------------------------------------------
// 偶数精化类型 EvenInt = { v: number | v mod 2 = 0 }
// ---------------------------------------------------------------------------

export type EvenInt = Branded<number, 'EvenInt'>;

export function assertEvenInt(n: number): asserts n is EvenInt {
  if (!Number.isInteger(n) || n % 2 !== 0) {
    throw new Error(`Refinement type violation: ${n} is not an EvenInt`);
  }
}

export function asEvenInt(n: number): EvenInt {
  assertEvenInt(n);
  return n;
}

// ---------------------------------------------------------------------------
// 精化类型安全的运算（仅在类型合法的值之间操作）
// ---------------------------------------------------------------------------

export function safeDivide(dividend: number, divisor: PositiveInt): number {
  return dividend / divisor;
}

export function safeHead<T>(arr: NonEmptyArray<T>): T {
  return arr[0];
}

export function safeFactorial(n: PositiveInt): number {
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}

// ---------------------------------------------------------------------------
// 更高级的精化：排序数组 SortedArray<T>
// ---------------------------------------------------------------------------

export type SortedArray<T> = Branded<T[], 'SortedArray'>;

export function assertSortedArray(arr: number[]): asserts arr is SortedArray<number> {
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] < arr[i - 1]) {
      throw new Error(`Refinement type violation: array is not sorted`);
    }
  }
}

export function asSortedArray(arr: number[]): SortedArray<number> {
  assertSortedArray(arr);
  return arr;
}

export function binarySearchOnSorted(arr: SortedArray<number>, target: number): number {
  let left = 0;
  let right = arr.length - 1;
  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}

export function demo(): void {
  console.log('=== Refinement Types ===\n');

  const pos = asPositiveInt(42);
  console.log('PositiveInt:', pos);
  console.log('safeDivide(100, pos):', safeDivide(100, pos));

  const arr = asNonEmptyArray([10, 20, 30]);
  console.log('safeHead:', safeHead(arr));

  const range = asRangeInt(7, 1, 10);
  console.log('RangeInt[1,10]:', range);

  const even = asEvenInt(24);
  console.log('EvenInt:', even);

  const sorted = asSortedArray([1, 3, 5, 7, 9]);
  console.log('Binary search 7:', binarySearchOnSorted(sorted, 7));

  // 以下代码会在编译期或运行时报错：
  // safeDivide(10, 0); // TS 报错：0 不是 PositiveInt
  // asPositiveInt(-5); // 运行时报错
}
