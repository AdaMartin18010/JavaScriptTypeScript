/**
 * @file npm 包管理基础
 * @category Package Management → npm
 * @difficulty medium
 * @tags npm, package-management, dependencies, semver
 * 
 * @description
 * npm 包管理系统的完整指南：
 * - package.json 字段详解
 * - 依赖类型 (dependencies/devDependencies/peerDependencies)
 * - 语义化版本控制 (SemVer)
 * - 脚本生命周期
 * - 包的发布与维护
 */

// ============================================================================
// 1. package.json 结构定义
// ============================================================================

export interface PackageJson {
  // 基本信息
  name: string;
  version: string;
  description?: string;
  main?: string;           // 入口文件
  module?: string;         // ES Module 入口
  types?: string;          // TypeScript 类型定义
  exports?: PackageExports; // 条件导出
  
  // 脚本
  scripts?: Record<string, string>;
  
  // 依赖
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  peerDependenciesMeta?: Record<string, { optional?: boolean }>;
  optionalDependencies?: Record<string, string>;
  bundledDependencies?: string[];
  
  // 引擎要求
  engines?: {
    node?: string;
    npm?: string;
    pnpm?: string;
  };
  
  // 包管理器
  packageManager?: string;
  
  // 发布配置
  publishConfig?: {
    registry?: string;
    access?: 'public' | 'restricted';
  };
  
  // 文件包含
  files?: string[];
  
  // 仓库信息
  repository?: {
    type: string;
    url: string;
    directory?: string;
  };
  
  // 其他元数据
  keywords?: string[];
  author?: string | { name: string; email?: string; url?: string };
  license?: string;
  bugs?: { url: string };
  homepage?: string;
}

// 条件导出配置
export interface PackageExports {
  '.': ExportConditions | string;
  [path: string]: ExportConditions | string | undefined;
}

export interface ExportConditions {
  import?: string;      // ESM 导入
  require?: string;     // CommonJS 导入
  types?: string;       // TypeScript 类型
  default?: string;     // 默认导出
  node?: string;
  browser?: string;
  development?: string;
  production?: string;
}

// ============================================================================
// 2. 语义化版本控制 (SemVer)
// ============================================================================

/**
 * 语义化版本: MAJOR.MINOR.PATCH
 * - MAJOR: 不兼容的 API 修改
 * - MINOR: 向后兼容的功能添加
 * - PATCH: 向后兼容的问题修复
 * 
 * 版本范围:
 * - ^1.2.3: 兼容 1.x.x (>=1.2.3 <2.0.0)
 * - ~1.2.3: 兼容 1.2.x (>=1.2.3 <1.3.0)
 * - >1.2.3: 大于 1.2.3
 * - >=1.2.3: 大于等于 1.2.3
 * - <2.0.0: 小于 2.0.0
 * - 1.2.3: 精确版本
 * - *: 最新版本
 */

export class SemVer {
  constructor(
    public major: number,
    public minor: number,
    public patch: number,
    public prerelease?: string,
    public build?: string
  ) {}

  static parse(version: string): SemVer {
    const match = version.match(/^(\d+)\.(\d+)\.(\d+)(?:-([a-zA-Z0-9.-]+))?(?:\+([a-zA-Z0-9.-]+))?$/);
    if (!match) {
      throw new Error(`Invalid version: ${version}`);
    }
    return new SemVer(
      parseInt(match[1], 10),
      parseInt(match[2], 10),
      parseInt(match[3], 10),
      match[4],
      match[5]
    );
  }

  toString(): string {
    let result = `${this.major}.${this.minor}.${this.patch}`;
    if (this.prerelease) result += `-${this.prerelease}`;
    if (this.build) result += `+${this.build}`;
    return result;
  }

  // 比较版本
  compare(other: SemVer): number {
    if (this.major !== other.major) return this.major - other.major;
    if (this.minor !== other.minor) return this.minor - other.minor;
    if (this.patch !== other.patch) return this.patch - other.patch;
    
    // 预发布版本处理
    if (this.prerelease && !other.prerelease) return -1;
    if (!this.prerelease && other.prerelease) return 1;
    if (this.prerelease && other.prerelease) {
      return this.prerelease.localeCompare(other.prerelease);
    }
    
    return 0;
  }

