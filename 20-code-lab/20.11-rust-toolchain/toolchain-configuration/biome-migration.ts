/**
 * @file 从 ESLint + Prettier 迁移到 Biome
 * @category Toolchain → Linting & Formatting
 * @difficulty medium
 * @tags biome, eslint, prettier, migration, linting, formatting, rust
 *
 * @description
 * Biome 是一个基于 Rust 编写的高性能 JavaScript/TypeScript 代码质量工具，
 * 旨在作为 ESLint + Prettier 的单一替代方案。本文件展示：
 * - Biome 配置结构与最佳实践
 * - ESLint/Prettier 到 Biome 的规则映射
 * - 迁移步骤与检查清单
 * - Biome 1.x 新特性（CSS、GraphQL 支持）
 */

// ============================================================================
// 1. Biome 配置类型定义
// ============================================================================

/** Biome 顶层配置结构 */
export interface BiomeConfig {
  /** 配置文件的 schema 引用 */
  $schema?: string;
  /** 组织信息 */
  organizer?: { enabled?: boolean };
  /** 环境配置 */
  files?: BiomeFilesConfig;
  /** 格式化配置 */
  formatter?: BiomeFormatterConfig;
  /** Linter 配置 */
  linter?: BiomeLinterConfig;
  /** JavaScript 相关配置 */
  javascript?: BiomeJavascriptConfig;
  /** JSON 相关配置 */
  json?: BiomeJsonConfig;
  /** CSS 相关配置 (Biome 1.x 新增) */
  css?: BiomeCssConfig;
  /** GraphQL 相关配置 (Biome 1.x 新增) */
  graphql?: BiomeGraphqlConfig;
  /** 覆盖配置 */
  overrides?: BiomeOverride[];
  /** VCS 集成 */
  vcs?: BiomeVcsConfig;
}

/** 文件匹配配置 */
export interface BiomeFilesConfig {
  include?: string[];
  ignore?: string[];
  ignoreUnknown?: boolean;
}

/** 格式化器配置 */
export interface BiomeFormatterConfig {
  enabled?: boolean;
  /** 缩进样式：tab 或 space */
  indentStyle?: 'tab' | 'space';
  /** 缩进宽度 */
  indentWidth?: number;
  /** 行宽 */
  lineWidth?: number;
  /** 行尾符 */
  lineEnding?: 'lf' | 'crlf' | 'cr';
  /** 引号样式 */
  quoteStyle?: 'single' | 'double';
  /** JSX 引号样式 */
  jsxQuoteStyle?: 'single' | 'double';
  /** 分号样式 */
  semicolons?: 'always' | 'asNeeded';
  /** 尾随逗号 */
  trailingCommas?: 'all' | 'es5' | 'none';
  /** 括号间距 */
  bracketSpacing?: boolean;
  /** 箭头函数括号 */
  arrowParentheses?: 'always' | 'asNeeded';
}

/** Linter 配置 */
export interface BiomeLinterConfig {
  enabled?: boolean;
  /** 规则配置 */
  rules?: BiomeRules;
}

/** 规则分类配置 */
export interface BiomeRules {
  all?: boolean;
  recommended?: boolean;
  /** 语法正确性 */
  correctness?: BiomeRuleSet;
  /** 性能 */
  performance?: BiomeRuleSet;
  /** 安全性 */
  security?: BiomeRuleSet;
  /** 风格 */
  style?: BiomeRuleSet;
  /** 可疑代码 */
  suspicious?: BiomeRuleSet;
  /** 复杂度 */
  complexity?: BiomeRuleSet;
  /** 可访问性 (a11y) */
  a11y?: BiomeRuleSet;
  /** 复杂度规则 */
  nursery?: BiomeRuleSet;
}

/** 规则集合：启用/禁用/警告 */
export interface BiomeRuleSet {
  [ruleName: string]: 'error' | 'warn' | 'off' | { level: 'error' | 'warn'; options?: Record<string, unknown> };
}

/** JavaScript 解析配置 */
export interface BiomeJavascriptConfig {
  formatter?: BiomeFormatterConfig;
  linter?: BiomeLinterConfig;
  globals?: string[];
}

