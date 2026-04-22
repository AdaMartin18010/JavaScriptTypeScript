/**
 * # Rolldown 配置与实战
 *
 * Rolldown 是用 Rust 编写的 Rollup 兼容打包器。
 * 2025 年已生产可用，Vite 6+ 可选使用，Vite 8 将默认采用。
 *
 * ## 核心定位
 * - **Rollup 的 Rust 替代**：API 99% 兼容，迁移成本极低
 * - **Vite 的统一底层**：开发用 Vite，生产用 Rolldown，消除 dev/prod 差异
 * - **极致性能**：GitLab 报告 7x 构建速度提升
 *
 * ## 性能数据
 * | 项目规模 | Rollup | Rolldown | 提升倍数 |
 * |---------|--------|----------|---------|
 * | 小型库 (1k 模块) | 2.1s | 0.3s | 7x |
 * | 中型应用 (10k 模块) | 12.5s | 1.8s | 7x |
 * | 大型应用 (50k 模块) | 45s | 6.5s | 7x |
 * | 内存占用 | 400MB | 80MB | 5x |
 */

// ============================================
// Rolldown 配置类型
// ============================================

/** Rolldown 输入选项 */
export interface RolldownInputOptions {
  /** 入口文件 */
  input?: string | string[] | Record<string, string>;

  /** 外部依赖（不打包） */
  external?: string[] | RegExp[] | ((id: string) => boolean);

  /** 插件 */
  plugins?: RolldownPlugin[];

  /** 解析配置 */
  resolve?: {
    alias?: Record<string, string>;
    extensions?: string[];
  };
}

/** Rolldown 输出选项 */
export interface RolldownOutputOptions {
  /** 输出目录 */
  dir?: string;

  /** 输出文件（单文件时使用） */
  file?: string;

  /** 模块格式 */
  format?: "esm" | "cjs" | "iife" | "umd";

  /** 是否生成 Source Map */
  sourcemap?: boolean | "inline" | "hidden";

  /** 代码分割配置 */
  manualChunks?: Record<string, string[]> | ((id: string) => string | undefined);

  /** 全局变量映射（iife/umd 格式） */
  globals?: Record<string, string>;
}

/** Rolldown 插件接口（简化版，与 Rollup 插件兼容） */
export interface RolldownPlugin {
  name: string;
  resolveId?: (id: string, importer?: string) => string | null | undefined;
  load?: (id: string) => string | null | undefined;
  transform?: (code: string, id: string) => { code: string; map?: any } | null | undefined;
}

// ============================================
// 推荐配置模板
// ============================================

/**
 * 创建库项目的 Rolldown 配置。
 */
export function createLibraryConfig(
  options: {
    entry: string;
    name: string;
    outDir?: string;
  }
): { input: RolldownInputOptions; output: RolldownOutputOptions[] } {
  const { entry, name, outDir = "dist" } = options;

  return {
    input: {
      input: entry,
      external: (id: string) => id === "react" || id === "react-dom" || /^@\//.test(id), // 不打包 React 等外部依赖
    },
    output: [
      {
        dir: `${outDir}/esm`,
        format: "esm",
        sourcemap: true,
      },
      {
        dir: `${outDir}/cjs`,
        format: "cjs",
        sourcemap: true,
      },
    ],
  };
}

/**
 * 创建应用项目的 Rolldown 配置。
 */
export function createAppConfig(
  options: {
    entry: string;
    outDir?: string;
  }
): { input: RolldownInputOptions; output: RolldownOutputOptions } {
  const { entry, outDir = "dist" } = options;

  return {
    input: {
      input: entry,
      resolve: {
        alias: {
          "@": "./src",
          "@components": "./src/components",
          "@utils": "./src/utils",
        },
        extensions: [".ts", "tsx", ".js", ".jsx", ".json"],
      },
    },
    output: {
      dir: outDir,
      format: "esm",
      sourcemap: true,
      manualChunks: {
        vendor: ["react", "react-dom"],
        ui: ["@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu"],
      },
    },
  };
}

// ============================================
// Vite + Rolldown 集成配置
// ============================================

/**
 * Vite 6+ 中使用 Rolldown 作为生产构建器。
 *
 * 在 vite.config.ts 中：
 * ```ts
 * import { defineConfig } from 'vite';
 *
 * export default defineConfig({
 *   build: {
 *     // Vite 6+ 实验性选项
 *     rollupOptions: {
 *       // 这里可以传入 Rolldown 特定的选项
 *     }
 *   }
 * });
 * ```
 *
 * 注意：Vite 6 的 Rolldown 集成是实验性的，需要通过环境变量启用：
 * ```bash
 * VITE_USE_ROLLDOWN=true vite build
 * ```
 */

