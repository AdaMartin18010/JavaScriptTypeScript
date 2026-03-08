/**
 * @file 快速排序
 * @category Algorithms → Sorting
 * @difficulty medium
 * @tags sorting, quicksort, divide-and-conquer, o-n-log-n
 */

// ============================================================================
// 1. 基础快速排序
// ============================================================================

export function quickSort<T>(arr: T[], compare?: (a: T, b: T) => number): T[] {
  if (arr.length <= 1) return [...arr];

  const compareFn = compare || ((a: T, b: T) => (a < b ? -1 : a > b ? 1 : 0));
  const pivot = arr[Math.floor(arr.length / 2)];
  const left: T[] = [];
  const middle: T[] = [];
  const right: T[] = [];

  for (const item of arr) {
    const cmp = compareFn(item, pivot);
    if (cmp < 0) left.push(item);
    else if (cmp > 0) right.push(item);
    else middle.push(item);
  }

  return [...quickSort(left, compareFn), ...middle, ...quickSort(right, compareFn)];
}

// ============================================================================
// 2. 原地快速排序 (内存优化)
// ============================================================================

export function quickSortInPlace<T>(
  arr: T[],
  left = 0,
  right = arr.length - 1,
  compare?: (a: T, b: T) => number
): T[] {
  const compareFn = compare || ((a: T, b: T) => (a < b ? -1 : a > b ? 1 : 0));

  if (left < right) {
    const pivotIndex = partition(arr, left, right, compareFn);
    quickSortInPlace(arr, left, pivotIndex - 1, compareFn);
    quickSortInPlace(arr, pivotIndex + 1, right, compareFn);
  }

  return arr;
}

function partition<T>(
  arr: T[],
  left: number,
  right: number,
  compare: (a: T, b: T) => number
): number {
  const pivot = arr[right];
  let i = left - 1;

  for (let j = left; j < right; j++) {
    if (compare(arr[j], pivot) <= 0) {
      i++;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  [arr[i + 1], arr[right]] = [arr[right], arr[i + 1]];
  return i + 1;
}

// ============================================================================
// 3. 三数取中法优化
// ============================================================================

function medianOfThree<T>(arr: T[], left: number, right: number, compare: (a: T, b: T) => number): T {
  const center = Math.floor((left + right) / 2);

  if (compare(arr[left], arr[center]) > 0) [arr[left], arr[center]] = [arr[center], arr[left]];
  if (compare(arr[left], arr[right]) > 0) [arr[left], arr[right]] = [arr[right], arr[left]];
  if (compare(arr[center], arr[right]) > 0) [arr[center], arr[right]] = [arr[right], arr[center]];

  [arr[center], arr[right - 1]] = [arr[right - 1], arr[center]];
  return arr[right - 1];
}

// ============================================================================
// 4. 迭代实现 (避免递归深度问题)
// ============================================================================

export function quickSortIterative<T>(arr: T[], compare?: (a: T, b: T) => number): T[] {
  const compareFn = compare || ((a: T, b: T) => (a < b ? -1 : a > b ? 1 : 0));
  const stack: Array<[number, number]> = [[0, arr.length - 1]];

  while (stack.length > 0) {
    const [left, right] = stack.pop()!;

    if (left >= right) continue;

    const pivotIndex = partition(arr, left, right, compareFn);

    // 先处理较小的子数组，减少栈深度
    if (pivotIndex - left < right - pivotIndex) {
      stack.push([pivotIndex + 1, right]);
      stack.push([left, pivotIndex - 1]);
    } else {
      stack.push([left, pivotIndex - 1]);
      stack.push([pivotIndex + 1, right]);
    }
  }

  return arr;
}

// ============================================================================
// 5. 复杂度分析
// ============================================================================

/*
 * 时间复杂度:
 *   - 最优: O(n log n) - 每次 pivot 都平分
 *   - 平均: O(n log n)
 *   - 最差: O(n²) - 数组已有序，pivot 总是最大/最小
 *
 * 空间复杂度:
 *   - 递归: O(log n) - 调用栈深度
 *   - 迭代: O(log n) - 显式栈
 *
 * 稳定性: 不稳定
 */

// ============================================================================
// 6. 测试与对比
// ============================================================================

if (import.meta.url === `file://${process.argv[1]}`) {
  const sizes = [100, 1000, 10000];

  for (const size of sizes) {
    const arr = Array.from({ length: size }, () => Math.random());

    console.time(`QuickSort ${size}`);
    quickSort(arr);
    console.timeEnd(`QuickSort ${size}`);

    console.time(`QuickSortInPlace ${size}`);
    quickSortInPlace([...arr]);
    console.timeEnd(`QuickSortInPlace ${size}`);

    console.time(`Native Sort ${size}`);
    [...arr].sort((a, b) => a - b);
    console.timeEnd(`Native Sort ${size}`);

    console.log('---');
  }
}
// ============================================================================
// Demo 函数
// ============================================================================

export function demo(): void {
  console.log("=== Quick Sort Demo ===");
  
  // 基础快速排序
  const arr1 = [3, 6, 8, 10, 1, 2, 1];
  console.log("Original:", arr1);
  console.log("Sorted:", quickSort(arr1));
  
  // 原地排序
  const arr2 = [64, 34, 25, 12, 22, 11, 90];
  console.log("\nOriginal:", arr2);
  quickSortInPlace(arr2);
  console.log("In-place sorted:", arr2);
  
  // 自定义比较
  const words = ["banana", "apple", "cherry", "date"];
  const sortedWords = quickSort(words, (a, b) => a.localeCompare(b));
  console.log("\nWords sorted:", sortedWords);
  
  // 对象排序
  const people = [
    { name: "Alice", age: 30 },
    { name: "Bob", age: 25 },
    { name: "Charlie", age: 35 }
  ];
  const sortedByAge = quickSort(people, (a, b) => a.age - b.age);
  console.log("\nPeople sorted by age:", sortedByAge.map(p => p.name));
  
  console.log("=== End of Demo ===\n");
}
