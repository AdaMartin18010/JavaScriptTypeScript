/**
 * @file Oxc 工具链集成
 * @category Toolchain → Linting & Compilation
 * @difficulty medium
 * @tags oxc, oxlint, oxc-transform, rust, linter, compiler, babel-alternative
 *
 * @description
 * Oxc 是一套用 Rust 编写的高性能 JavaScript/TypeScript 工具链，
 * 包含编译器（oxc）、Linter（oxlint）、格式化器、解析器等。
 * 本文件展示：
 * - oxlint 的使用与规则配置
 * - oxc-transform 作为 Babel 替代方案
 * - 与 ESLint 的性能对比
 * - CI 集成示例与局限性分析
 */

// ============================================================================
// 1. Oxc 工具链介绍
// ============================================================================

/** Oxc 项目组件 */
export interface OxcProject {
  /** 项目名称 */
  name: string;
  /** 组件描述 */
  description: string;
  /** 状态 */
  status: 'stable' | 'beta' | 'alpha';
  /** 替代目标 */
  replaces: string;
}

/** Oxc 工具链各组件概览 */
export const oxcComponents: OxcProject[] = [
  {
    name: 'oxc_parser',
    description: 'JavaScript/TypeScript/JSX 解析器，零拷贝 AST 生成',
    status: 'stable',
    replaces: '@babel/parser, typescript (parser)'
  },
  {
    name: 'oxc_linter (oxlint)',
    description: '极速 Linter，ESLint 规则的 Rust 实现',
    status: 'stable',
    replaces: 'ESLint (部分规则)'
  },
  {
    name: 'oxc_transformer',
    description: '代码转换器，支持 JSX、TypeScript 剥离、降级',
    status: 'beta',
    replaces: '@babel/core, @babel/preset-env, @babel/preset-typescript, @babel/preset-react'
  },
  {
    name: 'oxc_minifier',
    description: 'JavaScript 代码压缩器',
    status: 'beta',
    replaces: 'terser, esbuild (minify), terser-webpack-plugin'
  },
  {
    name: 'oxc_resolver',
    description: 'Node.js 模块解析器',
    status: 'stable',
    replaces: 'enhanced-resolve, resolve'
  },
  {
    name: 'oxc_isolated_declarations',
    description: '独立声明文件生成（.d.ts）',
    status: 'beta',
    replaces: 'tsc --declaration (部分场景)'
  }
];

// ============================================================================
// 2. oxlint 配置类型与使用
// ============================================================================

/** oxlint 规则配置 */
export interface OxlintConfig {
  /** 环境配置 */
  env?: OxlintEnv;
  /** 全局变量 */
  globals?: Record<string, 'readonly' | 'writable' | 'off'>;
  /** 规则配置 */
  rules?: OxlintRules;
  /** 忽略文件 */
  ignorePatterns?: string[];
  /** 插件 */
  plugins?: OxlintPlugin[];
  /** 设置 */
  settings?: Record<string, unknown>;
}

/** oxlint 环境 */
export interface OxlintEnv {
  browser?: boolean;
  node?: boolean;
  es6?: boolean;
  es2020?: boolean;
  es2021?: boolean;
  jest?: boolean;
}

/** oxlint 规则集 */
export interface OxlintRules {
  /** 是否启用推荐规则 */
  recommended?: boolean;
  /** 规则列表 */
  [ruleName: string]: 'error' | 'warn' | 'off' | boolean | undefined;
}

/** oxlint 插件类型 */
export type OxlintPlugin = 'import' | 'typescript' | 'react' | 'react-perf' | 'nextjs' | 'jest' | 'jsdoc' | 'promise' | 'unicorn';

