import { describe, it, expect } from 'vitest';
import { TemplateEngine, ScaffoldGenerator } from './scaffold-generator.js';

describe('TemplateEngine', () => {
  it('renders variables', () => {
    const engine = new TemplateEngine();
    const result = engine.render('Hello {{name}}!', { name: 'World' });
    expect(result).toBe('Hello World!');
  });

  it('renders conditionals', () => {
    const engine = new TemplateEngine();
    const result = engine.render('{{#if show}}visible{{/if}}', { show: true });
    expect(result).toBe('visible');
  });

  it('renders each loop', () => {
    const engine = new TemplateEngine();
    const result = engine.render('{{#each items}}{{@item}} {{/each}}', { items: 'a,b,c' });
    expect(result.trim()).toBe('a b c');
  });
});

describe('ScaffoldGenerator', () => {
  it('generates package.json from template', () => {
    const gen = new ScaffoldGenerator();
    const tree = gen.buildProjectTree('my-lib', { includeTests: true, includeLinting: false, language: 'ts' });
    expect(tree.type).toBe('dir');
    expect(tree.children.some((n: any) => n.path === 'my-lib/package.json')).toBe(true);
    expect(tree.children.some((n: any) => n.path === 'my-lib/src/index.ts')).toBe(true);
  });

  it('includes eslint config when requested', () => {
    const gen = new ScaffoldGenerator();
    const tree = gen.buildProjectTree('my-lib', { includeTests: false, includeLinting: true, language: 'js' });
    expect(tree.children.some((n: any) => n.path === 'my-lib/eslint.config.mjs')).toBe(true);
  });
});
