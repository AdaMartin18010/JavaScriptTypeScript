# 插件系统 — 理论基础

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

---

*最后更新: 2026-04-29*