/** oxlint 命令行参数 */
export interface OxlintCliOptions {
  /** 指定目录或文件 */
  paths?: string[];
  /** 启用推荐规则 */
  recommended?: boolean;
  /** 配置规则 */
  rules?: Record<string, 'error' | 'warn' | 'off'>;
  /** 启用插件 */
  plugins?: OxlintPlugin[];
  /** 忽略文件 */
  ignorePatterns?: string[];
  /** 忽略文件（.gitignore 格式） */
  ignorePath?: string;
  /** 并行工作线程数 */
  threads?: number;
  /** 安静模式（仅显示错误） */
  quiet?: boolean;
  /** 忽略未知文件类型 */
  ignoreUnknownFiles?: boolean;
  /** 输出格式 */
  format?: 'default' | 'json' | 'unix' | 'checkstyle' | 'github';
  /** 输出文件 */
  output?: string;
  /** 仅检查变更文件 */
  changed?: boolean;
  /** 基准分支 */
  since?: string;
  /** 打印所有启用的规则 */
  printConfig?: boolean;
  /** 启用所有规则 */
  allRules?: boolean;
  /** 禁用所有规则 */
  noRules?: boolean;
}

/** oxlint CLI 命令集合 */
export const OxlintCommands = {
  /** 基础命令 */
  basic: {
    /** 检查当前目录 */
    checkCwd: 'npx oxlint@latest',
    /** 检查特定目录 */
    checkSrc: 'npx oxlint@latest ./src',
    /** 检查特定文件 */
    checkFile: 'npx oxlint@latest ./src/app.ts',
    /** 使用推荐规则 */
    recommended: 'npx oxlint@latest --recommended ./src'
  },

  /** 规则配置 */
  rules: {
    /** 启用所有规则 */
    allRules: 'npx oxlint@latest --all-rules ./src',
    /** 仅启用错误级别 */
    denyWarnings: 'npx oxlint@latest --deny-warnings ./src',
    /** 自定义规则 */
    custom: `npx oxlint@latest \\
      --rules 'no-console=warn,eqeqeq=error,no-unused-vars=error' \\
      ./src`,
    /** 打印当前配置 */
    printConfig: 'npx oxlint@latest --print-config ./src'
  },

  /** 插件使用 */
  plugins: {
    /** TypeScript 插件 */
    typescript: 'npx oxlint@latest --plugins typescript ./src',
    /** React 插件 */
    react: 'npx oxlint@latest --plugins react,react-perf ./src',
    /** Next.js 插件 */
    nextjs: 'npx oxlint@latest --plugins nextjs ./src',
    /** 全部插件 */
    all: 'npx oxlint@latest --plugins import,typescript,react,jest,promise,unicorn ./src'
  },

  /** CI / 自动化 */
  ci: {
    /** JSON 输出 */
    jsonOutput: 'npx oxlint@latest --format json --output lint-report.json ./src',
    /** Unix 格式输出 */
    unixOutput: 'npx oxlint@latest --format unix ./src',
    /** GitHub Actions 格式 */
    githubOutput: 'npx oxlint@latest --format github ./src',
    /** 仅检查变更文件 */
    changed: 'npx oxlint@latest --changed --since=origin/main ./src',
    /** 多线程加速 */
    threads: 'npx oxlint@latest --threads 4 ./src'
  },

  /** 忽略与过滤 */
  ignore: {
    /** 使用 ignore 文件 */
    ignoreFile: 'npx oxlint@latest --ignore-path .gitignore ./src',
    /** 忽略特定模式 */
    ignorePattern: 'npx oxlint@latest --ignore-pattern "*.test.ts" --ignore-pattern "*.spec.ts" ./src',
    /** 忽略未知文件 */
    ignoreUnknown: 'npx oxlint@latest --ignore-unknown-files ./src'
  }
};

/** oxlint 推荐 .oxlintrc.json 配置 */
export const oxlintRcExample = `
{
  "env": {
    "browser": true,
    "node": true,
    "es2021": true
  },
  "globals": {
    "console": "readonly",
    "Buffer": "readonly",
    "process": "readonly"
  },
  "plugins": ["import", "typescript", "react", "promise"],
  "rules": {
    "no-console": "warn",
    "no-debugger": "error",
    "no-unused-vars": "error",
    "eqeqeq": "error",
    "no-var": "error",
    "prefer-const": "error",
    "no-throw-literal": "error",
    "import/no-duplicates": "error",
    "typescript/no-explicit-any": "warn",
    "typescript/prefer-nullish-coalescing": "warn",
    "react/jsx-no-useless-fragment": "warn",
    "promise/catch-or-return": "warn"
  },
  "ignorePatterns": ["node_modules", "dist", "build", "*.config.js"]
}
`;

