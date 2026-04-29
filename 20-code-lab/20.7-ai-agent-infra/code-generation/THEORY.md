# 代码生成 — 理论基础

## 1. AST（抽象语法树）

源代码的结构化表示，编译器和代码生成工具的核心数据结构：

```
const x = 1 + 2
→
VariableDeclaration
├── declarations
│   └── VariableDeclarator
│       ├── id: Identifier (x)
│       └── init: BinaryExpression (+)
│           ├── left: Literal (1)
│           └── right: Literal (2)
```

## 2. 代码生成工具链

| 工具 | 用途 |
|------|------|
| **Babel** | JS/TS 转译、语法转换、Polyfill 注入 |
| **TypeScript Compiler API** | 类型检查、声明文件生成 |
| **SWC** | Rust 编写的高速编译器 |
| **ESBuild** | Go 编写的极速打包器 |
| **Oxc** | Rust 统一工具链（Parser + Linter + Transformer）|

## 3. 元编程模式

- **装饰器（Decorator）**: 注解式元数据附加
- **Reflect API**: 运行时类型和元数据操作
- **Proxy**: 拦截对象操作
- **代码模板**: 基于 AST 的代码片段生成

## 4. 与相邻模块的关系

- **79-compiler-design**: 编译器的完整设计
- **78-metaprogramming**: 元编程技术
- **23-toolchain-configuration**: 工具链配置


## 参考资源

| 资源 | 类型 | 链接 |
|------|------|------|
| MDN Web Docs | 文档 | [developer.mozilla.org](https://developer.mozilla.org) |
| web.dev | 指南 | [web.dev](https://web.dev) |
| TC39 Proposals | 规范 | [tc39.es](https://tc39.es) |

---

*最后更新: 2026-04-29*
