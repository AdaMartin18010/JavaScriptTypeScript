/**
 * # Vue 3.5+ Vapor Mode 信号风格实现
 *
 * Vue 3.5 引入 Vapor Mode，将模板编译为直接 DOM 操作，
 * 保留 Vue 的响应式系统（ref/reactive/computed），但消除虚拟 DOM。
 *
 * 本文件模拟 Vue Vapor Mode 的响应式风格：
 * - ref()：基本类型响应式
 * - reactive()：对象深层响应式
 * - computed()：派生计算
 * - watch() / watchEffect()：副作用监听
 */

import {
  Signal,
  createSignal as coreCreateSignal,
  createComputed,
  createEffect,
  Computation,
} from "./core-signal.js";

// ============================================
// Vue 风格 API
// ============================================

/**
 * Vue 风格的 ref：包装基本类型为响应式对象。
 *
 * @example
 * const count = ref(0);
 * console.log(count.value); // 0
 * count.value++;            // Signal 自动通知
 */
export function ref<T>(initialValue: T): { value: T } {
  const signal = coreCreateSignal(initialValue);

  return {
    get value() {
      return signal.get();
    },
    set value(newValue: T) {
      signal.set(newValue);
    },
  };
}

/**
 * Vue 风格的 computed：返回只读的 ref。
 */
export function vueComputed<T>(getter: () => T): { readonly value: T } {
  const comp = createComputed(getter);
  return {
    get value() {
      return comp.get();
    },
  };
}

/**
 * Vue 风格的 watchEffect：立即执行并追踪依赖。
 * 与 createEffect 类似，但支持清理函数。
 */
export function watchEffect(
  fn: (onCleanup: (cleanupFn: () => void) => void) => void
): () => void {
  let cleanup: (() => void) | undefined;

  const wrappedFn = () => {
    cleanup?.();
    cleanup = undefined;
    fn((cb) => {
      cleanup = cb;
    });
  };

  const computation = new Computation(wrappedFn);
  computation.execute();

  return () => {
    cleanup?.();
    computation.dispose();
  };
}

/**
 * Vue 风格的 watch：监听特定数据源，变化时执行回调。
 */
export function watch<T>(
  source: () => T,
  callback: (newValue: T, oldValue: T | undefined) => void,
  options?: { immediate?: boolean }
): () => void {
  let oldValue: T | undefined;

  const computation = new Computation(() => {
    const newValue = source();
    if (oldValue !== undefined || options?.immediate) {
      callback(newValue, oldValue);
    }
    oldValue = newValue;
    return newValue;
  });

  computation.execute();

  return () => computation.dispose();
}

// ============================================
// reactive：深层响应式对象
// ============================================

/**
 * Vue 风格的 reactive：将对象转为深层响应式 Proxy。
 * 与 ref 的区别：reactive 只接受对象，属性访问自动追踪。
 */
export function reactive<T extends object>(target: T): T {
  const signalMap = new Map<string | symbol, Signal<any>>();

  const getSignal = (key: string | symbol, initialValue: any) => {
    if (!signalMap.has(key)) {
      signalMap.set(key, coreCreateSignal(initialValue));
    }
    return signalMap.get(key)!;
  };

  return new Proxy(target, {
    get(obj, key) {
      const value = (obj as any)[key];
      if (typeof value === "object" && value !== null) {
        return reactive(value);
      }
      const signal = getSignal(key, value);
      return signal.get();
    },
    set(obj, key, value) {
      (obj as any)[key] = value;
      const signal = getSignal(key, value);
      signal.set(value);
      return true;
    },
  });
}

// ============================================
// Vapor Mode 特性演示
// ============================================

export function demonstrateVueVaporMode(): void {
  console.log("=== Vue 3.5+ Vapor Mode 响应式演示 ===\n");

  // ref 风格
  const count = ref(0);
  const doubled = vueComputed(() => count.value * 2);

  watchEffect(() => {
    console.log(`[watchEffect] count = ${count.value}, doubled = ${doubled.value}`);
  });

  console.log("修改 count.value = 1...");
  count.value = 1;

  // reactive 风格
  console.log("\n--- reactive 对象 ---");
  const state = reactive({ user: { name: "张三", age: 25 } });

  watch(
    () => state.user.name,
    (newVal, oldVal) => {
      console.log(`[watch] name 变化: ${oldVal} → ${newVal}`);
    }
  );

  console.log("修改 state.user.name = '李四'...");
  state.user.name = "李四";

  console.log("\nVapor Mode 优势:");
  console.log("  • 编译为直接 DOM 操作，无虚拟 DOM diff");
  console.log("  • 保留 Vue 的响应式心智模型");
  console.log("  • 基线包体积 <10KB");
  console.log("  • 性能接近 SolidJS");
}
