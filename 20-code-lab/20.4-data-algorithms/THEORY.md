# 数据结构与算法：理论基础

> **定位**：`20-code-lab/20.4-data-algorithms/`
> **关联**：`10-fundamentals/10.2-type-system/` | `30-knowledge-base/30.8-research/tsjs-stack-panorama-2026/DATA_STRUCTURES_ALGORITHMS_THEORY.md`

---

## 一、核心理论

### 1.1 问题域定义

在 JavaScript 中，数据结构不仅是算法的基础，更是**类型系统与运行时性能**的交汇点。理解 Array、Map、Set、TypedArray 的底层实现差异，是编写高性能 JS/TS 代码的前提。

### 1.2 JS 内置数据结构复杂度

| 结构 | 访问 | 搜索 | 插入 | 删除 | 底层实现 |
|------|------|------|------|------|---------|
| `Array` | O(1) | O(n) | O(n) 均摊 | O(n) | 动态数组 |
| `Object` (键) | O(1) | O(1) | O(1) | O(1) | 哈希表 |
| `Map` | O(1) | O(1) | O(1) | O(1) | 哈希表（保序） |
| `Set` | — | O(1) | O(1) | O(1) | 哈希表 |
| `WeakMap` | O(1) | O(1) | O(1) | O(1) | 哈希表（键弱引用） |

---

## 二、数据结构深度对比

| 数据结构 | 随机访问 | 头部插入 | 尾部插入 | 中间插入 | 内存布局 | 缓存友好 | JS 对应实现 |
|---------|---------|---------|---------|---------|---------|---------|------------|
| **动态数组 (Array)** | O(1) | O(n) | O(1) 均摊 | O(n) | 连续内存 | 极佳 | `Array`, `TypedArray` |
| **链表 (Linked List)** | O(n) | O(1) | O(1) | O(n) | 离散节点 | 差 | 手动实现 |
| **双向链表** | O(n) | O(1) | O(1) | O(n) | 离散节点 | 差 | 手动实现 |
| **二叉搜索树 (BST)** | O(log n) | O(log n) | O(log n) | O(log n) | 节点+指针 | 中 | 手动实现 |
| **平衡 BST (AVL/Red-Black)** | O(log n) | O(log n) | O(log n) | O(log n) | 节点+指针 | 中 | 手动实现 |
| **哈希表 (Hash Table)** | O(1) | O(1) | O(1) | O(1) | 数组+链表/树 | 中 | `Map`, `Set`, `Object` |
| **堆 (Heap)** | — | O(log n) | O(log n) | O(log n) | 连续数组 | 好 | 手动实现 |
| **跳表 (Skip List)** | O(log n) | O(log n) | O(log n) | O(log n) | 多层链表 | 中 | 手动实现 |

---

## 三、设计原理

### 3.1 V8 内部优化

- **Smi（Small Integer）**：31/32位小整数，直接嵌入指针，无需堆分配
- **Fast Elements**：线性数组，连续索引时 O(1) 访问
- **Dictionary Elements**：哈希表，稀疏数组时降级
- **Hidden Classes**：对象结构稳定时的固定偏移优化

### 3.2 类型化数组（TypedArray）

| 类型 | 字节 | 用途 |
|------|------|------|
| `Int8Array` | 1 | 小整数数组 |
| `Float64Array` | 8 | 科学计算 |
| `Uint8Array` | 1 | 二进制数据、Buffer |
| `BigInt64Array` | 8 | 大整数 |

**性能优势**：连续内存、无装箱开销、支持 SIMD/ WebAssembly 互操作。

---

## 四、代码示例：Map/Set 高级操作与自定义数据结构

