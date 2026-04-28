/**
 * @file Rolldown 配置管理
 * @category Toolchain → Bundler
 * @difficulty medium
 * @tags rolldown, rollup, vite, bundler, rust, build-tool
 *
 * @description
 * Rolldown 是一个用 Rust 编写的 Rollup 兼容打包器，
 * 旨在成为 Vite 的未来底层构建工具。本文件展示：
 * - Rolldown 配置结构与类型定义
 * - Rollup 与 Rolldown 的配置差异对比
 * - 从 Rollup/Vite 迁移到 Rolldown 的路径
 * - 性能基准数据与当前局限性
 */

// ============================================================================
// 1. Rolldown 配置类型定义
// ============================================================================

/** Rolldown 输入选项 */
export interface RolldownInputOptions {
  /** 入口文件 */
  input?: string | string[] | Record<string, string>;
  /** 外部依赖 */
  external?: string[] | RegExp[] | ((id: string) => boolean);
  /** 插件 */
  plugins?: RolldownPlugin[];
  /** 解析选项 */
  resolve?: RolldownResolveOptions;
  /** 条件导出 */
  conditions?: string[];
}

/** Rolldown 输出选项 */
export interface RolldownOutputOptions {
  /** 输出目录 */
  dir?: string;
  /** 输出文件 */
  file?: string;
  /** 格式 */
  format?: 'esm' | 'cjs' | 'iife' | 'umd' | 'app';
  /** 代码分割 */
  manualChunks?: Record<string, string[]> | ((id: string) => string | undefined);
  /** 入口文件名 */
  entryFileNames?: string;
  /** chunk 文件名 */
  chunkFileNames?: string;
  /** asset 文件名 */
  assetFileNames?: string;
  /** 名称 */
  name?: string;
  /** 全局变量 */
  globals?: Record<string, string>;
  /** Source map */
  sourcemap?: boolean | 'inline' | 'hidden';
  /** 最小化 */
  minify?: boolean;
  /** Banner */
  banner?: string;
  /** Footer */
  footer?: string;
}

/** Rolldown 完整配置 */
export interface RolldownConfig {
  /** 输入选项 */
  input?: RolldownInputOptions['input'];
  /** 外部依赖 */
  external?: RolldownInputOptions['external'];
  /** 插件 */
  plugins?: RolldownPlugin[];
  /** 解析选项 */
  resolve?: RolldownResolveOptions;
  /** 输出选项（单输出） */
  output?: RolldownOutputOptions;
  /** 多输出 */
  outputs?: RolldownOutputOptions[];
  /** 条件导出 */
  conditions?: string[];
}

/** Rolldown 解析选项 */
export interface RolldownResolveOptions {
  /** 别名 */
  alias?: Record<string, string>;
  /** 扩展名 */
  extensions?: string[];
  /** 主字段 */
  mainFields?: string[];
  /** 条件导出 */
  conditionNames?: string[];
  /** 浏览器字段 */
  browser?: boolean;
  /** 优先模块 */
  preferBuiltins?: boolean;
}

/** Rolldown 插件接口 */
export interface RolldownPlugin {
  name: string;
  resolveId?: (source: string, importer?: string) => string | null | Promise<string | null>;
  load?: (id: string) => string | null | { code: string; map?: string } | Promise<string | null | { code: string; map?: string }>;
  transform?: (code: string, id: string) => string | null | { code: string; map?: string } | Promise<string | null | { code: string; map?: string }>;
  generateBundle?: (options: RolldownOutputOptions, bundle: Record<string, unknown>) => void | Promise<void>;
  writeBundle?: (options: RolldownOutputOptions, bundle: Record<string, unknown>) => void | Promise<void>;
}

// ============================================================================
// 2. Rolldown 配置构建器
// ============================================================================

export class RolldownConfigBuilder {
  private config: RolldownConfig = {};

  /** 设置入口 */
  entry(input: RolldownInputOptions['input']): this {
    this.config.input = input;
    return this;
  }

  /** 添加外部依赖 */
  external(...deps: string[]): this {
    const existing = (this.config.external || []) as string[];
    this.config.external = [...existing, ...deps];
    return this;
  }

  /** 添加插件 */
  plugin(p: RolldownPlugin): this {
    this.config.plugins = this.config.plugins || [];
    this.config.plugins.push(p);
    return this;
  }

  /** 配置解析选项 */
  resolve(options: RolldownResolveOptions): this {
    this.config.resolve = { ...this.config.resolve, ...options };
    return this;
  }

