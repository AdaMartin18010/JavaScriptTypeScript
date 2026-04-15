# 算法理论汇总

> 本文件基于 `jsts-code-lab/05-algorithms` 下的 `sorting/`、`searching/`、`dynamic-programming/`、`graph/` 实现代码，
> 系统汇总排序、搜索、动态规划、图算法的复杂度，并提供循环不变式证明模板与递归关系求解方法。

---

## 目录

1. [算法复杂度总览](#算法复杂度总览)
2. [排序算法](#排序算法)
3. [搜索算法](#搜索算法)
4. [动态规划](#动态规划)
5. [图算法](#图算法)
6. [循环不变式证明模板](#循环不变式证明模板)
7. [递归关系求解](#递归关系求解)
   - 主定理
   - 代入法
   - 递归树

---

## 算法复杂度总览

| 算法 | 最好 | 平均 | 最坏 | 空间 | 稳定性 |
|------|------|------|------|------|--------|
| 归并排序 | $O(n \log n)$ | $O(n \log n)$ | $O(n \log n)$ | $O(n)$ | ✅ 稳定 |
| 快速排序 | $O(n \log n)$ | $O(n \log n)$ | $O(n^2)$ | $O(\log n)$ | ❌ 不稳定 |
| 堆排序 | $O(n \log n)$ | $O(n \log n)$ | $O(n \log n)$ | $O(1)$ | ❌ 不稳定 |
| 二分查找 | $O(1)$ | $O(\log n)$ | $O(\log n)$ | $O(1)$ | — |
| BFS / DFS | $O(|V|+|E|)$ | $O(|V|+|E|)$ | $O(|V|+|E|)$ | $O(|V|)$ | — |

---

## 排序算法

### 1. 归并排序 (`sorting/merge-sort.ts`)

**策略**：分治法（Divide and Conquer）。将数组对半分，递归排序左右子数组，再合并两个有序子数组。

**递归式**：
$$
T(n) = 2T\!\left(\frac{n}{2}\right) + O(n)
$$
其中 $O(n)$ 为 `merge` 过程合并两个子数组的代价。

**求解（主定理）**：$a=2, b=2, f(n)=O(n)$。
临界指数 $c_{\text{crit}} = \log_2 2 = 1$。
$f(n) = \Theta(n^{1})$，属于**情况 2**（$k=0$）：
$$
T(n) = \Theta(n \log n)
$$

**空间复杂度**：
- 基础版：每次递归创建新数组，总辅助空间 $O(n)$。
- 原地版 (`mergeSortInPlace`)：使用单个临时数组，空间仍为 $O(n)$，但避免了频繁的内存分配。

**稳定性**：`merge` 时遇到相等元素优先取左侧，保证稳定性。

### 2. 快速排序 (`sorting/quick-sort.ts`)

**策略**：分治法。选取 pivot，将数组划分为 `< pivot`、`== pivot`、`> pivot` 三部分，递归排序左右子区间。

**递归式（平均情况）**：
每次 pivot 大致平分数组：
$$
T(n) = 2T\!\left(\frac{n}{2}\right) + O(n) \Rightarrow T(n) = O(n \log n)
$$

**递归式（最坏情况）**：
数组已有序，每次 pivot 为极值，划分极度不平衡：
$$
T(n) = T(n-1) + O(n)
$$
展开得：
$$
T(n) = \sum_{i=1}^{n} O(i) = O(n^2)
$$

**空间复杂度**：
- 递归调用栈深度平均 $O(\log n)$，最坏 $O(n)$。
- 原地版 (`quickSortInPlace`) 辅助空间 $O(1)$，但递归栈仍为 $O(\log n)$。

**优化手段**：
- **三数取中法** (`medianOfThree`)：降低最坏情况概率。
- **迭代版** (`quickSortIterative`)：用显式栈代替递归，避免递归深度溢出，栈空间仍 $O(\log n)$。

### 3. 堆排序 (`04-data-structures/custom/heap.ts`)

**策略**：利用堆的性质进行原地排序。
1. `buildHeap`：$O(n)$ 将数组调整为堆。
2. 重复 $n$ 次 `extractMin`（或 `extractMax`），每次 $O(\log n)$。

**时间复杂度**：
$$
T(n) = O(n) + n \cdot O(\log n) = O(n \log n)
$$

**空间复杂度**：$O(1)$ 辅助空间（若使用原地堆调整）。本实现通过 `MinHeap.fromArray` 构建堆后提取，额外空间 $O(n)$。

---

## 搜索算法

### 二分查找 (`searching/binary-search.ts`)

**策略**：在有序数组中，每次将搜索范围减半。

**迭代版时间复杂度**：
设当前搜索区间长度为 $n$，每次循环后变为 $\lfloor n/2 \rfloor$。
循环次数 $k$ 满足 $n / 2^k \le 1$，即 $k \le \log_2 n$。
$$
T(n) = O(\log n)
$$

**空间复杂度**：
- 迭代版：$O(1)$。
- 递归版：调用栈深度 $O(\log n)$。

---

## 动态规划

> 基于 `dynamic-programming/fibonacci-dp.ts` 中的实现。

### 核心思想

动态规划（Dynamic Programming, DP）适用于具有**最优子结构**（Optimal Substructure）和**重叠子问题**（Overlapping Subproblems）的问题。

1. **最优子结构**：问题的最优解包含子问题的最优解。
2. **重叠子问题**：递归求解过程中，大量子问题被重复计算。

### 实现范式

| 范式 | 时间 | 空间 | 特点 |
|------|------|------|------|
| 记忆化搜索 (Top-down) | 通常为 $O(n)$ 或更高 | $O(n)$ + 递归栈 | 自顶向下，只计算需要的子问题 |
| 自底向上 (Bottom-up) | 通常为 $O(n)$ 或更高 | $O(n)$ | 填表，避免递归开销 |
| 空间优化 | 与 Bottom-up 相同 | 降至 $O(1)$ 或 $O(\min(m,n))$ | 只保留最近几维状态 |

### 各算法复杂度

| 算法 | 时间复杂度 | 空间复杂度 | 核心状态转移 |
|------|-----------|-----------|--------------|
| Fibonacci (记忆化) | $O(n)$ | $O(n)$ | $F(i) = F(i-1) + F(i-2)$ |
| Fibonacci (空间优化) | $O(n)$ | $O(1)$ | 滚动变量 `prev`, `curr` |
| 爬楼梯 | $O(n)$ | $O(1)$ | $dp[i] = dp[i-1] + dp[i-2]$ |
| 最大子数组和 (Kadane) | $O(n)$ | $O(1)$ | $current = \max(a_i, current + a_i)$ |
| 最长递增子序列 (LIS) | $O(n^2)$ | $O(n)$ | $dp[i] = \max_{j<i, a_j<a_i}(dp[j]+1)$ |
| 编辑距离 | $O(mn)$ | $O(mn)$ | 三操作取最小 + 相等优化 |
| 0/1 背包 | $O(nW)$ | $O(nW)$ | 选/不选第 $i$ 件物品 |

---

## 图算法

> 基于 `graph/bfs-dfs.ts` 中的实现。

### 1. 广度优先搜索 BFS

**策略**：从起点出发，按层扩展邻居节点，使用队列维护待访问节点。

**时间复杂度**：每个顶点入队一次，每条边被检查一次。
$$
T(|V|, |E|) = O(|V| + |E|)
$$

**空间复杂度**：队列最多容纳 $O(|V|)$ 个顶点，访问标记集合 $O(|V|)$。

**最短路径**：在无权图中，BFS 第一次访问到目标节点时，路径长度即为最短路径。

### 2. 深度优先搜索 DFS

**策略**：沿一条路径尽可能深入，直到无法继续再回溯。

**时间复杂度**：同 BFS，$O(|V| + |E|)$。

**空间复杂度**：递归栈深度最坏 $O(|V|)$。

### 3. 拓扑排序

**策略**：基于 DFS 的逆后序输出。检测环时使用三色标记法（未访问/临时标记/已访问）。

**时间复杂度**：每个顶点和边访问一次，$O(|V| + |E|)$。

---

## 循环不变式证明模板

循环不变式（Loop Invariant）是证明迭代算法正确性的核心工具。证明分三步：

### 模板

> **Initialization（初始化）**：在循环第一次迭代之前，循环不变式成立。
>
> **Maintenance（保持）**：若循环的某次迭代之前不变式成立，则下一次迭代之前不变式仍然成立。
>
> **Termination（终止）**：当循环终止时，不变式给出一个有助于证明算法正确的性质。

### 示例：二分查找迭代版的循环不变式

设数组 `arr` 已按升序排列，搜索区间为 `[left, right]`。

**循环不变式**：若目标值 `target` 存在于 `arr` 中，则其索引一定在区间 `[left, right]` 内。

- **Initialization**：初始时 `left = 0`，`right = n - 1`。若 `target` 存在，必然在此区间内。成立。
- **Maintenance**：设当前中点为 `mid`。
  - 若 `arr[mid] < target`，则 `target` 必在右半区间，更新 `left = mid + 1`，不变式保持。
  - 若 `arr[mid] > target`，则 `target` 必在左半区间，更新 `right = mid - 1`，不变式保持。
  - 若相等，直接返回，算法终止。
- **Termination**：循环终止时 `left > right`。由不变式知，若此前未返回，则 `target` 不在数组中，正确返回 `-1`。

---

## 递归关系求解

### 1. 主定理 (Master Theorem)

用于求解形如：
$$
T(n) = a \, T\!\left(\frac{n}{b}\right) + f(n)
$$

详见 [`04-data-structures/THEORY.md`](../04-data-structures/THEORY.md) 的“主定理”章节。以下是算法场景的直接应用：

- **归并排序**：$T(n) = 2T(n/2) + O(n) \Rightarrow T(n) = \Theta(n \log n)$
- **二分查找**：$T(n) = T(n/2) + O(1) \Rightarrow T(n) = \Theta(\log n)$
- **快速排序（平均）**：$T(n) = 2T(n/2) + O(n) \Rightarrow T(n) = \Theta(n \log n)$

### 2. 代入法 (Substitution Method)

**步骤**：
1. 猜测解的形式（如 $T(n) = O(n \log n)$）。
2. 用数学归纳法证明猜测成立。

**示例**：证明快速排序平均递归式 $T(n) = 2T(n/2) + O(n)$ 的上界为 $O(n \log n)$。

**猜测**：$T(n) \le c \, n \log n$（$c$ 为足够大的常数）。

**归纳假设**：对所有 $m < n$，$T(m) \le c \, m \log m$ 成立。

**推导**：
$$
\begin{aligned}
T(n) &\le 2T(n/2) + d \, n \\
     &\le 2 \cdot c \cdot \frac{n}{2} \log \frac{n}{2} + d \, n \\
     &= c n (\log n - 1) + d n \\
     &= c n \log n - c n + d n \\
     &\le c n \log n \quad (\text{当 } c \ge d \text{ 时})
\end{aligned}
$$

成立。

### 3. 递归树法 (Recursion Tree Method)

**步骤**：
1. 画出递归调用的树形结构。
2. 计算每层的工作量（代价）。
3. 对所有层的工作量求和。

**示例 1：归并排序**
- 树高：$\log_2 n$（每层问题规模减半）
- 每层工作量：$O(n)$（所有子问题的合并代价之和为 $n$）
- 总代价：$O(n) \times \log_2 n = O(n \log n)$

**示例 2：快速排序最坏情况**
- 树高：$n$（每次 pivot 为极值，子问题规模为 $n-1$ 和 $0$）
- 第 $i$ 层工作量：$O(n - i)$
- 总代价：$\sum_{i=0}^{n-1} O(n - i) = O(n^2)$

**示例 3：二分查找**
- 树高：$\log_2 n$
- 每层工作量：$O(1)$
- 总代价：$O(1) \times \log_2 n = O(\log n)$

---

## 参考实现文件

- `sorting/merge-sort.ts`
- `sorting/quick-sort.ts`
- `searching/binary-search.ts`
- `dynamic-programming/fibonacci-dp.ts`
- `graph/bfs-dfs.ts`
- `../04-data-structures/custom/heap.ts`（堆排序）
