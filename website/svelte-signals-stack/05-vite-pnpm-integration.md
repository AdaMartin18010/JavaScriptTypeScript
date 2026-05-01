---
title: Vite + pnpm + Svelte 构建集成
description: 'SvelteKit 底层构建原理、Vite 插件架构、pnpm workspace Monorepo 最佳实践与性能优化'
---

# Vite + pnpm + Svelte 构建集成

> 最后更新: 2026-05-01 | Vite 6.3.x / 8 Preview | pnpm 10.x | SvelteKit 2.53.x

---

## Vite 与 Svelte 的关系

SvelteKit 构建在 Vite 之上，利用 Vite 的极速开发服务器和优化生产构建。

```
SvelteKit
├── 开发: Vite Dev Server (原生 ESM, 无打包)
├── 生产: Rollup / Rolldown (Vite 8 默认)
└── Svelte 编译器: @sveltejs/vite-plugin-svelte
```

| 阶段 | 工具 | 作用 |
|------|------|------|
| **开发** | Vite Dev Server | 原生 ESM，按需编译 .svelte 文件 |
| **HMR** | Vite HMR + svelte-hmr | 组件级热更新，状态保留 |
| **生产** | Rollup / Rolldown | 代码分割、Tree-shaking、压缩 |
| **Svelte 编译** | vite-plugin-svelte | 编译 .svelte → JS，集成到 Vite 管道 |

## Vite 6/8 新特性与 SvelteKit 兼容性

### Vite 6 关键特性（2024-11 发布）

| 特性 | 说明 | SvelteKit 兼容 |
|------|------|---------------|
| **Environment API** | 细粒度的 `client`/`ssr` 环境配置 | ✅ SvelteKit 2.20+ 原生支持 |
| **resolve.conditions** | 更精准的模块解析条件 | ✅ 支持 `svelte` condition |
| **build.assetsInlineLimit** | 可针对 `ssr`/`client` 分别配置 | ✅ 减少 SSR bundle 体积 |
| **默认 target: es2022** | 放弃 es2021，减少转译开销 | ✅ Svelte 5 完全兼容 |
| **partialAccept** | 细粒度 HMR accept | ⚠️ 需 svelte-hmr 4.0+ |

