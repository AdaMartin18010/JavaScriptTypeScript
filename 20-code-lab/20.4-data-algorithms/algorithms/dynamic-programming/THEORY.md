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

### 最大子数组和（Kadane 算法）

```typescript
// maximum-subarray.ts — O(n) 线性 DP
function maxSubArray(nums: number[]): number {
  let maxSoFar = nums[0];
  let maxEndingHere = nums[0];

  for (let i = 1; i < nums.length; i++) {
    // 要么延续当前子数组，要么从当前元素重新开始
    maxEndingHere = Math.max(nums[i], maxEndingHere + nums[i]);
    maxSoFar = Math.max(maxSoFar, maxEndingHere);
  }
  return maxSoFar;
}

// 可运行示例
console.log(maxSubArray([-2, 1, -3, 4, -1, 2, 1, -5, 4])); // 6 ([4,-1,2,1])
console.log(maxSubArray([1])); // 1
```

### 矩阵链乘法（区间 DP）

```typescript
// matrix-chain-multiplication.ts — O(n³) 区间 DP
function matrixChainOrder(dims: number[]): { minCost: number; splits: number[][] } {
  const n = dims.length - 1; // n 个矩阵
  // dp[i][j] = 计算矩阵 Ai...Aj 的最小标量乘法次数
  const dp: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  const split: number[][] = Array.from({ length: n }, () => Array(n).fill(0));

  // 链长度从 2 到 n
  for (let len = 2; len <= n; len++) {
    for (let i = 0; i <= n - len; i++) {
      const j = i + len - 1;
      dp[i][j] = Infinity;
      for (let k = i; k < j; k++) {
        // 在 k 处分割: (Ai...Ak) × (Ak+1...Aj)
        const cost = dp[i][k] + dp[k + 1][j] + dims[i] * dims[k + 1] * dims[j + 1];
        if (cost < dp[i][j]) {
          dp[i][j] = cost;
          split[i][j] = k;
        }
      }
    }
  }

  return { minCost: dp[0][n - 1], splits: split };
}

// 可运行示例: A1(10×30), A2(30×5), A3(5×60)
// dims = [10, 30, 5, 60]
console.log(matrixChainOrder([10, 30, 5, 60]));
// { minCost: 4500, splits: [...] }
// 最优加括号: (A1 × A2) × A3 = 10×30×5 + 10×5×60 = 1500 + 3000 = 4500
```

### 爬楼梯（简单线性 DP）

```typescript
// climbing-stairs.ts
function climbStairs(n: number): number {
  if (n <= 2) return n;
  // dp[i] = 爬到第 i 阶的方法数
  // 滚动数组优化至 O(1) 空间
  let prev2 = 1; // dp[i-2]
  let prev1 = 2; // dp[i-1]
  for (let i = 3; i <= n; i++) {
    const current = prev1 + prev2;
    prev2 = prev1;
    prev1 = current;
  }
  return prev1;
}

// 可运行示例
console.log(climbStairs(3)); // 3 (1+1+1, 1+2, 2+1)
console.log(climbStairs(4)); // 5
console.log(climbStairs(10)); // 89
```

### 打家劫舍（线性 DP 带状态限制）

```typescript
// house-robber.ts — 相邻房屋不能同时偷
function rob(nums: number[]): number {
  if (nums.length === 0) return 0;
  if (nums.length === 1) return nums[0];

  // dp[i] = 前 i 间房屋能偷到的最高金额
  // 滚动数组优化
  let prev2 = nums[0]; // dp[i-2]
  let prev1 = Math.max(nums[0], nums[1]); // dp[i-1]

  for (let i = 2; i < nums.length; i++) {
    const current = Math.max(prev1, prev2 + nums[i]);
    prev2 = prev1;
    prev1 = current;
  }
  return prev1;
}

// 可运行示例
console.log(rob([1, 2, 3, 1])); // 4 (1 + 3)
console.log(rob([2, 7, 9, 3, 1])); // 12 (2 + 9 + 1)
```

### 树形 DP — 二叉树最大直径

```typescript
// tree-dp.ts — 后序遍历求树的最长路径（直径）
interface TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
}

function diameterOfBinaryTree(root: TreeNode | null): number {
  let maxDiameter = 0;

  function depth(node: TreeNode | null): number {
    if (!node) return 0;
    const left = depth(node.left);
    const right = depth(node.right);
    // 经过当前节点的最长路径 = 左深度 + 右深度
    maxDiameter = Math.max(maxDiameter, left + right);
    return 1 + Math.max(left, right);
  }

  depth(root);
  return maxDiameter;
}

// 可运行示例
const tree: TreeNode = {
  val: 1,
  left: { val: 2, left: { val: 4, left: null, right: null }, right: { val: 5, left: null, right: null } },
  right: { val: 3, left: null, right: null },
};
console.log(diameterOfBinaryTree(tree)); // 3 (路径 4→2→1→3 或 5→2→1→3)
```

### 状态压缩 DP — 旅行商问题（TSP）

