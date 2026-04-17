/**
 * @file Vite 配置管理
 * @category Toolchain → Bundler
 * @difficulty medium
 * @tags vite, bundler, build-tool, esbuild, rollup
 * 
 * @description
 * Vite 构建工具配置生成与管理：
 * - 基础配置
 * - 插件系统
 * - 优化选项
 * - 开发服务器
 */

// ============================================================================
// 1. Vite 配置类型
// ============================================================================

export interface ViteConfig {
  root?: string;
  base?: string;
  mode?: string;
  publicDir?: string | false;
  cacheDir?: string;
  
  // 构建配置
  build?: BuildOptions;
  
  // 开发服务器
  server?: ServerOptions;
  
  // 预览服务器
  preview?: PreviewOptions;
  
  // 依赖优化
  optimizeDeps?: OptimizeDepsOptions;
  
  // 插件
  plugins?: Plugin[];
  
  // CSS
  css?: CSSOptions;
  
  // 环境变量
  envPrefix?: string;
  
  // 解析选项
  resolve?: ResolveOptions;
  
  // 日志
  logLevel?: 'info' | 'warn' | 'error' | 'silent';
  
  // 自定义配置
  define?: Record<string, unknown>;
}

export interface BuildOptions {
  target?: string | string[];
  outDir?: string;
  assetsDir?: string;
  assetsInlineLimit?: number;
  cssCodeSplit?: boolean;
  sourcemap?: boolean | 'inline' | 'hidden';
  minify?: boolean | 'terser' | 'esbuild';
  terserOptions?: Record<string, unknown>;
  rollupOptions?: Record<string, unknown>;
  commonjsOptions?: Record<string, unknown>;
  dynamicImportVarsOptions?: Record<string, unknown>;
  lib?: LibraryOptions;
  manifest?: boolean | string;
  ssrManifest?: boolean | string;
  ssr?: boolean | string;
  emptyOutDir?: boolean | null;
  reportCompressedSize?: boolean;
  chunkSizeWarningLimit?: number;
  watch?: null | Record<string, unknown>;
  write?: boolean;
}

export interface LibraryOptions {
  entry: string | string[] | Record<string, string>;
  name?: string;
  formats?: ('es' | 'cjs' | 'umd' | 'iife')[];
  fileName?: string | ((format: string) => string);
}

export interface ServerOptions {
  host?: string | boolean;
  port?: number;
  strictPort?: boolean;
  https?: boolean | Record<string, unknown>;
  open?: boolean | string;
  proxy?: Record<string, string | ProxyOptions>;
  cors?: boolean | Record<string, unknown>;
  headers?: Record<string, string>;
  hmr?: boolean | HmrOptions;
  watch?: Record<string, unknown>;
  middlewareMode?: boolean | 'html' | 'ssr';
  base?: string;
  fs?: {
    strict?: boolean;
    allow?: string[];
    deny?: string[];
  };
}

export interface ProxyOptions {
  target?: string;
  changeOrigin?: boolean;
  rewrite?: (path: string) => string;
  secure?: boolean;
  ws?: boolean;
}

export interface HmrOptions {
  protocol?: string;
  host?: string;
  port?: number;
  path?: string;
  timeout?: number;
  overlay?: boolean;
  clientPort?: number;
  server?: Record<string, unknown>;
}

export interface PreviewOptions {
  port?: number;
  strictPort?: boolean;
  host?: string | boolean;
  https?: boolean | Record<string, unknown>;
  open?: boolean | string;
  proxy?: Record<string, string | ProxyOptions>;
  cors?: boolean | Record<string, unknown>;
  headers?: Record<string, string>;
}

export interface OptimizeDepsOptions {
  entries?: string | string[];
  exclude?: string[];
  include?: string[];
  esbuildOptions?: Record<string, unknown>;
  force?: boolean;
}

export interface CSSOptions {
  modules?: CSSModulesOptions | false;
  postcss?: string | Record<string, unknown>;
  preprocessorOptions?: Record<string, Record<string, unknown>>;
  devSourcemap?: boolean;
}