> 来源: [Vite 6 Changelog](https://github.com/vitejs/vite/blob/main/packages/vite/CHANGELOG.md) | 2024-11-26

### Vite 8 Preview 特性（2026 Q2）

Vite 8 将引入 **Rolldown** 作为默认生产构建器，取代 Rollup + esbuild 的组合：

```
Vite 8 构建管线
├── 开发: Vite Dev Server (原生 ESM)
├── 生产: Rolldown (Rust 编写, 兼容 Rollup API)
│   ├── 解析: Oxc Parser (Rust)
│   ├── 转译: 内置 SWC-like 能力
│   └── Tree-shaking: 基于模块语义分析
└── 压缩: Rolldown 内置或 terser
```

| 指标 | Vite 6 (Rollup) | Vite 8 (Rolldown) | 提升 |
|------|----------------|-------------------|------|
| 冷构建时间 | 12.3s | 3.8s | ~3.2x |
| 热构建时间 | 8.1s | 2.4s | ~3.4x |
| 内存占用 | 1.2GB | 380MB | ~3.2x |

> 数据: Rolldown 基准测试 (svelte-kit-demo 项目) | 来源: [rolldown.rs](https://rolldown.rs/) | 2026-04

对 SvelteKit 的影响：

- **SvelteKit 2.53.x** 已实验性支持 `builder.rolldown`，预计 2.60 默认启用
- `.svelte` 文件的 AST 解析将由 Rolldown 的 Oxc 直接处理，跳过二次 parse
- SSR 构建将大幅加速，对边缘部署（Cloudflare/Netlify Edge）尤为关键

---

## @sveltejs/vite-plugin-svelte

```bash
npm install -D @sveltejs/vite-plugin-svelte
```

### 基础配置

```ts
// vite.config.ts
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],

  // 开发服务器
  server: {
    port: 5173,
    hmr: {
      overlay: false // 禁用错误遮罩（可选）
    }
  },

  // 构建优化
  build: {
    target: 'es2022',
    sourcemap: true,
    minify: 'esbuild'
  }
});
```

### 深度配置详解

#### 1. `compilerOptions` — Svelte 5 编译器控制

```ts
// vite.config.ts
export default defineConfig({
  plugins: [sveltekit()],
  svelte: {
    compilerOptions: {
      // 开发模式 vs 生产模式自动切换
      dev: process.env.NODE_ENV !== 'production',

      // 访问者模式：控制响应式系统生成代码
      generate: 'client', // 'client' | 'server' | 'dom' | 'ssr'

      // Svelte 4 语法兼容（迁移期关键）
      compatibility: {
        componentApi: 4,  // 支持 Svelte 4 组件 API
        accessors: 'warn' // 访问器废弃警告
      },

      // CSS 处理
      css: 'injected', // 'external' | 'injected' | 'none'

      // 运行时检查
      accessors: false,      // 是否生成 $props 访问器
      customElement: false,  // 编译为 Web Component
      namespace: 'html',     // 'html' | 'svg' | 'mathml'
      enableSourcemap: true  // 生成 sourcemap
    }
  }
});
```

> 来源: [Svelte Compiler API](https://svelte.dev/docs/svelte-compiler) | 2026-04

#### 2. `preprocess` — 预处理器管道

SvelteKit 默认通过 `svelte.config.js` 配置预处理器，但 Vite 插件层面也可覆盖：

```ts
import { sveltekit } from '@sveltejs/kit/vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    sveltekit({
      preprocess: [
        // Vite 原生预处理：PostCSS、TypeScript、Scss 自动集成
        vitePreprocess({
          script: true,        // `<script lang="ts">` 支持
          style: true,         // `<style lang="scss">` 支持
          template: true       // HTML 模板处理
        }),
        // 自定义预处理器（执行顺序：从左到右）
        {
          markup: ({ content, filename }) => {
            // 自定义标记转换（如 i18n 提取）
            return { code: content };
          },
          script: ({ content, attributes, filename }) => {
            // 仅处理特定属性的 script
            if (attributes['data-lang'] === 'graphql') {
              // 转换 GraphQL 查询
            }
            return { code: content };
          },
          style: ({ content, attributes, filename }) => {
            // PostCSS 之前的自定义样式处理
            return { code: content };
          }
        }
      ]
    })
  ]
});
```

**预处理执行顺序**：

```
.svelte 源码
  ↓
markup 预处理器（i18n、文档提取）
  ↓
script 预处理器（TypeScript → JS）
  ↓
style 预处理器（Scss → CSS → PostCSS）
  ↓
Svelte 编译器（→ 优化 JS + CSS）
  ↓
Vite 插件管道
```

> 来源: [vite-plugin-svelte 文档](https://github.com/sveltejs/vite-plugin-svelte/blob/main/docs/config.md) | 2026-04

#### 3. `hot` — HMR 精细控制

```ts
export default defineConfig({
  plugins: [
    sveltekit({
      hot: {
        // 保留组件本地状态（$state 变量）
        preserveLocalState: true,

        // 热更新时不重新挂载组件，原地替换
        noReload: false,

        // 乐观更新：即使编译失败也尝试保留 DOM
        optimistic: true,

        // 自定义状态比较键（复杂状态场景）
        compareCompileOutput: false,

        // HMR 边界文件模式
        acceptedNamespaces: ['html', 'svg']
      }
    })
  ]
});
```

### 高级 Vite 配置

```ts
// vite.config.ts
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],

  // Svelte 编译器选项
  svelte: {
    compilerOptions: {
      // 开发模式
      dev: process.env.NODE_ENV !== 'production',
      // 兼容模式（Svelte 4 语法）
      compatibility: {
        componentApi: 4
      }
    },
    // 预处理器
    preprocess: [],
    // 热更新
    hot: {
      preserveLocalState: true
    }
  },

  // 路径别名
  resolve: {
    alias: {
      $lib: '/src/lib',
      $components: '/src/components'
    }
  },

  // 优化依赖
  optimizeDeps: {
    exclude: ['svelte-codemirror-editor']
  },

  // SSR 配置
  ssr: {
    noExternal: ['@your-org/shared-package']
  }
});
```

## HMR 热更新机制

Svelte 的 HMR 是前端框架中最先进的之一：

| 特性 | Svelte HMR | React HMR |
|------|-----------|-----------|
| **状态保留** | ✅ 默认保留 | ⚠️ 需 Fast Refresh |
| **样式更新** | ✅ 无刷新 | ✅ 无刷新 |
| **组件替换** | ✅ 即时 | ✅ 即时 |
| **副作用清理** | ✅ 自动 | ⚠️ 需 useEffect 清理 |

```
保存 .svelte 文件
    ↓
Vite 检测变更
    ↓
svelte-hmr 分析组件变更范围
    ↓
仅重新编译变更组件
    ↓
替换组件，保留 $state 状态
    ↓
DOM 局部更新（无页面刷新）
```

## Vite 插件开发：自定义 Svelte 插件

### 插件架构

Vite 插件遵循 **Rollup 插件接口** + **Vite 特有钩子**：

```
Vite 插件钩子
├── 通用钩子（Rollup 兼容）
│   ├── options     → 配置预处理
│   ├── resolveId   → 模块路径解析
│   ├── load        → 加载模块源码
│   └── transform   → 转换源码
├── Vite 特有钩子
│   ├── config      → 修改 Vite 配置
│   ├── configResolved → 读取最终配置
│   ├── configureServer → 配置开发服务器
│   ├── transformIndexHtml → 转换 HTML
│   └── handleHotUpdate → 自定义 HMR
```

### 自定义 Svelte 插件示例

```ts
// plugins/vite-svelte-i18n-plugin.ts
import type { Plugin } from 'vite';
import { parse } from 'svelte/compiler';

export function svelteI18nPlugin(options: { defaultLang: string }): Plugin {
  const virtualModuleId = 'virtual:i18n-messages';
  const resolvedVirtualModuleId = '\0' + virtualModuleId;

  return {
    name: 'svelte-i18n',

    // 1. 配置阶段：注入别名
    config(config) {
      return {
        resolve: {
          alias: {
            '$i18n': virtualModuleId
          }
        }
      };
    },

    // 2. 解析虚拟模块
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
    },

    // 3. 加载虚拟模块：收集所有 .svelte 中的 t`...` 字符串
    load(id) {
      if (id === resolvedVirtualModuleId) {
        // 实际实现需扫描文件系统
        return `
          export const messages = {
            'en': ${JSON.stringify(collectedMessages.en)},
            'zh': ${JSON.stringify(collectedMessages.zh)}
          };
          export const defaultLang = '${options.defaultLang}';
        `;
      }
    },

    // 4. 转换 .svelte 文件：提取 i18n 键
    transform(code, id) {
      if (!id.endsWith('.svelte')) return;

      // 使用 Svelte AST 解析
      const ast = parse(code, { modern: true });

      // 遍历 AST，查找 {@i18n 'key'} 或 t`key` 模式
      // 实际实现需完整的 AST 遍历

      return {
        code: code.replace(/\{@i18n\s+'([^']+)'\}/g,
          (match, key) => `\${$i18n.t('${key}')}`),
        map: null
      };
    },

    // 5. HMR 处理：i18n 变更时全量刷新
    handleHotUpdate(ctx) {
      if (ctx.file.endsWith('.json') && ctx.file.includes('/locales/')) {
        // 语言文件变更时，使虚拟模块失效
        ctx.server.moduleGraph.getModulesByFile(resolvedVirtualModuleId)
          ?.forEach(mod => ctx.server.moduleGraph.invalidateModule(mod));
        return [];
      }
    }
  };
}
```

### 在 SvelteKit 中使用

```ts
// vite.config.ts
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { svelteI18nPlugin } from './plugins/vite-svelte-i18n-plugin';

export default defineConfig({
  plugins: [
    svelteI18nPlugin({ defaultLang: 'zh' }),
    sveltekit() // 顺序：自定义插件在前
  ]
});
```

> 来源: [Vite Plugin API](https://vitejs.dev/guide/api-plugin.html) | 2026-04

## SSR 构建流程详解

### SvelteKit SSR 架构

SvelteKit 采用 **Universal/Isomorphic** 渲染策略：

```
用户请求
  ↓
SvelteKit 路由匹配 (+page.server.ts / +page.ts)
  ↓
服务端数据获取 (load 函数)
  ↓
SSR 渲染入口 (src/entry.ts → generated root)
  ↓
Svelte 组件树渲染为 HTML 字符串
  ↓
注入 hydration 数据 (__sveltekit_data)
  ↓
返回完整 HTML 文档
```

### SSR 入口配置

```ts
// svelte.config.js
export default {
  kit: {
    // 自定义 SSR 入口（高级场景）
    files: {
      hooks: {
        server: 'src/hooks.server'
      }
    },

    // SSR 编译选项
    compilerOptions: {
      generate: 'server' // 服务端渲染生成模式
    }
  }
};
```

### 水合（Hydration）流程

```html
<!-- 服务端返回的 HTML -->
<!DOCTYPE html>
<html>
  <head><!-- 预渲染的 <svelte:head> --></head>
  <body>
    <div id="svelte">
      <!-- 预渲染的 DOM 树 -->
      <main><!-- ... --></main>
    </div>

    <!-- 水合数据：props + 路由状态 -->
    <script type="application/json" data-sveltekit-data>
      {"url":"/","status":200,"nodes":[...]}
    </script>

    <!-- 客户端入口加载 -->
    <script type="module" src="/_app/entry/client.js"></script>
  </body>
</html>
```

```js
// 客户端水合入口 (生成代码)
import { start } from '@sveltejs/kit/src/client/client.js';
import root from './generated/root.svelte';

start({
  target: document.body,
  root,
  // 从 data-sveltekit-data 恢复服务端状态
  hydrate: true  // 关键：attach 事件监听器而非重建 DOM
});
```

水合性能要点：

- Svelte 5 的 **fine-grained reactivity** 使水合更轻量：只需恢复信号图，无需遍历虚拟 DOM
- 服务端和客户端必须使用 **完全相同的组件代码**，否则水合不匹配

### 流式 SSR（Streaming SSR）

SvelteKit 2.50+ 支持 **渐进式流式传输**：

```svelte
<!-- +page.svelte -->
<script>
  let { data } = $props();
</script>

{#await data.streamed.comments}
  <p>加载评论中...</p>
{:then comments}
  <CommentList {comments} />
{/await}
```

```ts
// +page.server.ts
export const load = async () => {
  return {
    // 立即返回
    article: await fetchArticle(),
    // 流式传输（延迟返回，不阻塞 TTFB）
    streamed: {
      comments: fetchComments() // Promise，不解包
    }
  };
};
```

流式传输原理：

```
服务端
  ├── 立即发送: <html>...<main>文章内容</main>
  ├── 流式推送: <script>appendChunk(comment1)</script>
  ├── 流式推送: <script>appendChunk(comment2)</script>
  └── 结束: </body></html>
```

> 来源: [SvelteKit 文档 - SSR](https://kit.svelte.dev/docs/glossary#ssr) | 2026-04

---

## Svelte 组件库打包

### 库模式配置

```ts
// vite.config.ts (组件库)
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  plugins: [svelte()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/lib/index.ts'),
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'js'}`
    },
    rollupOptions: {
      external: ['svelte', 'svelte/transition', 'svelte/animate']
    }
  }
});
```

### package.json 配置

```json
{
  "name": "@your-org/svelte-ui",
  "version": "1.0.0",
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "svelte": "./dist/index.js",
      "default": "./dist/index.js"
    }
  },
  "files": ["dist"],
  "peerDependencies": {
    "svelte": "^5.0.0"
  },
  "devDependencies": {
    "@sveltejs/package": "^2.3.0",
    "@sveltejs/vite-plugin-svelte": "^5.0.0"
  }
}
```

### 类型声明生成

Svelte 5 + Vite 库模式下的类型生成有三种主流方案：

#### 方案 1: @sveltejs/package（官方推荐）

```bash
# package.json
{
  "scripts": {
    "build": "svelte-package --input src/lib --output dist"
  }
}
```

```js
// svelte.config.js (组件库)
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default {
  preprocess: vitePreprocess(),
  compilerOptions: {
    generate: 'client'
  }
};
```

`svelte-package` 自动：

1. 编译 `.svelte` → `.svelte.js` + `.svelte.d.ts`
2. 生成类型声明，保留 Svelte 组件泛型（`$props<T>()`）
3. 正确处理 `svelte` export condition

#### 方案 2: vite-plugin-dts

```ts
// vite.config.ts
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    svelte(),
    dts({
      include: ['src/lib/**/*'],
      exclude: ['src/lib/**/*.spec.ts'],
      // 插入 .svelte 文件类型声明
      insertTypesEntry: true,
      // 生成 rollup 类型
      rollupTypes: true
    })
  ]
});
```

#### 方案 3: tsc + svelte2tsx（遗留项目）

```json
// tsconfig.json
{
  "compilerOptions": {
    "declaration": true,
    "emitDeclarationOnly": true,
    "outDir": "./dist"
  },
  "include": ["src/lib/**/*"]
}
```

### exports 字段深度配置

```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "svelte": "./dist/index.js",
      "default": "./dist/index.js"
    },
    "./Button.svelte": {
      "types": "./dist/Button.svelte.d.ts",
      "svelte": "./dist/Button.svelte",
      "default": "./dist/Button.svelte"
    },
    "./styles.css": {
      "default": "./dist/styles.css"
    },
    "./package.json": "./package.json"
  },
  "svelte": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "main": "./dist/index.js",
  "module": "./dist/index.js"
}
```

> 来源: [Publishing Svelte Components](https://svelte.dev/docs/kit/packaging) | 2026-04

---

## pnpm + SvelteKit Monorepo 实战

### 目录结构

```
svelte-monorepo/
├── pnpm-workspace.yaml
├── package.json
├── turbo.json
├── apps/
│   ├── web/              # SvelteKit 主应用
│   └── docs/             # 文档站点
├── packages/
│   ├── ui/               # Svelte 组件库
│   ├── config/           # 共享配置
│   └── utils/            # 工具函数
└── tooling/
    ├── eslint/           # ESLint 配置
    └── typescript/       # TS 配置
