# Developer Experience (DX)

> **定位**：`30-knowledge-base/30.2-categories/developer-experience.md`
> **关联**：`20-code-lab/20.1-fundamentals-lab/developer-experience/` | `30.9-learning-paths/`

---

## 概述

开发者体验（DX）衡量的是使用 JavaScript/TypeScript 工具链进行开发的效率与愉悦度。从编辑器支持到调试工具，从类型反馈到构建速度，DX 是生态竞争力的核心指标。

---

## DX 工具对比：Linter / Formatter

| 工具 | 语言 | Lint | Format | Type Check | 配置方式 | 速度 (LOC/s) | 生态插件 |
|------|------|------|--------|-----------|---------|-------------|---------|
| **ESLint** | JavaScript | ✅ 可扩展 | ✅ (via Prettier) | ❌ | `.eslintrc.*` / `eslint.config.js` (Flat Config) | ~50K | 1000+ 规则插件 |
| **Biome** | Rust | ✅ 内置 | ✅ 内置 | ❌ | `biome.json` | ~200K | 核心规则集 |
| **OXC** | Rust | ✅ (WIP) | ❌ (Planned) | ❌ | `oxlint.json` | ~500K+ | 核心规则集 |
| **Prettier** | JavaScript | ❌ | ✅ 标准 | ❌ | `.prettierrc` | ~30K | 社区插件 |

> **选型建议**
>
> - **遗留项目 / 高度定制需求** → ESLint + Prettier（生态最丰富）
> - **新项目 / 追求统一与极速** → Biome（一键迁移 ESLint/Prettier 配置）
> - **超大型 Monorepo / CI 极致速度** → OXC（极速 lint，逐步扩展中）

---

## 代码示例：Biome 配置 (`biome.json`)

```json
{
  "$schema": "https://biomejs.dev/schemas/1.8.0/schema.json",
  "organizeImports": {
    "enabled": true
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "correctness": {
        "noUnusedVariables": "error",
        "noUndeclaredVariables": "error"
      },
      "suspicious": {
        "noConsoleLog": "warn"
      },
      "style": {
        "useConst": "error",
        "useTemplate": "error"
      },
      "performance": {
        "noDelete": "error"
      }
    }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "trailingCommas": "es5"
    }
  },
  "files": {
    "ignore": ["node_modules", "dist", "*.config.*"]
  }
}
```

### 迁移脚本 (ESLint / Prettier → Biome)

```bash
# Install Biome
npm install --save-dev @biomejs/biome

# Auto-migrate existing ESLint + Prettier configs
npx @biomejs/biome migrate eslint --write
npx @biomejs/biome migrate prettier --write

# Check & format in CI
npx @biomejs/biome check --apply-unsafe ./src
npx @biomejs/biome format --write ./src
```

---

## 扩展代码示例

### Oxlint CI 快速拦截

```bash
# 安装
pnpm add -D oxlint

# 本地快速检查（零配置）
pnpx oxlint . --deny-warnings

# 与 ESLint 分层执行（package.json scripts）
{
  "scripts": {
    "lint:fast": "oxlint . --deny-warnings",
    "lint:deep": "eslint . --max-warnings=0",
    "lint": "pnpm lint:fast && pnpm lint:deep"
  }
}
```

