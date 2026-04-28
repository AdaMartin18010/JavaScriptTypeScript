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

export interface TemplateContext { [key: string]: TemplateValue | TemplateValue[] | TemplateContext | TemplateContext[]; }

export type TypedTemplateContext<T extends Record<string, unknown>> = T;

export interface TemplateOptions { indentSize?: number; openDelimiter?: string; closeDelimiter?: string; trimEmptyLines?: boolean; }

// ==================== 模板引擎 ====================

export class TemplateEngine {
  private opts: Required<TemplateOptions>;

  constructor(options: TemplateOptions = {}) {
    this.opts = { indentSize: options.indentSize ?? 2, openDelimiter: options.openDelimiter ?? '{{', closeDelimiter: options.closeDelimiter ?? '}}', trimEmptyLines: options.trimEmptyLines ?? true };
  }

  /** 渲染模板，类型安全版本 */
  render<T extends Record<string, unknown>>(template: string, context: TypedTemplateContext<T>): string {
    return this.renderUnsafe(template, context as TemplateContext);
  }

  /** 渲染模板（非类型安全） */
  renderUnsafe(template: string, context: TemplateContext): string {
    let result = this.normalizeIndent(template);
    result = this.processConditionals(result, context);
    result = this.processLoops(result, context);
    result = this.processVariables(result, context);
    if (this.opts.trimEmptyLines) result = result.replace(/\n[ \t]*\n/g, '\n').trim();
    return result;
  }

  /** 编译模板为可复用函数 */
  compile<T extends Record<string, unknown>>(template: string): (context: TypedTemplateContext<T>) => string {
    return (context: TypedTemplateContext<T>) => this.render(template, context);
  }

  /** 缩进感知的多行模板处理 */
  private normalizeIndent(template: string): string {
    const lines = template.split('\n');
    if (lines.length === 0) return template;
    let minIndent = Infinity;
    for (const line of lines) { const trimmed = line.trimStart(); if (trimmed.length > 0) minIndent = Math.min(minIndent, line.length - trimmed.length); }
    if (minIndent === Infinity || minIndent === 0) return template;
    return lines.map(line => (line.trim().length === 0 ? '' : line.slice(minIndent))).join('\n');
  }

  /** 处理变量替换 {{var}} 或 {{var | upper}} */
  private processVariables(template: string, context: TemplateContext): string {
    const { openDelimiter: o, closeDelimiter: c } = this.opts;
    const regex = new RegExp(`${this.esc(o)}\\s*([\\w.]+)(?:\\s*\\|\\s*(\\w+)(?::([^${this.esc(c)}]*))?)?\\s*${this.esc(c)}`, 'g');
    return template.replace(regex, (match, path: string, filter?: string, filterArg?: string) => {
      const value = this.getValueByPath(context, path);
      if (value === undefined || value === null) return match;
      let str = String(value);
      if (filter) str = this.applyFilter(str, filter, filterArg?.trim());
      return str;
    });
  }

  /** 处理条件块 {{#if condition}}...{{else}}...{{/if}} */
  private processConditionals(template: string, context: TemplateContext): string {
    const { openDelimiter: o, closeDelimiter: c } = this.opts;
    const ifRegex = new RegExp(`${this.esc(o)}#if\\s+([\\w.]+)${this.esc(c)}([\\s\\S]*?)(?:${this.esc(o)}else${this.esc(c)}([\\s\\S]*?))?${this.esc(o)}/if${this.esc(c)}`, 'g');
    return template.replace(ifRegex, (match, path: string, thenBlock: string, elseBlock?: string) => {
      const value = this.getValueByPath(context, path);
      const isTruthy = value !== undefined && value !== null && value !== false && value !== '' && value !== 0;
      return isTruthy ? thenBlock : (elseBlock ?? '');
    });
  }

  /** 处理循环块 {{#each items}}...{{/each}} */
  private processLoops(template: string, context: TemplateContext): string {
    const { openDelimiter: o, closeDelimiter: c } = this.opts;
    const eachRegex = new RegExp(`${this.esc(o)}#each\\s+([\\w.]+)${this.esc(c)}([\\s\\S]*?)${this.esc(o)}/each${this.esc(c)}`, 'g');
    return template.replace(eachRegex, (match, path: string, content: string) => {
      const value = this.getValueByPath(context, path);
      if (!Array.isArray(value)) return '';
      return value.map((item, index) => {
        let itemContent = content;
        itemContent = itemContent.replace(new RegExp(`${this.esc(o)}@index${this.esc(c)}`, 'g'), String(index));
        itemContent = itemContent.replace(new RegExp(`${this.esc(o)}@first${this.esc(c)}`, 'g'), String(index === 0));
        itemContent = itemContent.replace(new RegExp(`${this.esc(o)}@last${this.esc(c)}`, 'g'), String(index === value.length - 1));
        if (typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean') {
          itemContent = itemContent.replace(new RegExp(`${this.esc(o)}this${this.esc(c)}`, 'g'), String(item));
        } else if (typeof item === 'object' && item !== null) {
          for (const [key, val] of Object.entries(item)) {
            const safeVal = val !== undefined && val !== null ? String(val) : '';
            itemContent = itemContent.replace(new RegExp(`${this.esc(o)}${key}${this.esc(c)}`, 'g'), safeVal);
          }
        }
        return itemContent;
      }).join('');
    });
  }

