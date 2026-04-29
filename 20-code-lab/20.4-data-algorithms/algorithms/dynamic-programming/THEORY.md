# 动态规划（Dynamic Programming）

> **定位**：`20-code-lab/20.4-data-algorithms/algorithms/dynamic-programming`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块解决**重叠子问题与最优子结构**的高效求解问题。通过记忆化和表格法将指数级复杂度降为多项式级。核心原则：**不重复计算已解决的子问题**。

### 1.2 形式化基础

- **最优子结构（Optimal Substructure）**：问题的最优解包含子问题的最优解。
- **重叠子问题（Overlapping Subproblems）**：递归求解过程中多次遇到相同的子问题。
- **状态转移方程**：`dp[i] = f(dp[i-1], dp[i-2], ...)`，描述子问题解的递推关系。

### 1.3 自顶向下 vs 自底向上对比

| 维度 | 记忆化（Memoization） | 表格法（Tabulation） |
|------|----------------------|---------------------|
| **思路方向** | 自顶向下（递归） | 自底向上（迭代） |
| **实现方式** | 递归 + 缓存哈希表 | 迭代 + 数组填表 |
| **调用栈** | 有（递归深度限制） | 无（无栈溢出风险） |
| **时间复杂度** | 子问题数 × 每次计算 | 子问题数 × 每次计算 |
| **空间优化** | 缓存表 + 调用栈 | 可滚动数组降维 |
| **适用场景** | 树形/图结构、状态稀疏 | 线性递推、状态稠密 |

---

## 二、设计原理

### 2.1 为什么存在

递归解法虽然直观，但对重叠子问题存在大量重复计算。动态规划通过记忆化或表格法消除冗余，将指数级复杂度优化为多项式级。

### 2.2 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 自顶向下 | 直观递归思路 | 递归栈开销 | 理解问题 |
| 自底向上 | 无栈溢出、常数优化 | 思维转换 | 性能敏感 |

### 2.3 与相关技术的对比

与贪心算法对比：DP 保证最优但复杂度高，贪心快但可能非最优。贪心要求**贪心选择性质**，DP 要求**最优子结构**。

---

## 三、实践映射

### 3.1 从理论到代码

**Fibonacci：三种实现对比**

```typescript
// ❌ 朴素递归：O(2^n)，存在大量重复计算
function fibNaive(n: number): number {
  if (n <= 1) return n;
  return fibNaive(n - 1) + fibNaive(n - 2);
}

// ✅ 记忆化递归：O(n) 时间，O(n) 空间
function fibMemo(n: number, memo: number[] = []): number {
  if (n <= 1) return n;
  if (memo[n] !== undefined) return memo[n];
  memo[n] = fibMemo(n - 1, memo) + fibMemo(n - 2, memo);
  return memo[n];
}

// ✅ 表格法迭代：O(n) 时间，O(1) 空间（滚动数组优化）
function fibTab(n: number): number {
  if (n <= 1) return n;
  let prev2 = 0; // dp[i-2]
  let prev1 = 1; // dp[i-1]
  for (let i = 2; i <= n; i++) {
    const current = prev1 + prev2;
    prev2 = prev1;
    prev1 = current;
  }
  return prev1;
}

// 可运行示例
console.log('Naive(10):', fibNaive(10));   // 55
console.log('Memo(50):', fibMemo(50));      // 12586269025（秒出）
console.log('Tab(50):', fibTab(50));        // 12586269025（秒出）
// fibNaive(50) 将耗时数年，切勿运行
```

**0/1 背包问题（经典 DP）**

```typescript
function knapsack(weights: number[], values: number[], capacity: number): number {
  const n = weights.length;
  // dp[i][w] = 前 i 个物品，容量 w 时的最大价值
  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(capacity + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    for (let w = 0; w <= capacity; w++) {
      if (weights[i - 1] <= w) {
        // 选或不选第 i 个物品
        dp[i][w] = Math.max(
          dp[i - 1][w], // 不选
          dp[i - 1][w - weights[i - 1]] + values[i - 1] // 选
        );
      } else {
        dp[i][w] = dp[i - 1][w]; // 容量不够，只能不选
      }
    }
  }
  return dp[n][capacity];
}

// 可运行示例
const weights = [2, 3, 4, 5];
const values = [3, 4, 5, 6];
console.log(knapsack(weights, values, 5)); // 7（选重量 2+3，价值 3+4）
console.log(knapsack(weights, values, 8)); // 10（选重量 3+5，价值 4+6）
```

