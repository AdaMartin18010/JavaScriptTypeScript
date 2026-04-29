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
- [Prettier — Configuration Options](https://prettier.io/docs/en/options.html)
- [TypeScript LSP](https://github.com/typescript-language-server/typescript-language-server)
- [VS Code — JavaScript Debugging](https://code.visualstudio.com/docs/nodejs/nodejs-debugging)
- [Turborepo — DX for Monorepos](https://turbo.build/)

---

*本文件由重构工具自动生成于 2026-04-28，内容已深化。*
*最后更新: 2026-04-29*
