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

---

*最后更新: 2026-04-29*
