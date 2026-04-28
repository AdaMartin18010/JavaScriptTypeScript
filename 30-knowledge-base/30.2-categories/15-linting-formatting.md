---
last-updated: 2026-04-27
review-cycle: 6 months
next-review: 2026-10-27
status: current
---
> **⚠️ 维度边界说明**
>
> 本文档属于 **技术基础设施（Technical Infrastructure）** 维度，聚焦代码质量工具链（Lint、Format、类型检查）。
>
> - ✅ **属于本文档范围**：Linter、Formatter、类型检查器、Git 钩子、代码质量平台。
> - ❌ **不属于本文档范围**：具体项目的代码风格约定、业务代码审查清单、框架编码规范。
> - 🔗 **相关索引**：`docs/infrastructure-index.md`

# Linting 与代码格式化生态 (Linting & Formatting)

> **趋势**: Rust 工具链（Biome、oxlint、dprint）正在挑战 ESLint + Prettier 的传统地位，追求极致性能；同时 Git 钩子工具正从 husky 向 lighter 方案迁移

---

## 📊 生态概览

| 类别 | 工具数量 | 推荐选择 | 学习优先级 |
|------|----------|----------|------------|
| Linter | 4 | **ESLint** / **oxlint** (Rust) | ⭐⭐⭐⭐⭐ |
| 格式化 | 3 | **Prettier** / **dprint** (Rust) | ⭐⭐⭐⭐⭐ |
| 一体化工具 | 2 | **Biome** (Rust) | ⭐⭐⭐⭐ |
| 类型检查 | 3 | **TypeScript** + **tsx** | ⭐⭐⭐⭐⭐ |
| Git 钩子 | 3 | **lint-staged** + **simple-git-hooks** | ⭐⭐⭐⭐ |
| 代码质量平台 | 3 | **SonarQube** / **Code Climate** | ⭐⭐⭐ |

---

## 1️⃣ Linter (代码检查)

### 🏆 ESLint ⭐25k

| 属性 | 详情 |
|------|------|
| **Stars** | 25k+ (GitHub) |
| **TS支持** | ✅ 通过 @typescript-eslint |
| **特点** | 可插拔规则系统，生态最完善，JS/TS 标准 Linter |
| **官网** | <https://eslint.org> |
| **GitHub** | <https://github.com/eslint/eslint> |
| **配置难度** | 🟡 中等 |

**核心生态包:**

- `@typescript-eslint/parser` - TypeScript 解析器
- `@typescript-eslint/eslint-plugin` - TypeScript 规则插件

```typescript
// eslint.config.mjs (Flat Config)
import js from '@eslint/js'
import tsParser from '@typescript-eslint/parser'
import tsPlugin from '@typescript-eslint/eslint-plugin'

export default [
  js.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json'
      }
    },
    plugins: {
      '@typescript-eslint': tsPlugin
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/explicit-function-return-type': 'warn'
    }
  }
]
```

**适用场景:**

- 所有 JavaScript/TypeScript 项目的基础 Linter
- 需要自定义规则或深度配置的团队
- 已有 ESLint 生态投入的大型项目

---

### oxlint ⭐11k

| 属性 | 详情 |
|------|------|
| **Stars** | 11k+ (GitHub) |
| **TS支持** | ✅ 原生支持 |
| **特点** | Rust 编写，比 ESLint 快 50-100 倍，零配置 |
| **GitHub** | <https://github.com/oxc-project/oxc> |
| **配置难度** | 🟢 简单 |

```bash
# 安装
npm install -D oxlint

# 使用 - 无需配置即可运行
npx oxlint .
npx oxlint --import-plugin --jest-plugin .
```

**特点:**

- 极速性能：利用 Rust 和并行处理
- 内置常用规则：eslint:recommended + TypeScript + React
- 增量检查：只检查变更文件
- VS Code 插件支持

**适用场景:**

- 追求极致 Lint 速度的大型项目
- CI/CD 中需要快速反馈的场景
- 作为 ESLint 的替代或补充

---

### Deno Lint

| 属性 | 详情 |
|------|------|
| **TS支持** | ✅ 原生支持 |
| **特点** | Deno 内置 Linter，基于 Rust |
| **文档** | <https://docs.deno.com/runtime/manual/tools/linter> |
| **配置难度** | 🟢 简单 |

```bash
# Deno 内置，无需安装
deno lint
deno lint --watch
```

**适用场景:**

- Deno 项目
- 需要零配置 Linter 的场景

---

## 2️⃣ 格式化工具 (Formatters)

### 🏆 Prettier ⭐49k

