import { describe, it, expect } from 'vitest';
import { TemplateEngine, CodeTemplateBuilder } from './template-engine.js';

describe('TemplateEngine', () => {
  it('TemplateEngine is defined', () => {
    expect(typeof TemplateEngine).not.toBe('undefined');
  });

  it('renders basic variable substitution', () => {
    const engine = new TemplateEngine();
    const result = engine.render('Hello {{name}}!', { name: 'World' });
    expect(result).toBe('Hello World!');
  });

  it('renders multiple variables', () => {
    const engine = new TemplateEngine();
    const result = engine.render('{{greeting}}, {{name}}!', {
      greeting: 'Hi',
      name: 'Alice'
    });
    expect(result).toBe('Hi, Alice!');
  });

  it('preserves placeholder for missing variables', () => {
    const engine = new TemplateEngine();
    const result = engine.render('Hello {{name}}!', {});
    expect(result).toBe('Hello {{name}}!');
  });

  it('processes conditional blocks when truthy', () => {
    const engine = new TemplateEngine();
    const template = '{{#if show}}visible{{/if}}';
    expect(engine.render(template, { show: true })).toBe('visible');
  });

  it('processes conditional blocks when falsy', () => {
    const engine = new TemplateEngine();
    const template = '{{#if show}}visible{{/if}}';
    expect(engine.render(template, { show: false })).toBe('');
  });

  it('processes conditional else blocks', () => {
    const engine = new TemplateEngine();
    const template = '{{#if premium}}Pro{{else}}Free{{/if}}';
    expect(engine.render(template, { premium: true })).toBe('Pro');
    expect(engine.render(template, { premium: false })).toBe('Free');
  });

  it('processes each loops with objects', () => {
    const engine = new TemplateEngine();
    const template = '{{#each items}}{{name}}:{{value}};{{/each}}';
    const result = engine.render(template, {
      items: [
        { name: 'a', value: '1' },
        { name: 'b', value: '2' }
      ]
    });
    expect(result).toBe('a:1;b:2;');
  });

  it('processes each loops with primitive values', () => {
    const engine = new TemplateEngine();
    const template = '{{#each tags}}{{this}},{{/each}}';
    const result = engine.render(template, { tags: ['ts', 'js', 'node'] });
    expect(result).toBe('ts,js,node,');
  });

  it('provides @index in each loops', () => {
    const engine = new TemplateEngine();
    const template = '{{#each items}}{{@index}}:{{this}};{{/each}}';
    const result = engine.render(template, { items: ['a', 'b'] });
    expect(result).toBe('0:a;1:b;');
  });

  it('applies upper filter', () => {
    const engine = new TemplateEngine();
    const result = engine.render('{{name | upper}}', { name: 'hello' });
    expect(result).toBe('HELLO');
  });

  it('applies lower filter', () => {
    const engine = new TemplateEngine();
    const result = engine.render('{{name | lower}}', { name: 'WORLD' });
    expect(result).toBe('world');
  });

  it('applies pascal filter', () => {
    const engine = new TemplateEngine();
    const result = engine.render('{{name | pascal}}', { name: 'user-profile' });
    expect(result).toBe('UserProfile');
  });

  it('applies camel filter', () => {
    const engine = new TemplateEngine();
    const result = engine.render('{{name | camel}}', { name: 'user-profile' });
    expect(result).toBe('userProfile');
  });

  it('applies kebab filter', () => {
    const engine = new TemplateEngine();
    const result = engine.render('{{name | kebab}}', { name: 'UserProfile' });
    expect(result).toBe('user-profile');
  });

  it('normalizes indentation in multiline templates', () => {
    const engine = new TemplateEngine();
    const template = '\n    line1\n    line2\n';
    const result = engine.render(template, {});
    expect(result).toContain('line1');
    expect(result).toContain('line2');
  });

  it('compile returns reusable function', () => {
    const engine = new TemplateEngine();
    const compiled = engine.compile<{ name: string }>('Hello {{name}}!');
    expect(compiled({ name: 'Alice' })).toBe('Hello Alice!');
    expect(compiled({ name: 'Bob' })).toBe('Hello Bob!');
  });

  it('demo is defined and callable', async () => {
    const { demo } = await import('./template-engine.js');
    expect(typeof demo).toBe('function');
    await expect(demo()).resolves.toBeUndefined();
  });
});

describe('CodeTemplateBuilder', () => {
  it('CodeTemplateBuilder is defined', () => {
    expect(typeof CodeTemplateBuilder).not.toBe('undefined');
  });

  it('builds simple code lines', () => {
    const builder = new CodeTemplateBuilder();
    builder.line('const x = 1;').line('const y = 2;');
    expect(builder.build()).toBe('const x = 1;\nconst y = 2;');
  });

  it('handles indentation', () => {
    const builder = new CodeTemplateBuilder();
    builder.line('if (true) {').indent().line('console.log(1);').dedent().line('}');
    expect(builder.build()).toBe('if (true) {\n  console.log(1);\n}');
  });

  it('renders template with context', () => {
    const builder = new CodeTemplateBuilder();
    builder.template('const {{name}} = {{value}};', { name: 'count', value: '42' });
    expect(builder.build()).toBe('const count = 42;');
  });

  it('clear resets builder', () => {
    const builder = new CodeTemplateBuilder();
    builder.line('a');
    builder.clear();
    expect(builder.build()).toBe('');
  });
});
