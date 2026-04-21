# 05 执行流（Execution Flow）

> 同步与异步代码的执行顺序分析
>
> 文件数：6 | 对齐版本：ECMAScript 2025 (ES16)

---

## 学习路径

| # | 文件 | 内容 |
|---|------|------|
| 1 | [01-synchronous-flow.md](./01-synchronous-flow.md) | 同步执行流与调用栈 |
| 2 | [02-callback-pattern.md](./02-callback-pattern.md) | 回调模式与回调地狱 |
| 3 | [03-promise-execution-flow.md](./03-promise-execution-flow.md) | Promise 执行流 |
| 4 | [04-async-await-transformation.md](./04-async-await-transformation.md) | async/await 转换原理 |
| 5 | [05-event-loop-quiz-patterns.md](./05-event-loop-quiz-patterns.md) | 事件循环练习题 |
| 6 | [06-top-level-await.md](./06-top-level-await.md) | 顶层 await |

---

## 核心概念速查

```javascript
// async/await 执行顺序
async function test() {
  console.log("A");
  await 1;
  console.log("B");
}
test();
console.log("C");
// 输出：A → C → B
```

---

**相关链接**：

- [04-execution-model/08-event-loop-nodejs.md](../04-execution-model/08-event-loop-nodejs.md) — 事件循环机制