| 属性 | 详情 |
|------|------|
| **Stars** | 49k+ (GitHub) |
| **TS支持** | ✅ 原生支持 |
| **特点** | 代码格式化标准，强制一致风格，生态最完善 |
| **官网** | <https://prettier.io> |
| **GitHub** | <https://github.com/prettier/prettier> |
| **配置难度** | 🟢 简单 |

**支持语言:**

- JavaScript · TypeScript · Flow · JSX
- JSON · CSS · SCSS · Less
- HTML · Vue · Angular
- GraphQL · Markdown · YAML

```javascript
// prettier.config.mjs
export default {
  semi: false,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'es5',
  printWidth: 80,
  plugins: ['prettier-plugin-tailwindcss']
}
```

**与 ESLint 集成:**

```javascript
// 推荐：使用 eslint-config-prettier 关闭冲突规则
// eslint.config.mjs
import prettierConfig from 'eslint-config-prettier'

export default [
  // ... 其他配置
  prettierConfig // 放在最后，覆盖冲突规则
]
```

**适用场景:**

- 团队代码风格统一
- 所有前端项目的标准格式化工具
- CI/CD 中自动格式化检查

---

### dprint ⭐7k

| 属性 | 详情 |
|------|------|
| **Stars** | 7k+ (GitHub) |
| **TS支持** | ✅ 原生支持 |
| **特点** | Rust 编写，可插拔架构，比 Prettier 快 10-30 倍 |
| **官网** | <https://dprint.dev> |
| **GitHub** | <https://github.com/dprint/dprint> |
| **配置难度** | 🟢 简单 |

```json
// dprint.json
{
  "typescript": {
    "semiColons": "asi",
    "singleQuote": true,
    "indentWidth": 2
  },
  "json": {},
  "markdown": {},
  "includes": ["**/*.{ts,tsx,js,jsx,json,md}"],
  "excludes": ["**/node_modules", "**/dist"],
  "plugins": [
    "https://plugins.dprint.dev/typescript-0.88.0.wasm",
    "https://plugins.dprint.dev/json-0.17.0.wasm",
    "https://plugins.dprint.dev/markdown-0.15.0.wasm"
  ]
}
```

**特点:**

- WASM 插件系统，支持多种语言
- 增量格式化，只处理变更文件
- 支持作为库集成到其他工具

**适用场景:**

- 对格式化性能有要求的项目
- Monorepo 需要统一格式化配置
- 需要高度可定制的格式化规则

---

## 3️⃣ 一体化工具 (All-in-One)

### 🏆 Biome ⭐15k

| 属性 | 详情 |
|------|------|
| **Stars** | 15k+ (GitHub) |
| **TS支持** | ✅ 原生支持 |
| **特点** | Rust 编写，Lint + Format + Import 排序，ESLint/Prettier 替代品 |
| **官网** | <https://biomejs.dev> |
| **GitHub** | <https://github.com/biomejs/biome> |
| **配置难度** | 🟢 简单 |

```json
// biome.json
{
  "$schema": "https://biomejs.dev/schemas/1.5.3/schema.json",
  "organizeImports": {
    "enabled": true
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "suspicious": {
        "noConsoleLog": "warn"
      }
    }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 80
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "semicolons": "asNeeded"
    }
  }
}
```

**迁移支持:**

```bash
# 从 ESLint 迁移
npx @biomejs/biome migrate eslint --write

# 从 Prettier 迁移
npx @biomejs/biome migrate prettier --write
```

**特点:**

- 一个工具替代 ESLint + Prettier
- 极速性能：比 ESLint 快 15 倍，比 Prettier 快 20 倍
- 内置 Import 排序
- 与 Rome 兼容的配置

**适用场景:**

- 新项目首选，简化工具链
- 追求构建速度的团队
- 减少配置复杂度的项目

---

### Rome (已归档)

| 属性 | 详情 |
|------|------|
| **状态** | 🔴 已归档 (2023) |
| **继任者** | **Biome** |
| **说明** | Rome 项目由核心团队分叉为 Biome，继续活跃开发 |

**迁移建议:**

```bash
# 从 Rome 迁移到 Biome
# Biome 完全兼容 Rome 配置，只需重命名配置文件
mv rome.json biome.json
```

---

## 4️⃣ 类型检查与编译

### TypeScript Compiler (tsc) ⭐101k

| 属性 | 详情 |
|------|------|
| **Stars** | 101k+ (GitHub) |
| **TS支持** | ✅ 官方实现 |
| **特点** | 类型检查 + 代码生成，TS 生态核心 |
| **官网** | <https://www.typescriptlang.org> |
| **GitHub** | <https://github.com/microsoft/TypeScript> |
| **配置难度** | 🟡 中等 |

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "isolatedModules": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**CI 类型检查:**

