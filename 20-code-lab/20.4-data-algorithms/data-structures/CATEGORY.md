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

## 关联索引

- [10-fundamentals/10.1-language-semantics/README.md](../../../10-fundamentals/10.1-language-semantics/README.md)
- [30-knowledge-base/30.2-categories/00-language-core.md](../../../30-knowledge-base/30.2-categories/00-language-core.md)
