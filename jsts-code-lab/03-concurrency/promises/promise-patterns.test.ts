import { describe, it, expect } from 'vitest';
import { sequence, delay, pipe, debouncePromise, timeout } from './promise-patterns';

describe('promise patterns', () => {
  it('sequence should execute promises in order', async () => {
    const results = await sequence([
      () => Promise.resolve('a'),
      () => Promise.resolve('b'),
      () => Promise.resolve('c'),
    ]);
    expect(results).toEqual(['a', 'b', 'c']);
  });

  it('delay should wait specified ms', async () => {
    const start = Date.now();
    await delay(50);
    expect(Date.now() - start).toBeGreaterThanOrEqual(45);
  });

  it('pipe should pass value through async functions', async () => {
    const result = await pipe(
      5,
      async (x) => x + 1,
      async (x) => x * 2,
      async (x) => String(x)
    );
    expect(result).toBe('12');
  });

  it('debouncePromise should return same promise within debounce window', async () => {
    let calls = 0;
    const fn = debouncePromise(async () => {
      calls++;
      return calls;
    }, 50);
    const p1 = fn();
    const p2 = fn();
    expect(p1).toBe(p2);
    const result = await p1;
    expect(result).toBe(1);
  });

  it('timeout should reject after specified ms', async () => {
    await expect(timeout(1)).rejects.toThrow('Timeout');
  });
});