/** JSON 配置 */
export interface BiomeJsonConfig {
  formatter?: BiomeFormatterConfig;
  linter?: BiomeLinterConfig;
  parser?: { allowComments?: boolean; allowTrailingCommas?: boolean };
}

/** CSS 配置 (Biome 1.x 新增) */
export interface BiomeCssConfig {
  formatter?: BiomeFormatterConfig;
  linter?: BiomeLinterConfig;
  parser?: { cssModules?: boolean };
}

/** GraphQL 配置 (Biome 1.x 新增) */
export interface BiomeGraphqlConfig {
  formatter?: BiomeFormatterConfig;
  linter?: BiomeLinterConfig;
}

/** 覆盖配置 */
export interface BiomeOverride {
  include: string[];
  formatter?: BiomeFormatterConfig;
  linter?: BiomeLinterConfig;
  javascript?: BiomeJavascriptConfig;
}

/** VCS 集成配置 */
export interface BiomeVcsConfig {
  enabled?: boolean;
  clientKind?: 'git';
  useIgnoreFile?: boolean;
  defaultBranch?: string;
}

// ============================================================================
// 2. biome.json 配置构建器
// ============================================================================

export class BiomeConfigBuilder {
  private config: BiomeConfig = {
    $schema: 'https://biomejs.dev/schemas/1.9.4/schema.json',
    files: {
      ignoreUnknown: true,
      ignore: ['node_modules', 'dist', 'build', 'coverage']
    }
  };

  /** 启用推荐规则集 */
  useRecommended(): this {
    this.config.linter = this.config.linter || { enabled: true };
    this.config.linter.rules = this.config.linter.rules || {};
    this.config.linter.rules.recommended = true;
    return this;
  }

  /** 设置格式化器选项 */
  setFormatter(options: Partial<BiomeFormatterConfig>): this {
    this.config.formatter = { enabled: true, ...this.config.formatter, ...options };
    return this;
  }

  /** 设置缩进样式 */
  indent(style: 'tab' | 'space', width = 2): this {
    return this.setFormatter({ indentStyle: style, indentWidth: width });
  }

  /** 设置行宽 */
  lineWidth(width: number): this {
    return this.setFormatter({ lineWidth: width });
  }

  /** 设置引号样式 */
  quotes(style: 'single' | 'double'): this {
    return this.setFormatter({ quoteStyle: style });
  }

  /** 设置 JSX 引号样式 */
  jsxQuotes(style: 'single' | 'double'): this {
    return this.setFormatter({ jsxQuoteStyle: style });
  }

  /** 设置分号样式 */
  semicolons(style: 'always' | 'asNeeded'): this {
    return this.setFormatter({ semicolons: style });
  }

  /** 设置尾随逗号 */
  trailingCommas(style: 'all' | 'es5' | 'none'): this {
    return this.setFormatter({ trailingCommas: style });
  }

  /** 启用/禁用 Linter */
  linter(enabled = true): this {
    this.config.linter = { enabled, rules: this.config.linter?.rules };
    return this;
  }

  /** 添加规则 */
  rule(category: keyof BiomeRules, name: string, level: 'error' | 'warn' | 'off'): this {
    this.config.linter = this.config.linter || { enabled: true };
    this.config.linter.rules = this.config.linter.rules || {};
    const rules = this.config.linter.rules;
    const cat = rules[category] as Record<string, unknown> || {};
    cat[name] = level;
    (rules[category] as Record<string, unknown>) = cat;
    return this;
  }

  /** 添加全局变量 */
  globals(...names: string[]): this {
    this.config.javascript = this.config.javascript || {};
    this.config.javascript.globals = [...(this.config.javascript.globals || []), ...names];
    return this;
  }

  /** 添加忽略文件 */
  ignore(...patterns: string[]): this {
    this.config.files = this.config.files || {};
    this.config.files.ignore = [...(this.config.files.ignore || []), ...patterns];
    return this;
  }

  /** 添加覆盖配置 */
  override(include: string[], config: Partial<BiomeOverride>): this {
    this.config.overrides = this.config.overrides || [];
    this.config.overrides.push({ include, ...config } as BiomeOverride);
    return this;
  }

  /** 启用 VCS 集成 */
  vcs(): this {
    this.config.vcs = { enabled: true, clientKind: 'git', useIgnoreFile: true, defaultBranch: 'main' };
    return this;
  }

