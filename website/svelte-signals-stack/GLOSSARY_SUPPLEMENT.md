# 术语表补充 (Glossary Supplement)

> **最后更新**: 2026-05-06 | **覆盖范围**: 21-25 新文档专用术语

本文件补充原有术语表未覆盖的新文档专用术语，与 `GLOSSARY.md` 配合使用。

---

## A

### active_reaction

运行时全局变量，指向当前正在执行的 reaction（effect 或 derived）。`get()` 通过此变量建立依赖边。见 [25-reactivity-source-proofs](25-reactivity-source-proofs.md)。

---

## B

### Batch (类)

Svelte 5 批处理调度器的内部实现。捕获状态变更前后的值，在 `flushSync()` 时原子性应用。见 [25-reactivity-source-proofs](25-reactivity-source-proofs.md) Theorem 6。

---

## C

### Compiler IR (Intermediate Representation)

编译器中间表示。Rich Harris 2026-04 提出的 Svelte 编译器演进方向：前端 AST → 平台无关 IR → 多后端输出 (JS/WASM/Native)。见 [23-compiler-ir-buildchain](23-compiler-ir-buildchain.md)。

### cache coherence (缓存一致性)

在 25 中指派生值通过版本号 (`write_version`/`read_version`) 实现的 O(1) 脏检测机制，类比分布式系统的缓存一致性协议。见 Theorem 4。

---

## D

### derived (派生信号)

Svelte 内部 API（对应 `$derived` Runes）。惰性求值的计算信号，缓存结果直到依赖变化。见 [25-reactivity-source-proofs](25-reactivity-source-proofs.md) Theorem 3。

### diamond problem (钻石问题)

反应式系统中多个派生值共享上游依赖时，避免重复计算的经典问题。Svelte 通过拓扑序和版本号解决。见 [25-reactivity-source-proofs](25-reactivity-source-proofs.md) Theorem 7。

---

## E

### effect (副作用)

Svelte 内部 API（对应 `$effect` Runes）。带有副作用的反应式单元，在依赖变化时执行。包括 `render_effect`、`user_effect`、`pre_effect` 等变体。见 [25-reactivity-source-proofs](25-reactivity-source-proofs.md)。

### Environment API

Vite 6.3 引入的新配置抽象，将 `client`/`server`/`ssr`/`edge` 等构建目标统一为 Environment 实例，支持同时编译。见 [23-compiler-ir-buildchain](23-compiler-ir-buildchain.md)。

---

## F

### flushSync()

同步刷新所有挂起的状态变更和 effect。对应 Svelte 4 的 `tick()`，但改为同步语义。见 [25-reactivity-source-proofs](25-reactivity-source-proofs.md) Theorem 6。

---

## G

### glitch-free

反应式系统的一种保证：在单次刷新周期内，不会观察到派生值的中间/不一致状态。见 [25-reactivity-source-proofs](25-reactivity-source-proofs.md) Theorem 7。

---

## I

### INP (Interaction to Next Paint)

Web Vitals 指标，测量用户交互到下一帧绘制的时间。Svelte 的 O(1) DOM 更新在此指标上优于 VDOM 框架。见 [22-browser-rendering-pipeline](22-browser-rendering-pipeline.md)。

### IR (Intermediate Representation)

见 **Compiler IR**。

---

## L

### lazy evaluation (惰性求值)

派生值仅在读取时计算，且仅在依赖变化后重新计算，通过缓存避免冗余。见 [25-reactivity-source-proofs](25-reactivity-source-proofs.md) Theorem 3。

---

## M

### mark_reactions()

Svelte 内部函数，在信号值变化时标记所有依赖该信号的 reaction 为脏状态。见 `effects.js`。见 [25-reactivity-source-proofs](25-reactivity-source-proofs.md) Theorem 1。

---

## N

### `NoInfer<T>`

TypeScript 5.8 引入的工具类型，阻止泛型类型参数从特定位置推断，用于防止 Runes 工厂函数的类型泄漏。见 [24-typescript-58-svelte-fusion](24-typescript-58-svelte-fusion.md)。

