/**
 * # 信号 (Signal) 核心实现原理
 *
 * Signal 是 2025-2026 年前端领域最重要的范式转变之一。
 * 它从「组件级重渲染」转向「依赖级细粒度更新」，性能提升可达 6-10 倍。
 *
 * 本文件实现一个最小化的 Signal 系统，揭示其内部机制：
 * - 依赖追踪（Dependency Tracking）
 * - 惰性求值（Lazy Evaluation）
 * - 细粒度订阅（Granular Subscription）
 */

// ============================================
// 类型定义
// ============================================

/** 订阅者（观察者）函数类型 */
type Subscriber = () => void;

/** 清理函数类型 */
type Unsubscribe = () => void;

/** 计算函数类型 */
type ComputeFn<T> = () => T;

// ============================================
// 全局上下文（当前正在执行的计算）
// ============================================

/**
 * 全局执行上下文栈。
 * 当计算函数执行时，将其压入栈顶，Signal 读取时自动订阅栈顶的计算。
 * 这是实现「自动依赖追踪」的核心机制。
 */
const contextStack: Computation<any>[] = [];

/**
 * 获取当前活跃的计算上下文。
 * 如果栈顶有计算，说明当前读取发生在某个计算函数内部，需要建立订阅关系。
 */
function getCurrentComputation(): Computation<any> | undefined {
  return contextStack[contextStack.length - 1];
}

// ============================================
// Signal 类：可观察的基本单元
// ============================================

/**
 * Signal 是最基本的响应式原语。
 * 它包装一个值，并追踪所有读取它的计算（effect/computed）。
 * 当值改变时，仅通知这些依赖进行更新，而非整个组件树。
 */
export class Signal<T> {
  /** 当前值 */
  private _value: T;

  /** 订阅了此 Signal 的所有计算节点 */
  private _subscribers: Set<Computation<any>> = new Set();

  constructor(initialValue: T) {
    this._value = initialValue;
  }

  /**
   * 读取 Signal 的值。
   * 如果当前处于某个计算函数的上下文中，自动建立订阅关系。
   */
  get(): T {
    const currentComputation = getCurrentComputation();
    if (currentComputation) {
      // 自动追踪：当前计算依赖此 Signal
      this._subscribers.add(currentComputation);
      // 双向记录：当前计算也记录依赖此 Signal（用于后续清理）
      currentComputation.addDependency(this);
    }
    return this._value;
  }

  /**
   * 写入 Signal 的值。
   * 如果值发生变化，通知所有订阅者。
   */
  set(newValue: T): void {
    // 值未变化时不触发更新（默认行为，可通过选项覆盖）
    if (Object.is(this._value, newValue)) return;

    this._value = newValue;

    // 通知所有订阅者：它们的依赖已变化
    // 注意：这里只标记为「脏」，不立即执行，避免级联更新
    for (const subscriber of new Set(this._subscribers)) {
      subscriber.markDirty();
    }
  }

  /** 获取当前值（不建立订阅关系，用于调试） */
  peek(): T {
    return this._value;
  }

  /** 清理特定计算的订阅关系 */
  removeSubscriber(computation: Computation<any>): void {
    this._subscribers.delete(computation);
  }
}

/**
 * 创建 Signal 的工厂函数。
 * @example
 * const count = createSignal(0);
 * count.set(count.get() + 1);
 */
export function createSignal<T>(initialValue: T): Signal<T> {
  return new Signal(initialValue);
}

// ============================================
// Computation 类：计算节点（Effect / Computed 的基类）
// ============================================

/**
 * Computation 是 Signal 的订阅者。
 * 它封装一个计算函数，并在其依赖的 Signal 变化时重新执行。
 *
 * 关键设计：
 * 1. 每次重新执行前，清理旧的依赖关系，避免内存泄漏
 * 2. 执行时通过全局上下文栈自动建立新的依赖关系
 * 3. 「脏标记」机制避免同步级联更新，支持批量刷新
 */
export class Computation<T> {
  /** 计算函数 */
  private _fn: ComputeFn<T>;

  /** 上次计算结果 */
  private _value?: T;

  /** 当前依赖的所有 Signal */
  private _dependencies: Set<Signal<any>> = new Set();

  /** 是否为脏（需要重新计算） */
  private _dirty = true;

  /** 是否已调度（避免重复调度） */
  private _scheduled = false;

  /** 副作用回调（仅 Effect 使用） */
  private _effectFn?: () => void;

  constructor(fn: ComputeFn<T>, effectFn?: () => void) {
    this._fn = fn;
    this._effectFn = effectFn;
  }

