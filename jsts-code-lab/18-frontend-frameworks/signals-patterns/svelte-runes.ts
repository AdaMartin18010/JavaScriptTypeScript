/**
 * # Svelte 5 Runes 实现与分析
 *
 * Svelte 5 是 Svelte 生态的里程碑版本。
 * 它用「显式 Runes」替代了 Svelte 1-4 的「编译器隐式响应式」，
 * 解决了企业级应用中最头疼的问题：响应式边界不可预测。
 *
 * Svelte 5 核心 Runes：
 * - $state：声明响应式状态
 * - $derived：声明派生计算
 * - $effect：声明副作用
 * - $props：声明组件 props（替代 export let）
 * - $bindable：声明双向绑定的 prop
 * - $inspect：调试工具（类似 console.log，但只在变化时输出）
 */

import {
  Signal,
  createSignal as coreCreateSignal,
  createComputed,
  createEffect,
} from "./core-signal";

// ============================================
// Svelte 5 Runes 核心实现
// ============================================

/**
 * $state：声明响应式状态。
 *
 * Svelte 5 之前（Svelte 1-4）：
 * ```svelte
 * <script>
 *   let count = 0; // 编译器自动将其变为响应式
 *   // 问题：什么时候是响应式的？什么时候不是？边界模糊
 * </script>
 * ```
 *
 * Svelte 5：
 * ```svelte
 * <script>
 *   let count = $state(0); // 显式声明：这是响应式的
 *   let normal = 0;        // 显式声明：这不是响应式的
 * </script>
 * ```
 */
export function $state<T>(initialValue: T): T {
  // 基本类型：包装为 Signal
  if (
    typeof initialValue === "number" ||
    typeof initialValue === "string" ||
    typeof initialValue === "boolean"
  ) {
    const signal = coreCreateSignal(initialValue);
    return new Proxy(
      { value: initialValue },
      {
        get() {
          return signal.get();
        },
        set(_target, _key, value) {
          signal.set(value);
          return true;
        },
      }
    ) as unknown as T;
  }

  // 对象/数组：深层响应式 Proxy
  if (typeof initialValue === "object" && initialValue !== null) {
    return createDeepReactive(initialValue);
  }

  return initialValue;
}

/**
 * 创建深层响应式 Proxy。
 * 对象和数组的每个属性都是响应式的。
 */
function createDeepReactive<T extends object>(obj: T): T {
  const signalMap = new Map<string | symbol, Signal<any>>();

  const getSignal = (key: string | symbol, initialValue: any) => {
    if (!signalMap.has(key)) {
      signalMap.set(key, coreCreateSignal(initialValue));
    }
    return signalMap.get(key)!;
  };

  return new Proxy(obj, {
    get(target, key) {
      const value = (target as any)[key];
      const signal = getSignal(key, value);

      // 嵌套对象也变为响应式
      if (typeof value === "object" && value !== null) {
        return createDeepReactive(value);
      }

      return signal.get();
    },
    set(target, key, value) {
      (target as any)[key] = value;
      const signal = getSignal(key, value);
      signal.set(value);
      return true;
    },
  });
}

/**
 * $derived：声明派生计算。
 *
 * ```svelte
 * <script>
 *   let count = $state(0);
 *   let doubled = $derived(count * 2); // 自动追踪 count 的依赖
 * </script>
 * ```
 */
export function $derived<T>(fn: () => T): T {
  const computed = createComputed(fn);
  // 返回一个 Proxy，读取时自动调用 computed.get()
  return new Proxy({} as T, {
    get(_target, key) {
      const value = computed.get();
      return (value as any)[key];
    },
  }) as T;
}

/**
 * $effect：声明副作用。
 *
 * ```svelte
 * <script>
 *   let count = $state(0);
 *   $effect(() => {
 *     console.log("Count changed:", count);
 *     // 自动追踪 count 的依赖
 *   });
 * </script>
 * ```
 */
export function $effect(fn: () => void | (() => void)): void {
  let cleanup: (() => void) | undefined;

  createEffect(() => {
    cleanup?.();
    const result = fn();
    if (typeof result === "function") {
      cleanup = result;
    }
  });
}

/**
 * $inspect：调试工具。
 * 只在值变化时输出日志，自动追踪所有读取的 Signal。
 */
export function $inspect<T>(value: T, label?: string): T {
  createEffect(() => {
    console.log(
      `[inspect${label ? ` ${label}` : ""}]`,
      typeof value === "object" ? JSON.stringify(value) : value
    );
  });
  return value;
}

