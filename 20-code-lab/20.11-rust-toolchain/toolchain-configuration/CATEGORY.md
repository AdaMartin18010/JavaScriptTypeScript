---
dimension: 综合
sub-dimension: Toolchain configuration
created: 2026-04-28
---

# 模块归属声明

本模块归属 **「综合」** 维度，聚焦 Toolchain configuration 核心概念与工程实践。

## 包含内容

- Rust 工具链配置、JS/TS 格式化与 lint 迁移、Vite/Rolldown/Oxc 集成。

## 相关索引

- `30-knowledge-base/30.2-categories/README.md` — 分类总览
- `20-code-lab/` — 代码实验室实践

## 目录内容

- 📄 23-toolchain-configuration.test.ts
- 📄 README.md
- 📄 THEORY.md
- 📄 _MIGRATED_FROM.md
- 📄 biome-migration.ts
- 📄 eslint-prettier.test.ts
- 📄 eslint-prettier.ts
- 📄 index.ts
- 📄 oxc-integration.ts
- 📄 rolldown-config.ts
- 📁 rust-toolchain-migration
- 📄 vite-config.test.ts
- 📄 vite-config.ts

## 子模块速查

| 子模块 | 说明 | 入口文件 |
|--------|------|----------|
| eslint-prettier | ESLint 与 Prettier 的协同配置与冲突解决 | `eslint-prettier.ts` |
| biome-migration | 从 ESLint/Prettier 迁移到 Biome 的自动化脚本 | `biome-migration.ts` |
| oxc-integration | Oxc 高性能 JavaScript 工具链的接入配置 | `oxc-integration.ts` |
| rolldown-config | Rolldown（Rust 版 Rollup）配置示例 | `rolldown-config.ts` |
| vite-config | Vite 开发与生产构建的优化配置 | `vite-config.ts` |
| rust-toolchain-migration | Rust 工具链版本迁移与锁定策略 | `rust-toolchain-migration/` |

## 工具对比

| 工具 | 语言 | 覆盖范围 | 性能 | 配置复杂度 | 迁移成本 | 适用场景 |
|------|------|----------|------|------------|----------|----------|
| ESLint + Prettier | JS | Lint + Format | 基准 | 高（多插件） | 低（存量大） | 大型遗留项目、需深度定制规则 |
| Biome | Rust | Lint + Format + Sort imports | ~10-20× | 低（预设合理） | 中 | 新项目、追求统一配置 |
| Oxc | Rust | Lint + Minify + Transformer | ~30-50× | 中 | 中（部分规则缺失） | 构建链路加速、CI 提速 |
| dprint | Rust | Format（多语言） | ~10× | 低 | 低 | 跨语言统一格式化 |
| Ruff (Python) | Rust | Lint + Format | ~100× | 低 | 低 | Python 生态参考 |

## 代码示例

以下展示一个基于 Rust 工具链理念的 Vite + Rolldown 混合配置：

```typescript
// vite-config.ts
import { defineConfig } from 'vite';
import { rustPlugin } from './oxc-integration';

export default defineConfig({
  plugins: [rustPlugin()],
  build: {
    // 实验性启用 Rolldown 作为底层打包器
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          utils: ['lodash-es'],
        },
      },
    },
    sourcemap: true,
    minify: 'terser',
  },
  esbuild: {
    target: 'es2022',
    legalComments: 'none',
  },
});
```

#### Biome 统一配置示例

```jsonc
// biome.json
{
  "$schema": "https://biomejs.dev/schemas/1.8.0/schema.json",
  "organizeImports": { "enabled": true },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "suspicious": { "noConsoleLog": "warn" }
    }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "javascript": {
    "formatter": { "quoteStyle": "single", "trailingCommas": "es5" }
  }
}
```

---

> 此分类文档由批量生成脚本自动创建，请根据实际模块内容补充和调整。

## 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| Vite 官方文档 | 文档 | [vitejs.dev](https://vitejs.dev/) |
| Rolldown GitHub | 仓库 | [github.com/rolldown/rolldown](https://github.com/rolldown/rolldown) |
| Oxc 工具链 | 文档 | [oxc.rs](https://oxc.rs/) |
| Biome 文档 | 文档 | [biomejs.dev](https://biomejs.dev/) |
| Rust Book — Cargo & Toolchains | 指南 | [doc.rust-lang.org/cargo](https://doc.rust-lang.org/cargo/) |
| Rustup Book | 指南 | [rust-lang.github.io/rustup](https://rust-lang.github.io/rustup/) |
| SWC 文档 | 文档 | [swc.rs](https://swc.rs/) |

---

*最后更新: 2026-04-29*
