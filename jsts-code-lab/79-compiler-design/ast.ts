/**
 * @file 抽象语法树 (AST) 定义与操作
 * @category Compiler Design → AST
 * @difficulty hard
 * @tags compiler, ast, tree-traversal, code-transformation
 *
 * @description
 * 完整的 AST 定义、遍历器和转换器实现。
 *
 * AST 操作：
 * - 遍历 (Traversal): 访问者模式、递归遍历
 * - 转换 (Transformation): 代码转换、优化
 * - 生成 (Generation): 代码生成
 * - 验证 (Validation): 语义检查
 */

// ==================== AST 节点类型 ====================

export type NodeType =
  | 'Program'
  | 'VariableDeclaration'
  | 'FunctionDeclaration'
  | 'ClassDeclaration'
  | 'MethodDefinition'
  | 'BlockStatement'
  | 'ExpressionStatement'
  | 'IfStatement'
  | 'SwitchStatement'
  | 'SwitchCase'
  | 'WhileStatement'
  | 'DoWhileStatement'
  | 'ForStatement'
  | 'ForInStatement'
  | 'ForOfStatement'
  | 'BreakStatement'
  | 'ContinueStatement'
  | 'ReturnStatement'
  | 'ThrowStatement'
  | 'TryStatement'
  | 'CatchClause'
  | 'WithStatement'
  | 'LabeledStatement'
  | 'DebuggerStatement'
  | 'EmptyStatement'
  // 表达式
  | 'BinaryExpression'
  | 'UnaryExpression'
  | 'UpdateExpression'
  | 'AssignmentExpression'
  | 'LogicalExpression'
  | 'ConditionalExpression'
  | 'CallExpression'
  | 'NewExpression'
  | 'MemberExpression'
  | 'ArrayExpression'
  | 'ObjectExpression'
  | 'Property'
  | 'SpreadElement'
  | 'SequenceExpression'
  | 'ArrowFunctionExpression'
  | 'YieldExpression'
  | 'AwaitExpression'
  | 'TemplateLiteral'
  | 'TaggedTemplateExpression'
  | 'TemplateElement'
  | 'ChainExpression'
  | 'ImportExpression'
  // 字面量和标识符
  | 'Identifier'
  | 'Literal'
  | 'RegExpLiteral'
  | 'ThisExpression'
  | 'Super'
  // 模式
  | 'ArrayPattern'
  | 'ObjectPattern'
  | 'RestElement'
  | 'AssignmentPattern'
  // 模块
  | 'ImportDeclaration'
  | 'ExportNamedDeclaration'
  | 'ExportDefaultDeclaration'
  | 'ExportAllDeclaration'
  | 'ImportSpecifier'
  | 'ImportDefaultSpecifier'
  | 'ImportNamespaceSpecifier'
  | 'ExportSpecifier';

export interface Position {
  line: number;
  column: number;
}

export interface SourceLocation {
  start: Position;
  end: Position;
  source?: string;
}

export interface Node {
  type: NodeType;
  loc?: SourceLocation;
  range?: [number, number];
}

// 程序
export interface Program extends Node {
  type: 'Program';
  body: Statement[];
  sourceType: 'script' | 'module';
}

// 语句
export type Statement =
  | Declaration
  | BlockStatement
  | ExpressionStatement
  | IfStatement
  | SwitchStatement
  | WhileStatement
  | DoWhileStatement
  | ForStatement
  | ForInStatement
  | ForOfStatement
  | BreakStatement
  | ContinueStatement
  | ReturnStatement
  | ThrowStatement
  | TryStatement
  | WithStatement
  | LabeledStatement
  | DebuggerStatement
  | EmptyStatement;

// 声明
export type Declaration =
  | VariableDeclaration
  | FunctionDeclaration
  | ClassDeclaration
  | ImportDeclaration
  | ExportNamedDeclaration
  | ExportDefaultDeclaration
  | ExportAllDeclaration;

export interface VariableDeclaration extends Node {
  type: 'VariableDeclaration';
  kind: 'var' | 'let' | 'const';
  declarations: VariableDeclarator[];
}

export interface VariableDeclarator extends Node {
  type: 'VariableDeclarator';
  id: Pattern;
  init: Expression | null;
}

export interface FunctionDeclaration extends Node {
  type: 'FunctionDeclaration';
  id: Identifier | null;
  params: Pattern[];
  body: BlockStatement;
  generator: boolean;
  async: boolean;
}

export interface ClassDeclaration extends Node {
  type: 'ClassDeclaration';
  id: Identifier;
  superClass: Expression | null;
  body: ClassBody;
}

