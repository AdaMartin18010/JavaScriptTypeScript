/**
 * # alien-signals：跨框架通用 Signal 原语
 *
 * alien-signals 是由 Vue 团队（尤雨溪）开发的框架无关 Signal 库，
 * 被 Vue Vapor Mode、Nuxt、VitePress 等采用。
 *
 * 核心特点：
 * 1. 极简 API（signal / computed / effect）
 * 2. 高效调度（微任务批量更新）
 * 3. 无框架绑定（~1KB）
 * 4. TypeScript 原生支持
 */

import {
  Signal,
  createSignal as coreCreateSignal,
  createComputed,
  createEffect,
  batch,
} from "./core-signal.js";

// ============================================
// alien-signals 风格 API
// ============================================

/**
 * alien-signals 的 signal 函数。
 * 使用 .get() / .set() 访问，与 SolidJS 类似但命名更简洁。
 */
export function signal<T>(initialValue: T): {
  get: () => T;
  set: (value: T | ((prev: T) => T)) => void;
  peek: () => T;
} {
  const sig = coreCreateSignal(initialValue);

  return {
    get: () => sig.get(),
    set: (value) => {
      if (typeof value === "function") {
        const fn = value as (prev: T) => T;
        sig.set(fn(sig.peek()));
      } else {
        sig.set(value);
      }
    },
    peek: () => sig.peek(),
  };
}

/**
 * alien-signals 的 computed 函数。
 * 返回一个只读的 getter。
 */
export function computed<T>(fn: () => T): { get: () => T } {
  const comp = createComputed(fn);
  return { get: () => comp.get() };
}

/**
 * alien-signals 的 effect 函数。
 * 自动追踪依赖，支持清理函数。
 */
export function effect(fn: () => void | (() => void)): () => void {
  let cleanup: (() => void) | undefined;

  const unsubscribe = createEffect(() => {
    cleanup?.();
    const result = fn();
    if (typeof result === "function") {
      cleanup = result;
    }
  });

  return () => {
    cleanup?.();
    unsubscribe();
  };
}

// ============================================
// 跨框架使用示例
// ============================================

/**
 * alien-signals 作为跨框架状态层。
 * 同一套 Signal 可被 React、Vue、Solid 甚至 vanilla JS 共享。
 */
export function createSharedStore<T extends Record<string, any>>(
  initialState: T
) {
  const signals = new Map<string, ReturnType<typeof signal<any>>>();

  for (const [key, value] of Object.entries(initialState)) {
    signals.set(key, signal(value));
  }

  return {
    get<K extends keyof T>(key: K): T[K] {
      return signals.get(key as string)!.get();
    },
    set<K extends keyof T>(key: K, value: T[K]): void {
      signals.get(key as string)!.set(value);
    },
    update<K extends keyof T>(
      key: K,
      updater: (prev: T[K]) => T[K]
    ): void {
      signals.get(key as string)!.set(updater);
    },
    computed<K extends keyof T>(
      key: K,
      fn: (state: T) => T[K]
    ): { get: () => T[K] } {
      return computed(() => {
        const state = {} as T;
        signals.forEach((sig, k) => {
          (state as any)[k] = sig.get();
        });
        return fn(state);
      });
    },
    effect(fn: (state: T) => void): () => void {
      return effect(() => {
        const state = {} as T;
        signals.forEach((sig, k) => {
          (state as any)[k] = sig.get();
        });
        fn(state);
      });
    },
    batchUpdate(updates: Partial<T>): void {
      batch(() => {
        for (const [key, value] of Object.entries(updates)) {
          signals.get(key)?.set(value);
        }
      });
    },
  };
}

// ============================================
// 演示
// ============================================

export function demonstrateAlienSignals(): void {
  console.log("=== alien-signals 跨框架 Signal 原语 ===\n");

  const count = signal(0);
  const doubled = computed(() => count.get() * 2);

  effect(() => {
    console.log(`count = ${count.get()}, doubled = ${doubled.get()}`);
  });

  console.log("设置 count 为 1...");
  count.set(1);

  console.log("\n使用 batch 批量更新...");
  const store = createSharedStore({ a: 1, b: 2 });

  store.effect((state) => {
    console.log(`Store 状态: a=${state.a}, b=${state.b}`);
  });

  store.batchUpdate({ a: 10, b: 20 });

  console.log("\nalien-signals 优势:");
  console.log("  • ~1KB 体积，无框架绑定");
  console.log("  • 可作为任何 UI 框架的底层状态层");
  console.log("  • 被 Vue Vapor Mode、Nuxt 官方采用");
}