  /** 添加路径别名 */
  alias(mapping: Record<string, string>): this {
    this.config.resolve = this.config.resolve || {};
    this.config.resolve.alias = { ...this.config.resolve.alias, ...mapping };
    return this;
  }

  /** 设置输出选项 */
  output(options: RolldownOutputOptions): this {
    this.config.output = { ...this.config.output, ...options };
    return this;
  }

  /** 添加多输出 */
  addOutput(options: RolldownOutputOptions): this {
    this.config.outputs = this.config.outputs || [];
    this.config.outputs.push(options);
    return this;
  }

  /** 设置 ESM 输出 */
  esm(outDir: string): this {
    return this.output({ dir: outDir, format: 'esm', sourcemap: true });
  }

  /** 设置 CJS 输出 */
  cjs(outDir: string): this {
    return this.addOutput({ dir: outDir, format: 'cjs', sourcemap: true });
  }

  /** 设置库打包 */
  lib(name: string, entry: string): this {
    this.config.input = entry;
    this.config.output = {
      dir: 'dist',
      format: 'esm',
      entryFileNames: `[name].mjs`,
      sourcemap: true
    };
    this.config.outputs = [
      { dir: 'dist', format: 'cjs', entryFileNames: `[name].cjs`, sourcemap: true }
    ];
    return this;
  }

  /** 启用最小化 */
  minify(): this {
    if (this.config.output) this.config.output.minify = true;
    this.config.outputs?.forEach(o => o.minify = true);
    return this;
  }

  /** 构建配置 */
  build(): RolldownConfig {
    return this.config;
  }
}

// ============================================================================
// 3. 预设配置
// ============================================================================

export const RolldownPresets = {
  /** TypeScript 库打包 */
  tsLib(entry: string, name: string): RolldownConfig {
    return {
      input: entry,
      external: ['react', 'react-dom', 'vue', 'typescript'] as string[],
      plugins: [
        { name: 'rolldown-plugin-typescript' },
        { name: 'rolldown-plugin-node-resolve' }
      ],
      output: {
        dir: 'dist',
        format: 'esm',
        entryFileNames: `${name}.mjs`,
        sourcemap: true
      },
      outputs: [
        {
          dir: 'dist',
          format: 'cjs',
          entryFileNames: `${name}.cjs`,
          sourcemap: true
        }
      ]
    };
  },

  /** React 组件库 */
  reactLib(entry: string, name: string): RolldownConfig {
    return {
      input: entry,
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      plugins: [
        { name: 'rolldown-plugin-typescript' },
        { name: 'rolldown-plugin-node-resolve' },
        { name: 'rolldown-plugin-commonjs' }
      ],
      resolve: {
        alias: { '@': './src' },
        extensions: ['.ts', '.tsx', '.js', '.jsx']
      },
      output: {
        dir: 'dist',
        format: 'esm',
        entryFileNames: `${name}.esm.js`,
        sourcemap: true
      },
      outputs: [
        {
          dir: 'dist',
          format: 'cjs',
          entryFileNames: `${name}.cjs.js`,
          sourcemap: true
        }
      ]
    };
  },

  /** Node.js 应用 */
  nodeApp(entry: string): RolldownConfig {
    return {
      input: entry,
      external: [/^node:/],
      plugins: [
        { name: 'rolldown-plugin-node-resolve' },
        { name: 'rolldown-plugin-commonjs' }
      ],
      output: {
        dir: 'dist',
        format: 'cjs',
        sourcemap: true,
        minify: true
      }
    };
  },

  /** 浏览器应用（IIFE） */
  browserApp(entry: string, globalName: string): RolldownConfig {
    return {
      input: entry,
      plugins: [
        { name: 'rolldown-plugin-node-resolve' },
        { name: 'rolldown-plugin-commonjs' }
      ],
      output: {
        dir: 'dist',
        format: 'iife',
        name: globalName,
        sourcemap: true,
        minify: true
      }
    };
  }
};

// ============================================================================
// 4. rolldown.config.ts 完整示例
// ============================================================================

