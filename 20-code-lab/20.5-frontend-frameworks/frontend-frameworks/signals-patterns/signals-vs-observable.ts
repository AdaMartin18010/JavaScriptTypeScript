// @ts-nocheck

/**
 * # Signals vs Observable：响应式范式的双生子
 *
 * Signals 和 Observable（RxJS）不是竞争关系，而是互补关系。
 * 理解它们的差异和适用场景，是高级前端架构师的必备能力。
 *
 * | 维度 | Signals | Observable (RxJS) |
 * |------|---------|-------------------|
 * | 核心抽象 | 同步值容器 | 异步事件流 |
 * | 时间维度 | 当前值（快照） | 时间序列（历史+未来） |
 * | 推送/拉取 | 拉取（读取时计算） | 推送（订阅后被动接收） |
 * | 多播 | 自动（所有订阅者共享值） | 需配置（share/shareReplay） |
 * | 操作符 | 无（简单直接） | 丰富（map/filter/merge 等） |
 * | 取消订阅 | 自动（computed/effect 自动清理） | 手动（需 unsubscribe） |
 * | 错误处理 | 无内置机制 | 完整的错误传播机制 |
 * | 适用场景 | UI 状态、派生计算 | 异步流、事件处理、复杂编排 |
 */

import {
  createSignal,
  createComputed,
  createEffect,
} from "./core-signal.js";

// ============================================
// 1. 核心差异：值 vs 流
// ============================================

/**
 * Signal 是「值的快照」：
 * - 当前有一个值
 * - 读取时获取当前值
 * - 变化时通知订阅者
 *
 * Observable 是「时间的函数」：
 * - 一个可能产生多个值序列的源
 * - 订阅后被动接收所有值（包括未来的）
 * - 可以操作、转换、组合多个流
 */

export function demonstrateValueVsStream(): void {
  console.log("=== 核心差异: 值 vs 流 ===\n");

  // Signal：只有一个当前值
  const count = createSignal(0);
  console.log("Signal 当前值:", count.get()); // 0
  count.set(1);
  console.log("Signal 当前值:", count.get()); // 1
  console.log("Signal 无法获取历史值（除非手动存储）");

  // Observable：时间序列
  console.log("\nObservable 时间序列:");
  console.log("  t=0ms: ---0---1---2---3---|>");
  console.log("  订阅者接收所有值，包括历史（若使用 Replay）");
  console.log("  可以对流进行 map/filter/debounce 等操作");
}

// ============================================
// 2. 拉取 vs 推送
// ============================================

/**
 * Signal 是「拉取」模型：
 * - computed Signal 在被读取时才计算
 * - 惰性求值：如果没有人读取，计算不会发生
 *
 * Observable 是「推送」模型：
 * - 一旦订阅，值会主动推送给订阅者
 * - 无论是否使用，流都在运行
 */

export function demonstratePullVsPush(): void {
  console.log("\n=== 拉取 vs 推送 ===\n");

  // Signal：拉取模型（惰性求值）
  const a = createSignal(1);
  const b = createSignal(2);
  const sum = createComputed(() => {
    console.log("  [computed] 重新计算 sum");
    return a.get() + b.get();
  });

  console.log("Signal 惰性求值:");
  a.set(10); // 不触发计算
  b.set(20); // 不触发计算
  console.log("  修改 a 和 b，但 sum 未重新计算（无人读取）");
  console.log("  读取 sum:", sum.get()); // 此时才计算：30
  console.log("  再次读取 sum:", sum.get()); // 30（直接返回缓存）

  // Observable：推送模型
  console.log("\nObservable 推送模型:");
  console.log("  subject.next(10) → 所有订阅者立即收到 10");
  console.log("  subject.next(20) → 所有订阅者立即收到 20");
  console.log("  无论订阅者是否使用值，流都在推送");
}

// ============================================
// 3. 互操作模式
// ============================================

