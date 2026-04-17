import { describe, it, expect } from 'vitest';
import { addReadonlyToProperties } from './custom-transformer.js';

describe('custom-transformer', () => {
  it('应为非 readonly 的类属性添加 readonly 修饰符', () => {
    const source = `
class User {
  name: string;
  age: number;
}
`;

    const output = addReadonlyToProperties(source);

    expect(output).toContain('readonly name: string');
    expect(output).toContain('readonly age: number');
  });

  it('不应为已存在的 readonly 属性重复添加修饰符', () => {
    const source = `
class User {
  readonly id: string;
  name: string;
}
`;

    const output = addReadonlyToProperties(source);

    // 原始代码中已有 readonly id，不应出现两个 readonly
    const matches = output.match(/readonly/g);
    expect(matches).toHaveLength(2); // id 和 name 各一个
    expect(output).toContain('readonly id: string');
    expect(output).toContain('readonly name: string');
  });

  it('应保留原有的访问修饰符（如 public / private）', () => {
    const source = `
class Product {
  public title: string;
  private price: number;
  protected stock: number;
}
`;

    const output = addReadonlyToProperties(source);

    expect(output).toContain('readonly public title: string');
    expect(output).toContain('readonly private price: number');
    expect(output).toContain('readonly protected stock: number');
  });

  it('对没有属性的类不应产生错误', () => {
    const source = `
class Empty {
  constructor() {}
  sayHello(): void {}
}
`;

    const output = addReadonlyToProperties(source);

    expect(output).toContain('class Empty');
    expect(output).toContain('constructor()');
    expect(output).toContain('sayHello(): void');
    expect(output).not.toContain('readonly');
  });
});
