# 05 执行流专题

> 同步与异步代码的执行顺序、Promise 状态机、async/await 转换与事件循环
>
> 对齐版本：ECMAScript 2025 (ES16)

---

## 本阶段文件导航

| # | 文件 | 核心内容 |
|---|------|---------|
| 1 | [01-synchronous-flow.md](./01-synchronous-flow.md) | 同步执行流、调用栈可视化、调试技巧 |
| 2 | [02-callback-pattern.md](./02-callback-pattern.md) | 回调模式演进、回调地狱、Promise 化 |
| 3 | [03-promise-execution-flow.md](./03-promise-execution-flow.md) | Promise 状态机、微任务调度、链式调用 |
| 4 | [04-async-await-transformation.md](./04-async-await-transformation.md) | async/await 语法糖、生成器转换 |
| 5 | [05-event-loop-quiz-patterns.md](./05-event-loop-quiz-patterns.md) | 20+ 事件循环练习题 |
| 6 | [06-top-level-await.md](./06-top-level-await.md) | 模块顶层 await、加载语义、降级方案 |

---

## 学习路径

```
同步流 → 回调 → Promise → async/await → 顶层 await → 事件循环练习
```

---

## 与互补目录的交叉引用

- `../30-knowledge-base/30.8-research/tsjs-stack-panorama-2026/04_concurrency.md` — 并发模型全景
- `../jsts-code-lab/03-concurrency/` — 并发代码实验

---

## 关键概念速查

| 概念 | 说明 |
|------|------|
| 微任务 | Promise.then、queueMicrotask |
| 宏任务 | setTimeout、setInterval、I/O |
| 事件循环 | 同步 → 微任务 → 渲染 → 宏任务 |
| Promise 状态 | pending → fulfilled/rejected |

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
