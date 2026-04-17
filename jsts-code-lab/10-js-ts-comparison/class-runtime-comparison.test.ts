/**
 * @file JS #private 与 TS private 运行时对比测试
 * @category JS/TS Comparison
 * @difficulty medium
 * @tags runtime-semantics, private-fields, class, test
 */

import { describe, it, expect } from 'vitest';

// 复用被测类的定义，确保测试与源码一致
class JsPrivateUser {
  #name: string;

  constructor(name: string) {
    this.#name = name;
  }

  greet() {
    return `Hello, ${this.#name}`;
  }
}

class TsPrivateUser {
  private name: string;

  constructor(name: string) {
    this.name = name;
  }

  greet() {
    return `Hello, ${this.name}`;
  }
}

describe('class-runtime-comparison', () => {
  it('JS #private 字段不应出现在 Object.keys 中', () => {
    const user = new JsPrivateUser('Alice');
    expect(Object.keys(user)).not.toContain('#name');
  });

  it('TS private 编译后等价于普通字段，出现在 Object.keys 中', () => {
    const user = new TsPrivateUser('Bob');
    expect(Object.keys(user)).toContain('name');
  });

  it('JS #private 在类外部不可访问（运行时抛出 SyntaxError）', () => {
    const user = new JsPrivateUser('Alice');
    // TypeScript 编译器会阻止直接访问 #name，
    // 使用 eval 绕过静态检查来验证运行时行为
    expect(() => {
      // eslint-disable-next-line no-eval
      eval('user.#name');
    }).toThrow();
  });

  it('TS private 在运行时可被索引访问', () => {
    const user = new TsPrivateUser('Bob');
    expect((user as unknown as Record<string, unknown>).name).toBe('Bob');
  });

  it('JS #private  greeting 功能正常', () => {
    expect(new JsPrivateUser('Alice').greet()).toBe('Hello, Alice');
  });

  it('TS private greeting 功能正常', () => {
    expect(new TsPrivateUser('Bob').greet()).toBe('Hello, Bob');
  });
});