```json
// package.json
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "typecheck:watch": "tsc --noEmit --watch"
  }
}
```

**适用场景:**

- 所有 TypeScript 项目必备
- CI/CD 中的类型检查
- 库发布的类型声明生成

---

### tsx ⭐9k

| 属性 | 详情 |
|------|------|
| **Stars** | 9k+ (GitHub) |
| **TS支持** | ✅ 直接执行 |
| **特点** | 基于 esbuild，极速 TS 执行，Watch 模式 |
| **官网** | <https://tsx.is> |
| **GitHub** | <https://github.com/privatenumber/tsx> |
| **配置难度** | 🟢 简单 |

```bash
# 执行 TS 文件
npx tsx file.ts

# Watch 模式
npx tsx watch file.ts

# 作为 Node 替代
npx tsx server.ts
```

**适用场景:**

- Node.js 脚本开发
- TypeScript CLI 工具
- 替代 ts-node 获得更好性能

---

## 5️⃣ Git 钩子工具

### husky ⭐31k

| 属性 | 详情 |
|------|------|
| **Stars** | 31k+ (GitHub) |
| **TS支持** | ✅ 支持 |
| **特点** | 最流行的 Git hooks 工具，配置简单 |
| **官网** | <https://typicode.github.io/husky> |
| **GitHub** | <https://github.com/typicode/husky> |
| **配置难度** | 🟢 简单 |

```bash
# 初始化
npx husky init

# 添加钩子
npx husky add .husky/pre-commit "npm test"
```

```javascript
// .husky/pre-commit
npm run lint
npm run typecheck
```

**v9 新特性 (2024):**

- 更简洁的配置
- 更好的 Windows 支持
- 自动安装钩子

**适用场景:**

- 团队代码质量门禁
- 自动化格式化/lint 检查
- 提交前测试运行

---

### lint-staged ⭐13k

| 属性 | 详情 |
|------|------|
| **Stars** | 13k+ (GitHub) |
| **TS支持** | ✅ 支持 |
| **特点** | 只对暂存区文件运行 linter，提升效率 |
| **GitHub** | <https://github.com/lint-staged/lint-staged> |
| **配置难度** | 🟢 简单 |

```javascript
// lint-staged.config.mjs
export default {
  '*.{js,jsx,ts,tsx}': ['eslint --fix', 'prettier --write'],
  '*.{json,md,yaml}': ['prettier --write'],
  '*.{css,scss}': ['stylelint --fix', 'prettier --write']
}
```

```bash
# 与 husky 集成
# .husky/pre-commit
npx lint-staged
```

**特点:**

- 只对 git staged 文件运行命令
- 并行处理多个文件
- 自动修复并重新暂存

**适用场景:**

- 大型项目，避免全量 lint
- 与 husky 配合实现提交前检查
- 提升 CI 和本地开发效率

---

### simple-git-hooks ⭐2k

| 属性 | 详情 |
|------|------|
| **Stars** | 2k+ (GitHub) |
| **TS支持** | ✅ 支持 |
| **特点** | 轻量级 Git 钩子工具，零依赖，体积小 |
| **GitHub** | <https://github.com/toplenboren/simple-git-hooks> |
| **配置难度** | 🟢 简单 |

```json
// package.json
{
  "simple-git-hooks": {
    "pre-commit": "npx lint-staged",
    "commit-msg": "npx commitlint --edit $1"
  }
}
```

```bash
# 激活钩子
npx simple-git-hooks
```

**对比 husky:**

| 特性 | simple-git-hooks | husky |
|------|------------------|-------|
| 体积 | 更小 (~3KB) | ~50KB |
| 依赖 | 零依赖 | 有依赖 |
| 配置 | package.json 内 | 独立配置文件 |
| 功能 | 基础钩子 | 更丰富 |

**适用场景:**

- 追求极简工具链的项目
- 对安装包大小敏感的场景
- 基础 Git 钩子需求

---

## 6️⃣ 代码质量平台

### SonarQube

| 属性 | 详情 |
|------|------|
| **类型** | 开源 + 商业 |
| **特点** | 企业级代码质量平台，多维度分析 |
| **官网** | <https://www.sonarsource.com/products/sonarqube> |
| **配置难度** | 🟡 中等 |

**分析维度:**

- 代码质量 (Code Smells)
- 安全漏洞 (Security Vulnerabilities)
- 技术债务 (Technical Debt)
- 测试覆盖率 (Coverage)
- 重复代码 (Duplications)

