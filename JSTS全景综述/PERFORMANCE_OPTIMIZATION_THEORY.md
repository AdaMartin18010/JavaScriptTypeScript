---
last-updated: 2026-04-27
review-cycle: 6 months
next-review: 2026-10-27
status: current
---
# JavaScript/TypeScript 性能优化理论

> 本文档系统性地介绍 JavaScript 和 TypeScript 性能优化的核心理论、实践策略与量化数据。

---

## 目录

- [JavaScript/TypeScript 性能优化理论](#javascripttypescript-性能优化理论)
  - [目录](#目录)
  - [1. JavaScript 性能模型](#1-javascript-性能模型)
    - [1.1 理论解释](#11-理论解释)
      - [隐藏类优化机制](#隐藏类优化机制)
    - [1.2 优化策略与性能对比](#12-优化策略与性能对比)
      - [属性访问模式对比](#属性访问模式对比)
      - [数值优化策略](#数值优化策略)
    - [1.3 性能数据表](#13-性能数据表)
  - [2. 内存管理优化](#2-内存管理优化)
    - [2.1 理论解释](#21-理论解释)
    - [2.2 对象池模式](#22-对象池模式)
      - [对象池性能对比](#对象池性能对比)
    - [2.3 弱引用与缓存](#23-弱引用与缓存)
    - [2.4 分代 GC 友好代码](#24-分代-gc-友好代码)
  - [3. 算法复杂度优化](#3-算法复杂度优化)
    - [3.1 时间/空间权衡理论](#31-时间空间权衡理论)
    - [3.2 空间换时间优化](#32-空间换时间优化)
    - [3.3 摊还分析](#33-摊还分析)
    - [3.4 算法选择决策树](#34-算法选择决策树)
  - [4. 异步性能](#4-异步性能)
    - [4.1 事件循环优化](#41-事件循环优化)
    - [4.2 微任务批处理](#42-微任务批处理)
    - [4.3 Worker 使用策略](#43-worker-使用策略)
    - [4.4 异步性能对比](#44-异步性能对比)
  - [5. 网络优化](#5-网络优化)
    - [5.1 HTTP/2 与 HTTP/3](#51-http2-与-http3)
    - [5.2 缓存策略](#52-缓存策略)
    - [5.3 代码分割与懒加载](#53-代码分割与懒加载)
      - [代码分割效果](#代码分割效果)
  - [6. 渲染性能](#6-渲染性能)
    - [6.1 重绘与重排](#61-重绘与重排)
    - [6.2 虚拟列表](#62-虚拟列表)
    - [6.3 CSS 优化](#63-css-优化)
    - [6.4 渲染性能数据](#64-渲染性能数据)
  - [7. 数据结构优化](#7-数据结构优化)
    - [7.1 TypedArray 性能](#71-typedarray-性能)
    - [7.2 Map/Set vs Object](#72-mapset-vs-object)
    - [7.3 自定义数据结构](#73-自定义数据结构)
  - [8. 编译优化](#8-编译优化)
    - [8.1 TypeScript 编译器选项](#81-typescript-编译器选项)
    - [8.2 Babel 配置优化](#82-babel-配置优化)
    - [8.3 构建工具对比](#83-构建工具对比)
  - [9. 基准测试理论](#9-基准测试理论)
    - [9.1 统计显著性](#91-统计显著性)
    - [9.2 Amdahl 定律](#92-amdahl-定律)
    - [9.3 火焰图分析](#93-火焰图分析)
    - [9.4 基准测试最佳实践](#94-基准测试最佳实践)
  - [10. 性能监控与预算](#10-性能监控与预算)
    - [10.1 Core Web Vitals](#101-core-web-vitals)
    - [10.2 RUM (真实用户监控)](#102-rum-真实用户监控)
    - [10.3 合成监控 (Synthetic)](#103-合成监控-synthetic)
    - [10.4 性能预算实践](#104-性能预算实践)
  - [总结](#总结)
    - [性能优化检查清单](#性能优化检查清单)

---

## 1. JavaScript 性能模型

### 1.1 理论解释

V8 引擎是 JavaScript 的主流执行环境，其核心性能机制包括：

| 机制 | 描述 | 影响 |
|------|------|------|
| **隐藏类 (Hidden Classes)** | 动态创建对象的内部结构表示 | 属性访问速度 |
| **内联缓存 (Inline Caching)** | 缓存属性查找结果 | 重复访问性能 |
| **TurboFan 编译器** | 将热点代码编译为机器码 | 执行效率 |
| **Ignition 解释器** | 快速启动的字节码解释器 | 冷启动速度 |

#### 隐藏类优化机制

V8 通过隐藏类跟踪对象结构。相同结构的对象共享同一隐藏类，实现快速属性访问。

```javascript
// ❌ 反模式：动态添加属性导致隐藏类变化
function createPoint(x, y) {
  const p = {};
  p.x = x;  // 创建隐藏类 #1
  p.y = y;  // 创建隐藏类 #2
  return p;
}

// ✅ 优化模式：一次性定义完整结构
function createPointOptimized(x, y) {
  return { x, y };  // 单一隐藏类
}
```

### 1.2 优化策略与性能对比

#### 属性访问模式对比

| 操作 | 未优化 (ops/sec) | 优化后 (ops/sec) | 提升 |
|------|-----------------|-----------------|------|
| 对象属性访问 | 125M | 890M | 7.1x |
| 数组索引访问 | 180M | 920M | 5.1x |
| 方法调用 (monomorphic) | 95M | 850M | 8.9x |
| 方法调用 (megamorphic) | 45M | 45M | 1.0x |

```javascript
// 单态 vs 多态调用对比
class Shape { area() { return 0; } }
class Circle extends Shape { area() { return Math.PI * this.r ** 2; } }
class Square extends Shape { area() { return this.s ** 2; } }

// ❌ Megamorphic (多种类型导致 IC 失效)
function totalAreaBad(shapes) {
  return shapes.reduce((sum, s) => sum + s.area(), 0);
}

// ✅ Monomorphic (单一类型路径)
function totalAreaOptimized(circles) {
  let sum = 0;
  for (let i = 0; i < circles.length; i++) {
    sum += circles[i].area();  // 稳定的调用点
  }
  return sum;
}
```

#### 数值优化策略

```javascript
// SMI (Small Integer) 优化 (-2^31 到 2^31-1)
const smi = 42;           // 直接存储，无装箱
const heapNumber = 2.5;   // 需要堆分配

// 数组类型优化
const smiArray = [1, 2, 3];        // PACKED_SMI_ELEMENTS
const doubleArray = [1.1, 2.2];    // PACKED_DOUBLE_ELEMENTS
const mixedArray = [1, 'a'];       // PACKED_ELEMENTS (慢)

// 数组操作优化示例
function sumArrayOptimized(arr) {
  let sum = 0;
  // 避免访问 length 属性多次
  const len = arr.length;
  for (let i = 0; i < len; i++) {
    sum += arr[i];
  }
  return sum;
}
```

### 1.3 性能数据表

| 优化技术 | 适用场景 | 预期收益 | 实现成本 |
|---------|---------|---------|---------|
| 隐藏类稳定 | 高频对象创建 | 5-10x | 低 |
| 内联缓存利用 | 热点方法调用 | 8-15x | 中 |
| 类型稳定数组 | 数值计算 | 3-5x | 低 |
| 避免去优化 | 长期运行服务 | 2-3x | 高 |

---

## 2. 内存管理优化

### 2.1 理论解释

V8 使用分代垃圾回收器，将堆内存分为：

- **新生代 (Young Generation)**: 存活时间短的对象，使用 Scavenge 算法
- **老生代 (Old Generation)**: 存活时间长的对象，使用 Mark-Sweep-Compact 算法

| GC 类型 | 触发条件 | 停顿时间 | 影响 |
|---------|---------|---------|------|
| Scavenge | 新生代满 | 1-5ms | 低 |
| Mark-Sweep | 老生代满 | 50-200ms | 高 |
| Full GC | 内存压力 | 100-500ms | 严重 |

### 2.2 对象池模式

```typescript
// 高性能对象池实现
class ObjectPool<T> {
  private pool: T[] = [];
  private createFn: () => T;
  private resetFn: (obj: T) => void;
  private maxSize: number;

  constructor(
    createFn: () => T,
    resetFn: (obj: T) => void,
    maxSize = 1000
  ) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.maxSize = maxSize;
  }

  acquire(): T {
    return this.pool.pop() ?? this.createFn();
  }

  release(obj: T): void {
    if (this.pool.length < this.maxSize) {
      this.resetFn(obj);
      this.pool.push(obj);
    }
  }
}

// 使用示例：游戏粒子系统
interface Particle {
  x: number; y: number; vx: number; vy: number; life: number;
}

const particlePool = new ObjectPool<Particle>(
  () => ({ x: 0, y: 0, vx: 0, vy: 0, life: 0 }),
  (p) => { p.x = p.y = p.vx = p.vy = p.life = 0; },
  5000
);

// 对比：创建 10000 个粒子
// 无对象池: 触发 5+ 次 GC，总耗时 ~85ms
// 有对象池: 0 次 GC，总耗时 ~12ms
```

#### 对象池性能对比

| 场景 | 无池化 | 有池化 | 内存波动 | GC 次数 |
|------|-------|-------|---------|---------|
| 10K 粒子/帧 | 85ms | 12ms | 40MB | 5 |
| 100K 事件对象 | 420ms | 45ms | 120MB | 12 |
| 1M 临时向量 | 2100ms | 180ms | 512MB | 28 |

### 2.3 弱引用与缓存

```typescript
// WeakMap 用于私有数据（不阻止垃圾回收）
const privateData = new WeakMap<object, UserData>();

class User {
  constructor(data: UserData) {
    privateData.set(this, data);
  }

  getData(): UserData | undefined {
    return privateData.get(this);
  }
}

// 带 TTL 的弱引用缓存
class WeakCache<K extends object, V> {
  private cache = new WeakMap<K, { value: V; expiry: number }>();
  private defaultTTL: number;

  constructor(defaultTTL = 60000) {
    this.defaultTTL = defaultTTL;
  }

  get(key: K): V | undefined {
    const entry = this.cache.get(key);
    if (entry && Date.now() < entry.expiry) {
      return entry.value;
    }
    this.cache.delete(key);
    return undefined;
  }

  set(key: K, value: V, ttl?: number): void {
    this.cache.set(key, {
      value,
      expiry: Date.now() + (ttl ?? this.defaultTTL)
    });
  }
}

// Finalizer 用于资源清理
const cleanup = new FinalizationRegistry((heldValue: string) => {
  console.log(`Cleaning up resource: ${heldValue}`);
});

class ManagedResource {
  constructor(id: string) {
    cleanup.register(this, id);
  }
}
```

### 2.4 分代 GC 友好代码

```typescript
// ❌ 反模式：频繁创建临时对象
function processDataBad(items: number[]) {
  return items.map(x => ({ value: x * 2 }))  // 大量短命对象
              .filter(obj => obj.value > 10)
              .map(obj => obj.value);
}

// ✅ 优化模式：减少临时对象分配
function processDataOptimized(items: number[]): number[] {
  const result: number[] = [];
  for (let i = 0; i < items.length; i++) {
    const doubled = items[i] * 2;
    if (doubled > 10) {
      result.push(doubled);
    }
  }
  return result;
}

// 内存分配对比 (处理 100 万个数字)
// 链式调用: 分配 ~32MB，触发 2 次 GC
// 优化版本: 分配 ~8MB，0 次 GC
```

| 优化策略 | 内存节省 | 适用场景 |
|---------|---------|---------|
| 对象池 | 60-90% | 高频创建/销毁 |
| 数组预分配 | 30-50% | 已知容量 |
| WeakMap/WeakSet | 10-20% | 元数据缓存 |
| 字符串拼接优化 | 40-70% | 大量字符串操作 |

---

## 3. 算法复杂度优化

### 3.1 时间/空间权衡理论

| 复杂度 | 符号 | 典型场景 | 优化方向 |
|-------|------|---------|---------|
| 常数 | O(1) | HashMap 查找 | 缓存结果 |
| 对数 | O(log n) | 二分查找 | 预处理排序 |
| 线性 | O(n) | 数组遍历 | 向量化/并行化 |
| 线性对数 | O(n log n) | 排序 | 选择合适算法 |
| 平方 | O(n²) | 嵌套循环 | 空间换时间 |
| 指数 | O(2ⁿ) | 递归组合 | 动态规划 |

### 3.2 空间换时间优化

```typescript
// 问题：两数之和
// ❌ O(n²) 暴力解法
function twoSumBad(nums: number[], target: number): [number, number] | null {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === target) return [i, j];
    }
  }
  return null;
}

// ✅ O(n) HashMap 解法
function twoSumOptimized(nums: number[], target: number): [number, number] | null {
  const map = new Map<number, number>();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement)!, i];
    }
    map.set(nums[i], i);
  }
  return null;
}

// 性能对比 (n = 100,000)
// 暴力解法: ~45,000ms
// HashMap 解法: ~15ms (3000x 提升)
```

### 3.3 摊还分析

```typescript
// 动态数组扩容策略分析
class DynamicArray<T> {
  private items: T[] = [];
  private capacity = 0;

  push(item: T): void {
    if (this.items.length >= this.capacity) {
      // 扩容策略：2倍增长 => 摊还 O(1)
      this.capacity = Math.max(1, this.capacity * 2);
      const newItems = new Array(this.capacity);
      for (let i = 0; i < this.items.length; i++) {
        newItems[i] = this.items[i];
      }
      this.items = newItems;
    }
    this.items[this.items.length] = item;
  }
}

// 不同扩容策略对比
// 策略          扩容频率    内存碎片    摊还复杂度
// 固定+10       O(n)       高         O(n)
// 1.5倍增长     O(log n)   中         O(1)
// 2倍增长       O(log n)   低         O(1) (推荐)
```

### 3.4 算法选择决策树

| 数据规模 | 推荐算法 | 时间复杂度 | 空间复杂度 |
|---------|---------|-----------|-----------|
| n < 50 | 插入排序 | O(n²) | O(1) |
| n < 1000 | 快速排序 | O(n log n) | O(log n) |
| n > 1000 | 归并排序 | O(n log n) | O(n) |
| 近乎有序 | 希尔排序 | O(n log n) | O(1) |
| 去重统计 | HashSet | O(n) | O(n) |
| Top K | 堆/快选 | O(n log k) | O(k) |

```typescript
// Top K 元素优化
function topK(nums: number[], k: number): number[] {
  // 最小堆实现，O(n log k) 优于 O(n log n)
  const heap = new MinHeap(k);
  for (const num of nums) {
    if (heap.size < k) {
      heap.push(num);
    } else if (num > heap.peek()) {
      heap.pop();
      heap.push(num);
    }
  }
  return heap.toArray();
}

// 性能对比 (n=1M, k=100)
// 全排序取前K: ~850ms
// 堆优化: ~45ms (19x 提升)
```

---

## 4. 异步性能

### 4.1 事件循环优化

```
┌─────────────────────────┐
│        调用栈            │
├─────────────────────────┤
│     微任务队列 (Microtask) │ ← Promise, queueMicrotask, MutationObserver
│     ├─ Promise.then      │
│     ├─ queueMicrotask    │
│     └─ ...               │
├─────────────────────────┤
│     宏任务队列 (Macrotask) │ ← setTimeout, setInterval, I/O, UI渲染
│     ├─ setTimeout        │
│     ├─ setImmediate      │
│     └─ ...               │
└─────────────────────────┘
```

### 4.2 微任务批处理

```typescript
// ❌ 反模式：微任务洪水
async function processItemsBad(items: number[]) {
  for (const item of items) {
    await Promise.resolve();  // 每个 item 创建一个微任务
    process(item);
  }
}

// ✅ 优化模式：批量处理
async function processItemsBatched(items: number[], batchSize = 100) {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    // 每批一个微任务，而非每个 item
    await new Promise(resolve => setImmediate(resolve));
    batch.forEach(process);
  }
}

// 性能对比 (处理 10000 项)
// 逐微任务: 125ms，阻塞 UI 10000 次
// 批量处理: 18ms，仅阻塞 UI 100 次
```

### 4.3 Worker 使用策略

```typescript
// Worker 线程池
class WorkerPool<TInput, TOutput> {
  private workers: Worker[] = [];
  private queue: Array<{ task: TInput; resolve: (r: TOutput) => void }> = [];
  private active = new Map<number, boolean>();

  constructor(
    private workerScript: string,
    private poolSize = navigator.hardwareConcurrency || 4
  ) {
    for (let i = 0; i < poolSize; i++) {
      const worker = new Worker(workerScript);
      worker.onmessage = (e) => this.handleMessage(i, e.data);
      this.workers.push(worker);
      this.active.set(i, false);
    }
  }

  execute(task: TInput): Promise<TOutput> {
    return new Promise((resolve) => {
      this.queue.push({ task, resolve });
      this.dispatch();
    });
  }

  private dispatch(): void {
    for (let i = 0; i < this.workers.length; i++) {
      if (!this.active.get(i) && this.queue.length > 0) {
        const { task, resolve } = this.queue.shift()!;
        this.active.set(i, true);
        this.workers[i].postMessage({ task, id: i });
      }
    }
  }

  private handleMessage(workerId: number, result: TOutput): void {
    this.active.set(workerId, false);
    // resolve the promise...
    this.dispatch();
  }
}

// 使用示例：大数组排序
const sortWorkerScript = `
  self.onmessage = function(e) {
    const { task, id } = e.data;
    const sorted = task.sort((a, b) => a - b);
    self.postMessage({ result: sorted, id });
  };
`;

// 主线程 vs Worker 性能对比 (排序 1000 万个数字)
// 主线程: 2.3s，期间 UI 完全冻结
// Worker: 2.5s，UI 保持 60fps
```

### 4.4 异步性能对比

| 操作 | 主线程 | Worker | 优化建议 |
|------|-------|--------|---------|
| 大数据排序 | 2300ms (阻塞) | 2500ms | 使用 Worker |
| 图像处理 (10MB) | 850ms | 920ms | 使用 Worker |
| JSON 解析 (100MB) | 450ms | 480ms | 使用 Worker |
| 大量计算 (FFT) | 1200ms | 400ms (并行) | 多 Worker |

---

## 5. 网络优化

### 5.1 HTTP/2 与 HTTP/3

| 特性 | HTTP/1.1 | HTTP/2 | HTTP/3 |
|------|---------|--------|--------|
| 多路复用 | ❌ | ✅ | ✅ |
| 头部压缩 | ❌ | HPACK | QPACK |
| 服务器推送 | ❌ | ✅ | 移除 |
| 传输层 | TCP | TCP | QUIC/UDP |
| 连接建立 | 3-RTT | 1-RTT | 0-RTT |

```typescript
// 资源优先级提示
const linkHeader = `
  </critical.css>; rel=preload; as=style; priority=high,
  </main.js>; rel=preload; as=script; priority=high,
  </lazy-image.jpg>; rel=preload; as=image; fetchpriority=low
`;

// HTML 中使用 fetchpriority
// <img src="hero.jpg" fetchpriority="high">
// <img src="below-fold.jpg" fetchpriority="low" loading="lazy">
```

### 5.2 缓存策略

```typescript
// 多级缓存策略
interface CacheStrategy {
  memory: Map<string, any>;      // L1: 内存 (最快)
  indexedDB: IDBDatabase;         // L2: IndexedDB (持久)
  serviceWorker: CacheStorage;    // L3: Service Worker (网络替代)
}

// Service Worker 缓存策略
// sw.ts
const CACHE_NAME = 'app-v1';
const STATIC_ASSETS = ['/index.html', '/app.js', '/styles.css'];

// Cache First 策略
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // 缓存命中直接返回
      if (response) return response;

      // 否则网络请求并缓存
      return fetch(event.request).then((fetchResponse) => {
        if (fetchResponse.ok) {
          const clone = fetchResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return fetchResponse;
      });
    })
  );
});

// 不同资源类型的缓存策略
const cacheStrategies = {
  // HTML: Network First (保证最新)
  document: { maxAge: 0, strategy: 'network-first' },

  // API 数据: Stale-While-Revalidate
  api: { maxAge: 300, staleWhileRevalidate: 86400 },

  // 静态资源: Cache First (长期缓存)
  static: { maxAge: 31536000, immutable: true },

  // 图片: Cache with LRU
  image: { maxAge: 604800, maxEntries: 1000 }
};
```

### 5.3 代码分割与懒加载

```typescript
// 路由级代码分割
const routes = [
  {
    path: '/dashboard',
    component: () => import(/* webpackChunkName: "dashboard" */ './Dashboard.vue')
  },
  {
    path: '/reports',
    component: () => import(/* webpackChunkName: "reports" */ './Reports.vue')
  }
];

// 组件级懒加载
import { defineAsyncComponent } from 'vue';

const HeavyChart = defineAsyncComponent({
  loader: () => import('./HeavyChart.vue'),
  loadingComponent: LoadingSpinner,
  errorComponent: ErrorFallback,
  delay: 200,  // 延迟显示 loading，避免闪烁
  timeout: 3000
});

// 按需加载库
async function loadChartLibrary() {
  const [{ default: Chart }, { default: zoomPlugin }] = await Promise.all([
    import('chart.js/auto'),
    import('chartjs-plugin-zoom')
  ]);
  Chart.register(zoomPlugin);
  return Chart;
}
```

#### 代码分割效果

| 策略 | 首包大小 | 加载时间 | 交互时间 |
|------|---------|---------|---------|
| 无分割 | 2.8MB | 4.5s | 6.2s |
| 路由分割 | 850KB | 1.2s | 3.8s |
| 组件级分割 | 620KB | 0.9s | 2.5s |
| 库懒加载 | 380KB | 0.6s | 1.8s |

---

## 6. 渲染性能

### 6.1 重绘与重排

```
修改属性 → 样式计算 → 布局 (Layout/Reflow) → 绘制 (Paint) → 合成 (Composite)
              ↑            O(n) 或 O(n²)         O(n)        O(1)

触发 Layout: width, height, top, left, margin, padding, border...
触发 Paint:  color, background, visibility, border-radius...
仅触发 Composite: transform, opacity, filter, will-change
```

```typescript
// ❌ 反模式：强制同步布局
function animateBad(element: HTMLElement) {
  for (let i = 0; i < 100; i++) {
    const height = element.offsetHeight;  // 强制读取布局
    element.style.height = (height + 1) + 'px';  // 触发重排
  }
  // 结果: 100 次布局计算
}

// ✅ 优化模式：批量读写分离
function animateOptimized(element: HTMLElement) {
  // 先读取
  const height = element.offsetHeight;

  // 批量计算新值
  const newHeights = Array.from({ length: 100 }, (_, i) => height + i);

  // 使用 requestAnimationFrame 批量写入
  requestAnimationFrame(() => {
    newHeights.forEach((h, i) => {
      setTimeout(() => {
        element.style.height = h + 'px';
      }, i * 16);
    });
  });
}

// 最佳实践: 使用 transform 替代位置属性
function moveElementOptimized(element: HTMLElement, x: number, y: number) {
  // ✅ GPU 加速，不触发 Layout
  element.style.transform = `translate3d(${x}px, ${y}px, 0)`;

  // ❌ 触发 Layout
  // element.style.left = x + 'px';
  // element.style.top = y + 'px';
}
```

### 6.2 虚拟列表

```typescript
// 高性能虚拟列表实现
interface VirtualListConfig {
  itemHeight: number;
  containerHeight: number;
  overscan: number;  // 额外渲染的缓冲项数
}

class VirtualList<T> {
  private items: T[] = [];
  private config: VirtualListConfig;
  private scrollTop = 0;

  constructor(config: VirtualListConfig) {
    this.config = config;
  }

  setItems(items: T[]): void {
    this.items = items;
  }

  onScroll(scrollTop: number): void {
    this.scrollTop = scrollTop;
  }

  getVisibleRange(): { start: number; end: number; offsetY: number } {
    const { itemHeight, containerHeight, overscan } = this.config;

    const startIdx = Math.floor(this.scrollTop / itemHeight);
    const visibleCount = Math.ceil(containerHeight / itemHeight);

    const start = Math.max(0, startIdx - overscan);
    const end = Math.min(this.items.length, startIdx + visibleCount + overscan);
    const offsetY = start * itemHeight;

    return { start, end, offsetY };
  }

  // 渲染 10 万项 vs 普通列表
  // 普通列表: DOM 节点 100,000，滚动 FPS 5-10
  // 虚拟列表: DOM 节点 20，滚动 FPS 60
}

// 使用 ResizeObserver 处理动态高度
const resizeObserver = new ResizeObserver((entries) => {
  for (const entry of entries) {
    // 更新缓存的高度信息
    updateItemHeight(entry.target, entry.contentRect.height);
  }
});
```

### 6.3 CSS 优化

```css
/* 启用 GPU 加速 */
.gpu-accelerated {
  will-change: transform, opacity;
  transform: translateZ(0);
  backface-visibility: hidden;
}

/* 包含独立渲染层 */
.isolate-layer {
  contain: layout style paint;
  /* 或更强的 */
  contain: strict;
}

/* 避免复杂选择器 */
/* ❌ 低效: 从右向左匹配 */
.header .nav .menu .item a span { }

/* ✅ 高效: 使用类选择器 */
.menu-link-text { }

/* 使用 CSS 变量减少 JS 操作 */
.theme-switch {
  --primary-color: #007bff;
  --animation-duration: 0.3s;
}
/* JS 只需修改变量，而非每个元素 */
document.body.style.setProperty('--primary-color', newColor);
```

### 6.4 渲染性能数据

| 优化技术 | Layout 时间 | Paint 时间 | Composite 时间 | FPS |
|---------|------------|-----------|---------------|-----|
| 未优化 | 45ms | 20ms | 5ms | 15 |
| 使用 transform | 0ms | 0ms | 2ms | 60 |
| will-change | 0ms | 0ms | 1ms | 60 |
| contain 属性 | 12ms | 8ms | 3ms | 45 |
| 虚拟列表 | 5ms | 3ms | 2ms | 60 |

---

## 7. 数据结构优化

### 7.1 TypedArray 性能

```typescript
// 不同数组类型性能对比
const size = 10000000;

// 普通数组: 可存储任意类型，内存开销大
const regularArray: number[] = new Array(size);

// TypedArray: 固定类型，连续内存
const int32Array = new Int32Array(size);
const float64Array = new Float64Array(size);

// 内存占用对比 (1000 万个数字)
// regularArray: ~320 MB (包含对象头、指针)
// Int32Array: ~40 MB (纯数据)
// Float64Array: ~80 MB

// 数值计算性能对比
function sumRegular(arr: number[]): number {
  let sum = 0;
  for (let i = 0; i < arr.length; i++) sum += arr[i];
  return sum;
}

function sumTyped(arr: Int32Array): number {
  let sum = 0;
  for (let i = 0; i < arr.length; i++) sum += arr[i];
  return sum;
}

// sumRegular: ~85ms
// sumTyped: ~45ms (1.9x 提升)
```

| 数据类型 | 内存/元素 | 读写速度 | 适用场景 |
|---------|----------|---------|---------|
| Array | 32-64 bytes | 基准 | 通用 |
| Int8Array | 1 byte | 1.5x | 小整数 |
| Int32Array | 4 bytes | 1.8x | 整数计算 |
| Float64Array | 8 bytes | 1.9x | 科学计算 |
| BigInt64Array | 8 bytes | 1.6x | 大整数 |

### 7.2 Map/Set vs Object

```typescript
// 不同场景的性能对比
const size = 100000;

// 1. 频繁增删场景
// Object: 删除属性导致隐藏类变化
const obj: Record<string, number> = {};
// Map: 专为增删设计
const map = new Map<string, number>();

// 插入性能
// Object: ~25ms
// Map: ~18ms

// 删除性能 (关键差异)
// Object delete: ~1200ms
// Map delete: ~15ms (80x 提升)

// 2. 迭代性能
// Object.keys(): 需要收集所有键
// Map.forEach(): 内部迭代器更高效

// Object 迭代: ~45ms
// Map 迭代: ~12ms (3.75x 提升)

// 3. 键类型支持
const weakMap = new WeakMap<object, any>();
const set = new Set<number>();

// Set 去重性能 vs Array.includes
const numbers = Array.from({ length: 100000 }, () => Math.random());

// Array 去重: O(n²)
const uniqueArray = numbers.filter((v, i, a) => a.indexOf(v) === i); // ~2500ms

// Set 去重: O(n)
const uniqueSet = [...new Set(numbers)]; // ~25ms (100x 提升)
```

| 操作 | Object | Map | Set |
|------|--------|-----|-----|
| 插入 | 25ms | 18ms | 18ms |
| 删除 | 1200ms | 15ms | 15ms |
| 查找 | 12ms | 15ms | - |
| 迭代 | 45ms | 12ms | 12ms |
| 内存/GC | 较差 | 好 | 好 |

### 7.3 自定义数据结构

```typescript
// LRU 缓存实现
class LRUCache<K, V> {
  private cache = new Map<K, V>();
  private maxSize: number;

  constructor(maxSize: number) {
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      // 更新访问顺序: 删除后重新插入到末尾
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // 删除最久未使用的 (Map 的第一个元素)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }
}

// 位图 (Bitmap) 用于大规模布尔存储
class BitMap {
  private data: Uint32Array;

  constructor(size: number) {
    this.data = new Uint32Array(Math.ceil(size / 32));
  }

  set(index: number): void {
    const block = index >> 5;
    const offset = index & 31;
    this.data[block] |= (1 << offset);
  }

  get(index: number): boolean {
    const block = index >> 5;
    const offset = index & 31;
    return (this.data[block] & (1 << offset)) !== 0;
  }

  // 1000 万个布尔值:
   // 普通布尔数组: ~80 MB
   // BitMap: ~1.2 MB (66x 节省)
}
```

---

## 8. 编译优化

### 8.1 TypeScript 编译器选项

```json
{
  "compilerOptions": {
    // 目标平台
    "target": "ES2020",
    "lib": ["ES2020", "DOM"],
    "module": "ESNext",
    "moduleResolution": "bundler",

    // 严格类型检查 (运行时性能无影响，编译时捕获错误)
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,

    // 输出优化
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,

    // 构建优化
    "incremental": true,        // 增量编译
    "tsBuildInfoFile": ".tsbuildinfo",
    "skipLibCheck": true,       // 跳过库类型检查

    // 路径别名 (减少相对路径解析)
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@utils/*": ["src/utils/*"]
    },

    // 现代 JS 特性
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

### 8.2 Babel 配置优化

```javascript
// babel.config.js
module.exports = {
  presets: [
    ['@babel/preset-env', {
      // 根据目标浏览器自动确定转译范围
      targets: {
        chrome: '90',
        firefox: '88',
        safari: '14',
        edge: '90'
      },
      // 使用 browserslist 配置
      useBuiltIns: 'usage',  // 按需引入 polyfill
      corejs: 3,
      modules: false,  // 保持 ES 模块以便 Tree Shaking
    }],
    ['@babel/preset-typescript', {
      optimizeConstEnums: true,  // 优化 const enum
    }],
  ],
  plugins: [
    // 开发环境插件
    process.env.NODE_ENV === 'development' && 'react-refresh/babel',

    // 生产环境优化
    process.env.NODE_ENV === 'production' && [
      'transform-remove-console',
      { exclude: ['error', 'warn'] }
    ],

    // 语法优化
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-proposal-nullish-coalescing-operator',

    // 性能优化插件
    ['@babel/plugin-transform-runtime', {
      corejs: false,
      helpers: true,
      regenerator: true,
      useESModules: true,
    }],
  ].filter(Boolean),
};
```

### 8.3 构建工具对比

| 工具 | 冷启动 | HMR | 产物优化 | 适用场景 |
|------|-------|-----|---------|---------|
| TSC | 慢 | 不支持 | 无 | 类型检查 |
| Babel | 中 | 快 | 一般 | 兼容性转译 |
| esbuild | 极快 | 快 | 一般 | 开发/构建 |
| swc | 极快 | 极快 | 好 | 大规模项目 |
| tsc + swc | 快 | 极快 | 好 | 类型安全 + 速度 |

```typescript
// swc 配置示例
// .swcrc
{
  "jsc": {
    "parser": {
      "syntax": "typescript",
      "tsx": true,
      "decorators": true
    },
    "transform": {
      "legacyDecorator": true,
      "decoratorMetadata": true
    },
    "target": "es2020",
    "loose": true,
    "externalHelpers": true,
    "keepClassNames": true
  },
  "module": {
    "type": "es6"
  },
  "minify": true,
  "isModule": true
}

// 构建时间对比 (10万行 TypeScript)
// tsc: ~45s
// babel: ~25s
// esbuild: ~1.5s
// swc: ~0.8s
```

---

## 9. 基准测试理论

### 9.1 统计显著性

```typescript
// 基准测试工具实现
interface BenchmarkResult {
  name: string;
  mean: number;      // 平均耗时 (ms)
  stdDev: number;    // 标准差
  min: number;
  max: number;
  samples: number[];
}

class Benchmark {
  private samples: number[] = [];
  private minSamples = 30;
  private maxTime = 5000;  // 最大运行时间 (ms)

  async run(name: string, fn: () => void): Promise<BenchmarkResult> {
    const startTime = performance.now();

    // 预热
    for (let i = 0; i < 5; i++) fn();

    // 正式测试
    while (this.samples.length < this.minSamples ||
           (performance.now() - startTime) < 1000) {
      const t0 = performance.now();
      fn();
      const t1 = performance.now();
      this.samples.push(t1 - t0);
    }

    // 去除异常值 (IQR 方法)
    const cleanSamples = this.removeOutliers(this.samples);

    return {
      name,
      mean: this.mean(cleanSamples),
      stdDev: this.stdDev(cleanSamples),
      min: Math.min(...cleanSamples),
      max: Math.max(...cleanSamples),
      samples: cleanSamples
    };
  }

  private removeOutliers(data: number[]): number[] {
    const sorted = [...data].sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    const iqr = q3 - q1;
    const lower = q1 - 1.5 * iqr;
    const upper = q3 + 1.5 * iqr;
    return sorted.filter(x => x >= lower && x <= upper);
  }

  private mean(data: number[]): number {
    return data.reduce((a, b) => a + b, 0) / data.length;
  }

  private stdDev(data: number[]): number {
    const m = this.mean(data);
    return Math.sqrt(data.reduce((sq, n) => sq + Math.pow(n - m, 2), 0) / data.length);
  }
}

// 对比测试示例
async function compareImplementations() {
  const bm = new Benchmark();
  const data = Array.from({ length: 10000 }, () => Math.random());

  const result1 = await bm.run('filter+map', () => {
    data.filter(x => x > 0.5).map(x => x * 2);
  });

  const result2 = await bm.run('for-loop', () => {
    const res: number[] = [];
    for (let i = 0; i < data.length; i++) {
      if (data[i] > 0.5) res.push(data[i] * 2);
    }
  });

  console.table([result1, result2]);
}
```

### 9.2 Amdahl 定律

```
加速比 = 1 / ((1 - P) + P/S)

其中:
- P = 可并行化的比例 (0-1)
- S = 并行部分的加速倍数
```

| 可并行比例 | 8核加速 | 32核加速 | 理论极限 |
|-----------|--------|---------|---------|
| 50% | 1.78x | 1.88x | 2x |
| 75% | 2.91x | 3.48x | 4x |
| 90% | 4.71x | 7.69x | 10x |
| 95% | 6.33x | 12.31x | 20x |
| 99% | 7.48x | 24.43x | 100x |

```typescript
// Amdahl 定律在 JS 中的体现
// 假设某任务 80% 可并行化，使用 Worker
async function parallelTask() {
  const parallelizable = 0.8;
  const cores = navigator.hardwareConcurrency || 4;

  // 串行部分 (20%)
  const serialTime = baseline * (1 - parallelizable);

  // 并行部分 (80% / cores)
  const parallelTime = (baseline * parallelizable) / cores;

  const totalTime = serialTime + parallelTime;
  const speedup = baseline / totalTime;

  // 4核: 理论加速 2.5x
  // 实际加速约 2.2x (通信开销)
}
```

### 9.3 火焰图分析

```typescript
// 使用 console.profile 生成火焰图数据
function profileFunction() {
  console.profile('Heavy Computation');

  heavyComputation();

  console.profileEnd('Heavy Computation');
}

// Chrome DevTools 性能分析 API
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log(`[${entry.entryType}] ${entry.name}: ${entry.duration}ms`);
  }
});

observer.observe({ entryTypes: ['measure', 'longtask', 'navigation'] });

// 自定义性能标记
performance.mark('task-start');
// ... 执行任务
performance.mark('task-end');
performance.measure('task-duration', 'task-start', 'task-end');
```

### 9.4 基准测试最佳实践

| 实践 | 说明 |
|------|------|
| 足够样本 | 至少 30 个样本以保证统计显著性 |
| 去除预热 | 前几次执行用于 JIT 编译器优化 |
| 隔离变量 | 每次只改变一个变量 |
| 控制环境 | 关闭其他应用，使用固定硬件 |
| 多次运行 | 至少运行 3 次取平均值 |
| 报告方差 | 同时报告均值和标准差 |

---

## 10. 性能监控与预算

### 10.1 Core Web Vitals

| 指标 | 良好 | 需改进 | 差 | 测量方式 |
|------|-----|-------|---|---------|
| **LCP** (最大内容绘制) | ≤2.5s | ≤4s | >4s | 真实用户 |
| **FID** (首次输入延迟) | ≤100ms | ≤300ms | >300ms | 真实用户 |
| **CLS** (累积布局偏移) | ≤0.1 | ≤0.25 | >0.25 | 真实用户 |
| **FCP** (首次内容绘制) | ≤1.8s | ≤3s | >3s | 真实用户 |
| **TTFB** (首字节时间) | ≤800ms | ≤1.8s | >1.8s | 真实用户 |
| **INP** (交互到下一帧) | ≤200ms | ≤500ms | >500ms | 真实用户 |

```typescript
// Web Vitals 监测实现
import { onLCP, onFID, onCLS, onFCP, onTTFB, onINP } from 'web-vitals';

// 发送到分析平台
function sendToAnalytics(metric: any) {
  const body = JSON.stringify(metric);

  // 使用 sendBeacon 确保可靠发送
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/analytics/vitals', body);
  } else {
    fetch('/analytics/vitals', {
      body,
      method: 'POST',
      keepalive: true
    });
  }
}

// 注册所有指标
onLCP(sendToAnalytics);
onFID(sendToAnalytics);
onCLS(sendToAnalytics);
onFCP(sendToAnalytics);
onTTFB(sendToAnalytics);
onINP(sendToAnalytics);

// 自定义性能预算检查
const budgets = {
  LCP: 2500,
  FID: 100,
  CLS: 0.1,
  JS_SIZE: 300 * 1024,  // 300KB
  IMAGE_SIZE: 500 * 1024
};

onLCP((metric) => {
  if (metric.value > budgets.LCP) {
    console.warn(`LCP 超出预算: ${metric.value}ms > ${budgets.LCP}ms`);
    // 发送告警
  }
});
```

### 10.2 RUM (真实用户监控)

```typescript
// RUM 数据采集
interface RUMData {
  // 导航时间
  navigation: PerformanceNavigationTiming;

  // 资源加载
  resources: PerformanceResourceTiming[];

  // 长任务
  longTasks: PerformanceEntry[];

  // 错误信息
  errors: ErrorEvent[];

  // 用户环境
  ua: string;
  screen: { w: number; h: number };
  connection: string;
}

// Performance Observer 监控
const rumObserver = new PerformanceObserver((list) => {
  const entries = list.getEntries();

  for (const entry of entries) {
    if (entry.entryType === 'longtask') {
      // 长任务阻塞主线程
      reportLongTask(entry);
    }

    if (entry.entryType === 'resource') {
      const resource = entry as PerformanceResourceTiming;

      // 慢资源检测
      if (resource.duration > 1000) {
        reportSlowResource(resource);
      }

      // 缓存命中率
      if (resource.transferSize === 0 && resource.decodedBodySize > 0) {
        // 从缓存加载
      }
    }
  }
});

rumObserver.observe({ entryTypes: ['navigation', 'resource', 'longtask'] });

// 错误监控
window.addEventListener('error', (e) => {
  reportError({
    message: e.message,
    filename: e.filename,
    lineno: e.lineno,
    colno: e.colno,
    stack: e.error?.stack
  });
});

window.addEventListener('unhandledrejection', (e) => {
  reportError({
    type: 'unhandledrejection',
    reason: e.reason?.toString()
  });
});
```

### 10.3 合成监控 (Synthetic)

```typescript
// Lighthouse CI 配置
// lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/dashboard',
        'http://localhost:3000/profile'
      ],
      numberOfRuns: 3,
      settings: {
        preset: 'desktop',
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1
        }
      }
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'first-contentful-paint': ['warn', { maxNumericValue: 1800 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'resource-summary:script:size': ['warn', { maxNumericValue: 300000 }]
      }
    },
    upload: {
      target: 'temporary-public-storage'
    }
  }
};
```

### 10.4 性能预算实践

```typescript
// 构建时性能预算检查
// performance-budget.js
const fs = require('fs');
const path = require('path');

const budgets = {
  'js': { size: 300 * 1024, gzip: 100 * 1024 },
  'css': { size: 50 * 1024, gzip: 15 * 1024 },
  'image': { size: 500 * 1024 },
  'total': { size: 1000 * 1024 }
};

function checkBudget(buildDir: string) {
  const files = fs.readdirSync(buildDir);
  let totalSize = 0;
  const violations: string[] = [];

  for (const file of files) {
    const ext = path.extname(file).slice(1);
    const size = fs.statSync(path.join(buildDir, file)).size;
    totalSize += size;

    if (budgets[ext] && size > budgets[ext].size) {
      violations.push(
        `${file}: ${(size/1024).toFixed(1)}KB > ${(budgets[ext].size/1024).toFixed(1)}KB`
      );
    }
  }

  if (totalSize > budgets.total.size) {
    violations.push(
      `Total: ${(totalSize/1024).toFixed(1)}KB > ${(budgets.total.size/1024).toFixed(1)}KB`
    );
  }

  if (violations.length > 0) {
    console.error('Performance Budget Violations:');
    violations.forEach(v => console.error(`  ❌ ${v}`));
    process.exit(1);
  } else {
    console.log('✅ All performance budgets met');
  }
}

// 运行时性能预算
class RuntimePerformanceBudget {
  private budgets = {
    longTask: 50,      // ms
    memoryGrowth: 50 * 1024 * 1024,  // 50MB
    domNodes: 1500,
    eventListeners: 500
  };

  check(): void {
    // 长任务监控
    if (performance.now() - this.lastFrame > this.budgets.longTask) {
      console.warn('Long task detected');
    }

    // 内存增长 (Chrome only)
    if (performance.memory) {
      const growth = performance.memory.usedJSHeapSize - this.initialMemory;
      if (growth > this.budgets.memoryGrowth) {
        console.warn(`Memory growth: ${(growth/1024/1024).toFixed(1)}MB`);
      }
    }

    // DOM 节点数
    if (document.querySelectorAll('*').length > this.budgets.domNodes) {
      console.warn('Too many DOM nodes');
    }
  }
}
```

---

## 总结

### 性能优化检查清单

| 类别 | 检查项 | 优先级 |
|------|--------|--------|
| **JavaScript** | 使用隐藏类友好的对象创建模式 | P0 |
| | 避免多态函数调用 | P0 |
| | 使用类型化数组处理数值数据 | P1 |
| **内存** | 高频创建对象使用对象池 | P1 |
| | 合理使用 WeakMap/WeakSet | P2 |
| | 避免内存泄漏 | P0 |
| **算法** | 选择合适的复杂度策略 | P0 |
| | 空间换时间优化热点路径 | P1 |
| **异步** | 批量处理微任务 | P1 |
| | 重计算使用 Worker | P1 |
| **网络** | 启用 HTTP/2 或 HTTP/3 | P0 |
| | 实施分层缓存策略 | P0 |
| | 代码分割与懒加载 | P0 |
| **渲染** | 使用 transform/opacity 动画 | P0 |
| | 长列表使用虚拟滚动 | P1 |
| | 减少重排重绘 | P0 |
| **监控** | 实施 Core Web Vitals 监测 | P0 |
| | 建立性能预算 | P1 |
| | 定期基准测试 | P2 |

---

> **文档版本**: 1.0
> **最后更新**: 2026-04-08
> **维护者**: JavaScript TypeScript 技术社区