  /** 启用 CSS 支持 (Biome 1.x) */
  enableCss(): this {
    this.config.css = {
      formatter: { enabled: true },
      linter: { enabled: true }
    };
    return this;
  }

  /** 启用 GraphQL 支持 (Biome 1.x) */
  enableGraphql(): this {
    this.config.graphql = {
      formatter: { enabled: true },
      linter: { enabled: true }
    };
    return this;
  }

  /** 构建配置 */
  build(): BiomeConfig {
    return this.config;
  }

  /** 序列化为 JSON 字符串 */
  toJSON(): string {
    return JSON.stringify(this.config, null, 2);
  }
}

// ============================================================================
// 3. 预设配置
// ============================================================================

export const BiomePresets = {
  /** TypeScript 项目推荐配置 */
  typescript(): BiomeConfig {
    return new BiomeConfigBuilder()
      .useRecommended()
      .indent('space', 2)
      .lineWidth(80)
      .quotes('single')
      .semicolons('always')
      .trailingCommas('all')
      .linter(true)
      .rule('style', 'noVar', 'error')
      .rule('style', 'useConst', 'error')
      .rule('suspicious', 'noConsoleLog', 'warn')
      .rule('correctness', 'noUnusedVariables', 'error')
      .rule('complexity', 'noForEach', 'warn')
      .globals('console', 'setTimeout', 'setInterval')
      .vcs()
      .build();
  },

  /** React 项目配置 */
  react(): BiomeConfig {
    return new BiomeConfigBuilder()
      .useRecommended()
      .indent('space', 2)
      .lineWidth(80)
      .quotes('single')
      .jsxQuotes('double')
      .semicolons('always')
      .trailingCommas('all')
      .linter(true)
      .rule('a11y', 'recommended', 'error')
      .rule('suspicious', 'noArrayIndexKey', 'error')
      .rule('style', 'noVar', 'error')
      .ignore('*.d.ts', 'vite.config.ts')
      .build();
  },

  /** 严格模式配置 */
  strict(): BiomeConfig {
    return new BiomeConfigBuilder()
      .useRecommended()
      .linter(true)
      .rule('style', 'noVar', 'error')
      .rule('style', 'useConst', 'error')
      .rule('style', 'useTemplate', 'error')
      .rule('suspicious', 'noConsoleLog', 'error')
      .rule('suspicious', 'noExplicitAny', 'error')
      .rule('correctness', 'noUnusedVariables', 'error')
      .rule('correctness', 'noUnusedImports', 'error')
      .rule('complexity', 'noForEach', 'error')
      .rule('complexity', 'useSimplifiedLogicExpression', 'warn')
      .build();
  }
};

// ============================================================================
// 4. ESLint/Prettier → Biome 规则映射表
// ============================================================================

/** 规则映射项 */
export interface RuleMapping {
  /** ESLint/Prettier 规则名 */
  source: string;
  /** Biome 对应规则名 */
  biome: string | null;
  /** 映射状态 */
  status: 'mapped' | 'partial' | 'not-supported' | 'not-needed';
  /** 备注说明 */
  note?: string;
}

