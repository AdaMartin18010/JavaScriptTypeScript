# 并发

> JavaScript 并发模型与异步编程模式。

---

## 并发原语

| 原语 | 说明 | 示例 |
|------|------|------|
| **Promise** | 异步操作代理 | `fetch().then()` |
| **async/await** | 同步写法处理异步 | `const data = await fetch()` |
| **Event Loop** | 单线程事件驱动 | 宏任务/微任务调度 |
| **Worker Threads** | 多线程计算 | `new Worker()` |
| **Atomics** | 共享内存同步 | `Atomics.add()` |
| **AbortController** | 取消异步操作 | `controller.abort()` |

## 模式

| 模式 | 说明 |
|------|------|
| **Promise.all** | 并行执行，全部成功 |
| **Promise.race** | 竞速，取最快 |
| **Promise.allSettled** | 并行执行，等待全部完成 |
| **Async Iterator** | 异步数据流 |

---

*最后更新: 2026-04-29*