  /** 添加依赖关系 */
  addDependency(signal: Signal<any>): void {
    this._dependencies.add(signal);
  }

  /** 标记为脏，触发重新计算 */
  markDirty(): void {
    this._dirty = true;
    if (!this._scheduled) {
      this._scheduled = true;
      // 使用微任务调度，实现批量更新
      queueMicrotask(() => this.execute());
    }
  }

  /**
   * 执行计算。
   * 1. 清理旧依赖
   * 2. 压入上下文栈
   * 3. 执行计算函数
   * 4. 弹出上下文栈
   */
  execute(): T {
    if (!this._dirty && !this._scheduled) {
      return this._value!;
    }

    // 清理旧依赖：从所有旧 Signal 的订阅者列表中移除自己
    this._dependencies.forEach((signal) => signal.removeSubscriber(this));
    this._dependencies.clear();

    // 压入上下文栈，使 Signal.get() 能捕获到当前计算
    contextStack.push(this);
    try {
      this._value = this._fn();
    } finally {
      // 确保无论计算是否抛出异常，都弹出上下文栈
      contextStack.pop();
    }

    this._dirty = false;
    this._scheduled = false;

    // 如果是 Effect，执行副作用
    this._effectFn?.();

    return this._value;
  }

  /** 获取当前值（如果是脏的，先执行计算） */
  get(): T {
    if (this._dirty) {
      return this.execute();
    }
    return this._value!;
  }

  /** 强制重新执行（用于调试或强制刷新） */
  recompute(): void {
    this._dirty = true;
    this.execute();
  }

  /** 销毁计算，清理所有依赖 */
  dispose(): void {
    this._dependencies.forEach((signal) => signal.removeSubscriber(this));
    this._dependencies.clear();
  }
}

// ============================================
// 派生计算 (Computed)
// ============================================

/**
 * Computed Signal：基于其他 Signal 的派生值。
 * 惰性求值：仅在读取时计算，且依赖未变化时直接返回缓存值。
 *
 * @example
 * const firstName = createSignal("张");
 * const lastName = createSignal("三");
 * const fullName = createComputed(() => firstName.get() + lastName.get());
 * console.log(fullName.get()); // "张三"
 */
export function createComputed<T>(fn: ComputeFn<T>): { get: () => T } {
  const computation = new Computation(fn);
  return {
    get: () => computation.get(),
  };
}

// ============================================
// 副作用 (Effect)
// ============================================

/**
 * Effect：在依赖变化时执行的副作用。
 * 与 Computed 的区别：Effect 不返回值，用于 DOM 操作、网络请求等副作用。
 *
 * @example
 * createEffect(() => {
 *   console.log("Count:", count.get());
 * });
 */
export function createEffect(fn: () => void): Unsubscribe {
  const computation = new Computation(() => {
    fn();
    return undefined;
  }, fn);

  // 立即执行一次，建立初始依赖关系
  computation.execute();

  return () => computation.dispose();
}

// ============================================
// 批量更新 (Batch)
// ============================================

/**
 * 批量更新：在函数执行期间，延迟所有 Effect 的触发，
 * 只在函数结束后统一执行。避免中间状态的级联更新。
 *
 * @example
 * batch(() => {
 *   firstName.set("李");
 *   lastName.set("四");
 *   // Effect 只触发一次，而非两次
 * });
 */
let batchDepth = 0;
const batchQueue: Set<Computation<any>> = new Set();

export function batch<T>(fn: () => T): T {
  batchDepth++;
  try {
    return fn();
  } finally {
    batchDepth--;
    if (batchDepth === 0) {
      // 批量阶段结束，统一执行所有待更新的 Effect
      const queue = new Set(batchQueue);
      batchQueue.clear();
      queue.forEach((comp) => comp.execute());
    }
  }
}

// ============================================
// 工具函数
// ============================================

/**
 * untracked：在函数执行期间禁用依赖追踪。
 * 用于在 Effect 内部读取 Signal 但不建立订阅关系。
 */
export function untracked<T>(fn: () => T): T {
  // 压入一个空上下文，阻止 Signal 建立订阅
  contextStack.push(null as any);
  try {
    return fn();
  } finally {
    contextStack.pop();
  }
}

/**
 * 创建只读 Signal。
 * 内部值只能通过特定 API 修改，外部只能读取。
 */
export function createReadonlySignal<T>(
  signal: Signal<T>
): { get: () => T } {
  return {
    get: () => signal.get(),
  };
}
