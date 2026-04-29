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

## 六、权威参考链接

| 资源 | 说明 | 链接 |
|------|------|------|
| JavaScript Algorithms — Data Structures | 完整自定义实现与单元测试 | [github.com/trekhleb/javascript-algorithms](https://github.com/trekhleb/javascript-algorithms) |
| VisuAlgo — 数据结构与算法可视化 | 交互式理解链表/树/图行为 | [visualgo.net](https://visualgo.net/en/list) |
| Introduction to Algorithms (CLRS) | 形式化证明与摊还分析 | ISBN 978-0262046305 |
| Wikipedia — Abstract Data Type | ADT 与实现分离的理论基础 | [en.wikipedia.org/wiki/Abstract_data_type](https://en.wikipedia.org/wiki/Abstract_data_type) |

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
