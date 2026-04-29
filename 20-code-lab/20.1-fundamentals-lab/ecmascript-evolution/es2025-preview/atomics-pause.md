# Atomics.pause (ES2025)

## 规范背景 (ECMA-262 25.4.14)

`Atomics.pause(iterations?)` 于 ES2025 引入，位于 **ECMA-262 第 25.4.14 节**（`Atomics` 对象）。
其规范语义为：向执行环境提供一个**提示（hint）**，表明当前代理正处于一个自旋等待（spin-wait）循环中，
请求 CPU 在继续执行前降低流水线压力或进行短暂的节能停顿。

> 规范明确指出：`Atomics.pause` **不保证任何可观察的语义效果**（non-observable hint）。
> 即使宿主环境忽略该提示，程序的正确性也不应受影响。它仅用于性能优化。

## 提案演进

| 阶段 | 时间 | 里程碑 |
|------|------|--------|
| **Stage 0** | 2023 Q2 | 由 Mozilla 工程师提出，针对 `SharedArrayBuffer` 高竞争场景的自旋锁优化需求 |
| **Stage 1** | 2023 Q3 | TC39 会议讨论，确认 WebAssembly `memory.atomic.wait32` 的协同需求 |
| **Stage 2** | 2023 Q4 | 规范文本草案完成，语义限定为 **non-observable hint** |
| **Stage 3** | 2024 Q2 | 获得 Chrome/V8 实现承诺，Firefox/SpiderMonkey 跟进 |
| **Stage 4** | 2024 Q4 | 测试套件（Test262）通过，纳入 ES2025（ES16）草案 |
| **正式发布** | 2025 Q2 | 随 ES2025 标准正式发布 |

> **提案动机**：在 WebAssembly 线程和 JavaScript `SharedArrayBuffer` 的多 Worker 场景中，自旋锁（spinlock）是常见同步原语。传统的 `while (!tryLock()) {}` 空转会导致 CPU 100% 占用、缓存一致性总线风暴（cache coherency traffic storm）和功耗浪费。`Atomics.pause` 为宿主环境提供了一个标准化的优化提示，允许 CPU 在自旋时插入 `PAUSE` 指令（x86）或 `YIELD` / `WFE`（ARM），显著降低这些负面影响。

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

## 代码示例

### 4.1 基础用法：自旋锁中的 Pause

```javascript
// spinlock-basic.js
// 基于 SharedArrayBuffer 的简单自旋锁

const LOCK_INDEX = 0;
const UNLOCKED = 0;
const LOCKED = 1;

/**
 * 尝试获取锁（CAS 操作）
 * @param {Int32Array} sab
 * @returns {boolean}
 */
function tryLock(sab) {
  return Atomics.compareExchange(sab, LOCK_INDEX, UNLOCKED, LOCKED) === UNLOCKED;
}

/**
 * 释放锁
 * @param {Int32Array} sab
 */
function unlock(sab) {
  Atomics.store(sab, LOCK_INDEX, UNLOCKED);
  Atomics.notify(sab, LOCK_INDEX, 1); // 唤醒可能在 wait 的 Worker
}

/**
 * 自旋获取锁（带 pause 优化）
 * @param {Int32Array} sab
 * @param {number} maxSpin - 最大自旋次数，超过则退化为 Atomics.wait
 */
function acquireLock(sab, maxSpin = 1000) {
  let spins = 0;

  while (!tryLock(sab)) {
    spins++;

    if (spins < maxSpin) {
      // 自旋阶段：每次失败调用 pause 降低 CPU 压力
      // iterations 参数提示宿主环境 pause 的相对强度（默认/未指定由引擎决定）
      if (typeof Atomics.pause === 'function') {
        Atomics.pause();
        // 或指定强度：Atomics.pause(10);
      }
    } else {
      // 退化为阻塞等待，让出 CPU
      Atomics.wait(sab, LOCK_INDEX, LOCKED);
      spins = 0; // 重置计数器
    }
  }

  return spins; // 返回实际自旋次数（调试用）
}

// ===== Worker 中使用示例 =====
if (typeof Worker !== 'undefined' && !isMainThread) {
  const sab = workerData.sab;
  const lockView = new Int32Array(sab);

  acquireLock(lockView);
  try {
    // 临界区：安全地操作共享数据
    const current = Atomics.load(lockView, 1);
    Atomics.store(lockView, 1, current + 1);
  } finally {
    unlock(lockView);
  }
}
```