// ============================================================================
// 3. oxc-transform 使用（Babel 替代方案）
// ============================================================================

/** oxc-transform 转换选项 */
export interface OxcTransformOptions {
  /** 源码 */
  sourceText: string;
  /** 文件路径 */
  sourcePath?: string;
  /** 目标环境 */
  target?: 'esnext' | 'es2022' | 'es2021' | 'es2020' | 'es2019' | 'es2018' | 'es2017' | 'es2016' | 'es2015';
  /** 模块类型 */
  module?: 'es6' | 'commonjs';
  /** 启用 JSX */
  jsx?: boolean;
  /** JSX 运行时 */
  jsxRuntime?: 'automatic' | 'classic';
  /** TypeScript 剥离 */
  typescript?: boolean;
  /** 装饰器选项 */
  decorators?: {
    legacy?: boolean;
  };
  /** 压缩 */
  minify?: boolean;
}

/** oxc-transform 转换结果 */
export interface OxcTransformResult {
  /** 转换后的代码 */
  code: string;
  /** Source map */
  map?: string | null;
  /** 错误列表 */
  errors: OxcError[];
}

/** oxc 错误 */
export interface OxcError {
  message: string;
  severity: 'error' | 'warning';
  line?: number;
  column?: number;
}

/** oxc-transform API 使用示例（伪代码，展示接口） */
export const oxcTransformApiExample = `
// Node.js API 使用示例
import { transform } from 'oxc-transform';

const result = transform({
  sourceText: \`
    interface Props {
      name: string;
    }
    const Component = ({ name }: Props) => <div>{name}</div>;
  \`,
  sourcePath: 'Component.tsx',
  target: 'es2020',
  module: 'es6',
  jsx: true,
  jsxRuntime: 'automatic',
  typescript: true  // 剥离 TypeScript 类型
});

console.log(result.code);
// 输出:
// const Component = ({ name }) => <div>{name}</div>;
`;

/** oxc-transform 与 Babel 的功能对比 */
export const oxcTransformVsBabel: Array<{
  feature: string;
  oxc: 'supported' | 'partial' | 'not-yet';
  babel: 'supported' | 'partial' | 'not-applicable';
  note?: string;
}> = [
  { feature: 'JSX 转换', oxc: 'supported', babel: 'supported' },
  { feature: 'TypeScript 剥离', oxc: 'supported', babel: 'supported' },
  { feature: 'JSX Runtime Automatic', oxc: 'supported', babel: 'supported' },
  { feature: 'ES Module → CommonJS', oxc: 'supported', babel: 'supported' },
  { feature: 'ES 语法降级 (preset-env)', oxc: 'partial', babel: 'supported', note: 'oxc 支持常见降级，复杂 polyfill 需结合 core-js' },
  { feature: '装饰器 (Decorators)', oxc: 'partial', babel: 'supported', note: 'oxc 支持 legacy 装饰器' },
  { feature: 'Source Map', oxc: 'supported', babel: 'supported' },
  { feature: '插件生态系统', oxc: 'not-yet', babel: 'supported', note: 'oxc 暂无插件 API' },
  { feature: '自定义 AST 转换', oxc: 'not-yet', babel: 'supported', note: 'oxc 暂不支持自定义插件' },
  { feature: '性能', oxc: 'supported', babel: 'supported', note: 'oxc 比 Babel 快 10-50 倍' }
];

// ============================================================================
// 4. ESLint vs oxlint 性能对比
// ============================================================================

/** 性能基准数据 */
export interface PerformanceBenchmark {
  /** 项目名称 */
  project: string;
  /** 文件数量 */
  files: number;
  /** 代码行数 */
  linesOfCode: string;
  /** ESLint 耗时 */
  eslintDuration: string;
  /** oxlint 耗时 */
  oxlintDuration: string;
  /** 加速倍数 */
  speedup: string;
}

