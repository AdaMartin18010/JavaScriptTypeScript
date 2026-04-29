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

## 代码示例：Node.js nextTick vs Promise 微任务优先级

```typescript
// event-loop-deep-dive.ts — Node.js 特有优先级差异
import { nextTick } from 'process';

console.log('1: sync start');

setTimeout(() => console.log('2: setTimeout (Timers)'), 0);
setImmediate(() => console.log('3: setImmediate (Check)'));

Promise.resolve().then(() => console.log('4: Promise microtask'));
nextTick(() => console.log('5: process.nextTick'));

console.log('6: sync end');

// Node.js 输出顺序：
// 1 -> 6 -> 5 -> 4 -> 2 -> 3
// 说明：
//   nextTick 在微任务之前执行，且优先级高于 Promise
//   setTimeout 与 setImmediate 的相对顺序取决于事件循环阶段
//   在 I/O 回调中，setImmediate 总是优先于 setTimeout
```

## 代码示例：Async Hooks 与异步上下文追踪

```typescript
// event-loop-deep-dive.ts — Node.js async_hooks 追踪异步边界
import { createHook, executionAsyncId, triggerAsyncId } from 'async_hooks';
import { AsyncLocalStorage } from 'async_hooks';

// 方案 1：使用 AsyncLocalStorage（推荐，Node.js 16.4+）
const requestStore = new AsyncLocalStorage<Map<string, unknown>>();

function withRequestContext<T>(requestId: string, fn: () => T): T {
  const store = new Map<string, unknown>();
  store.set('requestId', requestId);
  store.set('startTime', performance.now());
  return requestStore.run(store, fn);
}

function getRequestId(): string | undefined {
  return requestStore.getStore()?.get('requestId') as string | undefined;
}

// 使用示例：在 HTTP 服务器中保持请求上下文
import { createServer } from 'http';

createServer((req, res) => {
  withRequestContext(crypto.randomUUID(), () => {
    console.log('Start request:', getRequestId());
    
    // 即使进入异步操作，上下文依然保留
    setTimeout(() => {
      console.log('In timeout:', getRequestId()); // 相同的 requestId
      res.end('OK');
    }, 10);
  });
}).listen(3000);

// 方案 2：底层 async_hooks 监听（用于调试/监控）
const hook = createHook({
  init(asyncId, type, triggerAsyncId) {
    console.log(`Async resource created: type=${type}, asyncId=${asyncId}, trigger=${triggerAsyncId}`);
  },
  destroy(asyncId) {
    console.log(`Async resource destroyed: asyncId=${asyncId}`);
  },
});

// hook.enable(); // 生产环境谨慎开启，有性能开销
```

## 代码示例：Zone.js 风格的异步上下文拦截

```typescript
// event-loop-deep-dive.ts — Zone.js 原理简化实现
interface Zone {
  name: string;
  properties: Record<string, unknown>;
  parent?: Zone;
}

class ZoneManager {
  private static currentZone: Zone | undefined;

  static fork(name: string, properties: Record<string, unknown> = {}): Zone {
    return { name, properties, parent: this.currentZone };
  }

  static run<T>(zone: Zone, fn: () => T): T {
    const prev = this.currentZone;
    this.currentZone = zone;
    try {
      return fn();
    } finally {
      this.currentZone = prev;
    }
  }

  static get(key: string): unknown {
    let zone = this.currentZone;
    while (zone) {
      if (key in zone.properties) return zone.properties[key];
      zone = zone.parent;
    }
    return undefined;
  }
}

// 使用示例：跨异步边界追踪用户会话
const userZone = ZoneManager.fork('user-session', { userId: 'u-123' });
ZoneManager.run(userZone, () => {
  console.log(ZoneManager.get('userId')); // u-123
  setTimeout(() => {
    console.log(ZoneManager.get('userId')); // 在真实 Zone.js 中仍为 u-123
  }, 0);
});
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
| Node.js Async Hooks | 文档 | [nodejs.org/api/async_hooks.html](https://nodejs.org/api/async_hooks.html) |
| Node.js AsyncLocalStorage | 文档 | [nodejs.org/api/async_context.html#class-asynclocalstorage](https://nodejs.org/api/async_context.html#class-asynclocalstorage) |
| TC39 Explicit Resource Management | 规范 | [github.com/tc39/proposal-explicit-resource-management](https://github.com/tc39/proposal-explicit-resource-management) |

---

*最后更新: 2026-04-29*
