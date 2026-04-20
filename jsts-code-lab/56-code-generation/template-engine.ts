/**
 * @file 代码模板引擎
 * @category Code Generation → Template Engine
 * @difficulty medium
 * @tags template-engine, code-generation, type-safe, string-interpolation
 *
 * @description
 * 专为代码生成设计的模板引擎，支持变量替换、条件渲染、循环展开和缩进感知的多行模板。
 *
 * 特性：
 * - 字符串模板变量替换
 * - 缩进感知的多行模板对齐
 * - 条件块与循环块
 * - TypeScript 泛型类型安全参数
 * - 自定义过滤器
 */

// ==================== 类型定义 ====================

export type TemplateValue = string | number | boolean | undefined | null;

export interface TemplateContext {
  [key: string]: TemplateValue | TemplateValue[] | TemplateContext | TemplateContext[];
}

export type TypedTemplateContext<T extends Record<string, unknown>> = T;

export interface TemplateOptions {
  indentSize?: number;
  openDelimiter?: string;
  closeDelimiter?: string;
  trimEmptyLines?: boolean;
}

// ==================== 模板引擎 ====================

export class TemplateEngine {
  private options: Required<TemplateOptions>;

  constructor(options: TemplateOptions = {}) {
    this.options = {
      indentSize: options.indentSize ?? 2,
      openDelimiter: options.openDelimiter ?? '{{',
      closeDelimiter: options.closeDelimiter ?? '}}',
      trimEmptyLines: options.trimEmptyLines ?? true
    };
  }

  /**
   * 渲染模板，类型安全版本
   */
  render<T extends Record<string, unknown>>(template: string, context: TypedTemplateContext<T>): string {
    return this.renderUnsafe(template, context as TemplateContext);
  }

  /**
   * 渲染模板（非类型安全）
   */
  renderUnsafe(template: string, context: TemplateContext): string {
    let result = this.normalizeIndent(template);
    result = this.processConditionals(result, context);
    result = this.processLoops(result, context);
    result = this.processVariables(result, context);
    result = this.applyFilters(result, context);

    if (this.options.trimEmptyLines) {
      result = result.replace(/\n[ \t]*\n/g, '\n').trim();
    }

    return result;
  }

  /**
   * 编译模板为可复用函数
   */
  compile<T extends Record<string, unknown>>(template: string): (context: TypedTemplateContext<T>) => string {
    return (context: TypedTemplateContext<T>) => this.render(template, context);
  }

  /**
   * 缩进感知的多行模板处理
   * 自动检测并统一模板中的缩进基准
   */
  private normalizeIndent(template: string): string {
    const lines = template.split('\n');
    if (lines.length === 0) return template;

    // 找出最小缩进（排除空行）
    let minIndent = Infinity;
    for (const line of lines) {
      const trimmed = line.trimStart();
      if (trimmed.length > 0) {
        const indent = line.length - trimmed.length;
        minIndent = Math.min(minIndent, indent);
      }
    }

    if (minIndent === Infinity || minIndent === 0) return template;

    // 统一去除最小缩进
    return lines
      .map(line => (line.trim().length === 0 ? '' : line.slice(minIndent)))
      .join('\n');
  }

  /**
   * 处理变量替换 {{var}} 或 {{var | upper}}
   */
  private processVariables(template: string, context: TemplateContext): string {
    const { openDelimiter: open, closeDelimiter: close } = this.options;
    const regex = new RegExp(
      `${this.escapeRegex(open)}\\s*([\\w.]+)(?:\\s*\\|\\s*(\\w+)(?::([^${this.escapeRegex(close)}]*))?)?\\s*${this.escapeRegex(close)}`,
      'g'
    );

    return template.replace(regex, (match, path: string, filter?: string, filterArg?: string) => {
      const value = this.getValueByPath(context, path);

      if (value === undefined || value === null) {
        return match; // 保留原样
      }

      let str = String(value);

      if (filter) {
        str = this.applyFilter(str, filter, filterArg?.trim());
      }

      return str;
    });
  }

