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

### 3.1 不可变单链表

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

### 3.2 持久化向量（Relaxed Radix Balanced Tree）

持久化向量是函数式语言中 `Vector` 的核心实现，通过 32 叉树实现 O(log₃₂ n) 的随机访问与更新：

```typescript
// persistent-vector.ts
// 简化的持久化向量（32 叉树路径复制）

const BRANCH = 5;
const WIDTH = 1 << BRANCH; // 32

class PersistentVector<T> {
  constructor(
    private readonly root: any,
    private readonly tail: T[],
    public readonly size: number,
    private readonly shift: number
  ) {}

  static empty<T>(): PersistentVector<T> {
    return new PersistentVector<T>(null, [], 0, BRANCH);
  }

  // O(log₃₂ n) 随机访问
  get(index: number): T | undefined {
    if (index < 0 || index >= this.size) return undefined;
    if (index >= this.size - this.tail.length) {
      return this.tail[index & (WIDTH - 1)];
    }
    let node = this.root;
    let level = this.shift;
    while (level > 0) {
      node = node[(index >> level) & (WIDTH - 1)];
      level -= BRANCH;
    }
    return node[index & (WIDTH - 1)];
  }

  // O(log₃₂ n) 不可变更新（路径复制）
  set(index: number, value: T): PersistentVector<T> {
    if (index < 0 || index >= this.size) throw new RangeError('Index out of bounds');
    if (index >= this.size - this.tail.length) {
      const newTail = this.tail.slice();
      newTail[index & (WIDTH - 1)] = value;
      return new PersistentVector(this.root, newTail, this.size, this.shift);
    }
    const newRoot = this.clonePath(this.root, index, this.shift);
    let node = newRoot;
    let level = this.shift;
    while (level > 0) {
      const idx = (index >> level) & (WIDTH - 1);
      node = node[idx];
      level -= BRANCH;
    }
    node[index & (WIDTH - 1)] = value;
    return new PersistentVector(newRoot, this.tail, this.size, this.shift);
  }

  private clonePath(node: any, index: number, level: number): any {
    if (level === 0) return node.slice();
    const copy = node.slice();
    const idx = (index >> level) & (WIDTH - 1);
    copy[idx] = this.clonePath(node[idx], index, level - BRANCH);
    return copy;
  }
}

// 使用示例
const vec = PersistentVector.empty<string>()
  .set(0, 'a'); // 简化示例，实际需实现 push
console.log(vec.get(0));
```

### 3.3 惰性流（Lazy Stream）

惰性流允许表达无限序列，只在需要时计算元素：

```typescript
// lazy-stream.ts
// 惰性求值无限流

class Stream<T> {
  private headValue: T | undefined;
  private tailValue: Stream<T> | undefined;

  constructor(
    private readonly headFn: () => T,
    private readonly tailFn: () => Stream<T>
  ) {}

  get head(): T {
    if (this.headValue === undefined) this.headValue = this.headFn();
    return this.headValue;
  }

  get tail(): Stream<T> {
    if (this.tailValue === undefined) this.tailValue = this.tailFn();
    return this.tailValue;
  }

  static iterate<T>(seed: T, f: (x: T) => T): Stream<T> {
    return new Stream<T>(() => seed, () => Stream.iterate(f(seed), f));
  }

  static naturals(start = 1): Stream<number> {
    return Stream.iterate(start, x => x + 1);
  }

  take(n: number): T[] {
    const out: T[] = [];
    let cur: Stream<T> = this;
    for (let i = 0; i < n; i++) {
      out.push(cur.head);
      cur = cur.tail;
    }
    return out;
  }

  filter(pred: (x: T) => boolean): Stream<T> {
    const self = this;
    return new Stream<T>(
      () => {
        let cur = self;
        while (!pred(cur.head)) cur = cur.tail;
        return cur.head;
      },
      () => self.tail.filter(pred)
    );
  }

  map<R>(f: (x: T) => R): Stream<R> {
    return new Stream<R>(() => f(this.head), () => this.tail.map(f));
  }
}

// 可运行示例：素数筛（埃拉托斯特尼筛法）
function sieve(s: Stream<number>): Stream<number> {
  return new Stream<number>(
    () => s.head,
    () => sieve(s.tail.filter(x => x % s.head !== 0))
  );
}

const primes = sieve(Stream.naturals(2));
console.log(primes.take(10)); // [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]

// 斐波那契数列
const fibs: Stream<number> = new Stream(
  () => 0,
  () => new Stream(
    () => 1,
    () => fibs.zip(fibs.tail, (a, b) => a + b)
  )
);

// 辅助方法 zip
Stream.prototype.zip = function<U, R>(other: Stream<U>, f: (a: any, b: U) => R): Stream<R> {
  const self = this as Stream<any>;
  return new Stream<R>(() => f(self.head, other.head), () => self.tail.zip(other.tail, f));
};

declare module './lazy-stream' {
  interface Stream<T> {
    zip<U, R>(other: Stream<U>, f: (a: T, b: U) => R): Stream<R>;
  }
}

console.log((fibs as any).take(10)); // [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
```

