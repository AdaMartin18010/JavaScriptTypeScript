/**
 * @file 推理优化器
 * @category Edge AI → Optimization
 * @difficulty medium
 * @tags inference-optimization, batching, caching, preprocessing
 *
 * @description
 * 在边缘端进行推理时，优化吞吐量和延迟至关重要。本模块实现：
 * - 动态批处理（Dynamic Batching）：合并多个请求统一推理
 * - 结果缓存（LRU Cache）：对重复输入直接返回缓存结果
 * - 前/后处理流水线：将数据转换与业务逻辑解耦
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
  private batchQueue: InferenceTask<TInput, TOutput>[] = [];
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
      this.batchQueue.push({ ...task, resolve: resolve as (value: BatchedInferenceResult<TOutput>) => void } as InferenceTask<TInput, TOutput> & { resolve: (value: BatchedInferenceResult<TOutput>) => void });
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
      (task as unknown as { resolve: (value: BatchedInferenceResult<TOutput>) => void }).resolve({ id: task.id, output, cached: false });
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
  }

  run();
}
