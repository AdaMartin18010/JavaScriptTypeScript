# Agent、Realm 与 Job Queue

> ECMAScript 规范中的并发原语与执行环境抽象
>
> 对齐版本：ECMAScript 2025 (ES16)

---

## 1. Agent

Agent 是 ECMAScript 的执行上下文集合，对应一个线程：

```
Agent = {
  [[LittleEndian]]: Boolean,
  [[CanBlock]]: Boolean,
  [[Signifier]]: Symbol,
  [[IsLockFree1]]: Boolean,
  [[IsLockFree2]]: Boolean,
  [[CandidateExecution]]: Record,
  [[KeptAlive]]: List<Object>
}
```

### 1.1 Agent Cluster

多个 Agent 可以组成 Agent Cluster，共享内存（SharedArrayBuffer）：

```javascript
const shared = new SharedArrayBuffer(1024);
const worker = new Worker("worker.js");
worker.postMessage(shared, [shared]);

// worker.js
self.onmessage = (e) => {
  const shared = e.data;
  const arr = new Int32Array(shared);
  Atomics.store(arr, 0, 42);
};
```

---

## 2. Realm

Realm 是一个完整的 ECMAScript 环境，包含全局对象和内置对象：

```
Realm = {
  [[Intrinsics]]: Record,      // 内置对象（Object、Array 等）
  [[GlobalObject]]: Object,    // 全局对象
  [[GlobalEnv]]: Environment Record, // 全局环境
  [[TemplateMap]]: List,       // 模板字面量缓存
  [[LoadedModules]]: List      // 已加载模块
}
```

### 2.1 多 Realm 场景

- **iframe**：每个 iframe 有自己的 Realm
- **eval()**：在相同 Realm 中执行
- **vm 模块（Node.js）**：创建新 Realm

```javascript
// iframe 创建新 Realm
const iframe = document.createElement("iframe");
document.body.appendChild(iframe);

// iframe 的全局对象与当前页面不同
console.log(iframe.contentWindow.Array === Array); // false（不同 Realm）
```

---

## 3. Job Queue

Job Queue 是 ECMAScript 的任务队列抽象：

```
Job Queue = List<Job>
Job = {
  [[JobCallback]]: Function,
  [[Arguments]]: List
}
```

### 3.1 队列类型

| 队列 | 用途 |
|------|------|
| ScriptJobs | 脚本执行 |
| PromiseJobs | Promise 回调（微任务） |
| PromiseResolveThenableJobs | thenable 解析 |

### 3.2 与事件循环的关系

```
浏览器事件循环 ≈ ECMAScript Job Queue + 宿主环境扩展
```

ECMAScript 规范定义了 Job Queue 的抽象，浏览器和 Node.js 在此基础上扩展了宏任务队列：

| 规范概念 | 浏览器实现 | Node.js 实现 |
|---------|-----------|-------------|
| Job Queue | Microtask Queue | Microtask Queue |
| ScriptJobs | 脚本执行 | 脚本执行 |
| PromiseJobs | Promise.then/catch/finally | Promise.then/catch/finally |

---

## 4. Agent 的 [[CanBlock]]

```javascript
// 主线程的 [[CanBlock]] 是 false
// Worker 的 [[CanBlock]] 是 true

// 在 Worker 中可以使用 Atomics.wait（阻塞）
// worker.js
const shared = new Int32Array(sharedBuffer);
Atomics.wait(shared, 0, 0); // 阻塞直到被唤醒
```

---

## 5. 规范中的执行模型

```
ECMAScript 执行模型：
1. 创建 Agent
2. 在 Agent 中创建 Realm
3. 将脚本/模块推入 Job Queue
4. 执行 Job（运行脚本）
5. 处理 PromiseJobs（微任务）
6. 重复步骤 3-5
```

### 5.1 微任务的优先级

```javascript
// 执行顺序：Sync → Microtasks → Macrotasks
console.log("sync");

queueMicrotask(() => console.log("microtask"));

setTimeout(() => console.log("macrotask"), 0);

Promise.resolve().then(() => console.log("promise microtask"));

// 输出：sync → microtask → promise microtask → macrotask
```

---

**参考规范**：ECMA-262 §9.7 Agents | ECMA-262 §9.3 Realms | ECMA-262 §9.5 Jobs and Job Queues

## 扩展话题：相关规范与实现细节

### 规范引用

ECMA-262 规范详细定义了本节所有机制。关键章节包括：
- §6.2.3 Completion Record 规范
- §9.1 Environment Records
- §9.4 Execution Contexts
- §10.2.1.1 OrdinaryCallBindThis

### 引擎实现差异

| 引擎 | 相关实现 |
|------|---------|
| V8 (Chrome/Node) | 快速属性访问、隐藏类优化 |
| SpiderMonkey (Firefox) | 形状(shape)系统、基线编译器 |
| JavaScriptCore (Safari) | DFG/FTL 编译器、类型推断 |

### 调试技巧

`javascript
// 使用 Chrome DevTools 检查内部状态
debugger; // 在 Sources 面板查看 Scope 链

// 使用 console.trace() 查看调用栈
function deep() {
  console.trace("Current stack");
}
`

### 常见面试题

1. 解释暂时性死区(TDZ)及其产生原因
2. var/let/const 的区别是什么？
3. 函数声明和函数表达式的提升行为有何不同？
4. 解释 this 的四种绑定规则
5. 什么是闭包？它如何工作？

### 推荐阅读

- ECMA-262 规范官方文档
- TypeScript Handbook
- You Don't Know JS (Kyle Simpson)
- JavaScript: The Definitive Guide

## 深入理解：内存模型与性能

### 内存布局

JavaScript 引擎在内存中组织对象和变量：

`
栈内存（Stack）：
  - 原始值（number, string, boolean等）
  - 函数调用帧
  - 局部变量引用

堆内存（Heap）：
  - 对象
  - 函数闭包
  - 大型数据结构
`

### V8 优化技术

| 技术 | 描述 |
|------|------|
| 隐藏类 | 为对象创建内部形状描述 |
| 内联缓存 | 缓存属性查找位置 |
| 标量替换 | 将小对象分解为局部变量 |
| 逃逸分析 | 确定对象是否离开作用域 |

### 性能基准

`javascript
// 快速属性访问（单态）
obj.x; // 优化：直接偏移访问

// 多态属性访问
if (condition) obj = { x: 1 }; else obj = { x: 2, y: 3 };
obj.x; // 降级：字典查找
`

### 垃圾回收影响

`javascript
// 减少 GC 压力
function process() {
  const data = new Array(1000000);
  // 使用 data...
  // 函数返回后，data 可被回收
}

// 避免内存泄漏
let cache = {};
// 定期清理或使用 WeakMap
`

### 最佳实践总结

1. **优先使用 const**：不可变性帮助引擎优化
2. **避免动态属性**：稳定结构利于隐藏类
3. **减少嵌套深度**：浅层作用域链查找更快
4. **使用箭头函数**：减少 this 绑定开销
5. **缓存频繁访问**：将深层属性提取到局部变量
