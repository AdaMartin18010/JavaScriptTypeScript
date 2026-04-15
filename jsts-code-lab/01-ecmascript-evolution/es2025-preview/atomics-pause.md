# Atomics.pause (ES2025)

## 规范背景 (ECMA-262 25.4.14)

`Atomics.pause(iterations?)` 于 ES2025 引入，位于 **ECMA-262 第 25.4.14 节**（`Atomics` 对象）。
其规范语义为：向执行环境提供一个**提示（hint）**，表明当前代理正处于一个自旋等待（spin-wait）循环中，
请求 CPU 在继续执行前降低流水线压力或进行短暂的节能停顿。

> 规范明确指出：`Atomics.pause` **不保证任何可观察的语义效果**（non-observable hint）。
> 即使宿主环境忽略该提示，程序的正确性也不应受影响。它仅用于性能优化。

## 使用场景

1. **高并发自旋锁**
   在 `SharedArrayBuffer` 多 Worker 场景中，传统的 `while (!tryLock()) {}` 会导致 CPU 100% 空转。
   在循环体内调用 `Atomics.pause()` 可提示处理器降低乱序执行强度，减少总线嗅探（cache coherency traffic），
   从而在高竞争时降低功耗并可能提升整体吞吐。

2. **无锁数据结构**
   实现无锁队列、栈或计数器时，CAS（Compare-And-Swap）失败后的重试循环中插入 `pause`，
   可避免多个核心同时高频重试造成的缓存颠簸（cache thrashing）。

3. **游戏/多媒体主循环**
   在需要精确自旋等待固定时间的场景中（如垂直同步前的微秒级等待），
   `Atomics.pause` 提供了一种标准化的低功耗自旋手段。

## 浏览器兼容性

| 环境 | 支持状态 | 备注 |
|------|----------|------|
| V8 (Node.js >= 22, Chrome >= 124) | ✅ 实验性/已实现 | 可通过 `--js-atomics-pause` 或默认启用 |
| SpiderMonkey (Firefox) | 🚧 开发中 | 预计在 Firefox 130+ 实现 |
| JavaScriptCore (Safari) | 🚧 开发中 | WebKit 尚未完整实现 |
| TypeScript lib | ⚠️ 需自行声明 | 当前 `lib.dom.d.ts` / `lib.es2020.sharedmemory.d.ts` 未包含 |

> 生产使用前，建议通过 `typeof Atomics.pause === 'function'` 做特性检测。

## 与 Atomics.wait / Atomics.notify 的区别

| 特性 | `Atomics.pause` | `Atomics.wait` / `Atomics.notify` |
|------|-----------------|-----------------------------------|
| **阻塞方式** | 非阻塞提示 | 阻塞当前 Worker 线程（真正挂起） |
| **唤醒机制** | 无需唤醒，继续自旋 | 必须依赖 `Atomics.notify` 唤醒 |
| **适用场景** | 预期等待时间极短（微秒级） | 等待时间较长或不确定 |
| **CPU 占用** | 中等（降低空转但仍占用核心） | 低（线程挂起，核心可调度其他任务） |
| **编程复杂度** | 低（纯自旋锁逻辑） | 高（需配对 wait/notify，处理超时） |

### 选型建议

- **等待时间 < 1μs**（如几次内存访问）：优先使用 `Atomics.pause` 自旋，避免线程切换开销。
- **等待时间 > 1μs 或不确定**：使用 `Atomics.wait` + `notify`，让出 CPU。
- **混合策略**：先自旋若干次（每次 `Atomics.pause`），若仍未获取锁，再退化为 `Atomics.wait`。