---

## R

### read_version

运行时全局版本计数器，每次读取信号时递增。用于 O(1) 脏检测。见 [25-reactivity-source-proofs](25-reactivity-source-proofs.md) Theorem 4。

### reaction

Svelte 内部术语，泛指依赖信号的任何计算单元（effect 或 derived）。

### remove_reaction()

运行时函数，在动态依赖变化时移除过期的依赖边，防止内存泄漏。见 [25-reactivity-source-proofs](25-reactivity-source-proofs.md) Theorem 5。

### Rolldown

用 Rust 编写的高性能打包工具，设计为 Rollup 的 API 兼容替代品，3-5x 构建速度提升。Vite 计划未来默认使用。见 [23-compiler-ir-buildchain](23-compiler-ir-buildchain.md)。

---

## S

### satisfies (关键字)

TypeScript 4.9+ 关键字，在保持推断类型的同时进行类型检查。与 `$state` 结合可在不拓宽类型的前提下做运行时验证。见 [24-typescript-58-svelte-fusion](24-typescript-58-svelte-fusion.md)。

### schedule_effect()

将 effect 加入执行队列，等待下一次刷新时按拓扑序执行。见 [25-reactivity-source-proofs](25-reactivity-source-proofs.md) Theorem 2。

### Signal (TC39)

TC39 Stage 1 提案中的标准化信号原语，包括 `Signal.State`、`Signal.Computed`、`Signal.subtle.Watcher`。见 [21-tc39-signals-alignment](21-tc39-signals-alignment.md)。

### source (信号源)

Svelte 内部 API（对应 `$state` Runes）。存储可变状态的最小反应式单元。见 [25-reactivity-source-proofs](25-reactivity-source-proofs.md)。

### strong consistency (强一致性)

在 25 中指 Svelte 同步、不可中断的刷新机制保证所有观察者看到一致的系统状态，无撕裂 (tearing)。见 Theorem 9。

---

## T

### tearing (撕裂)

并发/异步系统中，不同观察者看到系统不同时间点的状态。Svelte 的同步 flush 避免了此问题。见 [25-reactivity-source-proofs](25-reactivity-source-proofs.md) Theorem 9。

### topological sort (拓扑排序)

按依赖关系排序 effect 执行顺序，确保上游 derived 先于下游 effect 执行。见 [25-reactivity-source-proofs](25-reactivity-source-proofs.md) Theorem 2。

---

## U

### untrack()

Svelte 函数（对应 TC39 `Signal.subtle.untrack`），在回调内部禁用反应式追踪，避免建立意外依赖。见 [21-tc39-signals-alignment](21-tc39-signals-alignment.md)。

### update_reaction()

运行时核心函数，执行 reaction 并收集其依赖。动态依赖在此函数内通过 `remove_reaction` + 新 `get()` 调用来更新。见 [25-reactivity-source-proofs](25-reactivity-source-proofs.md) Theorem 1。

---

## V

### version clock (版本时钟)

Svelte 运行时使用的单调递增计数器机制 (`write_version`/`read_version`)，用于 O(1) 脏检测。见 [25-reactivity-source-proofs](25-reactivity-source-proofs.md) Theorem 4。

---

## W

### Watcher (TC39)

TC39 Signals 提案中的 `Signal.subtle.Watcher`，用于批量监听多个信号变化。语义等价于 Svelte 的 `mark_reactions` + `schedule_effect`。见 [21-tc39-signals-alignment](21-tc39-signals-alignment.md)。

### write_version

运行时全局版本计数器，每次写入信号时递增。用于 O(1) 脏检测。见 [25-reactivity-source-proofs](25-reactivity-source-proofs.md) Theorem 4。

---

## 交叉引用

- 原有基础术语: 见项目根目录 `GLOSSARY.md`
- 源码实现细节: 见 `SOURCE_REFERENCE_INDEX.md`
- 文档间关联: 见 `CROSS_REFERENCE_INDEX.md`
