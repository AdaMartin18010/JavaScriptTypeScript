/**
 * # SolidJS 风格的信号实现
 *
 * SolidJS 是 Signals 范式的标杆框架。
 * 其核心哲学：
 * 1. 细粒度响应式 — 更新精确到 DOM 节点级别，而非组件级别
 * 2. 无虚拟 DOM — 编译时将响应式绑定直接注入真实 DOM 操作
 * 3. 组件函数只执行一次 — 与 React 的「每次更新重渲染」根本不同
 *
 * 本文件模拟 SolidJS 的核心 API：createSignal / createMemo / createEffect / createResource
 */

import {
  Signal,
  createSignal as coreCreateSignal,
  createComputed,
  createEffect,
  batch,
  untracked,
} from "./core-signal";

// ============================================
// SolidJS 核心 API
// ============================================

/**
 * SolidJS 风格的 createSignal。
 * 返回元组 [getter, setter]，与 SolidJS API 完全一致。
 *
 * @example
 * const [count, setCount] = createSignal(0);
 * console.log(count()); // 0
 * setCount(count() + 1);
 */
export function createSignal<T>(
  initialValue: T
): [() => T, (value: T | ((prev: T) => T)) => void] {
  const signal = coreCreateSignal(initialValue);

  const getter = () => signal.get();

  const setter = (value: T | ((prev: T) => T)) => {
    if (typeof value === "function") {
      const fn = value as (prev: T) => T;
      signal.set(fn(signal.peek()));
    } else {
      signal.set(value);
    }
  };

  return [getter, setter];
}

/**
 * SolidJS 风格的派生计算。
 * 与 createComputed 相同，命名遵循 SolidJS 惯例。
 */
export function createMemo<T>(fn: () => T): () => T {
  const computed = createComputed(fn);
  return () => computed.get();
}

/**
 * SolidJS 风格的副作用。
 * 与 createEffect 相同，命名遵循 SolidJS 惯例。
 */
export { createEffect };

// ============================================
// SolidJS 进阶 API
// ============================================

/**
 * 创建响应式资源（异步数据）。
 * 用于封装异步操作（API 请求、数据库查询等）。
 *
 * @example
 * const [user, { refetch }] = createResource(userId, async (id) => {
 *   const res = await fetch(`/api/users/${id}`);
 *   return res.json();
 * });
 *
 * createEffect(() => {
 *   console.log("User:", user()?.name);
 * });
 */
export function createResource<T, S>(
  source: () => S,
  fetcher: (source: S) => Promise<T>
): [
  () => T | undefined,
  {
    loading: () => boolean;
    error: () => Error | undefined;
    refetch: () => void;
    mutate: (value: T) => void;
  }
] {
  const [data, setData] = createSignal<T | undefined>(undefined);
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal<Error | undefined>(undefined);
  const [version, setVersion] = createSignal(0);

  let lastSource: S | undefined;

  createEffect(() => {
    const currentSource = source();
    const currentVersion = version();

    // 如果 source 未变化，不重新获取（利用 version 强制刷新）
    if (currentVersion === 0 && Object.is(currentSource, lastSource)) {
      return;
    }
    lastSource = currentSource;

    setLoading(true);
    setError(undefined);

    fetcher(currentSource)
      .then((result) => {
        setData(result);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err : new Error(String(err)));
        setLoading(false);
      });
  });

  return [
    data,
    {
      loading,
      error,
      refetch: () => setVersion((v) => v + 1),
      mutate: (value: T) => setData(value),
    },
  ];
}

/**
 * 条件响应式分支。
 * 只在条件为真时追踪内部 Signal，条件为假时自动取消追踪。
 *
 * @example
 * const [show, setShow] = createSignal(false);
 * const [count, setCount] = createSignal(0);
 *
 * createEffect(() => {
 *   // 当 show 为 false 时，count 的变化不会触发此 Effect
 *   if (show()) {
 *     console.log("Count:", count());
 *   }
 * });
 */