/** rolldown.config.ts 完整配置示例 */
export const rolldownConfigExample = `
// rolldown.config.ts
import { defineConfig } from 'rolldown';

export default defineConfig({
  // 入口配置（与 Rollup 兼容）
  input: {
    index: './src/index.ts',
    utils: './src/utils.ts'
  },

  // 外部依赖（不打包进 bundle）
  external: [
    'react',
    'react-dom',
    'vue',
    /^lodash/
  ],

  // 插件系统（与 Rollup 插件兼容）
  plugins: [
    // TypeScript 支持（内置，无需额外插件）
    // Rolldown 原生支持 TypeScript/JSX

    // Node 模块解析
    // @ts-ignore
    require('@rollup/plugin-node-resolve')(),

    // CommonJS 转换
    // @ts-ignore
    require('@rollup/plugin-commonjs')(),

    // JSON 导入
    // @ts-ignore
    require('@rollup/plugin-json')(),

    // 替换环境变量
    // @ts-ignore
    require('@rollup/plugin-replace')({
      'process.env.NODE_ENV': JSON.stringify('production'),
      preventAssignment: true
    })
  ],

  // 模块解析选项
  resolve: {
    alias: {
      '@': './src',
      '~': './assets'
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    mainFields: ['module', 'jsnext:main', 'main'],
    conditionNames: ['import', 'module', 'default']
  },

  // 输出配置（与 Rollup 兼容）
  output: {
    dir: 'dist/esm',
    format: 'esm',
    entryFileNames: '[name].mjs',
    chunkFileNames: 'chunks/[name]-[hash].mjs',
    assetFileNames: 'assets/[name]-[hash][extname]',
    sourcemap: true,
    minify: true,
    // Rolldown 使用 Rust 内置的 Oxc minifier
    banner: '// Built with Rolldown'
  },

  // 多格式输出
  outputs: [
    {
      dir: 'dist/cjs',
      format: 'cjs',
      entryFileNames: '[name].cjs',
      chunkFileNames: 'chunks/[name]-[hash].cjs',
      sourcemap: true
    }
  ]
});
`;

// ============================================================================
// 5. Rollup vs Rolldown 配置差异对比
// ============================================================================

/** 配置差异项 */
export interface ConfigDiff {
  aspect: string;
  rollup: string;
  rolldown: string;
  note?: string;
}

/** Rollup vs Rolldown 配置差异对比表 */
export const rollupVsRolldownDiffs: ConfigDiff[] = [
  {
    aspect: 'TypeScript 支持',
    rollup: '需 @rollup/plugin-typescript 或 rollup-plugin-esbuild',
    rolldown: '原生支持（内置 Oxc 转换器）',
    note: '无需额外插件，开箱即用'
  },
  {
    aspect: 'JSX 支持',
    rollup: '需 @rollup/plugin-babel 或 @rollup/plugin-swc',
    rolldown: '原生支持（内置 Oxc 转换器）',
    note: '自动检测 .tsx/.jsx 文件'
  },
  {
    aspect: '代码压缩',
    rollup: '需 rollup-plugin-terser 或 @rollup/plugin-terser',
    rolldown: '内置 minify 选项（Oxc minifier）',
    note: '启用 output.minify: true 即可'
  },
  {
    aspect: 'CommonJS 转换',
    rollup: '需 @rollup/plugin-commonjs',
    rolldown: '内置支持（部分场景仍需插件）',
    note: '简单 CJS 模块可原生处理'
  },
  {
    aspect: 'Node 模块解析',
    rollup: '需 @rollup/plugin-node-resolve',
    rolldown: '内置 resolver（oxc_resolver）',
    note: 'resolve 选项内置于配置中'
  },
  {
    aspect: 'Source Map',
    rollup: '支持',
    rolldown: '支持',
    note: 'API 完全一致'
  },
  {
    aspect: '代码分割',
    rollup: 'manualChunks / dynamic import',
    rolldown: '完全兼容 Rollup 的代码分割',
    note: '行为一致'
  },
  {
    aspect: '插件 API',
    rollup: '完整的 Rollup 插件钩子',
    rolldown: '兼容 Rollup 插件钩子（部分受限）',
    note: '大部分 Rollup 插件可直接使用'
  },
  {
    aspect: '输出格式',
    rollup: 'esm, cjs, iife, umd, amd, system',
    rolldown: 'esm, cjs, iife, umd, app',
    note: 'app 格式是 Rolldown 新增的 Vite 专用格式'
  },
  {
    aspect: '配置文件',
    rollup: 'rollup.config.js / rollup.config.ts',
    rolldown: 'rolldown.config.ts',
    note: '配置语法几乎相同'
  },
  {
    aspect: 'Watch 模式',
    rollup: '--watch 或 JavaScript API',
    rolldown: '支持（Vite 的 dev 模式使用 Rolldown）',
    note: '通过 Vite 使用 watch 更高效'
  },
  {
    aspect: 'HMR（热更新）',
    rollup: '不支持（需额外工具）',
    rolldown: '通过 Vite 支持',
    note: 'Rolldown 本身无 HMR，Vite 提供'
  }
];

