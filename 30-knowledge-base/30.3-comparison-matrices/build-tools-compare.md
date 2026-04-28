# 构建工具对比矩阵（2026）

> **定位**：`30-knowledge-base/30.3-comparison-matrices/`
> **更新**：2026-04

---

## 核心对比矩阵

| 维度 | Vite 8 | Rspack v2 | Rolldown 1.0 | Oxc 全链路 | esbuild |
|------|--------|-----------|--------------|-----------|---------|
| **Bundler** | Rollup-based | Webpack-compat | Rollup-compat | — | 自有 |
| **语言** | JS/TS | Rust | Rust | **Rust** | Go |
| **Dev Server** | ✅ 原生 HMR | ✅ | 通过 Vite | ❌ | ❌ |
| **HMR** | ✅ 极快 | ✅ 快 | ✅ 极快 | ❌ | ❌ |
| **Tree Shaking** | ✅ Rollup | ✅ 优化中 | ✅ Rollup | — | ✅ |
| **CSS 处理** | Lightning CSS | PostCSS | Lightning CSS | — | 内置 |
| **TypeScript** | esbuild 转译 | SWC | Oxc | **Oxc** | 内置 |
| **启动时间** | ~200ms | ~300ms | **~150ms** | — | ~50ms |
| **生产构建** | Rollup | Rspack | **Rolldown** | — | esbuild |
| **生态插件** | **丰富** | Webpack 兼容 | Vite 兼容 | 新兴 | 有限 |

---

## Rust 工具链全景

```
Rust 重写 JS 工具链（2026）
├── 编译器/转译器
│   ├── Oxc Parser + Transformer
│   └── SWC
├── Bundler
│   ├── Rspack（Webpack 兼容）
│   └── Rolldown（Rollup 兼容，Vite 8 默认）
├── Linter
│   ├── oxlint（ESLint 兼容）
│   └── Biome
├── 格式化
│   ├── Biome
│   └── dprint
└── CSS
    └── Lightning CSS
```

---

## 迁移路径

| 从 | 到 | 工作量 | 收益 |
|----|----|--------|------|
| Webpack 5 | Rspack | 低（配置兼容） | 构建速度 5-10x |
| Vite 4/5 | Vite 8 + Rolldown | 低 | 生产构建 2-3x |
| ESLint + Prettier | Biome | 中 | 统一工具，速度 10x |
| Babel | Oxc / SWC | 低-中 | 转译速度 20-50x |

---

*本矩阵反映 2026 年 Rust 重写 JS 工具链的成熟格局。*