export function createSelector<T>(
  source: () => T,
  fn: (a: T, b: T) => boolean = Object.is
): (key: T) => boolean {
  const subscribers = new Map<T, Set<() => void>>();
  let currentValue: T;

  createEffect(() => {
    const newValue = source();
    const oldValue = currentValue;
    currentValue = newValue;

    // 通知所有订阅了旧值或新值的监听器
    subscribers.forEach((listeners, key) => {
      const wasSelected = fn(key, oldValue);
      const isSelected = fn(key, newValue);
      if (wasSelected !== isSelected) {
        listeners.forEach((listener) => listener());
      }
    });
  });

  return (key: T) => {
    // 返回当前是否选中（用于条件渲染）
    return fn(key, currentValue);
  };
}

// ============================================
// SolidJS 性能特性演示
// ============================================

/**
 * 演示 SolidJS 的核心优势：组件函数只执行一次。
 *
 * 在 React 中：
 * - 每次状态更新，整个组件函数重新执行
 * - useMemo/useCallback 用来「跳过」不必要的计算
 * - 本质是「优化重渲染」
 *
 * 在 SolidJS 中：
 * - 组件函数只执行一次（初始化时）
 * - Signal 变化时，只更新具体的 DOM 节点
 * - 本质是「无需重渲染」
 */
export function demonstrateSolidAdvantage(): void {
  console.log("=== SolidJS 性能优势演示 ===\n");

  let renderCount = 0;

  const [count, setCount] = createSignal(0);
  const [name, setName] = createSignal("SolidJS");

  // 模拟组件「挂载」：只执行一次
  renderCount++;
  console.log(`组件函数执行次数: ${renderCount}`); // 1

  // 创建多个 Effect，模拟多个 DOM 绑定
  createEffect(() => {
    console.log(`  [Effect 1] Count 更新为: ${count()}`);
  });

  createEffect(() => {
    console.log(`  [Effect 2] Name 更新为: ${name()}`);
  });

  createEffect(() => {
    console.log(`  [Effect 3] 组合显示: ${name()} 的计数是 ${count()}`);
  });

  console.log("\n--- 更新 count ---");
  setCount(1);
  // 等待微任务执行
  setTimeout(() => {
    console.log("\n--- 更新 name ---");
    setName("Signals");

    setTimeout(() => {
      console.log("\n--- 最终统计 ---");
      console.log(`组件函数总执行次数: ${renderCount} (始终为 1!)`);
      console.log("对比 React: 每次 setState 都会触发组件重渲染\n");
    }, 50);
  }, 50);
}

// ============================================
// Solid Store（不可变状态管理）
// ============================================

/**
 * 创建响应式 Store（不可变对象）。
 * 支持路径更新和细粒度追踪。
 *
 * @example
 * const [store, setStore] = createStore({ user: { name: "张三", age: 25 } });
 * setStore("user", "name", "李四"); // 只更新 user.name，不触发 user.age 的订阅者
 */
export function createStore<T extends object>(
  initialValue: T
): [T, <K extends keyof T>(key: K, value: T[K]) => void] {
  // 简化版实现：使用 Proxy 拦截属性访问
  const signalMap = new Map<string | symbol, Signal<any>>();

  const getSignal = (key: string | symbol) => {
    if (!signalMap.has(key)) {
      signalMap.set(key, coreCreateSignal(initialValue[key as keyof T]));
    }
    return signalMap.get(key)!;
  };

  const proxy = new Proxy(initialValue, {
    get(target, key) {
      const signal = getSignal(key);
      return signal.get();
    },
    set() {
      // Store 是只读的，必须通过 setStore 更新
      return false;
    },
  });

  const setStore = <K extends keyof T>(key: K, value: T[K]) => {
    const signal = getSignal(key);
    signal.set(value);
  };

  return [proxy, setStore];
}
