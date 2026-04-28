---
last-updated: 2026-04-27
review-cycle: 6 months
next-review: 2026-10-27
status: current
---
﻿# 数据结构与算法理论全景综述

> 本文档系统梳理计算机科学核心数据结构与算法理论，结合 JavaScript/TypeScript 实现与形式化分析。

---

## 目录

- [数据结构与算法理论全景综述](#数据结构与算法理论全景综述)
  - [目录](#目录)
  - [1. 复杂度分析理论](#1-复杂度分析理论)
    - [1.1 渐近记号体系](#11-渐近记号体系)
      - [大 O 记号（渐进上界）](#大-o-记号渐进上界)
      - [主定理](#主定理)
  - [2. JavaScript 内置数据结构](#2-javascript-内置数据结构)
    - [2.1 Array](#21-array)
  - [3. 树结构](#3-树结构)
    - [3.1 二叉树](#31-二叉树)
    - [3.2 AVL 树](#32-avl-树)
  - [4. 图算法](#4-图算法)
    - [4.1 BFS](#41-bfs)
    - [4.2 DFS](#42-dfs)
  - [5. 排序算法](#5-排序算法)
  - [6. 动态规划](#6-动态规划)
  - [7. 贪心算法](#7-贪心算法)
  - [8. 字符串算法](#8-字符串算法)
  - [9. 高级数据结构](#9-高级数据结构)
  - [10. 算法设计范式](#10-算法设计范式)
  - [详细内容](#详细内容)
    - [1. 复杂度分析理论详解](#1-复杂度分析理论详解)
      - [1.1 大 O、大 Omega、大 Theta](#11-大-o大-omega大-theta)
      - [1.2 主定理应用](#12-主定理应用)
      - [1.3 摊还分析](#13-摊还分析)
    - [2. JavaScript 数据结构实现](#2-javascript-数据结构实现)
      - [2.1 完整 Array 实现](#21-完整-array-实现)
      - [2.2 完整 HashTable 实现](#22-完整-hashtable-实现)
    - [3. 树结构详解](#3-树结构详解)
      - [3.1 二叉搜索树 (BST)](#31-二叉搜索树-bst)
      - [3.2 AVL 树详解](#32-avl-树详解)
      - [3.3 红黑树详解](#33-红黑树详解)
      - [3.4 Trie (前缀树)](#34-trie-前缀树)
    - [4. 图算法详解](#4-图算法详解)
      - [4.1 图的表示](#41-图的表示)
      - [4.2 BFS (广度优先搜索)](#42-bfs-广度优先搜索)
      - [4.3 DFS (深度优先搜索)](#43-dfs-深度优先搜索)
      - [4.4 Dijkstra 算法](#44-dijkstra-算法)
      - [4.5 A\* 算法](#45-a-算法)
      - [4.6 并查集 (Union-Find)](#46-并查集-union-find)
    - [5. 排序算法详解](#5-排序算法详解)
      - [5.1 快速排序 (Quick Sort)](#51-快速排序-quick-sort)
      - [5.2 归并排序 (Merge Sort)](#52-归并排序-merge-sort)
      - [5.3 堆排序 (Heap Sort)](#53-堆排序-heap-sort)
      - [5.4 计数排序 (Counting Sort)](#54-计数排序-counting-sort)
    - [6. 动态规划理论](#6-动态规划理论)
      - [6.1 核心概念](#61-核心概念)
      - [6.2 经典问题: 斐波那契数列](#62-经典问题-斐波那契数列)
      - [6.3 经典问题: 最长公共子序列 (LCS)](#63-经典问题-最长公共子序列-lcs)
      - [6.4 经典问题: 0/1 背包](#64-经典问题-01-背包)
    - [7. 贪心算法](#7-贪心算法-1)
      - [7.1 核心思想](#71-核心思想)
      - [7.2 经典问题: 活动选择问题](#72-经典问题-活动选择问题)
      - [7.3 经典问题: 霍夫曼编码](#73-经典问题-霍夫曼编码)
    - [8. 字符串算法](#8-字符串算法-1)
      - [8.1 KMP 算法](#81-kmp-算法)
      - [8.2 Rabin-Karp 算法](#82-rabin-karp-算法)
    - [9. 高级数据结构](#9-高级数据结构-1)
      - [9.1 线段树 (Segment Tree)](#91-线段树-segment-tree)
      - [9.2 树状数组 (Fenwick Tree / Binary Indexed Tree)](#92-树状数组-fenwick-tree--binary-indexed-tree)
      - [9.3 跳表 (Skip List)](#93-跳表-skip-list)
    - [10. 算法设计范式](#10-算法设计范式-1)
      - [10.1 分治法 (Divide and Conquer)](#101-分治法-divide-and-conquer)
      - [10.2 回溯法 (Backtracking)](#102-回溯法-backtracking)
      - [10.3 分支限界 (Branch and Bound)](#103-分支限界-branch-and-bound)
  - [总结](#总结)

---

## 1. 复杂度分析理论

### 1.1 渐近记号体系

#### 大 O 记号（渐进上界）

**形式化定义：**

$$O(g(n)) = \\{f(n) : \\exists c > 0, n_0 > 0, \\forall n \\geq n_0, 0 \\leq f(n) \\leq c \\cdot g(n)\\}$$

**示例：** 线性搜索 T(n) = O(n)

#### 主定理

对于形如 T(n) = aT(n/b) + f(n) 的递推式。

---

## 2. JavaScript 内置数据结构

### 2.1 Array

| 操作 | 平均时间 | 最坏时间 |
|------|---------|---------|
| push/pop | O(1)* | O(n) |
| shift/unshift | O(n) | O(n) |
| access | O(1) | O(1) |

---

## 3. 树结构

### 3.1 二叉树

```typescript
class TreeNode<T> {
    value: T;
    left: TreeNode<T> | null = null;
    right: TreeNode<T> | null = null;

    constructor(value: T) {
        this.value = value;
    }
}
```

### 3.2 AVL 树

自平衡二叉搜索树

---

## 4. 图算法

### 4.1 BFS

广度优先搜索

### 4.2 DFS

深度优先搜索

---

## 5. 排序算法

| 算法 | 时间 | 空间 | 稳定性 |
|------|-----|------|--------|
| 快排 | O(n log n) | O(log n) | 不稳定 |
| 归并 | O(n log n) | O(n) | 稳定 |

---

## 6. 动态规划

最优子结构 + 重叠子问题

---

## 7. 贪心算法

局部最优选择

---

## 8. 字符串算法

KMP, Rabin-Karp

---

## 9. 高级数据结构

线段树、树状数组

---

## 10. 算法设计范式

分治、回溯、分支限界


---

## 详细内容

### 1. 复杂度分析理论详解

#### 1.1 大 O、大 Omega、大 Theta

**大 O (Big-O)**: 描述算法运行时间的上界

- f(n) = O(g(n)) 表示 f(n) 的增长速度不超过 g(n)
- 例如: 3n^2 + 2n + 1 = O(n^2)

**大 Omega (Big-Omega)**: 描述算法运行时间的下界

- f(n) = Omega(g(n)) 表示 f(n) 的增长速度至少为 g(n)
- 例如: 比较排序的下界为 Omega(n log n)

**大 Theta (Big-Theta)**: 描述算法运行时间的紧确界

- f(n) = Theta(g(n)) 当且仅当 f(n) = O(g(n)) 且 f(n) = Omega(g(n))

#### 1.2 主定理应用

```
T(n) = aT(n/b) + f(n)

情况1: 若 f(n) = O(n^(log_b a - epsilon))，则 T(n) = Theta(n^log_b a)
情况2: 若 f(n) = Theta(n^log_b a)，则 T(n) = Theta(n^log_b a * log n)
情况3: 若 f(n) = Omega(n^(log_b a + epsilon))，则 T(n) = Theta(f(n))
```

**示例:**

- 归并排序: T(n) = 2T(n/2) + O(n) -> Case 2 -> Theta(n log n)
- 二分查找: T(n) = T(n/2) + O(1) -> Case 2 -> Theta(log n)

#### 1.3 摊还分析

摊还分析计算操作序列的平均成本，即使单个操作成本很高。

**动态数组 push 操作的摊还分析:**

- 大多数 push: O(1)
- 偶尔 resize: O(n)
- n 次操作总成本: O(n)
- 摊还成本: O(1)

---

### 2. JavaScript 数据结构实现

#### 2.1 完整 Array 实现

```typescript
interface IArray<T> {
    length: number;
    push(item: T): number;
    pop(): T | undefined;
    shift(): T | undefined;
    unshift(item: T): number;
    splice(start: number, deleteCount?: number, ...items: T[]): T[];
    indexOf(item: T): number;
}

class FormalArray<T> implements IArray<T> {
    private data: T[] = [];
    length: number = 0;

    push(item: T): number {
        this.data[this.length] = item;
        return ++this.length;
    }

    pop(): T | undefined {
        if (this.length === 0) return undefined;
        return this.data[--this.length];
    }

    shift(): T | undefined {
        if (this.length === 0) return undefined;
        const first = this.data[0];
        for (let i = 0; i < this.length - 1; i++) {
            this.data[i] = this.data[i + 1];
        }
        this.length--;
        return first;
    }

    unshift(item: T): number {
        for (let i = this.length; i > 0; i--) {
            this.data[i] = this.data[i - 1];
        }
        this.data[0] = item;
        return ++this.length;
    }

    splice(start: number, deleteCount: number = 0, ...items: T[]): T[] {
        const removed: T[] = [];
        const actualDelete = Math.min(deleteCount, this.length - start);

        for (let i = 0; i < actualDelete; i++) {
            removed[i] = this.data[start + i];
        }

        const shift = items.length - actualDelete;
        if (shift > 0) {
            for (let i = this.length - 1; i >= start + actualDelete; i--) {
                this.data[i + shift] = this.data[i];
            }
        }

        for (let i = 0; i < items.length; i++) {
            this.data[start + i] = items[i];
        }

        this.length += shift;
        return removed;
    }

    indexOf(item: T): number {
        for (let i = 0; i < this.length; i++) {
            if (Object.is(this.data[i], item)) return i;
        }
        return -1;
    }
}
```

#### 2.2 完整 HashTable 实现

```typescript
class HashTable<K, V> {
    private table: Array<{ key: K; value: V } | undefined>;
    private size: number = 0;
    private capacity: number;

    constructor(initialCapacity: number = 16) {
        this.capacity = initialCapacity;
        this.table = new Array(initialCapacity);
    }

    private hash(key: K): number {
        const str = String(key);
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash = hash & hash;
        }
        return Math.abs(hash) % this.capacity;
    }

    private probe(index: number, i: number): number {
        return (index + i * i) % this.capacity;
    }

    set(key: K, value: V): void {
        if (this.size / this.capacity > 0.75) {
            this.resize();
        }

        let index = this.hash(key);
        let i = 0;

        while (this.table[index] !== undefined &&
               this.table[index]?.key !== key) {
            index = this.probe(this.hash(key), ++i);
        }

        if (this.table[index] === undefined) this.size++;
        this.table[index] = { key, value };
    }

    get(key: K): V | undefined {
        let index = this.hash(key);
        let i = 0;

        while (this.table[index] !== undefined) {
            if (this.table[index]!.key === key) {
                return this.table[index]!.value;
            }
            index = this.probe(this.hash(key), ++i);
        }
        return undefined;
    }

    delete(key: K): boolean {
        let index = this.hash(key);
        let i = 0;

        while (this.table[index] !== undefined) {
            if (this.table[index]!.key === key) {
                this.table[index] = undefined;
                this.size--;
                return true;
            }
            index = this.probe(this.hash(key), ++i);
        }
        return false;
    }

    private resize(): void {
        const oldTable = this.table;
        this.capacity *= 2;
        this.size = 0;
        this.table = new Array(this.capacity);

        for (const entry of oldTable) {
            if (entry) this.set(entry.key, entry.value);
        }
    }
}
```

---

### 3. 树结构详解

#### 3.1 二叉搜索树 (BST)

**性质:** 对于每个节点，左子树所有值 < 节点值 < 右子树所有值

**复杂度:**

- 平均: O(log n) 搜索/插入/删除
- 最坏: O(n)（退化成链表）

```typescript
class BSTNode<T> {
    value: T;
    left: BSTNode<T> | null = null;
    right: BSTNode<T> | null = null;

    constructor(value: T) {
        this.value = value;
    }
}

class BinarySearchTree<T> {
    root: BSTNode<T> | null = null;

    insert(value: T): void {
        this.root = this.insertNode(this.root, value);
    }

    private insertNode(node: BSTNode<T> | null, value: T): BSTNode<T> {
        if (!node) return new BSTNode(value);

        if (value < node.value) {
            node.left = this.insertNode(node.left, value);
        } else if (value > node.value) {
            node.right = this.insertNode(node.right, value);
        }
        return node;
    }

    search(value: T): boolean {
        let current = this.root;
        while (current) {
            if (value === current.value) return true;
            current = value < current.value ? current.left : current.right;
        }
        return false;
    }
}
```

#### 3.2 AVL 树详解

**平衡条件:** |height(left) - height(right)| <= 1

**旋转操作:**

- LL: 右旋
- RR: 左旋
- LR: 先左旋后右旋
- RL: 先右旋后左旋

```typescript
class AVLNode<T> {
    value: T;
    left: AVLNode<T> | null = null;
    right: AVLNode<T> | null = null;
    height: number = 1;

    constructor(value: T) {
        this.value = value;
    }
}

class AVLTree<T> {
    root: AVLNode<T> | null = null;

    private height(node: AVLNode<T> | null): number {
        return node ? node.height : 0;
    }

    private balance(node: AVLNode<T> | null): number {
        return node ? this.height(node.left) - this.height(node.right) : 0;
    }

    private updateHeight(node: AVLNode<T>): void {
        node.height = 1 + Math.max(
            this.height(node.left),
            this.height(node.right)
        );
    }

    private rotateRight(y: AVLNode<T>): AVLNode<T> {
        const x = y.left!;
        const T2 = x.right;

        x.right = y;
        y.left = T2;

        this.updateHeight(y);
        this.updateHeight(x);
        return x;
    }

    private rotateLeft(x: AVLNode<T>): AVLNode<T> {
        const y = x.right!;
        const T2 = y.left;

        y.left = x;
        x.right = T2;

        this.updateHeight(x);
        this.updateHeight(y);
        return y;
    }

    insert(value: T): void {
        this.root = this.insertNode(this.root, value);
    }

    private insertNode(node: AVLNode<T> | null, value: T): AVLNode<T> {
        if (!node) return new AVLNode(value);

        if (value < node.value) {
            node.left = this.insertNode(node.left, value);
        } else if (value > node.value) {
            node.right = this.insertNode(node.right, value);
        } else {
            return node;
        }

        this.updateHeight(node);
        const balance = this.balance(node);

        // LL
        if (balance > 1 && value < node.left!.value) {
            return this.rotateRight(node);
        }
        // RR
        if (balance < -1 && value > node.right!.value) {
            return this.rotateLeft(node);
        }
        // LR
        if (balance > 1 && value > node.left!.value) {
            node.left = this.rotateLeft(node.left!);
            return this.rotateRight(node);
        }
        // RL
        if (balance < -1 && value < node.right!.value) {
            node.right = this.rotateRight(node.right!);
            return this.rotateLeft(node);
        }

        return node;
    }
}
```

#### 3.3 红黑树详解

**性质:**

1. 每个节点是红色或黑色
2. 根节点是黑色
3. 红色节点的子节点必须是黑色
4. 从任一节点的所有路径包含相同数目的黑色节点

**保证:** 最长路径不超过最短路径的两倍

**复杂度:** 所有操作 O(log n)

#### 3.4 Trie (前缀树)

**应用:** 字符串前缀匹配、自动补全

```typescript
class TrieNode {
    children: Map<string, TrieNode> = new Map();
    isEnd: boolean = false;
}

class Trie {
    root: TrieNode = new TrieNode();

    insert(word: string): void {
        let node = this.root;
        for (const char of word) {
            if (!node.children.has(char)) {
                node.children.set(char, new TrieNode());
            }
            node = node.children.get(char)!;
        }
        node.isEnd = true;
    }

    search(word: string): boolean {
        const node = this.findNode(word);
        return node !== null && node.isEnd;
    }

    startsWith(prefix: string): boolean {
        return this.findNode(prefix) !== null;
    }

    private findNode(str: string): TrieNode | null {
        let node = this.root;
        for (const char of str) {
            if (!node.children.has(char)) return null;
            node = node.children.get(char)!;
        }
        return node;
    }
}
```


---

### 4. 图算法详解

#### 4.1 图的表示

**邻接表:** 空间 O(V + E)，适合稀疏图
**邻接矩阵:** 空间 O(V^2)，适合稠密图

```typescript
// 邻接表实现
class Graph<T> {
    adjacencyList: Map<T, T[]> = new Map();

    addVertex(vertex: T): void {
        if (!this.adjacencyList.has(vertex)) {
            this.adjacencyList.set(vertex, []);
        }
    }

    addEdge(from: T, to: T): void {
        this.addVertex(from);
        this.addVertex(to);
        this.adjacencyList.get(from)!.push(to);
    }

    getNeighbors(vertex: T): T[] {
        return this.adjacencyList.get(vertex) || [];
    }
}
```

#### 4.2 BFS (广度优先搜索)

**算法描述:**

```
BFS(G, s):
    初始化: 所有顶点为白色，distance[s] = 0
    queue = [s]
    标记 s 为灰色

    while queue 不为空:
        u = queue.dequeue()
        for 每个邻接点 v of u:
            if v 是白色:
                标记 v 为灰色
                distance[v] = distance[u] + 1
                queue.enqueue(v)
        标记 u 为黑色
```

**复杂度:** O(V + E)

```typescript
function bfs<T>(graph: Graph<T>, start: T): Map<T, number> {
    const visited = new Set<T>();
    const distance = new Map<T, number>();
    const queue: T[] = [start];

    visited.add(start);
    distance.set(start, 0);

    while (queue.length > 0) {
        const vertex = queue.shift()!;
        const dist = distance.get(vertex)!;

        for (const neighbor of graph.getNeighbors(vertex)) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                distance.set(neighbor, dist + 1);
                queue.push(neighbor);
            }
        }
    }

    return distance;
}
```

#### 4.3 DFS (深度优先搜索)

**算法描述:**

```
DFS(G):
    for 每个顶点 u:
        if u 是白色:
            DFS-Visit(u)

DFS-Visit(u):
    标记 u 为灰色
    for 每个邻接点 v of u:
        if v 是白色:
            DFS-Visit(v)
    标记 u 为黑色
```

**复杂度:** O(V + E)

```typescript
function dfs<T>(graph: Graph<T>, start: T): T[] {
    const visited = new Set<T>();
    const result: T[] = [];

    function dfsVisit(vertex: T): void {
        visited.add(vertex);
        result.push(vertex);

        for (const neighbor of graph.getNeighbors(vertex)) {
            if (!visited.has(neighbor)) {
                dfsVisit(neighbor);
            }
        }
    }

    dfsVisit(start);
    return result;
}

// 非递归 DFS
function dfsIterative<T>(graph: Graph<T>, start: T): T[] {
    const visited = new Set<T>();
    const stack: T[] = [start];
    const result: T[] = [];

    while (stack.length > 0) {
        const vertex = stack.pop()!;

        if (!visited.has(vertex)) {
            visited.add(vertex);
            result.push(vertex);

            for (const neighbor of graph.getNeighbors(vertex)) {
                if (!visited.has(neighbor)) {
                    stack.push(neighbor);
                }
            }
        }
    }

    return result;
}
```

#### 4.4 Dijkstra 算法

**用途:** 单源最短路径（非负权图）

**算法描述:**

```
Dijkstra(G, s):
    初始化: distance[s] = 0, 其他为无穷大
    S = 空集合
    Q = 所有顶点

    while Q 不为空:
        u = Q 中 distance 最小的顶点
        S = S + {u}
        for 每个邻接点 v of u:
            if distance[v] > distance[u] + w(u, v):
                distance[v] = distance[u] + w(u, v)
```

**复杂度:**

- 数组实现: O(V^2)
- 优先队列: O((V + E) log V)

```typescript
interface Edge {
    to: string;
    weight: number;
}

class WeightedGraph {
    adjacencyList: Map<string, Edge[]> = new Map();

    addEdge(from: string, to: string, weight: number): void {
        if (!this.adjacencyList.has(from)) {
            this.adjacencyList.set(from, []);
        }
        this.adjacencyList.get(from)!.push({ to, weight });
    }

    dijkstra(start: string): Map<string, number> {
        const distances = new Map<string, number>();
        const visited = new Set<string>();

        // 初始化
        for (const vertex of this.adjacencyList.keys()) {
            distances.set(vertex, vertex === start ? 0 : Infinity);
        }

        while (visited.size < this.adjacencyList.size) {
            // 找最小距离
            let minVertex: string | null = null;
            let minDist = Infinity;

            for (const [vertex, dist] of distances) {
                if (!visited.has(vertex) && dist < minDist) {
                    minDist = dist;
                    minVertex = vertex;
                }
            }

            if (!minVertex) break;
            visited.add(minVertex);

            // 更新邻接点距离
            const edges = this.adjacencyList.get(minVertex) || [];
            for (const edge of edges) {
                if (!visited.has(edge.to)) {
                    const newDist = minDist + edge.weight;
                    if (newDist < (distances.get(edge.to) || Infinity)) {
                        distances.set(edge.to, newDist);
                    }
                }
            }
        }

        return distances;
    }
}
```

#### 4.5 A* 算法

**用途:** 启发式搜索最短路径

**评估函数:** f(n) = g(n) + h(n)

- g(n): 从起点到 n 的实际成本
- h(n): 从 n 到终点的启发式估计成本

```typescript
interface AStarNode {
    x: number;
    y: number;
    g: number; // 实际成本
    f: number; // 总估计成本
    parent?: AStarNode;
}

function heuristic(a: AStarNode, b: AStarNode): number {
    // 曼哈顿距离
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function aStar(
    grid: number[][],
    start: [number, number],
    end: [number, number]
): [number, number][] | null {
    const openSet: AStarNode[] = [];
    const closedSet = new Set<string>();

    const startNode: AStarNode = {
        x: start[0],
        y: start[1],
        g: 0,
        f: heuristic({ x: start[0], y: start[1], g: 0, f: 0 },
                     { x: end[0], y: end[1], g: 0, f: 0 })
    };

    openSet.push(startNode);

    while (openSet.length > 0) {
        // 找 f 值最小的节点
        openSet.sort((a, b) => a.f - b.f);
        const current = openSet.shift()!;

        if (current.x === end[0] && current.y === end[1]) {
            // 重建路径
            const path: [number, number][] = [];
            let node: AStarNode | undefined = current;
            while (node) {
                path.unshift([node.x, node.y]);
                node = node.parent;
            }
            return path;
        }

        const key = `${current.x},${current.y}`;
        if (closedSet.has(key)) continue;
        closedSet.add(key);

        // 检查四个方向
        const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
        for (const [dx, dy] of directions) {
            const nx = current.x + dx;
            const ny = current.y + dy;

            if (nx < 0 || ny < 0 || nx >= grid.length || ny >= grid[0].length) continue;
            if (grid[nx][ny] === 1) continue; // 障碍物

            const neighbor: AStarNode = {
                x: nx,
                y: ny,
                g: current.g + 1,
                f: 0,
                parent: current
            };
            neighbor.f = neighbor.g + heuristic(neighbor, { x: end[0], y: end[1], g: 0, f: 0 });

            const neighborKey = `${nx},${ny}`;
            if (!closedSet.has(neighborKey)) {
                openSet.push(neighbor);
            }
        }
    }

    return null; // 无路径
}
```

#### 4.6 并查集 (Union-Find)

**用途:** 连通性检测、最小生成树（Kruskal）

**操作:**

- Find: 查找元素所属集合（路径压缩）
- Union: 合并两个集合（按秩合并）

**复杂度:** 近乎 O(1)（阿克曼函数的反函数）

```typescript
class UnionFind {
    parent: number[];
    rank: number[];

    constructor(n: number) {
        this.parent = Array.from({ length: n }, (_, i) => i);
        this.rank = new Array(n).fill(0);
    }

    find(x: number): number {
        if (this.parent[x] !== x) {
            this.parent[x] = this.find(this.parent[x]); // 路径压缩
        }
        return this.parent[x];
    }

    union(x: number, y: number): boolean {
        const rootX = this.find(x);
        const rootY = this.find(y);

        if (rootX === rootY) return false;

        // 按秩合并
        if (this.rank[rootX] < this.rank[rootY]) {
            this.parent[rootX] = rootY;
        } else if (this.rank[rootX] > this.rank[rootY]) {
            this.parent[rootY] = rootX;
        } else {
            this.parent[rootY] = rootX;
            this.rank[rootX]++;
        }
        return true;
    }

    isConnected(x: number, y: number): boolean {
        return this.find(x) === this.find(y);
    }
}
```

---

### 5. 排序算法详解

#### 5.1 快速排序 (Quick Sort)

**分治策略:**

1. 选择基准元素 (pivot)
2. 分区: 小于 pivot 的在左，大于的在右
3. 递归排序左右两部分

**复杂度:**

- 平均: O(n log n)
- 最坏: O(n^2)（已排序数组）
- 空间: O(log n)

```typescript
function quickSort(arr: number[]): number[] {
    if (arr.length <= 1) return arr;

    const pivot = arr[Math.floor(arr.length / 2)];
    const left = arr.filter(x => x < pivot);
    const middle = arr.filter(x => x === pivot);
    const right = arr.filter(x => x > pivot);

    return [...quickSort(left), ...middle, ...quickSort(right)];
}

// 原地快排
function quickSortInPlace(arr: number[], low = 0, high = arr.length - 1): void {
    if (low < high) {
        const pivotIndex = partition(arr, low, high);
        quickSortInPlace(arr, low, pivotIndex - 1);
        quickSortInPlace(arr, pivotIndex + 1, high);
    }
}

function partition(arr: number[], low: number, high: number): number {
    const pivot = arr[high];
    let i = low - 1;

    for (let j = low; j < high; j++) {
        if (arr[j] <= pivot) {
            i++;
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }

    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    return i + 1;
}
```

#### 5.2 归并排序 (Merge Sort)

**分治策略:**

1. 将数组分成两半
2. 递归排序每一半
3. 合并两个有序数组

**复杂度:**

- 时间: O(n log n)（稳定）
- 空间: O(n)

```typescript
function mergeSort(arr: number[]): number[] {
    if (arr.length <= 1) return arr;

    const mid = Math.floor(arr.length / 2);
    const left = mergeSort(arr.slice(0, mid));
    const right = mergeSort(arr.slice(mid));

    return merge(left, right);
}

function merge(left: number[], right: number[]): number[] {
    const result: number[] = [];
    let i = 0, j = 0;

    while (i < left.length && j < right.length) {
        if (left[i] <= right[j]) {
            result.push(left[i++]);
        } else {
            result.push(right[j++]);
        }
    }

    return result.concat(left.slice(i), right.slice(j));
}
```

#### 5.3 堆排序 (Heap Sort)

**步骤:**

1. 构建最大堆
2. 将堆顶（最大值）与末尾交换
3. 调整堆，重复步骤2

**复杂度:**

- 时间: O(n log n)
- 空间: O(1)

```typescript
function heapSort(arr: number[]): void {
    const n = arr.length;

    // 构建最大堆
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
        heapify(arr, n, i);
    }

    // 提取元素
    for (let i = n - 1; i > 0; i--) {
        [arr[0], arr[i]] = [arr[i], arr[0]];
        heapify(arr, i, 0);
    }
}

function heapify(arr: number[], n: number, i: number): void {
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;

    if (left < n && arr[left] > arr[largest]) {
        largest = left;
    }

    if (right < n && arr[right] > arr[largest]) {
        largest = right;
    }

    if (largest !== i) {
        [arr[i], arr[largest]] = [arr[largest], arr[i]];
        heapify(arr, n, largest);
    }
}
```

#### 5.4 计数排序 (Counting Sort)

**适用:** 数据范围较小的整数排序

**复杂度:**

- 时间: O(n + k)，k 为数据范围
- 空间: O(k)

```typescript
function countingSort(arr: number[], maxValue: number): number[] {
    const count = new Array(maxValue + 1).fill(0);
    const output = new Array(arr.length);

    // 计数
    for (const num of arr) {
        count[num]++;
    }

    // 累加
    for (let i = 1; i <= maxValue; i++) {
        count[i] += count[i - 1];
    }

    // 构建输出（从后向前保持稳定性）
    for (let i = arr.length - 1; i >= 0; i--) {
        output[count[arr[i]] - 1] = arr[i];
        count[arr[i]]--;
    }

    return output;
}
```

---

### 6. 动态规划理论

#### 6.1 核心概念

**最优子结构:**
问题的最优解包含子问题的最优解。

**重叠子问题:**
递归求解时会重复计算相同的子问题。

**解决方法:**

1. 记忆化搜索（自顶向下）
2. 表格法（自底向上）

#### 6.2 经典问题: 斐波那契数列

```typescript
// 递归 (指数级)
function fibRecursive(n: number): number {
    if (n <= 1) return n;
    return fibRecursive(n - 1) + fibRecursive(n - 2);
}

// 记忆化 (O(n))
function fibMemo(n: number, memo: Map<number, number> = new Map()): number {
    if (n <= 1) return n;
    if (memo.has(n)) return memo.get(n)!;

    const result = fibMemo(n - 1, memo) + fibMemo(n - 2, memo);
    memo.set(n, result);
    return result;
}

// 迭代 (O(n), O(1)空间)
function fibIterative(n: number): number {
    if (n <= 1) return n;
    let prev = 0, curr = 1;
    for (let i = 2; i <= n; i++) {
        [prev, curr] = [curr, prev + curr];
    }
    return curr;
}
```

#### 6.3 经典问题: 最长公共子序列 (LCS)

**定义:** 给定两个序列 X 和 Y，找出最长的公共子序列

**递推关系:**

```
LCS[i][j] = {
    0,                         若 i = 0 或 j = 0
    LCS[i-1][j-1] + 1,         若 X[i] = Y[j]
    max(LCS[i-1][j], LCS[i][j-1]), 否则
}
```

```typescript
function lcs(X: string, Y: string): string {
    const m = X.length, n = Y.length;
    const dp: number[][] = Array.from({ length: m + 1 }, () =>
        new Array(n + 1).fill(0)
    );

    // 填表
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (X[i - 1] === Y[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }

    // 重建路径
    let i = m, j = n;
    const result: string[] = [];
    while (i > 0 && j > 0) {
        if (X[i - 1] === Y[j - 1]) {
            result.unshift(X[i - 1]);
            i--;
            j--;
        } else if (dp[i - 1][j] > dp[i][j - 1]) {
            i--;
        } else {
            j--;
        }
    }

    return result.join('');
}
```

#### 6.4 经典问题: 0/1 背包

**问题:** 在容量限制下选择物品使价值最大

**递推关系:**

```
dp[i][w] = max(dp[i-1][w], dp[i-1][w-weight[i]] + value[i])
```

```typescript
function knapsack(weights: number[], values: number[], capacity: number): number {
    const n = weights.length;
    const dp: number[] = new Array(capacity + 1).fill(0);

    for (let i = 0; i < n; i++) {
        // 倒序遍历避免重复选择
        for (let w = capacity; w >= weights[i]; w--) {
            dp[w] = Math.max(dp[w], dp[w - weights[i]] + values[i]);
        }
    }

    return dp[capacity];
}
```


---

### 7. 贪心算法

#### 7.1 核心思想

每一步都选择局部最优解，期望得到全局最优。

**贪心选择性质:** 全局最优解可以通过局部最优选择得到
**最优子结构:** 问题的最优解包含子问题的最优解

#### 7.2 经典问题: 活动选择问题

**问题:** 选择尽可能多的互不冲突的活动

**贪心策略:** 总是选择结束时间最早的活动

```typescript
interface Activity {
    start: number;
    end: number;
}

function activitySelection(activities: Activity[]): Activity[] {
    // 按结束时间排序
    activities.sort((a, b) => a.end - b.end);

    const selected: Activity[] = [activities[0]];
    let lastEnd = activities[0].end;

    for (let i = 1; i < activities.length; i++) {
        if (activities[i].start >= lastEnd) {
            selected.push(activities[i]);
            lastEnd = activities[i].end;
        }
    }

    return selected;
}
```

**证明贪心策略正确性:**

设活动按结束时间排序为 a1, a2, ..., an

- 假设最优解第一个活动是 ak (k > 1)
- 由于 a1 结束时间 <= ak 结束时间
- 用 a1 替换 ak 仍能得到最优解
- 因此贪心选择是安全的

#### 7.3 经典问题: 霍夫曼编码

**问题:** 构造最优前缀编码使总编码长度最小

**贪心策略:** 每次合并频率最低的两个节点

```typescript
class HuffmanNode {
    char: string;
    freq: number;
    left: HuffmanNode | null = null;
    right: HuffmanNode | null = null;

    constructor(char: string, freq: number) {
        this.char = char;
        this.freq = freq;
    }
}

function buildHuffmanTree(freqMap: Map<string, number>): HuffmanNode {
    const nodes: HuffmanNode[] = [];
    for (const [char, freq] of freqMap) {
        nodes.push(new HuffmanNode(char, freq));
    }

    while (nodes.length > 1) {
        // 排序，取频率最小的两个
        nodes.sort((a, b) => a.freq - b.freq);
        const left = nodes.shift()!;
        const right = nodes.shift()!;

        // 合并
        const merged = new HuffmanNode('', left.freq + right.freq);
        merged.left = left;
        merged.right = right;

        nodes.push(merged);
    }

    return nodes[0];
}

function getCodes(node: HuffmanNode, prefix = '', codes: Map<string, string> = new Map()): Map<string, string> {
    if (!node.left && !node.right) {
        codes.set(node.char, prefix || '0');
        return codes;
    }

    if (node.left) getCodes(node.left, prefix + '0', codes);
    if (node.right) getCodes(node.right, prefix + '1', codes);

    return codes;
}
```

---

### 8. 字符串算法

#### 8.1 KMP 算法

**用途:** 线性时间字符串匹配

**核心思想:** 利用已匹配信息避免回退

```typescript
function computeLPS(pattern: string): number[] {
    const lps = new Array(pattern.length).fill(0);
    let len = 0;
    let i = 1;

    while (i < pattern.length) {
        if (pattern[i] === pattern[len]) {
            len++;
            lps[i] = len;
            i++;
        } else {
            if (len !== 0) {
                len = lps[len - 1];
            } else {
                lps[i] = 0;
                i++;
            }
        }
    }

    return lps;
}

function kmpSearch(text: string, pattern: string): number[] {
    const lps = computeLPS(pattern);
    const result: number[] = [];

    let i = 0, j = 0;
    while (i < text.length) {
        if (text[i] === pattern[j]) {
            i++;
            j++;

            if (j === pattern.length) {
                result.push(i - j);
                j = lps[j - 1];
            }
        } else {
            if (j !== 0) {
                j = lps[j - 1];
            } else {
                i++;
            }
        }
    }

    return result;
}
```

**复杂度:** O(m + n)，其中 m 是模式串长度，n 是文本串长度

#### 8.2 Rabin-Karp 算法

**用途:** 多模式匹配，使用滚动哈希

```typescript
function rabinKarp(text: string, pattern: string, base = 256, prime = 101): number[] {
    const result: number[] = [];
    const m = pattern.length;
    const n = text.length;
    let patternHash = 0;
    let textHash = 0;
    let h = 1;

    // h = base^(m-1) % prime
    for (let i = 0; i < m - 1; i++) {
        h = (h * base) % prime;
    }

    // 计算初始哈希值
    for (let i = 0; i < m; i++) {
        patternHash = (base * patternHash + pattern.charCodeAt(i)) % prime;
        textHash = (base * textHash + text.charCodeAt(i)) % prime;
    }

    // 滑动窗口
    for (let i = 0; i <= n - m; i++) {
        if (patternHash === textHash) {
            // 验证是否真正匹配（处理哈希冲突）
            let match = true;
            for (let j = 0; j < m; j++) {
                if (text[i + j] !== pattern[j]) {
                    match = false;
                    break;
                }
            }
            if (match) result.push(i);
        }

        // 计算下一个窗口的哈希值
        if (i < n - m) {
            textHash = (base * (textHash - text.charCodeAt(i) * h) +
                       text.charCodeAt(i + m)) % prime;
            if (textHash < 0) textHash += prime;
        }
    }

    return result;
}
```

**复杂度:**

- 平均: O(m + n)
- 最坏: O(mn)（哈希冲突频繁）

---

### 9. 高级数据结构

#### 9.1 线段树 (Segment Tree)

**用途:** 区间查询与修改

**复杂度:**

- 构建: O(n)
- 查询: O(log n)
- 更新: O(log n)

```typescript
class SegmentTree {
    private tree: number[];
    private n: number;

    constructor(arr: number[]) {
        this.n = arr.length;
        this.tree = new Array(4 * this.n);
        this.build(arr, 0, 0, this.n - 1);
    }

    private build(arr: number[], node: number, start: number, end: number): void {
        if (start === end) {
            this.tree[node] = arr[start];
            return;
        }

        const mid = Math.floor((start + end) / 2);
        this.build(arr, 2 * node + 1, start, mid);
        this.build(arr, 2 * node + 2, mid + 1, end);
        this.tree[node] = this.tree[2 * node + 1] + this.tree[2 * node + 2];
    }

    // 区间查询 [l, r]
    query(l: number, r: number): number {
        return this.queryRange(0, 0, this.n - 1, l, r);
    }

    private queryRange(node: number, start: number, end: number, l: number, r: number): number {
        if (r < start || end < l) return 0;
        if (l <= start && end <= r) return this.tree[node];

        const mid = Math.floor((start + end) / 2);
        const leftSum = this.queryRange(2 * node + 1, start, mid, l, r);
        const rightSum = this.queryRange(2 * node + 2, mid + 1, end, l, r);
        return leftSum + rightSum;
    }

    // 单点更新
    update(index: number, value: number): void {
        this.updateNode(0, 0, this.n - 1, index, value);
    }

    private updateNode(node: number, start: number, end: number, index: number, value: number): void {
        if (start === end) {
            this.tree[node] = value;
            return;
        }

        const mid = Math.floor((start + end) / 2);
        if (index <= mid) {
            this.updateNode(2 * node + 1, start, mid, index, value);
        } else {
            this.updateNode(2 * node + 2, mid + 1, end, index, value);
        }
        this.tree[node] = this.tree[2 * node + 1] + this.tree[2 * node + 2];
    }
}
```

#### 9.2 树状数组 (Fenwick Tree / Binary Indexed Tree)

**用途:** 前缀和查询与单点更新

**复杂度:**

- 查询: O(log n)
- 更新: O(log n)
- 空间: O(n)

```typescript
class FenwickTree {
    private tree: number[];
    private n: number;

    constructor(n: number) {
        this.n = n;
        this.tree = new Array(n + 1).fill(0);
    }

    // 从数组构建
    static fromArray(arr: number[]): FenwickTree {
        const ft = new FenwickTree(arr.length);
        for (let i = 0; i < arr.length; i++) {
            ft.update(i, arr[i]);
        }
        return ft;
    }

    // 在索引 i 处增加 delta
    update(i: number, delta: number): void {
        i++; // 1-indexed
        while (i <= this.n) {
            this.tree[i] += delta;
            i += i & -i; // 加最低位
        }
    }

    // 查询前缀和 [0, i]
    query(i: number): number {
        i++; // 1-indexed
        let sum = 0;
        while (i > 0) {
            sum += this.tree[i];
            i -= i & -i; // 减最低位
        }
        return sum;
    }

    // 查询区间和 [l, r]
    rangeQuery(l: number, r: number): number {
        return this.query(r) - this.query(l - 1);
    }
}
```

#### 9.3 跳表 (Skip List)

**用途:** 概率平衡的数据结构，实现有序集合

**复杂度:**

- 搜索/插入/删除: O(log n) 期望

```typescript
class SkipListNode<T> {
    value: T;
    forward: SkipListNode<T>[];

    constructor(value: T, level: number) {
        this.value = value;
        this.forward = new Array(level + 1).fill(null);
    }
}

class SkipList<T> {
    private head: SkipListNode<T>;
    private maxLevel: number;
    private level: number = 0;
    private p: number = 0.5;
    private compare: (a: T, b: T) => number;

    constructor(maxLevel = 16, compare?: (a: T, b: T) => number) {
        this.maxLevel = maxLevel;
        this.head = new SkipListNode<T>(null as T, maxLevel);
        this.compare = compare || ((a: T, b: T) => (a as any) - (b as any));
    }

    private randomLevel(): number {
        let level = 0;
        while (Math.random() < this.p && level < this.maxLevel) {
            level++;
        }
        return level;
    }

    search(target: T): boolean {
        let current = this.head;

        for (let i = this.level; i >= 0; i--) {
            while (current.forward[i] &&
                   this.compare(current.forward[i].value, target) < 0) {
                current = current.forward[i];
            }
        }

        current = current.forward[0];
        return current !== null && this.compare(current.value, target) === 0;
    }

    insert(value: T): void {
        const update: SkipListNode<T>[] = new Array(this.maxLevel + 1);
        let current = this.head;

        for (let i = this.level; i >= 0; i--) {
            while (current.forward[i] &&
                   this.compare(current.forward[i].value, value) < 0) {
                current = current.forward[i];
            }
            update[i] = current;
        }

        const newLevel = this.randomLevel();
        if (newLevel > this.level) {
            for (let i = this.level + 1; i <= newLevel; i++) {
                update[i] = this.head;
            }
            this.level = newLevel;
        }

        const newNode = new SkipListNode<T>(value, newLevel);
        for (let i = 0; i <= newLevel; i++) {
            newNode.forward[i] = update[i].forward[i];
            update[i].forward[i] = newNode;
        }
    }

    delete(value: T): boolean {
        const update: SkipListNode<T>[] = new Array(this.maxLevel + 1);
        let current = this.head;

        for (let i = this.level; i >= 0; i--) {
            while (current.forward[i] &&
                   this.compare(current.forward[i].value, value) < 0) {
                current = current.forward[i];
            }
            update[i] = current;
        }

        current = current.forward[0];
        if (current === null || this.compare(current.value, value) !== 0) {
            return false;
        }

        for (let i = 0; i <= this.level; i++) {
            if (update[i].forward[i] !== current) break;
            update[i].forward[i] = current.forward[i];
        }

        while (this.level > 0 && this.head.forward[this.level] === null) {
            this.level--;
        }

        return true;
    }
}
```

---

### 10. 算法设计范式

#### 10.1 分治法 (Divide and Conquer)

**三步策略:**

1. **分解 (Divide):** 将问题分解为子问题
2. **解决 (Conquer):** 递归解决子问题
3. **合并 (Combine):** 合并子问题的解

**经典例子:**

- 归并排序
- 快速排序
- 二分搜索
- 大整数乘法 (Karatsuba)

```typescript
// 分治模板
function divideAndConquer<T, R>(
    problem: T,
    isBaseCase: (p: T) => boolean,
    solveBase: (p: T) => R,
    divide: (p: T) => T[],
    combine: (results: R[]) => R
): R {
    if (isBaseCase(problem)) {
        return solveBase(problem);
    }

    const subProblems = divide(problem);
    const subResults = subProblems.map(sp =>
        divideAndConquer(sp, isBaseCase, solveBase, divide, combine)
    );

    return combine(subResults);
}
```

#### 10.2 回溯法 (Backtracking)

**思想:** 深度优先搜索 + 剪枝

**经典问题:**

- N 皇后问题
- 数独求解
- 子集/排列/组合
- 图着色

```typescript
// N 皇后问题
function solveNQueens(n: number): string[][] {
    const result: string[][] = [];
    const board: string[][] = Array.from({ length: n }, () =>
        new Array(n).fill('.')
    );

    function isValid(row: number, col: number): boolean {
        // 检查列
        for (let i = 0; i < row; i++) {
            if (board[i][col] === 'Q') return false;
        }
        // 检查左上对角线
        for (let i = row - 1, j = col - 1; i >= 0 && j >= 0; i--, j--) {
            if (board[i][j] === 'Q') return false;
        }
        // 检查右上对角线
        for (let i = row - 1, j = col + 1; i >= 0 && j < n; i--, j++) {
            if (board[i][j] === 'Q') return false;
        }
        return true;
    }

    function backtrack(row: number): void {
        if (row === n) {
            result.push(board.map(r => r.join('')));
            return;
        }

        for (let col = 0; col < n; col++) {
            if (isValid(row, col)) {
                board[row][col] = 'Q';
                backtrack(row + 1);
                board[row][col] = '.'; // 回溯
            }
        }
    }

    backtrack(0);
    return result;
}
```

#### 10.3 分支限界 (Branch and Bound)

**思想:** BFS + 界限函数剪枝

**与回溯区别:**

- 回溯: DFS，关注解的存在性
- 分支限界: BFS/最佳优先，关注最优解

**经典问题:**

- 旅行商问题 (TSP)
- 0/1 背包问题
- 作业调度

```typescript
// 分支限界解决 0/1 背包
interface Item {
    weight: number;
    value: number;
    ratio: number;
}

interface Node {
    level: number;
    profit: number;
    weight: number;
    bound: number;
}

function knapsackBranchBound(items: Item[], capacity: number): number {
    // 按价值密度排序
    items.sort((a, b) => b.ratio - a.ratio);

    function bound(node: Node, n: number, capacity: number): number {
        if (node.weight >= capacity) return 0;

        let profitBound = node.profit;
        let j = node.level + 1;
        let totalWeight = node.weight;

        while (j < n && totalWeight + items[j].weight <= capacity) {
            totalWeight += items[j].weight;
            profitBound += items[j].value;
            j++;
        }

        if (j < n) {
            profitBound += (capacity - totalWeight) * items[j].ratio;
        }

        return profitBound;
    }

    const queue: Node[] = [];
    const root: Node = { level: -1, profit: 0, weight: 0, bound: 0 };
    root.bound = bound(root, items.length, capacity);
    queue.push(root);

    let maxProfit = 0;

    while (queue.length > 0) {
        // 按 bound 排序（最佳优先）
        queue.sort((a, b) => b.bound - a.bound);
        const node = queue.shift()!;

        if (node.bound > maxProfit && node.level < items.length - 1) {
            const nextLevel = node.level + 1;

            // 左孩子：选择当前物品
            const left: Node = {
                level: nextLevel,
                profit: node.profit + items[nextLevel].value,
                weight: node.weight + items[nextLevel].weight,
                bound: 0
            };

            if (left.weight <= capacity && left.profit > maxProfit) {
                maxProfit = left.profit;
            }
            left.bound = bound(left, items.length, capacity);
            if (left.bound > maxProfit) queue.push(left);

            // 右孩子：不选当前物品
            const right: Node = {
                level: nextLevel,
                profit: node.profit,
                weight: node.weight,
                bound: 0
            };
            right.bound = bound(right, items.length, capacity);
            if (right.bound > maxProfit) queue.push(right);
        }
    }

    return maxProfit;
}
```

---

## 总结

本文档涵盖了数据结构与算法的核心理论：

1. **复杂度分析** - 理解算法效率的度量方式
2. **基础数据结构** - JavaScript 内置结构的实现原理
3. **树结构** - 平衡树保证操作效率
4. **图算法** - 解决连接性、最短路径等问题
5. **排序算法** - 不同场景的最优选择
6. **动态规划** - 最优子结构问题的通用解法
7. **贪心算法** - 局部最优导向全局最优
8. **字符串算法** - 高效模式匹配
9. **高级数据结构** - 区间查询与概率平衡
10. **算法范式** - 问题分解与搜索策略

---

*文档创建日期: 2026-04-08*
*适用场景: JavaScript/TypeScript 算法学习与面试准备*