/**
 * 在实际项目中，Signals 和 Observable 经常需要互操作。
 *
 * Angular 的模式（最佳实践）：
 * - Signals：组件级同步状态
 * - RxJS：服务层异步流、HTTP 请求、跨组件通信
 * - toSignal() / toObservable()：桥接两者
 *
 * React 的模式：
 * - Signals / useState：本地 UI 状态
 * - RxJS / TanStack Query：服务端状态
 * - useObservable() Hook：在组件中消费 Observable
 */

/**
 * 将 Signal 转换为 Observable（推送模型）。
 * Signal 变化时，通过 Observable 推送给所有订阅者。
 */
export function signalToObservable<T>(
  signal: { get: () => T }
): {
  subscribe: (observer: {
    next: (value: T) => void;
    error?: (err: any) => void;
    complete?: () => void;
  }) => { unsubscribe: () => void };
} {
  return {
    subscribe: (observer) => {
      let lastValue: T;

      // 使用 Effect 监听 Signal 变化
      const check = () => {
        const currentValue = signal.get();
        if (!Object.is(currentValue, lastValue)) {
          lastValue = currentValue;
          observer.next(currentValue);
        }
      };

      // 创建定时检查（简化实现）
      const interval = setInterval(check, 16); // 约 60fps

      // 立即推送初始值
      check();

      return {
        unsubscribe: () => clearInterval(interval),
      };
    },
  };
}

/**
 * 将 Observable 转换为 Signal（拉取模型）。
 * 订阅 Observable，将其最新值同步到 Signal。
 */
export function observableToSignal<T>(
  observable: {
    subscribe: (observer: {
      next: (value: T) => void;
      error?: (err: any) => void;
    }) => { unsubscribe: () => void };
  },
  initialValue: T
): { get: () => T } {
  const signal = createSignal(initialValue);

  const subscription = observable.subscribe({
    next: (value) => signal.set(value),
    error: (err) => console.error("observableToSignal error:", err),
  });

  // 返回 getter，附加 unsubscribe
  const getter = () => signal.get();
  (getter as any).unsubscribe = () => subscription.unsubscribe();
  return getter as unknown as { get: () => T; unsubscribe: () => void };
}

// ============================================
// 4. 选型决策指南
// ============================================

/**
 * 根据问题特征选择 Signals 或 Observable：
 *
 * 使用 Signals 的场景：
 * ✅ UI 组件的本地状态（计数器、输入框、开关）
 * ✅ 派生计算（筛选、排序、统计）
 * ✅ 需要惰性求值的场景（昂贵的计算只在需要时执行）
 * ✅ 简单的一对一依赖关系
 *
 * 使用 Observable 的场景：
 * ✅ HTTP 请求和响应处理
 * ✅ WebSocket 实时数据流
 * ✅ 用户输入的防抖/节流（debounce/throttle）
 * ✅ 复杂的异步编排（并行请求、竞态处理、重试逻辑）
 * ✅ 跨组件/跨服务的发布-订阅通信
 * ✅ 需要操作历史（undo/redo、时间旅行调试）
 *
 * 混合使用的场景：
 * 🔄 表单提交：Signals 管表单状态，Observable 管提交请求
 * 🔄 搜索框：Signals 管输入值，Observable 管防抖后的搜索请求
 * 🔄 购物车：Signals 管商品列表，Observable 管结算流程
 */

export function demonstrateSelectionGuide(): void {
  console.log("\n=== 选型决策指南 ===\n");

  console.log("使用 Signals:");
  console.log("  ✅ UI 组件本地状态（计数器、输入框）");
  console.log("  ✅ 派生计算（筛选、排序、统计）");
  console.log("  ✅ 需要惰性求值的昂贵计算");
  console.log("  ✅ 简单的一对一依赖关系");

  console.log("\n使用 Observable (RxJS):");
  console.log("  ✅ HTTP 请求和响应处理");
  console.log("  ✅ WebSocket 实时数据流");
  console.log("  ✅ 用户输入的防抖/节流");
  console.log("  ✅ 复杂的异步编排（并行、竞态、重试）");
  console.log("  ✅ 跨组件/跨服务的发布-订阅通信");

  console.log("\n混合使用（最佳实践）:");
  console.log("  🔄 搜索框: Signals 管输入值 → Observable 管防抖搜索");
  console.log("  🔄 购物车: Signals 管商品列表 → Observable 管结算请求");
  console.log("  🔄 实时看板: Observable 管 WebSocket 流 → Signals 管 UI 状态");
}

