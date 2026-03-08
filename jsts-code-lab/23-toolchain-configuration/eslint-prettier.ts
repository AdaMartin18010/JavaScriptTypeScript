/**
 * @file ESLint 和 Prettier 配置
 * @category Toolchain → Linting
 * @difficulty easy
 * @tags eslint, prettier, linting, code-quality
 * 
 * @description
 * 代码质量工具配置：
 * - ESLint 规则配置
 * - Prettier 格式化
 * - 集成配置
 * - 预设规则集
 */

// ============================================================================
// 1. ESLint 配置类型
// ============================================================================

export interface ESLintConfig {
  root?: boolean;
  env?: Record<string, boolean>;
  extends?: string[];
  parser?: string;
  parserOptions?: {
    ecmaVersion?: number;
    sourceType?: 'script' | 'module';
    project?: string;
  };
  plugins?: string[];
  rules?: Record<string, ESLintRuleValue>;
  overrides?: Array<{
    files: string[];
    rules?: Record<string, ESLintRuleValue>;
  }>;
  ignorePatterns?: string[];
  settings?: Record<string, unknown>;
}

type ESLintRuleValue = 'off' | 'warn' | 'error' | ['off' | 'warn' | 'error', ...unknown[]];

// ============================================================================
// 2. ESLint 配置构建器
// ============================================================================

export class ESLintConfigBuilder {
  private config: ESLintConfig = { root: true };

  setRoot(value = true): ESLintConfigBuilder {
    this.config.root = value;
    return this;
  }

  env(name: string, enabled = true): ESLintConfigBuilder {
    this.config.env = this.config.env || {};
    this.config.env[name] = enabled;
    return this;
  }

  browser(): ESLintConfigBuilder {
    return this.env('browser', true).env('es2021', true);
  }

  node(): ESLintConfigBuilder {
    return this.env('node', true).env('es2021', true);
  }

  jest(): ESLintConfigBuilder {
    return this.env('jest', true);
  }

  extend(...configs: string[]): ESLintConfigBuilder {
    this.config.extends = this.config.extends || [];
    this.config.extends.push(...configs);
    return this;
  }

  useParser(parser: string): ESLintConfigBuilder {
    this.config.parser = parser;
    return this;
  }

  useTypeScript(project?: string): ESLintConfigBuilder {
    this.config.parser = '@typescript-eslint/parser';
    this.config.parserOptions = {
      ecmaVersion: 2022,
      sourceType: 'module',
      project
    };
    return this.plugin('@typescript-eslint')
               .extend('plugin:@typescript-eslint/recommended');
  }

  plugin(...plugins: string[]): ESLintConfigBuilder {
    this.config.plugins = this.config.plugins || [];
    this.config.plugins.push(...plugins);
    return this;
  }

  rule(name: string, value: ESLintRuleValue): ESLintConfigBuilder {
    this.config.rules = this.config.rules || {};
    this.config.rules[name] = value;
    return this;
  }

  override(files: string[], rules: Record<string, ESLintRuleValue>): ESLintConfigBuilder {
    this.config.overrides = this.config.overrides || [];
    this.config.overrides.push({ files, rules });
    return this;
  }

  ignore(...patterns: string[]): ESLintConfigBuilder {
    this.config.ignorePatterns = this.config.ignorePatterns || [];
    this.config.ignorePatterns.push(...patterns);
    return this;
  }

  build(): ESLintConfig {
    return this.config;
  }

  toJSON(): string {
    return JSON.stringify(this.config, null, 2);
  }
}

// ============================================================================
// 3. Prettier 配置类型
// ============================================================================

export interface PrettierConfig {
  semi?: boolean;
  singleQuote?: boolean;
  tabWidth?: number;
  useTabs?: boolean;
  printWidth?: number;
  trailingComma?: 'none' | 'es5' | 'all';
  bracketSpacing?: boolean;
  arrowParens?: 'avoid' | 'always';
  endOfLine?: 'lf' | 'crlf' | 'auto';
  jsxSingleQuote?: boolean;
  bracketSameLine?: boolean;
}

// ============================================================================
// 4. Prettier 配置构建器
// ============================================================================

export class PrettierConfigBuilder {
  private config: PrettierConfig = {};

  semi(enabled = true): PrettierConfigBuilder {
    this.config.semi = enabled;
    return this;
  }