export interface CSSModulesOptions {
  scopeBehaviour?: 'global' | 'local';
  globalModulePaths?: RegExp[];
  generateScopedName?: string | ((name: string, filename: string, css: string) => string);
  hashPrefix?: string;
  localsConvention?: 'camelCase' | 'camelCaseOnly' | 'dashes' | 'dashesOnly' | null;
}

export interface ResolveOptions {
  alias?: Record<string, string> | { find: string | RegExp; replacement: string }[];
  dedupe?: string[];
  conditions?: string[];
  mainFields?: string[];
  extensions?: string[];
  preserveSymlinks?: boolean;
}

export interface Plugin {
  name: string;
  enforce?: 'pre' | 'post';
  apply?: 'serve' | 'build' | ((config: ViteConfig, env: { command: string; mode: string }) => boolean);
  config?: (config: ViteConfig, env: { command: string; mode: string }) => ViteConfig | null | void | Promise<ViteConfig | null | void>;
  configResolved?: (config: ViteConfig) => void | Promise<void>;
  configureServer?: (server: unknown) => void | Promise<void> | (() => void);
  transformIndexHtml?: unknown;
  resolveId?: unknown;
  load?: unknown;
  transform?: unknown;
}

// ============================================================================
// 2. 配置构建器
// ============================================================================

export class ViteConfigBuilder {
  private config: ViteConfig = {};

  root(path: string): this {
    this.config.root = path;
    return this;
  }

  base(path: string): this {
    this.config.base = path;
    return this;
  }

  mode(m: string): this {
    this.config.mode = m;
    return this;
  }

  // 构建配置
  build(): BuildOptionsBuilder {
    return new BuildOptionsBuilder(this);
  }

  setBuild(options: BuildOptions): this {
    this.config.build = { ...this.config.build, ...options };
    return this;
  }

  // 服务器配置
  server(): ServerOptionsBuilder {
    return new ServerOptionsBuilder(this);
  }

  setServer(options: ServerOptions): this {
    this.config.server = { ...this.config.server, ...options };
    return this;
  }

  // 解析配置
  resolve(): ResolveOptionsBuilder {
    return new ResolveOptionsBuilder(this);
  }

  // 添加插件
  plugin(plugin: Plugin): this {
    this.config.plugins = this.config.plugins || [];
    this.config.plugins.push(plugin);
    return this;
  }

  // 添加环境变量定义
  define(key: string, value: unknown): this {
    this.config.define = this.config.define || {};
    this.config.define[key] = value;
    return this;
  }

  // 构建配置对象
  buildConfig(): ViteConfig {
    return this.config;
  }

  // 生成 TypeScript 代码
  toTypeScript(): string {
    return `import { defineConfig } from 'vite';

export default defineConfig(${JSON.stringify(this.config, null, 2)});`;
  }
}

// 构建选项构建器
export class BuildOptionsBuilder {
  private options: BuildOptions = {};

  constructor(private parent: ViteConfigBuilder) {}

  target(t: string | string[]): this {
    this.options.target = t;
    return this;
  }

  outDir(dir: string): this {
    this.options.outDir = dir;
    return this;
  }

  minify(m: BuildOptions['minify']): this {
    this.options.minify = m;
    return this;
  }

  sourcemap(s: BuildOptions['sourcemap']): this {
    this.options.sourcemap = s;
    return this;
  }

  library(entry: string, name: string): this {
    this.options.lib = { entry, name, formats: ['es', 'cjs'] };
    return this;
  }

  rollupOptions(options: Record<string, unknown>): this {
    this.options.rollupOptions = options;
    return this;
  }

  done(): ViteConfigBuilder {
    return this.parent.setBuild(this.options);
  }
}

// 服务器选项构建器
export class ServerOptionsBuilder {
  private options: ServerOptions = {};

  constructor(private parent: ViteConfigBuilder) {}

  port(p: number): this {
    this.options.port = p;
    return this;
  }