// ============================================
// Svelte 5 的编译时优化
// ============================================

/**
 * Svelte 5 的核心优势：编译时响应式绑定。
 *
 * 与 SolidJS 类似，Svelte 在编译时将 $state/$derived/$effect
 * 转换为直接的 DOM 操作指令，而非运行时虚拟 DOM diff。
 *
 * 编译前（开发者编写）：
 * ```svelte
 * <script>
 *   let count = $state(0);
 * </script>
 * <button onclick={() => count++}>
 *   Count: {count}
 * </button>
 * ```
 *
 * 编译后（浏览器执行）：
 * ```js
 * // 伪代码：编译器生成的直接 DOM 操作
 * const count = createSignal(0);
 * const button = document.createElement('button');
 * const text = document.createTextNode('Count: ');
 * button.appendChild(text);
 * createEffect(() => {
 *   text.nodeValue = 'Count: ' + count.get();
 * });
 * button.onclick = () => count.set(count.get() + 1);
 * ```
 */

export function demonstrateSvelte5Compilation(): void {
  console.log("=== Svelte 5 编译时优化 ===\n");

  console.log("Svelte 5 编译策略:");
  console.log("  1. 编译阶段分析 $state/$derived/$effect 的依赖关系");
  console.log("  2. 生成细粒度的 DOM 更新代码（类似 SolidJS）");
  console.log("  3. 无虚拟 DOM，无 diff 算法");
  console.log("  4. 运行时仅保留 Signal 系统，体积极小");

  console.log("\n与其他框架的对比:");
  console.log("  React:    JSX → 虚拟 DOM → diff → DOM 更新");
  console.log("  Vue:      模板 → 虚拟 DOM → diff → DOM 更新");
  console.log("  SolidJS:  JSX → 编译时绑定 → 直接 DOM 更新");
  console.log("  Svelte 5: 模板 → 编译时绑定 → 直接 DOM 更新");
}

// ============================================
// Svelte 5 解决的核心问题
// ============================================

/**
 * Svelte 1-4 的「隐式响应式」问题：
 *
 * 问题 1：响应式边界模糊
 * ```svelte
 * <script>
 *   let count = 0; // 这是响应式的
 *   let doubled = count * 2; // 这是响应式的吗？不是！
 * </script>
 * ```
 * 在 Svelte 1-4 中，`doubled` 不会在 `count` 变化时更新。
 * 开发者必须使用 `$: doubled = count * 2`，这很容易遗漏。
 *
 * 问题 2：对象/数组的响应式陷阱
 * ```svelte
 * <script>
 *   let items = [{ id: 1 }];
 *   items.push({ id: 2 }); // 不触发更新！需要 items = items
 * </script>
 * ```
 *
 * Svelte 5 的解决方案：
 * - $state 显式声明 → 不再猜测边界
 * - 深层 Proxy → push/pop/splice 自动触发更新
 * - $derived 显式声明 → 派生状态清晰可见
 */

export function demonstrateSvelte5Advantages(): void {
  console.log("\n=== Svelte 5 解决的核心问题 ===\n");

  // Svelte 5 之前的陷阱
  console.log("Svelte 1-4 陷阱:");
  console.log("  let count = 0;");
  console.log("  let doubled = count * 2; // 不会自动更新！");
  console.log("  需要: $: doubled = count * 2; // 容易遗漏");

  // Svelte 5 的显式方案
  console.log("\nSvelte 5 方案:");
  const count = $state(0);
  const doubled = $derived((count as any) * 2);
  console.log("  let count = $state(0);      // 显式: 这是响应式的");
  console.log("  let doubled = $derived(count * 2); // 显式: 这是派生的");
  console.log("  边界清晰，不再猜测");
}

// ============================================
// Svelte 5 迁移策略
// ============================================

/**
 * 从 Svelte 1-4 迁移到 Svelte 5 的关键步骤：
 *
 * 1. 状态声明：
 *    - let x = y → let x = $state(y)
 *    - $: derived = ... → let derived = $derived(...)
 *
 * 2. Props 声明：
 *    - export let prop → let { prop } = $props()
 *
 * 3. 副作用：
 *    - $: { console.log(x) } → $effect(() => { console.log(x) })
 *
 * 4. 事件处理：
 *    - on:click → onclick
 *
 * 5. 双向绑定：
 *    - bind:value → bind:value（语法不变，底层改为 $bindable）
 */
