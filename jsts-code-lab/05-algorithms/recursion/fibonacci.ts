/**
 * @file 斐波那契数列
 * @category Algorithms → Recursion
 * @difficulty easy
 * @tags recursion, memoization, dynamic-programming
 */

// ============================================================================
// 1. 递归实现 (指数级)
// ============================================================================

export function fibRecursive(n: number): number {
  if (n <= 1) return n;
  return fibRecursive(n - 1) + fibRecursive(n - 2);
}

// ============================================================================
// 2. 记忆化递归 (O(n))
// ============================================================================

export function fibMemo(n: number): number {
  const memo = new Map<number, number>();

  function fib(n: number): number {
    if (n <= 1) return n;
    if (memo.has(n)) return memo.get(n)!;

    const result = fib(n - 1) + fib(n - 2);
    memo.set(n, result);
    return result;
  }

  return fib(n);
}

// ============================================================================
// 3. 迭代实现 (O(n), O(1)空间)
// ============================================================================

export function fibIterative(n: number): number {
  if (n <= 1) return n;

  let prev = 0;
  let curr = 1;

  for (let i = 2; i <= n; i++) {
    const next = prev + curr;
    prev = curr;
    curr = next;
  }

  return curr;
}

// ============================================================================
// 4. 闭包实现
// ============================================================================

export function createFibGenerator(): () => number {
  let a = 0;
  let b = 1;

  return () => {
    const result = a;
    [a, b] = [b, a + b];
    return result;
  };
}

// ============================================================================
// 5. 生成器实现
// ============================================================================

export function* fibGenerator(): Generator<number> {
  let [a, b] = [0, 1];

  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

// ============================================================================
// 6. 尾递归优化
// ============================================================================

export function fibTail(n: number, a = 0, b = 1): number {
  if (n === 0) return a;
  if (n === 1) return b;
  return fibTail(n - 1, b, a + b);
}

// ============================================================================
// 7. 矩阵快速幂 (O(log n))
// ============================================================================

export function fibFastDoubling(n: number): number {
  function fibHelper(k: number): [number, number] {
    if (k === 0) return [0, 1];

    const [a, b] = fibHelper(Math.floor(k / 2));
    const c = a * (2 * b - a);
    const d = a * a + b * b;

    if (k % 2 === 0) return [c, d];
    else return [d, c + d];
  }

  return fibHelper(n)[0];
}

// ============================================================================
// 8. 使用示例
// ============================================================================

function demo() {
  console.log('Fibonacci Sequence:');

  // 递归
  console.log('Recursive (n=10):', fibRecursive(10));

  // 迭代
  console.log('Iterative (n=40):', fibIterative(40));

  // 生成器
  const fib = fibGenerator();
  console.log('First 10 Fibonacci numbers:');
  for (let i = 0; i < 10; i++) {
    console.log(fib.next().value);
  }
}

// ============================================================================
// 导出
// ============================================================================

export { fibGenerator };;

// ============================================================================
// Demo 函数
// ============================================================================

export function demo(): void {
  console.log("=== Recursion Patterns Demo ===");

  // 基础递归
  console.log("\n1. Basic Recursion:");
  console.log("   Fibonacci (recursive, n=10):", fibRecursive(10));

  // 记忆化递归
  console.log("\n2. Memoization:");
  console.log("   Fibonacci (memoized, n=40):", fibMemo(40));
  console.log("   Fibonacci (memoized, n=100):", fibMemo(100));

  // 迭代实现
  console.log("\n3. Iterative:");
  console.log("   Fibonacci (iterative, n=50):", fibIterative(50));
  console.log("   Fibonacci (iterative, n=100):", fibIterative(100));

  // 尾递归
  console.log("\n4. Tail Recursion:");
  console.log("   Fibonacci (tail recursive, n=30):", fibTail(30));

  // 快速倍增
  console.log("\n5. Fast Doubling (O(log n)):");
  console.log("   Fibonacci (fast doubling, n=50):", fibFastDoubling(50));
  console.log("   Fibonacci (fast doubling, n=100):", fibFastDoubling(100));

  // 生成器
  console.log("\n6. Generator:");
  const fib = fibGenerator();
  console.log("   First 15 Fibonacci numbers:");
  const first15: number[] = [];
  for (let i = 0; i < 15; i++) {
    first15.push(fib.next().value);
  }
  console.log("   ", first15.join(", "));

  // 闭包生成器
  console.log("\n7. Closure Generator:");
  const nextFib = createFibGenerator();
  console.log("   Next 10 Fibonacci numbers:");
  const next10: number[] = [];
  for (let i = 0; i < 10; i++) {
    next10.push(nextFib());
  }
  console.log("   ", next10.join(", "));

  // 性能对比
  console.log("\n8. Performance Comparison:");
  const testN = 35;

  console.time("   Recursive (naive)");
  fibRecursive(testN);
  console.timeEnd("   Recursive (naive)");

  console.time("   Memoization");
  fibMemo(testN);
  console.timeEnd("   Memoization");

  console.time("   Iterative");
  fibIterative(testN);
  console.timeEnd("   Iterative");

  console.time("   Tail recursive");
  fibTail(testN);
  console.timeEnd("   Tail recursive");

  console.time("   Fast doubling");
  fibFastDoubling(testN);
  console.timeEnd("   Fast doubling");

  console.log("\nNote: Fast doubling is O(log n), others are O(n)");

  console.log("=== End of Demo ===\n");
}
