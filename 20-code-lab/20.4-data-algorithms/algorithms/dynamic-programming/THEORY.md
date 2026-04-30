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
// 朴素递归：O(2^n)，存在大量重复计算
function fibNaive(n: number): number {
  if (n <= 1) return n;
  return fibNaive(n - 1) + fibNaive(n - 2);
}

// 记忆化递归：O(n) 时间，O(n) 空间
function fibMemo(n: number, memo: number[] = []): number {
  if (n <= 1) return n;
  if (memo[n] !== undefined) return memo[n];
  memo[n] = fibMemo(n - 1, memo) + fibMemo(n - 2, memo);
  return memo[n];
}

// 表格法迭代：O(n) 时间，O(1) 空间（滚动数组优化）
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
console.log('Memo(50):', fibMemo(50));      // 12586269025
console.log('Tab(50):', fibTab(50));        // 12586269025
```

**0/1 背包问题（经典 DP）**

```typescript
function knapsack(weights: number[], values: number[], capacity: number): number {
  const n = weights.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(capacity + 1).fill(0));

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

console.log(knapsack([2, 3, 4, 5], [3, 4, 5, 6], 5)); // 7
console.log(knapsack([2, 3, 4, 5], [3, 4, 5, 6], 8)); // 10
```

**0/1 背包空间优化（滚动数组）**

```typescript
// 滚动数组优化：从 O(n*C) 降到 O(C)
function knapsackOptimized(weights: number[], values: number[], capacity: number): number {
  const dp = new Array(capacity + 1).fill(0);
  for (let i = 0; i < weights.length; i++) {
    // 必须倒序遍历，避免重复选取同一物品
    for (let w = capacity; w >= weights[i]; w--) {
      dp[w] = Math.max(dp[w], dp[w - weights[i]] + values[i]);
    }
  }
  return dp[capacity];
}

console.log(knapsackOptimized([2, 3, 4, 5], [3, 4, 5, 6], 5)); // 7
```

**最长递增子序列（LIS）**

```typescript
function lengthOfLIS(nums: number[]): number {
  if (nums.length === 0) return 0;
  const dp = new Array(nums.length).fill(1);
  for (let i = 1; i < nums.length; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[j] < nums[i]) dp[i] = Math.max(dp[i], dp[j] + 1);
    }
  }
  return Math.max(...dp);
}

console.log(lengthOfLIS([10, 9, 2, 5, 3, 7, 101, 18])); // 4
```

### 3.2 常见误区

| 误区 | 正确理解 |
|------|---------|
| DP 就是递归加缓存 | 自底向上 DP 无递归开销，空间可优化 |
| 所有问题都适合 DP | DP 要求最优子结构和重叠子问题 |
| DP 一定比暴力快 | 状态空间过大时，DP 同样不可行 |
| 空间不能优化 | 很多线性 DP 可用滚动数组将 O(n^2) 降到 O(n) |

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
function minDistance(word1: string, word2: string): number {
  const m = word1.length, n = word2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (word1[i - 1] === word2[j - 1]) dp[i][j] = dp[i - 1][j - 1];
      else dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + 1);
    }
  }
  return dp[m][n];
}
console.log(minDistance('horse', 'ros')); // 3
```

### 最长公共子序列（LCS）

```typescript
function longestCommonSubsequence(text1: string, text2: string): number {
  const m = text1.length, n = text2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (text1[i - 1] === text2[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;
      else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[m][n];
}
console.log(longestCommonSubsequence('abcde', 'ace')); // 3
```

### 硬币找零（完全背包）

```typescript
function coinChange(coins: number[], amount: number): number {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (const coin of coins) {
    for (let i = coin; i <= amount; i++) dp[i] = Math.min(dp[i], dp[i - coin] + 1);
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}
console.log(coinChange([1, 2, 5], 11)); // 3
```

### 最大子数组和（Kadane 算法）

```typescript
function maxSubArray(nums: number[]): number {
  let maxSoFar = nums[0], maxEndingHere = nums[0];
  for (let i = 1; i < nums.length; i++) {
    maxEndingHere = Math.max(nums[i], maxEndingHere + nums[i]);
    maxSoFar = Math.max(maxSoFar, maxEndingHere);
  }
  return maxSoFar;
}
console.log(maxSubArray([-2, 1, -3, 4, -1, 2, 1, -5, 4])); // 6
```

### 矩阵链乘法（区间 DP）

