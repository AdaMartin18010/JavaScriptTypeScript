# JS/TS 编译器对比（2026 版）

> TypeScript Compiler、tsgo、SWC、Babel、Oxc、esbuild 的深度对比矩阵。
> **权威参考**: [TypeScript 官网](https://www.typescriptlang.org/) | [SWC Docs](https://swc.rs/docs/getting-started) | [esbuild Docs](https://esbuild.github.io/) | [Oxc Project](https://oxc.rs/) | [Babel Docs](https://babeljs.io/docs/) | [Go Compiler Announcement](https://devblogs.microsoft.com/typescript/typescript-native-port/)

---

## 对比矩阵

| 维度 | tsc | tsgo (Go) | SWC | Babel | Oxc | esbuild |
|------|-----|-----------|-----|-------|-----|---------|
| **语言** | TypeScript | Go | Rust | JavaScript | Rust | Go |
| **类型检查** | ✅ 原生 | ✅ 原生 (移植中) | ❌ | ❌ | ❌ | ❌ |
| **转译速度** | 基准 (1x) | **~50x** (预计) | ~20x | ~2x | ~30x | ~15x |
| **输出质量** | 最高 | 高 | 高 | 高 | 高 | 中 |
| **Tree Shaking** | ❌ | 待定 | ✅ | 需插件 | ✅ | ✅ |
| **Minify** | ❌ | 待定 | ✅ | 需插件 (terser) | ✅ | ✅ |
| **Source Maps** | ✅ 精确 | 待定 | ✅ | ✅ | ✅ | ✅ |
| **Config 复杂度** | 低 | 低 | 低 | 高 (.babelrc) | 极低 | 低 |
| **JSX 支持** | ✅ | ✅ | ✅ | ✅ (preset-react) | ✅ | ✅ |
| **Decorators** | ✅ (legacy + TC39) | 待定 | ✅ | ✅ (plugin) | ✅ | ⚠️ 部分 |
| **Legacy Browser** | 可配置 target | 待定 | 可配置 | 最全 (preset-env) | 可配置 | 有限 |
| **Plugin 生态** | N/A | N/A | 有限 | **最大** | 成长中 | 有限 |
| **最佳场景** | 类型检查 | 未来统一方案 | Next.js/Vite 构建 | 遗留项目插件 | 下一代统一工具 | 库打包 |

---

## 2026 推荐组合

| 场景 | 工具链 | 说明 |
|------|--------|------|
| Next.js 项目 | SWC（转译）+ tsc（类型检查） | Next.js 默认 SWC |
| Vite 项目 | esbuild（dev）+ Rollup（build） | Vite 双引擎架构 |
| 库开发 | tsup（esbuild + 类型生成） | 一键打包 ESM/CJS |
| 极致速度 | Oxc（实验性，未来统一） | Rspack/Rolldown 底层 |
| 遗留 Babel 插件 | Babel（逐步迁移至 SWC） | 插件生态最全 |
| 类型检查 CI | tsc --noEmit | 唯一原生类型检查 |
| 未来统一方案 | tsgo (Microsoft Go port) | 预计 2026-2027 GA |

> 📖 参考：[TypeScript Native Port](https://devblogs.microsoft.com/typescript/typescript-native-port/) | [Vite Why Not Bundle with esbuild](https://vitejs.dev/guide/why.html#why-not-bundle-with-esbuild)

---

## 编译器架构对比

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Babel     │    │    SWC      │    │    Oxc      │
│  (JS-based) │    │   (Rust)    │    │   (Rust)    │
├─────────────┤    ├─────────────┤    ├─────────────┤
│ @babel/core │    │   Parser    │    │   Parser    │
│  - parse()  │    │  (SWC)      │    │  (Oxc)      │
│  - transform│    ├─────────────┤    ├─────────────┤
│  - generate │    │ Transformer │    │ Transformer │
├─────────────┤    │  (SWC)      │    │  (Oxc)      │
│ Plugin API  │    ├─────────────┤    ├─────────────┤
│ - visitor   │    │   CodeGen   │    │   Minifier  │
│ - preset    │    │  (SWC)      │    │   (Oxc)     │
└─────────────┘    └─────────────┘    ├─────────────┤
                                      │   Linter    │
                                      │  (Oxlint)   │
                                      └─────────────┘

┌─────────────┐    ┌─────────────┐
│   esbuild   │    │    tsgo     │
│    (Go)     │    │    (Go)     │
├─────────────┤    ├─────────────┤
│   Parser    │    │   Parser    │
│  (Go)       │    │  (Go)       │
├─────────────┤    ├─────────────┤
│  Linker     │    │ Type Checker│
│  (Go)       │    │  (Go)       │
├─────────────┤    ├─────────────┤
│  Bundler    │    │   Emitter   │
│  (Go)       │    │  (Go)       │
└─────────────┘    └─────────────┘
```

---

## 代码示例：SWC 配置 (.swcrc)

```json
{
  "$schema": "https://json.schemastore.org/swcrc",
  "jsc": {
    "parser": {
      "syntax": "typescript",
      "tsx": true,
      "decorators": true,
      "dynamicImport": true
    },
    "transform": {
      "react": {
        "runtime": "automatic",
        "pragma": "React.createElement",
        "pragmaFrag": "React.Fragment",
        "throwIfNamespace": true,
        "development": false,
        "useBuiltins": false
      },
      "legacyDecorator": false,
      "decoratorMetadata": false
    },
    "target": "es2022",
    "loose": false,
    "externalHelpers": false,
    "keepClassNames": false,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./src/components/*"]
    }
  },
  "module": {
    "type": "es6",
    "strict": false,
    "strictMode": true,
    "lazy": false,
    "noInterop": false
  },
  "minify": true,
  "isModule": true,
  "sourceMaps": true
}
```

### 配合 @swc/cli 使用

```bash
# 安装
npm install -D @swc/core @swc/cli

# 编译单个文件
npx swc src/index.ts -o dist/index.js

# 编译整个目录
npx swc src -d dist --config-file .swcrc

# 监视模式
npx swc src -d dist -w
```

> 📖 参考：[SWC Configuration](https://swc.rs/docs/configuration/compilation) | [Migration from Babel](https://swc.rs/docs/migrating-from-babel)

---

## 代码示例：Babel 现代配置（.babelrc 或 babel.config.js）

```javascript
// babel.config.js
module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: { node: 'current' },
        modules: false,          // 保留 ESM，由打包器处理
        useBuiltIns: 'usage',    // 按需 polyfill
        corejs: 3,
      },
    ],
    [
      '@babel/preset-typescript',
      {
        isTSX: true,
        allExtensions: true,
      },
    ],
    [
      '@babel/preset-react',
      { runtime: 'automatic' },  // React 17+ JSX Transform
    ],
  ],
  plugins: [
    '@babel/plugin-proposal-decorators',
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-syntax-import-assertions',
  ],
  env: {
    test: {
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
      ],
    },
  },
};
```

> 📖 参考：[Babel Configuration](https://babeljs.io/docs/configuration) | [Babel Preset Env](https://babeljs.io/docs/babel-preset-env)

---

## 代码示例：esbuild 脚本化构建

```typescript
// scripts/build.ts
import * as esbuild from 'esbuild';
import { nodeExternalsPlugin } from 'esbuild-node-externals';

async function build() {
  const common: esbuild.BuildOptions = {
    entryPoints: ['src/index.ts'],
    bundle: true,
    platform: 'node',
    target: 'node20',
    tsconfig: './tsconfig.json',
    sourcemap: true,
    plugins: [nodeExternalsPlugin()],
  };

  // ESM 构建
  await esbuild.build({
    ...common,
    format: 'esm',
    outfile: 'dist/index.mjs',
  });

  // CJS 构建
  await esbuild.build({
    ...common,
    format: 'cjs',
    outfile: 'dist/index.cjs',
  });

  // 类型声明由 tsc 并行生成
  console.log('Build complete');
}

build();
```

> 📖 参考：[esbuild JavaScript API](https://esbuild.github.io/api/)

---

## 代码示例：Oxc 工具链集成

```bash
# Oxc 提供零配置的高性能工具集

# 1. 转译（Oxc Transformer）
npx oxc-transform src/index.ts -o dist/index.js

# 2. 代码检查（Oxlint — ESLint 替代）
npx oxlint src --import-plugin --jest-plugin --react-perf-plugin

# 3. 格式化（Oxc Formatter — Prettier 替代）
npx oxc-format src --write

# 4. 压缩（Oxc Minifier）
npx oxc-minify dist/index.js -o dist/index.min.js
```

```javascript
// oxc.config.js
module.exports = {
  transformer: {
    target: 'es2022',
    jsx: {
      runtime: 'automatic',
      importSource: 'react',
    },
  },
  linter: {
    rules: {
      'no-console': 'warn',
      'no-unused-vars': 'error',
      'prefer-const': 'warn',
    },
  },
};
```

> 📖 参考：[Oxc Configuration](https://oxc.rs/docs/learn/config.html) | [Oxlint Rules](https://oxc.rs/docs/guide/usage/linter/rules.html)

---

## 代码示例：tsup 库打包配置

```typescript
// tsup.config.ts — 现代库打包
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],     // 双格式输出
  dts: true,                   // 生成 .d.ts
  splitting: false,            // 代码分割
  sourcemap: true,
  clean: true,
  minify: true,
  target: 'es2020',
  treeshake: true,
  external: ['react', 'react-dom'], // 不打包 peer deps
});
```

```bash
# 一键打包
npx tsup

# 输出
# dist/index.js     (CJS)
# dist/index.mjs    (ESM)
# dist/index.d.ts   (类型定义)
# dist/index.js.map (Source map)
```

> 📖 参考：[tsup Documentation](https://tsup.egoist.dev/)

---

## 编译速度基准

| 项目规模 | tsc | Babel | SWC | esbuild | Oxc |
|---------|-----|-------|-----|---------|-----|
| 小型 (1K LOC) | 2s | 1.5s | 0.1s | 0.05s | 0.08s |
| 中型 (50K LOC) | 15s | 8s | 0.8s | 0.6s | 0.5s |
| 大型 (500K LOC) | 120s | 60s | 6s | 5s | **4s** |
| 超大型 (2M LOC) | 480s | 240s | 25s | 20s | **15s** |

> 📊 数据为相对估算，实际性能取决于硬件和配置。来源：[SWC Benchmarks](https://swc.rs/docs/benchmarks) | [Oxc Benchmarks](https://oxc.rs/docs/learn/benchmarks.html)

---

## 权威参考链接

- [TypeScript 官方网站](https://www.typescriptlang.org/)
- [TypeScript Native Port (Go)](https://devblogs.microsoft.com/typescript/typescript-native-port/)
- [SWC 官方文档](https://swc.rs/docs/getting-started)
- [SWC 配置参考](https://swc.rs/docs/configuration/compilation)
- [esbuild 官方文档](https://esbuild.github.io/)
- [esbuild API 文档](https://esbuild.github.io/api/)
- [Oxc 项目主页](https://oxc.rs/)
- [Oxlint 规则列表](https://oxc.rs/docs/guide/usage/linter/rules.html)
- [Babel 官方文档](https://babeljs.io/docs/)
- [Babel Preset Env](https://babeljs.io/docs/babel-preset-env)
- [tsup 文档](https://tsup.egoist.dev/)
- [Vite 为何不用 esbuild 打包](https://vitejs.dev/guide/why.html#why-not-bundle-with-esbuild)
- [Rspack 基于 Oxc 的构建](https://www.rspack.dev/)
- [Rolldown 基于 Oxc 的打包](https://rolldown.rs/)
- [React Compiler (Babel Plugin)](https://react.dev/learn/react-compiler)
- [Can I Use — ES Modules](https://caniuse.com/es6-module)
- [Node.js TypeScript 类型剥离](https://nodejs.org/api/typescript.html)
- [ECMAScript 兼容性表](https://compat-table.github.io/compat-table/es2016plus/)
- [TSESTree — TypeScript AST 规范](https://typescript-eslint.io/packages/typescript-estree/)

---

*最后更新: 2026-04-29*
