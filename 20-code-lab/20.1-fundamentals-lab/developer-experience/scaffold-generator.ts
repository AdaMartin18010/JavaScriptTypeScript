/**
 * @file 脚手架模板引擎
 * @category Developer Experience → Scaffold Generator
 * @difficulty medium
 * @tags scaffold, template-engine, codegen, cli
 *
 * @description
 * 简化版脚手架生成器，支持 Handlebars/Mustache 风格的变量替换、
 * 条件渲染与文件树生成。演示如何程序化生成一个 Node.js 库项目结构。
 */

// ============================================================================
// 类型定义
// ============================================================================

/** 模板变量上下文 */
export type TemplateContext = Record<string, string | boolean | number | undefined>;

/** 文件系统节点（内存中模拟） */
export interface FileNode {
  type: 'file';
  path: string;
  content: string;
}

export interface DirNode {
  type: 'dir';
  path: string;
  children: ScaffoldNode[];
}

export type ScaffoldNode = FileNode | DirNode;

/** 模板描述 */
export interface TemplateDescriptor {
  name: string;
  source: string;
}

// ============================================================================
// 模板引擎
// ============================================================================

export class TemplateEngine {
  /**
   * 渲染模板字符串，支持以下语法：
   * - {{varName}}        变量插值
   * - {{#if varName}}...{{/if}}  条件渲染（仅当值为 truthy 时输出）
   * - {{#each items}}...{{/each}}  简化的列表迭代（以逗号分隔的字符串）
   */
  render(template: string, context: TemplateContext): string {
    let result = template;

    // 1. 条件渲染
    const ifRegex = /\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g;
    result = result.replace(ifRegex, (_, key: string, inner: string) => {
      const value = context[key];
      return value ? inner : '';
    });

    // 2. 列表迭代（简化版：假设值为逗号分隔字符串）
    const eachRegex = /\{\{#each\s+(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g;
    result = result.replace(eachRegex, (_, key: string, inner: string) => {
      const value = context[key];
      if (typeof value !== 'string' || value.length === 0) return '';
      const items = value.split(',').map(s => s.trim()).filter(Boolean);
      return items.map(item => {
        return inner.replace(/\{\{@item\}\}/g, item);
      }).join('');
    });

    // 3. 变量插值
    const varRegex = /\{\{(\w+)\}\}/g;
    result = result.replace(varRegex, (_, key: string) => {
      const value = context[key];
      return value !== undefined ? String(value) : '';
    });

    return result;
  }
}

// ============================================================================
// 脚手架生成器
// ============================================================================

export class ScaffoldGenerator {
  private engine = new TemplateEngine();
  private templates = new Map<string, string>();

  registerTemplate(name: string, source: string): void {
    this.templates.set(name, source);
  }

  generateFromTemplate(templateName: string, context: TemplateContext): string {
    const source = this.templates.get(templateName);
    if (!source) throw new Error(`Template not found: ${templateName}`);
    return this.engine.render(source, context);
  }

  /**
   * 在内存中构建项目文件树。
   * 真实 CLI 工具中会把这些节点写入磁盘；此处仅做数据结构演示。
   */
  buildProjectTree(projectName: string, options: {
    includeTests: boolean;
    includeLinting: boolean;
    language: 'ts' | 'js';
  }): DirNode {
    const ext = options.language === 'ts' ? 'ts' : 'js';
    const children: ScaffoldNode[] = [
      {
        type: 'file',
        path: `${projectName}/package.json`,
        content: this.generatePackageJson(projectName, options)
      },
      {
        type: 'file',
        path: `${projectName}/README.md`,
        content: this.generateReadme(projectName)
      },
      {
        type: 'file',
        path: `${projectName}/src/index.${ext}`,
        content: this.generateIndexFile(ext)
      },
      {
        type: 'dir',
        path: `${projectName}/src`,
        children: [
          { type: 'file', path: `${projectName}/src/utils.${ext}`, content: this.generateUtilsFile(ext) }
        ]
      }
    ];

    if (options.includeTests) {
      children.push({
        type: 'file',
        path: `${projectName}/tests/index.test.${ext}`,
        content: this.generateTestFile(projectName, ext)
      });
    }

    if (options.includeLinting) {
      children.push({
        type: 'file',
        path: `${projectName}/eslint.config.mjs`,
        content: this.generateEslintConfig()
      });
    }

    return {
      type: 'dir',
      path: projectName,
      children
    };
  }

  private generatePackageJson(name: string, options: { includeTests: boolean; includeLinting: boolean; language: 'ts' | 'js' }): string {
    const devDeps: string[] = [];
    if (options.language === 'ts') devDeps.push('"typescript": "^5.0.0"');
    if (options.includeTests) devDeps.push('"vitest": "^1.0.0"');
    if (options.includeLinting) devDeps.push('"eslint": "^8.0.0"');

    return JSON.stringify({
      name,
      version: '1.0.0',
      description: `A lightweight ${options.language.toUpperCase()} library`,
      main: `dist/index.${options.language === 'ts' ? 'js' : 'js'}`,
      scripts: {
        build: options.language === 'ts' ? 'tsc' : 'echo "No build step"',
        test: options.includeTests ? 'vitest' : 'echo "No tests"',
        lint: options.includeLinting ? 'eslint src/' : 'echo "No linter"'
      },
      devDependencies: devDeps.length > 0 ? JSON.parse(`{${devDeps.join(',')}}`) : {}
    }, null, 2);
  }

  private generateReadme(projectName: string): string {
    return `# ${projectName}\n\nA generated Node.js library.\n`;
  }

  private generateIndexFile(ext: string): string {
    return ext === 'ts'
      ? `export * from './utils.js';\n`
      : `module.exports = require('./utils');\n`;
  }

  private generateUtilsFile(ext: string): string {
    return ext === 'ts'
      ? `export function greet(name: string): string {\n  return \`Hello, \${name}!\`;\n}\n`
      : `function greet(name) {\n  return \`Hello, \${name}!\`;\n}\nmodule.exports = { greet };\n`;
  }

  private generateTestFile(projectName: string, ext: string): string {
    return ext === 'ts'
      ? `import { test, expect } from 'vitest';\nimport { greet } from '../src/utils.js';\n\ntest('greet works', () => {\n  expect(greet('World')).toBe('Hello, World!');\n});\n`
      : `const { greet } = require('../src/utils');\n\ntest('greet works', () => {\n  expect(greet('World')).toBe('Hello, World!');\n});\n`;
  }

  private generateEslintConfig(): string {
    return `export default [\n  {\n    files: ['src/**/*.{js,ts}'],\n    rules: {\n      'no-console': 'warn'\n    }\n  }\n];\n`;
  }
}

// ============================================================================
// 使用示例
// ============================================================================

export function demo(): void {
  console.log('=== 脚手架模板引擎演示 ===\n');

  const engine = new TemplateEngine();
  const template = `
项目名: {{projectName}}
版本: {{version}}
{{#if includeTests}}
测试框架: vitest
{{/if}}
依赖列表:
{{#each deps}}
  - {{@item}}
{{/each}}
`.trim();

  const rendered = engine.render(template, {
    projectName: 'my-awesome-lib',
    version: '1.0.0',
    includeTests: true,
    deps: 'lodash,express,zod'
  });

  console.log('--- 模板渲染结果 ---');
  console.log(rendered);

  console.log('\n--- 生成的项目结构 ---');
  const generator = new ScaffoldGenerator();
  const tree = generator.buildProjectTree('my-awesome-lib', {
    includeTests: true,
    includeLinting: true,
    language: 'ts'
  });

  function printTree(node: ScaffoldNode, indent = ''): void {
    if (node.type === 'file') {
      console.log(`${indent}📄 ${node.path}`);
    } else {
      console.log(`${indent}📁 ${node.path}/`);
      for (const child of node.children) {
        printTree(child, indent + '  ');
      }
    }
  }

  printTree(tree);
}