// ============================================
// 5. 常见反模式
// ============================================

/**
 * 反模式 1：用 Signals 实现复杂的异步流
 *
 * ❌ 错误：
 * const loading = createSignal(false);
 * const data = createSignal(null);
 * const error = createSignal(null);
 * // 手动处理 loading/data/error 的状态机...
 *
 * ✅ 正确：
 * const request$ = fetchData().pipe(
 *   map(data => ({ loading: false, data, error: null })),
 *   catchError(err => of({ loading: false, data: null, error: err })),
 *   startWith({ loading: true, data: null, error: null })
 * );
 */

/**
 * 反模式 2：用 Observable 管理简单的本地状态
 *
 * ❌ 错误：
 * const count$ = new BehaviorSubject(0);
 * const doubled$ = count$.pipe(map(c => c * 2));
 * // 过度设计，引入了不必要的复杂度
 *
 * ✅ 正确：
 * const count = createSignal(0);
 * const doubled = createComputed(() => count.get() * 2);
 */

/**
 * 反模式 3：在 Signals 中手动管理订阅
 *
 * ❌ 错误：
 * const subscription = observable.subscribe(value => {
 *   signal.set(value);
 * });
 * // 忘记 unsubscribe → 内存泄漏
 *
 * ✅ 正确：
 * const signal = observableToSignal(observable, initialValue);
 * // 自动管理订阅生命周期
 */

export function demonstrateAntiPatterns(): void {
  console.log("\n=== 常见反模式 ===\n");

  console.log("反模式 1: 用 Signals 实现复杂异步流");
  console.log("  ❌ 手动管理 loading/data/error 状态机");
  console.log("  ✅ 使用 Observable + 操作符自动处理状态转换");

  console.log("\n反模式 2: 用 Observable 管理简单本地状态");
  console.log("  ❌ BehaviorSubject + pipe(map) 过度设计");
  console.log("  ✅ Signal + computed 简单直接");

  console.log("\n反模式 3: 忘记取消 Observable 订阅");
  console.log("  ❌ 手动 subscribe 后忘记 unsubscribe");
  console.log("  ✅ 使用 observableToSignal 自动管理生命周期");
}

// ============================================
// 6. 统一响应式层的设计
// ============================================

/**
 * 在大型应用中，推荐设计一个统一的响应式层：
 *
 * ```
 * 应用架构:
 * ┌─────────────────────────────────────┐
 * │  UI 层 (React/Vue/Svelte)           │
 * │  - 使用 Signals 管理本地状态         │
 * │  - 直接绑定到 DOM                   │
 * └──────────────┬──────────────────────┘
 *                │
 * ┌──────────────▼──────────────────────┐
 * │  状态层 (Store)                     │
 * │  - 全局状态使用 Signals             │
 * │  - 派生计算使用 computed            │
 * └──────────────┬──────────────────────┘
 *                │
 * ┌──────────────▼──────────────────────┐
 * │  服务层 (Service)                   │
 * │  - HTTP/WebSocket 使用 Observable   │
 * │  - 复杂异步编排使用 RxJS 操作符     │
 * │  - 通过 toSignal 桥接到状态层        │
 * └─────────────────────────────────────┘
 * ```
 */

export function demonstrateUnifiedReactiveLayer(): void {
  console.log("\n=== 统一响应式层设计 ===\n");

  console.log("推荐架构:");
  console.log("  UI 层    → Signals (本地状态 + 直接 DOM 绑定)");
  console.log("  状态层   → Signals (全局状态 + 派生计算)");
  console.log("  服务层   → Observable (HTTP/WebSocket + 复杂编排)");
  console.log("  桥接     → toSignal / toObservable");

  console.log("\n优势:");
  console.log("  • 各层使用最适合的抽象");
  console.log("  • 清晰的职责分离");
  console.log("  • 可测试性强");
  console.log("  • 团队可按能力渐进采纳");
}
