# 代码检查与格式化 (Linting & Formatting)

> JavaScript/TypeScript 代码质量工具链的 2026 全景对比：从 ESLint 生态到 Rust 原生工具链的范式转移。

---

## 核心概念

现代代码质量工具链分为**三个角色**：

| 角色 | 职责 | 说明 |
|------|------|------|
| **Linter（检查器）** | 静态分析代码错误、风格、最佳实践 | ESLint, Biome, Oxlint |
| **Formatter（格式化器）** | 统一代码排版风格 | Prettier, Biome, dprint |
| **Type Checker（类型检查）** | 编译时类型验证 | TypeScript (`tsc`) |

> **2026 关键趋势**：Rust 原生工具（Biome, Oxlint, dprint）以 10–80 倍性能优势冲击 JavaScript 工具链，但 ESLint 的插件生态仍是护城河。

---

## 工具对比矩阵

| 维度 | ESLint 9 | Biome | Oxlint | Prettier | dprint |
|------|---------|-------|--------|----------|--------|
| **实现语言** | JavaScript | Rust | Rust | JavaScript | Rust |
| **Lint 规则** | 300+ + 插件生态 | 270+（内置） | 400+（内置） | ❌（仅格式化） | ❌（仅格式化） |
| **格式化** | ❌（需 Prettier） | ✅（Prettier 兼容） | ❌ | ✅ | ✅ |
| **TypeScript** | ✅（需 parser） | ✅（原生） | ✅ | ✅ | ✅ |
| **Vue/Svelte** | ✅（插件） | ❌ | ❌ | ✅ | 部分 |
| **自定义规则** | ✅（JS 插件） | ✅（GritQL v2） | ❌ | ❌ | ✅（WASM 插件） |
| **Cold Run (1K 文件)** | ~8s | ~200ms | ~100ms | ~28s | ~100ms |
| **配置复杂度** | 高（flat config） | 低（单文件 JSON） | 极低（零配置） | 低 | 低 |
| **ESLint 规则兼容** | 原生 | ~70%（迁移工具） | 规则名兼容 | — | — |

---

## 选型决策树

```
项目类型？
├── Vue / Svelte / Angular 模板 → ESLint（Biome/Oxlint 暂不支持）
├── React / Next.js / 纯 TS →
│   ├── 新项目，追求极简 → Biome（lint + format 一体）
│   ├── 大型仓库，追求极速 → Oxlint + Prettier / dprint
│   └── 现有 ESLint，插件依赖重 → 保持 ESLint，可选 Oxlint 加速
└── 多语言仓库（JS + Python + Rust）→ dprint（统一格式化）+ Ruff（Python）
```

---

## 2026 生态动态

### ESLint 9 Flat Config

ESLint v9 已全面迁移至 **Flat Config**（`eslint.config.js`），废弃 `.eslintrc.*`：

```javascript
// eslint.config.js
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  react.configs.flat.recommended,
  { rules: { '@typescript-eslint/no-explicit-any': 'error' } }
];
```

### Biome 2.0 预览

- **GritQL 插件系统**：允许社区编写自定义规则
- **类型推断**：无需 `tsc` 即可进行部分类型感知 lint
- **增量检查**：仅分析变更文件，CI 进一步提速

### Oxlint 的定位

Oxlint（VoidZero / Vite 团队）不试图替代 ESLint，而是**互补加速**：

```bash
# CI 策略：Oxlint 快速拦截 → ESLint 深度检查
oxlint .          # ~100ms，覆盖 90% 常见问题
eslint .          # ~8s，插件规则 + 自定义规则
```

---

## 性能基准

**Next.js 应用（~45,000 行）**：

| 配置 | 耗时 | 规则数 |
|------|------|--------|
| Biome lint | 280ms | ~200 |
| ESLint 基础 | 4.2s | ~100 |
| ESLint + TS + React + Jest | 12.8s | ~400 |
| Prettier format | 28s | — |
| Biome format + lint | 1.58s | ~200 |

> **实际影响**：100 人团队，日均 30 次提交，Biome 每年可节省约 **2,900 小时**（对比 Prettier + ESLint）。

---

## 扩展代码示例

### dprint 统一格式化配置（多语言仓库）

```json
// dprint.json
{
  "typescript": {
    "lineWidth": 100,
    "indentWidth": 2,
    "semiColons": "always",
    "quoteStyle": "single"
  },
  "json": {},
  "markdown": {},
  "dockerfile": {},
  "plugins": [
    "https://plugins.dprint.dev/typescript-0.93.0.wasm",
    "https://plugins.dprint.dev/json-0.19.3.wasm",
    "https://plugins.dprint.dev/markdown-0.17.8.wasm",
    "https://plugins.dprint.dev/dockerfile-0.3.2.wasm"
  ],
  "excludes": [
    "node_modules",
    "dist",
    "*.lock"
  ]
}
```

```bash
# 检查与格式化
dprint check
dprint fmt
```

### Oxlint CI 零配置拦截

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - name: Install Oxlint
        run: pnpm add -D oxlint
      - name: Fast lint (fail fast)
        run: pnpm oxlint . --deny-warnings
      - name: Deep lint (ESLint plugins)
        run: pnpm eslint . --max-warnings=0
```

### VS Code settings.json 集成示例

```json
// .vscode/settings.json
{
  "editor.defaultFormatter": "biomejs.biome",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports.biome": "explicit",
    "quickfix.biome": "explicit"
  },
  "[typescript]": {
    "editor.defaultFormatter": "biomejs.biome"
  },
  "eslint.enable": false,
  "prettier.enable": false
}
```

---

## 最佳实践

1. **新项目默认 Biome**：lint + format 一体，零配置，40x 性能提升
2. **遗留项目渐进迁移**：`npx @biomejs/biome migrate eslint --write` 自动转换 70% 规则
3. **CI 分层策略**：Oxlint 快速失败（pre-check）→ ESLint 深度检查（post-check）
4. **Pre-commit 钩子**：Biome 在 pre-commit 中无感知（<10ms 启动）
5. **类型检查分离**：lint/format 用 Rust 工具，`tsc --noEmit` 单独跑，不阻塞开发

---

## 参考资源

- [ESLint 9 Migration Guide](https://eslint.org/docs/latest/use/configure/migration-guide)
- [ESLint Flat Config Documentation](https://eslint.org/docs/latest/use/configure/configuration-files)
- [Biome Documentation](https://biomejs.dev/)
- [Biome Migrate from ESLint / Prettier](https://biomejs.dev/guides/migrate-eslint-prettier/)
- [Oxlint GitHub](https://github.com/oxc-project/oxc)
- [Oxlint Official Documentation](https://oxc.rs/docs/guide/usage/linter.html)
- [dprint Documentation](https://dprint.dev/)
- [dprint Plugin Registry](https://dprint.dev/plugins/)
- [Prettier Configuration Options](https://prettier.io/docs/en/options.html)
- [Prettier — Integrating with Linters](https://prettier.io/docs/en/integrating-with-linters.html)
- [Biome vs ESLint vs Oxlint (2026)](https://trybuildpilot.com/424-biome-vs-eslint-vs-oxlint-2026)
- [VoidZero: Introducing Oxlint](https://voidzero.dev/posts/introducing-oxlint)
- [Rust-Powered JavaScript Tooling Landscape](https://rust.godbolt.org/)

---

## 关联文档

- `30-knowledge-base/30.2-categories/13-ci-cd.md`
- `20-code-lab/20.11-rust-toolchain/developer-experience/`
- `40-ecosystem/comparison-matrices/build-tools-compare.md`

---

*最后更新: 2026-04-29*