### 3.4 使用 Immer 实现 Copy-on-Write

```typescript
// immer-example.ts
import { produce, enableMapSet } from 'immer';
enableMapSet();

interface State {
  user: { name: string; preferences: { theme: 'light' | 'dark' } };
  todos: Array<{ id: number; text: string; done: boolean }>;
}

const baseState: State = {
  user: { name: 'Alice', preferences: { theme: 'light' } },
  todos: [
    { id: 1, text: 'Learn persistent data structures', done: false },
  ],
};

// produce 返回新状态，旧状态不受影响
const nextState = produce(baseState, draft => {
  draft.user.preferences.theme = 'dark';
  draft.todos.push({ id: 2, text: 'Implement lazy streams', done: false });
});

console.log(baseState.user.preferences.theme); // 'light'（未改变）
console.log(nextState.user.preferences.theme); // 'dark'
console.log(baseState.todos.length); // 1
console.log(nextState.todos.length); // 2

// 结构共享验证：未修改部分引用相同
console.log(baseState.user === nextState.user); // false（被修改）
console.log(baseState.todos === nextState.todos); // false（被修改）
```

---

## 四、常见误区

| 误区 | 正确理解 |
|------|---------|
| 持久化结构非常耗内存 | 结构共享使空间开销远小于完全复制；通常仅 O(log n) 或 O(1) 额外节点 |
| 函数式结构不适合性能敏感场景 | 某些持久化结构（如 Relaxed Radix Balanced Tree）在特定操作上有竞争力 |
| Immer 深拷贝所有内容 | Immer 使用 Proxy + Copy-on-Write，仅复制被修改的路径 |

---

## 五、参考资源

### 权威论文与书籍
- [Purely Functional Data Structures — Chris Okasaki (1996)](https://www.cs.cmu.edu/~rwh/students/okasaki.pdf) — 持久化数据结构奠基博士论文
- [Persistent Data Structures — MIT 6.851](https://courses.csail.mit.edu/6.851/spring12/lectures/L01.html) — MIT 高级数据结构课程
- [Immutability in React — React 官方文档](https://react.dev/learn/updating-objects-in-state) — 不可变数据在 UI 框架中的实践

### 开源实现
- [Immutable.js — Facebook](https://immutable-js.github.io/immutable-js/) — JavaScript 持久化数据结构库
- [Immer — Structural Sharing Explained](https://immerjs.github.io/immer/) — Copy-on-Write 语义库
- [Mori — ClojureScript 数据结构移植](https://swannodette.github.io/mori/) — Clojure 持久化结构的 JS 绑定
- [Clojure Persistent Vectors](https://hypirion.com/musings/understanding-persistent-vector-pt-1) — RRB-Tree 实现详解
- [Fantasy Land Specification](https://github.com/fantasyland/fantasy-land) — JS 函数式编程代数规范

### 规范与标准
- [ECMAScript Record & Tuple Proposal](https://tc39.es/proposal-record-tuple/) — TC39 不可变数据类型提案
- `20.4-data-algorithms/data-structures/`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
