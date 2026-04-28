# Vite + TypeScript 基础配置

这是一个 Vite + TypeScript 的基础项目示例，展示了完整的配置选项。

## 特性

- ⚡️ 极速的 HMR (热模块替换)
- 📦 基于 Rollup 的代码分割和优化
- 🔧 完整的 TypeScript 支持
- 🛠️ 路径别名配置 (@/ @utils/ @types/)
- 🎨 CSS Modules 支持
- 📱 开发服务器代理配置
- 🗜️ Terser 代码压缩

## 项目结构

```
.
├── src/
│   └── index.ts          # 入口文件
├── vite.config.ts        # Vite 配置
├── tsconfig.json         # TypeScript 配置
├── tsconfig.node.json    # Node 环境配置
└── package.json
```

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 配置说明

### 路径别名

```typescript
// vite.config.ts
resolve: {
  alias: {
    '@': resolve(__dirname, './src'),
    '@utils': resolve(__dirname, './src/utils'),
  },
}
```

### 代理配置

```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
    },
  },
}
```

### 代码分割

```typescript
// vite.config.ts
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['lodash-es'],
      },
    },
  },
}
```

## 环境变量

Vite 使用 `.env` 文件管理环境变量：

```bash
# .env
VITE_APP_TITLE=My App

# .env.local (本地覆盖，不提交到 Git)
VITE_API_URL=http://localhost:3000

# .env.production
VITE_API_URL=https://api.example.com
```

在代码中使用：

```typescript
console.log(import.meta.env.VITE_APP_TITLE);
```

> ⚠️ 注意：只有以 `VITE_` 开头的变量才会暴露给客户端代码。
