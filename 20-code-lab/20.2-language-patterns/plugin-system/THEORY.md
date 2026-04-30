# 插件系统 — 理论基础

> **定位**：`20-code-lab/20.2-language-patterns/plugin-system`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块解决**软件系统可扩展性**的问题。在不修改核心代码的前提下，允许第三方或内部团队通过标准化接口扩展系统功能。核心原则：**开闭原则（对扩展开放、对修改关闭）**。

### 1.2 形式化基础

插件系统可形式化为一个五元组：

```
PluginSystem = (Core, Plugins, API, Lifecycle, Registry)

Core: 提供最小功能集合的内核
Plugins: 可动态加载的扩展模块集合
API: Core → Plugins 的能力暴露接口
Lifecycle: {load, activate, deactivate, unload} 的状态转换
Registry: Plugin → Metadata 的映射
```

### 1.3 关键概念

| 概念 | 定义 | 关联 |
|------|------|------|
| 微内核 | 仅提供基础机制、所有功能由插件实现的核心 | microkernel.ts |
| Hook 系统 | 在关键执行点预留扩展点 | hook-system.ts |
| 沙箱隔离 | 限制插件可访问的宿主能力 | sandbox.ts |
| 热加载 | 运行时无需重启即可更新插件 | hot-reload.ts |

---

## 二、设计原理

### 2.1 为什么存在

软件需求持续演化，核心系统无法预见所有使用场景。插件系统通过定义清晰的扩展契约，让外部开发者参与功能扩展，同时保护核心系统的稳定性。

### 2.2 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 内置功能 | 简单可控 | 无法扩展 | 小型工具 |
| 插件系统 | 生态可扩展 | 架构复杂度高 | 平台型产品 |
| 脚本嵌入 | 灵活快速 | 安全风险大 | 内部工具 |

---

## 三、实践映射

## 1. 插件架构模式

### 微内核模式

核心系统提供最小功能和插件接口，业务逻辑通过插件实现：

- **核心**: 插件加载器、生命周期管理、事件总线
- **插件**: 独立开发、动态加载、独立版本

### Hook 系统

在关键执行点预留扩展点：

```javascript
// 核心代码
const result = hooks.applyFilters('calculate_price', basePrice, context)

// 插件代码
hooks.addFilter('calculate_price', (price, ctx) => ctx.vip ? price * 0.9 : price)
```

---

## 2. 完整插件系统实现

### 2.1 类型安全的事件钩子系统

```typescript
type HookCallback<TArgs extends unknown[], TReturn> = (
  value: TReturn,
  ...args: TArgs
) => TReturn;

class HookSystem<TRegistry extends Record<string, { args: unknown[]; return: unknown }>> {
  private filters: {
    [K in keyof TRegistry]?: Array<{
      callback: HookCallback<TRegistry[K]['args'], TRegistry[K]['return']>;
      priority: number;
    }>;
  } = {};

  addFilter<K extends keyof TRegistry>(
    name: K,
    callback: HookCallback<TRegistry[K]['args'], TRegistry[K]['return']>,
    priority = 10
  ): () => void {
    const list = (this.filters[name] ??= []);
    const entry = { callback, priority };
    list.push(entry);
    list.sort((a, b) => a.priority - b.priority);

    return () => {
      const idx = list.indexOf(entry);
      if (idx !== -1) list.splice(idx, 1);
    };
  }

  applyFilters<K extends keyof TRegistry>(
    name: K,
    initial: TRegistry[K]['return'],
    ...args: TRegistry[K]['args']
  ): TRegistry[K]['return'] {
    const list = this.filters[name] ?? [];
    return list.reduce((value, { callback }) => callback(value, ...args), initial);
  }
}

// 使用示例
interface MyHooks {
  calculatePrice: { args: [context: { userId: string; vip: boolean }]; return: number };
  renderHeader: { args: []; return: string };
}

const hooks = new HookSystem<MyHooks>();

hooks.addFilter('calculatePrice', (price, ctx) => {
  return ctx.vip ? price * 0.85 : price;
}, 5);

hooks.addFilter('calculatePrice', (price, ctx) => {
  return price > 1000 ? price - 50 : price; // 满减
}, 10);

const finalPrice = hooks.applyFilters('calculatePrice', 1200, { userId: 'u1', vip: true });
// 计算：1200 * 0.85 = 1020 → 1020 - 50 = 970
console.log(finalPrice); // 970
```

### 2.2 插件加载器与生命周期管理

