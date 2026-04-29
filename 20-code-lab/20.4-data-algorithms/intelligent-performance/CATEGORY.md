---
dimension: 综合
sub-dimension: Intelligent performance
created: 2026-04-28
---

# CATEGORY.md — Intelligent Performance

## 模块归属声明

本模块归属 **「综合」** 维度，聚焦智能化性能优化（Intelligent Performance）核心概念与工程实践。

## 包含内容

- 性能分析（Profiling）与瓶颈定位
- 内存优化（Memory Optimization）与泄漏检测
- 缓存策略（Caching）与离线优先
- Web Workers 与多线程计算
- WebAssembly 加速与 JS-WASM 互操作
- AI 驱动的性能预测与自动优化

## 子模块索引

| 子模块 | 核心主题 | 关键技术与 API |
|--------|----------|----------------|
| **profiling** | 性能分析 | Performance Timeline、Lighthouse、User Timing API |
| **memory-optimization** | 内存优化 | 垃圾回收、内存泄漏检测、WeakRef、FinalizationRegistry |
| **caching** | 缓存策略 | HTTP Cache、Service Worker、Memory Cache、IndexedDB |
| **web-workers** | 多线程计算 | Web Workers、SharedArrayBuffer、OffscreenCanvas |
| **wasm** | WebAssembly 加速 | WASM 模块加载、Rust/C++ 编译、JS-WASM 互操作 |

## 代码示例

### User Timing API 与 Performance Observer

```typescript
// profiling.ts — 精确测量代码段耗时
const marker = 'heavy-computation';

performance.mark(`${marker}-start`);
// ... 待测量代码
const data = heavyComputation();
performance.mark(`${marker}-end`);
performance.measure(marker, `${marker}-start`, `${marker}-end`);

// 使用 PerformanceObserver 实时监控
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log(`[${entry.name}] duration: ${entry.duration?.toFixed(2)}ms`);
  }
});
observer.observe({ entryTypes: ['measure', 'navigation', 'resource'] });
```

### WeakRef 与 FinalizationRegistry

```typescript
// memory-optimization.ts — 非强引用缓存
class WeakCache<K extends object, V> {
  private cache = new WeakMap<K, WeakRef<V>>();
  private registry = new FinalizationRegistry<K>((key) => {
    console.log(`Object ${key} was garbage collected`);
  });

  set(key: K, value: V) {
    this.cache.set(key, new WeakRef(value));
    this.registry.register(value, key);
  }

  get(key: K): V | undefined {
    const ref = this.cache.get(key);
    return ref?.deref();
  }
}

// 使用场景：DOM 节点关联的大数据对象
const cache = new WeakCache<Element, ImageData>();
const canvas = document.createElement('canvas');
cache.set(canvas, new ImageData(100, 100));
// 当 canvas 从 DOM 移除且不被引用时，ImageData 可被 GC
```

### Service Worker 缓存策略

```typescript
// service-worker.ts — 缓存优先与网络回退
const CACHE_NAME = 'v1';
const PRECACHE_ASSETS = ['/index.html', '/app.js', '/styles.css'];

self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
});

self.addEventListener('fetch', (event: FetchEvent) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached; // 缓存命中
      return fetch(event.request).then((response) => {
        // 动态缓存新资源
        if (event.request.method === 'GET') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
```

### Web Worker 并行计算

```typescript
// worker.ts — 计算密集型任务隔离
// main.ts
const worker = new Worker(new URL('./math-worker.ts', import.meta.url), { type: 'module' });

worker.postMessage({ type: 'PRIMES', limit: 1_000_000 });
worker.onmessage = (e) => {
  console.log(`Found ${e.data.count} primes`);
};

// math-worker.ts
self.onmessage = (e: MessageEvent) => {
  if (e.data.type === 'PRIMES') {
    const primes = sieveOfEratosthenes(e.data.limit);
    self.postMessage({ count: primes.length, primes });
  }
};

function sieveOfEratosthenes(limit: number): number[] {
  const sieve = new Uint8Array(limit + 1);
  const primes: number[] = [];
  for (let i = 2; i <= limit; i++) {
    if (sieve[i]) continue;
    primes.push(i);
    for (let j = i * i; j <= limit; j += i) sieve[j] = 1;
  }
  return primes;
}
```