/** ESLint 规则 → Biome 规则映射表 */
export const eslintToBiomeMappings: RuleMapping[] = [
  // 风格规则
  { source: 'indent', biome: 'formatter.indentStyle / indentWidth', status: 'mapped', note: '在 formatter 中配置' },
  { source: 'quotes', biome: 'formatter.quoteStyle', status: 'mapped', note: '在 formatter 中配置' },
  { source: 'semi', biome: 'formatter.semicolons', status: 'mapped', note: '在 formatter 中配置' },
  { source: 'comma-dangle', biome: 'formatter.trailingCommas', status: 'mapped', note: '在 formatter 中配置' },
  { source: 'max-len', biome: 'formatter.lineWidth', status: 'mapped', note: '在 formatter 中配置' },
  { source: 'no-var', biome: 'style.noVar', status: 'mapped' },
  { source: 'prefer-const', biome: 'style.useConst', status: 'mapped' },
  { source: 'no-console', biome: 'suspicious.noConsoleLog', status: 'partial', note: 'Biome 仅支持 noConsoleLog' },
  { source: 'no-unused-vars', biome: 'correctness.noUnusedVariables', status: 'mapped' },
  { source: 'no-unused-imports', biome: 'correctness.noUnusedImports', status: 'mapped' },
  { source: 'eqeqeq', biome: 'style.useTripleEqual', status: 'mapped' },
  { source: 'no-undef', biome: null, status: 'not-supported', note: '需配合 TypeScript 类型检查' },
  { source: 'no-restricted-syntax', biome: null, status: 'not-supported', note: 'Biome 不支持自定义 AST 规则' },

  // TypeScript 规则
  { source: '@typescript-eslint/no-explicit-any', biome: 'suspicious.noExplicitAny', status: 'mapped' },
  { source: '@typescript-eslint/prefer-nullish-coalescing', biome: 'style.useNullishCoalescing', status: 'mapped' },
  { source: '@typescript-eslint/prefer-optional-chain', biome: 'style.useOptionalChain', status: 'mapped' },
  { source: '@typescript-eslint/consistent-type-imports', biome: 'style.useImportType', status: 'mapped' },
  { source: '@typescript-eslint/no-non-null-assertion', biome: 'style.noNonNullAssertion', status: 'mapped' },

  // React 规则
  { source: 'react/react-in-jsx-scope', biome: null, status: 'not-needed', note: 'React 17+ 不再需要' },
  { source: 'react/prop-types', biome: null, status: 'not-needed', note: 'TypeScript 项目不需要' },
  { source: 'react-hooks/rules-of-hooks', biome: 'correctness.useHookAtTopLevel', status: 'mapped' },
  { source: 'react-hooks/exhaustive-deps', biome: 'correctness.useExhaustiveDependencies', status: 'mapped' },
  { source: 'jsx-a11y/alt-text', biome: 'a11y.useAltText', status: 'mapped' },
  { source: 'jsx-a11y/anchor-is-valid', biome: 'a11y.useValidAnchor', status: 'mapped' },

  // 复杂度规则
  { source: 'no-for-each/no-for-each', biome: 'complexity.noForEach', status: 'mapped' },
  { source: 'no-nested-ternary', biome: 'style.noNestedTernary', status: 'mapped' },
];

/** Prettier 选项 → Biome 选项映射表 */
export const prettierToBiomeMappings: Array<{ prettier: string; biome: string; values?: string }> = [
  { prettier: 'printWidth', biome: 'lineWidth' },
  { prettier: 'tabWidth', biome: 'indentWidth' },
  { prettier: 'useTabs', biome: 'indentStyle (tab/space)' },
  { prettier: 'semi', biome: 'semicolons (always/asNeeded)' },
  { prettier: 'singleQuote', biome: 'quoteStyle (single/double)' },
  { prettier: 'jsxSingleQuote', biome: 'jsxQuoteStyle (single/double)' },
  { prettier: 'trailingComma', biome: 'trailingCommas (all/es5/none)' },
  { prettier: 'bracketSpacing', biome: 'bracketSpacing' },
  { prettier: 'arrowParens', biome: 'arrowParentheses (always/asNeeded)' },
  { prettier: 'endOfLine', biome: 'lineEnding (lf/crlf/cr)' },
];

// ============================================================================
// 5. Biome 命令用法
// ============================================================================

