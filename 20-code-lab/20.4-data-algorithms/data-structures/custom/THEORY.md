# 自定义数据结构

> **定位**：`20-code-lab/20.4-data-algorithms/data-structures/custom`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块解决特定场景下内置结构不满足需求的问题。通过自定义链表、树、哈希表等实现精细化控制。

### 1.2 形式化基础

[本模块的形式化定义与公理/定理陈述]

### 1.3 关键概念

| 概念 | 定义 | 关联 |
|------|------|------|
| 链表 | 节点引用的线性结构 | linked-list.ts |
| 哈希表 | 散列函数与冲突解决策略 | hash-table.ts |

---

## 二、设计原理

### 2.1 为什么存在

内置数据结构无法覆盖所有场景。自定义数据结构允许针对特定访问模式优化，是性能调优和算法实现的基础技能。

### 2.2 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 自定义结构 | 完全可控 | 实现与维护成本 | 特殊需求 |
| 内置结构 | 经过优化 | 不够灵活 | 通用场景 |

### 2.3 与相关技术的对比

与库实现对比：自定义无依赖但需维护，库经过测试但增加体积。

---

## 三、实践映射

### 3.1 从理论到代码

本模块的代码示例将上述理论概念映射为可运行的实现。通过实际编码练习，可以验证对 自定义数据结构 核心机制的理解，并观察不同实现选择带来的行为差异。

### 3.2 常见误区

| 误区 | 正确理解 |
|------|---------|
| 自定义结构总是更快 | 未经优化的自定义实现可能劣于内置 |
| 链表比数组更好 | 随机访问数组 O(1) 优于链表 O(n) |

### 3.3 扩展阅读

