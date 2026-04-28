/**
 * # Biome 配置与迁移指南
 *
 * Biome 是用 Rust 编写的统一工具链，目标是替代 ESLint + Prettier。
 * 2025 年 Biome 1.x 已稳定，社区采纳率快速增长。
 *
 * ## 性能对比
 * | 场景 | ESLint + Prettier | Biome | 提升倍数 |
 * |------|-------------------|-------|---------|
 * | Lint 10k 行代码 | 3.2s | 0.08s | 40x |
 * | Format 10k 行代码 | 1.5s | 0.05s | 30x |
 * | 内存占用 | 120MB | 15MB | 8x |
 *
 * ## 兼容性
 * - ✅ ESLint recommended 规则覆盖率: ~90%
 * - ✅ Prettier 格式化兼容性: ~96%
 * - ⚠️ 自定义 ESLint 插件: 不支持（需重写为 Biome 插件）
 * - ⚠️ TypeScript 类型感知规则: 部分缺失（需配合 tsc）
 */

// ============================================
// Biome 配置文件生成器
// ============================================

/** Biome 配置结构 */
export interface BiomeConfig {
  $schema: string;
  organizer: {
    enabled: boolean;
  };
  linter: {
    enabled: boolean;
    rules: BiomeLinterRules;
  };
  formatter: {
    enabled: boolean;
    formatWithErrors: boolean;
    indentStyle: "tab" | "space";
    indentWidth: number;
    lineWidth: number;
    lineEnding: "lf" | "crlf" | "cr";
  };
  javascript: {
    formatter: {
      quoteStyle: "double" | "single";
      jsxQuoteStyle: "double" | "single";
      trailingCommas: "all" | "es5" | "none";
      semicolons: "always" | "asNeeded";
    };
  };
  files: {
    ignore: string[];
  };
}

/** Biome Linter 规则配置 */
export interface BiomeLinterRules {
  recommended?: boolean;
  complexity?: Record<string, "error" | "warn" | "off">;
  correctness?: Record<string, "error" | "warn" | "off">;
  performance?: Record<string, "error" | "warn" | "off">;
  security?: Record<string, "error" | "warn" | "off">;
  style?: Record<string, "error" | "warn" | "off">;
  suspicious?: Record<string, "error" | "warn" | "off">;
}

/**
 * 创建推荐的 Biome 配置。
 * 基于 ESLint + Prettier 的最佳实践映射。
 */
export function createRecommendedBiomeConfig(): BiomeConfig {
  return {
    $schema: "https://biomejs.dev/schemas/1.9.4/schema.json",
    organizer: {
      enabled: true, // 自动组织 imports
    },
    linter: {
      enabled: true,
      rules: {
        recommended: true,
        complexity: {
          noForEach: "warn",
          noStaticOnlyClass: "error",
          noUselessSwitchCase: "warn",
        },
        correctness: {
          noUnusedVariables: "error",
          noUnusedImports: "error",
          noUnreachable: "error",
          noConstAssign: "error",
        },
        performance: {
          noDelete: "warn",
        },
        security: {
          noDangerouslySetInnerHtml: "error",
          noGlobalEval: "error",
        },
        style: {
          noVar: "error",
          useConst: "error",
          useTemplate: "warn",
          useShorthandArrayType: "warn",
        },
        suspicious: {
          noConsoleLog: "warn",
          noDebugger: "error",
          noExplicitAny: "warn",
          noDoubleEquals: "error",
        },
      },
    },
    formatter: {
      enabled: true,
      formatWithErrors: false,
      indentStyle: "space",
      indentWidth: 2,
      lineWidth: 80,
      lineEnding: "lf",
    },
    javascript: {
      formatter: {
        quoteStyle: "double",
        jsxQuoteStyle: "double",
        trailingCommas: "all",
        semicolons: "always",
      },
    },
    files: {
      ignore: [
        "node_modules",
        "dist",
        "build",
        ".next",
        "coverage",
        "*.min.js",
        "*.min.css",
      ],
    },
  };
}

/**
 * 从 ESLint 配置迁移到 Biome 配置的映射器。
 */
export function migrateEslintToBiome(
  eslintRules: Record<string, any>
): BiomeLinterRules {
  const biomeRules: BiomeLinterRules = {
    recommended: true,
  };

  const ruleMapping: Record<string, [string, string]> = {
    // ESLint 核心规则 → Biome 规则
    "no-var": ["style", "noVar"],
    "prefer-const": ["style", "useConst"],
    "no-console": ["suspicious", "noConsoleLog"],
    "no-debugger": ["suspicious", "noDebugger"],
    "no-unused-vars": ["correctness", "noUnusedVariables"],
    "no-unreachable": ["correctness", "noUnreachable"],
    eqeqeq: ["suspicious", "noDoubleEquals"],
    "no-eval": ["security", "noGlobalEval"],

    // @typescript-eslint 规则 → Biome 规则
    "@typescript-eslint/no-explicit-any": ["suspicious", "noExplicitAny"],
    "@typescript-eslint/no-unused-vars": ["correctness", "noUnusedVariables"],

    // React 规则 → Biome 规则
    "react/no-danger": ["security", "noDangerouslySetInnerHtml"],
  };

  for (const [eslintRule, biomeMapping] of Object.entries(ruleMapping)) {
    const eslintValue = eslintRules[eslintRule];
    if (eslintValue !== undefined) {
      const [category, biomeRule] = biomeMapping;
      const severity =
        eslintValue === "error" || eslintValue === 2
          ? "error"
          : eslintValue === "warn" || eslintValue === 1
            ? "warn"
            : "off";

      if (!biomeRules[category as keyof BiomeLinterRules]) {
        (biomeRules as any)[category] = {};
      }
      (biomeRules as any)[category][biomeRule] = severity;
    }
  }

  return biomeRules;
}