```typescript
interface PluginManifest {
  name: string;
  version: string;
  dependencies?: string[];
  activate: (context: PluginContext) => void | Promise<void>;
  deactivate?: () => void | Promise<void>;
}

interface PluginContext {
  hooks: HookSystem<Record<string, { args: unknown[]; return: unknown }>>;
  registerCommand: (name: string, handler: () => void) => void;
  getConfig: <T>(key: string, defaultValue: T) => T;
  setConfig: <T>(key: string, value: T) => void;
}

class PluginManager {
  private plugins = new Map<string, { manifest: PluginManifest; active: boolean }>();
  private context: PluginContext;

  constructor(context: PluginContext) {
    this.context = context;
  }

  async load(manifest: PluginManifest): Promise<void> {
    if (this.plugins.has(manifest.name)) {
      throw new Error(`Plugin ${manifest.name} already loaded`);
    }

    // 检查依赖
    for (const dep of manifest.dependencies ?? []) {
      if (!this.plugins.has(dep) || !this.plugins.get(dep)!.active) {
        throw new Error(`Dependency ${dep} not satisfied for ${manifest.name}`);
      }
    }

    this.plugins.set(manifest.name, { manifest, active: false });
    await manifest.activate(this.context);
    this.plugins.get(manifest.name)!.active = true;
    console.log(`[PluginManager] Activated: ${manifest.name}@${manifest.version}`);
  }

  async unload(name: string): Promise<void> {
    const plugin = this.plugins.get(name);
    if (!plugin) return;

    // 检查是否有其他插件依赖于此插件
    for (const [otherName, other] of this.plugins) {
      if (otherName !== name && other.manifest.dependencies?.includes(name)) {
        throw new Error(`Cannot unload ${name}: ${otherName} depends on it`);
      }
    }

    await plugin.manifest.deactivate?.();
    this.plugins.delete(name);
    console.log(`[PluginManager] Deactivated: ${name}`);
  }

  async reload(name: string): Promise<void> {
    const plugin = this.plugins.get(name);
    if (!plugin) throw new Error(`Plugin ${name} not found`);
    const manifest = plugin.manifest;
    await this.unload(name);
    await this.load(manifest);
  }

  list(): Array<{ name: string; version: string; active: boolean }> {
    return Array.from(this.plugins.values()).map(p => ({
      name: p.manifest.name,
      version: p.manifest.version,
      active: p.active,
    }));
  }
}

// 使用示例
const pm = new PluginManager({
  hooks: new HookSystem(),
  registerCommand: (name, handler) => console.log(`Registered command: ${name}`),
  getConfig: (key, defaultValue) => defaultValue,
  setConfig: (key, value) => console.log(`Config ${key} = ${value}`),
});

await pm.load({
  name: 'analytics',
  version: '1.0.0',
  activate(ctx) {
    ctx.hooks.addFilter('calculatePrice', (price) => {
      console.log(`[analytics] price calculated: ${price}`);
      return price;
    });
  },
});
```

---

## 3. 插件隔离

### 3.1 命名空间隔离

```typescript
class NamespaceRegistry {
  private namespaces = new Map<string, Map<string, unknown>>();

  get<T>(ns: string, key: string): T | undefined {
    return this.namespaces.get(ns)?.get(key) as T | undefined;
  }

  set<T>(ns: string, key: string, value: T): void {
    if (!this.namespaces.has(ns)) this.namespaces.set(ns, new Map());
    this.namespaces.get(ns)!.set(key, value);
  }

  clearNamespace(ns: string): void {
    this.namespaces.delete(ns);
  }
}

// 插件只能访问自己的命名空间
function createIsolatedContext(pluginName: string, registry: NamespaceRegistry): PluginContext {
  return {
    hooks: new HookSystem(),
    getConfig: <T>(key: string, defaultValue: T) => registry.get(pluginName, key) ?? defaultValue,
    setConfig: <T>(key: string, value: T) => registry.set(pluginName, key, value),
    registerCommand: (name, handler) => {
      console.log(`[${pluginName}] registered: ${name}`);
    },
  };
}
```

### 3.2 iframe 沙箱（浏览器环境）

```typescript
class IframeSandbox {
  private iframe: HTMLIFrameElement;

  constructor() {
    this.iframe = document.createElement('iframe');
    this.iframe.sandbox.add('allow-scripts');
    this.iframe.style.display = 'none';
    document.body.appendChild(this.iframe);
  }

  async executePlugin(code: string, allowedApis: string[]): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const channel = new MessageChannel();
      channel.port1.onmessage = (e) => {
        if (e.data.error) reject(new Error(e.data.error));
        else resolve(e.data.result);
      };

      const script = `
        (async () => {
          const allowed = ${JSON.stringify(allowedApis)};
          const sandbox = {
            fetch: allowed.includes('fetch') ? window.parent.fetch.bind(window.parent) : undefined,
            console: { log: (...args) => window.parent.postMessage({type:'log', args}, '*') },
          };
          try {
            const fn = new Function('sandbox', \`${code}\`);
            const result = await fn(sandbox);
            window.parent.postMessage({ result }, '*', [${JSON.stringify(channel.port2)}]);
          } catch (err) {
            window.parent.postMessage({ error: err.message }, '*');
          }
        })();
      `;

      this.iframe.srcdoc = `<script>${script}<\/script>`;
    });
  }

  destroy(): void {
    this.iframe.remove();
  }
}
```

### 3.3 VM2 / isolated-vm 沙箱（Node.js 环境）

```typescript
import { Isolate } from 'isolated-vm';

