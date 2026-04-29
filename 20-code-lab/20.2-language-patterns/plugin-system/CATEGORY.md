---
dimension: 综合
sub-dimension: Plugin system
created: 2026-04-28
---

# 模块归属声明

本模块归属 **「综合」** 维度，聚焦 Plugin system 核心概念与工程实践。

## 包含内容

- 本模块聚焦 plugin system 核心概念与工程实践。
- 插件注册、生命周期钩子、依赖注入、动态加载与沙箱隔离。

## 子模块总览

| 子模块 | 说明 | 文件 |
|--------|------|------|
| Plugin Architecture | 基于钩子的插件注册与执行机制 | `plugin-architecture.ts` / `plugin-architecture.test.ts` |
| Hook System | 生命周期钩子：before/after/around 拦截 | `plugin-architecture.ts` |
| Dynamic Loading | 运行时动态导入与热插拔 | `index.ts` |

## 代码示例：基于钩子的插件系统

```typescript
// plugin-architecture.ts — 极简钩子驱动插件框架
export class PluginSystem<T = unknown> {
  private hooks = new Map<string, Array<(ctx: T) => T | void>>();

  register(hook: string, plugin: (ctx: T) => T | void) {
    const list = this.hooks.get(hook) ?? [];
    list.push(plugin);
    this.hooks.set(hook, list);
  }

  run(hook: string, ctx: T): T {
    return this.hooks.get(hook)?.reduce((acc, fn) => fn(acc) ?? acc, ctx) ?? ctx;
  }
}

// 使用示例
const app = new PluginSystem<{ count: number }>();
app.register('increment', ctx => ({ count: ctx.count + 1 }));
app.register('double', ctx => ({ count: ctx.count * 2 }));
console.log(app.run('increment', { count: 2 })); // { count: 3 }
```

## 代码示例：before/after/around 拦截钩子

```typescript
// plugin-architecture.ts — AOP 风格生命周期钩子
export class HookSystem<T extends Record<string, (...args: any[]) => any>> {
  private beforeHooks = new Map<keyof T, Function[]>();
  private afterHooks = new Map<keyof T, Function[]>();
  private aroundHooks = new Map<keyof T, Function[]>();

  before<K extends keyof T>(event: K, handler: (...args: Parameters<T[K]>) => void) {
    const list = this.beforeHooks.get(event) ?? [];
    list.push(handler);
    this.beforeHooks.set(event, list);
  }

  after<K extends keyof T>(event: K, handler: (result: ReturnType<T[K]>, ...args: Parameters<T[K]>) => void) {
    const list = this.afterHooks.get(event) ?? [];
    list.push(handler);
    this.afterHooks.set(event, list);
  }

  around<K extends keyof T>(event: K, handler: (next: () => ReturnType<T[K]>, ...args: Parameters<T[K]>) => ReturnType<T[K]>) {
    const list = this.aroundHooks.get(event) ?? [];
    list.push(handler);
    this.aroundHooks.set(event, list);
  }

  async execute<K extends keyof T>(event: K, fn: T[K], ...args: Parameters<T[K]>): Promise<ReturnType<T[K]>> {
    // before
    this.beforeHooks.get(event)?.forEach(h => h(...args));

    // around（洋葱模型）
    const arounds = this.aroundHooks.get(event) ?? [];
    let index = 0;
    const next = (): ReturnType<T[K]> => {
      if (index < arounds.length) {
        const handler = arounds[index++];
        return handler(next, ...args) as ReturnType<T[K]>;
      }
      return fn(...args);
    };
    const result = await next();

    // after
    this.afterHooks.get(event)?.forEach(h => h(result, ...args));
    return result;
  }
}

// 使用示例：记录日志和计时
const hooks = new HookSystem<{ fetchData: (id: string) => Promise<{ data: string }> }>();
hooks.before('fetchData', (id) => console.log(`[before] fetching ${id}`));
hooks.after('fetchData', (result) => console.log(`[after] got ${result.data}`));
hooks.around('fetchData', async (next, id) => {
  const start = performance.now();
  const result = await next();
  console.log(`[around] took ${performance.now() - start}ms`);
  return result;
});
```

## 代码示例：动态加载与沙箱隔离

```typescript
// index.ts — 运行时动态导入与沙箱隔离
export interface PluginManifest {
  name: string;
  version: string;
  entry: string;      // 模块路径
  permissions: string[]; // 允许的 API 列表
}

export async function loadPlugin(manifest: PluginManifest, sandbox: Record<string, unknown> = {}) {
  // 1. 动态导入插件模块
  const module = await import(/* webpackIgnore: true */ manifest.entry);

  // 2. 创建沙箱上下文：只暴露白名单 API
  const allowedGlobals = new Set(['console', 'setTimeout', 'Promise', ...manifest.permissions]);
  const sandboxProxy = new Proxy(sandbox, {
    get(target, prop) {
      if (allowedGlobals.has(prop as string)) {
        return (target as any)[prop] ?? (globalThis as any)[prop];
      }
      throw new Error(`Plugin "${manifest.name}" accessed forbidden API: ${String(prop)}`);
    },
    set() {
      throw new Error(`Plugin "${manifest.name}" attempted to modify global state`);
    },
  });

  // 3. 在沙箱中初始化插件
  if (typeof module.activate === 'function') {
    return module.activate(sandboxProxy);
  }
  return module.default ?? module;
}

// 使用示例
const manifest: PluginManifest = {
  name: 'analytics-plugin',
  version: '1.0.0',
  entry: './plugins/analytics.js',
  permissions: ['fetch', 'URL'],
};

loadPlugin(manifest, { fetch: globalThis.fetch, URL: globalThis.URL })
  .then(plugin => console.log('Plugin loaded:', plugin))
  .catch(err => console.error('Plugin failed:', err.message));
```