```typescript
// data-structures-lab.ts — JS/TS 数据结构实践

// 1. Map 作为有序字典的高级用法
class LRUCache<K, V> {
  private cache: Map<K, V>;
  private capacity: number;

  constructor(capacity: number) {
    this.cache = new Map();
    this.capacity = capacity;
  }

  get(key: K): V | undefined {
    if (!this.cache.has(key)) return undefined;
    // 访问后移至最近使用
    const value = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  put(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      // 淘汰最久未使用（Map 保持插入顺序）
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }
}

// 2. Set 实现集合运算
class AdvancedSet<T> extends Set<T> {
  union(other: Set<T>): AdvancedSet<T> {
    return new AdvancedSet([...this, ...other]);
  }

  intersection(other: Set<T>): AdvancedSet<T> {
    return new AdvancedSet([...this].filter((x) => other.has(x)));
  }

  difference(other: Set<T>): AdvancedSet<T> {
    return new AdvancedSet([...this].filter((x) => !other.has(x)));
  }

  symmetricDifference(other: Set<T>): AdvancedSet<T> {
    return new AdvancedSet([
      ...[...this].filter((x) => !other.has(x)),
      ...[...other].filter((x) => !this.has(x)),
    ]);
  }
}

// 3. 手动实现双向链表（理解 JS 缺失的原生链表）
class ListNode<T> {
  value: T;
  prev: ListNode<T> | null = null;
  next: ListNode<T> | null = null;

  constructor(value: T) {
    this.value = value;
  }
}

class DoublyLinkedList<T> {
  private head: ListNode<T> | null = null;
  private tail: ListNode<T> | null = null;
  private _size = 0;

  get size() { return this._size; }

  // O(1) 头部插入
  unshift(value: T): void {
    const node = new ListNode(value);
    if (!this.head) {
      this.head = this.tail = node;
    } else {
      node.next = this.head;
      this.head.prev = node;
      this.head = node;
    }
    this._size++;
  }

  // O(1) 尾部插入
  push(value: T): void {
    const node = new ListNode(value);
    if (!this.tail) {
      this.head = this.tail = node;
    } else {
      node.prev = this.tail;
      this.tail.next = node;
      this.tail = node;
    }
    this._size++;
  }

  // O(1) 头部删除
  shift(): T | undefined {
    if (!this.head) return undefined;
    const value = this.head.value;
    this.head = this.head.next;
    if (this.head) this.head.prev = null;
    else this.tail = null;
    this._size--;
    return value;
  }

  // O(n) 查找删除
  delete(value: T): boolean {
    let current = this.head;
    while (current) {
      if (current.value === value) {
        if (current.prev) current.prev.next = current.next;
        else this.head = current.next;
        if (current.next) current.next.prev = current.prev;
        else this.tail = current.prev;
        this._size--;
        return true;
      }
      current = current.next;
    }
    return false;
  }

  *values(): Generator<T> {
    let current = this.head;
    while (current) {
      yield current.value;
      current = current.next;
    }
  }
}

// 4. 使用 Map + Set 实现图结构
class Graph<T> {
  private adjacencyList = new Map<T, Set<T>>();

  addVertex(v: T): void {
    if (!this.adjacencyList.has(v)) {
      this.adjacencyList.set(v, new Set());
    }
  }

  addEdge(from: T, to: T): void {
    this.addVertex(from);
    this.addVertex(to);
    this.adjacencyList.get(from)!.add(to);
  }

  neighbors(v: T): T[] {
    return [...(this.adjacencyList.get(v) || [])];
  }

  // BFS 遍历
  bfs(start: T, callback: (v: T) => void): void {
    const visited = new Set<T>();
    const queue: T[] = [start];
    visited.add(start);

    while (queue.length > 0) {
      const vertex = queue.shift()!;
      callback(vertex);

      for (const neighbor of this.adjacencyList.get(vertex) || []) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }
  }
}
```

### 4.2 最小堆（优先队列）

```typescript
// min-heap.ts — 基于数组的二叉堆实现，用于调度与排序
class MinHeap<T> {
  private heap: T[] = [];
  private compare: (a: T, b: T) => number;

  constructor(compare = (a: T, b: T) => (a < b ? -1 : a > b ? 1 : 0)) {
    this.compare = compare;
  }

  get size() { return this.heap.length; }

  push(val: T): void {
    this.heap.push(val);
    this.bubbleUp(this.heap.length - 1);
  }

  pop(): T | undefined {
    if (this.heap.length <= 1) return this.heap.pop();
    const top = this.heap[0];
    this.heap[0] = this.heap.pop()!;
    this.bubbleDown(0);
    return top;
  }

  peek(): T | undefined {
    return this.heap[0];
  }

  private bubbleUp(i: number) {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.compare(this.heap[i], this.heap[parent]) >= 0) break;
      [this.heap[i], this.heap[parent]] = [this.heap[parent], this.heap[i]];
      i = parent;
    }
  }

  private bubbleDown(i: number) {
    const n = this.heap.length;
    while (true) {
      let smallest = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      if (left < n && this.compare(this.heap[left], this.heap[smallest]) < 0) smallest = left;
      if (right < n && this.compare(this.heap[right], this.heap[smallest]) < 0) smallest = right;
      if (smallest === i) break;
      [this.heap[i], this.heap[smallest]] = [this.heap[smallest], this.heap[i]];
      i = smallest;
    }
  }
}

// 使用：合并 K 个有序数组
function mergeKArrays<T>(arrays: T[][], compare = (a: T, b: T) => (a < b ? -1 : 1)): T[] {
  const heap = new MinHeap<{ val: T; arr: number; idx: number }>((a, b) => compare(a.val, b.val));
  const result: T[] = [];

  for (let i = 0; i < arrays.length; i++) {
    if (arrays[i].length) heap.push({ val: arrays[i][0], arr: i, idx: 0 });
  }

  while (heap.size > 0) {
    const { val, arr, idx } = heap.pop()!;
    result.push(val);
    if (idx + 1 < arrays[arr].length) {
      heap.push({ val: arrays[arr][idx + 1], arr, idx: idx + 1 });
    }
  }

  return result;
}
```

### 4.3 Trie（前缀树）

