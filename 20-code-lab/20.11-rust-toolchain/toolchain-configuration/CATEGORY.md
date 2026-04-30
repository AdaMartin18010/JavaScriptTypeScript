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

#### Rust 工具链锁定与跨平台编译

```toml
# rust-toolchain.toml
[toolchain]
channel = "1.78.0"
components = ["rustfmt", "clippy"]
targets = ["wasm32-unknown-unknown", "aarch64-unknown-linux-gnu"]
profile = "minimal"
```

```toml
# Cargo.toml (workspace)
[workspace]
members = ["packages/*"]
resolver = "2"

[workspace.dependencies]
napi = { version = "2", features = ["napi8"] }
tokio = { version = "1", features = ["full"] }
```

#### pnpm 与 Cargo 混合工作区脚本

```json
// package.json (root)
{
  "scripts": {
    "build:rust": "cargo build --release && pnpm napi build",
    "lint:rs": "cargo clippy --all-targets --all-features -- -D warnings",
    "fmt:rs": "cargo fmt --all -- --check",
    "lint:js": "biome check .",
    "fmt:js": "biome format . --write"
  }
}
```

#### GitHub Actions — Rust + Node.js 混合 CI

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - uses: dtolnay/rust-action@stable
        with:
          toolchain: 1.78.0
          targets: wasm32-unknown-unknown
      - run: pnpm install
      - run: pnpm lint:js
      - run: pnpm lint:rs
      - run: pnpm build:rust
      - run: pnpm test
```

#### Oxlint 集成与渐进式迁移

```typescript
// oxc-integration.ts — 渐进式引入 Oxlint 的 npm 脚本封装
import { execSync } from 'child_process';

export function runOxlint(paths: string[], rules?: string[]) {
  const cmd = ['npx', 'oxlint', ...paths];
  if (rules?.length) cmd.push('--rules', rules.join(','));
  // 初期仅作为警告，不阻塞 CI
  cmd.push('--deny-warnings', 'false');
  return execSync(cmd.join(' '), { encoding: 'utf-8', stdio: 'inherit' });
}
```

```jsonc
// package.json — 双 lint 阶段：Oxlint 快速反馈 + ESLint 深度检查
{
  "scripts": {
    "lint:fast": "oxlint src/ --import-plugin --jsx-a11y-plugin",
    "lint:deep": "eslint src/ --ext .ts,.tsx",
    "lint": "pnpm lint:fast && pnpm lint:deep"
  }
}
```

#### Rspack 配置示例（Rust 驱动 webpack 替代方案）

```typescript
// rspack.config.ts
import { defineConfig } from '@rspack/core';

export default defineConfig({
  entry: { main: './src/index.ts' },
  resolve: { extensions: ['.ts', '.tsx', '.js'] },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'builtin:swc-loader',
          options: {
            jsc: { parser: { syntax: 'typescript', tsx: true }, target: 'es2022' },
          },
        },
      },
    ],
  },
  plugins: [
    // Rspack 内置 HTML 插件，无需额外安装
    new (require('@rspack/core').HtmlRspackPlugin)({ template: './index.html' }),
  ],
});
```

#### napi-rs 绑定自动生成

```typescript
// napi-rs 生成的 TypeScript 声明与 Rust 函数对应
// Cargo.toml 中配置 napi = "2"
// 通过 #[napi] 宏自动导出

// src/lib.rs
// use napi_derive::napi;
// #[napi]
// pub fn fibonacci(n: u32) -> u32 {
//     match n { 0 => 0, 1 => 1, _ => fibonacci(n - 1) + fibonacci(n - 2) }
// }

// index.ts — 消费编译后的 .node 二进制
import { fibonacci } from './index.node';
console.log(fibonacci(10)); // 55
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
| GitHub Actions 文档 | 文档 | [docs.github.com/actions](https://docs.github.com/actions) |
| pnpm 工作区 | 文档 | [pnpm.io/workspaces](https://pnpm.io/workspaces) |
| cross-rs — 交叉编译 | 仓库 | [github.com/cross-rs/cross](https://github.com/cross-rs/cross) |
| Rspack 官方文档 | 文档 | [rspack.dev](https://www.rspack.dev/) |
| Oxlint 规则列表 | 文档 | [oxc.rs/docs/guide/usage/linter/rules.html](https://oxc.rs/docs/guide/usage/linter/rules.html) |
| napi-rs 指南 | 文档 | [napi.rs](https://napi.rs/) |
| ESBuild 文档 | 文档 | [esbuild.github.io](https://esbuild.github.io/) |
| Bun Bundler | 文档 | [bun.sh/docs/bundler](https://bun.sh/docs/bundler) |
| Moonrepo — 构建系统 | 文档 | [moonrepo.dev](https://moonrepo.dev/) |
| Changesets 版本管理 | 文档 | [github.com/changesets/changesets](https://github.com/changesets/changesets) |

---

*最后更新: 2026-04-30*