/** oxlint vs ESLint 性能对比数据（基于官方基准测试） */
export const performanceBenchmarks: PerformanceBenchmark[] = [
  {
    project: 'cal.com',
    files: 3000,
    linesOfCode: '~500K',
    eslintDuration: '~45s',
    oxlintDuration: '~0.5s',
    speedup: '90x'
  },
  {
    project: 'express.js',
    files: 150,
    linesOfCode: '~50K',
    eslintDuration: '~3s',
    oxlintDuration: '~0.03s',
    speedup: '100x'
  },
  {
    project: 'three.js',
    files: 800,
    linesOfCode: '~300K',
    eslintDuration: '~18s',
    oxlintDuration: '~0.2s',
    speedup: '90x'
  },
  {
    project: 'react',
    files: 1200,
    linesOfCode: '~200K',
    eslintDuration: '~12s',
    oxlintDuration: '~0.15s',
    speedup: '80x'
  },
  {
    project: 'VS Code',
    files: 15000,
    linesOfCode: '~3M',
    eslintDuration: '~180s',
    oxlintDuration: '~2s',
    speedup: '90x'
  }
];

/** 性能对比总结 */
export const performanceSummary = {
  /** 平均加速倍数 */
  averageSpeedup: '~90x',
  /** 主要优势来源 */
  reasons: [
    'Rust 编写的零拷贝解析器（oxc_parser）',
    '基于 arena 的内存分配策略，减少 GC 开销',
    '多线程并行 Lint（默认使用所有 CPU 核心）',
    '无插件系统开销（规则直接编译为机器码）',
    '单次 AST 遍历执行所有规则（ESLint 每规则一次遍历）'
  ],
  /** 适用场景 */
  bestFor: [
    '大型代码库（>1000 文件）',
    'CI/CD 流水线（需要快速反馈）',
    'pre-commit hook（用户可感知的速度）',
    'Monorepo 项目',
    '编辑器实时诊断（LSP 场景）'
  ]
};

// ============================================================================
// 5. CI 集成示例
// ============================================================================

/** GitHub Actions 中集成 oxlint */
export const ciWorkflowYaml = `
# .github/workflows/lint.yml
name: Lint

on: [push, pull_request]

jobs:
  oxlint:
    name: oxlint
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0  # 需要完整历史用于 --changed

      # 方案1: 直接使用 npx（推荐）
      - name: Run oxlint
        run: npx oxlint@latest --plugins import,typescript,react --deny-warnings ./src

      # 方案2: 使用官方 GitHub Action
      - name: Run oxlint (Official Action)
        uses: oxc-project/oxc-action@v1
        with:
          plugins: 'import,typescript,react'
          deny-warnings: true
          paths: './src'

      # 方案3: 仅检查变更文件（最快）
      - name: Run oxlint (changed files only)
        run: npx oxlint@latest --changed --since=origin/main ./src

      # 方案4: 生成 SARIF 报告上传 GitHub Security
      - name: Run oxlint with SARIF
        run: npx oxlint@latest --format github ./src
        continue-on-error: true
`;

/** pre-commit hook 配置 */
export const preCommitConfig = `
# .lintstagedrc.json
{
  "*.{js,jsx,ts,tsx}": [
    "oxlint --plugins import,typescript,react --fix",
    "prettier --write"
  ]
}

# 或使用 lefthook
# lefthook.yml
pre-commit:
  commands:
    oxlint:
      glob: "*.{js,ts,jsx,tsx}"
      run: npx oxlint@latest --plugins import,typescript,react --fix {staged_files}
`;

/** package.json scripts 推荐配置 */
export const recommendedScripts: Record<string, string> = {
  'lint:ox': 'oxlint --plugins import,typescript,react ./src',
  'lint:ox:fix': 'oxlint --plugins import,typescript,react --fix ./src',
  'lint:ox:ci': 'oxlint --plugins import,typescript,react --deny-warnings ./src',
  'lint:ox:changed': 'oxlint --plugins import,typescript,react --changed --since=origin/main ./src'
};

