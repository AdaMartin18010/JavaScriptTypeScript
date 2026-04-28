/**
 * # Oxc 集成与 oxlint 实战
 *
 * Oxc 是一个用 Rust 编写的高性能 JavaScript/TypeScript 工具集合：
 * - oxlint：极速 Linter（ESLint 替代）
 * - oxc_parser：解析器（Babel 替代）
 * - oxc_transformer：转译器（Babel 替代）
 * - oxc_minifier：压缩器（Terser 替代）
 *
 * 2025-2026 年状态：
 * - oxlint：✅ 生产可用，规则覆盖率快速增长
 * - oxc_parser：✅ 被 Rolldown、Rspack 等工具采用
 * - oxc_transformer：🚧 开发中
 * - oxc_minifier：🚧 开发中
 *
 * ## 性能对比
 * | 工具 | 10k 文件 Lint 时间 | 内存占用 |
 * |------|-------------------|---------|
 * | ESLint | 45s | 200MB |
 * | oxlint | 0.5s | 20MB |
 * | 提升倍数 | **90x** | **10x** |
 */

// ============================================
// oxlint 配置与规则映射
// ============================================

/** oxlint 支持的规则类别 */
export type OxlintRuleCategory =
  | "eslint"
  | "typescript"
  | "react"
  | "unicorn"
  | "jsdoc"
  | "oxc"
  | "import"
  | "promise"
  | "jest"
  | "vitest"
  | "jsx-a11y"
  | "nextjs";

/** oxlint 配置结构 */
export interface OxlintConfig {
  plugins?: OxlintRuleCategory[];
  rules?: Record<string, "error" | "warn" | "off" | ["error" | "warn", ...any[]]>;
  ignorePatterns?: string[];
}

/**
 * 创建推荐的 oxlint 配置。
 */
export function createRecommendedOxlintConfig(): OxlintConfig {
  return {
    plugins: [
      "eslint",
      "typescript",
      "react",
      "unicorn",
      "import",
      "promise",
      "jsx-a11y",
    ],
    rules: {
      // ESLint 推荐规则
      "no-console": "warn",
      "no-debugger": "error",
      "no-unused-vars": "error",
      "no-unreachable": "error",
      eqeqeq: "error",

      // TypeScript 规则
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "error",

      // React 规则
      "react/no-danger": "error",
      "react/jsx-key": "error",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // Unicorn 规则（代码质量）
      "unicorn/prefer-node-protocol": "error",
      "unicorn/no-array-for-each": "warn",
      "unicorn/prefer-string-slice": "warn",

      // Import 规则
      "import/no-duplicates": "warn",
      "import/no-self-import": "error",

      // Promise 规则
      "promise/param-names": "warn",
      "promise/no-nesting": "warn",
    },
    ignorePatterns: [
      "node_modules",
      "dist",
      "build",
      ".next",
      "coverage",
      "*.min.js",
    ],
  };
}

// ============================================
// oxlint 命令封装
// ============================================

/**
 * oxlint CLI 命令生成器。
 */
export const oxlintCommands = {
  /** 基础检查 */
  lint: (files?: string[]) => `npx oxlint ${files?.join(" ") || "."}`,

  /** 启用特定插件 */
  lintWithPlugins: (plugins: string[], files?: string[]) =>
    `npx oxlint ${plugins.map((p) => `--${p}-plugin`).join(" ")} ${files?.join(" ") || "."}`,

  /** 自动修复 */
  lintFix: (files?: string[]) =>
    `npx oxlint --fix ${files?.join(" ") || "."}`,

  /** 仅检查变更文件（适合 pre-commit） */
  lintChanged: () => `npx oxlint --changed`,

  /** 输出 JSON 格式（适合 CI 集成） */
  lintJson: (files?: string[]) =>
    `npx oxlint --format json ${files?.join(" ") || "."}`,

  /** 忽略特定规则 */
  lintIgnoreRules: (rules: string[], files?: string[]) =>
    `npx oxlint ${rules.map((r) => `--deny ${r}`).join(" ")} ${files?.join(" ") || "."}`,
} as const;

