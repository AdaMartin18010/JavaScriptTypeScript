/**
 * @file 构建优化与代码分割
 * @category Performance → Bundle Optimization
 * @difficulty medium
 * @tags performance, bundling, code-splitting, tree-shaking, lazy-loading
 * 
 * @description
 * 现代前端构建优化技术：
 * - 代码分割 (Code Splitting)
 * - 树摇优化 (Tree Shaking)
 * - 懒加载 (Lazy Loading)
 * - 预加载 (Preloading/Prefetching)
 */

// Node.js 兼容性存根
if (typeof globalThis.requestIdleCallback === 'undefined') {
  (globalThis as unknown as { requestIdleCallback: (cb: () => void) => ReturnType<typeof setTimeout> }).requestIdleCallback = (cb: () => void) => setTimeout(cb, 0);
}

// ============================================================================
// 1. 动态导入与代码分割
// ============================================================================

// 模拟动态导入类型
type DynamicImport<T> = () => Promise<{ default: T }>;

export class ModuleLoader {
  private cache = new Map<string, unknown>();

  async load<T>(moduleName: string, importer: DynamicImport<T>): Promise<T> {
    // 检查缓存
    if (this.cache.has(moduleName)) {
      console.log(`[ModuleLoader] 从缓存加载: ${moduleName}`);
      return this.cache.get(moduleName) as T;
    }

    // 模拟动态导入
    console.log(`[ModuleLoader] 动态加载模块: ${moduleName}`);
    const module = await importer();
    this.cache.set(moduleName, module.default);
    return module.default;
  }

  preload<T>(moduleName: string, importer: DynamicImport<T>): void {
    // 预加载但不阻塞当前执行
    requestIdleCallback(async () => {
      if (!this.cache.has(moduleName)) {
        console.log(`[ModuleLoader] 预加载模块: ${moduleName}`);
        const module = await importer();
        this.cache.set(moduleName, module.default);
      }
    });
  }

  clearCache(): void {
    this.cache.clear();
  }
}

// 路由级代码分割
export interface RouteConfig {
  path: string;
  component: DynamicImport<unknown>;
  prefetch?: boolean;
}

export class RouteBasedCodeSplitter {
  private routes = new Map<string, RouteConfig>();
  private loadedComponents = new Map<string, unknown>();

  registerRoute(config: RouteConfig): void {
    this.routes.set(config.path, config);
    
    if (config.prefetch) {
      this.prefetchRoute(config.path);
    }
  }

  async loadRoute(path: string): Promise<unknown | null> {
    // 检查已加载
    if (this.loadedComponents.has(path)) {
      return this.loadedComponents.get(path);
    }

    const route = this.routes.get(path);
    if (!route) return null;

    console.log(`[CodeSplit] 加载路由组件: ${path}`);
    const component = await route.component();
    this.loadedComponents.set(path, component.default);
    return component.default;
  }

  prefetchRoute(path: string): void {
    const route = this.routes.get(path);
    if (!route || this.loadedComponents.has(path)) return;

    requestIdleCallback(async () => {
      console.log(`[CodeSplit] 预取路由: ${path}`);
      const component = await route.component();
      this.loadedComponents.set(path, component.default);
    });
  }

  // 基于视口预取可见路由
  prefetchVisibleRoutes(visiblePaths: string[]): void {
    for (const path of visiblePaths) {
      this.prefetchRoute(path);
    }
  }
}

// ============================================================================
// 2. 树摇优化支持 (标记为可树摇)
// ============================================================================

// 使用 /*#__PURE__*/ 注释标记纯函数，帮助打包工具进行树摇

/** @__PURE__ */
export function createUtils() {
  return {
    formatDate: (date: Date) => date.toISOString(),
    formatNumber: (n: number) => n.toLocaleString(),
    debounce: <T extends (...args: unknown[]) => void>(fn: T, delay: number) => {
      let timeout: ReturnType<typeof setTimeout>;
      return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => { fn(...args); }, delay);
      };
    }
  };
}

