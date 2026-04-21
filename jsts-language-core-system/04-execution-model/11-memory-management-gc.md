# V8 内存管理与垃圾回收

> 堆结构、分代 GC、Orinoco 并行回收与内存泄漏诊断
>
> 对齐版本：ECMAScript 2025 (ES16) | V8 12.x

---

## 1. V8 堆结构

V8 将内存分为多个区域：

```
┌─────────────────────────────────────────────┐
│                  新生代（New Space）          │
│  ┌──────────────┐  ┌──────────────┐          │
│  │  From Space  │  │   To Space   │          │
│  │  (半空间复制) │  │  (目标空间)   │          │
│  └──────────────┘  └──────────────┘          │
│                    大小：1-8 MB               │
├─────────────────────────────────────────────┤
│                  老生代（Old Space）          │
│  ┌──────────────────────────────────────┐   │
│  │         Old Pointer Space            │   │
│  │         Old Data Space               │   │
│  │         Large Object Space           │   │
│  │         Code Space                   │   │
│  │         Map Space                    │   │
│  └──────────────────────────────────────┘   │
│                    大小：动态扩展             │
├─────────────────────────────────────────────┤
│              大对象空间（Large Object Space） │
│         超过 1MB 的对象直接分配于此           │
└─────────────────────────────────────────────┘
```

---

## 2. 分代垃圾回收

V8 的 Orinoco GC 基于**分代假设**：大多数对象在创建后不久就不再被引用（"朝生暮死"）。

### 2.1 新生代：Scavenge 算法

新生代使用 **Semi-Space Copy**（半空间复制）算法：

1. 新对象分配在 **From Space**
2. From Space 满时，触发 Scavenge
3. 存活对象复制到 **To Space**
4. From Space 和 To Space 角色互换

```javascript
// 新生代中的对象
function createTemp() {
  const temp = { data: "temporary" }; // 分配在新生代
  return temp.data.length;
}

for (let i = 0; i < 100000; i++) {
  createTemp(); // temp 对象在函数返回后不再被引用
  // Scavenge 快速回收这些对象
}
```

**特点**：

- 暂停时间极短（< 1ms）
- 只处理存活对象，大多数对象已经死亡
- 经过两次 Scavenge 仍然存活的对象被**晋升**到老生代

### 2.2 老生代：Mark-Sweep-Compact

老生代对象存活概率高，使用更复杂的算法：

#### Mark（标记）

从 GC Roots 出发，遍历所有可达对象并标记：

```
GC Roots 包括：
- 全局对象
- 当前执行栈上的局部变量
- 闭包引用的变量
- DOM 节点引用（浏览器环境）
```

#### Sweep（清除）

清除未标记的对象，释放内存。

#### Compact（压缩）

将存活对象移动到内存的一端，消除碎片。

### 2.3 Orinoco：并行与并发回收

Orinoco 是 V8 的现代 GC，引入了并行和并发策略：

| 阶段 | 策略 | 说明 |
|------|------|------|
| 标记 | 并发标记 | 与 JavaScript 执行并行，减少暂停 |
| 清除 | 并行清除 | 多个线程同时清除 |
| 压缩 | 增量压缩 | 分步进行，避免长暂停 |

**目标**：典型的 Web 工作负载下，暂停时间控制在 **1ms 以下**。

---

## 3. 内存泄漏模式

### 3.1 意外的全局变量

```javascript
function leak() {
  leakedVar = "I am global"; // 未声明，成为全局对象属性
}

// 严格模式防止
"use strict";
function noLeak() {
  leakedVar = "error"; // ReferenceError
}
```

### 3.2 闭包引用未释放

```javascript
function createLeakyClosure() {
  const hugeData = new Array(1000000).fill("x");

  return function() {
    console.log("I don't use hugeData");
    // 但整个词法环境被保留
  };
}

const fn = createLeakyClosure();
// hugeData 无法被回收！
```

**解决方案**：

