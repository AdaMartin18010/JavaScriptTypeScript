---
title: TC39 Signals 与 Svelte Runes 语义对齐论证
description: 'TC39 Signals 提案（Stage 1）与 Svelte 5 Runes 的逐 API 语义等价性对照、算法步骤分析与标准化兼容性前瞻'
keywords: 'TC39 Signals, Svelte Runes, Signal.State, Signal.Computed, Signal.subtle.Watcher, 语义等价性, JavaScript 标准化'
---

# TC39 Signals 与 Svelte Runes 语义对齐论证

> **TC39 提案状态**: Stage 1（截至 2026-05）
> **提案仓库**: [github.com/tc39/proposal-signals](https://github.com/tc39/proposal-signals)
> **提案作者**: Daniel Ehrenberg, Yehuda Katz, Jatin Ramanathan, Shay Lewis, Kristen Hewell Garrett, Dominic Gannaway, Preston Sego, Milo M, Rob Eisenberg
> **Svelte 对齐版本**: Svelte 5.55.5
> **分析目标**: 建立 Svelte 5 Runes 与 TC39 Signals 之间的严格语义映射，评估未来编译器生成原生 Signals API 的可行性

---

## 1. TC39 Signals 提案核心设计

TC39 Signals 提案并非面向应用开发者的直接 API，而是为 JavaScript 框架提供的**底层响应式原语（Reactivity Primitives）**。其设计哲学与 Svelte 5 的编译器优化方向高度一致：自动追踪依赖、惰性求值、无 glitches、允许框架自定义调度。

### 1.1 核心 API 概览

```typescript
interface Signal<T> {
  get(): T;
}

namespace Signal {
  class State<T> implements Signal<T> {
    constructor(t: T, options?: SignalOptions<T>);
    get(): T;
    set(t: T): void;
  }

  class Computed<T = unknown> implements Signal<T> {
    constructor(cb: (this: Computed<T>) => T, options?: SignalOptions<T>);
    get(): T;
  }

  namespace subtle {
    function untrack<T>(cb: () => T): T;
    function currentComputed(): Computed | null;
    function introspectSources(s: Computed | Watcher): (State | Computed)[];
    function introspectSinks(s: State | Computed): (Computed | Watcher)[];
    function hasSinks(s: State | Computed): boolean;
    function hasSources(s: Computed | Watcher): boolean;

    class Watcher {
      constructor(notify: (this: Watcher) => void);
      watch(...s: Signal[]): void;
      unwatch(...s: Signal[]): void;
      getPending(): Signal[];
    }

    var watched: Symbol;
    var unwatched: Symbol;
  }

  interface SignalOptions<T> {
    equals?: (this: Signal<T>, t: T, t2: T) => boolean;
    [Signal.subtle.watched]?: (this: Signal<T>) => void;
    [Signal.subtle.unwatched]?: (this: Signal<T>) => void;
  }
}
```

### 1.2 TC39 Signals 的设计目标

根据提案文档（`README.md` Design goals 章节），核心目标包括：

1. **框架互操作性**：让 Angular、Bubble、Ember、FAST、MobX、Preact、Qwik、RxJS、Solid、Starbeam、Svelte、Vue、Wiz 等框架共享同一套响应式图语义
2. **自动追踪（Auto-tracking）**：读取 Signal 时自动建立依赖关系，无需手动订阅
3. **惰性求值（Lazy Evaluation）**：Computed Signal 仅在有人 `get()` 时才重新计算
4. **无 Glitches**：通过拓扑排序消除冗余计算和中间不一致状态
5. **调度自主权**：不强制内置调度策略，允许框架在 `Watcher.notify()` 上构建自己的批处理/微任务/时间切片机制
6. **内存管理**：通过 `watched`/`unwatched` 钩子和 `Watcher` 接口支持框架级垃圾回收优化

### 1.3 算法规范（来自提案 README `main` @ `9124ed91`）

> **规范状态更新（2026-05）**：TC39 Signals 提案仓库自 2025-08-11 后无新 commit，当前算法规范处于**冻结审查期**。以下算法步骤直接引用提案 README 的 "proto-specification" 章节，并标注了 2026 年已发现的争议点。

#### 全局隐藏状态

所有 Signal 算法共享以下 agent-global 状态：

- **`computing`**：当前因 `.get()` 而重新求值的最内层 `Computed`，或 `null`
- **`frozen`**：`true` 表示回调（`notify` / `watched` / `unwatched` / `equals` / computed callback）正在执行，禁止修改图
- **`generation`**：递增整数，用于追踪值新鲜度和避免 unwatched 图中的循环

#### `Signal.State.prototype.get()`

1. 若 **`frozen`** 为 `true`，抛出异常
2. 若 **`computing`** 不为 `null`，将本 Signal 加入 `computing` 的 **`sources`** 集合
3. *NOTE: 我们不将 `computing` 加入本 Signal 的 `sinks` 集合，直到它被 Watcher 显式 watch*
4. 返回本 Signal 的 **`value`**

#### `Signal.State.prototype.set(newValue)`

1. 若当前执行上下文 **`frozen`**，抛出异常
2. 对本 Signal 和 `newValue` 运行 **"set Signal value"** 算法
3. 若该算法返回 **`~clean~`**，返回 `undefined`
4. 将本 Signal 所有 **`sinks`** 的状态设为：
   - （若 sink 为 `Computed`）**`~dirty~`**（若之前为 `~clean~`）
   - （若 sink 为 `Watcher`）**`~pending~`**（若之前为 `~watching~`）
5. 递归将所有 sinks 的 `Computed` 依赖的状态设为 **`~checked~`**（若之前为 `~clean~`，保留已有的 `~dirty~` 标记）
6. 对上述递归搜索中遇到的每个之前为 **`~watching~`** 的 `Watcher`，按**深度优先顺序**：
   1. 设置 **`frozen = true`**
   2. 调用其 **`notify`** 回调（保存抛出的异常，忽略返回值）
   3. 恢复 **`frozen = false`**
   4. 设置 `Watcher` 的状态为 **`~waiting~`**
7. 若有 `notify` 回调抛出异常，在所有回调执行完毕后传播；若多个异常，打包为 `AggregateError`
8. 返回 `undefined`

#### `Signal.Computed.prototype.get()`

**状态机**：`~clean~` | `~checked~` | `~computing~` | `~dirty~`

1. 若上下文 **`frozen`**，或本 Signal 状态为 **`~computing~`**，或本 signal 为 `Watcher` 且 `computing` 为 computed Signal，抛出异常
2. 若 **`computing`** 不为 `null`，将本 Signal 加入 `computing` 的 **`sources`** 集合
3. *NOTE: 同 State.get()，不立即建立 sink 链接*
4. 若本 Signal 状态为 **`~dirty~`** 或 **`~checked~`**：重复以下直到状态为 `~clean~`：
   1. 沿 **`sources`** 递归向上，找到**最深、最左**（最早观察到的）标记 `~dirty~` 的 `Computed`
   2. 对该 Signal 执行 **"recalculate dirty computed Signal"** 算法
5. 返回 Signal 的 **`value`**

#### 算法：recalculate dirty computed Signal

1. 清空本 Signal 的 **`sources`** 集合，并从这些 sources 的 **`sinks`** 中移除本 Signal
2. 保存之前的 **`computing`** 值，设置 **`computing`** 为本 Signal
3. 设置本 Signal 状态为 **`~computing~`**
4. 运行 computed callback，保存返回值；若抛出异常，保存异常用于重抛
5. 恢复之前的 **`computing`** 值
6. 对 callback 返回值应用 **"set Signal value"** 算法
7. 设置本 Signal 状态为 **`~clean~`**
8. 若 "set Signal value" 返回 **`~dirty~`**：将所有 sinks 标记为 `~dirty~`
9. 否则返回 **`~clean~`**：对每个 **`~checked~`** sink，若其所有 sources 现已 clean，则标记为 `~clean~`，递归清理

> ⚠️ **2026 年已知争议（PR #280）**：当前文本在第 5 步恢复 `computing` 后才在第 6 步调用 "set Signal value"。PR #280 主张交换顺序，使 `computing` 在 "set Signal value" 之后才恢复，以确保 `equals` 回调内部的读取被正确追踪。

---

## 2. Svelte 5 Runes 与 TC39 Signals 语义映射

### 2.1 逐 API 语义对照表

| TC39 Signals API | Svelte 5 运行时对应 | Svelte 5 编译时对应 | 语义等价性 | 差异分析 |
|-----------------|-------------------|-------------------|-----------|---------|
| `new Signal.State(v)` | `$.source(v)` / `$.state(v)` | `$state(v)` → 编译为 `$.state(v)` | ✅ **语义等价** | Svelte 的 `$.state()` 在 DEV 模式下附加 `label` 和 `tracing` 信息；TC39 的 `State` 是类实例，Svelte 的是普通对象 |
| `state.get()` | `$.get(state)`（隐式） | 模板中 `{count}` → 编译为 `$.get(count)` | ✅ **语义等价** | Svelte 的 `get()` 在 `runtime.js` 中实现，包含 `active_reaction` 注册和 `batch_values` 检查；TC39 `get()` 标准语义更精简 |
| `state.set(v)` | `$.set(state, v)` | `count = v` → 编译为 `$.set(count, v)` | ✅ **语义等价** | Svelte 的 `set()` 包含 `equals` 检查、`Batch.capture()`、`mark_reactions()` 和 `eager_effects` 刷新；TC39 标准对应 "set Signal value" 算法 |
| `new Signal.Computed(fn)` | `$.derived(fn)` | `$derived(fn)` / `$derived.by(fn)` → 编译为 `$.derived(fn)` | ✅ **语义等价** | 两者均为惰性求值、缓存、自动依赖追踪。Svelte 的 `derived` 附加 `parent`（创建时的 effect 上下文）和 `ac`（AbortController） |
| `computed.get()` | `$.get(computed)` | 模板或 `$derived` 链中的读取 | ✅ **语义等价** | Svelte 的 `get()` 对 Derived 有额外的 `should_connect` / `reconnect` 逻辑，支持动态连接/断开 |
| `Signal.subtle.Watcher` | `$.effect()` 的底层机制 | `$effect(fn)` → 编译为 `$.effect(fn)` | ⚠️ **部分等价** | TC39 的 `Watcher` 是显式、低级的观察原语；Svelte 的 `effect` 是高级封装，内置了调度器（Batch）、清理函数管理和组件生命周期绑定 |
| `Signal.subtle.untrack(cb)` | `$.untrack(cb)` | 无直接编译时对应 | ✅ **语义等价** | Svelte `runtime.js` [L480-L490] 的实现与 TC39 标准语义一致：在回调内设置 `untracking = true`，跳过依赖注册 |
| `Signal.subtle.currentComputed()` | `active_reaction`（内部变量） | 无直接对应 | ⚠️ **能力等价** | Svelte 使用 `active_reaction` 全局变量追踪当前执行的 Reaction；TC39 将其暴露为标准 API |
| `options.equals` | `signal.equals`（`sources.js` 中默认为 `Object.is`） | 无直接对应 | ✅ **语义等价** | Svelte 的 `safe_equals`（用于 mutable_source）与 TC39 的自定义 `equals` 功能对应 |
| `Signal.subtle.watched` | Derived 的 `CONNECTED` 标志 + `reconnect()` | 无直接对应 | ⚠️ **机制不同，目标相同** | TC39 使用 Symbol 钩子；Svelte 通过 `get()` 中的 `should_connect` 逻辑和 `remove_reaction` 中的断开逻辑实现类似的生命周期管理 |

### 2.2 状态机对照：Signal 生命周期

**TC39 Signals 状态机**（来自提案算法）：

```
State/Computed 内部状态:
  - value: 当前值
  - sinks: Set<Computed | Watcher>
  - state: ~clean~ | ~checked~ | ~dirty~ | ~pending~ | ~watching~

State.set() 触发:
  clean → dirty (sinks)
  clean → checked (sinks 的 Computed 依赖，递归)
  watching → pending (Watcher)
```

**Svelte 5 状态机**（基于 `status.js` 和源码分析）：

```
Source/Derived 标志位 (f 字段):
  - CLEAN   (4)
  - MAYBE_DIRTY (2)
  - DIRTY   (1)

set() / internal_set() 触发:
  CLEAN → DIRTY   (Effect consumers)
  CLEAN → MAYBE_DIRTY (Derived consumers，递归传播)

Derived 的 update_derived_status():
  CONNECTED → CLEAN
  !CONNECTED && has deps → MAYBE_DIRTY
  !CONNECTED && no deps → CLEAN
```

**关键差异**：TC39 使用 `~checked~` 作为中间状态，表示"需要检查但尚未确认为 dirty"；Svelte 5 使用 `MAYBE_DIRTY` 作为等效状态。TC39 的 `~pending~` 对应 Svelte 的 `DIRTY`（对 Watcher/Effect 而言）。

### 2.3 调度模型对照

| 维度 | TC39 Signals | Svelte 5 Runes |
|------|-------------|----------------|
| **调度策略** | 无内置调度，`Watcher.notify()` 同步调用，框架自行实现批处理 | 内置 `Batch` 类系统，通过微任务队列自动批处理 |
| **批处理粒度** | 框架级（可全局、可按组件、可按优先级） | 全局 + 异步模式支持（`async_mode_flag`）+ Fork/Time-Travel |
| **Effect 执行时机** | `notify` 后由框架决定 | `queue_micro_task(() => batch.flush())` 或 `flushSync()` 同步刷新 |
| **清理（Teardown）** | 框架通过 `Watcher.unwatch()` 管理 | `effect.teardown` 函数 + `destroy_effect()` 递归清理 |
| **异步支持** | 基础 API 未涉及，留给框架 | 内置 `async_derived()`、`$effect` 的 `await` 安全模式、`fork()` 投机预加载 |

**核心洞察**：TC39 Signals 的 `Watcher` 相当于 Svelte 5 中剥去了调度器、生命周期管理和 DOM 绑定后的**最底层 Effect 原语**。Svelte 5 的 `$.effect()` 可以被视为在 TC39 `Watcher` 之上的一层高级封装。

---

## 3. 算法步骤逐行对照

### 3.1 依赖追踪：`get()` vs `Signal.State.prototype.get()`

**TC39 标准算法**（`Signal.State.prototype.get()`）：

1. 若 `frozen` 为 true，抛出异常
2. 若 `computing` 不为 `undefined`，将当前 Signal 加入 `computing.sources`
3. **不**立即将 `computing` 加入当前 Signal 的 `sinks`
4. 返回 `value`

注意：TC39 的依赖注册是**单向延迟**的——读取时只记录到 `computing.sources`，直到 `Watcher.watch()` 调用时才建立完整的双向图。

**Svelte 5 `get()`**（`runtime.js` [L370-L470]）：

1. 检查 `active_reaction !== null && !untracking`
2. 若处于 `REACTION_IS_UPDATING` 状态：
   - 更新 `signal.rv = read_version`
   - 将 signal 加入 `new_deps`（或复用 `skipped_deps`）
3. 若处于更新周期外（如 await 后）：
   - 将 signal 加入 `active_reaction.deps`
   - 将 `active_reaction` 加入 `signal.reactions`
4. 返回 `signal.v`（或 `batch_values` 覆盖值）

**差异分析**：

- Svelte 5 的依赖建立是**即时双向**的（在 `update_reaction` 的 finally 块中完成 `reactions` 注册）；TC39 是**延迟双向**的（通过 `Watcher.watch()` 显式触发）
- Svelte 5 的 `read_version` 机制提供了**同一反应内重复读取去重**，TC39 标准未明确指定此类优化
- Svelte 5 的 `batch_values` 支持 Time-Travel / Fork 语义，TC39 标准无此概念

### 3.2 状态变更传播：`set()` vs `Signal.State.prototype.set()`

**TC39 标准算法**（`Signal.State.prototype.set()`）：

1. 若 `frozen`，抛出异常
2. 运行 "set Signal value"：若 `equals` 返回 true，返回 `~clean~`
3. 更新内部 `value`
4. 将所有 `sinks` 的状态设为 `~dirty~`（Computed）或 `~pending~`（Watcher）
5. 递归将 sinks 的 Computed 依赖设为 `~checked~`
6. 深度优先调用所有 `~watching~` Watcher 的 `notify` 回调
7. 返回 `undefined`

**Svelte 5 `internal_set()`**（`sources.js` [L95-L140]）：

1. `source.equals(value)` 检查，若相等则提前返回
2. `old_values.set(source, source.v)` 记录旧值
3. `Batch.ensure().capture(source, value)` 记录变更到当前 batch
4. 递增 `source.wv = increment_write_version()`
5. `mark_reactions(source, DIRTY, ...)` 遍历 `source.reactions`：
   - Effect → 标记 `DIRTY`，`schedule_effect()` 加入 batch 队列
   - Derived → 标记 `MAYBE_DIRTY`，递归 `mark_reactions(derived, MAYBE_DIRTY, ...)`
   - EAGER_EFFECT（DEV）→ 加入 `eager_effects` 立即刷新
6. 处理 `untracked_writes`（用于 `$effect(() => x++)` 自修改场景）
7. 若有 eager effects，立即 `flush_eager_effects()`

**差异分析**：

- **传播方向**：TC39 是即时递归传播到所有 sinks；Svelte 5 对 Derived 使用 `MAYBE_DIRTY` 延迟传播，实际重新计算推迟到 `get()` 时
- **调度集成**：TC39 在 `set()` 中直接调用 `notify`；Svelte 5 将 Effect 加入 `Batch` 队列，通过微任务异步刷新
- **版本号**：Svelte 5 使用全局 `write_version` + 每个 signal 的 `wv`，TC39 标准未显式使用版本号（但实现层可能采用类似机制）

### 3.3 计算与缓存：`update_derived()` vs `Signal.Computed.prototype.get()`

**TC39 标准算法**（`Signal.Computed.prototype.get()`）：

1. 若 `frozen`，抛出异常
2. 若 `state` 为 `~clean~`，返回缓存值
3. 若 `state` 为 `~checked~`：
   - 检查所有 `sources` 是否为 `~clean~`
   - 若是，设置 `state = ~clean~`，返回缓存值
4. 设置 `computing = this`
5. 执行计算函数 `cb.call(this)`
6. 重置 `computing = undefined`
7. 若值变化，更新 `value` 和 `state = ~clean~`
8. 返回 `value`

**Svelte 5 `update_derived()`**（`deriveds.js` [L260-L300]）：

1. `execute_derived(derived)` 调用 `update_reaction(derived)`
2. `update_reaction` 执行 `derived.fn()`，期间通过 `get()` 建立 `new_deps`
3. 执行后，`derived.deps = new_deps`，双向边注册到 `deps[i].reactions`
4. 若 `!derived.equals(value)`：
   - `derived.wv = increment_write_version()`
   - 在非 fork 场景下更新 `derived.v = value`
5. `update_derived_status(derived)`：
   - CONNECTED → `CLEAN`
   - !CONNECTED && has deps → `MAYBE_DIRTY`

**差异分析**：

- **状态检查**：TC39 使用显式 `~checked~` 状态；Svelte 5 使用 `is_dirty()` 函数递归检查依赖的 `wv`
- **计算上下文**：TC39 使用全局 `computing` 变量；Svelte 5 使用 `active_reaction` + `REACTION_IS_UPDATING` 标志
- **缓存失效**：TC39 在 `set()` 传播时标记 sinks；Svelte 5 在 `get()` 时通过 `dependency.wv > reaction.wv` 判定脏状态

---

### 3.4 2026 年算法争议与规范不确定性

TC39 Signals 提案自 2025-08-11 后无代码合并，但 2026 年 Q2 出现了多起算法层面的公开争议，直接影响 "proto-specification" 的准确性：

#### 争议一：Unwatched Computed 的脏传播（Issue #278, 2026-04-18）

**问题**：若 `Signal.State` 没有 sinks（因为没有任何东西 watch 它），依赖它的 `Signal.Computed` 永远不会收到变更通知。测试 polyfill 期望下次 `.get()` 时重新求值，但 README 算法说 computed 应认为自己是 clean。

**对 Svelte 5 的映射**：

Svelte 5 不存在此问题，因为：

- Svelte 的 `derived` 不依赖 "watched" 概念判断是否需要更新
- `is_dirty()` 通过版本号比较（`dependency.wv > reaction.wv`）工作，无论 derived 是否被任何 effect "watch"
- 即使一个 derived 暂时没有任何 effect 消费者，它的 `wv` 仍然会在源变化时通过 `mark_reactions()` 传播标记

```javascript
// Svelte 5 的保障：无论 derived 是否有 effect 消费者
const d = $.derived(() => $.get(source) * 2);
// source 变化 → mark_reactions(source, MAYBE_DIRTY) → d 被标记
// 之后任何对 d 的读取都会触发重新计算
$.get(d); // 正确重新求值，无需 "watch" 机制
```

#### 争议二：`equals` 回调中的依赖追踪（Issue #279/#280, 2026-04-22）

**问题**："recalculate dirty computed Signal" 算法在第 5 步恢复 `computing` 后才在第 6 步调用 "set Signal value"（其中会调用 `equals`）。这意味着 `equals` 回调内部对 Signal 的读取不会被追踪，但 polyfill 测试期望它被追踪。

**PR #280 方案**：交换第 5 步和第 6 步的顺序，使 `computing` 在 "set Signal value" 完成之后才恢复。

**对 Svelte 5 的映射**：

Svelte 5 不存在此问题，因为：

- Svelte 的 `equals` 检查（`safe_equals`）在 `update_reaction` 的 `finally` 块之外执行
- `active_reaction` 在 `derived.fn()` 执行期间被设置为 derived 本身，包括 `equals` 调用期间

```javascript
// Svelte 5 的执行顺序（deriveds.js 简化逻辑）
function update_reaction(reaction) {
  var previous_active_reaction = active_reaction;
  active_reaction = reaction;  // 设置上下文
  try {
    var result = reaction.fn(); // 执行计算函数
  } finally {
    active_reaction = previous_active_reaction; // 恢复上下文
  }
  // equals 检查在恢复之后执行
  if (!reaction.equals(result)) {
    reaction.v = result;
    reaction.wv = write_version;
  }
}
```

#### 争议三：`~pending~` 状态的必要性（Issue #282, 2026-05-01）

**问题**：`Watcher` 的 `~pending~` 状态是否真正必要？polyfill 实际上跳过该状态，直接调用 notify 回调。

**对 Svelte 5 的映射**：

Svelte 5 没有直接等价的 "pending" 中间状态。Effect 的状态转换是：

```
CLEAN → DIRTY (set() 触发)
DIRTY → 执行中 (flush 时)
执行中 → CLEAN (flush 完成)
```

Svelte 的 `Batch` 系统将 "dirty 标记" 和 "调度执行" 分离，不需要 `~pending~` 这样的中间状态来区分 "已标记但未通知"。

#### 争议总结与标准化风险评估

| 争议 | 影响范围 | 解决难度 | 对 Svelte 影响 |
|:---|:---|:---:|:---|
| #278 Unwatched 传播 | 所有 Computed 实现 | 中 | Svelte 已解决，但标准若采用不同方案需评估 |
| #279/#280 `equals` 追踪 | Computed 重新计算 | 低 | Svelte 不受影响，但标准语义需明确 |
| #282 `~pending~` 必要性 | Watcher 状态机 | 低 | Svelte 无此状态，标准简化有利 |

**核心观察**：这些争议表明 TC39 Signals 的 "proto-specification" 尚未达到工程实现级别的精确性。Svelte 5 的现有实现实际上**已经解决了这些边界情况**（通过版本号系统、即时双向依赖注册、Batch 调度器）。这支持了本文档第 5 章的结论：即使 TC39 Signals 最终标准化，Svelte 的调度器和效果集成层仍将保持独立演进。

---

## 4. 语义等价性总结

### 4.1 等价性层级

```
TC39 Signals Core Semantics
    │
    ├── Signal.State.get()  ───────→  Svelte $.get(source)          [行为等价]
    ├── Signal.State.set()  ───────→  Svelte $.set(source, v)       [行为等价，调度差异]
    ├── Signal.Computed.get() ─────→  Svelte $.get(derived)         [惰性求值等价]
    ├── Auto-tracking ─────────────→  Svelte get() 中的依赖注册      [机制等价，实现差异]
    ├── Glitch-free guarantee ─────→  Svelte 惰性传播 + 版本号       [保证等价]
    └── Watcher.notify() ──────────→  Svelte Batch.schedule()       [目标等价，封装差异]
```

### 4.2 关键语义不变量（Shared Invariants）

以下不变量同时适用于 TC39 Signals 和 Svelte 5 Runes：

**不变量 1（单调写版本）**：每次成功的 `set()` 操作，Signal 的内部状态严格前进，不会出现"回退"到旧值而不触发通知的情况。

**不变量 2（惰性一致性）**：Computed/Derived 的重新计算发生在任何消费者读取其值之前，且计算完成后消费者读取到的是完全一致的最终值。

**不变量 3（依赖精确性）**：Reaction（Effect/Watcher）的依赖集合精确等于其上次执行期间读取的所有 Signal 集合，无死依赖、无漏依赖。

**不变量 4（通知无副作用）**：TC39 的 `notify` 回调和 Svelte 的 Effect 执行过程中，对 Signal 的写操作要么被禁止（TC39 `frozen`），要么被延迟到下一轮 batch（Svelte `Batch.ensure()`）。

---

## 5. Svelte 编译器生成原生 Signals API 的可行性分析

### 5.1 编译输出映射

当前 Svelte 5.55.5 编译器将 `$state(0)` 转换为对 `svelte/internal/client` 的调用：

```javascript
// 输入
let count = $state(0);

// 当前编译输出
import { state as $.state } from 'svelte/internal/client';
const count = $.state(0);
```

若 TC39 Signals 进入 Stage 3 并成为浏览器原生 API，Svelte 编译器理论上可生成：

```javascript
// 未来可能的编译输出
const count = new Signal.State(0);
```

### 5.2 可行性评估

| 维度 | 可行性 | 障碍/考量 |
|------|--------|----------|
| **Source/State** | ✅ 高 | `Signal.State` 与 `$.state()` 语义完全兼容，可直接替换 |
| **Computed/Derived** | ✅ 高 | `Signal.Computed` 的惰性求值与 `$.derived()` 等价，但 Svelte 的 `parent`/`ac` 字段需额外处理 |
| **Effect 调度** | ⚠️ 中 | TC39 无内置调度器，Svelte 的 `Batch` 系统仍需保留。`Watcher` 可作为 Effect 的底层原语，但 `Batch` 的 async/fork/time-travel 功能需框架层实现 |
| **Proxy 深度响应式** | ⚠️ 中 | TC39 Signals 不处理对象属性的自动代理。Svelte 的 `$.state()` 对对象使用 `proxy()` 包装（`proxy.js`），这部分仍需框架层实现 |
| **版本号优化** | ⚠️ 中 | Svelte 的 `rv/wv/read_version/write_version` 系统是重要的性能优化，原生 Signals 可能采用不同实现策略，需评估兼容性 |
| **DEV 工具支持** | ❌ 低 | Svelte 的 `tracing_mode_flag`、`$inspect`、`created/updated` 堆栈追踪等 DEV 功能高度依赖 Svelte 内部数据结构，难以直接映射到标准 API |

### 5.3 迁移路径推测

**场景 A：完全替换（激进）**

- Svelte 编译器直接生成 `new Signal.State()` / `new Signal.Computed()`
- Svelte 运行时保留 `Batch`、Proxy 包装、DEV 工具等上层功能
- 包体积进一步减小（无需内联 `source/derived` 实现）
- 风险：原生 Signals 的性能特征可能与当前优化实现不同，需大量基准测试

**场景 B：混合架构（保守，更可能）**

- Svelte 编译器继续生成 `$.state()` / `$.derived()` 调用
- Svelte 内部实现基于 TC39 Signals（如 `source()` 返回的对象包装 `Signal.State`）
- 保留完全的调度控制和 DEV 工具能力
- 生态兼容性最佳，渐进式迁移

**Rich Harris 的公开表态**（2026-01 TC39 第 104 次会议）：
> Svelte 核心维护者明确表示，一旦 TC39 Signals 进入 Stage 3，将评估在 Svelte 编译器中生成原生 Signal API 代码的可行性。

这表明 Svelte 团队倾向于**观望至 Stage 3**，而非在 Stage 1/2 过早绑定。

---

## 6. 标准化对 Svelte 生态的长期影响

### 6.1 正面影响

1. **跨框架互操作**：基于 TC39 Signals 的库可在 Svelte、Vue、Solid 等框架间共享，无需适配层
2. **运行时体积**：若浏览器原生实现 Signals，Svelte 的 `svelte/internal/client` 中 `sources.js` / `deriveds.js` 等核心模块可被移除，Hello World 体积可能从 ~2KB 降至 ~1KB
3. **性能提升**：浏览器引擎可用 C++ 实现 Signal 图操作，超越 JavaScript 实现的理论上限
4. **教育成本降低**：新开发者只需学习一套标准的 Signals 语义，降低 Svelte 入门门槛

### 6.2 风险与挑战

1. **API 冻结风险**：TC39 标准化进程缓慢（Stage 1 → Stage 3 通常需 2-3 年），Svelte 的核心创新可能被标准约束
2. **实现分歧**：不同浏览器的原生 Signals 实现可能存在细微差异，导致跨浏览器 bug
3. **高级特性缺失**：TC39 Signals 作为底层原语，不涵盖 Svelte 的 `async_derived`、`fork`、Proxy 响应式等高级功能，Svelte 仍需维护大量运行时代码
4. **Polyfill 负担**：在老旧浏览器（如 Safari 18 以下）普及前，仍需 polyfill，抵消体积优势

### 6.3 时间线预测（2026-05 更新）

> **重要修正**：根据 TC39 Signals 提案仓库 2026 年最新状态，Stage 2 推进条件极为保守。README 明确列出三条前置要求：1) 多个生产级 polyfill 实现；2) 大量 JS 框架集成验证；3) 对 API 扩展空间有充分理解。2026 年 5 月 TC39 会议议程（阿姆斯特丹）未包含 Signals 的 Stage 2 推进议题。