async function runPluginInIsolate(code: string, timeoutMs = 5000): Promise<unknown> {
  const isolate = new Isolate({ memoryLimit: 128 });
  const context = await isolate.createContext();
  const jail = context.global;

  // 仅暴露白名单 API
  await jail.set('log', function(...args: unknown[]) {
    console.log('[plugin]', ...args);
  });

  const script = await isolate.compileScript(`
    (function() {
      ${code}
      return typeof main === 'function' ? main() : undefined;
    })()
  `);

  const result = await script.run(context, { timeout: timeoutMs });
  isolate.dispose();
  return result;
}

// 使用
const pluginCode = `
  function main() {
    log('Plugin executing...');
    return { status: 'ok', data: [1, 2, 3] };
  }
`;
const output = await runPluginInIsolate(pluginCode);
console.log(output); // { status: 'ok', data: [1, 2, 3] }
```

---

## 4. 热加载（Hot Reload）

```typescript
import { watch } from 'node:fs';
import { pathToFileURL } from 'node:url';

class HotReloadPluginManager extends PluginManager {
  private watchers = new Map<string, ReturnType<typeof watch>>();

  async loadWithHotReload(manifestPath: string): Promise<void> {
    const loadManifest = async () => {
      const module = await import(pathToFileURL(manifestPath).href + '?t=' + Date.now());
      const manifest: PluginManifest = module.default ?? module;

      if (this.list().some(p => p.name === manifest.name)) {
        await this.reload(manifest.name);
      } else {
        await this.load(manifest);
      }
    };

    await loadManifest();

    const watcher = watch(manifestPath, async () => {
      console.log(`[HotReload] ${manifestPath} changed, reloading...`);
      await loadManifest();
    });

    this.watchers.set(manifestPath, watcher);
  }

  dispose(): void {
    for (const watcher of this.watchers.values()) watcher.close();
    this.watchers.clear();
  }
}
```

---

## 5. 真实世界的插件 API 对比

### 5.1 Rollup 插件 API

```typescript
import type { Plugin } from 'rollup';

const myPlugin: Plugin = {
  name: 'my-plugin',
  buildStart(options) {
    console.log('Build starting with options:', options);
  },
  resolveId(source, importer) {
    if (source.startsWith('virtual:')) return source;
    return null;
  },
  load(id) {
    if (id === 'virtual:greeting') return 'export default "Hello, Rollup!";';
    return null;
  },
  transform(code, id) {
    if (id.endsWith('.ts')) {
      // TypeScript 转换逻辑
      return { code: transpileTypeScript(code), map: null };
    }
    return null;
  },
};
```

### 5.2 Vite 插件（基于 Rollup，扩展 Dev Server）

```typescript
import type { Plugin } from 'vite';

const vitePlugin: Plugin = {
  name: 'vite-my-plugin',
  // 扩展 dev server
  configureServer(server) {
    server.middlewares.use('/api/health', (req, res, next) => {
      res.end(JSON.stringify({ status: 'ok' }));
    });
  },
  // HMR 处理
  handleHotUpdate({ file, server }) {
    if (file.endsWith('.md')) {
      server.ws.send({ type: 'full-reload' });
    }
  },
};
```

### 5.3 Webpack 插件（基于 Tapable 钩子系统）

```typescript
import { Compiler } from 'webpack';

class BundleAnalyzerPlugin {
  apply(compiler: Compiler) {
    // 在编译完成后执行
    compiler.hooks.done.tap('BundleAnalyzerPlugin', (stats) => {
      const info = stats.toJson();
      console.log('Bundle size analysis:');
      info.assets?.forEach((asset) => {
        const sizeKB = (asset.size / 1024).toFixed(2);
        console.log(`  ${asset.name}: ${sizeKB} KB`);
      });
    });

    // 在生成资源到输出目录之前
    compiler.hooks.emit.tapAsync('BundleAnalyzerPlugin', (compilation, callback) => {
      const report = JSON.stringify(compilation.getStats().toJson());
      compilation.assets['bundle-report.json'] = {
        source: () => report,
        size: () => report.length,
      } as any;
      callback();
    });
  }
}
```

### 5.4 Babel 插件（AST 转换）

```typescript
// babel-plugin-remove-console.ts — 删除所有 console.* 调用
import { PluginObj, types as t } from '@babel/core';

