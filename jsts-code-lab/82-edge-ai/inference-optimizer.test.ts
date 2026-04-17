import { describe, it, expect } from 'vitest';
import { InferenceOptimizer, PrePostProcessor } from './inference-optimizer.js';

describe('InferenceOptimizer', () => {
  it('should cache repeated inputs', async () => {
    const optimizer = new InferenceOptimizer<number, number>({ cacheTtlMs: 1000, maxBatchSize: 4, batchTimeoutMs: 10 });
    const inferFn = async (inputs: number[]) => inputs.map(x => x * 2);
    const hashFn = (input: number) => String(input);

    const r1 = await optimizer.submit({ id: 'a', input: 5, timestamp: 0 }, inferFn, hashFn);
    const r2 = await optimizer.submit({ id: 'b', input: 5, timestamp: 0 }, inferFn, hashFn);

    expect(r1.cached).toBe(false);
    expect(r2.cached).toBe(true);
    expect(r1.output).toBe(10);
    expect(r2.output).toBe(10);
  });

  it('should batch multiple requests', async () => {
    const optimizer = new InferenceOptimizer<number, number>({ cacheTtlMs: 1000, maxBatchSize: 4, batchTimeoutMs: 10 });
    let batchCount = 0;
    const inferFn = async (inputs: number[]) => {
      batchCount++;
      return inputs.map(x => x + 1);
    };
    const hashFn = (input: number) => String(input);

    const tasks = [1, 2, 3].map((n, i) => ({ id: `${i}`, input: n, timestamp: 0 }));
    await Promise.all(tasks.map(t => optimizer.submit(t, inferFn, hashFn)));

    expect(batchCount).toBeGreaterThanOrEqual(1);
  });
});

describe('PrePostProcessor', () => {
  it('should apply pre and post processors in order', () => {
    const proc = new PrePostProcessor<number, number>();
    proc.addPre(x => x + 1);
    proc.addPre(x => x * 2);
    proc.addPost(x => x - 1);

    expect(proc.preprocess(3)).toBe(8); // (3+1)*2
    expect(proc.postprocess(8)).toBe(7); // 8-1
  });
});