```

### pnpm-workspace.yaml

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
  - 'tooling/*'

catalog:
  svelte: ^5.53.0
  vite: ^6.3.0
  typescript: ^5.8.0

  # 开发依赖
  '@sveltejs/kit': ^2.53.0
  '@sveltejs/vite-plugin-svelte': ^5.0.0
```

### 使用 Catalog

```json
// packages/ui/package.json
{
  "dependencies": {
    "svelte": "catalog:"
  },
  "devDependencies": {
    "vite": "catalog:",
    "@sveltejs/vite-plugin-svelte": "catalog:"
  }
}
```

### pnpm filter 命令实战

```bash
# 1. 安装所有依赖（workspace root）
pnpm install

# 2. 仅构建 UI 组件库
pnpm --filter @acme/ui build

# 3. 构建 UI 及其所有依赖
pnpm --filter @acme/ui... build

# 4. 构建依赖 UI 的所有应用
pnpm --filter ...@acme/ui build

# 5. 并行开发所有应用
pnpm --parallel --filter ./apps/* dev

# 6. 为 web 应用及其依赖添加依赖
pnpm --filter @acme/web add lodash
pnpm --filter @acme/web --filter @acme/ui add -D typescript@catalog:

# 7. 清理所有 node_modules
pnpm -r exec rm -rf node_modules
pnpm install

# 8. 发布所有包（ Changesets 工作流）
pnpm changeset version
pnpm -r publish --access public
```

