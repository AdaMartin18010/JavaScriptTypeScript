# Rust 统一工具链代码实验室

> **定位**：`20-code-lab/20.11-rust-toolchain/`

---

## 一、Rust 重写 JS 工具链全景

```
Rust Unified Toolchain (2026)
├── Parser + Transformer
│   └── Oxc
├── Bundler
│   ├── Rspack (Webpack 兼容)
│   └── Rolldown (Rollup 兼容, Vite 8 默认)
├── Linter
│   ├── oxlint (ESLint 兼容)
│   └── Biome
├── Formatter
│   ├── Biome
│   └── dprint
└── CSS
    └── Lightning CSS
```

---

## 二、迁移实践

### 2.1 ESLint + Prettier → Biome

```json
// biome.json
{
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true
    }
  }
}
```

```bash
# 一键迁移
npx @biomejs/biome migrate eslint --write
npx @biomejs/biome migrate prettier --write
```

### 2.2 Webpack → Rspack

```javascript
// rspack.config.js
module.exports = {
  entry: './src/index.js',
  // 与 Webpack 配置高度兼容
  module: {
    rules: [
      { test: /\.ts$/, use: 'builtin:swc-loader' }
    ]
  }
};
```

---

## 三、性能对比

| 操作 | JS 工具 | Rust 工具 | 加速倍数 |
|------|---------|----------|---------|
| 转译 TS | tsc | Oxc | **20-50x** |
| 构建 | Webpack | Rspack | **5-10x** |
| Lint | ESLint | oxlint | **10-100x** |
| 格式化 | Prettier | Biome | **10x** |

---

## 四、风险评估

| 风险 | 缓解策略 |
|------|---------|
| 规则不兼容 | 逐步迁移，保留 ESLint 用于复杂规则 |
| 插件生态 | Rspack 兼容 Webpack 插件；Vite 生态丰富 |
| 团队学习成本 | 配置兼容，降低切换门槛 |

---

*本模块为 L2 代码实验室的 Rust 工具链迁移专项。*
