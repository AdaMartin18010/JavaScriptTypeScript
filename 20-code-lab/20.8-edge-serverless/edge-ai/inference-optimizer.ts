/**
 * @file 推理优化器：动态批处理、请求调度、KV 缓存与内存池管理
 * @category Edge AI → Optimization
 * @difficulty medium
 * @tags inference-optimization, batching, caching, kv-cache, memory-pool, scheduling
 *
 * @description
 * 在边缘端进行推理时，优化吞吐量和延迟至关重要。本模块实现：
 * - 动态批处理（Dynamic Batching）：合并多个请求统一推理
 * - 结果缓存（LRU Cache）：对重复输入直接返回缓存结果
 * - 请求调度队列：按优先级与超时管理推理任务
 * - KV-Cache 管理：模拟 Transformer 键值缓存的分配与淘汰
 * - 张量内存池：复用缓冲区减少频繁内存分配
 */

export interface InferenceTask<TInput, TOutput> {
  id: string;
  input: TInput;
  timestamp: number;
}

export interface BatchedInferenceResult<TOutput> {
  id: string;
  output: TOutput;
  cached: boolean;
}

export class InferenceOptimizer<TInput, TOutput> {
  private cache = new Map<string, { output: TOutput; expiry: number }>();
  private batchQueue: (InferenceTask<TInput, TOutput> & { resolve: (value: BatchedInferenceResult<TOutput>) => void })[] = [];
  private readonly cacheTtlMs: number;
  private readonly maxBatchSize: number;
  private readonly batchTimeoutMs: number;
  private batchTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(options: { cacheTtlMs?: number; maxBatchSize?: number; batchTimeoutMs?: number } = {}) {
    this.cacheTtlMs = options.cacheTtlMs ?? 5000;
    this.maxBatchSize = options.maxBatchSize ?? 8;
    this.batchTimeoutMs = options.batchTimeoutMs ?? 50;
  }

  /**
   * 提交推理请求（支持缓存与批处理）
   * @param task - 推理任务
   * @param inferFn - 实际推理函数（接收批量输入）
   * @param hashFn - 输入哈希函数（用于缓存键）
   */
  async submit(
    task: InferenceTask<TInput, TOutput>,
    inferFn: (inputs: TInput[]) => Promise<TOutput[]>,
    hashFn: (input: TInput) => string
  ): Promise<BatchedInferenceResult<TOutput>> {
    const cacheKey = hashFn(task.input);

    // 检查缓存
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() < cached.expiry) {
      return { id: task.id, output: cached.output, cached: true };
    }

    return new Promise((resolve) => {
      this.batchQueue.push({ ...task, resolve });
      this.scheduleBatch(inferFn, hashFn);
    });
  }

  private scheduleBatch(
    inferFn: (inputs: TInput[]) => Promise<TOutput[]>,
    hashFn: (input: TInput) => string
  ): void {
    if (this.batchQueue.length >= this.maxBatchSize) {
      this.flushBatch(inferFn, hashFn);
      return;
    }

    if (!this.batchTimer) {
      this.batchTimer = setTimeout(() => {
        this.flushBatch(inferFn, hashFn);
      }, this.batchTimeoutMs);
    }
  }

  private async flushBatch(
    inferFn: (inputs: TInput[]) => Promise<TOutput[]>,
    hashFn: (input: TInput) => string
  ): Promise<void> {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    const batch = this.batchQueue.splice(0, this.maxBatchSize);
    if (batch.length === 0) return;

    const inputs = batch.map(t => t.input);
    const outputs = await inferFn(inputs);

    for (let i = 0; i < batch.length; i++) {
      const task = batch[i];
      const output = outputs[i];
      const cacheKey = hashFn(task.input);
      this.cache.set(cacheKey, { output, expiry: Date.now() + this.cacheTtlMs });
      task.resolve({ id: task.id, output, cached: false });
    }
  }

  /** 清空缓存 */
  clearCache(): void {
    this.cache.clear();
  }

  /** 获取当前缓存大小 */
  getCacheSize(): number {
    return this.cache.size;
  }
}

/**
 * 推理请求调度器
 * 维护优先级队列，支持高优先级任务插队与超时丢弃
 */
export class RequestScheduler<T> {
  private queue: { item: T; priority: number; deadline: number }[] = [];

  enqueue(item: T, priority = 0, timeoutMs = 5000): void {
    const deadline = Date.now() + timeoutMs;
    this.queue.push({ item, priority, deadline });
    this.queue.sort((a, b) => b.priority - a.priority);
  }

  dequeue(): T | undefined {
    const now = Date.now();
    // 丢弃超时任务
    while (this.queue.length > 0 && this.queue[0].deadline < now) {
      this.queue.shift();
    }
    return this.queue.shift()?.item;
  }

  peek(): T | undefined {
    return this.queue[0]?.item;
  }

  size(): number {
    return this.queue.length;
  }

  clear(): void {
    this.queue = [];
  }
}