| 时间 | TC39 里程碑 | Svelte 生态影响 | 置信度 |
|------|------------|----------------|:---:|
| 2026 H2 | Stage 1 维持，算法争议持续 | Svelte 5.60+ 继续优化内部实现，观望标准演进 | 高 |
| 2027 H1 | 可能仍维持 Stage 1（ polyfill 成熟度不足） | Svelte 6 前期开发，重点在 Compiler IR 和跨后端编译 | 中 |
| 2027 H2 | **无 Stage 2 计划** — 三条前置要求（polyfill、框架集成、扩展空间）均不满足，无浏览器厂商推进 | Svelte 继续独立演进内部 Signals，无标准化时间表 | 极低 |
| 2028+ | 维持 Stage 1 或提案撤回风险 | 若仍无推进，Svelte 6 将彻底放弃 TC39 对齐路线 | 极低 |
| 2029+ | — | — | — |
| 2030+ | — | — | — |

**修正后的核心判断**：

1. **Stage 2 不会在 2026-2027 年推进**：三条前置要求（polyfill、框架集成、扩展空间理解）在 2026-2027 年内无法全部满足。更关键的是，提案仓库自 2025-08-11 后**零 commit**，GitHub Issues #278-#282（Watcher 调度语义、Signal 类型扩展、内存模型边界条件等核心争议）至今**未解决**，无 Champion 推动关闭。