export interface ClassBody extends Node {
  type: 'ClassBody';
  body: MethodDefinition[];
}

export interface MethodDefinition extends Node {
  type: 'MethodDefinition';
  key: Expression;
  value: FunctionExpression;
  kind: 'method' | 'get' | 'set' | 'constructor';
  computed: boolean;
  static: boolean;
}

// 控制流语句
export interface BlockStatement extends Node {
  type: 'BlockStatement';
  body: Statement[];
}

export interface ExpressionStatement extends Node {
  type: 'ExpressionStatement';
  expression: Expression;
}

export interface IfStatement extends Node {
  type: 'IfStatement';
  test: Expression;
  consequent: Statement;
  alternate: Statement | null;
}

export interface SwitchStatement extends Node {
  type: 'SwitchStatement';
  discriminant: Expression;
  cases: SwitchCase[];
}

export interface SwitchCase extends Node {
  type: 'SwitchCase';
  test: Expression | null;
  consequent: Statement[];
}

export interface WhileStatement extends Node {
  type: 'WhileStatement';
  test: Expression;
  body: Statement;
}

export interface DoWhileStatement extends Node {
  type: 'DoWhileStatement';
  body: Statement;
  test: Expression;
}

export interface ForStatement extends Node {
  type: 'ForStatement';
  init: VariableDeclaration | Expression | null;
  test: Expression | null;
  update: Expression | null;
  body: Statement;
}

export interface ForInStatement extends Node {
  type: 'ForInStatement';
  left: VariableDeclaration | Pattern;
  right: Expression;
  body: Statement;
}

export interface ForOfStatement extends Node {
  type: 'ForOfStatement';
  left: VariableDeclaration | Pattern;
  right: Expression;
  body: Statement;
  await: boolean;
}

export interface BreakStatement extends Node {
  type: 'BreakStatement';
  label: Identifier | null;
}

export interface ContinueStatement extends Node {
  type: 'ContinueStatement';
  label: Identifier | null;
}

export interface ReturnStatement extends Node {
  type: 'ReturnStatement';
  argument: Expression | null;
}

export interface ThrowStatement extends Node {
  type: 'ThrowStatement';
  argument: Expression;
}

export interface TryStatement extends Node {
  type: 'TryStatement';
  block: BlockStatement;
  handler: CatchClause | null;
  finalizer: BlockStatement | null;
}

export interface CatchClause extends Node {
  type: 'CatchClause';
  param: Pattern | null;
  body: BlockStatement;
}

export interface WithStatement extends Node {
  type: 'WithStatement';
  object: Expression;
  body: Statement;
}

export interface LabeledStatement extends Node {
  type: 'LabeledStatement';
  label: Identifier;
  body: Statement;
}

export interface DebuggerStatement extends Node {
  type: 'DebuggerStatement';
}

export interface EmptyStatement extends Node {
  type: 'EmptyStatement';
}

// 表达式
export type Expression =
  | BinaryExpression
  | UnaryExpression
  | UpdateExpression
  | AssignmentExpression
  | LogicalExpression
  | ConditionalExpression
  | CallExpression
  | NewExpression
  | MemberExpression
  | ArrayExpression
  | ObjectExpression
  | SequenceExpression
  | ArrowFunctionExpression
  | FunctionExpression
  | YieldExpression
  | AwaitExpression
  | TemplateLiteral
  | TaggedTemplateExpression
  | ChainExpression
  | ImportExpression
  | Identifier
  | Literal
  | ThisExpression
  | Super;

export interface BinaryExpression extends Node {
  type: 'BinaryExpression';
  operator: '+' | '-' | '*' | '/' | '%' | '**' | '|' | '^' | '&' | 'in' | 'instanceof';
  left: Expression;
  right: Expression;
}

export interface UnaryExpression extends Node {
  type: 'UnaryExpression';
  operator: '+' | '-' | '~' | '!' | 'typeof' | 'void' | 'delete' | 'await';
  argument: Expression;
  prefix: boolean;
}

export interface UpdateExpression extends Node {
  type: 'UpdateExpression';
  operator: '++' | '--';
  argument: Expression;
  prefix: boolean;
}

export interface AssignmentExpression extends Node {
  type: 'AssignmentExpression';
  operator: '=' | '+=' | '-=' | '*=' | '/=' | '%=' | '**=' | '|=' | '^=' | '&=';
  left: Pattern | MemberExpression;
  right: Expression;
}

export interface LogicalExpression extends Node {
  type: 'LogicalExpression';
  operator: '||' | '&&' | '??';
  left: Expression;
  right: Expression;
}

