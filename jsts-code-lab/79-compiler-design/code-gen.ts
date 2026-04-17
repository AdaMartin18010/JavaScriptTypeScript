/**
 * @file 代码生成器 (Code Generator)
 * @category Compiler Design → Code Generation
 * @difficulty hard
 * @tags compiler, code-generation, ast, source-map
 *
 * @description
 * 从 AST 生成目标代码，支持代码格式化、Source Map 生成。
 *
 * 生成策略：
 * - 表达式生成
 * - 语句生成
 * - 控制流生成
 * - 模块化生成
 */

import type {
  Node, Program, Statement, Expression,
  VariableDeclaration, FunctionDeclaration, ClassDeclaration,
  BlockStatement, ExpressionStatement, IfStatement,
  WhileStatement, ForStatement, ReturnStatement,
  BinaryExpression, UnaryExpression, AssignmentExpression,
  CallExpression, MemberExpression, ArrayExpression, ObjectExpression,
  ArrowFunctionExpression, FunctionExpression,
  Identifier, Literal, ThisExpression,
  Property, Pattern, ArrayPattern, ObjectPattern,
  ImportDeclaration, ExportNamedDeclaration, ExportDefaultDeclaration
} from './ast.js';

// ==================== 代码生成器选项 ====================

export interface CodeGeneratorOptions {
  indentSize: number;
  useTabs: boolean;
  lineEnding: '\n' | '\r\n';
  semicolons: boolean;
  singleQuotes: boolean;
  trailingComma: 'none' | 'es5' | 'all';
  bracketSpacing: boolean;
  arrowParens: 'always' | 'avoid';
  printWidth: number;
  sourceMap?: boolean;
}

// ==================== Source Map 生成器 ====================

export interface SourceMapSegment {
  generatedColumn: number;
  sourceIndex: number;
  sourceLine: number;
  sourceColumn: number;
  nameIndex?: number;
}

export class SourceMapGenerator {
  private sources: string[] = [];
  private names: string[] = [];
  private mappings: string[] = [];
  private lastGeneratedLine = 1;
  private lastGeneratedColumn = 0;
  private lastSourceIndex = 0;
  private lastSourceLine = 1;
  private lastSourceColumn = 0;

  constructor(private file: string, private sourceRoot?: string) {}

  addMapping(generated: { line: number; column: number }, original: { line: number; column: number; source: string; name?: string }): void {
    // 添加到适当行
    while (this.lastGeneratedLine < generated.line) {
      this.mappings.push(';');
      this.lastGeneratedLine++;
      this.lastGeneratedColumn = 0;
    }

    if (this.mappings.length > 0 && this.mappings[this.mappings.length - 1] !== ';') {
      this.mappings.push(',');
    }

    // VLQ 编码（简化版）
    const sourceIndex = this.addSource(original.source);
    const nameIndex = original.name ? this.addName(original.name) : undefined;

    const segment = [
      this.encodeVlq(generated.column - this.lastGeneratedColumn),
      this.encodeVlq(sourceIndex - this.lastSourceIndex),
      this.encodeVlq(original.line - this.lastSourceLine),
      this.encodeVlq(original.column - this.lastSourceColumn)
    ];

    if (nameIndex !== undefined) {
      segment.push(this.encodeVlq(nameIndex - (this.names.length - 1)));
    }

    this.mappings.push(segment.join(''));

    this.lastGeneratedColumn = generated.column;
    this.lastSourceIndex = sourceIndex;
    this.lastSourceLine = original.line;
    this.lastSourceColumn = original.column;
  }

  toString(): string {
    return JSON.stringify({
      version: 3,
      file: this.file,
      sourceRoot: this.sourceRoot,
      sources: this.sources,
      names: this.names,
      mappings: this.mappings.join('')
    });
  }

  private addSource(source: string): number {
    const index = this.sources.indexOf(source);
    if (index !== -1) return index;
    this.sources.push(source);
    return this.sources.length - 1;
  }

  private addName(name: string): number {
    const index = this.names.indexOf(name);
    if (index !== -1) return index;
    this.names.push(name);
    return this.names.length - 1;
  }

