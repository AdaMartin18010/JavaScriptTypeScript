# 函数式数据结构

> **定位**：`20-code-lab/20.4-data-algorithms/data-structures/functional`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块解决不可变数据与函数式编程范式下的结构需求问题。通过持久化数据结构实现高效的结构共享。

### 1.2 形式化基础

- **持久化数据结构（Persistent DS）**：更新操作不破坏旧版本，新旧版本共享未修改部分。
- **结构共享**：通过路径复制（path copying）使不可变更新均摊时间复杂度接近可变版本。
- **惰性求值**：延迟计算直到值被需要，用于构建无限流（lazy stream）。

### 1.3 关键概念

| 概念 | 定义 | 关联 |
|------|------|------|
| 持久化 | 不可变更新下的结构共享 | persistent-tree.ts |
| 惰性求值 | 延迟到必要时的表达式计算 | lazy-list.ts |
| 路径复制 | 只复制被修改节点路径的优化策略 | path-copying.ts |

---

## 二、设计原理

### 2.1 为什么存在

不可变数据消除了共享可变状态导致的 bug。函数式数据结构通过持久化和结构共享，在保持不可变的同时控制空间开销。

### 2.2 持久化 vs 瞬时（Ephemeral）数据结构

| 特性 | 持久化（Persistent） | 瞬时（Ephemeral） |
|------|---------------------|-------------------|
| 可变性 | 不可变 | 可变 |
| 历史版本 | 保留，可时间旅行 | 覆盖，仅最新可见 |
| 并发安全 | 天然线程安全 | 需锁/原子操作 |
| 空间策略 | 结构共享 | 原地修改 |
| 时间复杂度 | 通常 O(log n) 更新 | O(1) 更新 |
| 代表实现 | Immutable.js, Mori, Immer | 原生 Array, Map |

### 2.3 与相关技术的对比

与可变结构对比：函数式安全但可能有常数级空间开销，可变高效但易出 bug。Immer 等库通过 Copy-on-Write 在可变语法下生成持久化语义。

---

## 三、实践映射

### 3.1 从理论到代码

以下是 **不可变单链表** 的 TypeScript 实现，展示结构共享：

```typescript
// immutable-list.ts
// 持久化不可变单链表 + 结构共享

class ImmutableList<T> {
  constructor(
    public readonly head: T | null = null,
    public readonly tail: ImmutableList<T> | null = null,
    public readonly size: number = 0
  ) {}

  static empty<T>(): ImmutableList<T> {
    return new ImmutableList<T>();
  }

  // O(1) 前置插入：新节点引用旧链表作为 tail，结构共享
  prepend(value: T): ImmutableList<T> {
    return new ImmutableList(value, this, this.size + 1);
  }

  // O(n) 追加：需复制整条路径（函数式列表的经典权衡）
  append(value: T): ImmutableList<T> {
    if (this.size === 0) return this.prepend(value);
    const rest = this.tail!.append(value);
    return new ImmutableList(this.head, rest, this.size + 1);
  }

  toArray(): T[] {
    const out: T[] = [];
    let cur: ImmutableList<T> | null = this;
    while (cur && cur.size > 0) {
      out.push(cur.head!);
      cur = cur.tail;
    }
    return out;
  }
}

// 可运行示例：展示结构共享
const list1 = ImmutableList.empty<number>().prepend(1).prepend(2).prepend(3);
// 3 -> 2 -> 1

const list2 = list1.prepend(0);
// 0 -> 3 -> 2 -> 1（共享 3->2->1）

const list3 = list1.append(4);
// 3 -> 2 -> 1 -> 4（共享 3->2，但 1 之后新建节点）

console.log('list1:', list1.toArray()); // [3, 2, 1]
console.log('list2:', list2.toArray()); // [0, 3, 2, 1]
console.log('list3:', list3.toArray()); // [3, 2, 1, 4]

// 验证结构共享：list2.tail 与 list1 是同一引用
console.log('Shares tail?', list2.tail === list1); // true
```

### 3.2 常见误区

| 误区 | 正确理解 |
|------|---------|
| 持久化结构非常耗内存 | 结构共享使空间开销远小于完全复制；通常仅 O(log n) 或 O(1) 额外节点 |
| 函数式结构不适合性能敏感场景 | 某些持久化结构（如 Relaxed Radix Balanced Tree）在特定操作上有竞争力 |
| Immer 深拷贝所有内容 | Immer 使用 Proxy + Copy-on-Write，仅复制被修改的路径 |

### 3.3 扩展阅读

- [Immutable.js — Facebook](https://immutable-js.github.io/immutable-js/)
- [Persistent Data Structures — Okasaki](https://www.cs.cmu.edu/~rwh/students/okasaki.pdf)
- [Immer — Structural Sharing Explained](https://immerjs.github.io/immer/)
- [Clojure Persistent Vectors](https://hypirion.com/musings/understanding-persistent-vector-pt-1)
- `20.4-data-algorithms/data-structures/`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
