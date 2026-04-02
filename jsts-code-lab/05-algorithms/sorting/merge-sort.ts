/**
 * @file 归并排序
 * @category Algorithms → Sorting
 * @difficulty medium
 * @tags sorting, merge-sort, divide-and-conquer, stable
 */

// ============================================================================
// 1. 基础归并排序
// ============================================================================

export function mergeSort<T>(arr: T[], compare?: (a: T, b: T) => number): T[] {
  const compareFn = compare || ((a: T, b: T) => (a < b ? -1 : a > b ? 1 : 0));

  if (arr.length <= 1) return [...arr];

  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid), compareFn);
  const right = mergeSort(arr.slice(mid), compareFn);

  return merge(left, right, compareFn);
}

function merge<T>(left: T[], right: T[], compare: (a: T, b: T) => number): T[] {
  const result: T[] = [];
  let i = 0;
  let j = 0;

  while (i < left.length && j < right.length) {
    if (compare(left[i], right[j]) <= 0) {
      result.push(left[i]);
      i++;
    } else {
      result.push(right[j]);
      j++;
    }
  }

  // 添加剩余元素
  return result.concat(left.slice(i)).concat(right.slice(j));
}

// ============================================================================
// 2. 原地归并排序 (空间优化)
// ============================================================================

export function mergeSortInPlace<T>(
  arr: T[],
  compare?: (a: T, b: T) => number,
  left = 0,
  right = arr.length - 1,
  temp: T[] = []
): T[] {
  const compareFn = compare || ((a: T, b: T) => (a < b ? -1 : a > b ? 1 : 0));

  if (left >= right) return arr;

  const mid = Math.floor((left + right) / 2);
  mergeSortInPlace(arr, compareFn, left, mid, temp);
  mergeSortInPlace(arr, compareFn, mid + 1, right, temp);
  mergeInPlace(arr, left, mid, right, compareFn, temp);

  return arr;
}

function mergeInPlace<T>(
  arr: T[],
  left: number,
  mid: number,
  right: number,
  compare: (a: T, b: T) => number,
  temp: T[]
): void {
  // 复制到临时数组
  for (let i = left; i <= right; i++) {
    temp[i] = arr[i];
  }

  let i = left;
  let j = mid + 1;
  let k = left;

  while (i <= mid && j <= right) {
    if (compare(temp[i], temp[j]) <= 0) {
      arr[k] = temp[i];
      i++;
    } else {
      arr[k] = temp[j];
      j++;
    }
    k++;
  }

  // 复制剩余元素
  while (i <= mid) {
    arr[k] = temp[i];
    i++;
    k++;
  }

  while (j <= right) {
    arr[k] = temp[j];
    j++;
    k++;
  }
}

// ============================================================================
// 3. 复杂度分析
// ============================================================================

/*
 * 时间复杂度:
 *   - 最优: O(n log n)
 *   - 平均: O(n log n)
 *   - 最差: O(n log n)
 *
 * 空间复杂度:
 *   - 基础: O(n) - 需要额外数组
 *   - 原地: O(n) - 需要临时数组
 *
 * 稳定性: 稳定
 * 适用场景: 大数据量，需要稳定排序
 */

// ============================================================================
// 4. 测试
// ============================================================================

if (import.meta.url === `file://${process.argv[1]}`) {
  const arr = [64, 34, 25, 12, 22, 11, 90];

  console.log('Original:', arr);
  console.log('Merge Sort:', mergeSort(arr));
  console.log('In Place:', mergeSortInPlace([...arr]));
}

// ============================================================================
// 导出
// ============================================================================

;
