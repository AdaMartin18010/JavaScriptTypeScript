# 02 变量系统专题

> 声明、作用域、闭包、提升、解构与私有状态
>
> 对齐版本：ECMAScript 2025 (ES16)

---

## 本阶段文件导航

| # | 文件 | 核心内容 |
|---|------|---------|
| 1 | [01-var-let-const.md](./01-var-let-const.md) | 三种声明方式的全面对比 |
| 2 | [02-hoisting.md](./02-hoisting.md) | 提升机制、TDZ、执行上下文 |
| 3 | [03-temporal-dead-zone.md](./03-temporal-dead-zone.md) | TDZ 底层机制与调试 |
| 4 | [04-scope-chain.md](./04-scope-chain.md) | 作用域链、闭包、词法环境 |
| 5 | [05-lexical-environment.md](./05-lexical-environment.md) | 环境记录、全局环境、模块环境 |
| 6 | [06-closure-deep-dive.md](./06-closure-deep-dive.md) | 闭包内存模型、实战模式 |
| 7 | [07-global-object.md](./07-global-object.md) | globalThis、跨环境差异 |
| 8 | [08-symbol-private-state.md](./08-symbol-private-state.md) | Symbol、WeakMap、私有字段 |
| 9 | [09-destructuring-rest-spread.md](./09-destructuring-rest-spread.md) | 解构、Rest、Spread 语法 |

---

## 学习路径

```
var/let/const → 提升 → TDZ → 作用域链 → 词法环境 → 闭包 → 全局对象 → 私有状态 → 解构
```

---

## 与互补目录的交叉引用

- `../JSTS全景综述/01_language_core.md` — 语言核心全景
- `../jsts-code-lab/00-language-core/` — 语言核心代码实验

---

## 关键概念速查

| 概念 | 说明 |
|------|------|
| 提升 | 声明在编译阶段移动到作用域顶部 |
| TDZ | let/const 声明前的暂时性死区 |
| 闭包 | 函数记住并访问其词法环境 |
| globalThis | 跨环境统一的全局对象访问 |
| 私有字段 | #前缀的类私有属性（ES2022） |

## 深入学习建议

### 前置知识

- JavaScript 基础语法
- ES6+ 新特性
- 基本的数据结构和算法

### 推荐资源

- ECMA-262 规范官方文档 (<https://tc39.es/ecma262/>)
- TypeScript Handbook (<https://www.typescriptlang.org/docs/>)
- V8 博客 (<https://v8.dev/blog>)
- HTML Living Standard (<https://html.spec.whatwg.org/>)

### 实践路径

1. 阅读本专题所有文件
2. 在 Chrome DevTools 中验证概念
3. 尝试修改代码观察行为变化
4. 阅读规范原文加深理解

### 与其他专题的关联

- 类型系统 → 变量系统：类型如何影响变量声明和作用域
- 变量系统 → 控制流：作用域如何影响控制流语句
- 控制流 → 执行模型：异步控制流与事件循环的关系
- 执行模型 → 执行流：引擎如何执行同步和异步代码
- 规范基础 → 所有专题：理解底层规范机制

## 版本历史

| 日期 | 更新 |
|------|------|
| 2025-04 | 初始版本，骨架搭建 |
| 2025-04 | 全面深化，全部文件 > 5000 字节 |

## 常见问题 FAQ

### Q: 本专题与 JSTS全景综述 的区别？

A: 本专题按知识领域重组，深入机制原理；全景综述按 ES 版本罗列特性变化。

### Q: 是否需要先读完所有文件？

A: 建议按学习路径渐进阅读，不必一次性读完。每个文件独立成篇，可按需查阅。

### Q: 代码示例在哪里？

A: 代码实验请前往 `../jsts-code-lab/` 目录，本目录侧重理论机制和规范解读。

### Q: 如何验证文中的概念？

A: 推荐在 Chrome DevTools Console 或 Node.js REPL 中直接运行示例代码。

### Q: 版本对齐到什么标准？

A: ECMAScript 2025 (ES16)、TypeScript 5.8–6.0、HTML Living Standard。

## 贡献与反馈

如发现内容错误、链接失效或希望补充话题，请通过项目 Issue 提交反馈。

## 许可

本专题内容遵循项目主 LICENSE 文件中的许可条款。