// ============================================================================
// 6. oxc 局限性分析
// ============================================================================

/** 局限性分类 */
export interface OxcLimitation {
  category: 'rules' | 'ecosystem' | 'features';
  title: string;
  description: string;
  workaround?: string;
  severity: 'high' | 'medium' | 'low';
}

/** oxc 当前局限性 */
export const oxcLimitations: OxcLimitation[] = [
  // 规则支持局限
  {
    category: 'rules',
    title: 'ESLint 规则覆盖率',
    description: 'oxlint 仅实现了 ESLint 约 200+ 条规则中的高频规则，复杂规则尚未覆盖',
    severity: 'medium',
    workaround: '可同时运行 ESLint（仅启用 oxlint 不支持的规则）+ oxlint（高频规则）'
  },
  {
    category: 'rules',
    title: '自定义规则（Custom Rules）',
    description: 'oxlint 暂不支持通过插件 API 编写自定义规则',
    severity: 'high',
    workaround: '需要自定义规则的项目仍需保留 ESLint'
  },
  {
    category: 'rules',
    title: '规则配置粒度',
    description: '部分 ESLint 规则支持丰富选项，oxlint 对应规则可能只支持基础版本',
    severity: 'medium',
    workaround: '检查具体规则的 options 支持情况，必要时回退 ESLint'
  },
  {
    category: 'rules',
    title: 'TypeScript 规则覆盖',
    description: '@typescript-eslint 的部分复杂规则（如 strict-boolean-expressions）尚未完全实现',
    severity: 'medium',
    workaround: '保留 @typescript-eslint/eslint-plugin 处理复杂类型规则'
  },

  // 生态局限
  {
    category: 'ecosystem',
    title: '格式化器（Formatter）',
    description: 'oxc_formatter 仍在开发中，尚未达到生产可用',
    severity: 'medium',
    workaround: '格式化继续使用 Prettier 或 dprint'
  },
  {
    category: 'ecosystem',
    title: '插件生态',
    description: '无插件 API，无法像 ESLint/Babel 那样扩展功能',
    severity: 'high',
    workaround: '在构建链中组合使用多个专用工具'
  },
  {
    category: 'ecosystem',
    title: '配置继承复杂度',
    description: 'extends / overrides 等高级配置语法支持有限',
    severity: 'low',
    workaround: '使用简单的扁平化配置'
  },

  // 功能局限
  {
    category: 'features',
    title: 'Source Map 质量',
    description: 'oxc_transform 的 source map 生成在某些复杂场景下可能不如 Babel 精确',
    severity: 'low',
    workaround: '调试困难场景可临时切换回 Babel'
  },
  {
    category: 'features',
    title: '装饰器支持',
    description: '仅支持 legacy 装饰器，TC39 新装饰器语法支持进行中',
    severity: 'medium',
    workaround: '使用 legacyDecorators: true 选项，或继续使用 Babel'
  },
  {
    category: 'features',
    title: 'Polyfill 注入',
    description: 'oxc-transform 不自动注入 core-js polyfill（不像 @babel/preset-env 的 useBuiltIns）',
    severity: 'medium',
    workaround: '手动管理 polyfill，或使用 core-js-bundle / polyfill.io'
  }
];

/** oxc 路线图 */
export const oxcRoadmap = [
  { phase: '当前', items: ['oxlint 稳定版', 'oxc_parser 稳定版', 'oxc_resolver 稳定版'] },
  { phase: '近期（6个月内）', items: ['oxc_transformer 稳定版', 'oxc_minifier 稳定版', '更多 ESLint 规则覆盖'] },
  { phase: '中期（12个月内）', items: ['oxc_formatter 稳定版', 'LSP 语言服务器完善', '配置继承增强'] },
  { phase: '长期', items: ['插件 API 设计', 'Wasm 绑定支持', '更多框架专用规则'] }
];

