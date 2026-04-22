/**
 * # Signals 模式模块入口
 *
 * 本模块系统性地覆盖 Signals 范式的各个方面：
 * - 核心实现原理（依赖追踪、惰性求值、细粒度订阅）
 * - SolidJS 风格的信号（细粒度响应式标杆）
 * - Preact Signals（React 生态的 Signals 补丁）
 * - Angular Signals（企业级框架的官方支持）
 * - Svelte 5 Runes（显式响应式）
 * - Signals vs Hooks（选型指南）
 * - Signals vs Observable（与 RxJS 的互补关系）
 */

// 核心 Signal 系统
export {
  Signal,
  Computation,
  createSignal,
  createComputed,
  createEffect,
  batch,
  untracked,
  createReadonlySignal,
} from "./core-signal.js";

// SolidJS 风格
export {
  createSignal as createSolidSignal,
  createMemo,
  createEffect as createSolidEffect,
  createResource,
  createSelector,
  createStore,
  demonstrateSolidAdvantage,
} from "./solid-signals.js";

// Preact Signals 风格
export {
  PreactSignal,
  signal,
  computed,
  effect as preactEffect,
  useSignalState,
  useComputed,
  GlobalStore,
  createGlobalStore,
  demonstratePreactSignalsPerformance,
} from "./preact-signals.js";

// Angular Signals 风格
export {
  angularSignal,
  angularComputed,
  angularEffect,
  toSignal,
  toObservable,
  UserService,
  demonstrateAngularChangeDetection,
  demonstrateComponentPattern,
} from "./angular-signals.js";

// Svelte 5 Runes
export {
  $state,
  $derived,
  $effect,
  $inspect,
  demonstrateSvelte5Compilation,
  demonstrateSvelte5Advantages,
} from "./svelte-runes.js";

// 对比与选型
export {
  demonstrateMentalModel,
  demonstratePerformance,
  demonstrateCodeStyle,
  demonstrateEcosystem,
  selectHooksOrSignals,
  demonstrateHybridApproach,
  futureTrend,
} from "./signals-vs-hooks.js";

export {
  demonstrateValueVsStream,
  demonstratePullVsPush,
  signalToObservable,
  observableToSignal,
  demonstrateSelectionGuide,
  demonstrateAntiPatterns,
  demonstrateUnifiedReactiveLayer,
} from "./signals-vs-observable.js";