  private encodeVlq(value: number): string {
    // 简化的 VLQ 编码
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let result = '';
    let num = value < 0 ? ((-value) << 1) + 1 : value << 1;
    
    do {
      let digit = num & 0x1f;
      num >>= 5;
      if (num > 0) digit |= 0x20;
      result += chars[digit];
    } while (num > 0);

    return result || 'A';
  }
}

// ==================== 代码生成器 ====================

export class CodeGenerator {
  private options: CodeGeneratorOptions;
  private indent = 0;
  private output: string[] = [];
  private line = 1;
  private column = 0;
  private sourceMap?: SourceMapGenerator;

  constructor(options: Partial<CodeGeneratorOptions> = {}) {
    this.options = {
      indentSize: options.indentSize ?? 2,
      useTabs: options.useTabs ?? false,
      lineEnding: options.lineEnding ?? '\n',
      semicolons: options.semicolons ?? true,
      singleQuotes: options.singleQuotes ?? true,
      trailingComma: options.trailingComma ?? 'es5',
      bracketSpacing: options.bracketSpacing ?? true,
      arrowParens: options.arrowParens ?? 'always',
      printWidth: options.printWidth ?? 80,
      sourceMap: options.sourceMap ?? false
    };

    if (this.options.sourceMap) {
      this.sourceMap = new SourceMapGenerator('output.js');
    }
  }

  /**
   * 生成代码
   */
  generate(node: Node): { code: string; map?: string } {
    this.output = [];
    this.indent = 0;
    this.line = 1;
    this.column = 0;

    this.generateNode(node);

    const code = this.output.join('');
    return {
      code,
      map: this.sourceMap?.toString()
    };
  }

  /**
   * 生成节点
   */
  private generateNode(node: Node): void {
    switch (node.type) {
      case 'Program':
        this.generateProgram(node as Program);
        break;
      case 'VariableDeclaration':
        this.generateVariableDeclaration(node as VariableDeclaration);
        break;
      case 'FunctionDeclaration':
        this.generateFunctionDeclaration(node as FunctionDeclaration);
        break;
      case 'ClassDeclaration':
        this.generateClassDeclaration(node as ClassDeclaration);
        break;
      case 'BlockStatement':
        this.generateBlockStatement(node as BlockStatement);
        break;
      case 'ExpressionStatement':
        this.generateExpressionStatement(node as ExpressionStatement);
        break;
      case 'IfStatement':
        this.generateIfStatement(node as IfStatement);
        break;
      case 'WhileStatement':
        this.generateWhileStatement(node as WhileStatement);
        break;
      case 'ForStatement':
        this.generateForStatement(node as ForStatement);
        break;
      case 'ReturnStatement':
        this.generateReturnStatement(node as ReturnStatement);
        break;
      case 'BinaryExpression':
        this.generateBinaryExpression(node as BinaryExpression);
        break;
      case 'UnaryExpression':
        this.generateUnaryExpression(node as UnaryExpression);
        break;
      case 'AssignmentExpression':
        this.generateAssignmentExpression(node as AssignmentExpression);
        break;
      case 'CallExpression':
        this.generateCallExpression(node as CallExpression);
        break;
      case 'MemberExpression':
        this.generateMemberExpression(node as MemberExpression);
        break;
      case 'ArrayExpression':
        this.generateArrayExpression(node as ArrayExpression);
        break;
      case 'ObjectExpression':
        this.generateObjectExpression(node as ObjectExpression);
        break;
      case 'ArrowFunctionExpression':
        this.generateArrowFunctionExpression(node as ArrowFunctionExpression);
        break;
      case 'FunctionExpression':
        this.generateFunctionExpression(node as FunctionExpression);
        break;
      case 'Identifier':
        this.generateIdentifier(node as Identifier);
        break;
      case 'Literal':
        this.generateLiteral(node as Literal);
        break;
      case 'ThisExpression':
        this.write('this');
        break;
      case 'ImportDeclaration':
        this.generateImportDeclaration(node as ImportDeclaration);
        break;
      case 'ExportNamedDeclaration':
        this.generateExportNamedDeclaration(node as ExportNamedDeclaration);
        break;
      case 'ExportDefaultDeclaration':
        this.generateExportDefaultDeclaration(node as ExportDefaultDeclaration);
        break;
      default:
        this.write(`/* Unsupported: ${node.type} */`);
    }
  }

