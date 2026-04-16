import { describe, it, expect } from 'vitest';
import { tokenize, parse, inferType, emit } from './compiler-phase-demo.js';

describe('compiler-phase-demo', () => {
  it('词法分析器应正确识别 number, string, identifier, operator, paren', () => {
    const tokens = tokenize('let x = 1 + 2');
    expect(tokens).toEqual([
      { type: 'keyword', value: 'let' },
      { type: 'identifier', value: 'x' },
      { type: 'assign', value: '=' },
      { type: 'number', value: '1' },
      { type: 'operator', value: '+' },
      { type: 'number', value: '2' },
    ]);
  });

  it('词法分析器应正确识别函数声明的关键 token', () => {
    const tokens = tokenize('function add(a, b) { return a + b; }');
    const values = tokens.map((t) => t.value);
    expect(values).toEqual([
      'function', 'add', '(', 'a', ',', 'b', ')', '{', 'return', 'a', '+', 'b', ';', '}',
    ]);
  });

  it('语法分析器应能解析变量声明与二元表达式', () => {
    const ast = parse(tokenize('let x = 1 + 2'));
    expect(ast.kind).toBe('Program');
    expect(ast).toEqual({
      kind: 'Program',
      body: [
        {
          kind: 'VarDecl',
          name: 'x',
          init: {
            kind: 'BinaryExpr',
            op: '+',
            left: { kind: 'NumberLiteral', value: 1 },
            right: { kind: 'NumberLiteral', value: 2 },
          },
        },
      ],
    });
  });

  it('语法分析器应能解析函数声明', () => {
    const ast = parse(tokenize('function add(a, b) { return a + b; }'));
    expect(ast.kind).toBe('Program');
    if (ast.kind !== 'Program') throw new Error('Expected Program');
    const fn = ast.body[0];
    expect(fn.kind).toBe('FnDecl');
    if (fn.kind !== 'FnDecl') throw new Error('Expected FnDecl');
    expect(fn.name).toBe('add');
    expect(fn.params).toEqual(['a', 'b']);
    expect(fn.body[0].kind).toBe('Return');
  });

  it('类型推断应推断 number literal 为 number', () => {
    const ast = parse(tokenize('let x = 42'));
    if (ast.kind !== 'Program') throw new Error('Expected Program');
    const type = inferType(ast.body[0]);
    expect(type).toBe('number');
  });

  it('类型推断应推断 string literal 为 string', () => {
    const ast = parse(tokenize('let msg = "hello"'));
    if (ast.kind !== 'Program') throw new Error('Expected Program');
    const type = inferType(ast.body[0]);
    expect(type).toBe('string');
  });

  it('类型推断应推断二元表达式 1 + 2 为 number', () => {
    const ast = parse(tokenize('let x = 1 + 2'));
    if (ast.kind !== 'Program') throw new Error('Expected Program');
    const type = inferType(ast.body[0]);
    expect(type).toBe('number');
  });

  it('代码生成器应输出擦除类型的 JS 字符串', () => {
    const ast = parse(tokenize('let x = 1 + 2'));
    if (ast.kind !== 'Program') throw new Error('Expected Program');
    const js = emit(ast);
    expect(js).toBe('let x = 1 + 2;');
  });

  it('完整流水线：let x = 1 + 2 → 词法 → 语法 → 推断x为number → 输出 JS', () => {
    const code = 'let x = 1 + 2';
    const tokens = tokenize(code);
    const ast = parse(tokens);
    if (ast.kind !== 'Program') throw new Error('Expected Program');
    const type = inferType(ast.body[0]);
    const js = emit(ast);

    expect(tokens).toHaveLength(6);
    expect(ast.kind).toBe('Program');
    expect(type).toBe('number');
    expect(js).toBe('let x = 1 + 2;');
  });

  it('完整流水线：函数声明 → JS 输出', () => {
    const code = 'function add(a, b) { return a + b; }';
    const ast = parse(tokenize(code));
    const js = emit(ast);
    expect(js).toBe('function add(a, b) {\n  return a + b;\n}');
  });
});
