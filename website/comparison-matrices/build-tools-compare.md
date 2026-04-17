# 构建工具对比矩阵

> 最后更新：2026年4月

## 核心对比表

| 特性 | Vite | Webpack | Rollup |
|------|------|---------|--------|
| **GitHub Stars** | 68k | 64k | 25k |
| **首次启动** | ⚡ 极快 (ms级) | 🐢 慢 (秒级) | ⚡ 快 |
| **热更新 (HMR)** | ⚡ 极快 | 🐢 慢 | 需插件 |
| **生产构建** | 快 | 中 | 快 |
| **配置复杂度** | ⭐ 低 | ⭐⭐⭐ 高 | ⭐⭐ 中 |
| **TypeScript 支持** | 🟢 原生 | 🔵 需配置 | 🔵 需插件 |
| **生态插件** | 丰富 | 最丰富 | 丰富 |
| **代码分割** | ✅ | ✅ | ✅ |
| **Tree Shaking** | ✅ | ✅ | ✅ |
| **SSR 支持** | ✅ 原生 | ✅ | ✅ |
| **库打包** | ✅ | ✅ | ⭐ 最擅长 |

## 详细分析

### Vite

```bash
npm create vite@latest my-app
```

- **定位**: 下一代前端开发与构建工具
- **核心原理**: 开发用 ESM，生产用 Rollup
- **优势**:
  - 开发服务器启动极快
  - 热更新几乎无感知
  - 开箱即用，配置简单
  - 生态快速成长
- **劣势**: 某些 Webpack 插件无直接替代
- **适用场景**: 现代 Web 应用、React/Vue/Svelte 项目

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { port: 3000 },
  build: { outDir: 'dist' }
})
```

### Webpack

```bash
npm install webpack webpack-cli webpack-dev-server
```

- **定位**: 最成熟的模块打包器
- **核心原理**: 依赖图分析 + 代码转换
- **优势**:
  - 生态最成熟，插件 Loader 最丰富
  - Loader 体系强大
  - 微前端支持成熟
  - 企业级方案完善
- **劣势**: 配置复杂、构建慢、启动慢
- **适用场景**: 大型企业项目、遗留项目维护

```javascript
// webpack.config.js
module.exports = {
  entry: './src/index.js',
  output: { filename: 'bundle.js' },
  module: {
    rules: [
      { test: /\.js$/, use: 'babel-loader' },
      { test: /\.css$/, use: ['style-loader', 'css-loader'] }
    ]
  },
  plugins: [new HtmlWebpackPlugin()]
}
```

### Rollup

```bash
npm install rollup
```

- **定位**: JavaScript 模块打包器，专注于 ES Modules
- **核心原理**: Tree-shaking 友好，输出干净的 ES 模块
- **优势**:
  - 输出代码最干净
  - Tree Shaking 效果最好
  - 适合库开发
  - 配置相对简单
- **劣势**: 应用开发支持不如 Vite/Webpack
- **适用场景**: JavaScript/TypeScript 库开发

```javascript
// rollup.config.js
export default {
  input: 'src/index.js',
  output: [
    { file: 'dist/bundle.cjs', format: 'cjs' },
    { file: 'dist/bundle.mjs', format: 'es' }
  ],
  plugins: [resolve(), commonjs(), typescript()]
}
```

## 性能对比

| 指标 | Vite | Webpack | Rollup |
|------|------|---------|--------|
| **冷启动 (1000模块)** | ~200ms | ~5s | ~2s |
| **热更新时间** | <50ms | 1-3s | ~100ms |
| **生产构建** | 快 | 中 | 快 |
| **内存占用** | 低 | 高 | 低 |
| **产物大小** | 小 | 中 | 最小 |

## 功能对比

| 功能 | Vite | Webpack | Rollup |
|------|------|---------|--------|
| **开发服务器** | ✅ 内置 | ✅ webpack-dev-server | ❌ 需配合其他工具 |
| **CSS 处理** | ✅ 内置 | ✅ css-loader | ✅ 插件 |
| **静态资源** | ✅ 内置 | ✅ file-loader/url-loader | ✅ 插件 |
| **CSS 预处理器** | ✅ 自动检测 | ✅ 需配置 | ✅ 插件 |
| **模块联邦** | ⚠️ 实验性 | ✅ ModuleFederation | ❌ |
| **WASM** | ✅ | ✅ | ✅ |
| **Web Workers** | ✅ | ✅ | ✅ |
| **PWA** | ✅ 插件 | ✅ workbox-webpack-plugin | ✅ 插件 |

## 选型建议

| 场景 | 推荐 |
|------|------|
| 新项目启动 | Vite |
| 大型遗留项目 | Webpack |
| 构建 JavaScript 库 | Rollup |
| 需要微前端 | Webpack |
| 追求开发体验 | Vite |
| 需要极致产物优化 | Rollup |
| 企业级应用 | Webpack 或 Vite |

## 迁移建议

### Webpack → Vite

- 使用 `vite-plugin-commonjs` 处理 CJS 依赖
- 注意环境变量替换方式变化
- CSS 相关配置需调整

### Webpack → Rollup

- 适合库项目迁移
- 需要重新配置开发流程
- 测试 WIP (Work In Progress)