  singleQuote(enabled = true): PrettierConfigBuilder {
    this.config.singleQuote = enabled;
    return this;
  }

  tabWidth(width: number): PrettierConfigBuilder {
    this.config.tabWidth = width;
    return this;
  }

  useTabs(enabled = true): PrettierConfigBuilder {
    this.config.useTabs = enabled;
    return this;
  }

  printWidth(width: number): PrettierConfigBuilder {
    this.config.printWidth = width;
    return this;
  }

  trailingComma(style: PrettierConfig['trailingComma']): PrettierConfigBuilder {
    this.config.trailingComma = style;
    return this;
  }

  bracketSpacing(enabled = true): PrettierConfigBuilder {
    this.config.bracketSpacing = enabled;
    return this;
  }

  arrowParens(style: PrettierConfig['arrowParens']): PrettierConfigBuilder {
    this.config.arrowParens = style;
    return this;
  }

  endOfLine(style: PrettierConfig['endOfLine']): PrettierConfigBuilder {
    this.config.endOfLine = style;
    return this;
  }

  build(): PrettierConfig {
    return this.config;
  }

  toJSON(): string {
    return JSON.stringify(this.config, null, 2);
  }
}

// ============================================================================
// 5. 预设配置
// ============================================================================

export const ESLintPresets = {
  // TypeScript 项目
  typescript(): ESLintConfig {
    return new ESLintConfigBuilder()
      .setRoot()
      .node()
      .extend('eslint:recommended')
      .useTypeScript('./tsconfig.json')
      .rule('@typescript-eslint/no-unused-vars', ['error', { argsIgnorePattern: '^_' }])
      .rule('@typescript-eslint/explicit-function-return-type', 'off')
      .rule('@typescript-eslint/no-explicit-any', 'warn')
      .ignore('dist/', 'node_modules/', '*.js')
      .build();
  },

  // React 项目
  react(): ESLintConfig {
    return new ESLintConfigBuilder()
      .setRoot()
      .browser()
      .extend('eslint:recommended', 'plugin:react/recommended', 'plugin:react-hooks/recommended')
      .useTypeScript()
      .plugin('react', 'react-hooks')
      .rule('react/react-in-jsx-scope', 'off')
      .rule('react/prop-types', 'off')
      .ignore('dist/', 'node_modules/', 'build/')
      .build();
  },

  // Vue 项目
  vue(): ESLintConfig {
    return new ESLintConfigBuilder()
      .setRoot()
      .browser()
      .extend('eslint:recommended', 'plugin:vue/vue3-recommended')
      .useParser('vue-eslint-parser')
      .plugin('vue')
      .rule('vue/multi-word-component-names', 'off')
      .build();
  },

  // Node.js 项目
  nodejs(): ESLintConfig {
    return new ESLintConfigBuilder()
      .setRoot()
      .node()
      .extend('eslint:recommended', 'plugin:node/recommended')
      .plugin('node')
      .rule('node/no-unpublished-require', 'off')
      .build();
  },

  // 严格模式
  strict(): ESLintConfig {
    return new ESLintConfigBuilder()
      .setRoot()
      .node()
      .extend('eslint:all', 'plugin:@typescript-eslint/strict')
      .useTypeScript()
      .rule('no-console', 'warn')
      .rule('@typescript-eslint/no-explicit-any', 'error')
      .build();
  }
};

export const PrettierPresets = {
  // 默认配置
  default(): PrettierConfig {
    return new PrettierConfigBuilder()
      .semi()
      .singleQuote()
      .tabWidth(2)
      .printWidth(80)
      .trailingComma('es5')
      .bracketSpacing()
      .arrowParens('avoid')
      .endOfLine('lf')
      .build();
  },

  // 紧凑配置
  compact(): PrettierConfig {
    return new PrettierConfigBuilder()
      .semi()
      .singleQuote()
      .tabWidth(2)
      .printWidth(100)
      .trailingComma('all')
      .bracketSpacing()
      .arrowParens('always')
      .build();
  },

  // 宽松配置
  relaxed(): PrettierConfig {
    return new PrettierConfigBuilder()
      .semi(false)
      .singleQuote()
      .tabWidth(4)
      .printWidth(120)
      .trailingComma('none')
      .bracketSpacing()
      .arrowParens('avoid')
      .build();
  }
};

