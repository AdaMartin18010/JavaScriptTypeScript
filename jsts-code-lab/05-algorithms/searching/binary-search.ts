/**
 * @file 二分查找
 * @category Algorithms → Searching
 * @difficulty easy
 * @tags binary-search, divide-and-conquer, o-log-n
 */

// ============================================================================
// 1. 迭代实现
// ============================================================================

export function binarySearch<T>(
  arr: T[],
  target: T,
  compare?: (a: T, b: T) => number
): number {
  const compareFn = compare || ((a: T, b: T) => (a < b ? -1 : a > b ? 1 : 0));

  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2);
    const cmp = compareFn(arr[mid], target);

    if (cmp === 0) {
      return mid; // 找到目标
    } else if (cmp < 0) {
      left = mid + 1; // 目标在右半部分
    } else {
      right = mid - 1; // 目标在左半部分
    }
  }

  return -1; // 未找到
}

// ============================================================================
// 2. 递归实现
// ============================================================================

export function binarySearchRecursive<T>(
  arr: T[],
  target: T,
  compare?: (a: T, b: T) => number,
  left = 0,
  right = arr.length - 1
): number {
  const compareFn = compare || ((a: T, b: T) => (a < b ? -1 : a > b ? 1 : 0));

  if (left > right) {
    return -1;
  }

  const mid = left + Math.floor((right - left) / 2);
  const cmp = compareFn(arr[mid], target);

  if (cmp === 0) {
    return mid;
  } else if (cmp < 0) {
    return binarySearchRecursive(arr, target, compareFn, mid + 1, right);
  } else {
    return binarySearchRecursive(arr, target, compareFn, left, mid - 1);
  }
}

// ============================================================================
// 3. 查找第一个/最后一个
// ============================================================================

export function findFirst<T>(
  arr: T[],
  target: T,
  compare?: (a: T, b: T) => number
): number {
  const compareFn = compare || ((a: T, b: T) => (a < b ? -1 : a > b ? 1 : 0));

  let left = 0;
  let right = arr.length - 1;
  let result = -1;

  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2);
    const cmp = compareFn(arr[mid], target);

    if (cmp === 0) {
      result = mid;
      right = mid - 1; // 继续在左半部分查找
    } else if (cmp < 0) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return result;
}

export function findLast<T>(
  arr: T[],
  target: T,
  compare?: (a: T, b: T) => number
): number {
  const compareFn = compare || ((a: T, b: T) => (a < b ? -1 : a > b ? 1 : 0));

  let left = 0;
  let right = arr.length - 1;
  let result = -1;

  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2);
    const cmp = compareFn(arr[mid], target);

    if (cmp === 0) {
      result = mid;
      left = mid + 1; // 继续在右半部分查找
    } else if (cmp < 0) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return result;
}

// ============================================================================
// 4. 查找插入位置
// ============================================================================

export function searchInsert<T>(
  arr: T[],
  target: T,
  compare?: (a: T, b: T) => number
): number {
  const compareFn = compare || ((a: T, b: T) => (a < b ? -1 : a > b ? 1 : 0));

  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2);
    const cmp = compareFn(arr[mid], target);

    if (cmp === 0) {
      return mid;
    } else if (cmp < 0) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return left; // 应该插入的位置
}

// ============================================================================
// 5. 复杂度分析
// ============================================================================

/*
 * 时间复杂度: O(log n) - 每次将搜索范围减半
 * 空间复杂度:
 *   - 迭代: O(1)
 *   - 递归: O(log n) - 调用栈深度
 *
 * 前提条件: 数组必须是有序的
 */

// ============================================================================
// 6. 测试
// ============================================================================

if (import.meta.url === `file://${process.argv[1]}`) {
  const arr = [1, 3, 5, 7, 9, 11, 13, 15];

  console.log('Binary Search Tests:');
  console.log('Find 7:', binarySearch(arr, 7)); // 3
  console.log('Find 4:', binarySearch(arr, 4)); // -1
  console.log('Find first 7:', findFirst(arr, 7)); // 3
  console.log('Insert 6:', searchInsert(arr, 6)); // 3
}

// ============================================================================
// 导出
// ============================================================================

export { binarySearch as default };
