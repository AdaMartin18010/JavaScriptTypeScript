/**
 * @file 动态导入 (Dynamic Import)
 * @category Language Core → Modules
 * @difficulty medium
 * @tags es2020, dynamic-import, code-splitting, lazy-loading
 */

// ============================================================================
// 1. 基础动态导入
// ============================================================================

async function basicDynamicImport() {
  // 动态导入返回 Promise
  const module = await import('./math.js');

  console.log(module.add(2, 3)); // 5
  console.log(module.PI); // 3.14159
}

// ============================================================================
// 2. 条件导入
// ============================================================================

async function conditionalImport(environment: 'dev' | 'prod') {
  if (environment === 'dev') {
    const { debugConfig } = await import('./config/dev.js');
    return debugConfig;
  } else {
    const { prodConfig } = await import('./config/prod.js');
    return prodConfig;
  }
}

// ============================================================================
// 3. 错误处理
// ============================================================================

async function safeImport(modulePath: string) {
  try {
    const module = await import(modulePath);
    return { success: true, module } as const;
  } catch (error) {
    return { success: false, error } as const;
  }
}

// ============================================================================
// 4. 动态路径 (有限制)
// ============================================================================

async function loadLanguage(lang: string) {
  // ✅ 可以使用模板字符串，但需要有完整的文件路径
  const messages = await import(`./locales/${lang}.json`, {
    assert: { type: 'json' } // 导入断言
  });
  return messages.default;
}

// ============================================================================
// 5. 同时导入多个模块
// ============================================================================

async function parallelImports() {
  const [math, utils, constants] = await Promise.all([
    import('./math.js'),
    import('./utils.js'),
    import('./constants.js')
  ]);

  return { math, utils, constants };
}

// ============================================================================
// 6. 视图层懒加载示例
// ============================================================================

interface ViewModule {
  render: () => void;
  destroy: () => void;
}

class ViewLoader {
  private currentView: ViewModule | null = null;

  async loadView(viewName: string): Promise<void> {
    // 销毁当前视图
    this.currentView?.destroy();

    // 动态加载新视图
    const module = await import(`./views/${viewName}.js`);
    this.currentView = new module.default() as ViewModule;
    this.currentView.render();
  }
}

// ============================================================================
// 7. Webpack/Vite 的魔法注释
// ============================================================================

async function webpackMagicComments() {
  // webpackChunkName: 指定输出文件名
  const module = await import(
    /* webpackChunkName: "lodash" */
    /* webpackMode: "lazy" */
    './heavy-module.js'
  );

  return module;
}

// Vite 特定
async function vitePrefetch() {
  const module = await import(
    /* @vite-ignore */
    './optional-module.js'
  );
  return module;
}

// ============================================================================
// 8. JSON 导入
// ============================================================================

async function importJSON() {
  // Node.js 和 现代浏览器
  // 为简化编译，此处移除了 JSON 动态导入示例（需要 resolveJsonModule 支持）
  // const data = await import('./data.json', { assert: { type: 'json' } });
  // return data.default;
  return {};
}

// ============================================================================
// 9. 模块缓存
// ============================================================================

const moduleCache = new Map<string, Promise<unknown>>();

export function cachedImport<T>(path: string): Promise<T> {
  if (!moduleCache.has(path)) {
    moduleCache.set(path, import(path));
  }
  return moduleCache.get(path) as Promise<T>;
}

// ============================================================================
// 导出
// ============================================================================

export { basicDynamicImport, conditionalImport, safeImport, loadLanguage, parallelImports, ViewLoader, webpackMagicComments, vitePrefetch, importJSON };;
