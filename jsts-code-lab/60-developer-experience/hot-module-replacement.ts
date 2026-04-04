/**
 * @file 热模块替换 (HMR)
 * @category Developer Experience → Hot Module Replacement
 * @difficulty medium
 * @tags hmr, hot-reload, module-replacement
 *
 * @description
 * 热模块替换实现：允许在运行时更新模块代码而无需刷新页面。
 * 这是现代开发工具（如 Vite、Webpack）的核心功能。
 */

// ============================================================================
// 类型定义
// ============================================================================

export interface HMRModule {
  id: string;
  exports: Record<string, unknown>;
  dependencies: Set<string>;
  hot?: HotModuleContext;
}

export interface HotModuleContext {
  accept?: (callback?: (newModule: unknown) => void) => void;
  dispose?: (callback: () => void) => void;
  data?: Record<string, unknown>;
}

export interface HMRUpdate {
  type: 'js' | 'css' | 'json';
  path: string;
  timestamp: number;
  code?: string;
}

// ============================================================================
// HMR 运行时核心
// ============================================================================

export class HMRRuntime {
  private modules: Map<string, HMRModule> = new Map();
  private updateCallbacks: Map<string, Array<(newModule: unknown) => void>> = new Map();
  private disposeCallbacks: Map<string, Array<() => void>> = new Map();
  private ws?: WebSocket;

  /**
   * 注册模块到 HMR 系统
   */
  registerModule(id: string, exports: Record<string, unknown> = {}): HMRModule {
    const module: HMRModule = {
      id,
      exports,
      dependencies: new Set(),
      hot: this.createHotContext(id)
    };
    this.modules.set(id, module);
    return module;
  }

  /**
   * 创建热更新上下文
   */
  private createHotContext(id: string): HotModuleContext {
    return {
      accept: (callback?: (newModule: unknown) => void) => {
        if (!this.updateCallbacks.has(id)) {
          this.updateCallbacks.set(id, []);
        }
        if (callback) {
          this.updateCallbacks.get(id)!.push(callback);
        }
        console.log(`[HMR] Module ${id} registered for hot updates`);
      },
      dispose: (callback: () => void) => {
        if (!this.disposeCallbacks.has(id)) {
          this.disposeCallbacks.set(id, []);
        }
        this.disposeCallbacks.get(id)!.push(callback);
      }
    };
  }

  /**
   * 建立 WebSocket 连接进行实时通信
   */
  connect(url: string = 'ws://localhost:5173/__hmr'): void {
    if (typeof WebSocket === 'undefined') {
      console.log('[HMR] WebSocket not available in this environment');
      return;
    }

    try {
      this.ws = new WebSocket(url);
      
      this.ws.onopen = () => {
        console.log('[HMR] Connected to dev server');
      };

      this.ws.onmessage = (event) => {
        const update = JSON.parse(event.data) as HMRUpdate;
        this.handleUpdate(update);
      };

      this.ws.onerror = (error) => {
        console.error('[HMR] WebSocket error:', error);
      };

      this.ws.onclose = () => {
        console.log('[HMR] Connection closed, attempting to reconnect...');
        setTimeout(() => this.connect(url), 1000);
      };
    } catch (error) {
      console.error('[HMR] Failed to connect:', error);
    }
  }

  /**
   * 处理模块更新
   */
  private handleUpdate(update: HMRUpdate): void {
    console.log(`[HMR] Update received: ${update.path}`);

    // 执行 dispose 回调
    const disposes = this.disposeCallbacks.get(update.path);
    if (disposes) {
      disposes.forEach(cb => {
        try {
          cb();
        } catch (e) {
          console.error('[HMR] Dispose error:', e);
        }
      });
    }

    // 清理旧模块
    this.modules.delete(update.path);

    // 重新加载模块
    if (update.type === 'js' && update.code) {
      this.reloadModule(update.path, update.code);
    }

    // 执行 accept 回调
    const callbacks = this.updateCallbacks.get(update.path);
    if (callbacks) {
      const newModule = this.modules.get(update.path)?.exports;
      callbacks.forEach(cb => {
        try {
          cb(newModule);
        } catch (e) {
          console.error('[HMR] Accept callback error:', e);
        }
      });
    }
  }

  /**
   * 重新加载模块代码
   */
  private reloadModule(id: string, code: string): void {
    try {
      // 创建新的模块上下文
      const moduleExports: Record<string, unknown> = {};
      this.registerModule(id, moduleExports);

      // 使用 Function 构造函数执行代码（简化版）
      const fn = new Function('exports', 'module', 'hot', code);
      const module = this.modules.get(id)!;
      fn(moduleExports, module, module.hot);

      console.log(`[HMR] Module ${id} reloaded successfully`);
    } catch (error) {
      console.error(`[HMR] Failed to reload module ${id}:`, error);
    }
  }

  /**
   * 获取模块
   */
  getModule(id: string): HMRModule | undefined {
    return this.modules.get(id);
  }

  /**
   * 获取所有已注册模块
   */
  getAllModules(): HMRModule[] {
    return Array.from(this.modules.values());
  }
}

// ============================================================================
// CSS HMR 处理器
// ============================================================================