// ============================================================================
// 6. 配置集成
// ============================================================================

export class LintingSetup {
  // 生成 package.json scripts
  static generateScripts(): Record<string, string> {
    return {
      'lint': 'eslint . --ext .ts,.tsx',
      'lint:fix': 'eslint . --ext .ts,.tsx --fix',
      'format': 'prettier --write "**/*.{ts,tsx,js,jsx,json,md}"',
      'format:check': 'prettier --check "**/*.{ts,tsx,js,jsx,json,md}"'
    };
  }

  // 生成推荐的 .vscode/settings.json
  static generateVSCodeSettings(): Record<string, unknown> {
    return {
      'editor.defaultFormatter': 'esbenp.prettier-vscode',
      'editor.formatOnSave': true,
      'editor.codeActionsOnSave': {
        'source.fixAll.eslint': 'explicit'
      },
      'typescript.tsdk': 'node_modules/typescript/lib',
      '[typescript]': {
        'editor.defaultFormatter': 'esbenp.prettier-vscode'
      }
    };
  }

  // 生成 git hook 配置
  static generateHuskyConfig(): { 'lint-staged': Record<string, string[]> } {
    return {
      'lint-staged': {
        '*.{ts,tsx}': ['eslint --fix', 'prettier --write'],
        '*.{js,jsx}': ['eslint --fix', 'prettier --write'],
        '*.{json,md}': ['prettier --write']
      }
    };
  }
}

// ============================================================================
// 7. 使用示例
// ============================================================================

export function demo(): void {
  console.log('=== ESLint 和 Prettier 配置 ===\n');

  console.log('1. TypeScript ESLint 配置');
  const tsConfig = ESLintPresets.typescript();
  console.log('   Extends:', tsConfig.extends?.slice(0, 3).join(', ') + '...');
  console.log('   Parser:', tsConfig.parser);
  console.log('   Plugins:', tsConfig.plugins?.join(', ') || 'none');

  console.log('\n2. React ESLint 配置');
  const reactConfig = ESLintPresets.react();
  console.log('   Extends:', reactConfig.extends?.join(', '));
  console.log('   Plugins:', reactConfig.plugins?.join(', '));

  console.log('\n3. Prettier 配置');
  const prettierConfig = PrettierPresets.default();
  console.log('   Semi:', prettierConfig.semi);
  console.log('   Single Quote:', prettierConfig.singleQuote);
  console.log('   Tab Width:', prettierConfig.tabWidth);
  console.log('   Print Width:', prettierConfig.printWidth);

  console.log('\n4. 自定义 ESLint 配置');
  const customESLint = new ESLintConfigBuilder()
    .setRoot()
    .node()
    .browser()
    .extend('eslint:recommended')
    .useTypeScript()
    .rule('no-console', 'warn')
    .rule('prefer-const', 'error')
    .ignore('dist/', '*.config.js')
    .build();
  console.log('   Rules:', Object.keys(customESLint.rules || {}).length);

  console.log('\n5. 自定义 Prettier 配置');
  const customPrettier = new PrettierConfigBuilder()
    .semi(true)
    .singleQuote(true)
    .tabWidth(2)
    .printWidth(100)
    .trailingComma('all')
    .build();
  console.log('   Config:', JSON.stringify(customPrettier));

  console.log('\n6. VS Code 设置');
  const vscodeSettings = LintingSetup.generateVSCodeSettings();
  console.log('   Default Formatter:', vscodeSettings['editor.defaultFormatter']);
  console.log('   Format On Save:', vscodeSettings['editor.formatOnSave']);

  console.log('\n7. Package Scripts');
  const scripts = LintingSetup.generateScripts();
  Object.entries(scripts).forEach(([name, cmd]) => {
    console.log(`   ${name}: ${cmd}`);
  });

  console.log('\n代码质量工具要点:');
  console.log('- ESLint: 静态代码分析，发现潜在问题');
  console.log('- Prettier: 统一代码格式，减少风格争论');
  console.log('- 集成工作流：提交前自动检查和格式化');
  console.log('- 预设配置：根据项目类型选择合适规则');
  console.log('- 渐进式：从宽松开始，逐步收紧规则');
}

// ============================================================================
// 导出 (已在上面导出)
// ============================================================================
