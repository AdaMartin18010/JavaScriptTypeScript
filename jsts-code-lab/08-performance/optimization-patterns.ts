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

export {
  memoize,
  debounce,
  throttle,
  calculateVisibleRange,
  LazyLoader,
  WorkerPool,
  measurePerformance,
  measureAsyncPerformance,
  ObjectPool
};