  satisfies(range: string): boolean {
    // 简化实现，实际应使用 semver 库
    if (range.startsWith('^')) {
      const min = SemVer.parse(range.slice(1));
      return this.compare(min) >= 0 && this.major === min.major;
    }
    if (range.startsWith('~')) {
      const min = SemVer.parse(range.slice(1));
      return this.compare(min) >= 0 && 
             this.major === min.major && 
             this.minor === min.minor;
    }
    if (range === '*') return true;
    
    try {
      return this.compare(SemVer.parse(range)) === 0;
    } catch {
      return false;
    }
  }
}

// ============================================================================
// 3. 依赖管理
// ============================================================================

export interface DependencyAnalysis {
  name: string;
  version: string;
  type: 'production' | 'development' | 'peer' | 'optional';
  size?: number;           // 包大小 (bytes)
  dependencies?: string[]; // 传递依赖
  outdated?: boolean;      // 是否有过时版本
  vulnerable?: boolean;    // 是否有安全漏洞
}

export class DependencyManager {
  private dependencies: Map<string, DependencyAnalysis> = new Map();

  addDependency(analysis: DependencyAnalysis): void {
    this.dependencies.set(`${analysis.name}@${analysis.version}`, analysis);
  }

  // 分析依赖树
  analyzeTree(): {
    total: number;
    production: number;
    development: number;
    peer: number;
    optional: number;
    duplicates: string[];
  } {
    const stats = {
      total: this.dependencies.size,
      production: 0,
      development: 0,
      peer: 0,
      optional: 0,
      duplicates: [] as string[]
    };

    const nameCount: Map<string, number> = new Map();

    for (const dep of this.dependencies.values()) {
      switch (dep.type) {
        case 'production': stats.production++; break;
        case 'development': stats.development++; break;
        case 'peer': stats.peer++; break;
        case 'optional': stats.optional++; break;
      }

      const count = nameCount.get(dep.name) || 0;
      nameCount.set(dep.name, count + 1);
    }

    // 找出重复依赖
    for (const [name, count] of nameCount) {
      if (count > 1) stats.duplicates.push(name);
    }

    return stats;
  }

  // 检查版本冲突
  checkConflicts(): Array<{ name: string; versions: string[] }> {
    const versionMap: Map<string, Set<string>> = new Map();

    for (const dep of this.dependencies.values()) {
      const versions = versionMap.get(dep.name) || new Set();
      versions.add(dep.version);
      versionMap.set(dep.name, versions);
    }

    const conflicts: Array<{ name: string; versions: string[] }> = [];
    for (const [name, versions] of versionMap) {
      if (versions.size > 1) {
        conflicts.push({ name, versions: Array.from(versions) });
      }
    }

    return conflicts;
  }

  // 生成依赖报告
  generateReport(): string {
    const stats = this.analyzeTree();
    const conflicts = this.checkConflicts();

    return `
依赖分析报告
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
总依赖数: ${stats.total}
  生产依赖: ${stats.production}
  开发依赖: ${stats.development}
  Peer 依赖: ${stats.peer}
  可选依赖: ${stats.optional}

重复依赖: ${stats.duplicates.length > 0 ? stats.duplicates.join(', ') : '无'}

版本冲突: ${conflicts.length > 0 ? conflicts.map(c => `${c.name}(${c.versions.join(', ')})`).join(', ') : '无'}
    `.trim();
  }
}

// ============================================================================
// 4. npm 脚本生命周期
// ============================================================================

/**
 * npm 脚本执行顺序:
 * 
 * npm publish:
 *   prepublishOnly → prepare → prepublish → publish → postpublish
 * 
 * npm install:
 *   preinstall → install → postinstall
 * 
 * npm uninstall:
 *   preuninstall → uninstall → postuninstall
 * 
 * npm version:
 *   preversion → version → postversion
 * 
 * npm test:
 *   pretest → test → posttest
 * 
 * npm run build:
 *   prebuild → build → postbuild
 */

export const NPM_LIFECYCLE = {
  publish: ['prepublishOnly', 'prepare', 'prepublish', 'publish', 'postpublish'],
  install: ['preinstall', 'install', 'postinstall'],
  uninstall: ['preuninstall', 'uninstall', 'postuninstall'],
  version: ['preversion', 'version', 'postversion'],
  test: ['pretest', 'test', 'posttest'],
  build: ['prebuild', 'build', 'postbuild']
} as const;

