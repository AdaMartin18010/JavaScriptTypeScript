/**
 * @file 双轨快速排序：JS 动态类型版 vs TS 泛型类型安全版
 * @category JS/TS Comparison → Dual-Track Algorithms
 */

// ============================================================================
// JS 版：动态类型，compareFn 可选
// ============================================================================

export function jsQuickSort(arr: any[], compareFn?: (a: any, b: any) => number): any[] {
  if (arr.length <= 1) return [...arr];

  const cmp =
    compareFn ||
    ((a: any, b: any) => {
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    });

  const pivot = arr[0];
  const left: any[] = [];
  const right: any[] = [];
  const equal: any[] = [];

  for (const item of arr) {
    const diff = cmp(item, pivot);
    if (diff < 0) left.push(item);
    else if (diff > 0) right.push(item);
    else equal.push(item);
  }

  return [...jsQuickSort(left, cmp), ...equal, ...jsQuickSort(right, cmp)];
}

// ============================================================================
// TS 版：泛型约束，编译时类型安全
// ============================================================================

export function tsQuickSort<T>(arr: T[], compareFn?: (a: T, b: T) => number): T[] {
  if (arr.length <= 1) return [...arr];

  const cmp =
    compareFn ||
    ((a: T, b: T) => {
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    });

  const pivot = arr[0];
  const left: T[] = [];
  const right: T[] = [];
  const equal: T[] = [];

  for (const item of arr) {
    const diff = cmp(item, pivot);
    if (diff < 0) left.push(item);
    else if (diff > 0) right.push(item);
    else equal.push(item);
  }

  return [...tsQuickSort(left, cmp), ...equal, ...tsQuickSort(right, cmp)];
}