// 副作用标记 - 确保这些模块不会被树摇
export function sideEffect(fn: () => void): void {
  fn();
}

// 条件导出，支持更好的树摇
export const mathUtils = {
  add: (a: number, b: number): number => a + b,
  subtract: (a: number, b: number): number => a - b,
  multiply: (a: number, b: number): number => a * b,
  divide: (a: number, b: number): number => a / b,
  
  // 大型函数，应该可以被单独树摇
  complexCalculation: (n: number): number => {
    let result = 0;
    for (let i = 0; i < n; i++) {
      result += Math.sqrt(i) * Math.sin(i);
    }
    return result;
  }
};

// ============================================================================
// 3. 资源预加载策略
// ============================================================================

export type ResourceHint = 'preload' | 'prefetch' | 'preconnect' | 'dns-prefetch';

export interface ResourceHintConfig {
  rel: ResourceHint;
  href: string;
  as?: string;
  type?: string;
  crossOrigin?: boolean;
}

export class ResourceHintsManager {
  private injectedHints = new Set<string>();

  addHint(config: ResourceHintConfig): void {
    const key = `${config.rel}-${config.href}`;
    if (this.injectedHints.has(key)) return;

    console.log(`[ResourceHints] 添加 ${config.rel}: ${config.href}`);
    this.injectedHints.add(key);

    // 在浏览器环境中，这会注入到 <head>
    // <link rel="preload" href="..." as="...">
  }

  // 预加载关键资源
  preloadCriticalResources(resources: { href: string; as: string }[]): void {
    for (const resource of resources) {
      this.addHint({
        rel: 'preload',
        href: resource.href,
        as: resource.as
      });
    }
  }

  // 预取后续路由资源
  prefetchRoutes(routes: string[]): void {
    for (const route of routes) {
      this.addHint({
        rel: 'prefetch',
        href: route
      });
    }
  }

  // 预连接第三方域名
  preconnectOrigins(origins: string[]): void {
    for (const origin of origins) {
      this.addHint({
        rel: 'preconnect',
        href: origin,
        crossOrigin: true
      });
    }
  }
}

// ============================================================================
// 4. 包大小分析与优化
// ============================================================================

export interface BundleAnalysis {
  totalSize: number;
  modules: {
    name: string;
    size: number;
    percentage: number;
  }[];
  duplicates: {
    module: string;
    locations: string[];
    totalWasted: number;
  }[];
}

export class BundleAnalyzer {
  private modules = new Map<string, number>();

  addModule(name: string, size: number): void {
    this.modules.set(name, (this.modules.get(name) || 0) + size);
  }

  analyze(): BundleAnalysis {
    const totalSize = Array.from(this.modules.values()).reduce((a, b) => a + b, 0);
    
    const sortedModules = Array.from(this.modules.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, size]) => ({
        name,
        size,
        percentage: (size / totalSize) * 100
      }));

    return {
      totalSize,
      modules: sortedModules,
      duplicates: this.findDuplicates()
    };
  }

  private findDuplicates(): BundleAnalysis['duplicates'] {
    // 简化的重复检测
    const duplicates: BundleAnalysis['duplicates'] = [];
    const seen = new Map<string, number>();

    for (const [name, size] of this.modules) {
      const baseName = name.split('/').pop() || name;
      if (seen.has(baseName)) {
        duplicates.push({
          module: baseName,
          locations: [name],
          totalWasted: size
        });
      } else {
        seen.set(baseName, size);
      }
    }

    return duplicates;
  }

  generateReport(): string {
    const analysis = this.analyze();
    
    let report = `
📦 包分析报告
━━━━━━━━━━━━━━━━━━━━━━━━━━━
总大小: ${this.formatSize(analysis.totalSize)}

模块详情 (Top 10):
`.trim();

    analysis.modules.slice(0, 10).forEach((mod, i) => {
      report += `\n  ${i + 1}. ${mod.name}`;
      report += `\n     大小: ${this.formatSize(mod.size)} (${mod.percentage.toFixed(1)}%)`;
    });

    if (analysis.duplicates.length > 0) {
      report += `\n\n⚠️ 重复模块:`;
      analysis.duplicates.forEach(dup => {
        report += `\n  - ${dup.module}: 浪费 ${this.formatSize(dup.totalWasted)}`;
      });
    }

    return report;
  }

  private formatSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }
}