```javascript
function createFixedClosure() {
  const hugeData = new Array(1000000).fill("x");
  const result = process(hugeData); // 只保留结果

  return function() {
    return result; // 只引用 result
  };
}
```

### 3.3  detached DOM 引用

```javascript
const elements = {
  button: document.getElementById("button")
};

document.body.removeChild(elements.button);
// elements.button 仍引用 DOM 节点，内存无法释放

// 解决方案
function removeButton() {
  const button = document.getElementById("button");
  document.body.removeChild(button);
  // 不再保留引用
}
```

### 3.4 未清除的定时器和事件监听

```javascript
// ❌ 组件卸载时未清除
function setupTimer() {
  setInterval(() => {
    console.log("tick");
  }, 1000);
}

// ✅ 正确做法
function setupTimer() {
  const timer = setInterval(() => {
    console.log("tick");
  }, 1000);

  return () => clearInterval(timer); // 返回清理函数
}

// React useEffect 模式
useEffect(() => {
  const timer = setInterval(() => {}, 1000);
  return () => clearInterval(timer); // 清理
}, []);
```

### 3.5 Map/Set 的强引用

```javascript
// ❌ WeakMap 的替代方案
const cache = new Map(); // 强引用

function process(obj) {
  if (!cache.has(obj)) {
    cache.set(obj, heavyComputation(obj));
  }
  return cache.get(obj);
}
// obj 永远不会被回收，因为 Map 强引用它

// ✅ 使用 WeakMap
const weakCache = new WeakMap();

function process(obj) {
  if (!weakCache.has(obj)) {
    weakCache.set(obj, heavyComputation(obj));
  }
  return weakCache.get(obj);
}
// 当 obj 不再被其他地方引用时，GC 可以回收它
```

---

## 4. `WeakRef` 与 `FinalizationRegistry`

### 4.1 WeakRef

`WeakRef` 允许持有对象的**弱引用**，不阻止垃圾回收：

```javascript
let target = { data: "important" };
const ref = new WeakRef(target);

console.log(ref.deref()); // { data: "important" }

target = null; // 移除强引用
// 之后某次 GC 可能回收对象
console.log(ref.deref()); // undefined（如果已被回收）
```

### 4.2 FinalizationRegistry

在对象被垃圾回收时执行回调：

```javascript
const registry = new FinalizationRegistry(heldValue => {
  console.log(`Object with ${heldValue} was garbage collected`);
});

let obj = { id: 1 };
registry.register(obj, "resource-id-1");

obj = null;
// 某次 GC 后，回调被调用
```

**警告**：回调执行时间不保证，不应依赖其进行关键资源清理。优先使用 `using` 声明（ES2025）。

---

## 5. 内存诊断工具

### 5.1 Chrome DevTools Memory 面板

- **Heap Snapshot**：捕获堆内存快照，分析对象分布
- **Allocation Timeline**：记录内存分配的时间线
- **Allocation Sampling**：采样分析内存分配

### 5.2 Node.js 诊断

```bash
# 堆快照
node --heap-snapshot-near-heap-limit=3 app.js

# V8 标志
node --expose-gc --track-heap-objects app.js

# 内存使用监控
const v8 = require('v8');
console.log(v8.getHeapStatistics());
```

### 5.3 代码级内存监控

```javascript
// 监控内存使用
function logMemoryUsage() {
  const usage = process.memoryUsage();
  console.log({
    rss: `${(usage.rss / 1024 / 1024).toFixed(2)} MB`,      // 常驻集大小
    heapTotal: `${(usage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
    heapUsed: `${(usage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
    external: `${(usage.external / 1024 / 1024).toFixed(2)} MB`
  });
}
```

---

**参考资源**：

- [V8 Blog: Trash Talk](https://v8.dev/blog/trash-talk)
- [V8 Blog: Orinoco](https://v8.dev/blog/orinoco)
- [Chrome DevTools: Memory Analysis](https://developer.chrome.com/docs/devtools/memory/)
