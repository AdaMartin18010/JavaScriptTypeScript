/**
 * # Angular Signals 实现与分析
 *
 * Angular v16+ 引入原生 Signals，标志着企业级框架正式拥抱细粒度响应式。
 * 这是 Signals 从「小众框架特性」走向「主流标准」的关键里程碑。
 *
 * Angular Signals 的设计特点：
 * 1. 与 RxJS 共存（非替代关系）：Signals 管同步状态，RxJS 管异步流
 * 2. 与变更检测集成：Signal 变化自动触发 Angular 的变更检测
 * 3. 支持 computed 和 effect，API 设计保守但稳定
 * 4. 与依赖注入系统深度集成
 */

import {
  Signal,
  createSignal as coreCreateSignal,
  createComputed,
  createEffect,
  Computation,
} from "./core-signal";

// ============================================
// Angular Signals 核心 API
// ============================================

/**
 * Angular 风格的 Signal 创建函数。
 * 使用函数调用 `count()` 读取值，而非 `.get()` 或 `.value`。
 */
export function angularSignal<T>(initialValue: T): () => T {
  const signal = coreCreateSignal(initialValue);
  const getter = () => signal.get();
  // 附加 setter 到函数对象（Angular 的巧妙设计）
  (getter as any).set = (value: T) => signal.set(value);
  (getter as any).update = (fn: (value: T) => T) => signal.set(fn(signal.peek()));
  (getter as any).asReadonly = () => () => signal.get();
  return getter as () => T;
}

/**
 * Angular 风格的 computed。
 * 返回一个只读的计算 Signal。
 */
export function angularComputed<T>(fn: () => T): () => T {
  const comp = createComputed(fn);
  return () => comp.get();
}

/**
 * Angular 风格的 effect。
 * 特点：
 * - 必须在注入上下文（组件/服务）中创建
 * - 自动清理（组件销毁时）
 * - 支持 allowSignalWrites 选项（在 effect 中修改 Signal）
 */
export function angularEffect(
  fn: () => void,
  options?: { allowSignalWrites?: boolean }
): { destroy: () => void } {
  const computation = new Computation(() => {
    fn();
    return undefined;
  });

  computation.execute();

  return {
    destroy: () => computation.dispose(),
  };
}

// ============================================
// Angular 与 RxJS 的互操作
// ============================================

/**
 * Angular 选择「Signals + RxJS 共存」而非「Signals 替代 RxJS」的策略。
 *
 * 原因：
 * 1. RxJS 在企业级异步处理中不可替代（HTTP 请求、WebSocket、事件流）
 * 2. 大量现有 Angular 项目深度使用 RxJS
 * 3. Signals 和 RxJS 解决的问题域不同：
 *    - Signals：同步、细粒度、组件级状态
 *    - RxJS：异步、流式、跨组件/跨服务通信
 *
 * 本文件模拟 toSignal / toObservable 互操作函数。
 */

/**
 * 将 Observable 转换为 Signal。
 * 订阅 Observable，将其最新值同步到 Signal。
 *
 * @example
 * const user$ = http.get('/api/user'); // Observable
 * const user = toSignal(user$); // Signal<User | undefined>
 * // 在模板中：{{ user()?.name }}
 */
export function toSignal<T>(
  observable: { subscribe: (observer: { next: (value: T) => void; error: (err: any) => void }) => { unsubscribe: () => void } },
  options?: { initialValue?: T }
): () => T | undefined {
  const signal = coreCreateSignal<T | undefined>(options?.initialValue);

  const subscription = observable.subscribe({
    next: (value) => signal.set(value),
    error: (err) => console.error("toSignal error:", err),
  });

  // 返回 getter 函数，附加 unsubscribe 方法
  const getter = () => signal.get();
  (getter as any).unsubscribe = () => subscription.unsubscribe();
  return getter;
}

/**
 * 将 Signal 转换为 Observable。
 * 监听 Signal 变化，通过 Observable 流输出。
 *
 * @example
 * const count = signal(0);
 * const count$ = toObservable(count);
 * count$.subscribe(console.log); // 输出: 0, 1, 2, ...
 */
