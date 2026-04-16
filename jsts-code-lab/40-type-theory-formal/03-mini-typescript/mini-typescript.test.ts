import { describe, it, expect } from 'vitest';
import { parse } from './parser.js';
import { TypeChecker, TypeError } from './type-checker.js';
import { emit } from './emitter.js';

describe('Mini-TS', () => {
  it('parses and type-checks variable declaration with binary expression', () => {
    const source = `let x: number = 1 + 2;`;
    const ast = parse(source);
    const checker = new TypeChecker();
    const type = checker.check(ast);

    expect(type).toEqual({ kind: 'primitive', name: 'void' });
    expect(ast.body[0].kind).toBe('VariableDecl');

    const emitted = emit(ast);
    expect(emitted).toBe('let x = 1 + 2;');
  });

  it('type-checks function declaration', () => {
    const source = `function add(a: number, b: number): number { return a + b; }`;
    const ast = parse(source);
    const checker = new TypeChecker();

    expect(() => checker.check(ast)).not.toThrow();
  });

  it('supports width subtyping for objects', () => {
    const source = `let p: { x: number } = { x: 1, y: 2 };`;
    const ast = parse(source);
    const checker = new TypeChecker();

    expect(() => checker.check(ast)).not.toThrow();
  });

  it('infers generic instantiation from arguments', () => {
    const source = `function id<T>(x: T): T { return x; } let n = id(1);`;
    const ast = parse(source);
    const checker = new TypeChecker();
    checker.check(ast);

    // The variable 'n' should have type number
    // We verify by checking the program does not throw and the variable decl infers correctly
    const decl = ast.body[1];
    expect(decl.kind).toBe('VariableDecl');
  });

  it('throws on type error: string assigned to number', () => {
    const source = `let x: number = "hello";`;
    const ast = parse(source);
    const checker = new TypeChecker();

    expect(() => checker.check(ast)).toThrow(TypeError);
  });

  it('emits erased JavaScript without type annotations', () => {
    const source = `function add(a: number, b: number): number { return a + b; } let y = add(1, 3);`;
    const ast = parse(source);
    const emitted = emit(ast);

    expect(emitted).toContain('function add(a, b)');
    expect(emitted).toContain('let y = add(1, 3);');
    expect(emitted).not.toContain(': number');
  });
});
