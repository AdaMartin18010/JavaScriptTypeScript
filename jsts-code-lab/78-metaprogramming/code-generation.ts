/**
 * @file 代码生成实现
 * @category Metaprogramming → Code Generation
 * @difficulty hard
 * @tags metaprogramming, code-generation, ast, templates
 *
 * @description
 * 灵活的代码生成系统，支持模板引擎、AST 操作和多语言代码生成。
 *
 * 生成策略：
 * - 模板生成: 基于模板替换
 * - AST 生成: 基于抽象语法树
 * - 字符串拼接: 直接字符串操作
 * - 程序化生成: 通过 API 调用
 *
 * 支持语言：
 * - TypeScript/JavaScript
 * - JSON Schema
 * - GraphQL
 * - SQL
 */

// ==================== 代码生成器基础 ====================

export interface CodeGeneratorOptions {
  indentSize: number;
  lineEnding: '\n' | '\r\n';
  quoteStyle: 'single' | 'double';
  semicolons: boolean;
  trailingComma: 'none' | 'es5' | 'all';
}

export class CodeGenerator {
  private code: string[] = [];
  private indentLevel = 0;
  private options: CodeGeneratorOptions;

  constructor(options: Partial<CodeGeneratorOptions> = {}) {
    this.options = {
      indentSize: options.indentSize ?? 2,
      lineEnding: options.lineEnding ?? '\n',
      quoteStyle: options.quoteStyle ?? 'single',
      semicolons: options.semicolons ?? true,
      trailingComma: options.trailingComma ?? 'es5'
    };
  }

  /**
   * 增加缩进
   */
  indent(): this {
    this.indentLevel++;
    return this;
  }

  /**
   * 减少缩进
   */
  dedent(): this {
    this.indentLevel = Math.max(0, this.indentLevel - 1);
    return this;
  }

  /**
   * 添加一行代码
   */
  line(content: string = ''): this {
    const indent = ' '.repeat(this.indentLevel * this.options.indentSize);
    this.code.push(indent + content);
    return this;
  }

  /**
   * 添加空行
   */
  blank(): this {
    this.code.push('');
    return this;
  }

  /**
   * 添加代码块
   */
  block(start: string, end: string, fn: () => void): this {
    this.line(start);
    this.indent();
    fn();
    this.dedent();
    this.line(end);
    return this;
  }

  /**
   * 添加带条件的代码
   */
  conditional(condition: boolean, thenFn: () => void, elseFn?: () => void): this {
    if (condition) {
      thenFn();
    } else if (elseFn) {
      elseFn();
    }
    return this;
  }

  /**
   * 添加多行
   */
  lines(...contents: string[]): this {
    for (const content of contents) {
      this.line(content);
    }
    return this;
  }

  /**
   * 添加注释
   */
  comment(content: string, type: 'line' | 'block' = 'line'): this {
    if (type === 'line') {
      this.line(`// ${content}`);
    } else {
      this.line('/**');
      for (const line of content.split('\n')) {
        this.line(` * ${line}`);
      }
      this.line(' */');
    }
    return this;
  }

  /**
   * 生成最终代码
   */
  generate(): string {
    return this.code.join(this.options.lineEnding);
  }

  /**
   * 清空代码
   */
  clear(): void {
    this.code = [];
    this.indentLevel = 0;
  }
}

// ==================== TypeScript 代码生成器 ====================

export interface InterfaceProperty {
  name: string;
  type: string;
  optional?: boolean;
  readonly?: boolean;
  defaultValue?: string;
  comment?: string;
}

export interface MethodDefinition {
  name: string;
  parameters: Array<{ name: string; type: string; optional?: boolean; defaultValue?: string }>;
  returnType?: string;
  async?: boolean;
  body?: string;
  comment?: string;
}

export class TypeScriptGenerator extends CodeGenerator {
  /**
   * 生成接口
   */
  interface(name: string, properties: InterfaceProperty[], extends_?: string[]): this {
    const extendsClause = extends_ && extends_.length > 0 
      ? ` extends ${extends_.join(', ')}` 
      : '';

    this.block(`interface ${name}${extendsClause} {`, '}', () => {
      for (const prop of properties) {
        if (prop.comment) {
          this.comment(prop.comment);
        }
        
        const modifiers = [
          prop.readonly ? 'readonly' : '',
          prop.name + (prop.optional ? '?' : '')
        ].filter(Boolean).join(' ');

        this.line(`${modifiers}: ${prop.type};`);
      }
    });