export function toObservable<T>(
  signalGetter: () => T
): { subscribe: (observer: (value: T) => void) => () => void } {
  return {
    subscribe: (observer: (value: T) => void) => {
      // 创建 Effect 监听 Signal 变化
      const computation = new Computation(() => {
        observer(signalGetter());
        return undefined;
      });
      computation.execute();

      return () => computation.dispose();
    },
  };
}

// ============================================
// Angular Signals 与变更检测
// ============================================

/**
 * Angular 的变更检测机制（Zone.js / Signals 混合模式）：
 *
 * v16 之前：纯 Zone.js
 * - 任何异步事件（点击、定时器、HTTP 响应）→ Zone.js 捕获 → 全局变更检测
 * - 问题：大型应用中变更检测开销大
 *
 * v16+：Zone.js + Signals 混合
 * - Signal 变化 → 自动标记相关组件为「脏」→ 精准变更检测
 * - 非 Signal 状态 → 仍由 Zone.js 处理
 * - v18 未来方向：可选 Zoneless（完全基于 Signals 的变更检测）
 */

export function demonstrateAngularChangeDetection(): void {
  console.log("=== Angular Signals 变更检测机制 ===\n");

  console.log("传统 Zone.js 模式:");
  console.log("  任何点击 → Zone.js 通知 → 检查整个组件树");
  console.log("  时间复杂度: O(组件树大小)");

  console.log("\nSignals + Zone.js 混合模式 (v16+):");
  console.log("  Signal 变化 → 标记直接消费者为脏 → 只检查相关分支");
  console.log("  时间复杂度: O(受影响组件数)");

  console.log("\nZoneless 模式 (v18+ 实验性):");
  console.log("  完全依赖 Signals 驱动变更检测");
  console.log("  无需 Zone.js，启动时间减少 10-15%");
}

// ============================================
// Angular Signals 在企业级应用中的模式
// ============================================

/**
 * 服务层状态管理。
 * Angular 服务中直接使用 Signals 替代 BehaviorSubject。
 */
export class UserService {
  // 替代 BehaviorSubject
  private _users = angularSignal<Array<{ id: number; name: string }>>([]);
  private _loading = angularSignal(false);
  private _error = angularSignal<string | null>(null);

  // 只读暴露
  users = this._users.asReadonly();
  loading = this._loading.asReadonly();
  error = this._error.asReadonly();

  // 派生状态
  userCount = angularComputed(() => this._users().length);
  hasUsers = angularComputed(() => this._users().length > 0);

  async loadUsers() {
    this._loading.set(true);
    this._error.set(null);
    try {
      // 模拟 API 请求
      const users = await Promise.resolve([
        { id: 1, name: "张三" },
        { id: 2, name: "李四" },
      ]);
      this._users.set(users);
    } catch (err) {
      this._error.set(err instanceof Error ? err.message : "未知错误");
    } finally {
      this._loading.set(false);
    }
  }

  addUser(name: string) {
    this._users.update((users) => [
      ...users,
      { id: users.length + 1, name },
    ]);
  }
}

/**
 * 组件中使用 Signals 的模式。
 */
export function demonstrateComponentPattern(): void {
  console.log("=== Angular 组件中的 Signals 模式 ===\n");

  // 组件状态
  const query = angularSignal("");
  const page = angularSignal(1);

  // 派生计算
  const searchParams = angularComputed(() => ({
    q: query(),
    page: page(),
  }));

  // Effect：监听查询参数变化，自动发起请求
  const effectRef = angularEffect(() => {
    const params = searchParams();
    console.log(`发起搜索请求: q=${params.q}, page=${params.page}`);
  });

  // 模拟用户交互
  console.log("用户输入搜索词...");
  (query as any).set("Angular");

  console.log("\n用户翻页...");
  (page as any).set(2);

  // 组件销毁时清理 Effect
  effectRef.destroy();
}