```typescript
function matrixChainOrder(dims: number[]): { minCost: number; splits: number[][] } {
  const n = dims.length - 1;
  const dp: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  const split: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  for (let len = 2; len <= n; len++) {
    for (let i = 0; i <= n - len; i++) {
      const j = i + len - 1;
      dp[i][j] = Infinity;
      for (let k = i; k < j; k++) {
        const cost = dp[i][k] + dp[k + 1][j] + dims[i] * dims[k + 1] * dims[j + 1];
        if (cost < dp[i][j]) { dp[i][j] = cost; split[i][j] = k; }
      }
    }
  }
  return { minCost: dp[0][n - 1], splits: split };
}
console.log(matrixChainOrder([10, 30, 5, 60])); // { minCost: 4500 }
```

### 爬楼梯（简单线性 DP）

```typescript
function climbStairs(n: number): number {
  if (n <= 2) return n;
  let prev2 = 1, prev1 = 2;
  for (let i = 3; i <= n; i++) { const cur = prev1 + prev2; prev2 = prev1; prev1 = cur; }
  return prev1;
}
console.log(climbStairs(10)); // 89
```

### 打家劫舍（线性 DP 带状态限制）

```typescript
function rob(nums: number[]): number {
  if (nums.length === 0) return 0;
  if (nums.length === 1) return nums[0];
  let prev2 = nums[0], prev1 = Math.max(nums[0], nums[1]);
  for (let i = 2; i < nums.length; i++) { const cur = Math.max(prev1, prev2 + nums[i]); prev2 = prev1; prev1 = cur; }
  return prev1;
}
console.log(rob([2, 7, 9, 3, 1])); // 12
```

### 树形 DP — 二叉树最大直径

```typescript
interface TreeNode { val: number; left: TreeNode | null; right: TreeNode | null; }
function diameterOfBinaryTree(root: TreeNode | null): number {
  let maxDiameter = 0;
  function depth(node: TreeNode | null): number {
    if (!node) return 0;
    const left = depth(node.left), right = depth(node.right);
    maxDiameter = Math.max(maxDiameter, left + right);
    return 1 + Math.max(left, right);
  }
  depth(root);
  return maxDiameter;
}
const tree: TreeNode = { val: 1, left: { val: 2, left: { val: 4, left: null, right: null }, right: { val: 5, left: null, right: null } }, right: { val: 3, left: null, right: null } };
console.log(diameterOfBinaryTree(tree)); // 3
```

### 状态压缩 DP — 旅行商问题（TSP）

```typescript
function tsp(dist: number[][]): number {
  const n = dist.length, FULL_MASK = (1 << n) - 1;
  const dp: number[][] = Array.from({ length: 1 << n }, () => Array(n).fill(Infinity));
  dp[1][0] = 0;
  for (let mask = 1; mask <= FULL_MASK; mask++) {
    for (let u = 0; u < n; u++) {
      if (!(mask & (1 << u)) || dp[mask][u] === Infinity) continue;
      for (let v = 0; v < n; v++) {
        if (mask & (1 << v)) continue;
        const nextMask = mask | (1 << v);
        dp[nextMask][v] = Math.min(dp[nextMask][v], dp[mask][u] + dist[u][v]);
      }
    }
  }
  let minCost = Infinity;
  for (let i = 1; i < n; i++) minCost = Math.min(minCost, dp[FULL_MASK][i] + dist[i][0]);
  return minCost;
}
console.log(tsp([[0, 10, 15, 20], [10, 0, 35, 25], [15, 35, 0, 30], [20, 25, 30, 0]])); // 80
```

### LIS 二分优化（Patience Sorting）

```typescript
function lengthOfLISOptimal(nums: number[]): number {
  const tails: number[] = [];
  for (const num of nums) {
    let left = 0, right = tails.length;
    while (left < right) { const mid = (left + right) >> 1; if (tails[mid] < num) left = mid + 1; else right = mid; }
    tails[left] = num;
  }
  return tails.length;
}
console.log(lengthOfLISOptimal([10, 9, 2, 5, 3, 7, 101, 18])); // 4
```

### 单词拆分（字典 DP）

```typescript
function wordBreak(s: string, wordDict: string[]): boolean {
  const dp = new Array(s.length + 1).fill(false);
  dp[0] = true;
  for (let i = 1; i <= s.length; i++) {
    for (const word of wordDict) {
      if (i >= word.length && dp[i - word.length] && s.slice(i - word.length, i) === word) { dp[i] = true; break; }
    }
  }
  return dp[s.length];
}
console.log(wordBreak('leetcode', ['leet', 'code'])); // true
```

### 正则表达式匹配（双序列 DP）