export interface ConditionalExpression extends Node {
  type: 'ConditionalExpression';
  test: Expression;
  alternate: Expression;
  consequent: Expression;
}

export interface CallExpression extends Node {
  type: 'CallExpression';
  callee: Expression;
  arguments: Expression[];
}

export interface NewExpression extends Node {
  type: 'NewExpression';
  callee: Expression;
  arguments: Expression[];
}

export interface MemberExpression extends Node {
  type: 'MemberExpression';
  object: Expression;
  property: Expression;
  computed: boolean;
  optional?: boolean;
}

export interface ArrayExpression extends Node {
  type: 'ArrayExpression';
  elements: (Expression | SpreadElement | null)[];
}

export interface ObjectExpression extends Node {
  type: 'ObjectExpression';
  properties: Property[];
}

export interface Property extends Node {
  type: 'Property';
  key: Expression;
  value: Expression;
  kind: 'init' | 'get' | 'set';
  method: boolean;
  shorthand: boolean;
  computed: boolean;
}

export interface SpreadElement extends Node {
  type: 'SpreadElement';
  argument: Expression;
}

export interface SequenceExpression extends Node {
  type: 'SequenceExpression';
  expressions: Expression[];
}

export interface ArrowFunctionExpression extends Node {
  type: 'ArrowFunctionExpression';
  id: null;
  params: Pattern[];
  body: BlockStatement | Expression;
  expression: boolean;
  generator: boolean;
  async: boolean;
}

export interface FunctionExpression extends Node {
  type: 'FunctionExpression';
  id: Identifier | null;
  params: Pattern[];
  body: BlockStatement;
  generator: boolean;
  async: boolean;
}

export interface YieldExpression extends Node {
  type: 'YieldExpression';
  argument: Expression | null;
  delegate: boolean;
}

export interface AwaitExpression extends Node {
  type: 'AwaitExpression';
  argument: Expression;
}

export interface TemplateLiteral extends Node {
  type: 'TemplateLiteral';
  quasis: TemplateElement[];
  expressions: Expression[];
}

export interface TaggedTemplateExpression extends Node {
  type: 'TaggedTemplateExpression';
  tag: Expression;
  quasi: TemplateLiteral;
}

export interface TemplateElement extends Node {
  type: 'TemplateElement';
  value: {
    raw: string;
    cooked: string;
  };
  tail: boolean;
}

export interface ChainExpression extends Node {
  type: 'ChainExpression';
  expression: MemberExpression | CallExpression;
}

export interface ImportExpression extends Node {
  type: 'ImportExpression';
  source: Expression;
}

// 字面量和标识符
export interface Identifier extends Node {
  type: 'Identifier';
  name: string;
}

export interface Literal extends Node {
  type: 'Literal';
  value: string | number | boolean | null | bigint;
  raw?: string;
}

export interface RegExpLiteral extends Node {
  type: 'Literal';
  value: null;
  raw: string;
  regex: {
    pattern: string;
    flags: string;
  };
}

export interface ThisExpression extends Node {
  type: 'ThisExpression';
}

export interface Super extends Node {
  type: 'Super';
}

// 模式（用于解构赋值）
export type Pattern = Identifier | MemberExpression | ArrayPattern | ObjectPattern | RestElement | AssignmentPattern;

export interface ArrayPattern extends Node {
  type: 'ArrayPattern';
  elements: (Pattern | null)[];
}

export interface ObjectPattern extends Node {
  type: 'ObjectPattern';
  properties: (Property | RestElement)[];
}

export interface RestElement extends Node {
  type: 'RestElement';
  argument: Pattern;
}

export interface AssignmentPattern extends Node {
  type: 'AssignmentPattern';
  left: Pattern;
  right: Expression;
}

// 模块
export interface ImportDeclaration extends Node {
  type: 'ImportDeclaration';
  specifiers: (ImportSpecifier | ImportDefaultSpecifier | ImportNamespaceSpecifier)[];
  source: Literal;
}

export interface ImportSpecifier extends Node {
  type: 'ImportSpecifier';
  local: Identifier;
  imported: Identifier;
}

export interface ImportDefaultSpecifier extends Node {
  type: 'ImportDefaultSpecifier';
  local: Identifier;
}

export interface ImportNamespaceSpecifier extends Node {
  type: 'ImportNamespaceSpecifier';
  local: Identifier;
}

export interface ExportNamedDeclaration extends Node {
  type: 'ExportNamedDeclaration';
  declaration: Declaration | null;
  specifiers: ExportSpecifier[];
  source: Literal | null;
}

