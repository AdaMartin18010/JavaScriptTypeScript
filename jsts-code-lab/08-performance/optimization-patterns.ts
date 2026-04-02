/**
 * @file 性能优化模式
 * @category Performance → Optimization
 * @difficulty medium
 * @tags performance, optimization, caching, memoization
 */

// ============================================================================
// 1. 记忆化 (Memoization)
// ============================================================================

export function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map<string, ReturnType<T>>();
  
  return function (...args: Parameters<T>): ReturnType<T> {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = fn(...args);
    cache.set(key, result);
    return result;
  } as T;
}

// 使用
const fib = memoize((n: number): number => {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
});

// ============================================================================
// 2. 防抖 (Debounce)
// ============================================================================

export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  
  return function (...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// ============================================================================
// 3. 节流 (Throttle)
// ============================================================================

export function throttle<T extends (...args: any[]) => void>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  
  return function (...args: Parameters<T>) {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// ============================================================================
// 4. 虚拟列表 (Virtual List)
// ============================================================================

interface VirtualListConfig {
  itemHeight: number;
  containerHeight: number;
  totalItems: number;
  overscan?: number;
}

interface VirtualListState {
  startIndex: number;
  endIndex: number;
  offset: number;
}

export function calculateVisibleRange(
  scrollTop: number,
  config: VirtualListConfig
): VirtualListState {
  const { itemHeight, containerHeight, totalItems, overscan = 3 } = config;
  
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const endIndex = Math.min(totalItems - 1, startIndex + visibleCount + overscan * 2);
  const offset = startIndex * itemHeight;
  
  return { startIndex, endIndex, offset };
}

// ============================================================================
// 5. 懒加载
// ============================================================================

export class LazyLoader<T> {
  private cache = new Map<string, T>();
  private loading = new Map<string, Promise<T>>();
  
  constructor(private loader: (key: string) => Promise<T>) {}
  
  async get(key: string): Promise<T> {
    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }
    
    if (this.loading.has(key)) {
      return this.loading.get(key)!;
    }
    
    const promise = this.loader(key).then(value => {
      this.cache.set(key, value);
      this.loading.delete(key);
      return value;
    });
    
    this.loading.set(key, promise);
    return promise;
  }
  
  clear(): void {
    this.cache.clear();
    this.loading.clear();
  }
}

// ============================================================================
// 6. Web Worker 封装
// ============================================================================

export class WorkerPool {
  private workers: Worker[] = [];
  private queue: Array<{ task: unknown; resolve: (value: unknown) => void }> = [];
  private activeTasks = 0;
  
  constructor(workerScript: string, poolSize = navigator.hardwareConcurrency || 4) {
    for (let i = 0; i < poolSize; i++) {
      const worker = new Worker(workerScript);
      worker.onmessage = (e) => this.handleMessage(e.data);
      this.workers.push(worker);
    }
  }
  
  private handleMessage(result: unknown): void {
    this.activeTasks--;
    this.processQueue();
  }
  
  private processQueue(): void {
    if (this.queue.length === 0) return;
    
    const availableWorker = this.workers.find(w => w);
    if (!availableWorker) return;
    
    const { task, resolve } = this.queue.shift()!;
    availableWorker.postMessage(task);
    this.activeTasks++;
  }
  
  execute(task: unknown): Promise<unknown> {
    return new Promise(resolve => {
      this.queue.push({ task, resolve });
      this.processQueue();
    });
  }
  
  terminate(): void {
    this.workers.forEach(w => w.terminate());
  }
}

// ============================================================================
// 7. 性能测量
// ============================================================================

export function measurePerformance<T>(
  fn: () => T,
  label: string
): T {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  console.log(`${label}: ${(end - start).toFixed(2)}ms`);
  return result;
}

export async function measureAsyncPerformance<T>(
  fn: () => Promise<T>,
  label: string
): Promise<T> {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  console.log(`${label}: ${(end - start).toFixed(2)}ms`);
  return result;
}

// ============================================================================
// 8. 内存优化
// ============================================================================

export class ObjectPool<T> {
  private available: T[] = [];
  private inUse = new Set<T>();
  
  constructor(
    private factory: () => T,
    private reset: (obj: T) => void,
    initialSize = 10
  ) {
    for (let i = 0; i < initialSize; i++) {
      this.available.push(factory());
    }
  }
  
  acquire(): T {
    let obj: T;
    if (this.available.length > 0) {
      obj = this.available.pop()!;
    } else {
      obj = this.factory();
    }
    this.inUse.add(obj);
    return obj;
  }
  
  release(obj: T): void {
    if (this.inUse.has(obj)) {
      this.inUse.delete(obj);
      this.reset(obj);
      this.available.push(obj);
    }
  }
}

// ============================================================================
// 导出
// ============================================================================

// ============================================================================
// Demo 函数
// ============================================================================

export async function demo(): Promise<void> {
  console.log('=== 性能优化模式演示 ===\n');

  // 1. 记忆化
  console.log('--- 记忆化 (Memoization) ---');
  const memoizedFib = memoize((n: number): number => {
    if (n <= 1) return n;
    return memoizedFib(n - 1) + memoizedFib(n - 2);
  });
  
  console.log('计算斐波那契数列 (记忆化):');
  measurePerformance(() => memoizedFib(35), 'Fib(35) 首次计算');
  measurePerformance(() => memoizedFib(35), 'Fib(35) 缓存命中');
  measurePerformance(() => memoizedFib(40), 'Fib(40) 首次计算');

  // 2. 防抖
  console.log('\n--- 防抖 (Debounce) ---');
  let debounceCount = 0;
  const debouncedFn = debounce(() => {
    debounceCount++;
    console.log(`防抖函数执行 (第 ${debounceCount} 次)`);
  }, 300);
  
  console.log('快速调用 5 次...');
  for (let i = 0; i < 5; i++) {
    debouncedFn();
  }
  await new Promise(resolve => setTimeout(resolve, 400));
  console.log(`实际执行次数: ${debounceCount} (期望: 1)`);

  // 3. 节流
  console.log('\n--- 节流 (Throttle) ---');
  let throttleCount = 0;
  const throttledFn = throttle(() => {
    throttleCount++;
  }, 100);
  
  console.log('每 50ms 调用一次，持续 500ms...');
  const throttleInterval = setInterval(throttledFn, 50);
  await new Promise(resolve => setTimeout(resolve, 550));
  clearInterval(throttleInterval);
  console.log(`实际执行次数: ${throttleCount} (期望约 5-6 次)`);

  // 4. 虚拟列表
  console.log('\n--- 虚拟列表 ---');
  const config: VirtualListConfig = {
    itemHeight: 50,
    containerHeight: 300,
    totalItems: 1000,
    overscan: 3
  };
  
  const visibleRange = calculateVisibleRange(0, config);
  console.log(`总项目: ${config.totalItems}, 可见范围: ${visibleRange.startIndex} - ${visibleRange.endIndex}`);
  console.log(`渲染项目数: ${visibleRange.endIndex - visibleRange.startIndex + 1} (而非全部 1000 个)`);
  
  const scrolledRange = calculateVisibleRange(5000, config);
  console.log(`滚动到 5000px 后，可见范围: ${scrolledRange.startIndex} - ${scrolledRange.endIndex}`);

  // 5. 懒加载
  console.log('\n--- 懒加载 (LazyLoader) ---');
  let loadCount = 0;
  const lazyLoader = new LazyLoader<string>(async (key) => {
    loadCount++;
    await new Promise(resolve => setTimeout(resolve, 100));
    return `Data for ${key}`;
  });
  
  console.log('并行请求同一个 key 3 次...');
  const [r1, r2, r3] = await Promise.all([
    lazyLoader.get('item1'),
    lazyLoader.get('item1'),
    lazyLoader.get('item1')
  ]);
  console.log(`结果: ${r1}, 实际加载次数: ${loadCount} (期望: 1)`);
  
  const r4 = await lazyLoader.get('item2');
  console.log(`加载新 key，总加载次数: ${loadCount} (期望: 2)`);

  // 6. 性能测量
  console.log('\n--- 性能测量 ---');
  const sum = measurePerformance(() => {
    let s = 0;
    for (let i = 0; i < 1000000; i++) s += i;
    return s;
  }, '计算 0 到 999999 的和');
  console.log(`计算结果: ${sum}`);

  // 7. 对象池
  console.log('\n--- 对象池 (ObjectPool) ---');
  let createdCount = 0;
  const pool = new ObjectPool(
    () => {
      createdCount++;
      return { id: createdCount, data: new Array(100).fill(0) };
    },
    (obj) => { obj.data.fill(0); },
    3
  );
  
  console.log(`初始创建 3 个对象`);
  const obj1 = pool.acquire();
  const obj2 = pool.acquire();
  console.log(`获取 2 个对象，创建计数: ${createdCount}`);
  
  pool.release(obj1);
  const obj3 = pool.acquire();
  console.log(`释放 1 个再获取 1 个，创建计数: ${createdCount} (期望: 3，复用)`);
  
  const obj4 = pool.acquire();
  console.log(`再获取 1 个，创建计数: ${createdCount} (期望: 4，新建)`);

  console.log('\n=== 演示结束 ===\n');
}
