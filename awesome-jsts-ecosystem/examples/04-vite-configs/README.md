# Vite 配置示例

本目录包含 4 个不同场景的 Vite 配置示例，涵盖从基础到高级的用法。

## 目录结构

```
04-vite-configs/
├── basic-ts/           # 基础 TypeScript 配置
├── react-ts/           # React + TypeScript 配置
├── library-mode/       # 库模式配置
├── monorepo/           # Monorepo 配置
└── README.md           # 本文件
```

## 1. basic-ts/ - 基础配置

基础 Vite + TypeScript 项目配置，适合简单的 Web 应用。

**主要特性：**
- 路径别名 (@/ @utils/ @types/)
- 开发服务器代理配置
- CSS Modules 支持
- 代码分割配置
- Terser 压缩

**快速开始：**
```bash
cd basic-ts
npm install
npm run dev
```

## 2. react-ts/ - React 配置

完整的 React + TypeScript 配置，包含生产级优化。

**主要特性：**
- @vitejs/plugin-react 插件
- React Fast Refresh
- SCSS/Less 预处理器
- 智能代码分割 (vendor/router/state/ui/utils)
- 打包分析 (rollup-plugin-visualizer)
- 多环境变量支持

**快速开始：**
```bash
cd react-ts
npm install
npm run dev
npm run build:analyze  # 打包分析
```

## 3. library-mode/ - 库模式

使用 Vite 构建和发布 TypeScript 库的配置。

**主要特性：**
- ES/CJS/UMD 多格式输出
- 类型声明生成 (vite-plugin-dts)
- 外部依赖配置
- Tree-shaking 支持
- Vitest 测试配置

**快速开始：**
```bash
cd library-mode
npm install
npm run build
npm run test
```

## 4. monorepo/ - Monorepo 配置

使用 vite-plugin-dts 的 Monorepo 项目配置，支持多个子包。

**主要特性：**
- Workspace 工作区配置
- 多入口库模式构建
- 内部包路径别名 (@myorg/*)
- 统一的类型声明输出
- Changesets 版本管理

**包结构：**
```
packages/
├── core/      # 核心库 (类型、配置、Context)
├── utils/     # 工具函数库
├── hooks/     # React Hooks
└── ui/        # UI 组件库
```

**快速开始：**
```bash
cd monorepo
npm install
npm run build      # 构建所有包
npm run test       # 运行测试
npm run changeset  # 创建变更集
```

## 配置对比

| 特性 | basic-ts | react-ts | library-mode | monorepo |
|------|----------|----------|--------------|----------|
| TypeScript | ✅ | ✅ | ✅ | ✅ |
| React | ❌ | ✅ | ❌ | ✅ |
| 路径别名 | ✅ | ✅ | ✅ | ✅ |
| CSS Modules | ✅ | ✅ | ✅ | ✅ |
| 代码分割 | ✅ | ✅ | ❌ | ❌ |
| 库模式 | ❌ | ❌ | ✅ | ✅ |
| 类型生成 | ❌ | ❌ | ✅ | ✅ |
| 打包分析 | ❌ | ✅ | ✅ | ❌ |
| 多包管理 | ❌ | ❌ | ❌ | ✅ |

## 参考链接

- [Vite 官方文档](https://vitejs.dev/)
- [vite-plugin-dts](https://github.com/qmhc/vite-plugin-dts)
- [Rollup 配置文档](https://rollupjs.org/)
