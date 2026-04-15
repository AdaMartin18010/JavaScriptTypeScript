/**
 * @file 堆 (Heap / Priority Queue)
 * @category Data Structures → Custom
 * @difficulty medium
 * @tags heap, priority-queue, binary-heap
 *
 * @complexity_analysis
 * - 插入 (insert): 时间 O(log n), 空间 O(1)。元素置于末尾后向上调整 (heapifyUp)，树高为 ⌊log₂ n⌋。
 * - 提取极值 (extractMin/Max): 时间 O(log n), 空间 O(1)。将根与末尾交换后向下调整 (heapifyDown)。
 * - 查看极值 (peek): 时间 O(1), 空间 O(1)。直接访问数组首元素。
 * - 建堆 (fromArray / heapify): 时间 O(n), 空间 O(1)（均摊）。从最后一个非叶子节点开始向下调整，总操作次数收敛于 2n。
 * - 堆排序 (heapSort): 时间 O(n log n), 空间 O(n)（输出数组）或 O(1) 辅助（若原地实现）。每次提取极值后调整需 O(log n)，共 n 次。
 * - 第 K 大/小 (findKth): 时间 O(k log n) 或 O(n + k log n)（含建堆）, 空间 O(n)。
 */

// ============================================================================
// 1. 最小堆实现
// ============================================================================

/**
 * @complexity_analysis
 * 所有公开方法的时间/空间复杂度参见文件顶部 JSDoc。
 */
export class MinHeap<T> {
  private heap: T[] = [];
  private compare: (a: T, b: T) => number;