```typescript
// trie.ts — 高效前缀搜索与自动补全
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
    const node = this.traverse(word);
    return node?.isEnd ?? false;
  }

  startsWith(prefix: string): string[] {
    const node = this.traverse(prefix);
    if (!node) return [];
    const results: string[] = [];
    this.collect(node, prefix, results);
    return results;
  }

  private traverse(word: string): TrieNode | null {
    let node = this.root;
    for (const ch of word) {
      if (!node.children.has(ch)) return null;
      node = node.children.get(ch)!;
    }
    return node;
  }

  private collect(node: TrieNode, prefix: string, out: string[]): void {
    if (node.isEnd) out.push(prefix);
    for (const [ch, child] of node.children) {
      this.collect(child, prefix + ch, out);
    }
  }
}

// 使用
const trie = new Trie();
['typescript', 'java', 'javascript', 'python'].forEach(w => trie.insert(w));
console.log(trie.startsWith('jav')); // ['java', 'javascript']
```

### 4.4 布隆过滤器（空间高效的概率型结构）

```typescript
// bloom-filter.ts — 用多个哈希位判断元素"可能存在"或"肯定不存在"
class BloomFilter {
  private bits: Uint8Array;
  private size: number;
  private hashes: number;

  constructor(expectedItems: number, falsePositiveRate = 0.01) {
    this.size = Math.ceil(-(expectedItems * Math.log(falsePositiveRate)) / (Math.log(2) ** 2));
    this.hashes = Math.ceil((this.size / expectedItems) * Math.log(2));
    this.bits = new Uint8Array(Math.ceil(this.size / 8));
  }

  add(item: string): void {
    for (let i = 0; i < this.hashes; i++) {
      const idx = this.hash(item, i) % this.size;
      this.bits[Math.floor(idx / 8)] |= 1 << (idx % 8);
    }
  }

  maybeContains(item: string): boolean {
    for (let i = 0; i < this.hashes; i++) {
      const idx = this.hash(item, i) % this.size;
      if ((this.bits[Math.floor(idx / 8)] & (1 << (idx % 8))) === 0) return false;
    }
    return true;
  }

  private hash(item: string, seed: number): number {
    let h = seed;
    for (let i = 0; i < item.length; i++) {
      h = (h * 31 + item.charCodeAt(i)) >>> 0;
    }
    return h;
  }
}
```

---

## 五、实践映射

### 5.1 选型决策

```
需要有序键值对？
├── 是 → 键类型多样？
│   ├── 是 → Map
│   └── 否 → Object（仅String/Symbol键）
├── 需要唯一值集合？
│   └── → Set
├── 需要弱引用？
│   └── → WeakMap/WeakSet
└── 大数据数值计算？
    └── → TypedArray
```

---

## 六、扩展阅读

- `10-fundamentals/10.5-object-model/property-descriptors.md` — 对象属性底层机制
- `30-knowledge-base/30.8-research/tsjs-stack-panorama-2026/DATA_STRUCTURES_ALGORITHMS_THEORY.md`

---

## 七、权威参考与外部链接

| 资源 | 描述 | 链接 |
|------|------|------|
| **V8 Elements Kinds** | V8 数组内部类型优化详解 | [v8.dev/blog/elements-kinds](https://v8.dev/blog/elements-kinds) |
| **MDN Map** | Map 对象完整参考 | [developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) |
| **MDN Set** | Set 对象完整参考 | [developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set) |
| **JavaScript Algorithms** | JS 数据结构与算法实现集合 | [github.com/trekhleb/javascript-algorithms](https://github.com/trekhleb/javascript-algorithms) |
| **TypedArray Guide** | 类型化数组使用指南 | [developer.mozilla.org/en-US/docs/Web/JavaScript/Typed_arrays](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Typed_arrays) |
| **Data Structures in V8** | V8 引擎数据结构实现内幕 | [mrale.ph/blog/2015/01/11/whats-up-with-monomorphism.html](https://mrale.ph/blog/2015/01/11/whats-up-with-monomorphism.html) |
| **Introduction to Algorithms (CLRS)** | 算法与数据结构圣经 | [mitpress.mit.edu/books/introduction-algorithms-fourth-edition](https://mitpress.mit.edu/books/introduction-algorithms-fourth-edition) |
| **VisuAlgo** | 数据结构交互式可视化 | [visualgo.net](https://visualgo.net/) |
| **Algorithmica** | 高级算法与数据结构教程 | [algorithmica.org](https://algorithmica.org/) |
| **CP-Algorithms** | 竞赛编程算法百科 | [cp-algorithms.com](https://cp-algorithms.com/) |
| **Big O Cheat Sheet** | 时间/空间复杂度速查 | [bigocheatsheet.com](https://www.bigocheatsheet.com/) |
| **LeetCode** | 算法练习与面试准备 | [leetcode.com](https://leetcode.com/) |
| **Data Structure Visualizations** | USFCA 可视化工具 | [www.cs.usfca.edu/~galles/visualization/Algorithms.html](https://www.cs.usfca.edu/~galles/visualization/Algorithms.html) |
| **Rust JavaScript JIT** | V8 隐藏类与内联缓存机制 | [mrale.ph/blog/2012/06/03/exploring-js-performance.html](https://mrale.ph/blog/2012/06/03/exploring-js-performance.html) |

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
