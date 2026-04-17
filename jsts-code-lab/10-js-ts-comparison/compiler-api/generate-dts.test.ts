import { describe, it, expect } from 'vitest';
import { generateDts } from './generate-dts.js';

describe('generate-dts', () => {
  it('应从接口生成对应的 .d.ts 声明', () => {
    const source = `
      export interface Person {
        name: string;
        age: number;
      }
    `;

    const dts = generateDts(source);

    expect(dts).toContain('interface Person');
    expect(dts).toContain('name: string');
    expect(dts).toContain('age: number');
  });

  it('应从函数声明生成对应的 .d.ts 签名', () => {
    const source = `
      export function add(a: number, b: number): number;
    `;

    const dts = generateDts(source);

    expect(dts).toContain('export declare function add(a: number, b: number): number;');
  });

  it('应从类声明生成对应的 .d.ts 类声明', () => {
    const source = `
      export class Greeter {
        constructor(message: string);
        greet(): string;
      }
    `;

    const dts = generateDts(source);

    expect(dts).toContain('export declare class Greeter');
    expect(dts).toContain('constructor(message: string);');
    expect(dts).toContain('greet(): string;');
  });

  it('对包含类型错误的源码应生成诊断信息', () => {
    const badSource = `
      export const a: number = "not a number";
    `;

    const dts = generateDts(badSource);

    // 诊断信息应被附加到输出中
    expect(dts).toContain('编译诊断信息');
    expect(dts).toContain('Type \'string\' is not assignable to type \'number\'');
  });
});
