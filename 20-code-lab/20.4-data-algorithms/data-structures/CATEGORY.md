---
category: language-core
dimension: 语言核心
created: 2026-04-27
---

# CATEGORY.md — 04-data-structures

## 所属维度

**语言核心（Language Core）**

## 边界说明

本模块使用 JavaScript/TypeScript 实现计算机科学核心数据结构，并分析其时间/空间复杂度。数据结构本身是语言无关的，但本模块重点展示如何利用 JS/TS 的 prototype、class、Map/Set、TypedArray 等语言内置机制高效实现这些数据结构。

**非本模块内容**：数据库数据结构、特定框架的状态结构（如 Redux Store）。

## 在语言核心体系中的位置

```
语言核心
  ├── 00-language-core        → 语法基础
  ├── 04-data-structures（本模块）→ 数据结构实现
  └── 05-algorithms           → 算法实现
```

## 子模块目录结构

| 子模块 | 说明 | 关键文件 |
|---|---|---|
| arrays | 数组、动态数组、环形缓冲区、TypedArray | `arrays/README.md` |
| linked-lists | 单向链表、双向链表、循环链表、跳表 | `linked-lists/README.md` |
| trees | 二叉树、BST、AVL、红黑树、B树、堆、Trie | `trees/README.md` |
| graphs | 邻接矩阵、邻接表、有向图、加权图 | `graphs/README.md` |
| hash-tables | 哈希表、冲突解决（链地址/开放寻址）、一致性哈希 | `hash-tables/README.md` |
| heaps | 二叉堆、斐波那契堆、优先队列 | `heaps/README.md` |

## 核心代码示例

### 双向链表节点与插入

```ts
class ListNode<T> {
  prev: ListNode<T> | null = null;
  next: ListNode<T> | null = null;
  constructor(public value: T) {}
}

class DoublyLinkedList<T> {
  head: ListNode<T> | null = null;
  tail: ListNode<T> | null = null;

  append(value: T): void {
    const node = new ListNode(value);
    if (!this.tail) {
      this.head = this.tail = node;
      return;
    }
    node.prev = this.tail;
    this.tail.next = node;
    this.tail = node;
  }
}
```

### 二叉搜索树插入与查找

```ts
class TreeNode<T> {
  left: TreeNode<T> | null = null;
  right: TreeNode<T> | null = null;
  constructor(public value: T) {}
}

class BST<T> {
  root: TreeNode<T> | null = null;

  insert(value: T): void {
    const newNode = new TreeNode(value);
    if (!this.root) { this.root = newNode; return; }
    let curr = this.root;
    while (true) {
      if (value < curr.value) {
        if (!curr.left) { curr.left = newNode; return; }
        curr = curr.left;
      } else {
        if (!curr.right) { curr.right = newNode; return; }
        curr = curr.right;
      }
    }
  }

  search(value: T): TreeNode<T> | null {
    let curr = this.root;
    while (curr) {
      if (value === curr.value) return curr;
      curr = value < curr.value ? curr.left : curr.right;
    }
    return null;
  }
}
```

### 基于 Map 的哈希表（利用 JS 原生能力）

```ts
class HashTable<K, V> {
  private map = new Map<K, V>();
  set(key: K, value: V): this { this.map.set(key, value); return this; }
  get(key: K): V | undefined { return this.map.get(key); }
  has(key: K): boolean { return this.map.has(key); }
  delete(key: K): boolean { return this.map.delete(key); }
}
```

### 最小堆（优先队列）

```ts
class MinHeap<T> {
  private heap: T[] = [];
  constructor(private compare: (a: T, b: T) => number) {}

  private parent(i: number) { return (i - 1) >> 1; }
  private left(i: number) { return (i << 1) + 1; }
  private right(i: number) { return (i << 1) + 2; }

  push(val: T): void {
    this.heap.push(val);
    let i = this.heap.length - 1;
    while (i > 0 && this.compare(this.heap[i], this.heap[this.parent(i)]) < 0) {
      [this.heap[i], this.heap[this.parent(i)]] = [this.heap[this.parent(i)], this.heap[i]];
      i = this.parent(i);
    }
  }

  pop(): T | undefined {
    if (this.heap.length === 0) return undefined;
    if (this.heap.length === 1) return this.heap.pop();
    const top = this.heap[0];
    this.heap[0] = this.heap.pop()!;
    let i = 0;
    while (true) {
      const l = this.left(i), r = this.right(i);
      let smallest = i;
      if (l < this.heap.length && this.compare(this.heap[l], this.heap[smallest]) < 0) smallest = l;
      if (r < this.heap.length && this.compare(this.heap[r], this.heap[smallest]) < 0) smallest = r;
      if (smallest === i) break;
      [this.heap[i], this.heap[smallest]] = [this.heap[smallest], this.heap[i]];
      i = smallest;
    }
    return top;
  }

  peek(): T | undefined { return this.heap[0]; }
  size(): number { return this.heap.length; }
}
```