  // ==================== 语句生成 ====================

  private generateProgram(node: Program): void {
    for (let i = 0; i < node.body.length; i++) {
      this.generateNode(node.body[i]);
      this.writeLine();
    }
  }

  private generateVariableDeclaration(node: VariableDeclaration): void {
    this.write(node.kind + ' ');

    for (let i = 0; i < node.declarations.length; i++) {
      const decl = node.declarations[i];
      this.generatePattern(decl.id);

      if (decl.init) {
        this.write(' = ');
        this.generateNode(decl.init);
      }

      if (i < node.declarations.length - 1) {
        this.write(', ');
      }
    }

    if (this.options.semicolons) {
      this.write(';');
    }
  }

  private generateFunctionDeclaration(node: FunctionDeclaration): void {
    if (node.async) this.write('async ');
    if (node.generator) this.write('function* ');
    else this.write('function ');

    if (node.id) {
      this.generateIdentifier(node.id);
      this.write(' ');
    }

    this.write('(');
    this.generateParameterList(node.params);
    this.write(') ');

    this.generateNode(node.body);
  }

  private generateClassDeclaration(node: ClassDeclaration): void {
    this.write('class ');
    this.generateIdentifier(node.id);

    if (node.superClass) {
      this.write(' extends ');
      this.generateNode(node.superClass);
    }

    this.write(' {');
    this.writeLine();
    this.indent++;

    for (const method of node.body.body) {
      this.writeIndent();
      if (method.static) this.write('static ');
      if (method.kind === 'get') this.write('get ');
      if (method.kind === 'set') this.write('set ');
      
      this.generateNode(method.key);
      this.write('(');
      this.generateParameterList(method.value.params);
      this.write(') ');
      this.generateNode(method.value.body);
      this.writeLine();
    }

    this.indent--;
    this.writeIndent();
    this.write('}');
  }

  private generateBlockStatement(node: BlockStatement): void {
    this.write('{');
    this.writeLine();
    this.indent++;

    for (const stmt of node.body) {
      this.writeIndent();
      this.generateNode(stmt);
      this.writeLine();
    }

    this.indent--;
    this.writeIndent();
    this.write('}');
  }

  private generateExpressionStatement(node: ExpressionStatement): void {
    this.generateNode(node.expression);
    if (this.options.semicolons) {
      this.write(';');
    }
  }

  private generateIfStatement(node: IfStatement): void {
    this.write('if (');
    this.generateNode(node.test);
    this.write(') ');
    this.generateNode(node.consequent);

    if (node.alternate) {
      this.write(' else ');
      this.generateNode(node.alternate);
    }
  }

  private generateWhileStatement(node: WhileStatement): void {
    this.write('while (');
    this.generateNode(node.test);
    this.write(') ');
    this.generateNode(node.body);
  }

  private generateForStatement(node: ForStatement): void {
    this.write('for (');
    
    if (node.init) {
      if (node.init.type === 'VariableDeclaration') {
        this.write(node.init.kind + ' ');
        this.generatePattern(node.init.declarations[0].id);
        if (node.init.declarations[0].init) {
          this.write(' = ');
          this.generateNode(node.init.declarations[0].init);
        }
      } else {
        this.generateNode(node.init);
      }
    }
    this.write('; ');

    if (node.test) this.generateNode(node.test);
    this.write('; ');

    if (node.update) this.generateNode(node.update);
    this.write(') ');

    this.generateNode(node.body);
  }

  private generateReturnStatement(node: ReturnStatement): void {
    this.write('return');
    if (node.argument) {
      this.write(' ');
      this.generateNode(node.argument);
    }
    if (this.options.semicolons) {
      this.write(';');
    }
  }

  // ==================== 表达式生成 ====================

  private generateBinaryExpression(node: BinaryExpression): void {
    this.generateNode(node.left);
    this.write(' ' + node.operator + ' ');
    this.generateNode(node.right);
  }

  private generateUnaryExpression(node: UnaryExpression): void {
    this.write(node.operator);
    if (node.operator.length > 1) this.write(' ');
    this.generateNode(node.argument);
  }

