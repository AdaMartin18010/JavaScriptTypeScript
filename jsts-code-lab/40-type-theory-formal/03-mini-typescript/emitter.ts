// ============================================================
// Mini-TS Emitter: 类型擦除，输出纯 JavaScript
// ============================================================

import type {
  ASTNode,
  Program,
  VariableDecl,
  FunctionDecl,
  ReturnStmt,
  BinaryExpr,
  CallExpr,
  Identifier,
  NumberLiteral,
  StringLiteral,
  ObjectLiteral,
  Statement,
  Expression,
} from './parser.js';

export function emit(node: ASTNode): string {
  switch (node.kind) {
    case 'Program':
      return node.body.map(emit).join('\n');
    case 'VariableDecl':
      return `let ${node.name}${node.initializer ? ' = ' + emit(node.initializer) : ''};`;
    case 'FunctionDecl': {
      const params = node.params.map((p) => p.name).join(', ');
      const body = node.body.map(emit).join('\n');
      return `function ${node.name}(${params}) {\n${indent(body)}\n}`;
    }
    case 'ReturnStmt':
      return node.argument ? `return ${emit(node.argument)};` : 'return;';
    case 'BinaryExpr':
      return `${emit(node.left)} ${node.operator} ${emit(node.right)}`;
    case 'CallExpr':
      return `${emit(node.callee)}(${node.args.map(emit).join(', ')})`;
    case 'Identifier':
      return node.name;
    case 'NumberLiteral':
      return String(node.value);
    case 'StringLiteral':
      return `'${node.value}'`;
    case 'ObjectLiteral': {
      const props = node.properties.map((p) => `${p.key}: ${emit(p.value)}`).join(', ');
      return `{ ${props} }`;
    }
    default:
      throw new Error(`Unknown AST node kind: ${(node as ASTNode).kind}`);
  }
}

function indent(code: string): string {
  return code
    .split('\n')
    .map((line) => (line.trim() ? '  ' + line : line))
    .join('\n');
}