### WebAssembly 动态加载

```typescript
// wasm-loader.ts — 运行时加载 WASM 模块
async function loadWasmModule(url: string) {
  const response = await fetch(url);
  const bytes = await response.arrayBuffer();
  const module = await WebAssembly.compile(bytes);
  const instance = await WebAssembly.instantiate(module, {
    env: {
      memory: new WebAssembly.Memory({ initial: 256, maximum: 512 }),
      abort: () => console.error('WASM abort'),
    },
  });
  return instance.exports;
}

// 使用 Rust/AssemblyScript 编译的 WASM 进行图像处理
async function blurImage(imageData: ImageData): Promise<ImageData> {
  const wasm = await loadWasmModule('/wasm/image_processing.wasm');
  const { blur, memory } = wasm as any;

  // 将图像数据复制到 WASM 内存
  const ptr = 0;
  const bytes = new Uint8Array(memory.buffer, ptr, imageData.data.length);
  bytes.set(imageData.data);

  blur(ptr, imageData.width, imageData.height, 5); // 5px 模糊半径

  return new ImageData(
    new Uint8ClampedArray(memory.buffer, ptr, imageData.data.length),
    imageData.width,
    imageData.height
  );
}
```

## 权威参考链接

| 资源 | 类型 | 链接 |
|------|------|------|
| Chrome DevTools 性能分析 | 文档 | [developer.chrome.com/docs/devtools/performance](https://developer.chrome.com/docs/devtools/performance) |
| MDN Performance API | 文档 | [developer.mozilla.org/zh-CN/docs/Web/API/Performance](https://developer.mozilla.org/zh-CN/docs/Web/API/Performance) |
| MDN Web Workers | 文档 | [developer.mozilla.org/zh-CN/docs/Web/API/Web_Workers_API](https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Workers_API) |
| WebAssembly 官方文档 | 文档 | [webassembly.org/getting-started/developers-guide](https://webassembly.org/getting-started/developers-guide/) |
| Lighthouse 性能评分 | 指南 | [developer.chrome.com/docs/lighthouse/performance/performance-scoring](https://developer.chrome.com/docs/lighthouse/performance/performance-scoring) |
| MDN Cache API | 文档 | [developer.mozilla.org/zh-CN/docs/Web/API/Cache](https://developer.mozilla.org/zh-CN/docs/Web/API/Cache) |
| Web Vitals | 标准 | [web.dev/vitals](https://web.dev/vitals) — LCP、FID/INP、CLS |
| Rust and WebAssembly Book | 书籍 | [rustwasm.github.io/book](https://rustwasm.github.io/book/) |
| AssemblyScript | 项目 | [assemblyscript.org](https://www.assemblyscript.org) — TypeScript 语法编译到 WASM |
| Inferno / Solid.js 性能对比 | 基准 | [krausest.github.io/js-framework-benchmark](https://krausest.github.io/js-framework-benchmark/current.html) |

## 相关索引

- `30-knowledge-base/30.2-categories/README.md` — 分类总览
- `20-code-lab/` — 代码实验室实践

## 目录内容

- 📄 README.md
- 📄 THEORY.md
- 📄 _MIGRATED_FROM.md
- 📄 ai-performance-optimizer.test.ts
- 📄 ai-performance-optimizer.ts
- 📄 code-optimization-models.test.ts
- 📄 code-optimization-models.ts
- 📄 index.ts
- 📄 memory-optimization-models.test.ts
- 📄 memory-optimization-models.ts
- 📄 network-optimization-models.test.ts
- 📄 network-optimization-models.ts
- 📄 rendering-performance-model.test.ts
- 📄 rendering-performance-model.ts

---

> 此分类文档已根据实际模块内容补充代码示例与权威链接。