### turbo.json 任务管道

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".svelte-kit/**", "dist/**"]
    },
    "check": {
      "dependsOn": ["^build"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

### 进阶 turbo.json（SvelteKit Monorepo 完整版）

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalEnv": ["NODE_ENV", "PUBLIC_API_URL"],
  "globalDependencies": ["**/.env.*local"],

  "tasks": {
    "topo": {
      "dependsOn": ["^topo"]
    },

    "build": {
      "dependsOn": ["^build"],
      "inputs": [
        "$TURBO_DEFAULT$",
        ".env.local",
        ".env.production"
      ],
      "outputs": [
        ".svelte-kit/output/**",
        "dist/**",
        "!.svelte-kit/output/client/**"
      ],
      "outputLogs": "new-only"
    },

    "check": {
      "dependsOn": ["^build"],
      "inputs": ["$TURBO_DEFAULT$", "../config/tsconfig.json"]
    },

    "test": {
      "dependsOn": ["^build"],
      "inputs": ["$TURBO_DEFAULT$", "**/*.test.ts", "**/*.spec.ts"],
      "outputs": ["coverage/**"]
    },

    "dev": {
      "cache": false,
      "persistent": true,
      "env": ["VITE_*", "PUBLIC_*"]
    },

    "lint": {
      "dependsOn": ["^topo"]
    },

    "clean": {
      "cache": false
    }
  }
}
```

### Monorepo 中的 Vite 配置共享

```ts
// packages/config/vite/index.ts
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, type UserConfig } from 'vite';

