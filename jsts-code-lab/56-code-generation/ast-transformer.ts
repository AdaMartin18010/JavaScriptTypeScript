/**
 * @file AST 代码转换器
 * @category Code Generation → AST Transformation
 * @difficulty hard
 * @tags ast, code-transformation, babel, typescript, source-map
 *
 * @description
 * AST 驱动的代码转换工具集，支持 Babel 风格的遍历器和常见代码重构操作。
 *
 * 功能：
 * - Babel 风格 AST 遍历（enter/exit/visitor）
 * - 常见转换：插入日志、包裹函数、重命名标识符
 * - TypeScript Compiler API 集成模式
 * - Source Map 映射关系维护
 */

// ==================== AST 节点定义（简化 ESTree）====================

export type NodeType =
  | 'Program' | 'FunctionDeclaration' | 'FunctionExpression' | 'ArrowFunctionExpression'
  | 'BlockStatement' | 'ExpressionStatement' | 'ReturnStatement'
  | 'CallExpression' | 'MemberExpression' | 'BinaryExpression'
  | 'Identifier' | 'Literal' | 'VariableDeclaration' | 'VariableDeclarator'
  | 'IfStatement' | 'TryStatement' | 'CatchClause'
  | 'ObjectExpression' | 'Property' | 'ArrayExpression';

export interface BaseNode {
  type: NodeType;
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } };
}

export interface Identifier extends BaseNode {
  type: 'Identifier';
  name: string;
}

export interface Literal extends BaseNode {
  type: 'Literal';
  value: string | number | boolean | null;
  raw?: string;
}

export interface BlockStatement extends BaseNode {
  type: 'BlockStatement';
  body: Statement[];
}

export interface ExpressionStatement extends BaseNode {
  type: 'ExpressionStatement';
  expression: Expression;
}

export interface ReturnStatement extends BaseNode {
  type: 'ReturnStatement';
  argument: Expression | null;
}

export interface IfStatement extends BaseNode {
  type: 'IfStatement';
  test: Expression;
  consequent: Statement;
  alternate?: Statement | null;
}

export interface TryStatement extends BaseNode {
  type: 'TryStatement';
  block: BlockStatement;
  handler: CatchClause | null;
  finalizer: BlockStatement | null;
}

export interface CatchClause extends BaseNode {
  type: 'CatchClause';
  param: Identifier | null;
  body: BlockStatement;
}

export interface VariableDeclaration extends BaseNode {
  type: 'VariableDeclaration';
  kind: 'var' | 'let' | 'const';
  declarations: VariableDeclarator[];
}

export interface VariableDeclarator extends BaseNode {
  type: 'VariableDeclarator';
  id: Identifier;
  init: Expression | null;
}

export interface FunctionDeclaration extends BaseNode {
  type: 'FunctionDeclaration';
  id: Identifier | null;
  params: Identifier[];
  body: BlockStatement;
  async: boolean;
}

export interface FunctionExpression extends BaseNode {
  type: 'FunctionExpression';
  id: Identifier | null;
  params: Identifier[];
  body: BlockStatement;
  async: boolean;
}

export interface ArrowFunctionExpression extends BaseNode {
  type: 'ArrowFunctionExpression';
  params: Identifier[];
  body: BlockStatement | Expression;
  expression: boolean;
  async: boolean;
}

export interface CallExpression extends BaseNode {
  type: 'CallExpression';
  callee: Expression;
  arguments: Expression[];
}

export interface MemberExpression extends BaseNode {
  type: 'MemberExpression';
  object: Expression;
  property: Identifier;
  computed: boolean;
}

export interface BinaryExpression extends BaseNode {
  type: 'BinaryExpression';
  operator: string;
  left: Expression;
  right: Expression;
}

export interface ArrayExpression extends BaseNode {
  type: 'ArrayExpression';
  elements: (Expression | null)[];
}

export interface Property extends BaseNode {
  type: 'Property';
  key: Identifier;
  value: Expression;
}

export interface ObjectExpression extends BaseNode {
  type: 'ObjectExpression';
  properties: Property[];
}

export interface Program extends BaseNode {
  type: 'Program';
  body: Statement[];
}

export type Expression =
  | Identifier | Literal | CallExpression | MemberExpression
  | BinaryExpression | FunctionExpression | ArrowFunctionExpression
  | ObjectExpression | ArrayExpression;

export type Statement =
  | ExpressionStatement | ReturnStatement | BlockStatement
  | VariableDeclaration | FunctionDeclaration | IfStatement | TryStatement;

export type ASTNode = Program | Statement | Expression | VariableDeclarator | Property | CatchClause;

// ==================== Source Map 映射 ====================

export interface SourceMapMapping {
  originalLine: number;
  originalColumn: number;
  generatedLine: number;
  generatedColumn: number;
  source: string;
  name?: string;
}

export class SourceMapTracker {
  private mappings: SourceMapMapping[] = [];