```typescript
function isMatch(s: string, p: string): boolean {
  const m = s.length, n = p.length;
  const dp: boolean[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(false));
  dp[0][0] = true;
  for (let j = 2; j <= n; j++) if (p[j - 1] === '*') dp[0][j] = dp[0][j - 2];
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (p[j - 1] === '*') dp[i][j] = dp[i][j - 2] || ((p[j - 2] === '.' || p[j - 2] === s[i - 1]) && dp[i - 1][j]);
      else if (p[j - 1] === '.' || p[j - 1] === s[i - 1]) dp[i][j] = dp[i - 1][j - 1];
    }
  }
  return dp[m][n];
}
console.log(isMatch('aa', 'a*')); // true
```

### 数位 DP — 统计范围内满足条件的数字

```typescript
// digit-dp.ts — 统计 [0, n] 中数字和为 target 的个数
function countDigitSum(n: number, target: number): number {
  const digits = String(n).split('').map(Number);
  const memo = new Map<string, number>();

  function dfs(pos: number, sum: number, tight: boolean, leadingZero: boolean): number {
    if (pos === digits.length) return leadingZero ? 0 : (sum === target ? 1 : 0);
    const key = `${pos},${sum},${tight},${leadingZero}`;
    if (!tight && memo.has(key)) return memo.get(key)!;

    const limit = tight ? digits[pos] : 9;
    let count = 0;
    for (let d = 0; d <= limit; d++) {
      count += dfs(
        pos + 1,
        sum + d,
        tight && d === limit,
        leadingZero && d === 0
      );
    }
    if (!tight) memo.set(key, count);
    return count;
  }

  return dfs(0, 0, true, true);
}

console.log(countDigitSum(100, 5)); // 6 (5, 14, 23, 32, 41, 50)
```

### DP 优化技巧：Knuth 优化适用条件

```typescript
// Knuth Optimization：将 O(n^3) 区间 DP 优化为 O(n^2)
// 适用条件：
// 1. dp[i][j] = min(dp[i][k] + dp[k][j]) + C[i][j]   (i < k < j)
// 2. 四边形不等式：a ≤ b ≤ c ≤ d ⇒ C[a][c] + C[b][d] ≤ C[a][d] + C[b][c]
// 3. 单调性：C[b][c] ≤ C[a][d]
//
// 此时最优分割点 opt[i][j-1] ≤ opt[i][j] ≤ opt[i+1][j]

function knuthOptimization(n: number, cost: number[][]): number {
  const dp: number[][] = Array.from({ length: n }, () => Array(n).fill(Infinity));
  const opt: number[][] = Array.from({ length: n }, () => Array(n).fill(0));

  for (let i = 0; i < n; i++) { dp[i][i] = 0; opt[i][i] = i; }

  for (let len = 2; len <= n; len++) {
    for (let i = 0; i <= n - len; i++) {
      const j = i + len - 1;
      for (let k = opt[i][j - 1]; k <= opt[i + 1][j]; k++) {
        const val = (dp[i][k] ?? 0) + (dp[k + 1]?.[j] ?? 0) + cost[i][j];
        if (val < dp[i][j]) { dp[i][j] = val; opt[i][j] = k; }
      }
    }
  }
  return dp[0][n - 1];
}
```

### 树形 DP 换根（Re-rooting）

