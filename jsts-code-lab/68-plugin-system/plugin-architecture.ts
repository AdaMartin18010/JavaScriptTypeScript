/**
 * @file 插件架构实现
 * @category Plugin System → Architecture
 * @difficulty hard
 * @tags plugin-system, hooks, sandbox, extensions
 */

export interface Plugin {
  name: string;
  version: string;
  dependencies?: string[];
  activate: (context: PluginContext) => void;
  deactivate?: () => void;
}

export interface PluginContext {
  hooks: HookManager;
  config: Record<string, unknown>;
  logger: (msg: string) => void;
}

export interface Hook {
  name: string;
  handlers: Array<{ priority: number; handler: Function }>;
}

// 钩子管理器
export class HookManager {
  private hooks: Map<string, Hook> = new Map();
  
  register(hookName: string): void {
    if (!this.hooks.has(hookName)) {
      this.hooks.set(hookName, { name: hookName, handlers: [] });
    }
  }
  
  addHandler(hookName: string, handler: Function, priority: number = 10): void {
    this.register(hookName);
    const hook = this.hooks.get(hookName)!;
    
    hook.handlers.push({ priority, handler });
    hook.handlers.sort((a, b) => a.priority - b.priority);
  }
  
  async execute<T = unknown>(hookName: string, ...args: unknown[]): Promise<T[]> {
    const hook = this.hooks.get(hookName);
    if (!hook) return [];
    
    const results: T[] = [];
    
    for (const { handler } of hook.handlers) {
      try {
        const result = await handler(...args);
        if (result !== undefined) {
          results.push(result);
        }
      } catch (error) {
        console.error(`Hook ${hookName} handler error:`, error);
      }
    }
    
    return results;
  }
  
  async executeWaterfall<T>(hookName: string, initialValue: T, ...args: unknown[]): Promise<T> {
    const hook = this.hooks.get(hookName);
    if (!hook) return initialValue;
    
    let value = initialValue;
    
    for (const { handler } of hook.handlers) {
      try {
        const result = await handler(value, ...args);
        if (result !== undefined) {
          value = result;
        }
      } catch (error) {
        console.error(`Hook ${hookName} waterfall error:`, error);
      }
    }
    
    return value;
  }
  
  removeHandler(hookName: string, handler: Function): void {
    const hook = this.hooks.get(hookName);
    if (hook) {
      hook.handlers = hook.handlers.filter(h => h.handler !== handler);
    }
  }
}

// 插件管理器
export class PluginManager {
  private plugins: Map<string, Plugin> = new Map();
  private hooks = new HookManager();
  private activated: Set<string> = new Set();
  
  register(plugin: Plugin): void {
    // 检查依赖
    if (plugin.dependencies) {
      for (const dep of plugin.dependencies) {
        if (!this.plugins.has(dep)) {
          throw new Error(`Plugin ${plugin.name} requires ${dep}`);
        }
      }
    }
    
    this.plugins.set(plugin.name, plugin);
  }
  
  activate(pluginName: string): void {
    const plugin = this.plugins.get(pluginName);
    if (!plugin) {
      throw new Error(`Plugin ${pluginName} not found`);
    }
    
    if (this.activated.has(pluginName)) {
      return;
    }
    
    // 先激活依赖
    if (plugin.dependencies) {
      for (const dep of plugin.dependencies) {
        this.activate(dep);
      }
    }
    
    // 创建上下文并激活
    const context: PluginContext = {
      hooks: this.hooks,
      config: {},
      logger: (msg) => console.log(`[${plugin.name}] ${msg}`)
    };
    
    plugin.activate(context);
    this.activated.add(pluginName);
    
    console.log(`Plugin ${pluginName} v${plugin.version} activated`);
  }
  
