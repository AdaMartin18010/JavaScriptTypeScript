/**
 * @file 语言核心单元测试
 */

import { describe, it, expect } from 'vitest';

// 测试类型系统
describe('类型系统', () => {
  it('应该支持基本类型推断', () => {
    const num = 42;
    const str = 'hello';
    const bool = true;
    
    expect(typeof num).toBe('number');
    expect(typeof str).toBe('string');
    expect(typeof bool).toBe('boolean');
  });

  it('应该支持泛型', () => {
    function identity<T>(arg: T): T {
      return arg;
    }
    
    expect(identity<number>(42)).toBe(42);
    expect(identity<string>('hello')).toBe('hello');
  });

  it('应该支持类型守卫', () => {
    function isString(value: unknown): value is string {
      return typeof value === 'string';
    }
    
    expect(isString('hello')).toBe(true);
    expect(isString(42)).toBe(false);
  });
});

// 测试函数
describe('函数', () => {
  it('应该支持箭头函数', () => {
    const add = (a: number, b: number) => a + b;
    expect(add(1, 2)).toBe(3);
  });

  it('应该支持高阶函数', () => {
    function createMultiplier(factor: number) {
      return (x: number) => x * factor;
    }
    
    const double = createMultiplier(2);
    expect(double(5)).toBe(10);
  });
});

// 测试类
describe('类', () => {
  it('应该支持类和继承', () => {
    class Animal {
      constructor(public name: string) {}
      move(): string {
        return `${this.name} is moving`;
      }
    }

    class Dog extends Animal {
      move(): string {
        return `${this.name} is running`;
      }
    }

    const dog = new Dog('Buddy');
    expect(dog.move()).toBe('Buddy is running');
  });
});
