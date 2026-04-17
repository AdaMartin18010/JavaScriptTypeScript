import { describe, it, expect } from 'vitest';
import { MyPromise } from './promise-implementation.js';

describe('MyPromise implementation', () => {
  it('should resolve with a value', async () => {
    const p = new MyPromise<string>((resolve) => { resolve('hello'); });
    const result = await p;
    expect(result).toBe('hello');
  });

  it('should reject with a reason', async () => {
    const p = new MyPromise<string>((_, reject) => { reject(new Error('oops')); });
    await expect(p).rejects.toThrow('oops');
  });

  it('should chain with then', async () => {
    const p = new MyPromise<number>((resolve) => { resolve(2); });
    const result = await p.then((x) => x * 3);
    expect(result).toBe(6);
  });

  it('catch should recover from rejection', async () => {
    const p = new MyPromise<number>((_, reject) => { reject(new Error('fail')); });
    const result = await p.catch(() => 0);
    expect(result).toBe(0);
  });

  it('finally should run without changing result', async () => {
    let called = false;
    const p = new MyPromise<number>((resolve) => { resolve(5); });
    const result = await p.finally(() => {
      called = true;
    });
    expect(result).toBe(5);
    expect(called).toBe(true);
  });

  it('MyPromise.resolve should create resolved promise', async () => {
    const result = await MyPromise.resolve(10);
    expect(result).toBe(10);
  });

  it('MyPromise.reject should create rejected promise', async () => {
    await expect(MyPromise.reject('err')).rejects.toBe('err');
  });

  it('MyPromise.all should resolve with array of values', async () => {
    const result = await MyPromise.all([
      MyPromise.resolve(1),
      MyPromise.resolve(2),
      MyPromise.resolve(3),
    ]);
    expect(result).toEqual([1, 2, 3]);
  });

  it('MyPromise.all should reject if any promise rejects', async () => {
    await expect(
      MyPromise.all([MyPromise.resolve(1), MyPromise.reject<number>(new Error('x')), MyPromise.resolve(3)])
    ).rejects.toThrow('x');
  });

  it('MyPromise.race should resolve with fastest value', async () => {
    const result = await MyPromise.race([
      new MyPromise<number>((resolve) => setTimeout(() => { resolve(1); }, 50)),
      new MyPromise<number>((resolve) => setTimeout(() => { resolve(2); }, 10)),
    ]);
    expect(result).toBe(2);
  });
});
