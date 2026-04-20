/**
 * # Preact Signals 实现与分析
 *
 * Preact Signals 是 Signals 范式在 React 生态中的「补丁」方案。
 * 它允许在 React 组件中使用 Signals，获得接近 SolidJS 的性能，
 * 同时保持与现有 React 代码的兼容性。
 *
 * 核心特点：
 * 1. 与 React 18+ Concurrent Features 兼容
 * 2. 通过 @preact/signals-react 包在 React 中使用
 * 3. Signals 变化时绕过 React 的渲染调度，直接更新 DOM
 * 4. 支持在 Hooks 之外使用（打破 Hooks 规则限制）
 */

import {
  Signal,
  createSignal as coreCreateSignal,
  createComputed,
  createEffect,
  Computation,
} from "./core-signal";

// ============================================
// Preact Signals 核心 API
// ============================================

/**
 * Preact Signals 使用 .value 属性访问，而非 .get()/.set()。
 * 这种设计更简洁，但在 TypeScript 中需要额外处理。
 */
export class PreactSignal<T> {
  private _signal: Signal<T>;

  constructor(initialValue: T) {
    this._signal = coreCreateSignal(initialValue);
  }

  /** 读取/写入值（通过 .value 属性） */
  get value(): T {
    return this._signal.get();
  }

  set value(newValue: T) {
    this._signal.set(newValue);
  }

  /** 读取值但不追踪依赖 */
  peek(): T {
    return this._signal.peek();
  }

  /** 转换为只读 Signal */
  get readonly(): { value: T } {
    return {
      get value() {
        return this._signal.get();
      },
    } as { value: T };
  }
}

export function signal<T>(initialValue: T): PreactSignal<T> {
  return new PreactSignal(initialValue);
}

/**
 * Preact 风格的 computed：返回一个自动计算的 Signal。
 */
export function computed<T>(fn: () => T): { value: T } {
  const comp = createComputed(fn);
  return {
    get value() {
      return comp.get();
    },
  };
}

/**
 * Preact 风格的 effect。
 * 与标准 createEffect 的区别：支持清理函数（cleanup）。
 */
export function effect(fn: () => void | (() => void)): () => void {
  let cleanup: (() => void) | undefined;

  const computation = new Computation(() => {
    // 执行前清理上一次的副作用
    cleanup?.();
    const result = fn();
    if (typeof result === "function") {
      cleanup = result;
    }
    return undefined;
  });

  computation.execute();

  return () => {
    cleanup?.();
    computation.dispose();
  };
}

// ============================================
// React 集成层（@preact/signals-react 模拟）
// ============================================

/**
 * 在 React 组件中使用 Signal 的 Hook。
 * 与 useState 的区别：
 * - useSignalState：Signal 变化时组件不重新渲染，直接更新 DOM
 * - useState：状态变化时整个组件重新渲染
 *
 * @example
 * function Counter() {
 *   const count = useSignalState(0);
 *   return <button onClick={() => count.value++}>{count.value}</button>;
 *   // 注意：点击按钮时，Counter 组件函数不会重新执行！
 * }
 */
export function useSignalState<T>(initialValue: T): PreactSignal<T> {
  // 在真实 @preact/signals-react 中，使用 useRef 保持 Signal 实例稳定
  // 这里简化实现：直接返回 Signal（不依赖 React 的渲染机制）
  const [sig] = [signal(initialValue)];
  return sig;
}

/**
 * 在 React 中使用 computed Signal 的 Hook。
 */
export function useComputed<T>(fn: () => T): { value: T } {
  return computed(fn);
}

// ============================================
// Preact Signals 与 React Context 性能对比
// ============================================

/**
 * 性能对比数据（基于社区 Benchmark）：
 *
 * | 场景 | React Context | Preact Signals | 提升倍数 |
 * |------|--------------|----------------|---------|
 * | 1000 个计数器 | 1x | 6-10x | 6-10x |
 * | 列表筛选 | 1x | 4-8x | 4-8x |
 * | 表单输入 | 1x | 8-12x | 8-12x |
 *
 * 原因分析：
 * 1. React Context：任何状态变化 → Provider 下所有 Consumer 重新渲染
 * 2. Preact Signals：Signal 变化 → 仅订阅该 Signal 的 DOM 节点更新
 */