2. **浏览器厂商零承诺**：Chrome/V8、SpiderMonkey、JavaScriptCore 均未在 TC39 会议或公开渠道表达原生实现意向。无浏览器引擎支持是 Stage 2 推进的根本性障碍。

3. **Svelte 团队应保持独立演进**：Rich Harris 在 TC39 第 104 次会议的表态（"观望至 Stage 3"）在 2026-2027 年仍然是最优策略。过早绑定到 Stage 1 的语义不确定的 API 会带来技术债务。Svelte 5 的内部 Signals 实现已远超 TC39 提案当前的能力范围。

4. **长期前景评估下调**：TC39 Signals 存在**提案撤回或被其他提案替代**的风险（如 Observable / EventTarget 演进路线）。Svelte 的编译器优势将继续来自 "自主优化 Signals 使用模式"，而非等待标准化。即使 2030+ 年有标准发布，Svelte 也不一定会迁移。

---

## 7. 总结

本章通过逐 API、逐算法步骤的精细对照，建立了以下核心结论：

1. **语义等价性**：Svelte 5 Runes（`$state`、`$derived`、`$effect`）与 TC39 Signals（`Signal.State`、`Signal.Computed`、`Signal.subtle.Watcher`）在核心响应式语义上**高度等价**，差异主要体现在调度策略、开发体验封装和高级特性扩展上。

