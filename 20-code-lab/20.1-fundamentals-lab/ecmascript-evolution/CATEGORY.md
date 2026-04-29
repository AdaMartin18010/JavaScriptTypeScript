---
category: language-core
dimension: 语言核心
created: 2026-04-27
---

# CATEGORY.md — 01-ecmascript-evolution

## 所属维度

**语言核心（Language Core）**

## 边界说明

本模块专注于 ECMAScript 语言规范的版本演进，涵盖从 ES3 到 ES2026 的语言特性变迁。所有内容均围绕 TC39 提案与 ECMA-262 规范展开，不涉及具体框架或运行时的实现差异（除非用于说明语义）。

**非本模块内容**：框架特性、构建工具演进、非标准扩展。

## 在语言核心体系中的位置

```
语言核心
  ├── 00-language-core            → 语法基础
  ├── 01-ecmascript-evolution（本模块）→ 规范演进史
  └── 10-fundamentals/10.1-language-semantics → 语义基础
```

## 子模块目录结构

| 子模块 | 说明 | 关键特性 |
|--------|------|----------|
| `es2015/` | ES6 核心特性实验（let/const、箭头函数、类、模块） | 块级作用域、Promise、模板字符串 |
| `es2016/` | Array.prototype.includes 与指数运算符 | `**`、`.includes()` |
| `es2017/` | 异步函数与 Object 扩展 | `async/await`、Object entries/values |
| `es2018/` | 异步迭代、Rest/Spread、正则增强 | `for-await-of`、命名捕获组 |
| `es2019/` | Array.flat、Object.fromEntries、trimStart/End | 数组扁平化、描述符简化 |
| `es2020/` | 空值合并、可选链、BigInt、动态 import | `??`、`?.`、BigInt、`import()` |
| `es2021/` | Promise.any、逻辑赋值、数字分隔符 | `||=`、`&&=`、`??=`、`|x|n` |
| `es2022/` | 类私有字段、顶层 await、.at() | `#field`、`await` at top-level、`

## 关联索引

- [10-fundamentals/10.1-language-semantics/README.md](../../../10-fundamentals/10.1-language-semantics/README.md)
- [30-knowledge-base/30.2-categories/00-language-core.md](../../../30-knowledge-base/30.2-categories/00-language-core.md)
- [MDN — JavaScript Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide) — Mozilla 权威文档
- [TC39 Proposals](https://github.com/tc39/proposals) — ECMAScript 提案仓库
- [ECMA-262 规范](https://tc39.es/ecma262/) — 官方语言规范
- [ES6 In Depth](https://hacks.mozilla.org/category/es6-in-depth/) — Mozilla 深度系列

---

*最后更新: 2026-04-29*