### 4.2 无锁计数器：CAS 重试 + Pause

```javascript
// lockfree-counter.js
// 无锁计数器：多个 Worker 同时递增，无需显式锁

const COUNTER_INDEX = 0;

/**
 * 无锁递增
 * @param {Int32Array} sab
 * @returns {number} 递增后的值
 */
function lockFreeIncrement(sab) {
  while (true) {
    const current = Atomics.load(sab, COUNTER_INDEX);
    const next = current + 1;

    // CAS：如果当前值仍为 current，则替换为 next
    if (Atomics.compareExchange(sab, COUNTER_INDEX, current, next) === current) {
      return next;
    }

    // CAS 失败：其他 Worker 已修改，pause 后重试
    if (typeof Atomics.pause === 'function') {
      Atomics.pause(5);
    }
  }
}

// Worker 逻辑
function workerLogic(sab, iterations) {
  const counter = new Int32Array(sab);
  for (let i = 0; i < iterations; i++) {
    lockFreeIncrement(counter);
  }
}
```

### 4.3 TypeScript 类型声明（ES2025 发布前）

```typescript
// atomics-pause-types.d.ts
// 在 TypeScript 原生支持 ES2025 lib 前，手动声明类型

declare interface Atomics {
  /**
   * 向执行环境提供一个提示，表明当前代理正处于自旋等待循环中。
   *
   * @param iterations - 提示自旋循环的迭代次数或相对强度。
   *   值越大表示预期等待时间越长，宿主可据此调整 pause 策略。
   *   若省略，由宿主环境决定默认行为。
   *
   * @see https://tc39.es/ecma262/#sec-atomics.pause
   */
  pause(iterations?: number): void;
}

// 使用时的特性检测
declare const Atomics: Atomics;
```

### 4.4 性能对比：有 Pause vs 无 Pause

```javascript
// benchmark-pause.js
// 对比自旋锁在有/无 Atomics.pause 时的 CPU 占用和吞吐量

async function benchmark({ usePause, workers, iterations }) {
  const sab = new SharedArrayBuffer(8);
  const lock = new Int32Array(sab);

  const start = performance.now();
  const workerPromises = Array.from({ length: workers }, () => {
    return new Promise((resolve) => {
      const w = new Worker('./spin-worker.js', {
        workerData: { sab, iterations, usePause },
      });
      w.on('exit', resolve);
    });
  });

  await Promise.all(workerPromises);
  const duration = performance.now() - start;

  return {
    usePause,
    totalOps: workers * iterations,
    durationMs: duration.toFixed(2),
    opsPerMs: ((workers * iterations) / duration).toFixed(2),
  };
}

// 预期结果（典型 x86-64 桌面 CPU）：
// - usePause=false: CPU 占用 ~100% × workers，总线竞争激烈
// - usePause=true:  CPU 占用显著降低（~20-40% × workers），吞吐可能略提升或持平
// 注：实际收益高度依赖 CPU 架构（x86 PAUSE 指令 vs ARM YIELD）和竞争程度
```

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

## 权威参考链接

- [ECMA-262: Atomics.pause](https://tc39.es/ecma262/#sec-atomics.pause) — ES2025 正式规范
- [TC39 Proposal: Atomics.pause](https://github.com/tc39/proposal-atomics-microwait) — 提案仓库（含设计动机与会议纪要）
- [V8 Commit: Implement Atomics.pause](https://chromium-review.googlesource.com/q/Atomics.pause) — V8 引擎实现提交记录
- [MDN: Atomics](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Atomics) — MDN Atomics 文档（待更新 pause）
- [Intel Intrinsics Guide: _mm_pause](https://www.intel.com/content/www/us/en/docs/intrinsics-guide/index.html#text=_mm_pause) — x86 PAUSE 指令底层说明
- [ARM Architecture Reference: YIELD / WFE](https://developer.arm.com/documentation/) — ARM 低功耗等待指令参考
- [WebAssembly Threads Proposal](https://github.com/WebAssembly/threads) — WASM 线程与共享内存提案（与 JS Atomics 协同设计）
- [A Primer on Memory Consistency and Cache Coherence](https://www.morganclaypool.com/doi/abs/10.2200/S00962ED2V01Y201910CAC049) — 内存一致性与缓存一致性学术教材
