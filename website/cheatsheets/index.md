---
title: 速查表
editLink: true
description: "JavaScript/TypeScript 生态速查表合集：核心语法、正则表达式、npm 工作流、ES2024+ 新特性的快速参考"
head:
  - - meta
    - property: og:title
      content: "速查表 | Awesome JS/TS Ecosystem"
  - - meta
    - property: og:description
      content: "JavaScript/TypeScript 生态速查表合集，覆盖 TS 类型系统、JS 核心语法、正则表达式、npm 工作流与 ES2024+ 新特性"
---

# 速查表

> 快速参考指南，帮助开发者在日常编码中迅速查阅核心语法与常用模式。所有速查表均遵循「一屏可见」原则，优先呈现高频使用场景。

## 速查表总览

| 速查表 | 核心内容 | 适用场景 |
|--------|----------|----------|
| [TypeScript 速查表](./typescript-cheatsheet) | 基础类型、泛型、工具类型、类型体操 | 类型定义、接口设计、类型推导 |
| [JavaScript 语法速查表](./javascript-cheatsheet) | 语法糖、数组方法、对象操作、异步模式 | 日常编码、面试复习、代码审查 |
| [正则表达式速查表](./regex-cheatsheet) | 元字符、分组断言、常用模式、性能陷阱 | 字符串解析、表单验证、日志提取 |
| [npm & package.json 速查表](./npm-cheatsheet) | 生命周期脚本、语义化版本、工作区、锁文件 | 依赖管理、Monorepo、发布流程 |
| [ES2024+ 新特性速查表](./es2024-cheatsheet) | `Object.groupBy`、Promise.withResolvers、`Array.prototype.toSorted` 等 | 现代语法迁移、代码现代化 |

## 使用建议

1. **先定位再深入**：根据当前任务选择对应速查表，不要试图一次性记忆全部内容。
2. **Ctrl+F 是好朋友**：每个速查表都设计了可搜索的标题结构，使用浏览器查找功能快速定位。
3. **交叉验证**：涉及边界行为（如 `==` 与 `===` 差异、正则贪婪/惰性匹配）时，建议在真实环境中验证。
4. **打印友好**：速查表采用简洁排版，适合导出 PDF 后离线查阅。

## 速查表分类体系

### 语言核心

- 类型系统（TypeScript）
- 语法语义（JavaScript / ES2024+）
- 正则表达式

### 工程工具

- 包管理器（npm / pnpm / yarn）
- 构建工具（Vite / Webpack / Rollup）
- 代码质量（ESLint / Prettier / TypeScript 配置）

### 运行时与框架

- Node.js API 速查
- React / Vue / Svelte 常用模式
- 测试框架（Vitest / Jest / Playwright）断言速查

## 贡献新速查表

欢迎提交新的速查表！请遵循以下格式规范：

- 文件名使用 kebab-case：`{topic}-cheatsheet.md`
- 包含标准 frontmatter（title、description）
- 使用表格或代码块组织信息，避免大段文字
- 每个速查表至少包含「常用模式」和「常见陷阱」两个章节

## 参考资源

- [TypeScript 官方文档](https://www.typescriptlang.org/docs/)
- [MDN JavaScript 参考](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference)
- [RegExr 在线测试工具](https://regexr.com/)
- [npm 官方文档](https://docs.npmjs.com/)
- [ECMAScript 兼容性表格](https://compat-table.github.io/compat-table/es2016plus/)
