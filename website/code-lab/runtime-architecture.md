---
title: 运行时与架构实验室
description: "运行时与架构实验：事件循环、内存管理、V8引擎、微服务与边缘架构"
---

# 运行时与架构 (50-54)

> 理解代码的底层运行机制是成为高级工程师的必经之路。本实验室通过动手实验，深入探索 JavaScript 运行时、浏览器/Node.js 架构、微服务通信和边缘计算。

## 实验模块

| 编号 | 模块 | 实验数 | 核心内容 |
|------|------|--------|----------|
| **50** | event-loop | 4 | 浏览器与 Node.js 事件循环差异 |
| **51** | memory-management | 4 | 垃圾回收、内存泄漏检测 |
| **52** | v8-internals | 3 | 编译管线、隐藏类、内联缓存 |
| **53** | microservices | 5 | 服务通信、熔断、限流 |
| **54** | edge-computing | 4 | Workers、边缘缓存、Durable Objects |

## 核心实验

### 事件循环可视化

```javascript
// 实验：验证微任务 vs 宏任务优先级
console.log('1. 同步');

setTimeout(() => console.log('2. 宏任务'), 0);

Promise.resolve().then(() => &#123;
  console.log('3. 微任务');
  return Promise.resolve();
&#125;).then(() => &#123;
  console.log('4. 嵌套微任务');
&#125;);

queueMicrotask(() => console.log('5. queueMicrotask'));

console.log('6. 同步结束');

// 输出顺序：1 → 6 → 3 → 5 → 4 → 2
```

### 内存泄漏检测

```javascript
// 实验：检测常见的内存泄漏模式

// 泄漏1：闭包引用
function createLeak() &#123;
  const hugeArray = new Array(1e6).fill('x');
  return () => hugeArray[0]; // hugeArray 永远无法释放
&#125;

// 泄漏2：事件监听器未移除
class LeakyComponent &#123;
  constructor() &#123;
    window.addEventListener('resize', this.handleResize);
    // 忘记 removeEventListener
  &#125;
&#125;

// 泄漏3：Map 缓存无上限
const cache = new Map();
function getData(key) &#123;
  if (!cache.has(key)) &#123;
    cache.set(key, fetchData(key)); // 持续增长
  &#125;
  return cache.get(key);
&#125;
```

### V8 编译管线实验

```javascript
// 实验：观察 TurboFan 优化效果
function add(a, b) &#123;
  return a + b;
&#125;

// 初始：解释执行（Ignition）
// 多次调用后：快速编译（Maglev）
// 高频调用后：优化编译（TurboFan）

for (let i = 0; i &lt; 100000; i++) &#123;
  add(i, i + 1);
&#125;

// 使用 --trace-opt 查看优化日志
// node --trace-opt script.js
```

## 参考资源

- [执行模型导读](/fundamentals/execution-model) — V8 引擎与事件循环深度解析
- [Edge 架构示例](/examples/edge-architecture/) — Cloudflare Workers 部署实战
- [微服务示例](/examples/microservices/) — gRPC 与服务网格

---

 [← 返回代码实验室首页](./)
