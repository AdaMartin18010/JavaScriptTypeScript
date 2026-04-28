/**
 * @file 动态规划 - 斐波那契
 * @category Algorithms → Dynamic Programming
 * @difficulty easy
 * @tags dp, memoization, tabulation, optimization
 */

// ============================================================================
// 1. 记忆化搜索 (Top-down)
// ============================================================================

export function fibMemo(n: number): number {
  const memo = new Map<number, number>();
  
  function fib(k: number): number {
    if (k <= 1) return k;
    if (memo.has(k)) return memo.get(k)!;
    
    const result = fib(k - 1) + fib(k - 2);
    memo.set(k, result);
    return result;
  }
  
  return fib(n);
}

// ============================================================================
// 2. 自底向上 (Bottom-up)
// ============================================================================

export function fibDP(n: number): number {
  if (n <= 1) return n;
  
  const dp = new Array(n + 1);
  dp[0] = 0;
  dp[1] = 1;
  
  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
  }
  
  return dp[n];
}

// ============================================================================
// 3. 空间优化
// ============================================================================

export function fibOptimized(n: number): number {
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
// 4. 爬楼梯问题
// ============================================================================

export function climbStairs(n: number): number {
  if (n <= 2) return n;
  
  let oneStep = 1;
  let twoSteps = 2;
  
  for (let i = 3; i <= n; i++) {
    const current = oneStep + twoSteps;
    oneStep = twoSteps;
    twoSteps = current;
  }
  
  return twoSteps;
}

// ============================================================================
// 5. 最大子数组和 (Kadane算法)
// ============================================================================

export function maxSubArray(nums: number[]): number {
  let maxSum = nums[0];
  let currentSum = nums[0];
  
  for (let i = 1; i < nums.length; i++) {
    currentSum = Math.max(nums[i], currentSum + nums[i]);
    maxSum = Math.max(maxSum, currentSum);
  }
  
  return maxSum;
}

// ============================================================================
// 6. 最长递增子序列 (LIS)
// ============================================================================

export function lengthOfLIS(nums: number[]): number {
  if (nums.length === 0) return 0;
  
  const dp = new Array(nums.length).fill(1);
  let maxLength = 1;
  
  for (let i = 1; i < nums.length; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[i] > nums[j]) {
        dp[i] = Math.max(dp[i], dp[j] + 1);
      }
    }
    maxLength = Math.max(maxLength, dp[i]);
  }
  
  return maxLength;
}

// ============================================================================
// 7. 编辑距离
// ============================================================================

export function minDistance(word1: string, word2: string): number {
  const m = word1.length;
  const n = word2.length;
  
  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));
  
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (word1[i - 1] === word2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(
          dp[i - 1][j],     // 删除
          dp[i][j - 1],     // 插入
          dp[i - 1][j - 1]  // 替换
        );
      }
    }
  }
  
  return dp[m][n];
}

// ============================================================================
// 8. 0/1 背包问题
// ============================================================================

export function knapsack(
  weights: number[],
  values: number[],
  capacity: number
): number {
  const n = weights.length;
  const dp: number[][] = Array(n + 1)
    .fill(null)
    .map(() => Array(capacity + 1).fill(0));
  
  for (let i = 1; i <= n; i++) {
    for (let w = 0; w <= capacity; w++) {
      if (weights[i - 1] <= w) {
        dp[i][w] = Math.max(
          dp[i - 1][w],
          dp[i - 1][w - weights[i - 1]] + values[i - 1]
        );
      } else {
        dp[i][w] = dp[i - 1][w];
      }
    }
  }
  
  return dp[n][capacity];
}

// ============================================================================
// 导出
// ============================================================================

;

// ============================================================================
// Demo 函数
// ============================================================================

export function demo(): void {
  console.log("=== Dynamic Programming Demo ===");

  // 斐波那契数列
  console.log("\n1. Fibonacci Sequence:");
  console.log("   n = 10");
  console.log("   Memoization:", fibMemo(10));
  console.log("   Bottom-up DP:", fibDP(10));
  console.log("   Space optimized:", fibOptimized(10));
  console.log("   n = 50");
  console.log("   Space optimized:", fibOptimized(50));

  // 爬楼梯
  console.log("\n2. Climb Stairs:");
  for (let n = 1; n <= 5; n++) {
    console.log(`   ${n} steps: ${climbStairs(n)} ways`);
  }

  // 最大子数组和
  console.log("\n3. Maximum Subarray (Kadane's Algorithm):");
  const arrays = [
    [-2, 1, -3, 4, -1, 2, 1, -5, 4],
    [1],
    [5, 4, -1, 7, 8]
  ];
  arrays.forEach(arr => {
    console.log(`   [${arr.join(", ")}]`);
    console.log(`   Max sum: ${maxSubArray(arr)}`);
  });

  // 最长递增子序列
  console.log("\n4. Longest Increasing Subsequence (LIS):");
  const sequences = [
    [10, 9, 2, 5, 3, 7, 101, 18],
    [0, 1, 0, 3, 2, 3],
    [7, 7, 7, 7, 7, 7]
  ];
  sequences.forEach(seq => {
    console.log(`   [${seq.join(", ")}]`);
    console.log(`   LIS length: ${lengthOfLIS(seq)}`);
  });

  // 编辑距离
  console.log("\n5. Edit Distance (Levenshtein):");
  const wordPairs = [
    ["horse", "ros"],
    ["intention", "execution"],
    ["sunday", "saturday"]
  ];
  wordPairs.forEach(([w1, w2]) => {
    const distance = minDistance(w1, w2);
    console.log(`   "${w1}" -> "${w2}": ${distance} operations`);
  });

  // 0/1 背包问题
  console.log("\n6. 0/1 Knapsack Problem:");
  const knapsackExamples = [
    {
      weights: [1, 3, 4, 5],
      values: [1, 4, 5, 7],
      capacity: 7,
      description: "Small example"
    },
    {
      weights: [2, 3, 4, 5],
      values: [3, 4, 5, 6],
      capacity: 5,
      description: "Another example"
    }
  ];
  
  knapsackExamples.forEach(({ weights, values, capacity, description }) => {
    const maxValue = knapsack(weights, values, capacity);
    console.log(`   ${description}:`);
    console.log(`     Weights: [${weights.join(", ")}]`);
    console.log(`     Values:  [${values.join(", ")}]`);
    console.log(`     Capacity: ${capacity}`);
    console.log(`     Max value: ${maxValue}`);
  });

  // 性能对比
  console.log("\n7. Performance Comparison (Fibonacci):");
  console.time("   Memoization");
  fibMemo(1000);
  console.timeEnd("   Memoization");

  console.time("   Bottom-up");
  fibDP(1000);
  console.timeEnd("   Bottom-up");

  console.time("   Optimized");
  fibOptimized(1000);
  console.timeEnd("   Optimized");

  console.log("=== End of Demo ===\n");
}
