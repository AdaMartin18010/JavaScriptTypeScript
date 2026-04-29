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

*最后更新: 2026-04-29*