// ============================================
// Biome 迁移检查清单
// ============================================

/**
 * Biome 迁移前的评估检查清单。
 * 帮助团队评估迁移的可行性和成本。
 */
export interface BiomeMigrationChecklist {
  /** 当前 ESLint 配置复杂度 */
  eslintComplexity: "simple" | "medium" | "complex";

  /** 自定义 ESLint 插件数量 */
  customPlugins: string[];

  /** 是否使用 TypeScript 类型感知规则 */
  usesTypeAwareRules: boolean;

  /** Prettier 配置是否高度定制 */
  prettierCustomized: boolean;

  /** CI/CD 构建时间是否敏感 */
  ciBuildTimeSensitive: boolean;

  /** 团队对 Rust 工具链的接受度 */
  teamAcceptance: "high" | "medium" | "low";
}

/**
 * 评估 Biome 迁移的可行性。
 */
export function assessBiomeMigration(
  checklist: BiomeMigrationChecklist
): {
  feasible: boolean;
  recommendation: string;
  estimatedEffort: string;
  risks: string[];
} {
  const risks: string[] = [];
  let feasible = true;
  let estimatedEffort = "1-2 天";

  if (checklist.customPlugins.length > 0) {
    risks.push(
      `发现 ${checklist.customPlugins.length} 个自定义 ESLint 插件，Biome 不支持，需寻找替代方案或保留 ESLint`
    );
    feasible = false;
    estimatedEffort = "1-2 周";
  }

  if (checklist.usesTypeAwareRules) {
    risks.push(
      "使用了 TypeScript 类型感知规则（如 @typescript-eslint/await-thenable），Biome 不支持，需保留 tsc 或 ESLint"
    );
    estimatedEffort = "3-5 天";
  }

  if (checklist.prettierCustomized) {
    risks.push(
      "Prettier 配置高度定制，Biome 的格式化兼容性约 96%，可能需要调整代码风格"
    );
  }

  if (checklist.eslintComplexity === "complex") {
    risks.push(
      "ESLint 配置复杂，建议分阶段迁移：先格式化，再 lint，再完全替换"
    );
    estimatedEffort = "1-2 周";
  }

  const recommendation = feasible
    ? "推荐迁移：Biome 可完全替代 ESLint + Prettier"
    : "谨慎迁移：建议采用「Biome + ESLint 混合」方案，保留 ESLint 处理 Biome 不支持的规则";

  return { feasible, recommendation, estimatedEffort, risks };
}

// ============================================
// 混合方案：Biome + ESLint
// ============================================

/**
 * 当 Biome 无法完全替代 ESLint 时，推荐的混合方案。
 *
 * 策略：
 * 1. Biome 负责：格式化 + 基础 Lint（推荐规则、风格规则）
 * 2. ESLint 负责：TypeScript 类型感知规则、自定义插件规则
 * 3. CI 中并行运行：Biome（快）→ ESLint（慢，仅检查特定规则）
 */
export function createHybridConfig(): {
  biome: BiomeConfig;
  eslintOverrideRules: string[];
} {
  const biome = createRecommendedBiomeConfig();

  // 在 Biome 中关闭这些规则，由 ESLint 处理
  const eslintOverrideRules = [
    "@typescript-eslint/await-thenable",
    "@typescript-eslint/no-floating-promises",
    "@typescript-eslint/no-misused-promises",
    "@typescript-eslint/require-await",
    // 自定义插件规则
    "react-hooks/rules-of-hooks",
    "react-hooks/exhaustive-deps",
  ];

  return { biome, eslintOverrideRules };
}

// ============================================
// Biome 命令封装
// ============================================

/**
 * Biome CLI 命令生成器。
 */
export const biomeCommands = {
  /** 检查（Lint + Format） */
  check: (files?: string[]) =>
    `npx biome check ${files?.join(" ") || "."}`,

  /** 自动修复 */
  checkWrite: (files?: string[]) =>
    `npx biome check --write ${files?.join(" ") || "."}`,

  /** 仅格式化 */
  format: (files?: string[]) =>
    `npx biome format ${files?.join(" ") || "."}`,

  /** 格式化并写入 */
  formatWrite: (files?: string[]) =>
    `npx biome format --write ${files?.join(" ") || "."}`,

  /** 仅 Lint */
  lint: (files?: string[]) =>
    `npx biome lint ${files?.join(" ") || "."}`,

  /** 初始化配置 */
  init: () => `npx biome init`,

  /** CI 模式（发现错误时退出码非零） */
  ci: () => `npx biome ci .`,
} as const;