// ============================================================================
// 6. 迁移路径：从 Rollup/Vite 到 Rolldown
// ============================================================================

/** 迁移步骤 */
export interface MigrationStep {
  step: number;
  title: string;
  description: string;
  category: 'assessment' | 'installation' | 'configuration' | 'testing' | 'optimization';
}

/** 从 Rollup 迁移到 Rolldown */
export const rollupToRolldownMigration: MigrationStep[] = [
  {
    step: 1,
    title: '评估当前插件',
    description: '列出 rollup.config 中所有插件，确认哪些是 Rolldown 内置功能（TypeScript、minify、resolve）',
    category: 'assessment'
  },
  {
    step: 2,
    title: '安装 Rolldown',
    description: 'npm install --save-dev rolldown',
    category: 'installation'
  },
  {
    step: 3,
    title: '重命名配置文件',
    description: '将 rollup.config.ts 重命名为 rolldown.config.ts',
    category: 'configuration'
  },
  {
    step: 4,
    title: '移除内置功能插件',
    description: '移除 @rollup/plugin-typescript, rollup-plugin-terser, @rollup/plugin-node-resolve（Rolldown 内置）',
    category: 'configuration'
  },
  {
    step: 5,
    title: '调整输出配置',
    description: '将 minify 配置从插件选项移至 output.minify: true',
    category: 'configuration'
  },
  {
    step: 6,
    title: '测试构建',
    description: '运行 npx rolldown -c rolldown.config.ts，对比输出结果',
    category: 'testing'
  },
  {
    step: 7,
    title: '验证产物',
    description: '检查 source map、chunk 分割、tree-shaking 效果是否与 Rollup 一致',
    category: 'testing'
  },
  {
    step: 8,
    title: '更新 CI/CD',
    description: '将构建命令从 rollup 替换为 rolldown',
    category: 'optimization'
  }
];

/** 从 Vite 迁移到 Rolldown（底层切换） */
export const viteToRolldownMigration: MigrationStep[] = [
  {
    step: 1,
    title: '确认 Vite 版本',
    description: 'Vite 6+ 开始实验性支持 Rolldown 作为底层（via vite.config）',
    category: 'assessment'
  },
  {
    step: 2,
    title: '启用实验性 Rolldown',
    description: '在 vite.config.ts 中设置 experimental.rolldownBuilder: true',
    category: 'configuration'
  },
  {
    step: 3,
    title: '测试生产构建',
    description: '运行 vite build，观察构建速度和产物差异',
    category: 'testing'
  },
  {
    step: 4,
    title: '反馈问题',
    description: '如遇问题，向 Vite / Rolldown 仓库提交 issue',
    category: 'optimization'
  }
];

/** 迁移的注意事项 */
export const migrationNotes = [
  'Rolldown 目标是 100% 兼容 Rollup 配置，大部分项目无需修改配置',
  'Vite 用户无需手动迁移，未来 Vite 版本将自动使用 Rolldown 作为底层',
  '如果使用了复杂的自定义 Rollup 插件，需验证在 Rolldown 下的兼容性',
  'Rolldown 的 app 输出格式专为 Vite 设计，普通项目使用 esm/cjs/iife',
  'Rolldown 使用 Oxc 进行代码转换，替代了 esbuild 在 Vite 中的角色'
];

// ============================================================================
// 7. 性能基准数据
// ============================================================================

/** 性能测试场景 */
export interface BenchmarkScenario {
  project: string;
  files: number;
  description: string;
  rollupDuration: string;
  rollupPlugin?: string;
  rolldownDuration: string;
  viteEsbuildDuration: string;
  speedupVsRollup: string;
  speedupVsVite: string;
}