  private generateAssignmentExpression(node: AssignmentExpression): void {
    this.generateNode(node.left);
    this.write(' ' + node.operator + ' ');
    this.generateNode(node.right);
  }

  private generateCallExpression(node: CallExpression): void {
    this.generateNode(node.callee);
    this.write('(');
    for (let i = 0; i < node.arguments.length; i++) {
      this.generateNode(node.arguments[i]);
      if (i < node.arguments.length - 1) {
        this.write(', ');
      }
    }
    this.write(')');
  }

  private generateMemberExpression(node: MemberExpression): void {
    this.generateNode(node.object);
    if (node.computed) {
      this.write('[');
      this.generateNode(node.property);
      this.write(']');
    } else {
      this.write('.');
      this.generateNode(node.property);
    }
  }

  private generateArrayExpression(node: ArrayExpression): void {
    this.write('[');
    for (let i = 0; i < node.elements.length; i++) {
      if (node.elements[i]) {
        this.generateNode(node.elements[i]!);
      }
      if (i < node.elements.length - 1) {
        this.write(', ');
      }
    }
    this.write(']');
  }

  private generateObjectExpression(node: ObjectExpression): void {
    this.write('{');
    if (this.options.bracketSpacing) this.write(' ');

    for (let i = 0; i < node.properties.length; i++) {
      const prop = node.properties[i];
      this.generateProperty(prop);
      
      if (i < node.properties.length - 1 || this.options.trailingComma === 'all') {
        this.write(',');
      }
      if (i < node.properties.length - 1) {
        this.write(' ');
      }
    }

    if (this.options.bracketSpacing) this.write(' ');
    this.write('}');
  }

  private generateProperty(node: Property): void {
    if (node.computed) {
      this.write('[');
      this.generateNode(node.key);
      this.write(']');
    } else if (node.shorthand) {
      this.generateNode(node.key);
    } else {
      this.generateNode(node.key);
      this.write(': ');
      this.generateNode(node.value);
    }
  }

  private generateArrowFunctionExpression(node: ArrowFunctionExpression): void {
    if (node.async) this.write('async ');

    const needsParens = node.params.length !== 1 || node.params[0].type !== 'Identifier' || this.options.arrowParens === 'always';

    if (needsParens) this.write('(');
    this.generateParameterList(node.params);
    if (needsParens) this.write(')');

    this.write(' => ');

    if (node.expression) {
      this.generateNode(node.body as Expression);
    } else {
      this.generateNode(node.body as BlockStatement);
    }
  }

  private generateFunctionExpression(node: FunctionExpression): void {
    if (node.async) this.write('async ');
    if (node.generator) this.write('function*');
    else this.write('function');
    
    if (node.id) {
      this.write(' ');
      this.generateIdentifier(node.id);
    }

    this.write('(');
    this.generateParameterList(node.params);
    this.write(') ');
    this.generateNode(node.body);
  }

  private generateIdentifier(node: Identifier): void {
    this.write(node.name);
  }

  private generateLiteral(node: Literal): void {
    if (node.value === null) {
      this.write('null');
    } else if (typeof node.value === 'string') {
      const quote = this.options.singleQuotes ? "'" : '"';
      const escaped = node.value.replace(/\\/g, '\\\\').replace(new RegExp(quote, 'g'), '\\' + quote);
      this.write(quote + escaped + quote);
    } else if (typeof node.value === 'boolean') {
      this.write(node.value ? 'true' : 'false');
    } else {
      this.write(String(node.value));
    }
  }

  // ==================== 模块生成 ====================

  private generateImportDeclaration(node: ImportDeclaration): void {
    this.write('import ');

    // 处理各种导入形式
    const defaultSpec = node.specifiers.find(s => s.type === 'ImportDefaultSpecifier');
    const namespaceSpec = node.specifiers.find(s => s.type === 'ImportNamespaceSpecifier');
    const namedSpecs = node.specifiers.filter(s => s.type === 'ImportSpecifier');

    if (defaultSpec) {
      this.generateIdentifier(defaultSpec.local);
      if (namespaceSpec || namedSpecs.length > 0) {
        this.write(', ');
      }
    }

    if (namespaceSpec) {
      this.write('* as ');
      this.generateIdentifier(namespaceSpec.local);
    } else if (namedSpecs.length > 0) {
      this.write('{ ');
      for (let i = 0; i < namedSpecs.length; i++) {
        const spec = namedSpecs[i];
        this.generateIdentifier(spec.local);
        if (i < namedSpecs.length - 1) {
          this.write(', ');
        }
      }
      this.write(' }');
    }

    this.write(' from ');
    this.generateLiteral(node.source);

    if (this.options.semicolons) {
      this.write(';');
    }
  }