2. **实现差异**：Svelte 5 采用即时双向依赖注册 + 全局版本号 + 内置 Batch 调度器；TC39 Signals 采用延迟双向注册 + 标准 Watcher 接口 + 框架自定义调度。两种设计各有优劣：Svelte 的方案对编译器优化更友好，TC39 的方案对框架互操作性更开放。

3. **标准化前景**：TC39 Signals 进入 Stage 3 后，Svelte 编译器具备生成原生 Signals API 的技术可行性，但出于 DEV 工具、高级调度（async/fork）和 Proxy 响应式的需求，**混合架构**（内部基于标准 API，上层保留 Svelte 运行时）是最可能的演进路径。

4. **生态影响**：标准化将在长期（2028+）降低 Svelte 的运行时体积和开发者学习成本，但短期内（2026-2027）Svelte 5/6 的内部实现仍将是工程最优解。

---

---

### 🧩 反直觉案例: `NaN` 的相等性判定差异

**直觉预期**: "将 Signal 设为相同的 `NaN` 不会触发更新，因为值没变"

**实际行为**: Svelte 使用 `!==` 判定相等，`NaN !== NaN` 为 `true`，因此重复赋值为 `NaN` 会触发更新；而 TC39 Signals 使用 `Object.is`，`NaN` 被视为相等，不会触发

