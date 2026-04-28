/**
 * @file API 文档生成器
 * @category Documentation → API Docs
 * @difficulty easy
 * @tags documentation, api-docs, typedoc, markdown
 * 
 * @description
 * API 文档自动生成：
 * - TypeDoc 风格
 * - Markdown 输出
 * - 类型提取
 * - 示例代码
 */

// ============================================================================
// 1. 文档模型
// ============================================================================

export interface ApiDocModule {
  name: string;
  description?: string;
  exports: ApiDocExport[];
}

export interface ApiDocExport {
  kind: 'function' | 'class' | 'interface' | 'type' | 'variable' | 'enum';
  name: string;
  description?: string;
  since?: string;
  deprecated?: string;
  examples?: string[];
  params?: ApiDocParam[];
  returns?: ApiDocReturn;
  properties?: ApiDocProperty[];
  methods?: ApiDocMethod[];
  type?: string;
}

export interface ApiDocParam {
  name: string;
  type: string;
  description?: string;
  optional?: boolean;
  defaultValue?: string;
}

export interface ApiDocReturn {
  type: string;
  description?: string;
}

export interface ApiDocProperty {
  name: string;
  type: string;
  description?: string;
  optional?: boolean;
  readonly?: boolean;
}

export interface ApiDocMethod {
  name: string;
  description?: string;
  params: ApiDocParam[];
  returns?: ApiDocReturn;
}

// ============================================================================
// 2. 文档生成器
// ============================================================================

export class ApiDocsGenerator {
  private modules: ApiDocModule[] = [];

  addModule(module: ApiDocModule): void {
    this.modules.push(module);
  }

  generateMarkdown(): string {
    const lines: string[] = [];
    
    lines.push('# API Documentation');
    lines.push('');
    lines.push('> Auto-generated API documentation');
    lines.push('');
    
    // 目录
    lines.push('## Table of Contents');
    lines.push('');
    for (const mod of this.modules) {
      lines.push(`- [${mod.name}](#${this.anchor(mod.name)})`);
    }
    lines.push('');
    
    // 模块详情
    for (const mod of this.modules) {
      lines.push(...this.generateModuleDoc(mod));
    }
    
    return lines.join('\n');
  }

  private generateModuleDoc(mod: ApiDocModule): string[] {
    const lines: string[] = [];
    
    lines.push(`## ${mod.name}`);
    lines.push('');
    
    if (mod.description) {
      lines.push(mod.description);
      lines.push('');
    }
    
    // 按类型分组
    const byKind = this.groupByKind(mod.exports);
    
    for (const [kind, items] of Object.entries(byKind)) {
      if (items.length === 0) continue;
      
      lines.push(`### ${this.pluralize(kind)}`);
      lines.push('');
      
      for (const item of items) {
        lines.push(...this.generateExportDoc(item));
      }
    }
    
    return lines;
  }

  private generateExportDoc(item: ApiDocExport): string[] {
    const lines: string[] = [];
    
    // 标题和徽章
    const badges: string[] = [];
    if (item.since) badges.push(`![Since](https://img.shields.io/badge/since-${item.since}-blue)`);
    if (item.deprecated) badges.push(`![Deprecated](https://img.shields.io/badge/deprecated-red)`);
    
    lines.push(`#### ${item.name}${badges.length > 0 ? ' ' + badges.join(' ') : ''}`);
    lines.push('');
    
    // 描述
    if (item.description) {
      lines.push(item.description);
      lines.push('');
    }
    
    // 弃用警告
    if (item.deprecated) {
      lines.push(`> ⚠️ **Deprecated:** ${item.deprecated}`);
      lines.push('');
    }
    
    // 签名
    lines.push('**Signature:**');
    lines.push('```typescript');
    lines.push(this.generateSignature(item));
    lines.push('```');
    lines.push('');
    
    // 参数
    if (item.params && item.params.length > 0) {
      lines.push('**Parameters:**');
      lines.push('');
      lines.push('| Name | Type | Description |');
      lines.push('|------|------|-------------|');
      for (const param of item.params) {
        const optional = param.optional ? ' (optional)' : '';
        const defaultVal = param.defaultValue ? ` = ${param.defaultValue}` : '';
        lines.push(`| ${param.name}${optional}${defaultVal} | \`${param.type}\` | ${param.description || ''} |`);
      }
      lines.push('');
    }
    
    // 返回值
    if (item.returns) {
      lines.push(`**Returns:** \`${item.returns.type}\`${item.returns.description ? ` - ${item.returns.description}` : ''}`);
      lines.push('');
    }
    
    // 属性
    if (item.properties && item.properties.length > 0) {
      lines.push('**Properties:**');
      lines.push('');
      lines.push('| Name | Type | Description |');
      lines.push('|------|------|-------------|');
      for (const prop of item.properties) {
        const modifiers = [prop.readonly ? 'readonly' : '', prop.optional ? 'optional' : ''].filter(Boolean).join(', ');
        lines.push(`| ${prop.name}${modifiers ? ` (${modifiers})` : ''} | \`${prop.type}\` | ${prop.description || ''} |`);
      }
      lines.push('');
    }
    
    // 示例
    if (item.examples && item.examples.length > 0) {
      lines.push('**Examples:**');
      lines.push('');
      for (const example of item.examples) {
        lines.push('```typescript');
        lines.push(example);
        lines.push('```');
        lines.push('');
      }
    }
    
    return lines;
  }