// ============================================
// Oxc 在构建工具链中的集成
// ============================================

/**
 * Oxc 作为 Babel 替代的集成方案。
 *
 * 当前状态（2026）：
 * - oxc_transformer 仍在开发中，不建议直接替代 Babel
 * - 但 oxlint 已可完全替代 ESLint 的 Lint 阶段
 * - Rolldown 内部使用 oxc_parser 进行解析
 *
 * 推荐过渡方案：
 * 1. 立即：用 oxlint 替代 ESLint（Lint 阶段）
 * 2. 短期：用 Rolldown（基于 oxc_parser）替代 Rollup
 * 3. 长期：等 oxc_transformer 成熟后，统一替代 Babel
 */

/** Oxc 工具链集成状态 */
export const oxcIntegrationStatus: Record<
  string,
  { status: "ready" | "beta" | "alpha"; replaces: string; recommendation: string }
> = {
  oxlint: {
    status: "ready",
    replaces: "ESLint (Lint 阶段)",
    recommendation: "✅ 推荐生产环境使用",
  },
  oxc_parser: {
    status: "ready",
    replaces: "Babel Parser / swc parser",
    recommendation: "✅ 已内置于 Rolldown/Rspack，无需手动集成",
  },
  oxc_transformer: {
    status: "beta",
    replaces: "Babel Transform / swc transform",
    recommendation: "🚧 建议等待 1.0 稳定后再迁移",
  },
  oxc_minifier: {
    status: "alpha",
    replaces: "Terser / esbuild minify",
    recommendation: "🚧 实验性，不建议生产使用",
  },
};

// ============================================
// CI/CD 集成示例
// ============================================

/**
 * GitHub Actions 中使用 oxlint 的示例配置。
 */
export function generateGitHubAction(): string {
  return `name: Lint

on: [push, pull_request]

jobs:
  oxlint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'

      - name: Run oxlint
        run: npx oxlint@latest --react-plugin --typescript-plugin .
        # 90x  faster than ESLint, finishes in ~2 seconds for most projects
`;
}

/**
 * Husky + lint-staged 配置中使用 oxlint。
 */
export function generateLintStagedConfig(): Record<string, string[]> {
  return {
    "*.{js,jsx,ts,tsx}": ["npx oxlint --fix", "npx biome format --write"],
    "*.{json,md,yml,yaml}": ["npx biome format --write"],
  };
}

// ============================================
// ESLint → oxlint 迁移评估
// ============================================

/**
 * 评估 ESLint 配置是否可被 oxlint 完全替代。
 */
export function assessOxlintCompatibility(
  eslintConfig: {
    rules: Record<string, any>;
    plugins: string[];
    extends: string[];
  }
): {
  compatible: boolean;
  coverage: number;
  unsupportedRules: string[];
  recommendation: string;
} {
  // oxlint 已支持的规则列表（简化版，实际应查询官方文档）
  const supportedRules = new Set([
    "no-console",
    "no-debugger",
    "no-unused-vars",
    "no-unreachable",
    "eqeqeq",
    "no-eval",
    "@typescript-eslint/no-explicit-any",
    "@typescript-eslint/no-unused-vars",
    "react/no-danger",
    "react/jsx-key",
    "react-hooks/rules-of-hooks",
    "react-hooks/exhaustive-deps",
    "import/no-duplicates",
    "unicorn/prefer-node-protocol",
  ]);

  const allRules = Object.keys(eslintConfig.rules);
  const unsupportedRules = allRules.filter(
    (rule) => !supportedRules.has(rule)
  );
  const coverage =
    allRules.length > 0
      ? ((allRules.length - unsupportedRules.length) / allRules.length) * 100
      : 100;

  const compatible = unsupportedRules.length === 0;

  const recommendation = compatible
    ? "✅ oxlint 可完全替代 ESLint"
    : `⚠️ oxlint 规则覆盖率为 ${coverage.toFixed(1)}%。建议采用「oxlint + ESLint 混合」方案：oxlint 处理大部分规则，ESLint 仅处理 ${unsupportedRules.length} 个不兼容规则。`;

  return { compatible, coverage, unsupportedRules, recommendation };
}