/** Biome CLI 命令 */
export const BiomeCommands = {
  /** 格式化命令 */
  format: {
    /** 格式化所有文件 */
    write: 'biome format --write ./src',
    /** 检查格式化（CI 中使用） */
    check: 'biome format ./src',
    /** 格式化并显示差异 */
    diff: 'biome format --write --changed ./src',
    /** 格式化特定文件 */
    specific: 'biome format --write ./src/app.ts ./src/utils.ts',
    /** 使用特定配置 */
    withConfig: 'biome format --config-path=./biome.json --write ./src'
  },

  /** Lint 命令 */
  lint: {
    /** 检查所有文件 */
    check: 'biome lint ./src',
    /** 自动修复 */
    fix: 'biome lint --write ./src',
    /** 应用不安全修复 */
    fixUnsafe: 'biome lint --write --unsafe ./src',
    /** 仅显示错误 */
    errorsOnly: 'biome lint --error-on-warnings ./src',
    /** 统计规则命中 */
    stats: 'biome lint --reporter=summary ./src'
  },

  /** Check 命令（lint + format + organize imports） */
  check: {
    /** 完整检查 */
    full: 'biome check ./src',
    /** 自动修复所有问题 */
    write: 'biome check --write ./src',
    /** 应用所有修复（包括不安全） */
    writeUnsafe: 'biome check --write --unsafe ./src',
    /** 仅检查变更的文件 */
    changed: 'biome check --changed --since=origin/main ./src',
    /** CI 模式 */
    ci: 'biome ci ./src'
  },

  /** 迁移命令 */
  migrate: {
    /** 从 ESLint 配置迁移 */
    fromEslint: 'biome migrate eslint --write',
    /** 从 Prettier 配置迁移 */
    fromPrettier: 'biome migrate prettier --write',
    /** 执行配置升级 */
    upgrade: 'biome migrate --write'
  },

  /** 其他命令 */
  other: {
    /** 初始化配置 */
    init: 'biome init',
    /** 版本信息 */
    version: 'biome --version',
    /** LSP 服务器 */
    lsp: 'biome lsp-proxy',
    /** 打印配置 */
    printConfig: 'biome print-config'
  }
};

// ============================================================================
// 6. 迁移检查清单
// ============================================================================

/** 迁移步骤 */
export interface MigrationStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  category: 'preparation' | 'installation' | 'configuration' | 'validation' | 'cleanup';
}

/** ESLint + Prettier → Biome 迁移检查清单 */
export const migrationChecklist: MigrationStep[] = [
  // 准备阶段
  {
    id: 1,
    title: '评估项目复杂度',
    description: '检查 ESLint 插件依赖数量，确认是否使用 Biome 不支持的规则',
    completed: false,
    category: 'preparation'
  },
  {
    id: 2,
    title: '审查自定义规则',
    description: '列出所有 ESLint 自定义规则和插件，与 Biome 规则映射表对比',
    completed: false,
    category: 'preparation'
  },
  {
    id: 3,
    title: '备份现有配置',
    description: '备份 .eslintrc, .prettierrc, eslintignore, prettierignore 文件',
    completed: false,
    category: 'preparation'
  },

  // 安装阶段
  {
    id: 4,
    title: '卸载 ESLint + Prettier',
    description: 'npm uninstall eslint prettier eslint-config-* eslint-plugin-*',
    completed: false,
    category: 'installation'
  },
  {
    id: 5,
    title: '安装 Biome',
    description: 'npm install --save-dev @biomejs/biome',
    completed: false,
    category: 'installation'
  },

  // 配置阶段
  {
    id: 6,
    title: '初始化 Biome 配置',
    description: '运行 biome init 或使用迁移命令 biome migrate prettier --write',
    completed: false,
    category: 'configuration'
  },
  {
    id: 7,
    title: '映射 ESLint 规则',
    description: '参考规则映射表，在 biome.json 的 linter.rules 中配置对应规则',
    completed: false,
    category: 'configuration'
  },
  {
    id: 8,
    title: '调整格式化选项',
    description: '将 Prettier 配置映射到 biome.json 的 formatter 部分',
    completed: false,
    category: 'configuration'
  },
  {
    id: 9,
    title: '配置忽略文件',
    description: '将 .eslintignore / .prettierignore 内容合并到 biome.json files.ignore',
    completed: false,
    category: 'configuration'
  },

  // 验证阶段
  {
    id: 10,
    title: '运行格式化检查',
    description: '执行 biome format ./src 检查格式化差异',
    completed: false,
    category: 'validation'
  },
  {
    id: 11,
    title: '运行 Linter 检查',
    description: '执行 biome lint ./src 检查规则差异，处理未映射的规则',
    completed: false,
    category: 'validation'
  },
  {
    id: 12,
    title: 'CI 集成测试',
    description: '在 CI 中运行 biome ci ./src 确保无回归',
    completed: false,
    category: 'validation'
  },

  // 清理阶段
  {
    id: 13,
    title: '删除旧配置文件',
    description: '删除 .eslintrc*, .prettierrc*, .eslintignore, .prettierignore',
    completed: false,
    category: 'cleanup'
  },
  {
    id: 14,
    title: '更新 package.json scripts',
    description: '替换 lint/format 脚本为 biome 命令',
    completed: false,
    category: 'cleanup'
  },
  {
    id: 15,
    title: '更新编辑器配置',
    description: '安装 Biome VS Code 扩展，更新 settings.json',
    completed: false,
    category: 'cleanup'
  }
];