interface SvelteKitAppOptions {
  port?: number;
  customAliases?: Record<string, string>;
}

export function createSvelteKitConfig(options: SvelteKitAppOptions = {}): UserConfig {
  return defineConfig({
    plugins: [sveltekit()],
    server: {
      port: options.port ?? 5173,
      strictPort: false
    },
    resolve: {
      alias: {
        $lib: '/src/lib',
        ...options.customAliases
      }
    },
    build: {
      target: 'es2022',
      sourcemap: process.env.NODE_ENV !== 'production'
    },
    // Monorepo 关键：确保本地包正确链接
    optimizeDeps: {
      force: false,
      include: []
    }
  });
}
```

```ts
// apps/web/vite.config.ts
import { createSvelteKitConfig } from '@acme/config/vite';

export default createSvelteKitConfig({
  port: 3000,
  customAliases: {
    $features: '/src/features'
  }
});
```

> 来源: [pnpm Workspaces](https://pnpm.io/workspaces), [Turbo Repo](https://turbo.build/repo/docs) | 2026-04

---

## 构建性能优化清单

### 开发环境优化

| # | 优化项 | 配置 | 预期效果 |
|---|--------|------|----------|
| 1 | **依赖预构建缓存** | `optimizeDeps.force: false` | 二次启动 < 1s |
| 2 | **明确 include 范围** | `optimizeDeps.include: ['lodash-es']` | 避免运行时扫描 |
| 3 | **排除问题包** | `optimizeDeps.exclude: ['svelte-codemirror-editor']` | 跳过 CommonJS 转换 |
| 4 | **TS 类型隔离** | `"compilerOptions.skipLibCheck": true` | 减少类型检查 40%+ |
| 5 | **条件 exports** | `resolve.conditions: ['svelte']` | 直接导入源码，无需 dist |

### 生产构建优化

| # | 优化项 | 配置 | 预期效果 |
|---|--------|------|----------|
| 6 | **现代 target** | `build.target: 'es2022'` | 减少 polyfill，体积 -15% |
| 7 | **关闭 sourcemap** | `build.sourcemap: false` | 构建速度 +30%，体积 -30% |
| 8 | **动态导入分割** | `import('./heavy-chart.svelte')` | 首屏 JS 分割 |
| 9 | **CSS 代码分割** | `build.cssCodeSplit: true` | 并行加载 CSS |
| 10 | **SSR noExternal** | `ssr.noExternal: ['@acme/ui']` | 避免重复打包本地包 |
| 11 | **rollup 手动分块** | `output.manualChunks` | 缓存命中率提升 |
| 12 | **esbuild 压缩** | `build.minify: 'esbuild'` | 比 terser 快 10-20x |
| 13 | **资源内联阈值** | `build.assetsInlineLimit: 4096` | 减少 HTTP 请求 |
| 14 | **预渲染（SSG）** | `prerender.entries: ['/']` | CDN 直接服务静态页面 |
| 15 | **Vite 8 Rolldown** | `builder.rolldown: true` (实验性) | 构建速度 3x+ |

### 配置示例

```ts
// vite.config.ts
export default defineConfig({
  plugins: [sveltekit()],

  resolve: {
    conditions: ['svelte'] // 优先使用 .svelte 源码
  },

  optimizeDeps: {
    include: [
      'svelte/transition',
      'svelte/animate',
      '@acme/ui' // Monorepo 本地包预构建
    ],
    exclude: [
      'svelte-codemirror-editor',
      '@sveltejs/kit' // SvelteKit 自身无需预构建
    ]
  },

  build: {
    target: 'es2022',
    sourcemap: false,
    minify: 'esbuild',
    cssCodeSplit: true,
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-svelte': ['svelte', 'svelte/transition'],
          'vendor-ui': ['@acme/ui']
        }
      }
    }
  },

  ssr: {
    noExternal: ['@acme/ui', '@acme/utils']
  }
});
```

### 生产构建分析

```bash
# 分析 bundle 大小
npm run build -- --analyze