  addMapping(mapping: SourceMapMapping): void {
    this.mappings.push(mapping);
  }

  getMappings(): SourceMapMapping[] {
    return [...this.mappings];
  }

  shiftLines(startLine: number, offset: number): void {
    for (const m of this.mappings) {
      if (m.generatedLine >= startLine) {
        m.generatedLine += offset;
      }
    }
  }
}

// ==================== Babel 风格遍历器 ====================

export type VisitorEnter<T extends ASTNode = ASTNode> = (node: T, parent: ASTNode | null, path: string[]) => void | boolean;
export type VisitorExit<T extends ASTNode = ASTNode> = (node: T, parent: ASTNode | null, path: string[]) => void;

export interface Visitor {
  enter?: VisitorEnter;
  exit?: VisitorExit;
  [key: string]: VisitorEnter | { enter?: VisitorEnter; exit?: VisitorExit } | undefined;
}

export class ASTTransformer {
  private sourceMap: SourceMapTracker;

  constructor(sourceMap = new SourceMapTracker()) {
    this.sourceMap = sourceMap;
  }

  /**
   * Babel 风格遍历 AST
   */
  traverse(node: ASTNode, visitor: Visitor, parent: ASTNode | null = null, path: string[] = []): void {
    const shouldSkip = visitor.enter?.(node, parent, path);
    if (shouldSkip === false) return;

    const typeHandler = visitor[node.type];
    if (typeHandler && typeof typeHandler === 'object' && typeHandler.enter) {
      const result = typeHandler.enter(node, parent, path);
      if (result === false) return;
    } else if (typeof typeHandler === 'function') {
      const result = typeHandler(node, parent, path);
      if (result === false) return;
    }

    this.traverseChildren(node, visitor, path);

    if (typeHandler && typeof typeHandler === 'object' && typeHandler.exit) {
      typeHandler.exit(node, parent, path);
    }
    visitor.exit?.(node, parent, path);
  }

  /**
   * 为所有函数体插入日志语句
   */
  addLogging(node: Program, logLevel = 'debug'): Program {
    const clone = this.deepClone(node);
    const loggerName = `console.${logLevel}`;

    this.traverse(clone, {
      enter: (n) => {
        if (n.type === 'FunctionDeclaration' || n.type === 'FunctionExpression' || n.type === 'ArrowFunctionExpression') {
          const func = n as FunctionDeclaration | FunctionExpression | ArrowFunctionExpression;
          const body = func.body.type === 'BlockStatement'
            ? func.body
            : { type: 'BlockStatement' as const, body: [{ type: 'ExpressionStatement' as const, expression: func.body as Expression }] };

          const funcName = func.type === 'FunctionDeclaration' && func.id
            ? func.id.name
            : '<anonymous>';

          const logStmt: ExpressionStatement = {
            type: 'ExpressionStatement',
            expression: {
              type: 'CallExpression',
              callee: {
                type: 'MemberExpression',
                object: { type: 'Identifier', name: 'console' },
                property: { type: 'Identifier', name: logLevel },
                computed: false
              },
              arguments: [
                { type: 'Literal', value: `[ENTER] ${funcName}`, raw: `"[ENTER] ${funcName}"` }
              ]
            }
          };

          body.body.unshift(logStmt);

          if (func.body.type !== 'BlockStatement') {
            (func as ArrowFunctionExpression).body = body;
            (func as ArrowFunctionExpression).expression = false;
          }

          this.sourceMap.shiftLines((func.loc?.start.line ?? 1) + 1, 1);
        }
      }
    });

    return clone;
  }

  /**
   * 为函数体包裹 try/catch
   */
  wrapWithTryCatch(node: Program): Program {
    const clone = this.deepClone(node);

    this.traverse(clone, {
      enter: (n) => {
        if (n.type === 'FunctionDeclaration' || n.type === 'FunctionExpression') {
          const func = n as FunctionDeclaration | FunctionExpression;
          const originalBody = func.body;

          const wrapped: TryStatement = {
            type: 'TryStatement',
            block: originalBody,
            handler: {
              type: 'CatchClause',
              param: { type: 'Identifier', name: 'error' },
              body: {
                type: 'BlockStatement',
                body: [
                  {
                    type: 'ExpressionStatement',
                    expression: {
                      type: 'CallExpression',
                      callee: {
                        type: 'MemberExpression',
                        object: { type: 'Identifier', name: 'console' },
                        property: { type: 'Identifier', name: 'error' },
                        computed: false
                      },
                      arguments: [
                        { type: 'Literal', value: 'Function execution failed:', raw: '"Function execution failed:"' },
                        { type: 'Identifier', name: 'error' }
                      ]
                    }
                  },
                  { type: 'ThrowStatement', argument: { type: 'Identifier', name: 'error' } }
                ]
              }
            },
            finalizer: null
          };

          func.body = {
            type: 'BlockStatement',
            body: [wrapped]
          };

          this.sourceMap.shiftLines((func.loc?.start.line ?? 1) + 1, 3);
        }
      }
    });

    return clone;
  }

