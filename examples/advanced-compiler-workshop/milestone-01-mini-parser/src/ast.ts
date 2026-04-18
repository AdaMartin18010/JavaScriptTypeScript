/**
 * @file AST 节点定义
 * @category Advanced Compiler Workshop → Milestone 1
 *
 * 定义 Mini-TS 子集的抽象语法树节点。
 * 所有节点均携带 loc（源码位置）信息，用于后续类型错误的精确定位。
 */

// ==================== 位置信息 ====================

export interface Position {
  line: number;
  column: number;
}

export interface SourceLocation {
  start: Position;
  end: Position;
}

// ==================== 类型注解节点 ====================

export type TypeNode =
  | PrimitiveTypeNode
  | IdentifierTypeNode
  | ArrayTypeNode
  | FunctionTypeNode
  | GenericTypeNode;

export interface PrimitiveTypeNode {
  kind: 'PrimitiveType';
  name: 'number' | 'string' | 'boolean' | 'null' | 'undefined' | 'void' | 'never';
  loc?: SourceLocation;
}

export interface IdentifierTypeNode {
  kind: 'IdentifierType';
  name: string;
  loc?: SourceLocation;
}

export interface ArrayTypeNode {
  kind: 'ArrayType';
  elementType: TypeNode;
  loc?: SourceLocation;
}

export interface FunctionTypeNode {
  kind: 'FunctionType';
  params: { name: string; type: TypeNode }[];
  returnType: TypeNode;
  loc?: SourceLocation;
}

export interface GenericTypeNode {
  kind: 'GenericType';
  name: string;
  params: TypeNode[];
  loc?: SourceLocation;
}

// ==================== 表达式节点 ====================

export type ExpressionNode =
  | NumberLiteralNode
  | StringLiteralNode
  | BooleanLiteralNode
  | NullLiteralNode
  | IdentifierNode
  | BinaryExpressionNode
  | CallExpressionNode;

export interface NumberLiteralNode {
  kind: 'NumberLiteral';
  value: number;
  raw: string;
  loc?: SourceLocation;
}

export interface StringLiteralNode {
  kind: 'StringLiteral';
  value: string;
  loc?: SourceLocation;
}

export interface BooleanLiteralNode {
  kind: 'BooleanLiteral';
  value: boolean;
  loc?: SourceLocation;
}

export interface NullLiteralNode {
  kind: 'NullLiteral';
  loc?: SourceLocation;
}

export interface IdentifierNode {
  kind: 'Identifier';
  name: string;
  loc?: SourceLocation;
}

export interface BinaryExpressionNode {
  kind: 'BinaryExpression';
  operator: '+' | '-' | '*' | '/' | '==' | '!=' | '===' | '!==' | '<' | '>' | '<=' | '>=';
  left: ExpressionNode;
  right: ExpressionNode;
  loc?: SourceLocation;
}

export interface CallExpressionNode {
  kind: 'CallExpression';
  callee: IdentifierNode;
  arguments: ExpressionNode[];
  typeArguments?: TypeNode[]; // 显式泛型参数，如 id<number>(42)
  loc?: SourceLocation;
}

// ==================== 语句节点 ====================

export type StatementNode =
  | VariableDeclarationNode
  | FunctionDeclarationNode
  | InterfaceDeclarationNode
  | ExpressionStatementNode
  | BlockStatementNode
  | ReturnStatementNode;

export interface VariableDeclarationNode {
  kind: 'VariableDeclaration';
  name: string;
  typeAnnotation?: TypeNode;
  initializer?: ExpressionNode;
  isConst: boolean;
  loc?: SourceLocation;
}

export interface ParameterNode {
  name: string;
  typeAnnotation: TypeNode;
  loc?: SourceLocation;
}

export interface FunctionDeclarationNode {
  kind: 'FunctionDeclaration';
  name: string;
  typeParameters: string[];
  parameters: ParameterNode[];
  returnType?: TypeNode;
  body: BlockStatementNode;
  loc?: SourceLocation;
}

export interface PropertySignatureNode {
  kind: 'PropertySignature';
  name: string;
  type: TypeNode;
  optional: boolean;
  loc?: SourceLocation;
}

export interface InterfaceDeclarationNode {
  kind: 'InterfaceDeclaration';
  name: string;
  properties: PropertySignatureNode[];
  loc?: SourceLocation;
}

export interface ExpressionStatementNode {
  kind: 'ExpressionStatement';
  expression: ExpressionNode;
  loc?: SourceLocation;
}

export interface BlockStatementNode {
  kind: 'BlockStatement';
  statements: StatementNode[];
  loc?: SourceLocation;
}

export interface ReturnStatementNode {
  kind: 'ReturnStatement';
  argument?: ExpressionNode;
  loc?: SourceLocation;
}

// ==================== 程序节点 ====================

export interface ProgramNode {
  kind: 'Program';
  body: StatementNode[];
  loc?: SourceLocation;
}

// ==================== AST 工具 ====================

/**
 * 将 AST 序列化为格式化的 JSON 字符串（用于调试）
 */
export function astToJson(node: ProgramNode): string {
  return JSON.stringify(
    node,
    (key, value) => {
      // 省略 loc 以减小输出，除非显式需要
      if (key === 'loc') return undefined;
      return value;
    },
    2
  );
}

/**
 * 遍历 AST，对每个节点调用 visitor
 */
export function walkAst(
  node: unknown,
  visitor: { enter?: (n: unknown) => void; exit?: (n: unknown) => void }
): void {
  if (!node || typeof node !== 'object') return;

  if (visitor.enter) visitor.enter(node);

  for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
    if (key === 'loc') continue;
    if (Array.isArray(value)) {
      for (const item of value) {
        walkAst(item, visitor);
      }
    } else if (value && typeof value === 'object' && 'kind' in value) {
      walkAst(value, visitor);
    }
  }

  if (visitor.exit) visitor.exit(node);
}