# 或使用 rollup-plugin-visualizer
npm install -D rollup-plugin-visualizer
```

```ts
// vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    sveltekit(),
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true
    })
  ]
});
```

---

## 常见构建问题与解决方案

### 问题 1: `Cannot find module '/@fs/.../node_modules/...'`

**原因**: pnpm 的严格依赖隔离导致 Vite 无法解析深层依赖。

**解决**:

```ts
// vite.config.ts
export default defineConfig({
  resolve: {
    preserveSymlinks: false // pnpm 必须 false
  },
  optimizeDeps: {
    include: ['被解析失败的包名']
  }
});
```

> 来源: [Vite Troubleshooting](https://vitejs.dev/guide/troubleshooting.html) | 2026-04

### 问题 2: SSR 构建时 `window is not defined`

**原因**: 服务端执行了仅客户端可用的代码。

**解决**:

```svelte
<script>
  import { browser } from '$app/environment';

  onMount(() => {
    // 安全：仅在浏览器执行
    if (browser) {
      window.addEventListener('scroll', handler);
    }
  });
</script>
```

### 问题 3: HMR 失效，页面全量刷新

**排查清单**:

| 检查项 | 正常状态 | 修复方法 |
|--------|----------|----------|
| svelte-hmr 版本 | ^4.0.0 | `pnpm update svelte-hmr` |
| Vite HMR 端口 | 与 server 端口一致 | 显式配置 `server.hmr.port` |
| 循环依赖 | 无循环 | `madge --circular src/` |
| 条件导出 | 不返回新模块实例 | 检查 `load()` 钩子 |

### 问题 4: Monorepo 中 `@acme/ui` 改动未生效

**原因**: pnpm 使用硬链接，Vite 缓存了旧版本。

**解决**:

```bash
# 方法 1: 强制重新预构建
pnpm --filter @acme/web exec vite --force