export default function removeConsolePlugin(): PluginObj {
  return {
    name: 'remove-console',
    visitor: {
      CallExpression(path) {
        const callee = path.node.callee;
        if (
          t.isMemberExpression(callee) &&
          t.isIdentifier(callee.object, { name: 'console' })
        ) {
          path.remove();
        }
      },
    },
  };
}

// 使用：在 babel.config.js 中配置
// plugins: ['./babel-plugin-remove-console.js']
```

---

## 6. 与相邻模块的关系

- **06-architecture-patterns**: 微内核架构
- **78-metaprogramming**: 元编程技术
- **56-code-generation**: 插件代码生成

---

## 7. 参考资源

| 资源 | 类型 | 链接 |
|------|------|------|
| Rollup Plugin Development | 文档 | <https://rollupjs.org/plugin-development/> |
| Vite Plugin API | 文档 | <https://vitejs.dev/guide/api-plugin.html> |
| WordPress Plugin Handbook | 文档 | <https://developer.wordpress.org/plugins/> |
| Figma Plugin API | 文档 | <https://www.figma.com/developers> |
| VS Code Extension API | 文档 | <https://code.visualstudio.com/api> |
| isolated-vm (Node.js) | GitHub | <https://github.com/laverdet/isolated-vm> |
| QuickJS Sandbox | GitHub | <https://bellard.org/quickjs/> |
| ECMAScript ShadowRealm | 提案 | <https://github.com/tc39/proposal-shadowrealm> |
| web.dev — Sandboxing | 指南 | <https://web.dev/sandboxed-iframes/> |
| Webpack Plugin API | 文档 | <https://webpack.js.org/concepts/plugins/> |
| Babel Plugin Handbook | 文档 | <https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md> |
| ESLint Plugin Development | 文档 | <https://eslint.org/docs/latest/extend/plugins> |
| Node.js VM Module | 文档 | <https://nodejs.org/api/vm.html> |
| QuickJS Documentation | 文档 | <https://bellard.org/quickjs/quickjs.html> |
| Microkernel Architecture — Microsoft | 架构 | <https://docs.microsoft.com/en-us/azure/architecture/guide/architecture-styles/microservices> |
| Open Components (OC) | 框架 | <https://opencomponents.github.io/> |

### 5.5 插件依赖拓扑排序

```typescript
// topological-sort.ts — 确保插件按依赖顺序加载
function topologicalSort(plugins: PluginManifest[]): PluginManifest[] {
  const inDegree = new Map<string, number>();
  const adj = new Map<string, string[]>();

  for (const p of plugins) {
    inDegree.set(p.name, 0);
    adj.set(p.name, []);
  }
  for (const p of plugins) {
    for (const dep of p.dependencies ?? []) {
      adj.get(dep)!.push(p.name);
      inDegree.set(p.name, (inDegree.get(p.name) ?? 0) + 1);
    }
  }

  const queue = Array.from(inDegree.entries()).filter(([, d]) => d === 0).map(([n]) => n);
  const result: PluginManifest[] = [];

  while (queue.length) {
    const name = queue.shift()!;
    const plugin = plugins.find((p) => p.name === name)!;
    result.push(plugin);
    for (const next of adj.get(name)!) {
      inDegree.set(next, inDegree.get(next)! - 1);
      if (inDegree.get(next) === 0) queue.push(next);
    }
  }

  if (result.length !== plugins.length) throw new Error('Cyclic plugin dependency detected');
  return result;
}
```

### 5.6 内容安全策略（CSP）限制插件代码

```html
<!-- 通过 CSP 限制插件内联脚本执行 -->
<meta http-equiv="Content-Security-Policy"
  content="default-src 'self'; script-src 'self' https://trusted-cdn.example.com; object-src 'none';">
```

```typescript
// 动态创建受 CSP 约束的 Worker
const blob = new Blob(
  [`self.addEventListener('message', (e) => { self.postMessage(e.data + 1); })`],
  { type: 'application/javascript' }
);
const worker = new Worker(URL.createObjectURL(blob));
worker.postMessage(42);
```

### 新增权威参考链接

| 资源 | 类型 | 链接 |
|------|------|------|
| Chrome Extension Manifest V3 | 文档 | <https://developer.chrome.com/docs/extensions/mv3/intro/> |
| Mozilla Extension Workshop | 文档 | <https://extensionworkshop.com/> |
| Figma Plugin Sandbox | 文档 | <https://www.figma.com/plugin-docs/whats-supported/> |
| Rollup Plugin Hub | GitHub | <https://github.com/rollup/plugins> |
| Vite Plugin Community |  awesome | <https://github.com/vitejs/awesome-vite#plugins> |

---

*最后更新: 2026-04-30*