- [Data Structures in JS](https://github.com/trekhleb/javascript-algorithms)
- `20.4-data-algorithms/data-structures/`

---

## 四、深度对比：自定义结构选型矩阵

| 结构 | 核心操作复杂度 | 空间复杂度 | 引擎优化友好度 | 适用边界 |
|------|---------------|------------|----------------|----------|
| 单向链表 | 头插 O(1) / 查找 O(n) | O(n) | ❌ 差 | 频繁头插、长度未知流式数据 |
| 双向链表 | 头尾插 O(1) / 查找 O(n) | O(n) | ❌ 差 | LRU、Deque、编辑器缓冲区 |
| 哈希表 (拉链法) | 均摊 O(1) | O(n + m) 桶数 | ⚠️ 中 | 需要稳定遍历顺序、自定义相等性 |
| 二叉搜索树 (BST) | 平均 O(log n) / 退化 O(n) | O(n) | ⚠️ 中 | 范围查询、顺序统计 |
| AVL / 红黑树 | 严格 O(log n) | O(n) | ⚠️ 中 | 确定性延迟要求、数据库索引模拟 |
| Trie (前缀树) | 插入/查找 O(k) 键长 | O(字符集 × k) | ⚠️ 中 | 自动补全、拼写检查、路由匹配 |

## 五、代码示例：带尾指针的双向链表 + LRU 骨架

```typescript
type ListNode<T> = {
  value: T;
  prev: ListNode<T> | null;
  next: ListNode<T> | null;
};

class DoublyLinkedList<T> {
  private head: ListNode<T> | null = null;
  private tail: ListNode<T> | null = null;
  private size = 0;

  pushFront(value: T): ListNode<T> {
    const node: ListNode<T> = { value, prev: null, next: this.head };
    if (this.head) this.head.prev = node;
    this.head = node;
    if (!this.tail) this.tail = node;
    this.size++;
    return node;
  }

  remove(node: ListNode<T>): void {
    if (node.prev) node.prev.next = node.next;
    else this.head = node.next;
    if (node.next) node.next.prev = node.prev;
    else this.tail = node.prev;
    this.size--;
  }

  moveToFront(node: ListNode<T>): void {
    this.remove(node);
    node.prev = null;
    node.next = this.head;
    if (this.head) this.head.prev = node;
    this.head = node;
    if (!this.tail) this.tail = node;
    this.size++;
  }

  popBack(): T | undefined {
    if (!this.tail) return undefined;
    const value = this.tail.value;
    this.remove(this.tail);
    return value;
  }

  get length() { return this.size; }
}

// ── 基于双向链表的 O(1) LRU Cache 骨架 ──
class LRUCache<K, V> {
  private cache = new Map<K, ListNode<{ key: K; value: V }>>();
  private list = new DoublyLinkedList<{ key: K; value: V }>();
  constructor(private capacity: number) {}

  get(key: K): V | undefined {
    const node = this.cache.get(key);
    if (!node) return undefined;
    this.list.moveToFront(node);
    return node.value.value;
  }

  put(key: K, value: V): void {
    if (this.cache.has(key)) {
      const node = this.cache.get(key)!;
      node.value.value = value;
      this.list.moveToFront(node);
      return;
    }
    if (this.cache.size >= this.capacity) {
      const evicted = this.list.popBack();
      if (evicted) this.cache.delete(evicted.key);
    }
    const node = this.list.pushFront({ key, value });
    this.cache.set(key, node);
  }
}
```

## 六、代码示例：Trie（前缀树）实现

```typescript
// trie.ts — 前缀树，适用于自动补全与路由匹配

class TrieNode {
  children = new Map<string, TrieNode>();
  isEndOfWord = false;
  value?: string; // 存储完整单词或路由路径
}

class Trie {
  private root = new TrieNode();

  insert(word: string, value?: string): void {
    let node = this.root;
    for (const char of word) {
      if (!node.children.has(char)) {
        node.children.set(char, new TrieNode());
      }
      node = node.children.get(char)!;
    }
    node.isEndOfWord = true;
    node.value = value ?? word;
  }

  search(word: string): boolean {
    const node = this.traverse(word);
    return node?.isEndOfWord ?? false;
  }

  startsWith(prefix: string): boolean {
    return this.traverse(prefix) !== undefined;
  }

  /** 返回所有以 prefix 开头的单词 */
  autocomplete(prefix: string): string[] {
    const node = this.traverse(prefix);
    if (!node) return [];
    return this.collect(node, prefix);
  }

  private traverse(word: string): TrieNode | undefined {
    let node = this.root;
    for (const char of word) {
      if (!node.children.has(char)) return undefined;
      node = node.children.get(char)!;
    }
    return node;
  }

  private collect(node: TrieNode, prefix: string): string[] {
    const results: string[] = [];
    if (node.isEndOfWord && node.value) results.push(node.value);
    for (const [char, child] of node.children) {
      results.push(...this.collect(child, prefix + char));
    }
    return results;
  }
}

// 使用：自动补全
const trie = new Trie();
['typescript', 'javascript', 'java', 'python', 'php', 'perl'].forEach((w) => trie.insert(w));

console.log(trie.autocomplete('jav'));   // ['javascript', 'java']
console.log(trie.autocomplete('py'));    // ['python']
console.log(trie.search('typescript'));  // true
console.log(trie.search('type'));        // false
```

## 七、代码示例：最小堆（优先队列）

```typescript
// min-heap.ts — 基于数组的二叉堆，用于调度与 Top-K

class MinHeap<T> {
  private data: T[] = [];

  constructor(private compare: (a: T, b: T) => number = (a, b) => (a < b ? -1 : a > b ? 1 : 0)) {}

  get size() { return this.data.length; }

  push(value: T): void {
    this.data.push(value);
    this.siftUp(this.data.length - 1);
  }

  pop(): T | undefined {
    if (this.data.length === 0) return undefined;
    const min = this.data[0];
    const last = this.data.pop()!;
    if (this.data.length > 0) {
      this.data[0] = last;
      this.siftDown(0);
    }
    return min;
  }

  peek(): T | undefined {
    return this.data[0];
  }

  private siftUp(index: number): void {
    const parent = (index - 1) >> 1;
    if (parent >= 0 && this.compare(this.data[index], this.data[parent]) < 0) {
      [this.data[index], this.data[parent]] = [this.data[parent], this.data[index]];
      this.siftUp(parent);
    }
  }

  private siftDown(index: number): void {
    const left = (index << 1) + 1;
    const right = left + 1;
    let smallest = index;

    if (left < this.data.length && this.compare(this.data[left], this.data[smallest]) < 0) smallest = left;
    if (right < this.data.length && this.compare(this.data[right], this.data[smallest]) < 0) smallest = right;

    if (smallest !== index) {
      [this.data[index], this.data[smallest]] = [this.data[smallest], this.data[index]];
      this.siftDown(smallest);
    }
  }
}

// 使用：Top-K 最大元素（反向比较）
const maxHeap = new MinHeap<number>((a, b) => b - a);
[3, 1, 4, 1, 5, 9, 2, 6].forEach((n) => maxHeap.push(n));
console.log(maxHeap.pop()); // 9
console.log(maxHeap.pop()); // 6
```

## 八、代码示例：并查集（Disjoint Set Union）

```typescript
// union-find.ts — 用于连通性检测、Kruskal 最小生成树
class UnionFind {
  private parent: number[] = [];
  private rank: number[] = [];

  constructor(n: number) {
    for (let i = 0; i < n; i++) {
      this.parent[i] = i;
      this.rank[i] = 0;
    }
  }

  find(x: number): number {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]); // 路径压缩
    }
    return this.parent[x];
  }

  union(a: number, b: number): boolean {
    const ra = this.find(a);
    const rb = this.find(b);
    if (ra === rb) return false;

    // 按秩合并
    if (this.rank[ra] < this.rank[rb]) {
      this.parent[ra] = rb;
    } else if (this.rank[ra] > this.rank[rb]) {
      this.parent[rb] = ra;
    } else {
      this.parent[rb] = ra;
      this.rank[ra]++;
    }
    return true;
  }

  connected(a: number, b: number): boolean {
    return this.find(a) === this.find(b);
  }
}

// 使用：判断图中两节点是否连通
const uf = new UnionFind(5);
uf.union(0, 1);
uf.union(1, 2);
console.log(uf.connected(0, 2)); // true
console.log(uf.connected(0, 3)); // false
```

## 九、代码示例：线段树（Range Query）

```typescript
// segment-tree.ts — 支持区间查询与单点更新的二叉树结构
class SegmentTree {
  private tree: number[];
  private n: number;

  constructor(arr: number[]) {
    this.n = arr.length;
    this.tree = new Array(4 * this.n).fill(0);
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

  /** 查询区间 [ql, qr] 的和 */
  query(ql: number, qr: number): number {
    return this.queryRec(0, 0, this.n - 1, ql, qr);
  }

  private queryRec(node: number, l: number, r: number, ql: number, qr: number): number {
    if (ql > r || qr < l) return 0;
    if (ql <= l && r <= qr) return this.tree[node];
    const mid = (l + r) >> 1;
    return this.queryRec(node * 2 + 1, l, mid, ql, qr)
         + this.queryRec(node * 2 + 2, mid + 1, r, ql, qr);
  }

  /** 单点更新：将 index 位置的值设为 value */
  update(index: number, value: number): void {
    this.updateRec(0, 0, this.n - 1, index, value);
  }

  private updateRec(node: number, l: number, r: number, index: number, value: number): void {
    if (l === r) {
      this.tree[node] = value;
      return;
    }
    const mid = (l + r) >> 1;
    if (index <= mid) this.updateRec(node * 2 + 1, l, mid, index, value);
    else this.updateRec(node * 2 + 2, mid + 1, r, index, value);
    this.tree[node] = this.tree[node * 2 + 1] + this.tree[node * 2 + 2];
  }
}

// 使用：区间和查询
const st = new SegmentTree([1, 3, 5, 7, 9, 11]);
console.log(st.query(1, 3)); // 3 + 5 + 7 = 15
st.update(2, 10);
console.log(st.query(1, 3)); // 3 + 10 + 7 = 20
```

## 十、权威参考链接

| 资源 | 说明 | 链接 |
|------|------|------|
| JavaScript Algorithms — Data Structures | 完整自定义实现与单元测试 | [github.com/trekhleb/javascript-algorithms](https://github.com/trekhleb/javascript-algorithms) |
| VisuAlgo — 数据结构与算法可视化 | 交互式理解链表/树/图行为 | [visualgo.net](https://visualgo.net/en/list) |
| Introduction to Algorithms (CLRS) | 形式化证明与摊还分析 | ISBN 978-0262046305 |
| Wikipedia — Abstract Data Type | ADT 与实现分离的理论基础 | [en.wikipedia.org/wiki/Abstract_data_type](https://en.wikipedia.org/wiki/Abstract_data_type) |
| Algorithms (Sedgewick & Wayne) | 算法与数据结构经典教材 | [algs4.cs.princeton.edu](https://algs4.cs.princeton.edu/) |
| V8 Blog — Elements Kinds | V8 引擎如何优化数组 | [v8.dev/blog/elements-kinds](https://v8.dev/blog/elements-kinds) |
| MDN — JavaScript Data Structures | 内置数据结构文档 | [developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures) |
| TC39 — Map and Set Specification | ECMAScript 规范 | [tc39.es/ecma262/#sec-keyed-collections](https://tc39.es/ecma262/#sec-keyed-collections) |
| Competitive Programming Handbook (Antti Laaksonen) | 竞赛编程算法与数据结构 | [cses.fi/book/book.pdf](https://cses.fi/book/book.pdf) |
| CP-Algorithms — Data Structures | 算法与数据结构参考 | [cp-algorithms.com/data_structures/disjoint_set_union.html](https://cp-algorithms.com/data_structures/disjoint_set_union.html) |
| Wikipedia — Segment Tree | 线段树形式化定义 | [en.wikipedia.org/wiki/Segment_tree](https://en.wikipedia.org/wiki/Segment_tree) |
| GeeksforGeeks — Trie Data Structure | Trie 详解与应用 | [geeksforgeeks.org/trie-insert-and-search](https://www.geeksforgeeks.org/trie-insert-and-search/) |
| Redis — LRU Cache Implementation | 工业级 LRU 实现参考 | [github.com/redis/redis/blob/unstable/src/evict.c](https://github.com/redis/redis/blob/unstable/src/evict.c) |

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