# 方法 2: 配置依赖搜索
// vite.config.ts
export default defineConfig({
  optimizeDeps: {
    exclude: ['@acme/ui'] // 开发时排除，使用源码
  }
});
```

### 问题 5: Svelte 5 `runes` 模式在库模式下不生效

**原因**: 库打包时 `compilerOptions.runes` 默认为 `undefined`（自动检测），可能误识别旧语法。

**解决**:

```ts
// vite.config.ts (组件库)
export default defineConfig({
  plugins: [
    svelte({
      compilerOptions: {
        runes: true // 强制启用 Runes 模式
      }
    })
  ]
});
```

### 问题 6: 类型声明中 `.svelte` 文件无法识别

**解决**:

```ts
// src/app.d.ts (SvelteKit 应用) 或 global.d.ts (组件库)
declare module '*.svelte' {
  import type { Component } from 'svelte';
  import type { SvelteComponent } from 'svelte';

  // Svelte 5 方式
  const component: Component<Props>;
  export default component;
}
```

### 问题 7: 生产构建内存溢出（OOM）

```bash
# 增加 Node.js 内存限制
NODE_OPTIONS="--max-old-space-size=8192" pnpm build

# 或分步构建
pnpm build:client
pnpm build:server
```

```ts
// vite.config.ts: 减少并发
export default defineConfig({
  build: {
    // 降低 Rollup 并发 worker 数
    rollupOptions: {
      maxParallelFileOps: 100
    }
  }
});
```

---

## 2026 Vite 8 + Rolldown 对 SvelteKit 的影响

### Rolldown 技术架构

Rolldown 是用 **Rust** 编写的下一代 JavaScript 打包器，API 兼容 Rollup：

```
Rolldown 内部管线
├── Oxc Parser (Rust)        ← 替代 acorn
├── Oxc Transformer (Rust)   ← 替代 babel/swc 部分功能
├── Rolldown Bundler (Rust)  ← 替代 rollup
│   ├── 模块图构建（并行）
│   ├── Tree-shaking（基于语法分析）
│   └── 代码生成（Rust → JS 字符串）
└── 可选：minifier (Rust 或 esbuild)
```

### 对 SvelteKit 的具体影响

| 维度 | Vite 6 (Rollup) | Vite 8 (Rolldown) | SvelteKit 适配 |
|------|----------------|-------------------|---------------|
| **构建速度** | 中等（JS 单线程） | 极快（Rust 多线程） | 无改动，自动受益 |
| **HMR** | esbuild transform | Rolldown 增量编译 | 需 svelte-hmr 适配新 API |
| **Sourcemap** | 高质量 | 兼容但格式可能不同 | 测试 sourcemap 准确性 |
| **插件生态** | Rollup 插件直接可用 | 高度兼容，边缘情况待测 | 主流插件已验证 |
| **内存占用** | 较高 | 显著降低 | 边缘部署更友好 |
| **错误信息** | 详细 JS 堆栈 | Rust panic + JS 包装 | 错误处理需更新 |

### SvelteKit 迁移检查清单（Vite 8）

```markdown
- [ ] 升级 `@sveltejs/kit` 到 ^2.60.0（预计 Vite 8 兼容版本）
- [ ] 升级 `@sveltejs/vite-plugin-svelte` 到 ^6.0.0
- [ ] 检查自定义 Vite 插件是否使用 Rolldown 兼容 API
- [ ] 验证 `svelte.config.js` 中的 `vite` 配置无需调整
- [ ] 测试 SSR 构建输出（边缘平台：Vercel/Netlify/Cloudflare）
- [ ] 验证 sourcemap 在生产调试中可用
- [ ] 检查 monorepo 中 `optimizeDeps` 行为（Rolldown 预构建不同）
- [ ] 基准测试：记录迁移前后的 `pnpm build` 耗时
```

### 实验性启用 Rolldown（SvelteKit 2.53.x）

```ts
// svelte.config.js
export default {
  kit: {
    // 实验性：启用 Rolldown 构建器
    builder: {
      rolldown: true
    }
  }
};
```

```bash
# 观察 Rolldown 构建差异
DEBUG=rolldown pnpm build
```

### 社区时间线

| 时间 | 里程碑 |
|------|--------|
| 2024-11 | Vite 6 发布，引入 Environment API |
| 2025-06 | Rolldown 0.14 Beta，核心功能稳定 |
| 2026-02 | Vite 8 Alpha，Rolldown 作为可选构建器 |
| 2026-05 | Vite 8 RC，SvelteKit 2.53 实验性支持 |
| 2026-Q3 | Vite 8 Stable，SvelteKit 2.60 默认启用（预计）|

> 来源: [Vite 路线图](<https://github.com/vitejs/vite/discussions/171> July 修正: 使用公开信息), [Rolldown 仓库](https://github.com/rolldown/rolldown) | 2026-04-30

---

## 参考资源

- [Vite 官方文档](https://vitejs.dev/) 📚
- [@sveltejs/vite-plugin-svelte](https://github.com/sveltejs/vite-plugin-svelte) 🛠️
- [pnpm Workspace](https://pnpm.io/workspaces) 📚
- [Turbo Repo](https://turbo.build/) 📚
- [Rolldown 官方](https://rolldown.rs/) 🦀
- [SvelteKit Packaging](https://svelte.dev/docs/kit/packaging) 📦
- [Svelte Compiler Options](https://svelte.dev/docs/svelte-compiler) ⚙️

> 最后更新: 2026-05-01 | 数据来源: vitejs.dev, pnpm.io, rolldown.rs, svelte.dev 官方文档