/**
 * KV-Cache 管理器（Transformer 键值缓存模拟）
 * 支持按序列长度分配缓存块与简单的 LRU 淘汰
 */
export class KVCacheManager {
  private cache = new Map<string, { key: Float32Array; value: Float32Array; lastUsed: number }>();
  private maxEntries: number;

  constructor(maxEntries = 128) {
    this.maxEntries = maxEntries;
  }

  allocate(seqId: string, seqLen: number, headDim: number): { key: Float32Array; value: Float32Array } {
    const entry = this.cache.get(seqId);
    if (entry) {
      entry.lastUsed = Date.now();
      return { key: entry.key, value: entry.value };
    }

    if (this.cache.size >= this.maxEntries) {
      this.evictLRU();
    }

    const key = new Float32Array(seqLen * headDim);
    const value = new Float32Array(seqLen * headDim);
    this.cache.set(seqId, { key, value, lastUsed: Date.now() });
    return { key, value };
  }

  private evictLRU(): void {
    let oldest: string | null = null;
    let oldestTime = Infinity;
    for (const [id, entry] of this.cache) {
      if (entry.lastUsed < oldestTime) {
        oldestTime = entry.lastUsed;
        oldest = id;
      }
    }
    if (oldest) this.cache.delete(oldest);
  }

  release(seqId: string): boolean {
    return this.cache.delete(seqId);
  }

  clear(): void {
    this.cache.clear();
  }

  getSize(): number {
    return this.cache.size;
  }
}

/**
 * 张量内存池分配器
 * 复用固定大小的 Float32Array 缓冲区，减少 GC 压力
 */
export class TensorMemoryPool {
  private pools = new Map<number, Float32Array[]>();
  private allocationCount = 0;
  private reuseCount = 0;

  /** 申请指定长度的张量缓冲区 */
  allocate(size: number): Float32Array {
    const pool = this.pools.get(size);
    if (pool && pool.length > 0) {
      this.reuseCount++;
      return pool.pop()!;
    }
    this.allocationCount++;
    return new Float32Array(size);
  }

  /** 归还缓冲区到池中 */
  free(tensor: Float32Array): void {
    const pool = this.pools.get(tensor.length);
    if (pool) {
      pool.push(tensor);
    } else {
      this.pools.set(tensor.length, [tensor]);
    }
  }

  getStats(): { allocations: number; reuses: number; poolSizes: Record<number, number> } {
    const poolSizes: Record<number, number> = {};
    for (const [size, pool] of this.pools) {
      poolSizes[size] = pool.length;
    }
    return { allocations: this.allocationCount, reuses: this.reuseCount, poolSizes };
  }

  reset(): void {
    this.pools.clear();
    this.allocationCount = 0;
    this.reuseCount = 0;
  }
}

export class PrePostProcessor<TInput, TOutput> {
  private preProcessors: ((input: TInput) => TInput)[] = [];
  private postProcessors: ((output: TOutput) => TOutput)[] = [];

  addPre(fn: (input: TInput) => TInput): void {
    this.preProcessors.push(fn);
  }

  addPost(fn: (output: TOutput) => TOutput): void {
    this.postProcessors.push(fn);
  }

  preprocess(input: TInput): TInput {
    return this.preProcessors.reduce((acc, fn) => fn(acc), input);
  }

  postprocess(output: TOutput): TOutput {
    return this.postProcessors.reduce((acc, fn) => fn(acc), output);
  }
}

export function demo(): void {
  console.log('=== 推理优化器 ===\n');

  const optimizer = new InferenceOptimizer<number, number>({ cacheTtlMs: 1000, maxBatchSize: 4, batchTimeoutMs: 20 });

  async function run() {
    const inferFn = async (inputs: number[]) => inputs.map(x => x * 2);
    const hashFn = (input: number) => String(input);

    const tasks = [1, 2, 1, 3, 2].map((n, i) => ({ id: `req-${i}`, input: n, timestamp: Date.now() }));
    const results = await Promise.all(tasks.map(t => optimizer.submit(t, inferFn, hashFn)));

    console.log('结果:', results.map(r => `(${r.id}: ${r.output}, cached=${r.cached})`).join(', '));
    console.log('缓存条目数:', optimizer.getCacheSize());

    // KV-Cache 演示
    const kvCache = new KVCacheManager(4);
    const cache1 = kvCache.allocate('seq-1', 16, 64);
    console.log('KV-Cache 分配 seq-1:', cache1.key.length, cache1.value.length);
    console.log('KV-Cache 当前条目数:', kvCache.getSize());

    // 内存池演示
    const pool = new TensorMemoryPool();
    const t1 = pool.allocate(16);
    t1.fill(1.0);
    pool.free(t1);
    const t2 = pool.allocate(16);
    console.log('内存池复用统计:', pool.getStats());
    pool.free(t2);

    // 请求调度器演示
    const scheduler = new RequestScheduler<string>();
    scheduler.enqueue('low-priority', 0);
    scheduler.enqueue('high-priority', 10);
    console.log('调度器下一任务:', scheduler.dequeue());
  }

  run();
}