// ============================================================================
// 7. 混合方案：oxlint + ESLint 共存
// ============================================================================

/** 推荐的分层 Lint 策略 */
export const hybridLintingStrategy = {
  /** 第一层：oxlint（极速，覆盖 80% 规则） */
  layer1_oxlint: {
    description: '使用 oxlint 处理高频、无争议的规则',
    rules: [
      'correctness: no-debugger, no-undef, no-unreachable',
      'style: no-var, prefer-const, eqeqeq',
      'suspicious: no-console, no-empty-pattern',
      'import: no-duplicates',
      'typescript: no-explicit-any, prefer-nullish-coalescing'
    ],
    duration: '< 1s (10K 文件)'
  },

  /** 第二层：ESLint（精确，覆盖剩余 20% 规则） */
  layer2_eslint: {
    description: '使用 ESLint 处理复杂、自定义规则',
    rules: [
      '自定义规则（公司内部规范）',
      '复杂 TypeScript 规则（strict-boolean-expressions）',
      '未在 oxlint 中实现的框架规则',
      '深度代码质量规则（cyclomatic-complexity）'
    ],
    duration: '~5-15s（取决于规则数量）'
  }
};

/** 混合方案的 package.json scripts */
export const hybridScripts: Record<string, string> = {
  'lint': 'npm run lint:ox && npm run lint:eslint',
  'lint:ox': 'oxlint --plugins import,typescript,react --deny-warnings ./src',
  'lint:eslint': 'eslint ./src --ext .ts,.tsx',
  'lint:fix': 'oxlint --plugins import,typescript,react --fix ./src && eslint ./src --ext .ts,.tsx --fix',
  'lint:fast': 'oxlint --plugins import,typescript,react ./src'  // 开发时使用
};

// ============================================================================
// 8. 使用示例
// ============================================================================

export function demo(): void {
  console.log('=== Oxc 工具链集成 ===\n');

  console.log('1. Oxc 组件概览');
  oxcComponents.forEach(c => {
    console.log(`   ${c.name}: ${c.description} (${c.status})`);
  });

  console.log('\n2. oxlint 常用命令');
  console.log('   基础检查:', OxlintCommands.basic.checkSrc);
  console.log('   推荐规则:', OxlintCommands.basic.recommended);
  console.log('   TypeScript:', OxlintCommands.plugins.typescript);
  console.log('   React:', OxlintCommands.plugins.react);

  console.log('\n3. 性能对比');
  performanceBenchmarks.slice(0, 3).forEach(b => {
    console.log(`   ${b.project}: ESLint ${b.eslintDuration} → oxlint ${b.oxlintDuration} (${b.speedup})`);
  });

  console.log('\n4. oxc-transform vs Babel');
  oxcTransformVsBabel.forEach(item => {
    if (item.oxc !== 'supported' || item.babel !== 'supported') {
      console.log(`   ${item.feature}: oxc=${item.oxc}, babel=${item.babel}${item.note ? ' (' + item.note + ')' : ''}`);
    }
  });

  console.log('\n5. 主要局限性');
  const highSeverity = oxcLimitations.filter(l => l.severity === 'high');
  highSeverity.forEach(l => {
    console.log(`   [${l.category}] ${l.title}: ${l.description}`);
  });

  console.log('\n6. 混合方案');
  console.log('   分层策略：oxlint（快）+ ESLint（全）');
  console.log('   oxlint 层:', hybridLintingStrategy.layer1_oxlint.duration);
  console.log('   ESLint 层:', hybridLintingStrategy.layer2_eslint.duration);

  console.log('\n集成要点:');
  console.log('- oxlint 适合作为前置快速检查（<1s）');
  console.log('- ESLint 保留用于自定义规则和复杂场景');
  console.log('- oxc-transform 可作为 Babel 替代，但插件生态尚不成熟');
  console.log('- 大型项目使用混合方案可获得最佳体验');
  console.log('- 关注 oxc 路线图，逐步迁移更多工具链组件');
}

// ============================================================================
// 导出 (已在上面导出)
// ============================================================================