  constructor(compare?: (a: T, b: T) => number) {
    this.compare = compare || ((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  }

  // 获取父节点索引
  private parent(i: number): number {
    return Math.floor((i - 1) / 2);
  }

  // 获取左子节点索引
  private leftChild(i: number): number {
    return 2 * i + 1;
  }

  // 获取右子节点索引
  private rightChild(i: number): number {
    return 2 * i + 2;
  }

  // 交换两个元素
  private swap(i: number, j: number): void {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }

  // 向上调整
  private heapifyUp(i: number): void {
    let current = i;
    while (
      current > 0 &&
      this.compare(this.heap[current], this.heap[this.parent(current)]) < 0
    ) {
      this.swap(current, this.parent(current));
      current = this.parent(current);
    }
  }

  // 向下调整
  private heapifyDown(i: number): void {
    let current = i;
    const n = this.heap.length;

    while (true) {
      let smallest = current;
      const left = this.leftChild(current);
      const right = this.rightChild(current);

      if (left < n && this.compare(this.heap[left], this.heap[smallest]) < 0) {
        smallest = left;
      }

      if (right < n && this.compare(this.heap[right], this.heap[smallest]) < 0) {
        smallest = right;
      }

      if (smallest === current) break;

      this.swap(current, smallest);
      current = smallest;
    }
  }

  // 插入元素
  insert(value: T): this {
    this.heap.push(value);
    this.heapifyUp(this.heap.length - 1);
    return this;
  }

  // 移除并返回最小元素
  extractMin(): T | undefined {
    if (this.heap.length === 0) return undefined;
    if (this.heap.length === 1) return this.heap.pop();

    const min = this.heap[0];
    this.heap[0] = this.heap.pop()!;
    this.heapifyDown(0);
    return min;
  }

  // 查看最小元素
  peek(): T | undefined {
    return this.heap[0];
  }

  // 获取堆大小
  size(): number {
    return this.heap.length;
  }

  // 检查是否为空
  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  // 从数组构建堆
  static fromArray<T>(
    arr: T[],
    compare?: (a: T, b: T) => number
  ): MinHeap<T> {
    const heap = new MinHeap<T>(compare);
    heap.heap = [...arr];
    
    // 从最后一个非叶子节点开始向下调整
    for (let i = Math.floor(arr.length / 2) - 1; i >= 0; i--) {
      heap.heapifyDown(i);
    }
    
    return heap;
  }

  // 转换为数组（无序）
  toArray(): T[] {
    return [...this.heap];
  }
}

// ============================================================================
// 2. 最大堆实现
// ============================================================================

/**
 * @complexity_analysis
 * 与 MinHeap 对称：insert O(log n)、extractMax O(log n)、peek O(1)、fromArray O(n)。
 */
export class MaxHeap<T> {
  private heap: T[] = [];
  private compare: (a: T, b: T) => number;

  constructor(compare?: (a: T, b: T) => number) {
    this.compare = compare || ((a, b) => (a > b ? -1 : a < b ? 1 : 0));
  }

  private parent(i: number): number {
    return Math.floor((i - 1) / 2);
  }

  private leftChild(i: number): number {
    return 2 * i + 1;
  }

  private rightChild(i: number): number {
    return 2 * i + 2;
  }

  private swap(i: number, j: number): void {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }

  private heapifyUp(i: number): void {
    let current = i;
    while (
      current > 0 &&
      this.compare(this.heap[current], this.heap[this.parent(current)]) < 0
    ) {
      this.swap(current, this.parent(current));
      current = this.parent(current);
    }
  }

  private heapifyDown(i: number): void {
    let current = i;
    const n = this.heap.length;

    while (true) {
      let largest = current;
      const left = this.leftChild(current);
      const right = this.rightChild(current);

      if (left < n && this.compare(this.heap[left], this.heap[largest]) < 0) {
        largest = left;
      }

      if (right < n && this.compare(this.heap[right], this.heap[largest]) < 0) {
        largest = right;
      }

      if (largest === current) break;

      this.swap(current, largest);
      current = largest;
    }
  }

  insert(value: T): this {
    this.heap.push(value);
    this.heapifyUp(this.heap.length - 1);
    return this;
  }

  extractMax(): T | undefined {
    if (this.heap.length === 0) return undefined;
    if (this.heap.length === 1) return this.heap.pop();

    const max = this.heap[0];
    this.heap[0] = this.heap.pop()!;
    this.heapifyDown(0);
    return max;
  }

  peek(): T | undefined {
    return this.heap[0];
  }

  size(): number {
    return this.heap.length;
  }

  isEmpty(): boolean {
    return this.heap.length === 0;
  }
}

// ============================================================================
// 3. 堆排序
// ============================================================================

/**
 * @complexity_analysis
 * - 时间: O(n log n)。建堆 O(n)，随后 n 次 extractMin 各 O(log n)。
 * - 空间: O(n)。结果数组与堆副本共 O(n) 辅助空间。
 */
export function heapSort<T>(arr: T[], compare?: (a: T, b: T) => number): T[] {
  const heap = MinHeap.fromArray(arr, compare);
  const result: T[] = [];
  
  while (!heap.isEmpty()) {
    result.push(heap.extractMin()!);
  }
  
  return result;
}

// ============================================================================
// 4. 查找第 K 大/小元素
// ============================================================================

/**
 * @complexity_analysis
 * - 时间: O(n + k log n)。先建堆 O(n)，再执行 k 次 extractMin O(k log n)。
 * - 空间: O(n)。堆存储数组副本。
 */
export function findKthSmallest<T>(arr: T[], k: number, compare?: (a: T, b: T) => number): T | undefined {
  if (k < 1 || k > arr.length) return undefined;
  
  const heap = MinHeap.fromArray(arr, compare);
  
  for (let i = 1; i < k; i++) {
    heap.extractMin();
  }
  
  return heap.extractMin();
}

/**
 * @complexity_analysis
 * - 时间: O(n + k log n)。逻辑与 findKthSmallest 相同，通过反转比较器实现。
 * - 空间: O(n)。
 */
export function findKthLargest<T>(arr: T[], k: number, compare?: (a: T, b: T) => number): T | undefined {
  if (k < 1 || k > arr.length) return undefined;
  
  const maxCompare = (a: T, b: T) => -1 * (compare || ((x, y) => (x < y ? -1 : x > y ? 1 : 0)))(a, b);
  const heap = MinHeap.fromArray(arr, maxCompare);
  
  for (let i = 1; i < k; i++) {
    heap.extractMin();
  }
  
  return heap.extractMin();
}

// ============================================================================
// 导出
// ============================================================================

;

// ============================================================================
// Demo 函数
// ============================================================================

export function demo(): void {
  console.log("=== Heap Data Structure Demo ===");

  // 最小堆
  console.log("\n1. Min Heap:");
  const minHeap = new MinHeap<number>();
  const values = [5, 3, 8, 1, 9, 2, 7];
  console.log("   Inserting values:", values);
  
  values.forEach(v => minHeap.insert(v));
  
  console.log("   Peek (min):", minHeap.peek());
  console.log("   Size:", minHeap.size());
  
  console.log("   Extracting in order:");
  const sorted: number[] = [];
  while (!minHeap.isEmpty()) {
    sorted.push(minHeap.extractMin()!);
  }
  console.log("   Sorted:", sorted);

  // 最大堆
  console.log("\n2. Max Heap:");
  const maxHeap = new MaxHeap<number>();
  values.forEach(v => maxHeap.insert(v));
  
  console.log("   Peek (max):", maxHeap.peek());
  
  console.log("   Extracting in order:");
  const reverseSorted: number[] = [];
  while (!maxHeap.isEmpty()) {
    reverseSorted.push(maxHeap.extractMax()!);
  }
  console.log("   Reverse sorted:", reverseSorted);

  // 从数组构建堆
  console.log("\n3. Build Heap from Array:");
  const arr = [4, 10, 3, 5, 1, 8, 2];
  console.log("   Original array:", arr);
  const builtHeap = MinHeap.fromArray(arr);
  console.log("   Heap peek:", builtHeap.peek());
  console.log("   Extracting all:");
  const builtSorted: number[] = [];
  while (!builtHeap.isEmpty()) {
    builtSorted.push(builtHeap.extractMin()!);
  }
  console.log("   Sorted:", builtSorted);

  // 堆排序
  console.log("\n4. Heap Sort:");
  const unsorted = [64, 34, 25, 12, 22, 11, 90];
  console.log("   Unsorted:", unsorted);
  console.log("   Sorted:", heapSort(unsorted));

  // 自定义比较器
  console.log("\n5. Custom Comparator (Max Heap for objects):");
  interface Task {
    name: string;
    priority: number;
  }
  
  const taskHeap = new MinHeap<Task>((a, b) => b.priority - a.priority);
  taskHeap.insert({ name: "Low priority", priority: 1 });
  taskHeap.insert({ name: "High priority", priority: 10 });
  taskHeap.insert({ name: "Medium priority", priority: 5 });
  
  console.log("   Tasks by priority:");
  while (!taskHeap.isEmpty()) {
    const task = taskHeap.extractMin()!;
    console.log(`     ${task.name} (priority: ${task.priority})`);
  }

  // 第 K 大/小元素
  console.log("\n6. Find K-th Element:");
  const numbers = [7, 10, 4, 3, 20, 15];
  console.log("   Array:", numbers);
  console.log("   3rd smallest:", findKthSmallest(numbers, 3));
  console.log("   2nd largest:", findKthLargest(numbers, 2));

  // 字符串堆
  console.log("\n7. String Heap:");
  const stringHeap = new MinHeap<string>((a, b) => a.localeCompare(b));
  ["cherry", "apple", "banana", "date"].forEach(s => stringHeap.insert(s));
  
  console.log("   Sorted strings:");
  const sortedStrings: string[] = [];
  while (!stringHeap.isEmpty()) {
    sortedStrings.push(stringHeap.extractMin()!);
  }
  console.log("   ", sortedStrings);

  console.log("=== End of Demo ===\n");
}
