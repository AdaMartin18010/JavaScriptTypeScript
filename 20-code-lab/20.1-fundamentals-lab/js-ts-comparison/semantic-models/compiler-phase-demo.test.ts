import { describe, it, expect } from 'vitest';
import { getAstNodeKinds, getInferredTypes, transformConstToLet, demo } from './compiler-phase-demo.js';

describe('compiler-phase-demo', () => {
  const sampleCode = `
function add(a: number, b: number): number {
  return a + b;
}
const result = add(1, 2);
const message: string = "hello";
`;

  it('应正确解析源码并返回顶层 AST 节点类型', () => {
    const kinds = getAstNodeKinds(sampleCode);
    expect(kinds).toContain('FunctionDeclaration');
    // 在 TypeScript 5.x 中，VariableStatement 的反向映射名称为 FirstStatement
    expect(kinds).toContain('FirstStatement');
  });

  it('类型检查器应正确推断变量和函数类型', () => {
    const types = getInferredTypes(sampleCode);
    expect(types.functions.add).toBe('(a: number, b: number) => number');
    expect(types.variables.result).toBe('number');
    expect(types.variables.message).toBe('string');
  });

  it('AST 变换应将 const 转换为 let 并正确打印', () => {
    const output = transformConstToLet(sampleCode);
    expect(output).toContain('let result');
    expect(output).toContain('let message');
    expect(output).not.toContain('const result');
    expect(output).not.toContain('const message');
    // 函数声明应保持不变
    expect(output).toContain('function add(a: number, b: number): number {');
  });

  it('demo() 应无异常执行', () => {
    expect(() => { demo(); }).not.toThrow();
  });
});