  host(h: string | boolean): this {
    this.options.host = h;
    return this;
  }

  open(o: boolean | string): this {
    this.options.open = o;
    return this;
  }

  cors(c: boolean): this {
    this.options.cors = c;
    return this;
  }

  proxy(route: string, target: string, options?: Omit<ProxyOptions, 'target'>): this {
    this.options.proxy = this.options.proxy || {};
    this.options.proxy[route] = { target, ...options };
    return this;
  }

  hmr(options: boolean | HmrOptions): this {
    this.options.hmr = options;
    return this;
  }

  done(): ViteConfigBuilder {
    return this.parent.setServer(this.options);
  }
}

// 解析选项构建器
export class ResolveOptionsBuilder {
  private options: ResolveOptions = {};

  constructor(private parent: ViteConfigBuilder) {}

  alias(find: string, replacement: string): this {
    this.options.alias = this.options.alias || {};
    (this.options.alias as Record<string, string>)[find] = replacement;
    return this;
  }

  extensions(exts: string[]): this {
    this.options.extensions = exts;
    return this;
  }

  done(): ViteConfigBuilder {
    this.parent.config.resolve = this.options;
    return this.parent;
  }
}

// ============================================================================
// 3. 预设配置
// ============================================================================

export const VitePresets = {
  // React 应用配置
  react(): ViteConfig {
    return {
      plugins: [{ name: '@vitejs/plugin-react' }],
      server: {
        port: 3000,
        open: true
      },
      build: {
        outDir: 'dist',
        sourcemap: true
      }
    };
  },

  // Vue 应用配置
  vue(): ViteConfig {
    return {
      plugins: [{ name: '@vitejs/plugin-vue' }],
      resolve: {
        alias: {
          '@': './src'
        }
      },
      server: {
        port: 3000
      }
    };
  },

  // TypeScript 库配置
  lib(name: string, entry: string): ViteConfig {
    return {
      build: {
        lib: {
          entry,
          name,
          formats: ['es', 'cjs'],
          fileName: (format) => `${name}.${format === 'es' ? 'mjs' : 'cjs'}`
        },
        rollupOptions: {
          external: ['react', 'react-dom', 'vue']
        },
        sourcemap: true
      }
    };
  },

  // 库 + 类型导出配置
  libWithTypes(name: string, entry: string): ViteConfig {
    return {
      ...this.lib(name, entry),
      plugins: [
        { name: 'vite-plugin-dts' }
      ]
    };
  }
};

// ============================================================================
// 4. 使用示例
// ============================================================================

export function demo(): void {
  console.log('=== Vite 配置管理 ===\n');

  console.log('1. React 应用配置');
  const reactConfig = VitePresets.react();
  console.log(JSON.stringify(reactConfig, null, 2));

  console.log('\n2. 自定义配置 (Builder 模式)');
  const customConfig = new ViteConfigBuilder()
    .root('.')
    .base('/app/')
    .build()
      .target('es2020')
      .outDir('build')
      .minify('terser')
      .sourcemap(true)
      .done()
    .server()
      .port(8080)
      .host(true)
      .cors(true)
      .proxy('/api', 'http://localhost:3000')
      .done()
    .resolve()
      .alias('@', './src')
      .alias('~', './assets')
      .done()
    .define('__VERSION__', '1.0.0')
    .define('__DEV__', true)
    .buildConfig();

  console.log(JSON.stringify(customConfig, null, 2));

  console.log('\n3. 库配置');
  const libConfig = VitePresets.lib('myLib', './src/index.ts');
  console.log(JSON.stringify(libConfig, null, 2));

  console.log('\nVite 优势:');
  console.log('- 极速冷启动 (原生 ESM)');
  console.log('- 即时热更新 (HMR)');
  console.log('- 优化的构建 (Rollup)');
  console.log('- 开箱即用的 TypeScript 支持');
  console.log('- 丰富的插件生态');
}

// ============================================================================
// 导出
// ============================================================================

// Classes/objects already exported inline above