### VS Code settings.json DX 集成

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
  "prettier.enable": false,
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.suggest.autoImports": true,
  "typescript.updateImportsOnFileMove.enabled": "always"
}
```

### Turborepo Pipeline 配置（Monorepo DX）

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

```bash
# 利用 Turborepo 远程缓存加速 CI
turbo run build test lint --remote-only
```

---

## 代码示例：TypeScript 项目引用（Project References）

```json
// tsconfig.json — 根配置
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true
  },
  "references": [
    { "path": "./packages/shared" },
    { "path": "./packages/ui" },
    { "path": "./apps/web" }
  ],
  "files": []
}
```

```json
// packages/ui/tsconfig.json — 子项目
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "composite": true,
    "declaration": true,
    "declarationMap": true
  },
  "include": ["src/**/*"],
  "references": [
    { "path": "../shared" }
  ]
}
```

```bash
# 增量构建整个 monorepo
npx tsc --build --force
npx tsc --build --watch
```

## 代码示例：VS Code Debug Launch 配置

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Next.js",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "pnpm",
      "runtimeArgs": ["run", "dev"],
      "env": { "NODE_OPTIONS": "--inspect" },
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "name": "Debug Vitest",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "pnpm",
      "runtimeArgs": ["vitest", "run", "--reporter=verbose"],
      "console": "integratedTerminal"
    },
    {
      "name": "Attach to Chrome",
      "type": "chrome",
      "request": "attach",
      "port": 9222,
      "webRoot": "${workspaceFolder}",
      "sourceMapPathOverrides": {
        "webpack://_N_E/*": "${webRoot}/*"
      }
    }
  ]
}
```

## 代码示例：Knip 死代码检测

```bash
# 安装 Knip
pnpm add -D knip

# 运行分析（检测未使用的导出、依赖、文件）
npx knip

# CI 中严格模式
npx knip --no-exit-code --reporter json
```

```json
// knip.json
{
  "$schema": "https://unpkg.com/knip@5/schema.json",
  "entry": ["src/index.ts", "src/cli.ts"],
  "project": ["src/**/*.ts"],
  "ignore": ["src/**/*.test.ts", "src/**/*.d.ts"],
  "rules": {
    "exports": "warn",
    "types": "warn",
    "dependencies": "error"
  }
}
```

## DX 核心议题扩展

| 议题 | 说明 | 推荐工具 |
|------|------|---------|
| **编辑器集成** | VS Code、WebStorm、Zed 的 TS 语言服务集成 | VS Code + TypeScript LSP |
| **调试体验** | Source Map、断点、条件断点 | Chrome DevTools, `ndb`, VS Code Debugger |
| **类型反馈速度** | 即时类型错误提示与自动补全 | `tsc --watch`, `typescript-language-server` |
| **文档工具** | TypeDoc、JSDoc、Storybook | TypeDoc + VitePress |
| **Monorepo 体验** | 跨包类型共享、增量构建 | pnpm + Turborepo / Nx |

---

## 延伸阅读

- [Developer Experience Lab](../../20-code-lab/20.1-fundamentals-lab/developer-experience/)
- [学习路径](../30.9-learning-paths/)

---

## 权威链接

- [Biome — Official Documentation](https://biomejs.dev/)
- [OXC — JavaScript Oxidation Compiler](https://oxc.rs/)
- [ESLint — Flat Config Migration Guide](https://eslint.org/docs/latest/use/configure/migration-to-flat-config)
- [ESLint — Configuration Files](https://eslint.org/docs/latest/use/configure/configuration-files)
- [Prettier — Configuration Options](https://prettier.io/docs/en/options.html)
- [TypeScript Language Server](https://github.com/typescript-language-server/typescript-language-server)
- [VS Code — JavaScript Debugging](https://code.visualstudio.com/docs/nodejs/nodejs-debugging)
- [Turborepo — DX for Monorepos](https://turbo.build/)
- [Nx — Smart Monorepos](https://nx.dev/)
- [Zed Editor](https://zed.dev/)
- [TypeDoc Documentation](https://typedoc.org/)
- [TypeScript — Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)
- [VS Code — Node.js Debugging](https://code.visualstudio.com/docs/nodejs/nodejs-debugging)
- [Knip — Find Unused Files, Dependencies and Exports](https://knip.dev/)
- [Zed Editor — TypeScript Support](https://zed.dev/docs/languages/typescript)
- [Node.js — Inspector Guide](https://nodejs.org/en/learn/getting-started/debugging)
- [Chrome DevTools — JavaScript Debugging](https://developer.chrome.com/docs/devtools/javascript)
- [tsc CLI Options](https://www.typescriptlang.org/docs/handbook/compiler-options.html)
- [Storybook for JavaScript/TypeScript](https://storybook.js.org/)

---

*本文件由重构工具自动生成于 2026-04-28，内容已深化。*
*最后更新: 2026-04-29*