// ============================================================================
// 7. Biome 1.x 新特性
// ============================================================================

/** Biome 1.x 主要新特性 */
export const Biome1xFeatures = {
  /** CSS 支持 */
  css: {
    version: '1.8.0+',
    description: 'Biome 新增了对 CSS 文件的格式化和 Lint 支持',
    capabilities: [
      'CSS 格式化（与 Prettier 兼容）',
      'CSS Linter（检测常见错误和最佳实践）',
      'CSS Modules 支持（通过 css.parser.cssModules 配置）',
      '嵌套 CSS 语法支持'
    ],
    configExample: `{
  "css": {
    "formatter": { "enabled": true },
    "linter": { "enabled": true },
    "parser": { "cssModules": true }
  }
}`
  },

  /** GraphQL 支持 */
  graphql: {
    version: '1.9.0+',
    description: 'Biome 新增了对 GraphQL 文件的格式化和 Lint 支持',
    capabilities: [
      'GraphQL Schema 格式化',
      'GraphQL Query/Mutation 格式化',
      'GraphQL Linter（语法检查和最佳实践）',
      '支持 .graphql, .gql 文件扩展名'
    ],
    configExample: `{
  "graphql": {
    "formatter": { "enabled": true },
    "linter": { "enabled": true }
  }
}`
  },

  /** 其他重要改进 */
  improvements: [
    { feature: '性能提升', description: '格式化速度比 Prettier 快 10-20 倍' },
    { feature: '组织导入', description: '新增 organizer.enabled 选项，自动排序 imports' },
    { feature: '规则增强', description: '新增数十条 lint 规则，覆盖更多场景' },
    { feature: '配置继承', description: '支持 extends 字段继承其他配置文件' },
    { feature: 'JSON 支持增强', description: '支持 JSONC（带注释的 JSON）和 JSON5' }
  ]
};

// ============================================================================
// 8. package.json scripts 与 CI 配置
// ============================================================================

/** 推荐的 package.json scripts */
export const recommendedScripts: Record<string, string> = {
  'lint': 'biome lint ./src',
  'lint:fix': 'biome lint --write ./src',
  'format': 'biome format --write ./src',
  'format:check': 'biome format ./src',
  'check': 'biome check --write ./src',
  'check:ci': 'biome ci ./src',
  'check:changed': 'biome check --changed --since=origin/main ./src'
};

/** GitHub Actions CI 配置示例 */
export const ciWorkflowYaml = `
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # 需要完整历史用于 --changed

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      # 安装 Biome（如果使用独立二进制）
      - name: Setup Biome
        uses: biomejs/setup-biome@v2
        with:
          version: '1.9.4'

      # 方式1: 检查所有文件
      - name: Run Biome check
        run: biome ci ./src

      # 方式2: 仅检查变更文件（更快）
      # - name: Run Biome check (changed only)
      #   run: biome check --changed --since=origin/main ./src
`;

// ============================================================================
// 9. biome.json 完整配置示例（注释中的 JSON）
// ============================================================================