  /**
   * 重命名标识符
   */
  renameIdentifiers(node: Program, renameMap: Record<string, string>): Program {
    const clone = this.deepClone(node);

    this.traverse(clone, {
      enter: (n) => {
        if (n.type === 'Identifier' && renameMap[n.name]) {
          (n as Identifier).name = renameMap[n.name];
        }
      }
    });

    return clone;
  }

  /**
   * TypeScript Compiler API 集成模式：模拟 ts.createSourceFile + ts.forEachChild
   */
  simulateTsCompilerApi(sourceCode: string): {
    sourceFile: { fileName: string; text: string; statements: string[] };
    forEachChild: (callback: (node: string) => void) => void;
  } {
    const statements = sourceCode
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('//'));

    return {
      sourceFile: {
        fileName: 'input.ts',
        text: sourceCode,
        statements
      },
      forEachChild: (callback) => {
        for (const stmt of statements) {
          callback(stmt);
        }
      }
    };
  }

  getSourceMap(): SourceMapTracker {
    return this.sourceMap;
  }

  private traverseChildren(node: ASTNode, visitor: Visitor, path: string[]): void {
    const childKeys = this.getChildKeys(node);
    for (const key of childKeys) {
      const child = (node as Record<string, unknown>)[key];
      if (Array.isArray(child)) {
        for (let i = 0; i < child.length; i++) {
          if (this.isNode(child[i])) {
            this.traverse(child[i] as ASTNode, visitor, node, [...path, key, String(i)]);
          }
        }
      } else if (this.isNode(child)) {
        this.traverse(child as ASTNode, visitor, node, [...path, key]);
      }
    }
  }

  private getChildKeys(node: ASTNode): string[] {
    const map: Record<string, string[]> = {
      Program: ['body'],
      FunctionDeclaration: ['id', 'params', 'body'],
      FunctionExpression: ['id', 'params', 'body'],
      ArrowFunctionExpression: ['params', 'body'],
      BlockStatement: ['body'],
      ExpressionStatement: ['expression'],
      ReturnStatement: ['argument'],
      IfStatement: ['test', 'consequent', 'alternate'],
      TryStatement: ['block', 'handler', 'finalizer'],
      CatchClause: ['param', 'body'],
      VariableDeclaration: ['declarations'],
      VariableDeclarator: ['id', 'init'],
      CallExpression: ['callee', 'arguments'],
      MemberExpression: ['object', 'property'],
      BinaryExpression: ['left', 'right'],
      ArrayExpression: ['elements'],
      ObjectExpression: ['properties'],
      Property: ['key', 'value']
    };
    return map[node.type] || [];
  }

  private isNode(value: unknown): value is ASTNode {
    return value !== null && typeof value === 'object' && 'type' in value;
  }

  private deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }
}

// ==================== 演示 ====================

export async function demo(): Promise<void> {
  console.log('=== AST 代码转换器 ===\n');

  const sampleAst: Program = {
    type: 'Program',
    body: [
      {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'calculate' },
        params: [
          { type: 'Identifier', name: 'a' },
          { type: 'Identifier', name: 'b' }
        ],
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ReturnStatement',
              argument: {
                type: 'BinaryExpression',
                operator: '+',
                left: { type: 'Identifier', name: 'a' },
                right: { type: 'Identifier', name: 'b' }
              }
            }
          ]
        },
        async: false
      }
    ]
  };

  const transformer = new ASTTransformer();

  // 添加日志
  console.log('--- 添加日志 ---');
  const withLogging = transformer.addLogging(sampleAst, 'log');
  console.log('函数体语句数:', (withLogging.body[0] as FunctionDeclaration).body.body.length);

  // 重命名
  console.log('\n--- 重命名标识符 ---');
  const renamed = transformer.renameIdentifiers(sampleAst, { calculate: 'compute', a: 'x', b: 'y' });
  const func = renamed.body[0] as FunctionDeclaration;
  console.log('新函数名:', func.id?.name);
  console.log('参数:', func.params.map(p => p.name).join(', '));

  // 包裹 try/catch
  console.log('\n--- 包裹 Try/Catch ---');
  const wrapped = transformer.wrapWithTryCatch(sampleAst);
  const wrappedBody = (wrapped.body[0] as FunctionDeclaration).body.body[0];
  console.log('首语句类型:', wrappedBody.type);

  // TypeScript Compiler API 模拟
  console.log('\n--- TypeScript Compiler API 模拟 ---');
  const tsLike = transformer.simulateTsCompilerApi(`
const x = 1;
function add(a: number, b: number) { return a + b; }
export { add };
`);
  console.log('文件名:', tsLike.sourceFile.fileName);
  console.log('语句数:', tsLike.sourceFile.statements.length);
}