  /**
   * 处理条件块 {{#if condition}}...{{/if}}
   * 支持 {{#if condition}}...{{else}}...{{/if}}
   */
  private processConditionals(template: string, context: TemplateContext): string {
    const { openDelimiter: open, closeDelimiter: close } = this.options;
    const ifRegex = new RegExp(
      `${this.escapeRegex(open)}#if\\s+([\\w.]+)${this.escapeRegex(close)}([\\s\\S]*?)(?:${this.escapeRegex(open)}else${this.escapeRegex(close)}([\\s\\S]*?))?${this.escapeRegex(open)}/if${this.escapeRegex(close)}`,
      'g'
    );

    return template.replace(ifRegex, (match, path: string, thenBlock: string, elseBlock?: string) => {
      const value = this.getValueByPath(context, path);
      const isTruthy = value !== undefined && value !== null && value !== false && value !== '' && value !== 0;
      return isTruthy ? thenBlock : (elseBlock ?? '');
    });
  }

  /**
   * 处理循环块 {{#each items}}...{{/each}}
   * 支持 @index 和 @first / @last
   */
  private processLoops(template: string, context: TemplateContext): string {
    const { openDelimiter: open, closeDelimiter: close } = this.options;
    const eachRegex = new RegExp(
      `${this.escapeRegex(open)}#each\\s+([\\w.]+)${this.escapeRegex(close)}([\\s\\S]*?)${this.escapeRegex(open)}/each${this.escapeRegex(close)}`,
      'g'
    );

    return template.replace(eachRegex, (match, path: string, content: string) => {
      const value = this.getValueByPath(context, path);

      if (!Array.isArray(value)) {
        return '';
      }

      return value.map((item, index) => {
        let itemContent = content;

        // 替换 @index, @first, @last
        itemContent = itemContent.replace(new RegExp(`${this.escapeRegex(open)}@index${this.escapeRegex(close)}`, 'g'), String(index));
        itemContent = itemContent.replace(new RegExp(`${this.escapeRegex(open)}@first${this.escapeRegex(close)}`, 'g'), String(index === 0));
        itemContent = itemContent.replace(new RegExp(`${this.escapeRegex(open)}@last${this.escapeRegex(close)}`, 'g'), String(index === value.length - 1));

        // 替换 this 或属性
        if (typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean') {
          itemContent = itemContent.replace(new RegExp(`${this.escapeRegex(open)}this${this.escapeRegex(close)}`, 'g'), String(item));
        } else if (typeof item === 'object' && item !== null) {
          for (const [key, val] of Object.entries(item)) {
            const safeVal = val !== undefined && val !== null ? String(val) : '';
            itemContent = itemContent.replace(
              new RegExp(`${this.escapeRegex(open)}${key}${this.escapeRegex(close)}`, 'g'),
              safeVal
            );
          }
        }

        return itemContent;
      }).join('');
    });
  }

  /**
   * 应用内置过滤器
   */
  private applyFilter(value: string, filter: string, arg?: string): string {
    switch (filter) {
      case 'upper': return value.toUpperCase();
      case 'lower': return value.toLowerCase();
      case 'camel': return value.replace(/[_-](.)/g, (_, c) => c.toUpperCase());
      case 'pascal': {
        const camel = value.replace(/[_-](.)/g, (_, c) => c.toUpperCase());
        return camel[0].toUpperCase() + camel.slice(1);
      }
      case 'kebab': return value.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
      case 'indent': {
        const size = arg ? parseInt(arg, 10) : this.options.indentSize;
        return value.split('\n').map(line => (line ? ' '.repeat(size) + line : line)).join('\n');
      }
      case 'trim': return value.trim();
      default: return value;
    }
  }

  /**
   * 处理全局过滤器占位
   */
  private applyFilters(template: string, _context: TemplateContext): string {
    // 已在 processVariables 中逐变量处理
    return template;
  }

