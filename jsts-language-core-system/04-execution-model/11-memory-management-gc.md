# 内存管理与垃圾回收

> V8 的内存结构与垃圾回收策略

---

## 内容大纲（TODO）

### 1. 内存结构

- 栈（Stack）：原始值与引用
- 堆（Heap）：对象存储
- V8 的堆分区

### 2. 垃圾回收基础

- 可达性分析（Reachability Analysis）
- 根集合（Root Set）
- 标记-清除（Mark-and-Sweep）

### 3. V8 的分代垃圾回收

- 新生代（New Space）：Scavenge 算法
- 老生代（Old Space）：Mark-Compact
- 大对象空间（Large Object Space）

### 4. 增量与并发 GC

- 增量标记（Incremental Marking）
- 并发标记（Concurrent Marking）
- 空闲时 GC（Idle-time GC）

### 5. 内存泄漏模式

- 全局变量
- 闭包引用
- 事件监听器未移除
- Map/Set 的强引用
- DOM 引用

### 6. 诊断工具

- Chrome DevTools Memory
- Node.js --inspect
- heapdump
