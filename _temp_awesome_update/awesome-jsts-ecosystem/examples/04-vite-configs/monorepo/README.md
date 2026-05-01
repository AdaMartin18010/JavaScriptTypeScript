# Monorepo Vite 配置

使用 `vite-plugin-dts` 的 Monorepo 项目配置示例，适用于包含多个子包的大型项目。

## 项目结构

```
.
├── packages/
│   ├── core/                 # 核心库
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   └── types.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── utils/                # 工具库
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   └── string.ts
│   │   └── package.json
│   ├── ui/                   # UI 组件库
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   └── Button/
│   │   └── package.json
│   └── hooks/                # React Hooks
│       ├── src/
│       │   ├── index.ts
│       │   └── useToggle.ts
│       └── package.json
├── src/                      # 示例应用
│   └── main.tsx
├── dist/                     # 构建输出
│   ├── core/
│   │   ├── index.mjs
│   │   ├── index.js
│   │   └── style.css
│   ├── utils/
│   │   └── index.mjs
│   ├── types/                # 类型声明
│   │   └── index.d.ts
│   └── ...
├── vite.config.ts            # Vite 配置
├── package.json              # Workspace 配置
└── tsconfig.json             # TypeScript 配置
```

## 特性

- 🏗️ Monorepo Workspace 支持
- 📦 多入口库模式构建
- 🔧 vite-plugin-dts 类型生成
- 🎯 内部包路径别名 (@myorg/*)
- 📝 统一的类型声明输出
- 🧪 Vitest 测试覆盖
- 📊 Changesets 版本管理
- 🔄 模块热替换 (HMR)

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建所有包
npm run build

# 仅构建类型
npm run build:types

# 运行测试
npm run test

# 运行测试 (UI)
npm run test:ui

# 代码覆盖率
npm run test:coverage

# 类型检查
npm run typecheck
npm run typecheck:packages
```

## 包引用方式

### 开发时引用

```typescript
// 引用内部包
import { useToggle } from '@myorg/hooks';
import { Button } from '@myorg/ui';
import { formatDate } from '@myorg/utils';
import type { Config } from '@myorg/core';
```

### 发布后引用

```bash
npm install @myorg/core @myorg/utils @myorg/ui
```

```typescript
import { Button } from '@myorg/ui';
```

## vite-plugin-dts 配置要点

```typescript
dts({
  // 类型输出目录
  outDir: 'dist/types',
  
  // 合并类型声明
  rollupTypes: true,
  
  // 包含的文件
  include: [
    'packages/*/src/**/*',
    'src/**/*',
  ],
  
  // 多入口支持
  entryRoot: 'packages',
  
  // 插入类型入口
  insertTypesEntry: true,
  
  // 路径别名排除
  aliasesExclude: [/^@myorg\/.*$/],
  
  // 类型生成前处理
  beforeWriteFile: (filePath, content) => {
    console.log(`Generating types: ${filePath}`);
    return { filePath, content };
  },
})
```

## 多入口构建配置

```typescript
build: {
  lib: {
    entry: {
      'core': resolve(pkgRoot, 'core/src/index.ts'),
      'utils': resolve(pkgRoot, 'utils/src/index.ts'),
      'ui': resolve(pkgRoot, 'ui/src/index.ts'),
      'hooks': resolve(pkgRoot, 'hooks/src/index.ts'),
    },
    formats: ['es', 'cjs'],
    fileName: (format, entryName) => {
      return `${entryName}/index.${format === 'es' ? 'mjs' : 'js'}`;
    },
  },
}
```

## 子包 package.json 示例

```json
{
  "name": "@myorg/core",
  "version": "1.0.0",
  "main": "../../dist/core/index.js",
  "module": "../../dist/core/index.mjs",
  "types": "../../dist/types/core/src/index.d.ts",
  "exports": {
    ".": {
      "import": "../../dist/core/index.mjs",
      "require": "../../dist/core/index.js",
      "types": "../../dist/types/core/src/index.d.ts"
    }
  },
  "peerDependencies": {
    "react": ">=18.0.0"
  }
}
```

## 版本管理 (Changesets)

```bash
# 创建变更集
npm run changeset

# 版本更新
npm run version-packages

# 发布
npm run release
```

## 最佳实践

1. **统一构建**: 使用根目录的 vite.config.ts 统一构建所有包
2. **类型共享**: 通过 vite-plugin-dts 生成统一的类型声明
3. **路径映射**: 配置 tsconfig.json paths 支持开发时内部引用
4. **外部依赖**: 将 react 等公共依赖设为 external 和 peerDependencies
5. **测试覆盖**: 统一配置 Vitest 覆盖所有包的测试
6. **CI/CD**: 使用 GitHub Actions 自动化构建和发布流程
