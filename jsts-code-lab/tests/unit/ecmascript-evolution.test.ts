/**
 * @file ECMAScript 演进单元测试
 */

import { describe, it, expect } from 'vitest';

describe('ES2020 特性', () => {
  it('应该支持 BigInt', () => {
    const big = BigInt(123);
    expect(big + BigInt(1)).toBe(BigInt(124));
  });

  it('应该支持空值合并运算符 ??', () => {
    const value = null ?? 'default';
    expect(value).toBe('default');
    
    const zero = 0 ?? 'default';
    expect(zero).toBe(0); // 与 || 不同，0 不是假值
  });

  it('应该支持可选链操作符 ?.', () => {
    const obj = { a: { b: { c: 42 } } };
    expect(obj?.a?.b?.c).toBe(42);
    expect(obj?.x?.y?.z).toBeUndefined();
  });

  it('应该支持 Promise.allSettled', async () => {
    const results = await Promise.allSettled([
      Promise.resolve('success'),
      Promise.reject('error')
    ]);
    
    expect(results[0].status).toBe('fulfilled');
    expect(results[1].status).toBe('rejected');
  });
});

describe('ES2021 特性', () => {
  it('应该支持 Promise.any', async () => {
    const result = await Promise.any([
      Promise.reject('error1'),
      Promise.resolve('success'),
      Promise.reject('error2')
    ]);
    
    expect(result).toBe('success');
  });

  it('应该支持逻辑赋值运算符', () => {
    let a = null;
    a ??= 'default';
    expect(a).toBe('default');
    
    let b = 5;
    b &&= 10;
    expect(b).toBe(10);
  });
});

describe('ES2022 特性', () => {
  it('应该支持数组 at() 方法', () => {
    const arr = [1, 2, 3];
    expect(arr.at(0)).toBe(1);
    expect(arr.at(-1)).toBe(3);
  });

  it('应该支持类私有字段', () => {
    class Counter {
      #count = 0;
      
      increment() {
        this.#count++;
        return this.#count;
      }
      
      get count() {
        return this.#count;
      }
    }
    
    const counter = new Counter();
    counter.increment();
    expect(counter.count).toBe(1);
  });
});
