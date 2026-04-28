/**
 * @file 语法分析器测试
 * @category Advanced Compiler Workshop → Milestone 1 → Tests
 */

import { describe, it, expect } from 'vitest';
import { Lexer } from './src/lexer.js';
import { Parser } from './src/parser.js';
import type { ProgramNode, VariableDeclarationNode, FunctionDeclarationNode, InterfaceDeclarationNode } from './src/ast.js';

function parse(source: string): { ast: ProgramNode; errors: { message: string; line: number; column: number }[] } {
  const lexer = new Lexer(source);
  const { tokens } = lexer.tokenize();
  const parser = new Parser(tokens);
  const ast = parser.parse();
  return { ast, errors: parser.getErrors() };
}

describe('Parser', () => {
  it('parses empty program', () => {
    const { ast, errors } = parse('');
    expect(errors).toHaveLength(0);
    expect(ast.body).toHaveLength(0);
  });

  it('parses variable declaration without type annotation', () => {
    const { ast, errors } = parse('let x = 42;');
    expect(errors).toHaveLength(0);
    expect(ast.body).toHaveLength(1);

    const decl = ast.body[0] as VariableDeclarationNode;
    expect(decl.kind).toBe('VariableDeclaration');
    expect(decl.name).toBe('x');
    expect(decl.isConst).toBe(false);
    expect(decl.typeAnnotation).toBeUndefined();
    expect(decl.initializer?.kind).toBe('NumberLiteral');
  });

  it('parses variable declaration with type annotation', () => {
    const { ast, errors } = parse('let x: number = 42;');
    expect(errors).toHaveLength(0);

    const decl = ast.body[0] as VariableDeclarationNode;
    expect(decl.typeAnnotation?.kind).toBe('PrimitiveType');
    expect((decl.typeAnnotation as any).name).toBe('number');
  });

  it('parses const declaration', () => {
    const { ast, errors } = parse('const PI: number = 3.14;');
    expect(errors).toHaveLength(0);

    const decl = ast.body[0] as VariableDeclarationNode;
    expect(decl.isConst).toBe(true);
    expect(decl.name).toBe('PI');
  });

  it('parses string variable', () => {
    const { ast, errors } = parse('let msg: string = "hello";');
    expect(errors).toHaveLength(0);

    const decl = ast.body[0] as VariableDeclarationNode;
    expect(decl.typeAnnotation?.kind).toBe('PrimitiveType');
    expect((decl.typeAnnotation as any).name).toBe('string');
    expect(decl.initializer?.kind).toBe('StringLiteral');
  });

  it('parses boolean variable', () => {
    const { ast, errors } = parse('let flag: boolean = true;');
    expect(errors).toHaveLength(0);

    const decl = ast.body[0] as VariableDeclarationNode;
    expect((decl.typeAnnotation as any).name).toBe('boolean');
    expect(decl.initializer?.kind).toBe('BooleanLiteral');
  });

  it('parses function declaration', () => {
    const { ast, errors } = parse('function add(a: number, b: number): number { return a + b; }');
    expect(errors).toHaveLength(0);

    const func = ast.body[0] as FunctionDeclarationNode;
    expect(func.kind).toBe('FunctionDeclaration');
    expect(func.name).toBe('add');
    expect(func.parameters).toHaveLength(2);
    expect(func.parameters[0].name).toBe('a');
    expect(func.parameters[0].typeAnnotation.kind).toBe('PrimitiveType');
    expect(func.returnType?.kind).toBe('PrimitiveType');
    expect(func.body.statements).toHaveLength(1);
  });

  it('parses generic function declaration', () => {
    const { ast, errors } = parse('function identity<T>(x: T): T { return x; }');
    expect(errors).toHaveLength(0);

    const func = ast.body[0] as FunctionDeclarationNode;
    expect(func.typeParameters).toEqual(['T']);
    expect(func.parameters[0].typeAnnotation.kind).toBe('IdentifierType');
  });

  it('parses interface declaration', () => {
    const { ast, errors } = parse('interface Point { x: number; y: number; }');
    expect(errors).toHaveLength(0);

    const iface = ast.body[0] as InterfaceDeclarationNode;
    expect(iface.kind).toBe('InterfaceDeclaration');
    expect(iface.name).toBe('Point');
    expect(iface.properties).toHaveLength(2);
    expect(iface.properties[0].name).toBe('x');
    expect(iface.properties[0].type.kind).toBe('PrimitiveType');
    expect(iface.properties[0].optional).toBe(false);
  });

  it('parses interface with optional property', () => {
    const { ast, errors } = parse('interface Config { name: string; debug?: boolean; }');
    expect(errors).toHaveLength(0);

    const iface = ast.body[0] as InterfaceDeclarationNode;
    expect(iface.properties[1].optional).toBe(true);
  });

  it('parses binary expression', () => {
    const { ast, errors } = parse('let sum = 1 + 2 * 3;');
    expect(errors).toHaveLength(0);

    const decl = ast.body[0] as VariableDeclarationNode;
    expect(decl.initializer?.kind).toBe('BinaryExpression');
    // 1 + (2 * 3)  due to precedence
    const bin = decl.initializer as any;
    expect(bin.operator).toBe('+');
    expect(bin.left.kind).toBe('NumberLiteral');
    expect(bin.right.kind).toBe('BinaryExpression');
    expect(bin.right.operator).toBe('*');
  });

  it('parses function call', () => {
    const { ast, errors } = parse('let result = add(1, 2);');
    expect(errors).toHaveLength(0);

    const decl = ast.body[0] as VariableDeclarationNode;
    expect(decl.initializer?.kind).toBe('CallExpression');
    const call = decl.initializer as any;
    expect(call.callee.name).toBe('add');
    expect(call.arguments).toHaveLength(2);
  });

  it('parses array type annotation', () => {
    const { ast, errors } = parse('let arr: number[] = [];');
    expect(errors).toHaveLength(0);

    const decl = ast.body[0] as VariableDeclarationNode;
    expect(decl.typeAnnotation?.kind).toBe('ArrayType');
    expect((decl.typeAnnotation as any).elementType.kind).toBe('PrimitiveType');
  });

  it('parses array literal', () => {
    const { ast, errors } = parse('let arr = [1, 2, 3];');
    expect(errors).toHaveLength(0);

    const decl = ast.body[0] as VariableDeclarationNode;
    expect(decl.initializer?.kind).toBe('ArrayExpression');
    const arr = decl.initializer as any;
    expect(arr.elements).toHaveLength(3);
  });
});