### 图的邻接表与 BFS/DFS

```ts
class Graph<T> {
  private adj = new Map<T, T[]>();

  addEdge(u: T, v: T): void {
    if (!this.adj.has(u)) this.adj.set(u, []);
    this.adj.get(u)!.push(v);
  }

  bfs(start: T): T[] {
    const result: T[] = [];
    const visited = new Set<T>();
    const queue: T[] = [start];
    visited.add(start);
    while (queue.length) {
      const node = queue.shift()!;
      result.push(node);
      for (const neighbor of this.adj.get(node) ?? []) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }
    return result;
  }

  dfs(start: T): T[] {
    const result: T[] = [];
    const visited = new Set<T>();
    const stack: T[] = [start];
    visited.add(start);
    while (stack.length) {
      const node = stack.pop()!;
      result.push(node);
      for (const neighbor of this.adj.get(node) ?? []) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          stack.push(neighbor);
        }
      }
    }
    return result;
  }
}
```

### Trie（前缀树）

```ts
class TrieNode {
  children = new Map<string, TrieNode>();
  isEnd = false;
}

class Trie {
  private root = new TrieNode();

  insert(word: string): void {
    let node = this.root;
    for (const ch of word) {
      if (!node.children.has(ch)) node.children.set(ch, new TrieNode());
      node = node.children.get(ch)!;
    }
    node.isEnd = true;
  }

  search(word: string): boolean {
    const node = this._traverse(word);
    return node !== null && node.isEnd;
  }

  startsWith(prefix: string): boolean {
    return this._traverse(prefix) !== null;
  }

  private _traverse(word: string): TrieNode | null {
    let node = this.root;
    for (const ch of word) {
      if (!node.children.has(ch)) return null;
      node = node.children.get(ch)!;
    }
    return node;
  }
}
```

### LRU Cache（双向链表 + 哈希表）

```ts
// lru-cache.ts — 最近最少使用缓存
class LRUNode<K, V> {
  prev: LRUNode<K, V> | null = null;
  next: LRUNode<K, V> | null = null;
  constructor(public key: K, public value: V) {}
}

class LRUCache<K, V> {
  private cache = new Map<K, LRUNode<K, V>>();
  private head = new LRUNode<K, V>(null as any, null as any);
  private tail = new LRUNode<K, V>(null as any, null as any);

  constructor(private capacity: number) {
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  get(key: K): V | undefined {
    const node = this.cache.get(key);
    if (!node) return undefined;
    this.moveToHead(node);
    return node.value;
  }

  put(key: K, value: V): void {
    const existing = this.cache.get(key);
    if (existing) {
      existing.value = value;
      this.moveToHead(existing);
      return;
    }

    const node = new LRUNode(key, value);
    this.cache.set(key, node);
    this.addToHead(node);

    if (this.cache.size > this.capacity) {
      const removed = this.removeTail();
      if (removed) this.cache.delete(removed.key);
    }
  }

  private addToHead(node: LRUNode<K, V>): void {
    node.prev = this.head;
    node.next = this.head.next;
    this.head.next!.prev = node;
    this.head.next = node;
  }

  private removeNode(node: LRUNode<K, V>): void {
    node.prev!.next = node.next;
    node.next!.prev = node.prev;
  }

  private moveToHead(node: LRUNode<K, V>): void {
    this.removeNode(node);
    this.addToHead(node);
  }

  private removeTail(): LRUNode<K, V> | null {
    const node = this.tail.prev;
    if (node === this.head) return null;
    this.removeNode(node);
    return node;
  }
}

// 使用
const cache = new LRUCache<string, number>(2);
cache.put('a', 1);
cache.put('b', 2);
cache.get('a'); // 1，a 变为最新
cache.put('c', 3); // 驱逐 b
cache.get('b'); // undefined
```