## 代码示例：依赖注入容器

```typescript
// dependency-injection.ts — 基于装饰器的轻量级 DI 容器
import 'reflect-metadata';

const INJECTABLE_KEY = Symbol('injectable');
const DEPENDENCIES_KEY = Symbol('dependencies');

export function Injectable(target: new (...args: any[]) => any) {
  Reflect.defineMetadata(INJECTABLE_KEY, true, target);
}

export function Inject(token: symbol | string | new (...args: any[]) => any) {
  return function (target: any, _propertyKey: string | undefined, parameterIndex: number) {
    const deps = Reflect.getMetadata(DEPENDENCIES_KEY, target) ?? [];
    deps[parameterIndex] = token;
    Reflect.defineMetadata(DEPENDENCIES_KEY, deps, target);
  };
}

export class Container {
  private registry = new Map<any, any>();

  register<T>(token: any, instance: T): void {
    this.registry.set(token, instance);
  }

  registerClass<T>(token: any, ctor: new (...args: any[]) => T): void {
    this.registry.set(token, () => this.resolve(ctor));
  }

  resolve<T>(ctor: new (...args: any[]) => T): T {
    const deps = Reflect.getMetadata(DEPENDENCIES_KEY, ctor) ?? [];
    const args = deps.map((dep: any) => {
      const registered = this.registry.get(dep);
      if (registered === undefined) throw new Error(`Dependency ${String(dep)} not registered`);
      return typeof registered === 'function' ? registered() : registered;
    });
    return new ctor(...args);
  }
}

// 使用示例
@Injectable
class Logger {
  log(msg: string) { console.log(`[LOG] ${msg}`); }
}

@Injectable
class UserService {
  constructor(@Inject(Logger) private logger: Logger) {}
  getUser(id: string) {
    this.logger.log(`Fetching user ${id}`);
    return { id, name: 'Alice' };
  }
}

const container = new Container();
container.registerClass(Logger, Logger);
container.registerClass(UserService, UserService);
const userService = container.resolve(UserService);
```

## 代码示例：插件版本兼容校验

```typescript
// plugin-version.ts — 语义化版本约束与兼容性检查
export function satisfies(version: string, range: string): boolean {
  const [vMajor, vMinor, vPatch] = version.split('.').map(Number);
  const [rMajor, rMinor] = range.split('.').map(Number);
  if (vMajor !== rMajor) return false;
  if (vMinor < rMinor) return false;
  return true;
}

export function validatePluginManifest(
  manifest: PluginManifest,
  hostVersion: string,
  supportedRanges: Record<string, string>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!satisfies(manifest.version, supportedRanges[manifest.name] ?? '1.0')) {
    errors.push(`Plugin "${manifest.name}" version ${manifest.version} is not compatible with host ${hostVersion}`);
  }

  if (!manifest.permissions.every(p => ['fetch', 'URL', 'crypto', 'storage'].includes(p))) {
    errors.push(`Plugin "${manifest.name}" requests unknown permissions`);
  }

  return { valid: errors.length === 0, errors };
}
```

## 相关索引

- `30-knowledge-base/30.2-categories/README.md` — 分类总览
- `20-code-lab/` — 代码实验室实践

## 目录内容

- 📄 ARCHIVED.md
- 📄 README.md
- 📄 THEORY.md
- 📄 _MIGRATED_FROM.md
- 📄 index.ts
- 📄 plugin-architecture.test.ts
- 📄 plugin-architecture.ts

---

> 此分类文档由批量生成脚本自动创建，请根据实际模块内容补充和调整。

## 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| MDN | 文档 | [developer.mozilla.org](https://developer.mozilla.org) |
| web.dev | 指南 | [web.dev](https://web.dev) |
| Rollup Plugin API | 文档 | [rollupjs.org/plugin-development](https://rollupjs.org/plugin-development/) |
| Vite Plugin API | 文档 | [vitejs.dev/guide/api-plugin](https://vitejs.dev/guide/api-plugin) |
| Fastify Plugin Guide | 文档 | [fastify.dev/docs/latest/Guides/Plugins-Guide](https://fastify.dev/docs/latest/Guides/Plugins-Guide/) |
| Tapable (Webpack) | 源码 | [github.com/webpack/tapable](https://github.com/webpack/tapable) |
| ECMAScript Dynamic Import | 文档 | [developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import) |
| Figma Plugin API | 文档 | [figma.com/developers](https://www.figma.com/developers/) |
| VS Code Extension API | 文档 | [code.visualstudio.com/api](https://code.visualstudio.com/api) |
| ShadowRealm TC39 Proposal | 规范 | [github.com/tc39/proposal-shadowrealm](https://github.com/tc39/proposal-shadowrealm) |
| Node.js VM Module | 文档 | [nodejs.org/api/vm.html](https://nodejs.org/api/vm.html) |
| Reflect Metadata (TypeScript) | 文档 | [typescriptlang.org/docs/handbook/decorators.html](https://www.typescriptlang.org/docs/handbook/decorators.html) |
| QuickJS Sandbox | 源码 | [bellard.org/quickjs](https://bellard.org/quickjs/) |
| npm semver | 文档 | [docs.npmjs.com/cli/v10/using-npm/semver](https://docs.npmjs.com/cli/v10/using-npm/semver) |
| InversifyJS DI Container | 文档 | [inversify.io](https://inversify.io/) |

---

*最后更新: 2026-04-29*