export interface ExportDefaultDeclaration extends Node {
  type: 'ExportDefaultDeclaration';
  declaration: Declaration | Expression;
}

export interface ExportAllDeclaration extends Node {
  type: 'ExportAllDeclaration';
  source: Literal;
  exported: Identifier | null;
}

export interface ExportSpecifier extends Node {
  type: 'ExportSpecifier';
  local: Identifier;
  exported: Identifier;
}

// ==================== AST 遍历器 ====================

export type VisitorFunction<T extends Node> = (node: T, parent: Node | null, path: string[]) => void | boolean;

export interface Visitor {
  enter?: VisitorFunction<Node>;
  exit?: VisitorFunction<Node>;
  [key: string]: VisitorFunction<any> | { enter?: VisitorFunction<any>; exit?: VisitorFunction<any> } | undefined;
}

export class ASTTraverser {
  private visitor: Visitor;

  constructor(visitor: Visitor) {
    this.visitor = visitor;
  }

  traverse(node: Node, parent: Node | null = null, path: string[] = []): void {
    // 调用通用 enter
    if (this.visitor.enter) {
      const result = this.visitor.enter(node, parent, path);
      if (result === false) return; // 跳过子节点
    }

    // 调用特定类型的 enter
    const typeHandler = this.visitor[node.type];
    if (typeHandler && typeof typeHandler === 'object' && typeHandler.enter) {
      const result = typeHandler.enter(node, parent, path);
      if (result === false) return;
    } else if (typeof typeHandler === 'function') {
      const result = typeHandler(node, parent, path);
      if (result === false) return;
    }

    // 遍历子节点
    this.traverseChildren(node, path);

    // 调用特定类型的 exit
    if (typeHandler && typeof typeHandler === 'object' && typeHandler.exit) {
      typeHandler.exit(node, parent, path);
    }

    // 调用通用 exit
    if (this.visitor.exit) {
      this.visitor.exit(node, parent, path);
    }
  }

  private traverseChildren(node: Node, path: string[]): void {
    const keys = this.getChildKeys(node);

    for (const key of keys) {
      const child = (node as any)[key];

      if (Array.isArray(child)) {
        for (let i = 0; i < child.length; i++) {
          if (child[i] && this.isNode(child[i])) {
            this.traverse(child[i], node, [...path, key, String(i)]);
          }
        }
      } else if (child && this.isNode(child)) {
        this.traverse(child, node, [...path, key]);
      }
    }
  }

  private getChildKeys(node: Node): string[] {
    const childKeys: Record<string, string[]> = {
      Program: ['body'],
      VariableDeclaration: ['declarations'],
      VariableDeclarator: ['id', 'init'],
      FunctionDeclaration: ['id', 'params', 'body'],
      FunctionExpression: ['id', 'params', 'body'],
      ClassDeclaration: ['id', 'superClass', 'body'],
      ClassBody: ['body'],
      MethodDefinition: ['key', 'value'],
      BlockStatement: ['body'],
      ExpressionStatement: ['expression'],
      IfStatement: ['test', 'consequent', 'alternate'],
      SwitchStatement: ['discriminant', 'cases'],
      SwitchCase: ['test', 'consequent'],
      WhileStatement: ['test', 'body'],
      DoWhileStatement: ['body', 'test'],
      ForStatement: ['init', 'test', 'update', 'body'],
      ForInStatement: ['left', 'right', 'body'],
      ForOfStatement: ['left', 'right', 'body'],
      ReturnStatement: ['argument'],
      ThrowStatement: ['argument'],
      TryStatement: ['block', 'handler', 'finalizer'],
      CatchClause: ['param', 'body'],
      WithStatement: ['object', 'body'],
      LabeledStatement: ['label', 'body'],
      // 表达式
      BinaryExpression: ['left', 'right'],
      UnaryExpression: ['argument'],
      UpdateExpression: ['argument'],
      AssignmentExpression: ['left', 'right'],
      LogicalExpression: ['left', 'right'],
      ConditionalExpression: ['test', 'consequent', 'alternate'],
      CallExpression: ['callee', 'arguments'],
      NewExpression: ['callee', 'arguments'],
      MemberExpression: ['object', 'property'],
      ArrayExpression: ['elements'],
      ObjectExpression: ['properties'],
      Property: ['key', 'value'],
      SpreadElement: ['argument'],
      SequenceExpression: ['expressions'],
      ArrowFunctionExpression: ['params', 'body'],
      YieldExpression: ['argument'],
      AwaitExpression: ['argument'],
      TemplateLiteral: ['quasis', 'expressions'],
      TaggedTemplateExpression: ['tag', 'quasi'],
      ChainExpression: ['expression'],
      ImportExpression: ['source'],
      // 模块
      ImportDeclaration: ['specifiers', 'source'],
      ExportNamedDeclaration: ['declaration', 'specifiers', 'source'],
      ExportDefaultDeclaration: ['declaration'],
      ExportAllDeclaration: ['source', 'exported']
    };

    return childKeys[node.type] || [];
  }

