import { describe, it, expect } from 'vitest';
import { withRetry, withTimeout, batchProcess } from './async-patterns';

describe('async patterns', () => {
  it('withRetry should succeed after a few failures', async () => {
    let attempts = 0;
    const result = await withRetry(async () => {
      attempts++;
      if (attempts < 3) throw new Error('fail');
      return 'success';
    }, 5, 10);
    expect(result).toBe('success');
    expect(attempts).toBe(3);
  });

  it('withRetry should throw after exhausting retries', async () => {
    await expect(
      withRetry(async () => {
        throw new Error('always fails');
      }, 2, 1)
    ).rejects.toThrow('always fails');
  });

  it('withTimeout should resolve if promise is fast enough', async () => {
    const fast = Promise.resolve('ok');
    const result = await withTimeout(fast, 100);
    expect(result).toBe('ok');
  });

  it('withTimeout should reject on timeout', async () => {
    const slow = new Promise((resolve) => setTimeout(resolve, 200, 'late'));
    await expect(withTimeout(slow, 50)).rejects.toThrow('Timeout');
  });

  it('batchProcess should respect concurrency limit', async () => {
    let maxConcurrent = 0;
    let current = 0;
    const processor = async (n: number) => {
      current++;
      maxConcurrent = Math.max(maxConcurrent, current);
      await new Promise((resolve) => setTimeout(resolve, 30));
      current--;
      return n * 2;
    };
    const results = await batchProcess([1, 2, 3, 4], processor, 2);
    expect(results).toEqual([2, 4, 6, 8]);
    expect(maxConcurrent).toBeLessThanOrEqual(2);
  });
});