// ============================================================================
// 5. 压缩与优化策略
// ============================================================================

export interface CompressionResult {
  originalSize: number;
  compressedSize: number;
  ratio: number;
  method: string;
}

export class CompressionOptimizer {
  // Gzip 压缩估算
  estimateGzip(originalSize: number): CompressionResult {
    // Gzip 通常减少 60-80%
    const compressionRatio = 0.3; // 剩余 30%
    const compressedSize = Math.floor(originalSize * compressionRatio);
    
    return {
      originalSize,
      compressedSize,
      ratio: 1 - compressionRatio,
      method: 'gzip'
    };
  }

  // Brotli 压缩估算
  estimateBrotli(originalSize: number): CompressionResult {
    // Brotli 通常比 Gzip 更好，减少 70-85%
    const compressionRatio = 0.25; // 剩余 25%
    const compressedSize = Math.floor(originalSize * compressionRatio);
    
    return {
      originalSize,
      compressedSize,
      ratio: 1 - compressionRatio,
      method: 'brotli'
    };
  }

  recommend(originalSize: number): string {
    const gzip = this.estimateGzip(originalSize);
    const brotli = this.estimateBrotli(originalSize);

    return `
压缩建议:
  Gzip:   ${this.formatSize(gzip.compressedSize)} (节省 ${(gzip.ratio * 100).toFixed(1)}%)
  Brotli: ${this.formatSize(brotli.compressedSize)} (节省 ${(brotli.ratio * 100).toFixed(1)}%)
  推荐: 同时启用 Gzip 和 Brotli，优先使用 Brotli
    `.trim();
  }

  private formatSize(bytes: number): string {
    return `${(bytes / 1024).toFixed(2)} KB`;
  }
}

// ============================================================================
// 6. 使用示例
// ============================================================================

export async function demo(): Promise<void> {
  console.log('=== 构建优化与代码分割演示 ===\n');

  // 代码分割
  console.log('--- 路由级代码分割 ---');
  const router = new RouteBasedCodeSplitter();
  
  router.registerRoute({
    path: '/dashboard',
    component: async () => ({ default: { name: 'Dashboard', size: '50KB' } }),
    prefetch: true
  });
  
  router.registerRoute({
    path: '/settings',
    component: async () => ({ default: { name: 'Settings', size: '30KB' } })
  });

  await router.loadRoute('/dashboard');

  // 资源提示
  console.log('\n--- 资源预加载 ---');
  const hintsManager = new ResourceHintsManager();
  
  hintsManager.preloadCriticalResources([
    { href: '/fonts/main.woff2', as: 'font' },
    { href: '/styles/critical.css', as: 'style' }
  ]);
  
  hintsManager.prefetchRoutes(['/about', '/contact']);
  hintsManager.preconnectOrigins(['https://api.example.com', 'https://cdn.example.com']);

  // 包分析
  console.log('\n--- 包分析 ---');
  const analyzer = new BundleAnalyzer();
  
  analyzer.addModule('react', 45000);
  analyzer.addModule('react-dom', 120000);
  analyzer.addModule('lodash', 80000);
  analyzer.addModule('moment', 60000);
  analyzer.addModule('axios', 25000);
  analyzer.addModule('lodash', 80000); // 重复
  
  console.log(analyzer.generateReport());

  // 压缩估算
  console.log('\n--- 压缩优化 ---');
  const compressor = new CompressionOptimizer();
  console.log(compressor.recommend(500000)); // 500KB
}

// ============================================================================
// 导出
// ============================================================================

;

export type { DynamicImport };;

// 兼容性处理
declare function requestIdleCallback(callback: () => void): number;