export class CSSHMRHandler {
  private styleElements: Map<string, HTMLStyleElement> = new Map();

  /**
   * 注入或更新 CSS
   */
  update(id: string, css: string): void {
    if (typeof document === 'undefined') return;

    let styleEl = this.styleElements.get(id);
    
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.setAttribute('data-hmr-id', id);
      document.head.appendChild(styleEl);
      this.styleElements.set(id, styleEl);
      console.log(`[HMR:CSS] New style injected: ${id}`);
    }

    styleEl.textContent = css;
    console.log(`[HMR:CSS] Updated: ${id}`);
  }

  /**
   * 移除 CSS
   */
  remove(id: string): void {
    const styleEl = this.styleElements.get(id);
    if (styleEl && styleEl.parentNode) {
      styleEl.parentNode.removeChild(styleEl);
      this.styleElements.delete(id);
      console.log(`[HMR:CSS] Removed: ${id}`);
    }
  }
}

// ============================================================================
// 模块依赖图
// ============================================================================

export class ModuleDependencyGraph {
  private dependencies: Map<string, Set<string>> = new Map();
  private dependents: Map<string, Set<string>> = new Map();

  /**
   * 添加依赖关系
   */
  addDependency(from: string, to: string): void {
    if (!this.dependencies.has(from)) {
      this.dependencies.set(from, new Set());
    }
    this.dependencies.get(from)!.add(to);

    if (!this.dependents.has(to)) {
      this.dependents.set(to, new Set());
    }
    this.dependents.get(to)!.add(from);
  }

  /**
   * 获取模块的所有依赖
   */
  getDependencies(moduleId: string): string[] {
    return Array.from(this.dependencies.get(moduleId) || []);
  }

  /**
   * 获取所有依赖此模块的模块
   */
  getDependents(moduleId: string): string[] {
    return Array.from(this.dependents.get(moduleId) || []);
  }

  /**
   * 获取受影响的模块（递归）
   */
  getAffectedModules(changedModule: string): string[] {
    const affected = new Set<string>();
    const queue = [changedModule];

    while (queue.length > 0) {
      const current = queue.shift()!;
      
      for (const dependent of this.getDependents(current)) {
        if (!affected.has(dependent)) {
          affected.add(dependent);
          queue.push(dependent);
        }
      }
    }

    return Array.from(affected);
  }

  /**
   * 移除模块及其依赖关系
   */
  removeModule(moduleId: string): void {
    // 清理该模块的依赖关系
    const deps = this.dependencies.get(moduleId);
    if (deps) {
      for (const dep of deps) {
        this.dependents.get(dep)?.delete(moduleId);
      }
    }
    
    this.dependencies.delete(moduleId);
    this.dependents.delete(moduleId);
  }
}

// ============================================================================
// 使用示例
// ============================================================================

export function demo(): void {
  console.log('=== 热模块替换 (HMR) 演示 ===\n');

  // 1. 初始化 HMR 运行时
  const hmr = new HMRRuntime();

  // 2. 注册模块
  const counterModule = hmr.registerModule('/src/counter.ts');
  counterModule.exports = {
    count: 0,
    increment: () => {
      counterModule.exports.count = (counterModule.exports.count as number) + 1;
      console.log(`Counter: ${counterModule.exports.count}`);
    }
  };

  // 3. 注册热更新回调
  counterModule.hot?.accept?.((newModule) => {
    console.log('[Demo] Counter module updated:', newModule);
  });

  // 4. 模拟模块更新
  console.log('--- 模拟 HMR 更新 ---');
  
  // 模拟收到更新消息
  const mockUpdate: HMRUpdate = {
    type: 'js',
    path: '/src/counter.ts',
    timestamp: Date.now(),
    code: `
      exports.count = 10;
      exports.increment = function() {
        this.count += 2;
        console.log('New counter:', this.count);
      };
      if (hot && hot.accept) hot.accept();
    `
  };

  hmr.handleUpdate(mockUpdate);

  // 5. 依赖图演示
  console.log('\n--- 模块依赖图 ---');
  const graph = new ModuleDependencyGraph();
  graph.addDependency('/src/app.ts', '/src/counter.ts');
  graph.addDependency('/src/app.ts', '/src/utils.ts');
  graph.addDependency('/src/counter.ts', '/src/utils.ts');
  graph.addDependency('/src/main.ts', '/src/app.ts');

  console.log('Dependencies of /src/app.ts:', graph.getDependencies('/src/app.ts'));
  console.log('Dependents of /src/utils.ts:', graph.getDependents('/src/utils.ts'));
  console.log('Affected by /src/utils.ts change:', graph.getAffectedModules('/src/utils.ts'));

  // 6. CSS HMR 演示
  console.log('\n--- CSS HMR (浏览器环境) ---');
  const cssHandler = new CSSHMRHandler();
  if (typeof document !== 'undefined') {
    cssHandler.update('/src/styles.css', 'body { background: #f0f0f0; }');
    cssHandler.update('/src/styles.css', 'body { background: #ffffff; }');
  } else {
    console.log('CSS HMR requires browser environment');
  }
}
