# 04 执行模型（Execution Model）

> JavaScript 引擎内部机制：编译、执行、内存与事件循环
>
> 文件数：11 | 对齐版本：ECMAScript 2025 (ES16) | V8 12.x

---

## 学习路径

| # | 文件 | 内容 |
|---|------|------|
| 1 | [01-engine-architecture.md](./01-engine-architecture.md) | V8、SpiderMonkey、JSC 的核心组件 |
| 2 | [02-compilation-vs-execution.md](./02-compilation-vs-execution.md) | 编译阶段 vs 执行阶段 |
| 3 | [03-call-stack.md](./03-call-stack.md) | 调用栈与栈溢出 |
| 4 | [04-execution-context.md](./04-execution-context.md) | 执行上下文的创建与生命周期 |
| 5 | [05-lexical-environment-variable.md](./05-lexical-environment-variable.md) | 词法环境与变量环境 |
| 6 | [06-this-binding.md](./06-this-binding.md) | this 的四种绑定规则 |
| 7 | [07-event-loop-browser.md](./07-event-loop-browser.md) | 浏览器事件循环 |
| 8 | [08-event-loop-nodejs.md](./08-event-loop-nodejs.md) | Node.js 事件循环 |
| 9 | [09-task-microtask-queues.md](./09-task-microtask-queues.md) | 任务队列优先级与 drain 语义 |
| 10 | [11-memory-management-gc.md](./11-memory-management-gc.md) | V8 堆、分代 GC、内存泄漏 |
| 11 | [12-agent-realm-job-queue.md](./12-agent-realm-job-queue.md) | Agent、Realm 与 Job Queue |

---

## 核心概念速查

```javascript
// 事件循环顺序
console.log("sync");
Promise.resolve().then(() => console.log("micro"));
setTimeout(() => console.log("macro"), 0);
// 输出：sync → micro → macro
```

---

**相关链接**：

- [JSTS全景综述/01_language_core.md](../JSTS全景综述/01_language_core.md) — 语言核心综述
- [jsts-code-lab/00-language-core/](../jsts-code-lab/00-language-core/) — 代码实验室
