import { describe, it, expect } from 'vitest';
import { eraseTypes } from './type-erasure-demo.js';

describe('type-erasure-demo', () => {
  it('应删除变量和参数的类型标注', () => {
    const ts = 'let x: number = 1;\nfunction foo(a: string, b: boolean) {}';
    const js = eraseTypes(ts);
    expect(js).toContain('let x = 1;');
    expect(js).toContain('function foo(a, b)');
    expect(js).not.toContain(': number');
    expect(js).not.toContain(': string');
  });

  it('应删除返回类型标注', () => {
    const ts = 'function add(a: number, b: number): number { return a + b; }';
    const js = eraseTypes(ts);
    expect(js).toContain('function add(a, b) {');
    expect(js).not.toContain(': number');
  });

  it('应删除 interface 和 type alias', () => {
    const ts = `
      interface User { name: string; }
      type ID = string | number;
      function getId(): ID { return 1; }
    `;
    const js = eraseTypes(ts);
    expect(js).not.toContain('interface User');
    expect(js).not.toContain('type ID');
    expect(js).toContain('function getId()');
  });

  it('应删除泛型参数', () => {
    const ts = 'function identity<T>(x: T): T { return x; }';
    const js = eraseTypes(ts);
    expect(js).toContain('function identity(x)');
    expect(js).not.toContain('<T>');
  });

  it('应删除 as 断言但保留表达式', () => {
    const ts = 'const name = (user as User).name;';
    const js = eraseTypes(ts);
    expect(js).toContain('(user).name');
    expect(js).not.toContain('as User');
  });

  it('应保留 enum、namespace 和参数属性', () => {
    const ts = `
      enum Role { Admin = 1 }
      namespace App { export const version = 1; }
      class Person { constructor(public name: string) {} }
    `;
    const js = eraseTypes(ts);
    expect(js).toContain('enum Role');
    expect(js).toContain('namespace App');
    expect(js).toContain('constructor(public name)');
  });

  it('应处理箭头函数类型标注', () => {
    const ts = 'const add = (x: number, y: number): number => x + y;';
    const js = eraseTypes(ts);
    expect(js).toContain('(x, y) => x + y;');
    expect(js).not.toContain(': number');
  });

  it('应处理类 implements', () => {
    const ts = 'class Foo implements Bar, Baz { run(): void {} }';
    const js = eraseTypes(ts);
    expect(js).toContain('class Foo {');
    expect(js).not.toContain('implements');
    expect(js).toContain('run()');
  });
});
