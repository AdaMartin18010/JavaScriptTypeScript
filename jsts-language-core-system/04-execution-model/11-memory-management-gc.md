# 内存管理与垃圾回收

> V8 的内存结构与垃圾回收策略
>
> 对齐版本：V8 12.x | ECMAScript 2025 (ES16)

---

## 1. 内存结构

### 1.1 栈（Stack）

存储：

- 原始值（number、string、boolean 等）
- 对象引用（指针）

特点：

- 自动分配/释放
- LIFO 结构
- 大小有限（通常 1-8MB）

### 1.2 堆（Heap）

存储：

- 对象
- 闭包环境
- 复杂数据结构

特点：

- 动态分配
- 需要垃圾回收
- 大小受系统内存限制

### 1.3 V8 的堆分区

```
┌─────────────────────────────┐
│      New Space (新生代)      │ ← 小对象，频繁 GC
│    ├─ From Space            │
│    └─ To Space              │
├─────────────────────────────┤
│      Old Space (老生代)      │ ← 存活久的对象
├─────────────────────────────┤
│    Large Object Space       │ ← 大对象（> 1MB）
├─────────────────────────────┤
│    Code Space               │ ← JIT 编译的代码
├─────────────────────────────┤
│    Map Space                │ ← Hidden Class (Map)
└─────────────────────────────┘
```

---

## 2. 垃圾回收基础

### 2.1 可达性分析（Reachability Analysis）

垃圾回收基于**可达性**而非引用计数：

```javascript
// 根对象（Root Set）
// - 全局变量
// - 当前执行上下文中的局部变量
// - DOM 树中的元素

let user = { name: "Alice" }; // user 可从根访问
user = null;                  // 对象不再可达，可被回收
```

### 2.2 标记-清除（Mark-and-Sweep）

1. **标记阶段**：从根对象出发，遍历所有可达对象并标记
2. **清除阶段**：回收未标记的对象

---

## 3. V8 的分代垃圾回收

### 3.1 新生代（New Space）

- 存放**新创建**的对象
- 使用 **Scavenge 算法**（复制算法）
- 大小：1-16MB

```
Scavenge 算法：
1. 对象分配在 From Space
2. GC 时，存活对象复制到 To Space
3. From/To Space 交换角色
4. 经历两次 GC 仍存活的对象晋升到老生代
```

### 3.2 老生代（Old Space）

- 存放**存活久**的对象
- 使用 **Mark-Compact 算法**
- 大小：动态增长

```
Mark-Compact 算法：
1. 标记阶段：标记所有可达对象
2. 压缩阶段：将存活对象移动到一端
3. 清除阶段：回收边界外的内存
```

---

## 4. 增量与并发 GC

### 4.1 增量标记（Incremental Marking）

将标记工作拆分为多个小步骤，穿插在 JavaScript 执行之间：

```
JS 执行 → 标记一小步 → JS 执行 → 标记一小步 → ... → 清除
```

### 4.2 并发标记（Concurrent Marking）

标记工作完全在**辅助线程**中进行，不阻塞主线程：

```
主线程: JS 执行 ──────────────────────────→
辅助线程: ──────→ 标记 ─────────────────→
```

### 4.3 空闲时 GC（Idle-time GC）

利用主线程空闲时间进行 GC：

```javascript
requestIdleCallback((deadline) => {
  if (deadline.timeRemaining() > 10) {
    // V8 可能在此执行 GC
  }
});
```

---

## 5. 内存泄漏模式

### 5.1 全局变量

```javascript
function leak() {
  leaked = "I am global"; // 非严格模式下创建全局变量
}
```

### 5.2 闭包引用

```javascript
function outer() {
  const hugeArray = new Array(1000000);
  return function inner() {
    console.log("small");
    // hugeArray 被闭包引用，无法释放
  };
}
```

### 5.3 事件监听器未移除

```javascript
function setup() {
  const element = document.getElementById("btn");
  element.addEventListener("click", () => {
    console.log("clicked");
  });
  // 如果 element 被移除，监听器仍引用它
}
```

### 5.4 Map/Set 的强引用

```javascript
const cache = new Map();
function process(obj) {
  cache.set(obj, "processed");
  // obj 永远留在 cache 中，除非手动删除
}
```

**解决方案**：使用 `WeakMap` / `WeakSet`。

### 5.5 DOM 引用

```javascript
const elements = {
  button: document.getElementById("btn")
};
// 即使从 DOM 中移除 btn，elements.button 仍引用它
```

---

## 6. 诊断工具

### 6.1 Chrome DevTools Memory

- **Heap Snapshot**：查看内存中的对象分布
- **Allocation Timeline**：追踪内存分配
- **Allocation Sampling**：采样分析内存分配

### 6.2 Node.js

```bash
# 使用 --inspect 启动
node --inspect app.js

# 生成 heapdump
const heapdump = require("heapdump");
heapdump.writeSnapshot("./heap.heapsnapshot");
```

---

**参考资源**：V8 Blog: Trash talk | MDN: Memory Management