### 并查集（Union-Find）

```ts
// union-find.ts — 带路径压缩和按秩合并的并查集
class UnionFind {
  private parent: number[];
  private rank: number[];

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
    const px = this.find(x), py = this.find(y);
    if (px === py) return false;

    // 按秩合并
    if (this.rank[px] < this.rank[py]) {
      this.parent[px] = py;
    } else if (this.rank[px] > this.rank[py]) {
      this.parent[py] = px;
    } else {
      this.parent[py] = px;
      this.rank[px]++;
    }
    return true;
  }

  connected(x: number, y: number): boolean {
    return this.find(x) === this.find(y);
  }
}

// 使用：判断图是否有环
const uf = new UnionFind(4);
uf.union(0, 1); // true
uf.union(1, 2); // true
console.log(uf.connected(0, 2)); // true
console.log(uf.union(2, 0)); // false — 已连通，加入会形成环
```

### 线段树（Range Query）

```ts
// segment-tree.ts — 支持区间查询和单点更新的线段树
class SegmentTree {
  private tree: number[];
  private n: number;

  constructor(arr: number[]) {
    this.n = arr.length;
    this.tree = new Array(this.n * 4).fill(0);
    this.build(arr, 0, 0, this.n - 1);
  }

  private build(arr: number[], node: number, l: number, r: number): void {
    if (l === r) {
      this.tree[node] = arr[l];
      return;
    }
    const mid = (l + r) >> 1;
    this.build(arr, node * 2 + 1, l, mid);
    this.build(arr, node * 2 + 2, mid + 1, r);
    this.tree[node] = this.tree[node * 2 + 1] + this.tree[node * 2 + 2];
  }

  query(ql: number, qr: number): number {
    return this._query(0, 0, this.n - 1, ql, qr);
  }

  private _query(node: number, l: number, r: number, ql: number, qr: number): number {
    if (ql > r || qr < l) return 0;
    if (ql <= l && r <= qr) return this.tree[node];
    const mid = (l + r) >> 1;
    return this._query(node * 2 + 1, l, mid, ql, qr) + this._query(node * 2 + 2, mid + 1, r, ql, qr);
  }

  update(index: number, value: number): void {
    this._update(0, 0, this.n - 1, index, value);
  }

  private _update(node: number, l: number, r: number, index: number, value: number): void {
    if (l === r) {
      this.tree[node] = value;
      return;
    }
    const mid = (l + r) >> 1;
    if (index <= mid) this._update(node * 2 + 1, l, mid, index, value);
    else this._update(node * 2 + 2, mid + 1, r, index, value);
    this.tree[node] = this.tree[node * 2 + 1] + this.tree[node * 2 + 2];
  }
}

// 使用
const st = new SegmentTree([1, 3, 5, 7, 9]);
console.log(st.query(1, 3)); // 15 (3 + 5 + 7)
st.update(2, 10);
console.log(st.query(1, 3)); // 20 (3 + 10 + 7)
```

## 权威外部链接