```typescript
// tsp-bitmask.ts — O(n²·2ⁿ) 状态压缩
function tsp(dist: number[][]): number {
  const n = dist.length;
  const FULL_MASK = (1 << n) - 1;
  // dp[mask][i] = 已访问 mask 表示的城市集合，当前位于城市 i 的最小距离
  const dp: number[][] = Array.from({ length: 1 << n }, () => Array(n).fill(Infinity));
  dp[1][0] = 0; // 从城市 0 出发

  for (let mask = 1; mask <= FULL_MASK; mask++) {
    for (let u = 0; u < n; u++) {
      if (!(mask & (1 << u))) continue; // u 不在 mask 中
      if (dp[mask][u] === Infinity) continue;
      for (let v = 0; v < n; v++) {
        if (mask & (1 << v)) continue; // v 已访问
        const nextMask = mask | (1 << v);
        dp[nextMask][v] = Math.min(dp[nextMask][v], dp[mask][u] + dist[u][v]);
      }
    }
  }

  let minCost = Infinity;
  for (let i = 1; i < n; i++) {
    minCost = Math.min(minCost, dp[FULL_MASK][i] + dist[i][0]);
  }
  return minCost;
}

// 可运行示例（4 城市）
const dist4 = [
  [0, 10, 15, 20],
  [10, 0, 35, 25],
  [15, 35, 0, 30],
  [20, 25, 30, 0],
];
console.log(tsp(dist4)); // 80 (0→1→3→2→0)
```

### LIS 二分优化（Patience Sorting）

```typescript
// lis-binary.ts — O(n log n)  patience sorting 思想
function lengthOfLISOptimal(nums: number[]): number {
  const tails: number[] = []; // tails[i] = 长度为 i+1 的递增子序列的最小末尾值

  for (const num of nums) {
    let left = 0, right = tails.length;
    while (left < right) {
      const mid = (left + right) >> 1;
      if (tails[mid] < num) left = mid + 1;
      else right = mid;
    }
    tails[left] = num;
  }

  return tails.length;
}

// 可运行示例
console.log(lengthOfLISOptimal([10, 9, 2, 5, 3, 7, 101, 18])); // 4
console.log(lengthOfLISOptimal([0, 1, 0, 3, 2, 3])); // 4
```

### 单词拆分（字典 DP）

```typescript
// word-break.ts
function wordBreak(s: string, wordDict: string[]): boolean {
  const wordSet = new Set(wordDict);
  // dp[i] = s[0:i) 能否被拆分
  const dp = new Array(s.length + 1).fill(false);
  dp[0] = true;

  for (let i = 1; i <= s.length; i++) {
    for (const word of wordDict) {
      if (i >= word.length && dp[i - word.length] && s.slice(i - word.length, i) === word) {
        dp[i] = true;
        break;
      }
    }
  }
  return dp[s.length];
}

// 可运行示例
console.log(wordBreak('leetcode', ['leet', 'code'])); // true
console.log(wordBreak('applepenapple', ['apple', 'pen'])); // true
console.log(wordBreak('catsandog', ['cats', 'dog', 'sand', 'and', 'cat'])); // false
```

## 3.4 新增权威参考链接

- [GeeksforGeeks — Dynamic Programming](https://www.geeksforgeeks.org/dynamic-programming/) — DP 基础与经典问题
- [AtCoder DP Contest](https://atcoder.jp/contests/dp/tasks) — 经典 DP 练习题库
- [Wikipedia — Dynamic Programming](https://en.wikipedia.org/wiki/Dynamic_programming) — 动态规划百科
- [VisuAlgo — Recursion & DP](https://visualgo.net/en/recursion) — 算法可视化
- [CP-Algorithms — Dynamic Programming](https://cp-algorithms.com/dynamic_programming/intro-to-dp.html) — 竞赛 DP 参考
- [Algorithm Design Manual (Skiena)](http://www.algorist.com/) — 算法设计手册
- [MIT 6.006 Lecture 19 — DP I](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/video_galleries/lecture-videos/) — 官方公开课
- [LeetCode DP Patterns](https://leetcode.com/discuss/general-discussion/458695/dynamic-programming-patterns) — 面试 DP 模式总结
- [Stanford CS 161: DP](https://web.stanford.edu/class/cs161/) — 算法设计课程
- [CMU 15-451: Dynamic Programming](https://www.cs.cmu.edu/~avrim/451f11/lectures/lect1004.pdf) — 讲义 PDF
- [Introduction to Algorithms (CLRS) — Ch. 15](https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/) — 算法圣经动态规划章节
- [USACO Guide — Dynamic Programming](https://usaco.guide/gold/dp-intro) — 竞赛编程 DP 入门
- [Codeforces DP Tag](https://codeforces.com/problemset?tags=dp) — 高质量 DP 题目集合
- [YouTube: MIT 6.006 DP Lecture](https://www.youtube.com/watch?v=OQ5jsbhAv_M) — MIT 官方 DP 视频课

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
