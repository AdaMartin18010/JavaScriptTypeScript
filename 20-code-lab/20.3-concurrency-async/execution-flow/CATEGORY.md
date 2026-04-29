---
dimension: 综合
sub-dimension: Execution flow
created: 2026-04-28
---

# 模块归属声明

本模块归属 **「综合」** 维度，聚焦 Execution flow 核心概念与工程实践。

## 包含内容

- 本模块聚焦 execution flow 核心概念与工程实践。
- 事件循环、宏任务与微任务、定时器、I/O 调度与异步边界。

## 子模块总览

| 子模块 | 说明 | 文件 |
|--------|------|------|
| Event Loop Deep Dive | 浏览器与 Node.js 事件循环差异分析 | `event-loop-deep-dive.ts` / `event-loop-deep-dive.test.ts` |
| Task Scheduling | `setTimeout` / `queueMicrotask` / `process.nextTick` 的优先级 | `event-loop-deep-dive.ts` |
| Async Boundaries | 同步与异步的边界：zoned errors、context loss | `event-loop-deep-dive.ts` |

## 代码示例：事件循环顺序验证

```typescript
// event-loop-deep-dive.ts — 演示宏任务、微任务与渲染的时序
console.log('A: script start');

setTimeout(() => console.log('B: macro task'), 0);

Promise.resolve().then(() => {
  console.log('C: micro task 1');
  return Promise.resolve();
}).then(() => {
  console.log('D: micro task 2');
});

queueMicrotask(() => console.log('E: queueMicrotask'));

console.log('F: script end');

// 浏览器输出顺序：
// A -> F -> C -> E -> D -> B
// 说明：同步代码 → 微任务队列清空 → 宏任务队列
```

## 相关索引

- `30-knowledge-base/30.2-categories/README.md` — 分类总览
- `20-code-lab/` — 代码实验室实践

## 目录内容

- 📄 ARCHIVED.md
- 📄 README.md
- 📄 THEORY.md
- 📄 _MIGRATED_FROM.md
- 📄 event-loop-deep-dive.test.ts
- 📄 event-loop-deep-dive.ts
- 📄 index.ts

---

> 此分类文档由批量生成脚本自动创建，请根据实际模块内容补充和调整。

## 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| MDN | 文档 | [developer.mozilla.org](https://developer.mozilla.org) |
| web.dev | 指南 | [web.dev](https://web.dev) |
| JavaScript Event Loop (Jake Archibald) | 文章 | [jakearchibald.com/2015/tasks-microtasks-queues-and-schedules](https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/) |
| Node.js Event Loop Guide | 文档 | [nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick](https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick) |
| HTML Standard — Event Loops | 规范 | [html.spec.whatwg.org/multipage/webappapis.html#event-loops](https://html.spec.whatwg.org/multipage/webappapis.html#event-loops) |
| Loupe (Event Loop Visualizer) | 工具 | [latentflip.com/loupe](http://latentflip.com/loupe/) |
| JavaScript Visualizer 9000 | 工具 | [www.jsv9000.app/](https://www.jsv9000.app/) |

---

*最后更新: 2026-04-29*
