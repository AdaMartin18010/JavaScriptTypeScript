import { describe, it, expect } from 'vitest'
import { ProxyInterceptor, ProxyValidationError } from './proxy-interceptor.js'

describe('proxy-interceptor', () => {
  it('ProxyInterceptor is defined', () => {
    expect(typeof ProxyInterceptor).not.toBe('undefined');
  });

  it('createMethodInterceptor calls before and after hooks', () => {
    const calls: string[] = [];
    const target = {
      greet(name: string) {
        return `Hello ${name}`;
      }
    };

    const proxy = ProxyInterceptor.createMethodInterceptor(target, {
      beforeCall: () => { calls.push('before'); },
      afterCall: () => { calls.push('after'); }
    });

    const result = (proxy as typeof target).greet('World');
    expect(result).toBe('Hello World');
    expect(calls).toEqual(['before', 'after']);
  });

  it('createMethodInterceptor calls onError on exception', () => {
    const errors: Error[] = [];
    const target = {
      fail() {
        throw new Error('Oops');
      }
    };

    const proxy = ProxyInterceptor.createMethodInterceptor(target, {
      onError: (_t, _p, _a, err) => { errors.push(err); }
    });

    expect(() => (proxy as typeof target).fail()).toThrow('Oops');
    expect(errors.length).toBe(1);
    expect(errors[0].message).toBe('Oops');
  });

  it('createPropertyInterceptor blocks set when beforeSet returns false', () => {
    const target = { value: 0 };
    const proxy = ProxyInterceptor.createPropertyInterceptor(target, {
      beforeSet: (_t, _p, v) => (v as number) > 0
    });

    (proxy as typeof target).value = 5;
    expect(target.value).toBe(5);

    (proxy as typeof target).value = -1;
    expect(target.value).toBe(5);
  });

  it('createValidationProxy throws on invalid value', () => {
    const target = { name: '' };
    const proxy = ProxyInterceptor.createValidationProxy(target, {
      name: (v) => typeof v === 'string' && v.length > 0 || 'Name must be non-empty string'
    });

    (proxy as typeof target).name = 'Alice';
    expect(target.name).toBe('Alice');
    expect(() => { (proxy as typeof target).name = ''; }).toThrow(ProxyValidationError);
  });

  it('createCacheProxy caches method results', () => {
    let callCount = 0;
    const target = {
      compute(n: number) {
        callCount++;
        return n * 2;
      }
    };

    const proxy = ProxyInterceptor.createCacheProxy(target);
    const r1 = (proxy as typeof target).compute(5);
    const r2 = (proxy as typeof target).compute(5);
    expect(r1).toBe(10);
    expect(r2).toBe(10);
    expect(callCount).toBe(1);
    expect(proxy._cache.size).toBe(1);
  });

  it('ProxyValidationError is defined', () => {
    expect(typeof ProxyValidationError).not.toBe('undefined');
  });
});