**最长递增子序列（LIS）**

```typescript
function lengthOfLIS(nums: number[]): number {
  if (nums.length === 0) return 0;
  // dp[i] = 以 nums[i] 结尾的最长递增子序列长度
  const dp = new Array(nums.length).fill(1);

  for (let i = 1; i < nums.length; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[j] < nums[i]) {
        dp[i] = Math.max(dp[i], dp[j] + 1);
      }
    }
  }
  return Math.max(...dp);
}

// 可运行示例
console.log(lengthOfLIS([10, 9, 2, 5, 3, 7, 101, 18])); // 4（[2, 3, 7, 101]）
console.log(lengthOfLIS([0, 1, 0, 3, 2, 3]));           // 4（[0, 1, 2, 3]）
```

### 3.2 常见误区

| 误区 | 正确理解 |
|------|---------|
| DP 就是递归加缓存 | 自底向上 DP 无递归开销，空间可优化 |
| 所有问题都适合 DP | DP 要求最优子结构和重叠子问题 |
| DP 一定比暴力快 | 状态空间过大时（指数级状态），DP 同样不可行 |
| 空间不能优化 | 很多线性 DP 可用滚动数组将 O(n²) 降到 O(n) |

### 3.3 扩展阅读

- [Dynamic Programming Patterns — LeetCode Discuss](https://leetcode.com/discuss/general-discussion/458695/dynamic-programming-patterns)
- [MIT 6.006: Dynamic Programming I](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/video_galleries/lecture-videos/)
- [TopCoder: Dynamic Programming from Novice to Advanced](https://www.topcoder.com/thrive/articles/Dynamic%20Programming:%20From%20Novice%20to%20Advanced)
- [Algorithm Design Manual — Steven Skiena](http://www.algorist.com/)
- `20.4-data-algorithms/algorithms/`

---


## 3.2 进阶代码示例

### 编辑距离（Levenshtein Distance）

```typescript
// edit-distance.ts
function minDistance(word1: string, word2: string): number {
  const m = word1.length, n = word2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (word1[i - 1] === word2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,    // 删除
          dp[i][j - 1] + 1,    // 插入
          dp[i - 1][j - 1] + 1 // 替换
        );
      }
    }
  }
  return dp[m][n];
}

// 可运行示例
console.log(minDistance('horse', 'ros')); // 3
console.log(minDistance('intention', 'execution')); // 5
```

### 最长公共子序列（LCS）

```typescript
// lcs.ts
function longestCommonSubsequence(text1: string, text2: string): number {
  const m = text1.length, n = text2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (text1[i - 1] === text2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  return dp[m][n];
}

// 可运行示例
console.log(longestCommonSubsequence('abcde', 'ace')); // 3 ('ace')
console.log(longestCommonSubsequence('abc', 'def')); // 0
```

### 硬币找零（完全背包）

```typescript
// coin-change.ts
function coinChange(coins: number[], amount: number): number {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;

  for (const coin of coins) {
    for (let i = coin; i <= amount; i++) {
      dp[i] = Math.min(dp[i], dp[i - coin] + 1);
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}

// 可运行示例
console.log(coinChange([1, 2, 5], 11)); // 3 (5+5+1)
console.log(coinChange([2], 3)); // -1
```

## 3.4 新增权威参考链接

- [GeeksforGeeks — Dynamic Programming](https://www.geeksforgeeks.org/dynamic-programming/) — DP 基础与经典问题
- [AtCoder DP Contest](https://atcoder.jp/contests/dp/tasks) — 经典 DP 练习题库
- [Wikipedia — Dynamic Programming](https://en.wikipedia.org/wiki/Dynamic_programming) — 动态规划百科
- [VisuAlgo — Recursion & DP](https://visualgo.net/en/recursion) — 算法可视化
- [CP-Algorithms — Dynamic Programming](https://cp-algorithms.com/dynamic_programming/intro-to-dp.html) — 竞赛 DP 参考
- [Algorithm Design Manual (Skiena)](http://www.algorist.com/) — 算法设计手册

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