```typescript
// tree-reroot.ts — 计算每个节点作为根时的子树最大值
// 两次 DFS：第一次自底向上，第二次自顶向下传递父节点信息

interface TreeNodeR { id: number; children: { node: TreeNodeR; weight: number }[]; }

function rerootDP(root: TreeNodeR): Map<number, number> {
  const n = countNodes(root);
  const dpDown = new Map<number, number>(); // 以 u 为根的子树最优值
  const dpUp = new Map<number, number>();   // 以 u 为根、排除父方向的最优值
  const result = new Map<number, number>();

  // 第一次 DFS：计算 dpDown
  function dfs1(u: TreeNodeR, parent: TreeNodeR | null) {
    let best = 0;
    for (const { node: v, weight } of u.children) {
      if (v === parent) continue;
      dfs1(v, u);
      best = Math.max(best, (dpDown.get(v.id) ?? 0) + weight);
    }
    dpDown.set(u.id, best);
  }

  // 第二次 DFS：计算 dpUp 并合并结果
  function dfs2(u: TreeNodeR, parent: TreeNodeR | null, parentContribution: number) {
    // 收集所有子节点的贡献
    const childContribs = u.children
      .filter(({ node: v }) => v !== parent)
      .map(({ node: v, weight }) => (dpDown.get(v.id) ?? 0) + weight);

    childContribs.push(parentContribution);
    result.set(u.id, Math.max(...childContribs));

    // 前缀/后缀最大值数组，用于快速计算排除某一子树后的最大值
    const prefix: number[] = [];
    let running = 0;
    for (const c of childContribs) { prefix.push(running); running = Math.max(running, c); }

    let childIdx = 0;
    for (const { node: v, weight } of u.children) {
      if (v === parent) continue;
      const withoutV = Math.max(parentContribution, prefix[childIdx]);
      dfs2(v, u, withoutV + weight);
      childIdx++;
    }
  }

  dfs1(root, null);
  dfs2(root, null, 0);
  return result;
}

function countNodes(root: TreeNodeR): number {
  let c = 0;
  function dfs(u: TreeNodeR, p: TreeNodeR | null) {
    c++;
    for (const { node: v } of u.children) if (v !== p) dfs(v, u);
  }
  dfs(root, null);
  return c;
}
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
- [CSES Problem Set — Dynamic Programming](https://cses.fi/problemset/list/) — 芬兰计算机科学竞赛题集
- [Knuth Optimization — CP-Algorithms](https://cp-algorithms.com/dynamic_programming/knuth-optimization.html) — DP 优化技巧
- [Digit DP — Codeforces Blog](https://codeforces.com/blog/entry/53960) — 数位 DP 教程
- [SOS DP (Sum Over Subsets)](https://cp-algorithms.com/algebra/all-submasks.html) — 子集卷积 DP
- [Convex Hull Trick](https://cp-algorithms.com/geometry/convex_hull_trick.html) — 斜率优化 DP
- [DP on Trees — Codeforces](https://codeforces.com/blog/entry/20935) — 树形 DP 教程
- [Errichto: DP Tutorial](https://www.youtube.com/playlist?list=PLl0KD3g-oDOEbtmoKT5UWZ-0_QbyqhlCb) — 知名算法教育者 DP 视频系列
- [Algorithms Live: DP Optimizations](https://algorithms-live.blogspot.com/) — 高级 DP 优化讲座
- [Dynamic Programming — Brilliant.org](https://brilliant.org/wiki/dynamic-programming/) — 交互式 DP 学习
- [HackerRank Dynamic Programming](https://www.hackerrank.com/domains/algorithms?filters%5Bsubdomains%5D%5B%5D=dynamic-programming) — 在线练习
- [Educative: Grokking Dynamic Programming Patterns](https://www.educative.io/courses/grokking-dynamic-programming-patterns-for-coding-interviews) — 模式化学习

### 最长回文子串（中心扩展 + DP）

```typescript
function longestPalindrome(s: string): string {
  const n = s.length;
  const dp: boolean[][] = Array.from({ length: n }, () => Array(n).fill(false));
  let start = 0, maxLen = 1;

  for (let i = 0; i < n; i++) dp[i][i] = true;
  for (let i = 0; i < n - 1; i++) {
    if (s[i] === s[i + 1]) { dp[i][i + 1] = true; start = i; maxLen = 2; }
  }

  for (let len = 3; len <= n; len++) {
    for (let i = 0; i <= n - len; i++) {
      const j = i + len - 1;
      if (s[i] === s[j] && dp[i + 1][j - 1]) {
        dp[i][j] = true;
        start = i;
        maxLen = len;
      }
    }
  }
  return s.substring(start, start + maxLen);
}
console.log(longestPalindrome('babad')); // 'bab'
```

### 编辑距离空间优化（双行滚动）

```typescript
function minDistanceOpt(word1: string, word2: string): number {
  const m = word1.length, n = word2.length;
  if (m < n) return minDistanceOpt(word2, word1);
  let prev = new Array(n + 1).fill(0);
  let curr = new Array(n + 1).fill(0);
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      if (word1[i - 1] === word2[j - 1]) curr[j] = prev[j - 1];
      else curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + 1);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}
console.log(minDistanceOpt('horse', 'ros')); // 3
```

### 新增权威参考链接

- [GeeksforGeeks — Longest Palindromic Substring](https://www.geeksforgeeks.org/longest-palindromic-substring-dp-12/) — DP 解法详解
- [LeetCode 5 — Longest Palindromic Substring](https://leetcode.com/problems/longest-palindromic-substring/) — 经典面试题
- [CP-Algorithms — DP on Strings](https://cp-algorithms.com/string/string-processing.html) — 字符串 DP 专题
- [USACO Guide — Knapsack DP](https://usaco.guide/gold/knapsack) — 背包问题深入
- [Algorithm Design Manual (Skiena) — DP Chapter](http://www.algorist.com/) — 算法设计手册动态规划章节

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