/** biome.json 完整示例 */
export const biomeJsonExample = `
{
  "$schema": "https://biomejs.dev/schemas/1.9.4/schema.json",
  "organizer": {
    "enabled": true
  },
  "files": {
    "ignoreUnknown": true,
    "ignore": [
      "node_modules",
      "dist",
      "build",
      "coverage",
      "*.min.js",
      ".next",
      ".nuxt"
    ]
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 80,
    "lineEnding": "lf",
    "quoteStyle": "single",
    "jsxQuoteStyle": "double",
    "semicolons": "always",
    "trailingCommas": "all",
    "bracketSpacing": true,
    "arrowParentheses": "always"
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "correctness": {
        "noUnusedVariables": "error",
        "noUnusedImports": "error",
        "noUnreachable": "error",
        "noEmptyPattern": "error"
      },
      "suspicious": {
        "noConsoleLog": "warn",
        "noExplicitAny": "warn",
        "noAssignInExpressions": "error",
        "noDoubleEquals": "error"
      },
      "style": {
        "noVar": "error",
        "useConst": "error",
        "useTemplate": "warn",
        "useImportType": "error",
        "noNonNullAssertion": "warn",
        "useNodejsImportProtocol": "error"
      },
      "complexity": {
        "noForEach": "warn",
        "noStaticOnlyClass": "warn",
        "useSimplifiedLogicExpression": "warn"
      },
      "performance": {
        "noAccumulatingSpread": "error",
        "noDelete": "warn"
      },
      "a11y": {
        "recommended": true
      },
      "security": {
        "noGlobalEval": "error"
      }
    }
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "semicolons": "always"
    },
    "globals": ["console", "setTimeout", "setInterval", "fetch", "Buffer"]
  },
  "json": {
    "formatter": {
      "enabled": true
    },
    "parser": {
      "allowComments": true,
      "allowTrailingCommas": true
    }
  },
  "css": {
    "formatter": {
      "enabled": true
    },
    "linter": {
      "enabled": true
    },
    "parser": {
      "cssModules": true
    }
  },
  "graphql": {
    "formatter": {
      "enabled": true
    },
    "linter": {
      "enabled": true
    }
  },
  "overrides": [
    {
      "include": ["*.test.ts", "*.spec.ts", "*.test.tsx", "*.spec.tsx"],
      "linter": {
        "rules": {
          "suspicious": {
            "noConsoleLog": "off"
          }
        }
      }
    },
    {
      "include": ["*.config.ts", "*.config.js"],
      "linter": {
        "rules": {
          "style": {
            "noDefaultExport": "off"
          }
        }
      }
    }
  ],
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true,
    "defaultBranch": "main"
  }
}
`;

// ============================================================================
// 10. 使用示例
// ============================================================================

export function demo(): void {
  console.log('=== Biome 迁移指南 ===\n');

  console.log('1. 生成 TypeScript 预设配置');
  const tsConfig = BiomePresets.typescript();
  console.log('   Schema:', tsConfig.$schema);
  console.log('   Formatter Enabled:', tsConfig.formatter?.enabled);
  console.log('   Linter Enabled:', tsConfig.linter?.enabled);
  console.log('   Rules Categories:', Object.keys(tsConfig.linter?.rules || {}).join(', '));

  console.log('\n2. 规则映射示例');
  const mapped = eslintToBiomeMappings.filter(m => m.status === 'mapped').slice(0, 5);
  mapped.forEach(m => {
    console.log(`   ${m.source} → ${m.biome}`);
  });

  console.log('\n3. 常用命令');
  console.log('   格式化:', BiomeCommands.format.write);
  console.log('   Lint:', BiomeCommands.lint.check);
  console.log('   完整检查:', BiomeCommands.check.full);
  console.log('   CI 模式:', BiomeCommands.check.ci);

  console.log('\n4. 迁移检查清单进度');
  const total = migrationChecklist.length;
  const byCategory = migrationChecklist.reduce((acc, step) => {
    acc[step.category] = (acc[step.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  console.log(`   总计 ${total} 个步骤`);
  Object.entries(byCategory).forEach(([cat, count]) => {
    console.log(`   ${cat}: ${count} 步`);
  });

  console.log('\n5. Biome 1.x 新特性');
  console.log('   CSS 支持:', Biome1xFeatures.css.version);
  console.log('   GraphQL 支持:', Biome1xFeatures.graphql.version);
  Biome1xFeatures.improvements.forEach(item => {
    console.log(`   ${item.feature}: ${item.description}`);
  });

  console.log('\n迁移要点:');
  console.log('- Biome 是一个工具替代 ESLint + Prettier 两个工具');
  console.log('- 使用 biome migrate 命令可自动迁移配置');
  console.log('- 大部分常用规则已支持，复杂自定义规则可能需保留 ESLint');
  console.log('- 性能提升显著：Lint 速度快 10-50 倍，格式化快 10-20 倍');
  console.log('- 1.x 新增 CSS 和 GraphQL 支持，覆盖更多文件类型');
}

// ============================================================================
// 导出 (已在上面导出)
// ============================================================================