  private generateExportNamedDeclaration(node: ExportNamedDeclaration): void {
    this.write('export ');
    if (node.declaration) {
      this.generateNode(node.declaration);
    } else {
      this.write('{ ');
      for (let i = 0; i < node.specifiers.length; i++) {
        const spec = node.specifiers[i];
        this.generateIdentifier(spec.local);
        if (i < node.specifiers.length - 1) {
          this.write(', ');
        }
      }
      this.write(' }');
      if (this.options.semicolons) {
        this.write(';');
      }
    }
  }

  private generateExportDefaultDeclaration(node: ExportDefaultDeclaration): void {
    this.write('export default ');
    this.generateNode(node.declaration);
    if (this.options.semicolons) {
      this.write(';');
    }
  }

  // ==================== 辅助方法 ====================

  private generatePattern(pattern: Pattern): void {
    switch (pattern.type) {
      case 'Identifier':
        this.generateIdentifier(pattern);
        break;
      case 'ArrayPattern':
        this.write('[');
        for (let i = 0; i < (pattern).elements.length; i++) {
          const elem = (pattern).elements[i];
          if (elem) this.generatePattern(elem);
          if (i < (pattern).elements.length - 1) {
            this.write(', ');
          }
        }
        this.write(']');
        break;
      case 'ObjectPattern':
        this.write('{ ');
        const props = (pattern).properties;
        for (let i = 0; i < props.length; i++) {
          const prop = props[i];
          if (prop.type === 'Property') {
            this.generateProperty(prop);
          } else {
            this.write('...');
            this.generatePattern((prop as any).argument);
          }
          if (i < props.length - 1) {
            this.write(', ');
          }
        }
        this.write(' }');
        break;
    }
  }

  private generateParameterList(params: Pattern[]): void {
    for (let i = 0; i < params.length; i++) {
      this.generatePattern(params[i]);
      if (i < params.length - 1) {
        this.write(', ');
      }
    }
  }

  private write(str: string): void {
    this.output.push(str);
    this.column += str.length;
  }

  private writeLine(): void {
    this.output.push(this.options.lineEnding);
    this.line++;
    this.column = 0;
  }

  private writeIndent(): void {
    const indent = this.options.useTabs 
      ? '\t'.repeat(this.indent)
      : ' '.repeat(this.indent * this.options.indentSize);
    this.output.push(indent);
    this.column += indent.length;
  }
}

// ==================== 演示 ====================

import { ASTUtils } from './ast.js';

export function demo(): void {
  console.log('=== 代码生成器 (Code Generator) ===\n');

  // 创建示例 AST
  const program: Program = {
    type: 'Program',
    sourceType: 'module',
    body: [
      {
        type: 'VariableDeclaration',
        kind: 'const',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 'add' },
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
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'greet' },
        params: [{ type: 'Identifier', name: 'name' }],
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ReturnStatement',
              argument: {
                type: 'BinaryExpression',
                operator: '+',
                left: { type: 'Literal', value: 'Hello, ', raw: '"Hello, "' },
                right: { type: 'Identifier', name: 'name' }
              }
            }
          ]
        },
        generator: false,
        async: false
      },
      {
        type: 'ExportDefaultDeclaration',
        declaration: { type: 'Identifier', name: 'add' }
      }
    ]
  };

  console.log('AST:');
  console.log(JSON.stringify(program, null, 2));

  // 生成代码
  console.log('\n--- 生成的代码 ---\n');
  
  const generator = new CodeGenerator({
    indentSize: 2,
    semicolons: true,
    singleQuotes: true,
    trailingComma: 'es5'
  });

  const result = generator.generate(program);
  console.log(result.code);
}