// ============================================================================
// 5. 包发布工具
// ============================================================================

export interface PublishOptions {
  registry?: string;
  access?: 'public' | 'restricted';
  tag?: string;        // 发布标签 (latest, beta, alpha)
  dryRun?: boolean;    // 试运行
  otp?: string;        // 双因素认证码
}

export class PackagePublisher {
  constructor(private packageJson: PackageJson) {}

  validate(): Array<{ field: string; error: string }> {
    const errors: Array<{ field: string; error: string }> = [];

    if (!this.packageJson.name) {
      errors.push({ field: 'name', error: 'Package name is required' });
    } else if (!this.isValidPackageName(this.packageJson.name)) {
      errors.push({ field: 'name', error: 'Invalid package name format' });
    }

    if (!this.packageJson.version) {
      errors.push({ field: 'version', error: 'Version is required' });
    } else {
      try {
        SemVer.parse(this.packageJson.version);
      } catch {
        errors.push({ field: 'version', error: 'Invalid semver format' });
      }
    }

    if (!this.packageJson.main && !this.packageJson.exports) {
      errors.push({ field: 'main/exports', error: 'Entry point is required' });
    }

    return errors;
  }

  private isValidPackageName(name: string): boolean {
    // 包名规则: 小写、可包含 - _ .、不能以 . 或 _ 开头
    return /^[a-z0-9][a-z0-9._-]*$/.test(name) && 
           !name.startsWith('.') && 
           !name.startsWith('_');
  }

  // 检查版本是否已存在
  async checkVersionExists(registry: string): Promise<boolean> {
    // 实际实现应查询 npm registry
    console.log(`Checking if ${this.packageJson.name}@${this.packageJson.version} exists at ${registry}`);
    return false;
  }

  // 生成发布清单
  generatePublishList(): string[] {
    const files = this.packageJson.files || ['*'];
    const alwaysIncluded = [
      'package.json',
      'README.md',
      'LICENSE'
    ];
    return [...new Set([...alwaysIncluded, ...files])];
  }
}

// ============================================================================
// 6. 使用示例
// ============================================================================

export function demo(): void {
  console.log('=== npm 包管理基础 ===\n');

  // SemVer 示例
  console.log('--- 语义化版本 ---');
  const v1 = SemVer.parse('1.2.3');
  const v2 = SemVer.parse('1.3.0');
  const v3 = SemVer.parse('2.0.0');

  console.log(`v1: ${v1}`);
  console.log(`v2: ${v2}`);
  console.log(`v1 vs v2: ${v1.compare(v2)}`); // -1
  console.log(`v1 satisfies ^1.0.0: ${v1.satisfies('^1.0.0')}`);
  console.log(`v3 satisfies ^1.0.0: ${v3.satisfies('^1.0.0')}`); // false

  // 依赖管理示例
  console.log('\n--- 依赖分析 ---');
  const manager = new DependencyManager();
  
  manager.addDependency({
    name: 'react',
    version: '18.2.0',
    type: 'production',
    size: 102400
  });
  
  manager.addDependency({
    name: 'typescript',
    version: '5.3.0',
    type: 'development',
    size: 204800
  });
  
  manager.addDependency({
    name: 'lodash',
    version: '4.17.21',
    type: 'production',
    size: 51200
  });

  console.log(manager.analyzeTree());
  console.log('\n' + manager.generateReport());

  // 包发布验证示例
  console.log('\n--- 包发布验证 ---');
  const pkg: PackageJson = {
    name: 'my-awesome-package',
    version: '1.0.0',
    main: 'index.js',
    description: 'An awesome package'
  };

  const publisher = new PackagePublisher(pkg);
  const errors = publisher.validate();
  
  if (errors.length === 0) {
    console.log('✅ 包验证通过');
    console.log('发布文件:', publisher.generatePublishList());
  } else {
    console.log('❌ 验证失败:');
    errors.forEach(e => console.log(`  - ${e.field}: ${e.error}`));
  }

  console.log('\n--- npm 生命周期 ---');
  console.log('发布生命周期:', NPM_LIFECYCLE.publish.join(' → '));
  console.log('测试生命周期:', NPM_LIFECYCLE.test.join(' → '));
}

// ============================================================================
// 导出
// ============================================================================

;

;