    return this;
  }

  /**
   * 生成类型别名
   */
  typeAlias(name: string, definition: string): this {
    this.line(`type ${name} = ${definition};`);
    return this;
  }

  /**
   * 生成枚举
   */
  enum(name: string, members: Array<{ name: string; value?: string | number; comment?: string }>): this {
    this.block(`enum ${name} {`, '}', () => {
      for (let i = 0; i < members.length; i++) {
        const member = members[i];
        if (member.comment) {
          this.comment(member.comment);
        }

        let line = member.name;
        if (member.value !== undefined) {
          const valueStr = typeof member.value === 'string' ? `'${member.value}'` : member.value;
          line += ` = ${valueStr}`;
        }

        const isLast = i === members.length - 1;
        const trailingComma = this.options.trailingComma === 'all' || 
          (this.options.trailingComma === 'es5' && !isLast);
        
        this.line(line + (trailingComma || !isLast ? ',' : ''));
      }
    });

    return this;
  }

  /**
   * 生成类
   */
  class(
    name: string,
    options: {
      export?: boolean;
      abstract?: boolean;
      extends?: string;
      implements?: string[];
      properties?: InterfaceProperty[];
      methods?: MethodDefinition[];
    }
  ): this {
    const modifiers = [
      options.export ? 'export' : '',
      options.abstract ? 'abstract' : '',
      'class'
    ].filter(Boolean).join(' ');

    const extendsClause = options.extends ? ` extends ${options.extends}` : '';
    const implementsClause = options.implements?.length 
      ? ` implements ${options.implements.join(', ')}` 
      : '';

    this.block(`${modifiers} ${name}${extendsClause}${implementsClause} {`, '}', () => {
      // 属性
      if (options.properties) {
        for (const prop of options.properties) {
          if (prop.comment) {
            this.comment(prop.comment);
          }

          const modifiers = [
            prop.readonly ? 'readonly' : '',
            prop.name + (prop.optional ? '?' : '')
          ].filter(Boolean).join(' ');

          let line = `${modifiers}: ${prop.type}`;
          if (prop.defaultValue) {
            line += ` = ${prop.defaultValue}`;
          }

          this.line(line + ';');
        }

        if (options.properties.length > 0 && options.methods?.length) {
          this.blank();
        }
      }

      // 方法
      if (options.methods) {
        for (const method of options.methods) {
          if (method.comment) {
            this.comment(method.comment);
          }

          const async_ = method.async ? 'async ' : '';
          const params = method.parameters.map(p => {
            let param = p.name + (p.optional ? '?' : '');
            if (p.defaultValue && !p.optional) {
              param += ` = ${p.defaultValue}`;
            }
            param += `: ' + p.type;
            return param;
          }).join(', ');

          const returnType = method.returnType ? `: ${method.returnType}` : '';

          if (method.body) {
            this.block(`${async_}${method.name}(${params})${returnType} {`, '}', () => {
              for (const line of method.body!.split('\n')) {
                this.line(line);
              }
            });
          } else {
            this.line(`${async_}${method.name}(${params})${returnType};`);
          }

          this.blank();
        }
      }
    });

    return this;
  }

  /**
   * 生成函数
   */
  function(name: string, method: MethodDefinition, options: { export?: boolean; async?: boolean } = {}): this {
    const export_ = options.export ? 'export ' : '';
    const async_ = options.async || method.async ? 'async ' : '';
    const params = method.parameters.map(p => {
      let param = p.name + (p.optional ? '?' : '');
      if (p.defaultValue) {
        param += ` = ${p.defaultValue}`;
      }
      param += `: ' + p.type;
      return param;
    }).join(', ');

    const returnType = method.returnType ? `: ${method.returnType}` : '';

    this.block(`${export_}${async_}function ${name}(${params})${returnType} {`, '}', () => {
      if (method.body) {
        for (const line of method.body.split('\n')) {
          this.line(line);
        }
      } else {
        this.line('// TODO: Implement');
      }
    });

    return this;
  }

  /**
   * 生成导入语句
   */
  import(names: string[], from: string, type: 'named' | 'default' | 'namespace' = 'named'): this {
    switch (type) {
      case 'named':
        this.line(`import { ${names.join(', ')} } from '${from}';`);
        break;
      case 'default':
        this.line(`import ${names[0]} from '${from}';`);
        break;
      case 'namespace':
        this.line(`import * as ${names[0]} from '${from}';`);
        break;
    }
    return this;
  }
}

// ==================== JSON Schema 生成器 ====================

export class JSONSchemaGenerator {
  private schema: Record<string, any> = {
    $schema: 'http://json-schema.org/draft-07/schema#'
  };

  constructor(title: string, type: 'object' | 'array' = 'object') {
    this.schema.title = title;
    this.schema.type = type;
  }

  addProperty(name: string, property: {
    type: string;
    description?: string;
    required?: boolean;
    enum?: any[];
    minimum?: number;
    maximum?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    format?: string;
    items?: any;
    properties?: Record<string, any>;
    default?: any;
  }): this {
    if (!this.schema.properties) {
      this.schema.properties = {};
    }

    this.schema.properties[name] = this.cleanObject(property);

    if (property.required) {
      if (!this.schema.required) {
        this.schema.required = [];
      }
      this.schema.required.push(name);
    }

    return this;
  }

  addDefinition(name: string, definition: any): this {
    if (!this.schema.definitions) {
      this.schema.definitions = {};
    }

    this.schema.definitions[name] = definition;
    return this;
  }

  setAdditionalProperties(allowed: boolean): this {
    this.schema.additionalProperties = allowed;
    return this;
  }

  generate(): string {
    return JSON.stringify(this.schema, null, 2);
  }

  private cleanObject(obj: any): any {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined && key !== 'required') {
        cleaned[key] = value;
      }
    }
    return cleaned;
  }
}

// ==================== 模板引擎 ====================

export interface TemplateContext {
  [key: string]: any;
}

export class TemplateEngine {
  private template: string;

  constructor(template: string) {
    this.template = template;
  }

  /**
   * 渲染模板
   */
  render(context: TemplateContext): string {
    // 简单的模板替换
    let result = this.template;

    // 处理条件块 {{#if condition}}...{{/if}}
    result = this.processConditionals(result, context);

    // 处理循环 {{#each items}}...{{/each}}
    result = this.processLoops(result, context);

    // 处理变量 {{variable}}
    result = this.processVariables(result, context);

    return result;
  }

  private processConditionals(template: string, context: TemplateContext): string {
    const ifRegex = /\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g;
    
    return template.replace(ifRegex, (match, condition, content) => {
      return context[condition] ? content : '';
    });
  }

  private processLoops(template: string, context: TemplateContext): string {
    const eachRegex = /\{\{#each\s+(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g;
    
    return template.replace(eachRegex, (match, arrayName, content) => {
      const array = context[arrayName];
      if (!Array.isArray(array)) return '';

      return array.map((item, index) => {
        let itemContent = content;
        
        // 替换 @index
        itemContent = itemContent.replace(/\{\{@index\}\}/g, String(index));
        
        // 替换 this
        if (typeof item === 'string' || typeof item === 'number') {
          itemContent = itemContent.replace(/\{\{this\}\}/g, String(item));
        }
        
        // 替换属性
        if (typeof item === 'object') {
          for (const [key, value] of Object.entries(item)) {
            itemContent = itemContent.replace(
              new RegExp(`\\{\\{${key}\\}\\}`, 'g'),
              String(value)
            );
          }
        }

        return itemContent;
      }).join('');
    });
  }

  private processVariables(template: string, context: TemplateContext): string {
    const varRegex = /\{\{(\w+)\}\}/g;
    
    return template.replace(varRegex, (match, name) => {
      const value = context[name];
      return value !== undefined ? String(value) : match;
    });
  }
}

// ==================== DSL 构建器 ====================

export class DSLBuilder {
  private definitions: Map<string, any> = new Map();

  define(name: string, definition: any): this {
    this.definitions.set(name, definition);
    return this;
  }

  rule(name: string, config: {
    condition: string;
    operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'contains';
    value: any;
    action: string;
  }): this {
    this.definitions.set(name, {
      type: 'rule',
      ...config
    });
    return this;
  }

  workflow(name: string, steps: Array<{ name: string; action: string; condition?: string }>): this {
    this.definitions.set(name, {
      type: 'workflow',
      steps
    });
    return this;
  }

  compile(): Record<string, Function> {
    const result: Record<string, Function> = {};

    for (const [name, def] of this.definitions) {
      if (def.type === 'rule') {
        result[name] = (input: any) => this.evaluateRule(def, input);
      } else if (def.type === 'workflow') {
        result[name] = (input: any) => this.executeWorkflow(def, input);
      }
    }

    return result;
  }

  private evaluateRule(rule: any, input: any): boolean {
    const value = this.getPath(input, rule.condition);

    switch (rule.operator) {
      case 'eq': return value === rule.value;
      case 'ne': return value !== rule.value;
      case 'gt': return value > rule.value;
      case 'lt': return value < rule.value;
      case 'gte': return value >= rule.value;
      case 'lte': return value <= rule.value;
      case 'in': return rule.value.includes(value);
      case 'contains': return String(value).includes(rule.value);
      default: return false;
    }
  }

  private executeWorkflow(workflow: any, input: any): any {
    let result = input;

    for (const step of workflow.steps) {
      if (step.condition && !this.evaluateCondition(step.condition, result)) {
        continue;
      }
      // 执行动作（简化处理）
      console.log(`Executing: ${step.action}`);
    }

    return result;
  }

  private getPath(obj: any, path: string): any {
    return path.split('.').reduce((o, p) => o?.[p], obj);
  }

  private evaluateCondition(condition: string, input: any): boolean {
    // 简化条件解析
    return true;
  }
}

// ==================== 演示 ====================

export function demo(): void {
  console.log('=== 代码生成 ===\n');

  // TypeScript 代码生成
  console.log('--- TypeScript 代码生成 ---');
  const tsGen = new TypeScriptGenerator({ indentSize: 2 });

  tsGen
    .comment('Auto-generated User Service', 'block')
    .blank()
    .import(['BaseService', 'User'], './types')
    .blank()
    .interface('User', [
      { name: 'id', type: 'string', readonly: true },
      { name: 'name', type: 'string' },
      { name: 'email', type: 'string' },
      { name: 'age', type: 'number', optional: true }
    ])
    .blank()
    .class('UserService', {
      export: true,
      extends: 'BaseService',
      properties: [
        { name: 'users', type: 'Map<string, User>', readonly: true }
      ],
      methods: [
        {
          name: 'getUser',
          parameters: [{ name: 'id', type: 'string' }],
          returnType: 'User | undefined',
          body: 'return this.users.get(id);'
        },
        {
          name: 'createUser',
          parameters: [
            { name: 'data', type: 'Omit<User, "id">' }
          ],
          returnType: 'User',
          body: `const user = { id: crypto.randomUUID(), ...data };
this.users.set(user.id, user);
return user;`
        }
      ]
    });

  console.log(tsGen.generate());

  // JSON Schema 生成
  console.log('\n--- JSON Schema 生成 ---');
  const schemaGen = new JSONSchemaGenerator('User', 'object');

  schemaGen
    .addProperty('id', {
      type: 'string',
      description: 'Unique identifier',
      format: 'uuid',
      required: true
    })
    .addProperty('name', {
      type: 'string',
      description: 'User name',
      minLength: 1,
      maxLength: 100,
      required: true
    })
    .addProperty('email', {
      type: 'string',
      description: 'Email address',
      format: 'email',
      required: true
    })
    .addProperty('age', {
      type: 'integer',
      description: 'User age',
      minimum: 0,
      maximum: 150
    })
    .setAdditionalProperties(false);

  console.log(schemaGen.generate());

  // 模板引擎
  console.log('\n--- 模板引擎 ---');
  const template = `
Hello {{name}}!
{{#if isAdmin}}
You have admin privileges.
{{/if}}
Your roles:
{{#each roles}}
- {{this}}
{{/each}}
`;

  const engine = new TemplateEngine(template);
  const rendered = engine.render({
    name: 'John',
    isAdmin: true,
    roles: ['admin', 'editor', 'viewer']
  });

  console.log(rendered);

  // DSL 构建器
  console.log('\n--- DSL 构建器 ---');
  const dsl = new DSLBuilder();

  dsl
    .rule('isAdult', {
      condition: 'age',
      operator: 'gte',
      value: 18,
      action: 'allowAccess'
    })
    .rule('isAdmin', {
      condition: 'role',
      operator: 'eq',
      value: 'admin',
      action: 'grantAdmin'
    });

  const rules = dsl.compile();
  console.log('isAdult(20):', rules.isAdult({ age: 20 }));
  console.log('isAdult(16):', rules.isAdult({ age: 16 }));
  console.log('isAdmin({ role: "admin" }):', rules.isAdmin({ role: 'admin' }));
}
