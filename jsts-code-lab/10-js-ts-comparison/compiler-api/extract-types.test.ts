import { describe, it, expect } from 'vitest';
import { extractTypes } from './extract-types.js';

describe('extract-types', () => {
  it('应提取变量声明的名称和推断类型', () => {
    const source = `
      const count: number = 42;
      const message = 'hello';
      const arr = [1, 2, 3];
    `;

    const result = extractTypes(source);

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'count', kind: '变量', typeString: 'number' }),
        expect.objectContaining({ name: 'message', kind: '变量', typeString: '"hello"' }),
        expect.objectContaining({ name: 'arr', kind: '变量', typeString: 'number[]' }),
      ])
    );
  });

  it('应提取函数声明的名称和签名类型', () => {
    const source = `
      function add(a: number, b: number): number {
        return a + b;
      }

      function greet(name: string): string {
        return 'Hello, ' + name;
      }
    `;

    const result = extractTypes(source);
    const addInfo = result.find((r) => r.name === 'add');
    const greetInfo = result.find((r) => r.name === 'greet');

    expect(addInfo).toBeDefined();
    expect(addInfo!.kind).toBe('函数');
    expect(addInfo!.typeString).toContain('number');

    expect(greetInfo).toBeDefined();
    expect(greetInfo!.kind).toBe('函数');
    expect(greetInfo!.typeString).toContain('string');
  });

  it('对空源码应返回空数组', () => {
    const result = extractTypes('');
    expect(result).toEqual([]);
  });

  it('应同时提取变量和函数声明', () => {
    const source = `
      const pi = 3.14;
      function area(r: number): number {
        return pi * r * r;
      }
    `;

    const result = extractTypes(source);
    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({ name: 'pi', kind: '变量' });
    expect(result[1]).toMatchObject({ name: 'area', kind: '函数' });
  });
});