export function demonstratePreactSignalsPerformance(): void {
  console.log("=== Preact Signals vs React Context 性能对比 ===\n");

  // 模拟 1000 个独立计数器
  const counterCount = 1000;

  // React Context 模式：所有计数器共享一个 Context
  // 任何一个计数器变化，所有 Consumer 重新渲染
  console.log(`React Context 模式 (${counterCount} 个计数器):`);
  console.log(`  计数器 #1 变化 → 触发 ${counterCount} 个组件重渲染`);

  // Preact Signals 模式：每个计数器是独立的 Signal
  // 只有变化的计数器对应的 DOM 节点更新
  console.log(`\nPreact Signals 模式 (${counterCount} 个计数器):`);
  console.log(`  计数器 #1 变化 → 只更新计数器 #1 的 DOM 节点`);
  console.log(`  其他 999 个计数器完全不受影响`);

  console.log("\n性能提升来源：");
  console.log("  1. 避免虚拟 DOM diff（直接操作真实 DOM）");
  console.log("  2. 避免组件函数重新执行");
  console.log("  3. 避免 React 的调度开销（setState 队列、优先级计算）");
}

// ============================================
// Preact Signals 的实际应用模式
// ============================================

/**
 * 全局状态管理模式。
 * 使用 Signals 替代 Redux/Zustand，获得更好的性能和更简洁的 API。
 */
export class GlobalStore<T extends Record<string, any>> {
  private _signals: Map<string, PreactSignal<any>> = new Map();

  constructor(initialState: T) {
    for (const [key, value] of Object.entries(initialState)) {
      this._signals.set(key, signal(value));
    }
  }

  /** 获取状态（自动追踪依赖） */
  get<K extends keyof T>(key: K): T[K] {
    return this._signals.get(key as string)!.value;
  }

  /** 设置状态 */
  set<K extends keyof T>(key: K, value: T[K]): void {
    this._signals.set(key as string, signal(value));
  }

  /** 批量更新 */
  batchUpdate(updates: Partial<T>): void {
    for (const [key, value] of Object.entries(updates)) {
      const sig = this._signals.get(key);
      if (sig) {
        sig.value = value;
      }
    }
  }

  /** 订阅特定键的变化 */
  subscribe<K extends keyof T>(key: K, callback: (value: T[K]) => void): () => void {
    const sig = this._signals.get(key as string)!;
    return effect(() => {
      callback(sig.value);
    });
  }
}

/** 创建全局 Store 的工厂函数 */
export function createGlobalStore<T extends Record<string, any>>(
  initialState: T
): GlobalStore<T> {
  return new GlobalStore(initialState);
}

// ============================================
// Signals 在 React 中的最佳实践
// ============================================

/**
 * 最佳实践 1：将高频变化的状态提取为 Signal
 *
 * 反例：
 * function MouseTracker() {
 *   const [pos, setPos] = useState({ x: 0, y: 0 }); // 每次 mousemove 触发重渲染
 *   ...
 * }
 *
 * 正例：
 * function MouseTracker() {
 *   const pos = useSignalState({ x: 0, y: 0 }); // 直接更新 DOM，不重渲染组件
 *   useEffect(() => {
 *     window.addEventListener('mousemove', (e) => {
 *       pos.value = { x: e.clientX, y: e.clientY };
 *     });
 *   }, []);
 *   ...
 * }
 */

/**
 * 最佳实践 2：表单状态使用 Signals
 *
 * 表单字段变化极其频繁，使用 Signals 可避免整个表单组件的重渲染。
 */

/**
 * 最佳实践 3：动画状态使用 Signals
 *
 * 动画每帧更新（60fps），使用 Signals 可在 16ms 内完成更新而不触发 React 渲染。
 */

/**
 * 最佳实践 4：大型列表的筛选/排序状态使用 Signals
 *
 * 列表筛选通常涉及大量数据变换，使用 computed Signal 可自动缓存结果。
 */
