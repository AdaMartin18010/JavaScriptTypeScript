# Vite + React + TypeScript 配置

这是一个完整的 Vite + React + TypeScript 项目配置示例，包含生产级优化配置。

## 特性

- ⚡️ 极速 HMR 与 Fast Refresh
- 📦 智能代码分割 (vendor/router/state/ui/utils)
- 🔧 完整 TypeScript 支持
- 🎨 SCSS/Less 预处理器支持
- 📊 打包分析可视化
- 🛡️ 完整的 ESLint + Prettier 配置
- 🎯 路径别名支持
- 🌐 代理配置与 WebSocket 支持

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 构建并分析包大小
npm run build:analyze

# 预览生产构建
npm run preview
```

## 项目结构

```
.
├── src/
│   ├── components/       # 公共组件
│   ├── hooks/           # 自定义 Hooks
│   ├── pages/           # 页面组件
│   ├── store/           # 状态管理
│   ├── utils/           # 工具函数
│   ├── assets/          # 静态资源
│   ├── styles/          # 全局样式
│   ├── App.tsx          # 根组件
│   ├── main.tsx         # 入口文件
│   └── vite-env.d.ts    # 环境变量类型
├── index.html           # HTML 模板
├── vite.config.ts       # Vite 配置
├── tsconfig.json        # TypeScript 配置
└── package.json
```

## 代码分割策略

```typescript
manualChunks: {
  'react-vendor': ['react', 'react-dom'],
  'router': ['react-router-dom'],
  'state': ['zustand'],
  'ui': ['antd'],
  'utils': ['lodash-es', 'dayjs', 'axios'],
}
```

## 环境变量

```typescript
// .env
VITE_APP_TITLE=My React App
VITE_API_URL=http://localhost:8080
VITE_APP_VERSION=1.0.0
```

在代码中使用：

```typescript
console.log(import.meta.env.VITE_APP_TITLE);
```

## 路径别名

```typescript
import MyComponent from '@components/MyComponent';
import useAuth from '@hooks/useAuth';
import { store } from '@store/index';
```

## HMR 支持

React Fast Refresh 已默认启用，修改组件代码时会保持组件状态。

## 代理配置

```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
      ws: true,  // WebSocket 支持
    },
  },
}
```

## 性能优化

- 依赖预构建缓存
- 代码分割与懒加载
- 静态资源优化
- Tree Shaking
- Gzip/Brotli 压缩分析