  private generateSignature(item: ApiDocExport): string {
    switch (item.kind) {
      case 'function':
        const params = item.params?.map(p => {
          let str = p.name;
          if (p.optional) str += '?';
          str += `: ${p.type}`;
          if (p.defaultValue) str += ` = ${p.defaultValue}`;
          return str;
        }).join(', ') || '';
        const returnType = item.returns?.type || 'void';
        return `function ${item.name}(${params}): ${returnType};`;
      
      case 'interface':
        return `interface ${item.name} {\n  // ...\n}`;
      
      case 'type':
        return `type ${item.name} = ${item.type || 'any'};`;
      
      case 'class':
        return `class ${item.name} {\n  // ...\n}`;
      
      case 'enum':
        return `enum ${item.name} {\n  // ...\n}`;
      
      default:
        return `${item.kind} ${item.name};`;
    }
  }

  private groupByKind(exports: ApiDocExport[]): Record<string, ApiDocExport[]> {
    const groups: Record<string, ApiDocExport[]> = {
      class: [],
      interface: [],
      type: [],
      function: [],
      variable: [],
      enum: []
    };
    
    for (const exp of exports) {
      if (groups[exp.kind]) {
        groups[exp.kind].push(exp);
      }
    }
    
    return groups;
  }

  private pluralize(kind: string): string {
    const map: Record<string, string> = {
      class: 'Classes',
      interface: 'Interfaces',
      type: 'Types',
      function: 'Functions',
      variable: 'Variables',
      enum: 'Enums'
    };
    return map[kind] || kind;
  }

  private anchor(name: string): string {
    return name.toLowerCase().replace(/\s+/g, '-');
  }
}

// ============================================================================
// 3. 变更日志生成器
// ============================================================================

export interface ChangelogEntry {
  version: string;
  date: string;
  changes: {
    type: 'added' | 'changed' | 'deprecated' | 'removed' | 'fixed' | 'security';
    description: string;
  }[];
}

export class ChangelogGenerator {
  private entries: ChangelogEntry[] = [];

  addEntry(entry: ChangelogEntry): void {
    this.entries.push(entry);
    // 按版本倒序
    this.entries.sort((a, b) => this.compareVersions(b.version, a.version));
  }

  generate(): string {
    const lines: string[] = [];
    
    lines.push('# Changelog');
    lines.push('');
    lines.push('All notable changes to this project will be documented in this file.');
    lines.push('');
    lines.push('The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),');
    lines.push('and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).');
    lines.push('');
    
    for (const entry of this.entries) {
      lines.push(`## [${entry.version}] - ${entry.date}`);
      lines.push('');
      
      const grouped = this.groupByType(entry.changes);
      
      for (const [type, changes] of Object.entries(grouped)) {
        if (changes.length === 0) continue;
        
        lines.push(`### ${this.typeHeader(type)}`);
        lines.push('');
        for (const change of changes) {
          lines.push(`- ${change.description}`);
        }
        lines.push('');
      }
    }
    
    return lines.join('\n');
  }

  private groupByType(changes: ChangelogEntry['changes']): Record<string, typeof changes> {
    const groups: Record<string, typeof changes> = {
      added: [],
      changed: [],
      deprecated: [],
      removed: [],
      fixed: [],
      security: []
    };
    
    for (const change of changes) {
      groups[change.type].push(change);
    }
    
    return groups;
  }