  private isNode(value: any): value is Node {
    return value && typeof value === 'object' && 'type' in value;
  }
}

// ==================== AST 操作工具 ====================

export class ASTUtils {
  /**
   * 创建节点
   */
  static createNode<T extends Node>(type: T['type'], props: Omit<T, 'type'>): T {
    return { type, ...props } as T;
  }

  /**
   * 克隆节点
   */
  static clone<T extends Node>(node: T): T {
    return JSON.parse(JSON.stringify(node));
  }

  /**
   * 查找所有指定类型的节点
   */
  static findAll<T extends Node>(root: Node, type: T['type']): T[] {
    const results: T[] = [];
    
    const traverser = new ASTTraverser({
      enter: (node) => {
        if (node.type === type) {
          results.push(node as T);
        }
      }
    });

    traverser.traverse(root);
    return results;
  }

  /**
   * 查找第一个指定类型的节点
   */
  static findFirst<T extends Node>(root: Node, type: T['type']): T | null {
    const results = this.findAll(root, type);
    return results[0] || null;
  }

  /**
   * 检查节点是否包含指定类型的子节点
   */
  static contains(root: Node, type: string): boolean {
    return this.findFirst(root, type) !== null;
  }

  /**
   * 获取所有标识符
   */
  static getIdentifiers(root: Node): Identifier[] {
    return this.findAll(root, 'Identifier');
  }

  /**
   * 统计节点类型
   */
  static countNodeTypes(root: Node): Record<string, number> {
    const counts: Record<string, number> = {};

    const traverser = new ASTTraverser({
      enter: (node) => {
        counts[node.type] = (counts[node.type] || 0) + 1;
      }
    });

    traverser.traverse(root);
    return counts;
  }
}

// ==================== 演示 ====================

export function demo(): void {
  console.log('=== 抽象语法树 (AST) ===\n');

  // 构建示例 AST
  const program: Program = {
    type: 'Program',
    sourceType: 'script',
    body: [
      {
        type: 'VariableDeclaration',
        kind: 'const',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 'sum' },
            init: {
              type: 'ArrowFunctionExpression',
              id: null,
              params: [
                { type: 'Identifier', name: 'a' },
                { type: 'Identifier', name: 'b' }
              ],
              body: {
                type: 'BinaryExpression',
                operator: '+',
                left: { type: 'Identifier', name: 'a' },
                right: { type: 'Identifier', name: 'b' }
              },
              expression: true,
              generator: false,
              async: false
            }
          }
        ]
      },
      {
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'console.log' },
          arguments: [
            {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'sum' },
              arguments: [
                { type: 'Literal', value: 1, raw: '1' },
                { type: 'Literal', value: 2, raw: '2' }
              ]
            }
          ]
        }
      }
    ]
  };

  console.log('示例 AST:');
  console.log(JSON.stringify(program, null, 2));

  // AST 遍历
  console.log('\n--- AST 遍历 ---');
  const traverser = new ASTTraverser({
    enter: (node, parent, path) => {
      const indent = '  '.repeat(path.length);
      console.log(`${indent}Enter: ${node.type}`);
    },
    exit: (node, parent, path) => {
      const indent = '  '.repeat(path.length);
      console.log(`${indent}Exit: ${node.type}`);
    }
  });

  console.log('遍历过程:');
  traverser.traverse(program);

  // 查找所有标识符
  console.log('\n--- 查找标识符 ---');
  const identifiers = ASTUtils.getIdentifiers(program);
  console.log('所有标识符:', identifiers.map(id => id.name));

  // 统计节点类型
  console.log('\n--- 节点类型统计 ---');
  const counts = ASTUtils.countNodeTypes(program);
  for (const [type, count] of Object.entries(counts)) {
    console.log(`  ${type}: ${count}`);
  }

  // 查找所有 CallExpression
  console.log('\n--- 查找所有函数调用 ---');
  const calls = ASTUtils.findAll(program, 'CallExpression');
  console.log(`找到 ${calls.length} 个函数调用`);
}