  deactivate(pluginName: string): void {
    const plugin = this.plugins.get(pluginName);
    if (!plugin || !this.activated.has(pluginName)) {
      return;
    }
    
    // 检查是否有其他插件依赖于此
    for (const [name, p] of this.plugins) {
      if (p.dependencies?.includes(pluginName) && this.activated.has(name)) {
        throw new Error(`Cannot deactivate ${pluginName}, ${name} depends on it`);
      }
    }
    
    plugin.deactivate?.();
    this.activated.delete(pluginName);
    
    console.log(`Plugin ${pluginName} deactivated`);
  }
  
  getHooks(): HookManager {
    return this.hooks;
  }
  
  getActivatedPlugins(): string[] {
    return Array.from(this.activated);
  }
  
  getPluginInfo(): Array<{ name: string; version: string; activated: boolean }> {
    return Array.from(this.plugins.entries()).map(([name, plugin]) => ({
      name,
      version: plugin.version,
      activated: this.activated.has(name)
    }));
  }
}

// 沙箱执行（简化版）
export class PluginSandbox {
  private allowedGlobals: Set<string> = new Set([
    'console', 'Math', 'Date', 'JSON', 'Array', 'Object', 'String', 'Number'
  ]);
  
  constructor(private timeout: number = 5000) {}
  
  execute(code: string, context: Record<string, unknown> = {}): unknown {
    // 创建受限上下文
    const sandbox: Record<string, unknown> = {};
    
    // 只允许白名单全局变量
    for (const global of this.allowedGlobals) {
      sandbox[global] = (globalThis as Record<string, unknown>)[global];
    }
    
    // 注入自定义上下文
    Object.assign(sandbox, context);
    
    // 使用 Function 创建隔离作用域
    const sandboxKeys = Object.keys(sandbox);
    const sandboxValues = Object.values(sandbox);
    
    const fn = new Function(...sandboxKeys, `
      "use strict";
      ${code}
    `);
    
    return fn(...sandboxValues);
  }
  
  validate(code: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // 简单的安全检查
    const dangerous = ['eval', 'Function', 'constructor', 'prototype'];
    for (const d of dangerous) {
      if (code.includes(d)) {
        errors.push(`Potentially dangerous code detected: ${d}`);
      }
    }
    
    return { valid: errors.length === 0, errors };
  }
}

export function demo(): void {
  console.log('=== 插件系统 ===\n');
  
  const manager = new PluginManager();
  
  // 注册核心插件
  manager.register({
    name: 'core',
    version: '1.0.0',
    activate: (ctx) => {
      ctx.logger('Core plugin activated');
      ctx.hooks.register('beforeRender');
      ctx.hooks.register('afterRender');
    }
  });
  
  // 注册扩展插件
  manager.register({
    name: 'analytics',
    version: '1.0.0',
    dependencies: ['core'],
    activate: (ctx) => {
      ctx.logger('Analytics plugin activated');
      ctx.hooks.addHandler('afterRender', () => {
        console.log('[Analytics] Tracking page view');
      }, 5);
    }
  });
  
  // 注册主题插件
  manager.register({
    name: 'dark-theme',
    version: '2.0.0',
    activate: (ctx) => {
      ctx.logger('Dark theme plugin activated');
      ctx.hooks.addHandler('beforeRender', (content: string) => {
        return `<div class="dark">${content}</div>`;
      }, 1);
    }
  });
  
  // 激活插件
  manager.activate('core');
  manager.activate('analytics');
  manager.activate('dark-theme');
  
  console.log('\n已激活插件:', manager.getActivatedPlugins());
  
  // 执行钩子
  console.log('\n执行 beforeRender 钩子:');
  manager.getHooks().executeWaterfall('beforeRender', '<h1>Hello</h1>').then(result => {
    console.log('结果:', result);
  });
  
  // 沙箱演示
  console.log('\n--- 沙箱执行 ---');
  const sandbox = new PluginSandbox();
  
  const validation = sandbox.validate('console.log("hello")');
  console.log('代码验证:', validation);
  
  const result = sandbox.execute('return Math.pow(x, 2)', { x: 5 });
  console.log('沙箱执行结果:', result);
}
