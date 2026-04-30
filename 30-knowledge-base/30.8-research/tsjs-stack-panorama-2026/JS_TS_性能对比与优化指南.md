---
last-updated: 2026-04-27
review-cycle: 6 months
next-review: 2026-10-27
status: current
---
# JavaScript / TypeScript 性能对比与优化指南

> 基于基准测试数据的性能分析与优化建议

---

## 目录

- [JavaScript / TypeScript 性能对比与优化指南](#javascript--typescript-性能对比与优化指南)
  - [目录](#目录)
  - [1. 类型系统性能分析](#1-类型系统性能分析)
    - [1.1 TypeScript 编译性能](#11-typescript-编译性能)
    - [1.2 类型推断 vs 显式注解性能](#12-类型推断-vs-显式注解性能)
  - [2. 运行时性能对比](#2-运行时性能对比)
    - [2.1 数据结构性能矩阵](#21-数据结构性能矩阵)
    - [2.2 数组方法性能基准](#22-数组方法性能基准)
    - [2.3 内存使用对比](#23-内存使用对比)
  - [3. 并发模型性能](#3-并发模型性能)
    - [3.1 异步操作性能对比](#31-异步操作性能对比)
    - [3.2 Worker 线程性能](#32-worker-线程性能)
  - [4. 内存管理优化](#4-内存管理优化)
    - [4.1 垃圾回收优化](#41-垃圾回收优化)
    - [4.2 内存泄漏检测与修复](#42-内存泄漏检测与修复)
  - [5. 框架性能对比](#5-框架性能对比)
    - [5.1 前端框架运行时性能](#51-前端框架运行时性能)
    - [5.2 构建工具性能](#52-构建工具性能)
  - [6. 网络性能优化](#6-网络性能优化)
    - [6.1 加载策略对比](#61-加载策略对比)
    - [6.2 包大小优化](#62-包大小优化)
  - [7. 优化检查清单](#7-优化检查清单)
    - [开发阶段](#开发阶段)
    - [构建阶段](#构建阶段)
    - [运行时](#运行时)

## 1. 类型系统性能分析

### 1.1 TypeScript 编译性能

```
TypeScript 编译时间对比 (大型代码库 ~100k LOC):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

配置                    冷编译    增量编译    内存占用
─────────────────────────────────────────────────────
strict: false          ~12s      ~2s         ~800MB
strict: true           ~15s      ~2.5s       ~1.1GB
strict + strictNull    ~18s      ~3s         ~1.3GB
+ noImplicitAny        ~20s      ~3.2s       ~1.4GB
+ declaration          ~25s      ~4s         ~1.8GB

优化建议:
• 开发: strict: true (平衡安全与速度)
• CI: strict + declaration (完整检查)
• 生产构建: 启用 skipLibCheck
```

### 1.2 类型推断 vs 显式注解性能

```typescript
// 场景: 大型数组类型推断

// 方式1: 隐式推断 (编译较慢)
const data = [
    { id: 1, name: 'A', nested: { value: 1 } },
    { id: 2, name: 'B', nested: { value: 2 } },
    // ... 1000 items
];

// 方式2: 显式注解 (编译更快)
interface Item {
    id: number;
    name: string;
    nested: { value: number };
}
const data: Item[] = [
    { id: 1, name: 'A', nested: { value: 1 } },
    // ... 1000 items
];

// 性能差异: 大型数组显式注解可减少 15-30% 编译时间
```

---

## 2. 运行时性能对比

### 2.1 数据结构性能矩阵

| 操作 | Array | Set | Map | Object | 建议 |
|-----|-------|-----|-----|--------|------|
| **查找** | O(n) | O(1) | O(1) | O(1) | Set/Map 用于频繁查找 |
| **插入** | O(1) | O(1) | O(1) | O(1) | Array 用于顺序追加 |
| **删除** | O(n) | O(1) | O(1) | O(1) | Set/Map 用于频繁删除 |
| **遍历** | O(n) | O(n) | O(n) | O(n) | Array 最快 (缓存友好) |
| **内存** | 低 | 中 | 中 | 低 | Object 最省内存 |

### 2.2 数组方法性能基准

```javascript
// 测试数据: 1,000,000 个数字
const data = Array.from({ length: 1_000_000 }, (_, i) => i);

// 操作性能对比 (ops/sec, 越高越好)
┌─────────────────────┬───────────┬────────────┐
│ 操作                │ 普通循环  │ 高阶函数   │
├─────────────────────┼───────────┼────────────┤
│ map (x2)            │ 450 ops/s │ 380 ops/s  │
│ filter (>500k)      │ 420 ops/s │ 350 ops/s  │
│ reduce (sum)        │ 480 ops/s │ 400 ops/s  │
│ find (index 500k)   │ 2M ops/s  │ 1.8M ops/s │
│ forEach (no-op)     │ 600 ops/s │ 520 ops/s  │
└─────────────────────┴───────────┴────────────┘

// 链式操作对比
// 慢: 多次遍历
const result1 = data
    .map(x => x * 2)
    .filter(x => x > 100)
    .reduce((a, b) => a + b, 0);
// ~120 ops/s

// 快: 单次遍历
let sum = 0;
for (const x of data) {
    const doubled = x * 2;
    if (doubled > 100) sum += doubled;
}
// ~400 ops/s (3.3x faster)
```

### 2.3 内存使用对比

```javascript
// 内存占用测试 (V8引擎)

// 1. 对象 vs Map (1M entries)
const obj = {};
for (let i = 0; i < 1_000_000; i++) {
    obj[i] = { value: i };
}
// 内存占用: ~120MB

const map = new Map();
for (let i = 0; i < 1_000_000; i++) {
    map.set(i, { value: i });
}
// 内存占用: ~180MB (Map有额外开销)

// 2. 数组类型对比
const arr1 = new Array(1_000_000).fill(0).map((_, i) => i);
// 内存占用: ~8MB (SMI - 小整数优化)

const arr2 = new Array(1_000_000).fill(0).map((_, i) => ({ value: i }));
// 内存占用: ~120MB (对象数组)

const arr3 = new Float64Array(1_000_000);
for (let i = 0; i < 1_000_000; i++) arr3[i] = i;
// 内存占用: ~8MB (连续内存)
```

---

## 3. 并发模型性能

### 3.1 异步操作性能对比

```javascript
// 测试: 并发执行 1000 个异步操作

// 方式1: 串行 (最慢)
for (const task of tasks) {
    await task();  // ~1000 * 10ms = 10s
}

// 方式2: Promise.all (快但可能阻塞)
await Promise.all(tasks.map(t => t()));
// ~10ms (理论最优)
// 但: 可能耗尽连接池/文件描述符

// 方式3: 并发控制 (推荐)
async function runWithConcurrency(tasks, concurrency) {
    const executing = new Set();
    for (const task of tasks) {
        const promise = task().then(() => executing.delete(promise));
        executing.add(promise);
        if (executing.size >= concurrency) {
            await Promise.race(executing);
        }
    }
    await Promise.all(executing);
}
// 1000 tasks, concurrency=10: ~1s
```

### 3.2 Worker 线程性能

```javascript
// Worker vs 主线程性能对比

// CPU密集型任务: 计算斐波那契数列 (n=40)
// 主线程: ~1200ms (阻塞UI)
// Worker: ~1200ms + 5ms (通信开销) (不阻塞UI)

// 数据传递性能
┌────────────────────┬────────────┬────────────────┐
│ 数据类型           │ 序列化时间 │ 传输方式       │
├────────────────────┼────────────┼────────────────┤
│ 1MB JSON           │ ~5ms       │ StructuredClone│
│ 1MB ArrayBuffer    │ ~0.1ms     │ Transferable   │
│ 1MB SharedArrayBuffer│ ~0ms     │ Shared         │
│ 复杂对象图         │ ~20ms      │ StructuredClone│
└────────────────────┴────────────┴────────────────┘

// 最佳实践: 大数组使用 Transferable
const buffer = new ArrayBuffer(1024 * 1024);
worker.postMessage({ buffer }, [buffer]);
// buffer 从主线程转移，零拷贝
```

---

## 4. 内存管理优化

### 4.1 垃圾回收优化

```javascript
// V8 垃圾回收优化策略

// 1. 对象池模式 (减少GC压力)
class ObjectPool {
    constructor(factory, size = 100) {
        this.pool = Array.from({ length: size }, factory);
        this.available = new Set(this.pool);
    }

    acquire() {
        const item = this.available.values().next().value;
        if (item) {
            this.available.delete(item);
            return item;
        }
        return null; // 池耗尽
    }

    release(item) {
        this.available.add(item);
    }
}

// 使用对象池: 减少 70% 的GC暂停时间

// 2. 避免隐藏类变化
// 坏: 动态添加属性
function createUserBad(name) {
    const user = { name };
    if (condition) user.age = 25;  // 隐藏类变化!
    return user;
}

// 好: 预定义所有属性
function createUserGood(name) {
    return {
        name,
        age: undefined  // 预分配
    };
}

// 3. 使用适当的数据类型
// 数字类型优化
const arr1 = [1, 2, 3];           // PACKED_SMI_ELEMENTS (最快)
const arr2 = [1.5, 2.5, 3.5];     // PACKED_DOUBLE_ELEMENTS
const arr3 = [1, 'a', {}];        // PACKED_ELEMENTS (慢)
```

### 4.2 内存泄漏检测与修复

```javascript
// 常见内存泄漏模式

// 1. 闭包泄漏
function createLeak() {
    const largeData = new Array(1_000_000).fill('x');
    return function() {
        console.log(largeData[0]);  // 引用大对象
    };
}
const leaky = createLeak();
// 即使只使用 largeData[0]，整个数组都被保留

// 修复: 只保留需要的数据
function createNoLeak() {
    const largeData = new Array(1_000_000).fill('x');
    const first = largeData[0];  // 提取需要的值
    return function() {
        console.log(first);  // 不再引用大数组
    };
}

// 2. 事件监听器未移除
class Component {
    constructor() {
        this.handleResize = () => { /* ... */ };
        window.addEventListener('resize', this.handleResize);
    }
    // 忘记 removeEventListener!
}

// 修复: 使用 WeakRef (ES2021)
class ComponentFixed {
    constructor() {
        const ref = new WeakRef(this);
        const handler = () => {
            const self = ref.deref();
            if (self) self.update();
        };
        window.addEventListener('resize', handler);

        this.cleanup = () => {
            window.removeEventListener('resize', handler);
        };
    }
}

// 3. Map/Set 泄漏
const cache = new Map();  // 永远增长的缓存
// 修复: 使用 WeakMap 或 LRU
```

```typescript
// 4. LRU 缓存实现（防止无限增长）
class LRUCache<K, V> {
  private cache = new Map<K, V>();

  constructor(private maxSize: number) {}

  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      // 访问后移至末尾（最新）
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) this.cache.delete(key);
    else if (this.cache.size >= this.maxSize) {
      // 淘汰最久未使用
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }
}

// 使用示例
const cache = new LRUCache<string, any>(100);
cache.set('user:42', { name: 'Alice' });
console.log(cache.get('user:42')); // { name: 'Alice' }
```

---

## 5. 框架性能对比

### 5.1 前端框架运行时性能

```
框架性能对比 (TodoMVC基准):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

指标: 创建1000个todo项的时间 (越低越好)

框架              创建时间    内存占用    包大小
─────────────────────────────────────────────────
Vanilla JS        ~15ms       ~2MB        0KB
Lit               ~25ms       ~3MB        ~6KB
Preact            ~35ms       ~4MB        ~10KB
Vue 3             ~40ms       ~5MB        ~35KB
React 18          ~55ms       ~6MB        ~45KB
Angular           ~80ms       ~10MB       ~150KB

指标: 更新单个todo项的时间 (越低越好)

框架              更新时间    触发重渲染
─────────────────────────────────────────────────
Solid.js          ~0.5ms      精确更新
Svelte            ~0.8ms      编译时优化
Vue 3 (Proxy)     ~1.2ms      组件级
React (useMemo)   ~2ms        虚拟DOM diff
Angular           ~3ms        Zone.js检测
```

### 5.2 构建工具性能

```
构建工具对比 (大型项目):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

工具            冷启动    热更新(HMR)   生产构建    配置复杂度
─────────────────────────────────────────────────────────────
Vite            200ms     50ms          8s          低
ESBuild         100ms     不支持        5s          中
SWC             150ms     支持          6s          中
Turbopack       300ms     30ms          7s          低
Webpack         5000ms    500ms         25s         高
Rollup          3000ms    慢            15s         中

TypeScript编译器选择:
• 开发: esbuild/swc (快10-20倍)
• 生产: tsc (完整类型检查) + esbuild (代码转换)
```

---

## 6. 网络性能优化

### 6.1 加载策略对比

```javascript
// 不同加载策略的性能影响

// 1. 代码分割对比
// 策略A: 单个大bundle (1MB)
// 首屏: 需要下载1MB
// FCP: ~3s (4G网络)

// 策略B: 路由级分割
// 首屏: 200KB (基础 + 当前路由)
// 其他路由: 按需加载
// FCP: ~800ms

// 2. 预加载策略
// 预加载关键路由
const LazyRoute = lazy(() => import(/* webpackPrefetch: true */ './Route'));
// 空闲时自动预加载

// 3. 资源优先级
<link rel="preload" href="critical.js" as="script">      // 高优先级
<link rel="prefetch" href="next-route.js" as="script">  // 低优先级(空闲)
<link rel="modulepreload" href="module.js">              // ES模块预加载
```

### 6.2 包大小优化

```javascript
// Bundle大小分析

// 优化前
import lodash from 'lodash';  // 70KB
import moment from 'moment';  // 290KB

// 优化后
import debounce from 'lodash/debounce';  // 2KB
import { format } from 'date-fns';       // 5KB

// Tree Shaking 效果
import { Button } from 'antd';  // 如果antd是ESM，只打包Button

// 动态导入代码分割
const HeavyChart = lazy(() => import('./HeavyChart'));
// HeavyChart代码在需要时才加载
```

---

## 7. 优化检查清单

### 开发阶段

- [ ] 使用严格TypeScript配置提前捕获错误
- [ ] 使用适当的数据结构 (Map/Set vs Array/Object)
- [ ] 避免闭包捕获大对象
- [ ] 使用对象池减少GC
- [ ] 延迟加载非关键代码

### 构建阶段

- [ ] 启用Tree Shaking
- [ ] 代码分割 (路由/组件级)
- [ ] 压缩和混淆
- [ ] 使用SWC/esbuild加速构建
- [ ] 分析Bundle大小

### 运行时

- [ ] 监控内存使用
- [ ] 使用Web Workers处理CPU密集型任务
- [ ] 实现并发控制避免资源耗尽
- [ ] 使用Transferable减少数据拷贝
- [ ] 定期分析性能瓶颈

---

## 参考资源

- [V8 Blog: Trash talk](https://v8.dev/blog/trash-talk) — V8 垃圾回收器深度解析
- [V8 Blog: Elements kinds in V8](https://v8.dev/blog/elements-kinds) — 数组内部类型优化
- [V8 Blog: Orinoco](https://v8.dev/blog/orinoco) — V8 并行垃圾回收
- [JavaScript Engine Fundamentals: Optimizing prototypes](https://mathiasbynens.be/notes/prototypes) — 隐藏类与原型优化
- [MDN: Performance API](https://developer.mozilla.org/en-US/docs/Web/API/Performance)
- [web.dev: Optimize JavaScript Execution](https://web.dev/articles/optimize-javascript-execution)
- [web.dev: Reduce JavaScript payloads with tree shaking](https://web.dev/articles/reduce-javascript-payloads-with-tree-shaking)
- [TypeScript Compiler Performance](https://github.com/microsoft/TypeScript/wiki/Performance) — 官方性能调优指南
- [TC39: WeakRefs](https://github.com/tc39/proposal-weakrefs) — WeakRef 与 FinalizationRegistry 提案
- [Node.js Worker threads](https://nodejs.org/api/worker_threads.html) — 多线程编程指南
- [Chrome DevTools: Memory profiling](https://developer.chrome.com/docs/devtools/memory-problems/)
- [Webpack Bundle Analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer)
- [esbuild: Performance](https://esbuild.github.io/faq/#why-is-esbuild-fast) — 为什么 esbuild 这么快
- [SWC: Rust-based platform for the Web](https://swc.rs/)
- [HTTP Archive: JavaScript bytes](https://httparchive.org/reports/state-of-javascript) — Web 年度 JS 统计

*本文档提供了基于基准测试的性能数据对比和实用优化建议。*