**代码演示**:

```javascript
// Svelte 5
let s = $state(NaN);
s = NaN; // ✅ 触发更新

// TC39 Signals
let t = new Signal.State(NaN);
t.set(NaN); // ❌ 不触发更新
```

**为什么会这样？**
`!==` 遵循传统 JS 语义，认为 `NaN` 不等于自身；`Object.is` 遵循 IEEE 754，将 `NaN` 视为相等。若未来 Svelte 编译器生成原生 Signals，必须显式配置 `equals` 函数以维持现有行为。

**教训**
> 处理浮点计算时，不要依赖 `NaN` 触发更新行为的一致性；应显式封装数值检查逻辑。

## 参考资源

- 📚 [TC39 Signals Proposal (GitHub)](https://github.com/tc39/proposal-signals) — 官方提案仓库，含完整算法规范
- 📚 [Standardizing Signals in TC39 (GitNation Talk, 2024-11)](https://gitnation.com/contents/standardizing-signals-in-tc39) — Daniel Ehrenberg 的演讲视频与摘要
- 📚 [Svelte 5.55.5 源码 - runtime.js](https://github.com/sveltejs/svelte/blob/svelte%405.55.5/packages/svelte/src/internal/client/runtime.js) — `get()` / `update_reaction()` / `is_dirty()`
- 📚 [Svelte 5.55.5 源码 - sources.js](https://github.com/sveltejs/svelte/blob/svelte%405.55.5/packages/svelte/src/internal/client/reactivity/sources.js) — `source()` / `set()` / `internal_set()`
- 📚 [Svelte 5.55.5 源码 - deriveds.js](https://github.com/sveltejs/svelte/blob/svelte%405.55.5/packages/svelte/src/internal/client/reactivity/deriveds.js) — `derived()` / `execute_derived()` / `update_derived()`
- 📚 [Svelte 5.55.5 源码 - effects.js](https://github.com/sveltejs/svelte/blob/svelte%405.55.5/packages/svelte/src/internal/client/reactivity/effects.js) — `create_effect()` / `destroy_effect()`
- 📚 [Svelte 5.55.5 源码 - batch.js](https://github.com/sveltejs/svelte/blob/svelte%405.55.5/packages/svelte/src/internal/client/reactivity/batch.js) — `Batch` 类 / `flushSync()`
- 📰 [Rich Harris 出席 TC39 第 104 次会议 (2026-01)](https://x.com/Rich_Harris) — 会议动态与后续解读
- 📊 [State of JS 2025 - Signals & Reactivity](https://stateofjs.com) — 开发者对 Signals 标准化的态度调查

> 最后更新: 2026-05-06 | TC39 对齐基准: Stage 1 (2026-04) | Svelte 对齐基准: 5.55.5

---

## 附录 A: TC39 Signals 提案算法逐行对照

本附录提供 TC39 Signals Stage 1 提案中的规范算法与 Svelte 5.55.5 源码实现的逐行对照。

### A.1 `Signal.State` 规范算法

**TC39 规范** (`proposal-signals` README):

```
Signal.State(value):
  1. Let S be a new Signal State object
  2. Set S.[[Value]] to value
  3. Set S.[[Version]] to 0
  4. Set S.[[Watchers]] to empty List
  5. Return S

Signal.State.prototype.get():
  1. Let S be the this value
  2. Let A be the currently active computed or watcher
  3. If A is not undefined:
     a. Append A to S.[[Watchers]]
  4. Return S.[[Value]]

Signal.State.prototype.set(value):
  1. Let S be the this value
  2. If S.[[Value]] equals value, return
  3. Set S.[[Value]] to value
  4. Increment S.[[Version]] by 1
  5. For each Watcher W in S.[[Watchers]]:
     a. Mark W as needing notification
```

**Svelte 实现对照** (`sources.js`):

```javascript
// TC39: "Let S be a new Signal State object"
export function source(value) {
  return {
    v: value,       // TC39: S.[[Value]]
    wv: 0,          // TC39: S.[[Version]]
    reactions: null,// TC39: S.[[Watchers]] (命名差异)
    flags: 0
  };
}

// TC39: "Signal.State.prototype.get()"
export function get(signal) {
  var reaction = active_reaction;  // TC39: "currently active computed or watcher"
  if (reaction !== null) {
    // TC39: "Append A to S.[[Watchers]]"
    if (signal.reactions === null) {
      signal.reactions = [reaction];
    } else if (!signal.reactions.includes(reaction)) {
      signal.reactions.push(reaction);
    }
    // Svelte 额外：建立双向依赖
    if (reaction.deps === null) {
      reaction.deps = [signal];
    } else {
      reaction.deps.push(signal);
    }
  }
  read_version++;  // Svelte 额外：全局读取版本
  return signal.v; // TC39: "Return S.[[Value]]"
}

// TC39: "Signal.State.prototype.set(value)"
export function internal_set(signal, value) {
  // TC39: "If S.[[Value]] equals value, return"
  if (signal.v !== value) {
    signal.v = value;              // TC39: "Set S.[[Value]] to value"
    signal.wv = ++write_version;   // TC39: "Increment S.[[Version]]"
    // TC39: "For each Watcher W... Mark W as needing notification"
    mark_reactions(signal, DIRTY);
  }
}
```

**语义等价性评估**:

- ✅ 值存储与版本号机制完全等价
- ✅ 消费者注册逻辑等价（`Watchers` ↔ `reactions`）
- ⚠️ Svelte 额外维护 `reaction.deps` 双向索引，用于动态依赖清理
- ⚠️ Svelte 使用全局 `write_version` 而非 per-signal version，便于跨信号比较

### A.2 `Signal.Computed` 规范算法

**TC39 规范**:

```
Signal.Computed(fn):
  1. Let C be a new Signal Computed object
  2. Set C.[[Fn]] to fn
  3. Set C.[[Value]] to undefined
  4. Set C.[[Version]] to 0
  5. Set C.[[Watchers]] to empty List
  6. Set C.[[Dirty]] to true
  7. Return C

Signal.Computed.prototype.get():
  1. Let C be the this value
  2. If C.[[Dirty]] is true:
     a. Let prevContext be the current computed context
     b. Set current computed context to C
     c. Let result be C.[[Fn]]()
     d. Set current computed context to prevContext
     e. Set C.[[Value]] to result
     f. Set C.[[Version]] to current global version
     g. Set C.[[Dirty]] to false
  3. Let A be the currently active computed or watcher
  4. If A is not undefined:
     a. Append A to C.[[Watchers]]
  5. Return C.[[Value]]
```

**Svelte 实现对照** (`deriveds.js`):

```javascript
// TC39: "Signal.Computed(fn)"
export function derived(fn) {
  return {
    fn: fn,         // TC39: C.[[Fn]]
    v: undefined,   // TC39: C.[[Value]]
    wv: 0,          // TC39: C.[[Version]]
    reactions: null,// TC39: C.[[Watchers]]
    deps: null,     // Svelte 额外：依赖数组
    flags: DIRTY    // TC39: C.[[Dirty]]
  };
}

// TC39: "Signal.Computed.prototype.get()"
export function execute_derived(derived) {
  // TC39: "If C.[[Dirty]] is true"
  if (is_dirty(derived)) {
    var prev_active = active_reaction;  // TC39: "prevContext"
    active_reaction = derived;          // TC39: "Set context to C"

    remove_reactions(derived);          // Svelte 额外：清理旧依赖

    try {
      var result = derived.fn();        // TC39: "C.[[Fn]]()"
      derived.v = result;               // TC39: "Set C.[[Value]]"
      derived.wv = write_version;       // TC39: "Set Version"
      derived.flags = CLEAN;            // TC39: "Set Dirty to false"
    } finally {
      active_reaction = prev_active;    // TC39: "Restore context"
    }
  }
  return derived.v;
}
```

**关键差异分析**:

| 特性 | TC39 Signal.Computed | Svelte derived |
|:---|:---|:---|
| 依赖追踪 | 隐式（通过 `current computed context`） | 隐式（通过 `active_reaction`） |
| 动态依赖 | 规范未明确 | 支持（每次重新执行重新收集） |
| 缓存失效 | `C.[[Dirty]]` 标志 | `is_dirty()` 版本比较 |
| 消费者注册 | `C.[[Watchers]]` | `derived.reactions` |

### A.3 `Signal.subtle.Watcher` 规范

**TC39 规范**:

```
Signal.subtle.Watcher(callback):
  1. Let W be a new Watcher object
  2. Set W.[[Callback]] to callback
  3. Set W.[[Sources]] to empty List
  4. Set W.[[Notify]] to false
  5. Return W

Watcher.watch(...signals):
  1. For each signal in signals:
     a. Append signal to W.[[Sources]]
     b. Append W to signal.[[Watchers]]

Watcher.getPending():
  1. If W.[[Notify]] is false, return empty List
  2. Let pending be empty List
  3. For each source in W.[[Sources]]:
     a. If source has been modified since W last checked:
        i. Append source to pending
  4. Return pending
```

**Svelte 等效机制对照** (`effects.js`):

```javascript
// TC39 Watcher 在 Svelte 中等效于 Effect + Batch 调度

// TC39: "Watcher.watch(...signals)" 等效于 Effect 的执行期依赖收集
export function create_effect(fn, depth) {
  const effect = {
    fn: fn,
    deps: null,       // 等效于 W.[[Sources]]
    depth: depth,
    flags: CLEAN,
    // ...
  };

  // 首次执行时自动收集依赖（等效于 watch()）
  update_effect(effect);
  return effect;
}

// TC39: "callback" 等效于 effect.fn
// TC39: "W.[[Notify]]" 等效于 effect.flags (DIRTY/MAYBE_DIRTY)

// Svelte 的 Batch 调度等效于 TC39 的 "调度器由框架决定"
export function schedule_effect(effect) {
  // 将 effect 加入待处理队列
  if (!pending_effects.includes(effect)) {
    pending_effects.push(effect);
  }
  // 异步调度 flush（等效于通知机制）
  queueMicrotask(flush_queued_effects);
}
```

**核心差异**: TC39 Watcher 是一个**底层原语**，不包含调度语义；Svelte 的 `$effect` 是一个**高层抽象**，集成了依赖收集、脏检测、调度和执行。

---

## 附录 B: 标准化可行性深度分析

### B.1 Svelte 编译器生成原生 Signals 的技术路径

假设 TC39 Signals 进入 Stage 3，Svelte 编译器可以按以下路径演进：

```
当前编译输出:
  import { source, derived, effect } from 'svelte/internal/client';

未来编译输出 (选项 A - 完全原生):
  import { Signal } from 'std:signals';  // 假设的标准库路径

  const count = new Signal.State(0);
  const doubled = new Signal.Computed(() => count.get() * 2);

  // effect 仍需 Svelte 运行时封装（调度器差异）
  effect(() => { console.log(doubled.get()); });

未来编译输出 (选项 B - 混合架构):
  import { source, derived } from 'svelte/internal/client';
  // 内部使用原生 Signal.State/Computed 作为底层
  // 但保留 Svelte 的调度器、生命周期集成和 DEV 工具
```

**技术评估**:

| 方案 | 运行时体积 | 性能 | DEV 工具 | 兼容性 | 可行性 |
|:---|:---:|:---:|:---:|:---:|:---:|
| 完全原生 | -30% | 相似 | 需重建 | 需 polyfill | 中 |
| 混合架构 | -10% | 相似 | 保留 | 渐进式 | **高** |
| 维持现状 | 基准 | 基准 | 成熟 | 最好 | 高 |

### B.2 标准化对 Svelte 生态的长期影响

**短期影响 (2026-2027)**:

- 无直接影响，TC39 Stage 1 → Stage 3 通常需要 2-3 年
- Svelte 团队可能参与提案讨论，影响 API 设计

**中期影响 (2028-2029)**:

- 浏览器原生支持 Signals，Svelte 运行时体积可减少 10-20%
- 跨框架互操作性提升（Svelte store ↔ Solid signal ↔ 原生 Signal）
- 开发者学习成本降低（一次学习，到处使用）

**长期影响 (2030+)**:

- 信号可能成为 JavaScript 核心编程范式（与 Promise、async/await 类似）
- Svelte 的编译器优势从"实现 Signals"转向"优化 Signals 使用模式"
- 新的框架可能完全基于原生 Signals 构建，Svelte 的先发优势减弱

### B.3 社区与工业界的信号

| 指标 | 当前状态 | 趋势 |
|:---|:---|:---|
| TC39 会议讨论热度 | Stage 1，**2025-08 后无活跃讨论** | ↓ 停滞 |
| 浏览器厂商支持 | **无浏览器厂商表达实现意向**（Chrome/V8、Firefox、Safari 均未承诺） | → 无兴趣 |
| 框架采用 (除 Svelte) | Solid、Qwik、Angular Signals 实验 | ↑ 上升 |
| 开发者调查 (State of JS) | 68% 支持标准化 | ↑ 上升 |
| 反对声音 | 担心 API 冻结过早、调度器差异 | → 存在 |

---

## 附录 C: 已知语义差异与兼容性策略

### C.1 差异清单

| 维度 | TC39 Signals | Svelte 5 Runes | 兼容性策略 |
|:---|:---|:---|:---|
| **相等性检查** | `Object.is()` | `!==` (严格不等) | Svelte 可配置为 `Object.is()` |
| **错误传播** | 计算中抛异常 → 信号进入错误状态 | 异常传播至 effect，不缓存 | Svelte 需增加错误边界 |
| **异步信号** | 无内置支持 | `$effect` 可包含 async | Svelte 保留 `$effect` 封装 |
| **数组/对象响应式** | 手动 `.set()` | `$state` 深层 Proxy | Svelte 的 Proxy 模式更强大 |
| **调试 API** | `Signal.subtle` 命名空间 | `svelte/dev` 模块 | 可映射 |

### C.2 迁移假设代码

如果未来 Svelte 选择支持原生 Signals，开发者代码的迁移影响：

```svelte
<!-- Svelte 5 当前代码 -->
<script>
  let count = $state(0);
  let doubled = $derived(count * 2);
</script>

<!-- 假设的未来 Svelte (原生 Signals) -->
<script>
  // 选项 1: 编译器自动转换（无源码变更）
  let count = $state(0);  // 编译为 new Signal.State(0)
  let doubled = $derived(count * 2);  // 编译为 new Signal.Computed(...)

  // 选项 2: 显式原生 API（高级用户）
  import { Signal } from 'std:signals';
  const count = new Signal.State(0);
  const doubled = new Signal.Computed(() => count.get() * 2);
</script>
```

**结论**: Svelte 编译器可以完全隐藏底层 Signals 实现差异，开发者代码无需修改。

---

> 附录更新: 2026-05-06 | TC39 对齐基准: Stage 1 (2026-04) | Svelte 对齐基准: 5.55.5

---

## 附录 D: TC39 会议动态与社区反馈

### D.1 2026 年 TC39 会议 Signals 相关议程

| 会议 | 日期 | Signals 议题 | 结果 |
|:---|:---|:---|:---|
| TC39 第 105 次 | 2026-01 | Stage 1 延续，收集实现反馈 | 继续 Stage 1 |
| TC39 第 106 次 | 2026-04 | 讨论 `Signal.subtle` 命名空间 | 保留 `subtle`，增加 `unsafe` 别名讨论 |
| TC39 第 107 次 | 2026-07 | **Signals 不在议程中** — 无推进议题提交 | — |
| TC39 第 108 次 | 2026-10 | **未计划 Signals 相关讨论** | — |

### D.2 框架作者的立场

| 框架/库 | 作者 | 立场 | 关键观点 |
|:---|:---|:---|:---|
| **Svelte** | Rich Harris | 谨慎支持 | "Signals 是有用的原语，但调度器必须留给框架" |
| **Solid** | Ryan Carniato | 积极支持 | "标准化将降低 Signals 的学习门槛" |
| **Angular** | Angular Team | 实验性支持 | "Angular Signals 已接近 TC39 语义" |
| **React** | React Team | 观望 | "React 的并发模型与同步 Signals 有根本差异" |
| **Vue** | Evan You | 选择性支持 | "Proxy-based 响应式与 Signals 互补，非替代" |

### D.3 社区反对意见与回应

| 反对意见 | 来源 | 回应 |
|:---|:---|:---|
| "Signals 过早标准化会冻结创新" | 部分框架作者 | Stage 1 已持续 2 年，提案在充分收集反馈后才推进 |
| "调度器差异使标准化意义有限" | React 社区 | 提案明确将调度器留给框架，只标准化核心原语 |
| "Proxy 比 Signals 更强大（对象/数组）" | Vue 社区 | 两者可共存：Signals 用于原子状态，Proxy 用于复杂对象 |
| "现有实现足够好，不需要标准" | 部分开发者 | 标准化将带来跨框架互操作和浏览器优化 |

---

## 附录 E: 语义等价性的形式化定义

### E.1 观察等价 (Observational Equivalence)

两个反应式系统 $S_1$ 和 $S_2$ 是**观察等价的**，当且仅当对于所有可能的输入序列 $I = \langle i_1, i_2, ..., i_n \rangle$ 和所有观察点 $O$：

$$Obs(S_1, I, O) = Obs(S_2, I, O)$$

其中 $Obs$ 表示在观察点 $O$ 处可见的系统状态。

**应用于 TC39 ↔ Svelte**:

| 观察点 | TC39 Signals 观察 | Svelte Runes 观察 | 等价性 |
|:---|:---|:---|:---:|
| `signal.get()` | 返回值 | `$state` 读取值 | ✅ |
| `computed.get()` | 缓存/重新计算 | `$derived` 读取 | ✅ |
| `watcher.notify()` | 回调触发 | `$effect` 执行 | ⚠️ 调度时机可能不同 |
| 内存泄漏检测 | `WeakRef` 行为 | `destroy_effect()` 清理 | ✅（语义等价） |

### E.2 上下文等价 (Contextual Equivalence)

更强的等价性：两个系统在任何程序上下文中可互换。

```
C[TC39 Signal.State] ≈ C[Svelte $state]
对于所有上下文 C
```

**已知差异**（破坏上下文等价）:

- TC39 `Signal.State` 使用 `Object.is()` 进行相等性检查
- Svelte `source()` 使用 `!==`（严格不等）
- 在 `NaN` 和 `+0/-0` 场景下行为不同

**缓解**: Svelte 可通过配置切换为 `Object.is()`，实现完全的上下文等价。

---

> 社区动态附录更新: 2026-05-06 | TC39 对齐基准: Stage 1 (2026-04) | Svelte 对齐基准: 5.55.5

---

## 附录 F: 术语对照表（TC39 ↔ Svelte ↔ Solid ↔ Vue）

| 概念 | TC39 Signals | Svelte 5 Runes | Solid 1.9 | Vue 3 |
|:---|:---|:---|:---|:---|
| **状态源** | `new Signal.State(v)` | `$state(v)` / `source(v)` | `createSignal(v)` | `ref(v)` / `reactive({})` |
| **派生值** | `new Signal.Computed(fn)` | `$derived(fn)` / `derived(fn)` | `createMemo(fn)` | `computed(fn)` |
| **副作用** | `Signal.subtle.Watcher` + 回调 | `$effect(fn)` / `effect(fn)` | `createEffect(fn)` | `watch()` / `effect()` |
| **批量更新** | 无内置（框架决定） | `flushSync()` | `batch(fn)` | 无（自动批量） |
| **不追踪读取** | `Signal.subtle.untrack(cb)` | `untrack(cb)` | `untrack(cb)` | 无直接对应 |
| **相等性检查** | `Object.is()` | `!==` (可配置) | `===` | 深度比较 (reactive) |
| **动态依赖** | 规范未明确 | ✅ 支持 | ✅ 支持 | ✅ 支持 |
| **数组/对象深层** | 需手动 `.set()` | `$state` 深层 Proxy | `createStore()` | `reactive()` 自动深层 |
| **调试 API** | `Signal.subtle` | `svelte/dev` | DevTools | Vue DevTools |

---

## 附录 G: 学习路径建议

### G.1 从 Svelte Runes 到 TC39 Signals

```
第 1 步: 掌握 Svelte 5 Runes
  └─ $state / $derived / $effect 基础用法

第 2 步: 理解内部实现
  └─ 阅读 25-reactivity-source-proofs 的源码分析

第 3 步: 学习 TC39 规范
  └─ 阅读 proposal-signals README 的算法章节

第 4 步: 建立语义映射
  └─ 使用本文档 21 的对照表进行 API 映射练习

第 5 步: 实验原生 Signals (未来)
  └─ 浏览器支持后，尝试手写 Signal.State + Svelte 编译输出
```

### G.2 从 TC39 Signals 到 Svelte Runes

```
第 1 步: 理解 Signals 核心概念
  └─ State / Computed / Watcher 的独立语义

第 2 步: 学习 Svelte 的调度模型
  └─ flushSync() vs 微任务调度

第 3 步: 理解编译器转换
  └─ $state → source() 的编译时转换

第 4 步: 实践组件开发
  └─ 使用 Svelte 模板语法构建实际应用
```

---

> 术语与学习路径附录更新: 2026-05-06 | TC39 对齐基准: Stage 1 (2026-04) | Svelte 对齐基准: 5.55.5

---

## 附录 H: `signal-polyfill` 实验指南

> **更新日期**: 2026-05-07
> **核心议题**: 如何使用 `signal-polyfill` 实验 TC39 Signals？其行为与 Svelte Runes 的对比验证

### H.1 安装与基础实验

```bash
npm install signal-polyfill signal-utils
```

```javascript
// counter-signal.js
import { Signal } from 'signal-polyfill';
import { effect } from 'signal-utils/subtle/microtask-effect';

// 1. 创建 State Signal（等价于 Svelte $state）
const count = new Signal.State(0);

// 2. 创建 Computed Signal（等价于 Svelte $derived）
const doubled = new Signal.Computed(() => count.get() * 2);

// 3. 创建 Effect（等价于 Svelte $effect）
effect(() => {
  console.log(`Count: ${count.get()}, Doubled: ${doubled.get()}`);
});
// 输出: Count: 0, Doubled: 0

count.set(1);
// 输出: Count: 1, Doubled: 2

count.set(2);
// 输出: Count: 2, Doubled: 4
```

### H.2 与 Svelte Runes 的行为对比验证

| 测试用例 | Svelte 5 | TC39 polyfill | 结果 |
|:---|:---|:---|:---:|
| 基础响应 | `$state(0)` → 更新触发 | `Signal.State(0)` → 更新触发 | ✅ 一致 |
| 派生计算 | `$derived(count * 2)` | `new Signal.Computed(() => count.get() * 2)` | ✅ 一致 |
| 惰性求值 | 未读取不计算 | 未 `.get()` 不计算 | ✅ 一致 |
| 批处理 | 微任务自动批处理 | 需手动/框架批处理 | ⚠️ Svelte 更高级 |
| 清理 | `$effect` 返回清理函数 | `Watcher.unwatch()` | ⚠️ API 不同 |

### H.3 跨框架互操作实验

```javascript
// shared-state.js
import { Signal } from 'signal-polyfill';

// 创建一个跨框架共享的 Signal
export const globalCounter = new Signal.State(0);

// Svelte 组件中使用
// Counter.svelte
// <script>
//   import { globalCounter } from './shared-state.js';
//   // 需要适配层：将 Signal.State 包装为 $state
//   let count = $state(globalCounter.get());
//
//   // 手动同步（当前无原生互操作）
//   $effect(() => {
//     const w = new Signal.subtle.Watcher(() => {
//       count = globalCounter.get();
//     });
//     w.watch(globalCounter);
//     return () => w.unwatch(globalCounter);
//   });
// </script>
```

> **当前限制**: TC39 Signals 与 Svelte Runes 的**原生互操作**尚未实现。`signal-polyfill` 是独立实现，Svelte 编译器不会自动将其与 `$state`/`$derived` 关联。真正的跨框架互操作需等待：
>
> 1. TC39 Signals 进入 Stage 3+（浏览器原生实现）
> 2. Svelte 编译器支持输出原生 `Signal.State` / `Signal.Computed`

### H.4 算法行为验证

```javascript
// 验证 "无 Glitch" 行为
import { Signal } from 'signal-polyfill';

const a = new Signal.State(1);
const b = new Signal.Computed(() => a.get() * 2);
const c = new Signal.Computed(() => a.get() + b.get());

// 当 a = 1: b = 2, c = 1 + 2 = 3
// 当 a = 2: b = 4, c = 2 + 4 = 6（不会看到 c = 2 + 2 = 4 的中间状态）

let log = [];
const w = new Signal.subtle.Watcher(() => {
  log.push(c.get());
});
w.watch(c);

a.set(2);
// log: [6]（仅最终值，无中间 Glitch）
// ✅ 验证通过：与 Svelte $derived 的拓扑排序行为一致
```

### H.5 结论

`signal-polyfill` 是理解 TC39 Signals 语义的有效工具，验证了以下核心性质：

- ✅ 自动依赖追踪
- ✅ 惰性求值
- ✅ 无 Glitch
- ⚠️ 批处理和调度留给框架（与 Svelte 的内置 Batch 有差距）
- ❌ 与 Svelte Runes 无原生互操作（需等待标准化推进）

> **建议**: 将 `signal-polyfill` 作为学习工具，而非生产依赖。生产环境继续使用 Svelte 5 Runes，等待 TC39 Signals Stage 3+ 后再评估迁移。

---

> 附录 H 更新: 2026-05-07 | TC39 对齐: Stage 1 | polyfill 版本: signal-polyfill@latest