/** 构建速度对比数据（基于官方和社区基准测试） */
export const buildBenchmarks: BenchmarkScenario[] = [
  {
    project: 'Vue 3',
    files: 500,
    description: 'Vue 核心库打包',
    rollupDuration: '~3.2s',
    rollupPlugin: 'rollup + @rollup/plugin-typescript + terser',
    rolldownDuration: '~0.4s',
    viteEsbuildDuration: '~0.6s',
    speedupVsRollup: '8x',
    speedupVsVite: '1.5x'
  },
  {
    project: 'React Component Library',
    files: 200,
    description: 'React 组件库（TS + JSX）',
    rollupDuration: '~2.5s',
    rollupPlugin: 'rollup + swc + terser',
    rolldownDuration: '~0.3s',
    viteEsbuildDuration: '~0.5s',
    speedupVsRollup: '8.3x',
    speedupVsVite: '1.7x'
  },
  {
    project: 'Medium App',
    files: 1200,
    description: '中型应用（1500+ 模块）',
    rollupDuration: '~8.5s',
    rollupPlugin: 'rollup + esbuild + terser',
    rolldownDuration: '~1.1s',
    viteEsbuildDuration: '~1.5s',
    speedupVsRollup: '7.7x',
    speedupVsVite: '1.4x'
  },
  {
    project: 'Large Monorepo',
    files: 5000,
    description: '大型 Monorepo（多包）',
    rollupDuration: '~25s',
    rollupPlugin: 'rollup + tsc + terser',
    rolldownDuration: '~3.5s',
    viteEsbuildDuration: '~5s',
    speedupVsRollup: '7.1x',
    speedupVsVite: '1.4x'
  }
];

/** 性能优势来源 */
export const performanceReasons = [
  { reason: 'Rust 编写', detail: '无 GC 开销，内存管理更精细' },
  { reason: '并行处理', detail: '充分利用多核 CPU 并行解析和转换' },
  { reason: '统一管道', detail: '解析 → 转换 → 打包 → 压缩在同一进程中完成，减少序列化开销' },
  { reason: 'Oxc 编译器', detail: '使用 Oxc 替代 esbuild/swc 进行 JS/TS 转换，性能更优' },
  { reason: '优化的 Tree Shaking', detail: '基于 Rust 的高效模块图分析和副作用检测' },
  { reason: '原生 Minifier', detail: '内置 Oxc minifier，无需外部工具调用' }
];

// ============================================================================
// 8. 当前局限性与 Roadmap
// ============================================================================

/** 局限性 */
export interface RolldownLimitation {
  area: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  expectedResolution?: string;
}

/** Rolldown 当前局限性 */
export const rolldownLimitations: RolldownLimitation[] = [
  {
    area: '插件生态',
    description: '部分复杂的 Rollup 插件可能不完全兼容，尤其是依赖深层 AST 操作的插件',
    severity: 'medium',
    expectedResolution: '持续完善插件钩子兼容性'
  },
  {
    area: '输出格式',
    description: '暂不支持 AMD、SystemJS 输出格式（仅 esm、cjs、iife、umd、app）',
    severity: 'low',
    expectedResolution: 'umd 支持已完善，其他格式需求较低'
  },
  {
    area: 'Source Map 精度',
    description: '在某些复杂转换场景下，source map 的列映射可能不如 Rollup 精确',
    severity: 'low',
    expectedResolution: '持续优化 Oxc 的 source map 生成'
  },
  {
    area: 'WASM 目标',
    description: '暂不支持输出为 WebAssembly（与 Rollup 相同）',
    severity: 'low',
    expectedResolution: '非核心目标，可通过其他工具链实现'
  },
  {
    area: 'Watch 模式',
    description: '独立的 watch 模式不如 Vite dev server 成熟',
    severity: 'medium',
    expectedResolution: '推荐通过 Vite 使用 Rolldown 的 watch 能力'
  },
  {
    area: '文档与示例',
    description: '相比 Rollup，文档和第三方教程较少',
    severity: 'low',
    expectedResolution: '随着 Vite 采用，文档生态将快速完善'
  },
  {
    area: 'Windows 路径处理',
    description: '早期版本在 Windows 上的路径处理存在一些问题',
    severity: 'low',
    expectedResolution: '已在近期版本修复大部分问题'
  }
];

/** Rolldown 官方 Roadmap */
export const rolldownRoadmap = {
  /** 已完成 */
  completed: [
    'Rollup 配置兼容（基本覆盖）',
    'TypeScript/JSX 原生支持',
    '代码分割与 Tree Shaking',
    'Source Map 生成',
    'Oxc minifier 集成',
    'Vite 6 实验性集成'
  ],
  /** 进行中 */
  inProgress: [
    '100% Rollup 插件 API 兼容',
    'Vite 生产构建完全迁移到 Rolldown',
    '独立 Rolldown CLI 工具完善',
    'CSS 模块处理优化'
  ],
  /** 计划中 */
  planned: [
    'Rolldown 1.0 稳定版发布',
    'Vite 7 默认使用 Rolldown',
    '更智能的代码分割策略',
    '增量构建优化',
    '更好的错误提示和诊断信息'
  ]
};