/** Vite 配置中启用 Rolldown 的示例 */
export function generateViteConfigWithRolldown(): string {
  return `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  build: {
    // Vite 8 将默认使用 Rolldown
    // Vite 6/7 需要实验性启用
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          router: ["react-router-dom"],
        },
      },
    },
    // Rolldown 特定优化
    target: "es2022",
    minify: "esbuild", // Rolldown 目前使用 esbuild 进行压缩
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
`;
}

// ============================================
// Rollup → Rolldown 迁移指南
// ============================================

/**
 * Rollup 到 Rolldown 的迁移检查清单。
 */
export interface RollupToRolldownMigration {
  /** 当前 Rollup 版本 */
  rollupVersion: string;

  /** 自定义插件列表 */
  customPlugins: string[];

  /** 是否使用 Rollup 内部 API */
  usesInternalApi: boolean;

  /** 构建输出格式 */
  outputFormats: ("esm" | "cjs" | "iife" | "umd")[];

  /** 是否需要 Watch 模式 */
  needsWatchMode: boolean;
}

/**
 * 评估 Rollup → Rolldown 迁移的可行性。
 */
export function assessRollupMigration(
  migration: RollupToRolldownMigration
): {
  feasible: boolean;
  effort: "low" | "medium" | "high";
  blockers: string[];
  steps: string[];
} {
  const blockers: string[] = [];
  const steps: string[] = [];

  // 检查自定义插件兼容性
  const knownCompatiblePlugins = [
    "@rollup/plugin-node-resolve",
    "@rollup/plugin-commonjs",
    "@rollup/plugin-typescript",
    "@rollup/plugin-json",
    "@rollup/plugin-replace",
    "rollup-plugin-dts",
  ];

  const incompatiblePlugins = migration.customPlugins.filter(
    (p) => !knownCompatiblePlugins.includes(p)
  );

  if (incompatiblePlugins.length > 0) {
    blockers.push(
      `发现 ${incompatiblePlugins.length} 个未知插件，需验证 Rolldown 兼容性：${incompatiblePlugins.join(", ")}`
    );
  }

  if (migration.usesInternalApi) {
    blockers.push(
      "使用了 Rollup 内部 API，Rolldown 的实现可能不同，需手动调整"
    );
  }

  if (migration.needsWatchMode) {
    blockers.push(
      "Rolldown 的 Watch 模式与 Rollup 有差异，需验证开发体验"
    );
  }

  const feasible = blockers.length === 0;
  const effort =
    migration.customPlugins.length > 3
      ? "medium"
      : incompatiblePlugins.length > 0
        ? "high"
        : "low";

  steps.push("1. 安装 Rolldown: npm install -D rolldown");
  steps.push("2. 将 rollup.config.js 重命名为 rolldown.config.js");
  steps.push("3. 更新 package.json 中的 build 脚本");
  steps.push("4. 运行构建并对比输出差异");
  steps.push("5. 运行测试确保功能正常");
  steps.push("6. 在 CI 中并行运行 Rollup 和 Rolldown，逐步切换");

  return { feasible, effort, blockers, steps };
}

// ============================================
// Rolldown 命令封装
// ============================================

export const rolldownCommands = {
  /** 构建 */
  build: (config?: string) =>
    `npx rolldown${config ? ` -c ${config}` : ""}`,

  /** Watch 模式 */
  watch: (config?: string) =>
    `npx rolldown -w${config ? ` -c ${config}` : ""}`,

  /** 显示帮助 */
  help: () => `npx rolldown --help`,
} as const;

// ============================================
// 与其他 Rust 构建工具的对比
// ============================================

/**
 * Rolldown vs Rspack vs Turbopack vs Farm 的选型指南。
 */
export const rustBundlerComparison = {
  /** Rolldown */
  rolldown: {
    bestFor: "库开发、Vite 生态",
    rollupCompatible: "99%",
    devServer: "通过 Vite 集成",
    hmr: "通过 Vite 集成",
    maturity: "生产可用（Vite 6+ 可选）",
    migrationFrom: "Rollup（几乎零成本）",
  },

  /** Rspack */
  rspack: {
    bestFor: "企业级 Webpack 迁移",
    rollupCompatible: "N/A（Webpack 兼容）",
    devServer: "内置（Webpack dev server 兼容）",
    hmr: "✅ 内置",
    maturity: "生产可用",
    migrationFrom: "Webpack（插件 90%+ 兼容）",
  },

  /** Turbopack */
  turbopack: {
    bestFor: "Next.js 项目",
    rollupCompatible: "N/A",
    devServer: "Next.js 内置",
    hmr: "✅ 极速",
    maturity: "Next.js dev 模式稳定，生产构建过渡中",
    migrationFrom: "Webpack（Next.js 自动切换）",
  },

  /** Farm */
  farm: {
    bestFor: "实验性高性能项目",
    rollupCompatible: "插件兼容",
    devServer: "内置",
    hmr: "✅",
    maturity: "早期，社区较小",
    migrationFrom: "Vite/Rollup",
  },
} as const;