```yaml
# .github/workflows/sonar.yml
name: SonarQube
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  sonar:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: SonarSource/sonarqube-scan-action@master
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
          SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}
```

**适用场景:**

- 企业级代码质量管理
- 安全合规要求
- 大型团队代码审查

---

### Code Climate

| 属性 | 详情 |
|------|------|
| **类型** | SaaS |
| **特点** | 自动化代码审查，技术债务追踪 |
| **官网** | <https://codeclimate.com> |
| **配置难度** | 🟢 简单 |

**功能:**

- 自动 PR 代码审查
- 测试覆盖率跟踪
- 维护性评级
- 与 GitHub/GitLab/Bitbucket 集成

**适用场景:**

- 开源项目免费使用
- 云原生代码质量追踪
- 快速集成，无需自建服务器

---

### DeepScan

| 属性 | 详情 |
|------|------|
| **类型** | SaaS |
| **特点** | 专注于 JavaScript/TypeScript 的静态分析 |
| **官网** | <https://deepscan.io> |
| **配置难度** | 🟢 简单 |

**特点:**

- 深入理解 JS/TS 语义
- 减少误报
- 实时分析
- 与 IDE 集成

**适用场景:**

- JavaScript 项目专项分析
- 需要深入语义分析的场景
- 与 ESLint 互补使用

---

## 📋 技术选型建议

### 新项目推荐组合 (2025)

| 场景 | 推荐工具 | 备选方案 |
|------|----------|----------|
| **快速启动** | **Biome** (Lint + Format) | ESLint + Prettier |
| **极致性能** | **oxlint** + **dprint** | Biome |
| **传统稳定** | **ESLint** + **Prettier** | - |
| **Git 钩子** | **lint-staged** + **simple-git-hooks** | husky + lint-staged |
| **类型检查** | **tsc --noEmit** | - |
| **代码质量平台** | **SonarQube** | Code Climate |

### 配置示例

#### 方案 A: 现代极速 (推荐新项目)

```bash
npm install -D @biomejs/biome simple-git-hooks lint-staged
```

```json
// biome.json
{
  "$schema": "https://biomejs.dev/schemas/1.5.3/schema.json",
  "organizeImports": { "enabled": true },
  "linter": { "enabled": true, "rules": { "recommended": true } },
  "formatter": { "enabled": true }
}
```

```json
// package.json
{
  "scripts": {
    "lint": "biome lint .",
    "format": "biome format . --write",
    "check": "biome check . --write",
    "typecheck": "tsc --noEmit"
  },
  "simple-git-hooks": {
    "pre-commit": "npx lint-staged"
  },
  "lint-staged": {
    "*.{js,ts,jsx,tsx}": ["biome check --write --no-errors-on-unmatched"]
  }
}
```

#### 方案 B: 传统稳定

```bash
npm install -D eslint prettier @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-config-prettier husky lint-staged
```

```javascript
// eslint.config.mjs
import js from '@eslint/js'
import tsParser from '@typescript-eslint/parser'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import prettierConfig from 'eslint-config-prettier'

export default [
  js.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: { parser: tsParser },
    plugins: { '@typescript-eslint': tsPlugin },
    rules: tsPlugin.configs.recommended.rules
  },
  prettierConfig
]
```

```javascript
// prettier.config.mjs
export default {
  semi: false,
  singleQuote: true,
  tabWidth: 2
}
```

---

## 📈 趋势总结

| 趋势 | 说明 |
|------|------|
| **Rust 工具链崛起** | Biome、oxlint、dprint 用 Rust 重写，带来数量级性能提升 |
| **一体化简化** | 从 ESLint + Prettier 两工具向 Biome 单工具迁移 |
| **Git 钩子轻量** | 从 husky 向 simple-git-hooks 等更轻量方案迁移 |
| **tsc 分离** | 类型检查与转译分离，tsc 只做类型检查，esbuild/swc 负责编译 |
| **代码质量平台化** | SonarQube、Code Climate 等成为企业标配 |

---

## 📚 相关资源

| 资源 | 链接 |
|------|------|
| ESLint 文档 | <https://eslint.org/docs/latest/> |
| Prettier 文档 | <https://prettier.io/docs/en/> |
| Biome 文档 | <https://biomejs.dev/guides/> |
| oxlint GitHub | <https://github.com/oxc-project/oxc> |
| dprint 文档 | <https://dprint.dev/plugins/> |
| TypeScript 文档 | <https://www.typescriptlang.org/docs/> |

---

> **文档版本**: 2025年4月
> **维护建议**: 每季度更新 Stars 数据和工具趋势
