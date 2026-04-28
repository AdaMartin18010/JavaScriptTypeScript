# 构建工具配置示例

> 本示例展示现代 JavaScript/TypeScript 项目中常见构建工具的配置模式，包括 Vite 库模式配置等。

## 项目结构

```
04-build-tools/
└── vite-configs/
    └── react/          # React + Vite 库模式配置
        ├── vite.config.lib.ts
        ├── tsconfig.json
        └── package.json
```

## 核心特性

- **Vite 库模式**：将 React 组件打包为可发布的 npm 库
- **TypeScript 严格模式**：完整的类型检查配置
- **Tree-shaking 友好**：ESM + CJS 双格式输出

## 关联知识库模块

完成本示例后，建议深入以下代码实验室与理论文档：

| 模块 | 路径 | 与本示例的关联 |
|------|------|---------------|
| 工具链配置理论 | `jsts-code-lab/23-toolchain-configuration/THEORY.md` | 深入理解 Rust 工具链迁移、Linter/Formatter 选型 |
| 构建工具生态 | `docs/categories/03-build-tools.md` | Vite、Rspack、Rolldown 等构建工具全景对比 |
| 包管理 | `jsts-code-lab/12-package-management/THEORY.md` | 库发布、Version Catalogs、Monorepo 管理 |

> 📚 [返回知识库首页](../README.md)