/** Vite 与 Rolldown 的关系时间线 */
export const viteRolldownTimeline = [
  { time: '2023', event: 'Rolldown 项目启动（由 Vite 团队创建）' },
  { time: '2024 Q1', event: 'Rolldown alpha 版本，实现基本 Rollup 兼容' },
  { time: '2024 Q3', event: 'Vite 6 发布，实验性支持 Rolldown 作为底层构建器' },
  { time: '2025', event: 'Rolldown beta 版本，性能优化，插件兼容性提升' },
  { time: '2025-2026', event: 'Vite 7 计划默认使用 Rolldown 替代 esbuild + Rollup' },
  { time: '未来', event: 'Rolldown 成为 Vite 唯一底层，统一开发/生产构建工具' }
];

// ============================================================================
// 9. package.json scripts 与 CLI 用法
// ============================================================================

/** 推荐的 package.json scripts */
export const recommendedScripts: Record<string, string> = {
  'build': 'rolldown -c rolldown.config.ts',
  'build:watch': 'rolldown -c rolldown.config.ts --watch',
  'build:analyze': 'rolldown -c rolldown.config.ts --analyze',
  'build:debug': 'DEBUG=rolldown:* rolldown -c rolldown.config.ts'
};

/** Rolldown CLI 参数 */
export const rolldownCliOptions: Array<{ flag: string; description: string }> = [
  { flag: '-c, --config <file>', description: '指定配置文件路径' },
  { flag: '-w, --watch', description: '监听文件变更并重新构建' },
  { flag: '--minify', description: '启用代码压缩' },
  { flag: '--sourcemap', description: '生成 source map' },
  { flag: '--format <format>', description: '输出格式：esm, cjs, iife, umd, app' },
  { flag: '--external <names>', description: '指定外部依赖（逗号分隔）' },
  { flag: '--analyze', description: '输出打包分析信息' },
  { flag: '--silent', description: '静默模式，仅输出错误' },
  { flag: '--help', description: '显示帮助信息' },
  { flag: '--version', description: '显示版本信息' }
];

// ============================================================================
// 10. 使用示例
// ============================================================================

export function demo(): void {
  console.log('=== Rolldown 配置管理 ===\n');

  console.log('1. 生成 React 库配置');
  const reactLib = RolldownPresets.reactLib('./src/index.tsx', 'my-react-lib');
  console.log('   Entry:', reactLib.input);
  console.log('   External:', Array.isArray(reactLib.external) ? reactLib.external.join(', ') : 'function');
  console.log('   Alias:', JSON.stringify(reactLib.resolve?.alias));

  console.log('\n2. 使用 Builder 模式');
  const customConfig = new RolldownConfigBuilder()
    .entry('./src/main.ts')
    .external('react', 'react-dom')
    .alias({ '@': './src', '~': './assets' })
    .esm('dist/esm')
    .cjs('dist/cjs')
    .minify()
    .build();
  console.log('   Outputs:', customConfig.outputs?.length || 0);

  console.log('\n3. Rollup vs Rolldown 关键差异');
  const keyDiffs = rollupVsRolldownDiffs.filter(d => d.note);
  keyDiffs.slice(0, 4).forEach(d => {
    console.log(`   ${d.aspect}: ${d.rolldown}`);
  });

  console.log('\n4. 性能对比');
  buildBenchmarks.forEach(b => {
    console.log(`   ${b.project}: Rollup ${b.rollupDuration} → Rolldown ${b.rolldownDuration} (${b.speedupVsRollup})`);
  });

  console.log('\n5. 当前局限性');
  rolldownLimitations.filter(l => l.severity === 'medium').forEach(l => {
    console.log(`   [${l.area}] ${l.description}`);
  });

  console.log('\n6. Vite + Rolldown 时间线');
  viteRolldownTimeline.forEach(t => {
    console.log(`   ${t.time}: ${t.event}`);
  });

  console.log('\nRolldown 要点:');
  console.log('- Rust 编写的高性能 Rollup 兼容打包器');
  console.log('- 原生支持 TypeScript/JSX，无需额外插件');
  console.log('- 内置代码压缩（Oxc minifier）');
  console.log('- 比 Rollup 快 7-10 倍，比 Vite(esbuild) 快 1.4-1.7 倍');
  console.log('- 未来将成为 Vite 的默认底层构建工具');
  console.log('- 当前处于快速发展阶段，适合在新项目中尝试');
}

// ============================================================================
// 导出 (已在上面导出)
// ============================================================================