  private getValueByPath(context: TemplateContext, path: string): unknown {
    const parts = path.split('.');
    let current: unknown = context;

    for (const part of parts) {
      if (current === null || current === undefined) return undefined;
      current = (current as Record<string, unknown>)[part];
    }

    return current;
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

// ==================== 代码专用模板构建器 ====================

export interface CodeTemplateConfig {
  imports?: string[];
  exports?: string[];
  indent?: number;
}

export class CodeTemplateBuilder {
  private engine: TemplateEngine;
  private lines: string[] = [];
  private indentLevel = 0;

  constructor(options?: TemplateOptions) {
    this.engine = new TemplateEngine(options);
  }

  /**
   * 添加一行代码
   */
  line(content = ''): this {
    const indent = ' '.repeat(this.indentLevel * (this.engine as any).options?.indentSize ?? 2);
    this.lines.push(indent + content);
    return this;
  }

  /**
   * 添加模板渲染行
   */
  template<T extends Record<string, unknown>>(template: string, context: TypedTemplateContext<T>): this {
    const rendered = this.engine.render(template, context);
    for (const l of rendered.split('\n')) {
      const indent = ' '.repeat(this.indentLevel * 2);
      this.lines.push(indent + l);
    }
    return this;
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
   * 生成最终代码
   */
  build(): string {
    return this.lines.join('\n');
  }

  /**
   * 清空
   */
  clear(): this {
    this.lines = [];
    this.indentLevel = 0;
    return this;
  }
}

// ==================== 演示 ====================

export async function demo(): Promise<void> {
  console.log('=== 代码模板引擎 ===\n');

  const engine = new TemplateEngine({ indentSize: 2 });

  // 基础变量替换
  console.log('--- 基础变量替换 ---');
  const basicTemplate = `
    function {{name}}({{params}}) {
      return {{body}};
    }
  `;
  const basicResult = engine.render(basicTemplate, {
    name: 'add',
    params: 'a: number, b: number',
    body: 'a + b'
  });
  console.log(basicResult);

  // 条件块
  console.log('\n--- 条件块 ---');
  const conditionalTemplate = `
    {{#if isAsync}}async {{/if}}function fetchData() {
      {{#if useCache}}
      const cached = cache.get('data');
      if (cached) return cached;
      {{else}}
      // 不使用缓存
      {{/if}}
      return api.get('/data');
    }
  `;
  const conditionalResult = engine.render(conditionalTemplate, {
    isAsync: true,
    useCache: false
  });
  console.log(conditionalResult);

  // 循环块
  console.log('\n--- 循环块 ---');
  const loopTemplate = `
    interface User {
      {{#each fields}}
      {{name}}: {{type}};
      {{/each}}
    }
  `;
  const loopResult = engine.render(loopTemplate, {
    fields: [
      { name: 'id', type: 'string' },
      { name: 'name', type: 'string' },
      { name: 'age', type: 'number' }
    ]
  });
  console.log(loopResult);

  // 过滤器
  console.log('\n--- 过滤器 ---');
  const filterTemplate = `export const {{componentName | pascal}} = () => {}`;
  const filterResult = engine.render(filterTemplate, { componentName: 'user-profile' });
  console.log(filterResult);

  // 类型安全编译
  console.log('\n--- 类型安全编译 ---');
  interface UserTemplateContext {
    className: string;
    properties: Array<{ name: string; type: string }>;
  }
  const compiled = engine.compile<UserTemplateContext>(`
    class {{className}} {
      {{#each properties}}
      private _{{name}}: {{type}};
      {{/each}}
    }
  `);
  const classCode = compiled({
    className: 'User',
    properties: [
      { name: 'id', type: 'string' },
      { name: 'email', type: 'string' }
    ]
  });
  console.log(classCode);

  // 代码模板构建器
  console.log('\n--- 代码模板构建器 ---');
  const builder = new CodeTemplateBuilder();
  builder
    .line('export class Service {')
    .indent()
    .template('constructor(private {{name}}: {{type}}) {}', { name: 'client', type: 'HttpClient' })
    .line('')
    .template('async {{method}}(): Promise<{{returnType}}> {', { method: 'getUsers', returnType: 'User[]' })
    .indent()
    .line('return this.client.get(\'/users\');')
    .dedent()
    .line('}')
    .dedent()
    .line('}');
  console.log(builder.build());
}
