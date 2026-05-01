# Vite Library Mode - 库模式配置

这是一个使用 Vite 构建 TypeScript 库的完整示例，包含类型声明生成和多种输出格式。

## 特性

- 📦 支持 ES/CJS/UMD 多种格式
- 🔧 自动生成类型声明 (vite-plugin-dts)
- 📊 打包分析可视化
- 🎯 Tree-shaking 友好
- 📝 完整的类型导出
- 🧪 Vitest 测试支持
- 🎨 CSS 支持

## 项目结构

```
.
├── src/
│   ├── index.ts          # 入口文件
│   ├── main.ts           # 主类
│   ├── types.ts          # 类型定义
│   ├── utils.ts          # 工具函数
│   ├── event-bus.ts      # 事件总线
│   ├── validator.ts      # 验证器
│   └── constants.ts      # 常量
├── dist/                 # 构建输出
│   ├── my-library.es.js  # ES 模块
│   ├── my-library.cjs.js # CommonJS
│   ├── my-library.umd.js # UMD 格式
│   └── types/            # 类型声明
├── vite.config.ts
├── package.json
└── tsconfig.json
```

## 快速开始

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建库
npm run build

# 构建并分析
npm run build:analyze

# 运行测试
npm run test

# 类型检查
npm run typecheck
```

## 使用方法

### ES Module

```typescript
import MyLibrary, { formatDate, EventBus } from 'my-library';

const lib = new MyLibrary({
  baseURL: 'https://api.example.com',
  timeout: 5000,
});

console.log(lib.getVersion());
```

### CommonJS

```javascript
const { MyLibrary, formatDate } = require('my-library');

const lib = new MyLibrary();
```

### UMD (浏览器)

```html
<script src="https://unpkg.com/my-library/dist/my-library.umd.js"></script>
<script>
  const lib = new MyLibrary.MyLibrary();
  console.log(lib.version);
</script>
```

## package.json 配置

```json
{
  "type": "module",
  "main": "./dist/my-library.cjs.js",
  "module": "./dist/my-library.es.js",
  "types": "./dist/types/index.d.ts",
  "exports": {
    ".": {
      "import": {
        "types": "./dist/types/index.d.ts",
        "default": "./dist/my-library.es.js"
      },
      "require": {
        "types": "./dist/types/index.d.ts",
        "default": "./dist/my-library.cjs.js"
      }
    }
  },
  "files": ["dist"]
}
```

## vite.config.ts 关键配置

```typescript
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'MyLibrary',
      fileName: (format) => `my-library.${format}.js`,
      formats: ['es', 'cjs', 'umd'],
    },
    rollupOptions: {
      external: ['lodash-es'], // 外部依赖
      output: {
        globals: {
          'lodash-es': '_',
        },
      },
    },
  },
  plugins: [
    dts({
      outDir: 'dist/types',
      insertTypesEntry: true,
      rollupTypes: true,
    }),
  ],
});
```

## 发布到 npm

```bash
# 登录 npm
npm login

# 构建
npm run build

# 发布
npm publish

# 发布测试版本
npm publish --tag beta
```

## 最佳实践

1. **外部依赖**: 大型依赖设为 external，避免重复打包
2. **类型导出**: 确保所有公共 API 都有类型定义
3. **Tree-shaking**: 使用 ES Module 导出，支持按需引入
4. **版本管理**: 遵循 SemVer 规范
5. **CHANGELOG**: 维护更新日志