- [MDN — Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)
- [MDN — Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)
- [MDN — Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)
- [MDN — TypedArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray)
- [VisuAlgo — 数据结构可视化](https://visualgo.net/en)
- [GeeksforGeeks — Data Structures](https://www.geeksforgeeks.org/data-structures/)
- [Wikipedia — List of data structures](https://en.wikipedia.org/wiki/List_of_data_structures)
- [JavaScript Algorithms — GitHub 仓库](https://github.com/trekhleb/javascript-algorithms)
- [CLRS — Introduction to Algorithms (MIT Press)](https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/)
- [Data Structures and Algorithms in JavaScript — Egghead](https://egghead.io/courses/data-structures-and-algorithms-in-javascript)
- [Big-O Cheat Sheet](https://www.bigocheatsheet.com/) — 复杂度速查表
- [LeetCode Explore — Data Structures](https://leetcode.com/explore/learn/card/data-structure/) — 交互式数据结构学习
- [Khan Academy — Data Structures](https://www.khanacademy.org/computing/computer-science/algorithms) — 免费算法课程
- [Open Data Structures](https://opendatastructures.org/) — 开源数据结构教材
- [UC Berkeley CS61B](https://inst.eecs.berkeley.edu/~cs61b/sp20/) — 数据结构课程
- [MIT 6.006 — Introduction to Algorithms](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/) — MIT 公开课
- [William Fiset — Data Structures YouTube](https://www.youtube.com/playlist?list=PLDV1Zeh2NRsB6SWUrDFW2RmDotAfPbeHu) — 可视化数据结构教学
- [TheAlgorithms/JavaScript](https://github.com/TheAlgorithms/JavaScript) — 社区维护算法仓库
- [HackerRank — Data Structures](https://www.hackerrank.com/domains/data-structures) — 在线练习

## 关联索引

- [10-fundamentals/10.1-language-semantics/README.md](../../../10-fundamentals/10.1-language-semantics/README.md)
- [30-knowledge-base/30.2-categories/00-language-core.md](../../../30-knowledge-base/30.2-categories/00-language-core.md)

### 并查集（Disjoint Set Union）

```ts
class UnionFind {
  private parent: number[];
  private rank: number[];

  constructor(n: number) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.rank = new Array(n).fill(0);
  }

  find(x: number): number {
    if (this.parent[x] !== x) this.parent[x] = this.find(this.parent[x]);
    return this.parent[x];
  }

  union(x: number, y: number): boolean {
    const rx = this.find(x), ry = this.find(y);
    if (rx === ry) return false;
    if (this.rank[rx] < this.rank[ry]) this.parent[rx] = ry;
    else if (this.rank[rx] > this.rank[ry]) this.parent[ry] = rx;
    else { this.parent[ry] = rx; this.rank[rx]++; }
    return true;
  }
}
```

### 线段树（Segment Tree）

```ts
class SegmentTree {
  private tree: number[];
  private n: number;

  constructor(arr: number[]) {
    this.n = arr.length;
    this.tree = new Array(4 * this.n).fill(0);
    this.build(arr, 0, 0, this.n - 1);
  }

  private build(arr: number[], node: number, l: number, r: number) {
    if (l === r) { this.tree[node] = arr[l]; return; }
    const mid = (l + r) >> 1;
    this.build(arr, node * 2 + 1, l, mid);
    this.build(arr, node * 2 + 2, mid + 1, r);
    this.tree[node] = this.tree[node * 2 + 1] + this.tree[node * 2 + 2];
  }

  query(node: number, l: number, r: number, ql: number, qr: number): number {
    if (ql <= l && r <= qr) return this.tree[node];
    if (r < ql || l > qr) return 0;
    const mid = (l + r) >> 1;
    return this.query(node * 2 + 1, l, mid, ql, qr) + this.query(node * 2 + 2, mid + 1, r, ql, qr);
  }
}
```

### 二叉索引树（Fenwick Tree）

```ts
class FenwickTree {
  private tree: number[];
  constructor(n: number) { this.tree = new Array(n + 1).fill(0); }

  update(index: number, delta: number) {
    for (let i = index + 1; i < this.tree.length; i += i & -i) this.tree[i] += delta;
  }

  query(index: number): number {
    let sum = 0;
    for (let i = index + 1; i > 0; i -= i & -i) sum += this.tree[i];
    return sum;
  }
}
```

### LRU 缓存（利用 JS Map 保持插入顺序）

```ts
class LRUCache<K, V> {
  private cache = new Map<K, V>();
  constructor(private capacity: number) {}

  get(key: K): V | undefined {
    if (!this.cache.has(key)) return undefined;
    const value = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  put(key: K, value: V): void {
    if (this.cache.has(key)) this.cache.delete(key);
    else if (this.cache.size >= this.capacity) {
      const first = this.cache.keys().next().value;
      this.cache.delete(first);
    }
    this.cache.set(key, value);
  }
}
```

## 新增权威外部链接

- [VisuAlgo — Union-Find](https://visualgo.net/en/ufds) — 并查集可视化
- [GeeksforGeeks — Segment Tree](https://www.geeksforgeeks.org/segment-tree-data-structure/) — 线段树详解
- [CP-Algorithms — Fenwick Tree](https://cp-algorithms.com/data_structures/fenwick.html) — 二叉索引树参考
- [LeetCode 146 — LRU Cache](https://leetcode.com/problems/lru-cache/) — 经典缓存设计题
- [MDN — Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) — 利用原生 Map 实现有序键值存储

---

*最后更新: 2026-04-30*