  private typeHeader(type: string): string {
    const map: Record<string, string> = {
      added: 'Added',
      changed: 'Changed',
      deprecated: 'Deprecated',
      removed: 'Removed',
      fixed: 'Fixed',
      security: 'Security'
    };
    return map[type] || type;
  }

  private compareVersions(a: string, b: string): number {
    const partsA = a.split('.').map(Number);
    const partsB = b.split('.').map(Number);
    
    for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
      const partA = partsA[i] || 0;
      const partB = partsB[i] || 0;
      
      if (partA !== partB) {
        return partA - partB;
      }
    }
    
    return 0;
  }
}

// ============================================================================
// 4. 使用示例
// ============================================================================

export function demo(): void {
  console.log('=== API 文档生成器 ===\n');

  // 创建文档生成器
  const generator = new ApiDocsGenerator();

  // 添加模块
  generator.addModule({
    name: 'Utils',
    description: 'Utility functions for common operations',
    exports: [
      {
        kind: 'function',
        name: 'debounce',
        description: 'Creates a debounced function that delays invoking func until after wait milliseconds.',
        since: '1.0.0',
        params: [
          { name: 'fn', type: '(...args: T[]) => R', description: 'The function to debounce' },
          { name: 'wait', type: 'number', description: 'The number of milliseconds to delay', defaultValue: '300' },
          { name: 'immediate', type: 'boolean', description: 'Trigger on leading edge', optional: true, defaultValue: 'false' }
        ],
        returns: { type: '(...args: T[]) => R', description: 'The debounced function' },
        examples: [
          `const debounced = debounce(() => console.log('Hello'), 1000);
debounced();
debounced(); // Only the last call executes`
        ]
      },
      {
        kind: 'interface',
        name: 'CacheOptions',
        description: 'Configuration options for the cache',
        properties: [
          { name: 'ttl', type: 'number', description: 'Time to live in milliseconds', optional: true },
          { name: 'maxSize', type: 'number', description: 'Maximum number of entries' },
          { name: 'onEvict', type: '(key: string, value: unknown) => void', description: 'Callback when entry is evicted', optional: true }
        ]
      },
      {
        kind: 'class',
        name: 'EventEmitter',
        description: 'Simple event emitter implementation',
        methods: [
          { name: 'on', description: 'Subscribe to an event', params: [{ name: 'event', type: 'string' }, { name: 'handler', type: 'Function' }] },
          { name: 'emit', description: 'Emit an event', params: [{ name: 'event', type: 'string' }, { name: 'data', type: 'unknown', optional: true }] },
          { name: 'off', description: 'Unsubscribe from an event', params: [{ name: 'event', type: 'string' }, { name: 'handler', type: 'Function' }] }
        ]
      },
      {
        kind: 'type',
        name: 'JsonValue',
        description: 'Valid JSON value types',
        type: 'string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }'
      }
    ]
  });

  // 生成文档
  const markdown = generator.generateMarkdown();
  console.log(markdown.slice(0, 1500) + '...\n');

  // 变更日志
  console.log('=== Changelog Generator ===\n');
  const changelog = new ChangelogGenerator();
  
  changelog.addEntry({
    version: '2.0.0',
    date: '2024-01-15',
    changes: [
      { type: 'added', description: 'New caching system with TTL support' },
      { type: 'added', description: 'TypeScript 5.0 compatibility' },
      { type: 'changed', description: 'Improved error handling' },
      { type: 'removed', description: 'Dropped Node.js 14 support' }
    ]
  });

  changelog.addEntry({
    version: '1.5.0',
    date: '2023-12-01',
    changes: [
      { type: 'added', description: 'New utility functions: throttle, memoize' },
      { type: 'fixed', description: 'Memory leak in EventEmitter' }
    ]
  });

  console.log(changelog.generate().slice(0, 800));

  console.log('\n文档生成要点:');
  console.log('- 从代码注释提取文档');
  console.log('- 自动生成 TypeScript 类型签名');
  console.log('- 包含示例代码提高可读性');
  console.log('- 版本变更遵循语义化规范');
  console.log('- Markdown 格式便于托管');
}

// ============================================================================
// 导出 (已在上面导出)
// ============================================================================