  /** 应用内置过滤器 */
  private applyFilter(value: string, filter: string, arg?: string): string {
    switch (filter) {
      case 'upper': return value.toUpperCase();
      case 'lower': return value.toLowerCase();
      case 'camel': return value.replace(/[_-](.)/g, (_, ch) => ch.toUpperCase());
      case 'pascal': { const camel = value.replace(/[_-](.)/g, (_, ch) => ch.toUpperCase()); return camel[0].toUpperCase() + camel.slice(1); }
      case 'kebab': return value.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
      case 'indent': { const size = arg ? parseInt(arg, 10) : this.opts.indentSize; return value.split('\n').map(line => (line ? ' '.repeat(size) + line : line)).join('\n'); }
      case 'trim': return value.trim();
      default: return value;
    }
  }

  private getValueByPath(context: TemplateContext, path: string): unknown {
    const parts = path.split('.'); let current: unknown = context;
    for (const part of parts) { if (current === null || current === undefined) return undefined; current = (current as Record<string, unknown>)[part]; }
    return current;
  }

  private esc(str: string): string { return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
}

// ==================== 代码专用模板构建器 ====================

export class CodeTemplateBuilder {
  private lines: string[] = [];
  private indentLevel = 0;
  private indentSize: number;

  constructor(options?: TemplateOptions) { this.indentSize = options?.indentSize ?? 2; }

  /** 添加一行代码 */
  line(content = ''): this { this.lines.push(' '.repeat(this.indentLevel * this.indentSize) + content); return this; }

  /** 添加模板渲染行 */
  template<T extends Record<string, unknown>>(template: string, context: TypedTemplateContext<T>): this {
    const rendered = new TemplateEngine({ indentSize: this.indentSize }).render(template, context);
    for (const l of rendered.split('\n')) { this.lines.push(' '.repeat(this.indentLevel * this.indentSize) + l); }
    return this;
  }

  indent(): this { this.indentLevel++; return this; }
  dedent(): this { this.indentLevel = Math.max(0, this.indentLevel - 1); return this; }
  build(): string { return this.lines.join('\n'); }
  clear(): this { this.lines = []; this.indentLevel = 0; return this; }
}

// ==================== 演示 ====================

export async function demo(): Promise<void> {
  console.log('=== 代码模板引擎 ===\n');

  const engine = new TemplateEngine({ indentSize: 2 });

  console.log('--- 基础变量替换 ---');
  const basic = engine.render('function {{name}}({{params}}) { return {{body}}; }', { name: 'add', params: 'a: number, b: number', body: 'a + b' });
  console.log(basic);

  console.log('\n--- 条件块 ---');
  const conditional = engine.render('{{#if isAsync}}async {{/if}}function fetchData() { {{#if useCache}}return cache.get();{{else}}return api.get();{{/if}} }', { isAsync: true, useCache: false });
  console.log(conditional);

  console.log('\n--- 循环块 ---');
  const loop = engine.render('interface User { {{#each fields}}  {{name}}: {{type}}; {{/each}}}', { fields: [{ name: 'id', type: 'string' }, { name: 'age', type: 'number' }] });
  console.log(loop);

  console.log('\n--- 过滤器 ---');
  console.log(engine.render('{{name | pascal}}', { name: 'user-profile' }));
  console.log(engine.render('{{name | kebab}}', { name: 'UserProfile' }));

  console.log('\n--- 类型安全编译 ---');
  interface Ctx { className: string; properties: Array<{ name: string; type: string }>; }
  const compiled = engine.compile<Ctx>('class {{className}} { {{#each properties}}  private _{{name}}: {{type}}; {{/each}}}');
  console.log(compiled({ className: 'User', properties: [{ name: 'id', type: 'string' }, { name: 'email', type: 'string' }] }));

  console.log('\n--- 代码模板构建器 ---');
  const builder = new CodeTemplateBuilder();
  builder.line('export class Service {').indent().template('constructor(private {{name}}: {{type}}) {}', { name: 'client', type: 'HttpClient' }).line('').template('async {{method}}(): Promise<{{returnType}}> {', { method: 'getUsers', returnType: 'User[]' }).indent().line("return this.client.get('/users');").dedent().line('}').dedent().line('}');
  console.log(builder.build());
}
